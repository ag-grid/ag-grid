"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRID_OPTIONS_VALIDATORS = exports.GRID_OPTION_DEFAULTS = void 0;
var moduleNames_1 = require("../../modules/moduleNames");
var colDefValidations_1 = require("./colDefValidations");
var propertyKeys_1 = require("../../propertyKeys");
var componentUtil_1 = require("../../components/componentUtil");
/**
 * Deprecations have been kept separately for ease of removing them in the future.
 *
 * If the property was simply renamed, use the `renamed` property. The value will be implicitly copied to the new property.
 */
var GRID_OPTION_DEPRECATIONS = {
    enableChartToolPanelsButton: { version: '29', message: 'The Chart Tool Panels button is now enabled by default. To hide the Chart Tool Panels button and display the hamburger button instead, set suppressChartToolPanelsButton=true.' },
    functionsPassive: { version: '29.2' },
    onColumnRowGroupChangeRequest: { version: '29.2' },
    onColumnPivotChangeRequest: { version: '29.2' },
    onColumnValueChangeRequest: { version: '29.2' },
    onColumnAggFuncChangeRequest: { version: '29.2' },
    serverSideFilterAllLevels: { version: '30', message: 'All server-side group levels are now filtered by default. This can be toggled using `serverSideOnlyRefreshFilteredGroups`.' },
    suppressAggAtRootLevel: { version: '30', message: 'The root level aggregation is now suppressed by default. This can be toggled using  `alwaysAggregateAtRootLevel`.' },
    excludeHiddenColumnsFromQuickFilter: { version: '30', message: 'Hidden columns are now excluded from the Quick Filter by default. This can be toggled using `includeHiddenColumnsInQuickFilter`.' },
    enterMovesDown: { version: '30', renamed: 'enterNavigatesVertically' },
    enterMovesDownAfterEdit: { version: '30', renamed: 'enterNavigatesVerticallyAfterEdit' },
    suppressParentsInRowNodes: { version: '30.2', message: 'Using suppressParentsInRowNodes is no longer recommended. To serialize nodes it is now recommended to instead remove the parent node reference before serialization.' },
    advancedFilterModel: { version: '31', message: 'Use `initialState.filter.advancedFilterModel` instead.' },
    suppressAsyncEvents: { version: '31', message: 'Events should be handled asynchronously.' },
};
// Leave untyped. so it can be inferred.
exports.GRID_OPTION_DEFAULTS = {
    suppressContextMenu: false,
    preventDefaultOnContextMenu: false,
    allowContextMenuWithControlKey: false,
    suppressMenuHide: false,
    enableBrowserTooltips: false,
    tooltipTrigger: 'hover',
    tooltipShowDelay: 2000,
    tooltipHideDelay: 10000,
    tooltipMouseTrack: false,
    tooltipInteraction: false,
    copyHeadersToClipboard: false,
    copyGroupHeadersToClipboard: false,
    clipboardDelimiter: '\t',
    suppressCopyRowsToClipboard: false,
    suppressCopySingleCellRanges: false,
    suppressLastEmptyLineOnPaste: false,
    suppressClipboardPaste: false,
    suppressClipboardApi: false,
    suppressCutToClipboard: false,
    maintainColumnOrder: false,
    suppressFieldDotNotation: false,
    allowDragFromColumnsToolPanel: false,
    suppressMovableColumns: false,
    suppressColumnMoveAnimation: false,
    suppressDragLeaveHidesColumns: false,
    suppressRowGroupHidesColumns: false,
    suppressAutoSize: false,
    autoSizePadding: 20,
    skipHeaderOnAutoSize: false,
    singleClickEdit: false,
    suppressClickEdit: false,
    readOnlyEdit: false,
    stopEditingWhenCellsLoseFocus: false,
    enterNavigatesVertically: false,
    enterNavigatesVerticallyAfterEdit: false,
    enableCellEditingOnBackspace: false,
    undoRedoCellEditing: false,
    undoRedoCellEditingLimit: 10,
    suppressCsvExport: false,
    suppressExcelExport: false,
    cacheQuickFilter: false,
    includeHiddenColumnsInQuickFilter: false,
    excludeChildrenWhenTreeDataFiltering: false,
    enableAdvancedFilter: false,
    includeHiddenColumnsInAdvancedFilter: false,
    enableCharts: false,
    suppressChartToolPanelsButton: false,
    masterDetail: false,
    keepDetailRows: false,
    keepDetailRowsCount: 10,
    detailRowAutoHeight: false,
    tabIndex: 0,
    rowBuffer: 10,
    valueCache: false,
    valueCacheNeverExpires: false,
    enableCellExpressions: false,
    suppressTouch: false,
    suppressFocusAfterRefresh: false,
    suppressAsyncEvents: false,
    suppressBrowserResizeObserver: false,
    suppressPropertyNamesCheck: false,
    suppressChangeDetection: false,
    debug: false,
    suppressLoadingOverlay: false,
    suppressNoRowsOverlay: false,
    pagination: false,
    paginationPageSize: 100,
    paginationPageSizeSelector: true,
    paginationAutoPageSize: false,
    paginateChildRows: false,
    suppressPaginationPanel: false,
    pivotMode: false,
    pivotPanelShow: 'never',
    pivotDefaultExpanded: 0,
    pivotSuppressAutoColumn: false,
    suppressExpandablePivotGroups: false,
    functionsReadOnly: false,
    suppressAggFuncInHeader: false,
    alwaysAggregateAtRootLevel: false,
    aggregateOnlyChangedColumns: false,
    suppressAggFilteredOnly: false,
    removePivotHeaderRowWhenSingleValueColumn: false,
    animateRows: true,
    enableCellChangeFlash: false,
    cellFlashDelay: 500,
    cellFadeDelay: 1000,
    allowShowChangeAfterFilter: false,
    domLayout: 'normal',
    ensureDomOrder: false,
    enableRtl: false,
    suppressColumnVirtualisation: false,
    suppressMaxRenderedRowRestriction: false,
    suppressRowVirtualisation: false,
    rowDragManaged: false,
    suppressRowDrag: false,
    suppressMoveWhenRowDragging: false,
    rowDragEntireRow: false,
    rowDragMultiRow: false,
    embedFullWidthRows: false,
    groupDisplayType: 'singleColumn',
    groupDefaultExpanded: 0,
    groupMaintainOrder: false,
    groupSelectsChildren: false,
    groupIncludeTotalFooter: false,
    groupSuppressBlankHeader: false,
    groupSelectsFiltered: false,
    showOpenedGroup: false,
    groupRemoveSingleChildren: false,
    groupRemoveLowestSingleChildren: false,
    groupHideOpenParents: false,
    groupAllowUnbalanced: false,
    rowGroupPanelShow: 'never',
    suppressMakeColumnVisibleAfterUnGroup: false,
    treeData: false,
    rowGroupPanelSuppressSort: false,
    suppressGroupRowsSticky: false,
    rowModelType: 'clientSide',
    asyncTransactionWaitMillis: 50,
    suppressModelUpdateAfterUpdateTransaction: false,
    cacheOverflowSize: 1,
    infiniteInitialRowCount: 1,
    serverSideInitialRowCount: 1,
    suppressServerSideInfiniteScroll: false,
    cacheBlockSize: 100,
    maxBlocksInCache: -1,
    maxConcurrentDatasourceRequests: 2,
    blockLoadDebounceMillis: 0,
    purgeClosedRowNodes: false,
    serverSideSortAllLevels: false,
    serverSideOnlyRefreshFilteredGroups: false,
    serverSideSortOnServer: false,
    serverSideFilterOnServer: false,
    serverSidePivotResultFieldSeparator: '_',
    viewportRowModelPageSize: 5,
    viewportRowModelBufferSize: 5,
    alwaysShowHorizontalScroll: false,
    alwaysShowVerticalScroll: false,
    debounceVerticalScrollbar: false,
    suppressHorizontalScroll: false,
    suppressScrollOnNewData: false,
    suppressScrollWhenPopupsAreOpen: false,
    suppressAnimationFrame: false,
    suppressMiddleClickScrolls: false,
    suppressPreventDefaultOnMouseWheel: false,
    rowMultiSelectWithClick: false,
    suppressRowDeselection: false,
    suppressRowClickSelection: false,
    suppressCellFocus: false,
    suppressMultiRangeSelection: false,
    enableCellTextSelection: false,
    enableRangeSelection: false,
    enableRangeHandle: false,
    enableFillHandle: false,
    fillHandleDirection: 'xy',
    suppressClearOnFillReduction: false,
    accentedSort: false,
    unSortIcon: false,
    suppressMultiSort: false,
    alwaysMultiSort: false,
    suppressMaintainUnsortedOrder: false,
    suppressRowHoverHighlight: false,
    suppressRowTransform: false,
    columnHoverHighlight: false,
    deltaSort: false,
    enableGroupEdit: false,
    suppressGroupMaintainValueType: false,
    functionsPassive: false,
    groupLockGroupColumns: 0,
};
/**
 * Used simply to type check the default grid options.
 * Done here to allow inference of the above type, for gridOptionsService.get to infer where defaults exist.
 */
var GRID_OPTIONS_DEFAULT_ASSERTION = exports.GRID_OPTION_DEFAULTS;
/**
 * Validation rules for gridOptions
 */
var GRID_OPTION_VALIDATIONS = {
    sideBar: { module: moduleNames_1.ModuleNames.SideBarModule },
    statusBar: { module: moduleNames_1.ModuleNames.StatusBarModule },
    enableCharts: { module: moduleNames_1.ModuleNames.GridChartsModule },
    getMainMenuItems: { module: moduleNames_1.ModuleNames.MenuModule },
    getContextMenuItems: { module: moduleNames_1.ModuleNames.MenuModule },
    allowContextMenuWithControlKey: { module: moduleNames_1.ModuleNames.MenuModule },
    enableAdvancedFilter: { module: moduleNames_1.ModuleNames.AdvancedFilterModule },
    treeData: {
        supportedRowModels: ['clientSide', 'serverSide'],
        module: moduleNames_1.ModuleNames.RowGroupingModule,
        dependencies: function (options) {
            var _a;
            var rowModel = (_a = options.rowModelType) !== null && _a !== void 0 ? _a : 'clientSide';
            switch (rowModel) {
                case 'clientSide':
                    var csrmWarning = "treeData requires 'getDataPath' in the ".concat(rowModel, " row model.");
                    return options.getDataPath ? null : csrmWarning;
                case 'serverSide':
                    var ssrmWarning = "treeData requires 'isServerSideGroup' and 'getServerSideGroupKey' in the ".concat(rowModel, " row model.");
                    return options.isServerSideGroup && options.getServerSideGroupKey ? null : ssrmWarning;
            }
            return null;
        },
    },
    masterDetail: { module: moduleNames_1.ModuleNames.MasterDetailModule },
    enableRangeSelection: { module: moduleNames_1.ModuleNames.RangeSelectionModule },
    enableRangeHandle: {
        dependencies: {
            enableRangeSelection: [true],
        }
    },
    enableFillHandle: {
        dependencies: {
            enableRangeSelection: [true],
        }
    },
    groupDefaultExpanded: {
        supportedRowModels: ['clientSide'],
    },
    groupIncludeFooter: {
        supportedRowModels: ['clientSide', 'serverSide'],
        dependencies: function (options) {
            var _a;
            var rowModel = (_a = options.rowModelType) !== null && _a !== void 0 ? _a : 'clientSide';
            switch (rowModel) {
                case 'clientSide':
                    return null;
                case 'serverSide':
                    var warning = 'groupIncludeFooter is not supported alongside suppressServerSideInfiniteScroll';
                    return options.suppressServerSideInfiniteScroll ? warning : null;
            }
            return null;
        },
    },
    groupIncludeTotalFooter: {
        supportedRowModels: ['clientSide'],
    },
    groupRemoveSingleChildren: {
        dependencies: {
            groupHideOpenParents: [undefined, false],
            groupRemoveLowestSingleChildren: [undefined, false],
        }
    },
    groupRemoveLowestSingleChildren: {
        dependencies: {
            groupHideOpenParents: [undefined, false],
            groupRemoveSingleChildren: [undefined, false],
        }
    },
    groupSelectsChildren: {
        dependencies: {
            rowSelection: ['multiple'],
        }
    },
    suppressParentsInRowNodes: {
        dependencies: {
            groupSelectsChildren: [undefined, false],
        },
    },
    viewportDatasource: {
        supportedRowModels: ['viewport'],
        module: moduleNames_1.ModuleNames.ViewportRowModelModule,
    },
    serverSideDatasource: {
        supportedRowModels: ['serverSide'],
        module: moduleNames_1.ModuleNames.ServerSideRowModelModule,
    },
    cacheBlockSize: {
        supportedRowModels: ['serverSide', 'infinite'],
    },
    datasource: {
        supportedRowModels: ['infinite'],
        module: moduleNames_1.ModuleNames.InfiniteRowModelModule,
    },
    rowData: {
        supportedRowModels: ['clientSide'],
        module: moduleNames_1.ModuleNames.ClientSideRowModelModule,
    },
    columnDefs: function () { return colDefValidations_1.COL_DEF_VALIDATORS; },
    defaultColDef: function () { return colDefValidations_1.COL_DEF_VALIDATORS; },
    defaultColGroupDef: function () { return colDefValidations_1.COL_DEF_VALIDATORS; },
    autoGroupColumnDef: function () { return colDefValidations_1.COL_DEF_VALIDATORS; },
};
exports.GRID_OPTIONS_VALIDATORS = {
    objectName: 'gridOptions',
    allProperties: __spreadArray(__spreadArray([], __read(propertyKeys_1.PropertyKeys.ALL_PROPERTIES), false), __read(componentUtil_1.ComponentUtil.EVENT_CALLBACKS), false),
    propertyExceptions: ['api', 'columnApi'],
    docsUrl: 'grid-options/',
    deprecations: GRID_OPTION_DEPRECATIONS,
    validations: GRID_OPTION_VALIDATIONS,
};
