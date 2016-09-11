// Type definitions for ag-grid v5.4.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
/** Adds drag listening onto an element. In ag-Grid this is used twice, first is resizing columns,
 * second is moving the columns and column groups around (ie the 'drag' part of Drag and Drop. */
export declare class DragService {
    private loggerFactory;
    private eventService;
    private currentDragParams;
    private dragging;
    private eventLastTime;
    private dragStartEvent;
    private onMouseUpListener;
    private onMouseMoveListener;
    private logger;
    private destroyFunctions;
    private eBody;
    private init();
    private destroy();
    private setNoSelectToBody(noSelect);
    addDragSource(params: DragListenerParams): void;
    private onMouseDown(params, mouseEvent);
    private isEventNearStartEvent(event);
    private onMouseMove(mouseEvent);
    onMouseUp(mouseEvent: MouseEvent): void;
}
export interface DragListenerParams {
    /** After how many pixels of dragging should the drag operation start. Default is 4px. */
    dragStartPixels?: number;
    /** Dom element to add the drag handling to */
    eElement: HTMLElement;
    /** Callback for drag starting */
    onDragStart: (mouseEvent: MouseEvent) => void;
    /** Callback for drag stopping */
    onDragStop: (mouseEvent: MouseEvent) => void;
    /** Callback for mouse move while dragging */
    onDragging: (mouseEvent: MouseEvent) => void;
}
