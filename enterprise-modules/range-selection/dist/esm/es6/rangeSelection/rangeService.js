var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, Events, PostConstruct, BeanStub, AutoScrollService, _ } from "@ag-grid-community/core";
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
    clearCellRangeCellValues(cellRanges) {
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
                    rowNode.setDataValue(column, null, 'rangeService');
                }
            });
        });
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
        const multiKeyPressed = ctrlKey || metaKey;
        const allowMulti = !this.gridOptionsService.is('suppressMultiRangeSelection');
        const multiSelectKeyPressed = allowMulti ? multiKeyPressed : false;
        const extendRange = shiftKey && _.existsAndNotEmpty(this.cellRanges);
        if (!multiSelectKeyPressed && (!extendRange || _.exists(_.last(this.cellRanges).type))) {
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
    updateValuesOnMove(mouseEvent) {
        const cell = this.mouseEventService.getCellPositionForEvent(mouseEvent);
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
        if (this.cellHoverListener) {
            this.cellHoverListener();
            this.cellHoverListener = undefined;
        }
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
        const event = Object.freeze({
            type: Events.EVENT_RANGE_SELECTION_CHANGED,
            started,
            finished,
            id,
        });
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
    Autowired('columnModel')
], RangeService.prototype, "columnModel", void 0);
__decorate([
    Autowired('mouseEventService')
], RangeService.prototype, "mouseEventService", void 0);
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
