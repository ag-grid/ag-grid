/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { padStart } from "./string";
export function padStartWidthZeros(value, totalStringSize) {
    return padStart(value.toString(), totalStringSize, '0');
}
export function createArrayOfNumbers(first, last) {
    var result = [];
    for (var i = first; i <= last; i++) {
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
export function getMaxSafeInteger() {
    // @ts-ignore
    return Number.MAX_SAFE_INTEGER || 9007199254740991;
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
    var hex = '';
    for (var i = 0; i < bytes; i++) {
        hex += String.fromCharCode(number & 0xff);
        number >>>= 8;
    }
    return hex;
}
export function formatNumberTwoDecimalPlacesAndCommas(value) {
    if (typeof value !== 'number') {
        return '';
    }
    return formatNumberCommas(Math.round(value * 100) / 100);
}
/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
export function formatNumberCommas(value) {
    if (typeof value !== 'number') {
        return '';
    }
    return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
export function sum(values) {
    return values == null ? null : values.reduce(function (total, value) { return total + value; }, 0);
}
