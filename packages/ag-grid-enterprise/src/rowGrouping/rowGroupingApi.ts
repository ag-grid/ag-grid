import type { BeanCollection, ColKey, Column } from 'ag-grid-community';

export function setRowGroupColumns(beans: BeanCollection, colKeys: ColKey[]): void {
    beans.rowGroupColsSvc?.setColumns(colKeys, 'api');
}

export function removeRowGroupColumns(beans: BeanCollection, colKeys: ColKey[]): void {
    beans.rowGroupColsSvc?.removeColumns(colKeys, 'api');
}

export function addRowGroupColumns(beans: BeanCollection, colKeys: ColKey[]): void {
    beans.rowGroupColsSvc?.addColumns(colKeys, 'api');
}

export function moveRowGroupColumn(beans: BeanCollection, fromIndex: number, toIndex: number): void {
    beans.rowGroupColsSvc?.moveColumn(fromIndex, toIndex, 'api');
}

export function getRowGroupColumns(beans: BeanCollection): Column[] {
    return beans.rowGroupColsSvc?.columns ?? [];
}
