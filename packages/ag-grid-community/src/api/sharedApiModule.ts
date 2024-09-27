import { defineCommunityModule } from '../interfaces/iModule';
import { collapseAll, expandAll, onRowHeightChanged } from './csrmSsrmSharedApi';
import type { _CsrmSsrmSharedGridApi, _SsrmInfiniteSharedGridApi } from './gridApi';
import { getCacheBlockState, isLastRowIndexKnown, setRowCount } from './ssrmInfiniteSharedApi';

// these modules are not used in core, but are shared between multiple other modules

export const CsrmSsrmSharedApiModule = defineCommunityModule<_CsrmSsrmSharedGridApi>('CsrmSsrmSharedApiModule', {
    apiFunctions: {
        expandAll,
        collapseAll,
        onRowHeightChanged,
    },
});

export const SsrmInfiniteSharedApiModule = defineCommunityModule<_SsrmInfiniteSharedGridApi>(
    'SsrmInfiniteSharedApiModule',
    {
        apiFunctions: {
            setRowCount,
            getCacheBlockState,
            isLastRowIndexKnown,
        },
    }
);
