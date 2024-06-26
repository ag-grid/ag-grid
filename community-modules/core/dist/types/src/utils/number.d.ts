export declare function toNumber(value: any): number | undefined;
export declare function toConstrainedNum(min: number, max?: number): (value: any) => number | undefined;
export declare function _padStartWidthZeros(value: number, totalStringSize: number): string;
export declare function _createArrayOfNumbers(first: number, last: number): number[];
export declare function _formatNumberTwoDecimalPlacesAndCommas(value: number, thousandSeparator: string, decimalSeparator: string): string;
/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
export declare function _formatNumberCommas(value: number, thousandSeparator: string, decimalSeparator: string): string;
export declare function _sum(values: number[] | null): number | null;
