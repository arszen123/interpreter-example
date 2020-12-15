import { Token } from './token.js';
import { finalize } from './helper.js';

export class ASTNode {
    constructor() { }
}

export class NumNode extends ASTNode {
    /**
     * @param {Token} token 
     */
    constructor(token) {
        super();
        this.token = token;
        this.value = token.value;
        finalize(this);
    }
}

export class BinOpNode extends ASTNode {
    /**
     * @param {Token} left 
     * @param {Token} op 
     * @param {Token} right 
     */
    constructor(left, op, right) {
        super();
        this.left = left;
        this.token = this.op = op;
        this.right = right;
        finalize(this);
    }
}

export class UnaryOpNode extends ASTNode {
    /**
     * @param {Token} op 
     * @param {ASTNode} expr 
     */
    constructor(op, expr) {
        super();
        this.token = this.op = op;
        this.expr = expr;
        finalize(this);
    }
}
export class EmptyNode extends ASTNode {
    constructor() {
        super();
        finalize(this);
    }
}
export class VarNode extends ASTNode {
    /**
     * @param {Token} token 
     */
    constructor(token) {
        super();
        this.token = token;
        this.name = token.value;
        finalize(this);
    }
}

export class AssignNode extends ASTNode {
    /**
     * @param {Token} left 
     * @param {Token} op 
     * @param {Token} right 
     */
    constructor(left, op, right) {
        super();
        this.left = left;
        this.token = this.op = op;
        this.right = right;
        finalize(this);
    }
}

export class CompoundNode extends ASTNode {
    /**
     * @param {ASTNode} nodes 
     */
    constructor(nodes) {
        super();
        this.nodes = nodes;
        finalize(this);
    }
}

/**
 * 
 * @param {VarDeclarationNode[]} params 
 */
export class ProcedureDeclarationNode extends ASTNode {
    /**
     * @param {String} name 
     * @param {VarDeclarationNode[]} params 
     * @param {BlockNode} block 
     */
    constructor(name, params, block) {
        super();
        this.name = name;
        this.params = params;
        this.block = block;
        finalize(this);
    }
}

export class VarDeclarationNode extends ASTNode {
    /**
     * @param {Token} variable 
     * @param {Token} type 
     */
    constructor(variable, type) {
        super();
        this.variable = variable;
        this.type = type;
        finalize(this);
    }
}

export class BlockNode extends ASTNode {
    /**
     * @param {VarDeclaration[]} declarationList
     * @param {ProcedureDeclarationNode[]} procedureDeclarationList
     * @param {CompoundNode} compoundNode 
     */
    constructor(declarationList, procedureDeclarationList, compoundNode) {
        super();
        this.declarationList = declarationList;
        this.procedureDeclarationList = procedureDeclarationList;
        this.compoundNode = compoundNode;
        finalize(this);
    }
}

export class ProgramNode extends ASTNode {
    /**
     * @param {String} name 
     * @param {BlockNode} blockNode 
     */
    constructor(name, blockNode) {
        super();
        this.name = name;
        this.block = blockNode;
        finalize(this);
    }
}