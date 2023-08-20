export function ascendingStringNumberUndefined(a, b) {
    var diff = 0;
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
export function compoundAscending(a, b, comparator) {
    var toLiteral = function (v) {
        if (typeof v === 'function') {
            return v();
        }
        return v;
    };
    for (var idx in a) {
        var diff = comparator(toLiteral(a[idx]), toLiteral(b[idx]));
        if (diff !== 0) {
            return diff;
        }
    }
    return 0;
}
