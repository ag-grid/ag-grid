import { defineCommunityModule } from '../interfaces/iModule';
import { collapseAll, expandAll, onRowHeightChanged } from './csrmSsrmSharedApi';
import type { _CsrmSsrmSharedGridApi, _SsrmInfiniteSharedGridApi } from './gridApi';
import { getCacheBlockState, isLastRowIndexKnown, setRowCount } from './ssrmInfiniteSharedApi';

// these modules are not used in core, but are shared between multiple other modules

export const CsrmSsrmSharedApiModule = defineCommunityModule<_CsrmSsrmSharedGridApi>(
    '@ag-grid-community/csrm-ssrm-shared-api',
    {
        apiFunctions: {
            expandAll,
            collapseAll,
            onRowHeightChanged,
        },
    }
);

export const SsrmInfiniteSharedApiModule = defineCommunityModule<_SsrmInfiniteSharedGridApi>(
    '@ag-grid-community/ssrm-infinite-shared-api',
    {
        apiFunctions: {
            setRowCount,
            getCacheBlockState,
            isLastRowIndexKnown,
        },
    }
);
