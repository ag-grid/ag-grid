"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToSet = void 0;
function convertToSet(list) {
    const set = new Set();
    list.forEach(x => set.add(x));
    return set;
}
exports.convertToSet = convertToSet;
