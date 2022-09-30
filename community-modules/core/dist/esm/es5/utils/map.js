/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
export function convertToMap(arr) {
    var map = new Map();
    arr.forEach(function (pair) { return map.set(pair[0], pair[1]); });
    return map;
}
// handy for organising a list into a map, where each item is mapped by an attribute, eg mapping Columns by ID
export function mapById(arr, callback) {
    var map = new Map();
    arr.forEach(function (item) { return map.set(callback(item), item); });
    return map;
}
export function keys(map) {
    var arr = [];
    map.forEach(function (_, key) { return arr.push(key); });
    return arr;
}
