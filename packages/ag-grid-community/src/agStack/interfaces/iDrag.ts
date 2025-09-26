export interface IDragService {
    readonly beanName: 'dragSvc';

    readonly startTarget: EventTarget | null;

    removeDragSource(params: DragListenerParams): void;

    addDragSource(params: DragListenerParams): void;

    cancelDrag(el?: Element): void;
}

export interface DragListenerParams {
    /** After how many pixels of dragging should the drag operation start. Default is 4px. */
    dragStartPixels?: number;
    /** Dom element to add the drag handling to */
    eElement: Element;
    /** Callback for drag starting. Return false to cancel the drag operation. */
    onDragStart: (mouseEvent: MouseEvent | Touch) => boolean;
    /** Callback for drag stopping */
    onDragStop: (mouseEvent: MouseEvent | Touch) => void;
    /** Callback for drag cancel */
    onDragCancel?: () => void;
    /** Callback for mouse move while dragging */
    onDragging: (mouseEvent: MouseEvent | Touch) => void;
    /** Include touch events for this Drag Listener */
    includeTouch?: boolean;
    /** If `true`, it will stop the propagation of Touch Events */
    stopPropagationForTouch?: boolean;
}
