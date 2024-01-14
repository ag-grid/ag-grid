import { Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { AgPromise, ComponentUtil, ColumnApi, createGrid } from "ag-grid-community";
// @END_IMPORTS@
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import * as i0 from "@angular/core";
import * as i1 from "./angularFrameworkOverrides";
import * as i2 from "./angularFrameworkComponentWrapper";
export class AgGridAngular {
    constructor(elementDef, viewContainerRef, angularFrameworkOverrides, frameworkComponentWrapper) {
        this.viewContainerRef = viewContainerRef;
        this.angularFrameworkOverrides = angularFrameworkOverrides;
        this.frameworkComponentWrapper = frameworkComponentWrapper;
        this._initialised = false;
        this._destroyed = false;
        // in order to ensure firing of gridReady is deterministic
        this._fullyReady = AgPromise.resolve(true);
        // @START@
        /** Specifies the status bar components to use in the status bar.
             */
        this.statusBar = undefined;
        /** Specifies the side bar components.
             */
        this.sideBar = undefined;
        /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu.
             * @default false
             */
        this.suppressContextMenu = undefined;
        /** When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
             * This flag is useful to prevent the browser from showing its default context menu.
             * @default false
             */
        this.preventDefaultOnContextMenu = undefined;
        /** Allows context menu to show, even when `Ctrl` key is held down.
             * @default false
             */
        this.allowContextMenuWithControlKey = undefined;
        /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header.
             * @default false
             */
        this.suppressMenuHide = undefined;
        /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component.
             * @default false
             * @initial
             */
        this.enableBrowserTooltips = undefined;
        /** The trigger that will cause tooltips to show and hide.
             *  - `hover` - The tooltip will show/hide when a cell/header is hovered.
             *  - `focus` - The tooltip will show/hide when a cell/header is focused.
             * @default 'hover'
             * @initial
             */
        this.tooltipTrigger = undefined;
        /** The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
             *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
             * @default 2000
             */
        this.tooltipShowDelay = undefined;
        /** The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
             *     **Note:** This property does not work if `enableBrowserTooltips` is `true` and `tooltipHideTriggers` includes `timeout`.
             * @default 10000
             */
        this.tooltipHideDelay = undefined;
        /** Set to `true` to have tooltips follow the cursor once they are displayed.
             * @default false
             * @initial
             */
        this.tooltipMouseTrack = undefined;
        /** Set to `true` to enable tooltip interaction. When this option is enabled, the tooltip will not hide while the
             * tooltip itself it being hovered or has focus.
             * @default false
             * @initial
             */
        this.tooltipInteraction = undefined;
        /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).
             */
        this.popupParent = undefined;
        /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard.
             * @default false
             */
        this.copyHeadersToClipboard = undefined;
        /** Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard.
             * @default false
             */
        this.copyGroupHeadersToClipboard = undefined;
        /** Specify the delimiter to use when copying to clipboard.
             * @default '\t'
            */
        this.clipboardDelimiter = undefined;
        /** Set to `true` to copy the cell range or focused cell to the clipboard and never the selected rows.
             * @default false
             */
        this.suppressCopyRowsToClipboard = undefined;
        /** Set to `true` to copy rows instead of ranges when a range with only a single cell is selected.
             * @default false
             */
        this.suppressCopySingleCellRanges = undefined;
        /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard.
             * @default false
             */
        this.suppressLastEmptyLineOnPaste = undefined;
        /** Set to `true` to turn off paste operations within the grid.
             * @default false
             */
        this.suppressClipboardPaste = undefined;
        /** Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround.
             * @default false
             */
        this.suppressClipboardApi = undefined;
        /** Set to `true` to block     **cut** operations within the grid.
             * @default false
             */
        this.suppressCutToClipboard = undefined;
        /** Array of Column / Column Group definitions.
             */
        this.columnDefs = undefined;
        /** A default column definition. Items defined in the actual column definitions get precedence.
             */
        this.defaultColDef = undefined;
        /** A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence.
             * @initial
             */
        this.defaultColGroupDef = undefined;
        /** An object map of custom column types which contain groups of properties that column definitions can reuse by referencing in their `type` property.
             */
        this.columnTypes = undefined;
        /** An object map of cell data types to their definitions.
             * Cell data types can either override/update the pre-defined data types
             * (`'text'`, `'number'`,  `'boolean'`,  `'date'`,  `'dateString'` or  `'object'`),
             * or can be custom data types.
             */
        this.dataTypeDefinitions = undefined;
        /** Keeps the order of Columns maintained after new Column Definitions are updated.
             * @default false
             */
        this.maintainColumnOrder = undefined;
        /** If `true`, then dots in field names (e.g. `'address.firstLine'`) are not treated as deep references. Allows you to use dots in your field name if you prefer.
             * @default false
             */
        this.suppressFieldDotNotation = undefined;
        /** The height in pixels for the row containing the column label header. If not specified, it uses the theme value of `header-height`.
             */
        this.headerHeight = undefined;
        /** The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`.
             */
        this.groupHeaderHeight = undefined;
        /** The height in pixels for the row containing the floating filters. If not specified, it uses the theme value of `header-height`.
             */
        this.floatingFiltersHeight = undefined;
        /** The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`.
             */
        this.pivotHeaderHeight = undefined;
        /** The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`.
             */
        this.pivotGroupHeaderHeight = undefined;
        /** Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid.
             * @default false
             */
        this.allowDragFromColumnsToolPanel = undefined;
        /** Set to `true` to suppress column moving, i.e. to make the columns fixed position.
             * @default false
             */
        this.suppressMovableColumns = undefined;
        /** If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns.
             * @default false
             */
        this.suppressColumnMoveAnimation = undefined;
        /** If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden.
             * @default false
             */
        this.suppressDragLeaveHidesColumns = undefined;
        /** If `true`, when you drag a column into a row group panel the column is not hidden.
             * @default false
             */
        this.suppressRowGroupHidesColumns = undefined;
        /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing).
             */
        this.colResizeDefault = undefined;
        /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size.
             * @default false
             * @initial
             */
        this.suppressAutoSize = undefined;
        /** Number of pixels to add to a column width after the [auto-sizing](/column-sizing/#auto-size-columns-to-fit-cell-contents) calculation.
             * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
             * @default 20
             */
        this.autoSizePadding = undefined;
        /** Set this to `true` to skip the `headerName` when `autoSize` is called by default.
             * @default false
             * @initial
             */
        this.skipHeaderOnAutoSize = undefined;
        /** Auto-size the columns when the grid is loaded. Can size to fit the grid width, fit a provided width, or fit the cell contents.
             * @initial
             */
        this.autoSizeStrategy = undefined;
        /** A map of component names to components.
             * @initial
             */
        this.components = undefined;
        /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.
             */
        this.editType = undefined;
        /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click.
             * @default false
             */
        this.singleClickEdit = undefined;
        /** Set to `true` so that neither single nor double click starts editing.
             * @default false
             */
        this.suppressClickEdit = undefined;
        /** Set to `true` to stop the grid updating data after `Edit`, `Clipboard` and `Fill Handle` operations. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid. <br />**Note:** `rowNode.setDataValue()` does not update the value of the cell when this is `True`, it fires `onCellEditRequest` instead.
             * @default false
             */
        this.readOnlyEdit = undefined;
        /** Set this to `true` to stop cell editing when grid loses focus.
             * The default is that the grid stays editing until focus goes onto another cell.
             * @default false
             * @initial
             */
        this.stopEditingWhenCellsLoseFocus = undefined;
        /** @deprecated As of v30, no longer used. To navigate with the Enter key use `enterNavigatesVertically`.
             */
        this.enterMovesDown = undefined;
        /** @deprecated As of v30, no longer used. To navigate with the Enter key after edit use `enterNavigatesVerticallyAfterEdit`.
             */
        this.enterMovesDownAfterEdit = undefined;
        /** Set to `true` along with `enterNavigatesVerticallyAfterEdit` to have Excel-style behaviour for the `Enter` key.
             * i.e. pressing the `Enter` key will move down to the cell beneath and `Shift+Enter` will move up to the cell above.
             * @default false
             */
        this.enterNavigatesVertically = undefined;
        /** Set to `true` along with `enterNavigatesVertically` to have Excel-style behaviour for the 'Enter' key.
             * i.e. pressing the Enter key will move down to the cell beneath and Shift+Enter key will move up to the cell above.
             * @default false
             */
        this.enterNavigatesVerticallyAfterEdit = undefined;
        /** Forces Cell Editing to start when backspace is pressed. This is only relevant for MacOS users.
             */
        this.enableCellEditingOnBackspace = undefined;
        /** Set to `true` to enable Undo / Redo while editing.
             * @initial
             */
        this.undoRedoCellEditing = undefined;
        /** Set the size of the undo / redo stack.
             * @default 10
             * @initial
             */
        this.undoRedoCellEditingLimit = undefined;
        /** A default configuration object used to export to CSV.
             */
        this.defaultCsvExportParams = undefined;
        /** Prevents the user from exporting the grid to CSV.
             * @default false
             */
        this.suppressCsvExport = undefined;
        /** A default configuration object used to export to Excel.
             */
        this.defaultExcelExportParams = undefined;
        /** Prevents the user from exporting the grid to Excel.
             * @default false
             */
        this.suppressExcelExport = undefined;
        /** A list (array) of Excel styles to be used when exporting to Excel with styles.
             * @initial
             */
        this.excelStyles = undefined;
        /** Rows are filtered using this text as a Quick Filter.
             */
        this.quickFilterText = undefined;
        /** Set to `true` to turn on the Quick Filter cache, used to improve performance when using the Quick Filter.
             * @default false
             * @initial
             */
        this.cacheQuickFilter = undefined;
        /** @deprecated As of v30, hidden columns are excluded from the Quick Filter by default. This can be toggled using `includeHiddenColumnsInQuickFilter`.
             * @initial
             */
        this.excludeHiddenColumnsFromQuickFilter = undefined;
        /** Hidden columns are excluded from the Quick Filter by default.
             * To include hidden columns, set to `true`.
             * @default false
             */
        this.includeHiddenColumnsInQuickFilter = undefined;
        /** Changes how the Quick Filter splits the Quick Filter text into search terms.
             */
        this.quickFilterParser = undefined;
        /** Changes the matching logic for whether a row passes the Quick Filter.
             */
        this.quickFilterMatcher = undefined;
        /** Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results.
             * @default false
             */
        this.excludeChildrenWhenTreeDataFiltering = undefined;
        /** Set to true to enable the Advanced Filter.
             * @default false
             */
        this.enableAdvancedFilter = undefined;
        /** @deprecated As of v31, use `initialState.filter.advancedFilterModel` instead.
             * @initial
             */
        this.advancedFilterModel = undefined;
        /** Hidden columns are excluded from the Advanced Filter by default.
             * To include hidden columns, set to `true`.
             * @default false
             */
        this.includeHiddenColumnsInAdvancedFilter = undefined;
        /** DOM element to use as the parent for the Advanced Filter to allow it to appear outside of the grid.
             * Set to `null` or `undefined` to appear inside the grid.
             */
        this.advancedFilterParent = undefined;
        /** Customise the parameters passed to the Advanced Filter Builder.
             */
        this.advancedFilterBuilderParams = undefined;
        /** Set to `true` to Enable Charts.
             * @default false
             */
        this.enableCharts = undefined;
        /** The list of chart themes that a user can choose from in the chart settings panel.
             * @default ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
             * @initial
             */
        this.chartThemes = undefined;
        /** A map containing custom chart themes.
             * @initial
             */
        this.customChartThemes = undefined;
        /** Chart theme overrides applied to all themes.
             * @initial
             */
        this.chartThemeOverrides = undefined;
        /** @deprecated As of v29, no longer used. To suppress use `suppressChartToolPanelsButton`.
             * @initial
             */
        this.enableChartToolPanelsButton = undefined;
        /** Set to `true` to show the 'hamburger' menu option from the Chart Toolbar and display the remaining toolbar buttons.
             * @default false
             * @initial
             */
        this.suppressChartToolPanelsButton = undefined;
        /** Allows customisation of the Chart Tool Panels, such as changing the tool panels visibility and order, as well as choosing which charts should be displayed in the settings panel.
             * @initial
             */
        this.chartToolPanelsDef = undefined;
        /** Provide your own loading cell renderer to use when data is loading via a DataSource.
             * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.
             */
        this.loadingCellRenderer = undefined;
        /** Params to be passed to the `loadingCellRenderer` component.
             */
        this.loadingCellRendererParams = undefined;
        /** Callback to select which loading cell renderer to be used when data is loading via a DataSource.
             * @initial
             */
        this.loadingCellRendererSelector = undefined;
        /** A map of key->value pairs for localising text within the grid.
             * @initial
             */
        this.localeText = undefined;
        /** Set to `true` to enable Master Detail.
             * @default false
             */
        this.masterDetail = undefined;
        /** Set to `true` to keep detail rows for when they are displayed again.
             * @default false
             * @initial
             */
        this.keepDetailRows = undefined;
        /** Sets the number of details rows to keep.
             * @default 10
             * @initial
             */
        this.keepDetailRowsCount = undefined;
        /** Provide a custom `detailCellRenderer` to use when a master row is expanded.
             * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.
             */
        this.detailCellRenderer = undefined;
        /** Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params.
             */
        this.detailCellRendererParams = undefined;
        /** Set fixed height in pixels for each detail row.
             * @initial
             */
        this.detailRowHeight = undefined;
        /** Set to `true` to have the detail grid dynamically change it's height to fit it's rows.
             * @initial
             */
        this.detailRowAutoHeight = undefined;
        /** Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks by your application.
             * @initial
             */
        this.context = undefined;
        /**
             * A list of grids to treat as Aligned Grids.
             * Provide a list if the grids / apis already exist or return via a callback to allow the aligned grids to be retrieved asynchronously.
             * If grids are aligned then the columns and horizontal scrolling will be kept in sync.
             */
        this.alignedGrids = undefined;
        /** Change this value to set the tabIndex order of the Grid within your application.
             * @default 0
             * @initial
             */
        this.tabIndex = undefined;
        /** The number of rows rendered outside the viewable area the grid renders.
             * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
             * @default 10
             */
        this.rowBuffer = undefined;
        /** Set to `true` to turn on the value cache.
             * @default false
             * @initial
             */
        this.valueCache = undefined;
        /** Set to `true` to configure the value cache to not expire after data updates.
             * @default false
             * @initial
             */
        this.valueCacheNeverExpires = undefined;
        /** Set to `true` to allow cell expressions.
             * @default false
             * @initial
             */
        this.enableCellExpressions = undefined;
        /** @deprecated v30.2 If `true`, row nodes do not have their parents set.
             * The grid doesn't use the parent reference, but it is included to help the client code navigate the node tree if it wants by providing bi-direction navigation up and down the tree.
             * If this is a problem (e.g. if you need to convert the tree to JSON, which does not allow cyclic dependencies) then set this to `true`.
             * @default false
             * @initial
             */
        this.suppressParentsInRowNodes = undefined;
        /** Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch).
             * @default false
             * @initial
             */
        this.suppressTouch = undefined;
        /** Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser.
             * @default false
             */
        this.suppressFocusAfterRefresh = undefined;
        /** Disables the asynchronous nature of the events introduced in v10, and makes them synchronous. This property only exists for the purpose of supporting legacy code which has a dependency on synchronous events from earlier versions (v9 or earlier) of AG Grid.     **It is strongly recommended that you do not change this property unless you have legacy issues.**
             * @deprecated v31 Events should be handled asynchronously.
             * @default false
             * @initial
             */
        this.suppressAsyncEvents = undefined;
        /** The grid will check for `ResizeObserver` and use it if it exists in the browser, otherwise it will use the grid's alternative implementation. Some users reported issues with Chrome's `ResizeObserver`. Use this property to always use the grid's alternative implementation should such problems exist.
             * @default false
             * @initial
             */
        this.suppressBrowserResizeObserver = undefined;
        /** Disables showing a warning message in the console if using a `gridOptions` or `colDef` property that doesn't exist.
             * @default false
             * @initial
             */
        this.suppressPropertyNamesCheck = undefined;
        /** Disables change detection.
             * @default false
             */
        this.suppressChangeDetection = undefined;
        /** Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems.
             * @default false
             * @initial
             */
        this.debug = undefined;
        /** Provide a template for 'loading' overlay.
             */
        this.overlayLoadingTemplate = undefined;
        /** Provide a custom loading overlay component.
             * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-loading-overlay-component) for framework specific implementation details.
             * @initial
             */
        this.loadingOverlayComponent = undefined;
        /** Customise the parameters provided to the loading overlay component.
             */
        this.loadingOverlayComponentParams = undefined;
        /** Disables the 'loading' overlay.
             * @default false
             * @initial
             */
        this.suppressLoadingOverlay = undefined;
        /** Provide a template for 'no rows' overlay.
             */
        this.overlayNoRowsTemplate = undefined;
        /** Provide a custom no rows overlay component.
             * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-no-rows-overlay-component) for framework specific implementation details.
             * @initial
             */
        this.noRowsOverlayComponent = undefined;
        /** Customise the parameters provided to the no rows overlay component.
             */
        this.noRowsOverlayComponentParams = undefined;
        /** Disables the 'no rows' overlay.
             * @default false
             */
        this.suppressNoRowsOverlay = undefined;
        /** Set whether pagination is enabled.
             * @default false
             */
        this.pagination = undefined;
        /** How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored.
             * @default 100
             */
        this.paginationPageSize = undefined;
        /** Determines if the page size selector is shown in the pagination panel or not.
             * Set to an array of values to show the page size selector with custom list of possible page sizes.
             * Set to `true` to show the page size selector with the default page sizes `[20, 50, 100]`.
             * Set to `false` to hide the page size selector.
             * @default true
             * @initial
             */
        this.paginationPageSizeSelector = undefined;
        /** Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used.
             * @default false
             */
        this.paginationAutoPageSize = undefined;
        /** Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail.
             * @default false
             * @initial
             */
        this.paginateChildRows = undefined;
        /** If `true`, the default grid controls for navigation are hidden.
             * This is useful if `pagination=true` and you want to provide your own pagination controls.
             * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.
             * @default false
             */
        this.suppressPaginationPanel = undefined;
        /** Set to `true` to enable pivot mode.
             * @default false
             */
        this.pivotMode = undefined;
        /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off.
             * @default 'never'
             * @initial
             */
        this.pivotPanelShow = undefined;
        /** If pivoting, set to the number of column group levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything.
             * @default 0
             */
        this.pivotDefaultExpanded = undefined;
        /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified.
             */
        this.pivotColumnGroupTotals = undefined;
        /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified.
             */
        this.pivotRowTotals = undefined;
        /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column.
             * @default false
             * @initial
             */
        this.pivotSuppressAutoColumn = undefined;
        /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups.
             * @default false
             * @initial
             */
        this.suppressExpandablePivotGroups = undefined;
        /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection.
             * @default false
             */
        this.functionsReadOnly = undefined;
        /** A map of 'function name' to 'function' for custom aggregation functions.
             * @initial
             */
        this.aggFuncs = undefined;
        /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`.
             * @default false
             * @initial
             */
        this.suppressAggFuncInHeader = undefined;
        /** When using aggregations, the grid will always calculate the root level aggregation value.
             * @default false
             */
        this.alwaysAggregateAtRootLevel = undefined;
        /** @deprecated v30 - made default and toggled via alwaysAggregateAtRootLevel
             * @initial
             */
        this.suppressAggAtRootLevel = undefined;
        /** When using change detection, only the updated column will be re-aggregated.
             * @default false
             */
        this.aggregateOnlyChangedColumns = undefined;
        /** Set to `true` so that aggregations are not impacted by filtering.
             * @default false
             */
        this.suppressAggFilteredOnly = undefined;
        /** Set to `true` to omit the value Column header when there is only a single value column.
             * @default false
             * @initial
             */
        this.removePivotHeaderRowWhenSingleValueColumn = undefined;
        /** Set to `false` to disable Row Animation which is enabled by default.
             * @default true
             */
        this.animateRows = undefined;
        /** Set to `true` to have cells flash after data changes.
             * @default false
             */
        this.enableCellChangeFlash = undefined;
        /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long a cell should remain in its "flashed" state.
             * @default 500
             */
        this.cellFlashDelay = undefined;
        /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `cellFlashDelay` has completed.
             * @default 1000
             */
        this.cellFadeDelay = undefined;
        /** Set to `true` to have cells flash after data changes even when the change is due to filtering.
             * @default false
             * @initial
             */
        this.allowShowChangeAfterFilter = undefined;
        /** Switch between layout options: `normal`, `autoHeight`, `print`.
             * @default 'normal'
             */
        this.domLayout = undefined;
        /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen.
             * Disables row animations.
             * @default false
             * @initial
             */
        this.ensureDomOrder = undefined;
        /** Set to `true` to operate the grid in RTL (Right to Left) mode.
             * @default false
             * @initial
             */
        this.enableRtl = undefined;
        /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered.
             * @default false
             * @initial
             */
        this.suppressColumnVirtualisation = undefined;
        /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
             * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen), or `suppressRowVirtualisation` is true, or if your grid height is able to display more than 500 rows at once.**
             * @default false
             * @initial
             */
        this.suppressMaxRenderedRowRestriction = undefined;
        /** Set to `true` so that the grid doesn't virtualise the rows. For example, if you have 100 rows, but only 10 visible due to scrolling, all 100 will always be rendered.
             * @default false
             * @initial
             */
        this.suppressRowVirtualisation = undefined;
        /** Set to `true` to enable Managed Row Dragging.
             * @default false
             */
        this.rowDragManaged = undefined;
        /** Set to `true` to suppress row dragging.
             * @default false
             */
        this.suppressRowDrag = undefined;
        /** Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up.
             * @default false
             */
        this.suppressMoveWhenRowDragging = undefined;
        /** Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle.
             * @default false
             */
        this.rowDragEntireRow = undefined;
        /** Set to `true` to enable dragging multiple rows at the same time.
             * @default false
             */
        this.rowDragMultiRow = undefined;
        /** A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
             * If this callback is not set, the current cell value will be used.
             * If the `rowDragText` callback is set in the ColDef it will take precedence over this, except when
             * `rowDragEntireRow=true`.
             * @initial
             */
        this.rowDragText = undefined;
        /** Provide your own cell renderer component to use for full width rows.
             * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.
             */
        this.fullWidthCellRenderer = undefined;
        /** Customise the parameters provided to the `fullWidthCellRenderer` component.
             */
        this.fullWidthCellRendererParams = undefined;
        /** Set to `true` to have the Full Width Rows embedded in grid's main container so they can be scrolled horizontally.
             */
        this.embedFullWidthRows = undefined;
        /** @deprecated v31
             * When enabled, the grid will cast group values to string type.
             * @default false
             * @initial
             */
        this.suppressGroupMaintainValueType = undefined;
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
        /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything.
             * @default 0
             */
        this.groupDefaultExpanded = undefined;
        /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included.
             */
        this.autoGroupColumnDef = undefined;
        /** When `true`, preserves the current group order when sorting on non-group columns.
             * @default false
             */
        this.groupMaintainOrder = undefined;
        /** When `true`, if you select a group, the children of the group will also be selected.
             * @default false
             */
        this.groupSelectsChildren = undefined;
        /** If grouping, locks the group settings of a number of columns, e.g. `0` for no group locking. `1` for first group column locked, `-1` for all group columns locked.
             * @default 0
             * @initial
             */
        this.groupLockGroupColumns = undefined;
        /** Set to determine whether filters should be applied on aggregated group values.
             * @default false
             */
        this.groupAggFiltering = undefined;
        /** If grouping, this controls whether to show a group footer when the group is expanded.
             * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
             * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
             * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.
             * If a callback function is provided, it can used to select which groups will have a footer added.
             * @default false
             */
        this.groupIncludeFooter = undefined;
        /** Set to `true` to show a 'grand total' group footer across all groups.
             * @default false
             */
        this.groupIncludeTotalFooter = undefined;
        /** If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand.
             * @default false
             */
        this.groupSuppressBlankHeader = undefined;
        /** If using `groupSelectsChildren`, then only the children that pass the current filter will get selected.
             * @default false
             */
        this.groupSelectsFiltered = undefined;
        /** Shows the open group in the group column for non-group rows.
             * @default false
             */
        this.showOpenedGroup = undefined;
        /** Set to `true` to collapse groups that only have one child.
             * @default false
             */
        this.groupRemoveSingleChildren = undefined;
        /** Set to `true` to collapse lowest level groups that only have one child.
             * @default false
             */
        this.groupRemoveLowestSingleChildren = undefined;
        /** Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience.
             * @default false
             */
        this.groupHideOpenParents = undefined;
        /** Set to `true` to prevent the grid from creating a '(Blanks)' group for nodes which do not belong to a group, and display the unbalanced nodes alongside group nodes.
             * @default false
             */
        this.groupAllowUnbalanced = undefined;
        /** When to show the 'row group panel' (where you drag rows to group) at the top.
             * @default 'never'
             */
        this.rowGroupPanelShow = undefined;
        /** Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
             * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.
             */
        this.groupRowRenderer = undefined;
        /** Customise the parameters provided to the `groupRowRenderer` component.
             */
        this.groupRowRendererParams = undefined;
        /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping.
             * @default false
             */
        this.suppressMakeColumnVisibleAfterUnGroup = undefined;
        /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.
             * @default false
             */
        this.treeData = undefined;
        /** Set to `true` to suppress sort indicators and actions from the row group panel.
             * @default false
             * @initial
             */
        this.rowGroupPanelSuppressSort = undefined;
        /** Set to `true` prevent Group Rows from sticking to the top of the grid.
             * @default false
             * @initial
             */
        this.suppressGroupRowsSticky = undefined;
        /** Data to be displayed as pinned top rows in the grid.
             */
        this.pinnedTopRowData = undefined;
        /** Data to be displayed as pinned bottom rows in the grid.
             */
        this.pinnedBottomRowData = undefined;
        /** Sets the row model type.
             * @default 'clientSide'
             * @initial
             */
        this.rowModelType = undefined;
        /** Set the data to be displayed as rows in the grid.
             */
        this.rowData = undefined;
        /** How many milliseconds to wait before executing a batch of async transactions.
             */
        this.asyncTransactionWaitMillis = undefined;
        /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates.
             * @default false
             */
        this.suppressModelUpdateAfterUpdateTransaction = undefined;
        /** Provide the datasource for infinite scrolling.
             */
        this.datasource = undefined;
        /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
             * @default 1
             * @initial
             */
        this.cacheOverflowSize = undefined;
        /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
             * @default 1
             * @initial
             */
        this.infiniteInitialRowCount = undefined;
        /** Set how many loading rows to display to the user for the root level group.
             * @default 1
             * @initial
             */
        this.serverSideInitialRowCount = undefined;
        /** When `true`, the Server-side Row Model will suppress Infinite Scrolling and load all the data at the current level.
             * @default false
             * @initial
             */
        this.suppressServerSideInfiniteScroll = undefined;
        /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
             * @default 100
             */
        this.cacheBlockSize = undefined;
        /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.
             * @initial
             */
        this.maxBlocksInCache = undefined;
        /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.
             * Set to `-1` for no maximum restriction on requests.
             * @default 2
             * @initial
             */
        this.maxConcurrentDatasourceRequests = undefined;
        /** How many milliseconds to wait before loading a block. Useful when scrolling over many blocks, as it prevents blocks loading until scrolling has settled.
             * @initial
             */
        this.blockLoadDebounceMillis = undefined;
        /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping.
             * @default false
             */
        this.purgeClosedRowNodes = undefined;
        /** Provide the `serverSideDatasource` for server side row model.
             */
        this.serverSideDatasource = undefined;
        /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server.
             * @default false
             */
        this.serverSideSortAllLevels = undefined;
        /** When enabled, only refresh groups directly impacted by a filter. This property only applies when there is Row Grouping & filtering is handled on the server.
             * @default false
             * @initial
             */
        this.serverSideOnlyRefreshFilteredGroups = undefined;
        /** @deprecated v30 This property has been deprecated. Use `serverSideOnlyRefreshFilteredGroups` instead.
             */
        this.serverSideFilterAllLevels = undefined;
        /**
             * When enabled, Sorting will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
             * @default false
             */
        this.serverSideSortOnServer = undefined;
        /** When enabled, Filtering will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
             * @default false
             */
        this.serverSideFilterOnServer = undefined;
        /** Used to split pivot field strings for generating pivot result columns when `pivotResultFields` is provided as part of a `getRows` success.
             * @default '_'
             * @initial
             */
        this.serverSidePivotResultFieldSeparator = undefined;
        /** To use the viewport row model you need to provide the grid with a `viewportDatasource`.
             */
        this.viewportDatasource = undefined;
        /** When using viewport row model, sets the page size for the viewport.
             * @initial
             */
        this.viewportRowModelPageSize = undefined;
        /** When using viewport row model, sets the buffer size for the viewport.
             * @initial
             */
        this.viewportRowModelBufferSize = undefined;
        /** Set to `true` to always show the horizontal scrollbar.
             * @default false
             */
        this.alwaysShowHorizontalScroll = undefined;
        /** Set to `true` to always show the vertical scrollbar.
             * @default false
             */
        this.alwaysShowVerticalScroll = undefined;
        /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on slow machines.
             * @default false
             * @initial
             */
        this.debounceVerticalScrollbar = undefined;
        /** Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.)
             * @default false
             */
        this.suppressHorizontalScroll = undefined;
        /** When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data.
             * @default false
             */
        this.suppressScrollOnNewData = undefined;
        /** When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present.
             * @default false
             */
        this.suppressScrollWhenPopupsAreOpen = undefined;
        /** When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if the grid is working fast enough that you don't need animation frames and you don't want the grid to flicker.
             * @default false
             * @initial
             */
        this.suppressAnimationFrame = undefined;
        /** If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function.
             * @default false
             */
        this.suppressMiddleClickScrolls = undefined;
        /** If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page.
             * @default false
             * @initial
             */
        this.suppressPreventDefaultOnMouseWheel = undefined;
        /** Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations.
             * @initial
             */
        this.scrollbarWidth = undefined;
        /** Type of Row Selection: `single`, `multiple`.
             */
        this.rowSelection = undefined;
        /** Set to `true` to allow multiple rows to be selected using single click.
             * @default false
             */
        this.rowMultiSelectWithClick = undefined;
        /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`.
             * @default false
             */
        this.suppressRowDeselection = undefined;
        /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection.
             * @default false
             */
        this.suppressRowClickSelection = undefined;
        /** If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels.
             * @default false
             */
        this.suppressCellFocus = undefined;
        /** If `true`, only a single range can be selected.
             * @default false
             */
        this.suppressMultiRangeSelection = undefined;
        /** Set to `true` to be able to select the text within cells.
             *
             *     **Note:** When this is set to `true`, the clipboard service is disabled and only selected text is copied.
             * @default false
             */
        this.enableCellTextSelection = undefined;
        /** Set to `true` to enable Range Selection.
             * @default false
             */
        this.enableRangeSelection = undefined;
        /** Set to `true` to enable the Range Handle.
             * @default false
             */
        this.enableRangeHandle = undefined;
        /** Set to `true` to enable the Fill Handle.
             * @default false
             */
        this.enableFillHandle = undefined;
        /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical.
             * @default 'xy'
             */
        this.fillHandleDirection = undefined;
        /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle.
             * @default false
             */
        this.suppressClearOnFillReduction = undefined;
        /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`.
             * @default [null, 'asc', 'desc']
             */
        this.sortingOrder = undefined;
        /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower.
             * @default false
             */
        this.accentedSort = undefined;
        /** Set to `true` to show the 'no sort' icon.
             * @default false
             */
        this.unSortIcon = undefined;
        /** Set to `true` to suppress multi-sort when the user shift-clicks a column header.
             * @default false
             */
        this.suppressMultiSort = undefined;
        /** Set to `true` to always multi-sort when the user clicks a column header, regardless of key presses.
             * @default false
             */
        this.alwaysMultiSort = undefined;
        /** Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key.
             */
        this.multiSortKey = undefined;
        /** Set to `true` to suppress sorting of un-sorted data to match original row data.
             * @default false
             */
        this.suppressMaintainUnsortedOrder = undefined;
        /** Icons to use inside the grid instead of the grid's default icons.
             * @initial
             */
        this.icons = undefined;
        /** Default row height in pixels.
             * @default 25
             */
        this.rowHeight = undefined;
        /** The style properties to apply to all rows. Set to an object of key (style names) and values (style values).
             */
        this.rowStyle = undefined;
        /** CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names).
             */
        this.rowClass = undefined;
        /** Rules which can be applied to include certain CSS classes.
             */
        this.rowClassRules = undefined;
        /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class.
             * @default false
             */
        this.suppressRowHoverHighlight = undefined;
        /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning.
             * @default false
             * @initial
             */
        this.suppressRowTransform = undefined;
        /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class.
             * @default false
             */
        this.columnHoverHighlight = undefined;
        /** Provide a custom `gridId` for this instance of the grid. Value will be set on the root DOM node using the attribute `grid-id` as well as being accessible via the `gridApi.getGridId()` method.
             * @initial
             */
        this.gridId = undefined;
        /** When enabled, sorts only the rows added/updated by a transaction.
             * @default false
             */
        this.deltaSort = undefined;
        /**/
        this.treeDataDisplayType = undefined;
        /** @deprecated v29.2
             * @initial
             */
        this.functionsPassive = undefined;
        /** @initial
             */
        this.enableGroupEdit = undefined;
        /** Initial state for the grid. Only read once on initialization. Can be used in conjunction with `api.getState()` to save and restore grid state.
             * @initial
             */
        this.initialState = undefined;
        /** For customising the context menu.
             */
        this.getContextMenuItems = undefined;
        /** For customising the main 'column header' menu.
             * @initial
             */
        this.getMainMenuItems = undefined;
        /** Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup.
             */
        this.postProcessPopup = undefined;
        /** Allows the user to process the columns being removed from the pinned section because the viewport is too small to accommodate them.
             * Returns an array of columns to be removed from the pinned areas.
             * @initial
             */
        this.processUnpinnedColumns = undefined;
        /** Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel.
             */
        this.processCellForClipboard = undefined;
        /** Allows you to process header values for the clipboard.
             */
        this.processHeaderForClipboard = undefined;
        /** Allows you to process group header values for the clipboard.
             */
        this.processGroupHeaderForClipboard = undefined;
        /** Allows you to process cells from the clipboard. Handy if for example you have number fields, and want to block non-numbers from getting into the grid.
             */
        this.processCellFromClipboard = undefined;
        /** Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself.
             */
        this.sendToClipboard = undefined;
        /** Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data.
             */
        this.processDataFromClipboard = undefined;
        /** Grid calls this method to know if an external filter is present.
             */
        this.isExternalFilterPresent = undefined;
        /** Should return `true` if external filter passes, otherwise `false`.
             */
        this.doesExternalFilterPass = undefined;
        /** Callback to be used to customise the chart toolbar items.
             * @initial
             */
        this.getChartToolbarItems = undefined;
        /** Callback to enable displaying the chart in an alternative chart container.
             * @initial
             */
        this.createChartContainer = undefined;
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.
             */
        this.navigateToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.
             */
        this.tabToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.
             */
        this.navigateToNextCell = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused. Return the next Cell position to navigate to or null to stay on current cell.
             */
        this.tabToNextCell = undefined;
        /** A callback for localising text within the grid.
             * @initial
             */
        this.getLocaleText = undefined;
        /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)
             */
        this.getDocument = undefined;
        /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.
             * @initial
             */
        this.paginationNumberFormatter = undefined;
        /** Callback to use when you need access to more then the current column for aggregation.
             */
        this.getGroupRowAgg = undefined;
        /** (Client-side Row Model only) Allows groups to be open by default.
             */
        this.isGroupOpenByDefault = undefined;
        /** Allows default sorting of groups.
             */
        this.initialGroupOrderComparator = undefined;
        /** Callback to be used with pivoting, to allow changing the second column definition.
             */
        this.processPivotResultColDef = undefined;
        /** Callback to be used with pivoting, to allow changing the second column group definition.
             */
        this.processPivotResultColGroupDef = undefined;
        /** Callback to be used when working with Tree Data when `treeData = true`.
             */
        this.getDataPath = undefined;
        /** Allows setting the child count for a group row.
             * @initial
             */
        this.getChildCount = undefined;
        /** Allows providing different params for different levels of grouping.
             * @initial
             */
        this.getServerSideGroupLevelParams = undefined;
        /** Allows groups to be open by default.
             */
        this.isServerSideGroupOpenByDefault = undefined;
        /** Allows cancelling transactions.
             */
        this.isApplyServerSideTransaction = undefined;
        /** SSRM Tree Data: Allows specifying which rows are expandable.
             */
        this.isServerSideGroup = undefined;
        /** SSRM Tree Data: Allows specifying group keys.
             */
        this.getServerSideGroupKey = undefined;
        /** Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-business-key='abc'` where `abc` is what you return as the business key.
             * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.
             */
        this.getBusinessKeyForNode = undefined;
        /** Allows setting the ID for a particular row node based on the data.
             * @initial
             */
        this.getRowId = undefined;
        /** When enabled, getRowId() callback is implemented and new Row Data is set, the grid will disregard all previous rows and treat the new Row Data as new data. As a consequence, all Row State (eg selection, rendered rows) will be reset.
             * @default false
             */
        this.resetRowDataOnUpdate = undefined;
        /** Allows you to process rows after they are created, so you can do final adding of custom attributes etc.
             */
        this.processRowPostCreate = undefined;
        /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable.
             */
        this.isRowSelectable = undefined;
        /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row.
             */
        this.isRowMaster = undefined;
        /** Callback to fill values instead of simply copying values or increasing number values using linear progression.
             */
        this.fillOperation = undefined;
        /** Callback to perform additional sorting after the grid has sorted the rows. When used with SSRM, only applicable when `suppressServerSideInfiniteScroll=true`.
             */
        this.postSortRows = undefined;
        /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.
             */
        this.getRowStyle = undefined;
        /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.
             */
        this.getRowClass = undefined;
        /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.
             */
        this.getRowHeight = undefined;
        /** Tells the grid if this row should be rendered as full width.
             */
        this.isFullWidthRow = undefined;
        /** The tool panel visibility has changed. Fires twice if switching between panels - once with the old panel and once with the new panel.
             */
        this.toolPanelVisibleChanged = new EventEmitter();
        /** The tool panel size has been changed.
             */
        this.toolPanelSizeChanged = new EventEmitter();
        /** Cut operation has started.
             */
        this.cutStart = new EventEmitter();
        /** Cut operation has ended.
             */
        this.cutEnd = new EventEmitter();
        /** Paste operation has started.
             */
        this.pasteStart = new EventEmitter();
        /** Paste operation has ended.
             */
        this.pasteEnd = new EventEmitter();
        /** A column, or group of columns, was hidden / shown.
             */
        this.columnVisible = new EventEmitter();
        /** A column, or group of columns, was pinned / unpinned.
             */
        this.columnPinned = new EventEmitter();
        /** A column was resized.
             */
        this.columnResized = new EventEmitter();
        /** A column was moved.
             */
        this.columnMoved = new EventEmitter();
        /** A value column was added or removed.
             */
        this.columnValueChanged = new EventEmitter();
        /** The pivot mode flag was changed.
             */
        this.columnPivotModeChanged = new EventEmitter();
        /** A pivot column was added, removed or order changed.
             */
        this.columnPivotChanged = new EventEmitter();
        /** A column group was opened / closed.
             */
        this.columnGroupOpened = new EventEmitter();
        /** User set new columns.
             */
        this.newColumnsLoaded = new EventEmitter();
        /** The list of grid columns changed.
             */
        this.gridColumnsChanged = new EventEmitter();
        /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc.
             */
        this.displayedColumnsChanged = new EventEmitter();
        /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default).
             */
        this.virtualColumnsChanged = new EventEmitter();
        /** Shotgun - gets called when either a) new columns are set or b) `api.applyColumnState()` is used, so everything has changed.
             */
        this.columnEverythingChanged = new EventEmitter();
        /** A mouse cursor is initially moved over a column header.
             */
        this.columnHeaderMouseOver = new EventEmitter();
        /** A mouse cursor is moved out of a column header.
             */
        this.columnHeaderMouseLeave = new EventEmitter();
        /** A click is performed on a column header.
             */
        this.columnHeaderClicked = new EventEmitter();
        /** A context menu action, such as right-click or context menu key press, is performed on a column header.
             */
        this.columnHeaderContextMenu = new EventEmitter();
        /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
             * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.
             */
        this.componentStateChanged = new EventEmitter();
        /** Value has changed after editing (this event will not fire if editing was cancelled, eg ESC was pressed) or
             *  if cell value has changed as a result of cut, paste, cell clear (pressing Delete key),
             * fill handle, copy range down, undo and redo.
            */
        this.cellValueChanged = new EventEmitter();
        /** Value has changed after editing. Only fires when `readOnlyEdit=true`.
             */
        this.cellEditRequest = new EventEmitter();
        /** A cell's value within a row has changed. This event corresponds to Full Row Editing only.
             */
        this.rowValueChanged = new EventEmitter();
        /** Editing a cell has started.
             */
        this.cellEditingStarted = new EventEmitter();
        /** Editing a cell has stopped.
             */
        this.cellEditingStopped = new EventEmitter();
        /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing.
             */
        this.rowEditingStarted = new EventEmitter();
        /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing.
             */
        this.rowEditingStopped = new EventEmitter();
        /** Undo operation has started.
             */
        this.undoStarted = new EventEmitter();
        /** Undo operation has ended.
             */
        this.undoEnded = new EventEmitter();
        /** Redo operation has started.
             */
        this.redoStarted = new EventEmitter();
        /** Redo operation has ended.
             */
        this.redoEnded = new EventEmitter();
        /** Range delete operation (cell clear) has started.
             */
        this.rangeDeleteStart = new EventEmitter();
        /** Range delete operation (cell clear) has ended.
             */
        this.rangeDeleteEnd = new EventEmitter();
        /** Filter has been opened.
             */
        this.filterOpened = new EventEmitter();
        /** Filter has been modified and applied.
             */
        this.filterChanged = new EventEmitter();
        /** Filter was modified but not applied. Used when filters have 'Apply' buttons.
             */
        this.filterModified = new EventEmitter();
        /** Advanced Filter Builder visibility has changed (opened or closed).
             */
        this.advancedFilterBuilderVisibleChanged = new EventEmitter();
        /** A chart has been created.
             */
        this.chartCreated = new EventEmitter();
        /** The data range for the chart has been changed.
             */
        this.chartRangeSelectionChanged = new EventEmitter();
        /** Formatting changes have been made by users through the Format Panel.
             */
        this.chartOptionsChanged = new EventEmitter();
        /** A chart has been destroyed.
             */
        this.chartDestroyed = new EventEmitter();
        /** DOM event `keyDown` happened on a cell.
             */
        this.cellKeyDown = new EventEmitter();
        /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet      */
        this.gridReady = new EventEmitter();
        /** Invoked immediately before the grid is destroyed. This is useful for cleanup logic that needs to run before the grid is torn down.
             */
        this.gridPreDestroyed = new EventEmitter();
        /** Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents     */
        this.firstDataRendered = new EventEmitter();
        /** The size of the grid `div` has changed. In other words, the grid was resized.
             */
        this.gridSizeChanged = new EventEmitter();
        /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events.
             */
        this.modelUpdated = new EventEmitter();
        /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row.
             */
        this.virtualRowRemoved = new EventEmitter();
        /** Which rows are rendered in the DOM has changed.
             */
        this.viewportChanged = new EventEmitter();
        /** The body was scrolled horizontally or vertically.
             */
        this.bodyScroll = new EventEmitter();
        /** Main body of the grid has stopped scrolling, either horizontally or vertically.
             */
        this.bodyScrollEnd = new EventEmitter();
        /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
             */
        this.dragStarted = new EventEmitter();
        /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
             */
        this.dragStopped = new EventEmitter();
        /** Grid state has been updated.
             */
        this.stateUpdated = new EventEmitter();
        /** Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
             *
             *  - The page size changes.
             *  - The current shown page is changed.
             *  - New data is loaded onto the grid.
             */
        this.paginationChanged = new EventEmitter();
        /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid.
             */
        this.rowDragEnter = new EventEmitter();
        /** The mouse has moved while dragging.
             */
        this.rowDragMove = new EventEmitter();
        /** The mouse has left the grid while dragging.
             */
        this.rowDragLeave = new EventEmitter();
        /** The drag has finished over the grid.
             */
        this.rowDragEnd = new EventEmitter();
        /** A row group column was added, removed or reordered.
             */
        this.columnRowGroupChanged = new EventEmitter();
        /** A row group was opened or closed.
             */
        this.rowGroupOpened = new EventEmitter();
        /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`.
             */
        this.expandOrCollapseAll = new EventEmitter();
        /** The client has set new pinned row data into the grid.
             */
        this.pinnedRowDataChanged = new EventEmitter();
        /** Client-Side Row Model only. The client has updated data for the grid by either a) setting new Row Data or b) Applying a Row Transaction.
             */
        this.rowDataUpdated = new EventEmitter();
        /** Async transactions have been applied. Contains a list of all transaction results.
             */
        this.asyncTransactionsFlushed = new EventEmitter();
        /** A server side store has finished refreshing.
             */
        this.storeRefreshed = new EventEmitter();
        /** Cell is clicked.
             */
        this.cellClicked = new EventEmitter();
        /** Cell is double clicked.
             */
        this.cellDoubleClicked = new EventEmitter();
        /** Cell is focused.
             */
        this.cellFocused = new EventEmitter();
        /** Mouse entered cell.
             */
        this.cellMouseOver = new EventEmitter();
        /** Mouse left cell.
             */
        this.cellMouseOut = new EventEmitter();
        /** Mouse down on cell.
             */
        this.cellMouseDown = new EventEmitter();
        /** Row is clicked.
             */
        this.rowClicked = new EventEmitter();
        /** Row is double clicked.
             */
        this.rowDoubleClicked = new EventEmitter();
        /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected.
             */
        this.rowSelected = new EventEmitter();
        /** Row selection is changed. Use the grid API `getSelectedNodes()` or `getSelectedRows()` to get the new list of selected nodes / row data.
             */
        this.selectionChanged = new EventEmitter();
        /** Cell is right clicked.
             */
        this.cellContextMenu = new EventEmitter();
        /** A change to range selection has occurred.
             */
        this.rangeSelectionChanged = new EventEmitter();
        /** A tooltip has been displayed     */
        this.tooltipShow = new EventEmitter();
        /** A tooltip was hidden     */
        this.tooltipHide = new EventEmitter();
        /** Sort has changed. The grid also listens for this and updates the model.
             */
        this.sortChanged = new EventEmitter();
        /** @deprecated v29.2     */
        this.columnRowGroupChangeRequest = new EventEmitter();
        /** @deprecated v29.2     */
        this.columnPivotChangeRequest = new EventEmitter();
        /** @deprecated v29.2     */
        this.columnValueChangeRequest = new EventEmitter();
        /** @deprecated v29.2     */
        this.columnAggFuncChangeRequest = new EventEmitter();
        this._nativeElement = elementDef.nativeElement;
    }
    ngAfterViewInit() {
        // Run the setup outside of angular so all the event handlers that are created do not trigger change detection
        this.angularFrameworkOverrides.runOutsideAngular(() => {
            this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef, this.angularFrameworkOverrides);
            const mergedGridOps = ComponentUtil.combineAttributesAndGridOptions(this.gridOptions, this);
            this.gridParams = {
                globalEventListener: this.globalEventListener.bind(this),
                frameworkOverrides: this.angularFrameworkOverrides,
                providedBeanInstances: {
                    frameworkComponentWrapper: this.frameworkComponentWrapper,
                },
                modules: (this.modules || []),
            };
            const api = createGrid(this._nativeElement, mergedGridOps, this.gridParams);
            if (api) {
                this.api = api;
                this.columnApi = new ColumnApi(api);
            }
            // For RxJs compatibility we need to check for observed v7+ or observers v6
            const gridPreDestroyedEmitter = this.gridPreDestroyed;
            if (gridPreDestroyedEmitter.observed ?? gridPreDestroyedEmitter.observers.length > 0) {
                console.warn('AG Grid: gridPreDestroyed event listener registered via (gridPreDestroyed)="method($event)" will be ignored! ' +
                    'Please assign via gridOptions.gridPreDestroyed and pass to the grid as [gridOptions]="gridOptions"');
            }
            this._initialised = true;
            // sometimes, especially in large client apps gridReady can fire before ngAfterViewInit
            // this ties these together so that gridReady will always fire after agGridAngular's ngAfterViewInit
            // the actual containing component's ngAfterViewInit will fire just after agGridAngular's
            this._fullyReady.resolveNow(null, (resolve) => resolve);
        });
    }
    ngOnChanges(changes) {
        if (this._initialised) {
            // Run the changes outside of angular so any event handlers that are created do not trigger change detection
            this.angularFrameworkOverrides.runOutsideAngular(() => {
                const gridOptions = {};
                Object.entries(changes).forEach(([key, value]) => {
                    gridOptions[key] = value.currentValue;
                });
                ComponentUtil.processOnChange(gridOptions, this.api);
            });
        }
    }
    ngOnDestroy() {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            // could be null if grid failed to initialise
            this.api?.destroy();
        }
    }
    // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
    // or via gridOptions
    isEmitterUsed(eventType) {
        const emitter = this[eventType];
        // For RxJs compatibility we need to check for observed v7+ or observers v6
        const emitterAny = emitter;
        const hasEmitter = emitterAny?.observed ?? emitterAny?.observers?.length > 0;
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
            // Make sure we emit within the angular zone, so change detection works properly
            const fireEmitter = () => this.angularFrameworkOverrides.runInsideAngular(() => emitter.emit(event));
            if (eventType === 'gridReady') {
                // if the user is listening for gridReady, wait for ngAfterViewInit to fire first, then emit then gridReady event
                this._fullyReady.then(() => fireEmitter());
            }
            else {
                fireEmitter();
            }
        }
    }
}
AgGridAngular.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AgGridAngular, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1.AngularFrameworkOverrides }, { token: i2.AngularFrameworkComponentWrapper }], target: i0.ɵɵFactoryTarget.Component });
AgGridAngular.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: AgGridAngular, isStandalone: true, selector: "ag-grid-angular", inputs: { gridOptions: "gridOptions", modules: "modules", statusBar: "statusBar", sideBar: "sideBar", suppressContextMenu: "suppressContextMenu", preventDefaultOnContextMenu: "preventDefaultOnContextMenu", allowContextMenuWithControlKey: "allowContextMenuWithControlKey", suppressMenuHide: "suppressMenuHide", enableBrowserTooltips: "enableBrowserTooltips", tooltipTrigger: "tooltipTrigger", tooltipShowDelay: "tooltipShowDelay", tooltipHideDelay: "tooltipHideDelay", tooltipMouseTrack: "tooltipMouseTrack", tooltipInteraction: "tooltipInteraction", popupParent: "popupParent", copyHeadersToClipboard: "copyHeadersToClipboard", copyGroupHeadersToClipboard: "copyGroupHeadersToClipboard", clipboardDelimiter: "clipboardDelimiter", suppressCopyRowsToClipboard: "suppressCopyRowsToClipboard", suppressCopySingleCellRanges: "suppressCopySingleCellRanges", suppressLastEmptyLineOnPaste: "suppressLastEmptyLineOnPaste", suppressClipboardPaste: "suppressClipboardPaste", suppressClipboardApi: "suppressClipboardApi", suppressCutToClipboard: "suppressCutToClipboard", columnDefs: "columnDefs", defaultColDef: "defaultColDef", defaultColGroupDef: "defaultColGroupDef", columnTypes: "columnTypes", dataTypeDefinitions: "dataTypeDefinitions", maintainColumnOrder: "maintainColumnOrder", suppressFieldDotNotation: "suppressFieldDotNotation", headerHeight: "headerHeight", groupHeaderHeight: "groupHeaderHeight", floatingFiltersHeight: "floatingFiltersHeight", pivotHeaderHeight: "pivotHeaderHeight", pivotGroupHeaderHeight: "pivotGroupHeaderHeight", allowDragFromColumnsToolPanel: "allowDragFromColumnsToolPanel", suppressMovableColumns: "suppressMovableColumns", suppressColumnMoveAnimation: "suppressColumnMoveAnimation", suppressDragLeaveHidesColumns: "suppressDragLeaveHidesColumns", suppressRowGroupHidesColumns: "suppressRowGroupHidesColumns", colResizeDefault: "colResizeDefault", suppressAutoSize: "suppressAutoSize", autoSizePadding: "autoSizePadding", skipHeaderOnAutoSize: "skipHeaderOnAutoSize", autoSizeStrategy: "autoSizeStrategy", components: "components", editType: "editType", singleClickEdit: "singleClickEdit", suppressClickEdit: "suppressClickEdit", readOnlyEdit: "readOnlyEdit", stopEditingWhenCellsLoseFocus: "stopEditingWhenCellsLoseFocus", enterMovesDown: "enterMovesDown", enterMovesDownAfterEdit: "enterMovesDownAfterEdit", enterNavigatesVertically: "enterNavigatesVertically", enterNavigatesVerticallyAfterEdit: "enterNavigatesVerticallyAfterEdit", enableCellEditingOnBackspace: "enableCellEditingOnBackspace", undoRedoCellEditing: "undoRedoCellEditing", undoRedoCellEditingLimit: "undoRedoCellEditingLimit", defaultCsvExportParams: "defaultCsvExportParams", suppressCsvExport: "suppressCsvExport", defaultExcelExportParams: "defaultExcelExportParams", suppressExcelExport: "suppressExcelExport", excelStyles: "excelStyles", quickFilterText: "quickFilterText", cacheQuickFilter: "cacheQuickFilter", excludeHiddenColumnsFromQuickFilter: "excludeHiddenColumnsFromQuickFilter", includeHiddenColumnsInQuickFilter: "includeHiddenColumnsInQuickFilter", quickFilterParser: "quickFilterParser", quickFilterMatcher: "quickFilterMatcher", excludeChildrenWhenTreeDataFiltering: "excludeChildrenWhenTreeDataFiltering", enableAdvancedFilter: "enableAdvancedFilter", advancedFilterModel: "advancedFilterModel", includeHiddenColumnsInAdvancedFilter: "includeHiddenColumnsInAdvancedFilter", advancedFilterParent: "advancedFilterParent", advancedFilterBuilderParams: "advancedFilterBuilderParams", enableCharts: "enableCharts", chartThemes: "chartThemes", customChartThemes: "customChartThemes", chartThemeOverrides: "chartThemeOverrides", enableChartToolPanelsButton: "enableChartToolPanelsButton", suppressChartToolPanelsButton: "suppressChartToolPanelsButton", chartToolPanelsDef: "chartToolPanelsDef", loadingCellRenderer: "loadingCellRenderer", loadingCellRendererParams: "loadingCellRendererParams", loadingCellRendererSelector: "loadingCellRendererSelector", localeText: "localeText", masterDetail: "masterDetail", keepDetailRows: "keepDetailRows", keepDetailRowsCount: "keepDetailRowsCount", detailCellRenderer: "detailCellRenderer", detailCellRendererParams: "detailCellRendererParams", detailRowHeight: "detailRowHeight", detailRowAutoHeight: "detailRowAutoHeight", context: "context", alignedGrids: "alignedGrids", tabIndex: "tabIndex", rowBuffer: "rowBuffer", valueCache: "valueCache", valueCacheNeverExpires: "valueCacheNeverExpires", enableCellExpressions: "enableCellExpressions", suppressParentsInRowNodes: "suppressParentsInRowNodes", suppressTouch: "suppressTouch", suppressFocusAfterRefresh: "suppressFocusAfterRefresh", suppressAsyncEvents: "suppressAsyncEvents", suppressBrowserResizeObserver: "suppressBrowserResizeObserver", suppressPropertyNamesCheck: "suppressPropertyNamesCheck", suppressChangeDetection: "suppressChangeDetection", debug: "debug", overlayLoadingTemplate: "overlayLoadingTemplate", loadingOverlayComponent: "loadingOverlayComponent", loadingOverlayComponentParams: "loadingOverlayComponentParams", suppressLoadingOverlay: "suppressLoadingOverlay", overlayNoRowsTemplate: "overlayNoRowsTemplate", noRowsOverlayComponent: "noRowsOverlayComponent", noRowsOverlayComponentParams: "noRowsOverlayComponentParams", suppressNoRowsOverlay: "suppressNoRowsOverlay", pagination: "pagination", paginationPageSize: "paginationPageSize", paginationPageSizeSelector: "paginationPageSizeSelector", paginationAutoPageSize: "paginationAutoPageSize", paginateChildRows: "paginateChildRows", suppressPaginationPanel: "suppressPaginationPanel", pivotMode: "pivotMode", pivotPanelShow: "pivotPanelShow", pivotDefaultExpanded: "pivotDefaultExpanded", pivotColumnGroupTotals: "pivotColumnGroupTotals", pivotRowTotals: "pivotRowTotals", pivotSuppressAutoColumn: "pivotSuppressAutoColumn", suppressExpandablePivotGroups: "suppressExpandablePivotGroups", functionsReadOnly: "functionsReadOnly", aggFuncs: "aggFuncs", suppressAggFuncInHeader: "suppressAggFuncInHeader", alwaysAggregateAtRootLevel: "alwaysAggregateAtRootLevel", suppressAggAtRootLevel: "suppressAggAtRootLevel", aggregateOnlyChangedColumns: "aggregateOnlyChangedColumns", suppressAggFilteredOnly: "suppressAggFilteredOnly", removePivotHeaderRowWhenSingleValueColumn: "removePivotHeaderRowWhenSingleValueColumn", animateRows: "animateRows", enableCellChangeFlash: "enableCellChangeFlash", cellFlashDelay: "cellFlashDelay", cellFadeDelay: "cellFadeDelay", allowShowChangeAfterFilter: "allowShowChangeAfterFilter", domLayout: "domLayout", ensureDomOrder: "ensureDomOrder", enableRtl: "enableRtl", suppressColumnVirtualisation: "suppressColumnVirtualisation", suppressMaxRenderedRowRestriction: "suppressMaxRenderedRowRestriction", suppressRowVirtualisation: "suppressRowVirtualisation", rowDragManaged: "rowDragManaged", suppressRowDrag: "suppressRowDrag", suppressMoveWhenRowDragging: "suppressMoveWhenRowDragging", rowDragEntireRow: "rowDragEntireRow", rowDragMultiRow: "rowDragMultiRow", rowDragText: "rowDragText", fullWidthCellRenderer: "fullWidthCellRenderer", fullWidthCellRendererParams: "fullWidthCellRendererParams", embedFullWidthRows: "embedFullWidthRows", suppressGroupMaintainValueType: "suppressGroupMaintainValueType", groupDisplayType: "groupDisplayType", groupDefaultExpanded: "groupDefaultExpanded", autoGroupColumnDef: "autoGroupColumnDef", groupMaintainOrder: "groupMaintainOrder", groupSelectsChildren: "groupSelectsChildren", groupLockGroupColumns: "groupLockGroupColumns", groupAggFiltering: "groupAggFiltering", groupIncludeFooter: "groupIncludeFooter", groupIncludeTotalFooter: "groupIncludeTotalFooter", groupSuppressBlankHeader: "groupSuppressBlankHeader", groupSelectsFiltered: "groupSelectsFiltered", showOpenedGroup: "showOpenedGroup", groupRemoveSingleChildren: "groupRemoveSingleChildren", groupRemoveLowestSingleChildren: "groupRemoveLowestSingleChildren", groupHideOpenParents: "groupHideOpenParents", groupAllowUnbalanced: "groupAllowUnbalanced", rowGroupPanelShow: "rowGroupPanelShow", groupRowRenderer: "groupRowRenderer", groupRowRendererParams: "groupRowRendererParams", suppressMakeColumnVisibleAfterUnGroup: "suppressMakeColumnVisibleAfterUnGroup", treeData: "treeData", rowGroupPanelSuppressSort: "rowGroupPanelSuppressSort", suppressGroupRowsSticky: "suppressGroupRowsSticky", pinnedTopRowData: "pinnedTopRowData", pinnedBottomRowData: "pinnedBottomRowData", rowModelType: "rowModelType", rowData: "rowData", asyncTransactionWaitMillis: "asyncTransactionWaitMillis", suppressModelUpdateAfterUpdateTransaction: "suppressModelUpdateAfterUpdateTransaction", datasource: "datasource", cacheOverflowSize: "cacheOverflowSize", infiniteInitialRowCount: "infiniteInitialRowCount", serverSideInitialRowCount: "serverSideInitialRowCount", suppressServerSideInfiniteScroll: "suppressServerSideInfiniteScroll", cacheBlockSize: "cacheBlockSize", maxBlocksInCache: "maxBlocksInCache", maxConcurrentDatasourceRequests: "maxConcurrentDatasourceRequests", blockLoadDebounceMillis: "blockLoadDebounceMillis", purgeClosedRowNodes: "purgeClosedRowNodes", serverSideDatasource: "serverSideDatasource", serverSideSortAllLevels: "serverSideSortAllLevels", serverSideOnlyRefreshFilteredGroups: "serverSideOnlyRefreshFilteredGroups", serverSideFilterAllLevels: "serverSideFilterAllLevels", serverSideSortOnServer: "serverSideSortOnServer", serverSideFilterOnServer: "serverSideFilterOnServer", serverSidePivotResultFieldSeparator: "serverSidePivotResultFieldSeparator", viewportDatasource: "viewportDatasource", viewportRowModelPageSize: "viewportRowModelPageSize", viewportRowModelBufferSize: "viewportRowModelBufferSize", alwaysShowHorizontalScroll: "alwaysShowHorizontalScroll", alwaysShowVerticalScroll: "alwaysShowVerticalScroll", debounceVerticalScrollbar: "debounceVerticalScrollbar", suppressHorizontalScroll: "suppressHorizontalScroll", suppressScrollOnNewData: "suppressScrollOnNewData", suppressScrollWhenPopupsAreOpen: "suppressScrollWhenPopupsAreOpen", suppressAnimationFrame: "suppressAnimationFrame", suppressMiddleClickScrolls: "suppressMiddleClickScrolls", suppressPreventDefaultOnMouseWheel: "suppressPreventDefaultOnMouseWheel", scrollbarWidth: "scrollbarWidth", rowSelection: "rowSelection", rowMultiSelectWithClick: "rowMultiSelectWithClick", suppressRowDeselection: "suppressRowDeselection", suppressRowClickSelection: "suppressRowClickSelection", suppressCellFocus: "suppressCellFocus", suppressMultiRangeSelection: "suppressMultiRangeSelection", enableCellTextSelection: "enableCellTextSelection", enableRangeSelection: "enableRangeSelection", enableRangeHandle: "enableRangeHandle", enableFillHandle: "enableFillHandle", fillHandleDirection: "fillHandleDirection", suppressClearOnFillReduction: "suppressClearOnFillReduction", sortingOrder: "sortingOrder", accentedSort: "accentedSort", unSortIcon: "unSortIcon", suppressMultiSort: "suppressMultiSort", alwaysMultiSort: "alwaysMultiSort", multiSortKey: "multiSortKey", suppressMaintainUnsortedOrder: "suppressMaintainUnsortedOrder", icons: "icons", rowHeight: "rowHeight", rowStyle: "rowStyle", rowClass: "rowClass", rowClassRules: "rowClassRules", suppressRowHoverHighlight: "suppressRowHoverHighlight", suppressRowTransform: "suppressRowTransform", columnHoverHighlight: "columnHoverHighlight", gridId: "gridId", deltaSort: "deltaSort", treeDataDisplayType: "treeDataDisplayType", functionsPassive: "functionsPassive", enableGroupEdit: "enableGroupEdit", initialState: "initialState", getContextMenuItems: "getContextMenuItems", getMainMenuItems: "getMainMenuItems", postProcessPopup: "postProcessPopup", processUnpinnedColumns: "processUnpinnedColumns", processCellForClipboard: "processCellForClipboard", processHeaderForClipboard: "processHeaderForClipboard", processGroupHeaderForClipboard: "processGroupHeaderForClipboard", processCellFromClipboard: "processCellFromClipboard", sendToClipboard: "sendToClipboard", processDataFromClipboard: "processDataFromClipboard", isExternalFilterPresent: "isExternalFilterPresent", doesExternalFilterPass: "doesExternalFilterPass", getChartToolbarItems: "getChartToolbarItems", createChartContainer: "createChartContainer", navigateToNextHeader: "navigateToNextHeader", tabToNextHeader: "tabToNextHeader", navigateToNextCell: "navigateToNextCell", tabToNextCell: "tabToNextCell", getLocaleText: "getLocaleText", getDocument: "getDocument", paginationNumberFormatter: "paginationNumberFormatter", getGroupRowAgg: "getGroupRowAgg", isGroupOpenByDefault: "isGroupOpenByDefault", initialGroupOrderComparator: "initialGroupOrderComparator", processPivotResultColDef: "processPivotResultColDef", processPivotResultColGroupDef: "processPivotResultColGroupDef", getDataPath: "getDataPath", getChildCount: "getChildCount", getServerSideGroupLevelParams: "getServerSideGroupLevelParams", isServerSideGroupOpenByDefault: "isServerSideGroupOpenByDefault", isApplyServerSideTransaction: "isApplyServerSideTransaction", isServerSideGroup: "isServerSideGroup", getServerSideGroupKey: "getServerSideGroupKey", getBusinessKeyForNode: "getBusinessKeyForNode", getRowId: "getRowId", resetRowDataOnUpdate: "resetRowDataOnUpdate", processRowPostCreate: "processRowPostCreate", isRowSelectable: "isRowSelectable", isRowMaster: "isRowMaster", fillOperation: "fillOperation", postSortRows: "postSortRows", getRowStyle: "getRowStyle", getRowClass: "getRowClass", getRowHeight: "getRowHeight", isFullWidthRow: "isFullWidthRow" }, outputs: { toolPanelVisibleChanged: "toolPanelVisibleChanged", toolPanelSizeChanged: "toolPanelSizeChanged", cutStart: "cutStart", cutEnd: "cutEnd", pasteStart: "pasteStart", pasteEnd: "pasteEnd", columnVisible: "columnVisible", columnPinned: "columnPinned", columnResized: "columnResized", columnMoved: "columnMoved", columnValueChanged: "columnValueChanged", columnPivotModeChanged: "columnPivotModeChanged", columnPivotChanged: "columnPivotChanged", columnGroupOpened: "columnGroupOpened", newColumnsLoaded: "newColumnsLoaded", gridColumnsChanged: "gridColumnsChanged", displayedColumnsChanged: "displayedColumnsChanged", virtualColumnsChanged: "virtualColumnsChanged", columnEverythingChanged: "columnEverythingChanged", columnHeaderMouseOver: "columnHeaderMouseOver", columnHeaderMouseLeave: "columnHeaderMouseLeave", columnHeaderClicked: "columnHeaderClicked", columnHeaderContextMenu: "columnHeaderContextMenu", componentStateChanged: "componentStateChanged", cellValueChanged: "cellValueChanged", cellEditRequest: "cellEditRequest", rowValueChanged: "rowValueChanged", cellEditingStarted: "cellEditingStarted", cellEditingStopped: "cellEditingStopped", rowEditingStarted: "rowEditingStarted", rowEditingStopped: "rowEditingStopped", undoStarted: "undoStarted", undoEnded: "undoEnded", redoStarted: "redoStarted", redoEnded: "redoEnded", rangeDeleteStart: "rangeDeleteStart", rangeDeleteEnd: "rangeDeleteEnd", filterOpened: "filterOpened", filterChanged: "filterChanged", filterModified: "filterModified", advancedFilterBuilderVisibleChanged: "advancedFilterBuilderVisibleChanged", chartCreated: "chartCreated", chartRangeSelectionChanged: "chartRangeSelectionChanged", chartOptionsChanged: "chartOptionsChanged", chartDestroyed: "chartDestroyed", cellKeyDown: "cellKeyDown", gridReady: "gridReady", gridPreDestroyed: "gridPreDestroyed", firstDataRendered: "firstDataRendered", gridSizeChanged: "gridSizeChanged", modelUpdated: "modelUpdated", virtualRowRemoved: "virtualRowRemoved", viewportChanged: "viewportChanged", bodyScroll: "bodyScroll", bodyScrollEnd: "bodyScrollEnd", dragStarted: "dragStarted", dragStopped: "dragStopped", stateUpdated: "stateUpdated", paginationChanged: "paginationChanged", rowDragEnter: "rowDragEnter", rowDragMove: "rowDragMove", rowDragLeave: "rowDragLeave", rowDragEnd: "rowDragEnd", columnRowGroupChanged: "columnRowGroupChanged", rowGroupOpened: "rowGroupOpened", expandOrCollapseAll: "expandOrCollapseAll", pinnedRowDataChanged: "pinnedRowDataChanged", rowDataUpdated: "rowDataUpdated", asyncTransactionsFlushed: "asyncTransactionsFlushed", storeRefreshed: "storeRefreshed", cellClicked: "cellClicked", cellDoubleClicked: "cellDoubleClicked", cellFocused: "cellFocused", cellMouseOver: "cellMouseOver", cellMouseOut: "cellMouseOut", cellMouseDown: "cellMouseDown", rowClicked: "rowClicked", rowDoubleClicked: "rowDoubleClicked", rowSelected: "rowSelected", selectionChanged: "selectionChanged", cellContextMenu: "cellContextMenu", rangeSelectionChanged: "rangeSelectionChanged", tooltipShow: "tooltipShow", tooltipHide: "tooltipHide", sortChanged: "sortChanged", columnRowGroupChangeRequest: "columnRowGroupChangeRequest", columnPivotChangeRequest: "columnPivotChangeRequest", columnValueChangeRequest: "columnValueChangeRequest", columnAggFuncChangeRequest: "columnAggFuncChangeRequest" }, providers: [
        AngularFrameworkOverrides,
        AngularFrameworkComponentWrapper
    ], usesOnChanges: true, ngImport: i0, template: '', isInline: true, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AgGridAngular, decorators: [{
            type: Component,
            args: [{
                    selector: 'ag-grid-angular',
                    standalone: true,
                    template: '',
                    providers: [
                        AngularFrameworkOverrides,
                        AngularFrameworkComponentWrapper
                    ],
                    // tell angular we don't want view encapsulation, we don't want a shadow root
                    encapsulation: ViewEncapsulation.None
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef }, { type: i0.ViewContainerRef }, { type: i1.AngularFrameworkOverrides }, { type: i2.AngularFrameworkComponentWrapper }]; }, propDecorators: { gridOptions: [{
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
            }], tooltipTrigger: [{
                type: Input
            }], tooltipShowDelay: [{
                type: Input
            }], tooltipHideDelay: [{
                type: Input
            }], tooltipMouseTrack: [{
                type: Input
            }], tooltipInteraction: [{
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
            }], suppressCutToClipboard: [{
                type: Input
            }], columnDefs: [{
                type: Input
            }], defaultColDef: [{
                type: Input
            }], defaultColGroupDef: [{
                type: Input
            }], columnTypes: [{
                type: Input
            }], dataTypeDefinitions: [{
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
            }], autoSizeStrategy: [{
                type: Input
            }], components: [{
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
            }], enterNavigatesVertically: [{
                type: Input
            }], enterNavigatesVerticallyAfterEdit: [{
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
            }], excludeHiddenColumnsFromQuickFilter: [{
                type: Input
            }], includeHiddenColumnsInQuickFilter: [{
                type: Input
            }], quickFilterParser: [{
                type: Input
            }], quickFilterMatcher: [{
                type: Input
            }], excludeChildrenWhenTreeDataFiltering: [{
                type: Input
            }], enableAdvancedFilter: [{
                type: Input
            }], advancedFilterModel: [{
                type: Input
            }], includeHiddenColumnsInAdvancedFilter: [{
                type: Input
            }], advancedFilterParent: [{
                type: Input
            }], advancedFilterBuilderParams: [{
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
            }], loadingOverlayComponentParams: [{
                type: Input
            }], suppressLoadingOverlay: [{
                type: Input
            }], overlayNoRowsTemplate: [{
                type: Input
            }], noRowsOverlayComponent: [{
                type: Input
            }], noRowsOverlayComponentParams: [{
                type: Input
            }], suppressNoRowsOverlay: [{
                type: Input
            }], pagination: [{
                type: Input
            }], paginationPageSize: [{
                type: Input
            }], paginationPageSizeSelector: [{
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
            }], pivotDefaultExpanded: [{
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
            }], alwaysAggregateAtRootLevel: [{
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
            }], fullWidthCellRendererParams: [{
                type: Input
            }], embedFullWidthRows: [{
                type: Input
            }], suppressGroupMaintainValueType: [{
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
            }], groupLockGroupColumns: [{
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
            }], groupRowRendererParams: [{
                type: Input
            }], suppressMakeColumnVisibleAfterUnGroup: [{
                type: Input
            }], treeData: [{
                type: Input
            }], rowGroupPanelSuppressSort: [{
                type: Input
            }], suppressGroupRowsSticky: [{
                type: Input
            }], pinnedTopRowData: [{
                type: Input
            }], pinnedBottomRowData: [{
                type: Input
            }], rowModelType: [{
                type: Input
            }], rowData: [{
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
            }], serverSideOnlyRefreshFilteredGroups: [{
                type: Input
            }], serverSideFilterAllLevels: [{
                type: Input
            }], serverSideSortOnServer: [{
                type: Input
            }], serverSideFilterOnServer: [{
                type: Input
            }], serverSidePivotResultFieldSeparator: [{
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
            }], gridId: [{
                type: Input
            }], deltaSort: [{
                type: Input
            }], treeDataDisplayType: [{
                type: Input
            }], functionsPassive: [{
                type: Input
            }], enableGroupEdit: [{
                type: Input
            }], initialState: [{
                type: Input
            }], getContextMenuItems: [{
                type: Input
            }], getMainMenuItems: [{
                type: Input
            }], postProcessPopup: [{
                type: Input
            }], processUnpinnedColumns: [{
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
            }], getLocaleText: [{
                type: Input
            }], getDocument: [{
                type: Input
            }], paginationNumberFormatter: [{
                type: Input
            }], getGroupRowAgg: [{
                type: Input
            }], isGroupOpenByDefault: [{
                type: Input
            }], initialGroupOrderComparator: [{
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
            }], postSortRows: [{
                type: Input
            }], getRowStyle: [{
                type: Input
            }], getRowClass: [{
                type: Input
            }], getRowHeight: [{
                type: Input
            }], isFullWidthRow: [{
                type: Input
            }], toolPanelVisibleChanged: [{
                type: Output
            }], toolPanelSizeChanged: [{
                type: Output
            }], cutStart: [{
                type: Output
            }], cutEnd: [{
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
            }], columnHeaderMouseOver: [{
                type: Output
            }], columnHeaderMouseLeave: [{
                type: Output
            }], columnHeaderClicked: [{
                type: Output
            }], columnHeaderContextMenu: [{
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
            }], undoStarted: [{
                type: Output
            }], undoEnded: [{
                type: Output
            }], redoStarted: [{
                type: Output
            }], redoEnded: [{
                type: Output
            }], rangeDeleteStart: [{
                type: Output
            }], rangeDeleteEnd: [{
                type: Output
            }], filterOpened: [{
                type: Output
            }], filterChanged: [{
                type: Output
            }], filterModified: [{
                type: Output
            }], advancedFilterBuilderVisibleChanged: [{
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
            }], gridReady: [{
                type: Output
            }], gridPreDestroyed: [{
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
            }], stateUpdated: [{
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
            }], rowDataUpdated: [{
                type: Output
            }], asyncTransactionsFlushed: [{
                type: Output
            }], storeRefreshed: [{
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
            }], tooltipShow: [{
                type: Output
            }], tooltipHide: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVILFNBQVMsRUFFVCxZQUFZLEVBQ1osS0FBSyxFQUlMLE1BQU0sRUFFTixpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQVcsU0FBUyxFQUFtQyxVQUFVLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQXVLOUgsZ0JBQWdCO0FBRWhCLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxNQUFNLG9DQUFvQyxDQUFDOzs7O0FBYXRGLE1BQU0sT0FBTyxhQUFhO0lBb0J0QixZQUFZLFVBQXNCLEVBQ3RCLGdCQUFrQyxFQUNsQyx5QkFBb0QsRUFDcEQseUJBQTJEO1FBRjNELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBbkIvRCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSTNCLDBEQUEwRDtRQUNsRCxnQkFBVyxHQUF1QixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBK0hsRSxVQUFVO1FBQ1Y7ZUFDTztRQUNTLGNBQVMsR0FBb0QsU0FBUyxDQUFDO1FBQ3ZGO2VBQ087UUFDUyxZQUFPLEdBQWdFLFNBQVMsQ0FBQztRQUNqRzs7ZUFFTztRQUNTLHdCQUFtQixHQUF3QixTQUFTLENBQUM7UUFDckU7OztlQUdPO1FBQ1MsZ0NBQTJCLEdBQXdCLFNBQVMsQ0FB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c0JBQTNCLE1BQU07Z0JBR1UsYUFBYTtzQkFBN0IsTUFBTTtnQkFHVSxZQUFZO3NCQUE1QixNQUFNO2dCQUdVLGFBQWE7c0JBQTdCLE1BQU07Z0JBR1UsVUFBVTtzQkFBMUIsTUFBTTtnQkFHVSxnQkFBZ0I7c0JBQWhDLE1BQU07Z0JBR1UsV0FBVztzQkFBM0IsTUFBTTtnQkFHVSxnQkFBZ0I7c0JBQWhDLE1BQU07Z0JBR1UsZUFBZTtzQkFBL0IsTUFBTTtnQkFHVSxxQkFBcUI7c0JBQXJDLE1BQU07Z0JBRVUsV0FBVztzQkFBM0IsTUFBTTtnQkFFVSxXQUFXO3NCQUEzQixNQUFNO2dCQUdVLFdBQVc7c0JBQTNCLE1BQU07Z0JBRVUsMkJBQTJCO3NCQUEzQyxNQUFNO2dCQUVVLHdCQUF3QjtzQkFBeEMsTUFBTTtnQkFFVSx3QkFBd0I7c0JBQXhDLE1BQU07Z0JBRVUsMEJBQTBCO3NCQUExQyxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZnRlclZpZXdJbml0LFxuICAgIENvbXBvbmVudCxcbiAgICBFbGVtZW50UmVmLFxuICAgIEV2ZW50RW1pdHRlcixcbiAgICBJbnB1dCxcbiAgICBOZ1pvbmUsXG4gICAgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveSxcbiAgICBPdXRwdXQsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQgeyBBZ1Byb21pc2UsIENvbXBvbmVudFV0aWwsIEdyaWRBcGksIENvbHVtbkFwaSwgR3JpZE9wdGlvbnMsIEdyaWRQYXJhbXMsIE1vZHVsZSwgY3JlYXRlR3JpZCB9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuXG4vLyBAU1RBUlRfSU1QT1JUU0BcbmltcG9ydCB7XG4gICAgQWR2YW5jZWRGaWx0ZXJCdWlsZGVyVmlzaWJsZUNoYW5nZWRFdmVudCxcbiAgICBBZHZhbmNlZEZpbHRlck1vZGVsLFxuICAgIEFnQ2hhcnRUaGVtZSxcbiAgICBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMsXG4gICAgQWxpZ25lZEdyaWQsXG4gICAgQXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkLFxuICAgIEJvZHlTY3JvbGxFbmRFdmVudCxcbiAgICBCb2R5U2Nyb2xsRXZlbnQsXG4gICAgQ2VsbENsaWNrZWRFdmVudCxcbiAgICBDZWxsQ29udGV4dE1lbnVFdmVudCxcbiAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxFZGl0UmVxdWVzdEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIENlbGxGb2N1c2VkRXZlbnQsXG4gICAgQ2VsbEtleURvd25FdmVudCxcbiAgICBDZWxsTW91c2VEb3duRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3V0RXZlbnQsXG4gICAgQ2VsbE1vdXNlT3ZlckV2ZW50LFxuICAgIENlbGxQb3NpdGlvbixcbiAgICBDZWxsVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ2hhcnRDcmVhdGVkLFxuICAgIENoYXJ0RGVzdHJveWVkLFxuICAgIENoYXJ0T3B0aW9uc0NoYW5nZWQsXG4gICAgQ2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQsXG4gICAgQ2hhcnRSZWZQYXJhbXMsXG4gICAgQ2hhcnRUb29sUGFuZWxzRGVmLFxuICAgIENvbERlZixcbiAgICBDb2xHcm91cERlZixcbiAgICBDb2xUeXBlRGVmLFxuICAgIENvbHVtbixcbiAgICBDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uR3JvdXBPcGVuZWRFdmVudCxcbiAgICBDb2x1bW5IZWFkZXJDbGlja2VkRXZlbnQsXG4gICAgQ29sdW1uSGVhZGVyQ29udGV4dE1lbnVFdmVudCxcbiAgICBDb2x1bW5IZWFkZXJNb3VzZUxlYXZlRXZlbnQsXG4gICAgQ29sdW1uSGVhZGVyTW91c2VPdmVyRXZlbnQsXG4gICAgQ29sdW1uTW92ZWRFdmVudCxcbiAgICBDb2x1bW5QaW5uZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uUmVzaXplZEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZpc2libGVFdmVudCxcbiAgICBDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudCxcbiAgICBDc3ZFeHBvcnRQYXJhbXMsXG4gICAgQ3V0RW5kRXZlbnQsXG4gICAgQ3V0U3RhcnRFdmVudCxcbiAgICBEYXRhVHlwZURlZmluaXRpb24sXG4gICAgRGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBEb21MYXlvdXRUeXBlLFxuICAgIERyYWdTdGFydGVkRXZlbnQsXG4gICAgRHJhZ1N0b3BwZWRFdmVudCxcbiAgICBFeGNlbEV4cG9ydFBhcmFtcyxcbiAgICBFeGNlbFN0eWxlLFxuICAgIEV4cGFuZENvbGxhcHNlQWxsRXZlbnQsXG4gICAgRmlsbE9wZXJhdGlvblBhcmFtcyxcbiAgICBGaWx0ZXJDaGFuZ2VkRXZlbnQsXG4gICAgRmlsdGVyTW9kaWZpZWRFdmVudCxcbiAgICBGaWx0ZXJPcGVuZWRFdmVudCxcbiAgICBGaXJzdERhdGFSZW5kZXJlZEV2ZW50LFxuICAgIEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQsXG4gICAgR2V0Q2hhcnRUb29sYmFySXRlbXMsXG4gICAgR2V0Q29udGV4dE1lbnVJdGVtcyxcbiAgICBHZXREYXRhUGF0aCxcbiAgICBHZXRHcm91cFJvd0FnZ1BhcmFtcyxcbiAgICBHZXRMb2NhbGVUZXh0UGFyYW1zLFxuICAgIEdldE1haW5NZW51SXRlbXMsXG4gICAgR2V0Um93SWRGdW5jLFxuICAgIEdldFNlcnZlclNpZGVHcm91cEtleSxcbiAgICBHZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc1BhcmFtcyxcbiAgICBHcmlkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBHcmlkUHJlRGVzdHJveWVkRXZlbnQsXG4gICAgR3JpZFJlYWR5RXZlbnQsXG4gICAgR3JpZFNpemVDaGFuZ2VkRXZlbnQsXG4gICAgR3JpZFN0YXRlLFxuICAgIEhlYWRlclBvc2l0aW9uLFxuICAgIElBZHZhbmNlZEZpbHRlckJ1aWxkZXJQYXJhbXMsXG4gICAgSUFnZ0Z1bmMsXG4gICAgSURhdGFzb3VyY2UsXG4gICAgSVJvd0RyYWdJdGVtLFxuICAgIElSb3dOb2RlLFxuICAgIElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSxcbiAgICBJVmlld3BvcnREYXRhc291cmNlLFxuICAgIEluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvclBhcmFtcyxcbiAgICBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uLFxuICAgIElzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50UGFyYW1zLFxuICAgIElzRnVsbFdpZHRoUm93UGFyYW1zLFxuICAgIElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIElzUm93RmlsdGVyYWJsZSxcbiAgICBJc1Jvd01hc3RlcixcbiAgICBJc1Jvd1NlbGVjdGFibGUsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXAsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIExvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMsXG4gICAgTW9kZWxVcGRhdGVkRXZlbnQsXG4gICAgTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zLFxuICAgIE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIE5ld0NvbHVtbnNMb2FkZWRFdmVudCxcbiAgICBQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXMsXG4gICAgUGFzdGVFbmRFdmVudCxcbiAgICBQYXN0ZVN0YXJ0RXZlbnQsXG4gICAgUGlubmVkUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zLFxuICAgIFBvc3RTb3J0Um93c1BhcmFtcyxcbiAgICBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXMsXG4gICAgUHJvY2Vzc0dyb3VwSGVhZGVyRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc1Jvd1BhcmFtcyxcbiAgICBQcm9jZXNzVW5waW5uZWRDb2x1bW5zUGFyYW1zLFxuICAgIFJhbmdlRGVsZXRlRW5kRXZlbnQsXG4gICAgUmFuZ2VEZWxldGVTdGFydEV2ZW50LFxuICAgIFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIFJlZG9FbmRlZEV2ZW50LFxuICAgIFJlZG9TdGFydGVkRXZlbnQsXG4gICAgUm93Q2xhc3NQYXJhbXMsXG4gICAgUm93Q2xhc3NSdWxlcyxcbiAgICBSb3dDbGlja2VkRXZlbnQsXG4gICAgUm93RGF0YVVwZGF0ZWRFdmVudCxcbiAgICBSb3dEb3VibGVDbGlja2VkRXZlbnQsXG4gICAgUm93RHJhZ0V2ZW50LFxuICAgIFJvd0VkaXRpbmdTdGFydGVkRXZlbnQsXG4gICAgUm93RWRpdGluZ1N0b3BwZWRFdmVudCxcbiAgICBSb3dHcm91cE9wZW5lZEV2ZW50LFxuICAgIFJvd0dyb3VwaW5nRGlzcGxheVR5cGUsXG4gICAgUm93SGVpZ2h0UGFyYW1zLFxuICAgIFJvd01vZGVsVHlwZSxcbiAgICBSb3dTZWxlY3RlZEV2ZW50LFxuICAgIFJvd1N0eWxlLFxuICAgIFJvd1ZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIFNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBTZW5kVG9DbGlwYm9hcmRQYXJhbXMsXG4gICAgU2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXMsXG4gICAgU2lkZUJhckRlZixcbiAgICBTaXplQ29sdW1uc1RvQ29udGVudFN0cmF0ZWd5LFxuICAgIFNpemVDb2x1bW5zVG9GaXRHcmlkU3RyYXRlZ3ksXG4gICAgU2l6ZUNvbHVtbnNUb0ZpdFByb3ZpZGVkV2lkdGhTdHJhdGVneSxcbiAgICBTb3J0Q2hhbmdlZEV2ZW50LFxuICAgIFNvcnREaXJlY3Rpb24sXG4gICAgU3RhdGVVcGRhdGVkRXZlbnQsXG4gICAgU3RhdHVzUGFuZWxEZWYsXG4gICAgU3RvcmVSZWZyZXNoZWRFdmVudCxcbiAgICBUYWJUb05leHRDZWxsUGFyYW1zLFxuICAgIFRhYlRvTmV4dEhlYWRlclBhcmFtcyxcbiAgICBUb29sUGFuZWxTaXplQ2hhbmdlZEV2ZW50LFxuICAgIFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQsXG4gICAgVG9vbHRpcEhpZGVFdmVudCxcbiAgICBUb29sdGlwU2hvd0V2ZW50LFxuICAgIFRyZWVEYXRhRGlzcGxheVR5cGUsXG4gICAgVW5kb0VuZGVkRXZlbnQsXG4gICAgVW5kb1N0YXJ0ZWRFdmVudCxcbiAgICBVc2VHcm91cEZvb3RlcixcbiAgICBWaWV3cG9ydENoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50XG59IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuLy8gQEVORF9JTVBPUlRTQFxuXG5pbXBvcnQgeyBBbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzIH0gZnJvbSBcIi4vYW5ndWxhckZyYW1ld29ya092ZXJyaWRlc1wiO1xuaW1wb3J0IHsgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIgfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclwiO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtYW5ndWxhcicsXG4gICAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgXSxcbiAgICAvLyB0ZWxsIGFuZ3VsYXIgd2UgZG9uJ3Qgd2FudCB2aWV3IGVuY2Fwc3VsYXRpb24sIHdlIGRvbid0IHdhbnQgYSBzaGFkb3cgcm9vdFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhcjxURGF0YSA9IGFueSwgVENvbERlZiBleHRlbmRzIENvbERlZjxURGF0YT4gPSBDb2xEZWY8YW55Pj4gaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gICAgLy8gbm90IGludGVuZGVkIGZvciB1c2VyIHRvIGludGVyYWN0IHdpdGguIHNvIHB1dHRpbmcgXyBpbiBzbyBpZiB1c2VyIGdldHMgcmVmZXJlbmNlXG4gICAgLy8gdG8gdGhpcyBvYmplY3QsIHRoZXkga2luZCdhIGtub3cgaXQncyBub3QgcGFydCBvZiB0aGUgYWdyZWVkIGludGVyZmFjZVxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBncmlkUGFyYW1zOiBHcmlkUGFyYW1zO1xuXG4gICAgLy8gaW4gb3JkZXIgdG8gZW5zdXJlIGZpcmluZyBvZiBncmlkUmVhZHkgaXMgZGV0ZXJtaW5pc3RpY1xuICAgIHByaXZhdGUgX2Z1bGx5UmVhZHk6IEFnUHJvbWlzZTxib29sZWFuPiA9IEFnUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXG4gICAgLyoqIEdyaWQgQXBpIGF2YWlsYWJsZSBhZnRlciBvbkdyaWRSZWFkeSBldmVudCBoYXMgZmlyZWQuICovXG4gICAgcHVibGljIGFwaTogR3JpZEFwaTxURGF0YT47XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgdjMxIC0gVGhlIGBjb2x1bW5BcGlgIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIGFsbCB0aGUgbWV0aG9kcyBhcmUgbm93IHByZXNlbnQgb2YgdGhlIGBhcGlgLlxuICAgICAqIFBsZWFzZSB1c2UgdGhlIGBhcGlgIGluc3RlYWQuXG4gICAgICovXG4gICAgcHVibGljIGNvbHVtbkFwaTogQ29sdW1uQXBpO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudERlZjogRWxlbWVudFJlZixcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICBwcml2YXRlIGFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXM6IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIHByaXZhdGUgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICApIHtcbiAgICAgICAgdGhpcy5fbmF0aXZlRWxlbWVudCA9IGVsZW1lbnREZWYubmF0aXZlRWxlbWVudDtcbiAgICB9XG5cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgIC8vIFJ1biB0aGUgc2V0dXAgb3V0c2lkZSBvZiBhbmd1bGFyIHNvIGFsbCB0aGUgZXZlbnQgaGFuZGxlcnMgdGhhdCBhcmUgY3JlYXRlZCBkbyBub3QgdHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uXG4gICAgICB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRWaWV3Q29udGFpbmVyUmVmKHRoaXMudmlld0NvbnRhaW5lclJlZiwgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzKTtcbiAgICAgICAgICBjb25zdCBtZXJnZWRHcmlkT3BzID0gQ29tcG9uZW50VXRpbC5jb21iaW5lQXR0cmlidXRlc0FuZEdyaWRPcHRpb25zKHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMpO1xuXG4gICAgICAgICAgdGhpcy5ncmlkUGFyYW1zID0ge1xuICAgICAgICAgICAgICAgZ2xvYmFsRXZlbnRMaXN0ZW5lcjogdGhpcy5nbG9iYWxFdmVudExpc3RlbmVyLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICBmcmFtZXdvcmtPdmVycmlkZXM6IHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgICAgICAgIHByb3ZpZGVkQmVhbkluc3RhbmNlczoge1xuICAgICAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIsXG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgbW9kdWxlczogKHRoaXMubW9kdWxlcyB8fCBbXSkgYXMgYW55LFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBjb25zdCBhcGkgPSBjcmVhdGVHcmlkKHRoaXMuX25hdGl2ZUVsZW1lbnQsIG1lcmdlZEdyaWRPcHMsIHRoaXMuZ3JpZFBhcmFtcyk7XG4gICAgICAgICAgaWYgKGFwaSkge1xuICAgICAgICAgICAgICAgdGhpcy5hcGkgPSBhcGk7XG4gICAgICAgICAgICAgICB0aGlzLmNvbHVtbkFwaSA9IG5ldyBDb2x1bW5BcGkoYXBpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBGb3IgUnhKcyBjb21wYXRpYmlsaXR5IHdlIG5lZWQgdG8gY2hlY2sgZm9yIG9ic2VydmVkIHY3KyBvciBvYnNlcnZlcnMgdjZcbiAgICAgICAgICBjb25zdCBncmlkUHJlRGVzdHJveWVkRW1pdHRlciA9IHRoaXMuZ3JpZFByZURlc3Ryb3llZCBhcyBhbnk7XG4gICAgICAgICAgaWYgKGdyaWRQcmVEZXN0cm95ZWRFbWl0dGVyLm9ic2VydmVkID8/IGdyaWRQcmVEZXN0cm95ZWRFbWl0dGVyLm9ic2VydmVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICdBRyBHcmlkOiBncmlkUHJlRGVzdHJveWVkIGV2ZW50IGxpc3RlbmVyIHJlZ2lzdGVyZWQgdmlhIChncmlkUHJlRGVzdHJveWVkKT1cIm1ldGhvZCgkZXZlbnQpXCIgd2lsbCBiZSBpZ25vcmVkISAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIGFzc2lnbiB2aWEgZ3JpZE9wdGlvbnMuZ3JpZFByZURlc3Ryb3llZCBhbmQgcGFzcyB0byB0aGUgZ3JpZCBhcyBbZ3JpZE9wdGlvbnNdPVwiZ3JpZE9wdGlvbnNcIidcbiAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5faW5pdGlhbGlzZWQgPSB0cnVlO1xuXG4gICAgICAgICAgLy8gc29tZXRpbWVzLCBlc3BlY2lhbGx5IGluIGxhcmdlIGNsaWVudCBhcHBzIGdyaWRSZWFkeSBjYW4gZmlyZSBiZWZvcmUgbmdBZnRlclZpZXdJbml0XG4gICAgICAgICAgLy8gdGhpcyB0aWVzIHRoZXNlIHRvZ2V0aGVyIHNvIHRoYXQgZ3JpZFJlYWR5IHdpbGwgYWx3YXlzIGZpcmUgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAgIC8vIHRoZSBhY3R1YWwgY29udGFpbmluZyBjb21wb25lbnQncyBuZ0FmdGVyVmlld0luaXQgd2lsbCBmaXJlIGp1c3QgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzXG4gICAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS5yZXNvbHZlTm93KG51bGwsIChyZXNvbHZlKSA9PiByZXNvbHZlKTtcbiAgICAgICB9KTtcbiAgICAgfVxuXG4gICAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAgICAvLyBSdW4gdGhlIGNoYW5nZXMgb3V0c2lkZSBvZiBhbmd1bGFyIHNvIGFueSBldmVudCBoYW5kbGVycyB0aGF0IGFyZSBjcmVhdGVkIGRvIG5vdCB0cmlnZ2VyIGNoYW5nZSBkZXRlY3Rpb25cbiAgICAgICAgICAgICB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICBjb25zdCBncmlkT3B0aW9uczogR3JpZE9wdGlvbnMgPSB7fTtcbiAgICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoY2hhbmdlcykuZm9yRWFjaCgoW2tleSwgdmFsdWVdOiBbc3RyaW5nLCBhbnldKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICBncmlkT3B0aW9uc1trZXkgYXMga2V5b2YgR3JpZE9wdGlvbnNdID0gdmFsdWUuY3VycmVudFZhbHVlO1xuICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgQ29tcG9uZW50VXRpbC5wcm9jZXNzT25DaGFuZ2UoZ3JpZE9wdGlvbnMsIHRoaXMuYXBpKTtcbiAgICAgICAgICAgICB9KTtcbiAgICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgICAgLy8gbmVlZCB0byBkbyB0aGlzIGJlZm9yZSB0aGUgZGVzdHJveSwgc28gd2Uga25vdyBub3QgdG8gZW1pdCBhbnkgZXZlbnRzXG4gICAgICAgICAgICAvLyB3aGlsZSB0ZWFyaW5nIGRvd24gdGhlIGdyaWQuXG4gICAgICAgICAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICAgICAgIC8vIGNvdWxkIGJlIG51bGwgaWYgZ3JpZCBmYWlsZWQgdG8gaW5pdGlhbGlzZVxuICAgICAgICAgICAgIHRoaXMuYXBpPy5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSdsbCBlbWl0IHRoZSBlbWl0IGlmIGEgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGEgZ2l2ZW4gZXZlbnQgZWl0aGVyIG9uIHRoZSBjb21wb25lbnQgdmlhIG5vcm1hbCBhbmd1bGFyIGJpbmRpbmdcbiAgICAvLyBvciB2aWEgZ3JpZE9wdGlvbnNcbiAgICBwcm90ZWN0ZWQgaXNFbWl0dGVyVXNlZChldmVudFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIC8vIEZvciBSeEpzIGNvbXBhdGliaWxpdHkgd2UgbmVlZCB0byBjaGVjayBmb3Igb2JzZXJ2ZWQgdjcrIG9yIG9ic2VydmVycyB2NlxuICAgICAgICBjb25zdCBlbWl0dGVyQW55ID0gZW1pdHRlciBhcyBhbnk7XG4gICAgICAgIGNvbnN0IGhhc0VtaXR0ZXIgPSBlbWl0dGVyQW55Py5vYnNlcnZlZCA/PyBlbWl0dGVyQW55Py5vYnNlcnZlcnM/Lmxlbmd0aCA+IDA7XG5cbiAgICAgICAgLy8gZ3JpZFJlYWR5ID0+IG9uR3JpZFJlYWR5XG4gICAgICAgIGNvbnN0IGFzRXZlbnROYW1lID0gYG9uJHtldmVudFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCl9JHtldmVudFR5cGUuc3Vic3RyaW5nKDEpfWBcbiAgICAgICAgY29uc3QgaGFzR3JpZE9wdGlvbkxpc3RlbmVyID0gISF0aGlzLmdyaWRPcHRpb25zICYmICEhKHRoaXMuZ3JpZE9wdGlvbnMgYXMgYW55KVthc0V2ZW50TmFtZV07XG5cbiAgICAgICAgcmV0dXJuIGhhc0VtaXR0ZXIgfHwgaGFzR3JpZE9wdGlvbkxpc3RlbmVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2xvYmFsRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IHN0cmluZywgZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgdGVhcmluZyBkb3duLCBkb24ndCBlbWl0IGFuZ3VsYXIgZXZlbnRzLCBhcyB0aGlzIGNhdXNlc1xuICAgICAgICAvLyBwcm9ibGVtcyB3aXRoIHRoZSBhbmd1bGFyIHJvdXRlclxuICAgICAgICBpZiAodGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZW5lcmljYWxseSBsb29rIHVwIHRoZSBldmVudFR5cGVcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBpZiAoZW1pdHRlciAmJiB0aGlzLmlzRW1pdHRlclVzZWQoZXZlbnRUeXBlKSkge1xuXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgd2UgZW1pdCB3aXRoaW4gdGhlIGFuZ3VsYXIgem9uZSwgc28gY2hhbmdlIGRldGVjdGlvbiB3b3JrcyBwcm9wZXJseVxuICAgICAgICAgICAgY29uc3QgZmlyZUVtaXR0ZXIgPSAoKSA9PiB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMucnVuSW5zaWRlQW5ndWxhcigoKSA9PiBlbWl0dGVyLmVtaXQoZXZlbnQpKTtcblxuICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gJ2dyaWRSZWFkeScpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGdyaWRSZWFkeSwgd2FpdCBmb3IgbmdBZnRlclZpZXdJbml0IHRvIGZpcmUgZmlyc3QsIHRoZW4gZW1pdCB0aGVuIGdyaWRSZWFkeSBldmVudFxuICAgICAgICAgICAgICAgIHRoaXMuX2Z1bGx5UmVhZHkudGhlbigoKSA9PiBmaXJlRW1pdHRlcigpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyZUVtaXR0ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgICAvKiogUHJvdmlkZWQgYW4gaW5pdGlhbCBncmlkT3B0aW9ucyBjb25maWd1cmF0aW9uIHRvIHRoZSBjb21wb25lbnQuIElmIGEgcHJvcGVydHkgaXMgc3BlY2lmaWVkIGluIGJvdGggZ3JpZE9wdGlvbnMgYW5kIHZpYSBjb21wb25lbnQgYmluZGluZyB0aGUgY29tcG9uZW50IGJpbmRpbmcgdGFrZXMgcHJlY2VkZW5jZS4gICovXG4gICAgIEBJbnB1dCgpIHB1YmxpYyBncmlkT3B0aW9uczogR3JpZE9wdGlvbnM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgICAvKipcbiAgICAgKiBVc2VkIHRvIHJlZ2lzdGVyIEFHIEdyaWQgTW9kdWxlcyBkaXJlY3RseSB3aXRoIHRoaXMgaW5zdGFuY2Ugb2YgdGhlIGdyaWQuXG4gICAgICogU2VlIFtQcm92aWRpbmcgTW9kdWxlcyBUbyBJbmRpdmlkdWFsIEdyaWRzXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9hbmd1bGFyLWRhdGEtZ3JpZC9tb2R1bGVzLyNwcm92aWRpbmctbW9kdWxlcy10by1pbmRpdmlkdWFsLWdyaWRzKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICAgKi9cbiAgICAgQElucHV0KCkgcHVibGljIG1vZHVsZXM6IE1vZHVsZVtdIHwgdW5kZWZpbmVkO1xuXG4gICAgLy8gQFNUQVJUQFxuICAgIC8qKiBTcGVjaWZpZXMgdGhlIHN0YXR1cyBiYXIgY29tcG9uZW50cyB0byB1c2UgaW4gdGhlIHN0YXR1cyBiYXIuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdGF0dXNCYXI6IHsgc3RhdHVzUGFuZWxzOiBTdGF0dXNQYW5lbERlZltdOyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZpZXMgdGhlIHNpZGUgYmFyIGNvbXBvbmVudHMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaWRlQmFyOiBTaWRlQmFyRGVmIHwgc3RyaW5nIHwgc3RyaW5nW10gfCBib29sZWFuIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBub3Qgc2hvdyB0aGUgY29udGV4dCBtZW51LiBVc2UgaWYgeW91IGRvbid0IHdhbnQgdG8gdXNlIHRoZSBkZWZhdWx0ICdyaWdodCBjbGljaycgY29udGV4dCBtZW51LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyBgc3VwcHJlc3NDb250ZXh0TWVudWAsIHlvdSBjYW4gdXNlIHRoZSBgb25DZWxsQ29udGV4dE1lbnVgIGZ1bmN0aW9uIHRvIHByb3ZpZGUgeW91ciBvd24gY29kZSB0byBoYW5kbGUgY2VsbCBgY29udGV4dG1lbnVgIGV2ZW50cy5cbiAgICAgICAgICogVGhpcyBmbGFnIGlzIHVzZWZ1bCB0byBwcmV2ZW50IHRoZSBicm93c2VyIGZyb20gc2hvd2luZyBpdHMgZGVmYXVsdCBjb250ZXh0IG1lbnUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcmV2ZW50RGVmYXVsdE9uQ29udGV4dE1lbnU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjb250ZXh0IG1lbnUgdG8gc2hvdywgZXZlbiB3aGVuIGBDdHJsYCBrZXkgaXMgaGVsZCBkb3duLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSBjb2x1bW4gbWVudSBidXR0b24sIHJhdGhlciB0aGFuIG9ubHkgc2hvd2luZyB3aGVuIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSBjb2x1bW4gaGVhZGVyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51SGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB1c2UgdGhlIGJyb3dzZXIncyBkZWZhdWx0IHRvb2x0aXAgaW5zdGVhZCBvZiB1c2luZyB0aGUgZ3JpZCdzIFRvb2x0aXAgQ29tcG9uZW50LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQnJvd3NlclRvb2x0aXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgdHJpZ2dlciB0aGF0IHdpbGwgY2F1c2UgdG9vbHRpcHMgdG8gc2hvdyBhbmQgaGlkZS5cbiAgICAgICAgICogIC0gYGhvdmVyYCAtIFRoZSB0b29sdGlwIHdpbGwgc2hvdy9oaWRlIHdoZW4gYSBjZWxsL2hlYWRlciBpcyBob3ZlcmVkLlxuICAgICAgICAgKiAgLSBgZm9jdXNgIC0gVGhlIHRvb2x0aXAgd2lsbCBzaG93L2hpZGUgd2hlbiBhIGNlbGwvaGVhZGVyIGlzIGZvY3VzZWQuXG4gICAgICAgICAqIEBkZWZhdWx0ICdob3ZlcidcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBUcmlnZ2VyOiAnaG92ZXInIHwgJ2ZvY3VzJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyB0aGF0IGl0IHRha2VzIGZvciB0b29sdGlwcyB0byBzaG93IHVwIG9uY2UgYW4gZWxlbWVudCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgICAgICAqICAgICAqKk5vdGU6KiogVGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCB3b3JrIGlmIGBlbmFibGVCcm93c2VyVG9vbHRpcHNgIGlzIGB0cnVlYC5cbiAgICAgICAgICogQGRlZmF1bHQgMjAwMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFNob3dEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIHRoYXQgaXQgdGFrZXMgZm9yIHRvb2x0aXBzIHRvIGhpZGUgb25jZSB0aGV5IGhhdmUgYmVlbiBkaXNwbGF5ZWQuXG4gICAgICAgICAqICAgICAqKk5vdGU6KiogVGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCB3b3JrIGlmIGBlbmFibGVCcm93c2VyVG9vbHRpcHNgIGlzIGB0cnVlYCBhbmQgYHRvb2x0aXBIaWRlVHJpZ2dlcnNgIGluY2x1ZGVzIGB0aW1lb3V0YC5cbiAgICAgICAgICogQGRlZmF1bHQgMTAwMDBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBIaWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRvb2x0aXBzIGZvbGxvdyB0aGUgY3Vyc29yIG9uY2UgdGhleSBhcmUgZGlzcGxheWVkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRvb2x0aXAgaW50ZXJhY3Rpb24uIFdoZW4gdGhpcyBvcHRpb24gaXMgZW5hYmxlZCwgdGhlIHRvb2x0aXAgd2lsbCBub3QgaGlkZSB3aGlsZSB0aGVcbiAgICAgICAgICogdG9vbHRpcCBpdHNlbGYgaXQgYmVpbmcgaG92ZXJlZCBvciBoYXMgZm9jdXMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwSW50ZXJhY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERPTSBlbGVtZW50IHRvIHVzZSBhcyB0aGUgcG9wdXAgcGFyZW50IGZvciBncmlkIHBvcHVwcyAoY29udGV4dCBtZW51LCBjb2x1bW4gbWVudSBldGMpLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9wdXBQYXJlbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgZ3JvdXAgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUdyb3VwSGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZ5IHRoZSBkZWxpbWl0ZXIgdG8gdXNlIHdoZW4gY29weWluZyB0byBjbGlwYm9hcmQuXG4gICAgICAgICAqIEBkZWZhdWx0ICdcXHQnXG4gICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNsaXBib2FyZERlbGltaXRlcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvcHkgdGhlIGNlbGwgcmFuZ2Ugb3IgZm9jdXNlZCBjZWxsIHRvIHRoZSBjbGlwYm9hcmQgYW5kIG5ldmVyIHRoZSBzZWxlY3RlZCByb3dzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvcHkgcm93cyBpbnN0ZWFkIG9mIHJhbmdlcyB3aGVuIGEgcmFuZ2Ugd2l0aCBvbmx5IGEgc2luZ2xlIGNlbGwgaXMgc2VsZWN0ZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlTaW5nbGVDZWxsUmFuZ2VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHdvcmsgYXJvdW5kIGEgYnVnIHdpdGggRXhjZWwgKFdpbmRvd3MpIHRoYXQgYWRkcyBhbiBleHRyYSBlbXB0eSBsaW5lIGF0IHRoZSBlbmQgb2YgcmFuZ2VzIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMYXN0RW1wdHlMaW5lT25QYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB0dXJuIG9mZiBwYXN0ZSBvcGVyYXRpb25zIHdpdGhpbiB0aGUgZ3JpZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3RvcCB0aGUgZ3JpZCB0cnlpbmcgdG8gdXNlIHRoZSBDbGlwYm9hcmQgQVBJLCBpZiBpdCBpcyBibG9ja2VkLCBhbmQgaW1tZWRpYXRlbHkgZmFsbGJhY2sgdG8gdGhlIHdvcmthcm91bmQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZEFwaTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBibG9jayAgICAgKipjdXQqKiBvcGVyYXRpb25zIHdpdGhpbiB0aGUgZ3JpZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3V0VG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IG9mIENvbHVtbiAvIENvbHVtbiBHcm91cCBkZWZpbml0aW9ucy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnM6IChUQ29sRGVmIHwgQ29sR3JvdXBEZWY8VERhdGE+KVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uLiBJdGVtcyBkZWZpbmVkIGluIHRoZSBhY3R1YWwgY29sdW1uIGRlZmluaXRpb25zIGdldCBwcmVjZWRlbmNlLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbERlZjogQ29sRGVmPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBncm91cCBkZWZpbml0aW9uLiBBbGwgY29sdW1uIGdyb3VwIGRlZmluaXRpb25zIHdpbGwgdXNlIHRoZXNlIHByb3BlcnRpZXMuIEl0ZW1zIGRlZmluZWQgaW4gdGhlIGFjdHVhbCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbiBnZXQgcHJlY2VkZW5jZS5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZjogUGFydGlhbDxDb2xHcm91cERlZjxURGF0YT4+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3QgbWFwIG9mIGN1c3RvbSBjb2x1bW4gdHlwZXMgd2hpY2ggY29udGFpbiBncm91cHMgb2YgcHJvcGVydGllcyB0aGF0IGNvbHVtbiBkZWZpbml0aW9ucyBjYW4gcmV1c2UgYnkgcmVmZXJlbmNpbmcgaW4gdGhlaXIgYHR5cGVgIHByb3BlcnR5LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uVHlwZXM6IHsgW2tleTogc3RyaW5nXTogQ29sVHlwZURlZjxURGF0YT47IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBtYXAgb2YgY2VsbCBkYXRhIHR5cGVzIHRvIHRoZWlyIGRlZmluaXRpb25zLlxuICAgICAgICAgKiBDZWxsIGRhdGEgdHlwZXMgY2FuIGVpdGhlciBvdmVycmlkZS91cGRhdGUgdGhlIHByZS1kZWZpbmVkIGRhdGEgdHlwZXNcbiAgICAgICAgICogKGAndGV4dCdgLCBgJ251bWJlcidgLCAgYCdib29sZWFuJ2AsICBgJ2RhdGUnYCwgIGAnZGF0ZVN0cmluZydgIG9yICBgJ29iamVjdCdgKSxcbiAgICAgICAgICogb3IgY2FuIGJlIGN1c3RvbSBkYXRhIHR5cGVzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0YVR5cGVEZWZpbml0aW9uczoge1xuICAgICAgICBbY2VsbERhdGFUeXBlOiBzdHJpbmddOiBEYXRhVHlwZURlZmluaXRpb248VERhdGE+O1xuICAgIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEtlZXBzIHRoZSBvcmRlciBvZiBDb2x1bW5zIG1haW50YWluZWQgYWZ0ZXIgbmV3IENvbHVtbiBEZWZpbml0aW9ucyBhcmUgdXBkYXRlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlbiBkb3RzIGluIGZpZWxkIG5hbWVzIChlLmcuIGAnYWRkcmVzcy5maXJzdExpbmUnYCkgYXJlIG5vdCB0cmVhdGVkIGFzIGRlZXAgcmVmZXJlbmNlcy4gQWxsb3dzIHlvdSB0byB1c2UgZG90cyBpbiB5b3VyIGZpZWxkIG5hbWUgaWYgeW91IHByZWZlci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgY29sdW1uIGxhYmVsIGhlYWRlci4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyB0aGUgdGhlbWUgdmFsdWUgb2YgYGhlYWRlci1oZWlnaHRgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93cyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgZmxvYXRpbmcgZmlsdGVycy4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyB0aGUgdGhlbWUgdmFsdWUgb2YgYGhlYWRlci1oZWlnaHRgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGNvbHVtbnMgd2hlbiBpbiBwaXZvdCBtb2RlLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyBoZWFkZXIgY29sdW1uIGdyb3VwcyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGdyb3VwSGVhZGVySGVpZ2h0YC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90R3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3cgcmVvcmRlcmluZyBhbmQgcGlubmluZyBjb2x1bW5zIGJ5IGRyYWdnaW5nIGNvbHVtbnMgZnJvbSB0aGUgQ29sdW1ucyBUb29sIFBhbmVsIHRvIHRoZSBncmlkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3MgY29sdW1uIG1vdmluZywgaS5lLiB0byBtYWtlIHRoZSBjb2x1bW5zIGZpeGVkIHBvc2l0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgYGFnLWNvbHVtbi1tb3ZpbmdgIGNsYXNzIGlzIG5vdCBhZGRlZCB0byB0aGUgZ3JpZCB3aGlsZSBjb2x1bW5zIGFyZSBtb3ZpbmcuIEluIHRoZSBkZWZhdWx0IHRoZW1lcywgdGhpcyByZXN1bHRzIGluIG5vIGFuaW1hdGlvbiB3aGVuIG1vdmluZyBjb2x1bW5zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHdoZW4geW91IGRyYWcgYSBjb2x1bW4gb3V0IG9mIHRoZSBncmlkIChlLmcuIHRvIHRoZSBncm91cCB6b25lKSB0aGUgY29sdW1uIGlzIG5vdCBoaWRkZW4uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB3aGVuIHlvdSBkcmFnIGEgY29sdW1uIGludG8gYSByb3cgZ3JvdXAgcGFuZWwgdGhlIGNvbHVtbiBpcyBub3QgaGlkZGVuLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dHcm91cEhpZGVzQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnc2hpZnQnYCB0byBoYXZlIHNoaWZ0LXJlc2l6ZSBhcyB0aGUgZGVmYXVsdCByZXNpemUgb3BlcmF0aW9uIChzYW1lIGFzIHVzZXIgaG9sZGluZyBkb3duIGBTaGlmdGAgd2hpbGUgcmVzaXppbmcpLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sUmVzaXplRGVmYXVsdDogJ3NoaWZ0JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3NlcyBhdXRvLXNpemluZyBjb2x1bW5zIGZvciBjb2x1bW5zLiBJbiBvdGhlciB3b3JkcywgZG91YmxlIGNsaWNraW5nIGEgY29sdW1uJ3MgaGVhZGVyJ3MgZWRnZSB3aWxsIG5vdCBhdXRvLXNpemUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBOdW1iZXIgb2YgcGl4ZWxzIHRvIGFkZCB0byBhIGNvbHVtbiB3aWR0aCBhZnRlciB0aGUgW2F1dG8tc2l6aW5nXSgvY29sdW1uLXNpemluZy8jYXV0by1zaXplLWNvbHVtbnMtdG8tZml0LWNlbGwtY29udGVudHMpIGNhbGN1bGF0aW9uLlxuICAgICAgICAgKiBTZXQgdGhpcyBpZiB5b3Ugd2FudCB0byBhZGQgZXh0cmEgcm9vbSB0byBhY2NvbW1vZGF0ZSAoZm9yIGV4YW1wbGUpIHNvcnQgaWNvbnMsIG9yIHNvbWUgb3RoZXIgZHluYW1pYyBuYXR1cmUgb2YgdGhlIGhlYWRlci5cbiAgICAgICAgICogQGRlZmF1bHQgMjBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGF1dG9TaXplUGFkZGluZzogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc2tpcCB0aGUgYGhlYWRlck5hbWVgIHdoZW4gYGF1dG9TaXplYCBpcyBjYWxsZWQgYnkgZGVmYXVsdC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBdXRvLXNpemUgdGhlIGNvbHVtbnMgd2hlbiB0aGUgZ3JpZCBpcyBsb2FkZWQuIENhbiBzaXplIHRvIGZpdCB0aGUgZ3JpZCB3aWR0aCwgZml0IGEgcHJvdmlkZWQgd2lkdGgsIG9yIGZpdCB0aGUgY2VsbCBjb250ZW50cy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGF1dG9TaXplU3RyYXRlZ3k6IFNpemVDb2x1bW5zVG9GaXRHcmlkU3RyYXRlZ3kgfCBTaXplQ29sdW1uc1RvRml0UHJvdmlkZWRXaWR0aFN0cmF0ZWd5IHwgU2l6ZUNvbHVtbnNUb0NvbnRlbnRTdHJhdGVneSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2YgY29tcG9uZW50IG5hbWVzIHRvIGNvbXBvbmVudHMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb21wb25lbnRzOiB7IFtwOiBzdHJpbmddOiBhbnk7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ2Z1bGxSb3cnYCB0byBlbmFibGUgRnVsbCBSb3cgRWRpdGluZy4gT3RoZXJ3aXNlIGxlYXZlIGJsYW5rIHRvIGVkaXQgb25lIGNlbGwgYXQgYSB0aW1lLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdFR5cGU6ICdmdWxsUm93JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgU2luZ2xlIENsaWNrIEVkaXRpbmcgZm9yIGNlbGxzLCB0byBzdGFydCBlZGl0aW5nIHdpdGggYSBzaW5nbGUgY2xpY2suXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCBuZWl0aGVyIHNpbmdsZSBub3IgZG91YmxlIGNsaWNrIHN0YXJ0cyBlZGl0aW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlja0VkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3RvcCB0aGUgZ3JpZCB1cGRhdGluZyBkYXRhIGFmdGVyIGBFZGl0YCwgYENsaXBib2FyZGAgYW5kIGBGaWxsIEhhbmRsZWAgb3BlcmF0aW9ucy4gV2hlbiB0aGlzIGlzIHNldCwgaXQgaXMgaW50ZW5kZWQgdGhlIGFwcGxpY2F0aW9uIHdpbGwgdXBkYXRlIHRoZSBkYXRhLCBlZyBpbiBhbiBleHRlcm5hbCBpbW11dGFibGUgc3RvcmUsIGFuZCB0aGVuIHBhc3MgdGhlIG5ldyBkYXRhc2V0IHRvIHRoZSBncmlkLiA8YnIgLz4qKk5vdGU6KiogYHJvd05vZGUuc2V0RGF0YVZhbHVlKClgIGRvZXMgbm90IHVwZGF0ZSB0aGUgdmFsdWUgb2YgdGhlIGNlbGwgd2hlbiB0aGlzIGlzIGBUcnVlYCwgaXQgZmlyZXMgYG9uQ2VsbEVkaXRSZXF1ZXN0YCBpbnN0ZWFkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVhZE9ubHlFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc3RvcCBjZWxsIGVkaXRpbmcgd2hlbiBncmlkIGxvc2VzIGZvY3VzLlxuICAgICAgICAgKiBUaGUgZGVmYXVsdCBpcyB0aGF0IHRoZSBncmlkIHN0YXlzIGVkaXRpbmcgdW50aWwgZm9jdXMgZ29lcyBvbnRvIGFub3RoZXIgY2VsbC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0b3BFZGl0aW5nV2hlbkNlbGxzTG9zZUZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MzAsIG5vIGxvbmdlciB1c2VkLiBUbyBuYXZpZ2F0ZSB3aXRoIHRoZSBFbnRlciBrZXkgdXNlIGBlbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHlgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYzMCwgbm8gbG9uZ2VyIHVzZWQuIFRvIG5hdmlnYXRlIHdpdGggdGhlIEVudGVyIGtleSBhZnRlciBlZGl0IHVzZSBgZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5QWZ0ZXJFZGl0YC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGFsb25nIHdpdGggYGVudGVyTmF2aWdhdGVzVmVydGljYWxseUFmdGVyRWRpdGAgdG8gaGF2ZSBFeGNlbC1zdHlsZSBiZWhhdmlvdXIgZm9yIHRoZSBgRW50ZXJgIGtleS5cbiAgICAgICAgICogaS5lLiBwcmVzc2luZyB0aGUgYEVudGVyYCBrZXkgd2lsbCBtb3ZlIGRvd24gdG8gdGhlIGNlbGwgYmVuZWF0aCBhbmQgYFNoaWZ0K0VudGVyYCB3aWxsIG1vdmUgdXAgdG8gdGhlIGNlbGwgYWJvdmUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgYWxvbmcgd2l0aCBgZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5YCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlICdFbnRlcicga2V5LlxuICAgICAgICAgKiBpLmUuIHByZXNzaW5nIHRoZSBFbnRlciBrZXkgd2lsbCBtb3ZlIGRvd24gdG8gdGhlIGNlbGwgYmVuZWF0aCBhbmQgU2hpZnQrRW50ZXIga2V5IHdpbGwgbW92ZSB1cCB0byB0aGUgY2VsbCBhYm92ZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTmF2aWdhdGVzVmVydGljYWxseUFmdGVyRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRm9yY2VzIENlbGwgRWRpdGluZyB0byBzdGFydCB3aGVuIGJhY2tzcGFjZSBpcyBwcmVzc2VkLiBUaGlzIGlzIG9ubHkgcmVsZXZhbnQgZm9yIE1hY09TIHVzZXJzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbEVkaXRpbmdPbkJhY2tzcGFjZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgVW5kbyAvIFJlZG8gd2hpbGUgZWRpdGluZy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGUgc2l6ZSBvZiB0aGUgdW5kbyAvIHJlZG8gc3RhY2suXG4gICAgICAgICAqIEBkZWZhdWx0IDEwXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1bmRvUmVkb0NlbGxFZGl0aW5nTGltaXQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gZXhwb3J0IHRvIENTVi5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDc3ZFeHBvcnRQYXJhbXM6IENzdkV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJldmVudHMgdGhlIHVzZXIgZnJvbSBleHBvcnRpbmcgdGhlIGdyaWQgdG8gQ1NWLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDc3ZFeHBvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGV4cG9ydCB0byBFeGNlbC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRFeGNlbEV4cG9ydFBhcmFtczogRXhjZWxFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIHRoZSB1c2VyIGZyb20gZXhwb3J0aW5nIHRoZSBncmlkIHRvIEV4Y2VsLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBsaXN0IChhcnJheSkgb2YgRXhjZWwgc3R5bGVzIHRvIGJlIHVzZWQgd2hlbiBleHBvcnRpbmcgdG8gRXhjZWwgd2l0aCBzdHlsZXMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogRXhjZWxTdHlsZVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSb3dzIGFyZSBmaWx0ZXJlZCB1c2luZyB0aGlzIHRleHQgYXMgYSBRdWljayBGaWx0ZXIuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlclRleHQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB0dXJuIG9uIHRoZSBRdWljayBGaWx0ZXIgY2FjaGUsIHVzZWQgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZSB3aGVuIHVzaW5nIHRoZSBRdWljayBGaWx0ZXIuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZVF1aWNrRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MzAsIGhpZGRlbiBjb2x1bW5zIGFyZSBleGNsdWRlZCBmcm9tIHRoZSBRdWljayBGaWx0ZXIgYnkgZGVmYXVsdC4gVGhpcyBjYW4gYmUgdG9nZ2xlZCB1c2luZyBgaW5jbHVkZUhpZGRlbkNvbHVtbnNJblF1aWNrRmlsdGVyYC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGV4Y2x1ZGVIaWRkZW5Db2x1bW5zRnJvbVF1aWNrRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIaWRkZW4gY29sdW1ucyBhcmUgZXhjbHVkZWQgZnJvbSB0aGUgUXVpY2sgRmlsdGVyIGJ5IGRlZmF1bHQuXG4gICAgICAgICAqIFRvIGluY2x1ZGUgaGlkZGVuIGNvbHVtbnMsIHNldCB0byBgdHJ1ZWAuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbmNsdWRlSGlkZGVuQ29sdW1uc0luUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENoYW5nZXMgaG93IHRoZSBRdWljayBGaWx0ZXIgc3BsaXRzIHRoZSBRdWljayBGaWx0ZXIgdGV4dCBpbnRvIHNlYXJjaCB0ZXJtcy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyUGFyc2VyOiAoKHF1aWNrRmlsdGVyOiBzdHJpbmcpID0+IHN0cmluZ1tdKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhbmdlcyB0aGUgbWF0Y2hpbmcgbG9naWMgZm9yIHdoZXRoZXIgYSByb3cgcGFzc2VzIHRoZSBRdWljayBGaWx0ZXIuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlck1hdGNoZXI6ICgocXVpY2tGaWx0ZXJQYXJ0czogc3RyaW5nW10sIHJvd1F1aWNrRmlsdGVyQWdncmVnYXRlVGV4dDogc3RyaW5nKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCB0cmVlIGRhdGEgZmlsdGVyaW5nIGJlaGF2aW91ciB0byBpbnN0ZWFkIGV4Y2x1ZGUgY2hpbGQgbm9kZXMgZnJvbSBmaWx0ZXIgcmVzdWx0cy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGV4Y2x1ZGVDaGlsZHJlbldoZW5UcmVlRGF0YUZpbHRlcmluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIHRydWUgdG8gZW5hYmxlIHRoZSBBZHZhbmNlZCBGaWx0ZXIuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVBZHZhbmNlZEZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjMxLCB1c2UgYGluaXRpYWxTdGF0ZS5maWx0ZXIuYWR2YW5jZWRGaWx0ZXJNb2RlbGAgaW5zdGVhZC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFkdmFuY2VkRmlsdGVyTW9kZWw6IEFkdmFuY2VkRmlsdGVyTW9kZWwgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIaWRkZW4gY29sdW1ucyBhcmUgZXhjbHVkZWQgZnJvbSB0aGUgQWR2YW5jZWQgRmlsdGVyIGJ5IGRlZmF1bHQuXG4gICAgICAgICAqIFRvIGluY2x1ZGUgaGlkZGVuIGNvbHVtbnMsIHNldCB0byBgdHJ1ZWAuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbmNsdWRlSGlkZGVuQ29sdW1uc0luQWR2YW5jZWRGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERPTSBlbGVtZW50IHRvIHVzZSBhcyB0aGUgcGFyZW50IGZvciB0aGUgQWR2YW5jZWQgRmlsdGVyIHRvIGFsbG93IGl0IHRvIGFwcGVhciBvdXRzaWRlIG9mIHRoZSBncmlkLlxuICAgICAgICAgKiBTZXQgdG8gYG51bGxgIG9yIGB1bmRlZmluZWRgIHRvIGFwcGVhciBpbnNpZGUgdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZHZhbmNlZEZpbHRlclBhcmVudDogSFRNTEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcGFzc2VkIHRvIHRoZSBBZHZhbmNlZCBGaWx0ZXIgQnVpbGRlci5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFkdmFuY2VkRmlsdGVyQnVpbGRlclBhcmFtczogSUFkdmFuY2VkRmlsdGVyQnVpbGRlclBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBFbmFibGUgQ2hhcnRzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2hhcnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBjaGFydCB0aGVtZXMgdGhhdCBhIHVzZXIgY2FuIGNob29zZSBmcm9tIGluIHRoZSBjaGFydCBzZXR0aW5ncyBwYW5lbC5cbiAgICAgICAgICogQGRlZmF1bHQgWydhZy1kZWZhdWx0JywgJ2FnLW1hdGVyaWFsJywgJ2FnLXNoZWV0cycsICdhZy1wb2x5Y2hyb21hJywgJ2FnLXZpdmlkJ107XG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lczogc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIGNvbnRhaW5pbmcgY3VzdG9tIGNoYXJ0IHRoZW1lcy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGN1c3RvbUNoYXJ0VGhlbWVzOiB7IFtuYW1lOiBzdHJpbmddOiBBZ0NoYXJ0VGhlbWUgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhcnQgdGhlbWUgb3ZlcnJpZGVzIGFwcGxpZWQgdG8gYWxsIHRoZW1lcy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVPdmVycmlkZXM6IEFnQ2hhcnRUaGVtZU92ZXJyaWRlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjI5LCBubyBsb25nZXIgdXNlZC4gVG8gc3VwcHJlc3MgdXNlIGBzdXBwcmVzc0NoYXJ0VG9vbFBhbmVsc0J1dHRvbmAuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDaGFydFRvb2xQYW5lbHNCdXR0b246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc2hvdyB0aGUgJ2hhbWJ1cmdlcicgbWVudSBvcHRpb24gZnJvbSB0aGUgQ2hhcnQgVG9vbGJhciBhbmQgZGlzcGxheSB0aGUgcmVtYWluaW5nIHRvb2xiYXIgYnV0dG9ucy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhcnRUb29sUGFuZWxzQnV0dG9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY3VzdG9taXNhdGlvbiBvZiB0aGUgQ2hhcnQgVG9vbCBQYW5lbHMsIHN1Y2ggYXMgY2hhbmdpbmcgdGhlIHRvb2wgcGFuZWxzIHZpc2liaWxpdHkgYW5kIG9yZGVyLCBhcyB3ZWxsIGFzIGNob29zaW5nIHdoaWNoIGNoYXJ0cyBzaG91bGQgYmUgZGlzcGxheWVkIGluIHRoZSBzZXR0aW5ncyBwYW5lbC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VG9vbFBhbmVsc0RlZjogQ2hhcnRUb29sUGFuZWxzRGVmIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIGxvYWRpbmcgY2VsbCByZW5kZXJlciB0byB1c2Ugd2hlbiBkYXRhIGlzIGxvYWRpbmcgdmlhIGEgRGF0YVNvdXJjZS5cbiAgICAgICAgICogU2VlIFtMb2FkaW5nIENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1sb2FkaW5nLWNlbGwtcmVuZGVyZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBjb21wb25lbnQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gYmUgdXNlZCB3aGVuIGRhdGEgaXMgbG9hZGluZyB2aWEgYSBEYXRhU291cmNlLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yOiBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2Yga2V5LT52YWx1ZSBwYWlycyBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hc3RlciBEZXRhaWwuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXN0ZXJEZXRhaWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8ga2VlcCBkZXRhaWwgcm93cyBmb3Igd2hlbiB0aGV5IGFyZSBkaXNwbGF5ZWQgYWdhaW4uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgbnVtYmVyIG9mIGRldGFpbHMgcm93cyB0byBrZWVwLlxuICAgICAgICAgKiBAZGVmYXVsdCAxMFxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3NDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGBkZXRhaWxDZWxsUmVuZGVyZXJgIHRvIHVzZSB3aGVuIGEgbWFzdGVyIHJvdyBpcyBleHBhbmRlZC5cbiAgICAgICAgICogU2VlIFtEZXRhaWwgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvbWFzdGVyLWRldGFpbC1jdXN0b20tZGV0YWlsLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgcGFyYW1zIHRvIGJlIHVzZWQgYnkgdGhlIERldGFpbCBDZWxsIFJlbmRlcmVyLiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgcHJvdmlkZXMgdGhlIHBhcmFtcyB0byBlbmFibGUgZHluYW1pYyBkZWZpbml0aW9ucyBvZiB0aGUgcGFyYW1zLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCBmaXhlZCBoZWlnaHQgaW4gcGl4ZWxzIGZvciBlYWNoIGRldGFpbCByb3cuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSBkZXRhaWwgZ3JpZCBkeW5hbWljYWxseSBjaGFuZ2UgaXQncyBoZWlnaHQgdG8gZml0IGl0J3Mgcm93cy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGVzIGEgY29udGV4dCBvYmplY3QgdGhhdCBpcyBwcm92aWRlZCB0byBkaWZmZXJlbnQgY2FsbGJhY2tzIHRoZSBncmlkIHVzZXMuIFVzZWQgZm9yIHBhc3NpbmcgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB0byB0aGUgY2FsbGJhY2tzIGJ5IHlvdXIgYXBwbGljYXRpb24uXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb250ZXh0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqXG4gICAgICAgICAqIEEgbGlzdCBvZiBncmlkcyB0byB0cmVhdCBhcyBBbGlnbmVkIEdyaWRzLlxuICAgICAgICAgKiBQcm92aWRlIGEgbGlzdCBpZiB0aGUgZ3JpZHMgLyBhcGlzIGFscmVhZHkgZXhpc3Qgb3IgcmV0dXJuIHZpYSBhIGNhbGxiYWNrIHRvIGFsbG93IHRoZSBhbGlnbmVkIGdyaWRzIHRvIGJlIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS5cbiAgICAgICAgICogSWYgZ3JpZHMgYXJlIGFsaWduZWQgdGhlbiB0aGUgY29sdW1ucyBhbmQgaG9yaXpvbnRhbCBzY3JvbGxpbmcgd2lsbCBiZSBrZXB0IGluIHN5bmMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGlnbmVkR3JpZHM6IChBbGlnbmVkR3JpZFtdIHwgKCgpID0+IEFsaWduZWRHcmlkW10pKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhbmdlIHRoaXMgdmFsdWUgdG8gc2V0IHRoZSB0YWJJbmRleCBvcmRlciBvZiB0aGUgR3JpZCB3aXRoaW4geW91ciBhcHBsaWNhdGlvbi5cbiAgICAgICAgICogQGRlZmF1bHQgMFxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIG51bWJlciBvZiByb3dzIHJlbmRlcmVkIG91dHNpZGUgdGhlIHZpZXdhYmxlIGFyZWEgdGhlIGdyaWQgcmVuZGVycy5cbiAgICAgICAgICogSGF2aW5nIGEgYnVmZmVyIG1lYW5zIHRoZSBncmlkIHdpbGwgaGF2ZSByb3dzIHJlYWR5IHRvIHNob3cgYXMgdGhlIHVzZXIgc2xvd2x5IHNjcm9sbHMgdmVydGljYWxseS5cbiAgICAgICAgICogQGRlZmF1bHQgMTBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0J1ZmZlcjogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIHZhbHVlIGNhY2hlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb25maWd1cmUgdGhlIHZhbHVlIGNhY2hlIHRvIG5vdCBleHBpcmUgYWZ0ZXIgZGF0YSB1cGRhdGVzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZU5ldmVyRXhwaXJlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBjZWxsIGV4cHJlc3Npb25zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MzAuMiBJZiBgdHJ1ZWAsIHJvdyBub2RlcyBkbyBub3QgaGF2ZSB0aGVpciBwYXJlbnRzIHNldC5cbiAgICAgICAgICogVGhlIGdyaWQgZG9lc24ndCB1c2UgdGhlIHBhcmVudCByZWZlcmVuY2UsIGJ1dCBpdCBpcyBpbmNsdWRlZCB0byBoZWxwIHRoZSBjbGllbnQgY29kZSBuYXZpZ2F0ZSB0aGUgbm9kZSB0cmVlIGlmIGl0IHdhbnRzIGJ5IHByb3ZpZGluZyBiaS1kaXJlY3Rpb24gbmF2aWdhdGlvbiB1cCBhbmQgZG93biB0aGUgdHJlZS5cbiAgICAgICAgICogSWYgdGhpcyBpcyBhIHByb2JsZW0gKGUuZy4gaWYgeW91IG5lZWQgdG8gY29udmVydCB0aGUgdHJlZSB0byBKU09OLCB3aGljaCBkb2VzIG5vdCBhbGxvdyBjeWNsaWMgZGVwZW5kZW5jaWVzKSB0aGVuIHNldCB0aGlzIHRvIGB0cnVlYC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFyZW50c0luUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRvdWNoIHN1cHBvcnQgKGJ1dCBkb2VzIG5vdCByZW1vdmUgdGhlIGJyb3dzZXIncyBlZmZvcnRzIHRvIHNpbXVsYXRlIG1vdXNlIGV2ZW50cyBvbiB0b3VjaCkuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzZXQgZm9jdXMgYmFjayBvbiB0aGUgZ3JpZCBhZnRlciBhIHJlZnJlc2guIFRoaXMgY2FuIGF2b2lkIGlzc3VlcyB3aGVyZSB5b3Ugd2FudCB0byBrZWVwIHRoZSBmb2N1cyBvbiBhbm90aGVyIHBhcnQgb2YgdGhlIGJyb3dzZXIuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgYXN5bmNocm9ub3VzIG5hdHVyZSBvZiB0aGUgZXZlbnRzIGludHJvZHVjZWQgaW4gdjEwLCBhbmQgbWFrZXMgdGhlbSBzeW5jaHJvbm91cy4gVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBmb3IgdGhlIHB1cnBvc2Ugb2Ygc3VwcG9ydGluZyBsZWdhY3kgY29kZSB3aGljaCBoYXMgYSBkZXBlbmRlbmN5IG9uIHN5bmNocm9ub3VzIGV2ZW50cyBmcm9tIGVhcmxpZXIgdmVyc2lvbnMgKHY5IG9yIGVhcmxpZXIpIG9mIEFHIEdyaWQuICAgICAqKkl0IGlzIHN0cm9uZ2x5IHJlY29tbWVuZGVkIHRoYXQgeW91IGRvIG5vdCBjaGFuZ2UgdGhpcyBwcm9wZXJ0eSB1bmxlc3MgeW91IGhhdmUgbGVnYWN5IGlzc3Vlcy4qKlxuICAgICAgICAgKiBAZGVwcmVjYXRlZCB2MzEgRXZlbnRzIHNob3VsZCBiZSBoYW5kbGVkIGFzeW5jaHJvbm91c2x5LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBc3luY0V2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGdyaWQgd2lsbCBjaGVjayBmb3IgYFJlc2l6ZU9ic2VydmVyYCBhbmQgdXNlIGl0IGlmIGl0IGV4aXN0cyBpbiB0aGUgYnJvd3Nlciwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlIHRoZSBncmlkJ3MgYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb24uIFNvbWUgdXNlcnMgcmVwb3J0ZWQgaXNzdWVzIHdpdGggQ2hyb21lJ3MgYFJlc2l6ZU9ic2VydmVyYC4gVXNlIHRoaXMgcHJvcGVydHkgdG8gYWx3YXlzIHVzZSB0aGUgZ3JpZCdzIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9uIHNob3VsZCBzdWNoIHByb2JsZW1zIGV4aXN0LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHNob3dpbmcgYSB3YXJuaW5nIG1lc3NhZ2UgaW4gdGhlIGNvbnNvbGUgaWYgdXNpbmcgYSBgZ3JpZE9wdGlvbnNgIG9yIGBjb2xEZWZgIHByb3BlcnR5IHRoYXQgZG9lc24ndCBleGlzdC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJvcGVydHlOYW1lc0NoZWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBlbmFibGUgZGVidWcgaW5mb3JtYXRpb24gZnJvbSB0aGUgZ3JpZCBhbmQgcmVsYXRlZCBjb21wb25lbnRzLiBXaWxsIHJlc3VsdCBpbiBhZGRpdGlvbmFsIGxvZ2dpbmcgYmVpbmcgb3V0cHV0LCBidXQgdmVyeSB1c2VmdWwgd2hlbiBpbnZlc3RpZ2F0aW5nIHByb2JsZW1zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVidWc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSB0ZW1wbGF0ZSBmb3IgJ2xvYWRpbmcnIG92ZXJsYXkuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5TG9hZGluZ1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gbG9hZGluZyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgICAgICogU2VlIFtMb2FkaW5nIE92ZXJsYXkgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtb3ZlcmxheS8jc2ltcGxlLWxvYWRpbmctb3ZlcmxheS1jb21wb25lbnQpIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgbG9hZGluZyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSAnbG9hZGluZycgb3ZlcmxheS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTG9hZGluZ092ZXJsYXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSB0ZW1wbGF0ZSBmb3IgJ25vIHJvd3MnIG92ZXJsYXkuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5Tm9Sb3dzVGVtcGxhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBubyByb3dzIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAgICAgKiBTZWUgW05vIFJvd3MgT3ZlcmxheSBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1vdmVybGF5LyNzaW1wbGUtbm8tcm93cy1vdmVybGF5LWNvbXBvbmVudCkgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIG5vIHJvd3Mgb3ZlcmxheSBjb21wb25lbnQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50UGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSAnbm8gcm93cycgb3ZlcmxheS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHdoZXRoZXIgcGFnaW5hdGlvbiBpcyBlbmFibGVkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcm93cyB0byBsb2FkIHBlciBwYWdlLiBJZiBgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZWAgaXMgc3BlY2lmaWVkLCB0aGlzIHByb3BlcnR5IGlzIGlnbm9yZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IDEwMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvblBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERldGVybWluZXMgaWYgdGhlIHBhZ2Ugc2l6ZSBzZWxlY3RvciBpcyBzaG93biBpbiB0aGUgcGFnaW5hdGlvbiBwYW5lbCBvciBub3QuXG4gICAgICAgICAqIFNldCB0byBhbiBhcnJheSBvZiB2YWx1ZXMgdG8gc2hvdyB0aGUgcGFnZSBzaXplIHNlbGVjdG9yIHdpdGggY3VzdG9tIGxpc3Qgb2YgcG9zc2libGUgcGFnZSBzaXplcy5cbiAgICAgICAgICogU2V0IHRvIGB0cnVlYCB0byBzaG93IHRoZSBwYWdlIHNpemUgc2VsZWN0b3Igd2l0aCB0aGUgZGVmYXVsdCBwYWdlIHNpemVzIGBbMjAsIDUwLCAxMDBdYC5cbiAgICAgICAgICogU2V0IHRvIGBmYWxzZWAgdG8gaGlkZSB0aGUgcGFnZSBzaXplIHNlbGVjdG9yLlxuICAgICAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uUGFnZVNpemVTZWxlY3RvcjogbnVtYmVyW10gfCBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIG51bWJlciBvZiByb3dzIHRvIGxvYWQgcGVyIHBhZ2UgaXMgYXV0b21hdGljYWxseSBhZGp1c3RlZCBieSB0aGUgZ3JpZCBzbyBlYWNoIHBhZ2Ugc2hvd3MgZW5vdWdoIHJvd3MgdG8ganVzdCBmaWxsIHRoZSBhcmVhIGRlc2lnbmF0ZWQgZm9yIHRoZSBncmlkLiBJZiBgZmFsc2VgLCBgcGFnaW5hdGlvblBhZ2VTaXplYCBpcyB1c2VkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHBhZ2VzIHNwbGl0IGNoaWxkcmVuIG9mIGdyb3VwcyB3aGVuIHVzaW5nIFJvdyBHcm91cGluZyBvciBkZXRhaWwgcm93cyB3aXRoIE1hc3RlciBEZXRhaWwuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0ZUNoaWxkUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgZGVmYXVsdCBncmlkIGNvbnRyb2xzIGZvciBuYXZpZ2F0aW9uIGFyZSBoaWRkZW4uXG4gICAgICAgICAqIFRoaXMgaXMgdXNlZnVsIGlmIGBwYWdpbmF0aW9uPXRydWVgIGFuZCB5b3Ugd2FudCB0byBwcm92aWRlIHlvdXIgb3duIHBhZ2luYXRpb24gY29udHJvbHMuXG4gICAgICAgICAqIE90aGVyd2lzZSwgd2hlbiBgcGFnaW5hdGlvbj10cnVlYCB0aGUgZ3JpZCBhdXRvbWF0aWNhbGx5IHNob3dzIHRoZSBuZWNlc3NhcnkgY29udHJvbHMgYXQgdGhlIGJvdHRvbSBzbyB0aGF0IHRoZSB1c2VyIGNhbiBuYXZpZ2F0ZSB0aHJvdWdoIHRoZSBkaWZmZXJlbnQgcGFnZXMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgcGl2b3QgbW9kZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90TW9kZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB0byBzaG93IHRoZSAncGl2b3QgcGFuZWwnICh3aGVyZSB5b3UgZHJhZyByb3dzIHRvIHBpdm90KSBhdCB0aGUgdG9wLiBOb3RlIHRoYXQgdGhlIHBpdm90IHBhbmVsIHdpbGwgbmV2ZXIgc2hvdyBpZiBgcGl2b3RNb2RlYCBpcyBvZmYuXG4gICAgICAgICAqIEBkZWZhdWx0ICduZXZlcidcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90UGFuZWxTaG93OiAnYWx3YXlzJyB8ICdvbmx5V2hlblBpdm90aW5nJyB8ICduZXZlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIHBpdm90aW5nLCBzZXQgdG8gdGhlIG51bWJlciBvZiBjb2x1bW4gZ3JvdXAgbGV2ZWxzIHRvIGV4cGFuZCBieSBkZWZhdWx0LCBlLmcuIGAwYCBmb3Igbm9uZSwgYDFgIGZvciBmaXJzdCBsZXZlbCBvbmx5LCBldGMuIFNldCB0byBgLTFgIHRvIGV4cGFuZCBldmVyeXRoaW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCAwXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdERlZmF1bHRFeHBhbmRlZDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciB3aXRoaW4gdGhlIFBpdm90IENvbHVtbiBHcm91cHMsIGluIHRoZSBwb3NpdGlvbiBzcGVjaWZpZWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbHVtbkdyb3VwVG90YWxzOiAnYmVmb3JlJyB8ICdhZnRlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gc2V0IGFuZCB0aGUgZ3JpZCBpcyBpbiBwaXZvdCBtb2RlLCBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgdG90YWxzIHdpbGwgYXBwZWFyIGZvciBlYWNoIHZhbHVlIGNvbHVtbiBpbiB0aGUgcG9zaXRpb24gc3BlY2lmaWVkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RSb3dUb3RhbHM6ICdiZWZvcmUnIHwgJ2FmdGVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzd2FwIGluIHRoZSBncm91cGluZyBjb2x1bW4gd2hlbiBwaXZvdGluZy4gVXNlZnVsIGlmIHBpdm90aW5nIHVzaW5nIFNlcnZlciBTaWRlIFJvdyBNb2RlbCBvciBWaWV3cG9ydCBSb3cgTW9kZWwgYW5kIHlvdSB3YW50IGZ1bGwgY29udHJvbCBvZiBhbGwgY29sdW1ucyBpbmNsdWRpbmcgdGhlIGdyb3VwIGNvbHVtbi5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHBpdm90IGNvbHVtbiBncm91cHMgd2lsbCBhcHBlYXIgJ2ZpeGVkJywgd2l0aG91dCB0aGUgYWJpbGl0eSB0byBleHBhbmQgYW5kIGNvbGxhcHNlIHRoZSBjb2x1bW4gZ3JvdXBzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeHBhbmRhYmxlUGl2b3RHcm91cHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlbiByb3cgZ3JvdXAsIHBpdm90IGFuZCB2YWx1ZSBhZ2dyZWdhdGlvbiB3aWxsIGJlIHJlYWQtb25seSBmcm9tIHRoZSBHVUkuIFRoZSBncmlkIHdpbGwgZGlzcGxheSB3aGF0IHZhbHVlcyBhcmUgdXNlZCBmb3IgZWFjaCwgYnV0IHdpbGwgbm90IGFsbG93IHRoZSB1c2VyIHRvIGNoYW5nZSB0aGUgc2VsZWN0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIG9mICdmdW5jdGlvbiBuYW1lJyB0byAnZnVuY3Rpb24nIGZvciBjdXN0b20gYWdncmVnYXRpb24gZnVuY3Rpb25zLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuY3M6IHsgW2tleTogc3RyaW5nXTogSUFnZ0Z1bmM8VERhdGE+OyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgY29sdW1uIGhlYWRlcnMgd29uJ3QgaW5jbHVkZSB0aGUgYGFnZ0Z1bmNgIG5hbWUsIGUuZy4gYCdzdW0oQmFuayBCYWxhbmNlKWAnIHdpbGwganVzdCBiZSBgJ0JhbmsgQmFsYW5jZSdgLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGdW5jSW5IZWFkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgYWdncmVnYXRpb25zLCB0aGUgZ3JpZCB3aWxsIGFsd2F5cyBjYWxjdWxhdGUgdGhlIHJvb3QgbGV2ZWwgYWdncmVnYXRpb24gdmFsdWUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNBZ2dyZWdhdGVBdFJvb3RMZXZlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjMwIC0gbWFkZSBkZWZhdWx0IGFuZCB0b2dnbGVkIHZpYSBhbHdheXNBZ2dyZWdhdGVBdFJvb3RMZXZlbFxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyBjaGFuZ2UgZGV0ZWN0aW9uLCBvbmx5IHRoZSB1cGRhdGVkIGNvbHVtbiB3aWxsIGJlIHJlLWFnZ3JlZ2F0ZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCBhZ2dyZWdhdGlvbnMgYXJlIG5vdCBpbXBhY3RlZCBieSBmaWx0ZXJpbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0ZpbHRlcmVkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvbWl0IHRoZSB2YWx1ZSBDb2x1bW4gaGVhZGVyIHdoZW4gdGhlcmUgaXMgb25seSBhIHNpbmdsZSB2YWx1ZSBjb2x1bW4uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZW1vdmVQaXZvdEhlYWRlclJvd1doZW5TaW5nbGVWYWx1ZUNvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGBmYWxzZWAgdG8gZGlzYWJsZSBSb3cgQW5pbWF0aW9uIHdoaWNoIGlzIGVuYWJsZWQgYnkgZGVmYXVsdC5cbiAgICAgICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYW5pbWF0ZVJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBjZWxscyBmbGFzaCBhZnRlciBkYXRhIGNoYW5nZXMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRvIGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBgZW5hYmxlQ2VsbENoYW5nZUZsYXNoYCwgdGhpcyBjb25maWd1cmF0aW9uIHdpbGwgc2V0IHRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgb2YgaG93IGxvbmcgYSBjZWxsIHNob3VsZCByZW1haW4gaW4gaXRzIFwiZmxhc2hlZFwiIHN0YXRlLlxuICAgICAgICAgKiBAZGVmYXVsdCA1MDBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGbGFzaERlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRvIGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBgZW5hYmxlQ2VsbENoYW5nZUZsYXNoYCwgdGhpcyBjb25maWd1cmF0aW9uIHdpbGwgc2V0IHRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgb2YgaG93IGxvbmcgdGhlIFwiZmxhc2hlZFwiIHN0YXRlIGFuaW1hdGlvbiB0YWtlcyB0byBmYWRlIGF3YXkgYWZ0ZXIgdGhlIHRpbWVyIHNldCBieSBgY2VsbEZsYXNoRGVsYXlgIGhhcyBjb21wbGV0ZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IDEwMDBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGYWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIGZsYXNoIGFmdGVyIGRhdGEgY2hhbmdlcyBldmVuIHdoZW4gdGhlIGNoYW5nZSBpcyBkdWUgdG8gZmlsdGVyaW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dTaG93Q2hhbmdlQWZ0ZXJGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFN3aXRjaCBiZXR3ZWVuIGxheW91dCBvcHRpb25zOiBgbm9ybWFsYCwgYGF1dG9IZWlnaHRgLCBgcHJpbnRgLlxuICAgICAgICAgKiBAZGVmYXVsdCAnbm9ybWFsJ1xuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG9tTGF5b3V0OiBEb21MYXlvdXRUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIG9yZGVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgaW4gdGhlIERPTSBhcmUgY29uc2lzdGVudCB3aXRoIHdoYXQgaXMgb24gc2NyZWVuLlxuICAgICAgICAgKiBEaXNhYmxlcyByb3cgYW5pbWF0aW9ucy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG9wZXJhdGUgdGhlIGdyaWQgaW4gUlRMIChSaWdodCB0byBMZWZ0KSBtb2RlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUnRsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIGdyaWQgZG9lc24ndCB2aXJ0dWFsaXNlIHRoZSBjb2x1bW5zLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgMTAwIGNvbHVtbnMsIGJ1dCBvbmx5IDEwIHZpc2libGUgZHVlIHRvIHNjcm9sbGluZywgYWxsIDEwMCB3aWxsIGFsd2F5cyBiZSByZW5kZXJlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29sdW1uVmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQgdGhlIGdyaWQgaGFzIGEgbGltaXQgb2YgcmVuZGVyaW5nIGEgbWF4aW11bSBvZiA1MDAgcm93cyBhdCBvbmNlIChyZW1lbWJlciB0aGUgZ3JpZCBvbmx5IHJlbmRlcnMgcm93cyB5b3UgY2FuIHNlZSwgc28gdW5sZXNzIHlvdXIgZGlzcGxheSBzaG93cyBtb3JlIHRoYW4gNTAwIHJvd3Mgd2l0aG91dCB2ZXJ0aWNhbGx5IHNjcm9sbGluZyB0aGlzIHdpbGwgbmV2ZXIgYmUgYW4gaXNzdWUpLlxuICAgICAgICAgKiA8YnIgLz4qKlRoaXMgaXMgb25seSByZWxldmFudCBpZiB5b3UgYXJlIG1hbnVhbGx5IHNldHRpbmcgYHJvd0J1ZmZlcmAgdG8gYSBoaWdoIHZhbHVlIChyZW5kZXJpbmcgbW9yZSByb3dzIHRoYW4gY2FuIGJlIHNlZW4pLCBvciBgc3VwcHJlc3NSb3dWaXJ0dWFsaXNhdGlvbmAgaXMgdHJ1ZSwgb3IgaWYgeW91ciBncmlkIGhlaWdodCBpcyBhYmxlIHRvIGRpc3BsYXkgbW9yZSB0aGFuIDUwMCByb3dzIGF0IG9uY2UuKipcbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBncmlkIGRvZXNuJ3QgdmlydHVhbGlzZSB0aGUgcm93cy4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIDEwMCByb3dzLCBidXQgb25seSAxMCB2aXNpYmxlIGR1ZSB0byBzY3JvbGxpbmcsIGFsbCAxMDAgd2lsbCBhbHdheXMgYmUgcmVuZGVyZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd1ZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBNYW5hZ2VkIFJvdyBEcmFnZ2luZy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNYW5hZ2VkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIHJvdyBkcmFnZ2luZy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtb3Zpbmcgcm93cyB3aGlsZSBkcmFnZ2luZyB0aGUgYHJvd0RyYWdgIHdhZmZsZS4gVGhpcyBvcHRpb24gaGlnaGxpZ2h0cyB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIHJvdyB3aWxsIGJlIHBsYWNlZCBhbmQgaXQgd2lsbCBvbmx5IG1vdmUgdGhlIHJvdyBvbiBtb3VzZSB1cC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgY2xpY2tpbmcgYW5kIGRyYWdnaW5nIGFueXdoZXJlIG9uIHRoZSByb3cgd2l0aG91dCB0aGUgbmVlZCBmb3IgYSBkcmFnIGhhbmRsZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdFbnRpcmVSb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIGRyYWdnaW5nIG11bHRpcGxlIHJvd3MgYXQgdGhlIHNhbWUgdGltZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNdWx0aVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gYSBzdHJpbmcgdG8gYmUgZGlzcGxheWVkIGJ5IHRoZSBgcm93RHJhZ0NvbXBgIHdoaWxlIGRyYWdnaW5nIGEgcm93LlxuICAgICAgICAgKiBJZiB0aGlzIGNhbGxiYWNrIGlzIG5vdCBzZXQsIHRoZSBjdXJyZW50IGNlbGwgdmFsdWUgd2lsbCBiZSB1c2VkLlxuICAgICAgICAgKiBJZiB0aGUgYHJvd0RyYWdUZXh0YCBjYWxsYmFjayBpcyBzZXQgaW4gdGhlIENvbERlZiBpdCB3aWxsIHRha2UgcHJlY2VkZW5jZSBvdmVyIHRoaXMsIGV4Y2VwdCB3aGVuXG4gICAgICAgICAqIGByb3dEcmFnRW50aXJlUm93PXRydWVgLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ1RleHQ6ICgocGFyYW1zOiBJUm93RHJhZ0l0ZW0sIGRyYWdJdGVtQ291bnQ6IG51bWJlcikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBjZWxsIHJlbmRlcmVyIGNvbXBvbmVudCB0byB1c2UgZm9yIGZ1bGwgd2lkdGggcm93cy5cbiAgICAgICAgICogU2VlIFtGdWxsIFdpZHRoIFJvd3NdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2Z1bGwtd2lkdGgtcm93cy8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIGBmdWxsV2lkdGhDZWxsUmVuZGVyZXJgIGNvbXBvbmVudC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIEZ1bGwgV2lkdGggUm93cyBlbWJlZGRlZCBpbiBncmlkJ3MgbWFpbiBjb250YWluZXIgc28gdGhleSBjYW4gYmUgc2Nyb2xsZWQgaG9yaXpvbnRhbGx5LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MzFcbiAgICAgICAgICogV2hlbiBlbmFibGVkLCB0aGUgZ3JpZCB3aWxsIGNhc3QgZ3JvdXAgdmFsdWVzIHRvIHN0cmluZyB0eXBlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NHcm91cE1haW50YWluVmFsdWVUeXBlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZpZXMgaG93IHRoZSByZXN1bHRzIG9mIHJvdyBncm91cGluZyBzaG91bGQgYmUgZGlzcGxheWVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiAgVGhlIG9wdGlvbnMgYXJlOlxuICAgICAgICAgKlxuICAgICAgICAgKiAtIGAnc2luZ2xlQ29sdW1uJ2A6IHNpbmdsZSBncm91cCBjb2x1bW4gYXV0b21hdGljYWxseSBhZGRlZCBieSB0aGUgZ3JpZC5cbiAgICAgICAgICogLSBgJ211bHRpcGxlQ29sdW1ucydgOiBhIGdyb3VwIGNvbHVtbiBwZXIgcm93IGdyb3VwIGlzIGFkZGVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICAgICAqIC0gYCdncm91cFJvd3MnYDogZ3JvdXAgcm93cyBhcmUgYXV0b21hdGljYWxseSBhZGRlZCBpbnN0ZWFkIG9mIGdyb3VwIGNvbHVtbnMuXG4gICAgICAgICAqIC0gYCdjdXN0b20nYDogaW5mb3JtcyB0aGUgZ3JpZCB0aGF0IGdyb3VwIGNvbHVtbnMgd2lsbCBiZSBwcm92aWRlZC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGlzcGxheVR5cGU6IFJvd0dyb3VwaW5nRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGdyb3VwaW5nLCBzZXQgdG8gdGhlIG51bWJlciBvZiBsZXZlbHMgdG8gZXhwYW5kIGJ5IGRlZmF1bHQsIGUuZy4gYDBgIGZvciBub25lLCBgMWAgZm9yIGZpcnN0IGxldmVsIG9ubHksIGV0Yy4gU2V0IHRvIGAtMWAgdG8gZXhwYW5kIGV2ZXJ5dGhpbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IDBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGVmYXVsdEV4cGFuZGVkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzcGVjaWZ5aW5nIHRoZSBncm91cCAnYXV0byBjb2x1bW4nIGlmIHlvdSBhcmUgbm90IGhhcHB5IHdpdGggdGhlIGRlZmF1bHQuIElmIGdyb3VwaW5nLCB0aGlzIGNvbHVtbiBkZWZpbml0aW9uIGlzIGluY2x1ZGVkIGFzIHRoZSBmaXJzdCBjb2x1bW4gaW4gdGhlIGdyaWQuIElmIG5vdCBncm91cGluZywgdGhpcyBjb2x1bW4gaXMgbm90IGluY2x1ZGVkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0dyb3VwQ29sdW1uRGVmOiBDb2xEZWY8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgcHJlc2VydmVzIHRoZSBjdXJyZW50IGdyb3VwIG9yZGVyIHdoZW4gc29ydGluZyBvbiBub24tZ3JvdXAgY29sdW1ucy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTWFpbnRhaW5PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIGlmIHlvdSBzZWxlY3QgYSBncm91cCwgdGhlIGNoaWxkcmVuIG9mIHRoZSBncm91cCB3aWxsIGFsc28gYmUgc2VsZWN0ZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZ3JvdXBpbmcsIGxvY2tzIHRoZSBncm91cCBzZXR0aW5ncyBvZiBhIG51bWJlciBvZiBjb2x1bW5zLCBlLmcuIGAwYCBmb3Igbm8gZ3JvdXAgbG9ja2luZy4gYDFgIGZvciBmaXJzdCBncm91cCBjb2x1bW4gbG9ja2VkLCBgLTFgIGZvciBhbGwgZ3JvdXAgY29sdW1ucyBsb2NrZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IDBcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTG9ja0dyb3VwQ29sdW1uczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgZmlsdGVycyBzaG91bGQgYmUgYXBwbGllZCBvbiBhZ2dyZWdhdGVkIGdyb3VwIHZhbHVlcy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwQWdnRmlsdGVyaW5nOiBib29sZWFuIHwgSXNSb3dGaWx0ZXJhYmxlPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZ3JvdXBpbmcsIHRoaXMgY29udHJvbHMgd2hldGhlciB0byBzaG93IGEgZ3JvdXAgZm9vdGVyIHdoZW4gdGhlIGdyb3VwIGlzIGV4cGFuZGVkLlxuICAgICAgICAgKiBJZiBgdHJ1ZWAsIHRoZW4gYnkgZGVmYXVsdCwgdGhlIGZvb3RlciB3aWxsIGNvbnRhaW4gYWdncmVnYXRlIGRhdGEgKGlmIGFueSkgd2hlbiBzaG93biBhbmQgdGhlIGhlYWRlciB3aWxsIGJlIGJsYW5rLlxuICAgICAgICAgKiBXaGVuIGNsb3NlZCwgdGhlIGhlYWRlciB3aWxsIGNvbnRhaW4gdGhlIGFnZ3JlZ2F0ZSBkYXRhIHJlZ2FyZGxlc3Mgb2YgdGhpcyBzZXR0aW5nIChhcyB0aGUgZm9vdGVyIGlzIGhpZGRlbiBhbnl3YXkpLlxuICAgICAgICAgKiBUaGlzIGlzIGhhbmR5IGZvciAndG90YWwnIHJvd3MsIHRoYXQgYXJlIGRpc3BsYXllZCBiZWxvdyB0aGUgZGF0YSB3aGVuIHRoZSBncm91cCBpcyBvcGVuLCBhbmQgYWxvbmdzaWRlIHRoZSBncm91cCB3aGVuIGl0IGlzIGNsb3NlZC5cbiAgICAgICAgICogSWYgYSBjYWxsYmFjayBmdW5jdGlvbiBpcyBwcm92aWRlZCwgaXQgY2FuIHVzZWQgdG8gc2VsZWN0IHdoaWNoIGdyb3VwcyB3aWxsIGhhdmUgYSBmb290ZXIgYWRkZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVGb290ZXI6IGJvb2xlYW4gfCBVc2VHcm91cEZvb3RlcjxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc2hvdyBhICdncmFuZCB0b3RhbCcgZ3JvdXAgZm9vdGVyIGFjcm9zcyBhbGwgZ3JvdXBzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlVG90YWxGb290ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgYW5kIHNob3dpbmcgZm9vdGVyLCBhZ2dyZWdhdGUgZGF0YSB3aWxsIGFsd2F5cyBiZSBkaXNwbGF5ZWQgYXQgYm90aCB0aGUgaGVhZGVyIGFuZCBmb290ZXIgbGV2ZWxzLiBUaGlzIHN0b3BzIHRoZSBwb3NzaWJseSB1bmRlc2lyYWJsZSBiZWhhdmlvdXIgb2YgdGhlIGhlYWRlciBkZXRhaWxzICdqdW1waW5nJyB0byB0aGUgZm9vdGVyIG9uIGV4cGFuZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NCbGFua0hlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgdXNpbmcgYGdyb3VwU2VsZWN0c0NoaWxkcmVuYCwgdGhlbiBvbmx5IHRoZSBjaGlsZHJlbiB0aGF0IHBhc3MgdGhlIGN1cnJlbnQgZmlsdGVyIHdpbGwgZ2V0IHNlbGVjdGVkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzRmlsdGVyZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNob3dzIHRoZSBvcGVuIGdyb3VwIGluIHRoZSBncm91cCBjb2x1bW4gZm9yIG5vbi1ncm91cCByb3dzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2hvd09wZW5lZEdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGdyb3VwcyB0aGF0IG9ubHkgaGF2ZSBvbmUgY2hpbGQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGxvd2VzdCBsZXZlbCBncm91cHMgdGhhdCBvbmx5IGhhdmUgb25lIGNoaWxkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoaWRlIHBhcmVudHMgdGhhdCBhcmUgb3Blbi4gV2hlbiB1c2VkIHdpdGggbXVsdGlwbGUgY29sdW1ucyBmb3Igc2hvd2luZyBncm91cHMsIGl0IGNhbiBnaXZlIGEgbW9yZSBwbGVhc2luZyB1c2VyIGV4cGVyaWVuY2UuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhpZGVPcGVuUGFyZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBwcmV2ZW50IHRoZSBncmlkIGZyb20gY3JlYXRpbmcgYSAnKEJsYW5rcyknIGdyb3VwIGZvciBub2RlcyB3aGljaCBkbyBub3QgYmVsb25nIHRvIGEgZ3JvdXAsIGFuZCBkaXNwbGF5IHRoZSB1bmJhbGFuY2VkIG5vZGVzIGFsb25nc2lkZSBncm91cCBub2Rlcy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwQWxsb3dVbmJhbGFuY2VkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdyb3cgZ3JvdXAgcGFuZWwnICh3aGVyZSB5b3UgZHJhZyByb3dzIHRvIGdyb3VwKSBhdCB0aGUgdG9wLlxuICAgICAgICAgKiBAZGVmYXVsdCAnbmV2ZXInXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU2hvdzogJ2Fsd2F5cycgfCAnb25seVdoZW5Hcm91cGluZycgfCAnbmV2ZXInIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBDZWxsIFJlbmRlcmVyIHRvIHVzZSB3aGVuIGBncm91cERpc3BsYXlUeXBlID0gJ2dyb3VwUm93cydgLlxuICAgICAgICAgKiBTZWUgW0dyb3VwIFJvdyBDZWxsIFJlbmRlcmVyXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9ncm91cGluZy1ncm91cC1yb3dzLyNwcm92aWRpbmctY2VsbC1yZW5kZXJlcikgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlcjogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIGBncm91cFJvd1JlbmRlcmVyYCBjb21wb25lbnQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQsIHdoZW4gYSBjb2x1bW4gaXMgdW4tZ3JvdXBlZCwgaS5lLiB1c2luZyB0aGUgUm93IEdyb3VwIFBhbmVsLCBpdCBpcyBtYWRlIHZpc2libGUgaW4gdGhlIGdyaWQuIFRoaXMgcHJvcGVydHkgc3RvcHMgdGhlIGNvbHVtbiBiZWNvbWluZyB2aXNpYmxlIGFnYWluIHdoZW4gdW4tZ3JvdXBpbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01ha2VDb2x1bW5WaXNpYmxlQWZ0ZXJVbkdyb3VwOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgR3JpZCB0byB3b3JrIHdpdGggVHJlZSBEYXRhLiBZb3UgbXVzdCBhbHNvIGltcGxlbWVudCB0aGUgYGdldERhdGFQYXRoKGRhdGEpYCBjYWxsYmFjay5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIHNvcnQgaW5kaWNhdG9ycyBhbmQgYWN0aW9ucyBmcm9tIHRoZSByb3cgZ3JvdXAgcGFuZWwuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU3VwcHJlc3NTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHByZXZlbnQgR3JvdXAgUm93cyBmcm9tIHN0aWNraW5nIHRvIHRoZSB0b3Agb2YgdGhlIGdyaWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0dyb3VwUm93c1N0aWNreTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIHRvcCByb3dzIGluIHRoZSBncmlkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkVG9wUm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERhdGEgdG8gYmUgZGlzcGxheWVkIGFzIHBpbm5lZCBib3R0b20gcm93cyBpbiB0aGUgZ3JpZC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZEJvdHRvbVJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXRzIHRoZSByb3cgbW9kZWwgdHlwZS5cbiAgICAgICAgICogQGRlZmF1bHQgJ2NsaWVudFNpZGUnXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNb2RlbFR5cGU6IFJvd01vZGVsVHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBkYXRhIHRvIGJlIGRpc3BsYXllZCBhcyByb3dzIGluIHRoZSBncmlkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RGF0YTogVERhdGFbXSB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBleGVjdXRpbmcgYSBiYXRjaCBvZiBhc3luYyB0cmFuc2FjdGlvbnMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uV2FpdE1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyBUcmFuc2FjdGlvbnMgY2hhbmdpbmcgc29ydCwgZmlsdGVyLCBncm91cCBvciBwaXZvdCBzdGF0ZSB3aGVuIHRyYW5zYWN0aW9uIG9ubHkgY29udGFpbnMgdXBkYXRlcy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBkYXRhc291cmNlIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRhc291cmNlOiBJRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAgICAgKiBAZGVmYXVsdCAxXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZU92ZXJmbG93U2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBleHRyYSBibGFuayByb3dzIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXIgYXQgdGhlIGVuZCBvZiB0aGUgZGF0YXNldCwgd2hpY2ggc2V0cyB0aGUgdmVydGljYWwgc2Nyb2xsIGFuZCB0aGVuIGFsbG93cyB0aGUgZ3JpZCB0byByZXF1ZXN0IHZpZXdpbmcgbW9yZSByb3dzIG9mIGRhdGEuXG4gICAgICAgICAqIEBkZWZhdWx0IDFcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluZmluaXRlSW5pdGlhbFJvd0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCBob3cgbWFueSBsb2FkaW5nIHJvd3MgdG8gZGlzcGxheSB0byB0aGUgdXNlciBmb3IgdGhlIHJvb3QgbGV2ZWwgZ3JvdXAuXG4gICAgICAgICAqIEBkZWZhdWx0IDFcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBTZXJ2ZXItc2lkZSBSb3cgTW9kZWwgd2lsbCBzdXBwcmVzcyBJbmZpbml0ZSBTY3JvbGxpbmcgYW5kIGxvYWQgYWxsIHRoZSBkYXRhIGF0IHRoZSBjdXJyZW50IGxldmVsLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJvd3MgZm9yIGVhY2ggYmxvY2sgaW4gdGhlIHN0b3JlLCBpLmUuIGhvdyBtYW55IHJvd3MgcmV0dXJuZWQgZnJvbSB0aGUgc2VydmVyIGF0IGEgdGltZS5cbiAgICAgICAgICogQGRlZmF1bHQgMTAwXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZUJsb2NrU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBibG9ja3MgdG8ga2VlcCBpbiB0aGUgc3RvcmUuIERlZmF1bHQgaXMgbm8gbGltaXQsIHNvIGV2ZXJ5IHJlcXVlc3RlZCBibG9jayBpcyBrZXB0LiBVc2UgdGhpcyBpZiB5b3UgaGF2ZSBtZW1vcnkgY29uY2VybnMsIGFuZCBibG9ja3MgdGhhdCB3ZXJlIGxlYXN0IHJlY2VudGx5IHZpZXdlZCB3aWxsIGJlIHB1cmdlZCB3aGVuIHRoZSBsaW1pdCBpcyBoaXQuIFRoZSBncmlkIHdpbGwgYWRkaXRpb25hbGx5IG1ha2Ugc3VyZSBpdCBoYXMgYWxsIHRoZSBibG9ja3MgbmVlZGVkIHRvIGRpc3BsYXkgd2hhdCBpcyBjdXJyZW50bHkgdmlzaWJsZSwgaW4gY2FzZSB0aGlzIHByb3BlcnR5IGlzIHNldCB0byBhIGxvdyB2YWx1ZS5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heEJsb2Nrc0luQ2FjaGU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcmVxdWVzdHMgdG8gaGl0IHRoZSBzZXJ2ZXIgd2l0aCBjb25jdXJyZW50bHkuIElmIHRoZSBtYXggaXMgcmVhY2hlZCwgcmVxdWVzdHMgYXJlIHF1ZXVlZC5cbiAgICAgICAgICogU2V0IHRvIGAtMWAgZm9yIG5vIG1heGltdW0gcmVzdHJpY3Rpb24gb24gcmVxdWVzdHMuXG4gICAgICAgICAqIEBkZWZhdWx0IDJcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGxvYWRpbmcgYSBibG9jay4gVXNlZnVsIHdoZW4gc2Nyb2xsaW5nIG92ZXIgbWFueSBibG9ja3MsIGFzIGl0IHByZXZlbnRzIGJsb2NrcyBsb2FkaW5nIHVudGlsIHNjcm9sbGluZyBoYXMgc2V0dGxlZC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGJsb2NrTG9hZERlYm91bmNlTWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgY2xvc2luZyBncm91cCByb3dzIHdpbGwgcmVtb3ZlIGNoaWxkcmVuIG9mIHRoYXQgcm93LiBOZXh0IHRpbWUgdGhlIHJvdyBpcyBvcGVuZWQsIGNoaWxkIHJvd3Mgd2lsbCBiZSByZWFkIGZyb20gdGhlIGRhdGFzb3VyY2UgYWdhaW4uIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHVyZ2VDbG9zZWRSb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB0aGUgYHNlcnZlclNpZGVEYXRhc291cmNlYCBmb3Igc2VydmVyIHNpZGUgcm93IG1vZGVsLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZURhdGFzb3VyY2U6IElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBhbHdheXMgcmVmcmVzaGVzIHRvcCBsZXZlbCBncm91cHMgcmVnYXJkbGVzcyBvZiB3aGljaCBjb2x1bW4gd2FzIHNvcnRlZC4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcgJiBzb3J0aW5nIGlzIGhhbmRsZWQgb24gdGhlIHNlcnZlci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0QWxsTGV2ZWxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIG9ubHkgcmVmcmVzaCBncm91cHMgZGlyZWN0bHkgaW1wYWN0ZWQgYnkgYSBmaWx0ZXIuIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nICYgZmlsdGVyaW5nIGlzIGhhbmRsZWQgb24gdGhlIHNlcnZlci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVPbmx5UmVmcmVzaEZpbHRlcmVkR3JvdXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MzAgVGhpcyBwcm9wZXJ0eSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgYHNlcnZlclNpZGVPbmx5UmVmcmVzaEZpbHRlcmVkR3JvdXBzYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlckFsbExldmVsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKipcbiAgICAgICAgICogV2hlbiBlbmFibGVkLCBTb3J0aW5nIHdpbGwgYmUgZG9uZSBvbiB0aGUgc2VydmVyLiBPbmx5IGFwcGxpY2FibGUgd2hlbiBgc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw9dHJ1ZWAuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydE9uU2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIEZpbHRlcmluZyB3aWxsIGJlIGRvbmUgb24gdGhlIHNlcnZlci4gT25seSBhcHBsaWNhYmxlIHdoZW4gYHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsPXRydWVgLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlck9uU2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBVc2VkIHRvIHNwbGl0IHBpdm90IGZpZWxkIHN0cmluZ3MgZm9yIGdlbmVyYXRpbmcgcGl2b3QgcmVzdWx0IGNvbHVtbnMgd2hlbiBgcGl2b3RSZXN1bHRGaWVsZHNgIGlzIHByb3ZpZGVkIGFzIHBhcnQgb2YgYSBgZ2V0Um93c2Agc3VjY2Vzcy5cbiAgICAgICAgICogQGRlZmF1bHQgJ18nXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlUGl2b3RSZXN1bHRGaWVsZFNlcGFyYXRvcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyB1c2UgdGhlIHZpZXdwb3J0IHJvdyBtb2RlbCB5b3UgbmVlZCB0byBwcm92aWRlIHRoZSBncmlkIHdpdGggYSBgdmlld3BvcnREYXRhc291cmNlYC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0RGF0YXNvdXJjZTogSVZpZXdwb3J0RGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyB2aWV3cG9ydCByb3cgbW9kZWwsIHNldHMgdGhlIHBhZ2Ugc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbFBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgdmlld3BvcnQgcm93IG1vZGVsLCBzZXRzIHRoZSBidWZmZXIgc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbEJ1ZmZlclNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgaG9yaXpvbnRhbCBzY3JvbGxiYXIuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgdmVydGljYWwgc2Nyb2xsYmFyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGRlYm91bmNlIHRoZSB2ZXJ0aWNhbCBzY3JvbGxiYXIuIENhbiBwcm92aWRlIHNtb290aGVyIHNjcm9sbGluZyBvbiBzbG93IG1hY2hpbmVzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBuZXZlciBzaG93IHRoZSBob3Jpem9udGFsIHNjcm9sbC4gVGhpcyBpcyB1c2VmdWwgaWYgdGhlIGdyaWQgaXMgYWxpZ25lZCB3aXRoIGFub3RoZXIgZ3JpZCBhbmQgd2lsbCBzY3JvbGwgd2hlbiB0aGUgb3RoZXIgZ3JpZCBzY3JvbGxzLiAoU2hvdWxkIG5vdCBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsYC4pXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzY3JvbGwgdG8gdGhlIHRvcCB3aGVuIG5ldyByb3cgZGF0YSBpcyBwcm92aWRlZC4gVXNlIHRoaXMgaWYgeW91IGRvbid0IHdhbnQgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIG9mIHNjcm9sbGluZyB0byB0aGUgdG9wIGV2ZXJ5IHRpbWUgeW91IGxvYWQgbmV3IGRhdGEuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbE9uTmV3RGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IGFsbG93IG1vdXNld2hlZWwgLyB0b3VjaHBhZCBzY3JvbGwgd2hlbiBwb3B1cCBlbGVtZW50cyBhcmUgcHJlc2VudC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCB1c2UgYW5pbWF0aW9uIGZyYW1lcyB3aGVuIGRyYXdpbmcgcm93cyB3aGlsZSBzY3JvbGxpbmcuIFVzZSB0aGlzIGlmIHRoZSBncmlkIGlzIHdvcmtpbmcgZmFzdCBlbm91Z2ggdGhhdCB5b3UgZG9uJ3QgbmVlZCBhbmltYXRpb24gZnJhbWVzIGFuZCB5b3UgZG9uJ3Qgd2FudCB0aGUgZ3JpZCB0byBmbGlja2VyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBtaWRkbGUgY2xpY2tzIHdpbGwgcmVzdWx0IGluIGBjbGlja2AgZXZlbnRzIGZvciBjZWxscyBhbmQgcm93cy4gT3RoZXJ3aXNlIHRoZSBicm93c2VyIHdpbGwgdXNlIG1pZGRsZSBjbGljayB0byBzY3JvbGwgdGhlIGdyaWQuPGJyIC8+KipOb3RlOioqIE5vdCBhbGwgYnJvd3NlcnMgZmlyZSBgY2xpY2tgIGV2ZW50cyB3aXRoIHRoZSBtaWRkbGUgYnV0dG9uLiBNb3N0IHdpbGwgZmlyZSBvbmx5IGBtb3VzZWRvd25gIGFuZCBgbW91c2V1cGAgZXZlbnRzLCB3aGljaCBjYW4gYmUgdXNlZCB0byBmb2N1cyBhIGNlbGwsIGJ1dCB3aWxsIG5vdCB3b3JrIHRvIGNhbGwgdGhlIGBvbkNlbGxDbGlja2VkYCBmdW5jdGlvbi5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIG1vdXNlIHdoZWVsIGV2ZW50cyB3aWxsIGJlIHBhc3NlZCB0byB0aGUgYnJvd3Nlci4gVXNlZnVsIGlmIHlvdXIgZ3JpZCBoYXMgbm8gdmVydGljYWwgc2Nyb2xscyBhbmQgeW91IHdhbnQgdGhlIG1vdXNlIHRvIHNjcm9sbCB0aGUgYnJvd3NlciBwYWdlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcmV2ZW50RGVmYXVsdE9uTW91c2VXaGVlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGVsbCB0aGUgZ3JpZCBob3cgd2lkZSBpbiBwaXhlbHMgdGhlIHNjcm9sbGJhciBpcywgd2hpY2ggaXMgdXNlZCBpbiBncmlkIHdpZHRoIGNhbGN1bGF0aW9ucy4gU2V0IG9ubHkgaWYgdXNpbmcgbm9uLXN0YW5kYXJkIGJyb3dzZXItcHJvdmlkZWQgc2Nyb2xsYmFycywgc28gdGhlIGdyaWQgY2FuIHVzZSB0aGUgbm9uLXN0YW5kYXJkIHNpemUgaW4gaXRzIGNhbGN1bGF0aW9ucy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNjcm9sbGJhcldpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFR5cGUgb2YgUm93IFNlbGVjdGlvbjogYHNpbmdsZWAsIGBtdWx0aXBsZWAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTZWxlY3Rpb246ICdzaW5nbGUnIHwgJ211bHRpcGxlJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBtdWx0aXBsZSByb3dzIHRvIGJlIHNlbGVjdGVkIHVzaW5nIHNpbmdsZSBjbGljay5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvd3Mgd2lsbCBub3QgYmUgZGVzZWxlY3RlZCBpZiB5b3UgaG9sZCBkb3duIGBDdHJsYCBhbmQgY2xpY2sgdGhlIHJvdyBvciBwcmVzcyBgU3BhY2VgLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCByb3cgc2VsZWN0aW9uIHdvbid0IGhhcHBlbiB3aGVuIHJvd3MgYXJlIGNsaWNrZWQuIFVzZSB3aGVuIHlvdSBvbmx5IHdhbnQgY2hlY2tib3ggc2VsZWN0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBjZWxscyB3b24ndCBiZSBmb2N1c2FibGUuIFRoaXMgbWVhbnMga2V5Ym9hcmQgbmF2aWdhdGlvbiB3aWxsIGJlIGRpc2FibGVkIGZvciBncmlkIGNlbGxzLCBidXQgcmVtYWluIGVuYWJsZWQgaW4gb3RoZXIgZWxlbWVudHMgb2YgdGhlIGdyaWQgc3VjaCBhcyBjb2x1bW4gaGVhZGVycywgZmxvYXRpbmcgZmlsdGVycywgdG9vbCBwYW5lbHMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBvbmx5IGEgc2luZ2xlIHJhbmdlIGNhbiBiZSBzZWxlY3RlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBiZSBhYmxlIHRvIHNlbGVjdCB0aGUgdGV4dCB3aXRoaW4gY2VsbHMuXG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAqKk5vdGU6KiogV2hlbiB0aGlzIGlzIHNldCB0byBgdHJ1ZWAsIHRoZSBjbGlwYm9hcmQgc2VydmljZSBpcyBkaXNhYmxlZCBhbmQgb25seSBzZWxlY3RlZCB0ZXh0IGlzIGNvcGllZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBSYW5nZSBTZWxlY3Rpb24uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIFJhbmdlIEhhbmRsZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgRmlsbCBIYW5kbGUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCd4J2AgdG8gZm9yY2UgdGhlIGZpbGwgaGFuZGxlIGRpcmVjdGlvbiB0byBob3Jpem9udGFsLCBvciBzZXQgdG8gYCd5J2AgdG8gZm9yY2UgdGhlIGZpbGwgaGFuZGxlIGRpcmVjdGlvbiB0byB2ZXJ0aWNhbC5cbiAgICAgICAgICogQGRlZmF1bHQgJ3h5J1xuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbEhhbmRsZURpcmVjdGlvbjogJ3gnIHwgJ3knIHwgJ3h5JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHByZXZlbnQgY2VsbCB2YWx1ZXMgZnJvbSBiZWluZyBjbGVhcmVkIHdoZW4gdGhlIFJhbmdlIFNlbGVjdGlvbiBpcyByZWR1Y2VkIGJ5IHRoZSBGaWxsIEhhbmRsZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xlYXJPbkZpbGxSZWR1Y3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IGRlZmluaW5nIHRoZSBvcmRlciBpbiB3aGljaCBzb3J0aW5nIG9jY3VycyAoaWYgc29ydGluZyBpcyBlbmFibGVkKS4gVmFsdWVzIGNhbiBiZSBgJ2FzYydgLCBgJ2Rlc2MnYCBvciBgbnVsbGAuIEZvciBleGFtcGxlOiBgc29ydGluZ09yZGVyOiBbJ2FzYycsICdkZXNjJ11gLlxuICAgICAgICAgKiBAZGVmYXVsdCBbbnVsbCwgJ2FzYycsICdkZXNjJ11cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlcjogKFNvcnREaXJlY3Rpb24pW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3BlY2lmeSB0aGF0IHRoZSBzb3J0IHNob3VsZCB0YWtlIGFjY2VudGVkIGNoYXJhY3RlcnMgaW50byBhY2NvdW50LiBJZiB0aGlzIGZlYXR1cmUgaXMgdHVybmVkIG9uIHRoZSBzb3J0IHdpbGwgYmUgc2xvd2VyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlICdubyBzb3J0JyBpY29uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtdWx0aS1zb3J0IHdoZW4gdGhlIHVzZXIgc2hpZnQtY2xpY2tzIGEgY29sdW1uIGhlYWRlci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBtdWx0aS1zb3J0IHdoZW4gdGhlIHVzZXIgY2xpY2tzIGEgY29sdW1uIGhlYWRlciwgcmVnYXJkbGVzcyBvZiBrZXkgcHJlc3Nlcy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnY3RybCdgIHRvIGhhdmUgbXVsdGkgc29ydGluZyB3b3JrIHVzaW5nIHRoZSBgQ3RybGAgKG9yIGBDb21tYW5kIOKMmGAgZm9yIE1hYykga2V5LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbXVsdGlTb3J0S2V5OiAnY3RybCcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydGluZyBvZiB1bi1zb3J0ZWQgZGF0YSB0byBtYXRjaCBvcmlnaW5hbCByb3cgZGF0YS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJY29ucyB0byB1c2UgaW5zaWRlIHRoZSBncmlkIGluc3RlYWQgb2YgdGhlIGdyaWQncyBkZWZhdWx0IGljb25zLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfCBzdHJpbmc7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERlZmF1bHQgcm93IGhlaWdodCBpbiBwaXhlbHMuXG4gICAgICAgICAqIEBkZWZhdWx0IDI1XG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIHN0eWxlIHByb3BlcnRpZXMgdG8gYXBwbHkgdG8gYWxsIHJvd3MuIFNldCB0byBhbiBvYmplY3Qgb2Yga2V5IChzdHlsZSBuYW1lcykgYW5kIHZhbHVlcyAoc3R5bGUgdmFsdWVzKS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlOiBSb3dTdHlsZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzKGVzKSBmb3IgYWxsIHJvd3MuIFByb3ZpZGUgZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSBvciBhcnJheSBvZiBzdHJpbmdzIChhcnJheSBvZiBjbGFzcyBuYW1lcykuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJ1bGVzIHdoaWNoIGNhbiBiZSBhcHBsaWVkIHRvIGluY2x1ZGUgY2VydGFpbiBDU1MgY2xhc3Nlcy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXM6IFJvd0NsYXNzUnVsZXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBoaWdobGlnaHQgcm93cyBieSBhZGRpbmcgdGhlIGBhZy1yb3ctaG92ZXJgIENTUyBjbGFzcy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93SG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFVzZXMgQ1NTIGB0b3BgIGluc3RlYWQgb2YgQ1NTIGB0cmFuc2Zvcm1gIGZvciBwb3NpdGlvbmluZyByb3dzLiBVc2VmdWwgaWYgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiBpcyBjYXVzaW5nIGlzc3VlcyBzdWNoIGFzIHVzZWQgaW4gcm93IHNwYW5uaW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGlnaGxpZ2h0IGNvbHVtbnMgYnkgYWRkaW5nIHRoZSBgYWctY29sdW1uLWhvdmVyYCBDU1MgY2xhc3MuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBgZ3JpZElkYCBmb3IgdGhpcyBpbnN0YW5jZSBvZiB0aGUgZ3JpZC4gVmFsdWUgd2lsbCBiZSBzZXQgb24gdGhlIHJvb3QgRE9NIG5vZGUgdXNpbmcgdGhlIGF0dHJpYnV0ZSBgZ3JpZC1pZGAgYXMgd2VsbCBhcyBiZWluZyBhY2Nlc3NpYmxlIHZpYSB0aGUgYGdyaWRBcGkuZ2V0R3JpZElkKClgIG1ldGhvZC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyaWRJZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHNvcnRzIG9ubHkgdGhlIHJvd3MgYWRkZWQvdXBkYXRlZCBieSBhIHRyYW5zYWN0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGFEaXNwbGF5VHlwZTogVHJlZURhdGFEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI5LjJcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1Bhc3NpdmU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEluaXRpYWwgc3RhdGUgZm9yIHRoZSBncmlkLiBPbmx5IHJlYWQgb25jZSBvbiBpbml0aWFsaXphdGlvbi4gQ2FuIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgYXBpLmdldFN0YXRlKClgIHRvIHNhdmUgYW5kIHJlc3RvcmUgZ3JpZCBzdGF0ZS5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTdGF0ZTogR3JpZFN0YXRlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgY3VzdG9taXNpbmcgdGhlIGNvbnRleHQgbWVudS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENvbnRleHRNZW51SXRlbXM6IEdldENvbnRleHRNZW51SXRlbXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgY3VzdG9taXNpbmcgdGhlIG1haW4gJ2NvbHVtbiBoZWFkZXInIG1lbnUuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRNYWluTWVudUl0ZW1zOiBHZXRNYWluTWVudUl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBwcm9jZXNzIHBvcHVwcyBhZnRlciB0aGV5IGFyZSBjcmVhdGVkLiBBcHBsaWNhdGlvbnMgY2FuIHVzZSB0aGlzIGlmIHRoZXkgd2FudCB0bywgZm9yIGV4YW1wbGUsIHJlcG9zaXRpb24gdGhlIHBvcHVwLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFByb2Nlc3NQb3B1cDogKChwYXJhbXM6IFBvc3RQcm9jZXNzUG9wdXBQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIHByb2Nlc3MgdGhlIGNvbHVtbnMgYmVpbmcgcmVtb3ZlZCBmcm9tIHRoZSBwaW5uZWQgc2VjdGlvbiBiZWNhdXNlIHRoZSB2aWV3cG9ydCBpcyB0b28gc21hbGwgdG8gYWNjb21tb2RhdGUgdGhlbS5cbiAgICAgICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBjb2x1bW5zIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgcGlubmVkIGFyZWFzLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1VucGlubmVkQ29sdW1uczogKChwYXJhbXM6IFByb2Nlc3NVbnBpbm5lZENvbHVtbnNQYXJhbXM8VERhdGE+KSA9PiBDb2x1bW5bXSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBjZWxscyBmb3IgdGhlIGNsaXBib2FyZC4gSGFuZHkgaWYgZm9yIGV4YW1wbGUgeW91IGhhdmUgYERhdGVgIG9iamVjdHMgdGhhdCBuZWVkIHRvIGhhdmUgYSBwYXJ0aWN1bGFyIGZvcm1hdCBpZiBpbXBvcnRpbmcgaW50byBFeGNlbC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRm9yQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgaGVhZGVyIHZhbHVlcyBmb3IgdGhlIGNsaXBib2FyZC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NIZWFkZXJGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzSGVhZGVyRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGdyb3VwIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBjbGlwYm9hcmQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzR3JvdXBIZWFkZXJGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzR3JvdXBIZWFkZXJGb3JFeHBvcnRQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgY2VsbHMgZnJvbSB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBudW1iZXIgZmllbGRzLCBhbmQgd2FudCB0byBibG9jayBub24tbnVtYmVycyBmcm9tIGdldHRpbmcgaW50byB0aGUgZ3JpZC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRnJvbUNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBnZXQgdGhlIGRhdGEgdGhhdCB3b3VsZCBvdGhlcndpc2UgZ28gdG8gdGhlIGNsaXBib2FyZC4gVG8gYmUgdXNlZCB3aGVuIHlvdSB3YW50IHRvIGNvbnRyb2wgdGhlICdjb3B5IHRvIGNsaXBib2FyZCcgb3BlcmF0aW9uIHlvdXJzZWxmLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VuZFRvQ2xpcGJvYXJkOiAoKHBhcmFtczogU2VuZFRvQ2xpcGJvYXJkUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjb21wbGV0ZSBjb250cm9sIG9mIHRoZSBwYXN0ZSBvcGVyYXRpb24sIGluY2x1ZGluZyBjYW5jZWxsaW5nIHRoZSBvcGVyYXRpb24gKHNvIG5vdGhpbmcgaGFwcGVucykgb3IgcmVwbGFjaW5nIHRoZSBkYXRhIHdpdGggb3RoZXIgZGF0YS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtczxURGF0YT4pID0+IHN0cmluZ1tdW10gfCBudWxsKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogR3JpZCBjYWxscyB0aGlzIG1ldGhvZCB0byBrbm93IGlmIGFuIGV4dGVybmFsIGZpbHRlciBpcyBwcmVzZW50LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNFeHRlcm5hbEZpbHRlclByZXNlbnQ6ICgocGFyYW1zOiBJc0V4dGVybmFsRmlsdGVyUHJlc2VudFBhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG91bGQgcmV0dXJuIGB0cnVlYCBpZiBleHRlcm5hbCBmaWx0ZXIgcGFzc2VzLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRvZXNFeHRlcm5hbEZpbHRlclBhc3M6ICgobm9kZTogSVJvd05vZGU8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB0byBjdXN0b21pc2UgdGhlIGNoYXJ0IHRvb2xiYXIgaXRlbXMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGFydFRvb2xiYXJJdGVtczogR2V0Q2hhcnRUb29sYmFySXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGVuYWJsZSBkaXNwbGF5aW5nIHRoZSBjaGFydCBpbiBhbiBhbHRlcm5hdGl2ZSBjaGFydCBjb250YWluZXIuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjcmVhdGVDaGFydENvbnRhaW5lcjogKChwYXJhbXM6IENoYXJ0UmVmUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgbmF2aWdhdGlvbiAoYXJyb3cpIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dEhlYWRlcjogKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zPFREYXRhPikgPT4gKEhlYWRlclBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRIZWFkZXI6ICgocGFyYW1zOiBUYWJUb05leHRIZWFkZXJQYXJhbXM8VERhdGE+KSA9PiAoSGVhZGVyUG9zaXRpb24gfCBudWxsKSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgbmF2aWdhdGlvbiAoYXJyb3cpIGtleSB3aGVuIGEgY2VsbCBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgQ2VsbCBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBgbnVsbGAgdG8gc3RheSBvbiBjdXJyZW50IGNlbGwuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBuYXZpZ2F0ZVRvTmV4dENlbGw6ICgocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dENlbGxQYXJhbXM8VERhdGE+KSA9PiAoQ2VsbFBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgY2VsbCBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgQ2VsbCBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBudWxsIHRvIHN0YXkgb24gY3VycmVudCBjZWxsLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0Q2VsbDogKChwYXJhbXM6IFRhYlRvTmV4dENlbGxQYXJhbXM8VERhdGE+KSA9PiAoQ2VsbFBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNhbGxiYWNrIGZvciBsb2NhbGlzaW5nIHRleHQgd2l0aGluIHRoZSBncmlkLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0TG9jYWxlVGV4dDogKChwYXJhbXM6IEdldExvY2FsZVRleHRQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB3aGF0IGBkb2N1bWVudGAgaXMgdXNlZC4gQ3VycmVudGx5IHVzZWQgYnkgRHJhZyBhbmQgRHJvcCAobWF5IGV4dGVuZCB0byBvdGhlciBwbGFjZXMgaW4gdGhlIGZ1dHVyZSkuIFVzZSB0aGlzIHdoZW4geW91IHdhbnQgdGhlIGdyaWQgdG8gdXNlIGEgZGlmZmVyZW50IGBkb2N1bWVudGAgdGhhbiB0aGUgb25lIGF2YWlsYWJsZSBvbiB0aGUgZ2xvYmFsIHNjb3BlLiBUaGlzIGNhbiBoYXBwZW4gaWYgZG9ja2luZyBvdXQgY29tcG9uZW50cyAoc29tZXRoaW5nIHdoaWNoIEVsZWN0cm9uIHN1cHBvcnRzKVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RG9jdW1lbnQ6ICgoKSA9PiBEb2N1bWVudCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB1c2VyIHRvIGZvcm1hdCB0aGUgbnVtYmVycyBpbiB0aGUgcGFnaW5hdGlvbiBwYW5lbCwgaS5lLiAncm93IGNvdW50JyBhbmQgJ3BhZ2UgbnVtYmVyJyBsYWJlbHMuIFRoaXMgaXMgZm9yIHBhZ2luYXRpb24gcGFuZWwgb25seSwgdG8gZm9ybWF0IG51bWJlcnMgaW5zaWRlIHRoZSBncmlkJ3MgY2VsbHMgKGkuZS4geW91ciBkYXRhKSwgdGhlbiB1c2UgYHZhbHVlRm9ybWF0dGVyYCBpbiB0aGUgY29sdW1uIGRlZmluaXRpb25zLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbk51bWJlckZvcm1hdHRlcjogKChwYXJhbXM6IFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byB1c2Ugd2hlbiB5b3UgbmVlZCBhY2Nlc3MgdG8gbW9yZSB0aGVuIHRoZSBjdXJyZW50IGNvbHVtbiBmb3IgYWdncmVnYXRpb24uXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRHcm91cFJvd0FnZzogKChwYXJhbXM6IEdldEdyb3VwUm93QWdnUGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogKENsaWVudC1zaWRlIFJvdyBNb2RlbCBvbmx5KSBBbGxvd3MgZ3JvdXBzIHRvIGJlIG9wZW4gYnkgZGVmYXVsdC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzR3JvdXBPcGVuQnlEZWZhdWx0OiAoKHBhcmFtczogSXNHcm91cE9wZW5CeURlZmF1bHRQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGRlZmF1bHQgc29ydGluZyBvZiBncm91cHMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsR3JvdXBPcmRlckNvbXBhcmF0b3I6ICgocGFyYW1zOiBJbml0aWFsR3JvdXBPcmRlckNvbXBhcmF0b3JQYXJhbXM8VERhdGE+KSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggcGl2b3RpbmcsIHRvIGFsbG93IGNoYW5naW5nIHRoZSBzZWNvbmQgY29sdW1uIGRlZmluaXRpb24uXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUGl2b3RSZXN1bHRDb2xEZWY6ICgoY29sRGVmOiBDb2xEZWY8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIHBpdm90aW5nLCB0byBhbGxvdyBjaGFuZ2luZyB0aGUgc2Vjb25kIGNvbHVtbiBncm91cCBkZWZpbml0aW9uLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sR3JvdXBEZWY6ICgoY29sR3JvdXBEZWY6IENvbEdyb3VwRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2hlbiB3b3JraW5nIHdpdGggVHJlZSBEYXRhIHdoZW4gYHRyZWVEYXRhID0gdHJ1ZWAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREYXRhUGF0aDogR2V0RGF0YVBhdGg8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgc2V0dGluZyB0aGUgY2hpbGQgY291bnQgZm9yIGEgZ3JvdXAgcm93LlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hpbGRDb3VudDogKChkYXRhSXRlbTogYW55KSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgcHJvdmlkaW5nIGRpZmZlcmVudCBwYXJhbXMgZm9yIGRpZmZlcmVudCBsZXZlbHMgb2YgZ3JvdXBpbmcuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtczogKChwYXJhbXM6IEdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zUGFyYW1zKSA9PiBTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtcykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBncm91cHMgdG8gYmUgb3BlbiBieSBkZWZhdWx0LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0OiAoKHBhcmFtczogSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zKSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNhbmNlbGxpbmcgdHJhbnNhY3Rpb25zLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbjogSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU1NSTSBUcmVlIERhdGE6IEFsbG93cyBzcGVjaWZ5aW5nIHdoaWNoIHJvd3MgYXJlIGV4cGFuZGFibGUuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cDogSXNTZXJ2ZXJTaWRlR3JvdXAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNTUk0gVHJlZSBEYXRhOiBBbGxvd3Mgc3BlY2lmeWluZyBncm91cCBrZXlzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZUdyb3VwS2V5OiBHZXRTZXJ2ZXJTaWRlR3JvdXBLZXkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJldHVybiBhIGJ1c2luZXNzIGtleSBmb3IgdGhlIG5vZGUuIElmIGltcGxlbWVudGVkLCBlYWNoIHJvdyBpbiB0aGUgRE9NIHdpbGwgaGF2ZSBhbiBhdHRyaWJ1dGUgYHJvdy1idXNpbmVzcy1rZXk9J2FiYydgIHdoZXJlIGBhYmNgIGlzIHdoYXQgeW91IHJldHVybiBhcyB0aGUgYnVzaW5lc3Mga2V5LlxuICAgICAgICAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgYXV0b21hdGVkIHRlc3RpbmcsIGFzIGl0IHByb3ZpZGVzIGEgd2F5IGZvciB5b3VyIHRvb2wgdG8gaWRlbnRpZnkgcm93cyBiYXNlZCBvbiB1bmlxdWUgYnVzaW5lc3Mga2V5cy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldEJ1c2luZXNzS2V5Rm9yTm9kZTogKChub2RlOiBJUm93Tm9kZTxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzZXR0aW5nIHRoZSBJRCBmb3IgYSBwYXJ0aWN1bGFyIHJvdyBub2RlIGJhc2VkIG9uIHRoZSBkYXRhLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SWQ6IEdldFJvd0lkRnVuYzxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgZ2V0Um93SWQoKSBjYWxsYmFjayBpcyBpbXBsZW1lbnRlZCBhbmQgbmV3IFJvdyBEYXRhIGlzIHNldCwgdGhlIGdyaWQgd2lsbCBkaXNyZWdhcmQgYWxsIHByZXZpb3VzIHJvd3MgYW5kIHRyZWF0IHRoZSBuZXcgUm93IERhdGEgYXMgbmV3IGRhdGEuIEFzIGEgY29uc2VxdWVuY2UsIGFsbCBSb3cgU3RhdGUgKGVnIHNlbGVjdGlvbiwgcmVuZGVyZWQgcm93cykgd2lsbCBiZSByZXNldC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlc2V0Um93RGF0YU9uVXBkYXRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3Mgcm93cyBhZnRlciB0aGV5IGFyZSBjcmVhdGVkLCBzbyB5b3UgY2FuIGRvIGZpbmFsIGFkZGluZyBvZiBjdXN0b20gYXR0cmlidXRlcyBldGMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUm93UG9zdENyZWF0ZTogKChwYXJhbXM6IFByb2Nlc3NSb3dQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggcm93cyBhcmUgc2VsZWN0YWJsZS4gQnkgZGVmYXVsdCByb3dzIGFyZSBzZWxlY3RhYmxlLCBzbyByZXR1cm4gYGZhbHNlYCB0byBtYWtlIGEgcm93IHVuLXNlbGVjdGFibGUuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd1NlbGVjdGFibGU6IElzUm93U2VsZWN0YWJsZTxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBNYXN0ZXIgRGV0YWlsIHRvIGRldGVybWluZSBpZiBhIHJvdyBzaG91bGQgYmUgYSBtYXN0ZXIgcm93LiBJZiBgZmFsc2VgIGlzIHJldHVybmVkIG5vIGRldGFpbCByb3cgd2lsbCBleGlzdCBmb3IgdGhpcyByb3cuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd01hc3RlcjogSXNSb3dNYXN0ZXI8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBmaWxsIHZhbHVlcyBpbnN0ZWFkIG9mIHNpbXBseSBjb3B5aW5nIHZhbHVlcyBvciBpbmNyZWFzaW5nIG51bWJlciB2YWx1ZXMgdXNpbmcgbGluZWFyIHByb2dyZXNzaW9uLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbE9wZXJhdGlvbjogKChwYXJhbXM6IEZpbGxPcGVyYXRpb25QYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBwZXJmb3JtIGFkZGl0aW9uYWwgc29ydGluZyBhZnRlciB0aGUgZ3JpZCBoYXMgc29ydGVkIHRoZSByb3dzLiBXaGVuIHVzZWQgd2l0aCBTU1JNLCBvbmx5IGFwcGxpY2FibGUgd2hlbiBgc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw9dHJ1ZWAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0U29ydFJvd3M6ICgocGFyYW1zOiBQb3N0U29ydFJvd3NQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdmVyc2lvbiBvZiBwcm9wZXJ0eSBgcm93U3R5bGVgIHRvIHNldCBzdHlsZSBmb3IgZWFjaCByb3cgaW5kaXZpZHVhbGx5LiBGdW5jdGlvbiBzaG91bGQgcmV0dXJuIGFuIG9iamVjdCBvZiBDU1MgdmFsdWVzIG9yIHVuZGVmaW5lZCBmb3Igbm8gc3R5bGVzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93U3R5bGU6ICgocGFyYW1zOiBSb3dDbGFzc1BhcmFtczxURGF0YT4pID0+IFJvd1N0eWxlIHwgdW5kZWZpbmVkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdmVyc2lvbiBvZiBwcm9wZXJ0eSBgcm93Q2xhc3NgIHRvIHNldCBjbGFzcyhlcykgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBlaXRoZXIgYSBzdHJpbmcgKGNsYXNzIG5hbWUpLCBhcnJheSBvZiBzdHJpbmdzIChhcnJheSBvZiBjbGFzcyBuYW1lcykgb3IgdW5kZWZpbmVkIGZvciBubyBjbGFzcy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0NsYXNzOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd0hlaWdodGAgdG8gc2V0IGhlaWdodCBmb3IgZWFjaCByb3cgaW5kaXZpZHVhbGx5LiBGdW5jdGlvbiBzaG91bGQgcmV0dXJuIGEgcG9zaXRpdmUgbnVtYmVyIG9mIHBpeGVscywgb3IgcmV0dXJuIGBudWxsYC9gdW5kZWZpbmVkYCB0byB1c2UgdGhlIGRlZmF1bHQgcm93IGhlaWdodC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0hlaWdodDogKChwYXJhbXM6IFJvd0hlaWdodFBhcmFtczxURGF0YT4pID0+IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUZWxscyB0aGUgZ3JpZCBpZiB0aGlzIHJvdyBzaG91bGQgYmUgcmVuZGVyZWQgYXMgZnVsbCB3aWR0aC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRnVsbFdpZHRoUm93OiAoKHBhcmFtczogSXNGdWxsV2lkdGhSb3dQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuICAgIC8qKiBUaGUgdG9vbCBwYW5lbCB2aXNpYmlsaXR5IGhhcyBjaGFuZ2VkLiBGaXJlcyB0d2ljZSBpZiBzd2l0Y2hpbmcgYmV0d2VlbiBwYW5lbHMgLSBvbmNlIHdpdGggdGhlIG9sZCBwYW5lbCBhbmQgb25jZSB3aXRoIHRoZSBuZXcgcGFuZWwuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbFBhbmVsVmlzaWJsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgdG9vbCBwYW5lbCBzaXplIGhhcyBiZWVuIGNoYW5nZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbFBhbmVsU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxTaXplQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDdXQgb3BlcmF0aW9uIGhhcyBzdGFydGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGN1dFN0YXJ0OiBFdmVudEVtaXR0ZXI8Q3V0U3RhcnRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDdXRTdGFydEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ3V0IG9wZXJhdGlvbiBoYXMgZW5kZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY3V0RW5kOiBFdmVudEVtaXR0ZXI8Q3V0RW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q3V0RW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBQYXN0ZSBvcGVyYXRpb24gaGFzIHN0YXJ0ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVTdGFydDogRXZlbnRFbWl0dGVyPFBhc3RlU3RhcnRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBQYXN0ZSBvcGVyYXRpb24gaGFzIGVuZGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlRW5kOiBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZUVuZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4sIG9yIGdyb3VwIG9mIGNvbHVtbnMsIHdhcyBoaWRkZW4gLyBzaG93bi5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WaXNpYmxlOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uLCBvciBncm91cCBvZiBjb2x1bW5zLCB3YXMgcGlubmVkIC8gdW5waW5uZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGlubmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGlubmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGlubmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgcmVzaXplZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5SZXNpemVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJlc2l6ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uIHdhcyBtb3ZlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Nb3ZlZDogRXZlbnRFbWl0dGVyPENvbHVtbk1vdmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgdmFsdWUgY29sdW1uIHdhcyBhZGRlZCBvciByZW1vdmVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIHBpdm90IG1vZGUgZmxhZyB3YXMgY2hhbmdlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdE1vZGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcGl2b3QgY29sdW1uIHdhcyBhZGRlZCwgcmVtb3ZlZCBvciBvcmRlciBjaGFuZ2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4gZ3JvdXAgd2FzIG9wZW5lZCAvIGNsb3NlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFVzZXIgc2V0IG5ldyBjb2x1bW5zLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIG5ld0NvbHVtbnNMb2FkZWQ6IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGxpc3Qgb2YgZ3JpZCBjb2x1bW5zIGNoYW5nZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBkaXNwbGF5ZWQgY29sdW1ucyBjaGFuZ2VkLiBUaGlzIGNhbiByZXN1bHQgZnJvbSBjb2x1bW5zIG9wZW4gLyBjbG9zZSwgY29sdW1uIG1vdmUsIHBpdm90LCBncm91cCwgZXRjLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGxpc3Qgb2YgcmVuZGVyZWQgY29sdW1ucyBjaGFuZ2VkIChvbmx5IGNvbHVtbnMgaW4gdGhlIHZpc2libGUgc2Nyb2xsZWQgdmlld3BvcnQgYXJlIHJlbmRlcmVkIGJ5IGRlZmF1bHQpLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogU2hvdGd1biAtIGdldHMgY2FsbGVkIHdoZW4gZWl0aGVyIGEpIG5ldyBjb2x1bW5zIGFyZSBzZXQgb3IgYikgYGFwaS5hcHBseUNvbHVtblN0YXRlKClgIGlzIHVzZWQsIHNvIGV2ZXJ5dGhpbmcgaGFzIGNoYW5nZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIG1vdXNlIGN1cnNvciBpcyBpbml0aWFsbHkgbW92ZWQgb3ZlciBhIGNvbHVtbiBoZWFkZXIuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uSGVhZGVyTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyTW91c2VPdmVyRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyTW91c2VPdmVyRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIG1vdXNlIGN1cnNvciBpcyBtb3ZlZCBvdXQgb2YgYSBjb2x1bW4gaGVhZGVyLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkhlYWRlck1vdXNlTGVhdmU6IEV2ZW50RW1pdHRlcjxDb2x1bW5IZWFkZXJNb3VzZUxlYXZlRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyTW91c2VMZWF2ZUV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjbGljayBpcyBwZXJmb3JtZWQgb24gYSBjb2x1bW4gaGVhZGVyLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkhlYWRlckNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5IZWFkZXJDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb250ZXh0IG1lbnUgYWN0aW9uLCBzdWNoIGFzIHJpZ2h0LWNsaWNrIG9yIGNvbnRleHQgbWVudSBrZXkgcHJlc3MsIGlzIHBlcmZvcm1lZCBvbiBhIGNvbHVtbiBoZWFkZXIuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uSGVhZGVyQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxDb2x1bW5IZWFkZXJDb250ZXh0TWVudUV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkhlYWRlckNvbnRleHRNZW51RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBPbmx5IHVzZWQgYnkgQW5ndWxhciwgUmVhY3QgYW5kIFZ1ZUpTIEFHIEdyaWQgY29tcG9uZW50cyAobm90IHVzZWQgaWYgZG9pbmcgcGxhaW4gSmF2YVNjcmlwdCkuXG4gICAgICAgICAqIElmIHRoZSBncmlkIHJlY2VpdmVzIGNoYW5nZXMgZHVlIHRvIGJvdW5kIHByb3BlcnRpZXMsIHRoaXMgZXZlbnQgZmlyZXMgYWZ0ZXIgdGhlIGdyaWQgaGFzIGZpbmlzaGVkIHByb2Nlc3NpbmcgdGhlIGNoYW5nZS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb21wb25lbnRTdGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFZhbHVlIGhhcyBjaGFuZ2VkIGFmdGVyIGVkaXRpbmcgKHRoaXMgZXZlbnQgd2lsbCBub3QgZmlyZSBpZiBlZGl0aW5nIHdhcyBjYW5jZWxsZWQsIGVnIEVTQyB3YXMgcHJlc3NlZCkgb3JcbiAgICAgICAgICogIGlmIGNlbGwgdmFsdWUgaGFzIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgY3V0LCBwYXN0ZSwgY2VsbCBjbGVhciAocHJlc3NpbmcgRGVsZXRlIGtleSksXG4gICAgICAgICAqIGZpbGwgaGFuZGxlLCBjb3B5IHJhbmdlIGRvd24sIHVuZG8gYW5kIHJlZG8uXG4gICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2VsbFZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFZhbHVlIGhhcyBjaGFuZ2VkIGFmdGVyIGVkaXRpbmcuIE9ubHkgZmlyZXMgd2hlbiBgcmVhZE9ubHlFZGl0PXRydWVgLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0UmVxdWVzdDogRXZlbnRFbWl0dGVyPENlbGxFZGl0UmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0UmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjZWxsJ3MgdmFsdWUgd2l0aGluIGEgcm93IGhhcyBjaGFuZ2VkLiBUaGlzIGV2ZW50IGNvcnJlc3BvbmRzIHRvIEZ1bGwgUm93IEVkaXRpbmcgb25seS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSBjZWxsIGhhcyBzdGFydGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIGNlbGwgaGFzIHN0b3BwZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdGFydGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RhcnRlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBGdWxsIFJvdyBFZGl0aW5nLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIHJvdyBoYXMgc3RvcHBlZCAod2hlbiByb3cgZWRpdGluZyBpcyBlbmFibGVkKS4gV2hlbiByb3cgZWRpdGluZywgdGhpcyBldmVudCB3aWxsIGJlIGZpcmVkIG9uY2UgYW5kIGBjZWxsRWRpdGluZ1N0b3BwZWRgIHdpbGwgYmUgZmlyZWQgZm9yIGVhY2ggaW5kaXZpZHVhbCBjZWxsLiBPbmx5IGZpcmVzIHdoZW4gZG9pbmcgRnVsbCBSb3cgRWRpdGluZy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFVuZG8gb3BlcmF0aW9uIGhhcyBzdGFydGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHVuZG9TdGFydGVkOiBFdmVudEVtaXR0ZXI8VW5kb1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxVbmRvU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVW5kbyBvcGVyYXRpb24gaGFzIGVuZGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHVuZG9FbmRlZDogRXZlbnRFbWl0dGVyPFVuZG9FbmRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFVuZG9FbmRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUmVkbyBvcGVyYXRpb24gaGFzIHN0YXJ0ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmVkb1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxSZWRvU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJlZG9TdGFydGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSZWRvIG9wZXJhdGlvbiBoYXMgZW5kZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmVkb0VuZGVkOiBFdmVudEVtaXR0ZXI8UmVkb0VuZGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmVkb0VuZGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSYW5nZSBkZWxldGUgb3BlcmF0aW9uIChjZWxsIGNsZWFyKSBoYXMgc3RhcnRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByYW5nZURlbGV0ZVN0YXJ0OiBFdmVudEVtaXR0ZXI8UmFuZ2VEZWxldGVTdGFydEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJhbmdlRGVsZXRlU3RhcnRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJhbmdlIGRlbGV0ZSBvcGVyYXRpb24gKGNlbGwgY2xlYXIpIGhhcyBlbmRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByYW5nZURlbGV0ZUVuZDogRXZlbnRFbWl0dGVyPFJhbmdlRGVsZXRlRW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmFuZ2VEZWxldGVFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpbHRlciBoYXMgYmVlbiBvcGVuZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyT3BlbmVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIGFwcGxpZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgd2FzIG1vZGlmaWVkIGJ1dCBub3QgYXBwbGllZC4gVXNlZCB3aGVuIGZpbHRlcnMgaGF2ZSAnQXBwbHknIGJ1dHRvbnMuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyTW9kaWZpZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBZHZhbmNlZCBGaWx0ZXIgQnVpbGRlciB2aXNpYmlsaXR5IGhhcyBjaGFuZ2VkIChvcGVuZWQgb3IgY2xvc2VkKS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBhZHZhbmNlZEZpbHRlckJ1aWxkZXJWaXNpYmxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEFkdmFuY2VkRmlsdGVyQnVpbGRlclZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QWR2YW5jZWRGaWx0ZXJCdWlsZGVyVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY2hhcnQgaGFzIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydENyZWF0ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGRhdGEgcmFuZ2UgZm9yIHRoZSBjaGFydCBoYXMgYmVlbiBjaGFuZ2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ8VERhdGE+PigpO1xuICAgIC8qKiBGb3JtYXR0aW5nIGNoYW5nZXMgaGF2ZSBiZWVuIG1hZGUgYnkgdXNlcnMgdGhyb3VnaCB0aGUgRm9ybWF0IFBhbmVsLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0T3B0aW9uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0T3B0aW9uc0NoYW5nZWQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydERlc3Ryb3llZDogRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPFREYXRhPj4oKTtcbiAgICAvKiogRE9NIGV2ZW50IGBrZXlEb3duYCBoYXBwZW5lZCBvbiBhIGNlbGwuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEtleURvd246IEV2ZW50RW1pdHRlcjxDZWxsS2V5RG93bkV2ZW50PFREYXRhPiB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGdyaWQgaGFzIGluaXRpYWxpc2VkIGFuZCBpcyByZWFkeSBmb3IgbW9zdCBhcGkgY2FsbHMsIGJ1dCBtYXkgbm90IGJlIGZ1bGx5IHJlbmRlcmVkIHlldCAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUmVhZHk6IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEludm9rZWQgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBncmlkIGlzIGRlc3Ryb3llZC4gVGhpcyBpcyB1c2VmdWwgZm9yIGNsZWFudXAgbG9naWMgdGhhdCBuZWVkcyB0byBydW4gYmVmb3JlIHRoZSBncmlkIGlzIHRvcm4gZG93bi5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUHJlRGVzdHJveWVkOiBFdmVudEVtaXR0ZXI8R3JpZFByZURlc3Ryb3llZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRQcmVEZXN0cm95ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpcmVkIHRoZSBmaXJzdCB0aW1lIGRhdGEgaXMgcmVuZGVyZWQgaW50byB0aGUgZ3JpZC4gVXNlIHRoaXMgZXZlbnQgaWYgeW91IHdhbnQgdG8gYXV0byByZXNpemUgY29sdW1ucyBiYXNlZCBvbiB0aGVpciBjb250ZW50cyAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpcnN0RGF0YVJlbmRlcmVkOiBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaXJzdERhdGFSZW5kZXJlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIHNpemUgb2YgdGhlIGdyaWQgYGRpdmAgaGFzIGNoYW5nZWQuIEluIG90aGVyIHdvcmRzLCB0aGUgZ3JpZCB3YXMgcmVzaXplZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIERpc3BsYXllZCByb3dzIGhhdmUgY2hhbmdlZC4gVHJpZ2dlcmVkIGFmdGVyIHNvcnQsIGZpbHRlciBvciB0cmVlIGV4cGFuZCAvIGNvbGxhcHNlIGV2ZW50cy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IHdhcyByZW1vdmVkIGZyb20gdGhlIERPTSwgZm9yIGFueSByZWFzb24uIFVzZSB0byBjbGVhbiB1cCByZXNvdXJjZXMgKGlmIGFueSkgdXNlZCBieSB0aGUgcm93LlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxSb3dSZW1vdmVkOiBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogV2hpY2ggcm93cyBhcmUgcmVuZGVyZWQgaW4gdGhlIERPTSBoYXMgY2hhbmdlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aWV3cG9ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBib2R5IHdhcyBzY3JvbGxlZCBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1haW4gYm9keSBvZiB0aGUgZ3JpZCBoYXMgc3RvcHBlZCBzY3JvbGxpbmcsIGVpdGhlciBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsRW5kOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RhcnRzLiBUaGlzIGNvdWxkIGJlIGFueSBhY3Rpb24gdGhhdCB1c2VzIHRoZSBncmlkJ3MgRHJhZyBhbmQgRHJvcCBzZXJ2aWNlLCBlLmcuIENvbHVtbiBNb3ZpbmcsIENvbHVtbiBSZXNpemluZywgUmFuZ2UgU2VsZWN0aW9uLCBGaWxsIEhhbmRsZSwgZXRjLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdGFydGVkOiBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogV2hlbiBkcmFnZ2luZyBzdG9wcy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RvcHBlZDogRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0b3BwZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEdyaWQgc3RhdGUgaGFzIGJlZW4gdXBkYXRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzdGF0ZVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxTdGF0ZVVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxTdGF0ZVVwZGF0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRyaWdnZXJlZCBldmVyeSB0aW1lIHRoZSBwYWdpbmcgc3RhdGUgY2hhbmdlcy4gU29tZSBvZiB0aGUgbW9zdCBjb21tb24gc2NlbmFyaW9zIGZvciB0aGlzIGV2ZW50IHRvIGJlIHRyaWdnZXJlZCBhcmU6XG4gICAgICAgICAqXG4gICAgICAgICAqICAtIFRoZSBwYWdlIHNpemUgY2hhbmdlcy5cbiAgICAgICAgICogIC0gVGhlIGN1cnJlbnQgc2hvd24gcGFnZSBpcyBjaGFuZ2VkLlxuICAgICAgICAgKiAgLSBOZXcgZGF0YSBpcyBsb2FkZWQgb250byB0aGUgZ3JpZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFnaW5hdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgZHJhZyBoYXMgc3RhcnRlZCwgb3IgZHJhZ2dpbmcgd2FzIGFscmVhZHkgc3RhcnRlZCBhbmQgdGhlIG1vdXNlIGhhcyByZS1lbnRlcmVkIHRoZSBncmlkIGhhdmluZyBwcmV2aW91c2x5IGxlZnQgdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VudGVyOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbW92ZWQgd2hpbGUgZHJhZ2dpbmcuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ01vdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIG1vdXNlIGhhcyBsZWZ0IHRoZSBncmlkIHdoaWxlIGRyYWdnaW5nLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdMZWF2ZTogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgZHJhZyBoYXMgZmluaXNoZWQgb3ZlciB0aGUgZ3JpZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW5kOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IGdyb3VwIGNvbHVtbiB3YXMgYWRkZWQsIHJlbW92ZWQgb3IgcmVvcmRlcmVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSByb3cgZ3JvdXAgd2FzIG9wZW5lZCBvciBjbG9zZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93R3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaXJlZCB3aGVuIGNhbGxpbmcgZWl0aGVyIG9mIHRoZSBBUEkgbWV0aG9kcyBgZXhwYW5kQWxsKClgIG9yIGBjb2xsYXBzZUFsbCgpYC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBleHBhbmRPckNvbGxhcHNlQWxsOiBFdmVudEVtaXR0ZXI8RXhwYW5kQ29sbGFwc2VBbGxFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxFeHBhbmRDb2xsYXBzZUFsbEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGNsaWVudCBoYXMgc2V0IG5ldyBwaW5uZWQgcm93IGRhdGEgaW50byB0aGUgZ3JpZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwaW5uZWRSb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENsaWVudC1TaWRlIFJvdyBNb2RlbCBvbmx5LiBUaGUgY2xpZW50IGhhcyB1cGRhdGVkIGRhdGEgZm9yIHRoZSBncmlkIGJ5IGVpdGhlciBhKSBzZXR0aW5nIG5ldyBSb3cgRGF0YSBvciBiKSBBcHBseWluZyBhIFJvdyBUcmFuc2FjdGlvbi5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhVXBkYXRlZDogRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEFzeW5jIHRyYW5zYWN0aW9ucyBoYXZlIGJlZW4gYXBwbGllZC4gQ29udGFpbnMgYSBsaXN0IG9mIGFsbCB0cmFuc2FjdGlvbiByZXN1bHRzLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDogRXZlbnRFbWl0dGVyPEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHNlcnZlciBzaWRlIHN0b3JlIGhhcyBmaW5pc2hlZCByZWZyZXNoaW5nLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHN0b3JlUmVmcmVzaGVkOiBFdmVudEVtaXR0ZXI8U3RvcmVSZWZyZXNoZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxTdG9yZVJlZnJlc2hlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ2VsbCBpcyBjbGlja2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDbGlja2VkOiBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ2VsbCBpcyBkb3VibGUgY2xpY2tlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbERvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgZm9jdXNlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRm9jdXNlZDogRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGVudGVyZWQgY2VsbC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3ZlckV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGxlZnQgY2VsbC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdXQ6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGRvd24gb24gY2VsbC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlRG93bkV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBpcyBjbGlja2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93Q2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IGlzIGRvdWJsZSBjbGlja2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IGlzIHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuIFRoZSBldmVudCBjb250YWlucyB0aGUgbm9kZSBpbiBxdWVzdGlvbiwgc28gY2FsbCB0aGUgbm9kZSdzIGBpc1NlbGVjdGVkKClgIG1ldGhvZCB0byBzZWUgaWYgaXQgd2FzIGp1c3Qgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dTZWxlY3RlZDogRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBzZWxlY3Rpb24gaXMgY2hhbmdlZC4gVXNlIHRoZSBncmlkIEFQSSBgZ2V0U2VsZWN0ZWROb2RlcygpYCBvciBgZ2V0U2VsZWN0ZWRSb3dzKClgIHRvIGdldCB0aGUgbmV3IGxpc3Qgb2Ygc2VsZWN0ZWQgbm9kZXMgLyByb3cgZGF0YS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8U2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgcmlnaHQgY2xpY2tlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY2hhbmdlIHRvIHJhbmdlIHNlbGVjdGlvbiBoYXMgb2NjdXJyZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHRvb2x0aXAgaGFzIGJlZW4gZGlzcGxheWVkICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbHRpcFNob3c6IEV2ZW50RW1pdHRlcjxUb29sdGlwU2hvd0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2x0aXBTaG93RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHRvb2x0aXAgd2FzIGhpZGRlbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2x0aXBIaWRlOiBFdmVudEVtaXR0ZXI8VG9vbHRpcEhpZGVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxUb29sdGlwSGlkZUV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogU29ydCBoYXMgY2hhbmdlZC4gVGhlIGdyaWQgYWxzbyBsaXN0ZW5zIGZvciB0aGlzIGFuZCB1cGRhdGVzIHRoZSBtb2RlbC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8U29ydENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOS4yICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjkuMiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI5LjIgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOS4yICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuXG5cbiAgICAvLyBFbmFibGUgdHlwZSBjb2VyY2lvbiBmb3IgYm9vbGVhbiBJbnB1dHMgdG8gc3VwcG9ydCB1c2UgbGlrZSAnZW5hYmxlQ2hhcnRzJyBpbnN0ZWFkIG9mIGZvcmNpbmcgJ1tlbmFibGVDaGFydHNdPVwidHJ1ZVwiJyBcbiAgICAvLyBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdGVtcGxhdGUtdHlwZWNoZWNrI2lucHV0LXNldHRlci1jb2VyY2lvbiBcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYWtlQ29sdW1uVmlzaWJsZUFmdGVyVW5Hcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDZWxsRm9jdXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTZWxlY3RzQ2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNTaG93VmVydGljYWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlYnVnOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxFeHByZXNzaW9uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBJbmNsdWRlVG90YWxGb290ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU3VwcHJlc3NCbGFua0hlYWRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNZW51SGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5Tb3J0SWNvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNdWx0aVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c011bHRpU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc05vUm93c092ZXJsYXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWx0YVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dHcm91cEhpZGVzQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29weVJvd3NUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29weUhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29weUdyb3VwSGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9waXZvdE1vZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWdnRnVuY0luSGVhZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNBZ2dyZWdhdGVBdFJvb3RMZXZlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FuaW1hdGVSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUnRsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnTXVsdGlSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUdyb3VwRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwQWxsb3dVbmJhbGFuY2VkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Njcm9sbE9uTmV3RGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTY3JvbGxXaGVuUG9wdXBzQXJlT3BlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcHVyZ2VDbG9zZWRSb3dOb2RlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2FjaGVRdWlja0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW5jbHVkZUhpZGRlbkNvbHVtbnNJblF1aWNrRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9leGNsdWRlSGlkZGVuQ29sdW1uc0Zyb21RdWlja0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5zdXJlRG9tT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FjY2VudGVkU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlQ2FjaGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlQ2FjaGVOZXZlckV4cGlyZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FnZ3JlZ2F0ZU9ubHlDaGFuZ2VkQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDc3ZFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luY2x1ZGVIaWRkZW5Db2x1bW5zSW5BZHZhbmNlZEZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW50ZXJNb3Zlc0Rvd25BZnRlckVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTmF2aWdhdGVzVmVydGljYWxseUFmdGVyRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Byb3BlcnR5TmFtZXNDaGVjazogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93SG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93VHJhbnNmb3JtOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaXBib2FyZFBhc3RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0xhc3RFbXB0eUxpbmVPblBhc3RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDaGFydHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNoYXJ0VG9vbFBhbmVsc0J1dHRvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDaGFydFRvb2xQYW5lbHNCdXR0b246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90b29sdGlwTW91c2VUcmFjazogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdG9vbHRpcEludGVyYWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9rZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGV0YWlsUm93QXV0b0hlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUZpbHRlckFsbExldmVsczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZVNvcnRBbGxMZXZlbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVPbmx5UmVmcmVzaEZpbHRlcmVkR3JvdXBzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlU29ydE9uU2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlRmlsdGVyT25TZXJ2ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWdnRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaG93T3BlbmVkR3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpcGJvYXJkQXBpOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vZGVsVXBkYXRlQWZ0ZXJVcGRhdGVUcmFuc2FjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX21haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwTWFpbnRhaW5PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29sdW1uSG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3JlYWRPbmx5RWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dWaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbEVkaXRpbmdPbkJhY2tzcGFjZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVzZXRSb3dEYXRhT25VcGRhdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3JlbW92ZVBpdm90SGVhZGVyUm93V2hlblNpbmdsZVZhbHVlQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvcHlTaW5nbGVDZWxsUmFuZ2VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0dyb3VwUm93c1N0aWNreTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDdXRUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0dyb3VwUGFuZWxTdXBwcmVzc1NvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93U2hvd0NoYW5nZUFmdGVyRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVBZHZhbmNlZEZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90cmVlRGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NHcm91cE1haW50YWluVmFsdWVUeXBlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIC8vIEBFTkRAXG59XG4iXX0=