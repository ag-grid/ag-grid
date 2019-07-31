// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { DraggingEvent, DragSourceType, DropTarget } from "../dragAndDrop/dragAndDropService";
import { GridPanel } from "../gridPanel/gridPanel";
export interface DropListener {
    getIconName(): string;
    onDragEnter(params: DraggingEvent): void;
    onDragLeave(params: DraggingEvent): void;
    onDragging(params: DraggingEvent): void;
    onDragStop(params: DraggingEvent): void;
}
export declare class BodyDropTarget implements DropTarget {
    private context;
    private dragAndDropService;
    private columnController;
    private gridPanel;
    private pinned;
    private eContainer;
    private eSecondaryContainers;
    private dropListeners;
    private currentDropListener;
    private moveColumnController;
    constructor(pinned: string, eContainer: HTMLElement);
    registerGridComp(gridPanel: GridPanel): void;
    isInterestedIn(type: DragSourceType): boolean;
    getSecondaryContainers(): HTMLElement[];
    getContainer(): HTMLElement;
    private init;
    getIconName(): string;
    private getDropType;
    onDragEnter(draggingEvent: DraggingEvent): void;
    onDragLeave(params: DraggingEvent): void;
    onDragging(params: DraggingEvent): void;
    onDragStop(params: DraggingEvent): void;
}
