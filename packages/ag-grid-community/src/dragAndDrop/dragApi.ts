import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type {
    RowDropPositionIndicator,
    SetRowDropPositionIndicatorParams,
} from '../interfaces/IRowDropHighlightService';
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

export function getRowDropPositionIndicator(beans: BeanCollection): RowDropPositionIndicator {
    const rowDropHighlightSvc = beans.rowDropHighlightSvc;
    return rowDropHighlightSvc
        ? { row: rowDropHighlightSvc.row, dropIndicatorPosition: rowDropHighlightSvc.position }
        : { row: null, dropIndicatorPosition: 'none' };
}

export function setRowDropPositionIndicator<TData>(
    beans: BeanCollection,
    params: SetRowDropPositionIndicatorParams<TData>
): void {
    const rowDropHighlightSvc = beans.rowDropHighlightSvc;
    if (!rowDropHighlightSvc) {
        return;
    }

    const rowNode = params?.row;
    let position = params?.dropIndicatorPosition;

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
