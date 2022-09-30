"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function convertToMap(list) {
    const map = new Map();
    list.forEach(([key, value]) => map.set(key, value));
    return map;
}
exports.convertToMap = convertToMap;
