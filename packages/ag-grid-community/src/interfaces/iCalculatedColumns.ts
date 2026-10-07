import type { ColumnTreeBuild } from '../columns/buildColumnTree';
import type { ColumnState } from '../columns/columnStateUtils';
import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { Column } from './iColumn';
import type { AgGridCommon } from './iCommon';
import type { HeaderPosition } from './iHeaderPosition';

export type CalculatedColumnExpressionPicker = 'columns' | 'functions' | 'operators';

type CalculatedColumnApplyMode = 'live' | 'deferred';

export interface IsColumnReferenceableParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** The candidate source column. */
    column: Column;
    /** The candidate source column's definition. */
    colDef: ColDef<TData>;
    /** The column being edited, or `null` when adding a column in either apply mode. */
    calculatedColumn: Column | null;
}

export interface CalculatedColumnValidationParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** A copy of the draft definition, with the expression using stored `[colId]` references. */
    colDef: CalculatedColumnDef<TData>;
    /** The expression displayed in the dialog, using column header references. */
    displayExpression: string;
    /** Unique columns directly referenced by the expression, including hidden columns. */
    referencedColumns: readonly Column[];
    /** The calculated column, or `null` when adding a column in deferred mode. */
    column: Column | null;
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
     */
    isColumnReferenceable?: (params: IsColumnReferenceableParams<TData, TContext>) => boolean;
    /**
     * Additional synchronous validation for expressions entered in the dialog, after built-in checks pass.
     * Return error messages to reject the expression, or `null` / an empty array to accept it.
     * Deferred mode blocks Apply; live mode saves rejected expressions with an error and prevents evaluation.
     * Unlike `isColumnReferenceable`, unchanged expressions are revalidated on title/type edits and deferred Apply.
     * In live mode, a title/type edit can therefore block a previously accepted expression.
     * Not called during cell evaluation, for programmatic definitions, or when restoring state.
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
}

export type CalculatedColumnsGridOption<TData = any, TContext = any> =
    boolean | CalculatedColumnsOptions<TData, TContext>;

/** Grid-managed validation state for a `calculatedExpression`, saved on the column definition. */
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
