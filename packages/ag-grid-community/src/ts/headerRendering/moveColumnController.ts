import {Autowired, PostConstruct} from "../context/context";
import {Logger, LoggerFactory} from "../logger";
import {ColumnController} from "../columnController/columnController";
import {Column} from "../entities/column";
import {_} from "../utils";
import {DragAndDropService, DraggingEvent, DragSourceType, HDirection} from "../dragAndDrop/dragAndDropService";
import {GridPanel} from "../gridPanel/gridPanel";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {DropListener} from "./bodyDropTarget";
import {ColumnEventType} from "../events";

export class MoveColumnController implements DropListener {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private gridPanel: GridPanel;

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

    constructor(pinned: string, eContainer: HTMLElement) {
        this.pinned = pinned;
        this.eContainer = eContainer;
        this.centerContainer = !_.exists(pinned);
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
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

        const columns = draggingEvent.dragItem.columns;
        const dragCameFromToolPanel = draggingEvent.dragSource.type === DragSourceType.ToolPanel;
        if (dragCameFromToolPanel) {
            // the if statement doesn't work if drag leaves grid, then enters again
            this.setColumnsVisible(columns, true, "uiColumnDragged");
        } else {
            // restore previous state of visible columns upon re-entering. this means if the user drags
            // a group out, and then drags the group back in, only columns that were originally visible
            // will be visible again. otherwise a group with three columns (but only two visible) could
            // be dragged out, then when it's dragged in again, all three are visible. this stops that.
            const visibleState = draggingEvent.dragItem.visibleState;
            const visibleColumns: Column[] = columns.filter(column => visibleState[column.getId()]);
            this.setColumnsVisible(visibleColumns, true, "uiColumnDragged");
        }

        this.setColumnsPinned(columns, this.pinned, "uiColumnDragged");
        this.onDragging(draggingEvent, true);
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        const hideColumnOnExit = !this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns() && !draggingEvent.fromNudge;
        if (hideColumnOnExit) {
            const dragItem = draggingEvent.dragSource.dragItemCallback();
            const columns = dragItem.columns;
            this.setColumnsVisible(columns, false, "uiColumnDragged");
        }
        this.ensureIntervalCleared();
    }

    public setColumnsVisible(columns: Column[], visible: boolean, source: ColumnEventType = "api") {
        if (columns) {
            const allowedCols = columns.filter(c => !c.getColDef().lockVisible);
            this.columnController.setColumnsVisible(allowedCols, visible, source);
        }
    }

    public setColumnsPinned(columns: Column[], pinned: string, source: ColumnEventType = "api") {
        if (columns) {
            const allowedCols = columns.filter(c => !c.getColDef().lockPinned);
            this.columnController.setColumnsPinned(allowedCols, pinned, source);
        }
    }

    public onDragStop(): void {
        this.ensureIntervalCleared();
    }

    private normaliseX(x: number): number {

        // flip the coordinate if doing RTL
        const flipHorizontallyForRtl = this.gridOptionsWrapper.isEnableRtl();
        if (flipHorizontallyForRtl) {
            const clientWidth = this.eContainer.clientWidth;
            x = clientWidth - x;
        }

        // adjust for scroll only if centre container (the pinned containers dont scroll)
        const adjustForScroll = this.centerContainer;
        if (adjustForScroll) {
            x += this.gridPanel.getCenterViewportScrollLeft();
        }

        return x;
    }

    private checkCenterForScrolling(xAdjustedForScroll: number): void {
        if (this.centerContainer) {
            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
            const firstVisiblePixel = this.gridPanel.getCenterViewportScrollLeft();
            const lastVisiblePixel = firstVisiblePixel + this.gridPanel.getCenterWidth();

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

        const mouseXNormalised = this.normaliseX(draggingEvent.x);

        // if the user is dragging into the panel, ie coming from the side panel into the main grid,
        // we don't want to scroll the grid this time, it would appear like the table is jumping
        // each time a column is dragged in.
        if (!fromEnter) {
            this.checkCenterForScrolling(mouseXNormalised);
        }

        const hDirectionNormalised = this.normaliseDirection(draggingEvent.hDirection);

        const dragSourceType: DragSourceType = draggingEvent.dragSource.type;
        let columnsToMove = draggingEvent.dragSource.dragItemCallback().columns;

        columnsToMove = columnsToMove.filter(col => {
            if (col.getColDef().lockPinned) {
                // if locked return true only if both col and container are same pin type.
                // double equals (==) here on purpose so that null==undefined is true (for not pinned options)
                return col.getPinned() == this.pinned;
            } else {
                // if not pin locked, then always allowed to be in this container
                return true;
            }
        });

        this.attemptMoveColumns(dragSourceType, columnsToMove, hDirectionNormalised, mouseXNormalised, fromEnter);
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

    // returns the index of the first column in the list ONLY if the cols are all beside
    // each other. if the cols are not beside each other, then returns null
    private calculateOldIndex(movingCols: Column[]): number {
        const gridCols: Column[] = this.columnController.getAllGridColumns();
        const indexes: number[] = [];
        movingCols.forEach(col => indexes.push(gridCols.indexOf(col)));
        _.sortNumberArray(indexes);
        const firstIndex = indexes[0];
        const lastIndex = _.last(indexes);
        const spread = lastIndex - firstIndex;
        const gapsExist = spread !== indexes.length - 1;
        return gapsExist ? null : firstIndex;
    }

    private attemptMoveColumns(dragSourceType: DragSourceType, allMovingColumns: Column[], hDirection: HDirection, mouseX: number, fromEnter: boolean): void {

        const draggingLeft = hDirection === HDirection.Left;
        const draggingRight = hDirection === HDirection.Right;

        const validMoves: number[] = this.calculateValidMoves(allMovingColumns, draggingRight, mouseX);

        // if cols are not adjacent, then this returns null. when moving, we constrain the direction of the move
        // (ie left or right) to the mouse direction. however
        const oldIndex = this.calculateOldIndex(allMovingColumns);

        if (validMoves.length===0) { return; }

        const firstValidMove = validMoves[0];

        // the two check below stop an error when the user grabs a group my a middle column, then
        // it is possible the mouse pointer is to the right of a column while been dragged left.
        // so we need to make sure that the mouse pointer is actually left of the left most column
        // if moving left, and right of the right most column if moving right

        // we check 'fromEnter' below so we move the column to the new spot if the mouse is coming from
        // outside the grid, eg if the column is moving from side panel, mouse is moving left, then we should
        // place the column to the RHS even if the mouse is moving left and the column is already on
        // the LHS. otherwise we stick to the rule described above.

        let constrainDirection = oldIndex !== null && !fromEnter;

        // don't consider 'fromEnter' when dragging header cells, otherwise group can jump to opposite direction of drag
        if (dragSourceType == DragSourceType.HeaderCell) {
            constrainDirection = oldIndex !== null;
        }

        if (constrainDirection) {
            // only allow left drag if this column is moving left
            if (draggingLeft && firstValidMove >= oldIndex) { return; }

            // only allow right drag if this column is moving right
            if (draggingRight && firstValidMove <= oldIndex) { return; }
        }

        for (let i = 0; i < validMoves.length; i++) {
            const move: number = validMoves[i];

            if (!this.columnController.doesMovePassRules(allMovingColumns, move)) {
                continue;
            }

            this.columnController.moveColumns(allMovingColumns, move, "uiColumnDragged");

            // important to return here, so once we do the first valid move, we don't try do any more
            return;
        }
    }

    private calculateValidMoves(movingCols: Column[], draggingRight: boolean, mouseX: number): number[] {

        // this is the list of cols on the screen, so it's these we use when comparing the x mouse position
        const allDisplayedCols = this.columnController.getDisplayedColumns(this.pinned);
        // but this list is the list of all cols, when we move a col it's the index within this list that gets used,
        // so the result we return has to be and index location for this list
        const allGridCols = this.columnController.getAllGridColumns();

        const colIsMovingFunc = (col: Column) => movingCols.indexOf(col) >= 0;
        const colIsNotMovingFunc = (col: Column) => movingCols.indexOf(col) < 0;

        const movingDisplayedCols = allDisplayedCols.filter(colIsMovingFunc);
        const otherDisplayedCols = allDisplayedCols.filter(colIsNotMovingFunc);
        const otherGridCols = allGridCols.filter(colIsNotMovingFunc);

        // work out how many DISPLAYED columns fit before the 'x' position. this gives us the displayIndex.
        // for example, if cols are a,b,c,d and we find a,b fit before 'x', then we want to place the moving
        // col between b and c (so that it is under the mouse position).
        let displayIndex = 0;
        let availableWidth = mouseX;

        // if we are dragging right, then the columns will be to the left of the mouse, so we also want to
        // include the width of the moving columns
        if (draggingRight) {
            let widthOfMovingDisplayedCols = 0;
            movingDisplayedCols.forEach(col => widthOfMovingDisplayedCols += col.getActualWidth());
            availableWidth -= widthOfMovingDisplayedCols;
        }

        if (availableWidth > 0) {
            // now count how many of the displayed columns will fit to the left
            for (let i = 0; i < otherDisplayedCols.length; i++) {
                const col = otherDisplayedCols[i];
                availableWidth -= col.getActualWidth();
                if (availableWidth < 0) { break; }
                displayIndex++;
            }
            // trial and error, if going right, we adjust by one, i didn't manage to quantify why, but it works
            if (draggingRight) {
                displayIndex++;
            }
        }

        // the display index is with respect to all the showing columns, however when we move, it's with
        // respect to all grid columns, so we need to translate from display index to grid index

        let firstValidMove: number;
        if (displayIndex > 0) {
            const leftColumn = otherDisplayedCols[displayIndex - 1];
            firstValidMove = otherGridCols.indexOf(leftColumn) + 1;
        } else {
            firstValidMove = 0;
        }

        const validMoves = [firstValidMove];

        // add in other valid moves due to hidden columns and married children. for example, a particular
        // move might break a group that has married children (so move isn't valid), however there could
        // be hidden columns (not displayed) that we could jump over to make the move valid. because
        // they are hidden, user doesn't see any different, however it allows moves that would otherwise
        // not work. for example imagine a group with 9 columns and all columns are hidden except the
        // middle one (so 4 hidden to left, 4 hidden to right), then when moving 'firstValidMove' will
        // be relative to the not-shown column, however we need to consider the move jumping over all the
        // hidden children. if we didn't do this, then if the group just described was at the end (RHS) of the
        // grid, there would be no way to put a column after it (as the grid would only consider beside the
        // visible column, which would fail valid move rules).
        if (draggingRight) {
            // if dragging right, then we add all the additional moves to the right. so in other words
            // if the next move is not valid, find the next move to the right that is valid.
            let pointer = firstValidMove + 1;
            const lastIndex = allGridCols.length - 1;
            while (pointer <= lastIndex) {
                validMoves.push(pointer);
                pointer++;
            }
        } else {
            // if dragging left we do the reverse of dragging right, we add in all the valid moves to the
            // left. however we also have to consider moves to the right for all hidden columns first.
            // (this logic is hard to reason with, it was worked out with trial and error,
            // move observation rather than science).

            // add moves to the right
            let pointer = firstValidMove;
            const lastIndex = allGridCols.length - 1;
            let displacedCol = allGridCols[pointer];
            while (pointer <= lastIndex && this.isColumnHidden(allDisplayedCols, displacedCol)) {
                pointer++;
                validMoves.push(pointer);
                displacedCol = allGridCols[pointer];
            }

            // add moves to the left
            pointer = firstValidMove - 1;
            const firstDisplayIndex = 0;
            while (pointer >= firstDisplayIndex) {
                validMoves.push(pointer);
                pointer--;
            }
        }

        return validMoves;
    }

    // isHidden takes into account visible=false and group=closed, ie it is not displayed
    private isColumnHidden(displayedColumns: Column[], col: Column) {
        return displayedColumns.indexOf(col) < 0;
    }

    private ensureIntervalStarted(): void {
        if (!this.movingIntervalId) {
            this.intervalCount = 0;
            this.failedMoveAttempts = 0;
            this.movingIntervalId = window.setInterval(this.moveInterval.bind(this), 100);
            if (this.needToMoveLeft) {
                this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_LEFT, true);
            } else {
                this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_RIGHT, true);
            }
        }
    }

    private ensureIntervalCleared(): void {
        if (this.moveInterval) {
            window.clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
            this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_MOVE);
        }
    }

    private moveInterval(): void {
        // the amounts we move get bigger at each interval, so the speed accelerates, starting a bit slow
        // and getting faster. this is to give smoother user experience. we max at 100px to limit the speed.
        let pixelsToMove: number;
        this.intervalCount++;
        pixelsToMove = 10 + (this.intervalCount * 5);
        if (pixelsToMove > 100) {
            pixelsToMove = 100;
        }

        let pixelsMoved: number;
        if (this.needToMoveLeft) {
            pixelsMoved = this.gridPanel.scrollHorizontally(-pixelsToMove);
        } else if (this.needToMoveRight) {
            pixelsMoved = this.gridPanel.scrollHorizontally(pixelsToMove);
        }

        if (pixelsMoved !== 0) {
            this.onDragging(this.lastDraggingEvent);
            this.failedMoveAttempts = 0;
        } else {
            // we count the failed move attempts. if we fail to move 7 times, then we pin the column.
            // this is how we achieve pining by dragging the column to the edge of the grid.
            this.failedMoveAttempts++;

            const columns = this.lastDraggingEvent.dragItem.columns;
            const columnsThatCanPin = columns.filter(c => !c.getColDef().lockPinned);

            if (columnsThatCanPin.length > 0) {
                this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_PINNED);
                if (this.failedMoveAttempts > 7) {
                    const pinType = this.needToMoveLeft ? Column.PINNED_LEFT : Column.PINNED_RIGHT;
                    this.setColumnsPinned(columnsThatCanPin, pinType, "uiColumnDragged");
                    this.dragAndDropService.nudge();
                }
            }
        }
    }
}