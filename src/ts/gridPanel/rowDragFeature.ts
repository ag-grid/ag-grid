import {DragAndDropService, DraggingEvent, DragSourceType, DropTarget} from "../dragAndDrop/dragAndDropService";
import {Autowired, Optional} from "../context/context";
import {InMemoryRowModel} from "../rowModels/inMemory/inMemoryRowModel";
import {FocusedCellController} from "../focusedCellController";
import {IRangeController} from "../interfaces/iRangeController";
import {GridPanel} from "./gridPanel";

export class RowDragFeature implements DropTarget {

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    // this feature is only created when row model in InMemory, so we can type it as InMemory
    @Autowired('rowModel') private inMemoryRowModel: InMemoryRowModel;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Optional('rangeController') private rangeController: IRangeController;

    private eContainer: HTMLElement;

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

    public onDragEnter(params: DraggingEvent): void {
        this.dragAndDropService.setGhostIcon(DragAndDropService.ICON_MOVE);
        this.onEnterOrDragging(params);
    }

    public onDragging(params: DraggingEvent): void {
        this.onEnterOrDragging(params);
    }

    private onEnterOrDragging(params: DraggingEvent): void {

        let rowNode = params.dragItem.rowNode;
        let pixel = this.normaliseForScroll(params.y);
        let rowWasMoved = this.inMemoryRowModel.ensureRowAtPixel(rowNode, pixel);

        if (rowWasMoved) {
            this.focusedCellController.clearFocusedCell();
            if (this.rangeController) {
                this.rangeController.clearSelection();
            }
        }
    }

    private normaliseForScroll(pixel: number): number {
        let pixelRange = this.gridPanel.getVerticalPixelRange();
        return pixel + pixelRange.top;
    }

    public onDragLeave(params: DraggingEvent): void {}

    public onDragStop(params: DraggingEvent): void {}

}