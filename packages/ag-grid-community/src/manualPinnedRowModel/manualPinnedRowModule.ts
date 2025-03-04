import type { _PinnedRowGridApi } from '../api/gridApi';
import type { _ModuleWithApi } from '../interfaces/iModule';
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
