import type { BeanCollection } from 'ag-grid-community';

export function startBatchEdit(beans: BeanCollection): void {
    beans.editSvc?.setBatchEditing(true);
}

export function cancelBatchEdit(beans: BeanCollection): void {
    beans.editSvc?.stopEditing(undefined, { cancel: true, source: 'api' });
    beans.editSvc?.setBatchEditing(false);
}

export function commitBatchEdit(beans: BeanCollection): void {
    beans.editSvc?.stopEditing(undefined, { source: 'api' });
    beans.editSvc?.setBatchEditing(false);
}

export function isBatchEditing(beans: BeanCollection): boolean {
    return beans.editSvc?.isBatchEditing() ?? false;
}
