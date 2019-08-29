"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var AgGridColumn = /** @class */ (function () {
    function AgGridColumn() {
    }
    AgGridColumn.prototype.hasChildColumns = function () {
        if (this.childColumns && this.childColumns.length > 0) {
            // necessary because of https://github.com/angular/angular/issues/10098
            return !(this.childColumns.length === 1 && this.childColumns.first === this);
        }
        return false;
    };
    AgGridColumn.prototype.toColDef = function () {
        var colDef = this.createColDefFromGridColumn(this);
        if (this.hasChildColumns()) {
            colDef["children"] = this.getChildColDefs(this.childColumns);
        }
        return colDef;
    };
    AgGridColumn.prototype.getChildColDefs = function (childColumns) {
        return childColumns
            // necessary because of https://github.com/angular/angular/issues/10098
            .filter(function (column) { return !column.hasChildColumns(); })
            .map(function (column) {
            return column.toColDef();
        });
    };
    ;
    AgGridColumn.prototype.createColDefFromGridColumn = function (from) {
        var colDef = {};
        Object.assign(colDef, from);
        delete colDef.childColumns;
        return colDef;
    };
    ;
    // @END@
    AgGridColumn.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'ag-grid-column',
                    template: ''
                },] },
    ];
    /** @nocollapse */
    AgGridColumn.ctorParameters = function () { return []; };
    AgGridColumn.propDecorators = {
        'childColumns': [{ type: core_1.ContentChildren, args: [AgGridColumn,] },],
        'children': [{ type: core_1.Input },],
        'sortingOrder': [{ type: core_1.Input },],
        'allowedAggFuncs': [{ type: core_1.Input },],
        'menuTabs': [{ type: core_1.Input },],
        'cellClassRules': [{ type: core_1.Input },],
        'icons': [{ type: core_1.Input },],
        'headerGroupComponent': [{ type: core_1.Input },],
        'headerGroupComponentFramework': [{ type: core_1.Input },],
        'headerGroupComponentParams': [{ type: core_1.Input },],
        'cellStyle': [{ type: core_1.Input },],
        'cellRendererParams': [{ type: core_1.Input },],
        'cellEditorFramework': [{ type: core_1.Input },],
        'cellEditorParams': [{ type: core_1.Input },],
        'pinnedRowCellRendererFramework': [{ type: core_1.Input },],
        'pinnedRowCellRendererParams': [{ type: core_1.Input },],
        'filterFramework': [{ type: core_1.Input },],
        'filterParams': [{ type: core_1.Input },],
        'headerComponent': [{ type: core_1.Input },],
        'headerComponentFramework': [{ type: core_1.Input },],
        'headerComponentParams': [{ type: core_1.Input },],
        'floatingFilterComponent': [{ type: core_1.Input },],
        'floatingFilterComponentParams': [{ type: core_1.Input },],
        'floatingFilterComponentFramework': [{ type: core_1.Input },],
        'tooltipComponent': [{ type: core_1.Input },],
        'tooltipComponentParams': [{ type: core_1.Input },],
        'tooltipComponentFramework': [{ type: core_1.Input },],
        'refData': [{ type: core_1.Input },],
        'headerName': [{ type: core_1.Input },],
        'columnGroupShow': [{ type: core_1.Input },],
        'headerClass': [{ type: core_1.Input },],
        'toolPanelClass': [{ type: core_1.Input },],
        'headerValueGetter': [{ type: core_1.Input },],
        'groupId': [{ type: core_1.Input },],
        'colId': [{ type: core_1.Input },],
        'sort': [{ type: core_1.Input },],
        'field': [{ type: core_1.Input },],
        'type': [{ type: core_1.Input },],
        'tooltipField': [{ type: core_1.Input },],
        'headerTooltip': [{ type: core_1.Input },],
        'cellClass': [{ type: core_1.Input },],
        'showRowGroup': [{ type: core_1.Input },],
        'filter': [{ type: core_1.Input },],
        'aggFunc': [{ type: core_1.Input },],
        'cellRenderer': [{ type: core_1.Input },],
        'cellEditor': [{ type: core_1.Input },],
        'pinned': [{ type: core_1.Input },],
        'chartDataType': [{ type: core_1.Input },],
        'sortedAt': [{ type: core_1.Input },],
        'width': [{ type: core_1.Input },],
        'minWidth': [{ type: core_1.Input },],
        'maxWidth': [{ type: core_1.Input },],
        'rowGroupIndex': [{ type: core_1.Input },],
        'pivotIndex': [{ type: core_1.Input },],
        'dndSourceOnRowDrag': [{ type: core_1.Input },],
        'valueGetter': [{ type: core_1.Input },],
        'valueSetter': [{ type: core_1.Input },],
        'filterValueGetter': [{ type: core_1.Input },],
        'keyCreator': [{ type: core_1.Input },],
        'cellRendererFramework': [{ type: core_1.Input },],
        'pinnedRowCellRenderer': [{ type: core_1.Input },],
        'valueFormatter': [{ type: core_1.Input },],
        'pinnedRowValueFormatter': [{ type: core_1.Input },],
        'valueParser': [{ type: core_1.Input },],
        'comparator': [{ type: core_1.Input },],
        'equals': [{ type: core_1.Input },],
        'pivotComparator': [{ type: core_1.Input },],
        'suppressKeyboardEvent': [{ type: core_1.Input },],
        'colSpan': [{ type: core_1.Input },],
        'rowSpan': [{ type: core_1.Input },],
        'getQuickFilterText': [{ type: core_1.Input },],
        'newValueHandler': [{ type: core_1.Input },],
        'onCellValueChanged': [{ type: core_1.Input },],
        'onCellClicked': [{ type: core_1.Input },],
        'onCellDoubleClicked': [{ type: core_1.Input },],
        'onCellContextMenu': [{ type: core_1.Input },],
        'tooltip': [{ type: core_1.Input },],
        'tooltipValueGetter': [{ type: core_1.Input },],
        'cellRendererSelector': [{ type: core_1.Input },],
        'cellEditorSelector': [{ type: core_1.Input },],
        'suppressCellFlash': [{ type: core_1.Input },],
        'suppressToolPanel': [{ type: core_1.Input },],
        'openByDefault': [{ type: core_1.Input },],
        'marryChildren': [{ type: core_1.Input },],
        'hide': [{ type: core_1.Input },],
        'rowGroup': [{ type: core_1.Input },],
        'pivot': [{ type: core_1.Input },],
        'checkboxSelection': [{ type: core_1.Input },],
        'headerCheckboxSelection': [{ type: core_1.Input },],
        'headerCheckboxSelectionFilteredOnly': [{ type: core_1.Input },],
        'suppressMenu': [{ type: core_1.Input },],
        'suppressSorting': [{ type: core_1.Input },],
        'suppressMovable': [{ type: core_1.Input },],
        'suppressFilter': [{ type: core_1.Input },],
        'lockPosition': [{ type: core_1.Input },],
        'lockVisible': [{ type: core_1.Input },],
        'lockPinned': [{ type: core_1.Input },],
        'unSortIcon': [{ type: core_1.Input },],
        'suppressSizeToFit': [{ type: core_1.Input },],
        'suppressResize': [{ type: core_1.Input },],
        'suppressAutoSize': [{ type: core_1.Input },],
        'enableRowGroup': [{ type: core_1.Input },],
        'enablePivot': [{ type: core_1.Input },],
        'enableValue': [{ type: core_1.Input },],
        'editable': [{ type: core_1.Input },],
        'suppressPaste': [{ type: core_1.Input },],
        'suppressNavigable': [{ type: core_1.Input },],
        'enableCellChangeFlash': [{ type: core_1.Input },],
        'rowDrag': [{ type: core_1.Input },],
        'dndSource': [{ type: core_1.Input },],
        'autoHeight': [{ type: core_1.Input },],
        'sortable': [{ type: core_1.Input },],
        'resizable': [{ type: core_1.Input },],
        'singleClickEdit': [{ type: core_1.Input },],
    };
    return AgGridColumn;
}());
exports.AgGridColumn = AgGridColumn;
//# sourceMappingURL=agGridColumn.js.map