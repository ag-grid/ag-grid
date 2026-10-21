import type { ColumnTreeBuild } from '../columns/buildColumnTree';
import type { ColumnState } from '../columns/columnStateUtils';
import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColKey } from '../entities/colDef';
import type { CalculatedColumnExpressionValidation, ColumnEventType } from '../events';
import type { Column } from './iColumn';
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
    /**
     * The column the calculated column was added from, i.e. the one its menu was opened on. `null` when it was added
     * from no column, or when that column is gone. A column restored from Grid State is not tied to the column it was
     * added from: it gets the last column of its group, or `null` if it is not in a group.
     */
    sourceColumn: Column | null;
    /**
     * Validation of `colDef.calculatedExpression`, including syntax, direct column references and saved dialog
     * rejections from `getValidationErrors` or `isColumnReferenceable`. Does not rerun application callbacks or
     * check row-specific evaluation errors. In `'live'` apply mode, the expression may be incomplete.
     */
    expressionValidation: CalculatedColumnExpressionValidation;
}

export interface IsColumnReferenceableParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** The candidate source column. */
    column: Column;
    /** The candidate source column's definition. */
    colDef: ColDef<TData>;
    /** The column being edited, including a newly created column in live mode. `null` when adding in deferred mode. */
    calculatedColumn: Column | null;
    /**
     * The column whose menu initiated Add Calculated Column. Only provided while adding a column, in either apply
     * mode. `null` when editing an existing column or when there is no source column.
     */
    sourceColumn: Column | null;
}

export interface CalculatedColumnValidationParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** A copy of the draft definition, with recognised references converted to stored `[colId]` references. */
    colDef: CalculatedColumnDef<TData>;
    /** The expression displayed in the dialog, using column header references. */
    displayExpression: string;
    /**
     * Unique columns directly referenced by the expression, including hidden columns.
     * For invalid syntax, includes recognised complete bracket references.
     */
    referencedColumns: readonly Column[];
    /** Built-in validation errors, or `null`. Include these in the callback result to retain built-in validation. */
    internalErrors: string[] | null;
    /** The calculated column, or `null` when adding a column in deferred mode. */
    column: Column | null;
    /**
     * The column whose menu initiated Add Calculated Column. Only provided while adding a column, in either apply
     * mode. `null` when editing an existing column or when there is no source column.
     */
    sourceColumn: Column | null;
}

export interface CalculatedColumnsOptions<TData = any, TContext = any> {
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
     * Return `false` to exclude a source column from the dialog's picker and manually entered references.
     * Called when the dialog opens. Does not restrict programmatic `calculatedExpression` values.
     * Existing expressions can be kept unchanged; expression edits are checked against the restriction.
     * Live edits with restricted references are saved with an error and do not evaluate until corrected.
     * `api.refreshCalculatedColumns()` explicitly rechecks existing expressions against this rule.
     */
    isColumnReferenceable?: (params: IsColumnReferenceableParams<TData, TContext>) => boolean;
    /**
     * Synchronous validation for expressions entered in the dialog, including expressions with built-in errors.
     * Receives `internalErrors`; the returned messages replace built-in validation feedback.
     * Column restrictions from `isColumnReferenceable` remain enforced.
     * Return error messages to reject the expression, or `null` / an empty array to accept it.
     * Deferred mode blocks Apply; live mode saves rejected expressions with an error and prevents evaluation.
     * Unlike `isColumnReferenceable`, unchanged expressions are revalidated on title/type edits and deferred Apply.
     * In live mode, a title/type edit can therefore block a previously accepted expression.
     * Not called during cell evaluation, when setting definitions, or when restoring state.
     * Call `api.refreshCalculatedColumns()` to explicitly revalidate committed expressions.
     */
    getValidationErrors?: (params: CalculatedColumnValidationParams<TData, TContext>) => string[] | null;
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
     * Quiet period in milliseconds before live dialog edits update the column and raise change events.
     * Must be a non-negative integer. `0` applies on the next animation frame.
     * Closing the dialog applies any pending edit immediately. Ignored in `'deferred'` apply mode.
     * @default 0
     */
    applyDebounce?: number;
    /**
     * Customise the Column Definition of calculated columns created in the Calculated Column dialog, for example
     * to add a filter, enable aggregation or set a value formatter. Not called for calculated columns defined in
     * `columnDefs`.
     *
     * Called every time the column is built. Return the full Column Definition to use; returning `params.colDef`
     * or `undefined` leaves the column unchanged. The returned definition takes precedence over `defaultColDef`
     * and column types. `colId`, `editable`, `suppressPaste`, `field`, `valueGetter`, `valueSetter`, `cellEditor`
     * and `cellEditorSelector` are always overridden for calculated columns.
     *
     * In `'live'` `applyMode` it is also called while the user types in the dialog, so keep it cheap and use
     * `params.expressionValidation` to check the expression's validation status.
     *
     * The returned definition is not shown in the dialog and is not saved in grid state. Stateful properties
     * such as `width`, `sort` and `hide` apply when the column is created; prefer the `initial*` forms.
     * Replacing this callback rebuilds the columns; replacing only the containing options object does not.
     * Do not call column APIs from this callback.
     */
    processColDef?: (params: CalculatedColumnProcessColDefParams<TData, TContext>) => ColDef<TData> | undefined;
}

export type CalculatedColumnsGridOption<TData = any, TContext = any> =
    boolean | CalculatedColumnsOptions<TData, TContext>;

export interface RefreshCalculatedColumnsParams {
    /** Columns to revalidate. Omit to revalidate all calculated columns. Non-calculated and unknown columns are ignored. */
    columns?: ColKey[];
}

/** Grid-managed validation state for a `calculatedExpression`, persisted in Grid State. */
export type CalculatedExpressionError = {
    /** The `calculatedExpression` value the error applies to; the error is ignored once the expression changes. */
    expression: string;
} & (
    | {
          reason: 'restrictedReference';
          /** The display reference that was blocked. */
          reference: string;
      }
    | {
          reason: 'customValidation';
          /** Application-provided validation messages. */
          messages: string[];
      }
);

/** The `ColDef` properties a user can change on a calculated column. */
export type CalculatedColumnProperty = 'calculatedExpression' | 'cellDataType' | 'columnGroupShow' | 'headerName';

export type CalculatedColumnDef<TData = any, TValue = any> = ColDef<TData, TValue> & {
    calculatedExpression: string;
};

export type CalculatedColumnUpdate<TData = any, TValue = any> = Partial<ColDef<TData, TValue>> & {
    colId?: never;
    calculatedExpression?: string;
};

export interface ICalculatedColumnsService extends Bean {
    refreshCalculatedColumns(params?: RefreshCalculatedColumnsParams): void;
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
    getExpressionError(column: AgColumn): CalculatedExpressionError | undefined;
}
