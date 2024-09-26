import type { BeanCollection } from '../context/context';
import type { RowDropZoneEvents, RowDropZoneParams } from './rowDragFeature';

export function addRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void {
    beans.rowDragService?.getRowDragFeature()?.addRowDropZone(params);
}

export function removeRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void {
    const activeDropTarget = beans.dragAndDropService?.findExternalZone(params);

    if (activeDropTarget) {
        beans.dragAndDropService?.removeDropTarget(activeDropTarget);
    }
}

export function getRowDropZoneParams(beans: BeanCollection, events?: RowDropZoneEvents): RowDropZoneParams | undefined {
    return beans.rowDragService?.getRowDragFeature()?.getRowDropZone(events);
}
