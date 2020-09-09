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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctZ3JpZC1hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFPN0UsSUFBYSxZQUFZLG9CQUF6QixNQUFhLFlBQVk7SUFHZCxlQUFlO1FBQ2xCLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkQsdUVBQXVFO1lBQ3ZFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxRQUFRO1FBQ1gsSUFBSSxNQUFNLEdBQVcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ2xCLE1BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN2RTtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxlQUFlLENBQUMsWUFBcUM7UUFDekQsT0FBTyxZQUFZO1lBQ2YsdUVBQXVFO2FBQ3RFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQzNDLEdBQUcsQ0FBQyxDQUFDLE1BQW9CLEVBQUUsRUFBRTtZQUMxQixPQUFPLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFBQSxDQUFDO0lBRU0sMEJBQTBCLENBQUMsSUFBa0I7UUFDakQsSUFBSSxFQUFFLFlBQVksS0FBZ0IsSUFBSSxFQUFsQix1Q0FBa0IsQ0FBQztRQUN2QyxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQUEsQ0FBQztDQXFJTCxDQUFBO0FBcEtrQztJQUE5QixlQUFlLENBQUMsY0FBWSxDQUFDOzhCQUFzQixTQUFTO2tEQUFlO0FBbUNuRTtJQUFSLEtBQUssRUFBRTs7OENBQXNCO0FBQ3JCO0lBQVIsS0FBSyxFQUFFOztrREFBMEI7QUFDekI7SUFBUixLQUFLLEVBQUU7O3FEQUE2QjtBQUM1QjtJQUFSLEtBQUssRUFBRTs7OENBQXNCO0FBQ3JCO0lBQVIsS0FBSyxFQUFFOztvREFBNEI7QUFDM0I7SUFBUixLQUFLLEVBQUU7OzJDQUFtQjtBQUNsQjtJQUFSLEtBQUssRUFBRTs7MERBQWtDO0FBQ2pDO0lBQVIsS0FBSyxFQUFFOzttRUFBMkM7QUFDMUM7SUFBUixLQUFLLEVBQUU7O2dFQUF3QztBQUN2QztJQUFSLEtBQUssRUFBRTs7K0NBQXVCO0FBQ3RCO0lBQVIsS0FBSyxFQUFFOzt3REFBZ0M7QUFDL0I7SUFBUixLQUFLLEVBQUU7O3lEQUFpQztBQUNoQztJQUFSLEtBQUssRUFBRTs7c0RBQThCO0FBQzdCO0lBQVIsS0FBSyxFQUFFOztvRUFBNEM7QUFDM0M7SUFBUixLQUFLLEVBQUU7O2lFQUF5QztBQUN4QztJQUFSLEtBQUssRUFBRTs7cURBQTZCO0FBQzVCO0lBQVIsS0FBSyxFQUFFOztrREFBMEI7QUFDekI7SUFBUixLQUFLLEVBQUU7O3FEQUE2QjtBQUM1QjtJQUFSLEtBQUssRUFBRTs7OERBQXNDO0FBQ3JDO0lBQVIsS0FBSyxFQUFFOzsyREFBbUM7QUFDbEM7SUFBUixLQUFLLEVBQUU7OzZEQUFxQztBQUNwQztJQUFSLEtBQUssRUFBRTs7bUVBQTJDO0FBQzFDO0lBQVIsS0FBSyxFQUFFOztzRUFBOEM7QUFDN0M7SUFBUixLQUFLLEVBQUU7O3NEQUE4QjtBQUM3QjtJQUFSLEtBQUssRUFBRTs7NERBQW9DO0FBQ25DO0lBQVIsS0FBSyxFQUFFOzsrREFBdUM7QUFDdEM7SUFBUixLQUFLLEVBQUU7OzZDQUFxQjtBQUNwQjtJQUFSLEtBQUssRUFBRTs7dURBQStCO0FBQzlCO0lBQVIsS0FBSyxFQUFFOztnREFBd0I7QUFDdkI7SUFBUixLQUFLLEVBQUU7O3FEQUE2QjtBQUM1QjtJQUFSLEtBQUssRUFBRTs7aURBQXlCO0FBQ3hCO0lBQVIsS0FBSyxFQUFFOztvREFBNEI7QUFDM0I7SUFBUixLQUFLLEVBQUU7O3VEQUErQjtBQUM5QjtJQUFSLEtBQUssRUFBRTs7NkNBQXFCO0FBQ3BCO0lBQVIsS0FBSyxFQUFFOzsyQ0FBbUI7QUFDbEI7SUFBUixLQUFLLEVBQUU7OzBDQUFrQjtBQUNqQjtJQUFSLEtBQUssRUFBRTs7aURBQXlCO0FBQ3hCO0lBQVIsS0FBSyxFQUFFOzsyQ0FBbUI7QUFDbEI7SUFBUixLQUFLLEVBQUU7OzBDQUFrQjtBQUNqQjtJQUFSLEtBQUssRUFBRTs7a0RBQTBCO0FBQ3pCO0lBQVIsS0FBSyxFQUFFOzttREFBMkI7QUFDMUI7SUFBUixLQUFLLEVBQUU7OytDQUF1QjtBQUN0QjtJQUFSLEtBQUssRUFBRTs7a0RBQTBCO0FBQ3pCO0lBQVIsS0FBSyxFQUFFOzs0Q0FBb0I7QUFDbkI7SUFBUixLQUFLLEVBQUU7O29EQUE0QjtBQUMzQjtJQUFSLEtBQUssRUFBRTs7NkNBQXFCO0FBQ3BCO0lBQVIsS0FBSyxFQUFFOztrREFBMEI7QUFDekI7SUFBUixLQUFLLEVBQUU7O2dEQUF3QjtBQUN2QjtJQUFSLEtBQUssRUFBRTs7NENBQW9CO0FBQ25CO0lBQVIsS0FBSyxFQUFFOzttREFBMkI7QUFDMUI7SUFBUixLQUFLLEVBQUU7O21EQUEyQjtBQUMxQjtJQUFSLEtBQUssRUFBRTs7OENBQXNCO0FBQ3JCO0lBQVIsS0FBSyxFQUFFOzsrQ0FBdUI7QUFDdEI7SUFBUixLQUFLLEVBQUU7O3NEQUE4QjtBQUM3QjtJQUFSLEtBQUssRUFBRTs7MENBQWtCO0FBQ2pCO0lBQVIsS0FBSyxFQUFFOztpREFBeUI7QUFDeEI7SUFBUixLQUFLLEVBQUU7OzJDQUFtQjtBQUNsQjtJQUFSLEtBQUssRUFBRTs7a0RBQTBCO0FBQ3pCO0lBQVIsS0FBSyxFQUFFOzs4Q0FBc0I7QUFDckI7SUFBUixLQUFLLEVBQUU7OzhDQUFzQjtBQUNyQjtJQUFSLEtBQUssRUFBRTs7bURBQTJCO0FBQzFCO0lBQVIsS0FBSyxFQUFFOzswREFBa0M7QUFDakM7SUFBUixLQUFLLEVBQUU7O2dEQUF3QjtBQUN2QjtJQUFSLEtBQUssRUFBRTs7dURBQStCO0FBQzlCO0lBQVIsS0FBSyxFQUFFOzt3REFBZ0M7QUFDL0I7SUFBUixLQUFLLEVBQUU7O2lEQUF5QjtBQUN4QjtJQUFSLEtBQUssRUFBRTs7aURBQXlCO0FBQ3hCO0lBQVIsS0FBSyxFQUFFOzt1REFBK0I7QUFDOUI7SUFBUixLQUFLLEVBQUU7O2dEQUF3QjtBQUN2QjtJQUFSLEtBQUssRUFBRTs7MkRBQW1DO0FBQ2xDO0lBQVIsS0FBSyxFQUFFOzsyREFBbUM7QUFDbEM7SUFBUixLQUFLLEVBQUU7O29EQUE0QjtBQUMzQjtJQUFSLEtBQUssRUFBRTs7NkRBQXFDO0FBQ3BDO0lBQVIsS0FBSyxFQUFFOztpREFBeUI7QUFDeEI7SUFBUixLQUFLLEVBQUU7O2dEQUF3QjtBQUN2QjtJQUFSLEtBQUssRUFBRTs7NENBQW9CO0FBQ25CO0lBQVIsS0FBSyxFQUFFOztxREFBNkI7QUFDNUI7SUFBUixLQUFLLEVBQUU7OzJEQUFtQztBQUNsQztJQUFSLEtBQUssRUFBRTs7NkNBQXFCO0FBQ3BCO0lBQVIsS0FBSyxFQUFFOzs2Q0FBcUI7QUFDcEI7SUFBUixLQUFLLEVBQUU7O3dEQUFnQztBQUMvQjtJQUFSLEtBQUssRUFBRTs7cURBQTZCO0FBQzVCO0lBQVIsS0FBSyxFQUFFOzt3REFBZ0M7QUFDL0I7SUFBUixLQUFLLEVBQUU7O21EQUEyQjtBQUMxQjtJQUFSLEtBQUssRUFBRTs7eURBQWlDO0FBQ2hDO0lBQVIsS0FBSyxFQUFFOzt1REFBK0I7QUFDOUI7SUFBUixLQUFLLEVBQUU7O2lEQUF5QjtBQUN4QjtJQUFSLEtBQUssRUFBRTs7d0RBQWdDO0FBQy9CO0lBQVIsS0FBSyxFQUFFOzswREFBa0M7QUFDakM7SUFBUixLQUFLLEVBQUU7O3dEQUFnQztBQUMvQjtJQUFSLEtBQUssRUFBRTs7dURBQStCO0FBQzlCO0lBQVIsS0FBSyxFQUFFOzs4REFBc0M7QUFDckM7SUFBUixLQUFLLEVBQUU7OzhEQUFzQztBQUNyQztJQUFSLEtBQUssRUFBRTs7bURBQTJCO0FBQzFCO0lBQVIsS0FBSyxFQUFFOzttREFBMkI7QUFDMUI7SUFBUixLQUFLLEVBQUU7OzBDQUFrQjtBQUNqQjtJQUFSLEtBQUssRUFBRTs7aURBQXlCO0FBQ3hCO0lBQVIsS0FBSyxFQUFFOzs4Q0FBc0I7QUFDckI7SUFBUixLQUFLLEVBQUU7O3FEQUE2QjtBQUM1QjtJQUFSLEtBQUssRUFBRTs7MkNBQW1CO0FBQ2xCO0lBQVIsS0FBSyxFQUFFOztrREFBMEI7QUFDekI7SUFBUixLQUFLLEVBQUU7O3VEQUErQjtBQUM5QjtJQUFSLEtBQUssRUFBRTs7NkRBQXFDO0FBQ3BDO0lBQVIsS0FBSyxFQUFFOzt5RUFBaUQ7QUFDaEQ7SUFBUixLQUFLLEVBQUU7O2tEQUEwQjtBQUN6QjtJQUFSLEtBQUssRUFBRTs7cURBQTZCO0FBQzVCO0lBQVIsS0FBSyxFQUFFOztrREFBMEI7QUFDekI7SUFBUixLQUFLLEVBQUU7O2lEQUF5QjtBQUN4QjtJQUFSLEtBQUssRUFBRTs7Z0RBQXdCO0FBQ3ZCO0lBQVIsS0FBSyxFQUFFOztnREFBd0I7QUFDdkI7SUFBUixLQUFLLEVBQUU7O3VEQUErQjtBQUM5QjtJQUFSLEtBQUssRUFBRTs7c0RBQThCO0FBQzdCO0lBQVIsS0FBSyxFQUFFOztvREFBNEI7QUFDM0I7SUFBUixLQUFLLEVBQUU7O2lEQUF5QjtBQUN4QjtJQUFSLEtBQUssRUFBRTs7aURBQXlCO0FBQ3hCO0lBQVIsS0FBSyxFQUFFOzs4Q0FBc0I7QUFDckI7SUFBUixLQUFLLEVBQUU7O21EQUEyQjtBQUMxQjtJQUFSLEtBQUssRUFBRTs7dURBQStCO0FBQzlCO0lBQVIsS0FBSyxFQUFFOzsyREFBbUM7QUFDbEM7SUFBUixLQUFLLEVBQUU7OzZDQUFxQjtBQUNwQjtJQUFSLEtBQUssRUFBRTs7K0NBQXVCO0FBQ3RCO0lBQVIsS0FBSyxFQUFFOztnREFBd0I7QUFDdkI7SUFBUixLQUFLLEVBQUU7OzhDQUFzQjtBQUNyQjtJQUFSLEtBQUssRUFBRTs7OENBQXNCO0FBQ3JCO0lBQVIsS0FBSyxFQUFFOzsrQ0FBdUI7QUFDdEI7SUFBUixLQUFLLEVBQUU7O3FEQUE2QjtBQUM1QjtJQUFSLEtBQUssRUFBRTs7b0RBQTRCO0FBbEszQixZQUFZO0lBSnhCLFNBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsUUFBUSxFQUFFLEVBQUU7S0FDZixDQUFDO0dBQ1csWUFBWSxDQXFLeEI7U0FyS1ksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBJbnB1dCwgUXVlcnlMaXN0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IENvbERlZiB9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtY29sdW1uJyxcbiAgICB0ZW1wbGF0ZTogJydcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQ29sdW1uIHtcbiAgICBAQ29udGVudENoaWxkcmVuKEFnR3JpZENvbHVtbikgcHVibGljIGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBwdWJsaWMgaGFzQ2hpbGRDb2x1bW5zKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5jaGlsZENvbHVtbnMgJiYgdGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIHJldHVybiAhKHRoaXMuY2hpbGRDb2x1bW5zLmxlbmd0aCA9PT0gMSAmJiB0aGlzLmNoaWxkQ29sdW1ucy5maXJzdCA9PT0gdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b0NvbERlZigpOiBDb2xEZWYge1xuICAgICAgICBsZXQgY29sRGVmOiBDb2xEZWYgPSB0aGlzLmNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0NoaWxkQ29sdW1ucygpKSB7XG4gICAgICAgICAgICAoPGFueT5jb2xEZWYpW1wiY2hpbGRyZW5cIl0gPSB0aGlzLmdldENoaWxkQ29sRGVmcyh0aGlzLmNoaWxkQ29sdW1ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENoaWxkQ29sRGVmcyhjaGlsZENvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+KSB7XG4gICAgICAgIHJldHVybiBjaGlsZENvbHVtbnNcbiAgICAgICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEwMDk4XG4gICAgICAgICAgICAuZmlsdGVyKGNvbHVtbiA9PiAhY29sdW1uLmhhc0NoaWxkQ29sdW1ucygpKVxuICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjcmVhdGVDb2xEZWZGcm9tR3JpZENvbHVtbihmcm9tOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYge1xuICAgICAgICBsZXQgeyBjaGlsZENvbHVtbnMsIC4uLmNvbERlZiB9ID0gZnJvbTtcbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9O1xuXG4gICAgLy8gaW5wdXRzIC0gcHJldHR5IG11Y2ggbW9zdCBvZiBDb2xEZWYsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwgYW5kIGludGVybmFsIG9ubHkgcHJvcGVydGllc1xuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgY2hpbGRyZW46IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGFsbG93ZWRBZ2dGdW5jczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtZW51VGFiczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3NSdWxlczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudFBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsU3R5bGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyUGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudEZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnRQYXJhbXM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50UGFyYW1zOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnRGcmFtZXdvcms6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcmVmRGF0YTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5zTWVudVBhcmFtczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJOYW1lOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkdyb3VwU2hvdzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDbGFzczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxDbGFzczogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJWYWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cElkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNvbElkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNvcnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFNvcnQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmllbGQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdHlwZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwRmllbGQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVG9vbHRpcDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3M6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd1Jvd0dyb3VwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsQWdnRnVuYzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGlubmVkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0RGF0YVR5cGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGVkQXQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTb3J0SW5kZXg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsRmxleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3aWR0aDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsV2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWluV2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4V2lkdGg6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUm93R3JvdXBJbmRleDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdEluZGV4OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGRuZFNvdXJjZU9uUm93RHJhZzogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZVNldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJWYWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZXlDcmVhdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlckZyYW1ld29yazogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVGb3JtYXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93VmFsdWVGb3JtYXR0ZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVQYXJzZXI6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcGFyYXRvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlcXVhbHM6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb21wYXJhdG9yOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xTcGFuOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd1NwYW46IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0UXVpY2tGaWx0ZXJUZXh0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG5ld1ZhbHVlSGFuZGxlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxWYWx1ZUNoYW5nZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsQ2xpY2tlZDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxEb3VibGVDbGlja2VkOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbENvbnRleHRNZW51OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdUZXh0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBWYWx1ZUdldHRlcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJTZWxlY3RvcjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yU2VsZWN0b3I6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsRmxhc2g6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5zVG9vbFBhbmVsOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmlsdGVyc1Rvb2xQYW5lbDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvcGVuQnlEZWZhdWx0OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIG1hcnJ5Q2hpbGRyZW46IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaGlkZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsSGlkZTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUm93R3JvdXA6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3Q6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpdm90OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGNoZWNrYm94U2VsZWN0aW9uOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uRmlsdGVyZWRPbmx5OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudTogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Bvc2l0aW9uOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2tWaXNpYmxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGxvY2tQaW5uZWQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NpemVUb0ZpdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJvd0dyb3VwOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVBpdm90OiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVZhbHVlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGVkaXRhYmxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFzdGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOYXZpZ2FibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWc6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgZG5kU291cmNlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIGF1dG9IZWlnaHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgd3JhcFRleHQ6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGFibGU6IGFueTtcbiAgICBASW5wdXQoKSBwdWJsaWMgcmVzaXphYmxlOiBhbnk7XG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYW55O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcjogYW55O1xuICAgIC8vIEBFTkRAXG5cbn1cbiJdfQ==