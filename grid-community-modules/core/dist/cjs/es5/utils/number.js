/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneOrGreater = exports.zeroOrGreater = exports.sum = exports.formatNumberCommas = exports.formatNumberTwoDecimalPlacesAndCommas = exports.decToHex = exports.cleanNumber = exports.createArrayOfNumbers = exports.padStartWidthZeros = void 0;
function padStartWidthZeros(value, totalStringSize) {
    return value.toString().padStart(totalStringSize, '0');
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
function formatNumberTwoDecimalPlacesAndCommas(value, thousandSeparator, decimalSeparator) {
    if (typeof value !== 'number') {
        return '';
    }
    return formatNumberCommas(Math.round(value * 100) / 100, thousandSeparator, decimalSeparator);
}
exports.formatNumberTwoDecimalPlacesAndCommas = formatNumberTwoDecimalPlacesAndCommas;
/**
 * the native method number.toLocaleString(undefined, {minimumFractionDigits: 0})
 * puts in decimal places in IE, so we use this method instead
 * from: http://blog.tompawlak.org/number-currency-formatting-javascript
 * @param {number} value
 * @returns {string}
 */
function formatNumberCommas(value, thousandSeparator, decimalSeparator) {
    if (typeof value !== 'number') {
        return '';
    }
    return value.toString().replace('.', decimalSeparator).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + thousandSeparator);
}
exports.formatNumberCommas = formatNumberCommas;
function sum(values) {
    return values == null ? null : values.reduce(function (total, value) { return total + value; }, 0);
}
exports.sum = sum;
function zeroOrGreater(value, defaultValue) {
    if (value >= 0) {
        return value;
    }
    // zero gets returned if number is missing or the wrong type
    return defaultValue;
}
exports.zeroOrGreater = zeroOrGreater;
function oneOrGreater(value, defaultValue) {
    var valueNumber = parseInt(value, 10);
    if (!isNaN(valueNumber) && isFinite(valueNumber) && valueNumber > 0) {
        return valueNumber;
    }
    return defaultValue;
}
exports.oneOrGreater = oneOrGreater;
