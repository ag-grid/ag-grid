import type { _RenderGridApi } from '../api/gridApi';
import { defineCommunityModule } from '../interfaces/iModule';
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

export const RenderApiModule = defineCommunityModule<_RenderGridApi<any>>('@ag-grid-community/render-api', {
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
