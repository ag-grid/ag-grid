export function isEqual(a: number, b: number, epsilon: number = 1e-10) {
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
export function toFixed(value: number, fractionOrSignificantDigits: number = 2): string {
    const power = Math.floor(Math.log(Math.abs(value)) / Math.LN10);
    if (power >= 0) {
        return value.toFixed(fractionOrSignificantDigits); // fraction digits
    }
    return value.toFixed(Math.abs(power) - 1 + fractionOrSignificantDigits); // significant digits
}

const numberUnits = ["", "K", "M", "B", "T"];

export function toReadableNumber(value: number, fractionDigits: number = 2): string {
    // For example: toReadableNumber(10550000000) yields "10.6B"
    let prefix = '';
    if (value <= 0) {
        value = -value;
        prefix = '-';
    }
    const thousands = ~~(Math.log10(value) / Math.log10(1000)); // discard the floating point part
    return prefix + (value / Math.pow(1000.0, thousands)).toFixed(fractionDigits) + numberUnits[thousands];
}
