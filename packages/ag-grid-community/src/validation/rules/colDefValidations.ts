import type { UserComponentName } from '../../context/context';
import type { AbstractColDef, ColDef, ColGroupDef, ColumnMenuTab } from '../../entities/colDef';
import { DEFAULT_SORTING_ORDER } from '../../sort/sortService';
import { _errMsg, toStringWithNullUndefined } from '../logging';
import type { Deprecations, ModuleValidation, OptionsValidator, Validations } from '../validationTypes';
import { USER_COMP_MODULES } from './userCompValidations';

const COLUMN_DEFINITION_DEPRECATIONS: () => Deprecations<ColDef | ColGroupDef> = () => ({
    checkboxSelection: { version: '32.2', message: 'Use `rowSelection.checkboxes` in `GridOptions` instead.' },
    headerCheckboxSelection: {
        version: '32.2',
        message: 'Use `rowSelection.headerCheckbox = true` in `GridOptions` instead.',
    },
    headerCheckboxSelectionFilteredOnly: {
        version: '32.2',
        message: 'Use `rowSelection.selectAll = "filtered"` in `GridOptions` instead.',
    },
    headerCheckboxSelectionCurrentPageOnly: {
        version: '32.2',
        message: 'Use `rowSelection.selectAll = "currentPage"` in `GridOptions` instead.',
    },
    showDisabledCheckboxes: {
        version: '32.2',
        message: 'Use `rowSelection.hideDisabledCheckboxes = true` in `GridOptions` instead.',
    },
});

export const COLUMN_DEFINITION_MOD_VALIDATIONS: ModuleValidation<ColDef | ColGroupDef> = {
    aggFunc: 'SharedAggregation',
    autoHeight: 'RowAutoHeight',
    cellClass: 'CellStyle',
    cellClassRules: 'CellStyle',
    cellEditor: ({ cellEditor, editable }: ColDef) => {
        if (!editable) {
            return null;
        }
        if (typeof cellEditor === 'string') {
            return USER_COMP_MODULES[cellEditor as UserComponentName] ?? 'CustomEditor';
        }
        return 'CustomEditor';
    },
    cellRenderer: ({ cellRenderer }: ColDef) => {
        if (typeof cellRenderer !== 'string') {
            return null;
        }
        return USER_COMP_MODULES[cellRenderer as UserComponentName];
    },
    cellStyle: 'CellStyle',
    columnChooserParams: 'ColumnMenu',
    contextMenuItems: 'ContextMenu',
    dndSource: 'DragAndDrop',
    dndSourceOnRowDrag: 'DragAndDrop',
    editable: ({ editable, cellEditor }: ColDef) => {
        if (editable && !cellEditor) {
            return 'TextEditor';
        }
        return null;
    },
    enableCellChangeFlash: 'HighlightChanges',
    enablePivot: 'SharedPivot',
    enableRowGroup: 'SharedRowGrouping',
    enableValue: 'SharedAggregation',
    filter: ({ filter }: ColDef) => {
        if (filter && typeof filter !== 'string' && typeof filter !== 'boolean') {
            return 'CustomFilter';
        }
        if (typeof filter === 'string') {
            return USER_COMP_MODULES[filter as UserComponentName] ?? 'ColumnFilter';
        }
        return 'ColumnFilter';
    },
    floatingFilter: 'ColumnFilter',
    getQuickFilterText: 'QuickFilter',
    headerTooltip: 'Tooltip',
    mainMenuItems: 'ColumnMenu',
    menuTabs: (options: ColDef) => {
        const enterpriseMenuTabs: ColumnMenuTab[] = ['columnsMenuTab', 'generalMenuTab'];
        if (options.menuTabs?.some((tab) => enterpriseMenuTabs.includes(tab))) {
            return 'ColumnMenu';
        }
        return null;
    },
    pivot: 'SharedPivot',
    pivotIndex: 'SharedPivot',
    rowDrag: 'RowDrag',
    rowGroup: 'SharedRowGrouping',
    rowGroupIndex: 'SharedRowGrouping',
    tooltipField: 'Tooltip',
    tooltipValueGetter: 'Tooltip',
    spanRows: 'CellSpan',
};

const COLUMN_DEFINITION_VALIDATIONS: () => Validations<ColDef | ColGroupDef> = () => {
    const validations: Validations<ColDef | ColGroupDef> = {
        autoHeight: {
            supportedRowModels: ['clientSide', 'serverSide'],
            validate: (_colDef, { paginationAutoPageSize }) => {
                if (paginationAutoPageSize) {
                    return 'colDef.autoHeight is not supported with paginationAutoPageSize.';
                }
                return null;
            },
        },
        cellRendererParams: {
            validate: (colDef) => {
                const groupColumn =
                    colDef.rowGroup != null ||
                    colDef.rowGroupIndex != null ||
                    colDef.cellRenderer === 'agGroupCellRenderer';

                if (groupColumn && 'checkbox' in colDef.cellRendererParams) {
                    return 'Since v33.0, `cellRendererParams.checkbox` has been deprecated. Use `rowSelection.checkboxLocation = "autoGroupColumn"` instead.';
                }
                return null;
            },
        },
        flex: {
            validate: (_options, gridOptions) => {
                if (gridOptions.autoSizeStrategy) {
                    return 'colDef.flex is not supported with gridOptions.autoSizeStrategy';
                }
                return null;
            },
        },
        headerCheckboxSelection: {
            supportedRowModels: ['clientSide', 'serverSide'],
            validate: (_options, { rowSelection }) =>
                rowSelection === 'multiple'
                    ? null
                    : 'headerCheckboxSelection is only supported with rowSelection=multiple',
        },
        headerCheckboxSelectionCurrentPageOnly: {
            supportedRowModels: ['clientSide'],
            validate: (_options, { rowSelection }) =>
                rowSelection === 'multiple'
                    ? null
                    : 'headerCheckboxSelectionCurrentPageOnly is only supported with rowSelection=multiple',
        },
        headerCheckboxSelectionFilteredOnly: {
            supportedRowModels: ['clientSide'],
            validate: (_options, { rowSelection }) =>
                rowSelection === 'multiple'
                    ? null
                    : 'headerCheckboxSelectionFilteredOnly is only supported with rowSelection=multiple',
        },
        headerValueGetter: {
            validate: (_options: AbstractColDef) => {
                const headerValueGetter = _options.headerValueGetter;
                if (typeof headerValueGetter === 'function' || typeof headerValueGetter === 'string') {
                    return null;
                }
                return 'headerValueGetter must be a function or a valid string expression';
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
        type: {
            validate: (_options) => {
                const type = _options.type;

                if (type instanceof Array) {
                    const invalidArray = type.some((a) => typeof a !== 'string');
                    if (invalidArray) {
                        return "if colDef.type is supplied an array it should be of type 'string[]'";
                    }
                    return null;
                }

                if (typeof type === 'string') {
                    return null;
                }
                return "colDef.type should be of type 'string' | 'string[]'";
            },
        },
        rowSpan: {
            validate: (_options, { suppressRowTransform }) => {
                if (!suppressRowTransform) {
                    return 'colDef.rowSpan requires suppressRowTransform to be enabled.';
                }
                return null;
            },
        },
        spanRows: {
            dependencies: {
                editable: { required: [false, undefined] },
                rowDrag: { required: [false, undefined] },
                colSpan: { required: [undefined] },
                rowSpan: { required: [undefined] },
            },
            validate: (
                _options,
                {
                    rowSelection,
                    cellSelection,
                    suppressRowTransform,
                    enableCellSpan,
                    rowDragEntireRow,
                    enableCellTextSelection,
                }
            ) => {
                if (typeof rowSelection === 'object') {
                    if (rowSelection?.mode === 'singleRow' && rowSelection?.enableClickSelection) {
                        return 'colDef.spanRows is not supported with rowSelection.clickSelection';
                    }
                }
                if (cellSelection) {
                    return 'colDef.spanRows is not supported with cellSelection.';
                }
                if (suppressRowTransform) {
                    return 'colDef.spanRows is not supported with suppressRowTransform.';
                }
                if (!enableCellSpan) {
                    return 'colDef.spanRows requires enableCellSpan to be enabled.';
                }
                if (rowDragEntireRow) {
                    return 'colDef.spanRows is not supported with rowDragEntireRow.';
                }
                if (enableCellTextSelection) {
                    return 'colDef.spanRows is not supported with enableCellTextSelection.';
                }

                return null;
            },
        },
    };
    return validations;
};

type ColOrGroupKey = keyof ColDef | keyof ColGroupDef;
const colDefPropertyMap: Record<ColOrGroupKey, undefined> = {
    headerName: undefined,
    columnGroupShow: undefined,
    headerStyle: undefined,
    headerClass: undefined,
    toolPanelClass: undefined,
    headerValueGetter: undefined,
    pivotKeys: undefined,
    groupId: undefined,
    colId: undefined,
    sort: undefined,
    initialSort: undefined,
    field: undefined,
    type: undefined,
    cellDataType: undefined,
    tooltipComponent: undefined,
    tooltipField: undefined,
    headerTooltip: undefined,
    cellClass: undefined,
    showRowGroup: undefined,
    filter: undefined,
    initialAggFunc: undefined,
    defaultAggFunc: undefined,
    aggFunc: undefined,
    pinned: undefined,
    initialPinned: undefined,
    chartDataType: undefined,
    cellAriaRole: undefined,
    cellEditorPopupPosition: undefined,
    headerGroupComponent: undefined,
    headerGroupComponentParams: undefined,
    cellStyle: undefined,
    cellRenderer: undefined,
    cellRendererParams: undefined,
    cellEditor: undefined,
    cellEditorParams: undefined,
    filterParams: undefined,
    pivotValueColumn: undefined,
    headerComponent: undefined,
    headerComponentParams: undefined,
    floatingFilterComponent: undefined,
    floatingFilterComponentParams: undefined,
    tooltipComponentParams: undefined,
    refData: undefined,
    columnChooserParams: undefined,
    children: undefined,
    sortingOrder: undefined,
    allowedAggFuncs: undefined,
    menuTabs: undefined,
    pivotTotalColumnIds: undefined,
    cellClassRules: undefined,
    icons: undefined,
    sortIndex: undefined,
    initialSortIndex: undefined,
    flex: undefined,
    initialFlex: undefined,
    width: undefined,
    initialWidth: undefined,
    minWidth: undefined,
    maxWidth: undefined,
    rowGroupIndex: undefined,
    initialRowGroupIndex: undefined,
    pivotIndex: undefined,
    initialPivotIndex: undefined,
    suppressColumnsToolPanel: undefined,
    suppressFiltersToolPanel: undefined,
    openByDefault: undefined,
    marryChildren: undefined,
    suppressStickyLabel: undefined,
    hide: undefined,
    initialHide: undefined,
    rowGroup: undefined,
    initialRowGroup: undefined,
    pivot: undefined,
    initialPivot: undefined,
    checkboxSelection: undefined,
    showDisabledCheckboxes: undefined,
    headerCheckboxSelection: undefined,
    headerCheckboxSelectionFilteredOnly: undefined,
    headerCheckboxSelectionCurrentPageOnly: undefined,
    suppressHeaderMenuButton: undefined,
    suppressMovable: undefined,
    lockPosition: undefined,
    lockVisible: undefined,
    lockPinned: undefined,
    unSortIcon: undefined,
    suppressSizeToFit: undefined,
    suppressAutoSize: undefined,
    enableRowGroup: undefined,
    enablePivot: undefined,
    enableValue: undefined,
    editable: undefined,
    suppressPaste: undefined,
    suppressNavigable: undefined,
    enableCellChangeFlash: undefined,
    rowDrag: undefined,
    dndSource: undefined,
    autoHeight: undefined,
    wrapText: undefined,
    sortable: undefined,
    resizable: undefined,
    singleClickEdit: undefined,
    floatingFilter: undefined,
    cellEditorPopup: undefined,
    suppressFillHandle: undefined,
    wrapHeaderText: undefined,
    autoHeaderHeight: undefined,
    dndSourceOnRowDrag: undefined,
    valueGetter: undefined,
    valueSetter: undefined,
    filterValueGetter: undefined,
    keyCreator: undefined,
    valueFormatter: undefined,
    valueParser: undefined,
    comparator: undefined,
    equals: undefined,
    pivotComparator: undefined,
    suppressKeyboardEvent: undefined,
    suppressHeaderKeyboardEvent: undefined,
    colSpan: undefined,
    rowSpan: undefined,
    spanRows: undefined,
    getQuickFilterText: undefined,
    onCellValueChanged: undefined,
    onCellClicked: undefined,
    onCellDoubleClicked: undefined,
    onCellContextMenu: undefined,
    rowDragText: undefined,
    tooltipValueGetter: undefined,
    cellRendererSelector: undefined,
    cellEditorSelector: undefined,
    suppressSpanHeaderHeight: undefined,
    useValueFormatterForExport: undefined,
    useValueParserForImport: undefined,
    mainMenuItems: undefined,
    contextMenuItems: undefined,
    suppressFloatingFilterButton: undefined,
    suppressHeaderFilterButton: undefined,
    suppressHeaderContextMenu: undefined,
    loadingCellRenderer: undefined,
    loadingCellRendererParams: undefined,
    loadingCellRendererSelector: undefined,
    context: undefined,
    dateComponent: undefined,
    dateComponentParams: undefined,
    getFindText: undefined,
};
const ALL_PROPERTIES: () => ColOrGroupKey[] = () => Object.keys(colDefPropertyMap) as ColOrGroupKey[];

export const COL_DEF_VALIDATORS: () => OptionsValidator<ColDef | ColGroupDef> = () => ({
    objectName: 'colDef',
    allProperties: ALL_PROPERTIES(),
    docsUrl: 'column-properties/',
    deprecations: COLUMN_DEFINITION_DEPRECATIONS(),
    validations: COLUMN_DEFINITION_VALIDATIONS(),
});
