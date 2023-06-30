/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v30.0.3
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
    'rowSelection', 'overlayLoadingTemplate', 'overlayNoRowsTemplate', 'gridId',
    'quickFilterText', 'rowModelType', 'editType', 'domLayout', 'clipboardDelimiter', 'rowGroupPanelShow',
    'multiSortKey', 'pivotColumnGroupTotals', 'pivotRowTotals', 'pivotPanelShow', 'fillHandleDirection',
    'serverSideStoreType', 'groupDisplayType', 'treeDataDisplayType', 'colResizeDefault'
];
PropertyKeys.OBJECT_PROPERTIES = [
    'components', 'rowStyle', 'context', 'autoGroupColumnDef', 'localeText', 'icons',
    'datasource', 'serverSideDatasource', 'viewportDatasource', 'groupRowRendererParams', 'aggFuncs', 'fullWidthCellRendererParams',
    'defaultColGroupDef', 'defaultColDef', 'defaultCsvExportParams', 'defaultExcelExportParams', 'columnTypes',
    'rowClassRules', 'detailCellRendererParams', 'loadingCellRendererParams', 'loadingOverlayComponentParams',
    'noRowsOverlayComponentParams', 'popupParent', 'statusBar', 'sideBar', 'chartThemeOverrides',
    'customChartThemes', 'chartToolPanelsDef', 'dataTypeDefinitions'
];
PropertyKeys.ARRAY_PROPERTIES = [
    'sortingOrder', 'alignedGrids', 'rowData', 'columnDefs', 'excelStyles', 'pinnedTopRowData', 'pinnedBottomRowData', 'chartThemes', 'rowClass'
];
PropertyKeys.NUMBER_PROPERTIES = [
    'rowHeight', 'detailRowHeight', 'rowBuffer', 'headerHeight', 'groupHeaderHeight', 'floatingFiltersHeight',
    'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupDefaultExpanded', 'viewportRowModelPageSize',
    'viewportRowModelBufferSize', 'autoSizePadding', 'maxBlocksInCache', 'maxConcurrentDatasourceRequests', 'tooltipShowDelay',
    'tooltipHideDelay', 'cacheOverflowSize', 'paginationPageSize', 'cacheBlockSize', 'infiniteInitialRowCount', 'serverSideInitialRowCount', 'scrollbarWidth',
    'asyncTransactionWaitMillis', 'blockLoadDebounceMillis', 'keepDetailRowsCount',
    'undoRedoCellEditingLimit', 'cellFlashDelay', 'cellFadeDelay', 'tabIndex'
];
PropertyKeys.BOOLEAN_PROPERTIES = [
    'suppressMakeColumnVisibleAfterUnGroup', 'suppressRowClickSelection', 'suppressCellFocus', 'suppressHorizontalScroll',
    'alwaysShowHorizontalScroll', 'alwaysShowVerticalScroll', 'debug', 'enableBrowserTooltips', 'enableCellExpressions', 'groupSelectsChildren',
    'groupIncludeFooter', 'groupIncludeTotalFooter', 'groupSuppressBlankHeader', 'suppressMenuHide', 'suppressRowDeselection', 'unSortIcon',
    'suppressMultiSort', 'alwaysMultiSort', 'singleClickEdit', 'suppressLoadingOverlay', 'suppressNoRowsOverlay', 'suppressAutoSize',
    'skipHeaderOnAutoSize', 'suppressParentsInRowNodes', 'suppressColumnMoveAnimation', 'suppressMovableColumns', 'suppressFieldDotNotation',
    'enableRangeSelection', 'enableRangeHandle', 'enableFillHandle', 'suppressClearOnFillReduction', 'deltaSort', 'suppressTouch', 'suppressAsyncEvents',
    'allowContextMenuWithControlKey', 'suppressContextMenu', 'rememberGroupStateWhenNewData', 'enableCellChangeFlash', 'suppressDragLeaveHidesColumns',
    'suppressRowGroupHidesColumns', 'suppressMiddleClickScrolls', 'suppressPreventDefaultOnMouseWheel', 'suppressCopyRowsToClipboard', 'copyHeadersToClipboard',
    'copyGroupHeadersToClipboard', 'pivotMode', 'suppressAggFuncInHeader', 'suppressColumnVirtualisation', 'alwaysAggregateAtRootLevel', 'suppressAggAtRootLevel', 'suppressFocusAfterRefresh',
    'functionsPassive', 'functionsReadOnly', 'animateRows', 'groupSelectsFiltered', 'groupRemoveSingleChildren', 'groupRemoveLowestSingleChildren', 'enableRtl',
    'suppressClickEdit', 'rowDragEntireRow', 'rowDragManaged', 'suppressRowDrag', 'suppressMoveWhenRowDragging', 'rowDragMultiRow', 'enableGroupEdit',
    'embedFullWidthRows', 'suppressPaginationPanel', 'groupHideOpenParents', 'groupAllowUnbalanced', 'pagination', 'paginationAutoPageSize', 'suppressScrollOnNewData',
    'suppressScrollWhenPopupsAreOpen', 'purgeClosedRowNodes', 'cacheQuickFilter', 'includeHiddenColumnsInQuickFilter', 'excludeHiddenColumnsFromQuickFilter', 'ensureDomOrder', 'accentedSort', 'suppressChangeDetection',
    'valueCache', 'valueCacheNeverExpires', 'aggregateOnlyChangedColumns', 'suppressAnimationFrame', 'suppressExcelExport', 'suppressCsvExport', 'treeData', 'masterDetail',
    'suppressMultiRangeSelection', 'enterMovesDown', 'enterMovesDownAfterEdit', 'enterNavigatesVerticallyAfterEdit', 'enterNavigatesVertically', 'suppressPropertyNamesCheck', 'rowMultiSelectWithClick', 'suppressRowHoverHighlight',
    'suppressRowTransform', 'suppressClipboardPaste', 'suppressLastEmptyLineOnPaste', 'enableCharts', 'enableChartToolPanelsButton', 'suppressChartToolPanelsButton',
    'suppressMaintainUnsortedOrder', 'enableCellTextSelection', 'suppressBrowserResizeObserver', 'suppressMaxRenderedRowRestriction', 'excludeChildrenWhenTreeDataFiltering',
    'tooltipMouseTrack', 'keepDetailRows', 'paginateChildRows', 'preventDefaultOnContextMenu', 'undoRedoCellEditing', 'allowDragFromColumnsToolPanel',
    'pivotSuppressAutoColumn', 'suppressExpandablePivotGroups', 'debounceVerticalScrollbar', 'detailRowAutoHeight', 'serverSideFilteringAlwaysResets', 'serverSideFilterAllLevels',
    'serverSideSortingAlwaysResets', 'serverSideSortAllLevels', 'serverSideOnlyRefreshFilteredGroups', 'serverSideSortOnServer', 'serverSideFilterOnServer', 'suppressAggFilteredOnly',
    'showOpenedGroup', 'suppressClipboardApi', 'suppressModelUpdateAfterUpdateTransaction', 'stopEditingWhenCellsLoseFocus', 'maintainColumnOrder', 'groupMaintainOrder',
    'columnHoverHighlight', 'suppressReactUi', 'readOnlyEdit', 'suppressRowVirtualisation', 'enableCellEditingOnBackspace', 'resetRowDataOnUpdate',
    'removePivotHeaderRowWhenSingleValueColumn', 'suppressCopySingleCellRanges', 'suppressGroupRowsSticky', 'suppressServerSideInfiniteScroll', 'rowGroupPanelSuppressSort',
    'allowShowChangeAfterFilter', 'suppressCutToClipboard'
];
/** You do not need to include event callbacks in this list, as they are generated automatically. */
PropertyKeys.FUNCTIONAL_PROPERTIES = [
    'doesExternalFilterPass', 'processSecondaryColDef', 'processSecondaryColGroupDef', 'processPivotResultColDef',
    'processPivotResultColGroupDef', 'getBusinessKeyForNode', 'isRowSelectable', 'rowDragText',
    'groupRowRenderer', 'fullWidthCellRenderer',
    'loadingCellRenderer', 'loadingOverlayComponent', 'noRowsOverlayComponent',
    'detailCellRenderer'
];
PropertyKeys.CALLBACK_PROPERTIES = [
    'getLocaleText', 'isExternalFilterPresent', 'getRowHeight', 'getRowClass', 'getRowStyle', 'getContextMenuItems', 'getMainMenuItems',
    'processRowPostCreate', 'processCellForClipboard', 'getGroupRowAgg', 'isFullWidthRow',
    'sendToClipboard', 'navigateToNextHeader', 'tabToNextHeader', 'navigateToNextCell',
    'tabToNextCell', 'processCellFromClipboard', 'getDocument', 'postProcessPopup', 'getChildCount', 'getDataPath', 'isRowMaster', 'postSortRows', 'processHeaderForClipboard',
    'processGroupHeaderForClipboard', 'paginationNumberFormatter', 'processDataFromClipboard', 'getServerSideGroupKey', 'isServerSideGroup',
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
