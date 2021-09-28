import { CellClassFunc, CellClassRules, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditorSelectorFunc, CellRendererSelectorFunc, CellStyle, CellStyleFunc, CheckboxSelectionCallback, ColDef, ColGroupDef, ColSpanParams, ColumnsMenuParams, DndSourceCallback, EditableCallback, GetQuickFilterTextParams, HeaderCheckboxSelectionCallback, HeaderClass, HeaderValueGetterFunc, IAggFunc, ICellEditorComp, ICellRendererComp, ICellRendererFunc, IHeaderGroupComp, IRowDragItem, ITooltipComp, ITooltipParams, KeyCreatorParams, NewValueParams, RowDragCallback, RowNode, RowSpanParams, SuppressHeaderKeyboardEventParams, SuppressKeyboardEventParams, SuppressNavigableCallback, SuppressPasteCallback, ToolPanelClass, ValueFormatterFunc, ValueGetterFunc, ValueParserFunc, ValueSetterFunc } from "ag-grid-community";
import { QueryList } from "@angular/core";
export declare class AgGridColumn {
    childColumns: QueryList<AgGridColumn>;
    hasChildColumns(): boolean;
    toColDef(): ColDef;
    private getChildColDefs;
    private createColDefFromGridColumn;
    filterFramework: any;
    filterParams: any;
    floatingFilterComponent: any;
    floatingFilterComponentParams: any;
    floatingFilterComponentFramework: any;
    filter: any;
    /** The name to render in the column header. If not specified and field is specified, the field name will be used as the header name.     */
    headerName: string | undefined;
    /** Function or expression. Gets the value for display in the header.     */
    headerValueGetter: string | HeaderValueGetterFunc | undefined;
    /** Whether to show the column when the group is open / closed.     */
    /** Tooltip for the column header     */
    headerTooltip: string | undefined;
    /** CSS class to use for the header cell. Can be a string, array of strings, or function.     */
    headerClass: HeaderClass | undefined;
    /** Suppress the grid taking action for the relevant keyboard event when a header is focused.     */
    suppressHeaderKeyboardEvent: ((params: SuppressHeaderKeyboardEventParams) => boolean) | undefined;
    /** Whether to show the column when the group is open / closed.     */
    columnGroupShow: string | undefined;
    /** CSS class to use for the tool panel cell. Can be a string, array of strings, or function.     */
    toolPanelClass: ToolPanelClass | undefined;
    /** Set to `true` if you do not want this column or group to appear in the Columns Tool Panel.     */
    suppressColumnsToolPanel: boolean | undefined;
    /** Set to `true` if you do not want this column (filter) or group (filter group) to appear in the Filters Tool Panel.     */
    suppressFiltersToolPanel: boolean | undefined;
    tooltipComponent: {
        new (): ITooltipComp;
    } | string | undefined;
    tooltipComponentFramework: any;
    tooltipComponentParams: any;
    /** A list containing a mix of columns and column groups.     */
    children: (ColDef | ColGroupDef)[] | undefined;
    /** The unique ID to give the column. This is optional. If missing, a unique ID will be generated. This ID is used to identify the column group in the column API.     */
    groupId: string | undefined;
    /** Set to `true` if this group should be opened by default.     */
    openByDefault: boolean | undefined;
    /** Set to `true` to keep columns in this group beside each other in the grid. Moving the columns outside of the group (and hence breaking the group) is not allowed.     */
    marryChildren: boolean | undefined;
    /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used*     */
    headerGroupComponent: string | {
        new (): IHeaderGroupComp;
    } | undefined;
    /** The custom header group component to be used for rendering the component header in the hosting framework (ie: Angular/React/VueJs). If none specified the default AG Grid is used*     */
    headerGroupComponentFramework: any;
    /** The params used to configure the header group component.     *     */
    headerGroupComponentParams: any;
    /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
     * If both field and colId are missing, a unique ID will be generated.
     * This ID is used to identify the column in the API for sorting, filtering etc.     */
    colId: string | undefined;
    /** The field of the row to get the cells data from     */
    field: string | undefined;
    /** A comma separated string or array of strings containing `ColumnType` keys which can be used as a template for a column.
     * This helps to reduce duplication of properties when you have a lot of common column properties.     */
    type: string | string[] | undefined;
    /** Function or expression. Gets the value from your data for display.     */
    valueGetter: string | ValueGetterFunc | undefined;
    /** A function or expression to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering.     */
    valueFormatter: string | ValueFormatterFunc | undefined;
    /** Provided a reference data map to be used to map column values to their respective value from the map.     */
    refData: {
        [key: string]: string;
    } | undefined;
    /** Function to return a string key for a value.
     * This string is used for grouping, Set filtering, and searching within cell editor dropdowns.
     * When filtering and searching the string is exposed to the user, so make sure to return a human-readable value.     */
    keyCreator: ((params: KeyCreatorParams) => string) | undefined;
    /** Custom comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed.
     * By default the grid uses `===` is used which should work for most use cases.     */
    equals: ((valueA: any, valueB: any) => boolean) | undefined;
    /** The field of the tooltip to apply to the cell.     */
    tooltipField: string | undefined;
    /** Callback that should return the string used for a tooltip, `tooltipField` takes precedence if set.     */
    tooltipValueGetter: ((params: ITooltipParams) => string) | undefined;
    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to render a selection checkbox in the column.     */
    checkboxSelection: boolean | CheckboxSelectionCallback | undefined;
    /** Icons to use inside the column instead of the grid's default icons. Leave undefined to use defaults.     */
    icons: {
        [key: string]: Function | string;
    } | undefined;
    /** Set to `true` if this column is not navigable (i.e. cannot be tabbed into), otherwise `false`.
     * Can also be a callback function to have different rows navigable.     */
    suppressNavigable: boolean | SuppressNavigableCallback | undefined;
    /** Allows the user to suppress certain keyboard events in the grid cell     */
    suppressKeyboardEvent: ((params: SuppressKeyboardEventParams) => boolean) | undefined;
    /** Pasting is on by default as long as cells are editable (non-editable cells cannot be modified, even with a paste operation).
     * Set to `true` turn paste operations off.     */
    suppressPaste: boolean | SuppressPasteCallback | undefined;
    /** Set to true to prevent the fillHandle from being rendered in any cell that belongs to this column     */
    suppressFillHandle: boolean | undefined;
    /** Set to `true` for this column to be hidden.     */
    hide: boolean | undefined;
    /** Same as 'hide', except only applied when creating a new column. Not applied when updating column definitions.     */
    initialHide: boolean | undefined;
    /** Set to `true` to block making column visible / hidden via the UI (API will still work).     */
    lockVisible: boolean | undefined;
    /** Set to `true` to always have this column displayed first.     */
    lockPosition: boolean | undefined;
    /** Set to `true` if you do not want this column to be movable via dragging.     */
    suppressMovable: boolean | undefined;
    /** Set to `true` if this column is editable, otherwise `false`. Can also be a function to have different rows editable.     */
    editable: boolean | EditableCallback | undefined;
    /** Function or expression. Sets the value into your data for saving. Return `true` if the data changed.     */
    valueSetter: string | ValueSetterFunc | undefined;
    /** Function or expression. Parses the value for saving.     */
    valueParser: string | ValueParserFunc | undefined;
    /** A `cellEditor` to use for this column.     */
    cellEditor: string | {
        new (): ICellEditorComp;
    } | undefined;
    /** Framework `cellEditor` to use for this column.     */
    cellEditorFramework: any;
    /** Params to be passed to the cell editor component.     */
    cellEditorParams: any;
    /** Callback to select which cell editor to be used for a given row within the same column.     */
    cellEditorSelector: CellEditorSelectorFunc | undefined;
    /** Set to `true` to have cells under this column enter edit mode after single click.     */
    singleClickEdit: boolean | undefined;
    /** @deprecated use `valueSetter` instead
     */
    newValueHandler: ((params: NewValueParams) => boolean) | undefined;
    /** Set to `true`, to have the cell editor appear in a popup.     */
    cellEditorPopup: boolean | undefined;
    /** Set the position for the popup cell editor. Possible values are
     *   - `over` Popup will be positioned over the cell
     *   - `under` Popup will be positioned below the cell leaving the cell value visible.
     *
     * The default is `over`.     */
    cellEditorPopupPosition: string | undefined;
    /** Callback for after the value of a cell has changed, either due to editing or the application calling `api.setValue()`.     */
    onCellValueChanged: ((event: NewValueParams) => void) | undefined;
    /** Callback called when a cell is clicked.     */
    onCellClicked: ((event: CellClickedEvent) => void) | undefined;
    /** Callback called when a cell is double clicked.     */
    onCellDoubleClicked: ((event: CellDoubleClickedEvent) => void) | undefined;
    /** Callback called when a cell is right clicked.     */
    onCellContextMenu: ((event: CellContextMenuEvent) => void) | undefined;
    /** A function to tell the grid what quick filter text to use for this column if you don't want to use the default (which is calling `toString` on the value).     */
    getQuickFilterText: ((params: GetQuickFilterTextParams) => string) | undefined;
    /** Function or expression. Gets the value for filtering purposes.     */
    filterValueGetter: string | ValueGetterFunc | undefined;
    /** Whether to display a floating filter for this column.     */
    floatingFilter: boolean | undefined;
    /** The custom header component to be used for rendering the component header. If none specified the default AG Grid header component is used.     *     */
    headerComponent: string | {
        new (): any;
    } | undefined;
    /** The custom header component to be used for rendering the component header in the hosting framework (ie: Angular/React/VueJs). If none specified the default AG Grid header component is used*     */
    headerComponentFramework: any;
    /** The parameters to be passed to the header component.     *     */
    headerComponentParams: any;
    /** Set to an array containing zero, one or many of the following options: `'filterMenuTab' | 'generalMenuTab' | 'columnsMenuTab'`.
     * This is used to figure out which menu tabs are present and in which order the tabs are shown.     */
    menuTabs: string[] | undefined;
    /** Params used to change the behaviour and appearance of the Columns Menu tab.     */
    columnsMenuParams: ColumnsMenuParams | undefined;
    /** Set to `true` if no menu should be shown for this column header.     */
    suppressMenu: boolean | undefined;
    /** If `true` or the callback returns `true`, a 'select all' checkbox will be put into the header.     */
    headerCheckboxSelection: boolean | HeaderCheckboxSelectionCallback | undefined;
    /** If `true`, the header checkbox selection will only select filtered items.     */
    headerCheckboxSelectionFilteredOnly: boolean | undefined;
    /** Defines the chart data type that should be used for a column.     */
    chartDataType: 'category' | 'series' | 'time' | 'excluded' | undefined;
    /** Pin a column to one side: `right` or `left`. A value of `true` is converted to `'left'`.     */
    pinned: boolean | string | null | undefined;
    /** Same as 'pinned', except only applied when creating a new column. Not applied when updating column definitions.     */
    initialPinned: boolean | string | undefined;
    /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API     */
    lockPinned: boolean | undefined;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
     */
    pinnedRowCellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
     */
    pinnedRowCellRendererFramework: any;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
     */
    pinnedRowCellRendererParams: any;
    /** @deprecated Use valueFormatter for pinned rows, and check params.node.rowPinned.
     */
    pinnedRowValueFormatter: string | ValueFormatterFunc | undefined;
    /** Set to true to pivot by this column.     */
    pivot: boolean | undefined;
    /** Same as 'pivot', except only applied when creating a new column. Not applied when updating column definitions.     */
    initialPivot: boolean | undefined;
    /** Set this in columns you want to pivot by.
     * If only pivoting by one column, set this to any number (e.g. `0`).
     * If pivoting by multiple columns, set this to where you want this column to be in the order of pivots (e.g. `0` for first, `1` for second, and so on).     */
    pivotIndex: number | null | undefined;
    /** Same as 'pivotIndex', except only applied when creating a new column. Not applied when updating column definitions.     */
    initialPivotIndex: number | undefined;
    /** Comparator to use when ordering the pivot columns, when this column is used to pivot on.
     * The values will always be strings, as the pivot service uses strings as keys for the pivot groups.     */
    pivotComparator: ((valueA: string, valueB: string) => number) | undefined;
    /** Set to `true` if you want to be able to pivot by this column via the GUI. This will not block the API or properties being used to achieve pivot.     */
    enablePivot: boolean | undefined;
    /** An object of css values / or function returning an object of css values for a particular cell.     */
    cellStyle: CellStyle | CellStyleFunc | undefined;
    /** Class to use for the cell. Can be string, array of strings, or function that returns a string or array of strings.     */
    cellClass: string | string[] | CellClassFunc | undefined;
    /** Rules which can be applied to include certain CSS classes.     */
    cellClassRules: CellClassRules | undefined;
    /** A `cellRenderer` to use for this column.     */
    cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    /** Framework `cellRenderer` to use for this column.     */
    cellRendererFramework: any;
    /** Params to be passed to the cell renderer component.     */
    cellRendererParams: any;
    /** Callback to select which cell renderer to be used for a given row within the same column.     */
    cellRendererSelector: CellRendererSelectorFunc | undefined;
    /** Set to `true` to have the grid calculate the height of a row based on contents of this column.     */
    autoHeight: boolean | undefined;
    /** Set to `true` to have the text wrap inside the cell - typically used with `autoHeight`.     */
    wrapText: boolean | undefined;
    /** Set to `true` to flash a cell when it's refreshed.     */
    enableCellChangeFlash: boolean | undefined;
    /** Set to `true` to prevent this column from flashing on changes. Only applicable if cell flashing is turned on for the grid.     */
    suppressCellFlash: boolean | undefined;
    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow row dragging.     */
    rowDrag: boolean | RowDragCallback | undefined;
    /** A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
     * If this callback is not set, the current cell value will be used.     */
    rowDragText: ((params: IRowDragItem, dragItemCount: number) => string) | undefined;
    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow dragging for native drag and drop.     */
    dndSource: boolean | DndSourceCallback | undefined;
    /** Function to allow custom drag functionality for native drag and drop.     */
    dndSourceOnRowDrag: ((params: {
        rowNode: RowNode;
        dragEvent: DragEvent;
    }) => void) | undefined;
    /** Set to `true` to row group by this column.     */
    rowGroup: boolean | undefined;
    /** Same as 'rowGroup', except only applied when creating a new column. Not applied when updating column definitions.     */
    initialRowGroup: boolean | undefined;
    /** Set this in columns you want to group by.
     * If only grouping by one column, set this to any number (e.g. `0`).
     * If grouping by multiple columns, set this to where you want this column to be in the group (e.g. `0` for first, `1` for second, and so on).     */
    rowGroupIndex: number | null | undefined;
    /** Same as 'rowGroupIndex', except only applied when creating a new column. Not applied when updating column definitions.     */
    initialRowGroupIndex: number | undefined;
    /** Set to `true` if you want to be able to row group by this column via the GUI.
     * This will not block the API or properties being used to achieve row grouping.     */
    enableRowGroup: boolean | undefined;
    /** Set to `true` if you want to be able to aggregate by this column via the GUI.
     * This will not block the API or properties being used to achieve aggregation.     */
    enableValue: boolean | undefined;
    /** Name of function to use for aggregation. You can also provide your own agg function.     */
    aggFunc: string | IAggFunc | null | undefined;
    /** Same as 'aggFunc', except only applied when creating a new column. Not applied when updating column definitions.     */
    initialAggFunc: string | IAggFunc | undefined;
    /** Aggregation functions allowed on this column e.g. `['sum', 'avg']`.
     * If missing, all installed functions are allowed.
     * This will only restrict what the GUI allows a user to select, it does not impact when you set a function via the API.     */
    allowedAggFuncs: string[] | undefined;
    /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group.     */
    showRowGroup: string | boolean | undefined;
    /** Set to `true` to allow sorting on this column.     */
    sortable: boolean | undefined;
    /** If sorting by default, set it here. Set to 'asc' or 'desc'.     */
    sort: string | null | undefined;
    /** Same as `sort`, except only applied when creating a new column. Not applied when updating column definitions.     */
    initialSort: string | undefined;
    /** If sorting more than one column by default, specifies order in which the sorting should be applied.     */
    sortIndex: number | null | undefined;
    /** Same as 'sortIndex', except only applied when creating a new column. Not applied when updating column definitions.     */
    initialSortIndex: number | undefined;
    /** Array defining the order in which sorting occurs (if sorting is enabled). An array with any of the following in any order ['asc','desc',null]     */
    sortingOrder: (string | null)[] | undefined;
    /** Comparator function for custom sorting.     */
    comparator: ((valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number) | undefined;
    /** Set to `true` if you want the unsorted icon to be shown when no sort is applied to this column.     */
    unSortIcon: boolean | undefined;
    /** @deprecated since v24 - use sortIndex instead
     */
    sortedAt: number | undefined;
    /** By default, each cell will take up the width of one column. You can change this behaviour to allow cells to span multiple columns.     */
    colSpan: ((params: ColSpanParams) => number) | undefined;
    /** By default, each cell will take up the height of one row. You can change this behaviour to allow cells to span multiple rows.     */
    rowSpan: ((params: RowSpanParams) => number) | undefined;
    /** Initial width in pixels for the cell.     */
    width: number | undefined;
    /** Same as 'width', except only applied when creating a new column. Not applied when updating column definitions.     */
    initialWidth: number | undefined;
    /** Minimum width in pixels for the cell.     */
    minWidth: number | undefined;
    /** Maximum width in pixels for the cell.     */
    maxWidth: number | undefined;
    /** Used instead of `width` when the goal is to fill the remaining empty space of the grid.     */
    flex: number | undefined;
    /** Same as 'flex', except only applied when creating a new column. Not applied when updating column definitions.     */
    initialFlex: number | undefined;
    /** Set to `true` to allow this column should be resized.     */
    resizable: boolean | undefined;
    /** Set to `true` if you want this column's width to be fixed during 'size to fit' operations.     */
    suppressSizeToFit: boolean | undefined;
    /** Set to `true` if you do not want this column to be auto-resizable by double clicking it's edge.     */
    suppressAutoSize: boolean | undefined;
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
}
