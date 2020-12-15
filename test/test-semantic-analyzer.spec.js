import { Lexer, Parser, SemanticAlanyzer } from '../src/index.js';
import { SemanticError } from '../src/exception.js';

function instantiateSemanticAnalyzer(program) {
    const lexer = new Lexer(program);
    const parser = new Parser(lexer);
    return new SemanticAlanyzer(parser);
}

test('Test symbol table builder with undefined variable usage', function () {
    const program = `PROGRAM NameError1;
    VAR
       a : INTEGER;
    
    BEGIN
       a := 2 + b;
    END.`;
    const analyzer = instantiateSemanticAnalyzer(program);
    expect(() => analyzer.eval()).toThrow('Variable "B" is not defined!')
});

test('Test symbol table builder with undefined variable assignment', function () {
    const program = `PROGRAM NameError2;
    VAR
       b : INTEGER;
    
    BEGIN
       b := 1;
       a := b + 2;
    END.`;
    const analyzer = instantiateSemanticAnalyzer(program);
    expect(() => analyzer.eval()).toThrow('Variable "A" is not defined!')
});

test('Test symbol table builder with a valid program', function () {
    const program = `PROGRAM Part11;
    VAR
       x : INTEGER;
    BEGIN
       x := 2;
    END.`;
    const analyzer = instantiateSemanticAnalyzer(program);
    expect(() => analyzer.eval()).not.toThrow();

    const st = analyzer.getCurrentScope();
    expect(st).toBeDefined();
    expect(st.lookup('X')).toBe(null);
    expect(st.lookup('INTEGER')).toBeDefined();
});


test('Test procedure definition', function () {
   const program = `program Main;
   var b, x, y : real;
   var z : integer;

   procedure AlphaA(a : integer);
      var b : integer;

      procedure Beta(c : integer);
         var y : integer;

         procedure Gamma(c : integer);
            var x : integer;
         begin { Gamma }
            x := a + b + c + x + y + z;
         end;  { Gamma }

      begin { Beta }

      end;  { Beta }

   begin { AlphaA }

   end;  { AlphaA }

   procedure AlphaB(a : integer);
      var c : real;
   begin { AlphaB }
      c := a + b;
   end;  { AlphaB }

begin { Main }
end.  { Main }`;
   const analyzer = instantiateSemanticAnalyzer(program);
   expect(() => analyzer.eval()).not.toThrow();
});

test('Test duplicate id', function () {
   const program = `program Main;
   var
      a : integer;
      a : real; { semantic error }
   
   begin { Main }
      a := 5;
   end.  { Main }`;
   const analyzer = instantiateSemanticAnalyzer(program);
   expect(() => analyzer.eval()).toThrow(SemanticError);
})

test('Test id not found', function () {
   const program = `program Main;
   var
      a : integer;
   
   begin { Main }
      a := b;  { semantic error }
   end.  { Main }`;
   const analyzer = instantiateSemanticAnalyzer(program);
   expect(() => analyzer.eval()).toThrow(SemanticError);
})