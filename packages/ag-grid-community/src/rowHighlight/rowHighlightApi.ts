import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { IRowNode } from '../interfaces/iRowNode';
import type { RowHighlightPosition } from './rowHighlightPosition';

/** Gets the currently highlighted row */
export function getHighlightedRow<TData>(beans: BeanCollection): IRowNode<TData> | undefined {
    return beans.rowHighlightSvc?.row ?? undefined;
}

/** Sets the current highlighted row */
export function setHighlightedRow<TData>(
    beans: BeanCollection,
    rowNode: string | IRowNode<TData> | null | undefined,
    position: RowHighlightPosition | '' | false | null
): void {
    const rowHighlightSvc = beans.rowHighlightSvc;
    if (!rowHighlightSvc) {
        return;
    }

    if (!position || position === 'none') {
        rowHighlightSvc.clear();
        return;
    }

    if (typeof rowNode !== 'object' && rowNode !== undefined) {
        rowNode = beans.rowModel.getRowNode(rowNode);
    }

    const rowIndex = rowNode?.rowIndex;
    const rowCount = beans.rowModel.getRowCount();
    if (rowIndex === null || rowIndex === undefined || rowIndex < 0 || rowIndex >= rowCount) {
        rowHighlightSvc.clear();
        return; // Not a valid row node, not found or deleted or not part of this grid.
    }

    rowHighlightSvc.set(rowNode as RowNode, position);
}
