// Simplified version of https://github.com/plotly/fast-isnumeric
// that doesn't treat number strings with leading/trailing whitespace as numbers.
export function isNumber(value: any): boolean {
    if (typeof value !== 'number') {
        return false;
    }
    return Number.isFinite(value);
}

export function isNumberObject(value: any): boolean {
    return !!value && value.hasOwnProperty('valueOf') && isNumber(value.valueOf());
}

export function isNumeric(value: any): boolean {
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

export function isDiscrete(value: any): boolean {
    return isString(value) || isStringObject(value);
}

export function isContinuous(value: any): boolean {
    return isNumeric(value) || isDate(value);
}

export function checkDatum<T>(value: T, isContinuousScale: boolean): T | string | undefined {
    if (isContinuousScale && isContinuous(value)) {
        return value;
    } else if (!isContinuousScale) {
        if (!isDiscrete(value)) {
            return String(value);
        }
        return value;
    }
    return undefined;
}
