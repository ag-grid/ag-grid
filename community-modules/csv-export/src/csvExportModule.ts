import type { CsvExportGridApi } from '@ag-grid-community/core';
import { ModuleNames, _defineModule } from '@ag-grid-community/core';

import { CsvCreator } from './csvExport/csvCreator';
import { exportDataAsCsv, getDataAsCsv } from './csvExport/csvExportApi';
import { GridSerializer } from './csvExport/gridSerializer';
import { VERSION } from './version';

export const CsvExportCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.CsvExportModule}-core`,
    beans: [CsvCreator, GridSerializer],
});

export const CsvExportApiModule = _defineModule<CsvExportGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.CsvExportModule}-api`,
    apiFunctions: {
        getDataAsCsv,
        exportDataAsCsv,
    },
    dependantModules: [CsvExportCoreModule],
});

export const CsvExportModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.CsvExportModule,
    dependantModules: [CsvExportCoreModule, CsvExportApiModule],
});
