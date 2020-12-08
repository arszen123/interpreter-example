import { Parser } from './parser.js';
import { isTokenType } from './helper.js';
import { ASTNode, BinOpNode, UnaryOpNode, NumNode, AssignNode, VarNode, CompoundNode, EmptyNode } from './node.js';
import {
    TOKEN_TYPE_PLUS,
    TOKEN_TYPE_MINUS,
    TOKEN_TYPE_MUL,
    TOKEN_TYPE_DIV,
    TOKEN_TYPE_POW,
} from './token.js';

class NodeVisitor {
    /**
     * @param {ASTNode} node 
     */
    visit(node) {
        const nodeName = (node.constructor || {}).name;
        const fnName = `visit${nodeName}`
        if (typeof this[fnName] !== 'function') {
            return this.defaultVisitor(node);
        }
        return this[fnName](node);
    }
    defaultVisitor(node) {
        throw new Error(`Undefined node visitor for ${node.constructor.name}!`);
    }
}

export class Interpreter extends NodeVisitor {
    /**
     * 
     * @param {Parser} parser 
     */
    constructor(parser) {
        super();
        this.parser = parser;
        this.globalNamespace = {};
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
        const variableName = node.name;
        if (typeof this.globalNamespace[variableName] === 'undefined') {
            throw new Error(`Undefined variable: ${variableName}`);
        }
        return this.globalNamespace[variableName];
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
     * @param {BinOpNode} node 
     */
    visitBinOpNode(node) {
        if (isTokenType(node.op, TOKEN_TYPE_PLUS)) {
            return this.visit(node.left) + this.visit(node.right);
        }
        if (isTokenType(node.op, TOKEN_TYPE_MINUS)) {
            return this.visit(node.left) - this.visit(node.right);
        }
        if (isTokenType(node.op, TOKEN_TYPE_MUL)) {
            return this.visit(node.left) * this.visit(node.right);
        }
        if (isTokenType(node.op, TOKEN_TYPE_DIV)) {
            return Math.floor(this.visit(node.left) / this.visit(node.right));
        }
        if (isTokenType(node.op, TOKEN_TYPE_POW)) {
            return this.visit(node.left) ** this.visit(node.right);
        }
        this._error();
    }

    /**
     * 
     * @param {UnaryOpNode} node 
     */
    visitUnaryOpNode(node) {
        if (isTokenType(node.op, TOKEN_TYPE_MINUS)) {
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
        const genNode = this.parser.parse();
        this.visit(genNode);
    }

    getGlobalNamespace() {
        return this.globalNamespace;
    }

    _error() {
        throw new Error('General error!');
    }
}