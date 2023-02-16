export const isString = (v) => typeof v === 'string';
export const isStringObject = (v) => !!v && v.hasOwnProperty('toString') && isString(v.toString());
export const isDate = (v) => v instanceof Date && !isNaN(+v);
export function isDiscrete(value) {
    return isString(value) || isStringObject(value);
}
export function isContinuous(value) {
    const isNumberObject = (v) => !!v && v.hasOwnProperty('valueOf') && isNumber(v.valueOf());
    const isDate = (v) => v instanceof Date && !isNaN(+v);
    return isNumber(value) || isNumberObject(value) || isDate(value);
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
