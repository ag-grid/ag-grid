/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { exists, toStringOrNull } from './generic';
export function firstExistingValue() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (exists(value)) {
            return value;
        }
    }
    return null;
}
/** @deprecated */
export function anyExists(values) {
    return values && firstExistingValue(values) != null;
}
export function existsAndNotEmpty(value) {
    return value != null && value.length > 0;
}
export function last(arr) {
    if (!arr || !arr.length) {
        return;
    }
    return arr[arr.length - 1];
}
export function areEqual(a, b, comparator) {
    if (a == null && b == null) {
        return true;
    }
    return a != null &&
        b != null &&
        a.length === b.length &&
        every(a, function (value, index) { return comparator ? comparator(value, b[index]) : b[index] === value; });
}
/** @deprecated */
export function compareArrays(array1, array2) {
    return areEqual(array1, array2);
}
/** @deprecated */
export function shallowCompare(arr1, arr2) {
    return areEqual(arr1, arr2);
}
export function sortNumerically(array) {
    return array.sort(function (a, b) { return a - b; });
}
export function removeRepeatsFromArray(array, object) {
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
export function removeFromArray(array, object) {
    var index = array.indexOf(object);
    if (index >= 0) {
        array.splice(index, 1);
    }
}
export function removeAllFromArray(array, toRemove) {
    forEach(toRemove, function (item) { return removeFromArray(array, item); });
}
export function insertIntoArray(array, object, toIndex) {
    array.splice(toIndex, 0, object);
}
export function insertArrayIntoArray(dest, src, toIndex) {
    if (dest == null || src == null) {
        return;
    }
    // put items in backwards, otherwise inserted items end up in reverse order
    for (var i = src.length - 1; i >= 0; i--) {
        var item = src[i];
        insertIntoArray(dest, item, toIndex);
    }
}
export function moveInArray(array, objectsToMove, toIndex) {
    // first take out items from the array
    removeAllFromArray(array, objectsToMove);
    // now add the objects, in same order as provided to us, that means we start at the end
    // as the objects will be pushed to the right as they are inserted
    forEach(objectsToMove.slice().reverse(), function (obj) { return insertIntoArray(array, obj, toIndex); });
}
export function includes(array, value) {
    return array.indexOf(value) > -1;
}
export function flatten(arrayOfArrays) {
    return [].concat.apply([], arrayOfArrays);
}
export function pushAll(target, source) {
    if (source == null || target == null) {
        return;
    }
    forEach(source, function (value) { return target.push(value); });
}
export function toStrings(array) {
    return map(array, toStringOrNull);
}
export function findIndex(collection, predicate) {
    for (var i = 0; i < collection.length; i++) {
        if (predicate(collection[i], i, collection)) {
            return i;
        }
    }
    return -1;
}
export function fill(collection, value, start, end) {
    if (value === void 0) { value = null; }
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = collection.length; }
    for (var i = start; i < end; i++) {
        collection[i] = value;
    }
    return collection;
}
/**
 * The implementation of Array.prototype.every in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/bek91dtit8/
 */
export function every(list, predicate) {
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
/**
 * The implementation of Array.prototype.some in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/5dk91e4tmt/
 */
export function some(list, predicate) {
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
/**
 * The implementation of Array.prototype.forEach in browsers is often slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/apk91elt8a/
 */
export function forEach(list, action) {
    if (list == null) {
        return;
    }
    for (var i = 0; i < list.length; i++) {
        action(list[i], i);
    }
}
export function forEachReverse(list, action) {
    if (list == null) {
        return;
    }
    for (var i = list.length - 1; i >= 0; i--) {
        action(list[i], i);
    }
}
/**
 * The implementation of Array.prototype.map in browsers is generally the same as just using a simple for loop. However,
 * Firefox does exhibit some difference, and this performs no worse in other browsers, so use this if you want improved
 * performance.
 * https://jsbench.me/njk91ez8pc/
 */
export function map(list, process) {
    if (list == null) {
        return null;
    }
    var mapped = [];
    for (var i = 0; i < list.length; i++) {
        mapped.push(process(list[i], i));
    }
    return mapped;
}
/**
 * The implementation of Array.prototype.filter in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/7bk91fk08c/
 */
export function filter(list, predicate) {
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
/**
 * The implementation of Array.prototype.reduce in browsers is generally the same as just using a simple for loop. However,
 * Chrome does exhibit some difference, and this performs no worse in other browsers, so use this if you want improved
 * performance.
 * https://jsbench.me/7vk92n6u1f/
 */
export function reduce(list, step, initial) {
    if (list == null || initial == null) {
        return null;
    }
    var result = initial;
    for (var i = 0; i < list.length; i++) {
        result = step(result, list[i], i);
    }
    return result;
}
/** @deprecated */
export function forEachSnapshotFirst(list, callback) {
    if (!list) {
        return;
    }
    var arrayCopy = list.slice(0);
    arrayCopy.forEach(callback);
}
