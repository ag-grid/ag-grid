/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PropertyKeys = /** @class */ (function () {
    function PropertyKeys() {
    }
    PropertyKeys.STRING_PROPERTIES = [
        'sortingOrder', 'rowClass', 'rowSelection', 'overlayLoadingTemplate',
        'overlayNoRowsTemplate', 'quickFilterText', 'rowModelType',
        'editType', 'domLayout', 'clipboardDeliminator', 'rowGroupPanelShow',
        'multiSortKey', 'pivotColumnGroupTotals', 'pivotRowTotals', 'pivotPanelShow'
    ];
    PropertyKeys.OBJECT_PROPERTIES = [
        'components', 'frameworkComponents', 'rowStyle', 'context', 'autoGroupColumnDef', 'groupColumnDef', 'localeText',
        'icons', 'datasource', 'serverSideDatasource', 'viewportDatasource', 'groupRowRendererParams', 'aggFuncs',
        'fullWidthCellRendererParams', 'defaultColGroupDef', 'defaultColDef', 'defaultExportParams', 'columnTypes',
        'rowClassRules', 'detailGridOptions', 'detailCellRendererParams', 'loadingCellRendererParams', 'loadingOverlayComponentParams',
        'noRowsOverlayComponentParams', 'popupParent', 'colResizeDefault', 'reduxStore', 'statusBar', 'sideBar'
    ];
    PropertyKeys.ARRAY_PROPERTIES = [
        'slaveGrids', 'alignedGrids', 'rowData',
        'columnDefs', 'excelStyles', 'pinnedTopRowData', 'pinnedBottomRowData'
        /** @deprecated */
    ];
    PropertyKeys.NUMBER_PROPERTIES = [
        'rowHeight', 'detailRowHeight', 'rowBuffer', 'colWidth', 'headerHeight', 'groupHeaderHeight',
        'floatingFiltersHeight', 'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupDefaultExpanded',
        'minColWidth', 'maxColWidth', 'viewportRowModelPageSize', 'viewportRowModelBufferSize',
        'autoSizePadding', 'maxBlocksInCache', 'maxConcurrentDatasourceRequests',
        'cacheOverflowSize', 'paginationPageSize', 'cacheBlockSize', 'infiniteInitialRowCount',
        'scrollbarWidth', 'paginationStartPage', 'infiniteBlockSize', 'batchUpdateWaitMillis',
        'blockLoadDebounceMillis', 'keepDetailRowsCount'
    ];
    PropertyKeys.BOOLEAN_PROPERTIES = [
        'toolPanelSuppressRowGroups', 'toolPanelSuppressValues', 'toolPanelSuppressPivots', 'toolPanelSuppressPivotMode',
        'toolPanelSuppressSideButtons', 'toolPanelSuppressColumnFilter', 'toolPanelSuppressColumnSelectAll',
        'toolPanelSuppressColumnExpandAll', 'suppressMakeColumnVisibleAfterUnGroup', 'suppressRowClickSelection',
        'suppressCellSelection', 'suppressHorizontalScroll', 'debug', 'enableBrowserTooltips', 'enableColResize',
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
        'keepDetailRows'
    ];
    PropertyKeys.FUNCTION_PROPERTIES = ['localeTextFunc', 'groupRowInnerRenderer', 'groupRowInnerRendererFramework',
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
    PropertyKeys.ALL_PROPERTIES = PropertyKeys.ARRAY_PROPERTIES
        .concat(PropertyKeys.OBJECT_PROPERTIES)
        .concat(PropertyKeys.STRING_PROPERTIES)
        .concat(PropertyKeys.NUMBER_PROPERTIES)
        .concat(PropertyKeys.FUNCTION_PROPERTIES)
        .concat(PropertyKeys.BOOLEAN_PROPERTIES);
    // used when doing property checks - this causes noise when using frameworks which can add their own fw specific
    // properties to colDefs, gridOptions etc
    PropertyKeys.FRAMEWORK_PROPERTIES = ['__ob__', '__metadata__', 'mappedColumnProperties', 'hasChildColumns',
        'toColDef', 'createColDefFromGridColumn'];
    return PropertyKeys;
}());
exports.PropertyKeys = PropertyKeys;
