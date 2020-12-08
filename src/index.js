"use strict";

const TOKEN_TYPE_EOF = 'EOF';
const TOKEN_TYPE_NUMBER = 'NUMBER';
const TOKEN_TYPE_PLUS = 'PLUS';
const TOKEN_TYPE_MINUS = 'MINUS';
const TOKEN_TYPE_MUL = 'MUL';
const TOKEN_TYPE_DIV = 'DIV';
const TOKEN_TYPE_LPAR = 'LPAR';
const TOKEN_TYPE_RPAR = 'RPAR';
const TOKEN_TYPE_POW = 'POW';

/**
 * 
 * @param {Token} token 
 * @param {String} type 
 */
function isTokenType(token, type) {
    return token && token.type === type;
}

/**
 * 
 * @param {String|Number} value 
 * @returns {Boolean}
 */
function isNumber(value) {
    return !Number.isNaN(Number.parseInt(value));
}

function finalize (obj) {
    Object.freeze(obj);
    Object.seal(obj);
}

class ASTNode {
    constructor() {}
}

class NumNode extends ASTNode {
    constructor(token) {
        super();
        this.token = token;
        this.value = token.value;
        finalize(this);
    }
}

class BinOpNode extends ASTNode {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.token = this.op = op;
        this.right = right;
        finalize(this);
    }
}

class UnaryOpNode extends ASTNode {
    constructor(op, expr) {
        super();
        this.token = this.op = op;
        this.expr = expr;
        finalize(this);
    }
}

class Token {
    constructor(type, value) {
        this.type = type;
        this._value = value;
        finalize(this);
    }

    get value() {
        // console.log(this._value);
        return this._value;
    }
}

class Lexer {
    /**
     * 
     * @param {string} text 
     */
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.currentToken = this._getToken();
    }

    get currentChar() {
        if (this.pos >= this.text.length) {
            return null;
        }
        return this.text[this.pos];
    }

    advance() {
        if (this.pos < this.text.length) {
            this.pos++;
        }
    }

    unadvance() {
        if (this.pos > 0) {
            this.pos--;
        }
    }

    skipWhiteSpace() {
        while(this.currentChar === ' ') {
            this.advance();
        }
    }

    number() {
        const isCurrentCharNumber = () => isNumber(this.currentChar);
        if (!isCurrentCharNumber()) {
            return null;
        }
        let number = '';
        while (isCurrentCharNumber()) {
            number += this.currentChar;
            this.advance();
        }
        this.unadvance();
        return Number.parseInt(number);
    }

    _getToken() {
        this.skipWhiteSpace();

        if (this.currentChar === null) {
            return new Token(TOKEN_TYPE_EOF, null);
        }
        if (this.currentChar === '+') {
            return new Token(TOKEN_TYPE_PLUS, '+');
        }
        if (this.currentChar === '-') {
            return new Token(TOKEN_TYPE_MINUS, '-');
        }
        if (this.currentChar === '*') {
            return new Token(TOKEN_TYPE_MUL, '*');
        }
        if (this.currentChar === '/') {
            return new Token(TOKEN_TYPE_DIV, '/');
        }
        if (this.currentChar === '(') {
            return new Token(TOKEN_TYPE_LPAR, '(');
        }
        if (this.currentChar === ')') {
            return new Token(TOKEN_TYPE_RPAR, ')');
        }
        if (this.currentChar === '^') {
            return new Token(TOKEN_TYPE_POW, '^');
        }
        if (isNumber(this.currentChar)) {
            return new Token(TOKEN_TYPE_NUMBER, this.number());
        }
        this._error();
    }

    getNextToken() {
        this.advance();
        this.currentToken = this._getToken();
        return this.currentToken;
    }

    isCurrentTokenType(type) {
        return isTokenType(this.currentToken, type);
    }

    _error() {
        throw new Error('Syntax error: Unrecognizeable character!');
    }
}

export class Parser {
    /**
     * 
     * @param {String} text
     */
    constructor(text) {
        this.lexer = new Lexer(text);
    }

    eat(tokenType) {
        if (!this.lexer.isCurrentTokenType(tokenType)) {
            this._error();
        }
        const res = this.lexer.currentToken;
        this.lexer.getNextToken();
        return res;
    }

    atom() {
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_PLUS)) {
            return new UnaryOpNode(this.eat(TOKEN_TYPE_PLUS), this.atom());
        }
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_MINUS)) {
            return new UnaryOpNode(this.eat(TOKEN_TYPE_MINUS), this.atom());
        }
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_NUMBER)) {
            return new NumNode(this.eat(TOKEN_TYPE_NUMBER));
        }
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_LPAR)) {
            let node = null;
            
            this.eat(TOKEN_TYPE_LPAR);
            node = this.addTerm();
            this.eat(TOKEN_TYPE_RPAR);

            return node;
        }
        this._error();
    }

    powTerm() {
        let node = this.atom();
        
        while (this.lexer.isCurrentTokenType(TOKEN_TYPE_POW)) {
            node = new BinOpNode(node, this.eat(TOKEN_TYPE_POW), this.powTerm());
        }
        return node;
    }

    mulTerm() {
        let node = this.powTerm();

        const isM = () => this.lexer.isCurrentTokenType(TOKEN_TYPE_MUL);
        const isD = () => this.lexer.isCurrentTokenType(TOKEN_TYPE_DIV);
        while (isM() || isD()) {
            if (isM()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_MUL), this.powTerm());
                continue;
            }
            if (isD()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_DIV), this.powTerm());
                continue;
            }
            this._error();
        }
        return node;
    }

    addTerm() {
        let node = this.mulTerm();

        const isM = () => this.lexer.isCurrentTokenType(TOKEN_TYPE_MINUS);
        const isP = () => this.lexer.isCurrentTokenType(TOKEN_TYPE_PLUS);
        while (isM() || isP()) {
            if (isM()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_MINUS), this.mulTerm());
                continue;
            }
            if (isP()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_PLUS), this.mulTerm());
                continue;
            }
            this._error();
        }
        return node;
    }

    parse() {
        return this.addTerm();
    }
    _error() {
        throw new Error('Syntax error!');
    }
}

class NodeVisitor {
    /**
     * @param {ASTNode} node 
     */
    visit(node) {
        const nodeName = (node.constructor || {}).name;
        const fnName = `visit${nodeName}`
        if (typeof this[fnName] !== 'function') {
            return this.defaultVisitor(node);
        }
        return this[fnName](node);
    }
    defaultVisitor(node) {
        throw new Error('Undefined node visitor!');
    }
}

export class EvalInterpreter extends NodeVisitor {
    /**
     * 
     * @param {Parser} parser 
     */
    constructor (parser) {
        super();
        this.parser = parser;
    }

    /**
     * 
     * @param {BinOpNode} node 
     */
    visitBinOpNode(node) {
        if (isTokenType(node.op, TOKEN_TYPE_PLUS)) {
            return this.visit(node.left) + this.visit(node.right);
        }
        if (isTokenType(node.op, TOKEN_TYPE_MINUS)) {
            return this.visit(node.left) - this.visit(node.right);
        }
        if (isTokenType(node.op, TOKEN_TYPE_MUL)) {
            return this.visit(node.left) * this.visit(node.right);
        }
        if (isTokenType(node.op, TOKEN_TYPE_DIV)) {
            return Math.floor(this.visit(node.left) / this.visit(node.right));
        }
        if (isTokenType(node.op, TOKEN_TYPE_POW)) {
            return this.visit(node.left) ** this.visit(node.right);
        }
        this._error();
    }

    /**
     * 
     * @param {UnaryOpNode} node 
     */
    visitUnaryOpNode(node) {
        if (isTokenType(node.op, TOKEN_TYPE_MINUS)) {
            return this.visit(node.expr) * -1;
        }
        return this.visit(node.expr);
    }

    /**
     * @param {NumNode} node 
     */
    visitNumNode(node) {
        return node.value;
    }

    eval() {
        const genNode = this.parser.parse();
        return this.visit(genNode);
    }

    _error() {
        throw new Error('General error!');
    }
}