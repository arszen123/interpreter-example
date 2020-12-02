
const TOKEN_TYPE_EOF = 'EOF';
const TOKEN_TYPE_PLUS = 'PLUS';
const TOKEN_TYPE_MINUS = 'MINUS';
const TOKEN_TYPE_WHITESPACE = 'WHITESPACE';
const TOKEN_TYPE_NUMBER = 'NUMBER';
const TOKEN_TYPE_DIV = 'DIV';
const TOKEN_TYPE_MUL = 'MUL';
const TOKEN_TYPE_GROUP = 'GROUP';

function isNumber(value) {
    return !Number.isNaN(Number.parseInt(value));
}

function isTokenType(token, tokenType) {
    return token && token.type === tokenType;
}

function isWhiteSpace(char) {
    return char === ' ';
}

class Token {
    constructor (type, value) {
        this.type = type;
        this.value = value;
        Object.freeze(this);
        Object.seal(this);
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
 * **atom**: NUMBER
 * 
  * @param {Lexer} lexer
  */
export class Interpreter {

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
        const token = this.eat(TOKEN_TYPE_NUMBER);
        return token.value;
    }

    multiplicativeExpression() {
        let value = this.atom();
        const isMul = () => isTokenType(this.lexer.getCurrentToken(), TOKEN_TYPE_MUL);
        const isDiv = () => isTokenType(this.lexer.getCurrentToken(), TOKEN_TYPE_DIV);
        while (isMul() || isDiv()) {
            if (isMul()) {
                this.eat(TOKEN_TYPE_MUL);
                value *= this.atom();
                continue;
            }
            if (isDiv()) {
                this.eat(TOKEN_TYPE_DIV);
                value /= this.atom();
                continue;
            }
        }
        return value;
    }

    additiveExpression() {
        let value = this.multiplicativeExpression();
        const isPlus = () => isTokenType(this.lexer.getCurrentToken(), TOKEN_TYPE_PLUS);
        const isMinus = () => isTokenType(this.lexer.getCurrentToken(), TOKEN_TYPE_MINUS);
        let mul = 1;
        while (isPlus() || isMinus()) {
            if (isPlus()) {
                this.eat(TOKEN_TYPE_PLUS);
                mul = 1;
            }
            if (isMinus()) {
                this.eat(TOKEN_TYPE_MINUS);
                mul = -1;
            }
            value += this.multiplicativeExpression() * mul;
        }
        return value;
    }

    eval() {
        return this.additiveExpression();
    }

}