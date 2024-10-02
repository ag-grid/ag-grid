import type { _PinnedRowGridApi } from '../api/gridApi';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
import { getPinnedBottomRow, getPinnedBottomRowCount, getPinnedTopRow, getPinnedTopRowCount } from './pinnedRowApi';
import { PinnedRowModel } from './pinnedRowModel';

export const PinnedRowCoreModule: Module = {
    ...baseCommunityModule('PinnedRowCoreModule'),
    beans: [PinnedRowModel],
};

export const PinnedRowApiModule: ModuleWithApi<_PinnedRowGridApi> = {
    ...baseCommunityModule('PinnedRowApiModule'),
    apiFunctions: {
        getPinnedTopRowCount,
        getPinnedBottomRowCount,
        getPinnedTopRow,
        getPinnedBottomRow,
    },
    dependsOn: [PinnedRowCoreModule],
};

export const PinnedRowModule: Module = {
    ...baseCommunityModule('PinnedRowModule'),
    dependsOn: [PinnedRowApiModule],
};
