/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IDragService {
    readonly beanName: 'dragSvc';

    readonly startTarget: EventTarget | null;

    removeDragSource(params: DragListenerParams): void;

    addDragSource(params: DragListenerParams): void;

    cancelDrag(el?: Element): void;

    /** Returns true if the pointer is currently captured. See https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events */
    hasPointerCapture(): boolean;
}

export interface DragListenerParams {
    /** If true, the pointer will be captured, see https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events */
    capturePointer?: boolean;
    /** After how many pixels of dragging should the drag operation start. Default is 4px. */
    dragStartPixels?: number;
    /** Dom element to add the drag handling to */
    eElement: Element;
    /** Called when a press has moved far enough to start a drag; returning `false` discards the press. */
    canStartDrag?: () => boolean;
    /** Callback for drag starting */
    onDragStart?: (mouseEvent: MouseEvent | Touch) => void;
    /** Callback for drag stopping */
    onDragStop?: (mouseEvent: MouseEvent | Touch) => void;
    /** Callback for drag cancel */
    onDragCancel?: () => void;
    /** Callback for mouse move while dragging */
    onDragging?: (mouseEvent: MouseEvent | Touch) => void;
    /** Include touch events for this Drag Listener */
    includeTouch?: boolean;
    /** If `true`, it will stop the propagation of Touch Events */
    stopPropagationForTouch?: boolean;
}
