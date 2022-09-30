/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function convertToMap(arr) {
    const map = new Map();
    arr.forEach(pair => map.set(pair[0], pair[1]));
    return map;
}
exports.convertToMap = convertToMap;
// handy for organising a list into a map, where each item is mapped by an attribute, eg mapping Columns by ID
function mapById(arr, callback) {
    const map = new Map();
    arr.forEach(item => map.set(callback(item), item));
    return map;
}
exports.mapById = mapById;
function keys(map) {
    const arr = [];
    map.forEach((_, key) => arr.push(key));
    return arr;
}
exports.keys = keys;
