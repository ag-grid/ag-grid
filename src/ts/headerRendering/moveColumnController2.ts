import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {LoggerFactory} from "../logger";
import {Logger} from "../logger";
import {ColumnController} from "../columnController/columnController";
import Column from "../entities/column";
import _ from '../utils';
import {DragAndDropService2} from "../dragAndDrop/dragAndDropService2";
import {DraggingEvent} from "../dragAndDrop/dragAndDropService2";

@Bean('moveColumnController2')
export class MoveColumnController2 {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('columnController') private columnController: ColumnController;

    private logger: Logger;

    public agPostWire(): void {
        this.logger = this.loggerFactory.create('MoveColumnController2');
    }

    public onDragEnter(container: string, draggingParams: DraggingEvent): void {
        this.columnController.setColumnPinned(draggingParams.dragItem, container);
        this.columnController.setColumnVisible(draggingParams.dragItem, true);
    }

    public onDragLeave(container: string, draggingParams: DraggingEvent): void {
        this.columnController.setColumnVisible(draggingParams.dragItem, false);
    }

    public onDragging(container: string, draggingParams: DraggingEvent): void {

        // if moving up or down (ie not left or right) then do nothing
        if (!draggingParams.direction) {
            return;
        }

        // if column in wrong container, move it here

        // from here on, assuming column is in the right container

        // find out what the correct position is for this column
        var columns = this.columnController.getDisplayedColumns(container);
        var allColumns = this.columnController.getAllColumns();

        var newIndex: number;
        if (draggingParams.direction==DragAndDropService2.DIRECTION_LEFT) {
            newIndex = this.getNewIndexForColMovingLeft(columns, allColumns, draggingParams.dragItem, draggingParams.x);
        } else {
            newIndex = this.getNewIndexForColMovingRight(columns, allColumns, draggingParams.dragItem, draggingParams.x);
        }

        var oldColumn = columns[newIndex];

        // if col already at required location, do nothing
        if (oldColumn===draggingParams.dragItem) {
            return;
        }

        // we move one column, UNLESS the column is the only visible column
        // of a group, in which case we move the whole group.
        var columnsToMove = this.getColumnsAndOrphans(draggingParams.dragItem);
        this.columnController.moveColumns(columnsToMove.reverse(), newIndex);

/*
        // the while loop keeps going until there are no more columns to move. this caters for the user
        // moving the mouse very fast and we need to swap the column twice or more
        var checkForAnotherColumn = true;
        while (checkForAnotherColumn) {

            var dragOverLeftColumn = this.column.getLeft() > hoveringOverPixel;
            var dragOverRightColumn = (this.column.getLeft() + this.column.getActualWidth()) < hoveringOverPixel;

            var wantToMoveLeft = dragOverLeftColumn && dragMovingLeft;
            var wantToMoveRight = dragOverRightColumn && dragMovingRight;

            checkForAnotherColumn = false;

            var colToSwapWith: Column = null;

            if (wantToMoveLeft) {
                colToSwapWith = this.columnController.getDisplayedColBeforeForMoving(this.column);
            }
            if (wantToMoveRight) {
                colToSwapWith = this.columnController.getDisplayedColAfterForMoving(this.column);
            }

            // if we are a closed group, we need to move all the columns, not just this one
            if (colToSwapWith) {
                var newIndex = this.columnController.getColumnIndex(colToSwapWith);

                // we move one column, UNLESS the column is the only visible column
                // of a group, in which case we move the whole group.
                var columnsToMove = this.getColumnsAndOrphans(this.column);
                this.columnController.moveColumns(columnsToMove.reverse(), newIndex);

                checkForAnotherColumn = true;
            }
        }

        // we only look to scroll if the column is not pinned, as pinned columns are always visible
        if (!this.column.isPinned()) {
            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
            //var hoveringOverPixelScrollAdjusted = this.startLeftPosition + this.clickPositionOnHeaderScrollAdjusted + delta;
            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
            var firstVisiblePixel = this.gridPanel.getHorizontalScrollPosition();
            var lastVisiblePixel = firstVisiblePixel + this.gridPanel.getCenterWidth();
            this.needToMoveLeft = hoveringOverPixel < (firstVisiblePixel + 50);
            this.needToMoveRight = hoveringOverPixel > (lastVisiblePixel - 50);
            if (this.needToMoveLeft || this.needToMoveRight) {
                this.ensureIntervalStarted();
            } else {
                this.ensureIntervalCleared();
            }
        }

        this.lastDelta = delta;
        */
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

}