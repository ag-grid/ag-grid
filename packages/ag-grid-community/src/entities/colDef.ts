import type { CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent } from '../events';
import type { ICellEditorParams } from '../interfaces/iCellEditor';
import type { Column, ColumnGroup, ColumnGroupShowType, ProvidedColumnGroup } from '../interfaces/iColumn';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { IFilterDef } from '../interfaces/iFilter';
import type { ILoadingCellRendererParams } from '../interfaces/iLoadingCellRenderer';
import type { RowDragTextFunc } from '../interfaces/iRowDragItem';
import type { IRowNode } from '../interfaces/iRowNode';
import type { SortDef, SortDirection, SortType } from '../interfaces/iSort';
import type { DefaultMenuItem, MenuItemDef } from '../interfaces/menuItem';
import type { ICellRendererParams } from '../rendering/cellRenderers/iCellRenderer';
import type { ITooltipParams } from '../tooltip/tooltipComponent';
import type { Icons } from '../utils/icon';
import type {
    BaseColDefOptionalDataParams,
    BaseColDefParams,
    ChangedValueParams,
    ColumnFunctionCallbackParams,
} from './colDef-base';
import type {
    GroupRowEditableCallback,
    GroupRowValueSetterFunc,
    GroupRowValueSetterOptions,
} from './colDef-groupRowValueSetter';
import type { ShowValuesAs, ShowValuesAsDef, ShowValuesAsType } from './colDef-showValuesAs';
import type { GetContextMenuItems, GetMainMenuItems, RowClassParams } from './gridOptions';

export type { BaseColDefParams, ColumnFunctionCallbackParams } from './colDef-base';

/** AbstractColDef can be a group or a column definition */
export interface AbstractColDef<TData = any, TValue = any> {
    /** The name to render in the column header. If not specified and field is specified, the field name will be used as the header name. */
    headerName?: string;
    /** Function or expression. Gets the value for display in the header. */
    headerValueGetter?: string | HeaderValueGetterFunc<TData, TValue>;
    /**
     * Tooltip for the column header, `headerTooltipValueGetter` takes precedence if set.
     * When the column is grouped with `groupDisplayType: 'multipleColumns'`, the generated group column header inherits this value.
     * @agModule `TooltipModule`
     */
    headerTooltip?: string;

    /**
     * Callback that should return the string to use for a tooltip.
     * @agModule `TooltipModule`
     */
    headerTooltipValueGetter?: HeaderTooltipValueGetterFunc<TData, TValue>;

    /** An object of CSS values / or function returning an object of CSS values for a particular header. */
    headerStyle?: HeaderStyle | HeaderStyleFunc<TData, TValue>;
    /** CSS class to use for the header cell. Can be a string, array of strings, or function. */
    headerClass?: HeaderClass<TData, TValue>;
    /** Suppress the grid taking action for the relevant keyboard event when a header is focused. */
    suppressHeaderKeyboardEvent?: SuppressHeaderKeyboardEventFunc<TData, TValue>;

    /** Whether to only show the column when the group is open / closed. If not set the column is always displayed as part of the group. */
    columnGroupShow?: ColumnGroupShowType;
    /**
     * CSS class to use for the tool panel cell. Can be a string, array of strings, or function.
     * @agModule `ColumnsToolPanelModule`
     */
    toolPanelClass?: ToolPanelClass<TData, TValue>;
    /**
     * Set to `true` if you do not want this column or group to appear in the Columns Tool Panel.
     * @default false
     * @agModule `ColumnsToolPanelModule`
     */
    suppressColumnsToolPanel?: boolean;

    /**
     * Set to `true` if you do not want this column (filter) or group (filter group) to appear in the Filters Tool Panel.
     * @default false
     * @agModule `ColumnsToolPanelModule`
     */
    suppressFiltersToolPanel?: boolean;

    /**
     * Provide your own tooltip component for the column.
     * See [Tooltip Component](https://www.ag-grid.com/javascript-data-grid/tooltips/) for framework specific implementation details.
     * When the column is grouped, group rows in the generated group column inherit this component.
     * @agModule `TooltipModule`
     */
    tooltipComponent?: any;
    /**
     * The params used to configure `tooltipComponent`.
     * @agModule `TooltipModule`
     */
    tooltipComponentParams?: any;

    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotKeys?: string[];

    /**
     * Used for screen reader announcements - the role property of the cells that belong to this column.
     * @default 'gridcell'
     */
    cellAriaRole?: string;

    /**
     * Context property that can be used to associate arbitrary application data with this column definition.
     */
    context?: any;

    /** If enabled then column header names that are too long for the column width will wrap onto the next line. Default `false` */
    wrapHeaderText?: boolean;
    /** If enabled then the column header row will automatically adjust height to accommodate the size of the header cell.
     * This can be useful when using your own `headerComponent` or long header names in conjunction with `wrapHeaderText`.
     * @default false
     */
    autoHeaderHeight?: boolean;

    /**
     * Set to `true` to not display the column menu when the column header is right-clicked.
     * Doesn't apply when `columnMenu = 'legacy'`.
     * @default false
     */
    suppressHeaderContextMenu?: boolean;
}

/** Configuration options for column groups in AG Grid.  */
export interface ColGroupDef<TData = any> extends AbstractColDef<TData> {
    /** A list containing a mix of columns and column groups. */
    children: (ColDef<TData> | ColGroupDef<TData>)[];
    /** The unique ID to give the column. This is optional. If missing, a unique ID will be generated. This ID is used to identify the column group in the API. */
    groupId?: string;
    /**
     * Set to `true` if this group should be opened by default.
     * @default false
     */
    openByDefault?: boolean;
    /**
     * Set to `true` to keep columns in this group beside each other in the grid. Moving the columns outside of the group (and hence breaking the group) is not allowed.
     * @default false
     */
    marryChildren?: boolean;
    /**
     * If `true` the label of the Column Group will not scroll alongside the grid to always remain visible.
     * @default false
     */
    suppressStickyLabel?: boolean;

    /**
     * The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used.
     * See [Header Group Component](https://www.ag-grid.com/javascript-data-grid/column-headers/#header-group-components) for framework specific implementation details.
     */
    headerGroupComponent?: any;
    /** The params used to configure the `headerGroupComponent`. */
    headerGroupComponentParams?: any;

    /**
     * Customise the list of menu items available in the column group header context menu (on right-click).
     * The column menu button is not displayed for column groups.
     * @agModule `ColumnMenuModule`
     */
    mainMenuItems?: (DefaultMenuItem | MenuItemDef<TData>)[] | GetMainMenuItems<TData>;
}

/** Select a column via:
 * - the string (colId)
 * - the colDef object
 * - the Column instance
 */
export type ColKey<TData = any, TValue = any> = string | ColDef<TData, TValue> | Column<TValue>;

export type IAggFunc<TData = any, TValue = any, TContext = any> = (
    params: IAggFuncParams<TData, TValue, TContext>
) => any;

export type IAggFuncs<TData = any, TValue = any, TContext = any> = { [key: string]: IAggFunc<TData, TValue, TContext> };

export type ColAggFunc<TData = any, TValue = any> = string | IAggFunc<TData, TValue> | null | undefined;

/**
 * Wrapper returned by the built-in `avg` and `count` aggregation functions, and the recommended
 * shape for custom agg functions that expose a scalar value alongside metadata (e.g. a count, used
 * when re-aggregating across nested groups).
 *
 * - `avg` returns `{ value, count, toString(), toNumber() }`
 * - `count` returns `{ value, toString(), toNumber() }`
 *
 * Other built-ins (`sum`, `min`, `max`, `first`, `last`) return plain scalars.
 */
export interface IAggFuncResult<TAggValue = number | bigint | null> {
    /** The aggregated scalar value. */
    value?: TAggValue;
    /** The count of aggregated values. Present on `avg` results. */
    count?: number;
    /** Returns a string representation of the aggregated value. Used also for sorting. */
    toString(): string;

    /** Returns the numeric representation of the aggregated value. Used also for sorting. */
    toNumber?(): TAggValue;
}

export interface IAggFuncParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** Values to aggregate */
    values: (TValue | null)[];
    /** Column the aggregation function is working on */
    column: Column<TValue>;
    /** ColDef of the aggregation column */
    colDef: ColDef<TData, TValue>;
    /** Pivot Result Column being produced using this aggregation */
    pivotResultColumn?: Column;
    /** The parent RowNode, where the aggregation result will be shown */
    rowNode: IRowNode<TData>;
    /** data (if any) of the parent RowNode */
    data: TData;
    /**
     * The immediate children of rowNode that contribute to the aggregation.
     *
     * - For leaf groups (groups containing data rows): returns the data rows.
     *   With pivot columns, only rows matching the pivot keys are included.
     * - For non-leaf groups (groups containing other groups): returns the child groups.
     *
     * @see {@link IRowNode.getAggregatedChildren} to retrieve the same children programmatically.
     */
    aggregatedChildren: IRowNode<TData>[];
}

export type PivotComparatorFunc = (valueA: string, valueB: string) => number;

export type HeaderStyleFunc<TData = any, TValue = any, TContext = any> = (
    headerClassParams: HeaderClassParams<TData, TValue, TContext>
) => HeaderStyle | null | undefined;

export interface HeaderStyle {
    [cssProperty: string]: string | number;
}

export interface HeaderClassParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<TData, TContext> {
    colDef: AbstractColDef<TData, TValue>;
    column?: Column<TValue> | null;
    columnGroup?: ColumnGroup | null;
    floatingFilter: boolean;
}
export type HeaderClass<TData = any, TValue = any, TContext = any> =
    | string
    | string[]
    | ((params: HeaderClassParams<TData, TValue, TContext>) => string | string[] | undefined);
export interface ToolPanelClassParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<TData, TContext> {
    colDef: AbstractColDef<TData, TValue>;
    column?: Column<TValue> | null;
    columnGroup?: ProvidedColumnGroup | null;
}
export type ToolPanelClass<TData = any, TValue = any, TContext = any> =
    | string
    | string[]
    | ((params: ToolPanelClassParams<TData, TValue, TContext>) => string | string[] | undefined);

type StringOrNumKeys<TObj> = keyof TObj & (string | number);
type NestedPath<TValue, Prefix extends string, TValueNestedChild, TDepth extends any[]> = TValue extends object
    ? `${Prefix}.${TDepth['length'] extends 5 ? any : NestedFieldPaths<TValue, TValueNestedChild, TDepth>}`
    : never;

// This type wrapper is needed for correct handling of union types in ColDefField
// If a user provides a union type for TData = {a: string} | { b: string} then ColDefField<TData> will be "a" | "b"
// Without the ColDefField wrapper NestedFieldPaths<TData> would return never as there is no overlap between the two types
/**
 * Returns a union of all possible paths to nested fields in `TData`.
 */
export type ColDefField<TData = any, TValue = any> = TData extends any ? NestedFieldPaths<TData, TValue, []> : never;

/**
 * Returns a union of all possible paths to nested fields in `TData`.
 */
export type NestedFieldPaths<TData = any, TValue = any, TDepth extends any[] = []> = {
    [TKey in StringOrNumKeys<TData>]: TData[TKey] extends ((...args: any[]) => any) | undefined
        ? never // ignore functions
        : TData[TKey] extends any[] | undefined
          ? (TData[TKey] extends TValue ? `${TKey}` : never) | `${TKey}.${number}` // arrays support index access
          :
                | (TData[TKey] extends TValue ? `${TKey}` : never)
                | NestedPath<TData[TKey], `${TKey}`, TValue, [...TDepth, any]>;
}[StringOrNumKeys<TData>];

export type SortComparatorFn<TData = any, TValue = any> = (
    valueA: TValue | null | undefined,
    valueB: TValue | null | undefined,
    nodeA: IRowNode<TData>,
    nodeB: IRowNode<TData>,
    isDescending: boolean
) => number;

/** Configuration options for columns in AG Grid. */
export interface ColDef<TData = any, TValue = any> extends AbstractColDef<TData, TValue>, IFilterDef {
    // *** Columns *** //

    /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
     *  If both field and colId are missing, a unique ID will be generated.
     *  This ID is used to identify the column in the API for sorting, filtering etc.
     */
    colId?: string;
    /**
     * The field of the row object to get the cell's data from.
     * Deep references into a row object is supported via dot notation, i.e `'address.firstLine'`.
     */
    field?: ColDefField<TData, TValue>;
    /**
     * A comma separated string or array of strings containing `ColumnType` keys which can be used as a template for a column.
     * This helps to reduce duplication of properties when you have a lot of common column properties.
     */
    type?: string | string[];
    /**
     * The data type of the cell values for this column.
     * Can either infer the data type from the row data (`true` - the default behaviour),
     * define a specific data type (`string`), or have no data type (`false`).
     *
     * If setting a specific data type (`string` value),
     * this can either be one of the pre-defined data types
     * `'text'`, `'number'`,  `'boolean'`,  `'date'`,  `'dateString'` or  `'object'`,
     * or a custom data type that has been defined in the `dataTypeDefinitions` grid option.
     *
     * Data type inference only works for the Client-Side Row Model, and requires non-null data.
     * It will also not work if the `valueGetter`, `valueParser` or `refData` properties are defined,
     * or if this column is a sparkline.
     *
     * @default true
     */
    cellDataType?: boolean | string;
    /**
     * Allow formulas to be entered and evaluated in this column.
     * @default false
     * @agModule `FormulaModule`
     */
    allowFormula?: boolean;
    /**
     * Expression used to calculate this column's value from other columns in the same row.
     * Use bracket references to read other columns by `colId`, e.g. `[revenue] - [cost]`.
     * Calculated columns are read-only.
     * @agModule `CalculatedColumnsModule`
     */
    calculatedExpression?: string;
    /** Function or expression. Gets the value from your data for display. */
    valueGetter?: string | ValueGetterFunc<TData, TValue>;
    /** A function or expression to format a value, should return a string. */
    valueFormatter?: string | ValueFormatterFunc<TData, TValue>;
    /** Provided a reference data map to be used to map column values to their respective value from the map. */
    refData?: RefData;
    /**
     * Function to return a string key for a value.
     * This string is used for grouping, Set filtering, and searching within cell editor dropdowns.
     * When filtering and searching the string is exposed to the user, so make sure to return a human-readable value.
     */
    keyCreator?: KeyCreatorFunc<TData, TValue>;
    /**
     * Custom comparator for values, used by renderer to know if values have changed. Cells whose values have not changed don't get refreshed.
     * By default the grid uses `===` which should work for most use cases.
     */
    equals?: EqualsFunc<TValue>;
    /**
     * The field of the tooltip to apply to the cell.
     * When the column is grouped, group rows in the generated group column inherit this value.
     * @agModule `TooltipModule`
     */
    tooltipField?: ColDefField<TData>;
    /**
     * Callback that should return the string to use for a tooltip, `tooltipField` takes precedence if set.
     * If using a custom `tooltipComponent` you may return any custom value to be passed to your tooltip component.
     * When the column is grouped, group rows in the generated group column inherit this callback.
     * @agModule `TooltipModule`
     */
    tooltipValueGetter?: TooltipValueGetterFunc<TData, TValue>;

    /**
     * Callback to select which tooltip component to be used for a given row within the same column.
     * @agModule `TooltipModule`
     */
    tooltipComponentSelector?: CellEditorSelectorFunc | CellRendererSelectorFunc;

    /**
     * @deprecated v32.2 Use the new selection API instead. See `GridOptions.rowSelection`
     *
     * Set to `true` (or return `true` from function) to render a selection checkbox in the column.
     * @default false
     */
    checkboxSelection?: boolean | CheckboxSelectionCallback<TData, TValue>;
    /**
     * @deprecated v32.2 Use the new selection API instead. See `GridOptions.rowSelection`
     *
     * Set to `true` to display a disabled checkbox when row is not selectable and checkboxes are enabled.
     * @default false
     */
    showDisabledCheckboxes?: boolean;
    /**
     * Icons to use inside the column instead of the grid's default icons. Leave undefined to use defaults.
     * @initial
     * */
    icons?: Icons;
    /**
     * Set to `true` if this column is not navigable (i.e. cannot be tabbed into), otherwise `false`.
     * Can also be a callback function to have different rows navigable.
     * @default false
     */
    suppressNavigable?: boolean | SuppressNavigableCallback<TData, TValue>;
    /**
     * Set to `true` to suppress built-in note actions for this column.
     * Existing notes remain viewable on hover and through `getNote()`.
     * Can also be a callback function to suppress notes for specific rows.
     * @default false
     * @agModule `NotesModule`
     */
    suppressNoteActions?: boolean | SuppressNoteActionsCallback<TData, TValue>;
    /**
     * Allows the user to suppress certain keyboard events in the grid cell.
     * @default false
     */
    suppressKeyboardEvent?: SuppressKeyboardEventFunc<TData, TValue>;
    /**
     * Pasting is on by default as long as cells are editable (non-editable cells cannot be modified, even with a paste operation).
     * Set to `true` turn paste operations off.
     */
    suppressPaste?: boolean | SuppressPasteCallback<TData, TValue>;
    /** Set to true to prevent the fillHandle from being rendered in any cell that belongs to this column */
    suppressFillHandle?: boolean;

    // *** Columns: Display *** //

    /**
     * Set to `true` for this column to be hidden.
     * @default false
     */
    hide?: boolean | null;
    /**
     * Same as `hide`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     */
    initialHide?: boolean;
    /**
     * Set to `true` to block making column visible / hidden via the UI (API will still work).
     * @default false
     */
    lockVisible?: boolean;
    /** Lock a column to position to `'left'` or`'right'` to always have this column displayed in that position. `true` is treated as `'left'` */
    lockPosition?: boolean | 'left' | 'right';
    /**
     * Set to `true` if you do not want this column to be movable via dragging.
     * @default false
     */
    suppressMovable?: boolean;
    /**
     * By default, values are formatted using the column's `valueFormatter` when exporting data from the grid.
     * This applies to CSV, Excel, and PDF export, as well as clipboard operations and the fill handle.
     * Set to `false` to prevent values from being formatted for these operations.
     * Regardless of this option, if custom handling is provided for the export operation, the value formatter will not be used.
     * @default true
     */
    useValueFormatterForExport?: boolean;

    // *** Columns: Editing *** //

    /**
     * Set to `true` if this column is editable, otherwise `false`. Can also be a function to have different rows editable.
     * When grouping, see `groupRowEditable` instead for group rows.
     * @default false
     */
    editable?: boolean | EditableCallback<TData, TValue>;
    /**
     * Works like `editable`, but is evaluated only for group rows. When provided, group rows use
     * this property instead of `editable`. Set to `true` to make group row cells editable, or use
     * a callback to control editability per row.
     *
     * When `groupRowEditable` is defined and no explicit `groupRowValueSetter` is provided,
     * the built-in `distributeGroupValue` (exported from `ag-grid-enterprise`) is used automatically.
     *
     * Columns with `groupRowEditable` or `groupRowValueSetter` do not require `field` or
     * `valueSetter` - the group row value setter handles the edit entirely.
     *
     * Note: if `groupRowValueSetter` resolves to `false` or `null` (via `distribution: false`,
     * a per-aggFunc record entry, or `groupRowValueSetter: false`), the cell is treated as not
     * editable even when `groupRowEditable` is `true`.
     *
     * @agModule `RowGroupingEditModule`
     */
    groupRowEditable?: boolean | GroupRowEditableCallback<TData, TValue>;
    /**
     * Controls how a group row value edit is distributed to descendant rows.
     *
     * - **`true`**: Uses the built-in `distributeGroupValue` (exported from `ag-grid-enterprise`) with default settings.
     *   Also enabled implicitly when `groupRowEditable` is defined and `groupRowValueSetter` is not set.
     * - **`false`**: Explicitly disables group row value distribution and makes the cell not editable,
     *   even if `groupRowEditable` is defined.
     * - **Function**: A custom callback that receives a {@link GroupRowValueSetterParams} and pushes
     *   edits down to descendants. The column does not need `field` or `valueSetter` - the callback
     *   handles the edit entirely.
     * - **Options object**: Uses the built-in distribution logic with a {@link GroupRowValueSetterOptions}
     *   configuration. When `distribution` resolves to `false` or `null` for the column's aggFunc,
     *   the cell is treated as not editable (overriding `groupRowEditable`).
     *
     * Fires for every `setDataValue` call when active, regardless of `groupRowEditable`.
     *
     * @agModule `RowGroupingEditModule`
     */
    groupRowValueSetter?: boolean | GroupRowValueSetterFunc<TData, TValue> | GroupRowValueSetterOptions<TData, TValue>;
    /**
     * Function or expression. Sets the value into your data for saving. Return `true` if the data changed.
     */
    valueSetter?: string | ValueSetterFunc<TData, TValue>;
    /** Function or expression. Parses the value for saving. */
    valueParser?: string | ValueParserFunc<TData, TValue>;
    /**
     * Provide your own cell editor component for this column's cells.
     */
    cellEditor?: any;
    /**
     * Params to be passed to the `cellEditor` component.
     */
    cellEditorParams?: any;
    /** Callback to select which cell editor to be used for a given row within the same column. */
    cellEditorSelector?: CellEditorSelectorFunc<TData, TValue>;

    /**
     * Set to `true` to have cells under this column enter edit mode after single click.
     * @default false
     */
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
     * @default 'over'
     */
    cellEditorPopupPosition?: 'over' | 'under';
    /**
     * By default, values are parsed using the column's `valueParser` when importing data to the grid.
     * This applies to clipboard operations and the fill handle.
     * Set to `false` to prevent values from being parsed for these operations.
     * Regardless of this option, if custom handling is provided for the import operation, the value parser will not be used.
     * @default true
     */
    useValueParserForImport?: boolean;

    // *** Columns: Events *** //

    // NOTE: Make sure that wherever these are called that they are wrapped in frameworkOverrides.wrapOutgoing()

    /** Callback for after the value of a cell has changed, either due to editing or the application calling `api.setValue()`. */
    onCellValueChanged?: (event: NewValueParams<TData, TValue>) => void;
    /** Callback called when a cell is clicked. */
    onCellClicked?: (event: CellClickedEvent<TData, TValue>) => void;
    /** Callback called when a cell is double clicked. */
    onCellDoubleClicked?: (event: CellDoubleClickedEvent<TData, TValue>) => void;
    /** Callback called when a cell is right clicked. */
    onCellContextMenu?: (event: CellContextMenuEvent<TData, TValue>) => void;

    // *** Columns: Filtering *** //

    /**
     *  A function to tell the grid what Quick Filter text to use for this column if you don't want to use the default (which is calling `toString` on the value).
     * @agModule `QuickFilterModule`
     */
    getQuickFilterText?: GetQuickFilterText<TData, TValue>;
    /**
     * Function or expression. Gets the value for filtering purposes.
     */
    filterValueGetter?: string | ValueGetterFunc<TData>;
    /**
     * Whether to display a floating filter for this column.
     * @default false
     */
    floatingFilter?: boolean;
    /**
     * If `true`, the button in the floating filter that opens the parent filter in a popup will not be displayed.
     * Only applies if `floatingFilter = true`.
     */
    suppressFloatingFilterButton?: boolean;
    /**
     * Custom date selection component to be used in Date Filters and Date Floating Filters for this column.
     * See [Custom Selection Component](https://www.ag-grid.com/javascript-data-grid/filter-date/#custom-selection-component) for framework specific implementation detail.
     */
    dateComponent?: any;
    /** The parameters to be passed to the `dateComponent`. */
    dateComponentParams?: any;

    // *** Find *** //
    /**
     * When using Find with custom cell renderers, this allows providing a custom value to search within.
     * E.g. if the cell renderer is displaying text that is different from the cell formatted value.
     * Returning `null` means Find will not search within the cell.
     * @agModule `FindModule`
     */
    getFindText?: GetFindTextFunc<TData, TValue>;

    // *** Column Headers *** //
    /**
     * The custom header component to be used for rendering the component header. If none specified the default AG Grid header component is used.
     * See [Header Component](https://www.ag-grid.com/javascript-data-grid/column-headers/) for framework specific implementation detail.
     */
    headerComponent?: any;
    /** The parameters to be passed to the `headerComponent`. */
    headerComponentParams?: any;

    /**
     * Set to an array containing zero, one or many of the following options: `'filterMenuTab' | 'generalMenuTab' | 'columnsMenuTab'`.
     * This is used to figure out which menu tabs are present and in which order the tabs are shown.
     */
    menuTabs?: ColumnMenuTab[];
    /**
     * Params used to change the behaviour and appearance of the Column Chooser/Columns Menu tab.
     * @agModule `ColumnMenuModule`
     */
    columnChooserParams?: ColumnChooserParams;

    /**
     * Set to `true` if no menu button should be shown for this column header.
     * @default false
     */
    suppressHeaderMenuButton?: boolean;
    /**
     * Set to `true` to not display the filter button in the column header.
     * Doesn't apply when `columnMenu = 'legacy'`.
     * @default false
     */
    suppressHeaderFilterButton?: boolean;
    /**
     * Customise the list of menu items available in the column menu.
     * @agModule `ColumnMenuModule`
     */
    mainMenuItems?: (DefaultMenuItem | MenuItemDef<TData>)[] | GetMainMenuItems<TData>;
    /**
     * Customise the list of menu items available in the context menu.
     * @agModule `ContextMenuModule`
     */
    contextMenuItems?: (DefaultMenuItem | MenuItemDef<TData>)[] | GetContextMenuItems<TData>;
    /**
     * @deprecated v32.2 Use the new selection API instead. See `GridOptions.rowSelection`
     *
     * If `true` or the callback returns `true`, a 'select all' checkbox will be put into the header.
     */
    headerCheckboxSelection?: boolean | HeaderCheckboxSelectionCallback<TData, TValue>;
    /**
     * @deprecated v32.2 Use the new selection API instead. See `GridOptions.rowSelection`
     *
     * If `true`, the header checkbox selection will only select filtered items.
     * @default false
     */
    headerCheckboxSelectionFilteredOnly?: boolean;
    /**
     * @deprecated v32.2 Use the new selection API instead. See `GridOptions.rowSelection`
     *
     * If `true`, the header checkbox selection will only select nodes on the current page.
     * @default false
     */
    headerCheckboxSelectionCurrentPageOnly?: boolean;

    // *** Columns: Integrated Charts *** //

    /** Defines the chart data type that should be used for a column.
     * @agModule `IntegratedChartsModule`
     */
    chartDataType?: 'category' | 'series' | 'time' | 'excluded';

    // *** Columns: Pinned *** //

    /** Pin a column to one side: `right` or `left`. A value of `true` is converted to `'left'`. */
    pinned?: boolean | 'left' | 'right' | null;
    /**
     * Same as `pinned`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     */
    initialPinned?: boolean | 'left' | 'right';
    /**
     * Set to true to block the user pinning the column, the column can only be pinned via definitions or API.
     * @default false
     */
    lockPinned?: boolean;

    // *** Columns: Pivoting *** //

    /**
     * Set to true to pivot by this column.
     * @agModule `PivotModule`
     */
    pivot?: boolean | null;
    /**
     * Same as `pivot`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     * @agModule `PivotModule`
     */
    initialPivot?: boolean;
    /**
     * Set this in columns you want to pivot by.
     * If only pivoting by one column, set this to any number (e.g. `0`).
     * If pivoting by multiple columns, set this to where you want this column to be in the order of pivots (e.g. `0` for first, `1` for second, and so on).
     * @agModule `PivotModule`
     */
    pivotIndex?: number | null;
    /**
     * Same as `pivotIndex`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     * @agModule `PivotModule`
     */
    initialPivotIndex?: number;
    /**
     * Only for CSRM, see [SSRM Pivoting](https://www.ag-grid.com/javascript-data-grid/server-side-model-pivoting/).
     *
     * Comparator to use when ordering the pivot columns, when this column is used to pivot on.
     * The values will always be strings, as the pivot service uses strings as keys for the pivot groups.
     * @initial
     * @agModule `PivotModule`
     */
    pivotComparator?: PivotComparatorFunc;
    /**
     * Sort direction applied to this column's pivot result columns when this column is used to pivot on.
     * Independent of `sort` - pivot sorting does not flow to or from the column's own sort.
     * @agModule `PivotModule`
     */
    pivotSort?: SortDirection;
    /**
     * Same as `pivotSort`, except only applied when the column is created. Not used for subsequent updates.
     * @initial
     * @agModule `PivotModule`
     */
    initialPivotSort?: SortDirection;
    /**
     * Set to `true` if you want to be able to pivot by this column via the GUI. This will not block the API or properties being used to achieve pivot.
     * @default false
     * @agModule `PivotModule`
     */
    enablePivot?: boolean;

    // *** Columns: Rendering and Styling *** //

    /**
     * An object of CSS values / or function returning an object of CSS values for a particular cell.
     * @agModule `CellStyleModule`
     */
    cellStyle?: CellStyle | CellStyleFunc<TData, TValue>;
    /**
     * Class to use for the cell. Can be string, array of strings, or function that returns a string or array of strings.
     * @agModule `CellStyleModule`
     */
    cellClass?: string | string[] | CellClassFunc<TData, TValue>;
    /**
     * Rules which can be applied to include certain CSS classes.
     * @agModule `CellStyleModule`
     */
    cellClassRules?: CellClassRules<TData, TValue>;

    /**
     * Provide your own cell Renderer component for this column's cells.
     * See [Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-cell-renderer/) for framework specific implementation details.
     */
    cellRenderer?: any;
    /** Params to be passed to the `cellRenderer` component. */
    cellRendererParams?: any;
    /** Callback to select which cell renderer to be used for a given row within the same column. */
    cellRendererSelector?: CellRendererSelectorFunc<TData, TValue>;
    /**
     * The renderer to be used while either
     *  - using Server Side Row Model and the row is in an unloaded state and if `suppressServerSideFullWidthLoadingRow` or `groupHideOpenParents` is enabled.
     *  - a cell renderer is marked for deferred loading with `cellRendererParams.deferRender:true`.
     */
    loadingCellRenderer?: any;
    /** Params to be passed to the `loadingCellRenderer` component. */
    loadingCellRendererParams?: any;
    /** Callback to select which loading renderer to be used. */
    loadingCellRendererSelector?: ILoadingCellRendererSelectorFunc<TData, TValue>;

    /**
     * Set to `true` to have the grid calculate the height of a row based on contents of this column.
     * @default false
     * @agModule `RowAutoHeightModule`
     */
    autoHeight?: boolean;
    /**
     * Set to `true` to have the text wrap inside the cell - typically used with `autoHeight`.
     * @default false
     */
    wrapText?: boolean;
    /**
     * Set to `true` to flash a cell when it's refreshed.
     * @default false
     * @agModule `HighlightChangesModule`
     */
    enableCellChangeFlash?: boolean;

    // *** Columns: Row Dragging *** //

    /**
     * `boolean` or `Function`. Set to `true` (or return `true` from function) to allow row dragging.
     * @default false
     * @agModule `RowDragModule`
     */
    rowDrag?: boolean | RowDragCallback<TData, TValue>;

    /**
     * A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
     * If this callback is not set, the `rowDragText` callback in the `gridOptions` will be used and
     * if there is no callback in the `gridOptions` the current cell value will be used.
     * @agModule `RowDragModule`
     */
    rowDragText?: RowDragTextFunc;

    /**
     * `boolean` or `Function`. Set to `true` (or return `true` from function) to allow dragging for native drag and drop.
     * @default false
     * @agModule `DragAndDropModule`
     */
    dndSource?: boolean | DndSourceCallback<TData, TValue>;
    /**
     * Function to allow custom drag functionality for native drag and drop.
     * @agModule `DragAndDropModule`
     */
    dndSourceOnRowDrag?: DndSourceOnRowDragFunc<TData>;

    // *** Columns: Row Grouping *** //

    /**
     * Set to `true` to row group by this column.
     * @default false
     * @agModule `RowGroupingModule`
     */
    rowGroup?: boolean | null;
    /**
     * Same as `rowGroup`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     * @agModule `RowGroupingModule`
     */
    initialRowGroup?: boolean;
    /**
     * Set this in columns you want to group by.
     * If only grouping by one column, set this to any number (e.g. `0`).
     * If grouping by multiple columns, set this to where you want this column to be in the group (e.g. `0` for first, `1` for second, and so on).
     * @agModule `RowGroupingModule`
     */
    rowGroupIndex?: number | null;
    /**
     * Same as `rowGroupIndex`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     * @agModule `RowGroupingModule`
     */
    initialRowGroupIndex?: number;
    /**
     * Set to `true` if you want to be able to row group by this column via the GUI.
     * This will not block the API or properties being used to achieve row grouping.
     * @default false
     * @agModule `RowGroupingModule`
     */
    enableRowGroup?: boolean;
    /**
     * Set to `true` if you want to be able to aggregate by this column via the GUI.
     * This will not block the API or properties being used to achieve aggregation.
     * @default false
     * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
     */
    enableValue?: boolean;
    /**
     * Name of function to use for aggregation. In-built options are: `sum`, `min`, `max`, `count`, `avg`, `first`, `last`. Also accepts a custom aggregation name or an aggregation function.
     * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
     */
    aggFunc?: string | IAggFunc<TData, TValue> | null;
    /**
     * Same as `aggFunc`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
     */
    initialAggFunc?: string | IAggFunc<TData, TValue>;
    /**
     * The position of this column in the order of value columns when aggregating in pivot mode.
     * When aggregating by a single column, any number can be used. When aggregating by multiple
     * columns, this determines the order (e.g. `0` for first, `1` for second).
     * @agModule `RowGroupingModule` / `PivotModule`
     */
    valueIndex?: number;
    /**
     * Same as `valueIndex`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     * @agModule `RowGroupingModule` / `PivotModule`
     */
    initialValueIndex?: number;
    /**
     * The name of the aggregation function to use for this column when it is enabled via the GUI.
     * Note that this does not immediately apply the aggregation function like `aggFunc`
     * @default 'sum'
     * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
     */
    defaultAggFunc?: string;
    /**
     * Aggregation functions allowed on this column e.g. `['sum', 'avg']`.
     * If missing, all installed functions are allowed.
     * This will only restrict what the GUI allows a user to select, it does not impact when you set a function via the API.
     * @agModule `RowGroupingModule` / `PivotModule` / `TreeDataModule` / `ServerSideRowModelModule`
     */
    allowedAggFuncs?: string[];
    /**
     * The active "Show Values As" mode for this column.
     * <br /><br />
     * Shows the column's aggregated value relative to another total, for example as a percentage of the grand total,
     * column total, row total or parent total. This changes only the displayed value; the underlying value used by
     * `getDataValue` and charts is unchanged.
     * <br /><br />
     * Use a built-in mode name, or the object form `{ type, params, precision }`. Set `null` for no active mode.
     * @agModule `ShowValuesAsModule`
     */
    showValuesAs?: ShowValuesAsType | ShowValuesAs | null;
    /**
     * Same as `showValuesAs`, except only applied when creating a new column.
     * @initial
     * @agModule `ShowValuesAsModule`
     */
    initialShowValuesAs?: ShowValuesAsType | ShowValuesAs;
    /**
     * Per-column "Show Values As" configuration: `precision`, `suppressHeaderIndicator`, and user-provided
     * `modes` (custom modes / overrides of the built-ins). Deep-merges from `defaultColDef`. The active mode is
     * the `showValuesAs` selector. `null` disables the feature for the column (useful to opt a column out via
     * `defaultColDef`).
     * @agModule `ShowValuesAsModule`
     */
    showValuesAsDef?: ShowValuesAsDef<TData, TValue> | null;
    /**
     * Shows the "Show Values As" submenu in the column menu.
     * <br /><br />
     * On `defaultColDef`, `true` shows the submenu only for value columns and numeric columns. On an individual
     * column, `true` always shows it; use this when the grid cannot infer that the column returns numbers, for
     * example with a `valueGetter` or custom `aggFunc`. `false` hides the submenu.
     * <br /><br />
     * This controls menu visibility only. Modes set through `showValuesAs` or Column State still apply.
     * @default false
     * @agModule `ShowValuesAsModule`
     */
    enableShowValuesAs?: boolean;
    /**
     * Specify a grouping hierarchy for this column. This generates one or more virtual columns to group or pivot by when this column is grouped or pivoted.
     *
     * This can be used to group/pivot by values derived from a source column. The grid provides hierarchy types related to date components.
     * Users can provide their own hierarchy types by specifying a `ColDef`, or referring to the name of a hierarchy type defined in `groupHierarchyConfig`.
     * @agModule `RowGroupingModule` / `PivotModule`
     *
     * @deprecated
     */
    rowGroupingHierarchy?: (GroupHierarchyParts | string | ColDef<TData, TValue>)[];
    /**
     * Specify a grouping hierarchy for this column. This generates one or more virtual columns to group or pivot by when this column is grouped or pivoted.
     *
     * This can be used to group/pivot by values derived from a source column. The grid provides hierarchy types related to date components.
     * Users can provide their own hierarchy types by specifying a `ColDef`, or referring to the name of a hierarchy type defined in `groupHierarchyConfig`.
     * @agModule `RowGroupingModule` / `PivotModule`
     */
    groupHierarchy?: (GroupHierarchyParts | string | ColDef<TData, TValue>)[];

    /**
     * Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group.
     * @initial
     * @agModule `RowGroupingModule`
     */
    showRowGroup?: string | boolean;

    // *** Columns: Sort *** //

    /**
     * Set to `false` to disable sorting which is enabled by default.
     * @default true
     */
    sortable?: boolean;

    /** Set the default sort. */
    sort?: SortDirection | SortDef;

    /**
     * Same as `sort`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     */
    initialSort?: SortDirection | SortDef;

    /** If sorting more than one column by default, specifies order in which the sorting should be applied. */
    sortIndex?: number | null;
    /**
     * Same as `sortIndex`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     */
    initialSortIndex?: number;
    /**
     * An array defining the order in which sorting occurs (if sorting is enabled).
     * <br /><br />
     * Defaults:
     *
     * - `['asc', 'desc', null]` if no sort type is specified,
     * - `[{ type: 'absolute', direction: 'asc', }, { type: 'absolute', direction: 'desc' }, null]` if 'sort' or 'initialSort' have type 'absolute'
     */
    sortingOrder?: (SortDirection | SortDef)[];
    /**
     * Override the default sorting order by providing a custom sort comparator, or a map of comparators for different `SortType`s.
     *
     * - `valueA`, `valueB` are the values to compare.
     * - `nodeA`,  `nodeB` are the corresponding RowNodes. Useful if additional details are required by the sort.
     * - `isDescending` - `true` if sort direction is `desc`. Not to be used for inverting the return value as the grid already applies `asc` or `desc` ordering.
     *
     * Returns:
     *  - `0`  valueA is the same as valueB
     *  - `> 0` Sort valueA after valueB
     *  - `< 0` Sort valueA before valueB
     */
    comparator?: SortComparatorFn<TData, TValue> | Partial<Record<SortType, SortComparatorFn<TData, TValue>>>;
    /**
     * Set to `true` if you want the unsorted icon to be shown when no sort is applied to this column.
     * @default false
     */
    unSortIcon?: boolean;

    // *** Columns: Spanning *** //

    /** By default, each cell will take up the width of one column. You can change this behaviour to allow cells to span multiple columns. */
    colSpan?: ColSpanFunc<TData, TValue>;
    /**
     * By default, each cell will take up the height of one row. You can change this behaviour to allow cells to span multiple rows.
     */
    rowSpan?: RowSpanFunc<TData, TValue>;

    /**
     * Set to `true` to automatically merge cells in this column with equal values. Provide a callback to specify custom merging logic.
     * @agModule `CellSpanModule`
     */
    spanRows?: boolean | SpanRowsFunc<TData, TValue>;

    // *** Columns: Widths *** //

    /**
     * Initial width in pixels for the cell.
     * If no width or flex properties set, cell width will default to 200 pixels.
     */
    width?: number;
    /**
     * Same as `width`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     */
    initialWidth?: number;
    /** Minimum width in pixels for the cell. */
    minWidth?: number;
    /** Maximum width in pixels for the cell. */
    maxWidth?: number;
    /**
     * Equivalent to `flex-grow` in CSS. When `flex` is set on one or more
     * columns, any `width` value is ignored and instead the remaining free
     * space in the grid is divided among flex columns in proportion to their
     * flex value, so a column with `flex: 2` will be twice the size as one with
     * `flex: 1`.
     */
    flex?: number | null;
    /**
     * Same as `flex`, except only applied when creating a new column. Not applied when updating column definitions.
     * @initial
     */
    initialFlex?: number;
    /**
     * Set to `false` to disable resizing which is enabled by default.
     * @default true
     */
    resizable?: boolean;
    /**
     * Set to `true` if you want this column's width to be fixed during 'size to fit' operations.
     * @default false
     */
    suppressSizeToFit?: boolean;
    /**
     * Set to `true` if you do not want this column to be auto-resizable during 'size to contents' operations.
     * @default false
     */
    suppressAutoSize?: boolean;

    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotValueColumn?: Column | null;
    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotTotalColumnIds?: string[];

    /**
     * Set to `true` if you don't want the column header for this column to span the whole height of the header container.
     * @default false
     */
    suppressSpanHeaderHeight?: boolean;
}

export type ColTypeDefs<TData = any, TValue = any> = { [key: string]: ColTypeDef<TData, TValue> };

/** Configuration options for reusable columns types in AG Grid. This includes all possible options from `ColDef` except the `type` and `cellDataType` fields. */
export type ColTypeDef<TData = any, TValue = any> = Omit<ColDef<TData, TValue>, 'type' | 'cellDataType'>;

export interface CheckboxSelectionCallbackParams<
    TData = any,
    TValue = any,
    TContext = any,
> extends ColumnFunctionCallbackParams<TData, TValue, TContext> {}
export type CheckboxSelectionCallback<TData = any, TValue = any, TContext = any> = (
    params: CheckboxSelectionCallbackParams<TData, TValue, TContext>
) => boolean;
export interface RowDragCallbackParams<TData = any, TValue = any, TContext = any> extends ColumnFunctionCallbackParams<
    TData,
    TValue,
    TContext
> {}
export type RowDragCallback<TData = any, TValue = any, TContext = any> = (
    params: RowDragCallbackParams<TData, TValue, TContext>
) => boolean;
export interface DndSourceCallbackParams<
    TData = any,
    TValue = any,
    TContext = any,
> extends ColumnFunctionCallbackParams<TData, TValue, TContext> {}

export type DndSourceOnRowDragFunc<TData = any, TContext = any> = (
    params: DndSourceOnRowDragParams<TData, TContext>
) => void;
export interface DndSourceOnRowDragParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** Row node for the given row */
    rowNode: IRowNode<TData>;
    /** The DOM event that represents a drag and drop interaction */
    dragEvent: DragEvent;
}
export type DndSourceCallback<TData = any, TValue = any, TContext = any> = (
    params: DndSourceCallbackParams<TData, TValue, TContext>
) => boolean;
export interface EditableCallbackParams<TData = any, TValue = any, TContext = any> extends ColumnFunctionCallbackParams<
    TData,
    TValue,
    TContext
> {}
export type EditableCallback<TData = any, TValue = any, TContext = any> = (
    params: EditableCallbackParams<TData, TValue, TContext>
) => boolean;
export type {
    GroupRowEditableCallback,
    GroupRowEditableCallbackParams,
    GroupRowValueSetterDistribution,
    GroupRowValueSetterDistributionEntry,
    DistributionGetValueParams,
    DistributionSetValueParams,
    GroupRowValueSetterDistributionOptions,
    GroupRowValueSetterDistributionRecord,
    GroupRowValueSetterFunc,
    GroupRowValueSetterOptions,
    GroupRowValueSetterParams,
} from './colDef-groupRowValueSetter';

export interface SuppressPasteCallbackParams<
    TData = any,
    TValue = any,
    TContext = any,
> extends ColumnFunctionCallbackParams<TData, TValue, TContext> {}
export type SuppressPasteCallback<TData = any, TValue = any, TContext = any> = (
    params: SuppressPasteCallbackParams<TData, TValue, TContext>
) => boolean;
export interface SuppressNavigableCallbackParams<
    TData = any,
    TValue = any,
    TContext = any,
> extends ColumnFunctionCallbackParams<TData, TValue, TContext> {}
export type SuppressNavigableCallback<TData = any, TValue = any, TContext = any> = (
    params: SuppressNavigableCallbackParams<TData, TValue, TContext>
) => boolean;
export interface SuppressNoteActionsCallbackParams<
    TData = any,
    TValue = any,
    TContext = any,
> extends ColumnFunctionCallbackParams<TData, TValue, TContext> {}
export type SuppressNoteActionsCallback<TData = any, TValue = any, TContext = any> = (
    params: SuppressNoteActionsCallbackParams<TData, TValue, TContext>
) => boolean;
export interface HeaderCheckboxSelectionCallbackParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<
    TData,
    TContext
> {
    column: Column<TValue>;
    colDef: ColDef<TData, TValue>;
}
export type HeaderCheckboxSelectionCallback<TData = any, TValue = any, TContext = any> = (
    params: HeaderCheckboxSelectionCallbackParams<TData, TValue, TContext>
) => boolean;

interface GetTextParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** Value for the cell. */
    value: TValue | null | undefined;
    /** Row node for the given row */
    node: IRowNode<TData>;
    /** Row data associated with the node. */
    data: TData;
}

export type GetQuickFilterText<TData = any, TValue = any, TContext = any> = (
    params: GetQuickFilterTextParams<TData, TValue, TContext>
) => string;
export interface GetQuickFilterTextParams<TData = any, TValue = any, TContext = any> extends GetTextParams<
    TData,
    TValue,
    TContext
> {
    /** Column for this callback. */
    column: Column<TValue>;
    /** ColDef provided for this column. */
    colDef: ColDef<TData, TValue>;
}

export interface GetFindTextParams<TData = any, TValue = any, TContext = any> extends GetTextParams<
    TData,
    TValue,
    TContext
> {
    /** Column for this callback. `null` for `groupRows`. */
    column: Column<TValue> | null;
    /** ColDef provided for this column. `null` for `groupRows`. */
    colDef: ColDef<TData, TValue> | null;
    /** Get formatted value for the cell (or `null` if no `valueFormatter`) */
    getValueFormatted: () => string | null;
}

export type GetFindTextFunc<TData = any, TValue = any, TContext = any> = (
    params: GetFindTextParams<TData, TValue, TContext>
) => string | null;

export type ColumnMenuTab = 'filterMenuTab' | 'generalMenuTab' | 'columnsMenuTab';

export interface ColumnChooserParams {
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

export type SpanRowsFunc<TData = any, TValue = any, TContext = any> = (
    params: SpanRowsParams<TData, TValue, TContext>
) => boolean;
export interface SpanRowsParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** First row of the span, which if spanned represents the spanned cells */
    nodeA: IRowNode<TData> | null;
    /** First rows value */
    valueA: TValue | null | undefined;
    /** Next row of the span to test */
    nodeB: IRowNode<TData> | null;
    /** Next rows value */
    valueB: TValue | null | undefined;
    /** Column for this callback */
    column: Column<TValue>;
    /** ColDef provided for this column */
    colDef: ColDef<TData, TValue>;
}

export interface ValueGetterParams<TData = any, TValue = any, TContext = any> extends BaseColDefOptionalDataParams<
    TData,
    TValue,
    TContext
> {
    /** A utility method for getting other column values via their `ColKey` */
    getValue: (colKey: ColKey<TData>) => any;
}
export type ValueGetterFunc<TData = any, TValue = any, TContext = any> = (
    params: ValueGetterParams<TData, TValue, TContext>
) => TValue | null | undefined;
export type HeaderLocation =
    | 'chart'
    | 'columnDrop'
    | 'columnToolPanel'
    | 'csv'
    | 'filterToolPanel'
    | 'groupFilter'
    | 'header'
    | 'model'
    | 'advancedFilter'
    | null;
export interface HeaderValueGetterParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<
    TData,
    TContext
> {
    colDef: AbstractColDef<TData, TValue>;
    /** Column for this callback if applicable*/
    column?: Column<TValue> | null;
    /** ColumnGroup for this callback if applicable */
    columnGroup?: ColumnGroup | ProvidedColumnGroup | null;
    /** Original column group if applicable */
    providedColumnGroup: ProvidedColumnGroup | null;
    /** Where the column is going to appear */
    location: HeaderLocation;
}
export type HeaderValueGetterFunc<TData = any, TValue = any, TContext = any> = (
    params: HeaderValueGetterParams<TData, TValue, TContext>
) => string;
export type HeaderTooltipValueGetterFunc<TData = any, TValue = any, TContext = any> = (
    params: ITooltipParams<TData, TValue, TContext>
) => string | any;

export type TooltipValueGetterFunc<TData = any, TValue = any, TContext = any> = (
    params: ITooltipParams<TData, TValue, TContext>
) => string | any;

export interface NewValueParams<TData = any, TValue = any, TContext = any> extends ChangedValueParams<
    TData,
    TValue | null | undefined,
    TValue | null | undefined,
    TContext
> {
    /** The raw value from the edit, before any value getter is applied. */
    newRawValue: TValue | null | undefined;
    /** The source of the value change, e.g. `'edit'`, `'paste'`, `'undo'`, `'redo'`, `'data'`. */
    source: string | undefined;
}

export interface ValueSetterParams<TData = any, TValue = any, TContext = any> extends ChangedValueParams<
    TData,
    TValue | null | undefined,
    TValue | null | undefined,
    TContext
> {}
export type ValueSetterFunc<TData = any, TValue = any, TContext = any> = (
    params: ValueSetterParams<TData, TValue, TContext>
) => boolean;
export interface ValueParserParams<TData = any, TValue = any, TContext = any> extends ChangedValueParams<
    TData,
    TValue | null | undefined,
    string,
    TContext
> {}
export type ValueParserFunc<TData = any, TValue = any, TContext = any> = (
    params: ValueParserParams<TData, TValue, TContext>
) => TValue | null | undefined;

export interface ValueFormatterParams<TData = any, TValue = any, TContext = any> extends BaseColDefOptionalDataParams<
    TData,
    TValue,
    TContext
> {
    /** Value for the cell. */
    value: TValue | null | undefined;
}

export type ValueFormatterFunc<TData = any, TValue = any, TContext = any> = (
    params: ValueFormatterParams<TData, TValue, TContext>
) => string;

export type EqualsFunc<TValue = any> = (
    valueA: TValue | null | undefined,
    valueB: TValue | null | undefined
) => boolean;

export type KeyCreatorFunc<TData = any, TValue = any, TContext = any> = (
    params: KeyCreatorParams<TData, TValue, TContext>
) => string;
export interface KeyCreatorParams<TData = any, TValue = any, TContext = any> extends BaseColDefParams<
    TData,
    TValue,
    TContext
> {
    /** Value for the cell. */
    value: TValue | null | undefined;
}

export type ColSpanFunc<TData = any, TValue = any, TContext = any> = (
    params: ColSpanParams<TData, TValue, TContext>
) => number;
export interface ColSpanParams<TData = any, TValue = any, TContext = any> extends BaseColDefOptionalDataParams<
    TData,
    TValue,
    TContext
> {}

export type RowSpanFunc<TData = any, TValue = any, TContext = any> = (
    params: RowSpanParams<TData, TValue, TContext>
) => number;
export interface RowSpanParams<TData = any, TValue = any, TContext = any> extends BaseColDefOptionalDataParams<
    TData,
    TValue,
    TContext
> {}

export interface SuppressKeyboardEventParams<
    TData = any,
    TValue = any,
    TContext = any,
> extends ColumnFunctionCallbackParams<TData, TValue, TContext> {
    /** The keyboard event the grid received */
    event: KeyboardEvent;
    /** Whether the cell is editing or not */
    editing: boolean;
}

export type SuppressKeyboardEventFunc<TData = any, TValue = any, TContext = any> = (
    params: SuppressKeyboardEventParams<TData, TValue, TContext>
) => boolean;

export type SuppressHeaderKeyboardEventFunc<TData = any, TValue = any, TContext = any> = (
    params: SuppressHeaderKeyboardEventParams<TData, TValue, TContext>
) => boolean;
export interface SuppressHeaderKeyboardEventParams<TData = any, TValue = any, TContext = any> extends AgGridCommon<
    TData,
    TContext
> {
    column: Column<TValue> | ColumnGroup;
    colDef: ColDef<TData, TValue> | ColGroupDef<TData> | null;
    /** The index of the header row of the current focused header */
    headerRowIndex: number;
    /** The keyboard event the grid received */
    event: KeyboardEvent;
}

export interface CellClassParams<TData = any, TValue = any, TContext = any> extends RowClassParams<TData, TContext> {
    /** Column for this callback */
    column: Column<TValue>;
    /** The colDef associated with the column for this cell */
    colDef: ColDef<TData, TValue>;
    /** The value to be rendered */
    value: TValue | null | undefined;
}
export type CellClassFunc<TData = any, TValue = any, TContext = any> = (
    cellClassParams: CellClassParams<TData, TValue, TContext>
) => string | string[] | null | undefined;
export type CellStyleFunc<TData = any, TValue = any, TContext = any> = (
    cellClassParams: CellClassParams<TData, TValue, TContext>
) => CellStyle | null | undefined;

export interface CellStyle {
    [cssProperty: string]: string | number;
}
export interface CellClassRules<TData = any, TValue = any, TContext = any> {
    [cssClassName: string]: ((params: CellClassParams<TData, TValue, TContext>) => boolean) | string;
}

export type CellRendererSelectorFunc<TData = any, TValue = any, TContext = any> = (
    params: ICellRendererParams<TData, TValue, TContext>
) => CellRendererSelectorResult | undefined;

export type ILoadingCellRendererSelectorFunc<TData = any, TValue = any, TContext = any> = (
    params: ILoadingCellRendererParams<TData, TValue, TContext>
) => CellRendererSelectorResult | undefined;

export interface CellRendererDeferParams {
    /** Defer the rendering of the cell component  */
    deferRender?: boolean;
}

export type CellEditorSelectorFunc<TData = any, TValue = any, TContext = any> = (
    params: ICellEditorParams<TData, TValue, TContext>
) => CellEditorSelectorResult | undefined;
export interface CellRendererSelectorResult {
    /** Equivalent of setting `colDef.cellRenderer` */
    component?: any;
    /** Equivalent of setting `colDef.cellRendererParams` */
    params?: any;
}

export interface CellEditorSelectorResult {
    /** Equivalent of setting `colDef.cellEditor` */
    component?: any;
    /** Equivalent of setting `colDef.cellEditorParams` */
    params?: any;
    /** Equivalent of setting `colDef.cellEditorPopup` */
    popup?: boolean;
    /** Equivalent of setting `colDef.cellEditorPopupPosition` */
    popupPosition?: 'over' | 'under';
}

export type GroupHierarchyParts =
    | 'year'
    | 'quarter'
    | 'month'
    | 'formattedMonth'
    | 'day'
    | 'hour'
    | 'minute'
    | 'second';

export type GroupHierarchyConfig = { [k: string]: ColDef };

export type RefData = { [p: string]: any };
