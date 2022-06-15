import { Autowired, PostConstruct } from "../../context/context";
import { Constants } from "../../constants/constants";
import { ColumnModel } from "../../columns/columnModel";
import { Column } from "../../entities/column";
import { DragAndDropService, DraggingEvent, DragSourceType, HorizontalDirection } from "../../dragAndDrop/dragAndDropService";
import { DropListener } from "./bodyDropTarget";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Logger, LoggerFactory } from "../../logger";
import { ColumnEventType } from "../../events";
import { missing, exists } from "../../utils/generic";
import { sortNumerically, last, includes } from "../../utils/array";
import { CtrlsService } from "../../ctrlsService";
import { GridBodyCtrl } from "../../gridBodyComp/gridBodyCtrl";
import { _ } from "../../utils";
import { ColumnGroup } from "../../entities/columnGroup";
import { ProvidedColumnGroup } from "../../entities/providedColumnGroup";

export class MoveColumnFeature implements DropListener {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;

    private gridBodyCon: GridBodyCtrl;

    private needToMoveLeft = false;
    private needToMoveRight = false;
    private movingIntervalId: number | null;
    private intervalCount: number;

    private pinned: string | null;
    private centerContainer: boolean;

    private lastDraggingEvent: DraggingEvent;

    // this counts how long the user has been trying to scroll by dragging and failing,
    // if they fail x amount of times, then the column will get pinned. this is what gives
    // the 'hold and pin' functionality
    private failedMoveAttempts: number;

    private eContainer: HTMLElement;

    constructor(pinned: string | null, eContainer: HTMLElement) {
        this.pinned = pinned;
        this.eContainer = eContainer;
        this.centerContainer = !exists(pinned);
    }

    @PostConstruct
    public init(): void {
        this.ctrlsService.whenReady(() => {
            this.gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        });
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
            const visibleColumns: Column[] = (columns || []).filter(column => visibleState![column.getId()]);
            this.setColumnsVisible(visibleColumns, true, "uiColumnDragged");
        }

        this.setColumnsPinned(columns, this.pinned, "uiColumnDragged");
        this.onDragging(draggingEvent, true, true);
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.ensureIntervalCleared();
    }

    public setColumnsVisible(columns: Column[] | null | undefined, visible: boolean, source: ColumnEventType = "api") {
        if (columns) {
            const allowedCols = columns.filter(c => !c.getColDef().lockVisible);
            this.columnModel.setColumnsVisible(allowedCols, visible, source);
        }
    }

    public setColumnsPinned(columns: Column[] | null | undefined, pinned: string | null, source: ColumnEventType = "api") {
        if (columns) {
            const allowedCols = columns.filter(c => !c.getColDef().lockPinned);
            this.columnModel.setColumnsPinned(allowedCols, pinned, source);
        }
    }

    public onDragStop(): void {
        this.ensureIntervalCleared();
    }

    private normaliseX(x: number): number {
        // flip the coordinate if doing RTL
        if (this.gridOptionsWrapper.isEnableRtl()) {
            const clientWidth = this.eContainer.clientWidth;
            x = clientWidth - x;
        }

        // adjust for scroll only if centre container (the pinned containers don't scroll)
        if (this.centerContainer) {
            x += this.ctrlsService.getCenterRowContainerCtrl().getCenterViewportScrollLeft();
        }

        return x;
    }

    private checkCenterForScrolling(xAdjustedForScroll: number): void {
        if (this.centerContainer) {
            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
            const firstVisiblePixel = this.ctrlsService.getCenterRowContainerCtrl().getCenterViewportScrollLeft();
            const lastVisiblePixel = firstVisiblePixel + this.ctrlsService.getCenterRowContainerCtrl().getCenterWidth();

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

    public onDragging(draggingEvent: DraggingEvent, fromEnter = false, fakeEvent = false): void {
        this.lastDraggingEvent = draggingEvent;

        // if moving up or down (ie not left or right) then do nothing
        if (missing(draggingEvent.hDirection)) {
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
        let columnsToMove = draggingEvent.dragSource.getDragItem().columns;

        columnsToMove = columnsToMove!.filter(col => {
            if (col.getColDef().lockPinned) {
                // if locked return true only if both col and container are same pin type.
                // double equals (==) here on purpose so that null==undefined is true (for not pinned options)
                return col.getPinned() == this.pinned;
            }
            // if not pin locked, then always allowed to be in this container
            return true;
        });

        this.attemptMoveColumns(dragSourceType, columnsToMove, hDirectionNormalised, mouseXNormalised, fromEnter, fakeEvent);
    }

    private normaliseDirection(hDirection: HorizontalDirection): HorizontalDirection | undefined {
        if (this.gridOptionsWrapper.isEnableRtl()) {
            switch (hDirection) {
                case HorizontalDirection.Left: return HorizontalDirection.Right;
                case HorizontalDirection.Right: return HorizontalDirection.Left;
                default: console.error(`AG Grid: Unknown direction ${hDirection}`);
            }
        } else {
            return hDirection;
        }
    }

    // returns the index of the first column in the list ONLY if the cols are all beside
    // each other. if the cols are not beside each other, then returns null
    private calculateOldIndex(movingCols: Column[]): number | null {
        const gridCols: Column[] = this.columnModel.getAllGridColumns();
        const indexes = sortNumerically(movingCols.map(col => gridCols.indexOf(col)));
        const firstIndex = indexes[0];
        const lastIndex = last(indexes);
        const spread = lastIndex - firstIndex;
        const gapsExist = spread !== indexes.length - 1;

        return gapsExist ? null : firstIndex;
    }

    private attemptMoveColumns(dragSourceType: DragSourceType, allMovingColumns: Column[], hDirection: HorizontalDirection | undefined, mouseX: number, fromEnter: boolean, fakeEvent: boolean): void {
        const draggingLeft = hDirection === HorizontalDirection.Left;
        const draggingRight = hDirection === HorizontalDirection.Right;

        if (dragSourceType === DragSourceType.HeaderCell) {
            // If the columns we're dragging are the only visible columns of their group, move the hidden ones too
            let newCols: Column[] = [];
            allMovingColumns.forEach((col) => {
                let movingGroup: ColumnGroup | null = null;

                let parent = col.getParent();
                while (parent != null && parent.getDisplayedLeafColumns().length === 1) {
                    movingGroup = parent;
                    parent = parent.getParent();
                }
                if (movingGroup != null) {
                    movingGroup.getLeafColumns().forEach((newCol) => {
                        if (!newCols.includes(newCol)) {
                            newCols.push(newCol);
                        }
                    });
                } else if (!newCols.includes(col)) {
                    newCols.push(col);
                }
            });
            allMovingColumns = newCols;
        }

        // it is important to sort the moving columns as they are in grid columns, as the list of moving columns
        // could themselves be part of 'married children' groups, which means we need to maintain the order within
        // the moving list.
        const allMovingColumnsOrdered = allMovingColumns.slice();
        this.columnModel.sortColumnsLikeGridColumns(allMovingColumnsOrdered);

        const validMoves = this.calculateValidMoves(allMovingColumnsOrdered, draggingRight, mouseX);

        // if cols are not adjacent, then this returns null. when moving, we constrain the direction of the move
        // (ie left or right) to the mouse direction. however
        const oldIndex = this.calculateOldIndex(allMovingColumnsOrdered);

        if (validMoves.length === 0) { return; }

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

        // if the event was faked by a change in column pin state, then the original location of the column
        // is not reliable for dictating where the column may now be placed.
        if (constrainDirection && !fakeEvent) {
            // only allow left drag if this column is moving left
            if (draggingLeft && firstValidMove >= (oldIndex as number)) { return; }

            // only allow right drag if this column is moving right
            if (draggingRight && firstValidMove <= (oldIndex as number)) { return; }
        }

        // From when we find a move that passes all the rules
        // Remember what that move would look like in terms of displayed cols
        // keep going with further moves until we find a different result in displayed output
        // In this way potentialMoves contains all potential moves over 'hidden' columns
        const displayedCols = this.columnModel.getAllDisplayedColumns();

        let potentialMoves: { move: number, fragCount: number }[] = [];
        let targetOrder: Column[] | null = null;

        for (let i = 0; i < validMoves.length; i++) {
            const move: number = validMoves[i];

            const order = this.columnModel.getProposedColumnOrder(allMovingColumnsOrdered, move);

            if (!this.columnModel.doesOrderPassRules(order)) {
                continue;
            }
            const displayedOrder = order.filter((col) => displayedCols.includes(col));
            if (targetOrder === null) {
                targetOrder = displayedOrder;
            } else if (!_.areEqual(displayedOrder, targetOrder)) {
                break; // Stop looking for potential moves if the displayed result changes from the target
            }
            const fragCount = this.groupFragCount(order);
            potentialMoves.push({ move, fragCount });
        }

        if (potentialMoves.length === 0) {
            return;
        }

        // The best move is the move with least group fragmentation
        potentialMoves.sort((a, b) => a.fragCount - b.fragCount);
        const bestMove = potentialMoves[0].move;

        this.columnModel.moveColumns(allMovingColumnsOrdered, bestMove, "uiColumnDragged");
    }

    // A measure of how fragmented in terms of groups an order of columns is
    private groupFragCount(columns: Column[]): number {
        function parents(col: Column): ProvidedColumnGroup[] {
            let result: ProvidedColumnGroup[] = [];
            let parent = col.getOriginalParent();
            while (parent != null) {
                result.push(parent);
                parent = parent.getOriginalParent();
            }
            return result;
        }
        let count = 0;
        for (let i = 0; i < columns.length -1; i++) {
            let a = parents(columns[i]);
            let b = parents(columns[i + 1]);
            // iterate over the longest one
            [a, b] = a.length > b.length ? [a, b] : [b, a];
            a.forEach((parent) => {
                if (b.indexOf(parent) === -1) {
                    count++; // More fragmented if other column doesn't share the parent
                }
            });
        }
        return count;
    }

    private calculateValidMoves(movingCols: Column[], draggingRight: boolean, mouseX: number): number[] {
        const isMoveBlocked = this.gridOptionsWrapper.isSuppressMovableColumns() || movingCols.some(col => col.getColDef().suppressMovable);

        if (isMoveBlocked) { return []; }
        // this is the list of cols on the screen, so it's these we use when comparing the x mouse position
        const allDisplayedCols = this.columnModel.getDisplayedColumns(this.pinned);
        // but this list is the list of all cols, when we move a col it's the index within this list that gets used,
        // so the result we return has to be and index location for this list
        const allGridCols = this.columnModel.getAllGridColumns();

        const movingDisplayedCols = allDisplayedCols.filter(col => includes(movingCols, col));
        const otherDisplayedCols = allDisplayedCols.filter(col => !includes(movingCols, col));
        const otherGridCols = allGridCols.filter(col => !includes(movingCols, col));

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
            firstValidMove = otherGridCols.indexOf(otherDisplayedCols[0]);
            if (firstValidMove === -1) {
                firstValidMove = 0;
            }
        }

        const validMoves = [firstValidMove];
        const numberComparator = (a: number, b:number) => a - b;

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

            // adding columns here means the order is now messed up
            validMoves.sort(numberComparator);
        } else {
            // if dragging left we do the reverse of dragging right, we add in all the valid moves to the
            // left. however we also have to consider moves to the right for all hidden columns first.
            // (this logic is hard to reason with, it was worked out with trial and error,
            // more observation rather than science).

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

            // adding columns here means the order is now messed up
            validMoves.sort(numberComparator).reverse();
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
        if (this.movingIntervalId) {
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

        let pixelsMoved: number | null = null;
        const scrollFeature = this.gridBodyCon.getScrollFeature();
        if (this.needToMoveLeft) {
            pixelsMoved = scrollFeature.scrollHorizontally(-pixelsToMove);
        } else if (this.needToMoveRight) {
            pixelsMoved = scrollFeature.scrollHorizontally(pixelsToMove);
        }

        if (pixelsMoved !== 0) {
            this.onDragging(this.lastDraggingEvent);
            this.failedMoveAttempts = 0;
        } else {
            // we count the failed move attempts. if we fail to move 7 times, then we pin the column.
            // this is how we achieve pining by dragging the column to the edge of the grid.
            this.failedMoveAttempts++;

            const columns = this.lastDraggingEvent.dragItem.columns;
            const columnsThatCanPin = columns!.filter(c => !c.getColDef().lockPinned);

            if (columnsThatCanPin.length > 0) {
                this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_PINNED);
                if (this.failedMoveAttempts > 7) {
                    const pinType = this.needToMoveLeft ? Constants.PINNED_LEFT : Constants.PINNED_RIGHT;
                    this.setColumnsPinned(columnsThatCanPin, pinType, "uiColumnDragged");
                    this.dragAndDropService.nudge();
                }
            }
        }
    }
}