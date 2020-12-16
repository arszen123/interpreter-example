"use strict";

import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';
import { SemanticAlanyzer } from './semantic-analyzer.js';
import { AbstractError, LexerError, ParserError, SemanticError, ErrorCode } from './exception.js';


/**
 * @param {String} program 
 */
function run(program) {
    const createParser = () => new Parser(new Lexer(program));
    const parser = createParser();
    const tree = parser.parse();
    (new SemanticAlanyzer(tree)).eval();
    (new Interpreter(tree)).eval();
}

export {
    Lexer,
    Parser,
    Interpreter,
    SemanticAlanyzer,
    run,
    AbstractError,
    LexerError,
    ParserError,
    SemanticError,
    ErrorCode,
}