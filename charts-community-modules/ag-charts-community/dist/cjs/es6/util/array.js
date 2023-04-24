"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMinMax = exports.extent = void 0;
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
/**
 * finds the min and max using a process appropriate for stacked values. Ie,
 * summing up the positive and negative numbers, and returning the totals of each
 */
function findMinMax(values) {
    let min = undefined;
    let max = undefined;
    for (const value of values) {
        if (value < 0) {
            min = (min !== null && min !== void 0 ? min : 0) + value;
        }
        else if (value >= 0) {
            max = (max !== null && max !== void 0 ? max : 0) + value;
        }
    }
    return { min, max };
}
exports.findMinMax = findMinMax;
