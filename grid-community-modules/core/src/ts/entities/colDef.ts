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
export interface AbstractColDef<TData = any, TValue = any> {
    /** The name to render in the column header. If not specified and field is specified, the field name will be used as the header name. */
    headerName?: string;
    /** Function or expression. Gets the value for display in the header. */
    headerValueGetter?: string | HeaderValueGetterFunc<TData, TValue>;
    /** Tooltip for the column header */
    headerTooltip?: string;
    /** CSS class to use for the header cell. Can be a string, array of strings, or function. */
    headerClass?: HeaderClass<TData, TValue>;
    /** Suppress the grid taking action for the relevant keyboard event when a header is focused. */
    suppressHeaderKeyboardEvent?: (params: SuppressHeaderKeyboardEventParams<TData, TValue>) => boolean;

    /** Whether to only show the column when the group is open / closed. If not set the column is always displayed as part of the group. */
    columnGroupShow?: ColumnGroupShowType;
    /** CSS class to use for the tool panel cell. Can be a string, array of strings, or function. */
    toolPanelClass?: ToolPanelClass<TData, TValue>;
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
    // `Column` should be typed `TValue`. Change in v30
    /** Column the aggregation function is working on */
    column: Column;
    // `ColDef` should be typed `TValue`. Change in v30
    /** ColDef of the aggregation column */
    colDef: ColDef<TData>;
    /** The parent RowNode, where the aggregation result will be shown */
    rowNode: IRowNode<TData>;
    /** data (if any) of the parent RowNode */
    data: TData;
}

export interface HeaderClassParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    colDef: AbstractColDef<TData, TValue>;
    column?: Column<TValue> | null;
    columnGroup?: ColumnGroup | null;
}
export type HeaderClass<TData = any, TValue = any> = string | string[] | ((params: HeaderClassParams<TData, TValue>) => string | string[] | undefined);
export interface ToolPanelClassParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    colDef: AbstractColDef<TData, TValue>;
    column?: Column<TValue> | null;
    columnGroup?: ProvidedColumnGroup | null;
}
export type ToolPanelClass<TData = any, TValue = any> = string | string[] | ((params: ToolPanelClassParams<TData, TValue>) => string | string[] | undefined);

/** Configuration options for columns in AG Grid. */
export interface ColDef<TData = any, TValue = any> extends AbstractColDef<TData, TValue>, IFilterDef {

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
    valueGetter?: string | ValueGetterFunc<TData, TValue>;
    // `ValueFormatterFunc` should be type `TValue`. Change in v30
    /** A function or expression to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering. */
    valueFormatter?: string | ValueFormatterFunc<TData>;
    /** Provided a reference data map to be used to map column values to their respective value from the map. */
    refData?: { [key: string]: string; };
    // `KeyCreatorParams` should be typed `TValue`. Change in v30
    /**
     * Function to return a string key for a value.
     * This string is used for grouping, Set filtering, and searching within cell editor dropdowns.
     * When filtering and searching the string is exposed to the user, so make sure to return a human-readable value. */
    keyCreator?: (params: KeyCreatorParams<TData>) => string;
    /**
     * Custom comparator for values, used by renderer to know if values have changed. Cells whose values have not changed don't get refreshed.
     * By default the grid uses `===` which should work for most use cases.
     */
    equals?: (valueA: TValue, valueB: TValue) => boolean;
    /** The field of the tooltip to apply to the cell. */
    tooltipField?: string;
    /**
     * Callback that should return the string to use for a tooltip, `tooltipField` takes precedence if set.
     * If using a custom `tooltipComponent` you may return any custom value to be passed to your tooltip component.
     */
    tooltipValueGetter?: (params: ITooltipParams<TData, TValue>) => string | any;
    /** Set to `true` (or return `true` from function) to render a selection checkbox in the column. Default: `false` */
    checkboxSelection?: boolean | CheckboxSelectionCallback<TData, TValue>;
    /** Set to `true` to display a disabled checkbox when row is not selectable and checkboxes are enabled. Default: `false` */
    showDisabledCheckboxes?: boolean;
    /** Icons to use inside the column instead of the grid's default icons. Leave undefined to use defaults. */
    icons?: { [key: string]: Function | string; };
    /**
     * Set to `true` if this column is not navigable (i.e. cannot be tabbed into), otherwise `false`.
     * Can also be a callback function to have different rows navigable.
     * Default: `false`
     */
    suppressNavigable?: boolean | SuppressNavigableCallback<TData, TValue>;
    /** Allows the user to suppress certain keyboard events in the grid cell. Default: `false` */
    suppressKeyboardEvent?: (params: SuppressKeyboardEventParams<TData, TValue>) => boolean;
    /**
     * Pasting is on by default as long as cells are editable (non-editable cells cannot be modified, even with a paste operation).
     * Set to `true` turn paste operations off.
     */
    suppressPaste?: boolean | SuppressPasteCallback<TData, TValue>;
    /** Set to true to prevent the fillHandle from being rendered in any cell that belongs to this column */
    suppressFillHandle?: boolean;

    // *** Columns: Display *** //

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

    // *** Columns: Editing *** //

    /** Set to `true` if this column is editable, otherwise `false`. Can also be a function to have different rows editable. Default: `false` */
    editable?: boolean | EditableCallback<TData, TValue>;
    /** Function or expression. Sets the value into your data for saving. Return `true` if the data changed. */
    valueSetter?: string | ValueSetterFunc<TData, TValue>;
    /** Function or expression. Parses the value for saving. */
    valueParser?: string | ValueParserFunc<TData, TValue>;
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
    cellEditorSelector?: CellEditorSelectorFunc<TData, TValue>;

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

    // *** Columns: Events *** //

    /** Callback for after the value of a cell has changed, either due to editing or the application calling `api.setValue()`. */
    onCellValueChanged?: (event: NewValueParams<TData, TValue>) => void;
    /** Callback called when a cell is clicked. */
    onCellClicked?: (event: CellClickedEvent<TData, TValue>) => void;
    /** Callback called when a cell is double clicked. */
    onCellDoubleClicked?: (event: CellDoubleClickedEvent<TData, TValue>) => void;
    /** Callback called when a cell is right clicked. */
    onCellContextMenu?: (event: CellContextMenuEvent<TData, TValue>) => void;

    // *** Columns: Filtering *** //

    // `GetQuickFilterTextParams` should be typed `TValue`. Change in v30
    /** A function to tell the grid what Quick Filter text to use for this column if you don't want to use the default (which is calling `toString` on the value). */
    getQuickFilterText?: (params: GetQuickFilterTextParams<TData>) => string;
    /** Function or expression. Gets the value for filtering purposes. */
    filterValueGetter?: string | ValueGetterFunc<TData, TValue>;
    /** Whether to display a floating filter for this column. Default: `false` */
    floatingFilter?: boolean;

    // *** Column Headers *** //

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
    headerCheckboxSelection?: boolean | HeaderCheckboxSelectionCallback<TData, TValue>;
    /** If `true`, the header checkbox selection will only select filtered items. */
    headerCheckboxSelectionFilteredOnly?: boolean;
    /** If `true`, the header checkbox selection will only select nodes on the current page. */
    headerCheckboxSelectionCurrentPageOnly?: boolean;

    // *** Columns: Integrated Charts *** //

    /** Defines the chart data type that should be used for a column. */
    chartDataType?: 'category' | 'series' | 'time' | 'excluded';

    // *** Columns: Pinned *** //

    /** Pin a column to one side: `right` or `left`. A value of `true` is converted to `'left'`. */
    pinned?: boolean | 'left' | 'right' | null;
    /** Same as `pinned`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialPinned?: boolean | 'left' | 'right';
    /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API. Default: `false`  */
    lockPinned?: boolean;

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

    // `CellStyleFunc` should be typed `TValue`. Change in v30
    /** An object of css values / or function returning an object of css values for a particular cell. */
    cellStyle?: CellStyle | CellStyleFunc<TData>;
    // `CellClassFunc` should be typed `TValue`. Change in v30
    /** Class to use for the cell. Can be string, array of strings, or function that returns a string or array of strings. */
    cellClass?: string | string[] | CellClassFunc<TData>;
    // `CellClassRules` should be typed `TValue`. Change in v30
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
    cellRendererSelector?: CellRendererSelectorFunc<TData, TValue>;

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
    rowDrag?: boolean | RowDragCallback<TData, TValue>;

    /**
     * A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
     * If this callback is not set, the `rowDragText` callback in the `gridOptions` will be used and
     * if there is no callback in the `gridOptions` the current cell value will be used.
     */
    rowDragText?: (params: IRowDragItem, dragItemCount: number) => string;

    /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow dragging for native drag and drop. Default: `false` */
    dndSource?: boolean | DndSourceCallback<TData, TValue>;
    /** Function to allow custom drag functionality for native drag and drop. */
    dndSourceOnRowDrag?: (params: DndSourceOnRowDragParams<TData>) => void;

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
    // `IAggFunc` should be typed `TValue`. Change in v30
    /** Name of function to use for aggregation. In-built options are: `sum`, `min`, `max`, `count`, `avg`, `first`, `last`. Also accepts a custom aggregation name or an aggregation function. */
    aggFunc?: string | IAggFunc<TData, TValue> | null;
    // `IAggFunc` should be typed `TValue`. Change in v30
    /** Same as `aggFunc`, except only applied when creating a new column. Not applied when updating column definitions. */
    initialAggFunc?: string | IAggFunc<TData, TValue>;
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
    comparator?: (valueA: TValue | undefined, valueB: TValue | undefined, nodeA: IRowNode<TData>, nodeB: IRowNode<TData>, isDescending: boolean) => number;
    /** Set to `true` if you want the unsorted icon to be shown when no sort is applied to this column. Default: `false` */
    unSortIcon?: boolean;

    // *** Columns: Spanning *** //

    /** By default, each cell will take up the width of one column. You can change this behaviour to allow cells to span multiple columns. */
    colSpan?: (params: ColSpanParams<TData, TValue>) => number;
    /** By default, each cell will take up the height of one row. You can change this behaviour to allow cells to span multiple rows. */
    rowSpan?: (params: RowSpanParams<TData, TValue>) => number;

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

    /** Set to `true` if you want this column header for this column to span the whole height of the header container. Default: `false` */
    spanHeaderHeight?: boolean;
}
export interface ColumnFunctionCallbackParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    /** Row node for the given row */
    node: IRowNode<TData>;
    /** Data associated with the node. Will be `undefined` for group rows. */
    data: TData | undefined;
    /** Column for this callback */
    column: Column<TValue>;
    /** ColDef provided for this column */
    colDef: ColDef<TData, TValue>;
}

export interface CheckboxSelectionCallbackParams<TData = any, TValue = any> extends ColumnFunctionCallbackParams<TData, TValue> { }
export interface CheckboxSelectionCallback<TData = any, TValue = any> {
    (params: CheckboxSelectionCallbackParams<TData, TValue>): boolean;
}
export interface RowDragCallbackParams<TData = any, TValue = any> extends ColumnFunctionCallbackParams<TData, TValue> { }
export interface RowDragCallback<TData = any, TValue = any> {
    (params: RowDragCallbackParams<TData, TValue>): boolean;
}
export interface DndSourceCallbackParams<TData = any, TValue = any> extends ColumnFunctionCallbackParams<TData, TValue> { }

export interface DndSourceOnRowDragParams<TData = any> extends AgGridCommon<TData, any> {
    /** Row node for the given row */
    rowNode: IRowNode<TData>;
    /** The DOM event that represents a drag and drop interaction */
    dragEvent: DragEvent;
}
export interface DndSourceCallback<TData = any, TValue = any> {
    (params: DndSourceCallbackParams<TData, TValue>): boolean;
}
export interface EditableCallbackParams<TData = any, TValue = any> extends ColumnFunctionCallbackParams<TData, TValue> { }
export interface EditableCallback<TData = any, TValue = any> {
    (params: EditableCallbackParams<TData, TValue>): boolean;
}
export interface SuppressPasteCallbackParams<TData = any, TValue = any> extends ColumnFunctionCallbackParams<TData, TValue> { }
export interface SuppressPasteCallback<TData = any, TValue = any> {
    (params: SuppressPasteCallbackParams<TData, TValue>): boolean;
}
export interface SuppressNavigableCallbackParams<TData = any, TValue = any> extends ColumnFunctionCallbackParams<TData, TValue> { }
export interface SuppressNavigableCallback<TData = any, TValue = any> {
    (params: SuppressNavigableCallbackParams<TData, TValue>): boolean;
}
export interface HeaderCheckboxSelectionCallbackParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    column: Column<TValue>;
    colDef: ColDef<TData, TValue>;
}
export interface HeaderCheckboxSelectionCallback<TData = any, TValue = any> {
    (params: HeaderCheckboxSelectionCallbackParams<TData, TValue>): boolean;
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
export interface IsColumnFuncParams<TData = any> extends ColumnFunctionCallbackParams<TData> { }

export interface GetQuickFilterTextParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    /** Value for the cell. */
    value: TValue;
    /** Row node for the given row */
    node: IRowNode<TData>;
    /** Row data associated with the node. */
    data: TData;
    // `Column` should be typed `TValue`. Change in v30
    /** Column for this callback */
    column: Column;
    // `ColDef` should be typed `TValue`. Change in v30
    /** ColDef provided for this column */
    colDef: ColDef<TData>;
}

export type ColumnMenuTab = 'filterMenuTab' | 'generalMenuTab' | 'columnsMenuTab';

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

export interface BaseColDefParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    /** Row node for the given row */
    node: IRowNode<TData> | null;
    /** Data associated with the node */
    data: TData;
    /** Column for this callback */
    column: Column<TValue>;
    /** ColDef provided for this column */
    colDef: ColDef<TData, TValue>;
}

export interface BaseColDefOptionalDataParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    /** Row node for the given row */
    node: IRowNode<TData> | null;
    /** Data associated with the node */
    data: TData | undefined;
    /** Column for this callback */
    column: Column<TValue>;
    /** ColDef provided for this column */
    colDef: ColDef<TData, TValue>;
}

export interface ValueGetterParams<TData = any, TValue = any> extends BaseColDefOptionalDataParams<TData, TValue> {
    /** A utility method for getting other column values */
    getValue: (field: string) => any;
}
export interface ValueGetterFunc<TData = any, TValue = any> {
    (params: ValueGetterParams<TData, TValue>): TValue | undefined;
}
export interface HeaderValueGetterParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    colDef: AbstractColDef<TData, TValue>;
    /** Column for this callback if applicable*/
    column?: Column<TValue> | null;
    /** ColumnGroup for this callback if applicable */
    columnGroup?: ColumnGroup | ProvidedColumnGroup | null;
    /** Original column group if applicable */
    providedColumnGroup: ProvidedColumnGroup | null;
    /** Where the column is going to appear */
    location: string | null;
}
export interface HeaderValueGetterFunc<TData = any, TValue = any> {
    // return should be type string. Change in v30
    (params: HeaderValueGetterParams<TData, TValue>): any;
}

// In the case of parsers, the old and new values are of different types
interface ChangedValueParams<TData, TValueOld, TValueNew> extends BaseColDefParams<TData, TValueOld> {
    /** The value before the change */
    oldValue: TValueOld;
    /** The value after the change */
    newValue: TValueNew;
}
export interface NewValueParams<TData = any, TValue = any> extends ChangedValueParams<TData, TValue | undefined, TValue | undefined> {
}

export interface ValueSetterParams<TData = any, TValue = any> extends ChangedValueParams<TData, TValue | undefined, TValue | undefined> {
}
export interface ValueSetterFunc<TData = any, TValue = any> {
    (params: ValueSetterParams<TData, TValue>): boolean;
}
// `newValue` should be type `string` (no `undefined`). Change in v30
export interface ValueParserParams<TData = any, TValue = any> extends ChangedValueParams<TData, TValue | undefined, any> {
}
export interface ValueParserFunc<TData = any, TValue = any> {
    // `ValueParserParams` should be type `TValue`. Return should be `TValue | undefined`. Change in v30
    (params: ValueParserParams<TData>): TValue;
}

// `BaseColDefOptionalDataParams` should be type `TValue`. Change in v30
export interface ValueFormatterParams<TData = any, TValue = any> extends BaseColDefOptionalDataParams<TData> {
    // `value` should be `TValue | undefined`. Change in v30
    /** Value for the cell. */
    value: TValue;
}

export interface ValueFormatterFunc<TData = any, TValue = any> {
    (params: ValueFormatterParams<TData, TValue>): string;
}

// `BaseColDefParams` should be typed `TValue`. Change in v30
export interface KeyCreatorParams<TData = any, TValue = any> extends BaseColDefParams<TData> {
    /** Value for the cell. */
    value: TValue;
}

export interface ColSpanParams<TData = any, TValue = any> extends BaseColDefOptionalDataParams<TData, TValue> {
}

export interface RowSpanParams<TData = any, TValue = any> extends BaseColDefOptionalDataParams<TData, TValue> {
}

export interface SuppressKeyboardEventParams<TData = any, TValue = any> extends ColumnFunctionCallbackParams<TData, TValue> {
    /** The keyboard event the grid received */
    event: KeyboardEvent;
    /** Whether the cell is editing or not */
    editing: boolean;
}

export interface SuppressHeaderKeyboardEventParams<TData = any, TValue = any> extends AgGridCommon<TData, any> {
    column: Column<TValue> | ColumnGroup;
    colDef: ColDef<TData, TValue> | ColGroupDef<TData> | null;
    /** The index of the header row of the current focused header */
    headerRowIndex: number;
    /** The keyboard event the grid received */
    event: KeyboardEvent;
}

export interface CellClassParams<TData = any, TValue = any> extends RowClassParams<TData> {
    // `Column` should be typed `TValue`. Change in v30
    /** Column for this callback */
    column: Column;
    // `ColDef` should be typed `TValue`. Change in v30
    /** The colDef associated with the column for this cell */
    colDef: ColDef<TData>;
    // `value` should be typed `TValue | undefined`. Change in v30
    /** The value to be rendered */
    value: TValue;
}
export interface CellClassFunc<TData = any, TValue = any> {
    (cellClassParams: CellClassParams<TData, TValue>): string | string[] | null | undefined;
}
export interface CellStyleFunc<TData = any, TValue = any> {
    (cellClassParams: CellClassParams<TData, TValue>): CellStyle | null | undefined;
}

export interface CellStyle { [cssProperty: string]: string | number; }
export interface CellClassRules<TData = any, TValue = any> {
    [cssClassName: string]: (((params: CellClassParams<TData, TValue>) => boolean) | string);
}

export interface CellRendererSelectorFunc<TData = any, TValue = any> {
    (params: ICellRendererParams<TData, TValue>): CellRendererSelectorResult | undefined;
}

export interface CellEditorSelectorFunc<TData = any, TValue = any> {
    (params: ICellEditorParams<TData, TValue>): CellEditorSelectorResult | undefined;
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

export type SortDirection = 'asc' | 'desc' | null;