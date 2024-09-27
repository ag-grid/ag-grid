import { ColumnApiModule } from '../columns/columnModule';
import { _defineModule } from '../interfaces/iModule';
import { RenderApiModule } from '../rendering/renderModule';
import { VERSION } from '../version';
import { destroy, getGridId, getGridOption, isDestroyed, setGridOption, updateGridOptions } from './coreApi';
import type { _CoreGridApi, _RowGridApi, _ScrollGridApi } from './gridApi';
import {
    addRenderedRowListener,
    forEachNode,
    getDisplayedRowAtIndex,
    getDisplayedRowCount,
    getFirstDisplayedRow,
    getFirstDisplayedRowIndex,
    getLastDisplayedRow,
    getLastDisplayedRowIndex,
    getModel,
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

export const CoreApiModule = _defineModule<_CoreGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/core-api',
    apiFunctions: {
        getGridId,
        destroy,
        isDestroyed,
        getGridOption,
        setGridOption,
        updateGridOptions,
    },
});

export const RowApiModule = _defineModule<_RowGridApi<any>>({
    version: VERSION,
    moduleName: '@ag-grid-community/row-api',
    apiFunctions: {
        redrawRows,
        setRowNodeExpanded,
        getRowNode,
        addRenderedRowListener,
        getRenderedNodes,
        forEachNode,
        getFirstDisplayedRow,
        getFirstDisplayedRowIndex,
        getLastDisplayedRow,
        getLastDisplayedRowIndex,
        getDisplayedRowAtIndex,
        getDisplayedRowCount,
        getModel,
    },
});

export const ScrollApiModule = _defineModule<_ScrollGridApi<any>>({
    version: VERSION,
    moduleName: '@ag-grid-community/scroll-api',
    apiFunctions: {
        getVerticalPixelRange,
        getHorizontalPixelRange,
        ensureColumnVisible,
        ensureIndexVisible,
        ensureNodeVisible,
    },
});

export const CommunityApiModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/api',
    dependantModules: [ColumnApiModule, RowApiModule, ScrollApiModule, RenderApiModule],
});
