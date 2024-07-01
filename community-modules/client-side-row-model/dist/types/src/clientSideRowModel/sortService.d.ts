import type { BeanCollection, ChangedPath, NamedBean, RowNodeTransaction, SortOption } from '@ag-grid-community/core';
import { BeanStub } from '@ag-grid-community/core';
export declare class SortService extends BeanStub implements NamedBean {
    beanName: "sortService";
    private columnModel;
    private funcColsService;
    private rowNodeSorter;
    private showRowGroupColsService?;
    wireBeans(beans: BeanCollection): void;
    sort(sortOptions: SortOption[], sortActive: boolean, useDeltaSort: boolean, rowNodeTransactions: RowNodeTransaction[] | null | undefined, changedPath: ChangedPath | undefined, sortContainsGroupColumns: boolean): void;
    private calculateDirtyNodes;
    private doDeltaSort;
    private mergeSortedArrays;
    private updateChildIndexes;
    private updateGroupDataForHideOpenParents;
    private pullDownGroupDataForHideOpenParents;
}
