import type { _ModuleWithApi, _PinnedRowGridApi } from 'ag-grid-community';

import { VERSION } from '../version';
import {
    getPinnedBottomRow,
    getPinnedBottomRowCount,
    getPinnedTopRow,
    getPinnedTopRowCount,
} from './manualPinnedRowApi';
import { ManualPinnedRowModel } from './manualPinnedRowModel';

/**
 * @feature Rows -> Manual Row Pinning
 * @gridOption enableRowPinning
 */
export const ManualPinnedRowModule: _ModuleWithApi<_PinnedRowGridApi> = {
    moduleName: 'ManualPinnedRow',
    version: VERSION,
    beans: [ManualPinnedRowModel],
    apiFunctions: {
        getPinnedTopRowCount,
        getPinnedBottomRowCount,
        getPinnedTopRow,
        getPinnedBottomRow,
    },
};
