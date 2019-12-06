import { CsvExportParams, ExportParams, GridOptionsWrapper, ICsvCreator, CsvCustomContent } from "@ag-grid-community/core";
import { BaseGridSerializingSession, GridSerializer, GridSerializingParams, GridSerializingSession, RowAccumulator, RowSpanningAccumulator } from "./gridSerializer";
import { Downloader } from "./downloader";
export interface CsvSerializingParams extends GridSerializingParams {
    suppressQuotes: boolean;
    columnSeparator: string;
}
export declare class CsvSerializingSession extends BaseGridSerializingSession<CsvCustomContent> {
    private isFirstLine;
    private result;
    private suppressQuotes;
    private columnSeparator;
    constructor(config: CsvSerializingParams);
    addCustomContent(content: CsvCustomContent): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    private onNewHeaderGroupingRowColumn;
    private appendEmptyCells;
    onNewHeaderRow(): RowAccumulator;
    private onNewHeaderRowColumn;
    onNewBodyRow(): RowAccumulator;
    private onNewBodyRowColumn;
    private putInQuotes;
    parse(): string;
    private beginNewLine;
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
export declare class CsvCreator extends BaseCreator<CsvCustomContent, CsvSerializingSession, CsvExportParams> implements ICsvCreator {
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
