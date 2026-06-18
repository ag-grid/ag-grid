import type { AgColumn } from '../entities/agColumn';
import type { SortDirection } from './iSort';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IShowRowGroupColsService {
    readonly columns: AgColumn[];

    refresh(): void;
    getSourceColumnsForGroupColumn(groupCol: AgColumn): AgColumn[] | null;
    isRowGroupDisplayed(column: AgColumn, colId: string): boolean;
    interleaveSortedColumns(sorted: AgColumn[]): AgColumn[];
    fillCoupledSortIndexMap(sortedCols: AgColumn[], map: Map<AgColumn, number>): number;
    isGroupSortMixed(column: AgColumn, direction: SortDirection): boolean;
}
