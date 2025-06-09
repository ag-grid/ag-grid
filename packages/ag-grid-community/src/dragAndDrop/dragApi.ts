import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { RowDropHighlight } from '../interfaces/IRowDropHighlightService';
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

export function getRowDropHighlight(beans: BeanCollection): RowDropHighlight {
    const rowDropHighlightSvc = beans.rowDropHighlightSvc;
    return rowDropHighlightSvc
        ? { row: rowDropHighlightSvc.row, position: rowDropHighlightSvc.position }
        : { row: null, position: 'none' };
}

export function setRowDropHighlight<TData>(
    beans: BeanCollection,
    highlight: RowDropHighlight<TData> | null | undefined
): void {
    const rowDropHighlightSvc = beans.rowDropHighlightSvc;
    if (!rowDropHighlightSvc) {
        return;
    }

    const rowNode = highlight?.row;
    let position = highlight?.position;

    if (position !== 'above' && position !== 'below') {
        position = 'none';
    }

    const rowIndex = rowNode?.rowIndex;
    if (rowIndex === null || rowIndex === undefined || position === 'none') {
        rowDropHighlightSvc.clear();
    } else {
        rowDropHighlightSvc.set(rowNode as RowNode, position);
    }
}
