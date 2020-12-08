import { Lexer } from './lexer.js';
import { BinOpNode, UnaryOpNode, NumNode, AssignNode, VarNode, CompoundNode, EmptyNode, BlockNode, VarDeclarationListNode, VarDeclarationNode } from './node.js';
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
    TOKEN_TYPE_INTEGER_CONST,
    TOKEN_TYPE_REAL_CONST,
    TOKEN_TYPE_INTEGER,
    TOKEN_TYPE_REAL,
    TOKEN_TYPE_FLOAT_DIV,
    TOKEN_TYPE_PROGRAM,
    TOKEN_TYPE_VAR,
    TOKEN_TYPE_COMMA,
    TOKEN_TYPE_COLON,
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
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_INTEGER_CONST)) {
            return new NumNode(this.eat(TOKEN_TYPE_INTEGER_CONST));
        }
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_REAL_CONST)) {
            return new NumNode(this.eat(TOKEN_TYPE_REAL_CONST));
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
        const isFD = () => this.lexer.isCurrentTokenType(TOKEN_TYPE_FLOAT_DIV);
        while (isM() || isD() || isFD()) {
            if (isM()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_MUL), this.powTerm());
                continue;
            }
            if (isD()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_DIV), this.powTerm());
                continue;
            }
            if (isFD()) {
                node = new BinOpNode(node, this.eat(TOKEN_TYPE_FLOAT_DIV), this.powTerm());
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

    variableDeclaration() {
        const vars = [];
        vars.push(this.variable());

        while (this.lexer.isCurrentTokenType(TOKEN_TYPE_COMMA)) {
            this.eat(TOKEN_TYPE_COMMA);
            vars.push(this.variable());
        }
        let varType = null;
        this.eat(TOKEN_TYPE_COLON);
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_REAL)) {
            varType = this.eat(TOKEN_TYPE_REAL);
        } else if (this.lexer.isCurrentTokenType(TOKEN_TYPE_INTEGER)) {
            varType = this.eat(TOKEN_TYPE_INTEGER);
        }

        this.eat(TOKEN_TYPE_SEMI);
        return vars.map(variable => new VarDeclarationNode(variable, varType));
    }

    variableDeclarationList() {
        const declarations = [];
        declarations.push(...this.variableDeclaration());
        while (this.lexer.isCurrentTokenType(TOKEN_TYPE_ID)) {
            declarations.push(...this.variableDeclaration());
        }
        return new VarDeclarationListNode(declarations);
    }

    block() {
        let varDecl = null;
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_VAR)) {
            this.eat(TOKEN_TYPE_VAR);
            varDecl = this.variableDeclarationList();
        }
        return new BlockNode(varDecl, this.compoundStatement());
    }

    program() {
        this.eat(TOKEN_TYPE_PROGRAM);
        this.variable();
        this.eat(TOKEN_TYPE_SEMI);
        const res = this.block();
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