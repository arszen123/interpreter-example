import { Lexer } from './lexer.js';
import { BinOpNode, UnaryOpNode, NumNode, AssignNode, VarNode, CompoundNode, EmptyNode, BlockNode, VarDeclarationNode, ProcedureDeclarationNode, ProgramNode } from './node.js';
import {
    Token,
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
    TOKEN_TYPE_PROCEDURE,
} from './token.js';

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
        return new VarNode(this.eat(TOKEN_TYPE_ID));
    }

    /**
     * TERMINAL
     * 
     * grammar: REAL
     *        | INTEGER
     */
    typeSpec() {
        let varType;
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_REAL)) {
            varType = this.eat(TOKEN_TYPE_REAL);
        } else if (this.lexer.isCurrentTokenType(TOKEN_TYPE_INTEGER)) {
            varType = this.eat(TOKEN_TYPE_INTEGER);
        } else {
            this._error();
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

    /**
     * grammar: **atom** (POW **powTerm**)*
     */
    powTerm() {
        let node = this.atom();

        while (this.lexer.isCurrentTokenType(TOKEN_TYPE_POW)) {
            node = new BinOpNode(node, this.eat(TOKEN_TYPE_POW), this.powTerm());
        }
        return node;
    }

    /**
     * grammar: **powTerm** ((MUL|DIV|FLOAT_DIV) **powTerm**)*
     */
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

    /**
     * grammar: **mulTerm** ((MINUS|PLUS) **mulTerm**)*
     */
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
            this.eat(TOKEN_TYPE_ASSIGN),
            this.addTerm()
        );
    }

    /**
     * grammar: **compoundStatement**
     *        | **assignStatement**
     *        | **emptyStatement**
     */
    statement() {
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_BEGIN)) {
            return this.compoundStatement();
        }
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_ID)) {
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
        while (this.lexer.isCurrentTokenType(TOKEN_TYPE_SEMI)) {
            this.eat(TOKEN_TYPE_SEMI);
            statements.push(this.statement());
        }
        return statements;
    }

    /**
     * grammar: BEGIN **statementList** END
     */
    compoundStatement() {
        let statements = [];

        this.eat(TOKEN_TYPE_BEGIN);
        statements = this.statementList();
        this.eat(TOKEN_TYPE_END);

        return new CompoundNode(statements);
    }

    /**
     * grammar: **variable** (COMMA **variable**)* COLON **typeSpec**
     */
    varDecl() {
        const params = [this.variable()];
        while (this.lexer.isCurrentTokenType(TOKEN_TYPE_COMMA)) {
            this.eat(TOKEN_TYPE_COMMA);
            params.push(this.variable());
        }
        this.eat(TOKEN_TYPE_COLON);
        const type = this.typeSpec();
        return params.map(param => new VarDeclarationNode(param, type));
    }

    /**
     * grammar: **varDecl** (SEMI **varDecl**)*
     */
    procedureParameterList() {
        const params = [];
        params.push(...this.varDecl());
        while(this.lexer.isCurrentTokenType(TOKEN_TYPE_SEMI)) {
            this.eat(TOKEN_TYPE_SEMI);
            params.push(...this.varDecl());
        }
        return params;
    }

    /**
     * grammar: PROCEDURE ID (LPAR **procedureParameterList** RPAR)? SEMI **block** SEMI
     */
    procedureDeclaration() {
        let params = [];
        this.eat(TOKEN_TYPE_PROCEDURE);
        const name = this.eat(TOKEN_TYPE_ID).value;
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_LPAR)) {
            this.eat(TOKEN_TYPE_LPAR);
            params = this.procedureParameterList();
            this.eat(TOKEN_TYPE_RPAR);
        }
        this.eat(TOKEN_TYPE_SEMI);
        const block = this.block();
        this.eat(TOKEN_TYPE_SEMI);
        return new ProcedureDeclarationNode(name, params, block);
    }

    /**
     * grammar: (**procedureDeclaration**)*
     */
    procedureDeclarationList() {
        const procedureDeclarations = [];
        while (this.lexer.isCurrentTokenType(TOKEN_TYPE_PROCEDURE)) {
            procedureDeclarations.push(this.procedureDeclaration());
        }
        return procedureDeclarations;
    }

    /**
     * grammar: **varDecl** SEMI
     */
    variableDeclaration() {
        const res = this.varDecl();
        this.eat(TOKEN_TYPE_SEMI);
        return res;
    }

    /**
     * grammar: (VAR (**variableDeclaration**)+)+
     */
    variableDeclarationList() {
        const declarations = [];
        this.eat(TOKEN_TYPE_VAR);
        declarations.push(...this.variableDeclaration());
        while (this.lexer.isCurrentTokenType(TOKEN_TYPE_ID) || this.lexer.isCurrentTokenType(TOKEN_TYPE_VAR)) {
            if (this.lexer.isCurrentTokenType(TOKEN_TYPE_VAR)) {
                this.eat(TOKEN_TYPE_VAR);
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
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_VAR)) {
            varDecl = this.variableDeclarationList();
        }
        let procDecl = null;
        if (this.lexer.isCurrentTokenType(TOKEN_TYPE_PROCEDURE)) {
            procDecl = this.procedureDeclarationList();
        }
        return new BlockNode(varDecl, procDecl, this.compoundStatement());
    }

    /**
     * grammar: PROGRAM **variable** SEMI **block** DOT
     */
    program() {
        this.eat(TOKEN_TYPE_PROGRAM);
        const programName = this.variable().name;
        this.eat(TOKEN_TYPE_SEMI);
        const res = this.block();
        this.eat(TOKEN_TYPE_DOT);
        return new ProgramNode(programName, res);
    }

    parse() {
        return this.program();
    }

    _error(tokenType) {
        if (typeof tokenType !== 'undefined') {
            const currentToken = this.lexer.currentToken.type;
            throw new Error(`Syntax error, "${tokenType}" token is expected, got "${currentToken}"!`)
        }
        throw new Error('Syntax error!');
    }
}