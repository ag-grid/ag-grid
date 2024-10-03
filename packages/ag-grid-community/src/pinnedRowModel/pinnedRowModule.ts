import type { _PinnedRowGridApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { getPinnedBottomRow, getPinnedBottomRowCount, getPinnedTopRow, getPinnedTopRowCount } from './pinnedRowApi';
import { PinnedRowModel } from './pinnedRowModel';

export const PinnedRowCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('PinnedRowCoreModule'),
    beans: [PinnedRowModel],
};

export const PinnedRowApiModule: _ModuleWithApi<_PinnedRowGridApi> = {
    ...baseCommunityModule('PinnedRowApiModule'),
    apiFunctions: {
        getPinnedTopRowCount,
        getPinnedBottomRowCount,
        getPinnedTopRow,
        getPinnedBottomRow,
    },
    dependsOn: [PinnedRowCoreModule],
};

export const PinnedRowModule: _ModuleWithoutApi = {
    ...baseCommunityModule('PinnedRowModule'),
    dependsOn: [PinnedRowApiModule],
};
