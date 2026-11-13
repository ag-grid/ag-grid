import { _hasCalculatedExpression, _isCalculatedColumnsEnabled } from '../../columns/calculatedColumnUtils';
import type { UserComponentName } from '../../context/context';
import { _isSortDefValid, isSortDirectionValid } from '../../entities/agColumn';
import type { AbstractColDef, ColDef, ColGroupDef, ColumnMenuTab } from '../../entities/colDef';
import { toStringWithNullUndefined } from '../logging';
import type { Deprecations, ModuleValidation, OptionsValidator, Validations } from '../validationTypes';
import { _createValidationWarning, buildAllValidNames } from '../validationTypes';
import { USER_COMP_MODULES } from './userCompValidations';

function quote(s: string): string {
    return `"${s}"`;
}

const COLUMN_DEFINITION_DEPRECATIONS: () => Deprecations<ColDef | ColGroupDef> = () => ({
    headerTooltipValueGetter: {
        version: '36.2',
        message: 'Use `headerTooltip` with a callback instead.',
    },
    tooltipField: {
        version: '36.2',
        message: 'Use `tooltip` with a callback instead.',
    },
    tooltipValueGetter: {
        version: '36.2',
        message: 'Use `tooltip` with a callback instead.',
    },
});

export const COLUMN_DEFINITION_MOD_VALIDATIONS: ModuleValidation<ColDef | ColGroupDef> = {
    allowFormula: 'Formula',
    calculatedExpression: 'CalculatedColumns',
    calculatedColumnReadOnly: 'CalculatedColumns',
    aggFunc: 'SharedAggregation',
    showValuesAs: 'ShowValuesAs',
    initialShowValuesAs: 'ShowValuesAs',
    showValuesAsDef: 'ShowValuesAs',
    enableShowValuesAs: 'ShowValuesAs',
    autoHeight: 'RowAutoHeight',
    cellClass: 'CellStyle',
    cellClassRules: 'CellStyle',
    cellEditor: ({ cellEditor, editable, groupRowEditable }: ColDef) => {
        const editingEnabled = !!editable || !!groupRowEditable;
        if (!editingEnabled) {
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
    groupRowEditable: ({ groupRowEditable, cellEditor }: ColDef) => {
        if (!groupRowEditable) {
            return null;
        }
        return cellEditor ? 'RowGroupingEdit' : ['RowGroupingEdit', 'TextEditor'];
    },
    groupRowValueSetter: ({ groupRowValueSetter }: ColDef) => (groupRowValueSetter ? 'RowGroupingEdit' : null),
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
    headerTooltipValueGetter: 'Tooltip',
    mainMenuItems: 'ColumnMenu',
    columnMenuItems: ['ColumnMenu', 'ColumnsToolPanel'],
    menuTabs: (options: ColDef) => {
        const enterpriseMenuTabs: ColumnMenuTab[] = ['columnsMenuTab', 'generalMenuTab'];
        if (options.menuTabs?.some((tab) => enterpriseMenuTabs.includes(tab))) {
            return 'ColumnMenu';
        }
        return null;
    },
    pivot: 'SharedPivot',
    pivotIndex: 'SharedPivot',
    pivotSort: 'SharedPivot',
    initialPivotSort: 'SharedPivot',
    rowDrag: 'RowDrag',
    rowGroup: 'SharedRowGrouping',
    rowGroupIndex: 'SharedRowGrouping',
    tooltip: 'Tooltip',
    tooltipField: 'Tooltip',
    tooltipValueGetter: 'Tooltip',
    tooltipComponentSelector: 'Tooltip',
    spanRows: 'CellSpan',
    groupHierarchy: 'SharedRowGrouping',
};

const COLUMN_DEFINITION_VALIDATIONS: () => Validations<ColDef | ColGroupDef> = () => {
    const validations: Validations<ColDef | ColGroupDef> = {
        autoHeight: {
            supportedRowModels: ['clientSide', 'serverSide'],
            validate: (_colDef, { paginationAutoPageSize }) => {
                if (paginationAutoPageSize) {
                    return _createValidationWarning(318, {
                        feature: '`colDef.autoHeight`',
                        conflictsWith: '`paginationAutoPageSize`',
                    });
                }
                return null;
            },
        },
        allowFormula: {
            supportedRowModels: ['clientSide'],
        },
        showValuesAs: {
            supportedRowModels: ['clientSide'],
        },
        initialShowValuesAs: {
            supportedRowModels: ['clientSide'],
        },
        showValuesAsDef: {
            supportedRowModels: ['clientSide'],
        },
        enableShowValuesAs: {
            supportedRowModels: ['clientSide'],
        },
        calculatedExpression: {
            validate: (colDef, gridOptions) => {
                if (!_hasCalculatedExpression(colDef)) {
                    return null;
                }
                if (!_isCalculatedColumnsEnabled(gridOptions.calculatedColumns)) {
                    return _createValidationWarning(319, {
                        feature: '`colDef.calculatedExpression`',
                        requirement: '`gridOptions.calculatedColumns` to be set to true or an options object',
                    });
                }
                if (colDef.pivotValueColumn) {
                    // pivot result colDefs add field/valueGetter internally after copying the value column colDef.
                    return null;
                }
                if (!colDef.colId) {
                    return _createValidationWarning(319, {
                        feature: '`colDef.calculatedExpression`',
                        requirement: '`colId` to be set on the calculated column',
                    });
                }
                if (colDef.field || colDef.valueGetter || colDef.valueSetter) {
                    return 'colDef.calculatedExpression is used as the value source and should not be combined with field, valueGetter or valueSetter.';
                }
                if (colDef.editable) {
                    return 'colDef.calculatedExpression columns are read-only and should not be combined with editable.';
                }
                return null;
            },
        },
        flex: {
            validate: (_options, gridOptions) => {
                if (gridOptions.autoSizeStrategy) {
                    return _createValidationWarning(318, {
                        feature: '`colDef.flex`',
                        conflictsWith: '`gridOptions.autoSizeStrategy`',
                    });
                }
                return null;
            },
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
        sort: {
            validate: (_options) => {
                if (_isSortDefValid(_options.sort) || isSortDirectionValid(_options.sort)) {
                    return null;
                }

                return `sort must be of type (SortDirection | SortDef), currently it is ${typeof _options.sort === 'object' ? JSON.stringify(_options.sort) : toStringWithNullUndefined(_options.sort)}`;
            },
        },
        initialSort: {
            validate: (_options) => {
                if (_isSortDefValid(_options.initialSort) || isSortDirectionValid(_options.initialSort)) {
                    return null;
                }

                return `initialSort must be of non-null type (SortDirection | SortDef), currently it is ${typeof _options.initialSort === 'object' ? JSON.stringify(_options.initialSort) : toStringWithNullUndefined(_options.initialSort)}`;
            },
        },
        sortingOrder: {
            validate: (_options) => {
                const sortingOrder = _options.sortingOrder;

                if (Array.isArray(sortingOrder) && sortingOrder.length > 0) {
                    const invalidItems = sortingOrder.filter((a) => {
                        return !(_isSortDefValid(a) || isSortDirectionValid(a));
                    });
                    if (invalidItems.length > 0) {
                        return _createValidationWarning(324, { property: 'sortingOrder', invalidItems });
                    }
                } else if (!Array.isArray(sortingOrder) || !sortingOrder.length) {
                    return _createValidationWarning(325, { property: 'sortingOrder', value: sortingOrder });
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
                return _createValidationWarning(321, {
                    property: 'colDef.type',
                    expected: 'of type `string` | `string[]`',
                });
            },
        },
        rowSpan: {
            validate: (_options, { suppressRowTransform }) => {
                if (!suppressRowTransform) {
                    return _createValidationWarning(319, {
                        feature: '`colDef.rowSpan`',
                        requirement: '`suppressRowTransform` to be enabled',
                    });
                }
                return null;
            },
        },
        spanRows: {
            dependencies: {
                editable: { required: [false, undefined] },
                groupRowEditable: { required: [false, undefined] },
                rowDrag: { required: [false, undefined] },
                colSpan: { required: [undefined] },
                rowSpan: { required: [undefined] },
            },
            validate: (
                _options,
                { rowSelection, cellSelection, enableCellSpan, rowDragEntireRow, enableCellTextSelection }
            ) => {
                if (typeof rowSelection === 'object') {
                    if (rowSelection?.mode === 'singleRow' && rowSelection?.enableClickSelection) {
                        return _createValidationWarning(318, {
                            feature: '`colDef.spanRows`',
                            conflictsWith: '`rowSelection.clickSelection`',
                        });
                    }
                }
                if (cellSelection) {
                    return _createValidationWarning(318, {
                        feature: '`colDef.spanRows`',
                        conflictsWith: '`cellSelection`',
                    });
                }
                if (!enableCellSpan) {
                    return _createValidationWarning(319, {
                        feature: '`colDef.spanRows`',
                        requirement: '`enableCellSpan` to be enabled',
                    });
                }
                if (rowDragEntireRow) {
                    return _createValidationWarning(318, {
                        feature: '`colDef.spanRows`',
                        conflictsWith: '`rowDragEntireRow`',
                    });
                }
                if (enableCellTextSelection) {
                    return _createValidationWarning(318, {
                        feature: '`colDef.spanRows`',
                        conflictsWith: '`enableCellTextSelection`',
                    });
                }

                return null;
            },
        },
        groupHierarchy: {
            validate(options, { groupHierarchyConfig = {} }, beans) {
                const GROUP_HIERARCHY_PARTS = new Set([
                    'year',
                    'quarter',
                    'month',
                    'formattedMonth',
                    'day',
                    'hour',
                    'minute',
                    'second',
                ]);

                const unrecognisedParts: string[] = [];

                for (const part of options.groupHierarchy ?? []) {
                    if (typeof part === 'object') {
                        beans.validation?.validateColDef(part);
                        continue;
                    }

                    if (!GROUP_HIERARCHY_PARTS.has(part) && !(part in groupHierarchyConfig)) {
                        unrecognisedParts.push(quote(part));
                    }
                }

                if (unrecognisedParts.length > 0) {
                    const warning = `The following parts of colDef.groupHierarchy are not recognised: ${unrecognisedParts.join(', ')}.`;
                    const suggestions = `Choose one of ${[...GROUP_HIERARCHY_PARTS].map(quote).join(', ')}, or define your own parts in gridOptions.groupHierarchyConfig.`;
                    return `${warning}\n${suggestions}`;
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
    headerNameEditable: undefined,
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
    tooltip: undefined,
    tooltipField: undefined,
    headerTooltip: undefined,
    headerTooltipValueGetter: undefined,
    cellClass: undefined,
    showRowGroup: undefined,
    filter: undefined,
    initialAggFunc: undefined,
    defaultAggFunc: undefined,
    aggFunc: undefined,
    valueIndex: undefined,
    initialValueIndex: undefined,
    groupRowEditable: undefined,
    groupRowValueSetter: undefined,
    pinned: undefined,
    initialPinned: undefined,
    chartDataType: undefined,
    cellAriaRole: undefined,
    cellEditorPopupPosition: undefined,
    headerGroupComponent: undefined,
    headerGroupComponentParams: undefined,
    calculatedExpression: undefined,
    calculatedColumnReadOnly: undefined,
    showValuesAs: undefined,
    initialShowValuesAs: undefined,
    showValuesAsDef: undefined,
    enableShowValuesAs: undefined,
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
    pivotSort: undefined,
    initialPivotSort: undefined,
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
    tooltipComponentSelector: undefined,
    cellRendererSelector: undefined,
    cellEditorSelector: undefined,
    suppressSpanHeaderHeight: undefined,
    useValueFormatterForExport: undefined,
    useValueParserForImport: undefined,
    mainMenuItems: undefined,
    columnMenuItems: undefined,
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
    groupHierarchy: undefined,
    allowFormula: undefined,
    suppressNoteActions: undefined,
};
const ALL_PROPERTIES: () => ColOrGroupKey[] = () => Object.keys(colDefPropertyMap) as ColOrGroupKey[];

let _colDefValidatorsCache: OptionsValidator<ColDef | ColGroupDef> | undefined;
export const COL_DEF_VALIDATORS: () => OptionsValidator<ColDef | ColGroupDef> = () =>
    (_colDefValidatorsCache ??= (() => {
        const allProperties = ALL_PROPERTIES();
        const deprecations = COLUMN_DEFINITION_DEPRECATIONS();
        return {
            objectName: 'colDef',
            allProperties,
            allValidNames: buildAllValidNames(allProperties, deprecations),
            docsUrl: 'column-properties/',
            deprecations,
            validations: COLUMN_DEFINITION_VALIDATIONS(),
        };
    })());
