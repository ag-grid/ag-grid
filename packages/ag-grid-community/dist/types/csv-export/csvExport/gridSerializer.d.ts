import type { BeanCollection, ExportParams, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { GridSerializingSession } from './interfaces';
export declare enum RowType {
    HEADER_GROUPING = 0,
    HEADER = 1,
    BODY = 2
}
export declare class GridSerializer extends BeanStub implements NamedBean {
    beanName: "gridSerializer";
    private visibleColsService;
    private columnModel;
    private columnNameService;
    private rowModel;
    private pinnedRowModel;
    private selectionService;
    private rowNodeSorter;
    private sortController;
    wireBeans(beans: BeanCollection): void;
    serialize<T>(gridSerializingSession: GridSerializingSession<T>, params?: ExportParams<T>): string;
    private processRow;
    private appendContent;
    private prependContent;
    private prepareSession;
    private exportColumnGroups;
    private exportHeaders;
    private processPinnedTopRows;
    private processRows;
    private replicateSortedOrder;
    private processPinnedBottomRows;
    private getColumnsToExport;
    private recursivelyAddHeaderGroups;
    private doAddHeaderHeader;
}
