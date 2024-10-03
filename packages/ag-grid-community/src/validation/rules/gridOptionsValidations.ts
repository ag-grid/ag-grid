import { ComponentUtil } from '../../components/componentUtil';
import type { GridOptions } from '../../entities/gridOptions';
import { ModuleNames } from '../../modules/moduleNames';
import { PropertyKeys } from '../../propertyKeys';
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
        renamed: 'groupHideParentOfSingleChild',
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
    masterDetail: { module: ModuleNames.MasterDetailModule },

    enableRangeSelection: { module: ModuleNames.RangeSelectionModule },
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
        module: ModuleNames.RangeSelectionModule,
    },
    quickFilterText: {
        supportedRowModels: ['clientSide'],
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
