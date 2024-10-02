import type { _ColumnResizeApi } from '../api/gridApi';
import { HorizontalResizeModule } from '../dragAndDrop/dragModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
import { baseCommunityModule } from '../interfaces/iModule';
import { AutoWidthModule } from '../rendering/autoWidthModule';
import { setColumnWidths } from './columnResizeApi';
import { ColumnResizeService } from './columnResizeService';

export const ColumnResizeCoreModule: Module = {
    ...baseCommunityModule('ColumnResizeCoreModule'),
    beans: [ColumnResizeService],
    dependsOn: [HorizontalResizeModule, AutoWidthModule],
};

export const ColumnResizeApiModule: ModuleWithApi<_ColumnResizeApi> = {
    ...baseCommunityModule('ColumnResizeApiModule'),
    apiFunctions: {
        setColumnWidths,
    },
    dependsOn: [ColumnResizeCoreModule],
};

export const ColumnResizeModule: Module = {
    ...baseCommunityModule('ColumnResizeModule'),
    dependsOn: [ColumnResizeApiModule],
};
