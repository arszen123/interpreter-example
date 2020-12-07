import assert from 'assert';
import { Parser, EvalInterpreter, RPNInterpreter, LISPInterpreter } from './src/interpreter2.js';

function testEval(expr, expected) {
    const i = new LISPInterpreter(new Parser(expr));
    console.table({from: expr,rpn:i.eval(),value: eval(expr)});
    //assert.equal(i.eval(), expected, `${expr} = ${expected}`);
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
    // function () {
    //     const expr = '120 + ';
    //     const i = new Interpreter(expr);
    //     assert.throws(() => i.eval(), 'Invalid expression');
    // },
    // function () {
    //     const expr = '120 ++ 100';
    //     const i = new Interpreter(expr);
    //     assert.throws(() => i.eval(), 'Invalid expression');
    // },
    // function () {
    //     const expr = '120 + + 100';
    //     const i = new Interpreter(expr);
    //     assert.throws(() => i.eval(), 'Invalid expression');
    // },
    function () {
        testEval('120 + 10 * 8 - 100 ', 100);
    },
    function () {
        testEval('120 + 10 * 8 / 10 - 100 ', 28);
    },
    () => testEval('10 *(10 - 2 + 3 + 2 -1)', 120),
    () => testEval('((10))', 10),
    () => testEval('(5 + 3) * 12 / 3', 32),
    () => testEval('(2 + 3 * 5)', 17),
    // function () {
    //     const expr = '120 + (100 + ( 20)';
    //     const i = new Interpreter(expr);
    //     assert.throws(() => i.eval(), 'Invalid expression');
    // },
];

for (const test of tests) {
    test();
}