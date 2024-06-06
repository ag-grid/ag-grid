import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { _CsvExportCoreModule } from '@ag-grid-community/csv-export';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { ExcelCreator } from './excelExport/excelCreator';
import {
    exportDataAsExcel,
    exportMultipleSheetsAsExcel,
    getDataAsExcel,
    getMultipleSheetsAsExcel,
    getSheetDataForExcel,
} from './excelExport/excelExportApi';
import { VERSION } from './version';

export const _ExcelExportCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/excel-export-core',
    beans: [ExcelCreator],
    dependantModules: [_CsvExportCoreModule, EnterpriseCoreModule],
};

export const _ExcelExportApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/excel-export-api',
    apiFunctions: {
        getDataAsExcel,
        exportDataAsExcel,
        getSheetDataForExcel,
        getMultipleSheetsAsExcel,
        exportMultipleSheetsAsExcel,
    },
    dependantModules: [_ExcelExportCoreModule],
};

export const ExcelExportModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ExcelExportModule,
    dependantModules: [_ExcelExportCoreModule, _ExcelExportApiModule],
};
