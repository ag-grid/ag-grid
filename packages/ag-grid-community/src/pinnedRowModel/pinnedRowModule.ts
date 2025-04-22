import type { _PinnedRowGridApi } from '../api/gridApi';
import type { _ModuleWithApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { manualPinnedRowCSS } from './manualPinnedRow.css-GENERATED';
import {
    forEachPinnedRow,
    getPinnedBottomRow,
    getPinnedBottomRowCount,
    getPinnedTopRow,
    getPinnedTopRowCount,
} from './pinnedRowApi';
import { PinnedRowModel } from './pinnedRowModel';

/**
 * @feature Rows -> Row Pinning
 * @gridOption enableRowPinning, isRowPinnable, isRowPinned, pinnedTopRowData, pinnedBottomRowData
 */
export const PinnedRowModule: _ModuleWithApi<_PinnedRowGridApi> = {
    moduleName: 'PinnedRow',
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
    icons: {
        rowPin: 'pin',
        rowPinTop: 'pinned-top',
        rowPinBottom: 'pinned-bottom',
        rowUnpin: 'un-pin',
    },
};
