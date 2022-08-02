import { __decorate, __metadata } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Grid, AgPromise } from "@ag-grid-community/core";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import { AgGridColumn } from "./ag-grid-column.component";
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
        /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu. Default: `false`     */
        this.suppressContextMenu = undefined;
        /** When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
         * This flag is useful to prevent the browser from showing its default context menu.
         * Default: `false`     */
        this.preventDefaultOnContextMenu = undefined;
        /** Allows context menu to show, even when `Ctrl` key is held down. Default: `false`     */
        this.allowContextMenuWithControlKey = undefined;
        /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header. Default: `false`     */
        this.suppressMenuHide = undefined;
        /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component. Default: `false`     */
        this.enableBrowserTooltips = undefined;
        /** The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
         *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
         * Default: `2000`     */
        this.tooltipShowDelay = undefined;
        /** The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
         *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
         * Default: `10000`     */
        this.tooltipHideDelay = undefined;
        /** Set to `true` to have tooltips follow the cursor once they are displayed. Default: `false`     */
        this.tooltipMouseTrack = undefined;
        /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).     */
        this.popupParent = undefined;
        /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
        this.copyHeadersToClipboard = undefined;
        /** Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
        this.copyGroupHeadersToClipboard = undefined;
        /** Specify the delimiter to use when copying to clipboard.
         * Default: `\t`     */
        this.clipboardDelimiter = undefined;
        /** Set to `true` to copy the cell range or focused cell to the clipboard and never the selected rows. Default: `false`     */
        this.suppressCopyRowsToClipboard = undefined;
        /** Set to `true` to copy rows instead of ranges when a range with only a single cell is selected. Default: `false`     */
        this.suppressCopySingleCellRanges = undefined;
        /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard. Default: `false`     */
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
        /** Keeps the order of Columns maintained after new Column Definitions are updated. Default: `false`     */
        this.maintainColumnOrder = undefined;
        /** If `true`, then dots in field names (e.g. `'address.firstLine'`) are not treated as deep references. Allows you to use dots in your field name if you prefer. Default: `false`     */
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
        /** The height in pixels for the row containing the column label header. If not specified, it uses the theme value of `header-height`.     */
        this.headerHeight = undefined;
        /** The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`.     */
        this.groupHeaderHeight = undefined;
        /** The height in pixels for the row containing the floating filters. If not specified, it uses the theme value of `header-height`.     */
        this.floatingFiltersHeight = undefined;
        /** The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`.     */
        this.pivotHeaderHeight = undefined;
        /** The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`.     */
        this.pivotGroupHeaderHeight = undefined;
        /** Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid. Default: `false`     */
        this.allowDragFromColumnsToolPanel = undefined;
        /** Set to `true` to suppress column moving, i.e. to make the columns fixed position. Default: `false`     */
        this.suppressMovableColumns = undefined;
        /** If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns. Default: `false`     */
        this.suppressColumnMoveAnimation = undefined;
        /** If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden. Default: `false`     */
        this.suppressDragLeaveHidesColumns = undefined;
        /** If `true`, when you drag a column into a row group panel the column is not hidden. Default: `false`     */
        this.suppressRowGroupHidesColumns = undefined;
        /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing).     */
        this.colResizeDefault = undefined;
        /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size. Default: `false`     */
        this.suppressAutoSize = undefined;
        /** Number of pixels to add to a column width after the [auto-sizing](/column-sizing/#auto-size-columns) calculation.
         * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
         * Default: `4`     */
        this.autoSizePadding = undefined;
        /** Set this to `true` to skip the `headerName` when `autoSize` is called by default. Default: `false`     */
        this.skipHeaderOnAutoSize = undefined;
        /** A map of component names to components.     */
        this.components = undefined;
        /** @deprecated As of v27, use `components` for framework components too.
         */
        this.frameworkComponents = undefined;
        /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.     */
        this.editType = undefined;
        /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click. Default: `false`     */
        this.singleClickEdit = undefined;
        /** Set to `true` so that neither single nor double click starts editing. Default: `false`     */
        this.suppressClickEdit = undefined;
        /** Set to `true` so stop the grid updating data after and edit. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid.     */
        this.readOnlyEdit = undefined;
        /** Set this to `true` to stop cell editing when grid loses focus.
         * The default is that the grid stays editing until focus goes onto another cell. For inline (non-popup) editors only.
         * Default: `false`     */
        this.stopEditingWhenCellsLoseFocus = undefined;
        /** Set to `true` along with `enterMovesDownAfterEdit` to have Excel-style behaviour for the `Enter` key.
         * i.e. pressing the `Enter` key will move down to the cell beneath.
         * Default: `false`     */
        this.enterMovesDown = undefined;
        /** Set to `true` along with `enterMovesDown` to have Excel-style behaviour for the 'Enter' key.
         * i.e. pressing the Enter key will move down to the cell beneath.
         * Default: `false`     */
        this.enterMovesDownAfterEdit = undefined;
        /** Set to `true` to enable Undo / Redo while editing.     */
        this.undoRedoCellEditing = undefined;
        /** Set the size of the undo / redo stack. Default: `10`     */
        this.undoRedoCellEditingLimit = undefined;
        /** @deprecated Use stopEditingWhenCellsLoseFocus instead
         */
        this.stopEditingWhenGridLosesFocus = undefined;
        /** A default configuration object used to export to CSV.     */
        this.defaultCsvExportParams = undefined;
        /** Prevents the user from exporting the grid to CSV. Default: `false`     */
        this.suppressCsvExport = undefined;
        /** A default configuration object used to export to Excel.     */
        this.defaultExcelExportParams = undefined;
        /** Prevents the user from exporting the grid to Excel. Default: `false`     */
        this.suppressExcelExport = undefined;
        /** A list (array) of Excel styles to be used when exporting to Excel with styles.     */
        this.excelStyles = undefined;
        /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams
         */
        this.defaultExportParams = undefined;
        /** Rows are filtered using this text as a quick filter.     */
        this.quickFilterText = undefined;
        /** Set to `true` to turn on the quick filter cache, used to improve performance when using the quick filter. Default: `false`     */
        this.cacheQuickFilter = undefined;
        /** Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results. Default: `false`     */
        this.excludeChildrenWhenTreeDataFiltering = undefined;
        /** Set to `true` to Enable Charts. Default: `false`     */
        this.enableCharts = undefined;
        /** The list of chart themes to be used.     */
        this.chartThemes = undefined;
        /** A map containing custom chart themes.     */
        this.customChartThemes = undefined;
        /** Chart theme overrides applied to all themes.     */
        this.chartThemeOverrides = undefined;
        /** Provide your own loading cell renderer to use when data is loading via a DataSource.
         * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.     */
        this.loadingCellRenderer = undefined;
        /** @deprecated As of v27, use `loadingCellRenderer` for framework components too.
         */
        this.loadingCellRendererFramework = undefined;
        /** Params to be passed to the `loadingCellRenderer` component.     */
        this.loadingCellRendererParams = undefined;
        /** Callback to select which loading cell renderer to be used when data is loading via a DataSource.     */
        this.loadingCellRendererSelector = undefined;
        /** A map of key->value pairs for localising text within the grid.     */
        this.localeText = undefined;
        /** Set to `true` to enable Master Detail. Default: `false`     */
        this.masterDetail = undefined;
        /** Set to `true` to keep detail rows for when they are displayed again. Default: `false`     */
        this.keepDetailRows = undefined;
        /** Sets the number of details rows to keep. Default: `10`     */
        this.keepDetailRowsCount = undefined;
        /** Provide a custom `detailCellRenderer` to use when a master row is expanded.
         * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.     */
        this.detailCellRenderer = undefined;
        /** @deprecated As of v27, use `detailCellRenderer` for framework components too.
         */
        this.detailCellRendererFramework = undefined;
        /** Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params.     */
        this.detailCellRendererParams = undefined;
        /** Set fixed height in pixels for each detail row.     */
        this.detailRowHeight = undefined;
        /** Set to `true` to have the detail grid dynamically change it's height to fit it's rows.     */
        this.detailRowAutoHeight = undefined;
        /** Set to `true` to keep open Group Rows visible at the top of the grid. Default: `false`.     */
        this.groupRowsSticky = undefined;
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
        /** Set to `true` to turn on the value cache. Default: `false`     */
        this.valueCache = undefined;
        /** Set to `true` to configure the value cache to not expire after data updates. Default: `false`     */
        this.valueCacheNeverExpires = undefined;
        /** Set to `true` to allow cell expressions. Default: `false`     */
        this.enableCellExpressions = undefined;
        /** If `true`, row nodes do not have their parents set.
         * The grid doesn't use the parent reference, but it is included to help the client code navigate the node tree if it wants by providing bi-direction navigation up and down the tree.
         * If this is a problem (e.g. if you need to convert the tree to JSON, which does not allow cyclic dependencies) then set this to `true`.
         * Default: `false`     */
        this.suppressParentsInRowNodes = undefined;
        /** Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch). Default: `false`     */
        this.suppressTouch = undefined;
        /** Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser. Default: `false`     */
        this.suppressFocusAfterRefresh = undefined;
        /** Disables the asynchronous nature of the events introduced in v10, and makes them synchronous. This property only exists for the purpose of supporting legacy code which has a dependency on synchronous events from earlier versions (v9 or earlier) of AG Grid.     **It is strongly recommended that you do not change this property unless you have legacy issues.** Default: `false`     */
        this.suppressAsyncEvents = undefined;
        /** The grid will check for `ResizeObserver` and use it if it exists in the browser, otherwise it will use the grid's alternative implementation. Some users reported issues with Chrome's `ResizeObserver`. Use this property to always use the grid's alternative implementation should such problems exist. Default: `false`     */
        this.suppressBrowserResizeObserver = undefined;
        /** Disables showing a warning message in the console if using a `gridOptions` or `colDef` property that doesn't exist. Default: `false`     */
        this.suppressPropertyNamesCheck = undefined;
        /** Disables change detection. Default: `false`     */
        this.suppressChangeDetection = undefined;
        /** Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems. Default: `false`     */
        this.debug = undefined;
        /** Provide a template for 'loading' overlay.     */
        this.overlayLoadingTemplate = undefined;
        /** Provide a custom loading overlay component.
         * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-loading-overlay-component) for framework specific implementation details.     */
        this.loadingOverlayComponent = undefined;
        /** @deprecated As of v27, use `loadingOverlayComponent` for framework components too.
         */
        this.loadingOverlayComponentFramework = undefined;
        /** Customise the parameters provided to the loading overlay component.     */
        this.loadingOverlayComponentParams = undefined;
        /** Disables the 'loading' overlay. Default: `false`     */
        this.suppressLoadingOverlay = undefined;
        /** Provide a template for 'no rows' overlay.     */
        this.overlayNoRowsTemplate = undefined;
        /** Provide a custom no rows overlay component.
         * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-no-rows-overlay-component) for framework specific implementation details.     */
        this.noRowsOverlayComponent = undefined;
        /** @deprecated As of v27, use `noRowsOverlayComponent` for framework components too.
         */
        this.noRowsOverlayComponentFramework = undefined;
        /** Customise the parameters provided to the no rows overlay component.     */
        this.noRowsOverlayComponentParams = undefined;
        /** Disables the 'no rows' overlay. Default: `false`     */
        this.suppressNoRowsOverlay = undefined;
        /** Set whether pagination is enabled. Default: `false`     */
        this.pagination = undefined;
        /** How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored. Default: `100`     */
        this.paginationPageSize = undefined;
        /** Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used. Default: `false`     */
        this.paginationAutoPageSize = undefined;
        /** Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail. Default: `false`     */
        this.paginateChildRows = undefined;
        /** If `true`, the default grid controls for navigation are hidden.
         * This is useful if `pagination=true` and you want to provide your own pagination controls.
         * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.
         * Default: `false`     */
        this.suppressPaginationPanel = undefined;
        /** Set to `true` to enable pivot mode. Default: `false`     */
        this.pivotMode = undefined;
        /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off. Default: `never`     */
        this.pivotPanelShow = undefined;
        /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified.     */
        this.pivotColumnGroupTotals = undefined;
        /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified.     */
        this.pivotRowTotals = undefined;
        /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column. Default: `false`     */
        this.pivotSuppressAutoColumn = undefined;
        /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups. Default: `false`     */
        this.suppressExpandablePivotGroups = undefined;
        /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection. Default: `false`     */
        this.functionsReadOnly = undefined;
        /** A map of 'function name' to 'function' for custom aggregation functions.     */
        this.aggFuncs = undefined;
        /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`. Default: `false`     */
        this.suppressAggFuncInHeader = undefined;
        /** When `true`, the aggregations won't be computed for the root node of the grid. Default: `false`     */
        this.suppressAggAtRootLevel = undefined;
        /** When using change detection, only the updated column will be re-aggregated. Default: `false`     */
        this.aggregateOnlyChangedColumns = undefined;
        /** Set to `true` so that aggregations are not impacted by filtering. Default: `false`     */
        this.suppressAggFilteredOnly = undefined;
        /** Set to `true` to omit the value Column header when there is only a single value column. Default: `false`     */
        this.removePivotHeaderRowWhenSingleValueColumn = undefined;
        /** Set to `true` to enable Row Animation. Default: `false`     */
        this.animateRows = undefined;
        /** Set to `true` to have cells flash after data changes. Default: `false`     */
        this.enableCellChangeFlash = undefined;
        /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long a cell should remain in its "flashed" state.
         * Default: `500`     */
        this.cellFlashDelay = undefined;
        /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `cellFlashDelay` has completed.
         * Default: `1000`     */
        this.cellFadeDelay = undefined;
        /** Switch between layout options: `normal`, `autoHeight`, `print`.
         * Default: `normal`     */
        this.domLayout = undefined;
        /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen. Default: `false`     */
        this.ensureDomOrder = undefined;
        /** Set to `true` to operate the grid in RTL (Right to Left) mode. Default: `false`     */
        this.enableRtl = undefined;
        /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false`     */
        this.suppressColumnVirtualisation = undefined;
        /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
         * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen) or if your grid height is able to display more than 500 rows at once.**
         * Default: `false`     */
        this.suppressMaxRenderedRowRestriction = undefined;
        /** Set to `true` so that the grid doesn't virtualise the rows. For example, if you have 100 rows, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false`     */
        this.suppressRowVirtualisation = undefined;
        /** Set to `true` to enable Managed Row Dragging. Default: `false`     */
        this.rowDragManaged = undefined;
        /** Set to `true` to suppress row dragging. Default: `false`     */
        this.suppressRowDrag = undefined;
        /** Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up. Default: `false`     */
        this.suppressMoveWhenRowDragging = undefined;
        /** Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle. Default: `false`     */
        this.rowDragEntireRow = undefined;
        /** Set to `true` to enable dragging multiple rows at the same time. Default: `false`     */
        this.rowDragMultiRow = undefined;
        /** Provide your own cell renderer component to use for full width rows.
         * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.     */
        this.fullWidthCellRenderer = undefined;
        /** @deprecated As of v27, use `fullWidthCellRenderer` for framework components too.
         */
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
         * - `'singleColumn'`: single group column automatically added by the grid.
         * - `'multipleColumns'`: a group column per row group is added automatically.
         * - `'groupRows'`: group rows are automatically added instead of group columns.
         * - `'custom'`: informs the grid that group columns will be provided.     */
        this.groupDisplayType = undefined;
        /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything. Default: `0`     */
        this.groupDefaultExpanded = undefined;
        /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included.     */
        this.autoGroupColumnDef = undefined;
        /** When `true`, preserves the current group order when sorting on non-group columns. Default: `false`     */
        this.groupMaintainOrder = undefined;
        /** When `true`, if you select a group, the children of the group will also be selected. Default: `false`     */
        this.groupSelectsChildren = undefined;
        /** Set to determine whether filters should be applied on aggregated group values. Default: `false`     */
        this.groupAggFiltering = undefined;
        /** If grouping, this controls whether to show a group footer when the group is expanded.
         * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
         * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
         * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.
         * Default: `false`     */
        this.groupIncludeFooter = undefined;
        /** Set to `true` to show a 'grand total' group footer across all groups. Default: `false`     */
        this.groupIncludeTotalFooter = undefined;
        /** If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand. Default: `false`     */
        this.groupSuppressBlankHeader = undefined;
        /** If using `groupSelectsChildren`, then only the children that pass the current filter will get selected. Default: `false`     */
        this.groupSelectsFiltered = undefined;
        /** Shows the open group in the group column for non-group rows. Default: `false`     */
        this.showOpenedGroup = undefined;
        /** Set to `true` to collapse groups that only have one child.     */
        this.groupRemoveSingleChildren = undefined;
        /** Set to `true` to collapse lowest level groups that only have one child. Default: `false`     */
        this.groupRemoveLowestSingleChildren = undefined;
        /** Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience. Default: `false`     */
        this.groupHideOpenParents = undefined;
        /** When to show the 'row group panel' (where you drag rows to group) at the top. Default: `never`     */
        this.rowGroupPanelShow = undefined;
        /** Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
         * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.     */
        this.groupRowRenderer = undefined;
        /** @deprecated As of v27, use `groupRowRenderer` for framework components too.
         */
        this.groupRowRendererFramework = undefined;
        /** Customise the parameters provided to the `groupRowRenderer` component.     */
        this.groupRowRendererParams = undefined;
        /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping. Default: `false`     */
        this.suppressMakeColumnVisibleAfterUnGroup = undefined;
        /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.     */
        this.treeData = undefined;
        /** @deprecated - this is now groupRowRendererParams.innerRenderer
         */
        this.groupRowInnerRenderer = undefined;
        /** @deprecated - this is now groupRowRendererParams.innerRenderer
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
        /** Sets the row model type. Default: `clientSide`     */
        this.rowModelType = undefined;
        /** Set the data to be displayed as rows in the grid.     */
        this.rowData = undefined;
        /** @deprecated Immutable Data is on by default when grid callback getRowId() is implemented
    Enables Immutable Data mode, for compatibility with immutable stores. Default: `false`
         */
        this.immutableData = undefined;
        /** How many milliseconds to wait before executing a batch of async transactions.     */
        this.asyncTransactionWaitMillis = undefined;
        /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates. Default: `false`     */
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
        /** Set how many loading rows to display to the user for the root level group.
         * Default: `1`     */
        this.serverSideInitialRowCount = undefined;
        /** @deprecated Whether to use Full Store or Partial Store for storing rows. Default: `full`.
    Deprecated in favour of serverSideInfiniteScroll. When true, Partial Store is used. When false,
    Full Store is used.
         */
        this.serverSideStoreType = undefined;
        /** Set whether Server-side Row Model will use Infinite Scrolling
         * Default: `false`     */
        this.serverSideInfiniteScroll = undefined;
        /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
         * Default: `100`     */
        this.cacheBlockSize = undefined;
        /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.     */
        this.maxBlocksInCache = undefined;
        /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.
         * Set to `-1` for no maximum restriction on requests.
         * Default: `2`     */
        this.maxConcurrentDatasourceRequests = undefined;
        /** How many milliseconds to wait before loading a block. Useful when infinite scrolling and scrolling over many infinite blocks, as it prevents blocks loading until scrolling has settled.     */
        this.blockLoadDebounceMillis = undefined;
        /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping. Default: `false`     */
        this.purgeClosedRowNodes = undefined;
        /** Provide the `serverSideDatasource` for server side row model.     */
        this.serverSideDatasource = undefined;
        /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server. Default: `false`     */
        this.serverSideSortAllLevels = undefined;
        /** When enabled, always refreshes top level groups regardless of which column was filtered. This property only applies when there is Row Grouping & filtering is handled on the server. Default: `false`     */
        this.serverSideFilterAllLevels = undefined;
        /** When enabled, Sorting will be done on the server side. When serverSideInfiniteScroll=true, does nothing,
         * as Sorting is always server side when Infinite Scroll is active.
         * Default: `false`     */
        this.serverSideSortOnServer = undefined;
        /** When enabled, Filtering will be done on the server side. When serverSideInfiniteScroll=true, does nothing,
         * as Filtering is always server side when Infinite Scroll is active.
         * Default: `false`     */
        this.serverSideFilterOnServer = undefined;
        /** @deprecated This property has been deprecated. Use `serverSideSortAllLevels` instead.
         */
        this.serverSideSortingAlwaysResets = undefined;
        /** @deprecated This property has been deprecated. Use `serverSideFilterAllLevels` instead.
         */
        this.serverSideFilteringAlwaysResets = undefined;
        /** @deprecated     */
        this.suppressEnterpriseResetOnNewColumns = undefined;
        /** To use the viewport row model you need to provide the grid with a `viewportDatasource`.     */
        this.viewportDatasource = undefined;
        /** When using viewport row model, sets the page size for the viewport.     */
        this.viewportRowModelPageSize = undefined;
        /** When using viewport row model, sets the buffer size for the viewport.     */
        this.viewportRowModelBufferSize = undefined;
        /** Set to `true` to always show the horizontal scrollbar. Default: `false`     */
        this.alwaysShowHorizontalScroll = undefined;
        /** Set to `true` to always show the vertical scrollbar. Default: `false`     */
        this.alwaysShowVerticalScroll = undefined;
        /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on slow machines. Default: `false`     */
        this.debounceVerticalScrollbar = undefined;
        /** Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.) Default: `false`     */
        this.suppressHorizontalScroll = undefined;
        /** When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data. Default: `false`     */
        this.suppressScrollOnNewData = undefined;
        /** When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present. Default: `false`     */
        this.suppressScrollWhenPopupsAreOpen = undefined;
        /** When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if the grid is working fast enough that you don't need animation frames and you don't want the grid to flicker. Default: `false`     */
        this.suppressAnimationFrame = undefined;
        /** If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function. Default: `false`     */
        this.suppressMiddleClickScrolls = undefined;
        /** If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page. Default: `false`     */
        this.suppressPreventDefaultOnMouseWheel = undefined;
        /** Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations.     */
        this.scrollbarWidth = undefined;
        /** Type of Row Selection: `single`, `multiple`.     */
        this.rowSelection = undefined;
        /** Set to `true` to allow multiple rows to be selected using single click. Default: `false`     */
        this.rowMultiSelectWithClick = undefined;
        /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`. Default: `false`     */
        this.suppressRowDeselection = undefined;
        /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection. Default: `false`     */
        this.suppressRowClickSelection = undefined;
        /** @deprecated This property has been deprecated. Use `suppressCellFocus` instead.
         */
        this.suppressCellSelection = undefined;
        /** If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels. Default: `false`     */
        this.suppressCellFocus = undefined;
        /** If `true`, only a single range can be selected. Default: `false`     */
        this.suppressMultiRangeSelection = undefined;
        /** Set to `true` to be able to select the text within cells.
         *
         *     **Note:** When this is set to `true`, the clipboard service is disabled.
         * Default: `false`     */
        this.enableCellTextSelection = undefined;
        /** Set to `true` to enable Range Selection. Default: `false`     */
        this.enableRangeSelection = undefined;
        /** Set to `true` to enable the Range Handle. Default: `false`     */
        this.enableRangeHandle = undefined;
        /** Set to `true` to enable the Fill Handle. Default: `false`     */
        this.enableFillHandle = undefined;
        /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical. Default: `xy`     */
        this.fillHandleDirection = undefined;
        /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle. Default: `false`     */
        this.suppressClearOnFillReduction = undefined;
        /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`. Default: `[null, 'asc', 'desc']`     */
        this.sortingOrder = undefined;
        /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower. Default: `false`     */
        this.accentedSort = undefined;
        /** Set to `true` to show the 'no sort' icon. Default: `false`     */
        this.unSortIcon = undefined;
        /** Set to `true` to suppress multi-sort when the user shift-clicks a column header. Default: `false`     */
        this.suppressMultiSort = undefined;
        /** Set to `true` to always multi-sort when the user clicks a column header, regardless of key presses. Default: `false`     */
        this.alwaysMultiSort = undefined;
        /** Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key.     */
        this.multiSortKey = undefined;
        /** Set to `true` to suppress sorting of un-sorted data to match original row data. Default: `false`     */
        this.suppressMaintainUnsortedOrder = undefined;
        /** Icons to use inside the grid instead of the grid's default icons.     */
        this.icons = undefined;
        /** Default row height in pixels. Default: `25`     */
        this.rowHeight = undefined;
        /** The style properties to apply to all rows. Set to an object of key (style names) and values (style values)     */
        this.rowStyle = undefined;
        /** CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names).     */
        this.rowClass = undefined;
        /** Rules which can be applied to include certain CSS classes.     */
        this.rowClassRules = undefined;
        /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class. Default: `false`     */
        this.suppressRowHoverHighlight = undefined;
        /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning. Default: `false`     */
        this.suppressRowTransform = undefined;
        /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class. Default: `false`     */
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
        /** Allows you to process group header values for the clipboard.     */
        this.processGroupHeaderForClipboard = undefined;
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
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.     */
        this.navigateToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.     */
        this.tabToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.     */
        this.navigateToNextCell = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused. Return the next Cell position to navigate to or null to stay on current cell.     */
        this.tabToNextCell = undefined;
        /** @deprecated - Set via `colDef.suppressKeyboardEvent`. If you need this to be set for every column set via the `defaultColDef.suppressKeyboardEvent` property.
         */
        this.suppressKeyboardEvent = undefined;
        /** @deprecated - Use `getLocaleText` instead.
         */
        this.localeTextFunc = undefined;
        /** A callback for localising text within the grid.     */
        this.getLocaleText = undefined;
        /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)     */
        this.getDocument = undefined;
        /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.     */
        this.paginationNumberFormatter = undefined;
        /** @deprecated - Use `getGroupRowAgg` instead.
         */
        this.groupRowAggNodes = undefined;
        /** Callback to use when you need access to more then the current column for aggregation.     */
        this.getGroupRowAgg = undefined;
        /** (Client-side Row Model only) Allows groups to be open by default.     */
        this.isGroupOpenByDefault = undefined;
        /** Allows default sorting of groups.     */
        this.initialGroupOrderComparator = undefined;
        /** @deprecated - Use `initialGroupOrderComparator` instead
         */
        this.defaultGroupOrderComparator = undefined;
        /** @deprecated - Use `processPivotResultColDef` instead
         */
        this.processSecondaryColDef = undefined;
        /** @deprecated - Use `processPivotResultColGroupDef` instead
         */
        this.processSecondaryColGroupDef = undefined;
        /** Callback to be used with pivoting, to allow changing the second column definition.     */
        this.processPivotResultColDef = undefined;
        /** Callback to be used with pivoting, to allow changing the second column group definition.     */
        this.processPivotResultColGroupDef = undefined;
        /** Callback to be used when working with Tree Data when `treeData = true`.     */
        this.getDataPath = undefined;
        /** @deprecated - Use initialGroupOrderComparator instead
         */
        this.defaultGroupSortComparator = undefined;
        /** Allows setting the child count for a group row.     */
        this.getChildCount = undefined;
        /** Allows providing different params for different levels of grouping.     */
        this.getServerSideGroupLevelParams = undefined;
        /** @deprecated use `getServerSideGroupLevelParams` instead.
         */
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
        /** @deprecated Use `getRowId` instead - however be aware, `getRowId()` will also set grid option `immutableData=true`
    Allows you to set the ID for a particular row node based on the data.
         */
        this.getRowNodeId = undefined;
        /** Allows setting the ID for a particular row node based on the data.     */
        this.getRowId = undefined;
        /** When enabled, getRowId() callback is implemented and new Row Data is set, the grid will disregard all previous rows and treat the new Row Data as new data. As a consequence, all Row State (eg selection, rendered rows) will be reset.  Default: `false`     */
        this.resetRowDataOnUpdate = undefined;
        /** Allows you to process rows after they are created, so you can do final adding of custom attributes etc.     */
        this.processRowPostCreate = undefined;
        /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable.     */
        this.isRowSelectable = undefined;
        /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row.     */
        this.isRowMaster = undefined;
        /** Callback to fill values instead of simply copying values or increasing number values using linear progression.     */
        this.fillOperation = undefined;
        /** @deprecated Use `postSortRows` instead
         */
        this.postSort = undefined;
        /** Callback to perform additional sorting after the grid has sorted the rows.     */
        this.postSortRows = undefined;
        /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.     */
        this.getRowStyle = undefined;
        /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.     */
        this.getRowClass = undefined;
        /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.     */
        this.getRowHeight = undefined;
        /** @deprecated Use `isFullWidthRow` instead.
         */
        this.isFullWidthCell = undefined;
        /** Tells the grid if this row should be rendered as full width.     */
        this.isFullWidthRow = undefined;
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
        /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
         * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.     */
        this.componentStateChanged = new EventEmitter();
        /** Value has changed after editing (this event will not fire if editing was cancelled, eg ESC was pressed) or
         *   if cell value has changed as a result of paste operation.     */
        this.cellValueChanged = new EventEmitter();
        /** Value has changed after editing. Only fires when doing Read Only Edits, ie `readOnlyEdit=true`.     */
        this.cellEditRequest = new EventEmitter();
        /** A cell's value within a row has changed. This event corresponds to Full Row Editing only.     */
        this.rowValueChanged = new EventEmitter();
        /** Editing a cell has started.     */
        this.cellEditingStarted = new EventEmitter();
        /** Editing a cell has stopped.     */
        this.cellEditingStopped = new EventEmitter();
        /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing.     */
        this.rowEditingStarted = new EventEmitter();
        /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing.     */
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
        /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet     */
        this.gridReady = new EventEmitter();
        /** Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents     */
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
        /** @deprecated No longer fired, use onRowDataUpdated instead
         */
        this.rowDataChanged = new EventEmitter();
        /** The client has updated data for the grid by either a) setting new Row Data or b) Applying a Row Transaction.     */
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
        /** Row selection is changed. Use the grid API `getSelectedNodes()` or `getSelectedRows()` to get the new list of selected nodes / row data.     */
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressContextMenu", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "preventDefaultOnContextMenu", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "allowContextMenuWithControlKey", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMenuHide", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableBrowserTooltips", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "tooltipShowDelay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "tooltipHideDelay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "tooltipMouseTrack", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "popupParent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "copyHeadersToClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "copyGroupHeadersToClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "clipboardDelimiter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressCopyRowsToClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressCopySingleCellRanges", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressLastEmptyLineOnPaste", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressClipboardPaste", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressClipboardApi", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "maintainColumnOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressFieldDotNotation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "deltaColumnMode", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "applyColumnDefOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "immutableColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressSetColumnStateEvents", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressColumnStateEvents", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "colWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "minColWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "maxColWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "headerHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupHeaderHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "floatingFiltersHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "pivotHeaderHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "pivotGroupHeaderHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "allowDragFromColumnsToolPanel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMovableColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressColumnMoveAnimation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressDragLeaveHidesColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressRowGroupHidesColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "colResizeDefault", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressAutoSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "autoSizePadding", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "editType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "singleClickEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressClickEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "readOnlyEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "stopEditingWhenCellsLoseFocus", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enterMovesDown", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enterMovesDownAfterEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "undoRedoCellEditing", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "undoRedoCellEditingLimit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "stopEditingWhenGridLosesFocus", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "defaultCsvExportParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressCsvExport", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "defaultExcelExportParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressExcelExport", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "excelStyles", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "defaultExportParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "quickFilterText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "cacheQuickFilter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "excludeChildrenWhenTreeDataFiltering", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableCharts", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "loadingCellRendererSelector", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "localeText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "masterDetail", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "keepDetailRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "detailRowHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "detailRowAutoHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupRowsSticky", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "context", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "alignedGrids", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "tabIndex", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowBuffer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "valueCache", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "valueCacheNeverExpires", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableCellExpressions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressParentsInRowNodes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressTouch", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressFocusAfterRefresh", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressAsyncEvents", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressBrowserResizeObserver", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressPropertyNamesCheck", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressChangeDetection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "debug", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressLoadingOverlay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressNoRowsOverlay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "pagination", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "paginationPageSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "paginationAutoPageSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "paginateChildRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressPaginationPanel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "pivotMode", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "pivotPanelShow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "pivotColumnGroupTotals", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "pivotRowTotals", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "pivotSuppressAutoColumn", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressExpandablePivotGroups", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "functionsReadOnly", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "aggFuncs", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressAggFuncInHeader", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressAggAtRootLevel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "aggregateOnlyChangedColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressAggFilteredOnly", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "removePivotHeaderRowWhenSingleValueColumn", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "animateRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableCellChangeFlash", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "cellFlashDelay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "cellFadeDelay", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "domLayout", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "ensureDomOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableRtl", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressColumnVirtualisation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMaxRenderedRowRestriction", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressRowVirtualisation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowDragManaged", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressRowDrag", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMoveWhenRowDragging", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowDragEntireRow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "embedFullWidthRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "deprecatedEmbedFullWidthRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupDisplayType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupDefaultExpanded", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "autoGroupColumnDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupMaintainOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupSelectsChildren", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupAggFiltering", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupIncludeFooter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupIncludeTotalFooter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupSuppressBlankHeader", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupSelectsFiltered", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "showOpenedGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupRemoveSingleChildren", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupRemoveLowestSingleChildren", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupHideOpenParents", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMakeColumnVisibleAfterUnGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupMultiAutoColumn", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupUseEntireRow", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupSuppressAutoColumn", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rememberGroupStateWhenNewData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "pinnedTopRowData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "pinnedBottomRowData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowModelType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "immutableData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "asyncTransactionWaitMillis", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressModelUpdateAfterUpdateTransaction", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "deltaRowDataMode", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "batchUpdateWaitMillis", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "datasource", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "cacheOverflowSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "infiniteInitialRowCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideInitialRowCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideStoreType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideInfiniteScroll", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "cacheBlockSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "maxBlocksInCache", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "maxConcurrentDatasourceRequests", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "blockLoadDebounceMillis", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "purgeClosedRowNodes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideDatasource", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideSortAllLevels", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideFilterAllLevels", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideSortOnServer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideFilterOnServer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideSortingAlwaysResets", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "serverSideFilteringAlwaysResets", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressEnterpriseResetOnNewColumns", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "viewportDatasource", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "viewportRowModelPageSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "viewportRowModelBufferSize", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "alwaysShowHorizontalScroll", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "alwaysShowVerticalScroll", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "debounceVerticalScrollbar", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressHorizontalScroll", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressScrollOnNewData", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressScrollWhenPopupsAreOpen", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressAnimationFrame", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMiddleClickScrolls", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressPreventDefaultOnMouseWheel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "scrollbarWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "rowMultiSelectWithClick", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressRowDeselection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressRowClickSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressCellSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressCellFocus", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMultiRangeSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableCellTextSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableRangeSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableRangeHandle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableFillHandle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "fillHandleDirection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressClearOnFillReduction", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "sortingOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "accentedSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "unSortIcon", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMultiSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "alwaysMultiSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "multiSortKey", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressMaintainUnsortedOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "icons", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
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
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressRowHoverHighlight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressRowTransform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "columnHoverHighlight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "deltaSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "treeDataDisplayType", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "angularCompileRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "angularCompileFilters", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "functionsPassive", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "enableGroupEdit", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getContextMenuItems", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getMainMenuItems", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "postProcessPopup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "processCellForClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "processHeaderForClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "processGroupHeaderForClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "processCellFromClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "sendToClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "processDataFromClipboard", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "isExternalFilterPresent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "doesExternalFilterPass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getChartToolbarItems", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "createChartContainer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "navigateToNextHeader", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "tabToNextHeader", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "navigateToNextCell", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "tabToNextCell", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "suppressKeyboardEvent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "localeTextFunc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getLocaleText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getDocument", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "paginationNumberFormatter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "groupRowAggNodes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getGroupRowAgg", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "isGroupOpenByDefault", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "initialGroupOrderComparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "defaultGroupOrderComparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "processSecondaryColDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "processSecondaryColGroupDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "processPivotResultColDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "processPivotResultColGroupDef", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getDataPath", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "defaultGroupSortComparator", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getChildCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getServerSideGroupLevelParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getServerSideStoreParams", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "isServerSideGroupOpenByDefault", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "isApplyServerSideTransaction", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "isServerSideGroup", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getServerSideGroupKey", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getBusinessKeyForNode", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getRowNodeId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getRowId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "resetRowDataOnUpdate", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "processRowPostCreate", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "isRowSelectable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "isRowMaster", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "fillOperation", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "postSort", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "postSortRows", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getRowStyle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getRowClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "getRowHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "isFullWidthCell", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AgGridAngular.prototype, "isFullWidthRow", void 0);
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
    ], AgGridAngular.prototype, "cellEditRequest", void 0);
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
export { AgGridAngular };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLWxlZ2FjeS8iLCJzb3VyY2VzIjpbImxpYi9hZy1ncmlkLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsYUFBYSxFQUNiLFNBQVMsRUFDVCx3QkFBd0IsRUFDeEIsZUFBZSxFQUNmLFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNwQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBR0gsYUFBYSxFQUNiLElBQUksRUFLSixTQUFTLEVBcUlaLE1BQU0seUJBQXlCLENBQUM7QUFFakMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDeEUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDdEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBWTFEO0lBa0JJLHVCQUFZLFVBQXNCLEVBQ3RCLGdCQUFrQyxFQUNsQyx5QkFBb0QsRUFDcEQseUJBQTJELEVBQzNELHdCQUFrRDtRQUhsRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFrQztRQUMzRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBbEJ0RCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSTNCLDBEQUEwRDtRQUNsRCxnQkFBVyxHQUF1QixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBaUhsRSxVQUFVO1FBQ1Ysd0VBQXdFO1FBQ3hELGNBQVMsR0FBb0QsU0FBUyxDQUFDO1FB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QWtDLFlBQVk7bUVBQWtHO0lBQy9JO1FBQVQsTUFBTSxFQUFFO2tDQUFrQyxZQUFZO21FQUFrRztJQUMvSTtRQUFULE1BQU0sRUFBRTtrQ0FBb0MsWUFBWTtxRUFBc0c7SUE5OEJ0SixhQUFhO1FBVnpCLFNBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSxpQkFBaUI7WUFDM0IsUUFBUSxFQUFFLEVBQUU7WUFDWixTQUFTLEVBQUU7Z0JBQ1AseUJBQXlCO2dCQUN6QixnQ0FBZ0M7YUFDbkM7WUFDRCw2RUFBNkU7WUFDN0UsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7U0FDeEMsQ0FBQzt5Q0FtQjBCLFVBQVU7WUFDSixnQkFBZ0I7WUFDUCx5QkFBeUI7WUFDekIsZ0NBQWdDO1lBQ2pDLHdCQUF3QjtPQXRCckQsYUFBYSxDQXdtQ3pCO0lBQUQsb0JBQUM7Q0FBQSxBQXhtQ0QsSUF3bUNDO1NBeG1DWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZnRlclZpZXdJbml0LFxuICAgIENvbXBvbmVudCxcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgQ29udGVudENoaWxkcmVuLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIElucHV0LFxuICAgIE91dHB1dCxcbiAgICBRdWVyeUxpc3QsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQge1xuICAgIENvbERlZixcbiAgICBDb2x1bW5BcGksXG4gICAgQ29tcG9uZW50VXRpbCxcbiAgICBHcmlkLFxuICAgIEdyaWRBcGksXG4gICAgR3JpZE9wdGlvbnMsXG4gICAgR3JpZFBhcmFtcyxcbiAgICBNb2R1bGUsXG4gICAgQWdQcm9taXNlLFxuICAgIENvbEdyb3VwRGVmLFxuICAgIEV4Y2VsU3R5bGUsXG4gICAgSURhdGFzb3VyY2UsXG4gICAgSVNlcnZlclNpZGVEYXRhc291cmNlLFxuICAgIElWaWV3cG9ydERhdGFzb3VyY2UsXG4gICAgSUFnZ0Z1bmMsXG4gICAgQ3N2RXhwb3J0UGFyYW1zLFxuICAgIEV4Y2VsRXhwb3J0UGFyYW1zLFxuICAgIFN0YXR1c1BhbmVsRGVmLFxuICAgIFNpZGVCYXJEZWYsXG4gICAgQWdDaGFydFRoZW1lT3ZlcnJpZGVzLFxuICAgIEFnQ2hhcnRUaGVtZSxcbiAgICBTZXJ2ZXJTaWRlU3RvcmVUeXBlLFxuICAgIFJvd0dyb3VwaW5nRGlzcGxheVR5cGUsXG4gICAgR2V0Q29udGV4dE1lbnVJdGVtcyxcbiAgICBHZXRNYWluTWVudUl0ZW1zLFxuICAgIEdldFJvd05vZGVJZEZ1bmMsXG4gICAgR2V0Um93SWRGdW5jLFxuICAgIE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIEhlYWRlclBvc2l0aW9uLFxuICAgIFRhYlRvTmV4dEhlYWRlclBhcmFtcyxcbiAgICBOYXZpZ2F0ZVRvTmV4dENlbGxQYXJhbXMsXG4gICAgQ2VsbFBvc2l0aW9uLFxuICAgIFRhYlRvTmV4dENlbGxQYXJhbXMsXG4gICAgUG9zdFByb2Nlc3NQb3B1cFBhcmFtcyxcbiAgICBHZXREYXRhUGF0aCxcbiAgICBSb3dOb2RlLFxuICAgIElzUm93TWFzdGVyLFxuICAgIElzUm93U2VsZWN0YWJsZSxcbiAgICBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zLFxuICAgIFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtcyxcbiAgICBHZXRTZXJ2ZXJTaWRlR3JvdXBLZXksXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXAsXG4gICAgU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zLFxuICAgIEdldENoYXJ0VG9vbGJhckl0ZW1zLFxuICAgIEZpbGxPcGVyYXRpb25QYXJhbXMsXG4gICAgSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbixcbiAgICBHZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc1BhcmFtcyxcbiAgICBTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtcyxcbiAgICBJc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMsXG4gICAgSXNHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMsXG4gICAgQ29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudCxcbiAgICBOZXdDb2x1bW5zTG9hZGVkRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50LFxuICAgIEV4cGFuZENvbGxhcHNlQWxsRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQsXG4gICAgR3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uTW92ZWRFdmVudCxcbiAgICBDb2x1bW5WaXNpYmxlRXZlbnQsXG4gICAgQ29sdW1uUGlubmVkRXZlbnQsXG4gICAgQ29sdW1uR3JvdXBPcGVuZWRFdmVudCxcbiAgICBDb2x1bW5SZXNpemVkRXZlbnQsXG4gICAgRGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQsXG4gICAgUm93R3JvdXBPcGVuZWRFdmVudCxcbiAgICBSb3dEYXRhQ2hhbmdlZEV2ZW50LFxuICAgIFJvd0RhdGFVcGRhdGVkRXZlbnQsXG4gICAgUGlubmVkUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDaGFydENyZWF0ZWQsXG4gICAgQ2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQsXG4gICAgQ2hhcnRPcHRpb25zQ2hhbmdlZCxcbiAgICBDaGFydERlc3Ryb3llZCxcbiAgICBDaGFydFJlZlBhcmFtcyxcbiAgICBUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50LFxuICAgIE1vZGVsVXBkYXRlZEV2ZW50LFxuICAgIFBhc3RlU3RhcnRFdmVudCxcbiAgICBQYXN0ZUVuZEV2ZW50LFxuICAgIENlbGxDbGlja2VkRXZlbnQsXG4gICAgQ2VsbERvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBDZWxsTW91c2VEb3duRXZlbnQsXG4gICAgQ2VsbENvbnRleHRNZW51RXZlbnQsXG4gICAgQ2VsbFZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIFJvd1ZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENlbGxGb2N1c2VkRXZlbnQsXG4gICAgUm93U2VsZWN0ZWRFdmVudCxcbiAgICBTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgQ2VsbEtleURvd25FdmVudCxcbiAgICBDZWxsS2V5UHJlc3NFdmVudCxcbiAgICBDZWxsTW91c2VPdmVyRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3V0RXZlbnQsXG4gICAgRmlsdGVyQ2hhbmdlZEV2ZW50LFxuICAgIEZpbHRlck1vZGlmaWVkRXZlbnQsXG4gICAgRmlsdGVyT3BlbmVkRXZlbnQsXG4gICAgU29ydENoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50LFxuICAgIFJvd0NsaWNrZWRFdmVudCxcbiAgICBSb3dEb3VibGVDbGlja2VkRXZlbnQsXG4gICAgR3JpZFJlYWR5RXZlbnQsXG4gICAgR3JpZFNpemVDaGFuZ2VkRXZlbnQsXG4gICAgVmlld3BvcnRDaGFuZ2VkRXZlbnQsXG4gICAgRmlyc3REYXRhUmVuZGVyZWRFdmVudCxcbiAgICBEcmFnU3RhcnRlZEV2ZW50LFxuICAgIERyYWdTdG9wcGVkRXZlbnQsXG4gICAgUm93RWRpdGluZ1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIENlbGxFZGl0UmVxdWVzdEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIEJvZHlTY3JvbGxFdmVudCxcbiAgICBCb2R5U2Nyb2xsRW5kRXZlbnQsXG4gICAgUGFnaW5hdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudCxcbiAgICBSb3dEcmFnRXZlbnQsXG4gICAgQ29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBQcm9jZXNzUm93UGFyYW1zLFxuICAgIFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0dyb3VwSGVhZGVyRm9yRXhwb3J0UGFyYW1zLFxuICAgIFJvd1N0eWxlLFxuICAgIFJvd0NsYXNzUnVsZXMsXG4gICAgUm93Q2xhc3NQYXJhbXMsXG4gICAgUm93SGVpZ2h0UGFyYW1zLFxuICAgIFNlbmRUb0NsaXBib2FyZFBhcmFtcyxcbiAgICBUcmVlRGF0YURpc3BsYXlUeXBlLFxuICAgIEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQsXG4gICAgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnQsXG4gICAgTG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yRnVuYyxcbiAgICBJc0V4dGVybmFsRmlsdGVyUHJlc2VudFBhcmFtcyxcbiAgICBJbml0aWFsR3JvdXBPcmRlckNvbXBhcmF0b3JQYXJhbXMsXG4gICAgR2V0R3JvdXBSb3dBZ2dQYXJhbXMsXG4gICAgUG9zdFNvcnRSb3dzUGFyYW1zLFxuICAgIElzRnVsbFdpZHRoUm93UGFyYW1zLFxuICAgIEdldExvY2FsZVRleHRQYXJhbXMsXG4gICAgSXNSb3dGaWx0ZXJhYmxlLFxuICAgIFJvd01vZGVsVHlwZVxufSBmcm9tIFwiQGFnLWdyaWQtY29tbXVuaXR5L2NvcmVcIjtcblxuaW1wb3J0IHsgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyB9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXNcIjtcbmltcG9ydCB7IEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyIH0gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcIjtcbmltcG9ydCB7IEFnR3JpZENvbHVtbiB9IGZyb20gXCIuL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudFwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtYW5ndWxhcicsXG4gICAgdGVtcGxhdGU6ICcnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgIF0sXG4gICAgLy8gdGVsbCBhbmd1bGFyIHdlIGRvbid0IHdhbnQgdmlldyBlbmNhcHN1bGF0aW9uLCB3ZSBkb24ndCB3YW50IGEgc2hhZG93IHJvb3RcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZEFuZ3VsYXI8VERhdGEgPSBhbnk+IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgLy8gbm90IGludGVuZGVkIGZvciB1c2VyIHRvIGludGVyYWN0IHdpdGguIHNvIHB1dHRpbmcgXyBpbiBzbyBpZiB1c2VyIGdldHMgcmVmZXJlbmNlXG4gICAgLy8gdG8gdGhpcyBvYmplY3QsIHRoZXkga2luZCdhIGtub3cgaXQncyBub3QgcGFydCBvZiB0aGUgYWdyZWVkIGludGVyZmFjZVxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBncmlkUGFyYW1zOiBHcmlkUGFyYW1zO1xuXG4gICAgLy8gaW4gb3JkZXIgdG8gZW5zdXJlIGZpcmluZyBvZiBncmlkUmVhZHkgaXMgZGV0ZXJtaW5pc3RpY1xuICAgIHByaXZhdGUgX2Z1bGx5UmVhZHk6IEFnUHJvbWlzZTxib29sZWFuPiA9IEFnUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXG4gICAgLy8gbWFraW5nIHRoZXNlIHB1YmxpYywgc28gdGhleSBhcmUgYWNjZXNzaWJsZSB0byBwZW9wbGUgdXNpbmcgdGhlIG5nMiBjb21wb25lbnQgcmVmZXJlbmNlc1xuICAgIHB1YmxpYyBhcGk6IEdyaWRBcGk8VERhdGE+O1xuICAgIHB1YmxpYyBjb2x1bW5BcGk6IENvbHVtbkFwaTtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgYW5ndWxhckZyYW1ld29ya092ZXJyaWRlczogQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcixcbiAgICAgICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Vmlld0NvbnRhaW5lclJlZih0aGlzLnZpZXdDb250YWluZXJSZWYpO1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyKHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnNldEVtaXR0ZXJVc2VkQ2FsbGJhY2sodGhpcy5pc0VtaXR0ZXJVc2VkLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBDb21wb25lbnRVdGlsLmNvcHlBdHRyaWJ1dGVzVG9HcmlkT3B0aW9ucyh0aGlzLmdyaWRPcHRpb25zLCB0aGlzLCB0cnVlKTtcblxuICAgICAgICB0aGlzLmdyaWRQYXJhbXMgPSB7XG4gICAgICAgICAgICBnbG9iYWxFdmVudExpc3RlbmVyOiB0aGlzLmdsb2JhbEV2ZW50TGlzdGVuZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGZyYW1ld29ya092ZXJyaWRlczogdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgcHJvdmlkZWRCZWFuSW5zdGFuY2VzOiB7XG4gICAgICAgICAgICAgICAgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kdWxlczogKHRoaXMubW9kdWxlcyB8fCBbXSkgYXMgYW55XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAmJiB0aGlzLmNvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5EZWZzID0gdGhpcy5jb2x1bW5zXG4gICAgICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXcgR3JpZCh0aGlzLl9uYXRpdmVFbGVtZW50LCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmdyaWRQYXJhbXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmFwaSkge1xuICAgICAgICAgICAgdGhpcy5hcGkgPSB0aGlzLmdyaWRPcHRpb25zLmFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaSkge1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5BcGkgPSB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBzb21ldGltZXMsIGVzcGVjaWFsbHkgaW4gbGFyZ2UgY2xpZW50IGFwcHMgZ3JpZFJlYWR5IGNhbiBmaXJlIGJlZm9yZSBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhpcyB0aWVzIHRoZXNlIHRvZ2V0aGVyIHNvIHRoYXQgZ3JpZFJlYWR5IHdpbGwgYWx3YXlzIGZpcmUgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGUgYWN0dWFsIGNvbnRhaW5pbmcgY29tcG9uZW50J3MgbmdBZnRlclZpZXdJbml0IHdpbGwgZmlyZSBqdXN0IGFmdGVyIGFnR3JpZEFuZ3VsYXInc1xuICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnJlc29sdmVOb3cobnVsbCwgcmVzb2x2ZSA9PiByZXNvbHZlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgQ29tcG9uZW50VXRpbC5wcm9jZXNzT25DaGFuZ2UoY2hhbmdlcywgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5hcGksIHRoaXMuY29sdW1uQXBpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIHRoZSBkZXN0cm95LCBzbyB3ZSBrbm93IG5vdCB0byBlbWl0IGFueSBldmVudHNcbiAgICAgICAgICAgIC8vIHdoaWxlIHRlYXJpbmcgZG93biB0aGUgZ3JpZC5cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5hcGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwaS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSdsbCBlbWl0IHRoZSBlbWl0IGlmIGEgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGEgZ2l2ZW4gZXZlbnQgZWl0aGVyIG9uIHRoZSBjb21wb25lbnQgdmlhIG5vcm1hbCBhbmd1bGFyIGJpbmRpbmdcbiAgICAvLyBvciB2aWEgZ3JpZE9wdGlvbnNcbiAgICBwcm90ZWN0ZWQgaXNFbWl0dGVyVXNlZChldmVudFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGNvbnN0IGhhc0VtaXR0ZXIgPSAhIWVtaXR0ZXIgJiYgZW1pdHRlci5vYnNlcnZlcnMgJiYgZW1pdHRlci5vYnNlcnZlcnMubGVuZ3RoID4gMDtcblxuICAgICAgICAvLyBncmlkUmVhZHkgPT4gb25HcmlkUmVhZHlcbiAgICAgICAgY29uc3QgYXNFdmVudE5hbWUgPSBgb24ke2V2ZW50VHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKX0ke2V2ZW50VHlwZS5zdWJzdHJpbmcoMSl9YFxuICAgICAgICBjb25zdCBoYXNHcmlkT3B0aW9uTGlzdGVuZXIgPSAhIXRoaXMuZ3JpZE9wdGlvbnMgJiYgISF0aGlzLmdyaWRPcHRpb25zW2FzRXZlbnROYW1lXTtcblxuICAgICAgICByZXR1cm4gaGFzRW1pdHRlciB8fCBoYXNHcmlkT3B0aW9uTGlzdGVuZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSB0ZWFyaW5nIGRvd24sIGRvbid0IGVtaXQgYW5ndWxhciBldmVudHMsIGFzIHRoaXMgY2F1c2VzXG4gICAgICAgIC8vIHByb2JsZW1zIHdpdGggdGhlIGFuZ3VsYXIgcm91dGVyXG4gICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdlbmVyaWNhbGx5IGxvb2sgdXAgdGhlIGV2ZW50VHlwZVxuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGlmIChlbWl0dGVyICYmIHRoaXMuaXNFbWl0dGVyVXNlZChldmVudFR5cGUpKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09PSAnZ3JpZFJlYWR5Jykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgZ3JpZFJlYWR5LCB3YWl0IGZvciBuZ0FmdGVyVmlld0luaXQgdG8gZmlyZSBmaXJzdCwgdGhlbiBlbWl0IHRoZVxuICAgICAgICAgICAgICAgIC8vIGdyaWRSZWFkeSBldmVudFxuICAgICAgICAgICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkudGhlbigocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb25zPFREYXRhPjtcbiAgICBASW5wdXQoKSBwdWJsaWMgbW9kdWxlczogTW9kdWxlW107XG5cbiAgICAvLyBAU1RBUlRAXG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc3RhdHVzIGJhciBjb21wb25lbnRzIHRvIHVzZSBpbiB0aGUgc3RhdHVzIGJhci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0YXR1c0JhcjogeyBzdGF0dXNQYW5lbHM6IFN0YXR1c1BhbmVsRGVmW107IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc2lkZSBiYXIgY29tcG9uZW50cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpZGVCYXI6IFNpZGVCYXJEZWYgfCBzdHJpbmcgfCBzdHJpbmdbXSB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzaG93IHRoZSBjb250ZXh0IG1lbnUuIFVzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgJ3JpZ2h0IGNsaWNrJyBjb250ZXh0IG1lbnUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgYHN1cHByZXNzQ29udGV4dE1lbnVgLCB5b3UgY2FuIHVzZSB0aGUgYG9uQ2VsbENvbnRleHRNZW51YCBmdW5jdGlvbiB0byBwcm92aWRlIHlvdXIgb3duIGNvZGUgdG8gaGFuZGxlIGNlbGwgYGNvbnRleHRtZW51YCBldmVudHMuXG4gICAgICogVGhpcyBmbGFnIGlzIHVzZWZ1bCB0byBwcmV2ZW50IHRoZSBicm93c2VyIGZyb20gc2hvd2luZyBpdHMgZGVmYXVsdCBjb250ZXh0IG1lbnUuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY29udGV4dCBtZW51IHRvIHNob3csIGV2ZW4gd2hlbiBgQ3RybGAga2V5IGlzIGhlbGQgZG93bi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSBjb2x1bW4gbWVudSBidXR0b24sIHJhdGhlciB0aGFuIG9ubHkgc2hvd2luZyB3aGVuIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHVzZSB0aGUgYnJvd3NlcidzIGRlZmF1bHQgdG9vbHRpcCBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBncmlkJ3MgVG9vbHRpcCBDb21wb25lbnQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyB0aGF0IGl0IHRha2VzIGZvciB0b29sdGlwcyB0byBzaG93IHVwIG9uY2UgYW4gZWxlbWVudCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgLlxuICAgICAqIERlZmF1bHQ6IGAyMDAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFNob3dEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIHRoYXQgaXQgdGFrZXMgZm9yIHRvb2x0aXBzIHRvIGhpZGUgb25jZSB0aGV5IGhhdmUgYmVlbiBkaXNwbGF5ZWQuXG4gICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgLlxuICAgICAqIERlZmF1bHQ6IGAxMDAwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBIaWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRvb2x0aXBzIGZvbGxvdyB0aGUgY3Vyc29yIG9uY2UgdGhleSBhcmUgZGlzcGxheWVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwTW91c2VUcmFjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRE9NIGVsZW1lbnQgdG8gdXNlIGFzIHRoZSBwb3B1cCBwYXJlbnQgZm9yIGdyaWQgcG9wdXBzIChjb250ZXh0IG1lbnUsIGNvbHVtbiBtZW51IGV0YykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3B1cFBhcmVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxzbyBpbmNsdWRlIGhlYWRlcnMgd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZCB1c2luZyBgQ3RybCArIENgIGNsaXBib2FyZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgZ3JvdXAgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5R3JvdXBIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZnkgdGhlIGRlbGltaXRlciB0byB1c2Ugd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZC5cbiAgICAgKiBEZWZhdWx0OiBgXFx0YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2xpcGJvYXJkRGVsaW1pdGVyOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29weSB0aGUgY2VsbCByYW5nZSBvciBmb2N1c2VkIGNlbGwgdG8gdGhlIGNsaXBib2FyZCBhbmQgbmV2ZXIgdGhlIHNlbGVjdGVkIHJvd3MuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29weVJvd3NUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb3B5IHJvd3MgaW5zdGVhZCBvZiByYW5nZXMgd2hlbiBhIHJhbmdlIHdpdGggb25seSBhIHNpbmdsZSBjZWxsIGlzIHNlbGVjdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlTaW5nbGVDZWxsUmFuZ2VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHdvcmsgYXJvdW5kIGEgYnVnIHdpdGggRXhjZWwgKFdpbmRvd3MpIHRoYXQgYWRkcyBhbiBleHRyYSBlbXB0eSBsaW5lIGF0IHRoZSBlbmQgb2YgcmFuZ2VzIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xhc3RFbXB0eUxpbmVPblBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb2ZmIHBhc3RlIG9wZXJhdGlvbnMgd2l0aGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdG9wIHRoZSBncmlkIHRyeWluZyB0byB1c2UgdGhlIENsaXBib2FyZCBBUEksIGlmIGl0IGlzIGJsb2NrZWQsIGFuZCBpbW1lZGlhdGVseSBmYWxsYmFjayB0byB0aGUgd29ya2Fyb3VuZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkQXBpOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBvZiBDb2x1bW4gLyBDb2x1bW4gR3JvdXAgZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5EZWZzOiAoQ29sRGVmPFREYXRhPiB8IENvbEdyb3VwRGVmPFREYXRhPilbXSB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvbi4gSXRlbXMgZGVmaW5lZCBpbiB0aGUgYWN0dWFsIGNvbHVtbiBkZWZpbml0aW9ucyBnZXQgcHJlY2VkZW5jZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xEZWY6IENvbERlZjxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbi4gQWxsIGNvbHVtbiBncm91cCBkZWZpbml0aW9ucyB3aWxsIHVzZSB0aGVzZSBwcm9wZXJ0aWVzLiBJdGVtcyBkZWZpbmVkIGluIHRoZSBhY3R1YWwgY29sdW1uIGdyb3VwIGRlZmluaXRpb24gZ2V0IHByZWNlZGVuY2UuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sR3JvdXBEZWY6IFBhcnRpYWw8Q29sR3JvdXBEZWY8VERhdGE+PiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQW4gb2JqZWN0IG1hcCBvZiBjdXN0b20gY29sdW1uIHR5cGVzIHdoaWNoIGNvbnRhaW4gZ3JvdXBzIG9mIHByb3BlcnRpZXMgdGhhdCBjb2x1bW4gZGVmaW5pdGlvbnMgY2FuIGluaGVyaXQgYnkgcmVmZXJlbmNpbmcgaW4gdGhlaXIgYHR5cGVgIHByb3BlcnR5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uVHlwZXM6IHsgW2tleTogc3RyaW5nXTogQ29sRGVmPFREYXRhPjsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogS2VlcHMgdGhlIG9yZGVyIG9mIENvbHVtbnMgbWFpbnRhaW5lZCBhZnRlciBuZXcgQ29sdW1uIERlZmluaXRpb25zIGFyZSB1cGRhdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYWludGFpbkNvbHVtbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZW4gZG90cyBpbiBmaWVsZCBuYW1lcyAoZS5nLiBgJ2FkZHJlc3MuZmlyc3RMaW5lJ2ApIGFyZSBub3QgdHJlYXRlZCBhcyBkZWVwIHJlZmVyZW5jZXMuIEFsbG93cyB5b3UgdG8gdXNlIGRvdHMgaW4geW91ciBmaWVsZCBuYW1lIGlmIHlvdSBwcmVmZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhQ29sdW1uTW9kZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFwcGx5Q29sdW1uRGVmT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbW11dGFibGVDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTZXRDb2x1bW5TdGF0ZUV2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uU3RhdGVFdmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFNldCB2aWEgYGRlZmF1bHRDb2xEZWYud2lkdGhgXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFNldCB2aWEgYGRlZmF1bHRDb2xEZWYubWluV2lkdGhgXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1pbkNvbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFNldCB2aWEgYGRlZmF1bHRDb2xEZWYubWF4V2lkdGhgXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heENvbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGNvbHVtbiBsYWJlbCBoZWFkZXIuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgdGhlIHRoZW1lIHZhbHVlIG9mIGBoZWFkZXItaGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvd3MgY29udGFpbmluZyBoZWFkZXIgY29sdW1uIGdyb3Vwcy4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyBgaGVhZGVySGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGZsb2F0aW5nIGZpbHRlcnMuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgdGhlIHRoZW1lIHZhbHVlIG9mIGBoZWFkZXItaGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBjb2x1bW5zIHdoZW4gaW4gcGl2b3QgbW9kZS4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyBgaGVhZGVySGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90SGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgaGVhZGVyIGNvbHVtbiBncm91cHMgd2hlbiBpbiBwaXZvdCBtb2RlLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBncm91cEhlYWRlckhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEdyb3VwSGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93IHJlb3JkZXJpbmcgYW5kIHBpbm5pbmcgY29sdW1ucyBieSBkcmFnZ2luZyBjb2x1bW5zIGZyb20gdGhlIENvbHVtbnMgVG9vbCBQYW5lbCB0byB0aGUgZ3JpZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3MgY29sdW1uIG1vdmluZywgaS5lLiB0byBtYWtlIHRoZSBjb2x1bW5zIGZpeGVkIHBvc2l0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGVDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZSBgYWctY29sdW1uLW1vdmluZ2AgY2xhc3MgaXMgbm90IGFkZGVkIHRvIHRoZSBncmlkIHdoaWxlIGNvbHVtbnMgYXJlIG1vdmluZy4gSW4gdGhlIGRlZmF1bHQgdGhlbWVzLCB0aGlzIHJlc3VsdHMgaW4gbm8gYW5pbWF0aW9uIHdoZW4gbW92aW5nIGNvbHVtbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uTW92ZUFuaW1hdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB3aGVuIHlvdSBkcmFnIGEgY29sdW1uIG91dCBvZiB0aGUgZ3JpZCAoZS5nLiB0byB0aGUgZ3JvdXAgem9uZSkgdGhlIGNvbHVtbiBpcyBub3QgaGlkZGVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB3aGVuIHlvdSBkcmFnIGEgY29sdW1uIGludG8gYSByb3cgZ3JvdXAgcGFuZWwgdGhlIGNvbHVtbiBpcyBub3QgaGlkZGVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0dyb3VwSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdzaGlmdCdgIHRvIGhhdmUgc2hpZnQtcmVzaXplIGFzIHRoZSBkZWZhdWx0IHJlc2l6ZSBvcGVyYXRpb24gKHNhbWUgYXMgdXNlciBob2xkaW5nIGRvd24gYFNoaWZ0YCB3aGlsZSByZXNpemluZykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xSZXNpemVEZWZhdWx0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFN1cHByZXNzZXMgYXV0by1zaXppbmcgY29sdW1ucyBmb3IgY29sdW1ucy4gSW4gb3RoZXIgd29yZHMsIGRvdWJsZSBjbGlja2luZyBhIGNvbHVtbidzIGhlYWRlcidzIGVkZ2Ugd2lsbCBub3QgYXV0by1zaXplLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBOdW1iZXIgb2YgcGl4ZWxzIHRvIGFkZCB0byBhIGNvbHVtbiB3aWR0aCBhZnRlciB0aGUgW2F1dG8tc2l6aW5nXSgvY29sdW1uLXNpemluZy8jYXV0by1zaXplLWNvbHVtbnMpIGNhbGN1bGF0aW9uLlxuICAgICAqIFNldCB0aGlzIGlmIHlvdSB3YW50IHRvIGFkZCBleHRyYSByb29tIHRvIGFjY29tbW9kYXRlIChmb3IgZXhhbXBsZSkgc29ydCBpY29ucywgb3Igc29tZSBvdGhlciBkeW5hbWljIG5hdHVyZSBvZiB0aGUgaGVhZGVyLlxuICAgICAqIERlZmF1bHQ6IGA0YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVQYWRkaW5nOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBza2lwIHRoZSBgaGVhZGVyTmFtZWAgd2hlbiBgYXV0b1NpemVgIGlzIGNhbGxlZCBieSBkZWZhdWx0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2YgY29tcG9uZW50IG5hbWVzIHRvIGNvbXBvbmVudHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb21wb25lbnRzOiB7IFtwOiBzdHJpbmddOiBhbnk7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBjb21wb25lbnRzYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmcmFtZXdvcmtDb21wb25lbnRzOiB7IFtwOiBzdHJpbmddOiB7IG5ldygpOiBhbnk7IH07IH0gfCBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ2Z1bGxSb3cnYCB0byBlbmFibGUgRnVsbCBSb3cgRWRpdGluZy4gT3RoZXJ3aXNlIGxlYXZlIGJsYW5rIHRvIGVkaXQgb25lIGNlbGwgYXQgYSB0aW1lLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgU2luZ2xlIENsaWNrIEVkaXRpbmcgZm9yIGNlbGxzLCB0byBzdGFydCBlZGl0aW5nIHdpdGggYSBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IG5laXRoZXIgc2luZ2xlIG5vciBkb3VibGUgY2xpY2sgc3RhcnRzIGVkaXRpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHN0b3AgdGhlIGdyaWQgdXBkYXRpbmcgZGF0YSBhZnRlciBhbmQgZWRpdC4gV2hlbiB0aGlzIGlzIHNldCwgaXQgaXMgaW50ZW5kZWQgdGhlIGFwcGxpY2F0aW9uIHdpbGwgdXBkYXRlIHRoZSBkYXRhLCBlZyBpbiBhbiBleHRlcm5hbCBpbW11dGFibGUgc3RvcmUsIGFuZCB0aGVuIHBhc3MgdGhlIG5ldyBkYXRhc2V0IHRvIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVhZE9ubHlFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc3RvcCBjZWxsIGVkaXRpbmcgd2hlbiBncmlkIGxvc2VzIGZvY3VzLlxuICAgICAqIFRoZSBkZWZhdWx0IGlzIHRoYXQgdGhlIGdyaWQgc3RheXMgZWRpdGluZyB1bnRpbCBmb2N1cyBnb2VzIG9udG8gYW5vdGhlciBjZWxsLiBGb3IgaW5saW5lIChub24tcG9wdXApIGVkaXRvcnMgb25seS5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck1vdmVzRG93bkFmdGVyRWRpdGAgdG8gaGF2ZSBFeGNlbC1zdHlsZSBiZWhhdmlvdXIgZm9yIHRoZSBgRW50ZXJgIGtleS5cbiAgICAgKiBpLmUuIHByZXNzaW5nIHRoZSBgRW50ZXJgIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGFsb25nIHdpdGggYGVudGVyTW92ZXNEb3duYCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlICdFbnRlcicga2V5LlxuICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIEVudGVyIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBVbmRvIC8gUmVkbyB3aGlsZSBlZGl0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBzaXplIG9mIHRoZSB1bmRvIC8gcmVkbyBzdGFjay4gRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZ0xpbWl0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1cyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0b3BFZGl0aW5nV2hlbkdyaWRMb3Nlc0ZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gQ1NWLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENzdkV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBDU1YuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gRXhjZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXM6IEV4Y2VsRXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBFeGNlbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBsaXN0IChhcnJheSkgb2YgRXhjZWwgc3R5bGVzIHRvIGJlIHVzZWQgd2hlbiBleHBvcnRpbmcgdG8gRXhjZWwgd2l0aCBzdHlsZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogRXhjZWxTdHlsZVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgZGVmYXVsdENzdkV4cG9ydFBhcmFtcyBvciBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXNcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgRXhjZWxFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJvd3MgYXJlIGZpbHRlcmVkIHVzaW5nIHRoaXMgdGV4dCBhcyBhIHF1aWNrIGZpbHRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIHF1aWNrIGZpbHRlciBjYWNoZSwgdXNlZCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIHdoZW4gdXNpbmcgdGhlIHF1aWNrIGZpbHRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVRdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCB0cmVlIGRhdGEgZmlsdGVyaW5nIGJlaGF2aW91ciB0byBpbnN0ZWFkIGV4Y2x1ZGUgY2hpbGQgbm9kZXMgZnJvbSBmaWx0ZXIgcmVzdWx0cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIEVuYWJsZSBDaGFydHMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGxpc3Qgb2YgY2hhcnQgdGhlbWVzIHRvIGJlIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lczogc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIGNvbnRhaW5pbmcgY3VzdG9tIGNoYXJ0IHRoZW1lcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGN1c3RvbUNoYXJ0VGhlbWVzOiB7IFtuYW1lOiBzdHJpbmddOiBBZ0NoYXJ0VGhlbWUgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhcnQgdGhlbWUgb3ZlcnJpZGVzIGFwcGxpZWQgdG8gYWxsIHRoZW1lcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVPdmVycmlkZXM6IEFnQ2hhcnRUaGVtZU92ZXJyaWRlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gdXNlIHdoZW4gZGF0YSBpcyBsb2FkaW5nIHZpYSBhIERhdGFTb3VyY2UuXG4gICAgICogU2VlIFtMb2FkaW5nIENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1sb2FkaW5nLWNlbGwtcmVuZGVyZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gYmUgdXNlZCB3aGVuIGRhdGEgaXMgbG9hZGluZyB2aWEgYSBEYXRhU291cmNlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yOiBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2Yga2V5LT52YWx1ZSBwYWlycyBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hc3RlciBEZXRhaWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1hc3RlckRldGFpbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBrZWVwIGRldGFpbCByb3dzIGZvciB3aGVuIHRoZXkgYXJlIGRpc3BsYXllZCBhZ2Fpbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIG51bWJlciBvZiBkZXRhaWxzIHJvd3MgdG8ga2VlcC4gRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3NDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGBkZXRhaWxDZWxsUmVuZGVyZXJgIHRvIHVzZSB3aGVuIGEgbWFzdGVyIHJvdyBpcyBleHBhbmRlZC5cbiAgICAgKiBTZWUgW0RldGFpbCBDZWxsIFJlbmRlcmVyXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9tYXN0ZXItZGV0YWlsLWN1c3RvbS1kZXRhaWwvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGRldGFpbENlbGxSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgcGFyYW1zIHRvIGJlIHVzZWQgYnkgdGhlIERldGFpbCBDZWxsIFJlbmRlcmVyLiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgcHJvdmlkZXMgdGhlIHBhcmFtcyB0byBlbmFibGUgZHluYW1pYyBkZWZpbml0aW9ucyBvZiB0aGUgcGFyYW1zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCBmaXhlZCBoZWlnaHQgaW4gcGl4ZWxzIGZvciBlYWNoIGRldGFpbCByb3cuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSBkZXRhaWwgZ3JpZCBkeW5hbWljYWxseSBjaGFuZ2UgaXQncyBoZWlnaHQgdG8gZml0IGl0J3Mgcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8ga2VlcCBvcGVuIEdyb3VwIFJvd3MgdmlzaWJsZSBhdCB0aGUgdG9wIG9mIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dzU3RpY2t5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlcyBhIGNvbnRleHQgb2JqZWN0IHRoYXQgaXMgcHJvdmlkZWQgdG8gZGlmZmVyZW50IGNhbGxiYWNrcyB0aGUgZ3JpZCB1c2VzLiBVc2VkIGZvciBwYXNzaW5nIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gdG8gdGhlIGNhbGxiYWNrcyBieSB5b3VyIGFwcGxpY2F0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29udGV4dDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGxpc3Qgb2YgZ3JpZHMgdG8gdHJlYXQgYXMgQWxpZ25lZCBHcmlkcy4gSWYgZ3JpZHMgYXJlIGFsaWduZWQgdGhlbiB0aGUgY29sdW1ucyBhbmQgaG9yaXpvbnRhbCBzY3JvbGxpbmcgd2lsbCBiZSBrZXB0IGluIHN5bmMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGlnbmVkR3JpZHM6IHsgYXBpPzogR3JpZEFwaSB8IG51bGwsIGNvbHVtbkFwaT86IENvbHVtbkFwaSB8IG51bGwgfVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFuZ2UgdGhpcyB2YWx1ZSB0byBzZXQgdGhlIHRhYkluZGV4IG9yZGVyIG9mIHRoZSBHcmlkIHdpdGhpbiB5b3VyIGFwcGxpY2F0aW9uLiBEZWZhdWx0OiBgMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYkluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBudW1iZXIgb2Ygcm93cyByZW5kZXJlZCBvdXRzaWRlIHRoZSB2aWV3YWJsZSBhcmVhIHRoZSBncmlkIHJlbmRlcnMuXG4gICAgICogSGF2aW5nIGEgYnVmZmVyIG1lYW5zIHRoZSBncmlkIHdpbGwgaGF2ZSByb3dzIHJlYWR5IHRvIHNob3cgYXMgdGhlIHVzZXIgc2xvd2x5IHNjcm9sbHMgdmVydGljYWxseS5cbiAgICAgKiBEZWZhdWx0OiBgMTBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dCdWZmZXI6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB0dXJuIG9uIHRoZSB2YWx1ZSBjYWNoZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb25maWd1cmUgdGhlIHZhbHVlIGNhY2hlIHRvIG5vdCBleHBpcmUgYWZ0ZXIgZGF0YSB1cGRhdGVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IGNlbGwgZXhwcmVzc2lvbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFeHByZXNzaW9uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCByb3cgbm9kZXMgZG8gbm90IGhhdmUgdGhlaXIgcGFyZW50cyBzZXQuXG4gICAgICogVGhlIGdyaWQgZG9lc24ndCB1c2UgdGhlIHBhcmVudCByZWZlcmVuY2UsIGJ1dCBpdCBpcyBpbmNsdWRlZCB0byBoZWxwIHRoZSBjbGllbnQgY29kZSBuYXZpZ2F0ZSB0aGUgbm9kZSB0cmVlIGlmIGl0IHdhbnRzIGJ5IHByb3ZpZGluZyBiaS1kaXJlY3Rpb24gbmF2aWdhdGlvbiB1cCBhbmQgZG93biB0aGUgdHJlZS5cbiAgICAgKiBJZiB0aGlzIGlzIGEgcHJvYmxlbSAoZS5nLiBpZiB5b3UgbmVlZCB0byBjb252ZXJ0IHRoZSB0cmVlIHRvIEpTT04sIHdoaWNoIGRvZXMgbm90IGFsbG93IGN5Y2xpYyBkZXBlbmRlbmNpZXMpIHRoZW4gc2V0IHRoaXMgdG8gYHRydWVgLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFyZW50c0luUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRvdWNoIHN1cHBvcnQgKGJ1dCBkb2VzIG5vdCByZW1vdmUgdGhlIGJyb3dzZXIncyBlZmZvcnRzIHRvIHNpbXVsYXRlIG1vdXNlIGV2ZW50cyBvbiB0b3VjaCkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IHNldCBmb2N1cyBiYWNrIG9uIHRoZSBncmlkIGFmdGVyIGEgcmVmcmVzaC4gVGhpcyBjYW4gYXZvaWQgaXNzdWVzIHdoZXJlIHlvdSB3YW50IHRvIGtlZXAgdGhlIGZvY3VzIG9uIGFub3RoZXIgcGFydCBvZiB0aGUgYnJvd3Nlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlIGFzeW5jaHJvbm91cyBuYXR1cmUgb2YgdGhlIGV2ZW50cyBpbnRyb2R1Y2VkIGluIHYxMCwgYW5kIG1ha2VzIHRoZW0gc3luY2hyb25vdXMuIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgZm9yIHRoZSBwdXJwb3NlIG9mIHN1cHBvcnRpbmcgbGVnYWN5IGNvZGUgd2hpY2ggaGFzIGEgZGVwZW5kZW5jeSBvbiBzeW5jaHJvbm91cyBldmVudHMgZnJvbSBlYXJsaWVyIHZlcnNpb25zICh2OSBvciBlYXJsaWVyKSBvZiBBRyBHcmlkLiAgICAgKipJdCBpcyBzdHJvbmdseSByZWNvbW1lbmRlZCB0aGF0IHlvdSBkbyBub3QgY2hhbmdlIHRoaXMgcHJvcGVydHkgdW5sZXNzIHlvdSBoYXZlIGxlZ2FjeSBpc3N1ZXMuKiogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBc3luY0V2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGdyaWQgd2lsbCBjaGVjayBmb3IgYFJlc2l6ZU9ic2VydmVyYCBhbmQgdXNlIGl0IGlmIGl0IGV4aXN0cyBpbiB0aGUgYnJvd3Nlciwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlIHRoZSBncmlkJ3MgYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb24uIFNvbWUgdXNlcnMgcmVwb3J0ZWQgaXNzdWVzIHdpdGggQ2hyb21lJ3MgYFJlc2l6ZU9ic2VydmVyYC4gVXNlIHRoaXMgcHJvcGVydHkgdG8gYWx3YXlzIHVzZSB0aGUgZ3JpZCdzIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9uIHNob3VsZCBzdWNoIHByb2JsZW1zIGV4aXN0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgc2hvd2luZyBhIHdhcm5pbmcgbWVzc2FnZSBpbiB0aGUgY29uc29sZSBpZiB1c2luZyBhIGBncmlkT3B0aW9uc2Agb3IgYGNvbERlZmAgcHJvcGVydHkgdGhhdCBkb2Vzbid0IGV4aXN0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Byb3BlcnR5TmFtZXNDaGVjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgY2hhbmdlIGRldGVjdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBlbmFibGUgZGVidWcgaW5mb3JtYXRpb24gZnJvbSB0aGUgZ3JpZCBhbmQgcmVsYXRlZCBjb21wb25lbnRzLiBXaWxsIHJlc3VsdCBpbiBhZGRpdGlvbmFsIGxvZ2dpbmcgYmVpbmcgb3V0cHV0LCBidXQgdmVyeSB1c2VmdWwgd2hlbiBpbnZlc3RpZ2F0aW5nIHByb2JsZW1zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJ1ZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIHRlbXBsYXRlIGZvciAnbG9hZGluZycgb3ZlcmxheS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlMb2FkaW5nVGVtcGxhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAqIFNlZSBbTG9hZGluZyBPdmVybGF5IENvbXBvbmVudF0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LW92ZXJsYXkvI3NpbXBsZS1sb2FkaW5nLW92ZXJsYXktY29tcG9uZW50KSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgbG9hZGluZ092ZXJsYXlDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50RnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgbG9hZGluZyBvdmVybGF5IGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSAnbG9hZGluZycgb3ZlcmxheS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIHRlbXBsYXRlIGZvciAnbm8gcm93cycgb3ZlcmxheS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlOb1Jvd3NUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIG5vIHJvd3Mgb3ZlcmxheSBjb21wb25lbnQuXG4gICAgICogU2VlIFtObyBSb3dzIE92ZXJsYXkgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtb3ZlcmxheS8jc2ltcGxlLW5vLXJvd3Mtb3ZlcmxheS1jb21wb25lbnQpIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYG5vUm93c092ZXJsYXlDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBubyByb3dzIG92ZXJsYXkgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgJ25vIHJvd3MnIG92ZXJsYXkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHdoZXRoZXIgcGFnaW5hdGlvbiBpcyBlbmFibGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByb3dzIHRvIGxvYWQgcGVyIHBhZ2UuIElmIGBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplYCBpcyBzcGVjaWZpZWQsIHRoaXMgcHJvcGVydHkgaXMgaWdub3JlZC4gRGVmYXVsdDogYDEwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIG51bWJlciBvZiByb3dzIHRvIGxvYWQgcGVyIHBhZ2UgaXMgYXV0b21hdGljYWxseSBhZGp1c3RlZCBieSB0aGUgZ3JpZCBzbyBlYWNoIHBhZ2Ugc2hvd3MgZW5vdWdoIHJvd3MgdG8ganVzdCBmaWxsIHRoZSBhcmVhIGRlc2lnbmF0ZWQgZm9yIHRoZSBncmlkLiBJZiBgZmFsc2VgLCBgcGFnaW5hdGlvblBhZ2VTaXplYCBpcyB1c2VkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgcGFnZXMgc3BsaXQgY2hpbGRyZW4gb2YgZ3JvdXBzIHdoZW4gdXNpbmcgUm93IEdyb3VwaW5nIG9yIGRldGFpbCByb3dzIHdpdGggTWFzdGVyIERldGFpbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGRlZmF1bHQgZ3JpZCBjb250cm9scyBmb3IgbmF2aWdhdGlvbiBhcmUgaGlkZGVuLlxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGlmIGBwYWdpbmF0aW9uPXRydWVgIGFuZCB5b3Ugd2FudCB0byBwcm92aWRlIHlvdXIgb3duIHBhZ2luYXRpb24gY29udHJvbHMuXG4gICAgICogT3RoZXJ3aXNlLCB3aGVuIGBwYWdpbmF0aW9uPXRydWVgIHRoZSBncmlkIGF1dG9tYXRpY2FsbHkgc2hvd3MgdGhlIG5lY2Vzc2FyeSBjb250cm9scyBhdCB0aGUgYm90dG9tIHNvIHRoYXQgdGhlIHVzZXIgY2FuIG5hdmlnYXRlIHRocm91Z2ggdGhlIGRpZmZlcmVudCBwYWdlcy5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgcGl2b3QgbW9kZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RNb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdwaXZvdCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gcGl2b3QpIGF0IHRoZSB0b3AuIE5vdGUgdGhhdCB0aGUgcGl2b3QgcGFuZWwgd2lsbCBuZXZlciBzaG93IGlmIGBwaXZvdE1vZGVgIGlzIG9mZi4gRGVmYXVsdDogYG5ldmVyYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RQYW5lbFNob3c6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBzZXQgYW5kIHRoZSBncmlkIGlzIGluIHBpdm90IG1vZGUsIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCB0b3RhbHMgd2lsbCBhcHBlYXIgd2l0aGluIHRoZSBQaXZvdCBDb2x1bW4gR3JvdXBzLCBpbiB0aGUgcG9zaXRpb24gc3BlY2lmaWVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFsczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciBmb3IgZWFjaCB2YWx1ZSBjb2x1bW4gaW4gdGhlIHBvc2l0aW9uIHNwZWNpZmllZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Um93VG90YWxzOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3Qgc3dhcCBpbiB0aGUgZ3JvdXBpbmcgY29sdW1uIHdoZW4gcGl2b3RpbmcuIFVzZWZ1bCBpZiBwaXZvdGluZyB1c2luZyBTZXJ2ZXIgU2lkZSBSb3cgTW9kZWwgb3IgVmlld3BvcnQgUm93IE1vZGVsIGFuZCB5b3Ugd2FudCBmdWxsIGNvbnRyb2wgb2YgYWxsIGNvbHVtbnMgaW5jbHVkaW5nIHRoZSBncm91cCBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHBpdm90IGNvbHVtbiBncm91cHMgd2lsbCBhcHBlYXIgJ2ZpeGVkJywgd2l0aG91dCB0aGUgYWJpbGl0eSB0byBleHBhbmQgYW5kIGNvbGxhcHNlIHRoZSBjb2x1bW4gZ3JvdXBzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGVuIHJvdyBncm91cCwgcGl2b3QgYW5kIHZhbHVlIGFnZ3JlZ2F0aW9uIHdpbGwgYmUgcmVhZC1vbmx5IGZyb20gdGhlIEdVSS4gVGhlIGdyaWQgd2lsbCBkaXNwbGF5IHdoYXQgdmFsdWVzIGFyZSB1c2VkIGZvciBlYWNoLCBidXQgd2lsbCBub3QgYWxsb3cgdGhlIHVzZXIgdG8gY2hhbmdlIHRoZSBzZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiAnZnVuY3Rpb24gbmFtZScgdG8gJ2Z1bmN0aW9uJyBmb3IgY3VzdG9tIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmNzOiB7IFtrZXk6IHN0cmluZ106IElBZ2dGdW5jPFREYXRhPjsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIGNvbHVtbiBoZWFkZXJzIHdvbid0IGluY2x1ZGUgdGhlIGBhZ2dGdW5jYCBuYW1lLCBlLmcuIGAnc3VtKEJhbmsgQmFsYW5jZSlgJyB3aWxsIGp1c3QgYmUgYCdCYW5rIEJhbGFuY2UnYC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGdW5jSW5IZWFkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgYWdncmVnYXRpb25zIHdvbid0IGJlIGNvbXB1dGVkIGZvciB0aGUgcm9vdCBub2RlIG9mIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0F0Um9vdExldmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGNoYW5nZSBkZXRlY3Rpb24sIG9ubHkgdGhlIHVwZGF0ZWQgY29sdW1uIHdpbGwgYmUgcmUtYWdncmVnYXRlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdncmVnYXRlT25seUNoYW5nZWRDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgYWdncmVnYXRpb25zIGFyZSBub3QgaW1wYWN0ZWQgYnkgZmlsdGVyaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0ZpbHRlcmVkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvbWl0IHRoZSB2YWx1ZSBDb2x1bW4gaGVhZGVyIHdoZW4gdGhlcmUgaXMgb25seSBhIHNpbmdsZSB2YWx1ZSBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlbW92ZVBpdm90SGVhZGVyUm93V2hlblNpbmdsZVZhbHVlQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBSb3cgQW5pbWF0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmltYXRlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIGZsYXNoIGFmdGVyIGRhdGEgY2hhbmdlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGVuYWJsZUNlbGxDaGFuZ2VGbGFzaGAsIHRoaXMgY29uZmlndXJhdGlvbiB3aWxsIHNldCB0aGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIG9mIGhvdyBsb25nIGEgY2VsbCBzaG91bGQgcmVtYWluIGluIGl0cyBcImZsYXNoZWRcIiBzdGF0ZS5cbiAgICAgKiBEZWZhdWx0OiBgNTAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgLCB0aGlzIGNvbmZpZ3VyYXRpb24gd2lsbCBzZXQgdGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyB0aGUgXCJmbGFzaGVkXCIgc3RhdGUgYW5pbWF0aW9uIHRha2VzIHRvIGZhZGUgYXdheSBhZnRlciB0aGUgdGltZXIgc2V0IGJ5IGBjZWxsRmxhc2hEZWxheWAgaGFzIGNvbXBsZXRlZC5cbiAgICAgKiBEZWZhdWx0OiBgMTAwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGYWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3dpdGNoIGJldHdlZW4gbGF5b3V0IG9wdGlvbnM6IGBub3JtYWxgLCBgYXV0b0hlaWdodGAsIGBwcmludGAuXG4gICAgICogRGVmYXVsdDogYG5vcm1hbGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRvbUxheW91dDogJ25vcm1hbCcgfCAnYXV0b0hlaWdodCcgfCAncHJpbnQnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIG9yZGVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgaW4gdGhlIERPTSBhcmUgY29uc2lzdGVudCB3aXRoIHdoYXQgaXMgb24gc2NyZWVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnN1cmVEb21PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvcGVyYXRlIHRoZSBncmlkIGluIFJUTCAoUmlnaHQgdG8gTGVmdCkgbW9kZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUnRsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIGdyaWQgZG9lc24ndCB2aXJ0dWFsaXNlIHRoZSBjb2x1bW5zLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgMTAwIGNvbHVtbnMsIGJ1dCBvbmx5IDEwIHZpc2libGUgZHVlIHRvIHNjcm9sbGluZywgYWxsIDEwMCB3aWxsIGFsd2F5cyBiZSByZW5kZXJlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCB0aGUgZ3JpZCBoYXMgYSBsaW1pdCBvZiByZW5kZXJpbmcgYSBtYXhpbXVtIG9mIDUwMCByb3dzIGF0IG9uY2UgKHJlbWVtYmVyIHRoZSBncmlkIG9ubHkgcmVuZGVycyByb3dzIHlvdSBjYW4gc2VlLCBzbyB1bmxlc3MgeW91ciBkaXNwbGF5IHNob3dzIG1vcmUgdGhhbiA1MDAgcm93cyB3aXRob3V0IHZlcnRpY2FsbHkgc2Nyb2xsaW5nIHRoaXMgd2lsbCBuZXZlciBiZSBhbiBpc3N1ZSkuXG4gICAgICogPGJyIC8+KipUaGlzIGlzIG9ubHkgcmVsZXZhbnQgaWYgeW91IGFyZSBtYW51YWxseSBzZXR0aW5nIGByb3dCdWZmZXJgIHRvIGEgaGlnaCB2YWx1ZSAocmVuZGVyaW5nIG1vcmUgcm93cyB0aGFuIGNhbiBiZSBzZWVuKSBvciBpZiB5b3VyIGdyaWQgaGVpZ2h0IGlzIGFibGUgdG8gZGlzcGxheSBtb3JlIHRoYW4gNTAwIHJvd3MgYXQgb25jZS4qKlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBncmlkIGRvZXNuJ3QgdmlydHVhbGlzZSB0aGUgcm93cy4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIDEwMCByb3dzLCBidXQgb25seSAxMCB2aXNpYmxlIGR1ZSB0byBzY3JvbGxpbmcsIGFsbCAxMDAgd2lsbCBhbHdheXMgYmUgcmVuZGVyZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hbmFnZWQgUm93IERyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyByb3cgZHJhZ2dpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtb3Zpbmcgcm93cyB3aGlsZSBkcmFnZ2luZyB0aGUgYHJvd0RyYWdgIHdhZmZsZS4gVGhpcyBvcHRpb24gaGlnaGxpZ2h0cyB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIHJvdyB3aWxsIGJlIHBsYWNlZCBhbmQgaXQgd2lsbCBvbmx5IG1vdmUgdGhlIHJvdyBvbiBtb3VzZSB1cC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBjbGlja2luZyBhbmQgZHJhZ2dpbmcgYW55d2hlcmUgb24gdGhlIHJvdyB3aXRob3V0IHRoZSBuZWVkIGZvciBhIGRyYWcgaGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnRW50aXJlUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBkcmFnZ2luZyBtdWx0aXBsZSByb3dzIGF0IHRoZSBzYW1lIHRpbWUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNdWx0aVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBjZWxsIHJlbmRlcmVyIGNvbXBvbmVudCB0byB1c2UgZm9yIGZ1bGwgd2lkdGggcm93cy5cbiAgICAgKiBTZWUgW0Z1bGwgV2lkdGggUm93c10oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvZnVsbC13aWR0aC1yb3dzLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBmdWxsV2lkdGhDZWxsUmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIGBmdWxsV2lkdGhDZWxsUmVuZGVyZXJgIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGRldGFpbCBncmlkIGVtYmVkZGVkIGluIHRoZSBtYXN0ZXIgZ3JpZCdzIGNvbnRhaW5lciBhbmQgc28gbGluayB0aGVpciBob3Jpem9udGFsIHNjcm9sbGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlcHJlY2F0ZWRFbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyBob3cgdGhlIHJlc3VsdHMgb2Ygcm93IGdyb3VwaW5nIHNob3VsZCBiZSBkaXNwbGF5ZWQuXG4gICAgICogXG4gICAgICogICBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICogXG4gICAgICogLSBgJ3NpbmdsZUNvbHVtbidgOiBzaW5nbGUgZ3JvdXAgY29sdW1uIGF1dG9tYXRpY2FsbHkgYWRkZWQgYnkgdGhlIGdyaWQuXG4gICAgICogLSBgJ211bHRpcGxlQ29sdW1ucydgOiBhIGdyb3VwIGNvbHVtbiBwZXIgcm93IGdyb3VwIGlzIGFkZGVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICogLSBgJ2dyb3VwUm93cydgOiBncm91cCByb3dzIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIGluc3RlYWQgb2YgZ3JvdXAgY29sdW1ucy5cbiAgICAgKiAtIGAnY3VzdG9tJ2A6IGluZm9ybXMgdGhlIGdyaWQgdGhhdCBncm91cCBjb2x1bW5zIHdpbGwgYmUgcHJvdmlkZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERpc3BsYXlUeXBlOiBSb3dHcm91cGluZ0Rpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgc2V0IHRvIHRoZSBudW1iZXIgb2YgbGV2ZWxzIHRvIGV4cGFuZCBieSBkZWZhdWx0LCBlLmcuIGAwYCBmb3Igbm9uZSwgYDFgIGZvciBmaXJzdCBsZXZlbCBvbmx5LCBldGMuIFNldCB0byBgLTFgIHRvIGV4cGFuZCBldmVyeXRoaW5nLiBEZWZhdWx0OiBgMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGVmYXVsdEV4cGFuZGVkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzcGVjaWZ5aW5nIHRoZSBncm91cCAnYXV0byBjb2x1bW4nIGlmIHlvdSBhcmUgbm90IGhhcHB5IHdpdGggdGhlIGRlZmF1bHQuIElmIGdyb3VwaW5nLCB0aGlzIGNvbHVtbiBkZWZpbml0aW9uIGlzIGluY2x1ZGVkIGFzIHRoZSBmaXJzdCBjb2x1bW4gaW4gdGhlIGdyaWQuIElmIG5vdCBncm91cGluZywgdGhpcyBjb2x1bW4gaXMgbm90IGluY2x1ZGVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0dyb3VwQ29sdW1uRGVmOiBDb2xEZWY8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgcHJlc2VydmVzIHRoZSBjdXJyZW50IGdyb3VwIG9yZGVyIHdoZW4gc29ydGluZyBvbiBub24tZ3JvdXAgY29sdW1ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgaWYgeW91IHNlbGVjdCBhIGdyb3VwLCB0aGUgY2hpbGRyZW4gb2YgdGhlIGdyb3VwIHdpbGwgYWxzbyBiZSBzZWxlY3RlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBkZXRlcm1pbmUgd2hldGhlciBmaWx0ZXJzIHNob3VsZCBiZSBhcHBsaWVkIG9uIGFnZ3JlZ2F0ZWQgZ3JvdXAgdmFsdWVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEFnZ0ZpbHRlcmluZzogYm9vbGVhbiB8IElzUm93RmlsdGVyYWJsZTxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGdyb3VwaW5nLCB0aGlzIGNvbnRyb2xzIHdoZXRoZXIgdG8gc2hvdyBhIGdyb3VwIGZvb3RlciB3aGVuIHRoZSBncm91cCBpcyBleHBhbmRlZC5cbiAgICAgKiBJZiBgdHJ1ZWAsIHRoZW4gYnkgZGVmYXVsdCwgdGhlIGZvb3RlciB3aWxsIGNvbnRhaW4gYWdncmVnYXRlIGRhdGEgKGlmIGFueSkgd2hlbiBzaG93biBhbmQgdGhlIGhlYWRlciB3aWxsIGJlIGJsYW5rLlxuICAgICAqIFdoZW4gY2xvc2VkLCB0aGUgaGVhZGVyIHdpbGwgY29udGFpbiB0aGUgYWdncmVnYXRlIGRhdGEgcmVnYXJkbGVzcyBvZiB0aGlzIHNldHRpbmcgKGFzIHRoZSBmb290ZXIgaXMgaGlkZGVuIGFueXdheSkuXG4gICAgICogVGhpcyBpcyBoYW5keSBmb3IgJ3RvdGFsJyByb3dzLCB0aGF0IGFyZSBkaXNwbGF5ZWQgYmVsb3cgdGhlIGRhdGEgd2hlbiB0aGUgZ3JvdXAgaXMgb3BlbiwgYW5kIGFsb25nc2lkZSB0aGUgZ3JvdXAgd2hlbiBpdCBpcyBjbG9zZWQuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgYSAnZ3JhbmQgdG90YWwnIGdyb3VwIGZvb3RlciBhY3Jvc3MgYWxsIGdyb3Vwcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlVG90YWxGb290ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgYW5kIHNob3dpbmcgZm9vdGVyLCBhZ2dyZWdhdGUgZGF0YSB3aWxsIGFsd2F5cyBiZSBkaXNwbGF5ZWQgYXQgYm90aCB0aGUgaGVhZGVyIGFuZCBmb290ZXIgbGV2ZWxzLiBUaGlzIHN0b3BzIHRoZSBwb3NzaWJseSB1bmRlc2lyYWJsZSBiZWhhdmlvdXIgb2YgdGhlIGhlYWRlciBkZXRhaWxzICdqdW1waW5nJyB0byB0aGUgZm9vdGVyIG9uIGV4cGFuZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiB1c2luZyBgZ3JvdXBTZWxlY3RzQ2hpbGRyZW5gLCB0aGVuIG9ubHkgdGhlIGNoaWxkcmVuIHRoYXQgcGFzcyB0aGUgY3VycmVudCBmaWx0ZXIgd2lsbCBnZXQgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0ZpbHRlcmVkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG93cyB0aGUgb3BlbiBncm91cCBpbiB0aGUgZ3JvdXAgY29sdW1uIGZvciBub24tZ3JvdXAgcm93cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd09wZW5lZEdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGdyb3VwcyB0aGF0IG9ubHkgaGF2ZSBvbmUgY2hpbGQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGxvd2VzdCBsZXZlbCBncm91cHMgdGhhdCBvbmx5IGhhdmUgb25lIGNoaWxkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZGUgcGFyZW50cyB0aGF0IGFyZSBvcGVuLiBXaGVuIHVzZWQgd2l0aCBtdWx0aXBsZSBjb2x1bW5zIGZvciBzaG93aW5nIGdyb3VwcywgaXQgY2FuIGdpdmUgYSBtb3JlIHBsZWFzaW5nIHVzZXIgZXhwZXJpZW5jZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdG8gc2hvdyB0aGUgJ3JvdyBncm91cCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gZ3JvdXApIGF0IHRoZSB0b3AuIERlZmF1bHQ6IGBuZXZlcmAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTaG93OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIENlbGwgUmVuZGVyZXIgdG8gdXNlIHdoZW4gYGdyb3VwRGlzcGxheVR5cGUgPSAnZ3JvdXBSb3dzJ2AuXG4gICAgICogU2VlIFtHcm91cCBSb3cgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvZ3JvdXBpbmctZ3JvdXAtcm93cy8jcHJvdmlkaW5nLWNlbGwtcmVuZGVyZXIpIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGdyb3VwUm93UmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBgZ3JvdXBSb3dSZW5kZXJlcmAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCB3aGVuIGEgY29sdW1uIGlzIHVuLWdyb3VwZWQsIGkuZS4gdXNpbmcgdGhlIFJvdyBHcm91cCBQYW5lbCwgaXQgaXMgbWFkZSB2aXNpYmxlIGluIHRoZSBncmlkLiBUaGlzIHByb3BlcnR5IHN0b3BzIHRoZSBjb2x1bW4gYmVjb21pbmcgdmlzaWJsZSBhZ2FpbiB3aGVuIHVuLWdyb3VwaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01ha2VDb2x1bW5WaXNpYmxlQWZ0ZXJVbkdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgR3JpZCB0byB3b3JrIHdpdGggVHJlZSBEYXRhLiBZb3UgbXVzdCBhbHNvIGltcGxlbWVudCB0aGUgYGdldERhdGFQYXRoKGRhdGEpYCBjYWxsYmFjay4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIHRoaXMgaXMgbm93IGdyb3VwUm93UmVuZGVyZXJQYXJhbXMuaW5uZXJSZW5kZXJlclxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0lubmVyUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSB0aGlzIGlzIG5vdyBncm91cFJvd1JlbmRlcmVyUGFyYW1zLmlubmVyUmVuZGVyZXJcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dJbm5lclJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGdyb3VwRGlzcGxheVR5cGUgPSAnbXVsdGlwbGVDb2x1bW5zJyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTXVsdGlBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBncm91cERpc3BsYXlUeXBlID0gJ2dyb3VwUm93cycgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFVzZUVudGlyZVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZ3JvdXBEaXNwbGF5VHlwZSA9ICdjdXN0b20nIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gbm8gbG9uZ2VyIG5lZWRlZCwgdHJhbnNhY3Rpb24gdXBkYXRlcyBrZWVwIGdyb3VwIHN0YXRlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlbWVtYmVyR3JvdXBTdGF0ZVdoZW5OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEYXRhIHRvIGJlIGRpc3BsYXllZCBhcyBwaW5uZWQgdG9wIHJvd3MgaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRUb3BSb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIGJvdHRvbSByb3dzIGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkQm90dG9tUm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIHJvdyBtb2RlbCB0eXBlLiBEZWZhdWx0OiBgY2xpZW50U2lkZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd01vZGVsVHlwZTogUm93TW9kZWxUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhlIGRhdGEgdG8gYmUgZGlzcGxheWVkIGFzIHJvd3MgaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEYXRhOiBURGF0YVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgSW1tdXRhYmxlIERhdGEgaXMgb24gYnkgZGVmYXVsdCB3aGVuIGdyaWQgY2FsbGJhY2sgZ2V0Um93SWQoKSBpcyBpbXBsZW1lbnRlZFxuRW5hYmxlcyBJbW11dGFibGUgRGF0YSBtb2RlLCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIGltbXV0YWJsZSBzdG9yZXMuIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW1tdXRhYmxlRGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGV4ZWN1dGluZyBhIGJhdGNoIG9mIGFzeW5jIHRyYW5zYWN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25XYWl0TWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIFRyYW5zYWN0aW9ucyBjaGFuZ2luZyBzb3J0LCBmaWx0ZXIsIGdyb3VwIG9yIHBpdm90IHN0YXRlIHdoZW4gdHJhbnNhY3Rpb24gb25seSBjb250YWlucyB1cGRhdGVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vZGVsVXBkYXRlQWZ0ZXJVcGRhdGVUcmFuc2FjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhUm93RGF0YU1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHVzZSBhc3luY1RyYW5zYWN0aW9uV2FpdE1pbGxpcyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGJhdGNoVXBkYXRlV2FpdE1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBkYXRhc291cmNlIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRhc291cmNlOiBJRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAqIERlZmF1bHQ6IGAxYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVPdmVyZmxvd1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAqIERlZmF1bHQ6IGAxYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IGhvdyBtYW55IGxvYWRpbmcgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGZvciB0aGUgcm9vdCBsZXZlbCBncm91cC5cbiAgICAgKiBEZWZhdWx0OiBgMWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgV2hldGhlciB0byB1c2UgRnVsbCBTdG9yZSBvciBQYXJ0aWFsIFN0b3JlIGZvciBzdG9yaW5nIHJvd3MuIERlZmF1bHQ6IGBmdWxsYC5cbkRlcHJlY2F0ZWQgaW4gZmF2b3VyIG9mIHNlcnZlclNpZGVJbmZpbml0ZVNjcm9sbC4gV2hlbiB0cnVlLCBQYXJ0aWFsIFN0b3JlIGlzIHVzZWQuIFdoZW4gZmFsc2UsXG5GdWxsIFN0b3JlIGlzIHVzZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTdG9yZVR5cGU6IFNlcnZlclNpZGVTdG9yZVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB3aGV0aGVyIFNlcnZlci1zaWRlIFJvdyBNb2RlbCB3aWxsIHVzZSBJbmZpbml0ZSBTY3JvbGxpbmdcbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJvd3MgZm9yIGVhY2ggYmxvY2sgaW4gdGhlIHN0b3JlLCBpLmUuIGhvdyBtYW55IHJvd3MgcmV0dXJuZWQgZnJvbSB0aGUgc2VydmVyIGF0IGEgdGltZS5cbiAgICAgKiBEZWZhdWx0OiBgMTAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVCbG9ja1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgYmxvY2tzIHRvIGtlZXAgaW4gdGhlIHN0b3JlLiBEZWZhdWx0IGlzIG5vIGxpbWl0LCBzbyBldmVyeSByZXF1ZXN0ZWQgYmxvY2sgaXMga2VwdC4gVXNlIHRoaXMgaWYgeW91IGhhdmUgbWVtb3J5IGNvbmNlcm5zLCBhbmQgYmxvY2tzIHRoYXQgd2VyZSBsZWFzdCByZWNlbnRseSB2aWV3ZWQgd2lsbCBiZSBwdXJnZWQgd2hlbiB0aGUgbGltaXQgaXMgaGl0LiBUaGUgZ3JpZCB3aWxsIGFkZGl0aW9uYWxseSBtYWtlIHN1cmUgaXQgaGFzIGFsbCB0aGUgYmxvY2tzIG5lZWRlZCB0byBkaXNwbGF5IHdoYXQgaXMgY3VycmVudGx5IHZpc2libGUsIGluIGNhc2UgdGhpcyBwcm9wZXJ0eSBpcyBzZXQgdG8gYSBsb3cgdmFsdWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhCbG9ja3NJbkNhY2hlOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJlcXVlc3RzIHRvIGhpdCB0aGUgc2VydmVyIHdpdGggY29uY3VycmVudGx5LiBJZiB0aGUgbWF4IGlzIHJlYWNoZWQsIHJlcXVlc3RzIGFyZSBxdWV1ZWQuXG4gICAgICogU2V0IHRvIGAtMWAgZm9yIG5vIG1heGltdW0gcmVzdHJpY3Rpb24gb24gcmVxdWVzdHMuXG4gICAgICogRGVmYXVsdDogYDJgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb25jdXJyZW50RGF0YXNvdXJjZVJlcXVlc3RzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBsb2FkaW5nIGEgYmxvY2suIFVzZWZ1bCB3aGVuIGluZmluaXRlIHNjcm9sbGluZyBhbmQgc2Nyb2xsaW5nIG92ZXIgbWFueSBpbmZpbml0ZSBibG9ja3MsIGFzIGl0IHByZXZlbnRzIGJsb2NrcyBsb2FkaW5nIHVudGlsIHNjcm9sbGluZyBoYXMgc2V0dGxlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGJsb2NrTG9hZERlYm91bmNlTWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgY2xvc2luZyBncm91cCByb3dzIHdpbGwgcmVtb3ZlIGNoaWxkcmVuIG9mIHRoYXQgcm93LiBOZXh0IHRpbWUgdGhlIHJvdyBpcyBvcGVuZWQsIGNoaWxkIHJvd3Mgd2lsbCBiZSByZWFkIGZyb20gdGhlIGRhdGFzb3VyY2UgYWdhaW4uIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwdXJnZUNsb3NlZFJvd05vZGVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBgc2VydmVyU2lkZURhdGFzb3VyY2VgIGZvciBzZXJ2ZXIgc2lkZSByb3cgbW9kZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRGF0YXNvdXJjZTogSVNlcnZlclNpZGVEYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGFsd2F5cyByZWZyZXNoZXMgdG9wIGxldmVsIGdyb3VwcyByZWdhcmRsZXNzIG9mIHdoaWNoIGNvbHVtbiB3YXMgc29ydGVkLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZyAmIHNvcnRpbmcgaXMgaGFuZGxlZCBvbiB0aGUgc2VydmVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydEFsbExldmVsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBhbHdheXMgcmVmcmVzaGVzIHRvcCBsZXZlbCBncm91cHMgcmVnYXJkbGVzcyBvZiB3aGljaCBjb2x1bW4gd2FzIGZpbHRlcmVkLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZyAmIGZpbHRlcmluZyBpcyBoYW5kbGVkIG9uIHRoZSBzZXJ2ZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVGaWx0ZXJBbGxMZXZlbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgU29ydGluZyB3aWxsIGJlIGRvbmUgb24gdGhlIHNlcnZlciBzaWRlLiBXaGVuIHNlcnZlclNpZGVJbmZpbml0ZVNjcm9sbD10cnVlLCBkb2VzIG5vdGhpbmcsXG4gICAgICogYXMgU29ydGluZyBpcyBhbHdheXMgc2VydmVyIHNpZGUgd2hlbiBJbmZpbml0ZSBTY3JvbGwgaXMgYWN0aXZlLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0T25TZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgRmlsdGVyaW5nIHdpbGwgYmUgZG9uZSBvbiB0aGUgc2VydmVyIHNpZGUuIFdoZW4gc2VydmVyU2lkZUluZmluaXRlU2Nyb2xsPXRydWUsIGRvZXMgbm90aGluZyxcbiAgICAgKiBhcyBGaWx0ZXJpbmcgaXMgYWx3YXlzIHNlcnZlciBzaWRlIHdoZW4gSW5maW5pdGUgU2Nyb2xsIGlzIGFjdGl2ZS5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRmlsdGVyT25TZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFRoaXMgcHJvcGVydHkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIGBzZXJ2ZXJTaWRlU29ydEFsbExldmVsc2AgaW5zdGVhZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRpbmdBbHdheXNSZXNldHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFRoaXMgcHJvcGVydHkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIGBzZXJ2ZXJTaWRlRmlsdGVyQWxsTGV2ZWxzYCBpbnN0ZWFkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRmlsdGVyaW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFbnRlcnByaXNlUmVzZXRPbk5ld0NvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRvIHVzZSB0aGUgdmlld3BvcnQgcm93IG1vZGVsIHlvdSBuZWVkIHRvIHByb3ZpZGUgdGhlIGdyaWQgd2l0aCBhIGB2aWV3cG9ydERhdGFzb3VyY2VgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnREYXRhc291cmNlOiBJVmlld3BvcnREYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIHZpZXdwb3J0IHJvdyBtb2RlbCwgc2V0cyB0aGUgcGFnZSBzaXplIGZvciB0aGUgdmlld3BvcnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsUGFnZVNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyB2aWV3cG9ydCByb3cgbW9kZWwsIHNldHMgdGhlIGJ1ZmZlciBzaXplIGZvciB0aGUgdmlld3BvcnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsQnVmZmVyU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSBob3Jpem9udGFsIHNjcm9sbGJhci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIHNob3cgdGhlIHZlcnRpY2FsIHNjcm9sbGJhci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGRlYm91bmNlIHRoZSB2ZXJ0aWNhbCBzY3JvbGxiYXIuIENhbiBwcm92aWRlIHNtb290aGVyIHNjcm9sbGluZyBvbiBzbG93IG1hY2hpbmVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJvdW5jZVZlcnRpY2FsU2Nyb2xsYmFyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5ldmVyIHNob3cgdGhlIGhvcml6b250YWwgc2Nyb2xsLiBUaGlzIGlzIHVzZWZ1bCBpZiB0aGUgZ3JpZCBpcyBhbGlnbmVkIHdpdGggYW5vdGhlciBncmlkIGFuZCB3aWxsIHNjcm9sbCB3aGVuIHRoZSBvdGhlciBncmlkIHNjcm9sbHMuIChTaG91bGQgbm90IGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBgYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGxgLikgRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3Qgc2Nyb2xsIHRvIHRoZSB0b3Agd2hlbiBuZXcgcm93IGRhdGEgaXMgcHJvdmlkZWQuIFVzZSB0aGlzIGlmIHlvdSBkb24ndCB3YW50IHRoZSBkZWZhdWx0IGJlaGF2aW91ciBvZiBzY3JvbGxpbmcgdG8gdGhlIHRvcCBldmVyeSB0aW1lIHlvdSBsb2FkIG5ldyBkYXRhLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbE9uTmV3RGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IGFsbG93IG1vdXNld2hlZWwgLyB0b3VjaHBhZCBzY3JvbGwgd2hlbiBwb3B1cCBlbGVtZW50cyBhcmUgcHJlc2VudC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTY3JvbGxXaGVuUG9wdXBzQXJlT3BlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IHVzZSBhbmltYXRpb24gZnJhbWVzIHdoZW4gZHJhd2luZyByb3dzIHdoaWxlIHNjcm9sbGluZy4gVXNlIHRoaXMgaWYgdGhlIGdyaWQgaXMgd29ya2luZyBmYXN0IGVub3VnaCB0aGF0IHlvdSBkb24ndCBuZWVkIGFuaW1hdGlvbiBmcmFtZXMgYW5kIHlvdSBkb24ndCB3YW50IHRoZSBncmlkIHRvIGZsaWNrZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgbWlkZGxlIGNsaWNrcyB3aWxsIHJlc3VsdCBpbiBgY2xpY2tgIGV2ZW50cyBmb3IgY2VsbHMgYW5kIHJvd3MuIE90aGVyd2lzZSB0aGUgYnJvd3NlciB3aWxsIHVzZSBtaWRkbGUgY2xpY2sgdG8gc2Nyb2xsIHRoZSBncmlkLjxiciAvPioqTm90ZToqKiBOb3QgYWxsIGJyb3dzZXJzIGZpcmUgYGNsaWNrYCBldmVudHMgd2l0aCB0aGUgbWlkZGxlIGJ1dHRvbi4gTW9zdCB3aWxsIGZpcmUgb25seSBgbW91c2Vkb3duYCBhbmQgYG1vdXNldXBgIGV2ZW50cywgd2hpY2ggY2FuIGJlIHVzZWQgdG8gZm9jdXMgYSBjZWxsLCBidXQgd2lsbCBub3Qgd29yayB0byBjYWxsIHRoZSBgb25DZWxsQ2xpY2tlZGAgZnVuY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIG1vdXNlIHdoZWVsIGV2ZW50cyB3aWxsIGJlIHBhc3NlZCB0byB0aGUgYnJvd3Nlci4gVXNlZnVsIGlmIHlvdXIgZ3JpZCBoYXMgbm8gdmVydGljYWwgc2Nyb2xscyBhbmQgeW91IHdhbnQgdGhlIG1vdXNlIHRvIHNjcm9sbCB0aGUgYnJvd3NlciBwYWdlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUZWxsIHRoZSBncmlkIGhvdyB3aWRlIGluIHBpeGVscyB0aGUgc2Nyb2xsYmFyIGlzLCB3aGljaCBpcyB1c2VkIGluIGdyaWQgd2lkdGggY2FsY3VsYXRpb25zLiBTZXQgb25seSBpZiB1c2luZyBub24tc3RhbmRhcmQgYnJvd3Nlci1wcm92aWRlZCBzY3JvbGxiYXJzLCBzbyB0aGUgZ3JpZCBjYW4gdXNlIHRoZSBub24tc3RhbmRhcmQgc2l6ZSBpbiBpdHMgY2FsY3VsYXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2Nyb2xsYmFyV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVHlwZSBvZiBSb3cgU2VsZWN0aW9uOiBgc2luZ2xlYCwgYG11bHRpcGxlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1NlbGVjdGlvbjogJ3NpbmdsZScgfCAnbXVsdGlwbGUnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IG11bHRpcGxlIHJvd3MgdG8gYmUgc2VsZWN0ZWQgdXNpbmcgc2luZ2xlIGNsaWNrLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNdWx0aVNlbGVjdFdpdGhDbGljazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCByb3dzIHdpbGwgbm90IGJlIGRlc2VsZWN0ZWQgaWYgeW91IGhvbGQgZG93biBgQ3RybGAgYW5kIGNsaWNrIHRoZSByb3cgb3IgcHJlc3MgYFNwYWNlYC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCByb3cgc2VsZWN0aW9uIHdvbid0IGhhcHBlbiB3aGVuIHJvd3MgYXJlIGNsaWNrZWQuIFVzZSB3aGVuIHlvdSBvbmx5IHdhbnQgY2hlY2tib3ggc2VsZWN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBUaGlzIHByb3BlcnR5IGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBgc3VwcHJlc3NDZWxsRm9jdXNgIGluc3RlYWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbFNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBjZWxscyB3b24ndCBiZSBmb2N1c2FibGUuIFRoaXMgbWVhbnMga2V5Ym9hcmQgbmF2aWdhdGlvbiB3aWxsIGJlIGRpc2FibGVkIGZvciBncmlkIGNlbGxzLCBidXQgcmVtYWluIGVuYWJsZWQgaW4gb3RoZXIgZWxlbWVudHMgb2YgdGhlIGdyaWQgc3VjaCBhcyBjb2x1bW4gaGVhZGVycywgZmxvYXRpbmcgZmlsdGVycywgdG9vbCBwYW5lbHMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbEZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIG9ubHkgYSBzaW5nbGUgcmFuZ2UgY2FuIGJlIHNlbGVjdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYmUgYWJsZSB0byBzZWxlY3QgdGhlIHRleHQgd2l0aGluIGNlbGxzLlxuICAgICAqIFxuICAgICAqICAgICAqKk5vdGU6KiogV2hlbiB0aGlzIGlzIHNldCB0byBgdHJ1ZWAsIHRoZSBjbGlwYm9hcmQgc2VydmljZSBpcyBkaXNhYmxlZC5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgUmFuZ2UgU2VsZWN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIFJhbmdlIEhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBGaWxsIEhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlRmlsbEhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAneCdgIHRvIGZvcmNlIHRoZSBmaWxsIGhhbmRsZSBkaXJlY3Rpb24gdG8gaG9yaXpvbnRhbCwgb3Igc2V0IHRvIGAneSdgIHRvIGZvcmNlIHRoZSBmaWxsIGhhbmRsZSBkaXJlY3Rpb24gdG8gdmVydGljYWwuIERlZmF1bHQ6IGB4eWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbGxIYW5kbGVEaXJlY3Rpb246ICd4JyB8ICd5JyB8ICd4eScgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBwcmV2ZW50IGNlbGwgdmFsdWVzIGZyb20gYmVpbmcgY2xlYXJlZCB3aGVuIHRoZSBSYW5nZSBTZWxlY3Rpb24gaXMgcmVkdWNlZCBieSB0aGUgRmlsbCBIYW5kbGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xlYXJPbkZpbGxSZWR1Y3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IGRlZmluaW5nIHRoZSBvcmRlciBpbiB3aGljaCBzb3J0aW5nIG9jY3VycyAoaWYgc29ydGluZyBpcyBlbmFibGVkKS4gVmFsdWVzIGNhbiBiZSBgJ2FzYydgLCBgJ2Rlc2MnYCBvciBgbnVsbGAuIEZvciBleGFtcGxlOiBgc29ydGluZ09yZGVyOiBbJ2FzYycsICdkZXNjJ11gLiBEZWZhdWx0OiBgW251bGwsICdhc2MnLCAnZGVzYyddYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiAoJ2FzYycgfCAnZGVzYycgfCBudWxsKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNwZWNpZnkgdGhhdCB0aGUgc29ydCBzaG91bGQgdGFrZSBhY2NlbnRlZCBjaGFyYWN0ZXJzIGludG8gYWNjb3VudC4gSWYgdGhpcyBmZWF0dXJlIGlzIHR1cm5lZCBvbiB0aGUgc29ydCB3aWxsIGJlIHNsb3dlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlICdubyBzb3J0JyBpY29uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIG11bHRpLXNvcnQgd2hlbiB0aGUgdXNlciBzaGlmdC1jbGlja3MgYSBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgbXVsdGktc29ydCB3aGVuIHRoZSB1c2VyIGNsaWNrcyBhIGNvbHVtbiBoZWFkZXIsIHJlZ2FyZGxlc3Mgb2Yga2V5IHByZXNzZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnY3RybCdgIHRvIGhhdmUgbXVsdGkgc29ydGluZyB3b3JrIHVzaW5nIHRoZSBgQ3RybGAgKG9yIGBDb21tYW5kIOKMmGAgZm9yIE1hYykga2V5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbXVsdGlTb3J0S2V5OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydGluZyBvZiB1bi1zb3J0ZWQgZGF0YSB0byBtYXRjaCBvcmlnaW5hbCByb3cgZGF0YS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIHRvIHVzZSBpbnNpZGUgdGhlIGdyaWQgaW5zdGVhZCBvZiB0aGUgZ3JpZCdzIGRlZmF1bHQgaWNvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB8IHN0cmluZzsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGVmYXVsdCByb3cgaGVpZ2h0IGluIHBpeGVscy4gRGVmYXVsdDogYDI1YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93SGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBzdHlsZSBwcm9wZXJ0aWVzIHRvIGFwcGx5IHRvIGFsbCByb3dzLiBTZXQgdG8gYW4gb2JqZWN0IG9mIGtleSAoc3R5bGUgbmFtZXMpIGFuZCB2YWx1ZXMgKHN0eWxlIHZhbHVlcykgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlOiBSb3dTdHlsZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzKGVzKSBmb3IgYWxsIHJvd3MuIFByb3ZpZGUgZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSBvciBhcnJheSBvZiBzdHJpbmdzIChhcnJheSBvZiBjbGFzcyBuYW1lcykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJ1bGVzIHdoaWNoIGNhbiBiZSBhcHBsaWVkIHRvIGluY2x1ZGUgY2VydGFpbiBDU1MgY2xhc3Nlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXM6IFJvd0NsYXNzUnVsZXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBoaWdobGlnaHQgcm93cyBieSBhZGRpbmcgdGhlIGBhZy1yb3ctaG92ZXJgIENTUyBjbGFzcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVXNlcyBDU1MgYHRvcGAgaW5zdGVhZCBvZiBDU1MgYHRyYW5zZm9ybWAgZm9yIHBvc2l0aW9uaW5nIHJvd3MuIFVzZWZ1bCBpZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGlzIGNhdXNpbmcgaXNzdWVzIHN1Y2ggYXMgdXNlZCBpbiByb3cgc3Bhbm5pbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VHJhbnNmb3JtOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZ2hsaWdodCBjb2x1bW5zIGJ5IGFkZGluZyB0aGUgYGFnLWNvbHVtbi1ob3ZlcmAgQ1NTIGNsYXNzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YURpc3BsYXlUeXBlOiBUcmVlRGF0YURpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmd1bGFyQ29tcGlsZVJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlRmlsdGVyczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlR3JvdXBFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgY3VzdG9taXNpbmcgdGhlIGNvbnRleHQgbWVudS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENvbnRleHRNZW51SXRlbXM6IEdldENvbnRleHRNZW51SXRlbXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgY3VzdG9taXNpbmcgdGhlIG1haW4gJ2NvbHVtbiBoZWFkZXInIG1lbnUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRNYWluTWVudUl0ZW1zOiBHZXRNYWluTWVudUl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBwcm9jZXNzIHBvcHVwcyBhZnRlciB0aGV5IGFyZSBjcmVhdGVkLiBBcHBsaWNhdGlvbnMgY2FuIHVzZSB0aGlzIGlmIHRoZXkgd2FudCB0bywgZm9yIGV4YW1wbGUsIHJlcG9zaXRpb24gdGhlIHBvcHVwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFByb2Nlc3NQb3B1cDogKChwYXJhbXM6IFBvc3RQcm9jZXNzUG9wdXBQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGNlbGxzIGZvciB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBgRGF0ZWAgb2JqZWN0cyB0aGF0IG5lZWQgdG8gaGF2ZSBhIHBhcnRpY3VsYXIgZm9ybWF0IGlmIGltcG9ydGluZyBpbnRvIEV4Y2VsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBoZWFkZXIgdmFsdWVzIGZvciB0aGUgY2xpcGJvYXJkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgZ3JvdXAgaGVhZGVyIHZhbHVlcyBmb3IgdGhlIGNsaXBib2FyZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NHcm91cEhlYWRlckZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NHcm91cEhlYWRlckZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBjZWxscyBmcm9tIHRoZSBjbGlwYm9hcmQuIEhhbmR5IGlmIGZvciBleGFtcGxlIHlvdSBoYXZlIG51bWJlciBmaWVsZHMsIGFuZCB3YW50IHRvIGJsb2NrIG5vbi1udW1iZXJzIGZyb20gZ2V0dGluZyBpbnRvIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGcm9tQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIGdldCB0aGUgZGF0YSB0aGF0IHdvdWxkIG90aGVyd2lzZSBnbyB0byB0aGUgY2xpcGJvYXJkLiBUbyBiZSB1c2VkIHdoZW4geW91IHdhbnQgdG8gY29udHJvbCB0aGUgJ2NvcHkgdG8gY2xpcGJvYXJkJyBvcGVyYXRpb24geW91cnNlbGYuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZW5kVG9DbGlwYm9hcmQ6ICgocGFyYW1zOiBTZW5kVG9DbGlwYm9hcmRQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNvbXBsZXRlIGNvbnRyb2wgb2YgdGhlIHBhc3RlIG9wZXJhdGlvbiwgaW5jbHVkaW5nIGNhbmNlbGxpbmcgdGhlIG9wZXJhdGlvbiAoc28gbm90aGluZyBoYXBwZW5zKSBvciByZXBsYWNpbmcgdGhlIGRhdGEgd2l0aCBvdGhlciBkYXRhLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nW11bXSB8IG51bGwpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBHcmlkIGNhbGxzIHRoaXMgbWV0aG9kIHRvIGtub3cgaWYgYW4gZXh0ZXJuYWwgZmlsdGVyIGlzIHByZXNlbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0V4dGVybmFsRmlsdGVyUHJlc2VudDogKChwYXJhbXM6IElzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNob3VsZCByZXR1cm4gYHRydWVgIGlmIGV4dGVybmFsIGZpbHRlciBwYXNzZXMsIG90aGVyd2lzZSBgZmFsc2VgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG9lc0V4dGVybmFsRmlsdGVyUGFzczogKChub2RlOiBSb3dOb2RlPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgdG8gY3VzdG9taXNlIHRoZSBjaGFydCB0b29sYmFyIGl0ZW1zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hhcnRUb29sYmFySXRlbXM6IEdldENoYXJ0VG9vbGJhckl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBlbmFibGUgZGlzcGxheWluZyB0aGUgY2hhcnQgaW4gYW4gYWx0ZXJuYXRpdmUgY2hhcnQgY29udGFpbmVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3JlYXRlQ2hhcnRDb250YWluZXI6ICgocGFyYW1zOiBDaGFydFJlZlBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIG5hdmlnYXRpb24gKGFycm93KSBrZXkgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgSGVhZGVyIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRIZWFkZXI6ICgocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtczxURGF0YT4pID0+IChIZWFkZXJQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBgVGFiYCBrZXkgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgSGVhZGVyIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0SGVhZGVyOiAoKHBhcmFtczogVGFiVG9OZXh0SGVhZGVyUGFyYW1zPFREYXRhPikgPT4gKEhlYWRlclBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIG5hdmlnYXRpb24gKGFycm93KSBrZXkgd2hlbiBhIGNlbGwgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IENlbGwgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRDZWxsOiAoKHBhcmFtczogTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zPFREYXRhPikgPT4gKENlbGxQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBgVGFiYCBrZXkgd2hlbiBhIGNlbGwgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IENlbGwgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgbnVsbCB0byBzdGF5IG9uIGN1cnJlbnQgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dENlbGw6ICgocGFyYW1zOiBUYWJUb05leHRDZWxsUGFyYW1zPFREYXRhPikgPT4gKENlbGxQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBTZXQgdmlhIGBjb2xEZWYuc3VwcHJlc3NLZXlib2FyZEV2ZW50YC4gSWYgeW91IG5lZWQgdGhpcyB0byBiZSBzZXQgZm9yIGV2ZXJ5IGNvbHVtbiBzZXQgdmlhIHRoZSBgZGVmYXVsdENvbERlZi5zdXBwcmVzc0tleWJvYXJkRXZlbnRgIHByb3BlcnR5LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6ICgocGFyYW1zOiBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgYGdldExvY2FsZVRleHRgIGluc3RlYWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHRGdW5jOiAoKGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IHN0cmluZywgdmFyaWFibGVWYWx1ZXM/OiBzdHJpbmdbXSkgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldExvY2FsZVRleHQ6ICgocGFyYW1zOiBHZXRMb2NhbGVUZXh0UGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgd2hhdCBgZG9jdW1lbnRgIGlzIHVzZWQuIEN1cnJlbnRseSB1c2VkIGJ5IERyYWcgYW5kIERyb3AgKG1heSBleHRlbmQgdG8gb3RoZXIgcGxhY2VzIGluIHRoZSBmdXR1cmUpLiBVc2UgdGhpcyB3aGVuIHlvdSB3YW50IHRoZSBncmlkIHRvIHVzZSBhIGRpZmZlcmVudCBgZG9jdW1lbnRgIHRoYW4gdGhlIG9uZSBhdmFpbGFibGUgb24gdGhlIGdsb2JhbCBzY29wZS4gVGhpcyBjYW4gaGFwcGVuIGlmIGRvY2tpbmcgb3V0IGNvbXBvbmVudHMgKHNvbWV0aGluZyB3aGljaCBFbGVjdHJvbiBzdXBwb3J0cykgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldERvY3VtZW50OiAoKCkgPT4gRG9jdW1lbnQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBmb3JtYXQgdGhlIG51bWJlcnMgaW4gdGhlIHBhZ2luYXRpb24gcGFuZWwsIGkuZS4gJ3JvdyBjb3VudCcgYW5kICdwYWdlIG51bWJlcicgbGFiZWxzLiBUaGlzIGlzIGZvciBwYWdpbmF0aW9uIHBhbmVsIG9ubHksIHRvIGZvcm1hdCBudW1iZXJzIGluc2lkZSB0aGUgZ3JpZCdzIGNlbGxzIChpLmUuIHlvdXIgZGF0YSksIHRoZW4gdXNlIGB2YWx1ZUZvcm1hdHRlcmAgaW4gdGhlIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXI6ICgocGFyYW1zOiBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgYGdldEdyb3VwUm93QWdnYCBpbnN0ZWFkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0FnZ05vZGVzOiAoKG5vZGVzOiBSb3dOb2RlW10pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHVzZSB3aGVuIHlvdSBuZWVkIGFjY2VzcyB0byBtb3JlIHRoZW4gdGhlIGN1cnJlbnQgY29sdW1uIGZvciBhZ2dyZWdhdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldEdyb3VwUm93QWdnOiAoKHBhcmFtczogR2V0R3JvdXBSb3dBZ2dQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiAoQ2xpZW50LXNpZGUgUm93IE1vZGVsIG9ubHkpIEFsbG93cyBncm91cHMgdG8gYmUgb3BlbiBieSBkZWZhdWx0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNHcm91cE9wZW5CeURlZmF1bHQ6ICgocGFyYW1zOiBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgZGVmYXVsdCBzb3J0aW5nIG9mIGdyb3Vwcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvcjogKChwYXJhbXM6IEluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvclBhcmFtczxURGF0YT4pID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGBpbml0aWFsR3JvdXBPcmRlckNvbXBhcmF0b3JgIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwT3JkZXJDb21wYXJhdG9yOiAoKG5vZGVBOiBSb3dOb2RlPFREYXRhPiwgbm9kZUI6IFJvd05vZGU8VERhdGE+KSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sRGVmYCBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xEZWY6ICgoY29sRGVmOiBDb2xEZWY8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgYHByb2Nlc3NQaXZvdFJlc3VsdENvbEdyb3VwRGVmYCBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xHcm91cERlZjogKChjb2xHcm91cERlZjogQ29sR3JvdXBEZWY8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIHBpdm90aW5nLCB0byBhbGxvdyBjaGFuZ2luZyB0aGUgc2Vjb25kIGNvbHVtbiBkZWZpbml0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sRGVmOiAoKGNvbERlZjogQ29sRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBwaXZvdGluZywgdG8gYWxsb3cgY2hhbmdpbmcgdGhlIHNlY29uZCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NQaXZvdFJlc3VsdENvbEdyb3VwRGVmOiAoKGNvbEdyb3VwRGVmOiBDb2xHcm91cERlZjxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdoZW4gd29ya2luZyB3aXRoIFRyZWUgRGF0YSB3aGVuIGB0cmVlRGF0YSA9IHRydWVgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGF0YVBhdGg6IEdldERhdGFQYXRoPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgaW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwU29ydENvbXBhcmF0b3I6ICgobm9kZUE6IFJvd05vZGU8VERhdGE+LCBub2RlQjogUm93Tm9kZTxURGF0YT4pID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzZXR0aW5nIHRoZSBjaGlsZCBjb3VudCBmb3IgYSBncm91cCByb3cuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGlsZENvdW50OiAoKGRhdGFJdGVtOiBhbnkpID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBwcm92aWRpbmcgZGlmZmVyZW50IHBhcmFtcyBmb3IgZGlmZmVyZW50IGxldmVscyBvZiBncm91cGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zOiAoKHBhcmFtczogR2V0U2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXNQYXJhbXMpID0+IFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdXNlIGBnZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc2AgaW5zdGVhZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zOiAoKHBhcmFtczogR2V0U2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXNQYXJhbXMpID0+IFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGdyb3VwcyB0byBiZSBvcGVuIGJ5IGRlZmF1bHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHQ6ICgocGFyYW1zOiBJc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY2FuY2VsbGluZyB0cmFuc2FjdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uOiBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTU1JNIFRyZWUgRGF0YTogQWxsb3dzIHNwZWNpZnlpbmcgd2hpY2ggcm93cyBhcmUgZXhwYW5kYWJsZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwOiBJc1NlcnZlclNpZGVHcm91cCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU1NSTSBUcmVlIERhdGE6IEFsbG93cyBzcGVjaWZ5aW5nIGdyb3VwIGtleXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlR3JvdXBLZXk6IEdldFNlcnZlclNpZGVHcm91cEtleSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUmV0dXJuIGEgYnVzaW5lc3Mga2V5IGZvciB0aGUgbm9kZS4gSWYgaW1wbGVtZW50ZWQsIGVhY2ggcm93IGluIHRoZSBET00gd2lsbCBoYXZlIGFuIGF0dHJpYnV0ZSBgcm93LWlkPSdhYmMnYCB3aGVyZSBgYWJjYCBpcyB3aGF0IHlvdSByZXR1cm4gYXMgdGhlIGJ1c2luZXNzIGtleS5cbiAgICAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgYXV0b21hdGVkIHRlc3RpbmcsIGFzIGl0IHByb3ZpZGVzIGEgd2F5IGZvciB5b3VyIHRvb2wgdG8gaWRlbnRpZnkgcm93cyBiYXNlZCBvbiB1bmlxdWUgYnVzaW5lc3Mga2V5cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldEJ1c2luZXNzS2V5Rm9yTm9kZTogKChub2RlOiBSb3dOb2RlPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBnZXRSb3dJZGAgaW5zdGVhZCAtIGhvd2V2ZXIgYmUgYXdhcmUsIGBnZXRSb3dJZCgpYCB3aWxsIGFsc28gc2V0IGdyaWQgb3B0aW9uIGBpbW11dGFibGVEYXRhPXRydWVgXG5BbGxvd3MgeW91IHRvIHNldCB0aGUgSUQgZm9yIGEgcGFydGljdWxhciByb3cgbm9kZSBiYXNlZCBvbiB0aGUgZGF0YS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Tm9kZUlkOiBHZXRSb3dOb2RlSWRGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNldHRpbmcgdGhlIElEIGZvciBhIHBhcnRpY3VsYXIgcm93IG5vZGUgYmFzZWQgb24gdGhlIGRhdGEuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dJZDogR2V0Um93SWRGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBnZXRSb3dJZCgpIGNhbGxiYWNrIGlzIGltcGxlbWVudGVkIGFuZCBuZXcgUm93IERhdGEgaXMgc2V0LCB0aGUgZ3JpZCB3aWxsIGRpc3JlZ2FyZCBhbGwgcHJldmlvdXMgcm93cyBhbmQgdHJlYXQgdGhlIG5ldyBSb3cgRGF0YSBhcyBuZXcgZGF0YS4gQXMgYSBjb25zZXF1ZW5jZSwgYWxsIFJvdyBTdGF0ZSAoZWcgc2VsZWN0aW9uLCByZW5kZXJlZCByb3dzKSB3aWxsIGJlIHJlc2V0LiAgRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVzZXRSb3dEYXRhT25VcGRhdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyByb3dzIGFmdGVyIHRoZXkgYXJlIGNyZWF0ZWQsIHNvIHlvdSBjYW4gZG8gZmluYWwgYWRkaW5nIG9mIGN1c3RvbSBhdHRyaWJ1dGVzIGV0Yy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NSb3dQb3N0Q3JlYXRlOiAoKHBhcmFtczogUHJvY2Vzc1Jvd1BhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHRvIGRldGVybWluZSB3aGljaCByb3dzIGFyZSBzZWxlY3RhYmxlLiBCeSBkZWZhdWx0IHJvd3MgYXJlIHNlbGVjdGFibGUsIHNvIHJldHVybiBgZmFsc2VgIHRvIG1ha2UgYSByb3cgdW4tc2VsZWN0YWJsZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzUm93U2VsZWN0YWJsZTogSXNSb3dTZWxlY3RhYmxlPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIE1hc3RlciBEZXRhaWwgdG8gZGV0ZXJtaW5lIGlmIGEgcm93IHNob3VsZCBiZSBhIG1hc3RlciByb3cuIElmIGBmYWxzZWAgaXMgcmV0dXJuZWQgbm8gZGV0YWlsIHJvdyB3aWxsIGV4aXN0IGZvciB0aGlzIHJvdy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzUm93TWFzdGVyOiBJc1Jvd01hc3RlcjxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGZpbGwgdmFsdWVzIGluc3RlYWQgb2Ygc2ltcGx5IGNvcHlpbmcgdmFsdWVzIG9yIGluY3JlYXNpbmcgbnVtYmVyIHZhbHVlcyB1c2luZyBsaW5lYXIgcHJvZ3Jlc3Npb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsT3BlcmF0aW9uOiAoKHBhcmFtczogRmlsbE9wZXJhdGlvblBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBgcG9zdFNvcnRSb3dzYCBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvc3RTb3J0OiAoKG5vZGVzOiBSb3dOb2RlPFREYXRhPltdKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gcGVyZm9ybSBhZGRpdGlvbmFsIHNvcnRpbmcgYWZ0ZXIgdGhlIGdyaWQgaGFzIHNvcnRlZCB0aGUgcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvc3RTb3J0Um93czogKChwYXJhbXM6IFBvc3RTb3J0Um93c1BhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dTdHlsZWAgdG8gc2V0IHN0eWxlIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYW4gb2JqZWN0IG9mIENTUyB2YWx1ZXMgb3IgdW5kZWZpbmVkIGZvciBubyBzdHlsZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dTdHlsZTogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zPFREYXRhPikgPT4gUm93U3R5bGUgfCB1bmRlZmluZWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dDbGFzc2AgdG8gc2V0IGNsYXNzKGVzKSBmb3IgZWFjaCByb3cgaW5kaXZpZHVhbGx5LiBGdW5jdGlvbiBzaG91bGQgcmV0dXJuIGVpdGhlciBhIHN0cmluZyAoY2xhc3MgbmFtZSksIGFycmF5IG9mIHN0cmluZ3MgKGFycmF5IG9mIGNsYXNzIG5hbWVzKSBvciB1bmRlZmluZWQgZm9yIG5vIGNsYXNzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Q2xhc3M6ICgocGFyYW1zOiBSb3dDbGFzc1BhcmFtczxURGF0YT4pID0+IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdmVyc2lvbiBvZiBwcm9wZXJ0eSBgcm93SGVpZ2h0YCB0byBzZXQgaGVpZ2h0IGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYSBwb3NpdGl2ZSBudW1iZXIgb2YgcGl4ZWxzLCBvciByZXR1cm4gYG51bGxgL2B1bmRlZmluZWRgIHRvIHVzZSB0aGUgZGVmYXVsdCByb3cgaGVpZ2h0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SGVpZ2h0OiAoKHBhcmFtczogUm93SGVpZ2h0UGFyYW1zPFREYXRhPikgPT4gbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBgaXNGdWxsV2lkdGhSb3dgIGluc3RlYWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRnVsbFdpZHRoQ2VsbDogKChyb3dOb2RlOiBSb3dOb2RlPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRlbGxzIHRoZSBncmlkIGlmIHRoaXMgcm93IHNob3VsZCBiZSByZW5kZXJlZCBhcyBmdWxsIHdpZHRoLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNGdWxsV2lkdGhSb3c6ICgocGFyYW1zOiBJc0Z1bGxXaWR0aFJvd1BhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgLyoqIFRoZSB0b29sIHBhbmVsIHdhcyBoaWRkZW4gb3Igc2hvd24uIFVzZSBgYXBpLmlzVG9vbFBhbmVsU2hvd2luZygpYCB0byBnZXQgc3RhdHVzLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUGFzdGUgb3BlcmF0aW9uIGhhcyBzdGFydGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlU3RhcnQ6IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUGFzdGUgb3BlcmF0aW9uIGhhcyBlbmRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZUVuZDogRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uLCBvciBncm91cCBvZiBjb2x1bW5zLCB3YXMgaGlkZGVuIC8gc2hvd24uICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmlzaWJsZTogRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WaXNpYmxlRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiwgb3IgZ3JvdXAgb2YgY29sdW1ucywgd2FzIHBpbm5lZCAvIHVucGlubmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpbm5lZDogRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4gd2FzIHJlc2l6ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUmVzaXplZDogRXZlbnRFbWl0dGVyPENvbHVtblJlc2l6ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5SZXNpemVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgbW92ZWQuIFRvIGZpbmQgb3V0IHdoZW4gdGhlIGNvbHVtbiBtb3ZlIGlzIGZpbmlzaGVkIHlvdSBjYW4gdXNlIHRoZSBgZHJhZ1N0b3BwZWRgIGV2ZW50IGJlbG93LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Nb3ZlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSB2YWx1ZSBjb2x1bW4gd2FzIGFkZGVkIG9yIHJlbW92ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgcGl2b3QgbW9kZSBmbGFnIHdhcyBjaGFuZ2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90TW9kZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBwaXZvdCBjb2x1bW4gd2FzIGFkZGVkLCByZW1vdmVkIG9yIG9yZGVyIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiBncm91cCB3YXMgb3BlbmVkIC8gY2xvc2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkdyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVXNlciBzZXQgbmV3IGNvbHVtbnMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbmV3Q29sdW1uc0xvYWRlZDogRXZlbnRFbWl0dGVyPE5ld0NvbHVtbnNMb2FkZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBncmlkIGNvbHVtbnMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGRpc3BsYXllZCBjb2x1bW5zIGNoYW5nZWQuIFRoaXMgY2FuIHJlc3VsdCBmcm9tIGNvbHVtbnMgb3BlbiAvIGNsb3NlLCBjb2x1bW4gbW92ZSwgcGl2b3QsIGdyb3VwLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiByZW5kZXJlZCBjb2x1bW5zIGNoYW5nZWQgKG9ubHkgY29sdW1ucyBpbiB0aGUgdmlzaWJsZSBzY3JvbGxlZCB2aWV3cG9ydCBhcmUgcmVuZGVyZWQgYnkgZGVmYXVsdCkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBTaG90Z3VuIC0gZ2V0cyBjYWxsZWQgd2hlbiBlaXRoZXIgYSkgbmV3IGNvbHVtbnMgYXJlIHNldCBvciBiKSBgY29sdW1uQXBpLnNldFN0YXRlKClgIGlzIHVzZWQsIHNvIGV2ZXJ5dGhpbmcgaGFzIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBPbmx5IHVzZWQgYnkgQW5ndWxhciwgUmVhY3QgYW5kIFZ1ZUpTIEFHIEdyaWQgY29tcG9uZW50cyAobm90IHVzZWQgaWYgZG9pbmcgcGxhaW4gSmF2YVNjcmlwdCkuXG4gICAgICogSWYgdGhlIGdyaWQgcmVjZWl2ZXMgY2hhbmdlcyBkdWUgdG8gYm91bmQgcHJvcGVydGllcywgdGhpcyBldmVudCBmaXJlcyBhZnRlciB0aGUgZ3JpZCBoYXMgZmluaXNoZWQgcHJvY2Vzc2luZyB0aGUgY2hhbmdlLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbXBvbmVudFN0YXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVmFsdWUgaGFzIGNoYW5nZWQgYWZ0ZXIgZWRpdGluZyAodGhpcyBldmVudCB3aWxsIG5vdCBmaXJlIGlmIGVkaXRpbmcgd2FzIGNhbmNlbGxlZCwgZWcgRVNDIHdhcyBwcmVzc2VkKSBvciBcbiAgICAgKiAgIGlmIGNlbGwgdmFsdWUgaGFzIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgcGFzdGUgb3BlcmF0aW9uLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbFZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVmFsdWUgaGFzIGNoYW5nZWQgYWZ0ZXIgZWRpdGluZy4gT25seSBmaXJlcyB3aGVuIGRvaW5nIFJlYWQgT25seSBFZGl0cywgaWUgYHJlYWRPbmx5RWRpdD10cnVlYC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdFJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdFJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdFJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY2VsbCdzIHZhbHVlIHdpdGhpbiBhIHJvdyBoYXMgY2hhbmdlZC4gVGhpcyBldmVudCBjb3JyZXNwb25kcyB0byBGdWxsIFJvdyBFZGl0aW5nIG9ubHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93VmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Um93VmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93VmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgY2VsbCBoYXMgc3RhcnRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSBjZWxsIGhhcyBzdG9wcGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIHJvdyBoYXMgc3RhcnRlZCAod2hlbiByb3cgZWRpdGluZyBpcyBlbmFibGVkKS4gV2hlbiByb3cgZWRpdGluZywgdGhpcyBldmVudCB3aWxsIGJlIGZpcmVkIG9uY2UgYW5kIGBjZWxsRWRpdGluZ1N0YXJ0ZWRgIHdpbGwgYmUgZmlyZWQgZm9yIGVhY2ggaW5kaXZpZHVhbCBjZWxsLiBPbmx5IGZpcmVzIHdoZW4gZG9pbmcgRnVsbCBSb3cgRWRpdGluZy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSByb3cgaGFzIHN0b3BwZWQgKHdoZW4gcm93IGVkaXRpbmcgaXMgZW5hYmxlZCkuIFdoZW4gcm93IGVkaXRpbmcsIHRoaXMgZXZlbnQgd2lsbCBiZSBmaXJlZCBvbmNlIGFuZCBgY2VsbEVkaXRpbmdTdG9wcGVkYCB3aWxsIGJlIGZpcmVkIGZvciBlYWNoIGluZGl2aWR1YWwgY2VsbC4gT25seSBmaXJlcyB3aGVuIGRvaW5nIEZ1bGwgUm93IEVkaXRpbmcuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgaGFzIGJlZW4gb3BlbmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck9wZW5lZDogRXZlbnRFbWl0dGVyPEZpbHRlck9wZW5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck9wZW5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRmlsdGVyIGhhcyBiZWVuIG1vZGlmaWVkIGFuZCBhcHBsaWVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlckNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRmlsdGVyIHdhcyBtb2RpZmllZCBidXQgbm90IGFwcGxpZWQuIFVzZWQgd2hlbiBmaWx0ZXJzIGhhdmUgJ0FwcGx5JyBidXR0b25zLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck1vZGlmaWVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyTW9kaWZpZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjaGFydCBoYXMgYmVlbiBjcmVhdGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0Q3JlYXRlZDogRXZlbnRFbWl0dGVyPENoYXJ0Q3JlYXRlZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgZGF0YSByYW5nZSBmb3IgdGhlIGNoYXJ0IGhhcyBiZWVuIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDxURGF0YT4+KCk7XG4gICAgLyoqIEZvcm1hdHRpbmcgY2hhbmdlcyBoYXZlIGJlZW4gbWFkZSBieSB1c2VycyB0aHJvdWdoIHRoZSBGb3JtYXQgUGFuZWwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRPcHRpb25zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0T3B0aW9uc0NoYW5nZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRPcHRpb25zQ2hhbmdlZDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY2hhcnQgaGFzIGJlZW4gZGVzdHJveWVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0RGVzdHJveWVkOiBFdmVudEVtaXR0ZXI8Q2hhcnREZXN0cm95ZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnREZXN0cm95ZWQ8VERhdGE+PigpO1xuICAgIC8qKiBET00gZXZlbnQgYGtleURvd25gIGhhcHBlbmVkIG9uIGEgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5RG93bjogRXZlbnRFbWl0dGVyPENlbGxLZXlEb3duRXZlbnQ8VERhdGE+IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5RG93bkV2ZW50PFREYXRhPiB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBET00gZXZlbnQgYGtleVByZXNzYCBoYXBwZW5lZCBvbiBhIGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEtleVByZXNzOiBFdmVudEVtaXR0ZXI8Q2VsbEtleVByZXNzRXZlbnQ8VERhdGE+IHwgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEtleVByZXNzRXZlbnQ8VERhdGE+IHwgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgZ3JpZCBoYXMgaW5pdGlhbGlzZWQgYW5kIGlzIHJlYWR5IGZvciBtb3N0IGFwaSBjYWxscywgYnV0IG1heSBub3QgYmUgZnVsbHkgcmVuZGVyZWQgeWV0ICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFJlYWR5OiBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaXJlZCB0aGUgZmlyc3QgdGltZSBkYXRhIGlzIHJlbmRlcmVkIGludG8gdGhlIGdyaWQuIFVzZSB0aGlzIGV2ZW50IGlmIHlvdSB3YW50IHRvIGF1dG8gcmVzaXplIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY29udGVudHMgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaXJzdERhdGFSZW5kZXJlZDogRXZlbnRFbWl0dGVyPEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBzaXplIG9mIHRoZSBncmlkIGBkaXZgIGhhcyBjaGFuZ2VkLiBJbiBvdGhlciB3b3JkcywgdGhlIGdyaWQgd2FzIHJlc2l6ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFNpemVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBEaXNwbGF5ZWQgcm93cyBoYXZlIGNoYW5nZWQuIFRyaWdnZXJlZCBhZnRlciBzb3J0LCBmaWx0ZXIgb3IgdHJlZSBleHBhbmQgLyBjb2xsYXBzZSBldmVudHMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW9kZWxVcGRhdGVkOiBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBET00sIGZvciBhbnkgcmVhc29uLiBVc2UgdG8gY2xlYW4gdXAgcmVzb3VyY2VzIChpZiBhbnkpIHVzZWQgYnkgdGhlIHJvdy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsUm93UmVtb3ZlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoaWNoIHJvd3MgYXJlIHJlbmRlcmVkIGluIHRoZSBET00gaGFzIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlld3BvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgYm9keSB3YXMgc2Nyb2xsZWQgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNYWluIGJvZHkgb2YgdGhlIGdyaWQgaGFzIHN0b3BwZWQgc2Nyb2xsaW5nLCBlaXRoZXIgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbEVuZDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBXaGVuIGRyYWdnaW5nIHN0YXJ0cy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RhcnRlZDogRXZlbnRFbWl0dGVyPERyYWdTdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RvcHMuIFRoaXMgY291bGQgYmUgYW55IGFjdGlvbiB0aGF0IHVzZXMgdGhlIGdyaWQncyBEcmFnIGFuZCBEcm9wIHNlcnZpY2UsIGUuZy4gQ29sdW1uIE1vdmluZywgQ29sdW1uIFJlc2l6aW5nLCBSYW5nZSBTZWxlY3Rpb24sIEZpbGwgSGFuZGxlLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUcmlnZ2VyZWQgZXZlcnkgdGltZSB0aGUgcGFnaW5nIHN0YXRlIGNoYW5nZXMuIFNvbWUgb2YgdGhlIG1vc3QgY29tbW9uIHNjZW5hcmlvcyBmb3IgdGhpcyBldmVudCB0byBiZSB0cmlnZ2VyZWQgYXJlOlxuICAgICAqIFxuICAgICAqICAgLSBUaGUgcGFnZSBzaXplIGNoYW5nZXMuXG4gICAgICogICAtIFRoZSBjdXJyZW50IHNob3duIHBhZ2UgaXMgY2hhbmdlZC5cbiAgICAgKiAgIC0gTmV3IGRhdGEgaXMgbG9hZGVkIG9udG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGRyYWcgaGFzIHN0YXJ0ZWQsIG9yIGRyYWdnaW5nIHdhcyBhbHJlYWR5IHN0YXJ0ZWQgYW5kIHRoZSBtb3VzZSBoYXMgcmUtZW50ZXJlZCB0aGUgZ3JpZCBoYXZpbmcgcHJldmlvdXNseSBsZWZ0IHRoZSBncmlkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbnRlcjogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbW91c2UgaGFzIG1vdmVkIHdoaWxlIGRyYWdnaW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdNb3ZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbGVmdCB0aGUgZ3JpZCB3aGlsZSBkcmFnZ2luZy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTGVhdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGRyYWcgaGFzIGZpbmlzaGVkIG92ZXIgdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VuZDogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyBncm91cCBjb2x1bW4gd2FzIGFkZGVkIG9yIHJlbW92ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyBncm91cCB3YXMgb3BlbmVkIG9yIGNsb3NlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dHcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93R3JvdXBPcGVuZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpcmVkIHdoZW4gY2FsbGluZyBlaXRoZXIgb2YgdGhlIEFQSSBtZXRob2RzIGBleHBhbmRBbGwoKWAgb3IgYGNvbGxhcHNlQWxsKClgLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGV4cGFuZE9yQ29sbGFwc2VBbGw6IEV2ZW50RW1pdHRlcjxFeHBhbmRDb2xsYXBzZUFsbEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgY2xpZW50IGhhcyBzZXQgbmV3IHBpbm5lZCByb3cgZGF0YSBpbnRvIHRoZSBncmlkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBpbm5lZFJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgTm8gbG9uZ2VyIGZpcmVkLCB1c2Ugb25Sb3dEYXRhVXBkYXRlZCBpbnN0ZWFkXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJvd0RhdGFDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBjbGllbnQgaGFzIHVwZGF0ZWQgZGF0YSBmb3IgdGhlIGdyaWQgYnkgZWl0aGVyIGEpIHNldHRpbmcgbmV3IFJvdyBEYXRhIG9yIGIpIEFwcGx5aW5nIGEgUm93IFRyYW5zYWN0aW9uLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFVcGRhdGVkOiBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEYXRhVXBkYXRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQXN5bmMgdHJhbnNhY3Rpb25zIGhhdmUgYmVlbiBhcHBsaWVkLiBDb250YWlucyBhIGxpc3Qgb2YgYWxsIHRyYW5zYWN0aW9uIHJlc3VsdHMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkOiBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgZG91YmxlIGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbERvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDZWxsIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEZvY3VzZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRm9jdXNlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNb3VzZSBlbnRlcmVkIGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3ZlcjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNb3VzZSBsZWZ0IGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3V0OiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3V0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3V0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNb3VzZSBkb3duIG9uIGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlRG93bjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VEb3duRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSb3cgaXMgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93Q2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBpcyBzZWxlY3RlZCBvciBkZXNlbGVjdGVkLiBUaGUgZXZlbnQgY29udGFpbnMgdGhlIG5vZGUgaW4gcXVlc3Rpb24sIHNvIGNhbGwgdGhlIG5vZGUncyBgaXNTZWxlY3RlZCgpYCBtZXRob2QgdG8gc2VlIGlmIGl0IHdhcyBqdXN0IHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93U2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSb3cgc2VsZWN0aW9uIGlzIGNoYW5nZWQuIFVzZSB0aGUgZ3JpZCBBUEkgYGdldFNlbGVjdGVkTm9kZXMoKWAgb3IgYGdldFNlbGVjdGVkUm93cygpYCB0byBnZXQgdGhlIG5ldyBsaXN0IG9mIHNlbGVjdGVkIG5vZGVzIC8gcm93IGRhdGEuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDZWxsIGlzIHJpZ2h0IGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENvbnRleHRNZW51OiBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYW5nZSB0byByYW5nZSBzZWxlY3Rpb24gaGFzIG9jY3VycmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogU29ydCBoYXMgY2hhbmdlZC4gVGhlIGdyaWQgYWxzbyBsaXN0ZW5zIGZvciB0aGlzIGFuZCB1cGRhdGVzIHRoZSBtb2RlbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8U29ydENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG5cblxuICAgIC8vIEVuYWJsZSB0eXBlIGNvZXJjaW9uIGZvciBib29sZWFuIElucHV0cyB0byBzdXBwb3J0IHVzZSBsaWtlICdlbmFibGVDaGFydHMnIGluc3RlYWQgb2YgZm9yY2luZyAnW2VuYWJsZUNoYXJ0c109XCJ0cnVlXCInIFxuICAgIC8vIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS90ZW1wbGF0ZS10eXBlY2hlY2sjaW5wdXQtc2V0dGVyLWNvZXJjaW9uIFxuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01ha2VDb2x1bW5WaXNpYmxlQWZ0ZXJVbkdyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NlbGxTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbEZvY3VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNTaG93VmVydGljYWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlYnVnOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxFeHByZXNzaW9uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYW5ndWxhckNvbXBpbGVSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbmd1bGFyQ29tcGlsZUZpbHRlcnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBVc2VFbnRpcmVSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU3VwcHJlc3NCbGFua0hlYWRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNZW51SGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5Tb3J0SWNvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNdWx0aVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c011bHRpU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc05vUm93c092ZXJsYXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWx0YVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVtZW1iZXJHcm91cFN0YXRlV2hlbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93R3JvdXBIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlHcm91cEhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3RNb2RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FuaW1hdGVSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUnRsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnTXVsdGlSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUdyb3VwRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZXByZWNhdGVkRW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwTXVsdGlBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5HcmlkTG9zZXNGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3B1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlbHRhUm93RGF0YU1vZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Vuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90cmVlRGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0VudGVycHJpc2VSZXNldE9uTmV3Q29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2V0Q29sdW1uU3RhdGVFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uU3RhdGVFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNoYXJ0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVsdGFDb2x1bW5Nb2RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01haW50YWluVW5zb3J0ZWRPcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01heFJlbmRlcmVkUm93UmVzdHJpY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2V4Y2x1ZGVDaGlsZHJlbldoZW5UcmVlRGF0YUZpbHRlcmluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2tlZXBEZXRhaWxSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0ZUNoaWxkUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91bmRvUmVkb0NlbGxFZGl0aW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbGxvd0RyYWdGcm9tQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW1tdXRhYmxlRGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW1tdXRhYmxlQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3RTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhwYW5kYWJsZVBpdm90R3JvdXBzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hcHBseUNvbHVtbkRlZk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWJvdW5jZVZlcnRpY2FsU2Nyb2xsYmFyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZXRhaWxSb3dBdXRvSGVpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlRmlsdGVyaW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlU29ydGluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZVNvcnRBbGxMZXZlbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVGaWx0ZXJBbGxMZXZlbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0T25TZXJ2ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVGaWx0ZXJPblNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Nob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVhY3RVaTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSZWFjdFVpOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZWFkT25seUVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jlc2V0Um93RGF0YU9uVXBkYXRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZW1vdmVQaXZvdEhlYWRlclJvd1doZW5TaW5nbGVWYWx1ZUNvbHVtbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb3B5U2luZ2xlQ2VsbFJhbmdlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSb3dzU3RpY2t5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgLy8gQEVOREBcbn1cblxuIl19