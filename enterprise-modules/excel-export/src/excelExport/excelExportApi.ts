import type { BeanCollection, ExcelExportMultipleSheetParams, ExcelExportParams } from '@ag-grid-community/core';
import { ExcelFactoryMode } from '@ag-grid-community/core';

function assertNotExcelMultiSheet(beans: BeanCollection): boolean {
    if (beans.excelCreator?.getFactoryMode() === ExcelFactoryMode.MULTI_SHEET) {
        console.warn(
            "AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling 'api.getMultipleSheetAsExcel()' or 'api.exportMultipleSheetsAsExcel()'"
        );
        return false;
    }
    return true;
}

export function getDataAsExcel(beans: BeanCollection, params?: ExcelExportParams): string | Blob | undefined {
    if (assertNotExcelMultiSheet(beans)) {
        return beans.excelCreator?.getDataAsExcel(params);
    }
    return undefined;
}

export function exportDataAsExcel(beans: BeanCollection, params?: ExcelExportParams): void {
    if (assertNotExcelMultiSheet(beans)) {
        beans.excelCreator?.exportDataAsExcel(params);
    }
}
export function getSheetDataForExcel(beans: BeanCollection, params?: ExcelExportParams): string | undefined {
    beans.excelCreator?.setFactoryMode(ExcelFactoryMode.MULTI_SHEET);

    return beans.excelCreator?.getSheetDataForExcel(params);
}

export function getMultipleSheetsAsExcel(
    beans: BeanCollection,
    params: ExcelExportMultipleSheetParams
): Blob | undefined {
    return beans.excelCreator?.getMultipleSheetsAsExcel(params);
}

export function exportMultipleSheetsAsExcel(beans: BeanCollection, params: ExcelExportMultipleSheetParams): void {
    beans.excelCreator?.exportMultipleSheetsAsExcel(params);
}
