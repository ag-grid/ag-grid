import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';

export type CalculatedColumnHelperList = 'columns' | 'functions' | 'operators';

export interface CalculatedColumnsOptions {
    /**
     * Cell data types shown in the Calculated Column dialog type selector.
     * Values must be built-in cell data types or custom types defined in `dataTypeDefinitions`.
     * @default ['text', 'number', 'date', 'boolean']
     */
    dataTypes?: string[];
    /**
     * Helper buttons shown in the Calculated Column dialog expression editor.
     * @default ['columns', 'functions', 'operators']
     */
    helperLists?: CalculatedColumnHelperList[] | null;
    /**
     * Highlight the calculated column currently being edited by the dialog.
     * @default false
     */
    columnHighlighting?: boolean;
}

export type CalculatedColumnDef<TData = any, TValue = any> = ColDef<TData, TValue> & {
    calculatedExpression: string;
};

export type CalculatedColumnUpdate<TData = any, TValue = any> = Partial<ColDef<TData, TValue>> & {
    colId?: never;
    calculatedExpression?: string;
};

export interface ICalculatedColumnsService extends Bean {
    addCalculatedColumn(colDef: CalculatedColumnDef, source?: 'api' | 'calculatedColumn'): void;
    updateCalculatedColumn(column: ColKey, colDef: CalculatedColumnUpdate, source?: 'api' | 'calculatedColumn'): void;
    removeCalculatedColumn(column: AgColumn | null, source?: 'api' | 'calculatedColumn'): void;
    openCalculatedColumnDialog(column: AgColumn | null, mode: 'add' | 'edit'): void;
    createProjectedColumnDefs(columnDefs: (ColDef | ColGroupDef)[] | undefined): (ColDef | ColGroupDef)[] | undefined;
    orderDynamicColumns(columns: AgColumn[]): void;
    shouldPreserveColumnOrderOnRefresh(): boolean;
    resetDynamicColumnDefs(preserveCreatedColumns?: boolean): boolean;
    restoreDynamicColumnDefs(colIds: string[]): boolean;
    isHighlightedColumn(column: AgColumn | null): boolean;
}
