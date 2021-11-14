import { Column, ColumnModel, GridOptionsWrapper, ProcessCellForExportParams, ProcessGroupHeaderForExportParams, ProcessHeaderForExportParams, ProcessRowGroupForExportParams, RowNode, ValueService } from "../../main";
import { GridSerializer } from "../gridSerializer";
export interface BaseCreatorBeans {
    gridSerializer: GridSerializer;
    gridOptionsWrapper: GridOptionsWrapper;
}
export interface RowAccumulator {
    onColumn(column: Column, index: number, node?: RowNode): void;
}
export interface RowSpanningAccumulator {
    onColumn(header: string, index: number, span: number): void;
}
export interface GridSerializingParams {
    columnModel: ColumnModel;
    valueService: ValueService;
    gridOptionsWrapper: GridOptionsWrapper;
    processCellCallback?: (params: ProcessCellForExportParams) => string;
    processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;
}
export interface CsvSerializingParams extends GridSerializingParams {
    suppressQuotes: boolean;
    columnSeparator: string;
}
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
