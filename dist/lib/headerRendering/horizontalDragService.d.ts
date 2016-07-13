// Type definitions for ag-grid v5.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
/** need to get this class to use the dragService, so no duplication */
export interface DragServiceParams {
    eDraggableElement: Element;
    eBody: HTMLElement;
    cursor: string;
    startAfterPixels: number;
    onDragStart: (event?: MouseEvent) => void;
    onDragging: (delta: number, finished: boolean) => void;
}
export declare class HorizontalDragService {
    addDragHandling(params: DragServiceParams): void;
}
