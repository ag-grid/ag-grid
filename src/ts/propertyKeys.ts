export class PropertyKeys {
    public static STRING_PROPERTIES = [
        'sortingOrder', 'rowClass', 'rowSelection', 'overlayLoadingTemplate',
        'overlayNoRowsTemplate', 'quickFilterText', 'rowModelType',
        'editType', 'domLayout', 'clipboardDeliminator', 'rowGroupPanelShow'];

    public static OBJECT_PROPERTIES = [
        'components', 'frameworkComponents', 'rowStyle', 'context', 'autoGroupColumnDef', 'groupColumnDef', 'localeText',
        'icons', 'datasource', 'enterpriseDatasource', 'viewportDatasource', 'groupRowRendererParams', 'aggFuncs',
        'fullWidthCellRendererParams', 'defaultColGroupDef', 'defaultColDef', 'defaultExportParams', 'columnTypes',
        'rowClassRules', 'detailGridOptions', 'detailCellRendererParams', 'loadingOverlayComponentParams',
        'noRowsOverlayComponentParams', 'popupParent'
        //,'cellRenderers','cellEditors'
    ];

    public static ARRAY_PROPERTIES = [
        'slaveGrids', 'alignedGrids', 'rowData',
        'columnDefs', 'excelStyles', 'pinnedTopRowData', 'pinnedBottomRowData'
        // deprecated
    ];

    public static NUMBER_PROPERTIES = [
        'rowHeight', 'detailRowHeight','rowBuffer', 'colWidth', 'headerHeight', 'groupHeaderHeight',
        'floatingFiltersHeight', 'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupDefaultExpanded',
        'minColWidth', 'maxColWidth', 'viewportRowModelPageSize', 'viewportRowModelBufferSize',
        'layoutInterval', 'autoSizePadding', 'maxBlocksInCache', 'maxConcurrentDatasourceRequests',
        'cacheOverflowSize', 'paginationPageSize', 'cacheBlockSize', 'infiniteInitialRowCount',
        'scrollbarWidth', 'paginationStartPage','infiniteBlockSize'
    ];

    public static BOOLEAN_PROPERTIES = [
        'toolPanelSuppressRowGroups', 'toolPanelSuppressValues', 'toolPanelSuppressPivots', 'toolPanelSuppressPivotMode',
        'suppressRowClickSelection', 'suppressCellSelection', 'suppressHorizontalScroll', 'debug',
        'enableColResize', 'enableCellExpressions', 'enableSorting', 'enableServerSideSorting',
        'enableFilter', 'enableServerSideFilter', 'angularCompileRows', 'angularCompileFilters',
        'angularCompileHeaders', 'groupSuppressAutoColumn', 'groupSelectsChildren',
        'groupIncludeFooter', 'groupUseEntireRow', 'groupSuppressRow', 'groupSuppressBlankHeader', 'forPrint',
        'suppressMenuHide', 'rowDeselection', 'unSortIcon', 'suppressMultiSort',
        'singleClickEdit', 'suppressLoadingOverlay', 'suppressNoRowsOverlay', 'suppressAutoSize',
        'suppressParentsInRowNodes', 'showToolPanel', 'suppressColumnMoveAnimation', 'suppressMovableColumns',
        'suppressFieldDotNotation', 'enableRangeSelection',
        'pivotPanelShow', 'suppressTouch', 'suppressAsyncEvents', 'allowContextMenuWithControlKey',
        'suppressContextMenu', 'suppressMenuFilterPanel', 'suppressMenuMainPanel', 'suppressMenuColumnPanel',
        'enableStatusBar', 'alwaysShowStatusBar', 'rememberGroupStateWhenNewData', 'enableCellChangeFlash', 'suppressDragLeaveHidesColumns',
        'suppressMiddleClickScrolls', 'suppressPreventDefaultOnMouseWheel', 'suppressUseColIdForGroups',
        'suppressCopyRowsToClipboard', 'pivotMode', 'suppressAggFuncInHeader', 'suppressColumnVirtualisation', 'suppressAggAtRootLevel',
        'suppressFocusAfterRefresh', 'functionsPassive', 'functionsReadOnly',
        'animateRows', 'groupSelectsFiltered', 'groupRemoveSingleChildren', 'groupRemoveLowestSingleChildren',
        'enableRtl', 'suppressClickEdit', 'rowDragManaged', 'suppressRowDrag',
        'enableGroupEdit', 'embedFullWidthRows', 'suppressTabbing', 'suppressPaginationPanel', 'floatingFilter',
        'groupHideOpenParents', 'groupMultiAutoColumn', 'pagination', 'stopEditingWhenGridLosesFocus',
        'paginationAutoPageSize', 'suppressScrollOnNewData', 'purgeClosedRowNodes', 'cacheQuickFilter',
        'deltaRowDataMode', 'ensureDomOrder', 'accentedSort', 'pivotTotals', 'suppressChangeDetection',
        'valueCache', 'valueCacheNeverExpires', 'aggregateOnlyChangedColumns', 'suppressAnimationFrame',
        'suppressExcelExport', 'suppressCsvExport', 'treeData', 'masterDetail', 'isRowMaster',
        'suppressMultiRangeSelection', 'enterMovesDownAfterEdit'
    ];

    public static FUNCTION_PROPERTIES = ['localeTextFunc', 'groupRowInnerRenderer', 'groupRowInnerRendererFramework',
        'dateComponent', 'dateComponentFramework', 'groupRowRenderer', 'groupRowRendererFramework', 'isExternalFilterPresent',
        'getRowHeight', 'doesExternalFilterPass', 'getRowClass', 'getRowStyle', 'getRowClassRules',
        'traverseNode', 'getContextMenuItems', 'getMainMenuItems', 'processRowPostCreate', 'processCellForClipboard',
        'getNodeChildDetails', 'groupRowAggNodes', 'getRowNodeId', 'isFullWidthCell', 'fullWidthCellRenderer',
        'fullWidthCellRendererFramework', 'doesDataFlower', 'processSecondaryColDef', 'processSecondaryColGroupDef',
        'getBusinessKeyForNode', 'sendToClipboard', 'navigateToNextCell', 'tabToNextCell', 'getDetailRowData',
       'processCellFromClipboard', 'getDocument', 'postProcessPopup', 'getChildCount', 'getDataPath', 'loadingOverlayComponent',
        'loadingOverlayComponentFramework', 'noRowsOverlayComponent', 'noRowsOverlayComponentFramework', 'detailCellRenderer', 'detailCellRendererFramework'];

     public static ALL_PROPERTIES = PropertyKeys.ARRAY_PROPERTIES
        .concat(PropertyKeys.OBJECT_PROPERTIES)
        .concat(PropertyKeys.STRING_PROPERTIES)
        .concat(PropertyKeys.NUMBER_PROPERTIES)
        .concat(PropertyKeys.FUNCTION_PROPERTIES)
        .concat(PropertyKeys.BOOLEAN_PROPERTIES);
}
