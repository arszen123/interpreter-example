import { Token } from './token.js';
import { finalize } from './helper.js';
import { ProcedureSymbol } from './symbol.js';

export class ASTNode {
    constructor() { }
    finalize() {
        finalize(this);
    }
}

export class NumNode extends ASTNode {
    /**
     * @param {Token} token 
     */
    constructor(token) {
        super();
        this.token = token;
        this.value = token.value;
        //finalize(this);
    }
}

export class BoolNode extends ASTNode {
    /**
     * @param {Token} token 
     */
     constructor(token, value) {
        super();
        this.token = token;
        this.value = value;
        //finalize(this);
    }
}

export class BinOpNode extends ASTNode {
    /**
     * @param {ASTNode} left 
     * @param {Token} op 
     * @param {ASTNode} right 
     */
    constructor(left, op, right) {
        super();
        this.left = left;
        this.token = this.op = op;
        this.right = right;
        // finalize(this);
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
        //finalize(this);
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
        // finalize(this);
    }
}

export class AssignNode extends ASTNode {
    /**
     * @param {VarNode} left 
     * @param {Token} op 
     * @param {ASTNode} right 
     */
    constructor(left, op, right) {
        super();
        this.left = left;
        this.token = this.op = op;
        this.right = right;
        finalize(this);
    }
}

/**
 * @param {ProcedureSymbol} [procSymbol]
 */
export class ProcCallNode extends ASTNode {
    /**
     * @param {Token} nameToken
     * @param {ASTNode[]} params
     */
    constructor(nameToken, params) {
        super();
        this.token = nameToken;
        this.name = nameToken.value;
        this.params = params || [];
        this.procSymbol = null;
        // finalize(this);
    }
}

export class IfStatementNode extends ASTNode {

    /**
     * 
     * @param {ASTNode} expr 
     * @param {ASTNode} thenStatement 
     * @param {ASTNode} elseStatement 
     */
     constructor(expr, thenStatement, elseStatement) {
        super();
        this.expr = expr;
        this.thenStatement = thenStatement;
        this.elseStatement = elseStatement;
        finalize(this);
    }
}

export class CompoundNode extends ASTNode {
    /**
     * @param {(CompoundNode|AssignNode|EmptyNode)[]} nodes 
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
     * @param {Token} name
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
     * @param {VarNode} variable 
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
     * @param {VarDeclarationNode[]} declarationList
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
     * @param {Token} name 
     * @param {BlockNode} blockNode 
     */
    constructor(name, blockNode) {
        super();
        this.name = name;
        this.block = blockNode;
        finalize(this);
    }
}

export class TestNode extends ASTNode {
    /**
     * @param {ASTNode} expr 
     */
    constructor(expr) {
        super();
        this.expr = expr;
        finalize(this);
    }
}

export class LoopNode extends ASTNode {
    constructor(nodes) {
        super();
        this.nodes = nodes;
        finalize(this);
    }
}