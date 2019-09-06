/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ColDefUtil = /** @class */ (function () {
    function ColDefUtil() {
    }
    ColDefUtil.STRING_PROPERTIES = [
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
        'tooltipComponent',
        'tooltipField',
        'headerTooltip',
        'cellClass',
        'showRowGroup',
        'template',
        'templateUrl',
        'filter',
        'aggFunc',
        'cellRenderer',
        'cellEditor',
        'pinned',
        'chartDataType'
    ];
    ColDefUtil.OBJECT_PROPERTIES = [
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
        'tooltipComponent',
        'tooltipComponentParams',
        'tooltipComponentFramework',
        'refData'
    ];
    ColDefUtil.ARRAY_PROPERTIES = [
        'children',
        'sortingOrder',
        'allowedAggFuncs',
        'menuTabs',
        'pivotTotalColumnIds',
        'cellClassRules',
        'icons'
    ];
    ColDefUtil.NUMBER_PROPERTIES = [
        'sortedAt',
        'width',
        'minWidth',
        'maxWidth',
        'rowGroupIndex',
        'pivotIndex'
    ];
    ColDefUtil.BOOLEAN_PROPERTIES = [
        'suppressCellFlash',
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
        'rowDrag',
        'dndSource',
        'autoHeight',
        'sortable',
        'resizable',
        'singleClickEdit'
    ];
    ColDefUtil.FUNCTION_PROPERTIES = [
        'dndSourceOnRowDrag',
        'valueGetter',
        'valueSetter',
        'filterValueGetter',
        'keyCreator',
        'cellRenderer',
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
        'rowSpan',
        'getQuickFilterText',
        'newValueHandler',
        'onCellValueChanged',
        'onCellClicked',
        'onCellDoubleClicked',
        'onCellContextMenu',
        'tooltip',
        'tooltipValueGetter',
        'tooltipComponent',
        'tooltipComponentFramework',
        'cellRendererSelector',
        'cellEditorSelector'
    ];
    ColDefUtil.ALL_PROPERTIES = ColDefUtil.ARRAY_PROPERTIES
        .concat(ColDefUtil.OBJECT_PROPERTIES)
        .concat(ColDefUtil.STRING_PROPERTIES)
        .concat(ColDefUtil.NUMBER_PROPERTIES)
        .concat(ColDefUtil.FUNCTION_PROPERTIES)
        .concat(ColDefUtil.BOOLEAN_PROPERTIES);
    // used when doing property checks - this causes noise when using frameworks which can add their own fw specific
    // properties to colDefs, gridOptions etc
    ColDefUtil.FRAMEWORK_PROPERTIES = ['__ob__', '__metadata__', 'mappedColumnProperties', 'hasChildColumns',
        'toColDef', 'createColDefFromGridColumn'];
    return ColDefUtil;
}());
exports.ColDefUtil = ColDefUtil;
