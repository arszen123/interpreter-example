
import { finalize } from './helper.js';

const TOKEN_TYPE_EOF = 'EOF';
const TOKEN_TYPE_INTEGER_CONST = 'INTEGER_CONST';
const TOKEN_TYPE_REAL_CONST = 'REAL_CONST';
const TOKEN_TYPE_PLUS = 'PLUS';
const TOKEN_TYPE_MINUS = 'MINUS';
const TOKEN_TYPE_MUL = 'MUL';
const TOKEN_TYPE_DIV = 'DIV';
const TOKEN_TYPE_FLOAT_DIV = 'FLOAT_DIV';
const TOKEN_TYPE_LPAR = 'LPAR';
const TOKEN_TYPE_RPAR = 'RPAR';
const TOKEN_TYPE_POW = 'POW';
const TOKEN_TYPE_BEGIN = 'BEGIN';
const TOKEN_TYPE_END = 'END';
const TOKEN_TYPE_SEMI = 'SEMI';
const TOKEN_TYPE_DOT = 'DOT';
const TOKEN_TYPE_ASSIGN = 'ASSIGN';
const TOKEN_TYPE_ID = 'ID';
const TOKEN_TYPE_PROGRAM = 'PROGRAM';
const TOKEN_TYPE_VAR = 'VAR';
const TOKEN_TYPE_INTEGER = 'INTEGER';
const TOKEN_TYPE_BOOLEAN = 'BOOLEAN';
const TOKEN_TYPE_REAL = 'REAL';
const TOKEN_TYPE_COMMA = 'COMMA';
const TOKEN_TYPE_COLON = 'COLON';
const TOKEN_TYPE_PROCEDURE = 'PROCEDURE';
const TOKEN_TYPE_LT = 'LT';
const TOKEN_TYPE_LTE = 'LTE';
const TOKEN_TYPE_GT = 'GT';
const TOKEN_TYPE_GTE = 'GTE';
const TOKEN_TYPE_EQ = 'EQ';
const TOKEN_TYPE_NEQ = 'NEQ';
const TOKEN_TYPE_AND = 'AND';
const TOKEN_TYPE_NOT = 'NOT';
const TOKEN_TYPE_OR = 'OR';
const TOKEN_TYPE_XOR = 'XOR';
const TOKEN_TYPE_IF = 'IF';
const TOKEN_TYPE_THEN = 'THEN';
const TOKEN_TYPE_ELSE = 'ELSE';
const TOKEN_TYPE_TRUE = 'TRUE';
const TOKEN_TYPE_FALSE = 'FALSE';

const TokenValues = Object.freeze({
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
    [TOKEN_TYPE_BOOLEAN]: 'BOOLEAN',
    [TOKEN_TYPE_REAL]: 'REAL',
    [TOKEN_TYPE_PROCEDURE]: 'PROCEDURE',
    [TOKEN_TYPE_DIV]: 'DIV',
    [TOKEN_TYPE_AND]: 'AND',
    [TOKEN_TYPE_NOT]: 'NOT',
    [TOKEN_TYPE_OR]: 'OR',
    [TOKEN_TYPE_XOR]: 'XOR',
    [TOKEN_TYPE_IF]: 'IF',
    [TOKEN_TYPE_THEN]: 'THEN',
    [TOKEN_TYPE_ELSE]: 'ELSE',
    [TOKEN_TYPE_TRUE]: 'TRUE',
    [TOKEN_TYPE_FALSE]: 'FALSE',
    [TOKEN_TYPE_END]: 'END',
    // comparison operators
    [TOKEN_TYPE_LT]: '<',
    [TOKEN_TYPE_LTE]: '<=',
    [TOKEN_TYPE_GT]: '>',
    [TOKEN_TYPE_GTE]: '>=',
    [TOKEN_TYPE_EQ]: '=',
    [TOKEN_TYPE_NEQ]: '<>',
    // misc
    [TOKEN_TYPE_EOF]: 'EOF',
    [TOKEN_TYPE_INTEGER_CONST]: 'INTEGER_CONST',
    [TOKEN_TYPE_REAL_CONST]: 'REAL_CONST',
    [TOKEN_TYPE_ASSIGN]: ':=',
    [TOKEN_TYPE_ID]: 'ID',
    get(tokenType) {
        return this[tokenType];
    },
    find(value) {
        return Object.keys(this).find((type) => this.get(type) === value);
    },
})

export const TokenType = Object.freeze({
    // single char
    [TOKEN_TYPE_PLUS]: TOKEN_TYPE_PLUS,
    [TOKEN_TYPE_MINUS]: TOKEN_TYPE_MINUS,
    [TOKEN_TYPE_MUL]: TOKEN_TYPE_MUL,
    [TOKEN_TYPE_FLOAT_DIV]: TOKEN_TYPE_FLOAT_DIV,
    [TOKEN_TYPE_LPAR]: TOKEN_TYPE_LPAR,
    [TOKEN_TYPE_RPAR]: TOKEN_TYPE_RPAR,
    [TOKEN_TYPE_POW]: TOKEN_TYPE_POW,
    [TOKEN_TYPE_SEMI]: TOKEN_TYPE_SEMI,
    [TOKEN_TYPE_DOT]: TOKEN_TYPE_DOT,
    [TOKEN_TYPE_COMMA]: TOKEN_TYPE_COMMA,
    [TOKEN_TYPE_COLON]: TOKEN_TYPE_COLON,
    // reserved
    [TOKEN_TYPE_BEGIN]: TOKEN_TYPE_BEGIN,
    [TOKEN_TYPE_PROGRAM]: TOKEN_TYPE_PROGRAM,
    [TOKEN_TYPE_VAR]: TOKEN_TYPE_VAR,
    [TOKEN_TYPE_INTEGER]: TOKEN_TYPE_INTEGER,
    [TOKEN_TYPE_BOOLEAN]: TOKEN_TYPE_BOOLEAN,
    [TOKEN_TYPE_REAL]: TOKEN_TYPE_REAL,
    [TOKEN_TYPE_PROCEDURE]: TOKEN_TYPE_PROCEDURE,
    [TOKEN_TYPE_DIV]: TOKEN_TYPE_DIV,
    [TOKEN_TYPE_AND]: TOKEN_TYPE_AND,
    [TOKEN_TYPE_NOT]: TOKEN_TYPE_NOT,
    [TOKEN_TYPE_OR]: TOKEN_TYPE_OR,
    [TOKEN_TYPE_XOR]: TOKEN_TYPE_XOR,
    [TOKEN_TYPE_IF]: TOKEN_TYPE_IF,
    [TOKEN_TYPE_THEN]: TOKEN_TYPE_THEN,
    [TOKEN_TYPE_ELSE]: TOKEN_TYPE_ELSE,
    [TOKEN_TYPE_TRUE]: TOKEN_TYPE_TRUE,
    [TOKEN_TYPE_FALSE]: TOKEN_TYPE_FALSE,
    [TOKEN_TYPE_END]: TOKEN_TYPE_END,
    // comparison operators
    [TOKEN_TYPE_LT]: TOKEN_TYPE_LT,
    [TOKEN_TYPE_LTE]: TOKEN_TYPE_LTE,
    [TOKEN_TYPE_GT]: TOKEN_TYPE_GT,
    [TOKEN_TYPE_GTE]: TOKEN_TYPE_GTE,
    [TOKEN_TYPE_EQ]: TOKEN_TYPE_EQ,
    [TOKEN_TYPE_NEQ]: TOKEN_TYPE_NEQ,
    // misc
    [TOKEN_TYPE_EOF]: TOKEN_TYPE_EOF,
    [TOKEN_TYPE_INTEGER_CONST]: TOKEN_TYPE_INTEGER_CONST,
    [TOKEN_TYPE_REAL_CONST]: TOKEN_TYPE_REAL_CONST,
    [TOKEN_TYPE_ASSIGN]: TOKEN_TYPE_ASSIGN,
    [TOKEN_TYPE_ID]: TOKEN_TYPE_ID,
    getValue: (tokenType) => TokenValues.get(tokenType),
    findByValue: (value) => TokenValues.find(value),
    slice: (start, end) => {
        let doPush = false;
        const res = {};
        for (const key in TokenType) {
            const val = TokenType[key];
            doPush = doPush || start === val;
            if (doPush) {
                res[key] = val;
            }
            if (end === val) {
                break;
            }
        }
        return res;
    },
    only: (keys) => {
        const res = {};
        for (const key in TokenType) {
            if (keys.includes(key)) {
                res[key] = TokenType[key];
            }
        }
        return res;
    },
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