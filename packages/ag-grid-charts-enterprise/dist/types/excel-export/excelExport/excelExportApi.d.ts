import type { BeanCollection, ExcelExportMultipleSheetParams, ExcelExportParams } from 'ag-grid-community';
export declare function getDataAsExcel(beans: BeanCollection, params?: ExcelExportParams): string | Blob | undefined;
export declare function exportDataAsExcel(beans: BeanCollection, params?: ExcelExportParams): void;
export declare function getSheetDataForExcel(beans: BeanCollection, params?: ExcelExportParams): string | undefined;
export declare function getMultipleSheetsAsExcel(beans: BeanCollection, params: ExcelExportMultipleSheetParams): Blob | undefined;
export declare function exportMultipleSheetsAsExcel(beans: BeanCollection, params: ExcelExportMultipleSheetParams): void;
