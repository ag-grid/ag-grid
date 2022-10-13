import { ColDef, ColGroupDef } from "../main";

type ColKey = keyof (ColDef) | (keyof ColGroupDef);

export class ColDefUtil {
    public static STRING_PROPERTIES: ColKey[] = [
        'headerName',
        'columnGroupShow',
        'headerClass',
        'toolPanelClass',
        'headerValueGetter',
        'pivotKeys',
        'groupId',
        'colId',
        'sort',
        'initialSort',
        'field',
        'type',
        'tooltipComponent',
        'tooltipField',
        'headerTooltip',
        'cellClass',
        'showRowGroup',
        'filter',
        'initialAggFunc',
        'defaultAggFunc',
        'aggFunc',
        'pinned',
        'initialPinned',
        'chartDataType',
        'cellEditorPopupPosition'
    ];

    public static OBJECT_PROPERTIES: ColKey[] = [
        'headerGroupComponent',
        'headerGroupComponentFramework',
        'headerGroupComponentParams',
        'cellStyle',
        'cellRenderer',
        'cellRendererParams',
        'cellRendererFramework',
        'cellEditor',
        'cellEditorFramework',
        'cellEditorParams',
        'pinnedRowCellRendererFramework',
        'pinnedRowCellRendererParams',
        'filterFramework',
        'filterParams',
        'pivotValueColumn',
        'headerComponent',
        'headerComponentFramework',
        'headerComponentParams',
        'floatingFilterComponent',
        'floatingFilterComponentParams',
        'floatingFilterComponentFramework',
        'tooltipComponent',
        'tooltipComponentParams',
        'tooltipComponentFramework',
        'refData',
        'columnsMenuParams'
    ];

    public static ARRAY_PROPERTIES: ColKey[] = [
        'children',
        'sortingOrder',
        'allowedAggFuncs',
        'menuTabs',
        'pivotTotalColumnIds',
        'cellClassRules',
        'icons'];

    public static NUMBER_PROPERTIES: ColKey[] = [
        'sortedAt',
        'sortIndex',
        'initialSortIndex',
        'flex',
        'initialFlex',
        'width',
        'initialWidth',
        'minWidth',
        'maxWidth',
        'rowGroupIndex',
        'initialRowGroupIndex',
        'pivotIndex',
        'initialPivotIndex'];

    public static BOOLEAN_PROPERTIES: ColKey[] = [
        'suppressCellFlash',
        'suppressColumnsToolPanel',
        'suppressFiltersToolPanel',
        'openByDefault',
        'marryChildren',
        'hide',
        'initialHide',
        'rowGroup',
        'initialRowGroup',
        'pivot',
        'initialPivot',
        'checkboxSelection',
        'showDisabledCheckboxes',
        'headerCheckboxSelection',
        'headerCheckboxSelectionFilteredOnly',
        'suppressMenu',
        'suppressMovable',
        'lockPosition',
        'lockVisible',
        'lockPinned',
        'unSortIcon',
        'suppressSizeToFit',
        'suppressAutoSize',
        'enableRowGroup',
        'enablePivot',
        'enableValue',
        'editable',
        'suppressPaste',
        'suppressNavigable',
        'enableCellChangeFlash',
        'rowDrag',
        'dndSource',
        'autoHeight',
        'wrapText',
        'sortable',
        'resizable',
        'singleClickEdit',
        'floatingFilter',
        'cellEditorPopup',
        'suppressFillHandle',
        'wrapHeaderText',
        'autoHeaderHeight'
    ];

    public static FUNCTION_PROPERTIES: ColKey[] = [
        'dndSourceOnRowDrag',
        'valueGetter',
        'valueSetter',
        'filterValueGetter',
        'keyCreator',
        'pinnedRowCellRenderer',
        'valueFormatter',
        'pinnedRowValueFormatter',
        'valueParser',
        'comparator',
        'equals',
        'pivotComparator',
        'suppressKeyboardEvent',
        'suppressHeaderKeyboardEvent',
        'colSpan',
        'rowSpan',
        'getQuickFilterText',
        'newValueHandler',
        'onCellValueChanged',
        'onCellClicked',
        'onCellDoubleClicked',
        'onCellContextMenu',
        'rowDragText',
        'tooltipValueGetter',
        'tooltipComponent',
        'tooltipComponentFramework',
        'cellRendererSelector',
        'cellEditorSelector'
    ];

    public static ALL_PROPERTIES: ColKey[] = [
        ...ColDefUtil.ARRAY_PROPERTIES,
        ...ColDefUtil.OBJECT_PROPERTIES,
        ...ColDefUtil.STRING_PROPERTIES,
        ...ColDefUtil.NUMBER_PROPERTIES,
        ...ColDefUtil.FUNCTION_PROPERTIES,
        ...ColDefUtil.BOOLEAN_PROPERTIES
    ];

    // used when doing property checks - this causes noise when using frameworks which can add their own fw specific
    // properties to colDefs, gridOptions etc
    public static FRAMEWORK_PROPERTIES = [
        '__ob__',
        '__v_skip',
        '__metadata__',
        'mappedColumnProperties',
        'hasChildColumns',
        'toColDef',
        'createColDefFromGridColumn'
    ];
}
