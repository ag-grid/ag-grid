export declare function clamp(min: number, value: number, max: number): number;
export declare function clampArray(value: number, array: number[]): number;
export declare function findMinMax(array: number[]): number[];
export declare function findRangeExtent(array: number[]): number;
export declare function isEqual(a: number, b: number, epsilon?: number): boolean;
export declare function isNegative(value: number): boolean;
export declare function round(value: number, decimals?: number): number;
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
/**
 * Returns the mathematically correct n modulus of m. For context, the JS % operator is remainder
 * NOT modulus, which is why this is needed.
 */
export declare function mod(n: number, m: number): number;
export declare function countFractionDigits(value: number, maximumFractionDigits?: number): number;
