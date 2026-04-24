import type { Column } from '../interfaces/iColumn';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { IRowNode } from '../interfaces/iRowNode';
import type { ColDef } from './colDef';

export interface BaseColDefParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** Row node for the given row */
    node: IRowNode<TData> | null;
    /** Data associated with the node */
    data: TData;
    /** Column for this callback */
    column: Column<TValue>;
    /** ColDef provided for this column */
    colDef: ColDef<TData, TValue>;
}

export interface BaseColDefOptionalDataParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<
    TData,
    TContext
> {
    /** Row node for the given row */
    node: IRowNode<TData> | null;
    /** Data associated with the node */
    data: TData | undefined;
    /** Column for this callback */
    column: Column<TValue>;
    /** ColDef provided for this column */
    colDef: ColDef<TData, TValue>;
}

export interface ColumnFunctionCallbackParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<
    TData,
    TContext
> {
    /** Row node for the given row */
    node: IRowNode<TData>;
    /** Data associated with the node. Will be `undefined` for group rows. */
    data: TData | undefined;
    /** Column for this callback */
    column: Column<TValue>;
    /** ColDef provided for this column */
    colDef: ColDef<TData, TValue>;
}

// In the case of parsers, the old and new values are of different types
export interface ChangedValueParams<TData, TValueOld, TValueNew, TContext = any> extends BaseColDefParams<
    TData,
    TValueOld,
    TContext
> {
    /** The value before the change */
    oldValue: TValueOld;
    /** The value after the change */
    newValue: TValueNew;
}
