export interface IDragService {
    readonly beanName: 'dragSvc';

    removeDragSource(params: DragListenerParams): void;

    addDragSource(params: DragListenerParams): void;

    onTouchUp(touchEvent: TouchEvent, el: Element): void;

    onMouseUp(mouseEvent: MouseEvent, el: Element): void;

    onUpCommon(eventOrTouch: MouseEvent | Touch, el: Element): void;

    cancelDrag(el: Element): void;
}

export interface DragListenerParams {
    /** After how many pixels of dragging should the drag operation start. Default is 4px. */
    dragStartPixels?: number;
    /** Dom element to add the drag handling to */
    eElement: Element;
    /** Some places may wish to ignore certain events, eg range selection ignores shift clicks */
    skipMouseEvent?: (mouseEvent: MouseEvent) => boolean;
    /** Callback for drag starting */
    onDragStart: (mouseEvent: MouseEvent | Touch) => void;
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
