import { Component, RW } from './base.js';
import Controller from './controller.js';
import { CPU } from '../cpu.js';

export default class Printer extends Component {
	readonly buffer = new Uint8Array(128);

	constructor (readonly opts: { readonly bank: number, readonly addr: number; }) {
		super();
	}

	onAttached (cpu: CPU) {
		const component = cpu.bus.find(Controller);
		if (component == null) throw new Error('No controller availiable');

		component.addControl(this.opts.addr, () => {
			console.log(String.fromCharCode(...this.buffer).replace(/\0$/g, ''));
			return 0;
		});
	}

	handler ({ bp, rw, addr, data }: Component.Options) {
		if (bp !== this.opts.bank) return;

		if (rw === RW.WRITE) {
			this.buffer[addr] = data;
		} else if (rw === RW.READ) {
			return this.buffer[addr];
		}
	}
}
