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
        message: 'Row click selection is suppressed by default, use `selection.enableClickSelection` instead.',
    },
    suppressRowDeselection: {
        version: '32.2',
        message: 'Row deselection is suppressed by default, use `selection.enableClickSelection` to enable.',
    },
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
    groupHideOpenParents: {
        supportedRowModels: ['clientSide', 'serverSide'],
        dependencies: {
            groupTotalRow: [undefined, 'bottom'],
        },
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

    treeDataChildrenField: {
        // TODO: we need to finalise the definition of this new TreeDataModule
        // module: ModuleNames.TreeDataModule,
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
    selectionColumnDef: () => COL_DEF_VALIDATORS,

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
