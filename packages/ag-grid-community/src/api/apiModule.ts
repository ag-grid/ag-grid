import { ColumnApiModule } from '../columns/columnModule';
import { defineCommunityModule } from '../interfaces/iModule';
import { RenderApiModule } from '../rendering/renderModule';
import { destroy, getGridId, getGridOption, isDestroyed, setGridOption, updateGridOptions } from './coreApi';
import type { _CoreGridApi, _RowGridApi, _ScrollGridApi } from './gridApi';
import {
    addRenderedRowListener,
    forEachNode,
    getDisplayedRowAtIndex,
    getDisplayedRowCount,
    getFirstDisplayedRowIndex,
    getLastDisplayedRowIndex,
    getRenderedNodes,
    getRowNode,
    redrawRows,
    setRowNodeExpanded,
} from './rowApi';
import {
    ensureColumnVisible,
    ensureIndexVisible,
    ensureNodeVisible,
    getHorizontalPixelRange,
    getVerticalPixelRange,
} from './scrollApi';

export const CoreApiModule = defineCommunityModule<_CoreGridApi>('@ag-grid-community/core-api', {
    apiFunctions: {
        getGridId,
        destroy,
        isDestroyed,
        getGridOption,
        setGridOption,
        updateGridOptions,
    },
});

export const RowApiModule = defineCommunityModule<_RowGridApi<any>>('@ag-grid-community/row-api', {
    apiFunctions: {
        redrawRows,
        setRowNodeExpanded,
        getRowNode,
        addRenderedRowListener,
        getRenderedNodes,
        forEachNode,
        getFirstDisplayedRowIndex,
        getLastDisplayedRowIndex,
        getDisplayedRowAtIndex,
        getDisplayedRowCount,
    },
});

export const ScrollApiModule = defineCommunityModule<_ScrollGridApi<any>>('@ag-grid-community/scroll-api', {
    apiFunctions: {
        getVerticalPixelRange,
        getHorizontalPixelRange,
        ensureColumnVisible,
        ensureIndexVisible,
        ensureNodeVisible,
    },
});

export const CommunityApiModule = defineCommunityModule('@ag-grid-community/api', {
    dependsOn: [ColumnApiModule, RowApiModule, ScrollApiModule, RenderApiModule],
});
