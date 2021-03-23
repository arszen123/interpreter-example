
export class CircularBuffer {
    constructor(capacity) {
        this._capacity = capacity;
        this.reset();
    }

    get size() {
        return this._size;
    }

    get isEmpty() {
        return this.size === 0;
    }
    
    get capacity() {
        return this._capacity;
    }

    get isFull() {
        return this.size === this.capacity;
    }

    put(element) {
        const isFull = this.isFull;
        if (!this.isEmpty) {
            this._end = (this._end + 1) % this.capacity;
        }
        this._elements[this._end] = element;
        if (isFull) {
            this._incStart();
        } else {
            this._size++;
        }
    }

    _incStart() {
        this._start = (this._start + 1) % this.capacity;
    }

    get() {
        if (this.isEmpty) {
            return undefined;
        }
        const idx = this._start;
        const item = this._elements[idx];
        this._elements[idx] = undefined;
        this._incStart();
        this._size--;
        return item;
    }

    peek(num) {
        num = num || 0;
        if (num > this.size || num < 0) {
            // out of bounds
            return undefined;
        }
        const idx = (this._start + num) % this.capacity;
        return this._elements[idx];
    }

    reset() {
        this._size = 0;
        this._start = 0;
        this._end = 0;
        this._elements = [];
    }
}