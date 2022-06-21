import { CellClassFunc, CellClassRules, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditorSelectorFunc, CellRendererSelectorFunc, CellStyle, CellStyleFunc, CheckboxSelectionCallback, ColDef, ColGroupDef, ColSpanParams, ColumnsMenuParams, DndSourceCallback, DndSourceOnRowDragParams, EditableCallback, GetQuickFilterTextParams, HeaderCheckboxSelectionCallback, HeaderClass, HeaderValueGetterFunc, IAggFunc, ICellEditorComp, ICellRendererComp, ICellRendererFunc, IHeaderGroupComp, IRowDragItem, ITooltipComp, ITooltipParams, KeyCreatorParams, NewValueParams, RowDragCallback, RowNode, RowSpanParams, SuppressHeaderKeyboardEventParams, SuppressKeyboardEventParams, SuppressNavigableCallback, SuppressPasteCallback, ToolPanelClass, ValueFormatterFunc, ValueGetterFunc, ValueParserFunc, ValueSetterFunc } from "@ag-grid-community/core";
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
    @Input() public filterFramework: any;
    @Input() public filterParams: any;
    @Input() public floatingFilterComponent: any;
    @Input() public floatingFilterComponentParams: any;
    @Input() public floatingFilterComponentFramework: any;
    @Input() public floatingFilterFramework: any;
    @Input() public filter: any;
    /** The name to render in the column header. If not specified and field is specified, the field name will be used as the header name.     */
    @Input() public headerName: string | undefined;
    /** Function or expression. Gets the value for display in the header.     */
    @Input() public headerValueGetter: string | HeaderValueGetterFunc | undefined;
    /** Tooltip for the column header     */
    @Input() public headerTooltip: string | undefined;
    /** CSS class to use for the header cell. Can be a string, array of strings, or function.     */
    @Input() public headerClass: HeaderClass | undefined;
    /** Suppress the grid taking action for the relevant keyboard event when a header is focused.     */
    @Input() public suppressHeaderKeyboardEvent: ((params: SuppressHeaderKeyboardEventParams) => boolean) | undefined;
    /** Whether to show the column when the group is open / closed.     */
    @Input() public columnGroupShow: string | undefined;
    /** CSS class to use for the tool panel cell. Can be a string, array of strings, or function.     */
    @Input() public toolPanelClass: ToolPanelClass | undefined;
    /** Set to `true` if you do not want this column or group to appear in the Columns Tool Panel. Default: `false`     */
    @Input() public suppressColumnsToolPanel: boolean | undefined;
    /** Set to `true` if you do not want this column (filter) or group (filter group) to appear in the Filters Tool Panel. Default: `false`     */
    @Input() public suppressFiltersToolPanel: boolean | undefined;
    /** Provide your own tooltip component for the column.
     * See [Tooltip Component](https://www.ag-grid.com/javascript-data-grid/component-tooltip/) for framework specific implementation details.     */
    @Input() public tooltipComponent: any;
    /** @deprecated As of v27, use `tooltipComponent` for framework components too.     */
    @Input() public tooltipComponentFramework: any;
    /** The params used to configure `tooltipComponent`.     */
    @Input() public tooltipComponentParams: any;
    /** A list containing a mix of columns and column groups.     */
    @Input() public children: (ColDef | ColGroupDef)[] | undefined;
    /** The unique ID to give the column. This is optional. If missing, a unique ID will be generated. This ID is used to identify the column group in the column API.     */
    @Input() public groupId: string | undefined;
    /** Set to `true` if this group should be opened by default. Default: `false`     */
    @Input() public openByDefault: boolean | undefined;
    /** Set to `true` to keep columns in this group beside each other in the grid. Moving the columns outside of the group (and hence breaking the group) is not allowed. Default: `false`     */
    @Input() public marryChildren: boolean | undefined;
    /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used.
     * See [Header Group Component](https://www.ag-grid.com/javascript-data-grid/component-header/#header-group-components/) for framework specific implementation details.     */
    @Input() public headerGroupComponent: any;
    /** @deprecated As of v27, use `headerGroupComponent` for framework components too.     */
    @Input() public headerGroupComponentFramework: any;
    /** The params used to configure the `headerGroupComponent`.     */
    @Input() public headerGroupComponentParams: any;
    /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
     * If both field and colId are missing, a unique ID will be generated.
     * This ID is used to identify the column in the API for sorting, filtering etc.     */
    @Input() public colId: string | undefined;
    /** The field of the row object to get the cell's data from.
     * Deep references into a row object is supported via dot notation, i.e `'address.firstLine'`.     */
    @Input() public field: string | undefined;
    /** A comma separated string or array of strings containing `ColumnType` keys which can be used as a template for a column.
     * This helps to reduce duplication of properties when you have a lot of common column properties.     */
    @Input() public type: string | string[] | undefined;
    /** Function or expression. Gets the value from your data for display.     */
    @Input() public valueGetter: string | ValueGetterFunc | undefined;
    /** A function or expression to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering.     */
    @Input() public valueFormatter: string | ValueFormatterFunc | undefined;
    /** Provided a reference data map to be used to map column values to their respective value from the map.     */
    @Input() public refData: { [key: string]: string; } | undefined;
    /** Function to return a string key for a value.
     * This string is used for grouping, Set filtering, and searching within cell editor dropdowns.
     * When filtering and searching the string is exposed to the user, so make sure to return a human-readable value.     */
    @Input() public keyCreator: ((params: KeyCreatorParams) => string) | undefined;
    /** Custom comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed.
     * By default the grid uses `===` is used which should work for most use cases.     */
    @Input() public equals: ((valueA: any, valueB: any) => boolean) | undefined;
    /** The field of the tooltip to apply to the cell.     */
    @Input() public tooltipField: string | undefined;
    /** Callback that should return the string to use for a tooltip, `tooltipField` takes precedence if set.
     * If using a custom `tooltipComponent` you may return any custom value to be passed to your tooltip component.     */
    @Input() public tooltipValueGetter: ((params: ITooltipParams) => string | any) | undefined;
    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to render a selection checkbox in the column. Default: `false`     */
    @Input() public checkboxSelection: boolean | CheckboxSelectionCallback | undefined;
    /** Icons to use inside the column instead of the grid's default icons. Leave undefined to use defaults.     */
    @Input() public icons: { [key: string]: Function | string; } | undefined;
    /** Set to `true` if this column is not navigable (i.e. cannot be tabbed into), otherwise `false`.
     * Can also be a callback function to have different rows navigable.
     * Default: `false`     */
    @Input() public suppressNavigable: boolean | SuppressNavigableCallback | undefined;
    /** Allows the user to suppress certain keyboard events in the grid cell. Default: `false`     */
    @Input() public suppressKeyboardEvent: ((params: SuppressKeyboardEventParams) => boolean) | undefined;
    /** Pasting is on by default as long as cells are editable (non-editable cells cannot be modified, even with a paste operation).
     * Set to `true` turn paste operations off.     */
    @Input() public suppressPaste: boolean | SuppressPasteCallback | undefined;
    /** Set to true to prevent the fillHandle from being rendered in any cell that belongs to this column     */
    @Input() public suppressFillHandle: boolean | undefined;
    /** Set to `true` for this column to be hidden. Default: `false`     */
    @Input() public hide: boolean | undefined;
    /** Same as `hide`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialHide: boolean | undefined;
    /** Set to `true` to block making column visible / hidden via the UI (API will still work). Default: `false`     */
    @Input() public lockVisible: boolean | undefined;
    /** Lock a column to position to `'left'` or`'right'` to always have this column displayed in that position. true is treated as `'left'`     */
    @Input() public lockPosition: boolean | 'left' | 'right' | undefined;
    /** Set to `true` if you do not want this column to be movable via dragging. Default: `false`     */
    @Input() public suppressMovable: boolean | undefined;
    /** Set to `true` if this column is editable, otherwise `false`. Can also be a function to have different rows editable. Default: `false`     */
    @Input() public editable: boolean | EditableCallback | undefined;
    /** Function or expression. Sets the value into your data for saving. Return `true` if the data changed.     */
    @Input() public valueSetter: string | ValueSetterFunc | undefined;
    /** Function or expression. Parses the value for saving.     */
    @Input() public valueParser: string | ValueParserFunc | undefined;
    /** Provide your own cell editor component for this column's cells.
     * See [Cell Editor](https://www.ag-grid.com/javascript-data-grid/component-cell-editor/) for framework specific implementation detail.     */
    @Input() public cellEditor: any;
    /** @deprecated As of v27, use `cellEditor` for framework components too.     */
    @Input() public cellEditorFramework: any;
    /** Params to be passed to the `cellEditor` component.     */
    @Input() public cellEditorParams: any;
    /** Callback to select which cell editor to be used for a given row within the same column.     */
    @Input() public cellEditorSelector: CellEditorSelectorFunc | undefined;
    /** Set to `true` to have cells under this column enter edit mode after single click. Default: `false`     */
    @Input() public singleClickEdit: boolean | undefined;
    /** @deprecated use `valueSetter` instead     */
    @Input() public newValueHandler: ((params: NewValueParams) => boolean) | undefined;
    /** Set to `true`, to have the cell editor appear in a popup.     */
    @Input() public cellEditorPopup: boolean | undefined;
    /** Set the position for the popup cell editor. Possible values are
     *  - `over` Popup will be positioned over the cell
     *  - `under` Popup will be positioned below the cell leaving the cell value visible.
     * 
     * Default: `over`.     */
    @Input() public cellEditorPopupPosition: string | undefined;
    /** Callback for after the value of a cell has changed, either due to editing or the application calling `api.setValue()`.     */
    @Input() public onCellValueChanged: ((event: NewValueParams) => void) | undefined;
    /** Callback called when a cell is clicked.     */
    @Input() public onCellClicked: ((event: CellClickedEvent) => void) | undefined;
    /** Callback called when a cell is double clicked.     */
    @Input() public onCellDoubleClicked: ((event: CellDoubleClickedEvent) => void) | undefined;
    /** Callback called when a cell is right clicked.     */
    @Input() public onCellContextMenu: ((event: CellContextMenuEvent) => void) | undefined;
    /** A function to tell the grid what quick filter text to use for this column if you don't want to use the default (which is calling `toString` on the value).     */
    @Input() public getQuickFilterText: ((params: GetQuickFilterTextParams) => string) | undefined;
    /** Function or expression. Gets the value for filtering purposes.     */
    @Input() public filterValueGetter: string | ValueGetterFunc | undefined;
    /** Whether to display a floating filter for this column. Default: `false`     */
    @Input() public floatingFilter: boolean | undefined;
    /** If enabled then column header names that are too long for the column width will wrap onto the next line. Default `false`     */
    @Input() public wrapHeaderText: boolean | undefined;
    /** If enabled then the column header row will automatically adjust height to acommodate the size of the header cell.
     * This can be useful when using your own `headerComponent` or long header names in conjunction with `wrapHeaderText`.
     * Default: `false`     */
    @Input() public autoHeaderHeight: boolean | undefined;
    /** The custom header component to be used for rendering the component header. If none specified the default AG Grid header component is used.
     * See [Header Component](https://www.ag-grid.com/javascript-data-grid/component-header/) for framework specific implementation detail.     */
    @Input() public headerComponent: any;
    /** @deprecated As of v27, use `headerComponent` for framework components too.     */
    @Input() public headerComponentFramework: any;
    /** The parameters to be passed to the `headerComponent`.     */
    @Input() public headerComponentParams: any;
    /** Set to an array containing zero, one or many of the following options: `'filterMenuTab' | 'generalMenuTab' | 'columnsMenuTab'`.
     * This is used to figure out which menu tabs are present and in which order the tabs are shown.     */
    @Input() public menuTabs: string[] | undefined;
    /** Params used to change the behaviour and appearance of the Columns Menu tab.     */
    @Input() public columnsMenuParams: ColumnsMenuParams | undefined;
    /** Set to `true` if no menu should be shown for this column header. Default: `false`     */
    @Input() public suppressMenu: boolean | undefined;
    /** If `true` or the callback returns `true`, a 'select all' checkbox will be put into the header.     */
    @Input() public headerCheckboxSelection: boolean | HeaderCheckboxSelectionCallback | undefined;
    /** If `true`, the header checkbox selection will only select filtered items.     */
    @Input() public headerCheckboxSelectionFilteredOnly: boolean | undefined;
    /** Defines the chart data type that should be used for a column.     */
    @Input() public chartDataType: 'category' | 'series' | 'time' | 'excluded' | undefined;
    /** Pin a column to one side: `right` or `left`. A value of `true` is converted to `'left'`.     */
    @Input() public pinned: boolean | string | null | undefined;
    /** Same as `pinned`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialPinned: boolean | string | undefined;
    /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API. Default: `false`     */
    @Input() public lockPinned: boolean | undefined;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.     */
    @Input() public pinnedRowCellRenderer: { new(): ICellRendererComp; } | ICellRendererFunc | string | undefined;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.     */
    @Input() public pinnedRowCellRendererFramework: any;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.     */
    @Input() public pinnedRowCellRendererParams: any;
    /** @deprecated Use valueFormatter for pinned rows, and check params.node.rowPinned.     */
    @Input() public pinnedRowValueFormatter: string | ValueFormatterFunc | undefined;
    /** Set to true to pivot by this column.     */
    @Input() public pivot: boolean | undefined;
    /** Same as `pivot`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialPivot: boolean | undefined;
    /** Set this in columns you want to pivot by.
     * If only pivoting by one column, set this to any number (e.g. `0`).
     * If pivoting by multiple columns, set this to where you want this column to be in the order of pivots (e.g. `0` for first, `1` for second, and so on).     */
    @Input() public pivotIndex: number | null | undefined;
    /** Same as `pivotIndex`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialPivotIndex: number | undefined;
    /** Comparator to use when ordering the pivot columns, when this column is used to pivot on.
     * The values will always be strings, as the pivot service uses strings as keys for the pivot groups.     */
    @Input() public pivotComparator: ((valueA: string, valueB: string) => number) | undefined;
    /** Set to `true` if you want to be able to pivot by this column via the GUI. This will not block the API or properties being used to achieve pivot. Default: `false`     */
    @Input() public enablePivot: boolean | undefined;
    /** An object of css values / or function returning an object of css values for a particular cell.     */
    @Input() public cellStyle: CellStyle | CellStyleFunc | undefined;
    /** Class to use for the cell. Can be string, array of strings, or function that returns a string or array of strings.     */
    @Input() public cellClass: string | string[] | CellClassFunc | undefined;
    /** Rules which can be applied to include certain CSS classes.     */
    @Input() public cellClassRules: CellClassRules | undefined;
    /** Provide your own cell Renderer component for this column's cells.
     * See [Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-cell-renderer/) for framework specific implementation details.     */
    @Input() public cellRenderer: any;
    /** @deprecated As of v27, use `cellRenderer` for framework components too.     */
    @Input() public cellRendererFramework: any;
    /** Params to be passed to the `cellRenderer` component.     */
    @Input() public cellRendererParams: any;
    /** Callback to select which cell renderer to be used for a given row within the same column.     */
    @Input() public cellRendererSelector: CellRendererSelectorFunc | undefined;
    /** Set to `true` to have the grid calculate the height of a row based on contents of this column. Default: `false`     */
    @Input() public autoHeight: boolean | undefined;
    /** Set to `true` to have the text wrap inside the cell - typically used with `autoHeight`. Default: `false`     */
    @Input() public wrapText: boolean | undefined;
    /** Set to `true` to flash a cell when it's refreshed. Default: `false`     */
    @Input() public enableCellChangeFlash: boolean | undefined;
    /** Set to `true` to prevent this column from flashing on changes. Only applicable if cell flashing is turned on for the grid. Default: `false`     */
    @Input() public suppressCellFlash: boolean | undefined;
    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow row dragging. Default: `false`     */
    @Input() public rowDrag: boolean | RowDragCallback | undefined;
    /** A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
     * If this callback is not set, the current cell value will be used.     */
    @Input() public rowDragText: ((params: IRowDragItem, dragItemCount: number) => string) | undefined;
    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow dragging for native drag and drop. Default: `false`     */
    @Input() public dndSource: boolean | DndSourceCallback | undefined;
    /** Function to allow custom drag functionality for native drag and drop.     */
    @Input() public dndSourceOnRowDrag: ((params: DndSourceOnRowDragParams) => void) | undefined;
    /** Set to `true` to row group by this column. Default: `false`     */
    @Input() public rowGroup: boolean | undefined;
    /** Same as `rowGroup`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialRowGroup: boolean | undefined;
    /** Set this in columns you want to group by.
     * If only grouping by one column, set this to any number (e.g. `0`).
     * If grouping by multiple columns, set this to where you want this column to be in the group (e.g. `0` for first, `1` for second, and so on).     */
    @Input() public rowGroupIndex: number | null | undefined;
    /** Same as `rowGroupIndex`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialRowGroupIndex: number | undefined;
    /** Set to `true` if you want to be able to row group by this column via the GUI.
     * This will not block the API or properties being used to achieve row grouping.
     * Default: `false`     */
    @Input() public enableRowGroup: boolean | undefined;
    /** Set to `true` if you want to be able to aggregate by this column via the GUI.
     * This will not block the API or properties being used to achieve aggregation.
     * Default: `false`     */
    @Input() public enableValue: boolean | undefined;
    /** Name of function to use for aggregation. You can also provide your own agg function.     */
    @Input() public aggFunc: string | IAggFunc | null | undefined;
    /** Same as `aggFunc`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialAggFunc: string | IAggFunc | undefined;
    /** The name of the aggregation function to use for this column when it is enabled via the GUI.
     * Note that this does not immediately apply the aggregation function like `aggFunc`
     * Default: `sum`     */
    @Input() public defaultAggFunc: string | undefined;
    /** Aggregation functions allowed on this column e.g. `['sum', 'avg']`.
     * If missing, all installed functions are allowed.
     * This will only restrict what the GUI allows a user to select, it does not impact when you set a function via the API.     */
    @Input() public allowedAggFuncs: string[] | undefined;
    /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group.     */
    @Input() public showRowGroup: string | boolean | undefined;
    /** Set to `true` to allow sorting on this column. Default: `false`     */
    @Input() public sortable: boolean | undefined;
    /** If sorting by default, set it here. Set to `asc` or `desc`.     */
    @Input() public sort: 'asc' | 'desc' | null | undefined;
    /** Same as `sort`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialSort: 'asc' | 'desc' | null | undefined;
    /** If sorting more than one column by default, specifies order in which the sorting should be applied.     */
    @Input() public sortIndex: number | null | undefined;
    /** Same as `sortIndex`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialSortIndex: number | undefined;
    /** Array defining the order in which sorting occurs (if sorting is enabled). An array with any of the following in any order `['asc','desc',null]`     */
    @Input() public sortingOrder: ('asc' | 'desc' | null)[] | undefined;
    /** Comparator function for custom sorting.     */
    @Input() public comparator: ((valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number) | undefined;
    /** Set to `true` if you want the unsorted icon to be shown when no sort is applied to this column. Default: `false`     */
    @Input() public unSortIcon: boolean | undefined;
    /** @deprecated since v24 - use sortIndex instead*/
    @Input() public sortedAt: number | undefined;
    /** By default, each cell will take up the width of one column. You can change this behaviour to allow cells to span multiple columns.     */
    @Input() public colSpan: ((params: ColSpanParams) => number) | undefined;
    /** By default, each cell will take up the height of one row. You can change this behaviour to allow cells to span multiple rows.     */
    @Input() public rowSpan: ((params: RowSpanParams) => number) | undefined;
    /** Initial width in pixels for the cell.     */
    @Input() public width: number | undefined;
    /** Same as `width`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialWidth: number | undefined;
    /** Minimum width in pixels for the cell.     */
    @Input() public minWidth: number | undefined;
    /** Maximum width in pixels for the cell.     */
    @Input() public maxWidth: number | undefined;
    /** Used instead of `width` when the goal is to fill the remaining empty space of the grid.     */
    @Input() public flex: number | undefined;
    /** Same as `flex`, except only applied when creating a new column. Not applied when updating column definitions.     */
    @Input() public initialFlex: number | undefined;
    /** Set to `true` to allow this column should be resized. Default: `false`     */
    @Input() public resizable: boolean | undefined;
    /** Set to `true` if you want this column's width to be fixed during 'size to fit' operations. Default: `false`     */
    @Input() public suppressSizeToFit: boolean | undefined;
    /** Set to `true` if you do not want this column to be auto-resizable by double clicking it's edge. Default: `false`     */
    @Input() public suppressAutoSize: boolean | undefined;


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
    static ngAcceptInputType_wrapHeaderText: boolean | null | '';
    static ngAcceptInputType_autoHeaderHeight: boolean | null | '';
    // @END@

}
