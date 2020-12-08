import { Lexer } from './lexer.js';
import { BinOpNode, UnaryOpNode, NumNode, AssignNode, VarNode, CompoundNode, EmptyNode } from './node.js';
import {
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

export class Parser {
    /**
     * 
     * @param {Lexer} lexer
     */
    constructor(lexer) {
        this.lexer = lexer;
    }

    eat(tokenType) {
        if (!this.lexer.isCurrentTokenType(tokenType)) {
            this._error();
        }
        const res = this.lexer.currentToken;
        this.lexer.getNextToken();
        return res;
    }

    atom() {
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_PLUS)) {
            return new UnaryOpNode(this.eat(TOKEN_TYPE_PLUS), this.atom());
        }
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_MINUS)) {
            return new UnaryOpNode(this.eat(TOKEN_TYPE_MINUS), this.atom());
        }
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_NUMBER)) {
            return new NumNode(this.eat(TOKEN_TYPE_NUMBER));
        }
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_LPAR)) {
            let node = null;

            this.eat(TOKEN_TYPE_LPAR);
            node = this.addTerm();
            this.eat(TOKEN_TYPE_RPAR);

            return node;
        }
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_ID)) {
            return this.variable();
        }
        this._error();
    }

    powTerm() {
        let node = this.atom();

        while (this.lexer.isCurrentTokenType(TOKEN_TYPE_POW)) {
            node = new BinOpNode(node, this.eat(TOKEN_TYPE_POW), this.powTerm());
        }
        return node;
    }

    mulTerm() {
        let node = this.powTerm();

        const isM = () => this.lexer.isCurrentTokenType(TOKEN_TYPE_MUL);
        const isD = () => this.lexer.isCurrentTokenType(TOKEN_TYPE_DIV);
        while (isM() || isD()) {
            if (isM()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_MUL), this.powTerm());
                continue;
            }
            if (isD()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_DIV), this.powTerm());
                continue;
            }
            this._error();
        }
        return node;
    }

    addTerm() {
        let node = this.mulTerm();

        const isM = () => this.lexer.isCurrentTokenType(TOKEN_TYPE_MINUS);
        const isP = () => this.lexer.isCurrentTokenType(TOKEN_TYPE_PLUS);
        while (isM() || isP()) {
            if (isM()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_MINUS), this.mulTerm());
                continue;
            }
            if (isP()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_PLUS), this.mulTerm());
                continue;
            }
            this._error();
        }
        return node;
    }

    emptyStatement() {
        return new EmptyNode();
    }

    variable() {
        return new VarNode(this.eat(TOKEN_TYPE_ID));
    }

    assignStatement() {
        return new AssignNode(
            this.variable(),
            this.eat(TOKEN_TYPE_ASSIGN),
            this.addTerm()
        );
    }

    statement() {
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_BEGIN)) {
            return this.compoundStatement();
        }
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_ID)) {
            return this.assignStatement();
        }
        return this.emptyStatement();
    }

    statementList() {
        const statements = [];

        statements.push(this.statement());
        while (this.lexer.isCurrentTokenType(TOKEN_TYPE_SEMI)) {
            this.eat(TOKEN_TYPE_SEMI);
            statements.push(this.statement());
        }
        return statements;
    }

    compoundStatement() {
        let statements = [];

        this.eat(TOKEN_TYPE_BEGIN);
        statements = this.statementList();
        this.eat(TOKEN_TYPE_END);

        return new CompoundNode(statements);
    }

    program() {
        const res = this.compoundStatement();
        this.eat(TOKEN_TYPE_DOT);
        return res;
    }

    parse() {
        return this.program();
    }
    _error() {
        throw new Error('Syntax error!');
    }
}