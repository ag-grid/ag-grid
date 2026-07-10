import type { BeanCollection } from 'ag-grid-community';
import { _isClientSideRowModel } from 'ag-grid-community';

export function startBatchEdit({ editSvc, gos, rowModel, log }: BeanCollection): void {
    if (!_isClientSideRowModel(gos, rowModel)) {
        log.warn(289, { rowModelType: gos.get('rowModelType') });
        return;
    }

    editSvc?.startBatchEditing();
}

export function cancelBatchEdit({ editSvc }: BeanCollection): void {
    editSvc?.stopBatchEditing({ cancel: true, source: 'api', forceCancel: true });
}

export function commitBatchEdit({ editSvc }: BeanCollection): void {
    editSvc?.stopBatchEditing({ source: 'api', forceStop: true, commit: true });
}

export function isBatchEditing(beans: BeanCollection): boolean {
    return beans.editSvc?.isBatchEditing() ?? false;
}
