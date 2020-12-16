
export const ErrorCode = Object.freeze({
    UNEXPECTED_TOKEN: 'Unexpected token',
    ID_NOT_FOUND: 'Identifier not found',
    DUPLICATE_ID: 'Duplicate id found',
})

export class AbstractError extends Error {
    constructor(message, code, token) {
        super();
        this.message = `${this.constructor.name}: ${message}`;
        this.code = code;
        this.token = token;
    }
}

export class LexerError extends AbstractError {
}

export class ParserError extends AbstractError {
}

export class SemanticError extends AbstractError {
}