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
    ;
    AgGridColumn.prototype.createColDefFromGridColumn = function (from) {
        var childColumns = from.childColumns, colDef = __rest(from, ["childColumns"]);
        return colDef;
    };
    ;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGFnLWdyaWQtY29tbXVuaXR5L2FuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBTzdFO0lBQUE7SUFzS0EsQ0FBQztxQkF0S1ksWUFBWTtJQUdkLHNDQUFlLEdBQXRCO1FBQ0ksSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRCx1RUFBdUU7WUFDdkUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLCtCQUFRLEdBQWY7UUFDSSxJQUFJLE1BQU0sR0FBVyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDbEIsTUFBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLHNDQUFlLEdBQXZCLFVBQXdCLFlBQXFDO1FBQ3pELE9BQU8sWUFBWTtZQUNmLHVFQUF1RTthQUN0RSxNQUFNLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBekIsQ0FBeUIsQ0FBQzthQUMzQyxHQUFHLENBQUMsVUFBQyxNQUFvQjtZ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Q3hCO1FBQVIsS0FBSyxFQUFFOztrREFBc0I7SUFDckI7UUFBUixLQUFLLEVBQUU7O3VEQUEyQjtJQUMxQjtRQUFSLEtBQUssRUFBRTs7MkRBQStCO0lBQzlCO1FBQVIsS0FBSyxFQUFFOzsrREFBbUM7SUFDbEM7UUFBUixLQUFLLEVBQUU7O2lEQUFxQjtJQUNwQjtRQUFSLEtBQUssRUFBRTs7bURBQXVCO0lBQ3RCO1FBQVIsS0FBSyxFQUFFOztvREFBd0I7SUFDdkI7UUFBUixLQUFLLEVBQUU7O2tEQUFzQjtJQUNyQjtRQUFSLEtBQUssRUFBRTs7a0RBQXNCO0lBQ3JCO1FBQVIsS0FBSyxFQUFFOzttREFBdUI7SUFDdEI7UUFBUixLQUFLLEVBQUU7O3lEQUE2QjtJQUM1QjtRQUFSLEtBQUssRUFBRTs7d0RBQTRCO0lBbkszQixZQUFZO1FBSnhCLFNBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSxnQkFBZ0I7WUFDMUIsUUFBUSxFQUFFLEVBQUU7U0FDZixDQUFDO09BQ1csWUFBWSxDQXNLeEI7SUFBRCxtQkFBQztDQUFBLEFBdEtELElBc0tDO1NBdEtZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIENvbnRlbnRDaGlsZHJlbiwgSW5wdXQsIFF1ZXJ5TGlzdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBDb2xEZWYgfSBmcm9tIFwiQGFnLWdyaWQtY29tbXVuaXR5L2NvcmVcIjtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhZy1ncmlkLWNvbHVtbicsXG4gICAgdGVtcGxhdGU6ICcnXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZENvbHVtbiB7XG4gICAgQENvbnRlbnRDaGlsZHJlbihBZ0dyaWRDb2x1bW4pIHB1YmxpYyBjaGlsZENvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+O1xuXG4gICAgcHVibGljIGhhc0NoaWxkQ29sdW1ucygpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRDb2x1bW5zICYmIHRoaXMuY2hpbGRDb2x1bW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEwMDk4XG4gICAgICAgICAgICByZXR1cm4gISh0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPT09IDEgJiYgdGhpcy5jaGlsZENvbHVtbnMuZmlyc3QgPT09IHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9Db2xEZWYoKTogQ29sRGVmIHtcbiAgICAgICAgbGV0IGNvbERlZjogQ29sRGVmID0gdGhpcy5jcmVhdGVDb2xEZWZGcm9tR3JpZENvbHVtbih0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5oYXNDaGlsZENvbHVtbnMoKSkge1xuICAgICAgICAgICAgKDxhbnk+Y29sRGVmKVtcImNoaWxkcmVuXCJdID0gdGhpcy5nZXRDaGlsZENvbERlZnModGhpcy5jaGlsZENvbHVtbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDaGlsZENvbERlZnMoY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPikge1xuICAgICAgICByZXR1cm4gY2hpbGRDb2x1bW5zXG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgLmZpbHRlcihjb2x1bW4gPT4gIWNvbHVtbi5oYXNDaGlsZENvbHVtbnMoKSlcbiAgICAgICAgICAgIC5tYXAoKGNvbHVtbjogQWdHcmlkQ29sdW1uKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbi50b0NvbERlZigpO1xuICAgICAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4oZnJvbTogQWdHcmlkQ29sdW1uKTogQ29sRGVmIHtcbiAgICAgICAgbGV0IHsgY2hpbGRDb2x1bW5zLCAuLi5jb2xEZWYgfSA9IGZyb207XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfTtcblxuICAgIC8vIGlucHV0cyAtIHByZXR0eSBtdWNoIG1vc3Qgb2YgQ29sRGVmLCB3aXRoIHRoZSBleGNlcHRpb24gb2YgdGVtcGxhdGUsIHRlbXBsYXRlVXJsIGFuZCBpbnRlcm5hbCBvbmx5IHByb3BlcnRpZXNcbiAgICAvLyBAU1RBUlRAXG4gICAgQElucHV0KCkgcHVibGljIGNoaWxkcmVuOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd2VkQWdnRnVuY3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWVudVRhYnM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzUnVsZXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFN0eWxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJlZkRhdGE6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uc01lbnVQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyTmFtZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cFNob3c6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2xhc3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsQ2xhc3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVmFsdWVHZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xJZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTb3J0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpZWxkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHR5cGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcEZpZWxkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlclRvb2x0aXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNob3dSb3dHcm91cDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEFnZ0Z1bmM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuYzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpbm5lZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydERhdGFUeXBlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRlZEF0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEZsZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgd2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFdpZHRoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG1pbldpZHRoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG1heFdpZHRoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwSW5kZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFJvd0dyb3VwSW5kZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3RJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2VPblJvd0RyYWc6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVHZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVTZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyVmFsdWVHZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMga2V5Q3JlYXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlRm9ybWF0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd1ZhbHVlRm9ybWF0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlUGFyc2VyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbXBhcmF0b3I6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZXF1YWxzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Q29tcGFyYXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbFNwYW46IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3BhbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRRdWlja0ZpbHRlclRleHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbmV3VmFsdWVIYW5kbGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbFZhbHVlQ2hhbmdlZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDbGlja2VkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbERvdWJsZUNsaWNrZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsQ29udGV4dE1lbnU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ1RleHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFZhbHVlR2V0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclNlbGVjdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JTZWxlY3RvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGbGFzaDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWx0ZXJzVG9vbFBhbmVsOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9wZW5CeURlZmF1bHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWFycnlDaGlsZHJlbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoaWRlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxIaWRlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3Q6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hlY2tib3hTZWxlY3Rpb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25GaWx0ZXJlZE9ubHk6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUG9zaXRpb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Zpc2libGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Bpbm5lZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2l6ZVRvRml0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUm93R3JvdXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUGl2b3Q6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlVmFsdWU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdGFibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXN0ZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05hdmlnYWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2U6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0hlaWdodDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3cmFwVGV4dDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZXNpemFibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyOiBhbnk7XG4gICAgLy8gQEVOREBcblxufVxuIl19