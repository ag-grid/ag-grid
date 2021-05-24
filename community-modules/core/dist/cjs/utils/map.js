/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function convertToMap(arr) {
    var map = new Map();
    arr.forEach(function (pair) { return map.set(pair[0], pair[1]); });
    return map;
}
exports.convertToMap = convertToMap;
function keys(map) {
    var arr = [];
    map.forEach(function (_, key) { return arr.push(key); });
    return arr;
}
exports.keys = keys;

//# sourceMappingURL=map.js.map
