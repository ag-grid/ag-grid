import type { _ModuleWithApi, _ModuleWithoutApi, _PinnedRowGridApi } from 'ag-grid-community';
import { PinnedRowModule } from 'ag-grid-community';

import { VERSION } from '../version';
import {
    getPinnedBottomRow,
    getPinnedBottomRowCount,
    getPinnedTopRow,
    getPinnedTopRowCount,
} from './manualPinnedRowApi';
import { ManualPinnedRowModel } from './manualPinnedRowModel';
import { ServerSideManualPinnedRowModel } from './serverSideManualPinnedRowModel';

/**
 * @feature Rows -> Manual Row Pinning
 * @gridOption enableRowPinning
 */
export const ManualPinnedRowModule: _ModuleWithoutApi = {
    moduleName: 'ManualPinnedRow',
    version: VERSION,
    rowModels: ['clientSide', 'infinite', 'viewport'],
    beans: [ManualPinnedRowModel],
    dependsOn: [PinnedRowModule],
};

/**
 * @feature Rows -> Server-side Manual Row Pinning
 * @gridOption enableRowPinning
 */
export const ServerSideManualPinnedRowModule: _ModuleWithoutApi = {
    moduleName: 'ServerSideManualPinnedRow',
    version: VERSION,
    rowModels: ['serverSide'],
    beans: [ServerSideManualPinnedRowModel],
    dependsOn: [PinnedRowModule],
};

export const ManualPinnedRowApiModule: _ModuleWithApi<_PinnedRowGridApi> = {
    moduleName: 'ManualPinnedRowApi',
    version: VERSION,
    apiFunctions: {
        getPinnedTopRowCount,
        getPinnedBottomRowCount,
        getPinnedTopRow,
        getPinnedBottomRow,
    },
};
