import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { RowHighlightPosition } from '../interfaces/IRowHighlightService';
import type { IRowNode } from '../interfaces/iRowNode';
import type { RowDropZoneEvents, RowDropZoneParams } from './rowDragFeature';

export function addRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void {
    beans.rowDragSvc?.rowDragFeature?.addRowDropZone(params);
}

export function removeRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void {
    const activeDropTarget = beans.dragAndDrop?.findExternalZone(params);

    if (activeDropTarget) {
        beans.dragAndDrop?.removeDropTarget(activeDropTarget);
    }
}

export function getRowDropZoneParams(beans: BeanCollection, events?: RowDropZoneEvents): RowDropZoneParams | undefined {
    return beans.rowDragSvc?.rowDragFeature?.getRowDropZone(events);
}

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
        rowNode = null;
        position = 'none';
    } else if (typeof rowNode !== 'object' && rowNode !== undefined) {
        rowNode = beans.rowModel.getRowNode(rowNode);
    }

    const rowIndex = rowNode?.rowIndex;
    if (rowIndex === null || rowIndex === undefined || rowIndex < 0 || rowIndex >= beans.rowModel.getRowCount()) {
        rowHighlightSvc.clear();
    } else {
        rowHighlightSvc.set(rowNode as RowNode, position);
    }
}
