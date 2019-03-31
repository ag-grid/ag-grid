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
    FocusedCellController,
    GridApi,
    GridOptionsWrapper,
    GridPanel,
    IRangeController,
    IRowModel,
    Logger,
    LoggerFactory,
    AddCellRangeParams,
    MouseEventService,
    PostConstruct,
    CellRange,
    RangeSelectionChangedEvent,
    RowRenderer,
    RowPosition,
    RowPositionUtils,
    PinnedRowModel,
    _
} from "ag-grid-community";

@Bean('rangeController')
export class RangeController implements IRangeController {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('cellNavigationService') private cellNavigationService: CellNavigationService;
    @Autowired("pinnedRowModel") private pinnedRowModel: PinnedRowModel;

    private logger: Logger;

    private gridPanel: GridPanel;

    private cellRanges: CellRange[] = [];

    private lastMouseEvent: MouseEvent | null;

    private bodyScrollListener = this.onBodyScroll.bind(this);

    // when a range is created, we mark the 'start cell' for further processing as follows:
    // 1) if dragging, then the new range is extended from the start position
    // 2) if user hits 'shift' click on a cell, the previous range is extended from the start position
    private newestRangeStartCell: CellPosition | undefined;

    private dragging = false;
    private draggingCell: CellPosition | undefined;
    private draggingRange: CellRange | undefined;

    private autoScrollService: AutoScrollService;

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
        this.autoScrollService = new AutoScrollService(this.gridPanel, this.gridOptionsWrapper);
    }

    @PostConstruct
    private init(): void {
        this.logger = this.loggerFactory.create('RangeController');

        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearSelection.bind(this));
    }

    public getRangeStartRow(cellRange: CellRange): RowPosition {
        if (cellRange.startRow && cellRange.endRow) {
            const startRowIsFirst = RowPositionUtils.before(cellRange.startRow, cellRange.endRow);
            return startRowIsFirst ? cellRange.startRow : cellRange.endRow;
        } else {
            const pinned = (this.pinnedRowModel.getPinnedTopRowCount() > 0) ? Constants.PINNED_TOP : undefined;
            return {rowIndex: 0, rowPinned: pinned} as RowPosition;
        }
    }

    public getRangeEndRow(cellRange: CellRange): RowPosition {
        if (cellRange.startRow && cellRange.endRow) {
            const startRowIsFirst = RowPositionUtils.before(cellRange.startRow, cellRange.endRow);
            return startRowIsFirst ? cellRange.endRow : cellRange.startRow;
        } else {
            const pinnedBottomRowCount = this.pinnedRowModel.getPinnedBottomRowCount();
            const pinnedBottom = pinnedBottomRowCount > 0;
            if (pinnedBottom) {
                return {
                    rowIndex: pinnedBottomRowCount - 1,
                    rowPinned: Constants.PINNED_BOTTOM
                } as RowPosition;
            } else {
                return {
                    rowIndex: this.rowModel.getRowCount() - 1,
                    rowPinned: undefined
                } as RowPosition;
            }
        }
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
            this.cellRanges.length = 0;
        }

        const rowForCell: RowPosition = {rowPinned: cell.rowPinned, rowIndex: cell.rowIndex};

        // if there is already a range for this cell, then we reuse the same range, otherwise the user
        // can ctrl & click a cell many times and hit ctrl+c, which would result in the cell getting copied
        // many times to the clipboard.
        let existingRange: CellRange | undefined;
        this.cellRanges.forEach( range => {
            const matches
                // check cols are same
                = (range.columns && range.columns.length===1 && range.columns[0]===cell.column)
                // check rows are same
                && RowPositionUtils.sameRow(rowForCell, range.startRow)
                && RowPositionUtils.sameRow(rowForCell, range.endRow);
            if (matches) {
                existingRange = range;
            }
        });

        if (existingRange) {
            // we need it at the end of the list, as the dragStart picks the last created
            // range as the start point for the drag
            const atEndOfList = this.cellRanges[this.cellRanges.length-1]===existingRange;
            if (!atEndOfList) {
                _.removeFromArray(this.cellRanges, existingRange);
                this.cellRanges.push(existingRange);
            }
        } else {
            const newRange: CellRange = {
                startRow: rowForCell,
                endRow: rowForCell,
                columns: columns
            };
            this.cellRanges.push(newRange);
        }

        this.newestRangeStartCell = cell;
        this.onDragStop();
        this.dispatchChangedEvent(true, false);
    }

    public extendLatestRangeToCell(toCell: CellPosition): void {
        if (this.isEmpty()) { return; }
        if (!this.newestRangeStartCell) { return; }

        const startCell = this.newestRangeStartCell;

        this.setCellRange({
            rowStartIndex: startCell.rowIndex,
            rowStartPinned: startCell.rowPinned,
            rowEndIndex: toCell.rowIndex,
            rowEndPinned: toCell.rowPinned,
            columnStart: startCell.column,
            columnEnd: toCell.column
        });
    }

    // returns true if successful, false if not successful
    public extendLatestRangeInDirection(key: number): CellPosition | undefined {
        if (this.isEmpty()) { return; }
        if (!this.newestRangeStartCell) { return; }

        const lastRange = this.cellRanges![this.cellRanges!.length - 1];

        const startCell = this.newestRangeStartCell;

        const firstCol = lastRange.columns[0];
        const lastCol = lastRange.columns[lastRange.columns.length - 1];

        // find the cell that is at the furthest away corner from the starting cell
        const endCellIndex = lastRange.endRow!.rowIndex;
        const endCellFloating = lastRange.endRow!.rowPinned;
        const endCellColumn = startCell.column === firstCol ? lastCol : firstCol;

        const endCell: CellPosition = {column: endCellColumn, rowIndex: endCellIndex, rowPinned: endCellFloating};
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

    public setCellRange(params: AddCellRangeParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        this.onDragStop();
        this.cellRanges.length = 0;
        this.addCellRange(params);
    }

    public addCellRange(params: AddCellRangeParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        let columns: Column[] | undefined;

        if (params.columns) {
            columns = [];
            params.columns!.forEach(key => {
                const col = this.columnController.getColumnWithValidation(key);
                if (col) {
                    columns!.push(col);
                }
            });
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

        let startRow: RowPosition | undefined = undefined;
        if (params.rowStartIndex != null) {
            startRow = {
                rowIndex: params.rowStartIndex,
                rowPinned: params.rowStartPinned
            };
        }

        let endRow: RowPosition | undefined = undefined;
        if (params.rowEndIndex != null) {
            endRow = {
                rowIndex: params.rowEndIndex,
                rowPinned: params.rowEndPinned
            };
        }

        const newRange: CellRange = {
            startRow: startRow,
            endRow: endRow,
            columns: columns
        };

        this.cellRanges.push(newRange);
        this.dispatchChangedEvent(true, false);
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
        } else {
            // only one range, return true if range has more than one
            const range = this.cellRanges[0];
            const startRow = this.getRangeStartRow(range);
            const endRow = this.getRangeEndRow(range);
            const moreThanOneCell =
                startRow.rowPinned !== endRow.rowPinned
                || startRow.rowIndex !== endRow.rowIndex
                || range.columns.length !== 1;
            return moreThanOneCell;
        }
    }

    public clearSelection(): void {
        if (this.isEmpty()) { return; }

        this.onDragStop();
        this.cellRanges.length = 0;
        this.dispatchChangedEvent(true, false);
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
        const columnInRange: boolean = range.columns !== null && range.columns.indexOf(cell.column) >= 0;
        const rowInRange = this.isRowInRange(cell.rowIndex, cell.rowPinned, range);
        return columnInRange && rowInRange;
    }

    // returns the number of ranges this cell is in
    public getCellRangeCount(cell: CellPosition): number {
        if (this.isEmpty()) {
            return 0;
        }

        let matchingCount = 0;

        this.cellRanges.forEach(cellRange => {
            if (this.isCellInSpecificRange(cell, cellRange)) {
                matchingCount++;
            }
        });

        return matchingCount;
    }

    private isRowInRange(rowIndex: number, floating: string | undefined, cellRange: CellRange): boolean {

        const firstRow = this.getRangeStartRow(cellRange);
        const lastRow = this.getRangeEndRow(cellRange);

        const thisRow: RowPosition = {rowIndex: rowIndex, rowPinned: floating};

        const equalsFirstRow = thisRow.rowIndex === firstRow.rowIndex && thisRow.rowPinned === firstRow.rowPinned;
        const equalsLastRow = thisRow.rowIndex === lastRow.rowIndex && thisRow.rowPinned === lastRow.rowPinned;

        if (equalsFirstRow || equalsLastRow) {
            return true;
        } else {
            const afterFirstRow = !RowPositionUtils.before(thisRow, firstRow);
            const beforeLastRow = RowPositionUtils.before(thisRow, lastRow);
            return afterFirstRow && beforeLastRow;
        }

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

        this.dragging = true;
        this.draggingCell = mouseCell;
        this.lastMouseEvent = mouseEvent;

        if (!multiSelectKeyPressed && !shiftKey) {
            this.cellRanges.length = 0;
        }

        if (!shiftKey) {
            this.newestRangeStartCell = mouseCell;
        }

        // if we didn't clear the ranges, then dragging means the user clicked, and when the
        // user clicks it means a range of one cell was created. we need to extend this range
        // rather than creating another range. otherwise we end up with two distinct ranges
        // from a drag operation (one from click, and one from drag).
        if (this.cellRanges.length > 0) {
            this.draggingRange = this.cellRanges[this.cellRanges.length - 1];
        } else {
            const mouseRowPosition: RowPosition = {
                rowIndex: mouseCell.rowIndex,
                rowPinned: mouseCell.rowPinned
            };
            this.draggingRange = {
                startRow: mouseRowPosition,
                endRow: mouseRowPosition,
                columns: [mouseCell.column]
            };
            this.cellRanges.push(this.draggingRange);
        }

        this.gridPanel.addScrollEventListener(this.bodyScrollListener);

        this.dispatchChangedEvent(false, true);
    }

    private dispatchChangedEvent(finished: boolean, started: boolean): void {
        const event: RangeSelectionChangedEvent = {
            type: Events.EVENT_RANGE_SELECTION_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi,
            finished: finished,
            started: started
        };
        this.eventService.dispatchEvent(event);
    }

    public onDragStop(): void {
        if (!this.dragging) {
            return;
        }

        this.autoScrollService.ensureCleared();

        this.gridPanel.removeScrollEventListener(this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
        this.draggingRange = undefined;
        this.draggingCell = undefined;

        this.dispatchChangedEvent(true, false);
    }

    public onDragging(mouseEvent: MouseEvent | null): void {
        if (!this.dragging || !mouseEvent) {
            return;
        }

        this.lastMouseEvent = mouseEvent;

        const cellPosition = this.mouseEventService.getCellPositionForEvent(mouseEvent);

        const mouseAndStartInPinnedTop = cellPosition && cellPosition.rowPinned === 'top' && this.newestRangeStartCell!.rowPinned === 'top';
        const mouseAndStartInPinnedBottom = cellPosition && cellPosition.rowPinned === 'bottom' && this.newestRangeStartCell!.rowPinned === 'bottom';
        const skipVerticalScroll = mouseAndStartInPinnedTop || mouseAndStartInPinnedBottom;

        this.autoScrollService.check(mouseEvent, skipVerticalScroll);

        if (!cellPosition || !this.draggingCell || CellPositionUtils.equals(this.draggingCell, cellPosition)) {
            return;
        }

        const columns = this.calculateColumnsBetween(this.newestRangeStartCell!.column, cellPosition.column);
        if (!columns) { return; }

        this.draggingCell = cellPosition;

        this.draggingRange!.endRow = {
            rowIndex: cellPosition.rowIndex,
            rowPinned: cellPosition.rowPinned
        };
        this.draggingRange!.columns = columns;

        this.dispatchChangedEvent(false, false);
    }

    private calculateColumnsBetween(columnFrom: Column, columnTo: Column): Column[] | undefined {
        const allColumns = this.columnController.getAllDisplayedColumns();

        const fromIndex = allColumns.indexOf(columnFrom);
        const toIndex = allColumns.indexOf(columnTo);

        if (fromIndex < 0) {
            console.warn('ag-Grid: column ' + columnFrom.getId() + ' is not visible');
            return undefined;
        }
        if (toIndex < 0) {
            console.warn('ag-Grid: column ' + columnTo.getId() + ' is not visible');
            return undefined;
        }

        const firstIndex = Math.min(fromIndex, toIndex);
        const lastIndex = Math.max(fromIndex, toIndex);

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
        // we don't do ticking if grid is auto height
        if (this.gridOptionsWrapper.getDomLayout() !== Constants.DOM_LAYOUT_NORMAL) {
            return;
        }

        const rect: ClientRect = this.gridPanel.getBodyClientRect();

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

        if (this.tickCount > 20) {
            tickAmount = 200;
        } else if (this.tickCount > 10) {
            tickAmount = 80;
        } else {
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

    }

    public ensureCleared(): void {
        if (this.tickingInterval) {
            window.clearInterval(this.tickingInterval);
            this.tickingInterval = null;
        }
    }

}