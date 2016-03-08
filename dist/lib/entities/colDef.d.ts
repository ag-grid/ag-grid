// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "./rowNode";
import { SetFilterParameters } from "../filter/setFilterParameters";
import { TextAndNumberFilterParameters } from "../filter/textAndNumberFilterParameters";
/** AbstractColDef can be a group or a column definition */
export interface AbstractColDef {
    /** The name to render in the column header */
    headerName?: string;
    /** Whether to show the column when the group is open / closed. */
    columnGroupShow?: string;
    /** CSS class for the header */
    headerClass?: string | string[] | ((params: any) => string | string[]);
}
export interface ColGroupDef extends AbstractColDef {
    /** Columns in this group*/
    children: AbstractColDef[];
    /** Group ID */
    groupId?: string;
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
    /** Expression or function to get the cells value. */
    headerValueGetter?: string | Function;
    /** Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field 'visible' and mark it false to hide,
     *  however we want all default values to be false and we want columns to be visible by default. */
    hide?: boolean;
    /** Whether this column is pinned or not. */
    pinned?: boolean | string;
    /** Tooltip for the column header */
    headerTooltip?: string;
    /** Expression or function to get the cells value. */
    valueGetter?: string | Function;
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
    cellRenderer?: Function | {};
    /** A function for rendering a floating cell. */
    floatingCellRenderer?: Function | {};
    /** Name of function to use for aggregation. One of [sum,min,max]. */
    aggFunc?: string;
    /** To group by this column by default, provide an index here. */
    rowGroupIndex?: number;
    /** Comparator function for custom sorting. */
    comparator?: (valueA: any, valueB: any, nodeA?: RowNode, nodeB?: RowNode, isInverted?: boolean) => number;
    /** Set to true to render a selection checkbox in the column. */
    checkboxSelection?: boolean | (Function);
    /** Set to true if no menu should be shown for this column header. */
    suppressMenu?: boolean;
    /** Set to true if no sorting should be done for this column. */
    suppressSorting?: boolean;
    /** Set to true to not allow moving this column via dragging it's header */
    suppressMovable?: boolean;
    /** Set to true if you want the unsorted icon to be shown when no sort is applied to this column. */
    unSortIcon?: boolean;
    /** Set to true if you want this columns width to be fixed during 'size to fit' operation. */
    suppressSizeToFit?: boolean;
    /** Set to true if you do not want this column to be resizable by dragging it's edge. */
    suppressResize?: boolean;
    /** Set to true if you do not want this column to be auto-resizable by double clicking it's edge. */
    suppressAutoSize?: boolean;
    /** Set to true if you don't want to be able to group by this column */
    suppressRowGroup?: boolean;
    /** Set to true if you don't want to be able to aggregate by this column */
    suppressAggregation?: boolean;
    /** Set to true if this col is editable, otherwise false. Can also be a function to have different rows editable. */
    editable?: boolean | (Function);
    /** Callbacks for editing.See editing section for further details. */
    newValueHandler?: Function;
    /** If true, this cell gets refreshed when api.softRefreshView() gets called. */
    volatile?: boolean;
    /** Cell template to use for cell. Useful for AngularJS cells. */
    template?: string;
    /** Cell template URL to load template from to use for cell. Useful for AngularJS cells. */
    templateUrl?: string;
    /** one of the built in filter names: [set, number, text], or a filter function*/
    filter?: string | Function;
    /** The filter params are specific to each filter! */
    filterParams?: SetFilterParameters | TextAndNumberFilterParameters;
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
}
