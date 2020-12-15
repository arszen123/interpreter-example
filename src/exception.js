
class AbstractError extends Error {
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