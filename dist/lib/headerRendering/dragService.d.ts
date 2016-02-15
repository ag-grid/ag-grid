// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export interface DragServiceParams {
    eDraggableElement: Element;
    eBody: HTMLElement;
    cursor: string;
    startAfterPixels: number;
    onDragStart: (event?: MouseEvent) => void;
    onDragging: (delta: number, finished: boolean) => void;
}
export declare class DragService {
    addDragHandling(params: DragServiceParams): void;
}
