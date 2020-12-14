import { finalize } from "./helper";

class Symbol {
    /**
     * 
     * @param {String} name 
     * @param {Symbol|null} type 
     */
    constructor(name, type) {
        this.name = name;
        this.type = type;
        finalize(this);
    }
}

export class BuiltInSymbol extends Symbol {
    constructor(name) {
        super(name, null);
    }
}

export class VarSymbol extends Symbol {
    constructor(name, type) {
        super(name, type);
    }
}

export class SymbolTable {
    constructor() {
        this._symbols = {};
        finalize(this);
    }

    /**
     * 
     * @param {Symbol} symbol 
     */
    define(symbol) {
        this._symbols[symbol.name] = symbol;
    }

    lookup(name) {
        const symbol = this._symbols[name];
        return symbol || null;
    }

    getSymbols() {
        return this._symbols;
    }
}