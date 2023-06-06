/**
          * @ag-grid-enterprise/range-selection - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v30.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
import { Autowired, PostConstruct, Bean, BeanStub, Events, AutoScrollService, _, CellCtrl, Component, SelectionHandleType, CellRangeType, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
__decorate$3([
    Autowired('rowModel')
], RangeService.prototype, "rowModel", void 0);
__decorate$3([
    Autowired('dragService')
], RangeService.prototype, "dragService", void 0);
__decorate$3([
    Autowired('columnModel')
], RangeService.prototype, "columnModel", void 0);
__decorate$3([
    Autowired('cellNavigationService')
], RangeService.prototype, "cellNavigationService", void 0);
__decorate$3([
    Autowired("pinnedRowModel")
], RangeService.prototype, "pinnedRowModel", void 0);
__decorate$3([
    Autowired('rowPositionUtils')
], RangeService.prototype, "rowPositionUtils", void 0);
__decorate$3([
    Autowired('cellPositionUtils')
], RangeService.prototype, "cellPositionUtils", void 0);
__decorate$3([
    Autowired('ctrlsService')
], RangeService.prototype, "ctrlsService", void 0);
__decorate$3([
    PostConstruct
], RangeService.prototype, "init", null);
RangeService = __decorate$3([
    Bean('rangeService')
], RangeService);

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class AbstractSelectionHandle extends Component {
    constructor() {
        super(...arguments);
        this.changedCalculatedValues = false;
        this.dragging = false;
        this.shouldDestroyOnEndDragging = false;
    }
    init() {
        this.dragService.addDragSource({
            dragStartPixels: 0,
            eElement: this.getGui(),
            onDragStart: this.onDragStart.bind(this),
            onDragging: (e) => {
                this.dragging = true;
                this.rangeService.autoScrollService.check(e);
                if (this.changedCalculatedValues) {
                    this.onDrag(e);
                    this.changedCalculatedValues = false;
                }
            },
            onDragStop: (e) => {
                this.dragging = false;
                this.onDragEnd(e);
                this.clearValues();
                this.rangeService.autoScrollService.ensureCleared();
                // TODO: this causes a bug where if there are multiple grids in the same page, all of them will
                // be affected by a drag on any. Move it to the root element.
                document.body.classList.remove(this.getDraggingCssClass());
                if (this.shouldDestroyOnEndDragging) {
                    this.destroy();
                }
            }
        });
        this.addManagedListener(this.getGui(), 'mousedown', this.preventRangeExtension.bind(this));
    }
    isDragging() {
        return this.dragging;
    }
    getCellCtrl() {
        return this.cellCtrl;
    }
    setCellCtrl(cellComp) {
        this.cellCtrl = cellComp;
    }
    getCellRange() {
        return this.cellRange;
    }
    setCellRange(range) {
        this.cellRange = range;
    }
    getRangeStartRow() {
        return this.rangeStartRow;
    }
    setRangeStartRow(row) {
        this.rangeStartRow = row;
    }
    getRangeEndRow() {
        return this.rangeEndRow;
    }
    setRangeEndRow(row) {
        this.rangeEndRow = row;
    }
    getLastCellHovered() {
        return this.lastCellHovered;
    }
    preventRangeExtension(e) {
        e.stopPropagation();
    }
    onDragStart(e) {
        this.cellHoverListener = this.addManagedListener(this.ctrlsService.getGridCtrl().getGui(), 'mousemove', this.updateValuesOnMove.bind(this));
        document.body.classList.add(this.getDraggingCssClass());
    }
    getDraggingCssClass() {
        return `ag-dragging-${this.type === SelectionHandleType.FILL ? 'fill' : 'range'}-handle`;
    }
    updateValuesOnMove(e) {
        const cell = this.mouseEventService.getCellPositionForEvent(e);
        if (!cell || (this.lastCellHovered && this.cellPositionUtils.equals(cell, this.lastCellHovered))) {
            return;
        }
        this.lastCellHovered = cell;
        this.changedCalculatedValues = true;
    }
    getType() {
        return this.type;
    }
    refresh(cellCtrl) {
        const oldCellComp = this.getCellCtrl();
        const eGui = this.getGui();
        const cellRange = _.last(this.rangeService.getCellRanges());
        const start = cellRange.startRow;
        const end = cellRange.endRow;
        if (start && end) {
            const isBefore = this.rowPositionUtils.before(end, start);
            if (isBefore) {
                this.setRangeStartRow(end);
                this.setRangeEndRow(start);
            }
            else {
                this.setRangeStartRow(start);
                this.setRangeEndRow(end);
            }
        }
        if (oldCellComp !== cellCtrl || !_.isVisible(eGui)) {
            this.setCellCtrl(cellCtrl);
            const eParentOfValue = cellCtrl.getComp().getParentOfValue();
            if (eParentOfValue) {
                eParentOfValue.appendChild(eGui);
            }
        }
        this.setCellRange(cellRange);
    }
    clearValues() {
        this.lastCellHovered = undefined;
        this.removeListeners();
    }
    removeListeners() {
        if (this.cellHoverListener) {
            this.cellHoverListener();
            this.cellHoverListener = undefined;
        }
    }
    destroy() {
        if (!this.shouldDestroyOnEndDragging && this.isDragging()) {
            _.setDisplayed(this.getGui(), false);
            this.shouldDestroyOnEndDragging = true;
            return;
        }
        this.shouldDestroyOnEndDragging = false;
        super.destroy();
        this.removeListeners();
        const eGui = this.getGui();
        if (eGui.parentElement) {
            eGui.parentElement.removeChild(eGui);
        }
    }
}
__decorate$2([
    Autowired("rowRenderer")
], AbstractSelectionHandle.prototype, "rowRenderer", void 0);
__decorate$2([
    Autowired("dragService")
], AbstractSelectionHandle.prototype, "dragService", void 0);
__decorate$2([
    Autowired("rangeService")
], AbstractSelectionHandle.prototype, "rangeService", void 0);
__decorate$2([
    Autowired("mouseEventService")
], AbstractSelectionHandle.prototype, "mouseEventService", void 0);
__decorate$2([
    Autowired("columnModel")
], AbstractSelectionHandle.prototype, "columnModel", void 0);
__decorate$2([
    Autowired("cellNavigationService")
], AbstractSelectionHandle.prototype, "cellNavigationService", void 0);
__decorate$2([
    Autowired("navigationService")
], AbstractSelectionHandle.prototype, "navigationService", void 0);
__decorate$2([
    Autowired('rowPositionUtils')
], AbstractSelectionHandle.prototype, "rowPositionUtils", void 0);
__decorate$2([
    Autowired('cellPositionUtils')
], AbstractSelectionHandle.prototype, "cellPositionUtils", void 0);
__decorate$2([
    Autowired('ctrlsService')
], AbstractSelectionHandle.prototype, "ctrlsService", void 0);
__decorate$2([
    PostConstruct
], AbstractSelectionHandle.prototype, "init", null);

function findLineByLeastSquares(values) {
    const len = values.length;
    let maxDecimals = 0;
    if (len <= 1) {
        return values;
    }
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const splitExponent = value.toString().split('e-');
        if (splitExponent.length > 1) {
            maxDecimals = Math.max(maxDecimals, parseInt(splitExponent[1], 10));
            continue;
        }
        if (Math.floor(value) === value) {
            continue;
        }
        maxDecimals = Math.max(maxDecimals, value.toString().split('.')[1].length);
    }
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;
    let y = 0;
    for (let x = 0; x < len; x++) {
        y = values[x];
        sum_x += x;
        sum_y += y;
        sum_xx += x * x;
        sum_xy += x * y;
    }
    const m = (len * sum_xy - sum_x * sum_y) / (len * sum_xx - sum_x * sum_x);
    const b = (sum_y / len) - (m * sum_x) / len;
    const result = [];
    for (let x = 0; x <= len; x++) {
        result.push(parseFloat((x * m + b).toFixed(maxDecimals)));
    }
    return result;
}

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class FillHandle extends AbstractSelectionHandle {
    constructor() {
        super(FillHandle.TEMPLATE);
        this.markedCells = [];
        this.cellValues = [];
        this.isUp = false;
        this.isLeft = false;
        this.isReduce = false;
        this.type = SelectionHandleType.FILL;
    }
    updateValuesOnMove(e) {
        super.updateValuesOnMove(e);
        if (!this.initialXY) {
            this.initialXY = this.mouseEventService.getNormalisedPosition(e);
        }
        const { x, y } = this.initialXY;
        const { x: newX, y: newY } = this.mouseEventService.getNormalisedPosition(e);
        const diffX = Math.abs(x - newX);
        const diffY = Math.abs(y - newY);
        const allowedDirection = this.getFillHandleDirection();
        let direction;
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
    }
    onDrag(e) {
        if (!this.initialPosition) {
            const cellCtrl = this.getCellCtrl();
            if (!cellCtrl) {
                return;
            }
            this.initialPosition = cellCtrl.getCellPosition();
        }
        const lastCellHovered = this.getLastCellHovered();
        if (lastCellHovered) {
            this.markPathFrom(this.initialPosition, lastCellHovered);
        }
    }
    onDragEnd(e) {
        this.initialXY = null;
        if (!this.markedCells.length) {
            return;
        }
        const isX = this.dragAxis === 'x';
        const initialRange = this.getCellRange();
        const colLen = initialRange.columns.length;
        const rangeStartRow = this.getRangeStartRow();
        const rangeEndRow = this.getRangeEndRow();
        let finalRange;
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
            const startRow = isX ? rangeStartRow : this.lastCellMarked;
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
    }
    getFillHandleDirection() {
        const direction = this.gridOptionsService.get('fillHandleDirection');
        if (!direction) {
            return 'xy';
        }
        if (direction !== 'x' && direction !== 'y' && direction !== 'xy') {
            _.doOnce(() => console.warn(`AG Grid: valid values for fillHandleDirection are 'x', 'y' and 'xy'. Default to 'xy'.`), 'warn invalid fill direction');
            return 'xy';
        }
        return direction;
    }
    raiseFillStartEvent() {
        const fillStartEvent = {
            type: Events.EVENT_FILL_START
        };
        this.eventService.dispatchEvent(fillStartEvent);
    }
    raiseFillEndEvent(initialRange, finalRange) {
        const fillEndEvent = {
            type: Events.EVENT_FILL_END,
            initialRange: initialRange,
            finalRange: finalRange
        };
        this.eventService.dispatchEvent(fillEndEvent);
    }
    handleValueChanged(initialRange, finalRange, e) {
        const initialRangeEndRow = this.rangeService.getRangeEndRow(initialRange);
        const initialRangeStartRow = this.rangeService.getRangeStartRow(initialRange);
        const finalRangeEndRow = this.rangeService.getRangeEndRow(finalRange);
        const finalRangeStartRow = this.rangeService.getRangeStartRow(finalRange);
        const isVertical = this.dragAxis === 'y';
        // if the range is being reduced in size, all we need to do is
        // clear the cells that are no longer part of the range
        if (this.isReduce && !this.gridOptionsService.is('suppressClearOnFillReduction')) {
            const columns = isVertical
                ? initialRange.columns
                : initialRange.columns.filter(col => finalRange.columns.indexOf(col) < 0);
            const startRow = isVertical ? this.cellNavigationService.getRowBelow(finalRangeEndRow) : finalRangeStartRow;
            if (startRow) {
                this.clearCellsInRange(startRow, initialRangeEndRow, columns);
            }
            return;
        }
        let withinInitialRange = true;
        const values = [];
        const initialValues = [];
        let idx = 0;
        const resetValues = () => {
            values.length = 0;
            initialValues.length = 0;
            idx = 0;
        };
        const iterateAcrossCells = (column, columns) => {
            let currentRow = this.isUp ? initialRangeEndRow : initialRangeStartRow;
            let finished = false;
            if (isVertical) {
                withinInitialRange = true;
                resetValues();
            }
            while (!finished && currentRow) {
                const rowNode = this.rowPositionUtils.getRowNode(currentRow);
                if (!rowNode) {
                    break;
                }
                if (isVertical && column) {
                    fillValues(values, column, rowNode, () => {
                        return !this.rowPositionUtils.sameRow(currentRow, this.isUp ? initialRangeStartRow : initialRangeEndRow);
                    });
                }
                else if (columns) {
                    withinInitialRange = true;
                    resetValues();
                    columns.forEach(col => fillValues(values, col, rowNode, () => col !== (this.isLeft ? initialRange.columns[0] : _.last(initialRange.columns))));
                }
                finished = this.rowPositionUtils.sameRow(currentRow, this.isUp ? finalRangeStartRow : finalRangeEndRow);
                currentRow = this.isUp
                    ? this.cellNavigationService.getRowAbove(currentRow)
                    : this.cellNavigationService.getRowBelow(currentRow);
            }
        };
        const fillValues = (currentValues, col, rowNode, updateInitialSet) => {
            var _a, _b;
            let currentValue;
            let skipValue = false;
            if (withinInitialRange) {
                currentValue = this.valueService.getValue(col, rowNode);
                initialValues.push(currentValue);
                withinInitialRange = updateInitialSet();
            }
            else {
                const { value, fromUserFunction, sourceCol, sourceRowNode } = this.processValues(e, currentValues, initialValues, col, rowNode, idx++);
                currentValue = value;
                if (col.isCellEditable(rowNode)) {
                    const cellValue = this.valueService.getValue(col, rowNode);
                    if (!fromUserFunction) {
                        if ((_a = sourceCol === null || sourceCol === void 0 ? void 0 : sourceCol.getColDef()) === null || _a === void 0 ? void 0 : _a.useValueFormatterForExport) {
                            currentValue = (_b = this.valueFormatterService.formatValue(sourceCol, sourceRowNode, currentValue)) !== null && _b !== void 0 ? _b : currentValue;
                        }
                        if (col.getColDef().useValueParserForImport) {
                            currentValue = this.valueParserService.parseValue(col, rowNode, 
                            // if no sourceCol, then currentValue is a number
                            sourceCol ? currentValue : _.toStringOrNull(currentValue), cellValue);
                        }
                    }
                    if (!fromUserFunction || cellValue !== currentValue) {
                        rowNode.setDataValue(col, currentValue, 'rangeService');
                    }
                    else {
                        skipValue = true;
                    }
                }
            }
            if (!skipValue) {
                currentValues.push({
                    value: currentValue,
                    column: col,
                    rowNode
                });
            }
        };
        if (isVertical) {
            initialRange.columns.forEach(col => {
                iterateAcrossCells(col);
            });
        }
        else {
            const columns = this.isLeft ? [...finalRange.columns].reverse() : finalRange.columns;
            iterateAcrossCells(undefined, columns);
        }
    }
    clearCellsInRange(startRow, endRow, columns) {
        const cellRange = {
            startRow,
            endRow,
            columns,
            startColumn: columns[0]
        };
        this.rangeService.clearCellRangeCellValues({ cellRanges: [cellRange] });
    }
    processValues(event, values, initialValues, col, rowNode, idx) {
        const userFillOperation = this.gridOptionsService.getCallback('fillOperation');
        const isVertical = this.dragAxis === 'y';
        let direction;
        if (isVertical) {
            direction = this.isUp ? 'up' : 'down';
        }
        else {
            direction = this.isLeft ? 'left' : 'right';
        }
        if (userFillOperation) {
            const params = {
                event,
                values: values.map(({ value }) => value),
                initialValues,
                currentIndex: idx,
                currentCellValue: this.valueService.getValue(col, rowNode),
                direction,
                column: col,
                rowNode: rowNode
            };
            const userResult = userFillOperation(params);
            if (userResult !== false) {
                return { value: userResult, fromUserFunction: true };
            }
        }
        const allNumbers = !values.some(({ value }) => {
            const asFloat = parseFloat(value);
            return isNaN(asFloat) || asFloat.toString() !== value.toString();
        });
        // values should be copied in order if the alt key is pressed
        // or if the values contain strings and numbers
        // However, if we only have one initial value selected, and that
        // value is a number and we are also pressing alt, then we should
        // increment or decrement the value by 1 based on direction.
        if (event.altKey || !allNumbers) {
            if (allNumbers && initialValues.length === 1) {
                const multiplier = (this.isUp || this.isLeft) ? -1 : 1;
                return { value: parseFloat(_.last(values).value) + 1 * multiplier, fromUserFunction: false };
            }
            const { value, column: sourceCol, rowNode: sourceRowNode } = values[idx % values.length];
            return { value, fromUserFunction: false, sourceCol, sourceRowNode };
        }
        return { value: _.last(findLineByLeastSquares(values.map(({ value }) => Number(value)))), fromUserFunction: false };
    }
    clearValues() {
        this.clearMarkedPath();
        this.clearCellValues();
        this.lastCellMarked = undefined;
        super.clearValues();
    }
    clearMarkedPath() {
        this.markedCells.forEach(cell => {
            if (!cell.isAlive()) {
                return;
            }
            const comp = cell.getComp();
            comp.addOrRemoveCssClass('ag-selection-fill-top', false);
            comp.addOrRemoveCssClass('ag-selection-fill-right', false);
            comp.addOrRemoveCssClass('ag-selection-fill-bottom', false);
            comp.addOrRemoveCssClass('ag-selection-fill-left', false);
        });
        this.markedCells.length = 0;
        this.isUp = false;
        this.isLeft = false;
        this.isReduce = false;
    }
    clearCellValues() {
        this.cellValues.length = 0;
    }
    markPathFrom(initialPosition, currentPosition) {
        this.clearMarkedPath();
        this.clearCellValues();
        if (this.dragAxis === 'y') {
            if (this.rowPositionUtils.sameRow(currentPosition, initialPosition)) {
                return;
            }
            const isBefore = this.rowPositionUtils.before(currentPosition, initialPosition);
            const rangeStartRow = this.getRangeStartRow();
            const rangeEndRow = this.getRangeEndRow();
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
            const initialColumn = initialPosition.column;
            const currentColumn = currentPosition.column;
            if (initialColumn === currentColumn) {
                return;
            }
            const displayedColumns = this.columnModel.getAllDisplayedColumns();
            const initialIndex = displayedColumns.indexOf(initialColumn);
            const currentIndex = displayedColumns.indexOf(currentColumn);
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
    }
    extendVertical(initialPosition, endPosition, isMovingUp) {
        const { navigationService, rangeService } = this;
        let row = initialPosition;
        do {
            const cellRange = this.getCellRange();
            const colLen = cellRange.columns.length;
            for (let i = 0; i < colLen; i++) {
                const column = cellRange.columns[i];
                const rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                const cellPos = Object.assign(Object.assign({}, rowPos), { column });
                const cellInRange = rangeService.isCellInSpecificRange(cellPos, cellRange);
                const isInitialRow = this.rowPositionUtils.sameRow(row, initialPosition);
                if (isMovingUp) {
                    this.isUp = true;
                }
                if (!isInitialRow) {
                    const cell = navigationService.getCellByPosition(cellPos);
                    if (cell) {
                        this.markedCells.push(cell);
                        const cellCtrl = cell.getComp();
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
    }
    reduceVertical(initialPosition, endPosition) {
        let row = initialPosition;
        do {
            const cellRange = this.getCellRange();
            const colLen = cellRange.columns.length;
            const isLastRow = this.rowPositionUtils.sameRow(row, endPosition);
            for (let i = 0; i < colLen; i++) {
                const rowPos = { rowIndex: row.rowIndex, rowPinned: row.rowPinned };
                const celPos = Object.assign(Object.assign({}, rowPos), { column: cellRange.columns[i] });
                const cell = this.navigationService.getCellByPosition(celPos);
                if (cell) {
                    this.markedCells.push(cell);
                    const cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, endPosition));
                }
            }
            if (isLastRow) {
                break;
            }
            // tslint:disable-next-line
        } while (row = this.cellNavigationService.getRowAbove(row));
    }
    extendHorizontal(initialPosition, endPosition, isMovingLeft) {
        const allCols = this.columnModel.getAllDisplayedColumns();
        const startCol = allCols.indexOf(isMovingLeft ? endPosition.column : initialPosition.column);
        const endCol = allCols.indexOf(isMovingLeft ? this.getCellRange().columns[0] : endPosition.column);
        const offset = isMovingLeft ? 0 : 1;
        const colsToMark = allCols.slice(startCol + offset, endCol + offset);
        const rangeStartRow = this.getRangeStartRow();
        const rangeEndRow = this.getRangeEndRow();
        colsToMark.forEach(column => {
            let row = rangeStartRow;
            let isLastRow = false;
            do {
                isLastRow = this.rowPositionUtils.sameRow(row, rangeEndRow);
                const cell = this.navigationService.getCellByPosition({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cell) {
                    this.markedCells.push(cell);
                    const cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-top', this.rowPositionUtils.sameRow(row, rangeStartRow));
                    cellComp.addOrRemoveCssClass('ag-selection-fill-bottom', this.rowPositionUtils.sameRow(row, rangeEndRow));
                    if (isMovingLeft) {
                        this.isLeft = true;
                        cellComp.addOrRemoveCssClass('ag-selection-fill-left', column === colsToMark[0]);
                    }
                    else {
                        cellComp.addOrRemoveCssClass('ag-selection-fill-right', column === _.last(colsToMark));
                    }
                }
                row = this.cellNavigationService.getRowBelow(row);
            } while (!isLastRow);
        });
    }
    reduceHorizontal(initialPosition, endPosition) {
        const allCols = this.columnModel.getAllDisplayedColumns();
        const startCol = allCols.indexOf(endPosition.column);
        const endCol = allCols.indexOf(initialPosition.column);
        const colsToMark = allCols.slice(startCol, endCol);
        const rangeStartRow = this.getRangeStartRow();
        const rangeEndRow = this.getRangeEndRow();
        colsToMark.forEach(column => {
            let row = rangeStartRow;
            let isLastRow = false;
            do {
                isLastRow = this.rowPositionUtils.sameRow(row, rangeEndRow);
                const cell = this.navigationService.getCellByPosition({
                    rowIndex: row.rowIndex,
                    rowPinned: row.rowPinned,
                    column: column
                });
                if (cell) {
                    this.markedCells.push(cell);
                    const cellComp = cell.getComp();
                    cellComp.addOrRemoveCssClass('ag-selection-fill-right', column === colsToMark[0]);
                }
                row = this.cellNavigationService.getRowBelow(row);
            } while (!isLastRow);
        });
    }
    refresh(cellCtrl) {
        const cellRange = this.rangeService.getCellRanges()[0];
        const isColumnRange = !cellRange.startRow || !cellRange.endRow;
        if (isColumnRange) {
            this.destroy();
            return;
        }
        super.refresh(cellCtrl);
    }
}
FillHandle.TEMPLATE = `<div class="ag-fill-handle"></div>`;
__decorate$1([
    Autowired('valueService')
], FillHandle.prototype, "valueService", void 0);
__decorate$1([
    Autowired('valueParserService')
], FillHandle.prototype, "valueParserService", void 0);
__decorate$1([
    Autowired('valueFormatterService')
], FillHandle.prototype, "valueFormatterService", void 0);

class RangeHandle extends AbstractSelectionHandle {
    constructor() {
        super(RangeHandle.TEMPLATE);
        this.type = SelectionHandleType.RANGE;
        this.rangeFixed = false;
    }
    onDrag(e) {
        const lastCellHovered = this.getLastCellHovered();
        if (!lastCellHovered) {
            return;
        }
        const cellRanges = this.rangeService.getCellRanges();
        const lastRange = _.last(cellRanges);
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
        if (cellRanges.length === 2 && cellRanges[0].type === CellRangeType.DIMENSION && lastRange.type === CellRangeType.VALUE) {
            const rowChanged = !this.rowPositionUtils.sameRow(this.endPosition, this.rangeService.getRangeEndRow(lastRange));
            if (rowChanged) {
                // ensure the dimension range is kept in sync with the value range (which has the handle)
                this.rangeService.updateRangeEnd(cellRanges[0], Object.assign(Object.assign({}, this.endPosition), { column: cellRanges[0].columns[0] }), true);
            }
        }
        this.rangeService.extendLatestRangeToCell(this.endPosition);
    }
    onDragEnd(e) {
        const cellRange = _.last(this.rangeService.getCellRanges());
        this.fixRangeStartEnd(cellRange);
        this.rangeFixed = false;
    }
    fixRangeStartEnd(cellRange) {
        const startRow = this.rangeService.getRangeStartRow(cellRange);
        const endRow = this.rangeService.getRangeEndRow(cellRange);
        const column = cellRange.columns[0];
        cellRange.startRow = startRow;
        cellRange.endRow = endRow;
        cellRange.startColumn = column;
    }
}
RangeHandle.TEMPLATE = `<div class="ag-range-handle"></div>`;

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let SelectionHandleFactory = class SelectionHandleFactory extends BeanStub {
    createSelectionHandle(type) {
        return this.createBean(type === SelectionHandleType.RANGE ? new RangeHandle() : new FillHandle());
    }
};
SelectionHandleFactory = __decorate([
    Bean('selectionHandleFactory')
], SelectionHandleFactory);

// DO NOT UPDATE MANUALLY: Generated from script during build time
const VERSION = '30.0.0';

const RangeSelectionModule = {
    version: VERSION,
    moduleName: ModuleNames.RangeSelectionModule,
    beans: [RangeService, SelectionHandleFactory],
    agStackComponents: [
        { componentName: 'AgFillHandle', componentClass: FillHandle },
        { componentName: 'AgRangeHandle', componentClass: RangeHandle }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

export { RangeSelectionModule };
