/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CellPositionUtils = /** @class */ (function () {
    function CellPositionUtils() {
    }
    CellPositionUtils.createId = function (cellPosition) {
        return cellPosition.rowIndex + "." + cellPosition.rowPinned + "." + cellPosition.column.getId();
    };
    CellPositionUtils.equals = function (cellA, cellB) {
        var colsMatch = cellA.column === cellB.column;
        var floatingMatch = cellA.rowPinned === cellB.rowPinned;
        var indexMatch = cellA.rowIndex === cellB.rowIndex;
        return colsMatch && floatingMatch && indexMatch;
    };
    return CellPositionUtils;
}());
exports.CellPositionUtils = CellPositionUtils;
