import { ExcelExportParams, ExcelFactoryMode, GridOptionsService, IExcelCreator, ExcelExportMultipleSheetParams, ExcelRow } from '@ag-grid-community/core';
import { BaseCreator } from "@ag-grid-community/csv-export";
import { ExcelSerializingSession } from './excelSerializingSession';
export declare const getMultipleSheetsAsExcel: (params: ExcelExportMultipleSheetParams) => Blob | undefined;
export declare const exportMultipleSheetsAsExcel: (params: ExcelExportMultipleSheetParams) => void;
export declare class ExcelCreator extends BaseCreator<ExcelRow[], ExcelSerializingSession, ExcelExportParams> implements IExcelCreator {
    private columnModel;
    private valueService;
    private stylingService;
    private gridSerializer;
    gridOptionsService: GridOptionsService;
    private valueFormatterService;
    private valueParserService;
    postConstruct(): void;
    protected getMergedParams(params?: ExcelExportParams): ExcelExportParams;
    export(userParams?: ExcelExportParams): string;
    exportDataAsExcel(params?: ExcelExportParams): string;
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
    private packageFile;
}
