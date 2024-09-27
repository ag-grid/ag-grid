import type { _ExcelExportGridApi } from 'ag-grid-community';
import { CsvExportCoreModule, ModuleNames, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { ExcelCreator } from './excelCreator';
import {
    exportDataAsExcel,
    exportMultipleSheetsAsExcel,
    getDataAsExcel,
    getMultipleSheetsAsExcel,
    getSheetDataForExcel,
} from './excelExportApi';

export const ExcelExportCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ExcelExportModule}-core`,
    beans: [ExcelCreator],
    dependantModules: [CsvExportCoreModule, EnterpriseCoreModule],
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
