import { BeanStub } from "../context/beanStub";
/** Adds drag listening onto an element. In AG Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
export declare class DragService extends BeanStub {
    private mouseEventService;
    private currentDragParams;
    private dragging;
    private startTarget;
    private mouseStartEvent;
    private touchLastTime;
    private touchStart;
    private dragEndFunctions;
    private dragSources;
    private removeAllListeners;
    private removeListener;
    removeDragSource(params: DragListenerParams): void;
    isDragging(): boolean;
    addDragSource(params: DragListenerParams): void;
    getStartTarget(): EventTarget | null;
    private onTouchStart;
    private onMouseDown;
    private addTemporaryEvents;
    private isEventNearStartEvent;
    private getFirstActiveTouch;
    private onCommonMove;
    private onTouchMove;
    private onMouseMove;
    private shouldPreventMouseEvent;
    private isOverFormFieldElement;
    onTouchUp(touchEvent: TouchEvent, el: Element): void;
    onMouseUp(mouseEvent: MouseEvent, el: Element): void;
    onUpCommon(eventOrTouch: MouseEvent | Touch, el: Element): void;
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
    /** Callback for mouse move while dragging */
    onDragging: (mouseEvent: MouseEvent | Touch) => void;
    /** Include touch events for this Drag Listener */
    includeTouch?: boolean;
    /** If `true`, it will stop the propagation of Touch Events */
    stopPropagationForTouch?: boolean;
}
