/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var context_1 = require("../context/context");
var pinnedRowModel_1 = require("../rowModels/pinnedRowModel");
var utils_1 = require("../utils");
var RowPositionUtils = /** @class */ (function () {
    function RowPositionUtils() {
    }
    RowPositionUtils.prototype.getRowNode = function (gridRow) {
        switch (gridRow.rowPinned) {
            case constants_1.Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case constants_1.Constants.PINNED_BOTTOM:
                return this.pinnedRowModel.getPinnedBottomRowData()[gridRow.rowIndex];
            default:
                return this.rowModel.getRow(gridRow.rowIndex);
        }
    };
    RowPositionUtils.prototype.sameRow = function (rowA, rowB) {
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
    RowPositionUtils.prototype.before = function (rowA, rowB) {
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
                    return rowB.rowPinned !== constants_1.Constants.PINNED_TOP;
                }
                break;
        }
        return rowA.rowIndex < rowB.rowIndex;
    };
    __decorate([
        context_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], RowPositionUtils.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('pinnedRowModel'),
        __metadata("design:type", pinnedRowModel_1.PinnedRowModel)
    ], RowPositionUtils.prototype, "pinnedRowModel", void 0);
    RowPositionUtils = __decorate([
        context_1.Bean('rowPositionUtils')
    ], RowPositionUtils);
    return RowPositionUtils;
}());
exports.RowPositionUtils = RowPositionUtils;
