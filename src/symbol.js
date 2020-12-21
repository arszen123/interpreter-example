import { finalize } from "./helper.js";
import { log as logger } from './logger.js';

class Symbol {
    /**
     * 
     * @param {String} name 
     * @param {Symbol|null} type 
     */
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
}

export class BuiltInSymbol extends Symbol {
    constructor(name) {
        super(name, null);
        finalize(this);
    }
}

export class VarSymbol extends Symbol {
    constructor(name, type) {
        super(name, type);
        finalize(this);
    }
}

export class ProcedureSymbol extends Symbol {
    /**
     * 
     * @param {String} name 
     * @param {Symbol[]} args 
     */
    constructor(name, args) {
        super(name, null);
        this.args = args || [];
        finalize(this);
    }
}

/**
 * @param {Symbol{}} _symbols
 */
export class ScopedSymbolTable {
    /**
     * 
     * @param {String} name 
     * @param {Number} level 
     * @param {ScopedSymbolTable|null|undefined} parent 
     */
    constructor(name, level, parent) {
        this._symbols = {};
        this._name = name;
        this._level = level;
        this._parent = parent || null;
        this.logger = logger;
        finalize(this);
    }

    /**
     * @param {Symbol} symbol 
     */
    define(symbol) {
        this.logger.info(`Defnie symbol ${symbol.name} in scope ${this}`);
        this._symbols[symbol.name] = symbol;
    }

    /**
     * @param {String} name 
     * @param {Boolean} [onlyCurrentScope=false]
     * @returns {Symbol}
     */
    lookup(name, onlyCurrentScope) {
        this.logger.info(`Lookup symbol ${name} in scope ${this}`);
        const symbol = this._symbols[name];
        if (onlyCurrentScope) {
            return symbol || null;
        }
        return symbol || (this.getParent() || { lookup: (name) => null }).lookup(name);
    }

    getSymbols() {
        return this._symbols;
    }

    getParent() {
        return this._parent
    }

    getLevel() {
        return this._level;
    }

    getName() {
        return this._name;
    }

    getAllSymbol() {
        let symbols = this._symbols;
        return { ...(this.getParent() || { getAllSymbol: () => { } }).getAllSymbol(), ...symbols };
    }

    createChild(name) {
        return new ScopedSymbolTable(name, this.getLevel() + 1, this);
    }

    toString() {
        return `(${this.getName()}, ${this.getLevel()})`
    }
}