import { Component, RW } from './base.js';

export default class extends Component {
	bank: number;

	readonly: boolean;

	buffer: Uint8Array;

	constructor ({ bank, readonly = false, buffer = new Uint8Array(128) }: {
		readonly bank: number,
		readonly?: boolean;
		buffer?: Uint8Array;
	}) {
		super();
		this.readonly = readonly;
		this.bank = bank;
		this.buffer = buffer;
	}

	handler ({
		addr, bp, data, rw,
	}: Component.Options) {
		if (bp !== this.bank) return;

		if (rw === RW.WRITE && !this.readonly) {
			this.buffer[addr] = data;
		} else if (rw === RW.READ) {
			return this.buffer[addr];
		}
	}
}
