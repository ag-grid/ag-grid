import { BeanStub, ExportParams } from "../main";
import { GridSerializingSession } from "./interfaces";
export declare enum RowType {
    HEADER_GROUPING = 0,
    HEADER = 1,
    BODY = 2
}
export declare class GridSerializer extends BeanStub {
    private displayedGroupCreator;
    private columnModel;
    private rowModel;
    private pinnedRowModel;
    private selectionService;
    serialize<T>(gridSerializingSession: GridSerializingSession<T>, params?: ExportParams<T>): string;
    private processRow;
    private appendContent;
    private prependContent;
    private prepareSession;
    private exportColumnGroups;
    private exportHeaders;
    private processPinnedTopRows;
    private processRows;
    private processPinnedBottomRows;
    private getColumnsToExport;
    private recursivelyAddHeaderGroups;
    private doAddHeaderHeader;
}
