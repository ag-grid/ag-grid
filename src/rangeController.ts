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
    GridOptionsWrapper
} from "ag-grid/main";

@Bean('rangeController')
export class RangeController implements IRangeController {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('mouseEventService') private mouseEventService: MouseEventService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private logger: Logger;

    private cellRanges: RangeSelection[];
    private activeRange: RangeSelection;
    private lastMouseEvent: MouseEvent;

    private bodyScrollListener = this.onBodyScroll.bind(this);

    private dragging = false;

    @PostConstruct
    private init(): void {
        this.logger = this.loggerFactory.create('RangeController');

        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_SORT_CHANGED, this.clearSelection.bind(this));
    }

    public setRangeToCell(cell: GridCell): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) { return; }

        var columns = this.updateSelectedColumns(cell.column, cell.column);
        if (!columns) { return; }

        let gridCellDef = <GridCellDef> {rowIndex: cell.rowIndex, floating: cell.floating, column: cell.column};

        var newRange = {
            start: new GridCell(gridCellDef),
            end: new GridCell(gridCellDef),
            columns: columns
        };
        this.cellRanges = [];
        this.cellRanges.push(newRange);
        this.activeRange = null;
        this.dispatchChangedEvent(true, false);
    }

    public setRange(rangeSelection: AddRangeSelectionParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) { return; }

        this.cellRanges = [];
        this.addRange(rangeSelection);
    }

    public addRange(rangeSelection: AddRangeSelectionParams): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) { return; }

        var columnStart = this.columnController.getColumnWithValidation(rangeSelection.columnStart);
        var columnEnd = this.columnController.getPrimaryColumn(rangeSelection.columnEnd);
        if (!columnStart || !columnEnd) { return; }

        var columns = this.updateSelectedColumns(columnStart, columnEnd);
        if (!columns) { return; }

        let startGridCellDef = <GridCellDef> {column: columnStart, rowIndex: rangeSelection.rowStart, floating: rangeSelection.floatingStart};
        let endGridCellDef = <GridCellDef> {column: columnEnd, rowIndex: rangeSelection.rowEnd, floating: rangeSelection.floatingEnd};

        var newRange = <RangeSelection> {
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
                var onlyRange = this.cellRanges[0];
                var onlyOneCellInRange =
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
        var columnInRange = range.columns.indexOf(cell.column) >= 0;
        var rowInRange = this.isRowInRange(cell.rowIndex, cell.floating, range);
        return columnInRange && rowInRange;
    }

    // returns the number of ranges this cell is in
    public getCellRangeCount(cell: GridCell): number {
        if (Utils.missingOrEmpty(this.cellRanges)) {
            return 0;
        }

        var matchingCount = 0;

        this.cellRanges.forEach( (cellRange: RangeSelection) => {
            if (this.isCellInSpecificRange(cell, cellRange)) {
                matchingCount++;
            }
        });

        return matchingCount;
    }

    private isRowInRange(rowIndex: number, floating: string, cellRange: RangeSelection): boolean {

        var row1 = new GridRow(cellRange.start.rowIndex, cellRange.start.floating);
        var row2 = new GridRow(cellRange.end.rowIndex, cellRange.end.floating);

        var firstRow = row1.before(row2) ? row1 : row2;
        var lastRow = row1.before(row2) ? row2 : row1;

        var thisRow = new GridRow(rowIndex, floating);

        if (thisRow.equals(firstRow) || thisRow.equals(lastRow)) {
            return true;
        } else {
            var afterFirstRow = !thisRow.before(firstRow);
            var beforeLastRow = thisRow.before(lastRow);
            return afterFirstRow && beforeLastRow;
        }

    }

    public onDragStart(mouseEvent: MouseEvent): void {
        if (!this.gridOptionsWrapper.isEnableRangeSelection()) { return; }

        // ctrlKey for windows, metaKey for Apple
        var multiSelectKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        if (Utils.missing(this.cellRanges) || !multiSelectKeyPressed) {
            this.cellRanges = [];
        }

        var cell = this.mouseEventService.getGridCellForEvent(mouseEvent);

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
        this.eventService.dispatchEvent(Events.EVENT_RANGE_SELECTION_CHANGED, {finished: finished, started: started});
    }

    public onDragStop(): void {
        if (!this.dragging) {
            return;
        }

        this.gridPanel.removeScrollEventListener(this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
        this.dispatchChangedEvent(true, false);
    }

    public onDragging(mouseEvent: MouseEvent): void {
        if (!this.dragging) {
            return;
        }

        this.lastMouseEvent = mouseEvent;

        var cell = this.mouseEventService.getGridCellForEvent(mouseEvent);
        if (Utils.missing(cell)) {
            return;
        }

        var columnChanged = false;
        if (cell.column !== this.activeRange.end.column) {
            this.activeRange.end.column = cell.column;
            columnChanged = true;
        }

        var rowChanged = false;
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
        var allColumns = this.columnController.getAllDisplayedColumns();

        var fromIndex = allColumns.indexOf(columnFrom);
        var toIndex = allColumns.indexOf(columnTo);

        if (fromIndex < 0) {
            console.log('ag-Grid: column ' + columnFrom.getId() + ' is not visible');
            return null;
        }
        if (toIndex < 0) {
            console.log('ag-Grid: column ' + columnTo.getId() + ' is not visible');
            return null;
        }

        var firstIndex = Math.min(fromIndex, toIndex);
        var lastIndex = Math.max(fromIndex, toIndex);

        var columns: Column[] = [];
        for (var i = firstIndex; i<=lastIndex; i++) {
            columns.push(allColumns[i]);
        }

        return columns;
    }
}
