// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function bisect(list, x, comparator, lo, hi) {
    if (lo === void 0) { lo = 0; }
    if (hi === void 0) { hi = list.length; }
    return bisectRight(list, x, comparator, lo, hi);
}
exports.bisect = bisect;
function bisectRight(list, x, comparator, low, high) {
    if (low === void 0) { low = 0; }
    if (high === void 0) { high = list.length; }
    var lo = low;
    var hi = high;
    while (lo < hi) {
        var mid = (lo + hi) >> 1;
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
function bisectLeft(list, x, comparator, low, high) {
    if (low === void 0) { low = 0; }
    if (high === void 0) { high = list.length; }
    var lo = low;
    var hi = high;
    while (lo < hi) {
        var mid = (lo + hi) >> 1;
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
