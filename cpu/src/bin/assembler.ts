import * as fs from 'fs';
import * as process from 'process';
import * as util from 'util';
import { assemble } from '../asm.js';
import * as components from '../components/index.js';
import { CPU } from '../cpu.js';
import { writeDebug } from '../debug.js';

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
	const { banks, inits } = assemble(input);

	if (outputFile === '--eval') {
		const cpu = new CPU();

		cpu.writeDebug = writeDebug;

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
		const file = fs.createWriteStream(outputFile);

		try {
			for (const [bank, { buffer }] of banks.entries()) {
				file.cork();

				if (bank === 'swap') {
					file.write('s');
				} else {
					file.write('b' + bank.toString(16).padStart(2, '0'));
				}

				file.write(buffer);
				file.uncork();
			}
		} finally {
			file.end();
		}
	}
}

main();
