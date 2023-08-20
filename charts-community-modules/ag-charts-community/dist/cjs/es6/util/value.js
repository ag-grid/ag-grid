"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumber = exports.checkDatum = exports.isContinuous = exports.isDiscrete = exports.isDate = exports.isStringObject = exports.isString = void 0;
const isString = (v) => typeof v === 'string';
exports.isString = isString;
const isStringObject = (v) => !!v && Object.prototype.hasOwnProperty.call(v, 'toString') && exports.isString(v.toString());
exports.isStringObject = isStringObject;
const isDate = (v) => v instanceof Date && !isNaN(+v);
exports.isDate = isDate;
function isDiscrete(value) {
    return exports.isString(value) || exports.isStringObject(value);
}
exports.isDiscrete = isDiscrete;
function isContinuous(value) {
    const isNumberObject = (v) => !!v && Object.prototype.hasOwnProperty.call(v, 'valueOf') && exports.isNumber(v.valueOf());
    const isDate = (v) => v instanceof Date && !isNaN(+v);
    return exports.isNumber(value) || isNumberObject(value) || isDate(value);
}
exports.isContinuous = isContinuous;
function checkDatum(value, isContinuousScale) {
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
exports.checkDatum = checkDatum;
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
exports.isNumber = isNumber;
