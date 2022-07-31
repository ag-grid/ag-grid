import { DraggingEvent } from "../../dragAndDrop/dragAndDropService";
import { ColumnPinnedType } from "../../entities/column";
import { DropListener } from "./bodyDropTarget";
export declare class BodyDropPivotTarget implements DropListener {
    private columnModel;
    private gridOptionsWrapper;
    private columnsToAggregate;
    private columnsToGroup;
    private columnsToPivot;
    private pinned;
    constructor(pinned: ColumnPinnedType);
    /** Callback for when drag enters */
    onDragEnter(draggingEvent: DraggingEvent): void;
    getIconName(): string | null;
    /** Callback for when drag leaves */
    onDragLeave(draggingEvent: DraggingEvent): void;
    private clearColumnsList;
    /** Callback for when dragging */
    onDragging(draggingEvent: DraggingEvent): void;
    /** Callback for when drag stops */
    onDragStop(draggingEvent: DraggingEvent): void;
}
