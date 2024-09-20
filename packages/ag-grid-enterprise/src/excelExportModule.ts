import type { _ExcelExportGridApi } from 'ag-grid-community';
import { ModuleNames, _defineModule } from 'ag-grid-community';
import { _CsvExportCoreModule } from 'ag-grid-community';
import { EnterpriseCoreModule } from './main';

import { ExcelCreator } from './excelExport/excelCreator';
import {
    exportDataAsExcel,
    exportMultipleSheetsAsExcel,
    getDataAsExcel,
    getMultipleSheetsAsExcel,
    getSheetDataForExcel,
} from './excelExport/excelExportApi';
import { VERSION } from './version';

export const ExcelExportCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ExcelExportModule}-core`,
    beans: [ExcelCreator],
    dependantModules: [_CsvExportCoreModule, EnterpriseCoreModule],
});

export const ExcelExportApiModule = _defineModule<_ExcelExportGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.ExcelExportModule}-api`,
    apiFunctions: {
        getDataAsExcel,
        exportDataAsExcel,
        getSheetDataForExcel,
        getMultipleSheetsAsExcel,
        exportMultipleSheetsAsExcel,
    },
    dependantModules: [ExcelExportCoreModule],
});

export const ExcelExportModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ExcelExportModule,
    dependantModules: [ExcelExportCoreModule, ExcelExportApiModule],
});
