import type { BeanCollection } from '../context/context';
import type { RowDropZoneEvents, RowDropZoneParams } from '../gridBodyComp/rowDragFeature';

export function addRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void {
    beans.ctrlsService.getGridBodyCtrl().getRowDragFeature().addRowDropZone(params);
}

export function removeRowDropZone(beans: BeanCollection, params: RowDropZoneParams): void {
    const activeDropTarget = beans.dragAndDropService.findExternalZone(params);

    if (activeDropTarget) {
        beans.dragAndDropService.removeDropTarget(activeDropTarget);
    }
}

export function getRowDropZoneParams(beans: BeanCollection, events?: RowDropZoneEvents): RowDropZoneParams {
    return beans.ctrlsService.getGridBodyCtrl().getRowDragFeature().getRowDropZone(events);
}
