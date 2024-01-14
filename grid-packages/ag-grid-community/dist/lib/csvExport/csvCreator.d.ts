import { CsvCustomContent, CsvExportParams, GridOptionsService, ICsvCreator, ValueFormatterService, ValueParserService } from "../main";
import { BaseCreator } from "./baseCreator";
import { CsvSerializingSession } from "./sessions/csvSerializingSession";
export declare class CsvCreator extends BaseCreator<CsvCustomContent, CsvSerializingSession, CsvExportParams> implements ICsvCreator {
    private columnModel;
    private valueService;
    private gridSerializer;
    gridOptionsService: GridOptionsService;
    valueFormatterService: ValueFormatterService;
    valueParserService: ValueParserService;
    postConstruct(): void;
    protected getMergedParams(params?: CsvExportParams): CsvExportParams;
    export(userParams?: CsvExportParams): string;
    exportDataAsCsv(params?: CsvExportParams): string;
    getDataAsCsv(params?: CsvExportParams, skipDefaultParams?: boolean): string;
    getDefaultFileExtension(): string;
    createSerializingSession(params?: CsvExportParams): CsvSerializingSession;
    isExportSuppressed(): boolean;
}
