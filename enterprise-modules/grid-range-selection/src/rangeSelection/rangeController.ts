import {
    Autowired,
    Bean,
    CellNavigationService,
    CellPosition,
    CellPositionUtils,
    Column,
    ColumnApi,
    ColumnController,
    Constants,
    Events,
    EventService,
    GridApi,
    GridOptionsWrapper,
    GridPanel,
    IRangeController,
    IRowModel,
    Logger,
    LoggerFactory,
    CellRangeParams,
    MouseEventService,
    PostConstruct,
    CellRange,
    RangeSelectionChangedEvent,
    RowPosition,
    RowPositionUtils,
    PinnedRowModel,
    _,
} from "@ag-grid-community/core";

@Bean('rangeController')
export class RangeController implements IRangeController {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;
    @Autowired("pinnedRowModel") private pinnedRowModel: PinnedRowModel;
    @Autowired('rowPositionUtils') public rowPositionUtils: RowPositionUtils;
    @Autowired('cellPositionUtils') public cellPositionUtils: CellPositionUtils;

    private logger: Logger;
    private gridPanel: GridPanel;
    private cellRanges: CellRange[] = [];
    private lastMouseEvent: MouseEvent | null;
    private bodyScrollListener = this.onBodyScroll.bind(this);

    // when a range is created, we mark the 'start cell' for further processing as follows:
    // 1) if dragging, then the new range is extended from the start position
    // 2) if user hits 'shift' click on a cell, the previous range is extended from the start position
    private newestRangeStartCell?: CellPosition;

    private dragging = false;
    private draggingCell?: CellPosition;
    private draggingRange?: CellRange;

    public autoScrollService: AutoScrollService;

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
        this.autoScrollService = new AutoScrollService(this.gridPanel, this.gridOptionsWrapper);
    }

    @PostConstruct
    private init(): void {
        this.logger = this.loggerFactory.create('RangeController');

        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.removeAllCellRanges.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.removeAllCellRanges.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.removeAllCellRanges.bind(this));

        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.refreshLastRangeStart.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.refreshLastRangeStart.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.refreshLastRangeStart.bind(this));

        this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.onColumnVisibleChange.bind(this));
    }

    public onColumnVisibleChange(): void {
        // first move start column in last cell range (i.e. series chart range)
        this.refreshLastRangeStart();

        // then check if the column visibility has changed in any cell range
        this.cellRanges.forEach(cellRange => {
            const beforeCols = cellRange.columns;

            // remove hidden cols from cell range
            cellRange.columns = cellRange.columns.filter(col => col.isVisible());

            const colsInRangeChanged = !_.compareArrays(beforeCols, cellRange.columns);

            if (colsInRangeChanged) {
                // notify users and other parts of grid (i.e. status panel) that range has changed
                this.dispatchChangedEvent(false, true, cellRange.id);
            }
        });
    }

    public refreshLastRangeStart(): void {
        const lastRange = _.last(this.cellRanges);

        if (!lastRange) {
            return;
        }

        this.refreshRangeStart(lastRange);
    }

    public isContiguousRange(cellRange: CellRange): boolean {
        const rangeColumns = cellRange.columns;

        if (!rangeColumns.length) {
            return false;
        }

        const allColumns = this.columnController.getAllDisplayedColumns();
        const allPositions = rangeColumns.map(c => allColumns.indexOf(c)).sort((a, b) => a - b);

        return _.last(allPositions) - allPositions[0] + 1 === rangeColumns.length;
    }

    public getRangeStartRow(cellRange: CellRange): RowPosition {
        if (cellRange.startRow && cellRange.endRow) {
            return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ?
                cellRange.startRow : cellRange.endRow;
        }

        const rowPinned = this.pinnedRowModel.getPinnedTopRowCount() > 0 ? Constants.PINNED_TOP : undefined;

        return { rowIndex: 0, rowPinned };
    }

    public getRangeEndRow(cellRange: CellRange): RowPosition {
        if (cellRange.startRow && cellRange.endRow) {
            return this.rowPositionUtils.before(cellRange.startRow, cellRange.endRow) ?
                cellRange.endRow : cellRange.startRow;
        }

        const pinnedBottomRowCount = this.pinnedRowModel.getPinnedBottomRowCount();
        const pinnedBottom = pinnedBottomRowCount > 0;

        if (pinnedBottom) {
            return {
                rowIndex: pinnedBottomRowCount - 1,
                rowPinned: Constants.PINNED_BOTTOM
            };
        }

        return {
            rowIndex: this.rowModel.getRowCount() - 1,
            rowPinned: undefined
        };
    }

    public setRangeToCell(cell: CellPosition, appendRange = false): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        const columns = this.calculateColumnsBetween(cell.column, cell.column);

        if (!columns) {
            return;
        }

        const suppressMultiRangeSelections = this.gridOptionsWrapper.isSuppressMultiRangeSelection();

        // if not appending, then clear previous range selections
        if (suppressMultiRangeSelections || !appendRange || _.missing(this.cellRanges)) {
            this.removeAllCellRanges(true);
        }

        const rowForCell: RowPosition = {
            rowIndex: cell.rowIndex,
            rowPinned: cell.rowPinned
        };

        // if there is already a range for this cell, then we reuse the same range, otherwise the user
        // can ctrl & click a cell many times and hit ctrl+c, which would result in the cell getting copied
        // many times to the clipboard.
        let cellRange: CellRange;

        for (let i = 0; i < this.cellRanges.length; i++) {
            const range = this.cellRanges[i];
            const matches =
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
            const atEndOfList = _.last(this.cellRanges) === cellRange;

            if (!atEndOfList) {
                _.removeFromArray(this.cellRanges, cellRange);
                this.cellRanges.push(cellRange);
            }
        } else {
            cellRange = {
                startRow: rowForCell,
                endRow: rowForCell,
                columns,
                startColumn: cell.column
            };

            this.cellRanges.push(cellRange);
        }

        this.newestRangeStartCell = cell;
        this.onDragStop();
        this.dispatchChangedEvent(false, true, cellRange.id);
    }

    public extendLatestRangeToCell(cellPosition: CellPosition): void {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }

        const cellRange = _.last(this.cellRanges);

        this.updateRangeEnd(cellRange, cellPosition);
    }

    public updateRangeEnd(cellRange: CellRange, cellPosition: CellPosition, silent?: boolean) {
        const endColumn = cellPosition.column;
        const colsToAdd = this.calculateColumnsBetween(cellRange.startColumn, endColumn);

        if (!colsToAdd) {
            return;
        }

        cellRange.columns = colsToAdd;
        cellRange.endRow = { rowIndex: cellPosition.rowIndex, rowPinned: cellPosition.rowPinned };

        if (!silent) {
            this.dispatchChangedEvent(false, true, cellRange.id);
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

    public getRangeEdgeColumns(cellRange: CellRange): { left: Column, right: Column } {
        const allColumns = this.columnController.getAllDisplayedColumns();
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
    public extendLatestRangeInDirection(key: number): CellPosition | undefined {
        if (this.isEmpty() || !this.newestRangeStartCell) {
            return;
        }

        const lastRange = _.last(this.cellRanges)!;
        const startCell = this.newestRangeStartCell;
        const firstCol = lastRange.columns[0];
        const lastCol = _.last(lastRange.columns)!;

        // find the cell that is at the furthest away corner from the starting cell
        const endCellIndex = lastRange.endRow!.rowIndex;
        const endCellFloating = lastRange.endRow!.rowPinned;
        const endCellColumn = startCell.column === firstCol ? lastCol : firstCol;

        const endCell: CellPosition = { column: endCellColumn, rowIndex: endCellIndex, rowPinned: endCellFloating };
        const newEndCell = this.cellNavigationService.getNextCellToFocus(key, endCell);

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

    public setCellRange(params: CellRangeParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        this.removeAllCellRanges(true);
        this.addCellRange(params);
    }

    public setCellRanges(cellRanges: CellRange[]): void {
        this.removeAllCellRanges(true);

        cellRanges.forEach(newRange => {
            if (newRange.columns && newRange.startRow) {
                this.newestRangeStartCell = {
                    rowIndex: newRange.startRow.rowIndex,
                    rowPinned: newRange.startRow.rowPinned,
                    column: newRange.columns[0]
                };
            }

            this.cellRanges.push(newRange);
        });

        this.dispatchChangedEvent(false, true);
    }

    public createCellRangeFromCellRangeParams(params: CellRangeParams): CellRange | undefined {
        let columns: Column[] | undefined;

        if (params.columns) {
            columns = params.columns.map(c => this.columnController.getColumnWithValidation(c)).filter(c => c);
        } else {
            const columnStart = this.columnController.getColumnWithValidation(params.columnStart);
            const columnEnd = this.columnController.getColumnWithValidation(params.columnEnd);

            if (!columnStart || !columnEnd) {
                return;
            }

            columns = this.calculateColumnsBetween(columnStart, columnEnd);
        }

        if (!columns) {
            return;
        }

        const startRow = params.rowStartIndex != null ? {
            rowIndex: params.rowStartIndex,
            rowPinned: params.rowStartPinned
        } : undefined;

        const endRow = params.rowEndIndex != null ? {
            rowIndex: params.rowEndIndex,
            rowPinned: params.rowEndPinned
        } : undefined;

        return {
            startRow,
            endRow,
            columns,
            startColumn: columns[0]
        };
    }

    public addCellRange(params: CellRangeParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        const newRange = this.createCellRangeFromCellRangeParams(params);

        if (newRange) {
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
        if (this.cellRanges.length === 0) {
            // no ranges, so not more than one cell
            return false;
        } else if (this.cellRanges.length > 1) {
            // many ranges, so more than one cell
            return true;
        }

        // only one range, return true if range has more than one
        const range = this.cellRanges[0];
        const startRow = this.getRangeStartRow(range);
        const endRow = this.getRangeEndRow(range);

        return startRow.rowPinned !== endRow.rowPinned ||
            startRow.rowIndex !== endRow.rowIndex ||
            range.columns.length !== 1;
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
        this.onDragging(this.lastMouseEvent);
    }

    public isCellInAnyRange(cell: CellPosition): boolean {
        return this.getCellRangeCount(cell) > 0;
    }

    public isCellInSpecificRange(cell: CellPosition, range: CellRange): boolean {
        const columnInRange = range.columns !== null && _.includes(range.columns, cell.column);
        const rowInRange = this.isRowInRange(cell.rowIndex, cell.rowPinned, range);

        return columnInRange && rowInRange;
    }

    public isLastCellOfRange(cellRange: CellRange, cell: CellPosition) {
        const allColumns = this.columnController.getAllDisplayedColumns();
        const allPositions = cellRange.columns.map(c => allColumns.indexOf(c)).sort((a, b) => a - b);
        const { startRow, endRow } = cellRange;
        const lastRow = this.rowPositionUtils.before(startRow, endRow) ? endRow : startRow;
        const isLastColumn = allColumns.indexOf(cell.column) === _.last(allPositions)
        const isLastRow = cell.rowIndex === lastRow.rowIndex && cell.rowPinned === lastRow.rowPinned;

        return isLastColumn && isLastRow;
    }

    // returns the number of ranges this cell is in
    public getCellRangeCount(cell: CellPosition): number {
        if (this.isEmpty()) {
            return 0;
        }

        return this.cellRanges.filter(cellRange => this.isCellInSpecificRange(cell, cellRange)).length;
    }

    private isRowInRange(rowIndex: number, floating: string | undefined, cellRange: CellRange): boolean {
        const firstRow = this.getRangeStartRow(cellRange);
        const lastRow = this.getRangeEndRow(cellRange);
        const thisRow: RowPosition = { rowIndex, rowPinned: floating };

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
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        const { ctrlKey, metaKey, shiftKey } = mouseEvent;

        // ctrlKey for windows, metaKey for Apple
        const multiKeyPressed = ctrlKey || metaKey;
        const allowMulti = !this.gridOptionsWrapper.isSuppressMultiRangeSelection();
        const multiSelectKeyPressed = allowMulti ? multiKeyPressed : false;
        const mouseCell = this.mouseEventService.getCellPositionForEvent(mouseEvent);

        if (_.missing(mouseCell)) {
            // if drag wasn't on cell, then do nothing, including do not set dragging=true,
            // (which them means onDragging and onDragStop do nothing)
            return;
        }

        if (!multiSelectKeyPressed && (!shiftKey || _.exists(_.last(this.cellRanges)!.type))) {
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
            this.draggingRange = _.last(this.cellRanges);
        } else {
            const mouseRowPosition: RowPosition = {
                rowIndex: mouseCell.rowIndex,
                rowPinned: mouseCell.rowPinned
            };

            this.draggingRange = {
                startRow: mouseRowPosition,
                endRow: mouseRowPosition,
                columns: [mouseCell.column],
                startColumn: this.newestRangeStartCell!.column
            };

            this.cellRanges.push(this.draggingRange);
        }

        this.gridPanel.addScrollEventListener(this.bodyScrollListener);

        this.dispatchChangedEvent(true, false, this.draggingRange.id);
    }

    public onDragging(mouseEvent: MouseEvent | null): void {
        if (!this.dragging || !mouseEvent) {
            return;
        }

        this.lastMouseEvent = mouseEvent;

        const cellPosition = this.mouseEventService.getCellPositionForEvent(mouseEvent);
        const isMouseAndStartInPinned = (position: string) =>
            cellPosition && cellPosition.rowPinned === position && this.newestRangeStartCell!.rowPinned === position;

        const skipVerticalScroll = isMouseAndStartInPinned('top') || isMouseAndStartInPinned('bottom');

        this.autoScrollService.check(mouseEvent, skipVerticalScroll);

        if (
            !cellPosition ||
            !this.draggingCell ||
            this.cellPositionUtils.equals(this.draggingCell, cellPosition)
        ) {
            return;
        }

        const columns = this.calculateColumnsBetween(this.newestRangeStartCell!.column, cellPosition.column);

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
    }

    public onDragStop(): void {
        if (!this.dragging) {
            return;
        }

        const { id } = this.draggingRange;

        this.autoScrollService.ensureCleared();

        this.gridPanel.removeScrollEventListener(this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
        this.draggingRange = undefined;
        this.draggingCell = undefined;

        this.dispatchChangedEvent(false, true, id);
    }

    private dispatchChangedEvent(started: boolean, finished: boolean, id?: string): void {
        const event: RangeSelectionChangedEvent = Object.freeze({
            type: Events.EVENT_RANGE_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            started,
            finished,
            id,
        });

        this.eventService.dispatchEvent(event);
    }

    private calculateColumnsBetween(columnFrom: Column, columnTo: Column): Column[] | undefined {
        const allColumns = this.columnController.getAllDisplayedColumns();
        const isSameColumn = columnFrom === columnTo;
        const fromIndex = allColumns.indexOf(columnFrom);

        if (fromIndex < 0) {
            console.warn(`ag-Grid: column ${columnFrom.getId()} is not visible`);
            return undefined;
        }

        const toIndex = isSameColumn ? fromIndex : allColumns.indexOf(columnTo);

        if (toIndex < 0) {
            console.warn(`ag-Grid: column ${columnTo.getId()} is not visible`);
            return undefined;
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

class AutoScrollService {

    private tickingInterval: number | null = null;

    private tickLeft: boolean;
    private tickRight: boolean;
    private tickUp: boolean;
    private tickDown: boolean;

    private gridPanel: GridPanel;
    private gridOptionsWrapper: GridOptionsWrapper;

    private tickCount: number;

    constructor(gridPanel: GridPanel, gridOptionsWrapper: GridOptionsWrapper) {
        this.gridPanel = gridPanel;
        this.gridOptionsWrapper = gridOptionsWrapper;
    }

    public check(mouseEvent: MouseEvent, skipVerticalScroll: boolean = false): void {
        const rect: ClientRect = this.gridPanel.getBodyClientRect();
        skipVerticalScroll = skipVerticalScroll || this.gridOptionsWrapper.getDomLayout() !== Constants.DOM_LAYOUT_NORMAL;

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
        } else {
            this.ensureCleared();
        }
    }

    private ensureTickingStarted(): void {
        if (this.tickingInterval === null) {
            this.tickingInterval = window.setInterval(this.doTick.bind(this), 100);
            this.tickCount = 0;
        }
    }

    private doTick(): void {
        this.tickCount++;

        const vScrollPosition = this.gridPanel.getVScrollPosition();
        const hScrollPosition = this.gridPanel.getHScrollPosition();

        let tickAmount: number;

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
    }

    public ensureCleared(): void {
        if (this.tickingInterval) {
            window.clearInterval(this.tickingInterval);
            this.tickingInterval = null;
        }
    }
}
