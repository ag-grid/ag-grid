/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
export function padStartWidthZeros(value, totalStringSize) {
    return value.toString().padStart(totalStringSize, '0');
}
export function createArrayOfNumbers(first, last) {
    const result = [];
    for (let i = first; i <= last; i++) {
        result.push(i);
    }
    return result;
}
/**
 * Check if a value is numeric
 * from http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
 * @param {any} value
 * @return {boolean}
 */
export function isNumeric(value) {
    return value !== '' && !isNaN(parseFloat(value)) && isFinite(value);
}
export function cleanNumber(value) {
    if (typeof value === 'string') {
        value = parseInt(value, 10);
    }
    if (typeof value === 'number') {
        return Math.floor(value);
    }
    return null;
}
export function decToHex(number, bytes) {
    let hex = '';
    for (let i = 0; i < bytes; i++) {
        hex += String.fromCharCode(number & 0xff);
        number >>>= 8;
    }
    return hex;
}
export function formatNumberTwoDecimalPlacesAndCommas(value, thousandSeparator, decimalSeparator) {
    if (typeof value !== 'number') {
        return '';
    }
    return formatNumberCommas(Math.round(value * 100) / 100, thousandSeparator, decimalSeparator);
}
/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
export function formatNumberCommas(value, thousandSeparator, decimalSeparator) {
    if (typeof value !== 'number') {
        return '';
    }
    return value.toString().replace('.', decimalSeparator).replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${thousandSeparator}`);
}
export function sum(values) {
    return values == null ? null : values.reduce((total, value) => total + value, 0);
}
