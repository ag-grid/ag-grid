// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "./rowNode";
import { ICellEditorComp } from "../rendering/cellEditors/iCellEditor";
import { ICellRendererFunc, ICellRendererComp } from "../rendering/cellRenderers/iCellRenderer";
import { Column } from "./column";
import { IFilterComp } from "../interfaces/iFilter";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnController";
import { IHeaderGroupComp } from "../headerRendering/headerGroup/headerGroupComp";
import { IFloatingFilterComp } from "../filter/floatingFilter";
/** AbstractColDef can be a group or a column definition */
export interface AbstractColDef {
    /** The name to render in the column header */
    headerName?: string;
    /** Whether to show the column when the group is open / closed. */
    columnGroupShow?: string;
    /** CSS class for the header */
    headerClass?: string | string[] | ((params: any) => string | string[]);
    /** CSS class for the header */
    toolPanelClass?: string | string[] | ((params: any) => string | string[]);
    /** Expression or function to get the cells value. */
    headerValueGetter?: string | Function;
    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotKeys?: string[];
    /** Set to true to not include this column in the toolpanel */
    suppressToolPanel?: boolean;
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
    /** The custom header group component to be used for rendering the component header. If none specified the default ag-Grid is used**/
    headerGroupComponent?: {
        new (): IHeaderGroupComp;
    };
    /** The custom header group component to be used for rendering the component header. If none specified the default ag-Grid is used**/
    headerGroupComponentParams?: any;
}
export interface IAggFunc {
    (input: any[]): any;
}
export interface ColDef extends AbstractColDef {
    /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
     *  If both field and colId are missing, a unique ID will be generated.
     *  This ID is used to identify the column in the API for sorting, filtering etc. */
    colId?: string;
    /** If sorting by default, set it here. Set to 'asc' or 'desc' */
    sort?: string;
    /** If sorting more than one column by default, the milliseconds when this column was sorted, so we know what order to sort the columns in. */
    sortedAt?: number;
    /** The sort order, provide an array with any of the following in any order ['asc','desc',null] */
    sortingOrder?: string[];
    /** The field of the row to get the cells data from */
    field?: string;
    /** Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field 'visible' and mark it false to hide,
     *  however we want all default values to be false and we want columns to be visible by default. */
    hide?: boolean;
    /** Whether this column is pinned or not. */
    pinned?: boolean | string;
    /** The field where we get the tooltip on the object */
    tooltipField?: string;
    /** Tooltip for the column header */
    headerTooltip?: string;
    /** Expression or function to get the cells value. */
    valueGetter?: string | Function;
    /** Function to return the key for a value - use this if the value is an object (not a primitive type) and you
     * want to a) group by this field or b) use set filter on this field. */
    keyCreator?: Function;
    /** To provide custom rendering to the header. */
    headerCellRenderer?: Function | Object;
    /** To provide a template for the header. */
    headerCellTemplate?: ((params: any) => string | HTMLElement) | string | HTMLElement;
    /** Initial width, in pixels, of the cell */
    width?: number;
    /** Min width, in pixels, of the cell */
    minWidth?: number;
    /** Max width, in pixels, of the cell */
    maxWidth?: number;
    /** Class to use for the cell. Can be string, array of strings, or function. */
    cellClass?: string | string[] | ((cellClassParams: any) => string | string[]);
    /** An object of css values. Or a function returning an object of css values. */
    cellStyle?: {} | ((params: any) => {});
    /** A function for rendering a cell. */
    cellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    cellRendererFramework?: any;
    cellRendererParams?: any;
    /** Cell editor */
    cellEditor?: {
        new (): ICellEditorComp;
    } | string;
    cellEditorFramework?: any;
    cellEditorParams?: any;
    /** A function for rendering a floating cell. */
    floatingCellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    floatingCellRendererFramework?: any;
    floatingCellRendererParams?: any;
    /** A function to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering. */
    cellFormatter?: (params: any) => string;
    /** A function to format a floating value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering. */
    floatingCellFormatter?: (params: any) => string;
    /** Name of function to use for aggregation. One of [sum,min,max,first,last] or a function. */
    aggFunc?: string | IAggFunc;
    /** To group by this column by default, provide an index here. */
    rowGroupIndex?: number;
    /** To pivot by this column by default, provide an index here. */
    pivotIndex?: number;
    /** Comparator function for custom sorting. */
    comparator?: (valueA: any, valueB: any, nodeA?: RowNode, nodeB?: RowNode, isInverted?: boolean) => number;
    /** Comparator for ordering the pivot columns */
    pivotComparator?: (valueA: string, valueB: string) => number;
    /** Set to true to render a selection checkbox in the column. */
    checkboxSelection?: boolean | ((params: any) => boolean);
    /** If true, a 'select all' checkbox will be put into the header */
    headerCheckboxSelection?: boolean | ((params: any) => boolean);
    /** If true, the header checkbox selection will work on filtered items*/
    headerCheckboxSelectionFilteredOnly?: boolean;
    /** Set to true if no menu should be shown for this column header. */
    suppressMenu?: boolean;
    /** Set to true if no sorting should be done for this column. */
    suppressSorting?: boolean;
    /** Set to true to not allow moving this column via dragging it's header */
    suppressMovable?: boolean;
    /** Set to true to not allow filter on this column */
    suppressFilter?: boolean;
    /** Set to true if you want the unsorted icon to be shown when no sort is applied to this column. */
    unSortIcon?: boolean;
    /** Set to true if you want this columns width to be fixed during 'size to fit' operation. */
    suppressSizeToFit?: boolean;
    /** Set to true if you do not want this column to be resizable by dragging it's edge. */
    suppressResize?: boolean;
    /** Set to true if you do not want this column to be auto-resizable by double clicking it's edge. */
    suppressAutoSize?: boolean;
    /** If true, GUI will allow adding this columns as a row group */
    enableRowGroup?: boolean;
    /** If true, GUI will allow adding this columns as a pivot */
    enablePivot?: boolean;
    /** If true, GUI will allow adding this columns as a value */
    enableValue?: boolean;
    /** Set to true if this col is editable, otherwise false. Can also be a function to have different rows editable. */
    editable?: boolean | IsColumnFunc;
    /** Set to tru if this col should not be navigable with the tab key. Can also be a function to have different rows editable. */
    suppressNavigable?: boolean | IsColumnFunc;
    /** To create the quick filter text for this column, if toString is not good enough on the value. */
    getQuickFilterText?: (params: GetQuickFilterTextParams) => string;
    /** Callbacks for editing.See editing section for further details. */
    newValueHandler?: Function;
    /** If true, this cell gets refreshed when api.softRefreshView() gets called. */
    volatile?: boolean;
    /** Cell template to use for cell. Useful for AngularJS cells. */
    template?: string;
    /** Cell template URL to load template from to use for cell. Useful for AngularJS cells. */
    templateUrl?: string;
    /** one of the built in filter names: [set, number, text], or a filter function*/
    filter?: string | {
        new (): IFilterComp;
    };
    filterFramework?: any;
    /** The filter params are specific to each filter! */
    filterParams?: any;
    /** Rules for applying css classes */
    cellClassRules?: {
        [cssClassName: string]: (Function | string);
    };
    /** Callbacks for editing.See editing section for further details. */
    onCellValueChanged?: Function;
    /** Function callback, gets called when a cell is clicked. */
    onCellClicked?: Function;
    /** Function callback, gets called when a cell is double clicked. */
    onCellDoubleClicked?: Function;
    /** Function callback, gets called when a cell is right clicked. */
    onCellContextMenu?: Function;
    /** Icons for this column. Leave blank to use default. */
    icons?: {
        [key: string]: string;
    };
    /** If true, grid will flash cell after cell is refreshed */
    enableCellChangeFlash?: boolean;
    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotValueColumn?: Column;
    /** The custom header component to be used for rendering the component header. If none specified the default ag-Grid is used**/
    headerComponent?: {
        new (): any;
    };
    /** The custom header component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default ag-Grid is used**/
    headerComponentFramework?: {
        new (): any;
    };
    /** The custom header component parameters**/
    headerComponentParams?: any;
    /** The custom header component to be used for rendering the floating filter. If none specified the default ag-Grid is used**/
    floatingFilterComponent?: {
        new (): IFloatingFilterComp<any, any, any>;
    };
    floatingFilterComponentParams?: any;
    floatingFilterComponentFramework?: {
        new (): any;
    };
}
export interface IsColumnFunc {
    (params: IsColumnFuncParams): boolean;
}
export interface IsColumnFuncParams {
    node: RowNode;
    column: Column;
    colDef: ColDef;
    context: any;
    api: GridApi;
    columnApi: ColumnApi;
}
export interface GetQuickFilterTextParams {
    value: any;
    node: RowNode;
    data: any;
    column: Column;
    colDef: ColDef;
}
