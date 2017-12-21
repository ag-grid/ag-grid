import {DragAndDropService, DraggingEvent, DragSourceType, DropTarget} from "../dragAndDrop/dragAndDropService";
import {Autowired} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {InMemoryRowModel} from "../rowModels/inMemory/inMemoryRowModel";
import {FocusedCellController} from "../focusedCellController";

export class RowDragFeature implements DropTarget {

    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    // this feature is only created when row model in InMemory, so we can type it as InMemory
    @Autowired('rowModel') private inMemoryRowModel: InMemoryRowModel;
    @Autowired('focusedCellController') private focusedCellController: FocusedCellController;

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
        }

        let y = params.y;
        let rowBottom = rowNode.rowTop + rowNode.rowHeight;

        let result: string;

        if (rowNode.rowTop > y) {
            result = 'go up';
        } else if (rowBottom < y) {
            result = 'go down';
        } else {
            result = 'do nothing';
        }

        console.log(`rowTop = ${rowNode.rowTop}, rowBottom = ${rowBottom}, x = ${y}, result = ${result}`);
    }

    public onDragLeave(params: DraggingEvent): void {}

    public onDragStop(params: DraggingEvent): void {}

}