"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatMap = exports.partition = void 0;
function partition(items, selector) {
    return items.reduce(function (groupedItems, item) {
        var key = selector(item);
        var existingItems = groupedItems.get(key);
        return groupedItems.set(key, existingItems ? __spreadArray(__spreadArray([], __read(existingItems), false), [item], false) : [item]);
    }, new Map());
}
exports.partition = partition;
function flatMap(items, iteratee) {
    return items.reduce(function (acc, item, index, array) { return acc.concat(iteratee(item, index, array)); }, new Array());
}
exports.flatMap = flatMap;
