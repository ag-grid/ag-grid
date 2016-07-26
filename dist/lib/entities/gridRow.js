/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var constants_1 = require("../constants");
var utils_1 = require('../utils');
var gridCell_1 = require("./gridCell");
var GridRow = (function () {
    function GridRow(rowIndex, floating) {
        this.rowIndex = rowIndex;
        this.floating = utils_1.Utils.makeNull(floating);
    }
    GridRow.prototype.isFloatingTop = function () {
        return this.floating === constants_1.Constants.FLOATING_TOP;
    };
    GridRow.prototype.isFloatingBottom = function () {
        return this.floating === constants_1.Constants.FLOATING_BOTTOM;
    };
    GridRow.prototype.isNotFloating = function () {
        return !this.isFloatingBottom() && !this.isFloatingTop();
    };
    GridRow.prototype.equals = function (otherSelection) {
        return this.rowIndex === otherSelection.rowIndex
            && this.floating === otherSelection.floating;
    };
    GridRow.prototype.toString = function () {
        return "rowIndex = " + this.rowIndex + ", floating = " + this.floating;
    };
    GridRow.prototype.getGridCell = function (column) {
        return new gridCell_1.GridCell(this.rowIndex, this.floating, column);
    };
    // tests if this row selection is before the other row selection
    GridRow.prototype.before = function (otherSelection) {
        var otherFloating = otherSelection.floating;
        switch (this.floating) {
            case constants_1.Constants.FLOATING_TOP:
                // we we are floating top, and other isn't, then we are always before
                if (otherFloating !== constants_1.Constants.FLOATING_TOP) {
                    return true;
                }
                break;
            case constants_1.Constants.FLOATING_BOTTOM:
                // if we are floating bottom, and the other isn't, then we are never before
                if (otherFloating !== constants_1.Constants.FLOATING_BOTTOM) {
                    return false;
                }
                break;
            default:
                // if we are not floating, but the other one is floating...
                if (utils_1.Utils.exists(otherFloating)) {
                    if (otherFloating === constants_1.Constants.FLOATING_TOP) {
                        // we are not floating, other is floating top, we are first
                        return false;
                    }
                    else {
                        // we are not floating, other is floating bottom, we are always first
                        return true;
                    }
                }
                break;
        }
        return this.rowIndex <= otherSelection.rowIndex;
    };
    return GridRow;
})();
exports.GridRow = GridRow;
