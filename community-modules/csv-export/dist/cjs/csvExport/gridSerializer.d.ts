import { BeanStub, ColumnGroupChild, ExportParams, ProcessGroupHeaderForExportParams } from "@ag-grid-community/core";
import { GridSerializingSession } from "./interfaces";
export declare class GridSerializer extends BeanStub {
    private displayedGroupCreator;
    private columnController;
    private rowModel;
    private pinnedRowModel;
    private selectionController;
    serialize<T>(gridSerializingSession: GridSerializingSession<T>, params?: ExportParams<T>): string;
    recursivelyAddHeaderGroups<T>(displayedGroups: ColumnGroupChild[], gridSerializingSession: GridSerializingSession<T>, processGroupHeaderCallback: ProcessGroupHeaderCallback | undefined): void;
    private doAddHeaderHeader;
}
declare type ProcessGroupHeaderCallback = (params: ProcessGroupHeaderForExportParams) => string;
export declare enum RowType {
    HEADER_GROUPING = 0,
    HEADER = 1,
    BODY = 2
}
export {};
