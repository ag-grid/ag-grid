import {
    DragAndDropService, DraggingEvent, DragSourceType, DropTarget,
    VDirection
} from "../dragAndDrop/dragAndDropService";
import { Autowired, Optional, PostConstruct } from "../context/context";
import { ClientSideRowModel } from "../rowModels/clientSide/clientSideRowModel";
import { FocusedCellController } from "../focusedCellController";
import { IRangeController } from "../interfaces/iRangeController";
import { GridPanel } from "./gridPanel";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { EventService } from "../eventService";
import { RowDragEvent } from "../events";
import { Events } from "../eventKeys";
import { IRowModel } from "../interfaces/iRowModel";
import { Constants } from "../constants";

export class RowDragFeature implements DropTarget {

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    // this feature is only created when row model is ClientSide, so we can type it as ClientSide
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Optional('rangeController') private rangeController: IRangeController;
    @Autowired('eventService') private eventService: EventService;

    private gridPanel: GridPanel;

    private clientSideRowModel: ClientSideRowModel;

    private eContainer: HTMLElement;

    private needToMoveUp: boolean;
    private needToMoveDown: boolean;

    private movingIntervalId: number;
    private intervalCount: number;

    private lastDraggingEvent: DraggingEvent;

    constructor(eContainer: HTMLElement, gridPanel: GridPanel) {
        this.eContainer = eContainer;
        this.gridPanel = gridPanel;
    }

    @PostConstruct
    private postConstruct(): void {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            this.clientSideRowModel = this.rowModel as ClientSideRowModel;
        }
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return type === DragSourceType.RowDrag;
    }

    public getIconName(): string {
        return DragAndDropService.ICON_MOVE;
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        // when entering, we fire the enter event, then in onEnterOrDragging,
        // we also fire the move event. so we get both events when entering.
        this.dispatchEvent(Events.EVENT_ROW_DRAG_ENTER, draggingEvent);
        this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_MOVE);
        draggingEvent.dragItem.rowNode.setDragging(true);
        this.onEnterOrDragging(draggingEvent);
    }

    public onDragging(draggingEvent: DraggingEvent): void {
        this.onEnterOrDragging(draggingEvent);
    }

    private onEnterOrDragging(draggingEvent: DraggingEvent): void {
        // this event is fired for enter and move
        this.dispatchEvent(Events.EVENT_ROW_DRAG_MOVE, draggingEvent);

        this.lastDraggingEvent = draggingEvent;
        const pixel = this.normaliseForScroll(draggingEvent.y);

        const managedDrag = this.gridOptionsWrapper.isRowDragManaged();
        if (managedDrag) {
            this.doManagedDrag(draggingEvent, pixel);
        }

        this.checkCenterForScrolling(pixel);
    }

    private doManagedDrag(draggingEvent: DraggingEvent, pixel: number): void {
        const rowNode = draggingEvent.dragItem.rowNode;
        const rowWasMoved = this.clientSideRowModel.ensureRowAtPixel(rowNode, pixel);

        if (rowWasMoved) {
            this.focusedCellController.clearFocusedCell();
            if (this.rangeController) {
                this.rangeController.removeAllCellRanges();
            }
        }
    }

    private normaliseForScroll(pixel: number): number {
        const gridPanelHasScrolls = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_NORMAL;
        if (gridPanelHasScrolls) {
            const pixelRange = this.gridPanel.getVScrollPosition();
            return pixel + pixelRange.top;
        } else {
            return pixel;
        }
    }

    private checkCenterForScrolling(pixel: number): void {

        // scroll if the mouse is within 50px of the grid edge
        const pixelRange = this.gridPanel.getVScrollPosition();

        // console.log(`pixelRange = (${pixelRange.top}, ${pixelRange.bottom})`);

        this.needToMoveUp = pixel < (pixelRange.top + 50);
        this.needToMoveDown = pixel > (pixelRange.bottom - 50);

        // console.log(`needToMoveUp = ${this.needToMoveUp} = pixel < (pixelRange.top + 50) = ${pixel} < (${pixelRange.top} + 50)`);
        // console.log(`needToMoveDown = ${this.needToMoveDown} = pixel < (pixelRange.top + 50) = ${pixel} < (${pixelRange.top} + 50)`);

        if (this.needToMoveUp || this.needToMoveDown) {
            this.ensureIntervalStarted();
        } else {
            this.ensureIntervalCleared();
        }
    }

    private ensureIntervalStarted(): void {
        if (!this.movingIntervalId) {
            this.intervalCount = 0;
            this.movingIntervalId = window.setInterval(this.moveInterval.bind(this), 100);
        }
    }

    private ensureIntervalCleared(): void {
        if (this.moveInterval) {
            window.clearInterval(this.movingIntervalId);
            this.movingIntervalId = null;
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
        if (this.needToMoveDown) {
            pixelsMoved = this.gridPanel.scrollVertically(pixelsToMove);
        } else if (this.needToMoveUp) {
            pixelsMoved = this.gridPanel.scrollVertically(-pixelsToMove);
        }

        if (pixelsMoved !== 0) {
            this.onDragging(this.lastDraggingEvent);
        }
    }

    // i tried using generics here with this:
    //     public createEvent<T extends RowDragEvent>(type: string, clazz: {new(): T; }, draggingEvent: DraggingEvent) {
    // but it didn't work - i think it's because it only works with classes, and not interfaces, (the events are interfaces)
    public dispatchEvent(type: string, draggingEvent: DraggingEvent): void {

        const yNormalised = this.normaliseForScroll(draggingEvent.y);

        let overIndex = -1;
        let overNode = null;
        const mouseIsPastLastRow = yNormalised > this.rowModel.getCurrentPageHeight();

        if (!mouseIsPastLastRow) {
            overIndex = this.rowModel.getRowIndexAtPixel(yNormalised);
            overNode = this.rowModel.getRow(overIndex);
        }

        let vDirectionString: string;
        switch (draggingEvent.vDirection) {
            case VDirection.Down:
                vDirectionString = 'down';
                break;
            case VDirection.Up:
                vDirectionString = 'up';
                break;
            default:
                vDirectionString = null;
                break;
        }

        const event: RowDragEvent = {
            type: type,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            event: draggingEvent.event,
            node: draggingEvent.dragItem.rowNode,
            overIndex: overIndex,
            overNode: overNode,
            y: yNormalised,
            vDirection: vDirectionString
        };

        this.eventService.dispatchEvent(event);
    }

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.dispatchEvent(Events.EVENT_ROW_DRAG_LEAVE, draggingEvent);
        this.stopDragging(draggingEvent);
    }

    public onDragStop(draggingEvent: DraggingEvent): void {
        this.dispatchEvent(Events.EVENT_ROW_DRAG_END, draggingEvent);
        this.stopDragging(draggingEvent);
    }

    private stopDragging(draggingEvent: DraggingEvent): void {
        this.ensureIntervalCleared();
        draggingEvent.dragItem.rowNode.setDragging(false);
    }
}