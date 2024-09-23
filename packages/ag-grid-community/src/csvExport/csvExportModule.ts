import { CsvCreator } from './csvCreator';
import { exportDataAsCsv, getDataAsCsv } from './csvExportApi';
import { GridSerializer } from './gridSerializer';
import { VERSION } from '../version';
import { _defineModule } from '../interfaces/iModule';
import { ModuleNames } from '../modules/moduleNames';
import type { _CsvExportGridApi } from '../api/gridApi';

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
