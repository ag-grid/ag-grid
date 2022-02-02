import { __decorate, __metadata } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Grid, AgPromise } from "@ag-grid-community/core";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import { AgGridColumn } from "./ag-grid-column.component";
let AgGridAngular = class AgGridAngular {
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
        /** Specify the deliminator to use when copying to clipboard.     */
        this.clipboardDeliminator = undefined;
        /** Set to `true` to only have the range selection, and not row selection, copied to clipboard. Default: `false`     */
        this.suppressCopyRowsToClipboard = undefined;
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
        /** If `true`, then dots in field names (e.g. `address.firstline`) are not treated as deep references. Allows you to use dots in your field name if you prefer. Default: `false`     */
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
        /** @deprecated React UI is enabled by default. Use suppressReactUi=true to turn it off.
         */
        this.reactUi = undefined;
        /** @deprecated Set to true to enable the experimental React UI. Works with React framework only.
    It is planned the next major release of the grid will drop support of the legacy React engine,
    hence this property is deprecated as will be removed in the next major release.
         */
        this.suppressReactUi = undefined;
        /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.     */
        this.editType = undefined;
        /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click. Default: `false`     */
        this.singleClickEdit = undefined;
        /** Set to `true` so that neither single nor double click starts editing. Default: `false`     */
        this.suppressClickEdit = undefined;
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
        /** `cellRenderer` to use when data is loading via a DataSource.     */
        this.loadingCellRenderer = undefined;
        /** @deprecated As of v27, use `loadingCellRenderer` for framework components too.
         */
        this.loadingCellRendererFramework = undefined;
        /** Params to be passed to loading cell renderer component.     */
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
        /** Provide a custom `detailCellRenderer` to use when a master row is expanded.     */
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
        /** Provide a custom loading overlay component.     */
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
        /** Provide a custom no rows overlay component     */
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
        /** Sets the Cell Renderer to use for full width rows.     */
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
        /** Sets the Cell Renderer to use when `groupDisplayType = 'groupRows'`.     */
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
        /** Enables Immutable Data mode, for compatibility with immutable stores. Default: `false`     */
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
        /** Whether to use Full Store or Partial Store for storing rows. Default: `full`     */
        this.serverSideStoreType = undefined;
        /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
         * Default: `100`     */
        this.cacheBlockSize = undefined;
        /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.     */
        this.maxBlocksInCache = undefined;
        /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.
         * Set to `-1` for no maximum restriction on requests.
         * Default: `2`     */
        this.maxConcurrentDatasourceRequests = undefined;
        /** How many milliseconds to wait before loading a block. Useful when scrolling over many rows, spanning many Partial Store blocks, as it prevents blocks loading until scrolling has settled.     */
        this.blockLoadDebounceMillis = undefined;
        /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping. Default: `false`     */
        this.purgeClosedRowNodes = undefined;
        /** Provide the `serverSideDatasource` for server side row model.     */
        this.serverSideDatasource = undefined;
        /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping. Default: `false`     */
        this.serverSideSortingAlwaysResets = undefined;
        /** When enabled, always refreshes stores after filter has changed. Used by Full Store only, to allow Server-Side Filtering. Default: `false`     */
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
        /** Allows you to set the ID for a particular row node based on the data.     */
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
        /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.     */
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
    ngAfterViewInit() {
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
                .map((column) => {
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
        this._fullyReady.resolveNow(null, resolve => resolve);
    }
    ngOnChanges(changes) {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
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
};
AgGridAngular.ctorParameters = () => [
    { type: ElementRef },
    { type: ViewContainerRef },
    { type: AngularFrameworkOverrides },
    { type: AngularFrameworkComponentWrapper },
    { type: ComponentFactoryResolver }
];
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
], AgGridAngular.prototype, "clipboardDeliminator", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressCopyRowsToClipboard", void 0);
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
], AgGridAngular.prototype, "reactUi", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "suppressReactUi", void 0);
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
], AgGridAngular.prototype, "serverSideStoreType", void 0);
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
], AgGridAngular.prototype, "isGroupOpenByDefault", void 0);
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
export { AgGridAngular };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxhQUFhLEVBQ2IsU0FBUyxFQUNULHdCQUF3QixFQUN4QixlQUFlLEVBQ2YsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFHSCxhQUFhLEVBQ2IsSUFBSSxFQUtKLFNBQVMsRUFnSVosTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN4RSxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFZMUQsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYTtJQWtCdEIsWUFBWSxVQUFzQixFQUN0QixnQkFBa0MsRUFDbEMseUJBQW9ELEVBQ3BELHlCQUEyRCxFQUMzRCx3QkFBa0Q7UUFIbEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBa0M7UUFDM0QsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQWxCdEQsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUkzQiwwREFBMEQ7UUFDbEQsZ0JBQVcsR0FBdUIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWlIbEUsVUFBVTtRQUNWLHdFQUF3RTtRQUN4RCxjQUFT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WTt1REFBb0U7QUFFekc7SUFBVCxNQUFNLEVBQUU7OEJBQXlCLFlBQVk7c0RBQWtFO0FBRXRHO0lBQVQsTUFBTSxFQUFFOzhCQUErQixZQUFZOzREQUE4RTtBQUV4SDtJQUFULE1BQU0sRUFBRTs4QkFBcUIsWUFBWTtrREFBMEQ7QUFDMUY7SUFBVCxNQUFNLEVBQUU7OEJBQXFDLFlBQVk7a0VBQTBGO0FBQzFJO0lBQVQsTUFBTSxFQUFFOzhCQUFrQyxZQUFZOytEQUFvRjtBQUNqSTtJQUFULE1BQU0sRUFBRTs4QkFBa0MsWUFBWTsrREFBb0Y7QUFDakk7SUFBVCxNQUFNLEVBQUU7OEJBQW9DLFlBQVk7aUVBQXdGO0FBbjRCeEksYUFBYTtJQVZ6QixTQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsaUJBQWlCO1FBQzNCLFFBQVEsRUFBRSxFQUFFO1FBQ1osU0FBUyxFQUFFO1lBQ1AseUJBQXlCO1lBQ3pCLGdDQUFnQztTQUNuQztRQUNELDZFQUE2RTtRQUM3RSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtLQUN4QyxDQUFDO3FDQW1CMEIsVUFBVTtRQUNKLGdCQUFnQjtRQUNQLHlCQUF5QjtRQUN6QixnQ0FBZ0M7UUFDakMsd0JBQXdCO0dBdEJyRCxhQUFhLENBZ2hDekI7U0FoaENZLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEFmdGVyVmlld0luaXQsXG4gICAgQ29tcG9uZW50LFxuICAgIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBDb250ZW50Q2hpbGRyZW4sXG4gICAgRWxlbWVudFJlZixcbiAgICBFdmVudEVtaXR0ZXIsXG4gICAgSW5wdXQsXG4gICAgT3V0cHV0LFxuICAgIFF1ZXJ5TGlzdCxcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxuICAgIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmltcG9ydCB7XG4gICAgQ29sRGVmLFxuICAgIENvbHVtbkFwaSxcbiAgICBDb21wb25lbnRVdGlsLFxuICAgIEdyaWQsXG4gICAgR3JpZEFwaSxcbiAgICBHcmlkT3B0aW9ucyxcbiAgICBHcmlkUGFyYW1zLFxuICAgIE1vZHVsZSxcbiAgICBBZ1Byb21pc2UsXG4gICAgQ29sR3JvdXBEZWYsXG4gICAgRXhjZWxTdHlsZSxcbiAgICBJRGF0YXNvdXJjZSxcbiAgICBJU2VydmVyU2lkZURhdGFzb3VyY2UsXG4gICAgSVZpZXdwb3J0RGF0YXNvdXJjZSxcbiAgICBJQWdnRnVuYyxcbiAgICBDc3ZFeHBvcnRQYXJhbXMsXG4gICAgRXhjZWxFeHBvcnRQYXJhbXMsXG4gICAgU3RhdHVzUGFuZWxEZWYsXG4gICAgU2lkZUJhckRlZixcbiAgICBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMsXG4gICAgQWdDaGFydFRoZW1lLFxuICAgIFNlcnZlclNpZGVTdG9yZVR5cGUsXG4gICAgUm93R3JvdXBpbmdEaXNwbGF5VHlwZSxcbiAgICBJQ2VsbFJlbmRlcmVyQ29tcCxcbiAgICBJQ2VsbFJlbmRlcmVyRnVuYyxcbiAgICBHZXRDb250ZXh0TWVudUl0ZW1zLFxuICAgIEdldE1haW5NZW51SXRlbXMsXG4gICAgR2V0Um93Tm9kZUlkRnVuYyxcbiAgICBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtcyxcbiAgICBIZWFkZXJQb3NpdGlvbixcbiAgICBUYWJUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zLFxuICAgIENlbGxQb3NpdGlvbixcbiAgICBUYWJUb05leHRDZWxsUGFyYW1zLFxuICAgIFBvc3RQcm9jZXNzUG9wdXBQYXJhbXMsXG4gICAgR2V0RGF0YVBhdGgsXG4gICAgSUNlbGxSZW5kZXJlcixcbiAgICBJTG9hZGluZ092ZXJsYXlDb21wLFxuICAgIElOb1Jvd3NPdmVybGF5Q29tcCxcbiAgICBSb3dOb2RlLFxuICAgIElzUm93TWFzdGVyLFxuICAgIElzUm93U2VsZWN0YWJsZSxcbiAgICBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zLFxuICAgIFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtcyxcbiAgICBHZXRTZXJ2ZXJTaWRlR3JvdXBLZXksXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXAsXG4gICAgU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zLFxuICAgIENoYXJ0UmVmLFxuICAgIEdldENoYXJ0VG9vbGJhckl0ZW1zLFxuICAgIEZpbGxPcGVyYXRpb25QYXJhbXMsXG4gICAgSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbixcbiAgICBHZXRTZXJ2ZXJTaWRlU3RvcmVQYXJhbXNQYXJhbXMsXG4gICAgU2VydmVyU2lkZVN0b3JlUGFyYW1zLFxuICAgIElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcyxcbiAgICBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcyxcbiAgICBDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50LFxuICAgIE5ld0NvbHVtbnNMb2FkZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQsXG4gICAgRXhwYW5kQ29sbGFwc2VBbGxFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZWRFdmVudCxcbiAgICBHcmlkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5Nb3ZlZEV2ZW50LFxuICAgIENvbHVtblZpc2libGVFdmVudCxcbiAgICBDb2x1bW5QaW5uZWRFdmVudCxcbiAgICBDb2x1bW5Hcm91cE9wZW5lZEV2ZW50LFxuICAgIENvbHVtblJlc2l6ZWRFdmVudCxcbiAgICBEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZCxcbiAgICBSb3dHcm91cE9wZW5lZEV2ZW50LFxuICAgIFJvd0RhdGFDaGFuZ2VkRXZlbnQsXG4gICAgUm93RGF0YVVwZGF0ZWRFdmVudCxcbiAgICBQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50LFxuICAgIFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIENoYXJ0Q3JlYXRlZCxcbiAgICBDaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZCxcbiAgICBDaGFydE9wdGlvbnNDaGFuZ2VkLFxuICAgIENoYXJ0RGVzdHJveWVkLFxuICAgIFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQsXG4gICAgTW9kZWxVcGRhdGVkRXZlbnQsXG4gICAgUGFzdGVTdGFydEV2ZW50LFxuICAgIFBhc3RlRW5kRXZlbnQsXG4gICAgQ2VsbENsaWNrZWRFdmVudCxcbiAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxNb3VzZURvd25FdmVudCxcbiAgICBDZWxsQ29udGV4dE1lbnVFdmVudCxcbiAgICBDZWxsVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgUm93VmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ2VsbEZvY3VzZWRFdmVudCxcbiAgICBSb3dTZWxlY3RlZEV2ZW50LFxuICAgIFNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDZWxsS2V5RG93bkV2ZW50LFxuICAgIENlbGxLZXlQcmVzc0V2ZW50LFxuICAgIENlbGxNb3VzZU92ZXJFdmVudCxcbiAgICBDZWxsTW91c2VPdXRFdmVudCxcbiAgICBGaWx0ZXJDaGFuZ2VkRXZlbnQsXG4gICAgRmlsdGVyTW9kaWZpZWRFdmVudCxcbiAgICBGaWx0ZXJPcGVuZWRFdmVudCxcbiAgICBTb3J0Q2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQsXG4gICAgUm93Q2xpY2tlZEV2ZW50LFxuICAgIFJvd0RvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBHcmlkUmVhZHlFdmVudCxcbiAgICBHcmlkU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBWaWV3cG9ydENoYW5nZWRFdmVudCxcbiAgICBGaXJzdERhdGFSZW5kZXJlZEV2ZW50LFxuICAgIERyYWdTdGFydGVkRXZlbnQsXG4gICAgRHJhZ1N0b3BwZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgQ2VsbEVkaXRpbmdTdGFydGVkRXZlbnQsXG4gICAgQ2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgQm9keVNjcm9sbEV2ZW50LFxuICAgIEJvZHlTY3JvbGxFbmRFdmVudCxcbiAgICBQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50LFxuICAgIFJvd0RyYWdFdmVudCxcbiAgICBDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIFByb2Nlc3NSb3dQYXJhbXMsXG4gICAgUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzR3JvdXBIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUm93U3R5bGUsXG4gICAgUm93Q2xhc3NSdWxlcyxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dIZWlnaHRQYXJhbXMsXG4gICAgU2VuZFRvQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFRyZWVEYXRhRGlzcGxheVR5cGUsXG4gICAgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudCxcbiAgICBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudCxcbiAgICBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jXG59IGZyb20gXCJAYWctZ3JpZC1jb21tdW5pdHkvY29yZVwiO1xuXG5pbXBvcnQgeyBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzIH0gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya092ZXJyaWRlc1wiO1xuaW1wb3J0IHsgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIgfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclwiO1xuaW1wb3J0IHsgQWdHcmlkQ29sdW1uIH0gZnJvbSBcIi4vYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50XCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgXSxcbiAgICAvLyB0ZWxsIGFuZ3VsYXIgd2UgZG9uJ3Qgd2FudCB2aWV3IGVuY2Fwc3VsYXRpb24sIHdlIGRvbid0IHdhbnQgYSBzaGFkb3cgcm9vdFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIC8vIG5vdCBpbnRlbmRlZCBmb3IgdXNlciB0byBpbnRlcmFjdCB3aXRoLiBzbyBwdXR0aW5nIF8gaW4gc28gaWYgdXNlciBnZXRzIHJlZmVyZW5jZVxuICAgIC8vIHRvIHRoaXMgb2JqZWN0LCB0aGV5IGtpbmQnYSBrbm93IGl0J3Mgbm90IHBhcnQgb2YgdGhlIGFncmVlZCBpbnRlcmZhY2VcbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgZ3JpZFBhcmFtczogR3JpZFBhcmFtcztcblxuICAgIC8vIGluIG9yZGVyIHRvIGVuc3VyZSBmaXJpbmcgb2YgZ3JpZFJlYWR5IGlzIGRldGVybWluaXN0aWNcbiAgICBwcml2YXRlIF9mdWxseVJlYWR5OiBBZ1Byb21pc2U8Ym9vbGVhbj4gPSBBZ1Byb21pc2UucmVzb2x2ZSh0cnVlKTtcblxuICAgIC8vIG1ha2luZyB0aGVzZSBwdWJsaWMsIHNvIHRoZXkgYXJlIGFjY2Vzc2libGUgdG8gcGVvcGxlIHVzaW5nIHRoZSBuZzIgY29tcG9uZW50IHJlZmVyZW5jZXNcbiAgICBwdWJsaWMgYXBpOiBHcmlkQXBpO1xuICAgIHB1YmxpYyBjb2x1bW5BcGk6IENvbHVtbkFwaTtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgYW5ndWxhckZyYW1ld29ya092ZXJyaWRlczogQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcixcbiAgICAgICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Vmlld0NvbnRhaW5lclJlZih0aGlzLnZpZXdDb250YWluZXJSZWYpO1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyKHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnNldEVtaXR0ZXJVc2VkQ2FsbGJhY2sodGhpcy5pc0VtaXR0ZXJVc2VkLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBDb21wb25lbnRVdGlsLmNvcHlBdHRyaWJ1dGVzVG9HcmlkT3B0aW9ucyh0aGlzLmdyaWRPcHRpb25zLCB0aGlzLCB0cnVlKTtcblxuICAgICAgICB0aGlzLmdyaWRQYXJhbXMgPSB7XG4gICAgICAgICAgICBnbG9iYWxFdmVudExpc3RlbmVyOiB0aGlzLmdsb2JhbEV2ZW50TGlzdGVuZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGZyYW1ld29ya092ZXJyaWRlczogdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgcHJvdmlkZWRCZWFuSW5zdGFuY2VzOiB7XG4gICAgICAgICAgICAgICAgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kdWxlczogKHRoaXMubW9kdWxlcyB8fCBbXSkgYXMgYW55XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAmJiB0aGlzLmNvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5EZWZzID0gdGhpcy5jb2x1bW5zXG4gICAgICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXcgR3JpZCh0aGlzLl9uYXRpdmVFbGVtZW50LCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmdyaWRQYXJhbXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmFwaSkge1xuICAgICAgICAgICAgdGhpcy5hcGkgPSB0aGlzLmdyaWRPcHRpb25zLmFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaSkge1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5BcGkgPSB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBzb21ldGltZXMsIGVzcGVjaWFsbHkgaW4gbGFyZ2UgY2xpZW50IGFwcHMgZ3JpZFJlYWR5IGNhbiBmaXJlIGJlZm9yZSBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhpcyB0aWVzIHRoZXNlIHRvZ2V0aGVyIHNvIHRoYXQgZ3JpZFJlYWR5IHdpbGwgYWx3YXlzIGZpcmUgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGUgYWN0dWFsIGNvbnRhaW5pbmcgY29tcG9uZW50J3MgbmdBZnRlclZpZXdJbml0IHdpbGwgZmlyZSBqdXN0IGFmdGVyIGFnR3JpZEFuZ3VsYXInc1xuICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnJlc29sdmVOb3cobnVsbCwgcmVzb2x2ZSA9PiByZXNvbHZlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgQ29tcG9uZW50VXRpbC5wcm9jZXNzT25DaGFuZ2UoY2hhbmdlcywgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5hcGksIHRoaXMuY29sdW1uQXBpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIHRoZSBkZXN0cm95LCBzbyB3ZSBrbm93IG5vdCB0byBlbWl0IGFueSBldmVudHNcbiAgICAgICAgICAgIC8vIHdoaWxlIHRlYXJpbmcgZG93biB0aGUgZ3JpZC5cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5hcGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwaS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSdsbCBlbWl0IHRoZSBlbWl0IGlmIGEgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGEgZ2l2ZW4gZXZlbnQgZWl0aGVyIG9uIHRoZSBjb21wb25lbnQgdmlhIG5vcm1hbCBhbmd1bGFyIGJpbmRpbmdcbiAgICAvLyBvciB2aWEgZ3JpZE9wdGlvbnNcbiAgICBwcm90ZWN0ZWQgaXNFbWl0dGVyVXNlZChldmVudFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGNvbnN0IGhhc0VtaXR0ZXIgPSAhIWVtaXR0ZXIgJiYgZW1pdHRlci5vYnNlcnZlcnMgJiYgZW1pdHRlci5vYnNlcnZlcnMubGVuZ3RoID4gMDtcblxuICAgICAgICAvLyBncmlkUmVhZHkgPT4gb25HcmlkUmVhZHlcbiAgICAgICAgY29uc3QgYXNFdmVudE5hbWUgPSBgb24ke2V2ZW50VHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKX0ke2V2ZW50VHlwZS5zdWJzdHJpbmcoMSl9YFxuICAgICAgICBjb25zdCBoYXNHcmlkT3B0aW9uTGlzdGVuZXIgPSAhIXRoaXMuZ3JpZE9wdGlvbnMgJiYgISF0aGlzLmdyaWRPcHRpb25zW2FzRXZlbnROYW1lXTtcblxuICAgICAgICByZXR1cm4gaGFzRW1pdHRlciB8fCBoYXNHcmlkT3B0aW9uTGlzdGVuZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSB0ZWFyaW5nIGRvd24sIGRvbid0IGVtaXQgYW5ndWxhciBldmVudHMsIGFzIHRoaXMgY2F1c2VzXG4gICAgICAgIC8vIHByb2JsZW1zIHdpdGggdGhlIGFuZ3VsYXIgcm91dGVyXG4gICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdlbmVyaWNhbGx5IGxvb2sgdXAgdGhlIGV2ZW50VHlwZVxuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGlmIChlbWl0dGVyICYmIHRoaXMuaXNFbWl0dGVyVXNlZChldmVudFR5cGUpKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09PSAnZ3JpZFJlYWR5Jykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgZ3JpZFJlYWR5LCB3YWl0IGZvciBuZ0FmdGVyVmlld0luaXQgdG8gZmlyZSBmaXJzdCwgdGhlbiBlbWl0IHRoZVxuICAgICAgICAgICAgICAgIC8vIGdyaWRSZWFkeSBldmVudFxuICAgICAgICAgICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkudGhlbigocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb25zO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtb2R1bGVzOiBNb2R1bGVbXTtcblxuICAgIC8vIEBTVEFSVEBcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBzdGF0dXMgYmFyIGNvbXBvbmVudHMgdG8gdXNlIGluIHRoZSBzdGF0dXMgYmFyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3RhdHVzQmFyOiB7IHN0YXR1c1BhbmVsczogU3RhdHVzUGFuZWxEZWZbXTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBzaWRlIGJhciBjb21wb25lbnRzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2lkZUJhcjogU2lkZUJhckRlZiB8IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzaG93IHRoZSBjb250ZXh0IG1lbnUuIFVzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgJ3JpZ2h0IGNsaWNrJyBjb250ZXh0IG1lbnUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgYHN1cHByZXNzQ29udGV4dE1lbnVgLCB5b3UgY2FuIHVzZSB0aGUgYG9uQ2VsbENvbnRleHRNZW51YCBmdW5jdGlvbiB0byBwcm92aWRlIHlvdXIgb3duIGNvZGUgdG8gaGFuZGxlIGNlbGwgYGNvbnRleHRtZW51YCBldmVudHMuXG4gICAgICogVGhpcyBmbGFnIGlzIHVzZWZ1bCB0byBwcmV2ZW50IHRoZSBicm93c2VyIGZyb20gc2hvd2luZyBpdHMgZGVmYXVsdCBjb250ZXh0IG1lbnUuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY29udGV4dCBtZW51IHRvIHNob3csIGV2ZW4gd2hlbiBgQ3RybGAga2V5IGlzIGhlbGQgZG93bi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSBjb2x1bW4gbWVudSBidXR0b24sIHJhdGhlciB0aGFuIG9ubHkgc2hvd2luZyB3aGVuIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHVzZSB0aGUgYnJvd3NlcidzIGRlZmF1bHQgdG9vbHRpcCBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBncmlkJ3MgVG9vbHRpcCBDb21wb25lbnQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyB0aGF0IGl0IHRha2VzIGZvciB0b29sdGlwcyB0byBzaG93IHVwIG9uY2UgYW4gZWxlbWVudCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgLlxuICAgICAqIERlZmF1bHQ6IGAyMDAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFNob3dEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIHRoYXQgaXQgdGFrZXMgZm9yIHRvb2x0aXBzIHRvIGhpZGUgb25jZSB0aGV5IGhhdmUgYmVlbiBkaXNwbGF5ZWQuXG4gICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgLlxuICAgICAqIERlZmF1bHQ6IGAxMDAwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBIaWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRvb2x0aXBzIGZvbGxvdyB0aGUgY3Vyc29yIG9uY2UgdGhleSBhcmUgZGlzcGxheWVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwTW91c2VUcmFjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRE9NIGVsZW1lbnQgdG8gdXNlIGFzIHRoZSBwb3B1cCBwYXJlbnQgZm9yIGdyaWQgcG9wdXBzIChjb250ZXh0IG1lbnUsIGNvbHVtbiBtZW51IGV0YykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3B1cFBhcmVudDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxzbyBpbmNsdWRlIGhlYWRlcnMgd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZCB1c2luZyBgQ3RybCArIENgIGNsaXBib2FyZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgZ3JvdXAgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5R3JvdXBIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZnkgdGhlIGRlbGltaW5hdG9yIHRvIHVzZSB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2xpcGJvYXJkRGVsaW1pbmF0b3I6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvbmx5IGhhdmUgdGhlIHJhbmdlIHNlbGVjdGlvbiwgYW5kIG5vdCByb3cgc2VsZWN0aW9uLCBjb3BpZWQgdG8gY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gd29yayBhcm91bmQgYSBidWcgd2l0aCBFeGNlbCAoV2luZG93cykgdGhhdCBhZGRzIGFuIGV4dHJhIGVtcHR5IGxpbmUgYXQgdGhlIGVuZCBvZiByYW5nZXMgY29waWVkIHRvIHRoZSBjbGlwYm9hcmQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvZmYgcGFzdGUgb3BlcmF0aW9ucyB3aXRoaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZFBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN0b3AgdGhlIGdyaWQgdHJ5aW5nIHRvIHVzZSB0aGUgQ2xpcGJvYXJkIEFQSSwgaWYgaXQgaXMgYmxvY2tlZCwgYW5kIGltbWVkaWF0ZWx5IGZhbGxiYWNrIHRvIHRoZSB3b3JrYXJvdW5kLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IG9mIENvbHVtbiAvIENvbHVtbiBHcm91cCBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnM6IChDb2xEZWYgfCBDb2xHcm91cERlZilbXSB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvbi4gSXRlbXMgZGVmaW5lZCBpbiB0aGUgYWN0dWFsIGNvbHVtbiBkZWZpbml0aW9ucyBnZXQgcHJlY2VkZW5jZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xEZWY6IENvbERlZiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBncm91cCBkZWZpbml0aW9uLiBBbGwgY29sdW1uIGdyb3VwIGRlZmluaXRpb25zIHdpbGwgdXNlIHRoZXNlIHByb3BlcnRpZXMuIEl0ZW1zIGRlZmluZWQgaW4gdGhlIGFjdHVhbCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbiBnZXQgcHJlY2VkZW5jZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZjogUGFydGlhbDxDb2xHcm91cERlZj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBtYXAgb2YgY3VzdG9tIGNvbHVtbiB0eXBlcyB3aGljaCBjb250YWluIGdyb3VwcyBvZiBwcm9wZXJ0aWVzIHRoYXQgY29sdW1uIGRlZmluaXRpb25zIGNhbiBpbmhlcml0IGJ5IHJlZmVyZW5jaW5nIGluIHRoZWlyIGB0eXBlYCBwcm9wZXJ0eS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtblR5cGVzOiB7IFtrZXk6IHN0cmluZ106IENvbERlZjsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogS2VlcHMgdGhlIG9yZGVyIG9mIENvbHVtbnMgbWFpbnRhaW5lZCBhZnRlciBuZXcgQ29sdW1uIERlZmluaXRpb25zIGFyZSB1cGRhdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYWludGFpbkNvbHVtbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZW4gZG90cyBpbiBmaWVsZCBuYW1lcyAoZS5nLiBgYWRkcmVzcy5maXJzdGxpbmVgKSBhcmUgbm90IHRyZWF0ZWQgYXMgZGVlcCByZWZlcmVuY2VzLiBBbGxvd3MgeW91IHRvIHVzZSBkb3RzIGluIHlvdXIgZmllbGQgbmFtZSBpZiB5b3UgcHJlZmVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpZWxkRG90Tm90YXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YUNvbHVtbk1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhcHBseUNvbHVtbkRlZk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW1tdXRhYmxlQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2V0Q29sdW1uU3RhdGVFdmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBTZXQgdmlhIGBkZWZhdWx0Q29sRGVmLndpZHRoYFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBTZXQgdmlhIGBkZWZhdWx0Q29sRGVmLm1pbldpZHRoYFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtaW5Db2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBTZXQgdmlhIGBkZWZhdWx0Q29sRGVmLm1heFdpZHRoYFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBjb2x1bW4gbGFiZWwgaGVhZGVyLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIHRoZSB0aGVtZSB2YWx1ZSBvZiBgaGVhZGVyLWhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3dzIGNvbnRhaW5pbmcgaGVhZGVyIGNvbHVtbiBncm91cHMuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGhlYWRlckhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBmbG9hdGluZyBmaWx0ZXJzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIHRoZSB0aGVtZSB2YWx1ZSBvZiBgaGVhZGVyLWhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgY29sdW1ucyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGhlYWRlckhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzIHdoZW4gaW4gcGl2b3QgbW9kZS4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyBgZ3JvdXBIZWFkZXJIZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RHcm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvdyByZW9yZGVyaW5nIGFuZCBwaW5uaW5nIGNvbHVtbnMgYnkgZHJhZ2dpbmcgY29sdW1ucyBmcm9tIHRoZSBDb2x1bW5zIFRvb2wgUGFuZWwgdG8gdGhlIGdyaWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93RHJhZ0Zyb21Db2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIGNvbHVtbiBtb3ZpbmcsIGkuZS4gdG8gbWFrZSB0aGUgY29sdW1ucyBmaXhlZCBwb3NpdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgYGFnLWNvbHVtbi1tb3ZpbmdgIGNsYXNzIGlzIG5vdCBhZGRlZCB0byB0aGUgZ3JpZCB3aGlsZSBjb2x1bW5zIGFyZSBtb3ZpbmcuIEluIHRoZSBkZWZhdWx0IHRoZW1lcywgdGhpcyByZXN1bHRzIGluIG5vIGFuaW1hdGlvbiB3aGVuIG1vdmluZyBjb2x1bW5zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgd2hlbiB5b3UgZHJhZyBhIGNvbHVtbiBvdXQgb2YgdGhlIGdyaWQgKGUuZy4gdG8gdGhlIGdyb3VwIHpvbmUpIHRoZSBjb2x1bW4gaXMgbm90IGhpZGRlbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ3NoaWZ0J2AgdG8gaGF2ZSBzaGlmdC1yZXNpemUgYXMgdGhlIGRlZmF1bHQgcmVzaXplIG9wZXJhdGlvbiAoc2FtZSBhcyB1c2VyIGhvbGRpbmcgZG93biBgU2hpZnRgIHdoaWxlIHJlc2l6aW5nKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbFJlc2l6ZURlZmF1bHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3NlcyBhdXRvLXNpemluZyBjb2x1bW5zIGZvciBjb2x1bW5zLiBJbiBvdGhlciB3b3JkcywgZG91YmxlIGNsaWNraW5nIGEgY29sdW1uJ3MgaGVhZGVyJ3MgZWRnZSB3aWxsIG5vdCBhdXRvLXNpemUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIE51bWJlciBvZiBwaXhlbHMgdG8gYWRkIHRvIGEgY29sdW1uIHdpZHRoIGFmdGVyIHRoZSBbYXV0by1zaXppbmddKC9jb2x1bW4tc2l6aW5nLyNhdXRvLXNpemUtY29sdW1ucykgY2FsY3VsYXRpb24uXG4gICAgICogU2V0IHRoaXMgaWYgeW91IHdhbnQgdG8gYWRkIGV4dHJhIHJvb20gdG8gYWNjb21tb2RhdGUgKGZvciBleGFtcGxlKSBzb3J0IGljb25zLCBvciBzb21lIG90aGVyIGR5bmFtaWMgbmF0dXJlIG9mIHRoZSBoZWFkZXIuXG4gICAgICogRGVmYXVsdDogYDRgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2l6ZVBhZGRpbmc6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHNraXAgdGhlIGBoZWFkZXJOYW1lYCB3aGVuIGBhdXRvU2l6ZWAgaXMgY2FsbGVkIGJ5IGRlZmF1bHQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiBjb21wb25lbnQgbmFtZXMgdG8gY29tcG9uZW50cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IGFueTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGNvbXBvbmVudHNgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZyYW1ld29ya0NvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IHsgbmV3KCk6IGFueTsgfTsgfSB8IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgUmVhY3QgVUkgaXMgZW5hYmxlZCBieSBkZWZhdWx0LiBVc2Ugc3VwcHJlc3NSZWFjdFVpPXRydWUgdG8gdHVybiBpdCBvZmYuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlYWN0VWk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFNldCB0byB0cnVlIHRvIGVuYWJsZSB0aGUgZXhwZXJpbWVudGFsIFJlYWN0IFVJLiBXb3JrcyB3aXRoIFJlYWN0IGZyYW1ld29yayBvbmx5LlxuSXQgaXMgcGxhbm5lZCB0aGUgbmV4dCBtYWpvciByZWxlYXNlIG9mIHRoZSBncmlkIHdpbGwgZHJvcCBzdXBwb3J0IG9mIHRoZSBsZWdhY3kgUmVhY3QgZW5naW5lLFxuaGVuY2UgdGhpcyBwcm9wZXJ0eSBpcyBkZXByZWNhdGVkIGFzIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmV4dCBtYWpvciByZWxlYXNlLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1JlYWN0VWk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ2Z1bGxSb3cnYCB0byBlbmFibGUgRnVsbCBSb3cgRWRpdGluZy4gT3RoZXJ3aXNlIGxlYXZlIGJsYW5rIHRvIGVkaXQgb25lIGNlbGwgYXQgYSB0aW1lLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgU2luZ2xlIENsaWNrIEVkaXRpbmcgZm9yIGNlbGxzLCB0byBzdGFydCBlZGl0aW5nIHdpdGggYSBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IG5laXRoZXIgc2luZ2xlIG5vciBkb3VibGUgY2xpY2sgc3RhcnRzIGVkaXRpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc3RvcCBjZWxsIGVkaXRpbmcgd2hlbiBncmlkIGxvc2VzIGZvY3VzLlxuICAgICAqIFRoZSBkZWZhdWx0IGlzIHRoYXQgdGhlIGdyaWQgc3RheXMgZWRpdGluZyB1bnRpbCBmb2N1cyBnb2VzIG9udG8gYW5vdGhlciBjZWxsLiBGb3IgaW5saW5lIChub24tcG9wdXApIGVkaXRvcnMgb25seS5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck1vdmVzRG93bkFmdGVyRWRpdGAgdG8gaGF2ZSBFeGNlbC1zdHlsZSBiZWhhdmlvdXIgZm9yIHRoZSBgRW50ZXJgIGtleS5cbiAgICAgKiBpLmUuIHByZXNzaW5nIHRoZSBgRW50ZXJgIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGFsb25nIHdpdGggYGVudGVyTW92ZXNEb3duYCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlICdFbnRlcicga2V5LlxuICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIEVudGVyIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBVbmRvIC8gUmVkbyB3aGlsZSBlZGl0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBzaXplIG9mIHRoZSB1bmRvIC8gcmVkbyBzdGFjay4gRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZ0xpbWl0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1cyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0b3BFZGl0aW5nV2hlbkdyaWRMb3Nlc0ZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gQ1NWLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENzdkV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBDU1YuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gRXhjZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXM6IEV4Y2VsRXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBFeGNlbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBsaXN0IChhcnJheSkgb2YgRXhjZWwgc3R5bGVzIHRvIGJlIHVzZWQgd2hlbiBleHBvcnRpbmcgdG8gRXhjZWwgd2l0aCBzdHlsZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogRXhjZWxTdHlsZVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgZGVmYXVsdENzdkV4cG9ydFBhcmFtcyBvciBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXNcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgRXhjZWxFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJvd3MgYXJlIGZpbHRlcmVkIHVzaW5nIHRoaXMgdGV4dCBhcyBhIHF1aWNrIGZpbHRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIHF1aWNrIGZpbHRlciBjYWNoZSwgdXNlZCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIHdoZW4gdXNpbmcgdGhlIHF1aWNrIGZpbHRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVRdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCB0cmVlIGRhdGEgZmlsdGVyaW5nIGJlaGF2aW91ciB0byBpbnN0ZWFkIGV4Y2x1ZGUgY2hpbGQgbm9kZXMgZnJvbSBmaWx0ZXIgcmVzdWx0cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIEVuYWJsZSBDaGFydHMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGxpc3Qgb2YgY2hhcnQgdGhlbWVzIHRvIGJlIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lczogc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIGNvbnRhaW5pbmcgY3VzdG9tIGNoYXJ0IHRoZW1lcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGN1c3RvbUNoYXJ0VGhlbWVzOiB7IFtuYW1lOiBzdHJpbmddOiBBZ0NoYXJ0VGhlbWUgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhcnQgdGhlbWUgb3ZlcnJpZGVzIGFwcGxpZWQgdG8gYWxsIHRoZW1lcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVPdmVycmlkZXM6IEFnQ2hhcnRUaGVtZU92ZXJyaWRlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogYGNlbGxSZW5kZXJlcmAgdG8gdXNlIHdoZW4gZGF0YSBpcyBsb2FkaW5nIHZpYSBhIERhdGFTb3VyY2UuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gbG9hZGluZyBjZWxsIHJlbmRlcmVyIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gc2VsZWN0IHdoaWNoIGxvYWRpbmcgY2VsbCByZW5kZXJlciB0byBiZSB1c2VkIHdoZW4gZGF0YSBpcyBsb2FkaW5nIHZpYSBhIERhdGFTb3VyY2UuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3I6IExvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIG9mIGtleS0+dmFsdWUgcGFpcnMgZm9yIGxvY2FsaXNpbmcgdGV4dCB3aXRoaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGVUZXh0OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBNYXN0ZXIgRGV0YWlsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXN0ZXJEZXRhaWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8ga2VlcCBkZXRhaWwgcm93cyBmb3Igd2hlbiB0aGV5IGFyZSBkaXNwbGF5ZWQgYWdhaW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXRzIHRoZSBudW1iZXIgb2YgZGV0YWlscyByb3dzIHRvIGtlZXAuIERlZmF1bHQ6IGAxMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzQ291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBgZGV0YWlsQ2VsbFJlbmRlcmVyYCB0byB1c2Ugd2hlbiBhIG1hc3RlciByb3cgaXMgZXhwYW5kZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGRldGFpbENlbGxSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgcGFyYW1zIHRvIGJlIHVzZWQgYnkgdGhlIERldGFpbCBDZWxsIFJlbmRlcmVyLiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgcHJvdmlkZXMgdGhlIHBhcmFtcyB0byBlbmFibGUgZHluYW1pYyBkZWZpbml0aW9ucyBvZiB0aGUgcGFyYW1zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCBmaXhlZCBoZWlnaHQgaW4gcGl4ZWxzIGZvciBlYWNoIGRldGFpbCByb3cuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSBkZXRhaWwgZ3JpZCBkeW5hbWljYWxseSBjaGFuZ2UgaXQncyBoZWlnaHQgdG8gZml0IGl0J3Mgcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGVzIGEgY29udGV4dCBvYmplY3QgdGhhdCBpcyBwcm92aWRlZCB0byBkaWZmZXJlbnQgY2FsbGJhY2tzIHRoZSBncmlkIHVzZXMuIFVzZWQgZm9yIHBhc3NpbmcgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB0byB0aGUgY2FsbGJhY2tzIGJ5IHlvdXIgYXBwbGljYXRpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb250ZXh0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbGlzdCBvZiBncmlkcyB0byB0cmVhdCBhcyBBbGlnbmVkIEdyaWRzLiBJZiBncmlkcyBhcmUgYWxpZ25lZCB0aGVuIHRoZSBjb2x1bW5zIGFuZCBob3Jpem9udGFsIHNjcm9sbGluZyB3aWxsIGJlIGtlcHQgaW4gc3luYy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsaWduZWRHcmlkczogR3JpZE9wdGlvbnNbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhbmdlIHRoaXMgdmFsdWUgdG8gc2V0IHRoZSB0YWJJbmRleCBvcmRlciBvZiB0aGUgR3JpZCB3aXRoaW4geW91ciBhcHBsaWNhdGlvbi4gRGVmYXVsdDogYDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbnVtYmVyIG9mIHJvd3MgcmVuZGVyZWQgb3V0c2lkZSB0aGUgdmlld2FibGUgYXJlYSB0aGUgZ3JpZCByZW5kZXJzLlxuICAgICAqIEhhdmluZyBhIGJ1ZmZlciBtZWFucyB0aGUgZ3JpZCB3aWxsIGhhdmUgcm93cyByZWFkeSB0byBzaG93IGFzIHRoZSB1c2VyIHNsb3dseSBzY3JvbGxzIHZlcnRpY2FsbHkuXG4gICAgICogRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93QnVmZmVyOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvbiB0aGUgdmFsdWUgY2FjaGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlQ2FjaGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29uZmlndXJlIHRoZSB2YWx1ZSBjYWNoZSB0byBub3QgZXhwaXJlIGFmdGVyIGRhdGEgdXBkYXRlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZU5ldmVyRXhwaXJlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBjZWxsIGV4cHJlc3Npb25zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsRXhwcmVzc2lvbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgcm93IG5vZGVzIGRvIG5vdCBoYXZlIHRoZWlyIHBhcmVudHMgc2V0LlxuICAgICAqIFRoZSBncmlkIGRvZXNuJ3QgdXNlIHRoZSBwYXJlbnQgcmVmZXJlbmNlLCBidXQgaXQgaXMgaW5jbHVkZWQgdG8gaGVscCB0aGUgY2xpZW50IGNvZGUgbmF2aWdhdGUgdGhlIG5vZGUgdHJlZSBpZiBpdCB3YW50cyBieSBwcm92aWRpbmcgYmktZGlyZWN0aW9uIG5hdmlnYXRpb24gdXAgYW5kIGRvd24gdGhlIHRyZWUuXG4gICAgICogSWYgdGhpcyBpcyBhIHByb2JsZW0gKGUuZy4gaWYgeW91IG5lZWQgdG8gY29udmVydCB0aGUgdHJlZSB0byBKU09OLCB3aGljaCBkb2VzIG5vdCBhbGxvdyBjeWNsaWMgZGVwZW5kZW5jaWVzKSB0aGVuIHNldCB0aGlzIHRvIGB0cnVlYC5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0b3VjaCBzdXBwb3J0IChidXQgZG9lcyBub3QgcmVtb3ZlIHRoZSBicm93c2VyJ3MgZWZmb3J0cyB0byBzaW11bGF0ZSBtb3VzZSBldmVudHMgb24gdG91Y2gpLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzZXQgZm9jdXMgYmFjayBvbiB0aGUgZ3JpZCBhZnRlciBhIHJlZnJlc2guIFRoaXMgY2FuIGF2b2lkIGlzc3VlcyB3aGVyZSB5b3Ugd2FudCB0byBrZWVwIHRoZSBmb2N1cyBvbiBhbm90aGVyIHBhcnQgb2YgdGhlIGJyb3dzZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRm9jdXNBZnRlclJlZnJlc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSBhc3luY2hyb25vdXMgbmF0dXJlIG9mIHRoZSBldmVudHMgaW50cm9kdWNlZCBpbiB2MTAsIGFuZCBtYWtlcyB0aGVtIHN5bmNocm9ub3VzLiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGZvciB0aGUgcHVycG9zZSBvZiBzdXBwb3J0aW5nIGxlZ2FjeSBjb2RlIHdoaWNoIGhhcyBhIGRlcGVuZGVuY3kgb24gc3luY2hyb25vdXMgZXZlbnRzIGZyb20gZWFybGllciB2ZXJzaW9ucyAodjkgb3IgZWFybGllcikgb2YgQUcgR3JpZC4gICAgICoqSXQgaXMgc3Ryb25nbHkgcmVjb21tZW5kZWQgdGhhdCB5b3UgZG8gbm90IGNoYW5nZSB0aGlzIHByb3BlcnR5IHVubGVzcyB5b3UgaGF2ZSBsZWdhY3kgaXNzdWVzLioqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBncmlkIHdpbGwgY2hlY2sgZm9yIGBSZXNpemVPYnNlcnZlcmAgYW5kIHVzZSBpdCBpZiBpdCBleGlzdHMgaW4gdGhlIGJyb3dzZXIsIG90aGVyd2lzZSBpdCB3aWxsIHVzZSB0aGUgZ3JpZCdzIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9uLiBTb21lIHVzZXJzIHJlcG9ydGVkIGlzc3VlcyB3aXRoIENocm9tZSdzIGBSZXNpemVPYnNlcnZlcmAuIFVzZSB0aGlzIHByb3BlcnR5IHRvIGFsd2F5cyB1c2UgdGhlIGdyaWQncyBhbHRlcm5hdGl2ZSBpbXBsZW1lbnRhdGlvbiBzaG91bGQgc3VjaCBwcm9ibGVtcyBleGlzdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHNob3dpbmcgYSB3YXJuaW5nIG1lc3NhZ2UgaW4gdGhlIGNvbnNvbGUgaWYgdXNpbmcgYSBgZ3JpZE9wdGlvbnNgIG9yIGBjb2xEZWZgIHByb3BlcnR5IHRoYXQgZG9lc24ndCBleGlzdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIGNoYW5nZSBkZXRlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gZW5hYmxlIGRlYnVnIGluZm9ybWF0aW9uIGZyb20gdGhlIGdyaWQgYW5kIHJlbGF0ZWQgY29tcG9uZW50cy4gV2lsbCByZXN1bHQgaW4gYWRkaXRpb25hbCBsb2dnaW5nIGJlaW5nIG91dHB1dCwgYnV0IHZlcnkgdXNlZnVsIHdoZW4gaW52ZXN0aWdhdGluZyBwcm9ibGVtcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVidWc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSB0ZW1wbGF0ZSBmb3IgJ2xvYWRpbmcnIG92ZXJsYXkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5TG9hZGluZ1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gbG9hZGluZyBvdmVybGF5IGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlICdsb2FkaW5nJyBvdmVybGF5LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgdGVtcGxhdGUgZm9yICdubyByb3dzJyBvdmVybGF5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheU5vUm93c1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gbm8gcm93cyBvdmVybGF5IGNvbXBvbmVudCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIG5vIHJvd3Mgb3ZlcmxheSBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSAnbm8gcm93cycgb3ZlcmxheS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOb1Jvd3NPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgd2hldGhlciBwYWdpbmF0aW9uIGlzIGVuYWJsZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJvd3MgdG8gbG9hZCBwZXIgcGFnZS4gSWYgYHBhZ2luYXRpb25BdXRvUGFnZVNpemVgIGlzIHNwZWNpZmllZCwgdGhpcyBwcm9wZXJ0eSBpcyBpZ25vcmVkLiBEZWZhdWx0OiBgMTAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvblBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgbnVtYmVyIG9mIHJvd3MgdG8gbG9hZCBwZXIgcGFnZSBpcyBhdXRvbWF0aWNhbGx5IGFkanVzdGVkIGJ5IHRoZSBncmlkIHNvIGVhY2ggcGFnZSBzaG93cyBlbm91Z2ggcm93cyB0byBqdXN0IGZpbGwgdGhlIGFyZWEgZGVzaWduYXRlZCBmb3IgdGhlIGdyaWQuIElmIGBmYWxzZWAsIGBwYWdpbmF0aW9uUGFnZVNpemVgIGlzIHVzZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBwYWdlcyBzcGxpdCBjaGlsZHJlbiBvZiBncm91cHMgd2hlbiB1c2luZyBSb3cgR3JvdXBpbmcgb3IgZGV0YWlsIHJvd3Mgd2l0aCBNYXN0ZXIgRGV0YWlsLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0ZUNoaWxkUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgZGVmYXVsdCBncmlkIGNvbnRyb2xzIGZvciBuYXZpZ2F0aW9uIGFyZSBoaWRkZW4uXG4gICAgICogVGhpcyBpcyB1c2VmdWwgaWYgYHBhZ2luYXRpb249dHJ1ZWAgYW5kIHlvdSB3YW50IHRvIHByb3ZpZGUgeW91ciBvd24gcGFnaW5hdGlvbiBjb250cm9scy5cbiAgICAgKiBPdGhlcndpc2UsIHdoZW4gYHBhZ2luYXRpb249dHJ1ZWAgdGhlIGdyaWQgYXV0b21hdGljYWxseSBzaG93cyB0aGUgbmVjZXNzYXJ5IGNvbnRyb2xzIGF0IHRoZSBib3R0b20gc28gdGhhdCB0aGUgdXNlciBjYW4gbmF2aWdhdGUgdGhyb3VnaCB0aGUgZGlmZmVyZW50IHBhZ2VzLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFnaW5hdGlvblBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBwaXZvdCBtb2RlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdE1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdG8gc2hvdyB0aGUgJ3Bpdm90IHBhbmVsJyAod2hlcmUgeW91IGRyYWcgcm93cyB0byBwaXZvdCkgYXQgdGhlIHRvcC4gTm90ZSB0aGF0IHRoZSBwaXZvdCBwYW5lbCB3aWxsIG5ldmVyIHNob3cgaWYgYHBpdm90TW9kZWAgaXMgb2ZmLiBEZWZhdWx0OiBgbmV2ZXJgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFBhbmVsU2hvdzogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciB3aXRoaW4gdGhlIFBpdm90IENvbHVtbiBHcm91cHMsIGluIHRoZSBwb3NpdGlvbiBzcGVjaWZpZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbHVtbkdyb3VwVG90YWxzOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gc2V0IGFuZCB0aGUgZ3JpZCBpcyBpbiBwaXZvdCBtb2RlLCBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgdG90YWxzIHdpbGwgYXBwZWFyIGZvciBlYWNoIHZhbHVlIGNvbHVtbiBpbiB0aGUgcG9zaXRpb24gc3BlY2lmaWVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RSb3dUb3RhbHM6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzd2FwIGluIHRoZSBncm91cGluZyBjb2x1bW4gd2hlbiBwaXZvdGluZy4gVXNlZnVsIGlmIHBpdm90aW5nIHVzaW5nIFNlcnZlciBTaWRlIFJvdyBNb2RlbCBvciBWaWV3cG9ydCBSb3cgTW9kZWwgYW5kIHlvdSB3YW50IGZ1bGwgY29udHJvbCBvZiBhbGwgY29sdW1ucyBpbmNsdWRpbmcgdGhlIGdyb3VwIGNvbHVtbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgcGl2b3QgY29sdW1uIGdyb3VwcyB3aWxsIGFwcGVhciAnZml4ZWQnLCB3aXRob3V0IHRoZSBhYmlsaXR5IHRvIGV4cGFuZCBhbmQgY29sbGFwc2UgdGhlIGNvbHVtbiBncm91cHMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhwYW5kYWJsZVBpdm90R3JvdXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZW4gcm93IGdyb3VwLCBwaXZvdCBhbmQgdmFsdWUgYWdncmVnYXRpb24gd2lsbCBiZSByZWFkLW9ubHkgZnJvbSB0aGUgR1VJLiBUaGUgZ3JpZCB3aWxsIGRpc3BsYXkgd2hhdCB2YWx1ZXMgYXJlIHVzZWQgZm9yIGVhY2gsIGJ1dCB3aWxsIG5vdCBhbGxvdyB0aGUgdXNlciB0byBjaGFuZ2UgdGhlIHNlbGVjdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIG9mICdmdW5jdGlvbiBuYW1lJyB0byAnZnVuY3Rpb24nIGZvciBjdXN0b20gYWdncmVnYXRpb24gZnVuY3Rpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuY3M6IHsgW2tleTogc3RyaW5nXTogSUFnZ0Z1bmM7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBjb2x1bW4gaGVhZGVycyB3b24ndCBpbmNsdWRlIHRoZSBgYWdnRnVuY2AgbmFtZSwgZS5nLiBgJ3N1bShCYW5rIEJhbGFuY2UpYCcgd2lsbCBqdXN0IGJlIGAnQmFuayBCYWxhbmNlJ2AuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRnVuY0luSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGFnZ3JlZ2F0aW9ucyB3b24ndCBiZSBjb21wdXRlZCBmb3IgdGhlIHJvb3Qgbm9kZSBvZiB0aGUgZ3JpZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyBjaGFuZ2UgZGV0ZWN0aW9uLCBvbmx5IHRoZSB1cGRhdGVkIGNvbHVtbiB3aWxsIGJlIHJlLWFnZ3JlZ2F0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFnZ3JlZ2F0ZU9ubHlDaGFuZ2VkQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IGFnZ3JlZ2F0aW9ucyBhcmUgbm90IGltcGFjdGVkIGJ5IGZpbHRlcmluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFJvdyBBbmltYXRpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFuaW1hdGVSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgY2VsbHMgZmxhc2ggYWZ0ZXIgZGF0YSBjaGFuZ2VzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRvIGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBgZW5hYmxlQ2VsbENoYW5nZUZsYXNoYCwgdGhpcyBjb25maWd1cmF0aW9uIHdpbGwgc2V0IHRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgb2YgaG93IGxvbmcgYSBjZWxsIHNob3VsZCByZW1haW4gaW4gaXRzIFwiZmxhc2hlZFwiIHN0YXRlLlxuICAgICAqIERlZmF1bHQ6IGA1MDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmxhc2hEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGVuYWJsZUNlbGxDaGFuZ2VGbGFzaGAsIHRoaXMgY29uZmlndXJhdGlvbiB3aWxsIHNldCB0aGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIG9mIGhvdyBsb25nIHRoZSBcImZsYXNoZWRcIiBzdGF0ZSBhbmltYXRpb24gdGFrZXMgdG8gZmFkZSBhd2F5IGFmdGVyIHRoZSB0aW1lciBzZXQgYnkgYGNlbGxGbGFzaERlbGF5YCBoYXMgY29tcGxldGVkLlxuICAgICAqIERlZmF1bHQ6IGAxMDAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZhZGVEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTd2l0Y2ggYmV0d2VlbiBsYXlvdXQgb3B0aW9uczogYG5vcm1hbGAsIGBhdXRvSGVpZ2h0YCwgYHByaW50YC5cbiAgICAgKiBEZWZhdWx0OiBgbm9ybWFsYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG9tTGF5b3V0OiAnbm9ybWFsJyB8ICdhdXRvSGVpZ2h0JyB8ICdwcmludCcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgb3JkZXIgb2Ygcm93cyBhbmQgY29sdW1ucyBpbiB0aGUgRE9NIGFyZSBjb25zaXN0ZW50IHdpdGggd2hhdCBpcyBvbiBzY3JlZW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG9wZXJhdGUgdGhlIGdyaWQgaW4gUlRMIChSaWdodCB0byBMZWZ0KSBtb2RlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSdGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgZ3JpZCBkb2Vzbid0IHZpcnR1YWxpc2UgdGhlIGNvbHVtbnMuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSAxMDAgY29sdW1ucywgYnV0IG9ubHkgMTAgdmlzaWJsZSBkdWUgdG8gc2Nyb2xsaW5nLCBhbGwgMTAwIHdpbGwgYWx3YXlzIGJlIHJlbmRlcmVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0IHRoZSBncmlkIGhhcyBhIGxpbWl0IG9mIHJlbmRlcmluZyBhIG1heGltdW0gb2YgNTAwIHJvd3MgYXQgb25jZSAocmVtZW1iZXIgdGhlIGdyaWQgb25seSByZW5kZXJzIHJvd3MgeW91IGNhbiBzZWUsIHNvIHVubGVzcyB5b3VyIGRpc3BsYXkgc2hvd3MgbW9yZSB0aGFuIDUwMCByb3dzIHdpdGhvdXQgdmVydGljYWxseSBzY3JvbGxpbmcgdGhpcyB3aWxsIG5ldmVyIGJlIGFuIGlzc3VlKS5cbiAgICAgKiA8YnIgLz4qKlRoaXMgaXMgb25seSByZWxldmFudCBpZiB5b3UgYXJlIG1hbnVhbGx5IHNldHRpbmcgYHJvd0J1ZmZlcmAgdG8gYSBoaWdoIHZhbHVlIChyZW5kZXJpbmcgbW9yZSByb3dzIHRoYW4gY2FuIGJlIHNlZW4pIG9yIGlmIHlvdXIgZ3JpZCBoZWlnaHQgaXMgYWJsZSB0byBkaXNwbGF5IG1vcmUgdGhhbiA1MDAgcm93cyBhdCBvbmNlLioqXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBNYW5hZ2VkIFJvdyBEcmFnZ2luZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgcm93IGRyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0RyYWc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3MgbW92aW5nIHJvd3Mgd2hpbGUgZHJhZ2dpbmcgdGhlIGByb3dEcmFnYCB3YWZmbGUuIFRoaXMgb3B0aW9uIGhpZ2hsaWdodHMgdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSByb3cgd2lsbCBiZSBwbGFjZWQgYW5kIGl0IHdpbGwgb25seSBtb3ZlIHRoZSByb3cgb24gbW91c2UgdXAuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgY2xpY2tpbmcgYW5kIGRyYWdnaW5nIGFueXdoZXJlIG9uIHRoZSByb3cgd2l0aG91dCB0aGUgbmVlZCBmb3IgYSBkcmFnIGhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgZHJhZ2dpbmcgbXVsdGlwbGUgcm93cyBhdCB0aGUgc2FtZSB0aW1lLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTXVsdGlSb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIENlbGwgUmVuZGVyZXIgdG8gdXNlIGZvciBmdWxsIHdpZHRoIHJvd3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGZ1bGxXaWR0aENlbGxSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgYGZ1bGxXaWR0aENlbGxSZW5kZXJlcmAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgZGV0YWlsIGdyaWQgZW1iZWRkZWQgaW4gdGhlIG1hc3RlciBncmlkJ3MgY29udGFpbmVyIGFuZCBzbyBsaW5rIHRoZWlyIGhvcml6b250YWwgc2Nyb2xsaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVwcmVjYXRlZEVtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIGhvdyB0aGUgcmVzdWx0cyBvZiByb3cgZ3JvdXBpbmcgc2hvdWxkIGJlIGRpc3BsYXllZC5cbiAgICAgKiBcbiAgICAgKiAgIFRoZSBvcHRpb25zIGFyZTpcbiAgICAgKiBcbiAgICAgKiAtIGAnc2luZ2xlQ29sdW1uJ2A6IHNpbmdsZSBncm91cCBjb2x1bW4gYXV0b21hdGljYWxseSBhZGRlZCBieSB0aGUgZ3JpZC5cbiAgICAgKiAtIGAnbXVsdGlwbGVDb2x1bW5zJ2A6IGEgZ3JvdXAgY29sdW1uIHBlciByb3cgZ3JvdXAgaXMgYWRkZWQgYXV0b21hdGljYWxseS5cbiAgICAgKiAtIGAnZ3JvdXBSb3dzJ2A6IGdyb3VwIHJvd3MgYXJlIGF1dG9tYXRpY2FsbHkgYWRkZWQgaW5zdGVhZCBvZiBncm91cCBjb2x1bW5zLlxuICAgICAqIC0gYCdjdXN0b20nYDogaW5mb3JtcyB0aGUgZ3JpZCB0aGF0IGdyb3VwIGNvbHVtbnMgd2lsbCBiZSBwcm92aWRlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGlzcGxheVR5cGU6IFJvd0dyb3VwaW5nRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGdyb3VwaW5nLCBzZXQgdG8gdGhlIG51bWJlciBvZiBsZXZlbHMgdG8gZXhwYW5kIGJ5IGRlZmF1bHQsIGUuZy4gYDBgIGZvciBub25lLCBgMWAgZm9yIGZpcnN0IGxldmVsIG9ubHksIGV0Yy4gU2V0IHRvIGAtMWAgdG8gZXhwYW5kIGV2ZXJ5dGhpbmcuIERlZmF1bHQ6IGAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEZWZhdWx0RXhwYW5kZWQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNwZWNpZnlpbmcgdGhlIGdyb3VwICdhdXRvIGNvbHVtbicgaWYgeW91IGFyZSBub3QgaGFwcHkgd2l0aCB0aGUgZGVmYXVsdC4gSWYgZ3JvdXBpbmcsIHRoaXMgY29sdW1uIGRlZmluaXRpb24gaXMgaW5jbHVkZWQgYXMgdGhlIGZpcnN0IGNvbHVtbiBpbiB0aGUgZ3JpZC4gSWYgbm90IGdyb3VwaW5nLCB0aGlzIGNvbHVtbiBpcyBub3QgaW5jbHVkZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvR3JvdXBDb2x1bW5EZWY6IENvbERlZiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHByZXNlcnZlcyB0aGUgY3VycmVudCBncm91cCBvcmRlciB3aGVuIHNvcnRpbmcgb24gbm9uLWdyb3VwIGNvbHVtbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTWFpbnRhaW5PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIGlmIHlvdSBzZWxlY3QgYSBncm91cCwgdGhlIGNoaWxkcmVuIG9mIHRoZSBncm91cCB3aWxsIGFsc28gYmUgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgdGhpcyBjb250cm9scyB3aGV0aGVyIHRvIHNob3cgYSBncm91cCBmb290ZXIgd2hlbiB0aGUgZ3JvdXAgaXMgZXhwYW5kZWQuXG4gICAgICogSWYgYHRydWVgLCB0aGVuIGJ5IGRlZmF1bHQsIHRoZSBmb290ZXIgd2lsbCBjb250YWluIGFnZ3JlZ2F0ZSBkYXRhIChpZiBhbnkpIHdoZW4gc2hvd24gYW5kIHRoZSBoZWFkZXIgd2lsbCBiZSBibGFuay5cbiAgICAgKiBXaGVuIGNsb3NlZCwgdGhlIGhlYWRlciB3aWxsIGNvbnRhaW4gdGhlIGFnZ3JlZ2F0ZSBkYXRhIHJlZ2FyZGxlc3Mgb2YgdGhpcyBzZXR0aW5nIChhcyB0aGUgZm9vdGVyIGlzIGhpZGRlbiBhbnl3YXkpLlxuICAgICAqIFRoaXMgaXMgaGFuZHkgZm9yICd0b3RhbCcgcm93cywgdGhhdCBhcmUgZGlzcGxheWVkIGJlbG93IHRoZSBkYXRhIHdoZW4gdGhlIGdyb3VwIGlzIG9wZW4sIGFuZCBhbG9uZ3NpZGUgdGhlIGdyb3VwIHdoZW4gaXQgaXMgY2xvc2VkLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZUZvb3RlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzaG93IGEgJ2dyYW5kIHRvdGFsJyBncm91cCBmb290ZXIgYWNyb3NzIGFsbCBncm91cHMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZVRvdGFsRm9vdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIGFuZCBzaG93aW5nIGZvb3RlciwgYWdncmVnYXRlIGRhdGEgd2lsbCBhbHdheXMgYmUgZGlzcGxheWVkIGF0IGJvdGggdGhlIGhlYWRlciBhbmQgZm9vdGVyIGxldmVscy4gVGhpcyBzdG9wcyB0aGUgcG9zc2libHkgdW5kZXNpcmFibGUgYmVoYXZpb3VyIG9mIHRoZSBoZWFkZXIgZGV0YWlscyAnanVtcGluZycgdG8gdGhlIGZvb3RlciBvbiBleHBhbmQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NCbGFua0hlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgdXNpbmcgYGdyb3VwU2VsZWN0c0NoaWxkcmVuYCwgdGhlbiBvbmx5IHRoZSBjaGlsZHJlbiB0aGF0IHBhc3MgdGhlIGN1cnJlbnQgZmlsdGVyIHdpbGwgZ2V0IHNlbGVjdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2hvd3MgdGhlIG9wZW4gZ3JvdXAgaW4gdGhlIGdyb3VwIGNvbHVtbiBmb3Igbm9uLWdyb3VwIHJvd3MuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb2xsYXBzZSBncm91cHMgdGhhdCBvbmx5IGhhdmUgb25lIGNoaWxkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb2xsYXBzZSBsb3dlc3QgbGV2ZWwgZ3JvdXBzIHRoYXQgb25seSBoYXZlIG9uZSBjaGlsZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoaWRlIHBhcmVudHMgdGhhdCBhcmUgb3Blbi4gV2hlbiB1c2VkIHdpdGggbXVsdGlwbGUgY29sdW1ucyBmb3Igc2hvd2luZyBncm91cHMsIGl0IGNhbiBnaXZlIGEgbW9yZSBwbGVhc2luZyB1c2VyIGV4cGVyaWVuY2UuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGlkZU9wZW5QYXJlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdyb3cgZ3JvdXAgcGFuZWwnICh3aGVyZSB5b3UgZHJhZyByb3dzIHRvIGdyb3VwKSBhdCB0aGUgdG9wLiBEZWZhdWx0OiBgbmV2ZXJgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU2hvdzogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXRzIHRoZSBDZWxsIFJlbmRlcmVyIHRvIHVzZSB3aGVuIGBncm91cERpc3BsYXlUeXBlID0gJ2dyb3VwUm93cydgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgZ3JvdXBSb3dSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIGBncm91cFJvd1JlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQsIHdoZW4gYSBjb2x1bW4gaXMgdW4tZ3JvdXBlZCwgaS5lLiB1c2luZyB0aGUgUm93IEdyb3VwIFBhbmVsLCBpdCBpcyBtYWRlIHZpc2libGUgaW4gdGhlIGdyaWQuIFRoaXMgcHJvcGVydHkgc3RvcHMgdGhlIGNvbHVtbiBiZWNvbWluZyB2aXNpYmxlIGFnYWluIHdoZW4gdW4tZ3JvdXBpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBHcmlkIHRvIHdvcmsgd2l0aCBUcmVlIERhdGEuIFlvdSBtdXN0IGFsc28gaW1wbGVtZW50IHRoZSBgZ2V0RGF0YVBhdGgoZGF0YSlgIGNhbGxiYWNrLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gdGhpcyBpcyBub3cgZ3JvdXBSb3dSZW5kZXJlclBhcmFtcy5pbm5lclJlbmRlcmVyXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIHRoaXMgaXMgbm93IGdyb3VwUm93UmVuZGVyZXJQYXJhbXMuaW5uZXJSZW5kZXJlclxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0lubmVyUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZ3JvdXBEaXNwbGF5VHlwZSA9ICdtdWx0aXBsZUNvbHVtbnMnIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNdWx0aUF1dG9Db2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGdyb3VwRGlzcGxheVR5cGUgPSAnZ3JvdXBSb3dzJyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwVXNlRW50aXJlUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBncm91cERpc3BsYXlUeXBlID0gJ2N1c3RvbScgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFN1cHByZXNzQXV0b0NvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBubyBsb25nZXIgbmVlZGVkLCB0cmFuc2FjdGlvbiB1cGRhdGVzIGtlZXAgZ3JvdXAgc3RhdGVcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVtZW1iZXJHcm91cFN0YXRlV2hlbk5ld0RhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERhdGEgdG8gYmUgZGlzcGxheWVkIGFzIHBpbm5lZCB0b3Agcm93cyBpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFRvcFJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEYXRhIHRvIGJlIGRpc3BsYXllZCBhcyBwaW5uZWQgYm90dG9tIHJvd3MgaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRCb3R0b21Sb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgcm93IG1vZGVsIHR5cGUuIERlZmF1bHQ6IGBjbGllbnRTaWRlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TW9kZWxUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGUgZGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcm93cyBpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RhdGE6IGFueVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRW5hYmxlcyBJbW11dGFibGUgRGF0YSBtb2RlLCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIGltbXV0YWJsZSBzdG9yZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGltbXV0YWJsZURhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBleGVjdXRpbmcgYSBiYXRjaCBvZiBhc3luYyB0cmFuc2FjdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uV2FpdE1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyBUcmFuc2FjdGlvbnMgY2hhbmdpbmcgc29ydCwgZmlsdGVyLCBncm91cCBvciBwaXZvdCBzdGF0ZSB3aGVuIHRyYW5zYWN0aW9uIG9ubHkgY29udGFpbnMgdXBkYXRlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb2RlbFVwZGF0ZUFmdGVyVXBkYXRlVHJhbnNhY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVJvd0RhdGFNb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB1c2UgYXN5bmNUcmFuc2FjdGlvbldhaXRNaWxsaXMgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBiYXRjaFVwZGF0ZVdhaXRNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB0aGUgZGF0YXNvdXJjZSBmb3IgaW5maW5pdGUgc2Nyb2xsaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0YXNvdXJjZTogSURhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGV4dHJhIGJsYW5rIHJvd3MgdG8gZGlzcGxheSB0byB0aGUgdXNlciBhdCB0aGUgZW5kIG9mIHRoZSBkYXRhc2V0LCB3aGljaCBzZXRzIHRoZSB2ZXJ0aWNhbCBzY3JvbGwgYW5kIHRoZW4gYWxsb3dzIHRoZSBncmlkIHRvIHJlcXVlc3Qgdmlld2luZyBtb3JlIHJvd3Mgb2YgZGF0YS5cbiAgICAgKiBEZWZhdWx0OiBgMWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlT3ZlcmZsb3dTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGV4dHJhIGJsYW5rIHJvd3MgdG8gZGlzcGxheSB0byB0aGUgdXNlciBhdCB0aGUgZW5kIG9mIHRoZSBkYXRhc2V0LCB3aGljaCBzZXRzIHRoZSB2ZXJ0aWNhbCBzY3JvbGwgYW5kIHRoZW4gYWxsb3dzIHRoZSBncmlkIHRvIHJlcXVlc3Qgdmlld2luZyBtb3JlIHJvd3Mgb2YgZGF0YS5cbiAgICAgKiBEZWZhdWx0OiBgMWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluZmluaXRlSW5pdGlhbFJvd0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZXRoZXIgdG8gdXNlIEZ1bGwgU3RvcmUgb3IgUGFydGlhbCBTdG9yZSBmb3Igc3RvcmluZyByb3dzLiBEZWZhdWx0OiBgZnVsbGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTdG9yZVR5cGU6IFNlcnZlclNpZGVTdG9yZVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJvd3MgZm9yIGVhY2ggYmxvY2sgaW4gdGhlIHN0b3JlLCBpLmUuIGhvdyBtYW55IHJvd3MgcmV0dXJuZWQgZnJvbSB0aGUgc2VydmVyIGF0IGEgdGltZS5cbiAgICAgKiBEZWZhdWx0OiBgMTAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVCbG9ja1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgYmxvY2tzIHRvIGtlZXAgaW4gdGhlIHN0b3JlLiBEZWZhdWx0IGlzIG5vIGxpbWl0LCBzbyBldmVyeSByZXF1ZXN0ZWQgYmxvY2sgaXMga2VwdC4gVXNlIHRoaXMgaWYgeW91IGhhdmUgbWVtb3J5IGNvbmNlcm5zLCBhbmQgYmxvY2tzIHRoYXQgd2VyZSBsZWFzdCByZWNlbnRseSB2aWV3ZWQgd2lsbCBiZSBwdXJnZWQgd2hlbiB0aGUgbGltaXQgaXMgaGl0LiBUaGUgZ3JpZCB3aWxsIGFkZGl0aW9uYWxseSBtYWtlIHN1cmUgaXQgaGFzIGFsbCB0aGUgYmxvY2tzIG5lZWRlZCB0byBkaXNwbGF5IHdoYXQgaXMgY3VycmVudGx5IHZpc2libGUsIGluIGNhc2UgdGhpcyBwcm9wZXJ0eSBpcyBzZXQgdG8gYSBsb3cgdmFsdWUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhCbG9ja3NJbkNhY2hlOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJlcXVlc3RzIHRvIGhpdCB0aGUgc2VydmVyIHdpdGggY29uY3VycmVudGx5LiBJZiB0aGUgbWF4IGlzIHJlYWNoZWQsIHJlcXVlc3RzIGFyZSBxdWV1ZWQuXG4gICAgICogU2V0IHRvIGAtMWAgZm9yIG5vIG1heGltdW0gcmVzdHJpY3Rpb24gb24gcmVxdWVzdHMuXG4gICAgICogRGVmYXVsdDogYDJgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb25jdXJyZW50RGF0YXNvdXJjZVJlcXVlc3RzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBsb2FkaW5nIGEgYmxvY2suIFVzZWZ1bCB3aGVuIHNjcm9sbGluZyBvdmVyIG1hbnkgcm93cywgc3Bhbm5pbmcgbWFueSBQYXJ0aWFsIFN0b3JlIGJsb2NrcywgYXMgaXQgcHJldmVudHMgYmxvY2tzIGxvYWRpbmcgdW50aWwgc2Nyb2xsaW5nIGhhcyBzZXR0bGVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYmxvY2tMb2FkRGVib3VuY2VNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBjbG9zaW5nIGdyb3VwIHJvd3Mgd2lsbCByZW1vdmUgY2hpbGRyZW4gb2YgdGhhdCByb3cuIE5leHQgdGltZSB0aGUgcm93IGlzIG9wZW5lZCwgY2hpbGQgcm93cyB3aWxsIGJlIHJlYWQgZnJvbSB0aGUgZGF0YXNvdXJjZSBhZ2Fpbi4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHB1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIGBzZXJ2ZXJTaWRlRGF0YXNvdXJjZWAgZm9yIHNlcnZlciBzaWRlIHJvdyBtb2RlbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVEYXRhc291cmNlOiBJU2VydmVyU2lkZURhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgYWx3YXlzIHJlZnJlc2hlcyB0b3AgbGV2ZWwgZ3JvdXBzIHJlZ2FyZGxlc3Mgb2Ygd2hpY2ggY29sdW1uIHdhcyBzb3J0ZWQuIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydGluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBhbHdheXMgcmVmcmVzaGVzIHN0b3JlcyBhZnRlciBmaWx0ZXIgaGFzIGNoYW5nZWQuIFVzZWQgYnkgRnVsbCBTdG9yZSBvbmx5LCB0byBhbGxvdyBTZXJ2ZXItU2lkZSBGaWx0ZXJpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVGaWx0ZXJpbmdBbHdheXNSZXNldHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0VudGVycHJpc2VSZXNldE9uTmV3Q29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gdXNlIHRoZSB2aWV3cG9ydCByb3cgbW9kZWwgeW91IG5lZWQgdG8gcHJvdmlkZSB0aGUgZ3JpZCB3aXRoIGEgYHZpZXdwb3J0RGF0YXNvdXJjZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydERhdGFzb3VyY2U6IElWaWV3cG9ydERhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgdmlld3BvcnQgcm93IG1vZGVsLCBzZXRzIHRoZSBwYWdlIHNpemUgZm9yIHRoZSB2aWV3cG9ydC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxQYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIHZpZXdwb3J0IHJvdyBtb2RlbCwgc2V0cyB0aGUgYnVmZmVyIHNpemUgZm9yIHRoZSB2aWV3cG9ydC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxCdWZmZXJTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIHNob3cgdGhlIGhvcml6b250YWwgc2Nyb2xsYmFyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgdmVydGljYWwgc2Nyb2xsYmFyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93VmVydGljYWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZGVib3VuY2UgdGhlIHZlcnRpY2FsIHNjcm9sbGJhci4gQ2FuIHByb3ZpZGUgc21vb3RoZXIgc2Nyb2xsaW5nIG9uIHNsb3cgbWFjaGluZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlYm91bmNlVmVydGljYWxTY3JvbGxiYXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbmV2ZXIgc2hvdyB0aGUgaG9yaXpvbnRhbCBzY3JvbGwuIFRoaXMgaXMgdXNlZnVsIGlmIHRoZSBncmlkIGlzIGFsaWduZWQgd2l0aCBhbm90aGVyIGdyaWQgYW5kIHdpbGwgc2Nyb2xsIHdoZW4gdGhlIG90aGVyIGdyaWQgc2Nyb2xscy4gKFNob3VsZCBub3QgYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbGAuKSBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzY3JvbGwgdG8gdGhlIHRvcCB3aGVuIG5ldyByb3cgZGF0YSBpcyBwcm92aWRlZC4gVXNlIHRoaXMgaWYgeW91IGRvbid0IHdhbnQgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIG9mIHNjcm9sbGluZyB0byB0aGUgdG9wIGV2ZXJ5IHRpbWUgeW91IGxvYWQgbmV3IGRhdGEuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsT25OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgYWxsb3cgbW91c2V3aGVlbCAvIHRvdWNocGFkIHNjcm9sbCB3aGVuIHBvcHVwIGVsZW1lbnRzIGFyZSBwcmVzZW50LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbFdoZW5Qb3B1cHNBcmVPcGVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgdXNlIGFuaW1hdGlvbiBmcmFtZXMgd2hlbiBkcmF3aW5nIHJvd3Mgd2hpbGUgc2Nyb2xsaW5nLiBVc2UgdGhpcyBpZiB0aGUgZ3JpZCBpcyB3b3JraW5nIGZhc3QgZW5vdWdoIHRoYXQgeW91IGRvbid0IG5lZWQgYW5pbWF0aW9uIGZyYW1lcyBhbmQgeW91IGRvbid0IHdhbnQgdGhlIGdyaWQgdG8gZmxpY2tlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBtaWRkbGUgY2xpY2tzIHdpbGwgcmVzdWx0IGluIGBjbGlja2AgZXZlbnRzIGZvciBjZWxscyBhbmQgcm93cy4gT3RoZXJ3aXNlIHRoZSBicm93c2VyIHdpbGwgdXNlIG1pZGRsZSBjbGljayB0byBzY3JvbGwgdGhlIGdyaWQuPGJyIC8+KipOb3RlOioqIE5vdCBhbGwgYnJvd3NlcnMgZmlyZSBgY2xpY2tgIGV2ZW50cyB3aXRoIHRoZSBtaWRkbGUgYnV0dG9uLiBNb3N0IHdpbGwgZmlyZSBvbmx5IGBtb3VzZWRvd25gIGFuZCBgbW91c2V1cGAgZXZlbnRzLCB3aGljaCBjYW4gYmUgdXNlZCB0byBmb2N1cyBhIGNlbGwsIGJ1dCB3aWxsIG5vdCB3b3JrIHRvIGNhbGwgdGhlIGBvbkNlbGxDbGlja2VkYCBmdW5jdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgbW91c2Ugd2hlZWwgZXZlbnRzIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBicm93c2VyLiBVc2VmdWwgaWYgeW91ciBncmlkIGhhcyBubyB2ZXJ0aWNhbCBzY3JvbGxzIGFuZCB5b3Ugd2FudCB0aGUgbW91c2UgdG8gc2Nyb2xsIHRoZSBicm93c2VyIHBhZ2UuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRlbGwgdGhlIGdyaWQgaG93IHdpZGUgaW4gcGl4ZWxzIHRoZSBzY3JvbGxiYXIgaXMsIHdoaWNoIGlzIHVzZWQgaW4gZ3JpZCB3aWR0aCBjYWxjdWxhdGlvbnMuIFNldCBvbmx5IGlmIHVzaW5nIG5vbi1zdGFuZGFyZCBicm93c2VyLXByb3ZpZGVkIHNjcm9sbGJhcnMsIHNvIHRoZSBncmlkIGNhbiB1c2UgdGhlIG5vbi1zdGFuZGFyZCBzaXplIGluIGl0cyBjYWxjdWxhdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGxiYXJXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUeXBlIG9mIFJvdyBTZWxlY3Rpb246IGBzaW5nbGVgLCBgbXVsdGlwbGVgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U2VsZWN0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgbXVsdGlwbGUgcm93cyB0byBiZSBzZWxlY3RlZCB1c2luZyBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvd3Mgd2lsbCBub3QgYmUgZGVzZWxlY3RlZCBpZiB5b3UgaG9sZCBkb3duIGBDdHJsYCBhbmQgY2xpY2sgdGhlIHJvdyBvciBwcmVzcyBgU3BhY2VgLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvdyBzZWxlY3Rpb24gd29uJ3QgaGFwcGVuIHdoZW4gcm93cyBhcmUgY2xpY2tlZC4gVXNlIHdoZW4geW91IG9ubHkgd2FudCBjaGVja2JveCBzZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFRoaXMgcHJvcGVydHkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIGBzdXBwcmVzc0NlbGxGb2N1c2AgaW5zdGVhZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIGNlbGxzIHdvbid0IGJlIGZvY3VzYWJsZS4gVGhpcyBtZWFucyBrZXlib2FyZCBuYXZpZ2F0aW9uIHdpbGwgYmUgZGlzYWJsZWQgZm9yIGdyaWQgY2VsbHMsIGJ1dCByZW1haW4gZW5hYmxlZCBpbiBvdGhlciBlbGVtZW50cyBvZiB0aGUgZ3JpZCBzdWNoIGFzIGNvbHVtbiBoZWFkZXJzLCBmbG9hdGluZyBmaWx0ZXJzLCB0b29sIHBhbmVscy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgb25seSBhIHNpbmdsZSByYW5nZSBjYW4gYmUgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBiZSBhYmxlIHRvIHNlbGVjdCB0aGUgdGV4dCB3aXRoaW4gY2VsbHMuXG4gICAgICogXG4gICAgICogICAgICoqTm90ZToqKiBXaGVuIHRoaXMgaXMgc2V0IHRvIGB0cnVlYCwgdGhlIGNsaXBib2FyZCBzZXJ2aWNlIGlzIGRpc2FibGVkLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBSYW5nZSBTZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgUmFuZ2UgSGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZUhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIEZpbGwgSGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCd4J2AgdG8gZm9yY2UgdGhlIGZpbGwgaGFuZGxlIGRpcmVjdGlvbiB0byBob3Jpem9udGFsLCBvciBzZXQgdG8gYCd5J2AgdG8gZm9yY2UgdGhlIGZpbGwgaGFuZGxlIGRpcmVjdGlvbiB0byB2ZXJ0aWNhbC4gRGVmYXVsdDogYHh5YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbEhhbmRsZURpcmVjdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gcHJldmVudCBjZWxsIHZhbHVlcyBmcm9tIGJlaW5nIGNsZWFyZWQgd2hlbiB0aGUgUmFuZ2UgU2VsZWN0aW9uIGlzIHJlZHVjZWQgYnkgdGhlIEZpbGwgSGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBkZWZpbmluZyB0aGUgb3JkZXIgaW4gd2hpY2ggc29ydGluZyBvY2N1cnMgKGlmIHNvcnRpbmcgaXMgZW5hYmxlZCkuIFZhbHVlcyBjYW4gYmUgYCdhc2MnYCwgYCdkZXNjJ2Agb3IgYG51bGxgLiBGb3IgZXhhbXBsZTogYHNvcnRpbmdPcmRlcjogWydhc2MnLCAnZGVzYyddYC4gRGVmYXVsdDogYFtudWxsLCAnYXNjJywgJ2Rlc2MnXWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlcjogKCdhc2MnIHwgJ2Rlc2MnIHwgbnVsbClbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzcGVjaWZ5IHRoYXQgdGhlIHNvcnQgc2hvdWxkIHRha2UgYWNjZW50ZWQgY2hhcmFjdGVycyBpbnRvIGFjY291bnQuIElmIHRoaXMgZmVhdHVyZSBpcyB0dXJuZWQgb24gdGhlIHNvcnQgd2lsbCBiZSBzbG93ZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFjY2VudGVkU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzaG93IHRoZSAnbm8gc29ydCcgaWNvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtdWx0aS1zb3J0IHdoZW4gdGhlIHVzZXIgc2hpZnQtY2xpY2tzIGEgY29sdW1uIGhlYWRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ2N0cmwnYCB0byBoYXZlIG11bHRpIHNvcnRpbmcgd29yayB1c2luZyB0aGUgYEN0cmxgIChvciBgQ29tbWFuZCDijJhgIGZvciBNYWMpIGtleS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG11bHRpU29ydEtleTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIHNvcnRpbmcgb2YgdW4tc29ydGVkIGRhdGEgdG8gbWF0Y2ggb3JpZ2luYWwgcm93IGRhdGEuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJY29ucyB0byB1c2UgaW5zaWRlIHRoZSBncmlkIGluc3RlYWQgb2YgdGhlIGdyaWQncyBkZWZhdWx0IGljb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfCBzdHJpbmc7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERlZmF1bHQgcm93IGhlaWdodCBpbiBwaXhlbHMuIERlZmF1bHQ6IGAyNWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgc3R5bGUgcHJvcGVydGllcyB0byBhcHBseSB0byBhbGwgcm93cy4gU2V0IHRvIGFuIG9iamVjdCBvZiBrZXkgKHN0eWxlIG5hbWVzKSBhbmQgdmFsdWVzIChzdHlsZSB2YWx1ZXMpICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTdHlsZTogUm93U3R5bGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENTUyBjbGFzcyhlcykgZm9yIGFsbCByb3dzLiBQcm92aWRlIGVpdGhlciBhIHN0cmluZyAoY2xhc3MgbmFtZSkgb3IgYXJyYXkgb2Ygc3RyaW5ncyAoYXJyYXkgb2YgY2xhc3MgbmFtZXMpLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93Q2xhc3M6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSdWxlcyB3aGljaCBjYW4gYmUgYXBwbGllZCB0byBpbmNsdWRlIGNlcnRhaW4gQ1NTIGNsYXNzZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzc1J1bGVzOiBSb3dDbGFzc1J1bGVzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBoaWdobGlnaHQgcm93cyBieSBhZGRpbmcgdGhlIGBhZy1yb3ctaG92ZXJgIENTUyBjbGFzcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVXNlcyBDU1MgYHRvcGAgaW5zdGVhZCBvZiBDU1MgYHRyYW5zZm9ybWAgZm9yIHBvc2l0aW9uaW5nIHJvd3MuIFVzZWZ1bCBpZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGlzIGNhdXNpbmcgaXNzdWVzIHN1Y2ggYXMgdXNlZCBpbiByb3cgc3Bhbm5pbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VHJhbnNmb3JtOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZ2hsaWdodCBjb2x1bW5zIGJ5IGFkZGluZyB0aGUgYGFnLWNvbHVtbi1ob3ZlcmAgQ1NTIGNsYXNzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YURpc3BsYXlUeXBlOiBUcmVlRGF0YURpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmd1bGFyQ29tcGlsZVJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlRmlsdGVyczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlR3JvdXBFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgY3VzdG9taXNpbmcgdGhlIGNvbnRleHQgbWVudS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENvbnRleHRNZW51SXRlbXM6IEdldENvbnRleHRNZW51SXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgbWFpbiAnY29sdW1uIGhlYWRlcicgbWVudS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldE1haW5NZW51SXRlbXM6IEdldE1haW5NZW51SXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB1c2VyIHRvIHByb2Nlc3MgcG9wdXBzIGFmdGVyIHRoZXkgYXJlIGNyZWF0ZWQuIEFwcGxpY2F0aW9ucyBjYW4gdXNlIHRoaXMgaWYgdGhleSB3YW50IHRvLCBmb3IgZXhhbXBsZSwgcmVwb3NpdGlvbiB0aGUgcG9wdXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0UHJvY2Vzc1BvcHVwOiAoKHBhcmFtczogUG9zdFByb2Nlc3NQb3B1cFBhcmFtcykgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBjZWxscyBmb3IgdGhlIGNsaXBib2FyZC4gSGFuZHkgaWYgZm9yIGV4YW1wbGUgeW91IGhhdmUgYERhdGVgIG9iamVjdHMgdGhhdCBuZWVkIHRvIGhhdmUgYSBwYXJ0aWN1bGFyIGZvcm1hdCBpZiBpbXBvcnRpbmcgaW50byBFeGNlbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRm9yQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXMpID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBoZWFkZXIgdmFsdWVzIGZvciB0aGUgY2xpcGJvYXJkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXMpID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBncm91cCBoZWFkZXIgdmFsdWVzIGZvciB0aGUgY2xpcGJvYXJkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0dyb3VwSGVhZGVyRm9yQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0dyb3VwSGVhZGVyRm9yRXhwb3J0UGFyYW1zKSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgY2VsbHMgZnJvbSB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBudW1iZXIgZmllbGRzLCBhbmQgd2FudCB0byBibG9jayBub24tbnVtYmVycyBmcm9tIGdldHRpbmcgaW50byB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRnJvbUNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zKSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIGdldCB0aGUgZGF0YSB0aGF0IHdvdWxkIG90aGVyd2lzZSBnbyB0byB0aGUgY2xpcGJvYXJkLiBUbyBiZSB1c2VkIHdoZW4geW91IHdhbnQgdG8gY29udHJvbCB0aGUgJ2NvcHkgdG8gY2xpcGJvYXJkJyBvcGVyYXRpb24geW91cnNlbGYuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZW5kVG9DbGlwYm9hcmQ6ICgocGFyYW1zOiBTZW5kVG9DbGlwYm9hcmRQYXJhbXMpID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY29tcGxldGUgY29udHJvbCBvZiB0aGUgcGFzdGUgb3BlcmF0aW9uLCBpbmNsdWRpbmcgY2FuY2VsbGluZyB0aGUgb3BlcmF0aW9uIChzbyBub3RoaW5nIGhhcHBlbnMpIG9yIHJlcGxhY2luZyB0aGUgZGF0YSB3aXRoIG90aGVyIGRhdGEuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzRGF0YUZyb21DbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXMpID0+IHN0cmluZ1tdW10gfCBudWxsKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogR3JpZCBjYWxscyB0aGlzIG1ldGhvZCB0byBrbm93IGlmIGFuIGV4dGVybmFsIGZpbHRlciBpcyBwcmVzZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNFeHRlcm5hbEZpbHRlclByZXNlbnQ6ICgoKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2hvdWxkIHJldHVybiBgdHJ1ZWAgaWYgZXh0ZXJuYWwgZmlsdGVyIHBhc3Nlcywgb3RoZXJ3aXNlIGBmYWxzZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb2VzRXh0ZXJuYWxGaWx0ZXJQYXNzOiAoKG5vZGU6IFJvd05vZGUpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHRvIGN1c3RvbWlzZSB0aGUgY2hhcnQgdG9vbGJhciBpdGVtcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENoYXJ0VG9vbGJhckl0ZW1zOiBHZXRDaGFydFRvb2xiYXJJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gZW5hYmxlIGRpc3BsYXlpbmcgdGhlIGNoYXJ0IGluIGFuIGFsdGVybmF0aXZlIGNoYXJ0IGNvbnRhaW5lci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNyZWF0ZUNoYXJ0Q29udGFpbmVyOiAoKHBhcmFtczogQ2hhcnRSZWYpID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIG5hdmlnYXRpb24gKGFycm93KSBrZXkgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgSGVhZGVyIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgaGVhZGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRIZWFkZXI6ICgocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtcykgPT4gKEhlYWRlclBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRIZWFkZXI6ICgocGFyYW1zOiBUYWJUb05leHRIZWFkZXJQYXJhbXMpID0+IChIZWFkZXJQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBuYXZpZ2F0aW9uIChhcnJvdykga2V5IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBDZWxsIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0Q2VsbDogKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtcykgPT4gKENlbGxQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBgVGFiYCBrZXkgd2hlbiBhIGNlbGwgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IENlbGwgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgbnVsbCB0byBzdGF5IG9uIGN1cnJlbnQgY2VsbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dENlbGw6ICgocGFyYW1zOiBUYWJUb05leHRDZWxsUGFyYW1zKSA9PiAoQ2VsbFBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTdXBwcmVzcyB0aGUgZ3JpZCB0YWtpbmcgYWN0aW9uIGZvciB0aGUgcmVsZXZhbnQga2V5Ym9hcmQgZXZlbnQgd2hlbiBhIGNlbGwgaXMgZm9jdXNlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzS2V5Ym9hcmRFdmVudDogKChwYXJhbXM6IFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgY2FsbGJhY2sgZm9yIGxvY2FsaXNpbmcgdGV4dCB3aXRoaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGVUZXh0RnVuYzogKChrZXk6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBzdHJpbmcsIHZhcmlhYmxlVmFsdWVzPzogc3RyaW5nW10pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHdoYXQgYGRvY3VtZW50YCBpcyB1c2VkLiBDdXJyZW50bHkgdXNlZCBieSBEcmFnIGFuZCBEcm9wIChtYXkgZXh0ZW5kIHRvIG90aGVyIHBsYWNlcyBpbiB0aGUgZnV0dXJlKS4gVXNlIHRoaXMgd2hlbiB5b3Ugd2FudCB0aGUgZ3JpZCB0byB1c2UgYSBkaWZmZXJlbnQgYGRvY3VtZW50YCB0aGFuIHRoZSBvbmUgYXZhaWxhYmxlIG9uIHRoZSBnbG9iYWwgc2NvcGUuIFRoaXMgY2FuIGhhcHBlbiBpZiBkb2NraW5nIG91dCBjb21wb25lbnRzIChzb21ldGhpbmcgd2hpY2ggRWxlY3Ryb24gc3VwcG9ydHMpICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREb2N1bWVudDogKCgpID0+IERvY3VtZW50KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHVzZXIgdG8gZm9ybWF0IHRoZSBudW1iZXJzIGluIHRoZSBwYWdpbmF0aW9uIHBhbmVsLCBpLmUuICdyb3cgY291bnQnIGFuZCAncGFnZSBudW1iZXInIGxhYmVscy4gVGhpcyBpcyBmb3IgcGFnaW5hdGlvbiBwYW5lbCBvbmx5LCB0byBmb3JtYXQgbnVtYmVycyBpbnNpZGUgdGhlIGdyaWQncyBjZWxscyAoaS5lLiB5b3VyIGRhdGEpLCB0aGVuIHVzZSBgdmFsdWVGb3JtYXR0ZXJgIGluIHRoZSBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyOiAoKHBhcmFtczogUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtcykgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgZm9yIGdyb3VwaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dBZ2dOb2RlczogKChub2RlczogUm93Tm9kZVtdKSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiAoQ2xpZW50LXNpZGUgUm93IE1vZGVsIG9ubHkpIEFsbG93cyBncm91cHMgdG8gYmUgb3BlbiBieSBkZWZhdWx0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNHcm91cE9wZW5CeURlZmF1bHQ6ICgocGFyYW1zOiBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBkZWZhdWx0IHNvcnRpbmcgb2YgZ3JvdXBzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwT3JkZXJDb21wYXJhdG9yOiAoKG5vZGVBOiBSb3dOb2RlLCBub2RlQjogUm93Tm9kZSkgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIHBpdm90aW5nLCB0byBhbGxvdyBjaGFuZ2luZyB0aGUgc2Vjb25kIGNvbHVtbiBkZWZpbml0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1NlY29uZGFyeUNvbERlZjogKChjb2xEZWY6IENvbERlZikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBwaXZvdGluZywgdG8gYWxsb3cgY2hhbmdpbmcgdGhlIHNlY29uZCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xHcm91cERlZjogKChjb2xHcm91cERlZjogQ29sR3JvdXBEZWYpID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdoZW4gd29ya2luZyB3aXRoIFRyZWUgRGF0YSB3aGVuIGB0cmVlRGF0YSA9IHRydWVgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGF0YVBhdGg6IEdldERhdGFQYXRoIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBkZWZhdWx0R3JvdXBPcmRlckNvbXBhcmF0b3IgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0R3JvdXBTb3J0Q29tcGFyYXRvcjogKChub2RlQTogUm93Tm9kZSwgbm9kZUI6IFJvd05vZGUpID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzZXR0aW5nIHRoZSBjaGlsZCBjb3VudCBmb3IgYSBncm91cCByb3cuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGlsZENvdW50OiAoKGRhdGFJdGVtOiBhbnkpID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBwcm92aWRpbmcgZGlmZmVyZW50IHBhcmFtcyBmb3IgZGlmZmVyZW50IGxldmVscyBvZiBncm91cGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVTdG9yZVBhcmFtczogKChwYXJhbXM6IEdldFNlcnZlclNpZGVTdG9yZVBhcmFtc1BhcmFtcykgPT4gU2VydmVyU2lkZVN0b3JlUGFyYW1zKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGdyb3VwcyB0byBiZSBvcGVuIGJ5IGRlZmF1bHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHQ6ICgocGFyYW1zOiBJc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY2FuY2VsbGluZyB0cmFuc2FjdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uOiBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTU1JNIFRyZWUgRGF0YTogQWxsb3dzIHNwZWNpZnlpbmcgd2hpY2ggcm93cyBhcmUgZXhwYW5kYWJsZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwOiBJc1NlcnZlclNpZGVHcm91cCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU1NSTSBUcmVlIERhdGE6IEFsbG93cyBzcGVjaWZ5aW5nIGdyb3VwIGtleXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlR3JvdXBLZXk6IEdldFNlcnZlclNpZGVHcm91cEtleSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUmV0dXJuIGEgYnVzaW5lc3Mga2V5IGZvciB0aGUgbm9kZS4gSWYgaW1wbGVtZW50ZWQsIGVhY2ggcm93IGluIHRoZSBET00gd2lsbCBoYXZlIGFuIGF0dHJpYnV0ZSBgcm93LWlkPSdhYmMnYCB3aGVyZSBgYWJjYCBpcyB3aGF0IHlvdSByZXR1cm4gYXMgdGhlIGJ1c2luZXNzIGtleS5cbiAgICAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgYXV0b21hdGVkIHRlc3RpbmcsIGFzIGl0IHByb3ZpZGVzIGEgd2F5IGZvciB5b3VyIHRvb2wgdG8gaWRlbnRpZnkgcm93cyBiYXNlZCBvbiB1bmlxdWUgYnVzaW5lc3Mga2V5cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldEJ1c2luZXNzS2V5Rm9yTm9kZTogKChub2RlOiBSb3dOb2RlKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHNldCB0aGUgSUQgZm9yIGEgcGFydGljdWxhciByb3cgbm9kZSBiYXNlZCBvbiB0aGUgZGF0YS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd05vZGVJZDogR2V0Um93Tm9kZUlkRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIHJvd3MgYWZ0ZXIgdGhleSBhcmUgY3JlYXRlZCwgc28geW91IGNhbiBkbyBmaW5hbCBhZGRpbmcgb2YgY3VzdG9tIGF0dHJpYnV0ZXMgZXRjLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Jvd1Bvc3RDcmVhdGU6ICgocGFyYW1zOiBQcm9jZXNzUm93UGFyYW1zKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggcm93cyBhcmUgc2VsZWN0YWJsZS4gQnkgZGVmYXVsdCByb3dzIGFyZSBzZWxlY3RhYmxlLCBzbyByZXR1cm4gYGZhbHNlYCB0byBtYWtlIGEgcm93IHVuLXNlbGVjdGFibGUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd1NlbGVjdGFibGU6IElzUm93U2VsZWN0YWJsZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIE1hc3RlciBEZXRhaWwgdG8gZGV0ZXJtaW5lIGlmIGEgcm93IHNob3VsZCBiZSBhIG1hc3RlciByb3cuIElmIGBmYWxzZWAgaXMgcmV0dXJuZWQgbm8gZGV0YWlsIHJvdyB3aWxsIGV4aXN0IGZvciB0aGlzIHJvdy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzUm93TWFzdGVyOiBJc1Jvd01hc3RlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gZmlsbCB2YWx1ZXMgaW5zdGVhZCBvZiBzaW1wbHkgY29weWluZyB2YWx1ZXMgb3IgaW5jcmVhc2luZyBudW1iZXIgdmFsdWVzIHVzaW5nIGxpbmVhciBwcm9ncmVzc2lvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbGxPcGVyYXRpb246ICgocGFyYW1zOiBGaWxsT3BlcmF0aW9uUGFyYW1zKSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBwZXJmb3JtIGFkZGl0aW9uYWwgc29ydGluZyBhZnRlciB0aGUgZ3JpZCBoYXMgc29ydGVkIHRoZSByb3dzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnQ6ICgobm9kZXM6IFJvd05vZGVbXSkgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd1N0eWxlYCB0byBzZXQgc3R5bGUgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgQ1NTIHZhbHVlcyBvciB1bmRlZmluZWQgZm9yIG5vIHN0eWxlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd1N0eWxlOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXMpID0+IFJvd1N0eWxlIHwgdW5kZWZpbmVkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdmVyc2lvbiBvZiBwcm9wZXJ0eSBgcm93Q2xhc3NgIHRvIHNldCBjbGFzcyhlcykgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBlaXRoZXIgYSBzdHJpbmcgKGNsYXNzIG5hbWUpLCBhcnJheSBvZiBzdHJpbmdzIChhcnJheSBvZiBjbGFzcyBuYW1lcykgb3IgdW5kZWZpbmVkIGZvciBubyBjbGFzcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0NsYXNzOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXMpID0+IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdmVyc2lvbiBvZiBwcm9wZXJ0eSBgcm93SGVpZ2h0YCB0byBzZXQgaGVpZ2h0IGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYSBwb3NpdGl2ZSBudW1iZXIgb2YgcGl4ZWxzLCBvciByZXR1cm4gYG51bGxgL2B1bmRlZmluZWRgIHRvIHVzZSB0aGUgZGVmYXVsdCByb3cgaGVpZ2h0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SGVpZ2h0OiAoKHBhcmFtczogUm93SGVpZ2h0UGFyYW1zKSA9PiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGVsbHMgdGhlIGdyaWQgaWYgdGhpcyByb3cgc2hvdWxkIGJlIHJlbmRlcmVkIGFzIGZ1bGwgd2lkdGguICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0Z1bGxXaWR0aENlbGw6ICgocm93Tm9kZTogUm93Tm9kZSkgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvKiogVGhlIHRvb2wgcGFuZWwgd2FzIGhpZGRlbiBvciBzaG93bi4gVXNlIGBhcGkuaXNUb29sUGFuZWxTaG93aW5nKClgIHRvIGdldCBzdGF0dXMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbFBhbmVsVmlzaWJsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogUGFzdGUgb3BlcmF0aW9uIGhhcyBzdGFydGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlU3RhcnQ6IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ+KCk7XG4gICAgLyoqIFBhc3RlIG9wZXJhdGlvbiBoYXMgZW5kZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVFbmQ6IEV2ZW50RW1pdHRlcjxQYXN0ZUVuZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudD4oKTtcbiAgICAvKiogQSBjb2x1bW4sIG9yIGdyb3VwIG9mIGNvbHVtbnMsIHdhcyBoaWRkZW4gLyBzaG93bi4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WaXNpYmxlOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PigpO1xuICAgIC8qKiBBIGNvbHVtbiwgb3IgZ3JvdXAgb2YgY29sdW1ucywgd2FzIHBpbm5lZCAvIHVucGlubmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpbm5lZDogRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGlubmVkRXZlbnQ+KCk7XG4gICAgLyoqIEEgY29sdW1uIHdhcyByZXNpemVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJlc2l6ZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5SZXNpemVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5SZXNpemVkRXZlbnQ+KCk7XG4gICAgLyoqIEEgY29sdW1uIHdhcyBtb3ZlZC4gVG8gZmluZCBvdXQgd2hlbiB0aGUgY29sdW1uIG1vdmUgaXMgZmluaXNoZWQgeW91IGNhbiB1c2UgdGhlIGBkcmFnU3RvcHBlZGAgZXZlbnQgYmVsb3cuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uTW92ZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Nb3ZlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudD4oKTtcbiAgICAvKiogQSB2YWx1ZSBjb2x1bW4gd2FzIGFkZGVkIG9yIHJlbW92ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogVGhlIHBpdm90IG1vZGUgZmxhZyB3YXMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdE1vZGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBBIHBpdm90IGNvbHVtbiB3YXMgYWRkZWQsIHJlbW92ZWQgb3Igb3JkZXIgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBBIGNvbHVtbiBncm91cCB3YXMgb3BlbmVkIC8gY2xvc2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkdyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ+KCk7XG4gICAgLyoqIFVzZXIgc2V0IG5ldyBjb2x1bW5zLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIG5ld0NvbHVtbnNMb2FkZWQ6IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGdyaWQgY29sdW1ucyBjaGFuZ2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGRpc3BsYXllZCBjb2x1bW5zIGNoYW5nZWQuIFRoaXMgY2FuIHJlc3VsdCBmcm9tIGNvbHVtbnMgb3BlbiAvIGNsb3NlLCBjb2x1bW4gbW92ZSwgcGl2b3QsIGdyb3VwLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogVGhlIGxpc3Qgb2YgcmVuZGVyZWQgY29sdW1ucyBjaGFuZ2VkIChvbmx5IGNvbHVtbnMgaW4gdGhlIHZpc2libGUgc2Nyb2xsZWQgdmlld3BvcnQgYXJlIHJlbmRlcmVkIGJ5IGRlZmF1bHQpLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFNob3RndW4gLSBnZXRzIGNhbGxlZCB3aGVuIGVpdGhlciBhKSBuZXcgY29sdW1ucyBhcmUgc2V0IG9yIGIpIGBjb2x1bW5BcGkuc2V0U3RhdGUoKWAgaXMgdXNlZCwgc28gZXZlcnl0aGluZyBoYXMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBPbmx5IHVzZWQgYnkgQW5ndWxhciwgUmVhY3QgYW5kIFZ1ZUpTIEFHIEdyaWQgY29tcG9uZW50cyAobm90IHVzZWQgaWYgZG9pbmcgcGxhaW4gSmF2YVNjcmlwdCBvciBBbmd1bGFyIDEueCkuXG4gICAgICogSWYgdGhlIGdyaWQgcmVjZWl2ZXMgY2hhbmdlcyBkdWUgdG8gYm91bmQgcHJvcGVydGllcywgdGhpcyBldmVudCBmaXJlcyBhZnRlciB0aGUgZ3JpZCBoYXMgZmluaXNoZWQgcHJvY2Vzc2luZyB0aGUgY2hhbmdlLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbXBvbmVudFN0YXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFZhbHVlIGhhcyBjaGFuZ2VkIGFmdGVyIGVkaXRpbmcuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogQSBjZWxsJ3MgdmFsdWUgd2l0aGluIGEgcm93IGhhcyBjaGFuZ2VkLiBUaGlzIGV2ZW50IGNvcnJlc3BvbmRzIHRvIEZ1bGwgUm93IEVkaXRpbmcgb25seS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1ZhbHVlQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgY2VsbCBoYXMgc3RhcnRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgY2VsbCBoYXMgc3RvcHBlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdGFydGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RhcnRlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIFRoaXMgZXZlbnQgY29ycmVzcG9uZHMgdG8gRnVsbCBSb3cgRWRpdGluZyBvbmx5LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSByb3cgaGFzIHN0b3BwZWQgKHdoZW4gcm93IGVkaXRpbmcgaXMgZW5hYmxlZCkuIFdoZW4gcm93IGVkaXRpbmcsIHRoaXMgZXZlbnQgd2lsbCBiZSBmaXJlZCBvbmNlIGFuZCBgY2VsbEVkaXRpbmdTdG9wcGVkYCB3aWxsIGJlIGZpcmVkIGZvciBlYWNoIGluZGl2aWR1YWwgY2VsbC4gVGhpcyBldmVudCBjb3JyZXNwb25kcyB0byBGdWxsIFJvdyBFZGl0aW5nIG9ubHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RvcHBlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudD4oKTtcbiAgICAvKiogRmlsdGVyIGhhcyBiZWVuIG9wZW5lZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJPcGVuZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJPcGVuZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck9wZW5lZEV2ZW50PigpO1xuICAgIC8qKiBGaWx0ZXIgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIGFwcGxpZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogRmlsdGVyIHdhcyBtb2RpZmllZCBidXQgbm90IGFwcGxpZWQuIFVzZWQgd2hlbiBmaWx0ZXJzIGhhdmUgJ0FwcGx5JyBidXR0b25zLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck1vZGlmaWVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyTW9kaWZpZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ+KCk7XG4gICAgLyoqIEEgY2hhcnQgaGFzIGJlZW4gY3JlYXRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydENyZWF0ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWQ+KCk7XG4gICAgLyoqIFRoZSBkYXRhIHJhbmdlIGZvciB0aGUgY2hhcnQgaGFzIGJlZW4gY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ+KCk7XG4gICAgLyoqIEZvcm1hdHRpbmcgY2hhbmdlcyBoYXZlIGJlZW4gbWFkZSBieSB1c2VycyB0aHJvdWdoIHRoZSBGb3JtYXQgUGFuZWwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRPcHRpb25zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0T3B0aW9uc0NoYW5nZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGRlc3Ryb3llZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydERlc3Ryb3llZDogRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnREZXN0cm95ZWQ+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5RG93bmAgaGFwcGVuZWQgb24gYSBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5RG93bkV2ZW50IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudD4oKTtcbiAgICAvKiogRE9NIGV2ZW50IGBrZXlQcmVzc2AgaGFwcGVuZWQgb24gYSBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlQcmVzczogRXZlbnRFbWl0dGVyPENlbGxLZXlQcmVzc0V2ZW50IHwgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50PigpO1xuICAgIC8qKiBUaGUgZ3JpZCBoYXMgaW5pdGlhbGlzZWQuIFVzZSB0aGlzIGV2ZW50IGlmLCBmb3IgZXhhbXBsZSwgeW91IG5lZWQgdG8gdXNlIHRoZSBncmlkJ3MgQVBJIHRvIGZpeCB0aGUgY29sdW1ucyB0byBzaXplLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRSZWFkeTogRXZlbnRFbWl0dGVyPEdyaWRSZWFkeUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ+KCk7XG4gICAgLyoqIEZpcmVkIHRoZSBmaXJzdCB0aW1lIGRhdGEgaXMgcmVuZGVyZWQgaW50byB0aGUgZ3JpZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaXJzdERhdGFSZW5kZXJlZDogRXZlbnRFbWl0dGVyPEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaXJzdERhdGFSZW5kZXJlZEV2ZW50PigpO1xuICAgIC8qKiBUaGUgc2l6ZSBvZiB0aGUgZ3JpZCBgZGl2YCBoYXMgY2hhbmdlZC4gSW4gb3RoZXIgd29yZHMsIHRoZSBncmlkIHdhcyByZXNpemVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRTaXplQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEdyaWRTaXplQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIERpc3BsYXllZCByb3dzIGhhdmUgY2hhbmdlZC4gVHJpZ2dlcmVkIGFmdGVyIHNvcnQsIGZpbHRlciBvciB0cmVlIGV4cGFuZCAvIGNvbGxhcHNlIGV2ZW50cy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vZGVsVXBkYXRlZEV2ZW50PigpO1xuICAgIC8qKiBBIHJvdyB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBET00sIGZvciBhbnkgcmVhc29uLiBVc2UgdG8gY2xlYW4gdXAgcmVzb3VyY2VzIChpZiBhbnkpIHVzZWQgYnkgdGhlIHJvdy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsUm93UmVtb3ZlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50PigpO1xuICAgIC8qKiBXaGljaCByb3dzIGFyZSByZW5kZXJlZCBpbiB0aGUgRE9NIGhhcyBjaGFuZ2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpZXdwb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFZpZXdwb3J0Q2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBib2R5IHdhcyBzY3JvbGxlZCBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PigpO1xuICAgIC8qKiBNYWluIGJvZHkgb2YgdGhlIGdyaWQgaGFzIHN0b3BwZWQgc2Nyb2xsaW5nLCBlaXRoZXIgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbEVuZDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudD4oKTtcbiAgICAvKiogV2hlbiBkcmFnZ2luZyBzdGFydHMuIFRoaXMgY291bGQgYmUgYW55IGFjdGlvbiB0aGF0IHVzZXMgdGhlIGdyaWQncyBEcmFnIGFuZCBEcm9wIHNlcnZpY2UsIGUuZy4gQ29sdW1uIE1vdmluZywgQ29sdW1uIFJlc2l6aW5nLCBSYW5nZSBTZWxlY3Rpb24sIEZpbGwgSGFuZGxlLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RhcnRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudD4oKTtcbiAgICAvKiogV2hlbiBkcmFnZ2luZyBzdG9wcy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RvcHBlZDogRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PigpO1xuICAgIC8qKiBUcmlnZ2VyZWQgZXZlcnkgdGltZSB0aGUgcGFnaW5nIHN0YXRlIGNoYW5nZXMuIFNvbWUgb2YgdGhlIG1vc3QgY29tbW9uIHNjZW5hcmlvcyBmb3IgdGhpcyBldmVudCB0byBiZSB0cmlnZ2VyZWQgYXJlOlxuICAgICAqIFxuICAgICAqICAgLSBUaGUgcGFnZSBzaXplIGNoYW5nZXMuXG4gICAgICogICAtIFRoZSBjdXJyZW50IHNob3duIHBhZ2UgaXMgY2hhbmdlZC5cbiAgICAgKiAgIC0gTmV3IGRhdGEgaXMgbG9hZGVkIG9udG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFnaW5hdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogQSBkcmFnIGhhcyBzdGFydGVkLCBvciBkcmFnZ2luZyB3YXMgYWxyZWFkeSBzdGFydGVkIGFuZCB0aGUgbW91c2UgaGFzIHJlLWVudGVyZWQgdGhlIGdyaWQgaGF2aW5nIHByZXZpb3VzbHkgbGVmdCB0aGUgZ3JpZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW50ZXI6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbW92ZWQgd2hpbGUgZHJhZ2dpbmcuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ01vdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbGVmdCB0aGUgZ3JpZCB3aGlsZSBkcmFnZ2luZy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTGVhdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBkcmFnIGhhcyBmaW5pc2hlZCBvdmVyIHRoZSBncmlkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbmQ6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgLyoqIEEgcm93IGdyb3VwIGNvbHVtbiB3YXMgYWRkZWQgb3IgcmVtb3ZlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBBIHJvdyBncm91cCB3YXMgb3BlbmVkIG9yIGNsb3NlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dHcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PigpO1xuICAgIC8qKiBGaXJlZCB3aGVuIGNhbGxpbmcgZWl0aGVyIG9mIHRoZSBBUEkgbWV0aG9kcyBgZXhwYW5kQWxsKClgIG9yIGBjb2xsYXBzZUFsbCgpYC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBleHBhbmRPckNvbGxhcHNlQWxsOiBFdmVudEVtaXR0ZXI8RXhwYW5kQ29sbGFwc2VBbGxFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBjbGllbnQgaGFzIHNldCBuZXcgcGlubmVkIHJvdyBkYXRhIGludG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGlubmVkUm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogVGhlIGNsaWVudCBoYXMgc2V0IG5ldyBkYXRhIGludG8gdGhlIGdyaWQgdXNpbmcgYGFwaS5zZXRSb3dEYXRhKClgIG9yIGJ5IGNoYW5naW5nIHRoZSBgcm93RGF0YWAgYm91bmQgcHJvcGVydHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YUNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogVGhlIGNsaWVudCBoYXMgdXBkYXRlZCBkYXRhIGZvciB0aGUgZ3JpZCB1c2luZyBgYXBpLmFwcGx5VHJhbnNhY3Rpb24odHJhbnNhY3Rpb24pYCBvciBieSBjaGFuZ2luZyB0aGUgYHJvd0RhdGFgIGJvdW5kIHByb3BlcnR5IHdpdGggYGltbXV0YWJsZURhdGE9dHJ1ZWAuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhVXBkYXRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudD4oKTtcbiAgICAvKiogQXN5bmMgdHJhbnNhY3Rpb25zIGhhdmUgYmVlbiBhcHBsaWVkLiBDb250YWlucyBhIGxpc3Qgb2YgYWxsIHRyYW5zYWN0aW9uIHJlc3VsdHMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkOiBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPiA9IG5ldyBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPigpO1xuICAgIC8qKiBDZWxsIGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsQ2xpY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudD4oKTtcbiAgICAvKiogQ2VsbCBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PigpO1xuICAgIC8qKiBDZWxsIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEZvY3VzZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRm9jdXNlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudD4oKTtcbiAgICAvKiogTW91c2UgZW50ZXJlZCBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU92ZXI6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ+KCk7XG4gICAgLyoqIE1vdXNlIGxlZnQgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdXQ6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZU91dEV2ZW50PigpO1xuICAgIC8qKiBNb3VzZSBkb3duIG9uIGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlRG93bjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudD4oKTtcbiAgICAvKiogUm93IGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93Q2xpY2tlZDogRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudD4oKTtcbiAgICAvKiogUm93IGlzIGRvdWJsZSBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ+KCk7XG4gICAgLyoqIFJvdyBpcyBzZWxlY3RlZCBvciBkZXNlbGVjdGVkLiBUaGUgZXZlbnQgY29udGFpbnMgdGhlIG5vZGUgaW4gcXVlc3Rpb24sIHNvIGNhbGwgdGhlIG5vZGUncyBgaXNTZWxlY3RlZCgpYCBtZXRob2QgdG8gc2VlIGlmIGl0IHdhcyBqdXN0IHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93U2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudD4oKTtcbiAgICAvKiogUm93IHNlbGVjdGlvbiBpcyBjaGFuZ2VkLiBVc2UgdGhlIGdyaWQgQVBJIGBnZXRTZWxlY3RlZE5vZGVzKClgIHRvIGdldCB0aGUgbmV3IGxpc3Qgb2Ygc2VsZWN0ZWQgbm9kZXMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogQ2VsbCBpcyByaWdodCBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDb250ZXh0TWVudTogRXZlbnRFbWl0dGVyPENlbGxDb250ZXh0TWVudUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ+KCk7XG4gICAgLyoqIEEgY2hhbmdlIHRvIHJhbmdlIHNlbGVjdGlvbiBoYXMgb2NjdXJyZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogU29ydCBoYXMgY2hhbmdlZC4gVGhlIGdyaWQgYWxzbyBsaXN0ZW5zIGZvciB0aGlzIGFuZCB1cGRhdGVzIHRoZSBtb2RlbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudD4oKTtcblxuXG4gICAgLy8gRW5hYmxlIHR5cGUgY29lcmNpb24gZm9yIGJvb2xlYW4gSW5wdXRzIHRvIHN1cHBvcnQgdXNlIGxpa2UgJ2VuYWJsZUNoYXJ0cycgaW5zdGVhZCBvZiBmb3JjaW5nICdbZW5hYmxlQ2hhcnRzXT1cInRydWVcIicgXG4gICAgLy8gaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3RlbXBsYXRlLXR5cGVjaGVjayNpbnB1dC1zZXR0ZXItY29lcmNpb24gXG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDZWxsRm9jdXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVidWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbmd1bGFyQ29tcGlsZVJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FuZ3VsYXJDb21waWxlRmlsdGVyczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEluY2x1ZGVGb290ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwSW5jbHVkZVRvdGFsRm9vdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFVzZUVudGlyZVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91blNvcnRJY29uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc05vUm93c092ZXJsYXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWx0YVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVtZW1iZXJHcm91cFN0YXRlV2hlbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlHcm91cEhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3RNb2RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FuaW1hdGVSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUnRsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnTXVsdGlSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUdyb3VwRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZXByZWNhdGVkRW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwTXVsdGlBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5HcmlkTG9zZXNGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3B1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlbHRhUm93RGF0YU1vZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Vuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90cmVlRGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0VudGVycHJpc2VSZXNldE9uTmV3Q29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0aW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1NldENvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDaGFydHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlbHRhQ29sdW1uTW9kZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9leGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Rvb2x0aXBNb3VzZVRyYWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9rZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2ltbXV0YWJsZURhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2ltbXV0YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXBwbHlDb2x1bW5EZWZPcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGV0YWlsUm93QXV0b0hlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUZpbHRlcmluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Nob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVhY3RVaTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSZWFjdFVpOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIC8vIEBFTkRAXG59XG5cbiJdfQ==