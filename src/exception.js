
export const ErrorCode = Object.freeze({
    UNEXPECTED_TOKEN: 'Unexpected token',
    ID_NOT_FOUND: 'Identifier not found',
    DUPLICATE_ID: 'Duplicate id found',
    PROCEDURE_NOT_FOUND: 'Procedure not found',
    OPERATION_TYPE_MISMATCH: 'Operation type mismatch',
    WRONG_FUNCTION_PARAMETER_LIST: 'Wrong function parameter list',
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