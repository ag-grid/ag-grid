// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridSerializer, RowAccumulator, BaseGridSerializingSession, RowSpanningAccumulator, GridSerializingSession, GridSerializingParams } from "./gridSerializer";
import { Downloader } from "./downloader";
import { Column } from "../entities/column";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { CsvExportParams, ExportParams } from "./exportParams";
export interface CsvSerializingParams extends GridSerializingParams {
    suppressQuotes: boolean;
    columnSeparator: string;
}
export declare class CsvSerializingSession extends BaseGridSerializingSession<string> {
    private result;
    private lineOpened;
    private suppressQuotes;
    private columnSeparator;
    constructor(config: CsvSerializingParams);
    prepare(columnsToExport: Column[]): void;
    addCustomHeader(customHeader: string): void;
    addCustomFooter(customFooter: string): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    private onNewHeaderGroupingRowColumn;
    onNewHeaderRow(): RowAccumulator;
    private onNewHeaderRowColumn;
    onNewBodyRow(): RowAccumulator;
    private onNewBodyRowColumn;
    private putInQuotes;
    parse(): string;
}
export interface BaseCreatorBeans {
    downloader: Downloader;
    gridSerializer: GridSerializer;
    gridOptionsWrapper: GridOptionsWrapper;
}
export declare abstract class BaseCreator<T, S extends GridSerializingSession<T>, P extends ExportParams<T>> {
    private beans;
    protected setBeans(beans: BaseCreatorBeans): void;
    export(userParams?: P): string;
    getData(params?: P): string;
    private getMergedParamsAndData;
    private mergeDefaultParams;
    protected packageFile(data: string): Blob;
    abstract createSerializingSession(params?: P): S;
    abstract getMimeType(): string;
    abstract getDefaultFileName(): string;
    abstract getDefaultFileExtension(): string;
    abstract isExportSuppressed(): boolean;
}
export declare class CsvCreator extends BaseCreator<string, CsvSerializingSession, CsvExportParams> {
    private columnController;
    private valueService;
    private downloader;
    private gridSerializer;
    gridOptionsWrapper: GridOptionsWrapper;
    postConstruct(): void;
    exportDataAsCsv(params?: CsvExportParams): string;
    getDataAsCsv(params?: CsvExportParams): string;
    getMimeType(): string;
    getDefaultFileName(): string;
    getDefaultFileExtension(): string;
    createSerializingSession(params?: CsvExportParams): CsvSerializingSession;
    isExportSuppressed(): boolean;
}
