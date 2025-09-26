import type { BeanCollection } from '../context/context';
import type {
    RowDropPositionIndicator,
    SetRowDropPositionIndicatorParams,
} from '../dragAndDrop/rowDropHighlightService';
import type { RowNode } from '../entities/rowNode';
import type { RowDropZoneEvents, RowDropZoneParams } from './rowDragTypes';

export function addRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void {
    beans.rowDragSvc?.rowDragFeature?.addRowDropZone(params);
}

export function removeRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void {
    const activeDropTarget = beans.dragAndDrop?.findExternalZone(params.getContainer());

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

    if (position !== 'above' && position !== 'below' && position !== 'inside') {
        position = 'none';
    }

    const rowIndex = rowNode?.rowIndex;
    if (rowIndex === null || rowIndex === undefined || position === 'none') {
        rowDropHighlightSvc.clear();
    } else {
        rowDropHighlightSvc.set(rowNode as RowNode, position);
    }
}
