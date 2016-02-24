import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {LoggerFactory} from "../logger";
import {PostConstruct} from "../context/context";
import {Logger} from "../logger";
import GridPanel from "../gridPanel/gridPanel";
import {IRowModel} from "../rowControllers/iRowModel";
import EventService from "../eventService";
import {Events} from "../events";
import Column from "../entities/column";
import {ColumnController} from "../columnController/columnController";
import _ from '../utils';
import RowRenderer from "../rendering/rowRenderer";
import {FocusedCellController} from "../focusedCellController";

@Bean('rangeSelectorController')
export class RangeSelectorController {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;

    private logger: Logger;

    private dragStartRowIndex: number;
    private dragEndRowIndex: number;

    private dragStartColumn: Column;
    private dragEndColumn: Column;

    private selectedColumns: Column[];

    private lastMouseEvent: MouseEvent;

    private bodyScrollListener = this.onBodyScroll.bind(this);

    private dragging = false;

    @PostConstruct
    private init(): void {
        this.logger = this.loggerFactory.create('RangeSelectorController');

        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.clearSelection.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearSelection.bind(this));
    }

    private clearSelection(): void {
        this.dragStartRowIndex = null;
        this.dragEndRowIndex = null;
        this.dragStartColumn = null;
        this.dragEndColumn = null;
        this.selectedColumns = null;
        this.selectionChanged();
    }

    // as the user is dragging outside of the panel, the div starts to scroll, which in turn
    // means we are selection more (or less) cells, but the mouse isn't moving, so we recalculate
    // the selection my mimicking a new mouse event
    private onBodyScroll(event: Event): void {
        this.onDragging(this.lastMouseEvent);
    }

    public isColumnInRange(column: Column): boolean {
        return this.selectedColumns && this.selectedColumns.indexOf(column) >= 0;
    }

    public isRowInRange(rowIndex: number): boolean {
        if (this.dragStartRowIndex < this.dragEndRowIndex) {
            return rowIndex >= this.dragStartRowIndex && rowIndex <= this.dragEndRowIndex;
        } else {
            return rowIndex >= this.dragEndRowIndex && rowIndex <= this.dragStartRowIndex;
        }
    }

    public onDragStart(mouseEvent: MouseEvent): void {
        var rowIndex = this.getRowIndex(mouseEvent);
        this.dragStartRowIndex = rowIndex;
        this.dragEndRowIndex = rowIndex;

        var column = this.getColumn(mouseEvent);
        this.dragStartColumn = column;
        this.dragEndColumn = column;

        this.gridPanel.addVerticalScrollListener(this.bodyScrollListener);
        this.dragging = true;

        this.lastMouseEvent = mouseEvent;

        this.selectionChanged();
    }

    private selectionChanged(): void {
        //this.focusedCellController.setFocusedCell(this.dragEndRowIndex, this.dragEndColumn, true);
        this.updateSelectedColumns();
        this.eventService.dispatchEvent(Events.EVENT_RANGE_SELECTION_CHANGED);
    }

    public onDragStop(mouseEvent: MouseEvent): void {
        this.gridPanel.removeVerticalScrollListener(this.bodyScrollListener);
        this.lastMouseEvent = null;
        this.dragging = false;
    }

    public onDragging(mouseEvent: MouseEvent): void {
        this.lastMouseEvent = mouseEvent;

        var columnChanged = false;
        var column = this.getColumn(mouseEvent);
        if (column !== this.dragEndColumn) {
            this.dragEndColumn = column;
            columnChanged = true;
        }

        var rowChanged = false;
        var rowIndex = this.getRowIndex(mouseEvent);
        if (rowIndex!==this.dragEndRowIndex) {
            this.dragEndRowIndex = rowIndex;
            rowChanged = true;
        }

        if (columnChanged || rowChanged) {
            this.selectionChanged();
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

        console.log(`=> ${container} -> ${hoveringColumn ? hoveringColumn.getId() : null}`);

        return hoveringColumn;
    }

    private updateSelectedColumns(): void {
        this.selectedColumns = [];

        var allDisplayedColumns = this.columnController.getAllDisplayedColumns();

        var firstIndex = allDisplayedColumns.indexOf(this.dragStartColumn);
        var lastIndex = allDisplayedColumns.indexOf(this.dragEndColumn);

        if (firstIndex > lastIndex) {
            var copy = firstIndex;
            firstIndex = lastIndex;
            lastIndex = copy;
        }

        for (var i = firstIndex; i<=lastIndex; i++) {
            this.selectedColumns.push(allDisplayedColumns[i]);
        }
    }

    private getRowIndex(mouseEvent: MouseEvent): number {
        var clientRect = this.gridPanel.getBodyViewportClientRect();
        var scrollY = this.gridPanel.getVerticalScrollPosition();

        var bodyY = mouseEvent.clientY - clientRect.top + scrollY;
        var rowIndex = this.rowModel.getRowAtPixel(bodyY);

        return rowIndex;
    }

}