"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areArrayItemsStrictlyEqual = void 0;
function areArrayItemsStrictlyEqual(arrA, arrB) {
    return arrA.length === arrB.length && arrA.every(function (item, i) { return item === arrB[i]; });
}
exports.areArrayItemsStrictlyEqual = areArrayItemsStrictlyEqual;
