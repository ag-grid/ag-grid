// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowAccumulator, BaseGridSerializingSession, RowSpanningAccumulator, GridSerializingSession } from "./gridSerializer";
import { Column } from "./entities/column";
import { ColumnController } from "./columnController/columnController";
import { ValueService } from "./valueService/valueService";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { CsvExportParams, ExportParams, ProcessCellForExportParams, ProcessHeaderForExportParams } from "./exportParams";
export declare class CsvSerializingSession extends BaseGridSerializingSession<string> {
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
export declare abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> {
    private downloader;
    private gridSerializer;
    gridOptionsWrapper: GridOptionsWrapper;
    export(userParams?: P): string;
    getData(params: P): string;
    private getMergedParamsAndData(userParams);
    private mergeDefaultParams(userParams);
    abstract createSerializingSession(params?: P): S;
    abstract getMimeType(): string;
    abstract getDefaultFileName(): string;
    abstract getDefaultFileExtension(): string;
}
export declare class CsvCreator extends BaseCreator<string, CsvSerializingSession, CsvExportParams> {
    private columnController;
    private valueService;
    exportDataAsCsv(params?: CsvExportParams): string;
    getDataAsCsv(params?: CsvExportParams): string;
    getMimeType(): string;
    getDefaultFileName(): string;
    getDefaultFileExtension(): string;
    createSerializingSession(params?: CsvExportParams): CsvSerializingSession;
}
