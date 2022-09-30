import { CsvCustomContent, CsvExportParams, GridOptionsWrapper, ICsvCreator } from "../main";
import { BaseCreator } from "./baseCreator";
import { CsvSerializingSession } from "./sessions/csvSerializingSession";
export declare class CsvCreator extends BaseCreator<CsvCustomContent, CsvSerializingSession, CsvExportParams> implements ICsvCreator {
    private columnModel;
    private valueService;
    private gridSerializer;
    gridOptionsWrapper: GridOptionsWrapper;
    postConstruct(): void;
    protected getMergedParams(params?: CsvExportParams): CsvExportParams;
    export(userParams?: CsvExportParams): string;
    exportDataAsCsv(params?: CsvExportParams): string;
    getDataAsCsv(params?: CsvExportParams): string;
    getDefaultFileName(): string;
    getDefaultFileExtension(): string;
    createSerializingSession(params?: CsvExportParams): CsvSerializingSession;
    isExportSuppressed(): boolean;
}
