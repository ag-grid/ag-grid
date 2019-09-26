// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns the minimum and maximum value in the given iterable using natural order.
 * If the iterable contains no comparable values, returns `[undefined, undefined]`.
 * @param values
 */
function extent(values) {
    var n = values.length;
    var i = -1;
    var value;
    var min;
    var max;
    while (++i < n) { // Find the first comparable value.
        if ((value = values[i]) != null && value >= value) {
            min = max = value;
            while (++i < n) { // Compare the remaining values.
                if ((value = values[i]) != null) {
                    if (min > value) {
                        min = value;
                    }
                    if (max < value) {
                        max = value;
                    }
                }
            }
        }
    }
    return [min, max];
}
exports.extent = extent;
function find(arr, predicate) {
    for (var i = 0, ln = arr.length; i < ln; i++) {
        var value = arr[i];
        if (predicate(value, i, arr)) {
            return value;
        }
    }
}
exports.find = find;
// This method will only return `undefined`, if there's not a single valid finite number
// in the given array of values.
function numericExtent(values) {
    var _a = extent(values), min = _a[0], max = _a[1];
    if (typeof min === 'number' && isFinite(min) && typeof max === 'number' && isFinite(max)) {
        return [min, max];
    }
}
exports.numericExtent = numericExtent;
