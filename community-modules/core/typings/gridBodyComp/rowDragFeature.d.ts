import { DraggingEvent, DragSourceType, DropTarget } from "../dragAndDrop/dragAndDropService";
import { RowDragEnterEvent, RowDragLeaveEvent, RowDragMoveEvent, RowDragEndEvent } from "../events";
import { BeanStub } from "../context/beanStub";
export interface RowDropZoneEvents {
    onDragEnter?: (params: RowDragEnterEvent) => void;
    onDragLeave?: (params: RowDragLeaveEvent) => void;
    onDragging?: (params: RowDragMoveEvent) => void;
    onDragStop?: (params: RowDragEndEvent) => void;
}
export interface RowDropZoneParams extends RowDropZoneEvents {
    getContainer: () => HTMLElement;
}
export declare class RowDragFeature extends BeanStub implements DropTarget {
    private dragAndDropService;
    private rowModel;
    private paginationProxy;
    private columnController;
    private focusController;
    private sortController;
    private filterManager;
    private selectionController;
    private rangeController;
    private mouseEventService;
    private controllersService;
    private clientSideRowModel;
    private eContainer;
    private needToMoveUp;
    private needToMoveDown;
    private movingIntervalId;
    private intervalCount;
    private lastDraggingEvent;
    private isMultiRowDrag;
    private isGridSorted;
    private isGridFiltered;
    private isRowGroupActive;
    constructor(eContainer: HTMLElement);
    private postConstruct;
    private onSortChanged;
    private onFilterChanged;
    private onRowGroupChanged;
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
    private checkCenterForScrolling;
    private ensureIntervalStarted;
    private ensureIntervalCleared;
    private moveInterval;
    addRowDropZone(params: RowDropZoneParams): void;
    getRowDropZone(events: RowDropZoneEvents): RowDropZoneParams;
    private draggingToRowDragEvent;
    private dispatchGridEvent;
    onDragLeave(draggingEvent: DraggingEvent): void;
    onDragStop(draggingEvent: DraggingEvent): void;
    private stopDragging;
}
