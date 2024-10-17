import type { BeanCollection, ColDef, ColGroupDef, Column, IAggFunc } from 'ag-grid-community';

export function addAggFuncs(beans: BeanCollection, aggFuncs: { [key: string]: IAggFunc }): void {
    if (beans.aggFuncService) {
        beans.aggFuncService.addAggFuncs(aggFuncs);
    }
}

export function clearAggFuncs(beans: BeanCollection): void {
    if (beans.aggFuncService) {
        beans.aggFuncService.clear();
    }
}

export function setColumnAggFunc(
    beans: BeanCollection,
    key: string | ColDef | Column,
    aggFunc: string | IAggFunc | null | undefined
): void {
    beans.valueColsService!.setColumnAggFunc!(key, aggFunc, 'api');
}

export function isPivotMode(beans: BeanCollection): boolean {
    return beans.columnModel.isPivotMode();
}

export function getPivotResultColumn<TValue = any, TData = any>(
    beans: BeanCollection,
    pivotKeys: string[],
    valueColKey: string | ColDef<TData, TValue> | Column<TValue>
): Column<TValue> | null {
    return beans.pivotResultColsService?.lookupPivotResultCol(pivotKeys, valueColKey) ?? null;
}

export function setValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.valueColsService?.setColumns(colKeys, 'api');
}

export function getValueColumns(beans: BeanCollection): Column[] {
    return beans.valueColsService?.columns ?? [];
}

export function removeValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.valueColsService?.removeColumns(colKeys, 'api');
}

export function addValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.valueColsService?.addColumns(colKeys, 'api');
}

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

export function setPivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.pivotColsService?.setColumns(colKeys, 'api');
}

export function removePivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.pivotColsService?.removeColumns(colKeys, 'api');
}

export function addPivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.pivotColsService?.addColumns(colKeys, 'api');
}

export function getPivotColumns(beans: BeanCollection): Column[] {
    return beans.pivotColsService?.columns ?? [];
}

export function setPivotResultColumns(beans: BeanCollection, colDefs: (ColDef | ColGroupDef)[] | null): void {
    beans.pivotResultColsService?.setPivotResultCols(colDefs, 'api');
}

export function getPivotResultColumns(beans: BeanCollection): Column[] | null {
    const pivotResultCols = beans.pivotResultColsService?.getPivotResultCols();
    return pivotResultCols ? pivotResultCols.list : null;
}
