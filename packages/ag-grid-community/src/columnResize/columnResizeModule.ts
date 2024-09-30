import type { _ColumnResizeApi } from '../api/gridApi';
import { HorizontalResizeModule } from '../dragAndDrop/dragModule';
import { defineCommunityModule } from '../interfaces/iModule';
import { AutoWidthModule } from '../rendering/autoWidthModule';
import { setColumnWidths } from './columnResizeApi';
import { ColumnResizeService } from './columnResizeService';

export const ColumnResizeCoreModule = defineCommunityModule('ColumnResizeCoreModule', {
    beans: [ColumnResizeService],
    dependsOn: [HorizontalResizeModule, AutoWidthModule],
});

export const ColumnResizeApiModule = defineCommunityModule<_ColumnResizeApi>('ColumnResizeApiModule', {
    apiFunctions: {
        setColumnWidths,
    },
    dependsOn: [ColumnResizeCoreModule],
});

export const ColumnResizeModule = defineCommunityModule('ColumnResizeModule', {
    dependsOn: [ColumnResizeApiModule],
});
