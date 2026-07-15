import { getSortDefFromInput } from '../../entities/agColumn';
import type { DomLayoutType, GridOptions } from '../../entities/gridOptions';
import { _BOOLEAN_GRID_OPTIONS, _GET_ALL_GRID_OPTIONS, _NUMBER_GRID_OPTIONS } from '../../propertyKeys';
import { _PUBLIC_EVENT_HANDLERS_MAP } from '../../publicEventHandlersMap';
import { _mergeDeep } from '../../utils/mergeDeep';
import { _errMsg } from '../logging';
import type {
    Deprecations,
    OptionsValidator,
    RequiredModule,
    ValidationWarning,
    Validations,
} from '../validationTypes';
import { _createDeprecationWarning, _createValidationWarning, buildAllValidNames } from '../validationTypes';

/**
 * Deprecations have been kept separately for ease of removing them in the future.
 *
 */
const GRID_OPTION_DEPRECATIONS = (): Deprecations<GridOptions> => ({
    suppressLoadingOverlay: { version: '32', message: 'Use `loading`=false instead.' },

    enableFillHandle: { version: '32.2', message: 'Use `cellSelection.handle` instead.' },
    enableRangeHandle: { version: '32.2', message: 'Use `cellSelection.handle` instead.' },
    enableRangeSelection: { version: '32.2', message: 'Use `cellSelection = true` instead.' },
    suppressMultiRangeSelection: {
        version: '32.2',
        message: 'Use `cellSelection.suppressMultiRanges` instead.',
    },
    suppressClearOnFillReduction: {
        version: '32.2',
        message: 'Use `cellSelection.handle.suppressClearOnFillReduction` instead.',
    },
    fillHandleDirection: { version: '32.2', message: 'Use `cellSelection.handle.direction` instead.' },
    fillOperation: { version: '32.2', message: 'Use `cellSelection.handle.setFillValue` instead.' },
    suppressRowClickSelection: {
        version: '32.2',
        message: 'Use `rowSelection.enableClickSelection` instead.',
    },
    suppressRowDeselection: { version: '32.2', message: 'Use `rowSelection.enableClickSelection` instead.' },
    rowMultiSelectWithClick: {
        version: '32.2',
        message: 'Use `rowSelection.enableSelectionWithoutKeys` instead.',
    },
    groupSelectsChildren: {
        version: '32.2',
        message: 'Use `rowSelection.groupSelects = "descendants"` instead.',
    },
    groupSelectsFiltered: {
        version: '32.2',
        message: 'Use `rowSelection.groupSelects = "filteredDescendants"` instead.',
    },
    isRowSelectable: { version: '32.2', message: 'Use `selectionOptions.isRowSelectable` instead.' },
    suppressCopySingleCellRanges: { version: '32.2', message: 'Use `rowSelection.copySelectedRows` instead.' },
    suppressCopyRowsToClipboard: { version: '32.2', message: 'Use `rowSelection.copySelectedRows` instead.' },
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

    groupRemoveSingleChildren: {
        version: '33',
        message: 'Use `groupHideParentOfSingleChild` instead.',
    },
    groupRemoveLowestSingleChildren: {
        version: '33',
        message: 'Use `groupHideParentOfSingleChild: "leafGroupsOnly"` instead.',
    },

    suppressRowGroupHidesColumns: {
        version: '33',
        message: 'Use `suppressGroupChangesColumnVisibility: "suppressHideOnGroup"` instead.',
    },
    suppressMakeColumnVisibleAfterUnGroup: {
        version: '33',
        message: 'Use `suppressGroupChangesColumnVisibility: "suppressShowOnUngroup"` instead.',
    },

    unSortIcon: { version: '33', message: 'Use `defaultColDef.unSortIcon` instead.' },
    sortingOrder: { version: '33', message: 'Use `defaultColDef.sortingOrder` instead.' },

    suppressPropertyNamesCheck: {
        version: '33',
        message:
            '`gridOptions` and `columnDefs` both have a `context` property that should be used for arbitrary user data. This means that column definitions and gridOptions should only contain valid properties making this property redundant.',
    },

    suppressAdvancedFilterEval: {
        version: '34',
        message: 'Advanced filter no longer uses function evaluation, so this option has no effect.',
    },
});

function toConstrainedNum(key: keyof GridOptions, value: any, min: number): string | ValidationWarning | null {
    if (typeof value === 'number' || value == null) {
        if (value == null) {
            return null;
        }
        return value >= min ? null : _createValidationWarning(317, { property: String(key), min });
    }
    return `${key}: value should be a number`;
}

export const GRID_OPTIONS_MODULES: Partial<Record<keyof GridOptions, RequiredModule<GridOptions>>> = {
    autoGenerateColumnDefs: 'AutoGenerateColumns',
    processFileInput: 'FileInputOverlay',
    alignedGrids: 'AlignedGrids',
    allowContextMenuWithControlKey: 'ContextMenu',
    autoSizeStrategy: 'ColumnAutoSize',
    calculatedColumns: 'CalculatedColumns',
    cellSelection: 'CellSelection',
    columnHoverHighlight: 'ColumnHover',
    datasource: 'InfiniteRowModel',
    doesExternalFilterPass: 'ExternalFilter',
    editType: 'EditCore',
    invalidEditValueMode: 'EditCore',
    enableAdvancedFilter: 'AdvancedFilter',
    enableCellSpan: 'CellSpan',
    enableCharts: 'IntegratedCharts',
    enableRangeSelection: 'CellSelection',
    enableRowPinning: 'PinnedRow',
    findSearchValue: 'Find',
    getFullRowEditValidationErrors: 'EditCore',
    getContextMenuItems: 'ContextMenu',
    getLocaleText: 'Locale',
    getMainMenuItems: 'ColumnMenu',
    getRowClass: 'RowStyle',
    getRowStyle: 'RowStyle',
    groupTotalRow: (_options, gridOptions) =>
        gridOptions.rowModelType === 'serverSide' ? 'ServerSideRowModel' : 'RowGrouping',
    grandTotalRow: ['CsrmHierarchy', 'ServerSideRowModel'],
    initialState: 'GridState',
    isExternalFilterPresent: 'ExternalFilter',
    isMasterOpenByDefault: 'MasterDetail',
    isRowPinnable: 'PinnedRow',
    isRowPinned: 'PinnedRow',
    localeText: 'Locale',
    masterDefaultExpanded: 'MasterDetail',
    masterDetail: (_options, gridOptions) =>
        gridOptions.rowModelType === 'serverSide' ? 'ServerSideRowModel' : 'MasterDetail',
    notesDataSource: 'Notes',
    pagination: 'Pagination',
    pinnedBottomRowData: 'PinnedRow',
    pinnedTopRowData: 'PinnedRow',
    pivotMode: (_options, gridOptions) => (gridOptions.rowModelType === 'serverSide' ? 'ServerSideRowModel' : 'Pivot'),
    pivotPanelShow: 'RowGroupingPanel',
    quickFilterText: 'QuickFilter',
    rowClass: 'RowStyle',
    rowClassRules: 'RowStyle',
    rowData: 'ClientSideRowModel',
    rowDragManaged: 'RowDrag',
    refreshAfterGroupEdit: ['RowGrouping', 'TreeData'],
    rowGroupPanelShow: 'RowGroupingPanel',
    rowNumbers: 'RowNumbers',
    rowSelection: (_options, gridOptions) =>
        gridOptions.rowModelType === 'serverSide' ? 'ServerSideRowModel' : 'RowSelection',
    rowStyle: 'RowStyle',
    serverSideDatasource: 'ServerSideRowModel',
    sideBar: 'SideBar',
    statusBar: 'StatusBar',
    treeData: (_options, gridOptions) =>
        gridOptions.rowModelType === 'serverSide' ? 'ServerSideRowModel' : 'TreeData',
    toolbar: 'Toolbar',
    undoRedoCellEditing: 'UndoRedoEdit',
    valueCache: 'ValueCache',
    viewportDatasource: 'ViewportRowModel',
};

/**
 * Validation rules for gridOptions
 */
const GRID_OPTION_VALIDATIONS: () => Validations<GridOptions> = () => {
    const definedValidations: Validations<GridOptions> = {
        autoSizePadding: {
            validate({ autoSizePadding }) {
                return toConstrainedNum('autoSizePadding', autoSizePadding, 0);
            },
        },
        calculatedColumns: {
            validate({ calculatedColumns }) {
                if (calculatedColumns == null) {
                    return null;
                }
                if (typeof calculatedColumns === 'boolean') {
                    return null;
                }
                if (typeof calculatedColumns !== 'object' || Array.isArray(calculatedColumns)) {
                    return _createValidationWarning(321, {
                        property: 'calculatedColumns',
                        expected: 'a boolean or an object',
                    });
                }

                const { dataTypes, expressionPickers, applyMode } = calculatedColumns;
                if (dataTypes != null) {
                    if (!Array.isArray(dataTypes) || dataTypes.some((dataType) => typeof dataType !== 'string')) {
                        return _createValidationWarning(321, {
                            property: 'calculatedColumns.dataTypes',
                            expected: 'an array of strings',
                        });
                    }
                }
                if (expressionPickers != null) {
                    const validExpressionPickers = new Set(['columns', 'functions', 'operators']);
                    if (
                        !Array.isArray(expressionPickers) ||
                        expressionPickers.some((expressionPicker) => !validExpressionPickers.has(expressionPicker))
                    ) {
                        return "calculatedColumns.expressionPickers should contain only 'columns', 'functions' or 'operators'.";
                    }
                }
                if (applyMode != null && applyMode !== 'live' && applyMode !== 'deferred') {
                    return _createValidationWarning(320, {
                        property: 'calculatedColumns.applyMode',
                        allowed: ['live', 'deferred'],
                    });
                }

                return null;
            },
        },
        cacheBlockSize: {
            supportedRowModels: ['serverSide', 'infinite'],
            validate({ cacheBlockSize }) {
                return toConstrainedNum('cacheBlockSize', cacheBlockSize, 1);
            },
        },
        cacheOverflowSize: {
            validate({ cacheOverflowSize }) {
                return toConstrainedNum('cacheOverflowSize', cacheOverflowSize, 1);
            },
        },

        datasource: {
            supportedRowModels: ['infinite'],
        },
        domLayout: {
            validate: (options) => {
                const domLayout = options.domLayout;
                const validLayouts: DomLayoutType[] = ['autoHeight', 'normal', 'print'];
                if (domLayout && !validLayouts.includes(domLayout)) {
                    return _createValidationWarning(320, {
                        property: 'domLayout',
                        allowed: validLayouts,
                        value: domLayout,
                    });
                }
                return null;
            },
        },

        enableFillHandle: {
            dependencies: {
                enableRangeSelection: { required: [true] },
            },
        },
        enableRangeHandle: {
            dependencies: {
                enableRangeSelection: { required: [true] },
            },
        },
        enableCellSpan: {
            supportedRowModels: ['clientSide', 'serverSide'],
        },
        enableRangeSelection: {
            dependencies: {
                rowDragEntireRow: { required: [false, undefined] },
            },
        },
        enableRowPinning: {
            supportedRowModels: ['clientSide'],
            validate({ enableRowPinning, pinnedTopRowData, pinnedBottomRowData }) {
                if (enableRowPinning && (pinnedTopRowData || pinnedBottomRowData)) {
                    return _createValidationWarning(318, {
                        feature: 'Manual row pinning',
                        conflictsWith: 'pinned row data',
                        advice: 'Either set `enableRowPinning` to `false`, or remove `pinnedTopRowData` and `pinnedBottomRowData`.',
                    });
                }
                return null;
            },
        },
        isRowPinnable: {
            supportedRowModels: ['clientSide'],
            validate({ enableRowPinning, isRowPinnable, pinnedTopRowData, pinnedBottomRowData }) {
                if (isRowPinnable && (pinnedTopRowData || pinnedBottomRowData)) {
                    return _createValidationWarning(318, {
                        feature: 'Manual row pinning',
                        conflictsWith: 'pinned row data',
                        advice: 'Either remove `isRowPinnable`, or remove `pinnedTopRowData` and `pinnedBottomRowData`.',
                    });
                }
                if (!enableRowPinning && isRowPinnable) {
                    return _createValidationWarning(319, {
                        feature: '`isRowPinnable`',
                        requirement: '`enableRowPinning` to be set',
                    });
                }
                return null;
            },
        },
        isRowPinned: {
            supportedRowModels: ['clientSide'],
            validate({ enableRowPinning, isRowPinned, pinnedTopRowData, pinnedBottomRowData }) {
                if (isRowPinned && (pinnedTopRowData || pinnedBottomRowData)) {
                    return _createValidationWarning(318, {
                        feature: 'Manual row pinning',
                        conflictsWith: 'pinned row data',
                        advice: 'Either remove `isRowPinned`, or remove `pinnedTopRowData` and `pinnedBottomRowData`.',
                    });
                }
                if (!enableRowPinning && isRowPinned) {
                    return _createValidationWarning(319, {
                        feature: '`isRowPinned`',
                        requirement: '`enableRowPinning` to be set',
                    });
                }
                return null;
            },
        },

        groupDefaultExpanded: {
            supportedRowModels: ['clientSide'],
        },
        masterDefaultExpanded: {
            supportedRowModels: ['clientSide'],
        },
        isMasterOpenByDefault: {
            supportedRowModels: ['clientSide'],
        },
        groupHideColumnsUntilExpanded: {
            supportedRowModels: ['clientSide'],
            validate({ groupHideColumnsUntilExpanded, groupHideOpenParents, groupDisplayType }) {
                if (groupHideColumnsUntilExpanded && !groupHideOpenParents && groupDisplayType !== 'multipleColumns') {
                    return _createValidationWarning(319, {
                        feature: '`groupHideColumnsUntilExpanded = true`',
                        requirement: "either `groupDisplayType = 'multipleColumns'` or `groupHideOpenParents = true`",
                    });
                }
                return null;
            },
        },
        groupHideOpenParents: {
            supportedRowModels: ['clientSide', 'serverSide'],
            dependencies: {
                groupTotalRow: { required: [undefined, 'bottom'] },
                groupDisplayType: { required: [undefined, 'multipleColumns'] },
                treeData: {
                    required: [undefined, false],
                    reason: "Tree Data has values at the group level so it doesn't make sense to hide them.",
                },
            },
        },
        groupHideParentOfSingleChild: {
            dependencies: {
                groupHideOpenParents: { required: [undefined, false] },
            },
        },
        groupRemoveLowestSingleChildren: {
            dependencies: {
                groupHideOpenParents: { required: [undefined, false] },
                groupRemoveSingleChildren: { required: [undefined, false] },
            },
        },
        groupRemoveSingleChildren: {
            dependencies: {
                groupHideOpenParents: { required: [undefined, false] },
                groupRemoveLowestSingleChildren: { required: [undefined, false] },
            },
        },
        groupSelectsChildren: {
            dependencies: {
                rowSelection: { required: ['multiple'] },
            },
        },
        groupHierarchyConfig: {
            validate({ groupHierarchyConfig = {} }, gridOptions, beans) {
                for (const k of Object.keys(groupHierarchyConfig)) {
                    beans.validation?.validateColDef(groupHierarchyConfig[k]);
                }
                return null;
            },
        },
        icons: {
            validate: ({ icons }) => {
                if (icons) {
                    if (icons['smallDown']) {
                        return _errMsg(262);
                    }
                    if (icons['smallLeft']) {
                        return _errMsg(263);
                    }
                    if (icons['smallRight']) {
                        return _errMsg(264);
                    }
                }
                return null;
            },
        },
        infiniteInitialRowCount: {
            validate({ infiniteInitialRowCount }) {
                return toConstrainedNum('infiniteInitialRowCount', infiniteInitialRowCount, 1);
            },
        },
        initialGroupOrderComparator: {
            supportedRowModels: ['clientSide'],
        },
        ssrmExpandAllAffectsAllRows: {
            validate: (options) => {
                if (typeof options.ssrmExpandAllAffectsAllRows === 'boolean') {
                    if (options.rowModelType !== 'serverSide') {
                        return "'ssrmExpandAllAffectsAllRows' is only supported with the Server Side Row Model.";
                    }
                    if (options.ssrmExpandAllAffectsAllRows && typeof options.getRowId !== 'function') {
                        return _createValidationWarning(319, {
                            feature: 'Server Side Row Model grouping',
                            requirement: 'the `getRowId` callback',
                        });
                    }
                }

                return null;
            },
        },
        keepDetailRowsCount: {
            validate({ keepDetailRowsCount }) {
                return toConstrainedNum('keepDetailRowsCount', keepDetailRowsCount, 1);
            },
        },
        paginationPageSize: {
            validate({ paginationPageSize }) {
                return toConstrainedNum('paginationPageSize', paginationPageSize, 1);
            },
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
        paginationPanels: {
            validate: ({ paginationPanels }) => {
                const validNames = new Set<string>(['pageSize', 'rowSummary', 'pageSummary', 'pageNumbers']);
                if (paginationPanels != null && !Array.isArray(paginationPanels)) {
                    return _createValidationWarning(323, { validNames: Array.from(validNames) });
                }
                if (
                    paginationPanels?.some((p) => {
                        if (typeof p === 'string') {
                            return !validNames.has(p);
                        }
                        if (typeof p === 'object' && p !== null) {
                            return !validNames.has(p.type);
                        }
                        return true;
                    })
                ) {
                    return _createValidationWarning(323, { validNames: Array.from(validNames) });
                }
                return null;
            },
        },
        pivotMode: {
            dependencies: {
                treeData: {
                    required: [false, undefined],
                    reason: 'Pivot Mode is not supported with Tree Data.',
                },
            },
        },
        quickFilterText: {
            supportedRowModels: ['clientSide'],
        },
        rowBuffer: {
            validate({ rowBuffer }) {
                return toConstrainedNum('rowBuffer', rowBuffer, 0);
            },
        },
        rowClass: {
            validate: (options) => {
                const rowClass = options.rowClass;
                if (typeof rowClass === 'function') {
                    return 'rowClass should not be a function, please use getRowClass instead';
                }
                return null;
            },
        },
        rowData: {
            supportedRowModels: ['clientSide'],
        },
        rowDragManaged: {
            supportedRowModels: ['clientSide'],
            dependencies: {
                pagination: {
                    required: [false, undefined],
                },
            },
        },
        rowSelection: {
            validate({ rowSelection }) {
                if (rowSelection && typeof rowSelection === 'string') {
                    return _createDeprecationWarning(306, {
                        version: '32.2.1',
                        name: 'using `rowSelection` with the values "single" or "multiple"',
                        message: 'Use the object value instead.',
                    });
                }
                if (rowSelection && typeof rowSelection !== 'object') {
                    return 'Expected `RowSelectionOptions` object for the `rowSelection` property.';
                }
                if (rowSelection && rowSelection.mode !== 'multiRow' && rowSelection.mode !== 'singleRow') {
                    return _createValidationWarning(320, {
                        property: 'Selection mode',
                        allowed: ['singleRow', 'multiRow'],
                        value: (rowSelection as any).mode,
                    });
                }
                return null;
            },
        },
        rowStyle: {
            validate: (options) => {
                const rowStyle = options.rowStyle;
                if (rowStyle && typeof rowStyle === 'function') {
                    return 'rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead';
                }
                return null;
            },
        },
        notesDataSource: {
            validate: ({ getRowId }) => {
                if (!getRowId) {
                    return _createValidationWarning(319, { feature: 'Notes', requirement: 'the `getRowId` callback' });
                }
                return null;
            },
        },
        noteHideDelay: {
            validate: (options) => {
                if (options.noteHideDelay != null && options.noteHideDelay < 0) {
                    return _createValidationWarning(317, { property: 'noteHideDelay', min: 0 });
                }
                return null;
            },
        },
        noteShowDelay: {
            validate: (options) => {
                if (options.noteShowDelay != null && options.noteShowDelay < 0) {
                    return _createValidationWarning(317, { property: 'noteShowDelay', min: 0 });
                }
                return null;
            },
        },
        serverSideDatasource: {
            supportedRowModels: ['serverSide'],
        },
        serverSideInitialRowCount: {
            supportedRowModels: ['serverSide'],
            validate({ serverSideInitialRowCount }) {
                return toConstrainedNum('serverSideInitialRowCount', serverSideInitialRowCount, 1);
            },
        },
        serverSideOnlyRefreshFilteredGroups: {
            supportedRowModels: ['serverSide'],
        },
        serverSideSortAllLevels: {
            supportedRowModels: ['serverSide'],
        },
        sortingOrder: {
            validate: (_options) => {
                const sortingOrder = _options.sortingOrder;

                if (Array.isArray(sortingOrder) && sortingOrder.length > 0) {
                    const invalidItems = sortingOrder.filter((a) => !getSortDefFromInput(a));
                    if (invalidItems.length > 0) {
                        return _createValidationWarning(324, { property: 'sortingOrder', invalidItems });
                    }
                } else if (!Array.isArray(sortingOrder) || !sortingOrder.length) {
                    return _createValidationWarning(325, { property: 'sortingOrder', value: sortingOrder });
                }
                return null;
            },
        },
        tooltipHideDelay: {
            validate: (options) => {
                if (options.tooltipHideDelay && options.tooltipHideDelay < 0) {
                    return _createValidationWarning(317, { property: 'tooltipHideDelay', min: 0 });
                }
                return null;
            },
        },
        tooltipShowDelay: {
            validate: (options) => {
                if (options.tooltipShowDelay && options.tooltipShowDelay < 0) {
                    return _createValidationWarning(317, { property: 'tooltipShowDelay', min: 0 });
                }
                return null;
            },
        },
        tooltipSwitchShowDelay: {
            validate: (options) => {
                if (options.tooltipSwitchShowDelay && options.tooltipSwitchShowDelay < 0) {
                    return _createValidationWarning(317, { property: 'tooltipSwitchShowDelay', min: 0 });
                }
                return null;
            },
        },
        treeData: {
            supportedRowModels: ['clientSide', 'serverSide'],
            validate: (options) => {
                const rowModel = options.rowModelType ?? 'clientSide';
                switch (rowModel) {
                    case 'clientSide': {
                        const { treeDataChildrenField, treeDataParentIdField, getDataPath, getRowId } = options;
                        if (!treeDataChildrenField && !treeDataParentIdField && !getDataPath) {
                            return _createValidationWarning(319, {
                                feature: '`treeData`',
                                requirement:
                                    'either `treeDataChildrenField` or `treeDataParentIdField` or `getDataPath` in the `clientSide` row model',
                            });
                        }
                        if (treeDataChildrenField) {
                            if (getDataPath) {
                                return _createValidationWarning(318, {
                                    feature: '`treeDataChildrenField`',
                                    conflictsWith: '`getDataPath`',
                                });
                            }
                            if (treeDataParentIdField) {
                                return _createValidationWarning(318, {
                                    feature: '`treeDataChildrenField`',
                                    conflictsWith: '`treeDataParentIdField`',
                                });
                            }
                        }
                        if (treeDataParentIdField) {
                            if (!getRowId) {
                                return 'getRowId callback not provided, tree data with parent id cannot be built.';
                            }
                            if (getDataPath) {
                                return _createValidationWarning(318, {
                                    feature: '`treeDataParentIdField`',
                                    conflictsWith: '`getDataPath`',
                                });
                            }
                        }
                        return null;
                    }
                    case 'serverSide': {
                        const ssrmWarning = `treeData requires 'isServerSideGroup' and 'getServerSideGroupKey' in the ${rowModel} row model.`;
                        return options.isServerSideGroup && options.getServerSideGroupKey ? null : ssrmWarning;
                    }
                }
                return null;
            },
        },
        viewportDatasource: {
            supportedRowModels: ['viewport'],
        },
        viewportRowModelBufferSize: {
            validate({ viewportRowModelBufferSize }) {
                return toConstrainedNum('viewportRowModelBufferSize', viewportRowModelBufferSize, 0);
            },
        },
        viewportRowModelPageSize: {
            validate({ viewportRowModelPageSize }) {
                return toConstrainedNum('viewportRowModelPageSize', viewportRowModelPageSize, 1);
            },
        },
        rowDragEntireRow: {
            dependencies: {
                cellSelection: { required: [undefined] },
            },
        },
        autoGroupColumnDef: {
            validate({ autoGroupColumnDef, showOpenedGroup }) {
                if (autoGroupColumnDef?.field && showOpenedGroup) {
                    return _createValidationWarning(318, {
                        feature: '`autoGroupColumnDef.field`',
                        conflictsWith: '`showOpenedGroup`',
                    });
                }
                if (autoGroupColumnDef?.valueGetter && showOpenedGroup) {
                    return _createValidationWarning(318, {
                        feature: '`autoGroupColumnDef.valueGetter`',
                        conflictsWith: '`showOpenedGroup`',
                    });
                }
                return null;
            },
        },
        renderingMode: {
            validate: (options) => {
                const renderingMode = options.renderingMode;
                const validModes = ['default', 'legacy'];
                if (renderingMode && !validModes.includes(renderingMode)) {
                    return _createValidationWarning(320, {
                        property: 'renderingMode',
                        allowed: validModes,
                        value: renderingMode,
                    });
                }
                return null;
            },
        },
        autoSizeStrategy: {
            validate: ({ autoSizeStrategy }) => {
                if (!autoSizeStrategy) {
                    return null;
                }

                const validModes: NonNullable<GridOptions['autoSizeStrategy']>['type'][] = [
                    'fitCellContents',
                    'fitGridWidth',
                    'fitProvidedWidth',
                ];
                const type = autoSizeStrategy.type;
                if (type !== 'fitCellContents' && type !== 'fitGridWidth' && type !== 'fitProvidedWidth') {
                    return _createValidationWarning(320, {
                        property: 'autoSizeStrategy',
                        allowed: validModes,
                        value: type,
                    });
                }
                if (type === 'fitProvidedWidth' && typeof autoSizeStrategy.width != 'number') {
                    return `When using the 'fitProvidedWidth' auto-size strategy, must provide a numeric \`width\`. You provided ${autoSizeStrategy.width}`;
                }
                return null;
            },
        },
    };
    const validations: Validations<GridOptions> = {};
    for (const key of _BOOLEAN_GRID_OPTIONS) {
        validations[key] = { expectedType: 'boolean' };
    }
    for (const key of _NUMBER_GRID_OPTIONS) {
        validations[key] = { expectedType: 'number' };
    }

    _mergeDeep(validations, definedValidations);
    return validations;
};

let _gridOptionsValidatorsCache: Required<OptionsValidator<GridOptions>> | undefined;
export const GRID_OPTIONS_VALIDATORS: () => Required<OptionsValidator<GridOptions>> = () =>
    (_gridOptionsValidatorsCache ??= (() => {
        const allProperties = [..._GET_ALL_GRID_OPTIONS(), ...Object.values(_PUBLIC_EVENT_HANDLERS_MAP)];
        const deprecations = GRID_OPTION_DEPRECATIONS();
        const propertyExceptions = ['api'];
        return {
            objectName: 'gridOptions',
            allProperties,
            allValidNames: buildAllValidNames(allProperties, deprecations, propertyExceptions),
            propertyExceptions,
            docsUrl: 'grid-options/',
            deprecations,
            validations: GRID_OPTION_VALIDATIONS(),
        };
    })());
