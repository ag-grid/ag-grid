import { __decorate, __metadata, __rest } from "tslib";
import { Component, ContentChildren, Input, QueryList } from "@angular/core";
var AgGridColumn = /** @class */ (function () {
    function AgGridColumn() {
        // inputs - pretty much most of ColDef, with the exception of template, templateUrl and internal only properties
        // @START@
        /** Columns in this group     */
        this.children = undefined;
        /** The sort order, provide an array with any of the following in any order ['asc','desc',null]     */
        this.sortingOrder = undefined;
        /** Agg funcs allowed on this column. If missing, all installed agg funcs are allowed.
         * Can be eg ['sum','avg']. This will restrict what the GUI allows to select only.     */
        this.allowedAggFuncs = undefined;
        /** The menu tabs to show, and in which order, the valid values for this property are:
         * filterMenuTab, generalMenuTab, columnsMenuTab     *     */
        this.menuTabs = undefined;
        /** Rules for applying css classes     */
        this.cellClassRules = undefined;
        /** Icons for this column. Leave blank to use default.     */
        this.icons = undefined;
        /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used*     */
        this.headerGroupComponent = undefined;
        /** The custom header group component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used*     */
        this.headerGroupComponentFramework = undefined;
        /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used*     */
        this.headerGroupComponentParams = undefined;
        /** An object of css values. Or a function returning an object of css values.     */
        this.cellStyle = undefined;
        this.cellRendererParams = undefined;
        this.cellEditorFramework = undefined;
        this.cellEditorParams = undefined;
        /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
         */
        this.pinnedRowCellRendererFramework = undefined;
        /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
         */
        this.pinnedRowCellRendererParams = undefined;
        this.filterFramework = undefined;
        this.filterParams = undefined;
        /** The custom header component to be used for rendering the component header. If none specified the default AG Grid is used*     */
        this.headerComponent = undefined;
        /** The custom header component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used*     */
        this.headerComponentFramework = undefined;
        /** The custom header component parameters*     */
        this.headerComponentParams = undefined;
        this.floatingFilterComponent = undefined;
        this.floatingFilterComponentParams = undefined;
        this.floatingFilterComponentFramework = undefined;
        this.tooltipComponent = undefined;
        this.tooltipComponentParams = undefined;
        this.tooltipComponentFramework = undefined;
        this.refData = undefined;
        /** Params to customise the columns menu behaviour and appearance     */
        this.columnsMenuParams = undefined;
        /** The name to render in the column header     */
        this.headerName = undefined;
        /** Whether to show the column when the group is open / closed.     */
        this.columnGroupShow = undefined;
        /** CSS class for the header     */
        this.headerClass = undefined;
        /** CSS class for the toolPanel     */
        this.toolPanelClass = undefined;
        /** Expression or function to get the cells value.     */
        this.headerValueGetter = undefined;
        /** Group ID     */
        this.groupId = undefined;
        /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
         * If both field and colId are missing, a unique ID will be generated.
         * This ID is used to identify the column in the API for sorting, filtering etc.     */
        this.colId = undefined;
        /** If sorting by default, set it here. Set to 'asc' or 'desc'     */
        this.sort = undefined;
        this.initialSort = undefined;
        /** The field of the row to get the cells data from     */
        this.field = undefined;
        /** A comma separated string or array of strings containing ColumnType keys which can be used as a template for a column.
         * This helps to reduce duplication of properties when you have a lot of common column properties.     */
        this.type = undefined;
        /** The field where we get the tooltip on the object     */
        this.tooltipField = undefined;
        /** Tooltip for the column header     */
        this.headerTooltip = undefined;
        /** Class to use for the cell. Can be string, array of strings, or function.     */
        this.cellClass = undefined;
        /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group.     */
        this.showRowGroup = undefined;
        this.filter = undefined;
        this.initialAggFunc = undefined;
        /** Name of function to use for aggregation. One of [sum,min,max,first,last] or a function.     */
        this.aggFunc = undefined;
        /** A function for rendering a cell.     */
        this.cellRenderer = undefined;
        /** Cell editor     */
        this.cellEditor = undefined;
        /** Whether this column is pinned or not.     */
        this.pinned = undefined;
        this.initialPinned = undefined;
        /** Defines the column data type used when charting     */
        this.chartDataType = undefined;
        this.cellEditorPopupPosition = undefined;
        /** @deprecated since v24 - use sortIndex instead
         */
        this.sortedAt = undefined;
        /** If sorting more than one column by default, specifies order in which the sorting should be applied.     */
        this.sortIndex = undefined;
        this.initialSortIndex = undefined;
        /** Sets the grow factor of a column. It specifies how much of the remaining
         * space should be assigned to the column.     */
        this.flex = undefined;
        this.initialFlex = undefined;
        /** Actual width, in pixels, of the cell     */
        this.width = undefined;
        /** Default width, in pixels, of the cell     */
        this.initialWidth = undefined;
        /** Min width, in pixels, of the cell     */
        this.minWidth = undefined;
        /** Max width, in pixels, of the cell     */
        this.maxWidth = undefined;
        /** To group by this column by default, either provide an index (eg rowGroupIndex=1), or set rowGroup=true.     */
        this.rowGroupIndex = undefined;
        this.initialRowGroupIndex = undefined;
        /** To pivot by this column by default, either provide an index (eg pivotIndex=1), or set pivot=true.     */
        this.pivotIndex = undefined;
        this.initialPivotIndex = undefined;
        /** For native drag and drop, set to true to allow custom onRowDrag processing     */
        this.dndSourceOnRowDrag = undefined;
        /** Expression or function to get the cells value.     */
        this.valueGetter = undefined;
        /** If not using a field, then this puts the value into the cell     */
        this.valueSetter = undefined;
        /** Expression or function to get the cells value for filtering.     */
        this.filterValueGetter = undefined;
        /** Function to return the key for a value - use this if the value is an object (not a primitive type) and you
         * want to a) group by this field or b) use set filter on this field.     */
        this.keyCreator = undefined;
        this.cellRendererFramework = undefined;
        /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
         */
        this.pinnedRowCellRenderer = undefined;
        /** A function to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering.     */
        this.valueFormatter = undefined;
        /** @deprecated Use valueFormatter for pinned rows, and check params.node.rowPinned.
         */
        this.pinnedRowValueFormatter = undefined;
        /** Gets called after editing, converts the value in the cell.     */
        this.valueParser = undefined;
        /** Comparator function for custom sorting.     */
        this.comparator = undefined;
        /** Comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed.     */
        this.equals = undefined;
        /** Comparator for ordering the pivot columns     */
        this.pivotComparator = undefined;
        /** Allows the user to suppress certain keyboard events in the grid cell     */
        this.suppressKeyboardEvent = undefined;
        /** Allows the user to suppress certain keyboard events in the grid header     */
        this.suppressHeaderKeyboardEvent = undefined;
        this.colSpan = undefined;
        this.rowSpan = undefined;
        /** To create the quick filter text for this column, if toString is not good enough on the value.     */
        this.getQuickFilterText = undefined;
        /** Callbacks for editing. See editing section for further details.
         * Return true if the update was successful, or false if not.
         * If false, then skips the UI refresh and no events are emitted.
         * Return false if the values are the same (ie no update).     */
        this.newValueHandler = undefined;
        /** Callbacks for editing.See editing section for further details.     */
        this.onCellValueChanged = undefined;
        /** Function callback, gets called when a cell is clicked.     */
        this.onCellClicked = undefined;
        /** Function callback, gets called when a cell is double clicked.     */
        this.onCellDoubleClicked = undefined;
        /** Function callback, gets called when a cell is right clicked.     */
        this.onCellContextMenu = undefined;
        /** To configure the text to be displayed in the floating div while dragging a row when rowDrag is true     */
        this.rowDragText = undefined;
        /** The function used to calculate the tooltip of the object, tooltipField takes precedence     */
        this.tooltipValueGetter = undefined;
        this.cellRendererSelector = undefined;
        this.cellEditorSelector = undefined;
        /** Set to true to not flash this column for value changes     */
        this.suppressCellFlash = undefined;
        /** Set to true to not include this column in the Columns Tool Panel     */
        this.suppressColumnsToolPanel = undefined;
        /** Set to true to not include this column / filter in the Filters Tool Panel     */
        this.suppressFiltersToolPanel = undefined;
        /** Open by Default     */
        this.openByDefault = undefined;
        /** If true, group cannot be broken up by column moving, child columns will always appear side by side, however you can rearrange child columns within the group     */
        this.marryChildren = undefined;
        /** Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field 'visible' and mark it false to hide,
         * however we want all default values to be false and we want columns to be visible by default.     */
        this.hide = undefined;
        this.initialHide = undefined;
        this.rowGroup = undefined;
        this.initialRowGroup = undefined;
        this.pivot = undefined;
        this.initialPivot = undefined;
        /** Set to true to render a selection checkbox in the column.     */
        this.checkboxSelection = undefined;
        /** If true, a 'select all' checkbox will be put into the header     */
        this.headerCheckboxSelection = undefined;
        /** If true, the header checkbox selection will work on filtered items     */
        this.headerCheckboxSelectionFilteredOnly = undefined;
        /** Set to true if no menu should be shown for this column header.     */
        this.suppressMenu = undefined;
        /** Set to true to not allow moving this column via dragging it's header     */
        this.suppressMovable = undefined;
        /** Set to true to make sure this column is always first. Other columns, if movable, cannot move before this column.     */
        this.lockPosition = undefined;
        /** Set to true to block the user showing / hiding the column, the column can only be shown / hidden via definitions or API     */
        this.lockVisible = undefined;
        /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API     */
        this.lockPinned = undefined;
        /** Set to true if you want the unsorted icon to be shown when no sort is applied to this column.     */
        this.unSortIcon = undefined;
        /** Set to true if you want this columns width to be fixed during 'size to fit' operation.     */
        this.suppressSizeToFit = undefined;
        /** Set to true if you do not want this column to be auto-resizable by double clicking it's edge.     */
        this.suppressAutoSize = undefined;
        /** If true, GUI will allow adding this columns as a row group     */
        this.enableRowGroup = undefined;
        /** If true, GUI will allow adding this columns as a pivot     */
        this.enablePivot = undefined;
        /** If true, GUI will allow adding this columns as a value     */
        this.enableValue = undefined;
        /** Set to true if this col is editable, otherwise false. Can also be a function to have different rows editable.     */
        this.editable = undefined;
        /** Set to true if this col should not be allowed take new values from the clipboard .     */
        this.suppressPaste = undefined;
        /** Set to true if this col should not be navigable with the tab key. Can also be a function to have different rows editable.     */
        this.suppressNavigable = undefined;
        /** If true, grid will flash cell after cell is refreshed     */
        this.enableCellChangeFlash = undefined;
        /** For grid row dragging, set to true to enable row dragging within the grid     */
        this.rowDrag = undefined;
        /** For native drag and drop, set to true to enable drag source     */
        this.dndSource = undefined;
        /** True if this column should stretch rows height to fit contents     */
        this.autoHeight = undefined;
        /** True if this column should wrap cell contents - typically used with autoHeight     */
        this.wrapText = undefined;
        /** Set to true if sorting allowed for this column.     */
        this.sortable = undefined;
        /** Set to true if this column should be resizable     */
        this.resizable = undefined;
        /** If true, this cell will be in editing mode after first click.     */
        this.singleClickEdit = undefined;
        /** Whether to display a floating filter for this column.     */
        this.floatingFilter = undefined;
        this.cellEditorPopup = undefined;
        // @END@
    }
    AgGridColumn_1 = AgGridColumn;
    AgGridColumn.prototype.hasChildColumns = function () {
        if (this.childColumns && this.childColumns.length > 0) {
            // necessary because of https://github.com/angular/angular/issues/10098
            return !(this.childColumns.length === 1 && this.childColumns.first === this);
        }
        return false;
    };
    AgGridColumn.prototype.toColDef = function () {
        var colDef = this.createColDefFromGridColumn(this);
        if (this.hasChildColumns()) {
            colDef["children"] = this.getChildColDefs(this.childColumns);
        }
        return colDef;
    };
    AgGridColumn.prototype.getChildColDefs = function (childColumns) {
        return childColumns
            // necessary because of https://github.com/angular/angular/issues/10098
            .filter(function (column) { return !column.hasChildColumns(); })
            .map(function (column) {
            return column.toColDef();
        });
    };
    AgGridColumn.prototype.createColDefFromGridColumn = function (from) {
        var childColumns = from.childColumns, colDef = __rest(from, ["childColumns"]);
        return colDef;
    };
    var AgGridColumn_1;
    __decorate([
        ContentChildren(AgGridColumn_1),
        __metadata("design:type", QueryList)
    ], AgGridColumn.prototype, "childColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridColumn.prototype, "children", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridColumn.prototype, "sortingOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridColumn.prototype, "allowedAggFuncs", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridColumn.prototype, "menuTabs", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellClassRules", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "icons", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerGroupComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerGroupComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerGroupComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellStyle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRendererParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditorFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditorParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowCellRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowCellRendererParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "filterFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "filterParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "floatingFilterComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "floatingFilterComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "floatingFilterComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "tooltipComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "refData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "columnsMenuParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "headerName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "columnGroupShow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "toolPanelClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerValueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "groupId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "colId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "sort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "initialSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "field", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "type", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "tooltipField", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "headerTooltip", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "showRowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "filter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialAggFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "aggFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellEditor", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinned", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "initialPinned", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "chartDataType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridColumn.prototype, "cellEditorPopupPosition", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "sortedAt", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "sortIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "initialSortIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "flex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "initialFlex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "width", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "initialWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "minWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "maxWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "rowGroupIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "initialRowGroupIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "pivotIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridColumn.prototype, "initialPivotIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "dndSourceOnRowDrag", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueSetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "filterValueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "keyCreator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "cellRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowCellRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueFormatter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "pinnedRowValueFormatter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "valueParser", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "comparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "equals", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "pivotComparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "suppressKeyboardEvent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "suppressHeaderKeyboardEvent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "colSpan", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "rowSpan", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "getQuickFilterText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "newValueHandler", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "onCellValueChanged", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "onCellClicked", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "onCellDoubleClicked", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "onCellContextMenu", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "rowDragText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "tooltipValueGetter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "cellRendererSelector", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridColumn.prototype, "cellEditorSelector", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "suppressCellFlash", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "suppressColumnsToolPanel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "suppressFiltersToolPanel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "openByDefault", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "marryChildren", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "hide", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "initialHide", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "rowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "initialRowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "pivot", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "initialPivot", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "checkboxSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "headerCheckboxSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "headerCheckboxSelectionFilteredOnly", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "suppressMenu", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "suppressMovable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "lockPosition", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "lockVisible", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "lockPinned", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "unSortIcon", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "suppressSizeToFit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "suppressAutoSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "enableRowGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "enablePivot", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "enableValue", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "editable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressPaste", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "suppressNavigable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "enableCellChangeFlash", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "rowDrag", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridColumn.prototype, "dndSource", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "autoHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "wrapText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "sortable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "resizable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "singleClickEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "floatingFilter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridColumn.prototype, "cellEditorPopup", void 0);
    AgGridColumn = AgGridColumn_1 = __decorate([
        Component({
            selector: 'ag-grid-column',
            template: ''
        })
    ], AgGridColumn);
    return AgGridColumn;
}());
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctZ3JpZC1hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU03RTtJQUFBO1FBa0NJLGdIQUFnSDtRQUNoSCxVQUFVO1FBQ1YsZ0NBQWdDO1FBQ2hCLGFBQVEsR0FBeUMsU0FBUyxDQUFDO1FBQzNFLHNHQUFzRztRQUN0RixpQkFBWSxHQUFrQyxTQUFTLENBQUM7UUFDeEU7aUdBQ3lGO1FBQ3pFLG9CQUFlLEdBQXlCLFNBQVMsQ0FBQztRQUNsRTtxRUFDNkQ7UUFDN0MsYUFBUSxHQUF5QixTQUFTLENBQUM7UUFDM0QseUNBQXlDO1FBQ3pCLG1CQUFjLEdBQStCLFNBQVMsQ0FBQztRQUN2RSw2REFBNkQ7UUFDN0MsVUFBSyxHQUFzRCxTQUFTLENBQUM7UUFDckYsMElBQTBJO1FBQzFILHlCQUFvQixHQUFzRCxTQUFTLENBQUM7UUFDcEcsdUxBQXVMO1FBQ3ZLLGtDQUE2QixHQUFvQixTQUFTLENBQUM7UUFDM0UsMElBQTBJO1FBQzFILCtCQUEwQixHQUFvQixTQUFTLENBQUM7UUFDeEUsb0ZBQW9GO1FBQ3BFLGNBQVMsR0FBa0UsU0FBUyxDQUFDO1FBQ3JGLHVCQUFrQixHQUFvQixTQUFTLENBQUM7UUFDaEQsd0JBQW1CLEdBQW9CLFNBQVMsQ0FBQztRQUNqRCxxQkFBZ0IsR0FBb0IsU0FBUyxDQUFDO1FBQzlEO1dBQ0c7UUFDYSxtQ0FBOEIsR0FBb0IsU0FBUyxDQUFDO1FBQzVFO1dBQ0c7UUFDYSxnQ0FBMkIsR0FBb0IsU0FBUyxDQUFDO1FBQ3pELG9CQUFlLEdBQVEsU0FBUyxDQUFDO1FBQ2pDLGlCQUFZLEdBQVEsU0FBUyxDQUFDO1FBQzlDLG9JQUFv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eEI7SUFBRCxtQkFBQztDQUFBLEFBMVJELElBMFJDO1NBMVJZLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDZWxsQ2xhc3NGdW5jLCBDZWxsQ2xhc3NSdWxlcywgQ2VsbENsaWNrZWRFdmVudCwgQ2VsbENvbnRleHRNZW51RXZlbnQsIENlbGxEb3VibGVDbGlja2VkRXZlbnQsIENlbGxFZGl0b3JTZWxlY3RvckZ1bmMsIENlbGxSZW5kZXJlclNlbGVjdG9yRnVuYywgQ2VsbFN0eWxlRnVuYywgQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjaywgQ29sRGVmLCBDb2xHcm91cERlZiwgQ29sU3BhblBhcmFtcywgQ29sdW1uc01lbnVQYXJhbXMsIERuZFNvdXJjZUNhbGxiYWNrLCBFZGl0YWJsZUNhbGxiYWNrLCBHZXRRdWlja0ZpbHRlclRleHRQYXJhbXMsIEhlYWRlckNoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2ssIEhlYWRlckNsYXNzLCBJQWdnRnVuYywgSUNlbGxFZGl0b3JDb21wLCBJQ2VsbFJlbmRlcmVyQ29tcCwgSUNlbGxSZW5kZXJlckZ1bmMsIElIZWFkZXJHcm91cENvbXAsIElSb3dEcmFnSXRlbSwgSVRvb2x0aXBDb21wLCBJVG9vbHRpcFBhcmFtcywgTmV3VmFsdWVQYXJhbXMsIFJvd0RyYWdDYWxsYmFjaywgUm93Tm9kZSwgUm93U3BhblBhcmFtcywgU3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50UGFyYW1zLCBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXMsIFN1cHByZXNzTmF2aWdhYmxlQ2FsbGJhY2ssIFN1cHByZXNzUGFzdGVDYWxsYmFjaywgVG9vbFBhbmVsQ2xhc3MsIFZhbHVlRm9ybWF0dGVyRnVuYywgVmFsdWVHZXR0ZXJGdW5jLCBWYWx1ZVBhcnNlckZ1bmMsIFZhbHVlU2V0dGVyRnVuYyB9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBDb250ZW50Q2hpbGRyZW4sIElucHV0LCBRdWVyeUxpc3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtY29sdW1uJyxcbiAgICB0ZW1wbGF0ZTogJydcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQ29sdW1uIHtcbiAgICBAQ29udGVudENoaWxkcmVuKEFnR3JpZENvbHVtbikgcHVibGljIGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBwdWJsaWMgaGFzQ2hpbGRDb2x1bW5zKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5jaGlsZENvbHVtbnMgJiYgdGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIHJldHVybiAhKHRoaXMuY2hpbGRDb2x1bW5zLmxlbmd0aCA9PT0gMSAmJiB0aGlzLmNoaWxkQ29sdW1ucy5maXJzdCA9PT0gdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b0NvbERlZigpOiBDb2xEZWYge1xuICAgICAgICBsZXQgY29sRGVmOiBDb2xEZWYgPSB0aGlzLmNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0NoaWxkQ29sdW1ucygpKSB7XG4gICAgICAgICAgICAoPGFueT5jb2xEZWYpW1wiY2hpbGRyZW5cIl0gPSB0aGlzLmdldENoaWxkQ29sRGVmcyh0aGlzLmNoaWxkQ29sdW1ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENoaWxkQ29sRGVmcyhjaGlsZENvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+KSB7XG4gICAgICAgIHJldHVybiBjaGlsZENvbHVtbnNcbiAgICAgICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEwMDk4XG4gICAgICAgICAgICAuZmlsdGVyKGNvbHVtbiA9PiAhY29sdW1uLmhhc0NoaWxkQ29sdW1ucygpKVxuICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKGZyb206IEFnR3JpZENvbHVtbik6IENvbERlZiB7XG4gICAgICAgIGxldCB7IGNoaWxkQ29sdW1ucywgLi4uY29sRGVmIH0gPSBmcm9tO1xuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIC8vIGlucHV0cyAtIHByZXR0eSBtdWNoIG1vc3Qgb2YgQ29sRGVmLCB3aXRoIHRoZSBleGNlcHRpb24gb2YgdGVtcGxhdGUsIHRlbXBsYXRlVXJsIGFuZCBpbnRlcm5hbCBvbmx5IHByb3BlcnRpZXNcbiAgICAvLyBAU1RBUlRAXG4gICAgLyoqIENvbHVtbnMgaW4gdGhpcyBncm91cCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hpbGRyZW46IChDb2xEZWYgfCBDb2xHcm91cERlZilbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIHNvcnQgb3JkZXIsIHByb3ZpZGUgYW4gYXJyYXkgd2l0aCBhbnkgb2YgdGhlIGZvbGxvd2luZyBpbiBhbnkgb3JkZXIgWydhc2MnLCdkZXNjJyxudWxsXSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiAoc3RyaW5nIHwgbnVsbClbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWdnIGZ1bmNzIGFsbG93ZWQgb24gdGhpcyBjb2x1bW4uIElmIG1pc3NpbmcsIGFsbCBpbnN0YWxsZWQgYWdnIGZ1bmNzIGFyZSBhbGxvd2VkLlxuICAgICAqIENhbiBiZSBlZyBbJ3N1bScsJ2F2ZyddLiBUaGlzIHdpbGwgcmVzdHJpY3Qgd2hhdCB0aGUgR1VJIGFsbG93cyB0byBzZWxlY3Qgb25seS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93ZWRBZ2dGdW5jczogc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBtZW51IHRhYnMgdG8gc2hvdywgYW5kIGluIHdoaWNoIG9yZGVyLCB0aGUgdmFsaWQgdmFsdWVzIGZvciB0aGlzIHByb3BlcnR5IGFyZTpcbiAgICAgKiBmaWx0ZXJNZW51VGFiLCBnZW5lcmFsTWVudVRhYiwgY29sdW1uc01lbnVUYWIgICAgICogICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1lbnVUYWJzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUnVsZXMgZm9yIGFwcGx5aW5nIGNzcyBjbGFzc2VzICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3NSdWxlczogQ2VsbENsYXNzUnVsZXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIGZvciB0aGlzIGNvbHVtbi4gTGVhdmUgYmxhbmsgdG8gdXNlIGRlZmF1bHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB8IHN0cmluZzsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGN1c3RvbSBoZWFkZXIgZ3JvdXAgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlci4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBpcyB1c2VkKiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnQ6IHN0cmluZyB8IHsgbmV3KCk6IElIZWFkZXJHcm91cENvbXA7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBjdXN0b20gaGVhZGVyIGdyb3VwIGNvbXBvbmVudCB0byBiZSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGNvbXBvbmVudCBoZWFkZXIgaW4gdGhlIGhvc3RpbmcgZnJhbWV3b3JrIChpZTogUmVhY3QvQW5ndWxhcikuIElmIG5vbmUgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IEFHIEdyaWQgaXMgdXNlZCogICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBjdXN0b20gaGVhZGVyIGdyb3VwIGNvbXBvbmVudCB0byBiZSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGNvbXBvbmVudCBoZWFkZXIuIElmIG5vbmUgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IEFHIEdyaWQgaXMgdXNlZCogICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50UGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBvZiBjc3MgdmFsdWVzLiBPciBhIGZ1bmN0aW9uIHJldHVybmluZyBhbiBvYmplY3Qgb2YgY3NzIHZhbHVlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxTdHlsZTogeyBbY3NzUHJvcGVydHk6IHN0cmluZ106IHN0cmluZyB9IHwgQ2VsbFN0eWxlRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JGcmFtZXdvcms6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBhcmFtczogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgY2VsbFJlbmRlcmVyU2VsZWN0b3IgaWYgeW91IHdhbnQgYSBkaWZmZXJlbnQgQ2VsbCBSZW5kZXJlciBmb3IgcGlubmVkIHJvd3MuIENoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgY3VzdG9tIGhlYWRlciBjb21wb25lbnQgdG8gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQgaGVhZGVyLiBJZiBub25lIHNwZWNpZmllZCB0aGUgZGVmYXVsdCBBRyBHcmlkIGlzIHVzZWQqICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnQ6IHN0cmluZyB8IHsgbmV3KCk6IGFueTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGN1c3RvbSBoZWFkZXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlciBpbiB0aGUgaG9zdGluZyBmcmFtZXdvcmsgKGllOiBSZWFjdC9Bbmd1bGFyKS4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBpcyB1c2VkKiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBjdXN0b20gaGVhZGVyIGNvbXBvbmVudCBwYXJhbWV0ZXJzKiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50UGFyYW1zOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyQ29tcG9uZW50RnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnQ6IHsgbmV3KCk6IElUb29sdGlwQ29tcDsgfSB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudFBhcmFtczogYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHJlZkRhdGE6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQYXJhbXMgdG8gY3VzdG9taXNlIHRoZSBjb2x1bW5zIG1lbnUgYmVoYXZpb3VyIGFuZCBhcHBlYXJhbmNlICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5zTWVudVBhcmFtczogQ29sdW1uc01lbnVQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBuYW1lIHRvIHJlbmRlciBpbiB0aGUgY29sdW1uIGhlYWRlciAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGV0aGVyIHRvIHNob3cgdGhlIGNvbHVtbiB3aGVuIHRoZSBncm91cCBpcyBvcGVuIC8gY2xvc2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uR3JvdXBTaG93OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENTUyBjbGFzcyBmb3IgdGhlIGhlYWRlciAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2xhc3M6IEhlYWRlckNsYXNzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MgZm9yIHRoZSB0b29sUGFuZWwgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2xQYW5lbENsYXNzOiBUb29sUGFuZWxDbGFzcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRXhwcmVzc2lvbiBvciBmdW5jdGlvbiB0byBnZXQgdGhlIGNlbGxzIHZhbHVlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVmFsdWVHZXR0ZXI6IHN0cmluZyB8IEZ1bmN0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBHcm91cCBJRCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgdW5pcXVlIElEIHRvIGdpdmUgdGhlIGNvbHVtbi4gVGhpcyBpcyBvcHRpb25hbC4gSWYgbWlzc2luZywgdGhlIElEIHdpbGwgZGVmYXVsdCB0byB0aGUgZmllbGQuXG4gICAgICogSWYgYm90aCBmaWVsZCBhbmQgY29sSWQgYXJlIG1pc3NpbmcsIGEgdW5pcXVlIElEIHdpbGwgYmUgZ2VuZXJhdGVkLlxuICAgICAqIFRoaXMgSUQgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgY29sdW1uIGluIHRoZSBBUEkgZm9yIHNvcnRpbmcsIGZpbHRlcmluZyBldGMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xJZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBzb3J0aW5nIGJ5IGRlZmF1bHQsIHNldCBpdCBoZXJlLiBTZXQgdG8gJ2FzYycgb3IgJ2Rlc2MnICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsU29ydDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZmllbGQgb2YgdGhlIHJvdyB0byBnZXQgdGhlIGNlbGxzIGRhdGEgZnJvbSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmllbGQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MgY29udGFpbmluZyBDb2x1bW5UeXBlIGtleXMgd2hpY2ggY2FuIGJlIHVzZWQgYXMgYSB0ZW1wbGF0ZSBmb3IgYSBjb2x1bW4uXG4gICAgICogVGhpcyBoZWxwcyB0byByZWR1Y2UgZHVwbGljYXRpb24gb2YgcHJvcGVydGllcyB3aGVuIHlvdSBoYXZlIGEgbG90IG9mIGNvbW1vbiBjb2x1bW4gcHJvcGVydGllcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHR5cGU6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZmllbGQgd2hlcmUgd2UgZ2V0IHRoZSB0b29sdGlwIG9uIHRoZSBvYmplY3QgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBGaWVsZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUb29sdGlwIGZvciB0aGUgY29sdW1uIGhlYWRlciAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVG9vbHRpcDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDbGFzcyB0byB1c2UgZm9yIHRoZSBjZWxsLiBDYW4gYmUgc3RyaW5nLCBhcnJheSBvZiBzdHJpbmdzLCBvciBmdW5jdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCBDZWxsQ2xhc3NGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBoYXZlIHRoZSBncmlkIHBsYWNlIHRoZSB2YWx1ZXMgZm9yIHRoZSBncm91cCBpbnRvIHRoZSBjZWxsLCBvciBwdXQgdGhlIG5hbWUgb2YgYSBncm91cGVkIGNvbHVtbiB0byBqdXN0IHNob3cgdGhhdCBncm91cC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNob3dSb3dHcm91cDogc3RyaW5nIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxBZ2dGdW5jOiBzdHJpbmcgfCBJQWdnRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogTmFtZSBvZiBmdW5jdGlvbiB0byB1c2UgZm9yIGFnZ3JlZ2F0aW9uLiBPbmUgb2YgW3N1bSxtaW4sbWF4LGZpcnN0LGxhc3RdIG9yIGEgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jOiBzdHJpbmcgfCBJQWdnRnVuYyB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZnVuY3Rpb24gZm9yIHJlbmRlcmluZyBhIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENlbGwgZWRpdG9yICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yOiBzdHJpbmcgfCB7IG5ldygpOiBJQ2VsbEVkaXRvckNvbXA7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZXRoZXIgdGhpcyBjb2x1bW4gaXMgcGlubmVkIG9yIG5vdC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZDogYm9vbGVhbiB8IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaW5uZWQ6IGJvb2xlYW4gfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERlZmluZXMgdGhlIGNvbHVtbiBkYXRhIHR5cGUgdXNlZCB3aGVuIGNoYXJ0aW5nICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydERhdGFUeXBlOiAnY2F0ZWdvcnknIHwgJ3NlcmllcycgfCAndGltZScgfCAnZXhjbHVkZWQnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUG9wdXBQb3NpdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2MjQgLSB1c2Ugc29ydEluZGV4IGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGVkQXQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgc29ydGluZyBtb3JlIHRoYW4gb25lIGNvbHVtbiBieSBkZWZhdWx0LCBzcGVjaWZpZXMgb3JkZXIgaW4gd2hpY2ggdGhlIHNvcnRpbmcgc2hvdWxkIGJlIGFwcGxpZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0SW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTb3J0SW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgZ3JvdyBmYWN0b3Igb2YgYSBjb2x1bW4uIEl0IHNwZWNpZmllcyBob3cgbXVjaCBvZiB0aGUgcmVtYWluaW5nXG4gICAgICogc3BhY2Ugc2hvdWxkIGJlIGFzc2lnbmVkIHRvIHRoZSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbGV4OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxGbGV4OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFjdHVhbCB3aWR0aCwgaW4gcGl4ZWxzLCBvZiB0aGUgY2VsbCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgd2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGVmYXVsdCB3aWR0aCwgaW4gcGl4ZWxzLCBvZiB0aGUgY2VsbCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIE1pbiB3aWR0aCwgaW4gcGl4ZWxzLCBvZiB0aGUgY2VsbCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWluV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogTWF4IHdpZHRoLCBpbiBwaXhlbHMsIG9mIHRoZSBjZWxsICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBncm91cCBieSB0aGlzIGNvbHVtbiBieSBkZWZhdWx0LCBlaXRoZXIgcHJvdmlkZSBhbiBpbmRleCAoZWcgcm93R3JvdXBJbmRleD0xKSwgb3Igc2V0IHJvd0dyb3VwPXRydWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cEluZGV4OiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUm93R3JvdXBJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBwaXZvdCBieSB0aGlzIGNvbHVtbiBieSBkZWZhdWx0LCBlaXRoZXIgcHJvdmlkZSBhbiBpbmRleCAoZWcgcGl2b3RJbmRleD0xKSwgb3Igc2V0IHBpdm90PXRydWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEluZGV4OiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3RJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgbmF0aXZlIGRyYWcgYW5kIGRyb3AsIHNldCB0byB0cnVlIHRvIGFsbG93IGN1c3RvbSBvblJvd0RyYWcgcHJvY2Vzc2luZyAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG5kU291cmNlT25Sb3dEcmFnOiAocGFyYW1zOiB7IHJvd05vZGU6IFJvd05vZGUsIGRyYWdFdmVudDogRHJhZ0V2ZW50OyB9KSA9PiB2b2lkIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBFeHByZXNzaW9uIG9yIGZ1bmN0aW9uIHRvIGdldCB0aGUgY2VsbHMgdmFsdWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUdldHRlcjogc3RyaW5nIHwgVmFsdWVHZXR0ZXJGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBub3QgdXNpbmcgYSBmaWVsZCwgdGhlbiB0aGlzIHB1dHMgdGhlIHZhbHVlIGludG8gdGhlIGNlbGwgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlU2V0dGVyOiBzdHJpbmcgfCBWYWx1ZVNldHRlckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEV4cHJlc3Npb24gb3IgZnVuY3Rpb24gdG8gZ2V0IHRoZSBjZWxscyB2YWx1ZSBmb3IgZmlsdGVyaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyVmFsdWVHZXR0ZXI6IHN0cmluZyB8IFZhbHVlR2V0dGVyRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gdG8gcmV0dXJuIHRoZSBrZXkgZm9yIGEgdmFsdWUgLSB1c2UgdGhpcyBpZiB0aGUgdmFsdWUgaXMgYW4gb2JqZWN0IChub3QgYSBwcmltaXRpdmUgdHlwZSkgYW5kIHlvdVxuICAgICAqIHdhbnQgdG8gYSkgZ3JvdXAgYnkgdGhpcyBmaWVsZCBvciBiKSB1c2Ugc2V0IGZpbHRlciBvbiB0aGlzIGZpZWxkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2V5Q3JlYXRvcjogKHZhbHVlOiBhbnkpID0+IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZnVuY3Rpb24gdG8gZm9ybWF0IGEgdmFsdWUsIHNob3VsZCByZXR1cm4gYSBzdHJpbmcuIE5vdCB1c2VkIGZvciBDU1YgZXhwb3J0IG9yIGNvcHkgdG8gY2xpcGJvYXJkLCBvbmx5IGZvciBVSSBjZWxsIHJlbmRlcmluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlRm9ybWF0dGVyOiBzdHJpbmcgfCBWYWx1ZUZvcm1hdHRlckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSB2YWx1ZUZvcm1hdHRlciBmb3IgcGlubmVkIHJvd3MsIGFuZCBjaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd1ZhbHVlRm9ybWF0dGVyOiBzdHJpbmcgfCBWYWx1ZUZvcm1hdHRlckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEdldHMgY2FsbGVkIGFmdGVyIGVkaXRpbmcsIGNvbnZlcnRzIHRoZSB2YWx1ZSBpbiB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlUGFyc2VyOiBzdHJpbmcgfCBWYWx1ZVBhcnNlckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgZnVuY3Rpb24gZm9yIGN1c3RvbSBzb3J0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcGFyYXRvcjogKHZhbHVlQTogYW55LCB2YWx1ZUI6IGFueSwgbm9kZUE6IFJvd05vZGUsIG5vZGVCOiBSb3dOb2RlLCBpc0ludmVydGVkOiBib29sZWFuKSA9PiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgZm9yIHZhbHVlcywgdXNlZCBieSByZW5kZXJlciB0byBrbm93IGlmIHZhbHVlcyBoYXZlIGNoYW5nZWQuIENlbGxzIHdobydzIHZhbHVlcyBoYXZlIG5vdCBjaGFuZ2VkIGRvbid0IGdldCByZWZyZXNoZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlcXVhbHM6ICh2YWx1ZUE6IGFueSwgdmFsdWVCOiBhbnkpID0+IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgZm9yIG9yZGVyaW5nIHRoZSBwaXZvdCBjb2x1bW5zICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbXBhcmF0b3I6ICh2YWx1ZUE6IHN0cmluZywgdmFsdWVCOiBzdHJpbmcpID0+IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIHN1cHByZXNzIGNlcnRhaW4ga2V5Ym9hcmQgZXZlbnRzIGluIHRoZSBncmlkIGNlbGwgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudDogKHBhcmFtczogU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zKSA9PiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdGhlIHVzZXIgdG8gc3VwcHJlc3MgY2VydGFpbiBrZXlib2FyZCBldmVudHMgaW4gdGhlIGdyaWQgaGVhZGVyICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnQ6IChwYXJhbXM6IFN1cHByZXNzSGVhZGVyS2V5Ym9hcmRFdmVudFBhcmFtcykgPT4gYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY29sU3BhbjogKHBhcmFtczogQ29sU3BhblBhcmFtcykgPT4gbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTcGFuOiAocGFyYW1zOiBSb3dTcGFuUGFyYW1zKSA9PiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRvIGNyZWF0ZSB0aGUgcXVpY2sgZmlsdGVyIHRleHQgZm9yIHRoaXMgY29sdW1uLCBpZiB0b1N0cmluZyBpcyBub3QgZ29vZCBlbm91Z2ggb24gdGhlIHZhbHVlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0UXVpY2tGaWx0ZXJUZXh0OiAocGFyYW1zOiBHZXRRdWlja0ZpbHRlclRleHRQYXJhbXMpID0+IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2tzIGZvciBlZGl0aW5nLiBTZWUgZWRpdGluZyBzZWN0aW9uIGZvciBmdXJ0aGVyIGRldGFpbHMuXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHVwZGF0ZSB3YXMgc3VjY2Vzc2Z1bCwgb3IgZmFsc2UgaWYgbm90LlxuICAgICAqIElmIGZhbHNlLCB0aGVuIHNraXBzIHRoZSBVSSByZWZyZXNoIGFuZCBubyBldmVudHMgYXJlIGVtaXR0ZWQuXG4gICAgICogUmV0dXJuIGZhbHNlIGlmIHRoZSB2YWx1ZXMgYXJlIHRoZSBzYW1lIChpZSBubyB1cGRhdGUpLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmV3VmFsdWVIYW5kbGVyOiAocGFyYW1zOiBOZXdWYWx1ZVBhcmFtcykgPT4gYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2tzIGZvciBlZGl0aW5nLlNlZSBlZGl0aW5nIHNlY3Rpb24gZm9yIGZ1cnRoZXIgZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbFZhbHVlQ2hhbmdlZDogKGV2ZW50OiBOZXdWYWx1ZVBhcmFtcykgPT4gdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gY2FsbGJhY2ssIGdldHMgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDbGlja2VkOiAoZXZlbnQ6IENlbGxDbGlja2VkRXZlbnQpID0+IHZvaWQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIGNhbGxiYWNrLCBnZXRzIGNhbGxlZCB3aGVuIGEgY2VsbCBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbERvdWJsZUNsaWNrZWQ6IChldmVudDogQ2VsbERvdWJsZUNsaWNrZWRFdmVudCkgPT4gdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gY2FsbGJhY2ssIGdldHMgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIHJpZ2h0IGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDb250ZXh0TWVudTogKGV2ZW50OiBDZWxsQ29udGV4dE1lbnVFdmVudCkgPT4gdm9pZCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gY29uZmlndXJlIHRoZSB0ZXh0IHRvIGJlIGRpc3BsYXllZCBpbiB0aGUgZmxvYXRpbmcgZGl2IHdoaWxlIGRyYWdnaW5nIGEgcm93IHdoZW4gcm93RHJhZyBpcyB0cnVlICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnVGV4dDogKHBhcmFtczogSVJvd0RyYWdJdGVtLCBkcmFnSXRlbUNvdW50OiBudW1iZXIpID0+IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGZ1bmN0aW9uIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSB0b29sdGlwIG9mIHRoZSBvYmplY3QsIHRvb2x0aXBGaWVsZCB0YWtlcyBwcmVjZWRlbmNlICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwVmFsdWVHZXR0ZXI6IChwYXJhbXM6IElUb29sdGlwUGFyYW1zKSA9PiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclNlbGVjdG9yOiBDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JTZWxlY3RvcjogQ2VsbEVkaXRvclNlbGVjdG9yRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gbm90IGZsYXNoIHRoaXMgY29sdW1uIGZvciB2YWx1ZSBjaGFuZ2VzICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGbGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gbm90IGluY2x1ZGUgdGhpcyBjb2x1bW4gaW4gdGhlIENvbHVtbnMgVG9vbCBQYW5lbCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBub3QgaW5jbHVkZSB0aGlzIGNvbHVtbiAvIGZpbHRlciBpbiB0aGUgRmlsdGVycyBUb29sIFBhbmVsICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbHRlcnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIE9wZW4gYnkgRGVmYXVsdCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3BlbkJ5RGVmYXVsdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgdHJ1ZSwgZ3JvdXAgY2Fubm90IGJlIGJyb2tlbiB1cCBieSBjb2x1bW4gbW92aW5nLCBjaGlsZCBjb2x1bW5zIHdpbGwgYWx3YXlzIGFwcGVhciBzaWRlIGJ5IHNpZGUsIGhvd2V2ZXIgeW91IGNhbiByZWFycmFuZ2UgY2hpbGQgY29sdW1ucyB3aXRoaW4gdGhlIGdyb3VwICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXJyeUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSBmb3IgdGhpcyBjb2x1bW4gdG8gYmUgaGlkZGVuLiBOYXR1cmFsbHkgeW91IG1pZ2h0IHRoaW5rLCBpdCB3b3VsZCBtYWtlIG1vcmUgc2Vuc2UgdG8gY2FsbCB0aGlzIGZpZWxkICd2aXNpYmxlJyBhbmQgbWFyayBpdCBmYWxzZSB0byBoaWRlLFxuICAgICAqIGhvd2V2ZXIgd2Ugd2FudCBhbGwgZGVmYXVsdCB2YWx1ZXMgdG8gYmUgZmFsc2UgYW5kIHdlIHdhbnQgY29sdW1ucyB0byBiZSB2aXNpYmxlIGJ5IGRlZmF1bHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsSGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gcmVuZGVyIGEgc2VsZWN0aW9uIGNoZWNrYm94IGluIHRoZSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IENoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2sgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIHRydWUsIGEgJ3NlbGVjdCBhbGwnIGNoZWNrYm94IHdpbGwgYmUgcHV0IGludG8gdGhlIGhlYWRlciAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IGJvb2xlYW4gfCBIZWFkZXJDaGVja2JveFNlbGVjdGlvbkNhbGxiYWNrIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiB0cnVlLCB0aGUgaGVhZGVyIGNoZWNrYm94IHNlbGVjdGlvbiB3aWxsIHdvcmsgb24gZmlsdGVyZWQgaXRlbXMgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSBpZiBubyBtZW51IHNob3VsZCBiZSBzaG93biBmb3IgdGhpcyBjb2x1bW4gaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBub3QgYWxsb3cgbW92aW5nIHRoaXMgY29sdW1uIHZpYSBkcmFnZ2luZyBpdCdzIGhlYWRlciAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBtYWtlIHN1cmUgdGhpcyBjb2x1bW4gaXMgYWx3YXlzIGZpcnN0LiBPdGhlciBjb2x1bW5zLCBpZiBtb3ZhYmxlLCBjYW5ub3QgbW92ZSBiZWZvcmUgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUG9zaXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGJsb2NrIHRoZSB1c2VyIHNob3dpbmcgLyBoaWRpbmcgdGhlIGNvbHVtbiwgdGhlIGNvbHVtbiBjYW4gb25seSBiZSBzaG93biAvIGhpZGRlbiB2aWEgZGVmaW5pdGlvbnMgb3IgQVBJICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrVmlzaWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gYmxvY2sgdGhlIHVzZXIgcGlubmluZyB0aGUgY29sdW1uLCB0aGUgY29sdW1uIGNhbiBvbmx5IGJlIHBpbm5lZCB2aWEgZGVmaW5pdGlvbnMgb3IgQVBJICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NrUGlubmVkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSBpZiB5b3Ugd2FudCB0aGUgdW5zb3J0ZWQgaWNvbiB0byBiZSBzaG93biB3aGVuIG5vIHNvcnQgaXMgYXBwbGllZCB0byB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuU29ydEljb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIGlmIHlvdSB3YW50IHRoaXMgY29sdW1ucyB3aWR0aCB0byBiZSBmaXhlZCBkdXJpbmcgJ3NpemUgdG8gZml0JyBvcGVyYXRpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NpemVUb0ZpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIHRvIGJlIGF1dG8tcmVzaXphYmxlIGJ5IGRvdWJsZSBjbGlja2luZyBpdCdzIGVkZ2UuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiB0cnVlLCBHVUkgd2lsbCBhbGxvdyBhZGRpbmcgdGhpcyBjb2x1bW5zIGFzIGEgcm93IGdyb3VwICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgdHJ1ZSwgR1VJIHdpbGwgYWxsb3cgYWRkaW5nIHRoaXMgY29sdW1ucyBhcyBhIHBpdm90ICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVQaXZvdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgdHJ1ZSwgR1VJIHdpbGwgYWxsb3cgYWRkaW5nIHRoaXMgY29sdW1ucyBhcyBhIHZhbHVlICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVWYWx1ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgaWYgdGhpcyBjb2wgaXMgZWRpdGFibGUsIG90aGVyd2lzZSBmYWxzZS4gQ2FuIGFsc28gYmUgYSBmdW5jdGlvbiB0byBoYXZlIGRpZmZlcmVudCByb3dzIGVkaXRhYmxlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdGFibGU6IGJvb2xlYW4gfCBFZGl0YWJsZUNhbGxiYWNrIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSBpZiB0aGlzIGNvbCBzaG91bGQgbm90IGJlIGFsbG93ZWQgdGFrZSBuZXcgdmFsdWVzIGZyb20gdGhlIGNsaXBib2FyZCAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Bhc3RlOiBib29sZWFuIHwgU3VwcHJlc3NQYXN0ZUNhbGxiYWNrIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSBpZiB0aGlzIGNvbCBzaG91bGQgbm90IGJlIG5hdmlnYWJsZSB3aXRoIHRoZSB0YWIga2V5LiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRvIGhhdmUgZGlmZmVyZW50IHJvd3MgZWRpdGFibGUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05hdmlnYWJsZTogYm9vbGVhbiB8IFN1cHByZXNzTmF2aWdhYmxlQ2FsbGJhY2sgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIHRydWUsIGdyaWQgd2lsbCBmbGFzaCBjZWxsIGFmdGVyIGNlbGwgaXMgcmVmcmVzaGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBncmlkIHJvdyBkcmFnZ2luZywgc2V0IHRvIHRydWUgdG8gZW5hYmxlIHJvdyBkcmFnZ2luZyB3aXRoaW4gdGhlIGdyaWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWc6IGJvb2xlYW4gfCBSb3dEcmFnQ2FsbGJhY2sgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBuYXRpdmUgZHJhZyBhbmQgZHJvcCwgc2V0IHRvIHRydWUgdG8gZW5hYmxlIGRyYWcgc291cmNlICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2U6IGJvb2xlYW4gfCBEbmRTb3VyY2VDYWxsYmFjayB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVHJ1ZSBpZiB0aGlzIGNvbHVtbiBzaG91bGQgc3RyZXRjaCByb3dzIGhlaWdodCB0byBmaXQgY29udGVudHMgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGF1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRydWUgaWYgdGhpcyBjb2x1bW4gc2hvdWxkIHdyYXAgY2VsbCBjb250ZW50cyAtIHR5cGljYWxseSB1c2VkIHdpdGggYXV0b0hlaWdodCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgd3JhcFRleHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIGlmIHNvcnRpbmcgYWxsb3dlZCBmb3IgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0YWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgaWYgdGhpcyBjb2x1bW4gc2hvdWxkIGJlIHJlc2l6YWJsZSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVzaXphYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiB0cnVlLCB0aGlzIGNlbGwgd2lsbCBiZSBpbiBlZGl0aW5nIG1vZGUgYWZ0ZXIgZmlyc3QgY2xpY2suICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZXRoZXIgdG8gZGlzcGxheSBhIGZsb2F0aW5nIGZpbHRlciBmb3IgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBvcHVwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8vIEBFTkRAXG5cbn1cbiJdfQ==