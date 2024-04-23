import { Column, ColumnModel, GridOptionsService, ProcessCellForExportParams, ProcessGroupHeaderForExportParams, ProcessHeaderForExportParams, ProcessRowGroupForExportParams, RowNode, ValueService } from "@ag-grid-community/core";
import { GridSerializingParams, GridSerializingSession, RowAccumulator, RowSpanningAccumulator } from "../interfaces";
export declare abstract class BaseGridSerializingSession<T> implements GridSerializingSession<T> {
    columnModel: ColumnModel;
    valueService: ValueService;
    gos: GridOptionsService;
    processCellCallback?: (params: ProcessCellForExportParams) => string;
    processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;
    private groupColumns;
    constructor(config: GridSerializingParams);
    abstract addCustomContent(customContent: T): void;
    abstract onNewHeaderGroupingRow(): RowSpanningAccumulator;
    abstract onNewHeaderRow(): RowAccumulator;
    abstract onNewBodyRow(node?: RowNode): RowAccumulator;
    abstract parse(): string;
    prepare(columnsToExport: Column[]): void;
    extractHeaderValue(column: Column): string;
    extractRowCellValue(column: Column, index: number, accumulatedRowIndex: number, type: string, node: RowNode): {
        value: any;
        valueFormatted?: string | null;
    };
    private shouldRenderGroupSummaryCell;
    private getHeaderName;
    private createValueForGroupNode;
    private processCell;
}
