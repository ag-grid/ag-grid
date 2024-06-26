import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowNode } from '../entities/rowNode';
import type { Column } from '../interfaces/iColumn';
export interface SortOption {
    sort: 'asc' | 'desc';
    column: Column;
}
export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}
export declare class RowNodeSorter extends BeanStub implements NamedBean {
    beanName: "rowNodeSorter";
    private valueService;
    private columnModel;
    private showRowGroupColsService?;
    wireBeans(beans: BeanCollection): void;
    private isAccentedSort;
    private primaryColumnsSortGroups;
    postConstruct(): void;
    doFullSort(rowNodes: RowNode[], sortOptions: SortOption[]): RowNode[];
    compareRowNodes(sortOptions: SortOption[], sortedNodeA: SortedRowNode, sortedNodeB: SortedRowNode): number;
    private getComparator;
    private getValue;
}
