import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {LoggerFactory} from "../logger";
import {PostConstruct} from "../context/context";
import {Logger} from "../logger";
import GridPanel from "../gridPanel/gridPanel";
import {IRowModel} from "../interfaces/iRowModel";
import EventService from "../eventService";
import {Events} from "../events";
import Column from "../entities/column";
import {ColumnController} from "../columnController/columnController";
import _ from '../utils';
import RowRenderer from "../rendering/rowRenderer";
import {FocusedCellController} from "../focusedCellController";
import {IRangeController} from "../interfaces/iRangeController";
import {RangeSelection} from "../interfaces/iRangeController";
import {AddRangeSelectionParams} from "../interfaces/iRangeController";
import {MouseEventService} from "../gridPanel/mouseEventService";
import Constants from "../constants";
import {GridCell} from "../gridPanel/mouseEventService";

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
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_SORT_CHANGED, this.clearSelection.bind(this));
    }

    public setRangeToCell(rowIndex: number, column: Column, floating: string): void {
        var columns = this.updateSelectedColumns(column, column);
        if (!columns) { return; }

        var newRange = {
            rowStart: rowIndex,
            floatingStart: _.makeNull(floating),
            rowEnd: rowIndex,
            floatingEnd: _.makeNull(floating),
            columnStart: column,
            columnEnd: column,
            columns: columns
        };
        this.cellRanges = [];
        this.cellRanges.push(newRange);
        this.activeRange = null;
        this.dispatchChangedEvent(true, false);
    }

    public setRange(rangeSelection: AddRangeSelectionParams): void {
        this.cellRanges = [];
        this.addRange(rangeSelection);
    }

    public addRange(rangeSelection: AddRangeSelectionParams): void {
        var columnStart = this.columnController.getColumnWithValidation(rangeSelection.columnStart);
        var columnEnd = this.columnController.getColumn(rangeSelection.columnEnd);
        if (!columnStart || !columnEnd) { return; }

        var columns = this.updateSelectedColumns(columnStart, columnEnd);
        if (!columns) { return; }

        var newRange = <RangeSelection> {
            rowStart: rangeSelection.rowStart,
            floatingStart: _.makeNull(rangeSelection.floatingStart),
            rowEnd: rangeSelection.rowEnd,
            floatingEnd: _.makeNull(rangeSelection.floatingEnd),
            columnStart: rangeSelection.columnStart,
            columnEnd: rangeSelection.columnEnd,
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
        return _.missingOrEmpty(this.cellRanges);
    }

    public isMoreThanOneCell(): boolean {
        if (_.missingOrEmpty(this.cellRanges)) {
            return false;
        } else {
            if (this.cellRanges.length>1) {
                return true;
            } else {
                var onlyRange = this.cellRanges[0];
                var onlyOneCellInRange =
                    onlyRange.columnStart === onlyRange.columnEnd &&
                    onlyRange.rowStart === onlyRange.rowEnd;
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
    private onBodyScroll(event: Event): void {
        this.onDragging(this.lastMouseEvent);
    }

    public isCellInRange(rowIndex: number, column: Column, floating: string): boolean {
        return this.getCellRangeCount(rowIndex, column, floating) > 0;
    }

    // returns the number of ranges this cell is in
    public getCellRangeCount(rowIndex: number, column: Column, floating: string): number {
        if (_.missingOrEmpty(this.cellRanges)) {
            return 0;
        }

        var matchingCount = 0;

        this.cellRanges.forEach( (cellRange: RangeSelection) => {
            var columnInRange = cellRange.columns.indexOf(column) >= 0;
            var rowInRange = this.isRowInRange(rowIndex, floating, cellRange);
            if (columnInRange && rowInRange) {
                matchingCount++;
            }
        });

        return matchingCount;
    }

    private isRowInRange(rowIndex: number, floating: string, cellRange: RangeSelection): boolean {

        var row1 = new RowSelection(cellRange.rowStart, cellRange.floatingStart);
        var row2 = new RowSelection(cellRange.rowEnd, cellRange.floatingEnd);

        var firstRow = row1.before(row2) ? row1 : row2;
        var lastRow = row1.before(row2) ? row2 : row1;

        var thisRow = new RowSelection(rowIndex, floating);

        if (thisRow.equals(firstRow) || thisRow.equals(lastRow)) {
            return true;
        } else {
            var afterFirstRow = !thisRow.before(firstRow);
            var beforeLastRow = thisRow.before(lastRow);
            return afterFirstRow && beforeLastRow;
        }

    }

    public onDragStart(mouseEvent: MouseEvent): void {

        // ctrlKey for windows, metaKey for Apple
        var multiSelectKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        if (_.missing(this.cellRanges) || !multiSelectKeyPressed) {
            this.cellRanges = [];
        }

        var cell = this.mouseEventService.getCellForMouseEvent(mouseEvent);
        if (_.missing(cell)) {
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

        this.activeRange = {
            rowEnd: cell.rowIndex,
            floatingEnd: _.makeNull(cell.floating),
            rowStart: cell.rowIndex,
            floatingStart: _.makeNull(cell.floating),
            columnEnd: cell.column,
            columnStart: cell.column,
            columns: [cell.column]
        };

        this.cellRanges.push(this.activeRange);
    }

    private selectionChanged(finished: boolean, started: boolean): void {
        this.activeRange.columns = this.updateSelectedColumns(this.activeRange.columnStart, this.activeRange.columnEnd);
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

        var cell = this.mouseEventService.getCellForMouseEvent(mouseEvent);
        if (_.missing(cell)) {
            return;
        }

        var columnChanged = false;
        if (cell.column !== this.activeRange.columnEnd) {
            this.activeRange.columnEnd = cell.column;
            columnChanged = true;
        }

        var rowChanged = false;
        if (cell.rowIndex!==this.activeRange.rowEnd || cell.floating!==this.activeRange.floatingEnd) {
            this.activeRange.rowEnd = cell.rowIndex;
            this.activeRange.floatingEnd = cell.floating;
            rowChanged = true;
        }

        if (columnChanged || rowChanged) {
            this.selectionChanged(false, false);
        }
    }

    private updateSelectedColumns(columnFrom: Column, columnTo: Column): Column[] {
        var allDisplayedColumns = this.columnController.getAllDisplayedColumns();

        var fromIndex = allDisplayedColumns.indexOf(columnFrom);
        var toIndex = allDisplayedColumns.indexOf(columnTo);

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
            columns.push(allDisplayedColumns[i]);
        }

        return columns;
    }
}

class RowSelection {

    index: number;
    floating: string;

    constructor(index: number, floating: string) {
        this.index = index;
        // turn undefined into null, so
        this.floating = _.makeNull(floating);
    }

    equals(otherSelection: RowSelection): boolean {
        return this.index === otherSelection.index
                && this.floating === otherSelection.floating;
    }

    // tests if this row selection is before the other row selection
    before(otherSelection: RowSelection): boolean {
        var otherFloating = otherSelection.floating;
        switch (this.floating) {
            case Constants.FLOATING_TOP:
                // we we are floating top, and other isn't, then we are always before
                if (otherFloating!==Constants.FLOATING_TOP) { return true; }
                break;
            case Constants.FLOATING_BOTTOM:
                // if we are floating bottom, and the other isn't, then we are never before
                if (otherFloating!==Constants.FLOATING_BOTTOM) { return false; }
                break;
            default:
                // if we are not floating, but the other one is floating...
                if (_.exists(otherFloating)) {
                    if (otherFloating===Constants.FLOATING_TOP) {
                        // we are not floating, other is floating top, we are first
                        return false;
                    } else {
                        // we are not floating, other is floating bottom, we are always first
                        return true;
                    }
                }
                break;
        }
        return this.index <= otherSelection.index;
    }
}