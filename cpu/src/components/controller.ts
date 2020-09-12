import { Component } from './base.js';

export default class extends Component {
	readonly controls: Record<number, Component['handler'] | undefined> =
		Object.create(null);

	constructor (readonly bank: number) { super(); }

	addControl (addr: number, handler: Component['handler']) {
		this.controls[addr] = handler;
	}

	handler (event: Component.Options) {
		if (event.bp !== this.bank) return undefined;

		return this.controls[event.addr]?.(event) ?? 0;
	}
}
