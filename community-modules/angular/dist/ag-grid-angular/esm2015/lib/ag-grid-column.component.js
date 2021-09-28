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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerName", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerValueGetter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerTooltip", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerClass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressHeaderKeyboardEvent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "columnGroupShow", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "toolPanelClass", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressColumnsToolPanel", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "children", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "groupId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "openByDefault", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "colId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "keyCreator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "equals", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "tooltipField", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressKeyboardEvent", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressPaste", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressFillHandle", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "hide", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "initialHide", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "lockVisible", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "lockPosition", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellEditorSelector", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "singleClickEdit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "newValueHandler", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellEditorPopup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellEditorPopupPosition", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "onCellValueChanged", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "onCellClicked", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "onCellDoubleClicked", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "onCellContextMenu", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "getQuickFilterText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "filterValueGetter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "menuTabs", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "columnsMenuParams", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressMenu", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerCheckboxSelection", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "headerCheckboxSelectionFilteredOnly", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
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
    __metadata("design:type", Object)
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "pivot", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "initialPivot", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "pivotIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "initialPivotIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "pivotComparator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "cellRendererSelector", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "autoHeight", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "wrapText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "enableCellChangeFlash", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressCellFlash", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "rowDrag", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "rowDragText", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "dndSource", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "dndSourceOnRowDrag", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "rowGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "initialRowGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "rowGroupIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "initialRowGroupIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "enableRowGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
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
    __metadata("design:type", Object)
], AgGridColumn.prototype, "allowedAggFuncs", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "showRowGroup", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "sortable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "sort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "initialSort", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "sortIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "initialSortIndex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "sortingOrder", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "comparator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "unSortIcon", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "sortedAt", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "colSpan", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "rowSpan", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "width", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "initialWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "minWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "maxWidth", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "flex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "initialFlex", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "resizable", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressSizeToFit", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridColumn.prototype, "suppressAutoSize", void 0);
AgGridColumn = AgGridColumn_1 = __decorate([
    Component({
        selector: 'ag-grid-column',
        template: ''
    })
], AgGridColumn);
export { AgGridColumn };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQGFnLWdyaWQtY29tbXVuaXR5L2FuZ3VsYXIvIiwic291cmNlcyI6WyJsaWIvYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU03RSxJQUFhLFlBQVksb0JBQXpCLE1BQWEsWUFBWTtJQUF6QjtRQWtDSSxnSEFBZ0g7UUFDaEgsVUFBVTtRQUNNLG9CQUFlLEdBQVEsU0FBUyxDQUFDO1FBQ2pDLGlCQUFZLEdBQVEsU0FBUyxDQUFDO1FBQzlCLDRCQUF1QixHQUFRLFNBQVMsQ0FBQztRQUN6QyxrQ0FBNkIsR0FBUSxTQUFTLENBQUM7UUFDL0MscUNBQWdDLEdBQVEsU0FBUyxDQUFDO1FBQ2xELFdBQU0sR0FBUSxTQUFTLENBQUM7UUFDeEMsNElBQTRJO1FBQzVILGVBQVUsR0FBdUIsU0FBUyxDQUFDO1FBQzNELDRFQUE0RTtRQUM1RCxzQkFBaUIsR0FBK0MsU0FBUyxDQUFDO1FBQzFGLHNFQUFzRTtRQUMxRSx3Q0FBd0M7UUFDcEIsa0JBQWEsR0FBdUIsU0FBUyxDQUFDO1FBQzlELGdHQUFnRztRQUNoRixnQkFBVyxHQUE0QixTQUFTLENBQUM7UUFDakUsb0dBQW9HO1FBQ3BGLGdDQUEyQixHQUF5RSxTQUFTLENBQUM7UUFDOUgsc0VBQXNFO1FBQ3RELG9CQUFlLEdBQXVCLFNBQVMsQ0FBQztRQUNoRSxvR0FBb0c7UUFDcEYsbUJBQWMsR0FBK0IsU0FBUyxDQUFDO1FBQ3ZFLHFHQUFxRztRQUNyRiw2QkFBd0IsR0FBd0IsU0FBUyxDQUFDO1FBQzFFLDZIQUE2SDtRQUM3Ryw2QkFBd0IsR0FBd0IsU0FBUyxDQUFDO1FBQzFELHFCQUFnQixHQUFrRCxTQUFTLENBQUM7UUFDNUUsOEJBQXlCLEdBQVEsU0FBUyxDQUFDO1FBQzNDLDJCQUFzQixHQUFRLFNBQVMsQ0FBQztRQUN4RCxnRUFBZ0U7UUFDaEQsYUFBUSxHQUF5QyxTQUFTLENBQUM7UUFDM0UseUtBQXlLO1FBQ3pKLFlBQU8sR0FBdUIsU0FBUyxDQUFDO1FBQ3hELG1FQUFtRTtRQUNuRCxrQkFBYSxHQUF3QixTQUFTLENBQUM7UUFDL0QsNEtBQTRLO1FBQzVKLGtCQUFhLEdBQXdCLFNBQVMsQ0FBQztRQUMvRCwwSUFBMEk7UUFDMUgseUJBQW9CLEdBQXNELFNBQVMsQ0FBQztRQUNwRyw2TEFBNkw7UUFDN0ssa0NBQTZCLEdBQVEsU0FBUyxDQUFDO1FBQy9ELHlFQUF5RTtRQUN6RCwrQkFBMEIsR0FBUSxTQUFTLENBQUM7UUFDNUQ7OytGQUV1RjtRQUN2RSxVQUFLLEdBQXVCLFNBQVMsQ0FBQztRQUN0RCwwREFBMEQ7UUFDMUMsVUFBSyxHQUF1QixTQUFTLENBQUM7UUFDdEQ7aUhBQ3lHO1FBQ3pGLFNBQUksR0FBa0MsU0FBUyxDQUFDO1FBQ2hFLDZFQUE2RTtRQUM3RCxnQkFBVyxHQUF5QyxTQUFTLENBQUM7UUFDOUUsd0pBQXdKO1FBQ3hJLG1CQUFjLEdBQTRDLFNBQVMsQ0FBQztRQUNwRixnSEFBZ0g7UUFDaEcsWUFBTyxHQUEyQyxTQUFTLENBQUM7UUFDNUU7O2dJQUV3SDtRQUN4RyxlQUFVLEdBQXVELFNBQVMsQ0FBQztRQUMzRjs4RkFDc0Y7UUFDdEUsV0FBTSxHQUF3RCxTQUFTLENBQUM7UUFDeEYseURBQXlEO1FBQ3pDLGlCQUFZLEdBQXVCLFNBQVMsQ0FBQztRQUM3RCw2R0FBNkc7UUFDN0YsdUJBQWtCLEdBQXFELFNBQVMsQ0FBQztRQUNqRyxnSUFBZ0k7UUFDaEgsc0JBQWlCLEdBQW9ELFNBQVMsQ0FBQztRQUMvRiwrR0FBK0c7UUFDL0YsVUFBSyxHQUFzRCxTQUFTLENBQUM7UUFDckY7bUZBQzJFO1FBQzNELHNCQUFpQixHQUFvRCxTQUFTLENBQUM7UUFDL0YsK0VBQStFO1FBQy9ELDBCQUFxQixHQUFtRSxTQUFTLENBQUM7UUFDbEg7MERBQ2tEO1FBQ2xDLGtCQUFhLEdBQWdELFNBQVMsQ0FBQztRQUN2Riw0R0FBNEc7UUFDNUYsdUJBQWtCLEdBQXdCLFNBQVMsQ0FBQztRQUNwRSxzREFBc0Q7UUFDdEMsU0FBSSxHQUF3QixTQUFTLENBQUM7UUFDdEQsd0hBQXdIO1FBQ3hHLGdCQUFXLEdBQXdCLFNBQVMsQ0FBQztRQUM3RCxrR0FBa0c7UUFDbEYsZ0JBQVcsR0FBd0IsU0FBUyxDQUFDO1FBQzdELG9FQUFvRTtRQUNwRCxpQkFBWSxHQUF3QixTQUFTLENBQUM7UUFDOUQsbUZBQW1GO1FBQ25FLG9CQUFlLEdBQXdCLFNBQVMsQ0FBQztRQUNqRSwrSEFBK0g7UUFDL0csYUFBUSxHQUEyQyxTQUFTLENBQUM7UUFDN0UsK0dBQStHO1FBQy9GLGdCQUFXLEdBQXlDLFNBQVMsQ0FBQztRQUM5RSwrREFBK0Q7UUFDL0MsZ0JBQVcsR0FBeUMsU0FBUyxDQUFDO1FBQzlFLGlEQUFpRDtRQUNqQyxlQUFVLEdBQXFELFNBQVMsQ0FBQztRQUN6Rix5REFBeUQ7UUFDekMsd0JBQW1CLEdBQVEsU0FBUyxDQUFDO1FBQ3JELDREQUE0RDtRQUM1QyxxQkFBZ0IsR0FBUSxTQUFTLENBQUM7UUFDbEQsa0dBQWtHO1FBQ2xGLHVCQUFrQixHQUF1QyxTQUFTLENBQUM7UUFDbkYsNEZBQTRGO1FBQzVFLG9CQUFlLEdBQXdCLFNBQVMsQ0FBQztRQUNqRTtXQUNHO1FBQ2Esb0JBQWUsR0FBc0QsU0FBUyxDQUFDO1FBQy9GLG9FQUFvRTtRQUNwRCxvQkFBZSxHQUF3QixTQUFTLENBQUM7UUFDakU7Ozs7d0NBSWdDO1FBQ2hCLDRCQUF1QixHQUF1QixTQUFTLENBQUM7UUFDeEUsaUlBQWlJO1FBQ2pILHVCQUFrQixHQUFrRCxTQUFTLENBQUM7UUFDOUYsa0RBQWtEO1FBQ2xDLGtCQUFhLEdBQW9ELFNBQVMsQ0FBQztRQUMzRix5REFBeUQ7UUFDekMsd0JBQW1CLEdBQTBELFNBQVMsQ0FBQztRQUN2Ryx3REFBd0Q7UUFDeEMsc0JBQWlCLEdBQXdELFNBQVMsQ0FBQztRQUNuRyxxS0FBcUs7UUFDckosdUJBQWtCLEdBQStELFNBQVMsQ0FBQztRQUMzRyx5RUFBeUU7UUFDekQsc0JBQWlCLEdBQXlDLFNBQVMsQ0FBQztRQUNwRixnRUFBZ0U7UUFDaEQsbUJBQWMsR0FBd0IsU0FBUyxDQUFDO1FBQ2hFLDJKQUEySjtRQUMzSSxvQkFBZSxHQUF5QyxTQUFTLENBQUM7UUFDbEYsd01BQXdNO1FBQ3hMLDZCQUF3QixHQUFRLFNBQVMsQ0FBQztRQUMxRCxxRUFBcUU7UUFDckQsMEJBQXFCLEdBQVEsU0FBUyxDQUFDO1FBQ3ZEOytHQUN1RztRQUN2RixhQUFRLEdBQXlCLFNBQVMsQ0FBQztRQUMzRCxzRkFBc0Y7UUFDdEUsc0JBQWlCLEdBQWtDLFNBQVMsQ0FBQztRQUM3RSwyRUFBMkU7UUFDM0QsaUJBQVksR0FBd0IsU0FBUyxDQUFDO1FBQzlELHlHQUF5RztRQUN6Riw0QkFBdUIsR0FBMEQsU0FBUyxDQUFDO1FBQzNHLG9GQUFvRjtRQUNwRSx3Q0FBbUMsR0FBd0IsU0FBUyxDQUFDO1FBQ3JGLHdFQUF3RTtRQUN4RCxrQkFBYSxHQUE0RCxTQUFTLENBQUM7UUFDbkcsbUdBQW1HO1FBQ25GLFdBQU0sR0FBd0MsU0FBUyxDQUFDO1FBQ3hFLDBIQUEwSDtRQUMxRyxrQkFBYSxHQUFpQyxTQUFTLENBQUM7UUFDeEUsaUhBQWlIO1FBQ2pHLGVBQVUsR0FBd0IsU0FBUyxDQUFDO1FBQzVEO1dBQ0c7UUFDYSwwQkFBcUIsR0FBMkUsU0FBUyxDQUFDO1FBQzFIO1dBQ0c7UUFDYSxtQ0FBOEIsR0FBUSxTQUFTLENBQUM7UUFDaEU7V0FDRztRQUNhLGdDQUEyQixHQUFRLFNBQVMsQ0FBQztRQUM3RDtXQUNHO1FBQ2EsNEJBQXVCLEdBQTRDLFNBQVMsQ0FBQztRQUM3RiwrQ0FBK0M7UUFDL0IsVUFBSyxHQUF3QixTQUFTLENBQUM7UUFDdkQseUhBQXlIO1FBQ3pHLGlCQUFZLEdBQXdCLFNBQVMsQ0FBQztRQUM5RDs7dUtBRStKO1FBQy9JLGVBQVUsR0FBOEIsU0FBUyxDQUFDO1FBQ2xFLDhIQUE4SDtRQUM5RyxzQkFBaUIsR0FBdUIsU0FBUyxDQUFDO1FBQ2xFO29IQUM0RztRQUM1RixvQkFBZSxHQUE2RCxTQUFTLENBQUM7UUFDdEcsMkpBQTJKO1FBQzNJLGdCQUFXLEdBQXdCLFNBQVMsQ0FBQztRQUM3RCx5R0FBeUc7UUFDekYsY0FBUyxHQUEwQyxTQUFTLENBQUM7UUFDN0UsNkhBQTZIO1FBQzdHLGNBQVMsR0FBa0QsU0FBUyxDQUFDO1FBQ3JGLHFFQUFxRTtRQUNyRCxtQkFBYyxHQUErQixTQUFTLENBQUM7UUFDdkUsbURBQW1EO1FBQ25DLGlCQUFZLEdBQTJFLFNBQVMsQ0FBQztRQUNqSCwyREFBMkQ7UUFDM0MsMEJBQXFCLEdBQVEsU0FBUyxDQUFDO1FBQ3ZELDhEQUE4RDtRQUM5Qyx1QkFBa0IsR0FBUSxTQUFTLENBQUM7UUFDcEQsb0dBQW9HO1FBQ3BGLHlCQUFvQixHQUF5QyxTQUFTLENBQUM7UUFDdkYseUdBQXlHO1FBQ3pGLGVBQVUsR0FBd0IsU0FBUyxDQUFDO1FBQzVELGtHQUFrRztRQUNsRixhQUFRLEdBQXdCLFNBQVMsQ0FBQztRQUMxRCw2REFBNkQ7UUFDN0MsMEJBQXFCLEdBQXdCLFNBQVMsQ0FBQztRQUN2RSxxSUFBcUk7UUFDckgsc0JBQWlCLEdBQXdCLFNBQVMsQ0FBQztRQUNuRSx5R0FBeUc7UUFDekYsWUFBTyxHQUEwQyxTQUFTLENBQUM7UUFDM0U7bUZBQzJFO1FBQzNELGdCQUFXLEdBQTBFLFNBQVMsQ0FBQztRQUMvRyw4SEFBOEg7UUFDOUcsY0FBUyxHQUE0QyxTQUFTLENBQUM7UUFDL0UsZ0ZBQWdGO1FBQ2hFLHVCQUFrQixHQUFnRixTQUFTLENBQUM7UUFDNUgscURBQXFEO1FBQ3JDLGFBQVEsR0FBd0IsU0FBUyxDQUFDO1FBQzFELDRIQUE0SDtRQUM1RyxvQkFBZSxHQUF3QixTQUFTLENBQUM7UUFDakU7OzZKQUVxSjtRQUNySSxrQkFBYSxHQUE4QixTQUFTLENBQUM7UUFDckUsaUlBQWlJO1FBQ2pILHlCQUFvQixHQUF1QixTQUFTLENBQUM7UUFDckU7K0ZBQ3VGO1FBQ3ZFLG1CQUFjLEdBQXdCLFNBQVMsQ0FBQztRQUNoRTs4RkFDc0Y7UUFDdEUsZ0JBQVcsR0FBd0IsU0FBUyxDQUFDO1FBQzdELCtGQUErRjtRQUMvRSxZQUFPLEdBQXlDLFNBQVMsQ0FBQztRQUMxRSwySEFBMkg7UUFDM0csbUJBQWMsR0FBa0MsU0FBUyxDQUFDO1FBQzFFOzt1SUFFK0g7UUFDL0csb0JBQWUsR0FBeUIsU0FBUyxDQUFDO1FBQ2xFLGtKQUFrSjtRQUNsSSxpQkFBWSxHQUFpQyxTQUFTLENBQUM7UUFDdkUseURBQXlEO1FBQ3pDLGFBQVEsR0FBd0IsU0FBUyxDQUFDO1FBQzFELHNFQUFzRTtRQUN0RCxTQUFJLEdBQThCLFNBQVMsQ0FBQztRQUM1RCx3SEFBd0g7UUFDeEcsZ0JBQVcsR0FBdUIsU0FBUyxDQUFDO1FBQzVELDhHQUE4RztRQUM5RixjQUFTLEdBQThCLFNBQVMsQ0FBQztRQUNqRSw2SEFBNkg7UUFDN0cscUJBQWdCLEdBQXVCLFNBQVMsQ0FBQztRQUNqRSx3SkFBd0o7UUFDeEksaUJBQVksR0FBa0MsU0FBUyxDQUFDO1FBQ3hFLGtEQUFrRDtRQUNsQyxlQUFVLEdBQTRHLFNBQVMsQ0FBQztRQUNoSiwwR0FBMEc7UUFDMUYsZUFBVSxHQUF3QixTQUFTLENBQUM7UUFDNUQ7V0FDRztRQUNhLGFBQVEsR0FBdUIsU0FBUyxDQUFDO1FBQ3pELDZJQUE2STtRQUM3SCxZQUFPLEdBQW9ELFNBQVMsQ0FBQztRQUNyRix3SUFBd0k7UUFDeEgsWUFBTyxHQUFvRCxTQUFTLENBQUM7UUFDckYsZ0RBQWdEO1FBQ2hDLFVBQUssR0FBdUIsU0FBUyxDQUFDO1FBQ3RELHlIQUF5SDtRQUN6RyxpQkFBWSxHQUF1QixTQUFTLENBQUM7UUFDN0QsZ0RBQWdEO1FBQ2hDLGFBQVEsR0FBdUIsU0FBUyxDQUFDO1FBQ3pELGdEQUFnRDtRQUNoQyxhQUFRLEdBQXVCLFNBQVMsQ0FBQztRQUN6RCxrR0FBa0c7UUFDbEYsU0FBSSxHQUF1QixTQUFTLENBQUM7UUFDckQsd0hBQXdIO1FBQ3hHLGdCQUFXLEdBQXVCLFNBQVMsQ0FBQztRQUM1RCxnRUFBZ0U7UUFDaEQsY0FBUyxHQUF3QixTQUFTLENBQUM7UUFDM0QscUdBQXFHO1FBQ3JGLHNCQUFpQixHQUF3QixTQUFTLENBQUM7UUFDbkUsMEdBQTBHO1FBQzFGLHFCQUFnQixHQUF3QixTQUFTLENBQUM7UUE0Q2xFLFFBQVE7SUFFWixDQUFDO0lBeldVLGVBQWU7UUFDbEIsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuRCx1RUFBdUU7WUFDdkUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDO1NBQ2hGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLFFBQVE7UUFDWCxJQUFJLE1BQU0sR0FBVyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDbEIsTUFBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVPLGVBQWUsQ0FBQyxZQUFxQztRQUN6RCxPQUFPLFlBQVk7WUFDZix1RUFBdUU7YUFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDM0MsR0FBRyxDQUFDLENBQUMsTUFBb0IsRUFBRSxFQUFFO1lBQzFCLE9BQU8sTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVPLDBCQUEwQixDQUFDLElBQWtCO1FBQ2pELElBQUksRUFBRSxZQUFZLEtBQWdCLElBQUksRUFBbEIsdUNBQWtCLENBQUM7UUFDdkMsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQTRVSixDQUFBO0FBM1drQztJQUE5QixlQUFlLENBQUMsY0FBWSxDQUFDOzhCQUFzQixTQUFTO2tEQUFlO0FBbUNuRTtJQUFSLEtBQUssRUFBRTs7cURBQXlDO0FBQ3hDO0lBQVIsS0FBSyxFQUFFOztrREFBc0M7QUFDckM7SUFBUixLQUFLLEVBQUU7OzZEQUFpRDtBQUNoRDtJQUFSLEtBQUssRUFBRTs7bUVBQXVEO0FBQ3REO0lBQVIsS0FBSyxFQUFFOztzRUFBMEQ7QUFDekQ7SUFBUixLQUFLLEVBQUU7OzRDQUFnQztBQUUvQjtJQUFSLEtBQUssRUFBRTs7Z0RBQW1EO0FBRWxEO0lBQVIsS0FBSyxFQUFFOzt1REFBa0Y7QUFHakY7SUFBUixLQUFLLEVBQUU7O21EQUFzRDtBQUVyRDtJQUFSLEtBQUssRUFBRTs7aURBQXlEO0FBRXhEO0lBQVIsS0FBSyxFQUFFOztpRUFBc0g7QUFFckg7SUFBUixLQUFLLEVBQUU7O3FEQUF3RDtBQUV2RDtJQUFSLEtBQUssRUFBRTs7b0RBQStEO0FBRTlEO0lBQVIsS0FBSyxFQUFFOzs4REFBa0U7QUFFakU7SUFBUixLQUFLLEVBQUU7OzhEQUFrRTtBQUNqRTtJQUFSLEtBQUssRUFBRTs7c0RBQW9GO0FBQ25GO0lBQVIsS0FBSyxFQUFFOzsrREFBbUQ7QUFDbEQ7SUFBUixLQUFLLEVBQUU7OzREQUFnRDtBQUUvQztJQUFSLEtBQUssRUFBRTs7OENBQW1FO0FBRWxFO0lBQVIsS0FBSyxFQUFFOzs2Q0FBZ0Q7QUFFL0M7SUFBUixLQUFLLEVBQUU7O21EQUF1RDtBQUV0RDtJQUFSLEtBQUssRUFBRTs7bURBQXVEO0FBRXREO0lBQVIsS0FBSyxFQUFFOzswREFBNEY7QUFFM0Y7SUFBUixLQUFLLEVBQUU7O21FQUF1RDtBQUV0RDtJQUFSLEtBQUssRUFBRTs7Z0VBQW9EO0FBSW5EO0lBQVIsS0FBSyxFQUFFOzsyQ0FBOEM7QUFFN0M7SUFBUixLQUFLLEVBQUU7OzJDQUE4QztBQUc3QztJQUFSLEtBQUssRUFBRTs7MENBQXdEO0FBRXZEO0lBQVIsS0FBSyxFQUFFOztpREFBc0U7QUFFckU7SUFBUixLQUFLLEVBQUU7O29EQUE0RTtBQUUzRTtJQUFSLEtBQUssRUFBRTs7NkNBQW9FO0FBSW5FO0lBQVIsS0FBSyxFQUFFOztnREFBbUY7QUFHbEY7SUFBUixLQUFLLEVBQUU7OzRDQUFnRjtBQUUvRTtJQUFSLEtBQUssRUFBRTs7a0RBQXFEO0FBRXBEO0lBQVIsS0FBSyxFQUFFOzt3REFBeUY7QUFFeEY7SUFBUixLQUFLLEVBQUU7O3VEQUF1RjtBQUV0RjtJQUFSLEtBQUssRUFBRTs7MkNBQTZFO0FBRzVFO0lBQVIsS0FBSyxFQUFFOzt1REFBdUY7QUFFdEY7SUFBUixLQUFLLEVBQUU7OzJEQUEwRztBQUd6RztJQUFSLEtBQUssRUFBRTs7bURBQStFO0FBRTlFO0lBQVIsS0FBSyxFQUFFOzt3REFBNEQ7QUFFM0Q7SUFBUixLQUFLLEVBQUU7OzBDQUE4QztBQUU3QztJQUFSLEtBQUssRUFBRTs7aURBQXFEO0FBRXBEO0lBQVIsS0FBSyxFQUFFOztpREFBcUQ7QUFFcEQ7SUFBUixLQUFLLEVBQUU7O2tEQUFzRDtBQUVyRDtJQUFSLEtBQUssRUFBRTs7cURBQXlEO0FBRXhEO0lBQVIsS0FBSyxFQUFFOzs4Q0FBcUU7QUFFcEU7SUFBUixLQUFLLEVBQUU7O2lEQUFzRTtBQUVyRTtJQUFSLEtBQUssRUFBRTs7aURBQXNFO0FBRXJFO0lBQVIsS0FBSyxFQUFFOztnREFBaUY7QUFFaEY7SUFBUixLQUFLLEVBQUU7O3lEQUE2QztBQUU1QztJQUFSLEtBQUssRUFBRTs7c0RBQTBDO0FBRXpDO0lBQVIsS0FBSyxFQUFFOzt3REFBMkU7QUFFMUU7SUFBUixLQUFLLEVBQUU7O3FEQUF5RDtBQUd4RDtJQUFSLEtBQUssRUFBRTs7cURBQXVGO0FBRXRGO0lBQVIsS0FBSyxFQUFFOztxREFBeUQ7QUFNeEQ7SUFBUixLQUFLLEVBQUU7OzZEQUFnRTtBQUUvRDtJQUFSLEtBQUssRUFBRTs7d0RBQXNGO0FBRXJGO0lBQVIsS0FBSyxFQUFFOzttREFBbUY7QUFFbEY7SUFBUixLQUFLLEVBQUU7O3lEQUErRjtBQUU5RjtJQUFSLEtBQUssRUFBRTs7dURBQTJGO0FBRTFGO0lBQVIsS0FBSyxFQUFFOzt3REFBbUc7QUFFbEc7SUFBUixLQUFLLEVBQUU7O3VEQUE0RTtBQUUzRTtJQUFSLEtBQUssRUFBRTs7b0RBQXdEO0FBRXZEO0lBQVIsS0FBSyxFQUFFOztxREFBMEU7QUFFekU7SUFBUixLQUFLLEVBQUU7OzhEQUFrRDtBQUVqRDtJQUFSLEtBQUssRUFBRTs7MkRBQStDO0FBRzlDO0lBQVIsS0FBSyxFQUFFOzs4Q0FBbUQ7QUFFbEQ7SUFBUixLQUFLLEVBQUU7O3VEQUFxRTtBQUVwRTtJQUFSLEtBQUssRUFBRTs7a0RBQXNEO0FBRXJEO0lBQVIsS0FBSyxFQUFFOzs2REFBbUc7QUFFbEc7SUFBUixLQUFLLEVBQUU7O3lFQUE2RTtBQUU1RTtJQUFSLEtBQUssRUFBRTs7bURBQTJGO0FBRTFGO0lBQVIsS0FBSyxFQUFFOzs0Q0FBZ0U7QUFFL0Q7SUFBUixLQUFLLEVBQUU7O21EQUFnRTtBQUUvRDtJQUFSLEtBQUssRUFBRTs7Z0RBQW9EO0FBR25EO0lBQVIsS0FBSyxFQUFFOzsyREFBa0g7QUFHakg7SUFBUixLQUFLLEVBQUU7O29FQUF3RDtBQUd2RDtJQUFSLEtBQUssRUFBRTs7aUVBQXFEO0FBR3BEO0lBQVIsS0FBSyxFQUFFOzs2REFBcUY7QUFFcEY7SUFBUixLQUFLLEVBQUU7OzJDQUErQztBQUU5QztJQUFSLEtBQUssRUFBRTs7a0RBQXNEO0FBSXJEO0lBQVIsS0FBSyxFQUFFOztnREFBMEQ7QUFFekQ7SUFBUixLQUFLLEVBQUU7O3VEQUEwRDtBQUd6RDtJQUFSLEtBQUssRUFBRTs7cURBQThGO0FBRTdGO0lBQVIsS0FBSyxFQUFFOztpREFBcUQ7QUFFcEQ7SUFBUixLQUFLLEVBQUU7OytDQUFxRTtBQUVwRTtJQUFSLEtBQUssRUFBRTs7K0NBQTZFO0FBRTVFO0lBQVIsS0FBSyxFQUFFOztvREFBK0Q7QUFFOUQ7SUFBUixLQUFLLEVBQUU7O2tEQUF5RztBQUV4RztJQUFSLEtBQUssRUFBRTs7MkRBQStDO0FBRTlDO0lBQVIsS0FBSyxFQUFFOzt3REFBNEM7QUFFM0M7SUFBUixLQUFLLEVBQUU7OzBEQUErRTtBQUU5RTtJQUFSLEtBQUssRUFBRTs7Z0RBQW9EO0FBRW5EO0lBQVIsS0FBSyxFQUFFOzs4Q0FBa0Q7QUFFakQ7SUFBUixLQUFLLEVBQUU7OzJEQUErRDtBQUU5RDtJQUFSLEtBQUssRUFBRTs7dURBQTJEO0FBRTFEO0lBQVIsS0FBSyxFQUFFOzs2Q0FBbUU7QUFHbEU7SUFBUixLQUFLLEVBQUU7O2lEQUF1RztBQUV0RztJQUFSLEtBQUssRUFBRTs7K0NBQXVFO0FBRXRFO0lBQVIsS0FBSyxFQUFFOzt3REFBb0g7QUFFbkg7SUFBUixLQUFLLEVBQUU7OzhDQUFrRDtBQUVqRDtJQUFSLEtBQUssRUFBRTs7cURBQXlEO0FBSXhEO0lBQVIsS0FBSyxFQUFFOzttREFBNkQ7QUFFNUQ7SUFBUixLQUFLLEVBQUU7OzBEQUE2RDtBQUc1RDtJQUFSLEtBQUssRUFBRTs7b0RBQXdEO0FBR3ZEO0lBQVIsS0FBSyxFQUFFOztpREFBcUQ7QUFFcEQ7SUFBUixLQUFLLEVBQUU7OzZDQUFrRTtBQUVqRTtJQUFSLEtBQUssRUFBRTs7b0RBQWtFO0FBSWpFO0lBQVIsS0FBSyxFQUFFOztxREFBMEQ7QUFFekQ7SUFBUixLQUFLLEVBQUU7O2tEQUErRDtBQUU5RDtJQUFSLEtBQUssRUFBRTs7OENBQWtEO0FBRWpEO0lBQVIsS0FBSyxFQUFFOzswQ0FBb0Q7QUFFbkQ7SUFBUixLQUFLLEVBQUU7O2lEQUFvRDtBQUVuRDtJQUFSLEtBQUssRUFBRTs7K0NBQXlEO0FBRXhEO0lBQVIsS0FBSyxFQUFFOztzREFBeUQ7QUFFeEQ7SUFBUixLQUFLLEVBQUU7O2tEQUFnRTtBQUUvRDtJQUFSLEtBQUssRUFBRTs7Z0RBQXdJO0FBRXZJO0lBQVIsS0FBSyxFQUFFOztnREFBb0Q7QUFHbkQ7SUFBUixLQUFLLEVBQUU7OzhDQUFpRDtBQUVoRDtJQUFSLEtBQUssRUFBRTs7NkNBQTZFO0FBRTVFO0lBQVIsS0FBSyxFQUFFOzs2Q0FBNkU7QUFFNUU7SUFBUixLQUFLLEVBQUU7OzJDQUE4QztBQUU3QztJQUFSLEtBQUssRUFBRTs7a0RBQXFEO0FBRXBEO0lBQVIsS0FBSyxFQUFFOzs4Q0FBaUQ7QUFFaEQ7SUFBUixLQUFLLEVBQUU7OzhDQUFpRDtBQUVoRDtJQUFSLEtBQUssRUFBRTs7MENBQTZDO0FBRTVDO0lBQVIsS0FBSyxFQUFFOztpREFBb0Q7QUFFbkQ7SUFBUixLQUFLLEVBQUU7OytDQUFtRDtBQUVsRDtJQUFSLEtBQUssRUFBRTs7dURBQTJEO0FBRTFEO0lBQVIsS0FBSyxFQUFFOztzREFBMEQ7QUE5VHpELFlBQVk7SUFKeEIsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixRQUFRLEVBQUUsRUFBRTtLQUNmLENBQUM7R0FDVyxZQUFZLENBNFd4QjtTQTVXWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2VsbENsYXNzRnVuYywgQ2VsbENsYXNzUnVsZXMsIENlbGxDbGlja2VkRXZlbnQsIENlbGxDb250ZXh0TWVudUV2ZW50LCBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LCBDZWxsRWRpdG9yU2VsZWN0b3JGdW5jLCBDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMsIENlbGxTdHlsZSwgQ2VsbFN0eWxlRnVuYywgQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjaywgQ29sRGVmLCBDb2xHcm91cERlZiwgQ29sU3BhblBhcmFtcywgQ29sdW1uc01lbnVQYXJhbXMsIERuZFNvdXJjZUNhbGxiYWNrLCBFZGl0YWJsZUNhbGxiYWNrLCBHZXRRdWlja0ZpbHRlclRleHRQYXJhbXMsIEhlYWRlckNoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2ssIEhlYWRlckNsYXNzLCBIZWFkZXJWYWx1ZUdldHRlckZ1bmMsIElBZ2dGdW5jLCBJQ2VsbEVkaXRvckNvbXAsIElDZWxsUmVuZGVyZXJDb21wLCBJQ2VsbFJlbmRlcmVyRnVuYywgSUhlYWRlckdyb3VwQ29tcCwgSVJvd0RyYWdJdGVtLCBJVG9vbHRpcENvbXAsIElUb29sdGlwUGFyYW1zLCBLZXlDcmVhdG9yUGFyYW1zLCBOZXdWYWx1ZVBhcmFtcywgUm93RHJhZ0NhbGxiYWNrLCBSb3dOb2RlLCBSb3dTcGFuUGFyYW1zLCBTdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnRQYXJhbXMsIFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcywgU3VwcHJlc3NOYXZpZ2FibGVDYWxsYmFjaywgU3VwcHJlc3NQYXN0ZUNhbGxiYWNrLCBUb29sUGFuZWxDbGFzcywgVmFsdWVGb3JtYXR0ZXJGdW5jLCBWYWx1ZUdldHRlckZ1bmMsIFZhbHVlUGFyc2VyRnVuYywgVmFsdWVTZXR0ZXJGdW5jIH0gZnJvbSBcIkBhZy1ncmlkLWNvbW11bml0eS9jb3JlXCI7XG5pbXBvcnQgeyBDb21wb25lbnQsIENvbnRlbnRDaGlsZHJlbiwgSW5wdXQsIFF1ZXJ5TGlzdCB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1jb2x1bW4nLFxuICAgIHRlbXBsYXRlOiAnJ1xufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRDb2x1bW4ge1xuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY2hpbGRDb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPjtcblxuICAgIHB1YmxpYyBoYXNDaGlsZENvbHVtbnMoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmNoaWxkQ29sdW1ucyAmJiB0aGlzLmNoaWxkQ29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBuZWNlc3NhcnkgYmVjYXVzZSBvZiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xMDA5OFxuICAgICAgICAgICAgcmV0dXJuICEodGhpcy5jaGlsZENvbHVtbnMubGVuZ3RoID09PSAxICYmIHRoaXMuY2hpbGRDb2x1bW5zLmZpcnN0ID09PSB0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHRvQ29sRGVmKCk6IENvbERlZiB7XG4gICAgICAgIGxldCBjb2xEZWY6IENvbERlZiA9IHRoaXMuY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4odGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQ2hpbGRDb2x1bW5zKCkpIHtcbiAgICAgICAgICAgICg8YW55PmNvbERlZilbXCJjaGlsZHJlblwiXSA9IHRoaXMuZ2V0Q2hpbGRDb2xEZWZzKHRoaXMuY2hpbGRDb2x1bW5zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sRGVmO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q2hpbGRDb2xEZWZzKGNoaWxkQ29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj4pIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkQ29sdW1uc1xuICAgICAgICAgICAgLy8gbmVjZXNzYXJ5IGJlY2F1c2Ugb2YgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTAwOThcbiAgICAgICAgICAgIC5maWx0ZXIoY29sdW1uID0+ICFjb2x1bW4uaGFzQ2hpbGRDb2x1bW5zKCkpXG4gICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlQ29sRGVmRnJvbUdyaWRDb2x1bW4oZnJvbTogQWdHcmlkQ29sdW1uKTogQ29sRGVmIHtcbiAgICAgICAgbGV0IHsgY2hpbGRDb2x1bW5zLCAuLi5jb2xEZWYgfSA9IGZyb207XG4gICAgICAgIHJldHVybiBjb2xEZWY7XG4gICAgfVxuXG4gICAgLy8gaW5wdXRzIC0gcHJldHR5IG11Y2ggbW9zdCBvZiBDb2xEZWYsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZiB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmwgYW5kIGludGVybmFsIG9ubHkgcHJvcGVydGllc1xuICAgIC8vIEBTVEFSVEBcbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGZpbHRlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlckNvbXBvbmVudEZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWx0ZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIG5hbWUgdG8gcmVuZGVyIGluIHRoZSBjb2x1bW4gaGVhZGVyLiBJZiBub3Qgc3BlY2lmaWVkIGFuZCBmaWVsZCBpcyBzcGVjaWZpZWQsIHRoZSBmaWVsZCBuYW1lIHdpbGwgYmUgdXNlZCBhcyB0aGUgaGVhZGVyIG5hbWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIEdldHMgdGhlIHZhbHVlIGZvciBkaXNwbGF5IGluIHRoZSBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJWYWx1ZUdldHRlcjogc3RyaW5nIHwgSGVhZGVyVmFsdWVHZXR0ZXJGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGV0aGVyIHRvIHNob3cgdGhlIGNvbHVtbiB3aGVuIHRoZSBncm91cCBpcyBvcGVuIC8gY2xvc2VkLiAgICAgKi9cbi8qKiBUb29sdGlwIGZvciB0aGUgY29sdW1uIGhlYWRlciAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyVG9vbHRpcDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MgdG8gdXNlIGZvciB0aGUgaGVhZGVyIGNlbGwuIENhbiBiZSBhIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3IgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDbGFzczogSGVhZGVyQ2xhc3MgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFN1cHByZXNzIHRoZSBncmlkIHRha2luZyBhY3Rpb24gZm9yIHRoZSByZWxldmFudCBrZXlib2FyZCBldmVudCB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnQ6ICgocGFyYW1zOiBTdXBwcmVzc0hlYWRlcktleWJvYXJkRXZlbnRQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGV0aGVyIHRvIHNob3cgdGhlIGNvbHVtbiB3aGVuIHRoZSBncm91cCBpcyBvcGVuIC8gY2xvc2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uR3JvdXBTaG93OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENTUyBjbGFzcyB0byB1c2UgZm9yIHRoZSB0b29sIHBhbmVsIGNlbGwuIENhbiBiZSBhIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3IgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sUGFuZWxDbGFzczogVG9vbFBhbmVsQ2xhc3MgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgeW91IGRvIG5vdCB3YW50IHRoaXMgY29sdW1uIG9yIGdyb3VwIHRvIGFwcGVhciBpbiB0aGUgQ29sdW1ucyBUb29sIFBhbmVsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiAoZmlsdGVyKSBvciBncm91cCAoZmlsdGVyIGdyb3VwKSB0byBhcHBlYXIgaW4gdGhlIEZpbHRlcnMgVG9vbCBQYW5lbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmlsdGVyc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcENvbXBvbmVudDogeyBuZXcoKTogSVRvb2x0aXBDb21wOyB9IHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBsaXN0IGNvbnRhaW5pbmcgYSBtaXggb2YgY29sdW1ucyBhbmQgY29sdW1uIGdyb3Vwcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoaWxkcmVuOiAoQ29sRGVmIHwgQ29sR3JvdXBEZWYpW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSB1bmlxdWUgSUQgdG8gZ2l2ZSB0aGUgY29sdW1uLiBUaGlzIGlzIG9wdGlvbmFsLiBJZiBtaXNzaW5nLCBhIHVuaXF1ZSBJRCB3aWxsIGJlIGdlbmVyYXRlZC4gVGhpcyBJRCBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSBjb2x1bW4gZ3JvdXAgaW4gdGhlIGNvbHVtbiBBUEkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cElkOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBncm91cCBzaG91bGQgYmUgb3BlbmVkIGJ5IGRlZmF1bHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvcGVuQnlEZWZhdWx0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgY29sdW1ucyBpbiB0aGlzIGdyb3VwIGJlc2lkZSBlYWNoIG90aGVyIGluIHRoZSBncmlkLiBNb3ZpbmcgdGhlIGNvbHVtbnMgb3V0c2lkZSBvZiB0aGUgZ3JvdXAgKGFuZCBoZW5jZSBicmVha2luZyB0aGUgZ3JvdXApIGlzIG5vdCBhbGxvd2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWFycnlDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGN1c3RvbSBoZWFkZXIgZ3JvdXAgY29tcG9uZW50IHRvIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgY29tcG9uZW50IGhlYWRlci4gSWYgbm9uZSBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgQUcgR3JpZCBpcyB1c2VkKiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVyR3JvdXBDb21wb25lbnQ6IHN0cmluZyB8IHsgbmV3KCk6IElIZWFkZXJHcm91cENvbXA7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBjdXN0b20gaGVhZGVyIGdyb3VwIGNvbXBvbmVudCB0byBiZSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGNvbXBvbmVudCBoZWFkZXIgaW4gdGhlIGhvc3RpbmcgZnJhbWV3b3JrIChpZTogQW5ndWxhci9SZWFjdC9WdWVKcykuIElmIG5vbmUgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IEFHIEdyaWQgaXMgdXNlZCogICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckdyb3VwQ29tcG9uZW50RnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBwYXJhbXMgdXNlZCB0byBjb25maWd1cmUgdGhlIGhlYWRlciBncm91cCBjb21wb25lbnQuICAgICAqICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJHcm91cENvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgdW5pcXVlIElEIHRvIGdpdmUgdGhlIGNvbHVtbi4gVGhpcyBpcyBvcHRpb25hbC4gSWYgbWlzc2luZywgdGhlIElEIHdpbGwgZGVmYXVsdCB0byB0aGUgZmllbGQuXG4gICAgICogSWYgYm90aCBmaWVsZCBhbmQgY29sSWQgYXJlIG1pc3NpbmcsIGEgdW5pcXVlIElEIHdpbGwgYmUgZ2VuZXJhdGVkLlxuICAgICAqIFRoaXMgSUQgaXMgdXNlZCB0byBpZGVudGlmeSB0aGUgY29sdW1uIGluIHRoZSBBUEkgZm9yIHNvcnRpbmcsIGZpbHRlcmluZyBldGMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xJZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZmllbGQgb2YgdGhlIHJvdyB0byBnZXQgdGhlIGNlbGxzIGRhdGEgZnJvbSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmllbGQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjb21tYSBzZXBhcmF0ZWQgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MgY29udGFpbmluZyBgQ29sdW1uVHlwZWAga2V5cyB3aGljaCBjYW4gYmUgdXNlZCBhcyBhIHRlbXBsYXRlIGZvciBhIGNvbHVtbi5cbiAgICAgKiBUaGlzIGhlbHBzIHRvIHJlZHVjZSBkdXBsaWNhdGlvbiBvZiBwcm9wZXJ0aWVzIHdoZW4geW91IGhhdmUgYSBsb3Qgb2YgY29tbW9uIGNvbHVtbiBwcm9wZXJ0aWVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHlwZTogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIG9yIGV4cHJlc3Npb24uIEdldHMgdGhlIHZhbHVlIGZyb20geW91ciBkYXRhIGZvciBkaXNwbGF5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVHZXR0ZXI6IHN0cmluZyB8IFZhbHVlR2V0dGVyRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBmdW5jdGlvbiBvciBleHByZXNzaW9uIHRvIGZvcm1hdCBhIHZhbHVlLCBzaG91bGQgcmV0dXJuIGEgc3RyaW5nLiBOb3QgdXNlZCBmb3IgQ1NWIGV4cG9ydCBvciBjb3B5IHRvIGNsaXBib2FyZCwgb25seSBmb3IgVUkgY2VsbCByZW5kZXJpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUZvcm1hdHRlcjogc3RyaW5nIHwgVmFsdWVGb3JtYXR0ZXJGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlZCBhIHJlZmVyZW5jZSBkYXRhIG1hcCB0byBiZSB1c2VkIHRvIG1hcCBjb2x1bW4gdmFsdWVzIHRvIHRoZWlyIHJlc3BlY3RpdmUgdmFsdWUgZnJvbSB0aGUgbWFwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVmRGF0YTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmc7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZ1bmN0aW9uIHRvIHJldHVybiBhIHN0cmluZyBrZXkgZm9yIGEgdmFsdWUuXG4gICAgICogVGhpcyBzdHJpbmcgaXMgdXNlZCBmb3IgZ3JvdXBpbmcsIFNldCBmaWx0ZXJpbmcsIGFuZCBzZWFyY2hpbmcgd2l0aGluIGNlbGwgZWRpdG9yIGRyb3Bkb3ducy5cbiAgICAgKiBXaGVuIGZpbHRlcmluZyBhbmQgc2VhcmNoaW5nIHRoZSBzdHJpbmcgaXMgZXhwb3NlZCB0byB0aGUgdXNlciwgc28gbWFrZSBzdXJlIHRvIHJldHVybiBhIGh1bWFuLXJlYWRhYmxlIHZhbHVlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2V5Q3JlYXRvcjogKChwYXJhbXM6IEtleUNyZWF0b3JQYXJhbXMpID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbSBjb21wYXJhdG9yIGZvciB2YWx1ZXMsIHVzZWQgYnkgcmVuZGVyZXIgdG8ga25vdyBpZiB2YWx1ZXMgaGF2ZSBjaGFuZ2VkLiBDZWxscyB3aG8ncyB2YWx1ZXMgaGF2ZSBub3QgY2hhbmdlZCBkb24ndCBnZXQgcmVmcmVzaGVkLlxuICAgICAqIEJ5IGRlZmF1bHQgdGhlIGdyaWQgdXNlcyBgPT09YCBpcyB1c2VkIHdoaWNoIHNob3VsZCB3b3JrIGZvciBtb3N0IHVzZSBjYXNlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVxdWFsczogKCh2YWx1ZUE6IGFueSwgdmFsdWVCOiBhbnkpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZmllbGQgb2YgdGhlIHRvb2x0aXAgdG8gYXBwbHkgdG8gdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwRmllbGQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdGhhdCBzaG91bGQgcmV0dXJuIHRoZSBzdHJpbmcgdXNlZCBmb3IgYSB0b29sdGlwLCBgdG9vbHRpcEZpZWxkYCB0YWtlcyBwcmVjZWRlbmNlIGlmIHNldC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBWYWx1ZUdldHRlcjogKChwYXJhbXM6IElUb29sdGlwUGFyYW1zKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBgYm9vbGVhbmAgb3IgYEZ1bmN0aW9uYC4gU2V0IHRvIGB0cnVlYCAob3IgcmV0dXJuIGB0cnVlYCBmcm9tIGZ1bmN0aW9uKSB0byByZW5kZXIgYSBzZWxlY3Rpb24gY2hlY2tib3ggaW4gdGhlIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgQ2hlY2tib3hTZWxlY3Rpb25DYWxsYmFjayB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWNvbnMgdG8gdXNlIGluc2lkZSB0aGUgY29sdW1uIGluc3RlYWQgb2YgdGhlIGdyaWQncyBkZWZhdWx0IGljb25zLiBMZWF2ZSB1bmRlZmluZWQgdG8gdXNlIGRlZmF1bHRzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfCBzdHJpbmc7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgaWYgdGhpcyBjb2x1bW4gaXMgbm90IG5hdmlnYWJsZSAoaS5lLiBjYW5ub3QgYmUgdGFiYmVkIGludG8pLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICAgKiBDYW4gYWxzbyBiZSBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGhhdmUgZGlmZmVyZW50IHJvd3MgbmF2aWdhYmxlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOYXZpZ2FibGU6IGJvb2xlYW4gfCBTdXBwcmVzc05hdmlnYWJsZUNhbGxiYWNrIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdGhlIHVzZXIgdG8gc3VwcHJlc3MgY2VydGFpbiBrZXlib2FyZCBldmVudHMgaW4gdGhlIGdyaWQgY2VsbCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NLZXlib2FyZEV2ZW50OiAoKHBhcmFtczogU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUGFzdGluZyBpcyBvbiBieSBkZWZhdWx0IGFzIGxvbmcgYXMgY2VsbHMgYXJlIGVkaXRhYmxlIChub24tZWRpdGFibGUgY2VsbHMgY2Fubm90IGJlIG1vZGlmaWVkLCBldmVuIHdpdGggYSBwYXN0ZSBvcGVyYXRpb24pLlxuICAgICAqIFNldCB0byBgdHJ1ZWAgdHVybiBwYXN0ZSBvcGVyYXRpb25zIG9mZi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFzdGU6IGJvb2xlYW4gfCBTdXBwcmVzc1Bhc3RlQ2FsbGJhY2sgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIHByZXZlbnQgdGhlIGZpbGxIYW5kbGUgZnJvbSBiZWluZyByZW5kZXJlZCBpbiBhbnkgY2VsbCB0aGF0IGJlbG9uZ3MgdG8gdGhpcyBjb2x1bW4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmlsbEhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBmb3IgdGhpcyBjb2x1bW4gdG8gYmUgaGlkZGVuLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyAnaGlkZScsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEhpZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYmxvY2sgbWFraW5nIGNvbHVtbiB2aXNpYmxlIC8gaGlkZGVuIHZpYSB0aGUgVUkgKEFQSSB3aWxsIHN0aWxsIHdvcmspLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Zpc2libGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIGhhdmUgdGhpcyBjb2x1bW4gZGlzcGxheWVkIGZpcnN0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Bvc2l0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiB0byBiZSBtb3ZhYmxlIHZpYSBkcmFnZ2luZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB0aGlzIGNvbHVtbiBpcyBlZGl0YWJsZSwgb3RoZXJ3aXNlIGBmYWxzZWAuIENhbiBhbHNvIGJlIGEgZnVuY3Rpb24gdG8gaGF2ZSBkaWZmZXJlbnQgcm93cyBlZGl0YWJsZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVkaXRhYmxlOiBib29sZWFuIHwgRWRpdGFibGVDYWxsYmFjayB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gU2V0cyB0aGUgdmFsdWUgaW50byB5b3VyIGRhdGEgZm9yIHNhdmluZy4gUmV0dXJuIGB0cnVlYCBpZiB0aGUgZGF0YSBjaGFuZ2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVTZXR0ZXI6IHN0cmluZyB8IFZhbHVlU2V0dGVyRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gb3IgZXhwcmVzc2lvbi4gUGFyc2VzIHRoZSB2YWx1ZSBmb3Igc2F2aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVQYXJzZXI6IHN0cmluZyB8IFZhbHVlUGFyc2VyRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBgY2VsbEVkaXRvcmAgdG8gdXNlIGZvciB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxFZGl0b3I6IHN0cmluZyB8IHsgbmV3KCk6IElDZWxsRWRpdG9yQ29tcDsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRnJhbWV3b3JrIGBjZWxsRWRpdG9yYCB0byB1c2UgZm9yIHRoaXMgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQYXJhbXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBjZWxsIGVkaXRvciBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBjZWxsIGVkaXRvciB0byBiZSB1c2VkIGZvciBhIGdpdmVuIHJvdyB3aXRoaW4gdGhlIHNhbWUgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclNlbGVjdG9yOiBDZWxsRWRpdG9yU2VsZWN0b3JGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgY2VsbHMgdW5kZXIgdGhpcyBjb2x1bW4gZW50ZXIgZWRpdCBtb2RlIGFmdGVyIHNpbmdsZSBjbGljay4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdXNlIGB2YWx1ZVNldHRlcmAgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuZXdWYWx1ZUhhbmRsZXI6ICgocGFyYW1zOiBOZXdWYWx1ZVBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAsIHRvIGhhdmUgdGhlIGNlbGwgZWRpdG9yIGFwcGVhciBpbiBhIHBvcHVwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEVkaXRvclBvcHVwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhlIHBvc2l0aW9uIGZvciB0aGUgcG9wdXAgY2VsbCBlZGl0b3IuIFBvc3NpYmxlIHZhbHVlcyBhcmVcbiAgICAgKiAgIC0gYG92ZXJgIFBvcHVwIHdpbGwgYmUgcG9zaXRpb25lZCBvdmVyIHRoZSBjZWxsXG4gICAgICogICAtIGB1bmRlcmAgUG9wdXAgd2lsbCBiZSBwb3NpdGlvbmVkIGJlbG93IHRoZSBjZWxsIGxlYXZpbmcgdGhlIGNlbGwgdmFsdWUgdmlzaWJsZS5cbiAgICAgKiBcbiAgICAgKiBUaGUgZGVmYXVsdCBpcyBgb3ZlcmAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRWRpdG9yUG9wdXBQb3NpdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBmb3IgYWZ0ZXIgdGhlIHZhbHVlIG9mIGEgY2VsbCBoYXMgY2hhbmdlZCwgZWl0aGVyIGR1ZSB0byBlZGl0aW5nIG9yIHRoZSBhcHBsaWNhdGlvbiBjYWxsaW5nIGBhcGkuc2V0VmFsdWUoKWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxWYWx1ZUNoYW5nZWQ6ICgoZXZlbnQ6IE5ld1ZhbHVlUGFyYW1zKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvbkNlbGxDbGlja2VkOiAoKGV2ZW50OiBDZWxsQ2xpY2tlZEV2ZW50KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgY2FsbGVkIHdoZW4gYSBjZWxsIGlzIGRvdWJsZSBjbGlja2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsRG91YmxlQ2xpY2tlZDogKChldmVudDogQ2VsbERvdWJsZUNsaWNrZWRFdmVudCkgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGNhbGxlZCB3aGVuIGEgY2VsbCBpcyByaWdodCBjbGlja2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb25DZWxsQ29udGV4dE1lbnU6ICgoZXZlbnQ6IENlbGxDb250ZXh0TWVudUV2ZW50KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBmdW5jdGlvbiB0byB0ZWxsIHRoZSBncmlkIHdoYXQgcXVpY2sgZmlsdGVyIHRleHQgdG8gdXNlIGZvciB0aGlzIGNvbHVtbiBpZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgKHdoaWNoIGlzIGNhbGxpbmcgYHRvU3RyaW5nYCBvbiB0aGUgdmFsdWUpLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0UXVpY2tGaWx0ZXJUZXh0OiAoKHBhcmFtczogR2V0UXVpY2tGaWx0ZXJUZXh0UGFyYW1zKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGdW5jdGlvbiBvciBleHByZXNzaW9uLiBHZXRzIHRoZSB2YWx1ZSBmb3IgZmlsdGVyaW5nIHB1cnBvc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsdGVyVmFsdWVHZXR0ZXI6IHN0cmluZyB8IFZhbHVlR2V0dGVyRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hldGhlciB0byBkaXNwbGF5IGEgZmxvYXRpbmcgZmlsdGVyIGZvciB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgY3VzdG9tIGhlYWRlciBjb21wb25lbnQgdG8gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQgaGVhZGVyLiBJZiBub25lIHNwZWNpZmllZCB0aGUgZGVmYXVsdCBBRyBHcmlkIGhlYWRlciBjb21wb25lbnQgaXMgdXNlZC4gICAgICogICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudDogc3RyaW5nIHwgeyBuZXcoKTogYW55OyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgY3VzdG9tIGhlYWRlciBjb21wb25lbnQgdG8gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBjb21wb25lbnQgaGVhZGVyIGluIHRoZSBob3N0aW5nIGZyYW1ld29yayAoaWU6IEFuZ3VsYXIvUmVhY3QvVnVlSnMpLiBJZiBub25lIHNwZWNpZmllZCB0aGUgZGVmYXVsdCBBRyBHcmlkIGhlYWRlciBjb21wb25lbnQgaXMgdXNlZCogICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNvbXBvbmVudEZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgcGFyYW1ldGVycyB0byBiZSBwYXNzZWQgdG8gdGhlIGhlYWRlciBjb21wb25lbnQuICAgICAqICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGFuIGFycmF5IGNvbnRhaW5pbmcgemVybywgb25lIG9yIG1hbnkgb2YgdGhlIGZvbGxvd2luZyBvcHRpb25zOiBgJ2ZpbHRlck1lbnVUYWInIHwgJ2dlbmVyYWxNZW51VGFiJyB8ICdjb2x1bW5zTWVudVRhYidgLlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBmaWd1cmUgb3V0IHdoaWNoIG1lbnUgdGFicyBhcmUgcHJlc2VudCBhbmQgaW4gd2hpY2ggb3JkZXIgdGhlIHRhYnMgYXJlIHNob3duLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWVudVRhYnM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQYXJhbXMgdXNlZCB0byBjaGFuZ2UgdGhlIGJlaGF2aW91ciBhbmQgYXBwZWFyYW5jZSBvZiB0aGUgQ29sdW1ucyBNZW51IHRhYi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbnNNZW51UGFyYW1zOiBDb2x1bW5zTWVudVBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiBubyBtZW51IHNob3VsZCBiZSBzaG93biBmb3IgdGhpcyBjb2x1bW4gaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAgb3IgdGhlIGNhbGxiYWNrIHJldHVybnMgYHRydWVgLCBhICdzZWxlY3QgYWxsJyBjaGVja2JveCB3aWxsIGJlIHB1dCBpbnRvIHRoZSBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJDaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IEhlYWRlckNoZWNrYm94U2VsZWN0aW9uQ2FsbGJhY2sgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGhlYWRlciBjaGVja2JveCBzZWxlY3Rpb24gd2lsbCBvbmx5IHNlbGVjdCBmaWx0ZXJlZCBpdGVtcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEZWZpbmVzIHRoZSBjaGFydCBkYXRhIHR5cGUgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgYSBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydERhdGFUeXBlOiAnY2F0ZWdvcnknIHwgJ3NlcmllcycgfCAndGltZScgfCAnZXhjbHVkZWQnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQaW4gYSBjb2x1bW4gdG8gb25lIHNpZGU6IGByaWdodGAgb3IgYGxlZnRgLiBBIHZhbHVlIG9mIGB0cnVlYCBpcyBjb252ZXJ0ZWQgdG8gYCdsZWZ0J2AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWQ6IGJvb2xlYW4gfCBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzICdwaW5uZWQnLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaW5uZWQ6IGJvb2xlYW4gfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGJsb2NrIHRoZSB1c2VyIHBpbm5pbmcgdGhlIGNvbHVtbiwgdGhlIGNvbHVtbiBjYW4gb25seSBiZSBwaW5uZWQgdmlhIGRlZmluaXRpb25zIG9yIEFQSSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9ja1Bpbm5lZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGNlbGxSZW5kZXJlclNlbGVjdG9yIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IENlbGwgUmVuZGVyZXIgZm9yIHBpbm5lZCByb3dzLiBDaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGNlbGxSZW5kZXJlclNlbGVjdG9yIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IENlbGwgUmVuZGVyZXIgZm9yIHBpbm5lZCByb3dzLiBDaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd0NlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgY2VsbFJlbmRlcmVyU2VsZWN0b3IgaWYgeW91IHdhbnQgYSBkaWZmZXJlbnQgQ2VsbCBSZW5kZXJlciBmb3IgcGlubmVkIHJvd3MuIENoZWNrIHBhcmFtcy5ub2RlLnJvd1Bpbm5lZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkUm93Q2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSB2YWx1ZUZvcm1hdHRlciBmb3IgcGlubmVkIHJvd3MsIGFuZCBjaGVjayBwYXJhbXMubm9kZS5yb3dQaW5uZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFJvd1ZhbHVlRm9ybWF0dGVyOiBzdHJpbmcgfCBWYWx1ZUZvcm1hdHRlckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIHBpdm90IGJ5IHRoaXMgY29sdW1uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgJ3Bpdm90JywgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUGl2b3Q6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIGluIGNvbHVtbnMgeW91IHdhbnQgdG8gcGl2b3QgYnkuXG4gICAgICogSWYgb25seSBwaXZvdGluZyBieSBvbmUgY29sdW1uLCBzZXQgdGhpcyB0byBhbnkgbnVtYmVyIChlLmcuIGAwYCkuXG4gICAgICogSWYgcGl2b3RpbmcgYnkgbXVsdGlwbGUgY29sdW1ucywgc2V0IHRoaXMgdG8gd2hlcmUgeW91IHdhbnQgdGhpcyBjb2x1bW4gdG8gYmUgaW4gdGhlIG9yZGVyIG9mIHBpdm90cyAoZS5nLiBgMGAgZm9yIGZpcnN0LCBgMWAgZm9yIHNlY29uZCwgYW5kIHNvIG9uKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90SW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgJ3Bpdm90SW5kZXgnLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxQaXZvdEluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgdG8gdXNlIHdoZW4gb3JkZXJpbmcgdGhlIHBpdm90IGNvbHVtbnMsIHdoZW4gdGhpcyBjb2x1bW4gaXMgdXNlZCB0byBwaXZvdCBvbi5cbiAgICAgKiBUaGUgdmFsdWVzIHdpbGwgYWx3YXlzIGJlIHN0cmluZ3MsIGFzIHRoZSBwaXZvdCBzZXJ2aWNlIHVzZXMgc3RyaW5ncyBhcyBrZXlzIGZvciB0aGUgcGl2b3QgZ3JvdXBzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb21wYXJhdG9yOiAoKHZhbHVlQTogc3RyaW5nLCB2YWx1ZUI6IHN0cmluZykgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIHBpdm90IGJ5IHRoaXMgY29sdW1uIHZpYSB0aGUgR1VJLiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgcGl2b3QuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVQaXZvdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQW4gb2JqZWN0IG9mIGNzcyB2YWx1ZXMgLyBvciBmdW5jdGlvbiByZXR1cm5pbmcgYW4gb2JqZWN0IG9mIGNzcyB2YWx1ZXMgZm9yIGEgcGFydGljdWxhciBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbFN0eWxlOiBDZWxsU3R5bGUgfCBDZWxsU3R5bGVGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDbGFzcyB0byB1c2UgZm9yIHRoZSBjZWxsLiBDYW4gYmUgc3RyaW5nLCBhcnJheSBvZiBzdHJpbmdzLCBvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCBDZWxsQ2xhc3NGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSdWxlcyB3aGljaCBjYW4gYmUgYXBwbGllZCB0byBpbmNsdWRlIGNlcnRhaW4gQ1NTIGNsYXNzZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsQ2xhc3NSdWxlczogQ2VsbENsYXNzUnVsZXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgYGNlbGxSZW5kZXJlcmAgdG8gdXNlIGZvciB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRnJhbWV3b3JrIGBjZWxsUmVuZGVyZXJgIHRvIHVzZSBmb3IgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogUGFyYW1zIHRvIGJlIHBhc3NlZCB0byB0aGUgY2VsbCByZW5kZXJlciBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gc2VsZWN0IHdoaWNoIGNlbGwgcmVuZGVyZXIgdG8gYmUgdXNlZCBmb3IgYSBnaXZlbiByb3cgd2l0aGluIHRoZSBzYW1lIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxSZW5kZXJlclNlbGVjdG9yOiBDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgZ3JpZCBjYWxjdWxhdGUgdGhlIGhlaWdodCBvZiBhIHJvdyBiYXNlZCBvbiBjb250ZW50cyBvZiB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGF1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgdGV4dCB3cmFwIGluc2lkZSB0aGUgY2VsbCAtIHR5cGljYWxseSB1c2VkIHdpdGggYGF1dG9IZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgd3JhcFRleHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZmxhc2ggYSBjZWxsIHdoZW4gaXQncyByZWZyZXNoZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gcHJldmVudCB0aGlzIGNvbHVtbiBmcm9tIGZsYXNoaW5nIG9uIGNoYW5nZXMuIE9ubHkgYXBwbGljYWJsZSBpZiBjZWxsIGZsYXNoaW5nIGlzIHR1cm5lZCBvbiBmb3IgdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGbGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogYGJvb2xlYW5gIG9yIGBGdW5jdGlvbmAuIFNldCB0byBgdHJ1ZWAgKG9yIHJldHVybiBgdHJ1ZWAgZnJvbSBmdW5jdGlvbikgdG8gYWxsb3cgcm93IGRyYWdnaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZzogYm9vbGVhbiB8IFJvd0RyYWdDYWxsYmFjayB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gYSBzdHJpbmcgdG8gYmUgZGlzcGxheWVkIGJ5IHRoZSBgcm93RHJhZ0NvbXBgIHdoaWxlIGRyYWdnaW5nIGEgcm93LlxuICAgICAqIElmIHRoaXMgY2FsbGJhY2sgaXMgbm90IHNldCwgdGhlIGN1cnJlbnQgY2VsbCB2YWx1ZSB3aWxsIGJlIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnVGV4dDogKChwYXJhbXM6IElSb3dEcmFnSXRlbSwgZHJhZ0l0ZW1Db3VudDogbnVtYmVyKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBgYm9vbGVhbmAgb3IgYEZ1bmN0aW9uYC4gU2V0IHRvIGB0cnVlYCAob3IgcmV0dXJuIGB0cnVlYCBmcm9tIGZ1bmN0aW9uKSB0byBhbGxvdyBkcmFnZ2luZyBmb3IgbmF0aXZlIGRyYWcgYW5kIGRyb3AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2U6IGJvb2xlYW4gfCBEbmRTb3VyY2VDYWxsYmFjayB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRnVuY3Rpb24gdG8gYWxsb3cgY3VzdG9tIGRyYWcgZnVuY3Rpb25hbGl0eSBmb3IgbmF0aXZlIGRyYWcgYW5kIGRyb3AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkbmRTb3VyY2VPblJvd0RyYWc6ICgocGFyYW1zOiB7IHJvd05vZGU6IFJvd05vZGUsIGRyYWdFdmVudDogRHJhZ0V2ZW50OyB9KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byByb3cgZ3JvdXAgYnkgdGhpcyBjb2x1bW4uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyAncm93R3JvdXAnLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxSb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgaW4gY29sdW1ucyB5b3Ugd2FudCB0byBncm91cCBieS5cbiAgICAgKiBJZiBvbmx5IGdyb3VwaW5nIGJ5IG9uZSBjb2x1bW4sIHNldCB0aGlzIHRvIGFueSBudW1iZXIgKGUuZy4gYDBgKS5cbiAgICAgKiBJZiBncm91cGluZyBieSBtdWx0aXBsZSBjb2x1bW5zLCBzZXQgdGhpcyB0byB3aGVyZSB5b3Ugd2FudCB0aGlzIGNvbHVtbiB0byBiZSBpbiB0aGUgZ3JvdXAgKGUuZy4gYDBgIGZvciBmaXJzdCwgYDFgIGZvciBzZWNvbmQsIGFuZCBzbyBvbikuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cEluZGV4OiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzICdyb3dHcm91cEluZGV4JywgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsUm93R3JvdXBJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRvIGJlIGFibGUgdG8gcm93IGdyb3VwIGJ5IHRoaXMgY29sdW1uIHZpYSB0aGUgR1VJLlxuICAgICAqIFRoaXMgd2lsbCBub3QgYmxvY2sgdGhlIEFQSSBvciBwcm9wZXJ0aWVzIGJlaW5nIHVzZWQgdG8gYWNoaWV2ZSByb3cgZ3JvdXBpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSb3dHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0byBiZSBhYmxlIHRvIGFnZ3JlZ2F0ZSBieSB0aGlzIGNvbHVtbiB2aWEgdGhlIEdVSS5cbiAgICAgKiBUaGlzIHdpbGwgbm90IGJsb2NrIHRoZSBBUEkgb3IgcHJvcGVydGllcyBiZWluZyB1c2VkIHRvIGFjaGlldmUgYWdncmVnYXRpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVWYWx1ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogTmFtZSBvZiBmdW5jdGlvbiB0byB1c2UgZm9yIGFnZ3JlZ2F0aW9uLiBZb3UgY2FuIGFsc28gcHJvdmlkZSB5b3VyIG93biBhZ2cgZnVuY3Rpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jOiBzdHJpbmcgfCBJQWdnRnVuYyB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgJ2FnZ0Z1bmMnLCBleGNlcHQgb25seSBhcHBsaWVkIHdoZW4gY3JlYXRpbmcgYSBuZXcgY29sdW1uLiBOb3QgYXBwbGllZCB3aGVuIHVwZGF0aW5nIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxBZ2dGdW5jOiBzdHJpbmcgfCBJQWdnRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWdncmVnYXRpb24gZnVuY3Rpb25zIGFsbG93ZWQgb24gdGhpcyBjb2x1bW4gZS5nLiBgWydzdW0nLCAnYXZnJ11gLlxuICAgICAqIElmIG1pc3NpbmcsIGFsbCBpbnN0YWxsZWQgZnVuY3Rpb25zIGFyZSBhbGxvd2VkLlxuICAgICAqIFRoaXMgd2lsbCBvbmx5IHJlc3RyaWN0IHdoYXQgdGhlIEdVSSBhbGxvd3MgYSB1c2VyIHRvIHNlbGVjdCwgaXQgZG9lcyBub3QgaW1wYWN0IHdoZW4geW91IHNldCBhIGZ1bmN0aW9uIHZpYSB0aGUgQVBJLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dlZEFnZ0Z1bmNzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gaGF2ZSB0aGUgZ3JpZCBwbGFjZSB0aGUgdmFsdWVzIGZvciB0aGUgZ3JvdXAgaW50byB0aGUgY2VsbCwgb3IgcHV0IHRoZSBuYW1lIG9mIGEgZ3JvdXBlZCBjb2x1bW4gdG8ganVzdCBzaG93IHRoYXQgZ3JvdXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93Um93R3JvdXA6IHN0cmluZyB8IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgc29ydGluZyBvbiB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRhYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBzb3J0aW5nIGJ5IGRlZmF1bHQsIHNldCBpdCBoZXJlLiBTZXQgdG8gJ2FzYycgb3IgJ2Rlc2MnLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgc29ydGAsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFNvcnQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgc29ydGluZyBtb3JlIHRoYW4gb25lIGNvbHVtbiBieSBkZWZhdWx0LCBzcGVjaWZpZXMgb3JkZXIgaW4gd2hpY2ggdGhlIHNvcnRpbmcgc2hvdWxkIGJlIGFwcGxpZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0SW5kZXg6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNhbWUgYXMgJ3NvcnRJbmRleCcsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFNvcnRJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBkZWZpbmluZyB0aGUgb3JkZXIgaW4gd2hpY2ggc29ydGluZyBvY2N1cnMgKGlmIHNvcnRpbmcgaXMgZW5hYmxlZCkuIEFuIGFycmF5IHdpdGggYW55IG9mIHRoZSBmb2xsb3dpbmcgaW4gYW55IG9yZGVyIFsnYXNjJywnZGVzYycsbnVsbF0gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlcjogKHN0cmluZyB8IG51bGwpW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENvbXBhcmF0b3IgZnVuY3Rpb24gZm9yIGN1c3RvbSBzb3J0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcGFyYXRvcjogKCh2YWx1ZUE6IGFueSwgdmFsdWVCOiBhbnksIG5vZGVBOiBSb3dOb2RlLCBub2RlQjogUm93Tm9kZSwgaXNJbnZlcnRlZDogYm9vbGVhbikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBpZiB5b3Ugd2FudCB0aGUgdW5zb3J0ZWQgaWNvbiB0byBiZSBzaG93biB3aGVuIG5vIHNvcnQgaXMgYXBwbGllZCB0byB0aGlzIGNvbHVtbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuU29ydEljb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHYyNCAtIHVzZSBzb3J0SW5kZXggaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0ZWRBdDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCBlYWNoIGNlbGwgd2lsbCB0YWtlIHVwIHRoZSB3aWR0aCBvZiBvbmUgY29sdW1uLiBZb3UgY2FuIGNoYW5nZSB0aGlzIGJlaGF2aW91ciB0byBhbGxvdyBjZWxscyB0byBzcGFuIG11bHRpcGxlIGNvbHVtbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xTcGFuOiAoKHBhcmFtczogQ29sU3BhblBhcmFtcykgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgZWFjaCBjZWxsIHdpbGwgdGFrZSB1cCB0aGUgaGVpZ2h0IG9mIG9uZSByb3cuIFlvdSBjYW4gY2hhbmdlIHRoaXMgYmVoYXZpb3VyIHRvIGFsbG93IGNlbGxzIHRvIHNwYW4gbXVsdGlwbGUgcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1NwYW46ICgocGFyYW1zOiBSb3dTcGFuUGFyYW1zKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJbml0aWFsIHdpZHRoIGluIHBpeGVscyBmb3IgdGhlIGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB3aWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzICd3aWR0aCcsIGV4Y2VwdCBvbmx5IGFwcGxpZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBjb2x1bW4uIE5vdCBhcHBsaWVkIHdoZW4gdXBkYXRpbmcgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIE1pbmltdW0gd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1pbldpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIE1heGltdW0gd2lkdGggaW4gcGl4ZWxzIGZvciB0aGUgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFVzZWQgaW5zdGVhZCBvZiBgd2lkdGhgIHdoZW4gdGhlIGdvYWwgaXMgdG8gZmlsbCB0aGUgcmVtYWluaW5nIGVtcHR5IHNwYWNlIG9mIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzICdmbGV4JywgZXhjZXB0IG9ubHkgYXBwbGllZCB3aGVuIGNyZWF0aW5nIGEgbmV3IGNvbHVtbi4gTm90IGFwcGxpZWQgd2hlbiB1cGRhdGluZyBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsRmxleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IHRoaXMgY29sdW1uIHNob3VsZCBiZSByZXNpemVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVzaXphYmxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSB3YW50IHRoaXMgY29sdW1uJ3Mgd2lkdGggdG8gYmUgZml4ZWQgZHVyaW5nICdzaXplIHRvIGZpdCcgb3BlcmF0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2l6ZVRvRml0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGlmIHlvdSBkbyBub3Qgd2FudCB0aGlzIGNvbHVtbiB0byBiZSBhdXRvLXJlc2l6YWJsZSBieSBkb3VibGUgY2xpY2tpbmcgaXQncyBlZGdlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuXG4gICAgLy8gRW5hYmxlIHR5cGUgY29lcmNpb24gZm9yIGJvb2xlYW4gSW5wdXRzIHRvIHN1cHBvcnQgdXNlIGxpa2UgJ2VuYWJsZUNoYXJ0cycgaW5zdGVhZCBvZiBmb3JjaW5nICdbZW5hYmxlQ2hhcnRzXT1cInRydWVcIicgXG4gICAgLy8gaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3RlbXBsYXRlLXR5cGVjaGVjayNpbnB1dC1zZXR0ZXItY29lcmNpb24gXG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbEZsYXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmlsdGVyc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfb3BlbkJ5RGVmYXVsdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFycnlDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW5pdGlhbEhpZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0dyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsUm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbml0aWFsUGl2b3Q6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NoZWNrYm94U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oZWFkZXJDaGVja2JveFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb25GaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2NrUG9zaXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tWaXNpYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2NrUGlubmVkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91blNvcnRJY29uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1NpemVUb0ZpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUm93R3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVBpdm90OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVWYWx1ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZWRpdGFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTmF2aWdhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RuZFNvdXJjZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b0hlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfd3JhcFRleHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NvcnRhYmxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZXNpemFibGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZmxvYXRpbmdGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NlbGxFZGl0b3JQb3B1cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIC8vIEBFTkRAXG5cbn1cbiJdfQ==