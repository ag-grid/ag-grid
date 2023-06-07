var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, Events, PostConstruct, BeanStub, AutoScrollService, CellCtrl, _ } from "@ag-grid-community/core";
let RangeService = class RangeService extends BeanStub {
    constructor() {
        super(...arguments);
        this.cellRanges = [];
        this.bodyScrollListener = this.onBodyScroll.bind(this);
        this.dragging = false;
        this.intersectionRange = false; // When dragging ends, the current range will be used to intersect all other ranges
    }
    init() {
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.onColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => this.removeAllCellRanges());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.removeAllCellRanges());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, () => this.removeAllCellRanges());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.refreshLastRangeStart.bind(this));
        this.ctrlsService.whenReady(() => {
            const gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
            this.autoScrollService = new AutoScrollService({
                scrollContainer: gridBodyCtrl.getBodyViewportElement(),
                scrollAxis: 'xy',
                getVerticalPosition: () => gridBodyCtrl.getScrollFeature().getVScrollPosition().top,
                setVerticalPosition: (position) => gridBodyCtrl.getScrollFeature().setVerticalScrollPosition(position),
                getHorizontalPosition: () => gridBodyCtrl.getScrollFeature().getHScrollPosition().left,
                setHorizontalPosition: (position) => gridBodyCtrl.getScrollFeature().setHorizontalScrollPosition(position),
                shouldSkipVerticalScroll: () => !this.gridOptionsService.isDomLayout('normal'),
                shouldSkipHorizontalScroll: () => !gridBodyCtrl.getScrollFeature().isHorizontalScrollShowing()
            });
        });
    }
    // Called for both columns loaded & column visibility events
    onColumnsChanged() {
        // first move start column in last cell range (i.e. series chart range)
        this.refreshLastRangeStart();
        const allColumns = this.columnModel.getAllDisplayedColumns();
        // check that the columns in each range still exist and are visible
        this.cellRanges.forEach(cellRange => {
            const beforeCols = cellRange.columns;
            // remove hidden or removed cols from cell range
            cellRange.columns = cellRange.columns.filter(col => col.isVisible() && allColumns.indexOf(col) !== -1);
            const colsInRangeChanged = !_.areEqual(beforeCols, cellRange.columns);
            if (colsInRangeChanged) {
                // notify users and other parts of grid (i.e. status panel) that range has changed
                this.dispatchChangedEvent(false, true, cellRange.id);
            }
        });
        // Remove empty cell ranges
        const countBefore = this.cellRanges.length;
        this.cellRanges = this.cellRanges.filter((range) => range.columns.length > 0);
        if (countBefore > this.cellRanges.length) {
            this.dispatchChangedEvent(false, true);
        }
    }
    refreshLastRangeStart() {
        const lastRange = _.last(this.cellRanges);
        if (!lastRange) {
            return;
        }
        this.refreshRangeStart(lastRange);
    }
    isContiguousRange(cellRange) {
        const rangeColumns = cellRange.columns;
        if (!rangeColumns.length) {
            return false;
        }
        const allColumns = this.columnModel.getAllDisplayedColumns();
        const allPositions = rangeColumns.map(c => allColumns.indexOf(c)).sort((a, b) => a - b);
        return _.last(allPositions) - allPositions[0] + 1 === rangeColumns.length;
    }
    getRangeStartRow(cellRange) {
        if (cellRange.startRow && cellRange.endRow) {
            return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ?
                cellRange.startRow : cellRange.endRow;
        }
        const rowPinned = this.pinnedRowModel.getPinnedTopRowCount() > 0 ? 'top' : null;
        return { rowIndex: 0, rowPinned };
    }
    getRangeEndRow(cellRange) {
        if (cellRange.startRow && cellRange.endRow) {
            return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ?
                cellRange.endRow : cellRange.startRow;
        }
        const pinnedBottomRowCount = this.pinnedRowModel.getPinnedBottomRowCount();
        const pinnedBottom = pinnedBottomRowCount > 0;
        if (pinnedBottom) {
            return {
                rowIndex: pinnedBottomRowCount - 1,
                rowPinned: 'bottom'
            };
        }
        return {
            rowIndex: this.rowModel.getRowCount() - 1,
            rowPinned: null
        };
    }
    setRangeToCell(cell, appendRange = false) {
        if (!this.gridOptionsService.isEnableRangeSelection()) {
            return;
        }
        const columns = this.calculateColumnsBetween(cell.column, cell.column);
        if (!columns) {
            return;
        }
        const suppressMultiRangeSelections = this.gridOptionsService.is('suppressMultiRangeSelection');
        // if not appending, then clear previous range selections
        if (suppressMultiRangeSelections || !appendRange || _.missing(this.cellRanges)) {
            this.removeAllCellRanges(true);
        }
        const rowForCell = {
            rowIndex: cell.rowIndex,
            rowPinned: cell.rowPinned
        };
        const cellRange = {
            startRow: rowForCell,
            endRow: rowForCell,
            columns,
            startColumn: cell.column
        };
        this.cellRanges.push(cellRange);
        this.setNewestRangeStartCell(cell);
        this.onDragStop();
        this.dispatchChangedEvent(true, true);
    }
    extendLatestRangeToCell(cellPosition) {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }
        const cellRange = _.last(this.cellRanges);
        this.updateRangeEnd(cellRange, cellPosition);
    }
    updateRangeEnd(cellRange, cellPosition, silent = false) {
        const endColumn = cellPosition.column;
        const colsToAdd = this.calculateColumnsBetween(cellRange.startColumn, endColumn);
        if (!colsToAdd || this.isLastCellOfRange(cellRange, cellPosition)) {
            return;
        }
        cellRange.columns = colsToAdd;
        cellRange.endRow = { rowIndex: cellPosition.rowIndex, rowPinned: cellPosition.rowPinned };
        if (!silent) {
            this.dispatchChangedEvent(true, true, cellRange.id);
        }
    }
    refreshRangeStart(cellRange) {
        const { startColumn, columns } = cellRange;
        const moveColInCellRange = (colToMove, moveToFront) => {
            const otherCols = cellRange.columns.filter(col => col !== colToMove);
            if (colToMove) {
                cellRange.startColumn = colToMove;
                cellRange.columns = moveToFront ? [colToMove, ...otherCols] : [...otherCols, colToMove];
            }
            else {
                cellRange.columns = otherCols;
            }
        };
        const { left, right } = this.getRangeEdgeColumns(cellRange);
        const shouldMoveLeftCol = startColumn === columns[0] && startColumn !== left;
        if (shouldMoveLeftCol) {
            moveColInCellRange(left, true);
            return;
        }
        const shouldMoveRightCol = startColumn === _.last(columns) && startColumn === right;
        if (shouldMoveRightCol) {
            moveColInCellRange(right, false);
            return;
        }
    }
    getRangeEdgeColumns(cellRange) {
        const allColumns = this.columnModel.getAllDisplayedColumns();
        const allIndices = cellRange.columns
            .map(c => allColumns.indexOf(c))
            .filter(i => i > -1)
            .sort((a, b) => a - b);
        return {
            left: allColumns[allIndices[0]],
            right: allColumns[_.last(allIndices)]
        };
    }
    // returns true if successful, false if not successful
    extendLatestRangeInDirection(event) {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }
        const key = event.key;
        const ctrlKey = event.ctrlKey || event.metaKey;
        const lastRange = _.last(this.cellRanges);
        const startCell = this.newestRangeStartCell;
        const firstCol = lastRange.columns[0];
        const lastCol = _.last(lastRange.columns);
        // find the cell that is at the furthest away corner from the starting cell
        const endCellIndex = lastRange.endRow.rowIndex;
        const endCellFloating = lastRange.endRow.rowPinned;
        const endCellColumn = startCell.column === firstCol ? lastCol : firstCol;
        const endCell = { column: endCellColumn, rowIndex: endCellIndex, rowPinned: endCellFloating };
        const newEndCell = this.cellNavigationService.getNextCellToFocus(key, endCell, ctrlKey);
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
    }
    setCellRange(params) {
        if (!this.gridOptionsService.isEnableRangeSelection()) {
            return;
        }
        this.removeAllCellRanges(true);
        this.addCellRange(params);
    }
    setCellRanges(cellRanges) {
        if (_.shallowCompare(this.cellRanges, cellRanges)) {
            return;
        }
        this.removeAllCellRanges(true);
        cellRanges.forEach(newRange => {
            if (newRange.columns && newRange.startRow) {
                this.setNewestRangeStartCell({
                    rowIndex: newRange.startRow.rowIndex,
                    rowPinned: newRange.startRow.rowPinned,
                    column: newRange.columns[0]
                });
            }
            this.cellRanges.push(newRange);
        });
        this.dispatchChangedEvent(false, true);
    }
    setNewestRangeStartCell(position) {
        this.newestRangeStartCell = position;
    }
    clearCellRangeCellValues(params) {
        let { cellRanges } = params;
        const { cellEventSource = 'rangeService', dispatchWrapperEvents, wrapperEventSource = 'deleteKey' } = params;
        if (dispatchWrapperEvents) {
            const startEvent = {
                type: Events.EVENT_RANGE_DELETE_START,
                source: wrapperEventSource
            };
            this.eventService.dispatchEvent(startEvent);
        }
        if (!cellRanges) {
            cellRanges = this.cellRanges;
        }
        cellRanges.forEach(cellRange => {
            this.forEachRowInRange(cellRange, rowPosition => {
                const rowNode = this.rowPositionUtils.getRowNode(rowPosition);
                if (!rowNode) {
                    return;
                }
                for (let i = 0; i < cellRange.columns.length; i++) {
                    const column = this.columnModel.getGridColumn(cellRange.columns[i]);
                    if (!column || !column.isCellEditable(rowNode)) {
                        return;
                    }
                    rowNode.setDataValue(column, null, cellEventSource);
                }
            });
        });
        if (dispatchWrapperEvents) {
            const endEvent = {
                type: Events.EVENT_RANGE_DELETE_END,
                source: wrapperEventSource
            };
            this.eventService.dispatchEvent(endEvent);
        }
    }
    createCellRangeFromCellRangeParams(params) {
        let columns;
        let startsOnTheRight = false;
        if (params.columns) {
            columns = params.columns.map(c => this.columnModel.getColumnWithValidation(c)).filter(c => c);
        }
        else {
            const columnStart = this.columnModel.getColumnWithValidation(params.columnStart);
            const columnEnd = this.columnModel.getColumnWithValidation(params.columnEnd);
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
        const startRow = params.rowStartIndex != null ? {
            rowIndex: params.rowStartIndex,
            rowPinned: params.rowStartPinned || null
        } : undefined;
        const endRow = params.rowEndIndex != null ? {
            rowIndex: params.rowEndIndex,
            rowPinned: params.rowEndPinned || null
        } : undefined;
        return {
            startRow,
            endRow,
            columns,
            startColumn: startsOnTheRight ? _.last(columns) : columns[0]
        };
    }
    addCellRange(params) {
        if (!this.gridOptionsService.isEnableRangeSelection()) {
            return;
        }
        const newRange = this.createCellRangeFromCellRangeParams(params);
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
    }
    getCellRanges() {
        return this.cellRanges;
    }
    isEmpty() {
        return this.cellRanges.length === 0;
    }
    isMoreThanOneCell() {
        const len = this.cellRanges.length;
        if (len === 0) {
            return false;
        }
        if (len > 1) {
            return true; // Assumes a cell range must contain at least one cell
        }
        // only one range, return true if range has more than one
        const range = this.cellRanges[0];
        const startRow = this.getRangeStartRow(range);
        const endRow = this.getRangeEndRow(range);
        return startRow.rowPinned !== endRow.rowPinned ||
            startRow.rowIndex !== endRow.rowIndex ||
            range.columns.length !== 1;
    }
    areAllRangesAbleToMerge() {
        const rowToColumnMap = new Map();
        const len = this.cellRanges.length;
        if (len <= 1)
            return true;
        this.cellRanges.forEach(range => {
            this.forEachRowInRange(range, row => {
                const rowName = `${row.rowPinned || 'normal'}_${row.rowIndex}`;
                const columns = rowToColumnMap.get(rowName);
                const currentRangeColIds = range.columns.map(col => col.getId());
                if (columns) {
                    const filteredColumns = currentRangeColIds.filter(col => columns.indexOf(col) === -1);
                    columns.push(...filteredColumns);
                }
                else {
                    rowToColumnMap.set(rowName, currentRangeColIds);
                }
            });
        });
        let columnsString;
        for (const val of rowToColumnMap.values()) {
            const currentValString = val.sort().join();
            if (columnsString === undefined) {
                columnsString = currentValString;
                continue;
            }
            if (columnsString !== currentValString) {
                return false;
            }
        }
        return true;
    }
    forEachRowInRange(cellRange, callback) {
        const topRow = this.getRangeStartRow(cellRange);
        const bottomRow = this.getRangeEndRow(cellRange);
        let currentRow = topRow;
        while (currentRow) {
            callback(currentRow);
            if (this.rowPositionUtils.sameRow(currentRow, bottomRow)) {
                break;
            }
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
    }
    removeAllCellRanges(silent) {
        if (this.isEmpty()) {
            return;
        }
        this.onDragStop();
        this.cellRanges.length = 0;
        if (!silent) {
            this.dispatchChangedEvent(false, true);
        }
    }
    // as the user is dragging outside of the panel, the div starts to scroll, which in turn
    // means we are selection more (or less) cells, but the mouse isn't moving, so we recalculate
    // the selection my mimicking a new mouse event
    onBodyScroll() {
        if (this.dragging && this.lastMouseEvent) {
            this.onDragging(this.lastMouseEvent);
        }
    }
    isCellInAnyRange(cell) {
        return this.getCellRangeCount(cell) > 0;
    }
    isCellInSpecificRange(cell, range) {
        const columnInRange = range.columns !== null && _.includes(range.columns, cell.column);
        const rowInRange = this.isRowInRange(cell.rowIndex, cell.rowPinned, range);
        return columnInRange && rowInRange;
    }
    isLastCellOfRange(cellRange, cell) {
        const { startRow, endRow } = cellRange;
        const lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
        const isLastRow = cell.rowIndex === lastRow.rowIndex && cell.rowPinned === lastRow.rowPinned;
        const rangeFirstIndexColumn = cellRange.columns[0];
        const rangeLastIndexColumn = _.last(cellRange.columns);
        const lastRangeColumn = cellRange.startColumn === rangeFirstIndexColumn ? rangeLastIndexColumn : rangeFirstIndexColumn;
        const isLastColumn = cell.column === lastRangeColumn;
        return isLastColumn && isLastRow;
    }
    isBottomRightCell(cellRange, cell) {
        const allColumns = this.columnModel.getAllDisplayedColumns();
        const allPositions = cellRange.columns.map(c => allColumns.indexOf(c)).sort((a, b) => a - b);
        const { startRow, endRow } = cellRange;
        const lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
        const isRightColumn = allColumns.indexOf(cell.column) === _.last(allPositions);
        const isLastRow = cell.rowIndex === lastRow.rowIndex && _.makeNull(cell.rowPinned) === _.makeNull(lastRow.rowPinned);
        return isRightColumn && isLastRow;
    }
    // returns the number of ranges this cell is in
    getCellRangeCount(cell) {
        if (this.isEmpty()) {
            return 0;
        }
        return this.cellRanges.filter(cellRange => this.isCellInSpecificRange(cell, cellRange)).length;
    }
    isRowInRange(rowIndex, floating, cellRange) {
        const firstRow = this.getRangeStartRow(cellRange);
        const lastRow = this.getRangeEndRow(cellRange);
        const thisRow = { rowIndex, rowPinned: floating || null };
        // compare rowPinned with == instead of === because it can be `null` or `undefined`
        const equalsFirstRow = thisRow.rowIndex === firstRow.rowIndex && thisRow.rowPinned == firstRow.rowPinned;
        const equalsLastRow = thisRow.rowIndex === lastRow.rowIndex && thisRow.rowPinned == lastRow.rowPinned;
        if (equalsFirstRow || equalsLastRow) {
            return true;
        }
        const afterFirstRow = !this.rowPositionUtils.before(thisRow, firstRow);
        const beforeLastRow = this.rowPositionUtils.before(thisRow, lastRow);
        return afterFirstRow && beforeLastRow;
    }
    getDraggingRange() {
        return this.draggingRange;
    }
    onDragStart(mouseEvent) {
        if (!this.gridOptionsService.isEnableRangeSelection()) {
            return;
        }
        const { ctrlKey, metaKey, shiftKey } = mouseEvent;
        // ctrlKey for windows, metaKey for Apple
        const isMultiKey = ctrlKey || metaKey;
        const allowMulti = !this.gridOptionsService.is('suppressMultiRangeSelection');
        const isMultiSelect = allowMulti ? isMultiKey : false;
        const extendRange = shiftKey && _.existsAndNotEmpty(this.cellRanges);
        if (!isMultiSelect && (!extendRange || _.exists(_.last(this.cellRanges).type))) {
            this.removeAllCellRanges(true);
        }
        // The browser changes the Event target of cached events when working with the ShadowDOM
        // so we need to retrieve the initial DragStartTarget.
        const startTarget = this.dragService.getStartTarget();
        if (startTarget) {
            this.updateValuesOnMove(startTarget);
        }
        if (!this.lastCellHovered) {
            return;
        }
        this.dragging = true;
        this.lastMouseEvent = mouseEvent;
        this.intersectionRange = isMultiSelect && this.getCellRangeCount(this.lastCellHovered) > 1;
        if (!extendRange) {
            this.setNewestRangeStartCell(this.lastCellHovered);
        }
        // if we didn't clear the ranges, then dragging means the user clicked, and when the
        // user clicks it means a range of one cell was created. we need to extend this range
        // rather than creating another range. otherwise we end up with two distinct ranges
        // from a drag operation (one from click, and one from drag).
        if (this.cellRanges.length > 0) {
            this.draggingRange = _.last(this.cellRanges);
        }
        else {
            const mouseRowPosition = {
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
    }
    intersectLastRange(fromMouseClick) {
        // when ranges are created due to a mouse click without drag (happens in cellMouseListener)
        // this method will be called with `fromMouseClick=true`.
        if (fromMouseClick && this.dragging) {
            return;
        }
        if (this.gridOptionsService.is('suppressMultiRangeSelection')) {
            return;
        }
        if (this.isEmpty()) {
            return;
        }
        const lastRange = _.last(this.cellRanges);
        const intersectionStartRow = this.getRangeStartRow(lastRange);
        const intersectionEndRow = this.getRangeEndRow(lastRange);
        const newRanges = [];
        this.cellRanges.slice(0, -1).forEach((range) => {
            const startRow = this.getRangeStartRow(range);
            const endRow = this.getRangeEndRow(range);
            const cols = range.columns;
            const intersectCols = cols.filter((col) => lastRange.columns.indexOf(col) === -1);
            if (intersectCols.length === cols.length) {
                // No overlapping columns, retain previous range
                newRanges.push(range);
                return;
            }
            if (this.rowPositionUtils.before(intersectionEndRow, startRow) || this.rowPositionUtils.before(endRow, intersectionStartRow)) {
                // No overlapping rows, retain previous range
                newRanges.push(range);
                return;
            }
            const rangeCountBefore = newRanges.length;
            // Top
            if (this.rowPositionUtils.before(startRow, intersectionStartRow)) {
                const top = {
                    columns: [...cols],
                    startColumn: lastRange.startColumn,
                    startRow: Object.assign({}, startRow),
                    endRow: this.cellNavigationService.getRowAbove(intersectionStartRow),
                };
                newRanges.push(top);
            }
            // Left & Right (not contiguous with columns)
            if (intersectCols.length > 0) {
                const middle = {
                    columns: intersectCols,
                    startColumn: _.includes(intersectCols, lastRange.startColumn) ? lastRange.startColumn : intersectCols[0],
                    startRow: this.rowPositionUtils.rowMax([Object.assign({}, intersectionStartRow), Object.assign({}, startRow)]),
                    endRow: this.rowPositionUtils.rowMin([Object.assign({}, intersectionEndRow), Object.assign({}, endRow)]),
                };
                newRanges.push(middle);
            }
            // Bottom
            if (this.rowPositionUtils.before(intersectionEndRow, endRow)) {
                newRanges.push({
                    columns: [...cols],
                    startColumn: lastRange.startColumn,
                    startRow: this.cellNavigationService.getRowBelow(intersectionEndRow),
                    endRow: Object.assign({}, endRow),
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
    }
    updateValuesOnMove(eventTarget) {
        const cellCtrl = _.getCtrlForEventTarget(this.gridOptionsService, eventTarget, CellCtrl.DOM_DATA_KEY_CELL_CTRL);
        const cell = cellCtrl === null || cellCtrl === void 0 ? void 0 : cellCtrl.getCellPosition();
        this.cellHasChanged = false;
        if (!cell || (this.lastCellHovered && this.cellPositionUtils.equals(cell, this.lastCellHovered))) {
            return;
        }
        if (this.lastCellHovered) {
            this.cellHasChanged = true;
        }
        this.lastCellHovered = cell;
    }
    onDragging(mouseEvent) {
        if (!this.dragging || !mouseEvent) {
            return;
        }
        this.updateValuesOnMove(mouseEvent.target);
        this.lastMouseEvent = mouseEvent;
        const cellPosition = this.lastCellHovered;
        const isMouseAndStartInPinned = (position) => cellPosition && cellPosition.rowPinned === position && this.newestRangeStartCell.rowPinned === position;
        const skipVerticalScroll = isMouseAndStartInPinned('top') || isMouseAndStartInPinned('bottom');
        this.autoScrollService.check(mouseEvent, skipVerticalScroll);
        if (!this.cellHasChanged) {
            return;
        }
        const columns = this.calculateColumnsBetween(this.newestRangeStartCell.column, cellPosition.column);
        if (!columns) {
            return;
        }
        this.draggingRange.endRow = {
            rowIndex: cellPosition.rowIndex,
            rowPinned: cellPosition.rowPinned
        };
        this.draggingRange.columns = columns;
        this.dispatchChangedEvent(false, false, this.draggingRange.id);
    }
    onDragStop() {
        if (!this.dragging) {
            return;
        }
        const { id } = this.draggingRange;
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
    }
    dispatchChangedEvent(started, finished, id) {
        const event = {
            type: Events.EVENT_RANGE_SELECTION_CHANGED,
            started,
            finished,
            id,
        };
        this.eventService.dispatchEvent(event);
    }
    calculateColumnsBetween(columnFrom, columnTo) {
        const allColumns = this.columnModel.getAllDisplayedColumns();
        const isSameColumn = columnFrom === columnTo;
        const fromIndex = allColumns.indexOf(columnFrom);
        if (fromIndex < 0) {
            console.warn(`AG Grid: column ${columnFrom.getId()} is not visible`);
            return;
        }
        const toIndex = isSameColumn ? fromIndex : allColumns.indexOf(columnTo);
        if (toIndex < 0) {
            console.warn(`AG Grid: column ${columnTo.getId()} is not visible`);
            return;
        }
        if (isSameColumn) {
            return [columnFrom];
        }
        const firstIndex = Math.min(fromIndex, toIndex);
        const lastIndex = firstIndex === fromIndex ? toIndex : fromIndex;
        const columns = [];
        for (let i = firstIndex; i <= lastIndex; i++) {
            columns.push(allColumns[i]);
        }
        return columns;
    }
};
__decorate([
    Autowired('rowModel')
], RangeService.prototype, "rowModel", void 0);
__decorate([
    Autowired('dragService')
], RangeService.prototype, "dragService", void 0);
__decorate([
    Autowired('columnModel')
], RangeService.prototype, "columnModel", void 0);
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
export { RangeService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3JhbmdlU2VsZWN0aW9uL3JhbmdlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULElBQUksRUFNSixNQUFNLEVBSU4sYUFBYSxFQU1iLFFBQVEsRUFFUixpQkFBaUIsRUFJakIsUUFBUSxFQUNSLENBQUMsRUFJSixNQUFNLHlCQUF5QixDQUFDO0FBR2pDLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQWEsU0FBUSxRQUFRO0lBQTFDOztRQVdZLGVBQVUsR0FBZ0IsRUFBRSxDQUFDO1FBRTdCLHVCQUFrQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBVWxELGFBQVEsR0FBRyxLQUFLLENBQUM7UUFHakIsc0JBQWlCLEdBQUcsS0FBSyxDQUFDLENBQUMsbUZBQW1GO0lBd3hCMUgsQ0FBQztJQW54QlcsSUFBSTtRQUNSLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQzNHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNoSCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFN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