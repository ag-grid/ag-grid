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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctZ3JpZC1hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU83RTtJQUFBO0lBc0tBLENBQUM7cUJBdEtZLFlBQVk7SUFHZCxzQ0FBZSxHQUF0QjtRQUNJLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkQsdUVBQXVFO1lBQ3ZFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSwrQkFBUSxHQUFmO1FBQ0ksSUFBSSxNQUFNLEdBQVcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ2xCLE1BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN2RTtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxzQ0FBZSxHQUF2QixVQUF3QixZQUFxQztRQUN6RCxPQUFPLFlBQVk7WUFDZix1RUFBdUU7YUFDdEUsTUFBTSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQXpCLENBQXlCLENBQUM7YUFDM0MsR0FBRyxDQUFDLFVBQUMsTUFBb0I7WUFDdEIsT0FBTyxN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QjtRQUFSLEtBQUssRUFBRTs7dURBQTJCO0lBQzFCO1FBQVIsS0FBSyxFQUFFOzsyREFBK0I7SUFDOUI7UUFBUixLQUFLLEVBQUU7OytEQUFtQztJQUNsQztRQUFSLEtBQUssRUFBRTs7aURBQXFCO0lBQ3BCO1FBQVIsS0FBSyxFQUFFOzttREFBdUI7SUFDdEI7UUFBUixLQUFLLEVBQUU7O29EQUF3QjtJQUN2QjtRQUFSLEtBQUssRUFBRTs7a0RBQXNCO0lBQ3JCO1FBQVIsS0FBSyxFQUFFOztrREFBc0I7SUFDckI7UUFBUixLQUFLLEVBQUU7O21EQUF1QjtJQUN0QjtRQUFSLEtBQUssRUFBRTs7eURBQTZCO0lBQzVCO1FBQVIsS0FBSyxFQUFFOzt3REFBNEI7SUFuSzNCLFlBQVk7UUFKeEIsU0FBUyxDQUFDO1lBQ1AsUUFBUSxFQUFFLGdCQUFnQjtZQUMxQixRQUFRLEVBQUUsRUFBRTtTQUNmLENBQUM7T0FDVyxZQUFZLENBc0t4QjtJQUFELG1CQUFDO0NBQUEsQUF0S0QsSUFzS0M7U0F0S1ksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBJbnB1dCwgUXVlcnlMaXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IENvbERlZiB9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtY29sdW1uJyxcbiAgICB0ZW1wbGF0ZTogJydcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQ29sdW1uIHtcbiAgICBAQ29udGVudENoaWxkcmVuKEFnR3JpZENvbHVtbikgcHVibGljIGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBwdWJsaWMgaGFzQ2hpbGRDb2x1bW5zKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5jaGlsZENvbHVtbnMgJiYgdGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIHJldHVybiAhKHRoaXMuY2hpbGRDb2x1bW5zLmxlbmd0aCA9PT0gMSAmJiB0aGlzLmNoaWxkQ29sdW1ucy5maXJzdCA9PT0gdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b0NvbERlZigpOiBDb2xEZWYge1xuICAgICAgICBsZXQgY29sRGVmOiBDb2xEZWYgPSB0aGlzLmNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0NoaWxkQ29sdW1ucygpKSB7XG4gICAgICAgICAgICAoPGFueT5jb2xEZWYpW1wiY2hpbGRyZW5cIl0gPSB0aGlzLmdldENoaWxkQ29sRGVmcyh0aGlzLmNoaWxkQ29sdW1ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENoaWxkQ29sRGVmcyhjaGlsZENvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+KSB7XG4gICAgICAgIHJldHVybiBjaGlsZENvbHVtbnNcbiAgICAgICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEwMDk4XG4gICAgICAgICAgICAuZmlsdGVyKGNvbHVtbiA9PiAhY29sdW1uLmhhc0NoaWxkQ29sdW1ucygpKVxuICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKGZyb206IEFnR3JpZENvbHVtbik6IENvbERlZiB7XG4gICAgICAgIGxldCB7IGNoaWxkQ29sdW1ucywgLi4uY29sRGVmIH0gPSBmcm9tO1xuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIC8vIGlucHV0cyAtIHByZXR0eSBtdWNoIG1vc3Qgb2YgQ29sRGVmLCB3aXRoIHRoZSBleGNlcHRpb24gb2YgdGVtcGxhdGUsIHRlbXBsYXRlVXJsIGFuZCBpbnRlcm5hbCBvbmx5IHByb3BlcnRpZXNcbiAgICAvLyBAU1RBUlRAXG4gICAgQElucHV0KCkgcHVibGljIGNoaWxkcmVuOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd2VkQWdnRnVuY3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWVudVRhYnM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzUnVsZXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFN0eWxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJlZkRhdGE6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uc01lbnVQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyTmFtZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cFNob3c6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2xhc3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsQ2xhc3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVmFsdWVHZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xJZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTb3J0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpZWxkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHR5cGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcEZpZWxkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlclRvb2x0aXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNob3dSb3dHcm91cDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEFnZ0Z1bmM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuYzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpbm5lZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydERhdGFUeXBlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRlZEF0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEZsZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgd2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFdpZHRoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG1pbldpZHRoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG1heFdpZHRoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwSW5kZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFJvd0dyb3VwSW5kZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3RJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2VPblJvd0RyYWc6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVHZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVTZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyVmFsdWVHZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMga2V5Q3JlYXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlRm9ybWF0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd1ZhbHVlRm9ybWF0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlUGFyc2VyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbXBhcmF0b3I6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZXF1YWxzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Q29tcGFyYXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbFNwYW46IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3BhbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRRdWlja0ZpbHRlclRleHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbmV3VmFsdWVIYW5kbGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbFZhbHVlQ2hhbmdlZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDbGlja2VkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbERvdWJsZUNsaWNrZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsQ29udGV4dE1lbnU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ1RleHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFZhbHVlR2V0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclNlbGVjdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JTZWxlY3RvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGbGFzaDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWx0ZXJzVG9vbFBhbmVsOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9wZW5CeURlZmF1bHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWFycnlDaGlsZHJlbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoaWRlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxIaWRlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3Q6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hlY2tib3hTZWxlY3Rpb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25GaWx0ZXJlZE9ubHk6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUG9zaXRpb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Zpc2libGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Bpbm5lZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2l6ZVRvRml0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUm93R3JvdXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUGl2b3Q6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlVmFsdWU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdGFibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXN0ZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05hdmlnYWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2U6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0hlaWdodDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3cmFwVGV4dDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZXNpemFibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyOiBhbnk7XG4gICAgLy8gQEVOREBcblxufVxuIl19