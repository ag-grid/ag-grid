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

    private getColumn(mouseEvent: MouseEvent): Column {
        var allColumns = this.columnController.getDisplayedCenterColumns();
        if (allColumns.length===0) {
            return null;
        }

        var clientRect = this.gridPanel.getBodyViewportBoundingClientRect();
        var scrollX = this.gridPanel.getHorizontalScrollPosition();

        var bodyX = mouseEvent.clientX - clientRect.left + scrollX;

        var hoveringColumn: Column;
        if (bodyX < 0) {
            hoveringColumn = allColumns[0];
        }

        allColumns.forEach( column => {
            var afterLeft = bodyX >= column.getLeft();
            var beforeRight = bodyX <= column.getRight();
            if (afterLeft && beforeRight) {
                hoveringColumn = column;
            }
        });

        if (!hoveringColumn) {
            hoveringColumn = allColumns[allColumns.length - 1];
        }

        return hoveringColumn;
    }

    private updateSelectedColumns(): void {
        this.selectedColumns = [];

        var allDisplayedColumns = this.columnController.getAllColumns();

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
        var clientRect = this.gridPanel.getBodyViewportBoundingClientRect();
        var scrollY = this.gridPanel.getVerticalScrollPosition();

        var bodyY = mouseEvent.clientY - clientRect.top + scrollY;
        var rowIndex = this.rowModel.getRowAtPixel(bodyY);

        return rowIndex;
    }

}