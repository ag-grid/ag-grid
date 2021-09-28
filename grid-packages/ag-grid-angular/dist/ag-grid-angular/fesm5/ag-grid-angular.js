import { __rest, __decorate, __metadata, __extends } from 'tslib';
import { ContentChildren, QueryList, Input, Component, NgZone, Injectable, EventEmitter, ElementRef, ViewContainerRef, ComponentFactoryResolver, Output, ViewEncapsulation, ANALYZE_FOR_ENTRY_COMPONENTS, NgModule } from '@angular/core';
import { AgPromise, VanillaFrameworkOverrides, BaseComponentWrapper, ComponentUtil, Grid } from 'ag-grid-community';

var AgGridColumn = /** @class */ (function () {
    function AgGridColumn() {
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
    return AgGridColumn;
}());

var AngularFrameworkOverrides = /** @class */ (function (_super) {
    __extends(AngularFrameworkOverrides, _super);
    function AngularFrameworkOverrides(_ngZone) {
        var _this = _super.call(this) || this;
        _this._ngZone = _ngZone;
        return _this;
    }
    AngularFrameworkOverrides.prototype.setEmitterUsedCallback = function (isEmitterUsed) {
        this.isEmitterUsed = isEmitterUsed;
    };
    AngularFrameworkOverrides.prototype.setTimeout = function (action, timeout) {
        if (this._ngZone) {
            this._ngZone.runOutsideAngular(function () {
                window.setTimeout(function () {
                    action();
                }, timeout);
            });
        }
        else {
            window.setTimeout(function () {
                action();
            }, timeout);
        }
    };
    AngularFrameworkOverrides.prototype.setInterval = function (action, interval) {
        var _this = this;
        return new AgPromise(function (resolve) {
            if (_this._ngZone) {
                _this._ngZone.runOutsideAngular(function () {
                    resolve(window.setInterval(function () {
                        action();
                    }, interval));
                });
            }
            else {
                resolve(window.setInterval(function () {
                    action();
                }, interval));
            }
        });
    };
    AngularFrameworkOverrides.prototype.addEventListener = function (element, eventType, listener, useCapture) {
        if (this.isOutsideAngular(eventType) && this._ngZone) {
            this._ngZone.runOutsideAngular(function () {
                element.addEventListener(eventType, listener, useCapture);
            });
        }
        else {
            element.addEventListener(eventType, listener, useCapture);
        }
    };
    AngularFrameworkOverrides.prototype.dispatchEvent = function (eventType, listener, global) {
        if (global === void 0) { global = false; }
        if (this.isOutsideAngular(eventType)) {
            if (this._ngZone) {
                this._ngZone.runOutsideAngular(listener);
            }
            else {
                listener();
            }
        }
        else if (this.isEmitterUsed(eventType) || global) {
            // only trigger off events (and potentially change detection) if actually used
            if (!NgZone.isInAngularZone() && this._ngZone) {
                this._ngZone.run(listener);
            }
            else {
                listener();
            }
        }
    };
    AngularFrameworkOverrides.ctorParameters = function () { return [
        { type: NgZone }
    ]; };
    AngularFrameworkOverrides = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [NgZone])
    ], AngularFrameworkOverrides);
    return AngularFrameworkOverrides;
}(VanillaFrameworkOverrides));

var AngularFrameworkComponentWrapper = /** @class */ (function (_super) {
    __extends(AngularFrameworkComponentWrapper, _super);
    function AngularFrameworkComponentWrapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AngularFrameworkComponentWrapper.prototype.setViewContainerRef = function (viewContainerRef) {
        this.viewContainerRef = viewContainerRef;
    };
    AngularFrameworkComponentWrapper.prototype.setComponentFactoryResolver = function (componentFactoryResolver) {
        this.componentFactoryResolver = componentFactoryResolver;
    };
    AngularFrameworkComponentWrapper.prototype.createWrapper = function (OriginalConstructor) {
        var that = this;
        var DynamicAgNg2Component = /** @class */ (function (_super) {
            __extends(DynamicAgNg2Component, _super);
            function DynamicAgNg2Component() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DynamicAgNg2Component.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
                this._componentRef.changeDetectorRef.detectChanges();
            };
            DynamicAgNg2Component.prototype.createComponent = function () {
                return that.createComponent(OriginalConstructor);
            };
            DynamicAgNg2Component.prototype.hasMethod = function (name) {
                return wrapper.getFrameworkComponentInstance()[name] != null;
            };
            DynamicAgNg2Component.prototype.callMethod = function (name, args) {
                var componentRef = this.getFrameworkComponentInstance();
                return wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args);
            };
            DynamicAgNg2Component.prototype.addMethod = function (name, callback) {
                wrapper[name] = callback;
            };
            return DynamicAgNg2Component;
        }(BaseGuiComponent));
        var wrapper = new DynamicAgNg2Component();
        return wrapper;
    };
    AngularFrameworkComponentWrapper.prototype.createComponent = function (componentType) {
        // used to cache the factory, but this a) caused issues when used with either webpack/angularcli with --prod
        // but more significantly, the underlying implementation of resolveComponentFactory uses a map too, so us
        // caching the factory here yields no performance benefits
        var factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        return this.viewContainerRef.createComponent(factory);
    };
    AngularFrameworkComponentWrapper = __decorate([
        Injectable()
    ], AngularFrameworkComponentWrapper);
    return AngularFrameworkComponentWrapper;
}(BaseComponentWrapper));
var BaseGuiComponent = /** @class */ (function () {
    function BaseGuiComponent() {
    }
    BaseGuiComponent.prototype.init = function (params) {
        this._params = params;
        this._componentRef = this.createComponent();
        this._agAwareComponent = this._componentRef.instance;
        this._frameworkComponentInstance = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;
        this._agAwareComponent.agInit(this._params);
    };
    BaseGuiComponent.prototype.getGui = function () {
        return this._eGui;
    };
    BaseGuiComponent.prototype.destroy = function () {
        if (this._componentRef) {
            this._componentRef.destroy();
        }
    };
    BaseGuiComponent.prototype.getFrameworkComponentInstance = function () {
        return this._frameworkComponentInstance;
    };
    return BaseGuiComponent;
}());

var AgGridAngular = /** @class */ (function () {
    function AgGridAngular(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper, componentFactoryResolver) {
        this.viewContainerRef = viewContainerRef;
        this.angularFrameworkOverrides = angularFrameworkOverrides;
        this.frameworkComponentWrapper = frameworkComponentWrapper;
        this.componentFactoryResolver = componentFactoryResolver;
        this._initialised = false;
        this._destroyed = false;
        // in order to ensure firing of gridReady is deterministic
        this._fullyReady = AgPromise.resolve(true);
        // @START@
        /** Specifies the status bar components to use in the status bar.     */
        this.statusBar = undefined;
        /** Specifies the side bar components.     */
        this.sideBar = undefined;
        /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu.     */
        this.suppressContextMenu = undefined;
        /** When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
         * This flag is useful to prevent the browser from showing its default context menu.     */
        this.preventDefaultOnContextMenu = undefined;
        /** Allows context menu to show, even when `Ctrl` key is held down.     */
        this.allowContextMenuWithControlKey = undefined;
        /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header.     */
        this.suppressMenuHide = undefined;
        /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component     */
        this.enableBrowserTooltips = undefined;
        /** The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
         *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.     */
        this.tooltipShowDelay = undefined;
        /** Set to `true` to have tooltips follow the cursor once they are displayed.     */
        this.tooltipMouseTrack = undefined;
        /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).     */
        this.popupParent = undefined;
        /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard.     */
        this.copyHeadersToClipboard = undefined;
        /** Specify the deliminator to use when copying to clipboard.     */
        this.clipboardDeliminator = undefined;
        /** Set to `true` to only have the range selection, and not row selection, copied to clipboard.     */
        this.suppressCopyRowsToClipboard = undefined;
        /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard.     */
        this.suppressLastEmptyLineOnPaste = undefined;
        /** Set to `true` to turn off paste operations within the grid.     */
        this.suppressClipboardPaste = undefined;
        /** Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround.     */
        this.suppressClipboardApi = undefined;
        /** Array of Column / Column Group definitions.     */
        this.columnDefs = undefined;
        /** A default column definition. Items defined in the actual column definitions get precedence.     */
        this.defaultColDef = undefined;
        /** A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence.     */
        this.defaultColGroupDef = undefined;
        /** An object map of custom column types which contain groups of properties that column definitions can inherit by referencing in their `type` property.     */
        this.columnTypes = undefined;
        /** Keeps the order of Columns maintained after new Column Definitions are updated.     */
        this.maintainColumnOrder = undefined;
        /** If `true`, then dots in field names (e.g. `address.firstline`) are not treated as deep references. Allows you to use dots in your field name if you prefer.     */
        this.suppressFieldDotNotation = undefined;
        /** @deprecated     */
        this.deltaColumnMode = undefined;
        /** @deprecated     */
        this.applyColumnDefOrder = undefined;
        /** @deprecated     */
        this.immutableColumns = undefined;
        /** @deprecated     */
        this.suppressSetColumnStateEvents = undefined;
        /** @deprecated     */
        this.suppressColumnStateEvents = undefined;
        /** @deprecated Set via `defaultColDef.width`
         */
        this.colWidth = undefined;
        /** @deprecated Set via `defaultColDef.minWidth`
         */
        this.minColWidth = undefined;
        /** @deprecated Set via `defaultColDef.maxWidth`
         */
        this.maxColWidth = undefined;
        /** The height in pixels for the row containing the column label header. Default: `25`     */
        this.headerHeight = undefined;
        /** The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`.     */
        this.groupHeaderHeight = undefined;
        /** The height in pixels for the row containing the floating filters. Default: `20`     */
        this.floatingFiltersHeight = undefined;
        /** The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`.     */
        this.pivotHeaderHeight = undefined;
        /** The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`.     */
        this.pivotGroupHeaderHeight = undefined;
        /** Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid.     */
        this.allowDragFromColumnsToolPanel = undefined;
        /** Set to `true` to suppress column moving, i.e. to make the columns fixed position.     */
        this.suppressMovableColumns = undefined;
        /** If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns.     */
        this.suppressColumnMoveAnimation = undefined;
        /** If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden.     */
        this.suppressDragLeaveHidesColumns = undefined;
        /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing).     */
        this.colResizeDefault = undefined;
        /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size.     */
        this.suppressAutoSize = undefined;
        /** Number of pixels to add to a column width after the [auto-sizing](/column-sizing/#auto-size-columns) calculation.
         * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.     */
        this.autoSizePadding = undefined;
        /** Set this to `true` to skip the `headerName` when `autoSize` is called by default.     */
        this.skipHeaderOnAutoSize = undefined;
        /** A map of component names to plain JavaScript components.     */
        this.components = undefined;
        /** A map of component names to framework (Angular, React, Vue etc.) components.     */
        this.frameworkComponents = undefined;
        /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.     */
        this.editType = undefined;
        /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click.     */
        this.singleClickEdit = undefined;
        /** Set to `true` so that neither single nor double click starts editing.     */
        this.suppressClickEdit = undefined;
        /** Set this to `true` to stop cell editing when grid loses focus.
         * The default is that the grid stays editing until focus goes onto another cell. For inline (non-popup) editors only.     */
        this.stopEditingWhenCellsLoseFocus = undefined;
        /** Set to `true` along with `enterMovesDownAfterEdit` to have Excel-style behaviour for the `Enter` key.
         * i.e. pressing the `Enter` key will move down to the cell beneath.     */
        this.enterMovesDown = undefined;
        /** Set to `true` along with `enterMovesDown` to have Excel-style behaviour for the 'Enter' key.
         * i.e. pressing the Enter key will move down to the cell beneath.     */
        this.enterMovesDownAfterEdit = undefined;
        /** Set to `true` to enable Undo / Redo while editing.     */
        this.undoRedoCellEditing = undefined;
        /** Set the size of the undo / redo stack.     */
        this.undoRedoCellEditingLimit = undefined;
        /** @deprecated Use stopEditingWhenCellsLoseFocus instead
         */
        this.stopEditingWhenGridLosesFocus = undefined;
        /** A default configuration object used to export to CSV.     */
        this.defaultCsvExportParams = undefined;
        /** Prevents the user from exporting the grid to CSV.     */
        this.suppressCsvExport = undefined;
        /** A default configuration object used to export to Excel.     */
        this.defaultExcelExportParams = undefined;
        /** Prevents the user from exporting the grid to Excel.     */
        this.suppressExcelExport = undefined;
        /** A list (array) of Excel styles to be used when exporting to Excel with styles.     */
        this.excelStyles = undefined;
        /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams
         */
        this.defaultExportParams = undefined;
        /** Rows are filtered using this text as a quick filter.     */
        this.quickFilterText = undefined;
        /** Set to `true` to turn on the quick filter cache, used to improve performance when using the quick filter.     */
        this.cacheQuickFilter = undefined;
        /** Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results.     */
        this.excludeChildrenWhenTreeDataFiltering = undefined;
        /** @deprecated Use floatingFilter on the colDef instead
         */
        this.floatingFilter = undefined;
        /** @deprecated     */
        this.enableOldSetFilterModel = undefined;
        /** Set to `true` to Enable Charts.     */
        this.enableCharts = undefined;
        /** The list of chart themes to be used.     */
        this.chartThemes = undefined;
        /** A map containing custom chart themes.     */
        this.customChartThemes = undefined;
        /** Chart theme overrides applied to all themes.     */
        this.chartThemeOverrides = undefined;
        /** @deprecated     */
        this.processChartOptions = undefined;
        /** @deprecated     */
        this.allowProcessChartOptions = undefined;
        /** `cellRenderer` to use when data is loading via a DataSource.     */
        this.loadingCellRenderer = undefined;
        /** Framework `cellRenderer` to use when data is loading via a DataSource.     */
        this.loadingCellRendererFramework = undefined;
        /** Params to be passed to loading cell renderer component.     */
        this.loadingCellRendererParams = undefined;
        /** Callback to select which loading cell renderer to be used when data is loading via a DataSource.     */
        this.loadingCellRendererSelector = undefined;
        /** A map of key->value pairs for localising text within the grid.     */
        this.localeText = undefined;
        /** Set to `true` to enable Master Detail.     */
        this.masterDetail = undefined;
        /** Set to `true` to keep detail rows for when they are displayed again.     */
        this.keepDetailRows = undefined;
        /** Sets the number of details rows to keep.     */
        this.keepDetailRowsCount = undefined;
        /** Provide a custom `detailCellRenderer` to use when a master row is expanded.     */
        this.detailCellRenderer = undefined;
        /** Framework `detailCellRenderer` to use when a master row is expanded.     */
        this.detailCellRendererFramework = undefined;
        /** Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params.     */
        this.detailCellRendererParams = undefined;
        /** Set fixed height in pixels for each detail row.     */
        this.detailRowHeight = undefined;
        /** Set to `true` to have the detail grid dynamically change it's height to fit it's rows.     */
        this.detailRowAutoHeight = undefined;
        /** Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks by your application.     */
        this.context = undefined;
        /** A list of grids to treat as Aligned Grids. If grids are aligned then the columns and horizontal scrolling will be kept in sync.     */
        this.alignedGrids = undefined;
        /** Change this value to set the tabIndex order of the Grid within your application. Default: `0`     */
        this.tabIndex = undefined;
        /** The number of rows rendered outside the viewable area the grid renders.
         * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
         * Default: `10`     */
        this.rowBuffer = undefined;
        /** Set to `true` to turn on the value cache.     */
        this.valueCache = undefined;
        /** Set to `true` to configure the value cache to not expire after data updates.     */
        this.valueCacheNeverExpires = undefined;
        /** Set to `true` to allow cell expressions.     */
        this.enableCellExpressions = undefined;
        /** If `true`, row nodes do not have their parents set.
         * The grid doesn't use the parent reference, but it is included to help the client code navigate the node tree if it wants by providing bi-direction navigation up and down the tree.
         * If this is a problem (e.g. if you need to convert the tree to JSON, which does not allow cyclic dependencies) then set this to `true`.     */
        this.suppressParentsInRowNodes = undefined;
        /** Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch).     */
        this.suppressTouch = undefined;
        /** Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser.     */
        this.suppressFocusAfterRefresh = undefined;
        /** Disables the asynchronous nature of the events introduced in v10, and makes them synchronous. This property only exists for the purpose of supporting legacy code which has a dependency on synchronous events from earlier versions (v9 or earlier) of AG Grid.     **It is strongly recommended that you do not change this property unless you have legacy issues.**     */
        this.suppressAsyncEvents = undefined;
        /** The grid will check for `ResizeObserver` and use it if it exists in the browser, otherwise it will use the grid's alternative implementation. Some users reported issues with Chrome's `ResizeObserver`. Use this property to always use the grid's alternative implementation should such problems exist.     */
        this.suppressBrowserResizeObserver = undefined;
        /** Disables showing a warning message in the console if using a `gridOptions` or `colDef` property that doesn't exist.     */
        this.suppressPropertyNamesCheck = undefined;
        /** Disables change detection.     */
        this.suppressChangeDetection = undefined;
        /** Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems.     */
        this.debug = undefined;
        /** Provide a template for 'loading' overlay.     */
        this.overlayLoadingTemplate = undefined;
        /** Provide a custom loading overlay component.     */
        this.loadingOverlayComponent = undefined;
        /** Same as `loadingOverlayComponent` but for a framework component.     */
        this.loadingOverlayComponentFramework = undefined;
        /** Customise the parameters provided to the loading overlay component.     */
        this.loadingOverlayComponentParams = undefined;
        /** Disables the 'loading' overlay.     */
        this.suppressLoadingOverlay = undefined;
        /** Provide a template for 'no rows' overlay.     */
        this.overlayNoRowsTemplate = undefined;
        /** Provide a custom no rows overlay component     */
        this.noRowsOverlayComponent = undefined;
        /** Same as `noRowsOverlayComponent` but for a framework component.     */
        this.noRowsOverlayComponentFramework = undefined;
        /** Customise the parameters provided to the no rows overlay component.     */
        this.noRowsOverlayComponentParams = undefined;
        /** Disables the 'no rows' overlay.     */
        this.suppressNoRowsOverlay = undefined;
        /** Set whether pagination is enabled.     */
        this.pagination = undefined;
        /** How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored. Default: `100`     */
        this.paginationPageSize = undefined;
        /** Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used.     */
        this.paginationAutoPageSize = undefined;
        /** Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail.     */
        this.paginateChildRows = undefined;
        /** If `true`, the default grid controls for navigation are hidden.
         * This is useful if `pagination=true` and you want to provide your own pagination controls.
         * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.     */
        this.suppressPaginationPanel = undefined;
        /** Set to `true` to enable pivot mode.     */
        this.pivotMode = undefined;
        /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off.     */
        this.pivotPanelShow = undefined;
        /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified.     */
        this.pivotColumnGroupTotals = undefined;
        /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified.     */
        this.pivotRowTotals = undefined;
        /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column.     */
        this.pivotSuppressAutoColumn = undefined;
        /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups.     */
        this.suppressExpandablePivotGroups = undefined;
        /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection.     */
        this.functionsReadOnly = undefined;
        /** A map of 'function name' to 'function' for custom aggregation functions.     */
        this.aggFuncs = undefined;
        /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`.     */
        this.suppressAggFuncInHeader = undefined;
        /** When `true`, the aggregations won't be computed for the root node of the grid.     */
        this.suppressAggAtRootLevel = undefined;
        /** When using change detection, only the updated column will be re-aggregated.     */
        this.aggregateOnlyChangedColumns = undefined;
        /** Set to `true` so that aggregations are not impacted by filtering.     */
        this.suppressAggFilteredOnly = undefined;
        /** Set to `true` to enable Row Animation.     */
        this.animateRows = undefined;
        /** Set to `true` to have cells flash after data changes.     */
        this.enableCellChangeFlash = undefined;
        /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long a cell should remain in its \"flashed\" state.
         * Default: `500`     */
        this.cellFlashDelay = undefined;
        /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long the \"flashed\" state animation takes to fade away after the timer set by `cellFlashDelay` has completed.
         * Default: `1000`     */
        this.cellFadeDelay = undefined;
        /** Switch between layout options: `normal`, `autoHeight`, `print`.
         * Default: `normal`     */
        this.domLayout = undefined;
        /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen.     */
        this.ensureDomOrder = undefined;
        /** Set to `true` to operate the grid in RTL (Right to Left) mode.     */
        this.enableRtl = undefined;
        /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered.     */
        this.suppressColumnVirtualisation = undefined;
        /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
         * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen) or if your grid height is able to display more than 500 rows at once.**     */
        this.suppressMaxRenderedRowRestriction = undefined;
        /** Set to `true` to enable Managed Row Dragging.     */
        this.rowDragManaged = undefined;
        /** Set to `true` to suppress row dragging.     */
        this.suppressRowDrag = undefined;
        /** Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up.     */
        this.suppressMoveWhenRowDragging = undefined;
        /** Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle.     */
        this.rowDragEntireRow = undefined;
        /** Set to `true` to enable dragging multiple rows at the same time.     */
        this.rowDragMultiRow = undefined;
        /** Sets the Cell Renderer to use for full width rows.     */
        this.fullWidthCellRenderer = undefined;
        /** Same as `fullWidthCellRenderer` but for a framework component.     */
        this.fullWidthCellRendererFramework = undefined;
        /** Customise the parameters provided to the `fullWidthCellRenderer` component.     */
        this.fullWidthCellRendererParams = undefined;
        /** Set to `true` to have the detail grid embedded in the master grid's container and so link their horizontal scrolling.     */
        this.embedFullWidthRows = undefined;
        /** @deprecated     */
        this.deprecatedEmbedFullWidthRows = undefined;
        /** Specifies how the results of row grouping should be displayed.
         *
         *   The options are:
         *
         *       `'singleColumn'`: single group column automatically added by the grid.
         *       `'multipleColumns'`: a group column per row group is added automatically.
         *       `'groupRows'`: group rows are automatically added instead of group columns.
         *       `'custom'`: informs the grid that group columns will be provided.     */
        this.groupDisplayType = undefined;
        /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything.     */
        this.groupDefaultExpanded = undefined;
        /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included.     */
        this.autoGroupColumnDef = undefined;
        /** When `true`, preserves the current group order when sorting on non-group columns.     */
        this.groupMaintainOrder = undefined;
        /** When `true`, if you select a group, the children of the group will also be selected.     */
        this.groupSelectsChildren = undefined;
        /** If grouping, this controls whether to show a group footer when the group is expanded.
         * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
         * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
         * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.     */
        this.groupIncludeFooter = undefined;
        /** Set to `true` to show a 'grand total' group footer across all groups.     */
        this.groupIncludeTotalFooter = undefined;
        /** If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand.     */
        this.groupSuppressBlankHeader = undefined;
        /** If using `groupSelectsChildren`, then only the children that pass the current filter will get selected.     */
        this.groupSelectsFiltered = undefined;
        /** Shows the open group in the group column for non-group rows.     */
        this.showOpenedGroup = undefined;
        /** Set to `true` to collapse groups that only have one child.     */
        this.groupRemoveSingleChildren = undefined;
        /** Set to `true` to collapse lowest level groups that only have one child.     */
        this.groupRemoveLowestSingleChildren = undefined;
        /** Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience.     */
        this.groupHideOpenParents = undefined;
        /** When to show the 'row group panel' (where you drag rows to group) at the top.     */
        this.rowGroupPanelShow = undefined;
        /** Sets the Cell Renderer to use when `groupDisplayType = 'groupRows'`.     */
        this.groupRowRenderer = undefined;
        /** Same as `groupRowRenderer` but for a framework component.     */
        this.groupRowRendererFramework = undefined;
        /** Customise the parameters provided to the `groupRowRenderer` component.     */
        this.groupRowRendererParams = undefined;
        /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping.     */
        this.suppressMakeColumnVisibleAfterUnGroup = undefined;
        /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.     */
        this.treeData = undefined;
        /** @deprecated - this is now groupRowRendererParams.innerRenderer
         */
        this.groupRowInnerRenderer = undefined;
        /** @deprecated - this is now groupRowRendererParams.innerRendererFramework
         */
        this.groupRowInnerRendererFramework = undefined;
        /** @deprecated - Use groupDisplayType = 'multipleColumns' instead
         */
        this.groupMultiAutoColumn = undefined;
        /** @deprecated - Use groupDisplayType = 'groupRows' instead
         */
        this.groupUseEntireRow = undefined;
        /** @deprecated - Use groupDisplayType = 'custom' instead
         */
        this.groupSuppressAutoColumn = undefined;
        /** @deprecated - no longer needed, transaction updates keep group state
         */
        this.rememberGroupStateWhenNewData = undefined;
        /** Data to be displayed as pinned top rows in the grid.     */
        this.pinnedTopRowData = undefined;
        /** Data to be displayed as pinned bottom rows in the grid.     */
        this.pinnedBottomRowData = undefined;
        /** Sets the row model type.     */
        this.rowModelType = undefined;
        /** Set the data to be displayed as rows in the grid.     */
        this.rowData = undefined;
        /** Enables Immutable Data mode, for compatibility with immutable stores.     */
        this.immutableData = undefined;
        /** How many milliseconds to wait before executing a batch of async transactions.     */
        this.asyncTransactionWaitMillis = undefined;
        /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates.     */
        this.suppressModelUpdateAfterUpdateTransaction = undefined;
        /** @deprecated     */
        this.deltaRowDataMode = undefined;
        /** @deprecated use asyncTransactionWaitMillis instead
         */
        this.batchUpdateWaitMillis = undefined;
        /** Provide the datasource for infinite scrolling.     */
        this.datasource = undefined;
        /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
         * Default: `1`     */
        this.cacheOverflowSize = undefined;
        /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
         * Default: `1`     */
        this.infiniteInitialRowCount = undefined;
        /** Whether to use Full Store or Partial Store for storing rows.     */
        this.serverSideStoreType = undefined;
        /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
         * Default: `100`     */
        this.cacheBlockSize = undefined;
        /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.     */
        this.maxBlocksInCache = undefined;
        /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.     */
        this.maxConcurrentDatasourceRequests = undefined;
        /** How many milliseconds to wait before loading a block. Useful when scrolling over many rows, spanning many Partial Store blocks, as it prevents blocks loading until scrolling has settled.     */
        this.blockLoadDebounceMillis = undefined;
        /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping     */
        this.purgeClosedRowNodes = undefined;
        /** Provide the `serverSideDatasource` for server side row model.     */
        this.serverSideDatasource = undefined;
        /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping.     */
        this.serverSideSortingAlwaysResets = undefined;
        /** When enabled, always refreshes stores after filter has changed. Used by Full Store only, to allow Server-Side Filtering.     */
        this.serverSideFilteringAlwaysResets = undefined;
        /** @deprecated     */
        this.suppressEnterpriseResetOnNewColumns = undefined;
        /** To use the viewport row model you need to provide the grid with a `viewportDatasource`.     */
        this.viewportDatasource = undefined;
        /** When using viewport row model, sets the page size for the viewport.     */
        this.viewportRowModelPageSize = undefined;
        /** When using viewport row model, sets the buffer size for the viewport.     */
        this.viewportRowModelBufferSize = undefined;
        /** Set to `true` to always show the horizontal scrollbar.     */
        this.alwaysShowHorizontalScroll = undefined;
        /** Set to `true` to always show the vertical scrollbar.     */
        this.alwaysShowVerticalScroll = undefined;
        /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on older browsers, e.g. Internet Explorer.     */
        this.debounceVerticalScrollbar = undefined;
        /** Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.)     */
        this.suppressHorizontalScroll = undefined;
        /** When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data.     */
        this.suppressScrollOnNewData = undefined;
        /** When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present.     */
        this.suppressScrollWhenPopupsAreOpen = undefined;
        /** When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if the grid is working fast enough that you don't need animation frames and you don't want the grid to flicker.     */
        this.suppressAnimationFrame = undefined;
        /** If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function.     */
        this.suppressMiddleClickScrolls = undefined;
        /** If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page.     */
        this.suppressPreventDefaultOnMouseWheel = undefined;
        /** Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations.     */
        this.scrollbarWidth = undefined;
        /** Type of Row Selection: `single`, `multiple`.     */
        this.rowSelection = undefined;
        /** Set to `true` to allow multiple rows to be selected using single click.     */
        this.rowMultiSelectWithClick = undefined;
        /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`.     */
        this.suppressRowDeselection = undefined;
        /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection.     */
        this.suppressRowClickSelection = undefined;
        /** If `true`, cells won't be selectable. This means cells will not get keyboard focus when you click on them.     */
        this.suppressCellSelection = undefined;
        /** If `true`, only a single range can be selected.     */
        this.suppressMultiRangeSelection = undefined;
        /** Set to `true` to be able to select the text within cells.
         *
         *     **Note:** When this is set to `true`, the clipboard service is disabled.     */
        this.enableCellTextSelection = undefined;
        /** Set to `true` to enable Range Selection.     */
        this.enableRangeSelection = undefined;
        /** Set to `true` to enable the Range Handle.     */
        this.enableRangeHandle = undefined;
        /** Set to `true` to enable the Fill Handle.     */
        this.enableFillHandle = undefined;
        /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical.     */
        this.fillHandleDirection = undefined;
        /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle.     */
        this.suppressClearOnFillReduction = undefined;
        /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`.     */
        this.sortingOrder = undefined;
        /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower.     */
        this.accentedSort = undefined;
        /** Set to `true` to show the 'no sort' icon.     */
        this.unSortIcon = undefined;
        /** Set to `true` to suppress multi-sort when the user shift-clicks a column header.     */
        this.suppressMultiSort = undefined;
        /** Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key.     */
        this.multiSortKey = undefined;
        /** Set to `true` to suppress sorting of un-sorted data to match original row data.     */
        this.suppressMaintainUnsortedOrder = undefined;
        /** Icons to use inside the grid instead of the grid's default icons.     */
        this.icons = undefined;
        /** Default row height in pixels.     */
        this.rowHeight = undefined;
        /** The style properties to apply to all rows. Set to an object of key (style names) and values (style values)     */
        this.rowStyle = undefined;
        /** CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names).     */
        this.rowClass = undefined;
        /** Rules which can be applied to include certain CSS classes.     */
        this.rowClassRules = undefined;
        /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class.     */
        this.suppressRowHoverHighlight = undefined;
        /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning.     */
        this.suppressRowTransform = undefined;
        /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class.     */
        this.columnHoverHighlight = undefined;
        this.deltaSort = undefined;
        this.treeDataDisplayType = undefined;
        this.angularCompileRows = undefined;
        this.angularCompileFilters = undefined;
        this.functionsPassive = undefined;
        this.enableGroupEdit = undefined;
        /** For customising the context menu.     */
        this.getContextMenuItems = undefined;
        /** For customising the main 'column header' menu.     */
        this.getMainMenuItems = undefined;
        /** Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup.     */
        this.postProcessPopup = undefined;
        /** Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel.     */
        this.processCellForClipboard = undefined;
        /** Allows you to process header values for the clipboard.     */
        this.processHeaderForClipboard = undefined;
        /** Allows you to process cells from the clipboard. Handy if for example you have number fields, and want to block non-numbers from getting into the grid.     */
        this.processCellFromClipboard = undefined;
        /** Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself.     */
        this.sendToClipboard = undefined;
        /** Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data.     */
        this.processDataFromClipboard = undefined;
        /** Grid calls this method to know if an external filter is present.     */
        this.isExternalFilterPresent = undefined;
        /** Should return `true` if external filter passes, otherwise `false`.     */
        this.doesExternalFilterPass = undefined;
        /** Callback to be used to customise the chart toolbar items.     */
        this.getChartToolbarItems = undefined;
        /** Callback to enable displaying the chart in an alternative chart container.     */
        this.createChartContainer = undefined;
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused.     */
        this.navigateToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused.     */
        this.tabToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused.     */
        this.navigateToNextCell = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused.     */
        this.tabToNextCell = undefined;
        /** Suppress the grid taking action for the relevant keyboard event when a cell is focused.     */
        this.suppressKeyboardEvent = undefined;
        /** A callback for localising text within the grid.     */
        this.localeTextFunc = undefined;
        /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)     */
        this.getDocument = undefined;
        /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.     */
        this.paginationNumberFormatter = undefined;
        /** Callback for grouping.     */
        this.groupRowAggNodes = undefined;
        /** (Client-side Row Model only) Allows groups to be open by default.     */
        this.isGroupOpenByDefault = undefined;
        /** Allows default sorting of groups.     */
        this.defaultGroupOrderComparator = undefined;
        /** Callback to be used with pivoting, to allow changing the second column definition.     */
        this.processSecondaryColDef = undefined;
        /** Callback to be used with pivoting, to allow changing the second column group definition.     */
        this.processSecondaryColGroupDef = undefined;
        /** Callback to be used when working with Tree Data when `treeData = true`.     */
        this.getDataPath = undefined;
        /** @deprecated - Use defaultGroupOrderComparator instead
         */
        this.defaultGroupSortComparator = undefined;
        /** Allows setting the child count for a group row.     */
        this.getChildCount = undefined;
        /** Allows providing different params for different levels of grouping.     */
        this.getServerSideStoreParams = undefined;
        /** Allows groups to be open by default.     */
        this.isServerSideGroupOpenByDefault = undefined;
        /** Allows cancelling transactions.     */
        this.isApplyServerSideTransaction = undefined;
        /** SSRM Tree Data: Allows specifying which rows are expandable.     */
        this.isServerSideGroup = undefined;
        /** SSRM Tree Data: Allows specifying group keys.     */
        this.getServerSideGroupKey = undefined;
        /** Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-id='abc'` where `abc` is what you return as the business key.
         * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.     */
        this.getBusinessKeyForNode = undefined;
        /** Allows you to set the ID for a particular row node based on the data. Useful for selection and server side sorting and filtering for paging and virtual pagination.     */
        this.getRowNodeId = undefined;
        /** Allows you to process rows after they are created, so you can do final adding of custom attributes etc.     */
        this.processRowPostCreate = undefined;
        /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable.     */
        this.isRowSelectable = undefined;
        /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row.     */
        this.isRowMaster = undefined;
        /** Callback to fill values instead of simply copying values or increasing number values using linear progression.     */
        this.fillOperation = undefined;
        /** Callback to perform additional sorting after the grid has sorted the rows.     */
        this.postSort = undefined;
        /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values.     */
        this.getRowStyle = undefined;
        /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.     */
        this.getRowClass = undefined;
        /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.     */
        this.getRowHeight = undefined;
        /** Tells the grid if this row should be rendered as full width.     */
        this.isFullWidthCell = undefined;
        /** The tool panel was hidden or shown. Use `api.isToolPanelShowing()` to get status.     */
        this.toolPanelVisibleChanged = new EventEmitter();
        /** Paste operation has started.     */
        this.pasteStart = new EventEmitter();
        /** Paste operation has ended.     */
        this.pasteEnd = new EventEmitter();
        /** A column, or group of columns, was hidden / shown.     */
        this.columnVisible = new EventEmitter();
        /** A column, or group of columns, was pinned / unpinned.     */
        this.columnPinned = new EventEmitter();
        /** A column was resized.     */
        this.columnResized = new EventEmitter();
        /** A column was moved. To find out when the column move is finished you can use the `dragStopped` event below.     */
        this.columnMoved = new EventEmitter();
        /** A value column was added or removed.     */
        this.columnValueChanged = new EventEmitter();
        /** The pivot mode flag was changed.     */
        this.columnPivotModeChanged = new EventEmitter();
        /** A pivot column was added, removed or order changed.     */
        this.columnPivotChanged = new EventEmitter();
        /** A column group was opened / closed.     */
        this.columnGroupOpened = new EventEmitter();
        /** User set new columns.     */
        this.newColumnsLoaded = new EventEmitter();
        /** The list of grid columns changed.     */
        this.gridColumnsChanged = new EventEmitter();
        /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc.     */
        this.displayedColumnsChanged = new EventEmitter();
        /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default).     */
        this.virtualColumnsChanged = new EventEmitter();
        /** Shotgun - gets called when either a) new columns are set or b) `columnApi.setState()` is used, so everything has changed.     */
        this.columnEverythingChanged = new EventEmitter();
        /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript or Angular 1.x).
         * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.     */
        this.componentStateChanged = new EventEmitter();
        /** Value has changed after editing.     */
        this.cellValueChanged = new EventEmitter();
        /** A cell's value within a row has changed. This event corresponds to Full Row Editing only.     */
        this.rowValueChanged = new EventEmitter();
        /** Editing a cell has started.     */
        this.cellEditingStarted = new EventEmitter();
        /** Editing a cell has stopped.     */
        this.cellEditingStopped = new EventEmitter();
        /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. This event corresponds to Full Row Editing only.     */
        this.rowEditingStarted = new EventEmitter();
        /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. This event corresponds to Full Row Editing only.     */
        this.rowEditingStopped = new EventEmitter();
        /** Filter has been opened.     */
        this.filterOpened = new EventEmitter();
        /** Filter has been modified and applied.     */
        this.filterChanged = new EventEmitter();
        /** Filter was modified but not applied. Used when filters have 'Apply' buttons.     */
        this.filterModified = new EventEmitter();
        /** A chart has been created.     */
        this.chartCreated = new EventEmitter();
        /** The data range for the chart has been changed.     */
        this.chartRangeSelectionChanged = new EventEmitter();
        /** Formatting changes have been made by users through the Format Panel.     */
        this.chartOptionsChanged = new EventEmitter();
        /** A chart has been destroyed.     */
        this.chartDestroyed = new EventEmitter();
        /** DOM event `keyDown` happened on a cell.     */
        this.cellKeyDown = new EventEmitter();
        /** DOM event `keyPress` happened on a cell.     */
        this.cellKeyPress = new EventEmitter();
        /** The grid has initialised. Use this event if, for example, you need to use the grid's API to fix the columns to size.     */
        this.gridReady = new EventEmitter();
        /** Fired the first time data is rendered into the grid.     */
        this.firstDataRendered = new EventEmitter();
        /** The size of the grid `div` has changed. In other words, the grid was resized.     */
        this.gridSizeChanged = new EventEmitter();
        /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events.     */
        this.modelUpdated = new EventEmitter();
        /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row.     */
        this.virtualRowRemoved = new EventEmitter();
        /** Which rows are rendered in the DOM has changed.     */
        this.viewportChanged = new EventEmitter();
        /** The body was scrolled horizontally or vertically.     */
        this.bodyScroll = new EventEmitter();
        /** Main body of the grid has stopped scrolling, either horizontally or vertically.     */
        this.bodyScrollEnd = new EventEmitter();
        /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.     */
        this.dragStarted = new EventEmitter();
        /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.     */
        this.dragStopped = new EventEmitter();
        /** Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
         *
         *   - The page size changes.
         *   - The current shown page is changed.
         *   - New data is loaded onto the grid.     */
        this.paginationChanged = new EventEmitter();
        /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid.     */
        this.rowDragEnter = new EventEmitter();
        /** The mouse has moved while dragging.     */
        this.rowDragMove = new EventEmitter();
        /** The mouse has left the grid while dragging.     */
        this.rowDragLeave = new EventEmitter();
        /** The drag has finished over the grid.     */
        this.rowDragEnd = new EventEmitter();
        /** A row group column was added or removed.     */
        this.columnRowGroupChanged = new EventEmitter();
        /** A row group was opened or closed.     */
        this.rowGroupOpened = new EventEmitter();
        /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`.     */
        this.expandOrCollapseAll = new EventEmitter();
        /** The client has set new pinned row data into the grid.     */
        this.pinnedRowDataChanged = new EventEmitter();
        /** The client has set new data into the grid using `api.setRowData()` or by changing the `rowData` bound property.     */
        this.rowDataChanged = new EventEmitter();
        /** The client has updated data for the grid using `api.applyTransaction(transaction)` or by changing the `rowData` bound property with `immutableData=true`.     */
        this.rowDataUpdated = new EventEmitter();
        /** Async transactions have been applied. Contains a list of all transaction results.     */
        this.asyncTransactionsFlushed = new EventEmitter();
        /** Cell is clicked.     */
        this.cellClicked = new EventEmitter();
        /** Cell is double clicked.     */
        this.cellDoubleClicked = new EventEmitter();
        /** Cell is focused.     */
        this.cellFocused = new EventEmitter();
        /** Mouse entered cell.     */
        this.cellMouseOver = new EventEmitter();
        /** Mouse left cell.     */
        this.cellMouseOut = new EventEmitter();
        /** Mouse down on cell.     */
        this.cellMouseDown = new EventEmitter();
        /** Row is clicked.     */
        this.rowClicked = new EventEmitter();
        /** Row is double clicked.     */
        this.rowDoubleClicked = new EventEmitter();
        /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected.     */
        this.rowSelected = new EventEmitter();
        /** Row selection is changed. Use the grid API `getSelectedNodes()` to get the new list of selected nodes.     */
        this.selectionChanged = new EventEmitter();
        /** Cell is right clicked.     */
        this.cellContextMenu = new EventEmitter();
        /** A change to range selection has occurred.     */
        this.rangeSelectionChanged = new EventEmitter();
        /** Sort has changed. The grid also listens for this and updates the model.     */
        this.sortChanged = new EventEmitter();
        this.columnRowGroupChangeRequest = new EventEmitter();
        this.columnPivotChangeRequest = new EventEmitter();
        this.columnValueChangeRequest = new EventEmitter();
        this.columnAggFuncChangeRequest = new EventEmitter();
        this._nativeElement = elementDef.nativeElement;
    }
    AgGridAngular.prototype.ngAfterViewInit = function () {
        this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setComponentFactoryResolver(this.componentFactoryResolver);
        this.angularFrameworkOverrides.setEmitterUsedCallback(this.isEmitterUsed.bind(this));
        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this, true);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: this.angularFrameworkOverrides,
            providedBeanInstances: {
                frameworkComponentWrapper: this.frameworkComponentWrapper
            },
            modules: (this.modules || [])
        };
        if (this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map(function (column) {
                return column.toColDef();
            });
        }
        new Grid(this._nativeElement, this.gridOptions, this.gridParams);
        if (this.gridOptions.api) {
            this.api = this.gridOptions.api;
        }
        if (this.gridOptions.columnApi) {
            this.columnApi = this.gridOptions.columnApi;
        }
        this._initialised = true;
        // sometimes, especially in large client apps gridReady can fire before ngAfterViewInit
        // this ties these together so that gridReady will always fire after agGridAngular's ngAfterViewInit
        // the actual containing component's ngAfterViewInit will fire just after agGridAngular's
        this._fullyReady.resolveNow(null, function (resolve) { return resolve; });
    };
    AgGridAngular.prototype.ngOnChanges = function (changes) {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    };
    AgGridAngular.prototype.ngOnDestroy = function () {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            if (this.api) {
                this.api.destroy();
            }
        }
    };
    // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
    // or via gridOptions
    AgGridAngular.prototype.isEmitterUsed = function (eventType) {
        var emitter = this[eventType];
        var hasEmitter = !!emitter && emitter.observers && emitter.observers.length > 0;
        // gridReady => onGridReady
        var asEventName = "on" + eventType.charAt(0).toUpperCase() + eventType.substring(1);
        var hasGridOptionListener = !!this.gridOptions && !!this.gridOptions[asEventName];
        return hasEmitter || hasGridOptionListener;
    };
    AgGridAngular.prototype.globalEventListener = function (eventType, event) {
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        var emitter = this[eventType];
        if (emitter && this.isEmitterUsed(eventType)) {
            if (eventType === 'gridReady') {
                // if the user is listening for gridReady, wait for ngAfterViewInit to fire first, then emit the
                // gridReady event
                this._fullyReady.then((function (result) {
                    emitter.emit(event);
                }));
            }
            else {
                emitter.emit(event);
            }
        }
    };
    AgGridAngular.ctorParameters = function () { return [
        { type: ElementRef },
        { type: ViewContainerRef },
        { type: AngularFrameworkOverrides },
        { type: AngularFrameworkComponentWrapper },
        { type: ComponentFactoryResolver }
    ]; };
    __decorate([
        ContentChildren(AgGridColumn),
        __metadata("design:type", QueryList)
    ], AgGridAngular.prototype, "columns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "gridOptions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridAngular.prototype, "modules", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "statusBar", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "sideBar", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressContextMenu", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "preventDefaultOnContextMenu", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "allowContextMenuWithControlKey", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressMenuHide", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableBrowserTooltips", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "tooltipShowDelay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "tooltipMouseTrack", void 0);
    __decorate([
        Input(),
        __metadata("design:type", HTMLElement)
    ], AgGridAngular.prototype, "popupParent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "copyHeadersToClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "clipboardDeliminator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressCopyRowsToClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressLastEmptyLineOnPaste", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressClipboardPaste", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressClipboardApi", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridAngular.prototype, "columnDefs", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "defaultColDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "defaultColGroupDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "columnTypes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "maintainColumnOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressFieldDotNotation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "deltaColumnMode", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "applyColumnDefOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "immutableColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressSetColumnStateEvents", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressColumnStateEvents", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "colWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "minColWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "maxColWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "headerHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "groupHeaderHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "floatingFiltersHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "pivotHeaderHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "pivotGroupHeaderHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "allowDragFromColumnsToolPanel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressMovableColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressColumnMoveAnimation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressDragLeaveHidesColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "colResizeDefault", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressAutoSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "autoSizePadding", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "skipHeaderOnAutoSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "components", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "frameworkComponents", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "editType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "singleClickEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressClickEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "stopEditingWhenCellsLoseFocus", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enterMovesDown", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enterMovesDownAfterEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "undoRedoCellEditing", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "undoRedoCellEditingLimit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "stopEditingWhenGridLosesFocus", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "defaultCsvExportParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressCsvExport", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "defaultExcelExportParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressExcelExport", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridAngular.prototype, "excelStyles", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "defaultExportParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "quickFilterText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "cacheQuickFilter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "excludeChildrenWhenTreeDataFiltering", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "floatingFilter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableOldSetFilterModel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableCharts", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridAngular.prototype, "chartThemes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "customChartThemes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "chartThemeOverrides", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "processChartOptions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "allowProcessChartOptions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "loadingCellRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "loadingCellRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "loadingCellRendererParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "loadingCellRendererSelector", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "localeText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "masterDetail", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "keepDetailRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "keepDetailRowsCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "detailCellRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "detailCellRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "detailCellRendererParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "detailRowHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "detailRowAutoHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "context", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridAngular.prototype, "alignedGrids", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "tabIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "rowBuffer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "valueCache", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "valueCacheNeverExpires", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableCellExpressions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressParentsInRowNodes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressTouch", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressFocusAfterRefresh", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressAsyncEvents", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressBrowserResizeObserver", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressPropertyNamesCheck", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressChangeDetection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "debug", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "overlayLoadingTemplate", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "loadingOverlayComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "loadingOverlayComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "loadingOverlayComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressLoadingOverlay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "overlayNoRowsTemplate", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "noRowsOverlayComponent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "noRowsOverlayComponentFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "noRowsOverlayComponentParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressNoRowsOverlay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "pagination", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "paginationPageSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "paginationAutoPageSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "paginateChildRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressPaginationPanel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "pivotMode", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "pivotPanelShow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "pivotColumnGroupTotals", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "pivotRowTotals", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "pivotSuppressAutoColumn", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressExpandablePivotGroups", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "functionsReadOnly", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "aggFuncs", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressAggFuncInHeader", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressAggAtRootLevel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "aggregateOnlyChangedColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressAggFilteredOnly", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "animateRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableCellChangeFlash", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "cellFlashDelay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "cellFadeDelay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "domLayout", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "ensureDomOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableRtl", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressColumnVirtualisation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressMaxRenderedRowRestriction", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "rowDragManaged", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressRowDrag", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressMoveWhenRowDragging", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "rowDragEntireRow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "rowDragMultiRow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "fullWidthCellRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "fullWidthCellRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "fullWidthCellRendererParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "embedFullWidthRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "deprecatedEmbedFullWidthRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "groupDisplayType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "groupDefaultExpanded", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "autoGroupColumnDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupMaintainOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupSelectsChildren", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupIncludeFooter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupIncludeTotalFooter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupSuppressBlankHeader", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupSelectsFiltered", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "showOpenedGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupRemoveSingleChildren", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupRemoveLowestSingleChildren", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupHideOpenParents", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "rowGroupPanelShow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupRowRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupRowRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupRowRendererParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressMakeColumnVisibleAfterUnGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "treeData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupRowInnerRenderer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupRowInnerRendererFramework", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupMultiAutoColumn", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupUseEntireRow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "groupSuppressAutoColumn", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "rememberGroupStateWhenNewData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridAngular.prototype, "pinnedTopRowData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridAngular.prototype, "pinnedBottomRowData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "rowModelType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridAngular.prototype, "rowData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "immutableData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "asyncTransactionWaitMillis", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressModelUpdateAfterUpdateTransaction", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "deltaRowDataMode", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "batchUpdateWaitMillis", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "datasource", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "cacheOverflowSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "infiniteInitialRowCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "serverSideStoreType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "cacheBlockSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "maxBlocksInCache", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "maxConcurrentDatasourceRequests", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "blockLoadDebounceMillis", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "purgeClosedRowNodes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideDatasource", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "serverSideSortingAlwaysResets", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "serverSideFilteringAlwaysResets", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressEnterpriseResetOnNewColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "viewportDatasource", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "viewportRowModelPageSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "viewportRowModelBufferSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "alwaysShowHorizontalScroll", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "alwaysShowVerticalScroll", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "debounceVerticalScrollbar", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressHorizontalScroll", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressScrollOnNewData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressScrollWhenPopupsAreOpen", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressAnimationFrame", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressMiddleClickScrolls", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressPreventDefaultOnMouseWheel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "scrollbarWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "rowSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "rowMultiSelectWithClick", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressRowDeselection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressRowClickSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressCellSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressMultiRangeSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableCellTextSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableRangeSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableRangeHandle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableFillHandle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "fillHandleDirection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressClearOnFillReduction", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AgGridAngular.prototype, "sortingOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "accentedSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "unSortIcon", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressMultiSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "multiSortKey", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressMaintainUnsortedOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "icons", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AgGridAngular.prototype, "rowHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowStyle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowClassRules", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressRowHoverHighlight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "suppressRowTransform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "columnHoverHighlight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "deltaSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AgGridAngular.prototype, "treeDataDisplayType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "angularCompileRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "angularCompileFilters", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "functionsPassive", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AgGridAngular.prototype, "enableGroupEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getContextMenuItems", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getMainMenuItems", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "postProcessPopup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "processCellForClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "processHeaderForClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "processCellFromClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "sendToClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "processDataFromClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "isExternalFilterPresent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "doesExternalFilterPass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getChartToolbarItems", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "createChartContainer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "navigateToNextHeader", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "tabToNextHeader", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "navigateToNextCell", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "tabToNextCell", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "suppressKeyboardEvent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "localeTextFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getDocument", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "paginationNumberFormatter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "groupRowAggNodes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "isGroupOpenByDefault", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "defaultGroupOrderComparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "processSecondaryColDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "processSecondaryColGroupDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getDataPath", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "defaultGroupSortComparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getChildCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getServerSideStoreParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "isServerSideGroupOpenByDefault", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "isApplyServerSideTransaction", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "isServerSideGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getServerSideGroupKey", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getBusinessKeyForNode", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getRowNodeId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "processRowPostCreate", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "isRowSelectable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "isRowMaster", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "fillOperation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "postSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getRowStyle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getRowClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "getRowHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], AgGridAngular.prototype, "isFullWidthCell", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "toolPanelVisibleChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "pasteStart", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "pasteEnd", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnVisible", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnPinned", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnResized", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnMoved", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnValueChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnPivotModeChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnPivotChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnGroupOpened", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "newColumnsLoaded", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "gridColumnsChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "displayedColumnsChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "virtualColumnsChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnEverythingChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "componentStateChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellValueChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowValueChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellEditingStarted", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellEditingStopped", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowEditingStarted", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowEditingStopped", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "filterOpened", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "filterChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "filterModified", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "chartCreated", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "chartRangeSelectionChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "chartOptionsChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "chartDestroyed", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellKeyDown", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellKeyPress", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "gridReady", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "firstDataRendered", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "gridSizeChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "modelUpdated", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "virtualRowRemoved", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "viewportChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "bodyScroll", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "bodyScrollEnd", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "dragStarted", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "dragStopped", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "paginationChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowDragEnter", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowDragMove", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowDragLeave", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowDragEnd", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnRowGroupChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowGroupOpened", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "expandOrCollapseAll", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "pinnedRowDataChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowDataChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowDataUpdated", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "asyncTransactionsFlushed", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellClicked", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellDoubleClicked", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellFocused", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellMouseOver", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellMouseOut", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellMouseDown", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowClicked", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowDoubleClicked", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rowSelected", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "selectionChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "cellContextMenu", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "rangeSelectionChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "sortChanged", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnRowGroupChangeRequest", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnPivotChangeRequest", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnValueChangeRequest", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], AgGridAngular.prototype, "columnAggFuncChangeRequest", void 0);
    AgGridAngular = __decorate([
        Component({
            selector: 'ag-grid-angular',
            template: '',
            providers: [
                AngularFrameworkOverrides,
                AngularFrameworkComponentWrapper
            ],
            // tell angular we don't want view encapsulation, we don't want a shadow root
            encapsulation: ViewEncapsulation.None
        }),
        __metadata("design:paramtypes", [ElementRef,
            ViewContainerRef,
            AngularFrameworkOverrides,
            AngularFrameworkComponentWrapper,
            ComponentFactoryResolver])
    ], AgGridAngular);
    return AgGridAngular;
}());

var AgGridModule = /** @class */ (function () {
    function AgGridModule() {
    }
    AgGridModule_1 = AgGridModule;
    AgGridModule.withComponents = function (components) {
        return {
            ngModule: AgGridModule_1,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    };
    AgGridModule.forRoot = function (components) {
        return {
            ngModule: AgGridModule_1,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    };
    var AgGridModule_1;
    AgGridModule = AgGridModule_1 = __decorate([
        NgModule({
            declarations: [AgGridAngular, AgGridColumn],
            imports: [],
            exports: [AgGridAngular, AgGridColumn]
        })
    ], AgGridModule);
    return AgGridModule;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { AgGridAngular, AgGridColumn, AgGridModule, AngularFrameworkComponentWrapper, AngularFrameworkOverrides };
//# sourceMappingURL=ag-grid-angular.js.map
