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
import { _errorOnce } from '../../utils/function';
import { _exists, _missing } from '../../utils/generic';
import { attemptMoveColumns, moveColumns, normaliseX } from '../columnMoveHelper';
import type { DropListener } from './bodyDropTarget';

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

    private lastDraggingEvent: DraggingEvent;
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
        const columns = this.lastDraggingEvent.dragItem.columns ?? [];
        if (this.pinned) {
            const isAValidCol = columns.some((col) => {
                // Valid to move a locked pinned column in its matching pinned container.
                return !col.getColDef().lockPinned || col.getPinned() === this.pinned;
            });
            return isAValidCol ? 'pinned' : 'notAllowed';
        } else {
            const isAValidCol = columns.some((col) => {
                // Valid to move a lockPinned column as long as it is not pinned.
                return !col.getColDef().lockPinned || !col.isPinned();
            });
            return isAValidCol ? 'move' : 'notAllowed';
        }
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

        this.setColumnsPinned(columns, this.pinned, 'uiColumnDragged');
        this.onDragging(draggingEvent, true, true);
    }

    public onDragLeave(): void {
        this.ensureIntervalCleared();
        this.lastMovedInfo = null;
    }

    public setColumnsVisible(columns: AgColumn[] | null | undefined, visible: boolean, source: ColumnEventType) {
        if (columns) {
            const allowedCols = columns.filter((c) => !c.getColDef().lockVisible);
            this.columnModel.setColsVisible(allowedCols, visible, source);
        }
    }

    public setColumnsPinned(columns: AgColumn[] | null | undefined, pinned: ColumnPinnedType, source: ColumnEventType) {
        if (columns) {
            const allowedCols = columns.filter((c) => !c.getColDef().lockPinned);
            this.columnModel.setColsPinned(allowedCols, pinned, source);
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
                this.needToMoveRight = xAdjustedForScroll < firstVisiblePixel + 50;
                this.needToMoveLeft = xAdjustedForScroll > lastVisiblePixel - 50;
            } else {
                this.needToMoveLeft = xAdjustedForScroll < firstVisiblePixel + 50;
                this.needToMoveRight = xAdjustedForScroll > lastVisiblePixel - 50;
            }

            if (this.needToMoveLeft || this.needToMoveRight) {
                this.ensureIntervalStarted();
            } else {
                this.ensureIntervalCleared();
            }
        }
    }

    public onDragging(
        draggingEvent: DraggingEvent = this.lastDraggingEvent,
        fromEnter = false,
        fakeEvent = false,
        finished = false
    ): void {
        if (finished) {
            if (this.lastMovedInfo) {
                const { columns, toIndex } = this.lastMovedInfo;
                moveColumns(columns, toIndex, 'uiColumnMoved', true, this.columnMoveService);
            }
            return;
        }
        this.lastDraggingEvent = draggingEvent;

        // if moving up or down (ie not left or right) then do nothing
        if (_missing(draggingEvent.hDirection)) {
            return;
        }

        const mouseX = normaliseX(draggingEvent.x, this.pinned, false, this.gos, this.ctrlsService);

        // if the user is dragging into the panel, ie coming from the side panel into the main grid,
        // we don't want to scroll the grid this time, it would appear like the table is jumping
        // each time a column is dragged in.
        if (!fromEnter) {
            this.checkCenterForScrolling(mouseX);
        }

        const hDirection = this.normaliseDirection(draggingEvent.hDirection);

        const dragSourceType: DragSourceType = draggingEvent.dragSource.type;

        const allMovingColumns = (draggingEvent.dragSource.getDragItem().columns?.filter((col) => {
            if (col.getColDef().lockPinned) {
                // if locked return true only if both col and container are same pin type.
                // double equals (==) here on purpose so that null==undefined is true (for not pinned options)
                return col.getPinned() == this.pinned;
            }
            // if not pin locked, then always allowed to be in this container
            return true;
        }) || []) as AgColumn[];

        const lastMovedInfo = attemptMoveColumns({
            allMovingColumns,
            isFromHeader: dragSourceType === DragSourceType.HeaderCell,
            hDirection,
            xPosition: mouseX,
            pinned: this.pinned,
            fromEnter,
            fakeEvent,
            gos: this.gos,
            columnModel: this.columnModel,
            columnMoveService: this.columnMoveService,
            presentedColsService: this.visibleColsService,
        });

        if (lastMovedInfo) {
            this.lastMovedInfo = lastMovedInfo;
        }
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
            this.dragAndDropService.setGhostIcon(this.needToMoveLeft ? 'left' : 'right', true);
        }
    }

    private ensureIntervalCleared(): void {
        if (this.movingIntervalId) {
            window.clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
            this.dragAndDropService.setGhostIcon(this.getIconName());
        }
    }

    private moveInterval(): void {
        // the amounts we move get bigger at each interval, so the speed accelerates, starting a bit slow
        // and getting faster. this is to give smoother user experience. we max at 100px to limit the speed.
        let pixelsToMove: number;
        this.intervalCount++;
        pixelsToMove = 10 + this.intervalCount * 5;
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

            const columns = this.lastDraggingEvent.dragItem.columns as AgColumn[] | undefined;
            const columnsThatCanPin = columns!.filter((c) => !c.getColDef().lockPinned);

            if (columnsThatCanPin.length > 0) {
                this.dragAndDropService.setGhostIcon('pinned');
                if (this.failedMoveAttempts > 7) {
                    const pinType = this.needToMoveLeft ? 'left' : 'right';
                    this.setColumnsPinned(columnsThatCanPin, pinType, 'uiColumnDragged');
                    this.dragAndDropService.nudge();
                }
            }
        }
    }
}
