/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var context_1 = require("./context/context");
var constants_1 = require("./constants");
var columnController_1 = require("./columnController/columnController");
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var pinnedRowModel_1 = require("./rowModels/pinnedRowModel");
var utils_1 = require("./utils");
var CellNavigationService = /** @class */ (function () {
    function CellNavigationService() {
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
                case constants_1.Constants.KEY_UP:
                    pointer = this.getCellAbove(pointer);
                    break;
                case constants_1.Constants.KEY_DOWN:
                    pointer = this.getCellBelow(pointer);
                    break;
                case constants_1.Constants.KEY_RIGHT:
                    if (this.gridOptionsWrapper.isEnableRtl()) {
                        pointer = this.getCellToLeft(pointer);
                    }
                    else {
                        pointer = this.getCellToRight(pointer);
                    }
                    break;
                case constants_1.Constants.KEY_LEFT:
                    if (this.gridOptionsWrapper.isEnableRtl()) {
                        pointer = this.getCellToRight(pointer);
                    }
                    else {
                        pointer = this.getCellToLeft(pointer);
                    }
                    break;
                default:
                    pointer = null;
                    console.warn('ag-Grid: unknown key for navigation ' + key);
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
            case constants_1.Constants.PINNED_TOP:
                rowNode = this.pinnedRowModel.getPinnedTopRow(gridCell.rowIndex);
                break;
            case constants_1.Constants.PINNED_BOTTOM:
                rowNode = this.pinnedRowModel.getPinnedBottomRow(gridCell.rowIndex);
                break;
            default:
                rowNode = this.rowModel.getRow(gridCell.rowIndex);
                break;
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
                case constants_1.Constants.PINNED_BOTTOM:
                    // never any rows after pinned bottom
                    return null;
                case constants_1.Constants.PINNED_TOP:
                    // if on last row of pinned top, then next row is main body (if rows exist),
                    // otherwise it's the pinned bottom
                    if (this.rowModel.isRowsToRender()) {
                        return { rowIndex: 0, rowPinned: null };
                    }
                    else if (this.pinnedRowModel.isRowsToRender(constants_1.Constants.PINNED_BOTTOM)) {
                        return { rowIndex: 0, rowPinned: constants_1.Constants.PINNED_BOTTOM };
                    }
                    return null;
                default:
                    // if in the main body, then try pinned bottom, otherwise return nothing
                    if (this.pinnedRowModel.isRowsToRender(constants_1.Constants.PINNED_BOTTOM)) {
                        return { rowIndex: 0, rowPinned: constants_1.Constants.PINNED_BOTTOM };
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
        if (pinned === constants_1.Constants.PINNED_TOP) {
            var lastTopIndex = this.pinnedRowModel.getPinnedTopRowData().length - 1;
            return lastTopIndex <= index;
        }
        else if (pinned === constants_1.Constants.PINNED_BOTTOM) {
            var lastBottomIndex = this.pinnedRowModel.getPinnedBottomRowData().length - 1;
            return lastBottomIndex <= index;
        }
        var lastBodyIndex = this.rowModel.getRowCount() - 1;
        return lastBodyIndex <= index;
    };
    CellNavigationService.prototype.getRowAbove = function (rowPosition) {
        // if already on top row, do nothing
        var index = rowPosition.rowIndex;
        var pinned = rowPosition.rowPinned;
        // if already on top row, do nothing
        if (index === 0) {
            if (pinned === constants_1.Constants.PINNED_TOP) {
                return null;
            }
            else if (!pinned) {
                if (this.pinnedRowModel.isRowsToRender(constants_1.Constants.PINNED_TOP)) {
                    return this.getLastFloatingTopRow();
                }
                return null;
            }
            else {
                // last floating bottom
                if (this.rowModel.isRowsToRender()) {
                    return this.getLastBodyCell();
                }
                else if (this.pinnedRowModel.isRowsToRender(constants_1.Constants.PINNED_TOP)) {
                    return this.getLastFloatingTopRow();
                }
                return null;
            }
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
        var lastBodyRow = this.rowModel.getRowCount() - 1;
        return { rowIndex: lastBodyRow, rowPinned: null };
    };
    CellNavigationService.prototype.getLastFloatingTopRow = function () {
        var lastFloatingRow = this.pinnedRowModel.getPinnedTopRowData().length - 1;
        return { rowIndex: lastFloatingRow, rowPinned: constants_1.Constants.PINNED_TOP };
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
            if (utils_1._.missing(rowBelow)) {
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
            newColumn = utils_1._.last(displayedColumns);
            var rowAbove = this.getRowAbove({ rowIndex: gridCell.rowIndex, rowPinned: gridCell.rowPinned });
            if (utils_1._.missing(rowAbove)) {
                return null;
            }
            newRowIndex = rowAbove ? rowAbove.rowIndex : null;
            newFloating = rowAbove ? rowAbove.rowPinned : null;
        }
        return { rowIndex: newRowIndex, column: newColumn, rowPinned: newFloating };
    };
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], CellNavigationService.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], CellNavigationService.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('pinnedRowModel'),
        __metadata("design:type", pinnedRowModel_1.PinnedRowModel)
    ], CellNavigationService.prototype, "pinnedRowModel", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], CellNavigationService.prototype, "gridOptionsWrapper", void 0);
    CellNavigationService = __decorate([
        context_1.Bean('cellNavigationService')
    ], CellNavigationService);
    return CellNavigationService;
}());
exports.CellNavigationService = CellNavigationService;
