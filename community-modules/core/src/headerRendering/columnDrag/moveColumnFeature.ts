import type { ColumnModel } from '../../columns/columnModel';
import type { ColumnMoveService } from '../../columns/columnMoveService';
import type { VisibleColsService } from '../../columns/visibleColsService';
import { HorizontalDirection } from '../../constants/direction';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { CtrlsService } from '../../ctrlsService';
import type { DragAndDropIcon, DragAndDropService, DraggingEvent } from '../../dragAndDrop/dragAndDropService';
import { DragSourceType } from '../../dragAndDrop/dragAndDropService';
import type { AgColumn } from '../../entities/agColumn';
import type { ColumnEventType } from '../../events';
import type { GridBodyCtrl } from '../../gridBodyComp/gridBodyCtrl';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import { ColumnHighlightPosition } from '../../interfaces/iColumn';
import { _errorOnce } from '../../utils/function';
import { _exists, _missing } from '../../utils/generic';
import { attemptMoveColumns, normaliseX } from '../columnMoveHelper';
import type { DropListener } from './bodyDropTarget';

const MOVE_FAIL_THRESHOLD = 7;
const SCROLL_MOVE_WIDTH = 100;
const SCROLL_GAP_NEEDED_BEFORE_MOVE = SCROLL_MOVE_WIDTH / 2;
const SCROLL_ACCELERATION_RATE = 5;
const SCROLL_TIME_INTERVAL = 100;

export class MoveColumnFeature extends BeanStub implements DropListener {
    private columnModel: ColumnModel;
    private visibleColsService: VisibleColsService;
    private columnMoveService: ColumnMoveService;
    private dragAndDropService: DragAndDropService;
    private ctrlsService: CtrlsService;

    public wireBeans(beans: BeanCollection) {
        this.columnModel = beans.columnModel;
        this.visibleColsService = beans.visibleColsService;
        this.columnMoveService = beans.columnMoveService;
        this.dragAndDropService = beans.dragAndDropService;
        this.ctrlsService = beans.ctrlsService;
    }

    private gridBodyCon: GridBodyCtrl;

    private needToMoveLeft = false;
    private needToMoveRight = false;
    private movingIntervalId: number | null;
    private intervalCount: number;

    private pinned: ColumnPinnedType;
    private isCenterContainer: boolean;

    private lastDraggingEvent: DraggingEvent | null;
    private lastHighlightedColumn: { column: AgColumn; position: ColumnHighlightPosition } | null;
    private lastMovedInfo: { columns: AgColumn[]; toIndex: number } | null = null;

    // this counts how long the user has been trying to scroll by dragging and failing,
    // if they fail x amount of times, then the column will get pinned. this is what gives
    // the 'hold and pin' functionality
    private failedMoveAttempts: number;

    constructor(pinned: ColumnPinnedType) {
        super();
        this.pinned = pinned;
        this.isCenterContainer = !_exists(pinned);
    }

    public postConstruct(): void {
        this.ctrlsService.whenReady((p) => {
            this.gridBodyCon = p.gridBodyCtrl;
        });
    }

    public getIconName(): DragAndDropIcon {
        const columns = this.lastDraggingEvent?.dragItem.columns ?? [];

        for (const col of columns) {
            const colPinned = col.getPinned();
            // when the column is lockPinned, only moves within pinned section
            if (col.getColDef().lockPinned) {
                if (colPinned == this.pinned) {
                    return 'move';
                }
                continue;
            }
            // if the column pinned state is the same as the container's, or
            // when `unpinning` a column, set the icon to move
            if (colPinned === this.pinned || !this.pinned) {
                return 'move';
            }

            // moving an unpinned column to a pinned container
            // set the icon to pinned
            if (!colPinned && this.pinned) {
                return 'pinned';
            }
        }

        return 'notAllowed';
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // we do dummy drag, so make sure column appears in the right location when first placed

        const columns = draggingEvent.dragItem.columns as AgColumn[] | undefined;
        const dragCameFromToolPanel = draggingEvent.dragSource.type === DragSourceType.ToolPanel;

        if (dragCameFromToolPanel) {
            // the if statement doesn't work if drag leaves grid, then enters again
            this.setColumnsVisible(columns, true, 'uiColumnDragged');
        } else {
            // restore previous state of visible columns upon re-entering. this means if the user drags
            // a group out, and then drags the group back in, only columns that were originally visible
            // will be visible again. otherwise a group with three columns (but only two visible) could
            // be dragged out, then when it's dragged in again, all three are visible. this stops that.
            const visibleState = draggingEvent.dragItem.visibleState;
            const visibleColumns: AgColumn[] = (columns || []).filter((column) => visibleState![column.getId()]);
            this.setColumnsVisible(visibleColumns, true, 'uiColumnDragged');
        }

        if (!this.gos.get('suppressMoveWhenColumnDragging')) {
            this.attemptToPinColumns(columns, this.pinned);
        }
        this.onDragging(draggingEvent, true, true);
    }

    public onDragging(
        draggingEvent: DraggingEvent | null = this.lastDraggingEvent,
        fromEnter = false,
        fakeEvent = false,
        finished = false
    ): void {
        const isSuppressMoveWhenDragging = this.gos.get('suppressMoveWhenColumnDragging');

        if (finished && !isSuppressMoveWhenDragging) {
            this.finishColumnMoving();
            return;
        }

        this.lastDraggingEvent = draggingEvent;

        // if moving up or down (ie not left or right) then do nothing
        if (!draggingEvent || (!finished && _missing(draggingEvent.hDirection))) {
            return;
        }

        const { pinned, gos, ctrlsService } = this;

        const mouseX = normaliseX({
            x: draggingEvent.x,
            pinned,
            gos,
            ctrlsService,
        });

        // if the user is dragging into the panel, ie coming from the side panel into the main grid,
        // we don't want to scroll the grid this time, it would appear like the table is jumping
        // each time a column is dragged in.
        if (!fromEnter) {
            this.checkCenterForScrolling(mouseX);
        }

        if (!finished && isSuppressMoveWhenDragging) {
            if (!this.dragAndDropService.isDropZoneWithinThisGrid(draggingEvent)) {
                return;
            }
            this.highlightHoveredColumn(mouseX);
        } else {
            const params = this.getMoveColumnParams(draggingEvent, mouseX, fromEnter, fakeEvent);
            const lastMovedInfo = attemptMoveColumns(params);

            if (lastMovedInfo) {
                this.lastMovedInfo = lastMovedInfo;
            } else if (finished && isSuppressMoveWhenDragging) {
                this.moveColumnsAfterHighlight(params.allMovingColumns);
            }
        }
    }

    public onDragLeave(): void {
        this.ensureIntervalCleared();
        this.clearHighlighted();
        this.lastMovedInfo = null;
    }

    public onDragStop(): void {
        this.onDragging(this.lastDraggingEvent!, false, true, true);
        this.ensureIntervalCleared();
        this.lastMovedInfo = null;
    }

    public setColumnsVisible(columns: AgColumn[] | null | undefined, visible: boolean, source: ColumnEventType) {
        if (!columns) {
            return;
        }

        const allowedCols = columns.filter((c) => !c.getColDef().lockVisible);
        this.columnModel.setColsVisible(allowedCols, visible, source);
    }

    private moveColumnsAfterHighlight(allMovingColumns: AgColumn[]): void {
        const isAttemptingToPin =
            this.needToMoveLeft ||
            this.needToMoveRight ||
            this.failedMoveAttempts > MOVE_FAIL_THRESHOLD ||
            allMovingColumns.some((col) => col.getPinned() !== this.pinned);

        const { column, position } = this.lastHighlightedColumn || {};

        if (column && position != null) {
            const toIndex = this.columnMoveService.getMoveTargetIndex({
                currentColumns: allMovingColumns,
                lastHoveredColumn: column,
                isBefore: (position === ColumnHighlightPosition.Before) !== this.gos.get('enableRtl'),
                isAttemptingToPin,
            });

            if (toIndex != null) {
                this.lastMovedInfo = {
                    columns: allMovingColumns,
                    toIndex,
                };
            }
        }

        this.finishColumnMoving(isAttemptingToPin);
    }

    private finishColumnMoving(attemptToPin: boolean = false): void {
        this.clearHighlighted();

        if (!this.lastMovedInfo) {
            return;
        }

        const { columns, toIndex } = this.lastMovedInfo;

        if (attemptToPin) {
            this.attemptToPinColumns(columns, undefined, true);
        }
        this.columnMoveService.moveColumns(columns, toIndex, 'uiColumnMoved', true);
    }

    private getAllMovingColumns(draggingEvent: DraggingEvent): AgColumn[] {
        return (draggingEvent.dragSource.getDragItem().columns?.filter((col) => {
            if (col.getColDef().lockPinned) {
                // if locked return true only if both col and container are same pin type.
                // double equals (==) here on purpose so that null==undefined is true (for not pinned options)
                return col.getPinned() == this.pinned;
            }
            // if not pin locked, then always allowed to be in this container
            return true;
        }) || []) as AgColumn[];
    }

    private getMoveColumnParams(draggingEvent: DraggingEvent, mouseX: number, fromEnter: boolean, fakeEvent: boolean) {
        return {
            allMovingColumns: this.getAllMovingColumns(draggingEvent),
            isFromHeader: draggingEvent.dragSource.type === DragSourceType.HeaderCell,
            hDirection: this.normaliseDirection(draggingEvent.hDirection!),
            xPosition: mouseX,
            pinned: this.pinned,
            fromEnter,
            fakeEvent,
            gos: this.gos,
            columnModel: this.columnModel,
            columnMoveService: this.columnMoveService,
            presentedColsService: this.visibleColsService,
        };
    }

    private normaliseDirection(hDirection: HorizontalDirection): HorizontalDirection | undefined {
        if (this.gos.get('enableRtl')) {
            switch (hDirection) {
                case HorizontalDirection.Left:
                    return HorizontalDirection.Right;
                case HorizontalDirection.Right:
                    return HorizontalDirection.Left;
                default:
                    _errorOnce(`Unknown direction ${hDirection}`);
                    return;
            }
        }

        return hDirection;
    }

    private highlightHoveredColumn(mouseX: number) {
        const { gos, ctrlsService, columnModel } = this;
        const isRtl = gos.get('enableRtl');
        const consideredColumns = columnModel.getCols().filter((col) => col.getPinned() === this.pinned);

        let start: number | null = null;
        let width: number | null = null;
        let targetColumn: AgColumn | null = null;

        for (const col of consideredColumns) {
            const left = col.getLeft()!;
            width = col.getActualWidth();

            start = normaliseX({
                x: isRtl ? left + width : left,
                pinned: col.getPinned(),
                useScrollWidth: true,
                gos,
                ctrlsService,
            });

            const end = start + width;

            if (start <= mouseX && end >= mouseX) {
                targetColumn = col;
                break;
            }

            start = null;
            width = null;
        }

        if (this.lastHighlightedColumn?.column !== targetColumn) {
            this.clearHighlighted();
        }

        if (!targetColumn || start == null || width == null) {
            return;
        }

        let position: ColumnHighlightPosition;

        if (mouseX - start < width / 2 !== isRtl) {
            position = ColumnHighlightPosition.Before;
        } else {
            position = ColumnHighlightPosition.After;
        }

        targetColumn.setHighlighted(position);
        this.lastHighlightedColumn = { column: targetColumn, position };
    }

    private clearHighlighted(): void {
        if (!this.lastHighlightedColumn) {
            return;
        }

        this.lastHighlightedColumn.column.setHighlighted(null);
        this.lastHighlightedColumn = null;
    }

    private checkCenterForScrolling(xAdjustedForScroll: number): void {
        if (!this.isCenterContainer) {
            return;
        }

        // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
        // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
        const centerCtrl = this.ctrlsService.get('center');
        const firstVisiblePixel = centerCtrl.getCenterViewportScrollLeft();
        const lastVisiblePixel = firstVisiblePixel + centerCtrl.getCenterWidth();

        if (this.gos.get('enableRtl')) {
            this.needToMoveRight = xAdjustedForScroll < firstVisiblePixel + SCROLL_GAP_NEEDED_BEFORE_MOVE;
            this.needToMoveLeft = xAdjustedForScroll > lastVisiblePixel - SCROLL_GAP_NEEDED_BEFORE_MOVE;
        } else {
            this.needToMoveLeft = xAdjustedForScroll < firstVisiblePixel + SCROLL_GAP_NEEDED_BEFORE_MOVE;
            this.needToMoveRight = xAdjustedForScroll > lastVisiblePixel - SCROLL_GAP_NEEDED_BEFORE_MOVE;
        }

        if (this.needToMoveLeft || this.needToMoveRight) {
            this.ensureIntervalStarted();
        } else {
            this.ensureIntervalCleared();
        }
    }

    private ensureIntervalStarted(): void {
        if (this.movingIntervalId) {
            return;
        }

        this.intervalCount = 0;
        this.failedMoveAttempts = 0;
        this.movingIntervalId = window.setInterval(this.moveInterval.bind(this), SCROLL_TIME_INTERVAL);
        this.dragAndDropService.setGhostIcon(this.needToMoveLeft ? 'left' : 'right', true);
    }

    private ensureIntervalCleared(): void {
        if (!this.movingIntervalId) {
            return;
        }

        window.clearInterval(this.movingIntervalId);
        this.movingIntervalId = null;
        this.failedMoveAttempts = 0;
        this.dragAndDropService.setGhostIcon(this.getIconName());
    }

    private moveInterval(): void {
        // the amounts we move get bigger at each interval, so the speed accelerates, starting a bit slow
        // and getting faster. this is to give smoother user experience. we max at `SCROLL_MOVE_WIDTH` to limit the speed.
        let pixelsToMove: number;
        this.intervalCount++;
        pixelsToMove = 10 + this.intervalCount * SCROLL_ACCELERATION_RATE;
        if (pixelsToMove > SCROLL_MOVE_WIDTH) {
            pixelsToMove = SCROLL_MOVE_WIDTH;
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
            // we count the failed move attempts. if we fail to move `MOVE_FAIL_THRESHOLD` times, then we pin the column.
            // this is how we achieve pining by dragging the column to the edge of the grid.
            this.failedMoveAttempts++;

            if (this.failedMoveAttempts <= MOVE_FAIL_THRESHOLD + 1) {
                return;
            }

            this.dragAndDropService.setGhostIcon('pinned');

            if (!this.gos.get('suppressMoveWhenColumnDragging')) {
                const columns = this.lastDraggingEvent?.dragItem.columns as AgColumn[] | undefined;
                this.attemptToPinColumns(columns, undefined, true);
            }
        }
    }

    private attemptToPinColumns(
        columns: AgColumn[] | undefined,
        pinned?: ColumnPinnedType,
        fromMoving: boolean = false
    ) {
        const allowedCols = (columns || []).filter((c) => !c.getColDef().lockPinned);

        if (!allowedCols.length) {
            return;
        }

        if (fromMoving) {
            if (this.needToMoveLeft || this.pinned === 'left') {
                pinned = 'left';
            } else if (this.needToMoveRight || this.pinned === 'right') {
                pinned = 'right';
            }
        }

        this.columnModel.setColsPinned(allowedCols, pinned, 'uiColumnDragged');

        if (fromMoving) {
            this.dragAndDropService.nudge();
        }
    }

    public override destroy(): void {
        super.destroy();

        this.lastDraggingEvent = null;
        this.clearHighlighted();
        this.lastMovedInfo = null;
    }
}
