import type { BeanCollection, EditingCellPosition, SetEditingCellsParams } from 'ag-grid-community';

export function setEditingCells(
    beans: BeanCollection,
    cells: EditingCellPosition[],
    params?: SetEditingCellsParams
): void {
    beans.editSvc?.setEditingCells(cells, params);
}

export function setBatchEditing(beans: BeanCollection, enabled: boolean): void {
    beans.editSvc?.setBatchEditing(enabled);
}

export function isBatchEditing(beans: BeanCollection): boolean {
    return beans.editSvc?.isBatchEditing() ?? false;
}
