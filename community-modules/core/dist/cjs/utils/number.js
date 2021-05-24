/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var string_1 = require("./string");
function padStartWidthZeros(value, totalStringSize) {
    return string_1.padStart(value.toString(), totalStringSize, '0');
}
exports.padStartWidthZeros = padStartWidthZeros;
function createArrayOfNumbers(first, last) {
    var result = [];
    for (var i = first; i <= last; i++) {
        result.push(i);
    }
    return result;
}
exports.createArrayOfNumbers = createArrayOfNumbers;
/**
 * Check if a value is numeric
 * from http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
 * @param {any} value
 * @return {boolean}
 */
function isNumeric(value) {
    return value !== '' && !isNaN(parseFloat(value)) && isFinite(value);
}
exports.isNumeric = isNumeric;
function getMaxSafeInteger() {
    // @ts-ignore
    return Number.MAX_SAFE_INTEGER || 9007199254740991;
}
exports.getMaxSafeInteger = getMaxSafeInteger;
function cleanNumber(value) {
    if (typeof value === 'string') {
        value = parseInt(value, 10);
    }
    if (typeof value === 'number') {
        return Math.floor(value);
    }
    return null;
}
exports.cleanNumber = cleanNumber;
function decToHex(number, bytes) {
    var hex = '';
    for (var i = 0; i < bytes; i++) {
        hex += String.fromCharCode(number & 0xff);
        number >>>= 8;
    }
    return hex;
}
exports.decToHex = decToHex;
function formatNumberTwoDecimalPlacesAndCommas(value) {
    if (typeof value !== 'number') {
        return '';
    }
    return formatNumberCommas(Math.round(value * 100) / 100);
}
exports.formatNumberTwoDecimalPlacesAndCommas = formatNumberTwoDecimalPlacesAndCommas;
/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
function formatNumberCommas(value) {
    if (typeof value !== 'number') {
        return '';
    }
    return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
exports.formatNumberCommas = formatNumberCommas;
function sum(values) {
    return values == null ? null : values.reduce(function (total, value) { return total + value; }, 0);
}
exports.sum = sum;

//# sourceMappingURL=number.js.map
