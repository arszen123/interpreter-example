
/**
 * @param {ActivationRecord[]} _stack
 */
export class CallStack {
    constructor () {
        this._stack = [];
    }

    /**
     * @param {ActivationRecord} ar 
     */
    push(ar) {
        this._stack.push(ar);
    }

    /**
     * @returns {ActivationRecord|null}
     */
    pop() {
        return this._stack.pop() || null;
    }

    /**
     * @returns {ActivationRecord|null}
     */
    peek() {
        return this._stack[this._stack.length - 1] || null;
    }

    toString() {
        const text = this._stack.reverse().join('\n');
        this._stack.reverse();
        return 'Call Stack:\n' + text;
    }

}

const ARType = Object.freeze({
    PROGRAM: 'PROGRAM',
    PROCEDURE: 'PROCEDURE',
});

/**
 * 
 */
export class ActivationRecord {
    static TYPE = ARType;

    /**
     * @param {String} name 
     * @param {String} type 
     * @param {Number} level 
     */
    constructor(name, type, level) {
        this.name = name;
        this.type = type;
        this.level = level;
        this._storage = {};
    }

    set(key, value) {
        this._storage[key] = value;
    }

    get(key) {
        return this._storage[key];
    }

    getStorage() {
        return this._storage;
    }

    createChild(name, type) {
        return new ActivationRecord(
            name,
            type,
            this.level + 1,
        )
    }

    toString() {
        const head = `${this.level} ActivationRecord(name=${this.name}, type=${this.type}, level=${this.level}):\n`;
        const bodyParts = [];
        for (const i in this._storage) {
            bodyParts.push(`\t${i}: ${this._storage[i]}`);
        }
        return head + bodyParts.join('\n');
    }

}