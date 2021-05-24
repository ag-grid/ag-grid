/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
/**
 * These keys are used for validating properties supplied on a gridOptions object, and for code generation.
 * If you change the properties on the gridOptions interface, you *must* update this file as well to be consistent.
 */
var PropertyKeys = /** @class */ (function () {
    function PropertyKeys() {
    }
    PropertyKeys.STRING_PROPERTIES = [
        'sortingOrder', 'rowClass', 'rowSelection', 'overlayLoadingTemplate', 'overlayNoRowsTemplate',
        'quickFilterText', 'rowModelType', 'editType', 'domLayout', 'clipboardDeliminator', 'rowGroupPanelShow',
        'multiSortKey', 'pivotColumnGroupTotals', 'pivotRowTotals', 'pivotPanelShow', 'fillHandleDirection',
        'serverSideStoreType'
    ];
    PropertyKeys.OBJECT_PROPERTIES = [
        'components', 'frameworkComponents', 'rowStyle', 'context', 'autoGroupColumnDef', 'localeText', 'icons',
        'datasource', 'serverSideDatasource', 'viewportDatasource', 'groupRowRendererParams', 'aggFuncs', 'fullWidthCellRendererParams',
        'defaultColGroupDef', 'defaultColDef', 'defaultExportParams', 'defaultCsvExportParams', 'defaultExcelExportParams', 'columnTypes',
        'rowClassRules', 'detailGridOptions', 'detailCellRendererParams', 'loadingCellRendererParams', 'loadingOverlayComponentParams',
        'noRowsOverlayComponentParams', 'popupParent', 'colResizeDefault', 'reduxStore', 'statusBar', 'sideBar', 'chartThemeOverrides',
        'customChartThemes'
    ];
    PropertyKeys.ARRAY_PROPERTIES = [
        'alignedGrids', 'rowData', 'columnDefs', 'excelStyles', 'pinnedTopRowData', 'pinnedBottomRowData', 'chartThemes'
    ];
    PropertyKeys.NUMBER_PROPERTIES = [
        'rowHeight', 'detailRowHeight', 'rowBuffer', 'colWidth', 'headerHeight', 'groupHeaderHeight', 'floatingFiltersHeight',
        'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupDefaultExpanded', 'minColWidth', 'maxColWidth', 'viewportRowModelPageSize',
        'viewportRowModelBufferSize', 'autoSizePadding', 'maxBlocksInCache', 'maxConcurrentDatasourceRequests', 'tooltipShowDelay',
        'cacheOverflowSize', 'paginationPageSize', 'cacheBlockSize', 'infiniteInitialRowCount', 'scrollbarWidth',
        'batchUpdateWaitMillis', 'asyncTransactionWaitMillis', 'blockLoadDebounceMillis', 'keepDetailRowsCount',
        'undoRedoCellEditingLimit', 'cellFlashDelay', 'cellFadeDelay', 'tabIndex'
    ];
    PropertyKeys.BOOLEAN_PROPERTIES = [
        'suppressMakeColumnVisibleAfterUnGroup', 'suppressRowClickSelection', 'suppressCellSelection', 'suppressHorizontalScroll',
        'alwaysShowHorizontalScroll', 'alwaysShowVerticalScroll', 'debug', 'enableBrowserTooltips', 'enableCellExpressions',
        'angularCompileRows', 'angularCompileFilters', 'groupSuppressAutoColumn', 'groupSelectsChildren', 'groupIncludeFooter',
        'groupIncludeTotalFooter', 'groupUseEntireRow', 'groupSuppressBlankHeader', 'suppressMenuHide', 'suppressRowDeselection',
        'unSortIcon', 'suppressMultiSort', 'singleClickEdit', 'suppressLoadingOverlay', 'suppressNoRowsOverlay', 'suppressAutoSize',
        'skipHeaderOnAutoSize', 'suppressParentsInRowNodes', 'suppressColumnMoveAnimation', 'suppressMovableColumns',
        'suppressFieldDotNotation', 'enableRangeSelection', 'enableRangeHandle', 'enableFillHandle', 'suppressClearOnFillReduction',
        'deltaSort', 'suppressTouch', 'suppressAsyncEvents', 'allowContextMenuWithControlKey', 'suppressContextMenu',
        'rememberGroupStateWhenNewData', 'enableCellChangeFlash', 'suppressDragLeaveHidesColumns', 'suppressMiddleClickScrolls',
        'suppressPreventDefaultOnMouseWheel', 'suppressCopyRowsToClipboard', 'copyHeadersToClipboard', 'pivotMode',
        'suppressAggFuncInHeader', 'suppressColumnVirtualisation', 'suppressAggAtRootLevel', 'suppressFocusAfterRefresh',
        'functionsPassive', 'functionsReadOnly', 'animateRows', 'groupSelectsFiltered', 'groupRemoveSingleChildren',
        'groupRemoveLowestSingleChildren', 'enableRtl', 'suppressClickEdit', 'rowDragManaged', 'suppressRowDrag',
        'suppressMoveWhenRowDragging', 'enableMultiRowDragging', 'enableGroupEdit', 'embedFullWidthRows', 'deprecatedEmbedFullWidthRows',
        'suppressPaginationPanel', 'floatingFilter', 'groupHideOpenParents', 'groupMultiAutoColumn', 'pagination',
        'stopEditingWhenGridLosesFocus', 'paginationAutoPageSize', 'suppressScrollOnNewData', 'purgeClosedRowNodes', 'cacheQuickFilter',
        'deltaRowDataMode', 'ensureDomOrder', 'accentedSort', 'suppressChangeDetection', 'valueCache', 'valueCacheNeverExpires',
        'aggregateOnlyChangedColumns', 'suppressAnimationFrame', 'suppressExcelExport', 'suppressCsvExport', 'treeData',
        'masterDetail', 'suppressMultiRangeSelection', 'enterMovesDownAfterEdit', 'enterMovesDown', 'suppressPropertyNamesCheck',
        'rowMultiSelectWithClick', 'suppressEnterpriseResetOnNewColumns', 'enableOldSetFilterModel', 'suppressRowHoverHighlight',
        'suppressRowTransform', 'suppressClipboardPaste', 'suppressLastEmptyLineOnPaste', 'serverSideSortingAlwaysResets',
        'reactNext', 'suppressSetColumnStateEvents', 'suppressColumnStateEvents', 'enableCharts', 'deltaColumnMode', 'suppressMaintainUnsortedOrder',
        'enableCellTextSelection', 'suppressBrowserResizeObserver', 'suppressMaxRenderedRowRestriction',
        'excludeChildrenWhenTreeDataFiltering', 'tooltipMouseTrack', 'keepDetailRows', 'paginateChildRows', 'preventDefaultOnContextMenu',
        'undoRedoCellEditing', 'allowDragFromColumnsToolPanel', 'immutableData', 'immutableColumns', 'pivotSuppressAutoColumn',
        'suppressExpandablePivotGroups', 'applyColumnDefOrder', 'debounceVerticalScrollbar', 'detailRowAutoHeight',
        'serverSideFilteringAlwaysResets', 'suppressAggFilteredOnly', 'showOpenedGroup', 'suppressClipboardApi',
        'suppressModelUpdateAfterUpdateTransaction', 'stopEditingWhenCellsLoseFocus'
    ];
    /** You do not need to include event callbacks in this list, as they are generated automatically. */
    PropertyKeys.FUNCTION_PROPERTIES = [
        'localeTextFunc', 'groupRowInnerRenderer', 'groupRowInnerRendererFramework', 'dateComponent', 'dateComponentFramework', 'groupRowRenderer',
        'groupRowRendererFramework', 'isExternalFilterPresent', 'getRowHeight', 'doesExternalFilterPass', 'getRowClass', 'getRowStyle',
        'getRowClassRules', 'traverseNode', 'getContextMenuItems', 'getMainMenuItems', 'processRowPostCreate', 'processCellForClipboard',
        'groupRowAggNodes', 'getRowNodeId', 'isFullWidthCell', 'fullWidthCellRenderer', 'fullWidthCellRendererFramework', 'processSecondaryColDef',
        'processSecondaryColGroupDef', 'getBusinessKeyForNode', 'sendToClipboard', 'navigateToNextHeader', 'tabToNextHeader', 'navigateToNextCell',
        'tabToNextCell', 'getDetailRowData', 'processCellFromClipboard', 'getDocument', 'postProcessPopup', 'getChildCount', 'getDataPath',
        'loadingCellRenderer', 'loadingCellRendererFramework', 'loadingOverlayComponent', 'loadingOverlayComponentFramework', 'noRowsOverlayComponent',
        'noRowsOverlayComponentFramework', 'detailCellRenderer', 'detailCellRendererFramework', 'defaultGroupSortComparator', 'isRowMaster',
        'isRowSelectable', 'postSort', 'processHeaderForClipboard', 'paginationNumberFormatter', 'processDataFromClipboard', 'getServerSideGroupKey',
        'isServerSideGroup', 'suppressKeyboardEvent', 'createChartContainer', 'processChartOptions', 'getChartToolbarItems', 'fillOperation',
        'isApplyServerSideTransaction', 'getServerSideStoreParams', 'isServerSideGroupOpenByDefault', 'isGroupOpenByDefault'
    ];
    PropertyKeys.ALL_PROPERTIES = __spreadArrays(PropertyKeys.ARRAY_PROPERTIES, PropertyKeys.OBJECT_PROPERTIES, PropertyKeys.STRING_PROPERTIES, PropertyKeys.NUMBER_PROPERTIES, PropertyKeys.FUNCTION_PROPERTIES, PropertyKeys.BOOLEAN_PROPERTIES);
    /**
     * Used when performing property checks. This avoids noise caused when using frameworks, which can add their own
     * framework-specific properties to colDefs, gridOptions etc.
     */
    PropertyKeys.FRAMEWORK_PROPERTIES = [
        '__ob__', '__v_skip', '__metadata__', 'mappedColumnProperties', 'hasChildColumns', 'toColDef', 'createColDefFromGridColumn'
    ];
    return PropertyKeys;
}());
export { PropertyKeys };
