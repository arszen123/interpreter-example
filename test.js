import { Parser, EvalInterpreter } from './index.js';
import assert from 'assert';

function assertEqual(expr, expected) {
    const i = new EvalInterpreter(new Parser(expr));
    assert.equal(i.eval(), expected);
}

function assertThrows(expr) {
    const i = new EvalInterpreter(new Parser(expr));
    assert.throws(() => {
        const res = i.eval();
        console.log(res);
    }, 'Throws');
}

const tests = [
    // base test
    () => assertEqual('10 + 20', 30),
    () => assertEqual('10 * 20', 200),
    () => assertEqual('100 + 8 * 10 - 100', 80),
    () => assertEqual('100 + 8 * 10 /8 - 100', 10),
    () => assertEqual('   100 - 28', 72),
    () => assertEqual('10+(3*(20+2+8))', 100),
    () => assertEqual('10+20', 30),
    () => assertEqual('20-10', 10),
    () => assertEqual('10', 10),
    () => assertEqual('(((10)))', 10),
    () => assertEqual('-10', -10),
    () => assertEqual('20 - - + - 10', 10),
    // throw test
    () => assertThrows('10 +'),
    () => assertThrows('10 + (())'),
    () => assertThrows('10 + (('),
    () => assertThrows('10 + (20*(20+2)'),
    // pow test
    () => assertEqual('10 ^ 2', 100),
    () => assertEqual('10 ^ 2 ^ 3', 100000000),
    () => assertEqual('10 ^ 2 + 3', 103),
    () => assertEqual('10 ^ (2 + 3)', 100000),
    // pow with unary test
    () => assertEqual(' - - + - 10  ^ 3', -1000),
    () => assertEqual('(- - + - 10) ^ 3', -1000),
    () => assertEqual('(- - + - 10) ^  - - + - -3 ', -1000),
    () => assertEqual('(- - + - 10) ^ (- - + - -3)', -1000),
    () => assertEqual('(- - + - 10) ^ - 2', 0.01),
];

for (const i in tests) {
    const test = tests[i];
    try {
        test();
    } catch (e) {
        console.error(i + e);
    }
}