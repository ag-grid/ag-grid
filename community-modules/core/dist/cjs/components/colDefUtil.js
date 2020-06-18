/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
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
        'flex',
        'width',
        'minWidth',
        'maxWidth',
        'rowGroupIndex',
        'pivotIndex'
    ];
    ColDefUtil.BOOLEAN_PROPERTIES = [
        'suppressCellFlash',
        'suppressColumnsToolPanel',
        'suppressFiltersToolPanel',
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
        'singleClickEdit',
        'floatingFilter',
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
        'rowDragText',
        'tooltip',
        'tooltipValueGetter',
        'tooltipComponent',
        'tooltipComponentFramework',
        'cellRendererSelector',
        'cellEditorSelector'
    ];
    ColDefUtil.ALL_PROPERTIES = __spreadArrays(ColDefUtil.ARRAY_PROPERTIES, ColDefUtil.OBJECT_PROPERTIES, ColDefUtil.STRING_PROPERTIES, ColDefUtil.NUMBER_PROPERTIES, ColDefUtil.FUNCTION_PROPERTIES, ColDefUtil.BOOLEAN_PROPERTIES);
    // used when doing property checks - this causes noise when using frameworks which can add their own fw specific
    // properties to colDefs, gridOptions etc
    ColDefUtil.FRAMEWORK_PROPERTIES = ['__ob__', '__metadata__', 'mappedColumnProperties', 'hasChildColumns',
        'toColDef', 'createColDefFromGridColumn'];
    return ColDefUtil;
}());
exports.ColDefUtil = ColDefUtil;

//# sourceMappingURL=colDefUtil.js.map
