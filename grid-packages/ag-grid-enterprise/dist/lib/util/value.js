"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumber = exports.checkDatum = exports.isContinuous = exports.isDiscrete = exports.isDate = exports.isStringObject = exports.isString = void 0;
var isString = function (v) { return typeof v === 'string'; };
exports.isString = isString;
var isStringObject = function (v) {
    return !!v && Object.prototype.hasOwnProperty.call(v, 'toString') && exports.isString(v.toString());
};
exports.isStringObject = isStringObject;
var isDate = function (v) { return v instanceof Date && !isNaN(+v); };
exports.isDate = isDate;
function isDiscrete(value) {
    return exports.isString(value) || exports.isStringObject(value);
}
exports.isDiscrete = isDiscrete;
function isContinuous(value) {
    var isNumberObject = function (v) {
        return !!v && Object.prototype.hasOwnProperty.call(v, 'valueOf') && exports.isNumber(v.valueOf());
    };
    var isDate = function (v) { return v instanceof Date && !isNaN(+v); };
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
var isNumber = function (v) { return typeof v === 'number' && Number.isFinite(v); };
exports.isNumber = isNumber;
//# sourceMappingURL=value.js.map