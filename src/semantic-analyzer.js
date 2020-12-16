import { NodeVisitor } from './node-visitor.js'
import { ScopedSymbolTable, BuiltInSymbol, VarSymbol, ProcedureSymbol } from './symbol.js';
import { BinOpNode, UnaryOpNode, AssignNode, VarNode, CompoundNode, BlockNode, ProcedureDeclarationNode, VarDeclarationNode, ProgramNode, ASTNode } from './node.js';
import { SemanticError, ErrorCode } from './exception.js';
import { Token } from './token.js';
import {log} from './logger.js';

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
        this._currentScope.define(new BuiltInSymbol('INTEGER'));
        this._currentScope.define(new BuiltInSymbol('REAL'));
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
        const procSymbol = new ProcedureSymbol(procName);
        this._currentScope.define(procSymbol);

        this._currentScope = this._currentScope.createChild(procName);
        log.info(`Entering scope "${this._currentScope.getName()}"`);

        for(const paramNode of node.params) {
            const name = paramNode.variable.name;
            const varTypeName = paramNode.type.type;
            if (this._currentScope.lookup(name, true) !== null) {
                this._errorVariableAlreadyDefined(paramNode.variable.token);
            }
            const symbolType = this._currentScope.lookup(varTypeName);
            this._currentScope.define(new VarSymbol(name, symbolType));
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
    }

    /**
     * 
     * @param {BinOpNode} node 
     */
    visitBinOpNode(node) {
        this.visit(node.left);
        this.visit(node.right);
    }
    /**
     * 
     * @param {UnaryOpNode} node 
     */
    visitUnaryOpNode(node) {
        this.visit(node.right);
    }

    visitEmptyNode(node) {
    }

    visitNumNode(node) {
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
     * @param {*Token} name 
     */
    _errorVariableAlreadyDefined(token) {
        this._error(`Variable "${token.value}" is already defined!`, ErrorCode.DUPLICATE_ID, token);
    }

    _error(message, code, token) {
        throw new SemanticError(message, code, token);
    }
}