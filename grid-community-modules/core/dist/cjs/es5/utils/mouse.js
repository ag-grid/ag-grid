/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areEventsNear = void 0;
/**
 * `True` if the event is close to the original event by X pixels either vertically or horizontally.
 * we only start dragging after X pixels so this allows us to know if we should start dragging yet.
 * @param {MouseEvent | TouchEvent} e1
 * @param {MouseEvent | TouchEvent} e2
 * @param {number} pixelCount
 * @returns {boolean}
 */
function areEventsNear(e1, e2, pixelCount) {
    // by default, we wait 4 pixels before starting the drag
    if (pixelCount === 0) {
        return false;
    }
    var diffX = Math.abs(e1.clientX - e2.clientX);
    var diffY = Math.abs(e1.clientY - e2.clientY);
    return Math.max(diffX, diffY) <= pixelCount;
}
exports.areEventsNear = areEventsNear;
