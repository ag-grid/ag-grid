import type { _ModuleWithApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import type { _CsrmSsrmSharedGridApi, _RowModelSharedApi, _SsrmInfiniteSharedGridApi } from './gridApi';
import { collapseAll, expandAll, onRowHeightChanged, resetRowHeights } from './rowModelSharedApi';
import { getCacheBlockState, isLastRowIndexKnown, setRowCount } from './ssrmInfiniteSharedApi';

// these modules are not used in core, but are shared between multiple other modules

/**
 * @internal
 */
export const CsrmSsrmSharedApiModule: _ModuleWithApi<_CsrmSsrmSharedGridApi> = {
    moduleName: 'CsrmSsrmSharedApi',
    version: VERSION,
    apiFunctions: { expandAll, collapseAll },
};

/**
 * @internal
 */
export const RowModelSharedApiModule: _ModuleWithApi<_RowModelSharedApi> = {
    moduleName: 'RowModelSharedApi',
    version: VERSION,
    apiFunctions: { onRowHeightChanged, resetRowHeights },
};

/**
 * @internal
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
