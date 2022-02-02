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
    __metadata("design:type", String)
], AgGridColumn.prototype, "headerName", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerValueGetter", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "headerTooltip", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerClass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "suppressHeaderKeyboardEvent", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "columnGroupShow", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "toolPanelClass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressColumnsToolPanel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
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
    __metadata("design:type", Array)
], AgGridColumn.prototype, "children", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "groupId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "openByDefault", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
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
    __metadata("design:type", String)
], AgGridColumn.prototype, "colId", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
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
    __metadata("design:type", Function)
], AgGridColumn.prototype, "keyCreator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "equals", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "tooltipField", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
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
    __metadata("design:type", Function)
], AgGridColumn.prototype, "suppressKeyboardEvent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressPaste", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressFillHandle", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "hide", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "initialHide", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "lockVisible", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "lockPosition", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
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
    __metadata("design:type", Function)
], AgGridColumn.prototype, "cellEditorSelector", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "singleClickEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "newValueHandler", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "cellEditorPopup", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "cellEditorPopupPosition", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "onCellValueChanged", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "onCellClicked", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "onCellDoubleClicked", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "onCellContextMenu", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "getQuickFilterText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "filterValueGetter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
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
    __metadata("design:type", Array)
], AgGridColumn.prototype, "menuTabs", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "columnsMenuParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressMenu", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerCheckboxSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "headerCheckboxSelectionFilteredOnly", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
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
    __metadata("design:type", Boolean)
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
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "pivot", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "initialPivot", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "pivotIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "initialPivotIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "pivotComparator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
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
    __metadata("design:type", Function)
], AgGridColumn.prototype, "cellRendererSelector", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "autoHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "wrapText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "enableCellChangeFlash", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressCellFlash", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "rowDrag", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "rowDragText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "dndSource", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "dndSourceOnRowDrag", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "rowGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "initialRowGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "rowGroupIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "initialRowGroupIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "enableRowGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
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
    __metadata("design:type", Array)
], AgGridColumn.prototype, "allowedAggFuncs", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "showRowGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "sortable", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "sort", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "initialSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "sortIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "initialSortIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AgGridColumn.prototype, "sortingOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "comparator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "unSortIcon", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "sortedAt", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "colSpan", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "rowSpan", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "width", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "initialWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "minWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "maxWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "flex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "initialFlex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "resizable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressSizeToFit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressAutoSize", void 0);
AgGridColumn = AgGridColumn_1 = __decorate([
    Component({
        selector: 'ag-grid-column',
        template: ''
    })
], AgGridColumn);
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctZ3JpZC1hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFNN0UsSUFBYSxZQUFZLG9CQUF6QixNQUFhLFlBQVk7SUFHZCxlQUFlO1FBQ2xCLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkQsdUVBQXVFO1lBQ3ZFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxRQUFRO1FBQ1gsSUFBSSxNQUFNLEdBQVcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ2xCLE1BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN2RTtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxlQUFlLENBQUMsWUFBcUM7UUFDekQsT0FBTyxZQUFZO1lBQ2YsdUVBQXVFO2FBQ3RFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQzNDLEdBQUcsQ0FBQyxDQUFDLE1BQW9CLEVBQUUsRUFBRTtZQUMxQixPQUFPLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FB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SUFBUixLQUFLLEVBQUU7O2tEQUE0RDtBQUUzRDtJQUFSLEtBQUssRUFBRTs7Z0RBQTRIO0FBRTNIO0lBQVIsS0FBSyxFQUFFOztnREFBd0M7QUFHdkM7SUFBUixLQUFLLEVBQUU7OzhDQUFxQztBQUVwQztJQUFSLEtBQUssRUFBRTs7NkNBQWlFO0FBRWhFO0lBQVIsS0FBSyxFQUFFOzs2Q0FBaUU7QUFFaEU7SUFBUixLQUFLLEVBQUU7OzJDQUFrQztBQUVqQztJQUFSLEtBQUssRUFBRTs7a0RBQXlDO0FBRXhDO0lBQVIsS0FBSyxFQUFFOzs4Q0FBcUM7QUFFcEM7SUFBUixLQUFLLEVBQUU7OzhDQUFxQztBQUVwQztJQUFSLEtBQUssRUFBRTs7MENBQWlDO0FBRWhDO0lBQVIsS0FBSyxFQUFFOztpREFBd0M7QUFFdkM7SUFBUixLQUFLLEVBQUU7OytDQUF1QztBQUV0QztJQUFSLEtBQUssRUFBRTs7dURBQStDO0FBRTlDO0lBQVIsS0FBSyxFQUFFOztzREFBOEM7QUF4VTdDLFlBQVk7SUFKeEIsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixRQUFRLEVBQUUsRUFBRTtLQUNmLENBQUM7R0FDVyxZQUFZLENBc1h4QjtTQXRYWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2VsbENsYXNzRnVuYywgQ2VsbENsYXNzUnVsZXMsIENlbGxDbGlja2VkRXZlbnQsIENlbGxDb250ZXh0TWVudUV2ZW50LCBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LCBDZWxsRWRpdG9yU2VsZWN0b3JGdW5jLCBDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMsIENlbGxTdHlsZSwgQ2VsbFN0eWxlRnVuYywgQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjaywgQ29sRGVmLCBDb2xHcm91cERlZiwgQ29sU3BhblBhcmFtcywgQ29sdW1uc01lbnVQYXJhbXMsIERuZFNvdXJjZUNhbGxiYWNrLCBEbmRTb3VyY2VPblJvd0RyYWdQYXJhbXMsIEVkaXRhYmxlQ2FsbGJhY2ssIEdldFF1aWNrRmlsdGVyVGV4dFBhcmFtcywgSGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjaywgSGVhZGVyQ2xhc3MsIEhlYWRlclZhbHVlR2V0dGVyRnVuYywgSUFnZ0Z1bmMsIElDZWxsRWRpdG9yQ29tcCwgSUNlbGxSZW5kZXJlckNvbXAsIElDZWxsUmVuZGVyZXJGdW5jLCBJSGVhZGVyR3JvdXBDb21wLCBJUm93RHJhZ0l0ZW0sIElUb29sdGlwQ29tcCwgSVRvb2x0aXBQYXJhbXMsIEtleUNyZWF0b3JQYXJhbXMsIE5ld1ZhbHVlUGFyYW1zLCBSb3dEcmFnQ2FsbGJhY2ssIFJvd05vZGUsIFJvd1NwYW5QYXJhbXMsIFN1cHByZXNzSGVhZGVyS2V5Ym9hcmRFdmVudFBhcmFtcywgU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zLCBTdXBwcmVzc05hdmlnYWJsZUNhbGxiYWNrLCBTdXBwcmVzc1Bhc3RlQ2FsbGJhY2ssIFRvb2xQYW5lbENsYXNzLCBWYWx1ZUZvcm1hdHRlckZ1bmMsIFZhbHVlR2V0dGVyRnVuYywgVmFsdWVQYXJzZXJGdW5jLCBWYWx1ZVNldHRlckZ1bmMgfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcbmltcG9ydCB7IENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBJbnB1dCwgUXVlcnlMaXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhZy1ncmlkLWNvbHVtbicsXG4gICAgdGVtcGxhdGU6ICcnXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZENvbHVtbiB7XG4gICAgQENvbnRlbnRDaGlsZHJlbihBZ0dyaWRDb2x1bW4pIHB1YmxpYyBjaGlsZENvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+O1xuXG4gICAgcHVibGljIGhhc0NoaWxkQ29sdW1ucygpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRDb2x1bW5zICYmIHRoaXMuY2hpbGRDb2x1bW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEwMDk4XG4gICAgICAgICAgICByZXR1cm4gISh0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPT09IDEgJiYgdGhpcy5jaGlsZENvbHVtbnMuZmlyc3QgPT09IHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9Db2xEZWYoKTogQ29sRGVmIHtcbiAgICAgICAgbGV0IGNvbERlZjogQ29sRGVmID0gdGhpcy5jcmVhdGVDb2xEZWZGcm9tR3JpZENvbHVtbih0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5oYXNDaGlsZENvbHVtbnMoKSkge1xuICAgICAgICAgICAgKDxhbnk+Y29sRGVmKVtcImNoaWxkcmVuXCJdID0gdGhpcy5nZXRDaGlsZENvbERlZnModGhpcy5jaGlsZENvbHVtbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDaGlsZENvbERlZnMoY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPikge1xuICAgICAgICByZXR1cm4gY2hpbGRDb2x1bW5zXG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgLmZpbHRlcihjb2x1bW4gPT4gIWNvbHVtbi5oYXNDaGlsZENvbHVtbnMoKSlcbiAgICAgICAgICAgIC5tYXAoKGNvbHVtbjogQWdHcmlkQ29sdW1uKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbi50b0NvbERlZigpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVDb2xEZWZGcm9tR3JpZENvbHVtbihmcm9tOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYge1xuICAgICAgICBsZXQgeyBjaGlsZENvbHVtbnMsIC4uLmNvbERlZiB9ID0gZnJvbTtcbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9XG5cbiAgICAvLyBpbnB1dHMgLSBwcmV0dHkgbXVjaCBtb3N0IG9mIENvbERlZiwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCBhbmQgaW50ZXJuYWwgb25seSBwcm9wZXJ0aWVzXG4gICAgLy8gQFNUQVJUQFxuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlcjogYW55O1xuICAgIC8qKiBUaGUgbmFtZSB0byByZW5kZXIgaW4gdGhlIGNvbHVtbiBoZWFkZXIuIElmIG5vdCBzcGVjaWZpZWQgYW5kIGZpZWxkIGlzIHNwZWNpZmllZCwgdGhlIGZpZWxkIG5hbWUgd2lsbCBiZSB1c2VkIGFzIHRoZSBoZWFkZXIgbmFtZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlck5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gR2V0cyB0aGUgdmFsdWUgZm9yIGRpc3BsYXkgaW4gdGhlIGhlYWRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlclZhbHVlR2V0dGVyOiBzdHJpbmcgfCBIZWFkZXJWYWx1ZUdldHRlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRvb2x0aXAgZm9yIHRoZSBjb2x1bW4gaGVhZGVyICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJUb29sdGlwOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENTUyBjbGFzcyB0byB1c2UgZm9yIHRoZSBoZWFkZXIgY2VsbC4gQ2FuIGJlIGEgc3RyaW5nLCBhcnJheSBvZiBzdHJpbmdzLCBvciBmdW5jdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNsYXNzOiBIZWFkZXJDbGFzcyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3MgdGhlIGdyaWQgdGFraW5nIGFjdGlvbiBmb3IgdGhlIHJlbGV2YW50IGtleWJvYXJkIGV2ZW50IHdoZW4gYSBoZWFkZXIgaXMgZm9jdXNlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzSGVhZGVyS2V5Ym9hcmRFdmVudDogKChwYXJhbXM6IFN1cHByZXNzSGVhZGVyS2V5Ym9hcmRFdmVudFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZXRoZXIgdG8gc2hvdyB0aGUgY29sdW1uIHdoZW4gdGhlIGdyb3VwIGlzIG9wZW4gLyBjbG9zZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cFNob3c6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzIHRvIHVzZSBmb3IgdGhlIHRvb2wgcGFuZWwgY2VsbC4gQ2FuIGJlIGEgc3RyaW5nLCBhcnJheSBvZiBzdHJpbmdzLCBvciBmdW5jdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbENsYXNzOiBUb29sUGFuZWxDbGFzcyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gb3IgZ3JvdXAgdG8gYXBwZWFyIGluIHRoZSBDb2x1bW5zIFRvb2wgUGFuZWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gKGZpbHRlcikgb3IgZ3JvdXAgKGZpbHRlciBncm91cCkgdG8gYXBwZWFyIGluIHRoZSBGaWx0ZXJzIFRvb2wgUGFuZWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmlsdGVyc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudDogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgdG9vbHRpcENvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgLyoqIEEgbGlzdCBjb250YWluaW5nIGEgbWl4IG9mIGNvbHVtbnMgYW5kIGNvbHVtbiBncm91cHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGlsZHJlbjogKENvbERlZiB8IENvbEdyb3VwRGVmKVtdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgdW5pcXVlIElEIHRvIGdpdmUgdGhlIGNvbHVtbi4gVGhpcyBpcyBvcHRpb25hbC4gSWYgbWlzc2luZywgYSB1bmlxdWUgSUQgd2lsbCBiZSBnZW5lcmF0ZWQuIFRoaXMgSUQgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgY29sdW1uIGdyb3VwIGluIHRoZSBjb2x1bW4gQVBJLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHRoaXMgZ3JvdXAgc2hvdWxkIGJlIG9wZW5lZCBieSBkZWZhdWx0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvcGVuQnlEZWZhdWx0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgY29sdW1ucyBpbiB0aGlzIGdyb3VwIGJlc2lkZSBlYWNoIG90aGVyIGluIHRoZSBncmlkLiBNb3ZpbmcgdGhlIGNvbHVtbnMgb3V0c2lkZSBvZiB0aGUgZ3JvdXAgKGFuZCBoZW5jZSBicmVha2luZyB0aGUgZ3JvdXApIGlzIG5vdCBhbGxvd2VkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXJyeUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgY3VzdG9tIGhlYWRlciBncm91cCBjb21wb25lbnQgdG8gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQgaGVhZGVyLiBJZiBub25lIHNwZWNpZmllZCB0aGUgZGVmYXVsdCBBRyBHcmlkIGlzIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudDogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgaGVhZGVyR3JvdXBDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFRoZSBwYXJhbXMgdXNlZCB0byBjb25maWd1cmUgdGhlIGhlYWRlciBncm91cCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudFBhcmFtczogYW55O1xuICAgIC8qKiBUaGUgdW5pcXVlIElEIHRvIGdpdmUgdGhlIGNvbHVtbi4gVGhpcyBpcyBvcHRpb25hbC4gSWYgbWlzc2luZywgdGhlIElEIHdpbGwgZGVmYXVsdCB0byB0aGUgZmllbGQuXG4gICAgICogSWYgYm90aCBmaWVsZCBhbmQgY29sSWQgYXJlIG1pc3NpbmcsIGEgdW5pcXVlIElEIHdpbGwgYmUgZ2VuZXJhdGVkLlxuICAgICAqIFRoaXMgSUQgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgY29sdW1uIGluIHRoZSBBUEkgZm9yIHNvcnRpbmcsIGZpbHRlcmluZyBldGMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZmllbGQgb2YgdGhlIHJvdyB0byBnZXQgdGhlIGNlbGxzIGRhdGEgZnJvbSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmllbGQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MgY29udGFpbmluZyBgQ29sdW1uVHlwZWAga2V5cyB3aGljaCBjYW4gYmUgdXNlZCBhcyBhIHRlbXBsYXRlIGZvciBhIGNvbHVtbi5cbiAgICAgKiBUaGlzIGhlbHBzIHRvIHJlZHVjZSBkdXBsaWNhdGlvbiBvZiBwcm9wZXJ0aWVzIHdoZW4geW91IGhhdmUgYSBsb3Qgb2YgY29tbW9uIGNvbHVtbiBwcm9wZXJ0aWVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHlwZTogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIEdldHMgdGhlIHZhbHVlIGZyb20geW91ciBkYXRhIGZvciBkaXNwbGF5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVHZXR0ZXI6IHN0cmluZyB8IFZhbHVlR2V0dGVyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBmdW5jdGlvbiBvciBleHByZXNzaW9uIHRvIGZvcm1hdCBhIHZhbHVlLCBzaG91bGQgcmV0dXJuIGEgc3RyaW5nLiBOb3QgdXNlZCBmb3IgQ1NWIGV4cG9ydCBvciBjb3B5IHRvIGNsaXBib2FyZCwgb25seSBmb3IgVUkgY2VsbCByZW5kZXJpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUZvcm1hdHRlcjogc3RyaW5nIHwgVmFsdWVGb3JtYXR0ZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlZCBhIHJlZmVyZW5jZSBkYXRhIG1hcCB0byBiZSB1c2VkIHRvIG1hcCBjb2x1bW4gdmFsdWVzIHRvIHRoZWlyIHJlc3BlY3RpdmUgdmFsdWUgZnJvbSB0aGUgbWFwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVmRGF0YTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmc7IH0gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIHRvIHJldHVybiBhIHN0cmluZyBrZXkgZm9yIGEgdmFsdWUuXG4gICAgICogVGhpcyBzdHJpbmcgaXMgdXNlZCBmb3IgZ3JvdXBpbmcsIFNldCBmaWx0ZXJpbmcsIGFuZCBzZWFyY2hpbmcgd2l0aGluIGNlbGwgZWRpdG9yIGRyb3Bkb3ducy5cbiAgICAgKiBXaGVuIGZpbHRlcmluZyBhbmQgc2VhcmNoaW5nIHRoZSBzdHJpbmcgaXMgZXhwb3NlZCB0byB0aGUgdXNlciwgc28gbWFrZSBzdXJlIHRvIHJldHVybiBhIGh1bWFuLXJlYWRhYmxlIHZhbHVlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2V5Q3JlYXRvcjogKChwYXJhbXM6IEtleUNyZWF0b3JQYXJhbXMpID0+IHN0cmluZykgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbSBjb21wYXJhdG9yIGZvciB2YWx1ZXMsIHVzZWQgYnkgcmVuZGVyZXIgdG8ga25vdyBpZiB2YWx1ZXMgaGF2ZSBjaGFuZ2VkLiBDZWxscyB3aG8ncyB2YWx1ZXMgaGF2ZSBub3QgY2hhbmdlZCBkb24ndCBnZXQgcmVmcmVzaGVkLlxuICAgICAqIEJ5IGRlZmF1bHQgdGhlIGdyaWQgdXNlcyBgPT09YCBpcyB1c2VkIHdoaWNoIHNob3VsZCB3b3JrIGZvciBtb3N0IHVzZSBjYXNlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVxdWFsczogKCh2YWx1ZUE6IGFueSwgdmFsdWVCOiBhbnkpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZmllbGQgb2YgdGhlIHRvb2x0aXAgdG8gYXBwbHkgdG8gdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwRmllbGQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdGhhdCBzaG91bGQgcmV0dXJuIHRoZSBzdHJpbmcgdG8gdXNlIGZvciBhIHRvb2x0aXAsIGB0b29sdGlwRmllbGRgIHRha2VzIHByZWNlZGVuY2UgaWYgc2V0LlxuICAgICAqIElmIHVzaW5nIGEgY3VzdG9tIGB0b29sdGlwQ29tcG9uZW50YCB5b3UgbWF5IHJldHVybiBhbnkgY3VzdG9tIHZhbHVlIHRvIGJlIHBhc3NlZCB0byB5b3VyIHRvb2x0aXAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFZhbHVlR2V0dGVyOiAoKHBhcmFtczogSVRvb2x0aXBQYXJhbXMpID0+IHN0cmluZyB8IGFueSkgfCB1bmRlZmluZWQ7XG4gICAgLyoqIGBib29sZWFuYCBvciBgRnVuY3Rpb25gLiBTZXQgdG8gYHRydWVgIChvciByZXR1cm4gYHRydWVgIGZyb20gZnVuY3Rpb24pIHRvIHJlbmRlciBhIHNlbGVjdGlvbiBjaGVja2JveCBpbiB0aGUgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IENoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIHRvIHVzZSBpbnNpZGUgdGhlIGNvbHVtbiBpbnN0ZWFkIG9mIHRoZSBncmlkJ3MgZGVmYXVsdCBpY29ucy4gTGVhdmUgdW5kZWZpbmVkIHRvIHVzZSBkZWZhdWx0cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGljb25zOiB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIHwgc3RyaW5nOyB9IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHRoaXMgY29sdW1uIGlzIG5vdCBuYXZpZ2FibGUgKGkuZS4gY2Fubm90IGJlIHRhYmJlZCBpbnRvKSwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAgICogQ2FuIGFsc28gYmUgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBoYXZlIGRpZmZlcmVudCByb3dzIG5hdmlnYWJsZS5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05hdmlnYWJsZTogYm9vbGVhbiB8IFN1cHByZXNzTmF2aWdhYmxlQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB0aGUgdXNlciB0byBzdXBwcmVzcyBjZXJ0YWluIGtleWJvYXJkIGV2ZW50cyBpbiB0aGUgZ3JpZCBjZWxsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6ICgocGFyYW1zOiBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQYXN0aW5nIGlzIG9uIGJ5IGRlZmF1bHQgYXMgbG9uZyBhcyBjZWxscyBhcmUgZWRpdGFibGUgKG5vbi1lZGl0YWJsZSBjZWxscyBjYW5ub3QgYmUgbW9kaWZpZWQsIGV2ZW4gd2l0aCBhIHBhc3RlIG9wZXJhdGlvbikuXG4gICAgICogU2V0IHRvIGB0cnVlYCB0dXJuIHBhc3RlIG9wZXJhdGlvbnMgb2ZmLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXN0ZTogYm9vbGVhbiB8IFN1cHByZXNzUGFzdGVDYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gcHJldmVudCB0aGUgZmlsbEhhbmRsZSBmcm9tIGJlaW5nIHJlbmRlcmVkIGluIGFueSBjZWxsIHRoYXQgYmVsb25ncyB0byB0aGlzIGNvbHVtbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWxsSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGZvciB0aGlzIGNvbHVtbiB0byBiZSBoaWRkZW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhpZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYGhpZGVgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGJsb2NrIG1ha2luZyBjb2x1bW4gdmlzaWJsZSAvIGhpZGRlbiB2aWEgdGhlIFVJIChBUEkgd2lsbCBzdGlsbCB3b3JrKS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Zpc2libGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIGhhdmUgdGhpcyBjb2x1bW4gZGlzcGxheWVkIGZpcnN0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUG9zaXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIHRvIGJlIG1vdmFibGUgdmlhIGRyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBjb2x1bW4gaXMgZWRpdGFibGUsIG90aGVyd2lzZSBgZmFsc2VgLiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRvIGhhdmUgZGlmZmVyZW50IHJvd3MgZWRpdGFibGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVkaXRhYmxlOiBib29sZWFuIHwgRWRpdGFibGVDYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gU2V0cyB0aGUgdmFsdWUgaW50byB5b3VyIGRhdGEgZm9yIHNhdmluZy4gUmV0dXJuIGB0cnVlYCBpZiB0aGUgZGF0YSBjaGFuZ2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVTZXR0ZXI6IHN0cmluZyB8IFZhbHVlU2V0dGVyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gUGFyc2VzIHRoZSB2YWx1ZSBmb3Igc2F2aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVQYXJzZXI6IHN0cmluZyB8IFZhbHVlUGFyc2VyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBgY2VsbEVkaXRvcmAgdG8gdXNlIGZvciB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3I6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGNlbGxFZGl0b3JgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JGcmFtZXdvcms6IGFueTtcbiAgICAvKiogUGFyYW1zIHRvIGJlIHBhc3NlZCB0byB0aGUgY2VsbCBlZGl0b3IgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBhcmFtczogYW55O1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggY2VsbCBlZGl0b3IgdG8gYmUgdXNlZCBmb3IgYSBnaXZlbiByb3cgd2l0aGluIHRoZSBzYW1lIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JTZWxlY3RvcjogQ2VsbEVkaXRvclNlbGVjdG9yRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIHVuZGVyIHRoaXMgY29sdW1uIGVudGVyIGVkaXQgbW9kZSBhZnRlciBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdXNlIGB2YWx1ZVNldHRlcmAgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuZXdWYWx1ZUhhbmRsZXI6ICgocGFyYW1zOiBOZXdWYWx1ZVBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAsIHRvIGhhdmUgdGhlIGNlbGwgZWRpdG9yIGFwcGVhciBpbiBhIHBvcHVwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBvcHVwOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhlIHBvc2l0aW9uIGZvciB0aGUgcG9wdXAgY2VsbCBlZGl0b3IuIFBvc3NpYmxlIHZhbHVlcyBhcmVcbiAgICAgKiAgIC0gYG92ZXJgIFBvcHVwIHdpbGwgYmUgcG9zaXRpb25lZCBvdmVyIHRoZSBjZWxsXG4gICAgICogICAtIGB1bmRlcmAgUG9wdXAgd2lsbCBiZSBwb3NpdGlvbmVkIGJlbG93IHRoZSBjZWxsIGxlYXZpbmcgdGhlIGNlbGwgdmFsdWUgdmlzaWJsZS5cbiAgICAgKiBcbiAgICAgKiBEZWZhdWx0OiBgb3ZlcmAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUG9wdXBQb3NpdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBmb3IgYWZ0ZXIgdGhlIHZhbHVlIG9mIGEgY2VsbCBoYXMgY2hhbmdlZCwgZWl0aGVyIGR1ZSB0byBlZGl0aW5nIG9yIHRoZSBhcHBsaWNhdGlvbiBjYWxsaW5nIGBhcGkuc2V0VmFsdWUoKWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxWYWx1ZUNoYW5nZWQ6ICgoZXZlbnQ6IE5ld1ZhbHVlUGFyYW1zKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDbGlja2VkOiAoKGV2ZW50OiBDZWxsQ2xpY2tlZEV2ZW50KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIGRvdWJsZSBjbGlja2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsRG91YmxlQ2xpY2tlZDogKChldmVudDogQ2VsbERvdWJsZUNsaWNrZWRFdmVudCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIGEgY2VsbCBpcyByaWdodCBjbGlja2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsQ29udGV4dE1lbnU6ICgoZXZlbnQ6IENlbGxDb250ZXh0TWVudUV2ZW50KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBmdW5jdGlvbiB0byB0ZWxsIHRoZSBncmlkIHdoYXQgcXVpY2sgZmlsdGVyIHRleHQgdG8gdXNlIGZvciB0aGlzIGNvbHVtbiBpZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgKHdoaWNoIGlzIGNhbGxpbmcgYHRvU3RyaW5nYCBvbiB0aGUgdmFsdWUpLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0UXVpY2tGaWx0ZXJUZXh0OiAoKHBhcmFtczogR2V0UXVpY2tGaWx0ZXJUZXh0UGFyYW1zKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBHZXRzIHRoZSB2YWx1ZSBmb3IgZmlsdGVyaW5nIHB1cnBvc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyVmFsdWVHZXR0ZXI6IHN0cmluZyB8IFZhbHVlR2V0dGVyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogV2hldGhlciB0byBkaXNwbGF5IGEgZmxvYXRpbmcgZmlsdGVyIGZvciB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBjdXN0b20gaGVhZGVyIGNvbXBvbmVudCB0byBiZSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGNvbXBvbmVudCBoZWFkZXIuIElmIG5vbmUgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IEFHIEdyaWQgaGVhZGVyIGNvbXBvbmVudCBpcyB1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50OiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBoZWFkZXJDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIC8qKiBUaGUgcGFyYW1ldGVycyB0byBiZSBwYXNzZWQgdG8gdGhlIGhlYWRlciBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICAvKiogU2V0IHRvIGFuIGFycmF5IGNvbnRhaW5pbmcgemVybywgb25lIG9yIG1hbnkgb2YgdGhlIGZvbGxvd2luZyBvcHRpb25zOiBgJ2ZpbHRlck1lbnVUYWInIHwgJ2dlbmVyYWxNZW51VGFiJyB8ICdjb2x1bW5zTWVudVRhYidgLlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBmaWd1cmUgb3V0IHdoaWNoIG1lbnUgdGFicyBhcmUgcHJlc2VudCBhbmQgaW4gd2hpY2ggb3JkZXIgdGhlIHRhYnMgYXJlIHNob3duLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWVudVRhYnM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQYXJhbXMgdXNlZCB0byBjaGFuZ2UgdGhlIGJlaGF2aW91ciBhbmQgYXBwZWFyYW5jZSBvZiB0aGUgQ29sdW1ucyBNZW51IHRhYi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbnNNZW51UGFyYW1zOiBDb2x1bW5zTWVudVBhcmFtcyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiBubyBtZW51IHNob3VsZCBiZSBzaG93biBmb3IgdGhpcyBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCBvciB0aGUgY2FsbGJhY2sgcmV0dXJucyBgdHJ1ZWAsIGEgJ3NlbGVjdCBhbGwnIGNoZWNrYm94IHdpbGwgYmUgcHV0IGludG8gdGhlIGhlYWRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgSGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgaGVhZGVyIGNoZWNrYm94IHNlbGVjdGlvbiB3aWxsIG9ubHkgc2VsZWN0IGZpbHRlcmVkIGl0ZW1zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25GaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIERlZmluZXMgdGhlIGNoYXJ0IGRhdGEgdHlwZSB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciBhIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0RGF0YVR5cGU6ICdjYXRlZ29yeScgfCAnc2VyaWVzJyB8ICd0aW1lJyB8ICdleGNsdWRlZCcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFBpbiBhIGNvbHVtbiB0byBvbmUgc2lkZTogYHJpZ2h0YCBvciBgbGVmdGAuIEEgdmFsdWUgb2YgYHRydWVgIGlzIGNvbnZlcnRlZCB0byBgJ2xlZnQnYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZDogYm9vbGVhbiB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHBpbm5lZGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpbm5lZDogYm9vbGVhbiB8IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gYmxvY2sgdGhlIHVzZXIgcGlubmluZyB0aGUgY29sdW1uLCB0aGUgY29sdW1uIGNhbiBvbmx5IGJlIHBpbm5lZCB2aWEgZGVmaW5pdGlvbnMgb3IgQVBJLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUGlubmVkOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgY2VsbFJlbmRlcmVyU2VsZWN0b3IgaWYgeW91IHdhbnQgYSBkaWZmZXJlbnQgQ2VsbCBSZW5kZXJlciBmb3IgcGlubmVkIHJvd3MuIENoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyQ29tcDsgfSB8IElDZWxsUmVuZGVyZXJGdW5jIHwgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgY2VsbFJlbmRlcmVyU2VsZWN0b3IgaWYgeW91IHdhbnQgYSBkaWZmZXJlbnQgQ2VsbCBSZW5kZXJlciBmb3IgcGlubmVkIHJvd3MuIENoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJQYXJhbXM6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIHZhbHVlRm9ybWF0dGVyIGZvciBwaW5uZWQgcm93cywgYW5kIGNoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93VmFsdWVGb3JtYXR0ZXI6IHN0cmluZyB8IFZhbHVlRm9ybWF0dGVyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gcGl2b3QgYnkgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcGl2b3RgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgaW4gY29sdW1ucyB5b3Ugd2FudCB0byBwaXZvdCBieS5cbiAgICAgKiBJZiBvbmx5IHBpdm90aW5nIGJ5IG9uZSBjb2x1bW4sIHNldCB0aGlzIHRvIGFueSBudW1iZXIgKGUuZy4gYDBgKS5cbiAgICAgKiBJZiBwaXZvdGluZyBieSBtdWx0aXBsZSBjb2x1bW5zLCBzZXQgdGhpcyB0byB3aGVyZSB5b3Ugd2FudCB0aGlzIGNvbHVtbiB0byBiZSBpbiB0aGUgb3JkZXIgb2YgcGl2b3RzIChlLmcuIGAwYCBmb3IgZmlyc3QsIGAxYCBmb3Igc2Vjb25kLCBhbmQgc28gb24pLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RJbmRleDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcGl2b3RJbmRleGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpdm90SW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ29tcGFyYXRvciB0byB1c2Ugd2hlbiBvcmRlcmluZyB0aGUgcGl2b3QgY29sdW1ucywgd2hlbiB0aGlzIGNvbHVtbiBpcyB1c2VkIHRvIHBpdm90IG9uLlxuICAgICAqIFRoZSB2YWx1ZXMgd2lsbCBhbHdheXMgYmUgc3RyaW5ncywgYXMgdGhlIHBpdm90IHNlcnZpY2UgdXNlcyBzdHJpbmdzIGFzIGtleXMgZm9yIHRoZSBwaXZvdCBncm91cHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbXBhcmF0b3I6ICgodmFsdWVBOiBzdHJpbmcsIHZhbHVlQjogc3RyaW5nKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRvIGJlIGFibGUgdG8gcGl2b3QgYnkgdGhpcyBjb2x1bW4gdmlhIHRoZSBHVUkuIFRoaXMgd2lsbCBub3QgYmxvY2sgdGhlIEFQSSBvciBwcm9wZXJ0aWVzIGJlaW5nIHVzZWQgdG8gYWNoaWV2ZSBwaXZvdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBvZiBjc3MgdmFsdWVzIC8gb3IgZnVuY3Rpb24gcmV0dXJuaW5nIGFuIG9iamVjdCBvZiBjc3MgdmFsdWVzIGZvciBhIHBhcnRpY3VsYXIgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxTdHlsZTogQ2VsbFN0eWxlIHwgQ2VsbFN0eWxlRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2xhc3MgdG8gdXNlIGZvciB0aGUgY2VsbC4gQ2FuIGJlIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3M6IHN0cmluZyB8IHN0cmluZ1tdIHwgQ2VsbENsYXNzRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogUnVsZXMgd2hpY2ggY2FuIGJlIGFwcGxpZWQgdG8gaW5jbHVkZSBjZXJ0YWluIENTUyBjbGFzc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzUnVsZXM6IENlbGxDbGFzc1J1bGVzIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGBjZWxsUmVuZGVyZXJgIHRvIHVzZSBmb3IgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXI6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGNlbGxSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGNlbGwgcmVuZGVyZXIgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyUGFyYW1zOiBhbnk7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBjZWxsIHJlbmRlcmVyIHRvIGJlIHVzZWQgZm9yIGEgZ2l2ZW4gcm93IHdpdGhpbiB0aGUgc2FtZSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJTZWxlY3RvcjogQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGdyaWQgY2FsY3VsYXRlIHRoZSBoZWlnaHQgb2YgYSByb3cgYmFzZWQgb24gY29udGVudHMgb2YgdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGF1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgdGV4dCB3cmFwIGluc2lkZSB0aGUgY2VsbCAtIHR5cGljYWxseSB1c2VkIHdpdGggYGF1dG9IZWlnaHRgLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3cmFwVGV4dDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBmbGFzaCBhIGNlbGwgd2hlbiBpdCdzIHJlZnJlc2hlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHByZXZlbnQgdGhpcyBjb2x1bW4gZnJvbSBmbGFzaGluZyBvbiBjaGFuZ2VzLiBPbmx5IGFwcGxpY2FibGUgaWYgY2VsbCBmbGFzaGluZyBpcyB0dXJuZWQgb24gZm9yIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGbGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogYGJvb2xlYW5gIG9yIGBGdW5jdGlvbmAuIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gYWxsb3cgcm93IGRyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnOiBib29sZWFuIHwgUm93RHJhZ0NhbGxiYWNrIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIHJldHVybiBhIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGByb3dEcmFnQ29tcGAgd2hpbGUgZHJhZ2dpbmcgYSByb3cuXG4gICAgICogSWYgdGhpcyBjYWxsYmFjayBpcyBub3Qgc2V0LCB0aGUgY3VycmVudCBjZWxsIHZhbHVlIHdpbGwgYmUgdXNlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdUZXh0OiAoKHBhcmFtczogSVJvd0RyYWdJdGVtLCBkcmFnSXRlbUNvdW50OiBudW1iZXIpID0+IHN0cmluZykgfCB1bmRlZmluZWQ7XG4gICAgLyoqIGBib29sZWFuYCBvciBgRnVuY3Rpb25gLiBTZXQgdG8gYHRydWVgIChvciByZXR1cm4gYHRydWVgIGZyb20gZnVuY3Rpb24pIHRvIGFsbG93IGRyYWdnaW5nIGZvciBuYXRpdmUgZHJhZyBhbmQgZHJvcC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG5kU291cmNlOiBib29sZWFuIHwgRG5kU291cmNlQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIHRvIGFsbG93IGN1c3RvbSBkcmFnIGZ1bmN0aW9uYWxpdHkgZm9yIG5hdGl2ZSBkcmFnIGFuZCBkcm9wLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG5kU291cmNlT25Sb3dEcmFnOiAoKHBhcmFtczogRG5kU291cmNlT25Sb3dEcmFnUGFyYW1zKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byByb3cgZ3JvdXAgYnkgdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGByb3dHcm91cGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFJvd0dyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyBpbiBjb2x1bW5zIHlvdSB3YW50IHRvIGdyb3VwIGJ5LlxuICAgICAqIElmIG9ubHkgZ3JvdXBpbmcgYnkgb25lIGNvbHVtbiwgc2V0IHRoaXMgdG8gYW55IG51bWJlciAoZS5nLiBgMGApLlxuICAgICAqIElmIGdyb3VwaW5nIGJ5IG11bHRpcGxlIGNvbHVtbnMsIHNldCB0aGlzIHRvIHdoZXJlIHlvdSB3YW50IHRoaXMgY29sdW1uIHRvIGJlIGluIHRoZSBncm91cCAoZS5nLiBgMGAgZm9yIGZpcnN0LCBgMWAgZm9yIHNlY29uZCwgYW5kIHNvIG9uKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwSW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHJvd0dyb3VwSW5kZXhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdG8gYmUgYWJsZSB0byByb3cgZ3JvdXAgYnkgdGhpcyBjb2x1bW4gdmlhIHRoZSBHVUkuXG4gICAgICogVGhpcyB3aWxsIG5vdCBibG9jayB0aGUgQVBJIG9yIHByb3BlcnRpZXMgYmVpbmcgdXNlZCB0byBhY2hpZXZlIHJvdyBncm91cGluZy5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIGFnZ3JlZ2F0ZSBieSB0aGlzIGNvbHVtbiB2aWEgdGhlIEdVSS5cbiAgICAgKiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgYWdncmVnYXRpb24uXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlVmFsdWU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIE5hbWUgb2YgZnVuY3Rpb24gdG8gdXNlIGZvciBhZ2dyZWdhdGlvbi4gWW91IGNhbiBhbHNvIHByb3ZpZGUgeW91ciBvd24gYWdnIGZ1bmN0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuYzogc3RyaW5nIHwgSUFnZ0Z1bmMgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBhZ2dGdW5jYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsQWdnRnVuYzogc3RyaW5nIHwgSUFnZ0Z1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFnZ3JlZ2F0aW9uIGZ1bmN0aW9ucyBhbGxvd2VkIG9uIHRoaXMgY29sdW1uIGUuZy4gYFsnc3VtJywgJ2F2ZyddYC5cbiAgICAgKiBJZiBtaXNzaW5nLCBhbGwgaW5zdGFsbGVkIGZ1bmN0aW9ucyBhcmUgYWxsb3dlZC5cbiAgICAgKiBUaGlzIHdpbGwgb25seSByZXN0cmljdCB3aGF0IHRoZSBHVUkgYWxsb3dzIGEgdXNlciB0byBzZWxlY3QsIGl0IGRvZXMgbm90IGltcGFjdCB3aGVuIHlvdSBzZXQgYSBmdW5jdGlvbiB2aWEgdGhlIEFQSS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93ZWRBZ2dGdW5jczogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGhhdmUgdGhlIGdyaWQgcGxhY2UgdGhlIHZhbHVlcyBmb3IgdGhlIGdyb3VwIGludG8gdGhlIGNlbGwsIG9yIHB1dCB0aGUgbmFtZSBvZiBhIGdyb3VwZWQgY29sdW1uIHRvIGp1c3Qgc2hvdyB0aGF0IGdyb3VwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd1Jvd0dyb3VwOiBzdHJpbmcgfCBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IHNvcnRpbmcgb24gdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRhYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBzb3J0aW5nIGJ5IGRlZmF1bHQsIHNldCBpdCBoZXJlLiBTZXQgdG8gYGFzY2Agb3IgYGRlc2NgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydDogJ2FzYycgfCAnZGVzYycgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBzb3J0YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydDogJ2FzYycgfCAnZGVzYycgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBzb3J0aW5nIG1vcmUgdGhhbiBvbmUgY29sdW1uIGJ5IGRlZmF1bHQsIHNwZWNpZmllcyBvcmRlciBpbiB3aGljaCB0aGUgc29ydGluZyBzaG91bGQgYmUgYXBwbGllZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRJbmRleDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgc29ydEluZGV4YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IGRlZmluaW5nIHRoZSBvcmRlciBpbiB3aGljaCBzb3J0aW5nIG9jY3VycyAoaWYgc29ydGluZyBpcyBlbmFibGVkKS4gQW4gYXJyYXkgd2l0aCBhbnkgb2YgdGhlIGZvbGxvd2luZyBpbiBhbnkgb3JkZXIgYFsnYXNjJywnZGVzYycsbnVsbF1gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6ICgnYXNjJyB8ICdkZXNjJyB8IG51bGwpW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgZnVuY3Rpb24gZm9yIGN1c3RvbSBzb3J0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcGFyYXRvcjogKCh2YWx1ZUE6IGFueSwgdmFsdWVCOiBhbnksIG5vZGVBOiBSb3dOb2RlLCBub2RlQjogUm93Tm9kZSwgaXNJbnZlcnRlZDogYm9vbGVhbikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0aGUgdW5zb3J0ZWQgaWNvbiB0byBiZSBzaG93biB3aGVuIG5vIHNvcnQgaXMgYXBwbGllZCB0byB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjI0IC0gdXNlIHNvcnRJbmRleCBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRlZEF0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQsIGVhY2ggY2VsbCB3aWxsIHRha2UgdXAgdGhlIHdpZHRoIG9mIG9uZSBjb2x1bW4uIFlvdSBjYW4gY2hhbmdlIHRoaXMgYmVoYXZpb3VyIHRvIGFsbG93IGNlbGxzIHRvIHNwYW4gbXVsdGlwbGUgY29sdW1ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbFNwYW46ICgocGFyYW1zOiBDb2xTcGFuUGFyYW1zKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCBlYWNoIGNlbGwgd2lsbCB0YWtlIHVwIHRoZSBoZWlnaHQgb2Ygb25lIHJvdy4gWW91IGNhbiBjaGFuZ2UgdGhpcyBiZWhhdmlvdXIgdG8gYWxsb3cgY2VsbHMgdG8gc3BhbiBtdWx0aXBsZSByb3dzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3BhbjogKChwYXJhbXM6IFJvd1NwYW5QYXJhbXMpID0+IG51bWJlcikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEluaXRpYWwgd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHdpZHRoYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogTWluaW11bSB3aWR0aCBpbiBwaXhlbHMgZm9yIHRoZSBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWluV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogTWF4aW11bSB3aWR0aCBpbiBwaXhlbHMgZm9yIHRoZSBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4V2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogVXNlZCBpbnN0ZWFkIG9mIGB3aWR0aGAgd2hlbiB0aGUgZ29hbCBpcyB0byBmaWxsIHRoZSByZW1haW5pbmcgZW1wdHkgc3BhY2Ugb2YgdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYGZsZXhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxGbGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgdGhpcyBjb2x1bW4gc2hvdWxkIGJlIHJlc2l6ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlc2l6YWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0aGlzIGNvbHVtbidzIHdpZHRoIHRvIGJlIGZpeGVkIGR1cmluZyAnc2l6ZSB0byBmaXQnIG9wZXJhdGlvbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2l6ZVRvRml0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiB0byBiZSBhdXRvLXJlc2l6YWJsZSBieSBkb3VibGUgY2xpY2tpbmcgaXQncyBlZGdlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXG5cbiAgICAvLyBFbmFibGUgdHlwZSBjb2VyY2lvbiBmb3IgYm9vbGVhbiBJbnB1dHMgdG8gc3VwcG9ydCB1c2UgbGlrZSAnZW5hYmxlQ2hhcnRzJyBpbnN0ZWFkIG9mIGZvcmNpbmcgJ1tlbmFibGVDaGFydHNdPVwidHJ1ZVwiJyBcbiAgICAvLyBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdGVtcGxhdGUtdHlwZWNoZWNrI2lucHV0LXNldHRlci1jb2VyY2lvbiBcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDZWxsRmxhc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGaWx0ZXJzVG9vbFBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9vcGVuQnlEZWZhdWx0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXJyeUNoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsSGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luaXRpYWxSb3dHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3Q6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luaXRpYWxQaXZvdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2hlY2tib3hTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2hlYWRlckNoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oZWFkZXJDaGVja2JveFNlbGVjdGlvbkZpbHRlcmVkT25seTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNZW51OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vdmFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tQb3NpdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbG9ja1Zpc2libGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tQaW5uZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3VuU29ydEljb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2l6ZVRvRml0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSb3dHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUGl2b3Q6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVZhbHVlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lZGl0YWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQYXN0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NOYXZpZ2FibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZG5kU291cmNlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hdXRvSGVpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV93cmFwVGV4dDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc29ydGFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jlc2l6YWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9mbG9hdGluZ0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2VsbEVkaXRvclBvcHVwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZpbGxIYW5kbGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgLy8gQEVOREBcblxufVxuIl19