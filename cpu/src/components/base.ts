import { CPU } from '../cpu.js';

export enum RW { READ, WRITE }

export abstract class Component {
	abstract handler (opt: Component.Options): number | undefined;

	onAttached (cpu: CPU) {}
}

export namespace Component {
	export interface Options {
		addr: number;
		bp: number;
		data: number;
		rw: RW;
	}
}
