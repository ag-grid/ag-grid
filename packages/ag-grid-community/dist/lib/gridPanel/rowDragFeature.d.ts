// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { DraggingEvent, DragSourceType, DropTarget } from "../dragAndDrop/dragAndDropService";
import { GridPanel } from "./gridPanel";
export declare class RowDragFeature implements DropTarget {
    private dragAndDropService;
    private rowModel;
    private focusedCellController;
    private gridOptionsWrapper;
    private rangeController;
    private eventService;
    private gridPanel;
    private clientSideRowModel;
    private eContainer;
    private needToMoveUp;
    private needToMoveDown;
    private movingIntervalId;
    private intervalCount;
    private lastDraggingEvent;
    constructor(eContainer: HTMLElement, gridPanel: GridPanel);
    private postConstruct;
    getContainer(): HTMLElement;
    isInterestedIn(type: DragSourceType): boolean;
    getIconName(): string;
    onDragEnter(draggingEvent: DraggingEvent): void;
    onDragging(draggingEvent: DraggingEvent): void;
    private onEnterOrDragging;
    private doManagedDrag;
    private normaliseForScroll;
    private checkCenterForScrolling;
    private ensureIntervalStarted;
    private ensureIntervalCleared;
    private moveInterval;
    dispatchEvent(type: string, draggingEvent: DraggingEvent): void;
    onDragLeave(draggingEvent: DraggingEvent): void;
    onDragStop(draggingEvent: DraggingEvent): void;
    private stopDragging;
}
