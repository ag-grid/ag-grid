import { __decorate, __metadata, __rest } from "tslib";
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
    ], AgGridColumn.prototype, "children", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "sortingOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "allowedAggFuncs", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "menuTabs", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellClassRules", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "icons", void 0);
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
    ], AgGridColumn.prototype, "cellStyle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRendererParams", void 0);
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
    ], AgGridColumn.prototype, "pinnedRowCellRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowCellRendererParams", void 0);
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
    ], AgGridColumn.prototype, "tooltipComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "refData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "columnsMenuParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "columnGroupShow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "toolPanelClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerValueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "groupId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "colId", void 0);
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
    ], AgGridColumn.prototype, "field", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "type", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipField", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerTooltip", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "showRowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "filter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialAggFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "aggFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditor", void 0);
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
    ], AgGridColumn.prototype, "chartDataType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "sortedAt", void 0);
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
    ], AgGridColumn.prototype, "flex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialFlex", void 0);
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
    ], AgGridColumn.prototype, "rowGroupIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialRowGroupIndex", void 0);
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
    ], AgGridColumn.prototype, "dndSourceOnRowDrag", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueSetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "filterValueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "keyCreator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowCellRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueFormatter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowValueFormatter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueParser", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "comparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "equals", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pivotComparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressKeyboardEvent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressHeaderKeyboardEvent", void 0);
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
    ], AgGridColumn.prototype, "getQuickFilterText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "newValueHandler", void 0);
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
    ], AgGridColumn.prototype, "rowDragText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipValueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRendererSelector", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditorSelector", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressCellFlash", void 0);
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
    ], AgGridColumn.prototype, "openByDefault", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "marryChildren", void 0);
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
    ], AgGridColumn.prototype, "rowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialRowGroup", void 0);
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
    ], AgGridColumn.prototype, "checkboxSelection", void 0);
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
    ], AgGridColumn.prototype, "suppressMenu", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressMovable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "lockPosition", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "lockVisible", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "lockPinned", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "unSortIcon", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressSizeToFit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressAutoSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "enableRowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "enablePivot", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "enableValue", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "editable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressPaste", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressNavigable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "enableCellChangeFlash", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "rowDrag", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "dndSource", void 0);
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
    ], AgGridColumn.prototype, "sortable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "resizable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "singleClickEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "floatingFilter", void 0);
    AgGridColumn = AgGridColumn_1 = __decorate([
        Component({
            selector: 'ag-grid-column',
            template: ''
        })
    ], AgGridColumn);
    return AgGridColumn;
}());
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGFnLWdyaWQtY29tbXVuaXR5L2FuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBTzdFO0lBQUE7SUFzS0EsQ0FBQztxQkF0S1ksWUFBWTtJQUdkLHNDQUFlLEdBQXRCO1FBQ0ksSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRCx1RUFBdUU7WUFDdkUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLCtCQUFRLEdBQWY7UUFDSSxJQUFJLE1BQU0sR0FBVyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDbEIsTUFBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLHNDQUFlLEdBQXZCLFVBQXdCLFlBQXFDO1FBQ3pELE9BQU8sWUFBWTtZQUNmLHVFQUF1RTthQUN0RSxNQUFNLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBekIsQ0FBeUIsQ0FBQzthQUMzQyxHQUFHLENBQUMsVUFBQyxNQUFvQjtZ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a0RBQXNCO0lBQ3JCO1FBQVIsS0FBSyxFQUFFOzt1REFBMkI7SUFDMUI7UUFBUixLQUFLLEVBQUU7OzJEQUErQjtJQUM5QjtRQUFSLEtBQUssRUFBRTs7K0RBQW1DO0lBQ2xDO1FBQVIsS0FBSyxFQUFFOztpREFBcUI7SUFDcEI7UUFBUixLQUFLLEVBQUU7O21EQUF1QjtJQUN0QjtRQUFSLEtBQUssRUFBRTs7b0RBQXdCO0lBQ3ZCO1FBQVIsS0FBSyxFQUFFOztrREFBc0I7SUFDckI7UUFBUixLQUFLLEVBQUU7O2tEQUFzQjtJQUNyQjtRQUFSLEtBQUssRUFBRTs7bURBQXVCO0lBQ3RCO1FBQVIsS0FBSyxFQUFFOzt5REFBNkI7SUFDNUI7UUFBUixLQUFLLEVBQUU7O3dEQUE0QjtJQW5LM0IsWUFBWTtRQUp4QixTQUFTLENBQUM7WUFDUCxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLFFBQVEsRUFBRSxFQUFFO1NBQ2YsQ0FBQztPQUNXLFlBQVksQ0FzS3hCO0lBQUQsbUJBQUM7Q0FBQSxBQXRLRCxJQXNLQztTQXRLWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBDb250ZW50Q2hpbGRyZW4sIElucHV0LCBRdWVyeUxpc3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQ29sRGVmIH0gZnJvbSBcIkBhZy1ncmlkLWNvbW11bml0eS9jb3JlXCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1jb2x1bW4nLFxuICAgIHRlbXBsYXRlOiAnJ1xufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRDb2x1bW4ge1xuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPjtcblxuICAgIHB1YmxpYyBoYXNDaGlsZENvbHVtbnMoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmNoaWxkQ29sdW1ucyAmJiB0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgcmV0dXJuICEodGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID09PSAxICYmIHRoaXMuY2hpbGRDb2x1bW5zLmZpcnN0ID09PSB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHRvQ29sRGVmKCk6IENvbERlZiB7XG4gICAgICAgIGxldCBjb2xEZWY6IENvbERlZiA9IHRoaXMuY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4odGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQ2hpbGRDb2x1bW5zKCkpIHtcbiAgICAgICAgICAgICg8YW55PmNvbERlZilbXCJjaGlsZHJlblwiXSA9IHRoaXMuZ2V0Q2hpbGRDb2xEZWZzKHRoaXMuY2hpbGRDb2x1bW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2hpbGRDb2xEZWZzKGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj4pIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkQ29sdW1uc1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIC5maWx0ZXIoY29sdW1uID0+ICFjb2x1bW4uaGFzQ2hpbGRDb2x1bW5zKCkpXG4gICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4oZnJvbTogQWdHcmlkQ29sdW1uKTogQ29sRGVmIHtcbiAgICAgICAgbGV0IHsgY2hpbGRDb2x1bW5zLCAuLi5jb2xEZWYgfSA9IGZyb207XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfVxuXG4gICAgLy8gaW5wdXRzIC0gcHJldHR5IG11Y2ggbW9zdCBvZiBDb2xEZWYsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwgYW5kIGludGVybmFsIG9ubHkgcHJvcGVydGllc1xuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hpbGRyZW46IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93ZWRBZ2dGdW5jczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtZW51VGFiczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3NSdWxlczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsU3R5bGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcmVmRGF0YTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5zTWVudVBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJOYW1lOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkdyb3VwU2hvdzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDbGFzczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxDbGFzczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJWYWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cElkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbElkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFNvcnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmllbGQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdHlwZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwRmllbGQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVG9vbHRpcDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd1Jvd0dyb3VwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsQWdnRnVuYzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGlubmVkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0RGF0YVR5cGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGVkQXQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTb3J0SW5kZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsRmxleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3aWR0aDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsV2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWluV2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4V2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUm93R3JvdXBJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGRuZFNvdXJjZU9uUm93RHJhZzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZVNldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJWYWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZXlDcmVhdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVGb3JtYXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93VmFsdWVGb3JtYXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVQYXJzZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcGFyYXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlcXVhbHM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb21wYXJhdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sU3BhbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTcGFuOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGdldFF1aWNrRmlsdGVyVGV4dDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuZXdWYWx1ZUhhbmRsZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsVmFsdWVDaGFuZ2VkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbENsaWNrZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsRG91YmxlQ2xpY2tlZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDb250ZXh0TWVudTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnVGV4dDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwVmFsdWVHZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyU2VsZWN0b3I6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclNlbGVjdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbEZsYXNoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uc1Rvb2xQYW5lbDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbHRlcnNUb29sUGFuZWw6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb3BlbkJ5RGVmYXVsdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXJyeUNoaWxkcmVuOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhpZGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEhpZGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFJvd0dyb3VwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGVja2JveFNlbGVjdGlvbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDaGVja2JveFNlbGVjdGlvbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDaGVja2JveFNlbGVjdGlvbkZpbHRlcmVkT25seTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2tQb3NpdGlvbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrVmlzaWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUGlubmVkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHVuU29ydEljb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTaXplVG9GaXQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBdXRvU2l6ZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSb3dHcm91cDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVQaXZvdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVWYWx1ZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlZGl0YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Bhc3RlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTmF2aWdhYmxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGRuZFNvdXJjZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvSGVpZ2h0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHdyYXBUZXh0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRhYmxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJlc2l6YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXI6IGFueTtcbiAgICAvLyBARU5EQFxuXG59XG4iXX0=