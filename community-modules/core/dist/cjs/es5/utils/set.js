/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToSet = void 0;
function convertToSet(list) {
    var set = new Set();
    list.forEach(function (x) { return set.add(x); });
    return set;
}
exports.convertToSet = convertToSet;
