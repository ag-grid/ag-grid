import type { BeanCollection, ColKey, RefreshCalculatedColumnsParams } from 'ag-grid-community';

export function openCalculatedColumnDialog(beans: BeanCollection, column: ColKey): void {
    beans.calculatedColsSvc?.openCalculatedColumnDialog(beans.colModel.getCol(column), 'edit', false);
}

export function refreshCalculatedColumns(beans: BeanCollection, params?: RefreshCalculatedColumnsParams): void {
    beans.calculatedColsSvc?.refreshCalculatedColumns(params);
}
