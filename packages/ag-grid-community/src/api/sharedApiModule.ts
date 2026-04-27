import type { _ModuleWithApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import type { _CsrmSsrmSharedGridApi, _RowModelSharedApi, _SsrmInfiniteSharedGridApi } from './gridApi';
import {
    collapseAll,
    expandAll,
    onRowHeightChanged,
    resetRowGroupExpansion,
    resetRowHeights,
} from './rowModelSharedApi';
import { getCacheBlockState, isLastRowIndexKnown, setRowCount } from './ssrmInfiniteSharedApi';

// these modules are not used in core, but are shared between multiple other modules

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const CsrmSsrmSharedApiModule: _ModuleWithApi<_CsrmSsrmSharedGridApi> = {
    moduleName: 'CsrmSsrmSharedApi',
    version: VERSION,
    apiFunctions: { expandAll, collapseAll, resetRowGroupExpansion },
};

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const RowModelSharedApiModule: _ModuleWithApi<_RowModelSharedApi> = {
    moduleName: 'RowModelSharedApi',
    version: VERSION,
    apiFunctions: { onRowHeightChanged, resetRowHeights },
};

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const SsrmInfiniteSharedApiModule: _ModuleWithApi<_SsrmInfiniteSharedGridApi> = {
    moduleName: 'SsrmInfiniteSharedApi',
    version: VERSION,
    apiFunctions: {
        setRowCount,
        getCacheBlockState,
        isLastRowIndexKnown,
    },
};
