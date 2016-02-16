import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {LoggerFactory} from "../logger";
import {Logger} from "../logger";
import {ColumnController} from "../columnController/columnController";
import Column from "../entities/column";
import _ from '../utils';
import {DragAndDropService2} from "../dragAndDrop/dragAndDropService2";
import {DraggingEvent} from "../dragAndDrop/dragAndDropService2";
import GridPanel from "../gridPanel/gridPanel";

export class MoveColumnController2 {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridPanel') private gridPanel: GridPanel;

    private needToMoveLeft = false;
    private needToMoveRight = false;
    private movingIntervalId: number;
    private intervalCount: number;

    private logger: Logger;
    private pinned: string;
    private centerContainer: boolean;

    private lastDraggingEvent: DraggingEvent;

    public constructor(pinned: string) {
        this.pinned = pinned;
        this.centerContainer = !_.exists(pinned);
    }

    public agPostWire(): void {
        this.logger = this.loggerFactory.create('MoveColumnController2');
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        this.columnController.setColumnPinned(draggingEvent.dragItem, this.pinned);
        this.columnController.setColumnVisible(draggingEvent.dragItem, true);
        this.onDragging(draggingEvent);
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.columnController.setColumnVisible(draggingEvent.dragItem, false);
        this.ensureIntervalCleared();
    }

    public onDragStop(): void {
        this.ensureIntervalCleared();
    }

    private adjustXForScroll(draggingParams: DraggingEvent): number {
        if (this.centerContainer) {
            return draggingParams.x + this.gridPanel.getHorizontalScrollPosition();
        } else {
            return draggingParams.x;
        }

    }

    private workOutNewIndex(columns: Column[], allColumns: Column[], draggingParams: DraggingEvent, xAdjustedForScroll: number) {
        if (draggingParams.direction === DragAndDropService2.DIRECTION_LEFT) {
            return this.getNewIndexForColMovingLeft(columns, allColumns, draggingParams.dragItem, xAdjustedForScroll);
        } else {
            return this.getNewIndexForColMovingRight(columns, allColumns, draggingParams.dragItem, xAdjustedForScroll);
        }
    }

    private checkCenterForScrolling(xAdjustedForScroll: number): void {
        if (this.centerContainer) {
            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
            var firstVisiblePixel = this.gridPanel.getHorizontalScrollPosition();
            var lastVisiblePixel = firstVisiblePixel + this.gridPanel.getCenterWidth();

            this.needToMoveLeft = xAdjustedForScroll < (firstVisiblePixel + 50);
            this.needToMoveRight = xAdjustedForScroll > (lastVisiblePixel - 50);

            if (this.needToMoveLeft || this.needToMoveRight) {
                this.ensureIntervalStarted();
            } else {
                this.ensureIntervalCleared();
            }
        }
    }

    public onDragging(draggingParams: DraggingEvent): void {

        this.lastDraggingEvent = draggingParams;

        // if moving up or down (ie not left or right) then do nothing
        if (!draggingParams.direction) {
            return;
        }

        var xAdjustedForScroll = this.adjustXForScroll(draggingParams);
        this.checkCenterForScrolling(xAdjustedForScroll);

        // find out what the correct position is for this column
        var columns = this.columnController.getDisplayedColumns(this.pinned);
        var allColumns = this.columnController.getAllColumns();

        var newIndex = this.workOutNewIndex(columns, allColumns, draggingParams, xAdjustedForScroll);

        var oldColumn = columns[newIndex];

        // if col already at required location, do nothing
        if (oldColumn === draggingParams.dragItem) {
            return;
        }

        // we move one column, UNLESS the column is the only visible column
        // of a group, in which case we move the whole group.
        var columnsToMove = this.getColumnsAndOrphans(draggingParams.dragItem);
        this.columnController.moveColumns(columnsToMove.reverse(), newIndex);
    }

    private getNewIndexForColMovingLeft(displayedColumns: Column[], allColumns: Column[], dragItem: Column, x: number): number {

        var usedX = 0;
        var leftColumn: Column = null;

        for (var i = 0; i < displayedColumns.length; i++) {

            var currentColumn = displayedColumns[i];
            if (currentColumn === dragItem) { continue; }
            usedX += currentColumn.getActualWidth();

            if (usedX > x) {
                break;
            }

            leftColumn = currentColumn;
        }

        var newIndex: number;
        if (leftColumn) {
            newIndex = allColumns.indexOf(leftColumn) + 1;
            var oldIndex = allColumns.indexOf(dragItem);
            if (oldIndex<newIndex) {
                newIndex--;
            }
        } else {
            newIndex = 0;
        }

        return newIndex;
    }

    private getNewIndexForColMovingRight(displayedColumns: Column[], allColumns: Column[], dragItem: Column, x: number): number {

        var usedX = dragItem.getActualWidth();
        var leftColumn: Column = null;

        for (var i = 0; i < displayedColumns.length; i++) {

            if (usedX > x) {
                break;
            }

            var currentColumn = displayedColumns[i];
            if (currentColumn === dragItem) { continue; }
            usedX += currentColumn.getActualWidth();

            leftColumn = currentColumn;
        }

        var newIndex: number;
        if (leftColumn) {
            newIndex = allColumns.indexOf(leftColumn) + 1;
            var oldIndex = allColumns.indexOf(dragItem);
            if (oldIndex<newIndex) {
                newIndex--;
            }
        } else {
            newIndex = 0;
        }

        return newIndex;
    }

    private getColumnsAndOrphans(column: Column): Column[] {
        // if this column was to move, how many children would be left without a parent
        var pathToChild = this.columnController.getPathForColumn(column);

        for (var i = pathToChild.length - 1; i>=0; i--) {
            var columnGroup = pathToChild[i];
            var onlyDisplayedChild = columnGroup.getDisplayedChildren().length === 1;
            var moreThanOneChild = columnGroup.getChildren().length > 1;
            if (onlyDisplayedChild && moreThanOneChild) {
                // return total columns below here, not including the column under inspection
                var leafColumns = columnGroup.getLeafColumns();
                return leafColumns;
            }
        }

        return [column];
    }

    private ensureIntervalStarted(): void {
        if (!this.movingIntervalId) {
            this.intervalCount = 0;
            this.movingIntervalId = setInterval(this.moveInterval.bind(this), 100);
        }
    }

    private ensureIntervalCleared(): void {
        if (this.moveInterval) {
            clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
        }
    }

    private moveInterval(): void {
        var pixelsToMove: number;
        this.intervalCount++;
        pixelsToMove = 10 + (this.intervalCount * 5);
        if (pixelsToMove > 100) {
            pixelsToMove = 100;
        }

        var pixelsMoved = 0;
        if (this.needToMoveLeft) {
            this.gridPanel.scrollHorizontally(-pixelsToMove);
        } else if (this.needToMoveRight) {
            this.gridPanel.scrollHorizontally(pixelsToMove);
        }

        this.onDragging(this.lastDraggingEvent);
    }
}