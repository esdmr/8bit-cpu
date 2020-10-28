import type { CPU } from './cpu.js';
import { instrTable } from './asm.js';
import { blue, bold, cyanBright, gray, magenta, options } from 'colorette';

enum Register { rA, rB, rX, rY, IP, SP, BP, FL }
const enum Type { Imd, Imp, Ptr }

const flags = {
	0b10000000: 'N',
	0b01000000: 'Z',
	0b00100000: 'V',
	0b00010000: 'C',
}

options.enabled = process.env.NO_COLOR == null;
let lastRegisterValues = new Uint8Array(8).fill(0);
lastRegisterValues[Register.IP] = 0x80;
lastRegisterValues[Register.SP] = 0xEF;

const revInstrTable = {
	...generate(instrTable.imd, Type.Imd),
	...generate(instrTable.imp, Type.Imp),
	...generate(instrTable.ptr, Type.Ptr),
} as const;

function generate (obj: { [x: string]: number; }, type: Type) {
	const result: { [x: number]: { instr: string, type: Type; } | undefined; } = {};

	for (const [instr, value] of Object.entries(obj)) {
		result[value] = { instr, type };
	}

	return result;
}

function hex (num: number) {
	return num.toString(16).toUpperCase().padStart(2, '0');
}

export function writeDebug (this: CPU) {
	const instr = revInstrTable[this.cache[0]]?.instr ?? `#${this.cache}`;
	const instrFormat = instr === 'jsr' || instr === 'rts' ? bold(cyanBright(instr)) : cyanBright(instr);
	const type = revInstrTable[this.cache[0]]?.type ?? Type.Imp;
	const bp = this.ip < 128 ? hex(this.bp) : gray(hex(this.bp));
	let param = `${cyanBright('$')}${magenta(hex(this.cache[1]))}`;

	if (type === Type.Imp) param = '';

	switch (type) {
		case Type.Imd: param = cyanBright(' #') + param; break;
		case Type.Ptr: param = '  ' + param; break;
		case Type.Imp: param = ' '.repeat(5); break;
	}

	const regDiff: number[] = [];
	const previousFlags = lastRegisterValues[Register.FL];

	for (const [k, v] of this.registers.entries()) {
		if (lastRegisterValues[k] != v) {
			regDiff.push(+k);
			lastRegisterValues[k] = v;
		}
	}

	const regDiffMap = regDiff.filter(k => k !== Register.IP).map(k => {
		if (k === Register.FL) {
			const bits = [];

			for (const [b, v] of Object.entries(flags)) {
				if ((this.registers[k] & +b) ^ (previousFlags & +b)) {
					bits.push(`${!!(this.registers[k] & +b) ? '+' : '-'}${v}`);
				}
			}

			return bits.join(', ');
		}

		return `${Register[k]}: ${hex(this.registers[k])}`;
	}).join(', ');

	const regDiffFormat = regDiffMap === '' ? '' : blue(`[${regDiffMap}]`)

	console.warn(`${bp}${hex(this.ip)}  ${instrFormat}${param} ${regDiffFormat}`);
}
