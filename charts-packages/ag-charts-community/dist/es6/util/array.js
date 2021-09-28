// Custom `Array.find` implementation for legacy browsers.
export function find(arr, predicate) {
    for (var i = 0; i < arr.length; i++) {
        var value = arr[i];
        if (predicate(value, i, arr)) {
            return value;
        }
    }
}
export function findIndex(arr, predicate) {
    for (var i = 0; i < arr.length; i++) {
        if (predicate(arr[i], i, arr)) {
            return i;
        }
    }
    return -1;
}
function identity(value) {
    return value;
}
export function extent(values, predicate, map) {
    var transform = map || identity;
    var n = values.length;
    var i = -1;
    var value;
    var min;
    var max;
    while (++i < n) { // Find the first value.
        value = values[i];
        if (predicate(value)) {
            min = max = value;
            while (++i < n) { // Compare the remaining values.
                value = values[i];
                if (predicate(value)) {
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
    return min === undefined || max === undefined ? undefined : [transform(min), transform(max)];
}
/**
 * finds the min and max using a process appropriate for stacked values. Ie,
 * summing up the positive and negative numbers, and returning the totals of each
 */
export function findMinMax(values) {
    var min = 0;
    var max = 0;
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var value = values_1[_i];
        if (value < 0) {
            min += value;
        }
        else {
            max += value;
        }
    }
    return { min: min, max: max };
}
export function copy(array, start, count) {
    if (start === void 0) { start = 0; }
    if (count === void 0) { count = array.length; }
    var result = [];
    var n = array.length;
    if (n) {
        for (var i = 0; i < count; i++) {
            result.push(array[(start + i) % n]);
        }
    }
    return result;
}
