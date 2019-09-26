// ag-grid-enterprise v21.2.2
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
var ag_grid_community_1 = require("ag-grid-community");
var RangeController = /** @class */ (function () {
    function RangeController() {
        this.cellRanges = [];
        this.bodyScrollListener = this.onBodyScroll.bind(this);
        this.dragging = false;
    }
    RangeController.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
        this.autoScrollService = new AutoScrollService(this.gridPanel, this.gridOptionsWrapper);
    };
    RangeController.prototype.init = function () {
        this.logger = this.loggerFactory.create('RangeController');
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.removeAllCellRanges.bind(this));
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.removeAllCellRanges.bind(this));
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.removeAllCellRanges.bind(this));
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_COLUMN_GROUP_OPENED, this.refreshLastRangeStart.bind(this));
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_COLUMN_MOVED, this.refreshLastRangeStart.bind(this));
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_COLUMN_PINNED, this.refreshLastRangeStart.bind(this));
        this.eventService.addEventListener(ag_grid_community_1.Events.EVENT_COLUMN_VISIBLE, this.onColumnVisibleChange.bind(this));
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
            var colsInRangeChanged = !ag_grid_community_1._.compareArrays(beforeCols, cellRange.columns);
            if (colsInRangeChanged) {
                // notify users and other parts of grid (i.e. status panel) that range has changed
                _this.onRangeChanged({ started: false, finished: true });
                // notify chart of cell range change
                var event_1 = {
                    id: cellRange.id,
                    type: ag_grid_community_1.Events.EVENT_CHART_RANGE_SELECTION_CHANGED
                };
                _this.eventService.dispatchEvent(event_1);
            }
        });
    };
    RangeController.prototype.refreshLastRangeStart = function () {
        var lastRange = ag_grid_community_1._.last(this.cellRanges);
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
        var allPositions = [];
        rangeColumns.forEach(function (col) { return allPositions.push(allColumns.indexOf(col)); });
        allPositions.sort(function (a, b) { return a - b; });
        return ag_grid_community_1._.last(allPositions) - allPositions[0] + 1 === rangeColumns.length;
    };
    RangeController.prototype.getRangeStartRow = function (cellRange) {
        if (cellRange.startRow && cellRange.endRow) {
            var startRowIsFirst = this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow);
            return startRowIsFirst ? cellRange.startRow : cellRange.endRow;
        }
        var pinned = (this.pinnedRowModel.getPinnedTopRowCount() > 0) ? ag_grid_community_1.Constants.PINNED_TOP : undefined;
        return { rowIndex: 0, rowPinned: pinned };
    };
    RangeController.prototype.getRangeEndRow = function (cellRange) {
        if (cellRange.startRow && cellRange.endRow) {
            var startRowIsFirst = this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow);
            return startRowIsFirst ? cellRange.endRow : cellRange.startRow;
        }
        var pinnedBottomRowCount = this.pinnedRowModel.getPinnedBottomRowCount();
        var pinnedBottom = pinnedBottomRowCount > 0;
        if (pinnedBottom) {
            return {
                rowIndex: pinnedBottomRowCount - 1,
                rowPinned: ag_grid_community_1.Constants.PINNED_BOTTOM
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
        if (suppressMultiRangeSelections || !appendRange || ag_grid_community_1._.missing(this.cellRanges)) {
            this.removeAllCellRanges(true);
        }
        var rowForCell = {
            rowIndex: cell.rowIndex,
            rowPinned: cell.rowPinned
        };
        // if there is already a range for this cell, then we reuse the same range, otherwise the user
        // can ctrl & click a cell many times and hit ctrl+c, which would result in the cell getting copied
        // many times to the clipboard.
        var existingRange;
        for (var i = 0; i < this.cellRanges.length; i++) {
            var range = this.cellRanges[i];
            var matches = 
            // check cols are same
            (range.columns && range.columns.length === 1 && range.columns[0] === cell.column) &&
                // check rows are same
                this.rowPositionUtils.sameRow(rowForCell, range.startRow) &&
                this.rowPositionUtils.sameRow(rowForCell, range.endRow);
            if (matches) {
                existingRange = range;
                break;
            }
        }
        if (existingRange) {
            // we need it at the end of the list, as the dragStart picks the last created
            // range as the start point for the drag
            var atEndOfList = ag_grid_community_1._.last(this.cellRanges) === existingRange;
            if (!atEndOfList) {
                ag_grid_community_1._.removeFromArray(this.cellRanges, existingRange);
                this.cellRanges.push(existingRange);
            }
        }
        else {
            var newRange = {
                startRow: rowForCell,
                endRow: rowForCell,
                columns: columns,
                startColumn: cell.column
            };
            this.cellRanges.push(newRange);
        }
        this.newestRangeStartCell = cell;
        this.onDragStop();
        this.onRangeChanged({ started: false, finished: true });
    };
    RangeController.prototype.extendLatestRangeToCell = function (cellPosition) {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }
        var cellRange = ag_grid_community_1._.last(this.cellRanges);
        this.updateRangeEnd({
            cellRange: cellRange,
            cellPosition: cellPosition
        });
    };
    RangeController.prototype.updateRangeEnd = function (params) {
        var cellRange = params.cellRange, cellPosition = params.cellPosition;
        var beforeCols = cellRange.columns.slice();
        var beforeEndRow = ag_grid_community_1._.cloneObject(cellRange.endRow);
        var endColumn = cellPosition.column;
        var colsToAdd = this.calculateColumnsBetween(cellRange.startColumn, endColumn);
        if (!colsToAdd) {
            return;
        }
        cellRange.columns = colsToAdd;
        cellRange.endRow = { rowIndex: cellPosition.rowIndex, rowPinned: cellPosition.rowPinned };
        this.onRangeChanged({ started: false, finished: true });
        var colsChanged = !ag_grid_community_1._.compareArrays(beforeCols, cellRange.columns);
        var endRowChanged = JSON.stringify(beforeEndRow) !== JSON.stringify(cellRange.endRow);
        if (colsChanged || endRowChanged) {
            // Note that we are raising a new event as the Chart shouldn't be notified when other ranges are changed
            // or when the chart setCellRanges when the chart gains focus!
            var event_2 = {
                id: cellRange.id,
                type: ag_grid_community_1.Events.EVENT_CHART_RANGE_SELECTION_CHANGED
            };
            this.eventService.dispatchEvent(event_2);
        }
    };
    RangeController.prototype.refreshRangeStart = function (cellRange) {
        var startColumn = cellRange.startColumn, columns = cellRange.columns;
        var moveColInCellRange = function (colToMove, moveToFront) {
            var otherCols = cellRange.columns.filter(function (col) { return col !== colToMove; });
            if (colToMove) {
                cellRange.startColumn = colToMove;
                cellRange.columns = moveToFront ? [colToMove].concat(otherCols) : otherCols.concat([colToMove]);
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
        var shouldMoveRightCol = startColumn === ag_grid_community_1._.last(columns) && startColumn === right;
        if (shouldMoveRightCol) {
            moveColInCellRange(right, false);
            return;
        }
    };
    RangeController.prototype.getRangeEdgeColumns = function (cellRange) {
        var allColumns = this.columnController.getAllDisplayedColumns();
        var allIndices = [];
        for (var _i = 0, _a = cellRange.columns; _i < _a.length; _i++) {
            var column = _a[_i];
            var idx = allColumns.indexOf(column);
            if (idx > -1) {
                allIndices.push(idx);
            }
        }
        allIndices.sort(function (a, b) { return a - b; });
        return {
            left: allColumns[allIndices[0]],
            right: allColumns[ag_grid_community_1._.last(allIndices)]
        };
    };
    // returns true if successful, false if not successful
    RangeController.prototype.extendLatestRangeInDirection = function (key) {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }
        var lastRange = ag_grid_community_1._.last(this.cellRanges);
        var startCell = this.newestRangeStartCell;
        var firstCol = lastRange.columns[0];
        var lastCol = ag_grid_community_1._.last(lastRange.columns);
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
        this.onRangeChanged({ started: false, finished: true });
    };
    RangeController.prototype.createCellRangeFromCellRangeParams = function (params) {
        var _this = this;
        var columns;
        if (params.columns) {
            columns = [];
            params.columns.forEach(function (key) {
                var col = _this.columnController.getColumnWithValidation(key);
                if (col) {
                    columns.push(col);
                }
            });
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
        var startRow = undefined;
        if (params.rowStartIndex != null) {
            startRow = {
                rowIndex: params.rowStartIndex,
                rowPinned: params.rowStartPinned
            };
        }
        var endRow = undefined;
        if (params.rowEndIndex != null) {
            endRow = {
                rowIndex: params.rowEndIndex,
                rowPinned: params.rowEndPinned
            };
        }
        var newRange = {
            startRow: startRow,
            endRow: endRow,
            columns: columns,
            startColumn: columns[0]
        };
        return newRange;
    };
    RangeController.prototype.addCellRange = function (params) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        var newRange = this.createCellRangeFromCellRangeParams(params);
        if (newRange) {
            this.cellRanges.push(newRange);
            this.onRangeChanged({ started: false, finished: true });
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
        var moreThanOneCell = startRow.rowPinned !== endRow.rowPinned ||
            startRow.rowIndex !== endRow.rowIndex ||
            range.columns.length !== 1;
        return moreThanOneCell;
    };
    RangeController.prototype.removeAllCellRanges = function (silent) {
        if (this.isEmpty()) {
            return;
        }
        this.onDragStop();
        this.cellRanges.length = 0;
        if (!silent) {
            this.onRangeChanged({ started: false, finished: true });
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
        var columnInRange = range.columns !== null && range.columns.indexOf(cell.column) >= 0;
        var rowInRange = this.isRowInRange(cell.rowIndex, cell.rowPinned, range);
        return columnInRange && rowInRange;
    };
    // returns the number of ranges this cell is in
    RangeController.prototype.getCellRangeCount = function (cell) {
        var _this = this;
        if (this.isEmpty()) {
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
        if (ag_grid_community_1._.missing(mouseCell)) {
            // if drag wasn't on cell, then do nothing, including do not set dragging=true,
            // (which them means onDragging and onDragStop do nothing)
            return;
        }
        if (!multiSelectKeyPressed && (!shiftKey || ag_grid_community_1._.exists(ag_grid_community_1._.last(this.cellRanges).type))) {
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
            this.draggingRange = ag_grid_community_1._.last(this.cellRanges);
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
        this.onRangeChanged({ started: true, finished: false });
    };
    RangeController.prototype.onDragging = function (mouseEvent) {
        if (!this.dragging || !mouseEvent) {
            return;
        }
        this.lastMouseEvent = mouseEvent;
        var cellPosition = this.mouseEventService.getCellPositionForEvent(mouseEvent);
        var mouseAndStartInPinnedTop = cellPosition && cellPosition.rowPinned === 'top' && this.newestRangeStartCell.rowPinned === 'top';
        var mouseAndStartInPinnedBottom = cellPosition && cellPosition.rowPinned === 'bottom' && this.newestRangeStartCell.rowPinned === 'bottom';
        var skipVerticalScroll = mouseAndStartInPinnedTop || mouseAndStartInPinnedBottom;
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
        this.onRangeChanged({ started: false, finished: false });
    };
    RangeController.prototype.onDragStop = function () {
        if (!this.dragging) {
            return;
        }
        this.autoScrollService.ensureCleared();
        this.gridPanel.removeScrollEventListener(this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
        this.draggingRange = undefined;
        this.draggingCell = undefined;
        this.onRangeChanged({ started: false, finished: true });
    };
    RangeController.prototype.onRangeChanged = function (params) {
        var started = params.started, finished = params.finished;
        this.dispatchChangedEvent(started, finished);
    };
    RangeController.prototype.dispatchChangedEvent = function (started, finished) {
        var event = {
            type: ag_grid_community_1.Events.EVENT_RANGE_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            started: started,
            finished: finished
        };
        this.eventService.dispatchEvent(event);
    };
    RangeController.prototype.calculateColumnsBetween = function (columnFrom, columnTo) {
        var allColumns = this.columnController.getAllDisplayedColumns();
        var isSameColumn = columnFrom === columnTo;
        var fromIndex = allColumns.indexOf(columnFrom);
        var toIndex = isSameColumn ? fromIndex : allColumns.indexOf(columnTo);
        if (fromIndex < 0) {
            console.warn('ag-Grid: column ' + columnFrom.getId() + ' is not visible');
            return undefined;
        }
        if (toIndex < 0) {
            console.warn('ag-Grid: column ' + columnTo.getId() + ' is not visible');
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
        ag_grid_community_1.Autowired('loggerFactory'),
        __metadata("design:type", ag_grid_community_1.LoggerFactory)
    ], RangeController.prototype, "loggerFactory", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], RangeController.prototype, "rowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], RangeController.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], RangeController.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('mouseEventService'),
        __metadata("design:type", ag_grid_community_1.MouseEventService)
    ], RangeController.prototype, "mouseEventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], RangeController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnApi'),
        __metadata("design:type", ag_grid_community_1.ColumnApi)
    ], RangeController.prototype, "columnApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_community_1.GridApi)
    ], RangeController.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_community_1.Autowired('cellNavigationService'),
        __metadata("design:type", ag_grid_community_1.CellNavigationService)
    ], RangeController.prototype, "cellNavigationService", void 0);
    __decorate([
        ag_grid_community_1.Autowired("pinnedRowModel"),
        __metadata("design:type", ag_grid_community_1.PinnedRowModel)
    ], RangeController.prototype, "pinnedRowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowPositionUtils'),
        __metadata("design:type", ag_grid_community_1.RowPositionUtils)
    ], RangeController.prototype, "rowPositionUtils", void 0);
    __decorate([
        ag_grid_community_1.Autowired('cellPositionUtils'),
        __metadata("design:type", ag_grid_community_1.CellPositionUtils)
    ], RangeController.prototype, "cellPositionUtils", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], RangeController.prototype, "init", null);
    RangeController = __decorate([
        ag_grid_community_1.Bean('rangeController')
    ], RangeController);
    return RangeController;
}());
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
        skipVerticalScroll = skipVerticalScroll || this.gridOptionsWrapper.getDomLayout() !== ag_grid_community_1.Constants.DOM_LAYOUT_NORMAL;
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
