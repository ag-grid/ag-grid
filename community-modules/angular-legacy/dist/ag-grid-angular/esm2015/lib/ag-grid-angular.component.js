import { Component, ComponentFactoryResolver, ElementRef, EventEmitter, Input, Output, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { AgPromise, ComponentUtil, Grid } from "@ag-grid-community/core";
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
             * Default: `20`
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
        /** Set to `true` to stop the grid updating data after `Edit`, `Clipboard` and `Fill Handle` operations. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid. <br />**Note:** `rowNode.setDataValue()` does not update the value of the cell when this is `True`, it fires `onCellEditRequest` instead. Default: `false`.         */
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
        /** Rows are filtered using this text as a Quick Filter.     */
        this.quickFilterText = undefined;
        /** Set to `true` to turn on the Quick Filter cache, used to improve performance when using the Quick Filter. Default: `false`     */
        this.cacheQuickFilter = undefined;
        /**
             * Set to `true` to exclude hidden columns from being checked by the Quick Filter.
             * This can give a significant performance improvement when there are a large number of hidden columns,
             * and you are only interested in filtering on what's visible. Default: `false`
             */
        this.excludeHiddenColumnsFromQuickFilter = undefined;
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
             *  if cell value has changed as a result of cut, paste, cell clear (pressing Delete key),
             * fill handle, copy range down, undo and redo.
            */
        this.cellValueChanged = new EventEmitter();
        /** Value has changed after editing. Only fires when `readOnlyEdit=true`.     */
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
        /** Undo operation has started.     */
        this.undoStarted = new EventEmitter();
        /** Undo operation has ended.     */
        this.undoEnded = new EventEmitter();
        /** Redo operation has started.     */
        this.redoStarted = new EventEmitter();
        /** Redo operation has ended.     */
        this.redoEnded = new EventEmitter();
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
    excludeHiddenColumnsFromQuickFilter: [{ type: Input }],
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
    undoStarted: [{ type: Output }],
    undoEnded: [{ type: Output }],
    redoStarted: [{ type: Output }],
    redoEnded: [{ type: Output }],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvc2VhbmxhbmRzbWFuL2Rldi9hZy1ncmlkLzI5LjEuMC9jb21tdW5pdHktbW9kdWxlcy9hbmd1bGFyLWxlZ2FjeS9wcm9qZWN0cy9hZy1ncmlkLWFuZ3VsYXIvc3JjLyIsInNvdXJjZXMiOlsibGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVILFNBQVMsRUFDVCx3QkFBd0IsRUFDeEIsVUFBVSxFQUNWLFlBQVksRUFDWixLQUFLLEVBR0wsTUFBTSxFQUNOLGdCQUFnQixFQUNoQixpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFtQyxNQUFNLHlCQUF5QixDQUFDO0FBb0oxRyxnQkFBZ0I7QUFFaEIsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDeEUsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFZdEYsTUFBTSxPQUFPLGFBQWE7SUFnQnRCLFlBQVksVUFBc0IsRUFDdEIsZ0JBQWtDLEVBQ2xDLHlCQUFvRCxFQUNwRCx5QkFBMkQsRUFDM0Qsd0JBQWtEO1FBSGxELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBQzNELDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFoQnRELGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFJM0IsMERBQTBEO1FBQ2xELGdCQUFXLEdBQXVCLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUF3R2xFLFVBQVU7UUFDVix3RUFBd0U7UUFDeEQsY0FBUyxH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QU07OEJBRU4sTUFBTTtvQ0FFTixNQUFNOzBCQUVOLE1BQU07MENBQ04sTUFBTTt1Q0FDTixNQUFNO3VDQUNOLE1BQU07eUNBQ04sTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgQWZ0ZXJWaWV3SW5pdCxcbiAgICBDb21wb25lbnQsXG4gICAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIElucHV0LFxuICAgIE9uQ2hhbmdlcyxcbiAgICBPbkRlc3Ryb3ksXG4gICAgT3V0cHV0LFxuICAgIFZpZXdDb250YWluZXJSZWYsXG4gICAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcblxuaW1wb3J0IHsgQWdQcm9taXNlLCBDb21wb25lbnRVdGlsLCBHcmlkLCBHcmlkT3B0aW9ucywgR3JpZFBhcmFtcywgTW9kdWxlIH0gZnJvbSBcIkBhZy1ncmlkLWNvbW11bml0eS9jb3JlXCI7XG5cbi8vIEBTVEFSVF9JTVBPUlRTQFxuaW1wb3J0IHtcbiAgICBBZ0NoYXJ0VGhlbWUsXG4gICAgQWdDaGFydFRoZW1lT3ZlcnJpZGVzLFxuICAgIEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZCxcbiAgICBCb2R5U2Nyb2xsRW5kRXZlbnQsXG4gICAgQm9keVNjcm9sbEV2ZW50LFxuICAgIENlbGxDbGlja2VkRXZlbnQsXG4gICAgQ2VsbENvbnRleHRNZW51RXZlbnQsXG4gICAgQ2VsbERvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBDZWxsRWRpdFJlcXVlc3RFdmVudCxcbiAgICBDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudCxcbiAgICBDZWxsRWRpdGluZ1N0b3BwZWRFdmVudCxcbiAgICBDZWxsRm9jdXNlZEV2ZW50LFxuICAgIENlbGxLZXlEb3duRXZlbnQsXG4gICAgQ2VsbEtleVByZXNzRXZlbnQsXG4gICAgQ2VsbE1vdXNlRG93bkV2ZW50LFxuICAgIENlbGxNb3VzZU91dEV2ZW50LFxuICAgIENlbGxNb3VzZU92ZXJFdmVudCxcbiAgICBDZWxsUG9zaXRpb24sXG4gICAgQ2VsbFZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENoYXJ0Q3JlYXRlZCxcbiAgICBDaGFydERlc3Ryb3llZCxcbiAgICBDaGFydE9wdGlvbnNDaGFuZ2VkLFxuICAgIENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkLFxuICAgIENoYXJ0UmVmUGFyYW1zLFxuICAgIENoYXJ0VG9vbFBhbmVsc0RlZixcbiAgICBDb2xEZWYsXG4gICAgQ29sR3JvdXBEZWYsXG4gICAgQ29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5BcGksXG4gICAgQ29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5Hcm91cE9wZW5lZEV2ZW50LFxuICAgIENvbHVtbk1vdmVkRXZlbnQsXG4gICAgQ29sdW1uUGlubmVkRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblJlc2l6ZWRFdmVudCxcbiAgICBDb2x1bW5Sb3dHcm91cENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5WaXNpYmxlRXZlbnQsXG4gICAgQ29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQsXG4gICAgQ3N2RXhwb3J0UGFyYW1zLFxuICAgIERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgRG9tTGF5b3V0VHlwZSxcbiAgICBEcmFnU3RhcnRlZEV2ZW50LFxuICAgIERyYWdTdG9wcGVkRXZlbnQsXG4gICAgRXhjZWxFeHBvcnRQYXJhbXMsXG4gICAgRXhjZWxTdHlsZSxcbiAgICBFeHBhbmRDb2xsYXBzZUFsbEV2ZW50LFxuICAgIEZpbGxPcGVyYXRpb25QYXJhbXMsXG4gICAgRmlsdGVyQ2hhbmdlZEV2ZW50LFxuICAgIEZpbHRlck1vZGlmaWVkRXZlbnQsXG4gICAgRmlsdGVyT3BlbmVkRXZlbnQsXG4gICAgRmlyc3REYXRhUmVuZGVyZWRFdmVudCxcbiAgICBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50LFxuICAgIEZ1bGxXaWR0aENlbGxLZXlQcmVzc0V2ZW50LFxuICAgIEdldENoYXJ0VG9vbGJhckl0ZW1zLFxuICAgIEdldENvbnRleHRNZW51SXRlbXMsXG4gICAgR2V0RGF0YVBhdGgsXG4gICAgR2V0R3JvdXBSb3dBZ2dQYXJhbXMsXG4gICAgR2V0TG9jYWxlVGV4dFBhcmFtcyxcbiAgICBHZXRNYWluTWVudUl0ZW1zLFxuICAgIEdldFJvd0lkRnVuYyxcbiAgICBHZXRSb3dOb2RlSWRGdW5jLFxuICAgIEdldFNlcnZlclNpZGVHcm91cEtleSxcbiAgICBHZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc1BhcmFtcyxcbiAgICBHcmlkQXBpLFxuICAgIEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIEdyaWRSZWFkeUV2ZW50LFxuICAgIEdyaWRTaXplQ2hhbmdlZEV2ZW50LFxuICAgIEhlYWRlclBvc2l0aW9uLFxuICAgIElBZ2dGdW5jLFxuICAgIElEYXRhc291cmNlLFxuICAgIElSb3dEcmFnSXRlbSxcbiAgICBJUm93Tm9kZSxcbiAgICBJU2VydmVyU2lkZURhdGFzb3VyY2UsXG4gICAgSVZpZXdwb3J0RGF0YXNvdXJjZSxcbiAgICBJbml0aWFsR3JvdXBPcmRlckNvbXBhcmF0b3JQYXJhbXMsXG4gICAgSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbixcbiAgICBJc0V4dGVybmFsRmlsdGVyUHJlc2VudFBhcmFtcyxcbiAgICBJc0Z1bGxXaWR0aFJvd1BhcmFtcyxcbiAgICBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcyxcbiAgICBJc1Jvd0ZpbHRlcmFibGUsXG4gICAgSXNSb3dNYXN0ZXIsXG4gICAgSXNSb3dTZWxlY3RhYmxlLFxuICAgIElzU2VydmVyU2lkZUdyb3VwLFxuICAgIElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcyxcbiAgICBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jLFxuICAgIE1vZGVsVXBkYXRlZEV2ZW50LFxuICAgIE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtcyxcbiAgICBOZXdDb2x1bW5zTG9hZGVkRXZlbnQsXG4gICAgUGFnaW5hdGlvbkNoYW5nZWRFdmVudCxcbiAgICBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zLFxuICAgIFBhc3RlRW5kRXZlbnQsXG4gICAgUGFzdGVTdGFydEV2ZW50LFxuICAgIFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQsXG4gICAgUG9zdFByb2Nlc3NQb3B1cFBhcmFtcyxcbiAgICBQb3N0U29ydFJvd3NQYXJhbXMsXG4gICAgUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFByb2Nlc3NHcm91cEhlYWRlckZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzSGVhZGVyRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NSb3dQYXJhbXMsXG4gICAgUmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgUmVkb0VuZGVkRXZlbnQsXG4gICAgUmVkb1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dDbGFzc1J1bGVzLFxuICAgIFJvd0NsaWNrZWRFdmVudCxcbiAgICBSb3dEYXRhQ2hhbmdlZEV2ZW50LFxuICAgIFJvd0RhdGFVcGRhdGVkRXZlbnQsXG4gICAgUm93RG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIFJvd0RyYWdFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgUm93R3JvdXBPcGVuZWRFdmVudCxcbiAgICBSb3dHcm91cGluZ0Rpc3BsYXlUeXBlLFxuICAgIFJvd0hlaWdodFBhcmFtcyxcbiAgICBSb3dNb2RlbFR5cGUsXG4gICAgUm93U2VsZWN0ZWRFdmVudCxcbiAgICBSb3dTdHlsZSxcbiAgICBSb3dWYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgU2VuZFRvQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zLFxuICAgIFNlcnZlclNpZGVTdG9yZVR5cGUsXG4gICAgU2lkZUJhckRlZixcbiAgICBTb3J0Q2hhbmdlZEV2ZW50LFxuICAgIFNvcnREaXJlY3Rpb24sXG4gICAgU3RhdHVzUGFuZWxEZWYsXG4gICAgVGFiVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBUYWJUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgVG9vbFBhbmVsU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50LFxuICAgIFRyZWVEYXRhRGlzcGxheVR5cGUsXG4gICAgVW5kb0VuZGVkRXZlbnQsXG4gICAgVW5kb1N0YXJ0ZWRFdmVudCxcbiAgICBWaWV3cG9ydENoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50XG59IGZyb20gXCJAYWctZ3JpZC1jb21tdW5pdHkvY29yZVwiO1xuLy8gQEVORF9JTVBPUlRTQFxuXG5pbXBvcnQgeyBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzIH0gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya092ZXJyaWRlc1wiO1xuaW1wb3J0IHsgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIgfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtYW5ndWxhcicsXG4gICAgdGVtcGxhdGU6ICcnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgIF0sXG4gICAgLy8gdGVsbCBhbmd1bGFyIHdlIGRvbid0IHdhbnQgdmlldyBlbmNhcHN1bGF0aW9uLCB3ZSBkb24ndCB3YW50IGEgc2hhZG93IHJvb3RcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIEFnR3JpZEFuZ3VsYXI8VERhdGEgPSBhbnksIFRDb2xEZWYgZXh0ZW5kcyBDb2xEZWY8VERhdGE+ID0gQ29sRGVmPGFueT4+IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICAgIC8vIG5vdCBpbnRlbmRlZCBmb3IgdXNlciB0byBpbnRlcmFjdCB3aXRoLiBzbyBwdXR0aW5nIF8gaW4gc28gaWYgdXNlciBnZXRzIHJlZmVyZW5jZVxuICAgIC8vIHRvIHRoaXMgb2JqZWN0LCB0aGV5IGtpbmQnYSBrbm93IGl0J3Mgbm90IHBhcnQgb2YgdGhlIGFncmVlZCBpbnRlcmZhY2VcbiAgICBwcml2YXRlIF9uYXRpdmVFbGVtZW50OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGlzZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgZ3JpZFBhcmFtczogR3JpZFBhcmFtcztcblxuICAgIC8vIGluIG9yZGVyIHRvIGVuc3VyZSBmaXJpbmcgb2YgZ3JpZFJlYWR5IGlzIGRldGVybWluaXN0aWNcbiAgICBwcml2YXRlIF9mdWxseVJlYWR5OiBBZ1Byb21pc2U8Ym9vbGVhbj4gPSBBZ1Byb21pc2UucmVzb2x2ZSh0cnVlKTtcblxuICAgIC8vIG1ha2luZyB0aGVzZSBwdWJsaWMsIHNvIHRoZXkgYXJlIGFjY2Vzc2libGUgdG8gcGVvcGxlIHVzaW5nIHRoZSBuZzIgY29tcG9uZW50IHJlZmVyZW5jZXNcbiAgICBwdWJsaWMgYXBpOiBHcmlkQXBpPFREYXRhPjtcbiAgICBwdWJsaWMgY29sdW1uQXBpOiBDb2x1bW5BcGk7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgYW5ndWxhckZyYW1ld29ya092ZXJyaWRlczogQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcixcbiAgICAgICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcikge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuXG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Vmlld0NvbnRhaW5lclJlZih0aGlzLnZpZXdDb250YWluZXJSZWYpO1xuICAgICAgICB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIuc2V0Q29tcG9uZW50RmFjdG9yeVJlc29sdmVyKHRoaXMuY29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnNldEVtaXR0ZXJVc2VkQ2FsbGJhY2sodGhpcy5pc0VtaXR0ZXJVc2VkLmJpbmQodGhpcykpO1xuXG4gICAgICAgICB0aGlzLmdyaWRPcHRpb25zID0gQ29tcG9uZW50VXRpbC5jb3B5QXR0cmlidXRlc1RvR3JpZE9wdGlvbnModGhpcy5ncmlkT3B0aW9ucywgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5ncmlkUGFyYW1zID0ge1xuICAgICAgICAgICAgZ2xvYmFsRXZlbnRMaXN0ZW5lcjogdGhpcy5nbG9iYWxFdmVudExpc3RlbmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICBmcmFtZXdvcmtPdmVycmlkZXM6IHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgICAgIHByb3ZpZGVkQmVhbkluc3RhbmNlczoge1xuICAgICAgICAgICAgICAgIGZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXI6IHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZHVsZXM6ICh0aGlzLm1vZHVsZXMgfHwgW10pIGFzIGFueVxuICAgICAgICB9O1xuXG4gICAgICAgIG5ldyBHcmlkKHRoaXMuX25hdGl2ZUVsZW1lbnQsIHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMuZ3JpZFBhcmFtcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuYXBpKSB7XG4gICAgICAgICAgICB0aGlzLmFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuYXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpKSB7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbkFwaSA9IHRoaXMuZ3JpZE9wdGlvbnMuY29sdW1uQXBpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIHNvbWV0aW1lcywgZXNwZWNpYWxseSBpbiBsYXJnZSBjbGllbnQgYXBwcyBncmlkUmVhZHkgY2FuIGZpcmUgYmVmb3JlIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGlzIHRpZXMgdGhlc2UgdG9nZXRoZXIgc28gdGhhdCBncmlkUmVhZHkgd2lsbCBhbHdheXMgZmlyZSBhZnRlciBhZ0dyaWRBbmd1bGFyJ3MgbmdBZnRlclZpZXdJbml0XG4gICAgICAgIC8vIHRoZSBhY3R1YWwgY29udGFpbmluZyBjb21wb25lbnQncyBuZ0FmdGVyVmlld0luaXQgd2lsbCBmaXJlIGp1c3QgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzXG4gICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkucmVzb2x2ZU5vdyhudWxsLCByZXNvbHZlID0+IHJlc29sdmUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAgQ29tcG9uZW50VXRpbC5wcm9jZXNzT25DaGFuZ2UoY2hhbmdlcywgdGhpcy5hcGkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgdGhlIGRlc3Ryb3ksIHNvIHdlIGtub3cgbm90IHRvIGVtaXQgYW55IGV2ZW50c1xuICAgICAgICAgICAgLy8gd2hpbGUgdGVhcmluZyBkb3duIHRoZSBncmlkLlxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFwaSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBpLmRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdlJ2xsIGVtaXQgdGhlIGVtaXQgaWYgYSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgYSBnaXZlbiBldmVudCBlaXRoZXIgb24gdGhlIGNvbXBvbmVudCB2aWEgbm9ybWFsIGFuZ3VsYXIgYmluZGluZ1xuICAgIC8vIG9yIHZpYSBncmlkT3B0aW9uc1xuICAgIHByb3RlY3RlZCBpc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgY29uc3QgaGFzRW1pdHRlciA9ICEhZW1pdHRlciAmJiBlbWl0dGVyLm9ic2VydmVycyAmJiBlbWl0dGVyLm9ic2VydmVycy5sZW5ndGggPiAwO1xuXG4gICAgICAgIC8vIGdyaWRSZWFkeSA9PiBvbkdyaWRSZWFkeVxuICAgICAgICBjb25zdCBhc0V2ZW50TmFtZSA9IGBvbiR7ZXZlbnRUeXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7ZXZlbnRUeXBlLnN1YnN0cmluZygxKX1gXG4gICAgICAgIGNvbnN0IGhhc0dyaWRPcHRpb25MaXN0ZW5lciA9ICEhdGhpcy5ncmlkT3B0aW9ucyAmJiAhIXRoaXMuZ3JpZE9wdGlvbnNbYXNFdmVudE5hbWVdO1xuXG4gICAgICAgIHJldHVybiBoYXNFbWl0dGVyIHx8IGhhc0dyaWRPcHRpb25MaXN0ZW5lcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gaWYgd2UgYXJlIHRlYXJpbmcgZG93biwgZG9uJ3QgZW1pdCBhbmd1bGFyIGV2ZW50cywgYXMgdGhpcyBjYXVzZXNcbiAgICAgICAgLy8gcHJvYmxlbXMgd2l0aCB0aGUgYW5ndWxhciByb3V0ZXJcbiAgICAgICAgaWYgKHRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2VuZXJpY2FsbHkgbG9vayB1cCB0aGUgZXZlbnRUeXBlXG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgaWYgKGVtaXR0ZXIgJiYgdGhpcy5pc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIGlmIChldmVudFR5cGUgPT09ICdncmlkUmVhZHknKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgaXMgbGlzdGVuaW5nIGZvciBncmlkUmVhZHksIHdhaXQgZm9yIG5nQWZ0ZXJWaWV3SW5pdCB0byBmaXJlIGZpcnN0LCB0aGVuIGVtaXQgdGhlXG4gICAgICAgICAgICAgICAgLy8gZ3JpZFJlYWR5IGV2ZW50XG4gICAgICAgICAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS50aGVuKChyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW1pdHRlci5lbWl0KGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZE9wdGlvbnM6IEdyaWRPcHRpb25zPFREYXRhPiB8IHVuZGVmaW5lZDtcbiAgICAgQElucHV0KCkgcHVibGljIG1vZHVsZXM6IE1vZHVsZVtdIHwgdW5kZWZpbmVkO1xuXG4gICAgLy8gQFNUQVJUQFxuICAgIC8qKiBTcGVjaWZpZXMgdGhlIHN0YXR1cyBiYXIgY29tcG9uZW50cyB0byB1c2UgaW4gdGhlIHN0YXR1cyBiYXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdGF0dXNCYXI6IHsgc3RhdHVzUGFuZWxzOiBTdGF0dXNQYW5lbERlZltdOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZpZXMgdGhlIHNpZGUgYmFyIGNvbXBvbmVudHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaWRlQmFyOiBTaWRlQmFyRGVmIHwgc3RyaW5nIHwgc3RyaW5nW10gfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBub3Qgc2hvdyB0aGUgY29udGV4dCBtZW51LiBVc2UgaWYgeW91IGRvbid0IHdhbnQgdG8gdXNlIHRoZSBkZWZhdWx0ICdyaWdodCBjbGljaycgY29udGV4dCBtZW51LiBEZWZhdWx0OiBgZmFsc2VgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyBgc3VwcHJlc3NDb250ZXh0TWVudWAsIHlvdSBjYW4gdXNlIHRoZSBgb25DZWxsQ29udGV4dE1lbnVgIGZ1bmN0aW9uIHRvIHByb3ZpZGUgeW91ciBvd24gY29kZSB0byBoYW5kbGUgY2VsbCBgY29udGV4dG1lbnVgIGV2ZW50cy5cbiAgICAgICAgICogVGhpcyBmbGFnIGlzIHVzZWZ1bCB0byBwcmV2ZW50IHRoZSBicm93c2VyIGZyb20gc2hvd2luZyBpdHMgZGVmYXVsdCBjb250ZXh0IG1lbnUuXG4gICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNvbnRleHQgbWVudSB0byBzaG93LCBldmVuIHdoZW4gYEN0cmxgIGtleSBpcyBoZWxkIGRvd24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIHNob3cgdGhlIGNvbHVtbiBtZW51IGJ1dHRvbiwgcmF0aGVyIHRoYW4gb25seSBzaG93aW5nIHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGNvbHVtbiBoZWFkZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWVudUhpZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdXNlIHRoZSBicm93c2VyJ3MgZGVmYXVsdCB0b29sdGlwIGluc3RlYWQgb2YgdXNpbmcgdGhlIGdyaWQncyBUb29sdGlwIENvbXBvbmVudC4gRGVmYXVsdDogYGZhbHNlYCAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyB0aGF0IGl0IHRha2VzIGZvciB0b29sdGlwcyB0byBzaG93IHVwIG9uY2UgYW4gZWxlbWVudCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgICAgICAqICAgICAqKk5vdGU6KiogVGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCB3b3JrIGlmIGBlbmFibGVCcm93c2VyVG9vbHRpcHNgIGlzIGB0cnVlYC5cbiAgICAgICAgICogRGVmYXVsdDogYDIwMDBgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwU2hvd0RlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgdGhhdCBpdCB0YWtlcyBmb3IgdG9vbHRpcHMgdG8gaGlkZSBvbmNlIHRoZXkgaGF2ZSBiZWVuIGRpc3BsYXllZC5cbiAgICAgICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgLlxuICAgICAgICAgKiBEZWZhdWx0OiBgMTAwMDBgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwSGlkZURlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0b29sdGlwcyBmb2xsb3cgdGhlIGN1cnNvciBvbmNlIHRoZXkgYXJlIGRpc3BsYXllZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBNb3VzZVRyYWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBET00gZWxlbWVudCB0byB1c2UgYXMgdGhlIHBvcHVwIHBhcmVudCBmb3IgZ3JpZCBwb3B1cHMgKGNvbnRleHQgbWVudSwgY29sdW1uIG1lbnUgZXRjKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvcHVwUGFyZW50OiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxzbyBpbmNsdWRlIGhlYWRlcnMgd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZCB1c2luZyBgQ3RybCArIENgIGNsaXBib2FyZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgZ3JvdXAgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5R3JvdXBIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZnkgdGhlIGRlbGltaXRlciB0byB1c2Ugd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZC5cbiAgICAgICAgICogRGVmYXVsdDogYFxcdGBcbiAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2xpcGJvYXJkRGVsaW1pdGVyOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29weSB0aGUgY2VsbCByYW5nZSBvciBmb2N1c2VkIGNlbGwgdG8gdGhlIGNsaXBib2FyZCBhbmQgbmV2ZXIgdGhlIHNlbGVjdGVkIHJvd3MuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29weVJvd3NUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb3B5IHJvd3MgaW5zdGVhZCBvZiByYW5nZXMgd2hlbiBhIHJhbmdlIHdpdGggb25seSBhIHNpbmdsZSBjZWxsIGlzIHNlbGVjdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlTaW5nbGVDZWxsUmFuZ2VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHdvcmsgYXJvdW5kIGEgYnVnIHdpdGggRXhjZWwgKFdpbmRvd3MpIHRoYXQgYWRkcyBhbiBleHRyYSBlbXB0eSBsaW5lIGF0IHRoZSBlbmQgb2YgcmFuZ2VzIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xhc3RFbXB0eUxpbmVPblBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb2ZmIHBhc3RlIG9wZXJhdGlvbnMgd2l0aGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdG9wIHRoZSBncmlkIHRyeWluZyB0byB1c2UgdGhlIENsaXBib2FyZCBBUEksIGlmIGl0IGlzIGJsb2NrZWQsIGFuZCBpbW1lZGlhdGVseSBmYWxsYmFjayB0byB0aGUgd29ya2Fyb3VuZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkQXBpOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBvZiBDb2x1bW4gLyBDb2x1bW4gR3JvdXAgZGVmaW5pdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5EZWZzOiAoVENvbERlZiB8IENvbEdyb3VwRGVmPFREYXRhPilbXSB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvbi4gSXRlbXMgZGVmaW5lZCBpbiB0aGUgYWN0dWFsIGNvbHVtbiBkZWZpbml0aW9ucyBnZXQgcHJlY2VkZW5jZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xEZWY6IENvbERlZjxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbi4gQWxsIGNvbHVtbiBncm91cCBkZWZpbml0aW9ucyB3aWxsIHVzZSB0aGVzZSBwcm9wZXJ0aWVzLiBJdGVtcyBkZWZpbmVkIGluIHRoZSBhY3R1YWwgY29sdW1uIGdyb3VwIGRlZmluaXRpb24gZ2V0IHByZWNlZGVuY2UuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sR3JvdXBEZWY6IFBhcnRpYWw8Q29sR3JvdXBEZWY8VERhdGE+PiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQW4gb2JqZWN0IG1hcCBvZiBjdXN0b20gY29sdW1uIHR5cGVzIHdoaWNoIGNvbnRhaW4gZ3JvdXBzIG9mIHByb3BlcnRpZXMgdGhhdCBjb2x1bW4gZGVmaW5pdGlvbnMgY2FuIGluaGVyaXQgYnkgcmVmZXJlbmNpbmcgaW4gdGhlaXIgYHR5cGVgIHByb3BlcnR5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uVHlwZXM6IHsgW2tleTogc3RyaW5nXTogQ29sRGVmPFREYXRhPjsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogS2VlcHMgdGhlIG9yZGVyIG9mIENvbHVtbnMgbWFpbnRhaW5lZCBhZnRlciBuZXcgQ29sdW1uIERlZmluaXRpb25zIGFyZSB1cGRhdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYWludGFpbkNvbHVtbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZW4gZG90cyBpbiBmaWVsZCBuYW1lcyAoZS5nLiBgJ2FkZHJlc3MuZmlyc3RMaW5lJ2ApIGFyZSBub3QgdHJlYXRlZCBhcyBkZWVwIHJlZmVyZW5jZXMuIEFsbG93cyB5b3UgdG8gdXNlIGRvdHMgaW4geW91ciBmaWVsZCBuYW1lIGlmIHlvdSBwcmVmZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgY29sdW1uIGxhYmVsIGhlYWRlci4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyB0aGUgdGhlbWUgdmFsdWUgb2YgYGhlYWRlci1oZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93cyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgZmxvYXRpbmcgZmlsdGVycy4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyB0aGUgdGhlbWUgdmFsdWUgb2YgYGhlYWRlci1oZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGNvbHVtbnMgd2hlbiBpbiBwaXZvdCBtb2RlLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyBoZWFkZXIgY29sdW1uIGdyb3VwcyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGdyb3VwSGVhZGVySGVpZ2h0YC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90R3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3cgcmVvcmRlcmluZyBhbmQgcGlubmluZyBjb2x1bW5zIGJ5IGRyYWdnaW5nIGNvbHVtbnMgZnJvbSB0aGUgQ29sdW1ucyBUb29sIFBhbmVsIHRvIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0RyYWdGcm9tQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBjb2x1bW4gbW92aW5nLCBpLmUuIHRvIG1ha2UgdGhlIGNvbHVtbnMgZml4ZWQgcG9zaXRpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGBhZy1jb2x1bW4tbW92aW5nYCBjbGFzcyBpcyBub3QgYWRkZWQgdG8gdGhlIGdyaWQgd2hpbGUgY29sdW1ucyBhcmUgbW92aW5nLiBJbiB0aGUgZGVmYXVsdCB0aGVtZXMsIHRoaXMgcmVzdWx0cyBpbiBubyBhbmltYXRpb24gd2hlbiBtb3ZpbmcgY29sdW1ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHdoZW4geW91IGRyYWcgYSBjb2x1bW4gb3V0IG9mIHRoZSBncmlkIChlLmcuIHRvIHRoZSBncm91cCB6b25lKSB0aGUgY29sdW1uIGlzIG5vdCBoaWRkZW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRHJhZ0xlYXZlSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHdoZW4geW91IGRyYWcgYSBjb2x1bW4gaW50byBhIHJvdyBncm91cCBwYW5lbCB0aGUgY29sdW1uIGlzIG5vdCBoaWRkZW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93R3JvdXBIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ3NoaWZ0J2AgdG8gaGF2ZSBzaGlmdC1yZXNpemUgYXMgdGhlIGRlZmF1bHQgcmVzaXplIG9wZXJhdGlvbiAoc2FtZSBhcyB1c2VyIGhvbGRpbmcgZG93biBgU2hpZnRgIHdoaWxlIHJlc2l6aW5nKS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbFJlc2l6ZURlZmF1bHQ6ICdzaGlmdCcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFN1cHByZXNzZXMgYXV0by1zaXppbmcgY29sdW1ucyBmb3IgY29sdW1ucy4gSW4gb3RoZXIgd29yZHMsIGRvdWJsZSBjbGlja2luZyBhIGNvbHVtbidzIGhlYWRlcidzIGVkZ2Ugd2lsbCBub3QgYXV0by1zaXplLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBOdW1iZXIgb2YgcGl4ZWxzIHRvIGFkZCB0byBhIGNvbHVtbiB3aWR0aCBhZnRlciB0aGUgW2F1dG8tc2l6aW5nXSgvY29sdW1uLXNpemluZy8jYXV0by1zaXplLWNvbHVtbnMpIGNhbGN1bGF0aW9uLlxuICAgICAgICAgKiBTZXQgdGhpcyBpZiB5b3Ugd2FudCB0byBhZGQgZXh0cmEgcm9vbSB0byBhY2NvbW1vZGF0ZSAoZm9yIGV4YW1wbGUpIHNvcnQgaWNvbnMsIG9yIHNvbWUgb3RoZXIgZHluYW1pYyBuYXR1cmUgb2YgdGhlIGhlYWRlci5cbiAgICAgICAgICogRGVmYXVsdDogYDIwYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVQYWRkaW5nOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBza2lwIHRoZSBgaGVhZGVyTmFtZWAgd2hlbiBgYXV0b1NpemVgIGlzIGNhbGxlZCBieSBkZWZhdWx0LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2YgY29tcG9uZW50IG5hbWVzIHRvIGNvbXBvbmVudHMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb21wb25lbnRzOiB7IFtwOiBzdHJpbmddOiBhbnk7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBjb21wb25lbnRzYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnJhbWV3b3JrQ29tcG9uZW50czogeyBbcDogc3RyaW5nXTogeyBuZXcoKTogYW55OyB9OyB9IHwgYW55IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdmdWxsUm93J2AgdG8gZW5hYmxlIEZ1bGwgUm93IEVkaXRpbmcuIE90aGVyd2lzZSBsZWF2ZSBibGFuayB0byBlZGl0IG9uZSBjZWxsIGF0IGEgdGltZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVkaXRUeXBlOiAnZnVsbFJvdycgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFNpbmdsZSBDbGljayBFZGl0aW5nIGZvciBjZWxscywgdG8gc3RhcnQgZWRpdGluZyB3aXRoIGEgc2luZ2xlIGNsaWNrLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCBuZWl0aGVyIHNpbmdsZSBub3IgZG91YmxlIGNsaWNrIHN0YXJ0cyBlZGl0aW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdG9wIHRoZSBncmlkIHVwZGF0aW5nIGRhdGEgYWZ0ZXIgYEVkaXRgLCBgQ2xpcGJvYXJkYCBhbmQgYEZpbGwgSGFuZGxlYCBvcGVyYXRpb25zLiBXaGVuIHRoaXMgaXMgc2V0LCBpdCBpcyBpbnRlbmRlZCB0aGUgYXBwbGljYXRpb24gd2lsbCB1cGRhdGUgdGhlIGRhdGEsIGVnIGluIGFuIGV4dGVybmFsIGltbXV0YWJsZSBzdG9yZSwgYW5kIHRoZW4gcGFzcyB0aGUgbmV3IGRhdGFzZXQgdG8gdGhlIGdyaWQuIDxiciAvPioqTm90ZToqKiBgcm93Tm9kZS5zZXREYXRhVmFsdWUoKWAgZG9lcyBub3QgdXBkYXRlIHRoZSB2YWx1ZSBvZiB0aGUgY2VsbCB3aGVuIHRoaXMgaXMgYFRydWVgLCBpdCBmaXJlcyBgb25DZWxsRWRpdFJlcXVlc3RgIGluc3RlYWQuIERlZmF1bHQ6IGBmYWxzZWAuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVhZE9ubHlFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc3RvcCBjZWxsIGVkaXRpbmcgd2hlbiBncmlkIGxvc2VzIGZvY3VzLlxuICAgICAgICAgKiBUaGUgZGVmYXVsdCBpcyB0aGF0IHRoZSBncmlkIHN0YXlzIGVkaXRpbmcgdW50aWwgZm9jdXMgZ29lcyBvbnRvIGFub3RoZXIgY2VsbC5cbiAgICAgICAgICogRGVmYXVsdDogYGZhbHNlYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgYWxvbmcgd2l0aCBgZW50ZXJNb3Zlc0Rvd25BZnRlckVkaXRgIHRvIGhhdmUgRXhjZWwtc3R5bGUgYmVoYXZpb3VyIGZvciB0aGUgYEVudGVyYCBrZXkuXG4gICAgICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIGBFbnRlcmAga2V5IHdpbGwgbW92ZSBkb3duIHRvIHRoZSBjZWxsIGJlbmVhdGguXG4gICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGFsb25nIHdpdGggYGVudGVyTW92ZXNEb3duYCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlICdFbnRlcicga2V5LlxuICAgICAgICAgKiBpLmUuIHByZXNzaW5nIHRoZSBFbnRlciBrZXkgd2lsbCBtb3ZlIGRvd24gdG8gdGhlIGNlbGwgYmVuZWF0aC5cbiAgICAgICAgICogRGVmYXVsdDogYGZhbHNlYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd25BZnRlckVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvcmNlcyBDZWxsIEVkaXRpbmcgdG8gc3RhcnQgd2hlbiBiYWNrc3BhY2UgaXMgcHJlc3NlZC4gVGhpcyBpcyBvbmx5IHJlbGV2YW50IGZvciBNYWNPUyB1c2Vycy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFZGl0aW5nT25CYWNrc3BhY2U6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFVuZG8gLyBSZWRvIHdoaWxlIGVkaXRpbmcuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1bmRvUmVkb0NlbGxFZGl0aW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhlIHNpemUgb2YgdGhlIHVuZG8gLyByZWRvIHN0YWNrLiBEZWZhdWx0OiBgMTBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1bmRvUmVkb0NlbGxFZGl0aW5nTGltaXQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gZXhwb3J0IHRvIENTVi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDc3ZFeHBvcnRQYXJhbXM6IENzdkV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJldmVudHMgdGhlIHVzZXIgZnJvbSBleHBvcnRpbmcgdGhlIGdyaWQgdG8gQ1NWLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NzdkV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gZXhwb3J0IHRvIEV4Y2VsLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4Y2VsRXhwb3J0UGFyYW1zOiBFeGNlbEV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJldmVudHMgdGhlIHVzZXIgZnJvbSBleHBvcnRpbmcgdGhlIGdyaWQgdG8gRXhjZWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbGlzdCAoYXJyYXkpIG9mIEV4Y2VsIHN0eWxlcyB0byBiZSB1c2VkIHdoZW4gZXhwb3J0aW5nIHRvIEV4Y2VsIHdpdGggc3R5bGVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjZWxTdHlsZXM6IEV4Y2VsU3R5bGVbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUm93cyBhcmUgZmlsdGVyZWQgdXNpbmcgdGhpcyB0ZXh0IGFzIGEgUXVpY2sgRmlsdGVyLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcXVpY2tGaWx0ZXJUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvbiB0aGUgUXVpY2sgRmlsdGVyIGNhY2hlLCB1c2VkIHRvIGltcHJvdmUgcGVyZm9ybWFuY2Ugd2hlbiB1c2luZyB0aGUgUXVpY2sgRmlsdGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZVF1aWNrRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBcbiAgICAgICAgICogU2V0IHRvIGB0cnVlYCB0byBleGNsdWRlIGhpZGRlbiBjb2x1bW5zIGZyb20gYmVpbmcgY2hlY2tlZCBieSB0aGUgUXVpY2sgRmlsdGVyLlxuICAgICAgICAgKiBUaGlzIGNhbiBnaXZlIGEgc2lnbmlmaWNhbnQgcGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQgd2hlbiB0aGVyZSBhcmUgYSBsYXJnZSBudW1iZXIgb2YgaGlkZGVuIGNvbHVtbnMsXG4gICAgICAgICAqIGFuZCB5b3UgYXJlIG9ubHkgaW50ZXJlc3RlZCBpbiBmaWx0ZXJpbmcgb24gd2hhdCdzIHZpc2libGUuIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGV4Y2x1ZGVIaWRkZW5Db2x1bW5zRnJvbVF1aWNrRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IHRyZWUgZGF0YSBmaWx0ZXJpbmcgYmVoYXZpb3VyIHRvIGluc3RlYWQgZXhjbHVkZSBjaGlsZCBub2RlcyBmcm9tIGZpbHRlciByZXN1bHRzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gRW5hYmxlIENoYXJ0cy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2hhcnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBjaGFydCB0aGVtZXMgdG8gYmUgdXNlZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgY29udGFpbmluZyBjdXN0b20gY2hhcnQgdGhlbWVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3VzdG9tQ2hhcnRUaGVtZXM6IHsgW25hbWU6IHN0cmluZ106IEFnQ2hhcnRUaGVtZSB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFydCB0aGVtZSBvdmVycmlkZXMgYXBwbGllZCB0byBhbGwgdGhlbWVzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZU92ZXJyaWRlczogQWdDaGFydFRoZW1lT3ZlcnJpZGVzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjksIG5vIGxvbmdlciB1c2VkLiBUbyBzdXBwcmVzcyB1c2UgYHN1cHByZXNzQ2hhcnRUb29sUGFuZWxzQnV0dG9uYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0VG9vbFBhbmVsc0J1dHRvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzaG93IHRoZSAnaGFtYnVyZ2VyJyBtZW51IG9wdGlvbiBmcm9tIHRoZSBDaGFydCBUb29sYmFyIGFuZCBkaXNwbGF5IHRoZSByZW1haW5pbmcgdG9vbGJhciBidXR0b25zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NoYXJ0VG9vbFBhbmVsc0J1dHRvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGN1c3RvbWlzYXRpb24gb2YgdGhlIENoYXJ0IFRvb2wgUGFuZWxzLCBzdWNoIGFzIGNoYW5naW5nIHRoZSB0b29sIHBhbmVscyB2aXNpYmlsaXR5IGFuZCBvcmRlciwgYXMgd2VsbCBhcyBjaG9vc2luZyB3aGljaCBjaGFydHMgc2hvdWxkIGJlIGRpc3BsYXllZCBpbiB0aGUgc2V0dGluZ3MgcGFuZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRvb2xQYW5lbHNEZWY6IENoYXJ0VG9vbFBhbmVsc0RlZiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gdXNlIHdoZW4gZGF0YSBpcyBsb2FkaW5nIHZpYSBhIERhdGFTb3VyY2UuXG4gICAgICAgICogU2VlIFtMb2FkaW5nIENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1sb2FkaW5nLWNlbGwtcmVuZGVyZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGxvYWRpbmdDZWxsUmVuZGVyZXJgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gYmUgdXNlZCB3aGVuIGRhdGEgaXMgbG9hZGluZyB2aWEgYSBEYXRhU291cmNlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yOiBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2Yga2V5LT52YWx1ZSBwYWlycyBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hc3RlciBEZXRhaWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1hc3RlckRldGFpbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBrZWVwIGRldGFpbCByb3dzIGZvciB3aGVuIHRoZXkgYXJlIGRpc3BsYXllZCBhZ2Fpbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIG51bWJlciBvZiBkZXRhaWxzIHJvd3MgdG8ga2VlcC4gRGVmYXVsdDogYDEwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3NDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGBkZXRhaWxDZWxsUmVuZGVyZXJgIHRvIHVzZSB3aGVuIGEgbWFzdGVyIHJvdyBpcyBleHBhbmRlZC5cbiAgICAgICAgKiBTZWUgW0RldGFpbCBDZWxsIFJlbmRlcmVyXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9tYXN0ZXItZGV0YWlsLWN1c3RvbS1kZXRhaWwvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgZGV0YWlsQ2VsbFJlbmRlcmVyYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyRnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgcGFyYW1zIHRvIGJlIHVzZWQgYnkgdGhlIERldGFpbCBDZWxsIFJlbmRlcmVyLiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgcHJvdmlkZXMgdGhlIHBhcmFtcyB0byBlbmFibGUgZHluYW1pYyBkZWZpbml0aW9ucyBvZiB0aGUgcGFyYW1zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCBmaXhlZCBoZWlnaHQgaW4gcGl4ZWxzIGZvciBlYWNoIGRldGFpbCByb3cuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSBkZXRhaWwgZ3JpZCBkeW5hbWljYWxseSBjaGFuZ2UgaXQncyBoZWlnaHQgdG8gZml0IGl0J3Mgcm93cy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGVzIGEgY29udGV4dCBvYmplY3QgdGhhdCBpcyBwcm92aWRlZCB0byBkaWZmZXJlbnQgY2FsbGJhY2tzIHRoZSBncmlkIHVzZXMuIFVzZWQgZm9yIHBhc3NpbmcgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB0byB0aGUgY2FsbGJhY2tzIGJ5IHlvdXIgYXBwbGljYXRpb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb250ZXh0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbGlzdCBvZiBncmlkcyB0byB0cmVhdCBhcyBBbGlnbmVkIEdyaWRzLiBJZiBncmlkcyBhcmUgYWxpZ25lZCB0aGVuIHRoZSBjb2x1bW5zIGFuZCBob3Jpem9udGFsIHNjcm9sbGluZyB3aWxsIGJlIGtlcHQgaW4gc3luYy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsaWduZWRHcmlkczogeyBhcGk/OiBHcmlkQXBpIHwgbnVsbCwgY29sdW1uQXBpPzogQ29sdW1uQXBpIHwgbnVsbCB9W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENoYW5nZSB0aGlzIHZhbHVlIHRvIHNldCB0aGUgdGFiSW5kZXggb3JkZXIgb2YgdGhlIEdyaWQgd2l0aGluIHlvdXIgYXBwbGljYXRpb24uIERlZmF1bHQ6IGAwYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIG51bWJlciBvZiByb3dzIHJlbmRlcmVkIG91dHNpZGUgdGhlIHZpZXdhYmxlIGFyZWEgdGhlIGdyaWQgcmVuZGVycy5cbiAgICAgICAgICogSGF2aW5nIGEgYnVmZmVyIG1lYW5zIHRoZSBncmlkIHdpbGwgaGF2ZSByb3dzIHJlYWR5IHRvIHNob3cgYXMgdGhlIHVzZXIgc2xvd2x5IHNjcm9sbHMgdmVydGljYWxseS5cbiAgICAgICAgICogRGVmYXVsdDogYDEwYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93QnVmZmVyOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvbiB0aGUgdmFsdWUgY2FjaGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZhbHVlQ2FjaGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29uZmlndXJlIHRoZSB2YWx1ZSBjYWNoZSB0byBub3QgZXhwaXJlIGFmdGVyIGRhdGEgdXBkYXRlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZU5ldmVyRXhwaXJlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBjZWxsIGV4cHJlc3Npb25zLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsRXhwcmVzc2lvbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgcm93IG5vZGVzIGRvIG5vdCBoYXZlIHRoZWlyIHBhcmVudHMgc2V0LlxuICAgICAgICAgKiBUaGUgZ3JpZCBkb2Vzbid0IHVzZSB0aGUgcGFyZW50IHJlZmVyZW5jZSwgYnV0IGl0IGlzIGluY2x1ZGVkIHRvIGhlbHAgdGhlIGNsaWVudCBjb2RlIG5hdmlnYXRlIHRoZSBub2RlIHRyZWUgaWYgaXQgd2FudHMgYnkgcHJvdmlkaW5nIGJpLWRpcmVjdGlvbiBuYXZpZ2F0aW9uIHVwIGFuZCBkb3duIHRoZSB0cmVlLlxuICAgICAgICAgKiBJZiB0aGlzIGlzIGEgcHJvYmxlbSAoZS5nLiBpZiB5b3UgbmVlZCB0byBjb252ZXJ0IHRoZSB0cmVlIHRvIEpTT04sIHdoaWNoIGRvZXMgbm90IGFsbG93IGN5Y2xpYyBkZXBlbmRlbmNpZXMpIHRoZW4gc2V0IHRoaXMgdG8gYHRydWVgLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0b3VjaCBzdXBwb3J0IChidXQgZG9lcyBub3QgcmVtb3ZlIHRoZSBicm93c2VyJ3MgZWZmb3J0cyB0byBzaW11bGF0ZSBtb3VzZSBldmVudHMgb24gdG91Y2gpLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzZXQgZm9jdXMgYmFjayBvbiB0aGUgZ3JpZCBhZnRlciBhIHJlZnJlc2guIFRoaXMgY2FuIGF2b2lkIGlzc3VlcyB3aGVyZSB5b3Ugd2FudCB0byBrZWVwIHRoZSBmb2N1cyBvbiBhbm90aGVyIHBhcnQgb2YgdGhlIGJyb3dzZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRm9jdXNBZnRlclJlZnJlc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSBhc3luY2hyb25vdXMgbmF0dXJlIG9mIHRoZSBldmVudHMgaW50cm9kdWNlZCBpbiB2MTAsIGFuZCBtYWtlcyB0aGVtIHN5bmNocm9ub3VzLiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGZvciB0aGUgcHVycG9zZSBvZiBzdXBwb3J0aW5nIGxlZ2FjeSBjb2RlIHdoaWNoIGhhcyBhIGRlcGVuZGVuY3kgb24gc3luY2hyb25vdXMgZXZlbnRzIGZyb20gZWFybGllciB2ZXJzaW9ucyAodjkgb3IgZWFybGllcikgb2YgQUcgR3JpZC4gICAgICoqSXQgaXMgc3Ryb25nbHkgcmVjb21tZW5kZWQgdGhhdCB5b3UgZG8gbm90IGNoYW5nZSB0aGlzIHByb3BlcnR5IHVubGVzcyB5b3UgaGF2ZSBsZWdhY3kgaXNzdWVzLioqIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBncmlkIHdpbGwgY2hlY2sgZm9yIGBSZXNpemVPYnNlcnZlcmAgYW5kIHVzZSBpdCBpZiBpdCBleGlzdHMgaW4gdGhlIGJyb3dzZXIsIG90aGVyd2lzZSBpdCB3aWxsIHVzZSB0aGUgZ3JpZCdzIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9uLiBTb21lIHVzZXJzIHJlcG9ydGVkIGlzc3VlcyB3aXRoIENocm9tZSdzIGBSZXNpemVPYnNlcnZlcmAuIFVzZSB0aGlzIHByb3BlcnR5IHRvIGFsd2F5cyB1c2UgdGhlIGdyaWQncyBhbHRlcm5hdGl2ZSBpbXBsZW1lbnRhdGlvbiBzaG91bGQgc3VjaCBwcm9ibGVtcyBleGlzdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHNob3dpbmcgYSB3YXJuaW5nIG1lc3NhZ2UgaW4gdGhlIGNvbnNvbGUgaWYgdXNpbmcgYSBgZ3JpZE9wdGlvbnNgIG9yIGBjb2xEZWZgIHByb3BlcnR5IHRoYXQgZG9lc24ndCBleGlzdC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIGNoYW5nZSBkZXRlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gZW5hYmxlIGRlYnVnIGluZm9ybWF0aW9uIGZyb20gdGhlIGdyaWQgYW5kIHJlbGF0ZWQgY29tcG9uZW50cy4gV2lsbCByZXN1bHQgaW4gYWRkaXRpb25hbCBsb2dnaW5nIGJlaW5nIG91dHB1dCwgYnV0IHZlcnkgdXNlZnVsIHdoZW4gaW52ZXN0aWdhdGluZyBwcm9ibGVtcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVidWc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSB0ZW1wbGF0ZSBmb3IgJ2xvYWRpbmcnIG92ZXJsYXkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5TG9hZGluZ1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gbG9hZGluZyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgICAgKiBTZWUgW0xvYWRpbmcgT3ZlcmxheSBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1vdmVybGF5LyNzaW1wbGUtbG9hZGluZy1vdmVybGF5LWNvbXBvbmVudCkgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjcsIHVzZSBgbG9hZGluZ092ZXJsYXlDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudEZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIGxvYWRpbmcgb3ZlcmxheSBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgJ2xvYWRpbmcnIG92ZXJsYXkuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTG9hZGluZ092ZXJsYXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSB0ZW1wbGF0ZSBmb3IgJ25vIHJvd3MnIG92ZXJsYXkuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5Tm9Sb3dzVGVtcGxhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBubyByb3dzIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAgICAqIFNlZSBbTm8gUm93cyBPdmVybGF5IENvbXBvbmVudF0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LW92ZXJsYXkvI3NpbXBsZS1uby1yb3dzLW92ZXJsYXktY29tcG9uZW50KSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYG5vUm93c092ZXJsYXlDb21wb25lbnRgIGZvciBmcmFtZXdvcmsgY29tcG9uZW50cyB0b28uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50RnJhbWV3b3JrOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgbm8gcm93cyBvdmVybGF5IGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlICdubyByb3dzJyBvdmVybGF5LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05vUm93c092ZXJsYXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB3aGV0aGVyIHBhZ2luYXRpb24gaXMgZW5hYmxlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcm93cyB0byBsb2FkIHBlciBwYWdlLiBJZiBgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZWAgaXMgc3BlY2lmaWVkLCB0aGlzIHByb3BlcnR5IGlzIGlnbm9yZWQuIERlZmF1bHQ6IGAxMDBgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uUGFnZVNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBudW1iZXIgb2Ygcm93cyB0byBsb2FkIHBlciBwYWdlIGlzIGF1dG9tYXRpY2FsbHkgYWRqdXN0ZWQgYnkgdGhlIGdyaWQgc28gZWFjaCBwYWdlIHNob3dzIGVub3VnaCByb3dzIHRvIGp1c3QgZmlsbCB0aGUgYXJlYSBkZXNpZ25hdGVkIGZvciB0aGUgZ3JpZC4gSWYgYGZhbHNlYCwgYHBhZ2luYXRpb25QYWdlU2l6ZWAgaXMgdXNlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHBhZ2VzIHNwbGl0IGNoaWxkcmVuIG9mIGdyb3VwcyB3aGVuIHVzaW5nIFJvdyBHcm91cGluZyBvciBkZXRhaWwgcm93cyB3aXRoIE1hc3RlciBEZXRhaWwuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRlQ2hpbGRSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZSBkZWZhdWx0IGdyaWQgY29udHJvbHMgZm9yIG5hdmlnYXRpb24gYXJlIGhpZGRlbi5cbiAgICAgICAgICogVGhpcyBpcyB1c2VmdWwgaWYgYHBhZ2luYXRpb249dHJ1ZWAgYW5kIHlvdSB3YW50IHRvIHByb3ZpZGUgeW91ciBvd24gcGFnaW5hdGlvbiBjb250cm9scy5cbiAgICAgICAgICogT3RoZXJ3aXNlLCB3aGVuIGBwYWdpbmF0aW9uPXRydWVgIHRoZSBncmlkIGF1dG9tYXRpY2FsbHkgc2hvd3MgdGhlIG5lY2Vzc2FyeSBjb250cm9scyBhdCB0aGUgYm90dG9tIHNvIHRoYXQgdGhlIHVzZXIgY2FuIG5hdmlnYXRlIHRocm91Z2ggdGhlIGRpZmZlcmVudCBwYWdlcy5cbiAgICAgICAgICogRGVmYXVsdDogYGZhbHNlYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYWdpbmF0aW9uUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHBpdm90IG1vZGUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90TW9kZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB0byBzaG93IHRoZSAncGl2b3QgcGFuZWwnICh3aGVyZSB5b3UgZHJhZyByb3dzIHRvIHBpdm90KSBhdCB0aGUgdG9wLiBOb3RlIHRoYXQgdGhlIHBpdm90IHBhbmVsIHdpbGwgbmV2ZXIgc2hvdyBpZiBgcGl2b3RNb2RlYCBpcyBvZmYuIERlZmF1bHQ6IGBuZXZlcmAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90UGFuZWxTaG93OiAnYWx3YXlzJyB8ICdvbmx5V2hlblBpdm90aW5nJyB8ICduZXZlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gc2V0IGFuZCB0aGUgZ3JpZCBpcyBpbiBwaXZvdCBtb2RlLCBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgdG90YWxzIHdpbGwgYXBwZWFyIHdpdGhpbiB0aGUgUGl2b3QgQ29sdW1uIEdyb3VwcywgaW4gdGhlIHBvc2l0aW9uIHNwZWNpZmllZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Q29sdW1uR3JvdXBUb3RhbHM6ICdiZWZvcmUnIHwgJ2FmdGVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBzZXQgYW5kIHRoZSBncmlkIGlzIGluIHBpdm90IG1vZGUsIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCB0b3RhbHMgd2lsbCBhcHBlYXIgZm9yIGVhY2ggdmFsdWUgY29sdW1uIGluIHRoZSBwb3NpdGlvbiBzcGVjaWZpZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFJvd1RvdGFsczogJ2JlZm9yZScgfCAnYWZ0ZXInIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IHN3YXAgaW4gdGhlIGdyb3VwaW5nIGNvbHVtbiB3aGVuIHBpdm90aW5nLiBVc2VmdWwgaWYgcGl2b3RpbmcgdXNpbmcgU2VydmVyIFNpZGUgUm93IE1vZGVsIG9yIFZpZXdwb3J0IFJvdyBNb2RlbCBhbmQgeW91IHdhbnQgZnVsbCBjb250cm9sIG9mIGFsbCBjb2x1bW5zIGluY2x1ZGluZyB0aGUgZ3JvdXAgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFN1cHByZXNzQXV0b0NvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBwaXZvdCBjb2x1bW4gZ3JvdXBzIHdpbGwgYXBwZWFyICdmaXhlZCcsIHdpdGhvdXQgdGhlIGFiaWxpdHkgdG8gZXhwYW5kIGFuZCBjb2xsYXBzZSB0aGUgY29sdW1uIGdyb3Vwcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeHBhbmRhYmxlUGl2b3RHcm91cHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlbiByb3cgZ3JvdXAsIHBpdm90IGFuZCB2YWx1ZSBhZ2dyZWdhdGlvbiB3aWxsIGJlIHJlYWQtb25seSBmcm9tIHRoZSBHVUkuIFRoZSBncmlkIHdpbGwgZGlzcGxheSB3aGF0IHZhbHVlcyBhcmUgdXNlZCBmb3IgZWFjaCwgYnV0IHdpbGwgbm90IGFsbG93IHRoZSB1c2VyIHRvIGNoYW5nZSB0aGUgc2VsZWN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNSZWFkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2YgJ2Z1bmN0aW9uIG5hbWUnIHRvICdmdW5jdGlvbicgZm9yIGN1c3RvbSBhZ2dyZWdhdGlvbiBmdW5jdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jczogeyBba2V5OiBzdHJpbmddOiBJQWdnRnVuYzxURGF0YT47IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBjb2x1bW4gaGVhZGVycyB3b24ndCBpbmNsdWRlIHRoZSBgYWdnRnVuY2AgbmFtZSwgZS5nLiBgJ3N1bShCYW5rIEJhbGFuY2UpYCcgd2lsbCBqdXN0IGJlIGAnQmFuayBCYWxhbmNlJ2AuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRnVuY0luSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGFnZ3JlZ2F0aW9ucyB3b24ndCBiZSBjb21wdXRlZCBmb3IgdGhlIHJvb3Qgbm9kZSBvZiB0aGUgZ3JpZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyBjaGFuZ2UgZGV0ZWN0aW9uLCBvbmx5IHRoZSB1cGRhdGVkIGNvbHVtbiB3aWxsIGJlIHJlLWFnZ3JlZ2F0ZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFnZ3JlZ2F0ZU9ubHlDaGFuZ2VkQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IGFnZ3JlZ2F0aW9ucyBhcmUgbm90IGltcGFjdGVkIGJ5IGZpbHRlcmluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gb21pdCB0aGUgdmFsdWUgQ29sdW1uIGhlYWRlciB3aGVuIHRoZXJlIGlzIG9ubHkgYSBzaW5nbGUgdmFsdWUgY29sdW1uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZW1vdmVQaXZvdEhlYWRlclJvd1doZW5TaW5nbGVWYWx1ZUNvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgUm93IEFuaW1hdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYW5pbWF0ZVJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBjZWxscyBmbGFzaCBhZnRlciBkYXRhIGNoYW5nZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgLCB0aGlzIGNvbmZpZ3VyYXRpb24gd2lsbCBzZXQgdGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyBhIGNlbGwgc2hvdWxkIHJlbWFpbiBpbiBpdHMgXCJmbGFzaGVkXCIgc3RhdGUuXG4gICAgICAgICAqIERlZmF1bHQ6IGA1MDBgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmxhc2hEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGVuYWJsZUNlbGxDaGFuZ2VGbGFzaGAsIHRoaXMgY29uZmlndXJhdGlvbiB3aWxsIHNldCB0aGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIG9mIGhvdyBsb25nIHRoZSBcImZsYXNoZWRcIiBzdGF0ZSBhbmltYXRpb24gdGFrZXMgdG8gZmFkZSBhd2F5IGFmdGVyIHRoZSB0aW1lciBzZXQgYnkgYGNlbGxGbGFzaERlbGF5YCBoYXMgY29tcGxldGVkLlxuICAgICAgICAgKiBEZWZhdWx0OiBgMTAwMGBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGYWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIGZsYXNoIGFmdGVyIGRhdGEgY2hhbmdlcyBldmVuIHdoZW4gdGhlIGNoYW5nZSBpcyBkdWUgdG8gZmlsdGVyaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd1Nob3dDaGFuZ2VBZnRlckZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3dpdGNoIGJldHdlZW4gbGF5b3V0IG9wdGlvbnM6IGBub3JtYWxgLCBgYXV0b0hlaWdodGAsIGBwcmludGAuXG4gICAgICAgICAqIERlZmF1bHQ6IGBub3JtYWxgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb21MYXlvdXQ6IERvbUxheW91dFR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgb3JkZXIgb2Ygcm93cyBhbmQgY29sdW1ucyBpbiB0aGUgRE9NIGFyZSBjb25zaXN0ZW50IHdpdGggd2hhdCBpcyBvbiBzY3JlZW4uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG9wZXJhdGUgdGhlIGdyaWQgaW4gUlRMIChSaWdodCB0byBMZWZ0KSBtb2RlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSdGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgZ3JpZCBkb2Vzbid0IHZpcnR1YWxpc2UgdGhlIGNvbHVtbnMuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSAxMDAgY29sdW1ucywgYnV0IG9ubHkgMTAgdmlzaWJsZSBkdWUgdG8gc2Nyb2xsaW5nLCBhbGwgMTAwIHdpbGwgYWx3YXlzIGJlIHJlbmRlcmVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0IHRoZSBncmlkIGhhcyBhIGxpbWl0IG9mIHJlbmRlcmluZyBhIG1heGltdW0gb2YgNTAwIHJvd3MgYXQgb25jZSAocmVtZW1iZXIgdGhlIGdyaWQgb25seSByZW5kZXJzIHJvd3MgeW91IGNhbiBzZWUsIHNvIHVubGVzcyB5b3VyIGRpc3BsYXkgc2hvd3MgbW9yZSB0aGFuIDUwMCByb3dzIHdpdGhvdXQgdmVydGljYWxseSBzY3JvbGxpbmcgdGhpcyB3aWxsIG5ldmVyIGJlIGFuIGlzc3VlKS5cbiAgICAgICAgICogPGJyIC8+KipUaGlzIGlzIG9ubHkgcmVsZXZhbnQgaWYgeW91IGFyZSBtYW51YWxseSBzZXR0aW5nIGByb3dCdWZmZXJgIHRvIGEgaGlnaCB2YWx1ZSAocmVuZGVyaW5nIG1vcmUgcm93cyB0aGFuIGNhbiBiZSBzZWVuKSwgb3IgYHN1cHByZXNzUm93VmlydHVhbGlzYXRpb25gIGlzIHRydWUsIG9yIGlmIHlvdXIgZ3JpZCBoZWlnaHQgaXMgYWJsZSB0byBkaXNwbGF5IG1vcmUgdGhhbiA1MDAgcm93cyBhdCBvbmNlLioqXG4gICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBncmlkIGRvZXNuJ3QgdmlydHVhbGlzZSB0aGUgcm93cy4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIDEwMCByb3dzLCBidXQgb25seSAxMCB2aXNpYmxlIGR1ZSB0byBzY3JvbGxpbmcsIGFsbCAxMDAgd2lsbCBhbHdheXMgYmUgcmVuZGVyZWQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hbmFnZWQgUm93IERyYWdnaW5nLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyByb3cgZHJhZ2dpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtb3Zpbmcgcm93cyB3aGlsZSBkcmFnZ2luZyB0aGUgYHJvd0RyYWdgIHdhZmZsZS4gVGhpcyBvcHRpb24gaGlnaGxpZ2h0cyB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIHJvdyB3aWxsIGJlIHBsYWNlZCBhbmQgaXQgd2lsbCBvbmx5IG1vdmUgdGhlIHJvdyBvbiBtb3VzZSB1cC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBjbGlja2luZyBhbmQgZHJhZ2dpbmcgYW55d2hlcmUgb24gdGhlIHJvdyB3aXRob3V0IHRoZSBuZWVkIGZvciBhIGRyYWcgaGFuZGxlLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnRW50aXJlUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBkcmFnZ2luZyBtdWx0aXBsZSByb3dzIGF0IHRoZSBzYW1lIHRpbWUuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNdWx0aVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gYSBzdHJpbmcgdG8gYmUgZGlzcGxheWVkIGJ5IHRoZSBgcm93RHJhZ0NvbXBgIHdoaWxlIGRyYWdnaW5nIGEgcm93LlxuICAgICAgICAgKiBJZiB0aGlzIGNhbGxiYWNrIGlzIG5vdCBzZXQsIHRoZSBjdXJyZW50IGNlbGwgdmFsdWUgd2lsbCBiZSB1c2VkLlxuICAgICAgICAgKiBJZiB0aGUgYHJvd0RyYWdUZXh0YCBjYWxsYmFjayBpcyBzZXQgaW4gdGhlIENvbERlZiBpdCB3aWxsIHRha2UgcHJlY2VkZW5jZSBvdmVyIHRoaXMsIGV4Y2VwdCB3aGVuXG4gICAgICAgICAqIGByb3dEcmFnRW50aXJlUm93PXRydWVgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ1RleHQ6ICgocGFyYW1zOiBJUm93RHJhZ0l0ZW0sIGRyYWdJdGVtQ291bnQ6IG51bWJlcikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBjZWxsIHJlbmRlcmVyIGNvbXBvbmVudCB0byB1c2UgZm9yIGZ1bGwgd2lkdGggcm93cy5cbiAgICAgICAgKiBTZWUgW0Z1bGwgV2lkdGggUm93c10oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvZnVsbC13aWR0aC1yb3dzLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI3LCB1c2UgYGZ1bGxXaWR0aENlbGxSZW5kZXJlcmAgZm9yIGZyYW1ld29yayBjb21wb25lbnRzIHRvby4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIGBmdWxsV2lkdGhDZWxsUmVuZGVyZXJgIGNvbXBvbmVudC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGRldGFpbCBncmlkIGVtYmVkZGVkIGluIHRoZSBtYXN0ZXIgZ3JpZCdzIGNvbnRhaW5lciBhbmQgc28gbGluayB0aGVpciBob3Jpem9udGFsIHNjcm9sbGluZy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIGhvdyB0aGUgcmVzdWx0cyBvZiByb3cgZ3JvdXBpbmcgc2hvdWxkIGJlIGRpc3BsYXllZC5cbiAgICAgICAgICpcbiAgICAgICAgICogIFRoZSBvcHRpb25zIGFyZTpcbiAgICAgICAgICpcbiAgICAgICAgICogLSBgJ3NpbmdsZUNvbHVtbidgOiBzaW5nbGUgZ3JvdXAgY29sdW1uIGF1dG9tYXRpY2FsbHkgYWRkZWQgYnkgdGhlIGdyaWQuXG4gICAgICAgICAqIC0gYCdtdWx0aXBsZUNvbHVtbnMnYDogYSBncm91cCBjb2x1bW4gcGVyIHJvdyBncm91cCBpcyBhZGRlZCBhdXRvbWF0aWNhbGx5LlxuICAgICAgICAgKiAtIGAnZ3JvdXBSb3dzJ2A6IGdyb3VwIHJvd3MgYXJlIGF1dG9tYXRpY2FsbHkgYWRkZWQgaW5zdGVhZCBvZiBncm91cCBjb2x1bW5zLlxuICAgICAgICAgKiAtIGAnY3VzdG9tJ2A6IGluZm9ybXMgdGhlIGdyaWQgdGhhdCBncm91cCBjb2x1bW5zIHdpbGwgYmUgcHJvdmlkZWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERpc3BsYXlUeXBlOiBSb3dHcm91cGluZ0Rpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgc2V0IHRvIHRoZSBudW1iZXIgb2YgbGV2ZWxzIHRvIGV4cGFuZCBieSBkZWZhdWx0LCBlLmcuIGAwYCBmb3Igbm9uZSwgYDFgIGZvciBmaXJzdCBsZXZlbCBvbmx5LCBldGMuIFNldCB0byBgLTFgIHRvIGV4cGFuZCBldmVyeXRoaW5nLiBEZWZhdWx0OiBgMGAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGVmYXVsdEV4cGFuZGVkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzcGVjaWZ5aW5nIHRoZSBncm91cCAnYXV0byBjb2x1bW4nIGlmIHlvdSBhcmUgbm90IGhhcHB5IHdpdGggdGhlIGRlZmF1bHQuIElmIGdyb3VwaW5nLCB0aGlzIGNvbHVtbiBkZWZpbml0aW9uIGlzIGluY2x1ZGVkIGFzIHRoZSBmaXJzdCBjb2x1bW4gaW4gdGhlIGdyaWQuIElmIG5vdCBncm91cGluZywgdGhpcyBjb2x1bW4gaXMgbm90IGluY2x1ZGVkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0dyb3VwQ29sdW1uRGVmOiBDb2xEZWY8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgcHJlc2VydmVzIHRoZSBjdXJyZW50IGdyb3VwIG9yZGVyIHdoZW4gc29ydGluZyBvbiBub24tZ3JvdXAgY29sdW1ucy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgaWYgeW91IHNlbGVjdCBhIGdyb3VwLCB0aGUgY2hpbGRyZW4gb2YgdGhlIGdyb3VwIHdpbGwgYWxzbyBiZSBzZWxlY3RlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBkZXRlcm1pbmUgd2hldGhlciBmaWx0ZXJzIHNob3VsZCBiZSBhcHBsaWVkIG9uIGFnZ3JlZ2F0ZWQgZ3JvdXAgdmFsdWVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEFnZ0ZpbHRlcmluZzogYm9vbGVhbiB8IElzUm93RmlsdGVyYWJsZTxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGdyb3VwaW5nLCB0aGlzIGNvbnRyb2xzIHdoZXRoZXIgdG8gc2hvdyBhIGdyb3VwIGZvb3RlciB3aGVuIHRoZSBncm91cCBpcyBleHBhbmRlZC5cbiAgICAgICAgICogSWYgYHRydWVgLCB0aGVuIGJ5IGRlZmF1bHQsIHRoZSBmb290ZXIgd2lsbCBjb250YWluIGFnZ3JlZ2F0ZSBkYXRhIChpZiBhbnkpIHdoZW4gc2hvd24gYW5kIHRoZSBoZWFkZXIgd2lsbCBiZSBibGFuay5cbiAgICAgICAgICogV2hlbiBjbG9zZWQsIHRoZSBoZWFkZXIgd2lsbCBjb250YWluIHRoZSBhZ2dyZWdhdGUgZGF0YSByZWdhcmRsZXNzIG9mIHRoaXMgc2V0dGluZyAoYXMgdGhlIGZvb3RlciBpcyBoaWRkZW4gYW55d2F5KS5cbiAgICAgICAgICogVGhpcyBpcyBoYW5keSBmb3IgJ3RvdGFsJyByb3dzLCB0aGF0IGFyZSBkaXNwbGF5ZWQgYmVsb3cgdGhlIGRhdGEgd2hlbiB0aGUgZ3JvdXAgaXMgb3BlbiwgYW5kIGFsb25nc2lkZSB0aGUgZ3JvdXAgd2hlbiBpdCBpcyBjbG9zZWQuXG4gICAgICAgICAqIERlZmF1bHQ6IGBmYWxzZWBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZUZvb3RlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzaG93IGEgJ2dyYW5kIHRvdGFsJyBncm91cCBmb290ZXIgYWNyb3NzIGFsbCBncm91cHMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZVRvdGFsRm9vdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIGFuZCBzaG93aW5nIGZvb3RlciwgYWdncmVnYXRlIGRhdGEgd2lsbCBhbHdheXMgYmUgZGlzcGxheWVkIGF0IGJvdGggdGhlIGhlYWRlciBhbmQgZm9vdGVyIGxldmVscy4gVGhpcyBzdG9wcyB0aGUgcG9zc2libHkgdW5kZXNpcmFibGUgYmVoYXZpb3VyIG9mIHRoZSBoZWFkZXIgZGV0YWlscyAnanVtcGluZycgdG8gdGhlIGZvb3RlciBvbiBleHBhbmQuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NCbGFua0hlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgdXNpbmcgYGdyb3VwU2VsZWN0c0NoaWxkcmVuYCwgdGhlbiBvbmx5IHRoZSBjaGlsZHJlbiB0aGF0IHBhc3MgdGhlIGN1cnJlbnQgZmlsdGVyIHdpbGwgZ2V0IHNlbGVjdGVkLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2hvd3MgdGhlIG9wZW4gZ3JvdXAgaW4gdGhlIGdyb3VwIGNvbHVtbiBmb3Igbm9uLWdyb3VwIHJvd3MuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb2xsYXBzZSBncm91cHMgdGhhdCBvbmx5IGhhdmUgb25lIGNoaWxkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb2xsYXBzZSBsb3dlc3QgbGV2ZWwgZ3JvdXBzIHRoYXQgb25seSBoYXZlIG9uZSBjaGlsZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoaWRlIHBhcmVudHMgdGhhdCBhcmUgb3Blbi4gV2hlbiB1c2VkIHdpdGggbXVsdGlwbGUgY29sdW1ucyBmb3Igc2hvd2luZyBncm91cHMsIGl0IGNhbiBnaXZlIGEgbW9yZSBwbGVhc2luZyB1c2VyIGV4cGVyaWVuY2UuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGlkZU9wZW5QYXJlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHByZXZlbnQgdGhlIGdyaWQgZnJvbSBjcmVhdGluZyBhICcoQmxhbmtzKScgZ3JvdXAgZm9yIG5vZGVzIHdoaWNoIGRvIG5vdCBiZWxvbmcgdG8gYSBncm91cCwgYW5kIGRpc3BsYXkgdGhlIHVuYmFsYW5jZWQgbm9kZXMgYWxvbmdzaWRlIGdyb3VwIG5vZGVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEFsbG93VW5iYWxhbmNlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB0byBzaG93IHRoZSAncm93IGdyb3VwIHBhbmVsJyAod2hlcmUgeW91IGRyYWcgcm93cyB0byBncm91cCkgYXQgdGhlIHRvcC4gRGVmYXVsdDogYG5ldmVyYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBQYW5lbFNob3c6ICdhbHdheXMnIHwgJ29ubHlXaGVuR3JvdXBpbmcnIHwgJ25ldmVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB0aGUgQ2VsbCBSZW5kZXJlciB0byB1c2Ugd2hlbiBgZ3JvdXBEaXNwbGF5VHlwZSA9ICdncm91cFJvd3MnYC5cbiAgICAgICAgKiBTZWUgW0dyb3VwIFJvdyBDZWxsIFJlbmRlcmVyXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9ncm91cGluZy1ncm91cC1yb3dzLyNwcm92aWRpbmctY2VsbC1yZW5kZXJlcikgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyNywgdXNlIGBncm91cFJvd1JlbmRlcmVyYCBmb3IgZnJhbWV3b3JrIGNvbXBvbmVudHMgdG9vLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlckZyYW1ld29yazogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIGBncm91cFJvd1JlbmRlcmVyYCBjb21wb25lbnQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQsIHdoZW4gYSBjb2x1bW4gaXMgdW4tZ3JvdXBlZCwgaS5lLiB1c2luZyB0aGUgUm93IEdyb3VwIFBhbmVsLCBpdCBpcyBtYWRlIHZpc2libGUgaW4gdGhlIGdyaWQuIFRoaXMgcHJvcGVydHkgc3RvcHMgdGhlIGNvbHVtbiBiZWNvbWluZyB2aXNpYmxlIGFnYWluIHdoZW4gdW4tZ3JvdXBpbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBHcmlkIHRvIHdvcmsgd2l0aCBUcmVlIERhdGEuIFlvdSBtdXN0IGFsc28gaW1wbGVtZW50IHRoZSBgZ2V0RGF0YVBhdGgoZGF0YSlgIGNhbGxiYWNrLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydCBpbmRpY2F0b3JzIGFuZCBhY3Rpb25zIGZyb20gdGhlIHJvdyBncm91cCBwYW5lbC4gRGVmYXVsdDogYGZhbHNlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTdXBwcmVzc1NvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8ga2VlcCBvcGVuIEdyb3VwIFJvd3MgdmlzaWJsZSBhdCB0aGUgdG9wIG9mIHRoZSBncmlkLiBEZWZhdWx0OiBgZmFsc2VgLiovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93c1N0aWNreTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI0IC0gbm8gbG9uZ2VyIG5lZWRlZCwgdHJhbnNhY3Rpb24gdXBkYXRlcyBrZWVwIGdyb3VwIHN0YXRlICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZW1lbWJlckdyb3VwU3RhdGVXaGVuTmV3RGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIHRvcCByb3dzIGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkVG9wUm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERhdGEgdG8gYmUgZGlzcGxheWVkIGFzIHBpbm5lZCBib3R0b20gcm93cyBpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZEJvdHRvbVJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXRzIHRoZSByb3cgbW9kZWwgdHlwZS4gRGVmYXVsdDogYGNsaWVudFNpZGVgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNb2RlbFR5cGU6IFJvd01vZGVsVHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBkYXRhIHRvIGJlIGRpc3BsYXllZCBhcyByb3dzIGluIHRoZSBncmlkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RGF0YTogVERhdGFbXSB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIDI3LjEgSW1tdXRhYmxlIERhdGEgaXMgb24gYnkgZGVmYXVsdCB3aGVuIGdyaWQgY2FsbGJhY2sgZ2V0Um93SWQoKSBpcyBpbXBsZW1lbnRlZFxuICAgICAgICAgKiBFbmFibGVzIEltbXV0YWJsZSBEYXRhIG1vZGUsIGZvciBjb21wYXRpYmlsaXR5IHdpdGggaW1tdXRhYmxlIHN0b3Jlcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW1tdXRhYmxlRGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGV4ZWN1dGluZyBhIGJhdGNoIG9mIGFzeW5jIHRyYW5zYWN0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25XYWl0TWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIFRyYW5zYWN0aW9ucyBjaGFuZ2luZyBzb3J0LCBmaWx0ZXIsIGdyb3VwIG9yIHBpdm90IHN0YXRlIHdoZW4gdHJhbnNhY3Rpb24gb25seSBjb250YWlucyB1cGRhdGVzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vZGVsVXBkYXRlQWZ0ZXJVcGRhdGVUcmFuc2FjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB0aGUgZGF0YXNvdXJjZSBmb3IgaW5maW5pdGUgc2Nyb2xsaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0YXNvdXJjZTogSURhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGV4dHJhIGJsYW5rIHJvd3MgdG8gZGlzcGxheSB0byB0aGUgdXNlciBhdCB0aGUgZW5kIG9mIHRoZSBkYXRhc2V0LCB3aGljaCBzZXRzIHRoZSB2ZXJ0aWNhbCBzY3JvbGwgYW5kIHRoZW4gYWxsb3dzIHRoZSBncmlkIHRvIHJlcXVlc3Qgdmlld2luZyBtb3JlIHJvd3Mgb2YgZGF0YS5cbiAgICAgICAgICogRGVmYXVsdDogYDFgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZU92ZXJmbG93U2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBleHRyYSBibGFuayByb3dzIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXIgYXQgdGhlIGVuZCBvZiB0aGUgZGF0YXNldCwgd2hpY2ggc2V0cyB0aGUgdmVydGljYWwgc2Nyb2xsIGFuZCB0aGVuIGFsbG93cyB0aGUgZ3JpZCB0byByZXF1ZXN0IHZpZXdpbmcgbW9yZSByb3dzIG9mIGRhdGEuXG4gICAgICAgICAqIERlZmF1bHQ6IGAxYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IGhvdyBtYW55IGxvYWRpbmcgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGZvciB0aGUgcm9vdCBsZXZlbCBncm91cC5cbiAgICAgICAgICogRGVmYXVsdDogYDFgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlSW5pdGlhbFJvd0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOCBXaGV0aGVyIHRvIHVzZSBGdWxsIFN0b3JlIG9yIFBhcnRpYWwgU3RvcmUgZm9yIHN0b3Jpbmcgcm93cy4gRGVmYXVsdDogYHBhcnRpYWxgLlxuICAgICAgICAgKiBEZXByZWNhdGVkIGluIGZhdm91ciBvZiBzdXBwcmVzc1NlcnZlclNpZGVJbmZpbml0ZVNjcm9sbC4gV2hlbiBmYWxzZSwgUGFydGlhbCBTdG9yZSBpcyB1c2VkLiBXaGVuIHRydWUsXG4gICAgICAgICAqIEZ1bGwgU3RvcmUgaXMgdXNlZC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTdG9yZVR5cGU6IFNlcnZlclNpZGVTdG9yZVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgU2VydmVyLXNpZGUgUm93IE1vZGVsIHdpbGwgc3VwcHJlc3MgSW5maW5pdGUgU2Nyb2xsaW5nIGFuZCBsb2FkIGFsbCB0aGUgZGF0YSBhdCB0aGUgY3VycmVudCBsZXZlbC5cbiAgICAgICAgICogRGVmYXVsdDogYGZhbHNlYFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJvd3MgZm9yIGVhY2ggYmxvY2sgaW4gdGhlIHN0b3JlLCBpLmUuIGhvdyBtYW55IHJvd3MgcmV0dXJuZWQgZnJvbSB0aGUgc2VydmVyIGF0IGEgdGltZS5cbiAgICAgICAgICogRGVmYXVsdDogYDEwMGBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlQmxvY2tTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGJsb2NrcyB0byBrZWVwIGluIHRoZSBzdG9yZS4gRGVmYXVsdCBpcyBubyBsaW1pdCwgc28gZXZlcnkgcmVxdWVzdGVkIGJsb2NrIGlzIGtlcHQuIFVzZSB0aGlzIGlmIHlvdSBoYXZlIG1lbW9yeSBjb25jZXJucywgYW5kIGJsb2NrcyB0aGF0IHdlcmUgbGVhc3QgcmVjZW50bHkgdmlld2VkIHdpbGwgYmUgcHVyZ2VkIHdoZW4gdGhlIGxpbWl0IGlzIGhpdC4gVGhlIGdyaWQgd2lsbCBhZGRpdGlvbmFsbHkgbWFrZSBzdXJlIGl0IGhhcyBhbGwgdGhlIGJsb2NrcyBuZWVkZWQgdG8gZGlzcGxheSB3aGF0IGlzIGN1cnJlbnRseSB2aXNpYmxlLCBpbiBjYXNlIHRoaXMgcHJvcGVydHkgaXMgc2V0IHRvIGEgbG93IHZhbHVlLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4QmxvY2tzSW5DYWNoZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByZXF1ZXN0cyB0byBoaXQgdGhlIHNlcnZlciB3aXRoIGNvbmN1cnJlbnRseS4gSWYgdGhlIG1heCBpcyByZWFjaGVkLCByZXF1ZXN0cyBhcmUgcXVldWVkLlxuICAgICAgICAgKiBTZXQgdG8gYC0xYCBmb3Igbm8gbWF4aW11bSByZXN0cmljdGlvbiBvbiByZXF1ZXN0cy5cbiAgICAgICAgICogRGVmYXVsdDogYDJgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhDb25jdXJyZW50RGF0YXNvdXJjZVJlcXVlc3RzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBsb2FkaW5nIGEgYmxvY2suIFVzZWZ1bCB3aGVuIHNjcm9sbGluZyBvdmVyIG1hbnkgYmxvY2tzLCBhcyBpdCBwcmV2ZW50cyBibG9ja3MgbG9hZGluZyB1bnRpbCBzY3JvbGxpbmcgaGFzIHNldHRsZWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBibG9ja0xvYWREZWJvdW5jZU1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGNsb3NpbmcgZ3JvdXAgcm93cyB3aWxsIHJlbW92ZSBjaGlsZHJlbiBvZiB0aGF0IHJvdy4gTmV4dCB0aW1lIHRoZSByb3cgaXMgb3BlbmVkLCBjaGlsZCByb3dzIHdpbGwgYmUgcmVhZCBmcm9tIHRoZSBkYXRhc291cmNlIGFnYWluLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZy4gRGVmYXVsdDogYGZhbHNlYCAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHB1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIGBzZXJ2ZXJTaWRlRGF0YXNvdXJjZWAgZm9yIHNlcnZlciBzaWRlIHJvdyBtb2RlbC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVEYXRhc291cmNlOiBJU2VydmVyU2lkZURhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgYWx3YXlzIHJlZnJlc2hlcyB0b3AgbGV2ZWwgZ3JvdXBzIHJlZ2FyZGxlc3Mgb2Ygd2hpY2ggY29sdW1uIHdhcyBzb3J0ZWQuIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nICYgc29ydGluZyBpcyBoYW5kbGVkIG9uIHRoZSBzZXJ2ZXIuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0QWxsTGV2ZWxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGFsd2F5cyByZWZyZXNoZXMgdG9wIGxldmVsIGdyb3VwcyByZWdhcmRsZXNzIG9mIHdoaWNoIGNvbHVtbiB3YXMgZmlsdGVyZWQuIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nICYgZmlsdGVyaW5nIGlzIGhhbmRsZWQgb24gdGhlIHNlcnZlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlckFsbExldmVsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogXG4gICAgICAgICAqIFdoZW4gZW5hYmxlZCwgU29ydGluZyB3aWxsIGJlIGRvbmUgb24gdGhlIHNlcnZlci4gT25seSBhcHBsaWNhYmxlIHdoZW4gYHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsPXRydWVgLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydE9uU2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIEZpbHRlcmluZyB3aWxsIGJlIGRvbmUgb24gdGhlIHNlcnZlci4gT25seSBhcHBsaWNhYmxlIHdoZW4gYHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsPXRydWVgLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRmlsdGVyT25TZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOCBUaGlzIHByb3BlcnR5IGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBgc2VydmVyU2lkZVNvcnRBbGxMZXZlbHNgIGluc3RlYWQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydGluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI4IFRoaXMgcHJvcGVydHkgaGFzIGJlZW4gZGVwcmVjYXRlZC4gVXNlIGBzZXJ2ZXJTaWRlRmlsdGVyQWxsTGV2ZWxzYCBpbnN0ZWFkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlcmluZ0Fsd2F5c1Jlc2V0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gdXNlIHRoZSB2aWV3cG9ydCByb3cgbW9kZWwgeW91IG5lZWQgdG8gcHJvdmlkZSB0aGUgZ3JpZCB3aXRoIGEgYHZpZXdwb3J0RGF0YXNvdXJjZWAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydERhdGFzb3VyY2U6IElWaWV3cG9ydERhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgdmlld3BvcnQgcm93IG1vZGVsLCBzZXRzIHRoZSBwYWdlIHNpemUgZm9yIHRoZSB2aWV3cG9ydC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxQYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIHZpZXdwb3J0IHJvdyBtb2RlbCwgc2V0cyB0aGUgYnVmZmVyIHNpemUgZm9yIHRoZSB2aWV3cG9ydC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxCdWZmZXJTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIHNob3cgdGhlIGhvcml6b250YWwgc2Nyb2xsYmFyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgdmVydGljYWwgc2Nyb2xsYmFyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93VmVydGljYWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZGVib3VuY2UgdGhlIHZlcnRpY2FsIHNjcm9sbGJhci4gQ2FuIHByb3ZpZGUgc21vb3RoZXIgc2Nyb2xsaW5nIG9uIHNsb3cgbWFjaGluZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlYm91bmNlVmVydGljYWxTY3JvbGxiYXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbmV2ZXIgc2hvdyB0aGUgaG9yaXpvbnRhbCBzY3JvbGwuIFRoaXMgaXMgdXNlZnVsIGlmIHRoZSBncmlkIGlzIGFsaWduZWQgd2l0aCBhbm90aGVyIGdyaWQgYW5kIHdpbGwgc2Nyb2xsIHdoZW4gdGhlIG90aGVyIGdyaWQgc2Nyb2xscy4gKFNob3VsZCBub3QgYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbGAuKSBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzY3JvbGwgdG8gdGhlIHRvcCB3aGVuIG5ldyByb3cgZGF0YSBpcyBwcm92aWRlZC4gVXNlIHRoaXMgaWYgeW91IGRvbid0IHdhbnQgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIG9mIHNjcm9sbGluZyB0byB0aGUgdG9wIGV2ZXJ5IHRpbWUgeW91IGxvYWQgbmV3IGRhdGEuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsT25OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgYWxsb3cgbW91c2V3aGVlbCAvIHRvdWNocGFkIHNjcm9sbCB3aGVuIHBvcHVwIGVsZW1lbnRzIGFyZSBwcmVzZW50LiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbFdoZW5Qb3B1cHNBcmVPcGVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgdXNlIGFuaW1hdGlvbiBmcmFtZXMgd2hlbiBkcmF3aW5nIHJvd3Mgd2hpbGUgc2Nyb2xsaW5nLiBVc2UgdGhpcyBpZiB0aGUgZ3JpZCBpcyB3b3JraW5nIGZhc3QgZW5vdWdoIHRoYXQgeW91IGRvbid0IG5lZWQgYW5pbWF0aW9uIGZyYW1lcyBhbmQgeW91IGRvbid0IHdhbnQgdGhlIGdyaWQgdG8gZmxpY2tlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBtaWRkbGUgY2xpY2tzIHdpbGwgcmVzdWx0IGluIGBjbGlja2AgZXZlbnRzIGZvciBjZWxscyBhbmQgcm93cy4gT3RoZXJ3aXNlIHRoZSBicm93c2VyIHdpbGwgdXNlIG1pZGRsZSBjbGljayB0byBzY3JvbGwgdGhlIGdyaWQuPGJyIC8+KipOb3RlOioqIE5vdCBhbGwgYnJvd3NlcnMgZmlyZSBgY2xpY2tgIGV2ZW50cyB3aXRoIHRoZSBtaWRkbGUgYnV0dG9uLiBNb3N0IHdpbGwgZmlyZSBvbmx5IGBtb3VzZWRvd25gIGFuZCBgbW91c2V1cGAgZXZlbnRzLCB3aGljaCBjYW4gYmUgdXNlZCB0byBmb2N1cyBhIGNlbGwsIGJ1dCB3aWxsIG5vdCB3b3JrIHRvIGNhbGwgdGhlIGBvbkNlbGxDbGlja2VkYCBmdW5jdGlvbi4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgbW91c2Ugd2hlZWwgZXZlbnRzIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBicm93c2VyLiBVc2VmdWwgaWYgeW91ciBncmlkIGhhcyBubyB2ZXJ0aWNhbCBzY3JvbGxzIGFuZCB5b3Ugd2FudCB0aGUgbW91c2UgdG8gc2Nyb2xsIHRoZSBicm93c2VyIHBhZ2UuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRlbGwgdGhlIGdyaWQgaG93IHdpZGUgaW4gcGl4ZWxzIHRoZSBzY3JvbGxiYXIgaXMsIHdoaWNoIGlzIHVzZWQgaW4gZ3JpZCB3aWR0aCBjYWxjdWxhdGlvbnMuIFNldCBvbmx5IGlmIHVzaW5nIG5vbi1zdGFuZGFyZCBicm93c2VyLXByb3ZpZGVkIHNjcm9sbGJhcnMsIHNvIHRoZSBncmlkIGNhbiB1c2UgdGhlIG5vbi1zdGFuZGFyZCBzaXplIGluIGl0cyBjYWxjdWxhdGlvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzY3JvbGxiYXJXaWR0aDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUeXBlIG9mIFJvdyBTZWxlY3Rpb246IGBzaW5nbGVgLCBgbXVsdGlwbGVgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U2VsZWN0aW9uOiAnc2luZ2xlJyB8ICdtdWx0aXBsZScgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgbXVsdGlwbGUgcm93cyB0byBiZSBzZWxlY3RlZCB1c2luZyBzaW5nbGUgY2xpY2suIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvd3Mgd2lsbCBub3QgYmUgZGVzZWxlY3RlZCBpZiB5b3UgaG9sZCBkb3duIGBDdHJsYCBhbmQgY2xpY2sgdGhlIHJvdyBvciBwcmVzcyBgU3BhY2VgLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvdyBzZWxlY3Rpb24gd29uJ3QgaGFwcGVuIHdoZW4gcm93cyBhcmUgY2xpY2tlZC4gVXNlIHdoZW4geW91IG9ubHkgd2FudCBjaGVja2JveCBzZWxlY3Rpb24uIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyNyBUaGlzIHByb3BlcnR5IGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBgc3VwcHJlc3NDZWxsRm9jdXNgIGluc3RlYWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgY2VsbHMgd29uJ3QgYmUgZm9jdXNhYmxlLiBUaGlzIG1lYW5zIGtleWJvYXJkIG5hdmlnYXRpb24gd2lsbCBiZSBkaXNhYmxlZCBmb3IgZ3JpZCBjZWxscywgYnV0IHJlbWFpbiBlbmFibGVkIGluIG90aGVyIGVsZW1lbnRzIG9mIHRoZSBncmlkIHN1Y2ggYXMgY29sdW1uIGhlYWRlcnMsIGZsb2F0aW5nIGZpbHRlcnMsIHRvb2wgcGFuZWxzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBvbmx5IGEgc2luZ2xlIHJhbmdlIGNhbiBiZSBzZWxlY3RlZC4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGJlIGFibGUgdG8gc2VsZWN0IHRoZSB0ZXh0IHdpdGhpbiBjZWxscy5cbiAgICAgICAgICpcbiAgICAgICAgICogICAgICoqTm90ZToqKiBXaGVuIHRoaXMgaXMgc2V0IHRvIGB0cnVlYCwgdGhlIGNsaXBib2FyZCBzZXJ2aWNlIGlzIGRpc2FibGVkLlxuICAgICAgICAgKiBEZWZhdWx0OiBgZmFsc2VgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgUmFuZ2UgU2VsZWN0aW9uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIFJhbmdlIEhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBGaWxsIEhhbmRsZS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlRmlsbEhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAneCdgIHRvIGZvcmNlIHRoZSBmaWxsIGhhbmRsZSBkaXJlY3Rpb24gdG8gaG9yaXpvbnRhbCwgb3Igc2V0IHRvIGAneSdgIHRvIGZvcmNlIHRoZSBmaWxsIGhhbmRsZSBkaXJlY3Rpb24gdG8gdmVydGljYWwuIERlZmF1bHQ6IGB4eWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbGxIYW5kbGVEaXJlY3Rpb246ICd4JyB8ICd5JyB8ICd4eScgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBwcmV2ZW50IGNlbGwgdmFsdWVzIGZyb20gYmVpbmcgY2xlYXJlZCB3aGVuIHRoZSBSYW5nZSBTZWxlY3Rpb24gaXMgcmVkdWNlZCBieSB0aGUgRmlsbCBIYW5kbGUuIERlZmF1bHQ6IGBmYWxzZWAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBkZWZpbmluZyB0aGUgb3JkZXIgaW4gd2hpY2ggc29ydGluZyBvY2N1cnMgKGlmIHNvcnRpbmcgaXMgZW5hYmxlZCkuIFZhbHVlcyBjYW4gYmUgYCdhc2MnYCwgYCdkZXNjJ2Agb3IgYG51bGxgLiBGb3IgZXhhbXBsZTogYHNvcnRpbmdPcmRlcjogWydhc2MnLCAnZGVzYyddYC4gRGVmYXVsdDogYFtudWxsLCAnYXNjJywgJ2Rlc2MnXWAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6IChTb3J0RGlyZWN0aW9uKVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNwZWNpZnkgdGhhdCB0aGUgc29ydCBzaG91bGQgdGFrZSBhY2NlbnRlZCBjaGFyYWN0ZXJzIGludG8gYWNjb3VudC4gSWYgdGhpcyBmZWF0dXJlIGlzIHR1cm5lZCBvbiB0aGUgc29ydCB3aWxsIGJlIHNsb3dlci4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlICdubyBzb3J0JyBpY29uLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIG11bHRpLXNvcnQgd2hlbiB0aGUgdXNlciBzaGlmdC1jbGlja3MgYSBjb2x1bW4gaGVhZGVyLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgbXVsdGktc29ydCB3aGVuIHRoZSB1c2VyIGNsaWNrcyBhIGNvbHVtbiBoZWFkZXIsIHJlZ2FyZGxlc3Mgb2Yga2V5IHByZXNzZXMuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnY3RybCdgIHRvIGhhdmUgbXVsdGkgc29ydGluZyB3b3JrIHVzaW5nIHRoZSBgQ3RybGAgKG9yIGBDb21tYW5kIOKMmGAgZm9yIE1hYykga2V5LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbXVsdGlTb3J0S2V5OiAnY3RybCcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydGluZyBvZiB1bi1zb3J0ZWQgZGF0YSB0byBtYXRjaCBvcmlnaW5hbCByb3cgZGF0YS4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIHRvIHVzZSBpbnNpZGUgdGhlIGdyaWQgaW5zdGVhZCBvZiB0aGUgZ3JpZCdzIGRlZmF1bHQgaWNvbnMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB8IHN0cmluZzsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGVmYXVsdCByb3cgaGVpZ2h0IGluIHBpeGVscy4gRGVmYXVsdDogYDI1YCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93SGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBzdHlsZSBwcm9wZXJ0aWVzIHRvIGFwcGx5IHRvIGFsbCByb3dzLiBTZXQgdG8gYW4gb2JqZWN0IG9mIGtleSAoc3R5bGUgbmFtZXMpIGFuZCB2YWx1ZXMgKHN0eWxlIHZhbHVlcykgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlOiBSb3dTdHlsZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzKGVzKSBmb3IgYWxsIHJvd3MuIFByb3ZpZGUgZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSBvciBhcnJheSBvZiBzdHJpbmdzIChhcnJheSBvZiBjbGFzcyBuYW1lcykuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJ1bGVzIHdoaWNoIGNhbiBiZSBhcHBsaWVkIHRvIGluY2x1ZGUgY2VydGFpbiBDU1MgY2xhc3Nlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXM6IFJvd0NsYXNzUnVsZXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBoaWdobGlnaHQgcm93cyBieSBhZGRpbmcgdGhlIGBhZy1yb3ctaG92ZXJgIENTUyBjbGFzcy4gRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVXNlcyBDU1MgYHRvcGAgaW5zdGVhZCBvZiBDU1MgYHRyYW5zZm9ybWAgZm9yIHBvc2l0aW9uaW5nIHJvd3MuIFVzZWZ1bCBpZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGlzIGNhdXNpbmcgaXNzdWVzIHN1Y2ggYXMgdXNlZCBpbiByb3cgc3Bhbm5pbmcuIERlZmF1bHQ6IGBmYWxzZWAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VHJhbnNmb3JtOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZ2hsaWdodCBjb2x1bW5zIGJ5IGFkZGluZyB0aGUgYGFnLWNvbHVtbi1ob3ZlcmAgQ1NTIGNsYXNzLiBEZWZhdWx0OiBgZmFsc2VgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YURpc3BsYXlUeXBlOiBUcmVlRGF0YURpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNQYXNzaXZlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgY29udGV4dCBtZW51LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q29udGV4dE1lbnVJdGVtczogR2V0Q29udGV4dE1lbnVJdGVtczxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgbWFpbiAnY29sdW1uIGhlYWRlcicgbWVudS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldE1haW5NZW51SXRlbXM6IEdldE1haW5NZW51SXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB1c2VyIHRvIHByb2Nlc3MgcG9wdXBzIGFmdGVyIHRoZXkgYXJlIGNyZWF0ZWQuIEFwcGxpY2F0aW9ucyBjYW4gdXNlIHRoaXMgaWYgdGhleSB3YW50IHRvLCBmb3IgZXhhbXBsZSwgcmVwb3NpdGlvbiB0aGUgcG9wdXAuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0UHJvY2Vzc1BvcHVwOiAoKHBhcmFtczogUG9zdFByb2Nlc3NQb3B1cFBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgY2VsbHMgZm9yIHRoZSBjbGlwYm9hcmQuIEhhbmR5IGlmIGZvciBleGFtcGxlIHlvdSBoYXZlIGBEYXRlYCBvYmplY3RzIHRoYXQgbmVlZCB0byBoYXZlIGEgcGFydGljdWxhciBmb3JtYXQgaWYgaW1wb3J0aW5nIGludG8gRXhjZWwuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBjbGlwYm9hcmQuICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgZ3JvdXAgaGVhZGVyIHZhbHVlcyBmb3IgdGhlIGNsaXBib2FyZC4gICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzR3JvdXBIZWFkZXJGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzR3JvdXBIZWFkZXJGb3JFeHBvcnRQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgY2VsbHMgZnJvbSB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBudW1iZXIgZmllbGRzLCBhbmQgd2FudCB0byBibG9jayBub24tbnVtYmVycyBmcm9tIGdldHRpbmcgaW50byB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRnJvbUNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBnZXQgdGhlIGRhdGEgdGhhdCB3b3VsZCBvdGhlcndpc2UgZ28gdG8gdGhlIGNsaXBib2FyZC4gVG8gYmUgdXNlZCB3aGVuIHlvdSB3YW50IHRvIGNvbnRyb2wgdGhlICdjb3B5IHRvIGNsaXBib2FyZCcgb3BlcmF0aW9uIHlvdXJzZWxmLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VuZFRvQ2xpcGJvYXJkOiAoKHBhcmFtczogU2VuZFRvQ2xpcGJvYXJkUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjb21wbGV0ZSBjb250cm9sIG9mIHRoZSBwYXN0ZSBvcGVyYXRpb24sIGluY2x1ZGluZyBjYW5jZWxsaW5nIHRoZSBvcGVyYXRpb24gKHNvIG5vdGhpbmcgaGFwcGVucykgb3IgcmVwbGFjaW5nIHRoZSBkYXRhIHdpdGggb3RoZXIgZGF0YS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtczxURGF0YT4pID0+IHN0cmluZ1tdW10gfCBudWxsKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogR3JpZCBjYWxscyB0aGlzIG1ldGhvZCB0byBrbm93IGlmIGFuIGV4dGVybmFsIGZpbHRlciBpcyBwcmVzZW50LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNFeHRlcm5hbEZpbHRlclByZXNlbnQ6ICgocGFyYW1zOiBJc0V4dGVybmFsRmlsdGVyUHJlc2VudFBhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG91bGQgcmV0dXJuIGB0cnVlYCBpZiBleHRlcm5hbCBmaWx0ZXIgcGFzc2VzLCBvdGhlcndpc2UgYGZhbHNlYC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRvZXNFeHRlcm5hbEZpbHRlclBhc3M6ICgobm9kZTogSVJvd05vZGU8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB0byBjdXN0b21pc2UgdGhlIGNoYXJ0IHRvb2xiYXIgaXRlbXMuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGFydFRvb2xiYXJJdGVtczogR2V0Q2hhcnRUb29sYmFySXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGVuYWJsZSBkaXNwbGF5aW5nIHRoZSBjaGFydCBpbiBhbiBhbHRlcm5hdGl2ZSBjaGFydCBjb250YWluZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjcmVhdGVDaGFydENvbnRhaW5lcjogKChwYXJhbXM6IENoYXJ0UmVmUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgbmF2aWdhdGlvbiAoYXJyb3cpIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dEhlYWRlcjogKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zPFREYXRhPikgPT4gKEhlYWRlclBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0SGVhZGVyOiAoKHBhcmFtczogVGFiVG9OZXh0SGVhZGVyUGFyYW1zPFREYXRhPikgPT4gKEhlYWRlclBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIG5hdmlnYXRpb24gKGFycm93KSBrZXkgd2hlbiBhIGNlbGwgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IENlbGwgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBjZWxsLiAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0Q2VsbDogKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtczxURGF0YT4pID0+IChDZWxsUG9zaXRpb24gfCBudWxsKSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgYFRhYmAga2V5IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBDZWxsIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIG51bGwgdG8gc3RheSBvbiBjdXJyZW50IGNlbGwuICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0Q2VsbDogKChwYXJhbXM6IFRhYlRvTmV4dENlbGxQYXJhbXM8VERhdGE+KSA9PiAoQ2VsbFBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjcuMiAtIFVzZSBgZ2V0TG9jYWxlVGV4dGAgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHRGdW5jOiAoKGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IHN0cmluZywgdmFyaWFibGVWYWx1ZXM/OiBzdHJpbmdbXSkgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldExvY2FsZVRleHQ6ICgocGFyYW1zOiBHZXRMb2NhbGVUZXh0UGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgd2hhdCBgZG9jdW1lbnRgIGlzIHVzZWQuIEN1cnJlbnRseSB1c2VkIGJ5IERyYWcgYW5kIERyb3AgKG1heSBleHRlbmQgdG8gb3RoZXIgcGxhY2VzIGluIHRoZSBmdXR1cmUpLiBVc2UgdGhpcyB3aGVuIHlvdSB3YW50IHRoZSBncmlkIHRvIHVzZSBhIGRpZmZlcmVudCBgZG9jdW1lbnRgIHRoYW4gdGhlIG9uZSBhdmFpbGFibGUgb24gdGhlIGdsb2JhbCBzY29wZS4gVGhpcyBjYW4gaGFwcGVuIGlmIGRvY2tpbmcgb3V0IGNvbXBvbmVudHMgKHNvbWV0aGluZyB3aGljaCBFbGVjdHJvbiBzdXBwb3J0cykgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldERvY3VtZW50OiAoKCkgPT4gRG9jdW1lbnQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBmb3JtYXQgdGhlIG51bWJlcnMgaW4gdGhlIHBhZ2luYXRpb24gcGFuZWwsIGkuZS4gJ3JvdyBjb3VudCcgYW5kICdwYWdlIG51bWJlcicgbGFiZWxzLiBUaGlzIGlzIGZvciBwYWdpbmF0aW9uIHBhbmVsIG9ubHksIHRvIGZvcm1hdCBudW1iZXJzIGluc2lkZSB0aGUgZ3JpZCdzIGNlbGxzIChpLmUuIHlvdXIgZGF0YSksIHRoZW4gdXNlIGB2YWx1ZUZvcm1hdHRlcmAgaW4gdGhlIGNvbHVtbiBkZWZpbml0aW9ucy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXI6ICgocGFyYW1zOiBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI3LjIgLSBVc2UgYGdldEdyb3VwUm93QWdnYCBpbnN0ZWFkLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dBZ2dOb2RlczogKChub2RlczogSVJvd05vZGVbXSkgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gdXNlIHdoZW4geW91IG5lZWQgYWNjZXNzIHRvIG1vcmUgdGhlbiB0aGUgY3VycmVudCBjb2x1bW4gZm9yIGFnZ3JlZ2F0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0R3JvdXBSb3dBZ2c6ICgocGFyYW1zOiBHZXRHcm91cFJvd0FnZ1BhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIChDbGllbnQtc2lkZSBSb3cgTW9kZWwgb25seSkgQWxsb3dzIGdyb3VwcyB0byBiZSBvcGVuIGJ5IGRlZmF1bHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0dyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBkZWZhdWx0IHNvcnRpbmcgb2YgZ3JvdXBzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yOiAoKHBhcmFtczogSW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yUGFyYW1zPFREYXRhPikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI3LjIgLSBVc2UgYGluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvcmAgaW5zdGVhZCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEdyb3VwT3JkZXJDb21wYXJhdG9yOiAoKG5vZGVBOiBJUm93Tm9kZTxURGF0YT4sIG5vZGVCOiBJUm93Tm9kZTxURGF0YT4pID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOCAtIFVzZSBgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sRGVmYCBpbnN0ZWFkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzU2Vjb25kYXJ5Q29sRGVmOiAoKGNvbERlZjogQ29sRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOCAtIFVzZSBgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sR3JvdXBEZWZgIGluc3RlYWQgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NTZWNvbmRhcnlDb2xHcm91cERlZjogKChjb2xHcm91cERlZjogQ29sR3JvdXBEZWY8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIHBpdm90aW5nLCB0byBhbGxvdyBjaGFuZ2luZyB0aGUgc2Vjb25kIGNvbHVtbiBkZWZpbml0aW9uLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sRGVmOiAoKGNvbERlZjogQ29sRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBwaXZvdGluZywgdG8gYWxsb3cgY2hhbmdpbmcgdGhlIHNlY29uZCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbi4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NQaXZvdFJlc3VsdENvbEdyb3VwRGVmOiAoKGNvbEdyb3VwRGVmOiBDb2xHcm91cERlZjxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdoZW4gd29ya2luZyB3aXRoIFRyZWUgRGF0YSB3aGVuIGB0cmVlRGF0YSA9IHRydWVgLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGF0YVBhdGg6IEdldERhdGFQYXRoPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNldHRpbmcgdGhlIGNoaWxkIGNvdW50IGZvciBhIGdyb3VwIHJvdy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENoaWxkQ291bnQ6ICgoZGF0YUl0ZW06IGFueSkgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHByb3ZpZGluZyBkaWZmZXJlbnQgcGFyYW1zIGZvciBkaWZmZXJlbnQgbGV2ZWxzIG9mIGdyb3VwaW5nLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXM6ICgocGFyYW1zOiBHZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc1BhcmFtcykgPT4gU2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXMpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjggVXNlIGBnZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc2AgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVTdG9yZVBhcmFtczogKChwYXJhbXM6IEdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zUGFyYW1zKSA9PiBTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtcykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBncm91cHMgdG8gYmUgb3BlbiBieSBkZWZhdWx0LiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0OiAoKHBhcmFtczogSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNhbmNlbGxpbmcgdHJhbnNhY3Rpb25zLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbjogSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU1NSTSBUcmVlIERhdGE6IEFsbG93cyBzcGVjaWZ5aW5nIHdoaWNoIHJvd3MgYXJlIGV4cGFuZGFibGUuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cDogSXNTZXJ2ZXJTaWRlR3JvdXAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNTUk0gVHJlZSBEYXRhOiBBbGxvd3Mgc3BlY2lmeWluZyBncm91cCBrZXlzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZUdyb3VwS2V5OiBHZXRTZXJ2ZXJTaWRlR3JvdXBLZXkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJldHVybiBhIGJ1c2luZXNzIGtleSBmb3IgdGhlIG5vZGUuIElmIGltcGxlbWVudGVkLCBlYWNoIHJvdyBpbiB0aGUgRE9NIHdpbGwgaGF2ZSBhbiBhdHRyaWJ1dGUgYHJvdy1pZD0nYWJjJ2Agd2hlcmUgYGFiY2AgaXMgd2hhdCB5b3UgcmV0dXJuIGFzIHRoZSBidXNpbmVzcyBrZXkuXG4gICAgICAgICAqIFRoaXMgaXMgdXNlZnVsIGZvciBhdXRvbWF0ZWQgdGVzdGluZywgYXMgaXQgcHJvdmlkZXMgYSB3YXkgZm9yIHlvdXIgdG9vbCB0byBpZGVudGlmeSByb3dzIGJhc2VkIG9uIHVuaXF1ZSBidXNpbmVzcyBrZXlzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0QnVzaW5lc3NLZXlGb3JOb2RlOiAoKG5vZGU6IElSb3dOb2RlPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI3LjEgVXNlIGBnZXRSb3dJZGAgaW5zdGVhZCAtIGhvd2V2ZXIgYmUgYXdhcmUsIGBnZXRSb3dJZCgpYCB3aWxsIGFsc28gc2V0IGdyaWQgb3B0aW9uIGBpbW11dGFibGVEYXRhPXRydWVgXG4gICAgICAgICAqIEFsbG93cyB5b3UgdG8gc2V0IHRoZSBJRCBmb3IgYSBwYXJ0aWN1bGFyIHJvdyBub2RlIGJhc2VkIG9uIHRoZSBkYXRhLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Tm9kZUlkOiBHZXRSb3dOb2RlSWRGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNldHRpbmcgdGhlIElEIGZvciBhIHBhcnRpY3VsYXIgcm93IG5vZGUgYmFzZWQgb24gdGhlIGRhdGEuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dJZDogR2V0Um93SWRGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBnZXRSb3dJZCgpIGNhbGxiYWNrIGlzIGltcGxlbWVudGVkIGFuZCBuZXcgUm93IERhdGEgaXMgc2V0LCB0aGUgZ3JpZCB3aWxsIGRpc3JlZ2FyZCBhbGwgcHJldmlvdXMgcm93cyBhbmQgdHJlYXQgdGhlIG5ldyBSb3cgRGF0YSBhcyBuZXcgZGF0YS4gQXMgYSBjb25zZXF1ZW5jZSwgYWxsIFJvdyBTdGF0ZSAoZWcgc2VsZWN0aW9uLCByZW5kZXJlZCByb3dzKSB3aWxsIGJlIHJlc2V0LiAgRGVmYXVsdDogYGZhbHNlYCAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVzZXRSb3dEYXRhT25VcGRhdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyByb3dzIGFmdGVyIHRoZXkgYXJlIGNyZWF0ZWQsIHNvIHlvdSBjYW4gZG8gZmluYWwgYWRkaW5nIG9mIGN1c3RvbSBhdHRyaWJ1dGVzIGV0Yy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NSb3dQb3N0Q3JlYXRlOiAoKHBhcmFtczogUHJvY2Vzc1Jvd1BhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHRvIGRldGVybWluZSB3aGljaCByb3dzIGFyZSBzZWxlY3RhYmxlLiBCeSBkZWZhdWx0IHJvd3MgYXJlIHNlbGVjdGFibGUsIHNvIHJldHVybiBgZmFsc2VgIHRvIG1ha2UgYSByb3cgdW4tc2VsZWN0YWJsZS4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzUm93U2VsZWN0YWJsZTogSXNSb3dTZWxlY3RhYmxlPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIE1hc3RlciBEZXRhaWwgdG8gZGV0ZXJtaW5lIGlmIGEgcm93IHNob3VsZCBiZSBhIG1hc3RlciByb3cuIElmIGBmYWxzZWAgaXMgcmV0dXJuZWQgbm8gZGV0YWlsIHJvdyB3aWxsIGV4aXN0IGZvciB0aGlzIHJvdy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzUm93TWFzdGVyOiBJc1Jvd01hc3RlcjxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGZpbGwgdmFsdWVzIGluc3RlYWQgb2Ygc2ltcGx5IGNvcHlpbmcgdmFsdWVzIG9yIGluY3JlYXNpbmcgbnVtYmVyIHZhbHVlcyB1c2luZyBsaW5lYXIgcHJvZ3Jlc3Npb24uICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsT3BlcmF0aW9uOiAoKHBhcmFtczogRmlsbE9wZXJhdGlvblBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyNy4yIFVzZSBgcG9zdFNvcnRSb3dzYCBpbnN0ZWFkICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0U29ydDogKChub2RlczogSVJvd05vZGU8VERhdGE+W10pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBwZXJmb3JtIGFkZGl0aW9uYWwgc29ydGluZyBhZnRlciB0aGUgZ3JpZCBoYXMgc29ydGVkIHRoZSByb3dzLiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnRSb3dzOiAoKHBhcmFtczogUG9zdFNvcnRSb3dzUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd1N0eWxlYCB0byBzZXQgc3R5bGUgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgQ1NTIHZhbHVlcyBvciB1bmRlZmluZWQgZm9yIG5vIHN0eWxlcy4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd1N0eWxlOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXM8VERhdGE+KSA9PiBSb3dTdHlsZSB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd0NsYXNzYCB0byBzZXQgY2xhc3MoZXMpIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSwgYXJyYXkgb2Ygc3RyaW5ncyAoYXJyYXkgb2YgY2xhc3MgbmFtZXMpIG9yIHVuZGVmaW5lZCBmb3Igbm8gY2xhc3MuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzczogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dIZWlnaHRgIHRvIHNldCBoZWlnaHQgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhIHBvc2l0aXZlIG51bWJlciBvZiBwaXhlbHMsIG9yIHJldHVybiBgbnVsbGAvYHVuZGVmaW5lZGAgdG8gdXNlIHRoZSBkZWZhdWx0IHJvdyBoZWlnaHQuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dIZWlnaHQ6ICgocGFyYW1zOiBSb3dIZWlnaHRQYXJhbXM8VERhdGE+KSA9PiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI3LjIgVXNlIGBpc0Z1bGxXaWR0aFJvd2AgaW5zdGVhZC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRnVsbFdpZHRoQ2VsbDogKChyb3dOb2RlOiBJUm93Tm9kZTxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUZWxscyB0aGUgZ3JpZCBpZiB0aGlzIHJvdyBzaG91bGQgYmUgcmVuZGVyZWQgYXMgZnVsbCB3aWR0aC4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRnVsbFdpZHRoUm93OiAoKHBhcmFtczogSXNGdWxsV2lkdGhSb3dQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIC8qKiBUaGUgdG9vbCBwYW5lbCB3YXMgaGlkZGVuIG9yIHNob3duLiBVc2UgYGFwaS5pc1Rvb2xQYW5lbFNob3dpbmcoKWAgdG8gZ2V0IHN0YXR1cy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sUGFuZWxWaXNpYmxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSB0b29sIHBhbmVsIHNpemUgaGFzIGJlZW4gY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sUGFuZWxTaXplQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFBhc3RlIG9wZXJhdGlvbiBoYXMgc3RhcnRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZVN0YXJ0OiBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlU3RhcnRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFBhc3RlIG9wZXJhdGlvbiBoYXMgZW5kZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVFbmQ6IEV2ZW50RW1pdHRlcjxQYXN0ZUVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiwgb3IgZ3JvdXAgb2YgY29sdW1ucywgd2FzIGhpZGRlbiAvIHNob3duLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZpc2libGU6IEV2ZW50RW1pdHRlcjxDb2x1bW5WaXNpYmxlRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4sIG9yIGdyb3VwIG9mIGNvbHVtbnMsIHdhcyBwaW5uZWQgLyB1bnBpbm5lZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaW5uZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaW5uZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaW5uZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uIHdhcyByZXNpemVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJlc2l6ZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5SZXNpemVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4gd2FzIG1vdmVkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Nb3ZlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSB2YWx1ZSBjb2x1bW4gd2FzIGFkZGVkIG9yIHJlbW92ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgcGl2b3QgbW9kZSBmbGFnIHdhcyBjaGFuZ2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90TW9kZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBwaXZvdCBjb2x1bW4gd2FzIGFkZGVkLCByZW1vdmVkIG9yIG9yZGVyIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiBncm91cCB3YXMgb3BlbmVkIC8gY2xvc2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkdyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVXNlciBzZXQgbmV3IGNvbHVtbnMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbmV3Q29sdW1uc0xvYWRlZDogRXZlbnRFbWl0dGVyPE5ld0NvbHVtbnNMb2FkZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBncmlkIGNvbHVtbnMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGRpc3BsYXllZCBjb2x1bW5zIGNoYW5nZWQuIFRoaXMgY2FuIHJlc3VsdCBmcm9tIGNvbHVtbnMgb3BlbiAvIGNsb3NlLCBjb2x1bW4gbW92ZSwgcGl2b3QsIGdyb3VwLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZGlzcGxheWVkQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiByZW5kZXJlZCBjb2x1bW5zIGNoYW5nZWQgKG9ubHkgY29sdW1ucyBpbiB0aGUgdmlzaWJsZSBzY3JvbGxlZCB2aWV3cG9ydCBhcmUgcmVuZGVyZWQgYnkgZGVmYXVsdCkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlydHVhbENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBTaG90Z3VuIC0gZ2V0cyBjYWxsZWQgd2hlbiBlaXRoZXIgYSkgbmV3IGNvbHVtbnMgYXJlIHNldCBvciBiKSBgY29sdW1uQXBpLmFwcGx5Q29sdW1uU3RhdGUoKWAgaXMgdXNlZCwgc28gZXZlcnl0aGluZyBoYXMgY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE9ubHkgdXNlZCBieSBBbmd1bGFyLCBSZWFjdCBhbmQgVnVlSlMgQUcgR3JpZCBjb21wb25lbnRzIChub3QgdXNlZCBpZiBkb2luZyBwbGFpbiBKYXZhU2NyaXB0KS5cbiAgICAgICAgICogSWYgdGhlIGdyaWQgcmVjZWl2ZXMgY2hhbmdlcyBkdWUgdG8gYm91bmQgcHJvcGVydGllcywgdGhpcyBldmVudCBmaXJlcyBhZnRlciB0aGUgZ3JpZCBoYXMgZmluaXNoZWQgcHJvY2Vzc2luZyB0aGUgY2hhbmdlLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbXBvbmVudFN0YXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVmFsdWUgaGFzIGNoYW5nZWQgYWZ0ZXIgZWRpdGluZyAodGhpcyBldmVudCB3aWxsIG5vdCBmaXJlIGlmIGVkaXRpbmcgd2FzIGNhbmNlbGxlZCwgZWcgRVNDIHdhcyBwcmVzc2VkKSBvclxuICAgICAgICAgKiAgaWYgY2VsbCB2YWx1ZSBoYXMgY2hhbmdlZCBhcyBhIHJlc3VsdCBvZiBjdXQsIHBhc3RlLCBjZWxsIGNsZWFyIChwcmVzc2luZyBEZWxldGUga2V5KSxcbiAgICAgICAgICogZmlsbCBoYW5kbGUsIGNvcHkgcmFuZ2UgZG93biwgdW5kbyBhbmQgcmVkby5cbiAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbFZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVmFsdWUgaGFzIGNoYW5nZWQgYWZ0ZXIgZWRpdGluZy4gT25seSBmaXJlcyB3aGVuIGByZWFkT25seUVkaXQ9dHJ1ZWAuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNlbGwncyB2YWx1ZSB3aXRoaW4gYSByb3cgaGFzIGNoYW5nZWQuIFRoaXMgZXZlbnQgY29ycmVzcG9uZHMgdG8gRnVsbCBSb3cgRWRpdGluZyBvbmx5LiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1ZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJvd1ZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1ZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIGNlbGwgaGFzIHN0YXJ0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgY2VsbCBoYXMgc3RvcHBlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSByb3cgaGFzIHN0YXJ0ZWQgKHdoZW4gcm93IGVkaXRpbmcgaXMgZW5hYmxlZCkuIFdoZW4gcm93IGVkaXRpbmcsIHRoaXMgZXZlbnQgd2lsbCBiZSBmaXJlZCBvbmNlIGFuZCBgY2VsbEVkaXRpbmdTdGFydGVkYCB3aWxsIGJlIGZpcmVkIGZvciBlYWNoIGluZGl2aWR1YWwgY2VsbC4gT25seSBmaXJlcyB3aGVuIGRvaW5nIEZ1bGwgUm93IEVkaXRpbmcuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdG9wcGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RvcHBlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBGdWxsIFJvdyBFZGl0aW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVW5kbyBvcGVyYXRpb24gaGFzIHN0YXJ0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdW5kb1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxVbmRvU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFVuZG9TdGFydGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBVbmRvIG9wZXJhdGlvbiBoYXMgZW5kZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdW5kb0VuZGVkOiBFdmVudEVtaXR0ZXI8VW5kb0VuZGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VW5kb0VuZGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSZWRvIG9wZXJhdGlvbiBoYXMgc3RhcnRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByZWRvU3RhcnRlZDogRXZlbnRFbWl0dGVyPFJlZG9TdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmVkb1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJlZG8gb3BlcmF0aW9uIGhhcyBlbmRlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByZWRvRW5kZWQ6IEV2ZW50RW1pdHRlcjxSZWRvRW5kZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSZWRvRW5kZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpbHRlciBoYXMgYmVlbiBvcGVuZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyT3BlbmVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIGFwcGxpZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgd2FzIG1vZGlmaWVkIGJ1dCBub3QgYXBwbGllZC4gVXNlZCB3aGVuIGZpbHRlcnMgaGF2ZSAnQXBwbHknIGJ1dHRvbnMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyTW9kaWZpZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGNyZWF0ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRDcmVhdGVkOiBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0Q3JlYXRlZDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBkYXRhIHJhbmdlIGZvciB0aGUgY2hhcnQgaGFzIGJlZW4gY2hhbmdlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPFREYXRhPj4oKTtcbiAgICAvKiogRm9ybWF0dGluZyBjaGFuZ2VzIGhhdmUgYmVlbiBtYWRlIGJ5IHVzZXJzIHRocm91Z2ggdGhlIEZvcm1hdCBQYW5lbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydE9wdGlvbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRPcHRpb25zQ2hhbmdlZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPFREYXRhPj4oKTtcbiAgICAvKiogQSBjaGFydCBoYXMgYmVlbiBkZXN0cm95ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnREZXN0cm95ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZDxURGF0YT4+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5RG93bmAgaGFwcGVuZWQgb24gYSBjZWxsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxLZXlEb3duRXZlbnQ8VERhdGE+IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5UHJlc3NgIGhhcHBlbmVkIG9uIGEgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsS2V5UHJlc3M6IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5UHJlc3NFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBncmlkIGhhcyBpbml0aWFsaXNlZCBhbmQgaXMgcmVhZHkgZm9yIG1vc3QgYXBpIGNhbGxzLCBidXQgbWF5IG5vdCBiZSBmdWxseSByZW5kZXJlZCB5ZXQgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFJlYWR5OiBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaXJlZCB0aGUgZmlyc3QgdGltZSBkYXRhIGlzIHJlbmRlcmVkIGludG8gdGhlIGdyaWQuIFVzZSB0aGlzIGV2ZW50IGlmIHlvdSB3YW50IHRvIGF1dG8gcmVzaXplIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY29udGVudHMgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaXJzdERhdGFSZW5kZXJlZDogRXZlbnRFbWl0dGVyPEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBzaXplIG9mIHRoZSBncmlkIGBkaXZgIGhhcyBjaGFuZ2VkLiBJbiBvdGhlciB3b3JkcywgdGhlIGdyaWQgd2FzIHJlc2l6ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFNpemVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBEaXNwbGF5ZWQgcm93cyBoYXZlIGNoYW5nZWQuIFRyaWdnZXJlZCBhZnRlciBzb3J0LCBmaWx0ZXIgb3IgdHJlZSBleHBhbmQgLyBjb2xsYXBzZSBldmVudHMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW9kZWxVcGRhdGVkOiBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBET00sIGZvciBhbnkgcmVhc29uLiBVc2UgdG8gY2xlYW4gdXAgcmVzb3VyY2VzIChpZiBhbnkpIHVzZWQgYnkgdGhlIHJvdy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsUm93UmVtb3ZlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoaWNoIHJvd3MgYXJlIHJlbmRlcmVkIGluIHRoZSBET00gaGFzIGNoYW5nZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlld3BvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgYm9keSB3YXMgc2Nyb2xsZWQgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNYWluIGJvZHkgb2YgdGhlIGdyaWQgaGFzIHN0b3BwZWQgc2Nyb2xsaW5nLCBlaXRoZXIgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbEVuZDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBXaGVuIGRyYWdnaW5nIHN0YXJ0cy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RhcnRlZDogRXZlbnRFbWl0dGVyPERyYWdTdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RvcHMuIFRoaXMgY291bGQgYmUgYW55IGFjdGlvbiB0aGF0IHVzZXMgdGhlIGdyaWQncyBEcmFnIGFuZCBEcm9wIHNlcnZpY2UsIGUuZy4gQ29sdW1uIE1vdmluZywgQ29sdW1uIFJlc2l6aW5nLCBSYW5nZSBTZWxlY3Rpb24sIEZpbGwgSGFuZGxlLCBldGMuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUcmlnZ2VyZWQgZXZlcnkgdGltZSB0aGUgcGFnaW5nIHN0YXRlIGNoYW5nZXMuIFNvbWUgb2YgdGhlIG1vc3QgY29tbW9uIHNjZW5hcmlvcyBmb3IgdGhpcyBldmVudCB0byBiZSB0cmlnZ2VyZWQgYXJlOlxuICAgICAgICAgKlxuICAgICAgICAgKiAgLSBUaGUgcGFnZSBzaXplIGNoYW5nZXMuXG4gICAgICAgICAqICAtIFRoZSBjdXJyZW50IHNob3duIHBhZ2UgaXMgY2hhbmdlZC5cbiAgICAgICAgICogIC0gTmV3IGRhdGEgaXMgbG9hZGVkIG9udG8gdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGRyYWcgaGFzIHN0YXJ0ZWQsIG9yIGRyYWdnaW5nIHdhcyBhbHJlYWR5IHN0YXJ0ZWQgYW5kIHRoZSBtb3VzZSBoYXMgcmUtZW50ZXJlZCB0aGUgZ3JpZCBoYXZpbmcgcHJldmlvdXNseSBsZWZ0IHRoZSBncmlkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbnRlcjogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbW91c2UgaGFzIG1vdmVkIHdoaWxlIGRyYWdnaW5nLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdNb3ZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbGVmdCB0aGUgZ3JpZCB3aGlsZSBkcmFnZ2luZy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTGVhdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGRyYWcgaGFzIGZpbmlzaGVkIG92ZXIgdGhlIGdyaWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VuZDogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyBncm91cCBjb2x1bW4gd2FzIGFkZGVkIG9yIHJlbW92ZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyBncm91cCB3YXMgb3BlbmVkIG9yIGNsb3NlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dHcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93R3JvdXBPcGVuZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpcmVkIHdoZW4gY2FsbGluZyBlaXRoZXIgb2YgdGhlIEFQSSBtZXRob2RzIGBleHBhbmRBbGwoKWAgb3IgYGNvbGxhcHNlQWxsKClgLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGV4cGFuZE9yQ29sbGFwc2VBbGw6IEV2ZW50RW1pdHRlcjxFeHBhbmRDb2xsYXBzZUFsbEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgY2xpZW50IGhhcyBzZXQgbmV3IHBpbm5lZCByb3cgZGF0YSBpbnRvIHRoZSBncmlkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBpbm5lZFJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI4IE5vIGxvbmdlciBmaXJlZCwgdXNlIG9uUm93RGF0YVVwZGF0ZWQgaW5zdGVhZCAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Um93RGF0YUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEYXRhQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGNsaWVudCBoYXMgdXBkYXRlZCBkYXRhIGZvciB0aGUgZ3JpZCBieSBlaXRoZXIgYSkgc2V0dGluZyBuZXcgUm93IERhdGEgb3IgYikgQXBwbHlpbmcgYSBSb3cgVHJhbnNhY3Rpb24uICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhVXBkYXRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBc3luYyB0cmFuc2FjdGlvbnMgaGF2ZSBiZWVuIGFwcGxpZWQuIENvbnRhaW5zIGEgbGlzdCBvZiBhbGwgdHJhbnNhY3Rpb24gcmVzdWx0cy4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ6IEV2ZW50RW1pdHRlcjxBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPFREYXRhPj4oKTtcbiAgICAvKiogQ2VsbCBpcyBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDbGlja2VkOiBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ2VsbCBpcyBkb3VibGUgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbERvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgZm9jdXNlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRm9jdXNlZDogRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGVudGVyZWQgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3ZlckV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGxlZnQgY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdXQ6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGRvd24gb24gY2VsbC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlRG93bkV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBpcyBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93Q2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IGlzIGRvdWJsZSBjbGlja2VkLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IGlzIHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuIFRoZSBldmVudCBjb250YWlucyB0aGUgbm9kZSBpbiBxdWVzdGlvbiwgc28gY2FsbCB0aGUgbm9kZSdzIGBpc1NlbGVjdGVkKClgIG1ldGhvZCB0byBzZWUgaWYgaXQgd2FzIGp1c3Qgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dTZWxlY3RlZDogRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBzZWxlY3Rpb24gaXMgY2hhbmdlZC4gVXNlIHRoZSBncmlkIEFQSSBgZ2V0U2VsZWN0ZWROb2RlcygpYCBvciBgZ2V0U2VsZWN0ZWRSb3dzKClgIHRvIGdldCB0aGUgbmV3IGxpc3Qgb2Ygc2VsZWN0ZWQgbm9kZXMgLyByb3cgZGF0YS4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8U2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgcmlnaHQgY2xpY2tlZC4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY2hhbmdlIHRvIHJhbmdlIHNlbGVjdGlvbiBoYXMgb2NjdXJyZWQuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBTb3J0IGhhcyBjaGFuZ2VkLiBUaGUgZ3JpZCBhbHNvIGxpc3RlbnMgZm9yIHRoaXMgYW5kIHVwZGF0ZXMgdGhlIG1vZGVsLiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHNvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8U29ydENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcblxuXG4gICAgLy8gRW5hYmxlIHR5cGUgY29lcmNpb24gZm9yIGJvb2xlYW4gSW5wdXRzIHRvIHN1cHBvcnQgdXNlIGxpa2UgJ2VuYWJsZUNoYXJ0cycgaW5zdGVhZCBvZiBmb3JjaW5nICdbZW5hYmxlQ2hhcnRzXT1cInRydWVcIicgXG4gICAgLy8gaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3RlbXBsYXRlLXR5cGVjaGVjayNpbnB1dC1zZXR0ZXItY29lcmNpb24gXG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDZWxsRm9jdXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVidWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91blNvcnRJY29uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzTXVsdGlTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTG9hZGluZ092ZXJsYXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2tpcEhlYWRlck9uQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUGFyZW50c0luUm93Tm9kZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uTW92ZUFuaW1hdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZhYmxlQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGaWVsZERvdE5vdGF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUmFuZ2VIYW5kbGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUZpbGxIYW5kbGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xlYXJPbkZpbGxSZWR1Y3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlbHRhU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NUb3VjaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBc3luY0V2ZW50czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbnRleHRNZW51OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZW1lbWJlckdyb3VwU3RhdGVXaGVuTmV3RGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dHcm91cEhpZGVzQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29weVJvd3NUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29weUhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29weUdyb3VwSGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9waXZvdE1vZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWdnRnVuY0luSGVhZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0F0Um9vdExldmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9mdW5jdGlvbnNQYXNzaXZlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9mdW5jdGlvbnNSZWFkT25seTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYW5pbWF0ZVJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU2VsZWN0c0ZpbHRlcmVkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSdGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnRW50aXJlUm93OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dEcmFnOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vdmVXaGVuUm93RHJhZ2dpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdNdWx0aVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlR3JvdXBFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUGFnaW5hdGlvblBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEhpZGVPcGVuUGFyZW50czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBBbGxvd1VuYmFsYW5jZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2luYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2luYXRpb25BdXRvUGFnZVNpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2Nyb2xsT25OZXdEYXRhOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Njcm9sbFdoZW5Qb3B1cHNBcmVPcGVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wdXJnZUNsb3NlZFJvd05vZGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jYWNoZVF1aWNrRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9leGNsdWRlSGlkZGVuQ29sdW1uc0Zyb21RdWlja0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5zdXJlRG9tT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FjY2VudGVkU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlQ2FjaGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlQ2FjaGVOZXZlckV4cGlyZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FnZ3JlZ2F0ZU9ubHlDaGFuZ2VkQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDc3ZFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3RyZWVEYXRhOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXN0ZXJEZXRhaWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW50ZXJNb3Zlc0Rvd25BZnRlckVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTW92ZXNEb3duOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Byb3BlcnR5TmFtZXNDaGVjazogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93SG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93VHJhbnNmb3JtOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaXBib2FyZFBhc3RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0xhc3RFbXB0eUxpbmVPblBhc3RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDaGFydHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNoYXJ0VG9vbFBhbmVsc0J1dHRvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDaGFydFRvb2xQYW5lbHNCdXR0b246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90b29sdGlwTW91c2VUcmFjazogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfa2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2luYXRlQ2hpbGRSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wcmV2ZW50RGVmYXVsdE9uQ29udGV4dE1lbnU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3VuZG9SZWRvQ2VsbEVkaXRpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93RHJhZ0Zyb21Db2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbW11dGFibGVEYXRhOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9waXZvdFN1cHByZXNzQXV0b0NvbHVtbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NFeHBhbmRhYmxlUGl2b3RHcm91cHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlYm91bmNlVmVydGljYWxTY3JvbGxiYXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVGaWx0ZXJpbmdBbHdheXNSZXNldHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0aW5nQWx3YXlzUmVzZXRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlU29ydEFsbExldmVsczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUZpbHRlckFsbExldmVsczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZVNvcnRPblNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUZpbHRlck9uU2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0ZpbHRlcmVkT25seTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2hvd09wZW5lZEdyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaXBib2FyZEFwaTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb2RlbFVwZGF0ZUFmdGVyVXBkYXRlVHJhbnNhY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N0b3BFZGl0aW5nV2hlbkNlbGxzTG9zZUZvY3VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYWludGFpbkNvbHVtbk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cE1haW50YWluT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvbHVtbkhvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZWFjdFVpOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1JlYWN0VWk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3JlYWRPbmx5RWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dWaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbEVkaXRpbmdPbkJhY2tzcGFjZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVzZXRSb3dEYXRhT25VcGRhdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3JlbW92ZVBpdm90SGVhZGVyUm93V2hlblNpbmdsZVZhbHVlQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvcHlTaW5nbGVDZWxsUmFuZ2VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFJvd3NTdGlja3k6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dHcm91cFBhbmVsU3VwcHJlc3NTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbGxvd1Nob3dDaGFuZ2VBZnRlckZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICAvLyBARU5EQFxufVxuXG4iXX0=