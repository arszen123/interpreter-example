
import { finalize } from './helper.js';

export const TOKEN_TYPE_EOF = 'EOF';
export const TOKEN_TYPE_INTEGER_CONST = 'INTEGER_CONST';
export const TOKEN_TYPE_REAL_CONST = 'REAL_CONST';
export const TOKEN_TYPE_PLUS = 'PLUS';
export const TOKEN_TYPE_MINUS = 'MINUS';
export const TOKEN_TYPE_MUL = 'MUL';
export const TOKEN_TYPE_DIV = 'DIV';
export const TOKEN_TYPE_FLOAT_DIV = 'FLOAT_DIV';
export const TOKEN_TYPE_LPAR = 'LPAR';
export const TOKEN_TYPE_RPAR = 'RPAR';
export const TOKEN_TYPE_POW = 'POW';
export const TOKEN_TYPE_BEGIN = 'BEGIN';
export const TOKEN_TYPE_END = 'END';
export const TOKEN_TYPE_SEMI = 'SEMI';
export const TOKEN_TYPE_DOT = 'DOT';
export const TOKEN_TYPE_ASSIGN = 'ASSIGN';
export const TOKEN_TYPE_ID = 'ID';
export const TOKEN_TYPE_PROGRAM = 'PROGRAM';
export const TOKEN_TYPE_VAR = 'VAR';
export const TOKEN_TYPE_INTEGER = 'INTEGER';
export const TOKEN_TYPE_REAL = 'REAL';
export const TOKEN_TYPE_COMMA = 'COMMA';
export const TOKEN_TYPE_COLON = 'COLON';
export const TOKEN_TYPE_PROCEDURE = 'PROCEDURE';

export const TokenType = Object.freeze({
    // single char
    [TOKEN_TYPE_PLUS]: '+',
    [TOKEN_TYPE_MINUS]: '-',
    [TOKEN_TYPE_MUL]: '*',
    [TOKEN_TYPE_FLOAT_DIV]: '/',
    [TOKEN_TYPE_LPAR]: '(',
    [TOKEN_TYPE_RPAR]: ')',
    [TOKEN_TYPE_POW]: '^',
    [TOKEN_TYPE_SEMI]: ';',
    [TOKEN_TYPE_DOT]: '.',
    [TOKEN_TYPE_COMMA]: ',',
    [TOKEN_TYPE_COLON]: ':',
    // reserved
    [TOKEN_TYPE_BEGIN]: 'BEGIN',
    [TOKEN_TYPE_PROGRAM]: 'PROGRAM',
    [TOKEN_TYPE_VAR]: 'VAR',
    [TOKEN_TYPE_INTEGER]: 'INTEGER',
    [TOKEN_TYPE_REAL]: 'REAL',
    [TOKEN_TYPE_PROCEDURE]: 'PROCEDURE',
    [TOKEN_TYPE_DIV]: 'DIV',
    [TOKEN_TYPE_END]: 'END',
    // misc
    [TOKEN_TYPE_EOF]: 'EOF',
    [TOKEN_TYPE_INTEGER_CONST]: 'INTEGER_CONST',
    [TOKEN_TYPE_REAL_CONST]: 'REAL_CONST',
    [TOKEN_TYPE_ASSIGN]: ':=',
    [TOKEN_TYPE_ID]: 'ID',
    get: (tokenType) => TokenType[tokenType],
    find: (value) => Object.keys(TokenType).find((type) => TokenType.get(type) === value),
})

export class Token {
    /**
     * 
     * @param {String} type 
     * @param {String} value 
     * @param {Object} [positionInfo]
     * @param {Number} positionInfo.lineno
     * @param {Number} positionInfo.column
     */
    constructor(type, value, positionInfo) {
        this.type = type;
        this._value = value;
        this._positionInfo = positionInfo;
        finalize(this);
    }

    get value() {
        return this._value;
    }

    toString() {
        let positionInfoText = '';
        if (this._positionInfo) {
            positionInfoText = `, position=${this._positionInfo.lineno}:${this._positionInfo.column}`;
        }
        return `Token(${this.type}, ${this.value}${positionInfoText})`;
    }
}