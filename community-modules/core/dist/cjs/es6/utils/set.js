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
    const set = new Set();
    list.forEach(x => set.add(x));
    return set;
}
exports.convertToSet = convertToSet;
