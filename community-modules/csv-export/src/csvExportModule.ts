import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';

import { CsvCreator } from './csvExport/csvCreator';
import { exportDataAsCsv, getDataAsCsv } from './csvExport/csvExportApi';
import { GridSerializer } from './csvExport/gridSerializer';
import { VERSION } from './version';

export const CsvExportCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/csv-export-core',
    beans: [CsvCreator, GridSerializer],
};

export const CsvExportApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/csv-export-api',
    apiFunctions: {
        getDataAsCsv,
        exportDataAsCsv,
    },
    dependantModules: [CsvExportCoreModule],
};

export const CsvExportModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.CsvExportModule,
    dependantModules: [CsvExportCoreModule, CsvExportApiModule],
};
