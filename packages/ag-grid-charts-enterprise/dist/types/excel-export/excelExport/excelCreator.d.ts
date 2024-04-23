import { ExcelExportParams, ExcelFactoryMode, GridOptionsService, IExcelCreator, ExcelExportMultipleSheetParams, ExcelRow } from 'ag-grid-community';
import { BaseCreator } from "ag-grid-community";
import { ExcelSerializingSession } from './excelSerializingSession';
export declare const getMultipleSheetsAsExcel: (params: ExcelExportMultipleSheetParams) => Blob | undefined;
export declare const exportMultipleSheetsAsExcel: (params: ExcelExportMultipleSheetParams) => void;
export declare class ExcelCreator extends BaseCreator<ExcelRow[], ExcelSerializingSession, ExcelExportParams> implements IExcelCreator {
    private columnModel;
    private valueService;
    private stylingService;
    private gridSerializer;
    gos: GridOptionsService;
    postConstruct(): void;
    protected getMergedParams(params?: ExcelExportParams): ExcelExportParams;
    protected export(userParams?: ExcelExportParams): void;
    exportDataAsExcel(params?: ExcelExportParams): void;
    getDataAsExcel(params?: ExcelExportParams): Blob | string | undefined;
    setFactoryMode(factoryMode: ExcelFactoryMode): void;
    getFactoryMode(): ExcelFactoryMode;
    getSheetDataForExcel(params: ExcelExportParams): string;
    getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined;
    exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void;
    getDefaultFileExtension(): 'xlsx';
    createSerializingSession(params: ExcelExportParams): ExcelSerializingSession;
    private styleLinker;
    isExportSuppressed(): boolean;
    private packageCompressedFile;
    private packageFile;
}
