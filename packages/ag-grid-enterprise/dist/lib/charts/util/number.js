// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isEqual(a, b, epsilon) {
    if (epsilon === void 0) { epsilon = 1e-10; }
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
function toFixed(value, fractionOrSignificantDigits) {
    if (fractionOrSignificantDigits === void 0) { fractionOrSignificantDigits = 2; }
    var power = Math.floor(Math.log(Math.abs(value)) / Math.LN10);
    if (power >= 0) {
        return value.toFixed(fractionOrSignificantDigits); // fraction digits
    }
    return value.toFixed(Math.abs(power) - 1 + fractionOrSignificantDigits); // significant digits
}
exports.toFixed = toFixed;
var numberUnits = ["", "K", "M", "B", "T"];
function toReadableNumber(value, fractionDigits) {
    if (fractionDigits === void 0) { fractionDigits = 2; }
    // For example: toReadableNumber(10550000000) yields "10.6B"
    var prefix = '';
    if (value <= 0) {
        value = -value;
        prefix = '-';
    }
    var thousands = ~~(Math.log10(value) / Math.log10(1000)); // discard the floating point part
    return prefix + (value / Math.pow(1000.0, thousands)).toFixed(fractionDigits) + numberUnits[thousands];
}
exports.toReadableNumber = toReadableNumber;
