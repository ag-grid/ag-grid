import { CellClassParams, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditorSelectorFunc, CellRendererSelectorFunc, CheckboxSelectionCallbackParams, ColDef, ColGroupDef, ColSpanParams, ColumnsMenuParams, DndSourceCallbackParams, EditableCallbackParams, GetQuickFilterTextParams, IAggFunc, ICellEditorComp, ICellRendererComp, ICellRendererFunc, IHeaderGroupComp, IRowDragItem, ITooltipComp, ITooltipParams, RowDragCallbackParams, RowNode, RowSpanParams, SuppressHeaderKeyboardEventParams, SuppressKeyboardEventParams, SuppressNavigableCallbackParams, SuppressPasteCallbackParams, ValueFormatterParams, ValueGetterParams, ValueParserParams, ValueSetterParams, NewValueParams, HeaderCheckboxSelectionCallbackParams, HeaderClassParams, ToolPanelClassParams } from "@ag-grid-community/core";
import { Component, ContentChildren, Input, QueryList } from "@angular/core";

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
    @Input() public children: (ColDef | ColGroupDef)[] | undefined = undefined;
    @Input() public sortingOrder: (string | null)[] | undefined = undefined;
    @Input() public allowedAggFuncs: string[] | undefined = undefined;
    @Input() public menuTabs: string[] | undefined = undefined;
    @Input() public cellClassRules: { [cssClassName: string]: (Function | string); } | undefined = undefined;
    @Input() public icons: { [key: string]: Function | string; } | undefined = undefined;
    @Input() public headerGroupComponent: string | { new(): IHeaderGroupComp; } | undefined = undefined;
    @Input() public headerGroupComponentFramework: any | undefined = undefined;
    @Input() public headerGroupComponentParams: any | undefined = undefined;
    @Input() public cellStyle: {} | ((params: CellClassParams) => {}) | undefined = undefined;
    @Input() public cellRendererParams: any | undefined = undefined;
    @Input() public cellEditorFramework: any | undefined = undefined;
    @Input() public cellEditorParams: any | undefined = undefined;
    @Input() public pinnedRowCellRendererFramework: any | undefined = undefined;
    @Input() public pinnedRowCellRendererParams: any | undefined = undefined;
    @Input() public filterFramework: any = undefined;
    @Input() public filterParams: any = undefined;
    @Input() public headerComponent: string | { new(): any; } | undefined = undefined;
    @Input() public headerComponentFramework: any | undefined = undefined;
    @Input() public headerComponentParams: any | undefined = undefined;
    @Input() public floatingFilterComponent: any = undefined;
    @Input() public floatingFilterComponentParams: any = undefined;
    @Input() public floatingFilterComponentFramework: any = undefined;
    @Input() public tooltipComponent: { new(): ITooltipComp; } | string | undefined = undefined;
    @Input() public tooltipComponentParams: any | undefined = undefined;
    @Input() public tooltipComponentFramework: any | undefined = undefined;
    @Input() public refData: { [key: string]: string; } | undefined = undefined;
    @Input() public columnsMenuParams: ColumnsMenuParams | undefined = undefined;
    @Input() public headerName: string | undefined = undefined;
    @Input() public columnGroupShow: string | undefined = undefined;
    @Input() public headerClass: string | string[] | ((params: HeaderClassParams) => string | string[]) | undefined = undefined;
    @Input() public toolPanelClass: string | string[] | ((params: ToolPanelClassParams) => string | string[]) | undefined = undefined;
    @Input() public headerValueGetter: string | Function | undefined = undefined;
    @Input() public groupId: string | undefined = undefined;
    @Input() public colId: string | undefined = undefined;
    @Input() public sort: string | null | undefined = undefined;
    @Input() public initialSort: string | undefined = undefined;
    @Input() public field: string | undefined = undefined;
    @Input() public type: string | string[] | undefined = undefined;
    @Input() public tooltipField: string | undefined = undefined;
    @Input() public headerTooltip: string | undefined = undefined;
    @Input() public cellClass: string | string[] | ((cellClassParams: CellClassParams) => string | string[]) | undefined = undefined;
    @Input() public showRowGroup: string | boolean | undefined = undefined;
    @Input() public filter: any = undefined;
    @Input() public initialAggFunc: string | IAggFunc | undefined = undefined;
    @Input() public aggFunc: string | IAggFunc | null | undefined = undefined;
    @Input() public cellRenderer: { new(): ICellRendererComp; } | ICellRendererFunc | string | undefined = undefined;
    @Input() public cellEditor: { new(): ICellEditorComp; } | string | undefined = undefined;
    @Input() public pinned: boolean | string | null | undefined = undefined;
    @Input() public initialPinned: boolean | string | undefined = undefined;
    @Input() public chartDataType: 'category' | 'series' | 'time' | 'excluded' | undefined = undefined;
    @Input() public cellEditorPopupPosition: string | undefined = undefined;
    @Input() public sortedAt: number | undefined = undefined;
    @Input() public sortIndex: number | null | undefined = undefined;
    @Input() public initialSortIndex: number | undefined = undefined;
    @Input() public flex: number | undefined = undefined;
    @Input() public initialFlex: number | undefined = undefined;
    @Input() public width: number | undefined = undefined;
    @Input() public initialWidth: number | undefined = undefined;
    @Input() public minWidth: number | undefined = undefined;
    @Input() public maxWidth: number | undefined = undefined;
    @Input() public rowGroupIndex: number | null | undefined = undefined;
    @Input() public initialRowGroupIndex: number | undefined = undefined;
    @Input() public pivotIndex: number | null | undefined = undefined;
    @Input() public initialPivotIndex: number | undefined = undefined;
    @Input() public dndSourceOnRowDrag: ((params: { rowNode: RowNode, dragEvent: DragEvent; }) => void) | undefined = undefined;
    @Input() public valueGetter: ((params: ValueGetterParams) => any) | string | undefined = undefined;
    @Input() public valueSetter: ((params: ValueSetterParams) => boolean) | string | undefined = undefined;
    @Input() public filterValueGetter: ((params: ValueGetterParams) => any) | string | undefined = undefined;
    @Input() public keyCreator: (value: any) => string | undefined = undefined;
    @Input() public cellRendererFramework: any | undefined = undefined;
    @Input() public pinnedRowCellRenderer: { new(): ICellRendererComp; } | ICellRendererFunc | string | undefined = undefined;
    @Input() public valueFormatter: ((params: ValueFormatterParams) => string) | string | undefined = undefined;
    @Input() public pinnedRowValueFormatter: ((params: ValueFormatterParams) => string) | string | undefined = undefined;
    @Input() public valueParser: ((params: ValueParserParams) => any) | string | undefined = undefined;
    @Input() public comparator: (valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number | undefined = undefined;
    @Input() public equals: (valueA: any, valueB: any) => boolean | undefined = undefined;
    @Input() public pivotComparator: (valueA: string, valueB: string) => number | undefined = undefined;
    @Input() public suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => boolean | undefined = undefined;
    @Input() public suppressHeaderKeyboardEvent: (params: SuppressHeaderKeyboardEventParams) => boolean | undefined = undefined;
    @Input() public colSpan: (params: ColSpanParams) => number | undefined = undefined;
    @Input() public rowSpan: (params: RowSpanParams) => number | undefined = undefined;
    @Input() public getQuickFilterText: (params: GetQuickFilterTextParams) => string | undefined = undefined;
    @Input() public newValueHandler: (params: NewValueParams) => boolean | undefined = undefined;
    @Input() public onCellValueChanged: Function | undefined = undefined;
    @Input() public onCellClicked: (event: CellClickedEvent) => void | undefined = undefined;
    @Input() public onCellDoubleClicked: (event: CellDoubleClickedEvent) => void | undefined = undefined;
    @Input() public onCellContextMenu: (event: CellContextMenuEvent) => void | undefined = undefined;
    @Input() public rowDragText: ((params: IRowDragItem, dragItemCount: number) => string) | undefined = undefined;
    @Input() public tooltipValueGetter: (params: ITooltipParams) => string | undefined = undefined;
    @Input() public cellRendererSelector: CellRendererSelectorFunc | undefined = undefined;
    @Input() public cellEditorSelector: CellEditorSelectorFunc | undefined = undefined;
    @Input() public suppressCellFlash: boolean | undefined = undefined;
    @Input() public suppressColumnsToolPanel: boolean | undefined = undefined;
    @Input() public suppressFiltersToolPanel: boolean | undefined = undefined;
    @Input() public openByDefault: boolean | undefined = undefined;
    @Input() public marryChildren: boolean | undefined = undefined;
    @Input() public hide: boolean | undefined = undefined;
    @Input() public initialHide: boolean | undefined = undefined;
    @Input() public rowGroup: boolean | undefined = undefined;
    @Input() public initialRowGroup: boolean | undefined = undefined;
    @Input() public pivot: boolean | undefined = undefined;
    @Input() public initialPivot: boolean | undefined = undefined;
    @Input() public checkboxSelection: boolean | ((params: CheckboxSelectionCallbackParams) => boolean) | undefined = undefined;
    @Input() public headerCheckboxSelection: boolean | ((params: HeaderCheckboxSelectionCallbackParams) => boolean) | undefined = undefined;
    @Input() public headerCheckboxSelectionFilteredOnly: boolean | undefined = undefined;
    @Input() public suppressMenu: boolean | undefined = undefined;
    @Input() public suppressMovable: boolean | undefined = undefined;
    @Input() public lockPosition: boolean | undefined = undefined;
    @Input() public lockVisible: boolean | undefined = undefined;
    @Input() public lockPinned: boolean | undefined = undefined;
    @Input() public unSortIcon: boolean | undefined = undefined;
    @Input() public suppressSizeToFit: boolean | undefined = undefined;
    @Input() public suppressAutoSize: boolean | undefined = undefined;
    @Input() public enableRowGroup: boolean | undefined = undefined;
    @Input() public enablePivot: boolean | undefined = undefined;
    @Input() public enableValue: boolean | undefined = undefined;
    @Input() public editable: boolean | ((params: EditableCallbackParams) => boolean) | undefined = undefined;
    @Input() public suppressPaste: boolean | ((params: SuppressPasteCallbackParams) => boolean) | undefined = undefined;
    @Input() public suppressNavigable: boolean | ((params: SuppressNavigableCallbackParams) => boolean) | undefined = undefined;
    @Input() public enableCellChangeFlash: boolean | undefined = undefined;
    @Input() public rowDrag: boolean | ((params: RowDragCallbackParams) => boolean) | undefined = undefined;
    @Input() public dndSource: boolean | ((params: DndSourceCallbackParams) => boolean) | undefined = undefined;
    @Input() public autoHeight: boolean | undefined = undefined;
    @Input() public wrapText: boolean | undefined = undefined;
    @Input() public sortable: boolean | undefined = undefined;
    @Input() public resizable: boolean | undefined = undefined;
    @Input() public singleClickEdit: boolean | undefined = undefined;
    @Input() public floatingFilter: boolean | undefined = undefined;
    @Input() public cellEditorPopup: boolean | undefined = undefined;
    // @END@

}
