/**
 * Internal column definition properties for features that are not yet public.
 * These types are used internally but not exported in the public API.
 * @internal
 */
import type { GridApi } from '../api/gridApi';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import type { ColDef, ColumnFunctionCallbackParams } from './colDef';

/** @internal */
export interface GroupRowEditableCallbackParams<TData = any, TValue = any, TContext = any>
    extends ColumnFunctionCallbackParams<TData, TValue, TContext> {}

/** @internal */
export type GroupRowEditableCallback<TData = any, TValue = any, TContext = any> = (
    params: GroupRowEditableCallbackParams<TData, TValue, TContext>
) => boolean;

/** @internal */
export interface GroupRowValueSetterParams<TData = any, TValue = any, TContext = any> {
    /** The value before the change. */
    oldValue: TValue | null | undefined;
    /** The value after the change. */
    newValue: TValue | null | undefined;
    /** Group row that triggered the callback. */
    node: IRowNode<TData>;
    /** Data associated with the group row. Undefined when the row does not own data. */
    data?: TData | null;
    /** The column being edited. */
    column: Column<TValue>;
    /** The column definition being edited. */
    colDef: ColDef<TData, TValue>;
    /** The grid api. */
    api: GridApi<TData>;
    /** Application context as set on `gridOptions.context`. */
    context: TContext;
    /** Source string provided to `rowNode.setDataValue`. */
    eventSource: string | undefined;
    /** Whether the value actually changed. */
    valueChanged: boolean;
    /**
     * The immediate children that contribute to the aggregation.
     *
     * - For leaf groups (groups containing data rows): returns the data rows.
     *   With pivot columns, only rows matching the pivot keys are included.
     * - For non-leaf groups (groups containing other groups): returns the child groups.
     *   Use `setDataValue` on child groups to cascade recursively.
     *
     * **Note:** Only supported with the Client-Side Row Model.
     */
    aggregatedChildren: IRowNode<TData>[];
}

/** @internal */
export type GroupRowValueSetterFunc<TData = any, TValue = any, TContext = any> = (
    params: GroupRowValueSetterParams<TData, TValue, TContext>
) => void | boolean | undefined;

/**
 * Internal extension to ColDef for features not yet public.
 * Use this type internally when accessing internal properties.
 * @internal
 */
export interface ColDefInternal<TData = any, TValue = any> extends ColDef<TData, TValue> {
    /**
     * Works like `editable`, but is evaluated only for group rows. When provided, group rows use this property instead of `editable`.
     * Set to `true` if this column is editable, otherwise `false`. Can also be a function to have different rows editable.
     * @internal
     */
    groupRowEditable?: boolean | GroupRowEditableCallback<TData, TValue>;
    /**
     * Runs after a group row value changes so custom code can push edits down to descendant rows.
     * Fires for every `setDataValue` call when defined, regardless of `groupRowEditable`.
     * Use this to mutate descendants directly; the grid always commits the group row value afterwards.
     * @internal
     */
    groupRowValueSetter?: GroupRowValueSetterFunc<TData, TValue>;
}
