import {Bean} from "../context/context";
import {Autowired} from "../context/context";
import {LoggerFactory} from "../logger";
import {Logger} from "../logger";
import {ColumnController} from "../columnController/columnController";
import {Column} from "../entities/column";
import {Utils as _} from '../utils';
import {DragAndDropService} from "../dragAndDrop/dragAndDropService";
import {DraggingEvent} from "../dragAndDrop/dragAndDropService";
import {GridPanel} from "../gridPanel/gridPanel";
import {PostConstruct} from "../context/context";
import {ColumnGroup} from "../entities/columnGroup";

export class MoveColumnController {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;

    private needToMoveLeft = false;
    private needToMoveRight = false;
    private movingIntervalId: number;
    private intervalCount: number;

    private logger: Logger;
    private pinned: string;
    private centerContainer: boolean;

    private lastDraggingEvent: DraggingEvent;
    // this counts how long the user has been trying to scroll by dragging and failing,
    // if they fail x amount of times, then the column will get pinned. this is what gives
    // the 'hold and pin' functionality
    private failedMoveAttempts: number;

    public constructor(pinned: string) {
        this.pinned = pinned;
        this.centerContainer = !_.exists(pinned);
    }

    @PostConstruct
    public init(): void {
        this.logger = this.loggerFactory.create('MoveColumnController');
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // we do dummy drag, so make sure column appears in the right location when first placed
        this.columnController.setColumnVisible(draggingEvent.dragItem, true);
        this.columnController.setColumnPinned(draggingEvent.dragItem, this.pinned);
        this.onDragging(draggingEvent);
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.columnController.setColumnVisible(draggingEvent.dragItem, false);
        this.ensureIntervalCleared();
    }

    public onDragStop(): void {
        this.ensureIntervalCleared();
    }

    private adjustXForScroll(draggingEvent: DraggingEvent): number {
        if (this.centerContainer) {
            return draggingEvent.x + this.gridPanel.getHorizontalScrollPosition();
        } else {
            return draggingEvent.x;
        }
    }

    private workOutNewIndex(displayedColumns: Column[], allColumns: Column[], draggingEvent: DraggingEvent, xAdjustedForScroll: number) {
        if (draggingEvent.direction === DragAndDropService.DIRECTION_LEFT) {
            return this.getNewIndexForColMovingLeft(displayedColumns, allColumns, draggingEvent.dragItem, xAdjustedForScroll);
        } else {
            return this.getNewIndexForColMovingRight(displayedColumns, allColumns, draggingEvent.dragItem, xAdjustedForScroll);
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

    public onDragging(draggingEvent: DraggingEvent): void {

        this.lastDraggingEvent = draggingEvent;

        // if moving up or down (ie not left or right) then do nothing
        if (!draggingEvent.direction) {
            return;
        }

        var xAdjustedForScroll = this.adjustXForScroll(draggingEvent);
        this.checkCenterForScrolling(xAdjustedForScroll);

        // find out what the correct position is for this column
        this.checkColIndexAndMove(draggingEvent, xAdjustedForScroll);
    }

    private checkColIndexAndMove(draggingEvent: DraggingEvent, xAdjustedForScroll: number): void {
        var displayedColumns = this.columnController.getDisplayedColumns(this.pinned);
        var allColumns = this.columnController.getAllColumns();
        var newIndex = this.workOutNewIndex(displayedColumns, allColumns, draggingEvent, xAdjustedForScroll);
        var oldColumn = allColumns[newIndex];

        // if col already at required location, do nothing
        if (oldColumn === draggingEvent.dragItem) {
            return;
        }

        // we move one column, UNLESS the column is the only visible column
        // of a group, in which case we move the whole group.
        var columnsToMove = this.getColumnsAndOrphans(draggingEvent.dragItem);
        this.columnController.moveColumns(columnsToMove.reverse(), newIndex);
    }

    private getNewIndexForColMovingLeft(displayedColumns: Column[], allColumns: Column[], dragColumnOrGroup: Column | ColumnGroup, x: number): number {

        var dragColumn = <Column> dragColumnOrGroup;

        var usedX = 0;
        var leftColumn: Column = null;

        for (var i = 0; i < displayedColumns.length; i++) {

            var currentColumn = displayedColumns[i];
            if (currentColumn === dragColumn) { continue; }
            usedX += currentColumn.getActualWidth();

            if (usedX > x) {
                break;
            }

            leftColumn = currentColumn;
        }

        var newIndex: number;
        if (leftColumn) {
            newIndex = allColumns.indexOf(leftColumn) + 1;
            var oldIndex = allColumns.indexOf(dragColumn);
            if (oldIndex<newIndex) {
                newIndex--;
            }
        } else {
            newIndex = 0;
        }

        return newIndex;
    }

    private getNewIndexForColMovingRight(displayedColumns: Column[], allColumns: Column[], dragColumnOrGroup: Column | ColumnGroup, x: number): number {

        var dragColumn = <Column> dragColumnOrGroup;

        var usedX = dragColumn.getActualWidth();
        var leftColumn: Column = null;

        for (var i = 0; i < displayedColumns.length; i++) {

            if (usedX > x) {
                break;
            }

            var currentColumn = displayedColumns[i];
            if (currentColumn === dragColumn) { continue; }
            usedX += currentColumn.getActualWidth();

            leftColumn = currentColumn;
        }

        var newIndex: number;
        if (leftColumn) {
            newIndex = allColumns.indexOf(leftColumn) + 1;
            var oldIndex = allColumns.indexOf(dragColumn);
            if (oldIndex<newIndex) {
                newIndex--;
            }
        } else {
            newIndex = 0;
        }

        return newIndex;
    }

    private getColumnsAndOrphans(columnOrGroup: Column | ColumnGroup): Column[] {
        var column = <Column> columnOrGroup;
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
            this.failedMoveAttempts = 0;
            this.movingIntervalId = setInterval(this.moveInterval.bind(this), 100);
            if (this.needToMoveLeft) {
                this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_LEFT, true);
            } else {
                this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_RIGHT, true);
            }
        }
    }

    private ensureIntervalCleared(): void {
        if (this.moveInterval) {
            clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
            this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_MOVE);
        }
    }

    private moveInterval(): void {
        var pixelsToMove: number;
        this.intervalCount++;
        pixelsToMove = 10 + (this.intervalCount * 5);
        if (pixelsToMove > 100) {
            pixelsToMove = 100;
        }

        var pixelsMoved: number;
        if (this.needToMoveLeft) {
            pixelsMoved = this.gridPanel.scrollHorizontally(-pixelsToMove);
        } else if (this.needToMoveRight) {
            pixelsMoved = this.gridPanel.scrollHorizontally(pixelsToMove);
        }

        if (pixelsMoved !== 0) {
            this.onDragging(this.lastDraggingEvent);
            this.failedMoveAttempts = 0;
        } else {
            this.failedMoveAttempts++;
            if (this.failedMoveAttempts > 7) {
                if (this.needToMoveLeft) {
                    this.columnController.setColumnPinned(this.lastDraggingEvent.dragItem, Column.PINNED_LEFT);
                } else {
                    this.columnController.setColumnPinned(this.lastDraggingEvent.dragItem, Column.PINNED_RIGHT);
                }
                this.dragAndDropService.nudge();
            }
        }
    }
}