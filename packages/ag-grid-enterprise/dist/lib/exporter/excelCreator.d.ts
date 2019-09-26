// ag-grid-enterprise v21.2.2
import { BaseCreator, ExcelExportParams, GridOptionsWrapper, IExcelCreator, ZipContainer } from 'ag-grid-community';
import { ExcelCell, ExcelStyle } from 'ag-grid-community';
import { ExcelXmlSerializingSession } from './excelXmlSerializingSession';
import { ExcelXlsxSerializingSession } from './excelXlsxSerializingSession';
export interface ExcelMixedStyle {
    key: string;
    excelID: string;
    result: ExcelStyle;
}
declare type SerializingSession = ExcelXmlSerializingSession | ExcelXlsxSerializingSession;
export declare class ExcelCreator extends BaseCreator<ExcelCell[][], SerializingSession, ExcelExportParams> implements IExcelCreator {
    private excelXmlFactory;
    private xlsxFactory;
    private columnController;
    private valueService;
    private gridOptions;
    private stylingService;
    private downloader;
    private gridSerializer;
    gridOptionsWrapper: GridOptionsWrapper;
    zipContainer: ZipContainer;
    private exportMode;
    postConstruct(): void;
    exportDataAsExcel(params?: ExcelExportParams): string;
    getDataAsExcelXml(params?: ExcelExportParams): string;
    getMimeType(): string;
    getDefaultFileName(): string;
    getDefaultFileExtension(): string;
    createSerializingSession(params: ExcelExportParams): SerializingSession;
    private styleLinker;
    isExportSuppressed(): boolean;
    private setExportMode;
    private getExportMode;
    protected packageFile(data: string): Blob;
}
export {};
