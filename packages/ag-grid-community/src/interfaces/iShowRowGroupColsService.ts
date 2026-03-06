import type { AgColumn } from '../entities/agColumn';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IShowRowGroupColsService {
    readonly columns: AgColumn[];

    refresh(): void;

    getShowRowGroupCol(id: string): AgColumn | undefined;

    getSourceColumnsForGroupColumn(groupCol: AgColumn): AgColumn[] | null;

    isRowGroupDisplayed(column: AgColumn, colId: string): boolean;
}
