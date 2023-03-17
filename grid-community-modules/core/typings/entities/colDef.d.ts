import { CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent } from "../events";
import { ICellEditorParams } from "../interfaces/iCellEditor";
import { AgGridCommon } from "../interfaces/iCommon";
import { IFilterDef } from '../interfaces/iFilter';
import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { IRowDragItem } from "../rendering/row/rowDragComp";
import { ITooltipParams } from "../rendering/tooltipComponent";
import { Column } from "./column";
import { ColumnGroup, ColumnGroupShowType } from "./columnGroup";
import { RowClassParams } from "./gridOptions";
import { ProvidedColumnGroup } from "./providedColumnGroup";
import { IRowNode } from "../interfaces/iRowNode";
/** AbstractColDef can be a group or a column definition */
export interface AbstractColDef<TData = any> {
    /** The name to render in the column header. If not specified and field is specified, the field name will be used as the header name. */
    headerName?: string;
    /** Function or expression. Gets the value for display in the header. */
    headerValueGetter?: string | HeaderValueGetterFunc<TData>;
    /** Tooltip for the column header */
    headerTooltip?: string;
    /** CSS class to use for the header cell. Can be a string, array of strings, or function. */
    headerClass?: HeaderClass;
    /** Suppress the grid taking action for the relevant keyboard event when a header is focused. */
    suppressHeaderKeyboardEvent?: (params: SuppressHeaderKeyboardEventParams<TData>) => boolean;
    /** Whether to only show the column when the group is open / closed. If not set the column is always displayed as part of the group. */
    columnGroupShow?: ColumnGroupShowType;
    /** CSS class to use for the tool panel cell. Can be a string, array of strings, or function. */
    toolPanelClass?: ToolPanelClass<TData>;
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
export interface ColGroupDef<TData = any> extends AbstractColDef<TData> {
    /** A list containing a mix of columns and column groups. */
    children: (ColDef<TData> | ColGroupDef<TData>)[];
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
export interface IAggFunc<TData = any, TValue = any> {
    (params: IAggFuncParams<TData, TValue>): any;
}
export interface IAggFuncParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    /** Values to aggregate */
    values: TValue[];
    /** Column the aggregation function is working on */
    column: Column;
    /** ColDef of the aggregation column */
    colDef: ColDef<TData>;
    /** The parent RowNode, where the aggregation result will be shown */
    rowNode: IRowNode<TData>;
    /** data (if any) of the parent RowNode */
    data: TData;
}
export interface HeaderClassParams<TData = any> extends AgGridCommon<TData, any> {
    colDef: AbstractColDef<TData>;
    column?: Column | null;
    columnGroup?: ColumnGroup | null;
}
export declare type HeaderClass<TData = any> = string | string[] | ((params: HeaderClassParams<TData>) => string | string[] | undefined);
export interface ToolPanelClassParams<TData = any> extends AgGridCommon<TData, any> {
    colDef: AbstractColDef<TData>;
    column?: Column | null;
    columnGroup?: ProvidedColumnGroup | null;
}
export declare type ToolPanelClass<TData = any> = string | string[] | ((params: ToolPanelClassParams<TData>) => string | string[] | undefined);
/** Configuration options for columns in AG Grid. */
export interface ColDef<TData = any> extends AbstractColDef<TData>, IFilterDef {
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
    valueGetter?: string | ValueGetterFunc<TData>;
    /** A function or expression to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering. */
    valueFormatter?: string | ValueFormatterFunc<TData>;
    /** Provided a reference data map to be used to map column values to their respective value from the map. */
    refData?: {
        [key: string]: string;
    };
    /**
     * Function to return a string key for a value.
     * This string is used for grouping, Set filtering, and searching within cell editor dropdowns.
     * When filtering and searching the string is exposed to the user, so make sure to return a human-readable value. */
    keyCreator?: (params: KeyCreatorParams<TData>) => string;
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
    tooltipValueGetter?: (params: ITooltipParams<TData>) => string | any;
    /** Set to `true` (or return `true` from function) to render a selection checkbox in the column. Default: `false` */
    checkboxSelection?: boolean | CheckboxSelectionCallback<TData>;
    /** Set to `true` to display a disabled checkbox when row is not selectable and checkboxes are enabled. Default: `false` */
    showDisabledCheckboxes?: boolean;
    /** Icons to use inside the column instead of the grid's default icons. Leave undefined to use defaults. */
    icons?: {
        [key: string]: Function | string;
    };
    /**
     * Set to `true` if this column is not navigable (i.e. cannot be tabbed into), otherwise `false`.
     * Can also be a callback function to have different rows navigable.
     * Default: `false`
     */
    suppressNavigable?: boolean | SuppressNavigableCallback<TData>;
    /** Allows the user to suppress certain keyboard events in the grid cell. Default: `false` */
    suppressKeyboardEvent?: (params: SuppressKeyboardEventParams<TData>) => boolean;
    /**
     * Pasting is on by default as long as cells are editable (non-editable cells cannot be modified, even with a paste operation).
     * Set to `true` turn paste operations off.
     */
    suppressPaste?: boolean | SuppressPasteCallback<TData>;
    /** Set to true to prevent the fillHandle from being rendered in any cell that belongs to this column */
    suppressFillHandle?: boolean;
    /** Set to `true` for this column to be hidden. Default: `false` */
    hide?: boolean;
    /** Same as `hide`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialHide?: boolean;
    /** Set to `true` to block making column visible / hidden via the UI (API will still work). Default: `false` */
    lockVisible?: boolean;
    /** Lock a column to position to `'left'` or`'right'` to always have this column displayed in that position. `true` is treated as `'left'` */
    lockPosition?: boolean | 'left' | 'right';
    /** Set to `true` if you do not want this column to be movable via dragging. Default: `false` */
    suppressMovable?: boolean;
    /** Set to `true` if this column is editable, otherwise `false`. Can also be a function to have different rows editable. Default: `false` */
    editable?: boolean | EditableCallback<TData>;
    /** Function or expression. Sets the value into your data for saving. Return `true` if the data changed. */
    valueSetter?: string | ValueSetterFunc<TData>;
    /** Function or expression. Parses the value for saving. */
    valueParser?: string | ValueParserFunc<TData>;
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
    cellEditorSelector?: CellEditorSelectorFunc<TData>;
    /** Set to `true` to have cells under this column enter edit mode after single click. Default: `false` */
    singleClickEdit?: boolean;
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
    cellEditorPopupPosition?: 'over' | 'under';
    /** Callback for after the value of a cell has changed, either due to editing or the application calling `api.setValue()`. */
    onCellValueChanged?: (event: NewValueParams<TData>) => void;
    /** Callback called when a cell is clicked. */
    onCellClicked?: (event: CellClickedEvent<TData>) => void;
    /** Callback called when a cell is double clicked. */
    onCellDoubleClicked?: (event: CellDoubleClickedEvent<TData>) => void;
    /** Callback called when a cell is right clicked. */
    onCellContextMenu?: (event: CellContextMenuEvent<TData>) => void;
    /** A function to tell the grid what Quick Filter text to use for this column if you don't want to use the default (which is calling `toString` on the value). */
    getQuickFilterText?: (params: GetQuickFilterTextParams<TData>) => string;
    /** Function or expression. Gets the value for filtering purposes. */
    filterValueGetter?: string | ValueGetterFunc<TData>;
    /** Whether to display a floating filter for this column. Default: `false` */
    floatingFilter?: boolean;
    /** If enabled then column header names that are too long for the column width will wrap onto the next line. Default `false` */
    wrapHeaderText?: boolean;
    /** If enabled then the column header row will automatically adjust height to accommodate the size of the header cell.
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
    menuTabs?: ColumnMenuTab[];
    /** Params used to change the behaviour and appearance of the Columns Menu tab. */
    columnsMenuParams?: ColumnsMenuParams;
    /** Set to `true` if no menu should be shown for this column header. Default: `false` */
    suppressMenu?: boolean;
    /** If `true` or the callback returns `true`, a 'select all' checkbox will be put into the header. */
    headerCheckboxSelection?: boolean | HeaderCheckboxSelectionCallback<TData>;
    /** If `true`, the header checkbox selection will only select filtered items. */
    headerCheckboxSelectionFilteredOnly?: boolean;
    /** If `true`, the header checkbox selection will only select nodes on the current page. */
    headerCheckboxSelectionCurrentPageOnly?: boolean;
    /** Defines the chart data type that should be used for a column. */
    chartDataType?: 'category' | 'series' | 'time' | 'excluded';
    /** Pin a column to one side: `right` or `left`. A value of `true` is converted to `'left'`. */
    pinned?: boolean | 'left' | 'right' | null;
    /** Same as `pinned`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialPinned?: boolean | 'left' | 'right';
    /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API. Default: `false`  */
    lockPinned?: boolean;
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
    /** An object of css values / or function returning an object of css values for a particular cell. */
    cellStyle?: CellStyle | CellStyleFunc<TData>;
    /** Class to use for the cell. Can be string, array of strings, or function that returns a string or array of strings. */
    cellClass?: string | string[] | CellClassFunc<TData>;
    /** Rules which can be applied to include certain CSS classes. */
    cellClassRules?: CellClassRules<TData>;
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
    cellRendererSelector?: CellRendererSelectorFunc<TData>;
    /** Set to `true` to have the grid calculate the height of a row based on contents of this column. Default: `false` */
    autoHeight?: boolean;
    /** Set to `true` to have the text wrap inside the cell - typically used with `autoHeight`. Default: `false` */
    wrapText?: boolean;
    /** Set to `true` to flash a cell when it's refreshed. Default: `false` */
    enableCellChangeFlash?: boolean;
    /** Set to `true` to prevent this column from flashing on changes. Only applicable if cell flashing is turned on for the grid. Default: `false` */
    suppressCellFlash?: boolean;
    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow row dragging. Default: `false` */
    rowDrag?: boolean | RowDragCallback<TData>;
    /**
     * A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
     * If this callback is not set, the `rowDragText` callback in the `gridOptions` will be used and
     * if there is no callback in the `gridOptions` the current cell value will be used.
     */
    rowDragText?: (params: IRowDragItem, dragItemCount: number) => string;
    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow dragging for native drag and drop. Default: `false` */
    dndSource?: boolean | DndSourceCallback<TData>;
    /** Function to allow custom drag functionality for native drag and drop. */
    dndSourceOnRowDrag?: (params: DndSourceOnRowDragParams<TData>) => void;
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
    /** Name of function to use for aggregation. In-built options are: `sum`, `min`, `max`, `count`, `avg`, `first`, `last`. Also accepts a custom aggregation name or an aggregation function. */
    aggFunc?: string | IAggFunc<TData> | null;
    /** Same as `aggFunc`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialAggFunc?: string | IAggFunc<TData>;
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
    /** Set to `true` to allow sorting on this column. Default: `false` */
    sortable?: boolean;
    /** If sorting by default, set it here. Set to `asc` or `desc`. */
    sort?: SortDirection;
    /** Same as `sort`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialSort?: SortDirection;
    /** If sorting more than one column by default, specifies order in which the sorting should be applied. */
    sortIndex?: number | null;
    /** Same as `sortIndex`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialSortIndex?: number;
    /**  Array defining the order in which sorting occurs (if sorting is enabled). An array with any of the following in any order `['asc','desc',null]` */
    sortingOrder?: (SortDirection)[];
    /**
     * Override the default sorting order by providing a custom sort comparator.
     *
     * - `valueA`, `valueB` are the values to compare.
     * - `nodeA`,  `nodeB` are the corresponding RowNodes. Useful if additional details are required by the sort.
     * - `isDescending` - `true` if sort direction is `desc`. Not to be used for inverting the return value as the grid already applies `asc` or `desc` ordering.
     *
     * Return:
     *  - `0`  valueA is the same as valueB
     *  - `> 0` Sort valueA after valueB
     *  - `< 0` Sort valueA before valueB
     */
    comparator?: (valueA: any, valueB: any, nodeA: IRowNode<TData>, nodeB: IRowNode<TData>, isDescending: boolean) => number;
    /** Set to `true` if you want the unsorted icon to be shown when no sort is applied to this column. Default: `false` */
    unSortIcon?: boolean;
    /** By default, each cell will take up the width of one column. You can change this behaviour to allow cells to span multiple columns. */
    colSpan?: (params: ColSpanParams<TData>) => number;
    /** By default, each cell will take up the height of one row. You can change this behaviour to allow cells to span multiple rows. */
    rowSpan?: (params: RowSpanParams<TData>) => number;
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
    /** Set to `true` if you want this column header for this column to span the whole height of the header container. Default: `false` */
    spanHeaderHeight?: boolean;
}
export interface ColumnFunctionCallbackParams<TData = any> extends AgGridCommon<TData, any> {
    /** Row node for the given row */
    node: IRowNode<TData>;
    /** Data associated with the node. Will be `undefined` for group rows. */
    data: TData | undefined;
    /** Column for this callback */
    column: Column;
    /** ColDef provided for this column */
    colDef: ColDef<TData>;
}
export interface CheckboxSelectionCallbackParams<TData = any> extends ColumnFunctionCallbackParams<TData> {
}
export interface CheckboxSelectionCallback<TData = any> {
    (params: CheckboxSelectionCallbackParams<TData>): boolean;
}
export interface RowDragCallbackParams<TData = any> extends ColumnFunctionCallbackParams<TData> {
}
export interface RowDragCallback<TData = any> {
    (params: RowDragCallbackParams<TData>): boolean;
}
export interface DndSourceCallbackParams<TData = any> extends ColumnFunctionCallbackParams<TData> {
}
export interface DndSourceOnRowDragParams<TData = any> extends AgGridCommon<TData, any> {
    /** Row node for the given row */
    rowNode: IRowNode<TData>;
    /** The DOM event that represents a drag and drop interaction */
    dragEvent: DragEvent;
}
export interface DndSourceCallback<TData = any> {
    (params: DndSourceCallbackParams<TData>): boolean;
}
export interface EditableCallbackParams<TData = any> extends ColumnFunctionCallbackParams<TData> {
}
export interface EditableCallback<TData = any> {
    (params: EditableCallbackParams<TData>): boolean;
}
export interface SuppressPasteCallbackParams<TData = any> extends ColumnFunctionCallbackParams<TData> {
}
export interface SuppressPasteCallback<TData = any> {
    (params: SuppressPasteCallbackParams<TData>): boolean;
}
export interface SuppressNavigableCallbackParams<TData = any> extends ColumnFunctionCallbackParams<TData> {
}
export interface SuppressNavigableCallback<TData = any> {
    (params: SuppressNavigableCallbackParams<TData>): boolean;
}
export interface HeaderCheckboxSelectionCallbackParams<TData = any> extends AgGridCommon<TData, any> {
    column: Column;
    colDef: ColDef<TData>;
}
export interface HeaderCheckboxSelectionCallback<TData = any> {
    (params: HeaderCheckboxSelectionCallbackParams<TData>): boolean;
}
/**
 * @deprecated
 * No longer in use. Replaced with (params: ColumnFunctionCallbackParams) => boolean.
 */
export interface IsColumnFunc<TData = any> {
    (params: IsColumnFuncParams<TData>): boolean;
}
/**
 * @deprecated
 * Replaced with ColumnFunctionCallbackParams
 */
export interface IsColumnFuncParams<TData = any> extends ColumnFunctionCallbackParams<TData> {
}
export interface GetQuickFilterTextParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    /** Value for the cell. */
    value: TValue;
    /** Row node for the given row */
    node: IRowNode<TData>;
    /** Row data associated with the node. */
    data: TData;
    /** Column for this callback */
    column: Column;
    /** ColDef provided for this column */
    colDef: ColDef<TData>;
}
export declare type ColumnMenuTab = 'filterMenuTab' | 'generalMenuTab' | 'columnsMenuTab';
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
    /** Custom Columns Panel layout */
    columnLayout?: (ColDef | ColGroupDef)[];
}
export interface BaseColDefParams<TData = any> extends AgGridCommon<TData, any> {
    /** Row node for the given row */
    node: IRowNode<TData> | null;
    /** Data associated with the node */
    data: TData;
    /** Column for this callback */
    column: Column;
    /** ColDef provided for this column */
    colDef: ColDef<TData>;
}
export interface BaseColDefOptionalDataParams<TData = any> extends AgGridCommon<TData, any> {
    /** Row node for the given row */
    node: IRowNode<TData> | null;
    /** Data associated with the node */
    data: TData | undefined;
    /** Column for this callback */
    column: Column;
    /** ColDef provided for this column */
    colDef: ColDef<TData>;
}
export interface ValueGetterParams<TData = any> extends BaseColDefOptionalDataParams<TData> {
    /** A utility method for getting other column values */
    getValue: (field: string) => any;
}
export interface ValueGetterFunc<TData = any> {
    (params: ValueGetterParams<TData>): any;
}
export interface HeaderValueGetterParams<TData = any> extends AgGridCommon<TData, any> {
    colDef: AbstractColDef<TData>;
    /** Column for this callback if applicable*/
    column?: Column | null;
    /** ColumnGroup for this callback if applicable */
    columnGroup?: ColumnGroup | ProvidedColumnGroup | null;
    /** Original column group if applicable */
    providedColumnGroup: ProvidedColumnGroup | null;
    /** Where the column is going to appear */
    location: string | null;
}
export interface HeaderValueGetterFunc<TData = any> {
    (params: HeaderValueGetterParams<TData>): any;
}
export interface NewValueParams<TData = any> extends BaseColDefParams<TData> {
    /** The value before the change */
    oldValue: any;
    /** The value after the change */
    newValue: any;
}
export interface ValueSetterParams<TData = any> extends NewValueParams<TData> {
}
export interface ValueSetterFunc<TData = any> {
    (params: ValueSetterParams<TData>): boolean;
}
export interface ValueParserParams<TData = any> extends NewValueParams<TData> {
}
export interface ValueParserFunc<TData = any, TValue = any> {
    (params: ValueParserParams<TData>): TValue;
}
export interface ValueFormatterParams<TData = any, TValue = any> extends BaseColDefOptionalDataParams<TData> {
    /** Value for the cell. */
    value: TValue;
}
export interface ValueFormatterFunc<TData = any> {
    (params: ValueFormatterParams<TData>): string;
}
export interface KeyCreatorParams<TData = any, TValue = any> extends BaseColDefParams<TData> {
    /** Value for the cell. */
    value: TValue;
}
export interface ColSpanParams<TData = any> extends BaseColDefOptionalDataParams<TData> {
}
export interface RowSpanParams<TData = any> extends BaseColDefOptionalDataParams<TData> {
}
export interface SuppressKeyboardEventParams<TData = any> extends ColumnFunctionCallbackParams<TData> {
    /** The keyboard event the grid received */
    event: KeyboardEvent;
    /** Whether the cell is editing or not */
    editing: boolean;
}
export interface SuppressHeaderKeyboardEventParams<TData = any> extends AgGridCommon<TData, any> {
    column: Column | ColumnGroup;
    colDef: ColDef<TData> | ColGroupDef<TData> | null;
    /** The index of the header row of the current focused header */
    headerRowIndex: number;
    /** The keyboard event the grid received */
    event: KeyboardEvent;
}
export interface CellClassParams<TData = any, TValue = any> extends RowClassParams<TData> {
    /** Column for this callback */
    column: Column;
    /** The colDef associated with the column for this cell */
    colDef: ColDef<TData>;
    /** The value to be rendered */
    value: TValue;
}
export interface CellClassFunc<TData = any> {
    (cellClassParams: CellClassParams<TData>): string | string[] | null | undefined;
}
export interface CellStyleFunc<TData = any> {
    (cellClassParams: CellClassParams<TData>): CellStyle | null | undefined;
}
export interface CellStyle {
    [cssProperty: string]: string | number;
}
export interface CellClassRules<TData = any> {
    [cssClassName: string]: (((params: CellClassParams<TData>) => boolean) | string);
}
export interface CellRendererSelectorFunc<TData = any> {
    (params: ICellRendererParams<TData>): CellRendererSelectorResult | undefined;
}
export interface CellEditorSelectorFunc<TData = any> {
    (params: ICellEditorParams<TData>): CellEditorSelectorResult | undefined;
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
    popupPosition?: 'over' | 'under';
}
export declare type SortDirection = 'asc' | 'desc' | null;
