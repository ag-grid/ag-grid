import { DraggingEvent, DragSourceType, DropTarget } from "../dragAndDrop/dragAndDropService";
import { RowDragEndEvent, RowDragEnterEvent, RowDragLeaveEvent, RowDragMoveEvent } from "../events";
import { BeanStub } from "../context/beanStub";
export interface RowDropZoneEvents {
    /** Callback function that will be executed when the rowDrag enters the target. */
    onDragEnter?: (params: RowDragEnterEvent) => void;
    /** Callback function that will be executed when the rowDrag leaves the target */
    onDragLeave?: (params: RowDragLeaveEvent) => void;
    /**
     * Callback function that will be executed when the rowDrag is dragged inside the target.
     * Note: this gets called multiple times.
     */
    onDragging?: (params: RowDragMoveEvent) => void;
    /** Callback function that will be executed when the rowDrag drops rows within the target. */
    onDragStop?: (params: RowDragEndEvent) => void;
}
export interface RowDropZoneParams extends RowDropZoneEvents {
    /** A callback method that returns the DropZone HTMLElement. */
    getContainer: () => HTMLElement;
}
export declare class RowDragFeature extends BeanStub implements DropTarget {
    private dragAndDropService;
    private rowModel;
    private paginationProxy;
    private columnModel;
    private focusService;
    private sortController;
    private filterManager;
    private selectionService;
    private mouseEventService;
    private ctrlsService;
    private rangeService;
    private clientSideRowModel;
    private eContainer;
    private isMultiRowDrag;
    private lastDraggingEvent;
    private autoScrollService;
    constructor(eContainer: HTMLElement);
    private postConstruct;
    getContainer(): HTMLElement;
    isInterestedIn(type: DragSourceType): boolean;
    getIconName(): string;
    shouldPreventRowMove(): boolean;
    private getRowNodes;
    onDragEnter(draggingEvent: DraggingEvent): void;
    onDragging(draggingEvent: DraggingEvent): void;
    private isFromThisGrid;
    private isDropZoneWithinThisGrid;
    private onEnterOrDragging;
    private doManagedDrag;
    private getRowIndexNumber;
    private moveRowAndClearHighlight;
    private clearRowHighlight;
    private moveRows;
    addRowDropZone(params: RowDropZoneParams & {
        fromGrid?: boolean;
    }): void;
    getRowDropZone(events?: RowDropZoneEvents): RowDropZoneParams;
    private draggingToRowDragEvent;
    private dispatchGridEvent;
    onDragLeave(draggingEvent: DraggingEvent): void;
    onDragStop(draggingEvent: DraggingEvent): void;
    private stopDragging;
}
