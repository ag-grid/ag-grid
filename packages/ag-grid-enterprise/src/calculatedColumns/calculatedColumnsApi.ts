import type { BeanCollection, ColKey, RefreshCalculatedColumnsParams } from 'ag-grid-community';

export function openCalculatedColumnDialog(beans: BeanCollection, column: ColKey): void {
    beans.calculatedColsSvc?.openCalculatedColumnDialog(beans.colModel.getCol(column), 'edit', false);
}

export function openAddCalculatedColumnDialog(beans: BeanCollection, sourceColumn?: ColKey): void {
    const { colModel, calculatedColsSvc } = beans;
    if (colModel.pivotMode) {
        return;
    }
    const column = colModel.getCol(sourceColumn);
    if (sourceColumn != null && !column) {
        return;
    }
    calculatedColsSvc?.openCalculatedColumnDialog(column, 'add', false);
}

export function refreshCalculatedColumns(beans: BeanCollection, params?: RefreshCalculatedColumnsParams): void {
    beans.calculatedColsSvc?.refreshCalculatedColumns(params);
}
