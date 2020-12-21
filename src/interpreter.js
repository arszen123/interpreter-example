import { isTokenType } from './helper.js';
import { BinOpNode, UnaryOpNode, NumNode, AssignNode, VarNode, CompoundNode, EmptyNode, BlockNode, ProcedureDeclarationNode, VarDeclarationNode, ProgramNode, ASTNode, ProcCallNode } from './node.js';
import {
    TokenType,
} from './token.js';
import { NodeVisitor } from './node-visitor.js'
import { CallStack, ActivationRecord } from './storage.js';
import { stack as log } from './logger.js';


export class Interpreter extends NodeVisitor {
    /**
     * 
     * @param {ASTNode} tree
     */
    constructor(tree) {
        super();
        this.tree = tree;
        this.callStack = new CallStack();
    }

    /**
     * 
     * @param {ProgramNode} node 
     */
    visitProgramNode(node) {
        const ar = new ActivationRecord(
            node.name.value,
            ActivationRecord.TYPE.PROGRAM,
            1,
        );
        log.info(`Entering stack ${ar.name}`);
        this.callStack.push(ar);
        this.visit(node.block);
        log.info(this.callStack.toString());
        this.callStack.pop();
        log.info(`Leaving stack ${ar.name}`);
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
     * @param {ProcCallNode} node 
     */
    visitProcCallNode(node) {
        for(const paramNode of node.params) {
            this.visit(paramNode);
        }
    }

    /**
     * 
     * @param {AssignNode} node 
     */
    visitAssignNode(node) {
        const variableName = node.left.name;
        const variableValue = this.visit(node.right);
        this.callStack.peak().set(variableName, variableValue);
    }

    /**
     * 
     * @param {VarNode} node 
     */
    visitVarNode(node) {
        const variableName = node.name;
        const variableValue = this.callStack.peak().get(variableName);
        if (typeof variableValue === 'undefined') {
            throw new Error(`Undefined variable: ${variableName}`);
        }
        return variableValue;
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

    getCallStack() {
        return this.callStack;
    }

    _error() {
        throw new Error('General error!');
    }
}