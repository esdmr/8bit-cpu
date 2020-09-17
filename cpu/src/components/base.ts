import { CPU } from '../cpu.js';

export enum RW { READ, WRITE }

export abstract class Component {
	abstract handleBUSEvent (opt: Component.Options): number | undefined;

	onAttached (cpu: CPU) {}
	onDetached (cpu: CPU) {}
}

export namespace Component {
	export interface Options {
		addr: number;
		bp: number;
		data: number;
		rw: RW;
	}
}
