import type { _ColumnAutosizeApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { AutoWidthModule } from '../rendering/autoWidthModule';
import { autoSizeAllColumns, autoSizeColumns, sizeColumnsToFit } from './columnAutosizeApi';
import { ColumnAutosizeService } from './columnAutosizeService';

export const ColumnAutosizeCoreModule = defineCommunityModule('ColumnAutosizeCoreModule', {
    beans: [ColumnAutosizeService],
    dependsOn: [AutoWidthModule],
});

export const ColumnAutosizeApiModule = defineCommunityModule<_ColumnAutosizeApi>('ColumnAutosizeApiModule', {
    apiFunctions: {
        sizeColumnsToFit,
        autoSizeColumns,
        autoSizeAllColumns,
    },
    dependsOn: [ColumnAutosizeCoreModule],
});

export const ColumnAutosizeModule = defineCommunityModule('ColumnAutosizeModule', {
    dependsOn: [ColumnAutosizeApiModule],
});
