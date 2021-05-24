/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generic_1 = require("./generic");
function firstExistingValue() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (generic_1.exists(value)) {
            return value;
        }
    }
    return null;
}
exports.firstExistingValue = firstExistingValue;
/** @deprecated */
function anyExists(values) {
    return values && firstExistingValue(values) != null;
}
exports.anyExists = anyExists;
function existsAndNotEmpty(value) {
    return value != null && value.length > 0;
}
exports.existsAndNotEmpty = existsAndNotEmpty;
function last(arr) {
    if (!arr || !arr.length) {
        return;
    }
    return arr[arr.length - 1];
}
exports.last = last;
function areEqual(a, b, comparator) {
    if (a == null && b == null) {
        return true;
    }
    return a != null &&
        b != null &&
        a.length === b.length &&
        every(a, function (value, index) { return comparator ? comparator(value, b[index]) : b[index] === value; });
}
exports.areEqual = areEqual;
/** @deprecated */
function compareArrays(array1, array2) {
    return areEqual(array1, array2);
}
exports.compareArrays = compareArrays;
/** @deprecated */
function shallowCompare(arr1, arr2) {
    return areEqual(arr1, arr2);
}
exports.shallowCompare = shallowCompare;
function sortNumerically(array) {
    return array.sort(function (a, b) { return a - b; });
}
exports.sortNumerically = sortNumerically;
function removeRepeatsFromArray(array, object) {
    if (!array) {
        return;
    }
    for (var index = array.length - 2; index >= 0; index--) {
        var thisOneMatches = array[index] === object;
        var nextOneMatches = array[index + 1] === object;
        if (thisOneMatches && nextOneMatches) {
            array.splice(index + 1, 1);
        }
    }
}
exports.removeRepeatsFromArray = removeRepeatsFromArray;
function removeFromArray(array, object) {
    var index = array.indexOf(object);
    if (index >= 0) {
        array.splice(index, 1);
    }
}
exports.removeFromArray = removeFromArray;
function removeAllFromArray(array, toRemove) {
    forEach(toRemove, function (item) { return removeFromArray(array, item); });
}
exports.removeAllFromArray = removeAllFromArray;
function insertIntoArray(array, object, toIndex) {
    array.splice(toIndex, 0, object);
}
exports.insertIntoArray = insertIntoArray;
function insertArrayIntoArray(dest, src, toIndex) {
    if (dest == null || src == null) {
        return;
    }
    // put items in backwards, otherwise inserted items end up in reverse order
    for (var i = src.length - 1; i >= 0; i--) {
        var item = src[i];
        insertIntoArray(dest, item, toIndex);
    }
}
exports.insertArrayIntoArray = insertArrayIntoArray;
function moveInArray(array, objectsToMove, toIndex) {
    // first take out items from the array
    removeAllFromArray(array, objectsToMove);
    // now add the objects, in same order as provided to us, that means we start at the end
    // as the objects will be pushed to the right as they are inserted
    forEach(objectsToMove.slice().reverse(), function (obj) { return insertIntoArray(array, obj, toIndex); });
}
exports.moveInArray = moveInArray;
function includes(array, value) {
    return array.indexOf(value) > -1;
}
exports.includes = includes;
function flatten(arrayOfArrays) {
    return [].concat.apply([], arrayOfArrays);
}
exports.flatten = flatten;
function pushAll(target, source) {
    if (source == null || target == null) {
        return;
    }
    forEach(source, function (value) { return target.push(value); });
}
exports.pushAll = pushAll;
function toStrings(array) {
    return map(array, generic_1.toStringOrNull);
}
exports.toStrings = toStrings;
function findIndex(collection, predicate) {
    for (var i = 0; i < collection.length; i++) {
        if (predicate(collection[i], i, collection)) {
            return i;
        }
    }
    return -1;
}
exports.findIndex = findIndex;
function fill(collection, value, start, end) {
    if (value === void 0) { value = null; }
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = collection.length; }
    for (var i = start; i < end; i++) {
        collection[i] = value;
    }
    return collection;
}
exports.fill = fill;
/**
 * The implementation of Array.prototype.every in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/bek91dtit8/
 */
function every(list, predicate) {
    if (list == null) {
        return true;
    }
    for (var i = 0; i < list.length; i++) {
        if (!predicate(list[i], i)) {
            return false;
        }
    }
    return true;
}
exports.every = every;
/**
 * The implementation of Array.prototype.some in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/5dk91e4tmt/
 */
function some(list, predicate) {
    if (list == null) {
        return false;
    }
    for (var i = 0; i < list.length; i++) {
        if (predicate(list[i], i)) {
            return true;
        }
    }
    return false;
}
exports.some = some;
/**
 * The implementation of Array.prototype.forEach in browsers is often slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/apk91elt8a/
 */
function forEach(list, action) {
    if (list == null) {
        return;
    }
    for (var i = 0; i < list.length; i++) {
        action(list[i], i);
    }
}
exports.forEach = forEach;
function forEachReverse(list, action) {
    if (list == null) {
        return;
    }
    for (var i = list.length - 1; i >= 0; i--) {
        action(list[i], i);
    }
}
exports.forEachReverse = forEachReverse;
/**
 * The implementation of Array.prototype.map in browsers is generally the same as just using a simple for loop. However,
 * Firefox does exhibit some difference, and this performs no worse in other browsers, so use this if you want improved
 * performance.
 * https://jsbench.me/njk91ez8pc/
 */
function map(list, process) {
    if (list == null) {
        return null;
    }
    var mapped = [];
    for (var i = 0; i < list.length; i++) {
        mapped.push(process(list[i], i));
    }
    return mapped;
}
exports.map = map;
/**
 * The implementation of Array.prototype.filter in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/7bk91fk08c/
 */
function filter(list, predicate) {
    if (list == null) {
        return null;
    }
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
        if (predicate(list[i], i)) {
            filtered.push(list[i]);
        }
    }
    return filtered;
}
exports.filter = filter;
/**
 * The implementation of Array.prototype.reduce in browsers is generally the same as just using a simple for loop. However,
 * Chrome does exhibit some difference, and this performs no worse in other browsers, so use this if you want improved
 * performance.
 * https://jsbench.me/7vk92n6u1f/
 */
function reduce(list, step, initial) {
    if (list == null || initial == null) {
        return null;
    }
    var result = initial;
    for (var i = 0; i < list.length; i++) {
        result = step(result, list[i], i);
    }
    return result;
}
exports.reduce = reduce;
/** @deprecated */
function forEachSnapshotFirst(list, callback) {
    if (!list) {
        return;
    }
    var arrayCopy = list.slice(0);
    arrayCopy.forEach(callback);
}
exports.forEachSnapshotFirst = forEachSnapshotFirst;

//# sourceMappingURL=array.js.map
