import type { BeanCollection, ColDef, Column } from 'ag-grid-community';

export function setRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.rowGroupColsService?.setColumns(colKeys, 'api');
}

export function removeRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.rowGroupColsService?.removeColumns(colKeys, 'api');
}

export function addRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.rowGroupColsService?.addColumns(colKeys, 'api');
}

export function moveRowGroupColumn(beans: BeanCollection, fromIndex: number, toIndex: number): void {
    beans.rowGroupColsService?.moveColumn?.(fromIndex, toIndex, 'api');
}

export function getRowGroupColumns(beans: BeanCollection): Column[] {
    return beans.rowGroupColsService?.columns ?? [];
}
