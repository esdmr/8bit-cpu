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
		const component = cpu.bus.find(Controller);
		if (component == null) throw new Error('No controller availiable');
		cpu.bus.on(this.memory);
		component.addControl(this.opts.addr, () => {
			console.log(String.fromCharCode(...this.memory.buffer).replace(/\0$/g, ''));
			return undefined;
		});
	}

	onDetached (cpu: CPU) {
		const component = cpu.bus.find(Controller);
		if (component == null) throw new Error('No controller availiable');
		cpu.bus.off(this.memory);
		component.removeControl(this.opts.addr);
	}

	handleBUSEvent () {
		return undefined;
	}
}
