/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { Constants } from "../constants/constants";
import { exists } from "../utils/generic";
var RowPositionUtils = /** @class */ (function (_super) {
    __extends(RowPositionUtils, _super);
    function RowPositionUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RowPositionUtils.prototype.getFirstRow = function () {
        var rowIndex = 0;
        var rowPinned;
        if (this.pinnedRowModel.getPinnedTopRowCount()) {
            rowPinned = Constants.PINNED_TOP;
        }
        else if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.paginationProxy.getPageFirstRow();
        }
        else if (this.pinnedRowModel.getPinnedBottomRowCount()) {
            rowPinned = Constants.PINNED_BOTTOM;
        }
        return rowPinned === undefined ? null : { rowIndex: rowIndex, rowPinned: rowPinned };
    };
    RowPositionUtils.prototype.getLastRow = function () {
        var rowIndex;
        var rowPinned = null;
        var pinnedBottomCount = this.pinnedRowModel.getPinnedBottomRowCount();
        var pinnedTopCount = this.pinnedRowModel.getPinnedTopRowCount();
        if (pinnedBottomCount) {
            rowPinned = Constants.PINNED_BOTTOM;
            rowIndex = pinnedBottomCount - 1;
        }
        else if (this.rowModel.getRowCount()) {
            rowPinned = null;
            rowIndex = this.paginationProxy.getPageLastRow();
        }
        else if (pinnedTopCount) {
            rowPinned = Constants.PINNED_TOP;
            rowIndex = pinnedTopCount - 1;
        }
        return rowIndex === undefined ? null : { rowIndex: rowIndex, rowPinned: rowPinned };
    };
    RowPositionUtils.prototype.getRowNode = function (gridRow) {
        switch (gridRow.rowPinned) {
            case Constants.PINNED_TOP:
                return this.pinnedRowModel.getPinnedTopRowData()[gridRow.rowIndex];
            case Constants.PINNED_BOTTOM:
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
            case Constants.PINNED_TOP:
                // we we are floating top, and other isn't, then we are always before
                if (rowB.rowPinned !== Constants.PINNED_TOP) {
                    return true;
                }
                break;
            case Constants.PINNED_BOTTOM:
                // if we are floating bottom, and the other isn't, then we are never before
                if (rowB.rowPinned !== Constants.PINNED_BOTTOM) {
                    return false;
                }
                break;
            default:
                // if we are not floating, but the other one is floating...
                if (exists(rowB.rowPinned)) {
                    return rowB.rowPinned !== Constants.PINNED_TOP;
                }
                break;
        }
        return rowA.rowIndex < rowB.rowIndex;
    };
    __decorate([
        Autowired('rowModel')
    ], RowPositionUtils.prototype, "rowModel", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], RowPositionUtils.prototype, "pinnedRowModel", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], RowPositionUtils.prototype, "paginationProxy", void 0);
    RowPositionUtils = __decorate([
        Bean('rowPositionUtils')
    ], RowPositionUtils);
    return RowPositionUtils;
}(BeanStub));
export { RowPositionUtils };
