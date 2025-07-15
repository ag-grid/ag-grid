import type { DragItem } from '../../interfaces/iDragItem';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { DraggingEvent } from '../dragAndDropService';
import type { InternalRowsDrop } from './rowDragLogic';

export interface RowDragNodeToShow {
    row: IRowNode | null;
    count: number;
    allow: boolean;
}

export const rowDragNodeToShowEquals = (
    a: RowDragNodeToShow | null | undefined,
    b: RowDragNodeToShow | null | undefined
): boolean => (a && b ? a.row === b.row && a.count === b.count && a.allow === b.allow : a === b);

export const rowDragNodeToShow = (
    draggingEvent: DraggingEvent | null | undefined,
    dragItem: DragItem | null | undefined
): RowDragNodeToShow => {
    if (!dragItem && draggingEvent) {
        dragItem = draggingEvent.dragItem;
    }
    const rowsDrop = draggingEvent?.rowsDrop as InternalRowsDrop | undefined;
    if (dragItem && (!rowsDrop || (rowsDrop.rowDragManaged && !rowsDrop.suppressMoveWhenRowDragging))) {
        const rowNode = dragItem.rowNode ?? null;
        const length = dragItem.rowNodes?.length;
        return { row: rowNode, count: length || 1, allow: length !== 0 || rowNode !== null };
    }
    if (!rowsDrop) {
        return { row: null, count: 0, allow: false };
    }
    const { source, _sourceInRows: sourceInRows, rows, allowDrop: allow } = rowsDrop;
    if (sourceInRows && source) {
        return { row: source, count: rows.length, allow };
    }
    if (rows.length === 1) {
        return { row: rows[0], count: 1, allow };
    }
    return { row: source, count: rows.length, allow };
};
