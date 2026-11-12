import type { _SortGridApi } from '../api/gridApi';
import type { _ModuleWithApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { RowNodeSorter } from './rowNodeSorter';
import { onSortChanged } from './sortApi';
import { SortIndicatorComp } from './sortIndicatorComp';
import { SortService } from './sortService';

/**
 * @feature Rows -> Row Sorting
 * @colDef sortable, sort, sortIndex
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const SortModule: _ModuleWithApi<_SortGridApi> = {
    moduleName: 'Sort',
    version: VERSION,
    beans: [SortService, RowNodeSorter],
    apiFunctions: {
        onSortChanged,
    },
    userComponents: {
        agSortIndicator: SortIndicatorComp,
    },
};
