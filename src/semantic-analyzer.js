import { NodeVisitor } from './node-visitor.js'
import { ScopedSymbolTable, BuiltInSymbol, VarSymbol, ProcedureSymbol } from './symbol.js';
import { BinOpNode, UnaryOpNode, AssignNode, VarNode, CompoundNode, BlockNode, ProcedureDeclarationNode, VarDeclarationNode, ProgramNode, ASTNode, ProcCallNode, IfStatementNode, TestNode } from './node.js';
import { SemanticError, ErrorCode } from './exception.js';
import { Token, TokenType } from './token.js';
import { scope as log } from './logger.js';
import { Type, TypeChecker } from './type.js';
import { isTokenType } from './helper.js';

/**
 * @param {ScopedSymbolTable} _currentScope
 * @param {ASTNode} tree
 */
export class SemanticAlanyzer extends NodeVisitor {
    /**
     * 
     * @param {ASTNode} tree 
     */
    constructor(tree) {
        super();
        this.tree = tree;
        this._currentScope = new ScopedSymbolTable('global', 0, null);
        this._defineBuiltInTypes();
    }

    _defineBuiltInTypes() {
        this._currentScope.define(new BuiltInSymbol('INTEGER', Type.INTEGER));
        this._currentScope.define(new BuiltInSymbol('REAL', Type.FLOAT));
        this._currentScope.define(new BuiltInSymbol('BOOLEAN', Type.BOOLEAN));
    }

    /**
     * 
     * @param {ProgramNode} node
     */
    visitProgramNode(node) {
        this._currentScope = this._currentScope.createChild(node.name.value);
        log.info(`Entering scope "${this._currentScope.getName()}"`);

        this.visit(node.block);

        log.info(`Leaving scope "${this._currentScope.getName()}"`);
        this._currentScope = this._currentScope.getParent();
    }

    /**
     * 
     * @param {BlockNode} node 
     */
    visitBlockNode(node) {
        if (node.declarationList !== null) {
            for (const declNode of node.declarationList) {
                this.visit(declNode);
            }
        }
        if (node.procedureDeclarationList !== null) {
            for (const procDecl of node.procedureDeclarationList) {
                this.visit(procDecl);
            }
        }
        this.visit(node.compoundNode);
    }

    /**
     * 
     * @param {VarDeclarationNode} node 
     */
    visitVarDeclarationNode(node) {
        const name = node.variable.name;
        if (this._currentScope.lookup(name, true) !== null) {
            this._errorVariableAlreadyDefined(node.variable.token);
        }
        const varTypeName = node.type.value;
        const symbolType = this._currentScope.lookup(varTypeName);
        this._currentScope.define(new VarSymbol(name, symbolType));
    }

    /**
     * 
     * @param {ProcedureDeclarationNode} node 
     */
    visitProcedureDeclarationNode(node) {
        const procName = node.name.value;
        const procSymbol = new ProcedureSymbol(procName, [], node.block);
        this._currentScope.define(procSymbol);

        this._currentScope = this._currentScope.createChild(procName);
        log.info(`Entering scope "${this._currentScope.getName()}"`);

        for (const paramNode of node.params) {
            const name = paramNode.variable.name;
            const varTypeName = paramNode.type.type;
            if (this._currentScope.lookup(name, true) !== null) {
                this._errorVariableAlreadyDefined(paramNode.variable.token);
            }
            const symbolType = this._currentScope.lookup(varTypeName);
            const varSymbol = new VarSymbol(name, symbolType);
            this._currentScope.define(varSymbol);
            procSymbol.args.push(varSymbol);
        }

        this.visit(node.block);

        log.info(`Leaving scope "${this._currentScope.getName()}"`);
        this._currentScope = this._currentScope.getParent();
    }

    /**
     * 
     * @param {CompoundNode} node 
     */
    visitCompoundNode(node) {
        for (node of node.nodes) {
            this.visit(node);
        }
    }

    /**
     * 
     * @param {VarNode} node 
     */
    visitVarNode(node) {
        const varName = node.name;
        const varSymbol = this._currentScope.lookup(varName);
        if (!varSymbol) {
            this._errorUndefinedVariable(node.token);
        }
        node.type = varSymbol.type.type;
    }

    /**
     * 
     * @param {ProcCallNode} node 
     */
    visitProcCallNode(node) {
        /** @type {ProcedureSymbol} */
        const procSymbol = this._currentScope.lookup(node.name);
        if (!(procSymbol instanceof ProcedureSymbol)) {
            this._errorUndefinedProcedure(node.token);
        }

        node.procSymbol = procSymbol;
        let i = 0;
        let hasParamTypeMismatch = false;
        const types = [];
        for (const paramNode of node.params) {
            const argSymbol = procSymbol.args[i++] || {type: {}};
            this.visit(paramNode);
            if (!TypeChecker.areAssignmentCompatible(argSymbol.type.type, paramNode.type)) {
                hasParamTypeMismatch = true;
            }
            types.push(paramNode.type);
        }
        if (hasParamTypeMismatch || procSymbol.args.length !== node.params.length) {
            this._errorFunctionCalledWithWrongParameterList(node, types);
        }
    }

    /**
     * 
     * @param {AssignNode} node 
     */
    visitAssignNode(node) {
        const varName = node.left.token.value;
        const varSymbol = this._currentScope.lookup(varName);
        if (!varSymbol) {
            this._errorUndefinedVariable(node.left.token);
        }
        this.visit(node.right);

        if (!TypeChecker.areAssignmentCompatible(varSymbol.type.type, node.right.type)) {
            this._errorOperationTypeMismatch(node.op, varSymbol.type.type, node.right.type);
        }
    }

    /**
     * 
     * @param {BinOpNode} node 
     */
    visitBinOpNode(node) {
        this.visit(node.left);
        this.visit(node.right);

        const leftType = node.left.type;
        const rightType = node.right.type;

        const throwError = () => this._errorOperationTypeMismatch(node.op, leftType, rightType);

        if (TokenType.isArithmeticOperator(node.op)) {
            if (!TypeChecker.isBothNumber(leftType, rightType)) {
                throwError();
            }
            let type = Type.INTEGER;
            if (isTokenType(node.op, TokenType.FLOAT_DIV) || TypeChecker.isAtLeastOneReal(leftType, rightType)) {
                type = Type.FLOAT;
            }
            if ((isTokenType(node.op, TokenType.DIV) && !TypeChecker.isBothInteger(leftType, rightType))) {
                throwError();
            }
            node.type = type;
        } else if (TokenType.isComparisonOperator(node.op)) {
            if (!TypeChecker.areComparisonCompatible(leftType, rightType)) {
                throwError();
            }
            node.type = Type.BOOLEAN;
        } else if (TokenType.isBooleanOperator(node.op)) {
            if (!(TypeChecker.isBoolean(leftType) && TypeChecker.isBoolean(rightType))) {
                throwError();
            }
            node.type = Type.BOOLEAN;
        } else {
            this._error('Unknown operand!');
        }
    }
    /**
     * 
     * @param {UnaryOpNode} node 
     */
    visitUnaryOpNode(node) {
        this.visit(node.expr);
        const throwError = () => this._errorOperationTypeMismatch(node.op, node.expr.type);
        if (isTokenType(node.op, TokenType.NOT)) {
            if (!TypeChecker.isBoolean(node.expr.type)) {
                throwError();
            }
        } else {
            if (!TypeChecker.isNumber(node.expr.type)) {
                throwError();    
            }
        }
    }

    visitEmptyNode(node) {
    }

    visitNumNode(node) {
        let type = Type.FLOAT;
        if (Number.isInteger(node.value)) {
            type = Type.INTEGER;
        }
        node.type = type;
    }

    visitBoolNode(node) {
        node.type = Type.BOOLEAN;
    }

    /**
     * 
     * @param {IfStatementNode} node 
     */
    visitIfStatementNode(node) {
        this.visit(node.thenStatement);
        if (node.elseStatement) {
            this.visit(node.elseStatement);
        }
    }

    visitLoopNode(node) {
        for (const iNode of node.nodes) {
            if (iNode instanceof TestNode) {
                continue;
            }
            this.visit(iNode);
        }
    }

    eval() {
        this.visit(this.tree);
        return this.getCurrentScope();
    }

    getCurrentScope() {
        return this._currentScope;
    }

    /**
     * 
     * @param {Token} token 
     */
    _errorUndefinedVariable(token) {
        this._error(`Variable "${token.value}" is not defined!`, ErrorCode.ID_NOT_FOUND, token);
    }

    /**
     * 
     * @param {Token} name 
     */
    _errorVariableAlreadyDefined(token) {
        this._error(`Variable "${token.value}" is already defined!`, ErrorCode.DUPLICATE_ID, token);
    }

    /**
     * 
     * @param {Token} token 
     */
    _errorUndefinedProcedure(token) {
        this._error(`Procedure "${token.value}" is not defined!`, ErrorCode.PROCEDURE_NOT_FOUND, token);
    }

    _errorOperationTypeMismatch(token, typeLeft, typeRight) {
        if (typeof typeRight === 'undefined') {
            this._error(`"${token.value} ${typeLeft}" is not a valid operation`, ErrorCode.OPERATION_TYPE_MISMATCH, token);
        }
        this._error(`"${typeLeft} ${token.value} ${typeRight}" is not a valid operation`, ErrorCode.OPERATION_TYPE_MISMATCH, token);
    }

    _errorFunctionCalledWithWrongParameterList(node, types) {
        const name = node.name;
        const procSymbole = node.procSymbol;
        const called = '(' + types.join(', ') + ')';
        const requiredCall = '(' + procSymbole.args.map(v => v.type.type).join(', ') + ')';
        this._error(`Function "${name}" called with wrong parameter list. "${called}" is not compatible with "${requiredCall}"`, ErrorCode.WRONG_FUNCTION_PARAMETER_LIST, node.token);
    }

    _error(message, code, token) {
        throw new SemanticError(message, code, token);
    }
}