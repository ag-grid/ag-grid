export class ColDefUtil {
    public static STRING_PROPERTIES = [
        'headerName',
        'columnGroupShow',
        'headerClass',
        'toolPanelClass',
        'headerValueGetter',
        'pivotKeys',
        'groupId',
        'colId',
        'sort',
        'field',
        'type',
        'tooltipField',
        'headerTooltip',
        'cellClass',
        'showRowGroup',
        'template',
        'templateUrl',
        'filter',
        'aggFunc',
        'cellEditor',
        'pinned'
    ];

    public static OBJECT_PROPERTIES = [
        'headerGroupComponent',
        'headerGroupComponentFramework',
        'headerGroupComponentParams',
        'cellStyle',
        'cellRendererParams',
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
        'refData'];

    public static ARRAY_PROPERTIES = [
        'children',
        'sortingOrder',
        'allowedAggFuncs',
        'menuTabs',
        'pivotTotalColumnIds',
        'cellClassRules',
        'icons'];

    public static NUMBER_PROPERTIES = [
        'sortedAt',
        'width',
        'minWidth',
        'maxWidth',
        'rowGroupIndex',
        'pivotIndex'];

    public static BOOLEAN_PROPERTIES = [
        'suppressToolPanel',
        'openByDefault',
        'marryChildren',
        'hide',
        'rowGroup',
        'pivot',
        'checkboxSelection',
        'headerCheckboxSelection',
        'headerCheckboxSelectionFilteredOnly',
        'suppressMenu',
        'suppressSorting',
        'suppressMovable',
        'suppressFilter',
        'lockPosition',
        'lockVisible',
        'lockPinned',
        'unSortIcon',
        'suppressSizeToFit',
        'suppressResize',
        'suppressAutoSize',
        'enableRowGroup',
        'enablePivot',
        'enableValue',
        'editable',
        'suppressPaste',
        'suppressNavigable',
        'enableCellChangeFlash',
        'rowDrag'
    ];

    public static FUNCTION_PROPERTIES = [
        'valueGetter',
        'valueSetter',
        'keyCreator',
        'cellRendererFramework',
        'pinnedRowCellRenderer',
        'valueFormatter',
        'pinnedRowValueFormatter',
        'valueParser',
        'comparator',
        'equals',
        'pivotComparator',
        'suppressKeyboardEvent',
        'colSpan',
        'getQuickFilterText',
        'newValueHandler',
        'onCellValueChanged',
        'onCellClicked',
        'onCellDoubleClicked',
        'onCellContextMenu',
        'tooltip'];

    public static ALL_PROPERTIES = ColDefUtil.ARRAY_PROPERTIES
        .concat(ColDefUtil.OBJECT_PROPERTIES)
        .concat(ColDefUtil.STRING_PROPERTIES)
        .concat(ColDefUtil.NUMBER_PROPERTIES)
        .concat(ColDefUtil.FUNCTION_PROPERTIES)
        .concat(ColDefUtil.BOOLEAN_PROPERTIES);
}
