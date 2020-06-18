/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
export function keys(map) {
    var keys = [];
    map.forEach(function (_, key) { return keys.push(key); });
    return keys;
}
