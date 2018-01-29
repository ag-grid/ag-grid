// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { DraggingEvent, DragSourceType, DropTarget } from "../dragAndDrop/dragAndDropService";
export declare class RowDragFeature implements DropTarget {
    private dragAndDropService;
    private rowModel;
    private focusedCellController;
    private gridPanel;
    private gridOptionsWrapper;
    private rangeController;
    private eventService;
    private inMemoryRowModel;
    private eContainer;
    private needToMoveUp;
    private needToMoveDown;
    private movingIntervalId;
    private intervalCount;
    private lastDraggingEvent;
    constructor(eContainer: HTMLElement);
    private postConstruct();
    getContainer(): HTMLElement;
    isInterestedIn(type: DragSourceType): boolean;
    getIconName(): string;
    onDragEnter(draggingEvent: DraggingEvent): void;
    onDragging(draggingEvent: DraggingEvent): void;
    private onEnterOrDragging(draggingEvent);
    private doManagedDrag(draggingEvent, pixel);
    private normaliseForScroll(pixel);
    private checkCenterForScrolling(pixel);
    private ensureIntervalStarted();
    private ensureIntervalCleared();
    private moveInterval();
    dispatchEvent(type: string, draggingEvent: DraggingEvent): void;
    onDragLeave(draggingEvent: DraggingEvent): void;
    onDragStop(draggingEvent: DraggingEvent): void;
    private stopDragging(draggingEvent);
}
