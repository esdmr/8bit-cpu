import { Component } from './components/base.js';

export class BUS {
	private readonly components = new Set<Component>();

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
	}

	off (component: Component) {
		this.components.delete(component);
	}

	emit (opts: Component.Options) {
		let result = 0;

		for (const component of this.components) {
			result |= component.handler(opts) ?? 0;
		}

		return result;
	}
}
