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

@Bean('rangeController')
export class RangeController implements IRangeController {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;

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
    }

    public getCellRanges(): RangeSelection[] {
        return this.cellRanges;
    }

    public clearSelection(): void {
        this.activeRange = null;
        this.cellRanges = null;
        this.dispatchChangedChangedEvent(true, false);
    }

    // as the user is dragging outside of the panel, the div starts to scroll, which in turn
    // means we are selection more (or less) cells, but the mouse isn't moving, so we recalculate
    // the selection my mimicking a new mouse event
    private onBodyScroll(event: Event): void {
        this.onDragging(this.lastMouseEvent);
    }

    // returns the number of ranges this cell is in
    public getCellRangeCount(rowIndex: number, column: Column): number {
        if (_.missingOrEmpty(this.cellRanges)) {
            return 0;
        }

        var matchingCount = 0;

        this.cellRanges.forEach( (cellRange: RangeSelection) => {
            var columnInRange = cellRange.columns.indexOf(column) >= 0;

            var rowInRange: boolean;
            if (cellRange.rowStart < cellRange.rowEnd) {
                rowInRange = rowIndex >= cellRange.rowStart && rowIndex <= cellRange.rowEnd;
            } else {
                rowInRange = rowIndex >= cellRange.rowEnd && rowIndex <= cellRange.rowStart;
            }

            if (columnInRange && rowInRange) {
                matchingCount++;
            }
        });

        return matchingCount;
    }

    public onDragStart(mouseEvent: MouseEvent): void {

        // ctrlKey for windows, metaKey for Apple
        var multiSelectKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        if (!multiSelectKeyPressed) {
            this.cellRanges = [];
        }

        this.createNewActiveRange(mouseEvent);

        this.gridPanel.addScrollEventListener(this.bodyScrollListener);
        this.dragging = true;

        this.lastMouseEvent = mouseEvent;

        this.selectionChanged(false, true);
    }

    private createNewActiveRange(mouseEvent: MouseEvent): void {
        var rowIndex = this.getRowIndex(mouseEvent);
        var column = this.getColumn(mouseEvent);

        this.activeRange = {
            rowEnd: rowIndex,
            rowStart: rowIndex,
            columnEnd: column,
            columnStart: column,
            columns: [column]
        };

        this.cellRanges.push(this.activeRange);
    }

    private selectionChanged(finished: boolean, started: boolean): void {
        this.updateSelectedColumns();
        this.dispatchChangedChangedEvent(finished, started);
    }

    private dispatchChangedChangedEvent(finished: boolean, started: boolean): void {
        this.eventService.dispatchEvent(Events.EVENT_RANGE_SELECTION_CHANGED, {finished: finished, started: started});
    }

    public onDragStop(): void {
        this.gridPanel.removeScrollEventListener(this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
        this.dispatchChangedChangedEvent(true, false);
    }

    public onDragging(mouseEvent: MouseEvent): void {
        this.lastMouseEvent = mouseEvent;

        var columnChanged = false;
        var column = this.getColumn(mouseEvent);
        if (column !== this.activeRange.columnEnd) {
            this.activeRange.columnEnd = column;
            columnChanged = true;
        }

        var rowChanged = false;
        var rowIndex = this.getRowIndex(mouseEvent);
        if (rowIndex!==this.activeRange.rowEnd) {
            this.activeRange.rowEnd = rowIndex;
            rowChanged = true;
        }

        if (columnChanged || rowChanged) {
            this.selectionChanged(false, false);
        }
    }

    private getContainer(mouseEvent: MouseEvent): string {
        var centerRect = this.gridPanel.getBodyViewportClientRect();

        var mouseX = mouseEvent.clientX;
        if (mouseX < centerRect.left && this.columnController.isPinningLeft()) {
            return Column.PINNED_LEFT;
        } else if (mouseX > centerRect.right && this.columnController.isPinningRight()) {
            return Column.PINNED_RIGHT;
        } else {
            return null;
        }
    }

    private getColumnsForContainer(container: string): Column[] {
        switch (container) {
            case Column.PINNED_LEFT: return this.columnController.getDisplayedLeftColumns();
            case Column.PINNED_RIGHT: return this.columnController.getDisplayedRightColumns();
            default: return this.columnController.getDisplayedCenterColumns();
        }
    }

    private getXForContainer(container: string, mouseEvent: MouseEvent): number {
        var containerX: number;
        switch (container) {
            case Column.PINNED_LEFT:
                containerX = this.gridPanel.getPinnedLeftColsViewportClientRect().left;
                break;
            case Column.PINNED_RIGHT:
                containerX = this.gridPanel.getPinnedRightColsViewportClientRect().left;
                break;
            default:
                var centerRect = this.gridPanel.getBodyViewportClientRect();
                var centerScroll = this.gridPanel.getHorizontalScrollPosition();
                containerX = centerRect.left - centerScroll;
        }
        var result = mouseEvent.clientX - containerX;
        return result;
    }

    private getColumn(mouseEvent: MouseEvent): Column {
        if (this.columnController.isEmpty()) {
            return null;
        }

        var container = this.getContainer(mouseEvent);
        var columns = this.getColumnsForContainer(container);
        var containerX = this.getXForContainer(container, mouseEvent);

        var hoveringColumn: Column;
        if (containerX < 0) {
            hoveringColumn = columns[0];
        }

        columns.forEach( column => {
            var afterLeft = containerX >= column.getLeft();
            var beforeRight = containerX <= column.getRight();
            if (afterLeft && beforeRight) {
                hoveringColumn = column;
            }
        });

        if (!hoveringColumn) {
            hoveringColumn = columns[columns.length - 1];
        }

        return hoveringColumn;
    }

    private updateSelectedColumns(): void {
        var allDisplayedColumns = this.columnController.getAllDisplayedColumns();

        var firstIndex = allDisplayedColumns.indexOf(this.activeRange.columnStart);
        var lastIndex = allDisplayedColumns.indexOf(this.activeRange.columnEnd);

        if (firstIndex > lastIndex) {
            var copy = firstIndex;
            firstIndex = lastIndex;
            lastIndex = copy;
        }

        var columns: Column[] = [];
        for (var i = firstIndex; i<=lastIndex; i++) {
            columns.push(allDisplayedColumns[i]);
        }

        this.activeRange.columns = columns;
    }

    private getRowIndex(mouseEvent: MouseEvent): number {
        var clientRect = this.gridPanel.getBodyViewportClientRect();
        var scrollY = this.gridPanel.getVerticalScrollPosition();

        var bodyY = mouseEvent.clientY - clientRect.top + scrollY;
        var rowIndex = this.rowModel.getRowAtPixel(bodyY);

        return rowIndex;
    }

}