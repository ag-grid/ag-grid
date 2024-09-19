import { ColumnApiModule } from '../columns/columnModule';
import { _defineModule } from '../interfaces/iModule';
import { OverlayApiModule } from '../rendering/overlays/overlayModule';
import { RenderApiModule } from '../rendering/renderModule';
import { VERSION } from '../version';
import { expireValueCache, getCellValue, getValue } from './cellApi';
import { destroy, getGridId, getGridOption, isDestroyed, setGridOption, updateGridOptions } from './coreApi';
import { addEventListener, addGlobalListener, removeEventListener, removeGlobalListener } from './eventApi';
import type {
    _CellGridApi,
    _CommunityMenuGridApi,
    _CoreGridApi,
    _EventGridApi,
    _KeyboardNavigationGridApi,
    _RowGridApi,
    _RowSelectionGridApi,
    _ScrollGridApi,
    _SortGridApi,
} from './gridApi';
import {
    clearFocusedCell,
    getFocusedCell,
    setFocusedCell,
    setFocusedHeader,
    tabToNextCell,
    tabToPreviousCell,
} from './keyboardNavigationApi';
import {
    hidePopupMenu,
    showColumnMenu,
    showColumnMenuAfterButtonClick,
    showColumnMenuAfterMouseClick,
} from './menuApi';
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
    deselectAll,
    deselectAllFiltered,
    deselectAllOnCurrentPage,
    getSelectedNodes,
    getSelectedRows,
    selectAll,
    selectAllFiltered,
    selectAllOnCurrentPage,
    setNodesSelected,
} from './rowSelectionApi';
import {
    ensureColumnVisible,
    ensureIndexVisible,
    ensureNodeVisible,
    getHorizontalPixelRange,
    getVerticalPixelRange,
} from './scrollApi';
import { onSortChanged } from './sortApi';

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

export const RowSelectionApiModule = _defineModule<_RowSelectionGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/row-selection-api',
    apiFunctions: {
        setNodesSelected,
        selectAll,
        deselectAll,
        selectAllFiltered,
        deselectAllFiltered,
        selectAllOnCurrentPage,
        deselectAllOnCurrentPage,
        getSelectedNodes,
        getSelectedRows,
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

export const KeyboardNavigationApiModule = _defineModule<_KeyboardNavigationGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/keyboard-navigation-api',
    apiFunctions: {
        getFocusedCell,
        clearFocusedCell,
        setFocusedCell,
        setFocusedHeader,
        tabToNextCell,
        tabToPreviousCell,
    },
});

export const EventApiModule = _defineModule<_EventGridApi<any>>({
    version: VERSION,
    moduleName: '@ag-grid-community/event-api',
    apiFunctions: {
        addEventListener,
        addGlobalListener,
        removeEventListener,
        removeGlobalListener,
    },
});

export const CellApiModule = _defineModule<_CellGridApi<any>>({
    version: VERSION,
    moduleName: '@ag-grid-community/cell-api',
    apiFunctions: {
        expireValueCache,
        getValue,
        getCellValue,
    },
});

export const CommunityMenuApiModule = _defineModule<_CommunityMenuGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/menu-api',
    apiFunctions: {
        showColumnMenuAfterButtonClick,
        showColumnMenuAfterMouseClick,
        showColumnMenu,
        hidePopupMenu,
    },
});

export const SortApiModule = _defineModule<_SortGridApi>({
    version: VERSION,
    moduleName: '@ag-grid-community/sort-api',
    apiFunctions: {
        onSortChanged,
    },
});

export const CommunityApiModule = _defineModule({
    version: VERSION,
    moduleName: '@ag-grid-community/api',
    dependantModules: [
        CoreApiModule,
        RowSelectionApiModule,
        ColumnApiModule,
        RowApiModule,
        ScrollApiModule,
        OverlayApiModule,
        KeyboardNavigationApiModule,
        EventApiModule,
        RenderApiModule,
        CellApiModule,
        CommunityMenuApiModule,
        SortApiModule,
    ],
});
