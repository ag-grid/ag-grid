"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var RangeController = /** @class */ (function (_super) {
    __extends(RangeController, _super);
    function RangeController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cellRanges = [];
        _this.bodyScrollListener = _this.onBodyScroll.bind(_this);
        _this.dragging = false;
        return _this;
    }
    RangeController.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
        this.autoScrollService = new AutoScrollService(this.gridPanel, this.gridOptionsWrapper);
    };
    RangeController.prototype.init = function () {
        this.logger = this.loggerFactory.create('RangeController');
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.removeAllCellRanges.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.removeAllCellRanges.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.removeAllCellRanges.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_GROUP_OPENED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_MOVED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_PINNED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_VISIBLE, this.onColumnVisibleChange.bind(this));
    };
    RangeController.prototype.onColumnVisibleChange = function () {
        var _this = this;
        // first move start column in last cell range (i.e. series chart range)
        this.refreshLastRangeStart();
        // then check if the column visibility has changed in any cell range
        this.cellRanges.forEach(function (cellRange) {
            var beforeCols = cellRange.columns;
            // remove hidden cols from cell range
            cellRange.columns = cellRange.columns.filter(function (col) { return col.isVisible(); });
            var colsInRangeChanged = !core_1._.areEqual(beforeCols, cellRange.columns);
            if (colsInRangeChanged) {
                // notify users and other parts of grid (i.e. status panel) that range has changed
                _this.dispatchChangedEvent(false, true, cellRange.id);
            }
        });
    };
    RangeController.prototype.refreshLastRangeStart = function () {
        var lastRange = core_1._.last(this.cellRanges);
        if (!lastRange) {
            return;
        }
        this.refreshRangeStart(lastRange);
    };
    RangeController.prototype.isContiguousRange = function (cellRange) {
        var rangeColumns = cellRange.columns;
        if (!rangeColumns.length) {
            return false;
        }
        var allColumns = this.columnController.getAllDisplayedColumns();
        var allPositions = rangeColumns.map(function (c) { return allColumns.indexOf(c); }).sort(function (a, b) { return a - b; });
        return core_1._.last(allPositions) - allPositions[0] + 1 === rangeColumns.length;
    };
    RangeController.prototype.getRangeStartRow = function (cellRange) {
        if (cellRange.startRow && cellRange.endRow) {
            return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ?
                cellRange.startRow : cellRange.endRow;
        }
        var rowPinned = this.pinnedRowModel.getPinnedTopRowCount() > 0 ? core_1.Constants.PINNED_TOP : undefined;
        return { rowIndex: 0, rowPinned: rowPinned };
    };
    RangeController.prototype.getRangeEndRow = function (cellRange) {
        if (cellRange.startRow && cellRange.endRow) {
            return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ?
                cellRange.endRow : cellRange.startRow;
        }
        var pinnedBottomRowCount = this.pinnedRowModel.getPinnedBottomRowCount();
        var pinnedBottom = pinnedBottomRowCount > 0;
        if (pinnedBottom) {
            return {
                rowIndex: pinnedBottomRowCount - 1,
                rowPinned: core_1.Constants.PINNED_BOTTOM
            };
        }
        return {
            rowIndex: this.rowModel.getRowCount() - 1,
            rowPinned: undefined
        };
    };
    RangeController.prototype.setRangeToCell = function (cell, appendRange) {
        if (appendRange === void 0) { appendRange = false; }
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        var columns = this.calculateColumnsBetween(cell.column, cell.column);
        if (!columns) {
            return;
        }
        var suppressMultiRangeSelections = this.gridOptionsWrapper.isSuppressMultiRangeSelection();
        // if not appending, then clear previous range selections
        if (suppressMultiRangeSelections || !appendRange || core_1._.missing(this.cellRanges)) {
            this.removeAllCellRanges(true);
        }
        var rowForCell = {
            rowIndex: cell.rowIndex,
            rowPinned: cell.rowPinned
        };
        // if there is already a range for this cell, then we reuse the same range, otherwise the user
        // can ctrl & click a cell many times and hit ctrl+c, which would result in the cell getting copied
        // many times to the clipboard.
        var cellRange;
        for (var i = 0; i < this.cellRanges.length; i++) {
            var range = this.cellRanges[i];
            var matches = 
            // check cols are same
            (range.columns && range.columns.length === 1 && range.columns[0] === cell.column) &&
                // check rows are same
                this.rowPositionUtils.sameRow(rowForCell, range.startRow) &&
                this.rowPositionUtils.sameRow(rowForCell, range.endRow);
            if (matches) {
                cellRange = range;
                break;
            }
        }
        if (cellRange) {
            // we need it at the end of the list, as the dragStart picks the last created
            // range as the start point for the drag
            if (core_1._.last(this.cellRanges) !== cellRange) {
                core_1._.removeFromArray(this.cellRanges, cellRange);
                this.cellRanges.push(cellRange);
            }
        }
        else {
            cellRange = {
                startRow: rowForCell,
                endRow: rowForCell,
                columns: columns,
                startColumn: cell.column
            };
            this.cellRanges.push(cellRange);
        }
        this.newestRangeStartCell = cell;
        this.onDragStop();
        this.dispatchChangedEvent(true, true, cellRange.id);
    };
    RangeController.prototype.extendLatestRangeToCell = function (cellPosition) {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }
        var cellRange = core_1._.last(this.cellRanges);
        this.updateRangeEnd(cellRange, cellPosition);
    };
    RangeController.prototype.updateRangeEnd = function (cellRange, cellPosition, silent) {
        if (silent === void 0) { silent = false; }
        var endColumn = cellPosition.column;
        var colsToAdd = this.calculateColumnsBetween(cellRange.startColumn, endColumn);
        if (!colsToAdd || this.isLastCellOfRange(cellRange, cellPosition)) {
            return;
        }
        cellRange.columns = colsToAdd;
        cellRange.endRow = { rowIndex: cellPosition.rowIndex, rowPinned: cellPosition.rowPinned };
        if (!silent) {
            this.dispatchChangedEvent(true, true, cellRange.id);
        }
    };
    RangeController.prototype.refreshRangeStart = function (cellRange) {
        var startColumn = cellRange.startColumn, columns = cellRange.columns;
        var moveColInCellRange = function (colToMove, moveToFront) {
            var otherCols = cellRange.columns.filter(function (col) { return col !== colToMove; });
            if (colToMove) {
                cellRange.startColumn = colToMove;
                cellRange.columns = moveToFront ? __spreadArrays([colToMove], otherCols) : __spreadArrays(otherCols, [colToMove]);
            }
            else {
                cellRange.columns = otherCols;
            }
        };
        var _a = this.getRangeEdgeColumns(cellRange), left = _a.left, right = _a.right;
        var shouldMoveLeftCol = startColumn === columns[0] && startColumn !== left;
        if (shouldMoveLeftCol) {
            moveColInCellRange(left, true);
            return;
        }
        var shouldMoveRightCol = startColumn === core_1._.last(columns) && startColumn === right;
        if (shouldMoveRightCol) {
            moveColInCellRange(right, false);
            return;
        }
    };
    RangeController.prototype.getRangeEdgeColumns = function (cellRange) {
        var allColumns = this.columnController.getAllDisplayedColumns();
        var allIndices = cellRange.columns
            .map(function (c) { return allColumns.indexOf(c); })
            .filter(function (i) { return i > -1; })
            .sort(function (a, b) { return a - b; });
        return {
            left: allColumns[allIndices[0]],
            right: allColumns[core_1._.last(allIndices)]
        };
    };
    // returns true if successful, false if not successful
    RangeController.prototype.extendLatestRangeInDirection = function (key) {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }
        var lastRange = core_1._.last(this.cellRanges);
        var startCell = this.newestRangeStartCell;
        var firstCol = lastRange.columns[0];
        var lastCol = core_1._.last(lastRange.columns);
        // find the cell that is at the furthest away corner from the starting cell
        var endCellIndex = lastRange.endRow.rowIndex;
        var endCellFloating = lastRange.endRow.rowPinned;
        var endCellColumn = startCell.column === firstCol ? lastCol : firstCol;
        var endCell = { column: endCellColumn, rowIndex: endCellIndex, rowPinned: endCellFloating };
        var newEndCell = this.cellNavigationService.getNextCellToFocus(key, endCell);
        // if user is at end of grid, so no cell to extend to, we return false
        if (!newEndCell) {
            return;
        }
        this.setCellRange({
            rowStartIndex: startCell.rowIndex,
            rowStartPinned: startCell.rowPinned,
            rowEndIndex: newEndCell.rowIndex,
            rowEndPinned: newEndCell.rowPinned,
            columnStart: startCell.column,
            columnEnd: newEndCell.column
        });
        return newEndCell;
    };
    RangeController.prototype.setCellRange = function (params) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        this.removeAllCellRanges(true);
        this.addCellRange(params);
    };
    RangeController.prototype.setCellRanges = function (cellRanges) {
        var _this = this;
        this.removeAllCellRanges(true);
        cellRanges.forEach(function (newRange) {
            if (newRange.columns && newRange.startRow) {
                _this.newestRangeStartCell = {
                    rowIndex: newRange.startRow.rowIndex,
                    rowPinned: newRange.startRow.rowPinned,
                    column: newRange.columns[0]
                };
            }
            _this.cellRanges.push(newRange);
        });
        this.dispatchChangedEvent(false, true);
    };
    RangeController.prototype.createCellRangeFromCellRangeParams = function (params) {
        var _this = this;
        var columns;
        if (params.columns) {
            columns = params.columns.map(function (c) { return _this.columnController.getColumnWithValidation(c); }).filter(function (c) { return c; });
        }
        else {
            var columnStart = this.columnController.getColumnWithValidation(params.columnStart);
            var columnEnd = this.columnController.getColumnWithValidation(params.columnEnd);
            if (!columnStart || !columnEnd) {
                return;
            }
            columns = this.calculateColumnsBetween(columnStart, columnEnd);
        }
        if (!columns) {
            return;
        }
        var startRow = params.rowStartIndex != null ? {
            rowIndex: params.rowStartIndex,
            rowPinned: params.rowStartPinned
        } : undefined;
        var endRow = params.rowEndIndex != null ? {
            rowIndex: params.rowEndIndex,
            rowPinned: params.rowEndPinned
        } : undefined;
        return {
            startRow: startRow,
            endRow: endRow,
            columns: columns,
            startColumn: columns[0]
        };
    };
    RangeController.prototype.addCellRange = function (params) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        var newRange = this.createCellRangeFromCellRangeParams(params);
        if (newRange) {
            this.cellRanges.push(newRange);
            this.dispatchChangedEvent(false, true, newRange.id);
        }
    };
    RangeController.prototype.getCellRanges = function () {
        return this.cellRanges;
    };
    RangeController.prototype.isEmpty = function () {
        return this.cellRanges.length === 0;
    };
    RangeController.prototype.isMoreThanOneCell = function () {
        if (this.cellRanges.length === 0) {
            // no ranges, so not more than one cell
            return false;
        }
        else if (this.cellRanges.length > 1) {
            // many ranges, so more than one cell
            return true;
        }
        // only one range, return true if range has more than one
        var range = this.cellRanges[0];
        var startRow = this.getRangeStartRow(range);
        var endRow = this.getRangeEndRow(range);
        return startRow.rowPinned !== endRow.rowPinned ||
            startRow.rowIndex !== endRow.rowIndex ||
            range.columns.length !== 1;
    };
    RangeController.prototype.removeAllCellRanges = function (silent) {
        if (this.isEmpty()) {
            return;
        }
        this.onDragStop();
        this.cellRanges.length = 0;
        if (!silent) {
            this.dispatchChangedEvent(false, true);
        }
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
        var columnInRange = range.columns !== null && core_1._.includes(range.columns, cell.column);
        var rowInRange = this.isRowInRange(cell.rowIndex, cell.rowPinned, range);
        return columnInRange && rowInRange;
    };
    RangeController.prototype.isLastCellOfRange = function (cellRange, cell) {
        var startRow = cellRange.startRow, endRow = cellRange.endRow;
        var lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
        var isLastRow = cell.rowIndex === lastRow.rowIndex && cell.rowPinned === lastRow.rowPinned;
        var rangeFirstIndexColumn = cellRange.columns[0];
        var rangeLastIndexColumn = core_1._.last(cellRange.columns);
        var lastRangeColumn = cellRange.startColumn === rangeFirstIndexColumn ? rangeLastIndexColumn : rangeFirstIndexColumn;
        var isLastColumn = cell.column === lastRangeColumn;
        return isLastColumn && isLastRow;
    };
    RangeController.prototype.isBottomRightCell = function (cellRange, cell) {
        var allColumns = this.columnController.getAllDisplayedColumns();
        var allPositions = cellRange.columns.map(function (c) { return allColumns.indexOf(c); }).sort(function (a, b) { return a - b; });
        var startRow = cellRange.startRow, endRow = cellRange.endRow;
        var lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
        var isRightColumn = allColumns.indexOf(cell.column) === core_1._.last(allPositions);
        var isLastRow = cell.rowIndex === lastRow.rowIndex && core_1._.makeNull(cell.rowPinned) === core_1._.makeNull(lastRow.rowPinned);
        return isRightColumn && isLastRow;
    };
    // returns the number of ranges this cell is in
    RangeController.prototype.getCellRangeCount = function (cell) {
        var _this = this;
        if (this.isEmpty()) {
            return 0;
        }
        return this.cellRanges.filter(function (cellRange) { return _this.isCellInSpecificRange(cell, cellRange); }).length;
    };
    RangeController.prototype.isRowInRange = function (rowIndex, floating, cellRange) {
        var firstRow = this.getRangeStartRow(cellRange);
        var lastRow = this.getRangeEndRow(cellRange);
        var thisRow = { rowIndex: rowIndex, rowPinned: floating };
        // compare rowPinned with == instead of === because it can be `null` or `undefined`
        var equalsFirstRow = thisRow.rowIndex === firstRow.rowIndex && thisRow.rowPinned == firstRow.rowPinned;
        var equalsLastRow = thisRow.rowIndex === lastRow.rowIndex && thisRow.rowPinned == lastRow.rowPinned;
        if (equalsFirstRow || equalsLastRow) {
            return true;
        }
        var afterFirstRow = !this.rowPositionUtils.before(thisRow, firstRow);
        var beforeLastRow = this.rowPositionUtils.before(thisRow, lastRow);
        return afterFirstRow && beforeLastRow;
    };
    RangeController.prototype.getDraggingRange = function () {
        return this.draggingRange;
    };
    RangeController.prototype.onDragStart = function (mouseEvent) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        var ctrlKey = mouseEvent.ctrlKey, metaKey = mouseEvent.metaKey, shiftKey = mouseEvent.shiftKey;
        // ctrlKey for windows, metaKey for Apple
        var multiKeyPressed = ctrlKey || metaKey;
        var allowMulti = !this.gridOptionsWrapper.isSuppressMultiRangeSelection();
        var multiSelectKeyPressed = allowMulti ? multiKeyPressed : false;
        var mouseCell = this.mouseEventService.getCellPositionForEvent(mouseEvent);
        if (core_1._.missing(mouseCell)) {
            // if drag wasn't on cell, then do nothing, including do not set dragging=true,
            // (which them means onDragging and onDragStop do nothing)
            return;
        }
        if (!multiSelectKeyPressed && (!shiftKey || core_1._.exists(core_1._.last(this.cellRanges).type))) {
            this.removeAllCellRanges(true);
        }
        this.dragging = true;
        this.draggingCell = mouseCell;
        this.lastMouseEvent = mouseEvent;
        if (!shiftKey) {
            this.newestRangeStartCell = mouseCell;
        }
        // if we didn't clear the ranges, then dragging means the user clicked, and when the
        // user clicks it means a range of one cell was created. we need to extend this range
        // rather than creating another range. otherwise we end up with two distinct ranges
        // from a drag operation (one from click, and one from drag).
        if (this.cellRanges.length > 0) {
            this.draggingRange = core_1._.last(this.cellRanges);
        }
        else {
            var mouseRowPosition = {
                rowIndex: mouseCell.rowIndex,
                rowPinned: mouseCell.rowPinned
            };
            this.draggingRange = {
                startRow: mouseRowPosition,
                endRow: mouseRowPosition,
                columns: [mouseCell.column],
                startColumn: this.newestRangeStartCell.column
            };
            this.cellRanges.push(this.draggingRange);
        }
        this.gridPanel.addScrollEventListener(this.bodyScrollListener);
        this.dispatchChangedEvent(true, false, this.draggingRange.id);
    };
    RangeController.prototype.onDragging = function (mouseEvent) {
        var _this = this;
        if (!this.dragging || !mouseEvent) {
            return;
        }
        this.lastMouseEvent = mouseEvent;
        var cellPosition = this.mouseEventService.getCellPositionForEvent(mouseEvent);
        var isMouseAndStartInPinned = function (position) {
            return cellPosition && cellPosition.rowPinned === position && _this.newestRangeStartCell.rowPinned === position;
        };
        var skipVerticalScroll = isMouseAndStartInPinned('top') || isMouseAndStartInPinned('bottom');
        this.autoScrollService.check(mouseEvent, skipVerticalScroll);
        if (!cellPosition ||
            !this.draggingCell ||
            this.cellPositionUtils.equals(this.draggingCell, cellPosition)) {
            return;
        }
        var columns = this.calculateColumnsBetween(this.newestRangeStartCell.column, cellPosition.column);
        if (!columns) {
            return;
        }
        this.draggingCell = cellPosition;
        this.draggingRange.endRow = {
            rowIndex: cellPosition.rowIndex,
            rowPinned: cellPosition.rowPinned
        };
        this.draggingRange.columns = columns;
        this.dispatchChangedEvent(false, false, this.draggingRange.id);
    };
    RangeController.prototype.onDragStop = function () {
        if (!this.dragging) {
            return;
        }
        var id = this.draggingRange.id;
        this.autoScrollService.ensureCleared();
        this.gridPanel.removeScrollEventListener(this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
        this.draggingRange = undefined;
        this.draggingCell = undefined;
        this.dispatchChangedEvent(false, true, id);
    };
    RangeController.prototype.dispatchChangedEvent = function (started, finished, id) {
        var event = Object.freeze({
            type: core_1.Events.EVENT_RANGE_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            started: started,
            finished: finished,
            id: id,
        });
        this.eventService.dispatchEvent(event);
    };
    RangeController.prototype.calculateColumnsBetween = function (columnFrom, columnTo) {
        var allColumns = this.columnController.getAllDisplayedColumns();
        var isSameColumn = columnFrom === columnTo;
        var fromIndex = allColumns.indexOf(columnFrom);
        if (fromIndex < 0) {
            console.warn("ag-Grid: column " + columnFrom.getId() + " is not visible");
            return undefined;
        }
        var toIndex = isSameColumn ? fromIndex : allColumns.indexOf(columnTo);
        if (toIndex < 0) {
            console.warn("ag-Grid: column " + columnTo.getId() + " is not visible");
            return undefined;
        }
        if (isSameColumn) {
            return [columnFrom];
        }
        var firstIndex = Math.min(fromIndex, toIndex);
        var lastIndex = firstIndex === fromIndex ? toIndex : fromIndex;
        var columns = [];
        for (var i = firstIndex; i <= lastIndex; i++) {
            columns.push(allColumns[i]);
        }
        return columns;
    };
    __decorate([
        core_1.Autowired('loggerFactory')
    ], RangeController.prototype, "loggerFactory", void 0);
    __decorate([
        core_1.Autowired('rowModel')
    ], RangeController.prototype, "rowModel", void 0);
    __decorate([
        core_1.Autowired('columnController')
    ], RangeController.prototype, "columnController", void 0);
    __decorate([
        core_1.Autowired('mouseEventService')
    ], RangeController.prototype, "mouseEventService", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], RangeController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('columnApi')
    ], RangeController.prototype, "columnApi", void 0);
    __decorate([
        core_1.Autowired('gridApi')
    ], RangeController.prototype, "gridApi", void 0);
    __decorate([
        core_1.Autowired('cellNavigationService')
    ], RangeController.prototype, "cellNavigationService", void 0);
    __decorate([
        core_1.Autowired("pinnedRowModel")
    ], RangeController.prototype, "pinnedRowModel", void 0);
    __decorate([
        core_1.Autowired('rowPositionUtils')
    ], RangeController.prototype, "rowPositionUtils", void 0);
    __decorate([
        core_1.Autowired('cellPositionUtils')
    ], RangeController.prototype, "cellPositionUtils", void 0);
    __decorate([
        core_1.PostConstruct
    ], RangeController.prototype, "init", null);
    RangeController = __decorate([
        core_1.Bean('rangeController')
    ], RangeController);
    return RangeController;
}(core_1.BeanStub));
exports.RangeController = RangeController;
var AutoScrollService = /** @class */ (function () {
    function AutoScrollService(gridPanel, gridOptionsWrapper) {
        this.tickingInterval = null;
        this.gridPanel = gridPanel;
        this.gridOptionsWrapper = gridOptionsWrapper;
    }
    AutoScrollService.prototype.check = function (mouseEvent, skipVerticalScroll) {
        if (skipVerticalScroll === void 0) { skipVerticalScroll = false; }
        var rect = this.gridPanel.getBodyClientRect();
        skipVerticalScroll = skipVerticalScroll || this.gridOptionsWrapper.getDomLayout() !== core_1.Constants.DOM_LAYOUT_NORMAL;
        // we don't do ticking if grid is auto height unless we have a horizontal scroller
        if (skipVerticalScroll && !this.gridPanel.isHorizontalScrollShowing()) {
            return;
        }
        this.tickLeft = mouseEvent.clientX < (rect.left + 20);
        this.tickRight = mouseEvent.clientX > (rect.right - 20);
        this.tickUp = mouseEvent.clientY < (rect.top + 20) && !skipVerticalScroll;
        this.tickDown = mouseEvent.clientY > (rect.bottom - 20) && !skipVerticalScroll;
        if (this.tickLeft || this.tickRight || this.tickUp || this.tickDown) {
            this.ensureTickingStarted();
        }
        else {
            this.ensureCleared();
        }
    };
    AutoScrollService.prototype.ensureTickingStarted = function () {
        if (this.tickingInterval === null) {
            this.tickingInterval = window.setInterval(this.doTick.bind(this), 100);
            this.tickCount = 0;
        }
    };
    AutoScrollService.prototype.doTick = function () {
        this.tickCount++;
        var vScrollPosition = this.gridPanel.getVScrollPosition();
        var hScrollPosition = this.gridPanel.getHScrollPosition();
        var tickAmount;
        tickAmount = this.tickCount > 20 ? 200 : (this.tickCount > 10 ? 80 : 40);
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
            window.clearInterval(this.tickingInterval);
            this.tickingInterval = null;
        }
    };
    return AutoScrollService;
}());
//# sourceMappingURL=rangeController.js.map