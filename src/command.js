import cli from 'cli';
import fs from 'fs';
import { run } from './index.js';
import {log, silent} from './logger.js';

const options = cli.parse({
    file: ['f', 'A file to process', 'file'],
    scope: [false, 'With scope logging', 'bool'],
});

if (!options['file'] || !fs.existsSync(options['file'])) {
    cli.fatal('file not exist');
}
fs.readFile(options['file'], (err, data) => {
    const program = data.toString();
    log.setLevel('info');
    if (!!options['scope'] === false) {
        silent();
    }
    try {
        run(program);
    } catch(e) {
        cli.error(e.toString());
    }
});