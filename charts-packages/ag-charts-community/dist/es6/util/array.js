// Custom `Array.find` implementation for legacy browsers.
export function find(arr, predicate) {
    for (var i = 0, ln = arr.length; i < ln; i++) {
        var value = arr[i];
        if (predicate(value, i, arr)) {
            return value;
        }
    }
}
/**
 * Returns the minimum and maximum value in the given iterable using natural order.
 * If the iterable contains no comparable values, returns `undefined`.
 * @param values
 */
export function extent(values) {
    var n = values.length;
    var i = -1;
    var value;
    var min;
    var max;
    while (++i < n) { // Find the first comparable finite value.
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
    return typeof min === 'undefined' || typeof max === 'undefined' ? undefined : [min, max];
}
export function finiteExtent(values) {
    var n = values.length;
    var i = -1;
    var value;
    var min;
    var max;
    while (++i < n) { // Find the first comparable finite value.
        if ((value = values[i]) != null && value >= value && isFinite(value)) {
            min = max = value;
            while (++i < n) { // Compare the remaining values.
                if ((value = values[i]) != null && isFinite(value)) {
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
    return min === undefined || max === undefined ? undefined : [min, max];
}
/**
 * This method will only return `undefined` if there's not a single valid finite number present
 * in the given array of values. Date values will be converted to timestamps.
 * @param values
 */
export function numericExtent(values) {
    var calculatedExtent = finiteExtent(values);
    if (typeof calculatedExtent === 'undefined') {
        return;
    }
    var a = calculatedExtent[0], b = calculatedExtent[1];
    var min = a instanceof Date ? a.getTime() : a;
    var max = b instanceof Date ? b.getTime() : b;
    if (typeof min === 'number' && isFinite(min) && typeof max === 'number' && isFinite(max)) {
        return [min, max];
    }
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
export function findLargestMinMax(totals) {
    var min = 0;
    var max = 0;
    for (var _i = 0, totals_1 = totals; _i < totals_1.length; _i++) {
        var total = totals_1[_i];
        if (total.min < min) {
            min = total.min;
        }
        if (total.max > max) {
            max = total.max;
        }
    }
    return { min: min, max: max };
}
