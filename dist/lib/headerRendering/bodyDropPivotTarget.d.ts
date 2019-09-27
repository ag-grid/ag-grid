// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { DraggingEvent } from "../dragAndDrop/dragAndDropService";
import { DropListener } from "./bodyDropTarget";
export declare class BodyDropPivotTarget implements DropListener {
    private columnController;
    private gridOptionsWrapper;
    private columnsToAggregate;
    private columnsToGroup;
    private columnsToPivot;
    private pinned;
    constructor(pinned: string);
    /** Callback for when drag enters */
    onDragEnter(draggingEvent: DraggingEvent): void;
    getIconName(): string;
    /** Callback for when drag leaves */
    onDragLeave(draggingEvent: DraggingEvent): void;
    private clearColumnsList;
    /** Callback for when dragging */
    onDragging(draggingEvent: DraggingEvent): void;
    /** Callback for when drag stops */
    onDragStop(draggingEvent: DraggingEvent): void;
}
