import {isWhiteSpace, isNumber, isAlpha, isAlphaNum, isTokenType} from './helper.js';
import {
    Token,
    TOKEN_TYPE_EOF,
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
    TOKEN_TYPE_PROGRAM,
    TOKEN_TYPE_VAR,
    TOKEN_TYPE_INTEGER,
    TOKEN_TYPE_REAL,
    TOKEN_TYPE_COMMA,
    TOKEN_TYPE_COLON,
    TOKEN_TYPE_INTEGER_CONST,
    TOKEN_TYPE_REAL_CONST,
    TOKEN_TYPE_FLOAT_DIV,
} from './token.js';

const COMMENT_START_CHAR = '{';
const COMMENT_END_CHAR = '}';
const FLOAT_SEPARATOR = '.';

const RESERVED_KEYWORDS = {
    'BEGIN': new Token(TOKEN_TYPE_BEGIN, 'BEGIN'),
    'END': new Token(TOKEN_TYPE_END, 'END'),
    'DIV': new Token(TOKEN_TYPE_DIV, 'DIV'),
    'REAL': new Token(TOKEN_TYPE_REAL, 'REAL'),
    'INTEGER': new Token(TOKEN_TYPE_INTEGER, 'INTEGER'),
    'VAR': new Token(TOKEN_TYPE_VAR, 'VAR'),
    'PROGRAM': new Token(TOKEN_TYPE_PROGRAM, 'PROGRAM'),
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

    skipComment() {
        if (this.currentChar !== COMMENT_START_CHAR) {
            return;
        }
        while (this.currentChar !== COMMENT_END_CHAR) {
            this.advance();
        }
        // one more, to point to the next valid character.
        this.advance();
    }

    _number() {
        const isCurrentCharNumber = () => isNumber(this.currentChar);
        if (!isCurrentCharNumber()) {
            return null;
        }
        let number = '';
        while (isCurrentCharNumber()) {
            number += this.currentChar;
            this.advance();
        }
        let tokenType = TOKEN_TYPE_INTEGER_CONST;
        if (this.currentChar === FLOAT_SEPARATOR) {
            tokenType = TOKEN_TYPE_REAL_CONST;
            number += '.';
            this.advance(); 
            while (isCurrentCharNumber()) {
                number += this.currentChar;
                this.advance();
            }
        }
        this.unadvance();
        return new Token(tokenType, Number.parseFloat(number));
    }

    _getToken() {
        this.skipComment();
        while (isWhiteSpace(this.currentChar)) {
            this.skipWhiteSpace();
            this.skipComment();
        }

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
            return new Token(TOKEN_TYPE_FLOAT_DIV, '/');
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
        if (this.currentChar === ':' && this.peak() === '=') {
            this.advance();
            return new Token(TOKEN_TYPE_ASSIGN, ':=');
        }
        if (this.currentChar === ':') {
            return new Token(TOKEN_TYPE_COLON, ':');
        }
        if (this.currentChar === ',') {
            return new Token(TOKEN_TYPE_COMMA, ',');
        }
        if (isNumber(this.currentChar)) {
            return this._number();
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