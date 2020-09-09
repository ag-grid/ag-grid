var AgGridColumn_1;
import { __decorate, __metadata, __rest } from "tslib";
import { Component, ContentChildren, Input, QueryList } from "@angular/core";
let AgGridColumn = AgGridColumn_1 = class AgGridColumn {
    hasChildColumns() {
        if (this.childColumns && this.childColumns.length > 0) {
            // necessary because of https://github.com/angular/angular/issues/10098
            return !(this.childColumns.length === 1 && this.childColumns.first === this);
        }
        return false;
    }
    toColDef() {
        let colDef = this.createColDefFromGridColumn(this);
        if (this.hasChildColumns()) {
            colDef["children"] = this.getChildColDefs(this.childColumns);
        }
        return colDef;
    }
    getChildColDefs(childColumns) {
        return childColumns
            // necessary because of https://github.com/angular/angular/issues/10098
            .filter(column => !column.hasChildColumns())
            .map((column) => {
            return column.toColDef();
        });
    }
    ;
    createColDefFromGridColumn(from) {
        let { childColumns } = from, colDef = __rest(from, ["childColumns"]);
        return colDef;
    }
    ;
};
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
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGFnLWdyaWQtY29tbXVuaXR5L2FuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU83RSxJQUFhLFlBQVksb0JBQXpCLE1BQWEsWUFBWTtJQUdkLGVBQWU7UUFDbEIsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRCx1RUFBdUU7WUFDdkUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLFFBQVE7UUFDWCxJQUFJLE1BQU0sR0FBVyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDbEIsTUFBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLGVBQWUsQ0FBQyxZQUFxQztRQUN6RCxPQUFPLFlBQVk7WUFDZix1RUFBdUU7YUFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDM0MsR0FBRyxDQUFDLENBQUMsTUFBb0IsRUFBRSxFQUFFO1lBQzFCLE9BQU8sTUFBTSxDQUFDLFFB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QjtJQUFSLEtBQUssRUFBRTs7bURBQTJCO0FBQzFCO0lBQVIsS0FBSyxFQUFFOzt1REFBK0I7QUFDOUI7SUFBUixLQUFLLEVBQUU7OzJEQUFtQztBQUNsQztJQUFSLEtBQUssRUFBRTs7NkNBQXFCO0FBQ3BCO0lBQVIsS0FBSyxFQUFFOzsrQ0FBdUI7QUFDdEI7SUFBUixLQUFLLEVBQUU7O2dEQUF3QjtBQUN2QjtJQUFSLEtBQUssRUFBRTs7OENBQXNCO0FBQ3JCO0lBQVIsS0FBSyxFQUFFOzs4Q0FBc0I7QUFDckI7SUFBUixLQUFLLEVBQUU7OytDQUF1QjtBQUN0QjtJQUFSLEtBQUssRUFBRTs7cURBQTZCO0FBQzVCO0lBQVIsS0FBSyxFQUFFOztvREFBNEI7QUFsSzNCLFlBQVk7SUFKeEIsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixRQUFRLEVBQUUsRUFBRTtLQUNmLENBQUM7R0FDVyxZQUFZLENBcUt4QjtTQXJLWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBDb250ZW50Q2hpbGRyZW4sIElucHV0LCBRdWVyeUxpc3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgQ29sRGVmIH0gZnJvbSBcIkBhZy1ncmlkLWNvbW11bml0eS9jb3JlXCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1jb2x1bW4nLFxuICAgIHRlbXBsYXRlOiAnJ1xufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRDb2x1bW4ge1xuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPjtcblxuICAgIHB1YmxpYyBoYXNDaGlsZENvbHVtbnMoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmNoaWxkQ29sdW1ucyAmJiB0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgcmV0dXJuICEodGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID09PSAxICYmIHRoaXMuY2hpbGRDb2x1bW5zLmZpcnN0ID09PSB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHRvQ29sRGVmKCk6IENvbERlZiB7XG4gICAgICAgIGxldCBjb2xEZWY6IENvbERlZiA9IHRoaXMuY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4odGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQ2hpbGRDb2x1bW5zKCkpIHtcbiAgICAgICAgICAgICg8YW55PmNvbERlZilbXCJjaGlsZHJlblwiXSA9IHRoaXMuZ2V0Q2hpbGRDb2xEZWZzKHRoaXMuY2hpbGRDb2x1bW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2hpbGRDb2xEZWZzKGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj4pIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkQ29sdW1uc1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIC5maWx0ZXIoY29sdW1uID0+ICFjb2x1bW4uaGFzQ2hpbGRDb2x1bW5zKCkpXG4gICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKGZyb206IEFnR3JpZENvbHVtbik6IENvbERlZiB7XG4gICAgICAgIGxldCB7IGNoaWxkQ29sdW1ucywgLi4uY29sRGVmIH0gPSBmcm9tO1xuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH07XG5cbiAgICAvLyBpbnB1dHMgLSBwcmV0dHkgbXVjaCBtb3N0IG9mIENvbERlZiwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCBhbmQgaW50ZXJuYWwgb25seSBwcm9wZXJ0aWVzXG4gICAgLy8gQFNUQVJUQFxuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGlsZHJlbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dlZEFnZ0Z1bmNzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG1lbnVUYWJzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxDbGFzc1J1bGVzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGljb25zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxTdHlsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZWZEYXRhOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbnNNZW51UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlck5hbWU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uR3JvdXBTaG93OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNsYXNzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbENsYXNzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlclZhbHVlR2V0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sSWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWVsZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0eXBlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBGaWVsZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJUb29sdGlwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxDbGFzczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93Um93R3JvdXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxBZ2dGdW5jOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3I6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaW5uZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnREYXRhVHlwZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0ZWRBdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0SW5kZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFNvcnRJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxGbGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHdpZHRoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxXaWR0aDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtaW5XaWR0aDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhXaWR0aDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90SW5kZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpdm90SW5kZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZG5kU291cmNlT25Sb3dEcmFnOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlR2V0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlU2V0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlclZhbHVlR2V0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGtleUNyZWF0b3I6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUZvcm1hdHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dWYWx1ZUZvcm1hdHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZVBhcnNlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb21wYXJhdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGVxdWFsczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbXBhcmF0b3I6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NLZXlib2FyZEV2ZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbFNwYW46IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3BhbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRRdWlja0ZpbHRlclRleHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbmV3VmFsdWVIYW5kbGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbFZhbHVlQ2hhbmdlZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDbGlja2VkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbERvdWJsZUNsaWNrZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsQ29udGV4dE1lbnU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ1RleHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFZhbHVlR2V0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclNlbGVjdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JTZWxlY3RvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGbGFzaDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWx0ZXJzVG9vbFBhbmVsOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9wZW5CeURlZmF1bHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWFycnlDaGlsZHJlbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoaWRlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxIaWRlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3Q6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hlY2tib3hTZWxlY3Rpb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25GaWx0ZXJlZE9ubHk6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUG9zaXRpb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Zpc2libGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Bpbm5lZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2l6ZVRvRml0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUm93R3JvdXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUGl2b3Q6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlVmFsdWU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdGFibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXN0ZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05hdmlnYWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2U6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0hlaWdodDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3cmFwVGV4dDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZXNpemFibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyOiBhbnk7XG4gICAgLy8gQEVOREBcblxufVxuIl19