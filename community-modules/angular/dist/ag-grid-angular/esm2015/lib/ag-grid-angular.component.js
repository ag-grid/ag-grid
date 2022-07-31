import { Component, ContentChildren, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { ComponentUtil, Grid, AgPromise } from "@ag-grid-community/core";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import { AgGridColumn } from "./ag-grid-column.component";
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
        /** @deprecated Set via `defaultColDef.width`     */
        this.colWidth = undefined;
        /** @deprecated Set via `defaultColDef.minWidth`     */
        this.minColWidth = undefined;
        /** @deprecated Set via `defaultColDef.maxWidth`     */
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
        /** @deprecated Use stopEditingWhenCellsLoseFocus instead     */
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
        /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams     */
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
         * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.     */
        this.detailCellRenderer = undefined;
        /** @deprecated As of v27, use `detailCellRenderer` for framework components too.     */
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
        /** @deprecated As of v27, use `loadingOverlayComponent` for framework components too.     */
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
        /** @deprecated As of v27, use `fullWidthCellRenderer` for framework components too.     */
        this.fullWidthCellRendererFramework = undefined;
        /** Customise the parameters provided to the `fullWidthCellRenderer` component.     */
        this.fullWidthCellRendererParams = undefined;
        /** Set to `true` to have the detail grid embedded in the master grid's container and so link their horizontal scrolling.     */
        this.embedFullWidthRows = undefined;
        /** @deprecated     */
        this.deprecatedEmbedFullWidthRows = undefined;
        /** Specifies how the results of row grouping should be displayed.
         *
         *  The options are:
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
        /** @deprecated As of v27, use `groupRowRenderer` for framework components too.     */
        this.groupRowRendererFramework = undefined;
        /** Customise the parameters provided to the `groupRowRenderer` component.     */
        this.groupRowRendererParams = undefined;
        /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping. Default: `false`     */
        this.suppressMakeColumnVisibleAfterUnGroup = undefined;
        /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.     */
        this.treeData = undefined;
        /** @deprecated - this is now groupRowRendererParams.innerRenderer     */
        this.groupRowInnerRenderer = undefined;
        /** @deprecated - this is now groupRowRendererParams.innerRenderer     */
        this.groupRowInnerRendererFramework = undefined;
        /** @deprecated - Use groupDisplayType = 'multipleColumns' instead     */
        this.groupMultiAutoColumn = undefined;
        /** @deprecated - Use groupDisplayType = 'groupRows' instead     */
        this.groupUseEntireRow = undefined;
        /** @deprecated - Use groupDisplayType = 'custom' instead     */
        this.groupSuppressAutoColumn = undefined;
        /** @deprecated - no longer needed, transaction updates keep group state     */
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
             * Enables Immutable Data mode, for compatibility with immutable stores. Default: `false`     */
        this.immutableData = undefined;
        /** How many milliseconds to wait before executing a batch of async transactions.     */
        this.asyncTransactionWaitMillis = undefined;
        /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates. Default: `false`     */
        this.suppressModelUpdateAfterUpdateTransaction = undefined;
        /** @deprecated     */
        this.deltaRowDataMode = undefined;
        /** @deprecated use asyncTransactionWaitMillis instead     */
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
             * Deprecated in favour of serverSideInfiniteScroll. When true, Partial Store is used. When false,
             * Full Store is used.
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
        /** @deprecated This property has been deprecated. Use `serverSideSortAllLevels` instead.     */
        this.serverSideSortingAlwaysResets = undefined;
        /** @deprecated This property has been deprecated. Use `serverSideFilterAllLevels` instead.     */
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
        /** @deprecated - Set via `colDef.suppressKeyboardEvent`. If you need this to be set for every column set via the `defaultColDef.suppressKeyboardEvent` property.     */
        this.suppressKeyboardEvent = undefined;
        /** @deprecated - Use `getLocaleText` instead.     */
        this.localeTextFunc = undefined;
        /** A callback for localising text within the grid.     */
        this.getLocaleText = undefined;
        /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)     */
        this.getDocument = undefined;
        /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.     */
        this.paginationNumberFormatter = undefined;
        /** @deprecated - Use `getGroupRowAgg` instead.     */
        this.groupRowAggNodes = undefined;
        /** Callback to use when you need access to more then the current column for aggregation.     */
        this.getGroupRowAgg = undefined;
        /** (Client-side Row Model only) Allows groups to be open by default.     */
        this.isGroupOpenByDefault = undefined;
        /** Allows default sorting of groups.     */
        this.initialGroupOrderComparator = undefined;
        /** @deprecated - Use `initialGroupOrderComparator` instead     */
        this.defaultGroupOrderComparator = undefined;
        /** @deprecated - Use `processPivotResultColDef` instead     */
        this.processSecondaryColDef = undefined;
        /** @deprecated - Use `processPivotResultColGroupDef` instead     */
        this.processSecondaryColGroupDef = undefined;
        /** Callback to be used with pivoting, to allow changing the second column definition.     */
        this.processPivotResultColDef = undefined;
        /** Callback to be used with pivoting, to allow changing the second column group definition.     */
        this.processPivotResultColGroupDef = undefined;
        /** Callback to be used when working with Tree Data when `treeData = true`.     */
        this.getDataPath = undefined;
        /** @deprecated - Use initialGroupOrderComparator instead     */
        this.defaultGroupSortComparator = undefined;
        /** Allows setting the child count for a group row.     */
        this.getChildCount = undefined;
        /** Allows providing different params for different levels of grouping.     */
        this.getServerSideGroupLevelParams = undefined;
        /** @deprecated use `getServerSideGroupLevelParams` instead.     */
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
        /** @deprecated Use `postSortRows` instead     */
        this.postSort = undefined;
        /** Callback to perform additional sorting after the grid has sorted the rows.     */
        this.postSortRows = undefined;
        /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.     */
        this.getRowStyle = undefined;
        /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.     */
        this.getRowClass = undefined;
        /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.     */
        this.getRowHeight = undefined;
        /** @deprecated Use `isFullWidthRow` instead.     */
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
         *  if cell value has changed as a result of paste operation.     */
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
         *  - The page size changes.
         *  - The current shown page is changed.
         *  - New data is loaded onto the grid.     */
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
        /** @deprecated No longer fired, use onRowDataUpdated instead     */
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
}
AgGridAngular.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.16", ngImport: i0, type: AgGridAngular, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1.AngularFrameworkOverrides }, { token: i2.AngularFrameworkComponentWrapper }, { token: i0.ComponentFactoryResolver }], target: i0.ɵɵFactoryTarget.Component });
AgGridAngular.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.16", type: AgGridAngular, selector: "ag-grid-angular", inputs: { gridOptions: "gridOptions", modules: "modules", statusBar: "statusBar", sideBar: "sideBar", suppressContextMenu: "suppressContextMenu", preventDefaultOnContextMenu: "preventDefaultOnContextMenu", allowContextMenuWithControlKey: "allowContextMenuWithControlKey", suppressMenuHide: "suppressMenuHide", enableBrowserTooltips: "enableBrowserTooltips", tooltipShowDelay: "tooltipShowDelay", tooltipHideDelay: "tooltipHideDelay", tooltipMouseTrack: "tooltipMouseTrack", popupParent: "popupParent", copyHeadersToClipboard: "copyHeadersToClipboard", copyGroupHeadersToClipboard: "copyGroupHeadersToClipboard", clipboardDelimiter: "clipboardDelimiter", suppressCopyRowsToClipboard: "suppressCopyRowsToClipboard", suppressCopySingleCellRanges: "suppressCopySingleCellRanges", suppressLastEmptyLineOnPaste: "suppressLastEmptyLineOnPaste", suppressClipboardPaste: "suppressClipboardPaste", suppressClipboardApi: "suppressClipboardApi", columnDefs: "columnDefs", defaultColDef: "defaultColDef", defaultColGroupDef: "defaultColGroupDef", columnTypes: "columnTypes", maintainColumnOrder: "maintainColumnOrder", suppressFieldDotNotation: "suppressFieldDotNotation", deltaColumnMode: "deltaColumnMode", applyColumnDefOrder: "applyColumnDefOrder", immutableColumns: "immutableColumns", suppressSetColumnStateEvents: "suppressSetColumnStateEvents", suppressColumnStateEvents: "suppressColumnStateEvents", colWidth: "colWidth", minColWidth: "minColWidth", maxColWidth: "maxColWidth", headerHeight: "headerHeight", groupHeaderHeight: "groupHeaderHeight", floatingFiltersHeight: "floatingFiltersHeight", pivotHeaderHeight: "pivotHeaderHeight", pivotGroupHeaderHeight: "pivotGroupHeaderHeight", allowDragFromColumnsToolPanel: "allowDragFromColumnsToolPanel", suppressMovableColumns: "suppressMovableColumns", suppressColumnMoveAnimation: "suppressColumnMoveAnimation", suppressDragLeaveHidesColumns: "suppressDragLeaveHidesColumns", suppressRowGroupHidesColumns: "suppressRowGroupHidesColumns", colResizeDefault: "colResizeDefault", suppressAutoSize: "suppressAutoSize", autoSizePadding: "autoSizePadding", skipHeaderOnAutoSize: "skipHeaderOnAutoSize", components: "components", frameworkComponents: "frameworkComponents", editType: "editType", singleClickEdit: "singleClickEdit", suppressClickEdit: "suppressClickEdit", readOnlyEdit: "readOnlyEdit", stopEditingWhenCellsLoseFocus: "stopEditingWhenCellsLoseFocus", enterMovesDown: "enterMovesDown", enterMovesDownAfterEdit: "enterMovesDownAfterEdit", undoRedoCellEditing: "undoRedoCellEditing", undoRedoCellEditingLimit: "undoRedoCellEditingLimit", stopEditingWhenGridLosesFocus: "stopEditingWhenGridLosesFocus", defaultCsvExportParams: "defaultCsvExportParams", suppressCsvExport: "suppressCsvExport", defaultExcelExportParams: "defaultExcelExportParams", suppressExcelExport: "suppressExcelExport", excelStyles: "excelStyles", defaultExportParams: "defaultExportParams", quickFilterText: "quickFilterText", cacheQuickFilter: "cacheQuickFilter", excludeChildrenWhenTreeDataFiltering: "excludeChildrenWhenTreeDataFiltering", enableCharts: "enableCharts", chartThemes: "chartThemes", customChartThemes: "customChartThemes", chartThemeOverrides: "chartThemeOverrides", loadingCellRenderer: "loadingCellRenderer", loadingCellRendererFramework: "loadingCellRendererFramework", loadingCellRendererParams: "loadingCellRendererParams", loadingCellRendererSelector: "loadingCellRendererSelector", localeText: "localeText", masterDetail: "masterDetail", keepDetailRows: "keepDetailRows", keepDetailRowsCount: "keepDetailRowsCount", detailCellRenderer: "detailCellRenderer", detailCellRendererFramework: "detailCellRendererFramework", detailCellRendererParams: "detailCellRendererParams", detailRowHeight: "detailRowHeight", detailRowAutoHeight: "detailRowAutoHeight", groupRowsSticky: "groupRowsSticky", context: "context", alignedGrids: "alignedGrids", tabIndex: "tabIndex", rowBuffer: "rowBuffer", valueCache: "valueCache", valueCacheNeverExpires: "valueCacheNeverExpires", enableCellExpressions: "enableCellExpressions", suppressParentsInRowNodes: "suppressParentsInRowNodes", suppressTouch: "suppressTouch", suppressFocusAfterRefresh: "suppressFocusAfterRefresh", suppressAsyncEvents: "suppressAsyncEvents", suppressBrowserResizeObserver: "suppressBrowserResizeObserver", suppressPropertyNamesCheck: "suppressPropertyNamesCheck", suppressChangeDetection: "suppressChangeDetection", debug: "debug", overlayLoadingTemplate: "overlayLoadingTemplate", loadingOverlayComponent: "loadingOverlayComponent", loadingOverlayComponentFramework: "loadingOverlayComponentFramework", loadingOverlayComponentParams: "loadingOverlayComponentParams", suppressLoadingOverlay: "suppressLoadingOverlay", overlayNoRowsTemplate: "overlayNoRowsTemplate", noRowsOverlayComponent: "noRowsOverlayComponent", noRowsOverlayComponentFramework: "noRowsOverlayComponentFramework", noRowsOverlayComponentParams: "noRowsOverlayComponentParams", suppressNoRowsOverlay: "suppressNoRowsOverlay", pagination: "pagination", paginationPageSize: "paginationPageSize", paginationAutoPageSize: "paginationAutoPageSize", paginateChildRows: "paginateChildRows", suppressPaginationPanel: "suppressPaginationPanel", pivotMode: "pivotMode", pivotPanelShow: "pivotPanelShow", pivotColumnGroupTotals: "pivotColumnGroupTotals", pivotRowTotals: "pivotRowTotals", pivotSuppressAutoColumn: "pivotSuppressAutoColumn", suppressExpandablePivotGroups: "suppressExpandablePivotGroups", functionsReadOnly: "functionsReadOnly", aggFuncs: "aggFuncs", suppressAggFuncInHeader: "suppressAggFuncInHeader", suppressAggAtRootLevel: "suppressAggAtRootLevel", aggregateOnlyChangedColumns: "aggregateOnlyChangedColumns", suppressAggFilteredOnly: "suppressAggFilteredOnly", removePivotHeaderRowWhenSingleValueColumn: "removePivotHeaderRowWhenSingleValueColumn", animateRows: "animateRows", enableCellChangeFlash: "enableCellChangeFlash", cellFlashDelay: "cellFlashDelay", cellFadeDelay: "cellFadeDelay", domLayout: "domLayout", ensureDomOrder: "ensureDomOrder", enableRtl: "enableRtl", suppressColumnVirtualisation: "suppressColumnVirtualisation", suppressMaxRenderedRowRestriction: "suppressMaxRenderedRowRestriction", suppressRowVirtualisation: "suppressRowVirtualisation", rowDragManaged: "rowDragManaged", suppressRowDrag: "suppressRowDrag", suppressMoveWhenRowDragging: "suppressMoveWhenRowDragging", rowDragEntireRow: "rowDragEntireRow", rowDragMultiRow: "rowDragMultiRow", fullWidthCellRenderer: "fullWidthCellRenderer", fullWidthCellRendererFramework: "fullWidthCellRendererFramework", fullWidthCellRendererParams: "fullWidthCellRendererParams", embedFullWidthRows: "embedFullWidthRows", deprecatedEmbedFullWidthRows: "deprecatedEmbedFullWidthRows", groupDisplayType: "groupDisplayType", groupDefaultExpanded: "groupDefaultExpanded", autoGroupColumnDef: "autoGroupColumnDef", groupMaintainOrder: "groupMaintainOrder", groupSelectsChildren: "groupSelectsChildren", groupAggFiltering: "groupAggFiltering", groupIncludeFooter: "groupIncludeFooter", groupIncludeTotalFooter: "groupIncludeTotalFooter", groupSuppressBlankHeader: "groupSuppressBlankHeader", groupSelectsFiltered: "groupSelectsFiltered", showOpenedGroup: "showOpenedGroup", groupRemoveSingleChildren: "groupRemoveSingleChildren", groupRemoveLowestSingleChildren: "groupRemoveLowestSingleChildren", groupHideOpenParents: "groupHideOpenParents", rowGroupPanelShow: "rowGroupPanelShow", groupRowRenderer: "groupRowRenderer", groupRowRendererFramework: "groupRowRendererFramework", groupRowRendererParams: "groupRowRendererParams", suppressMakeColumnVisibleAfterUnGroup: "suppressMakeColumnVisibleAfterUnGroup", treeData: "treeData", groupRowInnerRenderer: "groupRowInnerRenderer", groupRowInnerRendererFramework: "groupRowInnerRendererFramework", groupMultiAutoColumn: "groupMultiAutoColumn", groupUseEntireRow: "groupUseEntireRow", groupSuppressAutoColumn: "groupSuppressAutoColumn", rememberGroupStateWhenNewData: "rememberGroupStateWhenNewData", pinnedTopRowData: "pinnedTopRowData", pinnedBottomRowData: "pinnedBottomRowData", rowModelType: "rowModelType", rowData: "rowData", immutableData: "immutableData", asyncTransactionWaitMillis: "asyncTransactionWaitMillis", suppressModelUpdateAfterUpdateTransaction: "suppressModelUpdateAfterUpdateTransaction", deltaRowDataMode: "deltaRowDataMode", batchUpdateWaitMillis: "batchUpdateWaitMillis", datasource: "datasource", cacheOverflowSize: "cacheOverflowSize", infiniteInitialRowCount: "infiniteInitialRowCount", serverSideInitialRowCount: "serverSideInitialRowCount", serverSideStoreType: "serverSideStoreType", serverSideInfiniteScroll: "serverSideInfiniteScroll", cacheBlockSize: "cacheBlockSize", maxBlocksInCache: "maxBlocksInCache", maxConcurrentDatasourceRequests: "maxConcurrentDatasourceRequests", blockLoadDebounceMillis: "blockLoadDebounceMillis", purgeClosedRowNodes: "purgeClosedRowNodes", serverSideDatasource: "serverSideDatasource", serverSideSortAllLevels: "serverSideSortAllLevels", serverSideFilterAllLevels: "serverSideFilterAllLevels", serverSideSortOnServer: "serverSideSortOnServer", serverSideFilterOnServer: "serverSideFilterOnServer", serverSideSortingAlwaysResets: "serverSideSortingAlwaysResets", serverSideFilteringAlwaysResets: "serverSideFilteringAlwaysResets", suppressEnterpriseResetOnNewColumns: "suppressEnterpriseResetOnNewColumns", viewportDatasource: "viewportDatasource", viewportRowModelPageSize: "viewportRowModelPageSize", viewportRowModelBufferSize: "viewportRowModelBufferSize", alwaysShowHorizontalScroll: "alwaysShowHorizontalScroll", alwaysShowVerticalScroll: "alwaysShowVerticalScroll", debounceVerticalScrollbar: "debounceVerticalScrollbar", suppressHorizontalScroll: "suppressHorizontalScroll", suppressScrollOnNewData: "suppressScrollOnNewData", suppressScrollWhenPopupsAreOpen: "suppressScrollWhenPopupsAreOpen", suppressAnimationFrame: "suppressAnimationFrame", suppressMiddleClickScrolls: "suppressMiddleClickScrolls", suppressPreventDefaultOnMouseWheel: "suppressPreventDefaultOnMouseWheel", scrollbarWidth: "scrollbarWidth", rowSelection: "rowSelection", rowMultiSelectWithClick: "rowMultiSelectWithClick", suppressRowDeselection: "suppressRowDeselection", suppressRowClickSelection: "suppressRowClickSelection", suppressCellSelection: "suppressCellSelection", suppressCellFocus: "suppressCellFocus", suppressMultiRangeSelection: "suppressMultiRangeSelection", enableCellTextSelection: "enableCellTextSelection", enableRangeSelection: "enableRangeSelection", enableRangeHandle: "enableRangeHandle", enableFillHandle: "enableFillHandle", fillHandleDirection: "fillHandleDirection", suppressClearOnFillReduction: "suppressClearOnFillReduction", sortingOrder: "sortingOrder", accentedSort: "accentedSort", unSortIcon: "unSortIcon", suppressMultiSort: "suppressMultiSort", alwaysMultiSort: "alwaysMultiSort", multiSortKey: "multiSortKey", suppressMaintainUnsortedOrder: "suppressMaintainUnsortedOrder", icons: "icons", rowHeight: "rowHeight", rowStyle: "rowStyle", rowClass: "rowClass", rowClassRules: "rowClassRules", suppressRowHoverHighlight: "suppressRowHoverHighlight", suppressRowTransform: "suppressRowTransform", columnHoverHighlight: "columnHoverHighlight", deltaSort: "deltaSort", treeDataDisplayType: "treeDataDisplayType", angularCompileRows: "angularCompileRows", angularCompileFilters: "angularCompileFilters", functionsPassive: "functionsPassive", enableGroupEdit: "enableGroupEdit", getContextMenuItems: "getContextMenuItems", getMainMenuItems: "getMainMenuItems", postProcessPopup: "postProcessPopup", processCellForClipboard: "processCellForClipboard", processHeaderForClipboard: "processHeaderForClipboard", processGroupHeaderForClipboard: "processGroupHeaderForClipboard", processCellFromClipboard: "processCellFromClipboard", sendToClipboard: "sendToClipboard", processDataFromClipboard: "processDataFromClipboard", isExternalFilterPresent: "isExternalFilterPresent", doesExternalFilterPass: "doesExternalFilterPass", getChartToolbarItems: "getChartToolbarItems", createChartContainer: "createChartContainer", navigateToNextHeader: "navigateToNextHeader", tabToNextHeader: "tabToNextHeader", navigateToNextCell: "navigateToNextCell", tabToNextCell: "tabToNextCell", suppressKeyboardEvent: "suppressKeyboardEvent", localeTextFunc: "localeTextFunc", getLocaleText: "getLocaleText", getDocument: "getDocument", paginationNumberFormatter: "paginationNumberFormatter", groupRowAggNodes: "groupRowAggNodes", getGroupRowAgg: "getGroupRowAgg", isGroupOpenByDefault: "isGroupOpenByDefault", initialGroupOrderComparator: "initialGroupOrderComparator", defaultGroupOrderComparator: "defaultGroupOrderComparator", processSecondaryColDef: "processSecondaryColDef", processSecondaryColGroupDef: "processSecondaryColGroupDef", processPivotResultColDef: "processPivotResultColDef", processPivotResultColGroupDef: "processPivotResultColGroupDef", getDataPath: "getDataPath", defaultGroupSortComparator: "defaultGroupSortComparator", getChildCount: "getChildCount", getServerSideGroupLevelParams: "getServerSideGroupLevelParams", getServerSideStoreParams: "getServerSideStoreParams", isServerSideGroupOpenByDefault: "isServerSideGroupOpenByDefault", isApplyServerSideTransaction: "isApplyServerSideTransaction", isServerSideGroup: "isServerSideGroup", getServerSideGroupKey: "getServerSideGroupKey", getBusinessKeyForNode: "getBusinessKeyForNode", getRowNodeId: "getRowNodeId", getRowId: "getRowId", resetRowDataOnUpdate: "resetRowDataOnUpdate", processRowPostCreate: "processRowPostCreate", isRowSelectable: "isRowSelectable", isRowMaster: "isRowMaster", fillOperation: "fillOperation", postSort: "postSort", postSortRows: "postSortRows", getRowStyle: "getRowStyle", getRowClass: "getRowClass", getRowHeight: "getRowHeight", isFullWidthCell: "isFullWidthCell", isFullWidthRow: "isFullWidthRow" }, outputs: { toolPanelVisibleChanged: "toolPanelVisibleChanged", pasteStart: "pasteStart", pasteEnd: "pasteEnd", columnVisible: "columnVisible", columnPinned: "columnPinned", columnResized: "columnResized", columnMoved: "columnMoved", columnValueChanged: "columnValueChanged", columnPivotModeChanged: "columnPivotModeChanged", columnPivotChanged: "columnPivotChanged", columnGroupOpened: "columnGroupOpened", newColumnsLoaded: "newColumnsLoaded", gridColumnsChanged: "gridColumnsChanged", displayedColumnsChanged: "displayedColumnsChanged", virtualColumnsChanged: "virtualColumnsChanged", columnEverythingChanged: "columnEverythingChanged", componentStateChanged: "componentStateChanged", cellValueChanged: "cellValueChanged", cellEditRequest: "cellEditRequest", rowValueChanged: "rowValueChanged", cellEditingStarted: "cellEditingStarted", cellEditingStopped: "cellEditingStopped", rowEditingStarted: "rowEditingStarted", rowEditingStopped: "rowEditingStopped", filterOpened: "filterOpened", filterChanged: "filterChanged", filterModified: "filterModified", chartCreated: "chartCreated", chartRangeSelectionChanged: "chartRangeSelectionChanged", chartOptionsChanged: "chartOptionsChanged", chartDestroyed: "chartDestroyed", cellKeyDown: "cellKeyDown", cellKeyPress: "cellKeyPress", gridReady: "gridReady", firstDataRendered: "firstDataRendered", gridSizeChanged: "gridSizeChanged", modelUpdated: "modelUpdated", virtualRowRemoved: "virtualRowRemoved", viewportChanged: "viewportChanged", bodyScroll: "bodyScroll", bodyScrollEnd: "bodyScrollEnd", dragStarted: "dragStarted", dragStopped: "dragStopped", paginationChanged: "paginationChanged", rowDragEnter: "rowDragEnter", rowDragMove: "rowDragMove", rowDragLeave: "rowDragLeave", rowDragEnd: "rowDragEnd", columnRowGroupChanged: "columnRowGroupChanged", rowGroupOpened: "rowGroupOpened", expandOrCollapseAll: "expandOrCollapseAll", pinnedRowDataChanged: "pinnedRowDataChanged", rowDataChanged: "rowDataChanged", rowDataUpdated: "rowDataUpdated", asyncTransactionsFlushed: "asyncTransactionsFlushed", cellClicked: "cellClicked", cellDoubleClicked: "cellDoubleClicked", cellFocused: "cellFocused", cellMouseOver: "cellMouseOver", cellMouseOut: "cellMouseOut", cellMouseDown: "cellMouseDown", rowClicked: "rowClicked", rowDoubleClicked: "rowDoubleClicked", rowSelected: "rowSelected", selectionChanged: "selectionChanged", cellContextMenu: "cellContextMenu", rangeSelectionChanged: "rangeSelectionChanged", sortChanged: "sortChanged", columnRowGroupChangeRequest: "columnRowGroupChangeRequest", columnPivotChangeRequest: "columnPivotChangeRequest", columnValueChangeRequest: "columnValueChangeRequest", columnAggFuncChangeRequest: "columnAggFuncChangeRequest" }, providers: [
        AngularFrameworkOverrides,
        AngularFrameworkComponentWrapper
    ], queries: [{ propertyName: "columns", predicate: AgGridColumn }], usesOnChanges: true, ngImport: i0, template: '', isInline: true, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.16", ngImport: i0, type: AgGridAngular, decorators: [{
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
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i1.AngularFrameworkOverrides }, { type: i2.AngularFrameworkComponentWrapper }, { type: i0.ComponentFactoryResolver }]; }, propDecorators: { columns: [{
                type: ContentChildren,
                args: [AgGridColumn]
            }], gridOptions: [{
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
            }], deltaColumnMode: [{
                type: Input
            }], applyColumnDefOrder: [{
                type: Input
            }], immutableColumns: [{
                type: Input
            }], suppressSetColumnStateEvents: [{
                type: Input
            }], suppressColumnStateEvents: [{
                type: Input
            }], colWidth: [{
                type: Input
            }], minColWidth: [{
                type: Input
            }], maxColWidth: [{
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
            }], undoRedoCellEditing: [{
                type: Input
            }], undoRedoCellEditingLimit: [{
                type: Input
            }], stopEditingWhenGridLosesFocus: [{
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
            }], defaultExportParams: [{
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
            }], groupRowsSticky: [{
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
            }], fullWidthCellRenderer: [{
                type: Input
            }], fullWidthCellRendererFramework: [{
                type: Input
            }], fullWidthCellRendererParams: [{
                type: Input
            }], embedFullWidthRows: [{
                type: Input
            }], deprecatedEmbedFullWidthRows: [{
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
            }], groupRowInnerRenderer: [{
                type: Input
            }], groupRowInnerRendererFramework: [{
                type: Input
            }], groupMultiAutoColumn: [{
                type: Input
            }], groupUseEntireRow: [{
                type: Input
            }], groupSuppressAutoColumn: [{
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
            }], deltaRowDataMode: [{
                type: Input
            }], batchUpdateWaitMillis: [{
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
            }], serverSideInfiniteScroll: [{
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
            }], suppressEnterpriseResetOnNewColumns: [{
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
            }], angularCompileRows: [{
                type: Input
            }], angularCompileFilters: [{
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
            }], suppressKeyboardEvent: [{
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
            }], defaultGroupSortComparator: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVILFNBQVMsRUFFVCxlQUFlLEVBRWYsWUFBWSxFQUNaLEtBQUssRUFDTCxNQUFNLEVBR04saUJBQWlCLEVBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFHSCxhQUFhLEVBQ2IsSUFBSSxFQUtKLFNBQVMsRUFxSVosTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN4RSxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7Ozs7QUFZMUQsTUFBTSxPQUFPLGFBQWE7SUFrQnRCLFlBQVksVUFBc0IsRUFDdEIsZ0JBQWtDLEVBQ2xDLHlCQUFvRCxFQUNwRCx5QkFBMkQsRUFDM0Qsd0JBQWtEO1FBSGxELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBQzNELDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFsQnRELGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFJM0IsMERBQTBEO1FBQ2xELGdCQUFXLEdBQXVCLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFpSGxFLFVBQVU7UUFDVix3RUFBd0U7UUFDeEQsY0FBUyxHQUFvRCxTQUFTLENBQUM7UUFDdkYsNkNBQTZDO1FBQzdCLFlBQU8sR0FBZ0UsU0FBUyxDQUFD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LGNBQWM7c0JBQTlCLE1BQU07Z0JBRVUsd0JBQXdCO3NCQUF4QyxNQUFNO2dCQUVVLFdBQVc7c0JBQTNCLE1BQU07Z0JBRVUsaUJBQWlCO3NCQUFqQyxNQUFNO2dCQUVVLFdBQVc7c0JBQTNCLE1BQU07Z0JBRVUsYUFBYTtzQkFBN0IsTUFBTTtnQkFFVSxZQUFZO3NCQUE1QixNQUFNO2dCQUVVLGFBQWE7c0JBQTdCLE1BQU07Z0JBRVUsVUFBVTtzQkFBMUIsTUFBTTtnQkFFVSxnQkFBZ0I7c0JBQWhDLE1BQU07Z0JBRVUsV0FBVztzQkFBM0IsTUFBTTtnQkFFVSxnQkFBZ0I7c0JBQWhDLE1BQU07Z0JBRVUsZUFBZTtzQkFBL0IsTUFBTTtnQkFFVSxxQkFBcUI7c0JBQXJDLE1BQU07Z0JBRVUsV0FBVztzQkFBM0IsTUFBTTtnQkFDVSwyQkFBMkI7c0JBQTNDLE1BQU07Z0JBQ1Usd0JBQXdCO3NCQUF4QyxNQUFNO2dCQUNVLHdCQUF3QjtzQkFBeEMsTUFBTTtnQkFDVSwwQkFBMEI7c0JBQTFDLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEFmdGVyVmlld0luaXQsXG4gICAgQ29tcG9uZW50LFxuICAgIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBDb250ZW50Q2hpbGRyZW4sXG4gICAgRWxlbWVudFJlZixcbiAgICBFdmVudEVtaXR0ZXIsXG4gICAgSW5wdXQsXG4gICAgT3V0cHV0LFxuICAgIFF1ZXJ5TGlzdCxcbiAgICBWaWV3Q29udGFpbmVyUmVmLFxuICAgIFZpZXdFbmNhcHN1bGF0aW9uXG59IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmltcG9ydCB7XG4gICAgQ29sRGVmLFxuICAgIENvbHVtbkFwaSxcbiAgICBDb21wb25lbnRVdGlsLFxuICAgIEdyaWQsXG4gICAgR3JpZEFwaSxcbiAgICBHcmlkT3B0aW9ucyxcbiAgICBHcmlkUGFyYW1zLFxuICAgIE1vZHVsZSxcbiAgICBBZ1Byb21pc2UsXG4gICAgQ29sR3JvdXBEZWYsXG4gICAgRXhjZWxTdHlsZSxcbiAgICBJRGF0YXNvdXJjZSxcbiAgICBJU2VydmVyU2lkZURhdGFzb3VyY2UsXG4gICAgSVZpZXdwb3J0RGF0YXNvdXJjZSxcbiAgICBJQWdnRnVuYyxcbiAgICBDc3ZFeHBvcnRQYXJhbXMsXG4gICAgRXhjZWxFeHBvcnRQYXJhbXMsXG4gICAgU3RhdHVzUGFuZWxEZWYsXG4gICAgU2lkZUJhckRlZixcbiAgICBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMsXG4gICAgQWdDaGFydFRoZW1lLFxuICAgIFNlcnZlclNpZGVTdG9yZVR5cGUsXG4gICAgUm93R3JvdXBpbmdEaXNwbGF5VHlwZSxcbiAgICBHZXRDb250ZXh0TWVudUl0ZW1zLFxuICAgIEdldE1haW5NZW51SXRlbXMsXG4gICAgR2V0Um93Tm9kZUlkRnVuYyxcbiAgICBHZXRSb3dJZEZ1bmMsXG4gICAgTmF2aWdhdGVUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgSGVhZGVyUG9zaXRpb24sXG4gICAgVGFiVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBDZWxsUG9zaXRpb24sXG4gICAgVGFiVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zLFxuICAgIEdldERhdGFQYXRoLFxuICAgIFJvd05vZGUsXG4gICAgSXNSb3dNYXN0ZXIsXG4gICAgSXNSb3dTZWxlY3RhYmxlLFxuICAgIFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXMsXG4gICAgUHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkUGFyYW1zLFxuICAgIEdldFNlcnZlclNpZGVHcm91cEtleSxcbiAgICBJc1NlcnZlclNpZGVHcm91cCxcbiAgICBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXMsXG4gICAgR2V0Q2hhcnRUb29sYmFySXRlbXMsXG4gICAgRmlsbE9wZXJhdGlvblBhcmFtcyxcbiAgICBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uLFxuICAgIEdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zUGFyYW1zLFxuICAgIFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zLFxuICAgIElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcyxcbiAgICBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcyxcbiAgICBDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50LFxuICAgIE5ld0NvbHVtbnNMb2FkZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQsXG4gICAgRXhwYW5kQ29sbGFwc2VBbGxFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZWRFdmVudCxcbiAgICBHcmlkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5Nb3ZlZEV2ZW50LFxuICAgIENvbHVtblZpc2libGVFdmVudCxcbiAgICBDb2x1bW5QaW5uZWRFdmVudCxcbiAgICBDb2x1bW5Hcm91cE9wZW5lZEV2ZW50LFxuICAgIENvbHVtblJlc2l6ZWRFdmVudCxcbiAgICBEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZCxcbiAgICBSb3dHcm91cE9wZW5lZEV2ZW50LFxuICAgIFJvd0RhdGFDaGFuZ2VkRXZlbnQsXG4gICAgUm93RGF0YVVwZGF0ZWRFdmVudCxcbiAgICBQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50LFxuICAgIFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIENoYXJ0Q3JlYXRlZCxcbiAgICBDaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZCxcbiAgICBDaGFydE9wdGlvbnNDaGFuZ2VkLFxuICAgIENoYXJ0RGVzdHJveWVkLFxuICAgIENoYXJ0UmVmUGFyYW1zLFxuICAgIFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQsXG4gICAgTW9kZWxVcGRhdGVkRXZlbnQsXG4gICAgUGFzdGVTdGFydEV2ZW50LFxuICAgIFBhc3RlRW5kRXZlbnQsXG4gICAgQ2VsbENsaWNrZWRFdmVudCxcbiAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxNb3VzZURvd25FdmVudCxcbiAgICBDZWxsQ29udGV4dE1lbnVFdmVudCxcbiAgICBDZWxsVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgUm93VmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ2VsbEZvY3VzZWRFdmVudCxcbiAgICBSb3dTZWxlY3RlZEV2ZW50LFxuICAgIFNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDZWxsS2V5RG93bkV2ZW50LFxuICAgIENlbGxLZXlQcmVzc0V2ZW50LFxuICAgIENlbGxNb3VzZU92ZXJFdmVudCxcbiAgICBDZWxsTW91c2VPdXRFdmVudCxcbiAgICBGaWx0ZXJDaGFuZ2VkRXZlbnQsXG4gICAgRmlsdGVyTW9kaWZpZWRFdmVudCxcbiAgICBGaWx0ZXJPcGVuZWRFdmVudCxcbiAgICBTb3J0Q2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQsXG4gICAgUm93Q2xpY2tlZEV2ZW50LFxuICAgIFJvd0RvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBHcmlkUmVhZHlFdmVudCxcbiAgICBHcmlkU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBWaWV3cG9ydENoYW5nZWRFdmVudCxcbiAgICBGaXJzdERhdGFSZW5kZXJlZEV2ZW50LFxuICAgIERyYWdTdGFydGVkRXZlbnQsXG4gICAgRHJhZ1N0b3BwZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgQ2VsbEVkaXRpbmdTdGFydGVkRXZlbnQsXG4gICAgQ2VsbEVkaXRSZXF1ZXN0RXZlbnQsXG4gICAgQ2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgQm9keVNjcm9sbEV2ZW50LFxuICAgIEJvZHlTY3JvbGxFbmRFdmVudCxcbiAgICBQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50LFxuICAgIFJvd0RyYWdFdmVudCxcbiAgICBDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIFByb2Nlc3NSb3dQYXJhbXMsXG4gICAgUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzR3JvdXBIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUm93U3R5bGUsXG4gICAgUm93Q2xhc3NSdWxlcyxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dIZWlnaHRQYXJhbXMsXG4gICAgU2VuZFRvQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFRyZWVEYXRhRGlzcGxheVR5cGUsXG4gICAgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudCxcbiAgICBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudCxcbiAgICBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jLFxuICAgIElzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50UGFyYW1zLFxuICAgIEluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvclBhcmFtcyxcbiAgICBHZXRHcm91cFJvd0FnZ1BhcmFtcyxcbiAgICBQb3N0U29ydFJvd3NQYXJhbXMsXG4gICAgSXNGdWxsV2lkdGhSb3dQYXJhbXMsXG4gICAgR2V0TG9jYWxlVGV4dFBhcmFtcyxcbiAgICBJc1Jvd0ZpbHRlcmFibGUsXG4gICAgUm93TW9kZWxUeXBlXG59IGZyb20gXCJAYWctZ3JpZC1jb21tdW5pdHkvY29yZVwiO1xuXG5pbXBvcnQgeyBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzIH0gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya092ZXJyaWRlc1wiO1xuaW1wb3J0IHsgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIgfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclwiO1xuaW1wb3J0IHsgQWdHcmlkQ29sdW1uIH0gZnJvbSBcIi4vYWctZ3JpZC1jb2x1bW4uY29tcG9uZW50XCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgXSxcbiAgICAvLyB0ZWxsIGFuZ3VsYXIgd2UgZG9uJ3Qgd2FudCB2aWV3IGVuY2Fwc3VsYXRpb24sIHdlIGRvbid0IHdhbnQgYSBzaGFkb3cgcm9vdFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhcjxURGF0YSA9IGFueT4gaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICAvLyBub3QgaW50ZW5kZWQgZm9yIHVzZXIgdG8gaW50ZXJhY3Qgd2l0aC4gc28gcHV0dGluZyBfIGluIHNvIGlmIHVzZXIgZ2V0cyByZWZlcmVuY2VcbiAgICAvLyB0byB0aGlzIG9iamVjdCwgdGhleSBraW5kJ2Ega25vdyBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBhZ3JlZWQgaW50ZXJmYWNlXG4gICAgcHJpdmF0ZSBfbmF0aXZlRWxlbWVudDogYW55O1xuICAgIHByaXZhdGUgX2luaXRpYWxpc2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGdyaWRQYXJhbXM6IEdyaWRQYXJhbXM7XG5cbiAgICAvLyBpbiBvcmRlciB0byBlbnN1cmUgZmlyaW5nIG9mIGdyaWRSZWFkeSBpcyBkZXRlcm1pbmlzdGljXG4gICAgcHJpdmF0ZSBfZnVsbHlSZWFkeTogQWdQcm9taXNlPGJvb2xlYW4+ID0gQWdQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAvLyBtYWtpbmcgdGhlc2UgcHVibGljLCBzbyB0aGV5IGFyZSBhY2Nlc3NpYmxlIHRvIHBlb3BsZSB1c2luZyB0aGUgbmcyIGNvbXBvbmVudCByZWZlcmVuY2VzXG4gICAgcHVibGljIGFwaTogR3JpZEFwaTxURGF0YT47XG4gICAgcHVibGljIGNvbHVtbkFwaTogQ29sdW1uQXBpO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbihBZ0dyaWRDb2x1bW4pIHB1YmxpYyBjb2x1bW5zOiBRdWVyeUxpc3Q8QWdHcmlkQ29sdW1uPjtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnREZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHJpdmF0ZSBhbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzOiBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICBwcml2YXRlIGZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXI6IEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLFxuICAgICAgICBwcml2YXRlIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKSB7XG4gICAgICAgIHRoaXMuX25hdGl2ZUVsZW1lbnQgPSBlbGVtZW50RGVmLm5hdGl2ZUVsZW1lbnQ7XG5cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRWaWV3Q29udGFpbmVyUmVmKHRoaXMudmlld0NvbnRhaW5lclJlZik7XG4gICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIodGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgICB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMuc2V0RW1pdHRlclVzZWRDYWxsYmFjayh0aGlzLmlzRW1pdHRlclVzZWQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucyA9IENvbXBvbmVudFV0aWwuY29weUF0dHJpYnV0ZXNUb0dyaWRPcHRpb25zKHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMsIHRydWUpO1xuXG4gICAgICAgIHRoaXMuZ3JpZFBhcmFtcyA9IHtcbiAgICAgICAgICAgIGdsb2JhbEV2ZW50TGlzdGVuZXI6IHRoaXMuZ2xvYmFsRXZlbnRMaXN0ZW5lci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZnJhbWV3b3JrT3ZlcnJpZGVzOiB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICBwcm92aWRlZEJlYW5JbnN0YW5jZXM6IHtcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2R1bGVzOiAodGhpcy5tb2R1bGVzIHx8IFtdKSBhcyBhbnlcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5jb2x1bW5zICYmIHRoaXMuY29sdW1ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmNvbHVtbkRlZnMgPSB0aGlzLmNvbHVtbnNcbiAgICAgICAgICAgICAgICAubWFwKChjb2x1bW46IEFnR3JpZENvbHVtbik6IENvbERlZiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2x1bW4udG9Db2xEZWYoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ldyBHcmlkKHRoaXMuX25hdGl2ZUVsZW1lbnQsIHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMuZ3JpZFBhcmFtcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuYXBpKSB7XG4gICAgICAgICAgICB0aGlzLmFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuYXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbkFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIHNvbWV0aW1lcywgZXNwZWNpYWxseSBpbiBsYXJnZSBjbGllbnQgYXBwcyBncmlkUmVhZHkgY2FuIGZpcmUgYmVmb3JlIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGlzIHRpZXMgdGhlc2UgdG9nZXRoZXIgc28gdGhhdCBncmlkUmVhZHkgd2lsbCBhbHdheXMgZmlyZSBhZnRlciBhZ0dyaWRBbmd1bGFyJ3MgbmdBZnRlclZpZXdJbml0XG4gICAgICAgIC8vIHRoZSBhY3R1YWwgY29udGFpbmluZyBjb21wb25lbnQncyBuZ0FmdGVyVmlld0luaXQgd2lsbCBmaXJlIGp1c3QgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzXG4gICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkucmVzb2x2ZU5vdyhudWxsLCByZXNvbHZlID0+IHJlc29sdmUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICBDb21wb25lbnRVdGlsLnByb2Nlc3NPbkNoYW5nZShjaGFuZ2VzLCB0aGlzLmdyaWRPcHRpb25zLCB0aGlzLmFwaSwgdGhpcy5jb2x1bW5BcGkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgdGhlIGRlc3Ryb3ksIHNvIHdlIGtub3cgbm90IHRvIGVtaXQgYW55IGV2ZW50c1xuICAgICAgICAgICAgLy8gd2hpbGUgdGVhcmluZyBkb3duIHRoZSBncmlkLlxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFwaSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBpLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdlJ2xsIGVtaXQgdGhlIGVtaXQgaWYgYSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgYSBnaXZlbiBldmVudCBlaXRoZXIgb24gdGhlIGNvbXBvbmVudCB2aWEgbm9ybWFsIGFuZ3VsYXIgYmluZGluZ1xuICAgIC8vIG9yIHZpYSBncmlkT3B0aW9uc1xuICAgIHByb3RlY3RlZCBpc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgY29uc3QgaGFzRW1pdHRlciA9ICEhZW1pdHRlciAmJiBlbWl0dGVyLm9ic2VydmVycyAmJiBlbWl0dGVyLm9ic2VydmVycy5sZW5ndGggPiAwO1xuXG4gICAgICAgIC8vIGdyaWRSZWFkeSA9PiBvbkdyaWRSZWFkeVxuICAgICAgICBjb25zdCBhc0V2ZW50TmFtZSA9IGBvbiR7ZXZlbnRUeXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7ZXZlbnRUeXBlLnN1YnN0cmluZygxKX1gXG4gICAgICAgIGNvbnN0IGhhc0dyaWRPcHRpb25MaXN0ZW5lciA9ICEhdGhpcy5ncmlkT3B0aW9ucyAmJiAhISh0aGlzLmdyaWRPcHRpb25zIGFzIGFueSlbYXNFdmVudE5hbWVdO1xuXG4gICAgICAgIHJldHVybiBoYXNFbWl0dGVyIHx8IGhhc0dyaWRPcHRpb25MaXN0ZW5lcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gaWYgd2UgYXJlIHRlYXJpbmcgZG93biwgZG9uJ3QgZW1pdCBhbmd1bGFyIGV2ZW50cywgYXMgdGhpcyBjYXVzZXNcbiAgICAgICAgLy8gcHJvYmxlbXMgd2l0aCB0aGUgYW5ndWxhciByb3V0ZXJcbiAgICAgICAgaWYgKHRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2VuZXJpY2FsbHkgbG9vayB1cCB0aGUgZXZlbnRUeXBlXG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgaWYgKGVtaXR0ZXIgJiYgdGhpcy5pc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIGlmIChldmVudFR5cGUgPT09ICdncmlkUmVhZHknKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgaXMgbGlzdGVuaW5nIGZvciBncmlkUmVhZHksIHdhaXQgZm9yIG5nQWZ0ZXJWaWV3SW5pdCB0byBmaXJlIGZpcnN0LCB0aGVuIGVtaXQgdGhlXG4gICAgICAgICAgICAgICAgLy8gZ3JpZFJlYWR5IGV2ZW50XG4gICAgICAgICAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS50aGVuKChyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpIHB1YmxpYyBncmlkT3B0aW9uczogR3JpZE9wdGlvbnM8VERhdGE+O1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtb2R1bGVzOiBNb2R1bGVbXTtcblxuICAgIC8vIEBTVEFSVEBcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBzdGF0dXMgYmFyIGNvbXBvbmVudHMgdG8gdXNlIGluIHRoZSBzdGF0dXMgYmFyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3RhdHVzQmFyOiB7IHN0YXR1c1BhbmVsczogU3RhdHVzUGFuZWxEZWZbXTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBzaWRlIGJhciBjb21wb25lbnRzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2lkZUJhcjogU2lkZUJhckRlZiB8IHN0cmluZyB8IHN0cmluZ1tdIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IHNob3cgdGhlIGNvbnRleHQgbWVudS4gVXNlIGlmIHlvdSBkb24ndCB3YW50IHRvIHVzZSB0aGUgZGVmYXVsdCAncmlnaHQgY2xpY2snIGNvbnRleHQgbWVudS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyBgc3VwcHJlc3NDb250ZXh0TWVudWAsIHlvdSBjYW4gdXNlIHRoZSBgb25DZWxsQ29udGV4dE1lbnVgIGZ1bmN0aW9uIHRvIHByb3ZpZGUgeW91ciBvd24gY29kZSB0byBoYW5kbGUgY2VsbCBgY29udGV4dG1lbnVgIGV2ZW50cy5cbiAgICAgKiBUaGlzIGZsYWcgaXMgdXNlZnVsIHRvIHByZXZlbnQgdGhlIGJyb3dzZXIgZnJvbSBzaG93aW5nIGl0cyBkZWZhdWx0IGNvbnRleHQgbWVudS5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcmV2ZW50RGVmYXVsdE9uQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjb250ZXh0IG1lbnUgdG8gc2hvdywgZXZlbiB3aGVuIGBDdHJsYCBrZXkgaXMgaGVsZCBkb3duLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIHNob3cgdGhlIGNvbHVtbiBtZW51IGJ1dHRvbiwgcmF0aGVyIHRoYW4gb25seSBzaG93aW5nIHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGNvbHVtbiBoZWFkZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudUhpZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdXNlIHRoZSBicm93c2VyJ3MgZGVmYXVsdCB0b29sdGlwIGluc3RlYWQgb2YgdXNpbmcgdGhlIGdyaWQncyBUb29sdGlwIENvbXBvbmVudC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQnJvd3NlclRvb2x0aXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIHRoYXQgaXQgdGFrZXMgZm9yIHRvb2x0aXBzIHRvIHNob3cgdXAgb25jZSBhbiBlbGVtZW50IGlzIGhvdmVyZWQgb3Zlci5cbiAgICAgKiAgICAgKipOb3RlOioqIFRoaXMgcHJvcGVydHkgZG9lcyBub3Qgd29yayBpZiBgZW5hYmxlQnJvd3NlclRvb2x0aXBzYCBpcyBgdHJ1ZWAuXG4gICAgICogRGVmYXVsdDogYDIwMDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwU2hvd0RlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgdGhhdCBpdCB0YWtlcyBmb3IgdG9vbHRpcHMgdG8gaGlkZSBvbmNlIHRoZXkgaGF2ZSBiZWVuIGRpc3BsYXllZC5cbiAgICAgKiAgICAgKipOb3RlOioqIFRoaXMgcHJvcGVydHkgZG9lcyBub3Qgd29yayBpZiBgZW5hYmxlQnJvd3NlclRvb2x0aXBzYCBpcyBgdHJ1ZWAuXG4gICAgICogRGVmYXVsdDogYDEwMDAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcEhpZGVEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdG9vbHRpcHMgZm9sbG93IHRoZSBjdXJzb3Igb25jZSB0aGV5IGFyZSBkaXNwbGF5ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBNb3VzZVRyYWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBET00gZWxlbWVudCB0byB1c2UgYXMgdGhlIHBvcHVwIHBhcmVudCBmb3IgZ3JpZCBwb3B1cHMgKGNvbnRleHQgbWVudSwgY29sdW1uIG1lbnUgZXRjKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvcHVwUGFyZW50OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5SGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsc28gaW5jbHVkZSBncm91cCBoZWFkZXJzIHdoZW4gY29weWluZyB0byBjbGlwYm9hcmQgdXNpbmcgYEN0cmwgKyBDYCBjbGlwYm9hcmQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvcHlHcm91cEhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmeSB0aGUgZGVsaW1pdGVyIHRvIHVzZSB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkLlxuICAgICAqIERlZmF1bHQ6IGBcXHRgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbGlwYm9hcmREZWxpbWl0ZXI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb3B5IHRoZSBjZWxsIHJhbmdlIG9yIGZvY3VzZWQgY2VsbCB0byB0aGUgY2xpcGJvYXJkIGFuZCBuZXZlciB0aGUgc2VsZWN0ZWQgcm93cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvcHkgcm93cyBpbnN0ZWFkIG9mIHJhbmdlcyB3aGVuIGEgcmFuZ2Ugd2l0aCBvbmx5IGEgc2luZ2xlIGNlbGwgaXMgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29weVNpbmdsZUNlbGxSYW5nZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gd29yayBhcm91bmQgYSBidWcgd2l0aCBFeGNlbCAoV2luZG93cykgdGhhdCBhZGRzIGFuIGV4dHJhIGVtcHR5IGxpbmUgYXQgdGhlIGVuZCBvZiByYW5nZXMgY29waWVkIHRvIHRoZSBjbGlwYm9hcmQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvZmYgcGFzdGUgb3BlcmF0aW9ucyB3aXRoaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZFBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN0b3AgdGhlIGdyaWQgdHJ5aW5nIHRvIHVzZSB0aGUgQ2xpcGJvYXJkIEFQSSwgaWYgaXQgaXMgYmxvY2tlZCwgYW5kIGltbWVkaWF0ZWx5IGZhbGxiYWNrIHRvIHRoZSB3b3JrYXJvdW5kLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IG9mIENvbHVtbiAvIENvbHVtbiBHcm91cCBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnM6IChDb2xEZWY8VERhdGE+IHwgQ29sR3JvdXBEZWY8VERhdGE+KVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uLiBJdGVtcyBkZWZpbmVkIGluIHRoZSBhY3R1YWwgY29sdW1uIGRlZmluaXRpb25zIGdldCBwcmVjZWRlbmNlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbERlZjogQ29sRGVmPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBncm91cCBkZWZpbml0aW9uLiBBbGwgY29sdW1uIGdyb3VwIGRlZmluaXRpb25zIHdpbGwgdXNlIHRoZXNlIHByb3BlcnRpZXMuIEl0ZW1zIGRlZmluZWQgaW4gdGhlIGFjdHVhbCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbiBnZXQgcHJlY2VkZW5jZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZjogUGFydGlhbDxDb2xHcm91cERlZjxURGF0YT4+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3QgbWFwIG9mIGN1c3RvbSBjb2x1bW4gdHlwZXMgd2hpY2ggY29udGFpbiBncm91cHMgb2YgcHJvcGVydGllcyB0aGF0IGNvbHVtbiBkZWZpbml0aW9ucyBjYW4gaW5oZXJpdCBieSByZWZlcmVuY2luZyBpbiB0aGVpciBgdHlwZWAgcHJvcGVydHkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5UeXBlczogeyBba2V5OiBzdHJpbmddOiBDb2xEZWY8VERhdGE+OyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBLZWVwcyB0aGUgb3JkZXIgb2YgQ29sdW1ucyBtYWludGFpbmVkIGFmdGVyIG5ldyBDb2x1bW4gRGVmaW5pdGlvbnMgYXJlIHVwZGF0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlbiBkb3RzIGluIGZpZWxkIG5hbWVzIChlLmcuIGAnYWRkcmVzcy5maXJzdExpbmUnYCkgYXJlIG5vdCB0cmVhdGVkIGFzIGRlZXAgcmVmZXJlbmNlcy4gQWxsb3dzIHlvdSB0byB1c2UgZG90cyBpbiB5b3VyIGZpZWxkIG5hbWUgaWYgeW91IHByZWZlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWVsZERvdE5vdGF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFDb2x1bW5Nb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXBwbHlDb2x1bW5EZWZPcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGltbXV0YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NldENvbHVtblN0YXRlRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5TdGF0ZUV2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgU2V0IHZpYSBgZGVmYXVsdENvbERlZi53aWR0aGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbFdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFNldCB2aWEgYGRlZmF1bHRDb2xEZWYubWluV2lkdGhgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtaW5Db2xXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBTZXQgdmlhIGBkZWZhdWx0Q29sRGVmLm1heFdpZHRoYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29sV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgY29sdW1uIGxhYmVsIGhlYWRlci4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyB0aGUgdGhlbWUgdmFsdWUgb2YgYGhlYWRlci1oZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93cyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgZmxvYXRpbmcgZmlsdGVycy4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyB0aGUgdGhlbWUgdmFsdWUgb2YgYGhlYWRlci1oZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGNvbHVtbnMgd2hlbiBpbiBwaXZvdCBtb2RlLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyBoZWFkZXIgY29sdW1uIGdyb3VwcyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGdyb3VwSGVhZGVySGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90R3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3cgcmVvcmRlcmluZyBhbmQgcGlubmluZyBjb2x1bW5zIGJ5IGRyYWdnaW5nIGNvbHVtbnMgZnJvbSB0aGUgQ29sdW1ucyBUb29sIFBhbmVsIHRvIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0RyYWdGcm9tQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBjb2x1bW4gbW92aW5nLCBpLmUuIHRvIG1ha2UgdGhlIGNvbHVtbnMgZml4ZWQgcG9zaXRpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGBhZy1jb2x1bW4tbW92aW5nYCBjbGFzcyBpcyBub3QgYWRkZWQgdG8gdGhlIGdyaWQgd2hpbGUgY29sdW1ucyBhcmUgbW92aW5nLiBJbiB0aGUgZGVmYXVsdCB0aGVtZXMsIHRoaXMgcmVzdWx0cyBpbiBubyBhbmltYXRpb24gd2hlbiBtb3ZpbmcgY29sdW1ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHdoZW4geW91IGRyYWcgYSBjb2x1bW4gb3V0IG9mIHRoZSBncmlkIChlLmcuIHRvIHRoZSBncm91cCB6b25lKSB0aGUgY29sdW1uIGlzIG5vdCBoaWRkZW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRHJhZ0xlYXZlSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHdoZW4geW91IGRyYWcgYSBjb2x1bW4gaW50byBhIHJvdyBncm91cCBwYW5lbCB0aGUgY29sdW1uIGlzIG5vdCBoaWRkZW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93R3JvdXBIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ3NoaWZ0J2AgdG8gaGF2ZSBzaGlmdC1yZXNpemUgYXMgdGhlIGRlZmF1bHQgcmVzaXplIG9wZXJhdGlvbiAoc2FtZSBhcyB1c2VyIGhvbGRpbmcgZG93biBgU2hpZnRgIHdoaWxlIHJlc2l6aW5nKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbFJlc2l6ZURlZmF1bHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3NlcyBhdXRvLXNpemluZyBjb2x1bW5zIGZvciBjb2x1bW5zLiBJbiBvdGhlciB3b3JkcywgZG91YmxlIGNsaWNraW5nIGEgY29sdW1uJ3MgaGVhZGVyJ3MgZWRnZSB3aWxsIG5vdCBhdXRvLXNpemUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIE51bWJlciBvZiBwaXhlbHMgdG8gYWRkIHRvIGEgY29sdW1uIHdpZHRoIGFmdGVyIHRoZSBbYXV0by1zaXppbmddKC9jb2x1bW4tc2l6aW5nLyNhdXRvLXNpemUtY29sdW1ucykgY2FsY3VsYXRpb24uXG4gICAgICogU2V0IHRoaXMgaWYgeW91IHdhbnQgdG8gYWRkIGV4dHJhIHJvb20gdG8gYWNjb21tb2RhdGUgKGZvciBleGFtcGxlKSBzb3J0IGljb25zLCBvciBzb21lIG90aGVyIGR5bmFtaWMgbmF0dXJlIG9mIHRoZSBoZWFkZXIuXG4gICAgICogRGVmYXVsdDogYDRgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2l6ZVBhZGRpbmc6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHNraXAgdGhlIGBoZWFkZXJOYW1lYCB3aGVuIGBhdXRvU2l6ZWAgaXMgY2FsbGVkIGJ5IGRlZmF1bHQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiBjb21wb25lbnQgbmFtZXMgdG8gY29tcG9uZW50cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IGFueTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGNvbXBvbmVudHNgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmcmFtZXdvcmtDb21wb25lbnRzOiB7IFtwOiBzdHJpbmddOiB7IG5ldygpOiBhbnk7IH07IH0gfCBhbnkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ2Z1bGxSb3cnYCB0byBlbmFibGUgRnVsbCBSb3cgRWRpdGluZy4gT3RoZXJ3aXNlIGxlYXZlIGJsYW5rIHRvIGVkaXQgb25lIGNlbGwgYXQgYSB0aW1lLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgU2luZ2xlIENsaWNrIEVkaXRpbmcgZm9yIGNlbGxzLCB0byBzdGFydCBlZGl0aW5nIHdpdGggYSBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IG5laXRoZXIgc2luZ2xlIG5vciBkb3VibGUgY2xpY2sgc3RhcnRzIGVkaXRpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHN0b3AgdGhlIGdyaWQgdXBkYXRpbmcgZGF0YSBhZnRlciBhbmQgZWRpdC4gV2hlbiB0aGlzIGlzIHNldCwgaXQgaXMgaW50ZW5kZWQgdGhlIGFwcGxpY2F0aW9uIHdpbGwgdXBkYXRlIHRoZSBkYXRhLCBlZyBpbiBhbiBleHRlcm5hbCBpbW11dGFibGUgc3RvcmUsIGFuZCB0aGVuIHBhc3MgdGhlIG5ldyBkYXRhc2V0IHRvIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVhZE9ubHlFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc3RvcCBjZWxsIGVkaXRpbmcgd2hlbiBncmlkIGxvc2VzIGZvY3VzLlxuICAgICAqIFRoZSBkZWZhdWx0IGlzIHRoYXQgdGhlIGdyaWQgc3RheXMgZWRpdGluZyB1bnRpbCBmb2N1cyBnb2VzIG9udG8gYW5vdGhlciBjZWxsLiBGb3IgaW5saW5lIChub24tcG9wdXApIGVkaXRvcnMgb25seS5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck1vdmVzRG93bkFmdGVyRWRpdGAgdG8gaGF2ZSBFeGNlbC1zdHlsZSBiZWhhdmlvdXIgZm9yIHRoZSBgRW50ZXJgIGtleS5cbiAgICAgKiBpLmUuIHByZXNzaW5nIHRoZSBgRW50ZXJgIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGFsb25nIHdpdGggYGVudGVyTW92ZXNEb3duYCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlICdFbnRlcicga2V5LlxuICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIEVudGVyIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBVbmRvIC8gUmVkbyB3aGlsZSBlZGl0aW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBzaXplIG9mIHRoZSB1bmRvIC8gcmVkbyBzdGFjay4gRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZ0xpbWl0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1cyBpbnN0ZWFkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5HcmlkTG9zZXNGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gZXhwb3J0IHRvIENTVi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDc3ZFeHBvcnRQYXJhbXM6IENzdkV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJldmVudHMgdGhlIHVzZXIgZnJvbSBleHBvcnRpbmcgdGhlIGdyaWQgdG8gQ1NWLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NzdkV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gZXhwb3J0IHRvIEV4Y2VsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4Y2VsRXhwb3J0UGFyYW1zOiBFeGNlbEV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJldmVudHMgdGhlIHVzZXIgZnJvbSBleHBvcnRpbmcgdGhlIGdyaWQgdG8gRXhjZWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbGlzdCAoYXJyYXkpIG9mIEV4Y2VsIHN0eWxlcyB0byBiZSB1c2VkIHdoZW4gZXhwb3J0aW5nIHRvIEV4Y2VsIHdpdGggc3R5bGVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjZWxTdHlsZXM6IEV4Y2VsU3R5bGVbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGRlZmF1bHRDc3ZFeHBvcnRQYXJhbXMgb3IgZGVmYXVsdEV4Y2VsRXhwb3J0UGFyYW1zICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhwb3J0UGFyYW1zOiBDc3ZFeHBvcnRQYXJhbXMgfCBFeGNlbEV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUm93cyBhcmUgZmlsdGVyZWQgdXNpbmcgdGhpcyB0ZXh0IGFzIGEgcXVpY2sgZmlsdGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcXVpY2tGaWx0ZXJUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvbiB0aGUgcXVpY2sgZmlsdGVyIGNhY2hlLCB1c2VkIHRvIGltcHJvdmUgcGVyZm9ybWFuY2Ugd2hlbiB1c2luZyB0aGUgcXVpY2sgZmlsdGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZVF1aWNrRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IHRyZWUgZGF0YSBmaWx0ZXJpbmcgYmVoYXZpb3VyIHRvIGluc3RlYWQgZXhjbHVkZSBjaGlsZCBub2RlcyBmcm9tIGZpbHRlciByZXN1bHRzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gRW5hYmxlIENoYXJ0cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2hhcnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBjaGFydCB0aGVtZXMgdG8gYmUgdXNlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgY29udGFpbmluZyBjdXN0b20gY2hhcnQgdGhlbWVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3VzdG9tQ2hhcnRUaGVtZXM6IHsgW25hbWU6IHN0cmluZ106IEFnQ2hhcnRUaGVtZSB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFydCB0aGVtZSBvdmVycmlkZXMgYXBwbGllZCB0byBhbGwgdGhlbWVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZU92ZXJyaWRlczogQWdDaGFydFRoZW1lT3ZlcnJpZGVzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIGxvYWRpbmcgY2VsbCByZW5kZXJlciB0byB1c2Ugd2hlbiBkYXRhIGlzIGxvYWRpbmcgdmlhIGEgRGF0YVNvdXJjZS5cbiAgICAgKiBTZWUgW0xvYWRpbmcgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LWxvYWRpbmctY2VsbC1yZW5kZXJlci8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGxvYWRpbmdDZWxsUmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gYmUgdXNlZCB3aGVuIGRhdGEgaXMgbG9hZGluZyB2aWEgYSBEYXRhU291cmNlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yOiBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2Yga2V5LT52YWx1ZSBwYWlycyBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hc3RlciBEZXRhaWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1hc3RlckRldGFpbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBrZWVwIGRldGFpbCByb3dzIGZvciB3aGVuIHRoZXkgYXJlIGRpc3BsYXllZCBhZ2Fpbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIG51bWJlciBvZiBkZXRhaWxzIHJvd3MgdG8ga2VlcC4gRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3NDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGBkZXRhaWxDZWxsUmVuZGVyZXJgIHRvIHVzZSB3aGVuIGEgbWFzdGVyIHJvdyBpcyBleHBhbmRlZC5cbiAgICAgKiBTZWUgW0RldGFpbCBDZWxsIFJlbmRlcmVyXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9tYXN0ZXItZGV0YWlsLWN1c3RvbS1kZXRhaWwvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGRldGFpbENlbGxSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZpZXMgdGhlIHBhcmFtcyB0byBiZSB1c2VkIGJ5IHRoZSBEZXRhaWwgQ2VsbCBSZW5kZXJlci4gQ2FuIGFsc28gYmUgYSBmdW5jdGlvbiB0aGF0IHByb3ZpZGVzIHRoZSBwYXJhbXMgdG8gZW5hYmxlIGR5bmFtaWMgZGVmaW5pdGlvbnMgb2YgdGhlIHBhcmFtcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgZml4ZWQgaGVpZ2h0IGluIHBpeGVscyBmb3IgZWFjaCBkZXRhaWwgcm93LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsUm93SGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgZGV0YWlsIGdyaWQgZHluYW1pY2FsbHkgY2hhbmdlIGl0J3MgaGVpZ2h0IHRvIGZpdCBpdCdzIHJvd3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dBdXRvSGVpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgb3BlbiBHcm91cCBSb3dzIHZpc2libGUgYXQgdGhlIHRvcCBvZiB0aGUgZ3JpZC4gRGVmYXVsdDogYGZhbHNlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93c1N0aWNreTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZXMgYSBjb250ZXh0IG9iamVjdCB0aGF0IGlzIHByb3ZpZGVkIHRvIGRpZmZlcmVudCBjYWxsYmFja3MgdGhlIGdyaWQgdXNlcy4gVXNlZCBmb3IgcGFzc2luZyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHRvIHRoZSBjYWxsYmFja3MgYnkgeW91ciBhcHBsaWNhdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbnRleHQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBsaXN0IG9mIGdyaWRzIHRvIHRyZWF0IGFzIEFsaWduZWQgR3JpZHMuIElmIGdyaWRzIGFyZSBhbGlnbmVkIHRoZW4gdGhlIGNvbHVtbnMgYW5kIGhvcml6b250YWwgc2Nyb2xsaW5nIHdpbGwgYmUga2VwdCBpbiBzeW5jLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxpZ25lZEdyaWRzOiB7IGFwaT86IEdyaWRBcGkgfCBudWxsLCBjb2x1bW5BcGk/OiBDb2x1bW5BcGkgfCBudWxsIH1bXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhbmdlIHRoaXMgdmFsdWUgdG8gc2V0IHRoZSB0YWJJbmRleCBvcmRlciBvZiB0aGUgR3JpZCB3aXRoaW4geW91ciBhcHBsaWNhdGlvbi4gRGVmYXVsdDogYDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbnVtYmVyIG9mIHJvd3MgcmVuZGVyZWQgb3V0c2lkZSB0aGUgdmlld2FibGUgYXJlYSB0aGUgZ3JpZCByZW5kZXJzLlxuICAgICAqIEhhdmluZyBhIGJ1ZmZlciBtZWFucyB0aGUgZ3JpZCB3aWxsIGhhdmUgcm93cyByZWFkeSB0byBzaG93IGFzIHRoZSB1c2VyIHNsb3dseSBzY3JvbGxzIHZlcnRpY2FsbHkuXG4gICAgICogRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93QnVmZmVyOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvbiB0aGUgdmFsdWUgY2FjaGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlQ2FjaGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29uZmlndXJlIHRoZSB2YWx1ZSBjYWNoZSB0byBub3QgZXhwaXJlIGFmdGVyIGRhdGEgdXBkYXRlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZU5ldmVyRXhwaXJlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBjZWxsIGV4cHJlc3Npb25zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsRXhwcmVzc2lvbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgcm93IG5vZGVzIGRvIG5vdCBoYXZlIHRoZWlyIHBhcmVudHMgc2V0LlxuICAgICAqIFRoZSBncmlkIGRvZXNuJ3QgdXNlIHRoZSBwYXJlbnQgcmVmZXJlbmNlLCBidXQgaXQgaXMgaW5jbHVkZWQgdG8gaGVscCB0aGUgY2xpZW50IGNvZGUgbmF2aWdhdGUgdGhlIG5vZGUgdHJlZSBpZiBpdCB3YW50cyBieSBwcm92aWRpbmcgYmktZGlyZWN0aW9uIG5hdmlnYXRpb24gdXAgYW5kIGRvd24gdGhlIHRyZWUuXG4gICAgICogSWYgdGhpcyBpcyBhIHByb2JsZW0gKGUuZy4gaWYgeW91IG5lZWQgdG8gY29udmVydCB0aGUgdHJlZSB0byBKU09OLCB3aGljaCBkb2VzIG5vdCBhbGxvdyBjeWNsaWMgZGVwZW5kZW5jaWVzKSB0aGVuIHNldCB0aGlzIHRvIGB0cnVlYC5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0b3VjaCBzdXBwb3J0IChidXQgZG9lcyBub3QgcmVtb3ZlIHRoZSBicm93c2VyJ3MgZWZmb3J0cyB0byBzaW11bGF0ZSBtb3VzZSBldmVudHMgb24gdG91Y2gpLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzZXQgZm9jdXMgYmFjayBvbiB0aGUgZ3JpZCBhZnRlciBhIHJlZnJlc2guIFRoaXMgY2FuIGF2b2lkIGlzc3VlcyB3aGVyZSB5b3Ugd2FudCB0byBrZWVwIHRoZSBmb2N1cyBvbiBhbm90aGVyIHBhcnQgb2YgdGhlIGJyb3dzZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRm9jdXNBZnRlclJlZnJlc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSBhc3luY2hyb25vdXMgbmF0dXJlIG9mIHRoZSBldmVudHMgaW50cm9kdWNlZCBpbiB2MTAsIGFuZCBtYWtlcyB0aGVtIHN5bmNocm9ub3VzLiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGZvciB0aGUgcHVycG9zZSBvZiBzdXBwb3J0aW5nIGxlZ2FjeSBjb2RlIHdoaWNoIGhhcyBhIGRlcGVuZGVuY3kgb24gc3luY2hyb25vdXMgZXZlbnRzIGZyb20gZWFybGllciB2ZXJzaW9ucyAodjkgb3IgZWFybGllcikgb2YgQUcgR3JpZC4gICAgICoqSXQgaXMgc3Ryb25nbHkgcmVjb21tZW5kZWQgdGhhdCB5b3UgZG8gbm90IGNoYW5nZSB0aGlzIHByb3BlcnR5IHVubGVzcyB5b3UgaGF2ZSBsZWdhY3kgaXNzdWVzLioqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBncmlkIHdpbGwgY2hlY2sgZm9yIGBSZXNpemVPYnNlcnZlcmAgYW5kIHVzZSBpdCBpZiBpdCBleGlzdHMgaW4gdGhlIGJyb3dzZXIsIG90aGVyd2lzZSBpdCB3aWxsIHVzZSB0aGUgZ3JpZCdzIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9uLiBTb21lIHVzZXJzIHJlcG9ydGVkIGlzc3VlcyB3aXRoIENocm9tZSdzIGBSZXNpemVPYnNlcnZlcmAuIFVzZSB0aGlzIHByb3BlcnR5IHRvIGFsd2F5cyB1c2UgdGhlIGdyaWQncyBhbHRlcm5hdGl2ZSBpbXBsZW1lbnRhdGlvbiBzaG91bGQgc3VjaCBwcm9ibGVtcyBleGlzdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHNob3dpbmcgYSB3YXJuaW5nIG1lc3NhZ2UgaW4gdGhlIGNvbnNvbGUgaWYgdXNpbmcgYSBgZ3JpZE9wdGlvbnNgIG9yIGBjb2xEZWZgIHByb3BlcnR5IHRoYXQgZG9lc24ndCBleGlzdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIGNoYW5nZSBkZXRlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gZW5hYmxlIGRlYnVnIGluZm9ybWF0aW9uIGZyb20gdGhlIGdyaWQgYW5kIHJlbGF0ZWQgY29tcG9uZW50cy4gV2lsbCByZXN1bHQgaW4gYWRkaXRpb25hbCBsb2dnaW5nIGJlaW5nIG91dHB1dCwgYnV0IHZlcnkgdXNlZnVsIHdoZW4gaW52ZXN0aWdhdGluZyBwcm9ibGVtcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVidWc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSB0ZW1wbGF0ZSBmb3IgJ2xvYWRpbmcnIG92ZXJsYXkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5TG9hZGluZ1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gbG9hZGluZyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgKiBTZWUgW0xvYWRpbmcgT3ZlcmxheSBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1vdmVybGF5LyNzaW1wbGUtbG9hZGluZy1vdmVybGF5LWNvbXBvbmVudCkgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGxvYWRpbmdPdmVybGF5Q29tcG9uZW50YCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlICdsb2FkaW5nJyBvdmVybGF5LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgdGVtcGxhdGUgZm9yICdubyByb3dzJyBvdmVybGF5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheU5vUm93c1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gbm8gcm93cyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgKiBTZWUgW05vIFJvd3MgT3ZlcmxheSBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1vdmVybGF5LyNzaW1wbGUtbm8tcm93cy1vdmVybGF5LWNvbXBvbmVudCkgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudGAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBubyByb3dzIG92ZXJsYXkgY29tcG9uZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgJ25vIHJvd3MnIG92ZXJsYXkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHdoZXRoZXIgcGFnaW5hdGlvbiBpcyBlbmFibGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByb3dzIHRvIGxvYWQgcGVyIHBhZ2UuIElmIGBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplYCBpcyBzcGVjaWZpZWQsIHRoaXMgcHJvcGVydHkgaXMgaWdub3JlZC4gRGVmYXVsdDogYDEwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIG51bWJlciBvZiByb3dzIHRvIGxvYWQgcGVyIHBhZ2UgaXMgYXV0b21hdGljYWxseSBhZGp1c3RlZCBieSB0aGUgZ3JpZCBzbyBlYWNoIHBhZ2Ugc2hvd3MgZW5vdWdoIHJvd3MgdG8ganVzdCBmaWxsIHRoZSBhcmVhIGRlc2lnbmF0ZWQgZm9yIHRoZSBncmlkLiBJZiBgZmFsc2VgLCBgcGFnaW5hdGlvblBhZ2VTaXplYCBpcyB1c2VkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgcGFnZXMgc3BsaXQgY2hpbGRyZW4gb2YgZ3JvdXBzIHdoZW4gdXNpbmcgUm93IEdyb3VwaW5nIG9yIGRldGFpbCByb3dzIHdpdGggTWFzdGVyIERldGFpbC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGRlZmF1bHQgZ3JpZCBjb250cm9scyBmb3IgbmF2aWdhdGlvbiBhcmUgaGlkZGVuLlxuICAgICAqIFRoaXMgaXMgdXNlZnVsIGlmIGBwYWdpbmF0aW9uPXRydWVgIGFuZCB5b3Ugd2FudCB0byBwcm92aWRlIHlvdXIgb3duIHBhZ2luYXRpb24gY29udHJvbHMuXG4gICAgICogT3RoZXJ3aXNlLCB3aGVuIGBwYWdpbmF0aW9uPXRydWVgIHRoZSBncmlkIGF1dG9tYXRpY2FsbHkgc2hvd3MgdGhlIG5lY2Vzc2FyeSBjb250cm9scyBhdCB0aGUgYm90dG9tIHNvIHRoYXQgdGhlIHVzZXIgY2FuIG5hdmlnYXRlIHRocm91Z2ggdGhlIGRpZmZlcmVudCBwYWdlcy5cbiAgICAgKiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgcGl2b3QgbW9kZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RNb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdwaXZvdCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gcGl2b3QpIGF0IHRoZSB0b3AuIE5vdGUgdGhhdCB0aGUgcGl2b3QgcGFuZWwgd2lsbCBuZXZlciBzaG93IGlmIGBwaXZvdE1vZGVgIGlzIG9mZi4gRGVmYXVsdDogYG5ldmVyYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RQYW5lbFNob3c6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBzZXQgYW5kIHRoZSBncmlkIGlzIGluIHBpdm90IG1vZGUsIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCB0b3RhbHMgd2lsbCBhcHBlYXIgd2l0aGluIHRoZSBQaXZvdCBDb2x1bW4gR3JvdXBzLCBpbiB0aGUgcG9zaXRpb24gc3BlY2lmaWVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFsczogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciBmb3IgZWFjaCB2YWx1ZSBjb2x1bW4gaW4gdGhlIHBvc2l0aW9uIHNwZWNpZmllZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Um93VG90YWxzOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3Qgc3dhcCBpbiB0aGUgZ3JvdXBpbmcgY29sdW1uIHdoZW4gcGl2b3RpbmcuIFVzZWZ1bCBpZiBwaXZvdGluZyB1c2luZyBTZXJ2ZXIgU2lkZSBSb3cgTW9kZWwgb3IgVmlld3BvcnQgUm93IE1vZGVsIGFuZCB5b3Ugd2FudCBmdWxsIGNvbnRyb2wgb2YgYWxsIGNvbHVtbnMgaW5jbHVkaW5nIHRoZSBncm91cCBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHBpdm90IGNvbHVtbiBncm91cHMgd2lsbCBhcHBlYXIgJ2ZpeGVkJywgd2l0aG91dCB0aGUgYWJpbGl0eSB0byBleHBhbmQgYW5kIGNvbGxhcHNlIHRoZSBjb2x1bW4gZ3JvdXBzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGVuIHJvdyBncm91cCwgcGl2b3QgYW5kIHZhbHVlIGFnZ3JlZ2F0aW9uIHdpbGwgYmUgcmVhZC1vbmx5IGZyb20gdGhlIEdVSS4gVGhlIGdyaWQgd2lsbCBkaXNwbGF5IHdoYXQgdmFsdWVzIGFyZSB1c2VkIGZvciBlYWNoLCBidXQgd2lsbCBub3QgYWxsb3cgdGhlIHVzZXIgdG8gY2hhbmdlIHRoZSBzZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiAnZnVuY3Rpb24gbmFtZScgdG8gJ2Z1bmN0aW9uJyBmb3IgY3VzdG9tIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFnZ0Z1bmNzOiB7IFtrZXk6IHN0cmluZ106IElBZ2dGdW5jPFREYXRhPjsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIGNvbHVtbiBoZWFkZXJzIHdvbid0IGluY2x1ZGUgdGhlIGBhZ2dGdW5jYCBuYW1lLCBlLmcuIGAnc3VtKEJhbmsgQmFsYW5jZSlgJyB3aWxsIGp1c3QgYmUgYCdCYW5rIEJhbGFuY2UnYC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGdW5jSW5IZWFkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgYWdncmVnYXRpb25zIHdvbid0IGJlIGNvbXB1dGVkIGZvciB0aGUgcm9vdCBub2RlIG9mIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0F0Um9vdExldmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGNoYW5nZSBkZXRlY3Rpb24sIG9ubHkgdGhlIHVwZGF0ZWQgY29sdW1uIHdpbGwgYmUgcmUtYWdncmVnYXRlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdncmVnYXRlT25seUNoYW5nZWRDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgYWdncmVnYXRpb25zIGFyZSBub3QgaW1wYWN0ZWQgYnkgZmlsdGVyaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0ZpbHRlcmVkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvbWl0IHRoZSB2YWx1ZSBDb2x1bW4gaGVhZGVyIHdoZW4gdGhlcmUgaXMgb25seSBhIHNpbmdsZSB2YWx1ZSBjb2x1bW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlbW92ZVBpdm90SGVhZGVyUm93V2hlblNpbmdsZVZhbHVlQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBSb3cgQW5pbWF0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmltYXRlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIGZsYXNoIGFmdGVyIGRhdGEgY2hhbmdlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGVuYWJsZUNlbGxDaGFuZ2VGbGFzaGAsIHRoaXMgY29uZmlndXJhdGlvbiB3aWxsIHNldCB0aGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIG9mIGhvdyBsb25nIGEgY2VsbCBzaG91bGQgcmVtYWluIGluIGl0cyBcImZsYXNoZWRcIiBzdGF0ZS5cbiAgICAgKiBEZWZhdWx0OiBgNTAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgLCB0aGlzIGNvbmZpZ3VyYXRpb24gd2lsbCBzZXQgdGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyB0aGUgXCJmbGFzaGVkXCIgc3RhdGUgYW5pbWF0aW9uIHRha2VzIHRvIGZhZGUgYXdheSBhZnRlciB0aGUgdGltZXIgc2V0IGJ5IGBjZWxsRmxhc2hEZWxheWAgaGFzIGNvbXBsZXRlZC5cbiAgICAgKiBEZWZhdWx0OiBgMTAwMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGYWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3dpdGNoIGJldHdlZW4gbGF5b3V0IG9wdGlvbnM6IGBub3JtYWxgLCBgYXV0b0hlaWdodGAsIGBwcmludGAuXG4gICAgICogRGVmYXVsdDogYG5vcm1hbGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRvbUxheW91dDogJ25vcm1hbCcgfCAnYXV0b0hlaWdodCcgfCAncHJpbnQnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIG9yZGVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgaW4gdGhlIERPTSBhcmUgY29uc2lzdGVudCB3aXRoIHdoYXQgaXMgb24gc2NyZWVuLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnN1cmVEb21PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvcGVyYXRlIHRoZSBncmlkIGluIFJUTCAoUmlnaHQgdG8gTGVmdCkgbW9kZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUnRsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIGdyaWQgZG9lc24ndCB2aXJ0dWFsaXNlIHRoZSBjb2x1bW5zLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgMTAwIGNvbHVtbnMsIGJ1dCBvbmx5IDEwIHZpc2libGUgZHVlIHRvIHNjcm9sbGluZywgYWxsIDEwMCB3aWxsIGFsd2F5cyBiZSByZW5kZXJlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCB0aGUgZ3JpZCBoYXMgYSBsaW1pdCBvZiByZW5kZXJpbmcgYSBtYXhpbXVtIG9mIDUwMCByb3dzIGF0IG9uY2UgKHJlbWVtYmVyIHRoZSBncmlkIG9ubHkgcmVuZGVycyByb3dzIHlvdSBjYW4gc2VlLCBzbyB1bmxlc3MgeW91ciBkaXNwbGF5IHNob3dzIG1vcmUgdGhhbiA1MDAgcm93cyB3aXRob3V0IHZlcnRpY2FsbHkgc2Nyb2xsaW5nIHRoaXMgd2lsbCBuZXZlciBiZSBhbiBpc3N1ZSkuXG4gICAgICogPGJyIC8+KipUaGlzIGlzIG9ubHkgcmVsZXZhbnQgaWYgeW91IGFyZSBtYW51YWxseSBzZXR0aW5nIGByb3dCdWZmZXJgIHRvIGEgaGlnaCB2YWx1ZSAocmVuZGVyaW5nIG1vcmUgcm93cyB0aGFuIGNhbiBiZSBzZWVuKSBvciBpZiB5b3VyIGdyaWQgaGVpZ2h0IGlzIGFibGUgdG8gZGlzcGxheSBtb3JlIHRoYW4gNTAwIHJvd3MgYXQgb25jZS4qKlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBncmlkIGRvZXNuJ3QgdmlydHVhbGlzZSB0aGUgcm93cy4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIDEwMCByb3dzLCBidXQgb25seSAxMCB2aXNpYmxlIGR1ZSB0byBzY3JvbGxpbmcsIGFsbCAxMDAgd2lsbCBhbHdheXMgYmUgcmVuZGVyZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hbmFnZWQgUm93IERyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyByb3cgZHJhZ2dpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtb3Zpbmcgcm93cyB3aGlsZSBkcmFnZ2luZyB0aGUgYHJvd0RyYWdgIHdhZmZsZS4gVGhpcyBvcHRpb24gaGlnaGxpZ2h0cyB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIHJvdyB3aWxsIGJlIHBsYWNlZCBhbmQgaXQgd2lsbCBvbmx5IG1vdmUgdGhlIHJvdyBvbiBtb3VzZSB1cC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBjbGlja2luZyBhbmQgZHJhZ2dpbmcgYW55d2hlcmUgb24gdGhlIHJvdyB3aXRob3V0IHRoZSBuZWVkIGZvciBhIGRyYWcgaGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnRW50aXJlUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBkcmFnZ2luZyBtdWx0aXBsZSByb3dzIGF0IHRoZSBzYW1lIHRpbWUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNdWx0aVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBjZWxsIHJlbmRlcmVyIGNvbXBvbmVudCB0byB1c2UgZm9yIGZ1bGwgd2lkdGggcm93cy5cbiAgICAgKiBTZWUgW0Z1bGwgV2lkdGggUm93c10oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvZnVsbC13aWR0aC1yb3dzLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBmdWxsV2lkdGhDZWxsUmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJGcmFtZXdvcms6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSBkZXRhaWwgZ3JpZCBlbWJlZGRlZCBpbiB0aGUgbWFzdGVyIGdyaWQncyBjb250YWluZXIgYW5kIHNvIGxpbmsgdGhlaXIgaG9yaXpvbnRhbCBzY3JvbGxpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXByZWNhdGVkRW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZpZXMgaG93IHRoZSByZXN1bHRzIG9mIHJvdyBncm91cGluZyBzaG91bGQgYmUgZGlzcGxheWVkLlxuICAgICAqIFxuICAgICAqICBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICogXG4gICAgICogLSBgJ3NpbmdsZUNvbHVtbidgOiBzaW5nbGUgZ3JvdXAgY29sdW1uIGF1dG9tYXRpY2FsbHkgYWRkZWQgYnkgdGhlIGdyaWQuXG4gICAgICogLSBgJ211bHRpcGxlQ29sdW1ucydgOiBhIGdyb3VwIGNvbHVtbiBwZXIgcm93IGdyb3VwIGlzIGFkZGVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICogLSBgJ2dyb3VwUm93cydgOiBncm91cCByb3dzIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIGluc3RlYWQgb2YgZ3JvdXAgY29sdW1ucy5cbiAgICAgKiAtIGAnY3VzdG9tJ2A6IGluZm9ybXMgdGhlIGdyaWQgdGhhdCBncm91cCBjb2x1bW5zIHdpbGwgYmUgcHJvdmlkZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERpc3BsYXlUeXBlOiBSb3dHcm91cGluZ0Rpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgc2V0IHRvIHRoZSBudW1iZXIgb2YgbGV2ZWxzIHRvIGV4cGFuZCBieSBkZWZhdWx0LCBlLmcuIGAwYCBmb3Igbm9uZSwgYDFgIGZvciBmaXJzdCBsZXZlbCBvbmx5LCBldGMuIFNldCB0byBgLTFgIHRvIGV4cGFuZCBldmVyeXRoaW5nLiBEZWZhdWx0OiBgMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGVmYXVsdEV4cGFuZGVkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzcGVjaWZ5aW5nIHRoZSBncm91cCAnYXV0byBjb2x1bW4nIGlmIHlvdSBhcmUgbm90IGhhcHB5IHdpdGggdGhlIGRlZmF1bHQuIElmIGdyb3VwaW5nLCB0aGlzIGNvbHVtbiBkZWZpbml0aW9uIGlzIGluY2x1ZGVkIGFzIHRoZSBmaXJzdCBjb2x1bW4gaW4gdGhlIGdyaWQuIElmIG5vdCBncm91cGluZywgdGhpcyBjb2x1bW4gaXMgbm90IGluY2x1ZGVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0dyb3VwQ29sdW1uRGVmOiBDb2xEZWY8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgcHJlc2VydmVzIHRoZSBjdXJyZW50IGdyb3VwIG9yZGVyIHdoZW4gc29ydGluZyBvbiBub24tZ3JvdXAgY29sdW1ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgaWYgeW91IHNlbGVjdCBhIGdyb3VwLCB0aGUgY2hpbGRyZW4gb2YgdGhlIGdyb3VwIHdpbGwgYWxzbyBiZSBzZWxlY3RlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBkZXRlcm1pbmUgd2hldGhlciBmaWx0ZXJzIHNob3VsZCBiZSBhcHBsaWVkIG9uIGFnZ3JlZ2F0ZWQgZ3JvdXAgdmFsdWVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEFnZ0ZpbHRlcmluZzogYm9vbGVhbiB8IElzUm93RmlsdGVyYWJsZTxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGdyb3VwaW5nLCB0aGlzIGNvbnRyb2xzIHdoZXRoZXIgdG8gc2hvdyBhIGdyb3VwIGZvb3RlciB3aGVuIHRoZSBncm91cCBpcyBleHBhbmRlZC5cbiAgICAgKiBJZiBgdHJ1ZWAsIHRoZW4gYnkgZGVmYXVsdCwgdGhlIGZvb3RlciB3aWxsIGNvbnRhaW4gYWdncmVnYXRlIGRhdGEgKGlmIGFueSkgd2hlbiBzaG93biBhbmQgdGhlIGhlYWRlciB3aWxsIGJlIGJsYW5rLlxuICAgICAqIFdoZW4gY2xvc2VkLCB0aGUgaGVhZGVyIHdpbGwgY29udGFpbiB0aGUgYWdncmVnYXRlIGRhdGEgcmVnYXJkbGVzcyBvZiB0aGlzIHNldHRpbmcgKGFzIHRoZSBmb290ZXIgaXMgaGlkZGVuIGFueXdheSkuXG4gICAgICogVGhpcyBpcyBoYW5keSBmb3IgJ3RvdGFsJyByb3dzLCB0aGF0IGFyZSBkaXNwbGF5ZWQgYmVsb3cgdGhlIGRhdGEgd2hlbiB0aGUgZ3JvdXAgaXMgb3BlbiwgYW5kIGFsb25nc2lkZSB0aGUgZ3JvdXAgd2hlbiBpdCBpcyBjbG9zZWQuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgYSAnZ3JhbmQgdG90YWwnIGdyb3VwIGZvb3RlciBhY3Jvc3MgYWxsIGdyb3Vwcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlVG90YWxGb290ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgYW5kIHNob3dpbmcgZm9vdGVyLCBhZ2dyZWdhdGUgZGF0YSB3aWxsIGFsd2F5cyBiZSBkaXNwbGF5ZWQgYXQgYm90aCB0aGUgaGVhZGVyIGFuZCBmb290ZXIgbGV2ZWxzLiBUaGlzIHN0b3BzIHRoZSBwb3NzaWJseSB1bmRlc2lyYWJsZSBiZWhhdmlvdXIgb2YgdGhlIGhlYWRlciBkZXRhaWxzICdqdW1waW5nJyB0byB0aGUgZm9vdGVyIG9uIGV4cGFuZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiB1c2luZyBgZ3JvdXBTZWxlY3RzQ2hpbGRyZW5gLCB0aGVuIG9ubHkgdGhlIGNoaWxkcmVuIHRoYXQgcGFzcyB0aGUgY3VycmVudCBmaWx0ZXIgd2lsbCBnZXQgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0ZpbHRlcmVkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG93cyB0aGUgb3BlbiBncm91cCBpbiB0aGUgZ3JvdXAgY29sdW1uIGZvciBub24tZ3JvdXAgcm93cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd09wZW5lZEdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGdyb3VwcyB0aGF0IG9ubHkgaGF2ZSBvbmUgY2hpbGQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGxvd2VzdCBsZXZlbCBncm91cHMgdGhhdCBvbmx5IGhhdmUgb25lIGNoaWxkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZGUgcGFyZW50cyB0aGF0IGFyZSBvcGVuLiBXaGVuIHVzZWQgd2l0aCBtdWx0aXBsZSBjb2x1bW5zIGZvciBzaG93aW5nIGdyb3VwcywgaXQgY2FuIGdpdmUgYSBtb3JlIHBsZWFzaW5nIHVzZXIgZXhwZXJpZW5jZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdG8gc2hvdyB0aGUgJ3JvdyBncm91cCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gZ3JvdXApIGF0IHRoZSB0b3AuIERlZmF1bHQ6IGBuZXZlcmAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTaG93OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIENlbGwgUmVuZGVyZXIgdG8gdXNlIHdoZW4gYGdyb3VwRGlzcGxheVR5cGUgPSAnZ3JvdXBSb3dzJ2AuXG4gICAgICogU2VlIFtHcm91cCBSb3cgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvZ3JvdXBpbmctZ3JvdXAtcm93cy8jcHJvdmlkaW5nLWNlbGwtcmVuZGVyZXIpIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGdyb3VwUm93UmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgYGdyb3VwUm93UmVuZGVyZXJgIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgd2hlbiBhIGNvbHVtbiBpcyB1bi1ncm91cGVkLCBpLmUuIHVzaW5nIHRoZSBSb3cgR3JvdXAgUGFuZWwsIGl0IGlzIG1hZGUgdmlzaWJsZSBpbiB0aGUgZ3JpZC4gVGhpcyBwcm9wZXJ0eSBzdG9wcyB0aGUgY29sdW1uIGJlY29taW5nIHZpc2libGUgYWdhaW4gd2hlbiB1bi1ncm91cGluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWtlQ29sdW1uVmlzaWJsZUFmdGVyVW5Hcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIEdyaWQgdG8gd29yayB3aXRoIFRyZWUgRGF0YS4gWW91IG11c3QgYWxzbyBpbXBsZW1lbnQgdGhlIGBnZXREYXRhUGF0aChkYXRhKWAgY2FsbGJhY2suICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSB0aGlzIGlzIG5vdyBncm91cFJvd1JlbmRlcmVyUGFyYW1zLmlubmVyUmVuZGVyZXIgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93SW5uZXJSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIHRoaXMgaXMgbm93IGdyb3VwUm93UmVuZGVyZXJQYXJhbXMuaW5uZXJSZW5kZXJlciAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dJbm5lclJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGdyb3VwRGlzcGxheVR5cGUgPSAnbXVsdGlwbGVDb2x1bW5zJyBpbnN0ZWFkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cE11bHRpQXV0b0NvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgZ3JvdXBEaXNwbGF5VHlwZSA9ICdncm91cFJvd3MnIGluc3RlYWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwVXNlRW50aXJlUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBncm91cERpc3BsYXlUeXBlID0gJ2N1c3RvbScgaW5zdGVhZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gbm8gbG9uZ2VyIG5lZWRlZCwgdHJhbnNhY3Rpb24gdXBkYXRlcyBrZWVwIGdyb3VwIHN0YXRlICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZW1lbWJlckdyb3VwU3RhdGVXaGVuTmV3RGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIHRvcCByb3dzIGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkVG9wUm93RGF0YTogVERhdGFbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIGJvdHRvbSByb3dzIGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkQm90dG9tUm93RGF0YTogVERhdGFbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgcm93IG1vZGVsIHR5cGUuIERlZmF1bHQ6IGBjbGllbnRTaWRlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TW9kZWxUeXBlOiBSb3dNb2RlbFR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGUgZGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcm93cyBpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RhdGE6IFREYXRhW10gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBJbW11dGFibGUgRGF0YSBpcyBvbiBieSBkZWZhdWx0IHdoZW4gZ3JpZCBjYWxsYmFjayBnZXRSb3dJZCgpIGlzIGltcGxlbWVudGVkXG4gICAgICAgICAqIEVuYWJsZXMgSW1tdXRhYmxlIERhdGEgbW9kZSwgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBpbW11dGFibGUgc3RvcmVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbW11dGFibGVEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgZXhlY3V0aW5nIGEgYmF0Y2ggb2YgYXN5bmMgdHJhbnNhY3Rpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbldhaXRNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJldmVudHMgVHJhbnNhY3Rpb25zIGNoYW5naW5nIHNvcnQsIGZpbHRlciwgZ3JvdXAgb3IgcGl2b3Qgc3RhdGUgd2hlbiB0cmFuc2FjdGlvbiBvbmx5IGNvbnRhaW5zIHVwZGF0ZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFSb3dEYXRhTW9kZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdXNlIGFzeW5jVHJhbnNhY3Rpb25XYWl0TWlsbGlzIGluc3RlYWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGJhdGNoVXBkYXRlV2FpdE1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBkYXRhc291cmNlIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRhc291cmNlOiBJRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAqIERlZmF1bHQ6IGAxYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVPdmVyZmxvd1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAqIERlZmF1bHQ6IGAxYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IGhvdyBtYW55IGxvYWRpbmcgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGZvciB0aGUgcm9vdCBsZXZlbCBncm91cC5cbiAgICAgKiBEZWZhdWx0OiBgMWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgV2hldGhlciB0byB1c2UgRnVsbCBTdG9yZSBvciBQYXJ0aWFsIFN0b3JlIGZvciBzdG9yaW5nIHJvd3MuIERlZmF1bHQ6IGBmdWxsYC5cbiAgICAgICAgICogRGVwcmVjYXRlZCBpbiBmYXZvdXIgb2Ygc2VydmVyU2lkZUluZmluaXRlU2Nyb2xsLiBXaGVuIHRydWUsIFBhcnRpYWwgU3RvcmUgaXMgdXNlZC4gV2hlbiBmYWxzZSxcbiAgICAgICAgICogRnVsbCBTdG9yZSBpcyB1c2VkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVN0b3JlVHlwZTogU2VydmVyU2lkZVN0b3JlVHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHdoZXRoZXIgU2VydmVyLXNpZGUgUm93IE1vZGVsIHdpbGwgdXNlIEluZmluaXRlIFNjcm9sbGluZ1xuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVJbmZpbml0ZVNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcm93cyBmb3IgZWFjaCBibG9jayBpbiB0aGUgc3RvcmUsIGkuZS4gaG93IG1hbnkgcm93cyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgYXQgYSB0aW1lLlxuICAgICAqIERlZmF1bHQ6IGAxMDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZUJsb2NrU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBibG9ja3MgdG8ga2VlcCBpbiB0aGUgc3RvcmUuIERlZmF1bHQgaXMgbm8gbGltaXQsIHNvIGV2ZXJ5IHJlcXVlc3RlZCBibG9jayBpcyBrZXB0LiBVc2UgdGhpcyBpZiB5b3UgaGF2ZSBtZW1vcnkgY29uY2VybnMsIGFuZCBibG9ja3MgdGhhdCB3ZXJlIGxlYXN0IHJlY2VudGx5IHZpZXdlZCB3aWxsIGJlIHB1cmdlZCB3aGVuIHRoZSBsaW1pdCBpcyBoaXQuIFRoZSBncmlkIHdpbGwgYWRkaXRpb25hbGx5IG1ha2Ugc3VyZSBpdCBoYXMgYWxsIHRoZSBibG9ja3MgbmVlZGVkIHRvIGRpc3BsYXkgd2hhdCBpcyBjdXJyZW50bHkgdmlzaWJsZSwgaW4gY2FzZSB0aGlzIHByb3BlcnR5IGlzIHNldCB0byBhIGxvdyB2YWx1ZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heEJsb2Nrc0luQ2FjaGU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcmVxdWVzdHMgdG8gaGl0IHRoZSBzZXJ2ZXIgd2l0aCBjb25jdXJyZW50bHkuIElmIHRoZSBtYXggaXMgcmVhY2hlZCwgcmVxdWVzdHMgYXJlIHF1ZXVlZC5cbiAgICAgKiBTZXQgdG8gYC0xYCBmb3Igbm8gbWF4aW11bSByZXN0cmljdGlvbiBvbiByZXF1ZXN0cy5cbiAgICAgKiBEZWZhdWx0OiBgMmAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGxvYWRpbmcgYSBibG9jay4gVXNlZnVsIHdoZW4gaW5maW5pdGUgc2Nyb2xsaW5nIGFuZCBzY3JvbGxpbmcgb3ZlciBtYW55IGluZmluaXRlIGJsb2NrcywgYXMgaXQgcHJldmVudHMgYmxvY2tzIGxvYWRpbmcgdW50aWwgc2Nyb2xsaW5nIGhhcyBzZXR0bGVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYmxvY2tMb2FkRGVib3VuY2VNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBjbG9zaW5nIGdyb3VwIHJvd3Mgd2lsbCByZW1vdmUgY2hpbGRyZW4gb2YgdGhhdCByb3cuIE5leHQgdGltZSB0aGUgcm93IGlzIG9wZW5lZCwgY2hpbGQgcm93cyB3aWxsIGJlIHJlYWQgZnJvbSB0aGUgZGF0YXNvdXJjZSBhZ2Fpbi4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHB1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIGBzZXJ2ZXJTaWRlRGF0YXNvdXJjZWAgZm9yIHNlcnZlciBzaWRlIHJvdyBtb2RlbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVEYXRhc291cmNlOiBJU2VydmVyU2lkZURhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgYWx3YXlzIHJlZnJlc2hlcyB0b3AgbGV2ZWwgZ3JvdXBzIHJlZ2FyZGxlc3Mgb2Ygd2hpY2ggY29sdW1uIHdhcyBzb3J0ZWQuIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nICYgc29ydGluZyBpcyBoYW5kbGVkIG9uIHRoZSBzZXJ2ZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0QWxsTGV2ZWxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGFsd2F5cyByZWZyZXNoZXMgdG9wIGxldmVsIGdyb3VwcyByZWdhcmRsZXNzIG9mIHdoaWNoIGNvbHVtbiB3YXMgZmlsdGVyZWQuIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nICYgZmlsdGVyaW5nIGlzIGhhbmRsZWQgb24gdGhlIHNlcnZlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlckFsbExldmVsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBTb3J0aW5nIHdpbGwgYmUgZG9uZSBvbiB0aGUgc2VydmVyIHNpZGUuIFdoZW4gc2VydmVyU2lkZUluZmluaXRlU2Nyb2xsPXRydWUsIGRvZXMgbm90aGluZyxcbiAgICAgKiBhcyBTb3J0aW5nIGlzIGFsd2F5cyBzZXJ2ZXIgc2lkZSB3aGVuIEluZmluaXRlIFNjcm9sbCBpcyBhY3RpdmUuXG4gICAgICogRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRPblNlcnZlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBGaWx0ZXJpbmcgd2lsbCBiZSBkb25lIG9uIHRoZSBzZXJ2ZXIgc2lkZS4gV2hlbiBzZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw9dHJ1ZSwgZG9lcyBub3RoaW5nLFxuICAgICAqIGFzIEZpbHRlcmluZyBpcyBhbHdheXMgc2VydmVyIHNpZGUgd2hlbiBJbmZpbml0ZSBTY3JvbGwgaXMgYWN0aXZlLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVGaWx0ZXJPblNlcnZlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVGhpcyBwcm9wZXJ0eSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgYHNlcnZlclNpZGVTb3J0QWxsTGV2ZWxzYCBpbnN0ZWFkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRpbmdBbHdheXNSZXNldHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFRoaXMgcHJvcGVydHkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIGBzZXJ2ZXJTaWRlRmlsdGVyQWxsTGV2ZWxzYCBpbnN0ZWFkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlcmluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRW50ZXJwcmlzZVJlc2V0T25OZXdDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyB1c2UgdGhlIHZpZXdwb3J0IHJvdyBtb2RlbCB5b3UgbmVlZCB0byBwcm92aWRlIHRoZSBncmlkIHdpdGggYSBgdmlld3BvcnREYXRhc291cmNlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0RGF0YXNvdXJjZTogSVZpZXdwb3J0RGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyB2aWV3cG9ydCByb3cgbW9kZWwsIHNldHMgdGhlIHBhZ2Ugc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbFBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgdmlld3BvcnQgcm93IG1vZGVsLCBzZXRzIHRoZSBidWZmZXIgc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbEJ1ZmZlclNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgaG9yaXpvbnRhbCBzY3JvbGxiYXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSB2ZXJ0aWNhbCBzY3JvbGxiYXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBkZWJvdW5jZSB0aGUgdmVydGljYWwgc2Nyb2xsYmFyLiBDYW4gcHJvdmlkZSBzbW9vdGhlciBzY3JvbGxpbmcgb24gc2xvdyBtYWNoaW5lcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBuZXZlciBzaG93IHRoZSBob3Jpem9udGFsIHNjcm9sbC4gVGhpcyBpcyB1c2VmdWwgaWYgdGhlIGdyaWQgaXMgYWxpZ25lZCB3aXRoIGFub3RoZXIgZ3JpZCBhbmQgd2lsbCBzY3JvbGwgd2hlbiB0aGUgb3RoZXIgZ3JpZCBzY3JvbGxzLiAoU2hvdWxkIG5vdCBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsYC4pIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IHNjcm9sbCB0byB0aGUgdG9wIHdoZW4gbmV3IHJvdyBkYXRhIGlzIHByb3ZpZGVkLiBVc2UgdGhpcyBpZiB5b3UgZG9uJ3Qgd2FudCB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgb2Ygc2Nyb2xsaW5nIHRvIHRoZSB0b3AgZXZlcnkgdGltZSB5b3UgbG9hZCBuZXcgZGF0YS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBhbGxvdyBtb3VzZXdoZWVsIC8gdG91Y2hwYWQgc2Nyb2xsIHdoZW4gcG9wdXAgZWxlbWVudHMgYXJlIHByZXNlbnQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCB1c2UgYW5pbWF0aW9uIGZyYW1lcyB3aGVuIGRyYXdpbmcgcm93cyB3aGlsZSBzY3JvbGxpbmcuIFVzZSB0aGlzIGlmIHRoZSBncmlkIGlzIHdvcmtpbmcgZmFzdCBlbm91Z2ggdGhhdCB5b3UgZG9uJ3QgbmVlZCBhbmltYXRpb24gZnJhbWVzIGFuZCB5b3UgZG9uJ3Qgd2FudCB0aGUgZ3JpZCB0byBmbGlja2VyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FuaW1hdGlvbkZyYW1lOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIG1pZGRsZSBjbGlja3Mgd2lsbCByZXN1bHQgaW4gYGNsaWNrYCBldmVudHMgZm9yIGNlbGxzIGFuZCByb3dzLiBPdGhlcndpc2UgdGhlIGJyb3dzZXIgd2lsbCB1c2UgbWlkZGxlIGNsaWNrIHRvIHNjcm9sbCB0aGUgZ3JpZC48YnIgLz4qKk5vdGU6KiogTm90IGFsbCBicm93c2VycyBmaXJlIGBjbGlja2AgZXZlbnRzIHdpdGggdGhlIG1pZGRsZSBidXR0b24uIE1vc3Qgd2lsbCBmaXJlIG9ubHkgYG1vdXNlZG93bmAgYW5kIGBtb3VzZXVwYCBldmVudHMsIHdoaWNoIGNhbiBiZSB1c2VkIHRvIGZvY3VzIGEgY2VsbCwgYnV0IHdpbGwgbm90IHdvcmsgdG8gY2FsbCB0aGUgYG9uQ2VsbENsaWNrZWRgIGZ1bmN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01pZGRsZUNsaWNrU2Nyb2xsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBtb3VzZSB3aGVlbCBldmVudHMgd2lsbCBiZSBwYXNzZWQgdG8gdGhlIGJyb3dzZXIuIFVzZWZ1bCBpZiB5b3VyIGdyaWQgaGFzIG5vIHZlcnRpY2FsIHNjcm9sbHMgYW5kIHlvdSB3YW50IHRoZSBtb3VzZSB0byBzY3JvbGwgdGhlIGJyb3dzZXIgcGFnZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcmV2ZW50RGVmYXVsdE9uTW91c2VXaGVlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGVsbCB0aGUgZ3JpZCBob3cgd2lkZSBpbiBwaXhlbHMgdGhlIHNjcm9sbGJhciBpcywgd2hpY2ggaXMgdXNlZCBpbiBncmlkIHdpZHRoIGNhbGN1bGF0aW9ucy4gU2V0IG9ubHkgaWYgdXNpbmcgbm9uLXN0YW5kYXJkIGJyb3dzZXItcHJvdmlkZWQgc2Nyb2xsYmFycywgc28gdGhlIGdyaWQgY2FuIHVzZSB0aGUgbm9uLXN0YW5kYXJkIHNpemUgaW4gaXRzIGNhbGN1bGF0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNjcm9sbGJhcldpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFR5cGUgb2YgUm93IFNlbGVjdGlvbjogYHNpbmdsZWAsIGBtdWx0aXBsZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTZWxlY3Rpb246ICdzaW5nbGUnIHwgJ211bHRpcGxlJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBtdWx0aXBsZSByb3dzIHRvIGJlIHNlbGVjdGVkIHVzaW5nIHNpbmdsZSBjbGljay4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgcm93cyB3aWxsIG5vdCBiZSBkZXNlbGVjdGVkIGlmIHlvdSBob2xkIGRvd24gYEN0cmxgIGFuZCBjbGljayB0aGUgcm93IG9yIHByZXNzIGBTcGFjZWAuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RGVzZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgcm93IHNlbGVjdGlvbiB3b24ndCBoYXBwZW4gd2hlbiByb3dzIGFyZSBjbGlja2VkLiBVc2Ugd2hlbiB5b3Ugb25seSB3YW50IGNoZWNrYm94IHNlbGVjdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVGhpcyBwcm9wZXJ0eSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgYHN1cHByZXNzQ2VsbEZvY3VzYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIGNlbGxzIHdvbid0IGJlIGZvY3VzYWJsZS4gVGhpcyBtZWFucyBrZXlib2FyZCBuYXZpZ2F0aW9uIHdpbGwgYmUgZGlzYWJsZWQgZm9yIGdyaWQgY2VsbHMsIGJ1dCByZW1haW4gZW5hYmxlZCBpbiBvdGhlciBlbGVtZW50cyBvZiB0aGUgZ3JpZCBzdWNoIGFzIGNvbHVtbiBoZWFkZXJzLCBmbG9hdGluZyBmaWx0ZXJzLCB0b29sIHBhbmVscy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDZWxsRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgb25seSBhIHNpbmdsZSByYW5nZSBjYW4gYmUgc2VsZWN0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBiZSBhYmxlIHRvIHNlbGVjdCB0aGUgdGV4dCB3aXRoaW4gY2VsbHMuXG4gICAgICogXG4gICAgICogICAgICoqTm90ZToqKiBXaGVuIHRoaXMgaXMgc2V0IHRvIGB0cnVlYCwgdGhlIGNsaXBib2FyZCBzZXJ2aWNlIGlzIGRpc2FibGVkLlxuICAgICAqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBSYW5nZSBTZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgUmFuZ2UgSGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZUhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIEZpbGwgSGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCd4J2AgdG8gZm9yY2UgdGhlIGZpbGwgaGFuZGxlIGRpcmVjdGlvbiB0byBob3Jpem9udGFsLCBvciBzZXQgdG8gYCd5J2AgdG8gZm9yY2UgdGhlIGZpbGwgaGFuZGxlIGRpcmVjdGlvbiB0byB2ZXJ0aWNhbC4gRGVmYXVsdDogYHh5YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbEhhbmRsZURpcmVjdGlvbjogJ3gnIHwgJ3knIHwgJ3h5JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHByZXZlbnQgY2VsbCB2YWx1ZXMgZnJvbSBiZWluZyBjbGVhcmVkIHdoZW4gdGhlIFJhbmdlIFNlbGVjdGlvbiBpcyByZWR1Y2VkIGJ5IHRoZSBGaWxsIEhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXJyYXkgZGVmaW5pbmcgdGhlIG9yZGVyIGluIHdoaWNoIHNvcnRpbmcgb2NjdXJzIChpZiBzb3J0aW5nIGlzIGVuYWJsZWQpLiBWYWx1ZXMgY2FuIGJlIGAnYXNjJ2AsIGAnZGVzYydgIG9yIGBudWxsYC4gRm9yIGV4YW1wbGU6IGBzb3J0aW5nT3JkZXI6IFsnYXNjJywgJ2Rlc2MnXWAuIERlZmF1bHQ6IGBbbnVsbCwgJ2FzYycsICdkZXNjJ11gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6ICgnYXNjJyB8ICdkZXNjJyB8IG51bGwpW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3BlY2lmeSB0aGF0IHRoZSBzb3J0IHNob3VsZCB0YWtlIGFjY2VudGVkIGNoYXJhY3RlcnMgaW50byBhY2NvdW50LiBJZiB0aGlzIGZlYXR1cmUgaXMgdHVybmVkIG9uIHRoZSBzb3J0IHdpbGwgYmUgc2xvd2VyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc2hvdyB0aGUgJ25vIHNvcnQnIGljb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuU29ydEljb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3MgbXVsdGktc29ydCB3aGVuIHRoZSB1c2VyIHNoaWZ0LWNsaWNrcyBhIGNvbHVtbiBoZWFkZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBtdWx0aS1zb3J0IHdoZW4gdGhlIHVzZXIgY2xpY2tzIGEgY29sdW1uIGhlYWRlciwgcmVnYXJkbGVzcyBvZiBrZXkgcHJlc3Nlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzTXVsdGlTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdjdHJsJ2AgdG8gaGF2ZSBtdWx0aSBzb3J0aW5nIHdvcmsgdXNpbmcgdGhlIGBDdHJsYCAob3IgYENvbW1hbmQg4oyYYCBmb3IgTWFjKSBrZXkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtdWx0aVNvcnRLZXk6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBzb3J0aW5nIG9mIHVuLXNvcnRlZCBkYXRhIHRvIG1hdGNoIG9yaWdpbmFsIHJvdyBkYXRhLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01haW50YWluVW5zb3J0ZWRPcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWNvbnMgdG8gdXNlIGluc2lkZSB0aGUgZ3JpZCBpbnN0ZWFkIG9mIHRoZSBncmlkJ3MgZGVmYXVsdCBpY29ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGljb25zOiB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIHwgc3RyaW5nOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEZWZhdWx0IHJvdyBoZWlnaHQgaW4gcGl4ZWxzLiBEZWZhdWx0OiBgMjVgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIHN0eWxlIHByb3BlcnRpZXMgdG8gYXBwbHkgdG8gYWxsIHJvd3MuIFNldCB0byBhbiBvYmplY3Qgb2Yga2V5IChzdHlsZSBuYW1lcykgYW5kIHZhbHVlcyAoc3R5bGUgdmFsdWVzKSAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3R5bGU6IFJvd1N0eWxlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MoZXMpIGZvciBhbGwgcm93cy4gUHJvdmlkZSBlaXRoZXIgYSBzdHJpbmcgKGNsYXNzIG5hbWUpIG9yIGFycmF5IG9mIHN0cmluZ3MgKGFycmF5IG9mIGNsYXNzIG5hbWVzKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUnVsZXMgd2hpY2ggY2FuIGJlIGFwcGxpZWQgdG8gaW5jbHVkZSBjZXJ0YWluIENTUyBjbGFzc2VzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93Q2xhc3NSdWxlczogUm93Q2xhc3NSdWxlczxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IGhpZ2hsaWdodCByb3dzIGJ5IGFkZGluZyB0aGUgYGFnLXJvdy1ob3ZlcmAgQ1NTIGNsYXNzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0hvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBVc2VzIENTUyBgdG9wYCBpbnN0ZWFkIG9mIENTUyBgdHJhbnNmb3JtYCBmb3IgcG9zaXRpb25pbmcgcm93cy4gVXNlZnVsIGlmIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gaXMgY2F1c2luZyBpc3N1ZXMgc3VjaCBhcyB1c2VkIGluIHJvdyBzcGFubmluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGlnaGxpZ2h0IGNvbHVtbnMgYnkgYWRkaW5nIHRoZSBgYWctY29sdW1uLWhvdmVyYCBDU1MgY2xhc3MuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkhvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhRGlzcGxheVR5cGU6IFRyZWVEYXRhRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgQElucHV0KCkgcHVibGljIGFuZ3VsYXJDb21waWxlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgYW5ndWxhckNvbXBpbGVGaWx0ZXJzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNQYXNzaXZlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgY29udGV4dCBtZW51LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q29udGV4dE1lbnVJdGVtczogR2V0Q29udGV4dE1lbnVJdGVtczxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgbWFpbiAnY29sdW1uIGhlYWRlcicgbWVudS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldE1haW5NZW51SXRlbXM6IEdldE1haW5NZW51SXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB1c2VyIHRvIHByb2Nlc3MgcG9wdXBzIGFmdGVyIHRoZXkgYXJlIGNyZWF0ZWQuIEFwcGxpY2F0aW9ucyBjYW4gdXNlIHRoaXMgaWYgdGhleSB3YW50IHRvLCBmb3IgZXhhbXBsZSwgcmVwb3NpdGlvbiB0aGUgcG9wdXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0UHJvY2Vzc1BvcHVwOiAoKHBhcmFtczogUG9zdFByb2Nlc3NQb3B1cFBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgY2VsbHMgZm9yIHRoZSBjbGlwYm9hcmQuIEhhbmR5IGlmIGZvciBleGFtcGxlIHlvdSBoYXZlIGBEYXRlYCBvYmplY3RzIHRoYXQgbmVlZCB0byBoYXZlIGEgcGFydGljdWxhciBmb3JtYXQgaWYgaW1wb3J0aW5nIGludG8gRXhjZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBjbGlwYm9hcmQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzSGVhZGVyRm9yQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBncm91cCBoZWFkZXIgdmFsdWVzIGZvciB0aGUgY2xpcGJvYXJkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0dyb3VwSGVhZGVyRm9yQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0dyb3VwSGVhZGVyRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGNlbGxzIGZyb20gdGhlIGNsaXBib2FyZC4gSGFuZHkgaWYgZm9yIGV4YW1wbGUgeW91IGhhdmUgbnVtYmVyIGZpZWxkcywgYW5kIHdhbnQgdG8gYmxvY2sgbm9uLW51bWJlcnMgZnJvbSBnZXR0aW5nIGludG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZyb21DbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gZ2V0IHRoZSBkYXRhIHRoYXQgd291bGQgb3RoZXJ3aXNlIGdvIHRvIHRoZSBjbGlwYm9hcmQuIFRvIGJlIHVzZWQgd2hlbiB5b3Ugd2FudCB0byBjb250cm9sIHRoZSAnY29weSB0byBjbGlwYm9hcmQnIG9wZXJhdGlvbiB5b3Vyc2VsZi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlbmRUb0NsaXBib2FyZDogKChwYXJhbXM6IFNlbmRUb0NsaXBib2FyZFBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY29tcGxldGUgY29udHJvbCBvZiB0aGUgcGFzdGUgb3BlcmF0aW9uLCBpbmNsdWRpbmcgY2FuY2VsbGluZyB0aGUgb3BlcmF0aW9uIChzbyBub3RoaW5nIGhhcHBlbnMpIG9yIHJlcGxhY2luZyB0aGUgZGF0YSB3aXRoIG90aGVyIGRhdGEuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzRGF0YUZyb21DbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmdbXVtdIHwgbnVsbCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEdyaWQgY2FsbHMgdGhpcyBtZXRob2QgdG8ga25vdyBpZiBhbiBleHRlcm5hbCBmaWx0ZXIgaXMgcHJlc2VudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50OiAoKHBhcmFtczogSXNFeHRlcm5hbEZpbHRlclByZXNlbnRQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2hvdWxkIHJldHVybiBgdHJ1ZWAgaWYgZXh0ZXJuYWwgZmlsdGVyIHBhc3Nlcywgb3RoZXJ3aXNlIGBmYWxzZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb2VzRXh0ZXJuYWxGaWx0ZXJQYXNzOiAoKG5vZGU6IFJvd05vZGU8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB0byBjdXN0b21pc2UgdGhlIGNoYXJ0IHRvb2xiYXIgaXRlbXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGFydFRvb2xiYXJJdGVtczogR2V0Q2hhcnRUb29sYmFySXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGVuYWJsZSBkaXNwbGF5aW5nIHRoZSBjaGFydCBpbiBhbiBhbHRlcm5hdGl2ZSBjaGFydCBjb250YWluZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjcmVhdGVDaGFydENvbnRhaW5lcjogKChwYXJhbXM6IENoYXJ0UmVmUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgbmF2aWdhdGlvbiAoYXJyb3cpIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dEhlYWRlcjogKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zPFREYXRhPikgPT4gKEhlYWRlclBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRIZWFkZXI6ICgocGFyYW1zOiBUYWJUb05leHRIZWFkZXJQYXJhbXM8VERhdGE+KSA9PiAoSGVhZGVyUG9zaXRpb24gfCBudWxsKSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgbmF2aWdhdGlvbiAoYXJyb3cpIGtleSB3aGVuIGEgY2VsbCBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgQ2VsbCBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBgbnVsbGAgdG8gc3RheSBvbiBjdXJyZW50IGNlbGwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dENlbGw6ICgocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dENlbGxQYXJhbXM8VERhdGE+KSA9PiAoQ2VsbFBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgY2VsbCBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgQ2VsbCBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBudWxsIHRvIHN0YXkgb24gY3VycmVudCBjZWxsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0Q2VsbDogKChwYXJhbXM6IFRhYlRvTmV4dENlbGxQYXJhbXM8VERhdGE+KSA9PiAoQ2VsbFBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFNldCB2aWEgYGNvbERlZi5zdXBwcmVzc0tleWJvYXJkRXZlbnRgLiBJZiB5b3UgbmVlZCB0aGlzIHRvIGJlIHNldCBmb3IgZXZlcnkgY29sdW1uIHNldCB2aWEgdGhlIGBkZWZhdWx0Q29sRGVmLnN1cHByZXNzS2V5Ym9hcmRFdmVudGAgcHJvcGVydHkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0tleWJvYXJkRXZlbnQ6ICgocGFyYW1zOiBTdXBwcmVzc0tleWJvYXJkRXZlbnRQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgYGdldExvY2FsZVRleHRgIGluc3RlYWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2NhbGVUZXh0RnVuYzogKChrZXk6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBzdHJpbmcsIHZhcmlhYmxlVmFsdWVzPzogc3RyaW5nW10pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgY2FsbGJhY2sgZm9yIGxvY2FsaXNpbmcgdGV4dCB3aXRoaW4gdGhlIGdyaWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRMb2NhbGVUZXh0OiAoKHBhcmFtczogR2V0TG9jYWxlVGV4dFBhcmFtczxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHdoYXQgYGRvY3VtZW50YCBpcyB1c2VkLiBDdXJyZW50bHkgdXNlZCBieSBEcmFnIGFuZCBEcm9wIChtYXkgZXh0ZW5kIHRvIG90aGVyIHBsYWNlcyBpbiB0aGUgZnV0dXJlKS4gVXNlIHRoaXMgd2hlbiB5b3Ugd2FudCB0aGUgZ3JpZCB0byB1c2UgYSBkaWZmZXJlbnQgYGRvY3VtZW50YCB0aGFuIHRoZSBvbmUgYXZhaWxhYmxlIG9uIHRoZSBnbG9iYWwgc2NvcGUuIFRoaXMgY2FuIGhhcHBlbiBpZiBkb2NraW5nIG91dCBjb21wb25lbnRzIChzb21ldGhpbmcgd2hpY2ggRWxlY3Ryb24gc3VwcG9ydHMpICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREb2N1bWVudDogKCgpID0+IERvY3VtZW50KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHVzZXIgdG8gZm9ybWF0IHRoZSBudW1iZXJzIGluIHRoZSBwYWdpbmF0aW9uIHBhbmVsLCBpLmUuICdyb3cgY291bnQnIGFuZCAncGFnZSBudW1iZXInIGxhYmVscy4gVGhpcyBpcyBmb3IgcGFnaW5hdGlvbiBwYW5lbCBvbmx5LCB0byBmb3JtYXQgbnVtYmVycyBpbnNpZGUgdGhlIGdyaWQncyBjZWxscyAoaS5lLiB5b3VyIGRhdGEpLCB0aGVuIHVzZSBgdmFsdWVGb3JtYXR0ZXJgIGluIHRoZSBjb2x1bW4gZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyOiAoKHBhcmFtczogUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtczxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGBnZXRHcm91cFJvd0FnZ2AgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93QWdnTm9kZXM6ICgobm9kZXM6IFJvd05vZGVbXSkgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gdXNlIHdoZW4geW91IG5lZWQgYWNjZXNzIHRvIG1vcmUgdGhlbiB0aGUgY3VycmVudCBjb2x1bW4gZm9yIGFnZ3JlZ2F0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0R3JvdXBSb3dBZ2c6ICgocGFyYW1zOiBHZXRHcm91cFJvd0FnZ1BhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIChDbGllbnQtc2lkZSBSb3cgTW9kZWwgb25seSkgQWxsb3dzIGdyb3VwcyB0byBiZSBvcGVuIGJ5IGRlZmF1bHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0dyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBkZWZhdWx0IHNvcnRpbmcgb2YgZ3JvdXBzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yOiAoKHBhcmFtczogSW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yUGFyYW1zPFREYXRhPikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgLSBVc2UgYGluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvcmAgaW5zdGVhZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwT3JkZXJDb21wYXJhdG9yOiAoKG5vZGVBOiBSb3dOb2RlPFREYXRhPiwgbm9kZUI6IFJvd05vZGU8VERhdGE+KSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sRGVmYCBpbnN0ZWFkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sRGVmOiAoKGNvbERlZjogQ29sRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIC0gVXNlIGBwcm9jZXNzUGl2b3RSZXN1bHRDb2xHcm91cERlZmAgaW5zdGVhZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1NlY29uZGFyeUNvbEdyb3VwRGVmOiAoKGNvbEdyb3VwRGVmOiBDb2xHcm91cERlZjxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggcGl2b3RpbmcsIHRvIGFsbG93IGNoYW5naW5nIHRoZSBzZWNvbmQgY29sdW1uIGRlZmluaXRpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUGl2b3RSZXN1bHRDb2xEZWY6ICgoY29sRGVmOiBDb2xEZWY8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIHBpdm90aW5nLCB0byBhbGxvdyBjaGFuZ2luZyB0aGUgc2Vjb25kIGNvbHVtbiBncm91cCBkZWZpbml0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sR3JvdXBEZWY6ICgoY29sR3JvdXBEZWY6IENvbEdyb3VwRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2hlbiB3b3JraW5nIHdpdGggVHJlZSBEYXRhIHdoZW4gYHRyZWVEYXRhID0gdHJ1ZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREYXRhUGF0aDogR2V0RGF0YVBhdGg8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCAtIFVzZSBpbml0aWFsR3JvdXBPcmRlckNvbXBhcmF0b3IgaW5zdGVhZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwU29ydENvbXBhcmF0b3I6ICgobm9kZUE6IFJvd05vZGU8VERhdGE+LCBub2RlQjogUm93Tm9kZTxURGF0YT4pID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzZXR0aW5nIHRoZSBjaGlsZCBjb3VudCBmb3IgYSBncm91cCByb3cuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGlsZENvdW50OiAoKGRhdGFJdGVtOiBhbnkpID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBwcm92aWRpbmcgZGlmZmVyZW50IHBhcmFtcyBmb3IgZGlmZmVyZW50IGxldmVscyBvZiBncm91cGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zOiAoKHBhcmFtczogR2V0U2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXNQYXJhbXMpID0+IFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdXNlIGBnZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc2AgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVTdG9yZVBhcmFtczogKChwYXJhbXM6IEdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zUGFyYW1zKSA9PiBTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtcykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBncm91cHMgdG8gYmUgb3BlbiBieSBkZWZhdWx0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0OiAoKHBhcmFtczogSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNhbmNlbGxpbmcgdHJhbnNhY3Rpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbjogSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU1NSTSBUcmVlIERhdGE6IEFsbG93cyBzcGVjaWZ5aW5nIHdoaWNoIHJvd3MgYXJlIGV4cGFuZGFibGUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cDogSXNTZXJ2ZXJTaWRlR3JvdXAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNTUk0gVHJlZSBEYXRhOiBBbGxvd3Mgc3BlY2lmeWluZyBncm91cCBrZXlzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZUdyb3VwS2V5OiBHZXRTZXJ2ZXJTaWRlR3JvdXBLZXkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJldHVybiBhIGJ1c2luZXNzIGtleSBmb3IgdGhlIG5vZGUuIElmIGltcGxlbWVudGVkLCBlYWNoIHJvdyBpbiB0aGUgRE9NIHdpbGwgaGF2ZSBhbiBhdHRyaWJ1dGUgYHJvdy1pZD0nYWJjJ2Agd2hlcmUgYGFiY2AgaXMgd2hhdCB5b3UgcmV0dXJuIGFzIHRoZSBidXNpbmVzcyBrZXkuXG4gICAgICogVGhpcyBpcyB1c2VmdWwgZm9yIGF1dG9tYXRlZCB0ZXN0aW5nLCBhcyBpdCBwcm92aWRlcyBhIHdheSBmb3IgeW91ciB0b29sIHRvIGlkZW50aWZ5IHJvd3MgYmFzZWQgb24gdW5pcXVlIGJ1c2luZXNzIGtleXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRCdXNpbmVzc0tleUZvck5vZGU6ICgobm9kZTogUm93Tm9kZTxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIFVzZSBgZ2V0Um93SWRgIGluc3RlYWQgLSBob3dldmVyIGJlIGF3YXJlLCBgZ2V0Um93SWQoKWAgd2lsbCBhbHNvIHNldCBncmlkIG9wdGlvbiBgaW1tdXRhYmxlRGF0YT10cnVlYFxuICAgICAgICAgKiBBbGxvd3MgeW91IHRvIHNldCB0aGUgSUQgZm9yIGEgcGFydGljdWxhciByb3cgbm9kZSBiYXNlZCBvbiB0aGUgZGF0YS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd05vZGVJZDogR2V0Um93Tm9kZUlkRnVuYzxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzZXR0aW5nIHRoZSBJRCBmb3IgYSBwYXJ0aWN1bGFyIHJvdyBub2RlIGJhc2VkIG9uIHRoZSBkYXRhLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SWQ6IEdldFJvd0lkRnVuYzxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgZ2V0Um93SWQoKSBjYWxsYmFjayBpcyBpbXBsZW1lbnRlZCBhbmQgbmV3IFJvdyBEYXRhIGlzIHNldCwgdGhlIGdyaWQgd2lsbCBkaXNyZWdhcmQgYWxsIHByZXZpb3VzIHJvd3MgYW5kIHRyZWF0IHRoZSBuZXcgUm93IERhdGEgYXMgbmV3IGRhdGEuIEFzIGEgY29uc2VxdWVuY2UsIGFsbCBSb3cgU3RhdGUgKGVnIHNlbGVjdGlvbiwgcmVuZGVyZWQgcm93cykgd2lsbCBiZSByZXNldC4gIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlc2V0Um93RGF0YU9uVXBkYXRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3Mgcm93cyBhZnRlciB0aGV5IGFyZSBjcmVhdGVkLCBzbyB5b3UgY2FuIGRvIGZpbmFsIGFkZGluZyBvZiBjdXN0b20gYXR0cmlidXRlcyBldGMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUm93UG9zdENyZWF0ZTogKChwYXJhbXM6IFByb2Nlc3NSb3dQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggcm93cyBhcmUgc2VsZWN0YWJsZS4gQnkgZGVmYXVsdCByb3dzIGFyZSBzZWxlY3RhYmxlLCBzbyByZXR1cm4gYGZhbHNlYCB0byBtYWtlIGEgcm93IHVuLXNlbGVjdGFibGUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd1NlbGVjdGFibGU6IElzUm93U2VsZWN0YWJsZTxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBNYXN0ZXIgRGV0YWlsIHRvIGRldGVybWluZSBpZiBhIHJvdyBzaG91bGQgYmUgYSBtYXN0ZXIgcm93LiBJZiBgZmFsc2VgIGlzIHJldHVybmVkIG5vIGRldGFpbCByb3cgd2lsbCBleGlzdCBmb3IgdGhpcyByb3cuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd01hc3RlcjogSXNSb3dNYXN0ZXI8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBmaWxsIHZhbHVlcyBpbnN0ZWFkIG9mIHNpbXBseSBjb3B5aW5nIHZhbHVlcyBvciBpbmNyZWFzaW5nIG51bWJlciB2YWx1ZXMgdXNpbmcgbGluZWFyIHByb2dyZXNzaW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbE9wZXJhdGlvbjogKChwYXJhbXM6IEZpbGxPcGVyYXRpb25QYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBVc2UgYHBvc3RTb3J0Um93c2AgaW5zdGVhZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnQ6ICgobm9kZXM6IFJvd05vZGU8VERhdGE+W10pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBwZXJmb3JtIGFkZGl0aW9uYWwgc29ydGluZyBhZnRlciB0aGUgZ3JpZCBoYXMgc29ydGVkIHRoZSByb3dzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnRSb3dzOiAoKHBhcmFtczogUG9zdFNvcnRSb3dzUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd1N0eWxlYCB0byBzZXQgc3R5bGUgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgQ1NTIHZhbHVlcyBvciB1bmRlZmluZWQgZm9yIG5vIHN0eWxlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd1N0eWxlOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXM8VERhdGE+KSA9PiBSb3dTdHlsZSB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd0NsYXNzYCB0byBzZXQgY2xhc3MoZXMpIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSwgYXJyYXkgb2Ygc3RyaW5ncyAoYXJyYXkgb2YgY2xhc3MgbmFtZXMpIG9yIHVuZGVmaW5lZCBmb3Igbm8gY2xhc3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzczogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dIZWlnaHRgIHRvIHNldCBoZWlnaHQgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhIHBvc2l0aXZlIG51bWJlciBvZiBwaXhlbHMsIG9yIHJldHVybiBgbnVsbGAvYHVuZGVmaW5lZGAgdG8gdXNlIHRoZSBkZWZhdWx0IHJvdyBoZWlnaHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dIZWlnaHQ6ICgocGFyYW1zOiBSb3dIZWlnaHRQYXJhbXM8VERhdGE+KSA9PiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBpc0Z1bGxXaWR0aFJvd2AgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRnVsbFdpZHRoQ2VsbDogKChyb3dOb2RlOiBSb3dOb2RlPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRlbGxzIHRoZSBncmlkIGlmIHRoaXMgcm93IHNob3VsZCBiZSByZW5kZXJlZCBhcyBmdWxsIHdpZHRoLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNGdWxsV2lkdGhSb3c6ICgocGFyYW1zOiBJc0Z1bGxXaWR0aFJvd1BhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgLyoqIFRoZSB0b29sIHBhbmVsIHdhcyBoaWRkZW4gb3Igc2hvd24uIFVzZSBgYXBpLmlzVG9vbFBhbmVsU2hvd2luZygpYCB0byBnZXQgc3RhdHVzLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUGFzdGUgb3BlcmF0aW9uIGhhcyBzdGFydGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlU3RhcnQ6IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUGFzdGUgb3BlcmF0aW9uIGhhcyBlbmRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZUVuZDogRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uLCBvciBncm91cCBvZiBjb2x1bW5zLCB3YXMgaGlkZGVuIC8gc2hvd24uICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmlzaWJsZTogRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WaXNpYmxlRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiwgb3IgZ3JvdXAgb2YgY29sdW1ucywgd2FzIHBpbm5lZCAvIHVucGlubmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpbm5lZDogRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4gd2FzIHJlc2l6ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUmVzaXplZDogRXZlbnRFbWl0dGVyPENvbHVtblJlc2l6ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5SZXNpemVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgbW92ZWQuIFRvIGZpbmQgb3V0IHdoZW4gdGhlIGNvbHVtbiBtb3ZlIGlzIGZpbmlzaGVkIHlvdSBjYW4gdXNlIHRoZSBgZHJhZ1N0b3BwZWRgIGV2ZW50IGJlbG93LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Nb3ZlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSB2YWx1ZSBjb2x1bW4gd2FzIGFkZGVkIG9yIHJlbW92ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgcGl2b3QgbW9kZSBmbGFnIHdhcyBjaGFuZ2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90TW9kZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBwaXZvdCBjb2x1bW4gd2FzIGFkZGVkLCByZW1vdmVkIG9yIG9yZGVyIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiBncm91cCB3YXMgb3BlbmVkIC8gY2xvc2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkdyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVXNlciBzZXQgbmV3IGNvbHVtbnMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbmV3Q29sdW1uc0xvYWRlZDogRXZlbnRFbWl0dGVyPE5ld0NvbHVtbnNMb2FkZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBncmlkIGNvbHVtbnMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGRpc3BsYXllZCBjb2x1bW5zIGNoYW5nZWQuIFRoaXMgY2FuIHJlc3VsdCBmcm9tIGNvbHVtbnMgb3BlbiAvIGNsb3NlLCBjb2x1bW4gbW92ZSwgcGl2b3QsIGdyb3VwLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiByZW5kZXJlZCBjb2x1bW5zIGNoYW5nZWQgKG9ubHkgY29sdW1ucyBpbiB0aGUgdmlzaWJsZSBzY3JvbGxlZCB2aWV3cG9ydCBhcmUgcmVuZGVyZWQgYnkgZGVmYXVsdCkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBTaG90Z3VuIC0gZ2V0cyBjYWxsZWQgd2hlbiBlaXRoZXIgYSkgbmV3IGNvbHVtbnMgYXJlIHNldCBvciBiKSBgY29sdW1uQXBpLnNldFN0YXRlKClgIGlzIHVzZWQsIHNvIGV2ZXJ5dGhpbmcgaGFzIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBPbmx5IHVzZWQgYnkgQW5ndWxhciwgUmVhY3QgYW5kIFZ1ZUpTIEFHIEdyaWQgY29tcG9uZW50cyAobm90IHVzZWQgaWYgZG9pbmcgcGxhaW4gSmF2YVNjcmlwdCkuXG4gICAgICogSWYgdGhlIGdyaWQgcmVjZWl2ZXMgY2hhbmdlcyBkdWUgdG8gYm91bmQgcHJvcGVydGllcywgdGhpcyBldmVudCBmaXJlcyBhZnRlciB0aGUgZ3JpZCBoYXMgZmluaXNoZWQgcHJvY2Vzc2luZyB0aGUgY2hhbmdlLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbXBvbmVudFN0YXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVmFsdWUgaGFzIGNoYW5nZWQgYWZ0ZXIgZWRpdGluZyAodGhpcyBldmVudCB3aWxsIG5vdCBmaXJlIGlmIGVkaXRpbmcgd2FzIGNhbmNlbGxlZCwgZWcgRVNDIHdhcyBwcmVzc2VkKSBvciBcbiAgICAgKiAgaWYgY2VsbCB2YWx1ZSBoYXMgY2hhbmdlZCBhcyBhIHJlc3VsdCBvZiBwYXN0ZSBvcGVyYXRpb24uICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBWYWx1ZSBoYXMgY2hhbmdlZCBhZnRlciBlZGl0aW5nLiBPbmx5IGZpcmVzIHdoZW4gZG9pbmcgUmVhZCBPbmx5IEVkaXRzLCBpZSBgcmVhZE9ubHlFZGl0PXRydWVgLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0UmVxdWVzdDogRXZlbnRFbWl0dGVyPENlbGxFZGl0UmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0UmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjZWxsJ3MgdmFsdWUgd2l0aGluIGEgcm93IGhhcyBjaGFuZ2VkLiBUaGlzIGV2ZW50IGNvcnJlc3BvbmRzIHRvIEZ1bGwgUm93IEVkaXRpbmcgb25seS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSBjZWxsIGhhcyBzdGFydGVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIGNlbGwgaGFzIHN0b3BwZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdGFydGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RhcnRlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBGdWxsIFJvdyBFZGl0aW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIHJvdyBoYXMgc3RvcHBlZCAod2hlbiByb3cgZWRpdGluZyBpcyBlbmFibGVkKS4gV2hlbiByb3cgZWRpdGluZywgdGhpcyBldmVudCB3aWxsIGJlIGZpcmVkIG9uY2UgYW5kIGBjZWxsRWRpdGluZ1N0b3BwZWRgIHdpbGwgYmUgZmlyZWQgZm9yIGVhY2ggaW5kaXZpZHVhbCBjZWxsLiBPbmx5IGZpcmVzIHdoZW4gZG9pbmcgRnVsbCBSb3cgRWRpdGluZy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpbHRlciBoYXMgYmVlbiBvcGVuZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyT3BlbmVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIGFwcGxpZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgd2FzIG1vZGlmaWVkIGJ1dCBub3QgYXBwbGllZC4gVXNlZCB3aGVuIGZpbHRlcnMgaGF2ZSAnQXBwbHknIGJ1dHRvbnMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyTW9kaWZpZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGNyZWF0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRDcmVhdGVkOiBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0Q3JlYXRlZDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBkYXRhIHJhbmdlIGZvciB0aGUgY2hhcnQgaGFzIGJlZW4gY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPFREYXRhPj4oKTtcbiAgICAvKiogRm9ybWF0dGluZyBjaGFuZ2VzIGhhdmUgYmVlbiBtYWRlIGJ5IHVzZXJzIHRocm91Z2ggdGhlIEZvcm1hdCBQYW5lbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydE9wdGlvbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRPcHRpb25zQ2hhbmdlZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPFREYXRhPj4oKTtcbiAgICAvKiogQSBjaGFydCBoYXMgYmVlbiBkZXN0cm95ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnREZXN0cm95ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZDxURGF0YT4+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5RG93bmAgaGFwcGVuZWQgb24gYSBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxLZXlEb3duRXZlbnQ8VERhdGE+IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5UHJlc3NgIGhhcHBlbmVkIG9uIGEgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5UHJlc3M6IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBncmlkIGhhcyBpbml0aWFsaXNlZCBhbmQgaXMgcmVhZHkgZm9yIG1vc3QgYXBpIGNhbGxzLCBidXQgbWF5IG5vdCBiZSBmdWxseSByZW5kZXJlZCB5ZXQgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUmVhZHk6IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpcmVkIHRoZSBmaXJzdCB0aW1lIGRhdGEgaXMgcmVuZGVyZWQgaW50byB0aGUgZ3JpZC4gVXNlIHRoaXMgZXZlbnQgaWYgeW91IHdhbnQgdG8gYXV0byByZXNpemUgY29sdW1ucyBiYXNlZCBvbiB0aGVpciBjb250ZW50cyAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpcnN0RGF0YVJlbmRlcmVkOiBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaXJzdERhdGFSZW5kZXJlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIHNpemUgb2YgdGhlIGdyaWQgYGRpdmAgaGFzIGNoYW5nZWQuIEluIG90aGVyIHdvcmRzLCB0aGUgZ3JpZCB3YXMgcmVzaXplZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIERpc3BsYXllZCByb3dzIGhhdmUgY2hhbmdlZC4gVHJpZ2dlcmVkIGFmdGVyIHNvcnQsIGZpbHRlciBvciB0cmVlIGV4cGFuZCAvIGNvbGxhcHNlIGV2ZW50cy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IHdhcyByZW1vdmVkIGZyb20gdGhlIERPTSwgZm9yIGFueSByZWFzb24uIFVzZSB0byBjbGVhbiB1cCByZXNvdXJjZXMgKGlmIGFueSkgdXNlZCBieSB0aGUgcm93LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxSb3dSZW1vdmVkOiBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogV2hpY2ggcm93cyBhcmUgcmVuZGVyZWQgaW4gdGhlIERPTSBoYXMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aWV3cG9ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBib2R5IHdhcyBzY3JvbGxlZCBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1haW4gYm9keSBvZiB0aGUgZ3JpZCBoYXMgc3RvcHBlZCBzY3JvbGxpbmcsIGVpdGhlciBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsRW5kOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RhcnRzLiBUaGlzIGNvdWxkIGJlIGFueSBhY3Rpb24gdGhhdCB1c2VzIHRoZSBncmlkJ3MgRHJhZyBhbmQgRHJvcCBzZXJ2aWNlLCBlLmcuIENvbHVtbiBNb3ZpbmcsIENvbHVtbiBSZXNpemluZywgUmFuZ2UgU2VsZWN0aW9uLCBGaWxsIEhhbmRsZSwgZXRjLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdGFydGVkOiBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogV2hlbiBkcmFnZ2luZyBzdG9wcy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RvcHBlZDogRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0b3BwZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRyaWdnZXJlZCBldmVyeSB0aW1lIHRoZSBwYWdpbmcgc3RhdGUgY2hhbmdlcy4gU29tZSBvZiB0aGUgbW9zdCBjb21tb24gc2NlbmFyaW9zIGZvciB0aGlzIGV2ZW50IHRvIGJlIHRyaWdnZXJlZCBhcmU6XG4gICAgICogXG4gICAgICogIC0gVGhlIHBhZ2Ugc2l6ZSBjaGFuZ2VzLlxuICAgICAqICAtIFRoZSBjdXJyZW50IHNob3duIHBhZ2UgaXMgY2hhbmdlZC5cbiAgICAgKiAgLSBOZXcgZGF0YSBpcyBsb2FkZWQgb250byB0aGUgZ3JpZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFnaW5hdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgZHJhZyBoYXMgc3RhcnRlZCwgb3IgZHJhZ2dpbmcgd2FzIGFscmVhZHkgc3RhcnRlZCBhbmQgdGhlIG1vdXNlIGhhcyByZS1lbnRlcmVkIHRoZSBncmlkIGhhdmluZyBwcmV2aW91c2x5IGxlZnQgdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VudGVyOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbW92ZWQgd2hpbGUgZHJhZ2dpbmcuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ01vdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIG1vdXNlIGhhcyBsZWZ0IHRoZSBncmlkIHdoaWxlIGRyYWdnaW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdMZWF2ZTogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgZHJhZyBoYXMgZmluaXNoZWQgb3ZlciB0aGUgZ3JpZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW5kOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IGdyb3VwIGNvbHVtbiB3YXMgYWRkZWQgb3IgcmVtb3ZlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IGdyb3VwIHdhcyBvcGVuZWQgb3IgY2xvc2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0dyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Um93R3JvdXBPcGVuZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRmlyZWQgd2hlbiBjYWxsaW5nIGVpdGhlciBvZiB0aGUgQVBJIG1ldGhvZHMgYGV4cGFuZEFsbCgpYCBvciBgY29sbGFwc2VBbGwoKWAuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZXhwYW5kT3JDb2xsYXBzZUFsbDogRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RXhwYW5kQ29sbGFwc2VBbGxFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBjbGllbnQgaGFzIHNldCBuZXcgcGlubmVkIHJvdyBkYXRhIGludG8gdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGlubmVkUm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBObyBsb25nZXIgZmlyZWQsIHVzZSBvblJvd0RhdGFVcGRhdGVkIGluc3RlYWQgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJvd0RhdGFDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBjbGllbnQgaGFzIHVwZGF0ZWQgZGF0YSBmb3IgdGhlIGdyaWQgYnkgZWl0aGVyIGEpIHNldHRpbmcgbmV3IFJvdyBEYXRhIG9yIGIpIEFwcGx5aW5nIGEgUm93IFRyYW5zYWN0aW9uLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFVcGRhdGVkOiBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEYXRhVXBkYXRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQXN5bmMgdHJhbnNhY3Rpb25zIGhhdmUgYmVlbiBhcHBsaWVkLiBDb250YWlucyBhIGxpc3Qgb2YgYWxsIHRyYW5zYWN0aW9uIHJlc3VsdHMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkOiBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgZG91YmxlIGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbERvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDZWxsIGlzIGZvY3VzZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEZvY3VzZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRm9jdXNlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNb3VzZSBlbnRlcmVkIGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3ZlcjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNb3VzZSBsZWZ0IGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3V0OiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3V0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3V0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNb3VzZSBkb3duIG9uIGNlbGwuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlRG93bjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VEb3duRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSb3cgaXMgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93Q2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBpcyBzZWxlY3RlZCBvciBkZXNlbGVjdGVkLiBUaGUgZXZlbnQgY29udGFpbnMgdGhlIG5vZGUgaW4gcXVlc3Rpb24sIHNvIGNhbGwgdGhlIG5vZGUncyBgaXNTZWxlY3RlZCgpYCBtZXRob2QgdG8gc2VlIGlmIGl0IHdhcyBqdXN0IHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93U2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSb3cgc2VsZWN0aW9uIGlzIGNoYW5nZWQuIFVzZSB0aGUgZ3JpZCBBUEkgYGdldFNlbGVjdGVkTm9kZXMoKWAgb3IgYGdldFNlbGVjdGVkUm93cygpYCB0byBnZXQgdGhlIG5ldyBsaXN0IG9mIHNlbGVjdGVkIG5vZGVzIC8gcm93IGRhdGEuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDZWxsIGlzIHJpZ2h0IGNsaWNrZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENvbnRleHRNZW51OiBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYW5nZSB0byByYW5nZSBzZWxlY3Rpb24gaGFzIG9jY3VycmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogU29ydCBoYXMgY2hhbmdlZC4gVGhlIGdyaWQgYWxzbyBsaXN0ZW5zIGZvciB0aGlzIGFuZCB1cGRhdGVzIHRoZSBtb2RlbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8U29ydENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG5cblxuICAgIC8vIEVuYWJsZSB0eXBlIGNvZXJjaW9uIGZvciBib29sZWFuIElucHV0cyB0byBzdXBwb3J0IHVzZSBsaWtlICdlbmFibGVDaGFydHMnIGluc3RlYWQgb2YgZm9yY2luZyAnW2VuYWJsZUNoYXJ0c109XCJ0cnVlXCInIFxuICAgIC8vIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS90ZW1wbGF0ZS10eXBlY2hlY2sjaW5wdXQtc2V0dGVyLWNvZXJjaW9uIFxuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01ha2VDb2x1bW5WaXNpYmxlQWZ0ZXJVbkdyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NlbGxTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbEZvY3VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNTaG93VmVydGljYWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlYnVnOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxFeHByZXNzaW9uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYW5ndWxhckNvbXBpbGVSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbmd1bGFyQ29tcGlsZUZpbHRlcnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBVc2VFbnRpcmVSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU3VwcHJlc3NCbGFua0hlYWRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNZW51SGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5Tb3J0SWNvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNdWx0aVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c011bHRpU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc05vUm93c092ZXJsYXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWx0YVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVtZW1iZXJHcm91cFN0YXRlV2hlbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93R3JvdXBIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlHcm91cEhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3RNb2RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FuaW1hdGVSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUnRsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnTXVsdGlSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUdyb3VwRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZXByZWNhdGVkRW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwTXVsdGlBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5HcmlkTG9zZXNGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3B1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlbHRhUm93RGF0YU1vZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Vuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90cmVlRGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0VudGVycHJpc2VSZXNldE9uTmV3Q29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2V0Q29sdW1uU3RhdGVFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uU3RhdGVFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNoYXJ0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVsdGFDb2x1bW5Nb2RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01haW50YWluVW5zb3J0ZWRPcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01heFJlbmRlcmVkUm93UmVzdHJpY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2V4Y2x1ZGVDaGlsZHJlbldoZW5UcmVlRGF0YUZpbHRlcmluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2tlZXBEZXRhaWxSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0ZUNoaWxkUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91bmRvUmVkb0NlbGxFZGl0aW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbGxvd0RyYWdGcm9tQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW1tdXRhYmxlRGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW1tdXRhYmxlQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3RTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhwYW5kYWJsZVBpdm90R3JvdXBzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hcHBseUNvbHVtbkRlZk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWJvdW5jZVZlcnRpY2FsU2Nyb2xsYmFyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZXRhaWxSb3dBdXRvSGVpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlRmlsdGVyaW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlU29ydGluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZVNvcnRBbGxMZXZlbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVGaWx0ZXJBbGxMZXZlbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0T25TZXJ2ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVGaWx0ZXJPblNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Nob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVhY3RVaTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSZWFjdFVpOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZWFkT25seUVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jlc2V0Um93RGF0YU9uVXBkYXRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZW1vdmVQaXZvdEhlYWRlclJvd1doZW5TaW5nbGVWYWx1ZUNvbHVtbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb3B5U2luZ2xlQ2VsbFJhbmdlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSb3dzU3RpY2t5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgLy8gQEVOREBcbn1cblxuIl19