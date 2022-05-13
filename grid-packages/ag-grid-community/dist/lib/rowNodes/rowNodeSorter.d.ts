import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
export interface SortOption {
    sort: 'asc' | 'desc';
    column: Column;
}
export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}
export declare class RowNodeSorter {
    private gridOptionsWrapper;
    private valueService;
    private columnModel;
    doFullSort(rowNodes: RowNode[], sortOptions: SortOption[]): RowNode[];
    compareRowNodes(sortOptions: SortOption[], sortedNodeA: SortedRowNode, sortedNodeB: SortedRowNode): number;
    private getComparator;
    private getValue;
}
