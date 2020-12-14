import { Lexer, Parser, SymbolTableBuilder } from '../src/index.js';

function instantiateSymbolTableBuilder(program) {
    const lexer = new Lexer(program);
    const parser = new Parser(lexer);
    return new SymbolTableBuilder(parser);
}

test('Test symbol table builder with undefined variable usage', function () {
    const program = `PROGRAM NameError1;
    VAR
       a : INTEGER;
    
    BEGIN
       a := 2 + b;
    END.`;
    const stb = instantiateSymbolTableBuilder(program);
    expect(() => stb.eval()).toThrow('Variable "B" is not defined!')
});

test('Test symbol table builder with undefined variable assignment', function () {
    const program = `PROGRAM NameError2;
    VAR
       b : INTEGER;
    
    BEGIN
       b := 1;
       a := b + 2;
    END.`;
    const stb = instantiateSymbolTableBuilder(program);
    expect(() => stb.eval()).toThrow('Variable "A" is not defined!')
});

test('Test symbol table builder with a valid program', function () {
    const program = `PROGRAM Part11;
    VAR
       x : INTEGER;
    BEGIN
       x := 2;
    END.`;
    const stb = instantiateSymbolTableBuilder(program);
    expect(() => stb.eval()).not.toThrow();

    const st = stb.getSymbolTable();
    expect(st).toBeDefined();
    expect(st.lookup('X')).toBeDefined();
    expect(st.lookup('X').type.name).toEqual('INTEGER');
});