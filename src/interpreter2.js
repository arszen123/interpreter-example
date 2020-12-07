
const TOKEN_TYPE_EOF = 'EOF';
const TOKEN_TYPE_PLUS = 'PLUS';
const TOKEN_TYPE_MINUS = 'MINUS';
const TOKEN_TYPE_NUMBER = 'NUMBER';
const TOKEN_TYPE_DIV = 'DIV';
const TOKEN_TYPE_MUL = 'MUL';
const TOKEN_TYPE_LPAR = 'LPAR';
const TOKEN_TYPE_RPAR = 'RPAR';

function isNumber(value) {
    return !Number.isNaN(Number.parseInt(value));
}

function isTokenType(token, tokenType) {
    return token && token.type === tokenType;
}

function isWhiteSpace(char) {
    return char === ' ';
}

function finalize(obj) {
    Object.freeze(obj);
    Object.seal(obj);
}

class Token {
    constructor (type, value) {
        this.type = type;
        this.value = value;
        finalize(this);
    }
}

class ASTNode {
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

/**
 * @param {String} text
 * @param {Number} pos
 * @param {Token} currentToken
 */
class Lexer {
    constructor (text) {
        this.text = text;
        this.pos = 0;
        this.currentToken = this._getToken();
    }

    get currentChar() {
        if (this.pos >= this.text.length) {
            // EOF
            return null;
        }
        return this.text[this.pos];
    }

    skipWhitespaces() {
        while (isWhiteSpace(this.currentChar)) {
            this.advance();
        }
    }

    number() {
        let num = '';
        const isCurrentCharrNumber = () => isNumber(this.currentChar);
        if (!isCurrentCharrNumber()) {
            return null;
        }
        while (isCurrentCharrNumber()) {
            num += this.currentChar;
            this.advance();
        }
        this.retreat();
        return Number.parseInt(num);
    }

    advance() {
        if (this.pos < this.text.length) {
            this.pos++;
        }
    }

    retreat() {
        if (this.pos > 0) {
            this.pos--;
        }
    }

    /**
     * @returns {Token}
     */
    getCurrentToken() {
        return this.currentToken;
    }

    /**
     * @returns {Token}
     */
    _getToken() {
        this.skipWhitespaces();
        const char = this.currentChar;
        if (char === null) {
            return new Token(TOKEN_TYPE_EOF, null);
        }
        if (char === '+') {
            return new Token(TOKEN_TYPE_PLUS, '+');
        }
        if (char === '-') {
            return new Token(TOKEN_TYPE_MINUS, '-');
        }
        if (char === '*') {
            return new Token(TOKEN_TYPE_MUL, '*');
        }
        if (char === '/') {
            return new Token(TOKEN_TYPE_DIV, '/');
        }
        if (char === '(') {
            return new Token(TOKEN_TYPE_LPAR, '(');
        }
        if (char === ')') {
            return new Token(TOKEN_TYPE_RPAR, ')');
        }
        if (isNumber(char)) {
            return new Token(TOKEN_TYPE_NUMBER, this.number());
        }
        this._error();
    }

    _error() {
        throw new Error('Invalid syntax');
    }

    next() {
        this.getNextToken();
    }

    /**
     * @returns {Token}
     */
    getNextToken() {
        this.pos++;
        this.currentToken = this._getToken();
        return this.currentToken;
    }
}

/**
 * Precedence dictionary:
 * **additiveExpression**: **multiplicativeExpression**((PLUS|MINUS)**multiplicativeExpression**)*
 * **multiplicativeExpression**: **atom**((MUL|DIV)**atom**)*
 * **atom**: NUMBER|LPAR **additiveExpression** RPAR
 * 
  * @param {Lexer} lexer
  */
export class Parser {

    /**
     * @param {String} text
     */
    constructor(text) {
        this.lexer = new Lexer(text);
    }

    eat(tokenType) {
        if (!isTokenType(this.lexer.getCurrentToken(), tokenType)) {
            throw new Error('Invalid syntax');
        }
        const currentToken = this.lexer.getCurrentToken();
        this.lexer.next();
        return currentToken;
    }

    atom() {
        if (isTokenType(this.lexer.getCurrentToken(), TOKEN_TYPE_NUMBER)) {
            return new NumNode(this.eat(TOKEN_TYPE_NUMBER));
        }
        if (isTokenType(this.lexer.getCurrentToken(), TOKEN_TYPE_LPAR)) {
            let node = null;
            this.eat(TOKEN_TYPE_LPAR);
            node = this.additiveExpression();
            this.eat(TOKEN_TYPE_RPAR);
            return node;
        }
        this._error();
    }

    multiplicativeExpression() {
        let node = this.atom();
        const isMul = () => isTokenType(this.lexer.getCurrentToken(), TOKEN_TYPE_MUL);
        const isDiv = () => isTokenType(this.lexer.getCurrentToken(), TOKEN_TYPE_DIV);
        while (isMul() || isDiv()) {
            if (isMul()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_MUL), this.atom());
                continue;
            }
            if (isDiv()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_DIV), this.atom());
                continue;
            }
            this._error();
        }
        return node;
    }

    additiveExpression() {
        let node = this.multiplicativeExpression();
        const isPlus = () => isTokenType(this.lexer.getCurrentToken(), TOKEN_TYPE_PLUS);
        const isMinus = () => isTokenType(this.lexer.getCurrentToken(), TOKEN_TYPE_MINUS);
        while (isPlus() || isMinus()) {
            if (isPlus()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_PLUS), this.multiplicativeExpression());
                continue;
            }
            if (isMinus()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_MINUS), this.multiplicativeExpression());
                continue;
            }
            this._error();
        }
        return node;
    }

    parse() {
        return this.additiveExpression();
    }

    _error() {
        throw new Error('Syntax error!');
    }

}


function ucFirst(text) {
    if (typeof text === 'string') {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}
class NodeVisitor {
    visit(node) {
        const nodeName = ucFirst((node.constructor || {}).name);
        const methodName = `visit${nodeName}`
        if (typeof this[methodName] === 'undefined') {
            throw new Error(this.constructor.name + '::' + methodName + ' not exists!');
        }
        return this[methodName](node);
    }
}

export class EvalInterpreter extends NodeVisitor {
    /**
     * 
     * @param {Parser} parser 
     */
    constructor(parser) {
        super();
        this.parser = parser;
    }

    visitBinOpNode(node) {
        const opToken = node.op;
        if (isTokenType(opToken, TOKEN_TYPE_PLUS)) {
            return this.visit(node.left) + this.visit(node.right);
        }
        if (isTokenType(opToken, TOKEN_TYPE_MINUS)) {
            return this.visit(node.left) - this.visit(node.right);
        }
        if (isTokenType(opToken, TOKEN_TYPE_MUL)) {
            return this.visit(node.left) * this.visit(node.right);
        }
        if (isTokenType(opToken, TOKEN_TYPE_DIV)) {
            return Math.floor(this.visit(node.left) / this.visit(node.right));
        }
    }

    visitNumNode(node) {
        return node.value;
    }

    eval() {
        const node = this.parser.parse();
        return this.visit(node);
    }
}


export class RPNInterpreter extends NodeVisitor {
    /**
     * 
     * @param {Parser} parser 
     */
    constructor(parser) {
        super();
        this.parser = parser;
    }

    visitBinOpNode(node) {
        const opToken = node.op;
        if (isTokenType(opToken, TOKEN_TYPE_PLUS)) {
            return this.visit(node.left) + ' ' + this.visit(node.right) + ' +';
        }
        if (isTokenType(opToken, TOKEN_TYPE_MINUS)) {
            return this.visit(node.left) + ' ' + this.visit(node.right) + ' -';
        }
        if (isTokenType(opToken, TOKEN_TYPE_MUL)) {
            return this.visit(node.left) + ' ' + this.visit(node.right) + ' *';
        }
        if (isTokenType(opToken, TOKEN_TYPE_DIV)) {
            return this.visit(node.left) + ' ' + this.visit(node.right) + ' /';
        }
    }

    visitNumNode(node) {
        return '' + node.value;
    }

    eval() {
        const node = this.parser.parse();
        return this.visit(node);
    }
}


export class LISPInterpreter extends NodeVisitor {
    /**
     * 
     * @param {Parser} parser 
     */
    constructor(parser) {
        super();
        this.parser = parser;
    }

    visitBinOpNode(node) {
        const opToken = node.op;
        if (isTokenType(opToken, TOKEN_TYPE_PLUS)) {
            return '(+ ' + this.visit(node.left) + ' ' + this.visit(node.right) + ')';
        }
        if (isTokenType(opToken, TOKEN_TYPE_MINUS)) {
            return '(- ' + this.visit(node.left) + ' ' + this.visit(node.right) + ')';
        }
        if (isTokenType(opToken, TOKEN_TYPE_MUL)) {
            return '(* ' + this.visit(node.left) + ' ' + this.visit(node.right) + ')';
        }
        if (isTokenType(opToken, TOKEN_TYPE_DIV)) {
            return '(/ ' + this.visit(node.left) + ' ' + this.visit(node.right) + ')';
        }
    }

    visitNumNode(node) {
        return '' + node.value;
    }

    eval() {
        const node = this.parser.parse();
        return this.visit(node);
    }
}