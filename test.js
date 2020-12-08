import { Lexer, Parser, Interpreter } from './src/index.js';

function instantiateInterpreter(program) {
    const lexer = new Lexer(program);
    const parser = new Parser(lexer);
    const interpreter = new Interpreter(parser);
    return interpreter
}


test('Test simple Pascal statements', function () {
    const program = `BEGIN
BEGIN
    number := 2;
    a := number;
    b := 10 * a + 10 * number / 4;
    c := a - - b
END;
x := 11;
END.`;
    const interpreter = instantiateInterpreter(program);
    interpreter.eval();
    expect(interpreter.getGlobalNamespace()).toStrictEqual({
        NUMBER: 2,
        A: 2,
        B: 25,
        C: 27,
        X: 11,
    });
});

test('Test simple Pascal statements case insensivity', function () {
    const program = `BEGIN

    BEGIN
        number := 2;
        a := NumBer;
        B := 10 * a + 10 * NUMBER / 4;
        c := a - - b
    end;

    x := 11;
END.`;
    const interpreter = instantiateInterpreter(program);
    interpreter.eval();
    expect(interpreter.getGlobalNamespace()).toStrictEqual({
        NUMBER: 2,
        A: 2,
        B: 25,
        C: 27,
        X: 11,
    })
})

test('Test variable starts with \'_\'', function () {
    const program = `BEGIN

    BEGIN
        _number := 2;
        a := _number;
    end;
END.`;
    const interpreter = instantiateInterpreter(program);
    interpreter.eval();
    expect(interpreter.getGlobalNamespace()).toStrictEqual({
        _NUMBER: 2,
        A: 2,
    })
});


test('Test unterminated scope', function () {
    const program = `BEGIN BEGIN END.`;
    const interpreter = instantiateInterpreter(program);
    expect(() => interpreter.eval()).toThrow();
});
test('Test empty program', function () {
    const program = `BEGIN END.`;
    const interpreter = instantiateInterpreter(program);
    expect(() => interpreter.eval()).not.toThrow();
});