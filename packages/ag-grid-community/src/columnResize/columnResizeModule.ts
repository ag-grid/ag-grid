import type { _ColumnResizeApi } from '../api/gridApi';
import { HorizontalResizeModule } from '../dragAndDrop/dragModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { baseCommunityModule } from '../interfaces/iModule';
import { AutoWidthModule } from '../rendering/autoWidthModule';
import { setColumnWidths } from './columnResizeApi';
import { ColumnResizeService } from './columnResizeService';

export const ColumnResizeCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnResizeCoreModule'),
    beans: [ColumnResizeService],
    dependsOn: [HorizontalResizeModule, AutoWidthModule],
};

export const ColumnResizeApiModule: _ModuleWithApi<_ColumnResizeApi> = {
    ...baseCommunityModule('ColumnResizeApiModule'),
    apiFunctions: {
        setColumnWidths,
    },
    dependsOn: [ColumnResizeCoreModule],
};

export const ColumnResizeModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnResizeModule'),
    dependsOn: [ColumnResizeApiModule],
};
