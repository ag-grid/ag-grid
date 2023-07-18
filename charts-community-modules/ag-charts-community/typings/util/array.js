"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalisedExtent = exports.extent = void 0;
function extent(values) {
    var length = values.length;
    if (length === 0) {
        return undefined;
    }
    var min = Infinity;
    var max = -Infinity;
    for (var i = 0; i < length; i++) {
        var v = values[i];
        if (v instanceof Date) {
            v = v.getTime();
        }
        if (typeof v !== 'number') {
            continue;
        }
        if (v < min) {
            min = v;
        }
        if (v > max) {
            max = v;
        }
    }
    var extent = [min, max];
    if (extent.some(function (v) { return !isFinite(v); })) {
        return undefined;
    }
    return extent;
}
exports.extent = extent;
function normalisedExtent(d, min, max) {
    var _a;
    if (d.length > 2) {
        d = (_a = extent(d)) !== null && _a !== void 0 ? _a : [NaN, NaN];
    }
    if (!isNaN(min)) {
        d = [min, d[1]];
    }
    if (!isNaN(max)) {
        d = [d[0], max];
    }
    if (d[0] > d[1]) {
        d = [];
    }
    return d;
}
exports.normalisedExtent = normalisedExtent;
//# sourceMappingURL=array.js.map