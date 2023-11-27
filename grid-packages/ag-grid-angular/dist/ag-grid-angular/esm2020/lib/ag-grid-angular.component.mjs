import { Component, EventEmitter, Input, Output, ViewEncapsulation } from "@angular/core";
import { AgPromise, ComponentUtil, ColumnApi, createGrid } from "ag-grid-community";
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
        /** Specifies the status bar components to use in the status bar.
             * @initial
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
             * @initial
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
             * @initial
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
             * @initial
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
             * @initial
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
        /** Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-id='abc'` where `abc` is what you return as the business key.
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
        this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setComponentFactoryResolver(this.componentFactoryResolver);
        this.angularFrameworkOverrides.setEmitterUsedCallback(this.isEmitterUsed.bind(this));
        const mergedGridOps = ComponentUtil.combineAttributesAndGridOptions(this.gridOptions, this);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: this.angularFrameworkOverrides,
            providedBeanInstances: {
                frameworkComponentWrapper: this.frameworkComponentWrapper
            },
            modules: (this.modules || [])
        };
        const api = createGrid(this._nativeElement, mergedGridOps, this.gridParams);
        if (api) {
            this.api = api;
            this.columnApi = new ColumnApi(api);
        }
        if (this.gridPreDestroyed.observers.length > 0) {
            console.warn('AG Grid: gridPreDestroyed event listener registered via (gridPreDestroyed)="method($event)" will be ignored! ' +
                'Please assign via gridOptions.gridPreDestroyed and pass to the grid as [gridOptions]="gridOptions"');
        }
        this._initialised = true;
        // sometimes, especially in large client apps gridReady can fire before ngAfterViewInit
        // this ties these together so that gridReady will always fire after agGridAngular's ngAfterViewInit
        // the actual containing component's ngAfterViewInit will fire just after agGridAngular's
        this._fullyReady.resolveNow(null, resolve => resolve);
    }
    ngOnChanges(changes) {
        if (this._initialised) {
            const gridOptions = {};
            Object.entries(changes).forEach(([key, value]) => {
                gridOptions[key] = value.currentValue;
            });
            ComponentUtil.processOnChange(gridOptions, this.api);
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
AgGridAngular.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AgGridAngular, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1.AngularFrameworkOverrides }, { token: i2.AngularFrameworkComponentWrapper }, { token: i0.ComponentFactoryResolver }], target: i0.ɵɵFactoryTarget.Component });
AgGridAngular.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: AgGridAngular, selector: "ag-grid-angular", inputs: { gridOptions: "gridOptions", modules: "modules", statusBar: "statusBar", sideBar: "sideBar", suppressContextMenu: "suppressContextMenu", preventDefaultOnContextMenu: "preventDefaultOnContextMenu", allowContextMenuWithControlKey: "allowContextMenuWithControlKey", suppressMenuHide: "suppressMenuHide", enableBrowserTooltips: "enableBrowserTooltips", tooltipTrigger: "tooltipTrigger", tooltipShowDelay: "tooltipShowDelay", tooltipHideDelay: "tooltipHideDelay", tooltipMouseTrack: "tooltipMouseTrack", tooltipInteraction: "tooltipInteraction", popupParent: "popupParent", copyHeadersToClipboard: "copyHeadersToClipboard", copyGroupHeadersToClipboard: "copyGroupHeadersToClipboard", clipboardDelimiter: "clipboardDelimiter", suppressCopyRowsToClipboard: "suppressCopyRowsToClipboard", suppressCopySingleCellRanges: "suppressCopySingleCellRanges", suppressLastEmptyLineOnPaste: "suppressLastEmptyLineOnPaste", suppressClipboardPaste: "suppressClipboardPaste", suppressClipboardApi: "suppressClipboardApi", suppressCutToClipboard: "suppressCutToClipboard", columnDefs: "columnDefs", defaultColDef: "defaultColDef", defaultColGroupDef: "defaultColGroupDef", columnTypes: "columnTypes", dataTypeDefinitions: "dataTypeDefinitions", maintainColumnOrder: "maintainColumnOrder", suppressFieldDotNotation: "suppressFieldDotNotation", headerHeight: "headerHeight", groupHeaderHeight: "groupHeaderHeight", floatingFiltersHeight: "floatingFiltersHeight", pivotHeaderHeight: "pivotHeaderHeight", pivotGroupHeaderHeight: "pivotGroupHeaderHeight", allowDragFromColumnsToolPanel: "allowDragFromColumnsToolPanel", suppressMovableColumns: "suppressMovableColumns", suppressColumnMoveAnimation: "suppressColumnMoveAnimation", suppressDragLeaveHidesColumns: "suppressDragLeaveHidesColumns", suppressRowGroupHidesColumns: "suppressRowGroupHidesColumns", colResizeDefault: "colResizeDefault", suppressAutoSize: "suppressAutoSize", autoSizePadding: "autoSizePadding", skipHeaderOnAutoSize: "skipHeaderOnAutoSize", autoSizeStrategy: "autoSizeStrategy", components: "components", editType: "editType", singleClickEdit: "singleClickEdit", suppressClickEdit: "suppressClickEdit", readOnlyEdit: "readOnlyEdit", stopEditingWhenCellsLoseFocus: "stopEditingWhenCellsLoseFocus", enterMovesDown: "enterMovesDown", enterMovesDownAfterEdit: "enterMovesDownAfterEdit", enterNavigatesVertically: "enterNavigatesVertically", enterNavigatesVerticallyAfterEdit: "enterNavigatesVerticallyAfterEdit", enableCellEditingOnBackspace: "enableCellEditingOnBackspace", undoRedoCellEditing: "undoRedoCellEditing", undoRedoCellEditingLimit: "undoRedoCellEditingLimit", defaultCsvExportParams: "defaultCsvExportParams", suppressCsvExport: "suppressCsvExport", defaultExcelExportParams: "defaultExcelExportParams", suppressExcelExport: "suppressExcelExport", excelStyles: "excelStyles", quickFilterText: "quickFilterText", cacheQuickFilter: "cacheQuickFilter", excludeHiddenColumnsFromQuickFilter: "excludeHiddenColumnsFromQuickFilter", includeHiddenColumnsInQuickFilter: "includeHiddenColumnsInQuickFilter", quickFilterParser: "quickFilterParser", quickFilterMatcher: "quickFilterMatcher", excludeChildrenWhenTreeDataFiltering: "excludeChildrenWhenTreeDataFiltering", enableAdvancedFilter: "enableAdvancedFilter", advancedFilterModel: "advancedFilterModel", includeHiddenColumnsInAdvancedFilter: "includeHiddenColumnsInAdvancedFilter", advancedFilterParent: "advancedFilterParent", advancedFilterBuilderParams: "advancedFilterBuilderParams", enableCharts: "enableCharts", chartThemes: "chartThemes", customChartThemes: "customChartThemes", chartThemeOverrides: "chartThemeOverrides", enableChartToolPanelsButton: "enableChartToolPanelsButton", suppressChartToolPanelsButton: "suppressChartToolPanelsButton", chartToolPanelsDef: "chartToolPanelsDef", loadingCellRenderer: "loadingCellRenderer", loadingCellRendererParams: "loadingCellRendererParams", loadingCellRendererSelector: "loadingCellRendererSelector", localeText: "localeText", masterDetail: "masterDetail", keepDetailRows: "keepDetailRows", keepDetailRowsCount: "keepDetailRowsCount", detailCellRenderer: "detailCellRenderer", detailCellRendererParams: "detailCellRendererParams", detailRowHeight: "detailRowHeight", detailRowAutoHeight: "detailRowAutoHeight", context: "context", alignedGrids: "alignedGrids", tabIndex: "tabIndex", rowBuffer: "rowBuffer", valueCache: "valueCache", valueCacheNeverExpires: "valueCacheNeverExpires", enableCellExpressions: "enableCellExpressions", suppressParentsInRowNodes: "suppressParentsInRowNodes", suppressTouch: "suppressTouch", suppressFocusAfterRefresh: "suppressFocusAfterRefresh", suppressAsyncEvents: "suppressAsyncEvents", suppressBrowserResizeObserver: "suppressBrowserResizeObserver", suppressPropertyNamesCheck: "suppressPropertyNamesCheck", suppressChangeDetection: "suppressChangeDetection", debug: "debug", overlayLoadingTemplate: "overlayLoadingTemplate", loadingOverlayComponent: "loadingOverlayComponent", loadingOverlayComponentParams: "loadingOverlayComponentParams", suppressLoadingOverlay: "suppressLoadingOverlay", overlayNoRowsTemplate: "overlayNoRowsTemplate", noRowsOverlayComponent: "noRowsOverlayComponent", noRowsOverlayComponentParams: "noRowsOverlayComponentParams", suppressNoRowsOverlay: "suppressNoRowsOverlay", pagination: "pagination", paginationPageSize: "paginationPageSize", paginationPageSizeSelector: "paginationPageSizeSelector", paginationAutoPageSize: "paginationAutoPageSize", paginateChildRows: "paginateChildRows", suppressPaginationPanel: "suppressPaginationPanel", pivotMode: "pivotMode", pivotPanelShow: "pivotPanelShow", pivotDefaultExpanded: "pivotDefaultExpanded", pivotColumnGroupTotals: "pivotColumnGroupTotals", pivotRowTotals: "pivotRowTotals", pivotSuppressAutoColumn: "pivotSuppressAutoColumn", suppressExpandablePivotGroups: "suppressExpandablePivotGroups", functionsReadOnly: "functionsReadOnly", aggFuncs: "aggFuncs", suppressAggFuncInHeader: "suppressAggFuncInHeader", alwaysAggregateAtRootLevel: "alwaysAggregateAtRootLevel", suppressAggAtRootLevel: "suppressAggAtRootLevel", aggregateOnlyChangedColumns: "aggregateOnlyChangedColumns", suppressAggFilteredOnly: "suppressAggFilteredOnly", removePivotHeaderRowWhenSingleValueColumn: "removePivotHeaderRowWhenSingleValueColumn", animateRows: "animateRows", enableCellChangeFlash: "enableCellChangeFlash", cellFlashDelay: "cellFlashDelay", cellFadeDelay: "cellFadeDelay", allowShowChangeAfterFilter: "allowShowChangeAfterFilter", domLayout: "domLayout", ensureDomOrder: "ensureDomOrder", enableRtl: "enableRtl", suppressColumnVirtualisation: "suppressColumnVirtualisation", suppressMaxRenderedRowRestriction: "suppressMaxRenderedRowRestriction", suppressRowVirtualisation: "suppressRowVirtualisation", rowDragManaged: "rowDragManaged", suppressRowDrag: "suppressRowDrag", suppressMoveWhenRowDragging: "suppressMoveWhenRowDragging", rowDragEntireRow: "rowDragEntireRow", rowDragMultiRow: "rowDragMultiRow", rowDragText: "rowDragText", fullWidthCellRenderer: "fullWidthCellRenderer", fullWidthCellRendererParams: "fullWidthCellRendererParams", embedFullWidthRows: "embedFullWidthRows", suppressGroupMaintainValueType: "suppressGroupMaintainValueType", groupDisplayType: "groupDisplayType", groupDefaultExpanded: "groupDefaultExpanded", autoGroupColumnDef: "autoGroupColumnDef", groupMaintainOrder: "groupMaintainOrder", groupSelectsChildren: "groupSelectsChildren", groupLockGroupColumns: "groupLockGroupColumns", groupAggFiltering: "groupAggFiltering", groupIncludeFooter: "groupIncludeFooter", groupIncludeTotalFooter: "groupIncludeTotalFooter", groupSuppressBlankHeader: "groupSuppressBlankHeader", groupSelectsFiltered: "groupSelectsFiltered", showOpenedGroup: "showOpenedGroup", groupRemoveSingleChildren: "groupRemoveSingleChildren", groupRemoveLowestSingleChildren: "groupRemoveLowestSingleChildren", groupHideOpenParents: "groupHideOpenParents", groupAllowUnbalanced: "groupAllowUnbalanced", rowGroupPanelShow: "rowGroupPanelShow", groupRowRenderer: "groupRowRenderer", groupRowRendererParams: "groupRowRendererParams", suppressMakeColumnVisibleAfterUnGroup: "suppressMakeColumnVisibleAfterUnGroup", treeData: "treeData", rowGroupPanelSuppressSort: "rowGroupPanelSuppressSort", suppressGroupRowsSticky: "suppressGroupRowsSticky", pinnedTopRowData: "pinnedTopRowData", pinnedBottomRowData: "pinnedBottomRowData", rowModelType: "rowModelType", rowData: "rowData", asyncTransactionWaitMillis: "asyncTransactionWaitMillis", suppressModelUpdateAfterUpdateTransaction: "suppressModelUpdateAfterUpdateTransaction", datasource: "datasource", cacheOverflowSize: "cacheOverflowSize", infiniteInitialRowCount: "infiniteInitialRowCount", serverSideInitialRowCount: "serverSideInitialRowCount", suppressServerSideInfiniteScroll: "suppressServerSideInfiniteScroll", cacheBlockSize: "cacheBlockSize", maxBlocksInCache: "maxBlocksInCache", maxConcurrentDatasourceRequests: "maxConcurrentDatasourceRequests", blockLoadDebounceMillis: "blockLoadDebounceMillis", purgeClosedRowNodes: "purgeClosedRowNodes", serverSideDatasource: "serverSideDatasource", serverSideSortAllLevels: "serverSideSortAllLevels", serverSideOnlyRefreshFilteredGroups: "serverSideOnlyRefreshFilteredGroups", serverSideFilterAllLevels: "serverSideFilterAllLevels", serverSideSortOnServer: "serverSideSortOnServer", serverSideFilterOnServer: "serverSideFilterOnServer", serverSidePivotResultFieldSeparator: "serverSidePivotResultFieldSeparator", viewportDatasource: "viewportDatasource", viewportRowModelPageSize: "viewportRowModelPageSize", viewportRowModelBufferSize: "viewportRowModelBufferSize", alwaysShowHorizontalScroll: "alwaysShowHorizontalScroll", alwaysShowVerticalScroll: "alwaysShowVerticalScroll", debounceVerticalScrollbar: "debounceVerticalScrollbar", suppressHorizontalScroll: "suppressHorizontalScroll", suppressScrollOnNewData: "suppressScrollOnNewData", suppressScrollWhenPopupsAreOpen: "suppressScrollWhenPopupsAreOpen", suppressAnimationFrame: "suppressAnimationFrame", suppressMiddleClickScrolls: "suppressMiddleClickScrolls", suppressPreventDefaultOnMouseWheel: "suppressPreventDefaultOnMouseWheel", scrollbarWidth: "scrollbarWidth", rowSelection: "rowSelection", rowMultiSelectWithClick: "rowMultiSelectWithClick", suppressRowDeselection: "suppressRowDeselection", suppressRowClickSelection: "suppressRowClickSelection", suppressCellFocus: "suppressCellFocus", suppressMultiRangeSelection: "suppressMultiRangeSelection", enableCellTextSelection: "enableCellTextSelection", enableRangeSelection: "enableRangeSelection", enableRangeHandle: "enableRangeHandle", enableFillHandle: "enableFillHandle", fillHandleDirection: "fillHandleDirection", suppressClearOnFillReduction: "suppressClearOnFillReduction", sortingOrder: "sortingOrder", accentedSort: "accentedSort", unSortIcon: "unSortIcon", suppressMultiSort: "suppressMultiSort", alwaysMultiSort: "alwaysMultiSort", multiSortKey: "multiSortKey", suppressMaintainUnsortedOrder: "suppressMaintainUnsortedOrder", icons: "icons", rowHeight: "rowHeight", rowStyle: "rowStyle", rowClass: "rowClass", rowClassRules: "rowClassRules", suppressRowHoverHighlight: "suppressRowHoverHighlight", suppressRowTransform: "suppressRowTransform", columnHoverHighlight: "columnHoverHighlight", gridId: "gridId", deltaSort: "deltaSort", treeDataDisplayType: "treeDataDisplayType", functionsPassive: "functionsPassive", enableGroupEdit: "enableGroupEdit", initialState: "initialState", getContextMenuItems: "getContextMenuItems", getMainMenuItems: "getMainMenuItems", postProcessPopup: "postProcessPopup", processUnpinnedColumns: "processUnpinnedColumns", processCellForClipboard: "processCellForClipboard", processHeaderForClipboard: "processHeaderForClipboard", processGroupHeaderForClipboard: "processGroupHeaderForClipboard", processCellFromClipboard: "processCellFromClipboard", sendToClipboard: "sendToClipboard", processDataFromClipboard: "processDataFromClipboard", isExternalFilterPresent: "isExternalFilterPresent", doesExternalFilterPass: "doesExternalFilterPass", getChartToolbarItems: "getChartToolbarItems", createChartContainer: "createChartContainer", navigateToNextHeader: "navigateToNextHeader", tabToNextHeader: "tabToNextHeader", navigateToNextCell: "navigateToNextCell", tabToNextCell: "tabToNextCell", getLocaleText: "getLocaleText", getDocument: "getDocument", paginationNumberFormatter: "paginationNumberFormatter", getGroupRowAgg: "getGroupRowAgg", isGroupOpenByDefault: "isGroupOpenByDefault", initialGroupOrderComparator: "initialGroupOrderComparator", processPivotResultColDef: "processPivotResultColDef", processPivotResultColGroupDef: "processPivotResultColGroupDef", getDataPath: "getDataPath", getChildCount: "getChildCount", getServerSideGroupLevelParams: "getServerSideGroupLevelParams", isServerSideGroupOpenByDefault: "isServerSideGroupOpenByDefault", isApplyServerSideTransaction: "isApplyServerSideTransaction", isServerSideGroup: "isServerSideGroup", getServerSideGroupKey: "getServerSideGroupKey", getBusinessKeyForNode: "getBusinessKeyForNode", getRowId: "getRowId", resetRowDataOnUpdate: "resetRowDataOnUpdate", processRowPostCreate: "processRowPostCreate", isRowSelectable: "isRowSelectable", isRowMaster: "isRowMaster", fillOperation: "fillOperation", postSortRows: "postSortRows", getRowStyle: "getRowStyle", getRowClass: "getRowClass", getRowHeight: "getRowHeight", isFullWidthRow: "isFullWidthRow" }, outputs: { toolPanelVisibleChanged: "toolPanelVisibleChanged", toolPanelSizeChanged: "toolPanelSizeChanged", cutStart: "cutStart", cutEnd: "cutEnd", pasteStart: "pasteStart", pasteEnd: "pasteEnd", columnVisible: "columnVisible", columnPinned: "columnPinned", columnResized: "columnResized", columnMoved: "columnMoved", columnValueChanged: "columnValueChanged", columnPivotModeChanged: "columnPivotModeChanged", columnPivotChanged: "columnPivotChanged", columnGroupOpened: "columnGroupOpened", newColumnsLoaded: "newColumnsLoaded", gridColumnsChanged: "gridColumnsChanged", displayedColumnsChanged: "displayedColumnsChanged", virtualColumnsChanged: "virtualColumnsChanged", columnEverythingChanged: "columnEverythingChanged", componentStateChanged: "componentStateChanged", cellValueChanged: "cellValueChanged", cellEditRequest: "cellEditRequest", rowValueChanged: "rowValueChanged", cellEditingStarted: "cellEditingStarted", cellEditingStopped: "cellEditingStopped", rowEditingStarted: "rowEditingStarted", rowEditingStopped: "rowEditingStopped", undoStarted: "undoStarted", undoEnded: "undoEnded", redoStarted: "redoStarted", redoEnded: "redoEnded", rangeDeleteStart: "rangeDeleteStart", rangeDeleteEnd: "rangeDeleteEnd", filterOpened: "filterOpened", filterChanged: "filterChanged", filterModified: "filterModified", advancedFilterBuilderVisibleChanged: "advancedFilterBuilderVisibleChanged", chartCreated: "chartCreated", chartRangeSelectionChanged: "chartRangeSelectionChanged", chartOptionsChanged: "chartOptionsChanged", chartDestroyed: "chartDestroyed", cellKeyDown: "cellKeyDown", gridReady: "gridReady", gridPreDestroyed: "gridPreDestroyed", firstDataRendered: "firstDataRendered", gridSizeChanged: "gridSizeChanged", modelUpdated: "modelUpdated", virtualRowRemoved: "virtualRowRemoved", viewportChanged: "viewportChanged", bodyScroll: "bodyScroll", bodyScrollEnd: "bodyScrollEnd", dragStarted: "dragStarted", dragStopped: "dragStopped", stateUpdated: "stateUpdated", paginationChanged: "paginationChanged", rowDragEnter: "rowDragEnter", rowDragMove: "rowDragMove", rowDragLeave: "rowDragLeave", rowDragEnd: "rowDragEnd", columnRowGroupChanged: "columnRowGroupChanged", rowGroupOpened: "rowGroupOpened", expandOrCollapseAll: "expandOrCollapseAll", pinnedRowDataChanged: "pinnedRowDataChanged", rowDataUpdated: "rowDataUpdated", asyncTransactionsFlushed: "asyncTransactionsFlushed", storeRefreshed: "storeRefreshed", cellClicked: "cellClicked", cellDoubleClicked: "cellDoubleClicked", cellFocused: "cellFocused", cellMouseOver: "cellMouseOver", cellMouseOut: "cellMouseOut", cellMouseDown: "cellMouseDown", rowClicked: "rowClicked", rowDoubleClicked: "rowDoubleClicked", rowSelected: "rowSelected", selectionChanged: "selectionChanged", cellContextMenu: "cellContextMenu", rangeSelectionChanged: "rangeSelectionChanged", tooltipShow: "tooltipShow", tooltipHide: "tooltipHide", sortChanged: "sortChanged", columnRowGroupChangeRequest: "columnRowGroupChangeRequest", columnPivotChangeRequest: "columnPivotChangeRequest", columnValueChangeRequest: "columnValueChangeRequest", columnAggFuncChangeRequest: "columnAggFuncChangeRequest" }, providers: [
        AngularFrameworkOverrides,
        AngularFrameworkComponentWrapper
    ], usesOnChanges: true, ngImport: i0, template: '', isInline: true, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.3.0", ngImport: i0, type: AgGridAngular, decorators: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVILFNBQVMsRUFHVCxZQUFZLEVBQ1osS0FBSyxFQUdMLE1BQU0sRUFFTixpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQVcsU0FBUyxFQUFtQyxVQUFVLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQW1LOUgsZ0JBQWdCO0FBRWhCLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxNQUFNLG9DQUFvQyxDQUFDOzs7O0FBWXRGLE1BQU0sT0FBTyxhQUFhO0lBb0J0QixZQUFZLFVBQXNCLEVBQ3RCLGdCQUFrQyxFQUNsQyx5QkFBb0QsRUFDcEQseUJBQTJELEVBQzNELHdCQUFrRDtRQUhsRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFrQztRQUMzRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBcEJ0RCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSTNCLDBEQUEwRDtRQUNsRCxnQkFBVyxHQUF1QixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBc0hsRSxVQUFVO1FBQ1Y7O2VBRU87UUFDUyxjQUFTLEdBQW9ELFNBQVMsQ0FBQztRQUN2RjtlQUNPO1FBQ1MsWUFBTyxHQUFnRSxTQUFTLENBQUM7UUFDakc7O2VBRU87UUFDUyx3QkFBbUIsR0FBd0IsU0FB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QUdVLGFBQWE7c0JBQTdCLE1BQU07Z0JBR1UsV0FBVztzQkFBM0IsTUFBTTtnQkFHVSxXQUFXO3NCQUEzQixNQUFNO2dCQUdVLFlBQVk7c0JBQTVCLE1BQU07Z0JBT1UsaUJBQWlCO3NCQUFqQyxNQUFNO2dCQUdVLFlBQVk7c0JBQTVCLE1BQU07Z0JBR1UsV0FBVztzQkFBM0IsTUFBTTtnQkFHVSxZQUFZO3NCQUE1QixNQUFNO2dCQUdVLFVBQVU7c0JBQTFCLE1BQU07Z0JBR1UscUJBQXFCO3NCQUFyQyxNQUFNO2dCQUdVLGNBQWM7c0JBQTlCLE1BQU07Z0JBR1UsbUJBQW1CO3NCQUFuQyxNQUFNO2dCQUdVLG9CQUFvQjtzQkFBcEMsTUFBTTtnQkFHVSxjQUFjO3NCQUE5QixNQUFNO2dCQUdVLHdCQUF3QjtzQkFBeEMsTUFBTTtnQkFHVSxjQUFjO3NCQUE5QixNQUFNO2dCQUdVLFdBQVc7c0JBQTNCLE1BQU07Z0JBR1UsaUJBQWlCO3NCQUFqQyxNQUFNO2dCQUdVLFdBQVc7c0JBQTNCLE1BQU07Z0JBR1UsYUFBYTtzQkFBN0IsTUFBTTtnQkFHVSxZQUFZO3NCQUE1QixNQUFNO2dCQUdVLGFBQWE7c0JBQTdCLE1BQU07Z0JBR1UsVUFBVTtzQkFBMUIsTUFBTTtnQkFHVSxnQkFBZ0I7c0JBQWhDLE1BQU07Z0JBR1UsV0FBVztzQkFBM0IsTUFBTTtnQkFHVSxnQkFBZ0I7c0JBQWhDLE1BQU07Z0JBR1UsZUFBZTtzQkFBL0IsTUFBTTtnQkFHVSxxQkFBcUI7c0JBQXJDLE1BQU07Z0JBRVUsV0FBVztzQkFBM0IsTUFBTTtnQkFFVSxXQUFXO3NCQUEzQixNQUFNO2dCQUdVLFdBQVc7c0JBQTNCLE1BQU07Z0JBRVUsMkJBQTJCO3NCQUEzQyxNQUFNO2dCQUVVLHdCQUF3QjtzQkFBeEMsTUFBTTtnQkFFVSx3QkFBd0I7c0JBQXhDLE1BQU07Z0JBRVUsMEJBQTBCO3NCQUExQyxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZnRlclZpZXdJbml0LFxuICAgIENvbXBvbmVudCxcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgRWxlbWVudFJlZixcbiAgICBFdmVudEVtaXR0ZXIsXG4gICAgSW5wdXQsXG4gICAgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveSxcbiAgICBPdXRwdXQsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQgeyBBZ1Byb21pc2UsIENvbXBvbmVudFV0aWwsIEdyaWRBcGksIENvbHVtbkFwaSwgR3JpZE9wdGlvbnMsIEdyaWRQYXJhbXMsIE1vZHVsZSwgY3JlYXRlR3JpZCB9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuXG4vLyBAU1RBUlRfSU1QT1JUU0BcbmltcG9ydCB7XG4gICAgQWR2YW5jZWRGaWx0ZXJCdWlsZGVyVmlzaWJsZUNoYW5nZWRFdmVudCxcbiAgICBBZHZhbmNlZEZpbHRlck1vZGVsLFxuICAgIEFnQ2hhcnRUaGVtZSxcbiAgICBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMsXG4gICAgQWxpZ25lZEdyaWQsXG4gICAgQXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkLFxuICAgIEJvZHlTY3JvbGxFbmRFdmVudCxcbiAgICBCb2R5U2Nyb2xsRXZlbnQsXG4gICAgQ2VsbENsaWNrZWRFdmVudCxcbiAgICBDZWxsQ29udGV4dE1lbnVFdmVudCxcbiAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxFZGl0UmVxdWVzdEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIENlbGxGb2N1c2VkRXZlbnQsXG4gICAgQ2VsbEtleURvd25FdmVudCxcbiAgICBDZWxsTW91c2VEb3duRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3V0RXZlbnQsXG4gICAgQ2VsbE1vdXNlT3ZlckV2ZW50LFxuICAgIENlbGxQb3NpdGlvbixcbiAgICBDZWxsVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ2hhcnRDcmVhdGVkLFxuICAgIENoYXJ0RGVzdHJveWVkLFxuICAgIENoYXJ0T3B0aW9uc0NoYW5nZWQsXG4gICAgQ2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQsXG4gICAgQ2hhcnRSZWZQYXJhbXMsXG4gICAgQ2hhcnRUb29sUGFuZWxzRGVmLFxuICAgIENvbERlZixcbiAgICBDb2xHcm91cERlZixcbiAgICBDb2xUeXBlRGVmLFxuICAgIENvbHVtbixcbiAgICBDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uR3JvdXBPcGVuZWRFdmVudCxcbiAgICBDb2x1bW5Nb3ZlZEV2ZW50LFxuICAgIENvbHVtblBpbm5lZEV2ZW50LFxuICAgIENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblBpdm90Q2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5SZXNpemVkRXZlbnQsXG4gICAgQ29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQsXG4gICAgQ29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uVmlzaWJsZUV2ZW50LFxuICAgIENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50LFxuICAgIENzdkV4cG9ydFBhcmFtcyxcbiAgICBDdXRFbmRFdmVudCxcbiAgICBDdXRTdGFydEV2ZW50LFxuICAgIERhdGFUeXBlRGVmaW5pdGlvbixcbiAgICBEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIERvbUxheW91dFR5cGUsXG4gICAgRHJhZ1N0YXJ0ZWRFdmVudCxcbiAgICBEcmFnU3RvcHBlZEV2ZW50LFxuICAgIEV4Y2VsRXhwb3J0UGFyYW1zLFxuICAgIEV4Y2VsU3R5bGUsXG4gICAgRXhwYW5kQ29sbGFwc2VBbGxFdmVudCxcbiAgICBGaWxsT3BlcmF0aW9uUGFyYW1zLFxuICAgIEZpbHRlckNoYW5nZWRFdmVudCxcbiAgICBGaWx0ZXJNb2RpZmllZEV2ZW50LFxuICAgIEZpbHRlck9wZW5lZEV2ZW50LFxuICAgIEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQsXG4gICAgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudCxcbiAgICBHZXRDaGFydFRvb2xiYXJJdGVtcyxcbiAgICBHZXRDb250ZXh0TWVudUl0ZW1zLFxuICAgIEdldERhdGFQYXRoLFxuICAgIEdldEdyb3VwUm93QWdnUGFyYW1zLFxuICAgIEdldExvY2FsZVRleHRQYXJhbXMsXG4gICAgR2V0TWFpbk1lbnVJdGVtcyxcbiAgICBHZXRSb3dJZEZ1bmMsXG4gICAgR2V0U2VydmVyU2lkZUdyb3VwS2V5LFxuICAgIEdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zUGFyYW1zLFxuICAgIEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIEdyaWRQcmVEZXN0cm95ZWRFdmVudCxcbiAgICBHcmlkUmVhZHlFdmVudCxcbiAgICBHcmlkU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBHcmlkU3RhdGUsXG4gICAgSGVhZGVyUG9zaXRpb24sXG4gICAgSUFkdmFuY2VkRmlsdGVyQnVpbGRlclBhcmFtcyxcbiAgICBJQWdnRnVuYyxcbiAgICBJRGF0YXNvdXJjZSxcbiAgICBJUm93RHJhZ0l0ZW0sXG4gICAgSVJvd05vZGUsXG4gICAgSVNlcnZlclNpZGVEYXRhc291cmNlLFxuICAgIElWaWV3cG9ydERhdGFzb3VyY2UsXG4gICAgSW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yUGFyYW1zLFxuICAgIElzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb24sXG4gICAgSXNFeHRlcm5hbEZpbHRlclByZXNlbnRQYXJhbXMsXG4gICAgSXNGdWxsV2lkdGhSb3dQYXJhbXMsXG4gICAgSXNHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMsXG4gICAgSXNSb3dGaWx0ZXJhYmxlLFxuICAgIElzUm93TWFzdGVyLFxuICAgIElzUm93U2VsZWN0YWJsZSxcbiAgICBJc1NlcnZlclNpZGVHcm91cCxcbiAgICBJc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMsXG4gICAgTG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yRnVuYyxcbiAgICBNb2RlbFVwZGF0ZWRFdmVudCxcbiAgICBOYXZpZ2F0ZVRvTmV4dENlbGxQYXJhbXMsXG4gICAgTmF2aWdhdGVUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgTmV3Q29sdW1uc0xvYWRlZEV2ZW50LFxuICAgIFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQsXG4gICAgUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtcyxcbiAgICBQYXN0ZUVuZEV2ZW50LFxuICAgIFBhc3RlU3RhcnRFdmVudCxcbiAgICBQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50LFxuICAgIFBvc3RQcm9jZXNzUG9wdXBQYXJhbXMsXG4gICAgUG9zdFNvcnRSb3dzUGFyYW1zLFxuICAgIFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtcyxcbiAgICBQcm9jZXNzR3JvdXBIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzUm93UGFyYW1zLFxuICAgIFByb2Nlc3NVbnBpbm5lZENvbHVtbnNQYXJhbXMsXG4gICAgUmFuZ2VEZWxldGVFbmRFdmVudCxcbiAgICBSYW5nZURlbGV0ZVN0YXJ0RXZlbnQsXG4gICAgUmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgUmVkb0VuZGVkRXZlbnQsXG4gICAgUmVkb1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dDbGFzc1J1bGVzLFxuICAgIFJvd0NsaWNrZWRFdmVudCxcbiAgICBSb3dEYXRhVXBkYXRlZEV2ZW50LFxuICAgIFJvd0RvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBSb3dEcmFnRXZlbnQsXG4gICAgUm93RWRpdGluZ1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIFJvd0dyb3VwT3BlbmVkRXZlbnQsXG4gICAgUm93R3JvdXBpbmdEaXNwbGF5VHlwZSxcbiAgICBSb3dIZWlnaHRQYXJhbXMsXG4gICAgUm93TW9kZWxUeXBlLFxuICAgIFJvd1NlbGVjdGVkRXZlbnQsXG4gICAgUm93U3R5bGUsXG4gICAgUm93VmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgU2VsZWN0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIFNlbmRUb0NsaXBib2FyZFBhcmFtcyxcbiAgICBTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtcyxcbiAgICBTaWRlQmFyRGVmLFxuICAgIFNpemVDb2x1bW5zVG9Db250ZW50U3RyYXRlZ3ksXG4gICAgU2l6ZUNvbHVtbnNUb0ZpdEdyaWRTdHJhdGVneSxcbiAgICBTaXplQ29sdW1uc1RvRml0UHJvdmlkZWRXaWR0aFN0cmF0ZWd5LFxuICAgIFNvcnRDaGFuZ2VkRXZlbnQsXG4gICAgU29ydERpcmVjdGlvbixcbiAgICBTdGF0ZVVwZGF0ZWRFdmVudCxcbiAgICBTdGF0dXNQYW5lbERlZixcbiAgICBTdG9yZVJlZnJlc2hlZEV2ZW50LFxuICAgIFRhYlRvTmV4dENlbGxQYXJhbXMsXG4gICAgVGFiVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIFRvb2xQYW5lbFNpemVDaGFuZ2VkRXZlbnQsXG4gICAgVG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudCxcbiAgICBUb29sdGlwSGlkZUV2ZW50LFxuICAgIFRvb2x0aXBTaG93RXZlbnQsXG4gICAgVHJlZURhdGFEaXNwbGF5VHlwZSxcbiAgICBVbmRvRW5kZWRFdmVudCxcbiAgICBVbmRvU3RhcnRlZEV2ZW50LFxuICAgIFVzZUdyb3VwRm9vdGVyLFxuICAgIFZpZXdwb3J0Q2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxSb3dSZW1vdmVkRXZlbnRcbn0gZnJvbSBcImFnLWdyaWQtY29tbXVuaXR5XCI7XG4vLyBARU5EX0lNUE9SVFNAXG5cbmltcG9ydCB7IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzXCI7XG5pbXBvcnQgeyBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlciB9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1hbmd1bGFyJyxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIEFuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXG4gICAgXSxcbiAgICAvLyB0ZWxsIGFuZ3VsYXIgd2UgZG9uJ3Qgd2FudCB2aWV3IGVuY2Fwc3VsYXRpb24sIHdlIGRvbid0IHdhbnQgYSBzaGFkb3cgcm9vdFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhcjxURGF0YSA9IGFueSwgVENvbERlZiBleHRlbmRzIENvbERlZjxURGF0YT4gPSBDb2xEZWY8YW55Pj4gaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gICAgLy8gbm90IGludGVuZGVkIGZvciB1c2VyIHRvIGludGVyYWN0IHdpdGguIHNvIHB1dHRpbmcgXyBpbiBzbyBpZiB1c2VyIGdldHMgcmVmZXJlbmNlXG4gICAgLy8gdG8gdGhpcyBvYmplY3QsIHRoZXkga2luZCdhIGtub3cgaXQncyBub3QgcGFydCBvZiB0aGUgYWdyZWVkIGludGVyZmFjZVxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBncmlkUGFyYW1zOiBHcmlkUGFyYW1zO1xuXG4gICAgLy8gaW4gb3JkZXIgdG8gZW5zdXJlIGZpcmluZyBvZiBncmlkUmVhZHkgaXMgZGV0ZXJtaW5pc3RpY1xuICAgIHByaXZhdGUgX2Z1bGx5UmVhZHk6IEFnUHJvbWlzZTxib29sZWFuPiA9IEFnUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXG4gICAgLyoqIEdyaWQgQXBpIGF2YWlsYWJsZSBhZnRlciBvbkdyaWRSZWFkeSBldmVudCBoYXMgZmlyZWQuICovXG4gICAgcHVibGljIGFwaTogR3JpZEFwaTxURGF0YT47XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgdjMxIC0gVGhlIGBjb2x1bW5BcGlgIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIGFsbCB0aGUgbWV0aG9kcyBhcmUgbm93IHByZXNlbnQgb2YgdGhlIGBhcGlgLlxuICAgICAqIFBsZWFzZSB1c2UgdGhlIGBhcGlgIGluc3RlYWQuXG4gICAgICovXG4gICAgcHVibGljIGNvbHVtbkFwaTogQ29sdW1uQXBpO1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudERlZjogRWxlbWVudFJlZixcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICBwcml2YXRlIGFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXM6IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgIHByaXZhdGUgZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcjogQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIsXG4gICAgICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpIHtcbiAgICAgICAgdGhpcy5fbmF0aXZlRWxlbWVudCA9IGVsZW1lbnREZWYubmF0aXZlRWxlbWVudDtcblxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldFZpZXdDb250YWluZXJSZWYodGhpcy52aWV3Q29udGFpbmVyUmVmKTtcbiAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcih0aGlzLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgIHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5zZXRFbWl0dGVyVXNlZENhbGxiYWNrKHRoaXMuaXNFbWl0dGVyVXNlZC5iaW5kKHRoaXMpKTtcblxuICAgICAgICBjb25zdCBtZXJnZWRHcmlkT3BzID0gQ29tcG9uZW50VXRpbC5jb21iaW5lQXR0cmlidXRlc0FuZEdyaWRPcHRpb25zKHRoaXMuZ3JpZE9wdGlvbnMsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuZ3JpZFBhcmFtcyA9IHtcbiAgICAgICAgICAgIGdsb2JhbEV2ZW50TGlzdGVuZXI6IHRoaXMuZ2xvYmFsRXZlbnRMaXN0ZW5lci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgZnJhbWV3b3JrT3ZlcnJpZGVzOiB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMsXG4gICAgICAgICAgICBwcm92aWRlZEJlYW5JbnN0YW5jZXM6IHtcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2R1bGVzOiAodGhpcy5tb2R1bGVzIHx8IFtdKSBhcyBhbnlcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBhcGkgPSBjcmVhdGVHcmlkKHRoaXMuX25hdGl2ZUVsZW1lbnQsIG1lcmdlZEdyaWRPcHMsIHRoaXMuZ3JpZFBhcmFtcyk7XG5cbiAgICAgICAgaWYgKGFwaSkge1xuICAgICAgICAgICAgdGhpcy5hcGkgPSBhcGk7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbkFwaSA9IG5ldyBDb2x1bW5BcGkoYXBpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmdyaWRQcmVEZXN0cm95ZWQub2JzZXJ2ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQUcgR3JpZDogZ3JpZFByZURlc3Ryb3llZCBldmVudCBsaXN0ZW5lciByZWdpc3RlcmVkIHZpYSAoZ3JpZFByZURlc3Ryb3llZCk9XCJtZXRob2QoJGV2ZW50KVwiIHdpbGwgYmUgaWdub3JlZCEgJyArXG4gICAgICAgICAgICAgICAgJ1BsZWFzZSBhc3NpZ24gdmlhIGdyaWRPcHRpb25zLmdyaWRQcmVEZXN0cm95ZWQgYW5kIHBhc3MgdG8gdGhlIGdyaWQgYXMgW2dyaWRPcHRpb25zXT1cImdyaWRPcHRpb25zXCInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBzb21ldGltZXMsIGVzcGVjaWFsbHkgaW4gbGFyZ2UgY2xpZW50IGFwcHMgZ3JpZFJlYWR5IGNhbiBmaXJlIGJlZm9yZSBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgLy8gdGhpcyB0aWVzIHRoZXNlIHRvZ2V0aGVyIHNvIHRoYXQgZ3JpZFJlYWR5IHdpbGwgYWx3YXlzIGZpcmUgYWZ0ZXIgYWdHcmlkQW5ndWxhcidzIG5nQWZ0ZXJWaWV3SW5pdFxuICAgICAgICAvLyB0aGUgYWN0dWFsIGNvbnRhaW5pbmcgY29tcG9uZW50J3MgbmdBZnRlclZpZXdJbml0IHdpbGwgZmlyZSBqdXN0IGFmdGVyIGFnR3JpZEFuZ3VsYXInc1xuICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnJlc29sdmVOb3cobnVsbCwgcmVzb2x2ZSA9PiByZXNvbHZlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9pbml0aWFsaXNlZCkge1xuICAgICAgICAgIGNvbnN0IGdyaWRPcHRpb25zOiBHcmlkT3B0aW9ucyA9IHt9O1xuICAgICAgICAgIE9iamVjdC5lbnRyaWVzKGNoYW5nZXMpLmZvckVhY2goKFtrZXksIHZhbHVlXTogW3N0cmluZywgYW55XSkgPT4ge1xuICAgICAgICAgICAgICAgZ3JpZE9wdGlvbnNba2V5IGFzIGtleW9mIEdyaWRPcHRpb25zXSA9IHZhbHVlLmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBDb21wb25lbnRVdGlsLnByb2Nlc3NPbkNoYW5nZShncmlkT3B0aW9ucywgdGhpcy5hcGkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgdGhlIGRlc3Ryb3ksIHNvIHdlIGtub3cgbm90IHRvIGVtaXQgYW55IGV2ZW50c1xuICAgICAgICAgICAgLy8gd2hpbGUgdGVhcmluZyBkb3duIHRoZSBncmlkLlxuICAgICAgICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAvLyBjb3VsZCBiZSBudWxsIGlmIGdyaWQgZmFpbGVkIHRvIGluaXRpYWxpc2VcbiAgICAgICAgICAgICB0aGlzLmFwaT8uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2UnbGwgZW1pdCB0aGUgZW1pdCBpZiBhIHVzZXIgaXMgbGlzdGVuaW5nIGZvciBhIGdpdmVuIGV2ZW50IGVpdGhlciBvbiB0aGUgY29tcG9uZW50IHZpYSBub3JtYWwgYW5ndWxhciBiaW5kaW5nXG4gICAgLy8gb3IgdmlhIGdyaWRPcHRpb25zXG4gICAgcHJvdGVjdGVkIGlzRW1pdHRlclVzZWQoZXZlbnRUeXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBjb25zdCBoYXNFbWl0dGVyID0gISFlbWl0dGVyICYmIGVtaXR0ZXIub2JzZXJ2ZXJzICYmIGVtaXR0ZXIub2JzZXJ2ZXJzLmxlbmd0aCA+IDA7XG5cbiAgICAgICAgLy8gZ3JpZFJlYWR5ID0+IG9uR3JpZFJlYWR5XG4gICAgICAgIGNvbnN0IGFzRXZlbnROYW1lID0gYG9uJHtldmVudFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCl9JHtldmVudFR5cGUuc3Vic3RyaW5nKDEpfWBcbiAgICAgICAgY29uc3QgaGFzR3JpZE9wdGlvbkxpc3RlbmVyID0gISF0aGlzLmdyaWRPcHRpb25zICYmICEhKHRoaXMuZ3JpZE9wdGlvbnMgYXMgYW55KVthc0V2ZW50TmFtZV07XG5cbiAgICAgICAgcmV0dXJuIGhhc0VtaXR0ZXIgfHwgaGFzR3JpZE9wdGlvbkxpc3RlbmVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2xvYmFsRXZlbnRMaXN0ZW5lcihldmVudFR5cGU6IHN0cmluZywgZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgdGVhcmluZyBkb3duLCBkb24ndCBlbWl0IGFuZ3VsYXIgZXZlbnRzLCBhcyB0aGlzIGNhdXNlc1xuICAgICAgICAvLyBwcm9ibGVtcyB3aXRoIHRoZSBhbmd1bGFyIHJvdXRlclxuICAgICAgICBpZiAodGhpcy5fZGVzdHJveWVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZW5lcmljYWxseSBsb29rIHVwIHRoZSBldmVudFR5cGVcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IDxFdmVudEVtaXR0ZXI8YW55Pj4oPGFueT50aGlzKVtldmVudFR5cGVdO1xuICAgICAgICBpZiAoZW1pdHRlciAmJiB0aGlzLmlzRW1pdHRlclVzZWQoZXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gJ2dyaWRSZWFkeScpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGdyaWRSZWFkeSwgd2FpdCBmb3IgbmdBZnRlclZpZXdJbml0IHRvIGZpcmUgZmlyc3QsIHRoZW4gZW1pdCB0aGVcbiAgICAgICAgICAgICAgICAvLyBncmlkUmVhZHkgZXZlbnRcbiAgICAgICAgICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnRoZW4oKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdChldmVudCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgIC8qKiBQcm92aWRlZCBhbiBpbml0aWFsIGdyaWRPcHRpb25zIGNvbmZpZ3VyYXRpb24gdG8gdGhlIGNvbXBvbmVudC4gSWYgYSBwcm9wZXJ0eSBpcyBzcGVjaWZpZWQgaW4gYm90aCBncmlkT3B0aW9ucyBhbmQgdmlhIGNvbXBvbmVudCBiaW5kaW5nIHRoZSBjb21wb25lbnQgYmluZGluZyB0YWtlcyBwcmVjZWRlbmNlLiAgKi9cbiAgICAgQElucHV0KCkgcHVibGljIGdyaWRPcHRpb25zOiBHcmlkT3B0aW9uczxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgIC8qKlxuICAgICAqIFVzZWQgdG8gcmVnaXN0ZXIgQUcgR3JpZCBNb2R1bGVzIGRpcmVjdGx5IHdpdGggdGhpcyBpbnN0YW5jZSBvZiB0aGUgZ3JpZC5cbiAgICAgKiBTZWUgW1Byb3ZpZGluZyBNb2R1bGVzIFRvIEluZGl2aWR1YWwgR3JpZHNdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2FuZ3VsYXItZGF0YS1ncmlkL21vZHVsZXMvI3Byb3ZpZGluZy1tb2R1bGVzLXRvLWluZGl2aWR1YWwtZ3JpZHMpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqL1xuICAgICBASW5wdXQoKSBwdWJsaWMgbW9kdWxlczogTW9kdWxlW10gfCB1bmRlZmluZWQ7XG5cbiAgICAvLyBAU1RBUlRAXG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc3RhdHVzIGJhciBjb21wb25lbnRzIHRvIHVzZSBpbiB0aGUgc3RhdHVzIGJhci5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0YXR1c0JhcjogeyBzdGF0dXNQYW5lbHM6IFN0YXR1c1BhbmVsRGVmW107IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc2lkZSBiYXIgY29tcG9uZW50cy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpZGVCYXI6IFNpZGVCYXJEZWYgfCBzdHJpbmcgfCBzdHJpbmdbXSB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzaG93IHRoZSBjb250ZXh0IG1lbnUuIFVzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgJ3JpZ2h0IGNsaWNrJyBjb250ZXh0IG1lbnUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGBzdXBwcmVzc0NvbnRleHRNZW51YCwgeW91IGNhbiB1c2UgdGhlIGBvbkNlbGxDb250ZXh0TWVudWAgZnVuY3Rpb24gdG8gcHJvdmlkZSB5b3VyIG93biBjb2RlIHRvIGhhbmRsZSBjZWxsIGBjb250ZXh0bWVudWAgZXZlbnRzLlxuICAgICAgICAgKiBUaGlzIGZsYWcgaXMgdXNlZnVsIHRvIHByZXZlbnQgdGhlIGJyb3dzZXIgZnJvbSBzaG93aW5nIGl0cyBkZWZhdWx0IGNvbnRleHQgbWVudS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNvbnRleHQgbWVudSB0byBzaG93LCBldmVuIHdoZW4gYEN0cmxgIGtleSBpcyBoZWxkIGRvd24uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIHNob3cgdGhlIGNvbHVtbiBtZW51IGJ1dHRvbiwgcmF0aGVyIHRoYW4gb25seSBzaG93aW5nIHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGNvbHVtbiBoZWFkZXIuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHVzZSB0aGUgYnJvd3NlcidzIGRlZmF1bHQgdG9vbHRpcCBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBncmlkJ3MgVG9vbHRpcCBDb21wb25lbnQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSB0cmlnZ2VyIHRoYXQgd2lsbCBjYXVzZSB0b29sdGlwcyB0byBzaG93IGFuZCBoaWRlLlxuICAgICAgICAgKiAgLSBgaG92ZXJgIC0gVGhlIHRvb2x0aXAgd2lsbCBzaG93L2hpZGUgd2hlbiBhIGNlbGwvaGVhZGVyIGlzIGhvdmVyZWQuXG4gICAgICAgICAqICAtIGBmb2N1c2AgLSBUaGUgdG9vbHRpcCB3aWxsIHNob3cvaGlkZSB3aGVuIGEgY2VsbC9oZWFkZXIgaXMgZm9jdXNlZC5cbiAgICAgICAgICogQGRlZmF1bHQgJ2hvdmVyJ1xuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFRyaWdnZXI6ICdob3ZlcicgfCAnZm9jdXMnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIHRoYXQgaXQgdGFrZXMgZm9yIHRvb2x0aXBzIHRvIHNob3cgdXAgb25jZSBhbiBlbGVtZW50IGlzIGhvdmVyZWQgb3Zlci5cbiAgICAgICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgLlxuICAgICAgICAgKiBAZGVmYXVsdCAyMDAwXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwU2hvd0RlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgdGhhdCBpdCB0YWtlcyBmb3IgdG9vbHRpcHMgdG8gaGlkZSBvbmNlIHRoZXkgaGF2ZSBiZWVuIGRpc3BsYXllZC5cbiAgICAgICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgIGFuZCBgdG9vbHRpcEhpZGVUcmlnZ2Vyc2AgaW5jbHVkZXMgYHRpbWVvdXRgLlxuICAgICAgICAgKiBAZGVmYXVsdCAxMDAwMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcEhpZGVEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdG9vbHRpcHMgZm9sbG93IHRoZSBjdXJzb3Igb25jZSB0aGV5IGFyZSBkaXNwbGF5ZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwTW91c2VUcmFjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdG9vbHRpcCBpbnRlcmFjdGlvbi4gV2hlbiB0aGlzIG9wdGlvbiBpcyBlbmFibGVkLCB0aGUgdG9vbHRpcCB3aWxsIG5vdCBoaWRlIHdoaWxlIHRoZVxuICAgICAgICAgKiB0b29sdGlwIGl0c2VsZiBpdCBiZWluZyBob3ZlcmVkIG9yIGhhcyBmb2N1cy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBJbnRlcmFjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRE9NIGVsZW1lbnQgdG8gdXNlIGFzIHRoZSBwb3B1cCBwYXJlbnQgZm9yIGdyaWQgcG9wdXBzIChjb250ZXh0IG1lbnUsIGNvbHVtbiBtZW51IGV0YykuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3B1cFBhcmVudDogSFRNTEVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsc28gaW5jbHVkZSBoZWFkZXJzIHdoZW4gY29weWluZyB0byBjbGlwYm9hcmQgdXNpbmcgYEN0cmwgKyBDYCBjbGlwYm9hcmQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5SGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsc28gaW5jbHVkZSBncm91cCBoZWFkZXJzIHdoZW4gY29weWluZyB0byBjbGlwYm9hcmQgdXNpbmcgYEN0cmwgKyBDYCBjbGlwYm9hcmQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5R3JvdXBIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZnkgdGhlIGRlbGltaXRlciB0byB1c2Ugd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZC5cbiAgICAgICAgICogQGRlZmF1bHQgJ1xcdCdcbiAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2xpcGJvYXJkRGVsaW1pdGVyOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29weSB0aGUgY2VsbCByYW5nZSBvciBmb2N1c2VkIGNlbGwgdG8gdGhlIGNsaXBib2FyZCBhbmQgbmV2ZXIgdGhlIHNlbGVjdGVkIHJvd3MuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29weSByb3dzIGluc3RlYWQgb2YgcmFuZ2VzIHdoZW4gYSByYW5nZSB3aXRoIG9ubHkgYSBzaW5nbGUgY2VsbCBpcyBzZWxlY3RlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ29weVNpbmdsZUNlbGxSYW5nZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gd29yayBhcm91bmQgYSBidWcgd2l0aCBFeGNlbCAoV2luZG93cykgdGhhdCBhZGRzIGFuIGV4dHJhIGVtcHR5IGxpbmUgYXQgdGhlIGVuZCBvZiByYW5nZXMgY29waWVkIHRvIHRoZSBjbGlwYm9hcmQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0xhc3RFbXB0eUxpbmVPblBhc3RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb2ZmIHBhc3RlIG9wZXJhdGlvbnMgd2l0aGluIHRoZSBncmlkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdG9wIHRoZSBncmlkIHRyeWluZyB0byB1c2UgdGhlIENsaXBib2FyZCBBUEksIGlmIGl0IGlzIGJsb2NrZWQsIGFuZCBpbW1lZGlhdGVseSBmYWxsYmFjayB0byB0aGUgd29ya2Fyb3VuZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkQXBpOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGJsb2NrICAgICAqKmN1dCoqIG9wZXJhdGlvbnMgd2l0aGluIHRoZSBncmlkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDdXRUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXJyYXkgb2YgQ29sdW1uIC8gQ29sdW1uIEdyb3VwIGRlZmluaXRpb25zLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uRGVmczogKFRDb2xEZWYgfCBDb2xHcm91cERlZjxURGF0YT4pW10gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29sdW1uIGRlZmluaXRpb24uIEl0ZW1zIGRlZmluZWQgaW4gdGhlIGFjdHVhbCBjb2x1bW4gZGVmaW5pdGlvbnMgZ2V0IHByZWNlZGVuY2UuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sRGVmOiBDb2xEZWY8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29sdW1uIGdyb3VwIGRlZmluaXRpb24uIEFsbCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbnMgd2lsbCB1c2UgdGhlc2UgcHJvcGVydGllcy4gSXRlbXMgZGVmaW5lZCBpbiB0aGUgYWN0dWFsIGNvbHVtbiBncm91cCBkZWZpbml0aW9uIGdldCBwcmVjZWRlbmNlLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbEdyb3VwRGVmOiBQYXJ0aWFsPENvbEdyb3VwRGVmPFREYXRhPj4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBtYXAgb2YgY3VzdG9tIGNvbHVtbiB0eXBlcyB3aGljaCBjb250YWluIGdyb3VwcyBvZiBwcm9wZXJ0aWVzIHRoYXQgY29sdW1uIGRlZmluaXRpb25zIGNhbiByZXVzZSBieSByZWZlcmVuY2luZyBpbiB0aGVpciBgdHlwZWAgcHJvcGVydHkuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5UeXBlczogeyBba2V5OiBzdHJpbmddOiBDb2xUeXBlRGVmPFREYXRhPjsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQW4gb2JqZWN0IG1hcCBvZiBjZWxsIGRhdGEgdHlwZXMgdG8gdGhlaXIgZGVmaW5pdGlvbnMuXG4gICAgICAgICAqIENlbGwgZGF0YSB0eXBlcyBjYW4gZWl0aGVyIG92ZXJyaWRlL3VwZGF0ZSB0aGUgcHJlLWRlZmluZWQgZGF0YSB0eXBlc1xuICAgICAgICAgKiAoYCd0ZXh0J2AsIGAnbnVtYmVyJ2AsICBgJ2Jvb2xlYW4nYCwgIGAnZGF0ZSdgLCAgYCdkYXRlU3RyaW5nJ2Agb3IgIGAnb2JqZWN0J2ApLFxuICAgICAgICAgKiBvciBjYW4gYmUgY3VzdG9tIGRhdGEgdHlwZXMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkYXRhVHlwZURlZmluaXRpb25zOiB7XG4gICAgICAgIFtjZWxsRGF0YVR5cGU6IHN0cmluZ106IERhdGFUeXBlRGVmaW5pdGlvbjxURGF0YT47XG4gICAgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogS2VlcHMgdGhlIG9yZGVyIG9mIENvbHVtbnMgbWFpbnRhaW5lZCBhZnRlciBuZXcgQ29sdW1uIERlZmluaXRpb25zIGFyZSB1cGRhdGVkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGVuIGRvdHMgaW4gZmllbGQgbmFtZXMgKGUuZy4gYCdhZGRyZXNzLmZpcnN0TGluZSdgKSBhcmUgbm90IHRyZWF0ZWQgYXMgZGVlcCByZWZlcmVuY2VzLiBBbGxvd3MgeW91IHRvIHVzZSBkb3RzIGluIHlvdXIgZmllbGQgbmFtZSBpZiB5b3UgcHJlZmVyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGaWVsZERvdE5vdGF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBjb2x1bW4gbGFiZWwgaGVhZGVyLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIHRoZSB0aGVtZSB2YWx1ZSBvZiBgaGVhZGVyLWhlaWdodGAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBoZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3dzIGNvbnRhaW5pbmcgaGVhZGVyIGNvbHVtbiBncm91cHMuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGhlYWRlckhlaWdodGAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBmbG9hdGluZyBmaWx0ZXJzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIHRoZSB0aGVtZSB2YWx1ZSBvZiBgaGVhZGVyLWhlaWdodGAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgY29sdW1ucyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGhlYWRlckhlaWdodGAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzIHdoZW4gaW4gcGl2b3QgbW9kZS4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyBgZ3JvdXBIZWFkZXJIZWlnaHRgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RHcm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvdyByZW9yZGVyaW5nIGFuZCBwaW5uaW5nIGNvbHVtbnMgYnkgZHJhZ2dpbmcgY29sdW1ucyBmcm9tIHRoZSBDb2x1bW5zIFRvb2wgUGFuZWwgdG8gdGhlIGdyaWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0RyYWdGcm9tQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBjb2x1bW4gbW92aW5nLCBpLmUuIHRvIG1ha2UgdGhlIGNvbHVtbnMgZml4ZWQgcG9zaXRpb24uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmFibGVDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZSBgYWctY29sdW1uLW1vdmluZ2AgY2xhc3MgaXMgbm90IGFkZGVkIHRvIHRoZSBncmlkIHdoaWxlIGNvbHVtbnMgYXJlIG1vdmluZy4gSW4gdGhlIGRlZmF1bHQgdGhlbWVzLCB0aGlzIHJlc3VsdHMgaW4gbm8gYW5pbWF0aW9uIHdoZW4gbW92aW5nIGNvbHVtbnMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgd2hlbiB5b3UgZHJhZyBhIGNvbHVtbiBvdXQgb2YgdGhlIGdyaWQgKGUuZy4gdG8gdGhlIGdyb3VwIHpvbmUpIHRoZSBjb2x1bW4gaXMgbm90IGhpZGRlbi5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRHJhZ0xlYXZlSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHdoZW4geW91IGRyYWcgYSBjb2x1bW4gaW50byBhIHJvdyBncm91cCBwYW5lbCB0aGUgY29sdW1uIGlzIG5vdCBoaWRkZW4uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0dyb3VwSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdzaGlmdCdgIHRvIGhhdmUgc2hpZnQtcmVzaXplIGFzIHRoZSBkZWZhdWx0IHJlc2l6ZSBvcGVyYXRpb24gKHNhbWUgYXMgdXNlciBob2xkaW5nIGRvd24gYFNoaWZ0YCB3aGlsZSByZXNpemluZykuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2xSZXNpemVEZWZhdWx0OiAnc2hpZnQnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTdXBwcmVzc2VzIGF1dG8tc2l6aW5nIGNvbHVtbnMgZm9yIGNvbHVtbnMuIEluIG90aGVyIHdvcmRzLCBkb3VibGUgY2xpY2tpbmcgYSBjb2x1bW4ncyBoZWFkZXIncyBlZGdlIHdpbGwgbm90IGF1dG8tc2l6ZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIE51bWJlciBvZiBwaXhlbHMgdG8gYWRkIHRvIGEgY29sdW1uIHdpZHRoIGFmdGVyIHRoZSBbYXV0by1zaXppbmddKC9jb2x1bW4tc2l6aW5nLyNhdXRvLXNpemUtY29sdW1ucy10by1maXQtY2VsbC1jb250ZW50cykgY2FsY3VsYXRpb24uXG4gICAgICAgICAqIFNldCB0aGlzIGlmIHlvdSB3YW50IHRvIGFkZCBleHRyYSByb29tIHRvIGFjY29tbW9kYXRlIChmb3IgZXhhbXBsZSkgc29ydCBpY29ucywgb3Igc29tZSBvdGhlciBkeW5hbWljIG5hdHVyZSBvZiB0aGUgaGVhZGVyLlxuICAgICAgICAgKiBAZGVmYXVsdCAyMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVQYWRkaW5nOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBza2lwIHRoZSBgaGVhZGVyTmFtZWAgd2hlbiBgYXV0b1NpemVgIGlzIGNhbGxlZCBieSBkZWZhdWx0LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2tpcEhlYWRlck9uQXV0b1NpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEF1dG8tc2l6ZSB0aGUgY29sdW1ucyB3aGVuIHRoZSBncmlkIGlzIGxvYWRlZC4gQ2FuIHNpemUgdG8gZml0IHRoZSBncmlkIHdpZHRoLCBmaXQgYSBwcm92aWRlZCB3aWR0aCwgb3IgZml0IHRoZSBjZWxsIGNvbnRlbnRzLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVTdHJhdGVneTogU2l6ZUNvbHVtbnNUb0ZpdEdyaWRTdHJhdGVneSB8IFNpemVDb2x1bW5zVG9GaXRQcm92aWRlZFdpZHRoU3RyYXRlZ3kgfCBTaXplQ29sdW1uc1RvQ29udGVudFN0cmF0ZWd5IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiBjb21wb25lbnQgbmFtZXMgdG8gY29tcG9uZW50cy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IGFueTsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnZnVsbFJvdydgIHRvIGVuYWJsZSBGdWxsIFJvdyBFZGl0aW5nLiBPdGhlcndpc2UgbGVhdmUgYmxhbmsgdG8gZWRpdCBvbmUgY2VsbCBhdCBhIHRpbWUuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlZGl0VHlwZTogJ2Z1bGxSb3cnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBTaW5nbGUgQ2xpY2sgRWRpdGluZyBmb3IgY2VsbHMsIHRvIHN0YXJ0IGVkaXRpbmcgd2l0aCBhIHNpbmdsZSBjbGljay5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IG5laXRoZXIgc2luZ2xlIG5vciBkb3VibGUgY2xpY2sgc3RhcnRzIGVkaXRpbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdG9wIHRoZSBncmlkIHVwZGF0aW5nIGRhdGEgYWZ0ZXIgYEVkaXRgLCBgQ2xpcGJvYXJkYCBhbmQgYEZpbGwgSGFuZGxlYCBvcGVyYXRpb25zLiBXaGVuIHRoaXMgaXMgc2V0LCBpdCBpcyBpbnRlbmRlZCB0aGUgYXBwbGljYXRpb24gd2lsbCB1cGRhdGUgdGhlIGRhdGEsIGVnIGluIGFuIGV4dGVybmFsIGltbXV0YWJsZSBzdG9yZSwgYW5kIHRoZW4gcGFzcyB0aGUgbmV3IGRhdGFzZXQgdG8gdGhlIGdyaWQuIDxiciAvPioqTm90ZToqKiBgcm93Tm9kZS5zZXREYXRhVmFsdWUoKWAgZG9lcyBub3QgdXBkYXRlIHRoZSB2YWx1ZSBvZiB0aGUgY2VsbCB3aGVuIHRoaXMgaXMgYFRydWVgLCBpdCBmaXJlcyBgb25DZWxsRWRpdFJlcXVlc3RgIGluc3RlYWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZWFkT25seUVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBzdG9wIGNlbGwgZWRpdGluZyB3aGVuIGdyaWQgbG9zZXMgZm9jdXMuXG4gICAgICAgICAqIFRoZSBkZWZhdWx0IGlzIHRoYXQgdGhlIGdyaWQgc3RheXMgZWRpdGluZyB1bnRpbCBmb2N1cyBnb2VzIG9udG8gYW5vdGhlciBjZWxsLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYzMCwgbm8gbG9uZ2VyIHVzZWQuIFRvIG5hdmlnYXRlIHdpdGggdGhlIEVudGVyIGtleSB1c2UgYGVudGVyTmF2aWdhdGVzVmVydGljYWxseWAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjMwLCBubyBsb25nZXIgdXNlZC4gVG8gbmF2aWdhdGUgd2l0aCB0aGUgRW50ZXIga2V5IGFmdGVyIGVkaXQgdXNlIGBlbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHlBZnRlckVkaXRgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJNb3Zlc0Rvd25BZnRlckVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgYWxvbmcgd2l0aCBgZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5QWZ0ZXJFZGl0YCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlIGBFbnRlcmAga2V5LlxuICAgICAgICAgKiBpLmUuIHByZXNzaW5nIHRoZSBgRW50ZXJgIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoIGFuZCBgU2hpZnQrRW50ZXJgIHdpbGwgbW92ZSB1cCB0byB0aGUgY2VsbCBhYm92ZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTmF2aWdhdGVzVmVydGljYWxseTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHlgIHRvIGhhdmUgRXhjZWwtc3R5bGUgYmVoYXZpb3VyIGZvciB0aGUgJ0VudGVyJyBrZXkuXG4gICAgICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIEVudGVyIGtleSB3aWxsIG1vdmUgZG93biB0byB0aGUgY2VsbCBiZW5lYXRoIGFuZCBTaGlmdCtFbnRlciBrZXkgd2lsbCBtb3ZlIHVwIHRvIHRoZSBjZWxsIGFib3ZlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5QWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3JjZXMgQ2VsbCBFZGl0aW5nIHRvIHN0YXJ0IHdoZW4gYmFja3NwYWNlIGlzIHByZXNzZWQuIFRoaXMgaXMgb25seSByZWxldmFudCBmb3IgTWFjT1MgdXNlcnMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsRWRpdGluZ09uQmFja3NwYWNlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBVbmRvIC8gUmVkbyB3aGlsZSBlZGl0aW5nLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBzaXplIG9mIHRoZSB1bmRvIC8gcmVkbyBzdGFjay5cbiAgICAgICAgICogQGRlZmF1bHQgMTBcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmdMaW1pdDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gQ1NWLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENzdkV4cG9ydFBhcmFtczogQ3N2RXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBDU1YuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NzdkV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gZXhwb3J0IHRvIEV4Y2VsLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdEV4Y2VsRXhwb3J0UGFyYW1zOiBFeGNlbEV4cG9ydFBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJldmVudHMgdGhlIHVzZXIgZnJvbSBleHBvcnRpbmcgdGhlIGdyaWQgdG8gRXhjZWwuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4Y2VsRXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGxpc3QgKGFycmF5KSBvZiBFeGNlbCBzdHlsZXMgdG8gYmUgdXNlZCB3aGVuIGV4cG9ydGluZyB0byBFeGNlbCB3aXRoIHN0eWxlcy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGV4Y2VsU3R5bGVzOiBFeGNlbFN0eWxlW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJvd3MgYXJlIGZpbHRlcmVkIHVzaW5nIHRoaXMgdGV4dCBhcyBhIFF1aWNrIEZpbHRlci5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIFF1aWNrIEZpbHRlciBjYWNoZSwgdXNlZCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIHdoZW4gdXNpbmcgdGhlIFF1aWNrIEZpbHRlci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYzMCwgaGlkZGVuIGNvbHVtbnMgYXJlIGV4Y2x1ZGVkIGZyb20gdGhlIFF1aWNrIEZpbHRlciBieSBkZWZhdWx0LiBUaGlzIGNhbiBiZSB0b2dnbGVkIHVzaW5nIGBpbmNsdWRlSGlkZGVuQ29sdW1uc0luUXVpY2tGaWx0ZXJgLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUhpZGRlbkNvbHVtbnNGcm9tUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhpZGRlbiBjb2x1bW5zIGFyZSBleGNsdWRlZCBmcm9tIHRoZSBRdWljayBGaWx0ZXIgYnkgZGVmYXVsdC5cbiAgICAgICAgICogVG8gaW5jbHVkZSBoaWRkZW4gY29sdW1ucywgc2V0IHRvIGB0cnVlYC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluY2x1ZGVIaWRkZW5Db2x1bW5zSW5RdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhbmdlcyBob3cgdGhlIFF1aWNrIEZpbHRlciBzcGxpdHMgdGhlIFF1aWNrIEZpbHRlciB0ZXh0IGludG8gc2VhcmNoIHRlcm1zLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcXVpY2tGaWx0ZXJQYXJzZXI6ICgocXVpY2tGaWx0ZXI6IHN0cmluZykgPT4gc3RyaW5nW10pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFuZ2VzIHRoZSBtYXRjaGluZyBsb2dpYyBmb3Igd2hldGhlciBhIHJvdyBwYXNzZXMgdGhlIFF1aWNrIEZpbHRlci5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyTWF0Y2hlcjogKChxdWlja0ZpbHRlclBhcnRzOiBzdHJpbmdbXSwgcm93UXVpY2tGaWx0ZXJBZ2dyZWdhdGVUZXh0OiBzdHJpbmcpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IHRyZWUgZGF0YSBmaWx0ZXJpbmcgYmVoYXZpb3VyIHRvIGluc3RlYWQgZXhjbHVkZSBjaGlsZCBub2RlcyBmcm9tIGZpbHRlciByZXN1bHRzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gdHJ1ZSB0byBlbmFibGUgdGhlIEFkdmFuY2VkIEZpbHRlci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUFkdmFuY2VkRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MzEsIHVzZSBgaW5pdGlhbFN0YXRlLmZpbHRlci5hZHZhbmNlZEZpbHRlck1vZGVsYCBpbnN0ZWFkLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWR2YW5jZWRGaWx0ZXJNb2RlbDogQWR2YW5jZWRGaWx0ZXJNb2RlbCB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhpZGRlbiBjb2x1bW5zIGFyZSBleGNsdWRlZCBmcm9tIHRoZSBBZHZhbmNlZCBGaWx0ZXIgYnkgZGVmYXVsdC5cbiAgICAgICAgICogVG8gaW5jbHVkZSBoaWRkZW4gY29sdW1ucywgc2V0IHRvIGB0cnVlYC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluY2x1ZGVIaWRkZW5Db2x1bW5zSW5BZHZhbmNlZEZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRE9NIGVsZW1lbnQgdG8gdXNlIGFzIHRoZSBwYXJlbnQgZm9yIHRoZSBBZHZhbmNlZCBGaWx0ZXIgdG8gYWxsb3cgaXQgdG8gYXBwZWFyIG91dHNpZGUgb2YgdGhlIGdyaWQuXG4gICAgICAgICAqIFNldCB0byBgbnVsbGAgb3IgYHVuZGVmaW5lZGAgdG8gYXBwZWFyIGluc2lkZSB0aGUgZ3JpZC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFkdmFuY2VkRmlsdGVyUGFyZW50OiBIVE1MRWxlbWVudCB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwYXNzZWQgdG8gdGhlIEFkdmFuY2VkIEZpbHRlciBCdWlsZGVyLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWR2YW5jZWRGaWx0ZXJCdWlsZGVyUGFyYW1zOiBJQWR2YW5jZWRGaWx0ZXJCdWlsZGVyUGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIEVuYWJsZSBDaGFydHMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDaGFydHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGNoYXJ0IHRoZW1lcyB0aGF0IGEgdXNlciBjYW4gY2hvb3NlIGZyb20gaW4gdGhlIGNoYXJ0IHNldHRpbmdzIHBhbmVsLlxuICAgICAgICAgKiBAZGVmYXVsdCBbJ2FnLWRlZmF1bHQnLCAnYWctbWF0ZXJpYWwnLCAnYWctc2hlZXRzJywgJ2FnLXBvbHljaHJvbWEnLCAnYWctdml2aWQnXTtcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgY29udGFpbmluZyBjdXN0b20gY2hhcnQgdGhlbWVzLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3VzdG9tQ2hhcnRUaGVtZXM6IHsgW25hbWU6IHN0cmluZ106IEFnQ2hhcnRUaGVtZSB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFydCB0aGVtZSBvdmVycmlkZXMgYXBwbGllZCB0byBhbGwgdGhlbWVzLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZU92ZXJyaWRlczogQWdDaGFydFRoZW1lT3ZlcnJpZGVzIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MjksIG5vIGxvbmdlciB1c2VkLiBUbyBzdXBwcmVzcyB1c2UgYHN1cHByZXNzQ2hhcnRUb29sUGFuZWxzQnV0dG9uYC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0VG9vbFBhbmVsc0J1dHRvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzaG93IHRoZSAnaGFtYnVyZ2VyJyBtZW51IG9wdGlvbiBmcm9tIHRoZSBDaGFydCBUb29sYmFyIGFuZCBkaXNwbGF5IHRoZSByZW1haW5pbmcgdG9vbGJhciBidXR0b25zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDaGFydFRvb2xQYW5lbHNCdXR0b246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjdXN0b21pc2F0aW9uIG9mIHRoZSBDaGFydCBUb29sIFBhbmVscywgc3VjaCBhcyBjaGFuZ2luZyB0aGUgdG9vbCBwYW5lbHMgdmlzaWJpbGl0eSBhbmQgb3JkZXIsIGFzIHdlbGwgYXMgY2hvb3Npbmcgd2hpY2ggY2hhcnRzIHNob3VsZCBiZSBkaXNwbGF5ZWQgaW4gdGhlIHNldHRpbmdzIHBhbmVsLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUb29sUGFuZWxzRGVmOiBDaGFydFRvb2xQYW5lbHNEZWYgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgeW91ciBvd24gbG9hZGluZyBjZWxsIHJlbmRlcmVyIHRvIHVzZSB3aGVuIGRhdGEgaXMgbG9hZGluZyB2aWEgYSBEYXRhU291cmNlLlxuICAgICAgICAgKiBTZWUgW0xvYWRpbmcgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LWxvYWRpbmctY2VsbC1yZW5kZXJlci8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogUGFyYW1zIHRvIGJlIHBhc3NlZCB0byB0aGUgYGxvYWRpbmdDZWxsUmVuZGVyZXJgIGNvbXBvbmVudC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gc2VsZWN0IHdoaWNoIGxvYWRpbmcgY2VsbCByZW5kZXJlciB0byBiZSB1c2VkIHdoZW4gZGF0YSBpcyBsb2FkaW5nIHZpYSBhIERhdGFTb3VyY2UuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3I6IExvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiBrZXktPnZhbHVlIHBhaXJzIGZvciBsb2NhbGlzaW5nIHRleHQgd2l0aGluIHRoZSBncmlkLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9jYWxlVGV4dDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgTWFzdGVyIERldGFpbC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1hc3RlckRldGFpbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBrZWVwIGRldGFpbCByb3dzIGZvciB3aGVuIHRoZXkgYXJlIGRpc3BsYXllZCBhZ2Fpbi5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXRzIHRoZSBudW1iZXIgb2YgZGV0YWlscyByb3dzIHRvIGtlZXAuXG4gICAgICAgICAqIEBkZWZhdWx0IDEwXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93c0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gYGRldGFpbENlbGxSZW5kZXJlcmAgdG8gdXNlIHdoZW4gYSBtYXN0ZXIgcm93IGlzIGV4cGFuZGVkLlxuICAgICAgICAgKiBTZWUgW0RldGFpbCBDZWxsIFJlbmRlcmVyXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9tYXN0ZXItZGV0YWlsLWN1c3RvbS1kZXRhaWwvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBwYXJhbXMgdG8gYmUgdXNlZCBieSB0aGUgRGV0YWlsIENlbGwgUmVuZGVyZXIuIENhbiBhbHNvIGJlIGEgZnVuY3Rpb24gdGhhdCBwcm92aWRlcyB0aGUgcGFyYW1zIHRvIGVuYWJsZSBkeW5hbWljIGRlZmluaXRpb25zIG9mIHRoZSBwYXJhbXMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IGZpeGVkIGhlaWdodCBpbiBwaXhlbHMgZm9yIGVhY2ggZGV0YWlsIHJvdy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGRldGFpbCBncmlkIGR5bmFtaWNhbGx5IGNoYW5nZSBpdCdzIGhlaWdodCB0byBmaXQgaXQncyByb3dzLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsUm93QXV0b0hlaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZXMgYSBjb250ZXh0IG9iamVjdCB0aGF0IGlzIHByb3ZpZGVkIHRvIGRpZmZlcmVudCBjYWxsYmFja3MgdGhlIGdyaWQgdXNlcy4gVXNlZCBmb3IgcGFzc2luZyBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIHRvIHRoZSBjYWxsYmFja3MgYnkgeW91ciBhcHBsaWNhdGlvbi5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbnRleHQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKipcbiAgICAgICAgICogQSBsaXN0IG9mIGdyaWRzIHRvIHRyZWF0IGFzIEFsaWduZWQgR3JpZHMuXG4gICAgICAgICAqIFByb3ZpZGUgYSBsaXN0IGlmIHRoZSBncmlkcyAvIGFwaXMgYWxyZWFkeSBleGlzdCBvciByZXR1cm4gdmlhIGEgY2FsbGJhY2sgdG8gYWxsb3cgdGhlIGFsaWduZWQgZ3JpZHMgdG8gYmUgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5LlxuICAgICAgICAgKiBJZiBncmlkcyBhcmUgYWxpZ25lZCB0aGVuIHRoZSBjb2x1bW5zIGFuZCBob3Jpem9udGFsIHNjcm9sbGluZyB3aWxsIGJlIGtlcHQgaW4gc3luYy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsaWduZWRHcmlkczogKEFsaWduZWRHcmlkW10gfCAoKCkgPT4gQWxpZ25lZEdyaWRbXSkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFuZ2UgdGhpcyB2YWx1ZSB0byBzZXQgdGhlIHRhYkluZGV4IG9yZGVyIG9mIHRoZSBHcmlkIHdpdGhpbiB5b3VyIGFwcGxpY2F0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCAwXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbnVtYmVyIG9mIHJvd3MgcmVuZGVyZWQgb3V0c2lkZSB0aGUgdmlld2FibGUgYXJlYSB0aGUgZ3JpZCByZW5kZXJzLlxuICAgICAgICAgKiBIYXZpbmcgYSBidWZmZXIgbWVhbnMgdGhlIGdyaWQgd2lsbCBoYXZlIHJvd3MgcmVhZHkgdG8gc2hvdyBhcyB0aGUgdXNlciBzbG93bHkgc2Nyb2xscyB2ZXJ0aWNhbGx5LlxuICAgICAgICAgKiBAZGVmYXVsdCAxMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93QnVmZmVyOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvbiB0aGUgdmFsdWUgY2FjaGUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbmZpZ3VyZSB0aGUgdmFsdWUgY2FjaGUgdG8gbm90IGV4cGlyZSBhZnRlciBkYXRhIHVwZGF0ZXMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IGNlbGwgZXhwcmVzc2lvbnMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsRXhwcmVzc2lvbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYzMC4yIElmIGB0cnVlYCwgcm93IG5vZGVzIGRvIG5vdCBoYXZlIHRoZWlyIHBhcmVudHMgc2V0LlxuICAgICAgICAgKiBUaGUgZ3JpZCBkb2Vzbid0IHVzZSB0aGUgcGFyZW50IHJlZmVyZW5jZSwgYnV0IGl0IGlzIGluY2x1ZGVkIHRvIGhlbHAgdGhlIGNsaWVudCBjb2RlIG5hdmlnYXRlIHRoZSBub2RlIHRyZWUgaWYgaXQgd2FudHMgYnkgcHJvdmlkaW5nIGJpLWRpcmVjdGlvbiBuYXZpZ2F0aW9uIHVwIGFuZCBkb3duIHRoZSB0cmVlLlxuICAgICAgICAgKiBJZiB0aGlzIGlzIGEgcHJvYmxlbSAoZS5nLiBpZiB5b3UgbmVlZCB0byBjb252ZXJ0IHRoZSB0cmVlIHRvIEpTT04sIHdoaWNoIGRvZXMgbm90IGFsbG93IGN5Y2xpYyBkZXBlbmRlbmNpZXMpIHRoZW4gc2V0IHRoaXMgdG8gYHRydWVgLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYXJlbnRzSW5Sb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdG91Y2ggc3VwcG9ydCAoYnV0IGRvZXMgbm90IHJlbW92ZSB0aGUgYnJvd3NlcidzIGVmZm9ydHMgdG8gc2ltdWxhdGUgbW91c2UgZXZlbnRzIG9uIHRvdWNoKS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IHNldCBmb2N1cyBiYWNrIG9uIHRoZSBncmlkIGFmdGVyIGEgcmVmcmVzaC4gVGhpcyBjYW4gYXZvaWQgaXNzdWVzIHdoZXJlIHlvdSB3YW50IHRvIGtlZXAgdGhlIGZvY3VzIG9uIGFub3RoZXIgcGFydCBvZiB0aGUgYnJvd3Nlci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRm9jdXNBZnRlclJlZnJlc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSBhc3luY2hyb25vdXMgbmF0dXJlIG9mIHRoZSBldmVudHMgaW50cm9kdWNlZCBpbiB2MTAsIGFuZCBtYWtlcyB0aGVtIHN5bmNocm9ub3VzLiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGZvciB0aGUgcHVycG9zZSBvZiBzdXBwb3J0aW5nIGxlZ2FjeSBjb2RlIHdoaWNoIGhhcyBhIGRlcGVuZGVuY3kgb24gc3luY2hyb25vdXMgZXZlbnRzIGZyb20gZWFybGllciB2ZXJzaW9ucyAodjkgb3IgZWFybGllcikgb2YgQUcgR3JpZC4gICAgICoqSXQgaXMgc3Ryb25nbHkgcmVjb21tZW5kZWQgdGhhdCB5b3UgZG8gbm90IGNoYW5nZSB0aGlzIHByb3BlcnR5IHVubGVzcyB5b3UgaGF2ZSBsZWdhY3kgaXNzdWVzLioqXG4gICAgICAgICAqIEBkZXByZWNhdGVkIHYzMSBFdmVudHMgc2hvdWxkIGJlIGhhbmRsZWQgYXN5bmNocm9ub3VzbHkuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FzeW5jRXZlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZ3JpZCB3aWxsIGNoZWNrIGZvciBgUmVzaXplT2JzZXJ2ZXJgIGFuZCB1c2UgaXQgaWYgaXQgZXhpc3RzIGluIHRoZSBicm93c2VyLCBvdGhlcndpc2UgaXQgd2lsbCB1c2UgdGhlIGdyaWQncyBhbHRlcm5hdGl2ZSBpbXBsZW1lbnRhdGlvbi4gU29tZSB1c2VycyByZXBvcnRlZCBpc3N1ZXMgd2l0aCBDaHJvbWUncyBgUmVzaXplT2JzZXJ2ZXJgLiBVc2UgdGhpcyBwcm9wZXJ0eSB0byBhbHdheXMgdXNlIHRoZSBncmlkJ3MgYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb24gc2hvdWxkIHN1Y2ggcHJvYmxlbXMgZXhpc3QuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgc2hvd2luZyBhIHdhcm5pbmcgbWVzc2FnZSBpbiB0aGUgY29uc29sZSBpZiB1c2luZyBhIGBncmlkT3B0aW9uc2Agb3IgYGNvbERlZmAgcHJvcGVydHkgdGhhdCBkb2Vzbid0IGV4aXN0LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NoYW5nZURldGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIGVuYWJsZSBkZWJ1ZyBpbmZvcm1hdGlvbiBmcm9tIHRoZSBncmlkIGFuZCByZWxhdGVkIGNvbXBvbmVudHMuIFdpbGwgcmVzdWx0IGluIGFkZGl0aW9uYWwgbG9nZ2luZyBiZWluZyBvdXRwdXQsIGJ1dCB2ZXJ5IHVzZWZ1bCB3aGVuIGludmVzdGlnYXRpbmcgcHJvYmxlbXMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJ1ZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIHRlbXBsYXRlIGZvciAnbG9hZGluZycgb3ZlcmxheS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlMb2FkaW5nVGVtcGxhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAgICAgKiBTZWUgW0xvYWRpbmcgT3ZlcmxheSBDb21wb25lbnRdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1vdmVybGF5LyNzaW1wbGUtbG9hZGluZy1vdmVybGF5LWNvbXBvbmVudCkgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlICdsb2FkaW5nJyBvdmVybGF5LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIHRlbXBsYXRlIGZvciAnbm8gcm93cycgb3ZlcmxheS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlOb1Jvd3NUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIG5vIHJvd3Mgb3ZlcmxheSBjb21wb25lbnQuXG4gICAgICAgICAqIFNlZSBbTm8gUm93cyBPdmVybGF5IENvbXBvbmVudF0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LW92ZXJsYXkvI3NpbXBsZS1uby1yb3dzLW92ZXJsYXktY29tcG9uZW50KSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgbm8gcm93cyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlICdubyByb3dzJyBvdmVybGF5LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOb1Jvd3NPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgd2hldGhlciBwYWdpbmF0aW9uIGlzIGVuYWJsZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByb3dzIHRvIGxvYWQgcGVyIHBhZ2UuIElmIGBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplYCBpcyBzcGVjaWZpZWQsIHRoaXMgcHJvcGVydHkgaXMgaWdub3JlZC5cbiAgICAgICAgICogQGRlZmF1bHQgMTAwXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uUGFnZVNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGV0ZXJtaW5lcyBpZiB0aGUgcGFnZSBzaXplIHNlbGVjdG9yIGlzIHNob3duIGluIHRoZSBwYWdpbmF0aW9uIHBhbmVsIG9yIG5vdC5cbiAgICAgICAgICogU2V0IHRvIGFuIGFycmF5IG9mIHZhbHVlcyB0byBzaG93IHRoZSBwYWdlIHNpemUgc2VsZWN0b3Igd2l0aCBjdXN0b20gbGlzdCBvZiBwb3NzaWJsZSBwYWdlIHNpemVzLlxuICAgICAgICAgKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlIHBhZ2Ugc2l6ZSBzZWxlY3RvciB3aXRoIHRoZSBkZWZhdWx0IHBhZ2Ugc2l6ZXMgYFsyMCwgNTAsIDEwMF1gLlxuICAgICAgICAgKiBTZXQgdG8gYGZhbHNlYCB0byBoaWRlIHRoZSBwYWdlIHNpemUgc2VsZWN0b3IuXG4gICAgICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZVNlbGVjdG9yOiBudW1iZXJbXSB8IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgbnVtYmVyIG9mIHJvd3MgdG8gbG9hZCBwZXIgcGFnZSBpcyBhdXRvbWF0aWNhbGx5IGFkanVzdGVkIGJ5IHRoZSBncmlkIHNvIGVhY2ggcGFnZSBzaG93cyBlbm91Z2ggcm93cyB0byBqdXN0IGZpbGwgdGhlIGFyZWEgZGVzaWduYXRlZCBmb3IgdGhlIGdyaWQuIElmIGBmYWxzZWAsIGBwYWdpbmF0aW9uUGFnZVNpemVgIGlzIHVzZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgcGFnZXMgc3BsaXQgY2hpbGRyZW4gb2YgZ3JvdXBzIHdoZW4gdXNpbmcgUm93IEdyb3VwaW5nIG9yIGRldGFpbCByb3dzIHdpdGggTWFzdGVyIERldGFpbC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRlQ2hpbGRSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZSBkZWZhdWx0IGdyaWQgY29udHJvbHMgZm9yIG5hdmlnYXRpb24gYXJlIGhpZGRlbi5cbiAgICAgICAgICogVGhpcyBpcyB1c2VmdWwgaWYgYHBhZ2luYXRpb249dHJ1ZWAgYW5kIHlvdSB3YW50IHRvIHByb3ZpZGUgeW91ciBvd24gcGFnaW5hdGlvbiBjb250cm9scy5cbiAgICAgICAgICogT3RoZXJ3aXNlLCB3aGVuIGBwYWdpbmF0aW9uPXRydWVgIHRoZSBncmlkIGF1dG9tYXRpY2FsbHkgc2hvd3MgdGhlIG5lY2Vzc2FyeSBjb250cm9scyBhdCB0aGUgYm90dG9tIHNvIHRoYXQgdGhlIHVzZXIgY2FuIG5hdmlnYXRlIHRocm91Z2ggdGhlIGRpZmZlcmVudCBwYWdlcy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFnaW5hdGlvblBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBwaXZvdCBtb2RlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RNb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdwaXZvdCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gcGl2b3QpIGF0IHRoZSB0b3AuIE5vdGUgdGhhdCB0aGUgcGl2b3QgcGFuZWwgd2lsbCBuZXZlciBzaG93IGlmIGBwaXZvdE1vZGVgIGlzIG9mZi5cbiAgICAgICAgICogQGRlZmF1bHQgJ25ldmVyJ1xuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RQYW5lbFNob3c6ICdhbHdheXMnIHwgJ29ubHlXaGVuUGl2b3RpbmcnIHwgJ25ldmVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgcGl2b3RpbmcsIHNldCB0byB0aGUgbnVtYmVyIG9mIGNvbHVtbiBncm91cCBsZXZlbHMgdG8gZXhwYW5kIGJ5IGRlZmF1bHQsIGUuZy4gYDBgIGZvciBub25lLCBgMWAgZm9yIGZpcnN0IGxldmVsIG9ubHksIGV0Yy4gU2V0IHRvIGAtMWAgdG8gZXhwYW5kIGV2ZXJ5dGhpbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IDBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90RGVmYXVsdEV4cGFuZGVkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gc2V0IGFuZCB0aGUgZ3JpZCBpcyBpbiBwaXZvdCBtb2RlLCBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgdG90YWxzIHdpbGwgYXBwZWFyIHdpdGhpbiB0aGUgUGl2b3QgQ29sdW1uIEdyb3VwcywgaW4gdGhlIHBvc2l0aW9uIHNwZWNpZmllZC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Q29sdW1uR3JvdXBUb3RhbHM6ICdiZWZvcmUnIHwgJ2FmdGVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBzZXQgYW5kIHRoZSBncmlkIGlzIGluIHBpdm90IG1vZGUsIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCB0b3RhbHMgd2lsbCBhcHBlYXIgZm9yIGVhY2ggdmFsdWUgY29sdW1uIGluIHRoZSBwb3NpdGlvbiBzcGVjaWZpZWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFJvd1RvdGFsczogJ2JlZm9yZScgfCAnYWZ0ZXInIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IHN3YXAgaW4gdGhlIGdyb3VwaW5nIGNvbHVtbiB3aGVuIHBpdm90aW5nLiBVc2VmdWwgaWYgcGl2b3RpbmcgdXNpbmcgU2VydmVyIFNpZGUgUm93IE1vZGVsIG9yIFZpZXdwb3J0IFJvdyBNb2RlbCBhbmQgeW91IHdhbnQgZnVsbCBjb250cm9sIG9mIGFsbCBjb2x1bW5zIGluY2x1ZGluZyB0aGUgZ3JvdXAgY29sdW1uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgcGl2b3QgY29sdW1uIGdyb3VwcyB3aWxsIGFwcGVhciAnZml4ZWQnLCB3aXRob3V0IHRoZSBhYmlsaXR5IHRvIGV4cGFuZCBhbmQgY29sbGFwc2UgdGhlIGNvbHVtbiBncm91cHMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGVuIHJvdyBncm91cCwgcGl2b3QgYW5kIHZhbHVlIGFnZ3JlZ2F0aW9uIHdpbGwgYmUgcmVhZC1vbmx5IGZyb20gdGhlIEdVSS4gVGhlIGdyaWQgd2lsbCBkaXNwbGF5IHdoYXQgdmFsdWVzIGFyZSB1c2VkIGZvciBlYWNoLCBidXQgd2lsbCBub3QgYWxsb3cgdGhlIHVzZXIgdG8gY2hhbmdlIHRoZSBzZWxlY3Rpb24uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNSZWFkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2YgJ2Z1bmN0aW9uIG5hbWUnIHRvICdmdW5jdGlvbicgZm9yIGN1c3RvbSBhZ2dyZWdhdGlvbiBmdW5jdGlvbnMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jczogeyBba2V5OiBzdHJpbmddOiBJQWdnRnVuYzxURGF0YT47IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBjb2x1bW4gaGVhZGVycyB3b24ndCBpbmNsdWRlIHRoZSBgYWdnRnVuY2AgbmFtZSwgZS5nLiBgJ3N1bShCYW5rIEJhbGFuY2UpYCcgd2lsbCBqdXN0IGJlIGAnQmFuayBCYWxhbmNlJ2AuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyBhZ2dyZWdhdGlvbnMsIHRoZSBncmlkIHdpbGwgYWx3YXlzIGNhbGN1bGF0ZSB0aGUgcm9vdCBsZXZlbCBhZ2dyZWdhdGlvbiB2YWx1ZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c0FnZ3JlZ2F0ZUF0Um9vdExldmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MzAgLSBtYWRlIGRlZmF1bHQgYW5kIHRvZ2dsZWQgdmlhIGFsd2F5c0FnZ3JlZ2F0ZUF0Um9vdExldmVsXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0F0Um9vdExldmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGNoYW5nZSBkZXRlY3Rpb24sIG9ubHkgdGhlIHVwZGF0ZWQgY29sdW1uIHdpbGwgYmUgcmUtYWdncmVnYXRlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFnZ3JlZ2F0ZU9ubHlDaGFuZ2VkQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IGFnZ3JlZ2F0aW9ucyBhcmUgbm90IGltcGFjdGVkIGJ5IGZpbHRlcmluZy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG9taXQgdGhlIHZhbHVlIENvbHVtbiBoZWFkZXIgd2hlbiB0aGVyZSBpcyBvbmx5IGEgc2luZ2xlIHZhbHVlIGNvbHVtbi5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlbW92ZVBpdm90SGVhZGVyUm93V2hlblNpbmdsZVZhbHVlQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYGZhbHNlYCB0byBkaXNhYmxlIFJvdyBBbmltYXRpb24gd2hpY2ggaXMgZW5hYmxlZCBieSBkZWZhdWx0LlxuICAgICAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmltYXRlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIGZsYXNoIGFmdGVyIGRhdGEgY2hhbmdlcy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgLCB0aGlzIGNvbmZpZ3VyYXRpb24gd2lsbCBzZXQgdGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyBhIGNlbGwgc2hvdWxkIHJlbWFpbiBpbiBpdHMgXCJmbGFzaGVkXCIgc3RhdGUuXG4gICAgICAgICAqIEBkZWZhdWx0IDUwMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgLCB0aGlzIGNvbmZpZ3VyYXRpb24gd2lsbCBzZXQgdGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyB0aGUgXCJmbGFzaGVkXCIgc3RhdGUgYW5pbWF0aW9uIHRha2VzIHRvIGZhZGUgYXdheSBhZnRlciB0aGUgdGltZXIgc2V0IGJ5IGBjZWxsRmxhc2hEZWxheWAgaGFzIGNvbXBsZXRlZC5cbiAgICAgICAgICogQGRlZmF1bHQgMTAwMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZhZGVEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgY2VsbHMgZmxhc2ggYWZ0ZXIgZGF0YSBjaGFuZ2VzIGV2ZW4gd2hlbiB0aGUgY2hhbmdlIGlzIGR1ZSB0byBmaWx0ZXJpbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd1Nob3dDaGFuZ2VBZnRlckZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3dpdGNoIGJldHdlZW4gbGF5b3V0IG9wdGlvbnM6IGBub3JtYWxgLCBgYXV0b0hlaWdodGAsIGBwcmludGAuXG4gICAgICAgICAqIEBkZWZhdWx0ICdub3JtYWwnXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb21MYXlvdXQ6IERvbUxheW91dFR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgb3JkZXIgb2Ygcm93cyBhbmQgY29sdW1ucyBpbiB0aGUgRE9NIGFyZSBjb25zaXN0ZW50IHdpdGggd2hhdCBpcyBvbiBzY3JlZW4uXG4gICAgICAgICAqIERpc2FibGVzIHJvdyBhbmltYXRpb25zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5zdXJlRG9tT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gb3BlcmF0ZSB0aGUgZ3JpZCBpbiBSVEwgKFJpZ2h0IHRvIExlZnQpIG1vZGUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSdGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgZ3JpZCBkb2Vzbid0IHZpcnR1YWxpc2UgdGhlIGNvbHVtbnMuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSAxMDAgY29sdW1ucywgYnV0IG9ubHkgMTAgdmlzaWJsZSBkdWUgdG8gc2Nyb2xsaW5nLCBhbGwgMTAwIHdpbGwgYWx3YXlzIGJlIHJlbmRlcmVkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCB0aGUgZ3JpZCBoYXMgYSBsaW1pdCBvZiByZW5kZXJpbmcgYSBtYXhpbXVtIG9mIDUwMCByb3dzIGF0IG9uY2UgKHJlbWVtYmVyIHRoZSBncmlkIG9ubHkgcmVuZGVycyByb3dzIHlvdSBjYW4gc2VlLCBzbyB1bmxlc3MgeW91ciBkaXNwbGF5IHNob3dzIG1vcmUgdGhhbiA1MDAgcm93cyB3aXRob3V0IHZlcnRpY2FsbHkgc2Nyb2xsaW5nIHRoaXMgd2lsbCBuZXZlciBiZSBhbiBpc3N1ZSkuXG4gICAgICAgICAqIDxiciAvPioqVGhpcyBpcyBvbmx5IHJlbGV2YW50IGlmIHlvdSBhcmUgbWFudWFsbHkgc2V0dGluZyBgcm93QnVmZmVyYCB0byBhIGhpZ2ggdmFsdWUgKHJlbmRlcmluZyBtb3JlIHJvd3MgdGhhbiBjYW4gYmUgc2VlbiksIG9yIGBzdXBwcmVzc1Jvd1ZpcnR1YWxpc2F0aW9uYCBpcyB0cnVlLCBvciBpZiB5b3VyIGdyaWQgaGVpZ2h0IGlzIGFibGUgdG8gZGlzcGxheSBtb3JlIHRoYW4gNTAwIHJvd3MgYXQgb25jZS4qKlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIGdyaWQgZG9lc24ndCB2aXJ0dWFsaXNlIHRoZSByb3dzLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgMTAwIHJvd3MsIGJ1dCBvbmx5IDEwIHZpc2libGUgZHVlIHRvIHNjcm9sbGluZywgYWxsIDEwMCB3aWxsIGFsd2F5cyBiZSByZW5kZXJlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hbmFnZWQgUm93IERyYWdnaW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgcm93IGRyYWdnaW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEcmFnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIG1vdmluZyByb3dzIHdoaWxlIGRyYWdnaW5nIHRoZSBgcm93RHJhZ2Agd2FmZmxlLiBUaGlzIG9wdGlvbiBoaWdobGlnaHRzIHRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgcm93IHdpbGwgYmUgcGxhY2VkIGFuZCBpdCB3aWxsIG9ubHkgbW92ZSB0aGUgcm93IG9uIG1vdXNlIHVwLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBjbGlja2luZyBhbmQgZHJhZ2dpbmcgYW55d2hlcmUgb24gdGhlIHJvdyB3aXRob3V0IHRoZSBuZWVkIGZvciBhIGRyYWcgaGFuZGxlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgZHJhZ2dpbmcgbXVsdGlwbGUgcm93cyBhdCB0aGUgc2FtZSB0aW1lLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ011bHRpUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIHJldHVybiBhIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGByb3dEcmFnQ29tcGAgd2hpbGUgZHJhZ2dpbmcgYSByb3cuXG4gICAgICAgICAqIElmIHRoaXMgY2FsbGJhY2sgaXMgbm90IHNldCwgdGhlIGN1cnJlbnQgY2VsbCB2YWx1ZSB3aWxsIGJlIHVzZWQuXG4gICAgICAgICAqIElmIHRoZSBgcm93RHJhZ1RleHRgIGNhbGxiYWNrIGlzIHNldCBpbiB0aGUgQ29sRGVmIGl0IHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhpcywgZXhjZXB0IHdoZW5cbiAgICAgICAgICogYHJvd0RyYWdFbnRpcmVSb3c9dHJ1ZWAuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnVGV4dDogKChwYXJhbXM6IElSb3dEcmFnSXRlbSwgZHJhZ0l0ZW1Db3VudDogbnVtYmVyKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIGNlbGwgcmVuZGVyZXIgY29tcG9uZW50IHRvIHVzZSBmb3IgZnVsbCB3aWR0aCByb3dzLlxuICAgICAgICAgKiBTZWUgW0Z1bGwgV2lkdGggUm93c10oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvZnVsbC13aWR0aC1yb3dzLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgYGZ1bGxXaWR0aENlbGxSZW5kZXJlcmAgY29tcG9uZW50LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgRnVsbCBXaWR0aCBSb3dzIGVtYmVkZGVkIGluIGdyaWQncyBtYWluIGNvbnRhaW5lciBzbyB0aGV5IGNhbiBiZSBzY3JvbGxlZCBob3Jpem9udGFsbHkuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYzMVxuICAgICAgICAgKiBXaGVuIGVuYWJsZWQsIHRoZSBncmlkIHdpbGwgY2FzdCBncm91cCB2YWx1ZXMgdG8gc3RyaW5nIHR5cGUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0dyb3VwTWFpbnRhaW5WYWx1ZVR5cGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyBob3cgdGhlIHJlc3VsdHMgb2Ygcm93IGdyb3VwaW5nIHNob3VsZCBiZSBkaXNwbGF5ZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqICBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICAgICAqXG4gICAgICAgICAqIC0gYCdzaW5nbGVDb2x1bW4nYDogc2luZ2xlIGdyb3VwIGNvbHVtbiBhdXRvbWF0aWNhbGx5IGFkZGVkIGJ5IHRoZSBncmlkLlxuICAgICAgICAgKiAtIGAnbXVsdGlwbGVDb2x1bW5zJ2A6IGEgZ3JvdXAgY29sdW1uIHBlciByb3cgZ3JvdXAgaXMgYWRkZWQgYXV0b21hdGljYWxseS5cbiAgICAgICAgICogLSBgJ2dyb3VwUm93cydgOiBncm91cCByb3dzIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIGluc3RlYWQgb2YgZ3JvdXAgY29sdW1ucy5cbiAgICAgICAgICogLSBgJ2N1c3RvbSdgOiBpbmZvcm1zIHRoZSBncmlkIHRoYXQgZ3JvdXAgY29sdW1ucyB3aWxsIGJlIHByb3ZpZGVkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEaXNwbGF5VHlwZTogUm93R3JvdXBpbmdEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZ3JvdXBpbmcsIHNldCB0byB0aGUgbnVtYmVyIG9mIGxldmVscyB0byBleHBhbmQgYnkgZGVmYXVsdCwgZS5nLiBgMGAgZm9yIG5vbmUsIGAxYCBmb3IgZmlyc3QgbGV2ZWwgb25seSwgZXRjLiBTZXQgdG8gYC0xYCB0byBleHBhbmQgZXZlcnl0aGluZy5cbiAgICAgICAgICogQGRlZmF1bHQgMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEZWZhdWx0RXhwYW5kZWQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNwZWNpZnlpbmcgdGhlIGdyb3VwICdhdXRvIGNvbHVtbicgaWYgeW91IGFyZSBub3QgaGFwcHkgd2l0aCB0aGUgZGVmYXVsdC4gSWYgZ3JvdXBpbmcsIHRoaXMgY29sdW1uIGRlZmluaXRpb24gaXMgaW5jbHVkZWQgYXMgdGhlIGZpcnN0IGNvbHVtbiBpbiB0aGUgZ3JpZC4gSWYgbm90IGdyb3VwaW5nLCB0aGlzIGNvbHVtbiBpcyBub3QgaW5jbHVkZWQuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvR3JvdXBDb2x1bW5EZWY6IENvbERlZjxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBwcmVzZXJ2ZXMgdGhlIGN1cnJlbnQgZ3JvdXAgb3JkZXIgd2hlbiBzb3J0aW5nIG9uIG5vbi1ncm91cCBjb2x1bW5zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgaWYgeW91IHNlbGVjdCBhIGdyb3VwLCB0aGUgY2hpbGRyZW4gb2YgdGhlIGdyb3VwIHdpbGwgYWxzbyBiZSBzZWxlY3RlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgbG9ja3MgdGhlIGdyb3VwIHNldHRpbmdzIG9mIGEgbnVtYmVyIG9mIGNvbHVtbnMsIGUuZy4gYDBgIGZvciBubyBncm91cCBsb2NraW5nLiBgMWAgZm9yIGZpcnN0IGdyb3VwIGNvbHVtbiBsb2NrZWQsIGAtMWAgZm9yIGFsbCBncm91cCBjb2x1bW5zIGxvY2tlZC5cbiAgICAgICAgICogQGRlZmF1bHQgMFxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBMb2NrR3JvdXBDb2x1bW5zOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBkZXRlcm1pbmUgd2hldGhlciBmaWx0ZXJzIHNob3VsZCBiZSBhcHBsaWVkIG9uIGFnZ3JlZ2F0ZWQgZ3JvdXAgdmFsdWVzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBBZ2dGaWx0ZXJpbmc6IGJvb2xlYW4gfCBJc1Jvd0ZpbHRlcmFibGU8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgdGhpcyBjb250cm9scyB3aGV0aGVyIHRvIHNob3cgYSBncm91cCBmb290ZXIgd2hlbiB0aGUgZ3JvdXAgaXMgZXhwYW5kZWQuXG4gICAgICAgICAqIElmIGB0cnVlYCwgdGhlbiBieSBkZWZhdWx0LCB0aGUgZm9vdGVyIHdpbGwgY29udGFpbiBhZ2dyZWdhdGUgZGF0YSAoaWYgYW55KSB3aGVuIHNob3duIGFuZCB0aGUgaGVhZGVyIHdpbGwgYmUgYmxhbmsuXG4gICAgICAgICAqIFdoZW4gY2xvc2VkLCB0aGUgaGVhZGVyIHdpbGwgY29udGFpbiB0aGUgYWdncmVnYXRlIGRhdGEgcmVnYXJkbGVzcyBvZiB0aGlzIHNldHRpbmcgKGFzIHRoZSBmb290ZXIgaXMgaGlkZGVuIGFueXdheSkuXG4gICAgICAgICAqIFRoaXMgaXMgaGFuZHkgZm9yICd0b3RhbCcgcm93cywgdGhhdCBhcmUgZGlzcGxheWVkIGJlbG93IHRoZSBkYXRhIHdoZW4gdGhlIGdyb3VwIGlzIG9wZW4sIGFuZCBhbG9uZ3NpZGUgdGhlIGdyb3VwIHdoZW4gaXQgaXMgY2xvc2VkLlxuICAgICAgICAgKiBJZiBhIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBpdCBjYW4gdXNlZCB0byBzZWxlY3Qgd2hpY2ggZ3JvdXBzIHdpbGwgaGF2ZSBhIGZvb3RlciBhZGRlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZUZvb3RlcjogYm9vbGVhbiB8IFVzZUdyb3VwRm9vdGVyPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzaG93IGEgJ2dyYW5kIHRvdGFsJyBncm91cCBmb290ZXIgYWNyb3NzIGFsbCBncm91cHMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBhbmQgc2hvd2luZyBmb290ZXIsIGFnZ3JlZ2F0ZSBkYXRhIHdpbGwgYWx3YXlzIGJlIGRpc3BsYXllZCBhdCBib3RoIHRoZSBoZWFkZXIgYW5kIGZvb3RlciBsZXZlbHMuIFRoaXMgc3RvcHMgdGhlIHBvc3NpYmx5IHVuZGVzaXJhYmxlIGJlaGF2aW91ciBvZiB0aGUgaGVhZGVyIGRldGFpbHMgJ2p1bXBpbmcnIHRvIHRoZSBmb290ZXIgb24gZXhwYW5kLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiB1c2luZyBgZ3JvdXBTZWxlY3RzQ2hpbGRyZW5gLCB0aGVuIG9ubHkgdGhlIGNoaWxkcmVuIHRoYXQgcGFzcyB0aGUgY3VycmVudCBmaWx0ZXIgd2lsbCBnZXQgc2VsZWN0ZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2hvd3MgdGhlIG9wZW4gZ3JvdXAgaW4gdGhlIGdyb3VwIGNvbHVtbiBmb3Igbm9uLWdyb3VwIHJvd3MuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93T3BlbmVkR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29sbGFwc2UgZ3JvdXBzIHRoYXQgb25seSBoYXZlIG9uZSBjaGlsZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29sbGFwc2UgbG93ZXN0IGxldmVsIGdyb3VwcyB0aGF0IG9ubHkgaGF2ZSBvbmUgY2hpbGQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZGUgcGFyZW50cyB0aGF0IGFyZSBvcGVuLiBXaGVuIHVzZWQgd2l0aCBtdWx0aXBsZSBjb2x1bW5zIGZvciBzaG93aW5nIGdyb3VwcywgaXQgY2FuIGdpdmUgYSBtb3JlIHBsZWFzaW5nIHVzZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGlkZU9wZW5QYXJlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHByZXZlbnQgdGhlIGdyaWQgZnJvbSBjcmVhdGluZyBhICcoQmxhbmtzKScgZ3JvdXAgZm9yIG5vZGVzIHdoaWNoIGRvIG5vdCBiZWxvbmcgdG8gYSBncm91cCwgYW5kIGRpc3BsYXkgdGhlIHVuYmFsYW5jZWQgbm9kZXMgYWxvbmdzaWRlIGdyb3VwIG5vZGVzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBBbGxvd1VuYmFsYW5jZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdG8gc2hvdyB0aGUgJ3JvdyBncm91cCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gZ3JvdXApIGF0IHRoZSB0b3AuXG4gICAgICAgICAqIEBkZWZhdWx0ICduZXZlcidcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTaG93OiAnYWx3YXlzJyB8ICdvbmx5V2hlbkdyb3VwaW5nJyB8ICduZXZlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIENlbGwgUmVuZGVyZXIgdG8gdXNlIHdoZW4gYGdyb3VwRGlzcGxheVR5cGUgPSAnZ3JvdXBSb3dzJ2AuXG4gICAgICAgICAqIFNlZSBbR3JvdXAgUm93IENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2dyb3VwaW5nLWdyb3VwLXJvd3MvI3Byb3ZpZGluZy1jZWxsLXJlbmRlcmVyKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgYGdyb3VwUm93UmVuZGVyZXJgIGNvbXBvbmVudC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgd2hlbiBhIGNvbHVtbiBpcyB1bi1ncm91cGVkLCBpLmUuIHVzaW5nIHRoZSBSb3cgR3JvdXAgUGFuZWwsIGl0IGlzIG1hZGUgdmlzaWJsZSBpbiB0aGUgZ3JpZC4gVGhpcyBwcm9wZXJ0eSBzdG9wcyB0aGUgY29sdW1uIGJlY29taW5nIHZpc2libGUgYWdhaW4gd2hlbiB1bi1ncm91cGluZy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBHcmlkIHRvIHdvcmsgd2l0aCBUcmVlIERhdGEuIFlvdSBtdXN0IGFsc28gaW1wbGVtZW50IHRoZSBgZ2V0RGF0YVBhdGgoZGF0YSlgIGNhbGxiYWNrLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydCBpbmRpY2F0b3JzIGFuZCBhY3Rpb25zIGZyb20gdGhlIHJvdyBncm91cCBwYW5lbC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTdXBwcmVzc1NvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgcHJldmVudCBHcm91cCBSb3dzIGZyb20gc3RpY2tpbmcgdG8gdGhlIHRvcCBvZiB0aGUgZ3JpZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzR3JvdXBSb3dzU3RpY2t5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEYXRhIHRvIGJlIGRpc3BsYXllZCBhcyBwaW5uZWQgdG9wIHJvd3MgaW4gdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRUb3BSb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIGJvdHRvbSByb3dzIGluIHRoZSBncmlkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkQm90dG9tUm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIHJvdyBtb2RlbCB0eXBlLlxuICAgICAgICAgKiBAZGVmYXVsdCAnY2xpZW50U2lkZSdcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd01vZGVsVHlwZTogUm93TW9kZWxUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhlIGRhdGEgdG8gYmUgZGlzcGxheWVkIGFzIHJvd3MgaW4gdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEYXRhOiBURGF0YVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGV4ZWN1dGluZyBhIGJhdGNoIG9mIGFzeW5jIHRyYW5zYWN0aW9ucy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25XYWl0TWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIFRyYW5zYWN0aW9ucyBjaGFuZ2luZyBzb3J0LCBmaWx0ZXIsIGdyb3VwIG9yIHBpdm90IHN0YXRlIHdoZW4gdHJhbnNhY3Rpb24gb25seSBjb250YWlucyB1cGRhdGVzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb2RlbFVwZGF0ZUFmdGVyVXBkYXRlVHJhbnNhY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIGRhdGFzb3VyY2UgZm9yIGluZmluaXRlIHNjcm9sbGluZy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRhdGFzb3VyY2U6IElEYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBleHRyYSBibGFuayByb3dzIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXIgYXQgdGhlIGVuZCBvZiB0aGUgZGF0YXNldCwgd2hpY2ggc2V0cyB0aGUgdmVydGljYWwgc2Nyb2xsIGFuZCB0aGVuIGFsbG93cyB0aGUgZ3JpZCB0byByZXF1ZXN0IHZpZXdpbmcgbW9yZSByb3dzIG9mIGRhdGEuXG4gICAgICAgICAqIEBkZWZhdWx0IDFcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlT3ZlcmZsb3dTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGV4dHJhIGJsYW5rIHJvd3MgdG8gZGlzcGxheSB0byB0aGUgdXNlciBhdCB0aGUgZW5kIG9mIHRoZSBkYXRhc2V0LCB3aGljaCBzZXRzIHRoZSB2ZXJ0aWNhbCBzY3JvbGwgYW5kIHRoZW4gYWxsb3dzIHRoZSBncmlkIHRvIHJlcXVlc3Qgdmlld2luZyBtb3JlIHJvd3Mgb2YgZGF0YS5cbiAgICAgICAgICogQGRlZmF1bHQgMVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IGhvdyBtYW55IGxvYWRpbmcgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGZvciB0aGUgcm9vdCBsZXZlbCBncm91cC5cbiAgICAgICAgICogQGRlZmF1bHQgMVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUluaXRpYWxSb3dDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIFNlcnZlci1zaWRlIFJvdyBNb2RlbCB3aWxsIHN1cHByZXNzIEluZmluaXRlIFNjcm9sbGluZyBhbmQgbG9hZCBhbGwgdGhlIGRhdGEgYXQgdGhlIGN1cnJlbnQgbGV2ZWwuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NlcnZlclNpZGVJbmZpbml0ZVNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcm93cyBmb3IgZWFjaCBibG9jayBpbiB0aGUgc3RvcmUsIGkuZS4gaG93IG1hbnkgcm93cyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgYXQgYSB0aW1lLlxuICAgICAgICAgKiBAZGVmYXVsdCAxMDBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlQmxvY2tTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGJsb2NrcyB0byBrZWVwIGluIHRoZSBzdG9yZS4gRGVmYXVsdCBpcyBubyBsaW1pdCwgc28gZXZlcnkgcmVxdWVzdGVkIGJsb2NrIGlzIGtlcHQuIFVzZSB0aGlzIGlmIHlvdSBoYXZlIG1lbW9yeSBjb25jZXJucywgYW5kIGJsb2NrcyB0aGF0IHdlcmUgbGVhc3QgcmVjZW50bHkgdmlld2VkIHdpbGwgYmUgcHVyZ2VkIHdoZW4gdGhlIGxpbWl0IGlzIGhpdC4gVGhlIGdyaWQgd2lsbCBhZGRpdGlvbmFsbHkgbWFrZSBzdXJlIGl0IGhhcyBhbGwgdGhlIGJsb2NrcyBuZWVkZWQgdG8gZGlzcGxheSB3aGF0IGlzIGN1cnJlbnRseSB2aXNpYmxlLCBpbiBjYXNlIHRoaXMgcHJvcGVydHkgaXMgc2V0IHRvIGEgbG93IHZhbHVlLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4QmxvY2tzSW5DYWNoZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByZXF1ZXN0cyB0byBoaXQgdGhlIHNlcnZlciB3aXRoIGNvbmN1cnJlbnRseS4gSWYgdGhlIG1heCBpcyByZWFjaGVkLCByZXF1ZXN0cyBhcmUgcXVldWVkLlxuICAgICAgICAgKiBTZXQgdG8gYC0xYCBmb3Igbm8gbWF4aW11bSByZXN0cmljdGlvbiBvbiByZXF1ZXN0cy5cbiAgICAgICAgICogQGRlZmF1bHQgMlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29uY3VycmVudERhdGFzb3VyY2VSZXF1ZXN0czogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgbG9hZGluZyBhIGJsb2NrLiBVc2VmdWwgd2hlbiBzY3JvbGxpbmcgb3ZlciBtYW55IGJsb2NrcywgYXMgaXQgcHJldmVudHMgYmxvY2tzIGxvYWRpbmcgdW50aWwgc2Nyb2xsaW5nIGhhcyBzZXR0bGVkLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYmxvY2tMb2FkRGVib3VuY2VNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBjbG9zaW5nIGdyb3VwIHJvd3Mgd2lsbCByZW1vdmUgY2hpbGRyZW4gb2YgdGhhdCByb3cuIE5leHQgdGltZSB0aGUgcm93IGlzIG9wZW5lZCwgY2hpbGQgcm93cyB3aWxsIGJlIHJlYWQgZnJvbSB0aGUgZGF0YXNvdXJjZSBhZ2Fpbi4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwdXJnZUNsb3NlZFJvd05vZGVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBgc2VydmVyU2lkZURhdGFzb3VyY2VgIGZvciBzZXJ2ZXIgc2lkZSByb3cgbW9kZWwuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRGF0YXNvdXJjZTogSVNlcnZlclNpZGVEYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGFsd2F5cyByZWZyZXNoZXMgdG9wIGxldmVsIGdyb3VwcyByZWdhcmRsZXNzIG9mIHdoaWNoIGNvbHVtbiB3YXMgc29ydGVkLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZyAmIHNvcnRpbmcgaXMgaGFuZGxlZCBvbiB0aGUgc2VydmVyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRBbGxMZXZlbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgb25seSByZWZyZXNoIGdyb3VwcyBkaXJlY3RseSBpbXBhY3RlZCBieSBhIGZpbHRlci4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcgJiBmaWx0ZXJpbmcgaXMgaGFuZGxlZCBvbiB0aGUgc2VydmVyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZU9ubHlSZWZyZXNoRmlsdGVyZWRHcm91cHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYzMCBUaGlzIHByb3BlcnR5IGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBgc2VydmVyU2lkZU9ubHlSZWZyZXNoRmlsdGVyZWRHcm91cHNgIGluc3RlYWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRmlsdGVyQWxsTGV2ZWxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKlxuICAgICAgICAgKiBXaGVuIGVuYWJsZWQsIFNvcnRpbmcgd2lsbCBiZSBkb25lIG9uIHRoZSBzZXJ2ZXIuIE9ubHkgYXBwbGljYWJsZSB3aGVuIGBzdXBwcmVzc1NlcnZlclNpZGVJbmZpbml0ZVNjcm9sbD10cnVlYC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0T25TZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgRmlsdGVyaW5nIHdpbGwgYmUgZG9uZSBvbiB0aGUgc2VydmVyLiBPbmx5IGFwcGxpY2FibGUgd2hlbiBgc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw9dHJ1ZWAuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRmlsdGVyT25TZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFVzZWQgdG8gc3BsaXQgcGl2b3QgZmllbGQgc3RyaW5ncyBmb3IgZ2VuZXJhdGluZyBwaXZvdCByZXN1bHQgY29sdW1ucyB3aGVuIGBwaXZvdFJlc3VsdEZpZWxkc2AgaXMgcHJvdmlkZWQgYXMgcGFydCBvZiBhIGBnZXRSb3dzYCBzdWNjZXNzLlxuICAgICAgICAgKiBAZGVmYXVsdCAnXydcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVQaXZvdFJlc3VsdEZpZWxkU2VwYXJhdG9yOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRvIHVzZSB0aGUgdmlld3BvcnQgcm93IG1vZGVsIHlvdSBuZWVkIHRvIHByb3ZpZGUgdGhlIGdyaWQgd2l0aCBhIGB2aWV3cG9ydERhdGFzb3VyY2VgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnREYXRhc291cmNlOiBJVmlld3BvcnREYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIHZpZXdwb3J0IHJvdyBtb2RlbCwgc2V0cyB0aGUgcGFnZSBzaXplIGZvciB0aGUgdmlld3BvcnQuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsUGFnZVNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyB2aWV3cG9ydCByb3cgbW9kZWwsIHNldHMgdGhlIGJ1ZmZlciBzaXplIGZvciB0aGUgdmlld3BvcnQuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsQnVmZmVyU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSBob3Jpem9udGFsIHNjcm9sbGJhci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSB2ZXJ0aWNhbCBzY3JvbGxiYXIuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93VmVydGljYWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZGVib3VuY2UgdGhlIHZlcnRpY2FsIHNjcm9sbGJhci4gQ2FuIHByb3ZpZGUgc21vb3RoZXIgc2Nyb2xsaW5nIG9uIHNsb3cgbWFjaGluZXMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJvdW5jZVZlcnRpY2FsU2Nyb2xsYmFyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5ldmVyIHNob3cgdGhlIGhvcml6b250YWwgc2Nyb2xsLiBUaGlzIGlzIHVzZWZ1bCBpZiB0aGUgZ3JpZCBpcyBhbGlnbmVkIHdpdGggYW5vdGhlciBncmlkIGFuZCB3aWxsIHNjcm9sbCB3aGVuIHRoZSBvdGhlciBncmlkIHNjcm9sbHMuIChTaG91bGQgbm90IGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCBgYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGxgLilcbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IHNjcm9sbCB0byB0aGUgdG9wIHdoZW4gbmV3IHJvdyBkYXRhIGlzIHByb3ZpZGVkLiBVc2UgdGhpcyBpZiB5b3UgZG9uJ3Qgd2FudCB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgb2Ygc2Nyb2xsaW5nIHRvIHRoZSB0b3AgZXZlcnkgdGltZSB5b3UgbG9hZCBuZXcgZGF0YS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsT25OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgYWxsb3cgbW91c2V3aGVlbCAvIHRvdWNocGFkIHNjcm9sbCB3aGVuIHBvcHVwIGVsZW1lbnRzIGFyZSBwcmVzZW50LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTY3JvbGxXaGVuUG9wdXBzQXJlT3BlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IHVzZSBhbmltYXRpb24gZnJhbWVzIHdoZW4gZHJhd2luZyByb3dzIHdoaWxlIHNjcm9sbGluZy4gVXNlIHRoaXMgaWYgdGhlIGdyaWQgaXMgd29ya2luZyBmYXN0IGVub3VnaCB0aGF0IHlvdSBkb24ndCBuZWVkIGFuaW1hdGlvbiBmcmFtZXMgYW5kIHlvdSBkb24ndCB3YW50IHRoZSBncmlkIHRvIGZsaWNrZXIuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FuaW1hdGlvbkZyYW1lOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIG1pZGRsZSBjbGlja3Mgd2lsbCByZXN1bHQgaW4gYGNsaWNrYCBldmVudHMgZm9yIGNlbGxzIGFuZCByb3dzLiBPdGhlcndpc2UgdGhlIGJyb3dzZXIgd2lsbCB1c2UgbWlkZGxlIGNsaWNrIHRvIHNjcm9sbCB0aGUgZ3JpZC48YnIgLz4qKk5vdGU6KiogTm90IGFsbCBicm93c2VycyBmaXJlIGBjbGlja2AgZXZlbnRzIHdpdGggdGhlIG1pZGRsZSBidXR0b24uIE1vc3Qgd2lsbCBmaXJlIG9ubHkgYG1vdXNlZG93bmAgYW5kIGBtb3VzZXVwYCBldmVudHMsIHdoaWNoIGNhbiBiZSB1c2VkIHRvIGZvY3VzIGEgY2VsbCwgYnV0IHdpbGwgbm90IHdvcmsgdG8gY2FsbCB0aGUgYG9uQ2VsbENsaWNrZWRgIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgbW91c2Ugd2hlZWwgZXZlbnRzIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBicm93c2VyLiBVc2VmdWwgaWYgeW91ciBncmlkIGhhcyBubyB2ZXJ0aWNhbCBzY3JvbGxzIGFuZCB5b3Ugd2FudCB0aGUgbW91c2UgdG8gc2Nyb2xsIHRoZSBicm93c2VyIHBhZ2UuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUZWxsIHRoZSBncmlkIGhvdyB3aWRlIGluIHBpeGVscyB0aGUgc2Nyb2xsYmFyIGlzLCB3aGljaCBpcyB1c2VkIGluIGdyaWQgd2lkdGggY2FsY3VsYXRpb25zLiBTZXQgb25seSBpZiB1c2luZyBub24tc3RhbmRhcmQgYnJvd3Nlci1wcm92aWRlZCBzY3JvbGxiYXJzLCBzbyB0aGUgZ3JpZCBjYW4gdXNlIHRoZSBub24tc3RhbmRhcmQgc2l6ZSBpbiBpdHMgY2FsY3VsYXRpb25zLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2Nyb2xsYmFyV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVHlwZSBvZiBSb3cgU2VsZWN0aW9uOiBgc2luZ2xlYCwgYG11bHRpcGxlYC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1NlbGVjdGlvbjogJ3NpbmdsZScgfCAnbXVsdGlwbGUnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IG11bHRpcGxlIHJvd3MgdG8gYmUgc2VsZWN0ZWQgdXNpbmcgc2luZ2xlIGNsaWNrLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgcm93cyB3aWxsIG5vdCBiZSBkZXNlbGVjdGVkIGlmIHlvdSBob2xkIGRvd24gYEN0cmxgIGFuZCBjbGljayB0aGUgcm93IG9yIHByZXNzIGBTcGFjZWAuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvdyBzZWxlY3Rpb24gd29uJ3QgaGFwcGVuIHdoZW4gcm93cyBhcmUgY2xpY2tlZC4gVXNlIHdoZW4geW91IG9ubHkgd2FudCBjaGVja2JveCBzZWxlY3Rpb24uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIGNlbGxzIHdvbid0IGJlIGZvY3VzYWJsZS4gVGhpcyBtZWFucyBrZXlib2FyZCBuYXZpZ2F0aW9uIHdpbGwgYmUgZGlzYWJsZWQgZm9yIGdyaWQgY2VsbHMsIGJ1dCByZW1haW4gZW5hYmxlZCBpbiBvdGhlciBlbGVtZW50cyBvZiB0aGUgZ3JpZCBzdWNoIGFzIGNvbHVtbiBoZWFkZXJzLCBmbG9hdGluZyBmaWx0ZXJzLCB0b29sIHBhbmVscy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbEZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIG9ubHkgYSBzaW5nbGUgcmFuZ2UgY2FuIGJlIHNlbGVjdGVkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGJlIGFibGUgdG8gc2VsZWN0IHRoZSB0ZXh0IHdpdGhpbiBjZWxscy5cbiAgICAgICAgICpcbiAgICAgICAgICogICAgICoqTm90ZToqKiBXaGVuIHRoaXMgaXMgc2V0IHRvIGB0cnVlYCwgdGhlIGNsaXBib2FyZCBzZXJ2aWNlIGlzIGRpc2FibGVkIGFuZCBvbmx5IHNlbGVjdGVkIHRleHQgaXMgY29waWVkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFJhbmdlIFNlbGVjdGlvbi5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgUmFuZ2UgSGFuZGxlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBGaWxsIEhhbmRsZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUZpbGxIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ3gnYCB0byBmb3JjZSB0aGUgZmlsbCBoYW5kbGUgZGlyZWN0aW9uIHRvIGhvcml6b250YWwsIG9yIHNldCB0byBgJ3knYCB0byBmb3JjZSB0aGUgZmlsbCBoYW5kbGUgZGlyZWN0aW9uIHRvIHZlcnRpY2FsLlxuICAgICAgICAgKiBAZGVmYXVsdCAneHknXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsSGFuZGxlRGlyZWN0aW9uOiAneCcgfCAneScgfCAneHknIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gcHJldmVudCBjZWxsIHZhbHVlcyBmcm9tIGJlaW5nIGNsZWFyZWQgd2hlbiB0aGUgUmFuZ2UgU2VsZWN0aW9uIGlzIHJlZHVjZWQgYnkgdGhlIEZpbGwgSGFuZGxlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXJyYXkgZGVmaW5pbmcgdGhlIG9yZGVyIGluIHdoaWNoIHNvcnRpbmcgb2NjdXJzIChpZiBzb3J0aW5nIGlzIGVuYWJsZWQpLiBWYWx1ZXMgY2FuIGJlIGAnYXNjJ2AsIGAnZGVzYydgIG9yIGBudWxsYC4gRm9yIGV4YW1wbGU6IGBzb3J0aW5nT3JkZXI6IFsnYXNjJywgJ2Rlc2MnXWAuXG4gICAgICAgICAqIEBkZWZhdWx0IFtudWxsLCAnYXNjJywgJ2Rlc2MnXVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc29ydGluZ09yZGVyOiAoU29ydERpcmVjdGlvbilbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzcGVjaWZ5IHRoYXQgdGhlIHNvcnQgc2hvdWxkIHRha2UgYWNjZW50ZWQgY2hhcmFjdGVycyBpbnRvIGFjY291bnQuIElmIHRoaXMgZmVhdHVyZSBpcyB0dXJuZWQgb24gdGhlIHNvcnQgd2lsbCBiZSBzbG93ZXIuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc2hvdyB0aGUgJ25vIHNvcnQnIGljb24uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1blNvcnRJY29uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIG11bHRpLXNvcnQgd2hlbiB0aGUgdXNlciBzaGlmdC1jbGlja3MgYSBjb2x1bW4gaGVhZGVyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIG11bHRpLXNvcnQgd2hlbiB0aGUgdXNlciBjbGlja3MgYSBjb2x1bW4gaGVhZGVyLCByZWdhcmRsZXNzIG9mIGtleSBwcmVzc2VzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzTXVsdGlTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdjdHJsJ2AgdG8gaGF2ZSBtdWx0aSBzb3J0aW5nIHdvcmsgdXNpbmcgdGhlIGBDdHJsYCAob3IgYENvbW1hbmQg4oyYYCBmb3IgTWFjKSBrZXkuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtdWx0aVNvcnRLZXk6ICdjdHJsJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBzb3J0aW5nIG9mIHVuLXNvcnRlZCBkYXRhIHRvIG1hdGNoIG9yaWdpbmFsIHJvdyBkYXRhLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIHRvIHVzZSBpbnNpZGUgdGhlIGdyaWQgaW5zdGVhZCBvZiB0aGUgZ3JpZCdzIGRlZmF1bHQgaWNvbnMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpY29uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB8IHN0cmluZzsgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGVmYXVsdCByb3cgaGVpZ2h0IGluIHBpeGVscy5cbiAgICAgICAgICogQGRlZmF1bHQgMjVcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgc3R5bGUgcHJvcGVydGllcyB0byBhcHBseSB0byBhbGwgcm93cy4gU2V0IHRvIGFuIG9iamVjdCBvZiBrZXkgKHN0eWxlIG5hbWVzKSBhbmQgdmFsdWVzIChzdHlsZSB2YWx1ZXMpLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3R5bGU6IFJvd1N0eWxlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MoZXMpIGZvciBhbGwgcm93cy4gUHJvdmlkZSBlaXRoZXIgYSBzdHJpbmcgKGNsYXNzIG5hbWUpIG9yIGFycmF5IG9mIHN0cmluZ3MgKGFycmF5IG9mIGNsYXNzIG5hbWVzKS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUnVsZXMgd2hpY2ggY2FuIGJlIGFwcGxpZWQgdG8gaW5jbHVkZSBjZXJ0YWluIENTUyBjbGFzc2VzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93Q2xhc3NSdWxlczogUm93Q2xhc3NSdWxlczxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IGhpZ2hsaWdodCByb3dzIGJ5IGFkZGluZyB0aGUgYGFnLXJvdy1ob3ZlcmAgQ1NTIGNsYXNzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVXNlcyBDU1MgYHRvcGAgaW5zdGVhZCBvZiBDU1MgYHRyYW5zZm9ybWAgZm9yIHBvc2l0aW9uaW5nIHJvd3MuIFVzZWZ1bCBpZiB0aGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGlzIGNhdXNpbmcgaXNzdWVzIHN1Y2ggYXMgdXNlZCBpbiByb3cgc3Bhbm5pbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd1RyYW5zZm9ybTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoaWdobGlnaHQgY29sdW1ucyBieSBhZGRpbmcgdGhlIGBhZy1jb2x1bW4taG92ZXJgIENTUyBjbGFzcy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkhvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGBncmlkSWRgIGZvciB0aGlzIGluc3RhbmNlIG9mIHRoZSBncmlkLiBWYWx1ZSB3aWxsIGJlIHNldCBvbiB0aGUgcm9vdCBET00gbm9kZSB1c2luZyB0aGUgYXR0cmlidXRlIGBncmlkLWlkYCBhcyB3ZWxsIGFzIGJlaW5nIGFjY2Vzc2libGUgdmlhIHRoZSBgZ3JpZEFwaS5nZXRHcmlkSWQoKWAgbWV0aG9kLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZElkOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgc29ydHMgb25seSB0aGUgcm93cyBhZGRlZC91cGRhdGVkIGJ5IGEgdHJhbnNhY3Rpb24uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWx0YVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0cmVlRGF0YURpc3BsYXlUeXBlOiBUcmVlRGF0YURpc3BsYXlUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjkuMlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUdyb3VwRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSW5pdGlhbCBzdGF0ZSBmb3IgdGhlIGdyaWQuIE9ubHkgcmVhZCBvbmNlIG9uIGluaXRpYWxpemF0aW9uLiBDYW4gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGBhcGkuZ2V0U3RhdGUoKWAgdG8gc2F2ZSBhbmQgcmVzdG9yZSBncmlkIHN0YXRlLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFN0YXRlOiBHcmlkU3RhdGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgY29udGV4dCBtZW51LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q29udGV4dE1lbnVJdGVtczogR2V0Q29udGV4dE1lbnVJdGVtczxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgbWFpbiAnY29sdW1uIGhlYWRlcicgbWVudS5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldE1haW5NZW51SXRlbXM6IEdldE1haW5NZW51SXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB1c2VyIHRvIHByb2Nlc3MgcG9wdXBzIGFmdGVyIHRoZXkgYXJlIGNyZWF0ZWQuIEFwcGxpY2F0aW9ucyBjYW4gdXNlIHRoaXMgaWYgdGhleSB3YW50IHRvLCBmb3IgZXhhbXBsZSwgcmVwb3NpdGlvbiB0aGUgcG9wdXAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0UHJvY2Vzc1BvcHVwOiAoKHBhcmFtczogUG9zdFByb2Nlc3NQb3B1cFBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdGhlIHVzZXIgdG8gcHJvY2VzcyB0aGUgY29sdW1ucyBiZWluZyByZW1vdmVkIGZyb20gdGhlIHBpbm5lZCBzZWN0aW9uIGJlY2F1c2UgdGhlIHZpZXdwb3J0IGlzIHRvbyBzbWFsbCB0byBhY2NvbW1vZGF0ZSB0aGVtLlxuICAgICAgICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGNvbHVtbnMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBwaW5uZWQgYXJlYXMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzVW5waW5uZWRDb2x1bW5zOiAoKHBhcmFtczogUHJvY2Vzc1VucGlubmVkQ29sdW1uc1BhcmFtczxURGF0YT4pID0+IENvbHVtbltdKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGNlbGxzIGZvciB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBgRGF0ZWAgb2JqZWN0cyB0aGF0IG5lZWQgdG8gaGF2ZSBhIHBhcnRpY3VsYXIgZm9ybWF0IGlmIGltcG9ydGluZyBpbnRvIEV4Y2VsLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBoZWFkZXIgdmFsdWVzIGZvciB0aGUgY2xpcGJvYXJkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0hlYWRlckZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NIZWFkZXJGb3JFeHBvcnRQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgZ3JvdXAgaGVhZGVyIHZhbHVlcyBmb3IgdGhlIGNsaXBib2FyZC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NHcm91cEhlYWRlckZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NHcm91cEhlYWRlckZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBjZWxscyBmcm9tIHRoZSBjbGlwYm9hcmQuIEhhbmR5IGlmIGZvciBleGFtcGxlIHlvdSBoYXZlIG51bWJlciBmaWVsZHMsIGFuZCB3YW50IHRvIGJsb2NrIG5vbi1udW1iZXJzIGZyb20gZ2V0dGluZyBpbnRvIHRoZSBncmlkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGcm9tQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0NlbGxGb3JFeHBvcnRQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIGdldCB0aGUgZGF0YSB0aGF0IHdvdWxkIG90aGVyd2lzZSBnbyB0byB0aGUgY2xpcGJvYXJkLiBUbyBiZSB1c2VkIHdoZW4geW91IHdhbnQgdG8gY29udHJvbCB0aGUgJ2NvcHkgdG8gY2xpcGJvYXJkJyBvcGVyYXRpb24geW91cnNlbGYuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZW5kVG9DbGlwYm9hcmQ6ICgocGFyYW1zOiBTZW5kVG9DbGlwYm9hcmRQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNvbXBsZXRlIGNvbnRyb2wgb2YgdGhlIHBhc3RlIG9wZXJhdGlvbiwgaW5jbHVkaW5nIGNhbmNlbGxpbmcgdGhlIG9wZXJhdGlvbiAoc28gbm90aGluZyBoYXBwZW5zKSBvciByZXBsYWNpbmcgdGhlIGRhdGEgd2l0aCBvdGhlciBkYXRhLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nW11bXSB8IG51bGwpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBHcmlkIGNhbGxzIHRoaXMgbWV0aG9kIHRvIGtub3cgaWYgYW4gZXh0ZXJuYWwgZmlsdGVyIGlzIHByZXNlbnQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0V4dGVybmFsRmlsdGVyUHJlc2VudDogKChwYXJhbXM6IElzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNob3VsZCByZXR1cm4gYHRydWVgIGlmIGV4dGVybmFsIGZpbHRlciBwYXNzZXMsIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG9lc0V4dGVybmFsRmlsdGVyUGFzczogKChub2RlOiBJUm93Tm9kZTxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHRvIGN1c3RvbWlzZSB0aGUgY2hhcnQgdG9vbGJhciBpdGVtcy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENoYXJ0VG9vbGJhckl0ZW1zOiBHZXRDaGFydFRvb2xiYXJJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gZW5hYmxlIGRpc3BsYXlpbmcgdGhlIGNoYXJ0IGluIGFuIGFsdGVybmF0aXZlIGNoYXJ0IGNvbnRhaW5lci5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNyZWF0ZUNoYXJ0Q29udGFpbmVyOiAoKHBhcmFtczogQ2hhcnRSZWZQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBuYXZpZ2F0aW9uIChhcnJvdykga2V5IHdoZW4gYSBoZWFkZXIgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IEhlYWRlciBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBgbnVsbGAgdG8gc3RheSBvbiBjdXJyZW50IGhlYWRlci5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0SGVhZGVyOiAoKHBhcmFtczogTmF2aWdhdGVUb05leHRIZWFkZXJQYXJhbXM8VERhdGE+KSA9PiAoSGVhZGVyUG9zaXRpb24gfCBudWxsKSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgYFRhYmAga2V5IHdoZW4gYSBoZWFkZXIgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IEhlYWRlciBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBgbnVsbGAgdG8gc3RheSBvbiBjdXJyZW50IGhlYWRlci5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dEhlYWRlcjogKChwYXJhbXM6IFRhYlRvTmV4dEhlYWRlclBhcmFtczxURGF0YT4pID0+IChIZWFkZXJQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBuYXZpZ2F0aW9uIChhcnJvdykga2V5IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBDZWxsIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgY2VsbC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0Q2VsbDogKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtczxURGF0YT4pID0+IChDZWxsUG9zaXRpb24gfCBudWxsKSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgYFRhYmAga2V5IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBDZWxsIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIG51bGwgdG8gc3RheSBvbiBjdXJyZW50IGNlbGwuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRDZWxsOiAoKHBhcmFtczogVGFiVG9OZXh0Q2VsbFBhcmFtczxURGF0YT4pID0+IChDZWxsUG9zaXRpb24gfCBudWxsKSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgY2FsbGJhY2sgZm9yIGxvY2FsaXNpbmcgdGV4dCB3aXRoaW4gdGhlIGdyaWQuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRMb2NhbGVUZXh0OiAoKHBhcmFtczogR2V0TG9jYWxlVGV4dFBhcmFtczxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHdoYXQgYGRvY3VtZW50YCBpcyB1c2VkLiBDdXJyZW50bHkgdXNlZCBieSBEcmFnIGFuZCBEcm9wIChtYXkgZXh0ZW5kIHRvIG90aGVyIHBsYWNlcyBpbiB0aGUgZnV0dXJlKS4gVXNlIHRoaXMgd2hlbiB5b3Ugd2FudCB0aGUgZ3JpZCB0byB1c2UgYSBkaWZmZXJlbnQgYGRvY3VtZW50YCB0aGFuIHRoZSBvbmUgYXZhaWxhYmxlIG9uIHRoZSBnbG9iYWwgc2NvcGUuIFRoaXMgY2FuIGhhcHBlbiBpZiBkb2NraW5nIG91dCBjb21wb25lbnRzIChzb21ldGhpbmcgd2hpY2ggRWxlY3Ryb24gc3VwcG9ydHMpXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREb2N1bWVudDogKCgpID0+IERvY3VtZW50KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHVzZXIgdG8gZm9ybWF0IHRoZSBudW1iZXJzIGluIHRoZSBwYWdpbmF0aW9uIHBhbmVsLCBpLmUuICdyb3cgY291bnQnIGFuZCAncGFnZSBudW1iZXInIGxhYmVscy4gVGhpcyBpcyBmb3IgcGFnaW5hdGlvbiBwYW5lbCBvbmx5LCB0byBmb3JtYXQgbnVtYmVycyBpbnNpZGUgdGhlIGdyaWQncyBjZWxscyAoaS5lLiB5b3VyIGRhdGEpLCB0aGVuIHVzZSBgdmFsdWVGb3JtYXR0ZXJgIGluIHRoZSBjb2x1bW4gZGVmaW5pdGlvbnMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyOiAoKHBhcmFtczogUGFnaW5hdGlvbk51bWJlckZvcm1hdHRlclBhcmFtczxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHVzZSB3aGVuIHlvdSBuZWVkIGFjY2VzcyB0byBtb3JlIHRoZW4gdGhlIGN1cnJlbnQgY29sdW1uIGZvciBhZ2dyZWdhdGlvbi5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldEdyb3VwUm93QWdnOiAoKHBhcmFtczogR2V0R3JvdXBSb3dBZ2dQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiAoQ2xpZW50LXNpZGUgUm93IE1vZGVsIG9ubHkpIEFsbG93cyBncm91cHMgdG8gYmUgb3BlbiBieSBkZWZhdWx0LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNHcm91cE9wZW5CeURlZmF1bHQ6ICgocGFyYW1zOiBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgZGVmYXVsdCBzb3J0aW5nIG9mIGdyb3Vwcy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvcjogKChwYXJhbXM6IEluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvclBhcmFtczxURGF0YT4pID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBwaXZvdGluZywgdG8gYWxsb3cgY2hhbmdpbmcgdGhlIHNlY29uZCBjb2x1bW4gZGVmaW5pdGlvbi5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NQaXZvdFJlc3VsdENvbERlZjogKChjb2xEZWY6IENvbERlZjxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggcGl2b3RpbmcsIHRvIGFsbG93IGNoYW5naW5nIHRoZSBzZWNvbmQgY29sdW1uIGdyb3VwIGRlZmluaXRpb24uXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUGl2b3RSZXN1bHRDb2xHcm91cERlZjogKChjb2xHcm91cERlZjogQ29sR3JvdXBEZWY8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aGVuIHdvcmtpbmcgd2l0aCBUcmVlIERhdGEgd2hlbiBgdHJlZURhdGEgPSB0cnVlYC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldERhdGFQYXRoOiBHZXREYXRhUGF0aDxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzZXR0aW5nIHRoZSBjaGlsZCBjb3VudCBmb3IgYSBncm91cCByb3cuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGlsZENvdW50OiAoKGRhdGFJdGVtOiBhbnkpID0+IG51bWJlcikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBwcm92aWRpbmcgZGlmZmVyZW50IHBhcmFtcyBmb3IgZGlmZmVyZW50IGxldmVscyBvZiBncm91cGluZy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zOiAoKHBhcmFtczogR2V0U2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXNQYXJhbXMpID0+IFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGdyb3VwcyB0byBiZSBvcGVuIGJ5IGRlZmF1bHQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHQ6ICgocGFyYW1zOiBJc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMpID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY2FuY2VsbGluZyB0cmFuc2FjdGlvbnMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uOiBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTU1JNIFRyZWUgRGF0YTogQWxsb3dzIHNwZWNpZnlpbmcgd2hpY2ggcm93cyBhcmUgZXhwYW5kYWJsZS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwOiBJc1NlcnZlclNpZGVHcm91cCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU1NSTSBUcmVlIERhdGE6IEFsbG93cyBzcGVjaWZ5aW5nIGdyb3VwIGtleXMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlR3JvdXBLZXk6IEdldFNlcnZlclNpZGVHcm91cEtleSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUmV0dXJuIGEgYnVzaW5lc3Mga2V5IGZvciB0aGUgbm9kZS4gSWYgaW1wbGVtZW50ZWQsIGVhY2ggcm93IGluIHRoZSBET00gd2lsbCBoYXZlIGFuIGF0dHJpYnV0ZSBgcm93LWlkPSdhYmMnYCB3aGVyZSBgYWJjYCBpcyB3aGF0IHlvdSByZXR1cm4gYXMgdGhlIGJ1c2luZXNzIGtleS5cbiAgICAgICAgICogVGhpcyBpcyB1c2VmdWwgZm9yIGF1dG9tYXRlZCB0ZXN0aW5nLCBhcyBpdCBwcm92aWRlcyBhIHdheSBmb3IgeW91ciB0b29sIHRvIGlkZW50aWZ5IHJvd3MgYmFzZWQgb24gdW5pcXVlIGJ1c2luZXNzIGtleXMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRCdXNpbmVzc0tleUZvck5vZGU6ICgobm9kZTogSVJvd05vZGU8VERhdGE+KSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgc2V0dGluZyB0aGUgSUQgZm9yIGEgcGFydGljdWxhciByb3cgbm9kZSBiYXNlZCBvbiB0aGUgZGF0YS5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0lkOiBHZXRSb3dJZEZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGdldFJvd0lkKCkgY2FsbGJhY2sgaXMgaW1wbGVtZW50ZWQgYW5kIG5ldyBSb3cgRGF0YSBpcyBzZXQsIHRoZSBncmlkIHdpbGwgZGlzcmVnYXJkIGFsbCBwcmV2aW91cyByb3dzIGFuZCB0cmVhdCB0aGUgbmV3IFJvdyBEYXRhIGFzIG5ldyBkYXRhLiBBcyBhIGNvbnNlcXVlbmNlLCBhbGwgUm93IFN0YXRlIChlZyBzZWxlY3Rpb24sIHJlbmRlcmVkIHJvd3MpIHdpbGwgYmUgcmVzZXQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZXNldFJvd0RhdGFPblVwZGF0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIHJvd3MgYWZ0ZXIgdGhleSBhcmUgY3JlYXRlZCwgc28geW91IGNhbiBkbyBmaW5hbCBhZGRpbmcgb2YgY3VzdG9tIGF0dHJpYnV0ZXMgZXRjLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Jvd1Bvc3RDcmVhdGU6ICgocGFyYW1zOiBQcm9jZXNzUm93UGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIHJvd3MgYXJlIHNlbGVjdGFibGUuIEJ5IGRlZmF1bHQgcm93cyBhcmUgc2VsZWN0YWJsZSwgc28gcmV0dXJuIGBmYWxzZWAgdG8gbWFrZSBhIHJvdyB1bi1zZWxlY3RhYmxlLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dTZWxlY3RhYmxlOiBJc1Jvd1NlbGVjdGFibGU8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggTWFzdGVyIERldGFpbCB0byBkZXRlcm1pbmUgaWYgYSByb3cgc2hvdWxkIGJlIGEgbWFzdGVyIHJvdy4gSWYgYGZhbHNlYCBpcyByZXR1cm5lZCBubyBkZXRhaWwgcm93IHdpbGwgZXhpc3QgZm9yIHRoaXMgcm93LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dNYXN0ZXI6IElzUm93TWFzdGVyPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gZmlsbCB2YWx1ZXMgaW5zdGVhZCBvZiBzaW1wbHkgY29weWluZyB2YWx1ZXMgb3IgaW5jcmVhc2luZyBudW1iZXIgdmFsdWVzIHVzaW5nIGxpbmVhciBwcm9ncmVzc2lvbi5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbGxPcGVyYXRpb246ICgocGFyYW1zOiBGaWxsT3BlcmF0aW9uUGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gcGVyZm9ybSBhZGRpdGlvbmFsIHNvcnRpbmcgYWZ0ZXIgdGhlIGdyaWQgaGFzIHNvcnRlZCB0aGUgcm93cy4gV2hlbiB1c2VkIHdpdGggU1NSTSwgb25seSBhcHBsaWNhYmxlIHdoZW4gYHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsPXRydWVgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFNvcnRSb3dzOiAoKHBhcmFtczogUG9zdFNvcnRSb3dzUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd1N0eWxlYCB0byBzZXQgc3R5bGUgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhbiBvYmplY3Qgb2YgQ1NTIHZhbHVlcyBvciB1bmRlZmluZWQgZm9yIG5vIHN0eWxlcy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd1N0eWxlOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXM8VERhdGE+KSA9PiBSb3dTdHlsZSB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd0NsYXNzYCB0byBzZXQgY2xhc3MoZXMpIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSwgYXJyYXkgb2Ygc3RyaW5ncyAoYXJyYXkgb2YgY2xhc3MgbmFtZXMpIG9yIHVuZGVmaW5lZCBmb3Igbm8gY2xhc3MuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzczogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dIZWlnaHRgIHRvIHNldCBoZWlnaHQgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhIHBvc2l0aXZlIG51bWJlciBvZiBwaXhlbHMsIG9yIHJldHVybiBgbnVsbGAvYHVuZGVmaW5lZGAgdG8gdXNlIHRoZSBkZWZhdWx0IHJvdyBoZWlnaHQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dIZWlnaHQ6ICgocGFyYW1zOiBSb3dIZWlnaHRQYXJhbXM8VERhdGE+KSA9PiBudW1iZXIgfCB1bmRlZmluZWQgfCBudWxsKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGVsbHMgdGhlIGdyaWQgaWYgdGhpcyByb3cgc2hvdWxkIGJlIHJlbmRlcmVkIGFzIGZ1bGwgd2lkdGguXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0Z1bGxXaWR0aFJvdzogKChwYXJhbXM6IElzRnVsbFdpZHRoUm93UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvKiogVGhlIHRvb2wgcGFuZWwgdmlzaWJpbGl0eSBoYXMgY2hhbmdlZC4gRmlyZXMgdHdpY2UgaWYgc3dpdGNoaW5nIGJldHdlZW4gcGFuZWxzIC0gb25jZSB3aXRoIHRoZSBvbGQgcGFuZWwgYW5kIG9uY2Ugd2l0aCB0aGUgbmV3IHBhbmVsLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIHRvb2wgcGFuZWwgc2l6ZSBoYXMgYmVlbiBjaGFuZ2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFNpemVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxTaXplQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ3V0IG9wZXJhdGlvbiBoYXMgc3RhcnRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjdXRTdGFydDogRXZlbnRFbWl0dGVyPEN1dFN0YXJ0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q3V0U3RhcnRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEN1dCBvcGVyYXRpb24gaGFzIGVuZGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGN1dEVuZDogRXZlbnRFbWl0dGVyPEN1dEVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEN1dEVuZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUGFzdGUgb3BlcmF0aW9uIGhhcyBzdGFydGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlU3RhcnQ6IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUGFzdGUgb3BlcmF0aW9uIGhhcyBlbmRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYXN0ZUVuZDogRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uLCBvciBncm91cCBvZiBjb2x1bW5zLCB3YXMgaGlkZGVuIC8gc2hvd24uXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmlzaWJsZTogRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WaXNpYmxlRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiwgb3IgZ3JvdXAgb2YgY29sdW1ucywgd2FzIHBpbm5lZCAvIHVucGlubmVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpbm5lZDogRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4gd2FzIHJlc2l6ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUmVzaXplZDogRXZlbnRFbWl0dGVyPENvbHVtblJlc2l6ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5SZXNpemVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgbW92ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uTW92ZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Nb3ZlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbk1vdmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHZhbHVlIGNvbHVtbiB3YXMgYWRkZWQgb3IgcmVtb3ZlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBwaXZvdCBtb2RlIGZsYWcgd2FzIGNoYW5nZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RNb2RlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHBpdm90IGNvbHVtbiB3YXMgYWRkZWQsIHJlbW92ZWQgb3Igb3JkZXIgY2hhbmdlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uIGdyb3VwIHdhcyBvcGVuZWQgLyBjbG9zZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uR3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBVc2VyIHNldCBuZXcgY29sdW1ucy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBuZXdDb2x1bW5zTG9hZGVkOiBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPE5ld0NvbHVtbnNMb2FkZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGdyaWQgY29sdW1ucyBjaGFuZ2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGxpc3Qgb2YgZGlzcGxheWVkIGNvbHVtbnMgY2hhbmdlZC4gVGhpcyBjYW4gcmVzdWx0IGZyb20gY29sdW1ucyBvcGVuIC8gY2xvc2UsIGNvbHVtbiBtb3ZlLCBwaXZvdCwgZ3JvdXAsIGV0Yy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIHJlbmRlcmVkIGNvbHVtbnMgY2hhbmdlZCAob25seSBjb2x1bW5zIGluIHRoZSB2aXNpYmxlIHNjcm9sbGVkIHZpZXdwb3J0IGFyZSByZW5kZXJlZCBieSBkZWZhdWx0KS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFNob3RndW4gLSBnZXRzIGNhbGxlZCB3aGVuIGVpdGhlciBhKSBuZXcgY29sdW1ucyBhcmUgc2V0IG9yIGIpIGBhcGkuYXBwbHlDb2x1bW5TdGF0ZSgpYCBpcyB1c2VkLCBzbyBldmVyeXRoaW5nIGhhcyBjaGFuZ2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogT25seSB1c2VkIGJ5IEFuZ3VsYXIsIFJlYWN0IGFuZCBWdWVKUyBBRyBHcmlkIGNvbXBvbmVudHMgKG5vdCB1c2VkIGlmIGRvaW5nIHBsYWluIEphdmFTY3JpcHQpLlxuICAgICAgICAgKiBJZiB0aGUgZ3JpZCByZWNlaXZlcyBjaGFuZ2VzIGR1ZSB0byBib3VuZCBwcm9wZXJ0aWVzLCB0aGlzIGV2ZW50IGZpcmVzIGFmdGVyIHRoZSBncmlkIGhhcyBmaW5pc2hlZCBwcm9jZXNzaW5nIHRoZSBjaGFuZ2UuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29tcG9uZW50U3RhdGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBWYWx1ZSBoYXMgY2hhbmdlZCBhZnRlciBlZGl0aW5nICh0aGlzIGV2ZW50IHdpbGwgbm90IGZpcmUgaWYgZWRpdGluZyB3YXMgY2FuY2VsbGVkLCBlZyBFU0Mgd2FzIHByZXNzZWQpIG9yXG4gICAgICAgICAqICBpZiBjZWxsIHZhbHVlIGhhcyBjaGFuZ2VkIGFzIGEgcmVzdWx0IG9mIGN1dCwgcGFzdGUsIGNlbGwgY2xlYXIgKHByZXNzaW5nIERlbGV0ZSBrZXkpLFxuICAgICAgICAgKiBmaWxsIGhhbmRsZSwgY29weSByYW5nZSBkb3duLCB1bmRvIGFuZCByZWRvLlxuICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBWYWx1ZSBoYXMgY2hhbmdlZCBhZnRlciBlZGl0aW5nLiBPbmx5IGZpcmVzIHdoZW4gYHJlYWRPbmx5RWRpdD10cnVlYC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdFJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdFJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdFJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY2VsbCdzIHZhbHVlIHdpdGhpbiBhIHJvdyBoYXMgY2hhbmdlZC4gVGhpcyBldmVudCBjb3JyZXNwb25kcyB0byBGdWxsIFJvdyBFZGl0aW5nIG9ubHkuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93VmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Um93VmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93VmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgY2VsbCBoYXMgc3RhcnRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSBjZWxsIGhhcyBzdG9wcGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIHJvdyBoYXMgc3RhcnRlZCAod2hlbiByb3cgZWRpdGluZyBpcyBlbmFibGVkKS4gV2hlbiByb3cgZWRpdGluZywgdGhpcyBldmVudCB3aWxsIGJlIGZpcmVkIG9uY2UgYW5kIGBjZWxsRWRpdGluZ1N0YXJ0ZWRgIHdpbGwgYmUgZmlyZWQgZm9yIGVhY2ggaW5kaXZpZHVhbCBjZWxsLiBPbmx5IGZpcmVzIHdoZW4gZG9pbmcgRnVsbCBSb3cgRWRpdGluZy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSByb3cgaGFzIHN0b3BwZWQgKHdoZW4gcm93IGVkaXRpbmcgaXMgZW5hYmxlZCkuIFdoZW4gcm93IGVkaXRpbmcsIHRoaXMgZXZlbnQgd2lsbCBiZSBmaXJlZCBvbmNlIGFuZCBgY2VsbEVkaXRpbmdTdG9wcGVkYCB3aWxsIGJlIGZpcmVkIGZvciBlYWNoIGluZGl2aWR1YWwgY2VsbC4gT25seSBmaXJlcyB3aGVuIGRvaW5nIEZ1bGwgUm93IEVkaXRpbmcuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBVbmRvIG9wZXJhdGlvbiBoYXMgc3RhcnRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB1bmRvU3RhcnRlZDogRXZlbnRFbWl0dGVyPFVuZG9TdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VW5kb1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFVuZG8gb3BlcmF0aW9uIGhhcyBlbmRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB1bmRvRW5kZWQ6IEV2ZW50RW1pdHRlcjxVbmRvRW5kZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxVbmRvRW5kZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJlZG8gb3BlcmF0aW9uIGhhcyBzdGFydGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJlZG9TdGFydGVkOiBFdmVudEVtaXR0ZXI8UmVkb1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSZWRvU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUmVkbyBvcGVyYXRpb24gaGFzIGVuZGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJlZG9FbmRlZDogRXZlbnRFbWl0dGVyPFJlZG9FbmRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJlZG9FbmRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUmFuZ2UgZGVsZXRlIG9wZXJhdGlvbiAoY2VsbCBjbGVhcikgaGFzIHN0YXJ0ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VEZWxldGVTdGFydDogRXZlbnRFbWl0dGVyPFJhbmdlRGVsZXRlU3RhcnRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSYW5nZURlbGV0ZVN0YXJ0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSYW5nZSBkZWxldGUgb3BlcmF0aW9uIChjZWxsIGNsZWFyKSBoYXMgZW5kZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VEZWxldGVFbmQ6IEV2ZW50RW1pdHRlcjxSYW5nZURlbGV0ZUVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJhbmdlRGVsZXRlRW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgaGFzIGJlZW4gb3BlbmVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck9wZW5lZDogRXZlbnRFbWl0dGVyPEZpbHRlck9wZW5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck9wZW5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRmlsdGVyIGhhcyBiZWVuIG1vZGlmaWVkIGFuZCBhcHBsaWVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlckNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRmlsdGVyIHdhcyBtb2RpZmllZCBidXQgbm90IGFwcGxpZWQuIFVzZWQgd2hlbiBmaWx0ZXJzIGhhdmUgJ0FwcGx5JyBidXR0b25zLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck1vZGlmaWVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyTW9kaWZpZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQWR2YW5jZWQgRmlsdGVyIEJ1aWxkZXIgdmlzaWJpbGl0eSBoYXMgY2hhbmdlZCAob3BlbmVkIG9yIGNsb3NlZCkuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYWR2YW5jZWRGaWx0ZXJCdWlsZGVyVmlzaWJsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxBZHZhbmNlZEZpbHRlckJ1aWxkZXJWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEFkdmFuY2VkRmlsdGVyQnVpbGRlclZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRDcmVhdGVkOiBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0Q3JlYXRlZDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBkYXRhIHJhbmdlIGZvciB0aGUgY2hhcnQgaGFzIGJlZW4gY2hhbmdlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkPFREYXRhPj4oKTtcbiAgICAvKiogRm9ybWF0dGluZyBjaGFuZ2VzIGhhdmUgYmVlbiBtYWRlIGJ5IHVzZXJzIHRocm91Z2ggdGhlIEZvcm1hdCBQYW5lbC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydE9wdGlvbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRPcHRpb25zQ2hhbmdlZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPFREYXRhPj4oKTtcbiAgICAvKiogQSBjaGFydCBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnREZXN0cm95ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDaGFydERlc3Ryb3llZDxURGF0YT4+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5RG93bmAgaGFwcGVuZWQgb24gYSBjZWxsLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxLZXlEb3duRXZlbnQ8VERhdGE+IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBncmlkIGhhcyBpbml0aWFsaXNlZCBhbmQgaXMgcmVhZHkgZm9yIG1vc3QgYXBpIGNhbGxzLCBidXQgbWF5IG5vdCBiZSBmdWxseSByZW5kZXJlZCB5ZXQgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFJlYWR5OiBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBJbnZva2VkIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZ3JpZCBpcyBkZXN0cm95ZWQuIFRoaXMgaXMgdXNlZnVsIGZvciBjbGVhbnVwIGxvZ2ljIHRoYXQgbmVlZHMgdG8gcnVuIGJlZm9yZSB0aGUgZ3JpZCBpcyB0b3JuIGRvd24uXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFByZURlc3Ryb3llZDogRXZlbnRFbWl0dGVyPEdyaWRQcmVEZXN0cm95ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkUHJlRGVzdHJveWVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaXJlZCB0aGUgZmlyc3QgdGltZSBkYXRhIGlzIHJlbmRlcmVkIGludG8gdGhlIGdyaWQuIFVzZSB0aGlzIGV2ZW50IGlmIHlvdSB3YW50IHRvIGF1dG8gcmVzaXplIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY29udGVudHMgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaXJzdERhdGFSZW5kZXJlZDogRXZlbnRFbWl0dGVyPEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBzaXplIG9mIHRoZSBncmlkIGBkaXZgIGhhcyBjaGFuZ2VkLiBJbiBvdGhlciB3b3JkcywgdGhlIGdyaWQgd2FzIHJlc2l6ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFNpemVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBEaXNwbGF5ZWQgcm93cyBoYXZlIGNoYW5nZWQuIFRyaWdnZXJlZCBhZnRlciBzb3J0LCBmaWx0ZXIgb3IgdHJlZSBleHBhbmQgLyBjb2xsYXBzZSBldmVudHMuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW9kZWxVcGRhdGVkOiBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBET00sIGZvciBhbnkgcmVhc29uLiBVc2UgdG8gY2xlYW4gdXAgcmVzb3VyY2VzIChpZiBhbnkpIHVzZWQgYnkgdGhlIHJvdy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsUm93UmVtb3ZlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoaWNoIHJvd3MgYXJlIHJlbmRlcmVkIGluIHRoZSBET00gaGFzIGNoYW5nZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlld3BvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgYm9keSB3YXMgc2Nyb2xsZWQgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNYWluIGJvZHkgb2YgdGhlIGdyaWQgaGFzIHN0b3BwZWQgc2Nyb2xsaW5nLCBlaXRoZXIgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbEVuZDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBXaGVuIGRyYWdnaW5nIHN0YXJ0cy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RhcnRlZDogRXZlbnRFbWl0dGVyPERyYWdTdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RvcHMuIFRoaXMgY291bGQgYmUgYW55IGFjdGlvbiB0aGF0IHVzZXMgdGhlIGdyaWQncyBEcmFnIGFuZCBEcm9wIHNlcnZpY2UsIGUuZy4gQ29sdW1uIE1vdmluZywgQ29sdW1uIFJlc2l6aW5nLCBSYW5nZSBTZWxlY3Rpb24sIEZpbGwgSGFuZGxlLCBldGMuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBHcmlkIHN0YXRlIGhhcyBiZWVuIHVwZGF0ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc3RhdGVVcGRhdGVkOiBFdmVudEVtaXR0ZXI8U3RhdGVVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8U3RhdGVVcGRhdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUcmlnZ2VyZWQgZXZlcnkgdGltZSB0aGUgcGFnaW5nIHN0YXRlIGNoYW5nZXMuIFNvbWUgb2YgdGhlIG1vc3QgY29tbW9uIHNjZW5hcmlvcyBmb3IgdGhpcyBldmVudCB0byBiZSB0cmlnZ2VyZWQgYXJlOlxuICAgICAgICAgKlxuICAgICAgICAgKiAgLSBUaGUgcGFnZSBzaXplIGNoYW5nZXMuXG4gICAgICAgICAqICAtIFRoZSBjdXJyZW50IHNob3duIHBhZ2UgaXMgY2hhbmdlZC5cbiAgICAgICAgICogIC0gTmV3IGRhdGEgaXMgbG9hZGVkIG9udG8gdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGRyYWcgaGFzIHN0YXJ0ZWQsIG9yIGRyYWdnaW5nIHdhcyBhbHJlYWR5IHN0YXJ0ZWQgYW5kIHRoZSBtb3VzZSBoYXMgcmUtZW50ZXJlZCB0aGUgZ3JpZCBoYXZpbmcgcHJldmlvdXNseSBsZWZ0IHRoZSBncmlkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbnRlcjogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbW91c2UgaGFzIG1vdmVkIHdoaWxlIGRyYWdnaW5nLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdNb3ZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbGVmdCB0aGUgZ3JpZCB3aGlsZSBkcmFnZ2luZy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTGVhdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGRyYWcgaGFzIGZpbmlzaGVkIG92ZXIgdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VuZDogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHJvdyBncm91cCBjb2x1bW4gd2FzIGFkZGVkLCByZW1vdmVkIG9yIHJlb3JkZXJlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IGdyb3VwIHdhcyBvcGVuZWQgb3IgY2xvc2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0dyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Um93R3JvdXBPcGVuZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRmlyZWQgd2hlbiBjYWxsaW5nIGVpdGhlciBvZiB0aGUgQVBJIG1ldGhvZHMgYGV4cGFuZEFsbCgpYCBvciBgY29sbGFwc2VBbGwoKWAuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZXhwYW5kT3JDb2xsYXBzZUFsbDogRXZlbnRFbWl0dGVyPEV4cGFuZENvbGxhcHNlQWxsRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RXhwYW5kQ29sbGFwc2VBbGxFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBjbGllbnQgaGFzIHNldCBuZXcgcGlubmVkIHJvdyBkYXRhIGludG8gdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGlubmVkUm93RGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxQaW5uZWRSb3dEYXRhQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDbGllbnQtU2lkZSBSb3cgTW9kZWwgb25seS4gVGhlIGNsaWVudCBoYXMgdXBkYXRlZCBkYXRhIGZvciB0aGUgZ3JpZCBieSBlaXRoZXIgYSkgc2V0dGluZyBuZXcgUm93IERhdGEgb3IgYikgQXBwbHlpbmcgYSBSb3cgVHJhbnNhY3Rpb24uXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RGF0YVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dEYXRhVXBkYXRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBc3luYyB0cmFuc2FjdGlvbnMgaGF2ZSBiZWVuIGFwcGxpZWQuIENvbnRhaW5zIGEgbGlzdCBvZiBhbGwgdHJhbnNhY3Rpb24gcmVzdWx0cy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBhc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ6IEV2ZW50RW1pdHRlcjxBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPFREYXRhPj4oKTtcbiAgICAvKiogQSBzZXJ2ZXIgc2lkZSBzdG9yZSBoYXMgZmluaXNoZWQgcmVmcmVzaGluZy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzdG9yZVJlZnJlc2hlZDogRXZlbnRFbWl0dGVyPFN0b3JlUmVmcmVzaGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8U3RvcmVSZWZyZXNoZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgY2xpY2tlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgZG91YmxlIGNsaWNrZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbERvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDZWxsIGlzIGZvY3VzZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEZvY3VzZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRm9jdXNlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNb3VzZSBlbnRlcmVkIGNlbGwuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3ZlcjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNb3VzZSBsZWZ0IGNlbGwuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlT3V0OiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3V0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3V0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNb3VzZSBkb3duIG9uIGNlbGwuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbE1vdXNlRG93bjogRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VEb3duRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSb3cgaXMgY2xpY2tlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93Q2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBpcyBkb3VibGUgY2xpY2tlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBpcyBzZWxlY3RlZCBvciBkZXNlbGVjdGVkLiBUaGUgZXZlbnQgY29udGFpbnMgdGhlIG5vZGUgaW4gcXVlc3Rpb24sIHNvIGNhbGwgdGhlIG5vZGUncyBgaXNTZWxlY3RlZCgpYCBtZXRob2QgdG8gc2VlIGlmIGl0IHdhcyBqdXN0IHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93U2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSb3cgc2VsZWN0aW9uIGlzIGNoYW5nZWQuIFVzZSB0aGUgZ3JpZCBBUEkgYGdldFNlbGVjdGVkTm9kZXMoKWAgb3IgYGdldFNlbGVjdGVkUm93cygpYCB0byBnZXQgdGhlIG5ldyBsaXN0IG9mIHNlbGVjdGVkIG5vZGVzIC8gcm93IGRhdGEuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDZWxsIGlzIHJpZ2h0IGNsaWNrZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENvbnRleHRNZW51OiBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYW5nZSB0byByYW5nZSBzZWxlY3Rpb24gaGFzIG9jY3VycmVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSB0b29sdGlwIGhhcyBiZWVuIGRpc3BsYXllZCAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2x0aXBTaG93OiBFdmVudEVtaXR0ZXI8VG9vbHRpcFNob3dFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxUb29sdGlwU2hvd0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSB0b29sdGlwIHdhcyBoaWRkZW4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sdGlwSGlkZTogRXZlbnRFbWl0dGVyPFRvb2x0aXBIaWRlRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbHRpcEhpZGVFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFNvcnQgaGFzIGNoYW5nZWQuIFRoZSBncmlkIGFsc28gbGlzdGVucyBmb3IgdGhpcyBhbmQgdXBkYXRlcyB0aGUgbW9kZWwuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc29ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjkuMiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI5LjIgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOS4yICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uVmFsdWVDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjkuMiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcblxuXG4gICAgLy8gRW5hYmxlIHR5cGUgY29lcmNpb24gZm9yIGJvb2xlYW4gSW5wdXRzIHRvIHN1cHBvcnQgdXNlIGxpa2UgJ2VuYWJsZUNoYXJ0cycgaW5zdGVhZCBvZiBmb3JjaW5nICdbZW5hYmxlQ2hhcnRzXT1cInRydWVcIicgXG4gICAgLy8gaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3RlbXBsYXRlLXR5cGVjaGVjayNpbnB1dC1zZXR0ZXItY29lcmNpb24gXG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbEZvY3VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWJ1ZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQnJvd3NlclRvb2x0aXBzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsRXhwcmVzc2lvbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwSW5jbHVkZVRvdGFsRm9vdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFN1cHByZXNzQmxhbmtIZWFkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWVudUhpZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93RGVzZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3VuU29ydEljb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTXVsdGlTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNNdWx0aVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NOb1Jvd3NPdmVybGF5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9za2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQYXJlbnRzSW5Sb3dOb2RlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vdmFibGVDb2x1bW5zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZpZWxkRG90Tm90YXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSYW5nZUhhbmRsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlRmlsbEhhbmRsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVsdGFTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FzeW5jRXZlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29udGV4dE1lbnU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93R3JvdXBIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlHcm91cEhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3RNb2RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzQWdncmVnYXRlQXRSb290TGV2ZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWdnQXRSb290TGV2ZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRm9jdXNBZnRlclJlZnJlc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Z1bmN0aW9uc1Bhc3NpdmU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Z1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbmltYXRlUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTZWxlY3RzRmlsdGVyZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwUmVtb3ZlTG93ZXN0U2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJ0bDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlja0VkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdFbnRpcmVSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdNYW5hZ2VkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0RyYWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ011bHRpUm93OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQYWdpbmF0aW9uUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwSGlkZU9wZW5QYXJlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEFsbG93VW5iYWxhbmNlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3B1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luY2x1ZGVIaWRkZW5Db2x1bW5zSW5RdWlja0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZXhjbHVkZUhpZGRlbkNvbHVtbnNGcm9tUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Vuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbmNsdWRlSGlkZGVuQ29sdW1uc0luQWR2YW5jZWRGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW50ZXJNb3Zlc0Rvd246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTW92ZXNEb3duQWZ0ZXJFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHlBZnRlckVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTmF2aWdhdGVzVmVydGljYWxseTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0hvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd1RyYW5zZm9ybTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NMYXN0RW1wdHlMaW5lT25QYXN0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2hhcnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDaGFydFRvb2xQYW5lbHNCdXR0b246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2hhcnRUb29sUGFuZWxzQnV0dG9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01haW50YWluVW5zb3J0ZWRPcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01heFJlbmRlcmVkUm93UmVzdHJpY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2V4Y2x1ZGVDaGlsZHJlbldoZW5UcmVlRGF0YUZpbHRlcmluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Rvb2x0aXBJbnRlcmFjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfa2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2luYXRlQ2hpbGRSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wcmV2ZW50RGVmYXVsdE9uQ29udGV4dE1lbnU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3VuZG9SZWRvQ2VsbEVkaXRpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93RHJhZ0Zyb21Db2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9waXZvdFN1cHByZXNzQXV0b0NvbHVtbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NFeHBhbmRhYmxlUGl2b3RHcm91cHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlYm91bmNlVmVydGljYWxTY3JvbGxiYXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVGaWx0ZXJBbGxMZXZlbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0QWxsTGV2ZWxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlT25seVJlZnJlc2hGaWx0ZXJlZEdyb3VwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZVNvcnRPblNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUZpbHRlck9uU2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0ZpbHRlcmVkT25seTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2hvd09wZW5lZEdyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaXBib2FyZEFwaTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb2RlbFVwZGF0ZUFmdGVyVXBkYXRlVHJhbnNhY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N0b3BFZGl0aW5nV2hlbkNlbGxzTG9zZUZvY3VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYWludGFpbkNvbHVtbk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cE1haW50YWluT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvbHVtbkhvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZWFkT25seUVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxFZGl0aW5nT25CYWNrc3BhY2U6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jlc2V0Um93RGF0YU9uVXBkYXRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZW1vdmVQaXZvdEhlYWRlclJvd1doZW5TaW5nbGVWYWx1ZUNvbHVtbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb3B5U2luZ2xlQ2VsbFJhbmdlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NHcm91cFJvd3NTdGlja3k6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ3V0VG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dHcm91cFBhbmVsU3VwcHJlc3NTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbGxvd1Nob3dDaGFuZ2VBZnRlckZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQWR2YW5jZWRGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX21hc3RlckRldGFpbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdHJlZURhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzR3JvdXBNYWludGFpblZhbHVlVHlwZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICAvLyBARU5EQFxufVxuIl19