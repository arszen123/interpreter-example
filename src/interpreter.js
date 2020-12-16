import { isTokenType } from './helper.js';
import { BinOpNode, UnaryOpNode, NumNode, AssignNode, VarNode, CompoundNode, EmptyNode, BlockNode, ProcedureDeclarationNode, VarDeclarationNode, ProgramNode, ASTNode } from './node.js';
import {
    TokenType,
} from './token.js';
import { NodeVisitor } from './node-visitor.js'

export class Interpreter extends NodeVisitor {
    /**
     * 
     * @param {ASTNode} tree
     */
    constructor(tree) {
        super();
        this.tree = tree;
        this.globalNamespace = {};
    }

    /**
     * 
     * @param {ProgramNode} node 
     */
    visitProgramNode(node) {
        this.visit(node.block);
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
        // ...
    }

    /**
     * 
     * @param {ProcedureDeclarationNode} node 
     */
    visitProcedureDeclarationNode(node) {
        this.visit(node.block);
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
     * @param {EmptyNode} node 
     */
    visitEmptyNode(node) {
        // nothing to do.
    }

    /**
     * 
     * @param {AssignNode} node 
     */
    visitAssignNode(node) {
        const variableName = node.left.name;
        const variableValue = this.visit(node.right);
        this.globalNamespace[variableName] = variableValue;
    }

    /**
     * 
     * @param {VarNode} node 
     */
    visitVarNode(node) {
        const variableName = node.name;
        if (typeof this.globalNamespace[variableName] === 'undefined') {
            throw new Error(`Undefined variable: ${variableName}`);
        }
        return this.globalNamespace[variableName];
    }

    /**
     * 
     * @param {BinOpNode} node 
     */
    visitBinOpNode(node) {
        if (isTokenType(node.op, TokenType.PLUS)) {
            return this.visit(node.left) + this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.MINUS)) {
            return this.visit(node.left) - this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.MUL)) {
            return this.visit(node.left) * this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.DIV)) {
            return Math.floor(this.visit(node.left) / this.visit(node.right));
        }
        if (isTokenType(node.op, TokenType.FLOAT_DIV)) {
            return this.visit(node.left) / this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.POW)) {
            return this.visit(node.left) ** this.visit(node.right);
        }
        this._error();
    }

    /**
     * 
     * @param {UnaryOpNode} node 
     */
    visitUnaryOpNode(node) {
        if (isTokenType(node.op, TokenType.MINUS)) {
            return this.visit(node.expr) * -1;
        }
        return this.visit(node.expr);
    }

    /**
     * @param {NumNode} node 
     */
    visitNumNode(node) {
        return node.value;
    }

    eval() {
        this.visit(this.tree);
    }

    getGlobalNamespace() {
        return this.globalNamespace;
    }

    _error() {
        throw new Error('General error!');
    }
}