import { ChangedPath, Column, RowNode, BeanStub } from "@ag-grid-community/core";
export interface SortOption {
    inverter: number;
    column: Column;
}
export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}
export declare class SortService extends BeanStub {
    private sortController;
    private columnController;
    private valueService;
    private gridOptionsWrapper;
    private postSortFunc;
    init(): void;
    sort(sortOptions: SortOption[], sortActive: boolean, deltaSort: boolean, dirtyLeafNodes: {
        [nodeId: string]: boolean;
    }, changedPath: ChangedPath, noAggregations: boolean): void;
    private doFullSort;
    private mapNodeToSortedNode;
    private doDeltaSort;
    private mergeSortedArrays;
    private compareRowNodes;
    private getValue;
    private updateChildIndexes;
    private updateGroupDataForHiddenOpenParents;
    private pullDownGroupDataForHideOpenParents;
}
