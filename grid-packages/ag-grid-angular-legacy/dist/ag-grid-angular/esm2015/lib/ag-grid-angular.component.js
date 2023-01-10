import { Component, ComponentFactoryResolver, ElementRef, EventEmitter, Input, Output, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { AgPromise, ComponentUtil, Grid } from "ag-grid-community";
// @END_IMPORTS@
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
export class AgGridAngular {
    constructor(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper, componentFactoryResolver) {
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
        /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu. Default: `false`      */
        this.suppressContextMenu = undefined;
        /** When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
             * This flag is useful to prevent the browser from showing its default context menu.
             * Default: `false`
             */
        this.preventDefaultOnContextMenu = undefined;
        /** Allows context menu to show, even when `Ctrl` key is held down. Default: `false`      */
        this.allowContextMenuWithControlKey = undefined;
        /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header. Default: `false`     */
        this.suppressMenuHide = undefined;
        /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component. Default: `false`      */
        this.enableBrowserTooltips = undefined;
        /** The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
             *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
             * Default: `2000`
             */
        this.tooltipShowDelay = undefined;
        /** The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
             *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
             * Default: `10000`
             */
        this.tooltipHideDelay = undefined;
        /** Set to `true` to have tooltips follow the cursor once they are displayed. Default: `false`      */
        this.tooltipMouseTrack = undefined;
        /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).     */
        this.popupParent = undefined;
        /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
        this.copyHeadersToClipboard = undefined;
        /** Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
        this.copyGroupHeadersToClipboard = undefined;
        /** Specify the delimiter to use when copying to clipboard.
             * Default: `\t`
            */
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
             * Default: `4`
             */
        this.autoSizePadding = undefined;
        /** Set this to `true` to skip the `headerName` when `autoSize` is called by default. Default: `false`     */
        this.skipHeaderOnAutoSize = undefined;
        /** A map of component names to components.     */
        this.components = undefined;
        /** @deprecated As of v27, use `components` for framework components too.     */
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
             * The default is that the grid stays editing until focus goes onto another cell.
             * Default: `false`
             */
        this.stopEditingWhenCellsLoseFocus = undefined;
        /** Set to `true` along with `enterMovesDownAfterEdit` to have Excel-style behaviour for the `Enter` key.
             * i.e. pressing the `Enter` key will move down to the cell beneath.
             * Default: `false`
             */
        this.enterMovesDown = undefined;
        /** Set to `true` along with `enterMovesDown` to have Excel-style behaviour for the 'Enter' key.
             * i.e. pressing the Enter key will move down to the cell beneath.
             * Default: `false`
             */
        this.enterMovesDownAfterEdit = undefined;
        /** Forces Cell Editing to start when backspace is pressed. This is only relevant for MacOS users.     */
        this.enableCellEditingOnBackspace = undefined;
        /** Set to `true` to enable Undo / Redo while editing.     */
        this.undoRedoCellEditing = undefined;
        /** Set the size of the undo / redo stack. Default: `10`     */
        this.undoRedoCellEditingLimit = undefined;
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
        /** @deprecated As of v29, no longer used. To suppress use `suppressChartToolPanelsButton`.     */
        this.enableChartToolPanelsButton = undefined;
        /** Set to `true` to show the 'hamburger' menu option from the Chart Toolbar and display the remaining toolbar buttons. Default: `false`     */
        this.suppressChartToolPanelsButton = undefined;
        /** Allows customisation of the Chart Tool Panels, such as changing the tool panels visibility and order, as well as choosing which charts should be displayed in the settings panel.     */
        this.chartToolPanelsDef = undefined;
        /** Provide your own loading cell renderer to use when data is loading via a DataSource.
            * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.
            */
        this.loadingCellRenderer = undefined;
        /** @deprecated As of v27, use `loadingCellRenderer` for framework components too.     */
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
            * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.
            */
        this.detailCellRenderer = undefined;
        /** @deprecated As of v27, use `detailCellRenderer` for framework components too.     */
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
             * Default: `10`
             */
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
             * Default: `false`
             */
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
            * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-loading-overlay-component) for framework specific implementation details.
            */
        this.loadingOverlayComponent = undefined;
        /** @deprecated As of v27, use `loadingOverlayComponent` for framework components too.     */
        this.loadingOverlayComponentFramework = undefined;
        /** Customise the parameters provided to the loading overlay component.     */
        this.loadingOverlayComponentParams = undefined;
        /** Disables the 'loading' overlay. Default: `false`     */
        this.suppressLoadingOverlay = undefined;
        /** Provide a template for 'no rows' overlay.     */
        this.overlayNoRowsTemplate = undefined;
        /** Provide a custom no rows overlay component.
            * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-no-rows-overlay-component) for framework specific implementation details.
            */
        this.noRowsOverlayComponent = undefined;
        /** @deprecated As of v27, use `noRowsOverlayComponent` for framework components too.     */
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
             * Default: `false`
             */
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
             * Default: `500`
             */
        this.cellFlashDelay = undefined;
        /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `cellFlashDelay` has completed.
             * Default: `1000`
             */
        this.cellFadeDelay = undefined;
        /** Set to `true` to have cells flash after data changes even when the change is due to filtering. Default: `false`     */
        this.allowShowChangeAfterFilter = undefined;
        /** Switch between layout options: `normal`, `autoHeight`, `print`.
             * Default: `normal`
             */
        this.domLayout = undefined;
        /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen. Default: `false`     */
        this.ensureDomOrder = undefined;
        /** Set to `true` to operate the grid in RTL (Right to Left) mode. Default: `false`     */
        this.enableRtl = undefined;
        /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false`     */
        this.suppressColumnVirtualisation = undefined;
        /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
             * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen), or `suppressRowVirtualisation` is true, or if your grid height is able to display more than 500 rows at once.**
             * Default: `false`
             */
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
        /** A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
             * If this callback is not set, the current cell value will be used.
             * If the `rowDragText` callback is set in the ColDef it will take precedence over this, except when
             * `rowDragEntireRow=true`.
             */
        this.rowDragText = undefined;
        /** Provide your own cell renderer component to use for full width rows.
            * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.
            */
        this.fullWidthCellRenderer = undefined;
        /** @deprecated As of v27, use `fullWidthCellRenderer` for framework components too.     */
        this.fullWidthCellRendererFramework = undefined;
        /** Customise the parameters provided to the `fullWidthCellRenderer` component.     */
        this.fullWidthCellRendererParams = undefined;
        /** Set to `true` to have the detail grid embedded in the master grid's container and so link their horizontal scrolling.     */
        this.embedFullWidthRows = undefined;
        /** Specifies how the results of row grouping should be displayed.
             *
             *  The options are:
             *
             * - `'singleColumn'`: single group column automatically added by the grid.
             * - `'multipleColumns'`: a group column per row group is added automatically.
             * - `'groupRows'`: group rows are automatically added instead of group columns.
             * - `'custom'`: informs the grid that group columns will be provided.
             */
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
             * Default: `false`
             */
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
        /** Set to `true` to prevent the grid from creating a '(Blanks)' group for nodes which do not belong to a group, and display the unbalanced nodes alongside group nodes. Default: `false`     */
        this.groupAllowUnbalanced = undefined;
        /** When to show the 'row group panel' (where you drag rows to group) at the top. Default: `never`     */
        this.rowGroupPanelShow = undefined;
        /** Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
            * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.
            */
        this.groupRowRenderer = undefined;
        /** @deprecated As of v27, use `groupRowRenderer` for framework components too.     */
        this.groupRowRendererFramework = undefined;
        /** Customise the parameters provided to the `groupRowRenderer` component.     */
        this.groupRowRendererParams = undefined;
        /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping. Default: `false`     */
        this.suppressMakeColumnVisibleAfterUnGroup = undefined;
        /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.     */
        this.treeData = undefined;
        /** Set to `true` to suppress sort indicators and actions from the row group panel. Default: `false`.     */
        this.rowGroupPanelSuppressSort = undefined;
        /** Set to `true` to keep open Group Rows visible at the top of the grid. Default: `false`.*/
        this.groupRowsSticky = undefined;
        /** @deprecated v24 - no longer needed, transaction updates keep group state     */
        this.rememberGroupStateWhenNewData = undefined;
        /** Data to be displayed as pinned top rows in the grid.     */
        this.pinnedTopRowData = undefined;
        /** Data to be displayed as pinned bottom rows in the grid.     */
        this.pinnedBottomRowData = undefined;
        /** Sets the row model type. Default: `clientSide`     */
        this.rowModelType = undefined;
        /** Set the data to be displayed as rows in the grid.     */
        this.rowData = undefined;
        /** @deprecated 27.1 Immutable Data is on by default when grid callback getRowId() is implemented
             * Enables Immutable Data mode, for compatibility with immutable stores. Default: `false`     */
        this.immutableData = undefined;
        /** How many milliseconds to wait before executing a batch of async transactions.     */
        this.asyncTransactionWaitMillis = undefined;
        /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates. Default: `false`     */
        this.suppressModelUpdateAfterUpdateTransaction = undefined;
        /** Provide the datasource for infinite scrolling.     */
        this.datasource = undefined;
        /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
             * Default: `1`
             */
        this.cacheOverflowSize = undefined;
        /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
             * Default: `1`
             */
        this.infiniteInitialRowCount = undefined;
        /** Set how many loading rows to display to the user for the root level group.
             * Default: `1`
             */
        this.serverSideInitialRowCount = undefined;
        /** @deprecated v28 Whether to use Full Store or Partial Store for storing rows. Default: `partial`.
             * Deprecated in favour of suppressServerSideInfiniteScroll. When false, Partial Store is used. When true,
             * Full Store is used.
             */
        this.serverSideStoreType = undefined;
        /** When `true`, the Server-side Row Model will suppress Infinite Scrolling and load all the data at the current level.
             * Default: `false`
             */
        this.suppressServerSideInfiniteScroll = undefined;
        /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
             * Default: `100`
             */
        this.cacheBlockSize = undefined;
        /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.     */
        this.maxBlocksInCache = undefined;
        /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.
             * Set to `-1` for no maximum restriction on requests.
             * Default: `2`
             */
        this.maxConcurrentDatasourceRequests = undefined;
        /** How many milliseconds to wait before loading a block. Useful when infinite scrolling and scrolling over many infinite blocks, as it prevents blocks loading until scrolling has settled.     */
        this.blockLoadDebounceMillis = undefined;
        /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping. Default: `false`      */
        this.purgeClosedRowNodes = undefined;
        /** Provide the `serverSideDatasource` for server side row model.     */
        this.serverSideDatasource = undefined;
        /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server. Default: `false`     */
        this.serverSideSortAllLevels = undefined;
        /** When enabled, always refreshes top level groups regardless of which column was filtered. This property only applies when there is Row Grouping & filtering is handled on the server. Default: `false`     */
        this.serverSideFilterAllLevels = undefined;
        /** When enabled, Sorting will be done on the server side. When suppressServerSideInfiniteScroll=false, does nothing,
             * as Sorting is always server side when Infinite Scroll is active.
             * Default: `false`
             */
        this.serverSideSortOnServer = undefined;
        /** When enabled, Filtering will be done on the server side. When suppressServerSideInfiniteScroll=false, does nothing,
              * as Filtering is always server side when Infinite Scroll is active.
              * Default: `false`
              */
        this.serverSideFilterOnServer = undefined;
        /** @deprecated v28 This property has been deprecated. Use `serverSideSortAllLevels` instead.     */
        this.serverSideSortingAlwaysResets = undefined;
        /** @deprecated v28 This property has been deprecated. Use `serverSideFilterAllLevels` instead.     */
        this.serverSideFilteringAlwaysResets = undefined;
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
        /** @deprecated v27 This property has been deprecated. Use `suppressCellFocus` instead.
             */
        this.suppressCellSelection = undefined;
        /** If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels. Default: `false`     */
        this.suppressCellFocus = undefined;
        /** If `true`, only a single range can be selected. Default: `false`     */
        this.suppressMultiRangeSelection = undefined;
        /** Set to `true` to be able to select the text within cells.
             *
             *     **Note:** When this is set to `true`, the clipboard service is disabled.
             * Default: `false`
             */
        this.enableCellTextSelection = undefined;
        /** Set to `true` to enable Range Selection. Default: `false`     */
        this.enableRangeSelection = undefined;
        /** Set to `true` to enable the Range Handle. Default: `false`     */
        this.enableRangeHandle = undefined;
        /** Set to `true` to enable the Fill Handle. Default: `false`     */
        this.enableFillHandle = undefined;
        /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical. Default: `xy`     */
        this.fillHandleDirection = undefined;
        /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle. Default: `false`*/
        this.suppressClearOnFillReduction = undefined;
        /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`. Default: `[null, 'asc', 'desc']`      */
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
        /** Allows you to process header values for the clipboard.      */
        this.processHeaderForClipboard = undefined;
        /** Allows you to process group header values for the clipboard.      */
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
        /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.      */
        this.tabToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.      */
        this.navigateToNextCell = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused. Return the next Cell position to navigate to or null to stay on current cell.      */
        this.tabToNextCell = undefined;
        /** @deprecated v27.2 - Use `getLocaleText` instead.     */
        this.localeTextFunc = undefined;
        /** A callback for localising text within the grid.     */
        this.getLocaleText = undefined;
        /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)     */
        this.getDocument = undefined;
        /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.     */
        this.paginationNumberFormatter = undefined;
        /** @deprecated v27.2 - Use `getGroupRowAgg` instead.     */
        this.groupRowAggNodes = undefined;
        /** Callback to use when you need access to more then the current column for aggregation.     */
        this.getGroupRowAgg = undefined;
        /** (Client-side Row Model only) Allows groups to be open by default.     */
        this.isGroupOpenByDefault = undefined;
        /** Allows default sorting of groups.     */
        this.initialGroupOrderComparator = undefined;
        /** @deprecated v27.2 - Use `initialGroupOrderComparator` instead     */
        this.defaultGroupOrderComparator = undefined;
        /** @deprecated v28 - Use `processPivotResultColDef` instead     */
        this.processSecondaryColDef = undefined;
        /** @deprecated v28 - Use `processPivotResultColGroupDef` instead     */
        this.processSecondaryColGroupDef = undefined;
        /** Callback to be used with pivoting, to allow changing the second column definition.     */
        this.processPivotResultColDef = undefined;
        /** Callback to be used with pivoting, to allow changing the second column group definition.     */
        this.processPivotResultColGroupDef = undefined;
        /** Callback to be used when working with Tree Data when `treeData = true`.     */
        this.getDataPath = undefined;
        /** Allows setting the child count for a group row.     */
        this.getChildCount = undefined;
        /** Allows providing different params for different levels of grouping.     */
        this.getServerSideGroupLevelParams = undefined;
        /** @deprecated v28 Use `getServerSideGroupLevelParams` instead.     */
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
             * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.
             */
        this.getBusinessKeyForNode = undefined;
        /** @deprecated v27.1 Use `getRowId` instead - however be aware, `getRowId()` will also set grid option `immutableData=true`
             * Allows you to set the ID for a particular row node based on the data.     */
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
        /** @deprecated v27.2 Use `postSortRows` instead     */
        this.postSort = undefined;
        /** Callback to perform additional sorting after the grid has sorted the rows.     */
        this.postSortRows = undefined;
        /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.     */
        this.getRowStyle = undefined;
        /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.     */
        this.getRowClass = undefined;
        /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.     */
        this.getRowHeight = undefined;
        /** @deprecated v27.2 Use `isFullWidthRow` instead.     */
        this.isFullWidthCell = undefined;
        /** Tells the grid if this row should be rendered as full width.     */
        this.isFullWidthRow = undefined;
        /** The tool panel was hidden or shown. Use `api.isToolPanelShowing()` to get status.     */
        this.toolPanelVisibleChanged = new EventEmitter();
        /** The tool panel size has been changed.     */
        this.toolPanelSizeChanged = new EventEmitter();
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
        /** A column was moved.     */
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
        /** Shotgun - gets called when either a) new columns are set or b) `columnApi.applyColumnState()` is used, so everything has changed.     */
        this.columnEverythingChanged = new EventEmitter();
        /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
             * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.
             */
        this.componentStateChanged = new EventEmitter();
        /** Value has changed after editing (this event will not fire if editing was cancelled, eg ESC was pressed) or
             *  if cell value has changed as a result of paste operation.
            */
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
        /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet      */
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
             *  - The page size changes.
             *  - The current shown page is changed.
             *  - New data is loaded onto the grid.
             */
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
        /** @deprecated v28 No longer fired, use onRowDataUpdated instead     */
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
    ngAfterViewInit() {
        this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setComponentFactoryResolver(this.componentFactoryResolver);
        this.angularFrameworkOverrides.setEmitterUsedCallback(this.isEmitterUsed.bind(this));
        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: this.angularFrameworkOverrides,
            providedBeanInstances: {
                frameworkComponentWrapper: this.frameworkComponentWrapper
            },
            modules: (this.modules || [])
        };
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
        this._fullyReady.resolveNow(null, resolve => resolve);
    }
    ngOnChanges(changes) {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.api);
        }
    }
    ngOnDestroy() {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            if (this.api) {
                this.api.destroy();
            }
        }
    }
    // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
    // or via gridOptions
    isEmitterUsed(eventType) {
        const emitter = this[eventType];
        const hasEmitter = !!emitter && emitter.observers && emitter.observers.length > 0;
        // gridReady => onGridReady
        const asEventName = `on${eventType.charAt(0).toUpperCase()}${eventType.substring(1)}`;
        const hasGridOptionListener = !!this.gridOptions && !!this.gridOptions[asEventName];
        return hasEmitter || hasGridOptionListener;
    }
    globalEventListener(eventType, event) {
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        const emitter = this[eventType];
        if (emitter && this.isEmitterUsed(eventType)) {
            if (eventType === 'gridReady') {
                // if the user is listening for gridReady, wait for ngAfterViewInit to fire first, then emit the
                // gridReady event
                this._fullyReady.then((result => {
                    emitter.emit(event);
                }));
            }
            else {
                emitter.emit(event);
            }
        }
    }
}
AgGridAngular.decorators = [
    { type: Component, args: [{
                selector: 'ag-grid-angular',
                template: '',
                providers: [
                    AngularFrameworkOverrides,
                    AngularFrameworkComponentWrapper
                ],
                // tell angular we don't want view encapsulation, we don't want a shadow root
                encapsulation: ViewEncapsulation.None
            },] }
];
AgGridAngular.ctorParameters = () => [
    { type: ElementRef },
    { type: ViewContainerRef },
    { type: AngularFrameworkOverrides },
    { type: AngularFrameworkComponentWrapper },
    { type: ComponentFactoryResolver }
];
AgGridAngular.propDecorators = {
    gridOptions: [{ type: Input }],
    modules: [{ type: Input }],
    statusBar: [{ type: Input }],
    sideBar: [{ type: Input }],
    suppressContextMenu: [{ type: Input }],
    preventDefaultOnContextMenu: [{ type: Input }],
    allowContextMenuWithControlKey: [{ type: Input }],
    suppressMenuHide: [{ type: Input }],
    enableBrowserTooltips: [{ type: Input }],
    tooltipShowDelay: [{ type: Input }],
    tooltipHideDelay: [{ type: Input }],
    tooltipMouseTrack: [{ type: Input }],
    popupParent: [{ type: Input }],
    copyHeadersToClipboard: [{ type: Input }],
    copyGroupHeadersToClipboard: [{ type: Input }],
    clipboardDelimiter: [{ type: Input }],
    suppressCopyRowsToClipboard: [{ type: Input }],
    suppressCopySingleCellRanges: [{ type: Input }],
    suppressLastEmptyLineOnPaste: [{ type: Input }],
    suppressClipboardPaste: [{ type: Input }],
    suppressClipboardApi: [{ type: Input }],
    columnDefs: [{ type: Input }],
    defaultColDef: [{ type: Input }],
    defaultColGroupDef: [{ type: Input }],
    columnTypes: [{ type: Input }],
    maintainColumnOrder: [{ type: Input }],
    suppressFieldDotNotation: [{ type: Input }],
    headerHeight: [{ type: Input }],
    groupHeaderHeight: [{ type: Input }],
    floatingFiltersHeight: [{ type: Input }],
    pivotHeaderHeight: [{ type: Input }],
    pivotGroupHeaderHeight: [{ type: Input }],
    allowDragFromColumnsToolPanel: [{ type: Input }],
    suppressMovableColumns: [{ type: Input }],
    suppressColumnMoveAnimation: [{ type: Input }],
    suppressDragLeaveHidesColumns: [{ type: Input }],
    suppressRowGroupHidesColumns: [{ type: Input }],
    colResizeDefault: [{ type: Input }],
    suppressAutoSize: [{ type: Input }],
    autoSizePadding: [{ type: Input }],
    skipHeaderOnAutoSize: [{ type: Input }],
    components: [{ type: Input }],
    frameworkComponents: [{ type: Input }],
    editType: [{ type: Input }],
    singleClickEdit: [{ type: Input }],
    suppressClickEdit: [{ type: Input }],
    readOnlyEdit: [{ type: Input }],
    stopEditingWhenCellsLoseFocus: [{ type: Input }],
    enterMovesDown: [{ type: Input }],
    enterMovesDownAfterEdit: [{ type: Input }],
    enableCellEditingOnBackspace: [{ type: Input }],
    undoRedoCellEditing: [{ type: Input }],
    undoRedoCellEditingLimit: [{ type: Input }],
    defaultCsvExportParams: [{ type: Input }],
    suppressCsvExport: [{ type: Input }],
    defaultExcelExportParams: [{ type: Input }],
    suppressExcelExport: [{ type: Input }],
    excelStyles: [{ type: Input }],
    quickFilterText: [{ type: Input }],
    cacheQuickFilter: [{ type: Input }],
    excludeChildrenWhenTreeDataFiltering: [{ type: Input }],
    enableCharts: [{ type: Input }],
    chartThemes: [{ type: Input }],
    customChartThemes: [{ type: Input }],
    chartThemeOverrides: [{ type: Input }],
    enableChartToolPanelsButton: [{ type: Input }],
    suppressChartToolPanelsButton: [{ type: Input }],
    chartToolPanelsDef: [{ type: Input }],
    loadingCellRenderer: [{ type: Input }],
    loadingCellRendererFramework: [{ type: Input }],
    loadingCellRendererParams: [{ type: Input }],
    loadingCellRendererSelector: [{ type: Input }],
    localeText: [{ type: Input }],
    masterDetail: [{ type: Input }],
    keepDetailRows: [{ type: Input }],
    keepDetailRowsCount: [{ type: Input }],
    detailCellRenderer: [{ type: Input }],
    detailCellRendererFramework: [{ type: Input }],
    detailCellRendererParams: [{ type: Input }],
    detailRowHeight: [{ type: Input }],
    detailRowAutoHeight: [{ type: Input }],
    context: [{ type: Input }],
    alignedGrids: [{ type: Input }],
    tabIndex: [{ type: Input }],
    rowBuffer: [{ type: Input }],
    valueCache: [{ type: Input }],
    valueCacheNeverExpires: [{ type: Input }],
    enableCellExpressions: [{ type: Input }],
    suppressParentsInRowNodes: [{ type: Input }],
    suppressTouch: [{ type: Input }],
    suppressFocusAfterRefresh: [{ type: Input }],
    suppressAsyncEvents: [{ type: Input }],
    suppressBrowserResizeObserver: [{ type: Input }],
    suppressPropertyNamesCheck: [{ type: Input }],
    suppressChangeDetection: [{ type: Input }],
    debug: [{ type: Input }],
    overlayLoadingTemplate: [{ type: Input }],
    loadingOverlayComponent: [{ type: Input }],
    loadingOverlayComponentFramework: [{ type: Input }],
    loadingOverlayComponentParams: [{ type: Input }],
    suppressLoadingOverlay: [{ type: Input }],
    overlayNoRowsTemplate: [{ type: Input }],
    noRowsOverlayComponent: [{ type: Input }],
    noRowsOverlayComponentFramework: [{ type: Input }],
    noRowsOverlayComponentParams: [{ type: Input }],
    suppressNoRowsOverlay: [{ type: Input }],
    pagination: [{ type: Input }],
    paginationPageSize: [{ type: Input }],
    paginationAutoPageSize: [{ type: Input }],
    paginateChildRows: [{ type: Input }],
    suppressPaginationPanel: [{ type: Input }],
    pivotMode: [{ type: Input }],
    pivotPanelShow: [{ type: Input }],
    pivotColumnGroupTotals: [{ type: Input }],
    pivotRowTotals: [{ type: Input }],
    pivotSuppressAutoColumn: [{ type: Input }],
    suppressExpandablePivotGroups: [{ type: Input }],
    functionsReadOnly: [{ type: Input }],
    aggFuncs: [{ type: Input }],
    suppressAggFuncInHeader: [{ type: Input }],
    suppressAggAtRootLevel: [{ type: Input }],
    aggregateOnlyChangedColumns: [{ type: Input }],
    suppressAggFilteredOnly: [{ type: Input }],
    removePivotHeaderRowWhenSingleValueColumn: [{ type: Input }],
    animateRows: [{ type: Input }],
    enableCellChangeFlash: [{ type: Input }],
    cellFlashDelay: [{ type: Input }],
    cellFadeDelay: [{ type: Input }],
    allowShowChangeAfterFilter: [{ type: Input }],
    domLayout: [{ type: Input }],
    ensureDomOrder: [{ type: Input }],
    enableRtl: [{ type: Input }],
    suppressColumnVirtualisation: [{ type: Input }],
    suppressMaxRenderedRowRestriction: [{ type: Input }],
    suppressRowVirtualisation: [{ type: Input }],
    rowDragManaged: [{ type: Input }],
    suppressRowDrag: [{ type: Input }],
    suppressMoveWhenRowDragging: [{ type: Input }],
    rowDragEntireRow: [{ type: Input }],
    rowDragMultiRow: [{ type: Input }],
    rowDragText: [{ type: Input }],
    fullWidthCellRenderer: [{ type: Input }],
    fullWidthCellRendererFramework: [{ type: Input }],
    fullWidthCellRendererParams: [{ type: Input }],
    embedFullWidthRows: [{ type: Input }],
    groupDisplayType: [{ type: Input }],
    groupDefaultExpanded: [{ type: Input }],
    autoGroupColumnDef: [{ type: Input }],
    groupMaintainOrder: [{ type: Input }],
    groupSelectsChildren: [{ type: Input }],
    groupAggFiltering: [{ type: Input }],
    groupIncludeFooter: [{ type: Input }],
    groupIncludeTotalFooter: [{ type: Input }],
    groupSuppressBlankHeader: [{ type: Input }],
    groupSelectsFiltered: [{ type: Input }],
    showOpenedGroup: [{ type: Input }],
    groupRemoveSingleChildren: [{ type: Input }],
    groupRemoveLowestSingleChildren: [{ type: Input }],
    groupHideOpenParents: [{ type: Input }],
    groupAllowUnbalanced: [{ type: Input }],
    rowGroupPanelShow: [{ type: Input }],
    groupRowRenderer: [{ type: Input }],
    groupRowRendererFramework: [{ type: Input }],
    groupRowRendererParams: [{ type: Input }],
    suppressMakeColumnVisibleAfterUnGroup: [{ type: Input }],
    treeData: [{ type: Input }],
    rowGroupPanelSuppressSort: [{ type: Input }],
    groupRowsSticky: [{ type: Input }],
    rememberGroupStateWhenNewData: [{ type: Input }],
    pinnedTopRowData: [{ type: Input }],
    pinnedBottomRowData: [{ type: Input }],
    rowModelType: [{ type: Input }],
    rowData: [{ type: Input }],
    immutableData: [{ type: Input }],
    asyncTransactionWaitMillis: [{ type: Input }],
    suppressModelUpdateAfterUpdateTransaction: [{ type: Input }],
    datasource: [{ type: Input }],
    cacheOverflowSize: [{ type: Input }],
    infiniteInitialRowCount: [{ type: Input }],
    serverSideInitialRowCount: [{ type: Input }],
    serverSideStoreType: [{ type: Input }],
    suppressServerSideInfiniteScroll: [{ type: Input }],
    cacheBlockSize: [{ type: Input }],
    maxBlocksInCache: [{ type: Input }],
    maxConcurrentDatasourceRequests: [{ type: Input }],
    blockLoadDebounceMillis: [{ type: Input }],
    purgeClosedRowNodes: [{ type: Input }],
    serverSideDatasource: [{ type: Input }],
    serverSideSortAllLevels: [{ type: Input }],
    serverSideFilterAllLevels: [{ type: Input }],
    serverSideSortOnServer: [{ type: Input }],
    serverSideFilterOnServer: [{ type: Input }],
    serverSideSortingAlwaysResets: [{ type: Input }],
    serverSideFilteringAlwaysResets: [{ type: Input }],
    viewportDatasource: [{ type: Input }],
    viewportRowModelPageSize: [{ type: Input }],
    viewportRowModelBufferSize: [{ type: Input }],
    alwaysShowHorizontalScroll: [{ type: Input }],
    alwaysShowVerticalScroll: [{ type: Input }],
    debounceVerticalScrollbar: [{ type: Input }],
    suppressHorizontalScroll: [{ type: Input }],
    suppressScrollOnNewData: [{ type: Input }],
    suppressScrollWhenPopupsAreOpen: [{ type: Input }],
    suppressAnimationFrame: [{ type: Input }],
    suppressMiddleClickScrolls: [{ type: Input }],
    suppressPreventDefaultOnMouseWheel: [{ type: Input }],
    scrollbarWidth: [{ type: Input }],
    rowSelection: [{ type: Input }],
    rowMultiSelectWithClick: [{ type: Input }],
    suppressRowDeselection: [{ type: Input }],
    suppressRowClickSelection: [{ type: Input }],
    suppressCellSelection: [{ type: Input }],
    suppressCellFocus: [{ type: Input }],
    suppressMultiRangeSelection: [{ type: Input }],
    enableCellTextSelection: [{ type: Input }],
    enableRangeSelection: [{ type: Input }],
    enableRangeHandle: [{ type: Input }],
    enableFillHandle: [{ type: Input }],
    fillHandleDirection: [{ type: Input }],
    suppressClearOnFillReduction: [{ type: Input }],
    sortingOrder: [{ type: Input }],
    accentedSort: [{ type: Input }],
    unSortIcon: [{ type: Input }],
    suppressMultiSort: [{ type: Input }],
    alwaysMultiSort: [{ type: Input }],
    multiSortKey: [{ type: Input }],
    suppressMaintainUnsortedOrder: [{ type: Input }],
    icons: [{ type: Input }],
    rowHeight: [{ type: Input }],
    rowStyle: [{ type: Input }],
    rowClass: [{ type: Input }],
    rowClassRules: [{ type: Input }],
    suppressRowHoverHighlight: [{ type: Input }],
    suppressRowTransform: [{ type: Input }],
    columnHoverHighlight: [{ type: Input }],
    deltaSort: [{ type: Input }],
    treeDataDisplayType: [{ type: Input }],
    functionsPassive: [{ type: Input }],
    enableGroupEdit: [{ type: Input }],
    getContextMenuItems: [{ type: Input }],
    getMainMenuItems: [{ type: Input }],
    postProcessPopup: [{ type: Input }],
    processCellForClipboard: [{ type: Input }],
    processHeaderForClipboard: [{ type: Input }],
    processGroupHeaderForClipboard: [{ type: Input }],
    processCellFromClipboard: [{ type: Input }],
    sendToClipboard: [{ type: Input }],
    processDataFromClipboard: [{ type: Input }],
    isExternalFilterPresent: [{ type: Input }],
    doesExternalFilterPass: [{ type: Input }],
    getChartToolbarItems: [{ type: Input }],
    createChartContainer: [{ type: Input }],
    navigateToNextHeader: [{ type: Input }],
    tabToNextHeader: [{ type: Input }],
    navigateToNextCell: [{ type: Input }],
    tabToNextCell: [{ type: Input }],
    localeTextFunc: [{ type: Input }],
    getLocaleText: [{ type: Input }],
    getDocument: [{ type: Input }],
    paginationNumberFormatter: [{ type: Input }],
    groupRowAggNodes: [{ type: Input }],
    getGroupRowAgg: [{ type: Input }],
    isGroupOpenByDefault: [{ type: Input }],
    initialGroupOrderComparator: [{ type: Input }],
    defaultGroupOrderComparator: [{ type: Input }],
    processSecondaryColDef: [{ type: Input }],
    processSecondaryColGroupDef: [{ type: Input }],
    processPivotResultColDef: [{ type: Input }],
    processPivotResultColGroupDef: [{ type: Input }],
    getDataPath: [{ type: Input }],
    getChildCount: [{ type: Input }],
    getServerSideGroupLevelParams: [{ type: Input }],
    getServerSideStoreParams: [{ type: Input }],
    isServerSideGroupOpenByDefault: [{ type: Input }],
    isApplyServerSideTransaction: [{ type: Input }],
    isServerSideGroup: [{ type: Input }],
    getServerSideGroupKey: [{ type: Input }],
    getBusinessKeyForNode: [{ type: Input }],
    getRowNodeId: [{ type: Input }],
    getRowId: [{ type: Input }],
    resetRowDataOnUpdate: [{ type: Input }],
    processRowPostCreate: [{ type: Input }],
    isRowSelectable: [{ type: Input }],
    isRowMaster: [{ type: Input }],
    fillOperation: [{ type: Input }],
    postSort: [{ type: Input }],
    postSortRows: [{ type: Input }],
    getRowStyle: [{ type: Input }],
    getRowClass: [{ type: Input }],
    getRowHeight: [{ type: Input }],
    isFullWidthCell: [{ type: Input }],
    isFullWidthRow: [{ type: Input }],
    toolPanelVisibleChanged: [{ type: Output }],
    toolPanelSizeChanged: [{ type: Output }],
    pasteStart: [{ type: Output }],
    pasteEnd: [{ type: Output }],
    columnVisible: [{ type: Output }],
    columnPinned: [{ type: Output }],
    columnResized: [{ type: Output }],
    columnMoved: [{ type: Output }],
    columnValueChanged: [{ type: Output }],
    columnPivotModeChanged: [{ type: Output }],
    columnPivotChanged: [{ type: Output }],
    columnGroupOpened: [{ type: Output }],
    newColumnsLoaded: [{ type: Output }],
    gridColumnsChanged: [{ type: Output }],
    displayedColumnsChanged: [{ type: Output }],
    virtualColumnsChanged: [{ type: Output }],
    columnEverythingChanged: [{ type: Output }],
    componentStateChanged: [{ type: Output }],
    cellValueChanged: [{ type: Output }],
    cellEditRequest: [{ type: Output }],
    rowValueChanged: [{ type: Output }],
    cellEditingStarted: [{ type: Output }],
    cellEditingStopped: [{ type: Output }],
    rowEditingStarted: [{ type: Output }],
    rowEditingStopped: [{ type: Output }],
    filterOpened: [{ type: Output }],
    filterChanged: [{ type: Output }],
    filterModified: [{ type: Output }],
    chartCreated: [{ type: Output }],
    chartRangeSelectionChanged: [{ type: Output }],
    chartOptionsChanged: [{ type: Output }],
    chartDestroyed: [{ type: Output }],
    cellKeyDown: [{ type: Output }],
    cellKeyPress: [{ type: Output }],
    gridReady: [{ type: Output }],
    firstDataRendered: [{ type: Output }],
    gridSizeChanged: [{ type: Output }],
    modelUpdated: [{ type: Output }],
    virtualRowRemoved: [{ type: Output }],
    viewportChanged: [{ type: Output }],
    bodyScroll: [{ type: Output }],
    bodyScrollEnd: [{ type: Output }],
    dragStarted: [{ type: Output }],
    dragStopped: [{ type: Output }],
    paginationChanged: [{ type: Output }],
    rowDragEnter: [{ type: Output }],
    rowDragMove: [{ type: Output }],
    rowDragLeave: [{ type: Output }],
    rowDragEnd: [{ type: Output }],
    columnRowGroupChanged: [{ type: Output }],
    rowGroupOpened: [{ type: Output }],
    expandOrCollapseAll: [{ type: Output }],
    pinnedRowDataChanged: [{ type: Output }],
    rowDataChanged: [{ type: Output }],
    rowDataUpdated: [{ type: Output }],
    asyncTransactionsFlushed: [{ type: Output }],
    cellClicked: [{ type: Output }],
    cellDoubleClicked: [{ type: Output }],
    cellFocused: [{ type: Output }],
    cellMouseOver: [{ type: Output }],
    cellMouseOut: [{ type: Output }],
    cellMouseDown: [{ type: Output }],
    rowClicked: [{ type: Output }],
    rowDoubleClicked: [{ type: Output }],
    rowSelected: [{ type: Output }],
    selectionChanged: [{ type: Output }],
    cellContextMenu: [{ type: Output }],
    rangeSelectionChanged: [{ type: Output }],
    sortChanged: [{ type: Output }],
    columnRowGroupChangeRequest: [{ type: Output }],
    columnPivotChangeRequest: [{ type: Output }],
    columnValueChangeRequest: [{ type: Output }],
    columnAggFuncChangeRequest: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2VhbmxhbmRzbWFuL2Rldi9hZy1ncmlkLzI5LjAuMC9ncmlkLXBhY2thZ2VzL2FnLWdyaWQtYW5ndWxhci1sZWdhY3kvcHJvamVjdHMvYWctZ3JpZC1hbmd1bGFyL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9hZy1ncmlkLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFSCxTQUFTLEVBQ1Qsd0JBQXdCLEVBQ3hCLFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUdMLE1BQU0sRUFDTixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBbUMsTUFBTSxtQkFBbUIsQ0FBQztBQWdKcEcsZ0JBQWdCO0FBRWhCLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBWXRGLE1BQU0sT0FBTyxhQUFhO0lBZ0J0QixZQUFZLFVBQXNCLEVBQ3RCLGdCQUFrQyxFQUNsQyx5QkFBb0QsRUFDcEQseUJBQTJELEVBQzNELHdCQUFrRDtRQUhsRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFrQztRQUMzRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBaEJ0RCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSTNCLDBEQUEwRDtRQUNsRCxnQkFBVyxHQUF1QixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBd0dsRSxVQUFVO1FBQ1Ysd0VBQXdFO1FBQ3hELGNB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Z0NBRU4sTUFBTTsrQkFFTixNQUFNO2lDQUVOLE1BQU07c0NBRU4sTUFBTTtvQ0FFTixNQUFNO3NDQUVOLE1BQU07b0NBSU4sTUFBTTsrQkFJTixNQUFNOzhCQUVOLE1BQU07OEJBRU4sTUFBTTtpQ0FFTixNQUFNO2lDQUVOLE1BQU07Z0NBRU4sTUFBTTtnQ0FFTixNQUFNOzJCQUVOLE1BQU07NEJBRU4sTUFBTTs2QkFFTixNQUFNOzJCQUVOLE1BQU07eUNBRU4sTUFBTTtrQ0FFTixNQUFNOzZCQUVOLE1BQU07MEJBRU4sTUFBTTsyQkFFTixNQUFNO3dCQUVOLE1BQU07Z0NBRU4sTUFBTTs4QkFFTixNQUFNOzJCQUVOLE1BQU07Z0NBRU4sTUFBTTs4QkFFTixNQUFNO3lCQUVOLE1BQU07NEJBRU4sTUFBTTswQkFFTixNQUFNOzBCQUVOLE1BQU07Z0NBT04sTUFBTTsyQkFFTixNQUFNOzBCQUVOLE1BQU07MkJBRU4sTUFBTTt5QkFFTixNQUFNO29DQUVOLE1BQU07NkJBRU4sTUFBTTtrQ0FFTixNQUFNO21DQUVOLE1BQU07NkJBRU4sTUFBTTs2QkFFTixNQUFNO3VDQUVOLE1BQU07MEJBRU4sTUFBTTtnQ0FFTixNQUFNOzBCQUVOLE1BQU07NEJBRU4sTUFBTTsyQkFFTixNQUFNOzRCQUVOLE1BQU07eUJBRU4sTUFBTTsrQkFFTixNQUFNOzBCQUVOLE1BQU07K0JBRU4sTUFBTTs4QkFFTixNQUFNO29DQUVOLE1BQU07MEJBRU4sTUFBTTswQ0FDTixNQUFNO3VDQUNOLE1BQU07dUNBQ04sTUFBTTt5Q0FDTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZnRlclZpZXdJbml0LFxuICAgIENvbXBvbmVudCxcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgRWxlbWVudFJlZixcbiAgICBFdmVudEVtaXR0ZXIsXG4gICAgSW5wdXQsXG4gICAgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveSxcbiAgICBPdXRwdXQsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQgeyBBZ1Byb21pc2UsIENvbXBvbmVudFV0aWwsIEdyaWQsIEdyaWRPcHRpb25zLCBHcmlkUGFyYW1zLCBNb2R1bGUgfSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcblxuLy8gQFNUQVJUX0lNUE9SVFNAXG5pbXBvcnQge1xuICAgIEFnQ2hhcnRUaGVtZSxcbiAgICBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMsXG4gICAgQXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkLFxuICAgIEJvZHlTY3JvbGxFbmRFdmVudCxcbiAgICBCb2R5U2Nyb2xsRXZlbnQsXG4gICAgQ2VsbENsaWNrZWRFdmVudCxcbiAgICBDZWxsQ29udGV4dE1lbnVFdmVudCxcbiAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxFZGl0UmVxdWVzdEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIENlbGxGb2N1c2VkRXZlbnQsXG4gICAgQ2VsbEtleURvd25FdmVudCxcbiAgICBDZWxsS2V5UHJlc3NFdmVudCxcbiAgICBDZWxsTW91c2VEb3duRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3V0RXZlbnQsXG4gICAgQ2VsbE1vdXNlT3ZlckV2ZW50LFxuICAgIENlbGxQb3NpdGlvbixcbiAgICBDZWxsVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ2hhcnRDcmVhdGVkLFxuICAgIENoYXJ0RGVzdHJveWVkLFxuICAgIENoYXJ0T3B0aW9uc0NoYW5nZWQsXG4gICAgQ2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQsXG4gICAgQ2hhcnRSZWZQYXJhbXMsXG4gICAgQ2hhcnRUb29sUGFuZWxzRGVmLFxuICAgIENvbERlZixcbiAgICBDb2xHcm91cERlZixcbiAgICBDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtbkFwaSxcbiAgICBDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtbkdyb3VwT3BlbmVkRXZlbnQsXG4gICAgQ29sdW1uTW92ZWRFdmVudCxcbiAgICBDb2x1bW5QaW5uZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uUmVzaXplZEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZpc2libGVFdmVudCxcbiAgICBDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudCxcbiAgICBDc3ZFeHBvcnRQYXJhbXMsXG4gICAgRGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBEb21MYXlvdXRUeXBlLFxuICAgIERyYWdTdGFydGVkRXZlbnQsXG4gICAgRHJhZ1N0b3BwZWRFdmVudCxcbiAgICBFeGNlbEV4cG9ydFBhcmFtcyxcbiAgICBFeGNlbFN0eWxlLFxuICAgIEV4cGFuZENvbGxhcHNlQWxsRXZlbnQsXG4gICAgRmlsbE9wZXJhdGlvblBhcmFtcyxcbiAgICBGaWx0ZXJDaGFuZ2VkRXZlbnQsXG4gICAgRmlsdGVyTW9kaWZpZWRFdmVudCxcbiAgICBGaWx0ZXJPcGVuZWRFdmVudCxcbiAgICBGaXJzdERhdGFSZW5kZXJlZEV2ZW50LFxuICAgIEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQsXG4gICAgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnQsXG4gICAgR2V0Q2hhcnRUb29sYmFySXRlbXMsXG4gICAgR2V0Q29udGV4dE1lbnVJdGVtcyxcbiAgICBHZXREYXRhUGF0aCxcbiAgICBHZXRHcm91cFJvd0FnZ1BhcmFtcyxcbiAgICBHZXRMb2NhbGVUZXh0UGFyYW1zLFxuICAgIEdldE1haW5NZW51SXRlbXMsXG4gICAgR2V0Um93SWRGdW5jLFxuICAgIEdldFJvd05vZGVJZEZ1bmMsXG4gICAgR2V0U2VydmVyU2lkZUdyb3VwS2V5LFxuICAgIEdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zUGFyYW1zLFxuICAgIEdyaWRBcGksXG4gICAgR3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgR3JpZFJlYWR5RXZlbnQsXG4gICAgR3JpZFNpemVDaGFuZ2VkRXZlbnQsXG4gICAgSGVhZGVyUG9zaXRpb24sXG4gICAgSUFnZ0Z1bmMsXG4gICAgSURhdGFzb3VyY2UsXG4gICAgSVJvd0RyYWdJdGVtLFxuICAgIElSb3dOb2RlLFxuICAgIElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSxcbiAgICBJVmlld3BvcnREYXRhc291cmNlLFxuICAgIEluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvclBhcmFtcyxcbiAgICBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uLFxuICAgIElzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50UGFyYW1zLFxuICAgIElzRnVsbFdpZHRoUm93UGFyYW1zLFxuICAgIElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIElzUm93RmlsdGVyYWJsZSxcbiAgICBJc1Jvd01hc3RlcixcbiAgICBJc1Jvd1NlbGVjdGFibGUsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXAsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIExvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMsXG4gICAgTW9kZWxVcGRhdGVkRXZlbnQsXG4gICAgTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zLFxuICAgIE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIE5ld0NvbHVtbnNMb2FkZWRFdmVudCxcbiAgICBQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXMsXG4gICAgUGFzdGVFbmRFdmVudCxcbiAgICBQYXN0ZVN0YXJ0RXZlbnQsXG4gICAgUGlubmVkUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zLFxuICAgIFBvc3RTb3J0Um93c1BhcmFtcyxcbiAgICBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXMsXG4gICAgUHJvY2Vzc0dyb3VwSGVhZGVyRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc1Jvd1BhcmFtcyxcbiAgICBSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dDbGFzc1J1bGVzLFxuICAgIFJvd0NsaWNrZWRFdmVudCxcbiAgICBSb3dEYXRhQ2hhbmdlZEV2ZW50LFxuICAgIFJvd0RhdGFVcGRhdGVkRXZlbnQsXG4gICAgUm93RG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIFJvd0RyYWdFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgUm93R3JvdXBPcGVuZWRFdmVudCxcbiAgICBSb3dHcm91cGluZ0Rpc3BsYXlUeXBlLFxuICAgIFJvd0hlaWdodFBhcmFtcyxcbiAgICBSb3dNb2RlbFR5cGUsXG4gICAgUm93U2VsZWN0ZWRFdmVudCxcbiAgICBSb3dTdHlsZSxcbiAgICBSb3dWYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgU2VuZFRvQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zLFxuICAgIFNlcnZlclNpZGVTdG9yZVR5cGUsXG4gICAgU2lkZUJhckRlZixcbiAgICBTb3J0Q2hhbmdlZEV2ZW50LFxuICAgIFNvcnREaXJlY3Rpb24sXG4gICAgU3RhdHVzUGFuZWxEZWYsXG4gICAgVGFiVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBUYWJUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgVG9vbFBhbmVsU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50LFxuICAgIFRyZWVEYXRhRGlzcGxheVR5cGUsXG4gICAgVmlld3BvcnRDaGFuZ2VkRXZlbnQsXG4gICAgVmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgVmlydHVhbFJvd1JlbW92ZWRFdmVudFxufSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcbi8vIEBFTkRfSU1QT1JUU0BcblxuaW1wb3J0IHsgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyB9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXNcIjtcbmltcG9ydCB7IEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyIH0gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcIjtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdhZy1ncmlkLWFuZ3VsYXInLFxuICAgIHRlbXBsYXRlOiAnJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICBdLFxuICAgIC8vIHRlbGwgYW5ndWxhciB3ZSBkb24ndCB3YW50IHZpZXcgZW5jYXBzdWxhdGlvbiwgd2UgZG9uJ3Qgd2FudCBhIHNoYWRvdyByb290XG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRBbmd1bGFyPFREYXRhID0gYW55LCBUQ29sRGVmIGV4dGVuZHMgQ29sRGVmPFREYXRhPiA9IENvbERlZjxhbnk+PiBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgICAvLyBub3QgaW50ZW5kZWQgZm9yIHVzZXIgdG8gaW50ZXJhY3Qgd2l0aC4gc28gcHV0dGluZyBfIGluIHNvIGlmIHVzZXIgZ2V0cyByZWZlcmVuY2VcbiAgICAvLyB0byB0aGlzIG9iamVjdCwgdGhleSBraW5kJ2Ega25vdyBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBhZ3JlZWQgaW50ZXJmYWNlXG4gICAgcHJpdmF0ZSBfbmF0aXZlRWxlbWVudDogYW55O1xuICAgIHByaXZhdGUgX2luaXRpYWxpc2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGdyaWRQYXJhbXM6IEdyaWRQYXJhbXM7XG5cbiAgICAvLyBpbiBvcmRlciB0byBlbnN1cmUgZmlyaW5nIG9mIGdyaWRSZWFkeSBpcyBkZXRlcm1pbmlzdGljXG4gICAgcHJpdmF0ZSBfZnVsbHlSZWFkeTogQWdQcm9taXNlPGJvb2xlYW4+ID0gQWdQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAvLyBtYWtpbmcgdGhlc2UgcHVibGljLCBzbyB0aGV5IGFyZSBhY2Nlc3NpYmxlIHRvIHBlb3BsZSB1c2luZyB0aGUgbmcyIGNvbXBvbmVudCByZWZlcmVuY2VzXG4gICAgcHVibGljIGFwaTogR3JpZEFwaTxURGF0YT47XG4gICAgcHVibGljIGNvbHVtbkFwaTogQ29sdW1uQXBpO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudERlZjogRWxlbWVudFJlZixcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICBwcml2YXRlIGFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXM6IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIHByaXZhdGUgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIsXG4gICAgICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpIHtcbiAgICAgICAgdGhpcy5fbmF0aXZlRWxlbWVudCA9IGVsZW1lbnREZWYubmF0aXZlRWxlbWVudDtcblxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldFZpZXdDb250YWluZXJSZWYodGhpcy52aWV3Q29udGFpbmVyUmVmKTtcbiAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcih0aGlzLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgIHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5zZXRFbWl0dGVyVXNlZENhbGxiYWNrKHRoaXMuaXNFbWl0dGVyVXNlZC5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgdGhpcy5ncmlkT3B0aW9ucyA9IENvbXBvbmVudFV0aWwuY29weUF0dHJpYnV0ZXNUb0dyaWRPcHRpb25zKHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuZ3JpZFBhcmFtcyA9IHtcbiAgICAgICAgICAgIGdsb2JhbEV2ZW50TGlzdGVuZXI6IHRoaXMuZ2xvYmFsRXZlbnRMaXN0ZW5lci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZnJhbWV3b3JrT3ZlcnJpZGVzOiB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICBwcm92aWRlZEJlYW5JbnN0YW5jZXM6IHtcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2R1bGVzOiAodGhpcy5tb2R1bGVzIHx8IFtdKSBhcyBhbnlcbiAgICAgICAgfTtcblxuICAgICAgICBuZXcgR3JpZCh0aGlzLl9uYXRpdmVFbGVtZW50LCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmdyaWRQYXJhbXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmFwaSkge1xuICAgICAgICAgICAgdGhpcy5hcGkgPSB0aGlzLmdyaWRPcHRpb25zLmFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaSkge1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5BcGkgPSB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBzb21ldGltZXMsIGVzcGVjaWFsbHkgaW4gbGFyZ2UgY2xpZW50IGFwcHMgZ3JpZFJlYWR5IGNhbiBmaXJlIGJlZm9yZSBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhpcyB0aWVzIHRoZXNlIHRvZ2V0aGVyIHNvIHRoYXQgZ3JpZFJlYWR5IHdpbGwgYWx3YXlzIGZpcmUgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGUgYWN0dWFsIGNvbnRhaW5pbmcgY29tcG9uZW50J3MgbmdBZnRlclZpZXdJbml0IHdpbGwgZmlyZSBqdXN0IGFmdGVyIGFnR3JpZEFuZ3VsYXInc1xuICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnJlc29sdmVOb3cobnVsbCwgcmVzb2x2ZSA9PiByZXNvbHZlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgIENvbXBvbmVudFV0aWwucHJvY2Vzc09uQ2hhbmdlKGNoYW5nZXMsIHRoaXMuYXBpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIHRoZSBkZXN0cm95LCBzbyB3ZSBrbm93IG5vdCB0byBlbWl0IGFueSBldmVudHNcbiAgICAgICAgICAgIC8vIHdoaWxlIHRlYXJpbmcgZG93biB0aGUgZ3JpZC5cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5hcGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwaS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSdsbCBlbWl0IHRoZSBlbWl0IGlmIGEgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGEgZ2l2ZW4gZXZlbnQgZWl0aGVyIG9uIHRoZSBjb21wb25lbnQgdmlhIG5vcm1hbCBhbmd1bGFyIGJpbmRpbmdcbiAgICAvLyBvciB2aWEgZ3JpZE9wdGlvbnNcbiAgICBwcm90ZWN0ZWQgaXNFbWl0dGVyVXNlZChldmVudFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGNvbnN0IGhhc0VtaXR0ZXIgPSAhIWVtaXR0ZXIgJiYgZW1pdHRlci5vYnNlcnZlcnMgJiYgZW1pdHRlci5vYnNlcnZlcnMubGVuZ3RoID4gMDtcblxuICAgICAgICAvLyBncmlkUmVhZHkgPT4gb25HcmlkUmVhZHlcbiAgICAgICAgY29uc3QgYXNFdmVudE5hbWUgPSBgb24ke2V2ZW50VHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKX0ke2V2ZW50VHlwZS5zdWJzdHJpbmcoMSl9YFxuICAgICAgICBjb25zdCBoYXNHcmlkT3B0aW9uTGlzdGVuZXIgPSAhIXRoaXMuZ3JpZE9wdGlvbnMgJiYgISF0aGlzLmdyaWRPcHRpb25zW2FzRXZlbnROYW1lXTtcblxuICAgICAgICByZXR1cm4gaGFzRW1pdHRlciB8fCBoYXNHcmlkT3B0aW9uTGlzdGVuZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSB0ZWFyaW5nIGRvd24sIGRvbid0IGVtaXQgYW5ndWxhciBldmVudHMsIGFzIHRoaXMgY2F1c2VzXG4gICAgICAgIC8vIHByb2JsZW1zIHdpdGggdGhlIGFuZ3VsYXIgcm91dGVyXG4gICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdlbmVyaWNhbGx5IGxvb2sgdXAgdGhlIGV2ZW50VHlwZVxuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGlmIChlbWl0dGVyICYmIHRoaXMuaXNFbWl0dGVyVXNlZChldmVudFR5cGUpKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09PSAnZ3JpZFJlYWR5Jykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgZ3JpZFJlYWR5LCB3YWl0IGZvciBuZ0FmdGVyVmlld0luaXQgdG8gZmlyZSBmaXJzdCwgdGhlbiBlbWl0IHRoZVxuICAgICAgICAgICAgICAgIC8vIGdyaWRSZWFkeSBldmVudFxuICAgICAgICAgICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkudGhlbigocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAgQElucHV0KCkgcHVibGljIGdyaWRPcHRpb25zOiBHcmlkT3B0aW9uczxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgIEBJbnB1dCgpIHB1YmxpYyBtb2R1bGVzOiBNb2R1bGVbXSB8IHVuZGVmaW5lZDtcblxuICAgIC8vIEBTVEFSVEBcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBzdGF0dXMgYmFyIGNvbXBvbmVudHMgdG8gdXNlIGluIHRoZSBzdGF0dXMgYmFyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3RhdHVzQmFyOiB7IHN0YXR1c1BhbmVsczogU3RhdHVzUGFuZWxEZWZbXTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBzaWRlIGJhciBjb21wb25lbnRzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2lkZUJhcjogU2lkZUJhckRlZiB8IHN0cmluZyB8IHN0cmluZ1tdIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IHNob3cgdGhlIGNvbnRleHQgbWVudS4gVXNlIGlmIHlvdSBkb24ndCB3YW50IHRvIHVzZSB0aGUgZGVmYXVsdCAncmlnaHQgY2xpY2snIGNvbnRleHQgbWVudS4gRGVmYXVsdDogYGZhbHNlYCAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgYHN1cHByZXNzQ29udGV4dE1lbnVgLCB5b3UgY2FuIHVzZSB0aGUgYG9uQ2VsbENvbnRleHRNZW51YCBmdW5jdGlvbiB0byBwcm92aWRlIHlvdXIgb3duIGNvZGUgdG8gaGFuZGxlIGNlbGwgYGNvbnRleHRtZW51YCBldmVudHMuXG4gICAgICAgICAqIFRoaXMgZmxhZyBpcyB1c2VmdWwgdG8gcHJldmVudCB0aGUgYnJvd3NlciBmcm9tIHNob3dpbmcgaXRzIGRlZmF1bHQgY29udGV4dCBtZW51LlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcmV2ZW50RGVmYXVsdE9uQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjb250ZXh0IG1lbnUgdG8gc2hvdywgZXZlbiB3aGVuIGBDdHJsYCBrZXkgaXMgaGVsZCBkb3duLiBEZWZhdWx0OiBgZmFsc2VgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSBjb2x1bW4gbWVudSBidXR0b24sIHJhdGhlciB0aGFuIG9ubHkgc2hvd2luZyB3aGVuIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHVzZSB0aGUgYnJvd3NlcidzIGRlZmF1bHQgdG9vbHRpcCBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBncmlkJ3MgVG9vbHRpcCBDb21wb25lbnQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgdGhhdCBpdCB0YWtlcyBmb3IgdG9vbHRpcHMgdG8gc2hvdyB1cCBvbmNlIGFuIGVsZW1lbnQgaXMgaG92ZXJlZCBvdmVyLlxuICAgICAgICAgKiAgICAgKipOb3RlOioqIFRoaXMgcHJvcGVydHkgZG9lcyBub3Qgd29yayBpZiBgZW5hYmxlQnJvd3NlclRvb2x0aXBzYCBpcyBgdHJ1ZWAuXG4gICAgICAgICAqIERlZmF1bHQ6IGAyMDAwYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFNob3dEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIHRoYXQgaXQgdGFrZXMgZm9yIHRvb2x0aXBzIHRvIGhpZGUgb25jZSB0aGV5IGhhdmUgYmVlbiBkaXNwbGF5ZWQuXG4gICAgICAgICAqICAgICAqKk5vdGU6KiogVGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCB3b3JrIGlmIGBlbmFibGVCcm93c2VyVG9vbHRpcHNgIGlzIGB0cnVlYC5cbiAgICAgICAgICogRGVmYXVsdDogYDEwMDAwYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcEhpZGVEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdG9vbHRpcHMgZm9sbG93IHRoZSBjdXJzb3Igb25jZSB0aGV5IGFyZSBkaXNwbGF5ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwTW91c2VUcmFjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRE9NIGVsZW1lbnQgdG8gdXNlIGFzIHRoZSBwb3B1cCBwYXJlbnQgZm9yIGdyaWQgcG9wdXBzIChjb250ZXh0IG1lbnUsIGNvbHVtbiBtZW51IGV0YykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3B1cFBhcmVudDogSFRNTEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsc28gaW5jbHVkZSBoZWFkZXJzIHdoZW4gY29weWluZyB0byBjbGlwYm9hcmQgdXNpbmcgYEN0cmwgKyBDYCBjbGlwYm9hcmQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxzbyBpbmNsdWRlIGdyb3VwIGhlYWRlcnMgd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZCB1c2luZyBgQ3RybCArIENgIGNsaXBib2FyZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUdyb3VwSGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZ5IHRoZSBkZWxpbWl0ZXIgdG8gdXNlIHdoZW4gY29weWluZyB0byBjbGlwYm9hcmQuXG4gICAgICAgICAqIERlZmF1bHQ6IGBcXHRgXG4gICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNsaXBib2FyZERlbGltaXRlcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvcHkgdGhlIGNlbGwgcmFuZ2Ugb3IgZm9jdXNlZCBjZWxsIHRvIHRoZSBjbGlwYm9hcmQgYW5kIG5ldmVyIHRoZSBzZWxlY3RlZCByb3dzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29weSByb3dzIGluc3RlYWQgb2YgcmFuZ2VzIHdoZW4gYSByYW5nZSB3aXRoIG9ubHkgYSBzaW5nbGUgY2VsbCBpcyBzZWxlY3RlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb3B5U2luZ2xlQ2VsbFJhbmdlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB3b3JrIGFyb3VuZCBhIGJ1ZyB3aXRoIEV4Y2VsIChXaW5kb3dzKSB0aGF0IGFkZHMgYW4gZXh0cmEgZW1wdHkgbGluZSBhdCB0aGUgZW5kIG9mIHJhbmdlcyBjb3BpZWQgdG8gdGhlIGNsaXBib2FyZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMYXN0RW1wdHlMaW5lT25QYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB0dXJuIG9mZiBwYXN0ZSBvcGVyYXRpb25zIHdpdGhpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3RvcCB0aGUgZ3JpZCB0cnlpbmcgdG8gdXNlIHRoZSBDbGlwYm9hcmQgQVBJLCBpZiBpdCBpcyBibG9ja2VkLCBhbmQgaW1tZWRpYXRlbHkgZmFsbGJhY2sgdG8gdGhlIHdvcmthcm91bmQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZEFwaTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXJyYXkgb2YgQ29sdW1uIC8gQ29sdW1uIEdyb3VwIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uRGVmczogKFRDb2xEZWYgfCBDb2xHcm91cERlZjxURGF0YT4pW10gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29sdW1uIGRlZmluaXRpb24uIEl0ZW1zIGRlZmluZWQgaW4gdGhlIGFjdHVhbCBjb2x1bW4gZGVmaW5pdGlvbnMgZ2V0IHByZWNlZGVuY2UuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sRGVmOiBDb2xEZWY8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29sdW1uIGdyb3VwIGRlZmluaXRpb24uIEFsbCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbnMgd2lsbCB1c2UgdGhlc2UgcHJvcGVydGllcy4gSXRlbXMgZGVmaW5lZCBpbiB0aGUgYWN0dWFsIGNvbHVtbiBncm91cCBkZWZpbml0aW9uIGdldCBwcmVjZWRlbmNlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbEdyb3VwRGVmOiBQYXJ0aWFsPENvbEdyb3VwRGVmPFREYXRhPj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBtYXAgb2YgY3VzdG9tIGNvbHVtbiB0eXBlcyB3aGljaCBjb250YWluIGdyb3VwcyBvZiBwcm9wZXJ0aWVzIHRoYXQgY29sdW1uIGRlZmluaXRpb25zIGNhbiBpbmhlcml0IGJ5IHJlZmVyZW5jaW5nIGluIHRoZWlyIGB0eXBlYCBwcm9wZXJ0eS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtblR5cGVzOiB7IFtrZXk6IHN0cmluZ106IENvbERlZjxURGF0YT47IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEtlZXBzIHRoZSBvcmRlciBvZiBDb2x1bW5zIG1haW50YWluZWQgYWZ0ZXIgbmV3IENvbHVtbiBEZWZpbml0aW9ucyBhcmUgdXBkYXRlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGVuIGRvdHMgaW4gZmllbGQgbmFtZXMgKGUuZy4gYCdhZGRyZXNzLmZpcnN0TGluZSdgKSBhcmUgbm90IHRyZWF0ZWQgYXMgZGVlcCByZWZlcmVuY2VzLiBBbGxvd3MgeW91IHRvIHVzZSBkb3RzIGluIHlvdXIgZmllbGQgbmFtZSBpZiB5b3UgcHJlZmVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpZWxkRG90Tm90YXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGNvbHVtbiBsYWJlbCBoZWFkZXIuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgdGhlIHRoZW1lIHZhbHVlIG9mIGBoZWFkZXItaGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvd3MgY29udGFpbmluZyBoZWFkZXIgY29sdW1uIGdyb3Vwcy4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyBgaGVhZGVySGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGZsb2F0aW5nIGZpbHRlcnMuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgdGhlIHRoZW1lIHZhbHVlIG9mIGBoZWFkZXItaGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBjb2x1bW5zIHdoZW4gaW4gcGl2b3QgbW9kZS4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyBgaGVhZGVySGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90SGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgaGVhZGVyIGNvbHVtbiBncm91cHMgd2hlbiBpbiBwaXZvdCBtb2RlLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBncm91cEhlYWRlckhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEdyb3VwSGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93IHJlb3JkZXJpbmcgYW5kIHBpbm5pbmcgY29sdW1ucyBieSBkcmFnZ2luZyBjb2x1bW5zIGZyb20gdGhlIENvbHVtbnMgVG9vbCBQYW5lbCB0byB0aGUgZ3JpZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3MgY29sdW1uIG1vdmluZywgaS5lLiB0byBtYWtlIHRoZSBjb2x1bW5zIGZpeGVkIHBvc2l0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGVDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZSBgYWctY29sdW1uLW1vdmluZ2AgY2xhc3MgaXMgbm90IGFkZGVkIHRvIHRoZSBncmlkIHdoaWxlIGNvbHVtbnMgYXJlIG1vdmluZy4gSW4gdGhlIGRlZmF1bHQgdGhlbWVzLCB0aGlzIHJlc3VsdHMgaW4gbm8gYW5pbWF0aW9uIHdoZW4gbW92aW5nIGNvbHVtbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uTW92ZUFuaW1hdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB3aGVuIHlvdSBkcmFnIGEgY29sdW1uIG91dCBvZiB0aGUgZ3JpZCAoZS5nLiB0byB0aGUgZ3JvdXAgem9uZSkgdGhlIGNvbHVtbiBpcyBub3QgaGlkZGVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB3aGVuIHlvdSBkcmFnIGEgY29sdW1uIGludG8gYSByb3cgZ3JvdXAgcGFuZWwgdGhlIGNvbHVtbiBpcyBub3QgaGlkZGVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0dyb3VwSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdzaGlmdCdgIHRvIGhhdmUgc2hpZnQtcmVzaXplIGFzIHRoZSBkZWZhdWx0IHJlc2l6ZSBvcGVyYXRpb24gKHNhbWUgYXMgdXNlciBob2xkaW5nIGRvd24gYFNoaWZ0YCB3aGlsZSByZXNpemluZykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xSZXNpemVEZWZhdWx0OiAnc2hpZnQnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTdXBwcmVzc2VzIGF1dG8tc2l6aW5nIGNvbHVtbnMgZm9yIGNvbHVtbnMuIEluIG90aGVyIHdvcmRzLCBkb3VibGUgY2xpY2tpbmcgYSBjb2x1bW4ncyBoZWFkZXIncyBlZGdlIHdpbGwgbm90IGF1dG8tc2l6ZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogTnVtYmVyIG9mIHBpeGVscyB0byBhZGQgdG8gYSBjb2x1bW4gd2lkdGggYWZ0ZXIgdGhlIFthdXRvLXNpemluZ10oL2NvbHVtbi1zaXppbmcvI2F1dG8tc2l6ZS1jb2x1bW5zKSBjYWxjdWxhdGlvbi5cbiAgICAgICAgICogU2V0IHRoaXMgaWYgeW91IHdhbnQgdG8gYWRkIGV4dHJhIHJvb20gdG8gYWNjb21tb2RhdGUgKGZvciBleGFtcGxlKSBzb3J0IGljb25zLCBvciBzb21lIG90aGVyIGR5bmFtaWMgbmF0dXJlIG9mIHRoZSBoZWFkZXIuXG4gICAgICAgICAqIERlZmF1bHQ6IGA0YFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVQYWRkaW5nOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBza2lwIHRoZSBgaGVhZGVyTmFtZWAgd2hlbiBgYXV0b1NpemVgIGlzIGNhbGxlZCBieSBkZWZhdWx0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2YgY29tcG9uZW50IG5hbWVzIHRvIGNvbXBvbmVudHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb21wb25lbnRzOiB7IFtwOiBzdHJpbmddOiBhbnk7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBjb21wb25lbnRzYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnJhbWV3b3JrQ29tcG9uZW50czogeyBbcDogc3RyaW5nXTogeyBuZXcoKTogYW55OyB9OyB9IHwgYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdmdWxsUm93J2AgdG8gZW5hYmxlIEZ1bGwgUm93IEVkaXRpbmcuIE90aGVyd2lzZSBsZWF2ZSBibGFuayB0byBlZGl0IG9uZSBjZWxsIGF0IGEgdGltZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVkaXRUeXBlOiAnZnVsbFJvdycgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFNpbmdsZSBDbGljayBFZGl0aW5nIGZvciBjZWxscywgdG8gc3RhcnQgZWRpdGluZyB3aXRoIGEgc2luZ2xlIGNsaWNrLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCBuZWl0aGVyIHNpbmdsZSBub3IgZG91YmxlIGNsaWNrIHN0YXJ0cyBlZGl0aW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyBzdG9wIHRoZSBncmlkIHVwZGF0aW5nIGRhdGEgYWZ0ZXIgYW5kIGVkaXQuIFdoZW4gdGhpcyBpcyBzZXQsIGl0IGlzIGludGVuZGVkIHRoZSBhcHBsaWNhdGlvbiB3aWxsIHVwZGF0ZSB0aGUgZGF0YSwgZWcgaW4gYW4gZXh0ZXJuYWwgaW1tdXRhYmxlIHN0b3JlLCBhbmQgdGhlbiBwYXNzIHRoZSBuZXcgZGF0YXNldCB0byB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlYWRPbmx5RWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHN0b3AgY2VsbCBlZGl0aW5nIHdoZW4gZ3JpZCBsb3NlcyBmb2N1cy5cbiAgICAgICAgICogVGhlIGRlZmF1bHQgaXMgdGhhdCB0aGUgZ3JpZCBzdGF5cyBlZGl0aW5nIHVudGlsIGZvY3VzIGdvZXMgb250byBhbm90aGVyIGNlbGwuXG4gICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0b3BFZGl0aW5nV2hlbkNlbGxzTG9zZUZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGFsb25nIHdpdGggYGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0YCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlIGBFbnRlcmAga2V5LlxuICAgICAgICAgKiBpLmUuIHByZXNzaW5nIHRoZSBgRW50ZXJgIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck1vdmVzRG93bmAgdG8gaGF2ZSBFeGNlbC1zdHlsZSBiZWhhdmlvdXIgZm9yIHRoZSAnRW50ZXInIGtleS5cbiAgICAgICAgICogaS5lLiBwcmVzc2luZyB0aGUgRW50ZXIga2V5IHdpbGwgbW92ZSBkb3duIHRvIHRoZSBjZWxsIGJlbmVhdGguXG4gICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3JjZXMgQ2VsbCBFZGl0aW5nIHRvIHN0YXJ0IHdoZW4gYmFja3NwYWNlIGlzIHByZXNzZWQuIFRoaXMgaXMgb25seSByZWxldmFudCBmb3IgTWFjT1MgdXNlcnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsRWRpdGluZ09uQmFja3NwYWNlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBVbmRvIC8gUmVkbyB3aGlsZSBlZGl0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBzaXplIG9mIHRoZSB1bmRvIC8gcmVkbyBzdGFjay4gRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZ0xpbWl0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGV4cG9ydCB0byBDU1YuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q3N2RXhwb3J0UGFyYW1zOiBDc3ZFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIHRoZSB1c2VyIGZyb20gZXhwb3J0aW5nIHRoZSBncmlkIHRvIENTVi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDc3ZFeHBvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGV4cG9ydCB0byBFeGNlbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRFeGNlbEV4cG9ydFBhcmFtczogRXhjZWxFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIHRoZSB1c2VyIGZyb20gZXhwb3J0aW5nIHRoZSBncmlkIHRvIEV4Y2VsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4Y2VsRXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGxpc3QgKGFycmF5KSBvZiBFeGNlbCBzdHlsZXMgdG8gYmUgdXNlZCB3aGVuIGV4cG9ydGluZyB0byBFeGNlbCB3aXRoIHN0eWxlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGV4Y2VsU3R5bGVzOiBFeGNlbFN0eWxlW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJvd3MgYXJlIGZpbHRlcmVkIHVzaW5nIHRoaXMgdGV4dCBhcyBhIHF1aWNrIGZpbHRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIHF1aWNrIGZpbHRlciBjYWNoZSwgdXNlZCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIHdoZW4gdXNpbmcgdGhlIHF1aWNrIGZpbHRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVRdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCB0cmVlIGRhdGEgZmlsdGVyaW5nIGJlaGF2aW91ciB0byBpbnN0ZWFkIGV4Y2x1ZGUgY2hpbGQgbm9kZXMgZnJvbSBmaWx0ZXIgcmVzdWx0cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIEVuYWJsZSBDaGFydHMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGxpc3Qgb2YgY2hhcnQgdGhlbWVzIHRvIGJlIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lczogc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIGNvbnRhaW5pbmcgY3VzdG9tIGNoYXJ0IHRoZW1lcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGN1c3RvbUNoYXJ0VGhlbWVzOiB7IFtuYW1lOiBzdHJpbmddOiBBZ0NoYXJ0VGhlbWUgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhcnQgdGhlbWUgb3ZlcnJpZGVzIGFwcGxpZWQgdG8gYWxsIHRoZW1lcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVPdmVycmlkZXM6IEFnQ2hhcnRUaGVtZU92ZXJyaWRlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI5LCBubyBsb25nZXIgdXNlZC4gVG8gc3VwcHJlc3MgdXNlIGBzdXBwcmVzc0NoYXJ0VG9vbFBhbmVsc0J1dHRvbmAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDaGFydFRvb2xQYW5lbHNCdXR0b246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc2hvdyB0aGUgJ2hhbWJ1cmdlcicgbWVudSBvcHRpb24gZnJvbSB0aGUgQ2hhcnQgVG9vbGJhciBhbmQgZGlzcGxheSB0aGUgcmVtYWluaW5nIHRvb2xiYXIgYnV0dG9ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDaGFydFRvb2xQYW5lbHNCdXR0b246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjdXN0b21pc2F0aW9uIG9mIHRoZSBDaGFydCBUb29sIFBhbmVscywgc3VjaCBhcyBjaGFuZ2luZyB0aGUgdG9vbCBwYW5lbHMgdmlzaWJpbGl0eSBhbmQgb3JkZXIsIGFzIHdlbGwgYXMgY2hvb3Npbmcgd2hpY2ggY2hhcnRzIHNob3VsZCBiZSBkaXNwbGF5ZWQgaW4gdGhlIHNldHRpbmdzIHBhbmVsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUb29sUGFuZWxzRGVmOiBDaGFydFRvb2xQYW5lbHNEZWYgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgeW91ciBvd24gbG9hZGluZyBjZWxsIHJlbmRlcmVyIHRvIHVzZSB3aGVuIGRhdGEgaXMgbG9hZGluZyB2aWEgYSBEYXRhU291cmNlLlxuICAgICAgICAqIFNlZSBbTG9hZGluZyBDZWxsIFJlbmRlcmVyXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtbG9hZGluZy1jZWxsLXJlbmRlcmVyLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQYXJhbXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBgbG9hZGluZ0NlbGxSZW5kZXJlcmAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggbG9hZGluZyBjZWxsIHJlbmRlcmVyIHRvIGJlIHVzZWQgd2hlbiBkYXRhIGlzIGxvYWRpbmcgdmlhIGEgRGF0YVNvdXJjZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvcjogTG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yRnVuYzxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIG9mIGtleS0+dmFsdWUgcGFpcnMgZm9yIGxvY2FsaXNpbmcgdGV4dCB3aXRoaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGVUZXh0OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBNYXN0ZXIgRGV0YWlsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXN0ZXJEZXRhaWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8ga2VlcCBkZXRhaWwgcm93cyBmb3Igd2hlbiB0aGV5IGFyZSBkaXNwbGF5ZWQgYWdhaW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXRzIHRoZSBudW1iZXIgb2YgZGV0YWlscyByb3dzIHRvIGtlZXAuIERlZmF1bHQ6IGAxMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzQ291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBgZGV0YWlsQ2VsbFJlbmRlcmVyYCB0byB1c2Ugd2hlbiBhIG1hc3RlciByb3cgaXMgZXhwYW5kZWQuXG4gICAgICAgICogU2VlIFtEZXRhaWwgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvbWFzdGVyLWRldGFpbC1jdXN0b20tZGV0YWlsLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGRldGFpbENlbGxSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZpZXMgdGhlIHBhcmFtcyB0byBiZSB1c2VkIGJ5IHRoZSBEZXRhaWwgQ2VsbCBSZW5kZXJlci4gQ2FuIGFsc28gYmUgYSBmdW5jdGlvbiB0aGF0IHByb3ZpZGVzIHRoZSBwYXJhbXMgdG8gZW5hYmxlIGR5bmFtaWMgZGVmaW5pdGlvbnMgb2YgdGhlIHBhcmFtcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgZml4ZWQgaGVpZ2h0IGluIHBpeGVscyBmb3IgZWFjaCBkZXRhaWwgcm93LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsUm93SGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgZGV0YWlsIGdyaWQgZHluYW1pY2FsbHkgY2hhbmdlIGl0J3MgaGVpZ2h0IHRvIGZpdCBpdCdzIHJvd3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dBdXRvSGVpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlcyBhIGNvbnRleHQgb2JqZWN0IHRoYXQgaXMgcHJvdmlkZWQgdG8gZGlmZmVyZW50IGNhbGxiYWNrcyB0aGUgZ3JpZCB1c2VzLiBVc2VkIGZvciBwYXNzaW5nIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gdG8gdGhlIGNhbGxiYWNrcyBieSB5b3VyIGFwcGxpY2F0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29udGV4dDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGxpc3Qgb2YgZ3JpZHMgdG8gdHJlYXQgYXMgQWxpZ25lZCBHcmlkcy4gSWYgZ3JpZHMgYXJlIGFsaWduZWQgdGhlbiB0aGUgY29sdW1ucyBhbmQgaG9yaXpvbnRhbCBzY3JvbGxpbmcgd2lsbCBiZSBrZXB0IGluIHN5bmMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGlnbmVkR3JpZHM6IHsgYXBpPzogR3JpZEFwaSB8IG51bGwsIGNvbHVtbkFwaT86IENvbHVtbkFwaSB8IG51bGwgfVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFuZ2UgdGhpcyB2YWx1ZSB0byBzZXQgdGhlIHRhYkluZGV4IG9yZGVyIG9mIHRoZSBHcmlkIHdpdGhpbiB5b3VyIGFwcGxpY2F0aW9uLiBEZWZhdWx0OiBgMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYkluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBudW1iZXIgb2Ygcm93cyByZW5kZXJlZCBvdXRzaWRlIHRoZSB2aWV3YWJsZSBhcmVhIHRoZSBncmlkIHJlbmRlcnMuXG4gICAgICAgICAqIEhhdmluZyBhIGJ1ZmZlciBtZWFucyB0aGUgZ3JpZCB3aWxsIGhhdmUgcm93cyByZWFkeSB0byBzaG93IGFzIHRoZSB1c2VyIHNsb3dseSBzY3JvbGxzIHZlcnRpY2FsbHkuXG4gICAgICAgICAqIERlZmF1bHQ6IGAxMGBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0J1ZmZlcjogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIHZhbHVlIGNhY2hlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbmZpZ3VyZSB0aGUgdmFsdWUgY2FjaGUgdG8gbm90IGV4cGlyZSBhZnRlciBkYXRhIHVwZGF0ZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlQ2FjaGVOZXZlckV4cGlyZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgY2VsbCBleHByZXNzaW9ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvdyBub2RlcyBkbyBub3QgaGF2ZSB0aGVpciBwYXJlbnRzIHNldC5cbiAgICAgICAgICogVGhlIGdyaWQgZG9lc24ndCB1c2UgdGhlIHBhcmVudCByZWZlcmVuY2UsIGJ1dCBpdCBpcyBpbmNsdWRlZCB0byBoZWxwIHRoZSBjbGllbnQgY29kZSBuYXZpZ2F0ZSB0aGUgbm9kZSB0cmVlIGlmIGl0IHdhbnRzIGJ5IHByb3ZpZGluZyBiaS1kaXJlY3Rpb24gbmF2aWdhdGlvbiB1cCBhbmQgZG93biB0aGUgdHJlZS5cbiAgICAgICAgICogSWYgdGhpcyBpcyBhIHByb2JsZW0gKGUuZy4gaWYgeW91IG5lZWQgdG8gY29udmVydCB0aGUgdHJlZSB0byBKU09OLCB3aGljaCBkb2VzIG5vdCBhbGxvdyBjeWNsaWMgZGVwZW5kZW5jaWVzKSB0aGVuIHNldCB0aGlzIHRvIGB0cnVlYC5cbiAgICAgICAgICogRGVmYXVsdDogYGZhbHNlYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXJlbnRzSW5Sb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdG91Y2ggc3VwcG9ydCAoYnV0IGRvZXMgbm90IHJlbW92ZSB0aGUgYnJvd3NlcidzIGVmZm9ydHMgdG8gc2ltdWxhdGUgbW91c2UgZXZlbnRzIG9uIHRvdWNoKS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NUb3VjaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBub3Qgc2V0IGZvY3VzIGJhY2sgb24gdGhlIGdyaWQgYWZ0ZXIgYSByZWZyZXNoLiBUaGlzIGNhbiBhdm9pZCBpc3N1ZXMgd2hlcmUgeW91IHdhbnQgdG8ga2VlcCB0aGUgZm9jdXMgb24gYW5vdGhlciBwYXJ0IG9mIHRoZSBicm93c2VyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgYXN5bmNocm9ub3VzIG5hdHVyZSBvZiB0aGUgZXZlbnRzIGludHJvZHVjZWQgaW4gdjEwLCBhbmQgbWFrZXMgdGhlbSBzeW5jaHJvbm91cy4gVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBmb3IgdGhlIHB1cnBvc2Ugb2Ygc3VwcG9ydGluZyBsZWdhY3kgY29kZSB3aGljaCBoYXMgYSBkZXBlbmRlbmN5IG9uIHN5bmNocm9ub3VzIGV2ZW50cyBmcm9tIGVhcmxpZXIgdmVyc2lvbnMgKHY5IG9yIGVhcmxpZXIpIG9mIEFHIEdyaWQuICAgICAqKkl0IGlzIHN0cm9uZ2x5IHJlY29tbWVuZGVkIHRoYXQgeW91IGRvIG5vdCBjaGFuZ2UgdGhpcyBwcm9wZXJ0eSB1bmxlc3MgeW91IGhhdmUgbGVnYWN5IGlzc3Vlcy4qKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FzeW5jRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZ3JpZCB3aWxsIGNoZWNrIGZvciBgUmVzaXplT2JzZXJ2ZXJgIGFuZCB1c2UgaXQgaWYgaXQgZXhpc3RzIGluIHRoZSBicm93c2VyLCBvdGhlcndpc2UgaXQgd2lsbCB1c2UgdGhlIGdyaWQncyBhbHRlcm5hdGl2ZSBpbXBsZW1lbnRhdGlvbi4gU29tZSB1c2VycyByZXBvcnRlZCBpc3N1ZXMgd2l0aCBDaHJvbWUncyBgUmVzaXplT2JzZXJ2ZXJgLiBVc2UgdGhpcyBwcm9wZXJ0eSB0byBhbHdheXMgdXNlIHRoZSBncmlkJ3MgYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb24gc2hvdWxkIHN1Y2ggcHJvYmxlbXMgZXhpc3QuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyBzaG93aW5nIGEgd2FybmluZyBtZXNzYWdlIGluIHRoZSBjb25zb2xlIGlmIHVzaW5nIGEgYGdyaWRPcHRpb25zYCBvciBgY29sRGVmYCBwcm9wZXJ0eSB0aGF0IGRvZXNuJ3QgZXhpc3QuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJvcGVydHlOYW1lc0NoZWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyBjaGFuZ2UgZGV0ZWN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NoYW5nZURldGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIGVuYWJsZSBkZWJ1ZyBpbmZvcm1hdGlvbiBmcm9tIHRoZSBncmlkIGFuZCByZWxhdGVkIGNvbXBvbmVudHMuIFdpbGwgcmVzdWx0IGluIGFkZGl0aW9uYWwgbG9nZ2luZyBiZWluZyBvdXRwdXQsIGJ1dCB2ZXJ5IHVzZWZ1bCB3aGVuIGludmVzdGlnYXRpbmcgcHJvYmxlbXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlYnVnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgdGVtcGxhdGUgZm9yICdsb2FkaW5nJyBvdmVybGF5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheUxvYWRpbmdUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGxvYWRpbmcgb3ZlcmxheSBjb21wb25lbnQuXG4gICAgICAgICogU2VlIFtMb2FkaW5nIE92ZXJsYXkgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtb3ZlcmxheS8jc2ltcGxlLWxvYWRpbmctb3ZlcmxheS1jb21wb25lbnQpIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGxvYWRpbmdPdmVybGF5Q29tcG9uZW50YCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlICdsb2FkaW5nJyBvdmVybGF5LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgdGVtcGxhdGUgZm9yICdubyByb3dzJyBvdmVybGF5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheU5vUm93c1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gbm8gcm93cyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgICAgKiBTZWUgW05vIFJvd3MgT3ZlcmxheSBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1vdmVybGF5LyNzaW1wbGUtbm8tcm93cy1vdmVybGF5LWNvbXBvbmVudCkgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBub1Jvd3NPdmVybGF5Q29tcG9uZW50YCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIG5vIHJvd3Mgb3ZlcmxheSBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSAnbm8gcm93cycgb3ZlcmxheS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOb1Jvd3NPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgd2hldGhlciBwYWdpbmF0aW9uIGlzIGVuYWJsZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJvd3MgdG8gbG9hZCBwZXIgcGFnZS4gSWYgYHBhZ2luYXRpb25BdXRvUGFnZVNpemVgIGlzIHNwZWNpZmllZCwgdGhpcyBwcm9wZXJ0eSBpcyBpZ25vcmVkLiBEZWZhdWx0OiBgMTAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvblBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgbnVtYmVyIG9mIHJvd3MgdG8gbG9hZCBwZXIgcGFnZSBpcyBhdXRvbWF0aWNhbGx5IGFkanVzdGVkIGJ5IHRoZSBncmlkIHNvIGVhY2ggcGFnZSBzaG93cyBlbm91Z2ggcm93cyB0byBqdXN0IGZpbGwgdGhlIGFyZWEgZGVzaWduYXRlZCBmb3IgdGhlIGdyaWQuIElmIGBmYWxzZWAsIGBwYWdpbmF0aW9uUGFnZVNpemVgIGlzIHVzZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBwYWdlcyBzcGxpdCBjaGlsZHJlbiBvZiBncm91cHMgd2hlbiB1c2luZyBSb3cgR3JvdXBpbmcgb3IgZGV0YWlsIHJvd3Mgd2l0aCBNYXN0ZXIgRGV0YWlsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0ZUNoaWxkUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgZGVmYXVsdCBncmlkIGNvbnRyb2xzIGZvciBuYXZpZ2F0aW9uIGFyZSBoaWRkZW4uXG4gICAgICAgICAqIFRoaXMgaXMgdXNlZnVsIGlmIGBwYWdpbmF0aW9uPXRydWVgIGFuZCB5b3Ugd2FudCB0byBwcm92aWRlIHlvdXIgb3duIHBhZ2luYXRpb24gY29udHJvbHMuXG4gICAgICAgICAqIE90aGVyd2lzZSwgd2hlbiBgcGFnaW5hdGlvbj10cnVlYCB0aGUgZ3JpZCBhdXRvbWF0aWNhbGx5IHNob3dzIHRoZSBuZWNlc3NhcnkgY29udHJvbHMgYXQgdGhlIGJvdHRvbSBzbyB0aGF0IHRoZSB1c2VyIGNhbiBuYXZpZ2F0ZSB0aHJvdWdoIHRoZSBkaWZmZXJlbnQgcGFnZXMuXG4gICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFnaW5hdGlvblBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBwaXZvdCBtb2RlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdE1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdG8gc2hvdyB0aGUgJ3Bpdm90IHBhbmVsJyAod2hlcmUgeW91IGRyYWcgcm93cyB0byBwaXZvdCkgYXQgdGhlIHRvcC4gTm90ZSB0aGF0IHRoZSBwaXZvdCBwYW5lbCB3aWxsIG5ldmVyIHNob3cgaWYgYHBpdm90TW9kZWAgaXMgb2ZmLiBEZWZhdWx0OiBgbmV2ZXJgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFBhbmVsU2hvdzogJ2Fsd2F5cycgfCAnb25seVdoZW5QaXZvdGluZycgfCAnbmV2ZXInIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciB3aXRoaW4gdGhlIFBpdm90IENvbHVtbiBHcm91cHMsIGluIHRoZSBwb3NpdGlvbiBzcGVjaWZpZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbHVtbkdyb3VwVG90YWxzOiAnYmVmb3JlJyB8ICdhZnRlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gc2V0IGFuZCB0aGUgZ3JpZCBpcyBpbiBwaXZvdCBtb2RlLCBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgdG90YWxzIHdpbGwgYXBwZWFyIGZvciBlYWNoIHZhbHVlIGNvbHVtbiBpbiB0aGUgcG9zaXRpb24gc3BlY2lmaWVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RSb3dUb3RhbHM6ICdiZWZvcmUnIHwgJ2FmdGVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzd2FwIGluIHRoZSBncm91cGluZyBjb2x1bW4gd2hlbiBwaXZvdGluZy4gVXNlZnVsIGlmIHBpdm90aW5nIHVzaW5nIFNlcnZlciBTaWRlIFJvdyBNb2RlbCBvciBWaWV3cG9ydCBSb3cgTW9kZWwgYW5kIHlvdSB3YW50IGZ1bGwgY29udHJvbCBvZiBhbGwgY29sdW1ucyBpbmNsdWRpbmcgdGhlIGdyb3VwIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgcGl2b3QgY29sdW1uIGdyb3VwcyB3aWxsIGFwcGVhciAnZml4ZWQnLCB3aXRob3V0IHRoZSBhYmlsaXR5IHRvIGV4cGFuZCBhbmQgY29sbGFwc2UgdGhlIGNvbHVtbiBncm91cHMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhwYW5kYWJsZVBpdm90R3JvdXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZW4gcm93IGdyb3VwLCBwaXZvdCBhbmQgdmFsdWUgYWdncmVnYXRpb24gd2lsbCBiZSByZWFkLW9ubHkgZnJvbSB0aGUgR1VJLiBUaGUgZ3JpZCB3aWxsIGRpc3BsYXkgd2hhdCB2YWx1ZXMgYXJlIHVzZWQgZm9yIGVhY2gsIGJ1dCB3aWxsIG5vdCBhbGxvdyB0aGUgdXNlciB0byBjaGFuZ2UgdGhlIHNlbGVjdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIG9mICdmdW5jdGlvbiBuYW1lJyB0byAnZnVuY3Rpb24nIGZvciBjdXN0b20gYWdncmVnYXRpb24gZnVuY3Rpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuY3M6IHsgW2tleTogc3RyaW5nXTogSUFnZ0Z1bmM8VERhdGE+OyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgY29sdW1uIGhlYWRlcnMgd29uJ3QgaW5jbHVkZSB0aGUgYGFnZ0Z1bmNgIG5hbWUsIGUuZy4gYCdzdW0oQmFuayBCYWxhbmNlKWAnIHdpbGwganVzdCBiZSBgJ0JhbmsgQmFsYW5jZSdgLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBhZ2dyZWdhdGlvbnMgd29uJ3QgYmUgY29tcHV0ZWQgZm9yIHRoZSByb290IG5vZGUgb2YgdGhlIGdyaWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnQXRSb290TGV2ZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgY2hhbmdlIGRldGVjdGlvbiwgb25seSB0aGUgdXBkYXRlZCBjb2x1bW4gd2lsbCBiZSByZS1hZ2dyZWdhdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCBhZ2dyZWdhdGlvbnMgYXJlIG5vdCBpbXBhY3RlZCBieSBmaWx0ZXJpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG9taXQgdGhlIHZhbHVlIENvbHVtbiBoZWFkZXIgd2hlbiB0aGVyZSBpcyBvbmx5IGEgc2luZ2xlIHZhbHVlIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVtb3ZlUGl2b3RIZWFkZXJSb3dXaGVuU2luZ2xlVmFsdWVDb2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFJvdyBBbmltYXRpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFuaW1hdGVSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgY2VsbHMgZmxhc2ggYWZ0ZXIgZGF0YSBjaGFuZ2VzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRvIGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBgZW5hYmxlQ2VsbENoYW5nZUZsYXNoYCwgdGhpcyBjb25maWd1cmF0aW9uIHdpbGwgc2V0IHRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgb2YgaG93IGxvbmcgYSBjZWxsIHNob3VsZCByZW1haW4gaW4gaXRzIFwiZmxhc2hlZFwiIHN0YXRlLlxuICAgICAgICAgKiBEZWZhdWx0OiBgNTAwYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgLCB0aGlzIGNvbmZpZ3VyYXRpb24gd2lsbCBzZXQgdGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyB0aGUgXCJmbGFzaGVkXCIgc3RhdGUgYW5pbWF0aW9uIHRha2VzIHRvIGZhZGUgYXdheSBhZnRlciB0aGUgdGltZXIgc2V0IGJ5IGBjZWxsRmxhc2hEZWxheWAgaGFzIGNvbXBsZXRlZC5cbiAgICAgICAgICogRGVmYXVsdDogYDEwMDBgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmFkZURlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBjZWxscyBmbGFzaCBhZnRlciBkYXRhIGNoYW5nZXMgZXZlbiB3aGVuIHRoZSBjaGFuZ2UgaXMgZHVlIHRvIGZpbHRlcmluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dTaG93Q2hhbmdlQWZ0ZXJGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFN3aXRjaCBiZXR3ZWVuIGxheW91dCBvcHRpb25zOiBgbm9ybWFsYCwgYGF1dG9IZWlnaHRgLCBgcHJpbnRgLlxuICAgICAgICAgKiBEZWZhdWx0OiBgbm9ybWFsYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG9tTGF5b3V0OiBEb21MYXlvdXRUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIG9yZGVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgaW4gdGhlIERPTSBhcmUgY29uc2lzdGVudCB3aXRoIHdoYXQgaXMgb24gc2NyZWVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnN1cmVEb21PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvcGVyYXRlIHRoZSBncmlkIGluIFJUTCAoUmlnaHQgdG8gTGVmdCkgbW9kZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUnRsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIGdyaWQgZG9lc24ndCB2aXJ0dWFsaXNlIHRoZSBjb2x1bW5zLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgMTAwIGNvbHVtbnMsIGJ1dCBvbmx5IDEwIHZpc2libGUgZHVlIHRvIHNjcm9sbGluZywgYWxsIDEwMCB3aWxsIGFsd2F5cyBiZSByZW5kZXJlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCB0aGUgZ3JpZCBoYXMgYSBsaW1pdCBvZiByZW5kZXJpbmcgYSBtYXhpbXVtIG9mIDUwMCByb3dzIGF0IG9uY2UgKHJlbWVtYmVyIHRoZSBncmlkIG9ubHkgcmVuZGVycyByb3dzIHlvdSBjYW4gc2VlLCBzbyB1bmxlc3MgeW91ciBkaXNwbGF5IHNob3dzIG1vcmUgdGhhbiA1MDAgcm93cyB3aXRob3V0IHZlcnRpY2FsbHkgc2Nyb2xsaW5nIHRoaXMgd2lsbCBuZXZlciBiZSBhbiBpc3N1ZSkuXG4gICAgICAgICAqIDxiciAvPioqVGhpcyBpcyBvbmx5IHJlbGV2YW50IGlmIHlvdSBhcmUgbWFudWFsbHkgc2V0dGluZyBgcm93QnVmZmVyYCB0byBhIGhpZ2ggdmFsdWUgKHJlbmRlcmluZyBtb3JlIHJvd3MgdGhhbiBjYW4gYmUgc2VlbiksIG9yIGBzdXBwcmVzc1Jvd1ZpcnR1YWxpc2F0aW9uYCBpcyB0cnVlLCBvciBpZiB5b3VyIGdyaWQgaGVpZ2h0IGlzIGFibGUgdG8gZGlzcGxheSBtb3JlIHRoYW4gNTAwIHJvd3MgYXQgb25jZS4qKlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01heFJlbmRlcmVkUm93UmVzdHJpY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgZ3JpZCBkb2Vzbid0IHZpcnR1YWxpc2UgdGhlIHJvd3MuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSAxMDAgcm93cywgYnV0IG9ubHkgMTAgdmlzaWJsZSBkdWUgdG8gc2Nyb2xsaW5nLCBhbGwgMTAwIHdpbGwgYWx3YXlzIGJlIHJlbmRlcmVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd1ZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBNYW5hZ2VkIFJvdyBEcmFnZ2luZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgcm93IGRyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0RyYWc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3MgbW92aW5nIHJvd3Mgd2hpbGUgZHJhZ2dpbmcgdGhlIGByb3dEcmFnYCB3YWZmbGUuIFRoaXMgb3B0aW9uIGhpZ2hsaWdodHMgdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSByb3cgd2lsbCBiZSBwbGFjZWQgYW5kIGl0IHdpbGwgb25seSBtb3ZlIHRoZSByb3cgb24gbW91c2UgdXAuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgY2xpY2tpbmcgYW5kIGRyYWdnaW5nIGFueXdoZXJlIG9uIHRoZSByb3cgd2l0aG91dCB0aGUgbmVlZCBmb3IgYSBkcmFnIGhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgZHJhZ2dpbmcgbXVsdGlwbGUgcm93cyBhdCB0aGUgc2FtZSB0aW1lLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTXVsdGlSb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgY2FsbGJhY2sgdGhhdCBzaG91bGQgcmV0dXJuIGEgc3RyaW5nIHRvIGJlIGRpc3BsYXllZCBieSB0aGUgYHJvd0RyYWdDb21wYCB3aGlsZSBkcmFnZ2luZyBhIHJvdy5cbiAgICAgICAgICogSWYgdGhpcyBjYWxsYmFjayBpcyBub3Qgc2V0LCB0aGUgY3VycmVudCBjZWxsIHZhbHVlIHdpbGwgYmUgdXNlZC5cbiAgICAgICAgICogSWYgdGhlIGByb3dEcmFnVGV4dGAgY2FsbGJhY2sgaXMgc2V0IGluIHRoZSBDb2xEZWYgaXQgd2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciB0aGlzLCBleGNlcHQgd2hlblxuICAgICAgICAgKiBgcm93RHJhZ0VudGlyZVJvdz10cnVlYC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdUZXh0OiAoKHBhcmFtczogSVJvd0RyYWdJdGVtLCBkcmFnSXRlbUNvdW50OiBudW1iZXIpID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgeW91ciBvd24gY2VsbCByZW5kZXJlciBjb21wb25lbnQgdG8gdXNlIGZvciBmdWxsIHdpZHRoIHJvd3MuXG4gICAgICAgICogU2VlIFtGdWxsIFdpZHRoIFJvd3NdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2Z1bGwtd2lkdGgtcm93cy8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBmdWxsV2lkdGhDZWxsUmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSBkZXRhaWwgZ3JpZCBlbWJlZGRlZCBpbiB0aGUgbWFzdGVyIGdyaWQncyBjb250YWluZXIgYW5kIHNvIGxpbmsgdGhlaXIgaG9yaXpvbnRhbCBzY3JvbGxpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyBob3cgdGhlIHJlc3VsdHMgb2Ygcm93IGdyb3VwaW5nIHNob3VsZCBiZSBkaXNwbGF5ZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqICBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICAgICAqXG4gICAgICAgICAqIC0gYCdzaW5nbGVDb2x1bW4nYDogc2luZ2xlIGdyb3VwIGNvbHVtbiBhdXRvbWF0aWNhbGx5IGFkZGVkIGJ5IHRoZSBncmlkLlxuICAgICAgICAgKiAtIGAnbXVsdGlwbGVDb2x1bW5zJ2A6IGEgZ3JvdXAgY29sdW1uIHBlciByb3cgZ3JvdXAgaXMgYWRkZWQgYXV0b21hdGljYWxseS5cbiAgICAgICAgICogLSBgJ2dyb3VwUm93cydgOiBncm91cCByb3dzIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIGluc3RlYWQgb2YgZ3JvdXAgY29sdW1ucy5cbiAgICAgICAgICogLSBgJ2N1c3RvbSdgOiBpbmZvcm1zIHRoZSBncmlkIHRoYXQgZ3JvdXAgY29sdW1ucyB3aWxsIGJlIHByb3ZpZGVkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEaXNwbGF5VHlwZTogUm93R3JvdXBpbmdEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZ3JvdXBpbmcsIHNldCB0byB0aGUgbnVtYmVyIG9mIGxldmVscyB0byBleHBhbmQgYnkgZGVmYXVsdCwgZS5nLiBgMGAgZm9yIG5vbmUsIGAxYCBmb3IgZmlyc3QgbGV2ZWwgb25seSwgZXRjLiBTZXQgdG8gYC0xYCB0byBleHBhbmQgZXZlcnl0aGluZy4gRGVmYXVsdDogYDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERlZmF1bHRFeHBhbmRlZDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgc3BlY2lmeWluZyB0aGUgZ3JvdXAgJ2F1dG8gY29sdW1uJyBpZiB5b3UgYXJlIG5vdCBoYXBweSB3aXRoIHRoZSBkZWZhdWx0LiBJZiBncm91cGluZywgdGhpcyBjb2x1bW4gZGVmaW5pdGlvbiBpcyBpbmNsdWRlZCBhcyB0aGUgZmlyc3QgY29sdW1uIGluIHRoZSBncmlkLiBJZiBub3QgZ3JvdXBpbmcsIHRoaXMgY29sdW1uIGlzIG5vdCBpbmNsdWRlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGF1dG9Hcm91cENvbHVtbkRlZjogQ29sRGVmPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHByZXNlcnZlcyB0aGUgY3VycmVudCBncm91cCBvcmRlciB3aGVuIHNvcnRpbmcgb24gbm9uLWdyb3VwIGNvbHVtbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTWFpbnRhaW5PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIGlmIHlvdSBzZWxlY3QgYSBncm91cCwgdGhlIGNoaWxkcmVuIG9mIHRoZSBncm91cCB3aWxsIGFsc28gYmUgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgZmlsdGVycyBzaG91bGQgYmUgYXBwbGllZCBvbiBhZ2dyZWdhdGVkIGdyb3VwIHZhbHVlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBBZ2dGaWx0ZXJpbmc6IGJvb2xlYW4gfCBJc1Jvd0ZpbHRlcmFibGU8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgdGhpcyBjb250cm9scyB3aGV0aGVyIHRvIHNob3cgYSBncm91cCBmb290ZXIgd2hlbiB0aGUgZ3JvdXAgaXMgZXhwYW5kZWQuXG4gICAgICAgICAqIElmIGB0cnVlYCwgdGhlbiBieSBkZWZhdWx0LCB0aGUgZm9vdGVyIHdpbGwgY29udGFpbiBhZ2dyZWdhdGUgZGF0YSAoaWYgYW55KSB3aGVuIHNob3duIGFuZCB0aGUgaGVhZGVyIHdpbGwgYmUgYmxhbmsuXG4gICAgICAgICAqIFdoZW4gY2xvc2VkLCB0aGUgaGVhZGVyIHdpbGwgY29udGFpbiB0aGUgYWdncmVnYXRlIGRhdGEgcmVnYXJkbGVzcyBvZiB0aGlzIHNldHRpbmcgKGFzIHRoZSBmb290ZXIgaXMgaGlkZGVuIGFueXdheSkuXG4gICAgICAgICAqIFRoaXMgaXMgaGFuZHkgZm9yICd0b3RhbCcgcm93cywgdGhhdCBhcmUgZGlzcGxheWVkIGJlbG93IHRoZSBkYXRhIHdoZW4gdGhlIGdyb3VwIGlzIG9wZW4sIGFuZCBhbG9uZ3NpZGUgdGhlIGdyb3VwIHdoZW4gaXQgaXMgY2xvc2VkLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVGb290ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc2hvdyBhICdncmFuZCB0b3RhbCcgZ3JvdXAgZm9vdGVyIGFjcm9zcyBhbGwgZ3JvdXBzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBhbmQgc2hvd2luZyBmb290ZXIsIGFnZ3JlZ2F0ZSBkYXRhIHdpbGwgYWx3YXlzIGJlIGRpc3BsYXllZCBhdCBib3RoIHRoZSBoZWFkZXIgYW5kIGZvb3RlciBsZXZlbHMuIFRoaXMgc3RvcHMgdGhlIHBvc3NpYmx5IHVuZGVzaXJhYmxlIGJlaGF2aW91ciBvZiB0aGUgaGVhZGVyIGRldGFpbHMgJ2p1bXBpbmcnIHRvIHRoZSBmb290ZXIgb24gZXhwYW5kLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFN1cHByZXNzQmxhbmtIZWFkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIHVzaW5nIGBncm91cFNlbGVjdHNDaGlsZHJlbmAsIHRoZW4gb25seSB0aGUgY2hpbGRyZW4gdGhhdCBwYXNzIHRoZSBjdXJyZW50IGZpbHRlciB3aWxsIGdldCBzZWxlY3RlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzRmlsdGVyZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNob3dzIHRoZSBvcGVuIGdyb3VwIGluIHRoZSBncm91cCBjb2x1bW4gZm9yIG5vbi1ncm91cCByb3dzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93T3BlbmVkR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29sbGFwc2UgZ3JvdXBzIHRoYXQgb25seSBoYXZlIG9uZSBjaGlsZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29sbGFwc2UgbG93ZXN0IGxldmVsIGdyb3VwcyB0aGF0IG9ubHkgaGF2ZSBvbmUgY2hpbGQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlTG93ZXN0U2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGlkZSBwYXJlbnRzIHRoYXQgYXJlIG9wZW4uIFdoZW4gdXNlZCB3aXRoIG11bHRpcGxlIGNvbHVtbnMgZm9yIHNob3dpbmcgZ3JvdXBzLCBpdCBjYW4gZ2l2ZSBhIG1vcmUgcGxlYXNpbmcgdXNlciBleHBlcmllbmNlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhpZGVPcGVuUGFyZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBwcmV2ZW50IHRoZSBncmlkIGZyb20gY3JlYXRpbmcgYSAnKEJsYW5rcyknIGdyb3VwIGZvciBub2RlcyB3aGljaCBkbyBub3QgYmVsb25nIHRvIGEgZ3JvdXAsIGFuZCBkaXNwbGF5IHRoZSB1bmJhbGFuY2VkIG5vZGVzIGFsb25nc2lkZSBncm91cCBub2Rlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBBbGxvd1VuYmFsYW5jZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdG8gc2hvdyB0aGUgJ3JvdyBncm91cCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gZ3JvdXApIGF0IHRoZSB0b3AuIERlZmF1bHQ6IGBuZXZlcmAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTaG93OiAnYWx3YXlzJyB8ICdvbmx5V2hlbkdyb3VwaW5nJyB8ICduZXZlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIENlbGwgUmVuZGVyZXIgdG8gdXNlIHdoZW4gYGdyb3VwRGlzcGxheVR5cGUgPSAnZ3JvdXBSb3dzJ2AuXG4gICAgICAgICogU2VlIFtHcm91cCBSb3cgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvZ3JvdXBpbmctZ3JvdXAtcm93cy8jcHJvdmlkaW5nLWNlbGwtcmVuZGVyZXIpIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgZ3JvdXBSb3dSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBgZ3JvdXBSb3dSZW5kZXJlcmAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCB3aGVuIGEgY29sdW1uIGlzIHVuLWdyb3VwZWQsIGkuZS4gdXNpbmcgdGhlIFJvdyBHcm91cCBQYW5lbCwgaXQgaXMgbWFkZSB2aXNpYmxlIGluIHRoZSBncmlkLiBUaGlzIHByb3BlcnR5IHN0b3BzIHRoZSBjb2x1bW4gYmVjb21pbmcgdmlzaWJsZSBhZ2FpbiB3aGVuIHVuLWdyb3VwaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01ha2VDb2x1bW5WaXNpYmxlQWZ0ZXJVbkdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgR3JpZCB0byB3b3JrIHdpdGggVHJlZSBEYXRhLiBZb3UgbXVzdCBhbHNvIGltcGxlbWVudCB0aGUgYGdldERhdGFQYXRoKGRhdGEpYCBjYWxsYmFjay4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIHNvcnQgaW5kaWNhdG9ycyBhbmQgYWN0aW9ucyBmcm9tIHRoZSByb3cgZ3JvdXAgcGFuZWwuIERlZmF1bHQ6IGBmYWxzZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU3VwcHJlc3NTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgb3BlbiBHcm91cCBSb3dzIHZpc2libGUgYXQgdGhlIHRvcCBvZiB0aGUgZ3JpZC4gRGVmYXVsdDogYGZhbHNlYC4qL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd3NTdGlja3k6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyNCAtIG5vIGxvbmdlciBuZWVkZWQsIHRyYW5zYWN0aW9uIHVwZGF0ZXMga2VlcCBncm91cCBzdGF0ZSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVtZW1iZXJHcm91cFN0YXRlV2hlbk5ld0RhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERhdGEgdG8gYmUgZGlzcGxheWVkIGFzIHBpbm5lZCB0b3Agcm93cyBpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFRvcFJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEYXRhIHRvIGJlIGRpc3BsYXllZCBhcyBwaW5uZWQgYm90dG9tIHJvd3MgaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRCb3R0b21Sb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgcm93IG1vZGVsIHR5cGUuIERlZmF1bHQ6IGBjbGllbnRTaWRlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TW9kZWxUeXBlOiBSb3dNb2RlbFR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGUgZGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcm93cyBpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RhdGE6IFREYXRhW10gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAyNy4xIEltbXV0YWJsZSBEYXRhIGlzIG9uIGJ5IGRlZmF1bHQgd2hlbiBncmlkIGNhbGxiYWNrIGdldFJvd0lkKCkgaXMgaW1wbGVtZW50ZWRcbiAgICAgICAgICogRW5hYmxlcyBJbW11dGFibGUgRGF0YSBtb2RlLCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIGltbXV0YWJsZSBzdG9yZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGltbXV0YWJsZURhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBleGVjdXRpbmcgYSBiYXRjaCBvZiBhc3luYyB0cmFuc2FjdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uV2FpdE1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyBUcmFuc2FjdGlvbnMgY2hhbmdpbmcgc29ydCwgZmlsdGVyLCBncm91cCBvciBwaXZvdCBzdGF0ZSB3aGVuIHRyYW5zYWN0aW9uIG9ubHkgY29udGFpbnMgdXBkYXRlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb2RlbFVwZGF0ZUFmdGVyVXBkYXRlVHJhbnNhY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIGRhdGFzb3VyY2UgZm9yIGluZmluaXRlIHNjcm9sbGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRhdGFzb3VyY2U6IElEYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBleHRyYSBibGFuayByb3dzIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXIgYXQgdGhlIGVuZCBvZiB0aGUgZGF0YXNldCwgd2hpY2ggc2V0cyB0aGUgdmVydGljYWwgc2Nyb2xsIGFuZCB0aGVuIGFsbG93cyB0aGUgZ3JpZCB0byByZXF1ZXN0IHZpZXdpbmcgbW9yZSByb3dzIG9mIGRhdGEuXG4gICAgICAgICAqIERlZmF1bHQ6IGAxYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVPdmVyZmxvd1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAgICAgKiBEZWZhdWx0OiBgMWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluZmluaXRlSW5pdGlhbFJvd0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCBob3cgbWFueSBsb2FkaW5nIHJvd3MgdG8gZGlzcGxheSB0byB0aGUgdXNlciBmb3IgdGhlIHJvb3QgbGV2ZWwgZ3JvdXAuXG4gICAgICAgICAqIERlZmF1bHQ6IGAxYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUluaXRpYWxSb3dDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjggV2hldGhlciB0byB1c2UgRnVsbCBTdG9yZSBvciBQYXJ0aWFsIFN0b3JlIGZvciBzdG9yaW5nIHJvd3MuIERlZmF1bHQ6IGBwYXJ0aWFsYC5cbiAgICAgICAgICogRGVwcmVjYXRlZCBpbiBmYXZvdXIgb2Ygc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGwuIFdoZW4gZmFsc2UsIFBhcnRpYWwgU3RvcmUgaXMgdXNlZC4gV2hlbiB0cnVlLFxuICAgICAgICAgKiBGdWxsIFN0b3JlIGlzIHVzZWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU3RvcmVUeXBlOiBTZXJ2ZXJTaWRlU3RvcmVUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIFNlcnZlci1zaWRlIFJvdyBNb2RlbCB3aWxsIHN1cHByZXNzIEluZmluaXRlIFNjcm9sbGluZyBhbmQgbG9hZCBhbGwgdGhlIGRhdGEgYXQgdGhlIGN1cnJlbnQgbGV2ZWwuXG4gICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByb3dzIGZvciBlYWNoIGJsb2NrIGluIHRoZSBzdG9yZSwgaS5lLiBob3cgbWFueSByb3dzIHJldHVybmVkIGZyb20gdGhlIHNlcnZlciBhdCBhIHRpbWUuXG4gICAgICAgICAqIERlZmF1bHQ6IGAxMDBgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZUJsb2NrU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBibG9ja3MgdG8ga2VlcCBpbiB0aGUgc3RvcmUuIERlZmF1bHQgaXMgbm8gbGltaXQsIHNvIGV2ZXJ5IHJlcXVlc3RlZCBibG9jayBpcyBrZXB0LiBVc2UgdGhpcyBpZiB5b3UgaGF2ZSBtZW1vcnkgY29uY2VybnMsIGFuZCBibG9ja3MgdGhhdCB3ZXJlIGxlYXN0IHJlY2VudGx5IHZpZXdlZCB3aWxsIGJlIHB1cmdlZCB3aGVuIHRoZSBsaW1pdCBpcyBoaXQuIFRoZSBncmlkIHdpbGwgYWRkaXRpb25hbGx5IG1ha2Ugc3VyZSBpdCBoYXMgYWxsIHRoZSBibG9ja3MgbmVlZGVkIHRvIGRpc3BsYXkgd2hhdCBpcyBjdXJyZW50bHkgdmlzaWJsZSwgaW4gY2FzZSB0aGlzIHByb3BlcnR5IGlzIHNldCB0byBhIGxvdyB2YWx1ZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heEJsb2Nrc0luQ2FjaGU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcmVxdWVzdHMgdG8gaGl0IHRoZSBzZXJ2ZXIgd2l0aCBjb25jdXJyZW50bHkuIElmIHRoZSBtYXggaXMgcmVhY2hlZCwgcmVxdWVzdHMgYXJlIHF1ZXVlZC5cbiAgICAgICAgICogU2V0IHRvIGAtMWAgZm9yIG5vIG1heGltdW0gcmVzdHJpY3Rpb24gb24gcmVxdWVzdHMuXG4gICAgICAgICAqIERlZmF1bHQ6IGAyYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29uY3VycmVudERhdGFzb3VyY2VSZXF1ZXN0czogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgbG9hZGluZyBhIGJsb2NrLiBVc2VmdWwgd2hlbiBpbmZpbml0ZSBzY3JvbGxpbmcgYW5kIHNjcm9sbGluZyBvdmVyIG1hbnkgaW5maW5pdGUgYmxvY2tzLCBhcyBpdCBwcmV2ZW50cyBibG9ja3MgbG9hZGluZyB1bnRpbCBzY3JvbGxpbmcgaGFzIHNldHRsZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBibG9ja0xvYWREZWJvdW5jZU1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGNsb3NpbmcgZ3JvdXAgcm93cyB3aWxsIHJlbW92ZSBjaGlsZHJlbiBvZiB0aGF0IHJvdy4gTmV4dCB0aW1lIHRoZSByb3cgaXMgb3BlbmVkLCBjaGlsZCByb3dzIHdpbGwgYmUgcmVhZCBmcm9tIHRoZSBkYXRhc291cmNlIGFnYWluLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHB1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIGBzZXJ2ZXJTaWRlRGF0YXNvdXJjZWAgZm9yIHNlcnZlciBzaWRlIHJvdyBtb2RlbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVEYXRhc291cmNlOiBJU2VydmVyU2lkZURhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgYWx3YXlzIHJlZnJlc2hlcyB0b3AgbGV2ZWwgZ3JvdXBzIHJlZ2FyZGxlc3Mgb2Ygd2hpY2ggY29sdW1uIHdhcyBzb3J0ZWQuIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nICYgc29ydGluZyBpcyBoYW5kbGVkIG9uIHRoZSBzZXJ2ZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0QWxsTGV2ZWxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGFsd2F5cyByZWZyZXNoZXMgdG9wIGxldmVsIGdyb3VwcyByZWdhcmRsZXNzIG9mIHdoaWNoIGNvbHVtbiB3YXMgZmlsdGVyZWQuIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nICYgZmlsdGVyaW5nIGlzIGhhbmRsZWQgb24gdGhlIHNlcnZlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlckFsbExldmVsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBTb3J0aW5nIHdpbGwgYmUgZG9uZSBvbiB0aGUgc2VydmVyIHNpZGUuIFdoZW4gc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw9ZmFsc2UsIGRvZXMgbm90aGluZyxcbiAgICAgICAgICogYXMgU29ydGluZyBpcyBhbHdheXMgc2VydmVyIHNpZGUgd2hlbiBJbmZpbml0ZSBTY3JvbGwgaXMgYWN0aXZlLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydE9uU2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIEZpbHRlcmluZyB3aWxsIGJlIGRvbmUgb24gdGhlIHNlcnZlciBzaWRlLiBXaGVuIHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsPWZhbHNlLCBkb2VzIG5vdGhpbmcsXG4gICAgICAgICAgKiBhcyBGaWx0ZXJpbmcgaXMgYWx3YXlzIHNlcnZlciBzaWRlIHdoZW4gSW5maW5pdGUgU2Nyb2xsIGlzIGFjdGl2ZS5cbiAgICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRmlsdGVyT25TZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOCBUaGlzIHByb3BlcnR5IGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBgc2VydmVyU2lkZVNvcnRBbGxMZXZlbHNgIGluc3RlYWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydGluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI4IFRoaXMgcHJvcGVydHkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIGBzZXJ2ZXJTaWRlRmlsdGVyQWxsTGV2ZWxzYCBpbnN0ZWFkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlcmluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gdXNlIHRoZSB2aWV3cG9ydCByb3cgbW9kZWwgeW91IG5lZWQgdG8gcHJvdmlkZSB0aGUgZ3JpZCB3aXRoIGEgYHZpZXdwb3J0RGF0YXNvdXJjZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydERhdGFzb3VyY2U6IElWaWV3cG9ydERhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgdmlld3BvcnQgcm93IG1vZGVsLCBzZXRzIHRoZSBwYWdlIHNpemUgZm9yIHRoZSB2aWV3cG9ydC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxQYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIHZpZXdwb3J0IHJvdyBtb2RlbCwgc2V0cyB0aGUgYnVmZmVyIHNpemUgZm9yIHRoZSB2aWV3cG9ydC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxCdWZmZXJTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIHNob3cgdGhlIGhvcml6b250YWwgc2Nyb2xsYmFyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgdmVydGljYWwgc2Nyb2xsYmFyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93VmVydGljYWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZGVib3VuY2UgdGhlIHZlcnRpY2FsIHNjcm9sbGJhci4gQ2FuIHByb3ZpZGUgc21vb3RoZXIgc2Nyb2xsaW5nIG9uIHNsb3cgbWFjaGluZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlYm91bmNlVmVydGljYWxTY3JvbGxiYXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbmV2ZXIgc2hvdyB0aGUgaG9yaXpvbnRhbCBzY3JvbGwuIFRoaXMgaXMgdXNlZnVsIGlmIHRoZSBncmlkIGlzIGFsaWduZWQgd2l0aCBhbm90aGVyIGdyaWQgYW5kIHdpbGwgc2Nyb2xsIHdoZW4gdGhlIG90aGVyIGdyaWQgc2Nyb2xscy4gKFNob3VsZCBub3QgYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbGAuKSBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzY3JvbGwgdG8gdGhlIHRvcCB3aGVuIG5ldyByb3cgZGF0YSBpcyBwcm92aWRlZC4gVXNlIHRoaXMgaWYgeW91IGRvbid0IHdhbnQgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIG9mIHNjcm9sbGluZyB0byB0aGUgdG9wIGV2ZXJ5IHRpbWUgeW91IGxvYWQgbmV3IGRhdGEuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsT25OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgYWxsb3cgbW91c2V3aGVlbCAvIHRvdWNocGFkIHNjcm9sbCB3aGVuIHBvcHVwIGVsZW1lbnRzIGFyZSBwcmVzZW50LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbFdoZW5Qb3B1cHNBcmVPcGVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgdXNlIGFuaW1hdGlvbiBmcmFtZXMgd2hlbiBkcmF3aW5nIHJvd3Mgd2hpbGUgc2Nyb2xsaW5nLiBVc2UgdGhpcyBpZiB0aGUgZ3JpZCBpcyB3b3JraW5nIGZhc3QgZW5vdWdoIHRoYXQgeW91IGRvbid0IG5lZWQgYW5pbWF0aW9uIGZyYW1lcyBhbmQgeW91IGRvbid0IHdhbnQgdGhlIGdyaWQgdG8gZmxpY2tlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBtaWRkbGUgY2xpY2tzIHdpbGwgcmVzdWx0IGluIGBjbGlja2AgZXZlbnRzIGZvciBjZWxscyBhbmQgcm93cy4gT3RoZXJ3aXNlIHRoZSBicm93c2VyIHdpbGwgdXNlIG1pZGRsZSBjbGljayB0byBzY3JvbGwgdGhlIGdyaWQuPGJyIC8+KipOb3RlOioqIE5vdCBhbGwgYnJvd3NlcnMgZmlyZSBgY2xpY2tgIGV2ZW50cyB3aXRoIHRoZSBtaWRkbGUgYnV0dG9uLiBNb3N0IHdpbGwgZmlyZSBvbmx5IGBtb3VzZWRvd25gIGFuZCBgbW91c2V1cGAgZXZlbnRzLCB3aGljaCBjYW4gYmUgdXNlZCB0byBmb2N1cyBhIGNlbGwsIGJ1dCB3aWxsIG5vdCB3b3JrIHRvIGNhbGwgdGhlIGBvbkNlbGxDbGlja2VkYCBmdW5jdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgbW91c2Ugd2hlZWwgZXZlbnRzIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBicm93c2VyLiBVc2VmdWwgaWYgeW91ciBncmlkIGhhcyBubyB2ZXJ0aWNhbCBzY3JvbGxzIGFuZCB5b3Ugd2FudCB0aGUgbW91c2UgdG8gc2Nyb2xsIHRoZSBicm93c2VyIHBhZ2UuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRlbGwgdGhlIGdyaWQgaG93IHdpZGUgaW4gcGl4ZWxzIHRoZSBzY3JvbGxiYXIgaXMsIHdoaWNoIGlzIHVzZWQgaW4gZ3JpZCB3aWR0aCBjYWxjdWxhdGlvbnMuIFNldCBvbmx5IGlmIHVzaW5nIG5vbi1zdGFuZGFyZCBicm93c2VyLXByb3ZpZGVkIHNjcm9sbGJhcnMsIHNvIHRoZSBncmlkIGNhbiB1c2UgdGhlIG5vbi1zdGFuZGFyZCBzaXplIGluIGl0cyBjYWxjdWxhdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGxiYXJXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUeXBlIG9mIFJvdyBTZWxlY3Rpb246IGBzaW5nbGVgLCBgbXVsdGlwbGVgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U2VsZWN0aW9uOiAnc2luZ2xlJyB8ICdtdWx0aXBsZScgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgbXVsdGlwbGUgcm93cyB0byBiZSBzZWxlY3RlZCB1c2luZyBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvd3Mgd2lsbCBub3QgYmUgZGVzZWxlY3RlZCBpZiB5b3UgaG9sZCBkb3duIGBDdHJsYCBhbmQgY2xpY2sgdGhlIHJvdyBvciBwcmVzcyBgU3BhY2VgLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvdyBzZWxlY3Rpb24gd29uJ3QgaGFwcGVuIHdoZW4gcm93cyBhcmUgY2xpY2tlZC4gVXNlIHdoZW4geW91IG9ubHkgd2FudCBjaGVja2JveCBzZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyNyBUaGlzIHByb3BlcnR5IGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBgc3VwcHJlc3NDZWxsRm9jdXNgIGluc3RlYWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgY2VsbHMgd29uJ3QgYmUgZm9jdXNhYmxlLiBUaGlzIG1lYW5zIGtleWJvYXJkIG5hdmlnYXRpb24gd2lsbCBiZSBkaXNhYmxlZCBmb3IgZ3JpZCBjZWxscywgYnV0IHJlbWFpbiBlbmFibGVkIGluIG90aGVyIGVsZW1lbnRzIG9mIHRoZSBncmlkIHN1Y2ggYXMgY29sdW1uIGhlYWRlcnMsIGZsb2F0aW5nIGZpbHRlcnMsIHRvb2wgcGFuZWxzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBvbmx5IGEgc2luZ2xlIHJhbmdlIGNhbiBiZSBzZWxlY3RlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGJlIGFibGUgdG8gc2VsZWN0IHRoZSB0ZXh0IHdpdGhpbiBjZWxscy5cbiAgICAgICAgICpcbiAgICAgICAgICogICAgICoqTm90ZToqKiBXaGVuIHRoaXMgaXMgc2V0IHRvIGB0cnVlYCwgdGhlIGNsaXBib2FyZCBzZXJ2aWNlIGlzIGRpc2FibGVkLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgUmFuZ2UgU2VsZWN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIFJhbmdlIEhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBGaWxsIEhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlRmlsbEhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAneCdgIHRvIGZvcmNlIHRoZSBmaWxsIGhhbmRsZSBkaXJlY3Rpb24gdG8gaG9yaXpvbnRhbCwgb3Igc2V0IHRvIGAneSdgIHRvIGZvcmNlIHRoZSBmaWxsIGhhbmRsZSBkaXJlY3Rpb24gdG8gdmVydGljYWwuIERlZmF1bHQ6IGB4eWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbGxIYW5kbGVEaXJlY3Rpb246ICd4JyB8ICd5JyB8ICd4eScgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBwcmV2ZW50IGNlbGwgdmFsdWVzIGZyb20gYmVpbmcgY2xlYXJlZCB3aGVuIHRoZSBSYW5nZSBTZWxlY3Rpb24gaXMgcmVkdWNlZCBieSB0aGUgRmlsbCBIYW5kbGUuIERlZmF1bHQ6IGBmYWxzZWAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBkZWZpbmluZyB0aGUgb3JkZXIgaW4gd2hpY2ggc29ydGluZyBvY2N1cnMgKGlmIHNvcnRpbmcgaXMgZW5hYmxlZCkuIFZhbHVlcyBjYW4gYmUgYCdhc2MnYCwgYCdkZXNjJ2Agb3IgYG51bGxgLiBGb3IgZXhhbXBsZTogYHNvcnRpbmdPcmRlcjogWydhc2MnLCAnZGVzYyddYC4gRGVmYXVsdDogYFtudWxsLCAnYXNjJywgJ2Rlc2MnXWAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6IChTb3J0RGlyZWN0aW9uKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNwZWNpZnkgdGhhdCB0aGUgc29ydCBzaG91bGQgdGFrZSBhY2NlbnRlZCBjaGFyYWN0ZXJzIGludG8gYWNjb3VudC4gSWYgdGhpcyBmZWF0dXJlIGlzIHR1cm5lZCBvbiB0aGUgc29ydCB3aWxsIGJlIHNsb3dlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlICdubyBzb3J0JyBpY29uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIG11bHRpLXNvcnQgd2hlbiB0aGUgdXNlciBzaGlmdC1jbGlja3MgYSBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgbXVsdGktc29ydCB3aGVuIHRoZSB1c2VyIGNsaWNrcyBhIGNvbHVtbiBoZWFkZXIsIHJlZ2FyZGxlc3Mgb2Yga2V5IHByZXNzZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnY3RybCdgIHRvIGhhdmUgbXVsdGkgc29ydGluZyB3b3JrIHVzaW5nIHRoZSBgQ3RybGAgKG9yIGBDb21tYW5kIOKMmGAgZm9yIE1hYykga2V5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbXVsdGlTb3J0S2V5OiAnY3RybCcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydGluZyBvZiB1bi1zb3J0ZWQgZGF0YSB0byBtYXRjaCBvcmlnaW5hbCByb3cgZGF0YS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIHRvIHVzZSBpbnNpZGUgdGhlIGdyaWQgaW5zdGVhZCBvZiB0aGUgZ3JpZCdzIGRlZmF1bHQgaWNvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB8IHN0cmluZzsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGVmYXVsdCByb3cgaGVpZ2h0IGluIHBpeGVscy4gRGVmYXVsdDogYDI1YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93SGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBzdHlsZSBwcm9wZXJ0aWVzIHRvIGFwcGx5IHRvIGFsbCByb3dzLiBTZXQgdG8gYW4gb2JqZWN0IG9mIGtleSAoc3R5bGUgbmFtZXMpIGFuZCB2YWx1ZXMgKHN0eWxlIHZhbHVlcykgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlOiBSb3dTdHlsZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzKGVzKSBmb3IgYWxsIHJvd3MuIFByb3ZpZGUgZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSBvciBhcnJheSBvZiBzdHJpbmdzIChhcnJheSBvZiBjbGFzcyBuYW1lcykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJ1bGVzIHdoaWNoIGNhbiBiZSBhcHBsaWVkIHRvIGluY2x1ZGUgY2VydGFpbiBDU1MgY2xhc3Nlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXM6IFJvd0NsYXNzUnVsZXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBoaWdobGlnaHQgcm93cyBieSBhZGRpbmcgdGhlIGBhZy1yb3ctaG92ZXJgIENTUyBjbGFzcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVXNlcyBDU1MgYHRvcGAgaW5zdGVhZCBvZiBDU1MgYHRyYW5zZm9ybWAgZm9yIHBvc2l0aW9uaW5nIHJvd3MuIFVzZWZ1bCBpZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGlzIGNhdXNpbmcgaXNzdWVzIHN1Y2ggYXMgdXNlZCBpbiByb3cgc3Bhbm5pbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VHJhbnNmb3JtOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZ2hsaWdodCBjb2x1bW5zIGJ5IGFkZGluZyB0aGUgYGFnLWNvbHVtbi1ob3ZlcmAgQ1NTIGNsYXNzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YURpc3BsYXlUeXBlOiBUcmVlRGF0YURpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNQYXNzaXZlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgY29udGV4dCBtZW51LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q29udGV4dE1lbnVJdGVtczogR2V0Q29udGV4dE1lbnVJdGVtczxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgbWFpbiAnY29sdW1uIGhlYWRlcicgbWVudS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldE1haW5NZW51SXRlbXM6IEdldE1haW5NZW51SXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB1c2VyIHRvIHByb2Nlc3MgcG9wdXBzIGFmdGVyIHRoZXkgYXJlIGNyZWF0ZWQuIEFwcGxpY2F0aW9ucyBjYW4gdXNlIHRoaXMgaWYgdGhleSB3YW50IHRvLCBmb3IgZXhhbXBsZSwgcmVwb3NpdGlvbiB0aGUgcG9wdXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0UHJvY2Vzc1BvcHVwOiAoKHBhcmFtczogUG9zdFByb2Nlc3NQb3B1cFBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgY2VsbHMgZm9yIHRoZSBjbGlwYm9hcmQuIEhhbmR5IGlmIGZvciBleGFtcGxlIHlvdSBoYXZlIGBEYXRlYCBvYmplY3RzIHRoYXQgbmVlZCB0byBoYXZlIGEgcGFydGljdWxhciBmb3JtYXQgaWYgaW1wb3J0aW5nIGludG8gRXhjZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBjbGlwYm9hcmQuICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgZ3JvdXAgaGVhZGVyIHZhbHVlcyBmb3IgdGhlIGNsaXBib2FyZC4gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzR3JvdXBIZWFkZXJGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzR3JvdXBIZWFkZXJGb3JFeHBvcnRQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgY2VsbHMgZnJvbSB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBudW1iZXIgZmllbGRzLCBhbmQgd2FudCB0byBibG9jayBub24tbnVtYmVycyBmcm9tIGdldHRpbmcgaW50byB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRnJvbUNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBnZXQgdGhlIGRhdGEgdGhhdCB3b3VsZCBvdGhlcndpc2UgZ28gdG8gdGhlIGNsaXBib2FyZC4gVG8gYmUgdXNlZCB3aGVuIHlvdSB3YW50IHRvIGNvbnRyb2wgdGhlICdjb3B5IHRvIGNsaXBib2FyZCcgb3BlcmF0aW9uIHlvdXJzZWxmLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VuZFRvQ2xpcGJvYXJkOiAoKHBhcmFtczogU2VuZFRvQ2xpcGJvYXJkUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjb21wbGV0ZSBjb250cm9sIG9mIHRoZSBwYXN0ZSBvcGVyYXRpb24sIGluY2x1ZGluZyBjYW5jZWxsaW5nIHRoZSBvcGVyYXRpb24gKHNvIG5vdGhpbmcgaGFwcGVucykgb3IgcmVwbGFjaW5nIHRoZSBkYXRhIHdpdGggb3RoZXIgZGF0YS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtczxURGF0YT4pID0+IHN0cmluZ1tdW10gfCBudWxsKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogR3JpZCBjYWxscyB0aGlzIG1ldGhvZCB0byBrbm93IGlmIGFuIGV4dGVybmFsIGZpbHRlciBpcyBwcmVzZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNFeHRlcm5hbEZpbHRlclByZXNlbnQ6ICgocGFyYW1zOiBJc0V4dGVybmFsRmlsdGVyUHJlc2VudFBhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG91bGQgcmV0dXJuIGB0cnVlYCBpZiBleHRlcm5hbCBmaWx0ZXIgcGFzc2VzLCBvdGhlcndpc2UgYGZhbHNlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRvZXNFeHRlcm5hbEZpbHRlclBhc3M6ICgobm9kZTogSVJvd05vZGU8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB0byBjdXN0b21pc2UgdGhlIGNoYXJ0IHRvb2xiYXIgaXRlbXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGFydFRvb2xiYXJJdGVtczogR2V0Q2hhcnRUb29sYmFySXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGVuYWJsZSBkaXNwbGF5aW5nIHRoZSBjaGFydCBpbiBhbiBhbHRlcm5hdGl2ZSBjaGFydCBjb250YWluZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjcmVhdGVDaGFydENvbnRhaW5lcjogKChwYXJhbXM6IENoYXJ0UmVmUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgbmF2aWdhdGlvbiAoYXJyb3cpIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dEhlYWRlcjogKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zPFREYXRhPikgPT4gKEhlYWRlclBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0SGVhZGVyOiAoKHBhcmFtczogVGFiVG9OZXh0SGVhZGVyUGFyYW1zPFREYXRhPikgPT4gKEhlYWRlclBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIG5hdmlnYXRpb24gKGFycm93KSBrZXkgd2hlbiBhIGNlbGwgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IENlbGwgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBjZWxsLiAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0Q2VsbDogKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtczxURGF0YT4pID0+IChDZWxsUG9zaXRpb24gfCBudWxsKSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgYFRhYmAga2V5IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBDZWxsIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIG51bGwgdG8gc3RheSBvbiBjdXJyZW50IGNlbGwuICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0Q2VsbDogKChwYXJhbXM6IFRhYlRvTmV4dENlbGxQYXJhbXM8VERhdGE+KSA9PiAoQ2VsbFBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjcuMiAtIFVzZSBgZ2V0TG9jYWxlVGV4dGAgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHRGdW5jOiAoKGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IHN0cmluZywgdmFyaWFibGVWYWx1ZXM/OiBzdHJpbmdbXSkgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldExvY2FsZVRleHQ6ICgocGFyYW1zOiBHZXRMb2NhbGVUZXh0UGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgd2hhdCBgZG9jdW1lbnRgIGlzIHVzZWQuIEN1cnJlbnRseSB1c2VkIGJ5IERyYWcgYW5kIERyb3AgKG1heSBleHRlbmQgdG8gb3RoZXIgcGxhY2VzIGluIHRoZSBmdXR1cmUpLiBVc2UgdGhpcyB3aGVuIHlvdSB3YW50IHRoZSBncmlkIHRvIHVzZSBhIGRpZmZlcmVudCBgZG9jdW1lbnRgIHRoYW4gdGhlIG9uZSBhdmFpbGFibGUgb24gdGhlIGdsb2JhbCBzY29wZS4gVGhpcyBjYW4gaGFwcGVuIGlmIGRvY2tpbmcgb3V0IGNvbXBvbmVudHMgKHNvbWV0aGluZyB3aGljaCBFbGVjdHJvbiBzdXBwb3J0cykgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldERvY3VtZW50OiAoKCkgPT4gRG9jdW1lbnQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBmb3JtYXQgdGhlIG51bWJlcnMgaW4gdGhlIHBhZ2luYXRpb24gcGFuZWwsIGkuZS4gJ3JvdyBjb3VudCcgYW5kICdwYWdlIG51bWJlcicgbGFiZWxzLiBUaGlzIGlzIGZvciBwYWdpbmF0aW9uIHBhbmVsIG9ubHksIHRvIGZvcm1hdCBudW1iZXJzIGluc2lkZSB0aGUgZ3JpZCdzIGNlbGxzIChpLmUuIHlvdXIgZGF0YSksIHRoZW4gdXNlIGB2YWx1ZUZvcm1hdHRlcmAgaW4gdGhlIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXI6ICgocGFyYW1zOiBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI3LjIgLSBVc2UgYGdldEdyb3VwUm93QWdnYCBpbnN0ZWFkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dBZ2dOb2RlczogKChub2RlczogSVJvd05vZGVbXSkgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gdXNlIHdoZW4geW91IG5lZWQgYWNjZXNzIHRvIG1vcmUgdGhlbiB0aGUgY3VycmVudCBjb2x1bW4gZm9yIGFnZ3JlZ2F0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0R3JvdXBSb3dBZ2c6ICgocGFyYW1zOiBHZXRHcm91cFJvd0FnZ1BhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIChDbGllbnQtc2lkZSBSb3cgTW9kZWwgb25seSkgQWxsb3dzIGdyb3VwcyB0byBiZSBvcGVuIGJ5IGRlZmF1bHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0dyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBkZWZhdWx0IHNvcnRpbmcgb2YgZ3JvdXBzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yOiAoKHBhcmFtczogSW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yUGFyYW1zPFREYXRhPikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI3LjIgLSBVc2UgYGluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvcmAgaW5zdGVhZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwT3JkZXJDb21wYXJhdG9yOiAoKG5vZGVBOiBJUm93Tm9kZTxURGF0YT4sIG5vZGVCOiBJUm93Tm9kZTxURGF0YT4pID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOCAtIFVzZSBgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sRGVmYCBpbnN0ZWFkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sRGVmOiAoKGNvbERlZjogQ29sRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOCAtIFVzZSBgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sR3JvdXBEZWZgIGluc3RlYWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xHcm91cERlZjogKChjb2xHcm91cERlZjogQ29sR3JvdXBEZWY8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIHBpdm90aW5nLCB0byBhbGxvdyBjaGFuZ2luZyB0aGUgc2Vjb25kIGNvbHVtbiBkZWZpbml0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sRGVmOiAoKGNvbERlZjogQ29sRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBwaXZvdGluZywgdG8gYWxsb3cgY2hhbmdpbmcgdGhlIHNlY29uZCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NQaXZvdFJlc3VsdENvbEdyb3VwRGVmOiAoKGNvbEdyb3VwRGVmOiBDb2xHcm91cERlZjxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdoZW4gd29ya2luZyB3aXRoIFRyZWUgRGF0YSB3aGVuIGB0cmVlRGF0YSA9IHRydWVgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGF0YVBhdGg6IEdldERhdGFQYXRoPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNldHRpbmcgdGhlIGNoaWxkIGNvdW50IGZvciBhIGdyb3VwIHJvdy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENoaWxkQ291bnQ6ICgoZGF0YUl0ZW06IGFueSkgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHByb3ZpZGluZyBkaWZmZXJlbnQgcGFyYW1zIGZvciBkaWZmZXJlbnQgbGV2ZWxzIG9mIGdyb3VwaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXM6ICgocGFyYW1zOiBHZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc1BhcmFtcykgPT4gU2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXMpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjggVXNlIGBnZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc2AgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVTdG9yZVBhcmFtczogKChwYXJhbXM6IEdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zUGFyYW1zKSA9PiBTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtcykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBncm91cHMgdG8gYmUgb3BlbiBieSBkZWZhdWx0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0OiAoKHBhcmFtczogSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNhbmNlbGxpbmcgdHJhbnNhY3Rpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbjogSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU1NSTSBUcmVlIERhdGE6IEFsbG93cyBzcGVjaWZ5aW5nIHdoaWNoIHJvd3MgYXJlIGV4cGFuZGFibGUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cDogSXNTZXJ2ZXJTaWRlR3JvdXAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNTUk0gVHJlZSBEYXRhOiBBbGxvd3Mgc3BlY2lmeWluZyBncm91cCBrZXlzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZUdyb3VwS2V5OiBHZXRTZXJ2ZXJTaWRlR3JvdXBLZXkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJldHVybiBhIGJ1c2luZXNzIGtleSBmb3IgdGhlIG5vZGUuIElmIGltcGxlbWVudGVkLCBlYWNoIHJvdyBpbiB0aGUgRE9NIHdpbGwgaGF2ZSBhbiBhdHRyaWJ1dGUgYHJvdy1pZD0nYWJjJ2Agd2hlcmUgYGFiY2AgaXMgd2hhdCB5b3UgcmV0dXJuIGFzIHRoZSBidXNpbmVzcyBrZXkuXG4gICAgICAgICAqIFRoaXMgaXMgdXNlZnVsIGZvciBhdXRvbWF0ZWQgdGVzdGluZywgYXMgaXQgcHJvdmlkZXMgYSB3YXkgZm9yIHlvdXIgdG9vbCB0byBpZGVudGlmeSByb3dzIGJhc2VkIG9uIHVuaXF1ZSBidXNpbmVzcyBrZXlzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0QnVzaW5lc3NLZXlGb3JOb2RlOiAoKG5vZGU6IElSb3dOb2RlPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI3LjEgVXNlIGBnZXRSb3dJZGAgaW5zdGVhZCAtIGhvd2V2ZXIgYmUgYXdhcmUsIGBnZXRSb3dJZCgpYCB3aWxsIGFsc28gc2V0IGdyaWQgb3B0aW9uIGBpbW11dGFibGVEYXRhPXRydWVgXG4gICAgICAgICAqIEFsbG93cyB5b3UgdG8gc2V0IHRoZSBJRCBmb3IgYSBwYXJ0aWN1bGFyIHJvdyBub2RlIGJhc2VkIG9uIHRoZSBkYXRhLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Tm9kZUlkOiBHZXRSb3dOb2RlSWRGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNldHRpbmcgdGhlIElEIGZvciBhIHBhcnRpY3VsYXIgcm93IG5vZGUgYmFzZWQgb24gdGhlIGRhdGEuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dJZDogR2V0Um93SWRGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBnZXRSb3dJZCgpIGNhbGxiYWNrIGlzIGltcGxlbWVudGVkIGFuZCBuZXcgUm93IERhdGEgaXMgc2V0LCB0aGUgZ3JpZCB3aWxsIGRpc3JlZ2FyZCBhbGwgcHJldmlvdXMgcm93cyBhbmQgdHJlYXQgdGhlIG5ldyBSb3cgRGF0YSBhcyBuZXcgZGF0YS4gQXMgYSBjb25zZXF1ZW5jZSwgYWxsIFJvdyBTdGF0ZSAoZWcgc2VsZWN0aW9uLCByZW5kZXJlZCByb3dzKSB3aWxsIGJlIHJlc2V0LiAgRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVzZXRSb3dEYXRhT25VcGRhdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyByb3dzIGFmdGVyIHRoZXkgYXJlIGNyZWF0ZWQsIHNvIHlvdSBjYW4gZG8gZmluYWwgYWRkaW5nIG9mIGN1c3RvbSBhdHRyaWJ1dGVzIGV0Yy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NSb3dQb3N0Q3JlYXRlOiAoKHBhcmFtczogUHJvY2Vzc1Jvd1BhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHRvIGRldGVybWluZSB3aGljaCByb3dzIGFyZSBzZWxlY3RhYmxlLiBCeSBkZWZhdWx0IHJvd3MgYXJlIHNlbGVjdGFibGUsIHNvIHJldHVybiBgZmFsc2VgIHRvIG1ha2UgYSByb3cgdW4tc2VsZWN0YWJsZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzUm93U2VsZWN0YWJsZTogSXNSb3dTZWxlY3RhYmxlPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIE1hc3RlciBEZXRhaWwgdG8gZGV0ZXJtaW5lIGlmIGEgcm93IHNob3VsZCBiZSBhIG1hc3RlciByb3cuIElmIGBmYWxzZWAgaXMgcmV0dXJuZWQgbm8gZGV0YWlsIHJvdyB3aWxsIGV4aXN0IGZvciB0aGlzIHJvdy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzUm93TWFzdGVyOiBJc1Jvd01hc3RlcjxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGZpbGwgdmFsdWVzIGluc3RlYWQgb2Ygc2ltcGx5IGNvcHlpbmcgdmFsdWVzIG9yIGluY3JlYXNpbmcgbnVtYmVyIHZhbHVlcyB1c2luZyBsaW5lYXIgcHJvZ3Jlc3Npb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsT3BlcmF0aW9uOiAoKHBhcmFtczogRmlsbE9wZXJhdGlvblBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyNy4yIFVzZSBgcG9zdFNvcnRSb3dzYCBpbnN0ZWFkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0U29ydDogKChub2RlczogSVJvd05vZGU8VERhdGE+W10pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBwZXJmb3JtIGFkZGl0aW9uYWwgc29ydGluZyBhZnRlciB0aGUgZ3JpZCBoYXMgc29ydGVkIHRoZSByb3dzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnRSb3dzOiAoKHBhcmFtczogUG9zdFNvcnRSb3dzUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd1N0eWxlYCB0byBzZXQgc3R5bGUgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgQ1NTIHZhbHVlcyBvciB1bmRlZmluZWQgZm9yIG5vIHN0eWxlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd1N0eWxlOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXM8VERhdGE+KSA9PiBSb3dTdHlsZSB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd0NsYXNzYCB0byBzZXQgY2xhc3MoZXMpIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSwgYXJyYXkgb2Ygc3RyaW5ncyAoYXJyYXkgb2YgY2xhc3MgbmFtZXMpIG9yIHVuZGVmaW5lZCBmb3Igbm8gY2xhc3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzczogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dIZWlnaHRgIHRvIHNldCBoZWlnaHQgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhIHBvc2l0aXZlIG51bWJlciBvZiBwaXhlbHMsIG9yIHJldHVybiBgbnVsbGAvYHVuZGVmaW5lZGAgdG8gdXNlIHRoZSBkZWZhdWx0IHJvdyBoZWlnaHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dIZWlnaHQ6ICgocGFyYW1zOiBSb3dIZWlnaHRQYXJhbXM8VERhdGE+KSA9PiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI3LjIgVXNlIGBpc0Z1bGxXaWR0aFJvd2AgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRnVsbFdpZHRoQ2VsbDogKChyb3dOb2RlOiBJUm93Tm9kZTxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUZWxscyB0aGUgZ3JpZCBpZiB0aGlzIHJvdyBzaG91bGQgYmUgcmVuZGVyZWQgYXMgZnVsbCB3aWR0aC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRnVsbFdpZHRoUm93OiAoKHBhcmFtczogSXNGdWxsV2lkdGhSb3dQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIC8qKiBUaGUgdG9vbCBwYW5lbCB3YXMgaGlkZGVuIG9yIHNob3duLiBVc2UgYGFwaS5pc1Rvb2xQYW5lbFNob3dpbmcoKWAgdG8gZ2V0IHN0YXR1cy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sUGFuZWxWaXNpYmxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSB0b29sIHBhbmVsIHNpemUgaGFzIGJlZW4gY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sUGFuZWxTaXplQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFBhc3RlIG9wZXJhdGlvbiBoYXMgc3RhcnRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZVN0YXJ0OiBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlU3RhcnRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFBhc3RlIG9wZXJhdGlvbiBoYXMgZW5kZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVFbmQ6IEV2ZW50RW1pdHRlcjxQYXN0ZUVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiwgb3IgZ3JvdXAgb2YgY29sdW1ucywgd2FzIGhpZGRlbiAvIHNob3duLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZpc2libGU6IEV2ZW50RW1pdHRlcjxDb2x1bW5WaXNpYmxlRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4sIG9yIGdyb3VwIG9mIGNvbHVtbnMsIHdhcyBwaW5uZWQgLyB1bnBpbm5lZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaW5uZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaW5uZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaW5uZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uIHdhcyByZXNpemVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJlc2l6ZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5SZXNpemVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4gd2FzIG1vdmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Nb3ZlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSB2YWx1ZSBjb2x1bW4gd2FzIGFkZGVkIG9yIHJlbW92ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgcGl2b3QgbW9kZSBmbGFnIHdhcyBjaGFuZ2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90TW9kZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBwaXZvdCBjb2x1bW4gd2FzIGFkZGVkLCByZW1vdmVkIG9yIG9yZGVyIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiBncm91cCB3YXMgb3BlbmVkIC8gY2xvc2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkdyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVXNlciBzZXQgbmV3IGNvbHVtbnMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbmV3Q29sdW1uc0xvYWRlZDogRXZlbnRFbWl0dGVyPE5ld0NvbHVtbnNMb2FkZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBncmlkIGNvbHVtbnMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGRpc3BsYXllZCBjb2x1bW5zIGNoYW5nZWQuIFRoaXMgY2FuIHJlc3VsdCBmcm9tIGNvbHVtbnMgb3BlbiAvIGNsb3NlLCBjb2x1bW4gbW92ZSwgcGl2b3QsIGdyb3VwLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiByZW5kZXJlZCBjb2x1bW5zIGNoYW5nZWQgKG9ubHkgY29sdW1ucyBpbiB0aGUgdmlzaWJsZSBzY3JvbGxlZCB2aWV3cG9ydCBhcmUgcmVuZGVyZWQgYnkgZGVmYXVsdCkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBTaG90Z3VuIC0gZ2V0cyBjYWxsZWQgd2hlbiBlaXRoZXIgYSkgbmV3IGNvbHVtbnMgYXJlIHNldCBvciBiKSBgY29sdW1uQXBpLmFwcGx5Q29sdW1uU3RhdGUoKWAgaXMgdXNlZCwgc28gZXZlcnl0aGluZyBoYXMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE9ubHkgdXNlZCBieSBBbmd1bGFyLCBSZWFjdCBhbmQgVnVlSlMgQUcgR3JpZCBjb21wb25lbnRzIChub3QgdXNlZCBpZiBkb2luZyBwbGFpbiBKYXZhU2NyaXB0KS5cbiAgICAgICAgICogSWYgdGhlIGdyaWQgcmVjZWl2ZXMgY2hhbmdlcyBkdWUgdG8gYm91bmQgcHJvcGVydGllcywgdGhpcyBldmVudCBmaXJlcyBhZnRlciB0aGUgZ3JpZCBoYXMgZmluaXNoZWQgcHJvY2Vzc2luZyB0aGUgY2hhbmdlLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbXBvbmVudFN0YXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVmFsdWUgaGFzIGNoYW5nZWQgYWZ0ZXIgZWRpdGluZyAodGhpcyBldmVudCB3aWxsIG5vdCBmaXJlIGlmIGVkaXRpbmcgd2FzIGNhbmNlbGxlZCwgZWcgRVNDIHdhcyBwcmVzc2VkKSBvclxuICAgICAgICAgKiAgaWYgY2VsbCB2YWx1ZSBoYXMgY2hhbmdlZCBhcyBhIHJlc3VsdCBvZiBwYXN0ZSBvcGVyYXRpb24uXG4gICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2VsbFZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFZhbHVlIGhhcyBjaGFuZ2VkIGFmdGVyIGVkaXRpbmcuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBSZWFkIE9ubHkgRWRpdHMsIGllIGByZWFkT25seUVkaXQ9dHJ1ZWAuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNlbGwncyB2YWx1ZSB3aXRoaW4gYSByb3cgaGFzIGNoYW5nZWQuIFRoaXMgZXZlbnQgY29ycmVzcG9uZHMgdG8gRnVsbCBSb3cgRWRpdGluZyBvbmx5LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1ZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJvd1ZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1ZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIGNlbGwgaGFzIHN0YXJ0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgY2VsbCBoYXMgc3RvcHBlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSByb3cgaGFzIHN0YXJ0ZWQgKHdoZW4gcm93IGVkaXRpbmcgaXMgZW5hYmxlZCkuIFdoZW4gcm93IGVkaXRpbmcsIHRoaXMgZXZlbnQgd2lsbCBiZSBmaXJlZCBvbmNlIGFuZCBgY2VsbEVkaXRpbmdTdGFydGVkYCB3aWxsIGJlIGZpcmVkIGZvciBlYWNoIGluZGl2aWR1YWwgY2VsbC4gT25seSBmaXJlcyB3aGVuIGRvaW5nIEZ1bGwgUm93IEVkaXRpbmcuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdG9wcGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RvcHBlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBGdWxsIFJvdyBFZGl0aW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRmlsdGVyIGhhcyBiZWVuIG9wZW5lZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJPcGVuZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJPcGVuZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJPcGVuZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpbHRlciBoYXMgYmVlbiBtb2RpZmllZCBhbmQgYXBwbGllZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8RmlsdGVyQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpbHRlciB3YXMgbW9kaWZpZWQgYnV0IG5vdCBhcHBsaWVkLiBVc2VkIHdoZW4gZmlsdGVycyBoYXZlICdBcHBseScgYnV0dG9ucy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJNb2RpZmllZDogRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyTW9kaWZpZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY2hhcnQgaGFzIGJlZW4gY3JlYXRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydENyZWF0ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGRhdGEgcmFuZ2UgZm9yIHRoZSBjaGFydCBoYXMgYmVlbiBjaGFuZ2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ8VERhdGE+PigpO1xuICAgIC8qKiBGb3JtYXR0aW5nIGNoYW5nZXMgaGF2ZSBiZWVuIG1hZGUgYnkgdXNlcnMgdGhyb3VnaCB0aGUgRm9ybWF0IFBhbmVsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0T3B0aW9uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0T3B0aW9uc0NoYW5nZWQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGRlc3Ryb3llZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydERlc3Ryb3llZDogRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPFREYXRhPj4oKTtcbiAgICAvKiogRE9NIGV2ZW50IGBrZXlEb3duYCBoYXBwZW5lZCBvbiBhIGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEtleURvd246IEV2ZW50RW1pdHRlcjxDZWxsS2V5RG93bkV2ZW50PFREYXRhPiB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRE9NIGV2ZW50IGBrZXlQcmVzc2AgaGFwcGVuZWQgb24gYSBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlQcmVzczogRXZlbnRFbWl0dGVyPENlbGxLZXlQcmVzc0V2ZW50PFREYXRhPiB8IEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxLZXlQcmVzc0V2ZW50PFREYXRhPiB8IEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGdyaWQgaGFzIGluaXRpYWxpc2VkIGFuZCBpcyByZWFkeSBmb3IgbW9zdCBhcGkgY2FsbHMsIGJ1dCBtYXkgbm90IGJlIGZ1bGx5IHJlbmRlcmVkIHlldCAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUmVhZHk6IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpcmVkIHRoZSBmaXJzdCB0aW1lIGRhdGEgaXMgcmVuZGVyZWQgaW50byB0aGUgZ3JpZC4gVXNlIHRoaXMgZXZlbnQgaWYgeW91IHdhbnQgdG8gYXV0byByZXNpemUgY29sdW1ucyBiYXNlZCBvbiB0aGVpciBjb250ZW50cyAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpcnN0RGF0YVJlbmRlcmVkOiBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaXJzdERhdGFSZW5kZXJlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIHNpemUgb2YgdGhlIGdyaWQgYGRpdmAgaGFzIGNoYW5nZWQuIEluIG90aGVyIHdvcmRzLCB0aGUgZ3JpZCB3YXMgcmVzaXplZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIERpc3BsYXllZCByb3dzIGhhdmUgY2hhbmdlZC4gVHJpZ2dlcmVkIGFmdGVyIHNvcnQsIGZpbHRlciBvciB0cmVlIGV4cGFuZCAvIGNvbGxhcHNlIGV2ZW50cy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IHdhcyByZW1vdmVkIGZyb20gdGhlIERPTSwgZm9yIGFueSByZWFzb24uIFVzZSB0byBjbGVhbiB1cCByZXNvdXJjZXMgKGlmIGFueSkgdXNlZCBieSB0aGUgcm93LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxSb3dSZW1vdmVkOiBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogV2hpY2ggcm93cyBhcmUgcmVuZGVyZWQgaW4gdGhlIERPTSBoYXMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aWV3cG9ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBib2R5IHdhcyBzY3JvbGxlZCBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1haW4gYm9keSBvZiB0aGUgZ3JpZCBoYXMgc3RvcHBlZCBzY3JvbGxpbmcsIGVpdGhlciBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsRW5kOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RhcnRzLiBUaGlzIGNvdWxkIGJlIGFueSBhY3Rpb24gdGhhdCB1c2VzIHRoZSBncmlkJ3MgRHJhZyBhbmQgRHJvcCBzZXJ2aWNlLCBlLmcuIENvbHVtbiBNb3ZpbmcsIENvbHVtbiBSZXNpemluZywgUmFuZ2UgU2VsZWN0aW9uLCBGaWxsIEhhbmRsZSwgZXRjLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdGFydGVkOiBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogV2hlbiBkcmFnZ2luZyBzdG9wcy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RvcHBlZDogRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0b3BwZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRyaWdnZXJlZCBldmVyeSB0aW1lIHRoZSBwYWdpbmcgc3RhdGUgY2hhbmdlcy4gU29tZSBvZiB0aGUgbW9zdCBjb21tb24gc2NlbmFyaW9zIGZvciB0aGlzIGV2ZW50IHRvIGJlIHRyaWdnZXJlZCBhcmU6XG4gICAgICAgICAqXG4gICAgICAgICAqICAtIFRoZSBwYWdlIHNpemUgY2hhbmdlcy5cbiAgICAgICAgICogIC0gVGhlIGN1cnJlbnQgc2hvd24gcGFnZSBpcyBjaGFuZ2VkLlxuICAgICAgICAgKiAgLSBOZXcgZGF0YSBpcyBsb2FkZWQgb250byB0aGUgZ3JpZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFnaW5hdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgZHJhZyBoYXMgc3RhcnRlZCwgb3IgZHJhZ2dpbmcgd2FzIGFscmVhZHkgc3RhcnRlZCBhbmQgdGhlIG1vdXNlIGhhcyByZS1lbnRlcmVkIHRoZSBncmlkIGhhdmluZyBwcmV2aW91c2x5IGxlZnQgdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VudGVyOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbW92ZWQgd2hpbGUgZHJhZ2dpbmcuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ01vdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIG1vdXNlIGhhcyBsZWZ0IHRoZSBncmlkIHdoaWxlIGRyYWdnaW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdMZWF2ZTogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgZHJhZyBoYXMgZmluaXNoZWQgb3ZlciB0aGUgZ3JpZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW5kOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IGdyb3VwIGNvbHVtbiB3YXMgYWRkZWQgb3IgcmVtb3ZlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IGdyb3VwIHdhcyBvcGVuZWQgb3IgY2xvc2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0dyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Um93R3JvdXBPcGVuZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRmlyZWQgd2hlbiBjYWxsaW5nIGVpdGhlciBvZiB0aGUgQVBJIG1ldGhvZHMgYGV4cGFuZEFsbCgpYCBvciBgY29sbGFwc2VBbGwoKWAuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZXhwYW5kT3JDb2xsYXBzZUFsbDogRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RXhwYW5kQ29sbGFwc2VBbGxFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBjbGllbnQgaGFzIHNldCBuZXcgcGlubmVkIHJvdyBkYXRhIGludG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGlubmVkUm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjggTm8gbG9uZ2VyIGZpcmVkLCB1c2Ugb25Sb3dEYXRhVXBkYXRlZCBpbnN0ZWFkICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RhdGFDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgY2xpZW50IGhhcyB1cGRhdGVkIGRhdGEgZm9yIHRoZSBncmlkIGJ5IGVpdGhlciBhKSBzZXR0aW5nIG5ldyBSb3cgRGF0YSBvciBiKSBBcHBseWluZyBhIFJvdyBUcmFuc2FjdGlvbi4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhVXBkYXRlZDogRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEFzeW5jIHRyYW5zYWN0aW9ucyBoYXZlIGJlZW4gYXBwbGllZC4gQ29udGFpbnMgYSBsaXN0IG9mIGFsbCB0cmFuc2FjdGlvbiByZXN1bHRzLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDogRXZlbnRFbWl0dGVyPEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ8VERhdGE+PigpO1xuICAgIC8qKiBDZWxsIGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxDbGlja2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDZWxsIGlzIGRvdWJsZSBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8Q2VsbERvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ2VsbCBpcyBmb2N1c2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxGb2N1c2VkOiBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRm9jdXNlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogTW91c2UgZW50ZXJlZCBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU92ZXI6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3ZlckV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogTW91c2UgbGVmdCBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU91dDogRXZlbnRFbWl0dGVyPENlbGxNb3VzZU91dEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZU91dEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogTW91c2UgZG93biBvbiBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZURvd246IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VEb3duRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlRG93bkV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93Q2xpY2tlZDogRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSb3cgaXMgZG91YmxlIGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPFJvd0RvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSb3cgaXMgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC4gVGhlIGV2ZW50IGNvbnRhaW5zIHRoZSBub2RlIGluIHF1ZXN0aW9uLCBzbyBjYWxsIHRoZSBub2RlJ3MgYGlzU2VsZWN0ZWQoKWAgbWV0aG9kIHRvIHNlZSBpZiBpdCB3YXMganVzdCBzZWxlY3RlZCBvciBkZXNlbGVjdGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1NlbGVjdGVkOiBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IHNlbGVjdGlvbiBpcyBjaGFuZ2VkLiBVc2UgdGhlIGdyaWQgQVBJIGBnZXRTZWxlY3RlZE5vZGVzKClgIG9yIGBnZXRTZWxlY3RlZFJvd3MoKWAgdG8gZ2V0IHRoZSBuZXcgbGlzdCBvZiBzZWxlY3RlZCBub2RlcyAvIHJvdyBkYXRhLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8U2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ2VsbCBpcyByaWdodCBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDb250ZXh0TWVudTogRXZlbnRFbWl0dGVyPENlbGxDb250ZXh0TWVudUV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxDb250ZXh0TWVudUV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjaGFuZ2UgdG8gcmFuZ2Ugc2VsZWN0aW9uIGhhcyBvY2N1cnJlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByYW5nZVNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFNvcnQgaGFzIGNoYW5nZWQuIFRoZSBncmlkIGFsc28gbGlzdGVucyBmb3IgdGhpcyBhbmQgdXBkYXRlcyB0aGUgbW9kZWwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc29ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuXG5cbiAgICAvLyBFbmFibGUgdHlwZSBjb2VyY2lvbiBmb3IgYm9vbGVhbiBJbnB1dHMgdG8gc3VwcG9ydCB1c2UgbGlrZSAnZW5hYmxlQ2hhcnRzJyBpbnN0ZWFkIG9mIGZvcmNpbmcgJ1tlbmFibGVDaGFydHNdPVwidHJ1ZVwiJyBcbiAgICAvLyBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdGVtcGxhdGUtdHlwZWNoZWNrI2lucHV0LXNldHRlci1jb2VyY2lvbiBcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYWtlQ29sdW1uVmlzaWJsZUFmdGVyVW5Hcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDZWxsU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NlbGxGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWJ1ZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQnJvd3NlclRvb2x0aXBzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsRXhwcmVzc2lvbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEluY2x1ZGVGb290ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwSW5jbHVkZVRvdGFsRm9vdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFN1cHByZXNzQmxhbmtIZWFkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWVudUhpZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93RGVzZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3VuU29ydEljb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTXVsdGlTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNNdWx0aVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NOb1Jvd3NPdmVybGF5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9za2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQYXJlbnRzSW5Sb3dOb2RlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vdmFibGVDb2x1bW5zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZpZWxkRG90Tm90YXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSYW5nZUhhbmRsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlRmlsbEhhbmRsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVsdGFTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FzeW5jRXZlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29udGV4dE1lbnU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3JlbWVtYmVyR3JvdXBTdGF0ZVdoZW5OZXdEYXRhOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRHJhZ0xlYXZlSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0dyb3VwSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01pZGRsZUNsaWNrU2Nyb2xsczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQcmV2ZW50RGVmYXVsdE9uTW91c2VXaGVlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb3B5SGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb3B5R3JvdXBIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90TW9kZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dGdW5jSW5IZWFkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uVmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWdnQXRSb290TGV2ZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRm9jdXNBZnRlclJlZnJlc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Z1bmN0aW9uc1Bhc3NpdmU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Z1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbmltYXRlUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTZWxlY3RzRmlsdGVyZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwUmVtb3ZlTG93ZXN0U2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJ0bDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlja0VkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdFbnRpcmVSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdNYW5hZ2VkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0RyYWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ011bHRpUm93OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQYWdpbmF0aW9uUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwSGlkZU9wZW5QYXJlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEFsbG93VW5iYWxhbmNlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3B1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Vuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90cmVlRGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0hvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd1RyYW5zZm9ybTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NMYXN0RW1wdHlMaW5lT25QYXN0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2hhcnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDaGFydFRvb2xQYW5lbHNCdXR0b246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2hhcnRUb29sUGFuZWxzQnV0dG9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01haW50YWluVW5zb3J0ZWRPcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01heFJlbmRlcmVkUm93UmVzdHJpY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2V4Y2x1ZGVDaGlsZHJlbldoZW5UcmVlRGF0YUZpbHRlcmluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2tlZXBEZXRhaWxSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0ZUNoaWxkUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91bmRvUmVkb0NlbGxFZGl0aW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbGxvd0RyYWdGcm9tQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW1tdXRhYmxlRGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3RTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhwYW5kYWJsZVBpdm90R3JvdXBzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWJvdW5jZVZlcnRpY2FsU2Nyb2xsYmFyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZXRhaWxSb3dBdXRvSGVpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlRmlsdGVyaW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlU29ydGluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZVNvcnRBbGxMZXZlbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVGaWx0ZXJBbGxMZXZlbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0T25TZXJ2ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVGaWx0ZXJPblNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Nob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVhY3RVaTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSZWFjdFVpOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZWFkT25seUVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxFZGl0aW5nT25CYWNrc3BhY2U6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jlc2V0Um93RGF0YU9uVXBkYXRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZW1vdmVQaXZvdEhlYWRlclJvd1doZW5TaW5nbGVWYWx1ZUNvbHVtbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb3B5U2luZ2xlQ2VsbFJhbmdlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSb3dzU3RpY2t5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1NlcnZlclNpZGVJbmZpbml0ZVNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93R3JvdXBQYW5lbFN1cHByZXNzU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dTaG93Q2hhbmdlQWZ0ZXJGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgLy8gQEVOREBcbn1cblxuIl19