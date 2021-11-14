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
    createColDefFromGridColumn(from) {
        let { childColumns } = from, colDef = __rest(from, ["childColumns"]);
        return colDef;
    }
};
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
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGFnLWdyaWQtY29tbXVuaXR5L2FuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU03RSxJQUFhLFlBQVksb0JBQXpCLE1BQWEsWUFBWTtJQUdkLGVBQWU7UUFDbEIsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRCx1RUFBdUU7WUFDdkUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLFFBQVE7UUFDWCxJQUFJLE1BQU0sR0FBVyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDbEIsTUFBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLGVBQWUsQ0FBQyxZQUFxQztRQUN6RCxPQUFPLFlBQVk7WUFDZix1RUFBdUU7YUFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDM0MsR0FBRyxDQUFDLENBQUMsTUFBb0IsRUFBRSxFQUFFO1lBQzFCLE9BQU8sTUFBTSxDQUFDLFFB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QUFvRDtBQUVuRDtJQUFSLEtBQUssRUFBRTs7Z0RBQTRIO0FBRTNIO0lBQVIsS0FBSyxFQUFFOztnREFBd0M7QUFHdkM7SUFBUixLQUFLLEVBQUU7OzhDQUFxQztBQUVwQztJQUFSLEtBQUssRUFBRTs7NkNBQWlFO0FBRWhFO0lBQVIsS0FBSyxFQUFFOzs2Q0FBaUU7QUFFaEU7SUFBUixLQUFLLEVBQUU7OzJDQUFrQztBQUVqQztJQUFSLEtBQUssRUFBRTs7a0RBQXlDO0FBRXhDO0lBQVIsS0FBSyxFQUFFOzs4Q0FBcUM7QUFFcEM7SUFBUixLQUFLLEVBQUU7OzhDQUFxQztBQUVwQztJQUFSLEtBQUssRUFBRTs7MENBQWlDO0FBRWhDO0lBQVIsS0FBSyxFQUFFOztpREFBd0M7QUFFdkM7SUFBUixLQUFLLEVBQUU7OytDQUF1QztBQUV0QztJQUFSLEtBQUssRUFBRTs7dURBQStDO0FBRTlDO0lBQVIsS0FBSyxFQUFFOztzREFBOEM7QUFoVTdDLFlBQVk7SUFKeEIsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixRQUFRLEVBQUUsRUFBRTtLQUNmLENBQUM7R0FDVyxZQUFZLENBOFd4QjtTQTlXWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2VsbENsYXNzRnVuYywgQ2VsbENsYXNzUnVsZXMsIENlbGxDbGlja2VkRXZlbnQsIENlbGxDb250ZXh0TWVudUV2ZW50LCBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LCBDZWxsRWRpdG9yU2VsZWN0b3JGdW5jLCBDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMsIENlbGxTdHlsZSwgQ2VsbFN0eWxlRnVuYywgQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjaywgQ29sRGVmLCBDb2xHcm91cERlZiwgQ29sU3BhblBhcmFtcywgQ29sdW1uc01lbnVQYXJhbXMsIERuZFNvdXJjZUNhbGxiYWNrLCBFZGl0YWJsZUNhbGxiYWNrLCBHZXRRdWlja0ZpbHRlclRleHRQYXJhbXMsIEhlYWRlckNoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2ssIEhlYWRlckNsYXNzLCBIZWFkZXJWYWx1ZUdldHRlckZ1bmMsIElBZ2dGdW5jLCBJQ2VsbEVkaXRvckNvbXAsIElDZWxsUmVuZGVyZXJDb21wLCBJQ2VsbFJlbmRlcmVyRnVuYywgSUhlYWRlckdyb3VwQ29tcCwgSVJvd0RyYWdJdGVtLCBJVG9vbHRpcENvbXAsIElUb29sdGlwUGFyYW1zLCBLZXlDcmVhdG9yUGFyYW1zLCBOZXdWYWx1ZVBhcmFtcywgUm93RHJhZ0NhbGxiYWNrLCBSb3dOb2RlLCBSb3dTcGFuUGFyYW1zLCBTdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnRQYXJhbXMsIFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcywgU3VwcHJlc3NOYXZpZ2FibGVDYWxsYmFjaywgU3VwcHJlc3NQYXN0ZUNhbGxiYWNrLCBUb29sUGFuZWxDbGFzcywgVmFsdWVGb3JtYXR0ZXJGdW5jLCBWYWx1ZUdldHRlckZ1bmMsIFZhbHVlUGFyc2VyRnVuYywgVmFsdWVTZXR0ZXJGdW5jIH0gZnJvbSBcIkBhZy1ncmlkLWNvbW11bml0eS9jb3JlXCI7XG5pbXBvcnQgeyBDb21wb25lbnQsIENvbnRlbnRDaGlsZHJlbiwgSW5wdXQsIFF1ZXJ5TGlzdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1jb2x1bW4nLFxuICAgIHRlbXBsYXRlOiAnJ1xufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRDb2x1bW4ge1xuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPjtcblxuICAgIHB1YmxpYyBoYXNDaGlsZENvbHVtbnMoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmNoaWxkQ29sdW1ucyAmJiB0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgcmV0dXJuICEodGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID09PSAxICYmIHRoaXMuY2hpbGRDb2x1bW5zLmZpcnN0ID09PSB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHRvQ29sRGVmKCk6IENvbERlZiB7XG4gICAgICAgIGxldCBjb2xEZWY6IENvbERlZiA9IHRoaXMuY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4odGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQ2hpbGRDb2x1bW5zKCkpIHtcbiAgICAgICAgICAgICg8YW55PmNvbERlZilbXCJjaGlsZHJlblwiXSA9IHRoaXMuZ2V0Q2hpbGRDb2xEZWZzKHRoaXMuY2hpbGRDb2x1bW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2hpbGRDb2xEZWZzKGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj4pIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkQ29sdW1uc1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIC5maWx0ZXIoY29sdW1uID0+ICFjb2x1bW4uaGFzQ2hpbGRDb2x1bW5zKCkpXG4gICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4oZnJvbTogQWdHcmlkQ29sdW1uKTogQ29sRGVmIHtcbiAgICAgICAgbGV0IHsgY2hpbGRDb2x1bW5zLCAuLi5jb2xEZWYgfSA9IGZyb207XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfVxuXG4gICAgLy8gaW5wdXRzIC0gcHJldHR5IG11Y2ggbW9zdCBvZiBDb2xEZWYsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwgYW5kIGludGVybmFsIG9ubHkgcHJvcGVydGllc1xuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXI6IGFueTtcbiAgICAvKiogVGhlIG5hbWUgdG8gcmVuZGVyIGluIHRoZSBjb2x1bW4gaGVhZGVyLiBJZiBub3Qgc3BlY2lmaWVkIGFuZCBmaWVsZCBpcyBzcGVjaWZpZWQsIHRoZSBmaWVsZCBuYW1lIHdpbGwgYmUgdXNlZCBhcyB0aGUgaGVhZGVyIG5hbWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIEdldHMgdGhlIHZhbHVlIGZvciBkaXNwbGF5IGluIHRoZSBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJWYWx1ZUdldHRlcjogc3RyaW5nIHwgSGVhZGVyVmFsdWVHZXR0ZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUb29sdGlwIGZvciB0aGUgY29sdW1uIGhlYWRlciAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVG9vbHRpcDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MgdG8gdXNlIGZvciB0aGUgaGVhZGVyIGNlbGwuIENhbiBiZSBhIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3IgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDbGFzczogSGVhZGVyQ2xhc3MgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFN1cHByZXNzIHRoZSBncmlkIHRha2luZyBhY3Rpb24gZm9yIHRoZSByZWxldmFudCBrZXlib2FyZCBldmVudCB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnQ6ICgocGFyYW1zOiBTdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnRQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBXaGV0aGVyIHRvIHNob3cgdGhlIGNvbHVtbiB3aGVuIHRoZSBncm91cCBpcyBvcGVuIC8gY2xvc2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uR3JvdXBTaG93OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENTUyBjbGFzcyB0byB1c2UgZm9yIHRoZSB0b29sIHBhbmVsIGNlbGwuIENhbiBiZSBhIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3IgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxDbGFzczogVG9vbFBhbmVsQ2xhc3MgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIG9yIGdyb3VwIHRvIGFwcGVhciBpbiB0aGUgQ29sdW1ucyBUb29sIFBhbmVsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIChmaWx0ZXIpIG9yIGdyb3VwIChmaWx0ZXIgZ3JvdXApIHRvIGFwcGVhciBpbiB0aGUgRmlsdGVycyBUb29sIFBhbmVsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbHRlcnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnQ6IHsgbmV3KCk6IElUb29sdGlwQ29tcDsgfSB8IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgLyoqIEEgbGlzdCBjb250YWluaW5nIGEgbWl4IG9mIGNvbHVtbnMgYW5kIGNvbHVtbiBncm91cHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGlsZHJlbjogKENvbERlZiB8IENvbEdyb3VwRGVmKVtdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgdW5pcXVlIElEIHRvIGdpdmUgdGhlIGNvbHVtbi4gVGhpcyBpcyBvcHRpb25hbC4gSWYgbWlzc2luZywgYSB1bmlxdWUgSUQgd2lsbCBiZSBnZW5lcmF0ZWQuIFRoaXMgSUQgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgY29sdW1uIGdyb3VwIGluIHRoZSBjb2x1bW4gQVBJLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHRoaXMgZ3JvdXAgc2hvdWxkIGJlIG9wZW5lZCBieSBkZWZhdWx0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvcGVuQnlEZWZhdWx0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgY29sdW1ucyBpbiB0aGlzIGdyb3VwIGJlc2lkZSBlYWNoIG90aGVyIGluIHRoZSBncmlkLiBNb3ZpbmcgdGhlIGNvbHVtbnMgb3V0c2lkZSBvZiB0aGUgZ3JvdXAgKGFuZCBoZW5jZSBicmVha2luZyB0aGUgZ3JvdXApIGlzIG5vdCBhbGxvd2VkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXJyeUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgY3VzdG9tIGhlYWRlciBncm91cCBjb21wb25lbnQgdG8gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQgaGVhZGVyLiBJZiBub25lIHNwZWNpZmllZCB0aGUgZGVmYXVsdCBBRyBHcmlkIGlzIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudDogc3RyaW5nIHwgeyBuZXcoKTogSUhlYWRlckdyb3VwQ29tcDsgfSB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGN1c3RvbSBoZWFkZXIgZ3JvdXAgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlciBpbiB0aGUgaG9zdGluZyBmcmFtZXdvcmsgKGllOiBBbmd1bGFyL1JlYWN0L1Z1ZUpzKS4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBpcyB1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICAvKiogVGhlIHBhcmFtcyB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgaGVhZGVyIGdyb3VwIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgLyoqIFRoZSB1bmlxdWUgSUQgdG8gZ2l2ZSB0aGUgY29sdW1uLiBUaGlzIGlzIG9wdGlvbmFsLiBJZiBtaXNzaW5nLCB0aGUgSUQgd2lsbCBkZWZhdWx0IHRvIHRoZSBmaWVsZC5cbiAgICAgKiBJZiBib3RoIGZpZWxkIGFuZCBjb2xJZCBhcmUgbWlzc2luZywgYSB1bmlxdWUgSUQgd2lsbCBiZSBnZW5lcmF0ZWQuXG4gICAgICogVGhpcyBJRCBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSBjb2x1bW4gaW4gdGhlIEFQSSBmb3Igc29ydGluZywgZmlsdGVyaW5nIGV0Yy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbElkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBmaWVsZCBvZiB0aGUgcm93IHRvIGdldCB0aGUgY2VsbHMgZGF0YSBmcm9tICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWVsZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncyBjb250YWluaW5nIGBDb2x1bW5UeXBlYCBrZXlzIHdoaWNoIGNhbiBiZSB1c2VkIGFzIGEgdGVtcGxhdGUgZm9yIGEgY29sdW1uLlxuICAgICAqIFRoaXMgaGVscHMgdG8gcmVkdWNlIGR1cGxpY2F0aW9uIG9mIHByb3BlcnRpZXMgd2hlbiB5b3UgaGF2ZSBhIGxvdCBvZiBjb21tb24gY29sdW1uIHByb3BlcnRpZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0eXBlOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gR2V0cyB0aGUgdmFsdWUgZnJvbSB5b3VyIGRhdGEgZm9yIGRpc3BsYXkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUdldHRlcjogc3RyaW5nIHwgVmFsdWVHZXR0ZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGZ1bmN0aW9uIG9yIGV4cHJlc3Npb24gdG8gZm9ybWF0IGEgdmFsdWUsIHNob3VsZCByZXR1cm4gYSBzdHJpbmcuIE5vdCB1c2VkIGZvciBDU1YgZXhwb3J0IG9yIGNvcHkgdG8gY2xpcGJvYXJkLCBvbmx5IGZvciBVSSBjZWxsIHJlbmRlcmluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlRm9ybWF0dGVyOiBzdHJpbmcgfCBWYWx1ZUZvcm1hdHRlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGVkIGEgcmVmZXJlbmNlIGRhdGEgbWFwIHRvIGJlIHVzZWQgdG8gbWFwIGNvbHVtbiB2YWx1ZXMgdG8gdGhlaXIgcmVzcGVjdGl2ZSB2YWx1ZSBmcm9tIHRoZSBtYXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZWZEYXRhOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZzsgfSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gdG8gcmV0dXJuIGEgc3RyaW5nIGtleSBmb3IgYSB2YWx1ZS5cbiAgICAgKiBUaGlzIHN0cmluZyBpcyB1c2VkIGZvciBncm91cGluZywgU2V0IGZpbHRlcmluZywgYW5kIHNlYXJjaGluZyB3aXRoaW4gY2VsbCBlZGl0b3IgZHJvcGRvd25zLlxuICAgICAqIFdoZW4gZmlsdGVyaW5nIGFuZCBzZWFyY2hpbmcgdGhlIHN0cmluZyBpcyBleHBvc2VkIHRvIHRoZSB1c2VyLCBzbyBtYWtlIHN1cmUgdG8gcmV0dXJuIGEgaHVtYW4tcmVhZGFibGUgdmFsdWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZXlDcmVhdG9yOiAoKHBhcmFtczogS2V5Q3JlYXRvclBhcmFtcykgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9tIGNvbXBhcmF0b3IgZm9yIHZhbHVlcywgdXNlZCBieSByZW5kZXJlciB0byBrbm93IGlmIHZhbHVlcyBoYXZlIGNoYW5nZWQuIENlbGxzIHdobydzIHZhbHVlcyBoYXZlIG5vdCBjaGFuZ2VkIGRvbid0IGdldCByZWZyZXNoZWQuXG4gICAgICogQnkgZGVmYXVsdCB0aGUgZ3JpZCB1c2VzIGA9PT1gIGlzIHVzZWQgd2hpY2ggc2hvdWxkIHdvcmsgZm9yIG1vc3QgdXNlIGNhc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXF1YWxzOiAoKHZhbHVlQTogYW55LCB2YWx1ZUI6IGFueSkgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBmaWVsZCBvZiB0aGUgdG9vbHRpcCB0byBhcHBseSB0byB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBGaWVsZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gdGhlIHN0cmluZyB1c2VkIGZvciBhIHRvb2x0aXAsIGB0b29sdGlwRmllbGRgIHRha2VzIHByZWNlZGVuY2UgaWYgc2V0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFZhbHVlR2V0dGVyOiAoKHBhcmFtczogSVRvb2x0aXBQYXJhbXMpID0+IHN0cmluZykgfCB1bmRlZmluZWQ7XG4gICAgLyoqIGBib29sZWFuYCBvciBgRnVuY3Rpb25gLiBTZXQgdG8gYHRydWVgIChvciByZXR1cm4gYHRydWVgIGZyb20gZnVuY3Rpb24pIHRvIHJlbmRlciBhIHNlbGVjdGlvbiBjaGVja2JveCBpbiB0aGUgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IENoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIHRvIHVzZSBpbnNpZGUgdGhlIGNvbHVtbiBpbnN0ZWFkIG9mIHRoZSBncmlkJ3MgZGVmYXVsdCBpY29ucy4gTGVhdmUgdW5kZWZpbmVkIHRvIHVzZSBkZWZhdWx0cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGljb25zOiB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIHwgc3RyaW5nOyB9IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHRoaXMgY29sdW1uIGlzIG5vdCBuYXZpZ2FibGUgKGkuZS4gY2Fubm90IGJlIHRhYmJlZCBpbnRvKSwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAgICogQ2FuIGFsc28gYmUgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBoYXZlIGRpZmZlcmVudCByb3dzIG5hdmlnYWJsZS5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05hdmlnYWJsZTogYm9vbGVhbiB8IFN1cHByZXNzTmF2aWdhYmxlQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB0aGUgdXNlciB0byBzdXBwcmVzcyBjZXJ0YWluIGtleWJvYXJkIGV2ZW50cyBpbiB0aGUgZ3JpZCBjZWxsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6ICgocGFyYW1zOiBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQYXN0aW5nIGlzIG9uIGJ5IGRlZmF1bHQgYXMgbG9uZyBhcyBjZWxscyBhcmUgZWRpdGFibGUgKG5vbi1lZGl0YWJsZSBjZWxscyBjYW5ub3QgYmUgbW9kaWZpZWQsIGV2ZW4gd2l0aCBhIHBhc3RlIG9wZXJhdGlvbikuXG4gICAgICogU2V0IHRvIGB0cnVlYCB0dXJuIHBhc3RlIG9wZXJhdGlvbnMgb2ZmLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXN0ZTogYm9vbGVhbiB8IFN1cHByZXNzUGFzdGVDYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gcHJldmVudCB0aGUgZmlsbEhhbmRsZSBmcm9tIGJlaW5nIHJlbmRlcmVkIGluIGFueSBjZWxsIHRoYXQgYmVsb25ncyB0byB0aGlzIGNvbHVtbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWxsSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGZvciB0aGlzIGNvbHVtbiB0byBiZSBoaWRkZW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhpZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYGhpZGVgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGJsb2NrIG1ha2luZyBjb2x1bW4gdmlzaWJsZSAvIGhpZGRlbiB2aWEgdGhlIFVJIChBUEkgd2lsbCBzdGlsbCB3b3JrKS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Zpc2libGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIGhhdmUgdGhpcyBjb2x1bW4gZGlzcGxheWVkIGZpcnN0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUG9zaXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIHRvIGJlIG1vdmFibGUgdmlhIGRyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBjb2x1bW4gaXMgZWRpdGFibGUsIG90aGVyd2lzZSBgZmFsc2VgLiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRvIGhhdmUgZGlmZmVyZW50IHJvd3MgZWRpdGFibGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVkaXRhYmxlOiBib29sZWFuIHwgRWRpdGFibGVDYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gU2V0cyB0aGUgdmFsdWUgaW50byB5b3VyIGRhdGEgZm9yIHNhdmluZy4gUmV0dXJuIGB0cnVlYCBpZiB0aGUgZGF0YSBjaGFuZ2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVTZXR0ZXI6IHN0cmluZyB8IFZhbHVlU2V0dGVyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gUGFyc2VzIHRoZSB2YWx1ZSBmb3Igc2F2aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVQYXJzZXI6IHN0cmluZyB8IFZhbHVlUGFyc2VyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBgY2VsbEVkaXRvcmAgdG8gdXNlIGZvciB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3I6IHN0cmluZyB8IHsgbmV3KCk6IElDZWxsRWRpdG9yQ29tcDsgfSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnJhbWV3b3JrIGBjZWxsRWRpdG9yYCB0byB1c2UgZm9yIHRoaXMgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvckZyYW1ld29yazogYW55O1xuICAgIC8qKiBQYXJhbXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBjZWxsIGVkaXRvciBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUGFyYW1zOiBhbnk7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBjZWxsIGVkaXRvciB0byBiZSB1c2VkIGZvciBhIGdpdmVuIHJvdyB3aXRoaW4gdGhlIHNhbWUgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclNlbGVjdG9yOiBDZWxsRWRpdG9yU2VsZWN0b3JGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgY2VsbHMgdW5kZXIgdGhpcyBjb2x1bW4gZW50ZXIgZWRpdCBtb2RlIGFmdGVyIHNpbmdsZSBjbGljay4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB1c2UgYHZhbHVlU2V0dGVyYCBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5ld1ZhbHVlSGFuZGxlcjogKChwYXJhbXM6IE5ld1ZhbHVlUGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCwgdG8gaGF2ZSB0aGUgY2VsbCBlZGl0b3IgYXBwZWFyIGluIGEgcG9wdXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUG9wdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGUgcG9zaXRpb24gZm9yIHRoZSBwb3B1cCBjZWxsIGVkaXRvci4gUG9zc2libGUgdmFsdWVzIGFyZVxuICAgICAqICAgLSBgb3ZlcmAgUG9wdXAgd2lsbCBiZSBwb3NpdGlvbmVkIG92ZXIgdGhlIGNlbGxcbiAgICAgKiAgIC0gYHVuZGVyYCBQb3B1cCB3aWxsIGJlIHBvc2l0aW9uZWQgYmVsb3cgdGhlIGNlbGwgbGVhdmluZyB0aGUgY2VsbCB2YWx1ZSB2aXNpYmxlLlxuICAgICAqIFxuICAgICAqIERlZmF1bHQ6IGBvdmVyYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JQb3B1cFBvc2l0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGZvciBhZnRlciB0aGUgdmFsdWUgb2YgYSBjZWxsIGhhcyBjaGFuZ2VkLCBlaXRoZXIgZHVlIHRvIGVkaXRpbmcgb3IgdGhlIGFwcGxpY2F0aW9uIGNhbGxpbmcgYGFwaS5zZXRWYWx1ZSgpYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbFZhbHVlQ2hhbmdlZDogKChldmVudDogTmV3VmFsdWVQYXJhbXMpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiBhIGNlbGwgaXMgY2xpY2tlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbENsaWNrZWQ6ICgoZXZlbnQ6IENlbGxDbGlja2VkRXZlbnQpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiBhIGNlbGwgaXMgZG91YmxlIGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxEb3VibGVDbGlja2VkOiAoKGV2ZW50OiBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIHJpZ2h0IGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDb250ZXh0TWVudTogKChldmVudDogQ2VsbENvbnRleHRNZW51RXZlbnQpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGZ1bmN0aW9uIHRvIHRlbGwgdGhlIGdyaWQgd2hhdCBxdWljayBmaWx0ZXIgdGV4dCB0byB1c2UgZm9yIHRoaXMgY29sdW1uIGlmIHlvdSBkb24ndCB3YW50IHRvIHVzZSB0aGUgZGVmYXVsdCAod2hpY2ggaXMgY2FsbGluZyBgdG9TdHJpbmdgIG9uIHRoZSB2YWx1ZSkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRRdWlja0ZpbHRlclRleHQ6ICgocGFyYW1zOiBHZXRRdWlja0ZpbHRlclRleHRQYXJhbXMpID0+IHN0cmluZykgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIEdldHMgdGhlIHZhbHVlIGZvciBmaWx0ZXJpbmcgcHVycG9zZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJWYWx1ZUdldHRlcjogc3RyaW5nIHwgVmFsdWVHZXR0ZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBXaGV0aGVyIHRvIGRpc3BsYXkgYSBmbG9hdGluZyBmaWx0ZXIgZm9yIHRoaXMgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGN1c3RvbSBoZWFkZXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlci4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBoZWFkZXIgY29tcG9uZW50IGlzIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnQ6IHN0cmluZyB8IHsgbmV3KCk6IGFueTsgfSB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGN1c3RvbSBoZWFkZXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlciBpbiB0aGUgaG9zdGluZyBmcmFtZXdvcmsgKGllOiBBbmd1bGFyL1JlYWN0L1Z1ZUpzKS4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBoZWFkZXIgY29tcG9uZW50IGlzIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICAvKiogVGhlIHBhcmFtZXRlcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBoZWFkZXIgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgLyoqIFNldCB0byBhbiBhcnJheSBjb250YWluaW5nIHplcm8sIG9uZSBvciBtYW55IG9mIHRoZSBmb2xsb3dpbmcgb3B0aW9uczogYCdmaWx0ZXJNZW51VGFiJyB8ICdnZW5lcmFsTWVudVRhYicgfCAnY29sdW1uc01lbnVUYWInYC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZmlndXJlIG91dCB3aGljaCBtZW51IHRhYnMgYXJlIHByZXNlbnQgYW5kIGluIHdoaWNoIG9yZGVyIHRoZSB0YWJzIGFyZSBzaG93bi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1lbnVUYWJzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbiAgICAvKiogUGFyYW1zIHVzZWQgdG8gY2hhbmdlIHRoZSBiZWhhdmlvdXIgYW5kIGFwcGVhcmFuY2Ugb2YgdGhlIENvbHVtbnMgTWVudSB0YWIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5zTWVudVBhcmFtczogQ29sdW1uc01lbnVQYXJhbXMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgbm8gbWVudSBzaG91bGQgYmUgc2hvd24gZm9yIHRoaXMgY29sdW1uIGhlYWRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAgb3IgdGhlIGNhbGxiYWNrIHJldHVybnMgYHRydWVgLCBhICdzZWxlY3QgYWxsJyBjaGVja2JveCB3aWxsIGJlIHB1dCBpbnRvIHRoZSBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IEhlYWRlckNoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGhlYWRlciBjaGVja2JveCBzZWxlY3Rpb24gd2lsbCBvbmx5IHNlbGVjdCBmaWx0ZXJlZCBpdGVtcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBEZWZpbmVzIHRoZSBjaGFydCBkYXRhIHR5cGUgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgYSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydERhdGFUeXBlOiAnY2F0ZWdvcnknIHwgJ3NlcmllcycgfCAndGltZScgfCAnZXhjbHVkZWQnIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQaW4gYSBjb2x1bW4gdG8gb25lIHNpZGU6IGByaWdodGAgb3IgYGxlZnRgLiBBIHZhbHVlIG9mIGB0cnVlYCBpcyBjb252ZXJ0ZWQgdG8gYCdsZWZ0J2AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWQ6IGJvb2xlYW4gfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBwaW5uZWRgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaW5uZWQ6IGJvb2xlYW4gfCBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGJsb2NrIHRoZSB1c2VyIHBpbm5pbmcgdGhlIGNvbHVtbiwgdGhlIGNvbHVtbiBjYW4gb25seSBiZSBwaW5uZWQgdmlhIGRlZmluaXRpb25zIG9yIEFQSS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Bpbm5lZDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGNlbGxSZW5kZXJlclNlbGVjdG9yIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IENlbGwgUmVuZGVyZXIgZm9yIHBpbm5lZCByb3dzLiBDaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGNlbGxSZW5kZXJlclNlbGVjdG9yIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IENlbGwgUmVuZGVyZXIgZm9yIHBpbm5lZCByb3dzLiBDaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlckZyYW1ld29yazogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgY2VsbFJlbmRlcmVyU2VsZWN0b3IgaWYgeW91IHdhbnQgYSBkaWZmZXJlbnQgQ2VsbCBSZW5kZXJlciBmb3IgcGlubmVkIHJvd3MuIENoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyUGFyYW1zOiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSB2YWx1ZUZvcm1hdHRlciBmb3IgcGlubmVkIHJvd3MsIGFuZCBjaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd1ZhbHVlRm9ybWF0dGVyOiBzdHJpbmcgfCBWYWx1ZUZvcm1hdHRlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIHBpdm90IGJ5IHRoaXMgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHBpdm90YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIGluIGNvbHVtbnMgeW91IHdhbnQgdG8gcGl2b3QgYnkuXG4gICAgICogSWYgb25seSBwaXZvdGluZyBieSBvbmUgY29sdW1uLCBzZXQgdGhpcyB0byBhbnkgbnVtYmVyIChlLmcuIGAwYCkuXG4gICAgICogSWYgcGl2b3RpbmcgYnkgbXVsdGlwbGUgY29sdW1ucywgc2V0IHRoaXMgdG8gd2hlcmUgeW91IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgaW4gdGhlIG9yZGVyIG9mIHBpdm90cyAoZS5nLiBgMGAgZm9yIGZpcnN0LCBgMWAgZm9yIHNlY29uZCwgYW5kIHNvIG9uKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90SW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHBpdm90SW5kZXhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgdG8gdXNlIHdoZW4gb3JkZXJpbmcgdGhlIHBpdm90IGNvbHVtbnMsIHdoZW4gdGhpcyBjb2x1bW4gaXMgdXNlZCB0byBwaXZvdCBvbi5cbiAgICAgKiBUaGUgdmFsdWVzIHdpbGwgYWx3YXlzIGJlIHN0cmluZ3MsIGFzIHRoZSBwaXZvdCBzZXJ2aWNlIHVzZXMgc3RyaW5ncyBhcyBrZXlzIGZvciB0aGUgcGl2b3QgZ3JvdXBzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb21wYXJhdG9yOiAoKHZhbHVlQTogc3RyaW5nLCB2YWx1ZUI6IHN0cmluZykgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIHBpdm90IGJ5IHRoaXMgY29sdW1uIHZpYSB0aGUgR1VJLiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgcGl2b3QuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVBpdm90OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3Qgb2YgY3NzIHZhbHVlcyAvIG9yIGZ1bmN0aW9uIHJldHVybmluZyBhbiBvYmplY3Qgb2YgY3NzIHZhbHVlcyBmb3IgYSBwYXJ0aWN1bGFyIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsU3R5bGU6IENlbGxTdHlsZSB8IENlbGxTdHlsZUZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENsYXNzIHRvIHVzZSBmb3IgdGhlIGNlbGwuIENhbiBiZSBzdHJpbmcsIGFycmF5IG9mIHN0cmluZ3MsIG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzOiBzdHJpbmcgfCBzdHJpbmdbXSB8IENlbGxDbGFzc0Z1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFJ1bGVzIHdoaWNoIGNhbiBiZSBhcHBsaWVkIHRvIGluY2x1ZGUgY2VydGFpbiBDU1MgY2xhc3Nlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxDbGFzc1J1bGVzOiBDZWxsQ2xhc3NSdWxlcyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBgY2VsbFJlbmRlcmVyYCB0byB1c2UgZm9yIHRoaXMgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyQ29tcDsgfSB8IElDZWxsUmVuZGVyZXJGdW5jIHwgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGcmFtZXdvcmsgYGNlbGxSZW5kZXJlcmAgdG8gdXNlIGZvciB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlckZyYW1ld29yazogYW55O1xuICAgIC8qKiBQYXJhbXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBjZWxsIHJlbmRlcmVyIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggY2VsbCByZW5kZXJlciB0byBiZSB1c2VkIGZvciBhIGdpdmVuIHJvdyB3aXRoaW4gdGhlIHNhbWUgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyU2VsZWN0b3I6IENlbGxSZW5kZXJlclNlbGVjdG9yRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSBncmlkIGNhbGN1bGF0ZSB0aGUgaGVpZ2h0IG9mIGEgcm93IGJhc2VkIG9uIGNvbnRlbnRzIG9mIHRoaXMgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvSGVpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIHRleHQgd3JhcCBpbnNpZGUgdGhlIGNlbGwgLSB0eXBpY2FsbHkgdXNlZCB3aXRoIGBhdXRvSGVpZ2h0YC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgd3JhcFRleHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZmxhc2ggYSBjZWxsIHdoZW4gaXQncyByZWZyZXNoZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBwcmV2ZW50IHRoaXMgY29sdW1uIGZyb20gZmxhc2hpbmcgb24gY2hhbmdlcy4gT25seSBhcHBsaWNhYmxlIGlmIGNlbGwgZmxhc2hpbmcgaXMgdHVybmVkIG9uIGZvciB0aGUgZ3JpZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIGBib29sZWFuYCBvciBgRnVuY3Rpb25gLiBTZXQgdG8gYHRydWVgIChvciByZXR1cm4gYHRydWVgIGZyb20gZnVuY3Rpb24pIHRvIGFsbG93IHJvdyBkcmFnZ2luZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZzogYm9vbGVhbiB8IFJvd0RyYWdDYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gYSBzdHJpbmcgdG8gYmUgZGlzcGxheWVkIGJ5IHRoZSBgcm93RHJhZ0NvbXBgIHdoaWxlIGRyYWdnaW5nIGEgcm93LlxuICAgICAqIElmIHRoaXMgY2FsbGJhY2sgaXMgbm90IHNldCwgdGhlIGN1cnJlbnQgY2VsbCB2YWx1ZSB3aWxsIGJlIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnVGV4dDogKChwYXJhbXM6IElSb3dEcmFnSXRlbSwgZHJhZ0l0ZW1Db3VudDogbnVtYmVyKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBgYm9vbGVhbmAgb3IgYEZ1bmN0aW9uYC4gU2V0IHRvIGB0cnVlYCAob3IgcmV0dXJuIGB0cnVlYCBmcm9tIGZ1bmN0aW9uKSB0byBhbGxvdyBkcmFnZ2luZyBmb3IgbmF0aXZlIGRyYWcgYW5kIGRyb3AuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRuZFNvdXJjZTogYm9vbGVhbiB8IERuZFNvdXJjZUNhbGxiYWNrIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiB0byBhbGxvdyBjdXN0b20gZHJhZyBmdW5jdGlvbmFsaXR5IGZvciBuYXRpdmUgZHJhZyBhbmQgZHJvcC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRuZFNvdXJjZU9uUm93RHJhZzogKChwYXJhbXM6IHsgcm93Tm9kZTogUm93Tm9kZSwgZHJhZ0V2ZW50OiBEcmFnRXZlbnQ7IH0pID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHJvdyBncm91cCBieSB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHJvd0dyb3VwYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUm93R3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIGluIGNvbHVtbnMgeW91IHdhbnQgdG8gZ3JvdXAgYnkuXG4gICAgICogSWYgb25seSBncm91cGluZyBieSBvbmUgY29sdW1uLCBzZXQgdGhpcyB0byBhbnkgbnVtYmVyIChlLmcuIGAwYCkuXG4gICAgICogSWYgZ3JvdXBpbmcgYnkgbXVsdGlwbGUgY29sdW1ucywgc2V0IHRoaXMgdG8gd2hlcmUgeW91IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgaW4gdGhlIGdyb3VwIChlLmcuIGAwYCBmb3IgZmlyc3QsIGAxYCBmb3Igc2Vjb25kLCBhbmQgc28gb24pLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBJbmRleDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcm93R3JvdXBJbmRleGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFJvd0dyb3VwSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIHJvdyBncm91cCBieSB0aGlzIGNvbHVtbiB2aWEgdGhlIEdVSS5cbiAgICAgKiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgcm93IGdyb3VwaW5nLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJvd0dyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRvIGJlIGFibGUgdG8gYWdncmVnYXRlIGJ5IHRoaXMgY29sdW1uIHZpYSB0aGUgR1VJLlxuICAgICAqIFRoaXMgd2lsbCBub3QgYmxvY2sgdGhlIEFQSSBvciBwcm9wZXJ0aWVzIGJlaW5nIHVzZWQgdG8gYWNoaWV2ZSBhZ2dyZWdhdGlvbi5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVWYWx1ZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogTmFtZSBvZiBmdW5jdGlvbiB0byB1c2UgZm9yIGFnZ3JlZ2F0aW9uLiBZb3UgY2FuIGFsc28gcHJvdmlkZSB5b3VyIG93biBhZ2cgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jOiBzdHJpbmcgfCBJQWdnRnVuYyB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYGFnZ0Z1bmNgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxBZ2dGdW5jOiBzdHJpbmcgfCBJQWdnRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQWdncmVnYXRpb24gZnVuY3Rpb25zIGFsbG93ZWQgb24gdGhpcyBjb2x1bW4gZS5nLiBgWydzdW0nLCAnYXZnJ11gLlxuICAgICAqIElmIG1pc3NpbmcsIGFsbCBpbnN0YWxsZWQgZnVuY3Rpb25zIGFyZSBhbGxvd2VkLlxuICAgICAqIFRoaXMgd2lsbCBvbmx5IHJlc3RyaWN0IHdoYXQgdGhlIEdVSSBhbGxvd3MgYSB1c2VyIHRvIHNlbGVjdCwgaXQgZG9lcyBub3QgaW1wYWN0IHdoZW4geW91IHNldCBhIGZ1bmN0aW9uIHZpYSB0aGUgQVBJLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dlZEFnZ0Z1bmNzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gaGF2ZSB0aGUgZ3JpZCBwbGFjZSB0aGUgdmFsdWVzIGZvciB0aGUgZ3JvdXAgaW50byB0aGUgY2VsbCwgb3IgcHV0IHRoZSBuYW1lIG9mIGEgZ3JvdXBlZCBjb2x1bW4gdG8ganVzdCBzaG93IHRoYXQgZ3JvdXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93Um93R3JvdXA6IHN0cmluZyB8IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgc29ydGluZyBvbiB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGFibGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIElmIHNvcnRpbmcgYnkgZGVmYXVsdCwgc2V0IGl0IGhlcmUuIFNldCB0byBgYXNjYCBvciBgZGVzY2AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBzb3J0YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBzb3J0aW5nIG1vcmUgdGhhbiBvbmUgY29sdW1uIGJ5IGRlZmF1bHQsIHNwZWNpZmllcyBvcmRlciBpbiB3aGljaCB0aGUgc29ydGluZyBzaG91bGQgYmUgYXBwbGllZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRJbmRleDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgc29ydEluZGV4YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IGRlZmluaW5nIHRoZSBvcmRlciBpbiB3aGljaCBzb3J0aW5nIG9jY3VycyAoaWYgc29ydGluZyBpcyBlbmFibGVkKS4gQW4gYXJyYXkgd2l0aCBhbnkgb2YgdGhlIGZvbGxvd2luZyBpbiBhbnkgb3JkZXIgYFsnYXNjJywnZGVzYycsbnVsbF1gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6IChzdHJpbmcgfCBudWxsKVtdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDb21wYXJhdG9yIGZ1bmN0aW9uIGZvciBjdXN0b20gc29ydGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBhcmF0b3I6ICgodmFsdWVBOiBhbnksIHZhbHVlQjogYW55LCBub2RlQTogUm93Tm9kZSwgbm9kZUI6IFJvd05vZGUsIGlzSW52ZXJ0ZWQ6IGJvb2xlYW4pID0+IG51bWJlcikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdGhlIHVuc29ydGVkIGljb24gdG8gYmUgc2hvd24gd2hlbiBubyBzb3J0IGlzIGFwcGxpZWQgdG8gdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuU29ydEljb246IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHYyNCAtIHVzZSBzb3J0SW5kZXggaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0ZWRBdDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCBlYWNoIGNlbGwgd2lsbCB0YWtlIHVwIHRoZSB3aWR0aCBvZiBvbmUgY29sdW1uLiBZb3UgY2FuIGNoYW5nZSB0aGlzIGJlaGF2aW91ciB0byBhbGxvdyBjZWxscyB0byBzcGFuIG11bHRpcGxlIGNvbHVtbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xTcGFuOiAoKHBhcmFtczogQ29sU3BhblBhcmFtcykgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgZWFjaCBjZWxsIHdpbGwgdGFrZSB1cCB0aGUgaGVpZ2h0IG9mIG9uZSByb3cuIFlvdSBjYW4gY2hhbmdlIHRoaXMgYmVoYXZpb3VyIHRvIGFsbG93IGNlbGxzIHRvIHNwYW4gbXVsdGlwbGUgcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1NwYW46ICgocGFyYW1zOiBSb3dTcGFuUGFyYW1zKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJbml0aWFsIHdpZHRoIGluIHBpeGVscyBmb3IgdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3aWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGB3aWR0aGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIE1pbmltdW0gd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1pbldpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIE1heGltdW0gd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFVzZWQgaW5zdGVhZCBvZiBgd2lkdGhgIHdoZW4gdGhlIGdvYWwgaXMgdG8gZmlsbCB0aGUgcmVtYWluaW5nIGVtcHR5IHNwYWNlIG9mIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBmbGV4YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsRmxleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IHRoaXMgY29sdW1uIHNob3VsZCBiZSByZXNpemVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZXNpemFibGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdGhpcyBjb2x1bW4ncyB3aWR0aCB0byBiZSBmaXhlZCBkdXJpbmcgJ3NpemUgdG8gZml0JyBvcGVyYXRpb25zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NpemVUb0ZpdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgYXV0by1yZXNpemFibGUgYnkgZG91YmxlIGNsaWNraW5nIGl0J3MgZWRnZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblxuXG4gICAgLy8gRW5hYmxlIHR5cGUgY29lcmNpb24gZm9yIGJvb2xlYW4gSW5wdXRzIHRvIHN1cHBvcnQgdXNlIGxpa2UgJ2VuYWJsZUNoYXJ0cycgaW5zdGVhZCBvZiBmb3JjaW5nICdbZW5hYmxlQ2hhcnRzXT1cInRydWVcIicgXG4gICAgLy8gaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3RlbXBsYXRlLXR5cGVjaGVjayNpbnB1dC1zZXR0ZXItY29lcmNpb24gXG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbEZsYXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmlsdGVyc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfb3BlbkJ5RGVmYXVsdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFycnlDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW5pdGlhbEhpZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0dyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsUm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsUGl2b3Q6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oZWFkZXJDaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25GaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2NrUG9zaXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tWaXNpYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2NrUGlubmVkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91blNvcnRJY29uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1NpemVUb0ZpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVBpdm90OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVWYWx1ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZWRpdGFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTmF2aWdhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RuZFNvdXJjZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b0hlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfd3JhcFRleHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NvcnRhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZXNpemFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZmxvYXRpbmdGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NlbGxFZGl0b3JQb3B1cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIC8vIEBFTkRAXG5cbn1cbiJdfQ==