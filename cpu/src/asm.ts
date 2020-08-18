import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Parses assembly code and returns a flat AST
 * @param text The content of the assembly code
 * @returns resulting AST
 */
export const parse: (text: string) => AST = require('./asm.cjs').parse;

/**
 * Lookup table for translating instructions
 */
export const instrTable = {
	/** Immediate */
	imd: {
		bnk: 0x02,
		lda: 0xA8, ldb: 0xA9, ldx: 0xAA, ldy: 0xAB,
		cpa: 0xB8, cpb: 0xB9, cpx: 0xBA, cpy: 0xBB,
	},
	/** Indirect (Pointer) */
	ptr: {
		jmp: 0x04, jsr: 0x05,
		bpl: 0x40, bvc: 0x41, bcc: 0x42, bnq: 0x43,
		bmi: 0x50, bvs: 0x51, bcs: 0x52, beq: 0x53,
		lda: 0x88, ldb: 0x89, ldx: 0x8A, ldy: 0x8B,
		sta: 0x98, stb: 0x99, stx: 0x9A, sty: 0x9B,
	},
	/** Implied */
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

export class Assembler {
	private readonly banks = new Map<number | 'swap', BankData>();
	private bankName?: number | 'swap';
	private isCached = false;
	private offset = 0;

	private get bankData () {
		if (this.bankName == null) throw new Error('No bank specified.');
		return this.banks.get(this.bankName)!;
	}

	private constructor (private readonly text: string) { }

	/**
	 * Assembles given source into ArrayBuffer
	 * @param text Assembly source to be assembled
	 * @returns Map of BankData containing ArrayBuffer and list of labels
	 */
	static assemble (text: string) {
		return new Assembler(text).assemble();
	}

	private assemble () {
		if (this.isCached) return this.banks;

		const parsers = {
			bnk: this.bank,
			flf: this.directiveFillFor,
			flt: this.directiveFillTo,
			imd: this.instruction,
			imp: this.instruction,
			lbl: this.label,
			ptr: this.instruction,
			str: this.directiveChar,
		};

		for (const item of parse(this.text)) {
			parsers[item.type].call(this, item as never);
		}

		for (const {bytes, buffer} of this.banks.values()) {
			for (const [index, value] of bytes.entries()) {
				if (Array.isArray(value)) {
					const label = this.banks.get(value[0])?.labels[value[1]] ??
						this.banks.get('swap')?.labels[value[1]];

					if (label == null) throw new Error('Undefined label ' + value[1]);
					bytes[index] = label;
					buffer[index] = label;
				} else {
					buffer[index] = value;
				}
			}
		}

		this.isCached = true;
		return this.banks;
	}

	private push (value: BankData['bytes'][number]) {
		this.bankData.bytes.push(value);
		this.offset++;

		if (this.offset > (this.bankName! === 'swap' ? 256 : 128))
			throw new Error(`Bank ${this.bankName} is large.`);
	}

	private instruction (item: AnyInstruction) {
		this.push(instrTable[item.type][item.name.toLowerCase() as never]);

		if (item.value != null) {
			if (item.value.type === 'rel') {
				item.value.value += this.offset;
			} else if (item.value.type === 'lbl') {
				item.value.value[0] ?? (item.value.value[0] = this.bankName!);
			}

			this.push(item.value.value);
		}
	}

	private bank (item: BankSelect) {
		const bank = Object.freeze({
			buffer: new Uint8Array(128),
			bytes: [],
			labels: Object.create(null),
		});

		this.banks.set(item.value, bank);
		this.bankName = item.value;
		this.offset = item.value === 'swap' ? 128 : 0;
	}

	private label (item: Label) {
		this.bankData.labels[item.value] = this.offset;
	}

	private directiveChar (item: DirectiveChar) {
		for (const char of item.value)
			this.push(char.charCodeAt(0));
	}

	private directiveFillFor (item: DirectiveFill) {
		for (let index = 0; index < item.value[0]; index++)
			this.push(item.value[1].charCodeAt(0));
	}

	private directiveFillTo (item: DirectiveFill) {
		for (let index = this.offset; index <= item.value[0]; index++)
			this.push(item.value[1].charCodeAt(0));
	}
}

/**
 * Assembly syntax representation
 */
export type AST = ASTItem[];
type instrTable = typeof instrTable;
type MakeInstruction<T extends keyof instrTable> = T extends any ? Instruction<T> : never;
type LabelReference = [number | 'swap', string];
type AnyInstruction = MakeInstruction<keyof instrTable>;

type ASTItem
	= AnyInstruction
	| BankSelect
	| Label
	| DirectiveChar
	| DirectiveFill
	;

export interface BankData {
	/**
	 * Built source code
	 */
	buffer: Uint8Array;
	/** @internal */
	bytes: (number | LabelReference)[];
	/**
	 * List of labels in this bank
	 */
	labels: { [x in string]?: number; };
}

/**
 * Assembly instruction
 *
 * @example ```asm8
 * hlt      ; Implied
 * lda #123 ; Immediate
 * lda  123 ; Indirect (Refered as pointer within the source)
 * ```
 */
export interface Instruction<T extends keyof instrTable> {
	name: keyof instrTable[T];
	type: T;
	/**
	 * Arguments of the instruction, if any
	 */
	value: T extends 'imp' ? undefined : {
		type: 'abs' | 'rel';
		/**
		 * Absolute or relative number
		 *
		 * @example ```asm8
		 * Absolute:
		 * 12
		 * $ae
		 * %10011100
		 * ; Immediate
		 * #12
		 * #$ae
		 * #%10011100
		 *
		 * Relative:
		 * +12
		 * -$ae
		 * +%00000000
		 * ; Does not support immediate
		 * ```
		 */
		value: number;
	} | {
		type: 'lbl';
		/**
		 * Identifier of the label
		 * @property 0 Identifier of the bank. null for current bank or 'swap'.
		 * @property 1 Name of the label
		 *
		 * @example ```asm8
		 * bank 0:
		 * some_label:
		 * jmp some_label    ; [null, "some_label"] -> 0
		 * jmp 1:some_label  ; [1,    "some_label"] -> 1
		 *
		 * bank 1:
		 * some_label:
		 * ```
		 */
		value: LabelReference;
	};
}

/**
 * Switches selected bank to be written
 *
 * @example ```asm8
 * ; Only comments can exist before the first bank select
 * bank 0:    ; Smallest
 * bank $ff:  ; Largest
 * bank swap: ; 'swap'
 * ```
 */
export interface BankSelect {
	type: 'bnk';
	/**
	 * Identifier of the bank selected
	 *
	 * If 'swap' is chosen, all labels will have an offset of 128 bytes
	 */
	value: number | 'swap';
}

/**
 * Refers to a point in the memory
 *
 * @example ```asm8
 * func:            jsr _private_function
 * _func_part:      rts
 * _private_func:   rts
 * __resource:      .char "Hello!" .char #0
 * _func__resource: .char #$f0
 * ```
 */
export interface Label {
	type: 'lbl';
	/**
	 * Label name
	 */
	value: string;
}

/**
 * Inserts one or more literal characters
 *
 * @example ```asm8
 * .char 'a'      ; Insert character 'a'
 * .char #0       ; Insert NULL character
 * .char "Hello!" ; Insert string "Hello!"
 * ```
 */
export interface DirectiveChar {
	type: 'str';
	/**
	 * String or character to insert
	 */
	value: string;
}

/**
 * Fills area of a bank with a specified character
 *
 * @example ```asm8
 * .fill #12 #0  ; Fill 12 bytes with the NULL character
 * .fill 24  'a' ; Fill until the 24th byte (inclusive) with character 'a'
 * ```
 */
export interface DirectiveFill {
	type: 'flf' | 'flt';
	/**
	 * @property 0 End index, or length
	 * @property 1 Character to fill with
	 */
	value: [number, string];
}
