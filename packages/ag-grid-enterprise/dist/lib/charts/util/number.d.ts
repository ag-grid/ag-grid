// ag-grid-enterprise v21.2.2
export declare function isEqual(a: number, b: number, epsilon?: number): boolean;
/**
 * `Number.toFixed(n)` always formats a number so that it has `n` digits after the decimal point.
 * For example, `Number(0.00003427).toFixed(2)` returns `0.00`.
 * That's not very helpful, because all the meaningful information is lost.
 * In this case we would want the formatted value to have at least two significant digits: `0.000034`,
 * not two fraction digits.
 * @param value
 * @param fractionOrSignificantDigits
 */
export declare function toFixed(value: number, fractionOrSignificantDigits?: number): string;
export declare function toReadableNumber(value: number, fractionDigits?: number): string;
