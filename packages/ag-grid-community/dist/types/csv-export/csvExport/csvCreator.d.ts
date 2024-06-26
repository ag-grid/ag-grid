import type { BeanCollection, CsvCustomContent, CsvExportParams, ICsvCreator, NamedBean } from 'ag-grid-community';
import { BaseCreator } from './baseCreator';
import { CsvSerializingSession } from './sessions/csvSerializingSession';
export declare class CsvCreator extends BaseCreator<CsvCustomContent, CsvSerializingSession, CsvExportParams> implements NamedBean, ICsvCreator {
    beanName: "csvCreator";
    private columnModel;
    private columnNameService;
    private funcColsService;
    private valueService;
    private gridSerializer;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    protected getMergedParams(params?: CsvExportParams): CsvExportParams;
    protected export(userParams?: CsvExportParams): void;
    exportDataAsCsv(params?: CsvExportParams): void;
    getDataAsCsv(params?: CsvExportParams, skipDefaultParams?: boolean): string;
    getDefaultFileExtension(): string;
    createSerializingSession(params?: CsvExportParams): CsvSerializingSession;
    isExportSuppressed(): boolean;
}
