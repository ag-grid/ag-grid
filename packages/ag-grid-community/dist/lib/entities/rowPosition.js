/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var utils_1 = require("../utils");
var RowPositionUtils = /** @class */ (function () {
    function RowPositionUtils() {
    }
    RowPositionUtils.sameRow = function (rowA, rowB) {
        // if both missing
        if (!rowA && !rowB) {
            return true;
        }
        // if only one missing
        if ((rowA && !rowB) || (!rowA && rowB)) {
            return false;
        }
        // otherwise compare (use == to compare rowPinned because it can be null or undefined)
        return rowA.rowIndex === rowB.rowIndex && rowA.rowPinned == rowB.rowPinned;
    };
    // tests if this row selection is before the other row selection
    RowPositionUtils.before = function (rowA, rowB) {
        switch (rowA.rowPinned) {
            case constants_1.Constants.PINNED_TOP:
                // we we are floating top, and other isn't, then we are always before
                if (rowB.rowPinned !== constants_1.Constants.PINNED_TOP) {
                    return true;
                }
                break;
            case constants_1.Constants.PINNED_BOTTOM:
                // if we are floating bottom, and the other isn't, then we are never before
                if (rowB.rowPinned !== constants_1.Constants.PINNED_BOTTOM) {
                    return false;
                }
                break;
            default:
                // if we are not floating, but the other one is floating...
                if (utils_1._.exists(rowB.rowPinned)) {
                    if (rowB.rowPinned === constants_1.Constants.PINNED_TOP) {
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
        return rowA.rowIndex < rowB.rowIndex;
    };
    return RowPositionUtils;
}());
exports.RowPositionUtils = RowPositionUtils;
