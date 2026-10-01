import type { ColumnTreeBuild } from '../columns/buildColumnTree';
import type { ColumnState } from '../columns/columnStateUtils';
import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { AgGridCommon } from './iCommon';
import type { HeaderPosition } from './iHeaderPosition';

export type CalculatedColumnExpressionPicker = 'columns' | 'functions' | 'operators';

type CalculatedColumnApplyMode = 'live' | 'deferred';

export interface CalculatedColumnProcessColDefParams<TData = any, TContext = any> extends AgGridCommon<
    TData,
    TContext
> {
    /**
     * The column's own definition: the properties set in the Calculated Column dialog, before `defaultColDef`
     * and column types are merged in. A fresh copy is passed on every call.
     */
    colDef: ColDef<TData>;
}

export interface CalculatedColumnsOptions<TData = any> {
    /**
     * Cell data types shown in the Calculated Column dialog type selector.
     * Values must be built-in cell data types or custom types defined in `dataTypeDefinitions`.
     * @default ['text', 'number', 'date', 'boolean']
     */
    dataTypes?: string[];
    /**
     * Expression pickers shown in the Calculated Column dialog expression editor.
     * @default ['columns', 'functions', 'operators']
     */
    expressionPickers?: CalculatedColumnExpressionPicker[] | null;
    /**
     * Suppress highlighting the calculated column currently being edited by the dialog.
     * @default false
     */
    suppressColumnHighlighting?: boolean;
    /**
     * When Calculated Column dialog edits are applied: `'live'` applies every change immediately;
     * `'deferred'` validates the expression and applies changes via Apply and Cancel buttons.
     * @default 'live'
     */
    applyMode?: CalculatedColumnApplyMode;
    /**
     * Customise the Column Definition of calculated columns created in the Calculated Column dialog, for example
     * to add a filter, enable aggregation or set a value formatter. Not called for calculated columns defined in
     * `columnDefs`.
     *
     * Called every time the column is built. Return the full Column Definition to use; returning `params.colDef`
     * or `undefined` leaves the column unchanged. The returned definition takes precedence over `defaultColDef`
     * and column types. `editable`, `suppressPaste`, `field`, `valueGetter`, `valueSetter`, `cellEditor` and
     * `cellEditorSelector` are always overridden for calculated columns.
     *
     * The returned definition is not shown in the dialog and is not saved in grid state. Stateful properties
     * such as `width`, `sort` and `hide` apply when the column is created; prefer the `initial*` forms.
     * Do not call column APIs from this callback.
     */
    processColDef?: (params: CalculatedColumnProcessColDefParams<TData>) => ColDef<TData> | undefined;
}

export type CalculatedColumnsGridOption<TData = any> = boolean | CalculatedColumnsOptions<TData>;

export type CalculatedColumnDef<TData = any, TValue = any> = ColDef<TData, TValue> & {
    calculatedExpression: string;
};

export type CalculatedColumnUpdate<TData = any, TValue = any> = Partial<ColDef<TData, TValue>> & {
    colId?: never;
    calculatedExpression?: string;
};

export interface ICalculatedColumnsService extends Bean {
    removeCalculatedColumn(column: AgColumn | null | undefined): void;
    openCalculatedColumnDialog(
        column: AgColumn | null | undefined,
        mode: 'add' | 'edit',
        focusDialog?: boolean,
        restoreFocusParams?: {
            eventSource?: HTMLElement;
            headerPosition: HeaderPosition | null;
        }
    ): void;
    /** Build-time dynamic calc-col hook: keep owned AgColumns alive and splice them at anchors (the user-column
     *  layer handles overrides/removals of `columnDefs`-declared cols). */
    contributeTo(build: ColumnTreeBuild): void;
    /** Clear dynamic calc-col state; with `preserveCreatedColumns`, park added cols for `restoreDynamicColumnDefs`, and return whether caller must rebuild. */
    resetDynamicColumnDefs(preserveCreatedColumns?: boolean): boolean;
    /** Adopt restored user-column layer entries describing calc cols; returns whether the caller must rebuild. */
    adoptUserColumns(): boolean;
    /** Re-add parked dynamic cols referenced by `state` and return whether any were restored (caller rebuilds). */
    restoreDynamicColumnDefs(state: ColumnState[]): boolean;
    /** Run a suppressed rebuild after calc-col mutation so column-state ops avoid spurious calc lifecycle events. */
    refreshDynamicColumns(source: ColumnEventType): void;
    isEnabled(): boolean;
    isHighlightedColumn(column: AgColumn | null): boolean;
}
