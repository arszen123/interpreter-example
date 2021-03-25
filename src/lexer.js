import {isWhiteSpace, isNumber, isAlpha, isAlphaNum, isTokenType} from './helper.js';
import {
    Token,
    TokenType,
} from './token.js';
import { LexerError } from './exception.js';
import { CircularBuffer } from './utils.js';

const COMMENT_START_CHAR = '{';
const COMMENT_END_CHAR = '}';
const FLOAT_SEPARATOR = '.';
const NEW_LINE = '\n';

function createReservedKeywords() {
    const tokenTypes = TokenType.slice(TokenType.BEGIN, TokenType.END);
    const res = {};
    for (const key in tokenTypes) {
        const tokenType = tokenTypes[key];
        const val = TokenType.getValue(tokenType);
        res[val] = new Token(tokenType, val);
    }
    return res;
}

const RESERVED_KEYWORDS = createReservedKeywords();

export class Lexer {
    /**
     * 
     * @param {string} text 
     */
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.lineno = 1;
        this.column = 1;
        this.tokenBuffer = new CircularBuffer(2);
        this._initBuffer();
    }

    _initBuffer() {
        this.tokenBuffer.put(this._getToken());
        this.nextToken();
    }

    get currentChar() {
        if (this.pos >= this.text.length) {
            return null;
        }
        return this.text[this.pos];
    }

    get currentToken() {
        return this.tokenBuffer.peek();
    }

    peek(idx) {
        idx = idx || 0;
        const index = this.pos + (idx <= 1 ? 1 : idx);
        if (this.text.length <= index) {
            return null;
        }
        return this.text[index];
    }

    advance() {
        if (this.pos < this.text.length) {
            if (this.currentChar === NEW_LINE) {
                this.lineno++;
                this.column = 1;
            } else {
                this.column++;
            }
            this.pos++;
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

    _number(tokenPosition) {
        if (!isNumber(this.currentChar)) {
            return null;
        }
        const parseNum = () => {
            let res = '';
            while (isNumber(this.peek())) {
                res += this.peek();
                this.advance();
            }
            return res;
        }
        let tokenType = TokenType.INTEGER_CONST;
        let number = '' + this.currentChar + parseNum();

        if (this.peek() === FLOAT_SEPARATOR) {
            tokenType = TokenType.REAL_CONST;
            this.advance();
            number += '.' + parseNum();
        }

        return new Token(tokenType, Number.parseFloat(number), tokenPosition);
    }

    _getToken() {
        this.skipComment();
        while (isWhiteSpace(this.currentChar)) {
            this.skipWhiteSpace();
            this.skipComment();
        }
        const tokenPosition = {lineno: this.lineno, column: this.column};


        if (this.currentChar === null) {
            return new Token(TokenType.EOF, null, tokenPosition);
        }
        if (this.currentChar === ':' && this.peek() === '=') {
            this.advance();
            return new Token(TokenType.ASSIGN, ':=', tokenPosition);
        }
        if (this.currentChar === '<' && this.peek() === '>') {
            this.advance();
            return new Token(TokenType.NEQ, '<>', tokenPosition);
        }
        if (this.currentChar === '<' && this.peek() === '=') {
            this.advance();
            return new Token(TokenType.GTE, '>=', tokenPosition);
        }
        if (this.currentChar === '>' && this.peek() === '=') {
            this.advance();
            return new Token(TokenType.LTE, '<=', tokenPosition);
        }
        const tokenType = TokenType.findByValue(this.currentChar);
        if (tokenType) {
            return new Token(tokenType, TokenType.getValue(tokenType), tokenPosition);
        }
        if (isNumber(this.currentChar)) {
            return this._number(tokenPosition);
        }
        if (isAlpha(this.currentChar)) {
            return this._id(tokenPosition);
        }
        this._error();
    }

    nextToken() {
        this.advance();
        this.tokenBuffer.put(this._getToken());
    }

    isCurrentTokenType(type) {
        return isTokenType(this.currentToken, type);
    }

    peekToken(num) {
        return this.tokenBuffer.peek(Math.max((num || 0), 0) + 1);
    }

    _id(tokenPosition) {
        if (!isAlphaNum(this.currentChar)) {
            return null;
        }
        let name = '' + this.currentChar;
        while (isAlphaNum(this.peek())) {
            name += this.peek();
            this.advance();
        }
        name = name.toUpperCase();
        let res = RESERVED_KEYWORDS[name];
        if (typeof res === 'undefined') {
            res = RESERVED_KEYWORDS[name] = new Token(TokenType.ID, name);
        }
        return new Token(res.type, res.value, tokenPosition);
    }

    _error() {
        throw new LexerError(`Unrecognizeable character "${this.currentChar}" on line: ${this.lineno} column: ${this.column}!`);
    }
}