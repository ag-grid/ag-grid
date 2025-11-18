import type { AgColumn } from '../entities/agColumn';

export interface IShowRowGroupColsService {
    readonly columns: AgColumn[];

    refresh(): void;

    getShowRowGroupCol(id: string): AgColumn | undefined;

    getSourceColumnsForGroupColumn(groupCol: AgColumn): AgColumn[] | null;

    isRowGroupDisplayed(column: AgColumn, colId: string): boolean;
}
