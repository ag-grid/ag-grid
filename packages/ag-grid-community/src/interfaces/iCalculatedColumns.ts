import type { ColumnTreeBuild } from '../columns/buildColumnTree';
import type { ColumnState } from '../columns/columnStateUtils';
import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { HeaderPosition } from './iHeaderPosition';

export type CalculatedColumnExpressionPicker = 'columns' | 'functions' | 'operators';

export type CalculatedColumnApplyMode = 'live' | 'deferred';

export interface CalculatedColumnsOptions {
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
}

export type CalculatedColumnsGridOption = boolean | CalculatedColumnsOptions;

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
    /** Build hook for static (user-declared) calc cols: `null` if removed (never build), the replacement
     *  `ColDef` if updated, `undefined` if unchanged. Applied during the build, so removed cols are never materialised. */
    overrideFor(colDef: ColDef): ColDef | null | undefined;
    /** Build-time dynamic calc-col hook: keep owned AgColumns alive and splice them at anchors (`overrideFor` handles static cols). */
    contributeTo(build: ColumnTreeBuild): void;
    /** Clear dynamic calc-col state; with `preserveCreatedColumns`, park added cols for `restoreDynamicColumnDefs`, and return whether caller must rebuild. */
    resetDynamicColumnDefs(preserveCreatedColumns?: boolean): boolean;
    /** Re-add parked dynamic cols referenced by `state` and return whether any were restored (caller rebuilds). */
    restoreDynamicColumnDefs(state: ColumnState[]): boolean;
    /** Run a suppressed rebuild after calc-col mutation so column-state ops avoid spurious calc lifecycle events. */
    refreshDynamicColumns(source: ColumnEventType): void;
    isEnabled(): boolean;
    isHighlightedColumn(column: AgColumn | null): boolean;
}
