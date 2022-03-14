import { __decorate, __metadata } from "tslib";
import { AfterViewInit, Component, ComponentFactoryResolver, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Grid, AgPromise } from "ag-grid-community";
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
        /** Specify the delimiter to use when copying to clipboard.
         * Default: `\t`     */
        this.clipboardDelimiter = undefined;
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
        /** @deprecated Use getRowId instead - however be aware, getRowId() will also set grid option immutableData=true
    Allows you to set the ID for a particular row node based on the data.
         */
        this.getRowNodeId = undefined;
        /** Allows you to set the ID for a particular row based on the data.     */
        this.getRowId = undefined;
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
        /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
         * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.     */
        this.componentStateChanged = new EventEmitter();
        /** Value has changed after editing. This event will not fire if editing was cancelled (eg ESC was pressed).     */
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
    __metadata("design:type", Number)
], AgGridAngular.prototype, "tooltipHideDelay", void 0);
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
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "copyGroupHeadersToClipboard", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], AgGridAngular.prototype, "clipboardDelimiter", void 0);
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
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "reactUi", void 0);
__decorate([
    Input(),
    __metadata("design:type", Boolean)
], AgGridAngular.prototype, "suppressReactUi", void 0);
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
], AgGridAngular.prototype, "readOnlyEdit", void 0);
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
], AgGridAngular.prototype, "suppressRowVirtualisation", void 0);
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
], AgGridAngular.prototype, "suppressCellFocus", void 0);
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
], AgGridAngular.prototype, "processGroupHeaderForClipboard", void 0);
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
], AgGridAngular.prototype, "getRowId", void 0);
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
export { AgGridAngular };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FnLWdyaWQtYW5ndWxhci8iLCJzb3VyY2VzIjpbImxpYi9hZy1ncmlkLWFuZ3VsYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsYUFBYSxFQUNiLFNBQVMsRUFDVCx3QkFBd0IsRUFDeEIsZUFBZSxFQUNmLFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUNMLE1BQU0sRUFDTixTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNwQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBR0gsYUFBYSxFQUNiLElBQUksRUFLSixTQUFTLEVBbUlaLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDeEUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDdEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBWTFELElBQWEsYUFBYSxHQUExQixNQUFhLGFBQWE7SUFrQnRCLFlBQVksVUFBc0IsRUFDdEIsZ0JBQWtDLEVBQ2xDLHlCQUFvRCxFQUNwRCx5QkFBMkQsRUFDM0Qsd0JBQWtEO1FBSGxELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBQzNELDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFsQnRELGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFJM0IsMERBQTBEO1FBQ2xELGdCQUFXLEdBQXVCLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFpSGxFLFVBQVU7UUFDVix3RUFBd0U7UUFDeEQsY0FBUyxHQUFvRCxTQUFT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aXQsXG4gICAgQ29tcG9uZW50LFxuICAgIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBDb250ZW50Q2hpbGRyZW4sXG4gICAgRWxlbWVudFJlZixcbiAgICBFdmVudEVtaXR0ZXIsXG4gICAgSW5wdXQsXG4gICAgT3V0cHV0LFxuICAgIFF1ZXJ5TGlzdCxcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxuICAgIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmltcG9ydCB7XG4gICAgQ29sRGVmLFxuICAgIENvbHVtbkFwaSxcbiAgICBDb21wb25lbnRVdGlsLFxuICAgIEdyaWQsXG4gICAgR3JpZEFwaSxcbiAgICBHcmlkT3B0aW9ucyxcbiAgICBHcmlkUGFyYW1zLFxuICAgIE1vZHVsZSxcbiAgICBBZ1Byb21pc2UsXG4gICAgQ29sR3JvdXBEZWYsXG4gICAgRXhjZWxTdHlsZSxcbiAgICBJRGF0YXNvdXJjZSxcbiAgICBJU2VydmVyU2lkZURhdGFzb3VyY2UsXG4gICAgSVZpZXdwb3J0RGF0YXNvdXJjZSxcbiAgICBJQWdnRnVuYyxcbiAgICBDc3ZFeHBvcnRQYXJhbXMsXG4gICAgRXhjZWxFeHBvcnRQYXJhbXMsXG4gICAgU3RhdHVzUGFuZWxEZWYsXG4gICAgU2lkZUJhckRlZixcbiAgICBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMsXG4gICAgQWdDaGFydFRoZW1lLFxuICAgIFNlcnZlclNpZGVTdG9yZVR5cGUsXG4gICAgUm93R3JvdXBpbmdEaXNwbGF5VHlwZSxcbiAgICBJQ2VsbFJlbmRlcmVyQ29tcCxcbiAgICBJQ2VsbFJlbmRlcmVyRnVuYyxcbiAgICBHZXRDb250ZXh0TWVudUl0ZW1zLFxuICAgIEdldE1haW5NZW51SXRlbXMsXG4gICAgR2V0Um93Tm9kZUlkRnVuYyxcbiAgICBHZXRSb3dJZEZ1bmMsXG4gICAgR2V0Um93SWRQYXJhbXMsXG4gICAgTmF2aWdhdGVUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgSGVhZGVyUG9zaXRpb24sXG4gICAgVGFiVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBDZWxsUG9zaXRpb24sXG4gICAgVGFiVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zLFxuICAgIEdldERhdGFQYXRoLFxuICAgIElDZWxsUmVuZGVyZXIsXG4gICAgSUxvYWRpbmdPdmVybGF5Q29tcCxcbiAgICBJTm9Sb3dzT3ZlcmxheUNvbXAsXG4gICAgUm93Tm9kZSxcbiAgICBJc1Jvd01hc3RlcixcbiAgICBJc1Jvd1NlbGVjdGFibGUsXG4gICAgUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtcyxcbiAgICBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXMsXG4gICAgR2V0U2VydmVyU2lkZUdyb3VwS2V5LFxuICAgIElzU2VydmVyU2lkZUdyb3VwLFxuICAgIFN1cHByZXNzS2V5Ym9hcmRFdmVudFBhcmFtcyxcbiAgICBDaGFydFJlZixcbiAgICBHZXRDaGFydFRvb2xiYXJJdGVtcyxcbiAgICBGaWxsT3BlcmF0aW9uUGFyYW1zLFxuICAgIElzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb24sXG4gICAgR2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zUGFyYW1zLFxuICAgIFNlcnZlclNpZGVTdG9yZVBhcmFtcyxcbiAgICBJc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMsXG4gICAgSXNHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMsXG4gICAgQ29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudCxcbiAgICBOZXdDb2x1bW5zTG9hZGVkRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50LFxuICAgIEV4cGFuZENvbGxhcHNlQWxsRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQsXG4gICAgR3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uTW92ZWRFdmVudCxcbiAgICBDb2x1bW5WaXNpYmxlRXZlbnQsXG4gICAgQ29sdW1uUGlubmVkRXZlbnQsXG4gICAgQ29sdW1uR3JvdXBPcGVuZWRFdmVudCxcbiAgICBDb2x1bW5SZXNpemVkRXZlbnQsXG4gICAgRGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQsXG4gICAgUm93R3JvdXBPcGVuZWRFdmVudCxcbiAgICBSb3dEYXRhQ2hhbmdlZEV2ZW50LFxuICAgIFJvd0RhdGFVcGRhdGVkRXZlbnQsXG4gICAgUGlubmVkUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDaGFydENyZWF0ZWQsXG4gICAgQ2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQsXG4gICAgQ2hhcnRPcHRpb25zQ2hhbmdlZCxcbiAgICBDaGFydERlc3Ryb3llZCxcbiAgICBUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50LFxuICAgIE1vZGVsVXBkYXRlZEV2ZW50LFxuICAgIFBhc3RlU3RhcnRFdmVudCxcbiAgICBQYXN0ZUVuZEV2ZW50LFxuICAgIENlbGxDbGlja2VkRXZlbnQsXG4gICAgQ2VsbERvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBDZWxsTW91c2VEb3duRXZlbnQsXG4gICAgQ2VsbENvbnRleHRNZW51RXZlbnQsXG4gICAgQ2VsbFZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIFJvd1ZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENlbGxGb2N1c2VkRXZlbnQsXG4gICAgUm93U2VsZWN0ZWRFdmVudCxcbiAgICBTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgQ2VsbEtleURvd25FdmVudCxcbiAgICBDZWxsS2V5UHJlc3NFdmVudCxcbiAgICBDZWxsTW91c2VPdmVyRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3V0RXZlbnQsXG4gICAgRmlsdGVyQ2hhbmdlZEV2ZW50LFxuICAgIEZpbHRlck1vZGlmaWVkRXZlbnQsXG4gICAgRmlsdGVyT3BlbmVkRXZlbnQsXG4gICAgU29ydENoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50LFxuICAgIFJvd0NsaWNrZWRFdmVudCxcbiAgICBSb3dEb3VibGVDbGlja2VkRXZlbnQsXG4gICAgR3JpZFJlYWR5RXZlbnQsXG4gICAgR3JpZFNpemVDaGFuZ2VkRXZlbnQsXG4gICAgVmlld3BvcnRDaGFuZ2VkRXZlbnQsXG4gICAgRmlyc3REYXRhUmVuZGVyZWRFdmVudCxcbiAgICBEcmFnU3RhcnRlZEV2ZW50LFxuICAgIERyYWdTdG9wcGVkRXZlbnQsXG4gICAgUm93RWRpdGluZ1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIENlbGxFZGl0UmVxdWVzdEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIEJvZHlTY3JvbGxFdmVudCxcbiAgICBCb2R5U2Nyb2xsRW5kRXZlbnQsXG4gICAgUGFnaW5hdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudCxcbiAgICBSb3dEcmFnRXZlbnQsXG4gICAgQ29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBQcm9jZXNzUm93UGFyYW1zLFxuICAgIFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0dyb3VwSGVhZGVyRm9yRXhwb3J0UGFyYW1zLFxuICAgIFJvd1N0eWxlLFxuICAgIFJvd0NsYXNzUnVsZXMsXG4gICAgUm93Q2xhc3NQYXJhbXMsXG4gICAgUm93SGVpZ2h0UGFyYW1zLFxuICAgIFNlbmRUb0NsaXBib2FyZFBhcmFtcyxcbiAgICBUcmVlRGF0YURpc3BsYXlUeXBlLFxuICAgIEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQsXG4gICAgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnQsXG4gICAgTG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yRnVuY1xufSBmcm9tIFwiYWctZ3JpZC1jb21tdW5pdHlcIjtcblxuaW1wb3J0IHsgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyB9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXNcIjtcbmltcG9ydCB7IEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyIH0gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcIjtcbmltcG9ydCB7IEFnR3JpZENvbHVtbiB9IGZyb20gXCIuL2FnLWdyaWQtY29sdW1uLmNvbXBvbmVudFwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtYW5ndWxhcicsXG4gICAgdGVtcGxhdGU6ICcnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgIF0sXG4gICAgLy8gdGVsbCBhbmd1bGFyIHdlIGRvbid0IHdhbnQgdmlldyBlbmNhcHN1bGF0aW9uLCB3ZSBkb24ndCB3YW50IGEgc2hhZG93IHJvb3RcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZEFuZ3VsYXIgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICAvLyBub3QgaW50ZW5kZWQgZm9yIHVzZXIgdG8gaW50ZXJhY3Qgd2l0aC4gc28gcHV0dGluZyBfIGluIHNvIGlmIHVzZXIgZ2V0cyByZWZlcmVuY2VcbiAgICAvLyB0byB0aGlzIG9iamVjdCwgdGhleSBraW5kJ2Ega25vdyBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBhZ3JlZWQgaW50ZXJmYWNlXG4gICAgcHJpdmF0ZSBfbmF0aXZlRWxlbWVudDogYW55O1xuICAgIHByaXZhdGUgX2luaXRpYWxpc2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGdyaWRQYXJhbXM6IEdyaWRQYXJhbXM7XG5cbiAgICAvLyBpbiBvcmRlciB0byBlbnN1cmUgZmlyaW5nIG9mIGdyaWRSZWFkeSBpcyBkZXRlcm1pbmlzdGljXG4gICAgcHJpdmF0ZSBfZnVsbHlSZWFkeTogQWdQcm9taXNlPGJvb2xlYW4+ID0gQWdQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAvLyBtYWtpbmcgdGhlc2UgcHVibGljLCBzbyB0aGV5IGFyZSBhY2Nlc3NpYmxlIHRvIHBlb3BsZSB1c2luZyB0aGUgbmcyIGNvbXBvbmVudCByZWZlcmVuY2VzXG4gICAgcHVibGljIGFwaTogR3JpZEFwaTtcbiAgICBwdWJsaWMgY29sdW1uQXBpOiBDb2x1bW5BcGk7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKEFnR3JpZENvbHVtbikgcHVibGljIGNvbHVtbnM6IFF1ZXJ5TGlzdDxBZ0dyaWRDb2x1bW4+O1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudERlZjogRWxlbWVudFJlZixcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICBwcml2YXRlIGFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXM6IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIHByaXZhdGUgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIsXG4gICAgICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpIHtcbiAgICAgICAgdGhpcy5fbmF0aXZlRWxlbWVudCA9IGVsZW1lbnREZWYubmF0aXZlRWxlbWVudDtcblxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldFZpZXdDb250YWluZXJSZWYodGhpcy52aWV3Q29udGFpbmVyUmVmKTtcbiAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcih0aGlzLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgIHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5zZXRFbWl0dGVyVXNlZENhbGxiYWNrKHRoaXMuaXNFbWl0dGVyVXNlZC5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zID0gQ29tcG9uZW50VXRpbC5jb3B5QXR0cmlidXRlc1RvR3JpZE9wdGlvbnModGhpcy5ncmlkT3B0aW9ucywgdGhpcywgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5ncmlkUGFyYW1zID0ge1xuICAgICAgICAgICAgZ2xvYmFsRXZlbnRMaXN0ZW5lcjogdGhpcy5nbG9iYWxFdmVudExpc3RlbmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICBmcmFtZXdvcmtPdmVycmlkZXM6IHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgICAgIHByb3ZpZGVkQmVhbkluc3RhbmNlczoge1xuICAgICAgICAgICAgICAgIGZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXI6IHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZHVsZXM6ICh0aGlzLm1vZHVsZXMgfHwgW10pIGFzIGFueVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLmNvbHVtbnMgJiYgdGhpcy5jb2x1bW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uRGVmcyA9IHRoaXMuY29sdW1uc1xuICAgICAgICAgICAgICAgIC5tYXAoKGNvbHVtbjogQWdHcmlkQ29sdW1uKTogQ29sRGVmID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbi50b0NvbERlZigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3IEdyaWQodGhpcy5fbmF0aXZlRWxlbWVudCwgdGhpcy5ncmlkT3B0aW9ucywgdGhpcy5ncmlkUGFyYW1zKTtcblxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5hcGkpIHtcbiAgICAgICAgICAgIHRoaXMuYXBpID0gdGhpcy5ncmlkT3B0aW9ucy5hcGk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5BcGkpIHtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uQXBpID0gdGhpcy5ncmlkT3B0aW9ucy5jb2x1bW5BcGk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gc29tZXRpbWVzLCBlc3BlY2lhbGx5IGluIGxhcmdlIGNsaWVudCBhcHBzIGdyaWRSZWFkeSBjYW4gZmlyZSBiZWZvcmUgbmdBZnRlclZpZXdJbml0XG4gICAgICAgIC8vIHRoaXMgdGllcyB0aGVzZSB0b2dldGhlciBzbyB0aGF0IGdyaWRSZWFkeSB3aWxsIGFsd2F5cyBmaXJlIGFmdGVyIGFnR3JpZEFuZ3VsYXIncyBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhlIGFjdHVhbCBjb250YWluaW5nIGNvbXBvbmVudCdzIG5nQWZ0ZXJWaWV3SW5pdCB3aWxsIGZpcmUganVzdCBhZnRlciBhZ0dyaWRBbmd1bGFyJ3NcbiAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS5yZXNvbHZlTm93KG51bGwsIHJlc29sdmUgPT4gcmVzb2x2ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIENvbXBvbmVudFV0aWwucHJvY2Vzc09uQ2hhbmdlKGNoYW5nZXMsIHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMuYXBpLCB0aGlzLmNvbHVtbkFwaSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgLy8gbmVlZCB0byBkbyB0aGlzIGJlZm9yZSB0aGUgZGVzdHJveSwgc28gd2Uga25vdyBub3QgdG8gZW1pdCBhbnkgZXZlbnRzXG4gICAgICAgICAgICAvLyB3aGlsZSB0ZWFyaW5nIGRvd24gdGhlIGdyaWQuXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuYXBpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcGkuZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2UnbGwgZW1pdCB0aGUgZW1pdCBpZiBhIHVzZXIgaXMgbGlzdGVuaW5nIGZvciBhIGdpdmVuIGV2ZW50IGVpdGhlciBvbiB0aGUgY29tcG9uZW50IHZpYSBub3JtYWwgYW5ndWxhciBiaW5kaW5nXG4gICAgLy8gb3IgdmlhIGdyaWRPcHRpb25zXG4gICAgcHJvdGVjdGVkIGlzRW1pdHRlclVzZWQoZXZlbnRUeXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBjb25zdCBoYXNFbWl0dGVyID0gISFlbWl0dGVyICYmIGVtaXR0ZXIub2JzZXJ2ZXJzICYmIGVtaXR0ZXIub2JzZXJ2ZXJzLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgLy8gZ3JpZFJlYWR5ID0+IG9uR3JpZFJlYWR5XG4gICAgICAgIGNvbnN0IGFzRXZlbnROYW1lID0gYG9uJHtldmVudFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCl9JHtldmVudFR5cGUuc3Vic3RyaW5nKDEpfWBcbiAgICAgICAgY29uc3QgaGFzR3JpZE9wdGlvbkxpc3RlbmVyID0gISF0aGlzLmdyaWRPcHRpb25zICYmICEhdGhpcy5ncmlkT3B0aW9uc1thc0V2ZW50TmFtZV07XG5cbiAgICAgICAgcmV0dXJuIGhhc0VtaXR0ZXIgfHwgaGFzR3JpZE9wdGlvbkxpc3RlbmVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2xvYmFsRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IHN0cmluZywgZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgdGVhcmluZyBkb3duLCBkb24ndCBlbWl0IGFuZ3VsYXIgZXZlbnRzLCBhcyB0aGlzIGNhdXNlc1xuICAgICAgICAvLyBwcm9ibGVtcyB3aXRoIHRoZSBhbmd1bGFyIHJvdXRlclxuICAgICAgICBpZiAodGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZW5lcmljYWxseSBsb29rIHVwIHRoZSBldmVudFR5cGVcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBpZiAoZW1pdHRlciAmJiB0aGlzLmlzRW1pdHRlclVzZWQoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gJ2dyaWRSZWFkeScpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGdyaWRSZWFkeSwgd2FpdCBmb3IgbmdBZnRlclZpZXdJbml0IHRvIGZpcmUgZmlyc3QsIHRoZW4gZW1pdCB0aGVcbiAgICAgICAgICAgICAgICAvLyBncmlkUmVhZHkgZXZlbnRcbiAgICAgICAgICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnRoZW4oKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgQElucHV0KCkgcHVibGljIGdyaWRPcHRpb25zOiBHcmlkT3B0aW9ucztcbiAgICBASW5wdXQoKSBwdWJsaWMgbW9kdWxlczogTW9kdWxlW107XG5cbiAgICAvLyBAU1RBUlRAXG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc3RhdHVzIGJhciBjb21wb25lbnRzIHRvIHVzZSBpbiB0aGUgc3RhdHVzIGJhci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0YXR1c0JhcjogeyBzdGF0dXNQYW5lbHM6IFN0YXR1c1BhbmVsRGVmW107IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc2lkZSBiYXIgY29tcG9uZW50cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpZGVCYXI6IFNpZGVCYXJEZWYgfCBzdHJpbmcgfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBub3Qgc2hvdyB0aGUgY29udGV4dCBtZW51LiBVc2UgaWYgeW91IGRvbid0IHdhbnQgdG8gdXNlIHRoZSBkZWZhdWx0ICdyaWdodCBjbGljaycgY29udGV4dCBtZW51LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGBzdXBwcmVzc0NvbnRleHRNZW51YCwgeW91IGNhbiB1c2UgdGhlIGBvbkNlbGxDb250ZXh0TWVudWAgZnVuY3Rpb24gdG8gcHJvdmlkZSB5b3VyIG93biBjb2RlIHRvIGhhbmRsZSBjZWxsIGBjb250ZXh0bWVudWAgZXZlbnRzLlxuICAgICAqIFRoaXMgZmxhZyBpcyB1c2VmdWwgdG8gcHJldmVudCB0aGUgYnJvd3NlciBmcm9tIHNob3dpbmcgaXRzIGRlZmF1bHQgY29udGV4dCBtZW51LlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNvbnRleHQgbWVudSB0byBzaG93LCBldmVuIHdoZW4gYEN0cmxgIGtleSBpcyBoZWxkIGRvd24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgY29sdW1uIG1lbnUgYnV0dG9uLCByYXRoZXIgdGhhbiBvbmx5IHNob3dpbmcgd2hlbiB0aGUgbW91c2UgaXMgb3ZlciB0aGUgY29sdW1uIGhlYWRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51SGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB1c2UgdGhlIGJyb3dzZXIncyBkZWZhdWx0IHRvb2x0aXAgaW5zdGVhZCBvZiB1c2luZyB0aGUgZ3JpZCdzIFRvb2x0aXAgQ29tcG9uZW50LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgdGhhdCBpdCB0YWtlcyBmb3IgdG9vbHRpcHMgdG8gc2hvdyB1cCBvbmNlIGFuIGVsZW1lbnQgaXMgaG92ZXJlZCBvdmVyLlxuICAgICAqICAgICAqKk5vdGU6KiogVGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCB3b3JrIGlmIGBlbmFibGVCcm93c2VyVG9vbHRpcHNgIGlzIGB0cnVlYC5cbiAgICAgKiBEZWZhdWx0OiBgMjAwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBTaG93RGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyB0aGF0IGl0IHRha2VzIGZvciB0b29sdGlwcyB0byBoaWRlIG9uY2UgdGhleSBoYXZlIGJlZW4gZGlzcGxheWVkLlxuICAgICAqICAgICAqKk5vdGU6KiogVGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCB3b3JrIGlmIGBlbmFibGVCcm93c2VyVG9vbHRpcHNgIGlzIGB0cnVlYC5cbiAgICAgKiBEZWZhdWx0OiBgMTAwMDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwSGlkZURlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0b29sdGlwcyBmb2xsb3cgdGhlIGN1cnNvciBvbmNlIHRoZXkgYXJlIGRpc3BsYXllZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERPTSBlbGVtZW50IHRvIHVzZSBhcyB0aGUgcG9wdXAgcGFyZW50IGZvciBncmlkIHBvcHVwcyAoY29udGV4dCBtZW51LCBjb2x1bW4gbWVudSBldGMpLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9wdXBQYXJlbnQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsc28gaW5jbHVkZSBoZWFkZXJzIHdoZW4gY29weWluZyB0byBjbGlwYm9hcmQgdXNpbmcgYEN0cmwgKyBDYCBjbGlwYm9hcmQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxzbyBpbmNsdWRlIGdyb3VwIGhlYWRlcnMgd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZCB1c2luZyBgQ3RybCArIENgIGNsaXBib2FyZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUdyb3VwSGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZ5IHRoZSBkZWxpbWl0ZXIgdG8gdXNlIHdoZW4gY29weWluZyB0byBjbGlwYm9hcmQuIFxuICAgICAqIERlZmF1bHQ6IGBcXHRgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbGlwYm9hcmREZWxpbWl0ZXI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvbmx5IGhhdmUgdGhlIHJhbmdlIHNlbGVjdGlvbiwgYW5kIG5vdCByb3cgc2VsZWN0aW9uLCBjb3BpZWQgdG8gY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gd29yayBhcm91bmQgYSBidWcgd2l0aCBFeGNlbCAoV2luZG93cykgdGhhdCBhZGRzIGFuIGV4dHJhIGVtcHR5IGxpbmUgYXQgdGhlIGVuZCBvZiByYW5nZXMgY29waWVkIHRvIHRoZSBjbGlwYm9hcmQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvZmYgcGFzdGUgb3BlcmF0aW9ucyB3aXRoaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZFBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN0b3AgdGhlIGdyaWQgdHJ5aW5nIHRvIHVzZSB0aGUgQ2xpcGJvYXJkIEFQSSwgaWYgaXQgaXMgYmxvY2tlZCwgYW5kIGltbWVkaWF0ZWx5IGZhbGxiYWNrIHRvIHRoZSB3b3JrYXJvdW5kLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IG9mIENvbHVtbiAvIENvbHVtbiBHcm91cCBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnM6IChDb2xEZWYgfCBDb2xHcm91cERlZilbXSB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvbi4gSXRlbXMgZGVmaW5lZCBpbiB0aGUgYWN0dWFsIGNvbHVtbiBkZWZpbml0aW9ucyBnZXQgcHJlY2VkZW5jZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xEZWY6IENvbERlZiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBncm91cCBkZWZpbml0aW9uLiBBbGwgY29sdW1uIGdyb3VwIGRlZmluaXRpb25zIHdpbGwgdXNlIHRoZXNlIHByb3BlcnRpZXMuIEl0ZW1zIGRlZmluZWQgaW4gdGhlIGFjdHVhbCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbiBnZXQgcHJlY2VkZW5jZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZjogUGFydGlhbDxDb2xHcm91cERlZj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBtYXAgb2YgY3VzdG9tIGNvbHVtbiB0eXBlcyB3aGljaCBjb250YWluIGdyb3VwcyBvZiBwcm9wZXJ0aWVzIHRoYXQgY29sdW1uIGRlZmluaXRpb25zIGNhbiBpbmhlcml0IGJ5IHJlZmVyZW5jaW5nIGluIHRoZWlyIGB0eXBlYCBwcm9wZXJ0eS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtblR5cGVzOiB7IFtrZXk6IHN0cmluZ106IENvbERlZjsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogS2VlcHMgdGhlIG9yZGVyIG9mIENvbHVtbnMgbWFpbnRhaW5lZCBhZnRlciBuZXcgQ29sdW1uIERlZmluaXRpb25zIGFyZSB1cGRhdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYWludGFpbkNvbHVtbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZW4gZG90cyBpbiBmaWVsZCBuYW1lcyAoZS5nLiBgYWRkcmVzcy5maXJzdGxpbmVgKSBhcmUgbm90IHRyZWF0ZWQgYXMgZGVlcCByZWZlcmVuY2VzLiBBbGxvd3MgeW91IHRvIHVzZSBkb3RzIGluIHlvdXIgZmllbGQgbmFtZSBpZiB5b3UgcHJlZmVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpZWxkRG90Tm90YXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YUNvbHVtbk1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhcHBseUNvbHVtbkRlZk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW1tdXRhYmxlQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2V0Q29sdW1uU3RhdGVFdmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBTZXQgdmlhIGBkZWZhdWx0Q29sRGVmLndpZHRoYFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBTZXQgdmlhIGBkZWZhdWx0Q29sRGVmLm1pbldpZHRoYFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtaW5Db2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBTZXQgdmlhIGBkZWZhdWx0Q29sRGVmLm1heFdpZHRoYFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBjb2x1bW4gbGFiZWwgaGVhZGVyLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIHRoZSB0aGVtZSB2YWx1ZSBvZiBgaGVhZGVyLWhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3dzIGNvbnRhaW5pbmcgaGVhZGVyIGNvbHVtbiBncm91cHMuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGhlYWRlckhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBmbG9hdGluZyBmaWx0ZXJzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIHRoZSB0aGVtZSB2YWx1ZSBvZiBgaGVhZGVyLWhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgY29sdW1ucyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGhlYWRlckhlaWdodGAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzIHdoZW4gaW4gcGl2b3QgbW9kZS4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyBgZ3JvdXBIZWFkZXJIZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RHcm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvdyByZW9yZGVyaW5nIGFuZCBwaW5uaW5nIGNvbHVtbnMgYnkgZHJhZ2dpbmcgY29sdW1ucyBmcm9tIHRoZSBDb2x1bW5zIFRvb2wgUGFuZWwgdG8gdGhlIGdyaWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93RHJhZ0Zyb21Db2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIGNvbHVtbiBtb3ZpbmcsIGkuZS4gdG8gbWFrZSB0aGUgY29sdW1ucyBmaXhlZCBwb3NpdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgYGFnLWNvbHVtbi1tb3ZpbmdgIGNsYXNzIGlzIG5vdCBhZGRlZCB0byB0aGUgZ3JpZCB3aGlsZSBjb2x1bW5zIGFyZSBtb3ZpbmcuIEluIHRoZSBkZWZhdWx0IHRoZW1lcywgdGhpcyByZXN1bHRzIGluIG5vIGFuaW1hdGlvbiB3aGVuIG1vdmluZyBjb2x1bW5zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgd2hlbiB5b3UgZHJhZyBhIGNvbHVtbiBvdXQgb2YgdGhlIGdyaWQgKGUuZy4gdG8gdGhlIGdyb3VwIHpvbmUpIHRoZSBjb2x1bW4gaXMgbm90IGhpZGRlbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ3NoaWZ0J2AgdG8gaGF2ZSBzaGlmdC1yZXNpemUgYXMgdGhlIGRlZmF1bHQgcmVzaXplIG9wZXJhdGlvbiAoc2FtZSBhcyB1c2VyIGhvbGRpbmcgZG93biBgU2hpZnRgIHdoaWxlIHJlc2l6aW5nKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbFJlc2l6ZURlZmF1bHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3NlcyBhdXRvLXNpemluZyBjb2x1bW5zIGZvciBjb2x1bW5zLiBJbiBvdGhlciB3b3JkcywgZG91YmxlIGNsaWNraW5nIGEgY29sdW1uJ3MgaGVhZGVyJ3MgZWRnZSB3aWxsIG5vdCBhdXRvLXNpemUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIE51bWJlciBvZiBwaXhlbHMgdG8gYWRkIHRvIGEgY29sdW1uIHdpZHRoIGFmdGVyIHRoZSBbYXV0by1zaXppbmddKC9jb2x1bW4tc2l6aW5nLyNhdXRvLXNpemUtY29sdW1ucykgY2FsY3VsYXRpb24uXG4gICAgICogU2V0IHRoaXMgaWYgeW91IHdhbnQgdG8gYWRkIGV4dHJhIHJvb20gdG8gYWNjb21tb2RhdGUgKGZvciBleGFtcGxlKSBzb3J0IGljb25zLCBvciBzb21lIG90aGVyIGR5bmFtaWMgbmF0dXJlIG9mIHRoZSBoZWFkZXIuXG4gICAgICogRGVmYXVsdDogYDRgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2l6ZVBhZGRpbmc6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHNraXAgdGhlIGBoZWFkZXJOYW1lYCB3aGVuIGBhdXRvU2l6ZWAgaXMgY2FsbGVkIGJ5IGRlZmF1bHQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiBjb21wb25lbnQgbmFtZXMgdG8gY29tcG9uZW50cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IGFueTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGNvbXBvbmVudHNgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZyYW1ld29ya0NvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IHsgbmV3KCk6IGFueTsgfTsgfSB8IGFueSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgUmVhY3QgVUkgaXMgZW5hYmxlZCBieSBkZWZhdWx0LiBVc2Ugc3VwcHJlc3NSZWFjdFVpPXRydWUgdG8gdHVybiBpdCBvZmYuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlYWN0VWk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFNldCB0byB0cnVlIHRvIGVuYWJsZSB0aGUgZXhwZXJpbWVudGFsIFJlYWN0IFVJLiBXb3JrcyB3aXRoIFJlYWN0IGZyYW1ld29yayBvbmx5LlxuSXQgaXMgcGxhbm5lZCB0aGUgbmV4dCBtYWpvciByZWxlYXNlIG9mIHRoZSBncmlkIHdpbGwgZHJvcCBzdXBwb3J0IG9mIHRoZSBsZWdhY3kgUmVhY3QgZW5naW5lLFxuaGVuY2UgdGhpcyBwcm9wZXJ0eSBpcyBkZXByZWNhdGVkIGFzIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmV4dCBtYWpvciByZWxlYXNlLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1JlYWN0VWk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ2Z1bGxSb3cnYCB0byBlbmFibGUgRnVsbCBSb3cgRWRpdGluZy4gT3RoZXJ3aXNlIGxlYXZlIGJsYW5rIHRvIGVkaXQgb25lIGNlbGwgYXQgYSB0aW1lLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgU2luZ2xlIENsaWNrIEVkaXRpbmcgZm9yIGNlbGxzLCB0byBzdGFydCBlZGl0aW5nIHdpdGggYSBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IG5laXRoZXIgc2luZ2xlIG5vciBkb3VibGUgY2xpY2sgc3RhcnRzIGVkaXRpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHN0b3AgdGhlIGdyaWQgdXBkYXRpbmcgZGF0YSBhZnRlciBhbmQgZWRpdC4gV2hlbiB0aGlzIGlzIHNldCwgaXQgaXMgaW50ZW5kZWQgdGhlIGFwcGxpY2F0aW9uIHdpbGwgdXBkYXRlIHRoZSBkYXRhLCBlZyBpbiBhbiBleHRlcm5hbCBpbW11dGFibGUgc3RvcmUsIGFuZCB0aGVuIHBhc3MgdGhlIG5ldyBkYXRhc2V0IHRvIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVhZE9ubHlFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc3RvcCBjZWxsIGVkaXRpbmcgd2hlbiBncmlkIGxvc2VzIGZvY3VzLlxuICAgICAqIFRoZSBkZWZhdWx0IGlzIHRoYXQgdGhlIGdyaWQgc3RheXMgZWRpdGluZyB1bnRpbCBmb2N1cyBnb2VzIG9udG8gYW5vdGhlciBjZWxsLiBGb3IgaW5saW5lIChub24tcG9wdXApIGVkaXRvcnMgb25seS5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck1vdmVzRG93bkFmdGVyRWRpdGAgdG8gaGF2ZSBFeGNlbC1zdHlsZSBiZWhhdmlvdXIgZm9yIHRoZSBgRW50ZXJgIGtleS5cbiAgICAgKiBpLmUuIHByZXNzaW5nIHRoZSBgRW50ZXJgIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGFsb25nIHdpdGggYGVudGVyTW92ZXNEb3duYCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlICdFbnRlcicga2V5LlxuICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIEVudGVyIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBVbmRvIC8gUmVkbyB3aGlsZSBlZGl0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBzaXplIG9mIHRoZSB1bmRvIC8gcmVkbyBzdGFjay4gRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZ0xpbWl0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1cyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0b3BFZGl0aW5nV2hlbkdyaWRMb3Nlc0ZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gQ1NWLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENzdkV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBDU1YuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gRXhjZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXM6IEV4Y2VsRXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBFeGNlbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBsaXN0IChhcnJheSkgb2YgRXhjZWwgc3R5bGVzIHRvIGJlIHVzZWQgd2hlbiBleHBvcnRpbmcgdG8gRXhjZWwgd2l0aCBzdHlsZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogRXhjZWxTdHlsZVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgZGVmYXVsdENzdkV4cG9ydFBhcmFtcyBvciBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXNcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgRXhjZWxFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJvd3MgYXJlIGZpbHRlcmVkIHVzaW5nIHRoaXMgdGV4dCBhcyBhIHF1aWNrIGZpbHRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIHF1aWNrIGZpbHRlciBjYWNoZSwgdXNlZCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIHdoZW4gdXNpbmcgdGhlIHF1aWNrIGZpbHRlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVRdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCB0cmVlIGRhdGEgZmlsdGVyaW5nIGJlaGF2aW91ciB0byBpbnN0ZWFkIGV4Y2x1ZGUgY2hpbGQgbm9kZXMgZnJvbSBmaWx0ZXIgcmVzdWx0cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIEVuYWJsZSBDaGFydHMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGxpc3Qgb2YgY2hhcnQgdGhlbWVzIHRvIGJlIHVzZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lczogc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIGNvbnRhaW5pbmcgY3VzdG9tIGNoYXJ0IHRoZW1lcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGN1c3RvbUNoYXJ0VGhlbWVzOiB7IFtuYW1lOiBzdHJpbmddOiBBZ0NoYXJ0VGhlbWUgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhcnQgdGhlbWUgb3ZlcnJpZGVzIGFwcGxpZWQgdG8gYWxsIHRoZW1lcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVPdmVycmlkZXM6IEFnQ2hhcnRUaGVtZU92ZXJyaWRlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gdXNlIHdoZW4gZGF0YSBpcyBsb2FkaW5nIHZpYSBhIERhdGFTb3VyY2UuXG4gICAgICogU2VlIFtMb2FkaW5nIENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1sb2FkaW5nLWNlbGwtcmVuZGVyZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gYmUgdXNlZCB3aGVuIGRhdGEgaXMgbG9hZGluZyB2aWEgYSBEYXRhU291cmNlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yOiBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiBrZXktPnZhbHVlIHBhaXJzIGZvciBsb2NhbGlzaW5nIHRleHQgd2l0aGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlVGV4dDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgTWFzdGVyIERldGFpbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgZGV0YWlsIHJvd3MgZm9yIHdoZW4gdGhleSBhcmUgZGlzcGxheWVkIGFnYWluLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgbnVtYmVyIG9mIGRldGFpbHMgcm93cyB0byBrZWVwLiBEZWZhdWx0OiBgMTBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93c0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gYGRldGFpbENlbGxSZW5kZXJlcmAgdG8gdXNlIHdoZW4gYSBtYXN0ZXIgcm93IGlzIGV4cGFuZGVkLlxuICAgICAqIFNlZSBbRGV0YWlsIENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL21hc3Rlci1kZXRhaWwtY3VzdG9tLWRldGFpbC8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgZGV0YWlsQ2VsbFJlbmRlcmVyYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBwYXJhbXMgdG8gYmUgdXNlZCBieSB0aGUgRGV0YWlsIENlbGwgUmVuZGVyZXIuIENhbiBhbHNvIGJlIGEgZnVuY3Rpb24gdGhhdCBwcm92aWRlcyB0aGUgcGFyYW1zIHRvIGVuYWJsZSBkeW5hbWljIGRlZmluaXRpb25zIG9mIHRoZSBwYXJhbXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IGZpeGVkIGhlaWdodCBpbiBwaXhlbHMgZm9yIGVhY2ggZGV0YWlsIHJvdy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGRldGFpbCBncmlkIGR5bmFtaWNhbGx5IGNoYW5nZSBpdCdzIGhlaWdodCB0byBmaXQgaXQncyByb3dzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsUm93QXV0b0hlaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZXMgYSBjb250ZXh0IG9iamVjdCB0aGF0IGlzIHByb3ZpZGVkIHRvIGRpZmZlcmVudCBjYWxsYmFja3MgdGhlIGdyaWQgdXNlcy4gVXNlZCBmb3IgcGFzc2luZyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHRvIHRoZSBjYWxsYmFja3MgYnkgeW91ciBhcHBsaWNhdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbnRleHQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBsaXN0IG9mIGdyaWRzIHRvIHRyZWF0IGFzIEFsaWduZWQgR3JpZHMuIElmIGdyaWRzIGFyZSBhbGlnbmVkIHRoZW4gdGhlIGNvbHVtbnMgYW5kIGhvcml6b250YWwgc2Nyb2xsaW5nIHdpbGwgYmUga2VwdCBpbiBzeW5jLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxpZ25lZEdyaWRzOiBHcmlkT3B0aW9uc1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFuZ2UgdGhpcyB2YWx1ZSB0byBzZXQgdGhlIHRhYkluZGV4IG9yZGVyIG9mIHRoZSBHcmlkIHdpdGhpbiB5b3VyIGFwcGxpY2F0aW9uLiBEZWZhdWx0OiBgMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYkluZGV4OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBudW1iZXIgb2Ygcm93cyByZW5kZXJlZCBvdXRzaWRlIHRoZSB2aWV3YWJsZSBhcmVhIHRoZSBncmlkIHJlbmRlcnMuXG4gICAgICogSGF2aW5nIGEgYnVmZmVyIG1lYW5zIHRoZSBncmlkIHdpbGwgaGF2ZSByb3dzIHJlYWR5IHRvIHNob3cgYXMgdGhlIHVzZXIgc2xvd2x5IHNjcm9sbHMgdmVydGljYWxseS5cbiAgICAgKiBEZWZhdWx0OiBgMTBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dCdWZmZXI6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB0dXJuIG9uIHRoZSB2YWx1ZSBjYWNoZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb25maWd1cmUgdGhlIHZhbHVlIGNhY2hlIHRvIG5vdCBleHBpcmUgYWZ0ZXIgZGF0YSB1cGRhdGVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IGNlbGwgZXhwcmVzc2lvbnMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFeHByZXNzaW9uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCByb3cgbm9kZXMgZG8gbm90IGhhdmUgdGhlaXIgcGFyZW50cyBzZXQuXG4gICAgICogVGhlIGdyaWQgZG9lc24ndCB1c2UgdGhlIHBhcmVudCByZWZlcmVuY2UsIGJ1dCBpdCBpcyBpbmNsdWRlZCB0byBoZWxwIHRoZSBjbGllbnQgY29kZSBuYXZpZ2F0ZSB0aGUgbm9kZSB0cmVlIGlmIGl0IHdhbnRzIGJ5IHByb3ZpZGluZyBiaS1kaXJlY3Rpb24gbmF2aWdhdGlvbiB1cCBhbmQgZG93biB0aGUgdHJlZS5cbiAgICAgKiBJZiB0aGlzIGlzIGEgcHJvYmxlbSAoZS5nLiBpZiB5b3UgbmVlZCB0byBjb252ZXJ0IHRoZSB0cmVlIHRvIEpTT04sIHdoaWNoIGRvZXMgbm90IGFsbG93IGN5Y2xpYyBkZXBlbmRlbmNpZXMpIHRoZW4gc2V0IHRoaXMgdG8gYHRydWVgLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFyZW50c0luUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRvdWNoIHN1cHBvcnQgKGJ1dCBkb2VzIG5vdCByZW1vdmUgdGhlIGJyb3dzZXIncyBlZmZvcnRzIHRvIHNpbXVsYXRlIG1vdXNlIGV2ZW50cyBvbiB0b3VjaCkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IHNldCBmb2N1cyBiYWNrIG9uIHRoZSBncmlkIGFmdGVyIGEgcmVmcmVzaC4gVGhpcyBjYW4gYXZvaWQgaXNzdWVzIHdoZXJlIHlvdSB3YW50IHRvIGtlZXAgdGhlIGZvY3VzIG9uIGFub3RoZXIgcGFydCBvZiB0aGUgYnJvd3Nlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlIGFzeW5jaHJvbm91cyBuYXR1cmUgb2YgdGhlIGV2ZW50cyBpbnRyb2R1Y2VkIGluIHYxMCwgYW5kIG1ha2VzIHRoZW0gc3luY2hyb25vdXMuIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgZm9yIHRoZSBwdXJwb3NlIG9mIHN1cHBvcnRpbmcgbGVnYWN5IGNvZGUgd2hpY2ggaGFzIGEgZGVwZW5kZW5jeSBvbiBzeW5jaHJvbm91cyBldmVudHMgZnJvbSBlYXJsaWVyIHZlcnNpb25zICh2OSBvciBlYXJsaWVyKSBvZiBBRyBHcmlkLiAgICAgKipJdCBpcyBzdHJvbmdseSByZWNvbW1lbmRlZCB0aGF0IHlvdSBkbyBub3QgY2hhbmdlIHRoaXMgcHJvcGVydHkgdW5sZXNzIHlvdSBoYXZlIGxlZ2FjeSBpc3N1ZXMuKiogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBc3luY0V2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGdyaWQgd2lsbCBjaGVjayBmb3IgYFJlc2l6ZU9ic2VydmVyYCBhbmQgdXNlIGl0IGlmIGl0IGV4aXN0cyBpbiB0aGUgYnJvd3Nlciwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlIHRoZSBncmlkJ3MgYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb24uIFNvbWUgdXNlcnMgcmVwb3J0ZWQgaXNzdWVzIHdpdGggQ2hyb21lJ3MgYFJlc2l6ZU9ic2VydmVyYC4gVXNlIHRoaXMgcHJvcGVydHkgdG8gYWx3YXlzIHVzZSB0aGUgZ3JpZCdzIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9uIHNob3VsZCBzdWNoIHByb2JsZW1zIGV4aXN0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgc2hvd2luZyBhIHdhcm5pbmcgbWVzc2FnZSBpbiB0aGUgY29uc29sZSBpZiB1c2luZyBhIGBncmlkT3B0aW9uc2Agb3IgYGNvbERlZmAgcHJvcGVydHkgdGhhdCBkb2Vzbid0IGV4aXN0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Byb3BlcnR5TmFtZXNDaGVjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgY2hhbmdlIGRldGVjdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBlbmFibGUgZGVidWcgaW5mb3JtYXRpb24gZnJvbSB0aGUgZ3JpZCBhbmQgcmVsYXRlZCBjb21wb25lbnRzLiBXaWxsIHJlc3VsdCBpbiBhZGRpdGlvbmFsIGxvZ2dpbmcgYmVpbmcgb3V0cHV0LCBidXQgdmVyeSB1c2VmdWwgd2hlbiBpbnZlc3RpZ2F0aW5nIHByb2JsZW1zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJ1ZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIHRlbXBsYXRlIGZvciAnbG9hZGluZycgb3ZlcmxheS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlMb2FkaW5nVGVtcGxhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAqIFNlZSBbTG9hZGluZyBPdmVybGF5IENvbXBvbmVudF0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LW92ZXJsYXkvI3NpbXBsZS1sb2FkaW5nLW92ZXJsYXktY29tcG9uZW50KSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgbG9hZGluZ092ZXJsYXlDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50RnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgbG9hZGluZyBvdmVybGF5IGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSAnbG9hZGluZycgb3ZlcmxheS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIHRlbXBsYXRlIGZvciAnbm8gcm93cycgb3ZlcmxheS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlOb1Jvd3NUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIG5vIHJvd3Mgb3ZlcmxheSBjb21wb25lbnQuXG4gICAgICogU2VlIFtObyBSb3dzIE92ZXJsYXkgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtb3ZlcmxheS8jc2ltcGxlLW5vLXJvd3Mtb3ZlcmxheS1jb21wb25lbnQpIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYG5vUm93c092ZXJsYXlDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBubyByb3dzIG92ZXJsYXkgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgJ25vIHJvd3MnIG92ZXJsYXkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHdoZXRoZXIgcGFnaW5hdGlvbiBpcyBlbmFibGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByb3dzIHRvIGxvYWQgcGVyIHBhZ2UuIElmIGBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplYCBpcyBzcGVjaWZpZWQsIHRoaXMgcHJvcGVydHkgaXMgaWdub3JlZC4gRGVmYXVsdDogYDEwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIG51bWJlciBvZiByb3dzIHRvIGxvYWQgcGVyIHBhZ2UgaXMgYXV0b21hdGljYWxseSBhZGp1c3RlZCBieSB0aGUgZ3JpZCBzbyBlYWNoIHBhZ2Ugc2hvd3MgZW5vdWdoIHJvd3MgdG8ganVzdCBmaWxsIHRoZSBhcmVhIGRlc2lnbmF0ZWQgZm9yIHRoZSBncmlkLiBJZiBgZmFsc2VgLCBgcGFnaW5hdGlvblBhZ2VTaXplYCBpcyB1c2VkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgcGFnZXMgc3BsaXQgY2hpbGRyZW4gb2YgZ3JvdXBzIHdoZW4gdXNpbmcgUm93IEdyb3VwaW5nIG9yIGRldGFpbCByb3dzIHdpdGggTWFzdGVyIERldGFpbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGRlZmF1bHQgZ3JpZCBjb250cm9scyBmb3IgbmF2aWdhdGlvbiBhcmUgaGlkZGVuLlxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGlmIGBwYWdpbmF0aW9uPXRydWVgIGFuZCB5b3Ugd2FudCB0byBwcm92aWRlIHlvdXIgb3duIHBhZ2luYXRpb24gY29udHJvbHMuXG4gICAgICogT3RoZXJ3aXNlLCB3aGVuIGBwYWdpbmF0aW9uPXRydWVgIHRoZSBncmlkIGF1dG9tYXRpY2FsbHkgc2hvd3MgdGhlIG5lY2Vzc2FyeSBjb250cm9scyBhdCB0aGUgYm90dG9tIHNvIHRoYXQgdGhlIHVzZXIgY2FuIG5hdmlnYXRlIHRocm91Z2ggdGhlIGRpZmZlcmVudCBwYWdlcy5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgcGl2b3QgbW9kZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RNb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdwaXZvdCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gcGl2b3QpIGF0IHRoZSB0b3AuIE5vdGUgdGhhdCB0aGUgcGl2b3QgcGFuZWwgd2lsbCBuZXZlciBzaG93IGlmIGBwaXZvdE1vZGVgIGlzIG9mZi4gRGVmYXVsdDogYG5ldmVyYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RQYW5lbFNob3c6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBzZXQgYW5kIHRoZSBncmlkIGlzIGluIHBpdm90IG1vZGUsIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCB0b3RhbHMgd2lsbCBhcHBlYXIgd2l0aGluIHRoZSBQaXZvdCBDb2x1bW4gR3JvdXBzLCBpbiB0aGUgcG9zaXRpb24gc3BlY2lmaWVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFsczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciBmb3IgZWFjaCB2YWx1ZSBjb2x1bW4gaW4gdGhlIHBvc2l0aW9uIHNwZWNpZmllZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Um93VG90YWxzOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3Qgc3dhcCBpbiB0aGUgZ3JvdXBpbmcgY29sdW1uIHdoZW4gcGl2b3RpbmcuIFVzZWZ1bCBpZiBwaXZvdGluZyB1c2luZyBTZXJ2ZXIgU2lkZSBSb3cgTW9kZWwgb3IgVmlld3BvcnQgUm93IE1vZGVsIGFuZCB5b3Ugd2FudCBmdWxsIGNvbnRyb2wgb2YgYWxsIGNvbHVtbnMgaW5jbHVkaW5nIHRoZSBncm91cCBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHBpdm90IGNvbHVtbiBncm91cHMgd2lsbCBhcHBlYXIgJ2ZpeGVkJywgd2l0aG91dCB0aGUgYWJpbGl0eSB0byBleHBhbmQgYW5kIGNvbGxhcHNlIHRoZSBjb2x1bW4gZ3JvdXBzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGVuIHJvdyBncm91cCwgcGl2b3QgYW5kIHZhbHVlIGFnZ3JlZ2F0aW9uIHdpbGwgYmUgcmVhZC1vbmx5IGZyb20gdGhlIEdVSS4gVGhlIGdyaWQgd2lsbCBkaXNwbGF5IHdoYXQgdmFsdWVzIGFyZSB1c2VkIGZvciBlYWNoLCBidXQgd2lsbCBub3QgYWxsb3cgdGhlIHVzZXIgdG8gY2hhbmdlIHRoZSBzZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiAnZnVuY3Rpb24gbmFtZScgdG8gJ2Z1bmN0aW9uJyBmb3IgY3VzdG9tIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmNzOiB7IFtrZXk6IHN0cmluZ106IElBZ2dGdW5jOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgY29sdW1uIGhlYWRlcnMgd29uJ3QgaW5jbHVkZSB0aGUgYGFnZ0Z1bmNgIG5hbWUsIGUuZy4gYCdzdW0oQmFuayBCYWxhbmNlKWAnIHdpbGwganVzdCBiZSBgJ0JhbmsgQmFsYW5jZSdgLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBhZ2dyZWdhdGlvbnMgd29uJ3QgYmUgY29tcHV0ZWQgZm9yIHRoZSByb290IG5vZGUgb2YgdGhlIGdyaWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnQXRSb290TGV2ZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgY2hhbmdlIGRldGVjdGlvbiwgb25seSB0aGUgdXBkYXRlZCBjb2x1bW4gd2lsbCBiZSByZS1hZ2dyZWdhdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCBhZ2dyZWdhdGlvbnMgYXJlIG5vdCBpbXBhY3RlZCBieSBmaWx0ZXJpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBSb3cgQW5pbWF0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmltYXRlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIGZsYXNoIGFmdGVyIGRhdGEgY2hhbmdlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGVuYWJsZUNlbGxDaGFuZ2VGbGFzaGAsIHRoaXMgY29uZmlndXJhdGlvbiB3aWxsIHNldCB0aGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIG9mIGhvdyBsb25nIGEgY2VsbCBzaG91bGQgcmVtYWluIGluIGl0cyBcImZsYXNoZWRcIiBzdGF0ZS5cbiAgICAgKiBEZWZhdWx0OiBgNTAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgLCB0aGlzIGNvbmZpZ3VyYXRpb24gd2lsbCBzZXQgdGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyB0aGUgXCJmbGFzaGVkXCIgc3RhdGUgYW5pbWF0aW9uIHRha2VzIHRvIGZhZGUgYXdheSBhZnRlciB0aGUgdGltZXIgc2V0IGJ5IGBjZWxsRmxhc2hEZWxheWAgaGFzIGNvbXBsZXRlZC5cbiAgICAgKiBEZWZhdWx0OiBgMTAwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGYWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3dpdGNoIGJldHdlZW4gbGF5b3V0IG9wdGlvbnM6IGBub3JtYWxgLCBgYXV0b0hlaWdodGAsIGBwcmludGAuXG4gICAgICogRGVmYXVsdDogYG5vcm1hbGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRvbUxheW91dDogJ25vcm1hbCcgfCAnYXV0b0hlaWdodCcgfCAncHJpbnQnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIG9yZGVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgaW4gdGhlIERPTSBhcmUgY29uc2lzdGVudCB3aXRoIHdoYXQgaXMgb24gc2NyZWVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnN1cmVEb21PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvcGVyYXRlIHRoZSBncmlkIGluIFJUTCAoUmlnaHQgdG8gTGVmdCkgbW9kZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUnRsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIGdyaWQgZG9lc24ndCB2aXJ0dWFsaXNlIHRoZSBjb2x1bW5zLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgMTAwIGNvbHVtbnMsIGJ1dCBvbmx5IDEwIHZpc2libGUgZHVlIHRvIHNjcm9sbGluZywgYWxsIDEwMCB3aWxsIGFsd2F5cyBiZSByZW5kZXJlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCB0aGUgZ3JpZCBoYXMgYSBsaW1pdCBvZiByZW5kZXJpbmcgYSBtYXhpbXVtIG9mIDUwMCByb3dzIGF0IG9uY2UgKHJlbWVtYmVyIHRoZSBncmlkIG9ubHkgcmVuZGVycyByb3dzIHlvdSBjYW4gc2VlLCBzbyB1bmxlc3MgeW91ciBkaXNwbGF5IHNob3dzIG1vcmUgdGhhbiA1MDAgcm93cyB3aXRob3V0IHZlcnRpY2FsbHkgc2Nyb2xsaW5nIHRoaXMgd2lsbCBuZXZlciBiZSBhbiBpc3N1ZSkuXG4gICAgICogPGJyIC8+KipUaGlzIGlzIG9ubHkgcmVsZXZhbnQgaWYgeW91IGFyZSBtYW51YWxseSBzZXR0aW5nIGByb3dCdWZmZXJgIHRvIGEgaGlnaCB2YWx1ZSAocmVuZGVyaW5nIG1vcmUgcm93cyB0aGFuIGNhbiBiZSBzZWVuKSBvciBpZiB5b3VyIGdyaWQgaGVpZ2h0IGlzIGFibGUgdG8gZGlzcGxheSBtb3JlIHRoYW4gNTAwIHJvd3MgYXQgb25jZS4qKlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBncmlkIGRvZXNuJ3QgdmlydHVhbGlzZSB0aGUgcm93cy4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIDEwMCByb3dzLCBidXQgb25seSAxMCB2aXNpYmxlIGR1ZSB0byBzY3JvbGxpbmcsIGFsbCAxMDAgd2lsbCBhbHdheXMgYmUgcmVuZGVyZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hbmFnZWQgUm93IERyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyByb3cgZHJhZ2dpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtb3Zpbmcgcm93cyB3aGlsZSBkcmFnZ2luZyB0aGUgYHJvd0RyYWdgIHdhZmZsZS4gVGhpcyBvcHRpb24gaGlnaGxpZ2h0cyB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIHJvdyB3aWxsIGJlIHBsYWNlZCBhbmQgaXQgd2lsbCBvbmx5IG1vdmUgdGhlIHJvdyBvbiBtb3VzZSB1cC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBjbGlja2luZyBhbmQgZHJhZ2dpbmcgYW55d2hlcmUgb24gdGhlIHJvdyB3aXRob3V0IHRoZSBuZWVkIGZvciBhIGRyYWcgaGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnRW50aXJlUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBkcmFnZ2luZyBtdWx0aXBsZSByb3dzIGF0IHRoZSBzYW1lIHRpbWUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNdWx0aVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBjZWxsIHJlbmRlcmVyIGNvbXBvbmVudCB0byB1c2UgZm9yIGZ1bGwgd2lkdGggcm93cy5cbiAgICAgKiBTZWUgW0Z1bGwgV2lkdGggUm93c10oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvZnVsbC13aWR0aC1yb3dzLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBmdWxsV2lkdGhDZWxsUmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIGBmdWxsV2lkdGhDZWxsUmVuZGVyZXJgIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGRldGFpbCBncmlkIGVtYmVkZGVkIGluIHRoZSBtYXN0ZXIgZ3JpZCdzIGNvbnRhaW5lciBhbmQgc28gbGluayB0aGVpciBob3Jpem9udGFsIHNjcm9sbGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlcHJlY2F0ZWRFbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyBob3cgdGhlIHJlc3VsdHMgb2Ygcm93IGdyb3VwaW5nIHNob3VsZCBiZSBkaXNwbGF5ZWQuXG4gICAgICogXG4gICAgICogICBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICogXG4gICAgICogLSBgJ3NpbmdsZUNvbHVtbidgOiBzaW5nbGUgZ3JvdXAgY29sdW1uIGF1dG9tYXRpY2FsbHkgYWRkZWQgYnkgdGhlIGdyaWQuXG4gICAgICogLSBgJ211bHRpcGxlQ29sdW1ucydgOiBhIGdyb3VwIGNvbHVtbiBwZXIgcm93IGdyb3VwIGlzIGFkZGVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICogLSBgJ2dyb3VwUm93cydgOiBncm91cCByb3dzIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIGluc3RlYWQgb2YgZ3JvdXAgY29sdW1ucy5cbiAgICAgKiAtIGAnY3VzdG9tJ2A6IGluZm9ybXMgdGhlIGdyaWQgdGhhdCBncm91cCBjb2x1bW5zIHdpbGwgYmUgcHJvdmlkZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERpc3BsYXlUeXBlOiBSb3dHcm91cGluZ0Rpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgc2V0IHRvIHRoZSBudW1iZXIgb2YgbGV2ZWxzIHRvIGV4cGFuZCBieSBkZWZhdWx0LCBlLmcuIGAwYCBmb3Igbm9uZSwgYDFgIGZvciBmaXJzdCBsZXZlbCBvbmx5LCBldGMuIFNldCB0byBgLTFgIHRvIGV4cGFuZCBldmVyeXRoaW5nLiBEZWZhdWx0OiBgMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGVmYXVsdEV4cGFuZGVkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzcGVjaWZ5aW5nIHRoZSBncm91cCAnYXV0byBjb2x1bW4nIGlmIHlvdSBhcmUgbm90IGhhcHB5IHdpdGggdGhlIGRlZmF1bHQuIElmIGdyb3VwaW5nLCB0aGlzIGNvbHVtbiBkZWZpbml0aW9uIGlzIGluY2x1ZGVkIGFzIHRoZSBmaXJzdCBjb2x1bW4gaW4gdGhlIGdyaWQuIElmIG5vdCBncm91cGluZywgdGhpcyBjb2x1bW4gaXMgbm90IGluY2x1ZGVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0dyb3VwQ29sdW1uRGVmOiBDb2xEZWYgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBwcmVzZXJ2ZXMgdGhlIGN1cnJlbnQgZ3JvdXAgb3JkZXIgd2hlbiBzb3J0aW5nIG9uIG5vbi1ncm91cCBjb2x1bW5zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cE1haW50YWluT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBpZiB5b3Ugc2VsZWN0IGEgZ3JvdXAsIHRoZSBjaGlsZHJlbiBvZiB0aGUgZ3JvdXAgd2lsbCBhbHNvIGJlIHNlbGVjdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZ3JvdXBpbmcsIHRoaXMgY29udHJvbHMgd2hldGhlciB0byBzaG93IGEgZ3JvdXAgZm9vdGVyIHdoZW4gdGhlIGdyb3VwIGlzIGV4cGFuZGVkLlxuICAgICAqIElmIGB0cnVlYCwgdGhlbiBieSBkZWZhdWx0LCB0aGUgZm9vdGVyIHdpbGwgY29udGFpbiBhZ2dyZWdhdGUgZGF0YSAoaWYgYW55KSB3aGVuIHNob3duIGFuZCB0aGUgaGVhZGVyIHdpbGwgYmUgYmxhbmsuXG4gICAgICogV2hlbiBjbG9zZWQsIHRoZSBoZWFkZXIgd2lsbCBjb250YWluIHRoZSBhZ2dyZWdhdGUgZGF0YSByZWdhcmRsZXNzIG9mIHRoaXMgc2V0dGluZyAoYXMgdGhlIGZvb3RlciBpcyBoaWRkZW4gYW55d2F5KS5cbiAgICAgKiBUaGlzIGlzIGhhbmR5IGZvciAndG90YWwnIHJvd3MsIHRoYXQgYXJlIGRpc3BsYXllZCBiZWxvdyB0aGUgZGF0YSB3aGVuIHRoZSBncm91cCBpcyBvcGVuLCBhbmQgYWxvbmdzaWRlIHRoZSBncm91cCB3aGVuIGl0IGlzIGNsb3NlZC5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVGb290ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc2hvdyBhICdncmFuZCB0b3RhbCcgZ3JvdXAgZm9vdGVyIGFjcm9zcyBhbGwgZ3JvdXBzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBhbmQgc2hvd2luZyBmb290ZXIsIGFnZ3JlZ2F0ZSBkYXRhIHdpbGwgYWx3YXlzIGJlIGRpc3BsYXllZCBhdCBib3RoIHRoZSBoZWFkZXIgYW5kIGZvb3RlciBsZXZlbHMuIFRoaXMgc3RvcHMgdGhlIHBvc3NpYmx5IHVuZGVzaXJhYmxlIGJlaGF2aW91ciBvZiB0aGUgaGVhZGVyIGRldGFpbHMgJ2p1bXBpbmcnIHRvIHRoZSBmb290ZXIgb24gZXhwYW5kLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFN1cHByZXNzQmxhbmtIZWFkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIHVzaW5nIGBncm91cFNlbGVjdHNDaGlsZHJlbmAsIHRoZW4gb25seSB0aGUgY2hpbGRyZW4gdGhhdCBwYXNzIHRoZSBjdXJyZW50IGZpbHRlciB3aWxsIGdldCBzZWxlY3RlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzRmlsdGVyZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNob3dzIHRoZSBvcGVuIGdyb3VwIGluIHRoZSBncm91cCBjb2x1bW4gZm9yIG5vbi1ncm91cCByb3dzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93T3BlbmVkR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29sbGFwc2UgZ3JvdXBzIHRoYXQgb25seSBoYXZlIG9uZSBjaGlsZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29sbGFwc2UgbG93ZXN0IGxldmVsIGdyb3VwcyB0aGF0IG9ubHkgaGF2ZSBvbmUgY2hpbGQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlTG93ZXN0U2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGlkZSBwYXJlbnRzIHRoYXQgYXJlIG9wZW4uIFdoZW4gdXNlZCB3aXRoIG11bHRpcGxlIGNvbHVtbnMgZm9yIHNob3dpbmcgZ3JvdXBzLCBpdCBjYW4gZ2l2ZSBhIG1vcmUgcGxlYXNpbmcgdXNlciBleHBlcmllbmNlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhpZGVPcGVuUGFyZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB0byBzaG93IHRoZSAncm93IGdyb3VwIHBhbmVsJyAod2hlcmUgeW91IGRyYWcgcm93cyB0byBncm91cCkgYXQgdGhlIHRvcC4gRGVmYXVsdDogYG5ldmVyYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBQYW5lbFNob3c6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB0aGUgQ2VsbCBSZW5kZXJlciB0byB1c2Ugd2hlbiBgZ3JvdXBEaXNwbGF5VHlwZSA9ICdncm91cFJvd3MnYC5cbiAgICAgKiBTZWUgW0dyb3VwIFJvdyBDZWxsIFJlbmRlcmVyXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9ncm91cGluZy1ncm91cC1yb3dzLyNwcm92aWRpbmctY2VsbC1yZW5kZXJlcikgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgZ3JvdXBSb3dSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIGBncm91cFJvd1JlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQsIHdoZW4gYSBjb2x1bW4gaXMgdW4tZ3JvdXBlZCwgaS5lLiB1c2luZyB0aGUgUm93IEdyb3VwIFBhbmVsLCBpdCBpcyBtYWRlIHZpc2libGUgaW4gdGhlIGdyaWQuIFRoaXMgcHJvcGVydHkgc3RvcHMgdGhlIGNvbHVtbiBiZWNvbWluZyB2aXNpYmxlIGFnYWluIHdoZW4gdW4tZ3JvdXBpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBHcmlkIHRvIHdvcmsgd2l0aCBUcmVlIERhdGEuIFlvdSBtdXN0IGFsc28gaW1wbGVtZW50IHRoZSBgZ2V0RGF0YVBhdGgoZGF0YSlgIGNhbGxiYWNrLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gdGhpcyBpcyBub3cgZ3JvdXBSb3dSZW5kZXJlclBhcmFtcy5pbm5lclJlbmRlcmVyXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIHRoaXMgaXMgbm93IGdyb3VwUm93UmVuZGVyZXJQYXJhbXMuaW5uZXJSZW5kZXJlclxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0lubmVyUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZ3JvdXBEaXNwbGF5VHlwZSA9ICdtdWx0aXBsZUNvbHVtbnMnIGluc3RlYWRcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNdWx0aUF1dG9Db2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGdyb3VwRGlzcGxheVR5cGUgPSAnZ3JvdXBSb3dzJyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwVXNlRW50aXJlUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBncm91cERpc3BsYXlUeXBlID0gJ2N1c3RvbScgaW5zdGVhZFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFN1cHByZXNzQXV0b0NvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBubyBsb25nZXIgbmVlZGVkLCB0cmFuc2FjdGlvbiB1cGRhdGVzIGtlZXAgZ3JvdXAgc3RhdGVcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVtZW1iZXJHcm91cFN0YXRlV2hlbk5ld0RhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERhdGEgdG8gYmUgZGlzcGxheWVkIGFzIHBpbm5lZCB0b3Agcm93cyBpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFRvcFJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEYXRhIHRvIGJlIGRpc3BsYXllZCBhcyBwaW5uZWQgYm90dG9tIHJvd3MgaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRCb3R0b21Sb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgcm93IG1vZGVsIHR5cGUuIERlZmF1bHQ6IGBjbGllbnRTaWRlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TW9kZWxUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGUgZGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcm93cyBpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RhdGE6IGFueVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgSW1tdXRhYmxlIERhdGEgaXMgb24gYnkgZGVmYXVsdCB3aGVuIGdyaWQgY2FsbGJhY2sgZ2V0Um93SWQoKSBpcyBpbXBsZW1lbnRlZFxuRW5hYmxlcyBJbW11dGFibGUgRGF0YSBtb2RlLCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIGltbXV0YWJsZSBzdG9yZXMuIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW1tdXRhYmxlRGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGV4ZWN1dGluZyBhIGJhdGNoIG9mIGFzeW5jIHRyYW5zYWN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25XYWl0TWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIFRyYW5zYWN0aW9ucyBjaGFuZ2luZyBzb3J0LCBmaWx0ZXIsIGdyb3VwIG9yIHBpdm90IHN0YXRlIHdoZW4gdHJhbnNhY3Rpb24gb25seSBjb250YWlucyB1cGRhdGVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vZGVsVXBkYXRlQWZ0ZXJVcGRhdGVUcmFuc2FjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhUm93RGF0YU1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHVzZSBhc3luY1RyYW5zYWN0aW9uV2FpdE1pbGxpcyBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGJhdGNoVXBkYXRlV2FpdE1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBkYXRhc291cmNlIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRhc291cmNlOiBJRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAqIERlZmF1bHQ6IGAxYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVPdmVyZmxvd1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAqIERlZmF1bHQ6IGAxYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hldGhlciB0byB1c2UgRnVsbCBTdG9yZSBvciBQYXJ0aWFsIFN0b3JlIGZvciBzdG9yaW5nIHJvd3MuIERlZmF1bHQ6IGBmdWxsYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVN0b3JlVHlwZTogU2VydmVyU2lkZVN0b3JlVHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcm93cyBmb3IgZWFjaCBibG9jayBpbiB0aGUgc3RvcmUsIGkuZS4gaG93IG1hbnkgcm93cyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgYXQgYSB0aW1lLlxuICAgICAqIERlZmF1bHQ6IGAxMDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZUJsb2NrU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBibG9ja3MgdG8ga2VlcCBpbiB0aGUgc3RvcmUuIERlZmF1bHQgaXMgbm8gbGltaXQsIHNvIGV2ZXJ5IHJlcXVlc3RlZCBibG9jayBpcyBrZXB0LiBVc2UgdGhpcyBpZiB5b3UgaGF2ZSBtZW1vcnkgY29uY2VybnMsIGFuZCBibG9ja3MgdGhhdCB3ZXJlIGxlYXN0IHJlY2VudGx5IHZpZXdlZCB3aWxsIGJlIHB1cmdlZCB3aGVuIHRoZSBsaW1pdCBpcyBoaXQuIFRoZSBncmlkIHdpbGwgYWRkaXRpb25hbGx5IG1ha2Ugc3VyZSBpdCBoYXMgYWxsIHRoZSBibG9ja3MgbmVlZGVkIHRvIGRpc3BsYXkgd2hhdCBpcyBjdXJyZW50bHkgdmlzaWJsZSwgaW4gY2FzZSB0aGlzIHByb3BlcnR5IGlzIHNldCB0byBhIGxvdyB2YWx1ZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heEJsb2Nrc0luQ2FjaGU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcmVxdWVzdHMgdG8gaGl0IHRoZSBzZXJ2ZXIgd2l0aCBjb25jdXJyZW50bHkuIElmIHRoZSBtYXggaXMgcmVhY2hlZCwgcmVxdWVzdHMgYXJlIHF1ZXVlZC5cbiAgICAgKiBTZXQgdG8gYC0xYCBmb3Igbm8gbWF4aW11bSByZXN0cmljdGlvbiBvbiByZXF1ZXN0cy5cbiAgICAgKiBEZWZhdWx0OiBgMmAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGxvYWRpbmcgYSBibG9jay4gVXNlZnVsIHdoZW4gc2Nyb2xsaW5nIG92ZXIgbWFueSByb3dzLCBzcGFubmluZyBtYW55IFBhcnRpYWwgU3RvcmUgYmxvY2tzLCBhcyBpdCBwcmV2ZW50cyBibG9ja3MgbG9hZGluZyB1bnRpbCBzY3JvbGxpbmcgaGFzIHNldHRsZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBibG9ja0xvYWREZWJvdW5jZU1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGNsb3NpbmcgZ3JvdXAgcm93cyB3aWxsIHJlbW92ZSBjaGlsZHJlbiBvZiB0aGF0IHJvdy4gTmV4dCB0aW1lIHRoZSByb3cgaXMgb3BlbmVkLCBjaGlsZCByb3dzIHdpbGwgYmUgcmVhZCBmcm9tIHRoZSBkYXRhc291cmNlIGFnYWluLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHVyZ2VDbG9zZWRSb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB0aGUgYHNlcnZlclNpZGVEYXRhc291cmNlYCBmb3Igc2VydmVyIHNpZGUgcm93IG1vZGVsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZURhdGFzb3VyY2U6IElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBhbHdheXMgcmVmcmVzaGVzIHRvcCBsZXZlbCBncm91cHMgcmVnYXJkbGVzcyBvZiB3aGljaCBjb2x1bW4gd2FzIHNvcnRlZC4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0aW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGFsd2F5cyByZWZyZXNoZXMgc3RvcmVzIGFmdGVyIGZpbHRlciBoYXMgY2hhbmdlZC4gVXNlZCBieSBGdWxsIFN0b3JlIG9ubHksIHRvIGFsbG93IFNlcnZlci1TaWRlIEZpbHRlcmluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlcmluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRW50ZXJwcmlzZVJlc2V0T25OZXdDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyB1c2UgdGhlIHZpZXdwb3J0IHJvdyBtb2RlbCB5b3UgbmVlZCB0byBwcm92aWRlIHRoZSBncmlkIHdpdGggYSBgdmlld3BvcnREYXRhc291cmNlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0RGF0YXNvdXJjZTogSVZpZXdwb3J0RGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyB2aWV3cG9ydCByb3cgbW9kZWwsIHNldHMgdGhlIHBhZ2Ugc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbFBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgdmlld3BvcnQgcm93IG1vZGVsLCBzZXRzIHRoZSBidWZmZXIgc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbEJ1ZmZlclNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgaG9yaXpvbnRhbCBzY3JvbGxiYXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSB2ZXJ0aWNhbCBzY3JvbGxiYXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBkZWJvdW5jZSB0aGUgdmVydGljYWwgc2Nyb2xsYmFyLiBDYW4gcHJvdmlkZSBzbW9vdGhlciBzY3JvbGxpbmcgb24gc2xvdyBtYWNoaW5lcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBuZXZlciBzaG93IHRoZSBob3Jpem9udGFsIHNjcm9sbC4gVGhpcyBpcyB1c2VmdWwgaWYgdGhlIGdyaWQgaXMgYWxpZ25lZCB3aXRoIGFub3RoZXIgZ3JpZCBhbmQgd2lsbCBzY3JvbGwgd2hlbiB0aGUgb3RoZXIgZ3JpZCBzY3JvbGxzLiAoU2hvdWxkIG5vdCBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsYC4pIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IHNjcm9sbCB0byB0aGUgdG9wIHdoZW4gbmV3IHJvdyBkYXRhIGlzIHByb3ZpZGVkLiBVc2UgdGhpcyBpZiB5b3UgZG9uJ3Qgd2FudCB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgb2Ygc2Nyb2xsaW5nIHRvIHRoZSB0b3AgZXZlcnkgdGltZSB5b3UgbG9hZCBuZXcgZGF0YS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBhbGxvdyBtb3VzZXdoZWVsIC8gdG91Y2hwYWQgc2Nyb2xsIHdoZW4gcG9wdXAgZWxlbWVudHMgYXJlIHByZXNlbnQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCB1c2UgYW5pbWF0aW9uIGZyYW1lcyB3aGVuIGRyYXdpbmcgcm93cyB3aGlsZSBzY3JvbGxpbmcuIFVzZSB0aGlzIGlmIHRoZSBncmlkIGlzIHdvcmtpbmcgZmFzdCBlbm91Z2ggdGhhdCB5b3UgZG9uJ3QgbmVlZCBhbmltYXRpb24gZnJhbWVzIGFuZCB5b3UgZG9uJ3Qgd2FudCB0aGUgZ3JpZCB0byBmbGlja2VyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FuaW1hdGlvbkZyYW1lOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIG1pZGRsZSBjbGlja3Mgd2lsbCByZXN1bHQgaW4gYGNsaWNrYCBldmVudHMgZm9yIGNlbGxzIGFuZCByb3dzLiBPdGhlcndpc2UgdGhlIGJyb3dzZXIgd2lsbCB1c2UgbWlkZGxlIGNsaWNrIHRvIHNjcm9sbCB0aGUgZ3JpZC48YnIgLz4qKk5vdGU6KiogTm90IGFsbCBicm93c2VycyBmaXJlIGBjbGlja2AgZXZlbnRzIHdpdGggdGhlIG1pZGRsZSBidXR0b24uIE1vc3Qgd2lsbCBmaXJlIG9ubHkgYG1vdXNlZG93bmAgYW5kIGBtb3VzZXVwYCBldmVudHMsIHdoaWNoIGNhbiBiZSB1c2VkIHRvIGZvY3VzIGEgY2VsbCwgYnV0IHdpbGwgbm90IHdvcmsgdG8gY2FsbCB0aGUgYG9uQ2VsbENsaWNrZWRgIGZ1bmN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01pZGRsZUNsaWNrU2Nyb2xsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBtb3VzZSB3aGVlbCBldmVudHMgd2lsbCBiZSBwYXNzZWQgdG8gdGhlIGJyb3dzZXIuIFVzZWZ1bCBpZiB5b3VyIGdyaWQgaGFzIG5vIHZlcnRpY2FsIHNjcm9sbHMgYW5kIHlvdSB3YW50IHRoZSBtb3VzZSB0byBzY3JvbGwgdGhlIGJyb3dzZXIgcGFnZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcmV2ZW50RGVmYXVsdE9uTW91c2VXaGVlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGVsbCB0aGUgZ3JpZCBob3cgd2lkZSBpbiBwaXhlbHMgdGhlIHNjcm9sbGJhciBpcywgd2hpY2ggaXMgdXNlZCBpbiBncmlkIHdpZHRoIGNhbGN1bGF0aW9ucy4gU2V0IG9ubHkgaWYgdXNpbmcgbm9uLXN0YW5kYXJkIGJyb3dzZXItcHJvdmlkZWQgc2Nyb2xsYmFycywgc28gdGhlIGdyaWQgY2FuIHVzZSB0aGUgbm9uLXN0YW5kYXJkIHNpemUgaW4gaXRzIGNhbGN1bGF0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNjcm9sbGJhcldpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFR5cGUgb2YgUm93IFNlbGVjdGlvbjogYHNpbmdsZWAsIGBtdWx0aXBsZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTZWxlY3Rpb246IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBtdWx0aXBsZSByb3dzIHRvIGJlIHNlbGVjdGVkIHVzaW5nIHNpbmdsZSBjbGljay4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgcm93cyB3aWxsIG5vdCBiZSBkZXNlbGVjdGVkIGlmIHlvdSBob2xkIGRvd24gYEN0cmxgIGFuZCBjbGljayB0aGUgcm93IG9yIHByZXNzIGBTcGFjZWAuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RGVzZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgcm93IHNlbGVjdGlvbiB3b24ndCBoYXBwZW4gd2hlbiByb3dzIGFyZSBjbGlja2VkLiBVc2Ugd2hlbiB5b3Ugb25seSB3YW50IGNoZWNrYm94IHNlbGVjdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVGhpcyBwcm9wZXJ0eSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgYHN1cHByZXNzQ2VsbEZvY3VzYCBpbnN0ZWFkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgY2VsbHMgd29uJ3QgYmUgZm9jdXNhYmxlLiBUaGlzIG1lYW5zIGtleWJvYXJkIG5hdmlnYXRpb24gd2lsbCBiZSBkaXNhYmxlZCBmb3IgZ3JpZCBjZWxscywgYnV0IHJlbWFpbiBlbmFibGVkIGluIG90aGVyIGVsZW1lbnRzIG9mIHRoZSBncmlkIHN1Y2ggYXMgY29sdW1uIGhlYWRlcnMsIGZsb2F0aW5nIGZpbHRlcnMsIHRvb2wgcGFuZWxzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBvbmx5IGEgc2luZ2xlIHJhbmdlIGNhbiBiZSBzZWxlY3RlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGJlIGFibGUgdG8gc2VsZWN0IHRoZSB0ZXh0IHdpdGhpbiBjZWxscy5cbiAgICAgKiBcbiAgICAgKiAgICAgKipOb3RlOioqIFdoZW4gdGhpcyBpcyBzZXQgdG8gYHRydWVgLCB0aGUgY2xpcGJvYXJkIHNlcnZpY2UgaXMgZGlzYWJsZWQuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFJhbmdlIFNlbGVjdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBSYW5nZSBIYW5kbGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgRmlsbCBIYW5kbGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUZpbGxIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ3gnYCB0byBmb3JjZSB0aGUgZmlsbCBoYW5kbGUgZGlyZWN0aW9uIHRvIGhvcml6b250YWwsIG9yIHNldCB0byBgJ3knYCB0byBmb3JjZSB0aGUgZmlsbCBoYW5kbGUgZGlyZWN0aW9uIHRvIHZlcnRpY2FsLiBEZWZhdWx0OiBgeHlgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsSGFuZGxlRGlyZWN0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBwcmV2ZW50IGNlbGwgdmFsdWVzIGZyb20gYmVpbmcgY2xlYXJlZCB3aGVuIHRoZSBSYW5nZSBTZWxlY3Rpb24gaXMgcmVkdWNlZCBieSB0aGUgRmlsbCBIYW5kbGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xlYXJPbkZpbGxSZWR1Y3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IGRlZmluaW5nIHRoZSBvcmRlciBpbiB3aGljaCBzb3J0aW5nIG9jY3VycyAoaWYgc29ydGluZyBpcyBlbmFibGVkKS4gVmFsdWVzIGNhbiBiZSBgJ2FzYydgLCBgJ2Rlc2MnYCBvciBgbnVsbGAuIEZvciBleGFtcGxlOiBgc29ydGluZ09yZGVyOiBbJ2FzYycsICdkZXNjJ11gLiBEZWZhdWx0OiBgW251bGwsICdhc2MnLCAnZGVzYyddYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiAoJ2FzYycgfCAnZGVzYycgfCBudWxsKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNwZWNpZnkgdGhhdCB0aGUgc29ydCBzaG91bGQgdGFrZSBhY2NlbnRlZCBjaGFyYWN0ZXJzIGludG8gYWNjb3VudC4gSWYgdGhpcyBmZWF0dXJlIGlzIHR1cm5lZCBvbiB0aGUgc29ydCB3aWxsIGJlIHNsb3dlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlICdubyBzb3J0JyBpY29uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIG11bHRpLXNvcnQgd2hlbiB0aGUgdXNlciBzaGlmdC1jbGlja3MgYSBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnY3RybCdgIHRvIGhhdmUgbXVsdGkgc29ydGluZyB3b3JrIHVzaW5nIHRoZSBgQ3RybGAgKG9yIGBDb21tYW5kIOKMmGAgZm9yIE1hYykga2V5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbXVsdGlTb3J0S2V5OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydGluZyBvZiB1bi1zb3J0ZWQgZGF0YSB0byBtYXRjaCBvcmlnaW5hbCByb3cgZGF0YS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIHRvIHVzZSBpbnNpZGUgdGhlIGdyaWQgaW5zdGVhZCBvZiB0aGUgZ3JpZCdzIGRlZmF1bHQgaWNvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB8IHN0cmluZzsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGVmYXVsdCByb3cgaGVpZ2h0IGluIHBpeGVscy4gRGVmYXVsdDogYDI1YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93SGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBzdHlsZSBwcm9wZXJ0aWVzIHRvIGFwcGx5IHRvIGFsbCByb3dzLiBTZXQgdG8gYW4gb2JqZWN0IG9mIGtleSAoc3R5bGUgbmFtZXMpIGFuZCB2YWx1ZXMgKHN0eWxlIHZhbHVlcykgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlOiBSb3dTdHlsZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzKGVzKSBmb3IgYWxsIHJvd3MuIFByb3ZpZGUgZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSBvciBhcnJheSBvZiBzdHJpbmdzIChhcnJheSBvZiBjbGFzcyBuYW1lcykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJ1bGVzIHdoaWNoIGNhbiBiZSBhcHBsaWVkIHRvIGluY2x1ZGUgY2VydGFpbiBDU1MgY2xhc3Nlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXM6IFJvd0NsYXNzUnVsZXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IGhpZ2hsaWdodCByb3dzIGJ5IGFkZGluZyB0aGUgYGFnLXJvdy1ob3ZlcmAgQ1NTIGNsYXNzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0hvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBVc2VzIENTUyBgdG9wYCBpbnN0ZWFkIG9mIENTUyBgdHJhbnNmb3JtYCBmb3IgcG9zaXRpb25pbmcgcm93cy4gVXNlZnVsIGlmIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gaXMgY2F1c2luZyBpc3N1ZXMgc3VjaCBhcyB1c2VkIGluIHJvdyBzcGFubmluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGlnaGxpZ2h0IGNvbHVtbnMgYnkgYWRkaW5nIHRoZSBgYWctY29sdW1uLWhvdmVyYCBDU1MgY2xhc3MuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkhvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhRGlzcGxheVR5cGU6IFRyZWVEYXRhRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVGaWx0ZXJzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNQYXNzaXZlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgY29udGV4dCBtZW51LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q29udGV4dE1lbnVJdGVtczogR2V0Q29udGV4dE1lbnVJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRm9yIGN1c3RvbWlzaW5nIHRoZSBtYWluICdjb2x1bW4gaGVhZGVyJyBtZW51LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0TWFpbk1lbnVJdGVtczogR2V0TWFpbk1lbnVJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHVzZXIgdG8gcHJvY2VzcyBwb3B1cHMgYWZ0ZXIgdGhleSBhcmUgY3JlYXRlZC4gQXBwbGljYXRpb25zIGNhbiB1c2UgdGhpcyBpZiB0aGV5IHdhbnQgdG8sIGZvciBleGFtcGxlLCByZXBvc2l0aW9uIHRoZSBwb3B1cC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvc3RQcm9jZXNzUG9wdXA6ICgocGFyYW1zOiBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGNlbGxzIGZvciB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBgRGF0ZWAgb2JqZWN0cyB0aGF0IG5lZWQgdG8gaGF2ZSBhIHBhcnRpY3VsYXIgZm9ybWF0IGlmIGltcG9ydGluZyBpbnRvIEV4Y2VsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtcykgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBjbGlwYm9hcmQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzSGVhZGVyRm9yQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtcykgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGdyb3VwIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBjbGlwYm9hcmQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzR3JvdXBIZWFkZXJGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzR3JvdXBIZWFkZXJGb3JFeHBvcnRQYXJhbXMpID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBjZWxscyBmcm9tIHRoZSBjbGlwYm9hcmQuIEhhbmR5IGlmIGZvciBleGFtcGxlIHlvdSBoYXZlIG51bWJlciBmaWVsZHMsIGFuZCB3YW50IHRvIGJsb2NrIG5vbi1udW1iZXJzIGZyb20gZ2V0dGluZyBpbnRvIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGcm9tQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXMpID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gZ2V0IHRoZSBkYXRhIHRoYXQgd291bGQgb3RoZXJ3aXNlIGdvIHRvIHRoZSBjbGlwYm9hcmQuIFRvIGJlIHVzZWQgd2hlbiB5b3Ugd2FudCB0byBjb250cm9sIHRoZSAnY29weSB0byBjbGlwYm9hcmQnIG9wZXJhdGlvbiB5b3Vyc2VsZi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlbmRUb0NsaXBib2FyZDogKChwYXJhbXM6IFNlbmRUb0NsaXBib2FyZFBhcmFtcykgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjb21wbGV0ZSBjb250cm9sIG9mIHRoZSBwYXN0ZSBvcGVyYXRpb24sIGluY2x1ZGluZyBjYW5jZWxsaW5nIHRoZSBvcGVyYXRpb24gKHNvIG5vdGhpbmcgaGFwcGVucykgb3IgcmVwbGFjaW5nIHRoZSBkYXRhIHdpdGggb3RoZXIgZGF0YS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtcykgPT4gc3RyaW5nW11bXSB8IG51bGwpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBHcmlkIGNhbGxzIHRoaXMgbWV0aG9kIHRvIGtub3cgaWYgYW4gZXh0ZXJuYWwgZmlsdGVyIGlzIHByZXNlbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0V4dGVybmFsRmlsdGVyUHJlc2VudDogKCgpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG91bGQgcmV0dXJuIGB0cnVlYCBpZiBleHRlcm5hbCBmaWx0ZXIgcGFzc2VzLCBvdGhlcndpc2UgYGZhbHNlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRvZXNFeHRlcm5hbEZpbHRlclBhc3M6ICgobm9kZTogUm93Tm9kZSkgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgdG8gY3VzdG9taXNlIHRoZSBjaGFydCB0b29sYmFyIGl0ZW1zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hhcnRUb29sYmFySXRlbXM6IEdldENoYXJ0VG9vbGJhckl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBlbmFibGUgZGlzcGxheWluZyB0aGUgY2hhcnQgaW4gYW4gYWx0ZXJuYXRpdmUgY2hhcnQgY29udGFpbmVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3JlYXRlQ2hhcnRDb250YWluZXI6ICgocGFyYW1zOiBDaGFydFJlZikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgbmF2aWdhdGlvbiAoYXJyb3cpIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dEhlYWRlcjogKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zKSA9PiAoSGVhZGVyUG9zaXRpb24gfCBudWxsKSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgYFRhYmAga2V5IHdoZW4gYSBoZWFkZXIgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IEhlYWRlciBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBgbnVsbGAgdG8gc3RheSBvbiBjdXJyZW50IGhlYWRlci4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dEhlYWRlcjogKChwYXJhbXM6IFRhYlRvTmV4dEhlYWRlclBhcmFtcykgPT4gKEhlYWRlclBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIG5hdmlnYXRpb24gKGFycm93KSBrZXkgd2hlbiBhIGNlbGwgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IENlbGwgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRDZWxsOiAoKHBhcmFtczogTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zKSA9PiAoQ2VsbFBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgY2VsbCBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgQ2VsbCBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBudWxsIHRvIHN0YXkgb24gY3VycmVudCBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0Q2VsbDogKChwYXJhbXM6IFRhYlRvTmV4dENlbGxQYXJhbXMpID0+IChDZWxsUG9zaXRpb24gfCBudWxsKSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFN1cHByZXNzIHRoZSBncmlkIHRha2luZyBhY3Rpb24gZm9yIHRoZSByZWxldmFudCBrZXlib2FyZCBldmVudCB3aGVuIGEgY2VsbCBpcyBmb2N1c2VkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NLZXlib2FyZEV2ZW50OiAoKHBhcmFtczogU3VwcHJlc3NLZXlib2FyZEV2ZW50UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHRGdW5jOiAoKGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IHN0cmluZywgdmFyaWFibGVWYWx1ZXM/OiBzdHJpbmdbXSkgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgd2hhdCBgZG9jdW1lbnRgIGlzIHVzZWQuIEN1cnJlbnRseSB1c2VkIGJ5IERyYWcgYW5kIERyb3AgKG1heSBleHRlbmQgdG8gb3RoZXIgcGxhY2VzIGluIHRoZSBmdXR1cmUpLiBVc2UgdGhpcyB3aGVuIHlvdSB3YW50IHRoZSBncmlkIHRvIHVzZSBhIGRpZmZlcmVudCBgZG9jdW1lbnRgIHRoYW4gdGhlIG9uZSBhdmFpbGFibGUgb24gdGhlIGdsb2JhbCBzY29wZS4gVGhpcyBjYW4gaGFwcGVuIGlmIGRvY2tpbmcgb3V0IGNvbXBvbmVudHMgKHNvbWV0aGluZyB3aGljaCBFbGVjdHJvbiBzdXBwb3J0cykgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldERvY3VtZW50OiAoKCkgPT4gRG9jdW1lbnQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBmb3JtYXQgdGhlIG51bWJlcnMgaW4gdGhlIHBhZ2luYXRpb24gcGFuZWwsIGkuZS4gJ3JvdyBjb3VudCcgYW5kICdwYWdlIG51bWJlcicgbGFiZWxzLiBUaGlzIGlzIGZvciBwYWdpbmF0aW9uIHBhbmVsIG9ubHksIHRvIGZvcm1hdCBudW1iZXJzIGluc2lkZSB0aGUgZ3JpZCdzIGNlbGxzIChpLmUuIHlvdXIgZGF0YSksIHRoZW4gdXNlIGB2YWx1ZUZvcm1hdHRlcmAgaW4gdGhlIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXI6ICgocGFyYW1zOiBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayBmb3IgZ3JvdXBpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd0FnZ05vZGVzOiAoKG5vZGVzOiBSb3dOb2RlW10pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIChDbGllbnQtc2lkZSBSb3cgTW9kZWwgb25seSkgQWxsb3dzIGdyb3VwcyB0byBiZSBvcGVuIGJ5IGRlZmF1bHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0dyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGRlZmF1bHQgc29ydGluZyBvZiBncm91cHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0R3JvdXBPcmRlckNvbXBhcmF0b3I6ICgobm9kZUE6IFJvd05vZGUsIG5vZGVCOiBSb3dOb2RlKSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggcGl2b3RpbmcsIHRvIGFsbG93IGNoYW5naW5nIHRoZSBzZWNvbmQgY29sdW1uIGRlZmluaXRpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sRGVmOiAoKGNvbERlZjogQ29sRGVmKSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIHBpdm90aW5nLCB0byBhbGxvdyBjaGFuZ2luZyB0aGUgc2Vjb25kIGNvbHVtbiBncm91cCBkZWZpbml0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1NlY29uZGFyeUNvbEdyb3VwRGVmOiAoKGNvbEdyb3VwRGVmOiBDb2xHcm91cERlZikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2hlbiB3b3JraW5nIHdpdGggVHJlZSBEYXRhIHdoZW4gYHRyZWVEYXRhID0gdHJ1ZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREYXRhUGF0aDogR2V0RGF0YVBhdGggfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGRlZmF1bHRHcm91cE9yZGVyQ29tcGFyYXRvciBpbnN0ZWFkXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRHcm91cFNvcnRDb21wYXJhdG9yOiAoKG5vZGVBOiBSb3dOb2RlLCBub2RlQjogUm93Tm9kZSkgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNldHRpbmcgdGhlIGNoaWxkIGNvdW50IGZvciBhIGdyb3VwIHJvdy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENoaWxkQ291bnQ6ICgoZGF0YUl0ZW06IGFueSkgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHByb3ZpZGluZyBkaWZmZXJlbnQgcGFyYW1zIGZvciBkaWZmZXJlbnQgbGV2ZWxzIG9mIGdyb3VwaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zOiAoKHBhcmFtczogR2V0U2VydmVyU2lkZVN0b3JlUGFyYW1zUGFyYW1zKSA9PiBTZXJ2ZXJTaWRlU3RvcmVQYXJhbXMpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgZ3JvdXBzIHRvIGJlIG9wZW4gYnkgZGVmYXVsdC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjYW5jZWxsaW5nIHRyYW5zYWN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb246IElzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNTUk0gVHJlZSBEYXRhOiBBbGxvd3Mgc3BlY2lmeWluZyB3aGljaCByb3dzIGFyZSBleHBhbmRhYmxlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXA6IElzU2VydmVyU2lkZUdyb3VwIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTU1JNIFRyZWUgRGF0YTogQWxsb3dzIHNwZWNpZnlpbmcgZ3JvdXAga2V5cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cEtleTogR2V0U2VydmVyU2lkZUdyb3VwS2V5IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSZXR1cm4gYSBidXNpbmVzcyBrZXkgZm9yIHRoZSBub2RlLiBJZiBpbXBsZW1lbnRlZCwgZWFjaCByb3cgaW4gdGhlIERPTSB3aWxsIGhhdmUgYW4gYXR0cmlidXRlIGByb3ctaWQ9J2FiYydgIHdoZXJlIGBhYmNgIGlzIHdoYXQgeW91IHJldHVybiBhcyB0aGUgYnVzaW5lc3Mga2V5LlxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGZvciBhdXRvbWF0ZWQgdGVzdGluZywgYXMgaXQgcHJvdmlkZXMgYSB3YXkgZm9yIHlvdXIgdG9vbCB0byBpZGVudGlmeSByb3dzIGJhc2VkIG9uIHVuaXF1ZSBidXNpbmVzcyBrZXlzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0QnVzaW5lc3NLZXlGb3JOb2RlOiAoKG5vZGU6IFJvd05vZGUpID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBnZXRSb3dJZCBpbnN0ZWFkIC0gaG93ZXZlciBiZSBhd2FyZSwgZ2V0Um93SWQoKSB3aWxsIGFsc28gc2V0IGdyaWQgb3B0aW9uIGltbXV0YWJsZURhdGE9dHJ1ZSBcbkFsbG93cyB5b3UgdG8gc2V0IHRoZSBJRCBmb3IgYSBwYXJ0aWN1bGFyIHJvdyBub2RlIGJhc2VkIG9uIHRoZSBkYXRhLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dOb2RlSWQ6IEdldFJvd05vZGVJZEZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gc2V0IHRoZSBJRCBmb3IgYSBwYXJ0aWN1bGFyIHJvdyBiYXNlZCBvbiB0aGUgZGF0YS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0lkOiBHZXRSb3dJZEZ1bmMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyByb3dzIGFmdGVyIHRoZXkgYXJlIGNyZWF0ZWQsIHNvIHlvdSBjYW4gZG8gZmluYWwgYWRkaW5nIG9mIGN1c3RvbSBhdHRyaWJ1dGVzIGV0Yy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NSb3dQb3N0Q3JlYXRlOiAoKHBhcmFtczogUHJvY2Vzc1Jvd1BhcmFtcykgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIHJvd3MgYXJlIHNlbGVjdGFibGUuIEJ5IGRlZmF1bHQgcm93cyBhcmUgc2VsZWN0YWJsZSwgc28gcmV0dXJuIGBmYWxzZWAgdG8gbWFrZSBhIHJvdyB1bi1zZWxlY3RhYmxlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dTZWxlY3RhYmxlOiBJc1Jvd1NlbGVjdGFibGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBNYXN0ZXIgRGV0YWlsIHRvIGRldGVybWluZSBpZiBhIHJvdyBzaG91bGQgYmUgYSBtYXN0ZXIgcm93LiBJZiBgZmFsc2VgIGlzIHJldHVybmVkIG5vIGRldGFpbCByb3cgd2lsbCBleGlzdCBmb3IgdGhpcyByb3cuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd01hc3RlcjogSXNSb3dNYXN0ZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGZpbGwgdmFsdWVzIGluc3RlYWQgb2Ygc2ltcGx5IGNvcHlpbmcgdmFsdWVzIG9yIGluY3JlYXNpbmcgbnVtYmVyIHZhbHVlcyB1c2luZyBsaW5lYXIgcHJvZ3Jlc3Npb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsT3BlcmF0aW9uOiAoKHBhcmFtczogRmlsbE9wZXJhdGlvblBhcmFtcykgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gcGVyZm9ybSBhZGRpdGlvbmFsIHNvcnRpbmcgYWZ0ZXIgdGhlIGdyaWQgaGFzIHNvcnRlZCB0aGUgcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvc3RTb3J0OiAoKG5vZGVzOiBSb3dOb2RlW10pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dTdHlsZWAgdG8gc2V0IHN0eWxlIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYW4gb2JqZWN0IG9mIENTUyB2YWx1ZXMgb3IgdW5kZWZpbmVkIGZvciBubyBzdHlsZXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dTdHlsZTogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zKSA9PiBSb3dTdHlsZSB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd0NsYXNzYCB0byBzZXQgY2xhc3MoZXMpIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSwgYXJyYXkgb2Ygc3RyaW5ncyAoYXJyYXkgb2YgY2xhc3MgbmFtZXMpIG9yIHVuZGVmaW5lZCBmb3Igbm8gY2xhc3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzczogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zKSA9PiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd0hlaWdodGAgdG8gc2V0IGhlaWdodCBmb3IgZWFjaCByb3cgaW5kaXZpZHVhbGx5LiBGdW5jdGlvbiBzaG91bGQgcmV0dXJuIGEgcG9zaXRpdmUgbnVtYmVyIG9mIHBpeGVscywgb3IgcmV0dXJuIGBudWxsYC9gdW5kZWZpbmVkYCB0byB1c2UgdGhlIGRlZmF1bHQgcm93IGhlaWdodC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0hlaWdodDogKChwYXJhbXM6IFJvd0hlaWdodFBhcmFtcykgPT4gbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRlbGxzIHRoZSBncmlkIGlmIHRoaXMgcm93IHNob3VsZCBiZSByZW5kZXJlZCBhcyBmdWxsIHdpZHRoLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNGdWxsV2lkdGhDZWxsOiAoKHJvd05vZGU6IFJvd05vZGUpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgLyoqIFRoZSB0b29sIHBhbmVsIHdhcyBoaWRkZW4gb3Igc2hvd24uIFVzZSBgYXBpLmlzVG9vbFBhbmVsU2hvd2luZygpYCB0byBnZXQgc3RhdHVzLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFBhc3RlIG9wZXJhdGlvbiBoYXMgc3RhcnRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZVN0YXJ0OiBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PigpO1xuICAgIC8qKiBQYXN0ZSBvcGVyYXRpb24gaGFzIGVuZGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlRW5kOiBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ+KCk7XG4gICAgLyoqIEEgY29sdW1uLCBvciBncm91cCBvZiBjb2x1bW5zLCB3YXMgaGlkZGVuIC8gc2hvd24uICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmlzaWJsZTogRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudD4oKTtcbiAgICAvKiogQSBjb2x1bW4sIG9yIGdyb3VwIG9mIGNvbHVtbnMsIHdhcyBwaW5uZWQgLyB1bnBpbm5lZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaW5uZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaW5uZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgcmVzaXplZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5SZXNpemVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgbW92ZWQuIFRvIGZpbmQgb3V0IHdoZW4gdGhlIGNvbHVtbiBtb3ZlIGlzIGZpbmlzaGVkIHlvdSBjYW4gdXNlIHRoZSBgZHJhZ1N0b3BwZWRgIGV2ZW50IGJlbG93LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbk1vdmVkRXZlbnQ+KCk7XG4gICAgLyoqIEEgdmFsdWUgY29sdW1uIHdhcyBhZGRlZCBvciByZW1vdmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBwaXZvdCBtb2RlIGZsYWcgd2FzIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RNb2RlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogQSBwaXZvdCBjb2x1bW4gd2FzIGFkZGVkLCByZW1vdmVkIG9yIG9yZGVyIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogQSBjb2x1bW4gZ3JvdXAgd2FzIG9wZW5lZCAvIGNsb3NlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PigpO1xuICAgIC8qKiBVc2VyIHNldCBuZXcgY29sdW1ucy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBuZXdDb2x1bW5zTG9hZGVkOiBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBncmlkIGNvbHVtbnMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBkaXNwbGF5ZWQgY29sdW1ucyBjaGFuZ2VkLiBUaGlzIGNhbiByZXN1bHQgZnJvbSBjb2x1bW5zIG9wZW4gLyBjbG9zZSwgY29sdW1uIG1vdmUsIHBpdm90LCBncm91cCwgZXRjLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIHJlbmRlcmVkIGNvbHVtbnMgY2hhbmdlZCAob25seSBjb2x1bW5zIGluIHRoZSB2aXNpYmxlIHNjcm9sbGVkIHZpZXdwb3J0IGFyZSByZW5kZXJlZCBieSBkZWZhdWx0KS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBTaG90Z3VuIC0gZ2V0cyBjYWxsZWQgd2hlbiBlaXRoZXIgYSkgbmV3IGNvbHVtbnMgYXJlIHNldCBvciBiKSBgY29sdW1uQXBpLnNldFN0YXRlKClgIGlzIHVzZWQsIHNvIGV2ZXJ5dGhpbmcgaGFzIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogT25seSB1c2VkIGJ5IEFuZ3VsYXIsIFJlYWN0IGFuZCBWdWVKUyBBRyBHcmlkIGNvbXBvbmVudHMgKG5vdCB1c2VkIGlmIGRvaW5nIHBsYWluIEphdmFTY3JpcHQpLlxuICAgICAqIElmIHRoZSBncmlkIHJlY2VpdmVzIGNoYW5nZXMgZHVlIHRvIGJvdW5kIHByb3BlcnRpZXMsIHRoaXMgZXZlbnQgZmlyZXMgYWZ0ZXIgdGhlIGdyaWQgaGFzIGZpbmlzaGVkIHByb2Nlc3NpbmcgdGhlIGNoYW5nZS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb21wb25lbnRTdGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBWYWx1ZSBoYXMgY2hhbmdlZCBhZnRlciBlZGl0aW5nLiBUaGlzIGV2ZW50IHdpbGwgbm90IGZpcmUgaWYgZWRpdGluZyB3YXMgY2FuY2VsbGVkIChlZyBFU0Mgd2FzIHByZXNzZWQpLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFZhbHVlIGhhcyBjaGFuZ2VkIGFmdGVyIGVkaXRpbmcuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBSZWFkIE9ubHkgRWRpdHMsIGllIGByZWFkT25seUVkaXQ9dHJ1ZWAuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRSZXF1ZXN0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdFJlcXVlc3RFdmVudD4oKTtcbiAgICAvKiogQSBjZWxsJ3MgdmFsdWUgd2l0aGluIGEgcm93IGhhcyBjaGFuZ2VkLiBUaGlzIGV2ZW50IGNvcnJlc3BvbmRzIHRvIEZ1bGwgUm93IEVkaXRpbmcgb25seS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1ZhbHVlQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgY2VsbCBoYXMgc3RhcnRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgY2VsbCBoYXMgc3RvcHBlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdGFydGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RhcnRlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBGdWxsIFJvdyBFZGl0aW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSByb3cgaGFzIHN0b3BwZWQgKHdoZW4gcm93IGVkaXRpbmcgaXMgZW5hYmxlZCkuIFdoZW4gcm93IGVkaXRpbmcsIHRoaXMgZXZlbnQgd2lsbCBiZSBmaXJlZCBvbmNlIGFuZCBgY2VsbEVkaXRpbmdTdG9wcGVkYCB3aWxsIGJlIGZpcmVkIGZvciBlYWNoIGluZGl2aWR1YWwgY2VsbC4gT25seSBmaXJlcyB3aGVuIGRvaW5nIEZ1bGwgUm93IEVkaXRpbmcuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RvcHBlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudD4oKTtcbiAgICAvKiogRmlsdGVyIGhhcyBiZWVuIG9wZW5lZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWx0ZXJPcGVuZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJPcGVuZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck9wZW5lZEV2ZW50PigpO1xuICAgIC8qKiBGaWx0ZXIgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIGFwcGxpZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogRmlsdGVyIHdhcyBtb2RpZmllZCBidXQgbm90IGFwcGxpZWQuIFVzZWQgd2hlbiBmaWx0ZXJzIGhhdmUgJ0FwcGx5JyBidXR0b25zLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck1vZGlmaWVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyTW9kaWZpZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ+KCk7XG4gICAgLyoqIEEgY2hhcnQgaGFzIGJlZW4gY3JlYXRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydENyZWF0ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWQ+KCk7XG4gICAgLyoqIFRoZSBkYXRhIHJhbmdlIGZvciB0aGUgY2hhcnQgaGFzIGJlZW4gY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ+KCk7XG4gICAgLyoqIEZvcm1hdHRpbmcgY2hhbmdlcyBoYXZlIGJlZW4gbWFkZSBieSB1c2VycyB0aHJvdWdoIHRoZSBGb3JtYXQgUGFuZWwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRPcHRpb25zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0T3B0aW9uc0NoYW5nZWQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGRlc3Ryb3llZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydERlc3Ryb3llZDogRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnREZXN0cm95ZWQ+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5RG93bmAgaGFwcGVuZWQgb24gYSBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5RG93bkV2ZW50IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudD4oKTtcbiAgICAvKiogRE9NIGV2ZW50IGBrZXlQcmVzc2AgaGFwcGVuZWQgb24gYSBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlQcmVzczogRXZlbnRFbWl0dGVyPENlbGxLZXlQcmVzc0V2ZW50IHwgRnVsbFdpZHRoQ2VsbEtleVByZXNzRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudCB8IEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50PigpO1xuICAgIC8qKiBUaGUgZ3JpZCBoYXMgaW5pdGlhbGlzZWQuIFVzZSB0aGlzIGV2ZW50IGlmLCBmb3IgZXhhbXBsZSwgeW91IG5lZWQgdG8gdXNlIHRoZSBncmlkJ3MgQVBJIHRvIGZpeCB0aGUgY29sdW1ucyB0byBzaXplLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRSZWFkeTogRXZlbnRFbWl0dGVyPEdyaWRSZWFkeUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ+KCk7XG4gICAgLyoqIEZpcmVkIHRoZSBmaXJzdCB0aW1lIGRhdGEgaXMgcmVuZGVyZWQgaW50byB0aGUgZ3JpZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaXJzdERhdGFSZW5kZXJlZDogRXZlbnRFbWl0dGVyPEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaXJzdERhdGFSZW5kZXJlZEV2ZW50PigpO1xuICAgIC8qKiBUaGUgc2l6ZSBvZiB0aGUgZ3JpZCBgZGl2YCBoYXMgY2hhbmdlZC4gSW4gb3RoZXIgd29yZHMsIHRoZSBncmlkIHdhcyByZXNpemVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRTaXplQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEdyaWRTaXplQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIERpc3BsYXllZCByb3dzIGhhdmUgY2hhbmdlZC4gVHJpZ2dlcmVkIGFmdGVyIHNvcnQsIGZpbHRlciBvciB0cmVlIGV4cGFuZCAvIGNvbGxhcHNlIGV2ZW50cy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPE1vZGVsVXBkYXRlZEV2ZW50PigpO1xuICAgIC8qKiBBIHJvdyB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBET00sIGZvciBhbnkgcmVhc29uLiBVc2UgdG8gY2xlYW4gdXAgcmVzb3VyY2VzIChpZiBhbnkpIHVzZWQgYnkgdGhlIHJvdy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsUm93UmVtb3ZlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50PigpO1xuICAgIC8qKiBXaGljaCByb3dzIGFyZSByZW5kZXJlZCBpbiB0aGUgRE9NIGhhcyBjaGFuZ2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpZXdwb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFZpZXdwb3J0Q2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBib2R5IHdhcyBzY3JvbGxlZCBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PigpO1xuICAgIC8qKiBNYWluIGJvZHkgb2YgdGhlIGdyaWQgaGFzIHN0b3BwZWQgc2Nyb2xsaW5nLCBlaXRoZXIgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbEVuZDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudD4oKTtcbiAgICAvKiogV2hlbiBkcmFnZ2luZyBzdGFydHMuIFRoaXMgY291bGQgYmUgYW55IGFjdGlvbiB0aGF0IHVzZXMgdGhlIGdyaWQncyBEcmFnIGFuZCBEcm9wIHNlcnZpY2UsIGUuZy4gQ29sdW1uIE1vdmluZywgQ29sdW1uIFJlc2l6aW5nLCBSYW5nZSBTZWxlY3Rpb24sIEZpbGwgSGFuZGxlLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RhcnRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudD4oKTtcbiAgICAvKiogV2hlbiBkcmFnZ2luZyBzdG9wcy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RvcHBlZDogRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PigpO1xuICAgIC8qKiBUcmlnZ2VyZWQgZXZlcnkgdGltZSB0aGUgcGFnaW5nIHN0YXRlIGNoYW5nZXMuIFNvbWUgb2YgdGhlIG1vc3QgY29tbW9uIHNjZW5hcmlvcyBmb3IgdGhpcyBldmVudCB0byBiZSB0cmlnZ2VyZWQgYXJlOlxuICAgICAqIFxuICAgICAqICAgLSBUaGUgcGFnZSBzaXplIGNoYW5nZXMuXG4gICAgICogICAtIFRoZSBjdXJyZW50IHNob3duIHBhZ2UgaXMgY2hhbmdlZC5cbiAgICAgKiAgIC0gTmV3IGRhdGEgaXMgbG9hZGVkIG9udG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFnaW5hdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogQSBkcmFnIGhhcyBzdGFydGVkLCBvciBkcmFnZ2luZyB3YXMgYWxyZWFkeSBzdGFydGVkIGFuZCB0aGUgbW91c2UgaGFzIHJlLWVudGVyZWQgdGhlIGdyaWQgaGF2aW5nIHByZXZpb3VzbHkgbGVmdCB0aGUgZ3JpZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW50ZXI6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbW92ZWQgd2hpbGUgZHJhZ2dpbmcuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ01vdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbGVmdCB0aGUgZ3JpZCB3aGlsZSBkcmFnZ2luZy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTGVhdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBkcmFnIGhhcyBmaW5pc2hlZCBvdmVyIHRoZSBncmlkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbmQ6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ+KCk7XG4gICAgLyoqIEEgcm93IGdyb3VwIGNvbHVtbiB3YXMgYWRkZWQgb3IgcmVtb3ZlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50PigpO1xuICAgIC8qKiBBIHJvdyBncm91cCB3YXMgb3BlbmVkIG9yIGNsb3NlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dHcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PigpO1xuICAgIC8qKiBGaXJlZCB3aGVuIGNhbGxpbmcgZWl0aGVyIG9mIHRoZSBBUEkgbWV0aG9kcyBgZXhwYW5kQWxsKClgIG9yIGBjb2xsYXBzZUFsbCgpYC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBleHBhbmRPckNvbGxhcHNlQWxsOiBFdmVudEVtaXR0ZXI8RXhwYW5kQ29sbGFwc2VBbGxFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ+KCk7XG4gICAgLyoqIFRoZSBjbGllbnQgaGFzIHNldCBuZXcgcGlubmVkIHJvdyBkYXRhIGludG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGlubmVkUm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogVGhlIGNsaWVudCBoYXMgc2V0IG5ldyBkYXRhIGludG8gdGhlIGdyaWQgdXNpbmcgYGFwaS5zZXRSb3dEYXRhKClgIG9yIGJ5IGNoYW5naW5nIHRoZSBgcm93RGF0YWAgYm91bmQgcHJvcGVydHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhQ2hhbmdlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YUNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogVGhlIGNsaWVudCBoYXMgdXBkYXRlZCBkYXRhIGZvciB0aGUgZ3JpZCB1c2luZyBgYXBpLmFwcGx5VHJhbnNhY3Rpb24odHJhbnNhY3Rpb24pYCBvciBieSBjaGFuZ2luZyB0aGUgYHJvd0RhdGFgIGJvdW5kIHByb3BlcnR5IHdpdGggYGltbXV0YWJsZURhdGE9dHJ1ZWAuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhVXBkYXRlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudD4oKTtcbiAgICAvKiogQXN5bmMgdHJhbnNhY3Rpb25zIGhhdmUgYmVlbiBhcHBsaWVkLiBDb250YWlucyBhIGxpc3Qgb2YgYWxsIHRyYW5zYWN0aW9uIHJlc3VsdHMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkOiBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPiA9IG5ldyBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPigpO1xuICAgIC8qKiBDZWxsIGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsQ2xpY2tlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudD4oKTtcbiAgICAvKiogQ2VsbCBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PigpO1xuICAgIC8qKiBDZWxsIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEZvY3VzZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRm9jdXNlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudD4oKTtcbiAgICAvKiogTW91c2UgZW50ZXJlZCBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU92ZXI6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ+KCk7XG4gICAgLyoqIE1vdXNlIGxlZnQgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdXQ6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZU91dEV2ZW50PigpO1xuICAgIC8qKiBNb3VzZSBkb3duIG9uIGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlRG93bjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudD4oKTtcbiAgICAvKiogUm93IGlzIGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93Q2xpY2tlZDogRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudD4oKTtcbiAgICAvKiogUm93IGlzIGRvdWJsZSBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ+KCk7XG4gICAgLyoqIFJvdyBpcyBzZWxlY3RlZCBvciBkZXNlbGVjdGVkLiBUaGUgZXZlbnQgY29udGFpbnMgdGhlIG5vZGUgaW4gcXVlc3Rpb24sIHNvIGNhbGwgdGhlIG5vZGUncyBgaXNTZWxlY3RlZCgpYCBtZXRob2QgdG8gc2VlIGlmIGl0IHdhcyBqdXN0IHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93U2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudD4oKTtcbiAgICAvKiogUm93IHNlbGVjdGlvbiBpcyBjaGFuZ2VkLiBVc2UgdGhlIGdyaWQgQVBJIGBnZXRTZWxlY3RlZE5vZGVzKClgIHRvIGdldCB0aGUgbmV3IGxpc3Qgb2Ygc2VsZWN0ZWQgbm9kZXMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogQ2VsbCBpcyByaWdodCBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDb250ZXh0TWVudTogRXZlbnRFbWl0dGVyPENlbGxDb250ZXh0TWVudUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ+KCk7XG4gICAgLyoqIEEgY2hhbmdlIHRvIHJhbmdlIHNlbGVjdGlvbiBoYXMgb2NjdXJyZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudD4oKTtcbiAgICAvKiogU29ydCBoYXMgY2hhbmdlZC4gVGhlIGdyaWQgYWxzbyBsaXN0ZW5zIGZvciB0aGlzIGFuZCB1cGRhdGVzIHRoZSBtb2RlbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudD4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQ+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50PigpO1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudD4oKTtcblxuXG4gICAgLy8gRW5hYmxlIHR5cGUgY29lcmNpb24gZm9yIGJvb2xlYW4gSW5wdXRzIHRvIHN1cHBvcnQgdXNlIGxpa2UgJ2VuYWJsZUNoYXJ0cycgaW5zdGVhZCBvZiBmb3JjaW5nICdbZW5hYmxlQ2hhcnRzXT1cInRydWVcIicgXG4gICAgLy8gaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3RlbXBsYXRlLXR5cGVjaGVjayNpbnB1dC1zZXR0ZXItY29lcmNpb24gXG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDZWxsRm9jdXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVidWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbmd1bGFyQ29tcGlsZVJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FuZ3VsYXJDb21waWxlRmlsdGVyczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEluY2x1ZGVGb290ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwSW5jbHVkZVRvdGFsRm9vdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFVzZUVudGlyZVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91blNvcnRJY29uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc05vUm93c092ZXJsYXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWx0YVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVtZW1iZXJHcm91cFN0YXRlV2hlbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlHcm91cEhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3RNb2RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FuaW1hdGVSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUnRsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnTXVsdGlSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUdyb3VwRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZXByZWNhdGVkRW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwTXVsdGlBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5HcmlkTG9zZXNGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3B1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlbHRhUm93RGF0YU1vZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Vuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90cmVlRGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0VudGVycHJpc2VSZXNldE9uTmV3Q29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0aW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1NldENvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDaGFydHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlbHRhQ29sdW1uTW9kZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9leGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Rvb2x0aXBNb3VzZVRyYWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9rZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2ltbXV0YWJsZURhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2ltbXV0YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXBwbHlDb2x1bW5EZWZPcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGV0YWlsUm93QXV0b0hlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUZpbHRlcmluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Nob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVhY3RVaTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSZWFjdFVpOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZWFkT25seUVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgLy8gQEVOREBcbn1cblxuIl19