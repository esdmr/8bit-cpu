import { BUS } from './bus.js';
import { RW } from './components/base.js';

const onesNot = (base: number) => base ^ 255;
const readBit = (base: number, mask: number) => base & mask;
const sign = (base: number) => readBit(base, 0b10000000) > 0;
const uint8 = (base: number) => base % 256;
const twosNot = (base: number) => uint8(onesNot(base) + 1);

const writeBit = (base: number, mask: number, value: number) =>
	base & ~mask | readBit(value, mask);

enum Flag {
	NEGATIVE = 0b10000000,
	ZERO = 0b01000000,
	OVERFLOW = 0b00100000,
	CARRY = 0b00010000,
}

enum Register { A, B, X, Y, IP, SP, BP, FLG }
type Instruction = (this: CPU) => void;

export interface CPU {
	a: number;
	b: number;
	x: number;
	y: number;
	ip: number;
	sp: number;
	bp: number;
	negative: boolean;
	zero: boolean;
	overflow: boolean;
	carry: boolean;
}

export class CPU {
	[instruction: number]: Instruction | undefined;
	readonly bus = new BUS();
	readonly cache = new Uint8Array(2);
	readonly registers = new Uint8Array(8);
	readonly unbankedMemory = new Uint8Array(128);
	terminated = false;

	constructor () {
		this.ip = 0x80;
		this.sp = 0xEF;
	}

	private static instruction (size: 1 | 2 = 1) {
		return <T extends Instruction> (
			_t: CPU, _p: string, descriptor: TypedPropertyDescriptor<T>,
		) => {
			const func = descriptor.value;
			if (func == null) throw new TypeError('Cannot wrap null or undefined.');

			descriptor.value = function wrapped (this: CPU) {
				const ip = this.ip;
				if (size > 1) this.cache[1] = this.readByte(ip + 1);
				this.ip = ip + size;
				return func.call(this);
			} as T;

			Object.defineProperty(descriptor.value, 'name', {
				value: func.name,
			});

			return descriptor;
		};
	}

	start () {
		while (!this.terminated) {
			this.cache[0] = this.readByte(this.ip);
			const instruction = this[this.cache[0]] ?? this[0];

			instruction.call(this);
		}
	}

	resume () {
		this.terminated = false;
		this.start();
	}

	readRegister (reg: Register) {
		const value = this.registers[reg];
		return reg === Register.SP ? value | 0xC0 : value;
	}

	writeRegister (reg: Register, value: number) {
		value = uint8(value);
		this.registers[reg] = reg === Register.SP ? value | 0xC0 : value;
	}

	readFlag (flag: Flag) {
		return Boolean(readBit(this.registers[Register.FLG], flag));
	}

	writeFlag (flag: Flag, value: boolean) {
		this.registers[Register.FLG] =
			writeBit(this.registers[Register.FLG], flag, value ? flag : 0);
	}

	readByte (offset: number) {
		offset = uint8(offset);

		if (offset < 128) {
			return this.bus.emit({
				addr: offset,
				bp: this.bp,
				data: 0,
				rw: RW.READ,
			});
		} else {
			return this.unbankedMemory[offset - 128];
		}
	}

	writeByte (offset: number, value: number) {
		offset = uint8(offset);

		if (offset < 128) {
			this.bus.emit({
				addr: offset,
				bp: this.bp,
				data: value,
				rw: RW.WRITE,
			});
		} else {
			this.unbankedMemory[offset - 128] = value;
		}
	}

	private addCarry (y = this.y) {
		const x = this.x;
		const sum = x + y + Number(this.carry);
		const signX = sign(x);
		const signSum = sign(sum);

		this.x = sum;
		this.overflow = signX === sign(y) && signX !== signSum;
		this.carry = sum >= 256;
	}

	private rotateRight (shift = this.y % 8) {
		const value = this.x;
		this.x = (value << shift) | (value >> 8 - shift);
	}

	private rotateLeftCarry () {
		const shift = this.y % 8;
		let value = this.x;
		let carry = Number(this.carry);

		// Rotate iteratively because I just can't
		for (let iter = 0; iter < shift; iter++) {
			[value, carry] = [(value << 1) | carry & 0xff, value >> 8];
		}

		this.x = value;
		this.carry = Boolean(carry);
	}

	private rotateRightCarry () {
		const shift = this.y % 8;
		let value = this.x;
		let carry = Number(this.carry);

		for (let iter = 0; iter < shift; iter++) {
			[value, carry] = [(value >> 1) | (carry ? 128 : 0), value & 1];
		}

		this.x = value;
		this.carry = Boolean(carry);
	}

	private arithmeticShiftRight () {
		const x = this.x;
		this.x = (x >> this.y % 8) | (x & 128);
	}

	private push (value: number) {
		this.writeByte(this.sp--, value);
	}

	private pop () {
		return this.readByte(++this.sp);
	}

	private jumpSubroutine () {
		this.push(this.ip);
		this.ip = this.cache[1];
	}

	private compare (x: number, y: number) {
		const diff = x - y;
		this.negative = diff < 0;
		this.zero = diff === 0;
	}

	@CPU.instruction(1) [0x00] () { this.terminated = true; }
	@CPU.instruction(1) [0x01] () { } // No-OP
	@CPU.instruction(2) [0x02] () { this.bp = this.cache[1]; }
	@CPU.instruction(1) [0x03] () { console.warn('DEBUG'); }
	@CPU.instruction(2) [0x04] () { this.ip = this.cache[1]; }
	@CPU.instruction(2) [0x05] () { this.jumpSubroutine(); }
	@CPU.instruction(1) [0x06] () { this.ip = this.pop(); }
	@CPU.instruction(1) [0x08] () { this.addCarry(); }
	@CPU.instruction(1) [0x09] () { this.addCarry(twosNot(this.y)); }
	@CPU.instruction(1) [0x0a] () { this.x = onesNot(this.x); }
	@CPU.instruction(1) [0x0b] () { this.y = onesNot(this.y); }
	@CPU.instruction(1) [0x0c] () { this.rotateRight(); }
	@CPU.instruction(1) [0x0d] () { this.rotateLeftCarry(); }
	@CPU.instruction(1) [0x0e] () { this.x = this.x << this.y % 8; }
	@CPU.instruction(1) [0x0f] () { this.x = this.x ^ this.y; }
	@CPU.instruction(1) [0x10] () { this.carry = false; this.addCarry(); }
	@CPU.instruction(1) [0x11] () { this.carry = false; this.addCarry(twosNot(this.y)); }
	@CPU.instruction(1) [0x14] () { this.ip = this.a; }
	@CPU.instruction(1) [0x15] () { this.ip = this.b; }
	@CPU.instruction(1) [0x16] () { this.ip = this.x; }
	@CPU.instruction(1) [0x17] () { this.ip = this.y; }
	@CPU.instruction(1) [0x18] () { this.x = this.x & this.y; }
	@CPU.instruction(1) [0x19] () { this.x = this.x | this.y; }
	@CPU.instruction(1) [0x1a] () { this.x = twosNot(this.x); }
	@CPU.instruction(1) [0x1b] () { this.y = twosNot(this.y); }
	@CPU.instruction(1) [0x1c] () { this.rotateRight(8 - (this.y % 8)); }
	@CPU.instruction(1) [0x1d] () { this.rotateRightCarry(); }
	@CPU.instruction(1) [0x1e] () { this.x = this.x >> this.y % 8; }
	@CPU.instruction(1) [0x1f] () { this.arithmeticShiftRight(); }
	@CPU.instruction(2) [0x40] () { if (!this.negative) this.ip = this.cache[1]; }
	@CPU.instruction(2) [0x41] () { if (!this.overflow) this.ip = this.cache[1]; }
	@CPU.instruction(2) [0x42] () { if (!this.carry) this.ip = this.cache[1]; }
	@CPU.instruction(2) [0x43] () { if (!this.zero) this.ip = this.cache[1]; }
	@CPU.instruction(2) [0x48] () { this.negative = false; }
	@CPU.instruction(2) [0x49] () { this.overflow = false; }
	@CPU.instruction(2) [0x4a] () { this.carry = false; }
	@CPU.instruction(2) [0x4b] () { this.zero = false; }
	@CPU.instruction(2) [0x50] () { if (this.negative) this.ip = this.cache[1]; }
	@CPU.instruction(2) [0x51] () { if (this.overflow) this.ip = this.cache[1]; }
	@CPU.instruction(2) [0x52] () { if (this.carry) this.ip = this.cache[1]; }
	@CPU.instruction(2) [0x53] () { if (this.zero) this.ip = this.cache[1]; }
	@CPU.instruction(2) [0x58] () { this.negative = true; }
	@CPU.instruction(2) [0x59] () { this.overflow = true; }
	@CPU.instruction(2) [0x5a] () { this.carry = true; }
	@CPU.instruction(2) [0x5b] () { this.zero = true; }
	@CPU.instruction(1) [0x80] () { this.a++; }
	@CPU.instruction(1) [0x81] () { this.b++; }
	@CPU.instruction(1) [0x82] () { this.x++; }
	@CPU.instruction(1) [0x83] () { this.y++; }
	@CPU.instruction(1) [0x84] () { this.push(this.a); }
	@CPU.instruction(1) [0x85] () { this.push(this.b); }
	@CPU.instruction(1) [0x86] () { this.push(this.x); }
	@CPU.instruction(1) [0x87] () { this.push(this.y); }
	@CPU.instruction(2) [0x88] () { this.a = this.readByte(this.cache[1]); }
	@CPU.instruction(2) [0x89] () { this.b = this.readByte(this.cache[1]); }
	@CPU.instruction(2) [0x8a] () { this.x = this.readByte(this.cache[1]); }
	@CPU.instruction(2) [0x8b] () { this.y = this.readByte(this.cache[1]); }
	@CPU.instruction(1) [0x8c] () { this.a = 0; }
	@CPU.instruction(1) [0x8d] () { this.b = 0; }
	@CPU.instruction(1) [0x8e] () { this.x = 0; }
	@CPU.instruction(1) [0x8f] () { this.y = 0; }
	@CPU.instruction(1) [0x90] () { this.a--; }
	@CPU.instruction(1) [0x91] () { this.b--; }
	@CPU.instruction(1) [0x92] () { this.x--; }
	@CPU.instruction(1) [0x93] () { this.y--; }
	@CPU.instruction(1) [0x94] () { this.a = this.pop(); }
	@CPU.instruction(1) [0x95] () { this.b = this.pop(); }
	@CPU.instruction(1) [0x96] () { this.x = this.pop(); }
	@CPU.instruction(1) [0x97] () { this.y = this.pop(); }
	@CPU.instruction(2) [0x98] () { this.writeByte(this.cache[1], this.a); }
	@CPU.instruction(2) [0x99] () { this.writeByte(this.cache[1], this.b); }
	@CPU.instruction(2) [0x9a] () { this.writeByte(this.cache[1], this.x); }
	@CPU.instruction(2) [0x9b] () { this.writeByte(this.cache[1], this.y); }
	@CPU.instruction(1) [0x9c] () { this.a = 255; }
	@CPU.instruction(1) [0x9d] () { this.b = 255; }
	@CPU.instruction(1) [0x9e] () { this.x = 255; }
	@CPU.instruction(1) [0x9f] () { this.y = 255; }
	@CPU.instruction(1) [0xa0] () { this.a = this.sp; }
	@CPU.instruction(1) [0xa1] () { this.b = this.sp; }
	@CPU.instruction(1) [0xa2] () { this.a = this.bp; }
	@CPU.instruction(1) [0xa3] () { this.b = this.bp; }
	@CPU.instruction(2) [0xa8] () { this.a = this.cache[1]; }
	@CPU.instruction(2) [0xa9] () { this.b = this.cache[1]; }
	@CPU.instruction(2) [0xaa] () { this.x = this.cache[1]; }
	@CPU.instruction(2) [0xab] () { this.y = this.cache[1]; }
	@CPU.instruction(1) [0xb0] () { this.sp = this.a; }
	@CPU.instruction(1) [0xb1] () { this.sp = this.b; }
	@CPU.instruction(1) [0xb2] () { this.bp = this.a; }
	@CPU.instruction(1) [0xb3] () { this.bp = this.b; }
	@CPU.instruction(2) [0xb8] () { this.compare(this.cache[1], this.a); }
	@CPU.instruction(2) [0xb9] () { this.compare(this.cache[1], this.b); }
	@CPU.instruction(2) [0xba] () { this.compare(this.cache[1], this.x); }
	@CPU.instruction(2) [0xbb] () { this.compare(this.cache[1], this.y); }
	@CPU.instruction(1) [0xc0] () { this.a = this.a; }
	@CPU.instruction(1) [0xc1] () { this.a = this.b; }
	@CPU.instruction(1) [0xc2] () { this.a = this.x; }
	@CPU.instruction(1) [0xc3] () { this.a = this.y; }
	@CPU.instruction(1) [0xc4] () { this.a = this.readByte(this.a); }
	@CPU.instruction(1) [0xc5] () { this.a = this.readByte(this.b); }
	@CPU.instruction(1) [0xc6] () { this.a = this.readByte(this.x); }
	@CPU.instruction(1) [0xc7] () { this.a = this.readByte(this.y); }
	@CPU.instruction(1) [0xc8] () { this.compare(this.a, this.a); }
	@CPU.instruction(1) [0xc9] () { this.compare(this.a, this.b); }
	@CPU.instruction(1) [0xca] () { this.compare(this.a, this.x); }
	@CPU.instruction(1) [0xcb] () { this.compare(this.a, this.y); }
	@CPU.instruction(1) [0xcc] () { this.writeByte(this.a, this.a); }
	@CPU.instruction(1) [0xcd] () { this.writeByte(this.a, this.b); }
	@CPU.instruction(1) [0xce] () { this.writeByte(this.a, this.x); }
	@CPU.instruction(1) [0xcf] () { this.writeByte(this.a, this.y); }
	@CPU.instruction(1) [0xd0] () { this.b = this.a; }
	@CPU.instruction(1) [0xd1] () { this.b = this.b; }
	@CPU.instruction(1) [0xd2] () { this.b = this.x; }
	@CPU.instruction(1) [0xd3] () { this.b = this.y; }
	@CPU.instruction(1) [0xd4] () { this.b = this.readByte(this.a); }
	@CPU.instruction(1) [0xd5] () { this.b = this.readByte(this.b); }
	@CPU.instruction(1) [0xd6] () { this.b = this.readByte(this.x); }
	@CPU.instruction(1) [0xd7] () { this.b = this.readByte(this.y); }
	@CPU.instruction(1) [0xd8] () { this.compare(this.b, this.a); }
	@CPU.instruction(1) [0xd9] () { this.compare(this.b, this.b); }
	@CPU.instruction(1) [0xda] () { this.compare(this.b, this.x); }
	@CPU.instruction(1) [0xdb] () { this.compare(this.b, this.y); }
	@CPU.instruction(1) [0xdc] () { this.writeByte(this.b, this.a); }
	@CPU.instruction(1) [0xdd] () { this.writeByte(this.b, this.b); }
	@CPU.instruction(1) [0xde] () { this.writeByte(this.b, this.x); }
	@CPU.instruction(1) [0xdf] () { this.writeByte(this.b, this.y); }
	@CPU.instruction(1) [0xe0] () { this.x = this.a; }
	@CPU.instruction(1) [0xe1] () { this.x = this.b; }
	@CPU.instruction(1) [0xe2] () { this.x = this.x; }
	@CPU.instruction(1) [0xe3] () { this.x = this.y; }
	@CPU.instruction(1) [0xe4] () { this.x = this.readByte(this.a); }
	@CPU.instruction(1) [0xe5] () { this.x = this.readByte(this.b); }
	@CPU.instruction(1) [0xe6] () { this.x = this.readByte(this.x); }
	@CPU.instruction(1) [0xe7] () { this.x = this.readByte(this.y); }
	@CPU.instruction(1) [0xe8] () { this.compare(this.x, this.a); }
	@CPU.instruction(1) [0xe9] () { this.compare(this.x, this.b); }
	@CPU.instruction(1) [0xea] () { this.compare(this.x, this.x); }
	@CPU.instruction(1) [0xeb] () { this.compare(this.x, this.y); }
	@CPU.instruction(1) [0xec] () { this.writeByte(this.x, this.a); }
	@CPU.instruction(1) [0xed] () { this.writeByte(this.x, this.b); }
	@CPU.instruction(1) [0xee] () { this.writeByte(this.x, this.x); }
	@CPU.instruction(1) [0xef] () { this.writeByte(this.x, this.y); }
	@CPU.instruction(1) [0xf0] () { this.y = this.a; }
	@CPU.instruction(1) [0xf1] () { this.y = this.b; }
	@CPU.instruction(1) [0xf2] () { this.y = this.x; }
	@CPU.instruction(1) [0xf3] () { this.y = this.y; }
	@CPU.instruction(1) [0xf4] () { this.y = this.readByte(this.a); }
	@CPU.instruction(1) [0xf5] () { this.y = this.readByte(this.b); }
	@CPU.instruction(1) [0xf6] () { this.y = this.readByte(this.x); }
	@CPU.instruction(1) [0xf7] () { this.y = this.readByte(this.y); }
	@CPU.instruction(1) [0xf8] () { this.compare(this.y, this.a); }
	@CPU.instruction(1) [0xf9] () { this.compare(this.y, this.b); }
	@CPU.instruction(1) [0xfa] () { this.compare(this.y, this.x); }
	@CPU.instruction(1) [0xfb] () { this.compare(this.y, this.y); }
	@CPU.instruction(1) [0xfc] () { this.writeByte(this.y, this.a); }
	@CPU.instruction(1) [0xfd] () { this.writeByte(this.y, this.b); }
	@CPU.instruction(1) [0xfe] () { this.writeByte(this.y, this.x); }
	@CPU.instruction(1) [0xff] () { this.writeByte(this.y, this.y); }
}

for (const item of Object.keys(Flag).filter(k => isNaN(+k)) as (keyof typeof Flag)[]) {
	Object.defineProperty(CPU.prototype, item.toLowerCase(), {
		get (this: CPU) { return this.readFlag(Flag[item]); },
		set (this: CPU, value: boolean) { this.writeFlag(Flag[item], value); },
	});
}

const registers =
	Object.keys(Register).filter(k => isNaN(+k)) as (keyof typeof Register)[];

for (const item of registers) {
	Object.defineProperty(CPU.prototype, item.toLowerCase(), {
		get (this: CPU) { return this.readRegister(Register[item]); },
		set (this: CPU, value) { this.writeRegister(Register[item], value); },
	});
}
