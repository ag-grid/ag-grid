import { __decorate, __metadata, __rest } from "tslib";
// @END_IMPORTS@
import { Component, ContentChildren, Input, QueryList } from "@angular/core";
var AgGridColumn = /** @class */ (function () {
    function AgGridColumn() {
    }
    AgGridColumn_1 = AgGridColumn;
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
    AgGridColumn.prototype.createColDefFromGridColumn = function (from) {
        var childColumns = from.childColumns, colDef = __rest(from, ["childColumns"]);
        return colDef;
    };
    var AgGridColumn_1;
    __decorate([
        ContentChildren(AgGridColumn_1),
        __metadata("design:type", QueryList)
    ], AgGridColumn.prototype, "childColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "filterFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "filterParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "floatingFilterComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "floatingFilterComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "floatingFilterComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "floatingFilterFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "filter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerValueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerTooltip", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressHeaderKeyboardEvent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "columnGroupShow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "toolPanelClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressColumnsToolPanel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressFiltersToolPanel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "children", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "groupId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "openByDefault", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "marryChildren", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerGroupComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerGroupComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerGroupComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "colId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "field", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "type", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueFormatter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "refData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "keyCreator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "equals", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipField", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipValueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "checkboxSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "showDisabledCheckboxes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "icons", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressNavigable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressKeyboardEvent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressPaste", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressFillHandle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "hide", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialHide", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "lockVisible", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "lockPosition", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressMovable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "editable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueSetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueParser", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditor", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditorFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditorParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditorSelector", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "singleClickEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "newValueHandler", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditorPopup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditorPopupPosition", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "onCellValueChanged", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "onCellClicked", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "onCellDoubleClicked", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "onCellContextMenu", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "getQuickFilterText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "filterValueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "floatingFilter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "wrapHeaderText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "autoHeaderHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "menuTabs", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "columnsMenuParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressMenu", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerCheckboxSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerCheckboxSelectionFilteredOnly", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "chartDataType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinned", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialPinned", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "lockPinned", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowCellRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowCellRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowCellRendererParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowValueFormatter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pivot", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialPivot", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pivotIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialPivotIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pivotComparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "enablePivot", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellStyle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellClassRules", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRendererParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRendererSelector", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "autoHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "wrapText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "enableCellChangeFlash", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressCellFlash", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "rowDrag", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "rowDragText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "dndSource", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "dndSourceOnRowDrag", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "rowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialRowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "rowGroupIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialRowGroupIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "enableRowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "enableValue", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "aggFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialAggFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "defaultAggFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "allowedAggFuncs", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "showRowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "sortable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "sort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "sortIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialSortIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "sortingOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "comparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "unSortIcon", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "sortedAt", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "colSpan", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "rowSpan", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "width", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "minWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "maxWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "flex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialFlex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "resizable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressSizeToFit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressAutoSize", void 0);
    AgGridColumn = AgGridColumn_1 = __decorate([
        Component({
            selector: 'ag-grid-column',
            template: ''
        })
    ], AgGridColumn);
    return AgGridColumn;
}());
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGFnLWdyaWQtY29tbXVuaXR5L2FuZ3VsYXItbGVnYWN5LyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBMkNBLGdCQUFnQjtBQUNoQixPQUFPLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBTTdFO0lBQUE7SUF1WkEsQ0FBQztxQkF2WlksWUFBWTtJQUdkLHNDQUFlLEdBQXRCO1FBQ0ksSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRCx1RUFBdUU7WUFDdkUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLCtCQUFRLEdBQWY7UUFDSSxJQUFJLE1BQU0sR0FBVyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDbEIsTUFBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLHNDQUFlLEdBQXZCLFVBQXdCLFlBQXFDO1FBQ3pELE9BQU8sWUFBWTtZQUNmLHVFQUF1RTthQUN0RSxNQUFNLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBekIsQ0FBeUIsQ0FBQzthQUMzQyxHQUFHLENBQUMsVUFBQyxNQUFvQjtZQUN0QixPQUFPLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFTyxpREFBMEIsR0FBbEMsVUFBbUMsSUFBa0I7UUFDM0MsSUFBQSxnQ0FBWSxFQUFFLHVDQUFTLENBQVU7UUFDdkMsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQzs7SUEvQjhCO1FBQTlCLGVBQWUsQ0FBQyxjQUFZLENBQUM7a0NBQXNCLFNBQVM7c0RBQWU7SUFtQ25FO1FBQVIsS0FBSyxFQUFFOzt5REFBNkI7SUFDNUI7UUFBUixLQUFLLEVBQUU7O3NEQUEwQjtJQUN6QjtRQUFSLEtBQUssRUFBRTs7aUVBQXFDO0lBQ3BDO1FBQVIsS0FBSyxFQUFFOzt1RUFBMkM7SUFDMUM7UUFBUixLQUFLLEVBQUU7OzBFQUE4QztJQUM3QztRQUFSLEtBQUssRUFBRTs7aUVBQXFDO0lBQ3BDO1FBQVIsS0FBSyxFQUFFOztnREFBb0I7SUFFbkI7UUFBUixLQUFLLEVBQUU7O29EQUF1QztJQUV0QztRQUFSLEtBQUssRUFBRTs7MkRBQTZFO0lBRTVFO1FBQVIsS0FBSyxFQUFFOzt1REFBMEM7SUFFekM7UUFBUixLQUFLLEVBQUU7O3FEQUE2QztJQUU1QztRQUFSLEtBQUssRUFBRTs7cUVBQWlIO0lBRWhIO1FBQVIsS0FBSyxFQUFFOzt5REFBNEM7SUFFM0M7UUFBUixLQUFLLEVBQUU7O3dEQUEwRDtJQUV6RDtRQUFSLEtBQUssRUFBRTs7a0VBQXNEO0lBRXJEO1FBQVIsS0FBSyxFQUFFOztrRUFBc0Q7SUFHckQ7UUFBUixLQUFLLEVBQUU7OzBEQUE4QjtJQUc3QjtRQUFSLEtBQUssRUFBRTs7bUVBQXVDO0lBRXRDO1FBQVIsS0FBSyxFQUFFOztnRUFBb0M7SUFFbkM7UUFBUixLQUFLLEVBQUU7O2tEQUFxRTtJQUVwRTtRQUFSLEtBQUssRUFBRTs7aURBQW9DO0lBRW5DO1FBQVIsS0FBSyxFQUFFOzt1REFBMkM7SUFFMUM7UUFBUixLQUFLLEVBQUU7O3VEQUEyQztJQUcxQztRQUFSLEtBQUssRUFBRTs7OERBQWtDO0lBR2pDO1FBQVIsS0FBSyxFQUFFOzt1RUFBMkM7SUFFMUM7UUFBUixLQUFLLEVBQUU7O29FQUF3QztJQUl2QztRQUFSLEtBQUssRUFBRTs7K0NBQWtDO0lBR2pDO1FBQVIsS0FBSyxFQUFFOzsrQ0FBa0M7SUFHakM7UUFBUixLQUFLLEVBQUU7OzhDQUE0QztJQUUzQztRQUFSLEtBQUssRUFBRTs7cURBQWlFO0lBRWhFO1FBQVIsS0FBSyxFQUFFOzt3REFBdUU7SUFFdEU7UUFBUixLQUFLLEVBQUU7O2lEQUF3RDtJQUl2RDtRQUFSLEtBQUssRUFBRTs7b0RBQThFO0lBRzdFO1FBQVIsS0FBSyxFQUFFOztnREFBb0U7SUFFbkU7UUFBUixLQUFLLEVBQUU7O3NEQUF5QztJQUd4QztRQUFSLEtBQUssRUFBRTs7NERBQTBGO0lBRXpGO1FBQVIsS0FBSyxFQUFFOzsyREFBa0Y7SUFFakY7UUFBUixLQUFLLEVBQUU7O2dFQUFvRDtJQUVuRDtRQUFSLEtBQUssRUFBRTs7K0NBQWlFO0lBSWhFO1FBQVIsS0FBSyxFQUFFOzsyREFBa0Y7SUFFakY7UUFBUixLQUFLLEVBQUU7OytEQUFxRztJQUdwRztRQUFSLEtBQUssRUFBRTs7dURBQTBFO0lBRXpFO1FBQVIsS0FBSyxFQUFFOzs0REFBZ0Q7SUFFL0M7UUFBUixLQUFLLEVBQUU7OzhDQUFrQztJQUVqQztRQUFSLEtBQUssRUFBRTs7cURBQXlDO0lBRXhDO1FBQVIsS0FBSyxFQUFFOztxREFBeUM7SUFFeEM7UUFBUixLQUFLLEVBQUU7O3NEQUE2RDtJQUU1RDtRQUFSLEtBQUssRUFBRTs7eURBQTZDO0lBRTVDO1FBQVIsS0FBSyxFQUFFOztrREFBZ0U7SUFFL0Q7UUFBUixLQUFLLEVBQUU7O3FEQUFpRTtJQUVoRTtRQUFSLEtBQUssRUFBRTs7cURBQWlFO0lBR2hFO1FBQVIsS0FBSyxFQUFFOztvREFBd0I7SUFHdkI7UUFBUixLQUFLLEVBQUU7OzZEQUFpQztJQUVoQztRQUFSLEtBQUssRUFBRTs7MERBQThCO0lBRTdCO1FBQVIsS0FBSyxFQUFFOzs0REFBc0U7SUFFckU7UUFBUixLQUFLLEVBQUU7O3lEQUE2QztJQUc1QztRQUFSLEtBQUssRUFBRTs7eURBQWtGO0lBRWpGO1FBQVIsS0FBSyxFQUFFOzt5REFBNkM7SUFNNUM7UUFBUixLQUFLLEVBQUU7O2lFQUFvRDtJQUVuRDtRQUFSLEtBQUssRUFBRTs7NERBQWlGO0lBRWhGO1FBQVIsS0FBSyxFQUFFOzt1REFBOEU7SUFFN0U7UUFBUixLQUFLLEVBQUU7OzZEQUEwRjtJQUV6RjtRQUFSLEtBQUssRUFBRTs7MkRBQXNGO0lBRXJGO1FBQVIsS0FBSyxFQUFFOzs0REFBOEY7SUFFN0Y7UUFBUixLQUFLLEVBQUU7OzJEQUF1RTtJQUV0RTtRQUFSLEtBQUssRUFBRTs7d0RBQTRDO0lBRTNDO1FBQVIsS0FBSyxFQUFFOzt3REFBNEM7SUFJM0M7UUFBUixLQUFLLEVBQUU7OzBEQUE4QztJQUc3QztRQUFSLEtBQUssRUFBRTs7eURBQTZCO0lBRzVCO1FBQVIsS0FBSyxFQUFFOztrRUFBc0M7SUFFckM7UUFBUixLQUFLLEVBQUU7OytEQUFtQztJQUdsQztRQUFSLEtBQUssRUFBRTs7a0RBQXVDO0lBRXRDO1FBQVIsS0FBSyxFQUFFOzsyREFBeUQ7SUFFeEQ7UUFBUixLQUFLLEVBQUU7O3NEQUEwQztJQUV6QztRQUFSLEtBQUssRUFBRTs7aUVBQThGO0lBRTdGO1FBQVIsS0FBSyxFQUFFOzs2RUFBaUU7SUFFaEU7UUFBUixLQUFLLEVBQUU7O3VEQUErRTtJQUU5RTtRQUFSLEtBQUssRUFBRTs7Z0RBQThEO0lBRTdEO1FBQVIsS0FBSyxFQUFFOzt1REFBOEQ7SUFFN0Q7UUFBUixLQUFLLEVBQUU7O29EQUF3QztJQUd2QztRQUFSLEtBQUssRUFBRTs7K0RBQXNHO0lBR3JHO1FBQVIsS0FBSyxFQUFFOzt3RUFBNEM7SUFHM0M7UUFBUixLQUFLLEVBQUU7O3FFQUF5QztJQUd4QztRQUFSLEtBQUssRUFBRTs7aUVBQWdGO0lBRS9FO1FBQVIsS0FBSyxFQUFFOzsrQ0FBbUM7SUFFbEM7UUFBUixLQUFLLEVBQUU7O3NEQUEwQztJQUl6QztRQUFSLEtBQUssRUFBRTs7b0RBQThDO0lBRTdDO1FBQVIsS0FBSyxFQUFFOzsyREFBOEM7SUFHN0M7UUFBUixLQUFLLEVBQUU7O3lEQUFrRjtJQUVqRjtRQUFSLEtBQUssRUFBRTs7cURBQXlDO0lBRXhDO1FBQVIsS0FBSyxFQUFFOzttREFBZ0U7SUFFL0Q7UUFBUixLQUFLLEVBQUU7O21EQUF3RTtJQUV2RTtRQUFSLEtBQUssRUFBRTs7d0RBQTBEO0lBR3pEO1FBQVIsS0FBSyxFQUFFOztzREFBMEI7SUFHekI7UUFBUixLQUFLLEVBQUU7OytEQUFtQztJQUVsQztRQUFSLEtBQUssRUFBRTs7NERBQWdDO0lBRS9CO1FBQVIsS0FBSyxFQUFFOzs4REFBMEU7SUFFekU7UUFBUixLQUFLLEVBQUU7O29EQUF3QztJQUV2QztRQUFSLEtBQUssRUFBRTs7a0RBQXNDO0lBRXJDO1FBQVIsS0FBSyxFQUFFOzsrREFBbUQ7SUFFbEQ7UUFBUixLQUFLLEVBQUU7OzJEQUErQztJQUU5QztRQUFSLEtBQUssRUFBRTs7aURBQThEO0lBSTdEO1FBQVIsS0FBSyxFQUFFOztxREFBMkY7SUFFMUY7UUFBUixLQUFLLEVBQUU7O21EQUFrRTtJQUVqRTtRQUFSLEtBQUssRUFBRTs7NERBQTRGO0lBRTNGO1FBQVIsS0FBSyxFQUFFOztrREFBc0M7SUFFckM7UUFBUixLQUFLLEVBQUU7O3lEQUE2QztJQUk1QztRQUFSLEtBQUssRUFBRTs7dURBQWlEO0lBRWhEO1FBQVIsS0FBSyxFQUFFOzs4REFBaUQ7SUFJaEQ7UUFBUixLQUFLLEVBQUU7O3dEQUE0QztJQUkzQztRQUFSLEtBQUssRUFBRTs7cURBQXlDO0lBRXhDO1FBQVIsS0FBSyxFQUFFOztpREFBNkQ7SUFFNUQ7UUFBUixLQUFLLEVBQUU7O3dEQUE2RDtJQUk1RDtRQUFSLEtBQUssRUFBRTs7d0RBQTJDO0lBSTFDO1FBQVIsS0FBSyxFQUFFOzt5REFBOEM7SUFFN0M7UUFBUixLQUFLLEVBQUU7O3NEQUFtRDtJQUVsRDtRQUFSLEtBQUssRUFBRTs7a0RBQXNDO0lBRXJDO1FBQVIsS0FBSyxFQUFFOzs4Q0FBZ0Q7SUFFL0M7UUFBUixLQUFLLEVBQUU7O3FEQUF1RDtJQUV0RDtRQUFSLEtBQUssRUFBRTs7bURBQTZDO0lBRTVDO1FBQVIsS0FBSyxFQUFFOzswREFBNkM7SUFFNUM7UUFBUixLQUFLLEVBQUU7O3NEQUE0RDtJQVczRDtRQUFSLEtBQUssRUFBRTs7b0RBQTRJO0lBRTNJO1FBQVIsS0FBSyxFQUFFOztvREFBd0M7SUFHdkM7UUFBUixLQUFLLEVBQUU7O2tEQUFxQztJQUVwQztRQUFSLEtBQUssRUFBRTs7aURBQXdFO0lBRXZFO1FBQVIsS0FBSyxFQUFFOztpREFBd0U7SUFFdkU7UUFBUixLQUFLLEVBQUU7OytDQUFrQztJQUVqQztRQUFSLEtBQUssRUFBRTs7c0RBQXlDO0lBRXhDO1FBQVIsS0FBSyxFQUFFOztrREFBcUM7SUFFcEM7UUFBUixLQUFLLEVBQUU7O2tEQUFxQztJQUVwQztRQUFSLEtBQUssRUFBRTs7OENBQWlDO0lBRWhDO1FBQVIsS0FBSyxFQUFFOztxREFBd0M7SUFFdkM7UUFBUixLQUFLLEVBQUU7O21EQUF1QztJQUV0QztRQUFSLEtBQUssRUFBRTs7MkRBQStDO0lBRTlDO1FBQVIsS0FBSyxFQUFFOzswREFBOEM7SUF0VzdDLFlBQVk7UUFKeEIsU0FBUyxDQUFDO1lBQ1AsUUFBUSxFQUFFLGdCQUFnQjtZQUMxQixRQUFRLEVBQUUsRUFBRTtTQUNmLENBQUM7T0FDVyxZQUFZLENBdVp4QjtJQUFELG1CQUFDO0NBQUEsQUF2WkQsSUF1WkM7U0F2WlksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbIi8vIEBTVEFSVF9JTVBPUlRTQFxuaW1wb3J0IHtcbiAgICBDZWxsQ2xhc3NGdW5jLFxuICAgIENlbGxDbGFzc1J1bGVzLFxuICAgIENlbGxDbGlja2VkRXZlbnQsXG4gICAgQ2VsbENvbnRleHRNZW51RXZlbnQsXG4gICAgQ2VsbERvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBDZWxsRWRpdG9yU2VsZWN0b3JGdW5jLFxuICAgIENlbGxSZW5kZXJlclNlbGVjdG9yRnVuYyxcbiAgICBDZWxsU3R5bGUsXG4gICAgQ2VsbFN0eWxlRnVuYyxcbiAgICBDaGVja2JveFNlbGVjdGlvbkNhbGxiYWNrLFxuICAgIENvbERlZixcbiAgICBDb2xHcm91cERlZixcbiAgICBDb2xTcGFuUGFyYW1zLFxuICAgIENvbHVtbnNNZW51UGFyYW1zLFxuICAgIERuZFNvdXJjZUNhbGxiYWNrLFxuICAgIERuZFNvdXJjZU9uUm93RHJhZ1BhcmFtcyxcbiAgICBFZGl0YWJsZUNhbGxiYWNrLFxuICAgIEdldFF1aWNrRmlsdGVyVGV4dFBhcmFtcyxcbiAgICBIZWFkZXJDaGVja2JveFNlbGVjdGlvbkNhbGxiYWNrLFxuICAgIEhlYWRlckNsYXNzLFxuICAgIEhlYWRlclZhbHVlR2V0dGVyRnVuYyxcbiAgICBJQWdnRnVuYyxcbiAgICBJQ2VsbFJlbmRlcmVyQ29tcCxcbiAgICBJQ2VsbFJlbmRlcmVyRnVuYyxcbiAgICBJUm93RHJhZ0l0ZW0sXG4gICAgSVRvb2x0aXBQYXJhbXMsXG4gICAgS2V5Q3JlYXRvclBhcmFtcyxcbiAgICBOZXdWYWx1ZVBhcmFtcyxcbiAgICBSb3dEcmFnQ2FsbGJhY2ssXG4gICAgUm93Tm9kZSxcbiAgICBSb3dTcGFuUGFyYW1zLFxuICAgIFN1cHByZXNzSGVhZGVyS2V5Ym9hcmRFdmVudFBhcmFtcyxcbiAgICBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXMsXG4gICAgU3VwcHJlc3NOYXZpZ2FibGVDYWxsYmFjayxcbiAgICBTdXBwcmVzc1Bhc3RlQ2FsbGJhY2ssXG4gICAgVG9vbFBhbmVsQ2xhc3MsXG4gICAgVmFsdWVGb3JtYXR0ZXJGdW5jLFxuICAgIFZhbHVlR2V0dGVyRnVuYyxcbiAgICBWYWx1ZVBhcnNlckZ1bmMsXG4gICAgVmFsdWVTZXR0ZXJGdW5jXG59IGZyb20gXCJAYWctZ3JpZC1jb21tdW5pdHkvY29yZVwiO1xuLy8gQEVORF9JTVBPUlRTQFxuaW1wb3J0IHsgQ29tcG9uZW50LCBDb250ZW50Q2hpbGRyZW4sIElucHV0LCBRdWVyeUxpc3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtY29sdW1uJyxcbiAgICB0ZW1wbGF0ZTogJydcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQ29sdW1uPFREYXRhID0gYW55PiB7XG4gICAgQENvbnRlbnRDaGlsZHJlbihBZ0dyaWRDb2x1bW4pIHB1YmxpYyBjaGlsZENvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+O1xuXG4gICAgcHVibGljIGhhc0NoaWxkQ29sdW1ucygpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRDb2x1bW5zICYmIHRoaXMuY2hpbGRDb2x1bW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEwMDk4XG4gICAgICAgICAgICByZXR1cm4gISh0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPT09IDEgJiYgdGhpcy5jaGlsZENvbHVtbnMuZmlyc3QgPT09IHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9Db2xEZWYoKTogQ29sRGVmIHtcbiAgICAgICAgbGV0IGNvbERlZjogQ29sRGVmID0gdGhpcy5jcmVhdGVDb2xEZWZGcm9tR3JpZENvbHVtbih0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5oYXNDaGlsZENvbHVtbnMoKSkge1xuICAgICAgICAgICAgKDxhbnk+Y29sRGVmKVtcImNoaWxkcmVuXCJdID0gdGhpcy5nZXRDaGlsZENvbERlZnModGhpcy5jaGlsZENvbHVtbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDaGlsZENvbERlZnMoY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPikge1xuICAgICAgICByZXR1cm4gY2hpbGRDb2x1bW5zXG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgLmZpbHRlcihjb2x1bW4gPT4gIWNvbHVtbi5oYXNDaGlsZENvbHVtbnMoKSlcbiAgICAgICAgICAgIC5tYXAoKGNvbHVtbjogQWdHcmlkQ29sdW1uKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbi50b0NvbERlZigpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVDb2xEZWZGcm9tR3JpZENvbHVtbihmcm9tOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYge1xuICAgICAgICBsZXQgeyBjaGlsZENvbHVtbnMsIC4uLmNvbERlZiB9ID0gZnJvbTtcbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9XG5cbiAgICAvLyBpbnB1dHMgLSBwcmV0dHkgbXVjaCBtb3N0IG9mIENvbERlZiwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCBhbmQgaW50ZXJuYWwgb25seSBwcm9wZXJ0aWVzXG4gICAgLy8gQFNUQVJUQFxuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlcjogYW55O1xuICAgIC8qKiBUaGUgbmFtZSB0byByZW5kZXIgaW4gdGhlIGNvbHVtbiBoZWFkZXIuIElmIG5vdCBzcGVjaWZpZWQgYW5kIGZpZWxkIGlzIHNwZWNpZmllZCwgdGhlIGZpZWxkIG5hbWUgd2lsbCBiZSB1c2VkIGFzIHRoZSBoZWFkZXIgbmFtZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlck5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gR2V0cyB0aGUgdmFsdWUgZm9yIGRpc3BsYXkgaW4gdGhlIGhlYWRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlclZhbHVlR2V0dGVyOiBzdHJpbmcgfCBIZWFkZXJWYWx1ZUdldHRlckZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUb29sdGlwIGZvciB0aGUgY29sdW1uIGhlYWRlciAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVG9vbHRpcDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MgdG8gdXNlIGZvciB0aGUgaGVhZGVyIGNlbGwuIENhbiBiZSBhIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3IgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDbGFzczogSGVhZGVyQ2xhc3MgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFN1cHByZXNzIHRoZSBncmlkIHRha2luZyBhY3Rpb24gZm9yIHRoZSByZWxldmFudCBrZXlib2FyZCBldmVudCB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnQ6ICgocGFyYW1zOiBTdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnRQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogV2hldGhlciB0byBzaG93IHRoZSBjb2x1bW4gd2hlbiB0aGUgZ3JvdXAgaXMgb3BlbiAvIGNsb3NlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkdyb3VwU2hvdzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MgdG8gdXNlIGZvciB0aGUgdG9vbCBwYW5lbCBjZWxsLiBDYW4gYmUgYSBzdHJpbmcsIGFycmF5IG9mIHN0cmluZ3MsIG9yIGZ1bmN0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsQ2xhc3M6IFRvb2xQYW5lbENsYXNzPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gb3IgZ3JvdXAgdG8gYXBwZWFyIGluIHRoZSBDb2x1bW5zIFRvb2wgUGFuZWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gKGZpbHRlcikgb3IgZ3JvdXAgKGZpbHRlciBncm91cCkgdG8gYXBwZWFyIGluIHRoZSBGaWx0ZXJzIFRvb2wgUGFuZWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmlsdGVyc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biB0b29sdGlwIGNvbXBvbmVudCBmb3IgdGhlIGNvbHVtbi5cbiAgICAgKiBTZWUgW1Rvb2x0aXAgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtdG9vbHRpcC8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnQ6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYHRvb2x0aXBDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICAvKiogVGhlIHBhcmFtcyB1c2VkIHRvIGNvbmZpZ3VyZSBgdG9vbHRpcENvbXBvbmVudGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgLyoqIEEgbGlzdCBjb250YWluaW5nIGEgbWl4IG9mIGNvbHVtbnMgYW5kIGNvbHVtbiBncm91cHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGlsZHJlbjogKENvbERlZjxURGF0YT4gfCBDb2xHcm91cERlZjxURGF0YT4pW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSB1bmlxdWUgSUQgdG8gZ2l2ZSB0aGUgY29sdW1uLiBUaGlzIGlzIG9wdGlvbmFsLiBJZiBtaXNzaW5nLCBhIHVuaXF1ZSBJRCB3aWxsIGJlIGdlbmVyYXRlZC4gVGhpcyBJRCBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSBjb2x1bW4gZ3JvdXAgaW4gdGhlIGNvbHVtbiBBUEkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cElkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBncm91cCBzaG91bGQgYmUgb3BlbmVkIGJ5IGRlZmF1bHQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9wZW5CeURlZmF1bHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8ga2VlcCBjb2x1bW5zIGluIHRoaXMgZ3JvdXAgYmVzaWRlIGVhY2ggb3RoZXIgaW4gdGhlIGdyaWQuIE1vdmluZyB0aGUgY29sdW1ucyBvdXRzaWRlIG9mIHRoZSBncm91cCAoYW5kIGhlbmNlIGJyZWFraW5nIHRoZSBncm91cCkgaXMgbm90IGFsbG93ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1hcnJ5Q2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBjdXN0b20gaGVhZGVyIGdyb3VwIGNvbXBvbmVudCB0byBiZSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGNvbXBvbmVudCBoZWFkZXIuIElmIG5vbmUgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IEFHIEdyaWQgaXMgdXNlZC5cbiAgICAgKiBTZWUgW0hlYWRlciBHcm91cCBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1oZWFkZXIvI2hlYWRlci1ncm91cC1jb21wb25lbnRzLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnQ6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGhlYWRlckdyb3VwQ29tcG9uZW50YCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIC8qKiBUaGUgcGFyYW1zIHVzZWQgdG8gY29uZmlndXJlIHRoZSBgaGVhZGVyR3JvdXBDb21wb25lbnRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICAvKiogVGhlIHVuaXF1ZSBJRCB0byBnaXZlIHRoZSBjb2x1bW4uIFRoaXMgaXMgb3B0aW9uYWwuIElmIG1pc3NpbmcsIHRoZSBJRCB3aWxsIGRlZmF1bHQgdG8gdGhlIGZpZWxkLlxuICAgICAqIElmIGJvdGggZmllbGQgYW5kIGNvbElkIGFyZSBtaXNzaW5nLCBhIHVuaXF1ZSBJRCB3aWxsIGJlIGdlbmVyYXRlZC5cbiAgICAgKiBUaGlzIElEIGlzIHVzZWQgdG8gaWRlbnRpZnkgdGhlIGNvbHVtbiBpbiB0aGUgQVBJIGZvciBzb3J0aW5nLCBmaWx0ZXJpbmcgZXRjLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sSWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGZpZWxkIG9mIHRoZSByb3cgb2JqZWN0IHRvIGdldCB0aGUgY2VsbCdzIGRhdGEgZnJvbS5cbiAgICAgKiBEZWVwIHJlZmVyZW5jZXMgaW50byBhIHJvdyBvYmplY3QgaXMgc3VwcG9ydGVkIHZpYSBkb3Qgbm90YXRpb24sIGkuZSBgJ2FkZHJlc3MuZmlyc3RMaW5lJ2AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWVsZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncyBjb250YWluaW5nIGBDb2x1bW5UeXBlYCBrZXlzIHdoaWNoIGNhbiBiZSB1c2VkIGFzIGEgdGVtcGxhdGUgZm9yIGEgY29sdW1uLlxuICAgICAqIFRoaXMgaGVscHMgdG8gcmVkdWNlIGR1cGxpY2F0aW9uIG9mIHByb3BlcnRpZXMgd2hlbiB5b3UgaGF2ZSBhIGxvdCBvZiBjb21tb24gY29sdW1uIHByb3BlcnRpZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0eXBlOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gR2V0cyB0aGUgdmFsdWUgZnJvbSB5b3VyIGRhdGEgZm9yIGRpc3BsYXkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUdldHRlcjogc3RyaW5nIHwgVmFsdWVHZXR0ZXJGdW5jPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBmdW5jdGlvbiBvciBleHByZXNzaW9uIHRvIGZvcm1hdCBhIHZhbHVlLCBzaG91bGQgcmV0dXJuIGEgc3RyaW5nLiBOb3QgdXNlZCBmb3IgQ1NWIGV4cG9ydCBvciBjb3B5IHRvIGNsaXBib2FyZCwgb25seSBmb3IgVUkgY2VsbCByZW5kZXJpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUZvcm1hdHRlcjogc3RyaW5nIHwgVmFsdWVGb3JtYXR0ZXJGdW5jPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZWQgYSByZWZlcmVuY2UgZGF0YSBtYXAgdG8gYmUgdXNlZCB0byBtYXAgY29sdW1uIHZhbHVlcyB0byB0aGVpciByZXNwZWN0aXZlIHZhbHVlIGZyb20gdGhlIG1hcC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlZkRhdGE6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nOyB9IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiB0byByZXR1cm4gYSBzdHJpbmcga2V5IGZvciBhIHZhbHVlLlxuICAgICAqIFRoaXMgc3RyaW5nIGlzIHVzZWQgZm9yIGdyb3VwaW5nLCBTZXQgZmlsdGVyaW5nLCBhbmQgc2VhcmNoaW5nIHdpdGhpbiBjZWxsIGVkaXRvciBkcm9wZG93bnMuXG4gICAgICogV2hlbiBmaWx0ZXJpbmcgYW5kIHNlYXJjaGluZyB0aGUgc3RyaW5nIGlzIGV4cG9zZWQgdG8gdGhlIHVzZXIsIHNvIG1ha2Ugc3VyZSB0byByZXR1cm4gYSBodW1hbi1yZWFkYWJsZSB2YWx1ZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGtleUNyZWF0b3I6ICgocGFyYW1zOiBLZXlDcmVhdG9yUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9tIGNvbXBhcmF0b3IgZm9yIHZhbHVlcywgdXNlZCBieSByZW5kZXJlciB0byBrbm93IGlmIHZhbHVlcyBoYXZlIGNoYW5nZWQuIENlbGxzIHdobydzIHZhbHVlcyBoYXZlIG5vdCBjaGFuZ2VkIGRvbid0IGdldCByZWZyZXNoZWQuXG4gICAgICogQnkgZGVmYXVsdCB0aGUgZ3JpZCB1c2VzIGA9PT1gIGlzIHVzZWQgd2hpY2ggc2hvdWxkIHdvcmsgZm9yIG1vc3QgdXNlIGNhc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXF1YWxzOiAoKHZhbHVlQTogYW55LCB2YWx1ZUI6IGFueSkgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBmaWVsZCBvZiB0aGUgdG9vbHRpcCB0byBhcHBseSB0byB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBGaWVsZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gdGhlIHN0cmluZyB0byB1c2UgZm9yIGEgdG9vbHRpcCwgYHRvb2x0aXBGaWVsZGAgdGFrZXMgcHJlY2VkZW5jZSBpZiBzZXQuXG4gICAgICogSWYgdXNpbmcgYSBjdXN0b20gYHRvb2x0aXBDb21wb25lbnRgIHlvdSBtYXkgcmV0dXJuIGFueSBjdXN0b20gdmFsdWUgdG8gYmUgcGFzc2VkIHRvIHlvdXIgdG9vbHRpcCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwVmFsdWVHZXR0ZXI6ICgocGFyYW1zOiBJVG9vbHRpcFBhcmFtczxURGF0YT4pID0+IHN0cmluZyB8IGFueSkgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gcmVuZGVyIGEgc2VsZWN0aW9uIGNoZWNrYm94IGluIHRoZSBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjazxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZGlzcGxheSBhIGRpc2FibGVkIGNoZWNrYm94IHdoZW4gcm93IGlzIG5vdCBzZWxlY3RhYmxlIGFuZCBjaGVja2JveGVzIGFyZSBlbmFibGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93RGlzYWJsZWRDaGVja2JveGVzOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJY29ucyB0byB1c2UgaW5zaWRlIHRoZSBjb2x1bW4gaW5zdGVhZCBvZiB0aGUgZ3JpZCdzIGRlZmF1bHQgaWNvbnMuIExlYXZlIHVuZGVmaW5lZCB0byB1c2UgZGVmYXVsdHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB8IHN0cmluZzsgfSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB0aGlzIGNvbHVtbiBpcyBub3QgbmF2aWdhYmxlIChpLmUuIGNhbm5vdCBiZSB0YWJiZWQgaW50byksIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgICAqIENhbiBhbHNvIGJlIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaGF2ZSBkaWZmZXJlbnQgcm93cyBuYXZpZ2FibGUuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOYXZpZ2FibGU6IGJvb2xlYW4gfCBTdXBwcmVzc05hdmlnYWJsZUNhbGxiYWNrPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIHN1cHByZXNzIGNlcnRhaW4ga2V5Ym9hcmQgZXZlbnRzIGluIHRoZSBncmlkIGNlbGwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudDogKChwYXJhbXM6IFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQYXN0aW5nIGlzIG9uIGJ5IGRlZmF1bHQgYXMgbG9uZyBhcyBjZWxscyBhcmUgZWRpdGFibGUgKG5vbi1lZGl0YWJsZSBjZWxscyBjYW5ub3QgYmUgbW9kaWZpZWQsIGV2ZW4gd2l0aCBhIHBhc3RlIG9wZXJhdGlvbikuXG4gICAgICogU2V0IHRvIGB0cnVlYCB0dXJuIHBhc3RlIG9wZXJhdGlvbnMgb2ZmLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXN0ZTogYm9vbGVhbiB8IFN1cHByZXNzUGFzdGVDYWxsYmFjazxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIHByZXZlbnQgdGhlIGZpbGxIYW5kbGUgZnJvbSBiZWluZyByZW5kZXJlZCBpbiBhbnkgY2VsbCB0aGF0IGJlbG9uZ3MgdG8gdGhpcyBjb2x1bW4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmlsbEhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBmb3IgdGhpcyBjb2x1bW4gdG8gYmUgaGlkZGVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBoaWRlYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsSGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBibG9jayBtYWtpbmcgY29sdW1uIHZpc2libGUgLyBoaWRkZW4gdmlhIHRoZSBVSSAoQVBJIHdpbGwgc3RpbGwgd29yaykuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2tWaXNpYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBMb2NrIGEgY29sdW1uIHRvIHBvc2l0aW9uIHRvIGAnbGVmdCdgIG9yYCdyaWdodCdgIHRvIGFsd2F5cyBoYXZlIHRoaXMgY29sdW1uIGRpc3BsYXllZCBpbiB0aGF0IHBvc2l0aW9uLiB0cnVlIGlzIHRyZWF0ZWQgYXMgYCdsZWZ0J2AgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2tQb3NpdGlvbjogYm9vbGVhbiB8ICdsZWZ0JyB8ICdyaWdodCcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIHRvIGJlIG1vdmFibGUgdmlhIGRyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBjb2x1bW4gaXMgZWRpdGFibGUsIG90aGVyd2lzZSBgZmFsc2VgLiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRvIGhhdmUgZGlmZmVyZW50IHJvd3MgZWRpdGFibGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVkaXRhYmxlOiBib29sZWFuIHwgRWRpdGFibGVDYWxsYmFjazxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIFNldHMgdGhlIHZhbHVlIGludG8geW91ciBkYXRhIGZvciBzYXZpbmcuIFJldHVybiBgdHJ1ZWAgaWYgdGhlIGRhdGEgY2hhbmdlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlU2V0dGVyOiBzdHJpbmcgfCBWYWx1ZVNldHRlckZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBQYXJzZXMgdGhlIHZhbHVlIGZvciBzYXZpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZVBhcnNlcjogc3RyaW5nIHwgVmFsdWVQYXJzZXJGdW5jPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBjZWxsIGVkaXRvciBjb21wb25lbnQgZm9yIHRoaXMgY29sdW1uJ3MgY2VsbHMuXG4gICAgICogU2VlIFtDZWxsIEVkaXRvcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LWNlbGwtZWRpdG9yLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yOiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBjZWxsRWRpdG9yYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yRnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGBjZWxsRWRpdG9yYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUGFyYW1zOiBhbnk7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBjZWxsIGVkaXRvciB0byBiZSB1c2VkIGZvciBhIGdpdmVuIHJvdyB3aXRoaW4gdGhlIHNhbWUgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclNlbGVjdG9yOiBDZWxsRWRpdG9yU2VsZWN0b3JGdW5jPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIHVuZGVyIHRoaXMgY29sdW1uIGVudGVyIGVkaXQgbW9kZSBhZnRlciBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdXNlIGB2YWx1ZVNldHRlcmAgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuZXdWYWx1ZUhhbmRsZXI6ICgocGFyYW1zOiBOZXdWYWx1ZVBhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgLCB0byBoYXZlIHRoZSBjZWxsIGVkaXRvciBhcHBlYXIgaW4gYSBwb3B1cC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JQb3B1cDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBwb3NpdGlvbiBmb3IgdGhlIHBvcHVwIGNlbGwgZWRpdG9yLiBQb3NzaWJsZSB2YWx1ZXMgYXJlXG4gICAgICogICAtIGBvdmVyYCBQb3B1cCB3aWxsIGJlIHBvc2l0aW9uZWQgb3ZlciB0aGUgY2VsbFxuICAgICAqICAgLSBgdW5kZXJgIFBvcHVwIHdpbGwgYmUgcG9zaXRpb25lZCBiZWxvdyB0aGUgY2VsbCBsZWF2aW5nIHRoZSBjZWxsIHZhbHVlIHZpc2libGUuXG4gICAgICogXG4gICAgICogRGVmYXVsdDogYG92ZXJgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBvcHVwUG9zaXRpb246IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgZm9yIGFmdGVyIHRoZSB2YWx1ZSBvZiBhIGNlbGwgaGFzIGNoYW5nZWQsIGVpdGhlciBkdWUgdG8gZWRpdGluZyBvciB0aGUgYXBwbGljYXRpb24gY2FsbGluZyBgYXBpLnNldFZhbHVlKClgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsVmFsdWVDaGFuZ2VkOiAoKGV2ZW50OiBOZXdWYWx1ZVBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiBhIGNlbGwgaXMgY2xpY2tlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbENsaWNrZWQ6ICgoZXZlbnQ6IENlbGxDbGlja2VkRXZlbnQ8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIGRvdWJsZSBjbGlja2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsRG91YmxlQ2xpY2tlZDogKChldmVudDogQ2VsbERvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiBhIGNlbGwgaXMgcmlnaHQgY2xpY2tlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbENvbnRleHRNZW51OiAoKGV2ZW50OiBDZWxsQ29udGV4dE1lbnVFdmVudDxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGZ1bmN0aW9uIHRvIHRlbGwgdGhlIGdyaWQgd2hhdCBxdWljayBmaWx0ZXIgdGV4dCB0byB1c2UgZm9yIHRoaXMgY29sdW1uIGlmIHlvdSBkb24ndCB3YW50IHRvIHVzZSB0aGUgZGVmYXVsdCAod2hpY2ggaXMgY2FsbGluZyBgdG9TdHJpbmdgIG9uIHRoZSB2YWx1ZSkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRRdWlja0ZpbHRlclRleHQ6ICgocGFyYW1zOiBHZXRRdWlja0ZpbHRlclRleHRQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBHZXRzIHRoZSB2YWx1ZSBmb3IgZmlsdGVyaW5nIHB1cnBvc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyVmFsdWVHZXR0ZXI6IHN0cmluZyB8IFZhbHVlR2V0dGVyRnVuYzxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZXRoZXIgdG8gZGlzcGxheSBhIGZsb2F0aW5nIGZpbHRlciBmb3IgdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBlbmFibGVkIHRoZW4gY29sdW1uIGhlYWRlciBuYW1lcyB0aGF0IGFyZSB0b28gbG9uZyBmb3IgdGhlIGNvbHVtbiB3aWR0aCB3aWxsIHdyYXAgb250byB0aGUgbmV4dCBsaW5lLiBEZWZhdWx0IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHdyYXBIZWFkZXJUZXh0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBlbmFibGVkIHRoZW4gdGhlIGNvbHVtbiBoZWFkZXIgcm93IHdpbGwgYXV0b21hdGljYWxseSBhZGp1c3QgaGVpZ2h0IHRvIGFjb21tb2RhdGUgdGhlIHNpemUgb2YgdGhlIGhlYWRlciBjZWxsLlxuICAgICAqIFRoaXMgY2FuIGJlIHVzZWZ1bCB3aGVuIHVzaW5nIHlvdXIgb3duIGBoZWFkZXJDb21wb25lbnRgIG9yIGxvbmcgaGVhZGVyIG5hbWVzIGluIGNvbmp1bmN0aW9uIHdpdGggYHdyYXBIZWFkZXJUZXh0YC5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvSGVhZGVySGVpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgY3VzdG9tIGhlYWRlciBjb21wb25lbnQgdG8gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQgaGVhZGVyLiBJZiBub25lIHNwZWNpZmllZCB0aGUgZGVmYXVsdCBBRyBHcmlkIGhlYWRlciBjb21wb25lbnQgaXMgdXNlZC5cbiAgICAgKiBTZWUgW0hlYWRlciBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1oZWFkZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudDogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgaGVhZGVyQ29tcG9uZW50YCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICAvKiogVGhlIHBhcmFtZXRlcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBgaGVhZGVyQ29tcG9uZW50YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudFBhcmFtczogYW55O1xuICAgIC8qKiBTZXQgdG8gYW4gYXJyYXkgY29udGFpbmluZyB6ZXJvLCBvbmUgb3IgbWFueSBvZiB0aGUgZm9sbG93aW5nIG9wdGlvbnM6IGAnZmlsdGVyTWVudVRhYicgfCAnZ2VuZXJhbE1lbnVUYWInIHwgJ2NvbHVtbnNNZW51VGFiJ2AuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGZpZ3VyZSBvdXQgd2hpY2ggbWVudSB0YWJzIGFyZSBwcmVzZW50IGFuZCBpbiB3aGljaCBvcmRlciB0aGUgdGFicyBhcmUgc2hvd24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtZW51VGFiczogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFBhcmFtcyB1c2VkIHRvIGNoYW5nZSB0aGUgYmVoYXZpb3VyIGFuZCBhcHBlYXJhbmNlIG9mIHRoZSBDb2x1bW5zIE1lbnUgdGFiLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uc01lbnVQYXJhbXM6IENvbHVtbnNNZW51UGFyYW1zIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIG5vIG1lbnUgc2hvdWxkIGJlIHNob3duIGZvciB0aGlzIGNvbHVtbiBoZWFkZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgIG9yIHRoZSBjYWxsYmFjayByZXR1cm5zIGB0cnVlYCwgYSAnc2VsZWN0IGFsbCcgY2hlY2tib3ggd2lsbCBiZSBwdXQgaW50byB0aGUgaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IGJvb2xlYW4gfCBIZWFkZXJDaGVja2JveFNlbGVjdGlvbkNhbGxiYWNrPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgaGVhZGVyIGNoZWNrYm94IHNlbGVjdGlvbiB3aWxsIG9ubHkgc2VsZWN0IGZpbHRlcmVkIGl0ZW1zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25GaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIERlZmluZXMgdGhlIGNoYXJ0IGRhdGEgdHlwZSB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciBhIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0RGF0YVR5cGU6ICdjYXRlZ29yeScgfCAnc2VyaWVzJyB8ICd0aW1lJyB8ICdleGNsdWRlZCcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFBpbiBhIGNvbHVtbiB0byBvbmUgc2lkZTogYHJpZ2h0YCBvciBgbGVmdGAuIEEgdmFsdWUgb2YgYHRydWVgIGlzIGNvbnZlcnRlZCB0byBgJ2xlZnQnYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZDogYm9vbGVhbiB8ICdsZWZ0JyB8ICdyaWdodCcgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBwaW5uZWRgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaW5uZWQ6IGJvb2xlYW4gfCAnbGVmdCcgfCAncmlnaHQnIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBibG9jayB0aGUgdXNlciBwaW5uaW5nIHRoZSBjb2x1bW4sIHRoZSBjb2x1bW4gY2FuIG9ubHkgYmUgcGlubmVkIHZpYSBkZWZpbml0aW9ucyBvciBBUEkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2tQaW5uZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGNlbGxSZW5kZXJlclNlbGVjdG9yIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IENlbGwgUmVuZGVyZXIgZm9yIHBpbm5lZCByb3dzLiBDaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgdmFsdWVGb3JtYXR0ZXIgZm9yIHBpbm5lZCByb3dzLCBhbmQgY2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dWYWx1ZUZvcm1hdHRlcjogc3RyaW5nIHwgVmFsdWVGb3JtYXR0ZXJGdW5jPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gcGl2b3QgYnkgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcGl2b3RgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgaW4gY29sdW1ucyB5b3Ugd2FudCB0byBwaXZvdCBieS5cbiAgICAgKiBJZiBvbmx5IHBpdm90aW5nIGJ5IG9uZSBjb2x1bW4sIHNldCB0aGlzIHRvIGFueSBudW1iZXIgKGUuZy4gYDBgKS5cbiAgICAgKiBJZiBwaXZvdGluZyBieSBtdWx0aXBsZSBjb2x1bW5zLCBzZXQgdGhpcyB0byB3aGVyZSB5b3Ugd2FudCB0aGlzIGNvbHVtbiB0byBiZSBpbiB0aGUgb3JkZXIgb2YgcGl2b3RzIChlLmcuIGAwYCBmb3IgZmlyc3QsIGAxYCBmb3Igc2Vjb25kLCBhbmQgc28gb24pLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RJbmRleDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcGl2b3RJbmRleGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpdm90SW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ29tcGFyYXRvciB0byB1c2Ugd2hlbiBvcmRlcmluZyB0aGUgcGl2b3QgY29sdW1ucywgd2hlbiB0aGlzIGNvbHVtbiBpcyB1c2VkIHRvIHBpdm90IG9uLlxuICAgICAqIFRoZSB2YWx1ZXMgd2lsbCBhbHdheXMgYmUgc3RyaW5ncywgYXMgdGhlIHBpdm90IHNlcnZpY2UgdXNlcyBzdHJpbmdzIGFzIGtleXMgZm9yIHRoZSBwaXZvdCBncm91cHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbXBhcmF0b3I6ICgodmFsdWVBOiBzdHJpbmcsIHZhbHVlQjogc3RyaW5nKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRvIGJlIGFibGUgdG8gcGl2b3QgYnkgdGhpcyBjb2x1bW4gdmlhIHRoZSBHVUkuIFRoaXMgd2lsbCBub3QgYmxvY2sgdGhlIEFQSSBvciBwcm9wZXJ0aWVzIGJlaW5nIHVzZWQgdG8gYWNoaWV2ZSBwaXZvdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBvZiBjc3MgdmFsdWVzIC8gb3IgZnVuY3Rpb24gcmV0dXJuaW5nIGFuIG9iamVjdCBvZiBjc3MgdmFsdWVzIGZvciBhIHBhcnRpY3VsYXIgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxTdHlsZTogQ2VsbFN0eWxlIHwgQ2VsbFN0eWxlRnVuYzxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIENsYXNzIHRvIHVzZSBmb3IgdGhlIGNlbGwuIENhbiBiZSBzdHJpbmcsIGFycmF5IG9mIHN0cmluZ3MsIG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzOiBzdHJpbmcgfCBzdHJpbmdbXSB8IENlbGxDbGFzc0Z1bmM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBSdWxlcyB3aGljaCBjYW4gYmUgYXBwbGllZCB0byBpbmNsdWRlIGNlcnRhaW4gQ1NTIGNsYXNzZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3NSdWxlczogQ2VsbENsYXNzUnVsZXM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIGNlbGwgUmVuZGVyZXIgY29tcG9uZW50IGZvciB0aGlzIGNvbHVtbidzIGNlbGxzLlxuICAgICAqIFNlZSBbQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LWNlbGwtcmVuZGVyZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXI6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGNlbGxSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGBjZWxsUmVuZGVyZXJgIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggY2VsbCByZW5kZXJlciB0byBiZSB1c2VkIGZvciBhIGdpdmVuIHJvdyB3aXRoaW4gdGhlIHNhbWUgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyU2VsZWN0b3I6IENlbGxSZW5kZXJlclNlbGVjdG9yRnVuYzxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgZ3JpZCBjYWxjdWxhdGUgdGhlIGhlaWdodCBvZiBhIHJvdyBiYXNlZCBvbiBjb250ZW50cyBvZiB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0hlaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSB0ZXh0IHdyYXAgaW5zaWRlIHRoZSBjZWxsIC0gdHlwaWNhbGx5IHVzZWQgd2l0aCBgYXV0b0hlaWdodGAuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHdyYXBUZXh0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGZsYXNoIGEgY2VsbCB3aGVuIGl0J3MgcmVmcmVzaGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gcHJldmVudCB0aGlzIGNvbHVtbiBmcm9tIGZsYXNoaW5nIG9uIGNoYW5nZXMuIE9ubHkgYXBwbGljYWJsZSBpZiBjZWxsIGZsYXNoaW5nIGlzIHR1cm5lZCBvbiBmb3IgdGhlIGdyaWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbEZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBgYm9vbGVhbmAgb3IgYEZ1bmN0aW9uYC4gU2V0IHRvIGB0cnVlYCAob3IgcmV0dXJuIGB0cnVlYCBmcm9tIGZ1bmN0aW9uKSB0byBhbGxvdyByb3cgZHJhZ2dpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWc6IGJvb2xlYW4gfCBSb3dEcmFnQ2FsbGJhY2s8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIHJldHVybiBhIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGByb3dEcmFnQ29tcGAgd2hpbGUgZHJhZ2dpbmcgYSByb3cuXG4gICAgICogSWYgdGhpcyBjYWxsYmFjayBpcyBub3Qgc2V0LCB0aGUgYHJvd0RyYWdUZXh0YCBjYWxsYmFjayBpbiB0aGUgYGdyaWRPcHRpb25zYCB3aWxsIGJlIHVzZWQgYW5kXG4gICAgICogaWYgdGhlcmUgaXMgbm8gY2FsbGJhY2sgaW4gdGhlIGBncmlkT3B0aW9uc2AgdGhlIGN1cnJlbnQgY2VsbCB2YWx1ZSB3aWxsIGJlIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnVGV4dDogKChwYXJhbXM6IElSb3dEcmFnSXRlbSwgZHJhZ0l0ZW1Db3VudDogbnVtYmVyKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBgYm9vbGVhbmAgb3IgYEZ1bmN0aW9uYC4gU2V0IHRvIGB0cnVlYCAob3IgcmV0dXJuIGB0cnVlYCBmcm9tIGZ1bmN0aW9uKSB0byBhbGxvdyBkcmFnZ2luZyBmb3IgbmF0aXZlIGRyYWcgYW5kIGRyb3AuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRuZFNvdXJjZTogYm9vbGVhbiB8IERuZFNvdXJjZUNhbGxiYWNrPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gdG8gYWxsb3cgY3VzdG9tIGRyYWcgZnVuY3Rpb25hbGl0eSBmb3IgbmF0aXZlIGRyYWcgYW5kIGRyb3AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2VPblJvd0RyYWc6ICgocGFyYW1zOiBEbmRTb3VyY2VPblJvd0RyYWdQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byByb3cgZ3JvdXAgYnkgdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGByb3dHcm91cGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFJvd0dyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyBpbiBjb2x1bW5zIHlvdSB3YW50IHRvIGdyb3VwIGJ5LlxuICAgICAqIElmIG9ubHkgZ3JvdXBpbmcgYnkgb25lIGNvbHVtbiwgc2V0IHRoaXMgdG8gYW55IG51bWJlciAoZS5nLiBgMGApLlxuICAgICAqIElmIGdyb3VwaW5nIGJ5IG11bHRpcGxlIGNvbHVtbnMsIHNldCB0aGlzIHRvIHdoZXJlIHlvdSB3YW50IHRoaXMgY29sdW1uIHRvIGJlIGluIHRoZSBncm91cCAoZS5nLiBgMGAgZm9yIGZpcnN0LCBgMWAgZm9yIHNlY29uZCwgYW5kIHNvIG9uKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwSW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHJvd0dyb3VwSW5kZXhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdG8gYmUgYWJsZSB0byByb3cgZ3JvdXAgYnkgdGhpcyBjb2x1bW4gdmlhIHRoZSBHVUkuXG4gICAgICogVGhpcyB3aWxsIG5vdCBibG9jayB0aGUgQVBJIG9yIHByb3BlcnRpZXMgYmVpbmcgdXNlZCB0byBhY2hpZXZlIHJvdyBncm91cGluZy5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIGFnZ3JlZ2F0ZSBieSB0aGlzIGNvbHVtbiB2aWEgdGhlIEdVSS5cbiAgICAgKiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgYWdncmVnYXRpb24uXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlVmFsdWU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIE5hbWUgb2YgZnVuY3Rpb24gdG8gdXNlIGZvciBhZ2dyZWdhdGlvbi4gWW91IGNhbiBhbHNvIHByb3ZpZGUgeW91ciBvd24gYWdnIGZ1bmN0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuYzogc3RyaW5nIHwgSUFnZ0Z1bmM8VERhdGE+IHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgYWdnRnVuY2AsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEFnZ0Z1bmM6IHN0cmluZyB8IElBZ2dGdW5jPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIG5hbWUgb2YgdGhlIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9uIHRvIHVzZSBmb3IgdGhpcyBjb2x1bW4gd2hlbiBpdCBpcyBlbmFibGVkIHZpYSB0aGUgR1VJLlxuICAgICAqIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90IGltbWVkaWF0ZWx5IGFwcGx5IHRoZSBhZ2dyZWdhdGlvbiBmdW5jdGlvbiBsaWtlIGBhZ2dGdW5jYFxuICAgICAqIERlZmF1bHQ6IGBzdW1gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0QWdnRnVuYzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBZ2dyZWdhdGlvbiBmdW5jdGlvbnMgYWxsb3dlZCBvbiB0aGlzIGNvbHVtbiBlLmcuIGBbJ3N1bScsICdhdmcnXWAuXG4gICAgICogSWYgbWlzc2luZywgYWxsIGluc3RhbGxlZCBmdW5jdGlvbnMgYXJlIGFsbG93ZWQuXG4gICAgICogVGhpcyB3aWxsIG9ubHkgcmVzdHJpY3Qgd2hhdCB0aGUgR1VJIGFsbG93cyBhIHVzZXIgdG8gc2VsZWN0LCBpdCBkb2VzIG5vdCBpbXBhY3Qgd2hlbiB5b3Ugc2V0IGEgZnVuY3Rpb24gdmlhIHRoZSBBUEkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd2VkQWdnRnVuY3M6IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBoYXZlIHRoZSBncmlkIHBsYWNlIHRoZSB2YWx1ZXMgZm9yIHRoZSBncm91cCBpbnRvIHRoZSBjZWxsLCBvciBwdXQgdGhlIG5hbWUgb2YgYSBncm91cGVkIGNvbHVtbiB0byBqdXN0IHNob3cgdGhhdCBncm91cC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNob3dSb3dHcm91cDogc3RyaW5nIHwgYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBzb3J0aW5nIG9uIHRoaXMgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0YWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgc29ydGluZyBieSBkZWZhdWx0LCBzZXQgaXQgaGVyZS4gU2V0IHRvIGBhc2NgIG9yIGBkZXNjYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnQ6ICdhc2MnIHwgJ2Rlc2MnIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgc29ydGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFNvcnQ6ICdhc2MnIHwgJ2Rlc2MnIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgc29ydGluZyBtb3JlIHRoYW4gb25lIGNvbHVtbiBieSBkZWZhdWx0LCBzcGVjaWZpZXMgb3JkZXIgaW4gd2hpY2ggdGhlIHNvcnRpbmcgc2hvdWxkIGJlIGFwcGxpZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0SW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHNvcnRJbmRleGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFNvcnRJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBkZWZpbmluZyB0aGUgb3JkZXIgaW4gd2hpY2ggc29ydGluZyBvY2N1cnMgKGlmIHNvcnRpbmcgaXMgZW5hYmxlZCkuIEFuIGFycmF5IHdpdGggYW55IG9mIHRoZSBmb2xsb3dpbmcgaW4gYW55IG9yZGVyIGBbJ2FzYycsJ2Rlc2MnLG51bGxdYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiAoJ2FzYycgfCAnZGVzYycgfCBudWxsKVtdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBPdmVycmlkZSB0aGUgZGVmYXVsdCBzb3J0aW5nIG9yZGVyIGJ5IHByb3ZpZGluZyBhIGN1c3RvbSBzb3J0IGNvbXBhcmF0b3IuIFxuICAgICAqIFxuICAgICAqIC0gYHZhbHVlQWAsIGB2YWx1ZUJgIGFyZSB0aGUgdmFsdWVzIHRvIGNvbXBhcmUuXG4gICAgICogLSBgbm9kZUFgLCAgYG5vZGVCYCBhcmUgdGhlIGNvcnJlc3BvbmRpbmcgUm93Tm9kZXMuIFVzZWZ1bCBpZiBhZGRpdGlvbmFsIGRldGFpbHMgYXJlIHJlcXVpcmVkIGJ5IHRoZSBzb3J0LlxuICAgICAqIC0gYGlzRGVzY2VuZGluZ2AgLSBgdHJ1ZWAgaWYgc29ydCBkaXJlY3Rpb24gaXMgYGRlc2NgLiBOb3QgdG8gYmUgdXNlZCBmb3IgaW52ZXJ0aW5nIHRoZSByZXR1cm4gdmFsdWUgYXMgdGhlIGdyaWQgYWxyZWFkeSBhcHBsaWVzIGBhc2NgIG9yIGBkZXNjYCBvcmRlcmluZy5cbiAgICAgKiBcbiAgICAgKiBSZXR1cm46XG4gICAgICogICAtIGAwYCAgdmFsdWVBIGlzIHRoZSBzYW1lIGFzIHZhbHVlQlxuICAgICAqICAgLSBgPiAwYCBTb3J0IHZhbHVlQSBhZnRlciB2YWx1ZUIgXG4gICAgICogICAtIGA8IDBgIFNvcnQgdmFsdWVBIGJlZm9yZSB2YWx1ZUIgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBhcmF0b3I6ICgodmFsdWVBOiBhbnksIHZhbHVlQjogYW55LCBub2RlQTogUm93Tm9kZTxURGF0YT4sIG5vZGVCOiBSb3dOb2RlPFREYXRhPiwgaXNEZXNjZW5kaW5nOiBib29sZWFuKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRoZSB1bnNvcnRlZCBpY29uIHRvIGJlIHNob3duIHdoZW4gbm8gc29ydCBpcyBhcHBsaWVkIHRvIHRoaXMgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2MjQgLSB1c2Ugc29ydEluZGV4IGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGVkQXQ6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgZWFjaCBjZWxsIHdpbGwgdGFrZSB1cCB0aGUgd2lkdGggb2Ygb25lIGNvbHVtbi4gWW91IGNhbiBjaGFuZ2UgdGhpcyBiZWhhdmlvdXIgdG8gYWxsb3cgY2VsbHMgdG8gc3BhbiBtdWx0aXBsZSBjb2x1bW5zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sU3BhbjogKChwYXJhbXM6IENvbFNwYW5QYXJhbXM8VERhdGE+KSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCBlYWNoIGNlbGwgd2lsbCB0YWtlIHVwIHRoZSBoZWlnaHQgb2Ygb25lIHJvdy4gWW91IGNhbiBjaGFuZ2UgdGhpcyBiZWhhdmlvdXIgdG8gYWxsb3cgY2VsbHMgdG8gc3BhbiBtdWx0aXBsZSByb3dzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3BhbjogKChwYXJhbXM6IFJvd1NwYW5QYXJhbXM8VERhdGE+KSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJbml0aWFsIHdpZHRoIGluIHBpeGVscyBmb3IgdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3aWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGB3aWR0aGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIE1pbmltdW0gd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1pbldpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIE1heGltdW0gd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFVzZWQgaW5zdGVhZCBvZiBgd2lkdGhgIHdoZW4gdGhlIGdvYWwgaXMgdG8gZmlsbCB0aGUgcmVtYWluaW5nIGVtcHR5IHNwYWNlIG9mIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBmbGV4YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsRmxleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IHRoaXMgY29sdW1uIHNob3VsZCBiZSByZXNpemVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZXNpemFibGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdGhpcyBjb2x1bW4ncyB3aWR0aCB0byBiZSBmaXhlZCBkdXJpbmcgJ3NpemUgdG8gZml0JyBvcGVyYXRpb25zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NpemVUb0ZpdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgYXV0by1yZXNpemFibGUgYnkgZG91YmxlIGNsaWNraW5nIGl0J3MgZWRnZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblxuXG4gICAgLy8gRW5hYmxlIHR5cGUgY29lcmNpb24gZm9yIGJvb2xlYW4gSW5wdXRzIHRvIHN1cHBvcnQgdXNlIGxpa2UgJ2VuYWJsZUNoYXJ0cycgaW5zdGVhZCBvZiBmb3JjaW5nICdbZW5hYmxlQ2hhcnRzXT1cInRydWVcIicgXG4gICAgLy8gaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3RlbXBsYXRlLXR5cGVjaGVjayNpbnB1dC1zZXR0ZXItY29lcmNpb24gXG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbEZsYXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmlsdGVyc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfb3BlbkJ5RGVmYXVsdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFycnlDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW5pdGlhbEhpZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0dyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsUm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsUGl2b3Q6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaG93RGlzYWJsZWRDaGVja2JveGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oZWFkZXJDaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25GaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2NrUG9zaXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tWaXNpYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2NrUGlubmVkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91blNvcnRJY29uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1NpemVUb0ZpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVBpdm90OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVWYWx1ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZWRpdGFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTmF2aWdhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RuZFNvdXJjZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b0hlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfd3JhcFRleHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NvcnRhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZXNpemFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZmxvYXRpbmdGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NlbGxFZGl0b3JQb3B1cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV93cmFwSGVhZGVyVGV4dDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b0hlYWRlckhlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICAvLyBARU5EQFxuXG59XG4iXX0=