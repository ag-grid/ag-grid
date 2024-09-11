import { ComponentUtil } from '../../components/componentUtil';
import type { GridOptions } from '../../entities/gridOptions';
import { ModuleNames } from '../../modules/moduleNames';
import { PropertyKeys } from '../../propertyKeys';
import type { Deprecations, OptionsValidator, Validations } from '../validationTypes';
import { COL_DEF_VALIDATORS } from './colDefValidations';
import { SELECTION_VALIDATORS } from './selectionValidations';

/**
 * Deprecations have been kept separately for ease of removing them in the future.
 *
 * If the property was simply renamed, use the `renamed` property. The value will be implicitly copied to the new property.
 */
const GRID_OPTION_DEPRECATIONS = (): Deprecations<GridOptions> => ({
    advancedFilterModel: { version: '31', message: 'Use `initialState.filter.advancedFilterModel` instead.' },
    suppressAsyncEvents: { version: '31', message: 'Events should be handled asynchronously.' },

    cellFadeDelay: { version: '31.1', renamed: 'cellFadeDuration' },
    cellFlashDelay: { version: '31.1', renamed: 'cellFlashDuration' },

    suppressServerSideInfiniteScroll: { version: '31.1' },
    serverSideSortOnServer: { version: '31.1' },
    serverSideFilterOnServer: { version: '31.1' },

    enableCellChangeFlash: {
        version: '31.2',
        message: 'Use `enableCellChangeFlash` in the `ColDef` or `defaultColDef` for all columns.',
    },

    groupIncludeFooter: { version: '31.3', message: 'Use `groupTotalRow` instead.' },
    groupIncludeTotalFooter: { version: '31.3', message: 'Use `grandTotalRow` instead.' },

    suppressLoadingOverlay: { version: '32', message: 'Use `loading`=false instead.' },

    enableFillHandle: { version: '32.2', message: 'Use `selection.handle` instead.' },
    enableRangeHandle: { version: '32.2', message: 'Use `selection.handle` instead.' },
    enableRangeSelection: { version: '32.2', message: 'Use `selection.mode = "cell"` instead.' },
    rowSelection: {
        version: '32.2',
        message: 'Use `selection.mode = "singleRow"` or `selection.mode = "multiRow" instead.',
    },
    suppressMultiRangeSelection: {
        version: '32.2',
        message: 'Use `selection.suppressMultiRanges` instead.',
    },
    suppressClearOnFillReduction: {
        version: '32.2',
        message: 'Use `selection.handle.suppressClearOnFillReduction` instead.',
    },
    fillHandleDirection: { version: '32.2', message: 'Use `selection.handle.direction` instead.' },
    fillOperation: { version: '32.2', message: 'Use `selection.handle.setFillValue` instead.' },
    suppressRowClickSelection: {
        version: '32.2',
        message: 'Use `selection.suppressClickSelection` instead.',
    },
    suppressRowDeselection: { version: '32.2', message: 'Use `selection.suppressDeselection` instead.' },
    rowMultiSelectWithClick: {
        version: '32.2',
        message: 'Use `selection.enableMultiSelectWithClick` instead.',
    },
    groupSelectsChildren: {
        version: '32.2',
        message: 'Use `selection.groupSelects = "descendants"` instead.',
    },
    groupSelectsFiltered: {
        version: '32.2',
        message: 'Use `selection.groupSelects = "filteredDescendants"` instead.',
    },
    isRowSelectable: { version: '32.2', message: 'Use `selectionOptions.isRowSelectable` instead.' },
    suppressCopySingleCellRanges: { version: '32.2', message: 'Use `selection.copySelectedRows` instead.' },
    suppressCopyRowsToClipboard: { version: '32.2', message: 'Use `selection.copySelectedRows` instead.' },
    onRangeSelectionChanged: { version: '32.2', message: 'Use `onCellSelectionChanged` instead.' },
    onRangeDeleteStart: { version: '32.2', message: 'Use `onCellSelectionDeleteStart` instead.' },
    onRangeDeleteEnd: { version: '32.2', message: 'Use `onCellSelectionDeleteEnd` instead.' },

    suppressBrowserResizeObserver: {
        version: '32.2',
        message: "The grid always uses the browser's ResizeObserver, this grid option has no effect.",
    },

    onColumnEverythingChanged: {
        version: '32.2',
        message:
            'Either use `onDisplayedColumnsChanged` which is fired at the same time, or use one of the more specific column events.',
    },
});

// Leave untyped. so it can be inferred.
export const GRID_OPTION_DEFAULTS = {
    suppressContextMenu: false,
    preventDefaultOnContextMenu: false,
    allowContextMenuWithControlKey: false,
    suppressMenuHide: true,
    enableBrowserTooltips: false,
    tooltipTrigger: 'hover',
    tooltipShowDelay: 2000,
    tooltipHideDelay: 10000,
    tooltipMouseTrack: false,
    tooltipShowMode: 'standard',
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
    enableStrictPivotColumnOrder: false,
    suppressFieldDotNotation: false,
    allowDragFromColumnsToolPanel: false,
    suppressMovableColumns: false,
    suppressColumnMoveAnimation: false,
    suppressMoveWhenColumnDragging: false,
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
    cellFlashDuration: 500,
    cellFadeDelay: 1000,
    cellFadeDuration: 1000,
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
    suppressHeaderFocus: false,
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
    groupLockGroupColumns: 0,
    serverSideEnableClientSideSort: false,
    suppressServerSideFullWidthLoadingRow: false,
    pivotMaxGeneratedColumns: -1,
    columnMenu: 'new',
    reactiveCustomComponents: true,
    suppressSetFilterByDefault: false,
} as const;
/**
 * Used simply to type check the default grid options.
 * Done here to allow inference of the above type, for gridOptionsService.get to infer where defaults exist.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GRID_OPTIONS_DEFAULT_ASSERTION: GridOptions = GRID_OPTION_DEFAULTS;

/**
 * Validation rules for gridOptions
 */
const GRID_OPTION_VALIDATIONS: () => Validations<GridOptions> = () => ({
    sideBar: { module: ModuleNames.SideBarModule },
    statusBar: { module: ModuleNames.StatusBarModule },
    enableCharts: { module: ModuleNames.GridChartsModule },
    getMainMenuItems: { module: ModuleNames.MenuModule },
    getContextMenuItems: { module: ModuleNames.MenuModule },
    allowContextMenuWithControlKey: { module: ModuleNames.MenuModule },
    enableAdvancedFilter: { module: ModuleNames.AdvancedFilterModule },
    treeData: {
        supportedRowModels: ['clientSide', 'serverSide'],
        module: ModuleNames.RowGroupingModule,
        validate: (options) => {
            const rowModel = options.rowModelType ?? 'clientSide';
            switch (rowModel) {
                case 'clientSide': {
                    const csrmWarning = `treeData requires 'getDataPath' in the ${rowModel} row model.`;
                    return options.getDataPath ? null : csrmWarning;
                }
                case 'serverSide': {
                    const ssrmWarning = `treeData requires 'isServerSideGroup' and 'getServerSideGroupKey' in the ${rowModel} row model.`;
                    return options.isServerSideGroup && options.getServerSideGroupKey ? null : ssrmWarning;
                }
            }
            return null;
        },
    },
    masterDetail: { module: ModuleNames.MasterDetailModule },

    enableRangeSelection: { module: ModuleNames.RangeSelectionModule },
    enableRangeHandle: {
        dependencies: {
            enableRangeSelection: [true],
        },
    },
    enableFillHandle: {
        dependencies: {
            enableRangeSelection: [true],
        },
    },

    groupDefaultExpanded: {
        supportedRowModels: ['clientSide'],
    },
    groupIncludeFooter: {
        supportedRowModels: ['clientSide', 'serverSide'],
        validate: (options) => {
            const rowModel = options.rowModelType ?? 'clientSide';
            switch (rowModel) {
                case 'clientSide':
                    return null;
                case 'serverSide': {
                    const warning = 'groupIncludeFooter is not supported alongside suppressServerSideInfiniteScroll';
                    return options.suppressServerSideInfiniteScroll ? warning : null;
                }
            }
            return null;
        },
    },
    groupHideOpenParents: {
        supportedRowModels: ['clientSide', 'serverSide'],
        dependencies: {
            groupTotalRow: [undefined, 'bottom'],
        },
    },
    groupIncludeTotalFooter: {
        supportedRowModels: ['clientSide'],
    },
    groupRemoveSingleChildren: {
        dependencies: {
            groupHideOpenParents: [undefined, false],
            groupRemoveLowestSingleChildren: [undefined, false],
        },
    },
    groupRemoveLowestSingleChildren: {
        dependencies: {
            groupHideOpenParents: [undefined, false],
            groupRemoveSingleChildren: [undefined, false],
        },
    },
    groupSelectsChildren: {
        dependencies: {
            rowSelection: ['multiple'],
        },
    },

    viewportDatasource: {
        supportedRowModels: ['viewport'],
        module: ModuleNames.ViewportRowModelModule,
    },
    serverSideDatasource: {
        supportedRowModels: ['serverSide'],
        module: ModuleNames.ServerSideRowModelModule,
    },
    cacheBlockSize: {
        supportedRowModels: ['serverSide', 'infinite'],
    },
    datasource: {
        supportedRowModels: ['infinite'],
        module: ModuleNames.InfiniteRowModelModule,
    },
    rowData: {
        supportedRowModels: ['clientSide'],
        module: ModuleNames.ClientSideRowModelModule,
    },
    paginationPageSizeSelector: {
        validate: (options) => {
            const values = options.paginationPageSizeSelector;
            if (typeof values === 'boolean' || values == null) {
                return null;
            }
            if (!values.length) {
                return `'paginationPageSizeSelector' cannot be an empty array.
                    If you want to hide the page size selector, set paginationPageSizeSelector to false.`;
            }
            return null;
        },
    },

    columnDefs: () => COL_DEF_VALIDATORS,
    defaultColDef: () => COL_DEF_VALIDATORS,
    defaultColGroupDef: () => COL_DEF_VALIDATORS,
    autoGroupColumnDef: () => COL_DEF_VALIDATORS,
    controlsColDef: () => COL_DEF_VALIDATORS,

    selection: () => SELECTION_VALIDATORS,
});

export const GRID_OPTIONS_VALIDATORS: () => OptionsValidator<GridOptions> = () => ({
    objectName: 'gridOptions',
    allProperties: [...PropertyKeys.ALL_PROPERTIES, ...ComponentUtil.EVENT_CALLBACKS],
    propertyExceptions: ['api'],
    docsUrl: 'grid-options/',
    deprecations: GRID_OPTION_DEPRECATIONS(),
    validations: GRID_OPTION_VALIDATIONS(),
});
