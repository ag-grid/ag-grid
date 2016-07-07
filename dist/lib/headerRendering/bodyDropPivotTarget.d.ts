// Type definitions for ag-grid v5.0.0-alpha.6
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
export declare class BodyDropPivotTarget {
    private columnController;
    private columnsToAggregate;
    private columnsToGroup;
    /** Callback for when drag enters */
    onDragEnter(draggingEvent: DraggingEvent): void;
    /** Callback for when drag leaves */
    onDragLeave(draggingEvent: DraggingEvent): void;
    /** Callback for when dragging */
    onDragging(draggingEvent: DraggingEvent): void;
    /** Callback for when drag stops */
    onDragStop(draggingEvent: DraggingEvent): void;
}
