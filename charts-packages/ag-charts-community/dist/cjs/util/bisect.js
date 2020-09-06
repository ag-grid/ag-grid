"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compare_1 = require("./compare");
/**
 * Returns the insertion point for `x` in array to maintain sorted order.
 * The arguments `lo` and `hi` may be used to specify a subset of the array which should be considered;
 * by default the entire array is used. If `x` is already present in array, the insertion point will be before
 * (to the left of) any existing entries. The return value is suitable for use as the first argument to `splice`
 * assuming that array is already sorted. The returned insertion point `i` partitions the array into two halves
 * so that all `v < x` for `v` in `array.slice(lo, i)` for the left side and all `v >= x` for `v` in `array.slice(i, hi)`
 * for the right side.
 * @param list
 * @param x
 * @param comparator
 * @param lo
 * @param hi
 */
function bisectLeft(list, x, comparator, lo, hi) {
    if (lo === void 0) { lo = 0; }
    if (hi === void 0) { hi = list.length; }
    while (lo < hi) {
        var mid = (lo + hi) >>> 1;
        if (comparator(list[mid], x) < 0) { // list[mid] < x
            lo = mid + 1;
        }
        else {
            hi = mid;
        }
    }
    return lo;
}
exports.bisectLeft = bisectLeft;
function bisectRight(list, x, comparator, lo, hi) {
    if (lo === void 0) { lo = 0; }
    if (hi === void 0) { hi = list.length; }
    while (lo < hi) {
        var mid = (lo + hi) >>> 1;
        if (comparator(list[mid], x) > 0) { // list[mid] > x
            hi = mid;
        }
        else {
            lo = mid + 1;
        }
    }
    return lo;
}
exports.bisectRight = bisectRight;
/**
 * A specialized version of `bisectLeft` that works with the arrays whose elements cannot be compared directly.
 * The map function is used instead to produce a comparable value for a given array element, then the values
 * returned by the map are compared using the `ascendingComparator`.
 * @param list
 * @param x
 * @param map
 * @param lo
 * @param hi
 */
function complexBisectLeft(list, x, map, lo, hi) {
    if (lo === void 0) { lo = 0; }
    if (hi === void 0) { hi = list.length; }
    var comparator = ascendingComparator(map);
    while (lo < hi) {
        var mid = (lo + hi) >>> 1;
        if (comparator(list[mid], x) < 0) {
            lo = mid + 1;
        }
        else {
            hi = mid;
        }
    }
    return lo;
}
exports.complexBisectLeft = complexBisectLeft;
function complexBisectRight(list, x, map, lo, hi) {
    if (lo === void 0) { lo = 0; }
    if (hi === void 0) { hi = list.length; }
    var comparator = ascendingComparator(map);
    while (lo < hi) {
        var mid = (lo + hi) >>> 1;
        if (comparator(list[mid], x) < 0) {
            lo = mid + 1;
        }
        else {
            hi = mid;
        }
    }
    return lo;
}
exports.complexBisectRight = complexBisectRight;
function ascendingComparator(map) {
    return function (item, x) {
        return compare_1.ascending(map(item), x);
    };
}
//# sourceMappingURL=bisect.js.map