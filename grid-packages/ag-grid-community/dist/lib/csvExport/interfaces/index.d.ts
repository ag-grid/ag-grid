import { Column, ColumnGroup, ColumnModel, GridOptionsService, ProcessCellForExportParams, ProcessGroupHeaderForExportParams, ProcessHeaderForExportParams, ProcessRowGroupForExportParams, RowNode, ValueFormatterService, ValueService, ValueParserService } from "../../main";
import { GridSerializer } from "../gridSerializer";
export interface BaseCreatorBeans {
    gridSerializer: GridSerializer;
    gridOptionsService: GridOptionsService;
}
export interface RowAccumulator {
    onColumn(column: Column, index: number, node?: RowNode): void;
}
export interface RowSpanningAccumulator {
    onColumn(columnGroup: ColumnGroup, header: string, index: number, span: number, collapsibleGroupRanges: number[][]): void;
}
export interface GridSerializingParams {
    columnModel: ColumnModel;
    valueService: ValueService;
    gridOptionsService: GridOptionsService;
    valueFormatterService: ValueFormatterService;
    valueParserService: ValueParserService;
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
    onNewBodyRow(node?: RowNode): RowAccumulator;
    addCustomContent(customContent: T): void;
    /**
     * FINAL RESULT
     */
    parse(): string;
}
