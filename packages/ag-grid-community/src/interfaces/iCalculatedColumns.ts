import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';

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
    resetDynamicColumnDefs(): void;
}
