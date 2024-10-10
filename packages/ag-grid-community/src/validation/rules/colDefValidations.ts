import type { AbstractColDef, ColDef, ColGroupDef, ColumnMenuTab } from '../../entities/colDef';
import type { GridOptions } from '../../entities/gridOptions';
import { DEFAULT_SORTING_ORDER } from '../../sort/sortController';
import { _missing } from '../../utils/generic';
import type { Deprecations, OptionsValidator, Validations } from '../validationTypes';

const COLUMN_DEFINITION_DEPRECATIONS: Deprecations<ColDef | ColGroupDef> = {
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
};

const CSRM_REQUIRES_ROW_GROUP_MODULE = (_options: never, gridOptions: GridOptions) => {
    if ((gridOptions.rowModelType ?? 'clientSide') === 'clientSide') {
        return { module: 'RowGroupingCoreModule' as const };
    }
    return null;
};

const COLUMN_DEFINITION_VALIDATIONS: Validations<ColDef | ColGroupDef> = {
    // supported on all row models, but need module for client side.
    enableRowGroup: CSRM_REQUIRES_ROW_GROUP_MODULE,
    rowGroup: CSRM_REQUIRES_ROW_GROUP_MODULE,
    rowGroupIndex: CSRM_REQUIRES_ROW_GROUP_MODULE,
    enablePivot: CSRM_REQUIRES_ROW_GROUP_MODULE,
    enableValue: CSRM_REQUIRES_ROW_GROUP_MODULE,
    pivot: CSRM_REQUIRES_ROW_GROUP_MODULE,
    pivotIndex: CSRM_REQUIRES_ROW_GROUP_MODULE,
    aggFunc: CSRM_REQUIRES_ROW_GROUP_MODULE,

    cellEditor: (options) => {
        if (options.cellEditor === 'agRichSelect' || options.cellEditor === 'agRichSelectCellEditor') {
            return { module: 'RichSelectModule' };
        }
        return null;
    },
    editable: {
        validate: (options) => {
            const { field, valueSetter } = options;

            if (_missing(field) && _missing(valueSetter)) {
                return 'you need either field or valueSetter set on colDef for editing to work';
            }
            return null;
        },
    },
    menuTabs: (options) => {
        const enterpriseMenuTabs: ColumnMenuTab[] = ['columnsMenuTab', 'generalMenuTab'];
        if (options.menuTabs?.some((tab) => enterpriseMenuTabs.includes(tab))) {
            return {
                module: 'MenuModule',
            };
        }
        return null;
    },
    columnChooserParams: {
        module: ['MenuModule', 'ColumnsToolPanelCoreModule'],
    },

    headerCheckboxSelection: {
        supportedRowModels: ['clientSide', 'serverSide'],
        validate: (_options, { rowSelection }) =>
            rowSelection === 'multiple' ? null : 'headerCheckboxSelection is only supported with rowSelection=multiple',
    },
    headerCheckboxSelectionFilteredOnly: {
        supportedRowModels: ['clientSide'],
        validate: (_options, { rowSelection }) =>
            rowSelection === 'multiple'
                ? null
                : 'headerCheckboxSelectionFilteredOnly is only supported with rowSelection=multiple',
    },
    headerCheckboxSelectionCurrentPageOnly: {
        supportedRowModels: ['clientSide'],
        validate: (_options, { rowSelection }) =>
            rowSelection === 'multiple'
                ? null
                : 'headerCheckboxSelectionCurrentPageOnly is only supported with rowSelection=multiple',
    },

    autoHeight: {
        supportedRowModels: ['clientSide', 'serverSide'],
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
    sortingOrder: {
        validate: (_options) => {
            const sortingOrder = _options.sortingOrder;

            if (Array.isArray(sortingOrder) && sortingOrder.length > 0) {
                sortingOrder.some((a) => !DEFAULT_SORTING_ORDER.includes(a));
                return `sortingOrder must be an array with elements from [${DEFAULT_SORTING_ORDER.join(', ')}], currently it includes ${sortingOrder}`;
            } else if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
                return `sortingOrder must be an array with at least one element, currently it's ${sortingOrder}`;
            }
            return null;
        },
    },

    filter: {
        validate: (colDef, gridOptions) => {
            const { filter, field, filterValueGetter, filterParams } = colDef;
            if (filter === 'agGroupColumnFilter') {
                const warnings = [];
                if (field) {
                    warnings.push(
                        'Group Column Filter does not work with the colDef property "field". This property will be ignored.'
                    );
                }
                if (filterValueGetter) {
                    warnings.push(
                        'Group Column Filter does not work with the colDef property "filterValueGetter". This property will be ignored.'
                    );
                }
                if (filterParams) {
                    warnings.push(
                        'Group Column Filter does not work with the colDef property "filterParams". This property will be ignored.'
                    );
                }
                if (gridOptions.treeData) {
                    warnings.push(
                        'Group Column Filter does not work with Tree Data enabled. Please disable Tree Data, or use a different filter.'
                    );
                }
                if (warnings.length > 0) {
                    return warnings.join(' ');
                }
            }
            return null;
        },
    },

    children: () => COL_DEF_VALIDATORS,
};

type ColKey = keyof ColDef | keyof ColGroupDef;
const colDefPropertyMap: Record<ColKey, undefined> = {
    headerName: undefined,
    columnGroupShow: undefined,
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
};
const ALL_PROPERTIES: ColKey[] = Object.keys(colDefPropertyMap) as ColKey[];

export const COL_DEF_VALIDATORS: OptionsValidator<ColDef | ColGroupDef> = {
    objectName: 'colDef',
    allProperties: ALL_PROPERTIES,
    docsUrl: 'column-properties/',
    deprecations: COLUMN_DEFINITION_DEPRECATIONS,
    validations: COLUMN_DEFINITION_VALIDATIONS,
};
