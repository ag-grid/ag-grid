// Simplified version of https://github.com/plotly/fast-isnumeric
// that doesn't treat number strings with leading/trailing whitespace as numbers.
export function isNumber(value) {
    if (typeof value !== 'number') {
        return false;
    }
    return Number.isFinite(value);
}
export function isNumberObject(value) {
    return !!value && value.hasOwnProperty('valueOf') && isNumber(value.valueOf());
}
export function isNumeric(value) {
    return isNumber(value) || isNumberObject(value);
}
export function isDate(value) {
    return value instanceof Date && !isNaN(+value);
}
export function isString(value) {
    return typeof value === 'string';
}
export function isStringObject(value) {
    return !!value && value.hasOwnProperty('toString') && isString(value.toString());
}
export function isDiscrete(value) {
    return isString(value) || isStringObject(value);
}
export function isContinuous(value) {
    return isNumeric(value) || isDate(value);
}
