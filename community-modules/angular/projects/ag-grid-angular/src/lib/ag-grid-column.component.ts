import { CellClassFunc, CellClassRules, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditorSelectorFunc, CellRendererSelectorFunc, CellStyleFunc, CheckboxSelectionCallback, ColDef, ColGroupDef, ColSpanParams, ColumnsMenuParams, DndSourceCallback, EditableCallback, GetQuickFilterTextParams, HeaderCheckboxSelectionCallback, HeaderClass, HeaderValueGetterFunc, IAggFunc, ICellEditorComp, ICellRendererComp, ICellRendererFunc, IHeaderGroupComp, IRowDragItem, ITooltipComp, ITooltipParams, KeyCreatorParams, NewValueParams, RowDragCallback, RowNode, RowSpanParams, SuppressHeaderKeyboardEventParams, SuppressKeyboardEventParams, SuppressNavigableCallback, SuppressPasteCallback, ToolPanelClass, ValueFormatterFunc, ValueGetterFunc, ValueParserFunc, ValueSetterFunc } from "@ag-grid-community/core";
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
    /** Columns in this group     */
    @Input() public children: (ColDef | ColGroupDef)[] | undefined = undefined;
    /** The sort order, provide an array with any of the following in any order ['asc','desc',null]     */
    @Input() public sortingOrder: (string | null)[] | undefined = undefined;
    /** Agg funcs allowed on this column. If missing, all installed agg funcs are allowed.
     * Can be eg ['sum','avg']. This will restrict what the GUI allows to select only.     */
    @Input() public allowedAggFuncs: string[] | undefined = undefined;
    /** The menu tabs to show, and in which order, the valid values for this property are:
     * filterMenuTab, generalMenuTab, columnsMenuTab     *     */
    @Input() public menuTabs: string[] | undefined = undefined;
    /** Rules for applying css classes     */
    @Input() public cellClassRules: CellClassRules | undefined = undefined;
    /** Icons for this column. Leave blank to use default.     */
    @Input() public icons: { [key: string]: Function | string; } | undefined = undefined;
    /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used*     */
    @Input() public headerGroupComponent: string | { new(): IHeaderGroupComp; } | undefined = undefined;
    /** The custom header group component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used*     */
    @Input() public headerGroupComponentFramework: any = undefined;
    /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used*     */
    @Input() public headerGroupComponentParams: any = undefined;
    /** An object of css values. Or a function returning an object of css values.     */
    @Input() public cellStyle: { [cssProperty: string]: string } | CellStyleFunc | undefined = undefined;
    @Input() public cellRendererParams: any = undefined;
    @Input() public cellEditorFramework: any = undefined;
    @Input() public cellEditorParams: any = undefined;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
     */
    @Input() public pinnedRowCellRendererFramework: any = undefined;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
     */
    @Input() public pinnedRowCellRendererParams: any = undefined;
    @Input() public filterFramework: any = undefined;
    @Input() public filterParams: any = undefined;
    /** The custom header component to be used for rendering the component header. If none specified the default AG Grid is used*     */
    @Input() public headerComponent: string | { new(): any; } | undefined = undefined;
    /** The custom header component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used*     */
    @Input() public headerComponentFramework: any = undefined;
    /** The custom header component parameters*     */
    @Input() public headerComponentParams: any = undefined;
    @Input() public floatingFilterComponent: any = undefined;
    @Input() public floatingFilterComponentParams: any = undefined;
    @Input() public floatingFilterComponentFramework: any = undefined;
    @Input() public tooltipComponent: { new(): ITooltipComp; } | string | undefined = undefined;
    @Input() public tooltipComponentParams: any = undefined;
    @Input() public tooltipComponentFramework: any = undefined;
    @Input() public refData: { [key: string]: string; } | undefined = undefined;
    /** Params to customise the columns menu behaviour and appearance     */
    @Input() public columnsMenuParams: ColumnsMenuParams | undefined = undefined;
    /** The name to render in the column header     */
    @Input() public headerName: string | undefined = undefined;
    /** Whether to show the column when the group is open / closed.     */
    @Input() public columnGroupShow: string | undefined = undefined;
    /** CSS class for the header     */
    @Input() public headerClass: HeaderClass | undefined = undefined;
    /** CSS class for the toolPanel     */
    @Input() public toolPanelClass: ToolPanelClass | undefined = undefined;
    /** Expression or function to get the value for display in the header.     */
    @Input() public headerValueGetter: string | HeaderValueGetterFunc | undefined = undefined;
    /** Group ID     */
    @Input() public groupId: string | undefined = undefined;
    /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
     * If both field and colId are missing, a unique ID will be generated.
     * This ID is used to identify the column in the API for sorting, filtering etc.     */
    @Input() public colId: string | undefined = undefined;
    /** If sorting by default, set it here. Set to 'asc' or 'desc'     */
    @Input() public sort: string | null | undefined = undefined;
    @Input() public initialSort: string | undefined = undefined;
    /** The field of the row to get the cells data from     */
    @Input() public field: string | undefined = undefined;
    /** A comma separated string or array of strings containing ColumnType keys which can be used as a template for a column.
     * This helps to reduce duplication of properties when you have a lot of common column properties.     */
    @Input() public type: string | string[] | undefined = undefined;
    /** The field where we get the tooltip on the object     */
    @Input() public tooltipField: string | undefined = undefined;
    /** Tooltip for the column header     */
    @Input() public headerTooltip: string | undefined = undefined;
    /** Class to use for the cell. Can be string, array of strings, or function.     */
    @Input() public cellClass: string | string[] | CellClassFunc | undefined = undefined;
    /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group.     */
    @Input() public showRowGroup: string | boolean | undefined = undefined;
    @Input() public filter: any = undefined;
    @Input() public initialAggFunc: string | IAggFunc | undefined = undefined;
    /** Name of function to use for aggregation. One of [sum,min,max,first,last] or a function.     */
    @Input() public aggFunc: string | IAggFunc | null | undefined = undefined;
    /** A function for rendering a cell.     */
    @Input() public cellRenderer: { new(): ICellRendererComp; } | ICellRendererFunc | string | undefined = undefined;
    /** Cell editor     */
    @Input() public cellEditor: string | { new(): ICellEditorComp; } | undefined = undefined;
    /** Whether this column is pinned or not.     */
    @Input() public pinned: boolean | string | null | undefined = undefined;
    @Input() public initialPinned: boolean | string | undefined = undefined;
    /** Defines the column data type used when charting     */
    @Input() public chartDataType: 'category' | 'series' | 'time' | 'excluded' | undefined = undefined;
    @Input() public cellEditorPopupPosition: string | undefined = undefined;
    /** @deprecated since v24 - use sortIndex instead
     */
    @Input() public sortedAt: number | undefined = undefined;
    /** If sorting more than one column by default, specifies order in which the sorting should be applied.     */
    @Input() public sortIndex: number | null | undefined = undefined;
    @Input() public initialSortIndex: number | undefined = undefined;
    /** Sets the grow factor of a column. It specifies how much of the remaining
     * space should be assigned to the column.     */
    @Input() public flex: number | undefined = undefined;
    @Input() public initialFlex: number | undefined = undefined;
    /** Actual width, in pixels, of the cell     */
    @Input() public width: number | undefined = undefined;
    /** Default width, in pixels, of the cell     */
    @Input() public initialWidth: number | undefined = undefined;
    /** Min width, in pixels, of the cell     */
    @Input() public minWidth: number | undefined = undefined;
    /** Max width, in pixels, of the cell     */
    @Input() public maxWidth: number | undefined = undefined;
    /** To group by this column by default, either provide an index (eg rowGroupIndex=1), or set rowGroup=true.     */
    @Input() public rowGroupIndex: number | null | undefined = undefined;
    @Input() public initialRowGroupIndex: number | undefined = undefined;
    /** To pivot by this column by default, either provide an index (eg pivotIndex=1), or set pivot=true.     */
    @Input() public pivotIndex: number | null | undefined = undefined;
    @Input() public initialPivotIndex: number | undefined = undefined;
    /** For native drag and drop, set to true to allow custom onRowDrag processing     */
    @Input() public dndSourceOnRowDrag: ((params: { rowNode: RowNode, dragEvent: DragEvent; }) => void) | undefined = undefined;
    /** Expression or function to get the cells value.     */
    @Input() public valueGetter: string | ValueGetterFunc | undefined = undefined;
    /** If not using a field, then this puts the value into the cell     */
    @Input() public valueSetter: string | ValueSetterFunc | undefined = undefined;
    /** Expression or function to get the cells value for filtering.     */
    @Input() public filterValueGetter: string | ValueGetterFunc | undefined = undefined;
    /** Function to return the key for a value - use this if the value is an object (not a primitive type) and you
     * want to a) group by this field or b) use set filter on this field.     */
    @Input() public keyCreator: ((params: KeyCreatorParams) => string) | undefined = undefined;
    @Input() public cellRendererFramework: any = undefined;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
     */
    @Input() public pinnedRowCellRenderer: { new(): ICellRendererComp; } | ICellRendererFunc | string | undefined = undefined;
    /** A function to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering.     */
    @Input() public valueFormatter: string | ValueFormatterFunc | undefined = undefined;
    /** @deprecated Use valueFormatter for pinned rows, and check params.node.rowPinned.
     */
    @Input() public pinnedRowValueFormatter: string | ValueFormatterFunc | undefined = undefined;
    /** Gets called after editing, converts the value in the cell.     */
    @Input() public valueParser: string | ValueParserFunc | undefined = undefined;
    /** Comparator function for custom sorting.     */
    @Input() public comparator: ((valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number) | undefined = undefined;
    /** Comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed.     */
    @Input() public equals: ((valueA: any, valueB: any) => boolean) | undefined = undefined;
    /** Comparator for ordering the pivot columns     */
    @Input() public pivotComparator: ((valueA: string, valueB: string) => number) | undefined = undefined;
    /** Allows the user to suppress certain keyboard events in the grid cell     */
    @Input() public suppressKeyboardEvent: ((params: SuppressKeyboardEventParams) => boolean) | undefined = undefined;
    /** Allows the user to suppress certain keyboard events in the grid header     */
    @Input() public suppressHeaderKeyboardEvent: ((params: SuppressHeaderKeyboardEventParams) => boolean) | undefined = undefined;
    @Input() public colSpan: ((params: ColSpanParams) => number) | undefined = undefined;
    @Input() public rowSpan: ((params: RowSpanParams) => number) | undefined = undefined;
    /** To create the quick filter text for this column, if toString is not good enough on the value.     */
    @Input() public getQuickFilterText: ((params: GetQuickFilterTextParams) => string) | undefined = undefined;
    /** Callbacks for editing. See editing section for further details.
     * Return true if the update was successful, or false if not.
     * If false, then skips the UI refresh and no events are emitted.
     * Return false if the values are the same (ie no update).     */
    @Input() public newValueHandler: ((params: NewValueParams) => boolean) | undefined = undefined;
    /** Callbacks for editing.See editing section for further details.     */
    @Input() public onCellValueChanged: ((event: NewValueParams) => void) | undefined = undefined;
    /** Function callback, gets called when a cell is clicked.     */
    @Input() public onCellClicked: ((event: CellClickedEvent) => void) | undefined = undefined;
    /** Function callback, gets called when a cell is double clicked.     */
    @Input() public onCellDoubleClicked: ((event: CellDoubleClickedEvent) => void) | undefined = undefined;
    /** Function callback, gets called when a cell is right clicked.     */
    @Input() public onCellContextMenu: ((event: CellContextMenuEvent) => void) | undefined = undefined;
    /** To configure the text to be displayed in the floating div while dragging a row when rowDrag is true     */
    @Input() public rowDragText: ((params: IRowDragItem, dragItemCount: number) => string) | undefined = undefined;
    /** The function used to calculate the tooltip of the object, tooltipField takes precedence     */
    @Input() public tooltipValueGetter: ((params: ITooltipParams) => string) | undefined = undefined;
    @Input() public cellRendererSelector: CellRendererSelectorFunc | undefined = undefined;
    @Input() public cellEditorSelector: CellEditorSelectorFunc | undefined = undefined;
    /** Set to true to not flash this column for value changes     */
    @Input() public suppressCellFlash: boolean | undefined = undefined;
    /** Set to true to not include this column in the Columns Tool Panel     */
    @Input() public suppressColumnsToolPanel: boolean | undefined = undefined;
    /** Set to true to not include this column / filter in the Filters Tool Panel     */
    @Input() public suppressFiltersToolPanel: boolean | undefined = undefined;
    /** Open by Default     */
    @Input() public openByDefault: boolean | undefined = undefined;
    /** If true, group cannot be broken up by column moving, child columns will always appear side by side, however you can rearrange child columns within the group     */
    @Input() public marryChildren: boolean | undefined = undefined;
    /** Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field 'visible' and mark it false to hide,
     * however we want all default values to be false and we want columns to be visible by default.     */
    @Input() public hide: boolean | undefined = undefined;
    @Input() public initialHide: boolean | undefined = undefined;
    @Input() public rowGroup: boolean | undefined = undefined;
    @Input() public initialRowGroup: boolean | undefined = undefined;
    @Input() public pivot: boolean | undefined = undefined;
    @Input() public initialPivot: boolean | undefined = undefined;
    /** Set to true to render a selection checkbox in the column.     */
    @Input() public checkboxSelection: boolean | CheckboxSelectionCallback | undefined = undefined;
    /** If true, a 'select all' checkbox will be put into the header     */
    @Input() public headerCheckboxSelection: boolean | HeaderCheckboxSelectionCallback | undefined = undefined;
    /** If true, the header checkbox selection will work on filtered items     */
    @Input() public headerCheckboxSelectionFilteredOnly: boolean | undefined = undefined;
    /** Set to true if no menu should be shown for this column header.     */
    @Input() public suppressMenu: boolean | undefined = undefined;
    /** Set to true to not allow moving this column via dragging it's header     */
    @Input() public suppressMovable: boolean | undefined = undefined;
    /** Set to true to make sure this column is always first. Other columns, if movable, cannot move before this column.     */
    @Input() public lockPosition: boolean | undefined = undefined;
    /** Set to true to block the user showing / hiding the column, the column can only be shown / hidden via definitions or API     */
    @Input() public lockVisible: boolean | undefined = undefined;
    /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API     */
    @Input() public lockPinned: boolean | undefined = undefined;
    /** Set to true if you want the unsorted icon to be shown when no sort is applied to this column.     */
    @Input() public unSortIcon: boolean | undefined = undefined;
    /** Set to true if you want this columns width to be fixed during 'size to fit' operation.     */
    @Input() public suppressSizeToFit: boolean | undefined = undefined;
    /** Set to true if you do not want this column to be auto-resizable by double clicking it's edge.     */
    @Input() public suppressAutoSize: boolean | undefined = undefined;
    /** If true, GUI will allow adding this columns as a row group     */
    @Input() public enableRowGroup: boolean | undefined = undefined;
    /** If true, GUI will allow adding this columns as a pivot     */
    @Input() public enablePivot: boolean | undefined = undefined;
    /** If true, GUI will allow adding this columns as a value     */
    @Input() public enableValue: boolean | undefined = undefined;
    /** Set to true if this col is editable, otherwise false. Can also be a function to have different rows editable.     */
    @Input() public editable: boolean | EditableCallback | undefined = undefined;
    /** Set to true if this col should not be allowed take new values from the clipboard .     */
    @Input() public suppressPaste: boolean | SuppressPasteCallback | undefined = undefined;
    /** Set to true if this col should not be navigable with the tab key. Can also be a function to have different rows editable.     */
    @Input() public suppressNavigable: boolean | SuppressNavigableCallback | undefined = undefined;
    /** If true, grid will flash cell after cell is refreshed     */
    @Input() public enableCellChangeFlash: boolean | undefined = undefined;
    /** For grid row dragging, set to true to enable row dragging within the grid     */
    @Input() public rowDrag: boolean | RowDragCallback | undefined = undefined;
    /** For native drag and drop, set to true to enable drag source     */
    @Input() public dndSource: boolean | DndSourceCallback | undefined = undefined;
    /** True if this column should stretch rows height to fit contents     */
    @Input() public autoHeight: boolean | undefined = undefined;
    /** True if this column should wrap cell contents - typically used with autoHeight     */
    @Input() public wrapText: boolean | undefined = undefined;
    /** Set to true if sorting allowed for this column.     */
    @Input() public sortable: boolean | undefined = undefined;
    /** Set to true if this column should be resizable     */
    @Input() public resizable: boolean | undefined = undefined;
    /** If true, this cell will be in editing mode after first click.     */
    @Input() public singleClickEdit: boolean | undefined = undefined;
    /** Whether to display a floating filter for this column.     */
    @Input() public floatingFilter: boolean | undefined = undefined;
    @Input() public cellEditorPopup: boolean | undefined = undefined;
    /** Set to true to prevent the fillHandle from being rendered in any cell that belongs to this column     */
    @Input() public suppressFillHandle: boolean | undefined = undefined;

    // Enable type coercion for boolean Inputs to support use like 'enableCharts' instead of forcing '[enableCharts]="true"' 
    // https://angular.io/guide/template-typecheck#input-setter-coercion 
    static ngAcceptInputType_suppressCellFlash: boolean | null | '';
    static ngAcceptInputType_suppressColumnsToolPanel: boolean | null | '';
    static ngAcceptInputType_suppressFiltersToolPanel: boolean | null | '';
    static ngAcceptInputType_openByDefault: boolean | null | '';
    static ngAcceptInputType_marryChildren: boolean | null | '';
    static ngAcceptInputType_hide: boolean | null | '';
    static ngAcceptInputType_initialHide: boolean | null | '';
    static ngAcceptInputType_rowGroup: boolean | null | '';
    static ngAcceptInputType_initialRowGroup: boolean | null | '';
    static ngAcceptInputType_pivot: boolean | null | '';
    static ngAcceptInputType_initialPivot: boolean | null | '';
    static ngAcceptInputType_checkboxSelection: boolean | null | '';
    static ngAcceptInputType_headerCheckboxSelection: boolean | null | '';
    static ngAcceptInputType_headerCheckboxSelectionFilteredOnly: boolean | null | '';
    static ngAcceptInputType_suppressMenu: boolean | null | '';
    static ngAcceptInputType_suppressMovable: boolean | null | '';
    static ngAcceptInputType_lockPosition: boolean | null | '';
    static ngAcceptInputType_lockVisible: boolean | null | '';
    static ngAcceptInputType_lockPinned: boolean | null | '';
    static ngAcceptInputType_unSortIcon: boolean | null | '';
    static ngAcceptInputType_suppressSizeToFit: boolean | null | '';
    static ngAcceptInputType_suppressAutoSize: boolean | null | '';
    static ngAcceptInputType_enableRowGroup: boolean | null | '';
    static ngAcceptInputType_enablePivot: boolean | null | '';
    static ngAcceptInputType_enableValue: boolean | null | '';
    static ngAcceptInputType_editable: boolean | null | '';
    static ngAcceptInputType_suppressPaste: boolean | null | '';
    static ngAcceptInputType_suppressNavigable: boolean | null | '';
    static ngAcceptInputType_enableCellChangeFlash: boolean | null | '';
    static ngAcceptInputType_rowDrag: boolean | null | '';
    static ngAcceptInputType_dndSource: boolean | null | '';
    static ngAcceptInputType_autoHeight: boolean | null | '';
    static ngAcceptInputType_wrapText: boolean | null | '';
    static ngAcceptInputType_sortable: boolean | null | '';
    static ngAcceptInputType_resizable: boolean | null | '';
    static ngAcceptInputType_singleClickEdit: boolean | null | '';
    static ngAcceptInputType_floatingFilter: boolean | null | '';
    static ngAcceptInputType_cellEditorPopup: boolean | null | '';
    static ngAcceptInputType_suppressFillHandle: boolean | null | '';
    // @END@

}
