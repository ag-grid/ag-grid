"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function equal(a, b) {
    if (a === b)
        return true;
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor)
            return false;
        var length_1, i = void 0;
        if (Array.isArray(a)) {
            length_1 = a.length;
            if (length_1 != b.length)
                return false;
            for (i = length_1; i-- !== 0;)
                if (!equal(a[i], b[i]))
                    return false;
            return true;
        }
        // if ((a instanceof Map) && (b instanceof Map)) {
        //     if (a.size !== b.size) return false;
        //     for (i of a.entries())
        //         if (!b.has(i[0])) return false;
        //     for (i of a.entries())
        //         if (!equal(i[1], b.get(i[0]))) return false;
        //     return true;
        // }
        //
        // if ((a instanceof Set) && (b instanceof Set)) {
        //     if (a.size !== b.size) return false;
        //     for (i of a.entries())
        //         if (!b.has(i[0])) return false;
        //     return true;
        // }
        //
        // if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
        //     length = a.length;
        //     if (length != b.length) return false;
        //     for (i = length; i-- !== 0;)
        //         if (a[i] !== b[i]) return false;
        //     return true;
        // }
        if (a.constructor === RegExp)
            return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf)
            return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString)
            return a.toString() === b.toString();
        var keys = Object.keys(a);
        length_1 = keys.length;
        if (length_1 !== Object.keys(b).length)
            return false;
        for (i = length_1; i-- !== 0;)
            if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
                return false;
        for (i = length_1; i-- !== 0;) {
            var key = keys[i];
            if (!equal(a[key], b[key]))
                return false;
        }
        return true;
    }
    // true if both NaN, false otherwise
    return a !== a && b !== b;
}
exports.equal = equal;
//# sourceMappingURL=equal.js.map