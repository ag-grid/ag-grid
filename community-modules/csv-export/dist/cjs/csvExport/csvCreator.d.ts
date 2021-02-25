import { CsvCustomContent, CsvExportParams, GridOptionsWrapper, ICsvCreator } from "@ag-grid-community/core";
import { BaseCreator } from "./baseCreator";
import { CsvSerializingSession } from "./sessions/csvSerializingSession";
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
