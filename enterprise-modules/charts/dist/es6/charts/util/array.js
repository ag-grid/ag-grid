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
    return typeof min === 'undefined' || typeof max === 'undefined' ? undefined : [min, max];
}
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
 * This method will only return `undefined` if there's not a single valid finite number present
 * in the given array of values. Date values will be converted to timestamps.
 * @param values
 */
export function numericExtent(values) {
    var calculatedExtent = extent(values);
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
export function sumPositiveValues(array) {
    return array.reduce(function (total, value) { return value > 0 ? total + value : total; }, 0);
}
