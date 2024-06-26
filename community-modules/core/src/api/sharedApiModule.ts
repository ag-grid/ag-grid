import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { collapseAll, expandAll, onRowHeightChanged } from './csrmSsrmSharedApi';
import type { CsrmSsrmSharedGridApi, SsrmInfiniteSharedGridApi } from './gridApi';
import { getCacheBlockState, setRowCount } from './ssrmInfiniteSharedApi';

// these modules are not used in core, but are shared between multiple other modules

export const CsrmSsrmSharedApiModule = _defineModule<CsrmSsrmSharedGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/csrm-ssrm-shared-api',
    apiFunctions: {
        expandAll,
        collapseAll,
        onRowHeightChanged,
    },
});

export const SsrmInfiniteSharedApiModule = _defineModule<SsrmInfiniteSharedGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/ssrm-infinite-shared-api',
    apiFunctions: {
        setRowCount,
        getCacheBlockState,
    },
});
