// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "./rowNode";
import { ICellEditorComp, ICellEditorParams } from "../interfaces/iCellEditor";
import { ICellRendererComp, ICellRendererFunc, ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { Column } from "./column";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columns/columnApi";
import { IHeaderGroupComp } from "../headerRendering/headerGroup/headerGroupComp";
import { CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent } from "../events";
import { ITooltipComp, ITooltipParams } from "../rendering/tooltipComponent";
import { IRowDragItem } from "../rendering/row/rowDragComp";
import { IFilterDef } from '../interfaces/iFilter';
import { ColumnGroup } from "./columnGroup";
import { RowClassParams } from "./gridOptions";
import { OriginalColumnGroup } from "./originalColumnGroup";
/***********************************************************************
 * Don't forget to update ColDefUtil if changing this class. PLEASE! *
 ***********************************************************************/
/** AbstractColDef can be a group or a column definition */
export interface AbstractColDef {
    /** The name to render in the column header */
    headerName?: string;
    /** Whether to show the column when the group is open / closed. */
    columnGroupShow?: string;
    /** CSS class for the header */
    headerClass?: HeaderClass;
    /** CSS class for the toolPanel */
    toolPanelClass?: ToolPanelClass;
    /** Expression or function to get the cells value. */
    headerValueGetter?: string | Function;
    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotKeys?: string[];
    /** Set to true to not include this column in the Columns Tool Panel */
    suppressColumnsToolPanel?: boolean;
    /** Set to true to not include this column / filter in the Filters Tool Panel */
    suppressFiltersToolPanel?: boolean;
    /** Tooltip for the column header */
    headerTooltip?: string;
    tooltipComponent?: {
        new (): ITooltipComp;
    } | string;
    tooltipComponentFramework?: any;
    tooltipComponentParams?: any;
    /** Allows the user to suppress certain keyboard events in the grid header */
    suppressHeaderKeyboardEvent?: (params: SuppressHeaderKeyboardEventParams) => boolean;
}
export interface ColGroupDef extends AbstractColDef {
    /** Columns in this group */
    children: (ColDef | ColGroupDef)[];
    /** Group ID */
    groupId?: string;
    /** Open by Default */
    openByDefault?: boolean;
    /** If true, group cannot be broken up by column moving, child columns will always appear side by side, however you can rearrange child columns within the group */
    marryChildren?: boolean;
    /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used**/
    headerGroupComponent?: string | {
        new (): IHeaderGroupComp;
    };
    /** The custom header group component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used**/
    headerGroupComponentFramework?: any;
    /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used**/
    headerGroupComponentParams?: any;
}
export interface IAggFunc {
    (params: IAggFuncParams): any;
}
export interface IAggFuncParams {
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
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface HeaderClassParams {
    api: GridApi;
    colDef: AbstractColDef;
    column?: Column | null;
    columnGroup?: ColumnGroup | OriginalColumnGroup | null;
    context?: any;
}
export declare type HeaderClass = string | string[] | ((params: HeaderClassParams) => string | string[]);
export interface ToolPanelClassParams extends HeaderClassParams {
}
export declare type ToolPanelClass = string | string[] | ((params: ToolPanelClassParams) => string | string[]);
/***********************************************************************
 * Don't forget to update ColDefUtil if changing this class. PLEASE! *
 ***********************************************************************/
export interface ColDef extends AbstractColDef, IFilterDef {
    /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
     *  If both field and colId are missing, a unique ID will be generated.
     *  This ID is used to identify the column in the API for sorting, filtering etc. */
    colId?: string;
    /** If sorting by default, set it here. Set to 'asc' or 'desc' */
    sort?: string | null;
    initialSort?: string;
    /** If sorting more than one column by default, specifies order in which the sorting should be applied. */
    sortIndex?: number | null;
    initialSortIndex?: number;
    /** @deprecated since v24 - use sortIndex instead*/
    sortedAt?: number;
    /** The sort order, provide an array with any of the following in any order ['asc','desc',null] */
    sortingOrder?: (string | null)[];
    /** The field of the row to get the cells data from */
    field?: string;
    /**
     * A comma separated string or array of strings containing ColumnType keys which can be used as a template for a column.
     * This helps to reduce duplication of properties when you have a lot of common column properties.
     */
    type?: string | string[];
    /** Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field 'visible' and mark it false to hide,
     *  however we want all default values to be false and we want columns to be visible by default. */
    hide?: boolean;
    initialHide?: boolean;
    /** Whether this column is pinned or not. */
    pinned?: boolean | string | null;
    initialPinned?: boolean | string;
    /** The field where we get the tooltip on the object */
    tooltipField?: string;
    /** The function used to calculate the tooltip of the object, tooltipField takes precedence */
    tooltipValueGetter?: (params: ITooltipParams) => string;
    /** Expression or function to get the cells value. */
    valueGetter?: string | ValueGetterFunc;
    /** Expression or function to get the cells value for filtering. */
    filterValueGetter?: string | ValueGetterFunc;
    /** If not using a field, then this puts the value into the cell */
    valueSetter?: string | ValueSetterFunc;
    /** Function to return the key for a value - use this if the value is an object (not a primitive type) and you
     * want to a) group by this field or b) use set filter on this field. */
    keyCreator?: (value: any) => string;
    /** Actual width, in pixels, of the cell */
    width?: number;
    /** Default width, in pixels, of the cell */
    initialWidth?: number;
    /** Min width, in pixels, of the cell */
    minWidth?: number;
    /** Max width, in pixels, of the cell */
    maxWidth?: number;
    /** Sets the grow factor of a column. It specifies how much of the remaining
     * space should be assigned to the column.
     */
    flex?: number;
    initialFlex?: number;
    /** True if this column should stretch rows height to fit contents */
    autoHeight?: boolean;
    /** True if this column should wrap cell contents - typically used with autoHeight */
    wrapText?: boolean;
    /** Class to use for the cell. Can be string, array of strings, or function. */
    cellClass?: string | string[] | CellClassFunc;
    /** An object of css values. Or a function returning an object of css values. */
    cellStyle?: {
        [cssProperty: string]: string;
    } | CellStyleFunc;
    /** A function for rendering a cell. */
    cellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    cellRendererFramework?: any;
    cellRendererParams?: any;
    cellRendererSelector?: CellRendererSelectorFunc;
    /** Cell editor */
    cellEditor?: string | {
        new (): ICellEditorComp;
    };
    cellEditorFramework?: any;
    cellEditorParams?: any;
    cellEditorSelector?: CellEditorSelectorFunc;
    cellEditorPopup?: boolean;
    cellEditorPopupPosition?: string;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. */
    pinnedRowCellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. */
    pinnedRowCellRendererFramework?: any;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. */
    pinnedRowCellRendererParams?: any;
    /** A function to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering. */
    valueFormatter?: string | ValueFormatterFunc;
    /** @deprecated Use valueFormatter for pinned rows, and check params.node.rowPinned. */
    pinnedRowValueFormatter?: string | ValueFormatterFunc;
    /** Gets called after editing, converts the value in the cell. */
    valueParser?: string | ValueParserFunc;
    /** Name of function to use for aggregation. One of [sum,min,max,first,last] or a function. */
    aggFunc?: string | IAggFunc | null;
    initialAggFunc?: string | IAggFunc;
    /** Agg funcs allowed on this column. If missing, all installed agg funcs are allowed.
     * Can be eg ['sum','avg']. This will restrict what the GUI allows to select only.*/
    allowedAggFuncs?: string[];
    /** To group by this column by default, either provide an index (eg rowGroupIndex=1), or set rowGroup=true. */
    rowGroupIndex?: number | null;
    rowGroup?: boolean;
    initialRowGroupIndex?: number;
    initialRowGroup?: boolean;
    /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group. */
    showRowGroup?: string | boolean;
    /** To pivot by this column by default, either provide an index (eg pivotIndex=1), or set pivot=true. */
    pivotIndex?: number | null;
    pivot?: boolean;
    initialPivotIndex?: number;
    initialPivot?: boolean;
    /** Comparator function for custom sorting. */
    comparator?: (valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number;
    /** Comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed. */
    equals?: (valueA: any, valueB: any) => boolean;
    /** Comparator for ordering the pivot columns */
    pivotComparator?: (valueA: string, valueB: string) => number;
    /** Set to true to render a selection checkbox in the column. */
    checkboxSelection?: boolean | CheckboxSelectionCallback;
    /** If true, a 'select all' checkbox will be put into the header */
    headerCheckboxSelection?: boolean | HeaderCheckboxSelectionCallback;
    /** If true, the header checkbox selection will work on filtered items*/
    headerCheckboxSelectionFilteredOnly?: boolean;
    /** For grid row dragging, set to true to enable row dragging within the grid */
    rowDrag?: boolean | RowDragCallback;
    /** To configure the text to be displayed in the floating div while dragging a row when rowDrag is true */
    rowDragText?: (params: IRowDragItem, dragItemCount: number) => string;
    /** For native drag and drop, set to true to enable drag source */
    dndSource?: boolean | DndSourceCallback;
    /** For native drag and drop, set to true to allow custom onRowDrag processing */
    dndSourceOnRowDrag?: (params: {
        rowNode: RowNode;
        dragEvent: DragEvent;
    }) => void;
    /** Set to true if no menu should be shown for this column header. */
    suppressMenu?: boolean;
    /** The menu tabs to show, and in which order, the valid values for this property are:
     * filterMenuTab, generalMenuTab, columnsMenuTab **/
    menuTabs?: string[];
    /** Set to true if sorting allowed for this column. */
    sortable?: boolean;
    /** Set to true to not allow moving this column via dragging it's header */
    suppressMovable?: boolean;
    /** Set to true to not flash this column for value changes */
    suppressCellFlash?: boolean;
    /** Set to true to make sure this column is always first. Other columns, if movable, cannot move before this column. */
    lockPosition?: boolean;
    /** Set to true to block the user showing / hiding the column, the column can only be shown / hidden via definitions or API */
    lockVisible?: boolean;
    /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API */
    lockPinned?: boolean;
    /** Set to true if you want the unsorted icon to be shown when no sort is applied to this column. */
    unSortIcon?: boolean;
    /** Set to true if you want this columns width to be fixed during 'size to fit' operation. */
    suppressSizeToFit?: boolean;
    /** Set to true if this column should be resizable */
    resizable?: boolean;
    /** Set to true if you do not want this column to be auto-resizable by double clicking it's edge. */
    suppressAutoSize?: boolean;
    /** Allows the user to suppress certain keyboard events in the grid cell */
    suppressKeyboardEvent?: (params: SuppressKeyboardEventParams) => boolean;
    /** If true, GUI will allow adding this columns as a row group */
    enableRowGroup?: boolean;
    /** If true, GUI will allow adding this columns as a pivot */
    enablePivot?: boolean;
    /** If true, GUI will allow adding this columns as a value */
    enableValue?: boolean;
    /** Set to true if this col is editable, otherwise false. Can also be a function to have different rows editable. */
    editable?: boolean | EditableCallback;
    colSpan?: (params: ColSpanParams) => number;
    rowSpan?: (params: RowSpanParams) => number;
    /** Set to true if this col should not be allowed take new values from the clipboard . */
    suppressPaste?: boolean | SuppressPasteCallback;
    /** Set to true if this col should not be navigable with the tab key. Can also be a function to have different rows editable. */
    suppressNavigable?: boolean | SuppressNavigableCallback;
    /** To create the quick filter text for this column, if toString is not good enough on the value. */
    getQuickFilterText?: (params: GetQuickFilterTextParams) => string;
    /** Callbacks for editing. See editing section for further details.
     * Return true if the update was successful, or false if not.
     * If false, then skips the UI refresh and no events are emitted.
     * Return false if the values are the same (ie no update). */
    newValueHandler?: (params: NewValueParams) => boolean;
    /** If true, this cell will be in editing mode after first click. */
    singleClickEdit?: boolean;
    /** Cell template to use for cell. Useful for AngularJS cells. */
    template?: string;
    /** Cell template URL to load template from to use for cell. Useful for AngularJS cells. */
    templateUrl?: string;
    /** Rules for applying css classes */
    cellClassRules?: CellClassRules;
    /** Callbacks for editing.See editing section for further details. */
    onCellValueChanged?: (event: NewValueParams) => void;
    /** Function callback, gets called when a cell is clicked. */
    onCellClicked?: (event: CellClickedEvent) => void;
    /** Function callback, gets called when a cell is double clicked. */
    onCellDoubleClicked?: (event: CellDoubleClickedEvent) => void;
    /** Function callback, gets called when a cell is right clicked. */
    onCellContextMenu?: (event: CellContextMenuEvent) => void;
    /** Icons for this column. Leave blank to use default. */
    icons?: {
        [key: string]: Function | string;
    };
    /** If true, grid will flash cell after cell is refreshed */
    enableCellChangeFlash?: boolean;
    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotValueColumn?: Column | null;
    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotTotalColumnIds?: string[];
    /** The custom header component to be used for rendering the component header. If none specified the default AG Grid is used**/
    headerComponent?: string | {
        new (): any;
    };
    /** The custom header component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used**/
    headerComponentFramework?: any;
    /** The custom header component parameters**/
    headerComponentParams?: any;
    /** Whether to display a floating filter for this column. */
    floatingFilter?: boolean;
    refData?: {
        [key: string]: string;
    };
    /** Defines the column data type used when charting */
    chartDataType?: 'category' | 'series' | 'time' | 'excluded';
    /** Params to customise the columns menu behaviour and appearance */
    columnsMenuParams?: ColumnsMenuParams;
}
export interface ColumnFunctionCallbackParams {
    /** Row node for the given row */
    node: RowNode;
    /** Data associated with the node */
    data: any;
    /** Column for this callback */
    column: Column;
    /** ColDef provided for this column */
    colDef: ColDef;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface CheckboxSelectionCallbackParams extends ColumnFunctionCallbackParams {
}
export interface CheckboxSelectionCallback {
    (params: CheckboxSelectionCallbackParams): boolean;
}
export interface RowDragCallbackParams extends ColumnFunctionCallbackParams {
}
export interface RowDragCallback {
    (params: RowDragCallbackParams): boolean;
}
export interface DndSourceCallbackParams extends ColumnFunctionCallbackParams {
}
export interface DndSourceCallback {
    (params: DndSourceCallbackParams): boolean;
}
export interface EditableCallbackParams extends ColumnFunctionCallbackParams {
}
export interface EditableCallback {
    (params: EditableCallbackParams): boolean;
}
export interface SuppressPasteCallbackParams extends ColumnFunctionCallbackParams {
}
export interface SuppressPasteCallback {
    (params: SuppressPasteCallbackParams): boolean;
}
export interface SuppressNavigableCallbackParams extends ColumnFunctionCallbackParams {
}
export interface SuppressNavigableCallback {
    (params: SuppressNavigableCallbackParams): boolean;
}
export interface HeaderCheckboxSelectionCallbackParams {
    column: Column;
    colDef: ColDef;
    api: GridApi;
    columnApi: ColumnApi;
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
export interface IsColumnFuncParams extends ColumnFunctionCallbackParams {
}
export interface GetQuickFilterTextParams {
    value: any;
    node: RowNode;
    data: any;
    column: Column;
    colDef: ColDef;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface ColumnsMenuParams {
    /** To suppress updating the layout of columns
     * as they are rearranged in the grid */
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
export interface BaseColDefParams {
    /** Row node for the given row */
    node: RowNode | null;
    /** Data associated with the node */
    data: any;
    /** Column for this callback */
    column: Column;
    /** ColDef provided for this column */
    colDef: ColDef;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface BaseWithValueColDefParams extends BaseColDefParams {
    value: any;
}
export interface ValueGetterParams extends BaseColDefParams {
    getValue: (field: string) => any;
}
export interface ValueGetterFunc {
    (params: ValueGetterParams): any;
}
export interface NewValueParams extends BaseColDefParams {
    oldValue: any;
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
export interface SuppressHeaderKeyboardEventParams {
    column: Column | ColumnGroup;
    colDef: ColDef | ColGroupDef | null;
    headerRowIndex: number;
    event: KeyboardEvent;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}
export interface CellClassParams extends RowClassParams {
    /** The colDef associated with the column for this cell */
    colDef: ColDef;
    /** The value to be rendered */
    value: any;
}
export interface CellClassFunc {
    (cellClassParams: CellClassParams): string | string[];
}
export interface CellStyleFunc {
    (cellClassParams: CellClassParams): {};
}
export interface CellClassRules {
    [cssClassName: string]: (((params: CellClassParams) => boolean) | string);
}
export interface SelectorFunc {
    (params: ICellRendererParams | ICellEditorParams): CellRendererSelectorResult | CellEditorSelectorResult;
}
export interface CellRendererSelectorFunc extends SelectorFunc {
    (params: ICellRendererParams): CellRendererSelectorResult;
}
export interface CellEditorSelectorFunc extends SelectorFunc {
    (params: ICellEditorParams): CellEditorSelectorResult;
}
export interface CellRendererSelectorResult {
    component?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    frameworkComponent?: any;
    params?: any;
}
export interface CellEditorSelectorResult {
    component?: {
        new (): ICellEditorComp;
    } | string;
    frameworkComponent?: any;
    params?: any;
}
