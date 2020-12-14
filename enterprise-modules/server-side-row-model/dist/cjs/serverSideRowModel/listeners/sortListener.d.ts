import { BeanStub, SortModelItem } from "@ag-grid-community/core";
export declare class SortListener extends BeanStub {
    private sortController;
    private columnController;
    private serverSideRowModel;
    private listenerUtils;
    private postConstruct;
    extractSortModel(): SortModelItem[];
    private removeMultiColumnPrefixOnColumnIds;
    private replaceAutoGroupColumnWithActualRowGroupColumns;
    private onSortChanged;
    private findChangedColumnsInSort;
}
