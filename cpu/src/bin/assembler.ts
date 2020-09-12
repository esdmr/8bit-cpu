import * as util from 'util';
import * as process from 'process';
import * as fs from 'fs';
import { CPU } from '../cpu.js';
import { Assembler } from '../asm.js';
import * as components from '../components/index.js';

function main () {
	if (![4, 5].includes(process.argv.length)) {
		console.log('Output file not provided.');
		console.log(`Usage: node ${process.argv[1]} INPUT --eval [--debug]`);
		console.log(`Usage: node ${process.argv[1]} INPUT OUTPUT`);
		process.exit(1);
	}

	const inputFile = process.argv[2];
	const outputFile = process.argv[3];
	const shouldDebug = process.argv[4] === '--debug';

	const input = fs.readFileSync(inputFile, 'utf8');
	const { banks, inits } = Assembler.assemble(input);

	if (outputFile === '--eval') {
		const cpu = new CPU();

		for (const init of inits) {
			const [name, args] = init.value;

			if (!(name in components)) {
				throw new Error(`Component ${name} does not exist.`);
			}

			cpu.bus.on(new (components[name as never] as any)(args));
		}

		for (const [bank, { buffer }] of banks.entries()) {
			if (bank === 'swap') {
				cpu.unbankedMemory.set(buffer);
			} else {
				cpu.bus.on(new components.Memory({ bank, buffer }));
			}
		}

		cpu.start();

		if (shouldDebug) {
			console.log(util.inspect(cpu, {
				colors: true,
				depth: Infinity,
				maxArrayLength: Infinity,
			}));
		}
	} else {
		// return writeFileSync(require('path').normalize(outputFile), buffer);
	}
}

main();
