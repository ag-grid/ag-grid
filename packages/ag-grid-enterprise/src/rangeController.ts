import {
    Utils,
    Bean,
    IRangeController,
    Autowired,
    GridCellDef,
    LoggerFactory,
    GridPanel,
    IRowModel,
    EventService,
    ColumnController,
    RowRenderer,
    FocusedCellController,
    MouseEventService,
    Logger,
    RangeSelection,
    PostConstruct,
    Events,
    GridCell,
    AddRangeSelectionParams,
    GridRow,
    Column,
    GridOptionsWrapper,
    RangeSelectionChangedEvent,
    ColumnApi,
    GridApi,
    CellNavigationService,
    _
} from "ag-grid/main";

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

    private cellRanges: RangeSelection[];
    private activeRange: RangeSelection;
    private lastMouseEvent: MouseEvent;

    private bodyScrollListener = this.onBodyScroll.bind(this);

    private dragging = false;

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
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) { return; }

        let columns = this.updateSelectedColumns(cell.column, cell.column);
        if (!columns) { return; }

        let gridCellDef = <GridCellDef> {rowIndex: cell.rowIndex, floating: cell.floating, column: cell.column};

        let newRange = {
            start: new GridCell(gridCellDef),
            end: new GridCell(gridCellDef),
            columns: columns
        };
        // if not appending, then clear previous range selections
        if (!appendRange || _.missing(this.cellRanges)) {
            this.cellRanges = [];
        }
        this.cellRanges.push(newRange);
        this.activeRange = null;
        this.dispatchChangedEvent(true, false);
    }

    public extendRangeToCell(toCell: GridCell): void {

        let lastRange = _.existsAndNotEmpty(this.cellRanges) ? this.cellRanges[this.cellRanges.length - 1] : null;
        let startCell = lastRange ? lastRange.start : toCell;

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

        let oneRangeExists = _.exists(this.cellRanges) || this.cellRanges.length === 1;
        let previousSelectionStart = oneRangeExists ? this.cellRanges[0].start : null;

        let takeEndFromPreviousSelection = startCell.equals(previousSelectionStart);

        let previousEndCell = takeEndFromPreviousSelection ? this.cellRanges[0].end : startCell;
        let newEndCell = this.cellNavigationService.getNextCellToFocus(key, previousEndCell);

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
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) { return; }

        this.cellRanges = [];
        this.addRange(rangeSelection);
    }

    public addRange(rangeSelection: AddRangeSelectionParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) { return; }

        let columnStart = this.columnController.getColumnWithValidation(rangeSelection.columnStart);
        let columnEnd = this.columnController.getPrimaryColumn(rangeSelection.columnEnd);
        if (!columnStart || !columnEnd) { return; }

        let columns = this.updateSelectedColumns(columnStart, columnEnd);
        if (!columns) { return; }

        let startGridCellDef = <GridCellDef> {column: columnStart, rowIndex: rangeSelection.rowStart, floating: rangeSelection.floatingStart};
        let endGridCellDef = <GridCellDef> {column: columnEnd, rowIndex: rangeSelection.rowEnd, floating: rangeSelection.floatingEnd};

        let newRange = <RangeSelection> {
            start: new GridCell(startGridCellDef),
            end: new GridCell(endGridCellDef),
            columns: columns
        };
        if (!this.cellRanges) {
            this.cellRanges = [];
        }
        this.cellRanges.push(newRange);
        this.dispatchChangedEvent(true, false);
    }

    public getCellRanges(): RangeSelection[] {
        return this.cellRanges;
    }

    public isEmpty(): boolean {
        return Utils.missingOrEmpty(this.cellRanges);
    }

    public isMoreThanOneCell(): boolean {
        if (Utils.missingOrEmpty(this.cellRanges)) {
            return false;
        } else {
            if (this.cellRanges.length>1) {
                return true;
            } else {
                let onlyRange = this.cellRanges[0];
                let onlyOneCellInRange =
                    onlyRange.start.column === onlyRange.end.column &&
                    onlyRange.start.rowIndex === onlyRange.end.rowIndex;
                return !onlyOneCellInRange;
            }
        }
    }

    public clearSelection(): void {
        if (Utils.missing(this.cellRanges)) {
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
        let columnInRange = range.columns.indexOf(cell.column) >= 0;
        let rowInRange = this.isRowInRange(cell.rowIndex, cell.floating, range);
        return columnInRange && rowInRange;
    }

    // returns the number of ranges this cell is in
    public getCellRangeCount(cell: GridCell): number {
        if (Utils.missingOrEmpty(this.cellRanges)) {
            return 0;
        }

        let matchingCount = 0;

        this.cellRanges.forEach( (cellRange: RangeSelection) => {
            if (this.isCellInSpecificRange(cell, cellRange)) {
                matchingCount++;
            }
        });

        return matchingCount;
    }

    private isRowInRange(rowIndex: number, floating: string, cellRange: RangeSelection): boolean {

        let row1 = new GridRow(cellRange.start.rowIndex, cellRange.start.floating);
        let row2 = new GridRow(cellRange.end.rowIndex, cellRange.end.floating);

        let firstRow = row1.before(row2) ? row1 : row2;
        let lastRow = row1.before(row2) ? row2 : row1;

        let thisRow = new GridRow(rowIndex, floating);

        if (thisRow.equals(firstRow) || thisRow.equals(lastRow)) {
            return true;
        } else {
            let afterFirstRow = !thisRow.before(firstRow);
            let beforeLastRow = thisRow.before(lastRow);
            return afterFirstRow && beforeLastRow;
        }

    }

    public onDragStart(mouseEvent: MouseEvent): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) { return; }

        // ctrlKey for windows, metaKey for Apple
        let multiKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        let allowMulti = !this.gridOptionsWrapper.isSuppressMultiRangeSelection();
        let multiSelectKeyPressed = allowMulti ? multiKeyPressed : false;

        if (Utils.missing(this.cellRanges) || !multiSelectKeyPressed) {
            this.cellRanges = [];
        }

        let cell = this.mouseEventService.getGridCellForEvent(mouseEvent);

        if (Utils.missing(cell)) {
            // if drag wasn't on cell, then do nothing, including do not set dragging=true,
            // (which them means onDragging and onDragStop do nothing)
            return;
        }

        this.createNewActiveRange(cell);

        this.gridPanel.addScrollEventListener(this.bodyScrollListener);
        this.dragging = true;

        this.lastMouseEvent = mouseEvent;

        this.selectionChanged(false, true);
    }

    private createNewActiveRange(cell: GridCell): void {

        let gridCellDef = <GridCellDef> {column: cell.column, rowIndex: cell.rowIndex, floating: cell.floating};

        this.activeRange = {
            start: new GridCell(gridCellDef),
            end: new GridCell(gridCellDef),
            columns: [cell.column]
        };

        this.cellRanges.push(this.activeRange);
    }

    private selectionChanged(finished: boolean, started: boolean): void {
        this.activeRange.columns = this.updateSelectedColumns(this.activeRange.start.column, this.activeRange.end.column);
        this.dispatchChangedEvent(finished, started);
    }

    private dispatchChangedEvent(finished: boolean, started: boolean): void {
        let event: RangeSelectionChangedEvent = {
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
        this.dispatchChangedEvent(true, false);
    }

    public onDragging(mouseEvent: MouseEvent): void {
        if (!this.dragging || !this.activeRange) {
            return;
        }

        this.lastMouseEvent = mouseEvent;

        this.autoScrollService.check(mouseEvent);

        let cell = this.mouseEventService.getGridCellForEvent(mouseEvent);
        if (Utils.missing(cell)) {
            return;
        }

        let columnChanged = false;
        if (cell.column !== this.activeRange.end.column) {
            this.activeRange.end.column = cell.column;
            columnChanged = true;
        }

        let rowChanged = false;
        if (cell.rowIndex!==this.activeRange.end.rowIndex || cell.floating!==this.activeRange.end.floating) {
            this.activeRange.end.rowIndex = cell.rowIndex;
            this.activeRange.end.floating = cell.floating;
            rowChanged = true;
        }

        if (columnChanged || rowChanged) {
            this.selectionChanged(false, false);
        }
    }

    private updateSelectedColumns(columnFrom: Column, columnTo: Column): Column[] {
        let allColumns = this.columnController.getAllDisplayedColumns();

        let fromIndex = allColumns.indexOf(columnFrom);
        let toIndex = allColumns.indexOf(columnTo);

        if (fromIndex < 0) {
            console.log('ag-Grid: column ' + columnFrom.getId() + ' is not visible');
            return null;
        }
        if (toIndex < 0) {
            console.log('ag-Grid: column ' + columnTo.getId() + ' is not visible');
            return null;
        }

        let firstIndex = Math.min(fromIndex, toIndex);
        let lastIndex = Math.max(fromIndex, toIndex);

        let columns: Column[] = [];
        for (let i = firstIndex; i<=lastIndex; i++) {
            columns.push(allColumns[i]);
        }

        return columns;
    }
}

class AutoScrollService {

    private tickingInterval: number = null;

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

    public check(mouseEvent: MouseEvent): void {

        // we don't do ticking if grid is auto height
        if (this.gridOptionsWrapper.isGridAutoHeight()) { return; }

        let rect: ClientRect = this.gridPanel.getBodyClientRect();

        this.tickLeft = mouseEvent.clientX < (rect.left + 20);
        this.tickRight = mouseEvent.clientX > (rect.right - 20);
        this.tickUp = mouseEvent.clientY < (rect.top + 20);
        this.tickDown = mouseEvent.clientY > (rect.bottom - 20);

        if (this.tickLeft || this.tickRight || this.tickUp || this.tickDown) {
            this.ensureTickingStarted();
        } else {
            this.ensureCleared();
        }
    }

    private ensureTickingStarted(): void {
        if (this.tickingInterval===null) {
            this.tickingInterval = setInterval(this.doTick.bind(this), 100);
            this.tickCount = 0;
        }
    }

    private doTick(): void {

        this.tickCount++;

        let vScrollPosition = this.gridPanel.getVScrollPosition();
        let hScrollPosition = this.gridPanel.getHScrollPosition();

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
            clearInterval(this.tickingInterval);
            this.tickingInterval = null;
        }
    }

}