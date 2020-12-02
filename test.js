import assert from 'assert';
import { Interpreter } from './src/interpreter2.js';

function testEval(expr, expected) {
    const i = new Interpreter(expr);
    assert.equal(i.eval(), expected, `${expr} = ${expected}`);
}

const tests = [
    function () {
        testEval('1+7', 8);
    },
    function () {
        testEval('113+7', 120);
    },
    function () {
        testEval('1 + 2', 3);
    },
    function () {
        testEval('2 - 1', 1);
    },
    function () {
        const expr = '120 - 10 + 20 - 3 - 7 - 2'
        testEval(expr, eval(expr));
    },
    function () {
        testEval('120', 120);
    },
    function () {
        const expr = '120 + ';
        const i = new Interpreter(expr);
        assert.throws(() => i.eval(), 'Invalid expression');
    },
    function () {
        const expr = '120 ++ 100';
        const i = new Interpreter(expr);
        assert.throws(() => i.eval(), 'Invalid expression');
    },
    function () {
        const expr = '120 + + 100';
        const i = new Interpreter(expr);
        assert.throws(() => i.eval(), 'Invalid expression');
    },
    function () {
        testEval('120 + 10 * 8 - 100 ', 100);
    },
    function () {
        testEval('120 + 10 * 8 / 10 - 100 ', 28);
    }
];

for (const test of tests) {
    test();
}