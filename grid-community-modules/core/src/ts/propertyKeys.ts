import { GridOptions } from "./entities/gridOptions";
import { AgGridCommon } from "./interfaces/iCommon";

type GridOptionKey = keyof GridOptions;

type GetKeys<T, U> = {
    [K in keyof T]: U extends T[K] ? K :
    (T[K] extends U | undefined ? K : never) //Reverse match for string literal types
}[keyof T];

/**
 *  Get the GridProperties that are of type `any`.
 *  Works by finding the properties that can extend a non existing string.
 *  This will only be the properties of type `any`.
 */
export type AnyGridOptions = {
    [K in keyof GridOptions]: GridOptions[K] extends 'NO_MATCH' ? K : never
}[keyof GridOptions];

/**
 * Get all the GridOptions properties of the provided type.
 * Will also include `any` properties. 
 */
type KeysLike<U> = Exclude<GetKeys<GridOptions, U>, undefined>;
/**
 * Get all the GridOption properties that strictly contain the provided type.
 * Does not include `any` properties.
 */
type KeysOfType<U> = Exclude<GetKeys<GridOptions, U>, AnyGridOptions>;
type CallbackKeys = KeysOfType<(any: AgGridCommon<any>) => any>;
/** All function properties excluding those explicity match the common callback interface. */
type FunctionKeys = Exclude<KeysLike<Function>, CallbackKeys>;

/**
 * These keys are used for validating properties supplied on a gridOptions object, and for code generation.
 * If you change the properties on the gridOptions interface, you *must* update this file as well to be consistent.
 */
export class PropertyKeys {
    public static STRING_PROPERTIES: KeysOfType<string>[] = [
        'rowSelection', 'overlayLoadingTemplate', 'overlayNoRowsTemplate',
        'quickFilterText', 'rowModelType', 'editType', 'domLayout', 'clipboardDelimiter', 'rowGroupPanelShow',
        'multiSortKey', 'pivotColumnGroupTotals', 'pivotRowTotals', 'pivotPanelShow', 'fillHandleDirection',
        'serverSideStoreType', 'groupDisplayType', 'treeDataDisplayType', 'colResizeDefault'
    ];

    public static OBJECT_PROPERTIES: KeysLike<object | HTMLElement>[] = [
        'components', 'frameworkComponents', 'rowStyle', 'context', 'autoGroupColumnDef', 'localeText', 'icons',
        'datasource', 'serverSideDatasource', 'viewportDatasource', 'groupRowRendererParams', 'aggFuncs', 'fullWidthCellRendererParams',
        'defaultColGroupDef', 'defaultColDef', 'defaultCsvExportParams', 'defaultExcelExportParams', 'columnTypes',
        'rowClassRules', 'detailCellRendererParams', 'loadingCellRendererParams', 'loadingOverlayComponentParams',
        'noRowsOverlayComponentParams', 'popupParent', 'statusBar', 'sideBar', 'chartThemeOverrides',
        'customChartThemes', 'chartToolPanelsDef'
    ];

    public static ARRAY_PROPERTIES: KeysOfType<any[]>[] = [
        'sortingOrder', 'alignedGrids', 'rowData', 'columnDefs', 'excelStyles', 'pinnedTopRowData', 'pinnedBottomRowData', 'chartThemes', 'rowClass'
    ];

    public static NUMBER_PROPERTIES: KeysOfType<number>[] = [
        'rowHeight', 'detailRowHeight', 'rowBuffer', 'headerHeight', 'groupHeaderHeight', 'floatingFiltersHeight',
        'pivotHeaderHeight', 'pivotGroupHeaderHeight', 'groupDefaultExpanded', 'viewportRowModelPageSize',
        'viewportRowModelBufferSize', 'autoSizePadding', 'maxBlocksInCache', 'maxConcurrentDatasourceRequests', 'tooltipShowDelay',
        'tooltipHideDelay', 'cacheOverflowSize', 'paginationPageSize', 'cacheBlockSize', 'infiniteInitialRowCount', 'serverSideInitialRowCount', 'scrollbarWidth',
        'asyncTransactionWaitMillis', 'blockLoadDebounceMillis', 'keepDetailRowsCount',
        'undoRedoCellEditingLimit', 'cellFlashDelay', 'cellFadeDelay', 'tabIndex'
    ];

    public static BOOLEAN_PROPERTIES: KeysOfType<boolean>[] = [
        'suppressMakeColumnVisibleAfterUnGroup', 'suppressRowClickSelection', 'suppressCellSelection', 'suppressCellFocus', 'suppressHorizontalScroll', 
        'alwaysShowHorizontalScroll', 'alwaysShowVerticalScroll', 'debug', 'enableBrowserTooltips', 'enableCellExpressions',
        'groupSelectsChildren', 'groupIncludeFooter',
        'groupIncludeTotalFooter', 'groupSuppressBlankHeader', 'suppressMenuHide', 'suppressRowDeselection',
        'unSortIcon', 'suppressMultiSort', 'alwaysMultiSort', 'singleClickEdit', 'suppressLoadingOverlay', 'suppressNoRowsOverlay', 'suppressAutoSize',
        'skipHeaderOnAutoSize', 'suppressParentsInRowNodes', 'suppressColumnMoveAnimation', 'suppressMovableColumns',
        'suppressFieldDotNotation', 'enableRangeSelection', 'enableRangeHandle', 'enableFillHandle', 'suppressClearOnFillReduction',
        'deltaSort', 'suppressTouch', 'suppressAsyncEvents', 'allowContextMenuWithControlKey', 'suppressContextMenu',
        'rememberGroupStateWhenNewData', 'enableCellChangeFlash', 'suppressDragLeaveHidesColumns', 'suppressRowGroupHidesColumns', 'suppressMiddleClickScrolls',
        'suppressPreventDefaultOnMouseWheel', 'suppressCopyRowsToClipboard', 'copyHeadersToClipboard', 'copyGroupHeadersToClipboard',
        'pivotMode', 'suppressAggFuncInHeader', 'suppressColumnVirtualisation', 'suppressAggAtRootLevel', 'suppressFocusAfterRefresh',
        'functionsPassive', 'functionsReadOnly', 'animateRows', 'groupSelectsFiltered', 'groupRemoveSingleChildren',
        'groupRemoveLowestSingleChildren', 'enableRtl', 'suppressClickEdit', 'rowDragEntireRow', 'rowDragManaged', 'suppressRowDrag',
        'suppressMoveWhenRowDragging', 'rowDragMultiRow', 'enableGroupEdit', 'embedFullWidthRows',
        'suppressPaginationPanel', 'groupHideOpenParents', 'groupAllowUnbalanced', 'pagination',
        'paginationAutoPageSize', 'suppressScrollOnNewData', 'suppressScrollWhenPopupsAreOpen',
        'purgeClosedRowNodes', 'cacheQuickFilter', 'ensureDomOrder', 'accentedSort', 'suppressChangeDetection',
        'valueCache', 'valueCacheNeverExpires', 'aggregateOnlyChangedColumns', 'suppressAnimationFrame', 'suppressExcelExport',
        'suppressCsvExport', 'treeData', 'masterDetail', 'suppressMultiRangeSelection', 'enterMovesDownAfterEdit', 'enterMovesDown',
        'suppressPropertyNamesCheck', 'rowMultiSelectWithClick',
        'suppressRowHoverHighlight', 'suppressRowTransform', 'suppressClipboardPaste', 'suppressLastEmptyLineOnPaste',
        'enableCharts', 'enableChartToolPanelsButton', 'suppressChartToolPanelsButton',
        'suppressMaintainUnsortedOrder', 'enableCellTextSelection', 'suppressBrowserResizeObserver', 'suppressMaxRenderedRowRestriction',
        'excludeChildrenWhenTreeDataFiltering', 'tooltipMouseTrack', 'keepDetailRows', 'paginateChildRows', 'preventDefaultOnContextMenu',
        'undoRedoCellEditing', 'allowDragFromColumnsToolPanel', 'immutableData', 'pivotSuppressAutoColumn',
        'suppressExpandablePivotGroups', 'debounceVerticalScrollbar', 'detailRowAutoHeight',
        'serverSideFilteringAlwaysResets', 'serverSideSortingAlwaysResets', 'serverSideSortAllLevels', 'serverSideFilterAllLevels',
        'serverSideSortOnServer', 'serverSideFilterOnServer', 'suppressAggFilteredOnly', 'showOpenedGroup', 'suppressClipboardApi',
        'suppressModelUpdateAfterUpdateTransaction', 'stopEditingWhenCellsLoseFocus', 'maintainColumnOrder', 'groupMaintainOrder',
        'columnHoverHighlight', 'reactUi', 'suppressReactUi', 'readOnlyEdit', 'suppressRowVirtualisation', 'enableCellEditingOnBackspace',
        'resetRowDataOnUpdate', 'removePivotHeaderRowWhenSingleValueColumn', 'suppressCopySingleCellRanges',
        'groupRowsSticky', 'suppressServerSideInfiniteScroll', 'rowGroupPanelSuppressSort', 'allowShowChangeAfterFilter'
    ];

    /** You do not need to include event callbacks in this list, as they are generated automatically. */
    public static FUNCTIONAL_PROPERTIES: FunctionKeys[] = [
        'localeTextFunc', 'doesExternalFilterPass', 'groupRowAggNodes', 'isFullWidthCell', 'processSecondaryColDef', 'processSecondaryColGroupDef', 'processPivotResultColDef',
        'processPivotResultColGroupDef', 'getBusinessKeyForNode', 'isRowSelectable', 'postSort', 'defaultGroupOrderComparator', 'rowDragText',
        'groupRowRenderer', 'groupRowRendererFramework', 'fullWidthCellRenderer', 'fullWidthCellRendererFramework',
        'loadingCellRenderer', 'loadingCellRendererFramework', 'loadingOverlayComponent', 'loadingOverlayComponentFramework', 'noRowsOverlayComponent', 'noRowsOverlayComponentFramework',
        'detailCellRenderer', 'detailCellRendererFramework'
    ];


    public static CALLBACK_PROPERTIES: CallbackKeys[] = [

        'getLocaleText', 'isExternalFilterPresent', 'getRowHeight', 'getRowClass', 'getRowStyle', 'getContextMenuItems', 'getMainMenuItems',
        'processRowPostCreate', 'processCellForClipboard', 'getGroupRowAgg', 'getRowNodeId', 'isFullWidthRow',
        'sendToClipboard', 'navigateToNextHeader', 'tabToNextHeader', 'navigateToNextCell',
        'tabToNextCell', 'processCellFromClipboard', 'getDocument', 'postProcessPopup', 'getChildCount', 'getDataPath', 'isRowMaster', 'postSortRows', 'processHeaderForClipboard',
        'processGroupHeaderForClipboard', 'paginationNumberFormatter', 'processDataFromClipboard', 'getServerSideGroupKey', 'isServerSideGroup',
        'createChartContainer', 'getChartToolbarItems', 'fillOperation', 'isApplyServerSideTransaction', 'getServerSideStoreParams', 'getServerSideGroupLevelParams',
        'isServerSideGroupOpenByDefault', 'isGroupOpenByDefault', 'initialGroupOrderComparator',
        'loadingCellRendererSelector', 'getRowId', 'groupAggFiltering'
    ];

    public static FUNCTION_PROPERTIES: GridOptionKey[] = [
        ...PropertyKeys.FUNCTIONAL_PROPERTIES,
        ...PropertyKeys.CALLBACK_PROPERTIES
    ];

    public static ALL_PROPERTIES: GridOptionKey[] = [
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
