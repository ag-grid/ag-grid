// ag-grid-enterprise v4.0.7
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var main_2 = require("ag-grid/main");
var main_3 = require("ag-grid/main");
var main_4 = require("ag-grid/main");
var main_5 = require("ag-grid/main");
var main_6 = require("ag-grid/main");
var main_7 = require("ag-grid/main");
var main_8 = require("ag-grid/main");
var main_9 = require("ag-grid/main");
var main_10 = require("ag-grid/main");
var main_11 = require("ag-grid/main");
var main_12 = require("ag-grid/main");
var main_13 = require("ag-grid/main");
var main_14 = require("ag-grid/main");
var RangeController = (function () {
    function RangeController() {
        this.bodyScrollListener = this.onBodyScroll.bind(this);
        this.dragging = false;
    }
    RangeController.prototype.init = function () {
        this.logger = this.loggerFactory.create('RangeController');
        this.eventService.addEventListener(main_12.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_12.Events.EVENT_COLUMN_GROUP_OPENED, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_12.Events.EVENT_COLUMN_MOVED, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_12.Events.EVENT_COLUMN_PINNED, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_12.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_12.Events.EVENT_COLUMN_VISIBLE, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_12.Events.EVENT_SORT_CHANGED, this.clearSelection.bind(this));
    };
    RangeController.prototype.setRangeToCell = function (cell) {
        var columns = this.updateSelectedColumns(cell.column, cell.column);
        if (!columns) {
            return;
        }
        var newRange = {
            start: new main_13.GridCell(cell.rowIndex, cell.floating, cell.column),
            end: new main_13.GridCell(cell.rowIndex, cell.floating, cell.column),
            columns: columns
        };
        this.cellRanges = [];
        this.cellRanges.push(newRange);
        this.activeRange = null;
        this.dispatchChangedEvent(true, false);
    };
    RangeController.prototype.setRange = function (rangeSelection) {
        this.cellRanges = [];
        this.addRange(rangeSelection);
    };
    RangeController.prototype.addRange = function (rangeSelection) {
        var columnStart = this.columnController.getColumnWithValidation(rangeSelection.columnStart);
        var columnEnd = this.columnController.getColumn(rangeSelection.columnEnd);
        if (!columnStart || !columnEnd) {
            return;
        }
        var columns = this.updateSelectedColumns(columnStart, columnEnd);
        if (!columns) {
            return;
        }
        var newRange = {
            start: new main_13.GridCell(rangeSelection.rowStart, rangeSelection.floatingStart, columnStart),
            end: new main_13.GridCell(rangeSelection.rowEnd, rangeSelection.floatingEnd, columnEnd),
            columns: columns
        };
        if (!this.cellRanges) {
            this.cellRanges = [];
        }
        this.cellRanges.push(newRange);
        this.dispatchChangedEvent(true, false);
    };
    RangeController.prototype.getCellRanges = function () {
        return this.cellRanges;
    };
    RangeController.prototype.isEmpty = function () {
        return main_1.Utils.missingOrEmpty(this.cellRanges);
    };
    RangeController.prototype.isMoreThanOneCell = function () {
        if (main_1.Utils.missingOrEmpty(this.cellRanges)) {
            return false;
        }
        else {
            if (this.cellRanges.length > 1) {
                return true;
            }
            else {
                var onlyRange = this.cellRanges[0];
                var onlyOneCellInRange = onlyRange.start.column === onlyRange.end.column &&
                    onlyRange.start.rowIndex === onlyRange.end.rowIndex;
                return !onlyOneCellInRange;
            }
        }
    };
    RangeController.prototype.clearSelection = function () {
        if (main_1.Utils.missing(this.cellRanges)) {
            return;
        }
        this.activeRange = null;
        this.cellRanges = null;
        this.dispatchChangedEvent(true, false);
    };
    // as the user is dragging outside of the panel, the div starts to scroll, which in turn
    // means we are selection more (or less) cells, but the mouse isn't moving, so we recalculate
    // the selection my mimicking a new mouse event
    RangeController.prototype.onBodyScroll = function () {
        this.onDragging(this.lastMouseEvent);
    };
    RangeController.prototype.isCellInAnyRange = function (cell) {
        return this.getCellRangeCount(cell) > 0;
    };
    RangeController.prototype.isCellInSpecificRange = function (cell, range) {
        var columnInRange = range.columns.indexOf(cell.column) >= 0;
        var rowInRange = this.isRowInRange(cell.rowIndex, cell.floating, range);
        return columnInRange && rowInRange;
    };
    // returns the number of ranges this cell is in
    RangeController.prototype.getCellRangeCount = function (cell) {
        var _this = this;
        if (main_1.Utils.missingOrEmpty(this.cellRanges)) {
            return 0;
        }
        var matchingCount = 0;
        this.cellRanges.forEach(function (cellRange) {
            if (_this.isCellInSpecificRange(cell, cellRange)) {
                matchingCount++;
            }
        });
        return matchingCount;
    };
    RangeController.prototype.isRowInRange = function (rowIndex, floating, cellRange) {
        var row1 = new main_14.GridRow(cellRange.start.rowIndex, cellRange.start.floating);
        var row2 = new main_14.GridRow(cellRange.end.rowIndex, cellRange.end.floating);
        var firstRow = row1.before(row2) ? row1 : row2;
        var lastRow = row1.before(row2) ? row2 : row1;
        var thisRow = new main_14.GridRow(rowIndex, floating);
        if (thisRow.equals(firstRow) || thisRow.equals(lastRow)) {
            return true;
        }
        else {
            var afterFirstRow = !thisRow.before(firstRow);
            var beforeLastRow = thisRow.before(lastRow);
            return afterFirstRow && beforeLastRow;
        }
    };
    RangeController.prototype.onDragStart = function (mouseEvent) {
        // ctrlKey for windows, metaKey for Apple
        var multiSelectKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        if (main_1.Utils.missing(this.cellRanges) || !multiSelectKeyPressed) {
            this.cellRanges = [];
        }
        var cell = this.mouseEventService.getCellForMouseEvent(mouseEvent);
        if (main_1.Utils.missing(cell)) {
            // if drag wasn't on cell, then do nothing, including do not set dragging=true,
            // (which them means onDragging and onDragStop do nothing)
            return;
        }
        this.createNewActiveRange(cell);
        this.gridPanel.addScrollEventListener(this.bodyScrollListener);
        this.dragging = true;
        this.lastMouseEvent = mouseEvent;
        this.selectionChanged(false, true);
    };
    RangeController.prototype.createNewActiveRange = function (cell) {
        this.activeRange = {
            start: new main_13.GridCell(cell.rowIndex, cell.floating, cell.column),
            end: new main_13.GridCell(cell.rowIndex, cell.floating, cell.column),
            columns: [cell.column]
        };
        this.cellRanges.push(this.activeRange);
    };
    RangeController.prototype.selectionChanged = function (finished, started) {
        this.activeRange.columns = this.updateSelectedColumns(this.activeRange.start.column, this.activeRange.end.column);
        this.dispatchChangedEvent(finished, started);
    };
    RangeController.prototype.dispatchChangedEvent = function (finished, started) {
        this.eventService.dispatchEvent(main_12.Events.EVENT_RANGE_SELECTION_CHANGED, { finished: finished, started: started });
    };
    RangeController.prototype.onDragStop = function () {
        if (!this.dragging) {
            return;
        }
        this.gridPanel.removeScrollEventListener(this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
        this.dispatchChangedEvent(true, false);
    };
    RangeController.prototype.onDragging = function (mouseEvent) {
        if (!this.dragging) {
            return;
        }
        this.lastMouseEvent = mouseEvent;
        var cell = this.mouseEventService.getCellForMouseEvent(mouseEvent);
        if (main_1.Utils.missing(cell)) {
            return;
        }
        var columnChanged = false;
        if (cell.column !== this.activeRange.end.column) {
            this.activeRange.end.column = cell.column;
            columnChanged = true;
        }
        var rowChanged = false;
        if (cell.rowIndex !== this.activeRange.end.rowIndex || cell.floating !== this.activeRange.end.floating) {
            this.activeRange.end.rowIndex = cell.rowIndex;
            this.activeRange.end.floating = cell.floating;
            rowChanged = true;
        }
        if (columnChanged || rowChanged) {
            this.selectionChanged(false, false);
        }
    };
    RangeController.prototype.updateSelectedColumns = function (columnFrom, columnTo) {
        var allDisplayedColumns = this.columnController.getAllDisplayedColumns();
        var fromIndex = allDisplayedColumns.indexOf(columnFrom);
        var toIndex = allDisplayedColumns.indexOf(columnTo);
        if (fromIndex < 0) {
            console.log('ag-Grid: column ' + columnFrom.getId() + ' is not visible');
            return null;
        }
        if (toIndex < 0) {
            console.log('ag-Grid: column ' + columnTo.getId() + ' is not visible');
            return null;
        }
        var firstIndex = Math.min(fromIndex, toIndex);
        var lastIndex = Math.max(fromIndex, toIndex);
        var columns = [];
        for (var i = firstIndex; i <= lastIndex; i++) {
            columns.push(allDisplayedColumns[i]);
        }
        return columns;
    };
    __decorate([
        main_3.Autowired('loggerFactory'), 
        __metadata('design:type', main_4.LoggerFactory)
    ], RangeController.prototype, "loggerFactory", void 0);
    __decorate([
        main_3.Autowired('gridPanel'), 
        __metadata('design:type', main_5.GridPanel)
    ], RangeController.prototype, "gridPanel", void 0);
    __decorate([
        main_3.Autowired('rowModel'), 
        __metadata('design:type', Object)
    ], RangeController.prototype, "rowModel", void 0);
    __decorate([
        main_3.Autowired('eventService'), 
        __metadata('design:type', main_6.EventService)
    ], RangeController.prototype, "eventService", void 0);
    __decorate([
        main_3.Autowired('columnController'), 
        __metadata('design:type', main_7.ColumnController)
    ], RangeController.prototype, "columnController", void 0);
    __decorate([
        main_3.Autowired('rowRenderer'), 
        __metadata('design:type', main_8.RowRenderer)
    ], RangeController.prototype, "rowRenderer", void 0);
    __decorate([
        main_3.Autowired('focusedCellController'), 
        __metadata('design:type', main_9.FocusedCellController)
    ], RangeController.prototype, "focusedCellController", void 0);
    __decorate([
        main_3.Autowired('mouseEventService'), 
        __metadata('design:type', main_10.MouseEventService)
    ], RangeController.prototype, "mouseEventService", void 0);
    __decorate([
        main_11.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RangeController.prototype, "init", null);
    RangeController = __decorate([
        main_2.Bean('rangeController'), 
        __metadata('design:paramtypes', [])
    ], RangeController);
    return RangeController;
})();
exports.RangeController = RangeController;
