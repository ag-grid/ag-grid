var AgGridColumn_1;
import { __decorate, __metadata, __rest } from "tslib";
// @END_IMPORTS@
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
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "showDisabledCheckboxes", void 0);
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
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "wrapHeaderText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "autoHeaderHeight", void 0);
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
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctZ3JpZC1hbmd1bGFyLWxlZ2FjeS8iLCJzb3VyY2VzIjpbImxpYi9hZy1ncmlkLWNvbHVtbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUEyQ0EsZ0JBQWdCO0FBQ2hCLE9BQU8sRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFNN0UsSUFBYSxZQUFZLG9CQUF6QixNQUFhLFlBQVk7SUFHZCxlQUFlO1FBQ2xCLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkQsdUVBQXVFO1lBQ3ZFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxRQUFRO1FBQ1gsSUFBSSxNQUFNLEdBQVcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ2xCLE1BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN2RTtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxlQUFlLENBQUMsWUFBcUM7UUFDekQsT0FBTyxZQUFZO1lBQ2YsdUVBQXVFO2FBQ3RFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQzNDLEdBQUcsQ0FBQyxDQUFDLE1BQW9CLEVBQUUsRUFBRTtZQUMxQixPQUFPLE1B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SyxFQUFFOzs4Q0FBc0M7QUFFckM7SUFBUixLQUFLLEVBQUU7OzBDQUFnRDtBQUUvQztJQUFSLEtBQUssRUFBRTs7aURBQXVEO0FBRXREO0lBQVIsS0FBSyxFQUFFOzsrQ0FBNkM7QUFFNUM7SUFBUixLQUFLLEVBQUU7O3NEQUE2QztBQUU1QztJQUFSLEtBQUssRUFBRTs7a0RBQTREO0FBVzNEO0lBQVIsS0FBSyxFQUFFOztnREFBNEk7QUFFM0k7SUFBUixLQUFLLEVBQUU7O2dEQUF3QztBQUd2QztJQUFSLEtBQUssRUFBRTs7OENBQXFDO0FBRXBDO0lBQVIsS0FBSyxFQUFFOzs2Q0FBd0U7QUFFdkU7SUFBUixLQUFLLEVBQUU7OzZDQUF3RTtBQUV2RTtJQUFSLEtBQUssRUFBRTs7MkNBQWtDO0FBRWpDO0lBQVIsS0FBSyxFQUFFOztrREFBeUM7QUFFeEM7SUFBUixLQUFLLEVBQUU7OzhDQUFxQztBQUVwQztJQUFSLEtBQUssRUFBRTs7OENBQXFDO0FBRXBDO0lBQVIsS0FBSyxFQUFFOzswQ0FBaUM7QUFFaEM7SUFBUixLQUFLLEVBQUU7O2lEQUF3QztBQUV2QztJQUFSLEtBQUssRUFBRTs7K0NBQXVDO0FBRXRDO0lBQVIsS0FBSyxFQUFFOzt1REFBK0M7QUFFOUM7SUFBUixLQUFLLEVBQUU7O3NEQUE4QztBQXRXN0MsWUFBWTtJQUp4QixTQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsZ0JBQWdCO1FBQzFCLFFBQVEsRUFBRSxFQUFFO0tBQ2YsQ0FBQztHQUNXLFlBQVksQ0F1WnhCO1NBdlpZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAU1RBUlRfSU1QT1JUU0BcbmltcG9ydCB7XG4gICAgQ2VsbENsYXNzRnVuYyxcbiAgICBDZWxsQ2xhc3NSdWxlcyxcbiAgICBDZWxsQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxDb250ZXh0TWVudUV2ZW50LFxuICAgIENlbGxEb3VibGVDbGlja2VkRXZlbnQsXG4gICAgQ2VsbEVkaXRvclNlbGVjdG9yRnVuYyxcbiAgICBDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMsXG4gICAgQ2VsbFN0eWxlLFxuICAgIENlbGxTdHlsZUZ1bmMsXG4gICAgQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjayxcbiAgICBDb2xEZWYsXG4gICAgQ29sR3JvdXBEZWYsXG4gICAgQ29sU3BhblBhcmFtcyxcbiAgICBDb2x1bW5zTWVudVBhcmFtcyxcbiAgICBEbmRTb3VyY2VDYWxsYmFjayxcbiAgICBEbmRTb3VyY2VPblJvd0RyYWdQYXJhbXMsXG4gICAgRWRpdGFibGVDYWxsYmFjayxcbiAgICBHZXRRdWlja0ZpbHRlclRleHRQYXJhbXMsXG4gICAgSGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjayxcbiAgICBIZWFkZXJDbGFzcyxcbiAgICBIZWFkZXJWYWx1ZUdldHRlckZ1bmMsXG4gICAgSUFnZ0Z1bmMsXG4gICAgSUNlbGxSZW5kZXJlckNvbXAsXG4gICAgSUNlbGxSZW5kZXJlckZ1bmMsXG4gICAgSVJvd0RyYWdJdGVtLFxuICAgIElUb29sdGlwUGFyYW1zLFxuICAgIEtleUNyZWF0b3JQYXJhbXMsXG4gICAgTmV3VmFsdWVQYXJhbXMsXG4gICAgUm93RHJhZ0NhbGxiYWNrLFxuICAgIFJvd05vZGUsXG4gICAgUm93U3BhblBhcmFtcyxcbiAgICBTdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnRQYXJhbXMsXG4gICAgU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zLFxuICAgIFN1cHByZXNzTmF2aWdhYmxlQ2FsbGJhY2ssXG4gICAgU3VwcHJlc3NQYXN0ZUNhbGxiYWNrLFxuICAgIFRvb2xQYW5lbENsYXNzLFxuICAgIFZhbHVlRm9ybWF0dGVyRnVuYyxcbiAgICBWYWx1ZUdldHRlckZ1bmMsXG4gICAgVmFsdWVQYXJzZXJGdW5jLFxuICAgIFZhbHVlU2V0dGVyRnVuY1xufSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcbi8vIEBFTkRfSU1QT1JUU0BcbmltcG9ydCB7IENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBJbnB1dCwgUXVlcnlMaXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhZy1ncmlkLWNvbHVtbicsXG4gICAgdGVtcGxhdGU6ICcnXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZENvbHVtbjxURGF0YSA9IGFueT4ge1xuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPjtcblxuICAgIHB1YmxpYyBoYXNDaGlsZENvbHVtbnMoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmNoaWxkQ29sdW1ucyAmJiB0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgcmV0dXJuICEodGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID09PSAxICYmIHRoaXMuY2hpbGRDb2x1bW5zLmZpcnN0ID09PSB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHRvQ29sRGVmKCk6IENvbERlZiB7XG4gICAgICAgIGxldCBjb2xEZWY6IENvbERlZiA9IHRoaXMuY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4odGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQ2hpbGRDb2x1bW5zKCkpIHtcbiAgICAgICAgICAgICg8YW55PmNvbERlZilbXCJjaGlsZHJlblwiXSA9IHRoaXMuZ2V0Q2hpbGRDb2xEZWZzKHRoaXMuY2hpbGRDb2x1bW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2hpbGRDb2xEZWZzKGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj4pIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkQ29sdW1uc1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIC5maWx0ZXIoY29sdW1uID0+ICFjb2x1bW4uaGFzQ2hpbGRDb2x1bW5zKCkpXG4gICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4oZnJvbTogQWdHcmlkQ29sdW1uKTogQ29sRGVmIHtcbiAgICAgICAgbGV0IHsgY2hpbGRDb2x1bW5zLCAuLi5jb2xEZWYgfSA9IGZyb207XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfVxuXG4gICAgLy8gaW5wdXRzIC0gcHJldHR5IG11Y2ggbW9zdCBvZiBDb2xEZWYsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwgYW5kIGludGVybmFsIG9ubHkgcHJvcGVydGllc1xuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyRnJhbWV3b3JrOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXI6IGFueTtcbiAgICAvKiogVGhlIG5hbWUgdG8gcmVuZGVyIGluIHRoZSBjb2x1bW4gaGVhZGVyLiBJZiBub3Qgc3BlY2lmaWVkIGFuZCBmaWVsZCBpcyBzcGVjaWZpZWQsIHRoZSBmaWVsZCBuYW1lIHdpbGwgYmUgdXNlZCBhcyB0aGUgaGVhZGVyIG5hbWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIEdldHMgdGhlIHZhbHVlIGZvciBkaXNwbGF5IGluIHRoZSBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJWYWx1ZUdldHRlcjogc3RyaW5nIHwgSGVhZGVyVmFsdWVHZXR0ZXJGdW5jPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogVG9vbHRpcCBmb3IgdGhlIGNvbHVtbiBoZWFkZXIgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlclRvb2x0aXA6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzIHRvIHVzZSBmb3IgdGhlIGhlYWRlciBjZWxsLiBDYW4gYmUgYSBzdHJpbmcsIGFycmF5IG9mIHN0cmluZ3MsIG9yIGZ1bmN0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2xhc3M6IEhlYWRlckNsYXNzIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTdXBwcmVzcyB0aGUgZ3JpZCB0YWtpbmcgYWN0aW9uIGZvciB0aGUgcmVsZXZhbnQga2V5Ym9hcmQgZXZlbnQgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50OiAoKHBhcmFtczogU3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZXRoZXIgdG8gc2hvdyB0aGUgY29sdW1uIHdoZW4gdGhlIGdyb3VwIGlzIG9wZW4gLyBjbG9zZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cFNob3c6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzIHRvIHVzZSBmb3IgdGhlIHRvb2wgcGFuZWwgY2VsbC4gQ2FuIGJlIGEgc3RyaW5nLCBhcnJheSBvZiBzdHJpbmdzLCBvciBmdW5jdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbENsYXNzOiBUb29sUGFuZWxDbGFzczxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIG9yIGdyb3VwIHRvIGFwcGVhciBpbiB0aGUgQ29sdW1ucyBUb29sIFBhbmVsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIChmaWx0ZXIpIG9yIGdyb3VwIChmaWx0ZXIgZ3JvdXApIHRvIGFwcGVhciBpbiB0aGUgRmlsdGVycyBUb29sIFBhbmVsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbHRlcnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgeW91ciBvd24gdG9vbHRpcCBjb21wb25lbnQgZm9yIHRoZSBjb2x1bW4uXG4gICAgICogU2VlIFtUb29sdGlwIENvbXBvbmVudF0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LXRvb2x0aXAvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50OiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGB0b29sdGlwQ29tcG9uZW50YCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFRoZSBwYXJhbXMgdXNlZCB0byBjb25maWd1cmUgYHRvb2x0aXBDb21wb25lbnRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudFBhcmFtczogYW55O1xuICAgIC8qKiBBIGxpc3QgY29udGFpbmluZyBhIG1peCBvZiBjb2x1bW5zIGFuZCBjb2x1bW4gZ3JvdXBzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hpbGRyZW46IChDb2xEZWY8VERhdGE+IHwgQ29sR3JvdXBEZWY8VERhdGE+KVtdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgdW5pcXVlIElEIHRvIGdpdmUgdGhlIGNvbHVtbi4gVGhpcyBpcyBvcHRpb25hbC4gSWYgbWlzc2luZywgYSB1bmlxdWUgSUQgd2lsbCBiZSBnZW5lcmF0ZWQuIFRoaXMgSUQgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgY29sdW1uIGdyb3VwIGluIHRoZSBjb2x1bW4gQVBJLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHRoaXMgZ3JvdXAgc2hvdWxkIGJlIG9wZW5lZCBieSBkZWZhdWx0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvcGVuQnlEZWZhdWx0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgY29sdW1ucyBpbiB0aGlzIGdyb3VwIGJlc2lkZSBlYWNoIG90aGVyIGluIHRoZSBncmlkLiBNb3ZpbmcgdGhlIGNvbHVtbnMgb3V0c2lkZSBvZiB0aGUgZ3JvdXAgKGFuZCBoZW5jZSBicmVha2luZyB0aGUgZ3JvdXApIGlzIG5vdCBhbGxvd2VkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXJyeUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgY3VzdG9tIGhlYWRlciBncm91cCBjb21wb25lbnQgdG8gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQgaGVhZGVyLiBJZiBub25lIHNwZWNpZmllZCB0aGUgZGVmYXVsdCBBRyBHcmlkIGlzIHVzZWQuXG4gICAgICogU2VlIFtIZWFkZXIgR3JvdXAgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtaGVhZGVyLyNoZWFkZXItZ3JvdXAtY29tcG9uZW50cy8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50OiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBoZWFkZXJHcm91cENvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICAvKiogVGhlIHBhcmFtcyB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgYGhlYWRlckdyb3VwQ29tcG9uZW50YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgLyoqIFRoZSB1bmlxdWUgSUQgdG8gZ2l2ZSB0aGUgY29sdW1uLiBUaGlzIGlzIG9wdGlvbmFsLiBJZiBtaXNzaW5nLCB0aGUgSUQgd2lsbCBkZWZhdWx0IHRvIHRoZSBmaWVsZC5cbiAgICAgKiBJZiBib3RoIGZpZWxkIGFuZCBjb2xJZCBhcmUgbWlzc2luZywgYSB1bmlxdWUgSUQgd2lsbCBiZSBnZW5lcmF0ZWQuXG4gICAgICogVGhpcyBJRCBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSBjb2x1bW4gaW4gdGhlIEFQSSBmb3Igc29ydGluZywgZmlsdGVyaW5nIGV0Yy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbElkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBmaWVsZCBvZiB0aGUgcm93IG9iamVjdCB0byBnZXQgdGhlIGNlbGwncyBkYXRhIGZyb20uXG4gICAgICogRGVlcCByZWZlcmVuY2VzIGludG8gYSByb3cgb2JqZWN0IGlzIHN1cHBvcnRlZCB2aWEgZG90IG5vdGF0aW9uLCBpLmUgYCdhZGRyZXNzLmZpcnN0TGluZSdgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmllbGQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MgY29udGFpbmluZyBgQ29sdW1uVHlwZWAga2V5cyB3aGljaCBjYW4gYmUgdXNlZCBhcyBhIHRlbXBsYXRlIGZvciBhIGNvbHVtbi5cbiAgICAgKiBUaGlzIGhlbHBzIHRvIHJlZHVjZSBkdXBsaWNhdGlvbiBvZiBwcm9wZXJ0aWVzIHdoZW4geW91IGhhdmUgYSBsb3Qgb2YgY29tbW9uIGNvbHVtbiBwcm9wZXJ0aWVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHlwZTogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIEdldHMgdGhlIHZhbHVlIGZyb20geW91ciBkYXRhIGZvciBkaXNwbGF5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVHZXR0ZXI6IHN0cmluZyB8IFZhbHVlR2V0dGVyRnVuYzxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZnVuY3Rpb24gb3IgZXhwcmVzc2lvbiB0byBmb3JtYXQgYSB2YWx1ZSwgc2hvdWxkIHJldHVybiBhIHN0cmluZy4gTm90IHVzZWQgZm9yIENTViBleHBvcnQgb3IgY29weSB0byBjbGlwYm9hcmQsIG9ubHkgZm9yIFVJIGNlbGwgcmVuZGVyaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVGb3JtYXR0ZXI6IHN0cmluZyB8IFZhbHVlRm9ybWF0dGVyRnVuYzxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGVkIGEgcmVmZXJlbmNlIGRhdGEgbWFwIHRvIGJlIHVzZWQgdG8gbWFwIGNvbHVtbiB2YWx1ZXMgdG8gdGhlaXIgcmVzcGVjdGl2ZSB2YWx1ZSBmcm9tIHRoZSBtYXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZWZEYXRhOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZzsgfSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gdG8gcmV0dXJuIGEgc3RyaW5nIGtleSBmb3IgYSB2YWx1ZS5cbiAgICAgKiBUaGlzIHN0cmluZyBpcyB1c2VkIGZvciBncm91cGluZywgU2V0IGZpbHRlcmluZywgYW5kIHNlYXJjaGluZyB3aXRoaW4gY2VsbCBlZGl0b3IgZHJvcGRvd25zLlxuICAgICAqIFdoZW4gZmlsdGVyaW5nIGFuZCBzZWFyY2hpbmcgdGhlIHN0cmluZyBpcyBleHBvc2VkIHRvIHRoZSB1c2VyLCBzbyBtYWtlIHN1cmUgdG8gcmV0dXJuIGEgaHVtYW4tcmVhZGFibGUgdmFsdWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZXlDcmVhdG9yOiAoKHBhcmFtczogS2V5Q3JlYXRvclBhcmFtczxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbSBjb21wYXJhdG9yIGZvciB2YWx1ZXMsIHVzZWQgYnkgcmVuZGVyZXIgdG8ga25vdyBpZiB2YWx1ZXMgaGF2ZSBjaGFuZ2VkLiBDZWxscyB3aG8ncyB2YWx1ZXMgaGF2ZSBub3QgY2hhbmdlZCBkb24ndCBnZXQgcmVmcmVzaGVkLlxuICAgICAqIEJ5IGRlZmF1bHQgdGhlIGdyaWQgdXNlcyBgPT09YCBpcyB1c2VkIHdoaWNoIHNob3VsZCB3b3JrIGZvciBtb3N0IHVzZSBjYXNlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVxdWFsczogKCh2YWx1ZUE6IGFueSwgdmFsdWVCOiBhbnkpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZmllbGQgb2YgdGhlIHRvb2x0aXAgdG8gYXBwbHkgdG8gdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwRmllbGQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdGhhdCBzaG91bGQgcmV0dXJuIHRoZSBzdHJpbmcgdG8gdXNlIGZvciBhIHRvb2x0aXAsIGB0b29sdGlwRmllbGRgIHRha2VzIHByZWNlZGVuY2UgaWYgc2V0LlxuICAgICAqIElmIHVzaW5nIGEgY3VzdG9tIGB0b29sdGlwQ29tcG9uZW50YCB5b3UgbWF5IHJldHVybiBhbnkgY3VzdG9tIHZhbHVlIHRvIGJlIHBhc3NlZCB0byB5b3VyIHRvb2x0aXAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFZhbHVlR2V0dGVyOiAoKHBhcmFtczogSVRvb2x0aXBQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmcgfCBhbnkpIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIChvciByZXR1cm4gYHRydWVgIGZyb20gZnVuY3Rpb24pIHRvIHJlbmRlciBhIHNlbGVjdGlvbiBjaGVja2JveCBpbiB0aGUgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IENoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2s8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGRpc3BsYXkgYSBkaXNhYmxlZCBjaGVja2JveCB3aGVuIHJvdyBpcyBub3Qgc2VsZWN0YWJsZSBhbmQgY2hlY2tib3hlcyBhcmUgZW5hYmxlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd0Rpc2FibGVkQ2hlY2tib3hlczogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWNvbnMgdG8gdXNlIGluc2lkZSB0aGUgY29sdW1uIGluc3RlYWQgb2YgdGhlIGdyaWQncyBkZWZhdWx0IGljb25zLiBMZWF2ZSB1bmRlZmluZWQgdG8gdXNlIGRlZmF1bHRzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfCBzdHJpbmc7IH0gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBjb2x1bW4gaXMgbm90IG5hdmlnYWJsZSAoaS5lLiBjYW5ub3QgYmUgdGFiYmVkIGludG8pLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICAgKiBDYW4gYWxzbyBiZSBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGhhdmUgZGlmZmVyZW50IHJvd3MgbmF2aWdhYmxlLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTmF2aWdhYmxlOiBib29sZWFuIHwgU3VwcHJlc3NOYXZpZ2FibGVDYWxsYmFjazxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB0aGUgdXNlciB0byBzdXBwcmVzcyBjZXJ0YWluIGtleWJvYXJkIGV2ZW50cyBpbiB0aGUgZ3JpZCBjZWxsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6ICgocGFyYW1zOiBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogUGFzdGluZyBpcyBvbiBieSBkZWZhdWx0IGFzIGxvbmcgYXMgY2VsbHMgYXJlIGVkaXRhYmxlIChub24tZWRpdGFibGUgY2VsbHMgY2Fubm90IGJlIG1vZGlmaWVkLCBldmVuIHdpdGggYSBwYXN0ZSBvcGVyYXRpb24pLlxuICAgICAqIFNldCB0byBgdHJ1ZWAgdHVybiBwYXN0ZSBvcGVyYXRpb25zIG9mZi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFzdGU6IGJvb2xlYW4gfCBTdXBwcmVzc1Bhc3RlQ2FsbGJhY2s8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBwcmV2ZW50IHRoZSBmaWxsSGFuZGxlIGZyb20gYmVpbmcgcmVuZGVyZWQgaW4gYW55IGNlbGwgdGhhdCBiZWxvbmdzIHRvIHRoaXMgY29sdW1uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbGxIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgZm9yIHRoaXMgY29sdW1uIHRvIGJlIGhpZGRlbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgaGlkZWAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEhpZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYmxvY2sgbWFraW5nIGNvbHVtbiB2aXNpYmxlIC8gaGlkZGVuIHZpYSB0aGUgVUkgKEFQSSB3aWxsIHN0aWxsIHdvcmspLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrVmlzaWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogTG9jayBhIGNvbHVtbiB0byBwb3NpdGlvbiB0byBgJ2xlZnQnYCBvcmAncmlnaHQnYCB0byBhbHdheXMgaGF2ZSB0aGlzIGNvbHVtbiBkaXNwbGF5ZWQgaW4gdGhhdCBwb3NpdGlvbi4gdHJ1ZSBpcyB0cmVhdGVkIGFzIGAnbGVmdCdgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUG9zaXRpb246IGJvb2xlYW4gfCAnbGVmdCcgfCAncmlnaHQnIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiB0byBiZSBtb3ZhYmxlIHZpYSBkcmFnZ2luZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHRoaXMgY29sdW1uIGlzIGVkaXRhYmxlLCBvdGhlcndpc2UgYGZhbHNlYC4gQ2FuIGFsc28gYmUgYSBmdW5jdGlvbiB0byBoYXZlIGRpZmZlcmVudCByb3dzIGVkaXRhYmxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlZGl0YWJsZTogYm9vbGVhbiB8IEVkaXRhYmxlQ2FsbGJhY2s8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBTZXRzIHRoZSB2YWx1ZSBpbnRvIHlvdXIgZGF0YSBmb3Igc2F2aW5nLiBSZXR1cm4gYHRydWVgIGlmIHRoZSBkYXRhIGNoYW5nZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZVNldHRlcjogc3RyaW5nIHwgVmFsdWVTZXR0ZXJGdW5jPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gUGFyc2VzIHRoZSB2YWx1ZSBmb3Igc2F2aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVQYXJzZXI6IHN0cmluZyB8IFZhbHVlUGFyc2VyRnVuYzxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgeW91ciBvd24gY2VsbCBlZGl0b3IgY29tcG9uZW50IGZvciB0aGlzIGNvbHVtbidzIGNlbGxzLlxuICAgICAqIFNlZSBbQ2VsbCBFZGl0b3JdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1jZWxsLWVkaXRvci8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvcjogYW55O1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgY2VsbEVkaXRvcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvckZyYW1ld29yazogYW55O1xuICAgIC8qKiBQYXJhbXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBgY2VsbEVkaXRvcmAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBhcmFtczogYW55O1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggY2VsbCBlZGl0b3IgdG8gYmUgdXNlZCBmb3IgYSBnaXZlbiByb3cgd2l0aGluIHRoZSBzYW1lIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JTZWxlY3RvcjogQ2VsbEVkaXRvclNlbGVjdG9yRnVuYzxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBjZWxscyB1bmRlciB0aGlzIGNvbHVtbiBlbnRlciBlZGl0IG1vZGUgYWZ0ZXIgc2luZ2xlIGNsaWNrLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHVzZSBgdmFsdWVTZXR0ZXJgIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmV3VmFsdWVIYW5kbGVyOiAoKHBhcmFtczogTmV3VmFsdWVQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCwgdG8gaGF2ZSB0aGUgY2VsbCBlZGl0b3IgYXBwZWFyIGluIGEgcG9wdXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUG9wdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGUgcG9zaXRpb24gZm9yIHRoZSBwb3B1cCBjZWxsIGVkaXRvci4gUG9zc2libGUgdmFsdWVzIGFyZVxuICAgICAqICAgLSBgb3ZlcmAgUG9wdXAgd2lsbCBiZSBwb3NpdGlvbmVkIG92ZXIgdGhlIGNlbGxcbiAgICAgKiAgIC0gYHVuZGVyYCBQb3B1cCB3aWxsIGJlIHBvc2l0aW9uZWQgYmVsb3cgdGhlIGNlbGwgbGVhdmluZyB0aGUgY2VsbCB2YWx1ZSB2aXNpYmxlLlxuICAgICAqIFxuICAgICAqIERlZmF1bHQ6IGBvdmVyYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JQb3B1cFBvc2l0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGZvciBhZnRlciB0aGUgdmFsdWUgb2YgYSBjZWxsIGhhcyBjaGFuZ2VkLCBlaXRoZXIgZHVlIHRvIGVkaXRpbmcgb3IgdGhlIGFwcGxpY2F0aW9uIGNhbGxpbmcgYGFwaS5zZXRWYWx1ZSgpYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbFZhbHVlQ2hhbmdlZDogKChldmVudDogTmV3VmFsdWVQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDbGlja2VkOiAoKGV2ZW50OiBDZWxsQ2xpY2tlZEV2ZW50PFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIGEgY2VsbCBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbERvdWJsZUNsaWNrZWQ6ICgoZXZlbnQ6IENlbGxEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIHJpZ2h0IGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDb250ZXh0TWVudTogKChldmVudDogQ2VsbENvbnRleHRNZW51RXZlbnQ8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBmdW5jdGlvbiB0byB0ZWxsIHRoZSBncmlkIHdoYXQgcXVpY2sgZmlsdGVyIHRleHQgdG8gdXNlIGZvciB0aGlzIGNvbHVtbiBpZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgKHdoaWNoIGlzIGNhbGxpbmcgYHRvU3RyaW5nYCBvbiB0aGUgdmFsdWUpLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0UXVpY2tGaWx0ZXJUZXh0OiAoKHBhcmFtczogR2V0UXVpY2tGaWx0ZXJUZXh0UGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gR2V0cyB0aGUgdmFsdWUgZm9yIGZpbHRlcmluZyBwdXJwb3Nlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlclZhbHVlR2V0dGVyOiBzdHJpbmcgfCBWYWx1ZUdldHRlckZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBXaGV0aGVyIHRvIGRpc3BsYXkgYSBmbG9hdGluZyBmaWx0ZXIgZm9yIHRoaXMgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZW5hYmxlZCB0aGVuIGNvbHVtbiBoZWFkZXIgbmFtZXMgdGhhdCBhcmUgdG9vIGxvbmcgZm9yIHRoZSBjb2x1bW4gd2lkdGggd2lsbCB3cmFwIG9udG8gdGhlIG5leHQgbGluZS4gRGVmYXVsdCBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3cmFwSGVhZGVyVGV4dDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZW5hYmxlZCB0aGVuIHRoZSBjb2x1bW4gaGVhZGVyIHJvdyB3aWxsIGF1dG9tYXRpY2FsbHkgYWRqdXN0IGhlaWdodCB0byBhY29tbW9kYXRlIHRoZSBzaXplIG9mIHRoZSBoZWFkZXIgY2VsbC5cbiAgICAgKiBUaGlzIGNhbiBiZSB1c2VmdWwgd2hlbiB1c2luZyB5b3VyIG93biBgaGVhZGVyQ29tcG9uZW50YCBvciBsb25nIGhlYWRlciBuYW1lcyBpbiBjb25qdW5jdGlvbiB3aXRoIGB3cmFwSGVhZGVyVGV4dGAuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0hlYWRlckhlaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGN1c3RvbSBoZWFkZXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlci4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBoZWFkZXIgY29tcG9uZW50IGlzIHVzZWQuXG4gICAgICogU2VlIFtIZWFkZXIgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtaGVhZGVyLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnQ6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGhlYWRlckNvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIFRoZSBwYXJhbWV0ZXJzIHRvIGJlIHBhc3NlZCB0byB0aGUgYGhlYWRlckNvbXBvbmVudGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICAvKiogU2V0IHRvIGFuIGFycmF5IGNvbnRhaW5pbmcgemVybywgb25lIG9yIG1hbnkgb2YgdGhlIGZvbGxvd2luZyBvcHRpb25zOiBgJ2ZpbHRlck1lbnVUYWInIHwgJ2dlbmVyYWxNZW51VGFiJyB8ICdjb2x1bW5zTWVudVRhYidgLlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBmaWd1cmUgb3V0IHdoaWNoIG1lbnUgdGFicyBhcmUgcHJlc2VudCBhbmQgaW4gd2hpY2ggb3JkZXIgdGhlIHRhYnMgYXJlIHNob3duLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWVudVRhYnM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQYXJhbXMgdXNlZCB0byBjaGFuZ2UgdGhlIGJlaGF2aW91ciBhbmQgYXBwZWFyYW5jZSBvZiB0aGUgQ29sdW1ucyBNZW51IHRhYi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbnNNZW51UGFyYW1zOiBDb2x1bW5zTWVudVBhcmFtcyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiBubyBtZW51IHNob3VsZCBiZSBzaG93biBmb3IgdGhpcyBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCBvciB0aGUgY2FsbGJhY2sgcmV0dXJucyBgdHJ1ZWAsIGEgJ3NlbGVjdCBhbGwnIGNoZWNrYm94IHdpbGwgYmUgcHV0IGludG8gdGhlIGhlYWRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgSGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjazxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGhlYWRlciBjaGVja2JveCBzZWxlY3Rpb24gd2lsbCBvbmx5IHNlbGVjdCBmaWx0ZXJlZCBpdGVtcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBEZWZpbmVzIHRoZSBjaGFydCBkYXRhIHR5cGUgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgYSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydERhdGFUeXBlOiAnY2F0ZWdvcnknIHwgJ3NlcmllcycgfCAndGltZScgfCAnZXhjbHVkZWQnIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBQaW4gYSBjb2x1bW4gdG8gb25lIHNpZGU6IGByaWdodGAgb3IgYGxlZnRgLiBBIHZhbHVlIG9mIGB0cnVlYCBpcyBjb252ZXJ0ZWQgdG8gYCdsZWZ0J2AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWQ6IGJvb2xlYW4gfCAnbGVmdCcgfCAncmlnaHQnIHwgbnVsbCB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcGlubmVkYCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGlubmVkOiBib29sZWFuIHwgJ2xlZnQnIHwgJ3JpZ2h0JyB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gYmxvY2sgdGhlIHVzZXIgcGlubmluZyB0aGUgY29sdW1uLCB0aGUgY29sdW1uIGNhbiBvbmx5IGJlIHBpbm5lZCB2aWEgZGVmaW5pdGlvbnMgb3IgQVBJLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUGlubmVkOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgY2VsbFJlbmRlcmVyU2VsZWN0b3IgaWYgeW91IHdhbnQgYSBkaWZmZXJlbnQgQ2VsbCBSZW5kZXJlciBmb3IgcGlubmVkIHJvd3MuIENoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyQ29tcDsgfSB8IElDZWxsUmVuZGVyZXJGdW5jIHwgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgY2VsbFJlbmRlcmVyU2VsZWN0b3IgaWYgeW91IHdhbnQgYSBkaWZmZXJlbnQgQ2VsbCBSZW5kZXJlciBmb3IgcGlubmVkIHJvd3MuIENoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJQYXJhbXM6IGFueTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIHZhbHVlRm9ybWF0dGVyIGZvciBwaW5uZWQgcm93cywgYW5kIGNoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93VmFsdWVGb3JtYXR0ZXI6IHN0cmluZyB8IFZhbHVlRm9ybWF0dGVyRnVuYzxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIHBpdm90IGJ5IHRoaXMgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHBpdm90YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIGluIGNvbHVtbnMgeW91IHdhbnQgdG8gcGl2b3QgYnkuXG4gICAgICogSWYgb25seSBwaXZvdGluZyBieSBvbmUgY29sdW1uLCBzZXQgdGhpcyB0byBhbnkgbnVtYmVyIChlLmcuIGAwYCkuXG4gICAgICogSWYgcGl2b3RpbmcgYnkgbXVsdGlwbGUgY29sdW1ucywgc2V0IHRoaXMgdG8gd2hlcmUgeW91IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgaW4gdGhlIG9yZGVyIG9mIHBpdm90cyAoZS5nLiBgMGAgZm9yIGZpcnN0LCBgMWAgZm9yIHNlY29uZCwgYW5kIHNvIG9uKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90SW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHBpdm90SW5kZXhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgdG8gdXNlIHdoZW4gb3JkZXJpbmcgdGhlIHBpdm90IGNvbHVtbnMsIHdoZW4gdGhpcyBjb2x1bW4gaXMgdXNlZCB0byBwaXZvdCBvbi5cbiAgICAgKiBUaGUgdmFsdWVzIHdpbGwgYWx3YXlzIGJlIHN0cmluZ3MsIGFzIHRoZSBwaXZvdCBzZXJ2aWNlIHVzZXMgc3RyaW5ncyBhcyBrZXlzIGZvciB0aGUgcGl2b3QgZ3JvdXBzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb21wYXJhdG9yOiAoKHZhbHVlQTogc3RyaW5nLCB2YWx1ZUI6IHN0cmluZykgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIHBpdm90IGJ5IHRoaXMgY29sdW1uIHZpYSB0aGUgR1VJLiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgcGl2b3QuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVBpdm90OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3Qgb2YgY3NzIHZhbHVlcyAvIG9yIGZ1bmN0aW9uIHJldHVybmluZyBhbiBvYmplY3Qgb2YgY3NzIHZhbHVlcyBmb3IgYSBwYXJ0aWN1bGFyIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsU3R5bGU6IENlbGxTdHlsZSB8IENlbGxTdHlsZUZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBDbGFzcyB0byB1c2UgZm9yIHRoZSBjZWxsLiBDYW4gYmUgc3RyaW5nLCBhcnJheSBvZiBzdHJpbmdzLCBvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCBDZWxsQ2xhc3NGdW5jPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogUnVsZXMgd2hpY2ggY2FuIGJlIGFwcGxpZWQgdG8gaW5jbHVkZSBjZXJ0YWluIENTUyBjbGFzc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzUnVsZXM6IENlbGxDbGFzc1J1bGVzPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBjZWxsIFJlbmRlcmVyIGNvbXBvbmVudCBmb3IgdGhpcyBjb2x1bW4ncyBjZWxscy5cbiAgICAgKiBTZWUgW0NlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1jZWxsLXJlbmRlcmVyLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyOiBhbnk7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBjZWxsUmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlckZyYW1ld29yazogYW55O1xuICAgIC8qKiBQYXJhbXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBgY2VsbFJlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJQYXJhbXM6IGFueTtcbiAgICAvKiogQ2FsbGJhY2sgdG8gc2VsZWN0IHdoaWNoIGNlbGwgcmVuZGVyZXIgdG8gYmUgdXNlZCBmb3IgYSBnaXZlbiByb3cgd2l0aGluIHRoZSBzYW1lIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclNlbGVjdG9yOiBDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGdyaWQgY2FsY3VsYXRlIHRoZSBoZWlnaHQgb2YgYSByb3cgYmFzZWQgb24gY29udGVudHMgb2YgdGhpcyBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGF1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgdGV4dCB3cmFwIGluc2lkZSB0aGUgY2VsbCAtIHR5cGljYWxseSB1c2VkIHdpdGggYGF1dG9IZWlnaHRgLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3cmFwVGV4dDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBmbGFzaCBhIGNlbGwgd2hlbiBpdCdzIHJlZnJlc2hlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHByZXZlbnQgdGhpcyBjb2x1bW4gZnJvbSBmbGFzaGluZyBvbiBjaGFuZ2VzLiBPbmx5IGFwcGxpY2FibGUgaWYgY2VsbCBmbGFzaGluZyBpcyB0dXJuZWQgb24gZm9yIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGbGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogYGJvb2xlYW5gIG9yIGBGdW5jdGlvbmAuIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gYWxsb3cgcm93IGRyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnOiBib29sZWFuIHwgUm93RHJhZ0NhbGxiYWNrPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gYSBzdHJpbmcgdG8gYmUgZGlzcGxheWVkIGJ5IHRoZSBgcm93RHJhZ0NvbXBgIHdoaWxlIGRyYWdnaW5nIGEgcm93LlxuICAgICAqIElmIHRoaXMgY2FsbGJhY2sgaXMgbm90IHNldCwgdGhlIGByb3dEcmFnVGV4dGAgY2FsbGJhY2sgaW4gdGhlIGBncmlkT3B0aW9uc2Agd2lsbCBiZSB1c2VkIGFuZFxuICAgICAqIGlmIHRoZXJlIGlzIG5vIGNhbGxiYWNrIGluIHRoZSBgZ3JpZE9wdGlvbnNgIHRoZSBjdXJyZW50IGNlbGwgdmFsdWUgd2lsbCBiZSB1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ1RleHQ6ICgocGFyYW1zOiBJUm93RHJhZ0l0ZW0sIGRyYWdJdGVtQ291bnQ6IG51bWJlcikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogYGJvb2xlYW5gIG9yIGBGdW5jdGlvbmAuIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gYWxsb3cgZHJhZ2dpbmcgZm9yIG5hdGl2ZSBkcmFnIGFuZCBkcm9wLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2U6IGJvb2xlYW4gfCBEbmRTb3VyY2VDYWxsYmFjazxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIHRvIGFsbG93IGN1c3RvbSBkcmFnIGZ1bmN0aW9uYWxpdHkgZm9yIG5hdGl2ZSBkcmFnIGFuZCBkcm9wLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG5kU291cmNlT25Sb3dEcmFnOiAoKHBhcmFtczogRG5kU291cmNlT25Sb3dEcmFnUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gcm93IGdyb3VwIGJ5IHRoaXMgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgcm93R3JvdXBgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgaW4gY29sdW1ucyB5b3Ugd2FudCB0byBncm91cCBieS5cbiAgICAgKiBJZiBvbmx5IGdyb3VwaW5nIGJ5IG9uZSBjb2x1bW4sIHNldCB0aGlzIHRvIGFueSBudW1iZXIgKGUuZy4gYDBgKS5cbiAgICAgKiBJZiBncm91cGluZyBieSBtdWx0aXBsZSBjb2x1bW5zLCBzZXQgdGhpcyB0byB3aGVyZSB5b3Ugd2FudCB0aGlzIGNvbHVtbiB0byBiZSBpbiB0aGUgZ3JvdXAgKGUuZy4gYDBgIGZvciBmaXJzdCwgYDFgIGZvciBzZWNvbmQsIGFuZCBzbyBvbikuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cEluZGV4OiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGByb3dHcm91cEluZGV4YCwgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUm93R3JvdXBJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRvIGJlIGFibGUgdG8gcm93IGdyb3VwIGJ5IHRoaXMgY29sdW1uIHZpYSB0aGUgR1VJLlxuICAgICAqIFRoaXMgd2lsbCBub3QgYmxvY2sgdGhlIEFQSSBvciBwcm9wZXJ0aWVzIGJlaW5nIHVzZWQgdG8gYWNoaWV2ZSByb3cgZ3JvdXBpbmcuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUm93R3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdG8gYmUgYWJsZSB0byBhZ2dyZWdhdGUgYnkgdGhpcyBjb2x1bW4gdmlhIHRoZSBHVUkuXG4gICAgICogVGhpcyB3aWxsIG5vdCBibG9jayB0aGUgQVBJIG9yIHByb3BlcnRpZXMgYmVpbmcgdXNlZCB0byBhY2hpZXZlIGFnZ3JlZ2F0aW9uLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVZhbHVlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBOYW1lIG9mIGZ1bmN0aW9uIHRvIHVzZSBmb3IgYWdncmVnYXRpb24uIFlvdSBjYW4gYWxzbyBwcm92aWRlIHlvdXIgb3duIGFnZyBmdW5jdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmM6IHN0cmluZyB8IElBZ2dGdW5jPFREYXRhPiB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYGFnZ0Z1bmNgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxBZ2dGdW5jOiBzdHJpbmcgfCBJQWdnRnVuYzxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBuYW1lIG9mIHRoZSBhZ2dyZWdhdGlvbiBmdW5jdGlvbiB0byB1c2UgZm9yIHRoaXMgY29sdW1uIHdoZW4gaXQgaXMgZW5hYmxlZCB2aWEgdGhlIEdVSS5cbiAgICAgKiBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdCBpbW1lZGlhdGVseSBhcHBseSB0aGUgYWdncmVnYXRpb24gZnVuY3Rpb24gbGlrZSBgYWdnRnVuY2BcbiAgICAgKiBEZWZhdWx0OiBgc3VtYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEFnZ0Z1bmM6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAvKiogQWdncmVnYXRpb24gZnVuY3Rpb25zIGFsbG93ZWQgb24gdGhpcyBjb2x1bW4gZS5nLiBgWydzdW0nLCAnYXZnJ11gLlxuICAgICAqIElmIG1pc3NpbmcsIGFsbCBpbnN0YWxsZWQgZnVuY3Rpb25zIGFyZSBhbGxvd2VkLlxuICAgICAqIFRoaXMgd2lsbCBvbmx5IHJlc3RyaWN0IHdoYXQgdGhlIEdVSSBhbGxvd3MgYSB1c2VyIHRvIHNlbGVjdCwgaXQgZG9lcyBub3QgaW1wYWN0IHdoZW4geW91IHNldCBhIGZ1bmN0aW9uIHZpYSB0aGUgQVBJLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dlZEFnZ0Z1bmNzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gaGF2ZSB0aGUgZ3JpZCBwbGFjZSB0aGUgdmFsdWVzIGZvciB0aGUgZ3JvdXAgaW50byB0aGUgY2VsbCwgb3IgcHV0IHRoZSBuYW1lIG9mIGEgZ3JvdXBlZCBjb2x1bW4gdG8ganVzdCBzaG93IHRoYXQgZ3JvdXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93Um93R3JvdXA6IHN0cmluZyB8IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgc29ydGluZyBvbiB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGFibGU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIElmIHNvcnRpbmcgYnkgZGVmYXVsdCwgc2V0IGl0IGhlcmUuIFNldCB0byBgYXNjYCBvciBgZGVzY2AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0OiAnYXNjJyB8ICdkZXNjJyB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHNvcnRgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTb3J0OiAnYXNjJyB8ICdkZXNjJyB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgLyoqIElmIHNvcnRpbmcgbW9yZSB0aGFuIG9uZSBjb2x1bW4gYnkgZGVmYXVsdCwgc3BlY2lmaWVzIG9yZGVyIGluIHdoaWNoIHRoZSBzb3J0aW5nIHNob3VsZCBiZSBhcHBsaWVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydEluZGV4OiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBzb3J0SW5kZXhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTb3J0SW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogQXJyYXkgZGVmaW5pbmcgdGhlIG9yZGVyIGluIHdoaWNoIHNvcnRpbmcgb2NjdXJzIChpZiBzb3J0aW5nIGlzIGVuYWJsZWQpLiBBbiBhcnJheSB3aXRoIGFueSBvZiB0aGUgZm9sbG93aW5nIGluIGFueSBvcmRlciBgWydhc2MnLCdkZXNjJyxudWxsXWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlcjogKCdhc2MnIHwgJ2Rlc2MnIHwgbnVsbClbXSB8IHVuZGVmaW5lZDtcbiAgICAvKiogT3ZlcnJpZGUgdGhlIGRlZmF1bHQgc29ydGluZyBvcmRlciBieSBwcm92aWRpbmcgYSBjdXN0b20gc29ydCBjb21wYXJhdG9yLiBcbiAgICAgKiBcbiAgICAgKiAtIGB2YWx1ZUFgLCBgdmFsdWVCYCBhcmUgdGhlIHZhbHVlcyB0byBjb21wYXJlLlxuICAgICAqIC0gYG5vZGVBYCwgIGBub2RlQmAgYXJlIHRoZSBjb3JyZXNwb25kaW5nIFJvd05vZGVzLiBVc2VmdWwgaWYgYWRkaXRpb25hbCBkZXRhaWxzIGFyZSByZXF1aXJlZCBieSB0aGUgc29ydC5cbiAgICAgKiAtIGBpc0Rlc2NlbmRpbmdgIC0gYHRydWVgIGlmIHNvcnQgZGlyZWN0aW9uIGlzIGBkZXNjYC4gTm90IHRvIGJlIHVzZWQgZm9yIGludmVydGluZyB0aGUgcmV0dXJuIHZhbHVlIGFzIHRoZSBncmlkIGFscmVhZHkgYXBwbGllcyBgYXNjYCBvciBgZGVzY2Agb3JkZXJpbmcuXG4gICAgICogXG4gICAgICogUmV0dXJuOlxuICAgICAqICAgLSBgMGAgIHZhbHVlQSBpcyB0aGUgc2FtZSBhcyB2YWx1ZUJcbiAgICAgKiAgIC0gYD4gMGAgU29ydCB2YWx1ZUEgYWZ0ZXIgdmFsdWVCIFxuICAgICAqICAgLSBgPCAwYCBTb3J0IHZhbHVlQSBiZWZvcmUgdmFsdWVCICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb21wYXJhdG9yOiAoKHZhbHVlQTogYW55LCB2YWx1ZUI6IGFueSwgbm9kZUE6IFJvd05vZGU8VERhdGE+LCBub2RlQjogUm93Tm9kZTxURGF0YT4sIGlzRGVzY2VuZGluZzogYm9vbGVhbikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0aGUgdW5zb3J0ZWQgaWNvbiB0byBiZSBzaG93biB3aGVuIG5vIHNvcnQgaXMgYXBwbGllZCB0byB0aGlzIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjI0IC0gdXNlIHNvcnRJbmRleCBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRlZEF0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQsIGVhY2ggY2VsbCB3aWxsIHRha2UgdXAgdGhlIHdpZHRoIG9mIG9uZSBjb2x1bW4uIFlvdSBjYW4gY2hhbmdlIHRoaXMgYmVoYXZpb3VyIHRvIGFsbG93IGNlbGxzIHRvIHNwYW4gbXVsdGlwbGUgY29sdW1ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbFNwYW46ICgocGFyYW1zOiBDb2xTcGFuUGFyYW1zPFREYXRhPikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgZWFjaCBjZWxsIHdpbGwgdGFrZSB1cCB0aGUgaGVpZ2h0IG9mIG9uZSByb3cuIFlvdSBjYW4gY2hhbmdlIHRoaXMgYmVoYXZpb3VyIHRvIGFsbG93IGNlbGxzIHRvIHNwYW4gbXVsdGlwbGUgcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1NwYW46ICgocGFyYW1zOiBSb3dTcGFuUGFyYW1zPFREYXRhPikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZDtcbiAgICAvKiogSW5pdGlhbCB3aWR0aCBpbiBwaXhlbHMgZm9yIHRoZSBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgd2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgd2lkdGhgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBNaW5pbXVtIHdpZHRoIGluIHBpeGVscyBmb3IgdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtaW5XaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBNYXhpbXVtIHdpZHRoIGluIHBpeGVscyBmb3IgdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBVc2VkIGluc3RlYWQgb2YgYHdpZHRoYCB3aGVuIHRoZSBnb2FsIGlzIHRvIGZpbGwgdGhlIHJlbWFpbmluZyBlbXB0eSBzcGFjZSBvZiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgZmxleGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEZsZXg6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyB0aGlzIGNvbHVtbiBzaG91bGQgYmUgcmVzaXplZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVzaXphYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRoaXMgY29sdW1uJ3Mgd2lkdGggdG8gYmUgZml4ZWQgZHVyaW5nICdzaXplIHRvIGZpdCcgb3BlcmF0aW9ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTaXplVG9GaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIHRvIGJlIGF1dG8tcmVzaXphYmxlIGJ5IGRvdWJsZSBjbGlja2luZyBpdCdzIGVkZ2UuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cblxuICAgIC8vIEVuYWJsZSB0eXBlIGNvZXJjaW9uIGZvciBib29sZWFuIElucHV0cyB0byBzdXBwb3J0IHVzZSBsaWtlICdlbmFibGVDaGFydHMnIGluc3RlYWQgb2YgZm9yY2luZyAnW2VuYWJsZUNoYXJ0c109XCJ0cnVlXCInIFxuICAgIC8vIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS90ZW1wbGF0ZS10eXBlY2hlY2sjaW5wdXQtc2V0dGVyLWNvZXJjaW9uIFxuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NlbGxGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZpbHRlcnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX29wZW5CeURlZmF1bHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX21hcnJ5Q2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2hpZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luaXRpYWxIaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW5pdGlhbFJvd0dyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9waXZvdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW5pdGlhbFBpdm90OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2hvd0Rpc2FibGVkQ2hlY2tib3hlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2hlYWRlckNoZWNrYm94U2VsZWN0aW9uRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01lbnU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92YWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbG9ja1Bvc2l0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2NrVmlzaWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbG9ja1Bpbm5lZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5Tb3J0SWNvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTaXplVG9GaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJvd0dyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVQaXZvdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlVmFsdWU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VkaXRhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Bhc3RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc05hdmlnYWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kbmRTb3VyY2U6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2F1dG9IZWlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3dyYXBUZXh0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zb3J0YWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVzaXphYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Zsb2F0aW5nRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jZWxsRWRpdG9yUG9wdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmlsbEhhbmRsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfd3JhcEhlYWRlclRleHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2F1dG9IZWFkZXJIZWlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgLy8gQEVOREBcblxufVxuIl19