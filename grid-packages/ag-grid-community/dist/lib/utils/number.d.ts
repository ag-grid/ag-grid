export declare function padStartWidthZeros(value: number, totalStringSize: number): string;
export declare function createArrayOfNumbers(first: number, last: number): number[];
/**
 * Check if a value is numeric
 * from http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
 * @param {any} value
 * @return {boolean}
 */
export declare function isNumeric(value: any): boolean;
export declare function getMaxSafeInteger(): number;
export declare function cleanNumber(value: any): number | null;
export declare function decToHex(number: number, bytes: number): string;
export declare function formatNumberTwoDecimalPlacesAndCommas(value: number): string;
/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
export declare function formatNumberCommas(value: number): string;
export declare function sum(values: number[] | null): number | null;
