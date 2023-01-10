/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
export function convertToSet(list) {
    const set = new Set();
    list.forEach(x => set.add(x));
    return set;
}
