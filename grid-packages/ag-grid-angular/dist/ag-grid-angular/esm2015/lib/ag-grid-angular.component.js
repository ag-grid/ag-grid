import { Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { AgPromise, ComponentUtil, Grid } from "ag-grid-community";
// @END_IMPORTS@
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import * as i0 from "@angular/core";
import * as i1 from "./angularFrameworkOverrides";
import * as i2 from "./angularFrameworkComponentWrapper";
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
        /** How many milliseconds to wait before loading a block. Useful when scrolling over many blocks, as it prevents blocks loading until scrolling has settled.     */
        this.blockLoadDebounceMillis = undefined;
        /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping. Default: `false`      */
        this.purgeClosedRowNodes = undefined;
        /** Provide the `serverSideDatasource` for server side row model.     */
        this.serverSideDatasource = undefined;
        /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server. Default: `false`     */
        this.serverSideSortAllLevels = undefined;
        /** When enabled, always refreshes top level groups regardless of which column was filtered. This property only applies when there is Row Grouping & filtering is handled on the server. Default: `false`     */
        this.serverSideFilterAllLevels = undefined;
        /**
             * When enabled, Sorting will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
             * Default: `false`
             */
        this.serverSideSortOnServer = undefined;
        /** When enabled, Filtering will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
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
AgGridAngular.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AgGridAngular, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1.AngularFrameworkOverrides }, { token: i2.AngularFrameworkComponentWrapper }, { token: i0.ComponentFactoryResolver }], target: i0.ɵɵFactoryTarget.Component });
AgGridAngular.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.17", type: AgGridAngular, selector: "ag-grid-angular", inputs: { gridOptions: "gridOptions", modules: "modules", statusBar: "statusBar", sideBar: "sideBar", suppressContextMenu: "suppressContextMenu", preventDefaultOnContextMenu: "preventDefaultOnContextMenu", allowContextMenuWithControlKey: "allowContextMenuWithControlKey", suppressMenuHide: "suppressMenuHide", enableBrowserTooltips: "enableBrowserTooltips", tooltipShowDelay: "tooltipShowDelay", tooltipHideDelay: "tooltipHideDelay", tooltipMouseTrack: "tooltipMouseTrack", popupParent: "popupParent", copyHeadersToClipboard: "copyHeadersToClipboard", copyGroupHeadersToClipboard: "copyGroupHeadersToClipboard", clipboardDelimiter: "clipboardDelimiter", suppressCopyRowsToClipboard: "suppressCopyRowsToClipboard", suppressCopySingleCellRanges: "suppressCopySingleCellRanges", suppressLastEmptyLineOnPaste: "suppressLastEmptyLineOnPaste", suppressClipboardPaste: "suppressClipboardPaste", suppressClipboardApi: "suppressClipboardApi", columnDefs: "columnDefs", defaultColDef: "defaultColDef", defaultColGroupDef: "defaultColGroupDef", columnTypes: "columnTypes", maintainColumnOrder: "maintainColumnOrder", suppressFieldDotNotation: "suppressFieldDotNotation", headerHeight: "headerHeight", groupHeaderHeight: "groupHeaderHeight", floatingFiltersHeight: "floatingFiltersHeight", pivotHeaderHeight: "pivotHeaderHeight", pivotGroupHeaderHeight: "pivotGroupHeaderHeight", allowDragFromColumnsToolPanel: "allowDragFromColumnsToolPanel", suppressMovableColumns: "suppressMovableColumns", suppressColumnMoveAnimation: "suppressColumnMoveAnimation", suppressDragLeaveHidesColumns: "suppressDragLeaveHidesColumns", suppressRowGroupHidesColumns: "suppressRowGroupHidesColumns", colResizeDefault: "colResizeDefault", suppressAutoSize: "suppressAutoSize", autoSizePadding: "autoSizePadding", skipHeaderOnAutoSize: "skipHeaderOnAutoSize", components: "components", frameworkComponents: "frameworkComponents", editType: "editType", singleClickEdit: "singleClickEdit", suppressClickEdit: "suppressClickEdit", readOnlyEdit: "readOnlyEdit", stopEditingWhenCellsLoseFocus: "stopEditingWhenCellsLoseFocus", enterMovesDown: "enterMovesDown", enterMovesDownAfterEdit: "enterMovesDownAfterEdit", enableCellEditingOnBackspace: "enableCellEditingOnBackspace", undoRedoCellEditing: "undoRedoCellEditing", undoRedoCellEditingLimit: "undoRedoCellEditingLimit", defaultCsvExportParams: "defaultCsvExportParams", suppressCsvExport: "suppressCsvExport", defaultExcelExportParams: "defaultExcelExportParams", suppressExcelExport: "suppressExcelExport", excelStyles: "excelStyles", quickFilterText: "quickFilterText", cacheQuickFilter: "cacheQuickFilter", excludeChildrenWhenTreeDataFiltering: "excludeChildrenWhenTreeDataFiltering", enableCharts: "enableCharts", chartThemes: "chartThemes", customChartThemes: "customChartThemes", chartThemeOverrides: "chartThemeOverrides", enableChartToolPanelsButton: "enableChartToolPanelsButton", suppressChartToolPanelsButton: "suppressChartToolPanelsButton", chartToolPanelsDef: "chartToolPanelsDef", loadingCellRenderer: "loadingCellRenderer", loadingCellRendererFramework: "loadingCellRendererFramework", loadingCellRendererParams: "loadingCellRendererParams", loadingCellRendererSelector: "loadingCellRendererSelector", localeText: "localeText", masterDetail: "masterDetail", keepDetailRows: "keepDetailRows", keepDetailRowsCount: "keepDetailRowsCount", detailCellRenderer: "detailCellRenderer", detailCellRendererFramework: "detailCellRendererFramework", detailCellRendererParams: "detailCellRendererParams", detailRowHeight: "detailRowHeight", detailRowAutoHeight: "detailRowAutoHeight", context: "context", alignedGrids: "alignedGrids", tabIndex: "tabIndex", rowBuffer: "rowBuffer", valueCache: "valueCache", valueCacheNeverExpires: "valueCacheNeverExpires", enableCellExpressions: "enableCellExpressions", suppressParentsInRowNodes: "suppressParentsInRowNodes", suppressTouch: "suppressTouch", suppressFocusAfterRefresh: "suppressFocusAfterRefresh", suppressAsyncEvents: "suppressAsyncEvents", suppressBrowserResizeObserver: "suppressBrowserResizeObserver", suppressPropertyNamesCheck: "suppressPropertyNamesCheck", suppressChangeDetection: "suppressChangeDetection", debug: "debug", overlayLoadingTemplate: "overlayLoadingTemplate", loadingOverlayComponent: "loadingOverlayComponent", loadingOverlayComponentFramework: "loadingOverlayComponentFramework", loadingOverlayComponentParams: "loadingOverlayComponentParams", suppressLoadingOverlay: "suppressLoadingOverlay", overlayNoRowsTemplate: "overlayNoRowsTemplate", noRowsOverlayComponent: "noRowsOverlayComponent", noRowsOverlayComponentFramework: "noRowsOverlayComponentFramework", noRowsOverlayComponentParams: "noRowsOverlayComponentParams", suppressNoRowsOverlay: "suppressNoRowsOverlay", pagination: "pagination", paginationPageSize: "paginationPageSize", paginationAutoPageSize: "paginationAutoPageSize", paginateChildRows: "paginateChildRows", suppressPaginationPanel: "suppressPaginationPanel", pivotMode: "pivotMode", pivotPanelShow: "pivotPanelShow", pivotColumnGroupTotals: "pivotColumnGroupTotals", pivotRowTotals: "pivotRowTotals", pivotSuppressAutoColumn: "pivotSuppressAutoColumn", suppressExpandablePivotGroups: "suppressExpandablePivotGroups", functionsReadOnly: "functionsReadOnly", aggFuncs: "aggFuncs", suppressAggFuncInHeader: "suppressAggFuncInHeader", suppressAggAtRootLevel: "suppressAggAtRootLevel", aggregateOnlyChangedColumns: "aggregateOnlyChangedColumns", suppressAggFilteredOnly: "suppressAggFilteredOnly", removePivotHeaderRowWhenSingleValueColumn: "removePivotHeaderRowWhenSingleValueColumn", animateRows: "animateRows", enableCellChangeFlash: "enableCellChangeFlash", cellFlashDelay: "cellFlashDelay", cellFadeDelay: "cellFadeDelay", allowShowChangeAfterFilter: "allowShowChangeAfterFilter", domLayout: "domLayout", ensureDomOrder: "ensureDomOrder", enableRtl: "enableRtl", suppressColumnVirtualisation: "suppressColumnVirtualisation", suppressMaxRenderedRowRestriction: "suppressMaxRenderedRowRestriction", suppressRowVirtualisation: "suppressRowVirtualisation", rowDragManaged: "rowDragManaged", suppressRowDrag: "suppressRowDrag", suppressMoveWhenRowDragging: "suppressMoveWhenRowDragging", rowDragEntireRow: "rowDragEntireRow", rowDragMultiRow: "rowDragMultiRow", rowDragText: "rowDragText", fullWidthCellRenderer: "fullWidthCellRenderer", fullWidthCellRendererFramework: "fullWidthCellRendererFramework", fullWidthCellRendererParams: "fullWidthCellRendererParams", embedFullWidthRows: "embedFullWidthRows", groupDisplayType: "groupDisplayType", groupDefaultExpanded: "groupDefaultExpanded", autoGroupColumnDef: "autoGroupColumnDef", groupMaintainOrder: "groupMaintainOrder", groupSelectsChildren: "groupSelectsChildren", groupAggFiltering: "groupAggFiltering", groupIncludeFooter: "groupIncludeFooter", groupIncludeTotalFooter: "groupIncludeTotalFooter", groupSuppressBlankHeader: "groupSuppressBlankHeader", groupSelectsFiltered: "groupSelectsFiltered", showOpenedGroup: "showOpenedGroup", groupRemoveSingleChildren: "groupRemoveSingleChildren", groupRemoveLowestSingleChildren: "groupRemoveLowestSingleChildren", groupHideOpenParents: "groupHideOpenParents", groupAllowUnbalanced: "groupAllowUnbalanced", rowGroupPanelShow: "rowGroupPanelShow", groupRowRenderer: "groupRowRenderer", groupRowRendererFramework: "groupRowRendererFramework", groupRowRendererParams: "groupRowRendererParams", suppressMakeColumnVisibleAfterUnGroup: "suppressMakeColumnVisibleAfterUnGroup", treeData: "treeData", rowGroupPanelSuppressSort: "rowGroupPanelSuppressSort", groupRowsSticky: "groupRowsSticky", rememberGroupStateWhenNewData: "rememberGroupStateWhenNewData", pinnedTopRowData: "pinnedTopRowData", pinnedBottomRowData: "pinnedBottomRowData", rowModelType: "rowModelType", rowData: "rowData", immutableData: "immutableData", asyncTransactionWaitMillis: "asyncTransactionWaitMillis", suppressModelUpdateAfterUpdateTransaction: "suppressModelUpdateAfterUpdateTransaction", datasource: "datasource", cacheOverflowSize: "cacheOverflowSize", infiniteInitialRowCount: "infiniteInitialRowCount", serverSideInitialRowCount: "serverSideInitialRowCount", serverSideStoreType: "serverSideStoreType", suppressServerSideInfiniteScroll: "suppressServerSideInfiniteScroll", cacheBlockSize: "cacheBlockSize", maxBlocksInCache: "maxBlocksInCache", maxConcurrentDatasourceRequests: "maxConcurrentDatasourceRequests", blockLoadDebounceMillis: "blockLoadDebounceMillis", purgeClosedRowNodes: "purgeClosedRowNodes", serverSideDatasource: "serverSideDatasource", serverSideSortAllLevels: "serverSideSortAllLevels", serverSideFilterAllLevels: "serverSideFilterAllLevels", serverSideSortOnServer: "serverSideSortOnServer", serverSideFilterOnServer: "serverSideFilterOnServer", serverSideSortingAlwaysResets: "serverSideSortingAlwaysResets", serverSideFilteringAlwaysResets: "serverSideFilteringAlwaysResets", viewportDatasource: "viewportDatasource", viewportRowModelPageSize: "viewportRowModelPageSize", viewportRowModelBufferSize: "viewportRowModelBufferSize", alwaysShowHorizontalScroll: "alwaysShowHorizontalScroll", alwaysShowVerticalScroll: "alwaysShowVerticalScroll", debounceVerticalScrollbar: "debounceVerticalScrollbar", suppressHorizontalScroll: "suppressHorizontalScroll", suppressScrollOnNewData: "suppressScrollOnNewData", suppressScrollWhenPopupsAreOpen: "suppressScrollWhenPopupsAreOpen", suppressAnimationFrame: "suppressAnimationFrame", suppressMiddleClickScrolls: "suppressMiddleClickScrolls", suppressPreventDefaultOnMouseWheel: "suppressPreventDefaultOnMouseWheel", scrollbarWidth: "scrollbarWidth", rowSelection: "rowSelection", rowMultiSelectWithClick: "rowMultiSelectWithClick", suppressRowDeselection: "suppressRowDeselection", suppressRowClickSelection: "suppressRowClickSelection", suppressCellSelection: "suppressCellSelection", suppressCellFocus: "suppressCellFocus", suppressMultiRangeSelection: "suppressMultiRangeSelection", enableCellTextSelection: "enableCellTextSelection", enableRangeSelection: "enableRangeSelection", enableRangeHandle: "enableRangeHandle", enableFillHandle: "enableFillHandle", fillHandleDirection: "fillHandleDirection", suppressClearOnFillReduction: "suppressClearOnFillReduction", sortingOrder: "sortingOrder", accentedSort: "accentedSort", unSortIcon: "unSortIcon", suppressMultiSort: "suppressMultiSort", alwaysMultiSort: "alwaysMultiSort", multiSortKey: "multiSortKey", suppressMaintainUnsortedOrder: "suppressMaintainUnsortedOrder", icons: "icons", rowHeight: "rowHeight", rowStyle: "rowStyle", rowClass: "rowClass", rowClassRules: "rowClassRules", suppressRowHoverHighlight: "suppressRowHoverHighlight", suppressRowTransform: "suppressRowTransform", columnHoverHighlight: "columnHoverHighlight", deltaSort: "deltaSort", treeDataDisplayType: "treeDataDisplayType", functionsPassive: "functionsPassive", enableGroupEdit: "enableGroupEdit", getContextMenuItems: "getContextMenuItems", getMainMenuItems: "getMainMenuItems", postProcessPopup: "postProcessPopup", processCellForClipboard: "processCellForClipboard", processHeaderForClipboard: "processHeaderForClipboard", processGroupHeaderForClipboard: "processGroupHeaderForClipboard", processCellFromClipboard: "processCellFromClipboard", sendToClipboard: "sendToClipboard", processDataFromClipboard: "processDataFromClipboard", isExternalFilterPresent: "isExternalFilterPresent", doesExternalFilterPass: "doesExternalFilterPass", getChartToolbarItems: "getChartToolbarItems", createChartContainer: "createChartContainer", navigateToNextHeader: "navigateToNextHeader", tabToNextHeader: "tabToNextHeader", navigateToNextCell: "navigateToNextCell", tabToNextCell: "tabToNextCell", localeTextFunc: "localeTextFunc", getLocaleText: "getLocaleText", getDocument: "getDocument", paginationNumberFormatter: "paginationNumberFormatter", groupRowAggNodes: "groupRowAggNodes", getGroupRowAgg: "getGroupRowAgg", isGroupOpenByDefault: "isGroupOpenByDefault", initialGroupOrderComparator: "initialGroupOrderComparator", defaultGroupOrderComparator: "defaultGroupOrderComparator", processSecondaryColDef: "processSecondaryColDef", processSecondaryColGroupDef: "processSecondaryColGroupDef", processPivotResultColDef: "processPivotResultColDef", processPivotResultColGroupDef: "processPivotResultColGroupDef", getDataPath: "getDataPath", getChildCount: "getChildCount", getServerSideGroupLevelParams: "getServerSideGroupLevelParams", getServerSideStoreParams: "getServerSideStoreParams", isServerSideGroupOpenByDefault: "isServerSideGroupOpenByDefault", isApplyServerSideTransaction: "isApplyServerSideTransaction", isServerSideGroup: "isServerSideGroup", getServerSideGroupKey: "getServerSideGroupKey", getBusinessKeyForNode: "getBusinessKeyForNode", getRowNodeId: "getRowNodeId", getRowId: "getRowId", resetRowDataOnUpdate: "resetRowDataOnUpdate", processRowPostCreate: "processRowPostCreate", isRowSelectable: "isRowSelectable", isRowMaster: "isRowMaster", fillOperation: "fillOperation", postSort: "postSort", postSortRows: "postSortRows", getRowStyle: "getRowStyle", getRowClass: "getRowClass", getRowHeight: "getRowHeight", isFullWidthCell: "isFullWidthCell", isFullWidthRow: "isFullWidthRow" }, outputs: { toolPanelVisibleChanged: "toolPanelVisibleChanged", toolPanelSizeChanged: "toolPanelSizeChanged", pasteStart: "pasteStart", pasteEnd: "pasteEnd", columnVisible: "columnVisible", columnPinned: "columnPinned", columnResized: "columnResized", columnMoved: "columnMoved", columnValueChanged: "columnValueChanged", columnPivotModeChanged: "columnPivotModeChanged", columnPivotChanged: "columnPivotChanged", columnGroupOpened: "columnGroupOpened", newColumnsLoaded: "newColumnsLoaded", gridColumnsChanged: "gridColumnsChanged", displayedColumnsChanged: "displayedColumnsChanged", virtualColumnsChanged: "virtualColumnsChanged", columnEverythingChanged: "columnEverythingChanged", componentStateChanged: "componentStateChanged", cellValueChanged: "cellValueChanged", cellEditRequest: "cellEditRequest", rowValueChanged: "rowValueChanged", cellEditingStarted: "cellEditingStarted", cellEditingStopped: "cellEditingStopped", rowEditingStarted: "rowEditingStarted", rowEditingStopped: "rowEditingStopped", filterOpened: "filterOpened", filterChanged: "filterChanged", filterModified: "filterModified", chartCreated: "chartCreated", chartRangeSelectionChanged: "chartRangeSelectionChanged", chartOptionsChanged: "chartOptionsChanged", chartDestroyed: "chartDestroyed", cellKeyDown: "cellKeyDown", cellKeyPress: "cellKeyPress", gridReady: "gridReady", firstDataRendered: "firstDataRendered", gridSizeChanged: "gridSizeChanged", modelUpdated: "modelUpdated", virtualRowRemoved: "virtualRowRemoved", viewportChanged: "viewportChanged", bodyScroll: "bodyScroll", bodyScrollEnd: "bodyScrollEnd", dragStarted: "dragStarted", dragStopped: "dragStopped", paginationChanged: "paginationChanged", rowDragEnter: "rowDragEnter", rowDragMove: "rowDragMove", rowDragLeave: "rowDragLeave", rowDragEnd: "rowDragEnd", columnRowGroupChanged: "columnRowGroupChanged", rowGroupOpened: "rowGroupOpened", expandOrCollapseAll: "expandOrCollapseAll", pinnedRowDataChanged: "pinnedRowDataChanged", rowDataChanged: "rowDataChanged", rowDataUpdated: "rowDataUpdated", asyncTransactionsFlushed: "asyncTransactionsFlushed", cellClicked: "cellClicked", cellDoubleClicked: "cellDoubleClicked", cellFocused: "cellFocused", cellMouseOver: "cellMouseOver", cellMouseOut: "cellMouseOut", cellMouseDown: "cellMouseDown", rowClicked: "rowClicked", rowDoubleClicked: "rowDoubleClicked", rowSelected: "rowSelected", selectionChanged: "selectionChanged", cellContextMenu: "cellContextMenu", rangeSelectionChanged: "rangeSelectionChanged", sortChanged: "sortChanged", columnRowGroupChangeRequest: "columnRowGroupChangeRequest", columnPivotChangeRequest: "columnPivotChangeRequest", columnValueChangeRequest: "columnValueChangeRequest", columnAggFuncChangeRequest: "columnAggFuncChangeRequest" }, providers: [
        AngularFrameworkOverrides,
        AngularFrameworkComponentWrapper
    ], usesOnChanges: true, ngImport: i0, template: '', isInline: true, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: AgGridAngular, decorators: [{
            type: Component,
            args: [{
                    selector: 'ag-grid-angular',
                    template: '',
                    providers: [
                        AngularFrameworkOverrides,
                        AngularFrameworkComponentWrapper
                    ],
                    // tell angular we don't want view encapsulation, we don't want a shadow root
                    encapsulation: ViewEncapsulation.None
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i1.AngularFrameworkOverrides }, { type: i2.AngularFrameworkComponentWrapper }, { type: i0.ComponentFactoryResolver }]; }, propDecorators: { gridOptions: [{
                type: Input
            }], modules: [{
                type: Input
            }], statusBar: [{
                type: Input
            }], sideBar: [{
                type: Input
            }], suppressContextMenu: [{
                type: Input
            }], preventDefaultOnContextMenu: [{
                type: Input
            }], allowContextMenuWithControlKey: [{
                type: Input
            }], suppressMenuHide: [{
                type: Input
            }], enableBrowserTooltips: [{
                type: Input
            }], tooltipShowDelay: [{
                type: Input
            }], tooltipHideDelay: [{
                type: Input
            }], tooltipMouseTrack: [{
                type: Input
            }], popupParent: [{
                type: Input
            }], copyHeadersToClipboard: [{
                type: Input
            }], copyGroupHeadersToClipboard: [{
                type: Input
            }], clipboardDelimiter: [{
                type: Input
            }], suppressCopyRowsToClipboard: [{
                type: Input
            }], suppressCopySingleCellRanges: [{
                type: Input
            }], suppressLastEmptyLineOnPaste: [{
                type: Input
            }], suppressClipboardPaste: [{
                type: Input
            }], suppressClipboardApi: [{
                type: Input
            }], columnDefs: [{
                type: Input
            }], defaultColDef: [{
                type: Input
            }], defaultColGroupDef: [{
                type: Input
            }], columnTypes: [{
                type: Input
            }], maintainColumnOrder: [{
                type: Input
            }], suppressFieldDotNotation: [{
                type: Input
            }], headerHeight: [{
                type: Input
            }], groupHeaderHeight: [{
                type: Input
            }], floatingFiltersHeight: [{
                type: Input
            }], pivotHeaderHeight: [{
                type: Input
            }], pivotGroupHeaderHeight: [{
                type: Input
            }], allowDragFromColumnsToolPanel: [{
                type: Input
            }], suppressMovableColumns: [{
                type: Input
            }], suppressColumnMoveAnimation: [{
                type: Input
            }], suppressDragLeaveHidesColumns: [{
                type: Input
            }], suppressRowGroupHidesColumns: [{
                type: Input
            }], colResizeDefault: [{
                type: Input
            }], suppressAutoSize: [{
                type: Input
            }], autoSizePadding: [{
                type: Input
            }], skipHeaderOnAutoSize: [{
                type: Input
            }], components: [{
                type: Input
            }], frameworkComponents: [{
                type: Input
            }], editType: [{
                type: Input
            }], singleClickEdit: [{
                type: Input
            }], suppressClickEdit: [{
                type: Input
            }], readOnlyEdit: [{
                type: Input
            }], stopEditingWhenCellsLoseFocus: [{
                type: Input
            }], enterMovesDown: [{
                type: Input
            }], enterMovesDownAfterEdit: [{
                type: Input
            }], enableCellEditingOnBackspace: [{
                type: Input
            }], undoRedoCellEditing: [{
                type: Input
            }], undoRedoCellEditingLimit: [{
                type: Input
            }], defaultCsvExportParams: [{
                type: Input
            }], suppressCsvExport: [{
                type: Input
            }], defaultExcelExportParams: [{
                type: Input
            }], suppressExcelExport: [{
                type: Input
            }], excelStyles: [{
                type: Input
            }], quickFilterText: [{
                type: Input
            }], cacheQuickFilter: [{
                type: Input
            }], excludeChildrenWhenTreeDataFiltering: [{
                type: Input
            }], enableCharts: [{
                type: Input
            }], chartThemes: [{
                type: Input
            }], customChartThemes: [{
                type: Input
            }], chartThemeOverrides: [{
                type: Input
            }], enableChartToolPanelsButton: [{
                type: Input
            }], suppressChartToolPanelsButton: [{
                type: Input
            }], chartToolPanelsDef: [{
                type: Input
            }], loadingCellRenderer: [{
                type: Input
            }], loadingCellRendererFramework: [{
                type: Input
            }], loadingCellRendererParams: [{
                type: Input
            }], loadingCellRendererSelector: [{
                type: Input
            }], localeText: [{
                type: Input
            }], masterDetail: [{
                type: Input
            }], keepDetailRows: [{
                type: Input
            }], keepDetailRowsCount: [{
                type: Input
            }], detailCellRenderer: [{
                type: Input
            }], detailCellRendererFramework: [{
                type: Input
            }], detailCellRendererParams: [{
                type: Input
            }], detailRowHeight: [{
                type: Input
            }], detailRowAutoHeight: [{
                type: Input
            }], context: [{
                type: Input
            }], alignedGrids: [{
                type: Input
            }], tabIndex: [{
                type: Input
            }], rowBuffer: [{
                type: Input
            }], valueCache: [{
                type: Input
            }], valueCacheNeverExpires: [{
                type: Input
            }], enableCellExpressions: [{
                type: Input
            }], suppressParentsInRowNodes: [{
                type: Input
            }], suppressTouch: [{
                type: Input
            }], suppressFocusAfterRefresh: [{
                type: Input
            }], suppressAsyncEvents: [{
                type: Input
            }], suppressBrowserResizeObserver: [{
                type: Input
            }], suppressPropertyNamesCheck: [{
                type: Input
            }], suppressChangeDetection: [{
                type: Input
            }], debug: [{
                type: Input
            }], overlayLoadingTemplate: [{
                type: Input
            }], loadingOverlayComponent: [{
                type: Input
            }], loadingOverlayComponentFramework: [{
                type: Input
            }], loadingOverlayComponentParams: [{
                type: Input
            }], suppressLoadingOverlay: [{
                type: Input
            }], overlayNoRowsTemplate: [{
                type: Input
            }], noRowsOverlayComponent: [{
                type: Input
            }], noRowsOverlayComponentFramework: [{
                type: Input
            }], noRowsOverlayComponentParams: [{
                type: Input
            }], suppressNoRowsOverlay: [{
                type: Input
            }], pagination: [{
                type: Input
            }], paginationPageSize: [{
                type: Input
            }], paginationAutoPageSize: [{
                type: Input
            }], paginateChildRows: [{
                type: Input
            }], suppressPaginationPanel: [{
                type: Input
            }], pivotMode: [{
                type: Input
            }], pivotPanelShow: [{
                type: Input
            }], pivotColumnGroupTotals: [{
                type: Input
            }], pivotRowTotals: [{
                type: Input
            }], pivotSuppressAutoColumn: [{
                type: Input
            }], suppressExpandablePivotGroups: [{
                type: Input
            }], functionsReadOnly: [{
                type: Input
            }], aggFuncs: [{
                type: Input
            }], suppressAggFuncInHeader: [{
                type: Input
            }], suppressAggAtRootLevel: [{
                type: Input
            }], aggregateOnlyChangedColumns: [{
                type: Input
            }], suppressAggFilteredOnly: [{
                type: Input
            }], removePivotHeaderRowWhenSingleValueColumn: [{
                type: Input
            }], animateRows: [{
                type: Input
            }], enableCellChangeFlash: [{
                type: Input
            }], cellFlashDelay: [{
                type: Input
            }], cellFadeDelay: [{
                type: Input
            }], allowShowChangeAfterFilter: [{
                type: Input
            }], domLayout: [{
                type: Input
            }], ensureDomOrder: [{
                type: Input
            }], enableRtl: [{
                type: Input
            }], suppressColumnVirtualisation: [{
                type: Input
            }], suppressMaxRenderedRowRestriction: [{
                type: Input
            }], suppressRowVirtualisation: [{
                type: Input
            }], rowDragManaged: [{
                type: Input
            }], suppressRowDrag: [{
                type: Input
            }], suppressMoveWhenRowDragging: [{
                type: Input
            }], rowDragEntireRow: [{
                type: Input
            }], rowDragMultiRow: [{
                type: Input
            }], rowDragText: [{
                type: Input
            }], fullWidthCellRenderer: [{
                type: Input
            }], fullWidthCellRendererFramework: [{
                type: Input
            }], fullWidthCellRendererParams: [{
                type: Input
            }], embedFullWidthRows: [{
                type: Input
            }], groupDisplayType: [{
                type: Input
            }], groupDefaultExpanded: [{
                type: Input
            }], autoGroupColumnDef: [{
                type: Input
            }], groupMaintainOrder: [{
                type: Input
            }], groupSelectsChildren: [{
                type: Input
            }], groupAggFiltering: [{
                type: Input
            }], groupIncludeFooter: [{
                type: Input
            }], groupIncludeTotalFooter: [{
                type: Input
            }], groupSuppressBlankHeader: [{
                type: Input
            }], groupSelectsFiltered: [{
                type: Input
            }], showOpenedGroup: [{
                type: Input
            }], groupRemoveSingleChildren: [{
                type: Input
            }], groupRemoveLowestSingleChildren: [{
                type: Input
            }], groupHideOpenParents: [{
                type: Input
            }], groupAllowUnbalanced: [{
                type: Input
            }], rowGroupPanelShow: [{
                type: Input
            }], groupRowRenderer: [{
                type: Input
            }], groupRowRendererFramework: [{
                type: Input
            }], groupRowRendererParams: [{
                type: Input
            }], suppressMakeColumnVisibleAfterUnGroup: [{
                type: Input
            }], treeData: [{
                type: Input
            }], rowGroupPanelSuppressSort: [{
                type: Input
            }], groupRowsSticky: [{
                type: Input
            }], rememberGroupStateWhenNewData: [{
                type: Input
            }], pinnedTopRowData: [{
                type: Input
            }], pinnedBottomRowData: [{
                type: Input
            }], rowModelType: [{
                type: Input
            }], rowData: [{
                type: Input
            }], immutableData: [{
                type: Input
            }], asyncTransactionWaitMillis: [{
                type: Input
            }], suppressModelUpdateAfterUpdateTransaction: [{
                type: Input
            }], datasource: [{
                type: Input
            }], cacheOverflowSize: [{
                type: Input
            }], infiniteInitialRowCount: [{
                type: Input
            }], serverSideInitialRowCount: [{
                type: Input
            }], serverSideStoreType: [{
                type: Input
            }], suppressServerSideInfiniteScroll: [{
                type: Input
            }], cacheBlockSize: [{
                type: Input
            }], maxBlocksInCache: [{
                type: Input
            }], maxConcurrentDatasourceRequests: [{
                type: Input
            }], blockLoadDebounceMillis: [{
                type: Input
            }], purgeClosedRowNodes: [{
                type: Input
            }], serverSideDatasource: [{
                type: Input
            }], serverSideSortAllLevels: [{
                type: Input
            }], serverSideFilterAllLevels: [{
                type: Input
            }], serverSideSortOnServer: [{
                type: Input
            }], serverSideFilterOnServer: [{
                type: Input
            }], serverSideSortingAlwaysResets: [{
                type: Input
            }], serverSideFilteringAlwaysResets: [{
                type: Input
            }], viewportDatasource: [{
                type: Input
            }], viewportRowModelPageSize: [{
                type: Input
            }], viewportRowModelBufferSize: [{
                type: Input
            }], alwaysShowHorizontalScroll: [{
                type: Input
            }], alwaysShowVerticalScroll: [{
                type: Input
            }], debounceVerticalScrollbar: [{
                type: Input
            }], suppressHorizontalScroll: [{
                type: Input
            }], suppressScrollOnNewData: [{
                type: Input
            }], suppressScrollWhenPopupsAreOpen: [{
                type: Input
            }], suppressAnimationFrame: [{
                type: Input
            }], suppressMiddleClickScrolls: [{
                type: Input
            }], suppressPreventDefaultOnMouseWheel: [{
                type: Input
            }], scrollbarWidth: [{
                type: Input
            }], rowSelection: [{
                type: Input
            }], rowMultiSelectWithClick: [{
                type: Input
            }], suppressRowDeselection: [{
                type: Input
            }], suppressRowClickSelection: [{
                type: Input
            }], suppressCellSelection: [{
                type: Input
            }], suppressCellFocus: [{
                type: Input
            }], suppressMultiRangeSelection: [{
                type: Input
            }], enableCellTextSelection: [{
                type: Input
            }], enableRangeSelection: [{
                type: Input
            }], enableRangeHandle: [{
                type: Input
            }], enableFillHandle: [{
                type: Input
            }], fillHandleDirection: [{
                type: Input
            }], suppressClearOnFillReduction: [{
                type: Input
            }], sortingOrder: [{
                type: Input
            }], accentedSort: [{
                type: Input
            }], unSortIcon: [{
                type: Input
            }], suppressMultiSort: [{
                type: Input
            }], alwaysMultiSort: [{
                type: Input
            }], multiSortKey: [{
                type: Input
            }], suppressMaintainUnsortedOrder: [{
                type: Input
            }], icons: [{
                type: Input
            }], rowHeight: [{
                type: Input
            }], rowStyle: [{
                type: Input
            }], rowClass: [{
                type: Input
            }], rowClassRules: [{
                type: Input
            }], suppressRowHoverHighlight: [{
                type: Input
            }], suppressRowTransform: [{
                type: Input
            }], columnHoverHighlight: [{
                type: Input
            }], deltaSort: [{
                type: Input
            }], treeDataDisplayType: [{
                type: Input
            }], functionsPassive: [{
                type: Input
            }], enableGroupEdit: [{
                type: Input
            }], getContextMenuItems: [{
                type: Input
            }], getMainMenuItems: [{
                type: Input
            }], postProcessPopup: [{
                type: Input
            }], processCellForClipboard: [{
                type: Input
            }], processHeaderForClipboard: [{
                type: Input
            }], processGroupHeaderForClipboard: [{
                type: Input
            }], processCellFromClipboard: [{
                type: Input
            }], sendToClipboard: [{
                type: Input
            }], processDataFromClipboard: [{
                type: Input
            }], isExternalFilterPresent: [{
                type: Input
            }], doesExternalFilterPass: [{
                type: Input
            }], getChartToolbarItems: [{
                type: Input
            }], createChartContainer: [{
                type: Input
            }], navigateToNextHeader: [{
                type: Input
            }], tabToNextHeader: [{
                type: Input
            }], navigateToNextCell: [{
                type: Input
            }], tabToNextCell: [{
                type: Input
            }], localeTextFunc: [{
                type: Input
            }], getLocaleText: [{
                type: Input
            }], getDocument: [{
                type: Input
            }], paginationNumberFormatter: [{
                type: Input
            }], groupRowAggNodes: [{
                type: Input
            }], getGroupRowAgg: [{
                type: Input
            }], isGroupOpenByDefault: [{
                type: Input
            }], initialGroupOrderComparator: [{
                type: Input
            }], defaultGroupOrderComparator: [{
                type: Input
            }], processSecondaryColDef: [{
                type: Input
            }], processSecondaryColGroupDef: [{
                type: Input
            }], processPivotResultColDef: [{
                type: Input
            }], processPivotResultColGroupDef: [{
                type: Input
            }], getDataPath: [{
                type: Input
            }], getChildCount: [{
                type: Input
            }], getServerSideGroupLevelParams: [{
                type: Input
            }], getServerSideStoreParams: [{
                type: Input
            }], isServerSideGroupOpenByDefault: [{
                type: Input
            }], isApplyServerSideTransaction: [{
                type: Input
            }], isServerSideGroup: [{
                type: Input
            }], getServerSideGroupKey: [{
                type: Input
            }], getBusinessKeyForNode: [{
                type: Input
            }], getRowNodeId: [{
                type: Input
            }], getRowId: [{
                type: Input
            }], resetRowDataOnUpdate: [{
                type: Input
            }], processRowPostCreate: [{
                type: Input
            }], isRowSelectable: [{
                type: Input
            }], isRowMaster: [{
                type: Input
            }], fillOperation: [{
                type: Input
            }], postSort: [{
                type: Input
            }], postSortRows: [{
                type: Input
            }], getRowStyle: [{
                type: Input
            }], getRowClass: [{
                type: Input
            }], getRowHeight: [{
                type: Input
            }], isFullWidthCell: [{
                type: Input
            }], isFullWidthRow: [{
                type: Input
            }], toolPanelVisibleChanged: [{
                type: Output
            }], toolPanelSizeChanged: [{
                type: Output
            }], pasteStart: [{
                type: Output
            }], pasteEnd: [{
                type: Output
            }], columnVisible: [{
                type: Output
            }], columnPinned: [{
                type: Output
            }], columnResized: [{
                type: Output
            }], columnMoved: [{
                type: Output
            }], columnValueChanged: [{
                type: Output
            }], columnPivotModeChanged: [{
                type: Output
            }], columnPivotChanged: [{
                type: Output
            }], columnGroupOpened: [{
                type: Output
            }], newColumnsLoaded: [{
                type: Output
            }], gridColumnsChanged: [{
                type: Output
            }], displayedColumnsChanged: [{
                type: Output
            }], virtualColumnsChanged: [{
                type: Output
            }], columnEverythingChanged: [{
                type: Output
            }], componentStateChanged: [{
                type: Output
            }], cellValueChanged: [{
                type: Output
            }], cellEditRequest: [{
                type: Output
            }], rowValueChanged: [{
                type: Output
            }], cellEditingStarted: [{
                type: Output
            }], cellEditingStopped: [{
                type: Output
            }], rowEditingStarted: [{
                type: Output
            }], rowEditingStopped: [{
                type: Output
            }], filterOpened: [{
                type: Output
            }], filterChanged: [{
                type: Output
            }], filterModified: [{
                type: Output
            }], chartCreated: [{
                type: Output
            }], chartRangeSelectionChanged: [{
                type: Output
            }], chartOptionsChanged: [{
                type: Output
            }], chartDestroyed: [{
                type: Output
            }], cellKeyDown: [{
                type: Output
            }], cellKeyPress: [{
                type: Output
            }], gridReady: [{
                type: Output
            }], firstDataRendered: [{
                type: Output
            }], gridSizeChanged: [{
                type: Output
            }], modelUpdated: [{
                type: Output
            }], virtualRowRemoved: [{
                type: Output
            }], viewportChanged: [{
                type: Output
            }], bodyScroll: [{
                type: Output
            }], bodyScrollEnd: [{
                type: Output
            }], dragStarted: [{
                type: Output
            }], dragStopped: [{
                type: Output
            }], paginationChanged: [{
                type: Output
            }], rowDragEnter: [{
                type: Output
            }], rowDragMove: [{
                type: Output
            }], rowDragLeave: [{
                type: Output
            }], rowDragEnd: [{
                type: Output
            }], columnRowGroupChanged: [{
                type: Output
            }], rowGroupOpened: [{
                type: Output
            }], expandOrCollapseAll: [{
                type: Output
            }], pinnedRowDataChanged: [{
                type: Output
            }], rowDataChanged: [{
                type: Output
            }], rowDataUpdated: [{
                type: Output
            }], asyncTransactionsFlushed: [{
                type: Output
            }], cellClicked: [{
                type: Output
            }], cellDoubleClicked: [{
                type: Output
            }], cellFocused: [{
                type: Output
            }], cellMouseOver: [{
                type: Output
            }], cellMouseOut: [{
                type: Output
            }], cellMouseDown: [{
                type: Output
            }], rowClicked: [{
                type: Output
            }], rowDoubleClicked: [{
                type: Output
            }], rowSelected: [{
                type: Output
            }], selectionChanged: [{
                type: Output
            }], cellContextMenu: [{
                type: Output
            }], rangeSelectionChanged: [{
                type: Output
            }], sortChanged: [{
                type: Output
            }], columnRowGroupChangeRequest: [{
                type: Output
            }], columnPivotChangeRequest: [{
                type: Output
            }], columnValueChangeRequest: [{
                type: Output
            }], columnAggFuncChangeRequest: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVILFNBQVMsRUFHVCxZQUFZLEVBQ1osS0FBSyxFQUdMLE1BQU0sRUFFTixpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFtQyxNQUFNLG1CQUFtQixDQUFDO0FBZ0pwRyxnQkFBZ0I7QUFFaEIsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDeEUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sb0NBQW9DLENBQUM7Ozs7QUFZdEYsTUFBTSxPQUFPLGFBQWE7SUFnQnRCLFlBQVksVUFBc0IsRUFDdEIsZ0JBQWtDLEVBQ2xDLHlCQUFvRCxFQUNwRCx5QkFBMkQsRUFDM0Qsd0JBQWtEO1FBSGxELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBQzNELDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFoQnRELGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFJM0IsMERBQTBEO1FBQ2xELGdCQUFXLEdBQXVCLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUF3R2xFLFVBQVU7UUFDVix3RUFBd0U7UUFDeEQsY0FBUyxHQUFvRCxTQUFTLENBQUM7UUFDdkYsNkNBQTZDO1FBQzdCLFlBQU8sR0FBZ0UsU0FBUyxDQUFDO1FBQ2pHLDZJQUE2STtRQUM3SCx3QkFBbUIsR0FBd0IsU0FBUyxD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QXhDLE1BQU07Z0JBQ1Usd0JBQXdCO3NCQUF4QyxNQUFNO2dCQUNVLDBCQUEwQjtzQkFBMUMsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQWZ0ZXJWaWV3SW5pdCxcbiAgICBDb21wb25lbnQsXG4gICAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIElucHV0LFxuICAgIE9uQ2hhbmdlcyxcbiAgICBPbkRlc3Ryb3ksXG4gICAgT3V0cHV0LFxuICAgIFZpZXdDb250YWluZXJSZWYsXG4gICAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuaW1wb3J0IHsgQWdQcm9taXNlLCBDb21wb25lbnRVdGlsLCBHcmlkLCBHcmlkT3B0aW9ucywgR3JpZFBhcmFtcywgTW9kdWxlIH0gZnJvbSBcImFnLWdyaWQtY29tbXVuaXR5XCI7XG5cbi8vIEBTVEFSVF9JTVBPUlRTQFxuaW1wb3J0IHtcbiAgICBBZ0NoYXJ0VGhlbWUsXG4gICAgQWdDaGFydFRoZW1lT3ZlcnJpZGVzLFxuICAgIEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZCxcbiAgICBCb2R5U2Nyb2xsRW5kRXZlbnQsXG4gICAgQm9keVNjcm9sbEV2ZW50LFxuICAgIENlbGxDbGlja2VkRXZlbnQsXG4gICAgQ2VsbENvbnRleHRNZW51RXZlbnQsXG4gICAgQ2VsbERvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBDZWxsRWRpdFJlcXVlc3RFdmVudCxcbiAgICBDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudCxcbiAgICBDZWxsRWRpdGluZ1N0b3BwZWRFdmVudCxcbiAgICBDZWxsRm9jdXNlZEV2ZW50LFxuICAgIENlbGxLZXlEb3duRXZlbnQsXG4gICAgQ2VsbEtleVByZXNzRXZlbnQsXG4gICAgQ2VsbE1vdXNlRG93bkV2ZW50LFxuICAgIENlbGxNb3VzZU91dEV2ZW50LFxuICAgIENlbGxNb3VzZU92ZXJFdmVudCxcbiAgICBDZWxsUG9zaXRpb24sXG4gICAgQ2VsbFZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENoYXJ0Q3JlYXRlZCxcbiAgICBDaGFydERlc3Ryb3llZCxcbiAgICBDaGFydE9wdGlvbnNDaGFuZ2VkLFxuICAgIENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkLFxuICAgIENoYXJ0UmVmUGFyYW1zLFxuICAgIENoYXJ0VG9vbFBhbmVsc0RlZixcbiAgICBDb2xEZWYsXG4gICAgQ29sR3JvdXBEZWYsXG4gICAgQ29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5BcGksXG4gICAgQ29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5Hcm91cE9wZW5lZEV2ZW50LFxuICAgIENvbHVtbk1vdmVkRXZlbnQsXG4gICAgQ29sdW1uUGlubmVkRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblJlc2l6ZWRFdmVudCxcbiAgICBDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5WaXNpYmxlRXZlbnQsXG4gICAgQ29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQsXG4gICAgQ3N2RXhwb3J0UGFyYW1zLFxuICAgIERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgRG9tTGF5b3V0VHlwZSxcbiAgICBEcmFnU3RhcnRlZEV2ZW50LFxuICAgIERyYWdTdG9wcGVkRXZlbnQsXG4gICAgRXhjZWxFeHBvcnRQYXJhbXMsXG4gICAgRXhjZWxTdHlsZSxcbiAgICBFeHBhbmRDb2xsYXBzZUFsbEV2ZW50LFxuICAgIEZpbGxPcGVyYXRpb25QYXJhbXMsXG4gICAgRmlsdGVyQ2hhbmdlZEV2ZW50LFxuICAgIEZpbHRlck1vZGlmaWVkRXZlbnQsXG4gICAgRmlsdGVyT3BlbmVkRXZlbnQsXG4gICAgRmlyc3REYXRhUmVuZGVyZWRFdmVudCxcbiAgICBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50LFxuICAgIEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50LFxuICAgIEdldENoYXJ0VG9vbGJhckl0ZW1zLFxuICAgIEdldENvbnRleHRNZW51SXRlbXMsXG4gICAgR2V0RGF0YVBhdGgsXG4gICAgR2V0R3JvdXBSb3dBZ2dQYXJhbXMsXG4gICAgR2V0TG9jYWxlVGV4dFBhcmFtcyxcbiAgICBHZXRNYWluTWVudUl0ZW1zLFxuICAgIEdldFJvd0lkRnVuYyxcbiAgICBHZXRSb3dOb2RlSWRGdW5jLFxuICAgIEdldFNlcnZlclNpZGVHcm91cEtleSxcbiAgICBHZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc1BhcmFtcyxcbiAgICBHcmlkQXBpLFxuICAgIEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIEdyaWRSZWFkeUV2ZW50LFxuICAgIEdyaWRTaXplQ2hhbmdlZEV2ZW50LFxuICAgIEhlYWRlclBvc2l0aW9uLFxuICAgIElBZ2dGdW5jLFxuICAgIElEYXRhc291cmNlLFxuICAgIElSb3dEcmFnSXRlbSxcbiAgICBJUm93Tm9kZSxcbiAgICBJU2VydmVyU2lkZURhdGFzb3VyY2UsXG4gICAgSVZpZXdwb3J0RGF0YXNvdXJjZSxcbiAgICBJbml0aWFsR3JvdXBPcmRlckNvbXBhcmF0b3JQYXJhbXMsXG4gICAgSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbixcbiAgICBJc0V4dGVybmFsRmlsdGVyUHJlc2VudFBhcmFtcyxcbiAgICBJc0Z1bGxXaWR0aFJvd1BhcmFtcyxcbiAgICBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcyxcbiAgICBJc1Jvd0ZpbHRlcmFibGUsXG4gICAgSXNSb3dNYXN0ZXIsXG4gICAgSXNSb3dTZWxlY3RhYmxlLFxuICAgIElzU2VydmVyU2lkZUdyb3VwLFxuICAgIElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcyxcbiAgICBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jLFxuICAgIE1vZGVsVXBkYXRlZEV2ZW50LFxuICAgIE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtcyxcbiAgICBOZXdDb2x1bW5zTG9hZGVkRXZlbnQsXG4gICAgUGFnaW5hdGlvbkNoYW5nZWRFdmVudCxcbiAgICBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zLFxuICAgIFBhc3RlRW5kRXZlbnQsXG4gICAgUGFzdGVTdGFydEV2ZW50LFxuICAgIFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQsXG4gICAgUG9zdFByb2Nlc3NQb3B1cFBhcmFtcyxcbiAgICBQb3N0U29ydFJvd3NQYXJhbXMsXG4gICAgUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFByb2Nlc3NHcm91cEhlYWRlckZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzSGVhZGVyRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NSb3dQYXJhbXMsXG4gICAgUmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgUm93Q2xhc3NQYXJhbXMsXG4gICAgUm93Q2xhc3NSdWxlcyxcbiAgICBSb3dDbGlja2VkRXZlbnQsXG4gICAgUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBSb3dEYXRhVXBkYXRlZEV2ZW50LFxuICAgIFJvd0RvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBSb3dEcmFnRXZlbnQsXG4gICAgUm93RWRpdGluZ1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIFJvd0dyb3VwT3BlbmVkRXZlbnQsXG4gICAgUm93R3JvdXBpbmdEaXNwbGF5VHlwZSxcbiAgICBSb3dIZWlnaHRQYXJhbXMsXG4gICAgUm93TW9kZWxUeXBlLFxuICAgIFJvd1NlbGVjdGVkRXZlbnQsXG4gICAgUm93U3R5bGUsXG4gICAgUm93VmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgU2VsZWN0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIFNlbmRUb0NsaXBib2FyZFBhcmFtcyxcbiAgICBTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtcyxcbiAgICBTZXJ2ZXJTaWRlU3RvcmVUeXBlLFxuICAgIFNpZGVCYXJEZWYsXG4gICAgU29ydENoYW5nZWRFdmVudCxcbiAgICBTb3J0RGlyZWN0aW9uLFxuICAgIFN0YXR1c1BhbmVsRGVmLFxuICAgIFRhYlRvTmV4dENlbGxQYXJhbXMsXG4gICAgVGFiVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIFRvb2xQYW5lbFNpemVDaGFuZ2VkRXZlbnQsXG4gICAgVG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudCxcbiAgICBUcmVlRGF0YURpc3BsYXlUeXBlLFxuICAgIFZpZXdwb3J0Q2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxSb3dSZW1vdmVkRXZlbnRcbn0gZnJvbSBcImFnLWdyaWQtY29tbXVuaXR5XCI7XG4vLyBARU5EX0lNUE9SVFNAXG5cbmltcG9ydCB7IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzXCI7XG5pbXBvcnQgeyBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlciB9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgXSxcbiAgICAvLyB0ZWxsIGFuZ3VsYXIgd2UgZG9uJ3Qgd2FudCB2aWV3IGVuY2Fwc3VsYXRpb24sIHdlIGRvbid0IHdhbnQgYSBzaGFkb3cgcm9vdFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhcjxURGF0YSA9IGFueSwgVENvbERlZiBleHRlbmRzIENvbERlZjxURGF0YT4gPSBDb2xEZWY8YW55Pj4gaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gICAgLy8gbm90IGludGVuZGVkIGZvciB1c2VyIHRvIGludGVyYWN0IHdpdGguIHNvIHB1dHRpbmcgXyBpbiBzbyBpZiB1c2VyIGdldHMgcmVmZXJlbmNlXG4gICAgLy8gdG8gdGhpcyBvYmplY3QsIHRoZXkga2luZCdhIGtub3cgaXQncyBub3QgcGFydCBvZiB0aGUgYWdyZWVkIGludGVyZmFjZVxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBncmlkUGFyYW1zOiBHcmlkUGFyYW1zO1xuXG4gICAgLy8gaW4gb3JkZXIgdG8gZW5zdXJlIGZpcmluZyBvZiBncmlkUmVhZHkgaXMgZGV0ZXJtaW5pc3RpY1xuICAgIHByaXZhdGUgX2Z1bGx5UmVhZHk6IEFnUHJvbWlzZTxib29sZWFuPiA9IEFnUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXG4gICAgLy8gbWFraW5nIHRoZXNlIHB1YmxpYywgc28gdGhleSBhcmUgYWNjZXNzaWJsZSB0byBwZW9wbGUgdXNpbmcgdGhlIG5nMiBjb21wb25lbnQgcmVmZXJlbmNlc1xuICAgIHB1YmxpYyBhcGk6IEdyaWRBcGk8VERhdGE+O1xuICAgIHB1YmxpYyBjb2x1bW5BcGk6IENvbHVtbkFwaTtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnREZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHJpdmF0ZSBhbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzOiBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICBwcml2YXRlIGZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXI6IEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLFxuICAgICAgICBwcml2YXRlIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRWaWV3Q29udGFpbmVyUmVmKHRoaXMudmlld0NvbnRhaW5lclJlZik7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIodGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgICB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMuc2V0RW1pdHRlclVzZWRDYWxsYmFjayh0aGlzLmlzRW1pdHRlclVzZWQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBDb21wb25lbnRVdGlsLmNvcHlBdHRyaWJ1dGVzVG9HcmlkT3B0aW9ucyh0aGlzLmdyaWRPcHRpb25zLCB0aGlzKTtcblxuICAgICAgICB0aGlzLmdyaWRQYXJhbXMgPSB7XG4gICAgICAgICAgICBnbG9iYWxFdmVudExpc3RlbmVyOiB0aGlzLmdsb2JhbEV2ZW50TGlzdGVuZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGZyYW1ld29ya092ZXJyaWRlczogdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgcHJvdmlkZWRCZWFuSW5zdGFuY2VzOiB7XG4gICAgICAgICAgICAgICAgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kdWxlczogKHRoaXMubW9kdWxlcyB8fCBbXSkgYXMgYW55XG4gICAgICAgIH07XG5cbiAgICAgICAgbmV3IEdyaWQodGhpcy5fbmF0aXZlRWxlbWVudCwgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5ncmlkUGFyYW1zKTtcblxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5hcGkpIHtcbiAgICAgICAgICAgIHRoaXMuYXBpID0gdGhpcy5ncmlkT3B0aW9ucy5hcGk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5BcGkpIHtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uQXBpID0gdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5BcGk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gc29tZXRpbWVzLCBlc3BlY2lhbGx5IGluIGxhcmdlIGNsaWVudCBhcHBzIGdyaWRSZWFkeSBjYW4gZmlyZSBiZWZvcmUgbmdBZnRlclZpZXdJbml0XG4gICAgICAgIC8vIHRoaXMgdGllcyB0aGVzZSB0b2dldGhlciBzbyB0aGF0IGdyaWRSZWFkeSB3aWxsIGFsd2F5cyBmaXJlIGFmdGVyIGFnR3JpZEFuZ3VsYXIncyBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhlIGFjdHVhbCBjb250YWluaW5nIGNvbXBvbmVudCdzIG5nQWZ0ZXJWaWV3SW5pdCB3aWxsIGZpcmUganVzdCBhZnRlciBhZ0dyaWRBbmd1bGFyJ3NcbiAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS5yZXNvbHZlTm93KG51bGwsIHJlc29sdmUgPT4gcmVzb2x2ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgICBDb21wb25lbnRVdGlsLnByb2Nlc3NPbkNoYW5nZShjaGFuZ2VzLCB0aGlzLmFwaSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgLy8gbmVlZCB0byBkbyB0aGlzIGJlZm9yZSB0aGUgZGVzdHJveSwgc28gd2Uga25vdyBub3QgdG8gZW1pdCBhbnkgZXZlbnRzXG4gICAgICAgICAgICAvLyB3aGlsZSB0ZWFyaW5nIGRvd24gdGhlIGdyaWQuXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuYXBpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcGkuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2UnbGwgZW1pdCB0aGUgZW1pdCBpZiBhIHVzZXIgaXMgbGlzdGVuaW5nIGZvciBhIGdpdmVuIGV2ZW50IGVpdGhlciBvbiB0aGUgY29tcG9uZW50IHZpYSBub3JtYWwgYW5ndWxhciBiaW5kaW5nXG4gICAgLy8gb3IgdmlhIGdyaWRPcHRpb25zXG4gICAgcHJvdGVjdGVkIGlzRW1pdHRlclVzZWQoZXZlbnRUeXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBjb25zdCBoYXNFbWl0dGVyID0gISFlbWl0dGVyICYmIGVtaXR0ZXIub2JzZXJ2ZXJzICYmIGVtaXR0ZXIub2JzZXJ2ZXJzLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgLy8gZ3JpZFJlYWR5ID0+IG9uR3JpZFJlYWR5XG4gICAgICAgIGNvbnN0IGFzRXZlbnROYW1lID0gYG9uJHtldmVudFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCl9JHtldmVudFR5cGUuc3Vic3RyaW5nKDEpfWBcbiAgICAgICAgY29uc3QgaGFzR3JpZE9wdGlvbkxpc3RlbmVyID0gISF0aGlzLmdyaWRPcHRpb25zICYmICEhKHRoaXMuZ3JpZE9wdGlvbnMgYXMgYW55KVthc0V2ZW50TmFtZV07XG5cbiAgICAgICAgcmV0dXJuIGhhc0VtaXR0ZXIgfHwgaGFzR3JpZE9wdGlvbkxpc3RlbmVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2xvYmFsRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IHN0cmluZywgZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgdGVhcmluZyBkb3duLCBkb24ndCBlbWl0IGFuZ3VsYXIgZXZlbnRzLCBhcyB0aGlzIGNhdXNlc1xuICAgICAgICAvLyBwcm9ibGVtcyB3aXRoIHRoZSBhbmd1bGFyIHJvdXRlclxuICAgICAgICBpZiAodGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZW5lcmljYWxseSBsb29rIHVwIHRoZSBldmVudFR5cGVcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBpZiAoZW1pdHRlciAmJiB0aGlzLmlzRW1pdHRlclVzZWQoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gJ2dyaWRSZWFkeScpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGdyaWRSZWFkeSwgd2FpdCBmb3IgbmdBZnRlclZpZXdJbml0IHRvIGZpcmUgZmlyc3QsIHRoZW4gZW1pdCB0aGVcbiAgICAgICAgICAgICAgICAvLyBncmlkUmVhZHkgZXZlbnRcbiAgICAgICAgICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnRoZW4oKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgIEBJbnB1dCgpIHB1YmxpYyBncmlkT3B0aW9uczogR3JpZE9wdGlvbnM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgICBASW5wdXQoKSBwdWJsaWMgbW9kdWxlczogTW9kdWxlW10gfCB1bmRlZmluZWQ7XG5cbiAgICAvLyBAU1RBUlRAXG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc3RhdHVzIGJhciBjb21wb25lbnRzIHRvIHVzZSBpbiB0aGUgc3RhdHVzIGJhci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0YXR1c0JhcjogeyBzdGF0dXNQYW5lbHM6IFN0YXR1c1BhbmVsRGVmW107IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc2lkZSBiYXIgY29tcG9uZW50cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpZGVCYXI6IFNpZGVCYXJEZWYgfCBzdHJpbmcgfCBzdHJpbmdbXSB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzaG93IHRoZSBjb250ZXh0IG1lbnUuIFVzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgJ3JpZ2h0IGNsaWNrJyBjb250ZXh0IG1lbnUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGBzdXBwcmVzc0NvbnRleHRNZW51YCwgeW91IGNhbiB1c2UgdGhlIGBvbkNlbGxDb250ZXh0TWVudWAgZnVuY3Rpb24gdG8gcHJvdmlkZSB5b3VyIG93biBjb2RlIHRvIGhhbmRsZSBjZWxsIGBjb250ZXh0bWVudWAgZXZlbnRzLlxuICAgICAgICAgKiBUaGlzIGZsYWcgaXMgdXNlZnVsIHRvIHByZXZlbnQgdGhlIGJyb3dzZXIgZnJvbSBzaG93aW5nIGl0cyBkZWZhdWx0IGNvbnRleHQgbWVudS5cbiAgICAgICAgICogRGVmYXVsdDogYGZhbHNlYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY29udGV4dCBtZW51IHRvIHNob3csIGV2ZW4gd2hlbiBgQ3RybGAga2V5IGlzIGhlbGQgZG93bi4gRGVmYXVsdDogYGZhbHNlYCAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgY29sdW1uIG1lbnUgYnV0dG9uLCByYXRoZXIgdGhhbiBvbmx5IHNob3dpbmcgd2hlbiB0aGUgbW91c2UgaXMgb3ZlciB0aGUgY29sdW1uIGhlYWRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51SGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB1c2UgdGhlIGJyb3dzZXIncyBkZWZhdWx0IHRvb2x0aXAgaW5zdGVhZCBvZiB1c2luZyB0aGUgZ3JpZCdzIFRvb2x0aXAgQ29tcG9uZW50LiBEZWZhdWx0OiBgZmFsc2VgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQnJvd3NlclRvb2x0aXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIHRoYXQgaXQgdGFrZXMgZm9yIHRvb2x0aXBzIHRvIHNob3cgdXAgb25jZSBhbiBlbGVtZW50IGlzIGhvdmVyZWQgb3Zlci5cbiAgICAgICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgLlxuICAgICAgICAgKiBEZWZhdWx0OiBgMjAwMGBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBTaG93RGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyB0aGF0IGl0IHRha2VzIGZvciB0b29sdGlwcyB0byBoaWRlIG9uY2UgdGhleSBoYXZlIGJlZW4gZGlzcGxheWVkLlxuICAgICAgICAgKiAgICAgKipOb3RlOioqIFRoaXMgcHJvcGVydHkgZG9lcyBub3Qgd29yayBpZiBgZW5hYmxlQnJvd3NlclRvb2x0aXBzYCBpcyBgdHJ1ZWAuXG4gICAgICAgICAqIERlZmF1bHQ6IGAxMDAwMGBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBIaWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRvb2x0aXBzIGZvbGxvdyB0aGUgY3Vyc29yIG9uY2UgdGhleSBhcmUgZGlzcGxheWVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERPTSBlbGVtZW50IHRvIHVzZSBhcyB0aGUgcG9wdXAgcGFyZW50IGZvciBncmlkIHBvcHVwcyAoY29udGV4dCBtZW51LCBjb2x1bW4gbWVudSBldGMpLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9wdXBQYXJlbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5SGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsc28gaW5jbHVkZSBncm91cCBoZWFkZXJzIHdoZW4gY29weWluZyB0byBjbGlwYm9hcmQgdXNpbmcgYEN0cmwgKyBDYCBjbGlwYm9hcmQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvcHlHcm91cEhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmeSB0aGUgZGVsaW1pdGVyIHRvIHVzZSB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkLlxuICAgICAgICAgKiBEZWZhdWx0OiBgXFx0YFxuICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbGlwYm9hcmREZWxpbWl0ZXI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb3B5IHRoZSBjZWxsIHJhbmdlIG9yIGZvY3VzZWQgY2VsbCB0byB0aGUgY2xpcGJvYXJkIGFuZCBuZXZlciB0aGUgc2VsZWN0ZWQgcm93cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvcHkgcm93cyBpbnN0ZWFkIG9mIHJhbmdlcyB3aGVuIGEgcmFuZ2Ugd2l0aCBvbmx5IGEgc2luZ2xlIGNlbGwgaXMgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29weVNpbmdsZUNlbGxSYW5nZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gd29yayBhcm91bmQgYSBidWcgd2l0aCBFeGNlbCAoV2luZG93cykgdGhhdCBhZGRzIGFuIGV4dHJhIGVtcHR5IGxpbmUgYXQgdGhlIGVuZCBvZiByYW5nZXMgY29waWVkIHRvIHRoZSBjbGlwYm9hcmQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvZmYgcGFzdGUgb3BlcmF0aW9ucyB3aXRoaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZFBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN0b3AgdGhlIGdyaWQgdHJ5aW5nIHRvIHVzZSB0aGUgQ2xpcGJvYXJkIEFQSSwgaWYgaXQgaXMgYmxvY2tlZCwgYW5kIGltbWVkaWF0ZWx5IGZhbGxiYWNrIHRvIHRoZSB3b3JrYXJvdW5kLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IG9mIENvbHVtbiAvIENvbHVtbiBHcm91cCBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnM6IChUQ29sRGVmIHwgQ29sR3JvdXBEZWY8VERhdGE+KVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uLiBJdGVtcyBkZWZpbmVkIGluIHRoZSBhY3R1YWwgY29sdW1uIGRlZmluaXRpb25zIGdldCBwcmVjZWRlbmNlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbERlZjogQ29sRGVmPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBncm91cCBkZWZpbml0aW9uLiBBbGwgY29sdW1uIGdyb3VwIGRlZmluaXRpb25zIHdpbGwgdXNlIHRoZXNlIHByb3BlcnRpZXMuIEl0ZW1zIGRlZmluZWQgaW4gdGhlIGFjdHVhbCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbiBnZXQgcHJlY2VkZW5jZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZjogUGFydGlhbDxDb2xHcm91cERlZjxURGF0YT4+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3QgbWFwIG9mIGN1c3RvbSBjb2x1bW4gdHlwZXMgd2hpY2ggY29udGFpbiBncm91cHMgb2YgcHJvcGVydGllcyB0aGF0IGNvbHVtbiBkZWZpbml0aW9ucyBjYW4gaW5oZXJpdCBieSByZWZlcmVuY2luZyBpbiB0aGVpciBgdHlwZWAgcHJvcGVydHkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5UeXBlczogeyBba2V5OiBzdHJpbmddOiBDb2xEZWY8VERhdGE+OyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBLZWVwcyB0aGUgb3JkZXIgb2YgQ29sdW1ucyBtYWludGFpbmVkIGFmdGVyIG5ldyBDb2x1bW4gRGVmaW5pdGlvbnMgYXJlIHVwZGF0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlbiBkb3RzIGluIGZpZWxkIG5hbWVzIChlLmcuIGAnYWRkcmVzcy5maXJzdExpbmUnYCkgYXJlIG5vdCB0cmVhdGVkIGFzIGRlZXAgcmVmZXJlbmNlcy4gQWxsb3dzIHlvdSB0byB1c2UgZG90cyBpbiB5b3VyIGZpZWxkIG5hbWUgaWYgeW91IHByZWZlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWVsZERvdE5vdGF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBjb2x1bW4gbGFiZWwgaGVhZGVyLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIHRoZSB0aGVtZSB2YWx1ZSBvZiBgaGVhZGVyLWhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3dzIGNvbnRhaW5pbmcgaGVhZGVyIGNvbHVtbiBncm91cHMuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGhlYWRlckhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBmbG9hdGluZyBmaWx0ZXJzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIHRoZSB0aGVtZSB2YWx1ZSBvZiBgaGVhZGVyLWhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgY29sdW1ucyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGhlYWRlckhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzIHdoZW4gaW4gcGl2b3QgbW9kZS4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyBgZ3JvdXBIZWFkZXJIZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RHcm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvdyByZW9yZGVyaW5nIGFuZCBwaW5uaW5nIGNvbHVtbnMgYnkgZHJhZ2dpbmcgY29sdW1ucyBmcm9tIHRoZSBDb2x1bW5zIFRvb2wgUGFuZWwgdG8gdGhlIGdyaWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93RHJhZ0Zyb21Db2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIGNvbHVtbiBtb3ZpbmcsIGkuZS4gdG8gbWFrZSB0aGUgY29sdW1ucyBmaXhlZCBwb3NpdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgYGFnLWNvbHVtbi1tb3ZpbmdgIGNsYXNzIGlzIG5vdCBhZGRlZCB0byB0aGUgZ3JpZCB3aGlsZSBjb2x1bW5zIGFyZSBtb3ZpbmcuIEluIHRoZSBkZWZhdWx0IHRoZW1lcywgdGhpcyByZXN1bHRzIGluIG5vIGFuaW1hdGlvbiB3aGVuIG1vdmluZyBjb2x1bW5zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgd2hlbiB5b3UgZHJhZyBhIGNvbHVtbiBvdXQgb2YgdGhlIGdyaWQgKGUuZy4gdG8gdGhlIGdyb3VwIHpvbmUpIHRoZSBjb2x1bW4gaXMgbm90IGhpZGRlbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgd2hlbiB5b3UgZHJhZyBhIGNvbHVtbiBpbnRvIGEgcm93IGdyb3VwIHBhbmVsIHRoZSBjb2x1bW4gaXMgbm90IGhpZGRlbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dHcm91cEhpZGVzQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnc2hpZnQnYCB0byBoYXZlIHNoaWZ0LXJlc2l6ZSBhcyB0aGUgZGVmYXVsdCByZXNpemUgb3BlcmF0aW9uIChzYW1lIGFzIHVzZXIgaG9sZGluZyBkb3duIGBTaGlmdGAgd2hpbGUgcmVzaXppbmcpLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sUmVzaXplRGVmYXVsdDogJ3NoaWZ0JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3NlcyBhdXRvLXNpemluZyBjb2x1bW5zIGZvciBjb2x1bW5zLiBJbiBvdGhlciB3b3JkcywgZG91YmxlIGNsaWNraW5nIGEgY29sdW1uJ3MgaGVhZGVyJ3MgZWRnZSB3aWxsIG5vdCBhdXRvLXNpemUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIE51bWJlciBvZiBwaXhlbHMgdG8gYWRkIHRvIGEgY29sdW1uIHdpZHRoIGFmdGVyIHRoZSBbYXV0by1zaXppbmddKC9jb2x1bW4tc2l6aW5nLyNhdXRvLXNpemUtY29sdW1ucykgY2FsY3VsYXRpb24uXG4gICAgICAgICAqIFNldCB0aGlzIGlmIHlvdSB3YW50IHRvIGFkZCBleHRyYSByb29tIHRvIGFjY29tbW9kYXRlIChmb3IgZXhhbXBsZSkgc29ydCBpY29ucywgb3Igc29tZSBvdGhlciBkeW5hbWljIG5hdHVyZSBvZiB0aGUgaGVhZGVyLlxuICAgICAgICAgKiBEZWZhdWx0OiBgNGBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGF1dG9TaXplUGFkZGluZzogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc2tpcCB0aGUgYGhlYWRlck5hbWVgIHdoZW4gYGF1dG9TaXplYCBpcyBjYWxsZWQgYnkgZGVmYXVsdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2tpcEhlYWRlck9uQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIG9mIGNvbXBvbmVudCBuYW1lcyB0byBjb21wb25lbnRzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcG9uZW50czogeyBbcDogc3RyaW5nXTogYW55OyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgY29tcG9uZW50c2AgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZyYW1ld29ya0NvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IHsgbmV3KCk6IGFueTsgfTsgfSB8IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnZnVsbFJvdydgIHRvIGVuYWJsZSBGdWxsIFJvdyBFZGl0aW5nLiBPdGhlcndpc2UgbGVhdmUgYmxhbmsgdG8gZWRpdCBvbmUgY2VsbCBhdCBhIHRpbWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlZGl0VHlwZTogJ2Z1bGxSb3cnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBTaW5nbGUgQ2xpY2sgRWRpdGluZyBmb3IgY2VsbHMsIHRvIHN0YXJ0IGVkaXRpbmcgd2l0aCBhIHNpbmdsZSBjbGljay4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgbmVpdGhlciBzaW5nbGUgbm9yIGRvdWJsZSBjbGljayBzdGFydHMgZWRpdGluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gc3RvcCB0aGUgZ3JpZCB1cGRhdGluZyBkYXRhIGFmdGVyIGFuZCBlZGl0LiBXaGVuIHRoaXMgaXMgc2V0LCBpdCBpcyBpbnRlbmRlZCB0aGUgYXBwbGljYXRpb24gd2lsbCB1cGRhdGUgdGhlIGRhdGEsIGVnIGluIGFuIGV4dGVybmFsIGltbXV0YWJsZSBzdG9yZSwgYW5kIHRoZW4gcGFzcyB0aGUgbmV3IGRhdGFzZXQgdG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZWFkT25seUVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBzdG9wIGNlbGwgZWRpdGluZyB3aGVuIGdyaWQgbG9zZXMgZm9jdXMuXG4gICAgICAgICAqIFRoZSBkZWZhdWx0IGlzIHRoYXQgdGhlIGdyaWQgc3RheXMgZWRpdGluZyB1bnRpbCBmb2N1cyBnb2VzIG9udG8gYW5vdGhlciBjZWxsLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck1vdmVzRG93bkFmdGVyRWRpdGAgdG8gaGF2ZSBFeGNlbC1zdHlsZSBiZWhhdmlvdXIgZm9yIHRoZSBgRW50ZXJgIGtleS5cbiAgICAgICAgICogaS5lLiBwcmVzc2luZyB0aGUgYEVudGVyYCBrZXkgd2lsbCBtb3ZlIGRvd24gdG8gdGhlIGNlbGwgYmVuZWF0aC5cbiAgICAgICAgICogRGVmYXVsdDogYGZhbHNlYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgYWxvbmcgd2l0aCBgZW50ZXJNb3Zlc0Rvd25gIHRvIGhhdmUgRXhjZWwtc3R5bGUgYmVoYXZpb3VyIGZvciB0aGUgJ0VudGVyJyBrZXkuXG4gICAgICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIEVudGVyIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck1vdmVzRG93bkFmdGVyRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRm9yY2VzIENlbGwgRWRpdGluZyB0byBzdGFydCB3aGVuIGJhY2tzcGFjZSBpcyBwcmVzc2VkLiBUaGlzIGlzIG9ubHkgcmVsZXZhbnQgZm9yIE1hY09TIHVzZXJzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbEVkaXRpbmdPbkJhY2tzcGFjZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgVW5kbyAvIFJlZG8gd2hpbGUgZWRpdGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGUgc2l6ZSBvZiB0aGUgdW5kbyAvIHJlZG8gc3RhY2suIERlZmF1bHQ6IGAxMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmdMaW1pdDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gQ1NWLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENzdkV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBDU1YuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gRXhjZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXM6IEV4Y2VsRXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBFeGNlbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBsaXN0IChhcnJheSkgb2YgRXhjZWwgc3R5bGVzIHRvIGJlIHVzZWQgd2hlbiBleHBvcnRpbmcgdG8gRXhjZWwgd2l0aCBzdHlsZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogRXhjZWxTdHlsZVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSb3dzIGFyZSBmaWx0ZXJlZCB1c2luZyB0aGlzIHRleHQgYXMgYSBxdWljayBmaWx0ZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlclRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB0dXJuIG9uIHRoZSBxdWljayBmaWx0ZXIgY2FjaGUsIHVzZWQgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZSB3aGVuIHVzaW5nIHRoZSBxdWljayBmaWx0ZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgdHJlZSBkYXRhIGZpbHRlcmluZyBiZWhhdmlvdXIgdG8gaW5zdGVhZCBleGNsdWRlIGNoaWxkIG5vZGVzIGZyb20gZmlsdGVyIHJlc3VsdHMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGV4Y2x1ZGVDaGlsZHJlbldoZW5UcmVlRGF0YUZpbHRlcmluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBFbmFibGUgQ2hhcnRzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDaGFydHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGNoYXJ0IHRoZW1lcyB0byBiZSB1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBjb250YWluaW5nIGN1c3RvbSBjaGFydCB0aGVtZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjdXN0b21DaGFydFRoZW1lczogeyBbbmFtZTogc3RyaW5nXTogQWdDaGFydFRoZW1lIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENoYXJ0IHRoZW1lIG92ZXJyaWRlcyBhcHBsaWVkIHRvIGFsbCB0aGVtZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lT3ZlcnJpZGVzOiBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyOSwgbm8gbG9uZ2VyIHVzZWQuIFRvIHN1cHByZXNzIHVzZSBgc3VwcHJlc3NDaGFydFRvb2xQYW5lbHNCdXR0b25gLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2hhcnRUb29sUGFuZWxzQnV0dG9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlICdoYW1idXJnZXInIG1lbnUgb3B0aW9uIGZyb20gdGhlIENoYXJ0IFRvb2xiYXIgYW5kIGRpc3BsYXkgdGhlIHJlbWFpbmluZyB0b29sYmFyIGJ1dHRvbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhcnRUb29sUGFuZWxzQnV0dG9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY3VzdG9taXNhdGlvbiBvZiB0aGUgQ2hhcnQgVG9vbCBQYW5lbHMsIHN1Y2ggYXMgY2hhbmdpbmcgdGhlIHRvb2wgcGFuZWxzIHZpc2liaWxpdHkgYW5kIG9yZGVyLCBhcyB3ZWxsIGFzIGNob29zaW5nIHdoaWNoIGNoYXJ0cyBzaG91bGQgYmUgZGlzcGxheWVkIGluIHRoZSBzZXR0aW5ncyBwYW5lbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VG9vbFBhbmVsc0RlZjogQ2hhcnRUb29sUGFuZWxzRGVmIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIGxvYWRpbmcgY2VsbCByZW5kZXJlciB0byB1c2Ugd2hlbiBkYXRhIGlzIGxvYWRpbmcgdmlhIGEgRGF0YVNvdXJjZS5cbiAgICAgICAgKiBTZWUgW0xvYWRpbmcgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LWxvYWRpbmctY2VsbC1yZW5kZXJlci8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgbG9hZGluZ0NlbGxSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogUGFyYW1zIHRvIGJlIHBhc3NlZCB0byB0aGUgYGxvYWRpbmdDZWxsUmVuZGVyZXJgIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gc2VsZWN0IHdoaWNoIGxvYWRpbmcgY2VsbCByZW5kZXJlciB0byBiZSB1c2VkIHdoZW4gZGF0YSBpcyBsb2FkaW5nIHZpYSBhIERhdGFTb3VyY2UuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3I6IExvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiBrZXktPnZhbHVlIHBhaXJzIGZvciBsb2NhbGlzaW5nIHRleHQgd2l0aGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlVGV4dDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgTWFzdGVyIERldGFpbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgZGV0YWlsIHJvd3MgZm9yIHdoZW4gdGhleSBhcmUgZGlzcGxheWVkIGFnYWluLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgbnVtYmVyIG9mIGRldGFpbHMgcm93cyB0byBrZWVwLiBEZWZhdWx0OiBgMTBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93c0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gYGRldGFpbENlbGxSZW5kZXJlcmAgdG8gdXNlIHdoZW4gYSBtYXN0ZXIgcm93IGlzIGV4cGFuZGVkLlxuICAgICAgICAqIFNlZSBbRGV0YWlsIENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL21hc3Rlci1kZXRhaWwtY3VzdG9tLWRldGFpbC8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBkZXRhaWxDZWxsUmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBwYXJhbXMgdG8gYmUgdXNlZCBieSB0aGUgRGV0YWlsIENlbGwgUmVuZGVyZXIuIENhbiBhbHNvIGJlIGEgZnVuY3Rpb24gdGhhdCBwcm92aWRlcyB0aGUgcGFyYW1zIHRvIGVuYWJsZSBkeW5hbWljIGRlZmluaXRpb25zIG9mIHRoZSBwYXJhbXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IGZpeGVkIGhlaWdodCBpbiBwaXhlbHMgZm9yIGVhY2ggZGV0YWlsIHJvdy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGRldGFpbCBncmlkIGR5bmFtaWNhbGx5IGNoYW5nZSBpdCdzIGhlaWdodCB0byBmaXQgaXQncyByb3dzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsUm93QXV0b0hlaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZXMgYSBjb250ZXh0IG9iamVjdCB0aGF0IGlzIHByb3ZpZGVkIHRvIGRpZmZlcmVudCBjYWxsYmFja3MgdGhlIGdyaWQgdXNlcy4gVXNlZCBmb3IgcGFzc2luZyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHRvIHRoZSBjYWxsYmFja3MgYnkgeW91ciBhcHBsaWNhdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbnRleHQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBsaXN0IG9mIGdyaWRzIHRvIHRyZWF0IGFzIEFsaWduZWQgR3JpZHMuIElmIGdyaWRzIGFyZSBhbGlnbmVkIHRoZW4gdGhlIGNvbHVtbnMgYW5kIGhvcml6b250YWwgc2Nyb2xsaW5nIHdpbGwgYmUga2VwdCBpbiBzeW5jLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxpZ25lZEdyaWRzOiB7IGFwaT86IEdyaWRBcGkgfCBudWxsLCBjb2x1bW5BcGk/OiBDb2x1bW5BcGkgfCBudWxsIH1bXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhbmdlIHRoaXMgdmFsdWUgdG8gc2V0IHRoZSB0YWJJbmRleCBvcmRlciBvZiB0aGUgR3JpZCB3aXRoaW4geW91ciBhcHBsaWNhdGlvbi4gRGVmYXVsdDogYDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbnVtYmVyIG9mIHJvd3MgcmVuZGVyZWQgb3V0c2lkZSB0aGUgdmlld2FibGUgYXJlYSB0aGUgZ3JpZCByZW5kZXJzLlxuICAgICAgICAgKiBIYXZpbmcgYSBidWZmZXIgbWVhbnMgdGhlIGdyaWQgd2lsbCBoYXZlIHJvd3MgcmVhZHkgdG8gc2hvdyBhcyB0aGUgdXNlciBzbG93bHkgc2Nyb2xscyB2ZXJ0aWNhbGx5LlxuICAgICAgICAgKiBEZWZhdWx0OiBgMTBgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dCdWZmZXI6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB0dXJuIG9uIHRoZSB2YWx1ZSBjYWNoZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb25maWd1cmUgdGhlIHZhbHVlIGNhY2hlIHRvIG5vdCBleHBpcmUgYWZ0ZXIgZGF0YSB1cGRhdGVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IGNlbGwgZXhwcmVzc2lvbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFeHByZXNzaW9uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCByb3cgbm9kZXMgZG8gbm90IGhhdmUgdGhlaXIgcGFyZW50cyBzZXQuXG4gICAgICAgICAqIFRoZSBncmlkIGRvZXNuJ3QgdXNlIHRoZSBwYXJlbnQgcmVmZXJlbmNlLCBidXQgaXQgaXMgaW5jbHVkZWQgdG8gaGVscCB0aGUgY2xpZW50IGNvZGUgbmF2aWdhdGUgdGhlIG5vZGUgdHJlZSBpZiBpdCB3YW50cyBieSBwcm92aWRpbmcgYmktZGlyZWN0aW9uIG5hdmlnYXRpb24gdXAgYW5kIGRvd24gdGhlIHRyZWUuXG4gICAgICAgICAqIElmIHRoaXMgaXMgYSBwcm9ibGVtIChlLmcuIGlmIHlvdSBuZWVkIHRvIGNvbnZlcnQgdGhlIHRyZWUgdG8gSlNPTiwgd2hpY2ggZG9lcyBub3QgYWxsb3cgY3ljbGljIGRlcGVuZGVuY2llcykgdGhlbiBzZXQgdGhpcyB0byBgdHJ1ZWAuXG4gICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFyZW50c0luUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRvdWNoIHN1cHBvcnQgKGJ1dCBkb2VzIG5vdCByZW1vdmUgdGhlIGJyb3dzZXIncyBlZmZvcnRzIHRvIHNpbXVsYXRlIG1vdXNlIGV2ZW50cyBvbiB0b3VjaCkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IHNldCBmb2N1cyBiYWNrIG9uIHRoZSBncmlkIGFmdGVyIGEgcmVmcmVzaC4gVGhpcyBjYW4gYXZvaWQgaXNzdWVzIHdoZXJlIHlvdSB3YW50IHRvIGtlZXAgdGhlIGZvY3VzIG9uIGFub3RoZXIgcGFydCBvZiB0aGUgYnJvd3Nlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlIGFzeW5jaHJvbm91cyBuYXR1cmUgb2YgdGhlIGV2ZW50cyBpbnRyb2R1Y2VkIGluIHYxMCwgYW5kIG1ha2VzIHRoZW0gc3luY2hyb25vdXMuIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgZm9yIHRoZSBwdXJwb3NlIG9mIHN1cHBvcnRpbmcgbGVnYWN5IGNvZGUgd2hpY2ggaGFzIGEgZGVwZW5kZW5jeSBvbiBzeW5jaHJvbm91cyBldmVudHMgZnJvbSBlYXJsaWVyIHZlcnNpb25zICh2OSBvciBlYXJsaWVyKSBvZiBBRyBHcmlkLiAgICAgKipJdCBpcyBzdHJvbmdseSByZWNvbW1lbmRlZCB0aGF0IHlvdSBkbyBub3QgY2hhbmdlIHRoaXMgcHJvcGVydHkgdW5sZXNzIHlvdSBoYXZlIGxlZ2FjeSBpc3N1ZXMuKiogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBc3luY0V2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGdyaWQgd2lsbCBjaGVjayBmb3IgYFJlc2l6ZU9ic2VydmVyYCBhbmQgdXNlIGl0IGlmIGl0IGV4aXN0cyBpbiB0aGUgYnJvd3Nlciwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlIHRoZSBncmlkJ3MgYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb24uIFNvbWUgdXNlcnMgcmVwb3J0ZWQgaXNzdWVzIHdpdGggQ2hyb21lJ3MgYFJlc2l6ZU9ic2VydmVyYC4gVXNlIHRoaXMgcHJvcGVydHkgdG8gYWx3YXlzIHVzZSB0aGUgZ3JpZCdzIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9uIHNob3VsZCBzdWNoIHByb2JsZW1zIGV4aXN0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgc2hvd2luZyBhIHdhcm5pbmcgbWVzc2FnZSBpbiB0aGUgY29uc29sZSBpZiB1c2luZyBhIGBncmlkT3B0aW9uc2Agb3IgYGNvbERlZmAgcHJvcGVydHkgdGhhdCBkb2Vzbid0IGV4aXN0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Byb3BlcnR5TmFtZXNDaGVjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgY2hhbmdlIGRldGVjdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBlbmFibGUgZGVidWcgaW5mb3JtYXRpb24gZnJvbSB0aGUgZ3JpZCBhbmQgcmVsYXRlZCBjb21wb25lbnRzLiBXaWxsIHJlc3VsdCBpbiBhZGRpdGlvbmFsIGxvZ2dpbmcgYmVpbmcgb3V0cHV0LCBidXQgdmVyeSB1c2VmdWwgd2hlbiBpbnZlc3RpZ2F0aW5nIHByb2JsZW1zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJ1ZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIHRlbXBsYXRlIGZvciAnbG9hZGluZycgb3ZlcmxheS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlMb2FkaW5nVGVtcGxhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAgICAqIFNlZSBbTG9hZGluZyBPdmVybGF5IENvbXBvbmVudF0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LW92ZXJsYXkvI3NpbXBsZS1sb2FkaW5nLW92ZXJsYXktY29tcG9uZW50KSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50RnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgbG9hZGluZyBvdmVybGF5IGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSAnbG9hZGluZycgb3ZlcmxheS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIHRlbXBsYXRlIGZvciAnbm8gcm93cycgb3ZlcmxheS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlOb1Jvd3NUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIG5vIHJvd3Mgb3ZlcmxheSBjb21wb25lbnQuXG4gICAgICAgICogU2VlIFtObyBSb3dzIE92ZXJsYXkgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtb3ZlcmxheS8jc2ltcGxlLW5vLXJvd3Mtb3ZlcmxheS1jb21wb25lbnQpIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBubyByb3dzIG92ZXJsYXkgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgJ25vIHJvd3MnIG92ZXJsYXkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHdoZXRoZXIgcGFnaW5hdGlvbiBpcyBlbmFibGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByb3dzIHRvIGxvYWQgcGVyIHBhZ2UuIElmIGBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplYCBpcyBzcGVjaWZpZWQsIHRoaXMgcHJvcGVydHkgaXMgaWdub3JlZC4gRGVmYXVsdDogYDEwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIG51bWJlciBvZiByb3dzIHRvIGxvYWQgcGVyIHBhZ2UgaXMgYXV0b21hdGljYWxseSBhZGp1c3RlZCBieSB0aGUgZ3JpZCBzbyBlYWNoIHBhZ2Ugc2hvd3MgZW5vdWdoIHJvd3MgdG8ganVzdCBmaWxsIHRoZSBhcmVhIGRlc2lnbmF0ZWQgZm9yIHRoZSBncmlkLiBJZiBgZmFsc2VgLCBgcGFnaW5hdGlvblBhZ2VTaXplYCBpcyB1c2VkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgcGFnZXMgc3BsaXQgY2hpbGRyZW4gb2YgZ3JvdXBzIHdoZW4gdXNpbmcgUm93IEdyb3VwaW5nIG9yIGRldGFpbCByb3dzIHdpdGggTWFzdGVyIERldGFpbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGRlZmF1bHQgZ3JpZCBjb250cm9scyBmb3IgbmF2aWdhdGlvbiBhcmUgaGlkZGVuLlxuICAgICAgICAgKiBUaGlzIGlzIHVzZWZ1bCBpZiBgcGFnaW5hdGlvbj10cnVlYCBhbmQgeW91IHdhbnQgdG8gcHJvdmlkZSB5b3VyIG93biBwYWdpbmF0aW9uIGNvbnRyb2xzLlxuICAgICAgICAgKiBPdGhlcndpc2UsIHdoZW4gYHBhZ2luYXRpb249dHJ1ZWAgdGhlIGdyaWQgYXV0b21hdGljYWxseSBzaG93cyB0aGUgbmVjZXNzYXJ5IGNvbnRyb2xzIGF0IHRoZSBib3R0b20gc28gdGhhdCB0aGUgdXNlciBjYW4gbmF2aWdhdGUgdGhyb3VnaCB0aGUgZGlmZmVyZW50IHBhZ2VzLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgcGl2b3QgbW9kZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RNb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdwaXZvdCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gcGl2b3QpIGF0IHRoZSB0b3AuIE5vdGUgdGhhdCB0aGUgcGl2b3QgcGFuZWwgd2lsbCBuZXZlciBzaG93IGlmIGBwaXZvdE1vZGVgIGlzIG9mZi4gRGVmYXVsdDogYG5ldmVyYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RQYW5lbFNob3c6ICdhbHdheXMnIHwgJ29ubHlXaGVuUGl2b3RpbmcnIHwgJ25ldmVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBzZXQgYW5kIHRoZSBncmlkIGlzIGluIHBpdm90IG1vZGUsIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCB0b3RhbHMgd2lsbCBhcHBlYXIgd2l0aGluIHRoZSBQaXZvdCBDb2x1bW4gR3JvdXBzLCBpbiB0aGUgcG9zaXRpb24gc3BlY2lmaWVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFsczogJ2JlZm9yZScgfCAnYWZ0ZXInIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciBmb3IgZWFjaCB2YWx1ZSBjb2x1bW4gaW4gdGhlIHBvc2l0aW9uIHNwZWNpZmllZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Um93VG90YWxzOiAnYmVmb3JlJyB8ICdhZnRlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3Qgc3dhcCBpbiB0aGUgZ3JvdXBpbmcgY29sdW1uIHdoZW4gcGl2b3RpbmcuIFVzZWZ1bCBpZiBwaXZvdGluZyB1c2luZyBTZXJ2ZXIgU2lkZSBSb3cgTW9kZWwgb3IgVmlld3BvcnQgUm93IE1vZGVsIGFuZCB5b3Ugd2FudCBmdWxsIGNvbnRyb2wgb2YgYWxsIGNvbHVtbnMgaW5jbHVkaW5nIHRoZSBncm91cCBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHBpdm90IGNvbHVtbiBncm91cHMgd2lsbCBhcHBlYXIgJ2ZpeGVkJywgd2l0aG91dCB0aGUgYWJpbGl0eSB0byBleHBhbmQgYW5kIGNvbGxhcHNlIHRoZSBjb2x1bW4gZ3JvdXBzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGVuIHJvdyBncm91cCwgcGl2b3QgYW5kIHZhbHVlIGFnZ3JlZ2F0aW9uIHdpbGwgYmUgcmVhZC1vbmx5IGZyb20gdGhlIEdVSS4gVGhlIGdyaWQgd2lsbCBkaXNwbGF5IHdoYXQgdmFsdWVzIGFyZSB1c2VkIGZvciBlYWNoLCBidXQgd2lsbCBub3QgYWxsb3cgdGhlIHVzZXIgdG8gY2hhbmdlIHRoZSBzZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiAnZnVuY3Rpb24gbmFtZScgdG8gJ2Z1bmN0aW9uJyBmb3IgY3VzdG9tIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmNzOiB7IFtrZXk6IHN0cmluZ106IElBZ2dGdW5jPFREYXRhPjsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIGNvbHVtbiBoZWFkZXJzIHdvbid0IGluY2x1ZGUgdGhlIGBhZ2dGdW5jYCBuYW1lLCBlLmcuIGAnc3VtKEJhbmsgQmFsYW5jZSlgJyB3aWxsIGp1c3QgYmUgYCdCYW5rIEJhbGFuY2UnYC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGdW5jSW5IZWFkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgYWdncmVnYXRpb25zIHdvbid0IGJlIGNvbXB1dGVkIGZvciB0aGUgcm9vdCBub2RlIG9mIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0F0Um9vdExldmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGNoYW5nZSBkZXRlY3Rpb24sIG9ubHkgdGhlIHVwZGF0ZWQgY29sdW1uIHdpbGwgYmUgcmUtYWdncmVnYXRlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdncmVnYXRlT25seUNoYW5nZWRDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgYWdncmVnYXRpb25zIGFyZSBub3QgaW1wYWN0ZWQgYnkgZmlsdGVyaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0ZpbHRlcmVkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvbWl0IHRoZSB2YWx1ZSBDb2x1bW4gaGVhZGVyIHdoZW4gdGhlcmUgaXMgb25seSBhIHNpbmdsZSB2YWx1ZSBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlbW92ZVBpdm90SGVhZGVyUm93V2hlblNpbmdsZVZhbHVlQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBSb3cgQW5pbWF0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmltYXRlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIGZsYXNoIGFmdGVyIGRhdGEgY2hhbmdlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGVuYWJsZUNlbGxDaGFuZ2VGbGFzaGAsIHRoaXMgY29uZmlndXJhdGlvbiB3aWxsIHNldCB0aGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIG9mIGhvdyBsb25nIGEgY2VsbCBzaG91bGQgcmVtYWluIGluIGl0cyBcImZsYXNoZWRcIiBzdGF0ZS5cbiAgICAgICAgICogRGVmYXVsdDogYDUwMGBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGbGFzaERlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRvIGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBgZW5hYmxlQ2VsbENoYW5nZUZsYXNoYCwgdGhpcyBjb25maWd1cmF0aW9uIHdpbGwgc2V0IHRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgb2YgaG93IGxvbmcgdGhlIFwiZmxhc2hlZFwiIHN0YXRlIGFuaW1hdGlvbiB0YWtlcyB0byBmYWRlIGF3YXkgYWZ0ZXIgdGhlIHRpbWVyIHNldCBieSBgY2VsbEZsYXNoRGVsYXlgIGhhcyBjb21wbGV0ZWQuXG4gICAgICAgICAqIERlZmF1bHQ6IGAxMDAwYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZhZGVEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgY2VsbHMgZmxhc2ggYWZ0ZXIgZGF0YSBjaGFuZ2VzIGV2ZW4gd2hlbiB0aGUgY2hhbmdlIGlzIGR1ZSB0byBmaWx0ZXJpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93U2hvd0NoYW5nZUFmdGVyRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTd2l0Y2ggYmV0d2VlbiBsYXlvdXQgb3B0aW9uczogYG5vcm1hbGAsIGBhdXRvSGVpZ2h0YCwgYHByaW50YC5cbiAgICAgICAgICogRGVmYXVsdDogYG5vcm1hbGBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRvbUxheW91dDogRG9tTGF5b3V0VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBvcmRlciBvZiByb3dzIGFuZCBjb2x1bW5zIGluIHRoZSBET00gYXJlIGNvbnNpc3RlbnQgd2l0aCB3aGF0IGlzIG9uIHNjcmVlbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5zdXJlRG9tT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gb3BlcmF0ZSB0aGUgZ3JpZCBpbiBSVEwgKFJpZ2h0IHRvIExlZnQpIG1vZGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJ0bDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBncmlkIGRvZXNuJ3QgdmlydHVhbGlzZSB0aGUgY29sdW1ucy4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIDEwMCBjb2x1bW5zLCBidXQgb25seSAxMCB2aXNpYmxlIGR1ZSB0byBzY3JvbGxpbmcsIGFsbCAxMDAgd2lsbCBhbHdheXMgYmUgcmVuZGVyZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uVmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQgdGhlIGdyaWQgaGFzIGEgbGltaXQgb2YgcmVuZGVyaW5nIGEgbWF4aW11bSBvZiA1MDAgcm93cyBhdCBvbmNlIChyZW1lbWJlciB0aGUgZ3JpZCBvbmx5IHJlbmRlcnMgcm93cyB5b3UgY2FuIHNlZSwgc28gdW5sZXNzIHlvdXIgZGlzcGxheSBzaG93cyBtb3JlIHRoYW4gNTAwIHJvd3Mgd2l0aG91dCB2ZXJ0aWNhbGx5IHNjcm9sbGluZyB0aGlzIHdpbGwgbmV2ZXIgYmUgYW4gaXNzdWUpLlxuICAgICAgICAgKiA8YnIgLz4qKlRoaXMgaXMgb25seSByZWxldmFudCBpZiB5b3UgYXJlIG1hbnVhbGx5IHNldHRpbmcgYHJvd0J1ZmZlcmAgdG8gYSBoaWdoIHZhbHVlIChyZW5kZXJpbmcgbW9yZSByb3dzIHRoYW4gY2FuIGJlIHNlZW4pLCBvciBgc3VwcHJlc3NSb3dWaXJ0dWFsaXNhdGlvbmAgaXMgdHJ1ZSwgb3IgaWYgeW91ciBncmlkIGhlaWdodCBpcyBhYmxlIHRvIGRpc3BsYXkgbW9yZSB0aGFuIDUwMCByb3dzIGF0IG9uY2UuKipcbiAgICAgICAgICogRGVmYXVsdDogYGZhbHNlYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIGdyaWQgZG9lc24ndCB2aXJ0dWFsaXNlIHRoZSByb3dzLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgMTAwIHJvd3MsIGJ1dCBvbmx5IDEwIHZpc2libGUgZHVlIHRvIHNjcm9sbGluZywgYWxsIDEwMCB3aWxsIGFsd2F5cyBiZSByZW5kZXJlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dWaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgTWFuYWdlZCBSb3cgRHJhZ2dpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNYW5hZ2VkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIHJvdyBkcmFnZ2luZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEcmFnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIG1vdmluZyByb3dzIHdoaWxlIGRyYWdnaW5nIHRoZSBgcm93RHJhZ2Agd2FmZmxlLiBUaGlzIG9wdGlvbiBoaWdobGlnaHRzIHRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgcm93IHdpbGwgYmUgcGxhY2VkIGFuZCBpdCB3aWxsIG9ubHkgbW92ZSB0aGUgcm93IG9uIG1vdXNlIHVwLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmVXaGVuUm93RHJhZ2dpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIGNsaWNraW5nIGFuZCBkcmFnZ2luZyBhbnl3aGVyZSBvbiB0aGUgcm93IHdpdGhvdXQgdGhlIG5lZWQgZm9yIGEgZHJhZyBoYW5kbGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdFbnRpcmVSb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIGRyYWdnaW5nIG11bHRpcGxlIHJvd3MgYXQgdGhlIHNhbWUgdGltZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ011bHRpUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIHJldHVybiBhIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGByb3dEcmFnQ29tcGAgd2hpbGUgZHJhZ2dpbmcgYSByb3cuXG4gICAgICAgICAqIElmIHRoaXMgY2FsbGJhY2sgaXMgbm90IHNldCwgdGhlIGN1cnJlbnQgY2VsbCB2YWx1ZSB3aWxsIGJlIHVzZWQuXG4gICAgICAgICAqIElmIHRoZSBgcm93RHJhZ1RleHRgIGNhbGxiYWNrIGlzIHNldCBpbiB0aGUgQ29sRGVmIGl0IHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhpcywgZXhjZXB0IHdoZW5cbiAgICAgICAgICogYHJvd0RyYWdFbnRpcmVSb3c9dHJ1ZWAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnVGV4dDogKChwYXJhbXM6IElSb3dEcmFnSXRlbSwgZHJhZ0l0ZW1Db3VudDogbnVtYmVyKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIGNlbGwgcmVuZGVyZXIgY29tcG9uZW50IHRvIHVzZSBmb3IgZnVsbCB3aWR0aCByb3dzLlxuICAgICAgICAqIFNlZSBbRnVsbCBXaWR0aCBSb3dzXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9mdWxsLXdpZHRoLXJvd3MvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgYGZ1bGxXaWR0aENlbGxSZW5kZXJlcmAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgZGV0YWlsIGdyaWQgZW1iZWRkZWQgaW4gdGhlIG1hc3RlciBncmlkJ3MgY29udGFpbmVyIGFuZCBzbyBsaW5rIHRoZWlyIGhvcml6b250YWwgc2Nyb2xsaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZpZXMgaG93IHRoZSByZXN1bHRzIG9mIHJvdyBncm91cGluZyBzaG91bGQgYmUgZGlzcGxheWVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiAgVGhlIG9wdGlvbnMgYXJlOlxuICAgICAgICAgKlxuICAgICAgICAgKiAtIGAnc2luZ2xlQ29sdW1uJ2A6IHNpbmdsZSBncm91cCBjb2x1bW4gYXV0b21hdGljYWxseSBhZGRlZCBieSB0aGUgZ3JpZC5cbiAgICAgICAgICogLSBgJ211bHRpcGxlQ29sdW1ucydgOiBhIGdyb3VwIGNvbHVtbiBwZXIgcm93IGdyb3VwIGlzIGFkZGVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICAgICAqIC0gYCdncm91cFJvd3MnYDogZ3JvdXAgcm93cyBhcmUgYXV0b21hdGljYWxseSBhZGRlZCBpbnN0ZWFkIG9mIGdyb3VwIGNvbHVtbnMuXG4gICAgICAgICAqIC0gYCdjdXN0b20nYDogaW5mb3JtcyB0aGUgZ3JpZCB0aGF0IGdyb3VwIGNvbHVtbnMgd2lsbCBiZSBwcm92aWRlZC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGlzcGxheVR5cGU6IFJvd0dyb3VwaW5nRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGdyb3VwaW5nLCBzZXQgdG8gdGhlIG51bWJlciBvZiBsZXZlbHMgdG8gZXhwYW5kIGJ5IGRlZmF1bHQsIGUuZy4gYDBgIGZvciBub25lLCBgMWAgZm9yIGZpcnN0IGxldmVsIG9ubHksIGV0Yy4gU2V0IHRvIGAtMWAgdG8gZXhwYW5kIGV2ZXJ5dGhpbmcuIERlZmF1bHQ6IGAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEZWZhdWx0RXhwYW5kZWQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNwZWNpZnlpbmcgdGhlIGdyb3VwICdhdXRvIGNvbHVtbicgaWYgeW91IGFyZSBub3QgaGFwcHkgd2l0aCB0aGUgZGVmYXVsdC4gSWYgZ3JvdXBpbmcsIHRoaXMgY29sdW1uIGRlZmluaXRpb24gaXMgaW5jbHVkZWQgYXMgdGhlIGZpcnN0IGNvbHVtbiBpbiB0aGUgZ3JpZC4gSWYgbm90IGdyb3VwaW5nLCB0aGlzIGNvbHVtbiBpcyBub3QgaW5jbHVkZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvR3JvdXBDb2x1bW5EZWY6IENvbERlZjxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBwcmVzZXJ2ZXMgdGhlIGN1cnJlbnQgZ3JvdXAgb3JkZXIgd2hlbiBzb3J0aW5nIG9uIG5vbi1ncm91cCBjb2x1bW5zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cE1haW50YWluT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBpZiB5b3Ugc2VsZWN0IGEgZ3JvdXAsIHRoZSBjaGlsZHJlbiBvZiB0aGUgZ3JvdXAgd2lsbCBhbHNvIGJlIHNlbGVjdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGRldGVybWluZSB3aGV0aGVyIGZpbHRlcnMgc2hvdWxkIGJlIGFwcGxpZWQgb24gYWdncmVnYXRlZCBncm91cCB2YWx1ZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwQWdnRmlsdGVyaW5nOiBib29sZWFuIHwgSXNSb3dGaWx0ZXJhYmxlPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZ3JvdXBpbmcsIHRoaXMgY29udHJvbHMgd2hldGhlciB0byBzaG93IGEgZ3JvdXAgZm9vdGVyIHdoZW4gdGhlIGdyb3VwIGlzIGV4cGFuZGVkLlxuICAgICAgICAgKiBJZiBgdHJ1ZWAsIHRoZW4gYnkgZGVmYXVsdCwgdGhlIGZvb3RlciB3aWxsIGNvbnRhaW4gYWdncmVnYXRlIGRhdGEgKGlmIGFueSkgd2hlbiBzaG93biBhbmQgdGhlIGhlYWRlciB3aWxsIGJlIGJsYW5rLlxuICAgICAgICAgKiBXaGVuIGNsb3NlZCwgdGhlIGhlYWRlciB3aWxsIGNvbnRhaW4gdGhlIGFnZ3JlZ2F0ZSBkYXRhIHJlZ2FyZGxlc3Mgb2YgdGhpcyBzZXR0aW5nIChhcyB0aGUgZm9vdGVyIGlzIGhpZGRlbiBhbnl3YXkpLlxuICAgICAgICAgKiBUaGlzIGlzIGhhbmR5IGZvciAndG90YWwnIHJvd3MsIHRoYXQgYXJlIGRpc3BsYXllZCBiZWxvdyB0aGUgZGF0YSB3aGVuIHRoZSBncm91cCBpcyBvcGVuLCBhbmQgYWxvbmdzaWRlIHRoZSBncm91cCB3aGVuIGl0IGlzIGNsb3NlZC5cbiAgICAgICAgICogRGVmYXVsdDogYGZhbHNlYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgYSAnZ3JhbmQgdG90YWwnIGdyb3VwIGZvb3RlciBhY3Jvc3MgYWxsIGdyb3Vwcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlVG90YWxGb290ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgYW5kIHNob3dpbmcgZm9vdGVyLCBhZ2dyZWdhdGUgZGF0YSB3aWxsIGFsd2F5cyBiZSBkaXNwbGF5ZWQgYXQgYm90aCB0aGUgaGVhZGVyIGFuZCBmb290ZXIgbGV2ZWxzLiBUaGlzIHN0b3BzIHRoZSBwb3NzaWJseSB1bmRlc2lyYWJsZSBiZWhhdmlvdXIgb2YgdGhlIGhlYWRlciBkZXRhaWxzICdqdW1waW5nJyB0byB0aGUgZm9vdGVyIG9uIGV4cGFuZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiB1c2luZyBgZ3JvdXBTZWxlY3RzQ2hpbGRyZW5gLCB0aGVuIG9ubHkgdGhlIGNoaWxkcmVuIHRoYXQgcGFzcyB0aGUgY3VycmVudCBmaWx0ZXIgd2lsbCBnZXQgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0ZpbHRlcmVkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG93cyB0aGUgb3BlbiBncm91cCBpbiB0aGUgZ3JvdXAgY29sdW1uIGZvciBub24tZ3JvdXAgcm93cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd09wZW5lZEdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGdyb3VwcyB0aGF0IG9ubHkgaGF2ZSBvbmUgY2hpbGQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGxvd2VzdCBsZXZlbCBncm91cHMgdGhhdCBvbmx5IGhhdmUgb25lIGNoaWxkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZGUgcGFyZW50cyB0aGF0IGFyZSBvcGVuLiBXaGVuIHVzZWQgd2l0aCBtdWx0aXBsZSBjb2x1bW5zIGZvciBzaG93aW5nIGdyb3VwcywgaXQgY2FuIGdpdmUgYSBtb3JlIHBsZWFzaW5nIHVzZXIgZXhwZXJpZW5jZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gcHJldmVudCB0aGUgZ3JpZCBmcm9tIGNyZWF0aW5nIGEgJyhCbGFua3MpJyBncm91cCBmb3Igbm9kZXMgd2hpY2ggZG8gbm90IGJlbG9uZyB0byBhIGdyb3VwLCBhbmQgZGlzcGxheSB0aGUgdW5iYWxhbmNlZCBub2RlcyBhbG9uZ3NpZGUgZ3JvdXAgbm9kZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwQWxsb3dVbmJhbGFuY2VkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdyb3cgZ3JvdXAgcGFuZWwnICh3aGVyZSB5b3UgZHJhZyByb3dzIHRvIGdyb3VwKSBhdCB0aGUgdG9wLiBEZWZhdWx0OiBgbmV2ZXJgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU2hvdzogJ2Fsd2F5cycgfCAnb25seVdoZW5Hcm91cGluZycgfCAnbmV2ZXInIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBDZWxsIFJlbmRlcmVyIHRvIHVzZSB3aGVuIGBncm91cERpc3BsYXlUeXBlID0gJ2dyb3VwUm93cydgLlxuICAgICAgICAqIFNlZSBbR3JvdXAgUm93IENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2dyb3VwaW5nLWdyb3VwLXJvd3MvI3Byb3ZpZGluZy1jZWxsLXJlbmRlcmVyKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGdyb3VwUm93UmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgYGdyb3VwUm93UmVuZGVyZXJgIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgd2hlbiBhIGNvbHVtbiBpcyB1bi1ncm91cGVkLCBpLmUuIHVzaW5nIHRoZSBSb3cgR3JvdXAgUGFuZWwsIGl0IGlzIG1hZGUgdmlzaWJsZSBpbiB0aGUgZ3JpZC4gVGhpcyBwcm9wZXJ0eSBzdG9wcyB0aGUgY29sdW1uIGJlY29taW5nIHZpc2libGUgYWdhaW4gd2hlbiB1bi1ncm91cGluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWtlQ29sdW1uVmlzaWJsZUFmdGVyVW5Hcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIEdyaWQgdG8gd29yayB3aXRoIFRyZWUgRGF0YS4gWW91IG11c3QgYWxzbyBpbXBsZW1lbnQgdGhlIGBnZXREYXRhUGF0aChkYXRhKWAgY2FsbGJhY2suICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBzb3J0IGluZGljYXRvcnMgYW5kIGFjdGlvbnMgZnJvbSB0aGUgcm93IGdyb3VwIHBhbmVsLiBEZWZhdWx0OiBgZmFsc2VgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBQYW5lbFN1cHByZXNzU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBrZWVwIG9wZW4gR3JvdXAgUm93cyB2aXNpYmxlIGF0IHRoZSB0b3Agb2YgdGhlIGdyaWQuIERlZmF1bHQ6IGBmYWxzZWAuKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dzU3RpY2t5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjQgLSBubyBsb25nZXIgbmVlZGVkLCB0cmFuc2FjdGlvbiB1cGRhdGVzIGtlZXAgZ3JvdXAgc3RhdGUgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlbWVtYmVyR3JvdXBTdGF0ZVdoZW5OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEYXRhIHRvIGJlIGRpc3BsYXllZCBhcyBwaW5uZWQgdG9wIHJvd3MgaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRUb3BSb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIGJvdHRvbSByb3dzIGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkQm90dG9tUm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIHJvdyBtb2RlbCB0eXBlLiBEZWZhdWx0OiBgY2xpZW50U2lkZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd01vZGVsVHlwZTogUm93TW9kZWxUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhlIGRhdGEgdG8gYmUgZGlzcGxheWVkIGFzIHJvd3MgaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEYXRhOiBURGF0YVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgMjcuMSBJbW11dGFibGUgRGF0YSBpcyBvbiBieSBkZWZhdWx0IHdoZW4gZ3JpZCBjYWxsYmFjayBnZXRSb3dJZCgpIGlzIGltcGxlbWVudGVkXG4gICAgICAgICAqIEVuYWJsZXMgSW1tdXRhYmxlIERhdGEgbW9kZSwgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBpbW11dGFibGUgc3RvcmVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbW11dGFibGVEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgZXhlY3V0aW5nIGEgYmF0Y2ggb2YgYXN5bmMgdHJhbnNhY3Rpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbldhaXRNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJldmVudHMgVHJhbnNhY3Rpb25zIGNoYW5naW5nIHNvcnQsIGZpbHRlciwgZ3JvdXAgb3IgcGl2b3Qgc3RhdGUgd2hlbiB0cmFuc2FjdGlvbiBvbmx5IGNvbnRhaW5zIHVwZGF0ZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBkYXRhc291cmNlIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRhc291cmNlOiBJRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAgICAgKiBEZWZhdWx0OiBgMWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlT3ZlcmZsb3dTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGV4dHJhIGJsYW5rIHJvd3MgdG8gZGlzcGxheSB0byB0aGUgdXNlciBhdCB0aGUgZW5kIG9mIHRoZSBkYXRhc2V0LCB3aGljaCBzZXRzIHRoZSB2ZXJ0aWNhbCBzY3JvbGwgYW5kIHRoZW4gYWxsb3dzIHRoZSBncmlkIHRvIHJlcXVlc3Qgdmlld2luZyBtb3JlIHJvd3Mgb2YgZGF0YS5cbiAgICAgICAgICogRGVmYXVsdDogYDFgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbmZpbml0ZUluaXRpYWxSb3dDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgaG93IG1hbnkgbG9hZGluZyByb3dzIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXIgZm9yIHRoZSByb290IGxldmVsIGdyb3VwLlxuICAgICAgICAgKiBEZWZhdWx0OiBgMWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI4IFdoZXRoZXIgdG8gdXNlIEZ1bGwgU3RvcmUgb3IgUGFydGlhbCBTdG9yZSBmb3Igc3RvcmluZyByb3dzLiBEZWZhdWx0OiBgcGFydGlhbGAuXG4gICAgICAgICAqIERlcHJlY2F0ZWQgaW4gZmF2b3VyIG9mIHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsLiBXaGVuIGZhbHNlLCBQYXJ0aWFsIFN0b3JlIGlzIHVzZWQuIFdoZW4gdHJ1ZSxcbiAgICAgICAgICogRnVsbCBTdG9yZSBpcyB1c2VkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVN0b3JlVHlwZTogU2VydmVyU2lkZVN0b3JlVHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBTZXJ2ZXItc2lkZSBSb3cgTW9kZWwgd2lsbCBzdXBwcmVzcyBJbmZpbml0ZSBTY3JvbGxpbmcgYW5kIGxvYWQgYWxsIHRoZSBkYXRhIGF0IHRoZSBjdXJyZW50IGxldmVsLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NlcnZlclNpZGVJbmZpbml0ZVNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcm93cyBmb3IgZWFjaCBibG9jayBpbiB0aGUgc3RvcmUsIGkuZS4gaG93IG1hbnkgcm93cyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgYXQgYSB0aW1lLlxuICAgICAgICAgKiBEZWZhdWx0OiBgMTAwYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVCbG9ja1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgYmxvY2tzIHRvIGtlZXAgaW4gdGhlIHN0b3JlLiBEZWZhdWx0IGlzIG5vIGxpbWl0LCBzbyBldmVyeSByZXF1ZXN0ZWQgYmxvY2sgaXMga2VwdC4gVXNlIHRoaXMgaWYgeW91IGhhdmUgbWVtb3J5IGNvbmNlcm5zLCBhbmQgYmxvY2tzIHRoYXQgd2VyZSBsZWFzdCByZWNlbnRseSB2aWV3ZWQgd2lsbCBiZSBwdXJnZWQgd2hlbiB0aGUgbGltaXQgaXMgaGl0LiBUaGUgZ3JpZCB3aWxsIGFkZGl0aW9uYWxseSBtYWtlIHN1cmUgaXQgaGFzIGFsbCB0aGUgYmxvY2tzIG5lZWRlZCB0byBkaXNwbGF5IHdoYXQgaXMgY3VycmVudGx5IHZpc2libGUsIGluIGNhc2UgdGhpcyBwcm9wZXJ0eSBpcyBzZXQgdG8gYSBsb3cgdmFsdWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhCbG9ja3NJbkNhY2hlOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJlcXVlc3RzIHRvIGhpdCB0aGUgc2VydmVyIHdpdGggY29uY3VycmVudGx5LiBJZiB0aGUgbWF4IGlzIHJlYWNoZWQsIHJlcXVlc3RzIGFyZSBxdWV1ZWQuXG4gICAgICAgICAqIFNldCB0byBgLTFgIGZvciBubyBtYXhpbXVtIHJlc3RyaWN0aW9uIG9uIHJlcXVlc3RzLlxuICAgICAgICAgKiBEZWZhdWx0OiBgMmBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGxvYWRpbmcgYSBibG9jay4gVXNlZnVsIHdoZW4gc2Nyb2xsaW5nIG92ZXIgbWFueSBibG9ja3MsIGFzIGl0IHByZXZlbnRzIGJsb2NrcyBsb2FkaW5nIHVudGlsIHNjcm9sbGluZyBoYXMgc2V0dGxlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGJsb2NrTG9hZERlYm91bmNlTWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgY2xvc2luZyBncm91cCByb3dzIHdpbGwgcmVtb3ZlIGNoaWxkcmVuIG9mIHRoYXQgcm93LiBOZXh0IHRpbWUgdGhlIHJvdyBpcyBvcGVuZWQsIGNoaWxkIHJvd3Mgd2lsbCBiZSByZWFkIGZyb20gdGhlIGRhdGFzb3VyY2UgYWdhaW4uIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHVyZ2VDbG9zZWRSb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB0aGUgYHNlcnZlclNpZGVEYXRhc291cmNlYCBmb3Igc2VydmVyIHNpZGUgcm93IG1vZGVsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZURhdGFzb3VyY2U6IElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBhbHdheXMgcmVmcmVzaGVzIHRvcCBsZXZlbCBncm91cHMgcmVnYXJkbGVzcyBvZiB3aGljaCBjb2x1bW4gd2FzIHNvcnRlZC4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcgJiBzb3J0aW5nIGlzIGhhbmRsZWQgb24gdGhlIHNlcnZlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRBbGxMZXZlbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgYWx3YXlzIHJlZnJlc2hlcyB0b3AgbGV2ZWwgZ3JvdXBzIHJlZ2FyZGxlc3Mgb2Ygd2hpY2ggY29sdW1uIHdhcyBmaWx0ZXJlZC4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcgJiBmaWx0ZXJpbmcgaXMgaGFuZGxlZCBvbiB0aGUgc2VydmVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRmlsdGVyQWxsTGV2ZWxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBcbiAgICAgICAgICogV2hlbiBlbmFibGVkLCBTb3J0aW5nIHdpbGwgYmUgZG9uZSBvbiB0aGUgc2VydmVyLiBPbmx5IGFwcGxpY2FibGUgd2hlbiBgc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw9dHJ1ZWAuXG4gICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0T25TZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgRmlsdGVyaW5nIHdpbGwgYmUgZG9uZSBvbiB0aGUgc2VydmVyLiBPbmx5IGFwcGxpY2FibGUgd2hlbiBgc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw9dHJ1ZWAuXG4gICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlck9uU2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjggVGhpcyBwcm9wZXJ0eSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgYHNlcnZlclNpZGVTb3J0QWxsTGV2ZWxzYCBpbnN0ZWFkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRpbmdBbHdheXNSZXNldHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOCBUaGlzIHByb3BlcnR5IGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBgc2VydmVyU2lkZUZpbHRlckFsbExldmVsc2AgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVGaWx0ZXJpbmdBbHdheXNSZXNldHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRvIHVzZSB0aGUgdmlld3BvcnQgcm93IG1vZGVsIHlvdSBuZWVkIHRvIHByb3ZpZGUgdGhlIGdyaWQgd2l0aCBhIGB2aWV3cG9ydERhdGFzb3VyY2VgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnREYXRhc291cmNlOiBJVmlld3BvcnREYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIHZpZXdwb3J0IHJvdyBtb2RlbCwgc2V0cyB0aGUgcGFnZSBzaXplIGZvciB0aGUgdmlld3BvcnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsUGFnZVNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyB2aWV3cG9ydCByb3cgbW9kZWwsIHNldHMgdGhlIGJ1ZmZlciBzaXplIGZvciB0aGUgdmlld3BvcnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsQnVmZmVyU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSBob3Jpem9udGFsIHNjcm9sbGJhci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIHNob3cgdGhlIHZlcnRpY2FsIHNjcm9sbGJhci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGRlYm91bmNlIHRoZSB2ZXJ0aWNhbCBzY3JvbGxiYXIuIENhbiBwcm92aWRlIHNtb290aGVyIHNjcm9sbGluZyBvbiBzbG93IG1hY2hpbmVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJvdW5jZVZlcnRpY2FsU2Nyb2xsYmFyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5ldmVyIHNob3cgdGhlIGhvcml6b250YWwgc2Nyb2xsLiBUaGlzIGlzIHVzZWZ1bCBpZiB0aGUgZ3JpZCBpcyBhbGlnbmVkIHdpdGggYW5vdGhlciBncmlkIGFuZCB3aWxsIHNjcm9sbCB3aGVuIHRoZSBvdGhlciBncmlkIHNjcm9sbHMuIChTaG91bGQgbm90IGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBgYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGxgLikgRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3Qgc2Nyb2xsIHRvIHRoZSB0b3Agd2hlbiBuZXcgcm93IGRhdGEgaXMgcHJvdmlkZWQuIFVzZSB0aGlzIGlmIHlvdSBkb24ndCB3YW50IHRoZSBkZWZhdWx0IGJlaGF2aW91ciBvZiBzY3JvbGxpbmcgdG8gdGhlIHRvcCBldmVyeSB0aW1lIHlvdSBsb2FkIG5ldyBkYXRhLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbE9uTmV3RGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IGFsbG93IG1vdXNld2hlZWwgLyB0b3VjaHBhZCBzY3JvbGwgd2hlbiBwb3B1cCBlbGVtZW50cyBhcmUgcHJlc2VudC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTY3JvbGxXaGVuUG9wdXBzQXJlT3BlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IHVzZSBhbmltYXRpb24gZnJhbWVzIHdoZW4gZHJhd2luZyByb3dzIHdoaWxlIHNjcm9sbGluZy4gVXNlIHRoaXMgaWYgdGhlIGdyaWQgaXMgd29ya2luZyBmYXN0IGVub3VnaCB0aGF0IHlvdSBkb24ndCBuZWVkIGFuaW1hdGlvbiBmcmFtZXMgYW5kIHlvdSBkb24ndCB3YW50IHRoZSBncmlkIHRvIGZsaWNrZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgbWlkZGxlIGNsaWNrcyB3aWxsIHJlc3VsdCBpbiBgY2xpY2tgIGV2ZW50cyBmb3IgY2VsbHMgYW5kIHJvd3MuIE90aGVyd2lzZSB0aGUgYnJvd3NlciB3aWxsIHVzZSBtaWRkbGUgY2xpY2sgdG8gc2Nyb2xsIHRoZSBncmlkLjxiciAvPioqTm90ZToqKiBOb3QgYWxsIGJyb3dzZXJzIGZpcmUgYGNsaWNrYCBldmVudHMgd2l0aCB0aGUgbWlkZGxlIGJ1dHRvbi4gTW9zdCB3aWxsIGZpcmUgb25seSBgbW91c2Vkb3duYCBhbmQgYG1vdXNldXBgIGV2ZW50cywgd2hpY2ggY2FuIGJlIHVzZWQgdG8gZm9jdXMgYSBjZWxsLCBidXQgd2lsbCBub3Qgd29yayB0byBjYWxsIHRoZSBgb25DZWxsQ2xpY2tlZGAgZnVuY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIG1vdXNlIHdoZWVsIGV2ZW50cyB3aWxsIGJlIHBhc3NlZCB0byB0aGUgYnJvd3Nlci4gVXNlZnVsIGlmIHlvdXIgZ3JpZCBoYXMgbm8gdmVydGljYWwgc2Nyb2xscyBhbmQgeW91IHdhbnQgdGhlIG1vdXNlIHRvIHNjcm9sbCB0aGUgYnJvd3NlciBwYWdlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUZWxsIHRoZSBncmlkIGhvdyB3aWRlIGluIHBpeGVscyB0aGUgc2Nyb2xsYmFyIGlzLCB3aGljaCBpcyB1c2VkIGluIGdyaWQgd2lkdGggY2FsY3VsYXRpb25zLiBTZXQgb25seSBpZiB1c2luZyBub24tc3RhbmRhcmQgYnJvd3Nlci1wcm92aWRlZCBzY3JvbGxiYXJzLCBzbyB0aGUgZ3JpZCBjYW4gdXNlIHRoZSBub24tc3RhbmRhcmQgc2l6ZSBpbiBpdHMgY2FsY3VsYXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2Nyb2xsYmFyV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVHlwZSBvZiBSb3cgU2VsZWN0aW9uOiBgc2luZ2xlYCwgYG11bHRpcGxlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1NlbGVjdGlvbjogJ3NpbmdsZScgfCAnbXVsdGlwbGUnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IG11bHRpcGxlIHJvd3MgdG8gYmUgc2VsZWN0ZWQgdXNpbmcgc2luZ2xlIGNsaWNrLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNdWx0aVNlbGVjdFdpdGhDbGljazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCByb3dzIHdpbGwgbm90IGJlIGRlc2VsZWN0ZWQgaWYgeW91IGhvbGQgZG93biBgQ3RybGAgYW5kIGNsaWNrIHRoZSByb3cgb3IgcHJlc3MgYFNwYWNlYC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCByb3cgc2VsZWN0aW9uIHdvbid0IGhhcHBlbiB3aGVuIHJvd3MgYXJlIGNsaWNrZWQuIFVzZSB3aGVuIHlvdSBvbmx5IHdhbnQgY2hlY2tib3ggc2VsZWN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjcgVGhpcyBwcm9wZXJ0eSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgYHN1cHByZXNzQ2VsbEZvY3VzYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIGNlbGxzIHdvbid0IGJlIGZvY3VzYWJsZS4gVGhpcyBtZWFucyBrZXlib2FyZCBuYXZpZ2F0aW9uIHdpbGwgYmUgZGlzYWJsZWQgZm9yIGdyaWQgY2VsbHMsIGJ1dCByZW1haW4gZW5hYmxlZCBpbiBvdGhlciBlbGVtZW50cyBvZiB0aGUgZ3JpZCBzdWNoIGFzIGNvbHVtbiBoZWFkZXJzLCBmbG9hdGluZyBmaWx0ZXJzLCB0b29sIHBhbmVscy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgb25seSBhIHNpbmdsZSByYW5nZSBjYW4gYmUgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBiZSBhYmxlIHRvIHNlbGVjdCB0aGUgdGV4dCB3aXRoaW4gY2VsbHMuXG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAqKk5vdGU6KiogV2hlbiB0aGlzIGlzIHNldCB0byBgdHJ1ZWAsIHRoZSBjbGlwYm9hcmQgc2VydmljZSBpcyBkaXNhYmxlZC5cbiAgICAgICAgICogRGVmYXVsdDogYGZhbHNlYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFJhbmdlIFNlbGVjdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBSYW5nZSBIYW5kbGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgRmlsbCBIYW5kbGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUZpbGxIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ3gnYCB0byBmb3JjZSB0aGUgZmlsbCBoYW5kbGUgZGlyZWN0aW9uIHRvIGhvcml6b250YWwsIG9yIHNldCB0byBgJ3knYCB0byBmb3JjZSB0aGUgZmlsbCBoYW5kbGUgZGlyZWN0aW9uIHRvIHZlcnRpY2FsLiBEZWZhdWx0OiBgeHlgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsSGFuZGxlRGlyZWN0aW9uOiAneCcgfCAneScgfCAneHknIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gcHJldmVudCBjZWxsIHZhbHVlcyBmcm9tIGJlaW5nIGNsZWFyZWQgd2hlbiB0aGUgUmFuZ2UgU2VsZWN0aW9uIGlzIHJlZHVjZWQgYnkgdGhlIEZpbGwgSGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXJyYXkgZGVmaW5pbmcgdGhlIG9yZGVyIGluIHdoaWNoIHNvcnRpbmcgb2NjdXJzIChpZiBzb3J0aW5nIGlzIGVuYWJsZWQpLiBWYWx1ZXMgY2FuIGJlIGAnYXNjJ2AsIGAnZGVzYydgIG9yIGBudWxsYC4gRm9yIGV4YW1wbGU6IGBzb3J0aW5nT3JkZXI6IFsnYXNjJywgJ2Rlc2MnXWAuIERlZmF1bHQ6IGBbbnVsbCwgJ2FzYycsICdkZXNjJ11gICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiAoU29ydERpcmVjdGlvbilbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzcGVjaWZ5IHRoYXQgdGhlIHNvcnQgc2hvdWxkIHRha2UgYWNjZW50ZWQgY2hhcmFjdGVycyBpbnRvIGFjY291bnQuIElmIHRoaXMgZmVhdHVyZSBpcyB0dXJuZWQgb24gdGhlIHNvcnQgd2lsbCBiZSBzbG93ZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFjY2VudGVkU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzaG93IHRoZSAnbm8gc29ydCcgaWNvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtdWx0aS1zb3J0IHdoZW4gdGhlIHVzZXIgc2hpZnQtY2xpY2tzIGEgY29sdW1uIGhlYWRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIG11bHRpLXNvcnQgd2hlbiB0aGUgdXNlciBjbGlja3MgYSBjb2x1bW4gaGVhZGVyLCByZWdhcmRsZXNzIG9mIGtleSBwcmVzc2VzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNNdWx0aVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ2N0cmwnYCB0byBoYXZlIG11bHRpIHNvcnRpbmcgd29yayB1c2luZyB0aGUgYEN0cmxgIChvciBgQ29tbWFuZCDijJhgIGZvciBNYWMpIGtleS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG11bHRpU29ydEtleTogJ2N0cmwnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIHNvcnRpbmcgb2YgdW4tc29ydGVkIGRhdGEgdG8gbWF0Y2ggb3JpZ2luYWwgcm93IGRhdGEuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJY29ucyB0byB1c2UgaW5zaWRlIHRoZSBncmlkIGluc3RlYWQgb2YgdGhlIGdyaWQncyBkZWZhdWx0IGljb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfCBzdHJpbmc7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERlZmF1bHQgcm93IGhlaWdodCBpbiBwaXhlbHMuIERlZmF1bHQ6IGAyNWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgc3R5bGUgcHJvcGVydGllcyB0byBhcHBseSB0byBhbGwgcm93cy4gU2V0IHRvIGFuIG9iamVjdCBvZiBrZXkgKHN0eWxlIG5hbWVzKSBhbmQgdmFsdWVzIChzdHlsZSB2YWx1ZXMpICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTdHlsZTogUm93U3R5bGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENTUyBjbGFzcyhlcykgZm9yIGFsbCByb3dzLiBQcm92aWRlIGVpdGhlciBhIHN0cmluZyAoY2xhc3MgbmFtZSkgb3IgYXJyYXkgb2Ygc3RyaW5ncyAoYXJyYXkgb2YgY2xhc3MgbmFtZXMpLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93Q2xhc3M6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSdWxlcyB3aGljaCBjYW4gYmUgYXBwbGllZCB0byBpbmNsdWRlIGNlcnRhaW4gQ1NTIGNsYXNzZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzc1J1bGVzOiBSb3dDbGFzc1J1bGVzPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBub3QgaGlnaGxpZ2h0IHJvd3MgYnkgYWRkaW5nIHRoZSBgYWctcm93LWhvdmVyYCBDU1MgY2xhc3MuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93SG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFVzZXMgQ1NTIGB0b3BgIGluc3RlYWQgb2YgQ1NTIGB0cmFuc2Zvcm1gIGZvciBwb3NpdGlvbmluZyByb3dzLiBVc2VmdWwgaWYgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiBpcyBjYXVzaW5nIGlzc3VlcyBzdWNoIGFzIHVzZWQgaW4gcm93IHNwYW5uaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd1RyYW5zZm9ybTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoaWdobGlnaHQgY29sdW1ucyBieSBhZGRpbmcgdGhlIGBhZy1jb2x1bW4taG92ZXJgIENTUyBjbGFzcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uSG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGFEaXNwbGF5VHlwZTogVHJlZURhdGFEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlR3JvdXBFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgY3VzdG9taXNpbmcgdGhlIGNvbnRleHQgbWVudS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENvbnRleHRNZW51SXRlbXM6IEdldENvbnRleHRNZW51SXRlbXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgY3VzdG9taXNpbmcgdGhlIG1haW4gJ2NvbHVtbiBoZWFkZXInIG1lbnUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRNYWluTWVudUl0ZW1zOiBHZXRNYWluTWVudUl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBwcm9jZXNzIHBvcHVwcyBhZnRlciB0aGV5IGFyZSBjcmVhdGVkLiBBcHBsaWNhdGlvbnMgY2FuIHVzZSB0aGlzIGlmIHRoZXkgd2FudCB0bywgZm9yIGV4YW1wbGUsIHJlcG9zaXRpb24gdGhlIHBvcHVwLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFByb2Nlc3NQb3B1cDogKChwYXJhbXM6IFBvc3RQcm9jZXNzUG9wdXBQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGNlbGxzIGZvciB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBgRGF0ZWAgb2JqZWN0cyB0aGF0IG5lZWQgdG8gaGF2ZSBhIHBhcnRpY3VsYXIgZm9ybWF0IGlmIGltcG9ydGluZyBpbnRvIEV4Y2VsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBoZWFkZXIgdmFsdWVzIGZvciB0aGUgY2xpcGJvYXJkLiAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NIZWFkZXJGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzSGVhZGVyRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGdyb3VwIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBjbGlwYm9hcmQuICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0dyb3VwSGVhZGVyRm9yQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0dyb3VwSGVhZGVyRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGNlbGxzIGZyb20gdGhlIGNsaXBib2FyZC4gSGFuZHkgaWYgZm9yIGV4YW1wbGUgeW91IGhhdmUgbnVtYmVyIGZpZWxkcywgYW5kIHdhbnQgdG8gYmxvY2sgbm9uLW51bWJlcnMgZnJvbSBnZXR0aW5nIGludG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZyb21DbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gZ2V0IHRoZSBkYXRhIHRoYXQgd291bGQgb3RoZXJ3aXNlIGdvIHRvIHRoZSBjbGlwYm9hcmQuIFRvIGJlIHVzZWQgd2hlbiB5b3Ugd2FudCB0byBjb250cm9sIHRoZSAnY29weSB0byBjbGlwYm9hcmQnIG9wZXJhdGlvbiB5b3Vyc2VsZi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlbmRUb0NsaXBib2FyZDogKChwYXJhbXM6IFNlbmRUb0NsaXBib2FyZFBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY29tcGxldGUgY29udHJvbCBvZiB0aGUgcGFzdGUgb3BlcmF0aW9uLCBpbmNsdWRpbmcgY2FuY2VsbGluZyB0aGUgb3BlcmF0aW9uIChzbyBub3RoaW5nIGhhcHBlbnMpIG9yIHJlcGxhY2luZyB0aGUgZGF0YSB3aXRoIG90aGVyIGRhdGEuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzRGF0YUZyb21DbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmdbXVtdIHwgbnVsbCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEdyaWQgY2FsbHMgdGhpcyBtZXRob2QgdG8ga25vdyBpZiBhbiBleHRlcm5hbCBmaWx0ZXIgaXMgcHJlc2VudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50OiAoKHBhcmFtczogSXNFeHRlcm5hbEZpbHRlclByZXNlbnRQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2hvdWxkIHJldHVybiBgdHJ1ZWAgaWYgZXh0ZXJuYWwgZmlsdGVyIHBhc3Nlcywgb3RoZXJ3aXNlIGBmYWxzZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb2VzRXh0ZXJuYWxGaWx0ZXJQYXNzOiAoKG5vZGU6IElSb3dOb2RlPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgdG8gY3VzdG9taXNlIHRoZSBjaGFydCB0b29sYmFyIGl0ZW1zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hhcnRUb29sYmFySXRlbXM6IEdldENoYXJ0VG9vbGJhckl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBlbmFibGUgZGlzcGxheWluZyB0aGUgY2hhcnQgaW4gYW4gYWx0ZXJuYXRpdmUgY2hhcnQgY29udGFpbmVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3JlYXRlQ2hhcnRDb250YWluZXI6ICgocGFyYW1zOiBDaGFydFJlZlBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIG5hdmlnYXRpb24gKGFycm93KSBrZXkgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgSGVhZGVyIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRIZWFkZXI6ICgocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtczxURGF0YT4pID0+IChIZWFkZXJQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBgVGFiYCBrZXkgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgSGVhZGVyIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgaGVhZGVyLiAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dEhlYWRlcjogKChwYXJhbXM6IFRhYlRvTmV4dEhlYWRlclBhcmFtczxURGF0YT4pID0+IChIZWFkZXJQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBuYXZpZ2F0aW9uIChhcnJvdykga2V5IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBDZWxsIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgY2VsbC4gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dENlbGw6ICgocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dENlbGxQYXJhbXM8VERhdGE+KSA9PiAoQ2VsbFBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgY2VsbCBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgQ2VsbCBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBudWxsIHRvIHN0YXkgb24gY3VycmVudCBjZWxsLiAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dENlbGw6ICgocGFyYW1zOiBUYWJUb05leHRDZWxsUGFyYW1zPFREYXRhPikgPT4gKENlbGxQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI3LjIgLSBVc2UgYGdldExvY2FsZVRleHRgIGluc3RlYWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGVUZXh0RnVuYzogKChrZXk6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBzdHJpbmcsIHZhcmlhYmxlVmFsdWVzPzogc3RyaW5nW10pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgY2FsbGJhY2sgZm9yIGxvY2FsaXNpbmcgdGV4dCB3aXRoaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRMb2NhbGVUZXh0OiAoKHBhcmFtczogR2V0TG9jYWxlVGV4dFBhcmFtczxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHdoYXQgYGRvY3VtZW50YCBpcyB1c2VkLiBDdXJyZW50bHkgdXNlZCBieSBEcmFnIGFuZCBEcm9wIChtYXkgZXh0ZW5kIHRvIG90aGVyIHBsYWNlcyBpbiB0aGUgZnV0dXJlKS4gVXNlIHRoaXMgd2hlbiB5b3Ugd2FudCB0aGUgZ3JpZCB0byB1c2UgYSBkaWZmZXJlbnQgYGRvY3VtZW50YCB0aGFuIHRoZSBvbmUgYXZhaWxhYmxlIG9uIHRoZSBnbG9iYWwgc2NvcGUuIFRoaXMgY2FuIGhhcHBlbiBpZiBkb2NraW5nIG91dCBjb21wb25lbnRzIChzb21ldGhpbmcgd2hpY2ggRWxlY3Ryb24gc3VwcG9ydHMpICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREb2N1bWVudDogKCgpID0+IERvY3VtZW50KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHVzZXIgdG8gZm9ybWF0IHRoZSBudW1iZXJzIGluIHRoZSBwYWdpbmF0aW9uIHBhbmVsLCBpLmUuICdyb3cgY291bnQnIGFuZCAncGFnZSBudW1iZXInIGxhYmVscy4gVGhpcyBpcyBmb3IgcGFnaW5hdGlvbiBwYW5lbCBvbmx5LCB0byBmb3JtYXQgbnVtYmVycyBpbnNpZGUgdGhlIGdyaWQncyBjZWxscyAoaS5lLiB5b3VyIGRhdGEpLCB0aGVuIHVzZSBgdmFsdWVGb3JtYXR0ZXJgIGluIHRoZSBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyOiAoKHBhcmFtczogUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtczxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyNy4yIC0gVXNlIGBnZXRHcm91cFJvd0FnZ2AgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93QWdnTm9kZXM6ICgobm9kZXM6IElSb3dOb2RlW10pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHVzZSB3aGVuIHlvdSBuZWVkIGFjY2VzcyB0byBtb3JlIHRoZW4gdGhlIGN1cnJlbnQgY29sdW1uIGZvciBhZ2dyZWdhdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldEdyb3VwUm93QWdnOiAoKHBhcmFtczogR2V0R3JvdXBSb3dBZ2dQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiAoQ2xpZW50LXNpZGUgUm93IE1vZGVsIG9ubHkpIEFsbG93cyBncm91cHMgdG8gYmUgb3BlbiBieSBkZWZhdWx0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNHcm91cE9wZW5CeURlZmF1bHQ6ICgocGFyYW1zOiBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgZGVmYXVsdCBzb3J0aW5nIG9mIGdyb3Vwcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvcjogKChwYXJhbXM6IEluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvclBhcmFtczxURGF0YT4pID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyNy4yIC0gVXNlIGBpbml0aWFsR3JvdXBPcmRlckNvbXBhcmF0b3JgIGluc3RlYWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRHcm91cE9yZGVyQ29tcGFyYXRvcjogKChub2RlQTogSVJvd05vZGU8VERhdGE+LCBub2RlQjogSVJvd05vZGU8VERhdGE+KSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjggLSBVc2UgYHByb2Nlc3NQaXZvdFJlc3VsdENvbERlZmAgaW5zdGVhZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1NlY29uZGFyeUNvbERlZjogKChjb2xEZWY6IENvbERlZjxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjggLSBVc2UgYHByb2Nlc3NQaXZvdFJlc3VsdENvbEdyb3VwRGVmYCBpbnN0ZWFkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sR3JvdXBEZWY6ICgoY29sR3JvdXBEZWY6IENvbEdyb3VwRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBwaXZvdGluZywgdG8gYWxsb3cgY2hhbmdpbmcgdGhlIHNlY29uZCBjb2x1bW4gZGVmaW5pdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NQaXZvdFJlc3VsdENvbERlZjogKChjb2xEZWY6IENvbERlZjxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggcGl2b3RpbmcsIHRvIGFsbG93IGNoYW5naW5nIHRoZSBzZWNvbmQgY29sdW1uIGdyb3VwIGRlZmluaXRpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUGl2b3RSZXN1bHRDb2xHcm91cERlZjogKChjb2xHcm91cERlZjogQ29sR3JvdXBEZWY8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aGVuIHdvcmtpbmcgd2l0aCBUcmVlIERhdGEgd2hlbiBgdHJlZURhdGEgPSB0cnVlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldERhdGFQYXRoOiBHZXREYXRhUGF0aDxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzZXR0aW5nIHRoZSBjaGlsZCBjb3VudCBmb3IgYSBncm91cCByb3cuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGlsZENvdW50OiAoKGRhdGFJdGVtOiBhbnkpID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBwcm92aWRpbmcgZGlmZmVyZW50IHBhcmFtcyBmb3IgZGlmZmVyZW50IGxldmVscyBvZiBncm91cGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zOiAoKHBhcmFtczogR2V0U2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXNQYXJhbXMpID0+IFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI4IFVzZSBgZ2V0U2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXNgIGluc3RlYWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlU3RvcmVQYXJhbXM6ICgocGFyYW1zOiBHZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc1BhcmFtcykgPT4gU2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXMpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgZ3JvdXBzIHRvIGJlIG9wZW4gYnkgZGVmYXVsdC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjYW5jZWxsaW5nIHRyYW5zYWN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb246IElzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNTUk0gVHJlZSBEYXRhOiBBbGxvd3Mgc3BlY2lmeWluZyB3aGljaCByb3dzIGFyZSBleHBhbmRhYmxlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXA6IElzU2VydmVyU2lkZUdyb3VwIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTU1JNIFRyZWUgRGF0YTogQWxsb3dzIHNwZWNpZnlpbmcgZ3JvdXAga2V5cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cEtleTogR2V0U2VydmVyU2lkZUdyb3VwS2V5IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSZXR1cm4gYSBidXNpbmVzcyBrZXkgZm9yIHRoZSBub2RlLiBJZiBpbXBsZW1lbnRlZCwgZWFjaCByb3cgaW4gdGhlIERPTSB3aWxsIGhhdmUgYW4gYXR0cmlidXRlIGByb3ctaWQ9J2FiYydgIHdoZXJlIGBhYmNgIGlzIHdoYXQgeW91IHJldHVybiBhcyB0aGUgYnVzaW5lc3Mga2V5LlxuICAgICAgICAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgYXV0b21hdGVkIHRlc3RpbmcsIGFzIGl0IHByb3ZpZGVzIGEgd2F5IGZvciB5b3VyIHRvb2wgdG8gaWRlbnRpZnkgcm93cyBiYXNlZCBvbiB1bmlxdWUgYnVzaW5lc3Mga2V5cy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldEJ1c2luZXNzS2V5Rm9yTm9kZTogKChub2RlOiBJUm93Tm9kZTxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyNy4xIFVzZSBgZ2V0Um93SWRgIGluc3RlYWQgLSBob3dldmVyIGJlIGF3YXJlLCBgZ2V0Um93SWQoKWAgd2lsbCBhbHNvIHNldCBncmlkIG9wdGlvbiBgaW1tdXRhYmxlRGF0YT10cnVlYFxuICAgICAgICAgKiBBbGxvd3MgeW91IHRvIHNldCB0aGUgSUQgZm9yIGEgcGFydGljdWxhciByb3cgbm9kZSBiYXNlZCBvbiB0aGUgZGF0YS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd05vZGVJZDogR2V0Um93Tm9kZUlkRnVuYzxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzZXR0aW5nIHRoZSBJRCBmb3IgYSBwYXJ0aWN1bGFyIHJvdyBub2RlIGJhc2VkIG9uIHRoZSBkYXRhLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SWQ6IEdldFJvd0lkRnVuYzxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgZ2V0Um93SWQoKSBjYWxsYmFjayBpcyBpbXBsZW1lbnRlZCBhbmQgbmV3IFJvdyBEYXRhIGlzIHNldCwgdGhlIGdyaWQgd2lsbCBkaXNyZWdhcmQgYWxsIHByZXZpb3VzIHJvd3MgYW5kIHRyZWF0IHRoZSBuZXcgUm93IERhdGEgYXMgbmV3IGRhdGEuIEFzIGEgY29uc2VxdWVuY2UsIGFsbCBSb3cgU3RhdGUgKGVnIHNlbGVjdGlvbiwgcmVuZGVyZWQgcm93cykgd2lsbCBiZSByZXNldC4gIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlc2V0Um93RGF0YU9uVXBkYXRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3Mgcm93cyBhZnRlciB0aGV5IGFyZSBjcmVhdGVkLCBzbyB5b3UgY2FuIGRvIGZpbmFsIGFkZGluZyBvZiBjdXN0b20gYXR0cmlidXRlcyBldGMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUm93UG9zdENyZWF0ZTogKChwYXJhbXM6IFByb2Nlc3NSb3dQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggcm93cyBhcmUgc2VsZWN0YWJsZS4gQnkgZGVmYXVsdCByb3dzIGFyZSBzZWxlY3RhYmxlLCBzbyByZXR1cm4gYGZhbHNlYCB0byBtYWtlIGEgcm93IHVuLXNlbGVjdGFibGUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd1NlbGVjdGFibGU6IElzUm93U2VsZWN0YWJsZTxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBNYXN0ZXIgRGV0YWlsIHRvIGRldGVybWluZSBpZiBhIHJvdyBzaG91bGQgYmUgYSBtYXN0ZXIgcm93LiBJZiBgZmFsc2VgIGlzIHJldHVybmVkIG5vIGRldGFpbCByb3cgd2lsbCBleGlzdCBmb3IgdGhpcyByb3cuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd01hc3RlcjogSXNSb3dNYXN0ZXI8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBmaWxsIHZhbHVlcyBpbnN0ZWFkIG9mIHNpbXBseSBjb3B5aW5nIHZhbHVlcyBvciBpbmNyZWFzaW5nIG51bWJlciB2YWx1ZXMgdXNpbmcgbGluZWFyIHByb2dyZXNzaW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbE9wZXJhdGlvbjogKChwYXJhbXM6IEZpbGxPcGVyYXRpb25QYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjcuMiBVc2UgYHBvc3RTb3J0Um93c2AgaW5zdGVhZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnQ6ICgobm9kZXM6IElSb3dOb2RlPFREYXRhPltdKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gcGVyZm9ybSBhZGRpdGlvbmFsIHNvcnRpbmcgYWZ0ZXIgdGhlIGdyaWQgaGFzIHNvcnRlZCB0aGUgcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvc3RTb3J0Um93czogKChwYXJhbXM6IFBvc3RTb3J0Um93c1BhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dTdHlsZWAgdG8gc2V0IHN0eWxlIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYW4gb2JqZWN0IG9mIENTUyB2YWx1ZXMgb3IgdW5kZWZpbmVkIGZvciBubyBzdHlsZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dTdHlsZTogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zPFREYXRhPikgPT4gUm93U3R5bGUgfCB1bmRlZmluZWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dDbGFzc2AgdG8gc2V0IGNsYXNzKGVzKSBmb3IgZWFjaCByb3cgaW5kaXZpZHVhbGx5LiBGdW5jdGlvbiBzaG91bGQgcmV0dXJuIGVpdGhlciBhIHN0cmluZyAoY2xhc3MgbmFtZSksIGFycmF5IG9mIHN0cmluZ3MgKGFycmF5IG9mIGNsYXNzIG5hbWVzKSBvciB1bmRlZmluZWQgZm9yIG5vIGNsYXNzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Q2xhc3M6ICgocGFyYW1zOiBSb3dDbGFzc1BhcmFtczxURGF0YT4pID0+IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdmVyc2lvbiBvZiBwcm9wZXJ0eSBgcm93SGVpZ2h0YCB0byBzZXQgaGVpZ2h0IGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYSBwb3NpdGl2ZSBudW1iZXIgb2YgcGl4ZWxzLCBvciByZXR1cm4gYG51bGxgL2B1bmRlZmluZWRgIHRvIHVzZSB0aGUgZGVmYXVsdCByb3cgaGVpZ2h0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SGVpZ2h0OiAoKHBhcmFtczogUm93SGVpZ2h0UGFyYW1zPFREYXRhPikgPT4gbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyNy4yIFVzZSBgaXNGdWxsV2lkdGhSb3dgIGluc3RlYWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0Z1bGxXaWR0aENlbGw6ICgocm93Tm9kZTogSVJvd05vZGU8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGVsbHMgdGhlIGdyaWQgaWYgdGhpcyByb3cgc2hvdWxkIGJlIHJlbmRlcmVkIGFzIGZ1bGwgd2lkdGguICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0Z1bGxXaWR0aFJvdzogKChwYXJhbXM6IElzRnVsbFdpZHRoUm93UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvKiogVGhlIHRvb2wgcGFuZWwgd2FzIGhpZGRlbiBvciBzaG93bi4gVXNlIGBhcGkuaXNUb29sUGFuZWxTaG93aW5nKClgIHRvIGdldCBzdGF0dXMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbFBhbmVsVmlzaWJsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgdG9vbCBwYW5lbCBzaXplIGhhcyBiZWVuIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbFBhbmVsU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxTaXplQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBQYXN0ZSBvcGVyYXRpb24gaGFzIHN0YXJ0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVTdGFydDogRXZlbnRFbWl0dGVyPFBhc3RlU3RhcnRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBQYXN0ZSBvcGVyYXRpb24gaGFzIGVuZGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlRW5kOiBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZUVuZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4sIG9yIGdyb3VwIG9mIGNvbHVtbnMsIHdhcyBoaWRkZW4gLyBzaG93bi4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WaXNpYmxlOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uLCBvciBncm91cCBvZiBjb2x1bW5zLCB3YXMgcGlubmVkIC8gdW5waW5uZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGlubmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGlubmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGlubmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgcmVzaXplZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5SZXNpemVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJlc2l6ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uIHdhcyBtb3ZlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Nb3ZlZDogRXZlbnRFbWl0dGVyPENvbHVtbk1vdmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgdmFsdWUgY29sdW1uIHdhcyBhZGRlZCBvciByZW1vdmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIHBpdm90IG1vZGUgZmxhZyB3YXMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdE1vZGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcGl2b3QgY29sdW1uIHdhcyBhZGRlZCwgcmVtb3ZlZCBvciBvcmRlciBjaGFuZ2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4gZ3JvdXAgd2FzIG9wZW5lZCAvIGNsb3NlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFVzZXIgc2V0IG5ldyBjb2x1bW5zLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIG5ld0NvbHVtbnNMb2FkZWQ6IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGxpc3Qgb2YgZ3JpZCBjb2x1bW5zIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBkaXNwbGF5ZWQgY29sdW1ucyBjaGFuZ2VkLiBUaGlzIGNhbiByZXN1bHQgZnJvbSBjb2x1bW5zIG9wZW4gLyBjbG9zZSwgY29sdW1uIG1vdmUsIHBpdm90LCBncm91cCwgZXRjLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGxpc3Qgb2YgcmVuZGVyZWQgY29sdW1ucyBjaGFuZ2VkIChvbmx5IGNvbHVtbnMgaW4gdGhlIHZpc2libGUgc2Nyb2xsZWQgdmlld3BvcnQgYXJlIHJlbmRlcmVkIGJ5IGRlZmF1bHQpLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogU2hvdGd1biAtIGdldHMgY2FsbGVkIHdoZW4gZWl0aGVyIGEpIG5ldyBjb2x1bW5zIGFyZSBzZXQgb3IgYikgYGNvbHVtbkFwaS5hcHBseUNvbHVtblN0YXRlKClgIGlzIHVzZWQsIHNvIGV2ZXJ5dGhpbmcgaGFzIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBPbmx5IHVzZWQgYnkgQW5ndWxhciwgUmVhY3QgYW5kIFZ1ZUpTIEFHIEdyaWQgY29tcG9uZW50cyAobm90IHVzZWQgaWYgZG9pbmcgcGxhaW4gSmF2YVNjcmlwdCkuXG4gICAgICAgICAqIElmIHRoZSBncmlkIHJlY2VpdmVzIGNoYW5nZXMgZHVlIHRvIGJvdW5kIHByb3BlcnRpZXMsIHRoaXMgZXZlbnQgZmlyZXMgYWZ0ZXIgdGhlIGdyaWQgaGFzIGZpbmlzaGVkIHByb2Nlc3NpbmcgdGhlIGNoYW5nZS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb21wb25lbnRTdGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFZhbHVlIGhhcyBjaGFuZ2VkIGFmdGVyIGVkaXRpbmcgKHRoaXMgZXZlbnQgd2lsbCBub3QgZmlyZSBpZiBlZGl0aW5nIHdhcyBjYW5jZWxsZWQsIGVnIEVTQyB3YXMgcHJlc3NlZCkgb3JcbiAgICAgICAgICogIGlmIGNlbGwgdmFsdWUgaGFzIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgcGFzdGUgb3BlcmF0aW9uLlxuICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBWYWx1ZSBoYXMgY2hhbmdlZCBhZnRlciBlZGl0aW5nLiBPbmx5IGZpcmVzIHdoZW4gZG9pbmcgUmVhZCBPbmx5IEVkaXRzLCBpZSBgcmVhZE9ubHlFZGl0PXRydWVgLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0UmVxdWVzdDogRXZlbnRFbWl0dGVyPENlbGxFZGl0UmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0UmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjZWxsJ3MgdmFsdWUgd2l0aGluIGEgcm93IGhhcyBjaGFuZ2VkLiBUaGlzIGV2ZW50IGNvcnJlc3BvbmRzIHRvIEZ1bGwgUm93IEVkaXRpbmcgb25seS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSBjZWxsIGhhcyBzdGFydGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIGNlbGwgaGFzIHN0b3BwZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdGFydGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RhcnRlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBGdWxsIFJvdyBFZGl0aW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIHJvdyBoYXMgc3RvcHBlZCAod2hlbiByb3cgZWRpdGluZyBpcyBlbmFibGVkKS4gV2hlbiByb3cgZWRpdGluZywgdGhpcyBldmVudCB3aWxsIGJlIGZpcmVkIG9uY2UgYW5kIGBjZWxsRWRpdGluZ1N0b3BwZWRgIHdpbGwgYmUgZmlyZWQgZm9yIGVhY2ggaW5kaXZpZHVhbCBjZWxsLiBPbmx5IGZpcmVzIHdoZW4gZG9pbmcgRnVsbCBSb3cgRWRpdGluZy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpbHRlciBoYXMgYmVlbiBvcGVuZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyT3BlbmVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIGFwcGxpZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgd2FzIG1vZGlmaWVkIGJ1dCBub3QgYXBwbGllZC4gVXNlZCB3aGVuIGZpbHRlcnMgaGF2ZSAnQXBwbHknIGJ1dHRvbnMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyTW9kaWZpZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGNyZWF0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRDcmVhdGVkOiBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0Q3JlYXRlZDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBkYXRhIHJhbmdlIGZvciB0aGUgY2hhcnQgaGFzIGJlZW4gY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPFREYXRhPj4oKTtcbiAgICAvKiogRm9ybWF0dGluZyBjaGFuZ2VzIGhhdmUgYmVlbiBtYWRlIGJ5IHVzZXJzIHRocm91Z2ggdGhlIEZvcm1hdCBQYW5lbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydE9wdGlvbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRPcHRpb25zQ2hhbmdlZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPFREYXRhPj4oKTtcbiAgICAvKiogQSBjaGFydCBoYXMgYmVlbiBkZXN0cm95ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnREZXN0cm95ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZDxURGF0YT4+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5RG93bmAgaGFwcGVuZWQgb24gYSBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxLZXlEb3duRXZlbnQ8VERhdGE+IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5UHJlc3NgIGhhcHBlbmVkIG9uIGEgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5UHJlc3M6IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBncmlkIGhhcyBpbml0aWFsaXNlZCBhbmQgaXMgcmVhZHkgZm9yIG1vc3QgYXBpIGNhbGxzLCBidXQgbWF5IG5vdCBiZSBmdWxseSByZW5kZXJlZCB5ZXQgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFJlYWR5OiBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaXJlZCB0aGUgZmlyc3QgdGltZSBkYXRhIGlzIHJlbmRlcmVkIGludG8gdGhlIGdyaWQuIFVzZSB0aGlzIGV2ZW50IGlmIHlvdSB3YW50IHRvIGF1dG8gcmVzaXplIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY29udGVudHMgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaXJzdERhdGFSZW5kZXJlZDogRXZlbnRFbWl0dGVyPEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBzaXplIG9mIHRoZSBncmlkIGBkaXZgIGhhcyBjaGFuZ2VkLiBJbiBvdGhlciB3b3JkcywgdGhlIGdyaWQgd2FzIHJlc2l6ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFNpemVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBEaXNwbGF5ZWQgcm93cyBoYXZlIGNoYW5nZWQuIFRyaWdnZXJlZCBhZnRlciBzb3J0LCBmaWx0ZXIgb3IgdHJlZSBleHBhbmQgLyBjb2xsYXBzZSBldmVudHMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW9kZWxVcGRhdGVkOiBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBET00sIGZvciBhbnkgcmVhc29uLiBVc2UgdG8gY2xlYW4gdXAgcmVzb3VyY2VzIChpZiBhbnkpIHVzZWQgYnkgdGhlIHJvdy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsUm93UmVtb3ZlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoaWNoIHJvd3MgYXJlIHJlbmRlcmVkIGluIHRoZSBET00gaGFzIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlld3BvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgYm9keSB3YXMgc2Nyb2xsZWQgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNYWluIGJvZHkgb2YgdGhlIGdyaWQgaGFzIHN0b3BwZWQgc2Nyb2xsaW5nLCBlaXRoZXIgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbEVuZDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBXaGVuIGRyYWdnaW5nIHN0YXJ0cy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RhcnRlZDogRXZlbnRFbWl0dGVyPERyYWdTdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RvcHMuIFRoaXMgY291bGQgYmUgYW55IGFjdGlvbiB0aGF0IHVzZXMgdGhlIGdyaWQncyBEcmFnIGFuZCBEcm9wIHNlcnZpY2UsIGUuZy4gQ29sdW1uIE1vdmluZywgQ29sdW1uIFJlc2l6aW5nLCBSYW5nZSBTZWxlY3Rpb24sIEZpbGwgSGFuZGxlLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUcmlnZ2VyZWQgZXZlcnkgdGltZSB0aGUgcGFnaW5nIHN0YXRlIGNoYW5nZXMuIFNvbWUgb2YgdGhlIG1vc3QgY29tbW9uIHNjZW5hcmlvcyBmb3IgdGhpcyBldmVudCB0byBiZSB0cmlnZ2VyZWQgYXJlOlxuICAgICAgICAgKlxuICAgICAgICAgKiAgLSBUaGUgcGFnZSBzaXplIGNoYW5nZXMuXG4gICAgICAgICAqICAtIFRoZSBjdXJyZW50IHNob3duIHBhZ2UgaXMgY2hhbmdlZC5cbiAgICAgICAgICogIC0gTmV3IGRhdGEgaXMgbG9hZGVkIG9udG8gdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGRyYWcgaGFzIHN0YXJ0ZWQsIG9yIGRyYWdnaW5nIHdhcyBhbHJlYWR5IHN0YXJ0ZWQgYW5kIHRoZSBtb3VzZSBoYXMgcmUtZW50ZXJlZCB0aGUgZ3JpZCBoYXZpbmcgcHJldmlvdXNseSBsZWZ0IHRoZSBncmlkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbnRlcjogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbW91c2UgaGFzIG1vdmVkIHdoaWxlIGRyYWdnaW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdNb3ZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbGVmdCB0aGUgZ3JpZCB3aGlsZSBkcmFnZ2luZy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTGVhdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGRyYWcgaGFzIGZpbmlzaGVkIG92ZXIgdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VuZDogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyBncm91cCBjb2x1bW4gd2FzIGFkZGVkIG9yIHJlbW92ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyBncm91cCB3YXMgb3BlbmVkIG9yIGNsb3NlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dHcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93R3JvdXBPcGVuZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpcmVkIHdoZW4gY2FsbGluZyBlaXRoZXIgb2YgdGhlIEFQSSBtZXRob2RzIGBleHBhbmRBbGwoKWAgb3IgYGNvbGxhcHNlQWxsKClgLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGV4cGFuZE9yQ29sbGFwc2VBbGw6IEV2ZW50RW1pdHRlcjxFeHBhbmRDb2xsYXBzZUFsbEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgY2xpZW50IGhhcyBzZXQgbmV3IHBpbm5lZCByb3cgZGF0YSBpbnRvIHRoZSBncmlkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBpbm5lZFJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI4IE5vIGxvbmdlciBmaXJlZCwgdXNlIG9uUm93RGF0YVVwZGF0ZWQgaW5zdGVhZCAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Um93RGF0YUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEYXRhQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGNsaWVudCBoYXMgdXBkYXRlZCBkYXRhIGZvciB0aGUgZ3JpZCBieSBlaXRoZXIgYSkgc2V0dGluZyBuZXcgUm93IERhdGEgb3IgYikgQXBwbHlpbmcgYSBSb3cgVHJhbnNhY3Rpb24uICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhVXBkYXRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBc3luYyB0cmFuc2FjdGlvbnMgaGF2ZSBiZWVuIGFwcGxpZWQuIENvbnRhaW5zIGEgbGlzdCBvZiBhbGwgdHJhbnNhY3Rpb24gcmVzdWx0cy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ6IEV2ZW50RW1pdHRlcjxBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPFREYXRhPj4oKTtcbiAgICAvKiogQ2VsbCBpcyBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDbGlja2VkOiBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ2VsbCBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbERvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgZm9jdXNlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRm9jdXNlZDogRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGVudGVyZWQgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3ZlckV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGxlZnQgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdXQ6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGRvd24gb24gY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlRG93bkV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBpcyBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93Q2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IGlzIGRvdWJsZSBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IGlzIHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuIFRoZSBldmVudCBjb250YWlucyB0aGUgbm9kZSBpbiBxdWVzdGlvbiwgc28gY2FsbCB0aGUgbm9kZSdzIGBpc1NlbGVjdGVkKClgIG1ldGhvZCB0byBzZWUgaWYgaXQgd2FzIGp1c3Qgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dTZWxlY3RlZDogRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBzZWxlY3Rpb24gaXMgY2hhbmdlZC4gVXNlIHRoZSBncmlkIEFQSSBgZ2V0U2VsZWN0ZWROb2RlcygpYCBvciBgZ2V0U2VsZWN0ZWRSb3dzKClgIHRvIGdldCB0aGUgbmV3IGxpc3Qgb2Ygc2VsZWN0ZWQgbm9kZXMgLyByb3cgZGF0YS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8U2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgcmlnaHQgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY2hhbmdlIHRvIHJhbmdlIHNlbGVjdGlvbiBoYXMgb2NjdXJyZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBTb3J0IGhhcyBjaGFuZ2VkLiBUaGUgZ3JpZCBhbHNvIGxpc3RlbnMgZm9yIHRoaXMgYW5kIHVwZGF0ZXMgdGhlIG1vZGVsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHNvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8U29ydENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcblxuXG4gICAgLy8gRW5hYmxlIHR5cGUgY29lcmNpb24gZm9yIGJvb2xlYW4gSW5wdXRzIHRvIHN1cHBvcnQgdXNlIGxpa2UgJ2VuYWJsZUNoYXJ0cycgaW5zdGVhZCBvZiBmb3JjaW5nICdbZW5hYmxlQ2hhcnRzXT1cInRydWVcIicgXG4gICAgLy8gaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3RlbXBsYXRlLXR5cGVjaGVjayNpbnB1dC1zZXR0ZXItY29lcmNpb24gXG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDZWxsRm9jdXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVidWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91blNvcnRJY29uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzTXVsdGlTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTG9hZGluZ092ZXJsYXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2tpcEhlYWRlck9uQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUGFyZW50c0luUm93Tm9kZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uTW92ZUFuaW1hdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZhYmxlQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGaWVsZERvdE5vdGF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUmFuZ2VIYW5kbGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUZpbGxIYW5kbGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xlYXJPbkZpbGxSZWR1Y3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlbHRhU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NUb3VjaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBc3luY0V2ZW50czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbnRleHRNZW51OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZW1lbWJlckdyb3VwU3RhdGVXaGVuTmV3RGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dHcm91cEhpZGVzQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29weVJvd3NUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29weUhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29weUdyb3VwSGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9waXZvdE1vZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWdnRnVuY0luSGVhZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0F0Um9vdExldmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9mdW5jdGlvbnNQYXNzaXZlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9mdW5jdGlvbnNSZWFkT25seTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYW5pbWF0ZVJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU2VsZWN0c0ZpbHRlcmVkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSdGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnRW50aXJlUm93OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dEcmFnOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vdmVXaGVuUm93RHJhZ2dpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdNdWx0aVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlR3JvdXBFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUGFnaW5hdGlvblBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEhpZGVPcGVuUGFyZW50czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBBbGxvd1VuYmFsYW5jZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2luYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2luYXRpb25BdXRvUGFnZVNpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2Nyb2xsT25OZXdEYXRhOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Njcm9sbFdoZW5Qb3B1cHNBcmVPcGVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wdXJnZUNsb3NlZFJvd05vZGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jYWNoZVF1aWNrRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnN1cmVEb21PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWNjZW50ZWRTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NoYW5nZURldGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdmFsdWVDYWNoZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdmFsdWVDYWNoZU5ldmVyRXhwaXJlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWdncmVnYXRlT25seUNoYW5nZWRDb2x1bW5zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FuaW1hdGlvbkZyYW1lOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0V4Y2VsRXhwb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NzdkV4cG9ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdHJlZURhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX21hc3RlckRldGFpbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck1vdmVzRG93bkFmdGVyRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW50ZXJNb3Zlc0Rvd246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUHJvcGVydHlOYW1lc0NoZWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dNdWx0aVNlbGVjdFdpdGhDbGljazogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNoYXJ0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2hhcnRUb29sUGFuZWxzQnV0dG9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NoYXJ0VG9vbFBhbmVsc0J1dHRvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9leGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Rvb2x0aXBNb3VzZVRyYWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9rZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2ltbXV0YWJsZURhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGV0YWlsUm93QXV0b0hlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUZpbHRlcmluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZVNvcnRpbmdBbHdheXNSZXNldHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0QWxsTGV2ZWxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlRmlsdGVyQWxsTGV2ZWxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlU29ydE9uU2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlRmlsdGVyT25TZXJ2ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWdnRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaG93T3BlbmVkR3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpcGJvYXJkQXBpOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vZGVsVXBkYXRlQWZ0ZXJVcGRhdGVUcmFuc2FjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX21haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwTWFpbnRhaW5PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29sdW1uSG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3JlYWN0VWk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUmVhY3RVaTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVhZE9ubHlFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd1ZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsRWRpdGluZ09uQmFja3NwYWNlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZXNldFJvd0RhdGFPblVwZGF0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVtb3ZlUGl2b3RIZWFkZXJSb3dXaGVuU2luZ2xlVmFsdWVDb2x1bW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29weVNpbmdsZUNlbGxSYW5nZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwUm93c1N0aWNreTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0dyb3VwUGFuZWxTdXBwcmVzc1NvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93U2hvd0NoYW5nZUFmdGVyRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIC8vIEBFTkRAXG59XG4iXX0=