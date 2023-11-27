"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToSet = void 0;
function convertToSet(list) {
    var set = new Set();
    list.forEach(function (x) { return set.add(x); });
    return set;
}
exports.convertToSet = convertToSet;
