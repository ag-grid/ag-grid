export const isString = (v) => typeof v === 'string';
export const isStringObject = (v) => !!v && v.hasOwnProperty('toString') && isString(v.toString());
export const isDate = (v) => v instanceof Date && !isNaN(+v);
export function isDiscrete(value) {
    if (isString(value)) {
        return true;
    }
    else if (isStringObject(value)) {
        return true;
    }
    return false;
}
export function isContinuous(value) {
    const isNumberObject = (v) => !!v && v.hasOwnProperty('valueOf') && isNumber(v.valueOf());
    const isDate = (v) => v instanceof Date && !isNaN(+v);
    if (isNumber(value)) {
        return true;
    }
    else if (isNumberObject(value)) {
        return true;
    }
    else if (isDate(value)) {
        return true;
    }
    return false;
}
export function checkDatum(value, isContinuousScale) {
    if (isContinuousScale && isContinuous(value)) {
        return value;
    }
    else if (!isContinuousScale) {
        if (!isDiscrete(value)) {
            return String(value);
        }
        return value;
    }
    return undefined;
}
export const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
