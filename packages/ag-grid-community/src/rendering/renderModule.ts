import type { _RenderGridApi } from '../api/gridApi';
import type { _ModuleWithApi } from '../interfaces/iModule';
import { baseCommunityModule } from '../interfaces/iModule';
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

export const RenderApiModule: _ModuleWithApi<_RenderGridApi<any>> = {
    ...baseCommunityModule('RenderApiModule'),
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
};
