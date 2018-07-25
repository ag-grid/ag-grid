/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var gridRow_1 = require("./gridRow");
var GridCell = (function () {
    function GridCell(gridCellDef) {
        this.rowIndex = gridCellDef.rowIndex;
        this.column = gridCellDef.column;
        this.floating = utils_1.Utils.makeNull(gridCellDef.floating);
    }
    GridCell.prototype.getGridCellDef = function () {
        return {
            rowIndex: this.rowIndex,
            column: this.column,
            floating: this.floating
        };
    };
    GridCell.prototype.getGridRow = function () {
        return new gridRow_1.GridRow(this.rowIndex, this.floating);
    };
    GridCell.prototype.toString = function () {
        return "rowIndex = " + this.rowIndex + ", floating = " + this.floating + ", column = " + (this.column ? this.column.getId() : null);
    };
    GridCell.prototype.createId = function () {
        return this.rowIndex + "." + this.floating + "." + this.column.getId();
    };
    GridCell.prototype.equals = function (other) {
        var colsMatch = this.column === other.column;
        var floatingMatch = this.floating === other.floating;
        var indexMatch = this.rowIndex === other.rowIndex;
        return colsMatch && floatingMatch && indexMatch;
    };
    return GridCell;
}());
exports.GridCell = GridCell;
