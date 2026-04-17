import type { AgColumn } from '../entities/agColumn';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IGroupHierarchyColService {
    columns: AgColumn[];

    createColumns(sourceCols: AgColumn[]): void;

    expandColumnInto(target: AgColumn[], col: AgColumn): void;
    insertVirtualColumnsForCol(columns: AgColumn[], col: AgColumn): AgColumn[];
    compareVirtualColumns(colA: AgColumn, colB: AgColumn): number | null;
}
