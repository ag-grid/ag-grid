import { CsvCustomContent, CsvExportParams, GridOptionsService, ICsvCreator } from "@ag-grid-community/core";
import { BaseCreator } from "./baseCreator";
import { CsvSerializingSession } from "./sessions/csvSerializingSession";
export declare class CsvCreator extends BaseCreator<CsvCustomContent, CsvSerializingSession, CsvExportParams> implements ICsvCreator {
    private columnModel;
    private valueService;
    private gridSerializer;
    gos: GridOptionsService;
    postConstruct(): void;
    protected getMergedParams(params?: CsvExportParams): CsvExportParams;
    protected export(userParams?: CsvExportParams): void;
    exportDataAsCsv(params?: CsvExportParams): void;
    getDataAsCsv(params?: CsvExportParams, skipDefaultParams?: boolean): string;
    getDefaultFileExtension(): string;
    createSerializingSession(params?: CsvExportParams): CsvSerializingSession;
    isExportSuppressed(): boolean;
}
