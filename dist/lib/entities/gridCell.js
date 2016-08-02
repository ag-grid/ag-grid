/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.7
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require("../utils");
var gridRow_1 = require("./gridRow");
var GridCell = (function () {
    function GridCell(rowIndex, floating, column) {
        this.rowIndex = rowIndex;
        this.column = column;
        this.floating = utils_1.Utils.makeNull(floating);
    }
    GridCell.prototype.getGridRow = function () {
        return new gridRow_1.GridRow(this.rowIndex, this.floating);
    };
    GridCell.prototype.toString = function () {
        return "rowIndex = " + this.rowIndex + ", floating = " + this.floating + ", column = " + (this.column ? this.column.getId() : null);
    };
    GridCell.prototype.createId = function () {
        return this.rowIndex + "." + this.floating + "." + this.column.getId();
    };
    return GridCell;
})();
exports.GridCell = GridCell;
