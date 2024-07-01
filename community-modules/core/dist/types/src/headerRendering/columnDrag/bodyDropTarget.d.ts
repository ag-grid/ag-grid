import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { DragAndDropIcon, DraggingEvent, DropTarget } from '../../dragAndDrop/dragAndDropService';
import { DragSourceType } from '../../dragAndDrop/dragAndDropService';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
export interface DropListener {
    getIconName(): DragAndDropIcon | null;
    onDragEnter(params: DraggingEvent): void;
    onDragLeave(params: DraggingEvent): void;
    onDragging(params: DraggingEvent): void;
    onDragStop(params: DraggingEvent): void;
}
export declare class BodyDropTarget extends BeanStub implements DropTarget {
    private dragAndDropService;
    private columnModel;
    private ctrlsService;
    wireBeans(beans: BeanCollection): void;
    private pinned;
    private eContainer;
    private eSecondaryContainers;
    private currentDropListener;
    private moveColumnFeature;
    private bodyDropPivotTarget;
    constructor(pinned: ColumnPinnedType, eContainer: HTMLElement);
    postConstruct(): void;
    isInterestedIn(type: DragSourceType): boolean;
    getSecondaryContainers(): HTMLElement[][];
    getContainer(): HTMLElement;
    getIconName(): DragAndDropIcon | null;
    private isDropColumnInPivotMode;
    onDragEnter(draggingEvent: DraggingEvent): void;
    onDragLeave(params: DraggingEvent): void;
    onDragging(params: DraggingEvent): void;
    onDragStop(params: DraggingEvent): void;
}
