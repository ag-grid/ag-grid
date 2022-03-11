"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Simplified version of https://github.com/plotly/fast-isnumeric
// that doesn't treat number strings with leading/trailing whitespace as numbers.
function isNumber(value) {
    var type = typeof value;
    if (type === 'string') {
        return false;
    }
    else if (type !== 'number') {
        return false;
    }
    // value - value is going to be:
    // - zero, for any finite number
    // -  NaN, for NaN, Infinity, -Infinity
    return value - value < 1;
}
exports.isNumber = isNumber;
function isNumberObject(value) {
    return !!value && value.hasOwnProperty('valueOf') && isNumber(value.valueOf());
}
exports.isNumberObject = isNumberObject;
function isNumeric(value) {
    return isNumber(value) || isNumberObject(value);
}
exports.isNumeric = isNumeric;
function isDate(value) {
    return value instanceof Date && !isNaN(+value);
}
exports.isDate = isDate;
function isString(value) {
    return typeof value === 'string';
}
exports.isString = isString;
function isStringObject(value) {
    return !!value && value.hasOwnProperty('toString') && isString(value.toString());
}
exports.isStringObject = isStringObject;
function isDiscrete(value) {
    return isString(value) || isStringObject(value);
}
exports.isDiscrete = isDiscrete;
function isContinuous(value) {
    return isNumeric(value) || isDate(value);
}
exports.isContinuous = isContinuous;
function isComparable(value) {
    return isContinuous(value) || isDiscrete(value) && value >= value;
}
exports.isComparable = isComparable;
//# sourceMappingURL=value.js.map