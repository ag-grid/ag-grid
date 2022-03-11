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
var __read = (this && this.__read) || function (o, n) {
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function(o) {
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
import { Autowired, Bean, Constants, Events, PostConstruct, BeanStub, AutoScrollService, _ } from "@ag-grid-community/core";
var RangeService = /** @class */ (function (_super) {
    __extends(RangeService, _super);
    function RangeService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cellRanges = [];
        _this.bodyScrollListener = _this.onBodyScroll.bind(_this);
        _this.dragging = false;
        return _this;
    }
    RangeService.prototype.init = function () {
        var _this = this;
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, function () { return _this.removeAllCellRanges(); });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, function () { return _this.removeAllCellRanges(); });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, function () { return _this.removeAllCellRanges(); });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, function () { return _this.removeAllCellRanges(); });
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.onColumnVisibleChange.bind(this));
        this.ctrlsService.whenReady(function () {
            var gridBodyCon = _this.ctrlsService.getGridBodyCtrl();
            _this.autoScrollService = new AutoScrollService({
                scrollContainer: gridBodyCon.getBodyViewportElement(),
                scrollAxis: 'xy',
                getVerticalPosition: function () { return gridBodyCon.getScrollFeature().getVScrollPosition().top; },
                setVerticalPosition: function (position) { return gridBodyCon.getScrollFeature().setVerticalScrollPosition(position); },
                getHorizontalPosition: function () { return gridBodyCon.getScrollFeature().getHScrollPosition().left; },
                setHorizontalPosition: function (position) { return gridBodyCon.getScrollFeature().setHorizontalScrollPosition(position); },
                shouldSkipVerticalScroll: function () { return _this.gridOptionsWrapper.getDomLayout() !== Constants.DOM_LAYOUT_NORMAL; },
                shouldSkipHorizontalScroll: function () { return gridBodyCon.getScrollFeature().isHorizontalScrollShowing(); }
            });
        });
    };
    RangeService.prototype.onColumnVisibleChange = function () {
        var _this = this;
        // first move start column in last cell range (i.e. series chart range)
        this.refreshLastRangeStart();
        // then check if the column visibility has changed in any cell range
        this.cellRanges.forEach(function (cellRange) {
            var beforeCols = cellRange.columns;
            // remove hidden cols from cell range
            cellRange.columns = cellRange.columns.filter(function (col) { return col.isVisible(); });
            var colsInRangeChanged = !_.areEqual(beforeCols, cellRange.columns);
            if (colsInRangeChanged) {
                // notify users and other parts of grid (i.e. status panel) that range has changed
                _this.dispatchChangedEvent(false, true, cellRange.id);
            }
        });
    };
    RangeService.prototype.refreshLastRangeStart = function () {
        var lastRange = _.last(this.cellRanges);
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
        return _.last(allPositions) - allPositions[0] + 1 === rangeColumns.length;
    };
    RangeService.prototype.getRangeStartRow = function (cellRange) {
        if (cellRange.startRow && cellRange.endRow) {
            return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ?
                cellRange.startRow : cellRange.endRow;
        }
        var rowPinned = this.pinnedRowModel.getPinnedTopRowCount() > 0 ? Constants.PINNED_TOP : null;
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
                rowPinned: Constants.PINNED_BOTTOM
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
        if (suppressMultiRangeSelections || !appendRange || _.missing(this.cellRanges)) {
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
            if (_.last(this.cellRanges) !== cellRange) {
                _.removeFromArray(this.cellRanges, cellRange);
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
    RangeService.prototype.extendLatestRangeToCell = function (cellPosition) {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }
        var cellRange = _.last(this.cellRanges);
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
                cellRange.columns = moveToFront ? __spread([colToMove], otherCols) : __spread(otherCols, [colToMove]);
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
        var shouldMoveRightCol = startColumn === _.last(columns) && startColumn === right;
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
            right: allColumns[_.last(allIndices)]
        };
    };
    // returns true if successful, false if not successful
    RangeService.prototype.extendLatestRangeInDirection = function (key) {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }
        var lastRange = _.last(this.cellRanges);
        var startCell = this.newestRangeStartCell;
        var firstCol = lastRange.columns[0];
        var lastCol = _.last(lastRange.columns);
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
    RangeService.prototype.setCellRange = function (params) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        this.removeAllCellRanges(true);
        this.addCellRange(params);
    };
    RangeService.prototype.setCellRanges = function (cellRanges) {
        var _this = this;
        if (_.shallowCompare(this.cellRanges, cellRanges)) {
            return;
        }
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
    RangeService.prototype.createCellRangeFromCellRangeParams = function (params) {
        var _this = this;
        var columns;
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
            startColumn: columns[0]
        };
    };
    RangeService.prototype.addCellRange = function (params) {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }
        var newRange = this.createCellRangeFromCellRangeParams(params);
        if (newRange) {
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
        if (len !== 1) {
            // if range is not zero and not one, means more than one cell
            return len !== 0;
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
                    columns.push.apply(columns, __spread(filteredColumns));
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
        this.onDragging(this.lastMouseEvent);
    };
    RangeService.prototype.isCellInAnyRange = function (cell) {
        return this.getCellRangeCount(cell) > 0;
    };
    RangeService.prototype.isCellInSpecificRange = function (cell, range) {
        var columnInRange = range.columns !== null && _.includes(range.columns, cell.column);
        var rowInRange = this.isRowInRange(cell.rowIndex, cell.rowPinned, range);
        return columnInRange && rowInRange;
    };
    RangeService.prototype.isLastCellOfRange = function (cellRange, cell) {
        var startRow = cellRange.startRow, endRow = cellRange.endRow;
        var lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
        var isLastRow = cell.rowIndex === lastRow.rowIndex && cell.rowPinned === lastRow.rowPinned;
        var rangeFirstIndexColumn = cellRange.columns[0];
        var rangeLastIndexColumn = _.last(cellRange.columns);
        var lastRangeColumn = cellRange.startColumn === rangeFirstIndexColumn ? rangeLastIndexColumn : rangeFirstIndexColumn;
        var isLastColumn = cell.column === lastRangeColumn;
        return isLastColumn && isLastRow;
    };
    RangeService.prototype.isBottomRightCell = function (cellRange, cell) {
        var allColumns = this.columnModel.getAllDisplayedColumns();
        var allPositions = cellRange.columns.map(function (c) { return allColumns.indexOf(c); }).sort(function (a, b) { return a - b; });
        var startRow = cellRange.startRow, endRow = cellRange.endRow;
        var lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
        var isRightColumn = allColumns.indexOf(cell.column) === _.last(allPositions);
        var isLastRow = cell.rowIndex === lastRow.rowIndex && _.makeNull(cell.rowPinned) === _.makeNull(lastRow.rowPinned);
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
        var extendRange = shiftKey && _.existsAndNotEmpty(this.cellRanges);
        if (!multiSelectKeyPressed && (!extendRange || _.exists(_.last(this.cellRanges).type))) {
            this.removeAllCellRanges(true);
        }
        // The DragService used by the this service (RangeService), automatically adds a `mousemove`
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
        this.draggingCell = this.lastCellHovered;
        this.lastMouseEvent = mouseEvent;
        if (!extendRange) {
            this.newestRangeStartCell = this.lastCellHovered;
        }
        // if we didn't clear the ranges, then dragging means the user clicked, and when the
        // user clicks it means a range of one cell was created. we need to extend this range
        // rather than creating another range. otherwise we end up with two distinct ranges
        // from a drag operation (one from click, and one from drag).
        if (this.cellRanges.length > 0) {
            this.draggingRange = _.last(this.cellRanges);
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
        this.draggingCell = cellPosition;
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
        this.draggingCell = undefined;
        this.lastCellHovered = undefined;
        this.dispatchChangedEvent(false, true, id);
    };
    RangeService.prototype.dispatchChangedEvent = function (started, finished, id) {
        var event = Object.freeze({
            type: Events.EVENT_RANGE_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
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
    __decorate([
        Autowired('rowModel')
    ], RangeService.prototype, "rowModel", void 0);
    __decorate([
        Autowired('columnModel')
    ], RangeService.prototype, "columnModel", void 0);
    __decorate([
        Autowired('mouseEventService')
    ], RangeService.prototype, "mouseEventService", void 0);
    __decorate([
        Autowired('columnApi')
    ], RangeService.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], RangeService.prototype, "gridApi", void 0);
    __decorate([
        Autowired('cellNavigationService')
    ], RangeService.prototype, "cellNavigationService", void 0);
    __decorate([
        Autowired("pinnedRowModel")
    ], RangeService.prototype, "pinnedRowModel", void 0);
    __decorate([
        Autowired('rowPositionUtils')
    ], RangeService.prototype, "rowPositionUtils", void 0);
    __decorate([
        Autowired('cellPositionUtils')
    ], RangeService.prototype, "cellPositionUtils", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], RangeService.prototype, "ctrlsService", void 0);
    __decorate([
        PostConstruct
    ], RangeService.prototype, "init", null);
    RangeService = __decorate([
        Bean('rangeService')
    ], RangeService);
    return RangeService;
}(BeanStub));
export { RangeService };
//# sourceMappingURL=rangeService.js.map