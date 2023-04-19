"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumber = exports.checkDatum = exports.isContinuous = exports.isDiscrete = exports.isDate = exports.isStringObject = exports.isString = void 0;
exports.isString = function (v) { return typeof v === 'string'; };
exports.isStringObject = function (v) {
    return !!v && Object.prototype.hasOwnProperty.call(v, 'toString') && exports.isString(v.toString());
};
exports.isDate = function (v) { return v instanceof Date && !isNaN(+v); };
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
exports.isNumber = function (v) { return typeof v === 'number' && Number.isFinite(v); };
//# sourceMappingURL=value.js.map