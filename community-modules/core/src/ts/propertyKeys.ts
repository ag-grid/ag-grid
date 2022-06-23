/**
 * These keys are used for validating properties supplied on a gridOptions object, and for code generation.
 * If you change the properties on the gridOptions interface, you *must* update this file as well to be consistent.
 */
export class PropertyKeys {
    public static STRING_PROPERTIES = [
        'sortingOrder', 'rowClass', 'rowSelection', 'overlayLoadingTemplate', 'overlayNoRowsTemplate',
        'quickFilterText', 'rowModelType', 'editType', 'domLayout', 'clipboardDelimiter', 'rowGroupPanelShow',
        'multiSortKey', 'pivotColumnGroupTotals', 'pivotRowTotals', 'pivotPanelShow', 'fillHandleDirection',
        'serverSideStoreType', 'groupDisplayType', 'treeDataDisplayType'
    ];

    public static OBJECT_PROPERTIES = [
        'components', 'frameworkComponents', 'rowStyle', 'context', 'autoGroupColumnDef', 'localeText', 'icons',
        'datasource', 'serverSideDatasource', 'viewportDatasource', 'groupRowRendererParams', 'aggFuncs', 'fullWidthCellRendererParams',
        'defaultColGroupDef', 'defaultColDef', 'defaultExportParams', 'defaultCsvExportParams', 'defaultExcelExportParams', 'columnTypes',
        'rowClassRules', 'detailCellRendererParams', 'loadingCellRendererParams', 'loadingOverlayComponentParams',
        'noRowsOverlayComponentParams', 'popupParent', 'colResizeDefault', 'statusBar', 'sideBar', 'chartThemeOverrides',
        'customChartThemes'
    ];

    public static ARRAY_PROPERTIES = [
        'alignedGrids', 'rowData', 'columnDefs', 'excelStyles', 'pinnedTopRowData', 'pinnedBottomRowData', 'chartThemes'
    ];

    public static NUMBER_PROPERTIES = [
        'rowHeight', 'detailRowHeight', 'rowBuffer', 'colWidth', 'headerHeight', 'groupHeaderHeight', 'floatingFiltersHeight',
        'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupDefaultExpanded', 'minColWidth', 'maxColWidth', 'viewportRowModelPageSize',
        'viewportRowModelBufferSize', 'autoSizePadding', 'maxBlocksInCache', 'maxConcurrentDatasourceRequests', 'tooltipShowDelay',
        'tooltipHideDelay', 'cacheOverflowSize', 'paginationPageSize', 'cacheBlockSize', 'infiniteInitialRowCount', 'scrollbarWidth',
        'batchUpdateWaitMillis', 'asyncTransactionWaitMillis', 'blockLoadDebounceMillis', 'keepDetailRowsCount',
        'undoRedoCellEditingLimit', 'cellFlashDelay', 'cellFadeDelay', 'tabIndex'
    ];

    public static BOOLEAN_PROPERTIES = [
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
        'suppressSetColumnStateEvents', 'suppressColumnStateEvents', 'enableCharts', 'deltaColumnMode',
        'suppressMaintainUnsortedOrder', 'enableCellTextSelection', 'suppressBrowserResizeObserver', 'suppressMaxRenderedRowRestriction',
        'excludeChildrenWhenTreeDataFiltering', 'tooltipMouseTrack', 'keepDetailRows', 'paginateChildRows', 'preventDefaultOnContextMenu',
        'undoRedoCellEditing', 'allowDragFromColumnsToolPanel', 'immutableData', 'immutableColumns', 'pivotSuppressAutoColumn',
        'suppressExpandablePivotGroups', 'applyColumnDefOrder', 'debounceVerticalScrollbar', 'detailRowAutoHeight',
        'serverSideFilteringAlwaysResets', 'serverSideSortingAlwaysResets', 'serverSideSortAllLevels', 'serverSideFilterAllLevels',
        'serverSideSortOnServer', 'serverSideFilterOnServer', 'suppressAggFilteredOnly', 'showOpenedGroup', 'suppressClipboardApi',
        'suppressModelUpdateAfterUpdateTransaction', 'stopEditingWhenCellsLoseFocus', 'maintainColumnOrder', 'groupMaintainOrder',
        'columnHoverHighlight', 'reactUi', 'suppressReactUi', 'readOnlyEdit', 'suppressRowVirtualisation',
        'resetRowDataOnUpdate', 'removePivotHeaderRowWhenSingleValueColumn', 'suppressCopySingleCellRanges',
        'groupRowsSticky', 'serverSideInfiniteScroll'
    ];

    /** You do not need to include event callbacks in this list, as they are generated automatically. */
    public static FUNCTION_PROPERTIES = [
        'localeTextFunc', 'getLocaleText', 'groupRowInnerRenderer', 'groupRowInnerRendererFramework',
        'groupRowRenderer', 'groupRowRendererFramework', 'isExternalFilterPresent', 'getRowHeight', 'doesExternalFilterPass',
        'getRowClass', 'getRowStyle', 'getContextMenuItems', 'getMainMenuItems', 'processRowPostCreate', 'processCellForClipboard',
        'groupRowAggNodes', 'getGroupRowAgg', 'getRowNodeId', 'isFullWidthCell', 'isFullWidthRow', 'fullWidthCellRenderer', 'fullWidthCellRendererFramework',
        'processSecondaryColDef', 'processSecondaryColGroupDef', 'processPivotResultColDef', 'processPivotResultColGroupDef',
        'getBusinessKeyForNode', 'sendToClipboard', 'navigateToNextHeader',
        'tabToNextHeader', 'navigateToNextCell', 'tabToNextCell', 'processCellFromClipboard', 'getDocument', 'postProcessPopup',
        'getChildCount', 'getDataPath', 'loadingCellRenderer', 'loadingCellRendererFramework', 'loadingOverlayComponent',
        'loadingOverlayComponentFramework', 'noRowsOverlayComponent', 'noRowsOverlayComponentFramework', 'detailCellRenderer',
        'detailCellRendererFramework', 'isRowMaster', 'isRowSelectable', 'postSort', 'postSortRows', 'processHeaderForClipboard', 'processGroupHeaderForClipboard',
        'paginationNumberFormatter', 'processDataFromClipboard', 'getServerSideGroupKey', 'isServerSideGroup', 'suppressKeyboardEvent',
        'createChartContainer', 'getChartToolbarItems', 'fillOperation', 'isApplyServerSideTransaction', 'getServerSideStoreParams',
        'getServerSideGroupLevelParams',
        'isServerSideGroupOpenByDefault', 'isGroupOpenByDefault', 'defaultGroupSortComparator', 'defaultGroupOrderComparator', 'initialGroupOrderComparator',
        'loadingCellRendererSelector', 'getRowId', 'groupAggFiltering'
    ];

    public static ALL_PROPERTIES = [
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
    public static FRAMEWORK_PROPERTIES = [
        '__ob__', '__v_skip', '__metadata__', 'mappedColumnProperties', 'hasChildColumns', 'toColDef', 'createColDefFromGridColumn'
    ];
}
