import type { BeanCollection, CalculatedColumnDef, CalculatedColumnUpdate, ColKey } from 'ag-grid-community';

export function addCalculatedColumn(beans: BeanCollection, colDef: CalculatedColumnDef): void {
    beans.calculatedColsSvc?.addCalculatedColumn(colDef);
}

export function updateCalculatedColumn(beans: BeanCollection, column: ColKey, colDef: CalculatedColumnUpdate): void {
    beans.calculatedColsSvc?.updateCalculatedColumn(column, colDef);
}

export function removeCalculatedColumn(beans: BeanCollection, column: ColKey): void {
    beans.calculatedColsSvc?.removeCalculatedColumn(beans.colModel.getColDefColOrCol(column));
}

export function openCalculatedColumnDialog(beans: BeanCollection, column: ColKey): void {
    beans.calculatedColsSvc?.openCalculatedColumnDialog(beans.colModel.getColDefColOrCol(column), 'edit');
}
