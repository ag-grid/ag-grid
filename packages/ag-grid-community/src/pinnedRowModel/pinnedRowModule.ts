import type { _PinnedRowGridApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { getPinnedBottomRow, getPinnedBottomRowCount, getPinnedTopRow, getPinnedTopRowCount } from './pinnedRowApi';
import { PinnedRowModel } from './pinnedRowModel';

export const PinnedRowCoreModule = defineCommunityModule('PinnedRowCoreModule', {
    beans: [PinnedRowModel],
});

export const PinnedRowApiModule = defineCommunityModule<_PinnedRowGridApi>('PinnedRowApiModule', {
    apiFunctions: {
        getPinnedTopRowCount,
        getPinnedBottomRowCount,
        getPinnedTopRow,
        getPinnedBottomRow,
    },
    dependsOn: [PinnedRowCoreModule],
});

export const PinnedRowModule = defineCommunityModule('PinnedRowModule', {
    dependsOn: [PinnedRowApiModule],
});
