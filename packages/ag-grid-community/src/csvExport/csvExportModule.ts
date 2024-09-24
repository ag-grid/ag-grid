import type { _CsvExportGridApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { ModuleNames } from '../modules/moduleNames';
import { VERSION } from '../version';
import { CsvCreator } from './csvCreator';
import { exportDataAsCsv, getDataAsCsv } from './csvExportApi';
import { GridSerializer } from './gridSerializer';

export const CsvExportCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.CsvExportModule}-core`,
    beans: [CsvCreator, GridSerializer],
});

export const CsvExportApiModule = _defineModule<_CsvExportGridApi>({
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
