import { Component } from './components/base.js';
import { CPU } from './cpu.js';

export class BUS {
	private readonly components = new Set<Component>();

	constructor (private readonly cpu: CPU) {}

	find<T extends Component> (constructor: new (...args: any[]) => T) {
		for (const component of this.components) {
			if (component instanceof constructor) {
				return component;
			}
		}

		return null;
	}

	on (component: Component) {
		this.components.add(component);
		component.onAttached(this.cpu);
	}

	off (component: Component) {
		this.components.delete(component);
		component.onDetached(this.cpu);
	}

	emit (opts: Component.Options) {
		let result = 0;

		for (const component of this.components) {
			result |= component.handleBUSEvent(opts) ?? 0;
		}

		return result;
	}
}
