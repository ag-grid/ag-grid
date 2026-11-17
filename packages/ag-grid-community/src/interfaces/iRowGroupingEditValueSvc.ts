import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { IRowNode } from './iRowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowGroupingEditValueSvc {
    /**
     * Called when `groupRowEditable` is defined on the column.
     * Evaluates the `groupRowEditable` callback and checks whether the distribution
     * strategy suppresses the edit (e.g. `distribution: 'none'`).
     * Returns `true` if editable, `false` otherwise.
     */
    isGroupCellEditable(rowNode: IRowNode, column: AgColumn): boolean;

    /**
     * How a group cell shown through `aggValueGetter` is written. `'setter'`: only the function `groupRowValueSetter`
     * writes it. `'reject'`: a non-function setter is configured, and the built-in distribution cannot reverse the
     * getter, so the data is left unchanged. `undefined`: no group row setter, so the cell's field is written as usual.
     */
    getAggGetterEditMode(rowNode: IRowNode, column: AgColumn): 'setter' | 'reject' | undefined;

    /** Whether the column's function `groupRowValueSetter` is running, so a write to a child group is distribution. */
    isDistributing(column: AgColumn): boolean;

    /**
     * Resolves and executes groupRowValueSetter for a group row edit.
     * Returns `undefined` if no groupRowValueSetter is configured (caller should use normal path).
     * Returns `true` if children were changed, `false` if not.
     */
    setGroupDataValue(
        rowNode: RowNode,
        column: AgColumn,
        newValue: unknown,
        oldValue: unknown,
        eventSource: string | undefined,
        valueChanged: boolean
    ): boolean | undefined;
}
