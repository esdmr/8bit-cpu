import { inspect } from 'util';
import { argv } from 'process';
import { readFileSync, writeFileSync } from 'fs';
import { CPU } from '../cpu.js';
import { Assembler, BankData } from '../asm.js';

function main () {
	if (![4, 5].includes(argv.length)) {
		console.log('Output file not provided.');
		console.log(`Usage: node ${argv[1]} INPUT --eval [--debug]`);
		console.log(`Usage: node ${argv[1]} INPUT OUTPUT`);
		process.exit(1);
	}

	const inputFile = argv[2];
	const outputFile = argv[3];
	const shouldDebug = argv[4] === '--debug';
	const input = readFileSync(inputFile, 'utf8');

	const asm = Assembler.assemble(input);

	if (outputFile === '--eval') {
		const cpu = new CPU();

		for (const [name, {buffer}] of asm.entries()) {
			if (name === 'swap') {
				cpu.unbankedMemory.set(buffer);
			} else {
				cpu.banks[name] = buffer;
			}
		}

		cpu.start();

		if (shouldDebug) {
			console.log(inspect(cpu, {
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
