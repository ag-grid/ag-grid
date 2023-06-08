export var isString = function (v) { return typeof v === 'string'; };
export var isStringObject = function (v) {
    return !!v && Object.prototype.hasOwnProperty.call(v, 'toString') && isString(v.toString());
};
export var isDate = function (v) { return v instanceof Date && !isNaN(+v); };
export function isDiscrete(value) {
    return isString(value) || isStringObject(value);
}
export function isContinuous(value) {
    var isNumberObject = function (v) {
        return !!v && Object.prototype.hasOwnProperty.call(v, 'valueOf') && isNumber(v.valueOf());
    };
    var isDate = function (v) { return v instanceof Date && !isNaN(+v); };
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
export var isNumber = function (v) { return typeof v === 'number' && Number.isFinite(v); };
