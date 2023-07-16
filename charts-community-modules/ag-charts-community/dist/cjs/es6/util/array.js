"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalisedExtent = exports.extent = void 0;
function extent(values) {
    const { length } = values;
    if (length === 0) {
        return undefined;
    }
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < length; i++) {
        let v = values[i];
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
    const extent = [min, max];
    if (extent.some((v) => !isFinite(v))) {
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
