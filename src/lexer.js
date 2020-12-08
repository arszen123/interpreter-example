import {isWhiteSpace, isNumber, isAlpha, isAlphaNum, isTokenType} from './helper.js';
import {
    Token,
    TOKEN_TYPE_EOF,
    TOKEN_TYPE_NUMBER,
    TOKEN_TYPE_PLUS,
    TOKEN_TYPE_MINUS,
    TOKEN_TYPE_MUL,
    TOKEN_TYPE_DIV,
    TOKEN_TYPE_LPAR,
    TOKEN_TYPE_RPAR,
    TOKEN_TYPE_POW,
    TOKEN_TYPE_BEGIN,
    TOKEN_TYPE_END,
    TOKEN_TYPE_SEMI,
    TOKEN_TYPE_DOT,
    TOKEN_TYPE_ASSIGN,
    TOKEN_TYPE_ID,
} from './token.js';


const RESERVED_KEYWORDS = {
    'BEGIN': new Token(TOKEN_TYPE_BEGIN, 'BEGIN'),
    'END': new Token(TOKEN_TYPE_END, 'END'),
}

export class Lexer {
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

    peak(idx) {
        idx = idx || 0;
        const index = this.pos + (idx <= 1 ? 1 : idx);
        if (this.text.length <= index) {
            return null;
        }
        return this.text[index];
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
        while(isWhiteSpace(this.currentChar)) {
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
        if (this.currentChar === ';') {
            return new Token(TOKEN_TYPE_SEMI, ';');
        }
        if (this.currentChar === '.') {
            return new Token(TOKEN_TYPE_DOT, '.');
        }
        if (isNumber(this.currentChar)) {
            return new Token(TOKEN_TYPE_NUMBER, this.number());
        }
        if (this.currentChar === ':' && this.peak() === '=') {
            this.advance();
            return new Token(TOKEN_TYPE_ASSIGN, ':=');
        }
        if (isAlpha(this.currentChar)) {
            return this._id();
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

    _id() {
        let name = '';
        while (isAlphaNum(this.currentChar)) {
            name += this.currentChar;
            this.advance();
        }
        this.unadvance();
        name = name.toUpperCase();
        let res = RESERVED_KEYWORDS[name];
        if (typeof res === 'undefined') {
            res = RESERVED_KEYWORDS[name] = new Token(TOKEN_TYPE_ID, name);
        }
        return res;
    }

    _error() {
        throw new Error(`Syntax error: Unrecognizeable character "${this.currentChar}" at position ${this.pos}!`);
    }
}