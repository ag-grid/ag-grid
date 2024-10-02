import type { _RenderGridApi } from '../api/gridApi';
import type { ModuleWithApi } from '../interfaces/iModule';
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

export const RenderApiModule: ModuleWithApi<_RenderGridApi<any>> = {
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
