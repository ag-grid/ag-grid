import type { AgColumn } from '../entities/agColumn';

export interface IShowRowGroupColsService {
    readonly showRowGroupCols: AgColumn[];

    /** Refreshes showRowGroupCols, returns true if the set of columns has changed */
    refresh(): boolean;

    getShowRowGroupCol(id: string): AgColumn | undefined;

    getSourceColumnsForGroupColumn(groupCol: AgColumn): AgColumn[] | null;

    isRowGroupDisplayed(column: AgColumn, colId: string): boolean;
}
