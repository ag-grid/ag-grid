import type { ColKey, Column, _BeanCollection } from 'ag-grid-community';

import type { RowGroupColsSvc } from './rowGroupColsSvc';

export function setRowGroupColumns(beans: _BeanCollection, colKeys: ColKey[]): void {
    beans.rowGroupColsSvc?.setColumns(colKeys, 'api');
}

export function removeRowGroupColumns(beans: _BeanCollection, colKeys: ColKey[]): void {
    beans.rowGroupColsSvc?.removeColumns(colKeys, 'api');
}

export function addRowGroupColumns(beans: _BeanCollection, colKeys: ColKey[]): void {
    beans.rowGroupColsSvc?.addColumns(colKeys, 'api');
}

export function moveRowGroupColumn(beans: _BeanCollection, fromIndex: number, toIndex: number): void {
    (beans.rowGroupColsSvc as RowGroupColsSvc)?.moveColumn?.(fromIndex, toIndex, 'api');
}

export function getRowGroupColumns(beans: _BeanCollection): Column[] {
    return beans.rowGroupColsSvc?.columns ?? [];
}
