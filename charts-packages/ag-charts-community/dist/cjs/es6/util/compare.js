"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compoundAscending = exports.ascendingStringNumberUndefined = void 0;
function ascendingStringNumberUndefined(a, b) {
    let diff = 0;
    if (typeof a === 'number' && typeof b === 'number') {
        diff = a - b;
    }
    else if (typeof a === 'string' && typeof b === 'string') {
        diff = a.localeCompare(b);
    }
    else if (a == null && b == null) {
        // Equal.
    }
    else if (a == null) {
        diff = -1;
    }
    else if (b == null) {
        diff = 1;
    }
    else {
        diff = String(a).localeCompare(String(b));
    }
    return diff;
}
exports.ascendingStringNumberUndefined = ascendingStringNumberUndefined;
function compoundAscending(a, b, comparator) {
    for (const idx in a) {
        const diff = comparator(a[idx], b[idx]);
        if (diff !== 0) {
            return diff;
        }
    }
    return 0;
}
exports.compoundAscending = compoundAscending;
