import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { BeanStub } from "../context/beanStub";
export interface SortOption {
    sort: 'asc' | 'desc';
    column: Column;
}
export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}
export declare class RowNodeSorter extends BeanStub {
    private valueService;
    private columnModel;
    private isAccentedSort;
    private primaryColumnsSortGroups;
    init(): void;
    doFullSort(rowNodes: RowNode[], sortOptions: SortOption[]): RowNode[];
    compareRowNodes(sortOptions: SortOption[], sortedNodeA: SortedRowNode, sortedNodeB: SortedRowNode): number;
    private getComparator;
    private getValue;
}
