"use strict";

import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';
import { SemanticAlanyzer } from './semantic-analyzer.js';

/**
 * @param {String} program 
 */
function run(program) {
    const createParser = () => new Parser(new Lexer(program));
    (new SemanticAlanyzer(createParser())).eval();
    (new Interpreter(createParser())).eval();
}

export {
    Lexer,
    Parser,
    Interpreter,
    SemanticAlanyzer,
    run,
}