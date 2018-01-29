import {Component, ContentChildren, Input, QueryList} from "@angular/core";
import {
    ColDef,
    ColGroupDef,
    GetQuickFilterTextParams,
    IAggFunc,
    ICellRendererFunc,
    IsColumnFunc,
    RowNode
} from "ag-grid/main";

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
    };

    private createColDefFromGridColumn(from: AgGridColumn): ColDef {
        let colDef: ColDef = {};
        Object.assign(colDef, from);
        delete (<any>colDef).childColumns;
        return colDef;
    };

    // inputs - pretty much most of ColDef, with the exception of template, templateUrl and internal only properties
    // AbstractColDef
    @Input() public headerName?: string;
    /** Whether to show the column when the group is open / closed. */
    @Input() public columnGroupShow?: string;
    /** CSS class for the header */
    @Input() public headerClass?: string | string[] | ((params: any) => string | string[]);
    /** CSS class for the header */
    @Input() public toolPanelClass?: string | string[] | ((params: any) => string | string[]);
    /** Expression or function to get the cells value. */
    @Input() public headerValueGetter?: string | Function;
    /** Set to true to not include this column in the toolpanel */
    @Input() public suppressToolPanel?: boolean;

    // ColGroupDef
    /** Columns in this group */
    @Input() public children: (ColDef | ColGroupDef)[];
    /** Group ID */
    @Input() public groupId?: string;
    /** Open by Default */
    @Input() public openByDefault?: boolean;
    /** If true, group cannot be broken up by column moving, child columns will always appear side by side, however you can rearrange child columns within the group */
    @Input() public marryChildren?: boolean;
    /** The custom header group component to be used for rendering the component header. If none specified the default ag-Grid is used**/
    @Input() public headerGroupComponent?: {
        new (): any;
    };
    /** The custom header group component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default ag-Grid is used**/
    @Input() headerGroupComponentFramework?: {new (): any};
    /** The custom header group component to be used for rendering the component header. If none specified the default ag-Grid is used**/
    @Input() public headerGroupComponentParams?: any;

    // ColDef
    /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
     *  If both field and colId are missing, a unique ID will be generated.
     *  This ID is used to identify the column in the API for sorting, filtering etc. */
    @Input() public colId?: string;
    /** If sorting by default, set it here. Set to 'asc' or 'desc' */
    @Input() public sort?: string;
    /** If sorting more than one column by default, the milliseconds when this column was sorted, so we know what order to sort the columns in. */
    @Input() public sortedAt?: number;
    /** The sort order, provide an array with any of the following in any order ['asc','desc',null] */
    @Input() public sortingOrder?: string[];
    /** The field of the row to get the cells data from */
    @Input() public field?: string;
    /**
     * A comma separated string or array of strings containing ColumnType keys which can be used as a template for a column.
     * This helps to reduce duplication of properties when you have a lot of common column properties.
     */
    @Input() public type?: string | string[];
    /** Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field 'visible' and mark it false to hide,
     *  however we want all default values to be false and we want columns to be visible by default. */
    @Input() public hide?: boolean;
    /** Whether this column is pinned or not. */
    @Input() public pinned?: boolean | string;
    /** The field where we get the tooltip on the object */
    @Input() public tooltipField?: string;
    /** Tooltip for the column header */
    @Input() public headerTooltip?: string;
    /** Expression or function to get the cells value. */
    @Input() public valueGetter?: ((params: any) => any) | string;
    /** If not using a field, then this puts the value into the cell */
    @Input() public valueSetter?: ((params: any) => boolean) | string;
    /** Function to return the key for a value - use this if the value is an object (not a primitive type) and you
     * want to a) group by this field or b) use set filter on this field. */
    @Input() public keyCreator?: Function;
    /** Initial width, in pixels, of the cell */
    @Input() public width?: number;
    /** Min width, in pixels, of the cell */
    @Input() public minWidth?: number;
    /** Max width, in pixels, of the cell */
    @Input() public maxWidth?: number;
    /** Class to use for the cell. Can be string, array of strings, or function. */
    @Input() public cellClass?: string | string[] | ((cellClassParams: any) => string | string[]);
    /** An object of css values. Or a function returning an object of css values. */
    @Input() public cellStyle?: {} | ((params: any) => {});
    /** A function for rendering a cell. */
    @Input() public cellRenderer?: {
        new (): any;
    } | ICellRendererFunc | string;
    @Input() public cellRendererFramework?: any;
    @Input() public cellRendererParams?: any;
    /** Cell editor */
    @Input() public cellEditor?: {
        new (): any;
    } | string;
    @Input() public cellEditorFramework?: any;
    @Input() public cellEditorParams?: any;
    /** A function for rendering a pinned row cell. */
    @Input() public pinnedRowCellRenderer?: {
        new (): any;
    } | ICellRendererFunc | string;
    @Input() public pinnedRowCellRendererFramework?: any;
    @Input() public pinnedRowCellRendererParams?: any;
    /** A function to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering. */
    @Input() public valueFormatter?: (params: any) => string | string;
    /** A function to format a pinned row value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering. */
    @Input() public pinnedRowValueFormatter?: (params: any) => string | string;
    /** Gets called after editing, converts the value in the cell. */
    @Input() public valueParser?: (params: any) => any | string;
    /** Name of function to use for aggregation. One of [sum,min,max,first,last] or a function. */
    @Input() public aggFunc?: string | IAggFunc;
    /** Agg funcs allowed on this column. If missing, all installed agg funcs are allowed.
     * Can be eg ['sum','avg']. This will restrict what the GUI allows to select only.*/
    @Input() public allowedAggFuncs?: string[];
    /** To group by this column by default, either provide an index (eg rowGroupIndex=1), or set rowGroup=true. */
    @Input() public rowGroupIndex?: number;
    @Input() public rowGroup?: boolean;
    /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group. */
    @Input() public showRowGroup?: string | boolean;
    /** To pivot by this column by default, either provide an index (eg pivotIndex=1), or set pivot=true. */
    @Input() public pivotIndex?: number;
    @Input() public pivot?: boolean;
    /** Comparator function for custom sorting. */
    @Input() public comparator?: (valueA: any, valueB: any, nodeA?: RowNode, nodeB?: RowNode, isInverted?: boolean) => number;
    /** Comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed. */
    @Input() public equals?: (valueA: any, valueB: any) => boolean;
    /** Comparator for ordering the pivot columns */
    @Input() public pivotComparator?: (valueA: string, valueB: string) => number;
    /** Set to true to render a selection checkbox in the column. */
    @Input() public checkboxSelection?: boolean | ((params: any) => boolean);
    /** If true, a 'select all' checkbox will be put into the header */
    @Input() public headerCheckboxSelection?: boolean | ((params: any) => boolean);
    /** If true, the header checkbox selection will work on filtered items*/
    @Input() public headerCheckboxSelectionFilteredOnly?: boolean;

    @Input() public rowDrag?: boolean | ((params: any)=>boolean);

    /** Set to true if no menu should be shown for this column header. */
    @Input() public suppressMenu?: boolean;
    /** The menu tabs to show, and in which order, the valid values for this property are:
     * filterMenuTab, generalMenuTab, columnsMenuTab **/
    @Input() public menuTabs?: string[];
    /** Set to true if no sorting should be done for this column. */
    @Input() public suppressSorting?: boolean;
    /** Set to true to not allow moving this column via dragging it's header */
    @Input() public suppressMovable?: boolean;
    /** Set to true to not allow filter on this column */
    @Input() public suppressFilter?: boolean;
    /** Set to true if you want the unsorted icon to be shown when no sort is applied to this column. */
    @Input() public unSortIcon?: boolean;
    /** Set to true if you want this columns width to be fixed during 'size to fit' operation. */
    @Input() public suppressSizeToFit?: boolean;
    /** Set to true if you do not want this column to be resizable by dragging it's edge. */
    @Input() public suppressResize?: boolean;
    /** Set to true if you do not want this column to be auto-resizable by double clicking it's edge. */
    @Input() public suppressAutoSize?: boolean;
    @Input() public suppressKeyboardEvent?: (params: any) => boolean;
    /** If true, GUI will allow adding this columns as a row group */
    @Input() public enableRowGroup?: boolean;
    /** If true, GUI will allow adding this columns as a pivot */
    @Input() public enablePivot?: boolean;
    /** If true, GUI will allow adding this columns as a value */
    @Input() public enableValue?: boolean;
    /** Set to true if this col is editable, otherwise false. Can also be a function to have different rows editable. */
    @Input() public editable?: boolean | IsColumnFunc;
    @Input() public colSpan?: (params: any) => number;
    /** Set to true if this col should not be allowed take new values from teh clipboard . */
    @Input() public suppressPaste?: boolean | IsColumnFunc;
    /** Set to tru if this col should not be navigable with the tab key. Can also be a function to have different rows editable. */
    @Input() public suppressNavigable?: boolean | IsColumnFunc;
    /** To create the quick filter text for this column, if toString is not good enough on the value. */
    @Input() public getQuickFilterText?: (params: GetQuickFilterTextParams) => string;
    /** Callbacks for editing. See editing section for further details.
     * Return true if the update was successful, or false if not.
     * If false, then skips the UI refresh and no events are emitted.
     * Return false if the values are the same (ie no update). */
    @Input() public newValueHandler?: (params: any) => boolean;
    /** If true, this cell gets refreshed when api.softRefreshView() gets called. */
    @Input() public volatile?: boolean;
    /** Cell template to use for cell. Useful for AngularJS cells. */
    @Input() public template?: string;
    /** one of the built in filter names: [set, number, text], or a filter function*/
    @Input() public filter?: string | {
        new (): any;
    };
    @Input() public filterFramework?: any;
    /** The filter params are specific to each filter! */
    @Input() public filterParams?: any;
    /** Rules for applying css classes */
    @Input() public cellClassRules?: {
        [cssClassName: string]: (Function | string);
    };
    /** Callbacks for editing.See editing section for further details. */
    @Input() public onCellValueChanged?: Function;
    /** Function callback, gets called when a cell is clicked. */
    @Input() public onCellClicked?: (event: any) => void;
    /** Function callback, gets called when a cell is double clicked. */
    @Input() public onCellDoubleClicked?: (event: any) => void;
    /** Function callback, gets called when a cell is right clicked. */
    @Input() public onCellContextMenu?: (event: any) => void;
    /** Icons for this column. Leave blank to use default. */
    @Input() public icons?: {
        [key: string]: string;
    };
    /** If true, grid will flash cell after cell is refreshed */
    @Input() public enableCellChangeFlash?: boolean;
    /** The custom header component to be used for rendering the component header. If none specified the default ag-Grid is used**/
    @Input() public headerComponent?: {
        new (): any;
    };
    /** The custom header component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default ag-Grid is used**/
    @Input() public headerComponentFramework?: {
        new (): any;
    };
    /** The custom header component parameters**/
    @Input() public headerComponentParams?: any;
    /** The custom header component to be used for rendering the floating filter. If none specified the default ag-Grid is used**/
    @Input() public floatingFilterComponent?: {
        new (): any;
    };
    @Input() public floatingFilterComponentParams?: any;
    @Input() public floatingFilterComponentFramework?: {
        new (): any;
    };
    @Input() public refData?: {
        [key: string]: string;
    };

    @Input() public tooltip: any;
    @Input() public lockPosition: any;
    @Input() public lockVisible: any;
    @Input() public lockPinned: any;
}