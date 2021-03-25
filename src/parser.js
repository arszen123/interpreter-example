import { Lexer } from './lexer.js';
import { BinOpNode, UnaryOpNode, NumNode, BoolNode, AssignNode, VarNode, CompoundNode, EmptyNode, BlockNode, VarDeclarationNode, ProcedureDeclarationNode, ProgramNode, ProcCallNode, IfStatementNode } from './node.js';
import {
    Token,
    TokenType,
} from './token.js';
import { ParserError, ErrorCode } from './exception.js';
import {isTokenType} from './helper.js';

function isComparisionOperator(token) {
    const ops = [
        TokenType.LT,
        TokenType.LTE,
        TokenType.GT,
        TokenType.GTE,
        TokenType.EQ,
        TokenType.NEQ,
    ];
    return ops.includes(token.type);
}

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
        this.lexer.nextToken();
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
        } else if (this.lexer.isCurrentTokenType(TokenType.INTEGER)) {
            varType = this.eat(TokenType.INTEGER);
        } else if (this.lexer.isCurrentTokenType(TokenType.BOOLEAN)) {
            varType = this.eat(TokenType.BOOLEAN);
        }
        return varType;
    }

    /**
     * grammar: PLUS **factor**
     *        | MINUS **factor**
     *        | INTEGER_CONST
     *        | REAL_CONST
     *        | LPAR **expression** RPAR
     *        | **variable**
     * 
     */
     factor() {
        if (this.lexer.isCurrentTokenType(TokenType.PLUS)) {
            return new UnaryOpNode(this.eat(TokenType.PLUS), this.factor());
        }
        if (this.lexer.isCurrentTokenType(TokenType.MINUS)) {
            return new UnaryOpNode(this.eat(TokenType.MINUS), this.factor());
        }
        if (this.lexer.isCurrentTokenType(TokenType.NOT)) {
            return new UnaryOpNode(this.eat(TokenType.NOT), this.factor());
        }
        if (this.lexer.isCurrentTokenType(TokenType.INTEGER_CONST)) {
            return new NumNode(this.eat(TokenType.INTEGER_CONST));
        }
        if (this.lexer.isCurrentTokenType(TokenType.REAL_CONST)) {
            return new NumNode(this.eat(TokenType.REAL_CONST));
        }
        if (this.lexer.isCurrentTokenType(TokenType.TRUE) || this.lexer.isCurrentTokenType(TokenType.FALSE)) {
            return new BoolNode(this.eat(this.lexer.currentToken.type), this.lexer.isCurrentTokenType(TokenType.TRUE));
        }
        if (this.lexer.isCurrentTokenType(TokenType.LPAR)) {
            let node = null;

            this.eat(TokenType.LPAR);
            node = this.expression();
            this.eat(TokenType.RPAR);

            return node;
        }
        return this.variable();
    }

    /**
     * grammar: **factor** (POW **powTerm**)*
     */
    powTerm() {
        let node = this.factor();

        while (this.lexer.isCurrentTokenType(TokenType.POW)) {
            node = new BinOpNode(node, this.eat(TokenType.POW), this.powTerm());
        }
        return node;
    }

    /**
     * grammar: **factor** ((MUL|DIV|FLOAT_DIV) **factor**)*
     */
     term() {
        let node = this.factor();

        const isM = () => this.lexer.isCurrentTokenType(TokenType.MUL);
        const isD = () => this.lexer.isCurrentTokenType(TokenType.DIV);
        const isFD = () => this.lexer.isCurrentTokenType(TokenType.FLOAT_DIV);
        const isAnd = () => this.lexer.isCurrentTokenType(TokenType.AND);
        while (isM() || isD() || isFD() || isAnd()) {
            if (isM()) {
                node = new BinOpNode(node, this.eat(TokenType.MUL), this.factor());
            } else if (isD()) {
                node = new BinOpNode(node, this.eat(TokenType.DIV), this.factor());
            } else if (isFD()) {
                node = new BinOpNode(node, this.eat(TokenType.FLOAT_DIV), this.factor());
            } else if (isAnd()) {
                node = new BinOpNode(node, this.eat(TokenType.AND), this.factor());
            }
        }
        return node;
    }

    /**
     * grammar: **term** ((MINUS|PLUS|OR|XOR) **term**)*
     */
     simpleExpression() {
        let node = this.term();

        const isM = () => this.lexer.isCurrentTokenType(TokenType.MINUS);
        const isP = () => this.lexer.isCurrentTokenType(TokenType.PLUS);
        const isOr = () => this.lexer.isCurrentTokenType(TokenType.OR);
        const isXor = () => this.lexer.isCurrentTokenType(TokenType.XOR);
        while (isM() || isP() || isOr() || isXor()) {
            if (isM()) {
                node = new BinOpNode(node, this.eat(TokenType.MINUS), this.term());
            } else if (isP()) {
                node = new BinOpNode(node, this.eat(TokenType.PLUS), this.term());
            } else if (isOr()) {
                node = new BinOpNode(node, this.eat(TokenType.OR), this.term());
            } else if (isXor()) {
                node = new BinOpNode(node, this.eat(TokenType.XOR), this.term());
            }
        }
        return node;
    }

    /**
     * grammar: **simpleExpression** (COMPARISON_OP **simpleExpression**)
     */
    expression() {
        let simpleExpression = this.simpleExpression();
        if (isComparisionOperator(this.lexer.currentToken)) {
            simpleExpression = new BinOpNode(simpleExpression, this.eat(this.lexer.currentToken.type), this.simpleExpression());
        }
        return simpleExpression
    }

    /**
     * TERMINAL
     */
    emptyStatement() {
        return new EmptyNode();
    }

    /**
     * grammar: **variable** ASSIGN **expression**
     */
    assignStatement() {
        return new AssignNode(
            this.variable(),
            this.eat(TokenType.ASSIGN),
            this.expression()
        );
    }

    /**
     * grammar: ID LPAR (**expression** (COMMA **expression**)*)? RPAR
     */
    procCallStatement() {
        const name = this.eat(TokenType.ID);
        const params = [];

        this.eat(TokenType.LPAR);

        if (!this.lexer.isCurrentTokenType(TokenType.RPAR)) {
            params.push(this.expression());
            while (this.lexer.isCurrentTokenType(TokenType.COMMA)) {
                this.eat(TokenType.COMMA);
                params.push(this.expression());
            }
        }

        this.eat(TokenType.RPAR);

        return new ProcCallNode(name, params);
    }

    /**
     * grammar: IF **expression** THEN **statement** (ELSE **statement**)?
     */
    ifStatement() {
        this.eat(TokenType.IF);
        const expr = this.expression();
        this.eat(TokenType.THEN);
        const thenStatement = this.statement();
        let elseStatement = null;
        if (this.lexer.isCurrentTokenType(TokenType.ELSE)) {
            this.eat(TokenType.ELSE);
            elseStatement = this.statement();
        }
        return new IfStatementNode(expr, thenStatement, elseStatement);
    }

    /**
     * grammar: **compoundStatement**
     *        | **procCallStatement**
     *        | **assignStatement**
     *        | **emptyStatement**
     *        | **ifStatement**
     */
    statement() {
        if (this.lexer.isCurrentTokenType(TokenType.BEGIN)) {
            return this.compoundStatement();
        }
        if (
            this.lexer.isCurrentTokenType(TokenType.ID) &&
            isTokenType(this.lexer.peekToken(), TokenType.LPAR)
        ) {
            return this.procCallStatement();
        }
        if (this.lexer.isCurrentTokenType(TokenType.ID)) {
            return this.assignStatement();
        }
        if (this.lexer.isCurrentTokenType(TokenType.IF)) {
            return this.ifStatement();
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