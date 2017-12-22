import {DragAndDropService, DraggingEvent, DragSourceType, DropTarget} from "../dragAndDrop/dragAndDropService";
import {Autowired, Optional} from "../context/context";
import {InMemoryRowModel} from "../rowModels/inMemory/inMemoryRowModel";
import {FocusedCellController} from "../focusedCellController";
import {IRangeController} from "../interfaces/iRangeController";
import {GridPanel} from "./gridPanel";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export class RowDragFeature implements DropTarget {

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    // this feature is only created when row model in InMemory, so we can type it as InMemory
    @Autowired('rowModel') private inMemoryRowModel: InMemoryRowModel;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Optional('rangeController') private rangeController: IRangeController;

    private eContainer: HTMLElement;

    private needToMoveUp: boolean;
    private needToMoveDown: boolean;

    private movingIntervalId: number;
    private intervalCount: number;

    private lastDraggingEvent: DraggingEvent;

    constructor(eContainer: HTMLElement) {
        this.eContainer = eContainer;
    }

    public postConstruct(): void {
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    public isInterestedIn(type: DragSourceType): boolean {
        return type===DragSourceType.RowDrag;
    }

    public getIconName(): string {
        return DragAndDropService.ICON_MOVE;
    }

    public onDragEnter(draggingEvent: DraggingEvent): void {
        this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_MOVE);
        draggingEvent.dragItem.rowNode.setDragging(true);
        this.onEnterOrDragging(draggingEvent);
    }

    public onDragging(draggingEvent: DraggingEvent): void {
        this.onEnterOrDragging(draggingEvent);
    }

    private onEnterOrDragging(draggingEvent: DraggingEvent): void {

        this.lastDraggingEvent = draggingEvent;

        let rowNode = draggingEvent.dragItem.rowNode;
        let pixel = this.normaliseForScroll(draggingEvent.y);
        let rowWasMoved = this.inMemoryRowModel.ensureRowAtPixel(rowNode, pixel);

        if (rowWasMoved) {
            this.focusedCellController.clearFocusedCell();
            if (this.rangeController) {
                this.rangeController.clearSelection();
            }
        }

        this.checkCenterForScrolling(pixel);
    }

    private normaliseForScroll(pixel: number): number {
        let gridPanelHasScrolls = this.gridOptionsWrapper.isNormalDomLayout();
        if (gridPanelHasScrolls) {
            let pixelRange = this.gridPanel.getVerticalPixelRange();
            return pixel + pixelRange.top;
        } else {
            return pixel;
        }
    }

    private checkCenterForScrolling(pixel: number): void {

        // scroll if the mouse is within 50px of the grid edge
        let pixelRange = this.gridPanel.getVerticalPixelRange();

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
            this.movingIntervalId = setInterval(this.moveInterval.bind(this), 100);
        }
    }

    private ensureIntervalCleared(): void {
        if (this.moveInterval) {
            clearInterval(this.movingIntervalId);
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

    public onDragLeave(draggingEvent: DraggingEvent): void {
        this.stopDragging(draggingEvent);
    }

    public onDragStop(draggingEvent: DraggingEvent): void {
        this.stopDragging(draggingEvent);
    }

    private stopDragging(draggingEvent: DraggingEvent): void {
        this.ensureIntervalCleared();
        draggingEvent.dragItem.rowNode.setDragging(false);
    }
}