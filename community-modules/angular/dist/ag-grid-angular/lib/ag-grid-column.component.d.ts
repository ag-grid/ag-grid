import { CellClassFunc, CellClassRules, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditorSelectorFunc, CellRendererSelectorFunc, CellStyleFunc, CheckboxSelectionCallback, ColDef, ColGroupDef, ColSpanParams, ColumnsMenuParams, DndSourceCallback, EditableCallback, GetQuickFilterTextParams, HeaderCheckboxSelectionCallback, HeaderClass, IAggFunc, ICellEditorComp, ICellRendererComp, ICellRendererFunc, IHeaderGroupComp, IRowDragItem, ITooltipComp, ITooltipParams, NewValueParams, RowDragCallback, RowNode, RowSpanParams, SuppressHeaderKeyboardEventParams, SuppressKeyboardEventParams, SuppressNavigableCallback, SuppressPasteCallback, ToolPanelClass, ValueFormatterFunc, ValueGetterFunc, ValueParserFunc, ValueSetterFunc } from "@ag-grid-community/core";
import { QueryList } from "@angular/core";
export declare class AgGridColumn {
    childColumns: QueryList<AgGridColumn>;
    hasChildColumns(): boolean;
    toColDef(): ColDef;
    private getChildColDefs;
    private createColDefFromGridColumn;
    /** Columns in this group     */
    children: (ColDef | ColGroupDef)[] | undefined;
    /** The sort order, provide an array with any of the following in any order ['asc','desc',null]     */
    sortingOrder: (string | null)[] | undefined;
    /** Agg funcs allowed on this column. If missing, all installed agg funcs are allowed.
     * Can be eg ['sum','avg']. This will restrict what the GUI allows to select only.     */
    allowedAggFuncs: string[] | undefined;
    /** The menu tabs to show, and in which order, the valid values for this property are:
     * filterMenuTab, generalMenuTab, columnsMenuTab     *     */
    menuTabs: string[] | undefined;
    /** Rules for applying css classes     */
    cellClassRules: CellClassRules | undefined;
    /** Icons for this column. Leave blank to use default.     */
    icons: {
        [key: string]: Function | string;
    } | undefined;
    /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used*     */
    headerGroupComponent: string | {
        new (): IHeaderGroupComp;
    } | undefined;
    /** The custom header group component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used*     */
    headerGroupComponentFramework: any | undefined;
    /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used*     */
    headerGroupComponentParams: any | undefined;
    /** An object of css values. Or a function returning an object of css values.     */
    cellStyle: {
        [cssProperty: string]: string;
    } | CellStyleFunc | undefined;
    cellRendererParams: any | undefined;
    cellEditorFramework: any | undefined;
    cellEditorParams: any | undefined;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
     */
    pinnedRowCellRendererFramework: any | undefined;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
     */
    pinnedRowCellRendererParams: any | undefined;
    filterFramework: any;
    filterParams: any;
    /** The custom header component to be used for rendering the component header. If none specified the default AG Grid is used*     */
    headerComponent: string | {
        new (): any;
    } | undefined;
    /** The custom header component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used*     */
    headerComponentFramework: any | undefined;
    /** The custom header component parameters*     */
    headerComponentParams: any | undefined;
    floatingFilterComponent: any;
    floatingFilterComponentParams: any;
    floatingFilterComponentFramework: any;
    tooltipComponent: {
        new (): ITooltipComp;
    } | string | undefined;
    tooltipComponentParams: any | undefined;
    tooltipComponentFramework: any | undefined;
    refData: {
        [key: string]: string;
    } | undefined;
    /** Params to customise the columns menu behaviour and appearance     */
    columnsMenuParams: ColumnsMenuParams | undefined;
    /** The name to render in the column header     */
    headerName: string | undefined;
    /** Whether to show the column when the group is open / closed.     */
    columnGroupShow: string | undefined;
    /** CSS class for the header     */
    headerClass: HeaderClass | undefined;
    /** CSS class for the toolPanel     */
    toolPanelClass: ToolPanelClass | undefined;
    /** Expression or function to get the cells value.     */
    headerValueGetter: string | Function | undefined;
    /** Group ID     */
    groupId: string | undefined;
    /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
     * If both field and colId are missing, a unique ID will be generated.
     * This ID is used to identify the column in the API for sorting, filtering etc.     */
    colId: string | undefined;
    /** If sorting by default, set it here. Set to 'asc' or 'desc'     */
    sort: string | null | undefined;
    initialSort: string | undefined;
    /** The field of the row to get the cells data from     */
    field: string | undefined;
    /** A comma separated string or array of strings containing ColumnType keys which can be used as a template for a column.
     * This helps to reduce duplication of properties when you have a lot of common column properties.     */
    type: string | string[] | undefined;
    /** The field where we get the tooltip on the object     */
    tooltipField: string | undefined;
    /** Tooltip for the column header     */
    headerTooltip: string | undefined;
    /** Class to use for the cell. Can be string, array of strings, or function.     */
    cellClass: string | string[] | CellClassFunc | undefined;
    /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group.     */
    showRowGroup: string | boolean | undefined;
    filter: any;
    initialAggFunc: string | IAggFunc | undefined;
    /** Name of function to use for aggregation. One of [sum,min,max,first,last] or a function.     */
    aggFunc: string | IAggFunc | null | undefined;
    /** A function for rendering a cell.     */
    cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    /** Cell editor     */
    cellEditor: string | {
        new (): ICellEditorComp;
    } | undefined;
    /** Whether this column is pinned or not.     */
    pinned: boolean | string | null | undefined;
    initialPinned: boolean | string | undefined;
    /** Defines the column data type used when charting     */
    chartDataType: 'category' | 'series' | 'time' | 'excluded' | undefined;
    cellEditorPopupPosition: string | undefined;
    /** @deprecated since v24 - use sortIndex instead
     */
    sortedAt: number | undefined;
    /** If sorting more than one column by default, specifies order in which the sorting should be applied.     */
    sortIndex: number | null | undefined;
    initialSortIndex: number | undefined;
    /** Sets the grow factor of a column. It specifies how much of the remaining
     * space should be assigned to the column.     */
    flex: number | undefined;
    initialFlex: number | undefined;
    /** Actual width, in pixels, of the cell     */
    width: number | undefined;
    /** Default width, in pixels, of the cell     */
    initialWidth: number | undefined;
    /** Min width, in pixels, of the cell     */
    minWidth: number | undefined;
    /** Max width, in pixels, of the cell     */
    maxWidth: number | undefined;
    /** To group by this column by default, either provide an index (eg rowGroupIndex=1), or set rowGroup=true.     */
    rowGroupIndex: number | null | undefined;
    initialRowGroupIndex: number | undefined;
    /** To pivot by this column by default, either provide an index (eg pivotIndex=1), or set pivot=true.     */
    pivotIndex: number | null | undefined;
    initialPivotIndex: number | undefined;
    /** For native drag and drop, set to true to allow custom onRowDrag processing     */
    dndSourceOnRowDrag: (params: {
        rowNode: RowNode;
        dragEvent: DragEvent;
    }) => void | undefined;
    /** Expression or function to get the cells value.     */
    valueGetter: string | ValueGetterFunc | undefined;
    /** If not using a field, then this puts the value into the cell     */
    valueSetter: string | ValueSetterFunc | undefined;
    /** Expression or function to get the cells value for filtering.     */
    filterValueGetter: string | ValueGetterFunc | undefined;
    /** Function to return the key for a value - use this if the value is an object (not a primitive type) and you
     * want to a) group by this field or b) use set filter on this field.     */
    keyCreator: (value: any) => string | undefined;
    cellRendererFramework: any | undefined;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
     */
    pinnedRowCellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    /** A function to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering.     */
    valueFormatter: string | ValueFormatterFunc | undefined;
    /** @deprecated Use valueFormatter for pinned rows, and check params.node.rowPinned.
     */
    pinnedRowValueFormatter: string | ValueFormatterFunc | undefined;
    /** Gets called after editing, converts the value in the cell.     */
    valueParser: string | ValueParserFunc | undefined;
    /** Comparator function for custom sorting.     */
    comparator: (valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number | undefined;
    /** Comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed.     */
    equals: (valueA: any, valueB: any) => boolean | undefined;
    /** Comparator for ordering the pivot columns     */
    pivotComparator: (valueA: string, valueB: string) => number | undefined;
    /** Allows the user to suppress certain keyboard events in the grid cell     */
    suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => boolean | undefined;
    /** Allows the user to suppress certain keyboard events in the grid header     */
    suppressHeaderKeyboardEvent: (params: SuppressHeaderKeyboardEventParams) => boolean | undefined;
    colSpan: (params: ColSpanParams) => number | undefined;
    rowSpan: (params: RowSpanParams) => number | undefined;
    /** To create the quick filter text for this column, if toString is not good enough on the value.     */
    getQuickFilterText: (params: GetQuickFilterTextParams) => string | undefined;
    /** Callbacks for editing. See editing section for further details.
     * Return true if the update was successful, or false if not.
     * If false, then skips the UI refresh and no events are emitted.
     * Return false if the values are the same (ie no update).     */
    newValueHandler: (params: NewValueParams) => boolean | undefined;
    /** Callbacks for editing.See editing section for further details.     */
    onCellValueChanged: (event: NewValueParams) => void | undefined;
    /** Function callback, gets called when a cell is clicked.     */
    onCellClicked: (event: CellClickedEvent) => void | undefined;
    /** Function callback, gets called when a cell is double clicked.     */
    onCellDoubleClicked: (event: CellDoubleClickedEvent) => void | undefined;
    /** Function callback, gets called when a cell is right clicked.     */
    onCellContextMenu: (event: CellContextMenuEvent) => void | undefined;
    /** To configure the text to be displayed in the floating div while dragging a row when rowDrag is true     */
    rowDragText: (params: IRowDragItem, dragItemCount: number) => string | undefined;
    /** The function used to calculate the tooltip of the object, tooltipField takes precedence     */
    tooltipValueGetter: (params: ITooltipParams) => string | undefined;
    cellRendererSelector: CellRendererSelectorFunc | undefined;
    cellEditorSelector: CellEditorSelectorFunc | undefined;
    /** Set to true to not flash this column for value changes     */
    suppressCellFlash: boolean | undefined;
    /** Set to true to not include this column in the Columns Tool Panel     */
    suppressColumnsToolPanel: boolean | undefined;
    /** Set to true to not include this column / filter in the Filters Tool Panel     */
    suppressFiltersToolPanel: boolean | undefined;
    /** Open by Default     */
    openByDefault: boolean | undefined;
    /** If true, group cannot be broken up by column moving, child columns will always appear side by side, however you can rearrange child columns within the group     */
    marryChildren: boolean | undefined;
    /** Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field 'visible' and mark it false to hide,
     * however we want all default values to be false and we want columns to be visible by default.     */
    hide: boolean | undefined;
    initialHide: boolean | undefined;
    rowGroup: boolean | undefined;
    initialRowGroup: boolean | undefined;
    pivot: boolean | undefined;
    initialPivot: boolean | undefined;
    /** Set to true to render a selection checkbox in the column.     */
    checkboxSelection: boolean | CheckboxSelectionCallback | undefined;
    /** If true, a 'select all' checkbox will be put into the header     */
    headerCheckboxSelection: boolean | HeaderCheckboxSelectionCallback | undefined;
    /** If true, the header checkbox selection will work on filtered items     */
    headerCheckboxSelectionFilteredOnly: boolean | undefined;
    /** Set to true if no menu should be shown for this column header.     */
    suppressMenu: boolean | undefined;
    /** Set to true to not allow moving this column via dragging it's header     */
    suppressMovable: boolean | undefined;
    /** Set to true to make sure this column is always first. Other columns, if movable, cannot move before this column.     */
    lockPosition: boolean | undefined;
    /** Set to true to block the user showing / hiding the column, the column can only be shown / hidden via definitions or API     */
    lockVisible: boolean | undefined;
    /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API     */
    lockPinned: boolean | undefined;
    /** Set to true if you want the unsorted icon to be shown when no sort is applied to this column.     */
    unSortIcon: boolean | undefined;
    /** Set to true if you want this columns width to be fixed during 'size to fit' operation.     */
    suppressSizeToFit: boolean | undefined;
    /** Set to true if you do not want this column to be auto-resizable by double clicking it's edge.     */
    suppressAutoSize: boolean | undefined;
    /** If true, GUI will allow adding this columns as a row group     */
    enableRowGroup: boolean | undefined;
    /** If true, GUI will allow adding this columns as a pivot     */
    enablePivot: boolean | undefined;
    /** If true, GUI will allow adding this columns as a value     */
    enableValue: boolean | undefined;
    /** Set to true if this col is editable, otherwise false. Can also be a function to have different rows editable.     */
    editable: boolean | EditableCallback | undefined;
    /** Set to true if this col should not be allowed take new values from the clipboard .     */
    suppressPaste: boolean | SuppressPasteCallback | undefined;
    /** Set to true if this col should not be navigable with the tab key. Can also be a function to have different rows editable.     */
    suppressNavigable: boolean | SuppressNavigableCallback | undefined;
    /** If true, grid will flash cell after cell is refreshed     */
    enableCellChangeFlash: boolean | undefined;
    /** For grid row dragging, set to true to enable row dragging within the grid     */
    rowDrag: boolean | RowDragCallback | undefined;
    /** For native drag and drop, set to true to enable drag source     */
    dndSource: boolean | DndSourceCallback | undefined;
    /** True if this column should stretch rows height to fit contents     */
    autoHeight: boolean | undefined;
    /** True if this column should wrap cell contents - typically used with autoHeight     */
    wrapText: boolean | undefined;
    /** Set to true if sorting allowed for this column.     */
    sortable: boolean | undefined;
    /** Set to true if this column should be resizable     */
    resizable: boolean | undefined;
    /** If true, this cell will be in editing mode after first click.     */
    singleClickEdit: boolean | undefined;
    /** Whether to display a floating filter for this column.     */
    floatingFilter: boolean | undefined;
    cellEditorPopup: boolean | undefined;
}
