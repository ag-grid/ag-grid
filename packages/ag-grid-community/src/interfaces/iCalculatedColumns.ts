import type { Bean } from '../context/bean';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColKey } from '../entities/colDef';

export type CalculatedColumnDef<TData = any, TValue = any> = ColDef<TData, TValue> & {
    calculatedExpression: string;
};

export type CalculatedColumnUpdate<TData = any, TValue = any> = Partial<ColDef<TData, TValue>> & {
    colId?: never;
    calculatedExpression?: string;
};

export interface ICalculatedColumnsService extends Bean {
    addCalculatedColumn(colDef: CalculatedColumnDef): void;
    updateCalculatedColumn(column: ColKey, colDef: CalculatedColumnUpdate): void;
    removeCalculatedColumn(column: AgColumn | null): void;
    showAddCalculatedColumnDialog(column: AgColumn | null): void;
    showUpdateCalculatedColumnDialog(column: AgColumn | null): void;
}
