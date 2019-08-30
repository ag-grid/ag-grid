export class PropertyKeys {
    public static STRING_PROPERTIES = [
        'sortingOrder', 'rowClass', 'rowSelection', 'overlayLoadingTemplate',
        'overlayNoRowsTemplate', 'quickFilterText', 'rowModelType',
        'editType', 'domLayout', 'clipboardDeliminator', 'rowGroupPanelShow',
        'multiSortKey', 'pivotColumnGroupTotals', 'pivotRowTotals', 'pivotPanelShow'];

    public static OBJECT_PROPERTIES = [
        'components', 'frameworkComponents', 'rowStyle', 'context', 'autoGroupColumnDef', 'groupColumnDef', 'localeText',
        'icons', 'datasource', 'serverSideDatasource', 'viewportDatasource', 'groupRowRendererParams', 'aggFuncs',
        'fullWidthCellRendererParams', 'defaultColGroupDef', 'defaultColDef', 'defaultExportParams', 'columnTypes',
        'rowClassRules', 'detailGridOptions', 'detailCellRendererParams', 'loadingCellRendererParams', 'loadingOverlayComponentParams',
        'noRowsOverlayComponentParams', 'popupParent', 'colResizeDefault', 'reduxStore', 'statusBar', 'sideBar'
    ];

    public static ARRAY_PROPERTIES = [
        'slaveGrids', 'alignedGrids', 'rowData',
        'columnDefs', 'excelStyles', 'pinnedTopRowData', 'pinnedBottomRowData'
        /** @deprecated */
    ];

    public static NUMBER_PROPERTIES = [
        'rowHeight', 'detailRowHeight', 'rowBuffer', 'colWidth', 'headerHeight', 'groupHeaderHeight',
        'floatingFiltersHeight', 'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupDefaultExpanded',
        'minColWidth', 'maxColWidth', 'viewportRowModelPageSize', 'viewportRowModelBufferSize',
        'autoSizePadding', 'maxBlocksInCache', 'maxConcurrentDatasourceRequests',
        'cacheOverflowSize', 'paginationPageSize', 'cacheBlockSize', 'infiniteInitialRowCount',
        'scrollbarWidth', 'paginationStartPage', 'infiniteBlockSize', 'batchUpdateWaitMillis',
        'blockLoadDebounceMillis', 'keepDetailRowsCount'
    ];

    public static BOOLEAN_PROPERTIES = [
        'toolPanelSuppressRowGroups', 'toolPanelSuppressValues', 'toolPanelSuppressPivots', 'toolPanelSuppressPivotMode',
        'toolPanelSuppressSideButtons', 'toolPanelSuppressColumnFilter', 'toolPanelSuppressColumnSelectAll',
        'toolPanelSuppressColumnExpandAll', 'suppressMakeColumnVisibleAfterUnGroup', 'suppressRowClickSelection',
        'suppressCellSelection', 'suppressHorizontalScroll', 'alwaysShowVerticalScroll', 'debug', 'enableBrowserTooltips', 'enableColResize',
        'enableCellExpressions', 'enableSorting', 'enableServerSideSorting', 'enableFilter', 'enableServerSideFilter',
        'angularCompileRows', 'angularCompileFilters', 'angularCompileHeaders', 'groupSuppressAutoColumn', 'groupSelectsChildren',
        'groupIncludeFooter', 'groupIncludeTotalFooter', 'groupUseEntireRow', 'groupSuppressRow', 'groupSuppressBlankHeader',
        'forPrint', 'suppressMenuHide', 'rowDeselection', 'unSortIcon', 'suppressMultiSort', 'singleClickEdit',
        'suppressLoadingOverlay', 'suppressNoRowsOverlay', 'suppressAutoSize', 'suppressParentsInRowNodes', 'showToolPanel',
        'suppressColumnMoveAnimation', 'suppressMovableColumns', 'suppressFieldDotNotation', 'enableRangeSelection',
        'enableRangeHandle', 'enableFillHandle', 'deltaSort', 'suppressTouch', 'suppressAsyncEvents', 'allowContextMenuWithControlKey',
        'suppressContextMenu', 'suppressMenuFilterPanel', 'suppressMenuMainPanel', 'suppressMenuColumnPanel', 'rememberGroupStateWhenNewData',
        'enableCellChangeFlash', 'suppressDragLeaveHidesColumns', 'suppressMiddleClickScrolls', 'suppressPreventDefaultOnMouseWheel',
        'suppressUseColIdForGroups', 'suppressCopyRowsToClipboard', 'copyHeadersToClipboard', 'pivotMode', 'suppressAggFuncInHeader',
        'suppressColumnVirtualisation', 'suppressAggAtRootLevel', 'suppressFocusAfterRefresh', 'functionsPassive', 'functionsReadOnly',
        'animateRows', 'groupSelectsFiltered', 'groupRemoveSingleChildren', 'groupRemoveLowestSingleChildren', 'enableRtl',
        'suppressClickEdit', 'rowDragManaged', 'suppressRowDrag', 'enableGroupEdit', 'embedFullWidthRows', 'deprecatedEmbedFullWidthRows',
        'suppressTabbing', 'suppressPaginationPanel', 'floatingFilter', 'groupHideOpenParents', 'groupMultiAutoColumn', 'pagination',
        'stopEditingWhenGridLosesFocus', 'paginationAutoPageSize', 'suppressScrollOnNewData', 'purgeClosedRowNodes', 'cacheQuickFilter',
        'deltaRowDataMode', 'ensureDomOrder', 'accentedSort', 'pivotTotals', 'suppressChangeDetection', 'valueCache', 'valueCacheNeverExpires',
        'aggregateOnlyChangedColumns', 'suppressAnimationFrame', 'suppressExcelExport', 'suppressCsvExport', 'treeData', 'masterDetail',
        'suppressMultiRangeSelection', 'enterMovesDownAfterEdit', 'enterMovesDown', 'suppressPropertyNamesCheck', 'rowMultiSelectWithClick',
        'contractColumnSelection', 'suppressEnterpriseResetOnNewColumns', 'enableOldSetFilterModel', 'suppressRowHoverHighlight',
        'gridAutoHeight', 'suppressRowTransform', 'suppressClipboardPaste', 'serverSideSortingAlwaysResets', 'reactNext',
        'suppressSetColumnStateEvents', 'enableCharts', 'deltaColumnMode', 'suppressMaintainUnsortedOrder', 'enableCellTextSelection',
        'suppressBrowserResizeObserver', 'suppressMaxRenderedRowRestriction', 'excludeChildrenWhenTreeDataFiltering',
        'keepDetailRows', 'paginateChildRows', 'preventDefaultOnContextMenu'
    ];

    public static FUNCTION_PROPERTIES = ['localeTextFunc', 'groupRowInnerRenderer', 'groupRowInnerRendererFramework',
        'dateComponent', 'dateComponentFramework', 'groupRowRenderer', 'groupRowRendererFramework', 'isExternalFilterPresent',
        'getRowHeight', 'doesExternalFilterPass', 'getRowClass', 'getRowStyle', 'getRowClassRules',
        'traverseNode', 'getContextMenuItems', 'getMainMenuItems', 'processRowPostCreate', 'processCellForClipboard',
        'getNodeChildDetails', 'groupRowAggNodes', 'getRowNodeId', 'isFullWidthCell', 'fullWidthCellRenderer',
        'fullWidthCellRendererFramework', 'doesDataFlower', 'processSecondaryColDef', 'processSecondaryColGroupDef',
        'getBusinessKeyForNode', 'sendToClipboard', 'navigateToNextCell', 'tabToNextCell', 'getDetailRowData',
        'processCellFromClipboard', 'getDocument', 'postProcessPopup', 'getChildCount', 'getDataPath', 'loadingCellRenderer',
        'loadingCellRendererFramework', 'loadingOverlayComponent', 'loadingOverlayComponentFramework', 'noRowsOverlayComponent',
        'noRowsOverlayComponentFramework', 'detailCellRenderer', 'detailCellRendererFramework', 'onGridReady',
        'defaultGroupSortComparator', 'isRowMaster', 'isRowSelectable', 'postSort', 'processHeaderForClipboard',
        'paginationNumberFormatter', 'processDataFromClipboard', 'getServerSideGroupKey', 'isServerSideGroup',
        'suppressKeyboardEvent', 'createChartContainer', 'processChartOptions', 'getChartToolbarItems'];

    public static ALL_PROPERTIES = PropertyKeys.ARRAY_PROPERTIES
        .concat(PropertyKeys.OBJECT_PROPERTIES)
        .concat(PropertyKeys.STRING_PROPERTIES)
        .concat(PropertyKeys.NUMBER_PROPERTIES)
        .concat(PropertyKeys.FUNCTION_PROPERTIES)
        .concat(PropertyKeys.BOOLEAN_PROPERTIES);

    // used when doing property checks - this causes noise when using frameworks which can add their own fw specific
    // properties to colDefs, gridOptions etc
    public static FRAMEWORK_PROPERTIES = ['__ob__', '__metadata__', 'mappedColumnProperties', 'hasChildColumns',
        'toColDef', 'createColDefFromGridColumn'];
}
