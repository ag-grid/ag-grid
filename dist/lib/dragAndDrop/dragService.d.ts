// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export declare class DragService {
    private loggerFactory;
    private currentDragParams;
    private dragging;
    private eventLastTime;
    private dragStartEvent;
    private onMouseUpListener;
    private onMouseMoveListener;
    private logger;
    private init();
    addDragSource(params: DragListenerParams): void;
    private onMouseDown(params, mouseEvent);
    private isEventNearStartEvent(event);
    private onMouseMove(mouseEvent);
    onMouseUp(mouseEvent: MouseEvent): void;
}
export interface DragListenerParams {
    dragStartPixels?: number;
    eElement: HTMLElement;
    onDragStart: (mouseEvent: MouseEvent) => void;
    onDragStop: (mouseEvent: MouseEvent) => void;
    onDragging: (mouseEvent: MouseEvent) => void;
}
