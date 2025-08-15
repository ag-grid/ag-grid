import type { HorizontalDirection, VerticalDirection } from '../constants/direction';

export interface IDragAndDropService<
    TDragSourceType extends number,
    TDragItem,
    TDragAndDropIcon extends string,
    TDragSource extends AgDragSource<TDragSourceType, TDragItem, TDragAndDropIcon>,
> {
    readonly beanName: 'dragAndDrop';

    addDragSource(dragSource: TDragSource, allowTouch?: boolean): void;

    setDragDropIcon(iconName: string | null, shake: boolean): void;

    removeDragSource(dragSource: TDragSource): void;

    nudge(): void;

    addDropTarget(dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon>): void;

    removeDropTarget(dropTarget: AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon>): void;

    hasExternalDropZones(): boolean;

    findExternalZone(container: HTMLElement): AgDropTarget<TDragSourceType, TDragItem, TDragAndDropIcon> | null;
}

export interface AgDragSource<TDragSourceType extends number, TDragItem, TDragAndDropIcon extends string> {
    /**
     * The type of the drag source, used by the drop target to know where the
     * drag originated from.
     */
    type: TDragSourceType;
    /** Can be used to identify a specific component as the source */
    sourceId?: string;
    /**
     * Element which, when dragged, will kick off the DnD process
     */
    eElement: Element;
    /**
     * If eElement is dragged, then the dragItem is the object that gets passed around.
     */
    getDragItem: () => TDragItem;
    /**
     * This name appears in the drag and drop image component when dragging.
     */
    dragItemName: string | (() => string) | null;
    /**
     * Icon to show when not over a drop zone
     */
    getDefaultIconName?: () => TDragAndDropIcon;
    /**
     * The drag source DOM Data Key, this is useful to detect if the origin instance is the same
     * as the target instance.
     */
    dragSourceDomDataKey?: string;
    /**
     * After how many pixels of dragging should the drag operation start. Default is 4.
     */
    dragStartPixels?: number;
    /**
     * Callback for drag started
     */
    onDragStarted?: () => void;
    /**
     * Callback for drag stopped
     */
    onDragStopped?: () => void;
    /**
     * Callback for drag cancelled
     */
    onDragCancelled?: () => void;
}

export interface AgDropTarget<TDragSourceType extends number, TDragItem, TDragAndDropIcon extends string> {
    /** The main container that will get the drop. */
    getContainer(): HTMLElement;
    /** If any secondary containers. For example when moving columns in AG Grid, we listen for drops
     * in the header as well as the body (main rows and pinned rows) of the grid. */
    getSecondaryContainers?(): HTMLElement[][];
    /** Icon to show when drag is over */
    getIconName?(): TDragAndDropIcon | null;

    isInterestedIn(type: TDragSourceType, el: Element): boolean;

    /**
     * If `true`, the DragSources will only be allowed to be dragged within the DragTarget that contains them.
     * This is useful for changing order of items within a container, and not moving items across containers.
     * @default false
     */
    targetContainsSource?: boolean;

    /** Callback for when drag enters */
    onDragEnter?(params: AgDraggingEvent<TDragSourceType, TDragItem, TDragAndDropIcon>): void;
    /** Callback for when drag leaves */
    onDragLeave?(params: AgDraggingEvent<TDragSourceType, TDragItem, TDragAndDropIcon>): void;
    /** Callback for when dragging */
    onDragging?(params: AgDraggingEvent<TDragSourceType, TDragItem, TDragAndDropIcon>): void;
    /** Callback for when drag stops */
    onDragStop?(params: AgDraggingEvent<TDragSourceType, TDragItem, TDragAndDropIcon>): void;
    /** Callback for when the drag is cancelled */
    onDragCancel?(params: AgDraggingEvent<TDragSourceType, TDragItem, TDragAndDropIcon>): void;
    external?: boolean;
}

export interface AgDraggingEvent<TDragSourceType extends number, TDragItem, TDragAndDropIcon extends string> {
    event: MouseEvent;
    x: number;
    y: number;
    vDirection: VerticalDirection | null;
    hDirection: HorizontalDirection | null;
    dragSource: AgDragSource<TDragSourceType, TDragItem, TDragAndDropIcon>;
    dragItem: TDragItem;
    fromNudge: boolean;
    dropZoneTarget: HTMLElement;
}

export interface IDragAndDropImage {
    setIcon(iconName: string | null, shake: boolean): void;
    setLabel(label: string): void;
}
