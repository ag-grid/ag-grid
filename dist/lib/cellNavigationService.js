/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var context_1 = require("./context/context");
var constants_1 = require("./constants");
var context_2 = require("./context/context");
var columnController_1 = require("./columnController/columnController");
var floatingRowModel_1 = require("./rowControllers/floatingRowModel");
var utils_1 = require('./utils');
var gridRow_1 = require("./entities/gridRow");
var gridCell_1 = require("./entities/gridCell");
var CellNavigationService = (function () {
    function CellNavigationService() {
    }
    CellNavigationService.prototype.getNextCellToFocus = function (key, lastCellToFocus) {
        switch (key) {
            case constants_1.Constants.KEY_UP: return this.getCellAbove(lastCellToFocus);
            case constants_1.Constants.KEY_DOWN: return this.getCellBelow(lastCellToFocus);
            case constants_1.Constants.KEY_RIGHT: return this.getCellToRight(lastCellToFocus);
            case constants_1.Constants.KEY_LEFT: return this.getCellToLeft(lastCellToFocus);
            default: console.log('ag-Grid: unknown key for navigation ' + key);
        }
    };
    CellNavigationService.prototype.getCellToLeft = function (lastCell) {
        var colToLeft = this.columnController.getDisplayedColBefore(lastCell.column);
        if (!colToLeft) {
            return null;
        }
        else {
            return new gridCell_1.GridCell(lastCell.rowIndex, lastCell.floating, colToLeft);
        }
    };
    CellNavigationService.prototype.getCellToRight = function (lastCell) {
        var colToRight = this.columnController.getDisplayedColAfter(lastCell.column);
        // if already on right, do nothing
        if (!colToRight) {
            return null;
        }
        else {
            return new gridCell_1.GridCell(lastCell.rowIndex, lastCell.floating, colToRight);
        }
    };
    CellNavigationService.prototype.getRowBelow = function (lastRow) {
        // if already on top row, do nothing
        if (this.isLastRowInContainer(lastRow)) {
            if (lastRow.isFloatingBottom()) {
                return null;
            }
            else if (lastRow.isNotFloating()) {
                if (this.floatingRowModel.isRowsToRender(constants_1.Constants.FLOATING_BOTTOM)) {
                    return new gridRow_1.GridRow(0, constants_1.Constants.FLOATING_BOTTOM);
                }
                else {
                    return null;
                }
            }
            else {
                if (this.rowModel.isRowsToRender()) {
                    return new gridRow_1.GridRow(0, null);
                }
                else if (this.floatingRowModel.isRowsToRender(constants_1.Constants.FLOATING_BOTTOM)) {
                    return new gridRow_1.GridRow(0, constants_1.Constants.FLOATING_BOTTOM);
                }
                else {
                    return null;
                }
            }
        }
        else {
            return new gridRow_1.GridRow(lastRow.rowIndex + 1, lastRow.floating);
        }
    };
    CellNavigationService.prototype.getCellBelow = function (lastCell) {
        var rowBelow = this.getRowBelow(lastCell.getGridRow());
        if (rowBelow) {
            return new gridCell_1.GridCell(rowBelow.rowIndex, rowBelow.floating, lastCell.column);
        }
        else {
            return null;
        }
    };
    CellNavigationService.prototype.isLastRowInContainer = function (gridRow) {
        if (gridRow.isFloatingTop()) {
            var lastTopIndex = this.floatingRowModel.getFloatingTopRowData().length - 1;
            return lastTopIndex === gridRow.rowIndex;
        }
        else if (gridRow.isFloatingBottom()) {
            var lastBottomIndex = this.floatingRowModel.getFloatingBottomRowData().length - 1;
            return lastBottomIndex === gridRow.rowIndex;
        }
        else {
            var lastBodyIndex = this.rowModel.getRowCount() - 1;
            return lastBodyIndex === gridRow.rowIndex;
        }
    };
    CellNavigationService.prototype.getRowAbove = function (lastRow) {
        // if already on top row, do nothing
        if (lastRow.rowIndex === 0) {
            if (lastRow.isFloatingTop()) {
                return null;
            }
            else if (lastRow.isNotFloating()) {
                if (this.floatingRowModel.isRowsToRender(constants_1.Constants.FLOATING_TOP)) {
                    return this.getLastFloatingTopRow();
                }
                else {
                    return null;
                }
            }
            else {
                // last floating bottom
                if (this.rowModel.isRowsToRender()) {
                    return this.getLastBodyCell();
                }
                else if (this.floatingRowModel.isRowsToRender(constants_1.Constants.FLOATING_TOP)) {
                    return this.getLastFloatingTopRow();
                }
                else {
                    return null;
                }
            }
        }
        else {
            return new gridRow_1.GridRow(lastRow.rowIndex - 1, lastRow.floating);
        }
    };
    CellNavigationService.prototype.getCellAbove = function (lastCell) {
        var rowAbove = this.getRowAbove(lastCell.getGridRow());
        if (rowAbove) {
            return new gridCell_1.GridCell(rowAbove.rowIndex, rowAbove.floating, lastCell.column);
        }
        else {
            return null;
        }
    };
    CellNavigationService.prototype.getLastBodyCell = function () {
        var lastBodyRow = this.rowModel.getRowCount() - 1;
        return new gridRow_1.GridRow(lastBodyRow, null);
    };
    CellNavigationService.prototype.getLastFloatingTopRow = function () {
        var lastFloatingRow = this.floatingRowModel.getFloatingTopRowData().length - 1;
        return new gridRow_1.GridRow(lastFloatingRow, constants_1.Constants.FLOATING_TOP);
    };
    CellNavigationService.prototype.getNextTabbedCellForwards = function (gridCell) {
        var displayedColumns = this.columnController.getAllDisplayedColumns();
        var newRowIndex = gridCell.rowIndex;
        var newFloating = gridCell.floating;
        // move along to the next cell
        var newColumn = this.columnController.getDisplayedColAfter(gridCell.column);
        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[0];
            var rowBelow = this.getRowBelow(gridCell.getGridRow());
            if (utils_1.Utils.missing(rowBelow)) {
                return;
            }
            newRowIndex = rowBelow.rowIndex;
            newFloating = rowBelow.floating;
        }
        return new gridCell_1.GridCell(newRowIndex, newFloating, newColumn);
    };
    CellNavigationService.prototype.getNextTabbedCellBackwards = function (gridCell) {
        var displayedColumns = this.columnController.getAllDisplayedColumns();
        var newRowIndex = gridCell.rowIndex;
        var newFloating = gridCell.floating;
        // move along to the next cell
        var newColumn = this.columnController.getDisplayedColBefore(gridCell.column);
        // check if end of the row, and if so, go forward a row
        if (!newColumn) {
            newColumn = displayedColumns[displayedColumns.length - 1];
            var rowAbove = this.getRowAbove(gridCell.getGridRow());
            if (utils_1.Utils.missing(rowAbove)) {
                return;
            }
            newRowIndex = rowAbove.rowIndex;
            newFloating = rowAbove.floating;
        }
        return new gridCell_1.GridCell(newRowIndex, newFloating, newColumn);
    };
    __decorate([
        context_2.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], CellNavigationService.prototype, "columnController", void 0);
    __decorate([
        context_2.Autowired('rowModel'), 
        __metadata('design:type', Object)
    ], CellNavigationService.prototype, "rowModel", void 0);
    __decorate([
        context_2.Autowired('floatingRowModel'), 
        __metadata('design:type', floatingRowModel_1.FloatingRowModel)
    ], CellNavigationService.prototype, "floatingRowModel", void 0);
    CellNavigationService = __decorate([
        context_1.Bean('cellNavigationService'), 
        __metadata('design:paramtypes', [])
    ], CellNavigationService);
    return CellNavigationService;
})();
exports.CellNavigationService = CellNavigationService;
