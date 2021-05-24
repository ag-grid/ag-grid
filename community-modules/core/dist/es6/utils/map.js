/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
export function convertToMap(arr) {
    var map = new Map();
    arr.forEach(function (pair) { return map.set(pair[0], pair[1]); });
    return map;
}
export function keys(map) {
    var arr = [];
    map.forEach(function (_, key) { return arr.push(key); });
    return arr;
}
