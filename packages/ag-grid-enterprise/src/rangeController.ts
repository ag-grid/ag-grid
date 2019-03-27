import {
    AddRangeSelectionParams,
    Autowired,
    Bean,
    CellNavigationService,
    Column,
    ColumnApi,
    ColumnController,
    Constants,
    Events,
    EventService,
    FocusedCellController,
    GridApi,
    GridCell,
    GridOptionsWrapper,
    GridPanel,
    GridRow,
    IRangeController,
    IRowModel,
    Logger,
    LoggerFactory,
    MouseEventService,
    PostConstruct,
    CellRange,
    RangeSelectionChangedEvent,
    RowRenderer,
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

    private logger: Logger;

    private gridPanel: GridPanel;

    private cellRanges: CellRange[] = [];

    private lastMouseEvent: MouseEvent | null;

    private bodyScrollListener = this.onBodyScroll.bind(this);

    // when a range is created, we mark the 'start cell' for further processing as follows:
    // 1) if dragging, then the new range is extended from the start position
    // 2) if user hits 'shift' click on a cell, the previous range is extended from the start position
    private newestRangeStartCell: GridCell | undefined;

    private dragging = false;
    private draggingCell: GridCell | undefined;
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

    public setRangeToCell(cell: GridCell, appendRange = false): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        const columns = this.calculateColumnsBetween(cell.column, cell.column);
        if (!columns) {
            return;
        }

        const newRange: CellRange = {
            startRow: {
                floating: cell.floating,
                index: cell.rowIndex
            },
            endRow: {
                floating: cell.floating,
                index: cell.rowIndex
            },
            columns: columns
        };

        const suppressMultiRangeSelections = this.gridOptionsWrapper.isSuppressMultiRangeSelection();

        // if not appending, then clear previous range selections
        if (suppressMultiRangeSelections || !appendRange || _.missing(this.cellRanges)) {
            this.cellRanges.length = 0;
        }

        this.cellRanges.push(newRange);
        this.newestRangeStartCell = cell;
        this.onDragStop();

        this.dispatchChangedEvent(true, false);
    }

    public extendLatestRangeToCell(toCell: GridCell): void {
        if (this.isEmpty()) { return; }
        if (!this.newestRangeStartCell) { return; }

        const startCell = this.newestRangeStartCell;

        this.setRange({
            rowStart: startCell.rowIndex,
            floatingStart: startCell.floating,
            rowEnd: toCell.rowIndex,
            floatingEnd: toCell.floating,
            columnStart: startCell.column,
            columnEnd: toCell.column
        });
    }

    // returns true if successful, false if not successful
    public extendLatestRangeInDirection(key: number): GridCell | undefined {
        if (this.isEmpty()) { return; }
        if (!this.newestRangeStartCell) { return; }

        const lastRange = this.cellRanges![this.cellRanges!.length - 1];

        const startCell = this.newestRangeStartCell;

        const firstCol = lastRange.columns[0];
        const lastCol = lastRange.columns[lastRange.columns.length - 1];

        // find the cell that is at the furthest away corner from the starting cell
        const endCellIndex = lastRange.endRow.index;
        const endCellFloating = lastRange.endRow.floating;
        const endCellColumn = startCell.column === firstCol ? lastCol : firstCol;

        const endCell = new GridCell({column: endCellColumn, rowIndex: endCellIndex, floating: endCellFloating});
        const newEndCell = this.cellNavigationService.getNextCellToFocus(key, endCell);

        // if user is at end of grid, so no cell to extend to, we return false
        if (!newEndCell) {
            return;
        }

        this.setRange({
            rowStart: startCell.rowIndex,
            floatingStart: startCell.floating,
            rowEnd: newEndCell.rowIndex,
            floatingEnd: newEndCell.floating,
            columnStart: startCell.column,
            columnEnd: newEndCell.column
        });

        return newEndCell;
    }

    public setRange(rangeSelection: AddRangeSelectionParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        this.onDragStop();
        this.cellRanges.length = 0;
        this.addRange(rangeSelection);
    }

    public addRange(rangeSelection: AddRangeSelectionParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        const columnStart = this.columnController.getColumnWithValidation(rangeSelection.columnStart);
        const columnEnd = this.columnController.getColumnWithValidation(rangeSelection.columnEnd);
        if (!columnStart || !columnEnd) {
            return;
        }

        const columns = this.calculateColumnsBetween(columnStart, columnEnd);
        if (!columns) {
            return;
        }

        const newRange: CellRange = {
            startRow: {
                index: rangeSelection.rowStart,
                floating: rangeSelection.floatingStart
            },
            endRow: {
                index: rangeSelection.rowEnd,
                floating: rangeSelection.floatingEnd
            },
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
        if (this.cellRanges.length===0) {
            // no ranges, so not more than one cell
            return false;
        } else if (this.cellRanges.length > 1) {
            // many ranges, so more than one cell
            return true;
        } else {
            // only one range, return true if range has more than one
            const range = this.cellRanges[0];
            const moreThanOneCell =
                range.startRow.floating !== range.endRow.floating
                || range.startRow.index !== range.endRow.index
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

    public isCellInAnyRange(cell: GridCell): boolean {
        return this.getCellRangeCount(cell) > 0;
    }

    public isCellInSpecificRange(cell: GridCell, range: CellRange): boolean {
        const columnInRange: boolean = range.columns !== null && range.columns.indexOf(cell.column) >= 0;
        const rowInRange = this.isRowInRange(cell.rowIndex, cell.floating, range);
        return columnInRange && rowInRange;
    }

    // returns the number of ranges this cell is in
    public getCellRangeCount(cell: GridCell): number {
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

    private isRowInRange(rowIndex: number, floating: string, cellRange: CellRange): boolean {

        const row1 = new GridRow(cellRange.startRow.index, cellRange.startRow.floating);
        const row2 = new GridRow(cellRange.endRow.index, cellRange.endRow.floating);

        const firstRow = row1.before(row2) ? row1 : row2;
        const lastRow = row1.before(row2) ? row2 : row1;

        const thisRow = new GridRow(rowIndex, floating);

        if (thisRow.equals(firstRow) || thisRow.equals(lastRow)) {
            return true;
        } else {
            const afterFirstRow = !thisRow.before(firstRow);
            const beforeLastRow = thisRow.before(lastRow);
            return afterFirstRow && beforeLastRow;
        }

    }

    public onDragStart(mouseEvent: MouseEvent): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        // ctrlKey for windows, metaKey for Apple
        const multiKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        const allowMulti = !this.gridOptionsWrapper.isSuppressMultiRangeSelection();
        const multiSelectKeyPressed = allowMulti ? multiKeyPressed : false;

        const mouseCell = this.mouseEventService.getGridCellForEvent(mouseEvent);
        if (_.missing(mouseCell)) {
            // if drag wasn't on cell, then do nothing, including do not set dragging=true,
            // (which them means onDragging and onDragStop do nothing)
            return;
        }

        this.dragging = true;
        this.newestRangeStartCell = mouseCell;
        this.draggingCell = mouseCell;
        this.lastMouseEvent = mouseEvent;

        if (!multiSelectKeyPressed) {
            this.cellRanges.length = 0;
        }

        // if we didn't clear the ranges, then dragging means the user clicked, and when the
        // user clicks it means a range of one cell was created. we need to extend this range
        // rather than creating another range. otherwise we end up with two distinct ranges
        // from a drag operation (one from click, and one from drag).
        if (this.cellRanges.length > 0) {
            this.draggingRange = this.cellRanges[this.cellRanges.length-1];
        } else {
            this.draggingRange = {
                startRow: {
                    index: mouseCell.rowIndex,
                    floating: mouseCell.floating
                },
                endRow: {
                    index: mouseCell.rowIndex,
                    floating: mouseCell.floating
                },
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

        const cell = this.mouseEventService.getGridCellForEvent(mouseEvent);

        const mouseAndStartInPinnedTop = cell && cell.floating === 'top' && this.newestRangeStartCell!.floating === 'top';
        const mouseAndStartInPinnedBottom = cell && cell.floating === 'bottom' && this.newestRangeStartCell!.floating === 'bottom';
        const skipVerticalScroll = mouseAndStartInPinnedTop || mouseAndStartInPinnedBottom;

        this.autoScrollService.check(mouseEvent, skipVerticalScroll);

        if (!cell || this.draggingCell!.equals(cell)) {
            return;
        }

        const columns = this.calculateColumnsBetween(this.newestRangeStartCell!.column, cell.column);
        if (!columns) { return; }

        this.draggingCell = cell;

        this.draggingRange!.endRow = {
            index: cell.rowIndex,
            floating: cell.floating
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