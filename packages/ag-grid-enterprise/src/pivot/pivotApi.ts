import type { ColDef, ColGroupDef, ColKey, Column, _BeanCollection } from 'ag-grid-community';

export function isPivotMode(beans: _BeanCollection): boolean {
    return beans.colModel.isPivotMode();
}

export function getPivotResultColumn<TValue = any, TData = any>(
    beans: _BeanCollection,
    pivotKeys: string[],
    valueColKey: ColKey<TData, TValue>
): Column<TValue> | null {
    return beans.pivotResultCols?.lookupPivotResultCol(pivotKeys, valueColKey) ?? null;
}

export function setValueColumns(beans: _BeanCollection, colKeys: ColKey[]): void {
    beans.valueColsSvc?.setColumns(colKeys, 'api');
}

export function getValueColumns(beans: _BeanCollection): Column[] {
    return beans.valueColsSvc?.columns ?? [];
}

export function removeValueColumns(beans: _BeanCollection, colKeys: ColKey[]): void {
    beans.valueColsSvc?.removeColumns(colKeys, 'api');
}

export function addValueColumns(beans: _BeanCollection, colKeys: ColKey[]): void {
    beans.valueColsSvc?.addColumns(colKeys, 'api');
}

export function setPivotColumns(beans: _BeanCollection, colKeys: ColKey[]): void {
    beans.pivotColsSvc?.setColumns(colKeys, 'api');
}

export function removePivotColumns(beans: _BeanCollection, colKeys: ColKey[]): void {
    beans.pivotColsSvc?.removeColumns(colKeys, 'api');
}

export function addPivotColumns(beans: _BeanCollection, colKeys: ColKey[]): void {
    beans.pivotColsSvc?.addColumns(colKeys, 'api');
}

export function getPivotColumns(beans: _BeanCollection): Column[] {
    return beans.pivotColsSvc?.columns ?? [];
}

export function setPivotResultColumns(beans: _BeanCollection, colDefs: (ColDef | ColGroupDef)[] | null): void {
    beans.pivotResultCols?.setPivotResultCols(colDefs, 'api');
}

export function getPivotResultColumns(beans: _BeanCollection): Column[] | null {
    const pivotResultCols = beans.pivotResultCols?.getPivotResultCols();
    return pivotResultCols ? pivotResultCols.list : null;
}
