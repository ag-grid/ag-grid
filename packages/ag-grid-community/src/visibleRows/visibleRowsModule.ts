import type { _VisibleRowsGridApi } from '../api/gridApi';
import type { _ModuleWithApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { subscribeToVisibleRows } from './visibleRowsApi';
import { VisibleRowsService } from './visibleRowsService';

/**
 * @feature API -> Visible Rows
 */
export const VisibleRowsModule: _ModuleWithApi<_VisibleRowsGridApi<any>> = {
    moduleName: 'VisibleRows',
    version: VERSION,
    beans: [VisibleRowsService],
    apiFunctions: {
        subscribeToVisibleRows,
    },
};
