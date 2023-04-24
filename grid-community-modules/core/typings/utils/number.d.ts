export declare function padStartWidthZeros(value: number, totalStringSize: number): string;
export declare function createArrayOfNumbers(first: number, last: number): number[];
export declare function cleanNumber(value: any): number | null;
export declare function decToHex(number: number, bytes: number): string;
export declare function formatNumberTwoDecimalPlacesAndCommas(value: number, thousandSeparator: string, decimalSeparator: string): string;
/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
export declare function formatNumberCommas(value: number, thousandSeparator: string, decimalSeparator: string): string;
export declare function sum(values: number[] | null): number | null;
export declare function zeroOrGreater(value: any, defaultValue: number): number;
export declare function oneOrGreater(value: any, defaultValue?: number): number | undefined;
