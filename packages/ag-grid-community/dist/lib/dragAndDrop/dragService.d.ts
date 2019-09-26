// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
/** Adds drag listening onto an element. In ag-Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
export declare class DragService {
    private loggerFactory;
    private eventService;
    private gridOptionsWrapper;
    private columnApi;
    private gridApi;
    private currentDragParams;
    private dragging;
    private mouseStartEvent;
    private touchLastTime;
    private touchStart;
    private onMouseUpListener;
    private onMouseMoveListener;
    private onTouchEndListener;
    private onTouchMoveListener;
    private logger;
    private dragEndFunctions;
    private dragSources;
    private init;
    private destroy;
    private removeListener;
    removeDragSource(params: DragListenerParams): void;
    private setNoSelectToBody;
    addDragSource(params: DragListenerParams, includeTouch?: boolean): void;
    private onTouchStart;
    private onMouseDown;
    private isEventNearStartEvent;
    private getFirstActiveTouch;
    private onCommonMove;
    private onTouchMove;
    private onMouseMove;
    onTouchUp(touchEvent: TouchEvent): void;
    onMouseUp(mouseEvent: MouseEvent): void;
    onUpCommon(eventOrTouch: MouseEvent | Touch): void;
}
export interface DragListenerParams {
    /** After how many pixels of dragging should the drag operation start. Default is 4px. */
    dragStartPixels?: number;
    /** Dom element to add the drag handling to */
    eElement: HTMLElement;
    /** Some places may wish to ignore certain events, eg range selection ignores shift clicks */
    skipMouseEvent?: (mouseEvent: MouseEvent) => boolean;
    /** Callback for drag starting */
    onDragStart: (mouseEvent: MouseEvent | Touch) => void;
    /** Callback for drag stopping */
    onDragStop: (mouseEvent: MouseEvent | Touch) => void;
    /** Callback for mouse move while dragging */
    onDragging: (mouseEvent: MouseEvent | Touch) => void;
}
