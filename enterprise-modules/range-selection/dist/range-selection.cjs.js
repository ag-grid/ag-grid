/**
          * @ag-grid-enterprise/range-selection - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v28.1.1
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');

var __extends$4 = (undefined && undefined.__extends) || (function () {
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
var __assign$2 = (undefined && undefined.__assign) || function () {
    __assign$2 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$2.apply(this, arguments);
};
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read$1 = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread$1 = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$1(arguments[i]));
    return ar;
};
var __values = (undefined && undefined.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var RangeService = /** @class */ (function (_super) {
    __extends$4(RangeService, _super);
    function RangeService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cellRanges = [];
        _this.bodyScrollListener = _this.onBodyScroll.bind(_this);
        _this.dragging = false;
        _this.intersectionRange = false; // When dragging ends, the current range will be used to intersect all other ranges
        return _this;
    }
    RangeService.prototype.init = function () {
        var _this = this;
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, function () { return _this.onColumnsChanged(); });
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_VISIBLE, this.onColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, function () { return _this.removeAllCellRanges(); });
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.removeAllCellRanges(); });
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PIVOT_CHANGED, function () { return _this.removeAllCellRanges(); });
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_GROUP_OPENED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_MOVED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_PINNED, this.refreshLastRangeStart.bind(this));
        this.ctrlsService.whenReady(function () {
            var gridBodyCtrl = _this.ctrlsService.getGridBodyCtrl();
            _this.autoScrollService = new core.AutoScrollService({
                scrollContainer: gridBodyCtrl.getBodyViewportElement(),
                scrollAxis: 'xy',
                getVerticalPosition: function () { return gridBodyCtrl.getScrollFeature().getVScrollPosition().top; },
                setVerticalPosition: function (position) { return gridBodyCtrl.getScrollFeature().setVerticalScrollPosition(position); },
                getHorizontalPosition: function () { return gridBodyCtrl.getScrollFeature().getHScrollPosition().left; },
                setHorizontalPosition: function (position) { return gridBodyCtrl.getScrollFeature().setHorizontalScrollPosition(position); },
                shouldSkipVerticalScroll: function () { return _this.gridOptionsWrapper.getDomLayout() !== core.Constants.DOM_LAYOUT_NORMAL; },
                shouldSkipHorizontalScroll: function () { return gridBodyCtrl.getScrollFeature().isHorizontalScrollShowing(); }
            });
        });
    };
    // Called for both columns loaded & column visibility events
    RangeService.prototype.onColumnsChanged = function () {
        var _this = this;
        // first move start column in last cell range (i.e. series chart range)
        this.refreshLastRangeStart();
        var allColumns = this.columnModel.getAllDisplayedColumns();
        // check that the columns in each range still exist and are visible
        this.cellRanges.forEach(function (cellRange) {
            var beforeCols = cellRange.columns;
            // remove hidden or removed cols from cell range
            cellRange.columns = cellRange.columns.filter(function (col) { return col.isVisible() && allColumns.indexOf(col) !== -1; });
            var colsInRangeChanged = !core._.areEqual(beforeCols, cellRange.columns);
            if (colsInRangeChanged) {
                // notify users and other parts of grid (i.e. status panel) that range has changed
                _this.dispatchChangedEvent(false, true, cellRange.id);
            }
        });
        // Remove empty cell ranges
        var countBefore = this.cellRanges.length;
        this.cellRanges = this.cellRanges.filter(function (range) { return range.columns.length > 0; });
        if (countBefore > this.cellRanges.length) {
            this.dispatchChangedEvent(false, true);
        }
    };
    RangeService.prototype.refreshLastRangeStart = function () {
        var lastRange = core._.last(this.cellRanges);
        if (!lastRange) {
            return;
        }
        this.refreshRangeStart(lastRange);
    };
    RangeService.prototype.isContiguousRange = function (cellRange) {
        var rangeColumns = cellRange.columns;
        if (!rangeColumns.length) {
            return false;
        }
        var allColumns = this.columnModel.getAllDisplayedColumns();
        var allPositions = rangeColumns.map(function (c) { return allColumns.indexOf(c); }).sort(function (a, b) { return a - b; });
        return core._.last(allPositions) - allPositions[0] + 1 === rangeColumns.length;
    };
    RangeService.prototype.getRangeStartRow = function (cellRange) {
        if (cellRange.startRow && cellRange.endRow) {
            return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ?
                cellRange.startRow : cellRange.endRow;
        }
        var rowPinned = this.pinnedRowModel.getPinnedTopRowCount() > 0 ? core.Constants.PINNED_TOP : null;
        return { rowIndex: 0, rowPinned: rowPinned };
    };
    RangeService.prototype.getRangeEndRow = function (cellRange) {
        if (cellRange.startRow && cellRange.endRow) {
            return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ?
                cellRange.endRow : cellRange.startRow;
        }
        var pinnedBottomRowCount = this.pinnedRowModel.getPinnedBottomRowCount();
        var pinnedBottom = pinnedBottomRowCount > 0;
        if (pinnedBottom) {
            return {
                rowIndex: pinnedBottomRowCount - 1,
                rowPinned: core.Constants.PINNED_BOTTOM
            };
        }
        return {
            rowIndex: this.rowModel.getRowCount() - 1,
            rowPinned: null
        };
    };
    RangeService.prototype.setRangeToCell = function (cell, appendRange) {
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
        if (suppressMultiRangeSelections || !appendRange || core._.missing(this.cellRanges)) {
            this.removeAllCellRanges(true);
        }
        var rowForCell = {
            rowIndex: cell.rowIndex,
            rowPinned: cell.rowPinned
        };
        var cellRange = {
            startRow: rowForCell,
            endRow: rowForCell,
            columns: columns,
            startColumn: cell.column
        };
        this.cellRanges.push(cellRange);
        this.setNewestRangeStartCell(cell);
        this.onDragStop();
        this.dispatchChangedEvent(true, true);
    };
    RangeService.prototype.extendLatestRangeToCell = function (cellPosition) {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }
        var cellRange = core._.last(this.cellRanges);
        this.updateRangeEnd(cellRange, cellPosition);
    };
    RangeService.prototype.updateRangeEnd = function (cellRange, cellPosition, silent) {
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
    RangeService.prototype.refreshRangeStart = function (cellRange) {
        var startColumn = cellRange.startColumn, columns = cellRange.columns;
        var moveColInCellRange = function (colToMove, moveToFront) {
            var otherCols = cellRange.columns.filter(function (col) { return col !== colToMove; });
            if (colToMove) {
                cellRange.startColumn = colToMove;
                cellRange.columns = moveToFront ? __spread$1([colToMove], otherCols) : __spread$1(otherCols, [colToMove]);
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
        var shouldMoveRightCol = startColumn === core._.last(columns) && startColumn === right;
        if (shouldMoveRightCol) {
            moveColInCellRange(right, false);
            return;
        }
    };
    RangeService.prototype.getRangeEdgeColumns = function (cellRange) {
        var allColumns = this.columnModel.getAllDisplayedColumns();
        var allIndices = cellRange.columns
            .map(function (c) { return allColumns.indexOf(c); })
            .filter(function (i) { return i > -1; })
            .sort(function (a, b) { return a - b; });
        return {
            left: allColumns[allIndices[0]],
            right: allColumns[core._.last(allIndices)]
        };
    };
    // returns true if successful, false if not successful
    RangeService.prototype.extendLatestRangeInDirection = function (event) {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }
        var key = event.key;
        var ctrlKey = event.ctrlKey || event.metaKey;
        var lastRange = core._.last(this.cellRanges);
        var startCell = this.newestRangeStartCell;
        var firstCol = lastRange.columns[0];
        var lastCol = core._.last(lastRange.columns);
        // find the cell that is at the furthest away corner from the starting cell
        var endCellIndex = lastRange.endRow.rowIndex;
        var endCellFloating = lastRange.endRow.rowPinned;
        var endCellColumn = startCell.column === firstCol ? lastCol : firstCol;
        var endCell = { column: endCellColumn, rowIndex: endCellIndex, rowPinned: endCellFloating };
        var newEndCell = this.cellNavigationService.getNextCellToFocus(key, endCell, ctrlKey);
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
    RangeService.prototype.setCellRange = function (params) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        this.removeAllCellRanges(true);
        this.addCellRange(params);
    };
    RangeService.prototype.setCellRanges = function (cellRanges) {
        var _this = this;
        if (core._.shallowCompare(this.cellRanges, cellRanges)) {
            return;
        }
        this.removeAllCellRanges(true);
        cellRanges.forEach(function (newRange) {
            if (newRange.columns && newRange.startRow) {
                _this.setNewestRangeStartCell({
                    rowIndex: newRange.startRow.rowIndex,
                    rowPinned: newRange.startRow.rowPinned,
                    column: newRange.columns[0]
                });
            }
            _this.cellRanges.push(newRange);
        });
        this.dispatchChangedEvent(false, true);
    };
    RangeService.prototype.setNewestRangeStartCell = function (position) {
        this.newestRangeStartCell = position;
    };
    RangeService.prototype.createCellRangeFromCellRangeParams = function (params) {
        var _this = this;
        var columns;
        var startsOnTheRight = false;
        if (params.columns) {
            columns = params.columns.map(function (c) { return _this.columnModel.getColumnWithValidation(c); }).filter(function (c) { return c; });
        }
        else {
            var columnStart = this.columnModel.getColumnWithValidation(params.columnStart);
            var columnEnd = this.columnModel.getColumnWithValidation(params.columnEnd);
            if (!columnStart || !columnEnd) {
                return;
            }
            columns = this.calculateColumnsBetween(columnStart, columnEnd);
            if (columns && columns.length) {
                startsOnTheRight = columns[0] !== columnStart;
            }
        }
        if (!columns) {
            return;
        }
        var startRow = params.rowStartIndex != null ? {
            rowIndex: params.rowStartIndex,
            rowPinned: params.rowStartPinned || null
        } : undefined;
        var endRow = params.rowEndIndex != null ? {
            rowIndex: params.rowEndIndex,
            rowPinned: params.rowEndPinned || null
        } : undefined;
        return {
            startRow: startRow,
            endRow: endRow,
            columns: columns,
            startColumn: startsOnTheRight ? core._.last(columns) : columns[0]
        };
    };
    RangeService.prototype.addCellRange = function (params) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        var newRange = this.createCellRangeFromCellRangeParams(params);
        if (newRange) {
            if (newRange.startRow) {
                this.setNewestRangeStartCell({
                    rowIndex: newRange.startRow.rowIndex,
                    rowPinned: newRange.startRow.rowPinned,
                    column: newRange.startColumn
                });
            }
            this.cellRanges.push(newRange);
            this.dispatchChangedEvent(false, true, newRange.id);
        }
    };
    RangeService.prototype.getCellRanges = function () {
        return this.cellRanges;
    };
    RangeService.prototype.isEmpty = function () {
        return this.cellRanges.length === 0;
    };
    RangeService.prototype.isMoreThanOneCell = function () {
        var len = this.cellRanges.length;
        if (len === 0) {
            return false;
        }
        if (len > 1) {
            return true; // Assumes a cell range must contain at least one cell
        }
        // only one range, return true if range has more than one
        var range = this.cellRanges[0];
        var startRow = this.getRangeStartRow(range);
        var endRow = this.getRangeEndRow(range);
        return startRow.rowPinned !== endRow.rowPinned ||
            startRow.rowIndex !== endRow.rowIndex ||
            range.columns.length !== 1;
    };
    RangeService.prototype.areAllRangesAbleToMerge = function () {
        var e_1, _a;
        var _this = this;
        var rowToColumnMap = new Map();
        var len = this.cellRanges.length;
        if (len <= 1)
            return true;
        this.cellRanges.forEach(function (range) {
            var topRow = _this.getRangeStartRow(range);
            var bottomRow = _this.getRangeEndRow(range);
            var currentRow = topRow;
            var _loop_1 = function () {
                var rowName = (currentRow.rowPinned || 'normal') + "_" + currentRow.rowIndex;
                var columns = rowToColumnMap.get(rowName);
                var currentRangeColIds = range.columns.map(function (col) { return col.getId(); });
                if (columns) {
                    var filteredColumns = currentRangeColIds.filter(function (col) { return columns.indexOf(col) === -1; });
                    columns.push.apply(columns, __spread$1(filteredColumns));
                }
                else {
                    rowToColumnMap.set(rowName, currentRangeColIds);
                }
                if (_this.rowPositionUtils.sameRow(currentRow, bottomRow)) {
                    return "break";
                }
                currentRow = _this.cellNavigationService.getRowBelow(currentRow);
            };
            while (currentRow) {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
        });
        var columnsString;
        try {
            for (var _b = __values(rowToColumnMap.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var val = _c.value;
                var currentValString = val.sort().join();
                if (columnsString === undefined) {
                    columnsString = currentValString;
                    continue;
                }
                if (columnsString !== currentValString) {
                    return false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    RangeService.prototype.removeAllCellRanges = function (silent) {
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
    RangeService.prototype.onBodyScroll = function () {
        if (this.dragging && this.lastMouseEvent) {
            this.onDragging(this.lastMouseEvent);
        }
    };
    RangeService.prototype.isCellInAnyRange = function (cell) {
        return this.getCellRangeCount(cell) > 0;
    };
    RangeService.prototype.isCellInSpecificRange = function (cell, range) {
        var columnInRange = range.columns !== null && core._.includes(range.columns, cell.column);
        var rowInRange = this.isRowInRange(cell.rowIndex, cell.rowPinned, range);
        return columnInRange && rowInRange;
    };
    RangeService.prototype.isLastCellOfRange = function (cellRange, cell) {
        var startRow = cellRange.startRow, endRow = cellRange.endRow;
        var lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
        var isLastRow = cell.rowIndex === lastRow.rowIndex && cell.rowPinned === lastRow.rowPinned;
        var rangeFirstIndexColumn = cellRange.columns[0];
        var rangeLastIndexColumn = core._.last(cellRange.columns);
        var lastRangeColumn = cellRange.startColumn === rangeFirstIndexColumn ? rangeLastIndexColumn : rangeFirstIndexColumn;
        var isLastColumn = cell.column === lastRangeColumn;
        return isLastColumn && isLastRow;
    };
    RangeService.prototype.isBottomRightCell = function (cellRange, cell) {
        var allColumns = this.columnModel.getAllDisplayedColumns();
        var allPositions = cellRange.columns.map(function (c) { return allColumns.indexOf(c); }).sort(function (a, b) { return a - b; });
        var startRow = cellRange.startRow, endRow = cellRange.endRow;
        var lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
        var isRightColumn = allColumns.indexOf(cell.column) === core._.last(allPositions);
        var isLastRow = cell.rowIndex === lastRow.rowIndex && core._.makeNull(cell.rowPinned) === core._.makeNull(lastRow.rowPinned);
        return isRightColumn && isLastRow;
    };
    // returns the number of ranges this cell is in
    RangeService.prototype.getCellRangeCount = function (cell) {
        var _this = this;
        if (this.isEmpty()) {
            return 0;
        }
        return this.cellRanges.filter(function (cellRange) { return _this.isCellInSpecificRange(cell, cellRange); }).length;
    };
    RangeService.prototype.isRowInRange = function (rowIndex, floating, cellRange) {
        var firstRow = this.getRangeStartRow(cellRange);
        var lastRow = this.getRangeEndRow(cellRange);
        var thisRow = { rowIndex: rowIndex, rowPinned: floating || null };
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
    RangeService.prototype.getDraggingRange = function () {
        return this.draggingRange;
    };
    RangeService.prototype.onDragStart = function (mouseEvent) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        var ctrlKey = mouseEvent.ctrlKey, metaKey = mouseEvent.metaKey, shiftKey = mouseEvent.shiftKey;
        // ctrlKey for windows, metaKey for Apple
        var multiKeyPressed = ctrlKey || metaKey;
        var allowMulti = !this.gridOptionsWrapper.isSuppressMultiRangeSelection();
        var multiSelectKeyPressed = allowMulti ? multiKeyPressed : false;
        var extendRange = shiftKey && core._.existsAndNotEmpty(this.cellRanges);
        if (!multiSelectKeyPressed && (!extendRange || core._.exists(core._.last(this.cellRanges).type))) {
            this.removeAllCellRanges(true);
        }
        // The DragService used by this service (RangeService), automatically adds a `mousemove`
        // listener the document of the page that will then call `onDragging`. If you are in a shadow DOM
        // DOM elements outside your component's wrapper will be inaccessible to you, so here, we add a 
        // temporary `mousemove` listener to the gridPanel to be able to update the last hovered cell.
        this.cellHoverListener = this.addManagedListener(this.ctrlsService.getGridCtrl().getGui(), 'mousemove', this.updateValuesOnMove.bind(this));
        // This is the mouse start event, so we need to call `updateValuesOnMove` 
        // manually once to get the necessary variables initiated.
        this.updateValuesOnMove(mouseEvent);
        if (!this.lastCellHovered) {
            return;
        }
        this.dragging = true;
        this.lastMouseEvent = mouseEvent;
        this.intersectionRange = multiSelectKeyPressed && this.getCellRangeCount(this.lastCellHovered) > 1;
        if (!extendRange) {
            this.setNewestRangeStartCell(this.lastCellHovered);
        }
        // if we didn't clear the ranges, then dragging means the user clicked, and when the
        // user clicks it means a range of one cell was created. we need to extend this range
        // rather than creating another range. otherwise we end up with two distinct ranges
        // from a drag operation (one from click, and one from drag).
        if (this.cellRanges.length > 0) {
            this.draggingRange = core._.last(this.cellRanges);
        }
        else {
            var mouseRowPosition = {
                rowIndex: this.lastCellHovered.rowIndex,
                rowPinned: this.lastCellHovered.rowPinned
            };
            this.draggingRange = {
                startRow: mouseRowPosition,
                endRow: mouseRowPosition,
                columns: [this.lastCellHovered.column],
                startColumn: this.newestRangeStartCell.column
            };
            this.cellRanges.push(this.draggingRange);
        }
        this.ctrlsService.getGridBodyCtrl().addScrollEventListener(this.bodyScrollListener);
        this.dispatchChangedEvent(true, false, this.draggingRange.id);
    };
    RangeService.prototype.intersectLastRange = function (fromMouseClick) {
        var _this = this;
        // when ranges are created due to a mouse click without drag (happens in cellMouseListener)
        // this method will be called with `fromMouseClick=true`.
        if (fromMouseClick && this.dragging) {
            return;
        }
        if (this.gridOptionsWrapper.isSuppressMultiRangeSelection()) {
            return;
        }
        if (this.isEmpty()) {
            return;
        }
        var lastRange = core._.last(this.cellRanges);
        var intersectionStartRow = this.getRangeStartRow(lastRange);
        var intersectionEndRow = this.getRangeEndRow(lastRange);
        var newRanges = [];
        this.cellRanges.slice(0, -1).forEach(function (range) {
            var startRow = _this.getRangeStartRow(range);
            var endRow = _this.getRangeEndRow(range);
            var cols = range.columns;
            var intersectCols = cols.filter(function (col) { return lastRange.columns.indexOf(col) === -1; });
            if (intersectCols.length === cols.length) {
                // No overlapping columns, retain previous range
                newRanges.push(range);
                return;
            }
            if (_this.rowPositionUtils.before(intersectionEndRow, startRow) || _this.rowPositionUtils.before(endRow, intersectionStartRow)) {
                // No overlapping rows, retain previous range
                newRanges.push(range);
                return;
            }
            var rangeCountBefore = newRanges.length;
            // Top
            if (_this.rowPositionUtils.before(startRow, intersectionStartRow)) {
                var top_1 = {
                    columns: __spread$1(cols),
                    startColumn: lastRange.startColumn,
                    startRow: __assign$2({}, startRow),
                    endRow: _this.cellNavigationService.getRowAbove(intersectionStartRow),
                };
                newRanges.push(top_1);
            }
            // Left & Right (not contiguous with columns)
            if (intersectCols.length > 0) {
                var middle = {
                    columns: intersectCols,
                    startColumn: core._.includes(intersectCols, lastRange.startColumn) ? lastRange.startColumn : intersectCols[0],
                    startRow: _this.rowPositionUtils.rowMax([__assign$2({}, intersectionStartRow), __assign$2({}, startRow)]),
                    endRow: _this.rowPositionUtils.rowMin([__assign$2({}, intersectionEndRow), __assign$2({}, endRow)]),
                };
                newRanges.push(middle);
            }
            // Bottom
            if (_this.rowPositionUtils.before(intersectionEndRow, endRow)) {
                newRanges.push({
                    columns: __spread$1(cols),
                    startColumn: lastRange.startColumn,
                    startRow: _this.cellNavigationService.getRowBelow(intersectionEndRow),
                    endRow: __assign$2({}, endRow),
                });
            }
            if ((newRanges.length - rangeCountBefore) === 1) {
                // Only one range result from the intersection.
                // Copy the source range's id, since essentially we just reduced it's size
                newRanges[newRanges.length - 1].id = range.id;
            }
        });
        this.cellRanges = newRanges;
        // when this is called because of a clickEvent and the ranges were changed
        // we need to force a dragEnd event to update the UI.
        if (fromMouseClick) {
            this.dispatchChangedEvent(false, true);
        }
    };
    RangeService.prototype.updateValuesOnMove = function (mouseEvent) {
        var cell = this.mouseEventService.getCellPositionForEvent(mouseEvent);
        this.cellHasChanged = false;
        if (!cell || (this.lastCellHovered && this.cellPositionUtils.equals(cell, this.lastCellHovered))) {
            return;
        }
        if (this.lastCellHovered) {
            this.cellHasChanged = true;
        }
        this.lastCellHovered = cell;
    };
    RangeService.prototype.onDragging = function (mouseEvent) {
        var _this = this;
        if (!this.dragging || !mouseEvent) {
            return;
        }
        this.lastMouseEvent = mouseEvent;
        var cellPosition = this.lastCellHovered;
        var isMouseAndStartInPinned = function (position) {
            return cellPosition && cellPosition.rowPinned === position && _this.newestRangeStartCell.rowPinned === position;
        };
        var skipVerticalScroll = isMouseAndStartInPinned('top') || isMouseAndStartInPinned('bottom');
        this.autoScrollService.check(mouseEvent, skipVerticalScroll);
        if (!this.cellHasChanged) {
            return;
        }
        var columns = this.calculateColumnsBetween(this.newestRangeStartCell.column, cellPosition.column);
        if (!columns) {
            return;
        }
        this.draggingRange.endRow = {
            rowIndex: cellPosition.rowIndex,
            rowPinned: cellPosition.rowPinned
        };
        this.draggingRange.columns = columns;
        this.dispatchChangedEvent(false, false, this.draggingRange.id);
    };
    RangeService.prototype.onDragStop = function () {
        if (this.cellHoverListener) {
            this.cellHoverListener();
            this.cellHoverListener = undefined;
        }
        if (!this.dragging) {
            return;
        }
        var id = this.draggingRange.id;
        this.autoScrollService.ensureCleared();
        this.ctrlsService.getGridBodyCtrl().removeScrollEventListener(this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
        this.draggingRange = undefined;
        this.lastCellHovered = undefined;
        if (this.intersectionRange) {
            this.intersectionRange = false;
            this.intersectLastRange();
        }
        this.dispatchChangedEvent(false, true, id);
    };
    RangeService.prototype.dispatchChangedEvent = function (started, finished, id) {
        var event = Object.freeze({
            type: core.Events.EVENT_RANGE_SELECTION_CHANGED,
            started: started,
            finished: finished,
            id: id,
        });
        this.eventService.dispatchEvent(event);
    };
    RangeService.prototype.calculateColumnsBetween = function (columnFrom, columnTo) {
        var allColumns = this.columnModel.getAllDisplayedColumns();
        var isSameColumn = columnFrom === columnTo;
        var fromIndex = allColumns.indexOf(columnFrom);
        if (fromIndex < 0) {
            console.warn("AG Grid: column " + columnFrom.getId() + " is not visible");
            return;
        }
        var toIndex = isSameColumn ? fromIndex : allColumns.indexOf(columnTo);
        if (toIndex < 0) {
            console.warn("AG Grid: column " + columnTo.getId() + " is not visible");
            return;
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
    __decorate$3([
        core.Autowired('rowModel')
    ], RangeService.prototype, "rowModel", void 0);
    __decorate$3([
        core.Autowired('columnModel')
    ], RangeService.prototype, "columnModel", void 0);
    __decorate$3([
        core.Autowired('mouseEventService')
    ], RangeService.prototype, "mouseEventService", void 0);
    __decorate$3([
        core.Autowired('cellNavigationService')
    ], RangeService.prototype, "cellNavigationService", void 0);
    __decorate$3([
        core.Autowired("pinnedRowModel")
    ], RangeService.prototype, "pinnedRowModel", void 0);
    __decorate$3([
        core.Autowired('rowPositionUtils')
    ], RangeService.prototype, "rowPositionUtils", void 0);
    __decorate$3([
        core.Autowired('cellPositionUtils')
    ], RangeService.prototype, "cellPositionUtils", void 0);
    __decorate$3([
        core.Autowired('ctrlsService')
    ], RangeService.prototype, "ctrlsService", void 0);
    __decorate$3([
        core.PostConstruct
    ], RangeService.prototype, "init", null);
    RangeService = __decorate$3([
        core.Bean('rangeService')
    ], RangeService);
    return RangeService;
}(core.BeanStub));

var __extends$3 = (undefined && undefined.__extends) || (function () {
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
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AbstractSelectionHandle = /** @class */ (function (_super) {
    __extends$3(AbstractSelectionHandle, _super);
    function AbstractSelectionHandle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.changedCalculatedValues = false;
        _this.dragging = false;
        _this.shouldDestroyOnEndDragging = false;
        return _this;
    }
    AbstractSelectionHandle.prototype.init = function () {
        var _this = this;
        this.dragService.addDragSource({
            dragStartPixels: 0,
            eElement: this.getGui(),
            onDragStart: this.onDragStart.bind(this),
            onDragging: function (e) {
                _this.dragging = true;
                _this.rangeService.autoScrollService.check(e);
                if (_this.changedCalculatedValues) {
                    _this.onDrag(e);
                    _this.changedCalculatedValues = false;
                }
            },
            onDragStop: function (e) {
                _this.dragging = false;
                _this.onDragEnd(e);
                _this.clearValues();
                _this.rangeService.autoScrollService.ensureCleared();
                // TODO: this causes a bug where if there are multiple grids in the same page, all of them will
                // be affected by a drag on any. Move it to the root element.
                document.body.classList.remove(_this.getDraggingCssClass());
                if (_this.shouldDestroyOnEndDragging) {
                    _this.destroy();
                }
            }
        });
        this.addManagedListener(this.getGui(), 'mousedown', this.preventRangeExtension.bind(this));
    };
    AbstractSelectionHandle.prototype.isDragging = function () {
        return this.dragging;
    };
    AbstractSelectionHandle.prototype.getCellCtrl = function () {
        return this.cellCtrl;
    };
    AbstractSelectionHandle.prototype.setCellCtrl = function (cellComp) {
        this.cellCtrl = cellComp;
    };
    AbstractSelectionHandle.prototype.getCellRange = function () {
        return this.cellRange;
    };
    AbstractSelectionHandle.prototype.setCellRange = function (range) {
        this.cellRange = range;
    };
    AbstractSelectionHandle.prototype.getRangeStartRow = function () {
        return this.rangeStartRow;
    };
    AbstractSelectionHandle.prototype.setRangeStartRow = function (row) {
        this.rangeStartRow = row;
    };
    AbstractSelectionHandle.prototype.getRangeEndRow = function () {
        return this.rangeEndRow;
    };
    AbstractSelectionHandle.prototype.setRangeEndRow = function (row) {
        this.rangeEndRow = row;
    };
    AbstractSelectionHandle.prototype.getLastCellHovered = function () {
        return this.lastCellHovered;
    };
    AbstractSelectionHandle.prototype.preventRangeExtension = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };
    AbstractSelectionHandle.prototype.onDragStart = function (e) {
        this.cellHoverListener = this.addManagedListener(this.ctrlsService.getGridCtrl().getGui(), 'mousemove', this.updateValuesOnMove.bind(this));
        document.body.classList.add(this.getDraggingCssClass());
    };
    AbstractSelectionHandle.prototype.getDraggingCssClass = function () {
        return "ag-dragging-" + (this.type === core.SelectionHandleType.FILL ? 'fill' : 'range') + "-handle";
    };
    AbstractSelectionHandle.prototype.updateValuesOnMove = function (e) {
        var cell = this.mouseEventService.getCellPositionForEvent(e);
        if (!cell || (this.lastCellHovered && this.cellPositionUtils.equals(cell, this.lastCellHovered))) {
            return;
        }
        this.lastCellHovered = cell;
        this.changedCalculatedValues = true;
    };
    AbstractSelectionHandle.prototype.getType = function () {
        return this.type;
    };
    AbstractSelectionHandle.prototype.refresh = function (cellCtrl) {
        var oldCellComp = this.getCellCtrl();
        var eGui = this.getGui();
        var cellRange = core._.last(this.rangeService.getCellRanges());
        var start = cellRange.startRow;
        var end = cellRange.endRow;
        if (start && end) {
            var isBefore = this.rowPositionUtils.before(end, start);
            if (isBefore) {
                this.setRangeStartRow(end);
                this.setRangeEndRow(start);
            }
            else {
                this.setRangeStartRow(start);
                this.setRangeEndRow(end);
            }
        }
        if (oldCellComp !== cellCtrl || !core._.isVisible(eGui)) {
            this.setCellCtrl(cellCtrl);
            var eParentOfValue = cellCtrl.getComp().getParentOfValue();
            if (eParentOfValue) {
                eParentOfValue.appendChild(eGui);
            }
        }
        this.setCellRange(cellRange);
    };
    AbstractSelectionHandle.prototype.clearValues = function () {
        this.lastCellHovered = undefined;
        this.removeListeners();
    };
    AbstractSelectionHandle.prototype.removeListeners = function () {
        if (this.cellHoverListener) {
            this.cellHoverListener();
            this.cellHoverListener = undefined;
        }
    };
    AbstractSelectionHandle.prototype.destroy = function () {
        if (!this.shouldDestroyOnEndDragging && this.isDragging()) {
            core._.setDisplayed(this.getGui(), false);
            this.shouldDestroyOnEndDragging = true;
            return;
        }
        this.shouldDestroyOnEndDragging = false;
        _super.prototype.destroy.call(this);
        this.removeListeners();
        var eGui = this.getGui();
        if (eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }
    };
    __decorate$2([
        core.Autowired("rowRenderer")
    ], AbstractSelectionHandle.prototype, "rowRenderer", void 0);
    __decorate$2([
        core.Autowired("dragService")
    ], AbstractSelectionHandle.prototype, "dragService", void 0);
    __decorate$2([
        core.Autowired("rangeService")
    ], AbstractSelectionHandle.prototype, "rangeService", void 0);
    __decorate$2([
        core.Autowired("mouseEventService")
    ], AbstractSelectionHandle.prototype, "mouseEventService", void 0);
    __decorate$2([
        core.Autowired("columnModel")
    ], AbstractSelectionHandle.prototype, "columnModel", void 0);
    __decorate$2([
        core.Autowired("cellNavigationService")
    ], AbstractSelectionHandle.prototype, "cellNavigationService", void 0);
    __decorate$2([
        core.Autowired("navigationService")
    ], AbstractSelectionHandle.prototype, "navigationService", void 0);
    __decorate$2([
        core.Autowired('rowPositionUtils')
    ], AbstractSelectionHandle.prototype, "rowPositionUtils", void 0);
    __decorate$2([
        core.Autowired('cellPositionUtils')
    ], AbstractSelectionHandle.prototype, "cellPositionUtils", void 0);
    __decorate$2([
        core.Autowired('ctrlsService')
    ], AbstractSelectionHandle.prototype, "ctrlsService", void 0);
    __decorate$2([
        core.PostConstruct
    ], AbstractSelectionHandle.prototype, "init", null);
    return AbstractSelectionHandle;
}(core.Component));

var __extends$2 = (undefined && undefined.__extends) || (function () {
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
var __assign$1 = (undefined && undefined.__assign) || function () {
    __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var FillHandle = /** @class */ (function (_super) {
    __extends$2(FillHandle, _super);
    function FillHandle() {
        var _this = _super.call(this, FillHandle.TEMPLATE) || this;
        _this.markedCells = [];
        _this.cellValues = [];
        _this.isUp = false;
        _this.isLeft = false;
        _this.isReduce = false;
        _this.type = core.SelectionHandleType.FILL;
        return _this;
    }
    FillHandle.prototype.updateValuesOnMove = function (e) {
        _super.prototype.updateValuesOnMove.call(this, e);
        if (!this.initialXY) {
            this.initialXY = this.mouseEventService.getNormalisedPosition(e);
        }
        var _a = this.initialXY, x = _a.x, y = _a.y;
        var _b = this.mouseEventService.getNormalisedPosition(e), newX = _b.x, newY = _b.y;
        var diffX = Math.abs(x - newX);
        var diffY = Math.abs(y - newY);
        var allowedDirection = this.gridOptionsWrapper.getFillHandleDirection();
        var direction;
        if (allowedDirection === 'xy') {
            direction = diffX > diffY ? 'x' : 'y';
        }
        else {
            direction = allowedDirection;
        }
        if (direction !== this.dragAxis) {
            this.dragAxis = direction;
            this.changedCalculatedValues = true;
        }
    };
    FillHandle.prototype.onDrag = function (e) {
        if (!this.initialPosition) {
            var cellCtrl = this.getCellCtrl();
            if (!cellCtrl) {
                return;
            }
            this.initialPosition = cellCtrl.getCellPosition();
        }
        var lastCellHovered = this.getLastCellHovered();
        if (lastCellHovered) {
            this.markPathFrom(this.initialPosition, lastCellHovered);
        }
    };
    FillHandle.prototype.onDragEnd = function (e) {
        this.initialXY = null;
        if (!this.markedCells.length) {
            return;
        }
        var isX = this.dragAxis === 'x';
        var initialRange = this.getCellRange();
        var colLen = initialRange.columns.length;
        var rangeStartRow = this.getRangeStartRow();
        var rangeEndRow = this.getRangeEndRow();
        var finalRange;
        if (!this.isUp && !this.isLeft) {
            finalRange = this.rangeService.createCellRangeFromCellRangeParams({
                rowStartIndex: rangeStartRow.rowIndex,
                rowStartPinned: rangeStartRow.rowPinned,
                columnStart: initialRange.columns[0],
                rowEndIndex: isX ? rangeEndRow.rowIndex : this.lastCellMarked.rowIndex,
                rowEndPinned: isX ? rangeEndRow.rowPinned : this.lastCellMarked.rowPinned,
                columnEnd: isX ? this.lastCellMarked.column : initialRange.columns[colLen - 1]
            });
        }
        else {
            var startRow = isX ? rangeStartRow : this.lastCellMarked;
            finalRange = this.rangeService.createCellRangeFromCellRangeParams({
                rowStartIndex: startRow.rowIndex,
                rowStartPinned: startRow.rowPinned,
                columnStart: isX ? this.lastCellMarked.column : initialRange.columns[0],
                rowEndIndex: rangeEndRow.rowIndex,
                rowEndPinned: rangeEndRow.rowPinned,
                columnEnd: initialRange.columns[colLen - 1]
            });
        }
        if (finalRange) {
            // raising fill events for undo / redo
            this.raiseFillStartEvent();
            this.handleValueChanged(initialRange, finalRange, e);
            this.rangeService.setCellRanges([finalRange]);
            this.raiseFillEndEvent(initialRange, finalRange);
        }
    };
    FillHandle.prototype.raiseFillStartEvent = function () {
        var fillStartEvent = {
            type: core.Events.EVENT_FILL_START
        };
        this.eventService.dispatchEvent(fillStartEvent);
    };
    FillHandle.prototype.raiseFillEndEvent = function (initialRange, finalRange) {
        var fillEndEvent = {
            type: core.Events.EVENT_FILL_END,
            initialRange: initialRange,
            finalRange: finalRange
        };
        this.eventService.dispatchEvent(fillEndEvent);
    };
    FillHandle.prototype.handleValueChanged = function (initialRange, finalRange, e) {
        var _this = this;
        var initialRangeEndRow = this.rangeService.getRangeEndRow(initialRange);
        var initialRangeStartRow = this.rangeService.getRangeStartRow(initialRange);
        var finalRangeEndRow = this.rangeService.getRangeEndRow(finalRange);
        var finalRangeStartRow = this.rangeService.getRangeStartRow(finalRange);
        var isVertical = this.dragAxis === 'y';
        // if the range is being reduced in size, all we need to do is
        // clear the cells that are no longer part of the range
        if (this.isReduce && !this.gridOptionsWrapper.isSuppressClearOnFillReduction()) {
            var columns = isVertical
                ? initialRange.columns
                : initialRange.columns.filter(function (col) { return finalRange.columns.indexOf(col) < 0; });
            var startRow = isVertical ? this.cellNavigationService.getRowBelow(finalRangeEndRow) : finalRangeStartRow;
            if (startRow) {
                this.clearCellsInRange(startRow, initialRangeEndRow, columns);
            }
            return;
        }
        var withinInitialRange = true;
        var values = [];
        var initialValues = [];
        var idx = 0;
        var resetValues = function () {
            values.length = 0;
            initialValues.length = 0;
            idx = 0;
        };
        var iterateAcrossCells = function (column, columns) {
            var currentRow = _this.isUp ? initialRangeEndRow : initialRangeStartRow;
            var finished = false;
            if (isVertical) {
                withinInitialRange = true;
                resetValues();
            }
            var _loop_1 = function () {
                var rowNode = _this.rowPositionUtils.getRowNode(currentRow);
                if (!rowNode) {
                    return "break";
                }
                if (isVertical && column) {
                    fillValues(values, column, rowNode, function () {
                        return !_this.rowPositionUtils.sameRow(currentRow, _this.isUp ? initialRangeStartRow : initialRangeEndRow);
                    });
                }
                else if (columns) {
                    withinInitialRange = true;
                    resetValues();
                    columns.forEach(function (col) { return fillValues(values, col, rowNode, function () { return col !== (_this.isLeft ? initialRange.columns[0] : core._.last(initialRange.columns)); }); });
                }
                finished = _this.rowPositionUtils.sameRow(currentRow, _this.isUp ? finalRangeStartRow : finalRangeEndRow);
                currentRow = _this.isUp
                    ? _this.cellNavigationService.getRowAbove(currentRow)
                    : _this.cellNavigationService.getRowBelow(currentRow);
            };
            while (!finished && currentRow) {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
        };
        var fillValues = function (currentValues, col, rowNode, updateInitialSet) {
            var currentValue;
            var skipValue = false;
            if (withinInitialRange) {
                currentValue = _this.valueService.getValue(col, rowNode);
                initialValues.push(currentValue);
                withinInitialRange = updateInitialSet();
            }
            else {
                var _a = _this.processValues(e, currentValues, initialValues, col, rowNode, idx++), value = _a.value, fromUserFunction = _a.fromUserFunction;
                currentValue = value;
                if (col.isCellEditable(rowNode)) {
                    var cellValue = _this.valueService.getValue(col, rowNode);
                    if (!fromUserFunction || cellValue !== currentValue) {
                        rowNode.setDataValue(col, currentValue);
                    }
                    else {
                        skipValue = true;
                    }
                }
            }
            if (!skipValue) {
                currentValues.push(currentValue);
            }
        };
        if (isVertical) {
            initialRange.columns.forEach(function (col) {
                iterateAcrossCells(col);
            });
        }
        else {
            var columns = this.isLeft ? __spread(finalRange.columns).reverse() : finalRange.columns;
            iterateAcrossCells(undefined, columns);
        }
    };
    FillHandle.prototype.clearCellsInRange = function (startRow, endRow, columns) {
        var currentRow = startRow;
        var finished = false;
        var _loop_2 = function () {
            var rowNode = this_1.rowPositionUtils.getRowNode(currentRow);
            // should never happen, defensive programming
            if (!rowNode) {
                return "break";
            }
            columns.forEach(function (col) {
                if (col.isCellEditable(rowNode)) {
                    rowNode.setDataValue(col, null);
                }
            });
            finished = this_1.rowPositionUtils.sameRow(currentRow, endRow);
            currentRow = this_1.cellNavigationService.getRowBelow(currentRow);
        };
        var this_1 = this;
        while (!finished && currentRow) {
            var state_2 = _loop_2();
            if (state_2 === "break")
                break;
        }
    };
    FillHandle.prototype.processValues = function (event, values, initialValues, col, rowNode, idx) {
        var userFillOperation = this.gridOptionsWrapper.getFillOperation();
        var isVertical = this.dragAxis === 'y';
        var direction;
        if (isVertical) {
            direction = this.isUp ? 'up' : 'down';
        }
        else {
            direction = this.isLeft ? 'left' : 'right';
        }
        if (userFillOperation) {
            var params = {
                event: event,
                values: values,
                initialValues: initialValues,
                currentIndex: idx,
                currentCellValue: this.valueService.getValue(col, rowNode),
                direction: direction,
                column: col,
                rowNode: rowNode
            };
            var userResult = userFillOperation(params);
            if (userResult !== false) {
                return { value: userResult, fromUserFunction: true };
            }
        }
        var allNumbers = !values.some(function (val) {
            var asFloat = parseFloat(val);
            return isNaN(asFloat) || asFloat.toString() !== val.toString();
        });
        // values should be copied in order if the alt key is pressed
        // or if the values contain strings and numbers
        // However, if we only have one initial value selected, and that
        // value is a number and we are also pressing alt, then we should
        // increment or decrement the value by 1 based on direction.
        if (event.altKey || !allNumbers) {
            if (allNumbers && initialValues.length === 1) {
                var multiplier = (this.isUp || this.isLeft) ? -1 : 1;
                return { value: parseFloat(core._.last(values)) + 1 * multiplier, fromUserFunction: false };
            }
            return { value: values[idx % values.length], fromUserFunction: false };
        }
        return { value: core._.last(core._.findLineByLeastSquares(values.map(Number))), fromUserFunction: false };
    };
    FillHandle.prototype.clearValues = function () {
        this.clearMarkedPath();
        this.clearCellValues();
        this.lastCellMarked = undefined;
        _super.prototype.clearValues.call(this);
    };
    FillHandle.prototype.clearMarkedPath = function () {
        this.markedCells.forEach(function (cell) {
            if (!cell.isAlive()) {
                return;
            }
            var comp = cell.getComp();
            comp.addOrRemoveCssClass('ag-selection-fill-top', false);
            comp.addOrRemoveCssClass('ag-selection-fill-right', false);
            comp.addOrRemoveCssClass('ag-selection-fill-bottom', false);
            comp.addOrRemoveCssClass('ag-selection-fill-left', false);
        });
        this.markedCells.length = 0;
        this.isUp = false;
        this.isLeft = false;
        this.isReduce = false;
    };
    FillHandle.prototype.clearCellValues = function () {
        this.cellValues.length = 0;
    };
    FillHandle.prototype.markPathFrom = function (initialPosition, currentPosition) {
        this.clearMarkedPath();
        this.clearCellValues();
        if (this.dragAxis === 'y') {
            if (this.rowPositionUtils.sameRow(currentPosition, initialPosition)) {
                return;
            }
            var isBefore = this.rowPositionUtils.before(currentPosition, initialPosition);
            var rangeStartRow = this.getRangeStartRow();
            var rangeEndRow = this.getRangeEndRow();
            if (isBefore && ((currentPosition.rowPinned == rangeStartRow.rowPinned &&
                currentPosition.rowIndex >= rangeStartRow.rowIndex) ||
                (rangeStartRow.rowPinned != rangeEndRow.rowPinned &&
                    currentPosition.rowPinned == rangeEndRow.rowPinned &&
                    currentPosition.rowIndex <= rangeEndRow.rowIndex))) {
                this.reduceVertical(initialPosition, currentPosition);
                this.isReduce = true;
            }
            else {
                this.extendVertical(initialPosition, currentPosition, isBefore);
                this.isReduce = false;
            }
        }
        else {
            var initialColumn = initialPosition.column;
            var currentColumn = currentPosition.column;
            if (initialColumn === currentColumn) {
                return;
            }
            var displayedColumns = this.columnModel.getAllDisplayedColumns();
            var initialIndex = displayedColumns.indexOf(initialColumn);
            var currentIndex = displayedColumns.indexOf(currentColumn);
            if (currentIndex <= initialIndex && currentIndex >= displayedColumns.indexOf(this.getCellRange().columns[0])) {
                this.reduceHorizontal(initialPosition, currentPosition);
                this.isReduce = true;
            }
            else {
                this.extendHorizontal(initialPosition, currentPosition, currentIndex < initialIndex);
                this.isReduce = false;
            }
        }
        this.lastCellMarked = currentPosition;
    };
    FillHandle.prototype.extendVertical = function (initialPosition, endPosition, isMovingUp) {
        var _a = this, navigationService = _a.navigationService, rangeService = _a.rangeService;
        var row = initialPosition;
        do {
            var cellRange = this.getCellRange();
            var colLen = cellRange.columns.length;
            for (var i = 0; i < colLen; i++) {
                var column = cellRange.columns[i];
                var rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                var cellPos = __assign$1(__assign$1({}, rowPos), { column: column });
                var cellInRange = rangeService.isCellInSpecificRange(cellPos, cellRange);
                var isInitialRow = this.rowPositionUtils.sameRow(row, initialPosition);
                if (isMovingUp) {
                    this.isUp = true;
                }
                if (!isInitialRow) {
                    var cell = navigationService.getCellByPosition(cellPos);
                    if (cell) {
                        this.markedCells.push(cell);
                        var cellCtrl = cell.getComp();
                        if (!cellInRange) {
                            cellCtrl.addOrRemoveCssClass('ag-selection-fill-left', i === 0);
                            cellCtrl.addOrRemoveCssClass('ag-selection-fill-right', i === colLen - 1);
                        }
                        cellCtrl.addOrRemoveCssClass(isMovingUp ? 'ag-selection-fill-top' : 'ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, endPosition));
                    }
                }
            }
            if (this.rowPositionUtils.sameRow(row, endPosition)) {
                break;
            }
        } while (
        // tslint:disable-next-line
        row = isMovingUp
            ? this.cellNavigationService.getRowAbove(row)
            : this.cellNavigationService.getRowBelow(row));
    };
    FillHandle.prototype.reduceVertical = function (initialPosition, endPosition) {
        var row = initialPosition;
        do {
            var cellRange = this.getCellRange();
            var colLen = cellRange.columns.length;
            var isLastRow = this.rowPositionUtils.sameRow(row, endPosition);
            for (var i = 0; i < colLen; i++) {
                var rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                var celPos = __assign$1(__assign$1({}, rowPos), { column: cellRange.columns[i] });
                var cell = this.navigationService.getCellByPosition(celPos);
                if (cell) {
                    this.markedCells.push(cell);
                    var cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, endPosition));
                }
            }
            if (isLastRow) {
                break;
            }
            // tslint:disable-next-line
        } while (row = this.cellNavigationService.getRowAbove(row));
    };
    FillHandle.prototype.extendHorizontal = function (initialPosition, endPosition, isMovingLeft) {
        var _this = this;
        var allCols = this.columnModel.getAllDisplayedColumns();
        var startCol = allCols.indexOf(isMovingLeft ? endPosition.column : initialPosition.column);
        var endCol = allCols.indexOf(isMovingLeft ? this.getCellRange().columns[0] : endPosition.column);
        var offset = isMovingLeft ? 0 : 1;
        var colsToMark = allCols.slice(startCol + offset, endCol + offset);
        var rangeStartRow = this.getRangeStartRow();
        var rangeEndRow = this.getRangeEndRow();
        colsToMark.forEach(function (column) {
            var row = rangeStartRow;
            var isLastRow = false;
            do {
                isLastRow = _this.rowPositionUtils.sameRow(row, rangeEndRow);
                var cell = _this.navigationService.getCellByPosition({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cell) {
                    _this.markedCells.push(cell);
                    var cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-top', _this.rowPositionUtils.sameRow(row, rangeStartRow));
                    cellComp.addOrRemoveCssClass('ag-selection-fill-bottom', _this.rowPositionUtils.sameRow(row, rangeEndRow));
                    if (isMovingLeft) {
                        _this.isLeft = true;
                        cellComp.addOrRemoveCssClass('ag-selection-fill-left', column === colsToMark[0]);
                    }
                    else {
                        cellComp.addOrRemoveCssClass('ag-selection-fill-right', column === core._.last(colsToMark));
                    }
                }
                row = _this.cellNavigationService.getRowBelow(row);
            } while (!isLastRow);
        });
    };
    FillHandle.prototype.reduceHorizontal = function (initialPosition, endPosition) {
        var _this = this;
        var allCols = this.columnModel.getAllDisplayedColumns();
        var startCol = allCols.indexOf(endPosition.column);
        var endCol = allCols.indexOf(initialPosition.column);
        var colsToMark = allCols.slice(startCol, endCol);
        var rangeStartRow = this.getRangeStartRow();
        var rangeEndRow = this.getRangeEndRow();
        colsToMark.forEach(function (column) {
            var row = rangeStartRow;
            var isLastRow = false;
            do {
                isLastRow = _this.rowPositionUtils.sameRow(row, rangeEndRow);
                var cell = _this.navigationService.getCellByPosition({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cell) {
                    _this.markedCells.push(cell);
                    var cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-right', column === colsToMark[0]);
                }
                row = _this.cellNavigationService.getRowBelow(row);
            } while (!isLastRow);
        });
    };
    FillHandle.prototype.refresh = function (cellCtrl) {
        var cellRange = this.rangeService.getCellRanges()[0];
        var isColumnRange = !cellRange.startRow || !cellRange.endRow;
        if (isColumnRange) {
            this.destroy();
            return;
        }
        _super.prototype.refresh.call(this, cellCtrl);
    };
    FillHandle.TEMPLATE = "<div class=\"ag-fill-handle\"></div>";
    __decorate$1([
        core.Autowired('valueService')
    ], FillHandle.prototype, "valueService", void 0);
    return FillHandle;
}(AbstractSelectionHandle));

var __extends$1 = (undefined && undefined.__extends) || (function () {
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
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var RangeHandle = /** @class */ (function (_super) {
    __extends$1(RangeHandle, _super);
    function RangeHandle() {
        var _this = _super.call(this, RangeHandle.TEMPLATE) || this;
        _this.type = core.SelectionHandleType.RANGE;
        _this.rangeFixed = false;
        return _this;
    }
    RangeHandle.prototype.onDrag = function (e) {
        var lastCellHovered = this.getLastCellHovered();
        if (!lastCellHovered) {
            return;
        }
        var cellRanges = this.rangeService.getCellRanges();
        var lastRange = core._.last(cellRanges);
        if (!this.rangeFixed) {
            this.fixRangeStartEnd(lastRange);
            this.rangeFixed = true;
        }
        this.endPosition = {
            rowIndex: lastCellHovered.rowIndex,
            rowPinned: lastCellHovered.rowPinned,
            column: lastCellHovered.column
        };
        // check if the cell ranges are for a chart
        if (cellRanges.length === 2 && cellRanges[0].type === core.CellRangeType.DIMENSION && lastRange.type === core.CellRangeType.VALUE) {
            var rowChanged = !this.rowPositionUtils.sameRow(this.endPosition, this.rangeService.getRangeEndRow(lastRange));
            if (rowChanged) {
                // ensure the dimension range is kept in sync with the value range (which has the handle)
                this.rangeService.updateRangeEnd(cellRanges[0], __assign(__assign({}, this.endPosition), { column: cellRanges[0].columns[0] }), true);
            }
        }
        this.rangeService.extendLatestRangeToCell(this.endPosition);
    };
    RangeHandle.prototype.onDragEnd = function (e) {
        var cellRange = core._.last(this.rangeService.getCellRanges());
        this.fixRangeStartEnd(cellRange);
        this.rangeFixed = false;
    };
    RangeHandle.prototype.fixRangeStartEnd = function (cellRange) {
        var startRow = this.rangeService.getRangeStartRow(cellRange);
        var endRow = this.rangeService.getRangeEndRow(cellRange);
        var column = cellRange.columns[0];
        cellRange.startRow = startRow;
        cellRange.endRow = endRow;
        cellRange.startColumn = column;
    };
    RangeHandle.TEMPLATE = "<div class=\"ag-range-handle\"></div>";
    return RangeHandle;
}(AbstractSelectionHandle));

var __extends = (undefined && undefined.__extends) || (function () {
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
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SelectionHandleFactory = /** @class */ (function (_super) {
    __extends(SelectionHandleFactory, _super);
    function SelectionHandleFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectionHandleFactory.prototype.createSelectionHandle = function (type) {
        return this.createBean(type === core.SelectionHandleType.RANGE ? new RangeHandle() : new FillHandle());
    };
    SelectionHandleFactory = __decorate([
        core.Bean('selectionHandleFactory')
    ], SelectionHandleFactory);
    return SelectionHandleFactory;
}(core.BeanStub));

var RangeSelectionModule = {
    moduleName: core.ModuleNames.RangeSelectionModule,
    beans: [RangeService, SelectionHandleFactory],
    agStackComponents: [
        { componentName: 'AgFillHandle', componentClass: FillHandle },
        { componentName: 'AgRangeHandle', componentClass: RangeHandle }
    ],
    dependantModules: [
        core$1.EnterpriseCoreModule
    ]
};

exports.RangeSelectionModule = RangeSelectionModule;
