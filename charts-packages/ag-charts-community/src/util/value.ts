// Simplified version of https://github.com/plotly/fast-isnumeric
// that doesn't treat number strings with leading/trailing whitespace as numbers.
export function isNumber(n: any): boolean {
    const type = typeof n;
    if (type === 'string') {
        return false;
    } else if (type !== 'number') {
        return false;
    }
    // n - n is going to be:
    // - zero, for any finite number
    // -  NaN, for NaN, Infinity, -Infinity
    return n - n < 1;
}

export function isContinuous(value: any): boolean {
    return isNumber(value) || isDate(value) || isNumberValue(value);
}

export function isComparable(value: any): boolean {
    return isContinuous(value) || (typeof value === 'string') && value >= value;
}

export function isDate(value: any): boolean {
    return value instanceof Date && !isNaN(+value);
}

export function isNumberValue(value: any): boolean {
    return !!value && value.valueOf && isNumber(value.valueOf());
}
