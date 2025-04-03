import type { _ModuleWithApi, _PinnedRowGridApi } from 'ag-grid-community';

import { VERSION } from '../version';
import { manualPinnedRowCSS } from './manualPinnedRow.css-GENERATED';
import {
    forEachPinnedRow,
    getPinnedBottomRow,
    getPinnedBottomRowCount,
    getPinnedTopRow,
    getPinnedTopRowCount,
} from './manualPinnedRowApi';
import { PinnedRowModel } from './pinnedRowModel';

/**
 * @feature Rows -> Manual Row Pinning
 * @gridOption enableRowPinning, isRowPinnable, isRowPinned
 */
export const ManualPinnedRowModule: _ModuleWithApi<_PinnedRowGridApi> = {
    moduleName: 'ManualPinnedRow',
    version: VERSION,
    beans: [PinnedRowModel],
    css: [manualPinnedRowCSS],
    apiFunctions: {
        getPinnedTopRowCount,
        getPinnedBottomRowCount,
        getPinnedTopRow,
        getPinnedBottomRow,
        forEachPinnedRow,
    },
};
