import cli from 'cli';
import fs from 'fs';
import { run } from './index.js';
import logger from './logger.js';

const options = cli.parse({
    file: ['f', 'A file to process', 'file'],
    scope: [false, 'With scope logging', 'bool'],
    stack: [false, 'With stack logging', 'bool'],
});

if (!options['file'] || !fs.existsSync(options['file'])) {
    cli.fatal('file not exist');
}
fs.readFile(options['file'], (err, data) => {
    const program = data.toString();
    if (options['scope']) {
        logger.scope.setLevel('info');
    }
    if (options['stack']) {
        logger.stack.setLevel('info');
    }
    try {
        run(program);
    } catch(e) {
        cli.error(e.toString());
    }
});