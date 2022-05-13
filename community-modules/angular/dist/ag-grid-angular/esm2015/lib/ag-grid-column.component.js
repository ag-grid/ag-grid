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
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGFnLWdyaWQtY29tbXVuaXR5L2FuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU03RSxJQUFhLFlBQVksb0JBQXpCLE1BQWEsWUFBWTtJQUdkLGVBQWU7UUFDbEIsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRCx1RUFBdUU7WUFDdkUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLFFBQVE7UUFDWCxJQUFJLE1BQU0sR0FBVyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDbEIsTUFBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLGVBQWUsQ0FBQyxZQUFxQztRQUN6RCxPQUFPLFlBQVk7WUFDZix1RUFBdUU7YUFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDM0MsR0FBRyxDQUFDLENBQUMsTUFBb0IsRUFBRSxFQUFFO1lBQzFCLE9BQU8sTUFBTSxDQUFDLFFB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QUE2QztBQUU1QztJQUFSLEtBQUssRUFBRTs7c0RBQTZDO0FBRTVDO0lBQVIsS0FBSyxFQUFFOztrREFBNEQ7QUFFM0Q7SUFBUixLQUFLLEVBQUU7O2dEQUE0SDtBQUUzSDtJQUFSLEtBQUssRUFBRTs7Z0RBQXdDO0FBR3ZDO0lBQVIsS0FBSyxFQUFFOzs4Q0FBcUM7QUFFcEM7SUFBUixLQUFLLEVBQUU7OzZDQUFpRTtBQUVoRTtJQUFSLEtBQUssRUFBRTs7NkNBQWlFO0FBRWhFO0lBQVIsS0FBSyxFQUFFOzsyQ0FBa0M7QUFFakM7SUFBUixLQUFLLEVBQUU7O2tEQUF5QztBQUV4QztJQUFSLEtBQUssRUFBRTs7OENBQXFDO0FBRXBDO0lBQVIsS0FBSyxFQUFFOzs4Q0FBcUM7QUFFcEM7SUFBUixLQUFLLEVBQUU7OzBDQUFpQztBQUVoQztJQUFSLEtBQUssRUFBRTs7aURBQXdDO0FBRXZDO0lBQVIsS0FBSyxFQUFFOzsrQ0FBdUM7QUFFdEM7SUFBUixLQUFLLEVBQUU7O3VEQUErQztBQUU5QztJQUFSLEtBQUssRUFBRTs7c0RBQThDO0FBclY3QyxZQUFZO0lBSnhCLFNBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsUUFBUSxFQUFFLEVBQUU7S0FDZixDQUFDO0dBQ1csWUFBWSxDQW1ZeEI7U0FuWVksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENlbGxDbGFzc0Z1bmMsIENlbGxDbGFzc1J1bGVzLCBDZWxsQ2xpY2tlZEV2ZW50LCBDZWxsQ29udGV4dE1lbnVFdmVudCwgQ2VsbERvdWJsZUNsaWNrZWRFdmVudCwgQ2VsbEVkaXRvclNlbGVjdG9yRnVuYywgQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jLCBDZWxsU3R5bGUsIENlbGxTdHlsZUZ1bmMsIENoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2ssIENvbERlZiwgQ29sR3JvdXBEZWYsIENvbFNwYW5QYXJhbXMsIENvbHVtbnNNZW51UGFyYW1zLCBEbmRTb3VyY2VDYWxsYmFjaywgRG5kU291cmNlT25Sb3dEcmFnUGFyYW1zLCBFZGl0YWJsZUNhbGxiYWNrLCBHZXRRdWlja0ZpbHRlclRleHRQYXJhbXMsIEhlYWRlckNoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2ssIEhlYWRlckNsYXNzLCBIZWFkZXJWYWx1ZUdldHRlckZ1bmMsIElBZ2dGdW5jLCBJQ2VsbEVkaXRvckNvbXAsIElDZWxsUmVuZGVyZXJDb21wLCBJQ2VsbFJlbmRlcmVyRnVuYywgSUhlYWRlckdyb3VwQ29tcCwgSVJvd0RyYWdJdGVtLCBJVG9vbHRpcENvbXAsIElUb29sdGlwUGFyYW1zLCBLZXlDcmVhdG9yUGFyYW1zLCBOZXdWYWx1ZVBhcmFtcywgUm93RHJhZ0NhbGxiYWNrLCBSb3dOb2RlLCBSb3dTcGFuUGFyYW1zLCBTdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnRQYXJhbXMsIFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcywgU3VwcHJlc3NOYXZpZ2FibGVDYWxsYmFjaywgU3VwcHJlc3NQYXN0ZUNhbGxiYWNrLCBUb29sUGFuZWxDbGFzcywgVmFsdWVGb3JtYXR0ZXJGdW5jLCBWYWx1ZUdldHRlckZ1bmMsIFZhbHVlUGFyc2VyRnVuYywgVmFsdWVTZXR0ZXJGdW5jIH0gZnJvbSBcIkBhZy1ncmlkLWNvbW11bml0eS9jb3JlXCI7XG5pbXBvcnQgeyBDb21wb25lbnQsIENvbnRlbnRDaGlsZHJlbiwgSW5wdXQsIFF1ZXJ5TGlzdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1jb2x1bW4nLFxuICAgIHRlbXBsYXRlOiAnJ1xufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRDb2x1bW4ge1xuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPjtcblxuICAgIHB1YmxpYyBoYXNDaGlsZENvbHVtbnMoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmNoaWxkQ29sdW1ucyAmJiB0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgcmV0dXJuICEodGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID09PSAxICYmIHRoaXMuY2hpbGRDb2x1bW5zLmZpcnN0ID09PSB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHRvQ29sRGVmKCk6IENvbERlZiB7XG4gICAgICAgIGxldCBjb2xEZWY6IENvbERlZiA9IHRoaXMuY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4odGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQ2hpbGRDb2x1bW5zKCkpIHtcbiAgICAgICAgICAgICg8YW55PmNvbERlZilbXCJjaGlsZHJlblwiXSA9IHRoaXMuZ2V0Q2hpbGRDb2xEZWZzKHRoaXMuY2hpbGRDb2x1bW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2hpbGRDb2xEZWZzKGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj4pIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkQ29sdW1uc1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIC5maWx0ZXIoY29sdW1uID0+ICFjb2x1bW4uaGFzQ2hpbGRDb2x1bW5zKCkpXG4gICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4oZnJvbTogQWdHcmlkQ29sdW1uKTogQ29sRGVmIHtcbiAgICAgICAgbGV0IHsgY2hpbGRDb2x1bW5zLCAuLi5jb2xEZWYgfSA9IGZyb207XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfVxuXG4gICAgLy8gaW5wdXRzIC0gcHJldHR5IG11Y2ggbW9zdCBvZiBDb2xEZWYsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwgYW5kIGludGVybmFsIG9ubHkgcHJvcGVydGllc1xuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXI6IGFueTtcbiAgICAvKiogVGhlIG5hbWUgdG8gcmVuZGVyIGluIHRoZSBjb2x1bW4gaGVhZGVyLiBJZiBub3Qgc3BlY2lmaWVkIGFuZCBmaWVsZCBpcyBzcGVjaWZpZWQsIHRoZSBmaWVsZCBuYW1lIHdpbGwgYmUgdXNlZCBhcyB0aGUgaGVhZGVyIG5hbWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIEdldHMgdGhlIHZhbHVlIGZvciBkaXNwbGF5IGluIHRoZSBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJWYWx1ZUdldHRlcjogc3RyaW5nIHwgSGVhZGVyVmFsdWVHZXR0ZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUb29sdGlwIGZvciB0aGUgY29sdW1uIGhlYWRlciAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVG9vbHRpcDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MgdG8gdXNlIGZvciB0aGUgaGVhZGVyIGNlbGwuIENhbiBiZSBhIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3IgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDbGFzczogSGVhZGVyQ2xhc3MgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFN1cHByZXNzIHRoZSBncmlkIHRha2luZyBhY3Rpb24gZm9yIHRoZSByZWxldmFudCBrZXlib2FyZCBldmVudCB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnQ6ICgocGFyYW1zOiBTdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnRQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBXaGV0aGVyIHRvIHNob3cgdGhlIGNvbHVtbiB3aGVuIHRoZSBncm91cCBpcyBvcGVuIC8gY2xvc2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uR3JvdXBTaG93OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENTUyBjbGFzcyB0byB1c2UgZm9yIHRoZSB0b29sIHBhbmVsIGNlbGwuIENhbiBiZSBhIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3IgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxDbGFzczogVG9vbFBhbmVsQ2xhc3MgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIG9yIGdyb3VwIHRvIGFwcGVhciBpbiB0aGUgQ29sdW1ucyBUb29sIFBhbmVsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIChmaWx0ZXIpIG9yIGdyb3VwIChmaWx0ZXIgZ3JvdXApIHRvIGFwcGVhciBpbiB0aGUgRmlsdGVycyBUb29sIFBhbmVsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbHRlcnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgeW91ciBvd24gdG9vbHRpcCBjb21wb25lbnQgZm9yIHRoZSBjb2x1bW4uXG4gICAgICogU2VlIFtUb29sdGlwIENvbXBvbmVudF0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LXRvb2x0aXAvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50OiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGB0b29sdGlwQ29tcG9uZW50YCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFRoZSBwYXJhbXMgdXNlZCB0byBjb25maWd1cmUgYHRvb2x0aXBDb21wb25lbnRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudFBhcmFtczogYW55O1xuICAgIC8qKiBBIGxpc3QgY29udGFpbmluZyBhIG1peCBvZiBjb2x1bW5zIGFuZCBjb2x1bW4gZ3JvdXBzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hpbGRyZW46IChDb2xEZWYgfCBDb2xHcm91cERlZilbXSB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIHVuaXF1ZSBJRCB0byBnaXZlIHRoZSBjb2x1bW4uIFRoaXMgaXMgb3B0aW9uYWwuIElmIG1pc3NpbmcsIGEgdW5pcXVlIElEIHdpbGwgYmUgZ2VuZXJhdGVkLiBUaGlzIElEIGlzIHVzZWQgdG8gaWRlbnRpZnkgdGhlIGNvbHVtbiBncm91cCBpbiB0aGUgY29sdW1uIEFQSS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB0aGlzIGdyb3VwIHNob3VsZCBiZSBvcGVuZWQgYnkgZGVmYXVsdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3BlbkJ5RGVmYXVsdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBrZWVwIGNvbHVtbnMgaW4gdGhpcyBncm91cCBiZXNpZGUgZWFjaCBvdGhlciBpbiB0aGUgZ3JpZC4gTW92aW5nIHRoZSBjb2x1bW5zIG91dHNpZGUgb2YgdGhlIGdyb3VwIChhbmQgaGVuY2UgYnJlYWtpbmcgdGhlIGdyb3VwKSBpcyBub3QgYWxsb3dlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWFycnlDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGN1c3RvbSBoZWFkZXIgZ3JvdXAgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlci4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBpcyB1c2VkLlxuICAgICAqIFNlZSBbSGVhZGVyIEdyb3VwIENvbXBvbmVudF0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LWhlYWRlci8jaGVhZGVyLWdyb3VwLWNvbXBvbmVudHMvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudDogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgaGVhZGVyR3JvdXBDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFRoZSBwYXJhbXMgdXNlZCB0byBjb25maWd1cmUgdGhlIGBoZWFkZXJHcm91cENvbXBvbmVudGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudFBhcmFtczogYW55O1xuICAgIC8qKiBUaGUgdW5pcXVlIElEIHRvIGdpdmUgdGhlIGNvbHVtbi4gVGhpcyBpcyBvcHRpb25hbC4gSWYgbWlzc2luZywgdGhlIElEIHdpbGwgZGVmYXVsdCB0byB0aGUgZmllbGQuXG4gICAgICogSWYgYm90aCBmaWVsZCBhbmQgY29sSWQgYXJlIG1pc3NpbmcsIGEgdW5pcXVlIElEIHdpbGwgYmUgZ2VuZXJhdGVkLlxuICAgICAqIFRoaXMgSUQgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgY29sdW1uIGluIHRoZSBBUEkgZm9yIHNvcnRpbmcsIGZpbHRlcmluZyBldGMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZmllbGQgb2YgdGhlIHJvdyBvYmplY3QgdG8gZ2V0IHRoZSBjZWxsJ3MgZGF0YSBmcm9tLlxuICAgICAqIERlZXAgcmVmZXJlbmNlcyBpbnRvIGEgcm93IG9iamVjdCBpcyBzdXBwb3J0ZWQgdmlhIGRvdCBub3RhdGlvbiwgaS5lIGAnYWRkcmVzcy5maXJzdExpbmUnYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpZWxkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEEgY29tbWEgc2VwYXJhdGVkIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzIGNvbnRhaW5pbmcgYENvbHVtblR5cGVgIGtleXMgd2hpY2ggY2FuIGJlIHVzZWQgYXMgYSB0ZW1wbGF0ZSBmb3IgYSBjb2x1bW4uXG4gICAgICogVGhpcyBoZWxwcyB0byByZWR1Y2UgZHVwbGljYXRpb24gb2YgcHJvcGVydGllcyB3aGVuIHlvdSBoYXZlIGEgbG90IG9mIGNvbW1vbiBjb2x1bW4gcHJvcGVydGllcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHR5cGU6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBHZXRzIHRoZSB2YWx1ZSBmcm9tIHlvdXIgZGF0YSBmb3IgZGlzcGxheS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlR2V0dGVyOiBzdHJpbmcgfCBWYWx1ZUdldHRlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZnVuY3Rpb24gb3IgZXhwcmVzc2lvbiB0byBmb3JtYXQgYSB2YWx1ZSwgc2hvdWxkIHJldHVybiBhIHN0cmluZy4gTm90IHVzZWQgZm9yIENTViBleHBvcnQgb3IgY29weSB0byBjbGlwYm9hcmQsIG9ubHkgZm9yIFVJIGNlbGwgcmVuZGVyaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVGb3JtYXR0ZXI6IHN0cmluZyB8IFZhbHVlRm9ybWF0dGVyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZWQgYSByZWZlcmVuY2UgZGF0YSBtYXAgdG8gYmUgdXNlZCB0byBtYXAgY29sdW1uIHZhbHVlcyB0byB0aGVpciByZXNwZWN0aXZlIHZhbHVlIGZyb20gdGhlIG1hcC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlZkRhdGE6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nOyB9IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiB0byByZXR1cm4gYSBzdHJpbmcga2V5IGZvciBhIHZhbHVlLlxuICAgICAqIFRoaXMgc3RyaW5nIGlzIHVzZWQgZm9yIGdyb3VwaW5nLCBTZXQgZmlsdGVyaW5nLCBhbmQgc2VhcmNoaW5nIHdpdGhpbiBjZWxsIGVkaXRvciBkcm9wZG93bnMuXG4gICAgICogV2hlbiBmaWx0ZXJpbmcgYW5kIHNlYXJjaGluZyB0aGUgc3RyaW5nIGlzIGV4cG9zZWQgdG8gdGhlIHVzZXIsIHNvIG1ha2Ugc3VyZSB0byByZXR1cm4gYSBodW1hbi1yZWFkYWJsZSB2YWx1ZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGtleUNyZWF0b3I6ICgocGFyYW1zOiBLZXlDcmVhdG9yUGFyYW1zKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b20gY29tcGFyYXRvciBmb3IgdmFsdWVzLCB1c2VkIGJ5IHJlbmRlcmVyIHRvIGtub3cgaWYgdmFsdWVzIGhhdmUgY2hhbmdlZC4gQ2VsbHMgd2hvJ3MgdmFsdWVzIGhhdmUgbm90IGNoYW5nZWQgZG9uJ3QgZ2V0IHJlZnJlc2hlZC5cbiAgICAgKiBCeSBkZWZhdWx0IHRoZSBncmlkIHVzZXMgYD09PWAgaXMgdXNlZCB3aGljaCBzaG91bGQgd29yayBmb3IgbW9zdCB1c2UgY2FzZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlcXVhbHM6ICgodmFsdWVBOiBhbnksIHZhbHVlQjogYW55KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGZpZWxkIG9mIHRoZSB0b29sdGlwIHRvIGFwcGx5IHRvIHRoZSBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcEZpZWxkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRoYXQgc2hvdWxkIHJldHVybiB0aGUgc3RyaW5nIHRvIHVzZSBmb3IgYSB0b29sdGlwLCBgdG9vbHRpcEZpZWxkYCB0YWtlcyBwcmVjZWRlbmNlIGlmIHNldC5cbiAgICAgKiBJZiB1c2luZyBhIGN1c3RvbSBgdG9vbHRpcENvbXBvbmVudGAgeW91IG1heSByZXR1cm4gYW55IGN1c3RvbSB2YWx1ZSB0byBiZSBwYXNzZWQgdG8geW91ciB0b29sdGlwIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBWYWx1ZUdldHRlcjogKChwYXJhbXM6IElUb29sdGlwUGFyYW1zKSA9PiBzdHJpbmcgfCBhbnkpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBgYm9vbGVhbmAgb3IgYEZ1bmN0aW9uYC4gU2V0IHRvIGB0cnVlYCAob3IgcmV0dXJuIGB0cnVlYCBmcm9tIGZ1bmN0aW9uKSB0byByZW5kZXIgYSBzZWxlY3Rpb24gY2hlY2tib3ggaW4gdGhlIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hlY2tib3hTZWxlY3Rpb246IGJvb2xlYW4gfCBDaGVja2JveFNlbGVjdGlvbkNhbGxiYWNrIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJY29ucyB0byB1c2UgaW5zaWRlIHRoZSBjb2x1bW4gaW5zdGVhZCBvZiB0aGUgZ3JpZCdzIGRlZmF1bHQgaWNvbnMuIExlYXZlIHVuZGVmaW5lZCB0byB1c2UgZGVmYXVsdHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB8IHN0cmluZzsgfSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB0aGlzIGNvbHVtbiBpcyBub3QgbmF2aWdhYmxlIChpLmUuIGNhbm5vdCBiZSB0YWJiZWQgaW50byksIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgICAqIENhbiBhbHNvIGJlIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaGF2ZSBkaWZmZXJlbnQgcm93cyBuYXZpZ2FibGUuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOYXZpZ2FibGU6IGJvb2xlYW4gfCBTdXBwcmVzc05hdmlnYWJsZUNhbGxiYWNrIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdGhlIHVzZXIgdG8gc3VwcHJlc3MgY2VydGFpbiBrZXlib2FyZCBldmVudHMgaW4gdGhlIGdyaWQgY2VsbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NLZXlib2FyZEV2ZW50OiAoKHBhcmFtczogU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogUGFzdGluZyBpcyBvbiBieSBkZWZhdWx0IGFzIGxvbmcgYXMgY2VsbHMgYXJlIGVkaXRhYmxlIChub24tZWRpdGFibGUgY2VsbHMgY2Fubm90IGJlIG1vZGlmaWVkLCBldmVuIHdpdGggYSBwYXN0ZSBvcGVyYXRpb24pLlxuICAgICAqIFNldCB0byBgdHJ1ZWAgdHVybiBwYXN0ZSBvcGVyYXRpb25zIG9mZi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFzdGU6IGJvb2xlYW4gfCBTdXBwcmVzc1Bhc3RlQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIHByZXZlbnQgdGhlIGZpbGxIYW5kbGUgZnJvbSBiZWluZyByZW5kZXJlZCBpbiBhbnkgY2VsbCB0aGF0IGJlbG9uZ3MgdG8gdGhpcyBjb2x1bW4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmlsbEhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBmb3IgdGhpcyBjb2x1bW4gdG8gYmUgaGlkZGVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBoaWRlYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsSGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBibG9jayBtYWtpbmcgY29sdW1uIHZpc2libGUgLyBoaWRkZW4gdmlhIHRoZSBVSSAoQVBJIHdpbGwgc3RpbGwgd29yaykuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2tWaXNpYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBMb2NrIGEgY29sdW1uIHRvIHBvc2l0aW9uIHRvIGAnbGVmdCdgIG9yYCdyaWdodCdgIHRvIGFsd2F5cyBoYXZlIHRoaXMgY29sdW1uIGRpc3BsYXllZCBpbiB0aGF0IHBvc2l0aW9uLiB0cnVlIGlzIHRyZWF0ZWQgYXMgYCdsZWZ0J2AgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2tQb3NpdGlvbjogYm9vbGVhbiB8ICdsZWZ0JyB8ICdyaWdodCcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIHRvIGJlIG1vdmFibGUgdmlhIGRyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBjb2x1bW4gaXMgZWRpdGFibGUsIG90aGVyd2lzZSBgZmFsc2VgLiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRvIGhhdmUgZGlmZmVyZW50IHJvd3MgZWRpdGFibGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVkaXRhYmxlOiBib29sZWFuIHwgRWRpdGFibGVDYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gU2V0cyB0aGUgdmFsdWUgaW50byB5b3VyIGRhdGEgZm9yIHNhdmluZy4gUmV0dXJuIGB0cnVlYCBpZiB0aGUgZGF0YSBjaGFuZ2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVTZXR0ZXI6IHN0cmluZyB8IFZhbHVlU2V0dGVyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gUGFyc2VzIHRoZSB2YWx1ZSBmb3Igc2F2aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVQYXJzZXI6IHN0cmluZyB8IFZhbHVlUGFyc2VyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBjZWxsIGVkaXRvciBjb21wb25lbnQgZm9yIHRoaXMgY29sdW1uJ3MgY2VsbHMuXG4gICAgICogU2VlIFtDZWxsIEVkaXRvcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LWNlbGwtZWRpdG9yLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yOiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBjZWxsRWRpdG9yYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yRnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGBjZWxsRWRpdG9yYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUGFyYW1zOiBhbnk7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBjZWxsIGVkaXRvciB0byBiZSB1c2VkIGZvciBhIGdpdmVuIHJvdyB3aXRoaW4gdGhlIHNhbWUgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclNlbGVjdG9yOiBDZWxsRWRpdG9yU2VsZWN0b3JGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgY2VsbHMgdW5kZXIgdGhpcyBjb2x1bW4gZW50ZXIgZWRpdCBtb2RlIGFmdGVyIHNpbmdsZSBjbGljay4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB1c2UgYHZhbHVlU2V0dGVyYCBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5ld1ZhbHVlSGFuZGxlcjogKChwYXJhbXM6IE5ld1ZhbHVlUGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCwgdG8gaGF2ZSB0aGUgY2VsbCBlZGl0b3IgYXBwZWFyIGluIGEgcG9wdXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUG9wdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGUgcG9zaXRpb24gZm9yIHRoZSBwb3B1cCBjZWxsIGVkaXRvci4gUG9zc2libGUgdmFsdWVzIGFyZVxuICAgICAqICAgLSBgb3ZlcmAgUG9wdXAgd2lsbCBiZSBwb3NpdGlvbmVkIG92ZXIgdGhlIGNlbGxcbiAgICAgKiAgIC0gYHVuZGVyYCBQb3B1cCB3aWxsIGJlIHBvc2l0aW9uZWQgYmVsb3cgdGhlIGNlbGwgbGVhdmluZyB0aGUgY2VsbCB2YWx1ZSB2aXNpYmxlLlxuICAgICAqIFxuICAgICAqIERlZmF1bHQ6IGBvdmVyYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JQb3B1cFBvc2l0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGZvciBhZnRlciB0aGUgdmFsdWUgb2YgYSBjZWxsIGhhcyBjaGFuZ2VkLCBlaXRoZXIgZHVlIHRvIGVkaXRpbmcgb3IgdGhlIGFwcGxpY2F0aW9uIGNhbGxpbmcgYGFwaS5zZXRWYWx1ZSgpYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbFZhbHVlQ2hhbmdlZDogKChldmVudDogTmV3VmFsdWVQYXJhbXMpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiBhIGNlbGwgaXMgY2xpY2tlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbENsaWNrZWQ6ICgoZXZlbnQ6IENlbGxDbGlja2VkRXZlbnQpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiBhIGNlbGwgaXMgZG91YmxlIGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxEb3VibGVDbGlja2VkOiAoKGV2ZW50OiBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIHJpZ2h0IGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDb250ZXh0TWVudTogKChldmVudDogQ2VsbENvbnRleHRNZW51RXZlbnQpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGZ1bmN0aW9uIHRvIHRlbGwgdGhlIGdyaWQgd2hhdCBxdWljayBmaWx0ZXIgdGV4dCB0byB1c2UgZm9yIHRoaXMgY29sdW1uIGlmIHlvdSBkb24ndCB3YW50IHRvIHVzZSB0aGUgZGVmYXVsdCAod2hpY2ggaXMgY2FsbGluZyBgdG9TdHJpbmdgIG9uIHRoZSB2YWx1ZSkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRRdWlja0ZpbHRlclRleHQ6ICgocGFyYW1zOiBHZXRRdWlja0ZpbHRlclRleHRQYXJhbXMpID0+IHN0cmluZykgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIEdldHMgdGhlIHZhbHVlIGZvciBmaWx0ZXJpbmcgcHVycG9zZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJWYWx1ZUdldHRlcjogc3RyaW5nIHwgVmFsdWVHZXR0ZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBXaGV0aGVyIHRvIGRpc3BsYXkgYSBmbG9hdGluZyBmaWx0ZXIgZm9yIHRoaXMgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogICAgICovXG4vKiogVGhlIGN1c3RvbSBoZWFkZXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlci4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBoZWFkZXIgY29tcG9uZW50IGlzIHVzZWQuXG4gICAgICogU2VlIFtIZWFkZXIgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtaGVhZGVyLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnQ6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGhlYWRlckNvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFRoZSBwYXJhbWV0ZXJzIHRvIGJlIHBhc3NlZCB0byB0aGUgYGhlYWRlckNvbXBvbmVudGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICAvKiogU2V0IHRvIGFuIGFycmF5IGNvbnRhaW5pbmcgemVybywgb25lIG9yIG1hbnkgb2YgdGhlIGZvbGxvd2luZyBvcHRpb25zOiBgJ2ZpbHRlck1lbnVUYWInIHwgJ2dlbmVyYWxNZW51VGFiJyB8ICdjb2x1bW5zTWVudVRhYidgLlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBmaWd1cmUgb3V0IHdoaWNoIG1lbnUgdGFicyBhcmUgcHJlc2VudCBhbmQgaW4gd2hpY2ggb3JkZXIgdGhlIHRhYnMgYXJlIHNob3duLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWVudVRhYnM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQYXJhbXMgdXNlZCB0byBjaGFuZ2UgdGhlIGJlaGF2aW91ciBhbmQgYXBwZWFyYW5jZSBvZiB0aGUgQ29sdW1ucyBNZW51IHRhYi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbnNNZW51UGFyYW1zOiBDb2x1bW5zTWVudVBhcmFtcyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiBubyBtZW51IHNob3VsZCBiZSBzaG93biBmb3IgdGhpcyBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCBvciB0aGUgY2FsbGJhY2sgcmV0dXJucyBgdHJ1ZWAsIGEgJ3NlbGVjdCBhbGwnIGNoZWNrYm94IHdpbGwgYmUgcHV0IGludG8gdGhlIGhlYWRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgSGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgaGVhZGVyIGNoZWNrYm94IHNlbGVjdGlvbiB3aWxsIG9ubHkgc2VsZWN0IGZpbHRlcmVkIGl0ZW1zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25GaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIERlZmluZXMgdGhlIGNoYXJ0IGRhdGEgdHlwZSB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciBhIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0RGF0YVR5cGU6ICdjYXRlZ29yeScgfCAnc2VyaWVzJyB8ICd0aW1lJyB8ICdleGNsdWRlZCcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFBpbiBhIGNvbHVtbiB0byBvbmUgc2lkZTogYHJpZ2h0YCBvciBgbGVmdGAuIEEgdmFsdWUgb2YgYHRydWVgIGlzIGNvbnZlcnRlZCB0byBgJ2xlZnQnYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZDogYm9vbGVhbiB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHBpbm5lZGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpbm5lZDogYm9vbGVhbiB8IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gYmxvY2sgdGhlIHVzZXIgcGlubmluZyB0aGUgY29sdW1uLCB0aGUgY29sdW1uIGNhbiBvbmx5IGJlIHBpbm5lZCB2aWEgZGVmaW5pdGlvbnMgb3IgQVBJLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUGlubmVkOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgY2VsbFJlbmRlcmVyU2VsZWN0b3IgaWYgeW91IHdhbnQgYSBkaWZmZXJlbnQgQ2VsbCBSZW5kZXJlciBmb3IgcGlubmVkIHJvd3MuIENoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyQ29tcDsgfSB8IElDZWxsUmVuZGVyZXJGdW5jIHwgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgY2VsbFJlbmRlcmVyU2VsZWN0b3IgaWYgeW91IHdhbnQgYSBkaWZmZXJlbnQgQ2VsbCBSZW5kZXJlciBmb3IgcGlubmVkIHJvd3MuIENoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJQYXJhbXM6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIHZhbHVlRm9ybWF0dGVyIGZvciBwaW5uZWQgcm93cywgYW5kIGNoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93VmFsdWVGb3JtYXR0ZXI6IHN0cmluZyB8IFZhbHVlRm9ybWF0dGVyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gcGl2b3QgYnkgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcGl2b3RgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgaW4gY29sdW1ucyB5b3Ugd2FudCB0byBwaXZvdCBieS5cbiAgICAgKiBJZiBvbmx5IHBpdm90aW5nIGJ5IG9uZSBjb2x1bW4sIHNldCB0aGlzIHRvIGFueSBudW1iZXIgKGUuZy4gYDBgKS5cbiAgICAgKiBJZiBwaXZvdGluZyBieSBtdWx0aXBsZSBjb2x1bW5zLCBzZXQgdGhpcyB0byB3aGVyZSB5b3Ugd2FudCB0aGlzIGNvbHVtbiB0byBiZSBpbiB0aGUgb3JkZXIgb2YgcGl2b3RzIChlLmcuIGAwYCBmb3IgZmlyc3QsIGAxYCBmb3Igc2Vjb25kLCBhbmQgc28gb24pLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RJbmRleDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcGl2b3RJbmRleGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpdm90SW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ29tcGFyYXRvciB0byB1c2Ugd2hlbiBvcmRlcmluZyB0aGUgcGl2b3QgY29sdW1ucywgd2hlbiB0aGlzIGNvbHVtbiBpcyB1c2VkIHRvIHBpdm90IG9uLlxuICAgICAqIFRoZSB2YWx1ZXMgd2lsbCBhbHdheXMgYmUgc3RyaW5ncywgYXMgdGhlIHBpdm90IHNlcnZpY2UgdXNlcyBzdHJpbmdzIGFzIGtleXMgZm9yIHRoZSBwaXZvdCBncm91cHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbXBhcmF0b3I6ICgodmFsdWVBOiBzdHJpbmcsIHZhbHVlQjogc3RyaW5nKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRvIGJlIGFibGUgdG8gcGl2b3QgYnkgdGhpcyBjb2x1bW4gdmlhIHRoZSBHVUkuIFRoaXMgd2lsbCBub3QgYmxvY2sgdGhlIEFQSSBvciBwcm9wZXJ0aWVzIGJlaW5nIHVzZWQgdG8gYWNoaWV2ZSBwaXZvdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBvZiBjc3MgdmFsdWVzIC8gb3IgZnVuY3Rpb24gcmV0dXJuaW5nIGFuIG9iamVjdCBvZiBjc3MgdmFsdWVzIGZvciBhIHBhcnRpY3VsYXIgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxTdHlsZTogQ2VsbFN0eWxlIHwgQ2VsbFN0eWxlRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2xhc3MgdG8gdXNlIGZvciB0aGUgY2VsbC4gQ2FuIGJlIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3M6IHN0cmluZyB8IHN0cmluZ1tdIHwgQ2VsbENsYXNzRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogUnVsZXMgd2hpY2ggY2FuIGJlIGFwcGxpZWQgdG8gaW5jbHVkZSBjZXJ0YWluIENTUyBjbGFzc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzUnVsZXM6IENlbGxDbGFzc1J1bGVzIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIGNlbGwgUmVuZGVyZXIgY29tcG9uZW50IGZvciB0aGlzIGNvbHVtbidzIGNlbGxzLlxuICAgICAqIFNlZSBbQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LWNlbGwtcmVuZGVyZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXI6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGNlbGxSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGBjZWxsUmVuZGVyZXJgIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggY2VsbCByZW5kZXJlciB0byBiZSB1c2VkIGZvciBhIGdpdmVuIHJvdyB3aXRoaW4gdGhlIHNhbWUgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyU2VsZWN0b3I6IENlbGxSZW5kZXJlclNlbGVjdG9yRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSBncmlkIGNhbGN1bGF0ZSB0aGUgaGVpZ2h0IG9mIGEgcm93IGJhc2VkIG9uIGNvbnRlbnRzIG9mIHRoaXMgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvSGVpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIHRleHQgd3JhcCBpbnNpZGUgdGhlIGNlbGwgLSB0eXBpY2FsbHkgdXNlZCB3aXRoIGBhdXRvSGVpZ2h0YC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgd3JhcFRleHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZmxhc2ggYSBjZWxsIHdoZW4gaXQncyByZWZyZXNoZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBwcmV2ZW50IHRoaXMgY29sdW1uIGZyb20gZmxhc2hpbmcgb24gY2hhbmdlcy4gT25seSBhcHBsaWNhYmxlIGlmIGNlbGwgZmxhc2hpbmcgaXMgdHVybmVkIG9uIGZvciB0aGUgZ3JpZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIGBib29sZWFuYCBvciBgRnVuY3Rpb25gLiBTZXQgdG8gYHRydWVgIChvciByZXR1cm4gYHRydWVgIGZyb20gZnVuY3Rpb24pIHRvIGFsbG93IHJvdyBkcmFnZ2luZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZzogYm9vbGVhbiB8IFJvd0RyYWdDYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gYSBzdHJpbmcgdG8gYmUgZGlzcGxheWVkIGJ5IHRoZSBgcm93RHJhZ0NvbXBgIHdoaWxlIGRyYWdnaW5nIGEgcm93LlxuICAgICAqIElmIHRoaXMgY2FsbGJhY2sgaXMgbm90IHNldCwgdGhlIGN1cnJlbnQgY2VsbCB2YWx1ZSB3aWxsIGJlIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnVGV4dDogKChwYXJhbXM6IElSb3dEcmFnSXRlbSwgZHJhZ0l0ZW1Db3VudDogbnVtYmVyKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBgYm9vbGVhbmAgb3IgYEZ1bmN0aW9uYC4gU2V0IHRvIGB0cnVlYCAob3IgcmV0dXJuIGB0cnVlYCBmcm9tIGZ1bmN0aW9uKSB0byBhbGxvdyBkcmFnZ2luZyBmb3IgbmF0aXZlIGRyYWcgYW5kIGRyb3AuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRuZFNvdXJjZTogYm9vbGVhbiB8IERuZFNvdXJjZUNhbGxiYWNrIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiB0byBhbGxvdyBjdXN0b20gZHJhZyBmdW5jdGlvbmFsaXR5IGZvciBuYXRpdmUgZHJhZyBhbmQgZHJvcC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRuZFNvdXJjZU9uUm93RHJhZzogKChwYXJhbXM6IERuZFNvdXJjZU9uUm93RHJhZ1BhcmFtcykgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gcm93IGdyb3VwIGJ5IHRoaXMgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcm93R3JvdXBgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgaW4gY29sdW1ucyB5b3Ugd2FudCB0byBncm91cCBieS5cbiAgICAgKiBJZiBvbmx5IGdyb3VwaW5nIGJ5IG9uZSBjb2x1bW4sIHNldCB0aGlzIHRvIGFueSBudW1iZXIgKGUuZy4gYDBgKS5cbiAgICAgKiBJZiBncm91cGluZyBieSBtdWx0aXBsZSBjb2x1bW5zLCBzZXQgdGhpcyB0byB3aGVyZSB5b3Ugd2FudCB0aGlzIGNvbHVtbiB0byBiZSBpbiB0aGUgZ3JvdXAgKGUuZy4gYDBgIGZvciBmaXJzdCwgYDFgIGZvciBzZWNvbmQsIGFuZCBzbyBvbikuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cEluZGV4OiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGByb3dHcm91cEluZGV4YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUm93R3JvdXBJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRvIGJlIGFibGUgdG8gcm93IGdyb3VwIGJ5IHRoaXMgY29sdW1uIHZpYSB0aGUgR1VJLlxuICAgICAqIFRoaXMgd2lsbCBub3QgYmxvY2sgdGhlIEFQSSBvciBwcm9wZXJ0aWVzIGJlaW5nIHVzZWQgdG8gYWNoaWV2ZSByb3cgZ3JvdXBpbmcuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUm93R3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdG8gYmUgYWJsZSB0byBhZ2dyZWdhdGUgYnkgdGhpcyBjb2x1bW4gdmlhIHRoZSBHVUkuXG4gICAgICogVGhpcyB3aWxsIG5vdCBibG9jayB0aGUgQVBJIG9yIHByb3BlcnRpZXMgYmVpbmcgdXNlZCB0byBhY2hpZXZlIGFnZ3JlZ2F0aW9uLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVZhbHVlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBOYW1lIG9mIGZ1bmN0aW9uIHRvIHVzZSBmb3IgYWdncmVnYXRpb24uIFlvdSBjYW4gYWxzbyBwcm92aWRlIHlvdXIgb3duIGFnZyBmdW5jdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmM6IHN0cmluZyB8IElBZ2dGdW5jIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgYWdnRnVuY2AsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEFnZ0Z1bmM6IHN0cmluZyB8IElBZ2dGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbmFtZSBvZiB0aGUgYWdncmVnYXRpb24gZnVuY3Rpb24gdG8gdXNlIGZvciB0aGlzIGNvbHVtbiB3aGVuIGl0IGlzIGVuYWJsZWQgdmlhIHRoZSBHVUkuXG4gICAgICogTm90ZSB0aGF0IHRoaXMgZG9lcyBub3QgaW1tZWRpYXRlbHkgYXBwbHkgdGhlIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9uIGxpa2UgYGFnZ0Z1bmNgXG4gICAgICogRGVmYXVsdDogYHN1bWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRBZ2dGdW5jOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFnZ3JlZ2F0aW9uIGZ1bmN0aW9ucyBhbGxvd2VkIG9uIHRoaXMgY29sdW1uIGUuZy4gYFsnc3VtJywgJ2F2ZyddYC5cbiAgICAgKiBJZiBtaXNzaW5nLCBhbGwgaW5zdGFsbGVkIGZ1bmN0aW9ucyBhcmUgYWxsb3dlZC5cbiAgICAgKiBUaGlzIHdpbGwgb25seSByZXN0cmljdCB3aGF0IHRoZSBHVUkgYWxsb3dzIGEgdXNlciB0byBzZWxlY3QsIGl0IGRvZXMgbm90IGltcGFjdCB3aGVuIHlvdSBzZXQgYSBmdW5jdGlvbiB2aWEgdGhlIEFQSS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93ZWRBZ2dGdW5jczogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGhhdmUgdGhlIGdyaWQgcGxhY2UgdGhlIHZhbHVlcyBmb3IgdGhlIGdyb3VwIGludG8gdGhlIGNlbGwsIG9yIHB1dCB0aGUgbmFtZSBvZiBhIGdyb3VwZWQgY29sdW1uIHRvIGp1c3Qgc2hvdyB0aGF0IGdyb3VwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd1Jvd0dyb3VwOiBzdHJpbmcgfCBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IHNvcnRpbmcgb24gdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRhYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBzb3J0aW5nIGJ5IGRlZmF1bHQsIHNldCBpdCBoZXJlLiBTZXQgdG8gYGFzY2Agb3IgYGRlc2NgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydDogJ2FzYycgfCAnZGVzYycgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBzb3J0YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydDogJ2FzYycgfCAnZGVzYycgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBzb3J0aW5nIG1vcmUgdGhhbiBvbmUgY29sdW1uIGJ5IGRlZmF1bHQsIHNwZWNpZmllcyBvcmRlciBpbiB3aGljaCB0aGUgc29ydGluZyBzaG91bGQgYmUgYXBwbGllZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRJbmRleDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgc29ydEluZGV4YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IGRlZmluaW5nIHRoZSBvcmRlciBpbiB3aGljaCBzb3J0aW5nIG9jY3VycyAoaWYgc29ydGluZyBpcyBlbmFibGVkKS4gQW4gYXJyYXkgd2l0aCBhbnkgb2YgdGhlIGZvbGxvd2luZyBpbiBhbnkgb3JkZXIgYFsnYXNjJywnZGVzYycsbnVsbF1gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6ICgnYXNjJyB8ICdkZXNjJyB8IG51bGwpW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgZnVuY3Rpb24gZm9yIGN1c3RvbSBzb3J0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcGFyYXRvcjogKCh2YWx1ZUE6IGFueSwgdmFsdWVCOiBhbnksIG5vZGVBOiBSb3dOb2RlLCBub2RlQjogUm93Tm9kZSwgaXNJbnZlcnRlZDogYm9vbGVhbikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0aGUgdW5zb3J0ZWQgaWNvbiB0byBiZSBzaG93biB3aGVuIG5vIHNvcnQgaXMgYXBwbGllZCB0byB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjI0IC0gdXNlIHNvcnRJbmRleCBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRlZEF0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQsIGVhY2ggY2VsbCB3aWxsIHRha2UgdXAgdGhlIHdpZHRoIG9mIG9uZSBjb2x1bW4uIFlvdSBjYW4gY2hhbmdlIHRoaXMgYmVoYXZpb3VyIHRvIGFsbG93IGNlbGxzIHRvIHNwYW4gbXVsdGlwbGUgY29sdW1ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbFNwYW46ICgocGFyYW1zOiBDb2xTcGFuUGFyYW1zKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCBlYWNoIGNlbGwgd2lsbCB0YWtlIHVwIHRoZSBoZWlnaHQgb2Ygb25lIHJvdy4gWW91IGNhbiBjaGFuZ2UgdGhpcyBiZWhhdmlvdXIgdG8gYWxsb3cgY2VsbHMgdG8gc3BhbiBtdWx0aXBsZSByb3dzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3BhbjogKChwYXJhbXM6IFJvd1NwYW5QYXJhbXMpID0+IG51bWJlcikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEluaXRpYWwgd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHdpZHRoYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogTWluaW11bSB3aWR0aCBpbiBwaXhlbHMgZm9yIHRoZSBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWluV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogTWF4aW11bSB3aWR0aCBpbiBwaXhlbHMgZm9yIHRoZSBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4V2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogVXNlZCBpbnN0ZWFkIG9mIGB3aWR0aGAgd2hlbiB0aGUgZ29hbCBpcyB0byBmaWxsIHRoZSByZW1haW5pbmcgZW1wdHkgc3BhY2Ugb2YgdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYGZsZXhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxGbGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgdGhpcyBjb2x1bW4gc2hvdWxkIGJlIHJlc2l6ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlc2l6YWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0aGlzIGNvbHVtbidzIHdpZHRoIHRvIGJlIGZpeGVkIGR1cmluZyAnc2l6ZSB0byBmaXQnIG9wZXJhdGlvbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2l6ZVRvRml0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiB0byBiZSBhdXRvLXJlc2l6YWJsZSBieSBkb3VibGUgY2xpY2tpbmcgaXQncyBlZGdlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXG5cbiAgICAvLyBFbmFibGUgdHlwZSBjb2VyY2lvbiBmb3IgYm9vbGVhbiBJbnB1dHMgdG8gc3VwcG9ydCB1c2UgbGlrZSAnZW5hYmxlQ2hhcnRzJyBpbnN0ZWFkIG9mIGZvcmNpbmcgJ1tlbmFibGVDaGFydHNdPVwidHJ1ZVwiJyBcbiAgICAvLyBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdGVtcGxhdGUtdHlwZWNoZWNrI2lucHV0LXNldHRlci1jb2VyY2lvbiBcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDZWxsRmxhc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGaWx0ZXJzVG9vbFBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9vcGVuQnlEZWZhdWx0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXJyeUNoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsSGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luaXRpYWxSb3dHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3Q6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luaXRpYWxQaXZvdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2hlY2tib3hTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2hlYWRlckNoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oZWFkZXJDaGVja2JveFNlbGVjdGlvbkZpbHRlcmVkT25seTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNZW51OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vdmFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tQb3NpdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbG9ja1Zpc2libGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tQaW5uZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3VuU29ydEljb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2l6ZVRvRml0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSb3dHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUGl2b3Q6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVZhbHVlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lZGl0YWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQYXN0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NOYXZpZ2FibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZG5kU291cmNlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hdXRvSGVpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV93cmFwVGV4dDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc29ydGFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jlc2l6YWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9mbG9hdGluZ0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2VsbEVkaXRvclBvcHVwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZpbGxIYW5kbGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgLy8gQEVOREBcblxufVxuIl19