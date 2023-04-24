"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMinMax = exports.extent = void 0;
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
/**
 * finds the min and max using a process appropriate for stacked values. Ie,
 * summing up the positive and negative numbers, and returning the totals of each
 */
function findMinMax(values) {
    var e_1, _a;
    var min = undefined;
    var max = undefined;
    try {
        for (var values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
            var value = values_1_1.value;
            if (value < 0) {
                min = (min !== null && min !== void 0 ? min : 0) + value;
            }
            else if (value >= 0) {
                max = (max !== null && max !== void 0 ? max : 0) + value;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (values_1_1 && !values_1_1.done && (_a = values_1.return)) _a.call(values_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return { min: min, max: max };
}
exports.findMinMax = findMinMax;
//# sourceMappingURL=array.js.map