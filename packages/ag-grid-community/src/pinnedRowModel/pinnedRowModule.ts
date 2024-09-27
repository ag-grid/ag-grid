import type { _PinnedRowGridApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
import { getPinnedBottomRow, getPinnedBottomRowCount, getPinnedTopRow, getPinnedTopRowCount } from './pinnedRowApi';
import { PinnedRowModel } from './pinnedRowModel';

export const PinnedRowCoreModule = defineCommunityModule('@ag-grid-community/pinned-row-core', {
    beans: [PinnedRowModel],
});

export const PinnedRowApiModule = defineCommunityModule<_PinnedRowGridApi>('@ag-grid-community/pinned-row-api', {
    apiFunctions: {
        getPinnedTopRowCount,
        getPinnedBottomRowCount,
        getPinnedTopRow,
        getPinnedBottomRow,
    },
    dependsOn: [PinnedRowCoreModule],
});

export const PinnedRowModule = defineCommunityModule('@ag-grid-community/pinned-row', {
    dependsOn: [PinnedRowApiModule],
});
