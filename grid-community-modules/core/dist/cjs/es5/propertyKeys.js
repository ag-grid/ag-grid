"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyKeys = exports.INITIAL_GRID_OPTION_KEYS = void 0;
exports.INITIAL_GRID_OPTION_KEYS = {
    statusBar: true,
    enableBrowserTooltips: true,
    tooltipTrigger: true,
    tooltipMouseTrack: true,
    tooltipInteraction: true,
    defaultColGroupDef: true,
    suppressAutoSize: true,
    skipHeaderOnAutoSize: true,
    autoSizeStrategy: true,
    components: true,
    stopEditingWhenCellsLoseFocus: true,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: true,
    excelStyles: true,
    cacheQuickFilter: true,
    excludeHiddenColumnsFromQuickFilter: true,
    advancedFilterModel: true,
    customChartThemes: true,
    chartThemeOverrides: true,
    enableChartToolPanelsButton: true,
    suppressChartToolPanelsButton: true,
    chartToolPanelsDef: true,
    loadingCellRendererSelector: true,
    localeText: true,
    keepDetailRows: true,
    keepDetailRowsCount: true,
    detailRowHeight: true,
    detailRowAutoHeight: true,
    alignedGrids: true,
    tabIndex: true,
    valueCache: true,
    valueCacheNeverExpires: true,
    enableCellExpressions: true,
    suppressParentsInRowNodes: true,
    suppressTouch: true,
    suppressAsyncEvents: true,
    suppressBrowserResizeObserver: true,
    suppressPropertyNamesCheck: true,
    debug: true,
    loadingOverlayComponent: true,
    loadingOverlayComponentParams: true,
    suppressLoadingOverlay: true,
    noRowsOverlayComponent: true,
    noRowsOverlayComponentParams: true,
    paginationPageSizeSelector: true,
    paginateChildRows: true,
    pivotPanelShow: true,
    pivotSuppressAutoColumn: true,
    suppressExpandablePivotGroups: true,
    aggFuncs: true,
    suppressAggFuncInHeader: true,
    suppressAggAtRootLevel: true,
    removePivotHeaderRowWhenSingleValueColumn: true,
    allowShowChangeAfterFilter: true,
    ensureDomOrder: true,
    enableRtl: true,
    suppressColumnVirtualisation: true,
    suppressMaxRenderedRowRestriction: true,
    suppressRowVirtualisation: true,
    rowDragText: true,
    suppressGroupMaintainValueType: true,
    autoGroupColumnDef: true,
    groupLockGroupColumns: true,
    rowGroupPanelSuppressSort: true,
    suppressGroupRowsSticky: true,
    rowModelType: true,
    cacheOverflowSize: true,
    infiniteInitialRowCount: true,
    serverSideInitialRowCount: true,
    suppressServerSideInfiniteScroll: true,
    maxBlocksInCache: true,
    maxConcurrentDatasourceRequests: true,
    blockLoadDebounceMillis: true,
    serverSideOnlyRefreshFilteredGroups: true,
    serverSidePivotResultFieldSeparator: true,
    viewportRowModelPageSize: true,
    viewportRowModelBufferSize: true,
    debounceVerticalScrollbar: true,
    suppressAnimationFrame: true,
    suppressPreventDefaultOnMouseWheel: true,
    scrollbarWidth: true,
    icons: true,
    suppressRowTransform: true,
    gridId: true,
    functionsPassive: true,
    enableGroupEdit: true,
    initialState: true,
    processUnpinnedColumns: true,
    createChartContainer: true,
    getLocaleText: true,
    getRowId: true,
};
/**
 * These keys are used for validating properties supplied on a gridOptions object, and for code generation.
 * If you change the properties on the gridOptions interface, you *must* update this file as well to be consistent.
 */
var PropertyKeys = /** @class */ (function () {
    function PropertyKeys() {
    }
    PropertyKeys.STRING_PROPERTIES = [
        'rowSelection', 'overlayLoadingTemplate', 'overlayNoRowsTemplate', 'gridId', 'quickFilterText', 'rowModelType', 'editType', 'domLayout',
        'clipboardDelimiter', 'rowGroupPanelShow', 'multiSortKey', 'pivotColumnGroupTotals', 'pivotRowTotals', 'pivotPanelShow', 'fillHandleDirection',
        'groupDisplayType', 'treeDataDisplayType', 'colResizeDefault', 'tooltipTrigger', 'serverSidePivotResultFieldSeparator',
    ];
    PropertyKeys.OBJECT_PROPERTIES = [
        'components', 'rowStyle', 'context', 'autoGroupColumnDef', 'localeText', 'icons', 'datasource', 'serverSideDatasource', 'viewportDatasource',
        'groupRowRendererParams', 'aggFuncs', 'fullWidthCellRendererParams', 'defaultColGroupDef', 'defaultColDef', 'defaultCsvExportParams',
        'defaultExcelExportParams', 'columnTypes', 'rowClassRules', 'detailCellRendererParams', 'loadingCellRendererParams', 'loadingOverlayComponentParams',
        'noRowsOverlayComponentParams', 'popupParent', 'statusBar', 'sideBar', 'chartThemeOverrides', 'customChartThemes', 'chartToolPanelsDef',
        'dataTypeDefinitions', 'advancedFilterModel', 'advancedFilterParent', 'advancedFilterBuilderParams', 'initialState', 'autoSizeStrategy',
    ];
    PropertyKeys.ARRAY_PROPERTIES = [
        'sortingOrder', 'alignedGrids', 'rowData', 'columnDefs', 'excelStyles', 'pinnedTopRowData', 'pinnedBottomRowData', 'chartThemes',
        'rowClass', 'paginationPageSizeSelector',
    ];
    PropertyKeys.NUMBER_PROPERTIES = [
        'rowHeight', 'detailRowHeight', 'rowBuffer', 'headerHeight', 'groupHeaderHeight', 'groupLockGroupColumns', 'floatingFiltersHeight',
        'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupDefaultExpanded', 'pivotDefaultExpanded', 'viewportRowModelPageSize',
        'viewportRowModelBufferSize', 'autoSizePadding', 'maxBlocksInCache', 'maxConcurrentDatasourceRequests', 'tooltipShowDelay',
        'tooltipHideDelay', 'cacheOverflowSize', 'paginationPageSize', 'cacheBlockSize', 'infiniteInitialRowCount', 'serverSideInitialRowCount',
        'scrollbarWidth', 'asyncTransactionWaitMillis', 'blockLoadDebounceMillis', 'keepDetailRowsCount', 'undoRedoCellEditingLimit',
        'cellFlashDelay', 'cellFadeDelay', 'tabIndex'
    ];
    PropertyKeys.BOOLEAN_PROPERTIES = [
        'suppressMakeColumnVisibleAfterUnGroup', 'suppressRowClickSelection', 'suppressCellFocus', 'suppressHorizontalScroll', 'groupSelectsChildren',
        'alwaysShowHorizontalScroll', 'alwaysShowVerticalScroll', 'debug', 'enableBrowserTooltips', 'enableCellExpressions', 'groupIncludeTotalFooter',
        'groupSuppressBlankHeader', 'suppressMenuHide', 'suppressRowDeselection', 'unSortIcon', 'suppressMultiSort', 'alwaysMultiSort', 'singleClickEdit',
        'suppressLoadingOverlay', 'suppressNoRowsOverlay', 'suppressAutoSize', 'skipHeaderOnAutoSize', 'suppressParentsInRowNodes', 'suppressColumnMoveAnimation',
        'suppressMovableColumns', 'suppressFieldDotNotation', 'enableRangeSelection', 'enableRangeHandle', 'enableFillHandle', 'suppressClearOnFillReduction',
        'deltaSort', 'suppressTouch', 'suppressAsyncEvents', 'allowContextMenuWithControlKey', 'suppressContextMenu', 'enableCellChangeFlash',
        'suppressDragLeaveHidesColumns', 'suppressRowGroupHidesColumns', 'suppressMiddleClickScrolls', 'suppressPreventDefaultOnMouseWheel',
        'suppressCopyRowsToClipboard', 'copyHeadersToClipboard', 'copyGroupHeadersToClipboard', 'pivotMode', 'suppressAggFuncInHeader',
        'suppressColumnVirtualisation', 'alwaysAggregateAtRootLevel', 'suppressAggAtRootLevel', 'suppressFocusAfterRefresh', 'functionsPassive',
        'functionsReadOnly', 'animateRows', 'groupSelectsFiltered', 'groupRemoveSingleChildren', 'groupRemoveLowestSingleChildren', 'enableRtl',
        'suppressClickEdit', 'rowDragEntireRow', 'rowDragManaged', 'suppressRowDrag', 'suppressMoveWhenRowDragging', 'rowDragMultiRow', 'enableGroupEdit',
        'embedFullWidthRows', 'suppressPaginationPanel', 'groupHideOpenParents', 'groupAllowUnbalanced', 'pagination', 'paginationAutoPageSize',
        'suppressScrollOnNewData', 'suppressScrollWhenPopupsAreOpen', 'purgeClosedRowNodes', 'cacheQuickFilter', 'includeHiddenColumnsInQuickFilter',
        'excludeHiddenColumnsFromQuickFilter', 'ensureDomOrder', 'accentedSort', 'suppressChangeDetection', 'valueCache', 'valueCacheNeverExpires',
        'aggregateOnlyChangedColumns', 'suppressAnimationFrame', 'suppressExcelExport', 'suppressCsvExport', 'includeHiddenColumnsInAdvancedFilter',
        'suppressMultiRangeSelection', 'enterMovesDown', 'enterMovesDownAfterEdit', 'enterNavigatesVerticallyAfterEdit', 'enterNavigatesVertically',
        'suppressPropertyNamesCheck', 'rowMultiSelectWithClick', 'suppressRowHoverHighlight', 'suppressRowTransform', 'suppressClipboardPaste',
        'suppressLastEmptyLineOnPaste', 'enableCharts', 'enableChartToolPanelsButton', 'suppressChartToolPanelsButton', 'suppressMaintainUnsortedOrder',
        'enableCellTextSelection', 'suppressBrowserResizeObserver', 'suppressMaxRenderedRowRestriction', 'excludeChildrenWhenTreeDataFiltering',
        'tooltipMouseTrack', 'tooltipInteraction', 'keepDetailRows', 'paginateChildRows', 'preventDefaultOnContextMenu', 'undoRedoCellEditing',
        'allowDragFromColumnsToolPanel', 'pivotSuppressAutoColumn', 'suppressExpandablePivotGroups', 'debounceVerticalScrollbar', 'detailRowAutoHeight',
        'serverSideFilterAllLevels', 'serverSideSortAllLevels', 'serverSideOnlyRefreshFilteredGroups', 'serverSideSortOnServer', 'serverSideFilterOnServer',
        'suppressAggFilteredOnly', 'showOpenedGroup', 'suppressClipboardApi', 'suppressModelUpdateAfterUpdateTransaction', 'stopEditingWhenCellsLoseFocus',
        'maintainColumnOrder', 'groupMaintainOrder', 'columnHoverHighlight', 'readOnlyEdit', 'suppressRowVirtualisation', 'enableCellEditingOnBackspace',
        'resetRowDataOnUpdate', 'removePivotHeaderRowWhenSingleValueColumn', 'suppressCopySingleCellRanges', 'suppressGroupRowsSticky', 'suppressCutToClipboard',
        'suppressServerSideInfiniteScroll', 'rowGroupPanelSuppressSort', 'allowShowChangeAfterFilter', 'enableAdvancedFilter', 'masterDetail', 'treeData',
        'suppressGroupMaintainValueType'
    ];
    /** You do not need to include event callbacks in this list, as they are generated automatically. */
    PropertyKeys.FUNCTIONAL_PROPERTIES = [
        'doesExternalFilterPass', 'processPivotResultColDef', 'processPivotResultColGroupDef', 'getBusinessKeyForNode', 'isRowSelectable', 'rowDragText',
        'groupRowRenderer', 'fullWidthCellRenderer', 'loadingCellRenderer', 'loadingOverlayComponent', 'noRowsOverlayComponent', 'detailCellRenderer',
        'quickFilterParser', 'quickFilterMatcher'
    ];
    /** These callbacks extend AgGridCommon interface */
    PropertyKeys.CALLBACK_PROPERTIES = [
        'getLocaleText', 'isExternalFilterPresent', 'getRowHeight', 'getRowClass', 'getRowStyle', 'getContextMenuItems', 'getMainMenuItems',
        'processRowPostCreate', 'processCellForClipboard', 'getGroupRowAgg', 'isFullWidthRow', 'sendToClipboard', 'navigateToNextHeader',
        'tabToNextHeader', 'navigateToNextCell', 'tabToNextCell', 'processCellFromClipboard', 'getDocument', 'postProcessPopup', 'getChildCount',
        'getDataPath', 'isRowMaster', 'postSortRows', 'processHeaderForClipboard', 'processUnpinnedColumns', 'processGroupHeaderForClipboard',
        'paginationNumberFormatter', 'processDataFromClipboard', 'getServerSideGroupKey', 'isServerSideGroup', 'createChartContainer',
        'getChartToolbarItems', 'fillOperation', 'isApplyServerSideTransaction', 'getServerSideGroupLevelParams', 'isServerSideGroupOpenByDefault',
        'isGroupOpenByDefault', 'initialGroupOrderComparator', 'groupIncludeFooter', 'loadingCellRendererSelector', 'getRowId', 'groupAggFiltering'
    ];
    PropertyKeys.FUNCTION_PROPERTIES = __spreadArray(__spreadArray([], __read(PropertyKeys.FUNCTIONAL_PROPERTIES), false), __read(PropertyKeys.CALLBACK_PROPERTIES), false);
    PropertyKeys.ALL_PROPERTIES = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(PropertyKeys.ARRAY_PROPERTIES), false), __read(PropertyKeys.OBJECT_PROPERTIES), false), __read(PropertyKeys.STRING_PROPERTIES), false), __read(PropertyKeys.NUMBER_PROPERTIES), false), __read(PropertyKeys.FUNCTION_PROPERTIES), false), __read(PropertyKeys.BOOLEAN_PROPERTIES), false);
    return PropertyKeys;
}());
exports.PropertyKeys = PropertyKeys;
