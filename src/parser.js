import { Lexer } from './lexer.js';
import { BinOpNode, UnaryOpNode, NumNode, AssignNode, VarNode, CompoundNode, EmptyNode, BlockNode, VarDeclarationNode, ProcedureDeclarationNode, ProgramNode, ProcCallNode } from './node.js';
import {
    Token,
    TokenType,
} from './token.js';
import { ParserError, ErrorCode } from './exception.js';

export class Parser {
    /**
     * 
     * @param {Lexer} lexer
     */
    constructor(lexer) {
        this.lexer = lexer;
    }

    /**
     * 
     * @param {Token} tokenType 
     */
    eat(tokenType) {
        if (!this.lexer.isCurrentTokenType(tokenType)) {
            this._error(tokenType);
        }
        const res = this.lexer.currentToken;
        this.lexer.getNextToken();
        return res;
    }

    /**
     * TERMINAL
     * grammar: ID
     */
    variable() {
        return new VarNode(this.eat(TokenType.ID));
    }

    /**
     * TERMINAL
     * 
     * grammar: REAL
     *        | INTEGER
     */
    typeSpec() {
        let varType;
        if (this.lexer.isCurrentTokenType(TokenType.REAL)) {
            varType = this.eat(TokenType.REAL);
        } else {
            varType = this.eat(TokenType.INTEGER);
        }
        return varType;
    }

    /**
     * grammar: PLUS **atom**
     *        | MINUS **atom**
     *        | INTEGER_CONST
     *        | REAL_CONST
     *        | LPAR **addTerm** RPAR
     *        | **variable**
     * 
     */
    atom() {
        if (this.lexer.isCurrentTokenType(TokenType.PLUS)) {
            return new UnaryOpNode(this.eat(TokenType.PLUS), this.atom());
        }
        if (this.lexer.isCurrentTokenType(TokenType.MINUS)) {
            return new UnaryOpNode(this.eat(TokenType.MINUS), this.atom());
        }
        if (this.lexer.isCurrentTokenType(TokenType.INTEGER_CONST)) {
            return new NumNode(this.eat(TokenType.INTEGER_CONST));
        }
        if (this.lexer.isCurrentTokenType(TokenType.REAL_CONST)) {
            return new NumNode(this.eat(TokenType.REAL_CONST));
        }
        if (this.lexer.isCurrentTokenType(TokenType.LPAR)) {
            let node = null;

            this.eat(TokenType.LPAR);
            node = this.addTerm();
            this.eat(TokenType.RPAR);

            return node;
        }
        return this.variable();
    }

    /**
     * grammar: **atom** (POW **powTerm**)*
     */
    powTerm() {
        let node = this.atom();

        while (this.lexer.isCurrentTokenType(TokenType.POW)) {
            node = new BinOpNode(node, this.eat(TokenType.POW), this.powTerm());
        }
        return node;
    }

    /**
     * grammar: **powTerm** ((MUL|DIV|FLOAT_DIV) **powTerm**)*
     */
    mulTerm() {
        let node = this.powTerm();

        const isM = () => this.lexer.isCurrentTokenType(TokenType.MUL);
        const isD = () => this.lexer.isCurrentTokenType(TokenType.DIV);
        const isFD = () => this.lexer.isCurrentTokenType(TokenType.FLOAT_DIV);
        while (isM() || isD() || isFD()) {
            if (isM()) {
                node = new BinOpNode(node, this.eat(TokenType.MUL), this.powTerm());
            } else if (isD()) {
                node = new BinOpNode(node, this.eat(TokenType.DIV), this.powTerm());
            } else {
                node = new BinOpNode(node, this.eat(TokenType.FLOAT_DIV), this.powTerm());
            }
        }
        return node;
    }

    /**
     * grammar: **mulTerm** ((MINUS|PLUS) **mulTerm**)*
     */
    addTerm() {
        let node = this.mulTerm();

        const isM = () => this.lexer.isCurrentTokenType(TokenType.MINUS);
        const isP = () => this.lexer.isCurrentTokenType(TokenType.PLUS);
        while (isM() || isP()) {
            if (isM()) {
                node = new BinOpNode(node, this.eat(TokenType.MINUS), this.mulTerm());
            } else {
                node = new BinOpNode(node, this.eat(TokenType.PLUS), this.mulTerm());
            }
        }
        return node;
    }

    /**
     * TERMINAL
     */
    emptyStatement() {
        return new EmptyNode();
    }

    /**
     * grammar: **variable** ASSIGN **addTerm**
     */
    assignStatement() {
        return new AssignNode(
            this.variable(),
            this.eat(TokenType.ASSIGN),
            this.addTerm()
        );
    }

    /**
     * grammar: ID LPAR (**addTerm** (COMMA **addTerm**)*)? RPAR
     */
    procCallStatement() {
        const name = this.eat(TokenType.ID);
        const params = [];

        this.eat(TokenType.LPAR);

        if (!this.lexer.isCurrentTokenType(TokenType.RPAR)) {
            params.push(this.addTerm());
            while (this.lexer.isCurrentTokenType(TokenType.COMMA)) {
                this.eat(TokenType.COMMA);
                params.push(this.addTerm());
            }
        }

        this.eat(TokenType.RPAR);

        return new ProcCallNode(name, params);
    }

    /**
     * grammar: **compoundStatement**
     *        | **procCallStatement**
     *        | **assignStatement**
     *        | **emptyStatement**
     */
    statement() {
        if (this.lexer.isCurrentTokenType(TokenType.BEGIN)) {
            return this.compoundStatement();
        }
        if (
            this.lexer.isCurrentTokenType(TokenType.ID) &&
            // @todo add peek token or a valid char (skip whitespace/comment).
            this.lexer.peek() === '('
        ) {
            return this.procCallStatement();
        }
        if (this.lexer.isCurrentTokenType(TokenType.ID)) {
            return this.assignStatement();
        }
        return this.emptyStatement();
    }

    /**
     * grammar: **statement** (SEMI **statement**)*
     */
    statementList() {
        const statements = [];

        statements.push(this.statement());
        while (this.lexer.isCurrentTokenType(TokenType.SEMI)) {
            this.eat(TokenType.SEMI);
            statements.push(this.statement());
        }
        return statements;
    }

    /**
     * grammar: BEGIN **statementList** END
     */
    compoundStatement() {
        let statements = [];

        this.eat(TokenType.BEGIN);
        statements = this.statementList();
        this.eat(TokenType.END);

        return new CompoundNode(statements);
    }

    /**
     * grammar: **variable** (COMMA **variable**)* COLON **typeSpec**
     */
    varDecl() {
        const params = [this.variable()];
        while (this.lexer.isCurrentTokenType(TokenType.COMMA)) {
            this.eat(TokenType.COMMA);
            params.push(this.variable());
        }
        this.eat(TokenType.COLON);
        const type = this.typeSpec();
        return params.map(param => new VarDeclarationNode(param, type));
    }

    /**
     * grammar: **varDecl** (SEMI **varDecl**)*
     */
    procedureParameterList() {
        const params = [];
        params.push(...this.varDecl());
        while(this.lexer.isCurrentTokenType(TokenType.SEMI)) {
            this.eat(TokenType.SEMI);
            params.push(...this.varDecl());
        }
        return params;
    }

    /**
     * grammar: PROCEDURE ID (LPAR **procedureParameterList** RPAR)? SEMI **block** SEMI
     */
    procedureDeclaration() {
        let params = [];
        this.eat(TokenType.PROCEDURE);
        const name = this.eat(TokenType.ID);
        if (this.lexer.isCurrentTokenType(TokenType.LPAR)) {
            this.eat(TokenType.LPAR);
            params = this.procedureParameterList();
            this.eat(TokenType.RPAR);
        }
        this.eat(TokenType.SEMI);
        const block = this.block();
        this.eat(TokenType.SEMI);
        return new ProcedureDeclarationNode(name, params, block);
    }

    /**
     * grammar: (**procedureDeclaration**)*
     */
    procedureDeclarationList() {
        const procedureDeclarations = [];
        while (this.lexer.isCurrentTokenType(TokenType.PROCEDURE)) {
            procedureDeclarations.push(this.procedureDeclaration());
        }
        return procedureDeclarations;
    }

    /**
     * grammar: **varDecl** SEMI
     */
    variableDeclaration() {
        const res = this.varDecl();
        this.eat(TokenType.SEMI);
        return res;
    }

    /**
     * grammar: (VAR (**variableDeclaration**)+)+
     */
    variableDeclarationList() {
        const declarations = [];
        this.eat(TokenType.VAR);
        declarations.push(...this.variableDeclaration());
        while (this.lexer.isCurrentTokenType(TokenType.ID) || this.lexer.isCurrentTokenType(TokenType.VAR)) {
            if (this.lexer.isCurrentTokenType(TokenType.VAR)) {
                this.eat(TokenType.VAR);
            }
            declarations.push(...this.variableDeclaration());
        }
        return declarations;
    }

    /**
     * grammar: (**variableDeclarationList**)? (**procedureDeclarationList**)? **compoundStatement**
     */
    block() {
        let varDecl = null;
        if (this.lexer.isCurrentTokenType(TokenType.VAR)) {
            varDecl = this.variableDeclarationList();
        }
        let procDecl = null;
        if (this.lexer.isCurrentTokenType(TokenType.PROCEDURE)) {
            procDecl = this.procedureDeclarationList();
        }
        return new BlockNode(varDecl, procDecl, this.compoundStatement());
    }

    /**
     * grammar: PROGRAM **variable** SEMI **block** DOT
     */
    program() {
        this.eat(TokenType.PROGRAM);
        const programName = this.eat(TokenType.ID);
        this.eat(TokenType.SEMI);
        const res = this.block();
        this.eat(TokenType.DOT);
        return new ProgramNode(programName, res);
    }

    parse() {
        return this.program();
    }

    _error(tokenType) {
        const currentToken = this.lexer.currentToken;
        throw new ParserError(
            `Syntax error: token with type "${tokenType}" is expected, got "${currentToken}"!`,
            ErrorCode.UNEXPECTED_TOKEN,
            currentToken,
        )
    }
}