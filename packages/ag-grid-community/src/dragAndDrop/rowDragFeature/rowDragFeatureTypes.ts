import type { RowNode } from '../../entities/rowNode';
import type {
    RowDragCancelEvent,
    RowDragEndEvent,
    RowDragEnterEvent,
    RowDragLeaveEvent,
    RowDragMoveEvent,
} from '../../events';
import type { DropIndicatorPosition } from '../../interfaces/IRowDropHighlightService';
import type { AgGridCommon } from '../../interfaces/iCommon';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { DraggingEvent } from '../dragAndDropService';

export type RowDropTargetPosition = 'above' | 'inside' | 'below';

export interface IsRowValidDropPositionResult<TData = any> {
    /** The rows that are being dropped, can be used to filter the rows. If empty, the operation is aborted. */
    rows?: IRowNode<TData>[] | null;
    /** The position of the rows relative to the target row */
    position?: DropIndicatorPosition;
    /** The new parent row the rows will have after dropped */
    newParent?: RowNode<TData> | null;
    /** The target row node where the row is being dropped. */
    target?: IRowNode<TData> | null;
    /** When set to false, disables row dropping but shows the indicators correctly with a `notAllowed` icon */
    allowDrop?: boolean;
}

export type IsRowValidDropPositionCallback<TData = any, TContext = any> = (
    params: IsRowValidDropPositionParams<TData, TContext>
) => IsRowValidDropPositionResult<TData> | null | boolean;

export type RowDropEventType = 'rowDragEnter' | 'rowDragMove' | 'rowDragEnd';

export interface RowsDropPosition<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    type: RowDropEventType;
    /** The dragging event that originated this drop operation */
    draggingEvent: DraggingEvent<TData, TContext> | null;
    /** The vertical pixel location the mouse is over, with `0` meaning the top of the first row.
     * This can be compared to the `rowNode.rowHeight` and `rowNode.rowTop` to work out the mouse position relative to rows.
     * The provided attributes `overIndex` and `overNode` means the `y` property is mostly redundant.
     * The `y` property can be handy if you want more information such as 'how close is the mouse to the top or bottom of the row?'
     */
    y: number;
    /** If the grid supports tree data drag and drop */
    hierarchical: boolean;
    /** This is true if the grid option `rowDragManaged` is true, meaning that the grid is managing drag and drop logic. */
    rowDragManaged: boolean;
    /** This is true if the grid option `suppressMoveWhenRowDragging` is true, meaning that the rows be moved only after a drop. */
    suppressMoveWhenRowDragging: boolean;
    /** True if this rows comes from the same grid, false if is coming from another grid */
    sameGrid: boolean;
    /** The root node that contains all row nodes as children */
    rootNode: IRowNode<TData>;
    /** The source row node that was dragged, if any */
    source: IRowNode<TData> | null;
    /** The row node the mouse is dragging over or undefined if over no row. */
    overNode: IRowNode<TData> | undefined;
    /** The target row node where the row is being dropped. Might be different than `overNode`. */
    target: IRowNode<TData> | null;
    /** The new parent row the rows will have after dropped when using treeData */
    newParent: IRowNode<TData> | null;
    /** The rows that are being dropped */
    rows: IRowNode<TData>[];
    /** The position of the rows relative to the target row */
    position: DropIndicatorPosition;
    /** If dropping is allowed */
    allowDrop: boolean;
}

export interface IsRowValidDropPositionParams<TData = any, TContext = any>
    extends Exclude<RowsDropPosition<TData, TContext>, 'sourceInRows' | 'position' | 'allowDrop'> {
    /** The position of the rows relative to the target row */
    position: RowDropTargetPosition;
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
