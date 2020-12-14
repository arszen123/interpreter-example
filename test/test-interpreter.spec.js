import { Lexer, Parser, Interpreter } from '../src/index.js';

function instantiateInterpreter(program) {
    const lexer = new Lexer(program);
    const parser = new Parser(lexer);
    const interpreter = new Interpreter(parser);
    return interpreter
}


test('Test simple Pascal statements', function () {
    const program = `PROGRAM Prog1;
BEGIN
BEGIN
    number := 2;
    a := number;
    b := 10 * a + 10 * number div 4;
    c := a - - b
END;
x := 11;
y := x / 0.5
END.`;
    const interpreter = instantiateInterpreter(program);
    interpreter.eval();
    expect(interpreter.getGlobalNamespace()).toStrictEqual({
        NUMBER: 2,
        A: 2,
        B: 25,
        C: 27,
        X: 11,
        Y: 22,
    });
});

test('Test simple Pascal statements case insensivity', function () {
    const program = `PROGRAM Prog1;
    BEGIN

    BEGIN
        number := 2;
        a := NumBer;
        B := 10 * a + 10 * NUMBER DiV 4;
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
    const program = `PROGRAM Prog1;
    BEGIN

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
    const program = `PROGRAM Prog1; BEGIN BEGIN END.`;
    const interpreter = instantiateInterpreter(program);
    expect(() => interpreter.eval()).toThrow();
});
test('Test empty program', function () {
    const program = `PROGRAM Prog1; BEGIN END.`;
    const interpreter = instantiateInterpreter(program);
    expect(() => interpreter.eval()).not.toThrow();
});

test('Test declaration and comments', function () {
    const program = `PROGRAM Part10;
    VAR
       number     : INTEGER;
       a, b, c, x : INTEGER;
       y          : REAL;
    
    BEGIN {Part10}
       BEGIN
          number := 2;
          a := number;
          b := 10 * a + 10 * number DIV 4;
          c := a - - b
       END;
       x := 11;z:=1;v:=3;
       { writeln('a = ', a); }
       { writeln('b = ', b); }
       { writeln('c = ', c); }
       { writeln('number = ', number); }
       { writeln('x = ', x); }y := 20 / 7 + 3.14;{ writeln('y = ', y); }
    END.  {Part10}`;
    const interpreter = instantiateInterpreter(program);
    expect(() => interpreter.eval()).not.toThrow();
    expect(interpreter.getGlobalNamespace()).toMatchObject({
        NUMBER: 2,
        A: 2,
        B: 25,
        C: 27,
        X: 11,
        Z: 1,
        V: 3,
    });
    const y = 20 / 7 + 3.14;
    expect(interpreter.getGlobalNamespace().Y).toBeGreaterThan(Math.floor(y));
    expect(interpreter.getGlobalNamespace().Y).toBeLessThan(Math.ceil(y));
})