
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

export class Token {
    constructor(type, value) {
        this.type = type;
        this._value = value;
        finalize(this);
    }

    get value() {
        return this._value;
    }
}