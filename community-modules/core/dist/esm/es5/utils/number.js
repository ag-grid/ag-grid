/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
export function padStartWidthZeros(value, totalStringSize) {
    return value.toString().padStart(totalStringSize, '0');
}
export function createArrayOfNumbers(first, last) {
    var result = [];
    for (var i = first; i <= last; i++) {
        result.push(i);
    }
    return result;
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
    return value.toString().replace('.', decimalSeparator).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + thousandSeparator);
}
export function sum(values) {
    return values == null ? null : values.reduce(function (total, value) { return total + value; }, 0);
}
export function zeroOrGreater(value, defaultValue) {
    if (value >= 0) {
        return value;
    }
    // zero gets returned if number is missing or the wrong type
    return defaultValue;
}
export function oneOrGreater(value, defaultValue) {
    var valueNumber = parseInt(value, 10);
    if (!isNaN(valueNumber) && isFinite(valueNumber) && valueNumber > 0) {
        return valueNumber;
    }
    return defaultValue;
}
