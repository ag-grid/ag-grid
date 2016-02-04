import {DragService} from "./dragService";
import HeaderRenderer from "./headerRenderer";
import {ColumnController} from "../columnController/columnController";
import _ from '../utils';
import Column from "../entities/column";

export class MoveColumnController {

    private column: Column;
    private lastDelta = 0;
    private deltaUsed: number;
    private clickPositionOnHeader: number;
    private startLeftPosition: number;

    private eFloatingCloneCell: HTMLElement;
    private eHeaderCell: HTMLElement;

    private headerRenderer: HeaderRenderer;
    private columnController: ColumnController;

    constructor(column: Column, eDraggableElement: HTMLElement, eRoot: HTMLElement, eHeaderCell: HTMLElement, headerRenderer: HeaderRenderer, columnController: ColumnController, dragService: DragService) {

        this.eHeaderCell = eHeaderCell;
        this.headerRenderer = headerRenderer;
        this.columnController = columnController;
        this.column = column;

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
        this.deltaUsed = 0;

        // make clone of header cell for the 'floating ghost'
        this.eFloatingCloneCell = <HTMLElement> this.eHeaderCell.cloneNode(true);
        this.headerRenderer.eHeaderOverlay.appendChild(this.eFloatingCloneCell);
        this.startLeftPosition = this.columnController.getPixelsBeforeConsideringPinned(this.column);
        _.addCssClass(this.eFloatingCloneCell, 'ag-header-cell-moving-clone');
        this.eFloatingCloneCell.style.position = 'absolute';
        this.eFloatingCloneCell.style.top = 0 + 'px';
        this.eFloatingCloneCell.style.left = this.startLeftPosition + 'px';

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
        // we have leapfrogged a column if we move more than the previous columns width
        this.eFloatingCloneCell.style.left = (this.startLeftPosition + delta) + 'px';
        var dragMovingRight = delta > this.lastDelta;
        var dragMovingLeft = delta < this.lastDelta;

        // the while loop keeps going until there are no more columns to move. this caters for the user
        // moving the mouse very fast and we need to swap the column twice or more
        var needToCheckForColumnMove = true;
        while (needToCheckForColumnMove) {
            var deltaAdjusted = delta - this.deltaUsed;

            var dragOverLeftColumn = -deltaAdjusted > this.clickPositionOnHeader;
            var dragOverRightColumn = deltaAdjusted > (this.column.getActualWidth() - this.clickPositionOnHeader);

            if (dragOverLeftColumn && dragMovingLeft) {
                // move left
                var leftColumn = this.columnController.getDisplayedColBeforeConsideringPinned(this.column);
                if (leftColumn) {
                    var oldIndex = this.columnController.getColumnIndex(this.column);
                    this.columnController.moveColumn(oldIndex, oldIndex-1);
                    this.deltaUsed -= leftColumn.getActualWidth();
                }
            } else if (dragOverRightColumn && dragMovingRight) {
                // move right
                var rightColumn = this.columnController.getDisplayedColAfterConsideringPinned(this.column);

                if (rightColumn) {
                    var oldIndex = this.columnController.getColumnIndex(this.column);
                    this.columnController.moveColumn(oldIndex, oldIndex+1);
                    this.deltaUsed += rightColumn.getActualWidth();
                }
            } else {
                needToCheckForColumnMove = false;
            }
        }

        this.lastDelta = delta;
        if (finished) {
            this.column.setMoving(false);
            this.headerRenderer.eHeaderOverlay.removeChild(this.eFloatingCloneCell);
        }
    }

}