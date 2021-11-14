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
        /** Set to `true` to have tooltips follow the cursor once they are displayed. Default: `false`     */
        this.tooltipMouseTrack = undefined;
        /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).     */
        this.popupParent = undefined;
        /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
        this.copyHeadersToClipboard = undefined;
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
        /** A map of component names to plain JavaScript components.     */
        this.components = undefined;
        /** A map of component names to framework (Angular, React, Vue etc.) components.     */
        this.frameworkComponents = undefined;
        /** Set to true to enable the experimental React UI. Works with React framework only.     */
        this.reactUi = undefined;
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
        /** @deprecated Use floatingFilter on the colDef instead
         */
        this.floatingFilter = undefined;
        /** @deprecated     */
        this.enableOldSetFilterModel = undefined;
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
        /** Framework `cellRenderer` to use when data is loading via a DataSource.     */
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
        /** Same as `loadingOverlayComponent` but for a framework component.     */
        this.loadingOverlayComponentFramework = undefined;
        /** Customise the parameters provided to the loading overlay component.     */
        this.loadingOverlayComponentParams = undefined;
        /** Disables the 'loading' overlay. Default: `false`     */
        this.suppressLoadingOverlay = undefined;
        /** Provide a template for 'no rows' overlay.     */
        this.overlayNoRowsTemplate = undefined;
        /** Provide a custom no rows overlay component     */
        this.noRowsOverlayComponent = undefined;
        /** Same as `noRowsOverlayComponent` but for a framework component.     */
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
        /** Same as `groupRowRenderer` but for a framework component.     */
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
        /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.     */
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
        /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on older browsers, e.g. Internet Explorer. Default: `false`     */
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
        /** If `true`, cells won't be selectable. This means cells will not get keyboard focus when you click on them. Default: `false`     */
        this.suppressCellSelection = undefined;
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
], AgGridAngular.prototype, "floatingFilter", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], AgGridAngular.prototype, "enableOldSetFilterModel", void 0);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BhZy1ncmlkLWNvbW11bml0eS9hbmd1bGFyLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCxhQUFhLEVBQ2IsU0FBUyxFQUNULHdCQUF3QixFQUN4QixlQUFlLEVBQ2YsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLFNBQVMsRUFDVCxnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFHSCxhQUFhLEVBQ2IsSUFBSSxFQUtKLFNBQVMsRUErSFosTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN4RSxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFZMUQsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYTtJQWtCdEIsWUFBWSxVQUFzQixFQUN0QixnQkFBa0MsRUFDbEMseUJBQW9ELEVBQ3BELHlCQUEyRCxFQUMzRCx3QkFBa0Q7UUFIbEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBa0M7UUFDM0QsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQWxCdEQsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFDckIsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUkzQiwwREFBMEQ7UUFDbEQsZ0JBQVcsR0FBdUIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQWlIbEUsVUFBVTtRQUNWLHdFQUF3RTtRQUN4RCxjQUFT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QU0sRUFBRTs4QkFBa0MsWUFBWTsrREFBb0Y7QUFDakk7SUFBVCxNQUFNLEVBQUU7OEJBQWtDLFlBQVk7K0RBQW9GO0FBQ2pJO0lBQVQsTUFBTSxFQUFFOzhCQUFvQyxZQUFZO2lFQUF3RjtBQTkyQnhJLGFBQWE7SUFWekIsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGlCQUFpQjtRQUMzQixRQUFRLEVBQUUsRUFBRTtRQUNaLFNBQVMsRUFBRTtZQUNQLHlCQUF5QjtZQUN6QixnQ0FBZ0M7U0FDbkM7UUFDRCw2RUFBNkU7UUFDN0UsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7S0FDeEMsQ0FBQztxQ0FtQjBCLFVBQVU7UUFDSixnQkFBZ0I7UUFDUCx5QkFBeUI7UUFDekIsZ0NBQWdDO1FBQ2pDLHdCQUF3QjtHQXRCckQsYUFBYSxDQTAvQnpCO1NBMS9CWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZnRlclZpZXdJbml0LFxuICAgIENvbXBvbmVudCxcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgQ29udGVudENoaWxkcmVuLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIElucHV0LFxuICAgIE91dHB1dCxcbiAgICBRdWVyeUxpc3QsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQge1xuICAgIENvbERlZixcbiAgICBDb2x1bW5BcGksXG4gICAgQ29tcG9uZW50VXRpbCxcbiAgICBHcmlkLFxuICAgIEdyaWRBcGksXG4gICAgR3JpZE9wdGlvbnMsXG4gICAgR3JpZFBhcmFtcyxcbiAgICBNb2R1bGUsXG4gICAgQWdQcm9taXNlLFxuICAgIENvbEdyb3VwRGVmLFxuICAgIEV4Y2VsU3R5bGUsXG4gICAgSURhdGFzb3VyY2UsXG4gICAgSVNlcnZlclNpZGVEYXRhc291cmNlLFxuICAgIElWaWV3cG9ydERhdGFzb3VyY2UsXG4gICAgSUFnZ0Z1bmMsXG4gICAgQ3N2RXhwb3J0UGFyYW1zLFxuICAgIEV4Y2VsRXhwb3J0UGFyYW1zLFxuICAgIFN0YXR1c1BhbmVsRGVmLFxuICAgIFNpZGVCYXJEZWYsXG4gICAgQWdDaGFydFRoZW1lT3ZlcnJpZGVzLFxuICAgIEFnQ2hhcnRUaGVtZSxcbiAgICBTZXJ2ZXJTaWRlU3RvcmVUeXBlLFxuICAgIFJvd0dyb3VwaW5nRGlzcGxheVR5cGUsXG4gICAgSUNlbGxSZW5kZXJlckNvbXAsXG4gICAgSUNlbGxSZW5kZXJlckZ1bmMsXG4gICAgR2V0Q29udGV4dE1lbnVJdGVtcyxcbiAgICBHZXRNYWluTWVudUl0ZW1zLFxuICAgIEdldFJvd05vZGVJZEZ1bmMsXG4gICAgTmF2aWdhdGVUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgSGVhZGVyUG9zaXRpb24sXG4gICAgVGFiVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBDZWxsUG9zaXRpb24sXG4gICAgVGFiVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zLFxuICAgIEdldERhdGFQYXRoLFxuICAgIElDZWxsUmVuZGVyZXIsXG4gICAgSUxvYWRpbmdPdmVybGF5Q29tcCxcbiAgICBJTm9Sb3dzT3ZlcmxheUNvbXAsXG4gICAgUm93Tm9kZSxcbiAgICBJc1Jvd01hc3RlcixcbiAgICBJc1Jvd1NlbGVjdGFibGUsXG4gICAgUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtcyxcbiAgICBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXMsXG4gICAgR2V0U2VydmVyU2lkZUdyb3VwS2V5LFxuICAgIElzU2VydmVyU2lkZUdyb3VwLFxuICAgIFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcyxcbiAgICBDaGFydFJlZixcbiAgICBHZXRDaGFydFRvb2xiYXJJdGVtcyxcbiAgICBGaWxsT3BlcmF0aW9uUGFyYW1zLFxuICAgIElzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb24sXG4gICAgR2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zUGFyYW1zLFxuICAgIFNlcnZlclNpZGVTdG9yZVBhcmFtcyxcbiAgICBJc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMsXG4gICAgSXNHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMsXG4gICAgQ29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudCxcbiAgICBOZXdDb2x1bW5zTG9hZGVkRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50LFxuICAgIEV4cGFuZENvbGxhcHNlQWxsRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQsXG4gICAgR3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uTW92ZWRFdmVudCxcbiAgICBDb2x1bW5WaXNpYmxlRXZlbnQsXG4gICAgQ29sdW1uUGlubmVkRXZlbnQsXG4gICAgQ29sdW1uR3JvdXBPcGVuZWRFdmVudCxcbiAgICBDb2x1bW5SZXNpemVkRXZlbnQsXG4gICAgRGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQsXG4gICAgUm93R3JvdXBPcGVuZWRFdmVudCxcbiAgICBSb3dEYXRhQ2hhbmdlZEV2ZW50LFxuICAgIFJvd0RhdGFVcGRhdGVkRXZlbnQsXG4gICAgUGlubmVkUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDaGFydENyZWF0ZWQsXG4gICAgQ2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQsXG4gICAgQ2hhcnRPcHRpb25zQ2hhbmdlZCxcbiAgICBDaGFydERlc3Ryb3llZCxcbiAgICBUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50LFxuICAgIE1vZGVsVXBkYXRlZEV2ZW50LFxuICAgIFBhc3RlU3RhcnRFdmVudCxcbiAgICBQYXN0ZUVuZEV2ZW50LFxuICAgIENlbGxDbGlja2VkRXZlbnQsXG4gICAgQ2VsbERvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBDZWxsTW91c2VEb3duRXZlbnQsXG4gICAgQ2VsbENvbnRleHRNZW51RXZlbnQsXG4gICAgQ2VsbFZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIFJvd1ZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENlbGxGb2N1c2VkRXZlbnQsXG4gICAgUm93U2VsZWN0ZWRFdmVudCxcbiAgICBTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgQ2VsbEtleURvd25FdmVudCxcbiAgICBDZWxsS2V5UHJlc3NFdmVudCxcbiAgICBDZWxsTW91c2VPdmVyRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3V0RXZlbnQsXG4gICAgRmlsdGVyQ2hhbmdlZEV2ZW50LFxuICAgIEZpbHRlck1vZGlmaWVkRXZlbnQsXG4gICAgRmlsdGVyT3BlbmVkRXZlbnQsXG4gICAgU29ydENoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50LFxuICAgIFJvd0NsaWNrZWRFdmVudCxcbiAgICBSb3dEb3VibGVDbGlja2VkRXZlbnQsXG4gICAgR3JpZFJlYWR5RXZlbnQsXG4gICAgR3JpZFNpemVDaGFuZ2VkRXZlbnQsXG4gICAgVmlld3BvcnRDaGFuZ2VkRXZlbnQsXG4gICAgRmlyc3REYXRhUmVuZGVyZWRFdmVudCxcbiAgICBEcmFnU3RhcnRlZEV2ZW50LFxuICAgIERyYWdTdG9wcGVkRXZlbnQsXG4gICAgUm93RWRpdGluZ1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIEJvZHlTY3JvbGxFdmVudCxcbiAgICBCb2R5U2Nyb2xsRW5kRXZlbnQsXG4gICAgUGFnaW5hdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudCxcbiAgICBSb3dEcmFnRXZlbnQsXG4gICAgQ29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBQcm9jZXNzUm93UGFyYW1zLFxuICAgIFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUm93U3R5bGUsXG4gICAgUm93Q2xhc3NSdWxlcyxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dIZWlnaHRQYXJhbXMsXG4gICAgU2VuZFRvQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFRyZWVEYXRhRGlzcGxheVR5cGUsXG4gICAgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudCxcbiAgICBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudCxcbiAgICBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jXG59IGZyb20gXCJAYWctZ3JpZC1jb21tdW5pdHkvY29yZVwiO1xuXG5pbXBvcnQgeyBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzIH0gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya092ZXJyaWRlc1wiO1xuaW1wb3J0IHsgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIgfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclwiO1xuaW1wb3J0IHsgQWdHcmlkQ29sdW1uIH0gZnJvbSBcIi4vYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50XCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgXSxcbiAgICAvLyB0ZWxsIGFuZ3VsYXIgd2UgZG9uJ3Qgd2FudCB2aWV3IGVuY2Fwc3VsYXRpb24sIHdlIGRvbid0IHdhbnQgYSBzaGFkb3cgcm9vdFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIC8vIG5vdCBpbnRlbmRlZCBmb3IgdXNlciB0byBpbnRlcmFjdCB3aXRoLiBzbyBwdXR0aW5nIF8gaW4gc28gaWYgdXNlciBnZXRzIHJlZmVyZW5jZVxuICAgIC8vIHRvIHRoaXMgb2JqZWN0LCB0aGV5IGtpbmQnYSBrbm93IGl0J3Mgbm90IHBhcnQgb2YgdGhlIGFncmVlZCBpbnRlcmZhY2VcbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgZ3JpZFBhcmFtczogR3JpZFBhcmFtcztcblxuICAgIC8vIGluIG9yZGVyIHRvIGVuc3VyZSBmaXJpbmcgb2YgZ3JpZFJlYWR5IGlzIGRldGVybWluaXN0aWNcbiAgICBwcml2YXRlIF9mdWxseVJlYWR5OiBBZ1Byb21pc2U8Ym9vbGVhbj4gPSBBZ1Byb21pc2UucmVzb2x2ZSh0cnVlKTtcblxuICAgIC8vIG1ha2luZyB0aGVzZSBwdWJsaWMsIHNvIHRoZXkgYXJlIGFjY2Vzc2libGUgdG8gcGVvcGxlIHVzaW5nIHRoZSBuZzIgY29tcG9uZW50IHJlZmVyZW5jZXNcbiAgICBwdWJsaWMgYXBpOiBHcmlkQXBpO1xuICAgIHB1YmxpYyBjb2x1bW5BcGk6IENvbHVtbkFwaTtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oQWdHcmlkQ29sdW1uKSBwdWJsaWMgY29sdW1uczogUXVlcnlMaXN0PEFnR3JpZENvbHVtbj47XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgYW5ndWxhckZyYW1ld29ya092ZXJyaWRlczogQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcixcbiAgICAgICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Vmlld0NvbnRhaW5lclJlZih0aGlzLnZpZXdDb250YWluZXJSZWYpO1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyKHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnNldEVtaXR0ZXJVc2VkQ2FsbGJhY2sodGhpcy5pc0VtaXR0ZXJVc2VkLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSBDb21wb25lbnRVdGlsLmNvcHlBdHRyaWJ1dGVzVG9HcmlkT3B0aW9ucyh0aGlzLmdyaWRPcHRpb25zLCB0aGlzLCB0cnVlKTtcblxuICAgICAgICB0aGlzLmdyaWRQYXJhbXMgPSB7XG4gICAgICAgICAgICBnbG9iYWxFdmVudExpc3RlbmVyOiB0aGlzLmdsb2JhbEV2ZW50TGlzdGVuZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIGZyYW1ld29ya092ZXJyaWRlczogdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgcHJvdmlkZWRCZWFuSW5zdGFuY2VzOiB7XG4gICAgICAgICAgICAgICAgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kdWxlczogKHRoaXMubW9kdWxlcyB8fCBbXSkgYXMgYW55XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuY29sdW1ucyAmJiB0aGlzLmNvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5EZWZzID0gdGhpcy5jb2x1bW5zXG4gICAgICAgICAgICAgICAgLm1hcCgoY29sdW1uOiBBZ0dyaWRDb2x1bW4pOiBDb2xEZWYgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sdW1uLnRvQ29sRGVmKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXcgR3JpZCh0aGlzLl9uYXRpdmVFbGVtZW50LCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmdyaWRQYXJhbXMpO1xuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmFwaSkge1xuICAgICAgICAgICAgdGhpcy5hcGkgPSB0aGlzLmdyaWRPcHRpb25zLmFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaSkge1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5BcGkgPSB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkFwaTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBzb21ldGltZXMsIGVzcGVjaWFsbHkgaW4gbGFyZ2UgY2xpZW50IGFwcHMgZ3JpZFJlYWR5IGNhbiBmaXJlIGJlZm9yZSBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhpcyB0aWVzIHRoZXNlIHRvZ2V0aGVyIHNvIHRoYXQgZ3JpZFJlYWR5IHdpbGwgYWx3YXlzIGZpcmUgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGUgYWN0dWFsIGNvbnRhaW5pbmcgY29tcG9uZW50J3MgbmdBZnRlclZpZXdJbml0IHdpbGwgZmlyZSBqdXN0IGFmdGVyIGFnR3JpZEFuZ3VsYXInc1xuICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnJlc29sdmVOb3cobnVsbCwgcmVzb2x2ZSA9PiByZXNvbHZlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgQ29tcG9uZW50VXRpbC5wcm9jZXNzT25DaGFuZ2UoY2hhbmdlcywgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5hcGksIHRoaXMuY29sdW1uQXBpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIHRoZSBkZXN0cm95LCBzbyB3ZSBrbm93IG5vdCB0byBlbWl0IGFueSBldmVudHNcbiAgICAgICAgICAgIC8vIHdoaWxlIHRlYXJpbmcgZG93biB0aGUgZ3JpZC5cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5hcGkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwaS5kZXN0cm95KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSdsbCBlbWl0IHRoZSBlbWl0IGlmIGEgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGEgZ2l2ZW4gZXZlbnQgZWl0aGVyIG9uIHRoZSBjb21wb25lbnQgdmlhIG5vcm1hbCBhbmd1bGFyIGJpbmRpbmdcbiAgICAvLyBvciB2aWEgZ3JpZE9wdGlvbnNcbiAgICBwcm90ZWN0ZWQgaXNFbWl0dGVyVXNlZChldmVudFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGNvbnN0IGhhc0VtaXR0ZXIgPSAhIWVtaXR0ZXIgJiYgZW1pdHRlci5vYnNlcnZlcnMgJiYgZW1pdHRlci5vYnNlcnZlcnMubGVuZ3RoID4gMDtcblxuICAgICAgICAvLyBncmlkUmVhZHkgPT4gb25HcmlkUmVhZHlcbiAgICAgICAgY29uc3QgYXNFdmVudE5hbWUgPSBgb24ke2V2ZW50VHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKX0ke2V2ZW50VHlwZS5zdWJzdHJpbmcoMSl9YFxuICAgICAgICBjb25zdCBoYXNHcmlkT3B0aW9uTGlzdGVuZXIgPSAhIXRoaXMuZ3JpZE9wdGlvbnMgJiYgISF0aGlzLmdyaWRPcHRpb25zW2FzRXZlbnROYW1lXTtcblxuICAgICAgICByZXR1cm4gaGFzRW1pdHRlciB8fCBoYXNHcmlkT3B0aW9uTGlzdGVuZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSB0ZWFyaW5nIGRvd24sIGRvbid0IGVtaXQgYW5ndWxhciBldmVudHMsIGFzIHRoaXMgY2F1c2VzXG4gICAgICAgIC8vIHByb2JsZW1zIHdpdGggdGhlIGFuZ3VsYXIgcm91dGVyXG4gICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdlbmVyaWNhbGx5IGxvb2sgdXAgdGhlIGV2ZW50VHlwZVxuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGlmIChlbWl0dGVyICYmIHRoaXMuaXNFbWl0dGVyVXNlZChldmVudFR5cGUpKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09PSAnZ3JpZFJlYWR5Jykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgZ3JpZFJlYWR5LCB3YWl0IGZvciBuZ0FmdGVyVmlld0luaXQgdG8gZmlyZSBmaXJzdCwgdGhlbiBlbWl0IHRoZVxuICAgICAgICAgICAgICAgIC8vIGdyaWRSZWFkeSBldmVudFxuICAgICAgICAgICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkudGhlbigocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb25zO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtb2R1bGVzOiBNb2R1bGVbXTtcblxuICAgIC8vIEBTVEFSVEBcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBzdGF0dXMgYmFyIGNvbXBvbmVudHMgdG8gdXNlIGluIHRoZSBzdGF0dXMgYmFyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3RhdHVzQmFyOiB7IHN0YXR1c1BhbmVsczogU3RhdHVzUGFuZWxEZWZbXTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBzaWRlIGJhciBjb21wb25lbnRzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2lkZUJhcjogU2lkZUJhckRlZiB8IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzaG93IHRoZSBjb250ZXh0IG1lbnUuIFVzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgJ3JpZ2h0IGNsaWNrJyBjb250ZXh0IG1lbnUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgYHN1cHByZXNzQ29udGV4dE1lbnVgLCB5b3UgY2FuIHVzZSB0aGUgYG9uQ2VsbENvbnRleHRNZW51YCBmdW5jdGlvbiB0byBwcm92aWRlIHlvdXIgb3duIGNvZGUgdG8gaGFuZGxlIGNlbGwgYGNvbnRleHRtZW51YCBldmVudHMuXG4gICAgICogVGhpcyBmbGFnIGlzIHVzZWZ1bCB0byBwcmV2ZW50IHRoZSBicm93c2VyIGZyb20gc2hvd2luZyBpdHMgZGVmYXVsdCBjb250ZXh0IG1lbnUuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY29udGV4dCBtZW51IHRvIHNob3csIGV2ZW4gd2hlbiBgQ3RybGAga2V5IGlzIGhlbGQgZG93bi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSBjb2x1bW4gbWVudSBidXR0b24sIHJhdGhlciB0aGFuIG9ubHkgc2hvd2luZyB3aGVuIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHVzZSB0aGUgYnJvd3NlcidzIGRlZmF1bHQgdG9vbHRpcCBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBncmlkJ3MgVG9vbHRpcCBDb21wb25lbnQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyB0aGF0IGl0IHRha2VzIGZvciB0b29sdGlwcyB0byBzaG93IHVwIG9uY2UgYW4gZWxlbWVudCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgLlxuICAgICAqIERlZmF1bHQ6IGAyMDAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFNob3dEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdG9vbHRpcHMgZm9sbG93IHRoZSBjdXJzb3Igb25jZSB0aGV5IGFyZSBkaXNwbGF5ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBNb3VzZVRyYWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBET00gZWxlbWVudCB0byB1c2UgYXMgdGhlIHBvcHVwIHBhcmVudCBmb3IgZ3JpZCBwb3B1cHMgKGNvbnRleHQgbWVudSwgY29sdW1uIG1lbnUgZXRjKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvcHVwUGFyZW50OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5SGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZ5IHRoZSBkZWxpbWluYXRvciB0byB1c2Ugd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNsaXBib2FyZERlbGltaW5hdG9yOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gb25seSBoYXZlIHRoZSByYW5nZSBzZWxlY3Rpb24sIGFuZCBub3Qgcm93IHNlbGVjdGlvbiwgY29waWVkIHRvIGNsaXBib2FyZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHdvcmsgYXJvdW5kIGEgYnVnIHdpdGggRXhjZWwgKFdpbmRvd3MpIHRoYXQgYWRkcyBhbiBleHRyYSBlbXB0eSBsaW5lIGF0IHRoZSBlbmQgb2YgcmFuZ2VzIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xhc3RFbXB0eUxpbmVPblBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb2ZmIHBhc3RlIG9wZXJhdGlvbnMgd2l0aGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdG9wIHRoZSBncmlkIHRyeWluZyB0byB1c2UgdGhlIENsaXBib2FyZCBBUEksIGlmIGl0IGlzIGJsb2NrZWQsIGFuZCBpbW1lZGlhdGVseSBmYWxsYmFjayB0byB0aGUgd29ya2Fyb3VuZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkQXBpOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBvZiBDb2x1bW4gLyBDb2x1bW4gR3JvdXAgZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5EZWZzOiAoQ29sRGVmIHwgQ29sR3JvdXBEZWYpW10gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29sdW1uIGRlZmluaXRpb24uIEl0ZW1zIGRlZmluZWQgaW4gdGhlIGFjdHVhbCBjb2x1bW4gZGVmaW5pdGlvbnMgZ2V0IHByZWNlZGVuY2UuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sRGVmOiBDb2xEZWYgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbi4gQWxsIGNvbHVtbiBncm91cCBkZWZpbml0aW9ucyB3aWxsIHVzZSB0aGVzZSBwcm9wZXJ0aWVzLiBJdGVtcyBkZWZpbmVkIGluIHRoZSBhY3R1YWwgY29sdW1uIGdyb3VwIGRlZmluaXRpb24gZ2V0IHByZWNlZGVuY2UuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sR3JvdXBEZWY6IFBhcnRpYWw8Q29sR3JvdXBEZWY+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3QgbWFwIG9mIGN1c3RvbSBjb2x1bW4gdHlwZXMgd2hpY2ggY29udGFpbiBncm91cHMgb2YgcHJvcGVydGllcyB0aGF0IGNvbHVtbiBkZWZpbml0aW9ucyBjYW4gaW5oZXJpdCBieSByZWZlcmVuY2luZyBpbiB0aGVpciBgdHlwZWAgcHJvcGVydHkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5UeXBlczogeyBba2V5OiBzdHJpbmddOiBDb2xEZWY7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEtlZXBzIHRoZSBvcmRlciBvZiBDb2x1bW5zIG1haW50YWluZWQgYWZ0ZXIgbmV3IENvbHVtbiBEZWZpbml0aW9ucyBhcmUgdXBkYXRlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGVuIGRvdHMgaW4gZmllbGQgbmFtZXMgKGUuZy4gYGFkZHJlc3MuZmlyc3RsaW5lYCkgYXJlIG5vdCB0cmVhdGVkIGFzIGRlZXAgcmVmZXJlbmNlcy4gQWxsb3dzIHlvdSB0byB1c2UgZG90cyBpbiB5b3VyIGZpZWxkIG5hbWUgaWYgeW91IHByZWZlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWVsZERvdE5vdGF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFDb2x1bW5Nb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXBwbHlDb2x1bW5EZWZPcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGltbXV0YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NldENvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5TdGF0ZUV2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgU2V0IHZpYSBgZGVmYXVsdENvbERlZi53aWR0aGBcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgU2V0IHZpYSBgZGVmYXVsdENvbERlZi5taW5XaWR0aGBcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWluQ29sV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgU2V0IHZpYSBgZGVmYXVsdENvbERlZi5tYXhXaWR0aGBcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29sV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgY29sdW1uIGxhYmVsIGhlYWRlci4gRGVmYXVsdDogYDI1YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93cyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgZmxvYXRpbmcgZmlsdGVycy4gRGVmYXVsdDogYDIwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGNvbHVtbnMgd2hlbiBpbiBwaXZvdCBtb2RlLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyBoZWFkZXIgY29sdW1uIGdyb3VwcyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGdyb3VwSGVhZGVySGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90R3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3cgcmVvcmRlcmluZyBhbmQgcGlubmluZyBjb2x1bW5zIGJ5IGRyYWdnaW5nIGNvbHVtbnMgZnJvbSB0aGUgQ29sdW1ucyBUb29sIFBhbmVsIHRvIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0RyYWdGcm9tQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBjb2x1bW4gbW92aW5nLCBpLmUuIHRvIG1ha2UgdGhlIGNvbHVtbnMgZml4ZWQgcG9zaXRpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGBhZy1jb2x1bW4tbW92aW5nYCBjbGFzcyBpcyBub3QgYWRkZWQgdG8gdGhlIGdyaWQgd2hpbGUgY29sdW1ucyBhcmUgbW92aW5nLiBJbiB0aGUgZGVmYXVsdCB0aGVtZXMsIHRoaXMgcmVzdWx0cyBpbiBubyBhbmltYXRpb24gd2hlbiBtb3ZpbmcgY29sdW1ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHdoZW4geW91IGRyYWcgYSBjb2x1bW4gb3V0IG9mIHRoZSBncmlkIChlLmcuIHRvIHRoZSBncm91cCB6b25lKSB0aGUgY29sdW1uIGlzIG5vdCBoaWRkZW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRHJhZ0xlYXZlSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdzaGlmdCdgIHRvIGhhdmUgc2hpZnQtcmVzaXplIGFzIHRoZSBkZWZhdWx0IHJlc2l6ZSBvcGVyYXRpb24gKHNhbWUgYXMgdXNlciBob2xkaW5nIGRvd24gYFNoaWZ0YCB3aGlsZSByZXNpemluZykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xSZXNpemVEZWZhdWx0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFN1cHByZXNzZXMgYXV0by1zaXppbmcgY29sdW1ucyBmb3IgY29sdW1ucy4gSW4gb3RoZXIgd29yZHMsIGRvdWJsZSBjbGlja2luZyBhIGNvbHVtbidzIGhlYWRlcidzIGVkZ2Ugd2lsbCBub3QgYXV0by1zaXplLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBOdW1iZXIgb2YgcGl4ZWxzIHRvIGFkZCB0byBhIGNvbHVtbiB3aWR0aCBhZnRlciB0aGUgW2F1dG8tc2l6aW5nXSgvY29sdW1uLXNpemluZy8jYXV0by1zaXplLWNvbHVtbnMpIGNhbGN1bGF0aW9uLlxuICAgICAqIFNldCB0aGlzIGlmIHlvdSB3YW50IHRvIGFkZCBleHRyYSByb29tIHRvIGFjY29tbW9kYXRlIChmb3IgZXhhbXBsZSkgc29ydCBpY29ucywgb3Igc29tZSBvdGhlciBkeW5hbWljIG5hdHVyZSBvZiB0aGUgaGVhZGVyLlxuICAgICAqIERlZmF1bHQ6IGA0YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVQYWRkaW5nOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBza2lwIHRoZSBgaGVhZGVyTmFtZWAgd2hlbiBgYXV0b1NpemVgIGlzIGNhbGxlZCBieSBkZWZhdWx0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2YgY29tcG9uZW50IG5hbWVzIHRvIHBsYWluIEphdmFTY3JpcHQgY29tcG9uZW50cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IGFueTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2YgY29tcG9uZW50IG5hbWVzIHRvIGZyYW1ld29yayAoQW5ndWxhciwgUmVhY3QsIFZ1ZSBldGMuKSBjb21wb25lbnRzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnJhbWV3b3JrQ29tcG9uZW50czogeyBbcDogc3RyaW5nXTogeyBuZXcoKTogYW55OyB9OyB9IHwgYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBlbmFibGUgdGhlIGV4cGVyaW1lbnRhbCBSZWFjdCBVSS4gV29ya3Mgd2l0aCBSZWFjdCBmcmFtZXdvcmsgb25seS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlYWN0VWk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ2Z1bGxSb3cnYCB0byBlbmFibGUgRnVsbCBSb3cgRWRpdGluZy4gT3RoZXJ3aXNlIGxlYXZlIGJsYW5rIHRvIGVkaXQgb25lIGNlbGwgYXQgYSB0aW1lLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgU2luZ2xlIENsaWNrIEVkaXRpbmcgZm9yIGNlbGxzLCB0byBzdGFydCBlZGl0aW5nIHdpdGggYSBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IG5laXRoZXIgc2luZ2xlIG5vciBkb3VibGUgY2xpY2sgc3RhcnRzIGVkaXRpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc3RvcCBjZWxsIGVkaXRpbmcgd2hlbiBncmlkIGxvc2VzIGZvY3VzLlxuICAgICAqIFRoZSBkZWZhdWx0IGlzIHRoYXQgdGhlIGdyaWQgc3RheXMgZWRpdGluZyB1bnRpbCBmb2N1cyBnb2VzIG9udG8gYW5vdGhlciBjZWxsLiBGb3IgaW5saW5lIChub24tcG9wdXApIGVkaXRvcnMgb25seS5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck1vdmVzRG93bkFmdGVyRWRpdGAgdG8gaGF2ZSBFeGNlbC1zdHlsZSBiZWhhdmlvdXIgZm9yIHRoZSBgRW50ZXJgIGtleS5cbiAgICAgKiBpLmUuIHByZXNzaW5nIHRoZSBgRW50ZXJgIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGFsb25nIHdpdGggYGVudGVyTW92ZXNEb3duYCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlICdFbnRlcicga2V5LlxuICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIEVudGVyIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBVbmRvIC8gUmVkbyB3aGlsZSBlZGl0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBzaXplIG9mIHRoZSB1bmRvIC8gcmVkbyBzdGFjay4gRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZ0xpbWl0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1cyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0b3BFZGl0aW5nV2hlbkdyaWRMb3Nlc0ZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gQ1NWLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENzdkV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBDU1YuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gRXhjZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXM6IEV4Y2VsRXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBFeGNlbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBsaXN0IChhcnJheSkgb2YgRXhjZWwgc3R5bGVzIHRvIGJlIHVzZWQgd2hlbiBleHBvcnRpbmcgdG8gRXhjZWwgd2l0aCBzdHlsZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogRXhjZWxTdHlsZVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgZGVmYXVsdENzdkV4cG9ydFBhcmFtcyBvciBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXNcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgRXhjZWxFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJvd3MgYXJlIGZpbHRlcmVkIHVzaW5nIHRoaXMgdGV4dCBhcyBhIHF1aWNrIGZpbHRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIHF1aWNrIGZpbHRlciBjYWNoZSwgdXNlZCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIHdoZW4gdXNpbmcgdGhlIHF1aWNrIGZpbHRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVRdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCB0cmVlIGRhdGEgZmlsdGVyaW5nIGJlaGF2aW91ciB0byBpbnN0ZWFkIGV4Y2x1ZGUgY2hpbGQgbm9kZXMgZnJvbSBmaWx0ZXIgcmVzdWx0cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgZmxvYXRpbmdGaWx0ZXIgb24gdGhlIGNvbERlZiBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlT2xkU2V0RmlsdGVyTW9kZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gRW5hYmxlIENoYXJ0cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2hhcnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBjaGFydCB0aGVtZXMgdG8gYmUgdXNlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgY29udGFpbmluZyBjdXN0b20gY2hhcnQgdGhlbWVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3VzdG9tQ2hhcnRUaGVtZXM6IHsgW25hbWU6IHN0cmluZ106IEFnQ2hhcnRUaGVtZSB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFydCB0aGVtZSBvdmVycmlkZXMgYXBwbGllZCB0byBhbGwgdGhlbWVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZU92ZXJyaWRlczogQWdDaGFydFRoZW1lT3ZlcnJpZGVzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBgY2VsbFJlbmRlcmVyYCB0byB1c2Ugd2hlbiBkYXRhIGlzIGxvYWRpbmcgdmlhIGEgRGF0YVNvdXJjZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXI7IH0gfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZyYW1ld29yayBgY2VsbFJlbmRlcmVyYCB0byB1c2Ugd2hlbiBkYXRhIGlzIGxvYWRpbmcgdmlhIGEgRGF0YVNvdXJjZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogUGFyYW1zIHRvIGJlIHBhc3NlZCB0byBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggbG9hZGluZyBjZWxsIHJlbmRlcmVyIHRvIGJlIHVzZWQgd2hlbiBkYXRhIGlzIGxvYWRpbmcgdmlhIGEgRGF0YVNvdXJjZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvcjogTG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yRnVuYyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2Yga2V5LT52YWx1ZSBwYWlycyBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hc3RlciBEZXRhaWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1hc3RlckRldGFpbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBrZWVwIGRldGFpbCByb3dzIGZvciB3aGVuIHRoZXkgYXJlIGRpc3BsYXllZCBhZ2Fpbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIG51bWJlciBvZiBkZXRhaWxzIHJvd3MgdG8ga2VlcC4gRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3NDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGBkZXRhaWxDZWxsUmVuZGVyZXJgIHRvIHVzZSB3aGVuIGEgbWFzdGVyIHJvdyBpcyBleHBhbmRlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRnJhbWV3b3JrIGBkZXRhaWxDZWxsUmVuZGVyZXJgIHRvIHVzZSB3aGVuIGEgbWFzdGVyIHJvdyBpcyBleHBhbmRlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZpZXMgdGhlIHBhcmFtcyB0byBiZSB1c2VkIGJ5IHRoZSBEZXRhaWwgQ2VsbCBSZW5kZXJlci4gQ2FuIGFsc28gYmUgYSBmdW5jdGlvbiB0aGF0IHByb3ZpZGVzIHRoZSBwYXJhbXMgdG8gZW5hYmxlIGR5bmFtaWMgZGVmaW5pdGlvbnMgb2YgdGhlIHBhcmFtcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgZml4ZWQgaGVpZ2h0IGluIHBpeGVscyBmb3IgZWFjaCBkZXRhaWwgcm93LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsUm93SGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgZGV0YWlsIGdyaWQgZHluYW1pY2FsbHkgY2hhbmdlIGl0J3MgaGVpZ2h0IHRvIGZpdCBpdCdzIHJvd3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dBdXRvSGVpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlcyBhIGNvbnRleHQgb2JqZWN0IHRoYXQgaXMgcHJvdmlkZWQgdG8gZGlmZmVyZW50IGNhbGxiYWNrcyB0aGUgZ3JpZCB1c2VzLiBVc2VkIGZvciBwYXNzaW5nIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gdG8gdGhlIGNhbGxiYWNrcyBieSB5b3VyIGFwcGxpY2F0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29udGV4dDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGxpc3Qgb2YgZ3JpZHMgdG8gdHJlYXQgYXMgQWxpZ25lZCBHcmlkcy4gSWYgZ3JpZHMgYXJlIGFsaWduZWQgdGhlbiB0aGUgY29sdW1ucyBhbmQgaG9yaXpvbnRhbCBzY3JvbGxpbmcgd2lsbCBiZSBrZXB0IGluIHN5bmMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGlnbmVkR3JpZHM6IEdyaWRPcHRpb25zW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENoYW5nZSB0aGlzIHZhbHVlIHRvIHNldCB0aGUgdGFiSW5kZXggb3JkZXIgb2YgdGhlIEdyaWQgd2l0aGluIHlvdXIgYXBwbGljYXRpb24uIERlZmF1bHQ6IGAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIG51bWJlciBvZiByb3dzIHJlbmRlcmVkIG91dHNpZGUgdGhlIHZpZXdhYmxlIGFyZWEgdGhlIGdyaWQgcmVuZGVycy5cbiAgICAgKiBIYXZpbmcgYSBidWZmZXIgbWVhbnMgdGhlIGdyaWQgd2lsbCBoYXZlIHJvd3MgcmVhZHkgdG8gc2hvdyBhcyB0aGUgdXNlciBzbG93bHkgc2Nyb2xscyB2ZXJ0aWNhbGx5LlxuICAgICAqIERlZmF1bHQ6IGAxMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0J1ZmZlcjogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIHZhbHVlIGNhY2hlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbmZpZ3VyZSB0aGUgdmFsdWUgY2FjaGUgdG8gbm90IGV4cGlyZSBhZnRlciBkYXRhIHVwZGF0ZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlQ2FjaGVOZXZlckV4cGlyZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgY2VsbCBleHByZXNzaW9ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvdyBub2RlcyBkbyBub3QgaGF2ZSB0aGVpciBwYXJlbnRzIHNldC5cbiAgICAgKiBUaGUgZ3JpZCBkb2Vzbid0IHVzZSB0aGUgcGFyZW50IHJlZmVyZW5jZSwgYnV0IGl0IGlzIGluY2x1ZGVkIHRvIGhlbHAgdGhlIGNsaWVudCBjb2RlIG5hdmlnYXRlIHRoZSBub2RlIHRyZWUgaWYgaXQgd2FudHMgYnkgcHJvdmlkaW5nIGJpLWRpcmVjdGlvbiBuYXZpZ2F0aW9uIHVwIGFuZCBkb3duIHRoZSB0cmVlLlxuICAgICAqIElmIHRoaXMgaXMgYSBwcm9ibGVtIChlLmcuIGlmIHlvdSBuZWVkIHRvIGNvbnZlcnQgdGhlIHRyZWUgdG8gSlNPTiwgd2hpY2ggZG9lcyBub3QgYWxsb3cgY3ljbGljIGRlcGVuZGVuY2llcykgdGhlbiBzZXQgdGhpcyB0byBgdHJ1ZWAuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXJlbnRzSW5Sb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdG91Y2ggc3VwcG9ydCAoYnV0IGRvZXMgbm90IHJlbW92ZSB0aGUgYnJvd3NlcidzIGVmZm9ydHMgdG8gc2ltdWxhdGUgbW91c2UgZXZlbnRzIG9uIHRvdWNoKS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NUb3VjaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBub3Qgc2V0IGZvY3VzIGJhY2sgb24gdGhlIGdyaWQgYWZ0ZXIgYSByZWZyZXNoLiBUaGlzIGNhbiBhdm9pZCBpc3N1ZXMgd2hlcmUgeW91IHdhbnQgdG8ga2VlcCB0aGUgZm9jdXMgb24gYW5vdGhlciBwYXJ0IG9mIHRoZSBicm93c2VyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgYXN5bmNocm9ub3VzIG5hdHVyZSBvZiB0aGUgZXZlbnRzIGludHJvZHVjZWQgaW4gdjEwLCBhbmQgbWFrZXMgdGhlbSBzeW5jaHJvbm91cy4gVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBmb3IgdGhlIHB1cnBvc2Ugb2Ygc3VwcG9ydGluZyBsZWdhY3kgY29kZSB3aGljaCBoYXMgYSBkZXBlbmRlbmN5IG9uIHN5bmNocm9ub3VzIGV2ZW50cyBmcm9tIGVhcmxpZXIgdmVyc2lvbnMgKHY5IG9yIGVhcmxpZXIpIG9mIEFHIEdyaWQuICAgICAqKkl0IGlzIHN0cm9uZ2x5IHJlY29tbWVuZGVkIHRoYXQgeW91IGRvIG5vdCBjaGFuZ2UgdGhpcyBwcm9wZXJ0eSB1bmxlc3MgeW91IGhhdmUgbGVnYWN5IGlzc3Vlcy4qKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FzeW5jRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZ3JpZCB3aWxsIGNoZWNrIGZvciBgUmVzaXplT2JzZXJ2ZXJgIGFuZCB1c2UgaXQgaWYgaXQgZXhpc3RzIGluIHRoZSBicm93c2VyLCBvdGhlcndpc2UgaXQgd2lsbCB1c2UgdGhlIGdyaWQncyBhbHRlcm5hdGl2ZSBpbXBsZW1lbnRhdGlvbi4gU29tZSB1c2VycyByZXBvcnRlZCBpc3N1ZXMgd2l0aCBDaHJvbWUncyBgUmVzaXplT2JzZXJ2ZXJgLiBVc2UgdGhpcyBwcm9wZXJ0eSB0byBhbHdheXMgdXNlIHRoZSBncmlkJ3MgYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb24gc2hvdWxkIHN1Y2ggcHJvYmxlbXMgZXhpc3QuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyBzaG93aW5nIGEgd2FybmluZyBtZXNzYWdlIGluIHRoZSBjb25zb2xlIGlmIHVzaW5nIGEgYGdyaWRPcHRpb25zYCBvciBgY29sRGVmYCBwcm9wZXJ0eSB0aGF0IGRvZXNuJ3QgZXhpc3QuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJvcGVydHlOYW1lc0NoZWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyBjaGFuZ2UgZGV0ZWN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NoYW5nZURldGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIGVuYWJsZSBkZWJ1ZyBpbmZvcm1hdGlvbiBmcm9tIHRoZSBncmlkIGFuZCByZWxhdGVkIGNvbXBvbmVudHMuIFdpbGwgcmVzdWx0IGluIGFkZGl0aW9uYWwgbG9nZ2luZyBiZWluZyBvdXRwdXQsIGJ1dCB2ZXJ5IHVzZWZ1bCB3aGVuIGludmVzdGlnYXRpbmcgcHJvYmxlbXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlYnVnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgdGVtcGxhdGUgZm9yICdsb2FkaW5nJyBvdmVybGF5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheUxvYWRpbmdUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGxvYWRpbmcgb3ZlcmxheSBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudDogeyBuZXcoKTogSUxvYWRpbmdPdmVybGF5Q29tcDsgfSB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgbG9hZGluZ092ZXJsYXlDb21wb25lbnRgIGJ1dCBmb3IgYSBmcmFtZXdvcmsgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlICdsb2FkaW5nJyBvdmVybGF5LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgdGVtcGxhdGUgZm9yICdubyByb3dzJyBvdmVybGF5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheU5vUm93c1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gbm8gcm93cyBvdmVybGF5IGNvbXBvbmVudCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudDogeyBuZXcoKTogSU5vUm93c092ZXJsYXlDb21wOyB9IHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBub1Jvd3NPdmVybGF5Q29tcG9uZW50YCBidXQgZm9yIGEgZnJhbWV3b3JrIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBubyByb3dzIG92ZXJsYXkgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgJ25vIHJvd3MnIG92ZXJsYXkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHdoZXRoZXIgcGFnaW5hdGlvbiBpcyBlbmFibGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByb3dzIHRvIGxvYWQgcGVyIHBhZ2UuIElmIGBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplYCBpcyBzcGVjaWZpZWQsIHRoaXMgcHJvcGVydHkgaXMgaWdub3JlZC4gRGVmYXVsdDogYDEwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIG51bWJlciBvZiByb3dzIHRvIGxvYWQgcGVyIHBhZ2UgaXMgYXV0b21hdGljYWxseSBhZGp1c3RlZCBieSB0aGUgZ3JpZCBzbyBlYWNoIHBhZ2Ugc2hvd3MgZW5vdWdoIHJvd3MgdG8ganVzdCBmaWxsIHRoZSBhcmVhIGRlc2lnbmF0ZWQgZm9yIHRoZSBncmlkLiBJZiBgZmFsc2VgLCBgcGFnaW5hdGlvblBhZ2VTaXplYCBpcyB1c2VkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgcGFnZXMgc3BsaXQgY2hpbGRyZW4gb2YgZ3JvdXBzIHdoZW4gdXNpbmcgUm93IEdyb3VwaW5nIG9yIGRldGFpbCByb3dzIHdpdGggTWFzdGVyIERldGFpbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGRlZmF1bHQgZ3JpZCBjb250cm9scyBmb3IgbmF2aWdhdGlvbiBhcmUgaGlkZGVuLlxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGlmIGBwYWdpbmF0aW9uPXRydWVgIGFuZCB5b3Ugd2FudCB0byBwcm92aWRlIHlvdXIgb3duIHBhZ2luYXRpb24gY29udHJvbHMuXG4gICAgICogT3RoZXJ3aXNlLCB3aGVuIGBwYWdpbmF0aW9uPXRydWVgIHRoZSBncmlkIGF1dG9tYXRpY2FsbHkgc2hvd3MgdGhlIG5lY2Vzc2FyeSBjb250cm9scyBhdCB0aGUgYm90dG9tIHNvIHRoYXQgdGhlIHVzZXIgY2FuIG5hdmlnYXRlIHRocm91Z2ggdGhlIGRpZmZlcmVudCBwYWdlcy5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgcGl2b3QgbW9kZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RNb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdwaXZvdCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gcGl2b3QpIGF0IHRoZSB0b3AuIE5vdGUgdGhhdCB0aGUgcGl2b3QgcGFuZWwgd2lsbCBuZXZlciBzaG93IGlmIGBwaXZvdE1vZGVgIGlzIG9mZi4gRGVmYXVsdDogYG5ldmVyYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RQYW5lbFNob3c6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBzZXQgYW5kIHRoZSBncmlkIGlzIGluIHBpdm90IG1vZGUsIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCB0b3RhbHMgd2lsbCBhcHBlYXIgd2l0aGluIHRoZSBQaXZvdCBDb2x1bW4gR3JvdXBzLCBpbiB0aGUgcG9zaXRpb24gc3BlY2lmaWVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFsczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciBmb3IgZWFjaCB2YWx1ZSBjb2x1bW4gaW4gdGhlIHBvc2l0aW9uIHNwZWNpZmllZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Um93VG90YWxzOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3Qgc3dhcCBpbiB0aGUgZ3JvdXBpbmcgY29sdW1uIHdoZW4gcGl2b3RpbmcuIFVzZWZ1bCBpZiBwaXZvdGluZyB1c2luZyBTZXJ2ZXIgU2lkZSBSb3cgTW9kZWwgb3IgVmlld3BvcnQgUm93IE1vZGVsIGFuZCB5b3Ugd2FudCBmdWxsIGNvbnRyb2wgb2YgYWxsIGNvbHVtbnMgaW5jbHVkaW5nIHRoZSBncm91cCBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHBpdm90IGNvbHVtbiBncm91cHMgd2lsbCBhcHBlYXIgJ2ZpeGVkJywgd2l0aG91dCB0aGUgYWJpbGl0eSB0byBleHBhbmQgYW5kIGNvbGxhcHNlIHRoZSBjb2x1bW4gZ3JvdXBzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGVuIHJvdyBncm91cCwgcGl2b3QgYW5kIHZhbHVlIGFnZ3JlZ2F0aW9uIHdpbGwgYmUgcmVhZC1vbmx5IGZyb20gdGhlIEdVSS4gVGhlIGdyaWQgd2lsbCBkaXNwbGF5IHdoYXQgdmFsdWVzIGFyZSB1c2VkIGZvciBlYWNoLCBidXQgd2lsbCBub3QgYWxsb3cgdGhlIHVzZXIgdG8gY2hhbmdlIHRoZSBzZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiAnZnVuY3Rpb24gbmFtZScgdG8gJ2Z1bmN0aW9uJyBmb3IgY3VzdG9tIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmNzOiB7IFtrZXk6IHN0cmluZ106IElBZ2dGdW5jOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgY29sdW1uIGhlYWRlcnMgd29uJ3QgaW5jbHVkZSB0aGUgYGFnZ0Z1bmNgIG5hbWUsIGUuZy4gYCdzdW0oQmFuayBCYWxhbmNlKWAnIHdpbGwganVzdCBiZSBgJ0JhbmsgQmFsYW5jZSdgLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBhZ2dyZWdhdGlvbnMgd29uJ3QgYmUgY29tcHV0ZWQgZm9yIHRoZSByb290IG5vZGUgb2YgdGhlIGdyaWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnQXRSb290TGV2ZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgY2hhbmdlIGRldGVjdGlvbiwgb25seSB0aGUgdXBkYXRlZCBjb2x1bW4gd2lsbCBiZSByZS1hZ2dyZWdhdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCBhZ2dyZWdhdGlvbnMgYXJlIG5vdCBpbXBhY3RlZCBieSBmaWx0ZXJpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBSb3cgQW5pbWF0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmltYXRlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIGZsYXNoIGFmdGVyIGRhdGEgY2hhbmdlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGVuYWJsZUNlbGxDaGFuZ2VGbGFzaGAsIHRoaXMgY29uZmlndXJhdGlvbiB3aWxsIHNldCB0aGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIG9mIGhvdyBsb25nIGEgY2VsbCBzaG91bGQgcmVtYWluIGluIGl0cyBcImZsYXNoZWRcIiBzdGF0ZS5cbiAgICAgKiBEZWZhdWx0OiBgNTAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgLCB0aGlzIGNvbmZpZ3VyYXRpb24gd2lsbCBzZXQgdGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyB0aGUgXCJmbGFzaGVkXCIgc3RhdGUgYW5pbWF0aW9uIHRha2VzIHRvIGZhZGUgYXdheSBhZnRlciB0aGUgdGltZXIgc2V0IGJ5IGBjZWxsRmxhc2hEZWxheWAgaGFzIGNvbXBsZXRlZC5cbiAgICAgKiBEZWZhdWx0OiBgMTAwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGYWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3dpdGNoIGJldHdlZW4gbGF5b3V0IG9wdGlvbnM6IGBub3JtYWxgLCBgYXV0b0hlaWdodGAsIGBwcmludGAuXG4gICAgICogRGVmYXVsdDogYG5vcm1hbGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRvbUxheW91dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIG9yZGVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgaW4gdGhlIERPTSBhcmUgY29uc2lzdGVudCB3aXRoIHdoYXQgaXMgb24gc2NyZWVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnN1cmVEb21PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvcGVyYXRlIHRoZSBncmlkIGluIFJUTCAoUmlnaHQgdG8gTGVmdCkgbW9kZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUnRsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIGdyaWQgZG9lc24ndCB2aXJ0dWFsaXNlIHRoZSBjb2x1bW5zLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgMTAwIGNvbHVtbnMsIGJ1dCBvbmx5IDEwIHZpc2libGUgZHVlIHRvIHNjcm9sbGluZywgYWxsIDEwMCB3aWxsIGFsd2F5cyBiZSByZW5kZXJlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCB0aGUgZ3JpZCBoYXMgYSBsaW1pdCBvZiByZW5kZXJpbmcgYSBtYXhpbXVtIG9mIDUwMCByb3dzIGF0IG9uY2UgKHJlbWVtYmVyIHRoZSBncmlkIG9ubHkgcmVuZGVycyByb3dzIHlvdSBjYW4gc2VlLCBzbyB1bmxlc3MgeW91ciBkaXNwbGF5IHNob3dzIG1vcmUgdGhhbiA1MDAgcm93cyB3aXRob3V0IHZlcnRpY2FsbHkgc2Nyb2xsaW5nIHRoaXMgd2lsbCBuZXZlciBiZSBhbiBpc3N1ZSkuXG4gICAgICogPGJyIC8+KipUaGlzIGlzIG9ubHkgcmVsZXZhbnQgaWYgeW91IGFyZSBtYW51YWxseSBzZXR0aW5nIGByb3dCdWZmZXJgIHRvIGEgaGlnaCB2YWx1ZSAocmVuZGVyaW5nIG1vcmUgcm93cyB0aGFuIGNhbiBiZSBzZWVuKSBvciBpZiB5b3VyIGdyaWQgaGVpZ2h0IGlzIGFibGUgdG8gZGlzcGxheSBtb3JlIHRoYW4gNTAwIHJvd3MgYXQgb25jZS4qKiBcbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01heFJlbmRlcmVkUm93UmVzdHJpY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hbmFnZWQgUm93IERyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyByb3cgZHJhZ2dpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtb3Zpbmcgcm93cyB3aGlsZSBkcmFnZ2luZyB0aGUgYHJvd0RyYWdgIHdhZmZsZS4gVGhpcyBvcHRpb24gaGlnaGxpZ2h0cyB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIHJvdyB3aWxsIGJlIHBsYWNlZCBhbmQgaXQgd2lsbCBvbmx5IG1vdmUgdGhlIHJvdyBvbiBtb3VzZSB1cC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBjbGlja2luZyBhbmQgZHJhZ2dpbmcgYW55d2hlcmUgb24gdGhlIHJvdyB3aXRob3V0IHRoZSBuZWVkIGZvciBhIGRyYWcgaGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnRW50aXJlUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBkcmFnZ2luZyBtdWx0aXBsZSByb3dzIGF0IHRoZSBzYW1lIHRpbWUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNdWx0aVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgQ2VsbCBSZW5kZXJlciB0byB1c2UgZm9yIGZ1bGwgd2lkdGggcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlcjogeyBuZXcoKTogSUNlbGxSZW5kZXJlckNvbXA7IH0gfCBJQ2VsbFJlbmRlcmVyRnVuYyB8IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2FtZSBhcyBgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyYCBidXQgZm9yIGEgZnJhbWV3b3JrIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIGBmdWxsV2lkdGhDZWxsUmVuZGVyZXJgIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGRldGFpbCBncmlkIGVtYmVkZGVkIGluIHRoZSBtYXN0ZXIgZ3JpZCdzIGNvbnRhaW5lciBhbmQgc28gbGluayB0aGVpciBob3Jpem9udGFsIHNjcm9sbGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlcHJlY2F0ZWRFbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyBob3cgdGhlIHJlc3VsdHMgb2Ygcm93IGdyb3VwaW5nIHNob3VsZCBiZSBkaXNwbGF5ZWQuXG4gICAgICogXG4gICAgICogICBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICogXG4gICAgICogICAgICAgYCdzaW5nbGVDb2x1bW4nYDogc2luZ2xlIGdyb3VwIGNvbHVtbiBhdXRvbWF0aWNhbGx5IGFkZGVkIGJ5IHRoZSBncmlkLlxuICAgICAqICAgICAgIGAnbXVsdGlwbGVDb2x1bW5zJ2A6IGEgZ3JvdXAgY29sdW1uIHBlciByb3cgZ3JvdXAgaXMgYWRkZWQgYXV0b21hdGljYWxseS5cbiAgICAgKiAgICAgICBgJ2dyb3VwUm93cydgOiBncm91cCByb3dzIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIGluc3RlYWQgb2YgZ3JvdXAgY29sdW1ucy5cbiAgICAgKiAgICAgICBgJ2N1c3RvbSdgOiBpbmZvcm1zIHRoZSBncmlkIHRoYXQgZ3JvdXAgY29sdW1ucyB3aWxsIGJlIHByb3ZpZGVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEaXNwbGF5VHlwZTogUm93R3JvdXBpbmdEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZ3JvdXBpbmcsIHNldCB0byB0aGUgbnVtYmVyIG9mIGxldmVscyB0byBleHBhbmQgYnkgZGVmYXVsdCwgZS5nLiBgMGAgZm9yIG5vbmUsIGAxYCBmb3IgZmlyc3QgbGV2ZWwgb25seSwgZXRjLiBTZXQgdG8gYC0xYCB0byBleHBhbmQgZXZlcnl0aGluZy4gRGVmYXVsdDogYDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERlZmF1bHRFeHBhbmRlZDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgc3BlY2lmeWluZyB0aGUgZ3JvdXAgJ2F1dG8gY29sdW1uJyBpZiB5b3UgYXJlIG5vdCBoYXBweSB3aXRoIHRoZSBkZWZhdWx0LiBJZiBncm91cGluZywgdGhpcyBjb2x1bW4gZGVmaW5pdGlvbiBpcyBpbmNsdWRlZCBhcyB0aGUgZmlyc3QgY29sdW1uIGluIHRoZSBncmlkLiBJZiBub3QgZ3JvdXBpbmcsIHRoaXMgY29sdW1uIGlzIG5vdCBpbmNsdWRlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGF1dG9Hcm91cENvbHVtbkRlZjogQ29sRGVmIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgcHJlc2VydmVzIHRoZSBjdXJyZW50IGdyb3VwIG9yZGVyIHdoZW4gc29ydGluZyBvbiBub24tZ3JvdXAgY29sdW1ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgaWYgeW91IHNlbGVjdCBhIGdyb3VwLCB0aGUgY2hpbGRyZW4gb2YgdGhlIGdyb3VwIHdpbGwgYWxzbyBiZSBzZWxlY3RlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGdyb3VwaW5nLCB0aGlzIGNvbnRyb2xzIHdoZXRoZXIgdG8gc2hvdyBhIGdyb3VwIGZvb3RlciB3aGVuIHRoZSBncm91cCBpcyBleHBhbmRlZC5cbiAgICAgKiBJZiBgdHJ1ZWAsIHRoZW4gYnkgZGVmYXVsdCwgdGhlIGZvb3RlciB3aWxsIGNvbnRhaW4gYWdncmVnYXRlIGRhdGEgKGlmIGFueSkgd2hlbiBzaG93biBhbmQgdGhlIGhlYWRlciB3aWxsIGJlIGJsYW5rLlxuICAgICAqIFdoZW4gY2xvc2VkLCB0aGUgaGVhZGVyIHdpbGwgY29udGFpbiB0aGUgYWdncmVnYXRlIGRhdGEgcmVnYXJkbGVzcyBvZiB0aGlzIHNldHRpbmcgKGFzIHRoZSBmb290ZXIgaXMgaGlkZGVuIGFueXdheSkuXG4gICAgICogVGhpcyBpcyBoYW5keSBmb3IgJ3RvdGFsJyByb3dzLCB0aGF0IGFyZSBkaXNwbGF5ZWQgYmVsb3cgdGhlIGRhdGEgd2hlbiB0aGUgZ3JvdXAgaXMgb3BlbiwgYW5kIGFsb25nc2lkZSB0aGUgZ3JvdXAgd2hlbiBpdCBpcyBjbG9zZWQuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgYSAnZ3JhbmQgdG90YWwnIGdyb3VwIGZvb3RlciBhY3Jvc3MgYWxsIGdyb3Vwcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlVG90YWxGb290ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgYW5kIHNob3dpbmcgZm9vdGVyLCBhZ2dyZWdhdGUgZGF0YSB3aWxsIGFsd2F5cyBiZSBkaXNwbGF5ZWQgYXQgYm90aCB0aGUgaGVhZGVyIGFuZCBmb290ZXIgbGV2ZWxzLiBUaGlzIHN0b3BzIHRoZSBwb3NzaWJseSB1bmRlc2lyYWJsZSBiZWhhdmlvdXIgb2YgdGhlIGhlYWRlciBkZXRhaWxzICdqdW1waW5nJyB0byB0aGUgZm9vdGVyIG9uIGV4cGFuZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiB1c2luZyBgZ3JvdXBTZWxlY3RzQ2hpbGRyZW5gLCB0aGVuIG9ubHkgdGhlIGNoaWxkcmVuIHRoYXQgcGFzcyB0aGUgY3VycmVudCBmaWx0ZXIgd2lsbCBnZXQgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0ZpbHRlcmVkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG93cyB0aGUgb3BlbiBncm91cCBpbiB0aGUgZ3JvdXAgY29sdW1uIGZvciBub24tZ3JvdXAgcm93cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd09wZW5lZEdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGdyb3VwcyB0aGF0IG9ubHkgaGF2ZSBvbmUgY2hpbGQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGxvd2VzdCBsZXZlbCBncm91cHMgdGhhdCBvbmx5IGhhdmUgb25lIGNoaWxkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZGUgcGFyZW50cyB0aGF0IGFyZSBvcGVuLiBXaGVuIHVzZWQgd2l0aCBtdWx0aXBsZSBjb2x1bW5zIGZvciBzaG93aW5nIGdyb3VwcywgaXQgY2FuIGdpdmUgYSBtb3JlIHBsZWFzaW5nIHVzZXIgZXhwZXJpZW5jZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdG8gc2hvdyB0aGUgJ3JvdyBncm91cCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gZ3JvdXApIGF0IHRoZSB0b3AuIERlZmF1bHQ6IGBuZXZlcmAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTaG93OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIENlbGwgUmVuZGVyZXIgdG8gdXNlIHdoZW4gYGdyb3VwRGlzcGxheVR5cGUgPSAnZ3JvdXBSb3dzJ2AuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyOiB7IG5ldygpOiBJQ2VsbFJlbmRlcmVyQ29tcDsgfSB8IElDZWxsUmVuZGVyZXJGdW5jIHwgc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTYW1lIGFzIGBncm91cFJvd1JlbmRlcmVyYCBidXQgZm9yIGEgZnJhbWV3b3JrIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBgZ3JvdXBSb3dSZW5kZXJlcmAgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCB3aGVuIGEgY29sdW1uIGlzIHVuLWdyb3VwZWQsIGkuZS4gdXNpbmcgdGhlIFJvdyBHcm91cCBQYW5lbCwgaXQgaXMgbWFkZSB2aXNpYmxlIGluIHRoZSBncmlkLiBUaGlzIHByb3BlcnR5IHN0b3BzIHRoZSBjb2x1bW4gYmVjb21pbmcgdmlzaWJsZSBhZ2FpbiB3aGVuIHVuLWdyb3VwaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01ha2VDb2x1bW5WaXNpYmxlQWZ0ZXJVbkdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgR3JpZCB0byB3b3JrIHdpdGggVHJlZSBEYXRhLiBZb3UgbXVzdCBhbHNvIGltcGxlbWVudCB0aGUgYGdldERhdGFQYXRoKGRhdGEpYCBjYWxsYmFjay4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIHRoaXMgaXMgbm93IGdyb3VwUm93UmVuZGVyZXJQYXJhbXMuaW5uZXJSZW5kZXJlclxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0lubmVyUmVuZGVyZXI6IHsgbmV3KCk6IElDZWxsUmVuZGVyZXJDb21wOyB9IHwgSUNlbGxSZW5kZXJlckZ1bmMgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gdGhpcyBpcyBub3cgZ3JvdXBSb3dSZW5kZXJlclBhcmFtcy5pbm5lclJlbmRlcmVyRnJhbWV3b3JrXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBncm91cERpc3BsYXlUeXBlID0gJ211bHRpcGxlQ29sdW1ucycgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cE11bHRpQXV0b0NvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZ3JvdXBEaXNwbGF5VHlwZSA9ICdncm91cFJvd3MnIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBVc2VFbnRpcmVSb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGdyb3VwRGlzcGxheVR5cGUgPSAnY3VzdG9tJyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIG5vIGxvbmdlciBuZWVkZWQsIHRyYW5zYWN0aW9uIHVwZGF0ZXMga2VlcCBncm91cCBzdGF0ZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZW1lbWJlckdyb3VwU3RhdGVXaGVuTmV3RGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIHRvcCByb3dzIGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkVG9wUm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERhdGEgdG8gYmUgZGlzcGxheWVkIGFzIHBpbm5lZCBib3R0b20gcm93cyBpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZEJvdHRvbVJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXRzIHRoZSByb3cgbW9kZWwgdHlwZS4gRGVmYXVsdDogYGNsaWVudFNpZGVgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNb2RlbFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBkYXRhIHRvIGJlIGRpc3BsYXllZCBhcyByb3dzIGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RGF0YTogYW55W10gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBFbmFibGVzIEltbXV0YWJsZSBEYXRhIG1vZGUsIGZvciBjb21wYXRpYmlsaXR5IHdpdGggaW1tdXRhYmxlIHN0b3Jlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW1tdXRhYmxlRGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGV4ZWN1dGluZyBhIGJhdGNoIG9mIGFzeW5jIHRyYW5zYWN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25XYWl0TWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIFRyYW5zYWN0aW9ucyBjaGFuZ2luZyBzb3J0LCBmaWx0ZXIsIGdyb3VwIG9yIHBpdm90IHN0YXRlIHdoZW4gdHJhbnNhY3Rpb24gb25seSBjb250YWlucyB1cGRhdGVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vZGVsVXBkYXRlQWZ0ZXJVcGRhdGVUcmFuc2FjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhUm93RGF0YU1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHVzZSBhc3luY1RyYW5zYWN0aW9uV2FpdE1pbGxpcyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGJhdGNoVXBkYXRlV2FpdE1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBkYXRhc291cmNlIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRhc291cmNlOiBJRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAqIERlZmF1bHQ6IGAxYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVPdmVyZmxvd1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAqIERlZmF1bHQ6IGAxYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hldGhlciB0byB1c2UgRnVsbCBTdG9yZSBvciBQYXJ0aWFsIFN0b3JlIGZvciBzdG9yaW5nIHJvd3MuIERlZmF1bHQ6IGBmdWxsYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVN0b3JlVHlwZTogU2VydmVyU2lkZVN0b3JlVHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcm93cyBmb3IgZWFjaCBibG9jayBpbiB0aGUgc3RvcmUsIGkuZS4gaG93IG1hbnkgcm93cyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgYXQgYSB0aW1lLlxuICAgICAqIERlZmF1bHQ6IGAxMDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZUJsb2NrU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBibG9ja3MgdG8ga2VlcCBpbiB0aGUgc3RvcmUuIERlZmF1bHQgaXMgbm8gbGltaXQsIHNvIGV2ZXJ5IHJlcXVlc3RlZCBibG9jayBpcyBrZXB0LiBVc2UgdGhpcyBpZiB5b3UgaGF2ZSBtZW1vcnkgY29uY2VybnMsIGFuZCBibG9ja3MgdGhhdCB3ZXJlIGxlYXN0IHJlY2VudGx5IHZpZXdlZCB3aWxsIGJlIHB1cmdlZCB3aGVuIHRoZSBsaW1pdCBpcyBoaXQuIFRoZSBncmlkIHdpbGwgYWRkaXRpb25hbGx5IG1ha2Ugc3VyZSBpdCBoYXMgYWxsIHRoZSBibG9ja3MgbmVlZGVkIHRvIGRpc3BsYXkgd2hhdCBpcyBjdXJyZW50bHkgdmlzaWJsZSwgaW4gY2FzZSB0aGlzIHByb3BlcnR5IGlzIHNldCB0byBhIGxvdyB2YWx1ZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heEJsb2Nrc0luQ2FjaGU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcmVxdWVzdHMgdG8gaGl0IHRoZSBzZXJ2ZXIgd2l0aCBjb25jdXJyZW50bHkuIElmIHRoZSBtYXggaXMgcmVhY2hlZCwgcmVxdWVzdHMgYXJlIHF1ZXVlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGxvYWRpbmcgYSBibG9jay4gVXNlZnVsIHdoZW4gc2Nyb2xsaW5nIG92ZXIgbWFueSByb3dzLCBzcGFubmluZyBtYW55IFBhcnRpYWwgU3RvcmUgYmxvY2tzLCBhcyBpdCBwcmV2ZW50cyBibG9ja3MgbG9hZGluZyB1bnRpbCBzY3JvbGxpbmcgaGFzIHNldHRsZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBibG9ja0xvYWREZWJvdW5jZU1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGNsb3NpbmcgZ3JvdXAgcm93cyB3aWxsIHJlbW92ZSBjaGlsZHJlbiBvZiB0aGF0IHJvdy4gTmV4dCB0aW1lIHRoZSByb3cgaXMgb3BlbmVkLCBjaGlsZCByb3dzIHdpbGwgYmUgcmVhZCBmcm9tIHRoZSBkYXRhc291cmNlIGFnYWluLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHVyZ2VDbG9zZWRSb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB0aGUgYHNlcnZlclNpZGVEYXRhc291cmNlYCBmb3Igc2VydmVyIHNpZGUgcm93IG1vZGVsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZURhdGFzb3VyY2U6IElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBhbHdheXMgcmVmcmVzaGVzIHRvcCBsZXZlbCBncm91cHMgcmVnYXJkbGVzcyBvZiB3aGljaCBjb2x1bW4gd2FzIHNvcnRlZC4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0aW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGFsd2F5cyByZWZyZXNoZXMgc3RvcmVzIGFmdGVyIGZpbHRlciBoYXMgY2hhbmdlZC4gVXNlZCBieSBGdWxsIFN0b3JlIG9ubHksIHRvIGFsbG93IFNlcnZlci1TaWRlIEZpbHRlcmluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlcmluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRW50ZXJwcmlzZVJlc2V0T25OZXdDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyB1c2UgdGhlIHZpZXdwb3J0IHJvdyBtb2RlbCB5b3UgbmVlZCB0byBwcm92aWRlIHRoZSBncmlkIHdpdGggYSBgdmlld3BvcnREYXRhc291cmNlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0RGF0YXNvdXJjZTogSVZpZXdwb3J0RGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyB2aWV3cG9ydCByb3cgbW9kZWwsIHNldHMgdGhlIHBhZ2Ugc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbFBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgdmlld3BvcnQgcm93IG1vZGVsLCBzZXRzIHRoZSBidWZmZXIgc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbEJ1ZmZlclNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgaG9yaXpvbnRhbCBzY3JvbGxiYXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSB2ZXJ0aWNhbCBzY3JvbGxiYXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBkZWJvdW5jZSB0aGUgdmVydGljYWwgc2Nyb2xsYmFyLiBDYW4gcHJvdmlkZSBzbW9vdGhlciBzY3JvbGxpbmcgb24gb2xkZXIgYnJvd3NlcnMsIGUuZy4gSW50ZXJuZXQgRXhwbG9yZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlYm91bmNlVmVydGljYWxTY3JvbGxiYXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbmV2ZXIgc2hvdyB0aGUgaG9yaXpvbnRhbCBzY3JvbGwuIFRoaXMgaXMgdXNlZnVsIGlmIHRoZSBncmlkIGlzIGFsaWduZWQgd2l0aCBhbm90aGVyIGdyaWQgYW5kIHdpbGwgc2Nyb2xsIHdoZW4gdGhlIG90aGVyIGdyaWQgc2Nyb2xscy4gKFNob3VsZCBub3QgYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbGAuKSBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzY3JvbGwgdG8gdGhlIHRvcCB3aGVuIG5ldyByb3cgZGF0YSBpcyBwcm92aWRlZC4gVXNlIHRoaXMgaWYgeW91IGRvbid0IHdhbnQgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIG9mIHNjcm9sbGluZyB0byB0aGUgdG9wIGV2ZXJ5IHRpbWUgeW91IGxvYWQgbmV3IGRhdGEuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsT25OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgYWxsb3cgbW91c2V3aGVlbCAvIHRvdWNocGFkIHNjcm9sbCB3aGVuIHBvcHVwIGVsZW1lbnRzIGFyZSBwcmVzZW50LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbFdoZW5Qb3B1cHNBcmVPcGVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgdXNlIGFuaW1hdGlvbiBmcmFtZXMgd2hlbiBkcmF3aW5nIHJvd3Mgd2hpbGUgc2Nyb2xsaW5nLiBVc2UgdGhpcyBpZiB0aGUgZ3JpZCBpcyB3b3JraW5nIGZhc3QgZW5vdWdoIHRoYXQgeW91IGRvbid0IG5lZWQgYW5pbWF0aW9uIGZyYW1lcyBhbmQgeW91IGRvbid0IHdhbnQgdGhlIGdyaWQgdG8gZmxpY2tlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBtaWRkbGUgY2xpY2tzIHdpbGwgcmVzdWx0IGluIGBjbGlja2AgZXZlbnRzIGZvciBjZWxscyBhbmQgcm93cy4gT3RoZXJ3aXNlIHRoZSBicm93c2VyIHdpbGwgdXNlIG1pZGRsZSBjbGljayB0byBzY3JvbGwgdGhlIGdyaWQuPGJyIC8+KipOb3RlOioqIE5vdCBhbGwgYnJvd3NlcnMgZmlyZSBgY2xpY2tgIGV2ZW50cyB3aXRoIHRoZSBtaWRkbGUgYnV0dG9uLiBNb3N0IHdpbGwgZmlyZSBvbmx5IGBtb3VzZWRvd25gIGFuZCBgbW91c2V1cGAgZXZlbnRzLCB3aGljaCBjYW4gYmUgdXNlZCB0byBmb2N1cyBhIGNlbGwsIGJ1dCB3aWxsIG5vdCB3b3JrIHRvIGNhbGwgdGhlIGBvbkNlbGxDbGlja2VkYCBmdW5jdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgbW91c2Ugd2hlZWwgZXZlbnRzIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBicm93c2VyLiBVc2VmdWwgaWYgeW91ciBncmlkIGhhcyBubyB2ZXJ0aWNhbCBzY3JvbGxzIGFuZCB5b3Ugd2FudCB0aGUgbW91c2UgdG8gc2Nyb2xsIHRoZSBicm93c2VyIHBhZ2UuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRlbGwgdGhlIGdyaWQgaG93IHdpZGUgaW4gcGl4ZWxzIHRoZSBzY3JvbGxiYXIgaXMsIHdoaWNoIGlzIHVzZWQgaW4gZ3JpZCB3aWR0aCBjYWxjdWxhdGlvbnMuIFNldCBvbmx5IGlmIHVzaW5nIG5vbi1zdGFuZGFyZCBicm93c2VyLXByb3ZpZGVkIHNjcm9sbGJhcnMsIHNvIHRoZSBncmlkIGNhbiB1c2UgdGhlIG5vbi1zdGFuZGFyZCBzaXplIGluIGl0cyBjYWxjdWxhdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGxiYXJXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUeXBlIG9mIFJvdyBTZWxlY3Rpb246IGBzaW5nbGVgLCBgbXVsdGlwbGVgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U2VsZWN0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgbXVsdGlwbGUgcm93cyB0byBiZSBzZWxlY3RlZCB1c2luZyBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvd3Mgd2lsbCBub3QgYmUgZGVzZWxlY3RlZCBpZiB5b3UgaG9sZCBkb3duIGBDdHJsYCBhbmQgY2xpY2sgdGhlIHJvdyBvciBwcmVzcyBgU3BhY2VgLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvdyBzZWxlY3Rpb24gd29uJ3QgaGFwcGVuIHdoZW4gcm93cyBhcmUgY2xpY2tlZC4gVXNlIHdoZW4geW91IG9ubHkgd2FudCBjaGVja2JveCBzZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgY2VsbHMgd29uJ3QgYmUgc2VsZWN0YWJsZS4gVGhpcyBtZWFucyBjZWxscyB3aWxsIG5vdCBnZXQga2V5Ym9hcmQgZm9jdXMgd2hlbiB5b3UgY2xpY2sgb24gdGhlbS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIG9ubHkgYSBzaW5nbGUgcmFuZ2UgY2FuIGJlIHNlbGVjdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYmUgYWJsZSB0byBzZWxlY3QgdGhlIHRleHQgd2l0aGluIGNlbGxzLlxuICAgICAqIFxuICAgICAqICAgICAqKk5vdGU6KiogV2hlbiB0aGlzIGlzIHNldCB0byBgdHJ1ZWAsIHRoZSBjbGlwYm9hcmQgc2VydmljZSBpcyBkaXNhYmxlZC5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgUmFuZ2UgU2VsZWN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIFJhbmdlIEhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBGaWxsIEhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlRmlsbEhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAneCdgIHRvIGZvcmNlIHRoZSBmaWxsIGhhbmRsZSBkaXJlY3Rpb24gdG8gaG9yaXpvbnRhbCwgb3Igc2V0IHRvIGAneSdgIHRvIGZvcmNlIHRoZSBmaWxsIGhhbmRsZSBkaXJlY3Rpb24gdG8gdmVydGljYWwuIERlZmF1bHQ6IGB4eWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbGxIYW5kbGVEaXJlY3Rpb246IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHByZXZlbnQgY2VsbCB2YWx1ZXMgZnJvbSBiZWluZyBjbGVhcmVkIHdoZW4gdGhlIFJhbmdlIFNlbGVjdGlvbiBpcyByZWR1Y2VkIGJ5IHRoZSBGaWxsIEhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXJyYXkgZGVmaW5pbmcgdGhlIG9yZGVyIGluIHdoaWNoIHNvcnRpbmcgb2NjdXJzIChpZiBzb3J0aW5nIGlzIGVuYWJsZWQpLiBWYWx1ZXMgY2FuIGJlIGAnYXNjJ2AsIGAnZGVzYydgIG9yIGBudWxsYC4gRm9yIGV4YW1wbGU6IGBzb3J0aW5nT3JkZXI6IFsnYXNjJywgJ2Rlc2MnXWAuIERlZmF1bHQ6IGBbbnVsbCwgJ2FzYycsICdkZXNjJ11gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6IChzdHJpbmcgfCBudWxsKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNwZWNpZnkgdGhhdCB0aGUgc29ydCBzaG91bGQgdGFrZSBhY2NlbnRlZCBjaGFyYWN0ZXJzIGludG8gYWNjb3VudC4gSWYgdGhpcyBmZWF0dXJlIGlzIHR1cm5lZCBvbiB0aGUgc29ydCB3aWxsIGJlIHNsb3dlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlICdubyBzb3J0JyBpY29uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIG11bHRpLXNvcnQgd2hlbiB0aGUgdXNlciBzaGlmdC1jbGlja3MgYSBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnY3RybCdgIHRvIGhhdmUgbXVsdGkgc29ydGluZyB3b3JrIHVzaW5nIHRoZSBgQ3RybGAgKG9yIGBDb21tYW5kIOKMmGAgZm9yIE1hYykga2V5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbXVsdGlTb3J0S2V5OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydGluZyBvZiB1bi1zb3J0ZWQgZGF0YSB0byBtYXRjaCBvcmlnaW5hbCByb3cgZGF0YS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIHRvIHVzZSBpbnNpZGUgdGhlIGdyaWQgaW5zdGVhZCBvZiB0aGUgZ3JpZCdzIGRlZmF1bHQgaWNvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB8IHN0cmluZzsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGVmYXVsdCByb3cgaGVpZ2h0IGluIHBpeGVscy4gRGVmYXVsdDogYDI1YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93SGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBzdHlsZSBwcm9wZXJ0aWVzIHRvIGFwcGx5IHRvIGFsbCByb3dzLiBTZXQgdG8gYW4gb2JqZWN0IG9mIGtleSAoc3R5bGUgbmFtZXMpIGFuZCB2YWx1ZXMgKHN0eWxlIHZhbHVlcykgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlOiBSb3dTdHlsZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzKGVzKSBmb3IgYWxsIHJvd3MuIFByb3ZpZGUgZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSBvciBhcnJheSBvZiBzdHJpbmdzIChhcnJheSBvZiBjbGFzcyBuYW1lcykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJ1bGVzIHdoaWNoIGNhbiBiZSBhcHBsaWVkIHRvIGluY2x1ZGUgY2VydGFpbiBDU1MgY2xhc3Nlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXM6IFJvd0NsYXNzUnVsZXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IGhpZ2hsaWdodCByb3dzIGJ5IGFkZGluZyB0aGUgYGFnLXJvdy1ob3ZlcmAgQ1NTIGNsYXNzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0hvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBVc2VzIENTUyBgdG9wYCBpbnN0ZWFkIG9mIENTUyBgdHJhbnNmb3JtYCBmb3IgcG9zaXRpb25pbmcgcm93cy4gVXNlZnVsIGlmIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gaXMgY2F1c2luZyBpc3N1ZXMgc3VjaCBhcyB1c2VkIGluIHJvdyBzcGFubmluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGlnaGxpZ2h0IGNvbHVtbnMgYnkgYWRkaW5nIHRoZSBgYWctY29sdW1uLWhvdmVyYCBDU1MgY2xhc3MuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkhvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhRGlzcGxheVR5cGU6IFRyZWVEYXRhRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVGaWx0ZXJzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNQYXNzaXZlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgY29udGV4dCBtZW51LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q29udGV4dE1lbnVJdGVtczogR2V0Q29udGV4dE1lbnVJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRm9yIGN1c3RvbWlzaW5nIHRoZSBtYWluICdjb2x1bW4gaGVhZGVyJyBtZW51LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0TWFpbk1lbnVJdGVtczogR2V0TWFpbk1lbnVJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHVzZXIgdG8gcHJvY2VzcyBwb3B1cHMgYWZ0ZXIgdGhleSBhcmUgY3JlYXRlZC4gQXBwbGljYXRpb25zIGNhbiB1c2UgdGhpcyBpZiB0aGV5IHdhbnQgdG8sIGZvciBleGFtcGxlLCByZXBvc2l0aW9uIHRoZSBwb3B1cC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvc3RQcm9jZXNzUG9wdXA6ICgocGFyYW1zOiBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGNlbGxzIGZvciB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBgRGF0ZWAgb2JqZWN0cyB0aGF0IG5lZWQgdG8gaGF2ZSBhIHBhcnRpY3VsYXIgZm9ybWF0IGlmIGltcG9ydGluZyBpbnRvIEV4Y2VsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtcykgPT4gIGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBoZWFkZXIgdmFsdWVzIGZvciB0aGUgY2xpcGJvYXJkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXMpID0+ICBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgY2VsbHMgZnJvbSB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBudW1iZXIgZmllbGRzLCBhbmQgd2FudCB0byBibG9jayBub24tbnVtYmVycyBmcm9tIGdldHRpbmcgaW50byB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRnJvbUNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zKSA9PiAgYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBnZXQgdGhlIGRhdGEgdGhhdCB3b3VsZCBvdGhlcndpc2UgZ28gdG8gdGhlIGNsaXBib2FyZC4gVG8gYmUgdXNlZCB3aGVuIHlvdSB3YW50IHRvIGNvbnRyb2wgdGhlICdjb3B5IHRvIGNsaXBib2FyZCcgb3BlcmF0aW9uIHlvdXJzZWxmLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VuZFRvQ2xpcGJvYXJkOiAoKHBhcmFtczogU2VuZFRvQ2xpcGJvYXJkUGFyYW1zKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNvbXBsZXRlIGNvbnRyb2wgb2YgdGhlIHBhc3RlIG9wZXJhdGlvbiwgaW5jbHVkaW5nIGNhbmNlbGxpbmcgdGhlIG9wZXJhdGlvbiAoc28gbm90aGluZyBoYXBwZW5zKSBvciByZXBsYWNpbmcgdGhlIGRhdGEgd2l0aCBvdGhlciBkYXRhLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkUGFyYW1zKSA9PiBzdHJpbmdbXVtdIHwgbnVsbCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEdyaWQgY2FsbHMgdGhpcyBtZXRob2QgdG8ga25vdyBpZiBhbiBleHRlcm5hbCBmaWx0ZXIgaXMgcHJlc2VudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50OiAoKCkgPT4gIGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG91bGQgcmV0dXJuIGB0cnVlYCBpZiBleHRlcm5hbCBmaWx0ZXIgcGFzc2VzLCBvdGhlcndpc2UgYGZhbHNlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRvZXNFeHRlcm5hbEZpbHRlclBhc3M6ICgobm9kZTogUm93Tm9kZSkgPT4gIGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHRvIGN1c3RvbWlzZSB0aGUgY2hhcnQgdG9vbGJhciBpdGVtcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENoYXJ0VG9vbGJhckl0ZW1zOiBHZXRDaGFydFRvb2xiYXJJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gZW5hYmxlIGRpc3BsYXlpbmcgdGhlIGNoYXJ0IGluIGFuIGFsdGVybmF0aXZlIGNoYXJ0IGNvbnRhaW5lci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNyZWF0ZUNoYXJ0Q29udGFpbmVyOiAoKHBhcmFtczogQ2hhcnRSZWYpID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIG5hdmlnYXRpb24gKGFycm93KSBrZXkgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRIZWFkZXI6ICgocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtcykgPT4gSGVhZGVyUG9zaXRpb24pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRIZWFkZXI6ICgocGFyYW1zOiBUYWJUb05leHRIZWFkZXJQYXJhbXMpID0+IEhlYWRlclBvc2l0aW9uKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBuYXZpZ2F0aW9uIChhcnJvdykga2V5IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dENlbGw6ICgocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dENlbGxQYXJhbXMpID0+IENlbGxQb3NpdGlvbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgYFRhYmAga2V5IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRDZWxsOiAoKHBhcmFtczogVGFiVG9OZXh0Q2VsbFBhcmFtcykgPT4gQ2VsbFBvc2l0aW9uKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3MgdGhlIGdyaWQgdGFraW5nIGFjdGlvbiBmb3IgdGhlIHJlbGV2YW50IGtleWJvYXJkIGV2ZW50IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6ICgocGFyYW1zOiBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNhbGxiYWNrIGZvciBsb2NhbGlzaW5nIHRleHQgd2l0aGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlVGV4dEZ1bmM6ICgoa2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogc3RyaW5nKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB3aGF0IGBkb2N1bWVudGAgaXMgdXNlZC4gQ3VycmVudGx5IHVzZWQgYnkgRHJhZyBhbmQgRHJvcCAobWF5IGV4dGVuZCB0byBvdGhlciBwbGFjZXMgaW4gdGhlIGZ1dHVyZSkuIFVzZSB0aGlzIHdoZW4geW91IHdhbnQgdGhlIGdyaWQgdG8gdXNlIGEgZGlmZmVyZW50IGBkb2N1bWVudGAgdGhhbiB0aGUgb25lIGF2YWlsYWJsZSBvbiB0aGUgZ2xvYmFsIHNjb3BlLiBUaGlzIGNhbiBoYXBwZW4gaWYgZG9ja2luZyBvdXQgY29tcG9uZW50cyAoc29tZXRoaW5nIHdoaWNoIEVsZWN0cm9uIHN1cHBvcnRzKSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RG9jdW1lbnQ6ICgoKSA9PiBEb2N1bWVudCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB1c2VyIHRvIGZvcm1hdCB0aGUgbnVtYmVycyBpbiB0aGUgcGFnaW5hdGlvbiBwYW5lbCwgaS5lLiAncm93IGNvdW50JyBhbmQgJ3BhZ2UgbnVtYmVyJyBsYWJlbHMuIFRoaXMgaXMgZm9yIHBhZ2luYXRpb24gcGFuZWwgb25seSwgdG8gZm9ybWF0IG51bWJlcnMgaW5zaWRlIHRoZSBncmlkJ3MgY2VsbHMgKGkuZS4geW91ciBkYXRhKSwgdGhlbiB1c2UgYHZhbHVlRm9ybWF0dGVyYCBpbiB0aGUgY29sdW1uIGRlZmluaXRpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbk51bWJlckZvcm1hdHRlcjogKChwYXJhbXM6IFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXMpID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGZvciBncm91cGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93QWdnTm9kZXM6ICgobm9kZXM6IFJvd05vZGVbXSkgPT4gIGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIChDbGllbnQtc2lkZSBSb3cgTW9kZWwgb25seSkgQWxsb3dzIGdyb3VwcyB0byBiZSBvcGVuIGJ5IGRlZmF1bHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0dyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGRlZmF1bHQgc29ydGluZyBvZiBncm91cHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0R3JvdXBPcmRlckNvbXBhcmF0b3I6ICgobm9kZUE6IFJvd05vZGUsIG5vZGVCOiBSb3dOb2RlKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggcGl2b3RpbmcsIHRvIGFsbG93IGNoYW5naW5nIHRoZSBzZWNvbmQgY29sdW1uIGRlZmluaXRpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sRGVmOiAoKGNvbERlZjogQ29sRGVmKSA9PiAgdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBwaXZvdGluZywgdG8gYWxsb3cgY2hhbmdpbmcgdGhlIHNlY29uZCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xHcm91cERlZjogKChjb2xHcm91cERlZjogQ29sR3JvdXBEZWYpID0+ICB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aGVuIHdvcmtpbmcgd2l0aCBUcmVlIERhdGEgd2hlbiBgdHJlZURhdGEgPSB0cnVlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldERhdGFQYXRoOiBHZXREYXRhUGF0aCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZGVmYXVsdEdyb3VwT3JkZXJDb21wYXJhdG9yIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwU29ydENvbXBhcmF0b3I6ICgobm9kZUE6IFJvd05vZGUsIG5vZGVCOiBSb3dOb2RlKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgc2V0dGluZyB0aGUgY2hpbGQgY291bnQgZm9yIGEgZ3JvdXAgcm93LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hpbGRDb3VudDogKChkYXRhSXRlbTogYW55KSA9PiAgbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHByb3ZpZGluZyBkaWZmZXJlbnQgcGFyYW1zIGZvciBkaWZmZXJlbnQgbGV2ZWxzIG9mIGdyb3VwaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zOiAoKHBhcmFtczogR2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zUGFyYW1zKSA9PiBTZXJ2ZXJTaWRlU3RvcmVQYXJhbXMpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgZ3JvdXBzIHRvIGJlIG9wZW4gYnkgZGVmYXVsdC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjYW5jZWxsaW5nIHRyYW5zYWN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb246IElzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNTUk0gVHJlZSBEYXRhOiBBbGxvd3Mgc3BlY2lmeWluZyB3aGljaCByb3dzIGFyZSBleHBhbmRhYmxlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXA6IElzU2VydmVyU2lkZUdyb3VwIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTU1JNIFRyZWUgRGF0YTogQWxsb3dzIHNwZWNpZnlpbmcgZ3JvdXAga2V5cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cEtleTogR2V0U2VydmVyU2lkZUdyb3VwS2V5IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSZXR1cm4gYSBidXNpbmVzcyBrZXkgZm9yIHRoZSBub2RlLiBJZiBpbXBsZW1lbnRlZCwgZWFjaCByb3cgaW4gdGhlIERPTSB3aWxsIGhhdmUgYW4gYXR0cmlidXRlIGByb3ctaWQ9J2FiYydgIHdoZXJlIGBhYmNgIGlzIHdoYXQgeW91IHJldHVybiBhcyB0aGUgYnVzaW5lc3Mga2V5LlxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGZvciBhdXRvbWF0ZWQgdGVzdGluZywgYXMgaXQgcHJvdmlkZXMgYSB3YXkgZm9yIHlvdXIgdG9vbCB0byBpZGVudGlmeSByb3dzIGJhc2VkIG9uIHVuaXF1ZSBidXNpbmVzcyBrZXlzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0QnVzaW5lc3NLZXlGb3JOb2RlOiAoKG5vZGU6IFJvd05vZGUpID0+ICBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHNldCB0aGUgSUQgZm9yIGEgcGFydGljdWxhciByb3cgbm9kZSBiYXNlZCBvbiB0aGUgZGF0YS4gVXNlZnVsIGZvciBzZWxlY3Rpb24gYW5kIHNlcnZlciBzaWRlIHNvcnRpbmcgYW5kIGZpbHRlcmluZyBmb3IgcGFnaW5nIGFuZCB2aXJ0dWFsIHBhZ2luYXRpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dOb2RlSWQ6IEdldFJvd05vZGVJZEZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyByb3dzIGFmdGVyIHRoZXkgYXJlIGNyZWF0ZWQsIHNvIHlvdSBjYW4gZG8gZmluYWwgYWRkaW5nIG9mIGN1c3RvbSBhdHRyaWJ1dGVzIGV0Yy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NSb3dQb3N0Q3JlYXRlOiAoKHBhcmFtczogUHJvY2Vzc1Jvd1BhcmFtcykgPT4gIHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHRvIGRldGVybWluZSB3aGljaCByb3dzIGFyZSBzZWxlY3RhYmxlLiBCeSBkZWZhdWx0IHJvd3MgYXJlIHNlbGVjdGFibGUsIHNvIHJldHVybiBgZmFsc2VgIHRvIG1ha2UgYSByb3cgdW4tc2VsZWN0YWJsZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzUm93U2VsZWN0YWJsZTogSXNSb3dTZWxlY3RhYmxlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggTWFzdGVyIERldGFpbCB0byBkZXRlcm1pbmUgaWYgYSByb3cgc2hvdWxkIGJlIGEgbWFzdGVyIHJvdy4gSWYgYGZhbHNlYCBpcyByZXR1cm5lZCBubyBkZXRhaWwgcm93IHdpbGwgZXhpc3QgZm9yIHRoaXMgcm93LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dNYXN0ZXI6IElzUm93TWFzdGVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBmaWxsIHZhbHVlcyBpbnN0ZWFkIG9mIHNpbXBseSBjb3B5aW5nIHZhbHVlcyBvciBpbmNyZWFzaW5nIG51bWJlciB2YWx1ZXMgdXNpbmcgbGluZWFyIHByb2dyZXNzaW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbE9wZXJhdGlvbjogKChwYXJhbXM6IEZpbGxPcGVyYXRpb25QYXJhbXMpID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHBlcmZvcm0gYWRkaXRpb25hbCBzb3J0aW5nIGFmdGVyIHRoZSBncmlkIGhhcyBzb3J0ZWQgdGhlIHJvd3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0U29ydDogKChub2RlczogUm93Tm9kZVtdKSA9PiAgdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd1N0eWxlYCB0byBzZXQgc3R5bGUgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgQ1NTIHZhbHVlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd1N0eWxlOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXMpID0+IFJvd1N0eWxlKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdmVyc2lvbiBvZiBwcm9wZXJ0eSBgcm93Q2xhc3NgIHRvIHNldCBjbGFzcyhlcykgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBlaXRoZXIgYSBzdHJpbmcgKGNsYXNzIG5hbWUpLCBhcnJheSBvZiBzdHJpbmdzIChhcnJheSBvZiBjbGFzcyBuYW1lcykgb3IgdW5kZWZpbmVkIGZvciBubyBjbGFzcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0NsYXNzOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXMpID0+IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdmVyc2lvbiBvZiBwcm9wZXJ0eSBgcm93SGVpZ2h0YCB0byBzZXQgaGVpZ2h0IGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYSBwb3NpdGl2ZSBudW1iZXIgb2YgcGl4ZWxzLCBvciByZXR1cm4gYG51bGxgL2B1bmRlZmluZWRgIHRvIHVzZSB0aGUgZGVmYXVsdCByb3cgaGVpZ2h0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SGVpZ2h0OiAoKHBhcmFtczogUm93SGVpZ2h0UGFyYW1zKSA9PiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGVsbHMgdGhlIGdyaWQgaWYgdGhpcyByb3cgc2hvdWxkIGJlIHJlbmRlcmVkIGFzIGZ1bGwgd2lkdGguICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0Z1bGxXaWR0aENlbGw6ICgocm93Tm9kZTogUm93Tm9kZSkgPT4gIGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgLyoqIFRoZSB0b29sIHBhbmVsIHdhcyBoaWRkZW4gb3Igc2hvd24uIFVzZSBgYXBpLmlzVG9vbFBhbmVsU2hvd2luZygpYCB0byBnZXQgc3RhdHVzLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFBhc3RlIG9wZXJhdGlvbiBoYXMgc3RhcnRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZVN0YXJ0OiBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PigpO1xuICAgIC8qKiBQYXN0ZSBvcGVyYXRpb24gaGFzIGVuZGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlRW5kOiBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ+KCk7XG4gICAgLyoqIEEgY29sdW1uLCBvciBncm91cCBvZiBjb2x1bW5zLCB3YXMgaGlkZGVuIC8gc2hvd24uICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmlzaWJsZTogRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudD4oKTtcbiAgICAvKiogQSBjb2x1bW4sIG9yIGdyb3VwIG9mIGNvbHVtbnMsIHdhcyBwaW5uZWQgLyB1bnBpbm5lZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaW5uZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaW5uZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgcmVzaXplZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5SZXNpemVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgbW92ZWQuIFRvIGZpbmQgb3V0IHdoZW4gdGhlIGNvbHVtbiBtb3ZlIGlzIGZpbmlzaGVkIHlvdSBjYW4gdXNlIHRoZSBgZHJhZ1N0b3BwZWRgIGV2ZW50IGJlbG93LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbk1vdmVkRXZlbnQ+KCk7XG4gICAgLyoqIEEgdmFsdWUgY29sdW1uIHdhcyBhZGRlZCBvciByZW1vdmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBwaXZvdCBtb2RlIGZsYWcgd2FzIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RNb2RlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogQSBwaXZvdCBjb2x1bW4gd2FzIGFkZGVkLCByZW1vdmVkIG9yIG9yZGVyIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogQSBjb2x1bW4gZ3JvdXAgd2FzIG9wZW5lZCAvIGNsb3NlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PigpO1xuICAgIC8qKiBVc2VyIHNldCBuZXcgY29sdW1ucy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBuZXdDb2x1bW5zTG9hZGVkOiBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBncmlkIGNvbHVtbnMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBkaXNwbGF5ZWQgY29sdW1ucyBjaGFuZ2VkLiBUaGlzIGNhbiByZXN1bHQgZnJvbSBjb2x1bW5zIG9wZW4gLyBjbG9zZSwgY29sdW1uIG1vdmUsIHBpdm90LCBncm91cCwgZXRjLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIHJlbmRlcmVkIGNvbHVtbnMgY2hhbmdlZCAob25seSBjb2x1bW5zIGluIHRoZSB2aXNpYmxlIHNjcm9sbGVkIHZpZXdwb3J0IGFyZSByZW5kZXJlZCBieSBkZWZhdWx0KS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBTaG90Z3VuIC0gZ2V0cyBjYWxsZWQgd2hlbiBlaXRoZXIgYSkgbmV3IGNvbHVtbnMgYXJlIHNldCBvciBiKSBgY29sdW1uQXBpLnNldFN0YXRlKClgIGlzIHVzZWQsIHNvIGV2ZXJ5dGhpbmcgaGFzIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogT25seSB1c2VkIGJ5IEFuZ3VsYXIsIFJlYWN0IGFuZCBWdWVKUyBBRyBHcmlkIGNvbXBvbmVudHMgKG5vdCB1c2VkIGlmIGRvaW5nIHBsYWluIEphdmFTY3JpcHQgb3IgQW5ndWxhciAxLngpLlxuICAgICAqIElmIHRoZSBncmlkIHJlY2VpdmVzIGNoYW5nZXMgZHVlIHRvIGJvdW5kIHByb3BlcnRpZXMsIHRoaXMgZXZlbnQgZmlyZXMgYWZ0ZXIgdGhlIGdyaWQgaGFzIGZpbmlzaGVkIHByb2Nlc3NpbmcgdGhlIGNoYW5nZS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb21wb25lbnRTdGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBWYWx1ZSBoYXMgY2hhbmdlZCBhZnRlciBlZGl0aW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIEEgY2VsbCdzIHZhbHVlIHdpdGhpbiBhIHJvdyBoYXMgY2hhbmdlZC4gVGhpcyBldmVudCBjb3JyZXNwb25kcyB0byBGdWxsIFJvdyBFZGl0aW5nIG9ubHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93VmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Um93VmFsdWVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogRWRpdGluZyBhIGNlbGwgaGFzIHN0YXJ0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdGFydGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudD4oKTtcbiAgICAvKiogRWRpdGluZyBhIGNlbGwgaGFzIHN0b3BwZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudD4oKTtcbiAgICAvKiogRWRpdGluZyBhIHJvdyBoYXMgc3RhcnRlZCAod2hlbiByb3cgZWRpdGluZyBpcyBlbmFibGVkKS4gV2hlbiByb3cgZWRpdGluZywgdGhpcyBldmVudCB3aWxsIGJlIGZpcmVkIG9uY2UgYW5kIGBjZWxsRWRpdGluZ1N0YXJ0ZWRgIHdpbGwgYmUgZmlyZWQgZm9yIGVhY2ggaW5kaXZpZHVhbCBjZWxsLiBUaGlzIGV2ZW50IGNvcnJlc3BvbmRzIHRvIEZ1bGwgUm93IEVkaXRpbmcgb25seS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdG9wcGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RvcHBlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIFRoaXMgZXZlbnQgY29ycmVzcG9uZHMgdG8gRnVsbCBSb3cgRWRpdGluZyBvbmx5LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQ+KCk7XG4gICAgLyoqIEZpbHRlciBoYXMgYmVlbiBvcGVuZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyT3BlbmVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJPcGVuZWRFdmVudD4oKTtcbiAgICAvKiogRmlsdGVyIGhhcyBiZWVuIG1vZGlmaWVkIGFuZCBhcHBsaWVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlckNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIEZpbHRlciB3YXMgbW9kaWZpZWQgYnV0IG5vdCBhcHBsaWVkLiBVc2VkIHdoZW4gZmlsdGVycyBoYXZlICdBcHBseScgYnV0dG9ucy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJNb2RpZmllZDogRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGNyZWF0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRDcmVhdGVkOiBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPigpO1xuICAgIC8qKiBUaGUgZGF0YSByYW5nZSBmb3IgdGhlIGNoYXJ0IGhhcyBiZWVuIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPigpO1xuICAgIC8qKiBGb3JtYXR0aW5nIGNoYW5nZXMgaGF2ZSBiZWVuIG1hZGUgYnkgdXNlcnMgdGhyb3VnaCB0aGUgRm9ybWF0IFBhbmVsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0T3B0aW9uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRPcHRpb25zQ2hhbmdlZD4oKTtcbiAgICAvKiogQSBjaGFydCBoYXMgYmVlbiBkZXN0cm95ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnREZXN0cm95ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZD4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPigpO1xuICAgIC8qKiBET00gZXZlbnQgYGtleURvd25gIGhhcHBlbmVkIG9uIGEgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5RG93bjogRXZlbnRFbWl0dGVyPENlbGxLZXlEb3duRXZlbnQgfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5UHJlc3NgIGhhcHBlbmVkIG9uIGEgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5UHJlc3M6IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEtleVByZXNzRXZlbnQgfCBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudD4oKTtcbiAgICAvKiogVGhlIGdyaWQgaGFzIGluaXRpYWxpc2VkLiBVc2UgdGhpcyBldmVudCBpZiwgZm9yIGV4YW1wbGUsIHlvdSBuZWVkIHRvIHVzZSB0aGUgZ3JpZCdzIEFQSSB0byBmaXggdGhlIGNvbHVtbnMgdG8gc2l6ZS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUmVhZHk6IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRSZWFkeUV2ZW50PigpO1xuICAgIC8qKiBGaXJlZCB0aGUgZmlyc3QgdGltZSBkYXRhIGlzIHJlbmRlcmVkIGludG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlyc3REYXRhUmVuZGVyZWQ6IEV2ZW50RW1pdHRlcjxGaXJzdERhdGFSZW5kZXJlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudD4oKTtcbiAgICAvKiogVGhlIHNpemUgb2YgdGhlIGdyaWQgYGRpdmAgaGFzIGNoYW5nZWQuIEluIG90aGVyIHdvcmRzLCB0aGUgZ3JpZCB3YXMgcmVzaXplZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRTaXplQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBEaXNwbGF5ZWQgcm93cyBoYXZlIGNoYW5nZWQuIFRyaWdnZXJlZCBhZnRlciBzb3J0LCBmaWx0ZXIgb3IgdHJlZSBleHBhbmQgLyBjb2xsYXBzZSBldmVudHMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW9kZWxVcGRhdGVkOiBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudD4oKTtcbiAgICAvKiogQSByb3cgd2FzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLCBmb3IgYW55IHJlYXNvbi4gVXNlIHRvIGNsZWFuIHVwIHJlc291cmNlcyAoaWYgYW55KSB1c2VkIGJ5IHRoZSByb3cuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbFJvd1JlbW92ZWQ6IEV2ZW50RW1pdHRlcjxWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudD4oKTtcbiAgICAvKiogV2hpY2ggcm93cyBhcmUgcmVuZGVyZWQgaW4gdGhlIERPTSBoYXMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aWV3cG9ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFZpZXdwb3J0Q2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBUaGUgYm9keSB3YXMgc2Nyb2xsZWQgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudD4oKTtcbiAgICAvKiogTWFpbiBib2R5IG9mIHRoZSBncmlkIGhhcyBzdG9wcGVkIHNjcm9sbGluZywgZWl0aGVyIGhvcml6b250YWxseSBvciB2ZXJ0aWNhbGx5LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGJvZHlTY3JvbGxFbmQ6IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRW5kRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRW5kRXZlbnQ+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RhcnRzLiBUaGlzIGNvdWxkIGJlIGFueSBhY3Rpb24gdGhhdCB1c2VzIHRoZSBncmlkJ3MgRHJhZyBhbmQgRHJvcCBzZXJ2aWNlLCBlLmcuIENvbHVtbiBNb3ZpbmcsIENvbHVtbiBSZXNpemluZywgUmFuZ2UgU2VsZWN0aW9uLCBGaWxsIEhhbmRsZSwgZXRjLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdGFydGVkOiBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPERyYWdTdGFydGVkRXZlbnQ+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RvcHMuIFRoaXMgY291bGQgYmUgYW55IGFjdGlvbiB0aGF0IHVzZXMgdGhlIGdyaWQncyBEcmFnIGFuZCBEcm9wIHNlcnZpY2UsIGUuZy4gQ29sdW1uIE1vdmluZywgQ29sdW1uIFJlc2l6aW5nLCBSYW5nZSBTZWxlY3Rpb24sIEZpbGwgSGFuZGxlLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0b3BwZWRFdmVudD4oKTtcbiAgICAvKiogVHJpZ2dlcmVkIGV2ZXJ5IHRpbWUgdGhlIHBhZ2luZyBzdGF0ZSBjaGFuZ2VzLiBTb21lIG9mIHRoZSBtb3N0IGNvbW1vbiBzY2VuYXJpb3MgZm9yIHRoaXMgZXZlbnQgdG8gYmUgdHJpZ2dlcmVkIGFyZTpcbiAgICAgKiBcbiAgICAgKiAgIC0gVGhlIHBhZ2Ugc2l6ZSBjaGFuZ2VzLlxuICAgICAqICAgLSBUaGUgY3VycmVudCBzaG93biBwYWdlIGlzIGNoYW5nZWQuXG4gICAgICogICAtIE5ldyBkYXRhIGlzIGxvYWRlZCBvbnRvIHRoZSBncmlkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhZ2luYXRpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UGFnaW5hdGlvbkNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIEEgZHJhZyBoYXMgc3RhcnRlZCwgb3IgZHJhZ2dpbmcgd2FzIGFscmVhZHkgc3RhcnRlZCBhbmQgdGhlIG1vdXNlIGhhcyByZS1lbnRlcmVkIHRoZSBncmlkIGhhdmluZyBwcmV2aW91c2x5IGxlZnQgdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VudGVyOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PigpO1xuICAgIC8qKiBUaGUgbW91c2UgaGFzIG1vdmVkIHdoaWxlIGRyYWdnaW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdNb3ZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PigpO1xuICAgIC8qKiBUaGUgbW91c2UgaGFzIGxlZnQgdGhlIGdyaWQgd2hpbGUgZHJhZ2dpbmcuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0xlYXZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PigpO1xuICAgIC8qKiBUaGUgZHJhZyBoYXMgZmluaXNoZWQgb3ZlciB0aGUgZ3JpZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW5kOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PigpO1xuICAgIC8qKiBBIHJvdyBncm91cCBjb2x1bW4gd2FzIGFkZGVkIG9yIHJlbW92ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogQSByb3cgZ3JvdXAgd2FzIG9wZW5lZCBvciBjbG9zZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93R3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93R3JvdXBPcGVuZWRFdmVudD4oKTtcbiAgICAvKiogRmlyZWQgd2hlbiBjYWxsaW5nIGVpdGhlciBvZiB0aGUgQVBJIG1ldGhvZHMgYGV4cGFuZEFsbCgpYCBvciBgY29sbGFwc2VBbGwoKWAuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZXhwYW5kT3JDb2xsYXBzZUFsbDogRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxFeHBhbmRDb2xsYXBzZUFsbEV2ZW50PigpO1xuICAgIC8qKiBUaGUgY2xpZW50IGhhcyBzZXQgbmV3IHBpbm5lZCByb3cgZGF0YSBpbnRvIHRoZSBncmlkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBpbm5lZFJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBjbGllbnQgaGFzIHNldCBuZXcgZGF0YSBpbnRvIHRoZSBncmlkIHVzaW5nIGBhcGkuc2V0Um93RGF0YSgpYCBvciBieSBjaGFuZ2luZyB0aGUgYHJvd0RhdGFgIGJvdW5kIHByb3BlcnR5LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Um93RGF0YUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RhdGFDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBjbGllbnQgaGFzIHVwZGF0ZWQgZGF0YSBmb3IgdGhlIGdyaWQgdXNpbmcgYGFwaS5hcHBseVRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uKWAgb3IgYnkgY2hhbmdpbmcgdGhlIGByb3dEYXRhYCBib3VuZCBwcm9wZXJ0eSB3aXRoIGBpbW11dGFibGVEYXRhPXRydWVgLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFVcGRhdGVkOiBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ+KCk7XG4gICAgLyoqIEFzeW5jIHRyYW5zYWN0aW9ucyBoYXZlIGJlZW4gYXBwbGllZC4gQ29udGFpbnMgYSBsaXN0IG9mIGFsbCB0cmFuc2FjdGlvbiByZXN1bHRzLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDogRXZlbnRFbWl0dGVyPEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZD4gPSBuZXcgRXZlbnRFbWl0dGVyPEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZD4oKTtcbiAgICAvKiogQ2VsbCBpcyBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDbGlja2VkOiBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxDbGlja2VkRXZlbnQ+KCk7XG4gICAgLyoqIENlbGwgaXMgZG91YmxlIGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbERvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbERvdWJsZUNsaWNrZWRFdmVudD4oKTtcbiAgICAvKiogQ2VsbCBpcyBmb2N1c2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxGb2N1c2VkOiBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ+KCk7XG4gICAgLyoqIE1vdXNlIGVudGVyZWQgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3ZlckV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3ZlckV2ZW50PigpO1xuICAgIC8qKiBNb3VzZSBsZWZ0IGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3V0OiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3V0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudD4oKTtcbiAgICAvKiogTW91c2UgZG93biBvbiBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZURvd246IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VEb3duRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VEb3duRXZlbnQ+KCk7XG4gICAgLyoqIFJvdyBpcyBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ+KCk7XG4gICAgLyoqIFJvdyBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PigpO1xuICAgIC8qKiBSb3cgaXMgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC4gVGhlIGV2ZW50IGNvbnRhaW5zIHRoZSBub2RlIGluIHF1ZXN0aW9uLCBzbyBjYWxsIHRoZSBub2RlJ3MgYGlzU2VsZWN0ZWQoKWAgbWV0aG9kIHRvIHNlZSBpZiBpdCB3YXMganVzdCBzZWxlY3RlZCBvciBkZXNlbGVjdGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1NlbGVjdGVkOiBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ+KCk7XG4gICAgLyoqIFJvdyBzZWxlY3Rpb24gaXMgY2hhbmdlZC4gVXNlIHRoZSBncmlkIEFQSSBgZ2V0U2VsZWN0ZWROb2RlcygpYCB0byBnZXQgdGhlIG5ldyBsaXN0IG9mIHNlbGVjdGVkIG5vZGVzLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIENlbGwgaXMgcmlnaHQgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxDb250ZXh0TWVudUV2ZW50PigpO1xuICAgIC8qKiBBIGNoYW5nZSB0byByYW5nZSBzZWxlY3Rpb24gaGFzIG9jY3VycmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFNvcnQgaGFzIGNoYW5nZWQuIFRoZSBncmlkIGFsc28gbGlzdGVucyBmb3IgdGhpcyBhbmQgdXBkYXRlcyB0aGUgbW9kZWwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc29ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8U29ydENoYW5nZWRFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQ+KCk7XG5cblxuICAgIC8vIEVuYWJsZSB0eXBlIGNvZXJjaW9uIGZvciBib29sZWFuIElucHV0cyB0byBzdXBwb3J0IHVzZSBsaWtlICdlbmFibGVDaGFydHMnIGluc3RlYWQgb2YgZm9yY2luZyAnW2VuYWJsZUNoYXJ0c109XCJ0cnVlXCInIFxuICAgIC8vIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS90ZW1wbGF0ZS10eXBlY2hlY2sjaW5wdXQtc2V0dGVyLWNvZXJjaW9uIFxuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01ha2VDb2x1bW5WaXNpYmxlQWZ0ZXJVbkdyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NlbGxTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVidWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbmd1bGFyQ29tcGlsZVJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FuZ3VsYXJDb21waWxlRmlsdGVyczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEluY2x1ZGVGb290ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwSW5jbHVkZVRvdGFsRm9vdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFVzZUVudGlyZVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91blNvcnRJY29uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc05vUm93c092ZXJsYXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWx0YVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVtZW1iZXJHcm91cFN0YXRlV2hlbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90TW9kZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dGdW5jSW5IZWFkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uVmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWdnQXRSb290TGV2ZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRm9jdXNBZnRlclJlZnJlc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Z1bmN0aW9uc1Bhc3NpdmU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Z1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbmltYXRlUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTZWxlY3RzRmlsdGVyZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwUmVtb3ZlTG93ZXN0U2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJ0bDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlja0VkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdFbnRpcmVSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdNYW5hZ2VkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0RyYWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ011bHRpUm93OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVwcmVjYXRlZEVtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQYWdpbmF0aW9uUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Zsb2F0aW5nRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEhpZGVPcGVuUGFyZW50czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBNdWx0aUF1dG9Db2x1bW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2luYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N0b3BFZGl0aW5nV2hlbkdyaWRMb3Nlc0ZvY3VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Njcm9sbE9uTmV3RGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTY3JvbGxXaGVuUG9wdXBzQXJlT3BlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcHVyZ2VDbG9zZWRSb3dOb2RlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2FjaGVRdWlja0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVsdGFSb3dEYXRhTW9kZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5zdXJlRG9tT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FjY2VudGVkU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlQ2FjaGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlQ2FjaGVOZXZlckV4cGlyZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FnZ3JlZ2F0ZU9ubHlDaGFuZ2VkQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDc3ZFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3RyZWVEYXRhOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXN0ZXJEZXRhaWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW50ZXJNb3Zlc0Rvd25BZnRlckVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTW92ZXNEb3duOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Byb3BlcnR5TmFtZXNDaGVjazogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRW50ZXJwcmlzZVJlc2V0T25OZXdDb2x1bW5zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVPbGRTZXRGaWx0ZXJNb2RlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0aW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1NldENvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDaGFydHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlbHRhQ29sdW1uTW9kZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9leGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Rvb2x0aXBNb3VzZVRyYWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9rZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2ltbXV0YWJsZURhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2ltbXV0YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXBwbHlDb2x1bW5EZWZPcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGV0YWlsUm93QXV0b0hlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUZpbHRlcmluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Nob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVhY3RVaTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICAvLyBARU5EQFxufVxuXG4iXX0=