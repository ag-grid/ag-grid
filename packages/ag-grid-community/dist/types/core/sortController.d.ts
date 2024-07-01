import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { AgColumn } from './entities/agColumn';
import type { SortDirection } from './entities/colDef';
import type { ColumnEventType } from './events';
import type { SortOption } from './rowNodes/rowNodeSorter';
export interface SortModelItem {
    /** Column Id to apply the sort to. */
    colId: string;
    /** Sort direction */
    sort: 'asc' | 'desc';
}
export declare class SortController extends BeanStub implements NamedBean {
    beanName: "sortController";
    private columnModel;
    private funcColsService;
    private showRowGroupColsService?;
    wireBeans(beans: BeanCollection): void;
    progressSort(column: AgColumn, multiSort: boolean, source: ColumnEventType): void;
    setSortForColumn(column: AgColumn, sort: SortDirection, multiSort: boolean, source: ColumnEventType): void;
    private updateSortIndex;
    onSortChanged(source: string, columns?: AgColumn[]): void;
    isSortActive(): boolean;
    dispatchSortChangedEvents(source: string, columns?: AgColumn[]): void;
    private clearSortBarTheseColumns;
    private getNextSortDirection;
    /**
     * @returns a map of sort indexes for every sorted column, if groups sort primaries then they will have equivalent indices
     */
    private getIndexedSortMap;
    getColumnsWithSortingOrdered(): AgColumn[];
    getSortModel(): SortModelItem[];
    getSortOptions(): SortOption[];
    canColumnDisplayMixedSort(column: AgColumn): boolean;
    getDisplaySortForColumn(column: AgColumn): SortDirection | 'mixed' | undefined;
    getDisplaySortIndexForColumn(column: AgColumn): number | null | undefined;
}
