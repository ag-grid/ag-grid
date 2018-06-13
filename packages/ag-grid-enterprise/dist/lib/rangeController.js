// ag-grid-enterprise v18.0.1
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
var main_1 = require("ag-grid/main");
var RangeController = (function () {
    function RangeController() {
        this.bodyScrollListener = this.onBodyScroll.bind(this);
        this.dragging = false;
    }
    RangeController.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
        this.autoScrollService = new AutoScrollService(this.gridPanel, this.gridOptionsWrapper);
    };
    RangeController.prototype.init = function () {
        this.logger = this.loggerFactory.create('RangeController');
        this.eventService.addEventListener(main_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_1.Events.EVENT_COLUMN_GROUP_OPENED, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_1.Events.EVENT_COLUMN_MOVED, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_1.Events.EVENT_COLUMN_PINNED, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearSelection.bind(this));
        this.eventService.addEventListener(main_1.Events.EVENT_COLUMN_VISIBLE, this.clearSelection.bind(this));
    };
    RangeController.prototype.setRangeToCell = function (cell, appendRange) {
        if (appendRange === void 0) { appendRange = false; }
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        var columns = this.updateSelectedColumns(cell.column, cell.column);
        if (!columns) {
            return;
        }
        var gridCellDef = { rowIndex: cell.rowIndex, floating: cell.floating, column: cell.column };
        var newRange = {
            start: new main_1.GridCell(gridCellDef),
            end: new main_1.GridCell(gridCellDef),
            columns: columns
        };
        // if not appending, then clear previous range selections
        if (!appendRange || main_1._.missing(this.cellRanges)) {
            this.cellRanges = [];
        }
        this.cellRanges.push(newRange);
        this.activeRange = null;
        this.dispatchChangedEvent(true, false);
    };
    RangeController.prototype.extendRangeToCell = function (toCell) {
        var lastRange = main_1._.existsAndNotEmpty(this.cellRanges) ? this.cellRanges[this.cellRanges.length - 1] : null;
        var startCell = lastRange ? lastRange.start : toCell;
        this.setRange({
            rowStart: startCell.rowIndex,
            floatingStart: startCell.floating,
            rowEnd: toCell.rowIndex,
            floatingEnd: toCell.floating,
            columnStart: startCell.column,
            columnEnd: toCell.column
        });
    };
    // returns true if successful, false if not successful
    RangeController.prototype.extendRangeInDirection = function (startCell, key) {
        var oneRangeExists = main_1._.exists(this.cellRanges) || this.cellRanges.length === 1;
        var previousSelectionStart = oneRangeExists ? this.cellRanges[0].start : null;
        var takeEndFromPreviousSelection = startCell.equals(previousSelectionStart);
        var previousEndCell = takeEndFromPreviousSelection ? this.cellRanges[0].end : startCell;
        var newEndCell = this.cellNavigationService.getNextCellToFocus(key, previousEndCell);
        // if user is at end of grid, so no cell to extend to, we return false
        if (!newEndCell) {
            return false;
        }
        this.setRange({
            rowStart: startCell.rowIndex,
            floatingStart: startCell.floating,
            rowEnd: newEndCell.rowIndex,
            floatingEnd: newEndCell.floating,
            columnStart: startCell.column,
            columnEnd: newEndCell.column
        });
        return true;
    };
    RangeController.prototype.setRange = function (rangeSelection) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        this.cellRanges = [];
        this.addRange(rangeSelection);
    };
    RangeController.prototype.addRange = function (rangeSelection) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        var columnStart = this.columnController.getColumnWithValidation(rangeSelection.columnStart);
        var columnEnd = this.columnController.getPrimaryColumn(rangeSelection.columnEnd);
        if (!columnStart || !columnEnd) {
            return;
        }
        var columns = this.updateSelectedColumns(columnStart, columnEnd);
        if (!columns) {
            return;
        }
        var startGridCellDef = { column: columnStart, rowIndex: rangeSelection.rowStart, floating: rangeSelection.floatingStart };
        var endGridCellDef = { column: columnEnd, rowIndex: rangeSelection.rowEnd, floating: rangeSelection.floatingEnd };
        var newRange = {
            start: new main_1.GridCell(startGridCellDef),
            end: new main_1.GridCell(endGridCellDef),
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
        var row1 = new main_1.GridRow(cellRange.start.rowIndex, cellRange.start.floating);
        var row2 = new main_1.GridRow(cellRange.end.rowIndex, cellRange.end.floating);
        var firstRow = row1.before(row2) ? row1 : row2;
        var lastRow = row1.before(row2) ? row2 : row1;
        var thisRow = new main_1.GridRow(rowIndex, floating);
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
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        // ctrlKey for windows, metaKey for Apple
        var multiKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        var allowMulti = !this.gridOptionsWrapper.isSuppressMultiRangeSelection();
        var multiSelectKeyPressed = allowMulti ? multiKeyPressed : false;
        if (main_1.Utils.missing(this.cellRanges) || !multiSelectKeyPressed) {
            this.cellRanges = [];
        }
        var cell = this.mouseEventService.getGridCellForEvent(mouseEvent);
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
        var gridCellDef = { column: cell.column, rowIndex: cell.rowIndex, floating: cell.floating };
        this.activeRange = {
            start: new main_1.GridCell(gridCellDef),
            end: new main_1.GridCell(gridCellDef),
            columns: [cell.column]
        };
        this.cellRanges.push(this.activeRange);
    };
    RangeController.prototype.selectionChanged = function (finished, started) {
        this.activeRange.columns = this.updateSelectedColumns(this.activeRange.start.column, this.activeRange.end.column);
        this.dispatchChangedEvent(finished, started);
    };
    RangeController.prototype.dispatchChangedEvent = function (finished, started) {
        var event = {
            type: main_1.Events.EVENT_RANGE_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            finished: finished,
            started: started
        };
        this.eventService.dispatchEvent(event);
    };
    RangeController.prototype.onDragStop = function () {
        if (!this.dragging) {
            return;
        }
        this.autoScrollService.ensureCleared();
        this.gridPanel.removeScrollEventListener(this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
        this.dispatchChangedEvent(true, false);
    };
    RangeController.prototype.onDragging = function (mouseEvent) {
        if (!this.dragging || !this.activeRange) {
            return;
        }
        this.lastMouseEvent = mouseEvent;
        this.autoScrollService.check(mouseEvent);
        var cell = this.mouseEventService.getGridCellForEvent(mouseEvent);
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
        var allColumns = this.columnController.getAllDisplayedColumns();
        var fromIndex = allColumns.indexOf(columnFrom);
        var toIndex = allColumns.indexOf(columnTo);
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
            columns.push(allColumns[i]);
        }
        return columns;
    };
    __decorate([
        main_1.Autowired('loggerFactory'),
        __metadata("design:type", main_1.LoggerFactory)
    ], RangeController.prototype, "loggerFactory", void 0);
    __decorate([
        main_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], RangeController.prototype, "rowModel", void 0);
    __decorate([
        main_1.Autowired('eventService'),
        __metadata("design:type", main_1.EventService)
    ], RangeController.prototype, "eventService", void 0);
    __decorate([
        main_1.Autowired('columnController'),
        __metadata("design:type", main_1.ColumnController)
    ], RangeController.prototype, "columnController", void 0);
    __decorate([
        main_1.Autowired('rowRenderer'),
        __metadata("design:type", main_1.RowRenderer)
    ], RangeController.prototype, "rowRenderer", void 0);
    __decorate([
        main_1.Autowired('focusedCellController'),
        __metadata("design:type", main_1.FocusedCellController)
    ], RangeController.prototype, "focusedCellController", void 0);
    __decorate([
        main_1.Autowired('mouseEventService'),
        __metadata("design:type", main_1.MouseEventService)
    ], RangeController.prototype, "mouseEventService", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", main_1.GridOptionsWrapper)
    ], RangeController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('columnApi'),
        __metadata("design:type", main_1.ColumnApi)
    ], RangeController.prototype, "columnApi", void 0);
    __decorate([
        main_1.Autowired('gridApi'),
        __metadata("design:type", main_1.GridApi)
    ], RangeController.prototype, "gridApi", void 0);
    __decorate([
        main_1.Autowired('cellNavigationService'),
        __metadata("design:type", main_1.CellNavigationService)
    ], RangeController.prototype, "cellNavigationService", void 0);
    __decorate([
        main_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], RangeController.prototype, "init", null);
    RangeController = __decorate([
        main_1.Bean('rangeController')
    ], RangeController);
    return RangeController;
}());
exports.RangeController = RangeController;
var AutoScrollService = (function () {
    function AutoScrollService(gridPanel, gridOptionsWrapper) {
        this.tickingInterval = null;
        this.gridPanel = gridPanel;
        this.gridOptionsWrapper = gridOptionsWrapper;
    }
    AutoScrollService.prototype.check = function (mouseEvent) {
        // we don't do ticking if grid is auto height
        if (this.gridOptionsWrapper.isGridAutoHeight()) {
            return;
        }
        var rect = this.gridPanel.getBodyClientRect();
        this.tickLeft = mouseEvent.clientX < (rect.left + 20);
        this.tickRight = mouseEvent.clientX > (rect.right - 20);
        this.tickUp = mouseEvent.clientY < (rect.top + 20);
        this.tickDown = mouseEvent.clientY > (rect.bottom - 20);
        if (this.tickLeft || this.tickRight || this.tickUp || this.tickDown) {
            this.ensureTickingStarted();
        }
        else {
            this.ensureCleared();
        }
    };
    AutoScrollService.prototype.ensureTickingStarted = function () {
        if (this.tickingInterval === null) {
            this.tickingInterval = setInterval(this.doTick.bind(this), 100);
            this.tickCount = 0;
        }
    };
    AutoScrollService.prototype.doTick = function () {
        this.tickCount++;
        var vScrollPosition = this.gridPanel.getVScrollPosition();
        var hScrollPosition = this.gridPanel.getHScrollPosition();
        var tickAmount;
        if (this.tickCount > 20) {
            tickAmount = 200;
        }
        else if (this.tickCount > 10) {
            tickAmount = 80;
        }
        else {
            tickAmount = 40;
        }
        if (this.tickUp) {
            this.gridPanel.setVerticalScrollPosition(vScrollPosition.top - tickAmount);
        }
        if (this.tickDown) {
            this.gridPanel.setVerticalScrollPosition(vScrollPosition.top + tickAmount);
        }
        if (this.tickLeft) {
            this.gridPanel.setHorizontalScrollPosition(hScrollPosition.left - tickAmount);
        }
        if (this.tickRight) {
            this.gridPanel.setHorizontalScrollPosition(hScrollPosition.left + tickAmount);
        }
    };
    AutoScrollService.prototype.ensureCleared = function () {
        if (this.tickingInterval) {
            clearInterval(this.tickingInterval);
            this.tickingInterval = null;
        }
    };
    return AutoScrollService;
}());
