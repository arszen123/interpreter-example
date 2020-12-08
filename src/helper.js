
/**
 * 
 * @param {Token} token 
 * @param {String} type 
 */
export function isTokenType(token, type) {
    return token && token.type === type;
}

/**
 * 
 * @param {String|Number} value 
 * @returns {Boolean}
 */
export function isNumber(value) {
    return !Number.isNaN(Number.parseInt(value));
}

/**
 * 
 * @param {String} value 
 */
export function isAlpha(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const alphaRanges = [
        ['_'.charCodeAt(0), '_'.charCodeAt(0)],
        ['a'.charCodeAt(0), 'z'.charCodeAt(0)],
        ['A'.charCodeAt(0), 'Z'.charCodeAt(0)],
    ]
    const charCode = value.charCodeAt(0);
    return alphaRanges.some((v) => v[0] <= charCode && v[1] >= v[1]);
}

/**
 * 
 * @param {*} value 
 */
export function isAlphaNum(value) {
    return isAlpha(value) || isNumber(value);
}

export function finalize(obj) {
    Object.freeze(obj);
    Object.seal(obj);
}

export function isWhiteSpace(value) {
    return value === ' ' || value === '\n';
}