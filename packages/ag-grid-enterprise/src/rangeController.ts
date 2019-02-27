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
    GridCellDef,
    GridOptionsWrapper,
    GridPanel,
    GridRow,
    IRangeController,
    IRowModel,
    Logger,
    LoggerFactory,
    MouseEventService,
    PostConstruct,
    RangeSelection,
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

    private cellRanges: RangeSelection[] | null;
    private activeRange: RangeSelection | null;
    private lastMouseEvent: MouseEvent | null;

    private bodyScrollListener = this.onBodyScroll.bind(this);

    private dragging = false;
    private startedFrom: string | null | undefined;

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

        const columns = this.updateSelectedColumns(cell.column, cell.column);
        if (!columns) {
            return;
        }

        const gridCellDef = {rowIndex: cell.rowIndex, floating: cell.floating, column: cell.column} as GridCellDef;
        const newRange = {
            start: new GridCell(gridCellDef),
            end: new GridCell(gridCellDef),
            columns: columns
        };

        const suppressMultiRangeSelections = this.gridOptionsWrapper.isSuppressMultiRangeSelection();

        // if not appending, then clear previous range selections
        if (suppressMultiRangeSelections || !appendRange || _.missing(this.cellRanges)) {
            this.cellRanges = [];
        }

        if (this.cellRanges) {
            this.cellRanges.push(newRange);
        }
        this.activeRange = null;
        this.dispatchChangedEvent(true, false);
    }

    public extendRangeToCell(toCell: GridCell): void {
        const lastRange = _.existsAndNotEmpty(this.cellRanges) && this.cellRanges ? this.cellRanges[this.cellRanges.length - 1] : null;
        const startCell = lastRange ? lastRange.start : toCell;

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
    public extendRangeInDirection(startCell: GridCell, key: number): boolean {
        const oneRangeExists = (_.exists(this.cellRanges) && this.cellRanges) || (this.cellRanges && this.cellRanges.length === 1);
        const previousSelectionStart = oneRangeExists && this.cellRanges ? this.cellRanges[0].start : null;

        const takeEndFromPreviousSelection = startCell.equals(previousSelectionStart);

        const previousEndCell = takeEndFromPreviousSelection && this.cellRanges ? this.cellRanges[0].end : startCell;
        const newEndCell = this.cellNavigationService.getNextCellToFocus(key, previousEndCell);

        // if user is at end of grid, so no cell to extend to, we return false
        if (!newEndCell) {
            return false;
        }

        this.setRange({
            rowStart: startCell.rowIndex,
            floatingStart: startCell.floating,
            rowEnd: newEndCell.rowIndex,
            floatingEnd: newEndCell.floating,
            columnStart: startCell.column,
            columnEnd: newEndCell.column
        });

        return true;
    }

    public setRange(rangeSelection: AddRangeSelectionParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        this.cellRanges = [];
        this.addRange(rangeSelection);
    }

    public addRange(rangeSelection: AddRangeSelectionParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) {
            return;
        }

        const columnStart = this.columnController.getColumnWithValidation(rangeSelection.columnStart);
        const columnEnd = this.columnController.getPrimaryColumn(rangeSelection.columnEnd);
        if (!columnStart || !columnEnd) {
            return;
        }

        const columns = this.updateSelectedColumns(columnStart, columnEnd);
        if (!columns) {
            return;
        }

        const startGridCellDef = {
            column: columnStart,
            rowIndex: rangeSelection.rowStart,
            floating: rangeSelection.floatingStart
        } as GridCellDef;
        const endGridCellDef = {
            column: columnEnd,
            rowIndex: rangeSelection.rowEnd,
            floating: rangeSelection.floatingEnd
        } as GridCellDef;

        const newRange = {
            start: new GridCell(startGridCellDef),
            end: new GridCell(endGridCellDef),
            columns: columns
        } as RangeSelection;
        if (!this.cellRanges) {
            this.cellRanges = [];
        }
        this.cellRanges.push(newRange);
        this.dispatchChangedEvent(true, false);
    }

    public getCellRanges(): RangeSelection[] | null {
        return this.cellRanges;
    }

    public isEmpty(): boolean {
        return !this.cellRanges || _.missingOrEmpty(this.cellRanges);
    }

    public isMoreThanOneCell(): boolean {
        if (!this.cellRanges || _.missingOrEmpty(this.cellRanges)) {
            return false;
        } else {
            if (this.cellRanges.length > 1) {
                return true;
            } else {
                const onlyRange = this.cellRanges[0];
                const onlyOneCellInRange =
                    onlyRange.start.column === onlyRange.end.column &&
                    onlyRange.start.rowIndex === onlyRange.end.rowIndex;
                return !onlyOneCellInRange;
            }
        }
    }

    public clearSelection(): void {
        if (_.missing(this.cellRanges)) {
            return;
        }
        this.activeRange = null;
        this.cellRanges = null;
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

    private isCellInSpecificRange(cell: GridCell, range: RangeSelection): boolean {
        const columnInRange: boolean = range.columns !== null && range.columns.indexOf(cell.column) >= 0;
        const rowInRange = this.isRowInRange(cell.rowIndex, cell.floating, range);
        return columnInRange && rowInRange;
    }

    // returns the number of ranges this cell is in
    public getCellRangeCount(cell: GridCell): number {
        if (!this.cellRanges || _.missingOrEmpty(this.cellRanges)) {
            return 0;
        }

        let matchingCount = 0;

        this.cellRanges.forEach((cellRange: RangeSelection) => {
            if (this.isCellInSpecificRange(cell, cellRange)) {
                matchingCount++;
            }
        });

        return matchingCount;
    }

    private isRowInRange(rowIndex: number, floating: string, cellRange: RangeSelection): boolean {

        const row1 = new GridRow(cellRange.start.rowIndex, cellRange.start.floating);
        const row2 = new GridRow(cellRange.end.rowIndex, cellRange.end.floating);

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
        const missingRanges = _.missing(this.cellRanges);

        const cell = this.mouseEventService.getGridCellForEvent(mouseEvent);
        if (_.missing(cell)) {
            // if drag wasn't on cell, then do nothing, including do not set dragging=true,
            // (which them means onDragging and onDragStop do nothing)
            return;
        }

        const len = missingRanges || !this.cellRanges ? 0 : this.cellRanges.length;


        if (missingRanges || !multiSelectKeyPressed) {
            this.cellRanges = [];
        } else if (!this.activeRange && len && this.cellRanges && this.isCellInSpecificRange(cell, this.cellRanges[len - 1])) {
            this.activeRange = this.activeRange = this.cellRanges[len - 1];
        }

        if (!this.activeRange) {
            this.createNewActiveRange(cell);
        }

        this.gridPanel.addScrollEventListener(this.bodyScrollListener);
        this.dragging = true;

        const [eTop, eBottom] = this.gridPanel.getFloatingTopBottom();
        const target = mouseEvent.target as HTMLElement;

        if (eTop.contains(target)) {
            this.startedFrom = 'top';
        } else if (eBottom.contains(target)) {
            this.startedFrom = 'bottom';
        } else {
            this.startedFrom = 'body';
        }

        this.lastMouseEvent = mouseEvent;

        this.selectionChanged(false, true);
    }

    private createNewActiveRange(cell: GridCell): void {

        const gridCellDef = {column: cell.column, rowIndex: cell.rowIndex, floating: cell.floating} as GridCellDef;

        this.activeRange = {
            start: new GridCell(gridCellDef),
            end: new GridCell(gridCellDef),
            columns: [cell.column]
        };

        if (this.cellRanges) {
            this.cellRanges.push(this.activeRange);
        }
    }

    private selectionChanged(finished: boolean, started: boolean): void {
        if (this.activeRange) {
            this.activeRange.columns = this.updateSelectedColumns(this.activeRange.start.column, this.activeRange.end.column);
        }
        this.dispatchChangedEvent(finished, started);
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
        this.startedFrom = null;
        this.dispatchChangedEvent(true, false);
    }

    public onDragging(mouseEvent: MouseEvent | null): void {
        if (!this.dragging || !this.activeRange || !mouseEvent) {
            return;
        }

        this.lastMouseEvent = mouseEvent;

        const [eTop, eBottom] = this.gridPanel.getFloatingTopBottom();
        const target = mouseEvent.target as HTMLElement;
        let skipVerticalScroll = false;

        if (
            (this.startedFrom === 'top' && eTop.contains(target)) ||
            (this.startedFrom === 'bottom' && eBottom.contains(target))
        ) {
            skipVerticalScroll = true;
        }

        this.autoScrollService.check(mouseEvent, skipVerticalScroll);

        const cell = this.mouseEventService.getGridCellForEvent(mouseEvent);
        if (_.missing(cell)) {
            return;
        }

        let columnChanged = false;
        if (cell.column !== this.activeRange.end.column) {
            this.activeRange.end.column = cell.column;
            columnChanged = true;
        }

        let rowChanged = false;
        if (cell.rowIndex !== this.activeRange.end.rowIndex || cell.floating !== this.activeRange.end.floating) {
            this.activeRange.end.rowIndex = cell.rowIndex;
            this.activeRange.end.floating = cell.floating;
            rowChanged = true;
        }

        if (columnChanged || rowChanged) {
            this.selectionChanged(false, false);
        }
    }

    private updateSelectedColumns(columnFrom: Column, columnTo: Column): Column[] | null {
        const allColumns = this.columnController.getAllDisplayedColumns();

        const fromIndex = allColumns.indexOf(columnFrom);
        const toIndex = allColumns.indexOf(columnTo);

        if (fromIndex < 0) {
            console.warn('ag-Grid: column ' + columnFrom.getId() + ' is not visible');
            return null;
        }
        if (toIndex < 0) {
            console.warn('ag-Grid: column ' + columnTo.getId() + ' is not visible');
            return null;
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