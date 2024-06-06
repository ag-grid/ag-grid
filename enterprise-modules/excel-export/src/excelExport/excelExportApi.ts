import type {
    BeanCollection,
    ExcelExportMultipleSheetParams,
    ExcelExportParams,
    GridApi,
} from '@ag-grid-community/core';
import { ExcelFactoryMode, ModuleNames, ModuleRegistry } from '@ag-grid-community/core';

function assertNotExcelMultiSheet(beans: BeanCollection, method: keyof GridApi): boolean {
    if (!ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.' + method, beans.context.getGridId())) {
        return false;
    }
    if (beans.excelCreator!.getFactoryMode() === ExcelFactoryMode.MULTI_SHEET) {
        console.warn(
            "AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling 'api.getMultipleSheetAsExcel()' or 'api.exportMultipleSheetsAsExcel()'"
        );
        return false;
    }
    return true;
}

export function getDataAsExcel(beans: BeanCollection, params?: ExcelExportParams): string | Blob | undefined {
    if (assertNotExcelMultiSheet(beans, 'getDataAsExcel')) {
        return beans.excelCreator!.getDataAsExcel(params);
    }
}

export function exportDataAsExcel(beans: BeanCollection, params?: ExcelExportParams): void {
    if (assertNotExcelMultiSheet(beans, 'exportDataAsExcel')) {
        beans.excelCreator!.exportDataAsExcel(params);
    }
}
export function getSheetDataForExcel(beans: BeanCollection, params?: ExcelExportParams): string | undefined {
    if (
        !ModuleRegistry.__assertRegistered(
            ModuleNames.ExcelExportModule,
            'api.getSheetDataForExcel',
            beans.context.getGridId()
        )
    ) {
        return;
    }
    beans.excelCreator!.setFactoryMode(ExcelFactoryMode.MULTI_SHEET);

    return beans.excelCreator!.getSheetDataForExcel(params);
}

export function getMultipleSheetsAsExcel(
    beans: BeanCollection,
    params: ExcelExportMultipleSheetParams
): Blob | undefined {
    if (
        ModuleRegistry.__assertRegistered(
            ModuleNames.ExcelExportModule,
            'api.getMultipleSheetsAsExcel',
            beans.context.getGridId()
        )
    ) {
        return beans.excelCreator!.getMultipleSheetsAsExcel(params);
    }
}

export function exportMultipleSheetsAsExcel(beans: BeanCollection, params: ExcelExportMultipleSheetParams): void {
    if (
        ModuleRegistry.__assertRegistered(
            ModuleNames.ExcelExportModule,
            'api.exportMultipleSheetsAsExcel',
            beans.context.getGridId()
        )
    ) {
        beans.excelCreator!.exportMultipleSheetsAsExcel(params);
    }
}
