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
        __metadata("design:type", Object)
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
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "defaultAggFunc", void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctZ3JpZC1hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU03RTtJQUFBO0lBbVlBLENBQUM7cUJBbllZLFlBQVk7SUFHZCxzQ0FBZSxHQUF0QjtRQUNJLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkQsdUVBQXVFO1lBQ3ZFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSwrQkFBUSxHQUFmO1FBQ0ksSUFBSSxNQUFNLEdBQVcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ2xCLE1BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN2RTtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxzQ0FBZSxHQUF2QixVQUF3QixZQUFxQztRQUN6RCxPQUFPLFlBQVk7WUFDZix1RUFBdUU7YUFDdEUsTUFBTSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQXpCLENBQXlCLENBQUM7YUFDM0MsR0FBRyxDQUFDLFVBQUMsTUFBb0I7WUFDdEIsT0FBTyxN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QztRQUFSLEtBQUssRUFBRTs7MERBQTZDO0lBRTVDO1FBQVIsS0FBSyxFQUFFOztzREFBNEQ7SUFFM0Q7UUFBUixLQUFLLEVBQUU7O29EQUE0SDtJQUUzSDtRQUFSLEtBQUssRUFBRTs7b0RBQXdDO0lBR3ZDO1FBQVIsS0FBSyxFQUFFOztrREFBcUM7SUFFcEM7UUFBUixLQUFLLEVBQUU7O2lEQUFpRTtJQUVoRTtRQUFSLEtBQUssRUFBRTs7aURBQWlFO0lBRWhFO1FBQVIsS0FBSyxFQUFFOzsrQ0FBa0M7SUFFakM7UUFBUixLQUFLLEVBQUU7O3NEQUF5QztJQUV4QztRQUFSLEtBQUssRUFBRTs7a0RBQXFDO0lBRXBDO1FBQVIsS0FBSyxFQUFFOztrREFBcUM7SUFFcEM7UUFBUixLQUFLLEVBQUU7OzhDQUFpQztJQUVoQztRQUFSLEtBQUssRUFBRTs7cURBQXdDO0lBRXZDO1FBQVIsS0FBSyxFQUFFOzttREFBdUM7SUFFdEM7UUFBUixLQUFLLEVBQUU7OzJEQUErQztJQUU5QztRQUFSLEtBQUssRUFBRTs7MERBQThDO0lBclY3QyxZQUFZO1FBSnhCLFNBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSxnQkFBZ0I7WUFDMUIsUUFBUSxFQUFFLEVBQUU7U0FDZixDQUFDO09BQ1csWUFBWSxDQW1ZeEI7SUFBRCxtQkFBQztDQUFBLEFBbllELElBbVlDO1NBbllZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDZWxsQ2xhc3NGdW5jLCBDZWxsQ2xhc3NSdWxlcywgQ2VsbENsaWNrZWRFdmVudCwgQ2VsbENvbnRleHRNZW51RXZlbnQsIENlbGxEb3VibGVDbGlja2VkRXZlbnQsIENlbGxFZGl0b3JTZWxlY3RvckZ1bmMsIENlbGxSZW5kZXJlclNlbGVjdG9yRnVuYywgQ2VsbFN0eWxlLCBDZWxsU3R5bGVGdW5jLCBDaGVja2JveFNlbGVjdGlvbkNhbGxiYWNrLCBDb2xEZWYsIENvbEdyb3VwRGVmLCBDb2xTcGFuUGFyYW1zLCBDb2x1bW5zTWVudVBhcmFtcywgRG5kU291cmNlQ2FsbGJhY2ssIERuZFNvdXJjZU9uUm93RHJhZ1BhcmFtcywgRWRpdGFibGVDYWxsYmFjaywgR2V0UXVpY2tGaWx0ZXJUZXh0UGFyYW1zLCBIZWFkZXJDaGVja2JveFNlbGVjdGlvbkNhbGxiYWNrLCBIZWFkZXJDbGFzcywgSGVhZGVyVmFsdWVHZXR0ZXJGdW5jLCBJQWdnRnVuYywgSUNlbGxFZGl0b3JDb21wLCBJQ2VsbFJlbmRlcmVyQ29tcCwgSUNlbGxSZW5kZXJlckZ1bmMsIElIZWFkZXJHcm91cENvbXAsIElSb3dEcmFnSXRlbSwgSVRvb2x0aXBDb21wLCBJVG9vbHRpcFBhcmFtcywgS2V5Q3JlYXRvclBhcmFtcywgTmV3VmFsdWVQYXJhbXMsIFJvd0RyYWdDYWxsYmFjaywgUm93Tm9kZSwgUm93U3BhblBhcmFtcywgU3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50UGFyYW1zLCBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXMsIFN1cHByZXNzTmF2aWdhYmxlQ2FsbGJhY2ssIFN1cHByZXNzUGFzdGVDYWxsYmFjaywgVG9vbFBhbmVsQ2xhc3MsIFZhbHVlRm9ybWF0dGVyRnVuYywgVmFsdWVHZXR0ZXJGdW5jLCBWYWx1ZVBhcnNlckZ1bmMsIFZhbHVlU2V0dGVyRnVuYyB9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBDb250ZW50Q2hpbGRyZW4sIElucHV0LCBRdWVyeUxpc3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtY29sdW1uJyxcbiAgICB0ZW1wbGF0ZTogJydcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQ29sdW1uIHtcbiAgICBAQ29udGVudENoaWxkcmVuKEFnR3JpZENvbHVtbikgcHVibGljIGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBwdWJsaWMgaGFzQ2hpbGRDb2x1bW5zKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5jaGlsZENvbHVtbnMgJiYgdGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIHJldHVybiAhKHRoaXMuY2hpbGRDb2x1bW5zLmxlbmd0aCA9PT0gMSAmJiB0aGlzLmNoaWxkQ29sdW1ucy5maXJzdCA9PT0gdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b0NvbERlZigpOiBDb2xEZWYge1xuICAgICAgICBsZXQgY29sRGVmOiBDb2xEZWYgPSB0aGlzLmNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0NoaWxkQ29sdW1ucygpKSB7XG4gICAgICAgICAgICAoPGFueT5jb2xEZWYpW1wiY2hpbGRyZW5cIl0gPSB0aGlzLmdldENoaWxkQ29sRGVmcyh0aGlzLmNoaWxkQ29sdW1ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENoaWxkQ29sRGVmcyhjaGlsZENvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+KSB7XG4gICAgICAgIHJldHVybiBjaGlsZENvbHVtbnNcbiAgICAgICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEwMDk4XG4gICAgICAgICAgICAuZmlsdGVyKGNvbHVtbiA9PiAhY29sdW1uLmhhc0NoaWxkQ29sdW1ucygpKVxuICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKGZyb206IEFnR3JpZENvbHVtbik6IENvbERlZiB7XG4gICAgICAgIGxldCB7IGNoaWxkQ29sdW1ucywgLi4uY29sRGVmIH0gPSBmcm9tO1xuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIC8vIGlucHV0cyAtIHByZXR0eSBtdWNoIG1vc3Qgb2YgQ29sRGVmLCB3aXRoIHRoZSBleGNlcHRpb24gb2YgdGVtcGxhdGUsIHRlbXBsYXRlVXJsIGFuZCBpbnRlcm5hbCBvbmx5IHByb3BlcnRpZXNcbiAgICAvLyBAU1RBUlRAXG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyOiBhbnk7XG4gICAgLyoqIFRoZSBuYW1lIHRvIHJlbmRlciBpbiB0aGUgY29sdW1uIGhlYWRlci4gSWYgbm90IHNwZWNpZmllZCBhbmQgZmllbGQgaXMgc3BlY2lmaWVkLCB0aGUgZmllbGQgbmFtZSB3aWxsIGJlIHVzZWQgYXMgdGhlIGhlYWRlciBuYW1lLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBHZXRzIHRoZSB2YWx1ZSBmb3IgZGlzcGxheSBpbiB0aGUgaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVmFsdWVHZXR0ZXI6IHN0cmluZyB8IEhlYWRlclZhbHVlR2V0dGVyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogVG9vbHRpcCBmb3IgdGhlIGNvbHVtbiBoZWFkZXIgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlclRvb2x0aXA6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzIHRvIHVzZSBmb3IgdGhlIGhlYWRlciBjZWxsLiBDYW4gYmUgYSBzdHJpbmcsIGFycmF5IG9mIHN0cmluZ3MsIG9yIGZ1bmN0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2xhc3M6IEhlYWRlckNsYXNzIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTdXBwcmVzcyB0aGUgZ3JpZCB0YWtpbmcgYWN0aW9uIGZvciB0aGUgcmVsZXZhbnQga2V5Ym9hcmQgZXZlbnQgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50OiAoKHBhcmFtczogU3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogV2hldGhlciB0byBzaG93IHRoZSBjb2x1bW4gd2hlbiB0aGUgZ3JvdXAgaXMgb3BlbiAvIGNsb3NlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkdyb3VwU2hvdzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MgdG8gdXNlIGZvciB0aGUgdG9vbCBwYW5lbCBjZWxsLiBDYW4gYmUgYSBzdHJpbmcsIGFycmF5IG9mIHN0cmluZ3MsIG9yIGZ1bmN0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsQ2xhc3M6IFRvb2xQYW5lbENsYXNzIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiBvciBncm91cCB0byBhcHBlYXIgaW4gdGhlIENvbHVtbnMgVG9vbCBQYW5lbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiAoZmlsdGVyKSBvciBncm91cCAoZmlsdGVyIGdyb3VwKSB0byBhcHBlYXIgaW4gdGhlIEZpbHRlcnMgVG9vbCBQYW5lbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWx0ZXJzVG9vbFBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIHRvb2x0aXAgY29tcG9uZW50IGZvciB0aGUgY29sdW1uLlxuICAgICAqIFNlZSBbVG9vbHRpcCBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC10b29sdGlwLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudDogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgdG9vbHRpcENvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIC8qKiBUaGUgcGFyYW1zIHVzZWQgdG8gY29uZmlndXJlIGB0b29sdGlwQ29tcG9uZW50YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICAvKiogQSBsaXN0IGNvbnRhaW5pbmcgYSBtaXggb2YgY29sdW1ucyBhbmQgY29sdW1uIGdyb3Vwcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoaWxkcmVuOiAoQ29sRGVmIHwgQ29sR3JvdXBEZWYpW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSB1bmlxdWUgSUQgdG8gZ2l2ZSB0aGUgY29sdW1uLiBUaGlzIGlzIG9wdGlvbmFsLiBJZiBtaXNzaW5nLCBhIHVuaXF1ZSBJRCB3aWxsIGJlIGdlbmVyYXRlZC4gVGhpcyBJRCBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSBjb2x1bW4gZ3JvdXAgaW4gdGhlIGNvbHVtbiBBUEkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cElkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBncm91cCBzaG91bGQgYmUgb3BlbmVkIGJ5IGRlZmF1bHQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9wZW5CeURlZmF1bHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8ga2VlcCBjb2x1bW5zIGluIHRoaXMgZ3JvdXAgYmVzaWRlIGVhY2ggb3RoZXIgaW4gdGhlIGdyaWQuIE1vdmluZyB0aGUgY29sdW1ucyBvdXRzaWRlIG9mIHRoZSBncm91cCAoYW5kIGhlbmNlIGJyZWFraW5nIHRoZSBncm91cCkgaXMgbm90IGFsbG93ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1hcnJ5Q2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBjdXN0b20gaGVhZGVyIGdyb3VwIGNvbXBvbmVudCB0byBiZSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGNvbXBvbmVudCBoZWFkZXIuIElmIG5vbmUgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IEFHIEdyaWQgaXMgdXNlZC5cbiAgICAgKiBTZWUgW0hlYWRlciBHcm91cCBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1oZWFkZXIvI2hlYWRlci1ncm91cC1jb21wb25lbnRzLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnQ6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGhlYWRlckdyb3VwQ29tcG9uZW50YCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIC8qKiBUaGUgcGFyYW1zIHVzZWQgdG8gY29uZmlndXJlIHRoZSBgaGVhZGVyR3JvdXBDb21wb25lbnRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICAvKiogVGhlIHVuaXF1ZSBJRCB0byBnaXZlIHRoZSBjb2x1bW4uIFRoaXMgaXMgb3B0aW9uYWwuIElmIG1pc3NpbmcsIHRoZSBJRCB3aWxsIGRlZmF1bHQgdG8gdGhlIGZpZWxkLlxuICAgICAqIElmIGJvdGggZmllbGQgYW5kIGNvbElkIGFyZSBtaXNzaW5nLCBhIHVuaXF1ZSBJRCB3aWxsIGJlIGdlbmVyYXRlZC5cbiAgICAgKiBUaGlzIElEIGlzIHVzZWQgdG8gaWRlbnRpZnkgdGhlIGNvbHVtbiBpbiB0aGUgQVBJIGZvciBzb3J0aW5nLCBmaWx0ZXJpbmcgZXRjLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sSWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGZpZWxkIG9mIHRoZSByb3cgb2JqZWN0IHRvIGdldCB0aGUgY2VsbCdzIGRhdGEgZnJvbS5cbiAgICAgKiBEZWVwIHJlZmVyZW5jZXMgaW50byBhIHJvdyBvYmplY3QgaXMgc3VwcG9ydGVkIHZpYSBkb3Qgbm90YXRpb24sIGkuZSBgJ2FkZHJlc3MuZmlyc3RMaW5lJ2AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWVsZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncyBjb250YWluaW5nIGBDb2x1bW5UeXBlYCBrZXlzIHdoaWNoIGNhbiBiZSB1c2VkIGFzIGEgdGVtcGxhdGUgZm9yIGEgY29sdW1uLlxuICAgICAqIFRoaXMgaGVscHMgdG8gcmVkdWNlIGR1cGxpY2F0aW9uIG9mIHByb3BlcnRpZXMgd2hlbiB5b3UgaGF2ZSBhIGxvdCBvZiBjb21tb24gY29sdW1uIHByb3BlcnRpZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0eXBlOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gR2V0cyB0aGUgdmFsdWUgZnJvbSB5b3VyIGRhdGEgZm9yIGRpc3BsYXkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUdldHRlcjogc3RyaW5nIHwgVmFsdWVHZXR0ZXJGdW5jIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGZ1bmN0aW9uIG9yIGV4cHJlc3Npb24gdG8gZm9ybWF0IGEgdmFsdWUsIHNob3VsZCByZXR1cm4gYSBzdHJpbmcuIE5vdCB1c2VkIGZvciBDU1YgZXhwb3J0IG9yIGNvcHkgdG8gY2xpcGJvYXJkLCBvbmx5IGZvciBVSSBjZWxsIHJlbmRlcmluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlRm9ybWF0dGVyOiBzdHJpbmcgfCBWYWx1ZUZvcm1hdHRlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGVkIGEgcmVmZXJlbmNlIGRhdGEgbWFwIHRvIGJlIHVzZWQgdG8gbWFwIGNvbHVtbiB2YWx1ZXMgdG8gdGhlaXIgcmVzcGVjdGl2ZSB2YWx1ZSBmcm9tIHRoZSBtYXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZWZEYXRhOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZzsgfSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gdG8gcmV0dXJuIGEgc3RyaW5nIGtleSBmb3IgYSB2YWx1ZS5cbiAgICAgKiBUaGlzIHN0cmluZyBpcyB1c2VkIGZvciBncm91cGluZywgU2V0IGZpbHRlcmluZywgYW5kIHNlYXJjaGluZyB3aXRoaW4gY2VsbCBlZGl0b3IgZHJvcGRvd25zLlxuICAgICAqIFdoZW4gZmlsdGVyaW5nIGFuZCBzZWFyY2hpbmcgdGhlIHN0cmluZyBpcyBleHBvc2VkIHRvIHRoZSB1c2VyLCBzbyBtYWtlIHN1cmUgdG8gcmV0dXJuIGEgaHVtYW4tcmVhZGFibGUgdmFsdWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZXlDcmVhdG9yOiAoKHBhcmFtczogS2V5Q3JlYXRvclBhcmFtcykgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9tIGNvbXBhcmF0b3IgZm9yIHZhbHVlcywgdXNlZCBieSByZW5kZXJlciB0byBrbm93IGlmIHZhbHVlcyBoYXZlIGNoYW5nZWQuIENlbGxzIHdobydzIHZhbHVlcyBoYXZlIG5vdCBjaGFuZ2VkIGRvbid0IGdldCByZWZyZXNoZWQuXG4gICAgICogQnkgZGVmYXVsdCB0aGUgZ3JpZCB1c2VzIGA9PT1gIGlzIHVzZWQgd2hpY2ggc2hvdWxkIHdvcmsgZm9yIG1vc3QgdXNlIGNhc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXF1YWxzOiAoKHZhbHVlQTogYW55LCB2YWx1ZUI6IGFueSkgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBmaWVsZCBvZiB0aGUgdG9vbHRpcCB0byBhcHBseSB0byB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBGaWVsZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gdGhlIHN0cmluZyB0byB1c2UgZm9yIGEgdG9vbHRpcCwgYHRvb2x0aXBGaWVsZGAgdGFrZXMgcHJlY2VkZW5jZSBpZiBzZXQuXG4gICAgICogSWYgdXNpbmcgYSBjdXN0b20gYHRvb2x0aXBDb21wb25lbnRgIHlvdSBtYXkgcmV0dXJuIGFueSBjdXN0b20gdmFsdWUgdG8gYmUgcGFzc2VkIHRvIHlvdXIgdG9vbHRpcCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwVmFsdWVHZXR0ZXI6ICgocGFyYW1zOiBJVG9vbHRpcFBhcmFtcykgPT4gc3RyaW5nIHwgYW55KSB8IHVuZGVmaW5lZDtcbiAgICAvKiogYGJvb2xlYW5gIG9yIGBGdW5jdGlvbmAuIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gcmVuZGVyIGEgc2VsZWN0aW9uIGNoZWNrYm94IGluIHRoZSBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWNvbnMgdG8gdXNlIGluc2lkZSB0aGUgY29sdW1uIGluc3RlYWQgb2YgdGhlIGdyaWQncyBkZWZhdWx0IGljb25zLiBMZWF2ZSB1bmRlZmluZWQgdG8gdXNlIGRlZmF1bHRzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfCBzdHJpbmc7IH0gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBjb2x1bW4gaXMgbm90IG5hdmlnYWJsZSAoaS5lLiBjYW5ub3QgYmUgdGFiYmVkIGludG8pLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICAgKiBDYW4gYWxzbyBiZSBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGhhdmUgZGlmZmVyZW50IHJvd3MgbmF2aWdhYmxlLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTmF2aWdhYmxlOiBib29sZWFuIHwgU3VwcHJlc3NOYXZpZ2FibGVDYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIHN1cHByZXNzIGNlcnRhaW4ga2V5Ym9hcmQgZXZlbnRzIGluIHRoZSBncmlkIGNlbGwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudDogKChwYXJhbXM6IFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFBhc3RpbmcgaXMgb24gYnkgZGVmYXVsdCBhcyBsb25nIGFzIGNlbGxzIGFyZSBlZGl0YWJsZSAobm9uLWVkaXRhYmxlIGNlbGxzIGNhbm5vdCBiZSBtb2RpZmllZCwgZXZlbiB3aXRoIGEgcGFzdGUgb3BlcmF0aW9uKS5cbiAgICAgKiBTZXQgdG8gYHRydWVgIHR1cm4gcGFzdGUgb3BlcmF0aW9ucyBvZmYuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Bhc3RlOiBib29sZWFuIHwgU3VwcHJlc3NQYXN0ZUNhbGxiYWNrIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBwcmV2ZW50IHRoZSBmaWxsSGFuZGxlIGZyb20gYmVpbmcgcmVuZGVyZWQgaW4gYW55IGNlbGwgdGhhdCBiZWxvbmdzIHRvIHRoaXMgY29sdW1uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbGxIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgZm9yIHRoaXMgY29sdW1uIHRvIGJlIGhpZGRlbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgaGlkZWAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEhpZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYmxvY2sgbWFraW5nIGNvbHVtbiB2aXNpYmxlIC8gaGlkZGVuIHZpYSB0aGUgVUkgKEFQSSB3aWxsIHN0aWxsIHdvcmspLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrVmlzaWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogTG9jayBhIGNvbHVtbiB0byBwb3NpdGlvbiB0byBgJ2xlZnQnYCBvcmAncmlnaHQnYCB0byBhbHdheXMgaGF2ZSB0aGlzIGNvbHVtbiBkaXNwbGF5ZWQgaW4gdGhhdCBwb3NpdGlvbi4gdHJ1ZSBpcyB0cmVhdGVkIGFzIGAnbGVmdCdgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUG9zaXRpb246IGJvb2xlYW4gfCAnbGVmdCcgfCAncmlnaHQnIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiB0byBiZSBtb3ZhYmxlIHZpYSBkcmFnZ2luZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHRoaXMgY29sdW1uIGlzIGVkaXRhYmxlLCBvdGhlcndpc2UgYGZhbHNlYC4gQ2FuIGFsc28gYmUgYSBmdW5jdGlvbiB0byBoYXZlIGRpZmZlcmVudCByb3dzIGVkaXRhYmxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlZGl0YWJsZTogYm9vbGVhbiB8IEVkaXRhYmxlQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIFNldHMgdGhlIHZhbHVlIGludG8geW91ciBkYXRhIGZvciBzYXZpbmcuIFJldHVybiBgdHJ1ZWAgaWYgdGhlIGRhdGEgY2hhbmdlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlU2V0dGVyOiBzdHJpbmcgfCBWYWx1ZVNldHRlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIFBhcnNlcyB0aGUgdmFsdWUgZm9yIHNhdmluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlUGFyc2VyOiBzdHJpbmcgfCBWYWx1ZVBhcnNlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgeW91ciBvd24gY2VsbCBlZGl0b3IgY29tcG9uZW50IGZvciB0aGlzIGNvbHVtbidzIGNlbGxzLlxuICAgICAqIFNlZSBbQ2VsbCBFZGl0b3JdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1jZWxsLWVkaXRvci8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvcjogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgY2VsbEVkaXRvcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvckZyYW1ld29yazogYW55O1xuICAgIC8qKiBQYXJhbXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBgY2VsbEVkaXRvcmAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBhcmFtczogYW55O1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggY2VsbCBlZGl0b3IgdG8gYmUgdXNlZCBmb3IgYSBnaXZlbiByb3cgd2l0aGluIHRoZSBzYW1lIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JTZWxlY3RvcjogQ2VsbEVkaXRvclNlbGVjdG9yRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIHVuZGVyIHRoaXMgY29sdW1uIGVudGVyIGVkaXQgbW9kZSBhZnRlciBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdXNlIGB2YWx1ZVNldHRlcmAgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuZXdWYWx1ZUhhbmRsZXI6ICgocGFyYW1zOiBOZXdWYWx1ZVBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAsIHRvIGhhdmUgdGhlIGNlbGwgZWRpdG9yIGFwcGVhciBpbiBhIHBvcHVwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBvcHVwOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhlIHBvc2l0aW9uIGZvciB0aGUgcG9wdXAgY2VsbCBlZGl0b3IuIFBvc3NpYmxlIHZhbHVlcyBhcmVcbiAgICAgKiAgIC0gYG92ZXJgIFBvcHVwIHdpbGwgYmUgcG9zaXRpb25lZCBvdmVyIHRoZSBjZWxsXG4gICAgICogICAtIGB1bmRlcmAgUG9wdXAgd2lsbCBiZSBwb3NpdGlvbmVkIGJlbG93IHRoZSBjZWxsIGxlYXZpbmcgdGhlIGNlbGwgdmFsdWUgdmlzaWJsZS5cbiAgICAgKiBcbiAgICAgKiBEZWZhdWx0OiBgb3ZlcmAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUG9wdXBQb3NpdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBmb3IgYWZ0ZXIgdGhlIHZhbHVlIG9mIGEgY2VsbCBoYXMgY2hhbmdlZCwgZWl0aGVyIGR1ZSB0byBlZGl0aW5nIG9yIHRoZSBhcHBsaWNhdGlvbiBjYWxsaW5nIGBhcGkuc2V0VmFsdWUoKWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxWYWx1ZUNoYW5nZWQ6ICgoZXZlbnQ6IE5ld1ZhbHVlUGFyYW1zKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDbGlja2VkOiAoKGV2ZW50OiBDZWxsQ2xpY2tlZEV2ZW50KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIGRvdWJsZSBjbGlja2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsRG91YmxlQ2xpY2tlZDogKChldmVudDogQ2VsbERvdWJsZUNsaWNrZWRFdmVudCkgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIGEgY2VsbCBpcyByaWdodCBjbGlja2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsQ29udGV4dE1lbnU6ICgoZXZlbnQ6IENlbGxDb250ZXh0TWVudUV2ZW50KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBmdW5jdGlvbiB0byB0ZWxsIHRoZSBncmlkIHdoYXQgcXVpY2sgZmlsdGVyIHRleHQgdG8gdXNlIGZvciB0aGlzIGNvbHVtbiBpZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgKHdoaWNoIGlzIGNhbGxpbmcgYHRvU3RyaW5nYCBvbiB0aGUgdmFsdWUpLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0UXVpY2tGaWx0ZXJUZXh0OiAoKHBhcmFtczogR2V0UXVpY2tGaWx0ZXJUZXh0UGFyYW1zKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBHZXRzIHRoZSB2YWx1ZSBmb3IgZmlsdGVyaW5nIHB1cnBvc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyVmFsdWVHZXR0ZXI6IHN0cmluZyB8IFZhbHVlR2V0dGVyRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogV2hldGhlciB0byBkaXNwbGF5IGEgZmxvYXRpbmcgZmlsdGVyIGZvciB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqICAgICAqL1xuLyoqIFRoZSBjdXN0b20gaGVhZGVyIGNvbXBvbmVudCB0byBiZSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGNvbXBvbmVudCBoZWFkZXIuIElmIG5vbmUgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IEFHIEdyaWQgaGVhZGVyIGNvbXBvbmVudCBpcyB1c2VkLlxuICAgICAqIFNlZSBbSGVhZGVyIENvbXBvbmVudF0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LWhlYWRlci8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50OiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBoZWFkZXJDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIC8qKiBUaGUgcGFyYW1ldGVycyB0byBiZSBwYXNzZWQgdG8gdGhlIGBoZWFkZXJDb21wb25lbnRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgLyoqIFNldCB0byBhbiBhcnJheSBjb250YWluaW5nIHplcm8sIG9uZSBvciBtYW55IG9mIHRoZSBmb2xsb3dpbmcgb3B0aW9uczogYCdmaWx0ZXJNZW51VGFiJyB8ICdnZW5lcmFsTWVudVRhYicgfCAnY29sdW1uc01lbnVUYWInYC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZmlndXJlIG91dCB3aGljaCBtZW51IHRhYnMgYXJlIHByZXNlbnQgYW5kIGluIHdoaWNoIG9yZGVyIHRoZSB0YWJzIGFyZSBzaG93bi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1lbnVUYWJzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbiAgICAvKiogUGFyYW1zIHVzZWQgdG8gY2hhbmdlIHRoZSBiZWhhdmlvdXIgYW5kIGFwcGVhcmFuY2Ugb2YgdGhlIENvbHVtbnMgTWVudSB0YWIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5zTWVudVBhcmFtczogQ29sdW1uc01lbnVQYXJhbXMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgbm8gbWVudSBzaG91bGQgYmUgc2hvd24gZm9yIHRoaXMgY29sdW1uIGhlYWRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAgb3IgdGhlIGNhbGxiYWNrIHJldHVybnMgYHRydWVgLCBhICdzZWxlY3QgYWxsJyBjaGVja2JveCB3aWxsIGJlIHB1dCBpbnRvIHRoZSBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IEhlYWRlckNoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGhlYWRlciBjaGVja2JveCBzZWxlY3Rpb24gd2lsbCBvbmx5IHNlbGVjdCBmaWx0ZXJlZCBpdGVtcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBEZWZpbmVzIHRoZSBjaGFydCBkYXRhIHR5cGUgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgYSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydERhdGFUeXBlOiAnY2F0ZWdvcnknIHwgJ3NlcmllcycgfCAndGltZScgfCAnZXhjbHVkZWQnIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQaW4gYSBjb2x1bW4gdG8gb25lIHNpZGU6IGByaWdodGAgb3IgYGxlZnRgLiBBIHZhbHVlIG9mIGB0cnVlYCBpcyBjb252ZXJ0ZWQgdG8gYCdsZWZ0J2AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWQ6IGJvb2xlYW4gfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBwaW5uZWRgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaW5uZWQ6IGJvb2xlYW4gfCBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGJsb2NrIHRoZSB1c2VyIHBpbm5pbmcgdGhlIGNvbHVtbiwgdGhlIGNvbHVtbiBjYW4gb25seSBiZSBwaW5uZWQgdmlhIGRlZmluaXRpb25zIG9yIEFQSS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Bpbm5lZDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGNlbGxSZW5kZXJlclNlbGVjdG9yIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IENlbGwgUmVuZGVyZXIgZm9yIHBpbm5lZCByb3dzLiBDaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGNlbGxSZW5kZXJlclNlbGVjdG9yIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IENlbGwgUmVuZGVyZXIgZm9yIHBpbm5lZCByb3dzLiBDaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlckZyYW1ld29yazogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgY2VsbFJlbmRlcmVyU2VsZWN0b3IgaWYgeW91IHdhbnQgYSBkaWZmZXJlbnQgQ2VsbCBSZW5kZXJlciBmb3IgcGlubmVkIHJvd3MuIENoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyUGFyYW1zOiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSB2YWx1ZUZvcm1hdHRlciBmb3IgcGlubmVkIHJvd3MsIGFuZCBjaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd1ZhbHVlRm9ybWF0dGVyOiBzdHJpbmcgfCBWYWx1ZUZvcm1hdHRlckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIHBpdm90IGJ5IHRoaXMgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHBpdm90YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIGluIGNvbHVtbnMgeW91IHdhbnQgdG8gcGl2b3QgYnkuXG4gICAgICogSWYgb25seSBwaXZvdGluZyBieSBvbmUgY29sdW1uLCBzZXQgdGhpcyB0byBhbnkgbnVtYmVyIChlLmcuIGAwYCkuXG4gICAgICogSWYgcGl2b3RpbmcgYnkgbXVsdGlwbGUgY29sdW1ucywgc2V0IHRoaXMgdG8gd2hlcmUgeW91IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgaW4gdGhlIG9yZGVyIG9mIHBpdm90cyAoZS5nLiBgMGAgZm9yIGZpcnN0LCBgMWAgZm9yIHNlY29uZCwgYW5kIHNvIG9uKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90SW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHBpdm90SW5kZXhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgdG8gdXNlIHdoZW4gb3JkZXJpbmcgdGhlIHBpdm90IGNvbHVtbnMsIHdoZW4gdGhpcyBjb2x1bW4gaXMgdXNlZCB0byBwaXZvdCBvbi5cbiAgICAgKiBUaGUgdmFsdWVzIHdpbGwgYWx3YXlzIGJlIHN0cmluZ3MsIGFzIHRoZSBwaXZvdCBzZXJ2aWNlIHVzZXMgc3RyaW5ncyBhcyBrZXlzIGZvciB0aGUgcGl2b3QgZ3JvdXBzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb21wYXJhdG9yOiAoKHZhbHVlQTogc3RyaW5nLCB2YWx1ZUI6IHN0cmluZykgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIHBpdm90IGJ5IHRoaXMgY29sdW1uIHZpYSB0aGUgR1VJLiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgcGl2b3QuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVBpdm90OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3Qgb2YgY3NzIHZhbHVlcyAvIG9yIGZ1bmN0aW9uIHJldHVybmluZyBhbiBvYmplY3Qgb2YgY3NzIHZhbHVlcyBmb3IgYSBwYXJ0aWN1bGFyIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsU3R5bGU6IENlbGxTdHlsZSB8IENlbGxTdHlsZUZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENsYXNzIHRvIHVzZSBmb3IgdGhlIGNlbGwuIENhbiBiZSBzdHJpbmcsIGFycmF5IG9mIHN0cmluZ3MsIG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzOiBzdHJpbmcgfCBzdHJpbmdbXSB8IENlbGxDbGFzc0Z1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFJ1bGVzIHdoaWNoIGNhbiBiZSBhcHBsaWVkIHRvIGluY2x1ZGUgY2VydGFpbiBDU1MgY2xhc3Nlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxDbGFzc1J1bGVzOiBDZWxsQ2xhc3NSdWxlcyB8IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBjZWxsIFJlbmRlcmVyIGNvbXBvbmVudCBmb3IgdGhpcyBjb2x1bW4ncyBjZWxscy5cbiAgICAgKiBTZWUgW0NlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1jZWxsLXJlbmRlcmVyLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyOiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBjZWxsUmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlckZyYW1ld29yazogYW55O1xuICAgIC8qKiBQYXJhbXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBgY2VsbFJlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJQYXJhbXM6IGFueTtcbiAgICAvKiogQ2FsbGJhY2sgdG8gc2VsZWN0IHdoaWNoIGNlbGwgcmVuZGVyZXIgdG8gYmUgdXNlZCBmb3IgYSBnaXZlbiByb3cgd2l0aGluIHRoZSBzYW1lIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclNlbGVjdG9yOiBDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgZ3JpZCBjYWxjdWxhdGUgdGhlIGhlaWdodCBvZiBhIHJvdyBiYXNlZCBvbiBjb250ZW50cyBvZiB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0hlaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSB0ZXh0IHdyYXAgaW5zaWRlIHRoZSBjZWxsIC0gdHlwaWNhbGx5IHVzZWQgd2l0aCBgYXV0b0hlaWdodGAuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHdyYXBUZXh0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGZsYXNoIGEgY2VsbCB3aGVuIGl0J3MgcmVmcmVzaGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gcHJldmVudCB0aGlzIGNvbHVtbiBmcm9tIGZsYXNoaW5nIG9uIGNoYW5nZXMuIE9ubHkgYXBwbGljYWJsZSBpZiBjZWxsIGZsYXNoaW5nIGlzIHR1cm5lZCBvbiBmb3IgdGhlIGdyaWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbEZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBgYm9vbGVhbmAgb3IgYEZ1bmN0aW9uYC4gU2V0IHRvIGB0cnVlYCAob3IgcmV0dXJuIGB0cnVlYCBmcm9tIGZ1bmN0aW9uKSB0byBhbGxvdyByb3cgZHJhZ2dpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWc6IGJvb2xlYW4gfCBSb3dEcmFnQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEEgY2FsbGJhY2sgdGhhdCBzaG91bGQgcmV0dXJuIGEgc3RyaW5nIHRvIGJlIGRpc3BsYXllZCBieSB0aGUgYHJvd0RyYWdDb21wYCB3aGlsZSBkcmFnZ2luZyBhIHJvdy5cbiAgICAgKiBJZiB0aGlzIGNhbGxiYWNrIGlzIG5vdCBzZXQsIHRoZSBjdXJyZW50IGNlbGwgdmFsdWUgd2lsbCBiZSB1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ1RleHQ6ICgocGFyYW1zOiBJUm93RHJhZ0l0ZW0sIGRyYWdJdGVtQ291bnQ6IG51bWJlcikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogYGJvb2xlYW5gIG9yIGBGdW5jdGlvbmAuIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gYWxsb3cgZHJhZ2dpbmcgZm9yIG5hdGl2ZSBkcmFnIGFuZCBkcm9wLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2U6IGJvb2xlYW4gfCBEbmRTb3VyY2VDYWxsYmFjayB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gdG8gYWxsb3cgY3VzdG9tIGRyYWcgZnVuY3Rpb25hbGl0eSBmb3IgbmF0aXZlIGRyYWcgYW5kIGRyb3AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2VPblJvd0RyYWc6ICgocGFyYW1zOiBEbmRTb3VyY2VPblJvd0RyYWdQYXJhbXMpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHJvdyBncm91cCBieSB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHJvd0dyb3VwYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUm93R3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIGluIGNvbHVtbnMgeW91IHdhbnQgdG8gZ3JvdXAgYnkuXG4gICAgICogSWYgb25seSBncm91cGluZyBieSBvbmUgY29sdW1uLCBzZXQgdGhpcyB0byBhbnkgbnVtYmVyIChlLmcuIGAwYCkuXG4gICAgICogSWYgZ3JvdXBpbmcgYnkgbXVsdGlwbGUgY29sdW1ucywgc2V0IHRoaXMgdG8gd2hlcmUgeW91IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgaW4gdGhlIGdyb3VwIChlLmcuIGAwYCBmb3IgZmlyc3QsIGAxYCBmb3Igc2Vjb25kLCBhbmQgc28gb24pLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBJbmRleDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcm93R3JvdXBJbmRleGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFJvd0dyb3VwSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIHJvdyBncm91cCBieSB0aGlzIGNvbHVtbiB2aWEgdGhlIEdVSS5cbiAgICAgKiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgcm93IGdyb3VwaW5nLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJvd0dyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRvIGJlIGFibGUgdG8gYWdncmVnYXRlIGJ5IHRoaXMgY29sdW1uIHZpYSB0aGUgR1VJLlxuICAgICAqIFRoaXMgd2lsbCBub3QgYmxvY2sgdGhlIEFQSSBvciBwcm9wZXJ0aWVzIGJlaW5nIHVzZWQgdG8gYWNoaWV2ZSBhZ2dyZWdhdGlvbi5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVWYWx1ZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogTmFtZSBvZiBmdW5jdGlvbiB0byB1c2UgZm9yIGFnZ3JlZ2F0aW9uLiBZb3UgY2FuIGFsc28gcHJvdmlkZSB5b3VyIG93biBhZ2cgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jOiBzdHJpbmcgfCBJQWdnRnVuYyB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYGFnZ0Z1bmNgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxBZ2dGdW5jOiBzdHJpbmcgfCBJQWdnRnVuYyB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIG5hbWUgb2YgdGhlIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9uIHRvIHVzZSBmb3IgdGhpcyBjb2x1bW4gd2hlbiBpdCBpcyBlbmFibGVkIHZpYSB0aGUgR1VJLlxuICAgICAqIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90IGltbWVkaWF0ZWx5IGFwcGx5IHRoZSBhZ2dyZWdhdGlvbiBmdW5jdGlvbiBsaWtlIGBhZ2dGdW5jYFxuICAgICAqIERlZmF1bHQ6IGBzdW1gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0QWdnRnVuYzogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBZ2dyZWdhdGlvbiBmdW5jdGlvbnMgYWxsb3dlZCBvbiB0aGlzIGNvbHVtbiBlLmcuIGBbJ3N1bScsICdhdmcnXWAuXG4gICAgICogSWYgbWlzc2luZywgYWxsIGluc3RhbGxlZCBmdW5jdGlvbnMgYXJlIGFsbG93ZWQuXG4gICAgICogVGhpcyB3aWxsIG9ubHkgcmVzdHJpY3Qgd2hhdCB0aGUgR1VJIGFsbG93cyBhIHVzZXIgdG8gc2VsZWN0LCBpdCBkb2VzIG5vdCBpbXBhY3Qgd2hlbiB5b3Ugc2V0IGEgZnVuY3Rpb24gdmlhIHRoZSBBUEkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd2VkQWdnRnVuY3M6IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBoYXZlIHRoZSBncmlkIHBsYWNlIHRoZSB2YWx1ZXMgZm9yIHRoZSBncm91cCBpbnRvIHRoZSBjZWxsLCBvciBwdXQgdGhlIG5hbWUgb2YgYSBncm91cGVkIGNvbHVtbiB0byBqdXN0IHNob3cgdGhhdCBncm91cC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNob3dSb3dHcm91cDogc3RyaW5nIHwgYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBzb3J0aW5nIG9uIHRoaXMgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0YWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgc29ydGluZyBieSBkZWZhdWx0LCBzZXQgaXQgaGVyZS4gU2V0IHRvIGBhc2NgIG9yIGBkZXNjYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnQ6ICdhc2MnIHwgJ2Rlc2MnIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgc29ydGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFNvcnQ6ICdhc2MnIHwgJ2Rlc2MnIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgc29ydGluZyBtb3JlIHRoYW4gb25lIGNvbHVtbiBieSBkZWZhdWx0LCBzcGVjaWZpZXMgb3JkZXIgaW4gd2hpY2ggdGhlIHNvcnRpbmcgc2hvdWxkIGJlIGFwcGxpZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0SW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHNvcnRJbmRleGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFNvcnRJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBkZWZpbmluZyB0aGUgb3JkZXIgaW4gd2hpY2ggc29ydGluZyBvY2N1cnMgKGlmIHNvcnRpbmcgaXMgZW5hYmxlZCkuIEFuIGFycmF5IHdpdGggYW55IG9mIHRoZSBmb2xsb3dpbmcgaW4gYW55IG9yZGVyIGBbJ2FzYycsJ2Rlc2MnLG51bGxdYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiAoJ2FzYycgfCAnZGVzYycgfCBudWxsKVtdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDb21wYXJhdG9yIGZ1bmN0aW9uIGZvciBjdXN0b20gc29ydGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBhcmF0b3I6ICgodmFsdWVBOiBhbnksIHZhbHVlQjogYW55LCBub2RlQTogUm93Tm9kZSwgbm9kZUI6IFJvd05vZGUsIGlzSW52ZXJ0ZWQ6IGJvb2xlYW4pID0+IG51bWJlcikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdGhlIHVuc29ydGVkIGljb24gdG8gYmUgc2hvd24gd2hlbiBubyBzb3J0IGlzIGFwcGxpZWQgdG8gdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuU29ydEljb246IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHYyNCAtIHVzZSBzb3J0SW5kZXggaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0ZWRBdDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCBlYWNoIGNlbGwgd2lsbCB0YWtlIHVwIHRoZSB3aWR0aCBvZiBvbmUgY29sdW1uLiBZb3UgY2FuIGNoYW5nZSB0aGlzIGJlaGF2aW91ciB0byBhbGxvdyBjZWxscyB0byBzcGFuIG11bHRpcGxlIGNvbHVtbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xTcGFuOiAoKHBhcmFtczogQ29sU3BhblBhcmFtcykgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgZWFjaCBjZWxsIHdpbGwgdGFrZSB1cCB0aGUgaGVpZ2h0IG9mIG9uZSByb3cuIFlvdSBjYW4gY2hhbmdlIHRoaXMgYmVoYXZpb3VyIHRvIGFsbG93IGNlbGxzIHRvIHNwYW4gbXVsdGlwbGUgcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1NwYW46ICgocGFyYW1zOiBSb3dTcGFuUGFyYW1zKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBJbml0aWFsIHdpZHRoIGluIHBpeGVscyBmb3IgdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3aWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGB3aWR0aGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIE1pbmltdW0gd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1pbldpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIE1heGltdW0gd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFVzZWQgaW5zdGVhZCBvZiBgd2lkdGhgIHdoZW4gdGhlIGdvYWwgaXMgdG8gZmlsbCB0aGUgcmVtYWluaW5nIGVtcHR5IHNwYWNlIG9mIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBmbGV4YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsRmxleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IHRoaXMgY29sdW1uIHNob3VsZCBiZSByZXNpemVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZXNpemFibGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdGhpcyBjb2x1bW4ncyB3aWR0aCB0byBiZSBmaXhlZCBkdXJpbmcgJ3NpemUgdG8gZml0JyBvcGVyYXRpb25zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NpemVUb0ZpdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgYXV0by1yZXNpemFibGUgYnkgZG91YmxlIGNsaWNraW5nIGl0J3MgZWRnZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblxuXG4gICAgLy8gRW5hYmxlIHR5cGUgY29lcmNpb24gZm9yIGJvb2xlYW4gSW5wdXRzIHRvIHN1cHBvcnQgdXNlIGxpa2UgJ2VuYWJsZUNoYXJ0cycgaW5zdGVhZCBvZiBmb3JjaW5nICdbZW5hYmxlQ2hhcnRzXT1cInRydWVcIicgXG4gICAgLy8gaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3RlbXBsYXRlLXR5cGVjaGVjayNpbnB1dC1zZXR0ZXItY29lcmNpb24gXG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbEZsYXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmlsdGVyc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfb3BlbkJ5RGVmYXVsdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFycnlDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW5pdGlhbEhpZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0dyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsUm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsUGl2b3Q6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oZWFkZXJDaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25GaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2NrUG9zaXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tWaXNpYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2NrUGlubmVkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91blNvcnRJY29uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1NpemVUb0ZpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVBpdm90OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVWYWx1ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZWRpdGFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTmF2aWdhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RuZFNvdXJjZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b0hlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfd3JhcFRleHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NvcnRhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZXNpemFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZmxvYXRpbmdGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NlbGxFZGl0b3JQb3B1cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIC8vIEBFTkRAXG5cbn1cbiJdfQ==