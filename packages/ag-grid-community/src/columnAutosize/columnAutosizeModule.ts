import type { _ColumnAutosizeApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { AutoWidthModule } from '../rendering/autoWidthModule';
import { autoSizeAllColumns, autoSizeColumns, sizeColumnsToFit } from './columnAutosizeApi';
import { ColumnAutosizeService } from './columnAutosizeService';

export const ColumnAutosizeCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnAutosizeCoreModule'),
    beans: [ColumnAutosizeService],
    dependsOn: [AutoWidthModule],
};

export const ColumnAutosizeApiModule: _ModuleWithApi<_ColumnAutosizeApi> = {
    ...baseCommunityModule('ColumnAutosizeApiModule'),
    apiFunctions: {
        sizeColumnsToFit,
        autoSizeColumns,
        autoSizeAllColumns,
    },
    dependsOn: [ColumnAutosizeCoreModule],
};

export const ColumnAutosizeModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnAutosizeModule'),
    dependsOn: [ColumnAutosizeApiModule],
};
