"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = exports.toFixed = exports.isEqual = void 0;
function isEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
exports.isEqual = isEqual;
/**
 * `Number.toFixed(n)` always formats a number so that it has `n` digits after the decimal point.
 * For example, `Number(0.00003427).toFixed(2)` returns `0.00`.
 * That's not very helpful, because all the meaningful information is lost.
 * In this case we would want the formatted value to have at least two significant digits: `0.000034`,
 * not two fraction digits.
 * @param value
 * @param fractionOrSignificantDigits
 */
function toFixed(value, fractionOrSignificantDigits = 2) {
    const power = Math.floor(Math.log(Math.abs(value)) / Math.LN10);
    if (power >= 0 || !isFinite(power)) {
        return value.toFixed(fractionOrSignificantDigits); // fraction digits
    }
    return value.toFixed(Math.abs(power) - 1 + fractionOrSignificantDigits); // significant digits
}
exports.toFixed = toFixed;
/**
 * Returns the mathematically correct n modulus of m. For context, the JS % operator is remainder
 * NOT modulus, which is why this is needed.
 */
function mod(n, m) {
    if (n >= 0) {
        return Math.floor(n % m);
    }
    return Math.floor((n % m) + m);
}
exports.mod = mod;
