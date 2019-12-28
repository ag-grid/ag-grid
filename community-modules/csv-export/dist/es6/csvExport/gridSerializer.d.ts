import { Column, ColumnController, ColumnGroupChild, ExportParams, GridOptionsWrapper, ProcessCellForExportParams, ProcessGroupHeaderForExportParams, ProcessRowGroupForExportParams, ProcessHeaderForExportParams, RowNode, ValueService } from "@ag-grid-community/core";
/**
 * This interface works in conjunction with the GridSerializer. When serializing a grid, an instance that implements this interface
 * must be passed in, the serializer will call back to the provided methods and finally call to parse to obtain the final result
 * of the serialization.
 */
export interface GridSerializingSession<T> {
    prepare(columnsToExport: Column[]): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(): RowAccumulator;
    addCustomContent(customContent: T): void;
    /**
     * FINAL RESULT
     */
    parse(): string;
}
export interface RowAccumulator {
    onColumn(column: Column, index: number, node?: RowNode): void;
}
export interface RowSpanningAccumulator {
    onColumn(header: string, index: number, span: number): void;
}
export interface GridSerializingParams {
    columnController: ColumnController;
    valueService: ValueService;
    gridOptionsWrapper: GridOptionsWrapper;
    processCellCallback?: (params: ProcessCellForExportParams) => string;
    processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;
}
export declare abstract class BaseGridSerializingSession<T> implements GridSerializingSession<T> {
    columnController: ColumnController;
    valueService: ValueService;
    gridOptionsWrapper: GridOptionsWrapper;
    processCellCallback?: (params: ProcessCellForExportParams) => string;
    processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;
    private firstGroupColumn?;
    constructor(config: GridSerializingParams);
    prepare(columnsToExport: Column[]): void;
    abstract addCustomContent(customContent: T): void;
    abstract onNewHeaderGroupingRow(): RowSpanningAccumulator;
    abstract onNewHeaderRow(): RowAccumulator;
    abstract onNewBodyRow(): RowAccumulator;
    abstract parse(): string;
    extractHeaderValue(column: Column): string;
    extractRowCellValue(column: Column, index: number, type: string, node: RowNode): any;
    private getHeaderName;
    private createValueForGroupNode;
    private processCell;
}
export declare class GridSerializer {
    private displayedGroupCreator;
    private columnController;
    private rowModel;
    private pinnedRowModel;
    private selectionController;
    private columnFactory;
    private gridOptionsWrapper;
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
