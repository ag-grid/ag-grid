import type { _ExcelExportGridApi } from '@ag-grid-community/core';
import { ModuleNames, _defineModule } from '@ag-grid-community/core';
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

export const _ExcelExportCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ExcelExportModule}-core`,
    beans: [ExcelCreator],
    dependantModules: [_CsvExportCoreModule, EnterpriseCoreModule],
});

export const _ExcelExportApiModule = _defineModule<_ExcelExportGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.ExcelExportModule}-api`,
    apiFunctions: {
        getDataAsExcel,
        exportDataAsExcel,
        getSheetDataForExcel,
        getMultipleSheetsAsExcel,
        exportMultipleSheetsAsExcel,
    },
    dependantModules: [_ExcelExportCoreModule],
});

export const ExcelExportModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ExcelExportModule,
    dependantModules: [_ExcelExportCoreModule, _ExcelExportApiModule],
});
