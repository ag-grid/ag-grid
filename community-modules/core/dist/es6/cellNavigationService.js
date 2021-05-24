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
import { Autowired, Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { Constants } from "./constants/constants";
import { missing } from "./utils/generic";
import { last } from "./utils/array";
import { KeyCode } from './constants/keyCode';
var CellNavigationService = /** @class */ (function (_super) {
    __extends(CellNavigationService, _super);
    function CellNavigationService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // returns null if no cell to focus on, ie at the end of the grid
    CellNavigationService.prototype.getNextCellToFocus = function (key, lastCellToFocus) {
        // starting with the provided cell, we keep moving until we find a cell we can
        // focus on.
        var pointer = lastCellToFocus;
        var finished = false;
        // finished will be true when either:
        // a) cell found that we can focus on
        // b) run out of cells (ie the method returns null)
        while (!finished) {
            switch (key) {
                case KeyCode.UP:
                    pointer = this.getCellAbove(pointer);
                    break;
                case KeyCode.DOWN:
                    pointer = this.getCellBelow(pointer);
                    break;
                case KeyCode.RIGHT:
                    if (this.gridOptionsWrapper.isEnableRtl()) {
                        pointer = this.getCellToLeft(pointer);
                    }
                    else {
                        pointer = this.getCellToRight(pointer);
                    }
                    break;
                case KeyCode.LEFT:
                    if (this.gridOptionsWrapper.isEnableRtl()) {
                        pointer = this.getCellToRight(pointer);
                    }
                    else {
                        pointer = this.getCellToLeft(pointer);
                    }
                    break;
                default:
                    pointer = null;
                    console.warn('AG Grid: unknown key for navigation ' + key);
                    break;
            }
            if (pointer) {
                finished = this.isCellGoodToFocusOn(pointer);
            }
            else {
                finished = true;
            }
        }
        return pointer;
    };
    CellNavigationService.prototype.isCellGoodToFocusOn = function (gridCell) {
        var column = gridCell.column;
        var rowNode;
        switch (gridCell.rowPinned) {
            case Constants.PINNED_TOP:
                rowNode = this.pinnedRowModel.getPinnedTopRow(gridCell.rowIndex);
                break;
            case Constants.PINNED_BOTTOM:
                rowNode = this.pinnedRowModel.getPinnedBottomRow(gridCell.rowIndex);
                break;
            default:
                rowNode = this.rowModel.getRow(gridCell.rowIndex);
                break;
        }
        if (!rowNode) {
            return false;
        }
        var suppressNavigable = column.isSuppressNavigable(rowNode);
        return !suppressNavigable;
    };
    CellNavigationService.prototype.getCellToLeft = function (lastCell) {
        if (!lastCell) {
            return null;
        }
        var colToLeft = this.columnController.getDisplayedColBefore(lastCell.column);
        if (!colToLeft) {
            return null;
        }
        return {
            rowIndex: lastCell.rowIndex,
            column: colToLeft,
            rowPinned: lastCell.rowPinned
        };
    };
    CellNavigationService.prototype.getCellToRight = function (lastCell) {
        if (!lastCell) {
            return null;
        }
        var colToRight = this.columnController.getDisplayedColAfter(lastCell.column);
        // if already on right, do nothing
        if (!colToRight) {
            return null;
        }
        return {
            rowIndex: lastCell.rowIndex,
            column: colToRight,
            rowPinned: lastCell.rowPinned
        };
    };
    CellNavigationService.prototype.getRowBelow = function (rowPosition) {
        // if already on top row, do nothing
        var index = rowPosition.rowIndex;
        var pinned = rowPosition.rowPinned;
        if (this.isLastRowInContainer(rowPosition)) {
            switch (pinned) {
                case Constants.PINNED_BOTTOM:
                    // never any rows after pinned bottom
                    return null;
                case Constants.PINNED_TOP:
                    // if on last row of pinned top, then next row is main body (if rows exist),
                    // otherwise it's the pinned bottom
                    if (this.rowModel.isRowsToRender()) {
                        return { rowIndex: this.paginationProxy.getPageFirstRow(), rowPinned: null };
                    }
                    if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_BOTTOM)) {
                        return { rowIndex: 0, rowPinned: Constants.PINNED_BOTTOM };
                    }
                    return null;
                default:
                    // if in the main body, then try pinned bottom, otherwise return nothing
                    if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_BOTTOM)) {
                        return { rowIndex: 0, rowPinned: Constants.PINNED_BOTTOM };
                    }
                    return null;
            }
        }
        return { rowIndex: index + 1, rowPinned: pinned };
    };
    CellNavigationService.prototype.getCellBelow = function (lastCell) {
        if (!lastCell) {
            return null;
        }
        var rowBelow = this.getRowBelow(lastCell);
        if (rowBelow) {
            return {
                rowIndex: rowBelow.rowIndex,
                column: lastCell.column,
                rowPinned: rowBelow.rowPinned
            };
        }
        return null;
    };
    CellNavigationService.prototype.isLastRowInContainer = function (rowPosition) {
        var pinned = rowPosition.rowPinned;
        var index = rowPosition.rowIndex;
        if (pinned === Constants.PINNED_TOP) {
            var lastTopIndex = this.pinnedRowModel.getPinnedTopRowData().length - 1;
            return lastTopIndex <= index;
        }
        if (pinned === Constants.PINNED_BOTTOM) {
            var lastBottomIndex = this.pinnedRowModel.getPinnedBottomRowData().length - 1;
            return lastBottomIndex <= index;
        }
        var lastBodyIndex = this.paginationProxy.getPageLastRow();
        return lastBodyIndex <= index;
    };
    CellNavigationService.prototype.getRowAbove = function (rowPosition) {
        // if already on top row, do nothing
        var index = rowPosition.rowIndex;
        var pinned = rowPosition.rowPinned;
        var isFirstRow = pinned ? index === 0 : index === this.paginationProxy.getPageFirstRow();
        // if already on top row, do nothing
        if (isFirstRow) {
            if (pinned === Constants.PINNED_TOP) {
                return null;
            }
            if (!pinned) {
                if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_TOP)) {
                    return this.getLastFloatingTopRow();
                }
                return null;
            }
            // last floating bottom
            if (this.rowModel.isRowsToRender()) {
                return this.getLastBodyCell();
            }
            if (this.pinnedRowModel.isRowsToRender(Constants.PINNED_TOP)) {
                return this.getLastFloatingTopRow();
            }
            return null;
        }
        return { rowIndex: index - 1, rowPinned: pinned };
    };
    CellNavigationService.prototype.getCellAbove = function (lastCell) {
        if (!lastCell) {
            return null;
        }
        var rowAbove = this.getRowAbove({ rowIndex: lastCell.rowIndex, rowPinned: lastCell.rowPinned });
        if (rowAbove) {
            return {
                rowIndex: rowAbove.rowIndex,
                column: lastCell.column,
                rowPinned: rowAbove.rowPinned
            };
        }
        return null;
    };
    CellNavigationService.prototype.getLastBodyCell = function () {
        var lastBodyRow = this.paginationProxy.getPageLastRow();
        return { rowIndex: lastBodyRow, rowPinned: null };
    };
    CellNavigationService.prototype.getLastFloatingTopRow = function () {
        var lastFloatingRow = this.pinnedRowModel.getPinnedTopRowData().length - 1;
        return { rowIndex: lastFloatingRow, rowPinned: Constants.PINNED_TOP };
    };
    CellNavigationService.prototype.getNextTabbedCell = function (gridCell, backwards) {
        if (backwards) {
            return this.getNextTabbedCellBackwards(gridCell);
        }
        return this.getNextTabbedCellForwards(gridCell);
    };
    CellNavigationService.prototype.getNextTabbedCellForwards = function (gridCell) {
        var displayedColumns = this.columnController.getAllDisplayedColumns();
        var newRowIndex = gridCell.rowIndex;
        var newFloating = gridCell.rowPinned;
        // move along to the next cell
        var newColumn = this.columnController.getDisplayedColAfter(gridCell.column);
        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[0];
            var rowBelow = this.getRowBelow(gridCell);
            if (missing(rowBelow)) {
                return null;
            }
            // If we are tabbing and there is a paging panel present, tabbing should go
            // to the paging panel instead of loading the next page.
            if (!rowBelow.rowPinned && !this.paginationProxy.isRowInPage(rowBelow)) {
                return null;
            }
            newRowIndex = rowBelow ? rowBelow.rowIndex : null;
            newFloating = rowBelow ? rowBelow.rowPinned : null;
        }
        return { rowIndex: newRowIndex, column: newColumn, rowPinned: newFloating };
    };
    CellNavigationService.prototype.getNextTabbedCellBackwards = function (gridCell) {
        var displayedColumns = this.columnController.getAllDisplayedColumns();
        var newRowIndex = gridCell.rowIndex;
        var newFloating = gridCell.rowPinned;
        // move along to the next cell
        var newColumn = this.columnController.getDisplayedColBefore(gridCell.column);
        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = last(displayedColumns);
            var rowAbove = this.getRowAbove({ rowIndex: gridCell.rowIndex, rowPinned: gridCell.rowPinned });
            if (missing(rowAbove)) {
                return null;
            }
            // If we are tabbing and there is a paging panel present, tabbing should go
            // to the paging panel instead of loading the next page.
            if (!rowAbove.rowPinned && !this.paginationProxy.isRowInPage(rowAbove)) {
                return null;
            }
            newRowIndex = rowAbove ? rowAbove.rowIndex : null;
            newFloating = rowAbove ? rowAbove.rowPinned : null;
        }
        return { rowIndex: newRowIndex, column: newColumn, rowPinned: newFloating };
    };
    __decorate([
        Autowired('columnController')
    ], CellNavigationService.prototype, "columnController", void 0);
    __decorate([
        Autowired('rowModel')
    ], CellNavigationService.prototype, "rowModel", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], CellNavigationService.prototype, "pinnedRowModel", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], CellNavigationService.prototype, "paginationProxy", void 0);
    CellNavigationService = __decorate([
        Bean('cellNavigationService')
    ], CellNavigationService);
    return CellNavigationService;
}(BeanStub));
export { CellNavigationService };
