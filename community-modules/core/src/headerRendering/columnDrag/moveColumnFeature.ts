import { Autowired, PostConstruct } from "../../context/context";
import { ColumnModel } from "../../columns/columnModel";
import { Column, ColumnPinnedType } from "../../entities/column";
import { DragAndDropService, DraggingEvent, DragSourceType } from "../../dragAndDrop/dragAndDropService";
import { DropListener } from "./bodyDropTarget";
import { GridOptionsService } from "../../gridOptionsService";
import { ColumnEventType } from "../../events";
import { missing, exists } from "../../utils/generic";
import { CtrlsService } from "../../ctrlsService";
import { GridBodyCtrl } from "../../gridBodyComp/gridBodyCtrl";
import { ColumnMoveHelper } from "../columnMoveHelper";
import { HorizontalDirection } from "../../constants/direction";

export class MoveColumnFeature implements DropListener {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('gridOptionsService') private gos: GridOptionsService;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;

    private gridBodyCon: GridBodyCtrl;

    private needToMoveLeft = false;
    private needToMoveRight = false;
    private movingIntervalId: number | null;
    private intervalCount: number;

    private pinned: ColumnPinnedType;
    private isCenterContainer: boolean;

    private lastDraggingEvent: DraggingEvent;
    private lastMovedInfo: { columns: Column[]; toIndex: number; } | null = null;

    // this counts how long the user has been trying to scroll by dragging and failing,
    // if they fail x amount of times, then the column will get pinned. this is what gives
    // the 'hold and pin' functionality
    private failedMoveAttempts: number;

    constructor(pinned: ColumnPinnedType) {
        this.pinned = pinned;
        this.isCenterContainer = !exists(pinned);
    }

    @PostConstruct
    public init(): void {
        this.ctrlsService.whenReady((p) => {
            this.gridBodyCon = p.gridBodyCtrl;
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

    public onDragLeave(): void {
        this.ensureIntervalCleared();
        this.lastMovedInfo = null;
    }

    public setColumnsVisible(columns: Column[] | null | undefined, visible: boolean, source: ColumnEventType) {
        if (columns) {
            const allowedCols = columns.filter(c => !c.getColDef().lockVisible);
            this.columnModel.setColumnsVisible(allowedCols, visible, source);
        }
    }

    public setColumnsPinned(columns: Column[] | null | undefined, pinned: ColumnPinnedType, source: ColumnEventType) {
        if (columns) {
            const allowedCols = columns.filter(c => !c.getColDef().lockPinned);
            this.columnModel.setColumnsPinned(allowedCols, pinned, source);
        }
    }

    public onDragStop(): void {
        this.onDragging(this.lastDraggingEvent, false, true, true);
        this.ensureIntervalCleared();
        this.lastMovedInfo = null;
    }

    private checkCenterForScrolling(xAdjustedForScroll: number): void {
        if (this.isCenterContainer) {
            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
            const centerCtrl = this.ctrlsService.get('center');
            const firstVisiblePixel = centerCtrl.getCenterViewportScrollLeft();
            const lastVisiblePixel = firstVisiblePixel + centerCtrl.getCenterWidth();

            if (this.gos.get('enableRtl')) {
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

    public onDragging(draggingEvent: DraggingEvent = this.lastDraggingEvent, fromEnter = false, fakeEvent = false, finished = false): void {
        if (finished) {
            if (this.lastMovedInfo) {
                const { columns, toIndex } = this.lastMovedInfo;
                ColumnMoveHelper.moveColumns(columns, toIndex, 'uiColumnMoved', true, this.columnModel);
            }
            return;
        }
        this.lastDraggingEvent = draggingEvent;

        // if moving up or down (ie not left or right) then do nothing
        if (missing(draggingEvent.hDirection)) {
            return;
        }

        const mouseX = ColumnMoveHelper.normaliseX(
            draggingEvent.x,
            this.pinned,
            false,
            this.gos,
            this.ctrlsService
        );

        // if the user is dragging into the panel, ie coming from the side panel into the main grid,
        // we don't want to scroll the grid this time, it would appear like the table is jumping
        // each time a column is dragged in.
        if (!fromEnter) {
            this.checkCenterForScrolling(mouseX);
        }

        const hDirection = this.normaliseDirection(draggingEvent.hDirection);

        const dragSourceType: DragSourceType = draggingEvent.dragSource.type;

        const allMovingColumns = draggingEvent.dragSource.getDragItem().columns?.filter(col => {
            if (col.getColDef().lockPinned) {
                // if locked return true only if both col and container are same pin type.
                // double equals (==) here on purpose so that null==undefined is true (for not pinned options)
                return col.getPinned() == this.pinned;
            }
            // if not pin locked, then always allowed to be in this container
            return true;
        }) || [];

        const lastMovedInfo = ColumnMoveHelper.attemptMoveColumns({
            allMovingColumns,
            isFromHeader: dragSourceType === DragSourceType.HeaderCell,
            hDirection,
            xPosition: mouseX,
            pinned: this.pinned,
            fromEnter,
            fakeEvent,
            gos: this.gos,
            columnModel: this.columnModel
        });

        if (lastMovedInfo) {
            this.lastMovedInfo = lastMovedInfo;
        }
    }

    private normaliseDirection(hDirection: HorizontalDirection): HorizontalDirection | undefined {
        if (this.gos.get('enableRtl')) {
            switch (hDirection) {
                case HorizontalDirection.Left: return HorizontalDirection.Right;
                case HorizontalDirection.Right: return HorizontalDirection.Left;
                default: console.error(`AG Grid: Unknown direction ${hDirection}`);
            }
        } else {
            return hDirection;
        }
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
                    const pinType = this.needToMoveLeft ? 'left' : 'right';
                    this.setColumnsPinned(columnsThatCanPin, pinType, "uiColumnDragged");
                    this.dragAndDropService.nudge();
                }
            }
        }
    }
}