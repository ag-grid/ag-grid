/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
/**
 * These keys are used for validating properties supplied on a gridOptions object, and for code generation.
 * If you change the properties on the gridOptions interface, you *must* update this file as well to be consistent.
 */
export class PropertyKeys {
}
PropertyKeys.STRING_PROPERTIES = [
    'rowSelection', 'overlayLoadingTemplate', 'overlayNoRowsTemplate',
    'quickFilterText', 'rowModelType', 'editType', 'domLayout', 'clipboardDelimiter', 'rowGroupPanelShow',
    'multiSortKey', 'pivotColumnGroupTotals', 'pivotRowTotals', 'pivotPanelShow', 'fillHandleDirection',
    'serverSideStoreType', 'groupDisplayType', 'treeDataDisplayType', 'colResizeDefault'
];
PropertyKeys.OBJECT_PROPERTIES = [
    'components', 'frameworkComponents', 'rowStyle', 'context', 'autoGroupColumnDef', 'localeText', 'icons',
    'datasource', 'serverSideDatasource', 'viewportDatasource', 'groupRowRendererParams', 'aggFuncs', 'fullWidthCellRendererParams',
    'defaultColGroupDef', 'defaultColDef', 'defaultExportParams', 'defaultCsvExportParams', 'defaultExcelExportParams', 'columnTypes',
    'rowClassRules', 'detailCellRendererParams', 'loadingCellRendererParams', 'loadingOverlayComponentParams',
    'noRowsOverlayComponentParams', 'popupParent', 'statusBar', 'sideBar', 'chartThemeOverrides',
    'customChartThemes', 'chartToolPanelsDef'
];
PropertyKeys.ARRAY_PROPERTIES = [
    'sortingOrder', 'alignedGrids', 'rowData', 'columnDefs', 'excelStyles', 'pinnedTopRowData', 'pinnedBottomRowData', 'chartThemes', 'rowClass'
];
PropertyKeys.NUMBER_PROPERTIES = [
    'rowHeight', 'detailRowHeight', 'rowBuffer', 'colWidth', 'headerHeight', 'groupHeaderHeight', 'floatingFiltersHeight',
    'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupDefaultExpanded', 'minColWidth', 'maxColWidth', 'viewportRowModelPageSize',
    'viewportRowModelBufferSize', 'autoSizePadding', 'maxBlocksInCache', 'maxConcurrentDatasourceRequests', 'tooltipShowDelay',
    'tooltipHideDelay', 'cacheOverflowSize', 'paginationPageSize', 'cacheBlockSize', 'infiniteInitialRowCount', 'serverSideInitialRowCount', 'scrollbarWidth',
    'batchUpdateWaitMillis', 'asyncTransactionWaitMillis', 'blockLoadDebounceMillis', 'keepDetailRowsCount',
    'undoRedoCellEditingLimit', 'cellFlashDelay', 'cellFadeDelay', 'tabIndex'
];
PropertyKeys.BOOLEAN_PROPERTIES = [
    'suppressMakeColumnVisibleAfterUnGroup', 'suppressRowClickSelection', 'suppressCellSelection', 'suppressCellFocus', 'suppressHorizontalScroll',
    'alwaysShowHorizontalScroll', 'alwaysShowVerticalScroll', 'debug', 'enableBrowserTooltips', 'enableCellExpressions',
    'angularCompileRows', 'angularCompileFilters', 'groupSuppressAutoColumn', 'groupSelectsChildren', 'groupIncludeFooter',
    'groupIncludeTotalFooter', 'groupUseEntireRow', 'groupSuppressBlankHeader', 'suppressMenuHide', 'suppressRowDeselection',
    'unSortIcon', 'suppressMultiSort', 'alwaysMultiSort', 'singleClickEdit', 'suppressLoadingOverlay', 'suppressNoRowsOverlay', 'suppressAutoSize',
    'skipHeaderOnAutoSize', 'suppressParentsInRowNodes', 'suppressColumnMoveAnimation', 'suppressMovableColumns',
    'suppressFieldDotNotation', 'enableRangeSelection', 'enableRangeHandle', 'enableFillHandle', 'suppressClearOnFillReduction',
    'deltaSort', 'suppressTouch', 'suppressAsyncEvents', 'allowContextMenuWithControlKey', 'suppressContextMenu',
    'rememberGroupStateWhenNewData', 'enableCellChangeFlash', 'suppressDragLeaveHidesColumns', 'suppressRowGroupHidesColumns', 'suppressMiddleClickScrolls',
    'suppressPreventDefaultOnMouseWheel', 'suppressCopyRowsToClipboard', 'copyHeadersToClipboard', 'copyGroupHeadersToClipboard',
    'pivotMode', 'suppressAggFuncInHeader', 'suppressColumnVirtualisation', 'suppressAggAtRootLevel', 'suppressFocusAfterRefresh',
    'functionsPassive', 'functionsReadOnly', 'animateRows', 'groupSelectsFiltered', 'groupRemoveSingleChildren',
    'groupRemoveLowestSingleChildren', 'enableRtl', 'suppressClickEdit', 'rowDragEntireRow', 'rowDragManaged', 'suppressRowDrag',
    'suppressMoveWhenRowDragging', 'rowDragMultiRow', 'enableGroupEdit', 'embedFullWidthRows', 'deprecatedEmbedFullWidthRows',
    'suppressPaginationPanel', 'groupHideOpenParents', 'groupMultiAutoColumn', 'pagination',
    'stopEditingWhenGridLosesFocus', 'paginationAutoPageSize', 'suppressScrollOnNewData', 'suppressScrollWhenPopupsAreOpen',
    'purgeClosedRowNodes', 'cacheQuickFilter', 'deltaRowDataMode', 'ensureDomOrder', 'accentedSort', 'suppressChangeDetection',
    'valueCache', 'valueCacheNeverExpires', 'aggregateOnlyChangedColumns', 'suppressAnimationFrame', 'suppressExcelExport',
    'suppressCsvExport', 'treeData', 'masterDetail', 'suppressMultiRangeSelection', 'enterMovesDownAfterEdit', 'enterMovesDown',
    'suppressPropertyNamesCheck', 'rowMultiSelectWithClick', 'suppressEnterpriseResetOnNewColumns',
    'suppressRowHoverHighlight', 'suppressRowTransform', 'suppressClipboardPaste', 'suppressLastEmptyLineOnPaste',
    'suppressSetColumnStateEvents', 'suppressColumnStateEvents', 'enableCharts', 'enableChartToolPanelsButton', 'deltaColumnMode',
    'suppressMaintainUnsortedOrder', 'enableCellTextSelection', 'suppressBrowserResizeObserver', 'suppressMaxRenderedRowRestriction',
    'excludeChildrenWhenTreeDataFiltering', 'tooltipMouseTrack', 'keepDetailRows', 'paginateChildRows', 'preventDefaultOnContextMenu',
    'undoRedoCellEditing', 'allowDragFromColumnsToolPanel', 'immutableData', 'immutableColumns', 'pivotSuppressAutoColumn',
    'suppressExpandablePivotGroups', 'applyColumnDefOrder', 'debounceVerticalScrollbar', 'detailRowAutoHeight',
    'serverSideFilteringAlwaysResets', 'serverSideSortingAlwaysResets', 'serverSideSortAllLevels', 'serverSideFilterAllLevels',
    'serverSideSortOnServer', 'serverSideFilterOnServer', 'suppressAggFilteredOnly', 'showOpenedGroup', 'suppressClipboardApi',
    'suppressModelUpdateAfterUpdateTransaction', 'stopEditingWhenCellsLoseFocus', 'maintainColumnOrder', 'groupMaintainOrder',
    'columnHoverHighlight', 'reactUi', 'suppressReactUi', 'readOnlyEdit', 'suppressRowVirtualisation', 'enableCellEditingOnBackspace',
    'resetRowDataOnUpdate', 'removePivotHeaderRowWhenSingleValueColumn', 'suppressCopySingleCellRanges',
    'groupRowsSticky', 'serverSideInfiniteScroll', 'rowGroupPanelSuppressSort', 'allowShowChangeAfterFilter'
];
/** You do not need to include event callbacks in this list, as they are generated automatically. */
PropertyKeys.FUNCTIONAL_PROPERTIES = [
    'localeTextFunc', 'doesExternalFilterPass', 'groupRowAggNodes', 'isFullWidthCell', 'processSecondaryColDef', 'processSecondaryColGroupDef', 'processPivotResultColDef',
    'processPivotResultColGroupDef', 'getBusinessKeyForNode', 'isRowSelectable', 'postSort', 'defaultGroupSortComparator', 'defaultGroupOrderComparator', 'rowDragText',
    'groupRowInnerRenderer', 'groupRowInnerRendererFramework', 'groupRowRenderer', 'groupRowRendererFramework', 'fullWidthCellRenderer', 'fullWidthCellRendererFramework',
    'loadingCellRenderer', 'loadingCellRendererFramework', 'loadingOverlayComponent', 'loadingOverlayComponentFramework', 'noRowsOverlayComponent', 'noRowsOverlayComponentFramework',
    'detailCellRenderer', 'detailCellRendererFramework'
];
PropertyKeys.CALLBACK_PROPERTIES = [
    'getLocaleText', 'isExternalFilterPresent', 'getRowHeight', 'getRowClass', 'getRowStyle', 'getContextMenuItems', 'getMainMenuItems',
    'processRowPostCreate', 'processCellForClipboard', 'getGroupRowAgg', 'getRowNodeId', 'isFullWidthRow',
    'sendToClipboard', 'navigateToNextHeader', 'tabToNextHeader', 'navigateToNextCell',
    'tabToNextCell', 'processCellFromClipboard', 'getDocument', 'postProcessPopup', 'getChildCount', 'getDataPath', 'isRowMaster', 'postSortRows', 'processHeaderForClipboard',
    'processGroupHeaderForClipboard', 'paginationNumberFormatter', 'processDataFromClipboard', 'getServerSideGroupKey', 'isServerSideGroup', 'suppressKeyboardEvent',
    'createChartContainer', 'getChartToolbarItems', 'fillOperation', 'isApplyServerSideTransaction', 'getServerSideStoreParams', 'getServerSideGroupLevelParams',
    'isServerSideGroupOpenByDefault', 'isGroupOpenByDefault', 'initialGroupOrderComparator',
    'loadingCellRendererSelector', 'getRowId', 'groupAggFiltering'
];
PropertyKeys.FUNCTION_PROPERTIES = [
    ...PropertyKeys.FUNCTIONAL_PROPERTIES,
    ...PropertyKeys.CALLBACK_PROPERTIES
];
PropertyKeys.ALL_PROPERTIES = [
    ...PropertyKeys.ARRAY_PROPERTIES,
    ...PropertyKeys.OBJECT_PROPERTIES,
    ...PropertyKeys.STRING_PROPERTIES,
    ...PropertyKeys.NUMBER_PROPERTIES,
    ...PropertyKeys.FUNCTION_PROPERTIES,
    ...PropertyKeys.BOOLEAN_PROPERTIES
];
/**
 * Used when performing property checks. This avoids noise caused when using frameworks, which can add their own
 * framework-specific properties to colDefs, gridOptions etc.
 */
PropertyKeys.FRAMEWORK_PROPERTIES = [
    '__ob__', '__v_skip', '__metadata__', 'mappedColumnProperties', 'hasChildColumns', 'toColDef', 'createColDefFromGridColumn'
];
