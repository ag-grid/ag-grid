import type { BeanCollection } from 'ag-grid-community';
import { _isClientSideRowModel, _warn } from 'ag-grid-community';

export function startBatchEdit({ editSvc, gos, rowModel }: BeanCollection): void {
    if (!editSvc?.isBatchEditing()) {
        if (!_isClientSideRowModel(gos, rowModel)) {
            _warn(289, { rowModelType: gos.get('rowModelType') });
            return;
        }

        editSvc?.setBatchEditing(true);
    }
}

export function cancelBatchEdit({ editSvc }: BeanCollection): void {
    if (!editSvc?.isBatchEditing()) {
        return;
    }

    editSvc?.stopEditing(undefined, { cancel: true, source: 'api' });
    editSvc?.setBatchEditing(false);
}

export function commitBatchEdit({ editSvc }: BeanCollection): void {
    if (!editSvc?.isBatchEditing()) {
        return;
    }

    editSvc?.stopEditing(undefined, { source: 'api' });
    editSvc?.setBatchEditing(false);
}

export function isBatchEditing(beans: BeanCollection): boolean {
    return beans.editSvc?.isBatchEditing() ?? false;
}
