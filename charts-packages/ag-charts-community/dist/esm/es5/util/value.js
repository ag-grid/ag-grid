export var isString = function (v) { return typeof v === 'string'; };
export var isStringObject = function (v) { return !!v && v.hasOwnProperty('toString') && isString(v.toString()); };
export var isDate = function (v) { return v instanceof Date && !isNaN(+v); };
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
    var isNumberObject = function (v) { return !!v && v.hasOwnProperty('valueOf') && isNumber(v.valueOf()); };
    var isDate = function (v) { return v instanceof Date && !isNaN(+v); };
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
export var isNumber = function (v) { return typeof v === 'number' && Number.isFinite(v); };
