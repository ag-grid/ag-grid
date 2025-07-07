import type { RowNode } from '../../entities/rowNode';
import type {
    RowDragCancelEvent,
    RowDragEndEvent,
    RowDragEnterEvent,
    RowDragLeaveEvent,
    RowDragMoveEvent,
} from '../../events';
import type { AgGridCommon } from '../../interfaces/iCommon';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { DraggingEvent } from '../dragAndDropService';

export type RowDropTargetPosition = 'above' | 'inside' | 'below';

export interface IsRowValidDropPositionResult<TData = any> {
    /** The rows that are being dropped, can be used to filter the rows. If empty, the operation is aborted. */
    rows?: IRowNode<TData>[] | null;
    /** The position of the rows relative to the target row */
    position?: RowDropTargetPosition;
    /** The new parent row the rows will have after dropped */
    newParent?: RowNode<TData> | null;
    /** The target row node where the row is being dropped. */
    target?: IRowNode<TData> | null;
}

export type IsRowValidDropPositionCallback<TData = any, TContext = any> = (
    params: IsRowValidDropPositionParams<TData, TContext>
) => IsRowValidDropPositionResult<TData> | null | boolean;

export interface IsRowValidDropPositionParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    rootNode: IRowNode<TData>;
    /** The dragging event that originated this drop operation */
    draggingEvent: DraggingEvent<TData, TContext> | null;
    /** True if this rows comes from the same grid, false if is coming from another grid */
    sameGrid: boolean;
    /** The position of the rows relative to the target row */
    position: RowDropTargetPosition;
    /** The source row node that was dragged, if any */
    source: IRowNode<TData> | null;
    /** The target row node where the row is being dropped. */
    target: IRowNode<TData> | null;
    /** The new parent row the rows will have after dropped */
    newParent: IRowNode<TData> | null;
    /** The rows that are being dropped */
    rows: IRowNode<TData>[];
}

export interface RowDropZoneEvents {
    /** Callback function that will be executed when the rowDrag enters the target. */
    onDragEnter?: (params: RowDragEnterEvent) => void;
    /** Callback function that will be executed when the rowDrag leaves the target */
    onDragLeave?: (params: RowDragLeaveEvent) => void;
    /**
     * Callback function that will be executed when the rowDrag is dragged inside the target.
     * Note: this gets called multiple times.
     */
    onDragging?: (params: RowDragMoveEvent) => void;
    /** Callback function that will be executed when the rowDrag drops rows within the target. */
    onDragStop?: (params: RowDragEndEvent) => void;
    onDragCancel?: (params: RowDragCancelEvent) => void;
}

export interface RowDropZoneParams extends RowDropZoneEvents {
    /** A callback method that returns the DropZone HTMLElement. */
    getContainer: () => HTMLElement;
}
