import { isTokenType } from './helper.js';
import { BinOpNode, UnaryOpNode, NumNode, AssignNode, VarNode, CompoundNode, EmptyNode, BlockNode, ProcedureDeclarationNode, VarDeclarationNode, ProgramNode, ASTNode, ProcCallNode, IfStatementNode, TestNode } from './node.js';
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
        this.callStack.push(ar);
        
        log.info(`ENTERING PROGRAM: ${ar.name}`);
        log.info(this.callStack.toString());

        this.visit(node.block);
        
        log.info(`LEAVING PROGRAM: ${ar.name}`);
        log.info(this.callStack.toString());

        this.callStack.pop();
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
        const ar = this.callStack.peek().createChild(node.name, ActivationRecord.TYPE.PROCEDURE);
        this.callStack.push(ar);

        const procSymbol = node.procSymbol;
        const procArgs = procSymbol.args;
        const params = node.params;
        for(const idx in params) {
            const paramNode = params[idx];
            const arg = procArgs[idx];
            ar.set(arg.name, this.visit(paramNode));
        }
        
        log.info(`ENTERING PROCEDURE: ${node.name}`);
        log.info(this.callStack.toString());

        this.visit(procSymbol.blockAstNode);

        log.info(`LEAVING PROCEDURE: ${node.name}`);
        log.info(this.callStack.toString());

        this.callStack.pop();
    }

    /**
     * 
     * @param {AssignNode} node 
     */
    visitAssignNode(node) {
        const variableName = node.left.name;
        const variableValue = this.visit(node.right);
        this.callStack.peek().set(variableName, variableValue);
    }

    /**
     * 
     * @param {VarNode} node 
     */
    visitVarNode(node) {
        const variableName = node.name;
        const variableValue = this.callStack.peek().get(variableName);
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
        if (isTokenType(node.op, TokenType.EQ)) {
            return this.visit(node.left) == this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.NEQ)) {
            return this.visit(node.left) != this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.LT)) {
            return this.visit(node.left) < this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.LTE)) {
            return this.visit(node.left) <= this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.GT)) {
            return this.visit(node.left) > this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.GTE)) {
            return this.visit(node.left) >= this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.OR)) {
            return this.visit(node.left) || this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.XOR)) {
            return this.visit(node.left) && this.visit(node.right);
        }
        if (isTokenType(node.op, TokenType.AND)) {
            return this.visit(node.left) && this.visit(node.right);
        }
        this._errorOperatorNotDefined(node.op);
    }

    /**
     * 
     * @param {UnaryOpNode} node 
     */
    visitUnaryOpNode(node) {
        if (isTokenType(node.op, TokenType.MINUS)) {
            return this.visit(node.expr) * -1;
        }
        if (isTokenType(node.op, TokenType.NOT)) {
            return !this.visit(node.expr);
        }
        return this.visit(node.expr);
    }

    /**
     * @param {NumNode} node 
     */
    visitNumNode(node) {
        return node.value;
    }

    visitBoolNode(node) {
        return node.value;
    }

    /**
     * 
     * @param {IfStatementNode} node 
     */
    visitIfStatementNode(node) {
        if (this.visit(node.expr)) {
            this.visit(node.thenStatement);
        } else if (node.elseStatement) {
            this.visit(node.elseStatement);
        }
    }

    visitLoopNode(node) {
        let exitLoop = false;
        while (!exitLoop) {
            for (const iNode of node.nodes) {
                if (iNode instanceof TestNode) {
                    exitLoop = this.visit(iNode.expr);
                    if (exitLoop) {
                        break;
                    }
                } else {
                    this.visit(iNode);
                }
            }
        }
    }

    eval() {
        this.visit(this.tree);
    }

    getCallStack() {
        return this.callStack;
    }

    _errorOperatorNotDefined(token) {
        throw new Error(`Error "${token}" not defined!`);
    }
}