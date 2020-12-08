
import { finalize } from './helper.js';

export class ASTNode {
    constructor() { }
}

export class NumNode extends ASTNode {
    constructor(token) {
        super();
        this.token = token;
        this.value = token.value;
        finalize(this);
    }
}

export class BinOpNode extends ASTNode {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.token = this.op = op;
        this.right = right;
        finalize(this);
    }
}

export class UnaryOpNode extends ASTNode {
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
    constructor(token) {
        super();
        this.token = token;
        this.name = token.value;
        finalize(this);
    }
}
export class AssignNode extends ASTNode {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.token = this.op = op;
        this.right = right;
        finalize(this);
    }
}
export class CompoundNode extends ASTNode {
    constructor(nodes) {
        super();
        this.nodes = nodes;
        finalize(this);
    }
}