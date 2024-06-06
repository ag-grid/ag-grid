import type { BeanCollection, ColDef, ColGroupDef, Column, IAggFunc } from '@ag-grid-community/core';
import { _logDeprecation } from '@ag-grid-community/core';

export function addAggFunc(beans: BeanCollection, key: string, aggFunc: IAggFunc): void {
    _logDeprecation('v31.1', 'addAggFunc(key, func)', 'addAggFuncs({ key: func })');
    if (beans.aggFuncService) {
        beans.aggFuncService.addAggFuncs({ key: aggFunc });
    }
}

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
    beans.funcColsService.setColumnAggFunc(key, aggFunc, 'api');
}

export function isPivotMode(beans: BeanCollection): boolean {
    return beans.columnModel.isPivotMode();
}

export function getPivotResultColumn<TValue = any, TData = any>(
    beans: BeanCollection,
    pivotKeys: string[],
    valueColKey: string | ColDef<TData, TValue> | Column<TValue>
): Column<TValue> | null {
    return beans.pivotResultColsService.lookupPivotResultCol(pivotKeys, valueColKey);
}

export function setValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.setValueColumns(colKeys, 'api');
}

export function getValueColumns(beans: BeanCollection): Column[] {
    return beans.funcColsService.getValueColumns();
}

export function removeValueColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    _logDeprecation('v31.1', 'removeValueColumn(colKey)', 'removeValueColumns([colKey])');
    beans.funcColsService.removeValueColumns([colKey], 'api');
}

export function removeValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.removeValueColumns(colKeys, 'api');
}

export function addValueColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    _logDeprecation('v31.1', 'addValueColumn(colKey)', 'addValueColumns([colKey])');
    beans.funcColsService.addValueColumns([colKey], 'api');
}

export function addValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.addValueColumns(colKeys, 'api');
}

export function setRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.setRowGroupColumns(colKeys, 'api');
}

export function removeRowGroupColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    _logDeprecation('v31.1', 'removeRowGroupColumn(colKey)', 'removeRowGroupColumns([colKey])');
    beans.funcColsService.removeRowGroupColumns([colKey], 'api');
}

export function removeRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.removeRowGroupColumns(colKeys, 'api');
}

export function addRowGroupColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    _logDeprecation('v31.1', 'addRowGroupColumn(colKey)', 'addRowGroupColumns([colKey])');
    beans.funcColsService.addRowGroupColumns([colKey], 'api');
}

export function addRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.addRowGroupColumns(colKeys, 'api');
}

export function moveRowGroupColumn(beans: BeanCollection, fromIndex: number, toIndex: number): void {
    beans.funcColsService.moveRowGroupColumn(fromIndex, toIndex, 'api');
}

export function getRowGroupColumns(beans: BeanCollection): Column[] {
    return beans.funcColsService.getRowGroupColumns();
}

export function setPivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.setPivotColumns(colKeys, 'api');
}

export function removePivotColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    _logDeprecation('v31.1', 'removePivotColumn(colKey)', 'removePivotColumns([colKey])');
    beans.funcColsService.removePivotColumns([colKey], 'api');
}

export function removePivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.removePivotColumns(colKeys, 'api');
}

export function addPivotColumn(beans: BeanCollection, colKey: string | ColDef | Column): void {
    _logDeprecation('v31.1', 'addPivotColumn(colKey)', 'addPivotColumns([colKey])');
    beans.funcColsService.addPivotColumns([colKey], 'api');
}

export function addPivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void {
    beans.funcColsService.addPivotColumns(colKeys, 'api');
}

export function getPivotColumns(beans: BeanCollection): Column[] {
    return beans.funcColsService.getPivotColumns();
}

export function setPivotResultColumns(beans: BeanCollection, colDefs: (ColDef | ColGroupDef)[] | null): void {
    beans.pivotResultColsService.setPivotResultCols(colDefs, 'api');
}

export function getPivotResultColumns(beans: BeanCollection): Column[] | null {
    const pivotResultCols = beans.pivotResultColsService.getPivotResultCols();
    return pivotResultCols ? pivotResultCols.list : null;
}
