import type { PinnedRowGridApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import { getPinnedBottomRow, getPinnedBottomRowCount, getPinnedTopRow, getPinnedTopRowCount } from './pinnedRowApi';

export const PinnedRowApiModule = _defineModule<PinnedRowGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/pinned-row-api',
    apiFunctions: {
        getPinnedTopRowCount,
        getPinnedBottomRowCount,
        getPinnedTopRow,
        getPinnedBottomRow,
    },
});
