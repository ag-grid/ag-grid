import type { _ColumnAutosizeApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { autoSizeAllColumns, autoSizeColumns, sizeColumnsToFit } from './columnAutosizeApi';
import { ColumnAutosizeService } from './columnAutosizeService';

export const ColumnAutosizeCoreModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/column-autosize-core',
    beans: [ColumnAutosizeService],
});

export const ColumnAutosizeApiModule = _defineModule<_ColumnAutosizeApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/column-autosize-api',
    apiFunctions: {
        sizeColumnsToFit,
        autoSizeColumns,
        autoSizeAllColumns,
    },
    dependantModules: [ColumnAutosizeCoreModule],
});

export const ColumnAutosizeModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/column-autosize',
    dependantModules: [ColumnAutosizeApiModule],
});
