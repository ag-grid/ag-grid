import { DraggingEvent, DragSourceType, DropTarget } from "../../dragAndDrop/dragAndDropService";
import { BeanStub } from "../../context/beanStub";
export interface DropListener {
    getIconName(): string | null;
    onDragEnter(params: DraggingEvent): void;
    onDragLeave(params: DraggingEvent): void;
    onDragging(params: DraggingEvent): void;
    onDragStop(params: DraggingEvent): void;
}
export declare class BodyDropTarget extends BeanStub implements DropTarget {
    private dragAndDropService;
    private columnModel;
    private ctrlsService;
    private pinned;
    private eContainer;
    private eSecondaryContainers;
    private currentDropListener;
    private moveColumnFeature;
    private bodyDropPivotTarget;
    constructor(pinned: string | null, eContainer: HTMLElement);
    private postConstruct;
    isInterestedIn(type: DragSourceType): boolean;
    getSecondaryContainers(): HTMLElement[][];
    getContainer(): HTMLElement;
    private init;
    getIconName(): string | null;
    private isDropColumnInPivotMode;
    onDragEnter(draggingEvent: DraggingEvent): void;
    onDragLeave(params: DraggingEvent): void;
    onDragging(params: DraggingEvent): void;
    onDragStop(params: DraggingEvent): void;
}
