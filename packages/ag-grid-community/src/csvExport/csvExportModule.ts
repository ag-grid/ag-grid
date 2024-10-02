import type { _CsvExportGridApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
import { ModuleNames } from '../modules/moduleNames';
import { CsvCreator } from './csvCreator';
import { exportDataAsCsv, getDataAsCsv } from './csvExportApi';
import { GridSerializer } from './gridSerializer';

export const CsvExportCoreModule: Module = {
    ...baseCommunityModule('CsvExportCoreModule'),
    beans: [CsvCreator, GridSerializer],
};

export const CsvExportApiModule: ModuleWithApi<_CsvExportGridApi> = {
    ...baseCommunityModule('CsvExportApiModule'),
    apiFunctions: {
        getDataAsCsv,
        exportDataAsCsv,
    },
    dependsOn: [CsvExportCoreModule],
};

export const CsvExportModule: Module = {
    ...baseCommunityModule(ModuleNames.CsvExportModule),
    dependsOn: [CsvExportCoreModule, CsvExportApiModule],
};
