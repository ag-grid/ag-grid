import {DragService} from "./dragService";
import HeaderRenderer from "./headerRenderer";
import {ColumnController} from "../columnController/columnController";
import _ from '../utils';
import Column from "../entities/column";
import GridPanel from "../gridPanel/gridPanel";

export class MoveColumnController {

    private column: Column;
    private lastDelta = 0;
    private clickPositionOnHeader: number;
    private startLeftPosition: number;

    private eFloatingCloneCell: HTMLElement;
    private eHeaderCell: HTMLElement;

    private headerRenderer: HeaderRenderer;
    private columnController: ColumnController;

    private floatPadding: number;
    private gridPanel: GridPanel;

    constructor(column: Column, eDraggableElement: HTMLElement, eRoot: HTMLElement, eHeaderCell: HTMLElement, headerRenderer: HeaderRenderer, columnController: ColumnController, dragService: DragService, gridPanel: GridPanel) {

        this.eHeaderCell = eHeaderCell;
        this.headerRenderer = headerRenderer;
        this.columnController = columnController;
        this.column = column;
        this.gridPanel = gridPanel;

        dragService.addDragHandling({
            eDraggableElement: eDraggableElement,
            eBody: eRoot,
            cursor: 'move',
            // we only want to start dragging if the user moves at least 4px, otherwise we will loose
            // the ability for the user to click on the cell (eg for sorting)
            startAfterPixels: 4,
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this)
        });
    }

    private onDragStart(event: MouseEvent): void {
        // the overlay spans all three (left, right, center), so we need to
        // pad the floating clone so it appears over the right container
        if (this.column.getPinned()===Column.PINNED_LEFT) {
            this.floatPadding = 0;
        } else if (this.column.getPinned()===Column.PINNED_RIGHT) {
            this.floatPadding = this.headerRenderer.getRightPinnedStartPixel();
        } else {
            this.floatPadding = this.columnController.getPinnedLeftContainerWidth();
            this.floatPadding -= this.gridPanel.getHorizontalScrollPosition();
        }

        // make clone of header cell for the 'floating ghost'
        this.eFloatingCloneCell = <HTMLElement> this.eHeaderCell.cloneNode(true);
        this.headerRenderer.eHeaderOverlay.appendChild(this.eFloatingCloneCell);
        this.startLeftPosition = this.columnController.getPixelsBeforeConsideringPinned(this.column);
        _.addCssClass(this.eFloatingCloneCell, 'ag-header-cell-moving-clone');
        this.eFloatingCloneCell.style.position = 'absolute';
        this.eFloatingCloneCell.style.top = 0 + 'px';
        this.eFloatingCloneCell.style.left = this.floatPadding + this.startLeftPosition + 'px';

        // showing menu while hovering looks ugly, so hide header
        var cloneMenu = <HTMLElement> this.eFloatingCloneCell.querySelector('#agMenu');
        if (cloneMenu) {
            cloneMenu.style.display = 'none';
        }

        // see how many pixels to the edge of the column we are
        var headerCellLeft = this.eHeaderCell.getBoundingClientRect().left;
        this.clickPositionOnHeader = event.clientX - headerCellLeft;
        this.column.setMoving(true);
    }

    private onDragging(delta: number, finished: boolean): void {

        this.eFloatingCloneCell.style.left = this.floatPadding + (this.startLeftPosition + delta) + 'px';
        var dragMovingRight = delta > this.lastDelta;
        var dragMovingLeft = delta < this.lastDelta;

        // the while loop keeps going until there are no more columns to move. this caters for the user
        // moving the mouse very fast and we need to swap the column twice or more
        var checkForAnotherColumn = true;
        while (checkForAnotherColumn) {

            // get current pixel position
            var hoveringOverPixel = this.startLeftPosition + this.clickPositionOnHeader + delta;

            var dragOverLeftColumn = this.column.getLeft() > hoveringOverPixel;
            var dragOverRightColumn = (this.column.getLeft() + this.column.getActualWidth()) < hoveringOverPixel;

            var wantToMoveLeft = dragOverLeftColumn && dragMovingLeft;
            var wantToMoveRight = dragOverRightColumn && dragMovingRight;

            checkForAnotherColumn = false;

            var colToSwapWith: Column = null;

            if (wantToMoveLeft) {
                colToSwapWith = this.columnController.getDisplayedColBeforeConsideringPinned(this.column);
            }
            if (wantToMoveRight) {
                colToSwapWith = this.columnController.getDisplayedColAfterConsideringPinned(this.column);
            }

            // if we are a closed group, we need to move all the columns, not just this one
            if (colToSwapWith) {
                var newIndex: number;
                // see if we are jumping a closed group
                var childrenToJump = this.getColumnsAndOrphans(colToSwapWith);
                if (wantToMoveLeft) {
                    newIndex = this.columnController.getColumnIndex(childrenToJump[0]);
                } else {
                    newIndex = this.columnController.getColumnIndex(childrenToJump[childrenToJump.length-1]);
                }

                // we move one column, UNLESS the column is the only visible column
                // of a group, in which case we move the whole group.
                var columnsToMove = this.getColumnsAndOrphans(this.column);
                this.columnController.moveColumns(columnsToMove.reverse(), newIndex);

                checkForAnotherColumn = true;
            }
        }

        this.lastDelta = delta;
        if (finished) {
            this.column.setMoving(false);
            this.headerRenderer.eHeaderOverlay.removeChild(this.eFloatingCloneCell);
        }
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