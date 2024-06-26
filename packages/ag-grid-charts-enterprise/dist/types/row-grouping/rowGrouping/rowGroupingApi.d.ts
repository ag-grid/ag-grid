import type { BeanCollection, ColDef, ColGroupDef, Column, IAggFunc } from 'ag-grid-community';
/** @deprecated v31.1 */
export declare function addAggFunc(beans: BeanCollection, key: string, aggFunc: IAggFunc): void;
export declare function addAggFuncs(beans: BeanCollection, aggFuncs: {
    [key: string]: IAggFunc;
}): void;
export declare function clearAggFuncs(beans: BeanCollection): void;
export declare function setColumnAggFunc(beans: BeanCollection, key: string | ColDef | Column, aggFunc: string | IAggFunc | null | undefined): void;
export declare function isPivotMode(beans: BeanCollection): boolean;
export declare function getPivotResultColumn<TValue = any, TData = any>(beans: BeanCollection, pivotKeys: string[], valueColKey: string | ColDef<TData, TValue> | Column<TValue>): Column<TValue> | null;
export declare function setValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void;
export declare function getValueColumns(beans: BeanCollection): Column[];
/** @deprecated v31.1 */
export declare function removeValueColumn(beans: BeanCollection, colKey: string | ColDef | Column): void;
export declare function removeValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void;
/** @deprecated v31.1 */
export declare function addValueColumn(beans: BeanCollection, colKey: string | ColDef | Column): void;
export declare function addValueColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void;
export declare function setRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void;
/** @deprecated v31.1 */
export declare function removeRowGroupColumn(beans: BeanCollection, colKey: string | ColDef | Column): void;
export declare function removeRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void;
/** @deprecated v31.1 */
export declare function addRowGroupColumn(beans: BeanCollection, colKey: string | ColDef | Column): void;
export declare function addRowGroupColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void;
export declare function moveRowGroupColumn(beans: BeanCollection, fromIndex: number, toIndex: number): void;
export declare function getRowGroupColumns(beans: BeanCollection): Column[];
export declare function setPivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void;
/** @deprecated v31.1 */
export declare function removePivotColumn(beans: BeanCollection, colKey: string | ColDef | Column): void;
export declare function removePivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void;
/** @deprecated v31.1 */
export declare function addPivotColumn(beans: BeanCollection, colKey: string | ColDef | Column): void;
export declare function addPivotColumns(beans: BeanCollection, colKeys: (string | ColDef | Column)[]): void;
export declare function getPivotColumns(beans: BeanCollection): Column[];
export declare function setPivotResultColumns(beans: BeanCollection, colDefs: (ColDef | ColGroupDef)[] | null): void;
export declare function getPivotResultColumns(beans: BeanCollection): Column[] | null;
