import { NodeVisitor } from './node-visitor.js'
import { SymbolTable, BuiltInSymbol, VarSymbol } from './symbol.js';
import { VarDeclarationNode, VarNode, AssignNode } from './node.js';
import { Parser } from './parser.js';

export class SymbolTableBuilder extends NodeVisitor {
    /**
     * 
     * @param {Parser} parser 
     */
    constructor(parser) {
        super();
        this.parser = parser;
        this._symbolTable = new SymbolTable();
        this._defineBuiltInTypes();
    }
    
    _defineBuiltInTypes() {
        this._symbolTable.define(new BuiltInSymbol('INTEGER'));
        this._symbolTable.define(new BuiltInSymbol('REAL'));
    }

    visitBlockNode(node) {
        if (node.declarationListNode !== null) {
            this.visit(node.declarationListNode);
        }
        this.visit(node.compoundNode);
    }

    visitVarDeclarationListNode(node) {
        for (const declNode of node.nodes) {
            this.visit(declNode);
        }
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
        const varTypeName = node.type.type;
        const symbolType = this._symbolTable.lookup(varTypeName);
        this._symbolTable.define(new VarSymbol(name, symbolType));
    }
    
    /**
     * 
     * @param {VarNode} node 
     */
    visitVarNode(node) {
        const varName = node.name;
        const varSymbol = this._symbolTable.lookup(varName);
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
        const varSymbol = this._symbolTable.lookup(varName);
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
        return this.getSymbolTable();
    }

    getSymbolTable() {
        return this._symbolTable;
    }

    _errorUndefinedVariable(name) {
        throw new Error(`Variable "${name}" is not defined!`);
    }
}