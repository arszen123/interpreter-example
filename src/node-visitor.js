import { ASTNode } from './node.js';

export class NodeVisitor {
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
    /**
     * @param {ASTNode} node 
     */
    defaultVisitor(node) {
        throw new Error(`Undefined node visitor for ${node.constructor.name}!`);
    }
}