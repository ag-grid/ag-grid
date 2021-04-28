import { Column, ColumnController, GridOptionsWrapper, ProcessCellForExportParams, ProcessGroupHeaderForExportParams, ProcessHeaderForExportParams, ProcessRowGroupForExportParams, RowNode, ValueService } from "@ag-grid-community/core";
import { GridSerializingParams, GridSerializingSession, RowAccumulator, RowSpanningAccumulator } from "../interfaces";
export declare abstract class BaseGridSerializingSession<T> implements GridSerializingSession<T> {
    columnController: ColumnController;
    valueService: ValueService;
    gridOptionsWrapper: GridOptionsWrapper;
    processCellCallback?: (params: ProcessCellForExportParams) => string;
    processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;
    private groupColumns;
    constructor(config: GridSerializingParams);
    abstract addCustomContent(customContent: T): void;
    abstract onNewHeaderGroupingRow(): RowSpanningAccumulator;
    abstract onNewHeaderRow(): RowAccumulator;
    abstract onNewBodyRow(): RowAccumulator;
    abstract parse(): string;
    prepare(columnsToExport: Column[]): void;
    extractHeaderValue(column: Column): string;
    extractRowCellValue(column: Column, index: number, accumulatedRowIndex: number, type: string, node: RowNode): any;
    private getHeaderName;
    private createValueForGroupNode;
    private processCell;
}
