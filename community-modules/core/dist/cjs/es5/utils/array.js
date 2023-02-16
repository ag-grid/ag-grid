/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forEachReverse = exports.toStrings = exports.pushAll = exports.flatten = exports.includes = exports.moveInArray = exports.insertArrayIntoArray = exports.insertIntoArray = exports.removeAllFromArray = exports.removeFromArray = exports.removeRepeatsFromArray = exports.sortNumerically = exports.shallowCompare = exports.areEqual = exports.last = exports.existsAndNotEmpty = exports.firstExistingValue = void 0;
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
        a.every(function (value, index) { return comparator ? comparator(value, b[index]) : b[index] === value; });
}
exports.areEqual = areEqual;
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
    toRemove.forEach(function (item) { return removeFromArray(array, item); });
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
    objectsToMove.slice().reverse().forEach(function (obj) { return insertIntoArray(array, obj, toIndex); });
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
    source.forEach(function (value) { return target.push(value); });
}
exports.pushAll = pushAll;
function toStrings(array) {
    return array.map(generic_1.toStringOrNull);
}
exports.toStrings = toStrings;
function forEachReverse(list, action) {
    if (list == null) {
        return;
    }
    for (var i = list.length - 1; i >= 0; i--) {
        action(list[i], i);
    }
}
exports.forEachReverse = forEachReverse;
