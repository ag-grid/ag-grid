/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
        'initialSort',
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
        'initialAggFunc',
        'aggFunc',
        'cellRenderer',
        'cellEditor',
        'pinned',
        'initialPinned',
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
        'refData',
        'columnsMenuParams'
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
        'initialPivotIndex'
    ];
    ColDefUtil.BOOLEAN_PROPERTIES = [
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
    ColDefUtil.ALL_PROPERTIES = __spreadArrays(ColDefUtil.ARRAY_PROPERTIES, ColDefUtil.OBJECT_PROPERTIES, ColDefUtil.STRING_PROPERTIES, ColDefUtil.NUMBER_PROPERTIES, ColDefUtil.FUNCTION_PROPERTIES, ColDefUtil.BOOLEAN_PROPERTIES);
    // used when doing property checks - this causes noise when using frameworks which can add their own fw specific
    // properties to colDefs, gridOptions etc
    ColDefUtil.FRAMEWORK_PROPERTIES = ['__ob__', '__v_skip', '__metadata__', 'mappedColumnProperties', 'hasChildColumns',
        'toColDef', 'createColDefFromGridColumn'];
    return ColDefUtil;
}());
exports.ColDefUtil = ColDefUtil;

//# sourceMappingURL=colDefUtil.js.map
