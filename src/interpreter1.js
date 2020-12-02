
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

class Token {
    constructor (type, value) {
        this.type = type;
        this.value = value;
        Object.freeze(this);
        Object.seal(this);
    }
}

export class Interpreter {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.currentToken = null;
    }

    get currentChar() {
        if (this.pos >= this.text.length) {
            // EOF;
            return null;
        }
        return this.text[this.pos];
    }

    number() {
        let number = '';
        if (!isNumber(this.currentChar)) {
            return null;
        }
        do {
            number += this.currentChar;
            this.pos++;
        } while (isNumber(this.currentChar));
        this.pos--;
        return Number.parseInt(number);
    }

    getNextToken() {

        const char = this.currentChar;

        if (char === null) {
            return new Token(TOKEN_TYPE_EOF, null);
        }
        const getToken = () => {
            if (isNumber(this.currentChar)) {
                return new Token(TOKEN_TYPE_NUMBER, this.number());
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
            if (char === ' ') {
                return new Token(TOKEN_TYPE_WHITESPACE, ' ');
            }
            return null;
        }

        const token = getToken();
        if (token === null) {
            this._error();
        }
        this.pos++;
        return token;
    }

    isCurrentTokenType(tokenType) {
        return isTokenType(this.currentToken, tokenType);
    }

    next() {
        this.currentToken = this.getNextToken();
        //console.log(this.currentToken);
    }

    nextNotWhitespace() {
        this.next();
        while (this.isCurrentTokenType(TOKEN_TYPE_WHITESPACE)) {
            this.next();
        }
    }

    eat(tokenType) {

        while (this.isCurrentTokenType(TOKEN_TYPE_WHITESPACE)) {
            this.next();
        }

        if (this.isCurrentTokenType(tokenType)) {
            return;
        }

        this._error();

    }

    /**
     * Evaluate expression, and return the stream of tokens as array.
     */
    getExprTokenList() {
        const tokens = [];
        this.nextNotWhitespace();

        this.eat(TOKEN_TYPE_NUMBER);
        tokens.push(this.currentToken);
        
        this.nextNotWhitespace();
        while (!this.isCurrentTokenType(TOKEN_TYPE_EOF)) {
            if (this.isCurrentTokenType(TOKEN_TYPE_MINUS)) {
                this.eat(TOKEN_TYPE_MINUS);
            } else if (this.isCurrentTokenType(TOKEN_TYPE_MINUS)) {
                this.eat(TOKEN_TYPE_MINUS);
            } else if (this.isCurrentTokenType(TOKEN_TYPE_MUL)) {
                this.eat(TOKEN_TYPE_MUL);
            } else if (this.isCurrentTokenType(TOKEN_TYPE_DIV)) {
                this.eat(TOKEN_TYPE_DIV);
            }
            tokens.push(this.currentToken);

            this.nextNotWhitespace();
            
            this.eat(TOKEN_TYPE_NUMBER);
            tokens.push(this.currentToken);

            this.nextNotWhitespace();
        }
        return tokens;
    }

    eval() {
        return this._eval2();
    }

    _eval1() {
        const tokens = this.getExprTokenList();
        const newTokens = [];

        // First evaluating MUL, DIV
        for (let i = 0; i < tokens.length; i++) {
            if (isTokenType(tokens[i], TOKEN_TYPE_DIV)) {
                newTokens[newTokens.length - 1] = new Token(TOKEN_TYPE_NUMBER, Math.floor(newTokens[newTokens.length - 1].value / tokens[++i].value));
            } else if (isTokenType(tokens[i], TOKEN_TYPE_MUL)) {
                newTokens[newTokens.length - 1] = new Token(TOKEN_TYPE_NUMBER, newTokens[newTokens.length - 1].value * tokens[++i].value);
            } else {
                newTokens.push(tokens[i]);
            }
        }

        let mul = 1;
        let value = 0;
        // Evaluation PLUS MINUS
        for (const token of newTokens) {
            if (isTokenType(token, TOKEN_TYPE_PLUS)) {
                mul = 1;
            } else if (isTokenType(token, TOKEN_TYPE_MINUS)) {
                mul = -1;
            } else {
                value += token.value * mul;
            }
        }

        return value;
    }

    _eval2() {
        // get tokens list.
        const tokens = this.getExprTokenList();

        // transform token list
        // grouping MULL, DIV, so it's evaluation will be higher then PLUS, MINUS
        const newTokens = [];
        for (let i = 0; i < tokens.length; i++) {
            if (isTokenType(tokens[i], TOKEN_TYPE_DIV) || isTokenType(tokens[i], TOKEN_TYPE_MUL)) {
                const lastToken = newTokens.pop();
                newTokens.push(new Token(TOKEN_TYPE_GROUP, [
                    lastToken,
                    tokens[i],
                    tokens[++i]
                ]));
            } else {
                newTokens.push(tokens[i]);
            }
        }

        const evalRec = function (tokens) {
            const getTokenValue = (token) => isTokenType(token, TOKEN_TYPE_GROUP) ? evalRec(token.value) : token.value;
            let val = 0;
            let mul = 1;
            let prevToken = null;
            for (const token of tokens) {
                if (isTokenType(token, TOKEN_TYPE_MINUS)) {
                    mul = -1;
                } else if (isTokenType(token, TOKEN_TYPE_PLUS)) {
                    mul = 1;
                } else if (isTokenType(token, TOKEN_TYPE_GROUP) || isTokenType(token, TOKEN_TYPE_NUMBER)) {
                    if (isTokenType(prevToken, TOKEN_TYPE_MUL)) {
                        val *= getTokenValue(token) * mul;
                    } else if (isTokenType(prevToken, TOKEN_TYPE_DIV)) {
                        val /= getTokenValue(token) * mul;
                        val = Math.floor(val);
                    } else {
                        val += getTokenValue(token) * mul;
                    }
                }
                prevToken = token;
            }
            return val;
        }

        return evalRec(newTokens);
    }

    _error() {
        throw new Error('Interpreter error!');
    }

}