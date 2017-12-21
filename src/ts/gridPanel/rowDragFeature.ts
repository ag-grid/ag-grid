import {DragAndDropService, DraggingEvent, DragSourceType, DropTarget} from "../dragAndDrop/dragAndDropService";
import {Autowired, Optional} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {InMemoryRowModel} from "../rowModels/inMemory/inMemoryRowModel";
import {FocusedCellController} from "../focusedCellController";
import {IRangeController} from "../interfaces/iRangeController";

export class RowDragFeature implements DropTarget {

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    // this feature is only created when row model in InMemory, so we can type it as InMemory
    @Autowired('rowModel') private inMemoryRowModel: InMemoryRowModel;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;
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
        let rowWasMoved = this.inMemoryRowModel.ensureRowAtPixel(rowNode, params.y);

        if (rowWasMoved) {
            this.focusedCellController.clearFocusedCell();
            if (this.rangeController) {
                this.rangeController.clearSelection();
            }
        }
    }

    public onDragLeave(params: DraggingEvent): void {}

    public onDragStop(params: DraggingEvent): void {}

}