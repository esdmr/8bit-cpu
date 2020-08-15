import { createRequire } from 'module';
import { inspect } from 'util';
import { argv } from 'process';
// import { writeFileSync } from 'fs';
import { CPU } from './cpu.js';

const instrTable = {
	imd: {
		bnk: 0x02,
		lda: 0xA8, ldb: 0xA9, ldx: 0xAA, ldy: 0xAB,
		cpa: 0xB8, cpb: 0xB9, cpx: 0xBA, cpy: 0xBB,
	},
	ptr: {
		jmp: 0x04, jsr: 0x05,
		bpl: 0x40, bvc: 0x41, bcc: 0x42, bnq: 0x43,
		bmi: 0x50, bvs: 0x51, bcs: 0x52, beq: 0x53,
		lda: 0x88, ldb: 0x89, ldx: 0x8A, ldy: 0x8B,
		sta: 0x98, stb: 0x99, stx: 0x9A, sty: 0x9B,
	},
	imp: {
		hlt: 0x00, nop: 0x01, dbg: 0x03,
		rts: 0x06,
		adc: 0x08, sbc: 0x09, ntx: 0x0A, nty: 0x0B,
		rol: 0x0C, rlc: 0x0D, shl: 0x0E, eor: 0x0F,
		ror: 0x1C, rrc: 0x1D, shr: 0x1E, asr: 0x1F,
		add: 0x10, sub: 0x11,
		jpa: 0x14, jpb: 0x15, jpx: 0x16, jpy: 0x17,
		and: 0x18, ior: 0x19, tnx: 0x1A, tny: 0x1B,
		cln: 0x48, clv: 0x49, clc: 0x4A, clz: 0x4B,
		sen: 0x58, sev: 0x59, sec: 0x5A, sez: 0x5B,
		ina: 0x80, inb: 0x81, inx: 0x82, iny: 0x83,
		pha: 0x84, phb: 0x85, phx: 0x86, phy: 0x87,
		lza: 0x8C, lzb: 0x8D, lzx: 0x8E, lzy: 0x8F,
		dca: 0x90, dcb: 0x91, dcx: 0x92, dcy: 0x93,
		pla: 0x94, plb: 0x95, plx: 0x96, ply: 0x97,
		loa: 0x9C, lob: 0x9D, lox: 0x9E, loy: 0x9F,
		tsa: 0xA0, tsb: 0xA1, tpa: 0xA2, tpb: 0xA3,
		tas: 0xB0, tbs: 0xB1, tap: 0xB2, tbp: 0xB3,
		taa: 0xC0, tab: 0xC1, tax: 0xC2, tay: 0xC3,
		tba: 0xD0, tbb: 0xD1, tbx: 0xD2, tby: 0xD3,
		txa: 0xE0, txb: 0xE1, txx: 0xE2, txy: 0xE3,
		tya: 0xF0, tyb: 0xF1, tyx: 0xF2, tyy: 0xF3,
		laa: 0xC4, lab: 0xC5, lax: 0xC6, lay: 0xC7,
		lba: 0xD4, lbb: 0xD5, lbx: 0xD6, lby: 0xD7,
		lxa: 0xE4, lxb: 0xE5, lxx: 0xE6, lxy: 0xE7,
		lya: 0xF4, lyb: 0xF5, lyx: 0xF6, lyy: 0xF7,
		caa: 0xC8, cab: 0xC9, cax: 0xCA, cay: 0xCB,
		cba: 0xD8, cbb: 0xD9, cbx: 0xDA, cby: 0xDB,
		cxa: 0xE8, cxb: 0xE9, cxx: 0xEA, cxy: 0xEB,
		cya: 0xF8, cyb: 0xF9, cyx: 0xFA, cyy: 0xFB,
		saa: 0xCC, sab: 0xCD, sax: 0xCE, say: 0xCF,
		sba: 0xDC, sbb: 0xDD, sbx: 0xDE, sby: 0xDF,
		sxa: 0xEC, sxb: 0xED, sxx: 0xEE, sxy: 0xEF,
		sya: 0xFC, syb: 0xFD, syx: 0xFE, syy: 0xFF,
	},
} as const;

function parseChar (char: string) {
	return JSON.parse(char.replace(/'/g, '"'));
}

function parseRel (neg: '+' | '-', off: number) {
	return (neg === '-' ? -1 : 1) * off;
}

function convert (asm: AST) {
	const output: {[x in number | 'swap']?: {labels: {[x in string]?: number}, bank: (number | [number | null, string])[]}} = Object.create(null);
	let current: NonNullable<typeof output[number]> | null = null;
	let currentBank: number | null = null;
	let offset = 0;

	for (const item of asm) {
		switch (item.type) {
			case 'imd':
			case 'ptr':
			case 'imp':
				if (current == null) throw new Error('No bank specified.');
				current.bank.push(
					instrTable[item.type][item.name.toLowerCase() as never]);

				if (item.value != null) {
					if (item.value.type === 'rel') {
						item.value.value += offset + current.bank.length;
					} else if (item.value.type === 'lbl') {
						current.bank.push([
							item.value.value[0] ?? currentBank,
							item.value.value[1],
						]);

						break;
					}

					current.bank.push(item.value.value);
				}

				break;

			case 'bnk':
				current = {bank: [], labels: Object.create(null)};
				output[item.value] = current;
				currentBank = item.value === 'swap' ? null : item.value;
				offset = item.value === 'swap' ? 128 : 0;
				break;

			case 'lbl':
				if (current == null) throw new Error('No bank specified.');
				current.labels[item.value] = offset + current.bank.length;
				break;

			case 'str':
				if (current == null) throw new Error('No bank specified.');
				for (const char of item.value)
					current.bank.push(char.charCodeAt(0));
				break;

			case 'flf':
				if (current == null) throw new Error('No bank specified.');
				for (let i = 0; i < item.value[0]; i++)
					current.bank.push(item.value[1].charCodeAt(0));
				break;

			case 'flt':
				if (current == null) throw new Error('No bank specified.');
				for (let i = offset + current.bank.length; i <= item.value[0]; i++)
					current.bank.push(item.value[1].charCodeAt(0));
				break;
		}
	}

	// const bankIndex = Object.keys(output).
	// 	map(key => key === 'swap' ? key : parseInt(key, 10));

	// const buffer = new Uint8Array(Object.keys(output).length * 128);

	for (const [name, {bank}] of
		Object.entries(output) as [string, NonNullable<typeof current>][]) {
		if (bank.length > 128) throw new Error(`Bank ${name} is large.`);
		// let offset = 0;

		for (const [index, value] of bank.entries()) {
			if (Array.isArray(value)) {
				const label = output[value[0] ?? 'swap']?.labels[value[1]] ??
					output.swap?.labels[value[1]];

				if (label == null) throw new Error('Undefined label ' + value[1]);
				bank[index] = label;
				// buffer[offset * 128 + index] = label;
			} else {
				// buffer[offset * 128 + index] = value;
			}

			offset++;
		}
	}

	// if (typeof module !== 'undefined' && require.main === module) {
	outputBin(output as never);
	// } else {
	// 	return {buffer, bankIndex};
	// }
}

function checkArgs () {
	if (!argv[3]) {
		console.log('Output file not provided.');
		console.log(`Usage: ${argv[1]} INPUT --eval [--debug]`);
		console.log(`Usage: ${argv[1]} INPUT OUTPUT`);
		process.exit(1);
	}
}

function outputBin (output: {[x in number | 'swap']: {bank: number[]}}) {
	// const outfile = argv[3];
	checkArgs();

	// if (outfile !== '--eval') {
	// 	return writeFileSync(require('path').normalize(outfile), buffer);
	// }

	const cpu = new CPU();

	Object.entries(output).forEach(([name, {bank: buffer}]) => {
		const bank = name === 'swap' ?
			cpu.unbankedMemory :
			(cpu.banks[+name] = new Uint8Array(128));

		for (let index = 0; index < 128; index++) {
			bank[index] = buffer[index];
		}
	});

	cpu.start().then(() => {
		if (argv[4] === '--debug')
			console.log(inspect(cpu, {
				colors: true,
				depth: Infinity,
				maxArrayLength: Infinity,
			}))
	}, console.error);
}

const require = createRequire(import.meta.url);

require.cache.internal = {
	id: 'internal',
	children: [],
	exports: {
		parseChar,
		parseRel,
		convert,
	},
	filename: '<ASM API>',
	loaded: true,
	parent: null,
	path: '<ASM Internal>',
	paths: [],
	require,
};

export const parse: (text: string) => AST = require('./asm.cjs').parse;
const main: (argv: string[]) => void = require('./asm.cjs').main;


// if (typeof module !== 'undefined' && require.main === module) {
checkArgs();
main(argv.slice(1));
// }

type AST = ASTItem[];
type instrTable = typeof instrTable;
type Keys<T> = T extends any ? keyof T : never;
type MakeInstruction<T extends Keys<instrTable>> = T extends any ? Instruction<T> : any;

type ASTItem
	= MakeInstruction<Keys<instrTable>>
	| Bank
	| Label
	| DirectiveChar
	| DirectiveFill
	;

interface Instruction<T extends Keys<instrTable>> {
	name: Keys<instrTable[T]>;
	type: T;
	value: T extends 'imp' ? undefined : {
		type: 'abs' | 'rel';
		value: number;
	} | {
		type: 'lbl';
		value: [number | null, string];
	};
}

interface Bank {
	type: 'bnk';
	value: number | 'swap';
}

interface Label {
	type: 'lbl';
	value: string;
}

interface DirectiveChar {
	type: 'str';
	value: string;
}

interface DirectiveFill {
	type: 'flf' | 'flt';
	value: [number, string];
}
