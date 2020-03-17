import { __decorate } from "tslib";
import { Component, ContentChildren, Input } from "@angular/core";
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
        var colDef = {};
        Object.assign(colDef, from);
        delete colDef.childColumns;
        return colDef;
    };
    ;
    var AgGridColumn_1;
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
    return AgGridColumn;
}());
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGFnLWdyaWQtY29tbXVuaXR5L2FuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQVksTUFBTSxlQUFlLENBQUM7QUFPM0U7SUFBQTtJQTRKQSxDQUFDO3FCQTVKWSxZQUFZO0lBR2Qsc0NBQWUsR0FBdEI7UUFDSSxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ25ELHVFQUF1RTtZQUN2RSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUM7U0FDaEY7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sK0JBQVEsR0FBZjtRQUNJLElBQUksTUFBTSxHQUFXLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzRCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRTtZQUNsQixNQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDdkU7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRU8sc0NBQWUsR0FBdkIsVUFBd0IsWUFBcUM7UUFDekQsT0FBTyxZQUFZO1lBQ2YsdUVBQXVFO2FBQ3RFLE1BQU0sQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUF6QixDQUF5QixDQUFDO2FBQzNDLEdBQUcsQ0FBQyxVQUFDLE1BQW9CO1lBQ3RCLE9BQU8s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USxFQUFFLEVBQUU7U0FDZixDQUFDO09BQ1csWUFBWSxDQTRKeEI7SUFBRCxtQkFBQztDQUFBLEFBNUpELElBNEpDO1NBNUpZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBJbnB1dCwgUXVlcnlMaXN0fSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHtDb2xEZWZ9IGZyb20gXCJAYWctZ3JpZC1jb21tdW5pdHkvY29yZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtY29sdW1uJyxcbiAgICB0ZW1wbGF0ZTogJydcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQ29sdW1uIHtcbiAgICBAQ29udGVudENoaWxkcmVuKEFnR3JpZENvbHVtbikgcHVibGljIGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBwdWJsaWMgaGFzQ2hpbGRDb2x1bW5zKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5jaGlsZENvbHVtbnMgJiYgdGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIHJldHVybiAhKHRoaXMuY2hpbGRDb2x1bW5zLmxlbmd0aCA9PT0gMSAmJiB0aGlzLmNoaWxkQ29sdW1ucy5maXJzdCA9PT0gdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b0NvbERlZigpOiBDb2xEZWYge1xuICAgICAgICBsZXQgY29sRGVmOiBDb2xEZWYgPSB0aGlzLmNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0NoaWxkQ29sdW1ucygpKSB7XG4gICAgICAgICAgICAoPGFueT5jb2xEZWYpW1wiY2hpbGRyZW5cIl0gPSB0aGlzLmdldENoaWxkQ29sRGVmcyh0aGlzLmNoaWxkQ29sdW1ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENoaWxkQ29sRGVmcyhjaGlsZENvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+KSB7XG4gICAgICAgIHJldHVybiBjaGlsZENvbHVtbnNcbiAgICAgICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEwMDk4XG4gICAgICAgICAgICAuZmlsdGVyKGNvbHVtbiA9PiAhY29sdW1uLmhhc0NoaWxkQ29sdW1ucygpKVxuICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjcmVhdGVDb2xEZWZGcm9tR3JpZENvbHVtbihmcm9tOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYge1xuICAgICAgICBsZXQgY29sRGVmOiBDb2xEZWYgPSB7fTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihjb2xEZWYsIGZyb20pO1xuICAgICAgICBkZWxldGUgKDxhbnk+Y29sRGVmKS5jaGlsZENvbHVtbnM7XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfTtcblxuICAgIC8vIGlucHV0cyAtIHByZXR0eSBtdWNoIG1vc3Qgb2YgQ29sRGVmLCB3aXRoIHRoZSBleGNlcHRpb24gb2YgdGVtcGxhdGUsIHRlbXBsYXRlVXJsIGFuZCBpbnRlcm5hbCBvbmx5IHByb3BlcnRpZXNcbiAgICAvLyBAU1RBUlRAXG4gICAgQElucHV0KCkgcHVibGljIGNoaWxkcmVuOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd2VkQWdnRnVuY3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWVudVRhYnM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzUnVsZXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFN0eWxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJlZkRhdGE6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyTmFtZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cFNob3c6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2xhc3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsQ2xhc3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVmFsdWVHZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xJZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpZWxkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHR5cGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcEZpZWxkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlclRvb2x0aXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNob3dSb3dHcm91cDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuYzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnREYXRhVHlwZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0ZWRBdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHdpZHRoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG1pbldpZHRoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG1heFdpZHRoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwSW5kZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2VPblJvd0RyYWc6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVHZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVTZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyVmFsdWVHZXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMga2V5Q3JlYXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlRm9ybWF0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd1ZhbHVlRm9ybWF0dGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlUGFyc2VyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbXBhcmF0b3I6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZXF1YWxzOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Q29tcGFyYXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sU3BhbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTcGFuOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGdldFF1aWNrRmlsdGVyVGV4dDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuZXdWYWx1ZUhhbmRsZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsVmFsdWVDaGFuZ2VkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbENsaWNrZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsRG91YmxlQ2xpY2tlZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDb250ZXh0TWVudTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnVGV4dDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBWYWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJTZWxlY3RvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yU2VsZWN0b3I6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsRmxhc2g6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5zVG9vbFBhbmVsOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmlsdGVyc1Rvb2xQYW5lbDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvcGVuQnlEZWZhdWx0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG1hcnJ5Q2hpbGRyZW46IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGlkZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGVja2JveFNlbGVjdGlvbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDaGVja2JveFNlbGVjdGlvbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDaGVja2JveFNlbGVjdGlvbkZpbHRlcmVkT25seTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTb3J0aW5nOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUG9zaXRpb246IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Zpc2libGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Bpbm5lZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2l6ZVRvRml0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUmVzaXplOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUm93R3JvdXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUGl2b3Q6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlVmFsdWU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdGFibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXN0ZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05hdmlnYWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2U6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0hlaWdodDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0YWJsZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZXNpemFibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBhbnk7XG4gICAgLy8gQEVOREBcblxufVxuIl19