import { NodeVisitor } from './node-visitor.js'
import { ScopedSymbolTable, BuiltInSymbol, VarSymbol, ProcedureSymbol } from './symbol.js';
import { VarDeclarationNode, VarNode, AssignNode, ProgramNode, ProcedureDeclarationNode } from './node.js';
import { Parser } from './parser.js';

/**
 * @param {ScopedSymbolTable} _currentScope
 * @param {Parser} parser
 */
export class SemanticAlanyzer extends NodeVisitor {
    /**
     * 
     * @param {Parser} parser 
     */
    constructor(parser) {
        super();
        this.parser = parser;
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
        this._currentScope = this._currentScope.createChild(node.name);
        this.visit(node.block);
        this._currentScope = this._currentScope.getParent();
    }

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
     * @param {ProcedureDeclarationNode} node 
     */
    visitProcedureDeclarationNode(node) {
        const procName = node.name;
        const procSymbol = new ProcedureSymbol(procName);
        this._currentScope.define(procSymbol);

        this._currentScope = this._currentScope.createChild(procName);

        for(const paramNode of node.params) {
            const name = paramNode.variable.name;
            const varTypeName = paramNode.type.type;
            if (this._currentScope.lookup(name, true) !== null) {
                this._errorVariableAlreadyDefined(name);
            }
            const symbolType = this._currentScope.lookup(varTypeName);
            this._currentScope.define(new VarSymbol(name, symbolType));
        }

        this.visit(node.block);

        this._currentScope = this._currentScope.getParent();
    }

    visitCompoundNode(node) {
        for (node of node.nodes) {
            this.visit(node);
        }
    }

    /**
     * 
     * @param {VarDeclarationNode} node 
     */
    visitVarDeclarationNode(node) {
        const name = node.variable.name;
        if (this._currentScope.lookup(name, true) !== null) {
            this._errorVariableAlreadyDefined(name);
        }
        const varTypeName = node.type.type;
        const symbolType = this._currentScope.lookup(varTypeName);
        this._currentScope.define(new VarSymbol(name, symbolType));
    }
    
    /**
     * 
     * @param {VarNode} node 
     */
    visitVarNode(node) {
        const varName = node.name;
        const varSymbol = this._currentScope.lookup(varName);
        if (!varSymbol) {
            this._errorUndefinedVariable(varName);
        }
    }
    /**
     * 
     * @param {AssignNode} node 
     */
    visitAssignNode(node) {
        const varName = node.left.name;
        const varSymbol = this._currentScope.lookup(varName);
        if (!varSymbol) {
            this._errorUndefinedVariable(varName);
        }
        this.visit(node.right);
    }

    visitBinOpNode(node) {
        this.visit(node.left);
        this.visit(node.right);
    }
    visitUnaryOpNode(node) {
        this.visit(node.right);
    }
    visitEmptyNode(node) {
    }
    visitNumNode(node) {
    }

    eval() {
        const tree = this.parser.parse();
        this.visit(tree);
        return this.getCurrentScope();
    }

    getCurrentScope() {
        return this._currentScope;
    }

    _errorUndefinedVariable(name) {
        throw new Error(`Variable "${name}" is not defined!`);
    }

    _errorVariableAlreadyDefined(name) {
        throw new Error(`Variable "${name}" is already defined!`);
    }
}