import type { BeanCollection, ColDef, Column } from 'ag-grid-community';

export function setRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.setRowGroupColumns(colKeys, 'api');
}

export function removeRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.removeRowGroupColumns(colKeys, 'api');
}

export function addRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.addRowGroupColumns(colKeys, 'api');
}

export function moveRowGroupColumn(beans: BeanCollection, fromIndex: number, toIndex: number): void {
    beans.funcColsService.moveRowGroupColumn(fromIndex, toIndex, 'api');
}

export function getRowGroupColumns(beans: BeanCollection): Column[] {
    return beans.funcColsService.rowGroupCols;
}
