import { CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent } from "../events";
import { ICellEditorParams } from "../interfaces/iCellEditor";
import { AgGridCommon } from "../interfaces/iCommon";
import { IFilterDef } from '../interfaces/iFilter';
import { ICellRendererComp, ICellRendererFunc, ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { IRowDragItem } from "../rendering/row/rowDragComp";
import { ITooltipParams } from "../rendering/tooltipComponent";
import { Column } from "./column";
import { ColumnGroup } from "./columnGroup";
import { RowClassParams } from "./gridOptions";
import { ProvidedColumnGroup } from "./providedColumnGroup";
import { RowNode } from "./rowNode";

// ***********************************************************************
// * Don't forget to update ColDefUtil if changing this class. PLEASE! *
// ***********************************************************************/

/** AbstractColDef can be a group or a column definition */
export interface AbstractColDef {
    /** The name to render in the column header. If not specified and field is specified, the field name will be used as the header name. */
    headerName?: string;
    /** Function or expression. Gets the value for display in the header. */
    headerValueGetter?: string | HeaderValueGetterFunc;
    /** Tooltip for the column header */
    headerTooltip?: string;
    /** CSS class to use for the header cell. Can be a string, array of strings, or function. */
    headerClass?: HeaderClass;
    /** Suppress the grid taking action for the relevant keyboard event when a header is focused. */
    suppressHeaderKeyboardEvent?: (params: SuppressHeaderKeyboardEventParams) => boolean;

    /** Whether to show the column when the group is open / closed. */
    columnGroupShow?: string;
    /** CSS class to use for the tool panel cell. Can be a string, array of strings, or function. */
    toolPanelClass?: ToolPanelClass;
    /** Set to `true` if you do not want this column or group to appear in the Columns Tool Panel. Default: `false` */
    suppressColumnsToolPanel?: boolean;

    /** Set to `true` if you do not want this column (filter) or group (filter group) to appear in the Filters Tool Panel. Default: `false` */
    suppressFiltersToolPanel?: boolean;

    /** 
    * Provide your own tooltip component for the column.
    * See [Tooltip Component](https://www.ag-grid.com/javascript-data-grid/component-tooltip/) for framework specific implementation details.
    */
    tooltipComponent?: any;
    /** @deprecated As of v27, use `tooltipComponent` for framework components too. */
    tooltipComponentFramework?: any;
    /** The params used to configure `tooltipComponent`. */
    tooltipComponentParams?: any;

    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotKeys?: string[];
}

/** Configuration options for column groups in AG Grid.  */
export interface ColGroupDef extends AbstractColDef {
    /** A list containing a mix of columns and column groups. */
    children: (ColDef | ColGroupDef)[];
    /** The unique ID to give the column. This is optional. If missing, a unique ID will be generated. This ID is used to identify the column group in the column API. */
    groupId?: string;
    /** Set to `true` if this group should be opened by default. Default: `false` */
    openByDefault?: boolean;
    /** Set to `true` to keep columns in this group beside each other in the grid. Moving the columns outside of the group (and hence breaking the group) is not allowed. Default: `false` */
    marryChildren?: boolean;

    /** 
    * The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used.
    * See [Header Group Component](https://www.ag-grid.com/javascript-data-grid/component-header/#header-group-components/) for framework specific implementation details.
    */
    headerGroupComponent?: any;
    /** @deprecated As of v27, use `headerGroupComponent` for framework components too. */
    headerGroupComponentFramework?: any;
    /** The params used to configure the `headerGroupComponent`. */
    headerGroupComponentParams?: any;
}

export interface IAggFunc {
    (params: IAggFuncParams): any;
}

export interface IAggFuncParams extends AgGridCommon {
    /** Values to aggregate */
    values: any[];
    /** Column the aggregation function is working on */
    column: Column;
    /** ColDef of the aggregation column */
    colDef: ColDef;
    /** The parent RowNode, where the aggregation result will be shown */
    rowNode: RowNode;
    /** data (if any) of the parent RowNode */
    data: any;
}

export interface HeaderClassParams extends AgGridCommon {
    colDef: AbstractColDef;
    column?: Column | null;
    columnGroup?: ColumnGroup | null;
}
export type HeaderClass = string | string[] | ((params: HeaderClassParams) => string | string[] | undefined);
export interface ToolPanelClassParams extends AgGridCommon {
    colDef: AbstractColDef;
    column?: Column | null;
    columnGroup?: ProvidedColumnGroup | null;
}
export type ToolPanelClass = string | string[] | ((params: ToolPanelClassParams) => string | string[] | undefined);

// ***********************************************************************
// * Don't forget to update ColDefUtil if changing this class. PLEASE! *
// ***********************************************************************/

/** Configuration options for columns in AG Grid. */
export interface ColDef extends AbstractColDef, IFilterDef {

    // *** Columns *** //

    /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
     *  If both field and colId are missing, a unique ID will be generated.
     *  This ID is used to identify the column in the API for sorting, filtering etc. */
    colId?: string;
    /** 
     * The field of the row object to get the cell's data from.
     * Deep references into a row object is supported via dot notation, i.e `'address.firstLine'`.
     */
    field?: string;
    /**
     * A comma separated string or array of strings containing `ColumnType` keys which can be used as a template for a column.
     * This helps to reduce duplication of properties when you have a lot of common column properties.
     */
    type?: string | string[];
    /** Function or expression. Gets the value from your data for display. */
    valueGetter?: string | ValueGetterFunc;
    /** A function or expression to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering. */
    valueFormatter?: string | ValueFormatterFunc;
    /** Provided a reference data map to be used to map column values to their respective value from the map. */
    refData?: { [key: string]: string; };
    /**
     * Function to return a string key for a value.
     * This string is used for grouping, Set filtering, and searching within cell editor dropdowns.
     * When filtering and searching the string is exposed to the user, so make sure to return a human-readable value. */
    keyCreator?: (params: KeyCreatorParams) => string;
    /**
     * Custom comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed.
     * By default the grid uses `===` is used which should work for most use cases.
     */
    equals?: (valueA: any, valueB: any) => boolean;
    /** The field of the tooltip to apply to the cell. */
    tooltipField?: string;
    /**
     * Callback that should return the string to use for a tooltip, `tooltipField` takes precedence if set.
     * If using a custom `tooltipComponent` you may return any custom value to be passed to your tooltip component.
     */
    tooltipValueGetter?: (params: ITooltipParams) => string | any;
    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to render a selection checkbox in the column. Default: `false` */
    checkboxSelection?: boolean | CheckboxSelectionCallback;
    /** Icons to use inside the column instead of the grid's default icons. Leave undefined to use defaults. */
    icons?: { [key: string]: Function | string; };
    /**
     * Set to `true` if this column is not navigable (i.e. cannot be tabbed into), otherwise `false`.
     * Can also be a callback function to have different rows navigable.
     * Default: `false`
     */
    suppressNavigable?: boolean | SuppressNavigableCallback;
    /** Allows the user to suppress certain keyboard events in the grid cell. Default: `false` */
    suppressKeyboardEvent?: (params: SuppressKeyboardEventParams) => boolean;
    /**
     * Pasting is on by default as long as cells are editable (non-editable cells cannot be modified, even with a paste operation).
     * Set to `true` turn paste operations off.
     */
    suppressPaste?: boolean | SuppressPasteCallback;
    /** Set to true to prevent the fillHandle from being rendered in any cell that belongs to this column */
    suppressFillHandle?: boolean;

    // *** Columns: Display *** //

    /** Set to `true` for this column to be hidden. Default: `false` */
    hide?: boolean;
    /** Same as `hide`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialHide?: boolean;
    /** Set to `true` to block making column visible / hidden via the UI (API will still work). Default: `false` */
    lockVisible?: boolean;
    /** Lock a column to position to `'left'` or`'right'` to always have this column displayed in that position. true is treated as `'left'` */
    lockPosition?: boolean | 'left' | 'right';
    /** Set to `true` if you do not want this column to be movable via dragging. Default: `false` */
    suppressMovable?: boolean;

    // *** Columns: Editing *** //

    /** Set to `true` if this column is editable, otherwise `false`. Can also be a function to have different rows editable. Default: `false` */
    editable?: boolean | EditableCallback;
    /** Function or expression. Sets the value into your data for saving. Return `true` if the data changed. */
    valueSetter?: string | ValueSetterFunc;
    /** Function or expression. Parses the value for saving. */
    valueParser?: string | ValueParserFunc;
    /**
    * Provide your own cell editor component for this column's cells.
    * See [Cell Editor](https://www.ag-grid.com/javascript-data-grid/component-cell-editor/) for framework specific implementation detail.
    */
    cellEditor?: any;
    /** @deprecated As of v27, use `cellEditor` for framework components too. */
    cellEditorFramework?: any;
    /** Params to be passed to the `cellEditor` component. */
    cellEditorParams?: any;
    /** Callback to select which cell editor to be used for a given row within the same column. */
    cellEditorSelector?: CellEditorSelectorFunc;

    /** Set to `true` to have cells under this column enter edit mode after single click. Default: `false` */
    singleClickEdit?: boolean;
    /** @deprecated use `valueSetter` instead */
    newValueHandler?: (params: NewValueParams) => boolean;

    /**
     * Set to `true`, to have the cell editor appear in a popup.
     */
    cellEditorPopup?: boolean;
    /**
     * Set the position for the popup cell editor. Possible values are
     *  - `over` Popup will be positioned over the cell
     *  - `under` Popup will be positioned below the cell leaving the cell value visible.
     *
     * Default: `over`. */
    cellEditorPopupPosition?: string;

    // *** Columns: Events *** //

    /** Callback for after the value of a cell has changed, either due to editing or the application calling `api.setValue()`. */
    onCellValueChanged?: (event: NewValueParams) => void;
    /** Callback called when a cell is clicked. */
    onCellClicked?: (event: CellClickedEvent) => void;
    /** Callback called when a cell is double clicked. */
    onCellDoubleClicked?: (event: CellDoubleClickedEvent) => void;
    /** Callback called when a cell is right clicked. */
    onCellContextMenu?: (event: CellContextMenuEvent) => void;

    // *** Columns: Filtering *** //

    /** A function to tell the grid what quick filter text to use for this column if you don't want to use the default (which is calling `toString` on the value). */
    getQuickFilterText?: (params: GetQuickFilterTextParams) => string;
    /** Function or expression. Gets the value for filtering purposes. */
    filterValueGetter?: string | ValueGetterFunc;
    /** Whether to display a floating filter for this column. Default: `false` */
    floatingFilter?: boolean;

    // *** Column Headers *** //

    /** If enabled then column header names that are too long for the column width will wrap onto the next line. Default `false` */
    wrapHeaderText?: boolean;
    /** If enabled then the column header row will automatically adjust height to acommodate the size of the header cell.
    * This can be useful when using your own `headerComponent` or long header names in conjunction with `wrapHeaderText`.
    * Default: `false`
    */
    autoHeaderHeight?: boolean;

    /**
    * The custom header component to be used for rendering the component header. If none specified the default AG Grid header component is used.
    * See [Header Component](https://www.ag-grid.com/javascript-data-grid/component-header/) for framework specific implementation detail.
    */
    headerComponent?: any;
    /** @deprecated As of v27, use `headerComponent` for framework components too. */
    headerComponentFramework?: any;
    /** The parameters to be passed to the `headerComponent`. */
    headerComponentParams?: any;

    /**
     * Set to an array containing zero, one or many of the following options: `'filterMenuTab' | 'generalMenuTab' | 'columnsMenuTab'`.
     * This is used to figure out which menu tabs are present and in which order the tabs are shown.
     */
    menuTabs?: string[];
    /** Params used to change the behaviour and appearance of the Columns Menu tab. */
    columnsMenuParams?: ColumnsMenuParams;
    /** Set to `true` if no menu should be shown for this column header. Default: `false` */
    suppressMenu?: boolean;
    /** If `true` or the callback returns `true`, a 'select all' checkbox will be put into the header. */
    headerCheckboxSelection?: boolean | HeaderCheckboxSelectionCallback;
    /** If `true`, the header checkbox selection will only select filtered items. */
    headerCheckboxSelectionFilteredOnly?: boolean;

    // *** Columns: Integrated Charts *** //

    /** Defines the chart data type that should be used for a column. */
    chartDataType?: 'category' | 'series' | 'time' | 'excluded';

    // *** Columns: Pinned *** //

    /** Pin a column to one side: `right` or `left`. A value of `true` is converted to `'left'`. */
    pinned?: boolean | string | null;
    /** Same as `pinned`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialPinned?: boolean | string;
    /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API. Default: `false`  */
    lockPinned?: boolean;

    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. */
    pinnedRowCellRenderer?: { new(): ICellRendererComp; } | ICellRendererFunc | string;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. */
    pinnedRowCellRendererFramework?: any;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. */
    pinnedRowCellRendererParams?: any;
    /** @deprecated Use valueFormatter for pinned rows, and check params.node.rowPinned. */
    pinnedRowValueFormatter?: string | ValueFormatterFunc;

    // *** Columns: Pivoting *** //

    /** Set to true to pivot by this column. */
    pivot?: boolean;
    /** Same as `pivot`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialPivot?: boolean;
    /**
     * Set this in columns you want to pivot by.
     * If only pivoting by one column, set this to any number (e.g. `0`).
     * If pivoting by multiple columns, set this to where you want this column to be in the order of pivots (e.g. `0` for first, `1` for second, and so on).
     */
    pivotIndex?: number | null;
    /** Same as `pivotIndex`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialPivotIndex?: number;
    /**
     * Comparator to use when ordering the pivot columns, when this column is used to pivot on.
     * The values will always be strings, as the pivot service uses strings as keys for the pivot groups.
     */
    pivotComparator?: (valueA: string, valueB: string) => number;
    /** Set to `true` if you want to be able to pivot by this column via the GUI. This will not block the API or properties being used to achieve pivot. Default: `false` */
    enablePivot?: boolean;

    // *** Columns: Rendering and Styling *** //

    /** An object of css values / or function returning an object of css values for a particular cell. */
    cellStyle?: CellStyle | CellStyleFunc;
    /** Class to use for the cell. Can be string, array of strings, or function that returns a string or array of strings. */
    cellClass?: string | string[] | CellClassFunc;
    /** Rules which can be applied to include certain CSS classes. */
    cellClassRules?: CellClassRules;

    /** 
    * Provide your own cell Renderer component for this column's cells.
    * See [Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-cell-renderer/) for framework specific implementation details.
    */
    cellRenderer?: any;
    /** @deprecated As of v27, use `cellRenderer` for framework components too. */
    cellRendererFramework?: any;
    /** Params to be passed to the `cellRenderer` component. */
    cellRendererParams?: any;
    /** Callback to select which cell renderer to be used for a given row within the same column. */
    cellRendererSelector?: CellRendererSelectorFunc;

    /** Set to `true` to have the grid calculate the height of a row based on contents of this column. Default: `false` */
    autoHeight?: boolean;
    /** Set to `true` to have the text wrap inside the cell - typically used with `autoHeight`. Default: `false` */
    wrapText?: boolean;
    /** Set to `true` to flash a cell when it's refreshed. Default: `false` */
    enableCellChangeFlash?: boolean;
    /** Set to `true` to prevent this column from flashing on changes. Only applicable if cell flashing is turned on for the grid. Default: `false` */
    suppressCellFlash?: boolean;

    // *** Columns: Row Dragging *** //

    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow row dragging. Default: `false` */
    rowDrag?: boolean | RowDragCallback;
    /**
     * A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
     * If this callback is not set, the current cell value will be used.
     */
    rowDragText?: (params: IRowDragItem, dragItemCount: number) => string;
    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow dragging for native drag and drop. Default: `false` */
    dndSource?: boolean | DndSourceCallback;
    /** Function to allow custom drag functionality for native drag and drop. */
    dndSourceOnRowDrag?: (params: DndSourceOnRowDragParams) => void;

    // *** Columns: Row Grouping *** //

    /** Set to `true` to row group by this column. Default: `false` */
    rowGroup?: boolean;
    /** Same as `rowGroup`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialRowGroup?: boolean;
    /**
     * Set this in columns you want to group by.
     * If only grouping by one column, set this to any number (e.g. `0`).
     * If grouping by multiple columns, set this to where you want this column to be in the group (e.g. `0` for first, `1` for second, and so on).
     */
    rowGroupIndex?: number | null;
    /** Same as `rowGroupIndex`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialRowGroupIndex?: number;
    /**
     * Set to `true` if you want to be able to row group by this column via the GUI.
     * This will not block the API or properties being used to achieve row grouping.
     * Default: `false`
     */
    enableRowGroup?: boolean;
    /**
     * Set to `true` if you want to be able to aggregate by this column via the GUI.
     * This will not block the API or properties being used to achieve aggregation.
     * Default: `false`
     */
    enableValue?: boolean;
    /** Name of function to use for aggregation. You can also provide your own agg function. */
    aggFunc?: string | IAggFunc | null;
    /** Same as `aggFunc`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialAggFunc?: string | IAggFunc;
    /**
     * The name of the aggregation function to use for this column when it is enabled via the GUI.
     * Note that this does not immediately apply the aggregation function like `aggFunc`
     * Default: `sum`
     */
    defaultAggFunc?: string;
    /**
     * Aggregation functions allowed on this column e.g. `['sum', 'avg']`.
     * If missing, all installed functions are allowed.
     * This will only restrict what the GUI allows a user to select, it does not impact when you set a function via the API. */
    allowedAggFuncs?: string[];

    /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group. */
    showRowGroup?: string | boolean;

    // *** Columns: Sort *** //

    /** Set to `true` to allow sorting on this column. Default: `false` */
    sortable?: boolean;
    /** If sorting by default, set it here. Set to `asc` or `desc`. */
    sort?: 'asc' | 'desc' | null;
    /** Same as `sort`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialSort?: 'asc' | 'desc' | null;
    /** If sorting more than one column by default, specifies order in which the sorting should be applied. */
    sortIndex?: number | null;
    /** Same as `sortIndex`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialSortIndex?: number;
    /**  Array defining the order in which sorting occurs (if sorting is enabled). An array with any of the following in any order `['asc','desc',null]` */
    sortingOrder?: ('asc' | 'desc' | null)[];
    /** Comparator function for custom sorting. */
    comparator?: (valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number;
    /** Set to `true` if you want the unsorted icon to be shown when no sort is applied to this column. Default: `false` */
    unSortIcon?: boolean;

    /** @deprecated since v24 - use sortIndex instead*/
    sortedAt?: number;

    // *** Columns: Spanning *** //

    /** By default, each cell will take up the width of one column. You can change this behaviour to allow cells to span multiple columns. */
    colSpan?: (params: ColSpanParams) => number;
    /** By default, each cell will take up the height of one row. You can change this behaviour to allow cells to span multiple rows. */
    rowSpan?: (params: RowSpanParams) => number;

    // *** Columns: Widths *** //

    /** Initial width in pixels for the cell. */
    width?: number;
    /** Same as `width`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialWidth?: number;
    /** Minimum width in pixels for the cell. */
    minWidth?: number;
    /** Maximum width in pixels for the cell. */
    maxWidth?: number;
    /** Used instead of `width` when the goal is to fill the remaining empty space of the grid. */
    flex?: number;
    /** Same as `flex`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialFlex?: number;
    /** Set to `true` to allow this column should be resized. Default: `false` */
    resizable?: boolean;
    /** Set to `true` if you want this column's width to be fixed during 'size to fit' operations. Default: `false` */
    suppressSizeToFit?: boolean;
    /** Set to `true` if you do not want this column to be auto-resizable by double clicking it's edge. Default: `false` */
    suppressAutoSize?: boolean;

    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotValueColumn?: Column | null;
    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotTotalColumnIds?: string[];
}

export interface ColumnFunctionCallbackParams extends AgGridCommon {
    /** Row node for the given row */
    node: RowNode;
    /** Data associated with the node */
    data: any;
    /** Column for this callback */
    column: Column;
    /** ColDef provided for this column */
    colDef: ColDef;
}

export interface CheckboxSelectionCallbackParams extends ColumnFunctionCallbackParams { }
export interface CheckboxSelectionCallback {
    (params: CheckboxSelectionCallbackParams): boolean;
}
export interface RowDragCallbackParams extends ColumnFunctionCallbackParams { }
export interface RowDragCallback {
    (params: RowDragCallbackParams): boolean;
}
export interface DndSourceCallbackParams extends ColumnFunctionCallbackParams { }

export interface DndSourceOnRowDragParams extends AgGridCommon {
    /** Row node for the given row */
    rowNode: RowNode;
    /** The DOM event that represents a drag and drop interaction */
    dragEvent: DragEvent;
}
export interface DndSourceCallback {
    (params: DndSourceCallbackParams): boolean;
}
export interface EditableCallbackParams extends ColumnFunctionCallbackParams { }
export interface EditableCallback {
    (params: EditableCallbackParams): boolean;
}
export interface SuppressPasteCallbackParams extends ColumnFunctionCallbackParams { }
export interface SuppressPasteCallback {
    (params: SuppressPasteCallbackParams): boolean;
}
export interface SuppressNavigableCallbackParams extends ColumnFunctionCallbackParams { }
export interface SuppressNavigableCallback {
    (params: SuppressNavigableCallbackParams): boolean;
}
export interface HeaderCheckboxSelectionCallbackParams extends AgGridCommon {
    column: Column;
    colDef: ColDef;
}
export interface HeaderCheckboxSelectionCallback {
    (params: HeaderCheckboxSelectionCallbackParams): boolean;
}

/**
 * @deprecated
 * No longer in use. Replaced with (params: ColumnFunctionCallbackParams) => boolean.
 */
export interface IsColumnFunc {
    (params: IsColumnFuncParams): boolean;
}

/**
 * @deprecated
 * Replaced with ColumnFunctionCallbackParams
 */
export interface IsColumnFuncParams extends ColumnFunctionCallbackParams { }

export interface GetQuickFilterTextParams extends AgGridCommon {
    value: any;
    node: RowNode;
    data: any;
    column: Column;
    colDef: ColDef;
}

export interface ColumnsMenuParams {
    /** To suppress updating the layout of columns as they are rearranged in the grid */
    suppressSyncLayoutWithGrid?: boolean;
    /** To suppress Column Filter section*/
    suppressColumnFilter?: boolean;
    /** To suppress Select / Un-select all widget*/
    suppressColumnSelectAll?: boolean;
    /** To suppress Expand / Collapse all widget*/
    suppressColumnExpandAll?: boolean;
    /** By default, column groups start expanded.
     * Pass true to default to contracted groups*/
    contractColumnSelection?: boolean;
}

export interface BaseColDefParams extends AgGridCommon {
    /** Row node for the given row */
    node: RowNode | null;
    /** Data associated with the node */
    data: any;
    /** Column for this callback */
    column: Column;
    /** ColDef provided for this column */
    colDef: ColDef;
}

export interface BaseWithValueColDefParams extends BaseColDefParams {
    /** Value for the cell. */
    value: any;
}

export interface ValueGetterParams extends BaseColDefParams {
    /** A utility method for getting other column values */
    getValue: (field: string) => any;
}
export interface ValueGetterFunc {
    (params: ValueGetterParams): any;
}
export interface HeaderValueGetterParams extends AgGridCommon {
    colDef: AbstractColDef;
    /** Column for this callback if applicable*/
    column?: Column | null;
    /** ColumnGroup for this callback if applicable */
    columnGroup?: ColumnGroup | ProvidedColumnGroup | null;
    /** Original column group if applicable */
    providedColumnGroup: ProvidedColumnGroup | null;
    /** Where the column is going to appear */
    location: string | null;
}
export interface HeaderValueGetterFunc {
    (params: HeaderValueGetterParams): any;
}

export interface NewValueParams extends BaseColDefParams {
    /** The value before the change */
    oldValue: any;
    /** The value after the change */
    newValue: any;
}

export interface ValueSetterParams extends NewValueParams {
}
export interface ValueSetterFunc {
    (params: ValueSetterParams): boolean;
}
export interface ValueParserParams extends NewValueParams {
}
export interface ValueParserFunc {
    (params: ValueParserParams): any;
}

export interface ValueFormatterParams extends BaseWithValueColDefParams {
}

export interface ValueFormatterFunc {
    (params: ValueFormatterParams): string;
}

export interface KeyCreatorParams extends BaseWithValueColDefParams { }

export interface ColSpanParams extends BaseColDefParams {
}

export interface RowSpanParams extends BaseColDefParams {
}

export interface SuppressKeyboardEventParams extends ColumnFunctionCallbackParams {
    /** The keyboard event the grid received */
    event: KeyboardEvent;
    /** Whether the cell is editing or not */
    editing: boolean;
}

export interface SuppressHeaderKeyboardEventParams extends AgGridCommon {
    column: Column | ColumnGroup;
    colDef: ColDef | ColGroupDef | null;
    /** The index of the header row of the current focused header */
    headerRowIndex: number;
    /** The keyboard event the grid received */
    event: KeyboardEvent;
}

export interface CellClassParams extends RowClassParams {
    /** The colDef associated with the column for this cell */
    colDef: ColDef;
    /** The value to be rendered */
    value: any;
}
export interface CellClassFunc {
    (cellClassParams: CellClassParams): string | string[] | null | undefined;
}
export interface CellStyleFunc {
    (cellClassParams: CellClassParams): CellStyle | null | undefined;
}

export interface CellStyle { [cssProperty: string]: string | number; }
export interface CellClassRules {
    [cssClassName: string]: (((params: CellClassParams) => boolean) | string);
}

export interface CellRendererSelectorFunc {
    (params: ICellRendererParams): CellRendererSelectorResult | undefined;
}

export interface CellEditorSelectorFunc {
    (params: ICellEditorParams): CellEditorSelectorResult | undefined;
}
export interface CellRendererSelectorResult {
    /** Equivalent of setting `colDef.cellRenderer` */
    component?: any;
    /** @deprecated As of v27, use `component` for framework components too. */
    frameworkComponent?: any;
    /** Equivalent of setting `colDef.cellRendererParams` */
    params?: any;
}

export interface CellEditorSelectorResult {
    /** Equivalent of setting `colDef.cellEditor` */
    component?: any;
    /** @deprecated As of v27, use `component` for framework components too. */
    frameworkComponent?: any;
    /** Equivalent of setting `colDef.cellEditorParams` */
    params?: any;
    /** Equivalent of setting `colDef.cellEditorPopup` */
    popup?: boolean;
    /** Equivalent of setting `colDef.cellEditorPopupPosition` */
    popupPosition?: string;
}
