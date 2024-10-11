import { ComponentUtil } from '../../components/componentUtil';
import type { DomLayoutType, GridOptions } from '../../entities/gridOptions';
import { PropertyKeys } from '../../propertyKeys';
import { DEFAULT_SORTING_ORDER } from '../../sort/sortController';
import { toStringWithNullUndefined } from '../logging';
import type { Deprecations, OptionsValidator, Validations } from '../validationTypes';
import { COL_DEF_VALIDATORS } from './colDefValidations';

/**
 * Deprecations have been kept separately for ease of removing them in the future.
 *
 * If the property was simply renamed, use the `renamed` property. The value will be implicitly copied to the new property.
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
        version: '32.3',
        message: 'Use `groupHideParentOfSingleChild` instead.',
    },
    groupRemoveLowestSingleChildren: {
        version: '32.3',
        message: 'Use `groupHideParentOfSingleChild: "leafGroupsOnly"` instead.',
    },

    suppressRowGroupHidesColumns: {
        version: '32.3',
        message: 'Use `suppressGroupChangesColumnVisibility: "suppressHideOnGroup"` instead.',
    },
    suppressMakeColumnVisibleAfterUnGroup: {
        version: '32.3',
        message: 'Use `suppressGroupChangesColumnVisibility: "suppressShowOnUngroup"` instead.',
    },
});

/**
 * Validation rules for gridOptions
 */
const GRID_OPTION_VALIDATIONS: () => Validations<GridOptions> = () => ({
    sideBar: { module: 'SideBarModule' },
    statusBar: { module: 'StatusBarModule' },
    enableCharts: { module: 'GridChartsModule' },
    getMainMenuItems: { module: 'MenuModule' },
    getContextMenuItems: { module: 'MenuModule' },
    allowContextMenuWithControlKey: { module: 'MenuModule' },
    enableAdvancedFilter: { module: 'AdvancedFilterModule' },
    treeData: {
        supportedRowModels: ['clientSide', 'serverSide'],
        module: 'TreeDataModule',
        validate: (options) => {
            const rowModel = options.rowModelType ?? 'clientSide';
            switch (rowModel) {
                case 'clientSide': {
                    const csrmWarning = `treeData requires 'treeDataChildrenField' or 'getDataPath' in the ${rowModel} row model.`;
                    return options.treeDataChildrenField || options.getDataPath ? null : csrmWarning;
                }
                case 'serverSide': {
                    const ssrmWarning = `treeData requires 'isServerSideGroup' and 'getServerSideGroupKey' in the ${rowModel} row model.`;
                    return options.isServerSideGroup && options.getServerSideGroupKey ? null : ssrmWarning;
                }
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
    masterDetail: { module: 'MasterDetailModule' },

    enableRangeSelection: { module: 'RangeSelectionModule', rowDragEntireRow: { required: [false, undefined] } },
    enableRangeHandle: {
        dependencies: {
            enableRangeSelection: { required: [true] },
        },
    },
    enableFillHandle: {
        dependencies: {
            enableRangeSelection: { required: [true] },
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
    groupRemoveSingleChildren: {
        dependencies: {
            groupHideOpenParents: { required: [undefined, false] },
            groupRemoveLowestSingleChildren: { required: [undefined, false] },
        },
    },
    groupRemoveLowestSingleChildren: {
        dependencies: {
            groupHideOpenParents: { required: [undefined, false] },
            groupRemoveSingleChildren: { required: [undefined, false] },
        },
    },
    groupSelectsChildren: {
        dependencies: {
            rowSelection: { required: ['multiple'] },
        },
    },

    treeDataChildrenField: {
        module: 'TreeDataModule',
    },
    viewportDatasource: {
        supportedRowModels: ['viewport'],
        module: 'ViewportRowModelModule',
    },
    serverSideDatasource: {
        supportedRowModels: ['serverSide'],
        module: 'ServerSideRowModelModule',
    },
    cacheBlockSize: {
        supportedRowModels: ['serverSide', 'infinite'],
    },
    datasource: {
        supportedRowModels: ['infinite'],
        module: 'InfiniteRowModelModule',
    },
    rowData: {
        supportedRowModels: ['clientSide'],
        module: 'ClientSideRowModelModule',
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

    rowSelection: {
        validate({ rowSelection }) {
            if (rowSelection && typeof rowSelection === 'string') {
                return 'As of version 32.2.1, using `rowSelection` with the values "single" or "multiple" has been deprecated. Use the object value instead.';
            }
            if (rowSelection && typeof rowSelection !== 'object') {
                return 'Expected `RowSelectionOptions` object for the `rowSelection` property.';
            }
            return null;
        },
    },
    cellSelection: {
        module: 'RangeSelectionModule',
        dependencies: {
            rowDragEntireRow: { required: [false, undefined] },
        },
    },
    quickFilterText: {
        supportedRowModels: ['clientSide'],
    },
    initialGroupOrderComparator: {
        supportedRowModels: ['clientSide'],
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
    rowClass: {
        validate: (options) => {
            const rowClass = options.rowClass;
            if (typeof rowClass === 'function') {
                return 'rowClass should not be a function, please use getRowClass instead';
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
    tooltipHideDelay: {
        validate: (options) => {
            if (options.tooltipHideDelay && options.tooltipHideDelay < 0) {
                return 'tooltipHideDelay should not be lower than 0';
            }
            return null;
        },
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

    columnDefs: () => COL_DEF_VALIDATORS,
    defaultColDef: () => COL_DEF_VALIDATORS,
    defaultColGroupDef: () => COL_DEF_VALIDATORS,
    autoGroupColumnDef: () => COL_DEF_VALIDATORS,
    selectionColumnDef: () => COL_DEF_VALIDATORS,
});

export const GRID_OPTIONS_VALIDATORS: () => OptionsValidator<GridOptions> = () => ({
    objectName: 'gridOptions',
    allProperties: [...PropertyKeys.ALL_PROPERTIES, ...ComponentUtil.EVENT_CALLBACKS],
    propertyExceptions: ['api'],
    docsUrl: 'grid-options/',
    deprecations: GRID_OPTION_DEPRECATIONS(),
    validations: GRID_OPTION_VALIDATIONS(),
});
