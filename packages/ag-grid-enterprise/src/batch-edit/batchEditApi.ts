import type { _BeanCollection } from 'ag-grid-community';
import { _isClientSideRowModel, _warn } from 'ag-grid-community';

export function startBatchEdit({ editSvc, gos, rowModel }: _BeanCollection): void {
    if (!editSvc?.isBatchEditing()) {
        if (!_isClientSideRowModel(gos, rowModel)) {
            _warn(289, { rowModelType: gos.get('rowModelType') });
            return;
        }

        editSvc?.setBatchEditing(true);
    }
}

export function cancelBatchEdit({ editSvc }: _BeanCollection): void {
    if (!editSvc?.isBatchEditing()) {
        return;
    }

    editSvc?.stopEditing(undefined, { cancel: true, source: 'api', forceCancel: true });
    editSvc?.setBatchEditing(false);
}

export function commitBatchEdit({ editSvc }: _BeanCollection): void {
    if (!editSvc?.isBatchEditing()) {
        return;
    }

    editSvc?.stopEditing(undefined, { source: 'api', forceStop: true });
    editSvc?.setBatchEditing(false);
}

export function isBatchEditing(beans: _BeanCollection): boolean {
    return beans.editSvc?.isBatchEditing() ?? false;
}
