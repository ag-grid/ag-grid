// Type definitions for @ag-grid-community/core v31.0.3
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptions } from '../entities/gridOptions';
import { GridApi } from '../gridApi';
export declare class ComponentUtil {
    static EVENTS: string[];
    static VUE_OMITTED_PROPERTY: string;
    /** Exclude the following internal events from code generation to prevent exposing these events via framework components */
    static EXCLUDED_INTERNAL_EVENTS: string[];
    /** EVENTS that should be exposed via code generation for the framework components.  */
    static PUBLIC_EVENTS: string[];
    static getCallbackForEvent(eventName: string): string;
    static EVENT_CALLBACKS: string[];
    static STRING_PROPERTIES: ("columnApi" | "api" | "sideBar" | "tooltipTrigger" | "clipboardDelimiter" | "colResizeDefault" | "editType" | "quickFilterText" | "chartThemeOverrides" | "overlayLoadingTemplate" | "overlayNoRowsTemplate" | "pivotPanelShow" | "pivotColumnGroupTotals" | "pivotRowTotals" | "domLayout" | "groupDisplayType" | "rowGroupPanelShow" | "rowModelType" | "serverSidePivotResultFieldSeparator" | "rowSelection" | "fillHandleDirection" | "multiSortKey" | "rowClass" | "gridId" | "treeDataDisplayType")[];
    static OBJECT_PROPERTIES: ("columnApi" | "onFilterChanged" | "onSortChanged" | "tabToNextCell" | "api" | "context" | "statusBar" | "sideBar" | "popupParent" | "columnDefs" | "defaultColDef" | "defaultColGroupDef" | "columnTypes" | "dataTypeDefinitions" | "autoSizeStrategy" | "components" | "defaultCsvExportParams" | "defaultExcelExportParams" | "excelStyles" | "quickFilterParser" | "quickFilterMatcher" | "advancedFilterModel" | "advancedFilterParent" | "advancedFilterBuilderParams" | "chartThemes" | "customChartThemes" | "chartThemeOverrides" | "chartToolPanelsDef" | "loadingCellRenderer" | "loadingCellRendererParams" | "loadingCellRendererSelector" | "localeText" | "detailCellRenderer" | "detailCellRendererParams" | "alignedGrids" | "loadingOverlayComponent" | "loadingOverlayComponentParams" | "noRowsOverlayComponent" | "noRowsOverlayComponentParams" | "aggFuncs" | "rowDragText" | "fullWidthCellRenderer" | "fullWidthCellRendererParams" | "autoGroupColumnDef" | "groupRowRenderer" | "groupRowRendererParams" | "pinnedTopRowData" | "pinnedBottomRowData" | "rowData" | "datasource" | "serverSideDatasource" | "viewportDatasource" | "sortingOrder" | "icons" | "rowStyle" | "rowClassRules" | "initialState" | "getContextMenuItems" | "getMainMenuItems" | "postProcessPopup" | "processUnpinnedColumns" | "processCellForClipboard" | "processHeaderForClipboard" | "processGroupHeaderForClipboard" | "processCellFromClipboard" | "sendToClipboard" | "processDataFromClipboard" | "isExternalFilterPresent" | "doesExternalFilterPass" | "getChartToolbarItems" | "createChartContainer" | "navigateToNextHeader" | "tabToNextHeader" | "navigateToNextCell" | "getLocaleText" | "getDocument" | "paginationNumberFormatter" | "getGroupRowAgg" | "isGroupOpenByDefault" | "initialGroupOrderComparator" | "processPivotResultColDef" | "processPivotResultColGroupDef" | "getDataPath" | "getChildCount" | "getServerSideGroupLevelParams" | "isServerSideGroupOpenByDefault" | "isApplyServerSideTransaction" | "isServerSideGroup" | "getServerSideGroupKey" | "getBusinessKeyForNode" | "getRowId" | "processRowPostCreate" | "isRowSelectable" | "isRowMaster" | "fillOperation" | "postSortRows" | "getRowStyle" | "getRowClass" | "getRowHeight" | "isFullWidthRow" | "onToolPanelVisibleChanged" | "onToolPanelSizeChanged" | "onCutStart" | "onCutEnd" | "onPasteStart" | "onPasteEnd" | "onColumnVisible" | "onColumnPinned" | "onColumnResized" | "onColumnMoved" | "onColumnValueChanged" | "onColumnPivotModeChanged" | "onColumnPivotChanged" | "onColumnGroupOpened" | "onNewColumnsLoaded" | "onGridColumnsChanged" | "onDisplayedColumnsChanged" | "onVirtualColumnsChanged" | "onColumnEverythingChanged" | "onColumnHeaderMouseOver" | "onColumnHeaderMouseLeave" | "onColumnHeaderClicked" | "onColumnHeaderContextMenu" | "onComponentStateChanged" | "onCellValueChanged" | "onCellEditRequest" | "onRowValueChanged" | "onCellEditingStarted" | "onCellEditingStopped" | "onRowEditingStarted" | "onRowEditingStopped" | "onUndoStarted" | "onUndoEnded" | "onRedoStarted" | "onRedoEnded" | "onRangeDeleteStart" | "onRangeDeleteEnd" | "onFilterOpened" | "onFilterModified" | "onAdvancedFilterBuilderVisibleChanged" | "onChartCreated" | "onChartRangeSelectionChanged" | "onChartOptionsChanged" | "onChartDestroyed" | "onCellKeyDown" | "onGridReady" | "onGridPreDestroyed" | "onFirstDataRendered" | "onGridSizeChanged" | "onModelUpdated" | "onVirtualRowRemoved" | "onViewportChanged" | "onBodyScroll" | "onBodyScrollEnd" | "onDragStarted" | "onDragStopped" | "onStateUpdated" | "onPaginationChanged" | "onRowDragEnter" | "onRowDragMove" | "onRowDragLeave" | "onRowDragEnd" | "onColumnRowGroupChanged" | "onRowGroupOpened" | "onExpandOrCollapseAll" | "onPinnedRowDataChanged" | "onRowDataUpdated" | "onAsyncTransactionsFlushed" | "onStoreRefreshed" | "onCellClicked" | "onCellDoubleClicked" | "onCellFocused" | "onCellMouseOver" | "onCellMouseOut" | "onCellMouseDown" | "onRowClicked" | "onRowDoubleClicked" | "onRowSelected" | "onSelectionChanged" | "onCellContextMenu" | "onRangeSelectionChanged" | "onTooltipShow" | "onTooltipHide" | "onColumnRowGroupChangeRequest" | "onColumnPivotChangeRequest" | "onColumnValueChangeRequest" | "onColumnAggFuncChangeRequest")[];
    static ARRAY_PROPERTIES: ("columnApi" | "api" | "sideBar" | "columnDefs" | "components" | "excelStyles" | "chartThemes" | "chartThemeOverrides" | "alignedGrids" | "paginationPageSizeSelector" | "pinnedTopRowData" | "pinnedBottomRowData" | "rowData" | "sortingOrder" | "rowClass")[];
    static NUMBER_PROPERTIES: ("tabIndex" | "columnApi" | "api" | "tooltipShowDelay" | "tooltipHideDelay" | "headerHeight" | "groupHeaderHeight" | "floatingFiltersHeight" | "pivotHeaderHeight" | "pivotGroupHeaderHeight" | "autoSizePadding" | "undoRedoCellEditingLimit" | "chartThemeOverrides" | "keepDetailRowsCount" | "detailRowHeight" | "rowBuffer" | "paginationPageSize" | "pivotDefaultExpanded" | "cellFlashDelay" | "cellFadeDelay" | "groupDefaultExpanded" | "groupLockGroupColumns" | "asyncTransactionWaitMillis" | "cacheOverflowSize" | "infiniteInitialRowCount" | "serverSideInitialRowCount" | "cacheBlockSize" | "maxBlocksInCache" | "maxConcurrentDatasourceRequests" | "blockLoadDebounceMillis" | "viewportRowModelPageSize" | "viewportRowModelBufferSize" | "scrollbarWidth" | "rowHeight")[];
    static BOOLEAN_PROPERTIES: ("columnApi" | "api" | "sideBar" | "suppressContextMenu" | "preventDefaultOnContextMenu" | "allowContextMenuWithControlKey" | "suppressMenuHide" | "enableBrowserTooltips" | "tooltipMouseTrack" | "tooltipInteraction" | "copyHeadersToClipboard" | "copyGroupHeadersToClipboard" | "suppressCopyRowsToClipboard" | "suppressCopySingleCellRanges" | "suppressLastEmptyLineOnPaste" | "suppressClipboardPaste" | "suppressClipboardApi" | "suppressCutToClipboard" | "maintainColumnOrder" | "suppressFieldDotNotation" | "allowDragFromColumnsToolPanel" | "suppressMovableColumns" | "suppressColumnMoveAnimation" | "suppressDragLeaveHidesColumns" | "suppressRowGroupHidesColumns" | "suppressAutoSize" | "skipHeaderOnAutoSize" | "singleClickEdit" | "suppressClickEdit" | "readOnlyEdit" | "stopEditingWhenCellsLoseFocus" | "enterMovesDown" | "enterMovesDownAfterEdit" | "enterNavigatesVertically" | "enterNavigatesVerticallyAfterEdit" | "enableCellEditingOnBackspace" | "undoRedoCellEditing" | "suppressCsvExport" | "suppressExcelExport" | "cacheQuickFilter" | "excludeHiddenColumnsFromQuickFilter" | "includeHiddenColumnsInQuickFilter" | "excludeChildrenWhenTreeDataFiltering" | "enableAdvancedFilter" | "includeHiddenColumnsInAdvancedFilter" | "enableCharts" | "chartThemeOverrides" | "enableChartToolPanelsButton" | "suppressChartToolPanelsButton" | "masterDetail" | "keepDetailRows" | "detailRowAutoHeight" | "valueCache" | "valueCacheNeverExpires" | "enableCellExpressions" | "suppressParentsInRowNodes" | "suppressTouch" | "suppressFocusAfterRefresh" | "suppressAsyncEvents" | "suppressBrowserResizeObserver" | "suppressPropertyNamesCheck" | "suppressChangeDetection" | "debug" | "suppressLoadingOverlay" | "suppressNoRowsOverlay" | "pagination" | "paginationPageSizeSelector" | "paginationAutoPageSize" | "paginateChildRows" | "suppressPaginationPanel" | "pivotMode" | "pivotSuppressAutoColumn" | "suppressExpandablePivotGroups" | "functionsReadOnly" | "suppressAggFuncInHeader" | "alwaysAggregateAtRootLevel" | "suppressAggAtRootLevel" | "aggregateOnlyChangedColumns" | "suppressAggFilteredOnly" | "removePivotHeaderRowWhenSingleValueColumn" | "animateRows" | "enableCellChangeFlash" | "allowShowChangeAfterFilter" | "ensureDomOrder" | "enableRtl" | "suppressColumnVirtualisation" | "suppressMaxRenderedRowRestriction" | "suppressRowVirtualisation" | "rowDragManaged" | "suppressRowDrag" | "suppressMoveWhenRowDragging" | "rowDragEntireRow" | "rowDragMultiRow" | "embedFullWidthRows" | "suppressGroupMaintainValueType" | "groupMaintainOrder" | "groupSelectsChildren" | "groupAggFiltering" | "groupIncludeFooter" | "groupIncludeTotalFooter" | "groupSuppressBlankHeader" | "groupSelectsFiltered" | "showOpenedGroup" | "groupRemoveSingleChildren" | "groupRemoveLowestSingleChildren" | "groupHideOpenParents" | "groupAllowUnbalanced" | "suppressMakeColumnVisibleAfterUnGroup" | "treeData" | "rowGroupPanelSuppressSort" | "suppressGroupRowsSticky" | "suppressModelUpdateAfterUpdateTransaction" | "suppressServerSideInfiniteScroll" | "purgeClosedRowNodes" | "serverSideSortAllLevels" | "serverSideOnlyRefreshFilteredGroups" | "serverSideFilterAllLevels" | "serverSideSortOnServer" | "serverSideFilterOnServer" | "alwaysShowHorizontalScroll" | "alwaysShowVerticalScroll" | "debounceVerticalScrollbar" | "suppressHorizontalScroll" | "suppressScrollOnNewData" | "suppressScrollWhenPopupsAreOpen" | "suppressAnimationFrame" | "suppressMiddleClickScrolls" | "suppressPreventDefaultOnMouseWheel" | "rowMultiSelectWithClick" | "suppressRowDeselection" | "suppressRowClickSelection" | "suppressCellFocus" | "suppressMultiRangeSelection" | "enableCellTextSelection" | "enableRangeSelection" | "enableRangeHandle" | "enableFillHandle" | "suppressClearOnFillReduction" | "accentedSort" | "unSortIcon" | "suppressMultiSort" | "alwaysMultiSort" | "suppressMaintainUnsortedOrder" | "suppressRowHoverHighlight" | "suppressRowTransform" | "columnHoverHighlight" | "deltaSort" | "functionsPassive" | "enableGroupEdit" | "reactiveCustomComponents" | "resetRowDataOnUpdate")[];
    static FUNCTION_PROPERTIES: (keyof GridOptions<any>)[];
    static ALL_PROPERTIES: (keyof GridOptions<any>)[];
    static ALL_PROPERTIES_AND_CALLBACKS: string[];
    static ALL_PROPERTIES_AND_CALLBACKS_SET: Set<string>;
    private static getGridOptionKeys;
    /** Combines component props / attributes with the provided gridOptions returning a new combined gridOptions object */
    static combineAttributesAndGridOptions(gridOptions: GridOptions | undefined, component: any): GridOptions;
    static processOnChange(changes: any, api: GridApi): void;
}
