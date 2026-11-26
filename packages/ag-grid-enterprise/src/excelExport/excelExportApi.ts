import type { BeanCollection, ExcelExportMultipleSheetParams, ExcelExportParams } from 'ag-grid-community';

function assertNotExcelMultiSheet(beans: BeanCollection): boolean {
    if (beans.excelCreator?.getFactoryMode() === 'MULTI_SHEET') {
        beans.log.warn(161);
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

export function exportDataAsExcel(beans: BeanCollection, params?: ExcelExportParams): Promise<void> {
    if (assertNotExcelMultiSheet(beans)) {
        return beans.excelCreator?.exportDataAsExcel(params) ?? Promise.resolve();
    }
    return Promise.resolve();
}
export function getSheetDataForExcel(beans: BeanCollection, params?: ExcelExportParams): string | undefined {
    beans.excelCreator?.setFactoryMode('MULTI_SHEET');

    return beans.excelCreator?.getSheetDataForExcel(params);
}

export function getMultipleSheetsAsExcel(
    beans: BeanCollection,
    params: ExcelExportMultipleSheetParams
): Blob | undefined {
    return beans.excelCreator?.getMultipleSheetsAsExcel(params);
}

export function exportMultipleSheetsAsExcel(
    beans: BeanCollection,
    params: ExcelExportMultipleSheetParams
): Promise<void> {
    return beans.excelCreator?.exportMultipleSheetsAsExcel(params) ?? Promise.resolve();
}
