var AgGridColumn_1;
import { __decorate } from "tslib";
import { Component, ContentChildren, Input } from "@angular/core";
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
        let colDef = {};
        Object.assign(colDef, from);
        delete colDef.childColumns;
        return colDef;
    }
    ;
};
__decorate([
    ContentChildren(AgGridColumn_1)
], AgGridColumn.prototype, "childColumns", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "children", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "sortingOrder", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "allowedAggFuncs", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "menuTabs", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellClassRules", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "icons", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerGroupComponent", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerGroupComponentFramework", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerGroupComponentParams", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellStyle", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellRendererParams", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellEditorFramework", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellEditorParams", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "pinnedRowCellRendererFramework", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "pinnedRowCellRendererParams", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "filterFramework", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "filterParams", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerComponent", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerComponentFramework", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerComponentParams", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "floatingFilterComponent", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "floatingFilterComponentParams", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "floatingFilterComponentFramework", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "tooltipComponent", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "tooltipComponentParams", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "tooltipComponentFramework", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "refData", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerName", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "columnGroupShow", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerClass", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "toolPanelClass", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerValueGetter", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "groupId", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "colId", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "sort", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "field", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "type", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "tooltipField", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerTooltip", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellClass", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "showRowGroup", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "filter", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "aggFunc", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellRenderer", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellEditor", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "pinned", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "chartDataType", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "sortedAt", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "flex", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "width", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "minWidth", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "maxWidth", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "rowGroupIndex", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "pivotIndex", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "dndSourceOnRowDrag", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "valueGetter", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "valueSetter", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "filterValueGetter", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "keyCreator", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellRendererFramework", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "pinnedRowCellRenderer", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "valueFormatter", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "pinnedRowValueFormatter", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "valueParser", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "comparator", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "equals", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "pivotComparator", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressKeyboardEvent", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "colSpan", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "rowSpan", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "getQuickFilterText", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "newValueHandler", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "onCellValueChanged", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "onCellClicked", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "onCellDoubleClicked", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "onCellContextMenu", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "rowDragText", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "tooltip", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "tooltipValueGetter", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellRendererSelector", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "cellEditorSelector", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressCellFlash", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressColumnsToolPanel", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressFiltersToolPanel", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "openByDefault", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "marryChildren", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "hide", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "rowGroup", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "pivot", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "checkboxSelection", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerCheckboxSelection", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "headerCheckboxSelectionFilteredOnly", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressMenu", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressSorting", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressMovable", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressFilter", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "lockPosition", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "lockVisible", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "lockPinned", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "unSortIcon", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressSizeToFit", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressResize", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressAutoSize", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "enableRowGroup", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "enablePivot", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "enableValue", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "editable", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressPaste", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "suppressNavigable", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "enableCellChangeFlash", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "rowDrag", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "dndSource", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "autoHeight", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "sortable", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "resizable", void 0);
__decorate([
    Input()
], AgGridColumn.prototype, "singleClickEdit", void 0);
AgGridColumn = AgGridColumn_1 = __decorate([
    Component({
        selector: 'ag-grid-column',
        template: ''
    })
], AgGridColumn);
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctZ3JpZC1hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBWSxNQUFNLGVBQWUsQ0FBQztBQU8zRSxJQUFhLFlBQVksb0JBQXpCLE1BQWEsWUFBWTtJQUdkLGVBQWU7UUFDbEIsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRCx1RUFBdUU7WUFDdkUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLFFBQVE7UUFDWCxJQUFJLE1BQU0sR0FBVyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDbEIsTUFBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLGVBQWUsQ0FBQyxZQUFxQztRQUN6RCxPQUFPLFlBQVk7WUFDZix1RUFBdUU7YUFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDM0MsR0FBRyxDQUFDLENBQUMsTUFBb0IsRUFBRSxFQUFFO1lBQzFCLE9BQU8sTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzdCLENB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WSxDQTRKeEI7U0E1SlksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBDb250ZW50Q2hpbGRyZW4sIElucHV0LCBRdWVyeUxpc3R9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQge0NvbERlZn0gZnJvbSBcImFnLWdyaWQtY29tbXVuaXR5XCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1jb2x1bW4nLFxuICAgIHRlbXBsYXRlOiAnJ1xufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRDb2x1bW4ge1xuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPjtcblxuICAgIHB1YmxpYyBoYXNDaGlsZENvbHVtbnMoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmNoaWxkQ29sdW1ucyAmJiB0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgcmV0dXJuICEodGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID09PSAxICYmIHRoaXMuY2hpbGRDb2x1bW5zLmZpcnN0ID09PSB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHRvQ29sRGVmKCk6IENvbERlZiB7XG4gICAgICAgIGxldCBjb2xEZWY6IENvbERlZiA9IHRoaXMuY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4odGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQ2hpbGRDb2x1bW5zKCkpIHtcbiAgICAgICAgICAgICg8YW55PmNvbERlZilbXCJjaGlsZHJlblwiXSA9IHRoaXMuZ2V0Q2hpbGRDb2xEZWZzKHRoaXMuY2hpbGRDb2x1bW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2hpbGRDb2xEZWZzKGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj4pIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkQ29sdW1uc1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIC5maWx0ZXIoY29sdW1uID0+ICFjb2x1bW4uaGFzQ2hpbGRDb2x1bW5zKCkpXG4gICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKGZyb206IEFnR3JpZENvbHVtbik6IENvbERlZiB7XG4gICAgICAgIGxldCBjb2xEZWY6IENvbERlZiA9IHt9O1xuICAgICAgICBPYmplY3QuYXNzaWduKGNvbERlZiwgZnJvbSk7XG4gICAgICAgIGRlbGV0ZSAoPGFueT5jb2xEZWYpLmNoaWxkQ29sdW1ucztcbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9O1xuXG4gICAgLy8gaW5wdXRzIC0gcHJldHR5IG11Y2ggbW9zdCBvZiBDb2xEZWYsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwgYW5kIGludGVybmFsIG9ubHkgcHJvcGVydGllc1xuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hpbGRyZW46IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93ZWRBZ2dGdW5jczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtZW51VGFiczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3NSdWxlczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsU3R5bGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcmVmRGF0YTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJOYW1lOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkdyb3VwU2hvdzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDbGFzczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxDbGFzczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJWYWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cElkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbElkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmllbGQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdHlwZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwRmllbGQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVG9vbHRpcDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd1Jvd0dyb3VwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydERhdGFUeXBlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRlZEF0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgd2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWluV2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4V2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGRuZFNvdXJjZU9uUm93RHJhZzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZVNldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJWYWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZXlDcmVhdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVGb3JtYXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93VmFsdWVGb3JtYXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVQYXJzZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcGFyYXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlcXVhbHM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb21wYXJhdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xTcGFuOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd1NwYW46IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0UXVpY2tGaWx0ZXJUZXh0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG5ld1ZhbHVlSGFuZGxlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxWYWx1ZUNoYW5nZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsQ2xpY2tlZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxEb3VibGVDbGlja2VkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbENvbnRleHRNZW51OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdUZXh0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFZhbHVlR2V0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclNlbGVjdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JTZWxlY3RvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGbGFzaDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWx0ZXJzVG9vbFBhbmVsOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9wZW5CeURlZmF1bHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWFycnlDaGlsZHJlbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoaWRlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNoZWNrYm94U2VsZWN0aW9uOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uRmlsdGVyZWRPbmx5OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NvcnRpbmc6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmlsdGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2tQb3NpdGlvbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrVmlzaWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUGlubmVkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHVuU29ydEljb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTaXplVG9GaXQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSZXNpemU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBdXRvU2l6ZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSb3dHcm91cDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVQaXZvdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVWYWx1ZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlZGl0YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Bhc3RlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTmF2aWdhYmxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGRuZFNvdXJjZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvSGVpZ2h0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRhYmxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJlc2l6YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQ6IGFueTtcbiAgICAvLyBARU5EQFxuXG59XG4iXX0=