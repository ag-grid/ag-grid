import {Autowired, PostConstruct} from "../context/context";
import {LoggerFactory, Logger} from "../logger";
import {ColumnController} from "../columnController/columnController";
import {Column} from "../entities/column";
import {Utils as _} from "../utils";
import {DragAndDropService, DraggingEvent, HDirection} from "../dragAndDrop/dragAndDropService";
import {GridPanel} from "../gridPanel/gridPanel";
import {ColumnGroup} from "../entities/columnGroup";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export class MoveColumnController {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

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

    private eContainer: HTMLElement;

    public constructor(pinned: string, eContainer: HTMLElement) {
        this.pinned = pinned;
        this.eContainer = eContainer;
        this.centerContainer = !_.exists(pinned);
    }

    @PostConstruct
    public init(): void {
        this.logger = this.loggerFactory.create('MoveColumnController');
    }

    public getIconName(): string {
        return this.pinned ? DragAndDropService.ICON_PINNED : DragAndDropService.ICON_MOVE;
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // we do dummy drag, so make sure column appears in the right location when first placed
        var columns = draggingEvent.dragSource.dragItem;
        this.columnController.setColumnsVisible(columns, true);
        this.columnController.setColumnsPinned(columns, this.pinned);
        this.onDragging(draggingEvent, true);
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        var hideColumnOnExit = !this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns() && !draggingEvent.fromNudge;
        if (hideColumnOnExit) {
            var columns = draggingEvent.dragSource.dragItem;
            this.columnController.setColumnsVisible(columns, false);
        }
        this.ensureIntervalCleared();
    }

    public onDragStop(): void {
        this.ensureIntervalCleared();
    }

    private normaliseX(x: number): number {

        // flip the coordinate if doing RTL
        let flipHorizontallyForRtl = this.gridOptionsWrapper.isEnableRtl();
        if (flipHorizontallyForRtl) {
            let clientWidth = this.eContainer.clientWidth;
            x = clientWidth - x;
        }

        // adjust for scroll only if centre container (the pinned containers dont scroll)
        let adjustForScroll = this.centerContainer;
        if (adjustForScroll) {
            x += this.gridPanel.getBodyViewportScrollLeft();
        }

        return x;
    }

    private workOutNewIndex(displayedColumns: Column[], allColumns: Column[], dragColumn: Column, hDirection: HDirection, xAdjustedForScroll: number) {
        if (hDirection === HDirection.Left) {
            return this.getNewIndexForColMovingLeft(displayedColumns, allColumns, dragColumn, xAdjustedForScroll);
        } else {
            return this.getNewIndexForColMovingRight(displayedColumns, allColumns, dragColumn, xAdjustedForScroll);
        }
    }

    private checkCenterForScrolling(xAdjustedForScroll: number): void {
        if (this.centerContainer) {
            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
            var firstVisiblePixel = this.gridPanel.getBodyViewportScrollLeft();
            var lastVisiblePixel = firstVisiblePixel + this.gridPanel.getCenterWidth();

            if (this.gridOptionsWrapper.isEnableRtl()) {
                this.needToMoveRight = xAdjustedForScroll < (firstVisiblePixel + 50);
                this.needToMoveLeft = xAdjustedForScroll > (lastVisiblePixel - 50);
            } else {
                this.needToMoveLeft = xAdjustedForScroll < (firstVisiblePixel + 50);
                this.needToMoveRight = xAdjustedForScroll > (lastVisiblePixel - 50);
            }

            if (this.needToMoveLeft || this.needToMoveRight) {
                this.ensureIntervalStarted();
            } else {
                this.ensureIntervalCleared();
            }
        }
    }

    public onDragging(draggingEvent: DraggingEvent, fromEnter = false): void {

        this.lastDraggingEvent = draggingEvent;

        // if moving up or down (ie not left or right) then do nothing
        if (_.missing(draggingEvent.hDirection)) {
            return;
        }

        let xNormalised = this.normaliseX(draggingEvent.x);

        // if the user is dragging into the panel, ie coming from the side panel into the main grid,
        // we don't want to scroll the grid this time, it would appear like the table is jumping
        // each time a column is dragged in.
        if (!fromEnter) {
            this.checkCenterForScrolling(xNormalised);
        }

        let hDirectionNormalised = this.normaliseDirection(draggingEvent.hDirection);

        var columnsToMove = draggingEvent.dragSource.dragItem;
        this.attemptMoveColumns(columnsToMove, hDirectionNormalised, xNormalised, fromEnter);
    }

    private normaliseDirection(hDirection: HDirection): HDirection {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            switch (hDirection) {
                case HDirection.Left: return HDirection.Right;
                case HDirection.Right: return HDirection.Left;
                default: console.error(`ag-Grid: Unknown direction ${hDirection}`);
            }
        } else {
            return hDirection;
        }
    }

    private attemptMoveColumns(allMovingColumns: Column[], hDirection: HDirection, xAdjusted: number, fromEnter: boolean): void {
        var displayedColumns = this.columnController.getDisplayedColumns(this.pinned);
        var gridColumns = this.columnController.getAllGridColumns();

        var draggingLeft = hDirection === HDirection.Left;
        var draggingRight = hDirection === HDirection.Right;

        var dragColumn: Column;
        var displayedMovingColumns = _.filter(allMovingColumns, column => displayedColumns.indexOf(column) >= 0 );
        // if dragging left, we want to use the left most column, ie move the left most column to
        // under the mouse pointer
        if (draggingLeft) {
            dragColumn = displayedMovingColumns[0];
        // if dragging right, we want to keep the right most column under the mouse pointer
        } else {
            dragColumn = displayedMovingColumns[displayedMovingColumns.length-1];
        }

        var newIndex = this.workOutNewIndex(displayedColumns, gridColumns, dragColumn, hDirection, xAdjusted);
        var oldIndex = gridColumns.indexOf(dragColumn);

        // the two check below stop an error when the user grabs a group my a middle column, then
        // it is possible the mouse pointer is to the right of a column while been dragged left.
        // so we need to make sure that the mouse pointer is actually left of the left most column
        // if moving left, and right of the right most column if moving right

        // we check 'fromEnter' below so we move the column to the new spot if the mouse is coming from
        // outside the grid, eg if the column is moving from side panel, mouse is moving left, then we should
        // place the column to the RHS even if the mouse is moving left and the column is already on
        // the LHS. otherwise we stick to the rule described above.

        // only allow left drag if this column is moving left
        if (!fromEnter && draggingLeft && newIndex>=oldIndex) {
            return;
        }
        // only allow right drag if this column is moving right
        if (!fromEnter && draggingRight && newIndex<=oldIndex) {
            return;
        }

        // if moving right, the new index is the index of the right most column, so adjust to first column
        if (draggingRight) {
            newIndex = newIndex - allMovingColumns.length + 1;
        }

        this.columnController.moveColumns(allMovingColumns, newIndex);
    }
    
    private getNewIndexForColMovingLeft(displayedColumns: Column[], allColumns: Column[], dragColumn: Column, x: number): number {

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
            this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_PINNED);
            if (this.failedMoveAttempts > 7) {
                var columns = this.lastDraggingEvent.dragSource.dragItem;
                var pinType = this.needToMoveLeft ? Column.PINNED_LEFT : Column.PINNED_RIGHT;
                this.columnController.setColumnsPinned(columns, pinType);
                this.dragAndDropService.nudge();
            }
        }
    }
}