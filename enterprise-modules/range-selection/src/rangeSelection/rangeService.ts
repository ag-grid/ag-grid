import {
    Autowired,
    Bean,
    CellNavigationService,
    CellPosition,
    CellPositionUtils,
    Column,
    ColumnModel,
    Events,
    IRangeService,
    IRowModel,
    CellRangeParams,
    PostConstruct,
    CellRange,
    RangeSelectionChangedEvent,
    RowPosition,
    RowPositionUtils,
    PinnedRowModel,
    BeanStub,
    CtrlsService,
    AutoScrollService,
    RowPinnedType,
    WithoutGridCommon,
    DragService,
    CellCtrl,
    _,
    ClearCellRangeParams,
    RangeDeleteStartEvent,
    RangeDeleteEndEvent,
    PartialCellRange,
    ValueService
} from "@ag-grid-community/core";

@Bean('rangeService')
export class RangeService extends BeanStub implements IRangeService {

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('dragService') private dragService: DragService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;
    @Autowired("pinnedRowModel") private pinnedRowModel: PinnedRowModel;
    @Autowired('rowPositionUtils') public rowPositionUtils: RowPositionUtils;
    @Autowired('cellPositionUtils') public cellPositionUtils: CellPositionUtils;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;
    @Autowired('valueService') private valueService: ValueService;

    private cellRanges: CellRange[] = [];
    private lastMouseEvent: MouseEvent | null;
    private bodyScrollListener = this.onBodyScroll.bind(this);

    private lastCellHovered: CellPosition | undefined;
    private cellHasChanged: boolean;

    // when a range is created, we mark the 'start cell' for further processing as follows:
    // 1) if dragging, then the new range is extended from the start position
    // 2) if user hits 'shift' click on a cell, the previous range is extended from the start position
    private newestRangeStartCell?: CellPosition;

    private dragging = false;
    private draggingRange?: CellRange;

    private intersectionRange = false; // When dragging ends, the current range will be used to intersect all other ranges

    public autoScrollService: AutoScrollService;

    @PostConstruct
    private init(): void {
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, this.onColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => this.removeAllCellRanges());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.removeAllCellRanges());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, () => this.removeAllCellRanges());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.refreshLastRangeStart.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PINNED, this.refreshLastRangeStart.bind(this));

        this.ctrlsService.whenReady((p) => {
            const gridBodyCtrl = p.gridBodyCtrl;
            this.autoScrollService = new AutoScrollService({
                scrollContainer: gridBodyCtrl.getBodyViewportElement()!,
                scrollAxis: 'xy',
                getVerticalPosition: () => gridBodyCtrl.getScrollFeature().getVScrollPosition().top,
                setVerticalPosition: (position) => gridBodyCtrl.getScrollFeature().setVerticalScrollPosition(position),
                getHorizontalPosition: () => gridBodyCtrl.getScrollFeature().getHScrollPosition().left,
                setHorizontalPosition: (position) => gridBodyCtrl.getScrollFeature().setHorizontalScrollPosition(position),
                shouldSkipVerticalScroll: () => !this.gos.isDomLayout('normal'),
                shouldSkipHorizontalScroll: () => !gridBodyCtrl.getScrollFeature().isHorizontalScrollShowing()
            });
        });
    }

    // Called for both columns loaded & column visibility events
    public onColumnsChanged(): void {
        // first move start column in last cell range (i.e. series chart range)
        this.refreshLastRangeStart();

        const allColumns = this.columnModel.getAllDisplayedColumns();

        // check that the columns in each range still exist and are visible
        this.cellRanges.forEach(cellRange => {
            const beforeCols = cellRange.columns;

            // remove hidden or removed cols from cell range
            cellRange.columns = cellRange.columns.filter(
                col => col.isVisible() && allColumns.indexOf(col) !== -1
            );

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

    public refreshLastRangeStart(): void {
        const lastRange = _.last(this.cellRanges);

        if (!lastRange) { return; }

        this.refreshRangeStart(lastRange);
    }

    public isContiguousRange(cellRange: CellRange): boolean {
        const rangeColumns = cellRange.columns;

        if (!rangeColumns.length) {
            return false;
        }

        const allColumns = this.columnModel.getAllDisplayedColumns();
        const allPositions = rangeColumns.map(c => allColumns.indexOf(c)).sort((a, b) => a - b);

        return _.last(allPositions) - allPositions[0] + 1 === rangeColumns.length;
    }

    public getRangeStartRow(cellRange: PartialCellRange): RowPosition {
        if (cellRange.startRow && cellRange.endRow) {
            return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ?
                cellRange.startRow : cellRange.endRow;
        }

        const rowPinned = this.pinnedRowModel.getPinnedTopRowCount() > 0 ? 'top' : null;

        return { rowIndex: 0, rowPinned };
    }

    public getRangeEndRow(cellRange: PartialCellRange): RowPosition {
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

    public setRangeToCell(cell: CellPosition, appendRange = false): void {
        if (!this.gos.get('enableRangeSelection')) { return; }

        const columns = this.calculateColumnsBetween(cell.column, cell.column);

        if (!columns) { return; }

        const suppressMultiRangeSelections = this.gos.get('suppressMultiRangeSelection');

        // if not appending, then clear previous range selections
        if (suppressMultiRangeSelections || !appendRange || _.missing(this.cellRanges)) {
            this.removeAllCellRanges(true);
        }

        const rowForCell: RowPosition = {
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

    public extendLatestRangeToCell(cellPosition: CellPosition): void {
        if (this.isEmpty() || !this.newestRangeStartCell) { return; }

        const cellRange = _.last(this.cellRanges);

        this.updateRangeEnd(cellRange, cellPosition);
    }

    public updateRangeEnd(cellRange: CellRange, cellPosition: CellPosition, silent = false): void {
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

    private refreshRangeStart(cellRange: CellRange) {
        const { startColumn, columns } = cellRange;

        const moveColInCellRange = (colToMove: Column, moveToFront: boolean) => {
            const otherCols = cellRange.columns.filter(col => col !== colToMove);

            if (colToMove) {
                cellRange.startColumn = colToMove;
                cellRange.columns = moveToFront ? [colToMove, ...otherCols] : [...otherCols, colToMove];
            } else {
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

    public getRangeEdgeColumns(cellRange: CellRange): { left: Column, right: Column; } {
        const allColumns = this.columnModel.getAllDisplayedColumns();
        const allIndices = cellRange.columns
            .map(c => allColumns.indexOf(c))
            .filter(i => i > -1)
            .sort((a, b) => a - b);

        return {
            left: allColumns[allIndices[0]],
            right: allColumns[_.last(allIndices)!]
        };
    }

    // returns true if successful, false if not successful
    public extendLatestRangeInDirection(event: KeyboardEvent): CellPosition | undefined {
        if (this.isEmpty() || !this.newestRangeStartCell) { return; }

        const key = event.key;
        const ctrlKey = event.ctrlKey || event.metaKey;

        const lastRange = _.last(this.cellRanges)!;
        const startCell = this.newestRangeStartCell;
        const firstCol = lastRange.columns[0];
        const lastCol = _.last(lastRange.columns)!;

        // find the cell that is at the furthest away corner from the starting cell
        const endCellIndex = lastRange.endRow!.rowIndex;
        const endCellFloating = lastRange.endRow!.rowPinned;
        const endCellColumn = startCell.column === firstCol ? lastCol : firstCol;

        const endCell: CellPosition = { column: endCellColumn, rowIndex: endCellIndex, rowPinned: endCellFloating };
        const newEndCell = this.cellNavigationService.getNextCellToFocus(key, endCell, ctrlKey);

        // if user is at end of grid, so no cell to extend to, we return false
        if (!newEndCell) { return; }

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

    public setCellRange(params: CellRangeParams): void {
        if (!this.gos.get('enableRangeSelection')) {
            return;
        }

        this.removeAllCellRanges(true);
        this.addCellRange(params);
    }

    public setCellRanges(cellRanges: CellRange[]): void {
        if (_.shallowCompare(this.cellRanges, cellRanges)) { return; }

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

    private setNewestRangeStartCell(position: CellPosition) {
        this.newestRangeStartCell = position;
    }

    public clearCellRangeCellValues(params: ClearCellRangeParams): void {
        let { cellRanges } = params;
        const {
            cellEventSource = 'rangeService',
            dispatchWrapperEvents,
            wrapperEventSource = 'deleteKey'
        } = params;

        if (dispatchWrapperEvents) {
            const startEvent: WithoutGridCommon<RangeDeleteStartEvent> = {
                type: Events.EVENT_RANGE_DELETE_START,
                source: wrapperEventSource
            };
            this.eventService.dispatchEvent(startEvent);
        }

        if (!cellRanges) { cellRanges = this.cellRanges; }

        cellRanges.forEach(cellRange => {
            this.forEachRowInRange(cellRange, rowPosition => {
                const rowNode = this.rowPositionUtils.getRowNode(rowPosition);
                if (!rowNode) { return; }
                for (let i = 0; i < cellRange.columns.length; i++) {
                    const column = this.columnModel.getGridColumn(cellRange.columns[i]);
                    if (!column || !column.isCellEditable(rowNode)) { continue; }
                    const emptyValue = this.valueService.parseValue(column, rowNode, '', rowNode.getValueFromValueService(column)) ?? null;
                    rowNode.setDataValue(column, emptyValue, cellEventSource);
                }
            });
        });

        if (dispatchWrapperEvents) {
            const endEvent: WithoutGridCommon<RangeDeleteEndEvent> = {
                type: Events.EVENT_RANGE_DELETE_END,
                source: wrapperEventSource
            };
            this.eventService.dispatchEvent(endEvent);
        }
    }

    public createCellRangeFromCellRangeParams(params: CellRangeParams): CellRange | undefined {
        return this.createPartialCellRangeFromRangeParams(params, false) as CellRange | undefined;
    }

    // Range service can't normally support a range without columns, but charts can
    public createPartialCellRangeFromRangeParams(params: CellRangeParams, allowEmptyColumns: boolean): PartialCellRange | undefined {
        let columns: Column[] | undefined;
        let startsOnTheRight: boolean = false;

        if (params.columns) {
            columns = params.columns.map(c => this.columnModel.getColumnWithValidation(c)!).filter(c => c);
        } else {
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

        if (!columns || (!allowEmptyColumns && columns.length === 0)) {
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

    public addCellRange(params: CellRangeParams): void {
        if (!this.gos.get('enableRangeSelection')) {
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

    public getCellRanges(): CellRange[] {
        return this.cellRanges;
    }

    public isEmpty(): boolean {
        return this.cellRanges.length === 0;
    }

    public isMoreThanOneCell(): boolean {
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

    public areAllRangesAbleToMerge(): boolean {
        const rowToColumnMap: Map<string, string[]> = new Map();
        const len = this.cellRanges.length;

        if (len <= 1) return true;

        this.cellRanges.forEach(range => {
            this.forEachRowInRange(range, row => {
                const rowName = `${row.rowPinned || 'normal'}_${row.rowIndex}`;
                const columns = rowToColumnMap.get(rowName);
                const currentRangeColIds = range.columns.map(col => col.getId());
                if (columns) {
                    const filteredColumns = currentRangeColIds.filter(col => columns.indexOf(col) === -1);
                    columns.push(...filteredColumns)
                } else {
                    rowToColumnMap.set(rowName, currentRangeColIds);
                }
            });
        });

        let columnsString: string | undefined;

        for (const val of rowToColumnMap.values()) {
            const currentValString = val.sort().join();
            if (columnsString === undefined) {
                columnsString = currentValString;
                continue;
            }
            if (columnsString !== currentValString) { return false; }
        }

        return true;
    }

    private forEachRowInRange(cellRange: CellRange, callback: (row: RowPosition) => void) {
        const topRow = this.getRangeStartRow(cellRange);
        const bottomRow = this.getRangeEndRow(cellRange);
        let currentRow: RowPosition | null = topRow;
        
        while (currentRow) {
            callback(currentRow);

            if (this.rowPositionUtils.sameRow(currentRow, bottomRow)) { break; }
            currentRow = this.cellNavigationService.getRowBelow(currentRow);
        }
    }

    public removeAllCellRanges(silent?: boolean): void {
        if (this.isEmpty()) { return; }

        this.onDragStop();
        this.cellRanges.length = 0;

        if (!silent) {
            this.dispatchChangedEvent(false, true);
        }
    }

    // as the user is dragging outside of the panel, the div starts to scroll, which in turn
    // means we are selection more (or less) cells, but the mouse isn't moving, so we recalculate
    // the selection my mimicking a new mouse event
    private onBodyScroll(): void {
        if (this.dragging && this.lastMouseEvent) {
            this.onDragging(this.lastMouseEvent);
        }
    }

    public isCellInAnyRange(cell: CellPosition): boolean {
        return this.getCellRangeCount(cell) > 0;
    }

    public isCellInSpecificRange(cell: CellPosition, range: CellRange): boolean {
        const columnInRange = range.columns !== null && _.includes(range.columns, cell.column);
        const rowInRange = this.isRowInRange(cell.rowIndex, cell.rowPinned, range);

        return columnInRange && rowInRange;
    }

    private isLastCellOfRange(cellRange: CellRange, cell: CellPosition): boolean {
        const { startRow, endRow } = cellRange;
        const lastRow = this.rowPositionUtils.before(startRow!, endRow!) ? endRow : startRow;
        const isLastRow = cell.rowIndex === lastRow!.rowIndex && cell.rowPinned === lastRow!.rowPinned;
        const rangeFirstIndexColumn = cellRange.columns[0];
        const rangeLastIndexColumn = _.last(cellRange.columns);
        const lastRangeColumn = cellRange.startColumn === rangeFirstIndexColumn ? rangeLastIndexColumn : rangeFirstIndexColumn;
        const isLastColumn = cell.column === lastRangeColumn;

        return isLastColumn && isLastRow;
    }

    public isBottomRightCell(cellRange: CellRange, cell: CellPosition): boolean {
        const allColumns = this.columnModel.getAllDisplayedColumns();
        const allPositions = cellRange.columns.map(c => allColumns.indexOf(c)).sort((a, b) => a - b);
        const { startRow, endRow } = cellRange;
        const lastRow = this.rowPositionUtils.before(startRow!, endRow!) ? endRow : startRow;

        const isRightColumn = allColumns.indexOf(cell.column) === _.last(allPositions);
        const isLastRow = cell.rowIndex === lastRow!.rowIndex && _.makeNull(cell.rowPinned) === _.makeNull(lastRow!.rowPinned);

        return isRightColumn && isLastRow;
    }

    // returns the number of ranges this cell is in
    public getCellRangeCount(cell: CellPosition): number {
        if (this.isEmpty()) {
            return 0;
        }

        return this.cellRanges.filter(cellRange => this.isCellInSpecificRange(cell, cellRange)).length;
    }

    private isRowInRange(rowIndex: number, floating: RowPinnedType, cellRange: CellRange): boolean {
        const firstRow = this.getRangeStartRow(cellRange);
        const lastRow = this.getRangeEndRow(cellRange);
        const thisRow: RowPosition = { rowIndex, rowPinned: floating || null };

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

    public getDraggingRange(): CellRange | undefined {
        return this.draggingRange;
    }

    public onDragStart(mouseEvent: MouseEvent): void {
        if (!this.gos.get('enableRangeSelection')) { return; }

        const { ctrlKey, metaKey, shiftKey } = mouseEvent;

        // ctrlKey for windows, metaKey for Apple
        const isMultiKey = ctrlKey || metaKey;
        const allowMulti = !this.gos.get('suppressMultiRangeSelection');
        const isMultiSelect = allowMulti ? isMultiKey : false;
        const extendRange = shiftKey && _.existsAndNotEmpty(this.cellRanges);

        if (!isMultiSelect && (!extendRange || _.exists(_.last(this.cellRanges)!.type))) {
            this.removeAllCellRanges(true);
        }

        // The browser changes the Event target of cached events when working with the ShadowDOM
        // so we need to retrieve the initial DragStartTarget.
        const startTarget = this.dragService.getStartTarget();

        if (startTarget) {
            this.updateValuesOnMove(startTarget);
        }

        if (!this.lastCellHovered) { return; }

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
        } else {
            const mouseRowPosition: RowPosition = {
                rowIndex: this.lastCellHovered.rowIndex,
                rowPinned: this.lastCellHovered.rowPinned
            };

            this.draggingRange = {
                startRow: mouseRowPosition,
                endRow: mouseRowPosition,
                columns: [this.lastCellHovered.column],
                startColumn: this.newestRangeStartCell!.column
            };

            this.cellRanges.push(this.draggingRange);
        }

        this.ctrlsService.getGridBodyCtrl().addScrollEventListener(this.bodyScrollListener);

        this.dispatchChangedEvent(true, false, this.draggingRange.id);
    }

    public intersectLastRange(fromMouseClick?: boolean) {
        // when ranges are created due to a mouse click without drag (happens in cellMouseListener)
        // this method will be called with `fromMouseClick=true`.
        if (fromMouseClick && this.dragging) { return; }
        if (this.gos.get('suppressMultiRangeSelection')) { return; }
        if (this.isEmpty()) { return; }
        const rowPosUtils = this.rowPositionUtils;
        const lastRange = _.last(this.cellRanges);
        
        const intersectionStartRow = this.getRangeStartRow(lastRange);
        const intersectionEndRow = this.getRangeEndRow(lastRange);

        const newRanges: CellRange[] = []

        this.cellRanges.slice(0, -1).forEach((range) => {
            const startRow = this.getRangeStartRow(range);
            const endRow = this.getRangeEndRow(range);
            const cols = range.columns
            const intersectCols = cols.filter((col) => lastRange.columns.indexOf(col) === -1);
            if (intersectCols.length === cols.length) {
                // No overlapping columns, retain previous range
                newRanges.push(range);
                return;
            }
            if (rowPosUtils.before(intersectionEndRow, startRow) || rowPosUtils.before(endRow, intersectionStartRow)) {
                // No overlapping rows, retain previous range
                newRanges.push(range);
                return;
            }
            const rangeCountBefore =  newRanges.length;
            // Top
            if (rowPosUtils.before(startRow, intersectionStartRow)) {
                const top: CellRange = {
                    columns: [...cols],
                    startColumn: lastRange.startColumn,
                    startRow: { ...startRow },
                    endRow: this.cellNavigationService.getRowAbove(intersectionStartRow)!,
                };
                newRanges.push(top);
            }
            // Left & Right (not contiguous with columns)
            if (intersectCols.length > 0) {
                const middle: CellRange = {
                    columns: intersectCols,
                    startColumn: _.includes(intersectCols, lastRange.startColumn) ? lastRange.startColumn : intersectCols[0],
                    startRow: this.rowMax([{ ...intersectionStartRow }, { ...startRow }]),
                    endRow: this.rowMin([{ ...intersectionEndRow }, { ...endRow }]),
                };
                newRanges.push(middle);
            }
            // Bottom
            if (rowPosUtils.before(intersectionEndRow, endRow)) {
                newRanges.push({
                    columns: [...cols],
                    startColumn: lastRange.startColumn,
                    startRow: this.cellNavigationService.getRowBelow(intersectionEndRow)!,
                    endRow: { ...endRow },
                });
            }
            if ((newRanges.length - rangeCountBefore) === 1) {
                // Only one range result from the intersection.
                // Copy the source range's id, since essentially we just reduced it's size
                newRanges[newRanges.length -1].id = range.id;
            }
        });
        this.cellRanges = newRanges;

        // when this is called because of a clickEvent and the ranges were changed
        // we need to force a dragEnd event to update the UI.
        if (fromMouseClick) {
            this.dispatchChangedEvent(false, true);
        }
    }

    private rowMax(rows: RowPosition[]): RowPosition | undefined {
        let max: RowPosition | undefined;
        rows.forEach((row) => {
            if (max === undefined || this.rowPositionUtils.before(max, row)) {
                max = row;
            }
        });
        return max;
    }

    private rowMin(rows: RowPosition[]): RowPosition | undefined {
        let min: RowPosition | undefined;
        rows.forEach((row) => {
            if (min === undefined || this.rowPositionUtils.before(row, min)) {
                min = row;
            }
        });
        return min;
    }
    
    private updateValuesOnMove(eventTarget: EventTarget | null) {
        const cellCtrl = _.getCtrlForEventTarget<CellCtrl>(this.gos, eventTarget, CellCtrl.DOM_DATA_KEY_CELL_CTRL);
        const cell = cellCtrl?.getCellPosition();

        this.cellHasChanged = false;

        if (!cell || (this.lastCellHovered && this.cellPositionUtils.equals(cell, this.lastCellHovered))) { return; }

        if (this.lastCellHovered) {
            this.cellHasChanged = true;
        }

        this.lastCellHovered = cell;
    }

    public onDragging(mouseEvent: MouseEvent | null): void {
        if (!this.dragging || !mouseEvent) { return; }

        this.updateValuesOnMove(mouseEvent.target);

        this.lastMouseEvent = mouseEvent;

        const cellPosition = this.lastCellHovered!;
        const isMouseAndStartInPinned = (position: string) =>
            cellPosition && cellPosition.rowPinned === position && this.newestRangeStartCell!.rowPinned === position;

        const skipVerticalScroll = isMouseAndStartInPinned('top') || isMouseAndStartInPinned('bottom');

        this.autoScrollService.check(mouseEvent, skipVerticalScroll!);

        if (!this.cellHasChanged) { return; }

        const columns = this.calculateColumnsBetween(this.newestRangeStartCell!.column, cellPosition.column);

        if (!columns) { return; }

        this.draggingRange!.endRow = {
            rowIndex: cellPosition.rowIndex,
            rowPinned: cellPosition.rowPinned
        };

        this.draggingRange!.columns = columns;

        this.dispatchChangedEvent(false, false, this.draggingRange!.id);
    }

    public onDragStop(): void {
        if (!this.dragging) { return; }

        const { id } = this.draggingRange!;

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

    private dispatchChangedEvent(started: boolean, finished: boolean, id?: string): void {
        const event: WithoutGridCommon<RangeSelectionChangedEvent> = {
            type: Events.EVENT_RANGE_SELECTION_CHANGED,
            started,
            finished,
            id,
        };

        this.eventService.dispatchEvent(event);
    }

    private calculateColumnsBetween(columnFrom: Column, columnTo: Column): Column[] | undefined {
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
        const columns: Column[] = [];

        for (let i = firstIndex; i <= lastIndex; i++) {
            columns.push(allColumns[i]);
        }

        return columns;
    }
}
