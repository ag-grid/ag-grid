import type { _ColumnResizeApi } from '../api/gridApi';
import { HorizontalResizeModule } from '../dragAndDrop/dragModule';
import { defineCommunityModule } from '../interfaces/iModule';
import { AutoWidthModule } from '../rendering/autoWidthModule';
import { setColumnWidth, setColumnWidths } from './columnResizeApi';
import { ColumnResizeService } from './columnResizeService';

export const ColumnResizeCoreModule = defineCommunityModule('@ag-grid-community/column-resize-core', {
    beans: [ColumnResizeService],
    dependsOn: [HorizontalResizeModule, AutoWidthModule],
});

export const ColumnResizeApiModule = defineCommunityModule<_ColumnResizeApi>('@ag-grid-community/column-resize-api', {
    apiFunctions: {
        setColumnWidth,
        setColumnWidths,
    },
    dependsOn: [ColumnResizeCoreModule],
});

export const ColumnResizeModule = defineCommunityModule('@ag-grid-community/column-resize', {
    dependsOn: [ColumnResizeApiModule],
});
