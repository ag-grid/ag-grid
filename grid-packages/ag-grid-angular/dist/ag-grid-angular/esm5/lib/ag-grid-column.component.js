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
    return AgGridColumn;
}());
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctZ3JpZC1hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU03RTtJQUFBO0lBOFhBLENBQUM7cUJBOVhZLFlBQVk7SUFHZCxzQ0FBZSxHQUF0QjtRQUNJLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkQsdUVBQXVFO1lBQ3ZFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSwrQkFBUSxHQUFmO1FBQ0ksSUFBSSxNQUFNLEdBQVcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ2xCLE1BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN2RTtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxzQ0FBZSxHQUF2QixVQUF3QixZQUFxQztRQUN6RCxPQUFPLFlBQVk7WUFDZix1RUFBdUU7YUFDdEUsTUFBTSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQXpCLENBQXlCLENBQUM7YUFDM0MsR0FBRyxDQUFDLFVBQUMsTUFBb0I7WUFDdEIsT0FBTyxN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QztRQUFSLEtBQUssRUFBRTs7c0RBQTREO0lBRTNEO1FBQVIsS0FBSyxFQUFFOztvREFBNEg7SUFFM0g7UUFBUixLQUFLLEVBQUU7O29EQUF3QztJQUd2QztRQUFSLEtBQUssRUFBRTs7a0RBQXFDO0lBRXBDO1FBQVIsS0FBSyxFQUFFOztpREFBaUU7SUFFaEU7UUFBUixLQUFLLEVBQUU7O2lEQUFpRTtJQUVoRTtRQUFSLEtBQUssRUFBRTs7K0NBQWtDO0lBRWpDO1FBQVIsS0FBSyxFQUFFOztzREFBeUM7SUFFeEM7UUFBUixLQUFLLEVBQUU7O2tEQUFxQztJQUVwQztRQUFSLEtBQUssRUFBRTs7a0RBQXFDO0lBRXBDO1FBQVIsS0FBSyxFQUFFOzs4Q0FBaUM7SUFFaEM7UUFBUixLQUFLLEVBQUU7O3FEQUF3QztJQUV2QztRQUFSLEtBQUssRUFBRTs7bURBQXVDO0lBRXRDO1FBQVIsS0FBSyxFQUFFOzsyREFBK0M7SUFFOUM7UUFBUixLQUFLLEVBQUU7OzBEQUE4QztJQWhWN0MsWUFBWTtRQUp4QixTQUFTLENBQUM7WUFDUCxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLFFBQVEsRUFBRSxFQUFFO1NBQ2YsQ0FBQztPQUNXLFlBQVksQ0E4WHhCO0lBQUQsbUJBQUM7Q0FBQSxBQTlYRCxJQThYQztTQTlYWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2VsbENsYXNzRnVuYywgQ2VsbENsYXNzUnVsZXMsIENlbGxDbGlja2VkRXZlbnQsIENlbGxDb250ZXh0TWVudUV2ZW50LCBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LCBDZWxsRWRpdG9yU2VsZWN0b3JGdW5jLCBDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMsIENlbGxTdHlsZSwgQ2VsbFN0eWxlRnVuYywgQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjaywgQ29sRGVmLCBDb2xHcm91cERlZiwgQ29sU3BhblBhcmFtcywgQ29sdW1uc01lbnVQYXJhbXMsIERuZFNvdXJjZUNhbGxiYWNrLCBEbmRTb3VyY2VPblJvd0RyYWdQYXJhbXMsIEVkaXRhYmxlQ2FsbGJhY2ssIEdldFF1aWNrRmlsdGVyVGV4dFBhcmFtcywgSGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjaywgSGVhZGVyQ2xhc3MsIEhlYWRlclZhbHVlR2V0dGVyRnVuYywgSUFnZ0Z1bmMsIElDZWxsRWRpdG9yQ29tcCwgSUNlbGxSZW5kZXJlckNvbXAsIElDZWxsUmVuZGVyZXJGdW5jLCBJSGVhZGVyR3JvdXBDb21wLCBJUm93RHJhZ0l0ZW0sIElUb29sdGlwQ29tcCwgSVRvb2x0aXBQYXJhbXMsIEtleUNyZWF0b3JQYXJhbXMsIE5ld1ZhbHVlUGFyYW1zLCBSb3dEcmFnQ2FsbGJhY2ssIFJvd05vZGUsIFJvd1NwYW5QYXJhbXMsIFN1cHByZXNzSGVhZGVyS2V5Ym9hcmRFdmVudFBhcmFtcywgU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zLCBTdXBwcmVzc05hdmlnYWJsZUNhbGxiYWNrLCBTdXBwcmVzc1Bhc3RlQ2FsbGJhY2ssIFRvb2xQYW5lbENsYXNzLCBWYWx1ZUZvcm1hdHRlckZ1bmMsIFZhbHVlR2V0dGVyRnVuYywgVmFsdWVQYXJzZXJGdW5jLCBWYWx1ZVNldHRlckZ1bmMgfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcbmltcG9ydCB7IENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBJbnB1dCwgUXVlcnlMaXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhZy1ncmlkLWNvbHVtbicsXG4gICAgdGVtcGxhdGU6ICcnXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZENvbHVtbiB7XG4gICAgQENvbnRlbnRDaGlsZHJlbihBZ0dyaWRDb2x1bW4pIHB1YmxpYyBjaGlsZENvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+O1xuXG4gICAgcHVibGljIGhhc0NoaWxkQ29sdW1ucygpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuY2hpbGRDb2x1bW5zICYmIHRoaXMuY2hpbGRDb2x1bW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEwMDk4XG4gICAgICAgICAgICByZXR1cm4gISh0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPT09IDEgJiYgdGhpcy5jaGlsZENvbHVtbnMuZmlyc3QgPT09IHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9Db2xEZWYoKTogQ29sRGVmIHtcbiAgICAgICAgbGV0IGNvbERlZjogQ29sRGVmID0gdGhpcy5jcmVhdGVDb2xEZWZGcm9tR3JpZENvbHVtbih0aGlzKTtcblxuICAgICAgICBpZiAodGhpcy5oYXNDaGlsZENvbHVtbnMoKSkge1xuICAgICAgICAgICAgKDxhbnk+Y29sRGVmKVtcImNoaWxkcmVuXCJdID0gdGhpcy5nZXRDaGlsZENvbERlZnModGhpcy5jaGlsZENvbHVtbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDaGlsZENvbERlZnMoY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPikge1xuICAgICAgICByZXR1cm4gY2hpbGRDb2x1bW5zXG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgLmZpbHRlcihjb2x1bW4gPT4gIWNvbHVtbi5oYXNDaGlsZENvbHVtbnMoKSlcbiAgICAgICAgICAgIC5tYXAoKGNvbHVtbjogQWdHcmlkQ29sdW1uKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbi50b0NvbERlZigpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVDb2xEZWZGcm9tR3JpZENvbHVtbihmcm9tOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYge1xuICAgICAgICBsZXQgeyBjaGlsZENvbHVtbnMsIC4uLmNvbERlZiB9ID0gZnJvbTtcbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9XG5cbiAgICAvLyBpbnB1dHMgLSBwcmV0dHkgbXVjaCBtb3N0IG9mIENvbERlZiwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mIHRlbXBsYXRlLCB0ZW1wbGF0ZVVybCBhbmQgaW50ZXJuYWwgb25seSBwcm9wZXJ0aWVzXG4gICAgLy8gQFNUQVJUQFxuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlcjogYW55O1xuICAgIC8qKiBUaGUgbmFtZSB0byByZW5kZXIgaW4gdGhlIGNvbHVtbiBoZWFkZXIuIElmIG5vdCBzcGVjaWZpZWQgYW5kIGZpZWxkIGlzIHNwZWNpZmllZCwgdGhlIGZpZWxkIG5hbWUgd2lsbCBiZSB1c2VkIGFzIHRoZSBoZWFkZXIgbmFtZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlck5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gR2V0cyB0aGUgdmFsdWUgZm9yIGRpc3BsYXkgaW4gdGhlIGhlYWRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlclZhbHVlR2V0dGVyOiBzdHJpbmcgfCBIZWFkZXJWYWx1ZUdldHRlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRvb2x0aXAgZm9yIHRoZSBjb2x1bW4gaGVhZGVyICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJUb29sdGlwOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENTUyBjbGFzcyB0byB1c2UgZm9yIHRoZSBoZWFkZXIgY2VsbC4gQ2FuIGJlIGEgc3RyaW5nLCBhcnJheSBvZiBzdHJpbmdzLCBvciBmdW5jdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNsYXNzOiBIZWFkZXJDbGFzcyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3MgdGhlIGdyaWQgdGFraW5nIGFjdGlvbiBmb3IgdGhlIHJlbGV2YW50IGtleWJvYXJkIGV2ZW50IHdoZW4gYSBoZWFkZXIgaXMgZm9jdXNlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzSGVhZGVyS2V5Ym9hcmRFdmVudDogKChwYXJhbXM6IFN1cHByZXNzSGVhZGVyS2V5Ym9hcmRFdmVudFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZXRoZXIgdG8gc2hvdyB0aGUgY29sdW1uIHdoZW4gdGhlIGdyb3VwIGlzIG9wZW4gLyBjbG9zZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cFNob3c6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzIHRvIHVzZSBmb3IgdGhlIHRvb2wgcGFuZWwgY2VsbC4gQ2FuIGJlIGEgc3RyaW5nLCBhcnJheSBvZiBzdHJpbmdzLCBvciBmdW5jdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbENsYXNzOiBUb29sUGFuZWxDbGFzcyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gb3IgZ3JvdXAgdG8gYXBwZWFyIGluIHRoZSBDb2x1bW5zIFRvb2wgUGFuZWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gKGZpbHRlcikgb3IgZ3JvdXAgKGZpbHRlciBncm91cCkgdG8gYXBwZWFyIGluIHRoZSBGaWx0ZXJzIFRvb2wgUGFuZWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmlsdGVyc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biB0b29sdGlwIGNvbXBvbmVudCBmb3IgdGhlIGNvbHVtbi5cbiAgICAgKiBTZWUgW1Rvb2x0aXAgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtdG9vbHRpcC8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnQ6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYHRvb2x0aXBDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICAvKiogVGhlIHBhcmFtcyB1c2VkIHRvIGNvbmZpZ3VyZSBgdG9vbHRpcENvbXBvbmVudGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgLyoqIEEgbGlzdCBjb250YWluaW5nIGEgbWl4IG9mIGNvbHVtbnMgYW5kIGNvbHVtbiBncm91cHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGlsZHJlbjogKENvbERlZiB8IENvbEdyb3VwRGVmKVtdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgdW5pcXVlIElEIHRvIGdpdmUgdGhlIGNvbHVtbi4gVGhpcyBpcyBvcHRpb25hbC4gSWYgbWlzc2luZywgYSB1bmlxdWUgSUQgd2lsbCBiZSBnZW5lcmF0ZWQuIFRoaXMgSUQgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgY29sdW1uIGdyb3VwIGluIHRoZSBjb2x1bW4gQVBJLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHRoaXMgZ3JvdXAgc2hvdWxkIGJlIG9wZW5lZCBieSBkZWZhdWx0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvcGVuQnlEZWZhdWx0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgY29sdW1ucyBpbiB0aGlzIGdyb3VwIGJlc2lkZSBlYWNoIG90aGVyIGluIHRoZSBncmlkLiBNb3ZpbmcgdGhlIGNvbHVtbnMgb3V0c2lkZSBvZiB0aGUgZ3JvdXAgKGFuZCBoZW5jZSBicmVha2luZyB0aGUgZ3JvdXApIGlzIG5vdCBhbGxvd2VkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXJyeUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgY3VzdG9tIGhlYWRlciBncm91cCBjb21wb25lbnQgdG8gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQgaGVhZGVyLiBJZiBub25lIHNwZWNpZmllZCB0aGUgZGVmYXVsdCBBRyBHcmlkIGlzIHVzZWQuXG4gICAgICogU2VlIFtIZWFkZXIgR3JvdXAgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtaGVhZGVyLyNoZWFkZXItZ3JvdXAtY29tcG9uZW50cy8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50OiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBoZWFkZXJHcm91cENvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICAvKiogVGhlIHBhcmFtcyB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgYGhlYWRlckdyb3VwQ29tcG9uZW50YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgLyoqIFRoZSB1bmlxdWUgSUQgdG8gZ2l2ZSB0aGUgY29sdW1uLiBUaGlzIGlzIG9wdGlvbmFsLiBJZiBtaXNzaW5nLCB0aGUgSUQgd2lsbCBkZWZhdWx0IHRvIHRoZSBmaWVsZC5cbiAgICAgKiBJZiBib3RoIGZpZWxkIGFuZCBjb2xJZCBhcmUgbWlzc2luZywgYSB1bmlxdWUgSUQgd2lsbCBiZSBnZW5lcmF0ZWQuXG4gICAgICogVGhpcyBJRCBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSBjb2x1bW4gaW4gdGhlIEFQSSBmb3Igc29ydGluZywgZmlsdGVyaW5nIGV0Yy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbElkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBmaWVsZCBvZiB0aGUgcm93IHRvIGdldCB0aGUgY2VsbHMgZGF0YSBmcm9tICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWVsZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncyBjb250YWluaW5nIGBDb2x1bW5UeXBlYCBrZXlzIHdoaWNoIGNhbiBiZSB1c2VkIGFzIGEgdGVtcGxhdGUgZm9yIGEgY29sdW1uLlxuICAgICAqIFRoaXMgaGVscHMgdG8gcmVkdWNlIGR1cGxpY2F0aW9uIG9mIHByb3BlcnRpZXMgd2hlbiB5b3UgaGF2ZSBhIGxvdCBvZiBjb21tb24gY29sdW1uIHByb3BlcnRpZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0eXBlOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gR2V0cyB0aGUgdmFsdWUgZnJvbSB5b3VyIGRhdGEgZm9yIGRpc3BsYXkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUdldHRlcjogc3RyaW5nIHwgVmFsdWVHZXR0ZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGZ1bmN0aW9uIG9yIGV4cHJlc3Npb24gdG8gZm9ybWF0IGEgdmFsdWUsIHNob3VsZCByZXR1cm4gYSBzdHJpbmcuIE5vdCB1c2VkIGZvciBDU1YgZXhwb3J0IG9yIGNvcHkgdG8gY2xpcGJvYXJkLCBvbmx5IGZvciBVSSBjZWxsIHJlbmRlcmluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlRm9ybWF0dGVyOiBzdHJpbmcgfCBWYWx1ZUZvcm1hdHRlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGVkIGEgcmVmZXJlbmNlIGRhdGEgbWFwIHRvIGJlIHVzZWQgdG8gbWFwIGNvbHVtbiB2YWx1ZXMgdG8gdGhlaXIgcmVzcGVjdGl2ZSB2YWx1ZSBmcm9tIHRoZSBtYXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZWZEYXRhOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZzsgfSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gdG8gcmV0dXJuIGEgc3RyaW5nIGtleSBmb3IgYSB2YWx1ZS5cbiAgICAgKiBUaGlzIHN0cmluZyBpcyB1c2VkIGZvciBncm91cGluZywgU2V0IGZpbHRlcmluZywgYW5kIHNlYXJjaGluZyB3aXRoaW4gY2VsbCBlZGl0b3IgZHJvcGRvd25zLlxuICAgICAqIFdoZW4gZmlsdGVyaW5nIGFuZCBzZWFyY2hpbmcgdGhlIHN0cmluZyBpcyBleHBvc2VkIHRvIHRoZSB1c2VyLCBzbyBtYWtlIHN1cmUgdG8gcmV0dXJuIGEgaHVtYW4tcmVhZGFibGUgdmFsdWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZXlDcmVhdG9yOiAoKHBhcmFtczogS2V5Q3JlYXRvclBhcmFtcykgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9tIGNvbXBhcmF0b3IgZm9yIHZhbHVlcywgdXNlZCBieSByZW5kZXJlciB0byBrbm93IGlmIHZhbHVlcyBoYXZlIGNoYW5nZWQuIENlbGxzIHdobydzIHZhbHVlcyBoYXZlIG5vdCBjaGFuZ2VkIGRvbid0IGdldCByZWZyZXNoZWQuXG4gICAgICogQnkgZGVmYXVsdCB0aGUgZ3JpZCB1c2VzIGA9PT1gIGlzIHVzZWQgd2hpY2ggc2hvdWxkIHdvcmsgZm9yIG1vc3QgdXNlIGNhc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXF1YWxzOiAoKHZhbHVlQTogYW55LCB2YWx1ZUI6IGFueSkgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBmaWVsZCBvZiB0aGUgdG9vbHRpcCB0byBhcHBseSB0byB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBGaWVsZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gdGhlIHN0cmluZyB0byB1c2UgZm9yIGEgdG9vbHRpcCwgYHRvb2x0aXBGaWVsZGAgdGFrZXMgcHJlY2VkZW5jZSBpZiBzZXQuXG4gICAgICogSWYgdXNpbmcgYSBjdXN0b20gYHRvb2x0aXBDb21wb25lbnRgIHlvdSBtYXkgcmV0dXJuIGFueSBjdXN0b20gdmFsdWUgdG8gYmUgcGFzc2VkIHRvIHlvdXIgdG9vbHRpcCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwVmFsdWVHZXR0ZXI6ICgocGFyYW1zOiBJVG9vbHRpcFBhcmFtcykgPT4gc3RyaW5nIHwgYW55KSB8IHVuZGVmaW5lZDtcbiAgICAvKiogYGJvb2xlYW5gIG9yIGBGdW5jdGlvbmAuIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gcmVuZGVyIGEgc2VsZWN0aW9uIGNoZWNrYm94IGluIHRoZSBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWNvbnMgdG8gdXNlIGluc2lkZSB0aGUgY29sdW1uIGluc3RlYWQgb2YgdGhlIGdyaWQncyBkZWZhdWx0IGljb25zLiBMZWF2ZSB1bmRlZmluZWQgdG8gdXNlIGRlZmF1bHRzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfCBzdHJpbmc7IH0gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBjb2x1bW4gaXMgbm90IG5hdmlnYWJsZSAoaS5lLiBjYW5ub3QgYmUgdGFiYmVkIGludG8pLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICAgKiBDYW4gYWxzbyBiZSBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGhhdmUgZGlmZmVyZW50IHJvd3MgbmF2aWdhYmxlLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTmF2aWdhYmxlOiBib29sZWFuIHwgU3VwcHJlc3NOYXZpZ2FibGVDYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIHN1cHByZXNzIGNlcnRhaW4ga2V5Ym9hcmQgZXZlbnRzIGluIHRoZSBncmlkIGNlbGwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudDogKChwYXJhbXM6IFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFBhc3RpbmcgaXMgb24gYnkgZGVmYXVsdCBhcyBsb25nIGFzIGNlbGxzIGFyZSBlZGl0YWJsZSAobm9uLWVkaXRhYmxlIGNlbGxzIGNhbm5vdCBiZSBtb2RpZmllZCwgZXZlbiB3aXRoIGEgcGFzdGUgb3BlcmF0aW9uKS5cbiAgICAgKiBTZXQgdG8gYHRydWVgIHR1cm4gcGFzdGUgb3BlcmF0aW9ucyBvZmYuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Bhc3RlOiBib29sZWFuIHwgU3VwcHJlc3NQYXN0ZUNhbGxiYWNrIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBwcmV2ZW50IHRoZSBmaWxsSGFuZGxlIGZyb20gYmVpbmcgcmVuZGVyZWQgaW4gYW55IGNlbGwgdGhhdCBiZWxvbmdzIHRvIHRoaXMgY29sdW1uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbGxIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgZm9yIHRoaXMgY29sdW1uIHRvIGJlIGhpZGRlbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgaGlkZWAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEhpZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYmxvY2sgbWFraW5nIGNvbHVtbiB2aXNpYmxlIC8gaGlkZGVuIHZpYSB0aGUgVUkgKEFQSSB3aWxsIHN0aWxsIHdvcmspLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrVmlzaWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgaGF2ZSB0aGlzIGNvbHVtbiBkaXNwbGF5ZWQgZmlyc3QuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2tQb3NpdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgbW92YWJsZSB2aWEgZHJhZ2dpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB0aGlzIGNvbHVtbiBpcyBlZGl0YWJsZSwgb3RoZXJ3aXNlIGBmYWxzZWAuIENhbiBhbHNvIGJlIGEgZnVuY3Rpb24gdG8gaGF2ZSBkaWZmZXJlbnQgcm93cyBlZGl0YWJsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdGFibGU6IGJvb2xlYW4gfCBFZGl0YWJsZUNhbGxiYWNrIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBTZXRzIHRoZSB2YWx1ZSBpbnRvIHlvdXIgZGF0YSBmb3Igc2F2aW5nLiBSZXR1cm4gYHRydWVgIGlmIHRoZSBkYXRhIGNoYW5nZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZVNldHRlcjogc3RyaW5nIHwgVmFsdWVTZXR0ZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBQYXJzZXMgdGhlIHZhbHVlIGZvciBzYXZpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZVBhcnNlcjogc3RyaW5nIHwgVmFsdWVQYXJzZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIGNlbGwgZWRpdG9yIGNvbXBvbmVudCBmb3IgdGhpcyBjb2x1bW4ncyBjZWxscy5cbiAgICAgKiBTZWUgW0NlbGwgRWRpdG9yXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtY2VsbC1lZGl0b3IvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3I6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGNlbGxFZGl0b3JgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JGcmFtZXdvcms6IGFueTtcbiAgICAvKiogUGFyYW1zIHRvIGJlIHBhc3NlZCB0byB0aGUgYGNlbGxFZGl0b3JgIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JQYXJhbXM6IGFueTtcbiAgICAvKiogQ2FsbGJhY2sgdG8gc2VsZWN0IHdoaWNoIGNlbGwgZWRpdG9yIHRvIGJlIHVzZWQgZm9yIGEgZ2l2ZW4gcm93IHdpdGhpbiB0aGUgc2FtZSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yU2VsZWN0b3I6IENlbGxFZGl0b3JTZWxlY3RvckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBjZWxscyB1bmRlciB0aGlzIGNvbHVtbiBlbnRlciBlZGl0IG1vZGUgYWZ0ZXIgc2luZ2xlIGNsaWNrLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHVzZSBgdmFsdWVTZXR0ZXJgIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmV3VmFsdWVIYW5kbGVyOiAoKHBhcmFtczogTmV3VmFsdWVQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgLCB0byBoYXZlIHRoZSBjZWxsIGVkaXRvciBhcHBlYXIgaW4gYSBwb3B1cC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JQb3B1cDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBwb3NpdGlvbiBmb3IgdGhlIHBvcHVwIGNlbGwgZWRpdG9yLiBQb3NzaWJsZSB2YWx1ZXMgYXJlXG4gICAgICogICAtIGBvdmVyYCBQb3B1cCB3aWxsIGJlIHBvc2l0aW9uZWQgb3ZlciB0aGUgY2VsbFxuICAgICAqICAgLSBgdW5kZXJgIFBvcHVwIHdpbGwgYmUgcG9zaXRpb25lZCBiZWxvdyB0aGUgY2VsbCBsZWF2aW5nIHRoZSBjZWxsIHZhbHVlIHZpc2libGUuXG4gICAgICogXG4gICAgICogRGVmYXVsdDogYG92ZXJgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBvcHVwUG9zaXRpb246IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgZm9yIGFmdGVyIHRoZSB2YWx1ZSBvZiBhIGNlbGwgaGFzIGNoYW5nZWQsIGVpdGhlciBkdWUgdG8gZWRpdGluZyBvciB0aGUgYXBwbGljYXRpb24gY2FsbGluZyBgYXBpLnNldFZhbHVlKClgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsVmFsdWVDaGFuZ2VkOiAoKGV2ZW50OiBOZXdWYWx1ZVBhcmFtcykgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIGEgY2VsbCBpcyBjbGlja2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsQ2xpY2tlZDogKChldmVudDogQ2VsbENsaWNrZWRFdmVudCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIGEgY2VsbCBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbERvdWJsZUNsaWNrZWQ6ICgoZXZlbnQ6IENlbGxEb3VibGVDbGlja2VkRXZlbnQpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiBhIGNlbGwgaXMgcmlnaHQgY2xpY2tlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbENvbnRleHRNZW51OiAoKGV2ZW50OiBDZWxsQ29udGV4dE1lbnVFdmVudCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZnVuY3Rpb24gdG8gdGVsbCB0aGUgZ3JpZCB3aGF0IHF1aWNrIGZpbHRlciB0ZXh0IHRvIHVzZSBmb3IgdGhpcyBjb2x1bW4gaWYgeW91IGRvbid0IHdhbnQgdG8gdXNlIHRoZSBkZWZhdWx0ICh3aGljaCBpcyBjYWxsaW5nIGB0b1N0cmluZ2Agb24gdGhlIHZhbHVlKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFF1aWNrRmlsdGVyVGV4dDogKChwYXJhbXM6IEdldFF1aWNrRmlsdGVyVGV4dFBhcmFtcykgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gR2V0cyB0aGUgdmFsdWUgZm9yIGZpbHRlcmluZyBwdXJwb3Nlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlclZhbHVlR2V0dGVyOiBzdHJpbmcgfCBWYWx1ZUdldHRlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZXRoZXIgdG8gZGlzcGxheSBhIGZsb2F0aW5nIGZpbHRlciBmb3IgdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiAgICAgKi9cbi8qKiBUaGUgY3VzdG9tIGhlYWRlciBjb21wb25lbnQgdG8gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQgaGVhZGVyLiBJZiBub25lIHNwZWNpZmllZCB0aGUgZGVmYXVsdCBBRyBHcmlkIGhlYWRlciBjb21wb25lbnQgaXMgdXNlZC5cbiAgICAgKiBTZWUgW0hlYWRlciBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1oZWFkZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudDogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgaGVhZGVyQ29tcG9uZW50YCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICAvKiogVGhlIHBhcmFtZXRlcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBgaGVhZGVyQ29tcG9uZW50YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudFBhcmFtczogYW55O1xuICAgIC8qKiBTZXQgdG8gYW4gYXJyYXkgY29udGFpbmluZyB6ZXJvLCBvbmUgb3IgbWFueSBvZiB0aGUgZm9sbG93aW5nIG9wdGlvbnM6IGAnZmlsdGVyTWVudVRhYicgfCAnZ2VuZXJhbE1lbnVUYWInIHwgJ2NvbHVtbnNNZW51VGFiJ2AuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIGZpZ3VyZSBvdXQgd2hpY2ggbWVudSB0YWJzIGFyZSBwcmVzZW50IGFuZCBpbiB3aGljaCBvcmRlciB0aGUgdGFicyBhcmUgc2hvd24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtZW51VGFiczogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFBhcmFtcyB1c2VkIHRvIGNoYW5nZSB0aGUgYmVoYXZpb3VyIGFuZCBhcHBlYXJhbmNlIG9mIHRoZSBDb2x1bW5zIE1lbnUgdGFiLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uc01lbnVQYXJhbXM6IENvbHVtbnNNZW51UGFyYW1zIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIG5vIG1lbnUgc2hvdWxkIGJlIHNob3duIGZvciB0aGlzIGNvbHVtbiBoZWFkZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgIG9yIHRoZSBjYWxsYmFjayByZXR1cm5zIGB0cnVlYCwgYSAnc2VsZWN0IGFsbCcgY2hlY2tib3ggd2lsbCBiZSBwdXQgaW50byB0aGUgaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IGJvb2xlYW4gfCBIZWFkZXJDaGVja2JveFNlbGVjdGlvbkNhbGxiYWNrIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZSBoZWFkZXIgY2hlY2tib3ggc2VsZWN0aW9uIHdpbGwgb25seSBzZWxlY3QgZmlsdGVyZWQgaXRlbXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDaGVja2JveFNlbGVjdGlvbkZpbHRlcmVkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogRGVmaW5lcyB0aGUgY2hhcnQgZGF0YSB0eXBlIHRoYXQgc2hvdWxkIGJlIHVzZWQgZm9yIGEgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnREYXRhVHlwZTogJ2NhdGVnb3J5JyB8ICdzZXJpZXMnIHwgJ3RpbWUnIHwgJ2V4Y2x1ZGVkJyB8IHVuZGVmaW5lZDtcbiAgICAvKiogUGluIGEgY29sdW1uIHRvIG9uZSBzaWRlOiBgcmlnaHRgIG9yIGBsZWZ0YC4gQSB2YWx1ZSBvZiBgdHJ1ZWAgaXMgY29udmVydGVkIHRvIGAnbGVmdCdgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkOiBib29sZWFuIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcGlubmVkYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGlubmVkOiBib29sZWFuIHwgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBibG9jayB0aGUgdXNlciBwaW5uaW5nIHRoZSBjb2x1bW4sIHRoZSBjb2x1bW4gY2FuIG9ubHkgYmUgcGlubmVkIHZpYSBkZWZpbml0aW9ucyBvciBBUEkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2tQaW5uZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGNlbGxSZW5kZXJlclNlbGVjdG9yIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IENlbGwgUmVuZGVyZXIgZm9yIHBpbm5lZCByb3dzLiBDaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlclBhcmFtczogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgdmFsdWVGb3JtYXR0ZXIgZm9yIHBpbm5lZCByb3dzLCBhbmQgY2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dWYWx1ZUZvcm1hdHRlcjogc3RyaW5nIHwgVmFsdWVGb3JtYXR0ZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBwaXZvdCBieSB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBwaXZvdGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpdm90OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyBpbiBjb2x1bW5zIHlvdSB3YW50IHRvIHBpdm90IGJ5LlxuICAgICAqIElmIG9ubHkgcGl2b3RpbmcgYnkgb25lIGNvbHVtbiwgc2V0IHRoaXMgdG8gYW55IG51bWJlciAoZS5nLiBgMGApLlxuICAgICAqIElmIHBpdm90aW5nIGJ5IG11bHRpcGxlIGNvbHVtbnMsIHNldCB0aGlzIHRvIHdoZXJlIHlvdSB3YW50IHRoaXMgY29sdW1uIHRvIGJlIGluIHRoZSBvcmRlciBvZiBwaXZvdHMgKGUuZy4gYDBgIGZvciBmaXJzdCwgYDFgIGZvciBzZWNvbmQsIGFuZCBzbyBvbikuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEluZGV4OiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBwaXZvdEluZGV4YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3RJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDb21wYXJhdG9yIHRvIHVzZSB3aGVuIG9yZGVyaW5nIHRoZSBwaXZvdCBjb2x1bW5zLCB3aGVuIHRoaXMgY29sdW1uIGlzIHVzZWQgdG8gcGl2b3Qgb24uXG4gICAgICogVGhlIHZhbHVlcyB3aWxsIGFsd2F5cyBiZSBzdHJpbmdzLCBhcyB0aGUgcGl2b3Qgc2VydmljZSB1c2VzIHN0cmluZ3MgYXMga2V5cyBmb3IgdGhlIHBpdm90IGdyb3Vwcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Q29tcGFyYXRvcjogKCh2YWx1ZUE6IHN0cmluZywgdmFsdWVCOiBzdHJpbmcpID0+IG51bWJlcikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdG8gYmUgYWJsZSB0byBwaXZvdCBieSB0aGlzIGNvbHVtbiB2aWEgdGhlIEdVSS4gVGhpcyB3aWxsIG5vdCBibG9jayB0aGUgQVBJIG9yIHByb3BlcnRpZXMgYmVpbmcgdXNlZCB0byBhY2hpZXZlIHBpdm90LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVQaXZvdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQW4gb2JqZWN0IG9mIGNzcyB2YWx1ZXMgLyBvciBmdW5jdGlvbiByZXR1cm5pbmcgYW4gb2JqZWN0IG9mIGNzcyB2YWx1ZXMgZm9yIGEgcGFydGljdWxhciBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFN0eWxlOiBDZWxsU3R5bGUgfCBDZWxsU3R5bGVGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDbGFzcyB0byB1c2UgZm9yIHRoZSBjZWxsLiBDYW4gYmUgc3RyaW5nLCBhcnJheSBvZiBzdHJpbmdzLCBvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCBDZWxsQ2xhc3NGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBSdWxlcyB3aGljaCBjYW4gYmUgYXBwbGllZCB0byBpbmNsdWRlIGNlcnRhaW4gQ1NTIGNsYXNzZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3NSdWxlczogQ2VsbENsYXNzUnVsZXMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgeW91ciBvd24gY2VsbCBSZW5kZXJlciBjb21wb25lbnQgZm9yIHRoaXMgY29sdW1uJ3MgY2VsbHMuXG4gICAgICogU2VlIFtDZWxsIFJlbmRlcmVyXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtY2VsbC1yZW5kZXJlci8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlcjogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgY2VsbFJlbmRlcmVyYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueTtcbiAgICAvKiogUGFyYW1zIHRvIGJlIHBhc3NlZCB0byB0aGUgYGNlbGxSZW5kZXJlcmAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyUGFyYW1zOiBhbnk7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBjZWxsIHJlbmRlcmVyIHRvIGJlIHVzZWQgZm9yIGEgZ2l2ZW4gcm93IHdpdGhpbiB0aGUgc2FtZSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJTZWxlY3RvcjogQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGdyaWQgY2FsY3VsYXRlIHRoZSBoZWlnaHQgb2YgYSByb3cgYmFzZWQgb24gY29udGVudHMgb2YgdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGF1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgdGV4dCB3cmFwIGluc2lkZSB0aGUgY2VsbCAtIHR5cGljYWxseSB1c2VkIHdpdGggYGF1dG9IZWlnaHRgLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3cmFwVGV4dDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBmbGFzaCBhIGNlbGwgd2hlbiBpdCdzIHJlZnJlc2hlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHByZXZlbnQgdGhpcyBjb2x1bW4gZnJvbSBmbGFzaGluZyBvbiBjaGFuZ2VzLiBPbmx5IGFwcGxpY2FibGUgaWYgY2VsbCBmbGFzaGluZyBpcyB0dXJuZWQgb24gZm9yIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGbGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogYGJvb2xlYW5gIG9yIGBGdW5jdGlvbmAuIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gYWxsb3cgcm93IGRyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnOiBib29sZWFuIHwgUm93RHJhZ0NhbGxiYWNrIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIHJldHVybiBhIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGByb3dEcmFnQ29tcGAgd2hpbGUgZHJhZ2dpbmcgYSByb3cuXG4gICAgICogSWYgdGhpcyBjYWxsYmFjayBpcyBub3Qgc2V0LCB0aGUgY3VycmVudCBjZWxsIHZhbHVlIHdpbGwgYmUgdXNlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdUZXh0OiAoKHBhcmFtczogSVJvd0RyYWdJdGVtLCBkcmFnSXRlbUNvdW50OiBudW1iZXIpID0+IHN0cmluZykgfCB1bmRlZmluZWQ7XG4gICAgLyoqIGBib29sZWFuYCBvciBgRnVuY3Rpb25gLiBTZXQgdG8gYHRydWVgIChvciByZXR1cm4gYHRydWVgIGZyb20gZnVuY3Rpb24pIHRvIGFsbG93IGRyYWdnaW5nIGZvciBuYXRpdmUgZHJhZyBhbmQgZHJvcC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG5kU291cmNlOiBib29sZWFuIHwgRG5kU291cmNlQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIHRvIGFsbG93IGN1c3RvbSBkcmFnIGZ1bmN0aW9uYWxpdHkgZm9yIG5hdGl2ZSBkcmFnIGFuZCBkcm9wLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG5kU291cmNlT25Sb3dEcmFnOiAoKHBhcmFtczogRG5kU291cmNlT25Sb3dEcmFnUGFyYW1zKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byByb3cgZ3JvdXAgYnkgdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGByb3dHcm91cGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFJvd0dyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyBpbiBjb2x1bW5zIHlvdSB3YW50IHRvIGdyb3VwIGJ5LlxuICAgICAqIElmIG9ubHkgZ3JvdXBpbmcgYnkgb25lIGNvbHVtbiwgc2V0IHRoaXMgdG8gYW55IG51bWJlciAoZS5nLiBgMGApLlxuICAgICAqIElmIGdyb3VwaW5nIGJ5IG11bHRpcGxlIGNvbHVtbnMsIHNldCB0aGlzIHRvIHdoZXJlIHlvdSB3YW50IHRoaXMgY29sdW1uIHRvIGJlIGluIHRoZSBncm91cCAoZS5nLiBgMGAgZm9yIGZpcnN0LCBgMWAgZm9yIHNlY29uZCwgYW5kIHNvIG9uKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwSW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHJvd0dyb3VwSW5kZXhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdG8gYmUgYWJsZSB0byByb3cgZ3JvdXAgYnkgdGhpcyBjb2x1bW4gdmlhIHRoZSBHVUkuXG4gICAgICogVGhpcyB3aWxsIG5vdCBibG9jayB0aGUgQVBJIG9yIHByb3BlcnRpZXMgYmVpbmcgdXNlZCB0byBhY2hpZXZlIHJvdyBncm91cGluZy5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIGFnZ3JlZ2F0ZSBieSB0aGlzIGNvbHVtbiB2aWEgdGhlIEdVSS5cbiAgICAgKiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgYWdncmVnYXRpb24uXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlVmFsdWU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIE5hbWUgb2YgZnVuY3Rpb24gdG8gdXNlIGZvciBhZ2dyZWdhdGlvbi4gWW91IGNhbiBhbHNvIHByb3ZpZGUgeW91ciBvd24gYWdnIGZ1bmN0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuYzogc3RyaW5nIHwgSUFnZ0Z1bmMgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBhZ2dGdW5jYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsQWdnRnVuYzogc3RyaW5nIHwgSUFnZ0Z1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFnZ3JlZ2F0aW9uIGZ1bmN0aW9ucyBhbGxvd2VkIG9uIHRoaXMgY29sdW1uIGUuZy4gYFsnc3VtJywgJ2F2ZyddYC5cbiAgICAgKiBJZiBtaXNzaW5nLCBhbGwgaW5zdGFsbGVkIGZ1bmN0aW9ucyBhcmUgYWxsb3dlZC5cbiAgICAgKiBUaGlzIHdpbGwgb25seSByZXN0cmljdCB3aGF0IHRoZSBHVUkgYWxsb3dzIGEgdXNlciB0byBzZWxlY3QsIGl0IGRvZXMgbm90IGltcGFjdCB3aGVuIHlvdSBzZXQgYSBmdW5jdGlvbiB2aWEgdGhlIEFQSS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93ZWRBZ2dGdW5jczogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGhhdmUgdGhlIGdyaWQgcGxhY2UgdGhlIHZhbHVlcyBmb3IgdGhlIGdyb3VwIGludG8gdGhlIGNlbGwsIG9yIHB1dCB0aGUgbmFtZSBvZiBhIGdyb3VwZWQgY29sdW1uIHRvIGp1c3Qgc2hvdyB0aGF0IGdyb3VwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd1Jvd0dyb3VwOiBzdHJpbmcgfCBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IHNvcnRpbmcgb24gdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRhYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBzb3J0aW5nIGJ5IGRlZmF1bHQsIHNldCBpdCBoZXJlLiBTZXQgdG8gYGFzY2Agb3IgYGRlc2NgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydDogJ2FzYycgfCAnZGVzYycgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBzb3J0YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydDogJ2FzYycgfCAnZGVzYycgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBzb3J0aW5nIG1vcmUgdGhhbiBvbmUgY29sdW1uIGJ5IGRlZmF1bHQsIHNwZWNpZmllcyBvcmRlciBpbiB3aGljaCB0aGUgc29ydGluZyBzaG91bGQgYmUgYXBwbGllZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRJbmRleDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgc29ydEluZGV4YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IGRlZmluaW5nIHRoZSBvcmRlciBpbiB3aGljaCBzb3J0aW5nIG9jY3VycyAoaWYgc29ydGluZyBpcyBlbmFibGVkKS4gQW4gYXJyYXkgd2l0aCBhbnkgb2YgdGhlIGZvbGxvd2luZyBpbiBhbnkgb3JkZXIgYFsnYXNjJywnZGVzYycsbnVsbF1gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6ICgnYXNjJyB8ICdkZXNjJyB8IG51bGwpW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgZnVuY3Rpb24gZm9yIGN1c3RvbSBzb3J0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcGFyYXRvcjogKCh2YWx1ZUE6IGFueSwgdmFsdWVCOiBhbnksIG5vZGVBOiBSb3dOb2RlLCBub2RlQjogUm93Tm9kZSwgaXNJbnZlcnRlZDogYm9vbGVhbikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0aGUgdW5zb3J0ZWQgaWNvbiB0byBiZSBzaG93biB3aGVuIG5vIHNvcnQgaXMgYXBwbGllZCB0byB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjI0IC0gdXNlIHNvcnRJbmRleCBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRlZEF0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQsIGVhY2ggY2VsbCB3aWxsIHRha2UgdXAgdGhlIHdpZHRoIG9mIG9uZSBjb2x1bW4uIFlvdSBjYW4gY2hhbmdlIHRoaXMgYmVoYXZpb3VyIHRvIGFsbG93IGNlbGxzIHRvIHNwYW4gbXVsdGlwbGUgY29sdW1ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbFNwYW46ICgocGFyYW1zOiBDb2xTcGFuUGFyYW1zKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCBlYWNoIGNlbGwgd2lsbCB0YWtlIHVwIHRoZSBoZWlnaHQgb2Ygb25lIHJvdy4gWW91IGNhbiBjaGFuZ2UgdGhpcyBiZWhhdmlvdXIgdG8gYWxsb3cgY2VsbHMgdG8gc3BhbiBtdWx0aXBsZSByb3dzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3BhbjogKChwYXJhbXM6IFJvd1NwYW5QYXJhbXMpID0+IG51bWJlcikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEluaXRpYWwgd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHdpZHRoYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogTWluaW11bSB3aWR0aCBpbiBwaXhlbHMgZm9yIHRoZSBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWluV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogTWF4aW11bSB3aWR0aCBpbiBwaXhlbHMgZm9yIHRoZSBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4V2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogVXNlZCBpbnN0ZWFkIG9mIGB3aWR0aGAgd2hlbiB0aGUgZ29hbCBpcyB0byBmaWxsIHRoZSByZW1haW5pbmcgZW1wdHkgc3BhY2Ugb2YgdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYGZsZXhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxGbGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgdGhpcyBjb2x1bW4gc2hvdWxkIGJlIHJlc2l6ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlc2l6YWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0aGlzIGNvbHVtbidzIHdpZHRoIHRvIGJlIGZpeGVkIGR1cmluZyAnc2l6ZSB0byBmaXQnIG9wZXJhdGlvbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2l6ZVRvRml0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiB0byBiZSBhdXRvLXJlc2l6YWJsZSBieSBkb3VibGUgY2xpY2tpbmcgaXQncyBlZGdlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXG5cbiAgICAvLyBFbmFibGUgdHlwZSBjb2VyY2lvbiBmb3IgYm9vbGVhbiBJbnB1dHMgdG8gc3VwcG9ydCB1c2UgbGlrZSAnZW5hYmxlQ2hhcnRzJyBpbnN0ZWFkIG9mIGZvcmNpbmcgJ1tlbmFibGVDaGFydHNdPVwidHJ1ZVwiJyBcbiAgICAvLyBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdGVtcGxhdGUtdHlwZWNoZWNrI2lucHV0LXNldHRlci1jb2VyY2lvbiBcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDZWxsRmxhc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGaWx0ZXJzVG9vbFBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9vcGVuQnlEZWZhdWx0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXJyeUNoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsSGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luaXRpYWxSb3dHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3Q6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luaXRpYWxQaXZvdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2hlY2tib3hTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2hlYWRlckNoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oZWFkZXJDaGVja2JveFNlbGVjdGlvbkZpbHRlcmVkT25seTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNZW51OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vdmFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tQb3NpdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbG9ja1Zpc2libGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tQaW5uZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3VuU29ydEljb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2l6ZVRvRml0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSb3dHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUGl2b3Q6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVZhbHVlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lZGl0YWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQYXN0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NOYXZpZ2FibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZG5kU291cmNlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hdXRvSGVpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV93cmFwVGV4dDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc29ydGFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jlc2l6YWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9mbG9hdGluZ0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2VsbEVkaXRvclBvcHVwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZpbGxIYW5kbGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgLy8gQEVOREBcblxufVxuIl19