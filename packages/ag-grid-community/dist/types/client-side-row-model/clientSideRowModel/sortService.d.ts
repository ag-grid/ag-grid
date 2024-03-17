import { SortOption, ChangedPath, BeanStub, RowNodeTransaction } from "ag-grid-community";
export declare class SortService extends BeanStub {
    private columnModel;
    private rowNodeSorter;
    sort(sortOptions: SortOption[], sortActive: boolean, useDeltaSort: boolean, rowNodeTransactions: RowNodeTransaction[] | null | undefined, changedPath: ChangedPath | undefined, sortContainsGroupColumns: boolean): void;
    private calculateDirtyNodes;
    private doDeltaSort;
    private mergeSortedArrays;
    private updateChildIndexes;
    private updateGroupDataForHideOpenParents;
    private pullDownGroupDataForHideOpenParents;
}
