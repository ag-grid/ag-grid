/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * These keys are used for validating properties supplied on a gridOptions object, and for code generation.
 * If you change the properties on the gridOptions interface, you *must* update this file as well to be consistent.
 */
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
        'slaveGrids', 'alignedGrids', 'rowData', 'columnDefs', 'excelStyles', 'pinnedTopRowData', 'pinnedBottomRowData'
    ];
    PropertyKeys.NUMBER_PROPERTIES = [
        'rowHeight', 'detailRowHeight', 'rowBuffer', 'colWidth', 'headerHeight', 'groupHeaderHeight',
        'floatingFiltersHeight', 'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupDefaultExpanded',
        'minColWidth', 'maxColWidth', 'viewportRowModelPageSize', 'viewportRowModelBufferSize',
        'autoSizePadding', 'maxBlocksInCache', 'maxConcurrentDatasourceRequests', 'tooltipShowDelay',
        'cacheOverflowSize', 'paginationPageSize', 'cacheBlockSize', 'infiniteInitialRowCount',
        'scrollbarWidth', 'paginationStartPage', 'infiniteBlockSize', 'batchUpdateWaitMillis',
        'blockLoadDebounceMillis', 'keepDetailRowsCount', 'undoRedoCellEditingLimit'
    ];
    PropertyKeys.BOOLEAN_PROPERTIES = [
        'toolPanelSuppressRowGroups', 'toolPanelSuppressValues', 'toolPanelSuppressPivots', 'toolPanelSuppressPivotMode',
        'toolPanelSuppressSideButtons', 'toolPanelSuppressColumnFilter', 'toolPanelSuppressColumnSelectAll',
        'toolPanelSuppressColumnExpandAll', 'suppressMakeColumnVisibleAfterUnGroup', 'suppressRowClickSelection',
        'suppressCellSelection', 'suppressHorizontalScroll', 'alwaysShowVerticalScroll', 'debug', 'enableBrowserTooltips', 'enableColResize',
        'enableCellExpressions', 'enableSorting', 'enableServerSideSorting', 'enableFilter', 'enableServerSideFilter',
        'angularCompileRows', 'angularCompileFilters', 'angularCompileHeaders', 'groupSuppressAutoColumn', 'groupSelectsChildren',
        'groupIncludeFooter', 'groupIncludeTotalFooter', 'groupUseEntireRow', 'groupSuppressRow', 'groupSuppressBlankHeader',
        'forPrint', 'suppressMenuHide', 'rowDeselection', 'unSortIcon', 'suppressMultiSort', 'singleClickEdit',
        'suppressLoadingOverlay', 'suppressNoRowsOverlay', 'suppressAutoSize', 'skipHeaderOnAutoSize', 'suppressParentsInRowNodes', 'showToolPanel',
        'suppressColumnMoveAnimation', 'suppressMovableColumns', 'suppressFieldDotNotation', 'enableRangeSelection',
        'enableRangeHandle', 'enableFillHandle', 'suppressClearOnFillReduction', 'deltaSort', 'suppressTouch', 'suppressAsyncEvents',
        'allowContextMenuWithControlKey', 'suppressContextMenu', 'suppressMenuFilterPanel', 'suppressMenuMainPanel', 'suppressMenuColumnPanel',
        'rememberGroupStateWhenNewData', 'enableCellChangeFlash', 'suppressDragLeaveHidesColumns', 'suppressMiddleClickScrolls',
        'suppressPreventDefaultOnMouseWheel', 'suppressUseColIdForGroups', 'suppressCopyRowsToClipboard', 'copyHeadersToClipboard', 'pivotMode',
        'suppressAggFuncInHeader', 'suppressColumnVirtualisation', 'suppressAggAtRootLevel', 'suppressFocusAfterRefresh', 'functionsPassive',
        'functionsReadOnly', 'animateRows', 'groupSelectsFiltered', 'groupRemoveSingleChildren', 'groupRemoveLowestSingleChildren', 'enableRtl',
        'suppressClickEdit', 'rowDragManaged', 'suppressRowDrag', 'suppressMoveWhenRowDragging', 'enableMultiRowDragging', 'enableGroupEdit',
        'embedFullWidthRows', 'deprecatedEmbedFullWidthRows', 'suppressTabbing', 'suppressPaginationPanel', 'floatingFilter', 'groupHideOpenParents',
        'groupMultiAutoColumn', 'pagination', 'stopEditingWhenGridLosesFocus', 'paginationAutoPageSize', 'suppressScrollOnNewData', 'purgeClosedRowNodes',
        'cacheQuickFilter', 'deltaRowDataMode', 'ensureDomOrder', 'accentedSort', 'pivotTotals', 'suppressChangeDetection', 'valueCache',
        'valueCacheNeverExpires', 'aggregateOnlyChangedColumns', 'suppressAnimationFrame', 'suppressExcelExport', 'suppressCsvExport', 'treeData',
        'masterDetail', 'suppressMultiRangeSelection', 'enterMovesDownAfterEdit', 'enterMovesDown', 'suppressPropertyNamesCheck', 'rowMultiSelectWithClick',
        'contractColumnSelection', 'suppressEnterpriseResetOnNewColumns', 'enableOldSetFilterModel', 'suppressRowHoverHighlight',
        'gridAutoHeight', 'suppressRowTransform', 'suppressClipboardPaste', 'serverSideSortingAlwaysResets', 'reactNext',
        'suppressSetColumnStateEvents', 'enableCharts', 'deltaColumnMode', 'suppressMaintainUnsortedOrder', 'enableCellTextSelection',
        'suppressBrowserResizeObserver', 'suppressMaxRenderedRowRestriction', 'excludeChildrenWhenTreeDataFiltering',
        'keepDetailRows', 'paginateChildRows', 'preventDefaultOnContextMenu', 'undoRedoCellEditing', 'allowDragFromColumnsToolPanel'
    ];
    /** You do not need to include event callbacks in this list, as they are generated automatically. */
    PropertyKeys.FUNCTION_PROPERTIES = [
        'localeTextFunc', 'groupRowInnerRenderer', 'groupRowInnerRendererFramework',
        'dateComponent', 'dateComponentFramework', 'groupRowRenderer', 'groupRowRendererFramework', 'isExternalFilterPresent',
        'getRowHeight', 'doesExternalFilterPass', 'getRowClass', 'getRowStyle', 'getRowClassRules',
        'traverseNode', 'getContextMenuItems', 'getMainMenuItems', 'processRowPostCreate', 'processCellForClipboard',
        'getNodeChildDetails', 'groupRowAggNodes', 'getRowNodeId', 'isFullWidthCell', 'fullWidthCellRenderer',
        'fullWidthCellRendererFramework', 'doesDataFlower', 'processSecondaryColDef', 'processSecondaryColGroupDef',
        'getBusinessKeyForNode', 'sendToClipboard', 'navigateToNextCell', 'tabToNextCell', 'getDetailRowData',
        'processCellFromClipboard', 'getDocument', 'postProcessPopup', 'getChildCount', 'getDataPath', 'loadingCellRenderer',
        'loadingCellRendererFramework', 'loadingOverlayComponent', 'loadingOverlayComponentFramework', 'noRowsOverlayComponent',
        'noRowsOverlayComponentFramework', 'detailCellRenderer', 'detailCellRendererFramework',
        'defaultGroupSortComparator', 'isRowMaster', 'isRowSelectable', 'postSort', 'processHeaderForClipboard',
        'paginationNumberFormatter', 'processDataFromClipboard', 'getServerSideGroupKey', 'isServerSideGroup',
        'suppressKeyboardEvent', 'createChartContainer', 'processChartOptions', 'getChartToolbarItems', 'fillOperation'
    ];
    PropertyKeys.ALL_PROPERTIES = __spreadArrays(PropertyKeys.ARRAY_PROPERTIES, PropertyKeys.OBJECT_PROPERTIES, PropertyKeys.STRING_PROPERTIES, PropertyKeys.NUMBER_PROPERTIES, PropertyKeys.FUNCTION_PROPERTIES, PropertyKeys.BOOLEAN_PROPERTIES);
    /**
     * Used when performing property checks. This avoids noise caused when using frameworks, which can add their own
     * framework-specific properties to colDefs, gridOptions etc.
     */
    PropertyKeys.FRAMEWORK_PROPERTIES = [
        '__ob__', '__metadata__', 'mappedColumnProperties', 'hasChildColumns', 'toColDef', 'createColDefFromGridColumn'
    ];
    return PropertyKeys;
}());
exports.PropertyKeys = PropertyKeys;

//# sourceMappingURL=propertyKeys.js.map
