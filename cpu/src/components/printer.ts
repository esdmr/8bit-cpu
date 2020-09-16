import { Component, RW } from './base.js';
import Controller from './controller.js';
import { CPU } from '../cpu.js';
import { Memory } from './index.js';

export default class Printer extends Component {
	readonly memory: Memory;

	constructor (readonly opts: { readonly bank: number, readonly addr: number; }) {
		super();
		this.memory = new Memory({ bank: opts.bank });
	}

	onAttached (cpu: CPU) {
		cpu.bus.on(this.memory);
		const component = cpu.bus.find(Controller);
		if (component == null) throw new Error('No controller availiable');

		component.addControl(this.opts.addr, () => {
			console.log(String.fromCharCode(...this.memory.buffer).replace(/\0$/g, ''));
			return undefined;
		});
	}

	handler () {
		return undefined;
	}
}
