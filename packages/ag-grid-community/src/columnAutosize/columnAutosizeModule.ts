import type { _ColumnAutosizeApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { AutoWidthModule } from '../rendering/autoWidthModule';
import { autoSizeAllColumns, autoSizeColumn, autoSizeColumns, sizeColumnsToFit } from './columnAutosizeApi';
import { ColumnAutosizeService } from './columnAutosizeService';

export const ColumnAutosizeCoreModule = defineCommunityModule('@ag-grid-community/column-autosize-core', {
    beans: [ColumnAutosizeService],
    dependsOn: [AutoWidthModule],
});

export const ColumnAutosizeApiModule = defineCommunityModule<_ColumnAutosizeApi>(
    '@ag-grid-community/column-autosize-api',
    {
        apiFunctions: {
            sizeColumnsToFit,
            autoSizeColumn,
            autoSizeColumns,
            autoSizeAllColumns,
        },
        dependsOn: [ColumnAutosizeCoreModule],
    }
);

export const ColumnAutosizeModule = defineCommunityModule('@ag-grid-community/column-autosize', {
    dependsOn: [ColumnAutosizeApiModule],
});
