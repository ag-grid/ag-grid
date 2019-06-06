// ag-grid-enterprise v21.0.1
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
function checkExtent(values) {
    if (values[0] !== undefined && values[1] !== undefined) {
        return values;
    }
    throw new Error("Invalid extent: " + values);
}
exports.checkExtent = checkExtent;
