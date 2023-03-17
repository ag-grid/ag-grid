/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
export function convertToSet(list) {
    var set = new Set();
    list.forEach(function (x) { return set.add(x); });
    return set;
}
