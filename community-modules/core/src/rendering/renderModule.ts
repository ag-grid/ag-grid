import type { _RenderGridApi } from '../api/gridApi';
import { _defineModule } from '../interfaces/iModule';
import { VERSION } from '../version';
import {
    flashCells,
    flushAllAnimationFrames,
    getCellRendererInstances,
    getSizesForCurrentTheme,
    isAnimationFrameQueueEmpty,
    refreshCells,
    refreshHeader,
    setGridAriaProperty,
} from './renderApi';

export const RenderApiModule = _defineModule<_RenderGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/render-api',
    apiFunctions: {
        setGridAriaProperty,
        refreshCells,
        flashCells,
        refreshHeader,
        isAnimationFrameQueueEmpty,
        flushAllAnimationFrames,
        getSizesForCurrentTheme,
        getCellRendererInstances,
    },
});
