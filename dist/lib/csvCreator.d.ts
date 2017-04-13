// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowAccumulator, BaseGridSerializingSession, RowSpanningAccumulator } from "./gridSerializer";
import { Column } from "./entities/column";
import { ColumnController } from "./columnController/columnController";
import { ValueService } from "./valueService";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { CsvExportParams, ProcessCellForExportParams, ProcessHeaderForExportParams } from "./exportParams";
export declare class CsvSerializingSession extends BaseGridSerializingSession {
    private suppressQuotes;
    private columnSeparator;
    private result;
    private lineOpened;
    constructor(columnController: ColumnController, valueService: ValueService, gridOptionsWrapper: GridOptionsWrapper, processCellCallback: (params: ProcessCellForExportParams) => string, processHeaderCallback: (params: ProcessHeaderForExportParams) => string, suppressQuotes: boolean, columnSeparator: string);
    prepare(columnsToExport: Column[]): void;
    addCustomHeader(customHeader: string): void;
    addCustomFooter(customFooter: string): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    private onNewHeaderGroupingRowColumn(header, index, span);
    onNewHeaderRow(): RowAccumulator;
    private onNewHeaderRowColumn(column, index, node?);
    onNewBodyRow(): RowAccumulator;
    private onNewBodyRowColumn(column, index, node?);
    private putInQuotes(value, suppressQuotes);
    parse(): string;
}
export declare class CsvCreator {
    private downloader;
    private gridSerializer;
    private columnController;
    private valueService;
    private gridOptionsWrapper;
    exportDataAsCsv(params?: CsvExportParams): string;
    getDataAsCsv(params?: CsvExportParams): string;
}
