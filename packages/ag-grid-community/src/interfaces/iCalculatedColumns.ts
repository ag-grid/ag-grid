import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';

export type CalculatedColumnExpressionPicker = 'columns' | 'functions' | 'operators';

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
}

export type CalculatedColumnDef<TData = any, TValue = any> = ColDef<TData, TValue> & {
    calculatedExpression: string;
};

export type CalculatedColumnUpdate<TData = any, TValue = any> = Partial<ColDef<TData, TValue>> & {
    colId?: never;
    calculatedExpression?: string;
};

export interface ICalculatedColumnsService extends Bean {
    removeCalculatedColumn(column: AgColumn | null): void;
    openCalculatedColumnDialog(column: AgColumn | null, mode: 'add' | 'edit', focusDialog?: boolean): void;
    createProjectedColumnDefs(columnDefs: (ColDef | ColGroupDef)[] | undefined): (ColDef | ColGroupDef)[] | undefined;
    orderDynamicColumns(columns: AgColumn[]): void;
    shouldPreserveColumnOrderOnRefresh(): boolean;
    resetDynamicColumnDefs(preserveCreatedColumns?: boolean): boolean;
    restoreDynamicColumnDefs(colIds: string[]): boolean;
    refreshProjectedColumns(source: ColumnEventType): void;
    isHighlightedColumn(column: AgColumn | null): boolean;
}
