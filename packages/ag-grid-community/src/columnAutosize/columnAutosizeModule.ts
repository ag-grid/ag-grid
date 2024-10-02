import type { _ColumnAutosizeApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
import { AutoWidthModule } from '../rendering/autoWidthModule';
import { autoSizeAllColumns, autoSizeColumns, sizeColumnsToFit } from './columnAutosizeApi';
import { ColumnAutosizeService } from './columnAutosizeService';

export const ColumnAutosizeCoreModule: Module = {
    ...baseCommunityModule('ColumnAutosizeCoreModule'),
    beans: [ColumnAutosizeService],
    dependsOn: [AutoWidthModule],
};

export const ColumnAutosizeApiModule: ModuleWithApi<_ColumnAutosizeApi> = {
    ...baseCommunityModule('ColumnAutosizeApiModule'),
    apiFunctions: {
        sizeColumnsToFit,
        autoSizeColumns,
        autoSizeAllColumns,
    },
    dependsOn: [ColumnAutosizeCoreModule],
};

export const ColumnAutosizeModule: Module = {
    ...baseCommunityModule('ColumnAutosizeModule'),
    dependsOn: [ColumnAutosizeApiModule],
};
