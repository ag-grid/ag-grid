// Simplified version of https://github.com/plotly/fast-isnumeric
// that doesn't treat number strings with leading/trailing whitespace as numbers.
export function isNumber(value: any): boolean {
    if (typeof value !== 'number') {
        return false;
    }
    return Number.isFinite(value);
}

function isNumberObject(value: any): boolean {
    return !!value && value.hasOwnProperty('valueOf') && isNumber(value.valueOf());
}

function isNumeric(value: any): boolean {
    return isNumber(value) || isNumberObject(value);
}

export function isDate(value: any): boolean {
    return value instanceof Date && !isNaN(+value);
}

export function isString(value: any): boolean {
    return typeof value === 'string';
}

export function isStringObject(value: any): boolean {
    return !!value && value.hasOwnProperty('toString') && isString(value.toString());
}

export function isContinuous(value: any): boolean {
    return isNumeric(value) || isDate(value);
}
