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
        /** Changes the display type of the column menu.
             * `'new'` just displays the main list of menu items. `'legacy'` displays a tabbed menu.
             * @default 'legacy'
             * @initial
             */
        this.columnMenu = undefined;
        /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header.
             * If `columnMenu = 'new'`, this will default to `true` instead of `false`.
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
        /** This defines when tooltip will show up for Cells, Headers and SetFilter Items.
             *  - `standard` - The tooltip always shows up when the items configured with Tooltips are hovered.
             * - `whenTruncated` - The tooltip will only be displayed when the items hovered have truncated (showing ellipsis) values. This property does not work when `enableBrowserTooltips={true}`.
             * @default `standard`
             */
        this.tooltipShowMode = undefined;
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
        /** Number of pixels to add to a column width after the [auto-sizing](./column-sizing/#auto-size-columns-to-fit-cell-contents) calculation.
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
        /** The list of chart themes that a user can choose from in the chart panel.
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
        /** @deprecated As of v29, no longer used.
             * @initial
             */
        this.enableChartToolPanelsButton = undefined;
        /** Set to `true` to show the 'hamburger' menu option from the Chart Toolbar and display the remaining toolbar buttons. Only applies when using AG Charts Community.
             * @default false
             * @initial
             */
        this.suppressChartToolPanelsButton = undefined;
        /** Allows customisation of the Chart Tool Panels, such as changing the tool panels visibility and order, as well as choosing which charts should be displayed in the chart panel.
             * @initial
             */
        this.chartToolPanelsDef = undefined;
        /** Get chart menu items. Only applies when using AG Charts Enterprise.
             */
        this.chartMenuItems = undefined;
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
             * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#implementing-a-loading-overlay-component) for framework specific implementation details.
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
             * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#implementing-a-no-rows-overlay-component) for framework specific implementation details.
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
        /** The maximum number of generated columns before the grid halts execution. Upon reaching this number, the grid halts generation of columns
             * and triggers a `pivotMaxColumnsExceeded` event. `-1` for no limit.
             * @default -1
             */
        this.pivotMaxGeneratedColumns = undefined;
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
             * @deprecated 31.2 use `enableCellChangeFlash` in the `ColDef` or `defaultColDef` for all columns.
             */
        this.enableCellChangeFlash = undefined;
        /** To be used when setting `enableCellChangeFlash` on column definitions. Sets the duration in milliseconds of how long a cell should remain in its "flashed" state.
             * @default 500
             */
        this.cellFlashDuration = undefined;
        /** @deprecated v31.1 - use `cellFlashDuration` instead.
             */
        this.cellFlashDelay = undefined;
        /** To be used when setting `enableCellChangeFlash` on column definitions. Sets the duration in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by cellFlashDuration has completed.
             * @default 1000
             */
        this.cellFadeDuration = undefined;
        /** @deprecated v31.1 - use `cellFadeDuration` instead.
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
             * @deprecated v31.1
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
        /** When enabled, sorts fully loaded groups in the browser instead of requesting from the server.
             * @default false
             */
        this.serverSideEnableClientSideSort = undefined;
        /** When enabled, only refresh groups directly impacted by a filter. This property only applies when there is Row Grouping & filtering is handled on the server.
             * @default false
             * @initial
             */
        this.serverSideOnlyRefreshFilteredGroups = undefined;
        /** @deprecated v30 This property has been deprecated. Use `serverSideOnlyRefreshFilteredGroups` instead.
             */
        this.serverSideFilterAllLevels = undefined;
        /** When enabled, Sorting will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
             * @default false
             * @deprecated
             */
        this.serverSideSortOnServer = undefined;
        /** When enabled, Filtering will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
             * @default false
             * @deprecated
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
        /** If `true`, header cells won't be focusable. This means keyboard navigation will be disabled for grid header cells, but remain enabled in other elements of the grid such as grid cells and tool panels.
             * @default false
             */
        this.suppressHeaderFocus = undefined;
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
        /** Callback to perform additional sorting after the grid has sorted the rows.
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
        /** The column menu visibility has changed. Fires twice if switching between tabs - once with the old tab and once with the new tab.
             */
        this.columnMenuVisibleChanged = new EventEmitter();
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
        /** Exceeded the `pivotMaxGeneratedColumns` limit when generating columns.
             */
        this.pivotMaxColumnsExceeded = new EventEmitter();
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
AgGridAngular.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.3.0", type: AgGridAngular, isStandalone: true, selector: "ag-grid-angular", inputs: { gridOptions: "gridOptions", modules: "modules", statusBar: "statusBar", sideBar: "sideBar", suppressContextMenu: "suppressContextMenu", preventDefaultOnContextMenu: "preventDefaultOnContextMenu", allowContextMenuWithControlKey: "allowContextMenuWithControlKey", columnMenu: "columnMenu", suppressMenuHide: "suppressMenuHide", enableBrowserTooltips: "enableBrowserTooltips", tooltipTrigger: "tooltipTrigger", tooltipShowDelay: "tooltipShowDelay", tooltipHideDelay: "tooltipHideDelay", tooltipMouseTrack: "tooltipMouseTrack", tooltipShowMode: "tooltipShowMode", tooltipInteraction: "tooltipInteraction", popupParent: "popupParent", copyHeadersToClipboard: "copyHeadersToClipboard", copyGroupHeadersToClipboard: "copyGroupHeadersToClipboard", clipboardDelimiter: "clipboardDelimiter", suppressCopyRowsToClipboard: "suppressCopyRowsToClipboard", suppressCopySingleCellRanges: "suppressCopySingleCellRanges", suppressLastEmptyLineOnPaste: "suppressLastEmptyLineOnPaste", suppressClipboardPaste: "suppressClipboardPaste", suppressClipboardApi: "suppressClipboardApi", suppressCutToClipboard: "suppressCutToClipboard", columnDefs: "columnDefs", defaultColDef: "defaultColDef", defaultColGroupDef: "defaultColGroupDef", columnTypes: "columnTypes", dataTypeDefinitions: "dataTypeDefinitions", maintainColumnOrder: "maintainColumnOrder", suppressFieldDotNotation: "suppressFieldDotNotation", headerHeight: "headerHeight", groupHeaderHeight: "groupHeaderHeight", floatingFiltersHeight: "floatingFiltersHeight", pivotHeaderHeight: "pivotHeaderHeight", pivotGroupHeaderHeight: "pivotGroupHeaderHeight", allowDragFromColumnsToolPanel: "allowDragFromColumnsToolPanel", suppressMovableColumns: "suppressMovableColumns", suppressColumnMoveAnimation: "suppressColumnMoveAnimation", suppressDragLeaveHidesColumns: "suppressDragLeaveHidesColumns", suppressRowGroupHidesColumns: "suppressRowGroupHidesColumns", colResizeDefault: "colResizeDefault", suppressAutoSize: "suppressAutoSize", autoSizePadding: "autoSizePadding", skipHeaderOnAutoSize: "skipHeaderOnAutoSize", autoSizeStrategy: "autoSizeStrategy", components: "components", editType: "editType", singleClickEdit: "singleClickEdit", suppressClickEdit: "suppressClickEdit", readOnlyEdit: "readOnlyEdit", stopEditingWhenCellsLoseFocus: "stopEditingWhenCellsLoseFocus", enterMovesDown: "enterMovesDown", enterMovesDownAfterEdit: "enterMovesDownAfterEdit", enterNavigatesVertically: "enterNavigatesVertically", enterNavigatesVerticallyAfterEdit: "enterNavigatesVerticallyAfterEdit", enableCellEditingOnBackspace: "enableCellEditingOnBackspace", undoRedoCellEditing: "undoRedoCellEditing", undoRedoCellEditingLimit: "undoRedoCellEditingLimit", defaultCsvExportParams: "defaultCsvExportParams", suppressCsvExport: "suppressCsvExport", defaultExcelExportParams: "defaultExcelExportParams", suppressExcelExport: "suppressExcelExport", excelStyles: "excelStyles", quickFilterText: "quickFilterText", cacheQuickFilter: "cacheQuickFilter", excludeHiddenColumnsFromQuickFilter: "excludeHiddenColumnsFromQuickFilter", includeHiddenColumnsInQuickFilter: "includeHiddenColumnsInQuickFilter", quickFilterParser: "quickFilterParser", quickFilterMatcher: "quickFilterMatcher", excludeChildrenWhenTreeDataFiltering: "excludeChildrenWhenTreeDataFiltering", enableAdvancedFilter: "enableAdvancedFilter", advancedFilterModel: "advancedFilterModel", includeHiddenColumnsInAdvancedFilter: "includeHiddenColumnsInAdvancedFilter", advancedFilterParent: "advancedFilterParent", advancedFilterBuilderParams: "advancedFilterBuilderParams", enableCharts: "enableCharts", chartThemes: "chartThemes", customChartThemes: "customChartThemes", chartThemeOverrides: "chartThemeOverrides", enableChartToolPanelsButton: "enableChartToolPanelsButton", suppressChartToolPanelsButton: "suppressChartToolPanelsButton", chartToolPanelsDef: "chartToolPanelsDef", chartMenuItems: "chartMenuItems", loadingCellRenderer: "loadingCellRenderer", loadingCellRendererParams: "loadingCellRendererParams", loadingCellRendererSelector: "loadingCellRendererSelector", localeText: "localeText", masterDetail: "masterDetail", keepDetailRows: "keepDetailRows", keepDetailRowsCount: "keepDetailRowsCount", detailCellRenderer: "detailCellRenderer", detailCellRendererParams: "detailCellRendererParams", detailRowHeight: "detailRowHeight", detailRowAutoHeight: "detailRowAutoHeight", context: "context", alignedGrids: "alignedGrids", tabIndex: "tabIndex", rowBuffer: "rowBuffer", valueCache: "valueCache", valueCacheNeverExpires: "valueCacheNeverExpires", enableCellExpressions: "enableCellExpressions", suppressParentsInRowNodes: "suppressParentsInRowNodes", suppressTouch: "suppressTouch", suppressFocusAfterRefresh: "suppressFocusAfterRefresh", suppressAsyncEvents: "suppressAsyncEvents", suppressBrowserResizeObserver: "suppressBrowserResizeObserver", suppressPropertyNamesCheck: "suppressPropertyNamesCheck", suppressChangeDetection: "suppressChangeDetection", debug: "debug", overlayLoadingTemplate: "overlayLoadingTemplate", loadingOverlayComponent: "loadingOverlayComponent", loadingOverlayComponentParams: "loadingOverlayComponentParams", suppressLoadingOverlay: "suppressLoadingOverlay", overlayNoRowsTemplate: "overlayNoRowsTemplate", noRowsOverlayComponent: "noRowsOverlayComponent", noRowsOverlayComponentParams: "noRowsOverlayComponentParams", suppressNoRowsOverlay: "suppressNoRowsOverlay", pagination: "pagination", paginationPageSize: "paginationPageSize", paginationPageSizeSelector: "paginationPageSizeSelector", paginationAutoPageSize: "paginationAutoPageSize", paginateChildRows: "paginateChildRows", suppressPaginationPanel: "suppressPaginationPanel", pivotMode: "pivotMode", pivotPanelShow: "pivotPanelShow", pivotMaxGeneratedColumns: "pivotMaxGeneratedColumns", pivotDefaultExpanded: "pivotDefaultExpanded", pivotColumnGroupTotals: "pivotColumnGroupTotals", pivotRowTotals: "pivotRowTotals", pivotSuppressAutoColumn: "pivotSuppressAutoColumn", suppressExpandablePivotGroups: "suppressExpandablePivotGroups", functionsReadOnly: "functionsReadOnly", aggFuncs: "aggFuncs", suppressAggFuncInHeader: "suppressAggFuncInHeader", alwaysAggregateAtRootLevel: "alwaysAggregateAtRootLevel", suppressAggAtRootLevel: "suppressAggAtRootLevel", aggregateOnlyChangedColumns: "aggregateOnlyChangedColumns", suppressAggFilteredOnly: "suppressAggFilteredOnly", removePivotHeaderRowWhenSingleValueColumn: "removePivotHeaderRowWhenSingleValueColumn", animateRows: "animateRows", enableCellChangeFlash: "enableCellChangeFlash", cellFlashDuration: "cellFlashDuration", cellFlashDelay: "cellFlashDelay", cellFadeDuration: "cellFadeDuration", cellFadeDelay: "cellFadeDelay", allowShowChangeAfterFilter: "allowShowChangeAfterFilter", domLayout: "domLayout", ensureDomOrder: "ensureDomOrder", enableRtl: "enableRtl", suppressColumnVirtualisation: "suppressColumnVirtualisation", suppressMaxRenderedRowRestriction: "suppressMaxRenderedRowRestriction", suppressRowVirtualisation: "suppressRowVirtualisation", rowDragManaged: "rowDragManaged", suppressRowDrag: "suppressRowDrag", suppressMoveWhenRowDragging: "suppressMoveWhenRowDragging", rowDragEntireRow: "rowDragEntireRow", rowDragMultiRow: "rowDragMultiRow", rowDragText: "rowDragText", fullWidthCellRenderer: "fullWidthCellRenderer", fullWidthCellRendererParams: "fullWidthCellRendererParams", embedFullWidthRows: "embedFullWidthRows", suppressGroupMaintainValueType: "suppressGroupMaintainValueType", groupDisplayType: "groupDisplayType", groupDefaultExpanded: "groupDefaultExpanded", autoGroupColumnDef: "autoGroupColumnDef", groupMaintainOrder: "groupMaintainOrder", groupSelectsChildren: "groupSelectsChildren", groupLockGroupColumns: "groupLockGroupColumns", groupAggFiltering: "groupAggFiltering", groupIncludeFooter: "groupIncludeFooter", groupIncludeTotalFooter: "groupIncludeTotalFooter", groupSuppressBlankHeader: "groupSuppressBlankHeader", groupSelectsFiltered: "groupSelectsFiltered", showOpenedGroup: "showOpenedGroup", groupRemoveSingleChildren: "groupRemoveSingleChildren", groupRemoveLowestSingleChildren: "groupRemoveLowestSingleChildren", groupHideOpenParents: "groupHideOpenParents", groupAllowUnbalanced: "groupAllowUnbalanced", rowGroupPanelShow: "rowGroupPanelShow", groupRowRenderer: "groupRowRenderer", groupRowRendererParams: "groupRowRendererParams", suppressMakeColumnVisibleAfterUnGroup: "suppressMakeColumnVisibleAfterUnGroup", treeData: "treeData", rowGroupPanelSuppressSort: "rowGroupPanelSuppressSort", suppressGroupRowsSticky: "suppressGroupRowsSticky", pinnedTopRowData: "pinnedTopRowData", pinnedBottomRowData: "pinnedBottomRowData", rowModelType: "rowModelType", rowData: "rowData", asyncTransactionWaitMillis: "asyncTransactionWaitMillis", suppressModelUpdateAfterUpdateTransaction: "suppressModelUpdateAfterUpdateTransaction", datasource: "datasource", cacheOverflowSize: "cacheOverflowSize", infiniteInitialRowCount: "infiniteInitialRowCount", serverSideInitialRowCount: "serverSideInitialRowCount", suppressServerSideInfiniteScroll: "suppressServerSideInfiniteScroll", cacheBlockSize: "cacheBlockSize", maxBlocksInCache: "maxBlocksInCache", maxConcurrentDatasourceRequests: "maxConcurrentDatasourceRequests", blockLoadDebounceMillis: "blockLoadDebounceMillis", purgeClosedRowNodes: "purgeClosedRowNodes", serverSideDatasource: "serverSideDatasource", serverSideSortAllLevels: "serverSideSortAllLevels", serverSideEnableClientSideSort: "serverSideEnableClientSideSort", serverSideOnlyRefreshFilteredGroups: "serverSideOnlyRefreshFilteredGroups", serverSideFilterAllLevels: "serverSideFilterAllLevels", serverSideSortOnServer: "serverSideSortOnServer", serverSideFilterOnServer: "serverSideFilterOnServer", serverSidePivotResultFieldSeparator: "serverSidePivotResultFieldSeparator", viewportDatasource: "viewportDatasource", viewportRowModelPageSize: "viewportRowModelPageSize", viewportRowModelBufferSize: "viewportRowModelBufferSize", alwaysShowHorizontalScroll: "alwaysShowHorizontalScroll", alwaysShowVerticalScroll: "alwaysShowVerticalScroll", debounceVerticalScrollbar: "debounceVerticalScrollbar", suppressHorizontalScroll: "suppressHorizontalScroll", suppressScrollOnNewData: "suppressScrollOnNewData", suppressScrollWhenPopupsAreOpen: "suppressScrollWhenPopupsAreOpen", suppressAnimationFrame: "suppressAnimationFrame", suppressMiddleClickScrolls: "suppressMiddleClickScrolls", suppressPreventDefaultOnMouseWheel: "suppressPreventDefaultOnMouseWheel", scrollbarWidth: "scrollbarWidth", rowSelection: "rowSelection", rowMultiSelectWithClick: "rowMultiSelectWithClick", suppressRowDeselection: "suppressRowDeselection", suppressRowClickSelection: "suppressRowClickSelection", suppressCellFocus: "suppressCellFocus", suppressHeaderFocus: "suppressHeaderFocus", suppressMultiRangeSelection: "suppressMultiRangeSelection", enableCellTextSelection: "enableCellTextSelection", enableRangeSelection: "enableRangeSelection", enableRangeHandle: "enableRangeHandle", enableFillHandle: "enableFillHandle", fillHandleDirection: "fillHandleDirection", suppressClearOnFillReduction: "suppressClearOnFillReduction", sortingOrder: "sortingOrder", accentedSort: "accentedSort", unSortIcon: "unSortIcon", suppressMultiSort: "suppressMultiSort", alwaysMultiSort: "alwaysMultiSort", multiSortKey: "multiSortKey", suppressMaintainUnsortedOrder: "suppressMaintainUnsortedOrder", icons: "icons", rowHeight: "rowHeight", rowStyle: "rowStyle", rowClass: "rowClass", rowClassRules: "rowClassRules", suppressRowHoverHighlight: "suppressRowHoverHighlight", suppressRowTransform: "suppressRowTransform", columnHoverHighlight: "columnHoverHighlight", gridId: "gridId", deltaSort: "deltaSort", treeDataDisplayType: "treeDataDisplayType", functionsPassive: "functionsPassive", enableGroupEdit: "enableGroupEdit", initialState: "initialState", getContextMenuItems: "getContextMenuItems", getMainMenuItems: "getMainMenuItems", postProcessPopup: "postProcessPopup", processUnpinnedColumns: "processUnpinnedColumns", processCellForClipboard: "processCellForClipboard", processHeaderForClipboard: "processHeaderForClipboard", processGroupHeaderForClipboard: "processGroupHeaderForClipboard", processCellFromClipboard: "processCellFromClipboard", sendToClipboard: "sendToClipboard", processDataFromClipboard: "processDataFromClipboard", isExternalFilterPresent: "isExternalFilterPresent", doesExternalFilterPass: "doesExternalFilterPass", getChartToolbarItems: "getChartToolbarItems", createChartContainer: "createChartContainer", navigateToNextHeader: "navigateToNextHeader", tabToNextHeader: "tabToNextHeader", navigateToNextCell: "navigateToNextCell", tabToNextCell: "tabToNextCell", getLocaleText: "getLocaleText", getDocument: "getDocument", paginationNumberFormatter: "paginationNumberFormatter", getGroupRowAgg: "getGroupRowAgg", isGroupOpenByDefault: "isGroupOpenByDefault", initialGroupOrderComparator: "initialGroupOrderComparator", processPivotResultColDef: "processPivotResultColDef", processPivotResultColGroupDef: "processPivotResultColGroupDef", getDataPath: "getDataPath", getChildCount: "getChildCount", getServerSideGroupLevelParams: "getServerSideGroupLevelParams", isServerSideGroupOpenByDefault: "isServerSideGroupOpenByDefault", isApplyServerSideTransaction: "isApplyServerSideTransaction", isServerSideGroup: "isServerSideGroup", getServerSideGroupKey: "getServerSideGroupKey", getBusinessKeyForNode: "getBusinessKeyForNode", getRowId: "getRowId", resetRowDataOnUpdate: "resetRowDataOnUpdate", processRowPostCreate: "processRowPostCreate", isRowSelectable: "isRowSelectable", isRowMaster: "isRowMaster", fillOperation: "fillOperation", postSortRows: "postSortRows", getRowStyle: "getRowStyle", getRowClass: "getRowClass", getRowHeight: "getRowHeight", isFullWidthRow: "isFullWidthRow" }, outputs: { toolPanelVisibleChanged: "toolPanelVisibleChanged", toolPanelSizeChanged: "toolPanelSizeChanged", columnMenuVisibleChanged: "columnMenuVisibleChanged", cutStart: "cutStart", cutEnd: "cutEnd", pasteStart: "pasteStart", pasteEnd: "pasteEnd", columnVisible: "columnVisible", columnPinned: "columnPinned", columnResized: "columnResized", columnMoved: "columnMoved", columnValueChanged: "columnValueChanged", columnPivotModeChanged: "columnPivotModeChanged", columnPivotChanged: "columnPivotChanged", columnGroupOpened: "columnGroupOpened", newColumnsLoaded: "newColumnsLoaded", gridColumnsChanged: "gridColumnsChanged", displayedColumnsChanged: "displayedColumnsChanged", virtualColumnsChanged: "virtualColumnsChanged", columnEverythingChanged: "columnEverythingChanged", columnHeaderMouseOver: "columnHeaderMouseOver", columnHeaderMouseLeave: "columnHeaderMouseLeave", columnHeaderClicked: "columnHeaderClicked", columnHeaderContextMenu: "columnHeaderContextMenu", componentStateChanged: "componentStateChanged", cellValueChanged: "cellValueChanged", cellEditRequest: "cellEditRequest", rowValueChanged: "rowValueChanged", cellEditingStarted: "cellEditingStarted", cellEditingStopped: "cellEditingStopped", rowEditingStarted: "rowEditingStarted", rowEditingStopped: "rowEditingStopped", undoStarted: "undoStarted", undoEnded: "undoEnded", redoStarted: "redoStarted", redoEnded: "redoEnded", rangeDeleteStart: "rangeDeleteStart", rangeDeleteEnd: "rangeDeleteEnd", filterOpened: "filterOpened", filterChanged: "filterChanged", filterModified: "filterModified", advancedFilterBuilderVisibleChanged: "advancedFilterBuilderVisibleChanged", chartCreated: "chartCreated", chartRangeSelectionChanged: "chartRangeSelectionChanged", chartOptionsChanged: "chartOptionsChanged", chartDestroyed: "chartDestroyed", cellKeyDown: "cellKeyDown", gridReady: "gridReady", gridPreDestroyed: "gridPreDestroyed", firstDataRendered: "firstDataRendered", gridSizeChanged: "gridSizeChanged", modelUpdated: "modelUpdated", virtualRowRemoved: "virtualRowRemoved", viewportChanged: "viewportChanged", bodyScroll: "bodyScroll", bodyScrollEnd: "bodyScrollEnd", dragStarted: "dragStarted", dragStopped: "dragStopped", stateUpdated: "stateUpdated", paginationChanged: "paginationChanged", rowDragEnter: "rowDragEnter", rowDragMove: "rowDragMove", rowDragLeave: "rowDragLeave", rowDragEnd: "rowDragEnd", columnRowGroupChanged: "columnRowGroupChanged", rowGroupOpened: "rowGroupOpened", expandOrCollapseAll: "expandOrCollapseAll", pivotMaxColumnsExceeded: "pivotMaxColumnsExceeded", pinnedRowDataChanged: "pinnedRowDataChanged", rowDataUpdated: "rowDataUpdated", asyncTransactionsFlushed: "asyncTransactionsFlushed", storeRefreshed: "storeRefreshed", cellClicked: "cellClicked", cellDoubleClicked: "cellDoubleClicked", cellFocused: "cellFocused", cellMouseOver: "cellMouseOver", cellMouseOut: "cellMouseOut", cellMouseDown: "cellMouseDown", rowClicked: "rowClicked", rowDoubleClicked: "rowDoubleClicked", rowSelected: "rowSelected", selectionChanged: "selectionChanged", cellContextMenu: "cellContextMenu", rangeSelectionChanged: "rangeSelectionChanged", tooltipShow: "tooltipShow", tooltipHide: "tooltipHide", sortChanged: "sortChanged", columnRowGroupChangeRequest: "columnRowGroupChangeRequest", columnPivotChangeRequest: "columnPivotChangeRequest", columnValueChangeRequest: "columnValueChangeRequest", columnAggFuncChangeRequest: "columnAggFuncChangeRequest" }, providers: [
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
            }], columnMenu: [{
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
            }], tooltipShowMode: [{
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
            }], chartMenuItems: [{
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
            }], pivotMaxGeneratedColumns: [{
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
            }], cellFlashDuration: [{
                type: Input
            }], cellFlashDelay: [{
                type: Input
            }], cellFadeDuration: [{
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
            }], serverSideEnableClientSideSort: [{
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
            }], suppressHeaderFocus: [{
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
            }], columnMenuVisibleChanged: [{
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
            }], pivotMaxColumnsExceeded: [{
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUVILFNBQVMsRUFFVCxZQUFZLEVBQ1osS0FBSyxFQUlMLE1BQU0sRUFFTixpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQVcsU0FBUyxFQUFtQyxVQUFVLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQTJLOUgsZ0JBQWdCO0FBRWhCLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxNQUFNLG9DQUFvQyxDQUFDOzs7O0FBYXRGLE1BQU0sT0FBTyxhQUFhO0lBb0J0QixZQUFZLFVBQXNCLEVBQ3RCLGdCQUFrQyxFQUNsQyx5QkFBb0QsRUFDcEQseUJBQTJEO1FBRjNELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBbkIvRCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSTNCLDBEQUEwRDtRQUNsRCxnQkFBVyxHQUF1QixTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBK0hsRSxVQUFVO1FBQ1Y7ZUFDTztRQUNTLGNBQVMsR0FBb0QsU0FBUyxDQUFDO1FBQ3ZGO2VBQ087UUFDUyxZQUFPLEdBQWdFLFNBQVMsQ0FBQztRQUNqRzs7ZUFFTztRQUNTLHdCQUFtQixHQUF3QixTQUFTLENBQUM7UUFDckU7OztlQUdPO1FBQ1MsZ0NBQTJCLEdBQXdCLFNBQVMsQ0FB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VztzQkFBM0IsTUFBTTtnQkFFVSxXQUFXO3NCQUEzQixNQUFNO2dCQUdVLFdBQVc7c0JBQTNCLE1BQU07Z0JBRVUsMkJBQTJCO3NCQUEzQyxNQUFNO2dCQUVVLHdCQUF3QjtzQkFBeEMsTUFBTTtnQkFFVSx3QkFBd0I7c0JBQXhDLE1BQU07Z0JBRVUsMEJBQTBCO3NCQUExQyxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBBZnRlclZpZXdJbml0LFxuICAgIENvbXBvbmVudCxcbiAgICBFbGVtZW50UmVmLFxuICAgIEV2ZW50RW1pdHRlcixcbiAgICBJbnB1dCxcbiAgICBOZ1pvbmUsXG4gICAgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveSxcbiAgICBPdXRwdXQsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuXG5pbXBvcnQgeyBBZ1Byb21pc2UsIENvbXBvbmVudFV0aWwsIEdyaWRBcGksIENvbHVtbkFwaSwgR3JpZE9wdGlvbnMsIEdyaWRQYXJhbXMsIE1vZHVsZSwgY3JlYXRlR3JpZCB9IGZyb20gXCJhZy1ncmlkLWNvbW11bml0eVwiO1xuXG4vLyBAU1RBUlRfSU1QT1JUU0BcbmltcG9ydCB7XG4gICAgQWR2YW5jZWRGaWx0ZXJCdWlsZGVyVmlzaWJsZUNoYW5nZWRFdmVudCxcbiAgICBBZHZhbmNlZEZpbHRlck1vZGVsLFxuICAgIEFnQ2hhcnRUaGVtZSxcbiAgICBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMsXG4gICAgQWxpZ25lZEdyaWQsXG4gICAgQXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkLFxuICAgIEJvZHlTY3JvbGxFbmRFdmVudCxcbiAgICBCb2R5U2Nyb2xsRXZlbnQsXG4gICAgQ2VsbENsaWNrZWRFdmVudCxcbiAgICBDZWxsQ29udGV4dE1lbnVFdmVudCxcbiAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxFZGl0UmVxdWVzdEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIENlbGxGb2N1c2VkRXZlbnQsXG4gICAgQ2VsbEtleURvd25FdmVudCxcbiAgICBDZWxsTW91c2VEb3duRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3V0RXZlbnQsXG4gICAgQ2VsbE1vdXNlT3ZlckV2ZW50LFxuICAgIENlbGxQb3NpdGlvbixcbiAgICBDZWxsVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ2hhcnRDcmVhdGVkLFxuICAgIENoYXJ0RGVzdHJveWVkLFxuICAgIENoYXJ0T3B0aW9uc0NoYW5nZWQsXG4gICAgQ2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQsXG4gICAgQ2hhcnRSZWZQYXJhbXMsXG4gICAgQ2hhcnRUb29sUGFuZWxzRGVmLFxuICAgIENvbERlZixcbiAgICBDb2xHcm91cERlZixcbiAgICBDb2xUeXBlRGVmLFxuICAgIENvbHVtbixcbiAgICBDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uR3JvdXBPcGVuZWRFdmVudCxcbiAgICBDb2x1bW5IZWFkZXJDbGlja2VkRXZlbnQsXG4gICAgQ29sdW1uSGVhZGVyQ29udGV4dE1lbnVFdmVudCxcbiAgICBDb2x1bW5IZWFkZXJNb3VzZUxlYXZlRXZlbnQsXG4gICAgQ29sdW1uSGVhZGVyTW91c2VPdmVyRXZlbnQsXG4gICAgQ29sdW1uTWVudVZpc2libGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uTW92ZWRFdmVudCxcbiAgICBDb2x1bW5QaW5uZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZVJlcXVlc3RFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uUmVzaXplZEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlUmVxdWVzdEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZpc2libGVFdmVudCxcbiAgICBDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudCxcbiAgICBDc3ZFeHBvcnRQYXJhbXMsXG4gICAgQ3V0RW5kRXZlbnQsXG4gICAgQ3V0U3RhcnRFdmVudCxcbiAgICBEYXRhVHlwZURlZmluaXRpb24sXG4gICAgRGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBEb21MYXlvdXRUeXBlLFxuICAgIERyYWdTdGFydGVkRXZlbnQsXG4gICAgRHJhZ1N0b3BwZWRFdmVudCxcbiAgICBFeGNlbEV4cG9ydFBhcmFtcyxcbiAgICBFeGNlbFN0eWxlLFxuICAgIEV4cGFuZENvbGxhcHNlQWxsRXZlbnQsXG4gICAgRmlsbE9wZXJhdGlvblBhcmFtcyxcbiAgICBGaWx0ZXJDaGFuZ2VkRXZlbnQsXG4gICAgRmlsdGVyTW9kaWZpZWRFdmVudCxcbiAgICBGaWx0ZXJPcGVuZWRFdmVudCxcbiAgICBGaXJzdERhdGFSZW5kZXJlZEV2ZW50LFxuICAgIEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQsXG4gICAgR2V0Q2hhcnRNZW51SXRlbXMsXG4gICAgR2V0Q2hhcnRUb29sYmFySXRlbXMsXG4gICAgR2V0Q29udGV4dE1lbnVJdGVtcyxcbiAgICBHZXREYXRhUGF0aCxcbiAgICBHZXRHcm91cFJvd0FnZ1BhcmFtcyxcbiAgICBHZXRMb2NhbGVUZXh0UGFyYW1zLFxuICAgIEdldE1haW5NZW51SXRlbXMsXG4gICAgR2V0Um93SWRGdW5jLFxuICAgIEdldFNlcnZlclNpZGVHcm91cEtleSxcbiAgICBHZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc1BhcmFtcyxcbiAgICBHcmlkQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBHcmlkUHJlRGVzdHJveWVkRXZlbnQsXG4gICAgR3JpZFJlYWR5RXZlbnQsXG4gICAgR3JpZFNpemVDaGFuZ2VkRXZlbnQsXG4gICAgR3JpZFN0YXRlLFxuICAgIEhlYWRlclBvc2l0aW9uLFxuICAgIElBZHZhbmNlZEZpbHRlckJ1aWxkZXJQYXJhbXMsXG4gICAgSUFnZ0Z1bmMsXG4gICAgSURhdGFzb3VyY2UsXG4gICAgSVJvd0RyYWdJdGVtLFxuICAgIElSb3dOb2RlLFxuICAgIElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSxcbiAgICBJVmlld3BvcnREYXRhc291cmNlLFxuICAgIEluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvclBhcmFtcyxcbiAgICBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uLFxuICAgIElzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50UGFyYW1zLFxuICAgIElzRnVsbFdpZHRoUm93UGFyYW1zLFxuICAgIElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIElzUm93RmlsdGVyYWJsZSxcbiAgICBJc1Jvd01hc3RlcixcbiAgICBJc1Jvd1NlbGVjdGFibGUsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXAsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIExvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMsXG4gICAgTWVudUl0ZW1EZWYsXG4gICAgTW9kZWxVcGRhdGVkRXZlbnQsXG4gICAgTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zLFxuICAgIE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIE5ld0NvbHVtbnNMb2FkZWRFdmVudCxcbiAgICBQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXMsXG4gICAgUGFzdGVFbmRFdmVudCxcbiAgICBQYXN0ZVN0YXJ0RXZlbnQsXG4gICAgUGlubmVkUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBQaXZvdE1heENvbHVtbnNFeGNlZWRlZEV2ZW50LFxuICAgIFBvc3RQcm9jZXNzUG9wdXBQYXJhbXMsXG4gICAgUG9zdFNvcnRSb3dzUGFyYW1zLFxuICAgIFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtcyxcbiAgICBQcm9jZXNzR3JvdXBIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzUm93UGFyYW1zLFxuICAgIFByb2Nlc3NVbnBpbm5lZENvbHVtbnNQYXJhbXMsXG4gICAgUmFuZ2VEZWxldGVFbmRFdmVudCxcbiAgICBSYW5nZURlbGV0ZVN0YXJ0RXZlbnQsXG4gICAgUmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgUmVkb0VuZGVkRXZlbnQsXG4gICAgUmVkb1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dDbGFzc1J1bGVzLFxuICAgIFJvd0NsaWNrZWRFdmVudCxcbiAgICBSb3dEYXRhVXBkYXRlZEV2ZW50LFxuICAgIFJvd0RvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBSb3dEcmFnRXZlbnQsXG4gICAgUm93RWRpdGluZ1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIFJvd0dyb3VwT3BlbmVkRXZlbnQsXG4gICAgUm93R3JvdXBpbmdEaXNwbGF5VHlwZSxcbiAgICBSb3dIZWlnaHRQYXJhbXMsXG4gICAgUm93TW9kZWxUeXBlLFxuICAgIFJvd1NlbGVjdGVkRXZlbnQsXG4gICAgUm93U3R5bGUsXG4gICAgUm93VmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgU2VsZWN0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIFNlbmRUb0NsaXBib2FyZFBhcmFtcyxcbiAgICBTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtcyxcbiAgICBTaWRlQmFyRGVmLFxuICAgIFNpemVDb2x1bW5zVG9Db250ZW50U3RyYXRlZ3ksXG4gICAgU2l6ZUNvbHVtbnNUb0ZpdEdyaWRTdHJhdGVneSxcbiAgICBTaXplQ29sdW1uc1RvRml0UHJvdmlkZWRXaWR0aFN0cmF0ZWd5LFxuICAgIFNvcnRDaGFuZ2VkRXZlbnQsXG4gICAgU29ydERpcmVjdGlvbixcbiAgICBTdGF0ZVVwZGF0ZWRFdmVudCxcbiAgICBTdGF0dXNQYW5lbERlZixcbiAgICBTdG9yZVJlZnJlc2hlZEV2ZW50LFxuICAgIFRhYlRvTmV4dENlbGxQYXJhbXMsXG4gICAgVGFiVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIFRvb2xQYW5lbFNpemVDaGFuZ2VkRXZlbnQsXG4gICAgVG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudCxcbiAgICBUb29sdGlwSGlkZUV2ZW50LFxuICAgIFRvb2x0aXBTaG93RXZlbnQsXG4gICAgVHJlZURhdGFEaXNwbGF5VHlwZSxcbiAgICBVbmRvRW5kZWRFdmVudCxcbiAgICBVbmRvU3RhcnRlZEV2ZW50LFxuICAgIFVzZUdyb3VwRm9vdGVyLFxuICAgIFZpZXdwb3J0Q2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIFZpcnR1YWxSb3dSZW1vdmVkRXZlbnRcbn0gZnJvbSBcImFnLWdyaWQtY29tbXVuaXR5XCI7XG4vLyBARU5EX0lNUE9SVFNAXG5cbmltcG9ydCB7IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgfSBmcm9tIFwiLi9hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzXCI7XG5pbXBvcnQgeyBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlciB9IGZyb20gXCIuL2FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyXCI7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYWctZ3JpZC1hbmd1bGFyJyxcbiAgICBzdGFuZGFsb25lOiB0cnVlLFxuICAgIHRlbXBsYXRlOiAnJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJcbiAgICBdLFxuICAgIC8vIHRlbGwgYW5ndWxhciB3ZSBkb24ndCB3YW50IHZpZXcgZW5jYXBzdWxhdGlvbiwgd2UgZG9uJ3Qgd2FudCBhIHNoYWRvdyByb290XG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxufSlcbmV4cG9ydCBjbGFzcyBBZ0dyaWRBbmd1bGFyPFREYXRhID0gYW55LCBUQ29sRGVmIGV4dGVuZHMgQ29sRGVmPFREYXRhPiA9IENvbERlZjxhbnk+PiBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgICAvLyBub3QgaW50ZW5kZWQgZm9yIHVzZXIgdG8gaW50ZXJhY3Qgd2l0aC4gc28gcHV0dGluZyBfIGluIHNvIGlmIHVzZXIgZ2V0cyByZWZlcmVuY2VcbiAgICAvLyB0byB0aGlzIG9iamVjdCwgdGhleSBraW5kJ2Ega25vdyBpdCdzIG5vdCBwYXJ0IG9mIHRoZSBhZ3JlZWQgaW50ZXJmYWNlXG4gICAgcHJpdmF0ZSBfbmF0aXZlRWxlbWVudDogYW55O1xuICAgIHByaXZhdGUgX2luaXRpYWxpc2VkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGdyaWRQYXJhbXM6IEdyaWRQYXJhbXM7XG5cbiAgICAvLyBpbiBvcmRlciB0byBlbnN1cmUgZmlyaW5nIG9mIGdyaWRSZWFkeSBpcyBkZXRlcm1pbmlzdGljXG4gICAgcHJpdmF0ZSBfZnVsbHlSZWFkeTogQWdQcm9taXNlPGJvb2xlYW4+ID0gQWdQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cbiAgICAvKiogR3JpZCBBcGkgYXZhaWxhYmxlIGFmdGVyIG9uR3JpZFJlYWR5IGV2ZW50IGhhcyBmaXJlZC4gKi9cbiAgICBwdWJsaWMgYXBpOiBHcmlkQXBpPFREYXRhPjtcbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCB2MzEgLSBUaGUgYGNvbHVtbkFwaWAgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgYWxsIHRoZSBtZXRob2RzIGFyZSBub3cgcHJlc2VudCBvZiB0aGUgYGFwaWAuXG4gICAgICogUGxlYXNlIHVzZSB0aGUgYGFwaWAgaW5zdGVhZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29sdW1uQXBpOiBDb2x1bW5BcGk7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgYW5ndWxhckZyYW1ld29ya092ZXJyaWRlczogQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgICkge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuICAgIH1cblxuXG4gICAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgICAgLy8gUnVuIHRoZSBzZXR1cCBvdXRzaWRlIG9mIGFuZ3VsYXIgc28gYWxsIHRoZSBldmVudCBoYW5kbGVycyB0aGF0IGFyZSBjcmVhdGVkIGRvIG5vdCB0cmlnZ2VyIGNoYW5nZSBkZXRlY3Rpb25cbiAgICAgIHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5mcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyLnNldFZpZXdDb250YWluZXJSZWYodGhpcy52aWV3Q29udGFpbmVyUmVmLCB0aGlzLmFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMpO1xuICAgICAgICAgIGNvbnN0IG1lcmdlZEdyaWRPcHMgPSBDb21wb25lbnRVdGlsLmNvbWJpbmVBdHRyaWJ1dGVzQW5kR3JpZE9wdGlvbnModGhpcy5ncmlkT3B0aW9ucywgdGhpcyk7XG5cbiAgICAgICAgICB0aGlzLmdyaWRQYXJhbXMgPSB7XG4gICAgICAgICAgICAgICBnbG9iYWxFdmVudExpc3RlbmVyOiB0aGlzLmdsb2JhbEV2ZW50TGlzdGVuZXIuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgIGZyYW1ld29ya092ZXJyaWRlczogdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgICAgcHJvdmlkZWRCZWFuSW5zdGFuY2VzOiB7XG4gICAgICAgICAgICAgICAgICAgIGZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXI6IHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlcixcbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICBtb2R1bGVzOiAodGhpcy5tb2R1bGVzIHx8IFtdKSBhcyBhbnksXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGNvbnN0IGFwaSA9IGNyZWF0ZUdyaWQodGhpcy5fbmF0aXZlRWxlbWVudCwgbWVyZ2VkR3JpZE9wcywgdGhpcy5ncmlkUGFyYW1zKTtcbiAgICAgICAgICBpZiAoYXBpKSB7XG4gICAgICAgICAgICAgICB0aGlzLmFwaSA9IGFwaTtcbiAgICAgICAgICAgICAgIHRoaXMuY29sdW1uQXBpID0gbmV3IENvbHVtbkFwaShhcGkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEZvciBSeEpzIGNvbXBhdGliaWxpdHkgd2UgbmVlZCB0byBjaGVjayBmb3Igb2JzZXJ2ZWQgdjcrIG9yIG9ic2VydmVycyB2NlxuICAgICAgICAgIGNvbnN0IGdyaWRQcmVEZXN0cm95ZWRFbWl0dGVyID0gdGhpcy5ncmlkUHJlRGVzdHJveWVkIGFzIGFueTtcbiAgICAgICAgICBpZiAoZ3JpZFByZURlc3Ryb3llZEVtaXR0ZXIub2JzZXJ2ZWQgPz8gZ3JpZFByZURlc3Ryb3llZEVtaXR0ZXIub2JzZXJ2ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgJ0FHIEdyaWQ6IGdyaWRQcmVEZXN0cm95ZWQgZXZlbnQgbGlzdGVuZXIgcmVnaXN0ZXJlZCB2aWEgKGdyaWRQcmVEZXN0cm95ZWQpPVwibWV0aG9kKCRldmVudClcIiB3aWxsIGJlIGlnbm9yZWQhICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdQbGVhc2UgYXNzaWduIHZpYSBncmlkT3B0aW9ucy5ncmlkUHJlRGVzdHJveWVkIGFuZCBwYXNzIHRvIHRoZSBncmlkIGFzIFtncmlkT3B0aW9uc109XCJncmlkT3B0aW9uc1wiJ1xuICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLl9pbml0aWFsaXNlZCA9IHRydWU7XG5cbiAgICAgICAgICAvLyBzb21ldGltZXMsIGVzcGVjaWFsbHkgaW4gbGFyZ2UgY2xpZW50IGFwcHMgZ3JpZFJlYWR5IGNhbiBmaXJlIGJlZm9yZSBuZ0FmdGVyVmlld0luaXRcbiAgICAgICAgICAvLyB0aGlzIHRpZXMgdGhlc2UgdG9nZXRoZXIgc28gdGhhdCBncmlkUmVhZHkgd2lsbCBhbHdheXMgZmlyZSBhZnRlciBhZ0dyaWRBbmd1bGFyJ3MgbmdBZnRlclZpZXdJbml0XG4gICAgICAgICAgLy8gdGhlIGFjdHVhbCBjb250YWluaW5nIGNvbXBvbmVudCdzIG5nQWZ0ZXJWaWV3SW5pdCB3aWxsIGZpcmUganVzdCBhZnRlciBhZ0dyaWRBbmd1bGFyJ3NcbiAgICAgICAgICB0aGlzLl9mdWxseVJlYWR5LnJlc29sdmVOb3cobnVsbCwgKHJlc29sdmUpID0+IHJlc29sdmUpO1xuICAgICAgIH0pO1xuICAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkNoYW5nZXMoY2hhbmdlczogYW55KTogdm9pZCB7XG4gICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgICAgIC8vIFJ1biB0aGUgY2hhbmdlcyBvdXRzaWRlIG9mIGFuZ3VsYXIgc28gYW55IGV2ZW50IGhhbmRsZXJzIHRoYXQgYXJlIGNyZWF0ZWQgZG8gbm90IHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvblxuICAgICAgICAgICAgIHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgIGNvbnN0IGdyaWRPcHRpb25zOiBHcmlkT3B0aW9ucyA9IHt9O1xuICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhjaGFuZ2VzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV06IFtzdHJpbmcsIGFueV0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgIGdyaWRPcHRpb25zW2tleSBhcyBrZXlvZiBHcmlkT3B0aW9uc10gPSB2YWx1ZS5jdXJyZW50VmFsdWU7XG4gICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICBDb21wb25lbnRVdGlsLnByb2Nlc3NPbkNoYW5nZShncmlkT3B0aW9ucywgdGhpcy5hcGkpO1xuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIHRoZSBkZXN0cm95LCBzbyB3ZSBrbm93IG5vdCB0byBlbWl0IGFueSBldmVudHNcbiAgICAgICAgICAgIC8vIHdoaWxlIHRlYXJpbmcgZG93biB0aGUgZ3JpZC5cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICAgLy8gY291bGQgYmUgbnVsbCBpZiBncmlkIGZhaWxlZCB0byBpbml0aWFsaXNlXG4gICAgICAgICAgICAgdGhpcy5hcGk/LmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdlJ2xsIGVtaXQgdGhlIGVtaXQgaWYgYSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgYSBnaXZlbiBldmVudCBlaXRoZXIgb24gdGhlIGNvbXBvbmVudCB2aWEgbm9ybWFsIGFuZ3VsYXIgYmluZGluZ1xuICAgIC8vIG9yIHZpYSBncmlkT3B0aW9uc1xuICAgIHByb3RlY3RlZCBpc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgLy8gRm9yIFJ4SnMgY29tcGF0aWJpbGl0eSB3ZSBuZWVkIHRvIGNoZWNrIGZvciBvYnNlcnZlZCB2Nysgb3Igb2JzZXJ2ZXJzIHY2XG4gICAgICAgIGNvbnN0IGVtaXR0ZXJBbnkgPSBlbWl0dGVyIGFzIGFueTtcbiAgICAgICAgY29uc3QgaGFzRW1pdHRlciA9IGVtaXR0ZXJBbnk/Lm9ic2VydmVkID8/IGVtaXR0ZXJBbnk/Lm9ic2VydmVycz8ubGVuZ3RoID4gMDtcblxuICAgICAgICAvLyBncmlkUmVhZHkgPT4gb25HcmlkUmVhZHlcbiAgICAgICAgY29uc3QgYXNFdmVudE5hbWUgPSBgb24ke2V2ZW50VHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKX0ke2V2ZW50VHlwZS5zdWJzdHJpbmcoMSl9YFxuICAgICAgICBjb25zdCBoYXNHcmlkT3B0aW9uTGlzdGVuZXIgPSAhIXRoaXMuZ3JpZE9wdGlvbnMgJiYgISEodGhpcy5ncmlkT3B0aW9ucyBhcyBhbnkpW2FzRXZlbnROYW1lXTtcblxuICAgICAgICByZXR1cm4gaGFzRW1pdHRlciB8fCBoYXNHcmlkT3B0aW9uTGlzdGVuZXI7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50VHlwZTogc3RyaW5nLCBldmVudDogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSB0ZWFyaW5nIGRvd24sIGRvbid0IGVtaXQgYW5ndWxhciBldmVudHMsIGFzIHRoaXMgY2F1c2VzXG4gICAgICAgIC8vIHByb2JsZW1zIHdpdGggdGhlIGFuZ3VsYXIgcm91dGVyXG4gICAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdlbmVyaWNhbGx5IGxvb2sgdXAgdGhlIGV2ZW50VHlwZVxuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIGlmIChlbWl0dGVyICYmIHRoaXMuaXNFbWl0dGVyVXNlZChldmVudFR5cGUpKSB7XG5cbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBlbWl0IHdpdGhpbiB0aGUgYW5ndWxhciB6b25lLCBzbyBjaGFuZ2UgZGV0ZWN0aW9uIHdvcmtzIHByb3Blcmx5XG4gICAgICAgICAgICBjb25zdCBmaXJlRW1pdHRlciA9ICgpID0+IHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5ydW5JbnNpZGVBbmd1bGFyKCgpID0+IGVtaXR0ZXIuZW1pdChldmVudCkpO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09PSAnZ3JpZFJlYWR5Jykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgZ3JpZFJlYWR5LCB3YWl0IGZvciBuZ0FmdGVyVmlld0luaXQgdG8gZmlyZSBmaXJzdCwgdGhlbiBlbWl0IHRoZW4gZ3JpZFJlYWR5IGV2ZW50XG4gICAgICAgICAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS50aGVuKCgpID0+IGZpcmVFbWl0dGVyKCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJlRW1pdHRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgIC8qKiBQcm92aWRlZCBhbiBpbml0aWFsIGdyaWRPcHRpb25zIGNvbmZpZ3VyYXRpb24gdG8gdGhlIGNvbXBvbmVudC4gSWYgYSBwcm9wZXJ0eSBpcyBzcGVjaWZpZWQgaW4gYm90aCBncmlkT3B0aW9ucyBhbmQgdmlhIGNvbXBvbmVudCBiaW5kaW5nIHRoZSBjb21wb25lbnQgYmluZGluZyB0YWtlcyBwcmVjZWRlbmNlLiAgKi9cbiAgICAgQElucHV0KCkgcHVibGljIGdyaWRPcHRpb25zOiBHcmlkT3B0aW9uczxURGF0YT4gfCB1bmRlZmluZWQ7XG4gICAgIC8qKlxuICAgICAqIFVzZWQgdG8gcmVnaXN0ZXIgQUcgR3JpZCBNb2R1bGVzIGRpcmVjdGx5IHdpdGggdGhpcyBpbnN0YW5jZSBvZiB0aGUgZ3JpZC5cbiAgICAgKiBTZWUgW1Byb3ZpZGluZyBNb2R1bGVzIFRvIEluZGl2aWR1YWwgR3JpZHNdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2FuZ3VsYXItZGF0YS1ncmlkL21vZHVsZXMvI3Byb3ZpZGluZy1tb2R1bGVzLXRvLWluZGl2aWR1YWwtZ3JpZHMpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqL1xuICAgICBASW5wdXQoKSBwdWJsaWMgbW9kdWxlczogTW9kdWxlW10gfCB1bmRlZmluZWQ7XG5cbiAgICAvLyBAU1RBUlRAXG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc3RhdHVzIGJhciBjb21wb25lbnRzIHRvIHVzZSBpbiB0aGUgc3RhdHVzIGJhci5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN0YXR1c0JhcjogeyBzdGF0dXNQYW5lbHM6IFN0YXR1c1BhbmVsRGVmW107IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc2lkZSBiYXIgY29tcG9uZW50cy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNpZGVCYXI6IFNpZGVCYXJEZWYgfCBzdHJpbmcgfCBzdHJpbmdbXSB8IGJvb2xlYW4gfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzaG93IHRoZSBjb250ZXh0IG1lbnUuIFVzZSBpZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGRlZmF1bHQgJ3JpZ2h0IGNsaWNrJyBjb250ZXh0IG1lbnUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGBzdXBwcmVzc0NvbnRleHRNZW51YCwgeW91IGNhbiB1c2UgdGhlIGBvbkNlbGxDb250ZXh0TWVudWAgZnVuY3Rpb24gdG8gcHJvdmlkZSB5b3VyIG93biBjb2RlIHRvIGhhbmRsZSBjZWxsIGBjb250ZXh0bWVudWAgZXZlbnRzLlxuICAgICAgICAgKiBUaGlzIGZsYWcgaXMgdXNlZnVsIHRvIHByZXZlbnQgdGhlIGJyb3dzZXIgZnJvbSBzaG93aW5nIGl0cyBkZWZhdWx0IGNvbnRleHQgbWVudS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNvbnRleHQgbWVudSB0byBzaG93LCBldmVuIHdoZW4gYEN0cmxgIGtleSBpcyBoZWxkIGRvd24uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENoYW5nZXMgdGhlIGRpc3BsYXkgdHlwZSBvZiB0aGUgY29sdW1uIG1lbnUuXG4gICAgICAgICAqIGAnbmV3J2AganVzdCBkaXNwbGF5cyB0aGUgbWFpbiBsaXN0IG9mIG1lbnUgaXRlbXMuIGAnbGVnYWN5J2AgZGlzcGxheXMgYSB0YWJiZWQgbWVudS5cbiAgICAgICAgICogQGRlZmF1bHQgJ2xlZ2FjeSdcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbk1lbnU6ICdsZWdhY3knIHwgJ25ldycgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIHNob3cgdGhlIGNvbHVtbiBtZW51IGJ1dHRvbiwgcmF0aGVyIHRoYW4gb25seSBzaG93aW5nIHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGNvbHVtbiBoZWFkZXIuXG4gICAgICAgICAqIElmIGBjb2x1bW5NZW51ID0gJ25ldydgLCB0aGlzIHdpbGwgZGVmYXVsdCB0byBgdHJ1ZWAgaW5zdGVhZCBvZiBgZmFsc2VgLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNZW51SGlkZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB1c2UgdGhlIGJyb3dzZXIncyBkZWZhdWx0IHRvb2x0aXAgaW5zdGVhZCBvZiB1c2luZyB0aGUgZ3JpZCdzIFRvb2x0aXAgQ29tcG9uZW50LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQnJvd3NlclRvb2x0aXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgdHJpZ2dlciB0aGF0IHdpbGwgY2F1c2UgdG9vbHRpcHMgdG8gc2hvdyBhbmQgaGlkZS5cbiAgICAgICAgICogIC0gYGhvdmVyYCAtIFRoZSB0b29sdGlwIHdpbGwgc2hvdy9oaWRlIHdoZW4gYSBjZWxsL2hlYWRlciBpcyBob3ZlcmVkLlxuICAgICAgICAgKiAgLSBgZm9jdXNgIC0gVGhlIHRvb2x0aXAgd2lsbCBzaG93L2hpZGUgd2hlbiBhIGNlbGwvaGVhZGVyIGlzIGZvY3VzZWQuXG4gICAgICAgICAqIEBkZWZhdWx0ICdob3ZlcidcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBUcmlnZ2VyOiAnaG92ZXInIHwgJ2ZvY3VzJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyB0aGF0IGl0IHRha2VzIGZvciB0b29sdGlwcyB0byBzaG93IHVwIG9uY2UgYW4gZWxlbWVudCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgICAgICAqICAgICAqKk5vdGU6KiogVGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCB3b3JrIGlmIGBlbmFibGVCcm93c2VyVG9vbHRpcHNgIGlzIGB0cnVlYC5cbiAgICAgICAgICogQGRlZmF1bHQgMjAwMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFNob3dEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIHRoYXQgaXQgdGFrZXMgZm9yIHRvb2x0aXBzIHRvIGhpZGUgb25jZSB0aGV5IGhhdmUgYmVlbiBkaXNwbGF5ZWQuXG4gICAgICAgICAqICAgICAqKk5vdGU6KiogVGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCB3b3JrIGlmIGBlbmFibGVCcm93c2VyVG9vbHRpcHNgIGlzIGB0cnVlYCBhbmQgYHRvb2x0aXBIaWRlVHJpZ2dlcnNgIGluY2x1ZGVzIGB0aW1lb3V0YC5cbiAgICAgICAgICogQGRlZmF1bHQgMTAwMDBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBIaWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRvb2x0aXBzIGZvbGxvdyB0aGUgY3Vyc29yIG9uY2UgdGhleSBhcmUgZGlzcGxheWVkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoaXMgZGVmaW5lcyB3aGVuIHRvb2x0aXAgd2lsbCBzaG93IHVwIGZvciBDZWxscywgSGVhZGVycyBhbmQgU2V0RmlsdGVyIEl0ZW1zLlxuICAgICAgICAgKiAgLSBgc3RhbmRhcmRgIC0gVGhlIHRvb2x0aXAgYWx3YXlzIHNob3dzIHVwIHdoZW4gdGhlIGl0ZW1zIGNvbmZpZ3VyZWQgd2l0aCBUb29sdGlwcyBhcmUgaG92ZXJlZC5cbiAgICAgICAgICogLSBgd2hlblRydW5jYXRlZGAgLSBUaGUgdG9vbHRpcCB3aWxsIG9ubHkgYmUgZGlzcGxheWVkIHdoZW4gdGhlIGl0ZW1zIGhvdmVyZWQgaGF2ZSB0cnVuY2F0ZWQgKHNob3dpbmcgZWxsaXBzaXMpIHZhbHVlcy4gVGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCB3b3JrIHdoZW4gYGVuYWJsZUJyb3dzZXJUb29sdGlwcz17dHJ1ZX1gLlxuICAgICAgICAgKiBAZGVmYXVsdCBgc3RhbmRhcmRgXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwU2hvd01vZGU6ICdzdGFuZGFyZCcgfCAnd2hlblRydW5jYXRlZCcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRvb2x0aXAgaW50ZXJhY3Rpb24uIFdoZW4gdGhpcyBvcHRpb24gaXMgZW5hYmxlZCwgdGhlIHRvb2x0aXAgd2lsbCBub3QgaGlkZSB3aGlsZSB0aGVcbiAgICAgICAgICogdG9vbHRpcCBpdHNlbGYgaXQgYmVpbmcgaG92ZXJlZCBvciBoYXMgZm9jdXMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0b29sdGlwSW50ZXJhY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERPTSBlbGVtZW50IHRvIHVzZSBhcyB0aGUgcG9wdXAgcGFyZW50IGZvciBncmlkIHBvcHVwcyAoY29udGV4dCBtZW51LCBjb2x1bW4gbWVudSBldGMpLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9wdXBQYXJlbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgZ3JvdXAgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29weUdyb3VwSGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTcGVjaWZ5IHRoZSBkZWxpbWl0ZXIgdG8gdXNlIHdoZW4gY29weWluZyB0byBjbGlwYm9hcmQuXG4gICAgICAgICAqIEBkZWZhdWx0ICdcXHQnXG4gICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNsaXBib2FyZERlbGltaXRlcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvcHkgdGhlIGNlbGwgcmFuZ2Ugb3IgZm9jdXNlZCBjZWxsIHRvIHRoZSBjbGlwYm9hcmQgYW5kIG5ldmVyIHRoZSBzZWxlY3RlZCByb3dzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvcHkgcm93cyBpbnN0ZWFkIG9mIHJhbmdlcyB3aGVuIGEgcmFuZ2Ugd2l0aCBvbmx5IGEgc2luZ2xlIGNlbGwgaXMgc2VsZWN0ZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlTaW5nbGVDZWxsUmFuZ2VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHdvcmsgYXJvdW5kIGEgYnVnIHdpdGggRXhjZWwgKFdpbmRvd3MpIHRoYXQgYWRkcyBhbiBleHRyYSBlbXB0eSBsaW5lIGF0IHRoZSBlbmQgb2YgcmFuZ2VzIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMYXN0RW1wdHlMaW5lT25QYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byB0dXJuIG9mZiBwYXN0ZSBvcGVyYXRpb25zIHdpdGhpbiB0aGUgZ3JpZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3RvcCB0aGUgZ3JpZCB0cnlpbmcgdG8gdXNlIHRoZSBDbGlwYm9hcmQgQVBJLCBpZiBpdCBpcyBibG9ja2VkLCBhbmQgaW1tZWRpYXRlbHkgZmFsbGJhY2sgdG8gdGhlIHdvcmthcm91bmQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZEFwaTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBibG9jayAgICAgKipjdXQqKiBvcGVyYXRpb25zIHdpdGhpbiB0aGUgZ3JpZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3V0VG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IG9mIENvbHVtbiAvIENvbHVtbiBHcm91cCBkZWZpbml0aW9ucy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnM6IChUQ29sRGVmIHwgQ29sR3JvdXBEZWY8VERhdGE+KVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uLiBJdGVtcyBkZWZpbmVkIGluIHRoZSBhY3R1YWwgY29sdW1uIGRlZmluaXRpb25zIGdldCBwcmVjZWRlbmNlLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVmYXVsdENvbERlZjogQ29sRGVmPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBncm91cCBkZWZpbml0aW9uLiBBbGwgY29sdW1uIGdyb3VwIGRlZmluaXRpb25zIHdpbGwgdXNlIHRoZXNlIHByb3BlcnRpZXMuIEl0ZW1zIGRlZmluZWQgaW4gdGhlIGFjdHVhbCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbiBnZXQgcHJlY2VkZW5jZS5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZjogUGFydGlhbDxDb2xHcm91cERlZjxURGF0YT4+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3QgbWFwIG9mIGN1c3RvbSBjb2x1bW4gdHlwZXMgd2hpY2ggY29udGFpbiBncm91cHMgb2YgcHJvcGVydGllcyB0aGF0IGNvbHVtbiBkZWZpbml0aW9ucyBjYW4gcmV1c2UgYnkgcmVmZXJlbmNpbmcgaW4gdGhlaXIgYHR5cGVgIHByb3BlcnR5LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uVHlwZXM6IHsgW2tleTogc3RyaW5nXTogQ29sVHlwZURlZjxURGF0YT47IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFuIG9iamVjdCBtYXAgb2YgY2VsbCBkYXRhIHR5cGVzIHRvIHRoZWlyIGRlZmluaXRpb25zLlxuICAgICAgICAgKiBDZWxsIGRhdGEgdHlwZXMgY2FuIGVpdGhlciBvdmVycmlkZS91cGRhdGUgdGhlIHByZS1kZWZpbmVkIGRhdGEgdHlwZXNcbiAgICAgICAgICogKGAndGV4dCdgLCBgJ251bWJlcidgLCAgYCdib29sZWFuJ2AsICBgJ2RhdGUnYCwgIGAnZGF0ZVN0cmluZydgIG9yICBgJ29iamVjdCdgKSxcbiAgICAgICAgICogb3IgY2FuIGJlIGN1c3RvbSBkYXRhIHR5cGVzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0YVR5cGVEZWZpbml0aW9uczoge1xuICAgICAgICBbY2VsbERhdGFUeXBlOiBzdHJpbmddOiBEYXRhVHlwZURlZmluaXRpb248VERhdGE+O1xuICAgIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEtlZXBzIHRoZSBvcmRlciBvZiBDb2x1bW5zIG1haW50YWluZWQgYWZ0ZXIgbmV3IENvbHVtbiBEZWZpbml0aW9ucyBhcmUgdXBkYXRlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlbiBkb3RzIGluIGZpZWxkIG5hbWVzIChlLmcuIGAnYWRkcmVzcy5maXJzdExpbmUnYCkgYXJlIG5vdCB0cmVhdGVkIGFzIGRlZXAgcmVmZXJlbmNlcy4gQWxsb3dzIHlvdSB0byB1c2UgZG90cyBpbiB5b3VyIGZpZWxkIG5hbWUgaWYgeW91IHByZWZlci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgY29sdW1uIGxhYmVsIGhlYWRlci4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyB0aGUgdGhlbWUgdmFsdWUgb2YgYGhlYWRlci1oZWlnaHRgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93cyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyB0aGUgZmxvYXRpbmcgZmlsdGVycy4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyB0aGUgdGhlbWUgdmFsdWUgb2YgYGhlYWRlci1oZWlnaHRgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGNvbHVtbnMgd2hlbiBpbiBwaXZvdCBtb2RlLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyBoZWFkZXIgY29sdW1uIGdyb3VwcyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGdyb3VwSGVhZGVySGVpZ2h0YC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90R3JvdXBIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3cgcmVvcmRlcmluZyBhbmQgcGlubmluZyBjb2x1bW5zIGJ5IGRyYWdnaW5nIGNvbHVtbnMgZnJvbSB0aGUgQ29sdW1ucyBUb29sIFBhbmVsIHRvIHRoZSBncmlkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3MgY29sdW1uIG1vdmluZywgaS5lLiB0byBtYWtlIHRoZSBjb2x1bW5zIGZpeGVkIHBvc2l0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZhYmxlQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgYGFnLWNvbHVtbi1tb3ZpbmdgIGNsYXNzIGlzIG5vdCBhZGRlZCB0byB0aGUgZ3JpZCB3aGlsZSBjb2x1bW5zIGFyZSBtb3ZpbmcuIEluIHRoZSBkZWZhdWx0IHRoZW1lcywgdGhpcyByZXN1bHRzIGluIG5vIGFuaW1hdGlvbiB3aGVuIG1vdmluZyBjb2x1bW5zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHdoZW4geW91IGRyYWcgYSBjb2x1bW4gb3V0IG9mIHRoZSBncmlkIChlLmcuIHRvIHRoZSBncm91cCB6b25lKSB0aGUgY29sdW1uIGlzIG5vdCBoaWRkZW4uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB3aGVuIHlvdSBkcmFnIGEgY29sdW1uIGludG8gYSByb3cgZ3JvdXAgcGFuZWwgdGhlIGNvbHVtbiBpcyBub3QgaGlkZGVuLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dHcm91cEhpZGVzQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnc2hpZnQnYCB0byBoYXZlIHNoaWZ0LXJlc2l6ZSBhcyB0aGUgZGVmYXVsdCByZXNpemUgb3BlcmF0aW9uIChzYW1lIGFzIHVzZXIgaG9sZGluZyBkb3duIGBTaGlmdGAgd2hpbGUgcmVzaXppbmcpLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sUmVzaXplRGVmYXVsdDogJ3NoaWZ0JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3NlcyBhdXRvLXNpemluZyBjb2x1bW5zIGZvciBjb2x1bW5zLiBJbiBvdGhlciB3b3JkcywgZG91YmxlIGNsaWNraW5nIGEgY29sdW1uJ3MgaGVhZGVyJ3MgZWRnZSB3aWxsIG5vdCBhdXRvLXNpemUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBOdW1iZXIgb2YgcGl4ZWxzIHRvIGFkZCB0byBhIGNvbHVtbiB3aWR0aCBhZnRlciB0aGUgW2F1dG8tc2l6aW5nXSguL2NvbHVtbi1zaXppbmcvI2F1dG8tc2l6ZS1jb2x1bW5zLXRvLWZpdC1jZWxsLWNvbnRlbnRzKSBjYWxjdWxhdGlvbi5cbiAgICAgICAgICogU2V0IHRoaXMgaWYgeW91IHdhbnQgdG8gYWRkIGV4dHJhIHJvb20gdG8gYWNjb21tb2RhdGUgKGZvciBleGFtcGxlKSBzb3J0IGljb25zLCBvciBzb21lIG90aGVyIGR5bmFtaWMgbmF0dXJlIG9mIHRoZSBoZWFkZXIuXG4gICAgICAgICAqIEBkZWZhdWx0IDIwXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2l6ZVBhZGRpbmc6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHNraXAgdGhlIGBoZWFkZXJOYW1lYCB3aGVuIGBhdXRvU2l6ZWAgaXMgY2FsbGVkIGJ5IGRlZmF1bHQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXV0by1zaXplIHRoZSBjb2x1bW5zIHdoZW4gdGhlIGdyaWQgaXMgbG9hZGVkLiBDYW4gc2l6ZSB0byBmaXQgdGhlIGdyaWQgd2lkdGgsIGZpdCBhIHByb3ZpZGVkIHdpZHRoLCBvciBmaXQgdGhlIGNlbGwgY29udGVudHMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2l6ZVN0cmF0ZWd5OiBTaXplQ29sdW1uc1RvRml0R3JpZFN0cmF0ZWd5IHwgU2l6ZUNvbHVtbnNUb0ZpdFByb3ZpZGVkV2lkdGhTdHJhdGVneSB8IFNpemVDb2x1bW5zVG9Db250ZW50U3RyYXRlZ3kgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIG9mIGNvbXBvbmVudCBuYW1lcyB0byBjb21wb25lbnRzLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29tcG9uZW50czogeyBbcDogc3RyaW5nXTogYW55OyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdmdWxsUm93J2AgdG8gZW5hYmxlIEZ1bGwgUm93IEVkaXRpbmcuIE90aGVyd2lzZSBsZWF2ZSBibGFuayB0byBlZGl0IG9uZSBjZWxsIGF0IGEgdGltZS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVkaXRUeXBlOiAnZnVsbFJvdycgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFNpbmdsZSBDbGljayBFZGl0aW5nIGZvciBjZWxscywgdG8gc3RhcnQgZWRpdGluZyB3aXRoIGEgc2luZ2xlIGNsaWNrLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgbmVpdGhlciBzaW5nbGUgbm9yIGRvdWJsZSBjbGljayBzdGFydHMgZWRpdGluZy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN0b3AgdGhlIGdyaWQgdXBkYXRpbmcgZGF0YSBhZnRlciBgRWRpdGAsIGBDbGlwYm9hcmRgIGFuZCBgRmlsbCBIYW5kbGVgIG9wZXJhdGlvbnMuIFdoZW4gdGhpcyBpcyBzZXQsIGl0IGlzIGludGVuZGVkIHRoZSBhcHBsaWNhdGlvbiB3aWxsIHVwZGF0ZSB0aGUgZGF0YSwgZWcgaW4gYW4gZXh0ZXJuYWwgaW1tdXRhYmxlIHN0b3JlLCBhbmQgdGhlbiBwYXNzIHRoZSBuZXcgZGF0YXNldCB0byB0aGUgZ3JpZC4gPGJyIC8+KipOb3RlOioqIGByb3dOb2RlLnNldERhdGFWYWx1ZSgpYCBkb2VzIG5vdCB1cGRhdGUgdGhlIHZhbHVlIG9mIHRoZSBjZWxsIHdoZW4gdGhpcyBpcyBgVHJ1ZWAsIGl0IGZpcmVzIGBvbkNlbGxFZGl0UmVxdWVzdGAgaW5zdGVhZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlYWRPbmx5RWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHN0b3AgY2VsbCBlZGl0aW5nIHdoZW4gZ3JpZCBsb3NlcyBmb2N1cy5cbiAgICAgICAgICogVGhlIGRlZmF1bHQgaXMgdGhhdCB0aGUgZ3JpZCBzdGF5cyBlZGl0aW5nIHVudGlsIGZvY3VzIGdvZXMgb250byBhbm90aGVyIGNlbGwuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjMwLCBubyBsb25nZXIgdXNlZC4gVG8gbmF2aWdhdGUgd2l0aCB0aGUgRW50ZXIga2V5IHVzZSBgZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5YC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTW92ZXNEb3duOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MzAsIG5vIGxvbmdlciB1c2VkLiBUbyBuYXZpZ2F0ZSB3aXRoIHRoZSBFbnRlciBrZXkgYWZ0ZXIgZWRpdCB1c2UgYGVudGVyTmF2aWdhdGVzVmVydGljYWxseUFmdGVyRWRpdGAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck1vdmVzRG93bkFmdGVyRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHlBZnRlckVkaXRgIHRvIGhhdmUgRXhjZWwtc3R5bGUgYmVoYXZpb3VyIGZvciB0aGUgYEVudGVyYCBrZXkuXG4gICAgICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIGBFbnRlcmAga2V5IHdpbGwgbW92ZSBkb3duIHRvIHRoZSBjZWxsIGJlbmVhdGggYW5kIGBTaGlmdCtFbnRlcmAgd2lsbCBtb3ZlIHVwIHRvIHRoZSBjZWxsIGFib3ZlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIGFsb25nIHdpdGggYGVudGVyTmF2aWdhdGVzVmVydGljYWxseWAgdG8gaGF2ZSBFeGNlbC1zdHlsZSBiZWhhdmlvdXIgZm9yIHRoZSAnRW50ZXInIGtleS5cbiAgICAgICAgICogaS5lLiBwcmVzc2luZyB0aGUgRW50ZXIga2V5IHdpbGwgbW92ZSBkb3duIHRvIHRoZSBjZWxsIGJlbmVhdGggYW5kIFNoaWZ0K0VudGVyIGtleSB3aWxsIG1vdmUgdXAgdG8gdGhlIGNlbGwgYWJvdmUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHlBZnRlckVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvcmNlcyBDZWxsIEVkaXRpbmcgdG8gc3RhcnQgd2hlbiBiYWNrc3BhY2UgaXMgcHJlc3NlZC4gVGhpcyBpcyBvbmx5IHJlbGV2YW50IGZvciBNYWNPUyB1c2Vycy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFZGl0aW5nT25CYWNrc3BhY2U6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFVuZG8gLyBSZWRvIHdoaWxlIGVkaXRpbmcuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB1bmRvUmVkb0NlbGxFZGl0aW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhlIHNpemUgb2YgdGhlIHVuZG8gLyByZWRvIHN0YWNrLlxuICAgICAgICAgKiBAZGVmYXVsdCAxMFxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZ0xpbWl0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgZGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGV4cG9ydCB0byBDU1YuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q3N2RXhwb3J0UGFyYW1zOiBDc3ZFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIHRoZSB1c2VyIGZyb20gZXhwb3J0aW5nIHRoZSBncmlkIHRvIENTVi5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gRXhjZWwuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXM6IEV4Y2VsRXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBFeGNlbC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbGlzdCAoYXJyYXkpIG9mIEV4Y2VsIHN0eWxlcyB0byBiZSB1c2VkIHdoZW4gZXhwb3J0aW5nIHRvIEV4Y2VsIHdpdGggc3R5bGVzLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZXhjZWxTdHlsZXM6IEV4Y2VsU3R5bGVbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUm93cyBhcmUgZmlsdGVyZWQgdXNpbmcgdGhpcyB0ZXh0IGFzIGEgUXVpY2sgRmlsdGVyLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcXVpY2tGaWx0ZXJUZXh0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvbiB0aGUgUXVpY2sgRmlsdGVyIGNhY2hlLCB1c2VkIHRvIGltcHJvdmUgcGVyZm9ybWFuY2Ugd2hlbiB1c2luZyB0aGUgUXVpY2sgRmlsdGVyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVRdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgQXMgb2YgdjMwLCBoaWRkZW4gY29sdW1ucyBhcmUgZXhjbHVkZWQgZnJvbSB0aGUgUXVpY2sgRmlsdGVyIGJ5IGRlZmF1bHQuIFRoaXMgY2FuIGJlIHRvZ2dsZWQgdXNpbmcgYGluY2x1ZGVIaWRkZW5Db2x1bW5zSW5RdWlja0ZpbHRlcmAuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNsdWRlSGlkZGVuQ29sdW1uc0Zyb21RdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSGlkZGVuIGNvbHVtbnMgYXJlIGV4Y2x1ZGVkIGZyb20gdGhlIFF1aWNrIEZpbHRlciBieSBkZWZhdWx0LlxuICAgICAgICAgKiBUbyBpbmNsdWRlIGhpZGRlbiBjb2x1bW5zLCBzZXQgdG8gYHRydWVgLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5jbHVkZUhpZGRlbkNvbHVtbnNJblF1aWNrRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFuZ2VzIGhvdyB0aGUgUXVpY2sgRmlsdGVyIHNwbGl0cyB0aGUgUXVpY2sgRmlsdGVyIHRleHQgaW50byBzZWFyY2ggdGVybXMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlclBhcnNlcjogKChxdWlja0ZpbHRlcjogc3RyaW5nKSA9PiBzdHJpbmdbXSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENoYW5nZXMgdGhlIG1hdGNoaW5nIGxvZ2ljIGZvciB3aGV0aGVyIGEgcm93IHBhc3NlcyB0aGUgUXVpY2sgRmlsdGVyLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcXVpY2tGaWx0ZXJNYXRjaGVyOiAoKHF1aWNrRmlsdGVyUGFydHM6IHN0cmluZ1tdLCByb3dRdWlja0ZpbHRlckFnZ3JlZ2F0ZVRleHQ6IHN0cmluZykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgdHJlZSBkYXRhIGZpbHRlcmluZyBiZWhhdmlvdXIgdG8gaW5zdGVhZCBleGNsdWRlIGNoaWxkIG5vZGVzIGZyb20gZmlsdGVyIHJlc3VsdHMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGVuYWJsZSB0aGUgQWR2YW5jZWQgRmlsdGVyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQWR2YW5jZWRGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYzMSwgdXNlIGBpbml0aWFsU3RhdGUuZmlsdGVyLmFkdmFuY2VkRmlsdGVyTW9kZWxgIGluc3RlYWQuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZHZhbmNlZEZpbHRlck1vZGVsOiBBZHZhbmNlZEZpbHRlck1vZGVsIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSGlkZGVuIGNvbHVtbnMgYXJlIGV4Y2x1ZGVkIGZyb20gdGhlIEFkdmFuY2VkIEZpbHRlciBieSBkZWZhdWx0LlxuICAgICAgICAgKiBUbyBpbmNsdWRlIGhpZGRlbiBjb2x1bW5zLCBzZXQgdG8gYHRydWVgLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5jbHVkZUhpZGRlbkNvbHVtbnNJbkFkdmFuY2VkRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBET00gZWxlbWVudCB0byB1c2UgYXMgdGhlIHBhcmVudCBmb3IgdGhlIEFkdmFuY2VkIEZpbHRlciB0byBhbGxvdyBpdCB0byBhcHBlYXIgb3V0c2lkZSBvZiB0aGUgZ3JpZC5cbiAgICAgICAgICogU2V0IHRvIGBudWxsYCBvciBgdW5kZWZpbmVkYCB0byBhcHBlYXIgaW5zaWRlIHRoZSBncmlkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWR2YW5jZWRGaWx0ZXJQYXJlbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byB0aGUgQWR2YW5jZWQgRmlsdGVyIEJ1aWxkZXIuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZHZhbmNlZEZpbHRlckJ1aWxkZXJQYXJhbXM6IElBZHZhbmNlZEZpbHRlckJ1aWxkZXJQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gRW5hYmxlIENoYXJ0cy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGxpc3Qgb2YgY2hhcnQgdGhlbWVzIHRoYXQgYSB1c2VyIGNhbiBjaG9vc2UgZnJvbSBpbiB0aGUgY2hhcnQgcGFuZWwuXG4gICAgICAgICAqIEBkZWZhdWx0IFsnYWctZGVmYXVsdCcsICdhZy1tYXRlcmlhbCcsICdhZy1zaGVldHMnLCAnYWctcG9seWNocm9tYScsICdhZy12aXZpZCddO1xuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBjb250YWluaW5nIGN1c3RvbSBjaGFydCB0aGVtZXMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjdXN0b21DaGFydFRoZW1lczogeyBbbmFtZTogc3RyaW5nXTogQWdDaGFydFRoZW1lIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENoYXJ0IHRoZW1lIG92ZXJyaWRlcyBhcHBsaWVkIHRvIGFsbCB0aGVtZXMuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydFRoZW1lT3ZlcnJpZGVzOiBBZ0NoYXJ0VGhlbWVPdmVycmlkZXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIEFzIG9mIHYyOSwgbm8gbG9uZ2VyIHVzZWQuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDaGFydFRvb2xQYW5lbHNCdXR0b246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc2hvdyB0aGUgJ2hhbWJ1cmdlcicgbWVudSBvcHRpb24gZnJvbSB0aGUgQ2hhcnQgVG9vbGJhciBhbmQgZGlzcGxheSB0aGUgcmVtYWluaW5nIHRvb2xiYXIgYnV0dG9ucy4gT25seSBhcHBsaWVzIHdoZW4gdXNpbmcgQUcgQ2hhcnRzIENvbW11bml0eS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhcnRUb29sUGFuZWxzQnV0dG9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY3VzdG9taXNhdGlvbiBvZiB0aGUgQ2hhcnQgVG9vbCBQYW5lbHMsIHN1Y2ggYXMgY2hhbmdpbmcgdGhlIHRvb2wgcGFuZWxzIHZpc2liaWxpdHkgYW5kIG9yZGVyLCBhcyB3ZWxsIGFzIGNob29zaW5nIHdoaWNoIGNoYXJ0cyBzaG91bGQgYmUgZGlzcGxheWVkIGluIHRoZSBjaGFydCBwYW5lbC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VG9vbFBhbmVsc0RlZjogQ2hhcnRUb29sUGFuZWxzRGVmIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBHZXQgY2hhcnQgbWVudSBpdGVtcy4gT25seSBhcHBsaWVzIHdoZW4gdXNpbmcgQUcgQ2hhcnRzIEVudGVycHJpc2UuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjaGFydE1lbnVJdGVtczogKHN0cmluZyB8IE1lbnVJdGVtRGVmKVtdIHwgR2V0Q2hhcnRNZW51SXRlbXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIGxvYWRpbmcgY2VsbCByZW5kZXJlciB0byB1c2Ugd2hlbiBkYXRhIGlzIGxvYWRpbmcgdmlhIGEgRGF0YVNvdXJjZS5cbiAgICAgICAgICogU2VlIFtMb2FkaW5nIENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1sb2FkaW5nLWNlbGwtcmVuZGVyZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFBhcmFtcyB0byBiZSBwYXNzZWQgdG8gdGhlIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBjb21wb25lbnQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHNlbGVjdCB3aGljaCBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gYmUgdXNlZCB3aGVuIGRhdGEgaXMgbG9hZGluZyB2aWEgYSBEYXRhU291cmNlLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclNlbGVjdG9yOiBMb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3JGdW5jPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2Yga2V5LT52YWx1ZSBwYWlycyBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hc3RlciBEZXRhaWwuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXN0ZXJEZXRhaWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8ga2VlcCBkZXRhaWwgcm93cyBmb3Igd2hlbiB0aGV5IGFyZSBkaXNwbGF5ZWQgYWdhaW4uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBrZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgbnVtYmVyIG9mIGRldGFpbHMgcm93cyB0byBrZWVwLlxuICAgICAgICAgKiBAZGVmYXVsdCAxMFxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3NDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGBkZXRhaWxDZWxsUmVuZGVyZXJgIHRvIHVzZSB3aGVuIGEgbWFzdGVyIHJvdyBpcyBleHBhbmRlZC5cbiAgICAgICAgICogU2VlIFtEZXRhaWwgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvbWFzdGVyLWRldGFpbC1jdXN0b20tZGV0YWlsLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgcGFyYW1zIHRvIGJlIHVzZWQgYnkgdGhlIERldGFpbCBDZWxsIFJlbmRlcmVyLiBDYW4gYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgcHJvdmlkZXMgdGhlIHBhcmFtcyB0byBlbmFibGUgZHluYW1pYyBkZWZpbml0aW9ucyBvZiB0aGUgcGFyYW1zLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGV0YWlsQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCBmaXhlZCBoZWlnaHQgaW4gcGl4ZWxzIGZvciBlYWNoIGRldGFpbCByb3cuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxSb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSBkZXRhaWwgZ3JpZCBkeW5hbWljYWxseSBjaGFuZ2UgaXQncyBoZWlnaHQgdG8gZml0IGl0J3Mgcm93cy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGVzIGEgY29udGV4dCBvYmplY3QgdGhhdCBpcyBwcm92aWRlZCB0byBkaWZmZXJlbnQgY2FsbGJhY2tzIHRoZSBncmlkIHVzZXMuIFVzZWQgZm9yIHBhc3NpbmcgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB0byB0aGUgY2FsbGJhY2tzIGJ5IHlvdXIgYXBwbGljYXRpb24uXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb250ZXh0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqXG4gICAgICAgICAqIEEgbGlzdCBvZiBncmlkcyB0byB0cmVhdCBhcyBBbGlnbmVkIEdyaWRzLlxuICAgICAgICAgKiBQcm92aWRlIGEgbGlzdCBpZiB0aGUgZ3JpZHMgLyBhcGlzIGFscmVhZHkgZXhpc3Qgb3IgcmV0dXJuIHZpYSBhIGNhbGxiYWNrIHRvIGFsbG93IHRoZSBhbGlnbmVkIGdyaWRzIHRvIGJlIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS5cbiAgICAgICAgICogSWYgZ3JpZHMgYXJlIGFsaWduZWQgdGhlbiB0aGUgY29sdW1ucyBhbmQgaG9yaXpvbnRhbCBzY3JvbGxpbmcgd2lsbCBiZSBrZXB0IGluIHN5bmMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGlnbmVkR3JpZHM6IChBbGlnbmVkR3JpZFtdIHwgKCgpID0+IEFsaWduZWRHcmlkW10pKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhbmdlIHRoaXMgdmFsdWUgdG8gc2V0IHRoZSB0YWJJbmRleCBvcmRlciBvZiB0aGUgR3JpZCB3aXRoaW4geW91ciBhcHBsaWNhdGlvbi5cbiAgICAgICAgICogQGRlZmF1bHQgMFxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIG51bWJlciBvZiByb3dzIHJlbmRlcmVkIG91dHNpZGUgdGhlIHZpZXdhYmxlIGFyZWEgdGhlIGdyaWQgcmVuZGVycy5cbiAgICAgICAgICogSGF2aW5nIGEgYnVmZmVyIG1lYW5zIHRoZSBncmlkIHdpbGwgaGF2ZSByb3dzIHJlYWR5IHRvIHNob3cgYXMgdGhlIHVzZXIgc2xvd2x5IHNjcm9sbHMgdmVydGljYWxseS5cbiAgICAgICAgICogQGRlZmF1bHQgMTBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0J1ZmZlcjogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIHZhbHVlIGNhY2hlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb25maWd1cmUgdGhlIHZhbHVlIGNhY2hlIHRvIG5vdCBleHBpcmUgYWZ0ZXIgZGF0YSB1cGRhdGVzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZU5ldmVyRXhwaXJlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBjZWxsIGV4cHJlc3Npb25zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MzAuMiBJZiBgdHJ1ZWAsIHJvdyBub2RlcyBkbyBub3QgaGF2ZSB0aGVpciBwYXJlbnRzIHNldC5cbiAgICAgICAgICogVGhlIGdyaWQgZG9lc24ndCB1c2UgdGhlIHBhcmVudCByZWZlcmVuY2UsIGJ1dCBpdCBpcyBpbmNsdWRlZCB0byBoZWxwIHRoZSBjbGllbnQgY29kZSBuYXZpZ2F0ZSB0aGUgbm9kZSB0cmVlIGlmIGl0IHdhbnRzIGJ5IHByb3ZpZGluZyBiaS1kaXJlY3Rpb24gbmF2aWdhdGlvbiB1cCBhbmQgZG93biB0aGUgdHJlZS5cbiAgICAgICAgICogSWYgdGhpcyBpcyBhIHByb2JsZW0gKGUuZy4gaWYgeW91IG5lZWQgdG8gY29udmVydCB0aGUgdHJlZSB0byBKU09OLCB3aGljaCBkb2VzIG5vdCBhbGxvdyBjeWNsaWMgZGVwZW5kZW5jaWVzKSB0aGVuIHNldCB0aGlzIHRvIGB0cnVlYC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFyZW50c0luUm93Tm9kZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRvdWNoIHN1cHBvcnQgKGJ1dCBkb2VzIG5vdCByZW1vdmUgdGhlIGJyb3dzZXIncyBlZmZvcnRzIHRvIHNpbXVsYXRlIG1vdXNlIGV2ZW50cyBvbiB0b3VjaCkuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzZXQgZm9jdXMgYmFjayBvbiB0aGUgZ3JpZCBhZnRlciBhIHJlZnJlc2guIFRoaXMgY2FuIGF2b2lkIGlzc3VlcyB3aGVyZSB5b3Ugd2FudCB0byBrZWVwIHRoZSBmb2N1cyBvbiBhbm90aGVyIHBhcnQgb2YgdGhlIGJyb3dzZXIuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgYXN5bmNocm9ub3VzIG5hdHVyZSBvZiB0aGUgZXZlbnRzIGludHJvZHVjZWQgaW4gdjEwLCBhbmQgbWFrZXMgdGhlbSBzeW5jaHJvbm91cy4gVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBmb3IgdGhlIHB1cnBvc2Ugb2Ygc3VwcG9ydGluZyBsZWdhY3kgY29kZSB3aGljaCBoYXMgYSBkZXBlbmRlbmN5IG9uIHN5bmNocm9ub3VzIGV2ZW50cyBmcm9tIGVhcmxpZXIgdmVyc2lvbnMgKHY5IG9yIGVhcmxpZXIpIG9mIEFHIEdyaWQuICAgICAqKkl0IGlzIHN0cm9uZ2x5IHJlY29tbWVuZGVkIHRoYXQgeW91IGRvIG5vdCBjaGFuZ2UgdGhpcyBwcm9wZXJ0eSB1bmxlc3MgeW91IGhhdmUgbGVnYWN5IGlzc3Vlcy4qKlxuICAgICAgICAgKiBAZGVwcmVjYXRlZCB2MzEgRXZlbnRzIHNob3VsZCBiZSBoYW5kbGVkIGFzeW5jaHJvbm91c2x5LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBc3luY0V2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGdyaWQgd2lsbCBjaGVjayBmb3IgYFJlc2l6ZU9ic2VydmVyYCBhbmQgdXNlIGl0IGlmIGl0IGV4aXN0cyBpbiB0aGUgYnJvd3Nlciwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlIHRoZSBncmlkJ3MgYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb24uIFNvbWUgdXNlcnMgcmVwb3J0ZWQgaXNzdWVzIHdpdGggQ2hyb21lJ3MgYFJlc2l6ZU9ic2VydmVyYC4gVXNlIHRoaXMgcHJvcGVydHkgdG8gYWx3YXlzIHVzZSB0aGUgZ3JpZCdzIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9uIHNob3VsZCBzdWNoIHByb2JsZW1zIGV4aXN0LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHNob3dpbmcgYSB3YXJuaW5nIG1lc3NhZ2UgaW4gdGhlIGNvbnNvbGUgaWYgdXNpbmcgYSBgZ3JpZE9wdGlvbnNgIG9yIGBjb2xEZWZgIHByb3BlcnR5IHRoYXQgZG9lc24ndCBleGlzdC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJvcGVydHlOYW1lc0NoZWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBlbmFibGUgZGVidWcgaW5mb3JtYXRpb24gZnJvbSB0aGUgZ3JpZCBhbmQgcmVsYXRlZCBjb21wb25lbnRzLiBXaWxsIHJlc3VsdCBpbiBhZGRpdGlvbmFsIGxvZ2dpbmcgYmVpbmcgb3V0cHV0LCBidXQgdmVyeSB1c2VmdWwgd2hlbiBpbnZlc3RpZ2F0aW5nIHByb2JsZW1zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVidWc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSB0ZW1wbGF0ZSBmb3IgJ2xvYWRpbmcnIG92ZXJsYXkuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBvdmVybGF5TG9hZGluZ1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gbG9hZGluZyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgICAgICogU2VlIFtMb2FkaW5nIE92ZXJsYXkgQ29tcG9uZW50XShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9jb21wb25lbnQtb3ZlcmxheS8jaW1wbGVtZW50aW5nLWEtbG9hZGluZy1vdmVybGF5LWNvbXBvbmVudCkgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlICdsb2FkaW5nJyBvdmVybGF5LlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIHRlbXBsYXRlIGZvciAnbm8gcm93cycgb3ZlcmxheS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlOb1Jvd3NUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIG5vIHJvd3Mgb3ZlcmxheSBjb21wb25lbnQuXG4gICAgICAgICAqIFNlZSBbTm8gUm93cyBPdmVybGF5IENvbXBvbmVudF0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvY29tcG9uZW50LW92ZXJsYXkvI2ltcGxlbWVudGluZy1hLW5vLXJvd3Mtb3ZlcmxheS1jb21wb25lbnQpIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBubyByb3dzIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgJ25vIHJvd3MnIG92ZXJsYXkuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc05vUm93c092ZXJsYXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB3aGV0aGVyIHBhZ2luYXRpb24gaXMgZW5hYmxlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJvd3MgdG8gbG9hZCBwZXIgcGFnZS4gSWYgYHBhZ2luYXRpb25BdXRvUGFnZVNpemVgIGlzIHNwZWNpZmllZCwgdGhpcyBwcm9wZXJ0eSBpcyBpZ25vcmVkLlxuICAgICAgICAgKiBAZGVmYXVsdCAxMDBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEZXRlcm1pbmVzIGlmIHRoZSBwYWdlIHNpemUgc2VsZWN0b3IgaXMgc2hvd24gaW4gdGhlIHBhZ2luYXRpb24gcGFuZWwgb3Igbm90LlxuICAgICAgICAgKiBTZXQgdG8gYW4gYXJyYXkgb2YgdmFsdWVzIHRvIHNob3cgdGhlIHBhZ2Ugc2l6ZSBzZWxlY3RvciB3aXRoIGN1c3RvbSBsaXN0IG9mIHBvc3NpYmxlIHBhZ2Ugc2l6ZXMuXG4gICAgICAgICAqIFNldCB0byBgdHJ1ZWAgdG8gc2hvdyB0aGUgcGFnZSBzaXplIHNlbGVjdG9yIHdpdGggdGhlIGRlZmF1bHQgcGFnZSBzaXplcyBgWzIwLCA1MCwgMTAwXWAuXG4gICAgICAgICAqIFNldCB0byBgZmFsc2VgIHRvIGhpZGUgdGhlIHBhZ2Ugc2l6ZSBzZWxlY3Rvci5cbiAgICAgICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvblBhZ2VTaXplU2VsZWN0b3I6IG51bWJlcltdIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBudW1iZXIgb2Ygcm93cyB0byBsb2FkIHBlciBwYWdlIGlzIGF1dG9tYXRpY2FsbHkgYWRqdXN0ZWQgYnkgdGhlIGdyaWQgc28gZWFjaCBwYWdlIHNob3dzIGVub3VnaCByb3dzIHRvIGp1c3QgZmlsbCB0aGUgYXJlYSBkZXNpZ25hdGVkIGZvciB0aGUgZ3JpZC4gSWYgYGZhbHNlYCwgYHBhZ2luYXRpb25QYWdlU2l6ZWAgaXMgdXNlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBwYWdlcyBzcGxpdCBjaGlsZHJlbiBvZiBncm91cHMgd2hlbiB1c2luZyBSb3cgR3JvdXBpbmcgb3IgZGV0YWlsIHJvd3Mgd2l0aCBNYXN0ZXIgRGV0YWlsLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGRlZmF1bHQgZ3JpZCBjb250cm9scyBmb3IgbmF2aWdhdGlvbiBhcmUgaGlkZGVuLlxuICAgICAgICAgKiBUaGlzIGlzIHVzZWZ1bCBpZiBgcGFnaW5hdGlvbj10cnVlYCBhbmQgeW91IHdhbnQgdG8gcHJvdmlkZSB5b3VyIG93biBwYWdpbmF0aW9uIGNvbnRyb2xzLlxuICAgICAgICAgKiBPdGhlcndpc2UsIHdoZW4gYHBhZ2luYXRpb249dHJ1ZWAgdGhlIGdyaWQgYXV0b21hdGljYWxseSBzaG93cyB0aGUgbmVjZXNzYXJ5IGNvbnRyb2xzIGF0IHRoZSBib3R0b20gc28gdGhhdCB0aGUgdXNlciBjYW4gbmF2aWdhdGUgdGhyb3VnaCB0aGUgZGlmZmVyZW50IHBhZ2VzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYWdpbmF0aW9uUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHBpdm90IG1vZGUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdE1vZGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdG8gc2hvdyB0aGUgJ3Bpdm90IHBhbmVsJyAod2hlcmUgeW91IGRyYWcgcm93cyB0byBwaXZvdCkgYXQgdGhlIHRvcC4gTm90ZSB0aGF0IHRoZSBwaXZvdCBwYW5lbCB3aWxsIG5ldmVyIHNob3cgaWYgYHBpdm90TW9kZWAgaXMgb2ZmLlxuICAgICAgICAgKiBAZGVmYXVsdCAnbmV2ZXInXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFBhbmVsU2hvdzogJ2Fsd2F5cycgfCAnb25seVdoZW5QaXZvdGluZycgfCAnbmV2ZXInIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgZ2VuZXJhdGVkIGNvbHVtbnMgYmVmb3JlIHRoZSBncmlkIGhhbHRzIGV4ZWN1dGlvbi4gVXBvbiByZWFjaGluZyB0aGlzIG51bWJlciwgdGhlIGdyaWQgaGFsdHMgZ2VuZXJhdGlvbiBvZiBjb2x1bW5zXG4gICAgICAgICAqIGFuZCB0cmlnZ2VycyBhIGBwaXZvdE1heENvbHVtbnNFeGNlZWRlZGAgZXZlbnQuIGAtMWAgZm9yIG5vIGxpbWl0LlxuICAgICAgICAgKiBAZGVmYXVsdCAtMVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RNYXhHZW5lcmF0ZWRDb2x1bW5zOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIHBpdm90aW5nLCBzZXQgdG8gdGhlIG51bWJlciBvZiBjb2x1bW4gZ3JvdXAgbGV2ZWxzIHRvIGV4cGFuZCBieSBkZWZhdWx0LCBlLmcuIGAwYCBmb3Igbm9uZSwgYDFgIGZvciBmaXJzdCBsZXZlbCBvbmx5LCBldGMuIFNldCB0byBgLTFgIHRvIGV4cGFuZCBldmVyeXRoaW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCAwXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdERlZmF1bHRFeHBhbmRlZDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciB3aXRoaW4gdGhlIFBpdm90IENvbHVtbiBHcm91cHMsIGluIHRoZSBwb3NpdGlvbiBzcGVjaWZpZWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdENvbHVtbkdyb3VwVG90YWxzOiAnYmVmb3JlJyB8ICdhZnRlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gc2V0IGFuZCB0aGUgZ3JpZCBpcyBpbiBwaXZvdCBtb2RlLCBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgdG90YWxzIHdpbGwgYXBwZWFyIGZvciBlYWNoIHZhbHVlIGNvbHVtbiBpbiB0aGUgcG9zaXRpb24gc3BlY2lmaWVkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RSb3dUb3RhbHM6ICdiZWZvcmUnIHwgJ2FmdGVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzd2FwIGluIHRoZSBncm91cGluZyBjb2x1bW4gd2hlbiBwaXZvdGluZy4gVXNlZnVsIGlmIHBpdm90aW5nIHVzaW5nIFNlcnZlciBTaWRlIFJvdyBNb2RlbCBvciBWaWV3cG9ydCBSb3cgTW9kZWwgYW5kIHlvdSB3YW50IGZ1bGwgY29udHJvbCBvZiBhbGwgY29sdW1ucyBpbmNsdWRpbmcgdGhlIGdyb3VwIGNvbHVtbi5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHBpdm90IGNvbHVtbiBncm91cHMgd2lsbCBhcHBlYXIgJ2ZpeGVkJywgd2l0aG91dCB0aGUgYWJpbGl0eSB0byBleHBhbmQgYW5kIGNvbGxhcHNlIHRoZSBjb2x1bW4gZ3JvdXBzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeHBhbmRhYmxlUGl2b3RHcm91cHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlbiByb3cgZ3JvdXAsIHBpdm90IGFuZCB2YWx1ZSBhZ2dyZWdhdGlvbiB3aWxsIGJlIHJlYWQtb25seSBmcm9tIHRoZSBHVUkuIFRoZSBncmlkIHdpbGwgZGlzcGxheSB3aGF0IHZhbHVlcyBhcmUgdXNlZCBmb3IgZWFjaCwgYnV0IHdpbGwgbm90IGFsbG93IHRoZSB1c2VyIHRvIGNoYW5nZSB0aGUgc2VsZWN0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIG9mICdmdW5jdGlvbiBuYW1lJyB0byAnZnVuY3Rpb24nIGZvciBjdXN0b20gYWdncmVnYXRpb24gZnVuY3Rpb25zLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuY3M6IHsgW2tleTogc3RyaW5nXTogSUFnZ0Z1bmM8VERhdGE+OyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgY29sdW1uIGhlYWRlcnMgd29uJ3QgaW5jbHVkZSB0aGUgYGFnZ0Z1bmNgIG5hbWUsIGUuZy4gYCdzdW0oQmFuayBCYWxhbmNlKWAnIHdpbGwganVzdCBiZSBgJ0JhbmsgQmFsYW5jZSdgLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGdW5jSW5IZWFkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgYWdncmVnYXRpb25zLCB0aGUgZ3JpZCB3aWxsIGFsd2F5cyBjYWxjdWxhdGUgdGhlIHJvb3QgbGV2ZWwgYWdncmVnYXRpb24gdmFsdWUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNBZ2dyZWdhdGVBdFJvb3RMZXZlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjMwIC0gbWFkZSBkZWZhdWx0IGFuZCB0b2dnbGVkIHZpYSBhbHdheXNBZ2dyZWdhdGVBdFJvb3RMZXZlbFxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyBjaGFuZ2UgZGV0ZWN0aW9uLCBvbmx5IHRoZSB1cGRhdGVkIGNvbHVtbiB3aWxsIGJlIHJlLWFnZ3JlZ2F0ZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCBhZ2dyZWdhdGlvbnMgYXJlIG5vdCBpbXBhY3RlZCBieSBmaWx0ZXJpbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0ZpbHRlcmVkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvbWl0IHRoZSB2YWx1ZSBDb2x1bW4gaGVhZGVyIHdoZW4gdGhlcmUgaXMgb25seSBhIHNpbmdsZSB2YWx1ZSBjb2x1bW4uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZW1vdmVQaXZvdEhlYWRlclJvd1doZW5TaW5nbGVWYWx1ZUNvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGBmYWxzZWAgdG8gZGlzYWJsZSBSb3cgQW5pbWF0aW9uIHdoaWNoIGlzIGVuYWJsZWQgYnkgZGVmYXVsdC5cbiAgICAgICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYW5pbWF0ZVJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBjZWxscyBmbGFzaCBhZnRlciBkYXRhIGNoYW5nZXMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBkZXByZWNhdGVkIDMxLjIgdXNlIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgIGluIHRoZSBgQ29sRGVmYCBvciBgZGVmYXVsdENvbERlZmAgZm9yIGFsbCBjb2x1bW5zLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBiZSB1c2VkIHdoZW4gc2V0dGluZyBgZW5hYmxlQ2VsbENoYW5nZUZsYXNoYCBvbiBjb2x1bW4gZGVmaW5pdGlvbnMuIFNldHMgdGhlIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyBhIGNlbGwgc2hvdWxkIHJlbWFpbiBpbiBpdHMgXCJmbGFzaGVkXCIgc3RhdGUuXG4gICAgICAgICAqIEBkZWZhdWx0IDUwMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRHVyYXRpb246IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjMxLjEgLSB1c2UgYGNlbGxGbGFzaER1cmF0aW9uYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gYmUgdXNlZCB3aGVuIHNldHRpbmcgYGVuYWJsZUNlbGxDaGFuZ2VGbGFzaGAgb24gY29sdW1uIGRlZmluaXRpb25zLiBTZXRzIHRoZSBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgb2YgaG93IGxvbmcgdGhlIFwiZmxhc2hlZFwiIHN0YXRlIGFuaW1hdGlvbiB0YWtlcyB0byBmYWRlIGF3YXkgYWZ0ZXIgdGhlIHRpbWVyIHNldCBieSBjZWxsRmxhc2hEdXJhdGlvbiBoYXMgY29tcGxldGVkLlxuICAgICAgICAgKiBAZGVmYXVsdCAxMDAwXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmFkZUR1cmF0aW9uOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYzMS4xIC0gdXNlIGBjZWxsRmFkZUR1cmF0aW9uYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZhZGVEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgY2VsbHMgZmxhc2ggYWZ0ZXIgZGF0YSBjaGFuZ2VzIGV2ZW4gd2hlbiB0aGUgY2hhbmdlIGlzIGR1ZSB0byBmaWx0ZXJpbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd1Nob3dDaGFuZ2VBZnRlckZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3dpdGNoIGJldHdlZW4gbGF5b3V0IG9wdGlvbnM6IGBub3JtYWxgLCBgYXV0b0hlaWdodGAsIGBwcmludGAuXG4gICAgICAgICAqIEBkZWZhdWx0ICdub3JtYWwnXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb21MYXlvdXQ6IERvbUxheW91dFR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgb3JkZXIgb2Ygcm93cyBhbmQgY29sdW1ucyBpbiB0aGUgRE9NIGFyZSBjb25zaXN0ZW50IHdpdGggd2hhdCBpcyBvbiBzY3JlZW4uXG4gICAgICAgICAqIERpc2FibGVzIHJvdyBhbmltYXRpb25zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5zdXJlRG9tT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gb3BlcmF0ZSB0aGUgZ3JpZCBpbiBSVEwgKFJpZ2h0IHRvIExlZnQpIG1vZGUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSdGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgZ3JpZCBkb2Vzbid0IHZpcnR1YWxpc2UgdGhlIGNvbHVtbnMuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSAxMDAgY29sdW1ucywgYnV0IG9ubHkgMTAgdmlzaWJsZSBkdWUgdG8gc2Nyb2xsaW5nLCBhbGwgMTAwIHdpbGwgYWx3YXlzIGJlIHJlbmRlcmVkLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCB0aGUgZ3JpZCBoYXMgYSBsaW1pdCBvZiByZW5kZXJpbmcgYSBtYXhpbXVtIG9mIDUwMCByb3dzIGF0IG9uY2UgKHJlbWVtYmVyIHRoZSBncmlkIG9ubHkgcmVuZGVycyByb3dzIHlvdSBjYW4gc2VlLCBzbyB1bmxlc3MgeW91ciBkaXNwbGF5IHNob3dzIG1vcmUgdGhhbiA1MDAgcm93cyB3aXRob3V0IHZlcnRpY2FsbHkgc2Nyb2xsaW5nIHRoaXMgd2lsbCBuZXZlciBiZSBhbiBpc3N1ZSkuXG4gICAgICAgICAqIDxiciAvPioqVGhpcyBpcyBvbmx5IHJlbGV2YW50IGlmIHlvdSBhcmUgbWFudWFsbHkgc2V0dGluZyBgcm93QnVmZmVyYCB0byBhIGhpZ2ggdmFsdWUgKHJlbmRlcmluZyBtb3JlIHJvd3MgdGhhbiBjYW4gYmUgc2VlbiksIG9yIGBzdXBwcmVzc1Jvd1ZpcnR1YWxpc2F0aW9uYCBpcyB0cnVlLCBvciBpZiB5b3VyIGdyaWQgaGVpZ2h0IGlzIGFibGUgdG8gZGlzcGxheSBtb3JlIHRoYW4gNTAwIHJvd3MgYXQgb25jZS4qKlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgdGhlIGdyaWQgZG9lc24ndCB2aXJ0dWFsaXNlIHRoZSByb3dzLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgMTAwIHJvd3MsIGJ1dCBvbmx5IDEwIHZpc2libGUgZHVlIHRvIHNjcm9sbGluZywgYWxsIDEwMCB3aWxsIGFsd2F5cyBiZSByZW5kZXJlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hbmFnZWQgUm93IERyYWdnaW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgcm93IGRyYWdnaW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEcmFnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIG1vdmluZyByb3dzIHdoaWxlIGRyYWdnaW5nIHRoZSBgcm93RHJhZ2Agd2FmZmxlLiBUaGlzIG9wdGlvbiBoaWdobGlnaHRzIHRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgcm93IHdpbGwgYmUgcGxhY2VkIGFuZCBpdCB3aWxsIG9ubHkgbW92ZSB0aGUgcm93IG9uIG1vdXNlIHVwLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBjbGlja2luZyBhbmQgZHJhZ2dpbmcgYW55d2hlcmUgb24gdGhlIHJvdyB3aXRob3V0IHRoZSBuZWVkIGZvciBhIGRyYWcgaGFuZGxlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgZHJhZ2dpbmcgbXVsdGlwbGUgcm93cyBhdCB0aGUgc2FtZSB0aW1lLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ011bHRpUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIHJldHVybiBhIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGByb3dEcmFnQ29tcGAgd2hpbGUgZHJhZ2dpbmcgYSByb3cuXG4gICAgICAgICAqIElmIHRoaXMgY2FsbGJhY2sgaXMgbm90IHNldCwgdGhlIGN1cnJlbnQgY2VsbCB2YWx1ZSB3aWxsIGJlIHVzZWQuXG4gICAgICAgICAqIElmIHRoZSBgcm93RHJhZ1RleHRgIGNhbGxiYWNrIGlzIHNldCBpbiB0aGUgQ29sRGVmIGl0IHdpbGwgdGFrZSBwcmVjZWRlbmNlIG92ZXIgdGhpcywgZXhjZXB0IHdoZW5cbiAgICAgICAgICogYHJvd0RyYWdFbnRpcmVSb3c9dHJ1ZWAuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnVGV4dDogKChwYXJhbXM6IElSb3dEcmFnSXRlbSwgZHJhZ0l0ZW1Db3VudDogbnVtYmVyKSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHlvdXIgb3duIGNlbGwgcmVuZGVyZXIgY29tcG9uZW50IHRvIHVzZSBmb3IgZnVsbCB3aWR0aCByb3dzLlxuICAgICAgICAgKiBTZWUgW0Z1bGwgV2lkdGggUm93c10oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvZnVsbC13aWR0aC1yb3dzLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgYGZ1bGxXaWR0aENlbGxSZW5kZXJlcmAgY29tcG9uZW50LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSB0aGUgRnVsbCBXaWR0aCBSb3dzIGVtYmVkZGVkIGluIGdyaWQncyBtYWluIGNvbnRhaW5lciBzbyB0aGV5IGNhbiBiZSBzY3JvbGxlZCBob3Jpem9udGFsbHkuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYzMVxuICAgICAgICAgKiBXaGVuIGVuYWJsZWQsIHRoZSBncmlkIHdpbGwgY2FzdCBncm91cCB2YWx1ZXMgdG8gc3RyaW5nIHR5cGUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0dyb3VwTWFpbnRhaW5WYWx1ZVR5cGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyBob3cgdGhlIHJlc3VsdHMgb2Ygcm93IGdyb3VwaW5nIHNob3VsZCBiZSBkaXNwbGF5ZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqICBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICAgICAqXG4gICAgICAgICAqIC0gYCdzaW5nbGVDb2x1bW4nYDogc2luZ2xlIGdyb3VwIGNvbHVtbiBhdXRvbWF0aWNhbGx5IGFkZGVkIGJ5IHRoZSBncmlkLlxuICAgICAgICAgKiAtIGAnbXVsdGlwbGVDb2x1bW5zJ2A6IGEgZ3JvdXAgY29sdW1uIHBlciByb3cgZ3JvdXAgaXMgYWRkZWQgYXV0b21hdGljYWxseS5cbiAgICAgICAgICogLSBgJ2dyb3VwUm93cydgOiBncm91cCByb3dzIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIGluc3RlYWQgb2YgZ3JvdXAgY29sdW1ucy5cbiAgICAgICAgICogLSBgJ2N1c3RvbSdgOiBpbmZvcm1zIHRoZSBncmlkIHRoYXQgZ3JvdXAgY29sdW1ucyB3aWxsIGJlIHByb3ZpZGVkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEaXNwbGF5VHlwZTogUm93R3JvdXBpbmdEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZ3JvdXBpbmcsIHNldCB0byB0aGUgbnVtYmVyIG9mIGxldmVscyB0byBleHBhbmQgYnkgZGVmYXVsdCwgZS5nLiBgMGAgZm9yIG5vbmUsIGAxYCBmb3IgZmlyc3QgbGV2ZWwgb25seSwgZXRjLiBTZXQgdG8gYC0xYCB0byBleHBhbmQgZXZlcnl0aGluZy5cbiAgICAgICAgICogQGRlZmF1bHQgMFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEZWZhdWx0RXhwYW5kZWQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNwZWNpZnlpbmcgdGhlIGdyb3VwICdhdXRvIGNvbHVtbicgaWYgeW91IGFyZSBub3QgaGFwcHkgd2l0aCB0aGUgZGVmYXVsdC4gSWYgZ3JvdXBpbmcsIHRoaXMgY29sdW1uIGRlZmluaXRpb24gaXMgaW5jbHVkZWQgYXMgdGhlIGZpcnN0IGNvbHVtbiBpbiB0aGUgZ3JpZC4gSWYgbm90IGdyb3VwaW5nLCB0aGlzIGNvbHVtbiBpcyBub3QgaW5jbHVkZWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvR3JvdXBDb2x1bW5EZWY6IENvbERlZjxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBwcmVzZXJ2ZXMgdGhlIGN1cnJlbnQgZ3JvdXAgb3JkZXIgd2hlbiBzb3J0aW5nIG9uIG5vbi1ncm91cCBjb2x1bW5zLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgaWYgeW91IHNlbGVjdCBhIGdyb3VwLCB0aGUgY2hpbGRyZW4gb2YgdGhlIGdyb3VwIHdpbGwgYWxzbyBiZSBzZWxlY3RlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgbG9ja3MgdGhlIGdyb3VwIHNldHRpbmdzIG9mIGEgbnVtYmVyIG9mIGNvbHVtbnMsIGUuZy4gYDBgIGZvciBubyBncm91cCBsb2NraW5nLiBgMWAgZm9yIGZpcnN0IGdyb3VwIGNvbHVtbiBsb2NrZWQsIGAtMWAgZm9yIGFsbCBncm91cCBjb2x1bW5zIGxvY2tlZC5cbiAgICAgICAgICogQGRlZmF1bHQgMFxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBMb2NrR3JvdXBDb2x1bW5zOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBkZXRlcm1pbmUgd2hldGhlciBmaWx0ZXJzIHNob3VsZCBiZSBhcHBsaWVkIG9uIGFnZ3JlZ2F0ZWQgZ3JvdXAgdmFsdWVzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBBZ2dGaWx0ZXJpbmc6IGJvb2xlYW4gfCBJc1Jvd0ZpbHRlcmFibGU8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgdGhpcyBjb250cm9scyB3aGV0aGVyIHRvIHNob3cgYSBncm91cCBmb290ZXIgd2hlbiB0aGUgZ3JvdXAgaXMgZXhwYW5kZWQuXG4gICAgICAgICAqIElmIGB0cnVlYCwgdGhlbiBieSBkZWZhdWx0LCB0aGUgZm9vdGVyIHdpbGwgY29udGFpbiBhZ2dyZWdhdGUgZGF0YSAoaWYgYW55KSB3aGVuIHNob3duIGFuZCB0aGUgaGVhZGVyIHdpbGwgYmUgYmxhbmsuXG4gICAgICAgICAqIFdoZW4gY2xvc2VkLCB0aGUgaGVhZGVyIHdpbGwgY29udGFpbiB0aGUgYWdncmVnYXRlIGRhdGEgcmVnYXJkbGVzcyBvZiB0aGlzIHNldHRpbmcgKGFzIHRoZSBmb290ZXIgaXMgaGlkZGVuIGFueXdheSkuXG4gICAgICAgICAqIFRoaXMgaXMgaGFuZHkgZm9yICd0b3RhbCcgcm93cywgdGhhdCBhcmUgZGlzcGxheWVkIGJlbG93IHRoZSBkYXRhIHdoZW4gdGhlIGdyb3VwIGlzIG9wZW4sIGFuZCBhbG9uZ3NpZGUgdGhlIGdyb3VwIHdoZW4gaXQgaXMgY2xvc2VkLlxuICAgICAgICAgKiBJZiBhIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBpdCBjYW4gdXNlZCB0byBzZWxlY3Qgd2hpY2ggZ3JvdXBzIHdpbGwgaGF2ZSBhIGZvb3RlciBhZGRlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZUZvb3RlcjogYm9vbGVhbiB8IFVzZUdyb3VwRm9vdGVyPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzaG93IGEgJ2dyYW5kIHRvdGFsJyBncm91cCBmb290ZXIgYWNyb3NzIGFsbCBncm91cHMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBhbmQgc2hvd2luZyBmb290ZXIsIGFnZ3JlZ2F0ZSBkYXRhIHdpbGwgYWx3YXlzIGJlIGRpc3BsYXllZCBhdCBib3RoIHRoZSBoZWFkZXIgYW5kIGZvb3RlciBsZXZlbHMuIFRoaXMgc3RvcHMgdGhlIHBvc3NpYmx5IHVuZGVzaXJhYmxlIGJlaGF2aW91ciBvZiB0aGUgaGVhZGVyIGRldGFpbHMgJ2p1bXBpbmcnIHRvIHRoZSBmb290ZXIgb24gZXhwYW5kLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiB1c2luZyBgZ3JvdXBTZWxlY3RzQ2hpbGRyZW5gLCB0aGVuIG9ubHkgdGhlIGNoaWxkcmVuIHRoYXQgcGFzcyB0aGUgY3VycmVudCBmaWx0ZXIgd2lsbCBnZXQgc2VsZWN0ZWQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2hvd3MgdGhlIG9wZW4gZ3JvdXAgaW4gdGhlIGdyb3VwIGNvbHVtbiBmb3Igbm9uLWdyb3VwIHJvd3MuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93T3BlbmVkR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29sbGFwc2UgZ3JvdXBzIHRoYXQgb25seSBoYXZlIG9uZSBjaGlsZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29sbGFwc2UgbG93ZXN0IGxldmVsIGdyb3VwcyB0aGF0IG9ubHkgaGF2ZSBvbmUgY2hpbGQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZGUgcGFyZW50cyB0aGF0IGFyZSBvcGVuLiBXaGVuIHVzZWQgd2l0aCBtdWx0aXBsZSBjb2x1bW5zIGZvciBzaG93aW5nIGdyb3VwcywgaXQgY2FuIGdpdmUgYSBtb3JlIHBsZWFzaW5nIHVzZXIgZXhwZXJpZW5jZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGlkZU9wZW5QYXJlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHByZXZlbnQgdGhlIGdyaWQgZnJvbSBjcmVhdGluZyBhICcoQmxhbmtzKScgZ3JvdXAgZm9yIG5vZGVzIHdoaWNoIGRvIG5vdCBiZWxvbmcgdG8gYSBncm91cCwgYW5kIGRpc3BsYXkgdGhlIHVuYmFsYW5jZWQgbm9kZXMgYWxvbmdzaWRlIGdyb3VwIG5vZGVzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBBbGxvd1VuYmFsYW5jZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdG8gc2hvdyB0aGUgJ3JvdyBncm91cCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gZ3JvdXApIGF0IHRoZSB0b3AuXG4gICAgICAgICAqIEBkZWZhdWx0ICduZXZlcidcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTaG93OiAnYWx3YXlzJyB8ICdvbmx5V2hlbkdyb3VwaW5nJyB8ICduZXZlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIENlbGwgUmVuZGVyZXIgdG8gdXNlIHdoZW4gYGdyb3VwRGlzcGxheVR5cGUgPSAnZ3JvdXBSb3dzJ2AuXG4gICAgICAgICAqIFNlZSBbR3JvdXAgUm93IENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2dyb3VwaW5nLWdyb3VwLXJvd3MvI3Byb3ZpZGluZy1jZWxsLXJlbmRlcmVyKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgYGdyb3VwUm93UmVuZGVyZXJgIGNvbXBvbmVudC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgd2hlbiBhIGNvbHVtbiBpcyB1bi1ncm91cGVkLCBpLmUuIHVzaW5nIHRoZSBSb3cgR3JvdXAgUGFuZWwsIGl0IGlzIG1hZGUgdmlzaWJsZSBpbiB0aGUgZ3JpZC4gVGhpcyBwcm9wZXJ0eSBzdG9wcyB0aGUgY29sdW1uIGJlY29taW5nIHZpc2libGUgYWdhaW4gd2hlbiB1bi1ncm91cGluZy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBHcmlkIHRvIHdvcmsgd2l0aCBUcmVlIERhdGEuIFlvdSBtdXN0IGFsc28gaW1wbGVtZW50IHRoZSBgZ2V0RGF0YVBhdGgoZGF0YSlgIGNhbGxiYWNrLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydCBpbmRpY2F0b3JzIGFuZCBhY3Rpb25zIGZyb20gdGhlIHJvdyBncm91cCBwYW5lbC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTdXBwcmVzc1NvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgcHJldmVudCBHcm91cCBSb3dzIGZyb20gc3RpY2tpbmcgdG8gdGhlIHRvcCBvZiB0aGUgZ3JpZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzR3JvdXBSb3dzU3RpY2t5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEYXRhIHRvIGJlIGRpc3BsYXllZCBhcyBwaW5uZWQgdG9wIHJvd3MgaW4gdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRUb3BSb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIGJvdHRvbSByb3dzIGluIHRoZSBncmlkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGlubmVkQm90dG9tUm93RGF0YTogYW55W10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIHJvdyBtb2RlbCB0eXBlLlxuICAgICAgICAgKiBAZGVmYXVsdCAnY2xpZW50U2lkZSdcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd01vZGVsVHlwZTogUm93TW9kZWxUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhlIGRhdGEgdG8gYmUgZGlzcGxheWVkIGFzIHJvd3MgaW4gdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEYXRhOiBURGF0YVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGV4ZWN1dGluZyBhIGJhdGNoIG9mIGFzeW5jIHRyYW5zYWN0aW9ucy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25XYWl0TWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIFRyYW5zYWN0aW9ucyBjaGFuZ2luZyBzb3J0LCBmaWx0ZXIsIGdyb3VwIG9yIHBpdm90IHN0YXRlIHdoZW4gdHJhbnNhY3Rpb24gb25seSBjb250YWlucyB1cGRhdGVzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb2RlbFVwZGF0ZUFmdGVyVXBkYXRlVHJhbnNhY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIGRhdGFzb3VyY2UgZm9yIGluZmluaXRlIHNjcm9sbGluZy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRhdGFzb3VyY2U6IElEYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBleHRyYSBibGFuayByb3dzIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXIgYXQgdGhlIGVuZCBvZiB0aGUgZGF0YXNldCwgd2hpY2ggc2V0cyB0aGUgdmVydGljYWwgc2Nyb2xsIGFuZCB0aGVuIGFsbG93cyB0aGUgZ3JpZCB0byByZXF1ZXN0IHZpZXdpbmcgbW9yZSByb3dzIG9mIGRhdGEuXG4gICAgICAgICAqIEBkZWZhdWx0IDFcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlT3ZlcmZsb3dTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGV4dHJhIGJsYW5rIHJvd3MgdG8gZGlzcGxheSB0byB0aGUgdXNlciBhdCB0aGUgZW5kIG9mIHRoZSBkYXRhc2V0LCB3aGljaCBzZXRzIHRoZSB2ZXJ0aWNhbCBzY3JvbGwgYW5kIHRoZW4gYWxsb3dzIHRoZSBncmlkIHRvIHJlcXVlc3Qgdmlld2luZyBtb3JlIHJvd3Mgb2YgZGF0YS5cbiAgICAgICAgICogQGRlZmF1bHQgMVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IGhvdyBtYW55IGxvYWRpbmcgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGZvciB0aGUgcm9vdCBsZXZlbCBncm91cC5cbiAgICAgICAgICogQGRlZmF1bHQgMVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUluaXRpYWxSb3dDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIFNlcnZlci1zaWRlIFJvdyBNb2RlbCB3aWxsIHN1cHByZXNzIEluZmluaXRlIFNjcm9sbGluZyBhbmQgbG9hZCBhbGwgdGhlIGRhdGEgYXQgdGhlIGN1cnJlbnQgbGV2ZWwuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqIEBkZXByZWNhdGVkIHYzMS4xXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NlcnZlclNpZGVJbmZpbml0ZVNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcm93cyBmb3IgZWFjaCBibG9jayBpbiB0aGUgc3RvcmUsIGkuZS4gaG93IG1hbnkgcm93cyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgYXQgYSB0aW1lLlxuICAgICAgICAgKiBAZGVmYXVsdCAxMDBcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlQmxvY2tTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGJsb2NrcyB0byBrZWVwIGluIHRoZSBzdG9yZS4gRGVmYXVsdCBpcyBubyBsaW1pdCwgc28gZXZlcnkgcmVxdWVzdGVkIGJsb2NrIGlzIGtlcHQuIFVzZSB0aGlzIGlmIHlvdSBoYXZlIG1lbW9yeSBjb25jZXJucywgYW5kIGJsb2NrcyB0aGF0IHdlcmUgbGVhc3QgcmVjZW50bHkgdmlld2VkIHdpbGwgYmUgcHVyZ2VkIHdoZW4gdGhlIGxpbWl0IGlzIGhpdC4gVGhlIGdyaWQgd2lsbCBhZGRpdGlvbmFsbHkgbWFrZSBzdXJlIGl0IGhhcyBhbGwgdGhlIGJsb2NrcyBuZWVkZWQgdG8gZGlzcGxheSB3aGF0IGlzIGN1cnJlbnRseSB2aXNpYmxlLCBpbiBjYXNlIHRoaXMgcHJvcGVydHkgaXMgc2V0IHRvIGEgbG93IHZhbHVlLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4QmxvY2tzSW5DYWNoZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByZXF1ZXN0cyB0byBoaXQgdGhlIHNlcnZlciB3aXRoIGNvbmN1cnJlbnRseS4gSWYgdGhlIG1heCBpcyByZWFjaGVkLCByZXF1ZXN0cyBhcmUgcXVldWVkLlxuICAgICAgICAgKiBTZXQgdG8gYC0xYCBmb3Igbm8gbWF4aW11bSByZXN0cmljdGlvbiBvbiByZXF1ZXN0cy5cbiAgICAgICAgICogQGRlZmF1bHQgMlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29uY3VycmVudERhdGFzb3VyY2VSZXF1ZXN0czogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgbG9hZGluZyBhIGJsb2NrLiBVc2VmdWwgd2hlbiBzY3JvbGxpbmcgb3ZlciBtYW55IGJsb2NrcywgYXMgaXQgcHJldmVudHMgYmxvY2tzIGxvYWRpbmcgdW50aWwgc2Nyb2xsaW5nIGhhcyBzZXR0bGVkLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYmxvY2tMb2FkRGVib3VuY2VNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBjbG9zaW5nIGdyb3VwIHJvd3Mgd2lsbCByZW1vdmUgY2hpbGRyZW4gb2YgdGhhdCByb3cuIE5leHQgdGltZSB0aGUgcm93IGlzIG9wZW5lZCwgY2hpbGQgcm93cyB3aWxsIGJlIHJlYWQgZnJvbSB0aGUgZGF0YXNvdXJjZSBhZ2Fpbi4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwdXJnZUNsb3NlZFJvd05vZGVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBgc2VydmVyU2lkZURhdGFzb3VyY2VgIGZvciBzZXJ2ZXIgc2lkZSByb3cgbW9kZWwuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRGF0YXNvdXJjZTogSVNlcnZlclNpZGVEYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGFsd2F5cyByZWZyZXNoZXMgdG9wIGxldmVsIGdyb3VwcyByZWdhcmRsZXNzIG9mIHdoaWNoIGNvbHVtbiB3YXMgc29ydGVkLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZyAmIHNvcnRpbmcgaXMgaGFuZGxlZCBvbiB0aGUgc2VydmVyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRBbGxMZXZlbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgc29ydHMgZnVsbHkgbG9hZGVkIGdyb3VwcyBpbiB0aGUgYnJvd3NlciBpbnN0ZWFkIG9mIHJlcXVlc3RpbmcgZnJvbSB0aGUgc2VydmVyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUVuYWJsZUNsaWVudFNpZGVTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIG9ubHkgcmVmcmVzaCBncm91cHMgZGlyZWN0bHkgaW1wYWN0ZWQgYnkgYSBmaWx0ZXIuIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nICYgZmlsdGVyaW5nIGlzIGhhbmRsZWQgb24gdGhlIHNlcnZlci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVPbmx5UmVmcmVzaEZpbHRlcmVkR3JvdXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MzAgVGhpcyBwcm9wZXJ0eSBoYXMgYmVlbiBkZXByZWNhdGVkLiBVc2UgYHNlcnZlclNpZGVPbmx5UmVmcmVzaEZpbHRlcmVkR3JvdXBzYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlckFsbExldmVsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBTb3J0aW5nIHdpbGwgYmUgZG9uZSBvbiB0aGUgc2VydmVyLiBPbmx5IGFwcGxpY2FibGUgd2hlbiBgc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw9dHJ1ZWAuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydE9uU2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIEZpbHRlcmluZyB3aWxsIGJlIGRvbmUgb24gdGhlIHNlcnZlci4gT25seSBhcHBsaWNhYmxlIHdoZW4gYHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsPXRydWVgLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlck9uU2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBVc2VkIHRvIHNwbGl0IHBpdm90IGZpZWxkIHN0cmluZ3MgZm9yIGdlbmVyYXRpbmcgcGl2b3QgcmVzdWx0IGNvbHVtbnMgd2hlbiBgcGl2b3RSZXN1bHRGaWVsZHNgIGlzIHByb3ZpZGVkIGFzIHBhcnQgb2YgYSBgZ2V0Um93c2Agc3VjY2Vzcy5cbiAgICAgICAgICogQGRlZmF1bHQgJ18nXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlUGl2b3RSZXN1bHRGaWVsZFNlcGFyYXRvcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyB1c2UgdGhlIHZpZXdwb3J0IHJvdyBtb2RlbCB5b3UgbmVlZCB0byBwcm92aWRlIHRoZSBncmlkIHdpdGggYSBgdmlld3BvcnREYXRhc291cmNlYC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0RGF0YXNvdXJjZTogSVZpZXdwb3J0RGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyB2aWV3cG9ydCByb3cgbW9kZWwsIHNldHMgdGhlIHBhZ2Ugc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbFBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgdmlld3BvcnQgcm93IG1vZGVsLCBzZXRzIHRoZSBidWZmZXIgc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbEJ1ZmZlclNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgaG9yaXpvbnRhbCBzY3JvbGxiYXIuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgdmVydGljYWwgc2Nyb2xsYmFyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGRlYm91bmNlIHRoZSB2ZXJ0aWNhbCBzY3JvbGxiYXIuIENhbiBwcm92aWRlIHNtb290aGVyIHNjcm9sbGluZyBvbiBzbG93IG1hY2hpbmVzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBuZXZlciBzaG93IHRoZSBob3Jpem9udGFsIHNjcm9sbC4gVGhpcyBpcyB1c2VmdWwgaWYgdGhlIGdyaWQgaXMgYWxpZ25lZCB3aXRoIGFub3RoZXIgZ3JpZCBhbmQgd2lsbCBzY3JvbGwgd2hlbiB0aGUgb3RoZXIgZ3JpZCBzY3JvbGxzLiAoU2hvdWxkIG5vdCBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsYC4pXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzY3JvbGwgdG8gdGhlIHRvcCB3aGVuIG5ldyByb3cgZGF0YSBpcyBwcm92aWRlZC4gVXNlIHRoaXMgaWYgeW91IGRvbid0IHdhbnQgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIG9mIHNjcm9sbGluZyB0byB0aGUgdG9wIGV2ZXJ5IHRpbWUgeW91IGxvYWQgbmV3IGRhdGEuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbE9uTmV3RGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IGFsbG93IG1vdXNld2hlZWwgLyB0b3VjaHBhZCBzY3JvbGwgd2hlbiBwb3B1cCBlbGVtZW50cyBhcmUgcHJlc2VudC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCB1c2UgYW5pbWF0aW9uIGZyYW1lcyB3aGVuIGRyYXdpbmcgcm93cyB3aGlsZSBzY3JvbGxpbmcuIFVzZSB0aGlzIGlmIHRoZSBncmlkIGlzIHdvcmtpbmcgZmFzdCBlbm91Z2ggdGhhdCB5b3UgZG9uJ3QgbmVlZCBhbmltYXRpb24gZnJhbWVzIGFuZCB5b3UgZG9uJ3Qgd2FudCB0aGUgZ3JpZCB0byBmbGlja2VyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBtaWRkbGUgY2xpY2tzIHdpbGwgcmVzdWx0IGluIGBjbGlja2AgZXZlbnRzIGZvciBjZWxscyBhbmQgcm93cy4gT3RoZXJ3aXNlIHRoZSBicm93c2VyIHdpbGwgdXNlIG1pZGRsZSBjbGljayB0byBzY3JvbGwgdGhlIGdyaWQuPGJyIC8+KipOb3RlOioqIE5vdCBhbGwgYnJvd3NlcnMgZmlyZSBgY2xpY2tgIGV2ZW50cyB3aXRoIHRoZSBtaWRkbGUgYnV0dG9uLiBNb3N0IHdpbGwgZmlyZSBvbmx5IGBtb3VzZWRvd25gIGFuZCBgbW91c2V1cGAgZXZlbnRzLCB3aGljaCBjYW4gYmUgdXNlZCB0byBmb2N1cyBhIGNlbGwsIGJ1dCB3aWxsIG5vdCB3b3JrIHRvIGNhbGwgdGhlIGBvbkNlbGxDbGlja2VkYCBmdW5jdGlvbi5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIG1vdXNlIHdoZWVsIGV2ZW50cyB3aWxsIGJlIHBhc3NlZCB0byB0aGUgYnJvd3Nlci4gVXNlZnVsIGlmIHlvdXIgZ3JpZCBoYXMgbm8gdmVydGljYWwgc2Nyb2xscyBhbmQgeW91IHdhbnQgdGhlIG1vdXNlIHRvIHNjcm9sbCB0aGUgYnJvd3NlciBwYWdlLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQcmV2ZW50RGVmYXVsdE9uTW91c2VXaGVlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGVsbCB0aGUgZ3JpZCBob3cgd2lkZSBpbiBwaXhlbHMgdGhlIHNjcm9sbGJhciBpcywgd2hpY2ggaXMgdXNlZCBpbiBncmlkIHdpZHRoIGNhbGN1bGF0aW9ucy4gU2V0IG9ubHkgaWYgdXNpbmcgbm9uLXN0YW5kYXJkIGJyb3dzZXItcHJvdmlkZWQgc2Nyb2xsYmFycywgc28gdGhlIGdyaWQgY2FuIHVzZSB0aGUgbm9uLXN0YW5kYXJkIHNpemUgaW4gaXRzIGNhbGN1bGF0aW9ucy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNjcm9sbGJhcldpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFR5cGUgb2YgUm93IFNlbGVjdGlvbjogYHNpbmdsZWAsIGBtdWx0aXBsZWAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTZWxlY3Rpb246ICdzaW5nbGUnIHwgJ211bHRpcGxlJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBtdWx0aXBsZSByb3dzIHRvIGJlIHNlbGVjdGVkIHVzaW5nIHNpbmdsZSBjbGljay5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvd3Mgd2lsbCBub3QgYmUgZGVzZWxlY3RlZCBpZiB5b3UgaG9sZCBkb3duIGBDdHJsYCBhbmQgY2xpY2sgdGhlIHJvdyBvciBwcmVzcyBgU3BhY2VgLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCByb3cgc2VsZWN0aW9uIHdvbid0IGhhcHBlbiB3aGVuIHJvd3MgYXJlIGNsaWNrZWQuIFVzZSB3aGVuIHlvdSBvbmx5IHdhbnQgY2hlY2tib3ggc2VsZWN0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBjZWxscyB3b24ndCBiZSBmb2N1c2FibGUuIFRoaXMgbWVhbnMga2V5Ym9hcmQgbmF2aWdhdGlvbiB3aWxsIGJlIGRpc2FibGVkIGZvciBncmlkIGNlbGxzLCBidXQgcmVtYWluIGVuYWJsZWQgaW4gb3RoZXIgZWxlbWVudHMgb2YgdGhlIGdyaWQgc3VjaCBhcyBjb2x1bW4gaGVhZGVycywgZmxvYXRpbmcgZmlsdGVycywgdG9vbCBwYW5lbHMuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBoZWFkZXIgY2VsbHMgd29uJ3QgYmUgZm9jdXNhYmxlLiBUaGlzIG1lYW5zIGtleWJvYXJkIG5hdmlnYXRpb24gd2lsbCBiZSBkaXNhYmxlZCBmb3IgZ3JpZCBoZWFkZXIgY2VsbHMsIGJ1dCByZW1haW4gZW5hYmxlZCBpbiBvdGhlciBlbGVtZW50cyBvZiB0aGUgZ3JpZCBzdWNoIGFzIGdyaWQgY2VsbHMgYW5kIHRvb2wgcGFuZWxzLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIZWFkZXJGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBvbmx5IGEgc2luZ2xlIHJhbmdlIGNhbiBiZSBzZWxlY3RlZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBiZSBhYmxlIHRvIHNlbGVjdCB0aGUgdGV4dCB3aXRoaW4gY2VsbHMuXG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAqKk5vdGU6KiogV2hlbiB0aGlzIGlzIHNldCB0byBgdHJ1ZWAsIHRoZSBjbGlwYm9hcmQgc2VydmljZSBpcyBkaXNhYmxlZCBhbmQgb25seSBzZWxlY3RlZCB0ZXh0IGlzIGNvcGllZC5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBSYW5nZSBTZWxlY3Rpb24uXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIFJhbmdlIEhhbmRsZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgRmlsbCBIYW5kbGUuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCd4J2AgdG8gZm9yY2UgdGhlIGZpbGwgaGFuZGxlIGRpcmVjdGlvbiB0byBob3Jpem9udGFsLCBvciBzZXQgdG8gYCd5J2AgdG8gZm9yY2UgdGhlIGZpbGwgaGFuZGxlIGRpcmVjdGlvbiB0byB2ZXJ0aWNhbC5cbiAgICAgICAgICogQGRlZmF1bHQgJ3h5J1xuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbEhhbmRsZURpcmVjdGlvbjogJ3gnIHwgJ3knIHwgJ3h5JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHByZXZlbnQgY2VsbCB2YWx1ZXMgZnJvbSBiZWluZyBjbGVhcmVkIHdoZW4gdGhlIFJhbmdlIFNlbGVjdGlvbiBpcyByZWR1Y2VkIGJ5IHRoZSBGaWxsIEhhbmRsZS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xlYXJPbkZpbGxSZWR1Y3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IGRlZmluaW5nIHRoZSBvcmRlciBpbiB3aGljaCBzb3J0aW5nIG9jY3VycyAoaWYgc29ydGluZyBpcyBlbmFibGVkKS4gVmFsdWVzIGNhbiBiZSBgJ2FzYydgLCBgJ2Rlc2MnYCBvciBgbnVsbGAuIEZvciBleGFtcGxlOiBgc29ydGluZ09yZGVyOiBbJ2FzYycsICdkZXNjJ11gLlxuICAgICAgICAgKiBAZGVmYXVsdCBbbnVsbCwgJ2FzYycsICdkZXNjJ11cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlcjogKFNvcnREaXJlY3Rpb24pW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3BlY2lmeSB0aGF0IHRoZSBzb3J0IHNob3VsZCB0YWtlIGFjY2VudGVkIGNoYXJhY3RlcnMgaW50byBhY2NvdW50LiBJZiB0aGlzIGZlYXR1cmUgaXMgdHVybmVkIG9uIHRoZSBzb3J0IHdpbGwgYmUgc2xvd2VyLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlICdubyBzb3J0JyBpY29uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtdWx0aS1zb3J0IHdoZW4gdGhlIHVzZXIgc2hpZnQtY2xpY2tzIGEgY29sdW1uIGhlYWRlci5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTXVsdGlTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBtdWx0aS1zb3J0IHdoZW4gdGhlIHVzZXIgY2xpY2tzIGEgY29sdW1uIGhlYWRlciwgcmVnYXJkbGVzcyBvZiBrZXkgcHJlc3Nlcy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnY3RybCdgIHRvIGhhdmUgbXVsdGkgc29ydGluZyB3b3JrIHVzaW5nIHRoZSBgQ3RybGAgKG9yIGBDb21tYW5kIOKMmGAgZm9yIE1hYykga2V5LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbXVsdGlTb3J0S2V5OiAnY3RybCcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydGluZyBvZiB1bi1zb3J0ZWQgZGF0YSB0byBtYXRjaCBvcmlnaW5hbCByb3cgZGF0YS5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJY29ucyB0byB1c2UgaW5zaWRlIHRoZSBncmlkIGluc3RlYWQgb2YgdGhlIGdyaWQncyBkZWZhdWx0IGljb25zLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfCBzdHJpbmc7IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERlZmF1bHQgcm93IGhlaWdodCBpbiBwaXhlbHMuXG4gICAgICAgICAqIEBkZWZhdWx0IDI1XG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIHN0eWxlIHByb3BlcnRpZXMgdG8gYXBwbHkgdG8gYWxsIHJvd3MuIFNldCB0byBhbiBvYmplY3Qgb2Yga2V5IChzdHlsZSBuYW1lcykgYW5kIHZhbHVlcyAoc3R5bGUgdmFsdWVzKS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1N0eWxlOiBSb3dTdHlsZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ1NTIGNsYXNzKGVzKSBmb3IgYWxsIHJvd3MuIFByb3ZpZGUgZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSBvciBhcnJheSBvZiBzdHJpbmdzIChhcnJheSBvZiBjbGFzcyBuYW1lcykuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJ1bGVzIHdoaWNoIGNhbiBiZSBhcHBsaWVkIHRvIGluY2x1ZGUgY2VydGFpbiBDU1MgY2xhc3Nlcy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXM6IFJvd0NsYXNzUnVsZXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBoaWdobGlnaHQgcm93cyBieSBhZGRpbmcgdGhlIGBhZy1yb3ctaG92ZXJgIENTUyBjbGFzcy5cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93SG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFVzZXMgQ1NTIGB0b3BgIGluc3RlYWQgb2YgQ1NTIGB0cmFuc2Zvcm1gIGZvciBwb3NpdGlvbmluZyByb3dzLiBVc2VmdWwgaWYgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiBpcyBjYXVzaW5nIGlzc3VlcyBzdWNoIGFzIHVzZWQgaW4gcm93IHNwYW5uaW5nLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGlnaGxpZ2h0IGNvbHVtbnMgYnkgYWRkaW5nIHRoZSBgYWctY29sdW1uLWhvdmVyYCBDU1MgY2xhc3MuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBgZ3JpZElkYCBmb3IgdGhpcyBpbnN0YW5jZSBvZiB0aGUgZ3JpZC4gVmFsdWUgd2lsbCBiZSBzZXQgb24gdGhlIHJvb3QgRE9NIG5vZGUgdXNpbmcgdGhlIGF0dHJpYnV0ZSBgZ3JpZC1pZGAgYXMgd2VsbCBhcyBiZWluZyBhY2Nlc3NpYmxlIHZpYSB0aGUgYGdyaWRBcGkuZ2V0R3JpZElkKClgIG1ldGhvZC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyaWRJZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHNvcnRzIG9ubHkgdGhlIHJvd3MgYWRkZWQvdXBkYXRlZCBieSBhIHRyYW5zYWN0aW9uLlxuICAgICAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGFEaXNwbGF5VHlwZTogVHJlZURhdGFEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI5LjJcbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1Bhc3NpdmU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEluaXRpYWwgc3RhdGUgZm9yIHRoZSBncmlkLiBPbmx5IHJlYWQgb25jZSBvbiBpbml0aWFsaXphdGlvbi4gQ2FuIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgYXBpLmdldFN0YXRlKClgIHRvIHNhdmUgYW5kIHJlc3RvcmUgZ3JpZCBzdGF0ZS5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTdGF0ZTogR3JpZFN0YXRlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgY3VzdG9taXNpbmcgdGhlIGNvbnRleHQgbWVudS5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENvbnRleHRNZW51SXRlbXM6IEdldENvbnRleHRNZW51SXRlbXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgY3VzdG9taXNpbmcgdGhlIG1haW4gJ2NvbHVtbiBoZWFkZXInIG1lbnUuXG4gICAgICAgICAqIEBpbml0aWFsXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRNYWluTWVudUl0ZW1zOiBHZXRNYWluTWVudUl0ZW1zPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHVzZXIgdG8gcHJvY2VzcyBwb3B1cHMgYWZ0ZXIgdGhleSBhcmUgY3JlYXRlZC4gQXBwbGljYXRpb25zIGNhbiB1c2UgdGhpcyBpZiB0aGV5IHdhbnQgdG8sIGZvciBleGFtcGxlLCByZXBvc2l0aW9uIHRoZSBwb3B1cC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvc3RQcm9jZXNzUG9wdXA6ICgocGFyYW1zOiBQb3N0UHJvY2Vzc1BvcHVwUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB0aGUgdXNlciB0byBwcm9jZXNzIHRoZSBjb2x1bW5zIGJlaW5nIHJlbW92ZWQgZnJvbSB0aGUgcGlubmVkIHNlY3Rpb24gYmVjYXVzZSB0aGUgdmlld3BvcnQgaXMgdG9vIHNtYWxsIHRvIGFjY29tbW9kYXRlIHRoZW0uXG4gICAgICAgICAqIFJldHVybnMgYW4gYXJyYXkgb2YgY29sdW1ucyB0byBiZSByZW1vdmVkIGZyb20gdGhlIHBpbm5lZCBhcmVhcy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NVbnBpbm5lZENvbHVtbnM6ICgocGFyYW1zOiBQcm9jZXNzVW5waW5uZWRDb2x1bW5zUGFyYW1zPFREYXRhPikgPT4gQ29sdW1uW10pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgeW91IHRvIHByb2Nlc3MgY2VsbHMgZm9yIHRoZSBjbGlwYm9hcmQuIEhhbmR5IGlmIGZvciBleGFtcGxlIHlvdSBoYXZlIGBEYXRlYCBvYmplY3RzIHRoYXQgbmVlZCB0byBoYXZlIGEgcGFydGljdWxhciBmb3JtYXQgaWYgaW1wb3J0aW5nIGludG8gRXhjZWwuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBjbGlwYm9hcmQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzSGVhZGVyRm9yQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBncm91cCBoZWFkZXIgdmFsdWVzIGZvciB0aGUgY2xpcGJvYXJkLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0dyb3VwSGVhZGVyRm9yQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0dyb3VwSGVhZGVyRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGNlbGxzIGZyb20gdGhlIGNsaXBib2FyZC4gSGFuZHkgaWYgZm9yIGV4YW1wbGUgeW91IGhhdmUgbnVtYmVyIGZpZWxkcywgYW5kIHdhbnQgdG8gYmxvY2sgbm9uLW51bWJlcnMgZnJvbSBnZXR0aW5nIGludG8gdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZyb21DbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gZ2V0IHRoZSBkYXRhIHRoYXQgd291bGQgb3RoZXJ3aXNlIGdvIHRvIHRoZSBjbGlwYm9hcmQuIFRvIGJlIHVzZWQgd2hlbiB5b3Ugd2FudCB0byBjb250cm9sIHRoZSAnY29weSB0byBjbGlwYm9hcmQnIG9wZXJhdGlvbiB5b3Vyc2VsZi5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlbmRUb0NsaXBib2FyZDogKChwYXJhbXM6IFNlbmRUb0NsaXBib2FyZFBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY29tcGxldGUgY29udHJvbCBvZiB0aGUgcGFzdGUgb3BlcmF0aW9uLCBpbmNsdWRpbmcgY2FuY2VsbGluZyB0aGUgb3BlcmF0aW9uIChzbyBub3RoaW5nIGhhcHBlbnMpIG9yIHJlcGxhY2luZyB0aGUgZGF0YSB3aXRoIG90aGVyIGRhdGEuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzRGF0YUZyb21DbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmdbXVtdIHwgbnVsbCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEdyaWQgY2FsbHMgdGhpcyBtZXRob2QgdG8ga25vdyBpZiBhbiBleHRlcm5hbCBmaWx0ZXIgaXMgcHJlc2VudC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50OiAoKHBhcmFtczogSXNFeHRlcm5hbEZpbHRlclByZXNlbnRQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2hvdWxkIHJldHVybiBgdHJ1ZWAgaWYgZXh0ZXJuYWwgZmlsdGVyIHBhc3Nlcywgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb2VzRXh0ZXJuYWxGaWx0ZXJQYXNzOiAoKG5vZGU6IElSb3dOb2RlPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgdG8gY3VzdG9taXNlIHRoZSBjaGFydCB0b29sYmFyIGl0ZW1zLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hhcnRUb29sYmFySXRlbXM6IEdldENoYXJ0VG9vbGJhckl0ZW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBlbmFibGUgZGlzcGxheWluZyB0aGUgY2hhcnQgaW4gYW4gYWx0ZXJuYXRpdmUgY2hhcnQgY29udGFpbmVyLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3JlYXRlQ2hhcnRDb250YWluZXI6ICgocGFyYW1zOiBDaGFydFJlZlBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIG5hdmlnYXRpb24gKGFycm93KSBrZXkgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgSGVhZGVyIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgaGVhZGVyLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRIZWFkZXI6ICgocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtczxURGF0YT4pID0+IChIZWFkZXJQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBgVGFiYCBrZXkgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgSGVhZGVyIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgaGVhZGVyLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0SGVhZGVyOiAoKHBhcmFtczogVGFiVG9OZXh0SGVhZGVyUGFyYW1zPFREYXRhPikgPT4gKEhlYWRlclBvc2l0aW9uIHwgbnVsbCkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIG5hdmlnYXRpb24gKGFycm93KSBrZXkgd2hlbiBhIGNlbGwgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IENlbGwgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBjZWxsLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRDZWxsOiAoKHBhcmFtczogTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zPFREYXRhPikgPT4gKENlbGxQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBgVGFiYCBrZXkgd2hlbiBhIGNlbGwgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IENlbGwgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgbnVsbCB0byBzdGF5IG9uIGN1cnJlbnQgY2VsbC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dENlbGw6ICgocGFyYW1zOiBUYWJUb05leHRDZWxsUGFyYW1zPFREYXRhPikgPT4gKENlbGxQb3NpdGlvbiB8IG51bGwpKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldExvY2FsZVRleHQ6ICgocGFyYW1zOiBHZXRMb2NhbGVUZXh0UGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgd2hhdCBgZG9jdW1lbnRgIGlzIHVzZWQuIEN1cnJlbnRseSB1c2VkIGJ5IERyYWcgYW5kIERyb3AgKG1heSBleHRlbmQgdG8gb3RoZXIgcGxhY2VzIGluIHRoZSBmdXR1cmUpLiBVc2UgdGhpcyB3aGVuIHlvdSB3YW50IHRoZSBncmlkIHRvIHVzZSBhIGRpZmZlcmVudCBgZG9jdW1lbnRgIHRoYW4gdGhlIG9uZSBhdmFpbGFibGUgb24gdGhlIGdsb2JhbCBzY29wZS4gVGhpcyBjYW4gaGFwcGVuIGlmIGRvY2tpbmcgb3V0IGNvbXBvbmVudHMgKHNvbWV0aGluZyB3aGljaCBFbGVjdHJvbiBzdXBwb3J0cylcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldERvY3VtZW50OiAoKCkgPT4gRG9jdW1lbnQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBmb3JtYXQgdGhlIG51bWJlcnMgaW4gdGhlIHBhZ2luYXRpb24gcGFuZWwsIGkuZS4gJ3JvdyBjb3VudCcgYW5kICdwYWdlIG51bWJlcicgbGFiZWxzLiBUaGlzIGlzIGZvciBwYWdpbmF0aW9uIHBhbmVsIG9ubHksIHRvIGZvcm1hdCBudW1iZXJzIGluc2lkZSB0aGUgZ3JpZCdzIGNlbGxzIChpLmUuIHlvdXIgZGF0YSksIHRoZW4gdXNlIGB2YWx1ZUZvcm1hdHRlcmAgaW4gdGhlIGNvbHVtbiBkZWZpbml0aW9ucy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXI6ICgocGFyYW1zOiBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gdXNlIHdoZW4geW91IG5lZWQgYWNjZXNzIHRvIG1vcmUgdGhlbiB0aGUgY3VycmVudCBjb2x1bW4gZm9yIGFnZ3JlZ2F0aW9uLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0R3JvdXBSb3dBZ2c6ICgocGFyYW1zOiBHZXRHcm91cFJvd0FnZ1BhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIChDbGllbnQtc2lkZSBSb3cgTW9kZWwgb25seSkgQWxsb3dzIGdyb3VwcyB0byBiZSBvcGVuIGJ5IGRlZmF1bHQuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0dyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBkZWZhdWx0IHNvcnRpbmcgb2YgZ3JvdXBzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yOiAoKHBhcmFtczogSW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yUGFyYW1zPFREYXRhPikgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIHBpdm90aW5nLCB0byBhbGxvdyBjaGFuZ2luZyB0aGUgc2Vjb25kIGNvbHVtbiBkZWZpbml0aW9uLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sRGVmOiAoKGNvbERlZjogQ29sRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBwaXZvdGluZywgdG8gYWxsb3cgY2hhbmdpbmcgdGhlIHNlY29uZCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbi5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NQaXZvdFJlc3VsdENvbEdyb3VwRGVmOiAoKGNvbEdyb3VwRGVmOiBDb2xHcm91cERlZjxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdoZW4gd29ya2luZyB3aXRoIFRyZWUgRGF0YSB3aGVuIGB0cmVlRGF0YSA9IHRydWVgLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RGF0YVBhdGg6IEdldERhdGFQYXRoPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHNldHRpbmcgdGhlIGNoaWxkIGNvdW50IGZvciBhIGdyb3VwIHJvdy5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENoaWxkQ291bnQ6ICgoZGF0YUl0ZW06IGFueSkgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHByb3ZpZGluZyBkaWZmZXJlbnQgcGFyYW1zIGZvciBkaWZmZXJlbnQgbGV2ZWxzIG9mIGdyb3VwaW5nLlxuICAgICAgICAgKiBAaW5pdGlhbFxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXM6ICgocGFyYW1zOiBHZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc1BhcmFtcykgPT4gU2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXMpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgZ3JvdXBzIHRvIGJlIG9wZW4gYnkgZGVmYXVsdC5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcykgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjYW5jZWxsaW5nIHRyYW5zYWN0aW9ucy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb246IElzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNTUk0gVHJlZSBEYXRhOiBBbGxvd3Mgc3BlY2lmeWluZyB3aGljaCByb3dzIGFyZSBleHBhbmRhYmxlLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXA6IElzU2VydmVyU2lkZUdyb3VwIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTU1JNIFRyZWUgRGF0YTogQWxsb3dzIHNwZWNpZnlpbmcgZ3JvdXAga2V5cy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cEtleTogR2V0U2VydmVyU2lkZUdyb3VwS2V5IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSZXR1cm4gYSBidXNpbmVzcyBrZXkgZm9yIHRoZSBub2RlLiBJZiBpbXBsZW1lbnRlZCwgZWFjaCByb3cgaW4gdGhlIERPTSB3aWxsIGhhdmUgYW4gYXR0cmlidXRlIGByb3ctYnVzaW5lc3Mta2V5PSdhYmMnYCB3aGVyZSBgYWJjYCBpcyB3aGF0IHlvdSByZXR1cm4gYXMgdGhlIGJ1c2luZXNzIGtleS5cbiAgICAgICAgICogVGhpcyBpcyB1c2VmdWwgZm9yIGF1dG9tYXRlZCB0ZXN0aW5nLCBhcyBpdCBwcm92aWRlcyBhIHdheSBmb3IgeW91ciB0b29sIHRvIGlkZW50aWZ5IHJvd3MgYmFzZWQgb24gdW5pcXVlIGJ1c2luZXNzIGtleXMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRCdXNpbmVzc0tleUZvck5vZGU6ICgobm9kZTogSVJvd05vZGU8VERhdGE+KSA9PiBzdHJpbmcpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgc2V0dGluZyB0aGUgSUQgZm9yIGEgcGFydGljdWxhciByb3cgbm9kZSBiYXNlZCBvbiB0aGUgZGF0YS5cbiAgICAgICAgICogQGluaXRpYWxcbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0lkOiBHZXRSb3dJZEZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGdldFJvd0lkKCkgY2FsbGJhY2sgaXMgaW1wbGVtZW50ZWQgYW5kIG5ldyBSb3cgRGF0YSBpcyBzZXQsIHRoZSBncmlkIHdpbGwgZGlzcmVnYXJkIGFsbCBwcmV2aW91cyByb3dzIGFuZCB0cmVhdCB0aGUgbmV3IFJvdyBEYXRhIGFzIG5ldyBkYXRhLiBBcyBhIGNvbnNlcXVlbmNlLCBhbGwgUm93IFN0YXRlIChlZyBzZWxlY3Rpb24sIHJlbmRlcmVkIHJvd3MpIHdpbGwgYmUgcmVzZXQuXG4gICAgICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZXNldFJvd0RhdGFPblVwZGF0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIHJvd3MgYWZ0ZXIgdGhleSBhcmUgY3JlYXRlZCwgc28geW91IGNhbiBkbyBmaW5hbCBhZGRpbmcgb2YgY3VzdG9tIGF0dHJpYnV0ZXMgZXRjLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Jvd1Bvc3RDcmVhdGU6ICgocGFyYW1zOiBQcm9jZXNzUm93UGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIHJvd3MgYXJlIHNlbGVjdGFibGUuIEJ5IGRlZmF1bHQgcm93cyBhcmUgc2VsZWN0YWJsZSwgc28gcmV0dXJuIGBmYWxzZWAgdG8gbWFrZSBhIHJvdyB1bi1zZWxlY3RhYmxlLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dTZWxlY3RhYmxlOiBJc1Jvd1NlbGVjdGFibGU8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggTWFzdGVyIERldGFpbCB0byBkZXRlcm1pbmUgaWYgYSByb3cgc2hvdWxkIGJlIGEgbWFzdGVyIHJvdy4gSWYgYGZhbHNlYCBpcyByZXR1cm5lZCBubyBkZXRhaWwgcm93IHdpbGwgZXhpc3QgZm9yIHRoaXMgcm93LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dNYXN0ZXI6IElzUm93TWFzdGVyPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gZmlsbCB2YWx1ZXMgaW5zdGVhZCBvZiBzaW1wbHkgY29weWluZyB2YWx1ZXMgb3IgaW5jcmVhc2luZyBudW1iZXIgdmFsdWVzIHVzaW5nIGxpbmVhciBwcm9ncmVzc2lvbi5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbGxPcGVyYXRpb246ICgocGFyYW1zOiBGaWxsT3BlcmF0aW9uUGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gcGVyZm9ybSBhZGRpdGlvbmFsIHNvcnRpbmcgYWZ0ZXIgdGhlIGdyaWQgaGFzIHNvcnRlZCB0aGUgcm93cy5cbiAgICAgICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvc3RTb3J0Um93czogKChwYXJhbXM6IFBvc3RTb3J0Um93c1BhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dTdHlsZWAgdG8gc2V0IHN0eWxlIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYW4gb2JqZWN0IG9mIENTUyB2YWx1ZXMgb3IgdW5kZWZpbmVkIGZvciBubyBzdHlsZXMuXG4gICAgICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dTdHlsZTogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zPFREYXRhPikgPT4gUm93U3R5bGUgfCB1bmRlZmluZWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dDbGFzc2AgdG8gc2V0IGNsYXNzKGVzKSBmb3IgZWFjaCByb3cgaW5kaXZpZHVhbGx5LiBGdW5jdGlvbiBzaG91bGQgcmV0dXJuIGVpdGhlciBhIHN0cmluZyAoY2xhc3MgbmFtZSksIGFycmF5IG9mIHN0cmluZ3MgKGFycmF5IG9mIGNsYXNzIG5hbWVzKSBvciB1bmRlZmluZWQgZm9yIG5vIGNsYXNzLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93Q2xhc3M6ICgocGFyYW1zOiBSb3dDbGFzc1BhcmFtczxURGF0YT4pID0+IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdmVyc2lvbiBvZiBwcm9wZXJ0eSBgcm93SGVpZ2h0YCB0byBzZXQgaGVpZ2h0IGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYSBwb3NpdGl2ZSBudW1iZXIgb2YgcGl4ZWxzLCBvciByZXR1cm4gYG51bGxgL2B1bmRlZmluZWRgIHRvIHVzZSB0aGUgZGVmYXVsdCByb3cgaGVpZ2h0LlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SGVpZ2h0OiAoKHBhcmFtczogUm93SGVpZ2h0UGFyYW1zPFREYXRhPikgPT4gbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRlbGxzIHRoZSBncmlkIGlmIHRoaXMgcm93IHNob3VsZCBiZSByZW5kZXJlZCBhcyBmdWxsIHdpZHRoLlxuICAgICAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNGdWxsV2lkdGhSb3c6ICgocGFyYW1zOiBJc0Z1bGxXaWR0aFJvd1BhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgLyoqIFRoZSB0b29sIHBhbmVsIHZpc2liaWxpdHkgaGFzIGNoYW5nZWQuIEZpcmVzIHR3aWNlIGlmIHN3aXRjaGluZyBiZXR3ZWVuIHBhbmVscyAtIG9uY2Ugd2l0aCB0aGUgb2xkIHBhbmVsIGFuZCBvbmNlIHdpdGggdGhlIG5ldyBwYW5lbC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sUGFuZWxWaXNpYmxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSB0b29sIHBhbmVsIHNpemUgaGFzIGJlZW4gY2hhbmdlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sUGFuZWxTaXplQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFRvb2xQYW5lbFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBjb2x1bW4gbWVudSB2aXNpYmlsaXR5IGhhcyBjaGFuZ2VkLiBGaXJlcyB0d2ljZSBpZiBzd2l0Y2hpbmcgYmV0d2VlbiB0YWJzIC0gb25jZSB3aXRoIHRoZSBvbGQgdGFiIGFuZCBvbmNlIHdpdGggdGhlIG5ldyB0YWIuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uTWVudVZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uTWVudVZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uTWVudVZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDdXQgb3BlcmF0aW9uIGhhcyBzdGFydGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGN1dFN0YXJ0OiBFdmVudEVtaXR0ZXI8Q3V0U3RhcnRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDdXRTdGFydEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ3V0IG9wZXJhdGlvbiBoYXMgZW5kZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY3V0RW5kOiBFdmVudEVtaXR0ZXI8Q3V0RW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q3V0RW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBQYXN0ZSBvcGVyYXRpb24gaGFzIHN0YXJ0ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVTdGFydDogRXZlbnRFbWl0dGVyPFBhc3RlU3RhcnRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBQYXN0ZSBvcGVyYXRpb24gaGFzIGVuZGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlRW5kOiBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZUVuZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4sIG9yIGdyb3VwIG9mIGNvbHVtbnMsIHdhcyBoaWRkZW4gLyBzaG93bi5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WaXNpYmxlOiBFdmVudEVtaXR0ZXI8Q29sdW1uVmlzaWJsZUV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uLCBvciBncm91cCBvZiBjb2x1bW5zLCB3YXMgcGlubmVkIC8gdW5waW5uZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGlubmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGlubmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUGlubmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgcmVzaXplZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5SZXNpemVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUmVzaXplZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJlc2l6ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY29sdW1uIHdhcyBtb3ZlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Nb3ZlZDogRXZlbnRFbWl0dGVyPENvbHVtbk1vdmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgdmFsdWUgY29sdW1uIHdhcyBhZGRlZCBvciByZW1vdmVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIHBpdm90IG1vZGUgZmxhZyB3YXMgY2hhbmdlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdE1vZGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcGl2b3QgY29sdW1uIHdhcyBhZGRlZCwgcmVtb3ZlZCBvciBvcmRlciBjaGFuZ2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4gZ3JvdXAgd2FzIG9wZW5lZCAvIGNsb3NlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uR3JvdXBPcGVuZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFVzZXIgc2V0IG5ldyBjb2x1bW5zLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIG5ld0NvbHVtbnNMb2FkZWQ6IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGxpc3Qgb2YgZ3JpZCBjb2x1bW5zIGNoYW5nZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBkaXNwbGF5ZWQgY29sdW1ucyBjaGFuZ2VkLiBUaGlzIGNhbiByZXN1bHQgZnJvbSBjb2x1bW5zIG9wZW4gLyBjbG9zZSwgY29sdW1uIG1vdmUsIHBpdm90LCBncm91cCwgZXRjLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxEaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGxpc3Qgb2YgcmVuZGVyZWQgY29sdW1ucyBjaGFuZ2VkIChvbmx5IGNvbHVtbnMgaW4gdGhlIHZpc2libGUgc2Nyb2xsZWQgdmlld3BvcnQgYXJlIHJlbmRlcmVkIGJ5IGRlZmF1bHQpLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogU2hvdGd1biAtIGdldHMgY2FsbGVkIHdoZW4gZWl0aGVyIGEpIG5ldyBjb2x1bW5zIGFyZSBzZXQgb3IgYikgYGFwaS5hcHBseUNvbHVtblN0YXRlKClgIGlzIHVzZWQsIHNvIGV2ZXJ5dGhpbmcgaGFzIGNoYW5nZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIG1vdXNlIGN1cnNvciBpcyBpbml0aWFsbHkgbW92ZWQgb3ZlciBhIGNvbHVtbiBoZWFkZXIuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uSGVhZGVyTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyTW91c2VPdmVyRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyTW91c2VPdmVyRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIG1vdXNlIGN1cnNvciBpcyBtb3ZlZCBvdXQgb2YgYSBjb2x1bW4gaGVhZGVyLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkhlYWRlck1vdXNlTGVhdmU6IEV2ZW50RW1pdHRlcjxDb2x1bW5IZWFkZXJNb3VzZUxlYXZlRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyTW91c2VMZWF2ZUV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjbGljayBpcyBwZXJmb3JtZWQgb24gYSBjb2x1bW4gaGVhZGVyLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkhlYWRlckNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5IZWFkZXJDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb250ZXh0IG1lbnUgYWN0aW9uLCBzdWNoIGFzIHJpZ2h0LWNsaWNrIG9yIGNvbnRleHQgbWVudSBrZXkgcHJlc3MsIGlzIHBlcmZvcm1lZCBvbiBhIGNvbHVtbiBoZWFkZXIuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uSGVhZGVyQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxDb2x1bW5IZWFkZXJDb250ZXh0TWVudUV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkhlYWRlckNvbnRleHRNZW51RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBPbmx5IHVzZWQgYnkgQW5ndWxhciwgUmVhY3QgYW5kIFZ1ZUpTIEFHIEdyaWQgY29tcG9uZW50cyAobm90IHVzZWQgaWYgZG9pbmcgcGxhaW4gSmF2YVNjcmlwdCkuXG4gICAgICAgICAqIElmIHRoZSBncmlkIHJlY2VpdmVzIGNoYW5nZXMgZHVlIHRvIGJvdW5kIHByb3BlcnRpZXMsIHRoaXMgZXZlbnQgZmlyZXMgYWZ0ZXIgdGhlIGdyaWQgaGFzIGZpbmlzaGVkIHByb2Nlc3NpbmcgdGhlIGNoYW5nZS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb21wb25lbnRTdGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFZhbHVlIGhhcyBjaGFuZ2VkIGFmdGVyIGVkaXRpbmcgKHRoaXMgZXZlbnQgd2lsbCBub3QgZmlyZSBpZiBlZGl0aW5nIHdhcyBjYW5jZWxsZWQsIGVnIEVTQyB3YXMgcHJlc3NlZCkgb3JcbiAgICAgICAgICogIGlmIGNlbGwgdmFsdWUgaGFzIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgY3V0LCBwYXN0ZSwgY2VsbCBjbGVhciAocHJlc3NpbmcgRGVsZXRlIGtleSksXG4gICAgICAgICAqIGZpbGwgaGFuZGxlLCBjb3B5IHJhbmdlIGRvd24sIHVuZG8gYW5kIHJlZG8uXG4gICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsVmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2VsbFZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFZhbHVlIGhhcyBjaGFuZ2VkIGFmdGVyIGVkaXRpbmcuIE9ubHkgZmlyZXMgd2hlbiBgcmVhZE9ubHlFZGl0PXRydWVgLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0UmVxdWVzdDogRXZlbnRFbWl0dGVyPENlbGxFZGl0UmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0UmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjZWxsJ3MgdmFsdWUgd2l0aGluIGEgcm93IGhhcyBjaGFuZ2VkLiBUaGlzIGV2ZW50IGNvcnJlc3BvbmRzIHRvIEZ1bGwgUm93IEVkaXRpbmcgb25seS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSBjZWxsIGhhcyBzdGFydGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIGNlbGwgaGFzIHN0b3BwZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdGFydGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RhcnRlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBGdWxsIFJvdyBFZGl0aW5nLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRWRpdGluZyBhIHJvdyBoYXMgc3RvcHBlZCAod2hlbiByb3cgZWRpdGluZyBpcyBlbmFibGVkKS4gV2hlbiByb3cgZWRpdGluZywgdGhpcyBldmVudCB3aWxsIGJlIGZpcmVkIG9uY2UgYW5kIGBjZWxsRWRpdGluZ1N0b3BwZWRgIHdpbGwgYmUgZmlyZWQgZm9yIGVhY2ggaW5kaXZpZHVhbCBjZWxsLiBPbmx5IGZpcmVzIHdoZW4gZG9pbmcgRnVsbCBSb3cgRWRpdGluZy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFVuZG8gb3BlcmF0aW9uIGhhcyBzdGFydGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHVuZG9TdGFydGVkOiBFdmVudEVtaXR0ZXI8VW5kb1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxVbmRvU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVW5kbyBvcGVyYXRpb24gaGFzIGVuZGVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHVuZG9FbmRlZDogRXZlbnRFbWl0dGVyPFVuZG9FbmRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFVuZG9FbmRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUmVkbyBvcGVyYXRpb24gaGFzIHN0YXJ0ZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmVkb1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxSZWRvU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJlZG9TdGFydGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSZWRvIG9wZXJhdGlvbiBoYXMgZW5kZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmVkb0VuZGVkOiBFdmVudEVtaXR0ZXI8UmVkb0VuZGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmVkb0VuZGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSYW5nZSBkZWxldGUgb3BlcmF0aW9uIChjZWxsIGNsZWFyKSBoYXMgc3RhcnRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByYW5nZURlbGV0ZVN0YXJ0OiBFdmVudEVtaXR0ZXI8UmFuZ2VEZWxldGVTdGFydEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJhbmdlRGVsZXRlU3RhcnRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJhbmdlIGRlbGV0ZSBvcGVyYXRpb24gKGNlbGwgY2xlYXIpIGhhcyBlbmRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByYW5nZURlbGV0ZUVuZDogRXZlbnRFbWl0dGVyPFJhbmdlRGVsZXRlRW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmFuZ2VEZWxldGVFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpbHRlciBoYXMgYmVlbiBvcGVuZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyT3BlbmVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIGFwcGxpZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgd2FzIG1vZGlmaWVkIGJ1dCBub3QgYXBwbGllZC4gVXNlZCB3aGVuIGZpbHRlcnMgaGF2ZSAnQXBwbHknIGJ1dHRvbnMuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyTW9kaWZpZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbHRlck1vZGlmaWVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBZHZhbmNlZCBGaWx0ZXIgQnVpbGRlciB2aXNpYmlsaXR5IGhhcyBjaGFuZ2VkIChvcGVuZWQgb3IgY2xvc2VkKS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBhZHZhbmNlZEZpbHRlckJ1aWxkZXJWaXNpYmxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEFkdmFuY2VkRmlsdGVyQnVpbGRlclZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QWR2YW5jZWRGaWx0ZXJCdWlsZGVyVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY2hhcnQgaGFzIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydENyZWF0ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkPFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGRhdGEgcmFuZ2UgZm9yIHRoZSBjaGFydCBoYXMgYmVlbiBjaGFuZ2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ8VERhdGE+PigpO1xuICAgIC8qKiBGb3JtYXR0aW5nIGNoYW5nZXMgaGF2ZSBiZWVuIG1hZGUgYnkgdXNlcnMgdGhyb3VnaCB0aGUgRm9ybWF0IFBhbmVsLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0T3B0aW9uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDaGFydE9wdGlvbnNDaGFuZ2VkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0T3B0aW9uc0NoYW5nZWQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydERlc3Ryb3llZDogRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkPFREYXRhPj4oKTtcbiAgICAvKiogRE9NIGV2ZW50IGBrZXlEb3duYCBoYXBwZW5lZCBvbiBhIGNlbGwuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEtleURvd246IEV2ZW50RW1pdHRlcjxDZWxsS2V5RG93bkV2ZW50PFREYXRhPiB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGdyaWQgaGFzIGluaXRpYWxpc2VkIGFuZCBpcyByZWFkeSBmb3IgbW9zdCBhcGkgY2FsbHMsIGJ1dCBtYXkgbm90IGJlIGZ1bGx5IHJlbmRlcmVkIHlldCAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUmVhZHk6IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEludm9rZWQgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBncmlkIGlzIGRlc3Ryb3llZC4gVGhpcyBpcyB1c2VmdWwgZm9yIGNsZWFudXAgbG9naWMgdGhhdCBuZWVkcyB0byBydW4gYmVmb3JlIHRoZSBncmlkIGlzIHRvcm4gZG93bi5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUHJlRGVzdHJveWVkOiBFdmVudEVtaXR0ZXI8R3JpZFByZURlc3Ryb3llZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEdyaWRQcmVEZXN0cm95ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpcmVkIHRoZSBmaXJzdCB0aW1lIGRhdGEgaXMgcmVuZGVyZWQgaW50byB0aGUgZ3JpZC4gVXNlIHRoaXMgZXZlbnQgaWYgeW91IHdhbnQgdG8gYXV0byByZXNpemUgY29sdW1ucyBiYXNlZCBvbiB0aGVpciBjb250ZW50cyAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpcnN0RGF0YVJlbmRlcmVkOiBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaXJzdERhdGFSZW5kZXJlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIHNpemUgb2YgdGhlIGdyaWQgYGRpdmAgaGFzIGNoYW5nZWQuIEluIG90aGVyIHdvcmRzLCB0aGUgZ3JpZCB3YXMgcmVzaXplZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIERpc3BsYXllZCByb3dzIGhhdmUgY2hhbmdlZC4gVHJpZ2dlcmVkIGFmdGVyIHNvcnQsIGZpbHRlciBvciB0cmVlIGV4cGFuZCAvIGNvbGxhcHNlIGV2ZW50cy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IHdhcyByZW1vdmVkIGZyb20gdGhlIERPTSwgZm9yIGFueSByZWFzb24uIFVzZSB0byBjbGVhbiB1cCByZXNvdXJjZXMgKGlmIGFueSkgdXNlZCBieSB0aGUgcm93LlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxSb3dSZW1vdmVkOiBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogV2hpY2ggcm93cyBhcmUgcmVuZGVyZWQgaW4gdGhlIERPTSBoYXMgY2hhbmdlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aWV3cG9ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBib2R5IHdhcyBzY3JvbGxlZCBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1haW4gYm9keSBvZiB0aGUgZ3JpZCBoYXMgc3RvcHBlZCBzY3JvbGxpbmcsIGVpdGhlciBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsRW5kOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RhcnRzLiBUaGlzIGNvdWxkIGJlIGFueSBhY3Rpb24gdGhhdCB1c2VzIHRoZSBncmlkJ3MgRHJhZyBhbmQgRHJvcCBzZXJ2aWNlLCBlLmcuIENvbHVtbiBNb3ZpbmcsIENvbHVtbiBSZXNpemluZywgUmFuZ2UgU2VsZWN0aW9uLCBGaWxsIEhhbmRsZSwgZXRjLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdGFydGVkOiBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogV2hlbiBkcmFnZ2luZyBzdG9wcy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkcmFnU3RvcHBlZDogRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RHJhZ1N0b3BwZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEdyaWQgc3RhdGUgaGFzIGJlZW4gdXBkYXRlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzdGF0ZVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxTdGF0ZVVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxTdGF0ZVVwZGF0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRyaWdnZXJlZCBldmVyeSB0aW1lIHRoZSBwYWdpbmcgc3RhdGUgY2hhbmdlcy4gU29tZSBvZiB0aGUgbW9zdCBjb21tb24gc2NlbmFyaW9zIGZvciB0aGlzIGV2ZW50IHRvIGJlIHRyaWdnZXJlZCBhcmU6XG4gICAgICAgICAqXG4gICAgICAgICAqICAtIFRoZSBwYWdlIHNpemUgY2hhbmdlcy5cbiAgICAgICAgICogIC0gVGhlIGN1cnJlbnQgc2hvd24gcGFnZSBpcyBjaGFuZ2VkLlxuICAgICAgICAgKiAgLSBOZXcgZGF0YSBpcyBsb2FkZWQgb250byB0aGUgZ3JpZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFnaW5hdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgZHJhZyBoYXMgc3RhcnRlZCwgb3IgZHJhZ2dpbmcgd2FzIGFscmVhZHkgc3RhcnRlZCBhbmQgdGhlIG1vdXNlIGhhcyByZS1lbnRlcmVkIHRoZSBncmlkIGhhdmluZyBwcmV2aW91c2x5IGxlZnQgdGhlIGdyaWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VudGVyOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBtb3VzZSBoYXMgbW92ZWQgd2hpbGUgZHJhZ2dpbmcuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ01vdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIG1vdXNlIGhhcyBsZWZ0IHRoZSBncmlkIHdoaWxlIGRyYWdnaW5nLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdMZWF2ZTogRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgZHJhZyBoYXMgZmluaXNoZWQgb3ZlciB0aGUgZ3JpZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW5kOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IGdyb3VwIGNvbHVtbiB3YXMgYWRkZWQsIHJlbW92ZWQgb3IgcmVvcmRlcmVkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJvd0dyb3VwQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSByb3cgZ3JvdXAgd2FzIG9wZW5lZCBvciBjbG9zZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93R3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxSb3dHcm91cE9wZW5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaXJlZCB3aGVuIGNhbGxpbmcgZWl0aGVyIG9mIHRoZSBBUEkgbWV0aG9kcyBgZXhwYW5kQWxsKClgIG9yIGBjb2xsYXBzZUFsbCgpYC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBleHBhbmRPckNvbGxhcHNlQWxsOiBFdmVudEVtaXR0ZXI8RXhwYW5kQ29sbGFwc2VBbGxFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxFeHBhbmRDb2xsYXBzZUFsbEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRXhjZWVkZWQgdGhlIGBwaXZvdE1heEdlbmVyYXRlZENvbHVtbnNgIGxpbWl0IHdoZW4gZ2VuZXJhdGluZyBjb2x1bW5zLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBpdm90TWF4Q29sdW1uc0V4Y2VlZGVkOiBFdmVudEVtaXR0ZXI8UGl2b3RNYXhDb2x1bW5zRXhjZWVkZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQaXZvdE1heENvbHVtbnNFeGNlZWRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGNsaWVudCBoYXMgc2V0IG5ldyBwaW5uZWQgcm93IGRhdGEgaW50byB0aGUgZ3JpZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwaW5uZWRSb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENsaWVudC1TaWRlIFJvdyBNb2RlbCBvbmx5LiBUaGUgY2xpZW50IGhhcyB1cGRhdGVkIGRhdGEgZm9yIHRoZSBncmlkIGJ5IGVpdGhlciBhKSBzZXR0aW5nIG5ldyBSb3cgRGF0YSBvciBiKSBBcHBseWluZyBhIFJvdyBUcmFuc2FjdGlvbi5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhVXBkYXRlZDogRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEFzeW5jIHRyYW5zYWN0aW9ucyBoYXZlIGJlZW4gYXBwbGllZC4gQ29udGFpbnMgYSBsaXN0IG9mIGFsbCB0cmFuc2FjdGlvbiByZXN1bHRzLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDogRXZlbnRFbWl0dGVyPEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHNlcnZlciBzaWRlIHN0b3JlIGhhcyBmaW5pc2hlZCByZWZyZXNoaW5nLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHN0b3JlUmVmcmVzaGVkOiBFdmVudEVtaXR0ZXI8U3RvcmVSZWZyZXNoZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxTdG9yZVJlZnJlc2hlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ2VsbCBpcyBjbGlja2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxDbGlja2VkOiBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ2VsbCBpcyBkb3VibGUgY2xpY2tlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbERvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgZm9jdXNlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRm9jdXNlZDogRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGVudGVyZWQgY2VsbC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3ZlckV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZU92ZXJFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGxlZnQgY2VsbC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdXQ6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGRvd24gb24gY2VsbC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlRG93bkV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxNb3VzZURvd25FdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBpcyBjbGlja2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93Q2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IGlzIGRvdWJsZSBjbGlja2VkLlxuICAgICAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IGlzIHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuIFRoZSBldmVudCBjb250YWlucyB0aGUgbm9kZSBpbiBxdWVzdGlvbiwgc28gY2FsbCB0aGUgbm9kZSdzIGBpc1NlbGVjdGVkKClgIG1ldGhvZCB0byBzZWUgaWYgaXQgd2FzIGp1c3Qgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dTZWxlY3RlZDogRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJvdyBzZWxlY3Rpb24gaXMgY2hhbmdlZC4gVXNlIHRoZSBncmlkIEFQSSBgZ2V0U2VsZWN0ZWROb2RlcygpYCBvciBgZ2V0U2VsZWN0ZWRSb3dzKClgIHRvIGdldCB0aGUgbmV3IGxpc3Qgb2Ygc2VsZWN0ZWQgbm9kZXMgLyByb3cgZGF0YS5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8U2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgcmlnaHQgY2xpY2tlZC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgY2hhbmdlIHRvIHJhbmdlIHNlbGVjdGlvbiBoYXMgb2NjdXJyZWQuXG4gICAgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHRvb2x0aXAgaGFzIGJlZW4gZGlzcGxheWVkICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbHRpcFNob3c6IEV2ZW50RW1pdHRlcjxUb29sdGlwU2hvd0V2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2x0aXBTaG93RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHRvb2x0aXAgd2FzIGhpZGRlbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2x0aXBIaWRlOiBFdmVudEVtaXR0ZXI8VG9vbHRpcEhpZGVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxUb29sdGlwSGlkZUV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogU29ydCBoYXMgY2hhbmdlZC4gVGhlIGdyaWQgYWxzbyBsaXN0ZW5zIGZvciB0aGlzIGFuZCB1cGRhdGVzIHRoZSBtb2RlbC5cbiAgICAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8U29ydENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOS4yICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MjkuMiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlUmVxdWVzdDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjI5LjIgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZVJlcXVlc3RFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYyOS4yICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uQWdnRnVuY0NoYW5nZVJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDb2x1bW5BZ2dGdW5jQ2hhbmdlUmVxdWVzdEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbkFnZ0Z1bmNDaGFuZ2VSZXF1ZXN0RXZlbnQ8VERhdGE+PigpO1xuXG5cbiAgICAvLyBFbmFibGUgdHlwZSBjb2VyY2lvbiBmb3IgYm9vbGVhbiBJbnB1dHMgdG8gc3VwcG9ydCB1c2UgbGlrZSAnZW5hYmxlQ2hhcnRzJyBpbnN0ZWFkIG9mIGZvcmNpbmcgJ1tlbmFibGVDaGFydHNdPVwidHJ1ZVwiJyBcbiAgICAvLyBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdGVtcGxhdGUtdHlwZWNoZWNrI2lucHV0LXNldHRlci1jb2VyY2lvbiBcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYWtlQ29sdW1uVmlzaWJsZUFmdGVyVW5Hcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDZWxsRm9jdXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzSGVhZGVyRm9jdXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTZWxlY3RzQ2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNTaG93VmVydGljYWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlYnVnOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxFeHByZXNzaW9uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBJbmNsdWRlVG90YWxGb290ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU3VwcHJlc3NCbGFua0hlYWRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNZW51SGlkZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5Tb3J0SWNvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNdWx0aVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c011bHRpU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0xvYWRpbmdPdmVybGF5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc05vUm93c092ZXJsYXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NraXBIZWFkZXJPbkF1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhcmVudHNJblJvd05vZGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRmllbGREb3ROb3RhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsZWFyT25GaWxsUmVkdWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWx0YVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzVG91Y2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93Q29udGV4dE1lbnVXaXRoQ29udHJvbEtleTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dHcm91cEhpZGVzQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29weVJvd3NUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29weUhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29weUdyb3VwSGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9waXZvdE1vZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWdnRnVuY0luSGVhZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNBZ2dyZWdhdGVBdFJvb3RMZXZlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dBdFJvb3RMZXZlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUGFzc2l2ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZnVuY3Rpb25zUmVhZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FuaW1hdGVSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNGaWx0ZXJlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUnRsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZlV2hlblJvd0RyYWdnaW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnTXVsdGlSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUdyb3VwRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1BhZ2luYXRpb25QYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwQWxsb3dVbmJhbGFuY2VkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Njcm9sbE9uTmV3RGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTY3JvbGxXaGVuUG9wdXBzQXJlT3BlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcHVyZ2VDbG9zZWRSb3dOb2RlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY2FjaGVRdWlja0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaW5jbHVkZUhpZGRlbkNvbHVtbnNJblF1aWNrRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9leGNsdWRlSGlkZGVuQ29sdW1uc0Zyb21RdWlja0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5zdXJlRG9tT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FjY2VudGVkU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlQ2FjaGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlQ2FjaGVOZXZlckV4cGlyZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FnZ3JlZ2F0ZU9ubHlDaGFuZ2VkQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDc3ZFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luY2x1ZGVIaWRkZW5Db2x1bW5zSW5BZHZhbmNlZEZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck1vdmVzRG93bjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW50ZXJNb3Zlc0Rvd25BZnRlckVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTmF2aWdhdGVzVmVydGljYWxseUFmdGVyRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Byb3BlcnR5TmFtZXNDaGVjazogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93SG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93VHJhbnNmb3JtOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaXBib2FyZFBhc3RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0xhc3RFbXB0eUxpbmVPblBhc3RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDaGFydHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNoYXJ0VG9vbFBhbmVsc0J1dHRvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDaGFydFRvb2xQYW5lbHNCdXR0b246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZXhjbHVkZUNoaWxkcmVuV2hlblRyZWVEYXRhRmlsdGVyaW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90b29sdGlwTW91c2VUcmFjazogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdG9vbHRpcEludGVyYWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9rZWVwRGV0YWlsUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGVDaGlsZFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0V4cGFuZGFibGVQaXZvdEdyb3VwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGV0YWlsUm93QXV0b0hlaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUZpbHRlckFsbExldmVsczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZVNvcnRBbGxMZXZlbHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVFbmFibGVDbGllbnRTaWRlU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZU9ubHlSZWZyZXNoRmlsdGVyZWRHcm91cHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0T25TZXJ2ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVGaWx0ZXJPblNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Nob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlwYm9hcmRBcGk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdG9wRWRpdGluZ1doZW5DZWxsc0xvc2VGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFpbnRhaW5Db2x1bW5PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBNYWludGFpbk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb2x1bW5Ib3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVhZE9ubHlFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd1ZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsRWRpdGluZ09uQmFja3NwYWNlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZXNldFJvd0RhdGFPblVwZGF0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVtb3ZlUGl2b3RIZWFkZXJSb3dXaGVuU2luZ2xlVmFsdWVDb2x1bW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29weVNpbmdsZUNlbGxSYW5nZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzR3JvdXBSb3dzU3RpY2t5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0N1dFRvQ2xpcGJvYXJkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1NlcnZlclNpZGVJbmZpbml0ZVNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93R3JvdXBQYW5lbFN1cHByZXNzU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dTaG93Q2hhbmdlQWZ0ZXJGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUFkdmFuY2VkRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXN0ZXJEZXRhaWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3RyZWVEYXRhOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0dyb3VwTWFpbnRhaW5WYWx1ZVR5cGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgLy8gQEVOREBcbn1cbiJdfQ==