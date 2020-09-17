import { Component } from './base.js';

export default class Controller extends Component {
	readonly controls: Record<number, Component['handleBUSEvent'] | undefined> =
		Object.create(null);

	constructor (readonly bank: number) { super(); }

	addControl (addr: number, handler: Component['handleBUSEvent']) {
		this.controls[addr] = handler;
	}

	removeControl (addr: number) {
		delete this.controls[addr];
	}

	handleBUSEvent (event: Component.Options) {
		if (event.bp !== this.bank) return undefined;

		return this.controls[event.addr]?.(event) ?? 0;
	}
}
