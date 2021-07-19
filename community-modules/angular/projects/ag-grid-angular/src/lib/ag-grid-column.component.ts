import { Component, ContentChildren, Input, QueryList } from "@angular/core";
import { ColDef } from "@ag-grid-community/core";

@Component({
    selector: 'ag-grid-column',
    template: ''
})
export class AgGridColumn {
    @ContentChildren(AgGridColumn) public childColumns: QueryList<AgGridColumn>;

    public hasChildColumns(): boolean {
        if (this.childColumns && this.childColumns.length > 0) {
            // necessary because of https://github.com/angular/angular/issues/10098
            return !(this.childColumns.length === 1 && this.childColumns.first === this);
        }
        return false;
    }

    public toColDef(): ColDef {
        let colDef: ColDef = this.createColDefFromGridColumn(this);

        if (this.hasChildColumns()) {
            (<any>colDef)["children"] = this.getChildColDefs(this.childColumns);
        }
        return colDef;
    }

    private getChildColDefs(childColumns: QueryList<AgGridColumn>) {
        return childColumns
            // necessary because of https://github.com/angular/angular/issues/10098
            .filter(column => !column.hasChildColumns())
            .map((column: AgGridColumn) => {
                return column.toColDef();
            });
    }

    private createColDefFromGridColumn(from: AgGridColumn): ColDef {
        let { childColumns, ...colDef } = from;
        return colDef;
    }

    // inputs - pretty much most of ColDef, with the exception of template, templateUrl and internal only properties
    // @START@
    @Input() public children: any;
    @Input() public sortingOrder: any;
    @Input() public allowedAggFuncs: any;
    @Input() public menuTabs: any;
    @Input() public cellClassRules: any;
    @Input() public icons: any;
    @Input() public headerGroupComponent: any;
    @Input() public headerGroupComponentFramework: any;
    @Input() public headerGroupComponentParams: any;
    @Input() public cellStyle: any;
    @Input() public cellRendererParams: any;
    @Input() public cellEditorFramework: any;
    @Input() public cellEditorParams: any;
    @Input() public pinnedRowCellRendererFramework: any;
    @Input() public pinnedRowCellRendererParams: any;
    @Input() public filterFramework: any;
    @Input() public filterParams: any;
    @Input() public headerComponent: any;
    @Input() public headerComponentFramework: any;
    @Input() public headerComponentParams: any;
    @Input() public floatingFilterComponent: any;
    @Input() public floatingFilterComponentParams: any;
    @Input() public floatingFilterComponentFramework: any;
    @Input() public tooltipComponent: any;
    @Input() public tooltipComponentParams: any;
    @Input() public tooltipComponentFramework: any;
    @Input() public refData: any;
    @Input() public columnsMenuParams: any;
    @Input() public headerName: any;
    @Input() public columnGroupShow: any;
    @Input() public headerClass: any;
    @Input() public toolPanelClass: any;
    @Input() public headerValueGetter: any;
    @Input() public groupId: any;
    @Input() public colId: any;
    @Input() public sort: any;
    @Input() public initialSort: any;
    @Input() public field: any;
    @Input() public type: any;
    @Input() public tooltipField: any;
    @Input() public headerTooltip: any;
    @Input() public cellClass: any;
    @Input() public showRowGroup: any;
    @Input() public filter: any;
    @Input() public initialAggFunc: any;
    @Input() public aggFunc: any;
    @Input() public cellRenderer: any;
    @Input() public cellEditor: any;
    @Input() public pinned: any;
    @Input() public initialPinned: any;
    @Input() public chartDataType: any;
    @Input() public cellEditorPopupPosition: any;
    @Input() public sortedAt: any;
    @Input() public sortIndex: any;
    @Input() public initialSortIndex: any;
    @Input() public flex: any;
    @Input() public initialFlex: any;
    @Input() public width: any;
    @Input() public initialWidth: any;
    @Input() public minWidth: any;
    @Input() public maxWidth: any;
    @Input() public rowGroupIndex: any;
    @Input() public initialRowGroupIndex: any;
    @Input() public pivotIndex: any;
    @Input() public initialPivotIndex: any;
    @Input() public dndSourceOnRowDrag: any;
    @Input() public valueGetter: any;
    @Input() public valueSetter: any;
    @Input() public filterValueGetter: any;
    @Input() public keyCreator: any;
    @Input() public cellRendererFramework: any;
    @Input() public pinnedRowCellRenderer: any;
    @Input() public valueFormatter: any;
    @Input() public pinnedRowValueFormatter: any;
    @Input() public valueParser: any;
    @Input() public comparator: any;
    @Input() public equals: any;
    @Input() public pivotComparator: any;
    @Input() public suppressKeyboardEvent: any;
    @Input() public suppressHeaderKeyboardEvent: any;
    @Input() public colSpan: any;
    @Input() public rowSpan: any;
    @Input() public getQuickFilterText: any;
    @Input() public newValueHandler: any;
    @Input() public onCellValueChanged: any;
    @Input() public onCellClicked: any;
    @Input() public onCellDoubleClicked: any;
    @Input() public onCellContextMenu: any;
    @Input() public rowDragText: any;
    @Input() public tooltipValueGetter: any;
    @Input() public cellRendererSelector: any;
    @Input() public cellEditorSelector: any;
    @Input() public suppressCellFlash: any;
    @Input() public suppressColumnsToolPanel: any;
    @Input() public suppressFiltersToolPanel: any;
    @Input() public openByDefault: any;
    @Input() public marryChildren: any;
    @Input() public hide: any;
    @Input() public initialHide: any;
    @Input() public rowGroup: any;
    @Input() public initialRowGroup: any;
    @Input() public pivot: any;
    @Input() public initialPivot: any;
    @Input() public checkboxSelection: any;
    @Input() public headerCheckboxSelection: any;
    @Input() public headerCheckboxSelectionFilteredOnly: any;
    @Input() public suppressMenu: any;
    @Input() public suppressMovable: any;
    @Input() public lockPosition: any;
    @Input() public lockVisible: any;
    @Input() public lockPinned: any;
    @Input() public unSortIcon: any;
    @Input() public suppressSizeToFit: any;
    @Input() public suppressAutoSize: any;
    @Input() public enableRowGroup: any;
    @Input() public enablePivot: any;
    @Input() public enableValue: any;
    @Input() public editable: any;
    @Input() public suppressPaste: any;
    @Input() public suppressNavigable: any;
    @Input() public enableCellChangeFlash: any;
    @Input() public rowDrag: any;
    @Input() public dndSource: any;
    @Input() public autoHeight: any;
    @Input() public wrapText: any;
    @Input() public sortable: any;
    @Input() public resizable: any;
    @Input() public singleClickEdit: any;
    @Input() public floatingFilter: any;
    @Input() public cellEditorPopup: any;
    // @END@

}
