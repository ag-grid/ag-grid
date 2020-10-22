import { BeanStub, SortModelItem } from "@ag-grid-community/core";
export declare class SortListener extends BeanStub {
    private sortController;
    private gridOptionsWrapper;
    private columnController;
    private serverSideRowModel;
    private postConstruct;
    extractSortModel(): SortModelItem[];
    private removeMultiColumnPrefixOnColumnIds;
    private replaceAutoGroupColumnWithActualRowGroupColumns;
    private onSortChanged;
    private isSortingWithValueColumn;
    private isSortingWithSecondaryColumn;
    private findChangedColumnsInSort;
}
