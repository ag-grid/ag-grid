import type { Module } from '../interfaces/iModule';
import { VERSION } from '../version';
import { getPinnedBottomRow, getPinnedBottomRowCount, getPinnedTopRow, getPinnedTopRowCount } from './pinnedRowApi';

export const PinnedRowApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-community/pinned-row-api',
    apiFunctions: {
        getPinnedTopRowCount,
        getPinnedBottomRowCount,
        getPinnedTopRow,
        getPinnedBottomRow,
    },
};
