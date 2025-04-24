import type { DomLayoutType, GridOptions } from '../../entities/gridOptions';
import { _GET_ALL_EVENTS } from '../../eventTypes';
import { _getCallbackForEvent } from '../../gridOptionsUtils';
import type { ValidationModuleName } from '../../interfaces/iModule';
import { _BOOLEAN_GRID_OPTIONS, _GET_ALL_GRID_OPTIONS, _NUMBER_GRID_OPTIONS } from '../../propertyKeys';
import { DEFAULT_SORTING_ORDER } from '../../sort/sortService';
import { _mergeDeep } from '../../utils/object';
import { _errMsg, toStringWithNullUndefined } from '../logging';
import type { Deprecations, OptionsValidator, Validations } from '../validationTypes';

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
});

function toConstrainedNum(key: keyof GridOptions, value: any, min: number): string | null {
    if (typeof value === 'number' || value == null) {
        if (value == null) {
            return null;
        }
        return value >= min ? null : `${key}: value should be greater than or equal to ${min}`;
    }
    return `${key}: value should be a number`;
}

export const GRID_OPTIONS_MODULES: Partial<Record<keyof GridOptions, ValidationModuleName>> = {
    alignedGrids: 'AlignedGrids',
    allowContextMenuWithControlKey: 'ContextMenu',
    autoSizeStrategy: 'ColumnAutoSize',
    cellSelection: 'CellSelection',
    columnHoverHighlight: 'ColumnHover',
    datasource: 'InfiniteRowModel',
    doesExternalFilterPass: 'ExternalFilter',
    editType: 'EditCore',
    enableAdvancedFilter: 'AdvancedFilter',
    enableCellSpan: 'CellSpan',
    enableCharts: 'IntegratedCharts',
    enableRangeSelection: 'CellSelection',
    enableRowPinning: 'PinnedRow',
    findSearchValue: 'Find',
    getContextMenuItems: 'ContextMenu',
    getLocaleText: 'Locale',
    getMainMenuItems: 'ColumnMenu',
    getRowClass: 'RowStyle',
    getRowStyle: 'RowStyle',
    groupTotalRow: 'SharedRowGrouping',
    grandTotalRow: 'SharedRowGrouping',
    initialState: 'GridState',
    isExternalFilterPresent: 'ExternalFilter',
    isRowPinnable: 'PinnedRow',
    localeText: 'Locale',
    masterDetail: 'SharedMasterDetail',
    pagination: 'Pagination',
    pinnedBottomRowData: 'PinnedRow',
    pinnedTopRowData: 'PinnedRow',
    pivotMode: 'SharedPivot',
    pivotPanelShow: 'RowGroupingPanel',
    quickFilterText: 'QuickFilter',
    rowClass: 'RowStyle',
    rowClassRules: 'RowStyle',
    rowData: 'ClientSideRowModel',
    rowDragManaged: 'RowDrag',
    rowGroupPanelShow: 'RowGroupingPanel',
    rowNumbers: 'RowNumbers',
    rowSelection: 'SharedRowSelection',
    rowStyle: 'RowStyle',
    serverSideDatasource: 'ServerSideRowModel',
    sideBar: 'SideBar',
    statusBar: 'StatusBar',
    treeData: 'SharedTreeData',
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
                    return `domLayout must be one of [${validLayouts.join()}], currently it's ${domLayout}`;
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
        enableRangeSelection: {
            dependencies: {
                rowDragEntireRow: { required: [false, undefined] },
            },
        },
        enableRowPinning: {
            supportedRowModels: ['clientSide'],
            validate({ enableRowPinning, pinnedTopRowData, pinnedBottomRowData }) {
                if (enableRowPinning && (pinnedTopRowData || pinnedBottomRowData)) {
                    return 'Manual row pinning cannot be used together with pinned row data. Either set `enableRowPinning` to `false`, or remove `pinnedTopRowData` and `pinnedBottomRowData`.';
                }
                return null;
            },
        },
        isRowPinnable: {
            supportedRowModels: ['clientSide'],
            validate({ isRowPinnable, pinnedTopRowData, pinnedBottomRowData }) {
                if (isRowPinnable && (pinnedTopRowData || pinnedBottomRowData)) {
                    return 'Manual row pinning cannot be used together with pinned row data. Either remove `isRowPinnable`, or remove `pinnedTopRowData` and `pinnedBottomRowData`.';
                }
                return null;
            },
        },
        isRowPinned: {
            supportedRowModels: ['clientSide'],
            validate({ isRowPinned, pinnedTopRowData, pinnedBottomRowData }) {
                if (isRowPinned && (pinnedTopRowData || pinnedBottomRowData)) {
                    return 'Manual row pinning cannot be used together with pinned row data. Either remove `isRowPinned`, or remove `pinnedTopRowData` and `pinnedBottomRowData`.';
                }
                return null;
            },
        },

        groupDefaultExpanded: {
            supportedRowModels: ['clientSide'],
        },
        groupHideOpenParents: {
            supportedRowModels: ['clientSide', 'serverSide'],
            dependencies: {
                groupTotalRow: { required: [undefined, 'bottom'] },
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
                treeData: {
                    required: [false, undefined],
                },
                pagination: {
                    required: [false, undefined],
                },
            },
        },
        rowSelection: {
            validate({ rowSelection }) {
                if (rowSelection && typeof rowSelection === 'string') {
                    return 'As of version 32.2.1, using `rowSelection` with the values "single" or "multiple" has been deprecated. Use the object value instead.';
                }
                if (rowSelection && typeof rowSelection !== 'object') {
                    return 'Expected `RowSelectionOptions` object for the `rowSelection` property.';
                }
                if (rowSelection && rowSelection.mode !== 'multiRow' && rowSelection.mode !== 'singleRow') {
                    return `Selection mode "${(rowSelection as any).mode}" is invalid. Use one of 'singleRow' or 'multiRow'.`;
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
                    const invalidItems = sortingOrder.filter((a) => !DEFAULT_SORTING_ORDER.includes(a));
                    if (invalidItems.length > 0) {
                        return `sortingOrder must be an array with elements from [${DEFAULT_SORTING_ORDER.map(toStringWithNullUndefined).join()}], currently it includes [${invalidItems.map(toStringWithNullUndefined).join()}]`;
                    }
                } else if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
                    return `sortingOrder must be an array with at least one element, currently it's ${sortingOrder}`;
                }
                return null;
            },
        },
        tooltipHideDelay: {
            validate: (options) => {
                if (options.tooltipHideDelay && options.tooltipHideDelay < 0) {
                    return 'tooltipHideDelay should not be lower than 0';
                }
                return null;
            },
        },
        tooltipShowDelay: {
            validate: (options) => {
                if (options.tooltipShowDelay && options.tooltipShowDelay < 0) {
                    return 'tooltipShowDelay should not be lower than 0';
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
                            return "treeData requires either 'treeDataChildrenField' or 'treeDataParentIdField' or 'getDataPath' in the clientSide row model.";
                        }
                        if (treeDataChildrenField) {
                            if (getDataPath) {
                                return "Cannot use both 'treeDataChildrenField' and 'getDataPath' at the same time.";
                            }
                            if (treeDataParentIdField) {
                                return "Cannot use both 'treeDataChildrenField' and 'treeDataParentIdField' at the same time.";
                            }
                        }
                        if (treeDataParentIdField) {
                            if (!getRowId) {
                                return 'getRowId callback not provided, tree data with parent id cannot be built.';
                            }
                            if (getDataPath) {
                                return "Cannot use both 'treeDataParentIdField' and 'getDataPath' at the same time.";
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
                    return 'autoGroupColumnDef.field and showOpenedGroup are not supported when used together.';
                }
                if (autoGroupColumnDef?.valueGetter && showOpenedGroup) {
                    return 'autoGroupColumnDef.valueGetter and showOpenedGroup are not supported when used together.';
                }
                return null;
            },
        },
    };
    const validations: Validations<GridOptions> = {};
    _BOOLEAN_GRID_OPTIONS.forEach((key) => {
        validations[key] = { expectedType: 'boolean' };
    });
    _NUMBER_GRID_OPTIONS.forEach((key) => {
        validations[key] = { expectedType: 'number' };
    });

    _mergeDeep(validations, definedValidations);
    return validations;
};

export const GRID_OPTIONS_VALIDATORS: () => OptionsValidator<GridOptions> = () => ({
    objectName: 'gridOptions',
    allProperties: [..._GET_ALL_GRID_OPTIONS(), ..._GET_ALL_EVENTS().map((event) => _getCallbackForEvent(event))],
    propertyExceptions: ['api'],
    docsUrl: 'grid-options/',
    deprecations: GRID_OPTION_DEPRECATIONS(),
    validations: GRID_OPTION_VALIDATIONS(),
});
