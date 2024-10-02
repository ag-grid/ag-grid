import type { Module, ModuleWithApi, _ExcelExportGridApi } from 'ag-grid-community';
import { CsvExportCoreModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { ExcelCreator } from './excelCreator';
import {
    exportDataAsExcel,
    exportMultipleSheetsAsExcel,
    getDataAsExcel,
    getMultipleSheetsAsExcel,
    getSheetDataForExcel,
} from './excelExportApi';

export const ExcelExportCoreModule: Module = {
    ...baseEnterpriseModule('ExcelExportCoreModule'),
    beans: [ExcelCreator],
    dependsOn: [CsvExportCoreModule, EnterpriseCoreModule],
};

export const ExcelExportApiModule: ModuleWithApi<_ExcelExportGridApi> = {
    ...baseEnterpriseModule('ExcelExportApiModule'),
    apiFunctions: {
        getDataAsExcel,
        exportDataAsExcel,
        getSheetDataForExcel,
        getMultipleSheetsAsExcel,
        exportMultipleSheetsAsExcel,
    },
    dependsOn: [ExcelExportCoreModule],
};

export const ExcelExportModule: Module = {
    ...baseEnterpriseModule(ModuleNames.ExcelExportModule),
    dependsOn: [ExcelExportCoreModule, ExcelExportApiModule],
};
