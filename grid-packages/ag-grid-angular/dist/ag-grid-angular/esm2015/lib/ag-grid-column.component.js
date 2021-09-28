var AgGridColumn_1;
import { __decorate, __metadata, __rest } from "tslib";
import { Component, ContentChildren, Input, QueryList } from "@angular/core";
let AgGridColumn = AgGridColumn_1 = class AgGridColumn {
    constructor() {
        // inputs - pretty much most of ColDef, with the exception of template, templateUrl and internal only properties
        // @START@
        this.filterFramework = undefined;
        this.filterParams = undefined;
        this.floatingFilterComponent = undefined;
        this.floatingFilterComponentParams = undefined;
        this.floatingFilterComponentFramework = undefined;
        this.filter = undefined;
        /** The name to render in the column header. If not specified and field is specified, the field name will be used as the header name.     */
        this.headerName = undefined;
        /** Function or expression. Gets the value for display in the header.     */
        this.headerValueGetter = undefined;
        /** Whether to show the column when the group is open / closed.     */
        /** Tooltip for the column header     */
        this.headerTooltip = undefined;
        /** CSS class to use for the header cell. Can be a string, array of strings, or function.     */
        this.headerClass = undefined;
        /** Suppress the grid taking action for the relevant keyboard event when a header is focused.     */
        this.suppressHeaderKeyboardEvent = undefined;
        /** Whether to show the column when the group is open / closed.     */
        this.columnGroupShow = undefined;
        /** CSS class to use for the tool panel cell. Can be a string, array of strings, or function.     */
        this.toolPanelClass = undefined;
        /** Set to `true` if you do not want this column or group to appear in the Columns Tool Panel.     */
        this.suppressColumnsToolPanel = undefined;
        /** Set to `true` if you do not want this column (filter) or group (filter group) to appear in the Filters Tool Panel.     */
        this.suppressFiltersToolPanel = undefined;
        this.tooltipComponent = undefined;
        this.tooltipComponentFramework = undefined;
        this.tooltipComponentParams = undefined;
        /** A list containing a mix of columns and column groups.     */
        this.children = undefined;
        /** The unique ID to give the column. This is optional. If missing, a unique ID will be generated. This ID is used to identify the column group in the column API.     */
        this.groupId = undefined;
        /** Set to `true` if this group should be opened by default.     */
        this.openByDefault = undefined;
        /** Set to `true` to keep columns in this group beside each other in the grid. Moving the columns outside of the group (and hence breaking the group) is not allowed.     */
        this.marryChildren = undefined;
        /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used*     */
        this.headerGroupComponent = undefined;
        /** The custom header group component to be used for rendering the component header in the hosting framework (ie: Angular/React/VueJs). If none specified the default AG Grid is used*     */
        this.headerGroupComponentFramework = undefined;
        /** The params used to configure the header group component.     *     */
        this.headerGroupComponentParams = undefined;
        /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
         * If both field and colId are missing, a unique ID will be generated.
         * This ID is used to identify the column in the API for sorting, filtering etc.     */
        this.colId = undefined;
        /** The field of the row to get the cells data from     */
        this.field = undefined;
        /** A comma separated string or array of strings containing `ColumnType` keys which can be used as a template for a column.
         * This helps to reduce duplication of properties when you have a lot of common column properties.     */
        this.type = undefined;
        /** Function or expression. Gets the value from your data for display.     */
        this.valueGetter = undefined;
        /** A function or expression to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering.     */
        this.valueFormatter = undefined;
        /** Provided a reference data map to be used to map column values to their respective value from the map.     */
        this.refData = undefined;
        /** Function to return a string key for a value.
         * This string is used for grouping, Set filtering, and searching within cell editor dropdowns.
         * When filtering and searching the string is exposed to the user, so make sure to return a human-readable value.     */
        this.keyCreator = undefined;
        /** Custom comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed.
         * By default the grid uses `===` is used which should work for most use cases.     */
        this.equals = undefined;
        /** The field of the tooltip to apply to the cell.     */
        this.tooltipField = undefined;
        /** Callback that should return the string used for a tooltip, `tooltipField` takes precedence if set.     */
        this.tooltipValueGetter = undefined;
        /** `boolean` or `Function`. Set to `true` (or return `true` from function) to render a selection checkbox in the column.     */
        this.checkboxSelection = undefined;
        /** Icons to use inside the column instead of the grid's default icons. Leave undefined to use defaults.     */
        this.icons = undefined;
        /** Set to `true` if this column is not navigable (i.e. cannot be tabbed into), otherwise `false`.
         * Can also be a callback function to have different rows navigable.     */
        this.suppressNavigable = undefined;
        /** Allows the user to suppress certain keyboard events in the grid cell     */
        this.suppressKeyboardEvent = undefined;
        /** Pasting is on by default as long as cells are editable (non-editable cells cannot be modified, even with a paste operation).
         * Set to `true` turn paste operations off.     */
        this.suppressPaste = undefined;
        /** Set to true to prevent the fillHandle from being rendered in any cell that belongs to this column     */
        this.suppressFillHandle = undefined;
        /** Set to `true` for this column to be hidden.     */
        this.hide = undefined;
        /** Same as 'hide', except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialHide = undefined;
        /** Set to `true` to block making column visible / hidden via the UI (API will still work).     */
        this.lockVisible = undefined;
        /** Set to `true` to always have this column displayed first.     */
        this.lockPosition = undefined;
        /** Set to `true` if you do not want this column to be movable via dragging.     */
        this.suppressMovable = undefined;
        /** Set to `true` if this column is editable, otherwise `false`. Can also be a function to have different rows editable.     */
        this.editable = undefined;
        /** Function or expression. Sets the value into your data for saving. Return `true` if the data changed.     */
        this.valueSetter = undefined;
        /** Function or expression. Parses the value for saving.     */
        this.valueParser = undefined;
        /** A `cellEditor` to use for this column.     */
        this.cellEditor = undefined;
        /** Framework `cellEditor` to use for this column.     */
        this.cellEditorFramework = undefined;
        /** Params to be passed to the cell editor component.     */
        this.cellEditorParams = undefined;
        /** Callback to select which cell editor to be used for a given row within the same column.     */
        this.cellEditorSelector = undefined;
        /** Set to `true` to have cells under this column enter edit mode after single click.     */
        this.singleClickEdit = undefined;
        /** @deprecated use `valueSetter` instead
         */
        this.newValueHandler = undefined;
        /** Set to `true`, to have the cell editor appear in a popup.     */
        this.cellEditorPopup = undefined;
        /** Set the position for the popup cell editor. Possible values are
         *   - `over` Popup will be positioned over the cell
         *   - `under` Popup will be positioned below the cell leaving the cell value visible.
         *
         * The default is `over`.     */
        this.cellEditorPopupPosition = undefined;
        /** Callback for after the value of a cell has changed, either due to editing or the application calling `api.setValue()`.     */
        this.onCellValueChanged = undefined;
        /** Callback called when a cell is clicked.     */
        this.onCellClicked = undefined;
        /** Callback called when a cell is double clicked.     */
        this.onCellDoubleClicked = undefined;
        /** Callback called when a cell is right clicked.     */
        this.onCellContextMenu = undefined;
        /** A function to tell the grid what quick filter text to use for this column if you don't want to use the default (which is calling `toString` on the value).     */
        this.getQuickFilterText = undefined;
        /** Function or expression. Gets the value for filtering purposes.     */
        this.filterValueGetter = undefined;
        /** Whether to display a floating filter for this column.     */
        this.floatingFilter = undefined;
        /** The custom header component to be used for rendering the component header. If none specified the default AG Grid header component is used.     *     */
        this.headerComponent = undefined;
        /** The custom header component to be used for rendering the component header in the hosting framework (ie: Angular/React/VueJs). If none specified the default AG Grid header component is used*     */
        this.headerComponentFramework = undefined;
        /** The parameters to be passed to the header component.     *     */
        this.headerComponentParams = undefined;
        /** Set to an array containing zero, one or many of the following options: `'filterMenuTab' | 'generalMenuTab' | 'columnsMenuTab'`.
         * This is used to figure out which menu tabs are present and in which order the tabs are shown.     */
        this.menuTabs = undefined;
        /** Params used to change the behaviour and appearance of the Columns Menu tab.     */
        this.columnsMenuParams = undefined;
        /** Set to `true` if no menu should be shown for this column header.     */
        this.suppressMenu = undefined;
        /** If `true` or the callback returns `true`, a 'select all' checkbox will be put into the header.     */
        this.headerCheckboxSelection = undefined;
        /** If `true`, the header checkbox selection will only select filtered items.     */
        this.headerCheckboxSelectionFilteredOnly = undefined;
        /** Defines the chart data type that should be used for a column.     */
        this.chartDataType = undefined;
        /** Pin a column to one side: `right` or `left`. A value of `true` is converted to `'left'`.     */
        this.pinned = undefined;
        /** Same as 'pinned', except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialPinned = undefined;
        /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API     */
        this.lockPinned = undefined;
        /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
         */
        this.pinnedRowCellRenderer = undefined;
        /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
         */
        this.pinnedRowCellRendererFramework = undefined;
        /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned.
         */
        this.pinnedRowCellRendererParams = undefined;
        /** @deprecated Use valueFormatter for pinned rows, and check params.node.rowPinned.
         */
        this.pinnedRowValueFormatter = undefined;
        /** Set to true to pivot by this column.     */
        this.pivot = undefined;
        /** Same as 'pivot', except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialPivot = undefined;
        /** Set this in columns you want to pivot by.
         * If only pivoting by one column, set this to any number (e.g. `0`).
         * If pivoting by multiple columns, set this to where you want this column to be in the order of pivots (e.g. `0` for first, `1` for second, and so on).     */
        this.pivotIndex = undefined;
        /** Same as 'pivotIndex', except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialPivotIndex = undefined;
        /** Comparator to use when ordering the pivot columns, when this column is used to pivot on.
         * The values will always be strings, as the pivot service uses strings as keys for the pivot groups.     */
        this.pivotComparator = undefined;
        /** Set to `true` if you want to be able to pivot by this column via the GUI. This will not block the API or properties being used to achieve pivot.     */
        this.enablePivot = undefined;
        /** An object of css values / or function returning an object of css values for a particular cell.     */
        this.cellStyle = undefined;
        /** Class to use for the cell. Can be string, array of strings, or function that returns a string or array of strings.     */
        this.cellClass = undefined;
        /** Rules which can be applied to include certain CSS classes.     */
        this.cellClassRules = undefined;
        /** A `cellRenderer` to use for this column.     */
        this.cellRenderer = undefined;
        /** Framework `cellRenderer` to use for this column.     */
        this.cellRendererFramework = undefined;
        /** Params to be passed to the cell renderer component.     */
        this.cellRendererParams = undefined;
        /** Callback to select which cell renderer to be used for a given row within the same column.     */
        this.cellRendererSelector = undefined;
        /** Set to `true` to have the grid calculate the height of a row based on contents of this column.     */
        this.autoHeight = undefined;
        /** Set to `true` to have the text wrap inside the cell - typically used with `autoHeight`.     */
        this.wrapText = undefined;
        /** Set to `true` to flash a cell when it's refreshed.     */
        this.enableCellChangeFlash = undefined;
        /** Set to `true` to prevent this column from flashing on changes. Only applicable if cell flashing is turned on for the grid.     */
        this.suppressCellFlash = undefined;
        /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow row dragging.     */
        this.rowDrag = undefined;
        /** A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
         * If this callback is not set, the current cell value will be used.     */
        this.rowDragText = undefined;
        /** `boolean` or `Function`. Set to `true` (or return `true` from function) to allow dragging for native drag and drop.     */
        this.dndSource = undefined;
        /** Function to allow custom drag functionality for native drag and drop.     */
        this.dndSourceOnRowDrag = undefined;
        /** Set to `true` to row group by this column.     */
        this.rowGroup = undefined;
        /** Same as 'rowGroup', except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialRowGroup = undefined;
        /** Set this in columns you want to group by.
         * If only grouping by one column, set this to any number (e.g. `0`).
         * If grouping by multiple columns, set this to where you want this column to be in the group (e.g. `0` for first, `1` for second, and so on).     */
        this.rowGroupIndex = undefined;
        /** Same as 'rowGroupIndex', except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialRowGroupIndex = undefined;
        /** Set to `true` if you want to be able to row group by this column via the GUI.
         * This will not block the API or properties being used to achieve row grouping.     */
        this.enableRowGroup = undefined;
        /** Set to `true` if you want to be able to aggregate by this column via the GUI.
         * This will not block the API or properties being used to achieve aggregation.     */
        this.enableValue = undefined;
        /** Name of function to use for aggregation. You can also provide your own agg function.     */
        this.aggFunc = undefined;
        /** Same as 'aggFunc', except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialAggFunc = undefined;
        /** Aggregation functions allowed on this column e.g. `['sum', 'avg']`.
         * If missing, all installed functions are allowed.
         * This will only restrict what the GUI allows a user to select, it does not impact when you set a function via the API.     */
        this.allowedAggFuncs = undefined;
        /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group.     */
        this.showRowGroup = undefined;
        /** Set to `true` to allow sorting on this column.     */
        this.sortable = undefined;
        /** If sorting by default, set it here. Set to 'asc' or 'desc'.     */
        this.sort = undefined;
        /** Same as `sort`, except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialSort = undefined;
        /** If sorting more than one column by default, specifies order in which the sorting should be applied.     */
        this.sortIndex = undefined;
        /** Same as 'sortIndex', except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialSortIndex = undefined;
        /** Array defining the order in which sorting occurs (if sorting is enabled). An array with any of the following in any order ['asc','desc',null]     */
        this.sortingOrder = undefined;
        /** Comparator function for custom sorting.     */
        this.comparator = undefined;
        /** Set to `true` if you want the unsorted icon to be shown when no sort is applied to this column.     */
        this.unSortIcon = undefined;
        /** @deprecated since v24 - use sortIndex instead
         */
        this.sortedAt = undefined;
        /** By default, each cell will take up the width of one column. You can change this behaviour to allow cells to span multiple columns.     */
        this.colSpan = undefined;
        /** By default, each cell will take up the height of one row. You can change this behaviour to allow cells to span multiple rows.     */
        this.rowSpan = undefined;
        /** Initial width in pixels for the cell.     */
        this.width = undefined;
        /** Same as 'width', except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialWidth = undefined;
        /** Minimum width in pixels for the cell.     */
        this.minWidth = undefined;
        /** Maximum width in pixels for the cell.     */
        this.maxWidth = undefined;
        /** Used instead of `width` when the goal is to fill the remaining empty space of the grid.     */
        this.flex = undefined;
        /** Same as 'flex', except only applied when creating a new column. Not applied when updating column definitions.     */
        this.initialFlex = undefined;
        /** Set to `true` to allow this column should be resized.     */
        this.resizable = undefined;
        /** Set to `true` if you want this column's width to be fixed during 'size to fit' operations.     */
        this.suppressSizeToFit = undefined;
        /** Set to `true` if you do not want this column to be auto-resizable by double clicking it's edge.     */
        this.suppressAutoSize = undefined;
        // @END@
    }
    hasChildColumns() {
        if (this.childColumns && this.childColumns.length > 0) {
            // necessary because of https://github.com/angular/angular/issues/10098
            return !(this.childColumns.length === 1 && this.childColumns.first === this);
        }
        return false;
    }
    toColDef() {
        let colDef = this.createColDefFromGridColumn(this);
        if (this.hasChildColumns()) {
            colDef["children"] = this.getChildColDefs(this.childColumns);
        }
        return colDef;
    }
    getChildColDefs(childColumns) {
        return childColumns
            // necessary because of https://github.com/angular/angular/issues/10098
            .filter(column => !column.hasChildColumns())
            .map((column) => {
            return column.toColDef();
        });
    }
    createColDefFromGridColumn(from) {
        let { childColumns } = from, colDef = __rest(from, ["childColumns"]);
        return colDef;
    }
};
__decorate([
    ContentChildren(AgGridColumn_1),
    __metadata("design:type", QueryList)
], AgGridColumn.prototype, "childColumns", void 0);
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
], AgGridColumn.prototype, "filter", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "headerName", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerValueGetter", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "headerTooltip", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerClass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "suppressHeaderKeyboardEvent", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "columnGroupShow", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "toolPanelClass", void 0);
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "tooltipComponent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "tooltipComponentFramework", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "tooltipComponentParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AgGridColumn.prototype, "children", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "groupId", void 0);
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
    __metadata("design:type", String)
], AgGridColumn.prototype, "colId", void 0);
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "valueGetter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "valueFormatter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "refData", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "keyCreator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "equals", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "tooltipField", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "tooltipValueGetter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "checkboxSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "icons", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressNavigable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "suppressKeyboardEvent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressPaste", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressFillHandle", void 0);
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
], AgGridColumn.prototype, "lockVisible", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "lockPosition", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressMovable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "editable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "valueSetter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "valueParser", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellEditor", void 0);
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
    __metadata("design:type", Function)
], AgGridColumn.prototype, "cellEditorSelector", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "singleClickEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "newValueHandler", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "cellEditorPopup", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridColumn.prototype, "cellEditorPopupPosition", void 0);
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
], AgGridColumn.prototype, "getQuickFilterText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "filterValueGetter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "floatingFilter", void 0);
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
    __metadata("design:type", Array)
], AgGridColumn.prototype, "menuTabs", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "columnsMenuParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressMenu", void 0);
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
    __metadata("design:type", String)
], AgGridColumn.prototype, "chartDataType", void 0);
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
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "lockPinned", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "pinnedRowCellRenderer", void 0);
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
], AgGridColumn.prototype, "pinnedRowValueFormatter", void 0);
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
    __metadata("design:type", Number)
], AgGridColumn.prototype, "pivotIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "initialPivotIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "pivotComparator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "enablePivot", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellStyle", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellClass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellClassRules", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellRenderer", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellRendererFramework", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellRendererParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "cellRendererSelector", void 0);
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
], AgGridColumn.prototype, "enableCellChangeFlash", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressCellFlash", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "rowDrag", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "rowDragText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "dndSource", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "dndSourceOnRowDrag", void 0);
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
    __metadata("design:type", Number)
], AgGridColumn.prototype, "rowGroupIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "initialRowGroupIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "enableRowGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "enableValue", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "aggFunc", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "initialAggFunc", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AgGridColumn.prototype, "allowedAggFuncs", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "showRowGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "sortable", void 0);
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
    __metadata("design:type", Number)
], AgGridColumn.prototype, "sortIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "initialSortIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Array)
], AgGridColumn.prototype, "sortingOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Function)
], AgGridColumn.prototype, "comparator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "unSortIcon", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "sortedAt", void 0);
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
], AgGridColumn.prototype, "flex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], AgGridColumn.prototype, "initialFlex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "resizable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressSizeToFit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridColumn.prototype, "suppressAutoSize", void 0);
AgGridColumn = AgGridColumn_1 = __decorate([
    Component({
        selector: 'ag-grid-column',
        template: ''
    })
], AgGridColumn);
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vYWctZ3JpZC1hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFNN0UsSUFBYSxZQUFZLG9CQUF6QixNQUFhLFlBQVk7SUFBekI7UUFrQ0ksZ0hBQWdIO1FBQ2hILFVBQVU7UUFDTSxvQkFBZSxHQUFRLFNBQVMsQ0FBQztRQUNqQyxpQkFBWSxHQUFRLFNBQVMsQ0FBQztRQUM5Qiw0QkFBdUIsR0FBUSxTQUFTLENBQUM7UUFDekMsa0NBQTZCLEdBQVEsU0FBUyxDQUFDO1FBQy9DLHFDQUFnQyxHQUFRLFNBQVMsQ0FBQztRQUNsRCxXQUFNLEdBQVEsU0FBUyxDQUFDO1FBQ3hDLDRJQUE0STtRQUM1SCxlQUFVLEdBQXVCLFNBQVMsQ0FBQztRQUMzRCw0RUFBNEU7UUFDNUQsc0JBQWlCLEdBQStDLFNBQVMsQ0FBQztRQUMxRixzRUFBc0U7UUFDMUUsd0NBQXdDO1FBQ3BCLGtCQUFhLEdBQXVCLFNBQVMsQ0FBQztRQUM5RCxnR0FBZ0c7UUFDaEYsZ0JBQVcsR0FBNEIsU0FBUyxDQUFDO1FBQ2pFLG9HQUFvRztRQUNwRixnQ0FBMkIsR0FBeUUsU0FBUyxDQUFDO1FBQzlILHNFQUFzRTtRQUN0RCxvQkFBZSxHQUF1QixTQUFTLENBQUM7UUFDaEUsb0dBQW9HO1FBQ3BGLG1CQUFjLEdBQStCLFNBQVMsQ0FBQztRQUN2RSxxR0FBcUc7UUFDckYsNkJBQXdCLEdBQXdCLFNBQVMsQ0FBQztRQUMxRSw2SEFBNkg7UUFDN0csNkJBQXdCLEdBQXdCLFNBQVMsQ0FBQztRQUMxRCxxQkFBZ0IsR0FBa0QsU0FBUyxDQUFDO1FBQzVFLDhCQUF5QixHQUFRLFNBQVMsQ0FBQztRQUMz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OzZDQUE2RTtBQUU1RTtJQUFSLEtBQUssRUFBRTs7NkNBQTZFO0FBRTVFO0lBQVIsS0FBSyxFQUFFOzsyQ0FBOEM7QUFFN0M7SUFBUixLQUFLLEVBQUU7O2tEQUFxRDtBQUVwRDtJQUFSLEtBQUssRUFBRTs7OENBQWlEO0FBRWhEO0lBQVIsS0FBSyxFQUFFOzs4Q0FBaUQ7QUFFaEQ7SUFBUixLQUFLLEVBQUU7OzBDQUE2QztBQUU1QztJQUFSLEtBQUssRUFBRTs7aURBQW9EO0FBRW5EO0lBQVIsS0FBSyxFQUFFOzsrQ0FBbUQ7QUFFbEQ7SUFBUixLQUFLLEVBQUU7O3VEQUEyRDtBQUUxRDtJQUFSLEtBQUssRUFBRTs7c0RBQTBEO0FBOVR6RCxZQUFZO0lBSnhCLFNBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsUUFBUSxFQUFFLEVBQUU7S0FDZixDQUFDO0dBQ1csWUFBWSxDQTRXeEI7U0E1V1ksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENlbGxDbGFzc0Z1bmMsIENlbGxDbGFzc1J1bGVzLCBDZWxsQ2xpY2tlZEV2ZW50LCBDZWxsQ29udGV4dE1lbnVFdmVudCwgQ2VsbERvdWJsZUNsaWNrZWRFdmVudCwgQ2VsbEVkaXRvclNlbGVjdG9yRnVuYywgQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jLCBDZWxsU3R5bGUsIENlbGxTdHlsZUZ1bmMsIENoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2ssIENvbERlZiwgQ29sR3JvdXBEZWYsIENvbFNwYW5QYXJhbXMsIENvbHVtbnNNZW51UGFyYW1zLCBEbmRTb3VyY2VDYWxsYmFjaywgRWRpdGFibGVDYWxsYmFjaywgR2V0UXVpY2tGaWx0ZXJUZXh0UGFyYW1zLCBIZWFkZXJDaGVja2JveFNlbGVjdGlvbkNhbGxiYWNrLCBIZWFkZXJDbGFzcywgSGVhZGVyVmFsdWVHZXR0ZXJGdW5jLCBJQWdnRnVuYywgSUNlbGxFZGl0b3JDb21wLCBJQ2VsbFJlbmRlcmVyQ29tcCwgSUNlbGxSZW5kZXJlckZ1bmMsIElIZWFkZXJHcm91cENvbXAsIElSb3dEcmFnSXRlbSwgSVRvb2x0aXBDb21wLCBJVG9vbHRpcFBhcmFtcywgS2V5Q3JlYXRvclBhcmFtcywgTmV3VmFsdWVQYXJhbXMsIFJvd0RyYWdDYWxsYmFjaywgUm93Tm9kZSwgUm93U3BhblBhcmFtcywgU3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50UGFyYW1zLCBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXMsIFN1cHByZXNzTmF2aWdhYmxlQ2FsbGJhY2ssIFN1cHByZXNzUGFzdGVDYWxsYmFjaywgVG9vbFBhbmVsQ2xhc3MsIFZhbHVlRm9ybWF0dGVyRnVuYywgVmFsdWVHZXR0ZXJGdW5jLCBWYWx1ZVBhcnNlckZ1bmMsIFZhbHVlU2V0dGVyRnVuYyB9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuaW1wb3J0IHsgQ29tcG9uZW50LCBDb250ZW50Q2hpbGRyZW4sIElucHV0LCBRdWVyeUxpc3QgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtY29sdW1uJyxcbiAgICB0ZW1wbGF0ZTogJydcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQ29sdW1uIHtcbiAgICBAQ29udGVudENoaWxkcmVuKEFnR3JpZENvbHVtbikgcHVibGljIGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBwdWJsaWMgaGFzQ2hpbGRDb2x1bW5zKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5jaGlsZENvbHVtbnMgJiYgdGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIHJldHVybiAhKHRoaXMuY2hpbGRDb2x1bW5zLmxlbmd0aCA9PT0gMSAmJiB0aGlzLmNoaWxkQ29sdW1ucy5maXJzdCA9PT0gdGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b0NvbERlZigpOiBDb2xEZWYge1xuICAgICAgICBsZXQgY29sRGVmOiBDb2xEZWYgPSB0aGlzLmNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKHRoaXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmhhc0NoaWxkQ29sdW1ucygpKSB7XG4gICAgICAgICAgICAoPGFueT5jb2xEZWYpW1wiY2hpbGRyZW5cIl0gPSB0aGlzLmdldENoaWxkQ29sRGVmcyh0aGlzLmNoaWxkQ29sdW1ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbERlZjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldENoaWxkQ29sRGVmcyhjaGlsZENvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+KSB7XG4gICAgICAgIHJldHVybiBjaGlsZENvbHVtbnNcbiAgICAgICAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzEwMDk4XG4gICAgICAgICAgICAuZmlsdGVyKGNvbHVtbiA9PiAhY29sdW1uLmhhc0NoaWxkQ29sdW1ucygpKVxuICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZUNvbERlZkZyb21HcmlkQ29sdW1uKGZyb206IEFnR3JpZENvbHVtbik6IENvbERlZiB7XG4gICAgICAgIGxldCB7IGNoaWxkQ29sdW1ucywgLi4uY29sRGVmIH0gPSBmcm9tO1xuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIC8vIGlucHV0cyAtIHByZXR0eSBtdWNoIG1vc3Qgb2YgQ29sRGVmLCB3aXRoIHRoZSBleGNlcHRpb24gb2YgdGVtcGxhdGUsIHRlbXBsYXRlVXJsIGFuZCBpbnRlcm5hbCBvbmx5IHByb3BlcnRpZXNcbiAgICAvLyBAU1RBUlRAXG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBuYW1lIHRvIHJlbmRlciBpbiB0aGUgY29sdW1uIGhlYWRlci4gSWYgbm90IHNwZWNpZmllZCBhbmQgZmllbGQgaXMgc3BlY2lmaWVkLCB0aGUgZmllbGQgbmFtZSB3aWxsIGJlIHVzZWQgYXMgdGhlIGhlYWRlciBuYW1lLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBHZXRzIHRoZSB2YWx1ZSBmb3IgZGlzcGxheSBpbiB0aGUgaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVmFsdWVHZXR0ZXI6IHN0cmluZyB8IEhlYWRlclZhbHVlR2V0dGVyRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hldGhlciB0byBzaG93IHRoZSBjb2x1bW4gd2hlbiB0aGUgZ3JvdXAgaXMgb3BlbiAvIGNsb3NlZC4gICAgICovXG4vKiogVG9vbHRpcCBmb3IgdGhlIGNvbHVtbiBoZWFkZXIgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlclRvb2x0aXA6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzIHRvIHVzZSBmb3IgdGhlIGhlYWRlciBjZWxsLiBDYW4gYmUgYSBzdHJpbmcsIGFycmF5IG9mIHN0cmluZ3MsIG9yIGZ1bmN0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2xhc3M6IEhlYWRlckNsYXNzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTdXBwcmVzcyB0aGUgZ3JpZCB0YWtpbmcgYWN0aW9uIGZvciB0aGUgcmVsZXZhbnQga2V5Ym9hcmQgZXZlbnQgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50OiAoKHBhcmFtczogU3VwcHJlc3NIZWFkZXJLZXlib2FyZEV2ZW50UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hldGhlciB0byBzaG93IHRoZSBjb2x1bW4gd2hlbiB0aGUgZ3JvdXAgaXMgb3BlbiAvIGNsb3NlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkdyb3VwU2hvdzogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MgdG8gdXNlIGZvciB0aGUgdG9vbCBwYW5lbCBjZWxsLiBDYW4gYmUgYSBzdHJpbmcsIGFycmF5IG9mIHN0cmluZ3MsIG9yIGZ1bmN0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbFBhbmVsQ2xhc3M6IFRvb2xQYW5lbENsYXNzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiBvciBncm91cCB0byBhcHBlYXIgaW4gdGhlIENvbHVtbnMgVG9vbCBQYW5lbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gKGZpbHRlcikgb3IgZ3JvdXAgKGZpbHRlciBncm91cCkgdG8gYXBwZWFyIGluIHRoZSBGaWx0ZXJzIFRvb2wgUGFuZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbHRlcnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnQ6IHsgbmV3KCk6IElUb29sdGlwQ29tcDsgfSB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudEZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbGlzdCBjb250YWluaW5nIGEgbWl4IG9mIGNvbHVtbnMgYW5kIGNvbHVtbiBncm91cHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGlsZHJlbjogKENvbERlZiB8IENvbEdyb3VwRGVmKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgdW5pcXVlIElEIHRvIGdpdmUgdGhlIGNvbHVtbi4gVGhpcyBpcyBvcHRpb25hbC4gSWYgbWlzc2luZywgYSB1bmlxdWUgSUQgd2lsbCBiZSBnZW5lcmF0ZWQuIFRoaXMgSUQgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgY29sdW1uIGdyb3VwIGluIHRoZSBjb2x1bW4gQVBJLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHRoaXMgZ3JvdXAgc2hvdWxkIGJlIG9wZW5lZCBieSBkZWZhdWx0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3BlbkJ5RGVmYXVsdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBrZWVwIGNvbHVtbnMgaW4gdGhpcyBncm91cCBiZXNpZGUgZWFjaCBvdGhlciBpbiB0aGUgZ3JpZC4gTW92aW5nIHRoZSBjb2x1bW5zIG91dHNpZGUgb2YgdGhlIGdyb3VwIChhbmQgaGVuY2UgYnJlYWtpbmcgdGhlIGdyb3VwKSBpcyBub3QgYWxsb3dlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1hcnJ5Q2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBjdXN0b20gaGVhZGVyIGdyb3VwIGNvbXBvbmVudCB0byBiZSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGNvbXBvbmVudCBoZWFkZXIuIElmIG5vbmUgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IEFHIEdyaWQgaXMgdXNlZCogICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50OiBzdHJpbmcgfCB7IG5ldygpOiBJSGVhZGVyR3JvdXBDb21wOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgY3VzdG9tIGhlYWRlciBncm91cCBjb21wb25lbnQgdG8gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQgaGVhZGVyIGluIHRoZSBob3N0aW5nIGZyYW1ld29yayAoaWU6IEFuZ3VsYXIvUmVhY3QvVnVlSnMpLiBJZiBub25lIHNwZWNpZmllZCB0aGUgZGVmYXVsdCBBRyBHcmlkIGlzIHVzZWQqICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudEZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgcGFyYW1zIHVzZWQgdG8gY29uZmlndXJlIHRoZSBoZWFkZXIgZ3JvdXAgY29tcG9uZW50LiAgICAgKiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIHVuaXF1ZSBJRCB0byBnaXZlIHRoZSBjb2x1bW4uIFRoaXMgaXMgb3B0aW9uYWwuIElmIG1pc3NpbmcsIHRoZSBJRCB3aWxsIGRlZmF1bHQgdG8gdGhlIGZpZWxkLlxuICAgICAqIElmIGJvdGggZmllbGQgYW5kIGNvbElkIGFyZSBtaXNzaW5nLCBhIHVuaXF1ZSBJRCB3aWxsIGJlIGdlbmVyYXRlZC5cbiAgICAgKiBUaGlzIElEIGlzIHVzZWQgdG8gaWRlbnRpZnkgdGhlIGNvbHVtbiBpbiB0aGUgQVBJIGZvciBzb3J0aW5nLCBmaWx0ZXJpbmcgZXRjLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sSWQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGZpZWxkIG9mIHRoZSByb3cgdG8gZ2V0IHRoZSBjZWxscyBkYXRhIGZyb20gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpZWxkOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgY29tbWEgc2VwYXJhdGVkIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzIGNvbnRhaW5pbmcgYENvbHVtblR5cGVgIGtleXMgd2hpY2ggY2FuIGJlIHVzZWQgYXMgYSB0ZW1wbGF0ZSBmb3IgYSBjb2x1bW4uXG4gICAgICogVGhpcyBoZWxwcyB0byByZWR1Y2UgZHVwbGljYXRpb24gb2YgcHJvcGVydGllcyB3aGVuIHlvdSBoYXZlIGEgbG90IG9mIGNvbW1vbiBjb2x1bW4gcHJvcGVydGllcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHR5cGU6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBHZXRzIHRoZSB2YWx1ZSBmcm9tIHlvdXIgZGF0YSBmb3IgZGlzcGxheS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlR2V0dGVyOiBzdHJpbmcgfCBWYWx1ZUdldHRlckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZnVuY3Rpb24gb3IgZXhwcmVzc2lvbiB0byBmb3JtYXQgYSB2YWx1ZSwgc2hvdWxkIHJldHVybiBhIHN0cmluZy4gTm90IHVzZWQgZm9yIENTViBleHBvcnQgb3IgY29weSB0byBjbGlwYm9hcmQsIG9ubHkgZm9yIFVJIGNlbGwgcmVuZGVyaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVGb3JtYXR0ZXI6IHN0cmluZyB8IFZhbHVlRm9ybWF0dGVyRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZWQgYSByZWZlcmVuY2UgZGF0YSBtYXAgdG8gYmUgdXNlZCB0byBtYXAgY29sdW1uIHZhbHVlcyB0byB0aGVpciByZXNwZWN0aXZlIHZhbHVlIGZyb20gdGhlIG1hcC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlZkRhdGE6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiB0byByZXR1cm4gYSBzdHJpbmcga2V5IGZvciBhIHZhbHVlLlxuICAgICAqIFRoaXMgc3RyaW5nIGlzIHVzZWQgZm9yIGdyb3VwaW5nLCBTZXQgZmlsdGVyaW5nLCBhbmQgc2VhcmNoaW5nIHdpdGhpbiBjZWxsIGVkaXRvciBkcm9wZG93bnMuXG4gICAgICogV2hlbiBmaWx0ZXJpbmcgYW5kIHNlYXJjaGluZyB0aGUgc3RyaW5nIGlzIGV4cG9zZWQgdG8gdGhlIHVzZXIsIHNvIG1ha2Ugc3VyZSB0byByZXR1cm4gYSBodW1hbi1yZWFkYWJsZSB2YWx1ZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGtleUNyZWF0b3I6ICgocGFyYW1zOiBLZXlDcmVhdG9yUGFyYW1zKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b20gY29tcGFyYXRvciBmb3IgdmFsdWVzLCB1c2VkIGJ5IHJlbmRlcmVyIHRvIGtub3cgaWYgdmFsdWVzIGhhdmUgY2hhbmdlZC4gQ2VsbHMgd2hvJ3MgdmFsdWVzIGhhdmUgbm90IGNoYW5nZWQgZG9uJ3QgZ2V0IHJlZnJlc2hlZC5cbiAgICAgKiBCeSBkZWZhdWx0IHRoZSBncmlkIHVzZXMgYD09PWAgaXMgdXNlZCB3aGljaCBzaG91bGQgd29yayBmb3IgbW9zdCB1c2UgY2FzZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlcXVhbHM6ICgodmFsdWVBOiBhbnksIHZhbHVlQjogYW55KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGZpZWxkIG9mIHRoZSB0b29sdGlwIHRvIGFwcGx5IHRvIHRoZSBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcEZpZWxkOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRoYXQgc2hvdWxkIHJldHVybiB0aGUgc3RyaW5nIHVzZWQgZm9yIGEgdG9vbHRpcCwgYHRvb2x0aXBGaWVsZGAgdGFrZXMgcHJlY2VkZW5jZSBpZiBzZXQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwVmFsdWVHZXR0ZXI6ICgocGFyYW1zOiBJVG9vbHRpcFBhcmFtcykgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogYGJvb2xlYW5gIG9yIGBGdW5jdGlvbmAuIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gcmVuZGVyIGEgc2VsZWN0aW9uIGNoZWNrYm94IGluIHRoZSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IENoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2sgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIHRvIHVzZSBpbnNpZGUgdGhlIGNvbHVtbiBpbnN0ZWFkIG9mIHRoZSBncmlkJ3MgZGVmYXVsdCBpY29ucy4gTGVhdmUgdW5kZWZpbmVkIHRvIHVzZSBkZWZhdWx0cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGljb25zOiB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIHwgc3RyaW5nOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHRoaXMgY29sdW1uIGlzIG5vdCBuYXZpZ2FibGUgKGkuZS4gY2Fubm90IGJlIHRhYmJlZCBpbnRvKSwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAgICogQ2FuIGFsc28gYmUgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBoYXZlIGRpZmZlcmVudCByb3dzIG5hdmlnYWJsZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTmF2aWdhYmxlOiBib29sZWFuIHwgU3VwcHJlc3NOYXZpZ2FibGVDYWxsYmFjayB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIHN1cHByZXNzIGNlcnRhaW4ga2V5Ym9hcmQgZXZlbnRzIGluIHRoZSBncmlkIGNlbGwgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudDogKChwYXJhbXM6IFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFBhc3RpbmcgaXMgb24gYnkgZGVmYXVsdCBhcyBsb25nIGFzIGNlbGxzIGFyZSBlZGl0YWJsZSAobm9uLWVkaXRhYmxlIGNlbGxzIGNhbm5vdCBiZSBtb2RpZmllZCwgZXZlbiB3aXRoIGEgcGFzdGUgb3BlcmF0aW9uKS5cbiAgICAgKiBTZXQgdG8gYHRydWVgIHR1cm4gcGFzdGUgb3BlcmF0aW9ucyBvZmYuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Bhc3RlOiBib29sZWFuIHwgU3VwcHJlc3NQYXN0ZUNhbGxiYWNrIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBwcmV2ZW50IHRoZSBmaWxsSGFuZGxlIGZyb20gYmVpbmcgcmVuZGVyZWQgaW4gYW55IGNlbGwgdGhhdCBiZWxvbmdzIHRvIHRoaXMgY29sdW1uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpbGxIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgZm9yIHRoaXMgY29sdW1uIHRvIGJlIGhpZGRlbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhpZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgJ2hpZGUnLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGJsb2NrIG1ha2luZyBjb2x1bW4gdmlzaWJsZSAvIGhpZGRlbiB2aWEgdGhlIFVJIChBUEkgd2lsbCBzdGlsbCB3b3JrKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2tWaXNpYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBoYXZlIHRoaXMgY29sdW1uIGRpc3BsYXllZCBmaXJzdC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2tQb3NpdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgbW92YWJsZSB2aWEgZHJhZ2dpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBjb2x1bW4gaXMgZWRpdGFibGUsIG90aGVyd2lzZSBgZmFsc2VgLiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRvIGhhdmUgZGlmZmVyZW50IHJvd3MgZWRpdGFibGUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlZGl0YWJsZTogYm9vbGVhbiB8IEVkaXRhYmxlQ2FsbGJhY2sgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIFNldHMgdGhlIHZhbHVlIGludG8geW91ciBkYXRhIGZvciBzYXZpbmcuIFJldHVybiBgdHJ1ZWAgaWYgdGhlIGRhdGEgY2hhbmdlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlU2V0dGVyOiBzdHJpbmcgfCBWYWx1ZVNldHRlckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIFBhcnNlcyB0aGUgdmFsdWUgZm9yIHNhdmluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlUGFyc2VyOiBzdHJpbmcgfCBWYWx1ZVBhcnNlckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgYGNlbGxFZGl0b3JgIHRvIHVzZSBmb3IgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yOiBzdHJpbmcgfCB7IG5ldygpOiBJQ2VsbEVkaXRvckNvbXA7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZyYW1ld29yayBgY2VsbEVkaXRvcmAgdG8gdXNlIGZvciB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogUGFyYW1zIHRvIGJlIHBhc3NlZCB0byB0aGUgY2VsbCBlZGl0b3IgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggY2VsbCBlZGl0b3IgdG8gYmUgdXNlZCBmb3IgYSBnaXZlbiByb3cgd2l0aGluIHRoZSBzYW1lIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JTZWxlY3RvcjogQ2VsbEVkaXRvclNlbGVjdG9yRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIHVuZGVyIHRoaXMgY29sdW1uIGVudGVyIGVkaXQgbW9kZSBhZnRlciBzaW5nbGUgY2xpY2suICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHVzZSBgdmFsdWVTZXR0ZXJgIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmV3VmFsdWVIYW5kbGVyOiAoKHBhcmFtczogTmV3VmFsdWVQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgLCB0byBoYXZlIHRoZSBjZWxsIGVkaXRvciBhcHBlYXIgaW4gYSBwb3B1cC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3JQb3B1cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBwb3NpdGlvbiBmb3IgdGhlIHBvcHVwIGNlbGwgZWRpdG9yLiBQb3NzaWJsZSB2YWx1ZXMgYXJlXG4gICAgICogICAtIGBvdmVyYCBQb3B1cCB3aWxsIGJlIHBvc2l0aW9uZWQgb3ZlciB0aGUgY2VsbFxuICAgICAqICAgLSBgdW5kZXJgIFBvcHVwIHdpbGwgYmUgcG9zaXRpb25lZCBiZWxvdyB0aGUgY2VsbCBsZWF2aW5nIHRoZSBjZWxsIHZhbHVlIHZpc2libGUuXG4gICAgICogXG4gICAgICogVGhlIGRlZmF1bHQgaXMgYG92ZXJgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBvcHVwUG9zaXRpb246IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgZm9yIGFmdGVyIHRoZSB2YWx1ZSBvZiBhIGNlbGwgaGFzIGNoYW5nZWQsIGVpdGhlciBkdWUgdG8gZWRpdGluZyBvciB0aGUgYXBwbGljYXRpb24gY2FsbGluZyBgYXBpLnNldFZhbHVlKClgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsVmFsdWVDaGFuZ2VkOiAoKGV2ZW50OiBOZXdWYWx1ZVBhcmFtcykgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIGEgY2VsbCBpcyBjbGlja2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsQ2xpY2tlZDogKChldmVudDogQ2VsbENsaWNrZWRFdmVudCkgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIGEgY2VsbCBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbERvdWJsZUNsaWNrZWQ6ICgoZXZlbnQ6IENlbGxEb3VibGVDbGlja2VkRXZlbnQpID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBjYWxsZWQgd2hlbiBhIGNlbGwgaXMgcmlnaHQgY2xpY2tlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG9uQ2VsbENvbnRleHRNZW51OiAoKGV2ZW50OiBDZWxsQ29udGV4dE1lbnVFdmVudCkgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZnVuY3Rpb24gdG8gdGVsbCB0aGUgZ3JpZCB3aGF0IHF1aWNrIGZpbHRlciB0ZXh0IHRvIHVzZSBmb3IgdGhpcyBjb2x1bW4gaWYgeW91IGRvbid0IHdhbnQgdG8gdXNlIHRoZSBkZWZhdWx0ICh3aGljaCBpcyBjYWxsaW5nIGB0b1N0cmluZ2Agb24gdGhlIHZhbHVlKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFF1aWNrRmlsdGVyVGV4dDogKChwYXJhbXM6IEdldFF1aWNrRmlsdGVyVGV4dFBhcmFtcykgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gR2V0cyB0aGUgdmFsdWUgZm9yIGZpbHRlcmluZyBwdXJwb3Nlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlclZhbHVlR2V0dGVyOiBzdHJpbmcgfCBWYWx1ZUdldHRlckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZXRoZXIgdG8gZGlzcGxheSBhIGZsb2F0aW5nIGZpbHRlciBmb3IgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGN1c3RvbSBoZWFkZXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlci4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBoZWFkZXIgY29tcG9uZW50IGlzIHVzZWQuICAgICAqICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnQ6IHN0cmluZyB8IHsgbmV3KCk6IGFueTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGN1c3RvbSBoZWFkZXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlciBpbiB0aGUgaG9zdGluZyBmcmFtZXdvcmsgKGllOiBBbmd1bGFyL1JlYWN0L1Z1ZUpzKS4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBoZWFkZXIgY29tcG9uZW50IGlzIHVzZWQqICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIHBhcmFtZXRlcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBoZWFkZXIgY29tcG9uZW50LiAgICAgKiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBhbiBhcnJheSBjb250YWluaW5nIHplcm8sIG9uZSBvciBtYW55IG9mIHRoZSBmb2xsb3dpbmcgb3B0aW9uczogYCdmaWx0ZXJNZW51VGFiJyB8ICdnZW5lcmFsTWVudVRhYicgfCAnY29sdW1uc01lbnVUYWInYC5cbiAgICAgKiBUaGlzIGlzIHVzZWQgdG8gZmlndXJlIG91dCB3aGljaCBtZW51IHRhYnMgYXJlIHByZXNlbnQgYW5kIGluIHdoaWNoIG9yZGVyIHRoZSB0YWJzIGFyZSBzaG93bi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1lbnVUYWJzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUGFyYW1zIHVzZWQgdG8gY2hhbmdlIHRoZSBiZWhhdmlvdXIgYW5kIGFwcGVhcmFuY2Ugb2YgdGhlIENvbHVtbnMgTWVudSB0YWIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5zTWVudVBhcmFtczogQ29sdW1uc01lbnVQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgbm8gbWVudSBzaG91bGQgYmUgc2hvd24gZm9yIHRoaXMgY29sdW1uIGhlYWRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgIG9yIHRoZSBjYWxsYmFjayByZXR1cm5zIGB0cnVlYCwgYSAnc2VsZWN0IGFsbCcgY2hlY2tib3ggd2lsbCBiZSBwdXQgaW50byB0aGUgaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IGJvb2xlYW4gfCBIZWFkZXJDaGVja2JveFNlbGVjdGlvbkNhbGxiYWNrIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZSBoZWFkZXIgY2hlY2tib3ggc2VsZWN0aW9uIHdpbGwgb25seSBzZWxlY3QgZmlsdGVyZWQgaXRlbXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDaGVja2JveFNlbGVjdGlvbkZpbHRlcmVkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGVmaW5lcyB0aGUgY2hhcnQgZGF0YSB0eXBlIHRoYXQgc2hvdWxkIGJlIHVzZWQgZm9yIGEgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnREYXRhVHlwZTogJ2NhdGVnb3J5JyB8ICdzZXJpZXMnIHwgJ3RpbWUnIHwgJ2V4Y2x1ZGVkJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUGluIGEgY29sdW1uIHRvIG9uZSBzaWRlOiBgcmlnaHRgIG9yIGBsZWZ0YC4gQSB2YWx1ZSBvZiBgdHJ1ZWAgaXMgY29udmVydGVkIHRvIGAnbGVmdCdgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkOiBib29sZWFuIHwgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyAncGlubmVkJywgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGlubmVkOiBib29sZWFuIHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBibG9jayB0aGUgdXNlciBwaW5uaW5nIHRoZSBjb2x1bW4sIHRoZSBjb2x1bW4gY2FuIG9ubHkgYmUgcGlubmVkIHZpYSBkZWZpbml0aW9ucyBvciBBUEkgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2tQaW5uZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBjZWxsUmVuZGVyZXJTZWxlY3RvciBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBDZWxsIFJlbmRlcmVyIGZvciBwaW5uZWQgcm93cy4gQ2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGNlbGxSZW5kZXJlclNlbGVjdG9yIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IENlbGwgUmVuZGVyZXIgZm9yIHBpbm5lZCByb3dzLiBDaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgdmFsdWVGb3JtYXR0ZXIgZm9yIHBpbm5lZCByb3dzLCBhbmQgY2hlY2sgcGFyYW1zLm5vZGUucm93UGlubmVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRSb3dWYWx1ZUZvcm1hdHRlcjogc3RyaW5nIHwgVmFsdWVGb3JtYXR0ZXJGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBwaXZvdCBieSB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzICdwaXZvdCcsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFBpdm90OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyBpbiBjb2x1bW5zIHlvdSB3YW50IHRvIHBpdm90IGJ5LlxuICAgICAqIElmIG9ubHkgcGl2b3RpbmcgYnkgb25lIGNvbHVtbiwgc2V0IHRoaXMgdG8gYW55IG51bWJlciAoZS5nLiBgMGApLlxuICAgICAqIElmIHBpdm90aW5nIGJ5IG11bHRpcGxlIGNvbHVtbnMsIHNldCB0aGlzIHRvIHdoZXJlIHlvdSB3YW50IHRoaXMgY29sdW1uIHRvIGJlIGluIHRoZSBvcmRlciBvZiBwaXZvdHMgKGUuZy4gYDBgIGZvciBmaXJzdCwgYDFgIGZvciBzZWNvbmQsIGFuZCBzbyBvbikuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEluZGV4OiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzICdwaXZvdEluZGV4JywgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3RJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDb21wYXJhdG9yIHRvIHVzZSB3aGVuIG9yZGVyaW5nIHRoZSBwaXZvdCBjb2x1bW5zLCB3aGVuIHRoaXMgY29sdW1uIGlzIHVzZWQgdG8gcGl2b3Qgb24uXG4gICAgICogVGhlIHZhbHVlcyB3aWxsIGFsd2F5cyBiZSBzdHJpbmdzLCBhcyB0aGUgcGl2b3Qgc2VydmljZSB1c2VzIHN0cmluZ3MgYXMga2V5cyBmb3IgdGhlIHBpdm90IGdyb3Vwcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Q29tcGFyYXRvcjogKCh2YWx1ZUE6IHN0cmluZywgdmFsdWVCOiBzdHJpbmcpID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdG8gYmUgYWJsZSB0byBwaXZvdCBieSB0aGlzIGNvbHVtbiB2aWEgdGhlIEdVSS4gVGhpcyB3aWxsIG5vdCBibG9jayB0aGUgQVBJIG9yIHByb3BlcnRpZXMgYmVpbmcgdXNlZCB0byBhY2hpZXZlIHBpdm90LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBvZiBjc3MgdmFsdWVzIC8gb3IgZnVuY3Rpb24gcmV0dXJuaW5nIGFuIG9iamVjdCBvZiBjc3MgdmFsdWVzIGZvciBhIHBhcnRpY3VsYXIgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxTdHlsZTogQ2VsbFN0eWxlIHwgQ2VsbFN0eWxlRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2xhc3MgdG8gdXNlIGZvciB0aGUgY2VsbC4gQ2FuIGJlIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3M6IHN0cmluZyB8IHN0cmluZ1tdIHwgQ2VsbENsYXNzRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUnVsZXMgd2hpY2ggY2FuIGJlIGFwcGxpZWQgdG8gaW5jbHVkZSBjZXJ0YWluIENTUyBjbGFzc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbENsYXNzUnVsZXM6IENlbGxDbGFzc1J1bGVzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGBjZWxsUmVuZGVyZXJgIHRvIHVzZSBmb3IgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZyYW1ld29yayBgY2VsbFJlbmRlcmVyYCB0byB1c2UgZm9yIHRoaXMgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGNlbGwgcmVuZGVyZXIgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBjZWxsIHJlbmRlcmVyIHRvIGJlIHVzZWQgZm9yIGEgZ2l2ZW4gcm93IHdpdGhpbiB0aGUgc2FtZSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJTZWxlY3RvcjogQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGdyaWQgY2FsY3VsYXRlIHRoZSBoZWlnaHQgb2YgYSByb3cgYmFzZWQgb24gY29udGVudHMgb2YgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvSGVpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIHRleHQgd3JhcCBpbnNpZGUgdGhlIGNlbGwgLSB0eXBpY2FsbHkgdXNlZCB3aXRoIGBhdXRvSGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHdyYXBUZXh0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGZsYXNoIGEgY2VsbCB3aGVuIGl0J3MgcmVmcmVzaGVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHByZXZlbnQgdGhpcyBjb2x1bW4gZnJvbSBmbGFzaGluZyBvbiBjaGFuZ2VzLiBPbmx5IGFwcGxpY2FibGUgaWYgY2VsbCBmbGFzaGluZyBpcyB0dXJuZWQgb24gZm9yIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIGBib29sZWFuYCBvciBgRnVuY3Rpb25gLiBTZXQgdG8gYHRydWVgIChvciByZXR1cm4gYHRydWVgIGZyb20gZnVuY3Rpb24pIHRvIGFsbG93IHJvdyBkcmFnZ2luZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWc6IGJvb2xlYW4gfCBSb3dEcmFnQ2FsbGJhY2sgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgY2FsbGJhY2sgdGhhdCBzaG91bGQgcmV0dXJuIGEgc3RyaW5nIHRvIGJlIGRpc3BsYXllZCBieSB0aGUgYHJvd0RyYWdDb21wYCB3aGlsZSBkcmFnZ2luZyBhIHJvdy5cbiAgICAgKiBJZiB0aGlzIGNhbGxiYWNrIGlzIG5vdCBzZXQsIHRoZSBjdXJyZW50IGNlbGwgdmFsdWUgd2lsbCBiZSB1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ1RleHQ6ICgocGFyYW1zOiBJUm93RHJhZ0l0ZW0sIGRyYWdJdGVtQ291bnQ6IG51bWJlcikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogYGJvb2xlYW5gIG9yIGBGdW5jdGlvbmAuIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gYWxsb3cgZHJhZ2dpbmcgZm9yIG5hdGl2ZSBkcmFnIGFuZCBkcm9wLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG5kU291cmNlOiBib29sZWFuIHwgRG5kU291cmNlQ2FsbGJhY2sgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIHRvIGFsbG93IGN1c3RvbSBkcmFnIGZ1bmN0aW9uYWxpdHkgZm9yIG5hdGl2ZSBkcmFnIGFuZCBkcm9wLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG5kU291cmNlT25Sb3dEcmFnOiAoKHBhcmFtczogeyByb3dOb2RlOiBSb3dOb2RlLCBkcmFnRXZlbnQ6IERyYWdFdmVudDsgfSkgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gcm93IGdyb3VwIGJ5IHRoaXMgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgJ3Jvd0dyb3VwJywgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUm93R3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIGluIGNvbHVtbnMgeW91IHdhbnQgdG8gZ3JvdXAgYnkuXG4gICAgICogSWYgb25seSBncm91cGluZyBieSBvbmUgY29sdW1uLCBzZXQgdGhpcyB0byBhbnkgbnVtYmVyIChlLmcuIGAwYCkuXG4gICAgICogSWYgZ3JvdXBpbmcgYnkgbXVsdGlwbGUgY29sdW1ucywgc2V0IHRoaXMgdG8gd2hlcmUgeW91IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgaW4gdGhlIGdyb3VwIChlLmcuIGAwYCBmb3IgZmlyc3QsIGAxYCBmb3Igc2Vjb25kLCBhbmQgc28gb24pLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBJbmRleDogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyAncm93R3JvdXBJbmRleCcsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFJvd0dyb3VwSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIHJvdyBncm91cCBieSB0aGlzIGNvbHVtbiB2aWEgdGhlIEdVSS5cbiAgICAgKiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgcm93IGdyb3VwaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUm93R3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdG8gYmUgYWJsZSB0byBhZ2dyZWdhdGUgYnkgdGhpcyBjb2x1bW4gdmlhIHRoZSBHVUkuXG4gICAgICogVGhpcyB3aWxsIG5vdCBibG9jayB0aGUgQVBJIG9yIHByb3BlcnRpZXMgYmVpbmcgdXNlZCB0byBhY2hpZXZlIGFnZ3JlZ2F0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlVmFsdWU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIE5hbWUgb2YgZnVuY3Rpb24gdG8gdXNlIGZvciBhZ2dyZWdhdGlvbi4gWW91IGNhbiBhbHNvIHByb3ZpZGUgeW91ciBvd24gYWdnIGZ1bmN0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuYzogc3RyaW5nIHwgSUFnZ0Z1bmMgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzICdhZ2dGdW5jJywgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsQWdnRnVuYzogc3RyaW5nIHwgSUFnZ0Z1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFnZ3JlZ2F0aW9uIGZ1bmN0aW9ucyBhbGxvd2VkIG9uIHRoaXMgY29sdW1uIGUuZy4gYFsnc3VtJywgJ2F2ZyddYC5cbiAgICAgKiBJZiBtaXNzaW5nLCBhbGwgaW5zdGFsbGVkIGZ1bmN0aW9ucyBhcmUgYWxsb3dlZC5cbiAgICAgKiBUaGlzIHdpbGwgb25seSByZXN0cmljdCB3aGF0IHRoZSBHVUkgYWxsb3dzIGEgdXNlciB0byBzZWxlY3QsIGl0IGRvZXMgbm90IGltcGFjdCB3aGVuIHlvdSBzZXQgYSBmdW5jdGlvbiB2aWEgdGhlIEFQSS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93ZWRBZ2dGdW5jczogc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGhhdmUgdGhlIGdyaWQgcGxhY2UgdGhlIHZhbHVlcyBmb3IgdGhlIGdyb3VwIGludG8gdGhlIGNlbGwsIG9yIHB1dCB0aGUgbmFtZSBvZiBhIGdyb3VwZWQgY29sdW1uIHRvIGp1c3Qgc2hvdyB0aGF0IGdyb3VwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd1Jvd0dyb3VwOiBzdHJpbmcgfCBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IHNvcnRpbmcgb24gdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0YWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgc29ydGluZyBieSBkZWZhdWx0LCBzZXQgaXQgaGVyZS4gU2V0IHRvICdhc2MnIG9yICdkZXNjJy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnQ6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgYHNvcnRgLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTb3J0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIHNvcnRpbmcgbW9yZSB0aGFuIG9uZSBjb2x1bW4gYnkgZGVmYXVsdCwgc3BlY2lmaWVzIG9yZGVyIGluIHdoaWNoIHRoZSBzb3J0aW5nIHNob3VsZCBiZSBhcHBsaWVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydEluZGV4OiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzICdzb3J0SW5kZXgnLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTb3J0SW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXJyYXkgZGVmaW5pbmcgdGhlIG9yZGVyIGluIHdoaWNoIHNvcnRpbmcgb2NjdXJzIChpZiBzb3J0aW5nIGlzIGVuYWJsZWQpLiBBbiBhcnJheSB3aXRoIGFueSBvZiB0aGUgZm9sbG93aW5nIGluIGFueSBvcmRlciBbJ2FzYycsJ2Rlc2MnLG51bGxdICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6IChzdHJpbmcgfCBudWxsKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDb21wYXJhdG9yIGZ1bmN0aW9uIGZvciBjdXN0b20gc29ydGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBhcmF0b3I6ICgodmFsdWVBOiBhbnksIHZhbHVlQjogYW55LCBub2RlQTogUm93Tm9kZSwgbm9kZUI6IFJvd05vZGUsIGlzSW52ZXJ0ZWQ6IGJvb2xlYW4pID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IHdhbnQgdGhlIHVuc29ydGVkIGljb24gdG8gYmUgc2hvd24gd2hlbiBubyBzb3J0IGlzIGFwcGxpZWQgdG8gdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2MjQgLSB1c2Ugc29ydEluZGV4IGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGVkQXQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgZWFjaCBjZWxsIHdpbGwgdGFrZSB1cCB0aGUgd2lkdGggb2Ygb25lIGNvbHVtbi4gWW91IGNhbiBjaGFuZ2UgdGhpcyBiZWhhdmlvdXIgdG8gYWxsb3cgY2VsbHMgdG8gc3BhbiBtdWx0aXBsZSBjb2x1bW5zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sU3BhbjogKChwYXJhbXM6IENvbFNwYW5QYXJhbXMpID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQsIGVhY2ggY2VsbCB3aWxsIHRha2UgdXAgdGhlIGhlaWdodCBvZiBvbmUgcm93LiBZb3UgY2FuIGNoYW5nZSB0aGlzIGJlaGF2aW91ciB0byBhbGxvdyBjZWxscyB0byBzcGFuIG11bHRpcGxlIHJvd3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTcGFuOiAoKHBhcmFtczogUm93U3BhblBhcmFtcykgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSW5pdGlhbCB3aWR0aCBpbiBwaXhlbHMgZm9yIHRoZSBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgd2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyAnd2lkdGgnLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBNaW5pbXVtIHdpZHRoIGluIHBpeGVscyBmb3IgdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtaW5XaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBNYXhpbXVtIHdpZHRoIGluIHBpeGVscyBmb3IgdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBVc2VkIGluc3RlYWQgb2YgYHdpZHRoYCB3aGVuIHRoZSBnb2FsIGlzIHRvIGZpbGwgdGhlIHJlbWFpbmluZyBlbXB0eSBzcGFjZSBvZiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyAnZmxleCcsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEZsZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyB0aGlzIGNvbHVtbiBzaG91bGQgYmUgcmVzaXplZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlc2l6YWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0aGlzIGNvbHVtbidzIHdpZHRoIHRvIGJlIGZpeGVkIGR1cmluZyAnc2l6ZSB0byBmaXQnIG9wZXJhdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NpemVUb0ZpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3UgZG8gbm90IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgYXV0by1yZXNpemFibGUgYnkgZG91YmxlIGNsaWNraW5nIGl0J3MgZWRnZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cblxuICAgIC8vIEVuYWJsZSB0eXBlIGNvZXJjaW9uIGZvciBib29sZWFuIElucHV0cyB0byBzdXBwb3J0IHVzZSBsaWtlICdlbmFibGVDaGFydHMnIGluc3RlYWQgb2YgZm9yY2luZyAnW2VuYWJsZUNoYXJ0c109XCJ0cnVlXCInIFxuICAgIC8vIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS90ZW1wbGF0ZS10eXBlY2hlY2sjaW5wdXQtc2V0dGVyLWNvZXJjaW9uIFxuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NlbGxGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZpbHRlcnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX29wZW5CeURlZmF1bHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX21hcnJ5Q2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2hpZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luaXRpYWxIaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW5pdGlhbFJvd0dyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9waXZvdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW5pdGlhbFBpdm90OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2hlYWRlckNoZWNrYm94U2VsZWN0aW9uRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01lbnU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92YWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbG9ja1Bvc2l0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2NrVmlzaWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbG9ja1Bpbm5lZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5Tb3J0SWNvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTaXplVG9GaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJvd0dyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVQaXZvdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlVmFsdWU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VkaXRhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Bhc3RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc05hdmlnYWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kbmRTb3VyY2U6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2F1dG9IZWlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3dyYXBUZXh0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zb3J0YWJsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVzaXphYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Zsb2F0aW5nRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jZWxsRWRpdG9yUG9wdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmlsbEhhbmRsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICAvLyBARU5EQFxuXG59XG4iXX0=