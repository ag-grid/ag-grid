export function isEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
/**
 * `Number.toFixed(n)` always formats a number so that it has `n` digits after the decimal point.
 * For example, `Number(0.00003427).toFixed(2)` returns `0.00`.
 * That's not very helpful, because all the meaningful information is lost.
 * In this case we would want the formatted value to have at least two significant digits: `0.000034`,
 * not two fraction digits.
 * @param value
 * @param fractionOrSignificantDigits
 */
export function toFixed(value, fractionOrSignificantDigits = 2) {
    const power = Math.floor(Math.log(Math.abs(value)) / Math.LN10);
    if (power >= 0 || !isFinite(power)) {
        return value.toFixed(fractionOrSignificantDigits); // fraction digits
    }
    return value.toFixed(Math.abs(power) - 1 + fractionOrSignificantDigits); // significant digits
}
const numberUnits = ['', 'K', 'M', 'B', 'T'];
export function log10(x) {
    return Math.log(x) * Math.LOG10E;
}
/**
 * Returns the mathematically correct n modulus of m. For context, the JS % operator is remainder
 * NOT modulus, which is why this is needed.
 */
export function mod(n, m) {
    // https://stackoverflow.com/a/13163436
    const remain = n % m;
    return remain >= 0 ? remain : remain + m;
}
export const EPSILON = Number.EPSILON || Math.pow(2, -52);
export function toReadableNumber(value, fractionDigits = 2) {
    // For example: toReadableNumber(10550000000) yields "10.6B"
    let prefix = '';
    if (value <= 0) {
        value = -value;
        prefix = '-';
    }
    const thousands = ~~(log10(value) / log10(1000)); // discard the floating point part
    return prefix + (value / Math.pow(1000.0, thousands)).toFixed(fractionDigits) + numberUnits[thousands];
}
