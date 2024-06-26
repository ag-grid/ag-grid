import { _combineAttributesAndGridOptions, _processOnChange, createGrid } from '@ag-grid-community/core';
import { Component, EventEmitter, Input, Output, ViewEncapsulation, } from '@angular/core';
import { AngularFrameworkComponentWrapper } from './angularFrameworkComponentWrapper';
import { AngularFrameworkOverrides } from './angularFrameworkOverrides';
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
        this._fullyReady = new Promise((resolve) => {
            this._resolveFullyReady = resolve;
        });
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
         * @default 'new'
         * @initial
         */
        this.columnMenu = undefined;
        /** When `true`, the column menu button will always be shown.
         * When `false, the column menu button will only show when the mouse is over the column header.
         * If `columnMenu = 'legacy'`, this will default to `false` instead of `true`.
         * @default true
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
        /** When pivoting, Quick Filter is only applied on the pivoted data
         * (or aggregated data if `groupAggFiltering = true`).
         * Set to `true` to apply Quick Filter before pivoting (/aggregating) instead.
         * @default false
         */
        this.applyQuickFilterBeforePivotOrAgg = undefined;
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
        /** By default, Advanced Filter sanitises user input and passes it to `new Function()` to provide the best performance.
         * Set to `true` to prevent this and use defined functions instead.
         * This will result in slower filtering, but it enables Advanced Filter to work when `unsafe-eval` is disabled.
         * @default false
         */
        this.suppressAdvancedFilterEval = undefined;
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
        /** Show or hide the loading overlay.
         */
        this.loading = undefined;
        /** Provide a HTML string to override the default loading overlay.
         */
        this.overlayLoadingTemplate = undefined;
        /** Provide a custom loading overlay component.
         * @initial
         */
        this.loadingOverlayComponent = undefined;
        /** Customise the parameters provided to the loading overlay component.
         */
        this.loadingOverlayComponentParams = undefined;
        /** Disables the 'loading' overlay.
         * @deprecated v32 - Deprecated. Use `loading=false` instead.
         * @default false
         * @initial
         */
        this.suppressLoadingOverlay = undefined;
        /** Provide a HTML string to override the default no-rows overlay.
         */
        this.overlayNoRowsTemplate = undefined;
        /** Provide a custom no-rows overlay component.
         * @initial
         */
        this.noRowsOverlayComponent = undefined;
        /** Customise the parameters provided to the no-rows overlay component.
         */
        this.noRowsOverlayComponentParams = undefined;
        /** Set to `true` to prevent the no-rows overlay being shown when there is no row data.
         * @default false
         * @initial
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
         *
         * @deprecated v31.3 - use `groupTotalRow` instead.
         */
        this.groupIncludeFooter = undefined;
        /** Set to `true` to show a 'grand total' group footer across all groups.
         * @default false
         *
         * @deprecated v31.3 - use `grandTotalRow` instead.
         */
        this.groupIncludeTotalFooter = undefined;
        /** When provided, an extra row group total row will be inserted into row groups at the specified position, to display
         * when the group is expanded. This row will contain the aggregate values for the group. If a callback function is
         * provided, it can be used to selectively determine which groups will have a total row added.
         */
        this.groupTotalRow = undefined;
        /** When provided, an extra grand total row will be inserted into the grid at the specified position.
         * This row displays the aggregate totals of all rows in the grid.
         */
        this.grandTotalRow = undefined;
        /** Suppress the sticky behaviour of the total rows, can be suppressed individually by passing `'grand'` or `'group'`.
         */
        this.suppressStickyTotalRow = undefined;
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
        /** When `true`, the Server-side Row Model will not use a full width loading renderer, instead using the colDef `loadingCellRenderer` if present.
         */
        this.suppressServerSideFullWidthLoadingRow = undefined;
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
        /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping or Tree Data.
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
        /** When enabled, Sorting will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
         * @default false
         * @deprecated v31.1
         */
        this.serverSideSortOnServer = undefined;
        /** When enabled, Filtering will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
         * @default false
         * @deprecated v31.1
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
        /** Allows overriding the element that will be focused when the grid receives focus from outside elements (tabbing into the grid).
         * @returns `True` if this function should override the grid's default behavior, `False` to allow the grid's default behavior.
         */
        this.focusGridInnerElement = undefined;
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.
         */
        this.navigateToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused.
         * Return the next header position to navigate to, `true` to stay on the current header,
         * or `false` to let the browser handle the tab behaviour.
         * As of v31.3, returning `null` is deprecated.
         */
        this.tabToNextHeader = undefined;
        /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.
         */
        this.navigateToNextCell = undefined;
        /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused.
         * Return the next cell position to navigate to, `true` to stay on the current cell,
         * or `false` to let the browser handle the tab behaviour.
         * As of v31.3, returning `null` is deprecated.
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
        /** Callback fired after the row is rendered into the DOM. Should not be used to initiate side effects.
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
        /** The context menu visibility has changed (opened or closed).
         */
        this.contextMenuVisibleChanged = new EventEmitter();
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
        /** Fill operation has started.
         */
        this.fillStart = new EventEmitter();
        /** Fill operation has ended.
         */
        this.fillEnd = new EventEmitter();
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
        /** Formatting changes have been made by users through the Customize Panel.
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
        /** Header is focused.
         */
        this.headerFocused = new EventEmitter();
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
        this._nativeElement = elementDef.nativeElement;
    }
    ngAfterViewInit() {
        // Run the setup outside of angular so all the event handlers that are created do not trigger change detection
        this.angularFrameworkOverrides.runOutsideAngular(() => {
            this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef, this.angularFrameworkOverrides);
            const mergedGridOps = _combineAttributesAndGridOptions(this.gridOptions, this);
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
            }
            this._initialised = true;
            // sometimes, especially in large client apps gridReady can fire before ngAfterViewInit
            // this ties these together so that gridReady will always fire after agGridAngular's ngAfterViewInit
            // the actual containing component's ngAfterViewInit will fire just after agGridAngular's
            this._resolveFullyReady();
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
                _processOnChange(gridOptions, this.api);
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgGridAngular, deps: [{ token: i0.ElementRef }, { token: i0.ViewContainerRef }, { token: i1.AngularFrameworkOverrides }, { token: i2.AngularFrameworkComponentWrapper }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.12", type: AgGridAngular, isStandalone: true, selector: "ag-grid-angular", inputs: { gridOptions: "gridOptions", modules: "modules", statusBar: "statusBar", sideBar: "sideBar", suppressContextMenu: "suppressContextMenu", preventDefaultOnContextMenu: "preventDefaultOnContextMenu", allowContextMenuWithControlKey: "allowContextMenuWithControlKey", columnMenu: "columnMenu", suppressMenuHide: "suppressMenuHide", enableBrowserTooltips: "enableBrowserTooltips", tooltipTrigger: "tooltipTrigger", tooltipShowDelay: "tooltipShowDelay", tooltipHideDelay: "tooltipHideDelay", tooltipMouseTrack: "tooltipMouseTrack", tooltipShowMode: "tooltipShowMode", tooltipInteraction: "tooltipInteraction", popupParent: "popupParent", copyHeadersToClipboard: "copyHeadersToClipboard", copyGroupHeadersToClipboard: "copyGroupHeadersToClipboard", clipboardDelimiter: "clipboardDelimiter", suppressCopyRowsToClipboard: "suppressCopyRowsToClipboard", suppressCopySingleCellRanges: "suppressCopySingleCellRanges", suppressLastEmptyLineOnPaste: "suppressLastEmptyLineOnPaste", suppressClipboardPaste: "suppressClipboardPaste", suppressClipboardApi: "suppressClipboardApi", suppressCutToClipboard: "suppressCutToClipboard", columnDefs: "columnDefs", defaultColDef: "defaultColDef", defaultColGroupDef: "defaultColGroupDef", columnTypes: "columnTypes", dataTypeDefinitions: "dataTypeDefinitions", maintainColumnOrder: "maintainColumnOrder", suppressFieldDotNotation: "suppressFieldDotNotation", headerHeight: "headerHeight", groupHeaderHeight: "groupHeaderHeight", floatingFiltersHeight: "floatingFiltersHeight", pivotHeaderHeight: "pivotHeaderHeight", pivotGroupHeaderHeight: "pivotGroupHeaderHeight", allowDragFromColumnsToolPanel: "allowDragFromColumnsToolPanel", suppressMovableColumns: "suppressMovableColumns", suppressColumnMoveAnimation: "suppressColumnMoveAnimation", suppressDragLeaveHidesColumns: "suppressDragLeaveHidesColumns", suppressRowGroupHidesColumns: "suppressRowGroupHidesColumns", colResizeDefault: "colResizeDefault", suppressAutoSize: "suppressAutoSize", autoSizePadding: "autoSizePadding", skipHeaderOnAutoSize: "skipHeaderOnAutoSize", autoSizeStrategy: "autoSizeStrategy", components: "components", editType: "editType", singleClickEdit: "singleClickEdit", suppressClickEdit: "suppressClickEdit", readOnlyEdit: "readOnlyEdit", stopEditingWhenCellsLoseFocus: "stopEditingWhenCellsLoseFocus", enterNavigatesVertically: "enterNavigatesVertically", enterNavigatesVerticallyAfterEdit: "enterNavigatesVerticallyAfterEdit", enableCellEditingOnBackspace: "enableCellEditingOnBackspace", undoRedoCellEditing: "undoRedoCellEditing", undoRedoCellEditingLimit: "undoRedoCellEditingLimit", defaultCsvExportParams: "defaultCsvExportParams", suppressCsvExport: "suppressCsvExport", defaultExcelExportParams: "defaultExcelExportParams", suppressExcelExport: "suppressExcelExport", excelStyles: "excelStyles", quickFilterText: "quickFilterText", cacheQuickFilter: "cacheQuickFilter", includeHiddenColumnsInQuickFilter: "includeHiddenColumnsInQuickFilter", quickFilterParser: "quickFilterParser", quickFilterMatcher: "quickFilterMatcher", applyQuickFilterBeforePivotOrAgg: "applyQuickFilterBeforePivotOrAgg", excludeChildrenWhenTreeDataFiltering: "excludeChildrenWhenTreeDataFiltering", enableAdvancedFilter: "enableAdvancedFilter", advancedFilterModel: "advancedFilterModel", includeHiddenColumnsInAdvancedFilter: "includeHiddenColumnsInAdvancedFilter", advancedFilterParent: "advancedFilterParent", advancedFilterBuilderParams: "advancedFilterBuilderParams", suppressAdvancedFilterEval: "suppressAdvancedFilterEval", enableCharts: "enableCharts", chartThemes: "chartThemes", customChartThemes: "customChartThemes", chartThemeOverrides: "chartThemeOverrides", chartToolPanelsDef: "chartToolPanelsDef", chartMenuItems: "chartMenuItems", loadingCellRenderer: "loadingCellRenderer", loadingCellRendererParams: "loadingCellRendererParams", loadingCellRendererSelector: "loadingCellRendererSelector", localeText: "localeText", masterDetail: "masterDetail", keepDetailRows: "keepDetailRows", keepDetailRowsCount: "keepDetailRowsCount", detailCellRenderer: "detailCellRenderer", detailCellRendererParams: "detailCellRendererParams", detailRowHeight: "detailRowHeight", detailRowAutoHeight: "detailRowAutoHeight", context: "context", alignedGrids: "alignedGrids", tabIndex: "tabIndex", rowBuffer: "rowBuffer", valueCache: "valueCache", valueCacheNeverExpires: "valueCacheNeverExpires", enableCellExpressions: "enableCellExpressions", suppressTouch: "suppressTouch", suppressFocusAfterRefresh: "suppressFocusAfterRefresh", suppressAsyncEvents: "suppressAsyncEvents", suppressBrowserResizeObserver: "suppressBrowserResizeObserver", suppressPropertyNamesCheck: "suppressPropertyNamesCheck", suppressChangeDetection: "suppressChangeDetection", debug: "debug", loading: "loading", overlayLoadingTemplate: "overlayLoadingTemplate", loadingOverlayComponent: "loadingOverlayComponent", loadingOverlayComponentParams: "loadingOverlayComponentParams", suppressLoadingOverlay: "suppressLoadingOverlay", overlayNoRowsTemplate: "overlayNoRowsTemplate", noRowsOverlayComponent: "noRowsOverlayComponent", noRowsOverlayComponentParams: "noRowsOverlayComponentParams", suppressNoRowsOverlay: "suppressNoRowsOverlay", pagination: "pagination", paginationPageSize: "paginationPageSize", paginationPageSizeSelector: "paginationPageSizeSelector", paginationAutoPageSize: "paginationAutoPageSize", paginateChildRows: "paginateChildRows", suppressPaginationPanel: "suppressPaginationPanel", pivotMode: "pivotMode", pivotPanelShow: "pivotPanelShow", pivotMaxGeneratedColumns: "pivotMaxGeneratedColumns", pivotDefaultExpanded: "pivotDefaultExpanded", pivotColumnGroupTotals: "pivotColumnGroupTotals", pivotRowTotals: "pivotRowTotals", pivotSuppressAutoColumn: "pivotSuppressAutoColumn", suppressExpandablePivotGroups: "suppressExpandablePivotGroups", functionsReadOnly: "functionsReadOnly", aggFuncs: "aggFuncs", suppressAggFuncInHeader: "suppressAggFuncInHeader", alwaysAggregateAtRootLevel: "alwaysAggregateAtRootLevel", aggregateOnlyChangedColumns: "aggregateOnlyChangedColumns", suppressAggFilteredOnly: "suppressAggFilteredOnly", removePivotHeaderRowWhenSingleValueColumn: "removePivotHeaderRowWhenSingleValueColumn", animateRows: "animateRows", enableCellChangeFlash: "enableCellChangeFlash", cellFlashDuration: "cellFlashDuration", cellFlashDelay: "cellFlashDelay", cellFadeDuration: "cellFadeDuration", cellFadeDelay: "cellFadeDelay", allowShowChangeAfterFilter: "allowShowChangeAfterFilter", domLayout: "domLayout", ensureDomOrder: "ensureDomOrder", enableRtl: "enableRtl", suppressColumnVirtualisation: "suppressColumnVirtualisation", suppressMaxRenderedRowRestriction: "suppressMaxRenderedRowRestriction", suppressRowVirtualisation: "suppressRowVirtualisation", rowDragManaged: "rowDragManaged", suppressRowDrag: "suppressRowDrag", suppressMoveWhenRowDragging: "suppressMoveWhenRowDragging", rowDragEntireRow: "rowDragEntireRow", rowDragMultiRow: "rowDragMultiRow", rowDragText: "rowDragText", fullWidthCellRenderer: "fullWidthCellRenderer", fullWidthCellRendererParams: "fullWidthCellRendererParams", embedFullWidthRows: "embedFullWidthRows", suppressGroupMaintainValueType: "suppressGroupMaintainValueType", groupDisplayType: "groupDisplayType", groupDefaultExpanded: "groupDefaultExpanded", autoGroupColumnDef: "autoGroupColumnDef", groupMaintainOrder: "groupMaintainOrder", groupSelectsChildren: "groupSelectsChildren", groupLockGroupColumns: "groupLockGroupColumns", groupAggFiltering: "groupAggFiltering", groupIncludeFooter: "groupIncludeFooter", groupIncludeTotalFooter: "groupIncludeTotalFooter", groupTotalRow: "groupTotalRow", grandTotalRow: "grandTotalRow", suppressStickyTotalRow: "suppressStickyTotalRow", groupSuppressBlankHeader: "groupSuppressBlankHeader", groupSelectsFiltered: "groupSelectsFiltered", showOpenedGroup: "showOpenedGroup", groupRemoveSingleChildren: "groupRemoveSingleChildren", groupRemoveLowestSingleChildren: "groupRemoveLowestSingleChildren", groupHideOpenParents: "groupHideOpenParents", groupAllowUnbalanced: "groupAllowUnbalanced", rowGroupPanelShow: "rowGroupPanelShow", groupRowRenderer: "groupRowRenderer", groupRowRendererParams: "groupRowRendererParams", suppressMakeColumnVisibleAfterUnGroup: "suppressMakeColumnVisibleAfterUnGroup", treeData: "treeData", rowGroupPanelSuppressSort: "rowGroupPanelSuppressSort", suppressGroupRowsSticky: "suppressGroupRowsSticky", pinnedTopRowData: "pinnedTopRowData", pinnedBottomRowData: "pinnedBottomRowData", rowModelType: "rowModelType", rowData: "rowData", asyncTransactionWaitMillis: "asyncTransactionWaitMillis", suppressModelUpdateAfterUpdateTransaction: "suppressModelUpdateAfterUpdateTransaction", datasource: "datasource", cacheOverflowSize: "cacheOverflowSize", infiniteInitialRowCount: "infiniteInitialRowCount", serverSideInitialRowCount: "serverSideInitialRowCount", suppressServerSideInfiniteScroll: "suppressServerSideInfiniteScroll", suppressServerSideFullWidthLoadingRow: "suppressServerSideFullWidthLoadingRow", cacheBlockSize: "cacheBlockSize", maxBlocksInCache: "maxBlocksInCache", maxConcurrentDatasourceRequests: "maxConcurrentDatasourceRequests", blockLoadDebounceMillis: "blockLoadDebounceMillis", purgeClosedRowNodes: "purgeClosedRowNodes", serverSideDatasource: "serverSideDatasource", serverSideSortAllLevels: "serverSideSortAllLevels", serverSideEnableClientSideSort: "serverSideEnableClientSideSort", serverSideOnlyRefreshFilteredGroups: "serverSideOnlyRefreshFilteredGroups", serverSideSortOnServer: "serverSideSortOnServer", serverSideFilterOnServer: "serverSideFilterOnServer", serverSidePivotResultFieldSeparator: "serverSidePivotResultFieldSeparator", viewportDatasource: "viewportDatasource", viewportRowModelPageSize: "viewportRowModelPageSize", viewportRowModelBufferSize: "viewportRowModelBufferSize", alwaysShowHorizontalScroll: "alwaysShowHorizontalScroll", alwaysShowVerticalScroll: "alwaysShowVerticalScroll", debounceVerticalScrollbar: "debounceVerticalScrollbar", suppressHorizontalScroll: "suppressHorizontalScroll", suppressScrollOnNewData: "suppressScrollOnNewData", suppressScrollWhenPopupsAreOpen: "suppressScrollWhenPopupsAreOpen", suppressAnimationFrame: "suppressAnimationFrame", suppressMiddleClickScrolls: "suppressMiddleClickScrolls", suppressPreventDefaultOnMouseWheel: "suppressPreventDefaultOnMouseWheel", scrollbarWidth: "scrollbarWidth", rowSelection: "rowSelection", rowMultiSelectWithClick: "rowMultiSelectWithClick", suppressRowDeselection: "suppressRowDeselection", suppressRowClickSelection: "suppressRowClickSelection", suppressCellFocus: "suppressCellFocus", suppressHeaderFocus: "suppressHeaderFocus", suppressMultiRangeSelection: "suppressMultiRangeSelection", enableCellTextSelection: "enableCellTextSelection", enableRangeSelection: "enableRangeSelection", enableRangeHandle: "enableRangeHandle", enableFillHandle: "enableFillHandle", fillHandleDirection: "fillHandleDirection", suppressClearOnFillReduction: "suppressClearOnFillReduction", sortingOrder: "sortingOrder", accentedSort: "accentedSort", unSortIcon: "unSortIcon", suppressMultiSort: "suppressMultiSort", alwaysMultiSort: "alwaysMultiSort", multiSortKey: "multiSortKey", suppressMaintainUnsortedOrder: "suppressMaintainUnsortedOrder", icons: "icons", rowHeight: "rowHeight", rowStyle: "rowStyle", rowClass: "rowClass", rowClassRules: "rowClassRules", suppressRowHoverHighlight: "suppressRowHoverHighlight", suppressRowTransform: "suppressRowTransform", columnHoverHighlight: "columnHoverHighlight", gridId: "gridId", deltaSort: "deltaSort", treeDataDisplayType: "treeDataDisplayType", enableGroupEdit: "enableGroupEdit", initialState: "initialState", getContextMenuItems: "getContextMenuItems", getMainMenuItems: "getMainMenuItems", postProcessPopup: "postProcessPopup", processUnpinnedColumns: "processUnpinnedColumns", processCellForClipboard: "processCellForClipboard", processHeaderForClipboard: "processHeaderForClipboard", processGroupHeaderForClipboard: "processGroupHeaderForClipboard", processCellFromClipboard: "processCellFromClipboard", sendToClipboard: "sendToClipboard", processDataFromClipboard: "processDataFromClipboard", isExternalFilterPresent: "isExternalFilterPresent", doesExternalFilterPass: "doesExternalFilterPass", getChartToolbarItems: "getChartToolbarItems", createChartContainer: "createChartContainer", focusGridInnerElement: "focusGridInnerElement", navigateToNextHeader: "navigateToNextHeader", tabToNextHeader: "tabToNextHeader", navigateToNextCell: "navigateToNextCell", tabToNextCell: "tabToNextCell", getLocaleText: "getLocaleText", getDocument: "getDocument", paginationNumberFormatter: "paginationNumberFormatter", getGroupRowAgg: "getGroupRowAgg", isGroupOpenByDefault: "isGroupOpenByDefault", initialGroupOrderComparator: "initialGroupOrderComparator", processPivotResultColDef: "processPivotResultColDef", processPivotResultColGroupDef: "processPivotResultColGroupDef", getDataPath: "getDataPath", getChildCount: "getChildCount", getServerSideGroupLevelParams: "getServerSideGroupLevelParams", isServerSideGroupOpenByDefault: "isServerSideGroupOpenByDefault", isApplyServerSideTransaction: "isApplyServerSideTransaction", isServerSideGroup: "isServerSideGroup", getServerSideGroupKey: "getServerSideGroupKey", getBusinessKeyForNode: "getBusinessKeyForNode", getRowId: "getRowId", resetRowDataOnUpdate: "resetRowDataOnUpdate", processRowPostCreate: "processRowPostCreate", isRowSelectable: "isRowSelectable", isRowMaster: "isRowMaster", fillOperation: "fillOperation", postSortRows: "postSortRows", getRowStyle: "getRowStyle", getRowClass: "getRowClass", getRowHeight: "getRowHeight", isFullWidthRow: "isFullWidthRow" }, outputs: { toolPanelVisibleChanged: "toolPanelVisibleChanged", toolPanelSizeChanged: "toolPanelSizeChanged", columnMenuVisibleChanged: "columnMenuVisibleChanged", contextMenuVisibleChanged: "contextMenuVisibleChanged", cutStart: "cutStart", cutEnd: "cutEnd", pasteStart: "pasteStart", pasteEnd: "pasteEnd", columnVisible: "columnVisible", columnPinned: "columnPinned", columnResized: "columnResized", columnMoved: "columnMoved", columnValueChanged: "columnValueChanged", columnPivotModeChanged: "columnPivotModeChanged", columnPivotChanged: "columnPivotChanged", columnGroupOpened: "columnGroupOpened", newColumnsLoaded: "newColumnsLoaded", gridColumnsChanged: "gridColumnsChanged", displayedColumnsChanged: "displayedColumnsChanged", virtualColumnsChanged: "virtualColumnsChanged", columnEverythingChanged: "columnEverythingChanged", columnHeaderMouseOver: "columnHeaderMouseOver", columnHeaderMouseLeave: "columnHeaderMouseLeave", columnHeaderClicked: "columnHeaderClicked", columnHeaderContextMenu: "columnHeaderContextMenu", componentStateChanged: "componentStateChanged", cellValueChanged: "cellValueChanged", cellEditRequest: "cellEditRequest", rowValueChanged: "rowValueChanged", cellEditingStarted: "cellEditingStarted", cellEditingStopped: "cellEditingStopped", rowEditingStarted: "rowEditingStarted", rowEditingStopped: "rowEditingStopped", undoStarted: "undoStarted", undoEnded: "undoEnded", redoStarted: "redoStarted", redoEnded: "redoEnded", rangeDeleteStart: "rangeDeleteStart", rangeDeleteEnd: "rangeDeleteEnd", fillStart: "fillStart", fillEnd: "fillEnd", filterOpened: "filterOpened", filterChanged: "filterChanged", filterModified: "filterModified", advancedFilterBuilderVisibleChanged: "advancedFilterBuilderVisibleChanged", chartCreated: "chartCreated", chartRangeSelectionChanged: "chartRangeSelectionChanged", chartOptionsChanged: "chartOptionsChanged", chartDestroyed: "chartDestroyed", cellKeyDown: "cellKeyDown", gridReady: "gridReady", firstDataRendered: "firstDataRendered", gridSizeChanged: "gridSizeChanged", modelUpdated: "modelUpdated", virtualRowRemoved: "virtualRowRemoved", viewportChanged: "viewportChanged", bodyScroll: "bodyScroll", bodyScrollEnd: "bodyScrollEnd", dragStarted: "dragStarted", dragStopped: "dragStopped", stateUpdated: "stateUpdated", paginationChanged: "paginationChanged", rowDragEnter: "rowDragEnter", rowDragMove: "rowDragMove", rowDragLeave: "rowDragLeave", rowDragEnd: "rowDragEnd", columnRowGroupChanged: "columnRowGroupChanged", rowGroupOpened: "rowGroupOpened", expandOrCollapseAll: "expandOrCollapseAll", pivotMaxColumnsExceeded: "pivotMaxColumnsExceeded", pinnedRowDataChanged: "pinnedRowDataChanged", rowDataUpdated: "rowDataUpdated", asyncTransactionsFlushed: "asyncTransactionsFlushed", storeRefreshed: "storeRefreshed", headerFocused: "headerFocused", cellClicked: "cellClicked", cellDoubleClicked: "cellDoubleClicked", cellFocused: "cellFocused", cellMouseOver: "cellMouseOver", cellMouseOut: "cellMouseOut", cellMouseDown: "cellMouseDown", rowClicked: "rowClicked", rowDoubleClicked: "rowDoubleClicked", rowSelected: "rowSelected", selectionChanged: "selectionChanged", cellContextMenu: "cellContextMenu", rangeSelectionChanged: "rangeSelectionChanged", tooltipShow: "tooltipShow", tooltipHide: "tooltipHide", sortChanged: "sortChanged" }, providers: [AngularFrameworkOverrides, AngularFrameworkComponentWrapper], usesOnChanges: true, ngImport: i0, template: '', isInline: true, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.12", ngImport: i0, type: AgGridAngular, decorators: [{
            type: Component,
            args: [{
                    selector: 'ag-grid-angular',
                    standalone: true,
                    template: '',
                    providers: [AngularFrameworkOverrides, AngularFrameworkComponentWrapper],
                    // tell angular we don't want view encapsulation, we don't want a shadow root
                    encapsulation: ViewEncapsulation.None,
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
            }], includeHiddenColumnsInQuickFilter: [{
                type: Input
            }], quickFilterParser: [{
                type: Input
            }], quickFilterMatcher: [{
                type: Input
            }], applyQuickFilterBeforePivotOrAgg: [{
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
            }], suppressAdvancedFilterEval: [{
                type: Input
            }], enableCharts: [{
                type: Input
            }], chartThemes: [{
                type: Input
            }], customChartThemes: [{
                type: Input
            }], chartThemeOverrides: [{
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
            }], loading: [{
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
            }], groupTotalRow: [{
                type: Input
            }], grandTotalRow: [{
                type: Input
            }], suppressStickyTotalRow: [{
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
            }], suppressServerSideFullWidthLoadingRow: [{
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
            }], focusGridInnerElement: [{
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
            }], contextMenuVisibleChanged: [{
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
            }], fillStart: [{
                type: Output
            }], fillEnd: [{
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
            }], headerFocused: [{
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
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBK0tBLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RyxPQUFPLEVBRUgsU0FBUyxFQUVULFlBQVksRUFDWixLQUFLLEVBR0wsTUFBTSxFQUVOLGlCQUFpQixHQUNwQixNQUFNLGVBQWUsQ0FBQztBQUd2QixPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RixPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQzs7OztBQVV4RSxNQUFNLE9BQU8sYUFBYTtJQW9CdEIsWUFDSSxVQUFzQixFQUNkLGdCQUFrQyxFQUNsQyx5QkFBb0QsRUFDcEQseUJBQTJEO1FBRjNELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBbEIvRCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBTW5CLGdCQUFXLEdBQWtCLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDekQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztRQStHSCxVQUFVO1FBQ1Y7V0FDRztRQUNhLGNBQVMsR0FBbUQsU0FBUyxDQUFDO1FBQ3RGO1dBQ0c7UUFDYSxZQUFPLEdBQWdFLFNBQVMsQ0FBQztRQUNqRzs7V0FFRztRQUNhLHdCQUFtQixHQUF3QixTQUFTLENBQUM7UUFDckU7OztXQUdHO1FB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QUFNO2dCQUtVLG1CQUFtQjtzQkFBbkMsTUFBTTtnQkFLVSx1QkFBdUI7c0JBQXZDLE1BQU07Z0JBS1Usb0JBQW9CO3NCQUFwQyxNQUFNO2dCQUtVLGNBQWM7c0JBQTlCLE1BQU07Z0JBS1Usd0JBQXdCO3NCQUF4QyxNQUFNO2dCQUtVLGNBQWM7c0JBQTlCLE1BQU07Z0JBS1UsYUFBYTtzQkFBN0IsTUFBTTtnQkFLVSxXQUFXO3NCQUEzQixNQUFNO2dCQUdVLGlCQUFpQjtzQkFBakMsTUFBTTtnQkFLVSxXQUFXO3NCQUEzQixNQUFNO2dCQUdVLGFBQWE7c0JBQTdCLE1BQU07Z0JBS1UsWUFBWTtzQkFBNUIsTUFBTTtnQkFLVSxhQUFhO3NCQUE3QixNQUFNO2dCQUtVLFVBQVU7c0JBQTFCLE1BQU07Z0JBR1UsZ0JBQWdCO3NCQUFoQyxNQUFNO2dCQUtVLFdBQVc7c0JBQTNCLE1BQU07Z0JBR1UsZ0JBQWdCO3NCQUFoQyxNQUFNO2dCQUtVLGVBQWU7c0JBQS9CLE1BQU07Z0JBS1UscUJBQXFCO3NCQUFyQyxNQUFNO2dCQUlVLFdBQVc7c0JBQTNCLE1BQU07Z0JBRVUsV0FBVztzQkFBM0IsTUFBTTtnQkFHVSxXQUFXO3NCQUEzQixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2NvbnNpc3RlbnQtdHlwZS1pbXBvcnRzICovXG4vLyBAU1RBUlRfSU1QT1JUU0BcbmltcG9ydCB0eXBlIHtcbiAgICBBZHZhbmNlZEZpbHRlckJ1aWxkZXJWaXNpYmxlQ2hhbmdlZEV2ZW50LFxuICAgIEFkdmFuY2VkRmlsdGVyTW9kZWwsXG4gICAgQWxpZ25lZEdyaWQsXG4gICAgQXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkLFxuICAgIEJvZHlTY3JvbGxFbmRFdmVudCxcbiAgICBCb2R5U2Nyb2xsRXZlbnQsXG4gICAgQ2VsbENsaWNrZWRFdmVudCxcbiAgICBDZWxsQ29udGV4dE1lbnVFdmVudCxcbiAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxFZGl0UmVxdWVzdEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIENlbGxGb2N1c2VkRXZlbnQsXG4gICAgQ2VsbEtleURvd25FdmVudCxcbiAgICBDZWxsTW91c2VEb3duRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3V0RXZlbnQsXG4gICAgQ2VsbE1vdXNlT3ZlckV2ZW50LFxuICAgIENlbGxQb3NpdGlvbixcbiAgICBDZWxsVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ2hhcnRDcmVhdGVkRXZlbnQsXG4gICAgQ2hhcnREZXN0cm95ZWRFdmVudCxcbiAgICBDaGFydE9wdGlvbnNDaGFuZ2VkRXZlbnQsXG4gICAgQ2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDaGFydFJlZlBhcmFtcyxcbiAgICBDaGFydFRvb2xQYW5lbHNEZWYsXG4gICAgQ29sRGVmLFxuICAgIENvbEdyb3VwRGVmLFxuICAgIENvbFR5cGVEZWYsXG4gICAgQ29sdW1uLFxuICAgIENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uR3JvdXBPcGVuZWRFdmVudCxcbiAgICBDb2x1bW5IZWFkZXJDbGlja2VkRXZlbnQsXG4gICAgQ29sdW1uSGVhZGVyQ29udGV4dE1lbnVFdmVudCxcbiAgICBDb2x1bW5IZWFkZXJNb3VzZUxlYXZlRXZlbnQsXG4gICAgQ29sdW1uSGVhZGVyTW91c2VPdmVyRXZlbnQsXG4gICAgQ29sdW1uTWVudVZpc2libGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uTW92ZWRFdmVudCxcbiAgICBDb2x1bW5QaW5uZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uUmVzaXplZEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZpc2libGVFdmVudCxcbiAgICBDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudCxcbiAgICBDb250ZXh0TWVudVZpc2libGVDaGFuZ2VkRXZlbnQsXG4gICAgQ3N2RXhwb3J0UGFyYW1zLFxuICAgIEN1dEVuZEV2ZW50LFxuICAgIEN1dFN0YXJ0RXZlbnQsXG4gICAgRGF0YVR5cGVEZWZpbml0aW9uLFxuICAgIERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgRG9tTGF5b3V0VHlwZSxcbiAgICBEcmFnU3RhcnRlZEV2ZW50LFxuICAgIERyYWdTdG9wcGVkRXZlbnQsXG4gICAgRXhjZWxFeHBvcnRQYXJhbXMsXG4gICAgRXhjZWxTdHlsZSxcbiAgICBFeHBhbmRPckNvbGxhcHNlQWxsRXZlbnQsXG4gICAgRmlsbEVuZEV2ZW50LFxuICAgIEZpbGxPcGVyYXRpb25QYXJhbXMsXG4gICAgRmlsbFN0YXJ0RXZlbnQsXG4gICAgRmlsdGVyQ2hhbmdlZEV2ZW50LFxuICAgIEZpbHRlck1vZGlmaWVkRXZlbnQsXG4gICAgRmlsdGVyT3BlbmVkRXZlbnQsXG4gICAgRmlyc3REYXRhUmVuZGVyZWRFdmVudCxcbiAgICBGb2N1c0dyaWRJbm5lckVsZW1lbnRQYXJhbXMsXG4gICAgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudCxcbiAgICBHZXRDaGFydE1lbnVJdGVtcyxcbiAgICBHZXRDaGFydFRvb2xiYXJJdGVtcyxcbiAgICBHZXRDb250ZXh0TWVudUl0ZW1zLFxuICAgIEdldERhdGFQYXRoLFxuICAgIEdldEdyb3VwUm93QWdnUGFyYW1zLFxuICAgIEdldExvY2FsZVRleHRQYXJhbXMsXG4gICAgR2V0TWFpbk1lbnVJdGVtcyxcbiAgICBHZXRSb3dJZEZ1bmMsXG4gICAgR2V0U2VydmVyU2lkZUdyb3VwS2V5LFxuICAgIEdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zUGFyYW1zLFxuICAgIEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIEdyaWRQcmVEZXN0cm95ZWRFdmVudCxcbiAgICBHcmlkUmVhZHlFdmVudCxcbiAgICBHcmlkU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBHcmlkU3RhdGUsXG4gICAgSGVhZGVyRm9jdXNlZEV2ZW50LFxuICAgIEhlYWRlclBvc2l0aW9uLFxuICAgIElBZHZhbmNlZEZpbHRlckJ1aWxkZXJQYXJhbXMsXG4gICAgSUFnZ0Z1bmMsXG4gICAgSURhdGFzb3VyY2UsXG4gICAgSVJvd0RyYWdJdGVtLFxuICAgIElSb3dOb2RlLFxuICAgIElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSxcbiAgICBJVmlld3BvcnREYXRhc291cmNlLFxuICAgIEluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvclBhcmFtcyxcbiAgICBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uLFxuICAgIElzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50UGFyYW1zLFxuICAgIElzRnVsbFdpZHRoUm93UGFyYW1zLFxuICAgIElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIElzUm93RmlsdGVyYWJsZSxcbiAgICBJc1Jvd01hc3RlcixcbiAgICBJc1Jvd1NlbGVjdGFibGUsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXAsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIExvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMsXG4gICAgTWVudUl0ZW1EZWYsXG4gICAgTW9kZWxVcGRhdGVkRXZlbnQsXG4gICAgTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zLFxuICAgIE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIE5ld0NvbHVtbnNMb2FkZWRFdmVudCxcbiAgICBQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXMsXG4gICAgUGFzdGVFbmRFdmVudCxcbiAgICBQYXN0ZVN0YXJ0RXZlbnQsXG4gICAgUGlubmVkUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBQaXZvdE1heENvbHVtbnNFeGNlZWRlZEV2ZW50LFxuICAgIFBvc3RQcm9jZXNzUG9wdXBQYXJhbXMsXG4gICAgUG9zdFNvcnRSb3dzUGFyYW1zLFxuICAgIFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtcyxcbiAgICBQcm9jZXNzR3JvdXBIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzUm93UGFyYW1zLFxuICAgIFByb2Nlc3NVbnBpbm5lZENvbHVtbnNQYXJhbXMsXG4gICAgUmFuZ2VEZWxldGVFbmRFdmVudCxcbiAgICBSYW5nZURlbGV0ZVN0YXJ0RXZlbnQsXG4gICAgUmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgUmVkb0VuZGVkRXZlbnQsXG4gICAgUmVkb1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dDbGFzc1J1bGVzLFxuICAgIFJvd0NsaWNrZWRFdmVudCxcbiAgICBSb3dEYXRhVXBkYXRlZEV2ZW50LFxuICAgIFJvd0RvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBSb3dEcmFnRW5kRXZlbnQsXG4gICAgUm93RHJhZ0VudGVyRXZlbnQsXG4gICAgUm93RHJhZ0xlYXZlRXZlbnQsXG4gICAgUm93RHJhZ01vdmVFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgUm93R3JvdXBPcGVuZWRFdmVudCxcbiAgICBSb3dHcm91cGluZ0Rpc3BsYXlUeXBlLFxuICAgIFJvd0hlaWdodFBhcmFtcyxcbiAgICBSb3dNb2RlbFR5cGUsXG4gICAgUm93U2VsZWN0ZWRFdmVudCxcbiAgICBSb3dTdHlsZSxcbiAgICBSb3dWYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgU2VuZFRvQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zLFxuICAgIFNpZGVCYXJEZWYsXG4gICAgU2l6ZUNvbHVtbnNUb0NvbnRlbnRTdHJhdGVneSxcbiAgICBTaXplQ29sdW1uc1RvRml0R3JpZFN0cmF0ZWd5LFxuICAgIFNpemVDb2x1bW5zVG9GaXRQcm92aWRlZFdpZHRoU3RyYXRlZ3ksXG4gICAgU29ydENoYW5nZWRFdmVudCxcbiAgICBTb3J0RGlyZWN0aW9uLFxuICAgIFN0YXRlVXBkYXRlZEV2ZW50LFxuICAgIFN0YXR1c1BhbmVsRGVmLFxuICAgIFN0b3JlUmVmcmVzaGVkRXZlbnQsXG4gICAgVGFiVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBUYWJUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgVG9vbFBhbmVsU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50LFxuICAgIFRvb2x0aXBIaWRlRXZlbnQsXG4gICAgVG9vbHRpcFNob3dFdmVudCxcbiAgICBUcmVlRGF0YURpc3BsYXlUeXBlLFxuICAgIFVuZG9FbmRlZEV2ZW50LFxuICAgIFVuZG9TdGFydGVkRXZlbnQsXG4gICAgVXNlR3JvdXBGb290ZXIsXG4gICAgVXNlR3JvdXBUb3RhbFJvdyxcbiAgICBWaWV3cG9ydENoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50LFxufSBmcm9tICdAYWctZ3JpZC1jb21tdW5pdHkvY29yZSc7XG4vLyBARU5EX0lNUE9SVFNAXG5pbXBvcnQgdHlwZSB7IEdyaWRBcGksIEdyaWRPcHRpb25zLCBHcmlkUGFyYW1zLCBNb2R1bGUgfSBmcm9tICdAYWctZ3JpZC1jb21tdW5pdHkvY29yZSc7XG5pbXBvcnQgeyBfY29tYmluZUF0dHJpYnV0ZXNBbmRHcmlkT3B0aW9ucywgX3Byb2Nlc3NPbkNoYW5nZSwgY3JlYXRlR3JpZCB9IGZyb20gJ0BhZy1ncmlkLWNvbW11bml0eS9jb3JlJztcbmltcG9ydCB7XG4gICAgQWZ0ZXJWaWV3SW5pdCxcbiAgICBDb21wb25lbnQsXG4gICAgRWxlbWVudFJlZixcbiAgICBFdmVudEVtaXR0ZXIsXG4gICAgSW5wdXQsXG4gICAgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveSxcbiAgICBPdXRwdXQsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgdHlwZSB7IEFnQ2hhcnRUaGVtZSwgQWdDaGFydFRoZW1lT3ZlcnJpZGVzIH0gZnJvbSAnYWctY2hhcnRzLXR5cGVzJztcblxuaW1wb3J0IHsgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIgfSBmcm9tICcuL2FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyJztcbmltcG9ydCB7IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgfSBmcm9tICcuL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtYW5ndWxhcicsXG4gICAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcywgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJdLFxuICAgIC8vIHRlbGwgYW5ndWxhciB3ZSBkb24ndCB3YW50IHZpZXcgZW5jYXBzdWxhdGlvbiwgd2UgZG9uJ3Qgd2FudCBhIHNoYWRvdyByb290XG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhcjxURGF0YSA9IGFueSwgVENvbERlZiBleHRlbmRzIENvbERlZjxURGF0YT4gPSBDb2xEZWY8YW55Pj5cbiAgICBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95XG57XG4gICAgLy8gbm90IGludGVuZGVkIGZvciB1c2VyIHRvIGludGVyYWN0IHdpdGguIHNvIHB1dHRpbmcgXyBpbiBzbyBpZiB1c2VyIGdldHMgcmVmZXJlbmNlXG4gICAgLy8gdG8gdGhpcyBvYmplY3QsIHRoZXkga2luZCdhIGtub3cgaXQncyBub3QgcGFydCBvZiB0aGUgYWdyZWVkIGludGVyZmFjZVxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBncmlkUGFyYW1zOiBHcmlkUGFyYW1zO1xuXG4gICAgLy8gaW4gb3JkZXIgdG8gZW5zdXJlIGZpcmluZyBvZiBncmlkUmVhZHkgaXMgZGV0ZXJtaW5pc3RpY1xuICAgIHByaXZhdGUgX3Jlc29sdmVGdWxseVJlYWR5OiAoKSA9PiB2b2lkO1xuICAgIHByaXZhdGUgX2Z1bGx5UmVhZHk6IFByb21pc2U8dm9pZD4gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICB0aGlzLl9yZXNvbHZlRnVsbHlSZWFkeSA9IHJlc29sdmU7XG4gICAgfSk7XG5cbiAgICAvKiogR3JpZCBBcGkgYXZhaWxhYmxlIGFmdGVyIG9uR3JpZFJlYWR5IGV2ZW50IGhhcyBmaXJlZC4gKi9cbiAgICBwdWJsaWMgYXBpOiBHcmlkQXBpPFREYXRhPjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgYW5ndWxhckZyYW1ld29ya092ZXJyaWRlczogQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgICkge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgLy8gUnVuIHRoZSBzZXR1cCBvdXRzaWRlIG9mIGFuZ3VsYXIgc28gYWxsIHRoZSBldmVudCBoYW5kbGVycyB0aGF0IGFyZSBjcmVhdGVkIGRvIG5vdCB0cmlnZ2VyIGNoYW5nZSBkZXRlY3Rpb25cbiAgICAgICAgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRWaWV3Q29udGFpbmVyUmVmKHRoaXMudmlld0NvbnRhaW5lclJlZiwgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzKTtcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZEdyaWRPcHMgPSBfY29tYmluZUF0dHJpYnV0ZXNBbmRHcmlkT3B0aW9ucyh0aGlzLmdyaWRPcHRpb25zLCB0aGlzKTtcblxuICAgICAgICAgICAgdGhpcy5ncmlkUGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIGdsb2JhbEV2ZW50TGlzdGVuZXI6IHRoaXMuZ2xvYmFsRXZlbnRMaXN0ZW5lci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGZyYW1ld29ya092ZXJyaWRlczogdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgICAgIHByb3ZpZGVkQmVhbkluc3RhbmNlczoge1xuICAgICAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtb2R1bGVzOiAodGhpcy5tb2R1bGVzIHx8IFtdKSBhcyBhbnksXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBhcGkgPSBjcmVhdGVHcmlkKHRoaXMuX25hdGl2ZUVsZW1lbnQsIG1lcmdlZEdyaWRPcHMsIHRoaXMuZ3JpZFBhcmFtcyk7XG4gICAgICAgICAgICBpZiAoYXBpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcGkgPSBhcGk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gc29tZXRpbWVzLCBlc3BlY2lhbGx5IGluIGxhcmdlIGNsaWVudCBhcHBzIGdyaWRSZWFkeSBjYW4gZmlyZSBiZWZvcmUgbmdBZnRlclZpZXdJbml0XG4gICAgICAgICAgICAvLyB0aGlzIHRpZXMgdGhlc2UgdG9nZXRoZXIgc28gdGhhdCBncmlkUmVhZHkgd2lsbCBhbHdheXMgZmlyZSBhZnRlciBhZ0dyaWRBbmd1bGFyJ3MgbmdBZnRlclZpZXdJbml0XG4gICAgICAgICAgICAvLyB0aGUgYWN0dWFsIGNvbnRhaW5pbmcgY29tcG9uZW50J3MgbmdBZnRlclZpZXdJbml0IHdpbGwgZmlyZSBqdXN0IGFmdGVyIGFnR3JpZEFuZ3VsYXInc1xuICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZUZ1bGx5UmVhZHkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIC8vIFJ1biB0aGUgY2hhbmdlcyBvdXRzaWRlIG9mIGFuZ3VsYXIgc28gYW55IGV2ZW50IGhhbmRsZXJzIHRoYXQgYXJlIGNyZWF0ZWQgZG8gbm90IHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvblxuICAgICAgICAgICAgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBncmlkT3B0aW9uczogR3JpZE9wdGlvbnMgPSB7fTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhjaGFuZ2VzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV06IFtzdHJpbmcsIGFueV0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZE9wdGlvbnNba2V5IGFzIGtleW9mIEdyaWRPcHRpb25zXSA9IHZhbHVlLmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBfcHJvY2Vzc09uQ2hhbmdlKGdyaWRPcHRpb25zLCB0aGlzLmFwaSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIHRoZSBkZXN0cm95LCBzbyB3ZSBrbm93IG5vdCB0byBlbWl0IGFueSBldmVudHNcbiAgICAgICAgICAgIC8vIHdoaWxlIHRlYXJpbmcgZG93biB0aGUgZ3JpZC5cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICAvLyBjb3VsZCBiZSBudWxsIGlmIGdyaWQgZmFpbGVkIHRvIGluaXRpYWxpc2VcbiAgICAgICAgICAgIHRoaXMuYXBpPy5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSdsbCBlbWl0IHRoZSBlbWl0IGlmIGEgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGEgZ2l2ZW4gZXZlbnQgZWl0aGVyIG9uIHRoZSBjb21wb25lbnQgdmlhIG5vcm1hbCBhbmd1bGFyIGJpbmRpbmdcbiAgICAvLyBvciB2aWEgZ3JpZE9wdGlvbnNcbiAgICBwcm90ZWN0ZWQgaXNFbWl0dGVyVXNlZChldmVudFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIC8vIEZvciBSeEpzIGNvbXBhdGliaWxpdHkgd2UgbmVlZCB0byBjaGVjayBmb3Igb2JzZXJ2ZWQgdjcrIG9yIG9ic2VydmVycyB2NlxuICAgICAgICBjb25zdCBlbWl0dGVyQW55ID0gZW1pdHRlciBhcyBhbnk7XG4gICAgICAgIGNvbnN0IGhhc0VtaXR0ZXIgPSBlbWl0dGVyQW55Py5vYnNlcnZlZCA/PyBlbWl0dGVyQW55Py5vYnNlcnZlcnM/Lmxlbmd0aCA+IDA7XG5cbiAgICAgICAgLy8gZ3JpZFJlYWR5ID0+IG9uR3JpZFJlYWR5XG4gICAgICAgIGNvbnN0IGFzRXZlbnROYW1lID0gYG9uJHtldmVudFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCl9JHtldmVudFR5cGUuc3Vic3RyaW5nKDEpfWA7XG4gICAgICAgIGNvbnN0IGhhc0dyaWRPcHRpb25MaXN0ZW5lciA9ICEhdGhpcy5ncmlkT3B0aW9ucyAmJiAhISh0aGlzLmdyaWRPcHRpb25zIGFzIGFueSlbYXNFdmVudE5hbWVdO1xuXG4gICAgICAgIHJldHVybiBoYXNFbWl0dGVyIHx8IGhhc0dyaWRPcHRpb25MaXN0ZW5lcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gaWYgd2UgYXJlIHRlYXJpbmcgZG93biwgZG9uJ3QgZW1pdCBhbmd1bGFyIGV2ZW50cywgYXMgdGhpcyBjYXVzZXNcbiAgICAgICAgLy8gcHJvYmxlbXMgd2l0aCB0aGUgYW5ndWxhciByb3V0ZXJcbiAgICAgICAgaWYgKHRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2VuZXJpY2FsbHkgbG9vayB1cCB0aGUgZXZlbnRUeXBlXG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgaWYgKGVtaXR0ZXIgJiYgdGhpcy5pc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBlbWl0IHdpdGhpbiB0aGUgYW5ndWxhciB6b25lLCBzbyBjaGFuZ2UgZGV0ZWN0aW9uIHdvcmtzIHByb3Blcmx5XG4gICAgICAgICAgICBjb25zdCBmaXJlRW1pdHRlciA9ICgpID0+IHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5ydW5JbnNpZGVBbmd1bGFyKCgpID0+IGVtaXR0ZXIuZW1pdChldmVudCkpO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09PSAnZ3JpZFJlYWR5Jykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgZ3JpZFJlYWR5LCB3YWl0IGZvciBuZ0FmdGVyVmlld0luaXQgdG8gZmlyZSBmaXJzdCwgdGhlbiBlbWl0IHRoZW4gZ3JpZFJlYWR5IGV2ZW50XG4gICAgICAgICAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS50aGVuKCgpID0+IGZpcmVFbWl0dGVyKCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJlRW1pdHRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFByb3ZpZGVkIGFuIGluaXRpYWwgZ3JpZE9wdGlvbnMgY29uZmlndXJhdGlvbiB0byB0aGUgY29tcG9uZW50LiBJZiBhIHByb3BlcnR5IGlzIHNwZWNpZmllZCBpbiBib3RoIGdyaWRPcHRpb25zIGFuZCB2aWEgY29tcG9uZW50IGJpbmRpbmcgdGhlIGNvbXBvbmVudCBiaW5kaW5nIHRha2VzIHByZWNlZGVuY2UuICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncmlkT3B0aW9uczogR3JpZE9wdGlvbnM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gcmVnaXN0ZXIgQUcgR3JpZCBNb2R1bGVzIGRpcmVjdGx5IHdpdGggdGhpcyBpbnN0YW5jZSBvZiB0aGUgZ3JpZC5cbiAgICAgKiBTZWUgW1Byb3ZpZGluZyBNb2R1bGVzIFRvIEluZGl2aWR1YWwgR3JpZHNdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2FuZ3VsYXItZGF0YS1ncmlkL21vZHVsZXMvI3Byb3ZpZGluZy1tb2R1bGVzLXRvLWluZGl2aWR1YWwtZ3JpZHMpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtb2R1bGVzOiBNb2R1bGVbXSB8IHVuZGVmaW5lZDtcblxuICAgIC8vIEBTVEFSVEBcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBzdGF0dXMgYmFyIGNvbXBvbmVudHMgdG8gdXNlIGluIHRoZSBzdGF0dXMgYmFyLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdGF0dXNCYXI6IHsgc3RhdHVzUGFuZWxzOiBTdGF0dXNQYW5lbERlZltdIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc2lkZSBiYXIgY29tcG9uZW50cy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2lkZUJhcjogU2lkZUJhckRlZiB8IHN0cmluZyB8IHN0cmluZ1tdIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IHNob3cgdGhlIGNvbnRleHQgbWVudS4gVXNlIGlmIHlvdSBkb24ndCB3YW50IHRvIHVzZSB0aGUgZGVmYXVsdCAncmlnaHQgY2xpY2snIGNvbnRleHQgbWVudS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGBzdXBwcmVzc0NvbnRleHRNZW51YCwgeW91IGNhbiB1c2UgdGhlIGBvbkNlbGxDb250ZXh0TWVudWAgZnVuY3Rpb24gdG8gcHJvdmlkZSB5b3VyIG93biBjb2RlIHRvIGhhbmRsZSBjZWxsIGBjb250ZXh0bWVudWAgZXZlbnRzLlxuICAgICAqIFRoaXMgZmxhZyBpcyB1c2VmdWwgdG8gcHJldmVudCB0aGUgYnJvd3NlciBmcm9tIHNob3dpbmcgaXRzIGRlZmF1bHQgY29udGV4dCBtZW51LlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNvbnRleHQgbWVudSB0byBzaG93LCBldmVuIHdoZW4gYEN0cmxgIGtleSBpcyBoZWxkIGRvd24uXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFuZ2VzIHRoZSBkaXNwbGF5IHR5cGUgb2YgdGhlIGNvbHVtbiBtZW51LlxuICAgICAqIGAnbmV3J2AganVzdCBkaXNwbGF5cyB0aGUgbWFpbiBsaXN0IG9mIG1lbnUgaXRlbXMuIGAnbGVnYWN5J2AgZGlzcGxheXMgYSB0YWJiZWQgbWVudS5cbiAgICAgKiBAZGVmYXVsdCAnbmV3J1xuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbk1lbnU6ICdsZWdhY3knIHwgJ25ldycgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgY29sdW1uIG1lbnUgYnV0dG9uIHdpbGwgYWx3YXlzIGJlIHNob3duLlxuICAgICAqIFdoZW4gYGZhbHNlLCB0aGUgY29sdW1uIG1lbnUgYnV0dG9uIHdpbGwgb25seSBzaG93IHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGNvbHVtbiBoZWFkZXIuXG4gICAgICogSWYgYGNvbHVtbk1lbnUgPSAnbGVnYWN5J2AsIHRoaXMgd2lsbCBkZWZhdWx0IHRvIGBmYWxzZWAgaW5zdGVhZCBvZiBgdHJ1ZWAuXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHVzZSB0aGUgYnJvd3NlcidzIGRlZmF1bHQgdG9vbHRpcCBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBncmlkJ3MgVG9vbHRpcCBDb21wb25lbnQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSB0cmlnZ2VyIHRoYXQgd2lsbCBjYXVzZSB0b29sdGlwcyB0byBzaG93IGFuZCBoaWRlLlxuICAgICAqICAtIGBob3ZlcmAgLSBUaGUgdG9vbHRpcCB3aWxsIHNob3cvaGlkZSB3aGVuIGEgY2VsbC9oZWFkZXIgaXMgaG92ZXJlZC5cbiAgICAgKiAgLSBgZm9jdXNgIC0gVGhlIHRvb2x0aXAgd2lsbCBzaG93L2hpZGUgd2hlbiBhIGNlbGwvaGVhZGVyIGlzIGZvY3VzZWQuXG4gICAgICogQGRlZmF1bHQgJ2hvdmVyJ1xuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBUcmlnZ2VyOiAnaG92ZXInIHwgJ2ZvY3VzJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyB0aGF0IGl0IHRha2VzIGZvciB0b29sdGlwcyB0byBzaG93IHVwIG9uY2UgYW4gZWxlbWVudCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgLlxuICAgICAqIEBkZWZhdWx0IDIwMDBcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFNob3dEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIHRoYXQgaXQgdGFrZXMgZm9yIHRvb2x0aXBzIHRvIGhpZGUgb25jZSB0aGV5IGhhdmUgYmVlbiBkaXNwbGF5ZWQuXG4gICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgIGFuZCBgdG9vbHRpcEhpZGVUcmlnZ2Vyc2AgaW5jbHVkZXMgYHRpbWVvdXRgLlxuICAgICAqIEBkZWZhdWx0IDEwMDAwXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBIaWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRvb2x0aXBzIGZvbGxvdyB0aGUgY3Vyc29yIG9uY2UgdGhleSBhcmUgZGlzcGxheWVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoaXMgZGVmaW5lcyB3aGVuIHRvb2x0aXAgd2lsbCBzaG93IHVwIGZvciBDZWxscywgSGVhZGVycyBhbmQgU2V0RmlsdGVyIEl0ZW1zLlxuICAgICAqICAtIGBzdGFuZGFyZGAgLSBUaGUgdG9vbHRpcCBhbHdheXMgc2hvd3MgdXAgd2hlbiB0aGUgaXRlbXMgY29uZmlndXJlZCB3aXRoIFRvb2x0aXBzIGFyZSBob3ZlcmVkLlxuICAgICAqIC0gYHdoZW5UcnVuY2F0ZWRgIC0gVGhlIHRvb2x0aXAgd2lsbCBvbmx5IGJlIGRpc3BsYXllZCB3aGVuIHRoZSBpdGVtcyBob3ZlcmVkIGhhdmUgdHJ1bmNhdGVkIChzaG93aW5nIGVsbGlwc2lzKSB2YWx1ZXMuIFRoaXMgcHJvcGVydHkgZG9lcyBub3Qgd29yayB3aGVuIGBlbmFibGVCcm93c2VyVG9vbHRpcHM9e3RydWV9YC5cbiAgICAgKiBAZGVmYXVsdCBgc3RhbmRhcmRgXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBTaG93TW9kZTogJ3N0YW5kYXJkJyB8ICd3aGVuVHJ1bmNhdGVkJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdG9vbHRpcCBpbnRlcmFjdGlvbi4gV2hlbiB0aGlzIG9wdGlvbiBpcyBlbmFibGVkLCB0aGUgdG9vbHRpcCB3aWxsIG5vdCBoaWRlIHdoaWxlIHRoZVxuICAgICAqIHRvb2x0aXAgaXRzZWxmIGl0IGJlaW5nIGhvdmVyZWQgb3IgaGFzIGZvY3VzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcEludGVyYWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBET00gZWxlbWVudCB0byB1c2UgYXMgdGhlIHBvcHVwIHBhcmVudCBmb3IgZ3JpZCBwb3B1cHMgKGNvbnRleHQgbWVudSwgY29sdW1uIG1lbnUgZXRjKS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9wdXBQYXJlbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxzbyBpbmNsdWRlIGdyb3VwIGhlYWRlcnMgd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZCB1c2luZyBgQ3RybCArIENgIGNsaXBib2FyZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5R3JvdXBIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZnkgdGhlIGRlbGltaXRlciB0byB1c2Ugd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZC5cbiAgICAgKiBAZGVmYXVsdCAnXFx0J1xuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbGlwYm9hcmREZWxpbWl0ZXI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb3B5IHRoZSBjZWxsIHJhbmdlIG9yIGZvY3VzZWQgY2VsbCB0byB0aGUgY2xpcGJvYXJkIGFuZCBuZXZlciB0aGUgc2VsZWN0ZWQgcm93cy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29weSByb3dzIGluc3RlYWQgb2YgcmFuZ2VzIHdoZW4gYSByYW5nZSB3aXRoIG9ubHkgYSBzaW5nbGUgY2VsbCBpcyBzZWxlY3RlZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlTaW5nbGVDZWxsUmFuZ2VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHdvcmsgYXJvdW5kIGEgYnVnIHdpdGggRXhjZWwgKFdpbmRvd3MpIHRoYXQgYWRkcyBhbiBleHRyYSBlbXB0eSBsaW5lIGF0IHRoZSBlbmQgb2YgcmFuZ2VzIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvZmYgcGFzdGUgb3BlcmF0aW9ucyB3aXRoaW4gdGhlIGdyaWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdG9wIHRoZSBncmlkIHRyeWluZyB0byB1c2UgdGhlIENsaXBib2FyZCBBUEksIGlmIGl0IGlzIGJsb2NrZWQsIGFuZCBpbW1lZGlhdGVseSBmYWxsYmFjayB0byB0aGUgd29ya2Fyb3VuZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZEFwaTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBibG9jayAgICAgKipjdXQqKiBvcGVyYXRpb25zIHdpdGhpbiB0aGUgZ3JpZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0N1dFRvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBvZiBDb2x1bW4gLyBDb2x1bW4gR3JvdXAgZGVmaW5pdGlvbnMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnM6IChUQ29sRGVmIHwgQ29sR3JvdXBEZWY8VERhdGE+KVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uLiBJdGVtcyBkZWZpbmVkIGluIHRoZSBhY3R1YWwgY29sdW1uIGRlZmluaXRpb25zIGdldCBwcmVjZWRlbmNlLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sRGVmOiBDb2xEZWY8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29sdW1uIGdyb3VwIGRlZmluaXRpb24uIEFsbCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbnMgd2lsbCB1c2UgdGhlc2UgcHJvcGVydGllcy4gSXRlbXMgZGVmaW5lZCBpbiB0aGUgYWN0dWFsIGNvbHVtbiBncm91cCBkZWZpbml0aW9uIGdldCBwcmVjZWRlbmNlLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZjogUGFydGlhbDxDb2xHcm91cERlZjxURGF0YT4+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3QgbWFwIG9mIGN1c3RvbSBjb2x1bW4gdHlwZXMgd2hpY2ggY29udGFpbiBncm91cHMgb2YgcHJvcGVydGllcyB0aGF0IGNvbHVtbiBkZWZpbml0aW9ucyBjYW4gcmV1c2UgYnkgcmVmZXJlbmNpbmcgaW4gdGhlaXIgYHR5cGVgIHByb3BlcnR5LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5UeXBlczogeyBba2V5OiBzdHJpbmddOiBDb2xUeXBlRGVmPFREYXRhPiB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3QgbWFwIG9mIGNlbGwgZGF0YSB0eXBlcyB0byB0aGVpciBkZWZpbml0aW9ucy5cbiAgICAgKiBDZWxsIGRhdGEgdHlwZXMgY2FuIGVpdGhlciBvdmVycmlkZS91cGRhdGUgdGhlIHByZS1kZWZpbmVkIGRhdGEgdHlwZXNcbiAgICAgKiAoYCd0ZXh0J2AsIGAnbnVtYmVyJ2AsICBgJ2Jvb2xlYW4nYCwgIGAnZGF0ZSdgLCAgYCdkYXRlU3RyaW5nJ2Agb3IgIGAnb2JqZWN0J2ApLFxuICAgICAqIG9yIGNhbiBiZSBjdXN0b20gZGF0YSB0eXBlcy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0YVR5cGVEZWZpbml0aW9uczpcbiAgICAgICAgfCB7XG4gICAgICAgICAgICAgIFtjZWxsRGF0YVR5cGU6IHN0cmluZ106IERhdGFUeXBlRGVmaW5pdGlvbjxURGF0YT47XG4gICAgICAgICAgfVxuICAgICAgICB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogS2VlcHMgdGhlIG9yZGVyIG9mIENvbHVtbnMgbWFpbnRhaW5lZCBhZnRlciBuZXcgQ29sdW1uIERlZmluaXRpb25zIGFyZSB1cGRhdGVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlbiBkb3RzIGluIGZpZWxkIG5hbWVzIChlLmcuIGAnYWRkcmVzcy5maXJzdExpbmUnYCkgYXJlIG5vdCB0cmVhdGVkIGFzIGRlZXAgcmVmZXJlbmNlcy4gQWxsb3dzIHlvdSB0byB1c2UgZG90cyBpbiB5b3VyIGZpZWxkIG5hbWUgaWYgeW91IHByZWZlci5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpZWxkRG90Tm90YXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGNvbHVtbiBsYWJlbCBoZWFkZXIuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgdGhlIHRoZW1lIHZhbHVlIG9mIGBoZWFkZXItaGVpZ2h0YC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93cyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBmbG9hdGluZyBmaWx0ZXJzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIHRoZSB0aGVtZSB2YWx1ZSBvZiBgaGVhZGVyLWhlaWdodGAuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBjb2x1bW5zIHdoZW4gaW4gcGl2b3QgbW9kZS4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyBgaGVhZGVySGVpZ2h0YC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyBoZWFkZXIgY29sdW1uIGdyb3VwcyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGdyb3VwSGVhZGVySGVpZ2h0YC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RHcm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvdyByZW9yZGVyaW5nIGFuZCBwaW5uaW5nIGNvbHVtbnMgYnkgZHJhZ2dpbmcgY29sdW1ucyBmcm9tIHRoZSBDb2x1bW5zIFRvb2wgUGFuZWwgdG8gdGhlIGdyaWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3MgY29sdW1uIG1vdmluZywgaS5lLiB0byBtYWtlIHRoZSBjb2x1bW5zIGZpeGVkIHBvc2l0aW9uLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGBhZy1jb2x1bW4tbW92aW5nYCBjbGFzcyBpcyBub3QgYWRkZWQgdG8gdGhlIGdyaWQgd2hpbGUgY29sdW1ucyBhcmUgbW92aW5nLiBJbiB0aGUgZGVmYXVsdCB0aGVtZXMsIHRoaXMgcmVzdWx0cyBpbiBubyBhbmltYXRpb24gd2hlbiBtb3ZpbmcgY29sdW1ucy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgd2hlbiB5b3UgZHJhZyBhIGNvbHVtbiBvdXQgb2YgdGhlIGdyaWQgKGUuZy4gdG8gdGhlIGdyb3VwIHpvbmUpIHRoZSBjb2x1bW4gaXMgbm90IGhpZGRlbi5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB3aGVuIHlvdSBkcmFnIGEgY29sdW1uIGludG8gYSByb3cgZ3JvdXAgcGFuZWwgdGhlIGNvbHVtbiBpcyBub3QgaGlkZGVuLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93R3JvdXBIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ3NoaWZ0J2AgdG8gaGF2ZSBzaGlmdC1yZXNpemUgYXMgdGhlIGRlZmF1bHQgcmVzaXplIG9wZXJhdGlvbiAoc2FtZSBhcyB1c2VyIGhvbGRpbmcgZG93biBgU2hpZnRgIHdoaWxlIHJlc2l6aW5nKS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sUmVzaXplRGVmYXVsdDogJ3NoaWZ0JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3NlcyBhdXRvLXNpemluZyBjb2x1bW5zIGZvciBjb2x1bW5zLiBJbiBvdGhlciB3b3JkcywgZG91YmxlIGNsaWNraW5nIGEgY29sdW1uJ3MgaGVhZGVyJ3MgZWRnZSB3aWxsIG5vdCBhdXRvLXNpemUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBOdW1iZXIgb2YgcGl4ZWxzIHRvIGFkZCB0byBhIGNvbHVtbiB3aWR0aCBhZnRlciB0aGUgW2F1dG8tc2l6aW5nXSguL2NvbHVtbi1zaXppbmcvI2F1dG8tc2l6ZS1jb2x1bW5zLXRvLWZpdC1jZWxsLWNvbnRlbnRzKSBjYWxjdWxhdGlvbi5cbiAgICAgKiBTZXQgdGhpcyBpZiB5b3Ugd2FudCB0byBhZGQgZXh0cmEgcm9vbSB0byBhY2NvbW1vZGF0ZSAoZm9yIGV4YW1wbGUpIHNvcnQgaWNvbnMsIG9yIHNvbWUgb3RoZXIgZHluYW1pYyBuYXR1cmUgb2YgdGhlIGhlYWRlci5cbiAgICAgKiBAZGVmYXVsdCAyMFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2l6ZVBhZGRpbmc6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHNraXAgdGhlIGBoZWFkZXJOYW1lYCB3aGVuIGBhdXRvU2l6ZWAgaXMgY2FsbGVkIGJ5IGRlZmF1bHQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXV0by1zaXplIHRoZSBjb2x1bW5zIHdoZW4gdGhlIGdyaWQgaXMgbG9hZGVkLiBDYW4gc2l6ZSB0byBmaXQgdGhlIGdyaWQgd2lkdGgsIGZpdCBhIHByb3ZpZGVkIHdpZHRoLCBvciBmaXQgdGhlIGNlbGwgY29udGVudHMuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVTdHJhdGVneTpcbiAgICAgICAgfCBTaXplQ29sdW1uc1RvRml0R3JpZFN0cmF0ZWd5XG4gICAgICAgIHwgU2l6ZUNvbHVtbnNUb0ZpdFByb3ZpZGVkV2lkdGhTdHJhdGVneVxuICAgICAgICB8IFNpemVDb2x1bW5zVG9Db250ZW50U3RyYXRlZ3lcbiAgICAgICAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIG9mIGNvbXBvbmVudCBuYW1lcyB0byBjb21wb25lbnRzLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IGFueSB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdmdWxsUm93J2AgdG8gZW5hYmxlIEZ1bGwgUm93IEVkaXRpbmcuIE90aGVyd2lzZSBsZWF2ZSBibGFuayB0byBlZGl0IG9uZSBjZWxsIGF0IGEgdGltZS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdFR5cGU6ICdmdWxsUm93JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgU2luZ2xlIENsaWNrIEVkaXRpbmcgZm9yIGNlbGxzLCB0byBzdGFydCBlZGl0aW5nIHdpdGggYSBzaW5nbGUgY2xpY2suXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgbmVpdGhlciBzaW5nbGUgbm9yIGRvdWJsZSBjbGljayBzdGFydHMgZWRpdGluZy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdG9wIHRoZSBncmlkIHVwZGF0aW5nIGRhdGEgYWZ0ZXIgYEVkaXRgLCBgQ2xpcGJvYXJkYCBhbmQgYEZpbGwgSGFuZGxlYCBvcGVyYXRpb25zLiBXaGVuIHRoaXMgaXMgc2V0LCBpdCBpcyBpbnRlbmRlZCB0aGUgYXBwbGljYXRpb24gd2lsbCB1cGRhdGUgdGhlIGRhdGEsIGVnIGluIGFuIGV4dGVybmFsIGltbXV0YWJsZSBzdG9yZSwgYW5kIHRoZW4gcGFzcyB0aGUgbmV3IGRhdGFzZXQgdG8gdGhlIGdyaWQuIDxiciAvPioqTm90ZToqKiBgcm93Tm9kZS5zZXREYXRhVmFsdWUoKWAgZG9lcyBub3QgdXBkYXRlIHRoZSB2YWx1ZSBvZiB0aGUgY2VsbCB3aGVuIHRoaXMgaXMgYFRydWVgLCBpdCBmaXJlcyBgb25DZWxsRWRpdFJlcXVlc3RgIGluc3RlYWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVhZE9ubHlFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc3RvcCBjZWxsIGVkaXRpbmcgd2hlbiBncmlkIGxvc2VzIGZvY3VzLlxuICAgICAqIFRoZSBkZWZhdWx0IGlzIHRoYXQgdGhlIGdyaWQgc3RheXMgZWRpdGluZyB1bnRpbCBmb2N1cyBnb2VzIG9udG8gYW5vdGhlciBjZWxsLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgYWxvbmcgd2l0aCBgZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5QWZ0ZXJFZGl0YCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlIGBFbnRlcmAga2V5LlxuICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIGBFbnRlcmAga2V5IHdpbGwgbW92ZSBkb3duIHRvIHRoZSBjZWxsIGJlbmVhdGggYW5kIGBTaGlmdCtFbnRlcmAgd2lsbCBtb3ZlIHVwIHRvIHRoZSBjZWxsIGFib3ZlLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTmF2aWdhdGVzVmVydGljYWxseTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHlgIHRvIGhhdmUgRXhjZWwtc3R5bGUgYmVoYXZpb3VyIGZvciB0aGUgJ0VudGVyJyBrZXkuXG4gICAgICogaS5lLiBwcmVzc2luZyB0aGUgRW50ZXIga2V5IHdpbGwgbW92ZSBkb3duIHRvIHRoZSBjZWxsIGJlbmVhdGggYW5kIFNoaWZ0K0VudGVyIGtleSB3aWxsIG1vdmUgdXAgdG8gdGhlIGNlbGwgYWJvdmUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5QWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3JjZXMgQ2VsbCBFZGl0aW5nIHRvIHN0YXJ0IHdoZW4gYmFja3NwYWNlIGlzIHByZXNzZWQuIFRoaXMgaXMgb25seSByZWxldmFudCBmb3IgTWFjT1MgdXNlcnMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFZGl0aW5nT25CYWNrc3BhY2U6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFVuZG8gLyBSZWRvIHdoaWxlIGVkaXRpbmcuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBzaXplIG9mIHRoZSB1bmRvIC8gcmVkbyBzdGFjay5cbiAgICAgKiBAZGVmYXVsdCAxMFxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmdMaW1pdDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gQ1NWLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q3N2RXhwb3J0UGFyYW1zOiBDc3ZFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIHRoZSB1c2VyIGZyb20gZXhwb3J0aW5nIHRoZSBncmlkIHRvIENTVi5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NzdkV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gZXhwb3J0IHRvIEV4Y2VsLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXM6IEV4Y2VsRXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBFeGNlbC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4Y2VsRXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGxpc3QgKGFycmF5KSBvZiBFeGNlbCBzdHlsZXMgdG8gYmUgdXNlZCB3aGVuIGV4cG9ydGluZyB0byBFeGNlbCB3aXRoIHN0eWxlcy5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogRXhjZWxTdHlsZVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSb3dzIGFyZSBmaWx0ZXJlZCB1c2luZyB0aGlzIHRleHQgYXMgYSBRdWljayBGaWx0ZXIuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIFF1aWNrIEZpbHRlciBjYWNoZSwgdXNlZCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIHdoZW4gdXNpbmcgdGhlIFF1aWNrIEZpbHRlci5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhpZGRlbiBjb2x1bW5zIGFyZSBleGNsdWRlZCBmcm9tIHRoZSBRdWljayBGaWx0ZXIgYnkgZGVmYXVsdC5cbiAgICAgKiBUbyBpbmNsdWRlIGhpZGRlbiBjb2x1bW5zLCBzZXQgdG8gYHRydWVgLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluY2x1ZGVIaWRkZW5Db2x1bW5zSW5RdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhbmdlcyBob3cgdGhlIFF1aWNrIEZpbHRlciBzcGxpdHMgdGhlIFF1aWNrIEZpbHRlciB0ZXh0IGludG8gc2VhcmNoIHRlcm1zLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlclBhcnNlcjogKChxdWlja0ZpbHRlcjogc3RyaW5nKSA9PiBzdHJpbmdbXSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENoYW5nZXMgdGhlIG1hdGNoaW5nIGxvZ2ljIGZvciB3aGV0aGVyIGEgcm93IHBhc3NlcyB0aGUgUXVpY2sgRmlsdGVyLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlck1hdGNoZXI6XG4gICAgICAgIHwgKChxdWlja0ZpbHRlclBhcnRzOiBzdHJpbmdbXSwgcm93UXVpY2tGaWx0ZXJBZ2dyZWdhdGVUZXh0OiBzdHJpbmcpID0+IGJvb2xlYW4pXG4gICAgICAgIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHBpdm90aW5nLCBRdWljayBGaWx0ZXIgaXMgb25seSBhcHBsaWVkIG9uIHRoZSBwaXZvdGVkIGRhdGFcbiAgICAgKiAob3IgYWdncmVnYXRlZCBkYXRhIGlmIGBncm91cEFnZ0ZpbHRlcmluZyA9IHRydWVgKS5cbiAgICAgKiBTZXQgdG8gYHRydWVgIHRvIGFwcGx5IFF1aWNrIEZpbHRlciBiZWZvcmUgcGl2b3RpbmcgKC9hZ2dyZWdhdGluZykgaW5zdGVhZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhcHBseVF1aWNrRmlsdGVyQmVmb3JlUGl2b3RPckFnZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCB0cmVlIGRhdGEgZmlsdGVyaW5nIGJlaGF2aW91ciB0byBpbnN0ZWFkIGV4Y2x1ZGUgY2hpbGQgbm9kZXMgZnJvbSBmaWx0ZXIgcmVzdWx0cy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGVuYWJsZSB0aGUgQWR2YW5jZWQgRmlsdGVyLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUFkdmFuY2VkRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MzEsIHVzZSBgaW5pdGlhbFN0YXRlLmZpbHRlci5hZHZhbmNlZEZpbHRlck1vZGVsYCBpbnN0ZWFkLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFkdmFuY2VkRmlsdGVyTW9kZWw6IEFkdmFuY2VkRmlsdGVyTW9kZWwgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIaWRkZW4gY29sdW1ucyBhcmUgZXhjbHVkZWQgZnJvbSB0aGUgQWR2YW5jZWQgRmlsdGVyIGJ5IGRlZmF1bHQuXG4gICAgICogVG8gaW5jbHVkZSBoaWRkZW4gY29sdW1ucywgc2V0IHRvIGB0cnVlYC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbmNsdWRlSGlkZGVuQ29sdW1uc0luQWR2YW5jZWRGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERPTSBlbGVtZW50IHRvIHVzZSBhcyB0aGUgcGFyZW50IGZvciB0aGUgQWR2YW5jZWQgRmlsdGVyIHRvIGFsbG93IGl0IHRvIGFwcGVhciBvdXRzaWRlIG9mIHRoZSBncmlkLlxuICAgICAqIFNldCB0byBgbnVsbGAgb3IgYHVuZGVmaW5lZGAgdG8gYXBwZWFyIGluc2lkZSB0aGUgZ3JpZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWR2YW5jZWRGaWx0ZXJQYXJlbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byB0aGUgQWR2YW5jZWQgRmlsdGVyIEJ1aWxkZXIuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFkdmFuY2VkRmlsdGVyQnVpbGRlclBhcmFtczogSUFkdmFuY2VkRmlsdGVyQnVpbGRlclBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgQWR2YW5jZWQgRmlsdGVyIHNhbml0aXNlcyB1c2VyIGlucHV0IGFuZCBwYXNzZXMgaXQgdG8gYG5ldyBGdW5jdGlvbigpYCB0byBwcm92aWRlIHRoZSBiZXN0IHBlcmZvcm1hbmNlLlxuICAgICAqIFNldCB0byBgdHJ1ZWAgdG8gcHJldmVudCB0aGlzIGFuZCB1c2UgZGVmaW5lZCBmdW5jdGlvbnMgaW5zdGVhZC5cbiAgICAgKiBUaGlzIHdpbGwgcmVzdWx0IGluIHNsb3dlciBmaWx0ZXJpbmcsIGJ1dCBpdCBlbmFibGVzIEFkdmFuY2VkIEZpbHRlciB0byB3b3JrIHdoZW4gYHVuc2FmZS1ldmFsYCBpcyBkaXNhYmxlZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FkdmFuY2VkRmlsdGVyRXZhbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBFbmFibGUgQ2hhcnRzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGxpc3Qgb2YgY2hhcnQgdGhlbWVzIHRoYXQgYSB1c2VyIGNhbiBjaG9vc2UgZnJvbSBpbiB0aGUgY2hhcnQgcGFuZWwuXG4gICAgICogQGRlZmF1bHQgWydhZy1kZWZhdWx0JywgJ2FnLW1hdGVyaWFsJywgJ2FnLXNoZWV0cycsICdhZy1wb2x5Y2hyb21hJywgJ2FnLXZpdmlkJ107XG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBjb250YWluaW5nIGN1c3RvbSBjaGFydCB0aGVtZXMuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3VzdG9tQ2hhcnRUaGVtZXM6IHsgW25hbWU6IHN0cmluZ106IEFnQ2hhcnRUaGVtZSB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFydCB0aGVtZSBvdmVycmlkZXMgYXBwbGllZCB0byBhbGwgdGhlbWVzLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVPdmVycmlkZXM6IEFnQ2hhcnRUaGVtZU92ZXJyaWRlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGN1c3RvbWlzYXRpb24gb2YgdGhlIENoYXJ0IFRvb2wgUGFuZWxzLCBzdWNoIGFzIGNoYW5naW5nIHRoZSB0b29sIHBhbmVscyB2aXNpYmlsaXR5IGFuZCBvcmRlciwgYXMgd2VsbCBhcyBjaG9vc2luZyB3aGljaCBjaGFydHMgc2hvdWxkIGJlIGRpc3BsYXllZCBpbiB0aGUgY2hhcnQgcGFuZWwuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUb29sUGFuZWxzRGVmOiBDaGFydFRvb2xQYW5lbHNEZWYgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEdldCBjaGFydCBtZW51IGl0ZW1zLiBPbmx5IGFwcGxpZXMgd2hlbiB1c2luZyBBRyBDaGFydHMgRW50ZXJwcmlzZS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRNZW51SXRlbXM6IChzdHJpbmcgfCBNZW51SXRlbURlZilbXSB8IEdldENoYXJ0TWVudUl0ZW1zPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gdXNlIHdoZW4gZGF0YSBpcyBsb2FkaW5nIHZpYSBhIERhdGFTb3VyY2UuXG4gICAgICogU2VlIFtMb2FkaW5nIENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1sb2FkaW5nLWNlbGwtcmVuZGVyZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogUGFyYW1zIHRvIGJlIHBhc3NlZCB0byB0aGUgYGxvYWRpbmdDZWxsUmVuZGVyZXJgIGNvbXBvbmVudC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggbG9hZGluZyBjZWxsIHJlbmRlcmVyIHRvIGJlIHVzZWQgd2hlbiBkYXRhIGlzIGxvYWRpbmcgdmlhIGEgRGF0YVNvdXJjZS5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3I6IExvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiBrZXktPnZhbHVlIHBhaXJzIGZvciBsb2NhbGlzaW5nIHRleHQgd2l0aGluIHRoZSBncmlkLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hc3RlciBEZXRhaWwuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgZGV0YWlsIHJvd3MgZm9yIHdoZW4gdGhleSBhcmUgZGlzcGxheWVkIGFnYWluLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIG51bWJlciBvZiBkZXRhaWxzIHJvd3MgdG8ga2VlcC5cbiAgICAgKiBAZGVmYXVsdCAxMFxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzQ291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBgZGV0YWlsQ2VsbFJlbmRlcmVyYCB0byB1c2Ugd2hlbiBhIG1hc3RlciByb3cgaXMgZXhwYW5kZWQuXG4gICAgICogU2VlIFtEZXRhaWwgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvbWFzdGVyLWRldGFpbC1jdXN0b20tZGV0YWlsLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBwYXJhbXMgdG8gYmUgdXNlZCBieSB0aGUgRGV0YWlsIENlbGwgUmVuZGVyZXIuIENhbiBhbHNvIGJlIGEgZnVuY3Rpb24gdGhhdCBwcm92aWRlcyB0aGUgcGFyYW1zIHRvIGVuYWJsZSBkeW5hbWljIGRlZmluaXRpb25zIG9mIHRoZSBwYXJhbXMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgZml4ZWQgaGVpZ2h0IGluIHBpeGVscyBmb3IgZWFjaCBkZXRhaWwgcm93LlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGRldGFpbCBncmlkIGR5bmFtaWNhbGx5IGNoYW5nZSBpdCdzIGhlaWdodCB0byBmaXQgaXQncyByb3dzLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGVzIGEgY29udGV4dCBvYmplY3QgdGhhdCBpcyBwcm92aWRlZCB0byBkaWZmZXJlbnQgY2FsbGJhY2tzIHRoZSBncmlkIHVzZXMuIFVzZWQgZm9yIHBhc3NpbmcgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB0byB0aGUgY2FsbGJhY2tzIGJ5IHlvdXIgYXBwbGljYXRpb24uXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29udGV4dDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKlxuICAgICAqIEEgbGlzdCBvZiBncmlkcyB0byB0cmVhdCBhcyBBbGlnbmVkIEdyaWRzLlxuICAgICAqIFByb3ZpZGUgYSBsaXN0IGlmIHRoZSBncmlkcyAvIGFwaXMgYWxyZWFkeSBleGlzdCBvciByZXR1cm4gdmlhIGEgY2FsbGJhY2sgdG8gYWxsb3cgdGhlIGFsaWduZWQgZ3JpZHMgdG8gYmUgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5LlxuICAgICAqIElmIGdyaWRzIGFyZSBhbGlnbmVkIHRoZW4gdGhlIGNvbHVtbnMgYW5kIGhvcml6b250YWwgc2Nyb2xsaW5nIHdpbGwgYmUga2VwdCBpbiBzeW5jLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGlnbmVkR3JpZHM6IChBbGlnbmVkR3JpZFtdIHwgKCgpID0+IEFsaWduZWRHcmlkW10pKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhbmdlIHRoaXMgdmFsdWUgdG8gc2V0IHRoZSB0YWJJbmRleCBvcmRlciBvZiB0aGUgR3JpZCB3aXRoaW4geW91ciBhcHBsaWNhdGlvbi5cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIG51bWJlciBvZiByb3dzIHJlbmRlcmVkIG91dHNpZGUgdGhlIHZpZXdhYmxlIGFyZWEgdGhlIGdyaWQgcmVuZGVycy5cbiAgICAgKiBIYXZpbmcgYSBidWZmZXIgbWVhbnMgdGhlIGdyaWQgd2lsbCBoYXZlIHJvd3MgcmVhZHkgdG8gc2hvdyBhcyB0aGUgdXNlciBzbG93bHkgc2Nyb2xscyB2ZXJ0aWNhbGx5LlxuICAgICAqIEBkZWZhdWx0IDEwXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0J1ZmZlcjogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIHZhbHVlIGNhY2hlLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb25maWd1cmUgdGhlIHZhbHVlIGNhY2hlIHRvIG5vdCBleHBpcmUgYWZ0ZXIgZGF0YSB1cGRhdGVzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmFsdWVDYWNoZU5ldmVyRXhwaXJlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbGxvdyBjZWxsIGV4cHJlc3Npb25zLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0b3VjaCBzdXBwb3J0IChidXQgZG9lcyBub3QgcmVtb3ZlIHRoZSBicm93c2VyJ3MgZWZmb3J0cyB0byBzaW11bGF0ZSBtb3VzZSBldmVudHMgb24gdG91Y2gpLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NUb3VjaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBub3Qgc2V0IGZvY3VzIGJhY2sgb24gdGhlIGdyaWQgYWZ0ZXIgYSByZWZyZXNoLiBUaGlzIGNhbiBhdm9pZCBpc3N1ZXMgd2hlcmUgeW91IHdhbnQgdG8ga2VlcCB0aGUgZm9jdXMgb24gYW5vdGhlciBwYXJ0IG9mIHRoZSBicm93c2VyLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRm9jdXNBZnRlclJlZnJlc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRoZSBhc3luY2hyb25vdXMgbmF0dXJlIG9mIHRoZSBldmVudHMgaW50cm9kdWNlZCBpbiB2MTAsIGFuZCBtYWtlcyB0aGVtIHN5bmNocm9ub3VzLiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGZvciB0aGUgcHVycG9zZSBvZiBzdXBwb3J0aW5nIGxlZ2FjeSBjb2RlIHdoaWNoIGhhcyBhIGRlcGVuZGVuY3kgb24gc3luY2hyb25vdXMgZXZlbnRzIGZyb20gZWFybGllciB2ZXJzaW9ucyAodjkgb3IgZWFybGllcikgb2YgQUcgR3JpZC4gICAgICoqSXQgaXMgc3Ryb25nbHkgcmVjb21tZW5kZWQgdGhhdCB5b3UgZG8gbm90IGNoYW5nZSB0aGlzIHByb3BlcnR5IHVubGVzcyB5b3UgaGF2ZSBsZWdhY3kgaXNzdWVzLioqXG4gICAgICogQGRlcHJlY2F0ZWQgdjMxIEV2ZW50cyBzaG91bGQgYmUgaGFuZGxlZCBhc3luY2hyb25vdXNseS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQXN5bmNFdmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBncmlkIHdpbGwgY2hlY2sgZm9yIGBSZXNpemVPYnNlcnZlcmAgYW5kIHVzZSBpdCBpZiBpdCBleGlzdHMgaW4gdGhlIGJyb3dzZXIsIG90aGVyd2lzZSBpdCB3aWxsIHVzZSB0aGUgZ3JpZCdzIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9uLiBTb21lIHVzZXJzIHJlcG9ydGVkIGlzc3VlcyB3aXRoIENocm9tZSdzIGBSZXNpemVPYnNlcnZlcmAuIFVzZSB0aGlzIHByb3BlcnR5IHRvIGFsd2F5cyB1c2UgdGhlIGdyaWQncyBhbHRlcm5hdGl2ZSBpbXBsZW1lbnRhdGlvbiBzaG91bGQgc3VjaCBwcm9ibGVtcyBleGlzdC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyBzaG93aW5nIGEgd2FybmluZyBtZXNzYWdlIGluIHRoZSBjb25zb2xlIGlmIHVzaW5nIGEgYGdyaWRPcHRpb25zYCBvciBgY29sRGVmYCBwcm9wZXJ0eSB0aGF0IGRvZXNuJ3QgZXhpc3QuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Byb3BlcnR5TmFtZXNDaGVjazogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgY2hhbmdlIGRldGVjdGlvbi5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NoYW5nZURldGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIGVuYWJsZSBkZWJ1ZyBpbmZvcm1hdGlvbiBmcm9tIHRoZSBncmlkIGFuZCByZWxhdGVkIGNvbXBvbmVudHMuIFdpbGwgcmVzdWx0IGluIGFkZGl0aW9uYWwgbG9nZ2luZyBiZWluZyBvdXRwdXQsIGJ1dCB2ZXJ5IHVzZWZ1bCB3aGVuIGludmVzdGlnYXRpbmcgcHJvYmxlbXMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWJ1ZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2hvdyBvciBoaWRlIHRoZSBsb2FkaW5nIG92ZXJsYXkuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBIVE1MIHN0cmluZyB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBsb2FkaW5nIG92ZXJsYXkuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlMb2FkaW5nVGVtcGxhdGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdPdmVybGF5Q29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgbG9hZGluZyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlICdsb2FkaW5nJyBvdmVybGF5LlxuICAgICAqIEBkZXByZWNhdGVkIHYzMiAtIERlcHJlY2F0ZWQuIFVzZSBgbG9hZGluZz1mYWxzZWAgaW5zdGVhZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTG9hZGluZ092ZXJsYXk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBIVE1MIHN0cmluZyB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBuby1yb3dzIG92ZXJsYXkuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG92ZXJsYXlOb1Jvd3NUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIG5vLXJvd3Mgb3ZlcmxheSBjb21wb25lbnQuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudDogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDdXN0b21pc2UgdGhlIHBhcmFtZXRlcnMgcHJvdmlkZWQgdG8gdGhlIG5vLXJvd3Mgb3ZlcmxheSBjb21wb25lbnQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5vUm93c092ZXJsYXlDb21wb25lbnRQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBwcmV2ZW50IHRoZSBuby1yb3dzIG92ZXJsYXkgYmVpbmcgc2hvd24gd2hlbiB0aGVyZSBpcyBubyByb3cgZGF0YS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHdoZXRoZXIgcGFnaW5hdGlvbiBpcyBlbmFibGVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJvd3MgdG8gbG9hZCBwZXIgcGFnZS4gSWYgYHBhZ2luYXRpb25BdXRvUGFnZVNpemVgIGlzIHNwZWNpZmllZCwgdGhpcyBwcm9wZXJ0eSBpcyBpZ25vcmVkLlxuICAgICAqIEBkZWZhdWx0IDEwMFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uUGFnZVNpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGV0ZXJtaW5lcyBpZiB0aGUgcGFnZSBzaXplIHNlbGVjdG9yIGlzIHNob3duIGluIHRoZSBwYWdpbmF0aW9uIHBhbmVsIG9yIG5vdC5cbiAgICAgKiBTZXQgdG8gYW4gYXJyYXkgb2YgdmFsdWVzIHRvIHNob3cgdGhlIHBhZ2Ugc2l6ZSBzZWxlY3RvciB3aXRoIGN1c3RvbSBsaXN0IG9mIHBvc3NpYmxlIHBhZ2Ugc2l6ZXMuXG4gICAgICogU2V0IHRvIGB0cnVlYCB0byBzaG93IHRoZSBwYWdlIHNpemUgc2VsZWN0b3Igd2l0aCB0aGUgZGVmYXVsdCBwYWdlIHNpemVzIGBbMjAsIDUwLCAxMDBdYC5cbiAgICAgKiBTZXQgdG8gYGZhbHNlYCB0byBoaWRlIHRoZSBwYWdlIHNpemUgc2VsZWN0b3IuXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZVNlbGVjdG9yOiBudW1iZXJbXSB8IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgbnVtYmVyIG9mIHJvd3MgdG8gbG9hZCBwZXIgcGFnZSBpcyBhdXRvbWF0aWNhbGx5IGFkanVzdGVkIGJ5IHRoZSBncmlkIHNvIGVhY2ggcGFnZSBzaG93cyBlbm91Z2ggcm93cyB0byBqdXN0IGZpbGwgdGhlIGFyZWEgZGVzaWduYXRlZCBmb3IgdGhlIGdyaWQuIElmIGBmYWxzZWAsIGBwYWdpbmF0aW9uUGFnZVNpemVgIGlzIHVzZWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHBhZ2VzIHNwbGl0IGNoaWxkcmVuIG9mIGdyb3VwcyB3aGVuIHVzaW5nIFJvdyBHcm91cGluZyBvciBkZXRhaWwgcm93cyB3aXRoIE1hc3RlciBEZXRhaWwuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0ZUNoaWxkUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgZGVmYXVsdCBncmlkIGNvbnRyb2xzIGZvciBuYXZpZ2F0aW9uIGFyZSBoaWRkZW4uXG4gICAgICogVGhpcyBpcyB1c2VmdWwgaWYgYHBhZ2luYXRpb249dHJ1ZWAgYW5kIHlvdSB3YW50IHRvIHByb3ZpZGUgeW91ciBvd24gcGFnaW5hdGlvbiBjb250cm9scy5cbiAgICAgKiBPdGhlcndpc2UsIHdoZW4gYHBhZ2luYXRpb249dHJ1ZWAgdGhlIGdyaWQgYXV0b21hdGljYWxseSBzaG93cyB0aGUgbmVjZXNzYXJ5IGNvbnRyb2xzIGF0IHRoZSBib3R0b20gc28gdGhhdCB0aGUgdXNlciBjYW4gbmF2aWdhdGUgdGhyb3VnaCB0aGUgZGlmZmVyZW50IHBhZ2VzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUGFnaW5hdGlvblBhbmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBwaXZvdCBtb2RlLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90TW9kZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB0byBzaG93IHRoZSAncGl2b3QgcGFuZWwnICh3aGVyZSB5b3UgZHJhZyByb3dzIHRvIHBpdm90KSBhdCB0aGUgdG9wLiBOb3RlIHRoYXQgdGhlIHBpdm90IHBhbmVsIHdpbGwgbmV2ZXIgc2hvdyBpZiBgcGl2b3RNb2RlYCBpcyBvZmYuXG4gICAgICogQGRlZmF1bHQgJ25ldmVyJ1xuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90UGFuZWxTaG93OiAnYWx3YXlzJyB8ICdvbmx5V2hlblBpdm90aW5nJyB8ICduZXZlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBnZW5lcmF0ZWQgY29sdW1ucyBiZWZvcmUgdGhlIGdyaWQgaGFsdHMgZXhlY3V0aW9uLiBVcG9uIHJlYWNoaW5nIHRoaXMgbnVtYmVyLCB0aGUgZ3JpZCBoYWx0cyBnZW5lcmF0aW9uIG9mIGNvbHVtbnNcbiAgICAgKiBhbmQgdHJpZ2dlcnMgYSBgcGl2b3RNYXhDb2x1bW5zRXhjZWVkZWRgIGV2ZW50LiBgLTFgIGZvciBubyBsaW1pdC5cbiAgICAgKiBAZGVmYXVsdCAtMVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdE1heEdlbmVyYXRlZENvbHVtbnM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgcGl2b3RpbmcsIHNldCB0byB0aGUgbnVtYmVyIG9mIGNvbHVtbiBncm91cCBsZXZlbHMgdG8gZXhwYW5kIGJ5IGRlZmF1bHQsIGUuZy4gYDBgIGZvciBub25lLCBgMWAgZm9yIGZpcnN0IGxldmVsIG9ubHksIGV0Yy4gU2V0IHRvIGAtMWAgdG8gZXhwYW5kIGV2ZXJ5dGhpbmcuXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdERlZmF1bHRFeHBhbmRlZDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciB3aXRoaW4gdGhlIFBpdm90IENvbHVtbiBHcm91cHMsIGluIHRoZSBwb3NpdGlvbiBzcGVjaWZpZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Q29sdW1uR3JvdXBUb3RhbHM6ICdiZWZvcmUnIHwgJ2FmdGVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBzZXQgYW5kIHRoZSBncmlkIGlzIGluIHBpdm90IG1vZGUsIGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCB0b3RhbHMgd2lsbCBhcHBlYXIgZm9yIGVhY2ggdmFsdWUgY29sdW1uIGluIHRoZSBwb3NpdGlvbiBzcGVjaWZpZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90Um93VG90YWxzOiAnYmVmb3JlJyB8ICdhZnRlcicgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3Qgc3dhcCBpbiB0aGUgZ3JvdXBpbmcgY29sdW1uIHdoZW4gcGl2b3RpbmcuIFVzZWZ1bCBpZiBwaXZvdGluZyB1c2luZyBTZXJ2ZXIgU2lkZSBSb3cgTW9kZWwgb3IgVmlld3BvcnQgUm93IE1vZGVsIGFuZCB5b3Ugd2FudCBmdWxsIGNvbnRyb2wgb2YgYWxsIGNvbHVtbnMgaW5jbHVkaW5nIHRoZSBncm91cCBjb2x1bW4uXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaXZvdFN1cHByZXNzQXV0b0NvbHVtbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBwaXZvdCBjb2x1bW4gZ3JvdXBzIHdpbGwgYXBwZWFyICdmaXhlZCcsIHdpdGhvdXQgdGhlIGFiaWxpdHkgdG8gZXhwYW5kIGFuZCBjb2xsYXBzZSB0aGUgY29sdW1uIGdyb3Vwcy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzRXhwYW5kYWJsZVBpdm90R3JvdXBzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZW4gcm93IGdyb3VwLCBwaXZvdCBhbmQgdmFsdWUgYWdncmVnYXRpb24gd2lsbCBiZSByZWFkLW9ubHkgZnJvbSB0aGUgR1VJLiBUaGUgZ3JpZCB3aWxsIGRpc3BsYXkgd2hhdCB2YWx1ZXMgYXJlIHVzZWQgZm9yIGVhY2gsIGJ1dCB3aWxsIG5vdCBhbGxvdyB0aGUgdXNlciB0byBjaGFuZ2UgdGhlIHNlbGVjdGlvbi5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdW5jdGlvbnNSZWFkT25seTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBtYXAgb2YgJ2Z1bmN0aW9uIG5hbWUnIHRvICdmdW5jdGlvbicgZm9yIGN1c3RvbSBhZ2dyZWdhdGlvbiBmdW5jdGlvbnMuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdnRnVuY3M6IHsgW2tleTogc3RyaW5nXTogSUFnZ0Z1bmM8VERhdGE+IH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBjb2x1bW4gaGVhZGVycyB3b24ndCBpbmNsdWRlIHRoZSBgYWdnRnVuY2AgbmFtZSwgZS5nLiBgJ3N1bShCYW5rIEJhbGFuY2UpYCcgd2lsbCBqdXN0IGJlIGAnQmFuayBCYWxhbmNlJ2AuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyBhZ2dyZWdhdGlvbnMsIHRoZSBncmlkIHdpbGwgYWx3YXlzIGNhbGN1bGF0ZSB0aGUgcm9vdCBsZXZlbCBhZ2dyZWdhdGlvbiB2YWx1ZS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNBZ2dyZWdhdGVBdFJvb3RMZXZlbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyBjaGFuZ2UgZGV0ZWN0aW9uLCBvbmx5IHRoZSB1cGRhdGVkIGNvbHVtbiB3aWxsIGJlIHJlLWFnZ3JlZ2F0ZWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWdncmVnYXRlT25seUNoYW5nZWRDb2x1bW5zOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgYWdncmVnYXRpb25zIGFyZSBub3QgaW1wYWN0ZWQgYnkgZmlsdGVyaW5nLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG9taXQgdGhlIHZhbHVlIENvbHVtbiBoZWFkZXIgd2hlbiB0aGVyZSBpcyBvbmx5IGEgc2luZ2xlIHZhbHVlIGNvbHVtbi5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJlbW92ZVBpdm90SGVhZGVyUm93V2hlblNpbmdsZVZhbHVlQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYGZhbHNlYCB0byBkaXNhYmxlIFJvdyBBbmltYXRpb24gd2hpY2ggaXMgZW5hYmxlZCBieSBkZWZhdWx0LlxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYW5pbWF0ZVJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBjZWxscyBmbGFzaCBhZnRlciBkYXRhIGNoYW5nZXMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAZGVwcmVjYXRlZCAzMS4yIHVzZSBgZW5hYmxlQ2VsbENoYW5nZUZsYXNoYCBpbiB0aGUgYENvbERlZmAgb3IgYGRlZmF1bHRDb2xEZWZgIGZvciBhbGwgY29sdW1ucy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlQ2VsbENoYW5nZUZsYXNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBiZSB1c2VkIHdoZW4gc2V0dGluZyBgZW5hYmxlQ2VsbENoYW5nZUZsYXNoYCBvbiBjb2x1bW4gZGVmaW5pdGlvbnMuIFNldHMgdGhlIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyBhIGNlbGwgc2hvdWxkIHJlbWFpbiBpbiBpdHMgXCJmbGFzaGVkXCIgc3RhdGUuXG4gICAgICogQGRlZmF1bHQgNTAwXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNlbGxGbGFzaER1cmF0aW9uOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYzMS4xIC0gdXNlIGBjZWxsRmxhc2hEdXJhdGlvbmAgaW5zdGVhZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gYmUgdXNlZCB3aGVuIHNldHRpbmcgYGVuYWJsZUNlbGxDaGFuZ2VGbGFzaGAgb24gY29sdW1uIGRlZmluaXRpb25zLiBTZXRzIHRoZSBkdXJhdGlvbiBpbiBtaWxsaXNlY29uZHMgb2YgaG93IGxvbmcgdGhlIFwiZmxhc2hlZFwiIHN0YXRlIGFuaW1hdGlvbiB0YWtlcyB0byBmYWRlIGF3YXkgYWZ0ZXIgdGhlIHRpbWVyIHNldCBieSBjZWxsRmxhc2hEdXJhdGlvbiBoYXMgY29tcGxldGVkLlxuICAgICAqIEBkZWZhdWx0IDEwMDBcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZhZGVEdXJhdGlvbjogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MzEuMSAtIHVzZSBgY2VsbEZhZGVEdXJhdGlvbmAgaW5zdGVhZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZhZGVEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgY2VsbHMgZmxhc2ggYWZ0ZXIgZGF0YSBjaGFuZ2VzIGV2ZW4gd2hlbiB0aGUgY2hhbmdlIGlzIGR1ZSB0byBmaWx0ZXJpbmcuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbGxvd1Nob3dDaGFuZ2VBZnRlckZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3dpdGNoIGJldHdlZW4gbGF5b3V0IG9wdGlvbnM6IGBub3JtYWxgLCBgYXV0b0hlaWdodGAsIGBwcmludGAuXG4gICAgICogQGRlZmF1bHQgJ25vcm1hbCdcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG9tTGF5b3V0OiBEb21MYXlvdXRUeXBlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIG9yZGVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgaW4gdGhlIERPTSBhcmUgY29uc2lzdGVudCB3aXRoIHdoYXQgaXMgb24gc2NyZWVuLlxuICAgICAqIERpc2FibGVzIHJvdyBhbmltYXRpb25zLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5zdXJlRG9tT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gb3BlcmF0ZSB0aGUgZ3JpZCBpbiBSVEwgKFJpZ2h0IHRvIExlZnQpIG1vZGUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVSdGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgZ3JpZCBkb2Vzbid0IHZpcnR1YWxpc2UgdGhlIGNvbHVtbnMuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSAxMDAgY29sdW1ucywgYnV0IG9ubHkgMTAgdmlzaWJsZSBkdWUgdG8gc2Nyb2xsaW5nLCBhbGwgMTAwIHdpbGwgYWx3YXlzIGJlIHJlbmRlcmVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCB0aGUgZ3JpZCBoYXMgYSBsaW1pdCBvZiByZW5kZXJpbmcgYSBtYXhpbXVtIG9mIDUwMCByb3dzIGF0IG9uY2UgKHJlbWVtYmVyIHRoZSBncmlkIG9ubHkgcmVuZGVycyByb3dzIHlvdSBjYW4gc2VlLCBzbyB1bmxlc3MgeW91ciBkaXNwbGF5IHNob3dzIG1vcmUgdGhhbiA1MDAgcm93cyB3aXRob3V0IHZlcnRpY2FsbHkgc2Nyb2xsaW5nIHRoaXMgd2lsbCBuZXZlciBiZSBhbiBpc3N1ZSkuXG4gICAgICogPGJyIC8+KipUaGlzIGlzIG9ubHkgcmVsZXZhbnQgaWYgeW91IGFyZSBtYW51YWxseSBzZXR0aW5nIGByb3dCdWZmZXJgIHRvIGEgaGlnaCB2YWx1ZSAocmVuZGVyaW5nIG1vcmUgcm93cyB0aGFuIGNhbiBiZSBzZWVuKSwgb3IgYHN1cHByZXNzUm93VmlydHVhbGlzYXRpb25gIGlzIHRydWUsIG9yIGlmIHlvdXIgZ3JpZCBoZWlnaHQgaXMgYWJsZSB0byBkaXNwbGF5IG1vcmUgdGhhbiA1MDAgcm93cyBhdCBvbmNlLioqXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01heFJlbmRlcmVkUm93UmVzdHJpY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCB0aGUgZ3JpZCBkb2Vzbid0IHZpcnR1YWxpc2UgdGhlIHJvd3MuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSAxMDAgcm93cywgYnV0IG9ubHkgMTAgdmlzaWJsZSBkdWUgdG8gc2Nyb2xsaW5nLCBhbGwgMTAwIHdpbGwgYWx3YXlzIGJlIHJlbmRlcmVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dWaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgTWFuYWdlZCBSb3cgRHJhZ2dpbmcuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ01hbmFnZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgcm93IGRyYWdnaW5nLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RHJhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtb3Zpbmcgcm93cyB3aGlsZSBkcmFnZ2luZyB0aGUgYHJvd0RyYWdgIHdhZmZsZS4gVGhpcyBvcHRpb24gaGlnaGxpZ2h0cyB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIHJvdyB3aWxsIGJlIHBsYWNlZCBhbmQgaXQgd2lsbCBvbmx5IG1vdmUgdGhlIHJvdyBvbiBtb3VzZSB1cC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01vdmVXaGVuUm93RHJhZ2dpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIGNsaWNraW5nIGFuZCBkcmFnZ2luZyBhbnl3aGVyZSBvbiB0aGUgcm93IHdpdGhvdXQgdGhlIG5lZWQgZm9yIGEgZHJhZyBoYW5kbGUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ0VudGlyZVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgZHJhZ2dpbmcgbXVsdGlwbGUgcm93cyBhdCB0aGUgc2FtZSB0aW1lLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdNdWx0aVJvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayB0aGF0IHNob3VsZCByZXR1cm4gYSBzdHJpbmcgdG8gYmUgZGlzcGxheWVkIGJ5IHRoZSBgcm93RHJhZ0NvbXBgIHdoaWxlIGRyYWdnaW5nIGEgcm93LlxuICAgICAqIElmIHRoaXMgY2FsbGJhY2sgaXMgbm90IHNldCwgdGhlIGN1cnJlbnQgY2VsbCB2YWx1ZSB3aWxsIGJlIHVzZWQuXG4gICAgICogSWYgdGhlIGByb3dEcmFnVGV4dGAgY2FsbGJhY2sgaXMgc2V0IGluIHRoZSBDb2xEZWYgaXQgd2lsbCB0YWtlIHByZWNlZGVuY2Ugb3ZlciB0aGlzLCBleGNlcHQgd2hlblxuICAgICAqIGByb3dEcmFnRW50aXJlUm93PXRydWVgLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0RyYWdUZXh0OiAoKHBhcmFtczogSVJvd0RyYWdJdGVtLCBkcmFnSXRlbUNvdW50OiBudW1iZXIpID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgeW91ciBvd24gY2VsbCByZW5kZXJlciBjb21wb25lbnQgdG8gdXNlIGZvciBmdWxsIHdpZHRoIHJvd3MuXG4gICAgICogU2VlIFtGdWxsIFdpZHRoIFJvd3NdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2Z1bGwtd2lkdGgtcm93cy8pIGZvciBmcmFtZXdvcmsgc3BlY2lmaWMgaW1wbGVtZW50YXRpb24gZGV0YWlscy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgYGZ1bGxXaWR0aENlbGxSZW5kZXJlcmAgY29tcG9uZW50LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXJQYXJhbXM6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRoZSBGdWxsIFdpZHRoIFJvd3MgZW1iZWRkZWQgaW4gZ3JpZCdzIG1haW4gY29udGFpbmVyIHNvIHRoZXkgY2FuIGJlIHNjcm9sbGVkIGhvcml6b250YWxseS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW1iZWRGdWxsV2lkdGhSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCB2MzFcbiAgICAgKiBXaGVuIGVuYWJsZWQsIHRoZSBncmlkIHdpbGwgY2FzdCBncm91cCB2YWx1ZXMgdG8gc3RyaW5nIHR5cGUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0dyb3VwTWFpbnRhaW5WYWx1ZVR5cGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyBob3cgdGhlIHJlc3VsdHMgb2Ygcm93IGdyb3VwaW5nIHNob3VsZCBiZSBkaXNwbGF5ZWQuXG4gICAgICpcbiAgICAgKiAgVGhlIG9wdGlvbnMgYXJlOlxuICAgICAqXG4gICAgICogLSBgJ3NpbmdsZUNvbHVtbidgOiBzaW5nbGUgZ3JvdXAgY29sdW1uIGF1dG9tYXRpY2FsbHkgYWRkZWQgYnkgdGhlIGdyaWQuXG4gICAgICogLSBgJ211bHRpcGxlQ29sdW1ucydgOiBhIGdyb3VwIGNvbHVtbiBwZXIgcm93IGdyb3VwIGlzIGFkZGVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICogLSBgJ2dyb3VwUm93cydgOiBncm91cCByb3dzIGFyZSBhdXRvbWF0aWNhbGx5IGFkZGVkIGluc3RlYWQgb2YgZ3JvdXAgY29sdW1ucy5cbiAgICAgKiAtIGAnY3VzdG9tJ2A6IGluZm9ybXMgdGhlIGdyaWQgdGhhdCBncm91cCBjb2x1bW5zIHdpbGwgYmUgcHJvdmlkZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGlzcGxheVR5cGU6IFJvd0dyb3VwaW5nRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGdyb3VwaW5nLCBzZXQgdG8gdGhlIG51bWJlciBvZiBsZXZlbHMgdG8gZXhwYW5kIGJ5IGRlZmF1bHQsIGUuZy4gYDBgIGZvciBub25lLCBgMWAgZm9yIGZpcnN0IGxldmVsIG9ubHksIGV0Yy4gU2V0IHRvIGAtMWAgdG8gZXhwYW5kIGV2ZXJ5dGhpbmcuXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cERlZmF1bHRFeHBhbmRlZDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgc3BlY2lmeWluZyB0aGUgZ3JvdXAgJ2F1dG8gY29sdW1uJyBpZiB5b3UgYXJlIG5vdCBoYXBweSB3aXRoIHRoZSBkZWZhdWx0LiBJZiBncm91cGluZywgdGhpcyBjb2x1bW4gZGVmaW5pdGlvbiBpcyBpbmNsdWRlZCBhcyB0aGUgZmlyc3QgY29sdW1uIGluIHRoZSBncmlkLiBJZiBub3QgZ3JvdXBpbmcsIHRoaXMgY29sdW1uIGlzIG5vdCBpbmNsdWRlZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b0dyb3VwQ29sdW1uRGVmOiBDb2xEZWY8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgcHJlc2VydmVzIHRoZSBjdXJyZW50IGdyb3VwIG9yZGVyIHdoZW4gc29ydGluZyBvbiBub24tZ3JvdXAgY29sdW1ucy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cE1haW50YWluT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBpZiB5b3Ugc2VsZWN0IGEgZ3JvdXAsIHRoZSBjaGlsZHJlbiBvZiB0aGUgZ3JvdXAgd2lsbCBhbHNvIGJlIHNlbGVjdGVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgbG9ja3MgdGhlIGdyb3VwIHNldHRpbmdzIG9mIGEgbnVtYmVyIG9mIGNvbHVtbnMsIGUuZy4gYDBgIGZvciBubyBncm91cCBsb2NraW5nLiBgMWAgZm9yIGZpcnN0IGdyb3VwIGNvbHVtbiBsb2NrZWQsIGAtMWAgZm9yIGFsbCBncm91cCBjb2x1bW5zIGxvY2tlZC5cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBMb2NrR3JvdXBDb2x1bW5zOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBkZXRlcm1pbmUgd2hldGhlciBmaWx0ZXJzIHNob3VsZCBiZSBhcHBsaWVkIG9uIGFnZ3JlZ2F0ZWQgZ3JvdXAgdmFsdWVzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwQWdnRmlsdGVyaW5nOiBib29sZWFuIHwgSXNSb3dGaWx0ZXJhYmxlPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZ3JvdXBpbmcsIHRoaXMgY29udHJvbHMgd2hldGhlciB0byBzaG93IGEgZ3JvdXAgZm9vdGVyIHdoZW4gdGhlIGdyb3VwIGlzIGV4cGFuZGVkLlxuICAgICAqIElmIGB0cnVlYCwgdGhlbiBieSBkZWZhdWx0LCB0aGUgZm9vdGVyIHdpbGwgY29udGFpbiBhZ2dyZWdhdGUgZGF0YSAoaWYgYW55KSB3aGVuIHNob3duIGFuZCB0aGUgaGVhZGVyIHdpbGwgYmUgYmxhbmsuXG4gICAgICogV2hlbiBjbG9zZWQsIHRoZSBoZWFkZXIgd2lsbCBjb250YWluIHRoZSBhZ2dyZWdhdGUgZGF0YSByZWdhcmRsZXNzIG9mIHRoaXMgc2V0dGluZyAoYXMgdGhlIGZvb3RlciBpcyBoaWRkZW4gYW55d2F5KS5cbiAgICAgKiBUaGlzIGlzIGhhbmR5IGZvciAndG90YWwnIHJvd3MsIHRoYXQgYXJlIGRpc3BsYXllZCBiZWxvdyB0aGUgZGF0YSB3aGVuIHRoZSBncm91cCBpcyBvcGVuLCBhbmQgYWxvbmdzaWRlIHRoZSBncm91cCB3aGVuIGl0IGlzIGNsb3NlZC5cbiAgICAgKiBJZiBhIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBpdCBjYW4gdXNlZCB0byBzZWxlY3Qgd2hpY2ggZ3JvdXBzIHdpbGwgaGF2ZSBhIGZvb3RlciBhZGRlZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqXG4gICAgICogQGRlcHJlY2F0ZWQgdjMxLjMgLSB1c2UgYGdyb3VwVG90YWxSb3dgIGluc3RlYWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZUZvb3RlcjogYm9vbGVhbiB8IFVzZUdyb3VwRm9vdGVyPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzaG93IGEgJ2dyYW5kIHRvdGFsJyBncm91cCBmb290ZXIgYWNyb3NzIGFsbCBncm91cHMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKlxuICAgICAqIEBkZXByZWNhdGVkIHYzMS4zIC0gdXNlIGBncmFuZFRvdGFsUm93YCBpbnN0ZWFkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBwcm92aWRlZCwgYW4gZXh0cmEgcm93IGdyb3VwIHRvdGFsIHJvdyB3aWxsIGJlIGluc2VydGVkIGludG8gcm93IGdyb3VwcyBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uLCB0byBkaXNwbGF5XG4gICAgICogd2hlbiB0aGUgZ3JvdXAgaXMgZXhwYW5kZWQuIFRoaXMgcm93IHdpbGwgY29udGFpbiB0aGUgYWdncmVnYXRlIHZhbHVlcyBmb3IgdGhlIGdyb3VwLiBJZiBhIGNhbGxiYWNrIGZ1bmN0aW9uIGlzXG4gICAgICogcHJvdmlkZWQsIGl0IGNhbiBiZSB1c2VkIHRvIHNlbGVjdGl2ZWx5IGRldGVybWluZSB3aGljaCBncm91cHMgd2lsbCBoYXZlIGEgdG90YWwgcm93IGFkZGVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFRvdGFsUm93OiAndG9wJyB8ICdib3R0b20nIHwgVXNlR3JvdXBUb3RhbFJvdzxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gcHJvdmlkZWQsIGFuIGV4dHJhIGdyYW5kIHRvdGFsIHJvdyB3aWxsIGJlIGluc2VydGVkIGludG8gdGhlIGdyaWQgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbi5cbiAgICAgKiBUaGlzIHJvdyBkaXNwbGF5cyB0aGUgYWdncmVnYXRlIHRvdGFscyBvZiBhbGwgcm93cyBpbiB0aGUgZ3JpZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JhbmRUb3RhbFJvdzogJ3RvcCcgfCAnYm90dG9tJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3MgdGhlIHN0aWNreSBiZWhhdmlvdXIgb2YgdGhlIHRvdGFsIHJvd3MsIGNhbiBiZSBzdXBwcmVzc2VkIGluZGl2aWR1YWxseSBieSBwYXNzaW5nIGAnZ3JhbmQnYCBvciBgJ2dyb3VwJ2AuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU3RpY2t5VG90YWxSb3c6IGJvb2xlYW4gfCAnZ3JhbmQnIHwgJ2dyb3VwJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBhbmQgc2hvd2luZyBmb290ZXIsIGFnZ3JlZ2F0ZSBkYXRhIHdpbGwgYWx3YXlzIGJlIGRpc3BsYXllZCBhdCBib3RoIHRoZSBoZWFkZXIgYW5kIGZvb3RlciBsZXZlbHMuIFRoaXMgc3RvcHMgdGhlIHBvc3NpYmx5IHVuZGVzaXJhYmxlIGJlaGF2aW91ciBvZiB0aGUgaGVhZGVyIGRldGFpbHMgJ2p1bXBpbmcnIHRvIHRoZSBmb290ZXIgb24gZXhwYW5kLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU3VwcHJlc3NCbGFua0hlYWRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgdXNpbmcgYGdyb3VwU2VsZWN0c0NoaWxkcmVuYCwgdGhlbiBvbmx5IHRoZSBjaGlsZHJlbiB0aGF0IHBhc3MgdGhlIGN1cnJlbnQgZmlsdGVyIHdpbGwgZ2V0IHNlbGVjdGVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwU2VsZWN0c0ZpbHRlcmVkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG93cyB0aGUgb3BlbiBncm91cCBpbiB0aGUgZ3JvdXAgY29sdW1uIGZvciBub24tZ3JvdXAgcm93cy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzaG93T3BlbmVkR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29sbGFwc2UgZ3JvdXBzIHRoYXQgb25seSBoYXZlIG9uZSBjaGlsZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbGxhcHNlIGxvd2VzdCBsZXZlbCBncm91cHMgdGhhdCBvbmx5IGhhdmUgb25lIGNoaWxkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlTG93ZXN0U2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGlkZSBwYXJlbnRzIHRoYXQgYXJlIG9wZW4uIFdoZW4gdXNlZCB3aXRoIG11bHRpcGxlIGNvbHVtbnMgZm9yIHNob3dpbmcgZ3JvdXBzLCBpdCBjYW4gZ2l2ZSBhIG1vcmUgcGxlYXNpbmcgdXNlciBleHBlcmllbmNlLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSGlkZU9wZW5QYXJlbnRzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHByZXZlbnQgdGhlIGdyaWQgZnJvbSBjcmVhdGluZyBhICcoQmxhbmtzKScgZ3JvdXAgZm9yIG5vZGVzIHdoaWNoIGRvIG5vdCBiZWxvbmcgdG8gYSBncm91cCwgYW5kIGRpc3BsYXkgdGhlIHVuYmFsYW5jZWQgbm9kZXMgYWxvbmdzaWRlIGdyb3VwIG5vZGVzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwQWxsb3dVbmJhbGFuY2VkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdyb3cgZ3JvdXAgcGFuZWwnICh3aGVyZSB5b3UgZHJhZyByb3dzIHRvIGdyb3VwKSBhdCB0aGUgdG9wLlxuICAgICAqIEBkZWZhdWx0ICduZXZlcidcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93R3JvdXBQYW5lbFNob3c6ICdhbHdheXMnIHwgJ29ubHlXaGVuR3JvdXBpbmcnIHwgJ25ldmVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB0aGUgQ2VsbCBSZW5kZXJlciB0byB1c2Ugd2hlbiBgZ3JvdXBEaXNwbGF5VHlwZSA9ICdncm91cFJvd3MnYC5cbiAgICAgKiBTZWUgW0dyb3VwIFJvdyBDZWxsIFJlbmRlcmVyXShodHRwczovL3d3dy5hZy1ncmlkLmNvbS9qYXZhc2NyaXB0LWRhdGEtZ3JpZC9ncm91cGluZy1ncm91cC1yb3dzLyNwcm92aWRpbmctY2VsbC1yZW5kZXJlcikgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgYGdyb3VwUm93UmVuZGVyZXJgIGNvbXBvbmVudC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSb3dSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0LCB3aGVuIGEgY29sdW1uIGlzIHVuLWdyb3VwZWQsIGkuZS4gdXNpbmcgdGhlIFJvdyBHcm91cCBQYW5lbCwgaXQgaXMgbWFkZSB2aXNpYmxlIGluIHRoZSBncmlkLiBUaGlzIHByb3BlcnR5IHN0b3BzIHRoZSBjb2x1bW4gYmVjb21pbmcgdmlzaWJsZSBhZ2FpbiB3aGVuIHVuLWdyb3VwaW5nLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBHcmlkIHRvIHdvcmsgd2l0aCBUcmVlIERhdGEuIFlvdSBtdXN0IGFsc28gaW1wbGVtZW50IHRoZSBgZ2V0RGF0YVBhdGgoZGF0YSlgIGNhbGxiYWNrLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIHNvcnQgaW5kaWNhdG9ycyBhbmQgYWN0aW9ucyBmcm9tIHRoZSByb3cgZ3JvdXAgcGFuZWwuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU3VwcHJlc3NTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHByZXZlbnQgR3JvdXAgUm93cyBmcm9tIHN0aWNraW5nIHRvIHRoZSB0b3Agb2YgdGhlIGdyaWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0dyb3VwUm93c1N0aWNreTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIHRvcCByb3dzIGluIHRoZSBncmlkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRUb3BSb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcGlubmVkIGJvdHRvbSByb3dzIGluIHRoZSBncmlkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwaW5uZWRCb3R0b21Sb3dEYXRhOiBhbnlbXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0cyB0aGUgcm93IG1vZGVsIHR5cGUuXG4gICAgICogQGRlZmF1bHQgJ2NsaWVudFNpZGUnXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TW9kZWxUeXBlOiBSb3dNb2RlbFR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGUgZGF0YSB0byBiZSBkaXNwbGF5ZWQgYXMgcm93cyBpbiB0aGUgZ3JpZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RGF0YTogVERhdGFbXSB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBleGVjdXRpbmcgYSBiYXRjaCBvZiBhc3luYyB0cmFuc2FjdGlvbnMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25XYWl0TWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIFRyYW5zYWN0aW9ucyBjaGFuZ2luZyBzb3J0LCBmaWx0ZXIsIGdyb3VwIG9yIHBpdm90IHN0YXRlIHdoZW4gdHJhbnNhY3Rpb24gb25seSBjb250YWlucyB1cGRhdGVzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW9kZWxVcGRhdGVBZnRlclVwZGF0ZVRyYW5zYWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBkYXRhc291cmNlIGZvciBpbmZpbml0ZSBzY3JvbGxpbmcuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRhdGFzb3VyY2U6IElEYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBleHRyYSBibGFuayByb3dzIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXIgYXQgdGhlIGVuZCBvZiB0aGUgZGF0YXNldCwgd2hpY2ggc2V0cyB0aGUgdmVydGljYWwgc2Nyb2xsIGFuZCB0aGVuIGFsbG93cyB0aGUgZ3JpZCB0byByZXF1ZXN0IHZpZXdpbmcgbW9yZSByb3dzIG9mIGRhdGEuXG4gICAgICogQGRlZmF1bHQgMVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlT3ZlcmZsb3dTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGV4dHJhIGJsYW5rIHJvd3MgdG8gZGlzcGxheSB0byB0aGUgdXNlciBhdCB0aGUgZW5kIG9mIHRoZSBkYXRhc2V0LCB3aGljaCBzZXRzIHRoZSB2ZXJ0aWNhbCBzY3JvbGwgYW5kIHRoZW4gYWxsb3dzIHRoZSBncmlkIHRvIHJlcXVlc3Qgdmlld2luZyBtb3JlIHJvd3Mgb2YgZGF0YS5cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5maW5pdGVJbml0aWFsUm93Q291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IGhvdyBtYW55IGxvYWRpbmcgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGZvciB0aGUgcm9vdCBsZXZlbCBncm91cC5cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUluaXRpYWxSb3dDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIFNlcnZlci1zaWRlIFJvdyBNb2RlbCB3aWxsIHN1cHByZXNzIEluZmluaXRlIFNjcm9sbGluZyBhbmQgbG9hZCBhbGwgdGhlIGRhdGEgYXQgdGhlIGN1cnJlbnQgbGV2ZWwuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqIEBkZXByZWNhdGVkIHYzMS4xXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIFNlcnZlci1zaWRlIFJvdyBNb2RlbCB3aWxsIG5vdCB1c2UgYSBmdWxsIHdpZHRoIGxvYWRpbmcgcmVuZGVyZXIsIGluc3RlYWQgdXNpbmcgdGhlIGNvbERlZiBgbG9hZGluZ0NlbGxSZW5kZXJlcmAgaWYgcHJlc2VudC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTZXJ2ZXJTaWRlRnVsbFdpZHRoTG9hZGluZ1JvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcm93cyBmb3IgZWFjaCBibG9jayBpbiB0aGUgc3RvcmUsIGkuZS4gaG93IG1hbnkgcm93cyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgYXQgYSB0aW1lLlxuICAgICAqIEBkZWZhdWx0IDEwMFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjYWNoZUJsb2NrU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBibG9ja3MgdG8ga2VlcCBpbiB0aGUgc3RvcmUuIERlZmF1bHQgaXMgbm8gbGltaXQsIHNvIGV2ZXJ5IHJlcXVlc3RlZCBibG9jayBpcyBrZXB0LiBVc2UgdGhpcyBpZiB5b3UgaGF2ZSBtZW1vcnkgY29uY2VybnMsIGFuZCBibG9ja3MgdGhhdCB3ZXJlIGxlYXN0IHJlY2VudGx5IHZpZXdlZCB3aWxsIGJlIHB1cmdlZCB3aGVuIHRoZSBsaW1pdCBpcyBoaXQuIFRoZSBncmlkIHdpbGwgYWRkaXRpb25hbGx5IG1ha2Ugc3VyZSBpdCBoYXMgYWxsIHRoZSBibG9ja3MgbmVlZGVkIHRvIGRpc3BsYXkgd2hhdCBpcyBjdXJyZW50bHkgdmlzaWJsZSwgaW4gY2FzZSB0aGlzIHByb3BlcnR5IGlzIHNldCB0byBhIGxvdyB2YWx1ZS5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtYXhCbG9ja3NJbkNhY2hlOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IHJlcXVlc3RzIHRvIGhpdCB0aGUgc2VydmVyIHdpdGggY29uY3VycmVudGx5LiBJZiB0aGUgbWF4IGlzIHJlYWNoZWQsIHJlcXVlc3RzIGFyZSBxdWV1ZWQuXG4gICAgICogU2V0IHRvIGAtMWAgZm9yIG5vIG1heGltdW0gcmVzdHJpY3Rpb24gb24gcmVxdWVzdHMuXG4gICAgICogQGRlZmF1bHQgMlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heENvbmN1cnJlbnREYXRhc291cmNlUmVxdWVzdHM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGxvYWRpbmcgYSBibG9jay4gVXNlZnVsIHdoZW4gc2Nyb2xsaW5nIG92ZXIgbWFueSBibG9ja3MsIGFzIGl0IHByZXZlbnRzIGJsb2NrcyBsb2FkaW5nIHVudGlsIHNjcm9sbGluZyBoYXMgc2V0dGxlZC5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBibG9ja0xvYWREZWJvdW5jZU1pbGxpczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGNsb3NpbmcgZ3JvdXAgcm93cyB3aWxsIHJlbW92ZSBjaGlsZHJlbiBvZiB0aGF0IHJvdy4gTmV4dCB0aW1lIHRoZSByb3cgaXMgb3BlbmVkLCBjaGlsZCByb3dzIHdpbGwgYmUgcmVhZCBmcm9tIHRoZSBkYXRhc291cmNlIGFnYWluLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZyBvciBUcmVlIERhdGEuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHVyZ2VDbG9zZWRSb3dOb2RlczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB0aGUgYHNlcnZlclNpZGVEYXRhc291cmNlYCBmb3Igc2VydmVyIHNpZGUgcm93IG1vZGVsLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRGF0YXNvdXJjZTogSVNlcnZlclNpZGVEYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGFsd2F5cyByZWZyZXNoZXMgdG9wIGxldmVsIGdyb3VwcyByZWdhcmRsZXNzIG9mIHdoaWNoIGNvbHVtbiB3YXMgc29ydGVkLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZyAmIHNvcnRpbmcgaXMgaGFuZGxlZCBvbiB0aGUgc2VydmVyLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVTb3J0QWxsTGV2ZWxzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHNvcnRzIGZ1bGx5IGxvYWRlZCBncm91cHMgaW4gdGhlIGJyb3dzZXIgaW5zdGVhZCBvZiByZXF1ZXN0aW5nIGZyb20gdGhlIHNlcnZlci5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlRW5hYmxlQ2xpZW50U2lkZVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgb25seSByZWZyZXNoIGdyb3VwcyBkaXJlY3RseSBpbXBhY3RlZCBieSBhIGZpbHRlci4gVGhpcyBwcm9wZXJ0eSBvbmx5IGFwcGxpZXMgd2hlbiB0aGVyZSBpcyBSb3cgR3JvdXBpbmcgJiBmaWx0ZXJpbmcgaXMgaGFuZGxlZCBvbiB0aGUgc2VydmVyLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZU9ubHlSZWZyZXNoRmlsdGVyZWRHcm91cHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgU29ydGluZyB3aWxsIGJlIGRvbmUgb24gdGhlIHNlcnZlci4gT25seSBhcHBsaWNhYmxlIHdoZW4gYHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsPXRydWVgLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGRlcHJlY2F0ZWQgdjMxLjFcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRPblNlcnZlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBGaWx0ZXJpbmcgd2lsbCBiZSBkb25lIG9uIHRoZSBzZXJ2ZXIuIE9ubHkgYXBwbGljYWJsZSB3aGVuIGBzdXBwcmVzc1NlcnZlclNpZGVJbmZpbml0ZVNjcm9sbD10cnVlYC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBkZXByZWNhdGVkIHYzMS4xXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVGaWx0ZXJPblNlcnZlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVXNlZCB0byBzcGxpdCBwaXZvdCBmaWVsZCBzdHJpbmdzIGZvciBnZW5lcmF0aW5nIHBpdm90IHJlc3VsdCBjb2x1bW5zIHdoZW4gYHBpdm90UmVzdWx0RmllbGRzYCBpcyBwcm92aWRlZCBhcyBwYXJ0IG9mIGEgYGdldFJvd3NgIHN1Y2Nlc3MuXG4gICAgICogQGRlZmF1bHQgJ18nXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVBpdm90UmVzdWx0RmllbGRTZXBhcmF0b3I6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVG8gdXNlIHRoZSB2aWV3cG9ydCByb3cgbW9kZWwgeW91IG5lZWQgdG8gcHJvdmlkZSB0aGUgZ3JpZCB3aXRoIGEgYHZpZXdwb3J0RGF0YXNvdXJjZWAuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0RGF0YXNvdXJjZTogSVZpZXdwb3J0RGF0YXNvdXJjZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiB1c2luZyB2aWV3cG9ydCByb3cgbW9kZWwsIHNldHMgdGhlIHBhZ2Ugc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxQYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIHZpZXdwb3J0IHJvdyBtb2RlbCwgc2V0cyB0aGUgYnVmZmVyIHNpemUgZm9yIHRoZSB2aWV3cG9ydC5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2aWV3cG9ydFJvd01vZGVsQnVmZmVyU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSBob3Jpem9udGFsIHNjcm9sbGJhci5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgc2hvdyB0aGUgdmVydGljYWwgc2Nyb2xsYmFyLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBkZWJvdW5jZSB0aGUgdmVydGljYWwgc2Nyb2xsYmFyLiBDYW4gcHJvdmlkZSBzbW9vdGhlciBzY3JvbGxpbmcgb24gc2xvdyBtYWNoaW5lcy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlYm91bmNlVmVydGljYWxTY3JvbGxiYXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbmV2ZXIgc2hvdyB0aGUgaG9yaXpvbnRhbCBzY3JvbGwuIFRoaXMgaXMgdXNlZnVsIGlmIHRoZSBncmlkIGlzIGFsaWduZWQgd2l0aCBhbm90aGVyIGdyaWQgYW5kIHdpbGwgc2Nyb2xsIHdoZW4gdGhlIG90aGVyIGdyaWQgc2Nyb2xscy4gKFNob3VsZCBub3QgYmUgdXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIGBhbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbGAuKVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzSG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IHNjcm9sbCB0byB0aGUgdG9wIHdoZW4gbmV3IHJvdyBkYXRhIGlzIHByb3ZpZGVkLiBVc2UgdGhpcyBpZiB5b3UgZG9uJ3Qgd2FudCB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgb2Ygc2Nyb2xsaW5nIHRvIHRoZSB0b3AgZXZlcnkgdGltZSB5b3UgbG9hZCBuZXcgZGF0YS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbE9uTmV3RGF0YTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIHRoZSBncmlkIHdpbGwgbm90IGFsbG93IG1vdXNld2hlZWwgLyB0b3VjaHBhZCBzY3JvbGwgd2hlbiBwb3B1cCBlbGVtZW50cyBhcmUgcHJlc2VudC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Njcm9sbFdoZW5Qb3B1cHNBcmVPcGVuOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgdXNlIGFuaW1hdGlvbiBmcmFtZXMgd2hlbiBkcmF3aW5nIHJvd3Mgd2hpbGUgc2Nyb2xsaW5nLiBVc2UgdGhpcyBpZiB0aGUgZ3JpZCBpcyB3b3JraW5nIGZhc3QgZW5vdWdoIHRoYXQgeW91IGRvbid0IG5lZWQgYW5pbWF0aW9uIGZyYW1lcyBhbmQgeW91IGRvbid0IHdhbnQgdGhlIGdyaWQgdG8gZmxpY2tlci5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgbWlkZGxlIGNsaWNrcyB3aWxsIHJlc3VsdCBpbiBgY2xpY2tgIGV2ZW50cyBmb3IgY2VsbHMgYW5kIHJvd3MuIE90aGVyd2lzZSB0aGUgYnJvd3NlciB3aWxsIHVzZSBtaWRkbGUgY2xpY2sgdG8gc2Nyb2xsIHRoZSBncmlkLjxiciAvPioqTm90ZToqKiBOb3QgYWxsIGJyb3dzZXJzIGZpcmUgYGNsaWNrYCBldmVudHMgd2l0aCB0aGUgbWlkZGxlIGJ1dHRvbi4gTW9zdCB3aWxsIGZpcmUgb25seSBgbW91c2Vkb3duYCBhbmQgYG1vdXNldXBgIGV2ZW50cywgd2hpY2ggY2FuIGJlIHVzZWQgdG8gZm9jdXMgYSBjZWxsLCBidXQgd2lsbCBub3Qgd29yayB0byBjYWxsIHRoZSBgb25DZWxsQ2xpY2tlZGAgZnVuY3Rpb24uXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNaWRkbGVDbGlja1Njcm9sbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgbW91c2Ugd2hlZWwgZXZlbnRzIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBicm93c2VyLiBVc2VmdWwgaWYgeW91ciBncmlkIGhhcyBubyB2ZXJ0aWNhbCBzY3JvbGxzIGFuZCB5b3Ugd2FudCB0aGUgbW91c2UgdG8gc2Nyb2xsIHRoZSBicm93c2VyIHBhZ2UuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUZWxsIHRoZSBncmlkIGhvdyB3aWRlIGluIHBpeGVscyB0aGUgc2Nyb2xsYmFyIGlzLCB3aGljaCBpcyB1c2VkIGluIGdyaWQgd2lkdGggY2FsY3VsYXRpb25zLiBTZXQgb25seSBpZiB1c2luZyBub24tc3RhbmRhcmQgYnJvd3Nlci1wcm92aWRlZCBzY3JvbGxiYXJzLCBzbyB0aGUgZ3JpZCBjYW4gdXNlIHRoZSBub24tc3RhbmRhcmQgc2l6ZSBpbiBpdHMgY2FsY3VsYXRpb25zLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNjcm9sbGJhcldpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFR5cGUgb2YgUm93IFNlbGVjdGlvbjogYHNpbmdsZWAsIGBtdWx0aXBsZWAuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd1NlbGVjdGlvbjogJ3NpbmdsZScgfCAnbXVsdGlwbGUnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IG11bHRpcGxlIHJvd3MgdG8gYmUgc2VsZWN0ZWQgdXNpbmcgc2luZ2xlIGNsaWNrLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHJvd3Mgd2lsbCBub3QgYmUgZGVzZWxlY3RlZCBpZiB5b3UgaG9sZCBkb3duIGBDdHJsYCBhbmQgY2xpY2sgdGhlIHJvdyBvciBwcmVzcyBgU3BhY2VgLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93RGVzZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgcm93IHNlbGVjdGlvbiB3b24ndCBoYXBwZW4gd2hlbiByb3dzIGFyZSBjbGlja2VkLiBVc2Ugd2hlbiB5b3Ugb25seSB3YW50IGNoZWNrYm94IHNlbGVjdGlvbi5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIGNlbGxzIHdvbid0IGJlIGZvY3VzYWJsZS4gVGhpcyBtZWFucyBrZXlib2FyZCBuYXZpZ2F0aW9uIHdpbGwgYmUgZGlzYWJsZWQgZm9yIGdyaWQgY2VsbHMsIGJ1dCByZW1haW4gZW5hYmxlZCBpbiBvdGhlciBlbGVtZW50cyBvZiB0aGUgZ3JpZCBzdWNoIGFzIGNvbHVtbiBoZWFkZXJzLCBmbG9hdGluZyBmaWx0ZXJzLCB0b29sIHBhbmVscy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NlbGxGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBoZWFkZXIgY2VsbHMgd29uJ3QgYmUgZm9jdXNhYmxlLiBUaGlzIG1lYW5zIGtleWJvYXJkIG5hdmlnYXRpb24gd2lsbCBiZSBkaXNhYmxlZCBmb3IgZ3JpZCBoZWFkZXIgY2VsbHMsIGJ1dCByZW1haW4gZW5hYmxlZCBpbiBvdGhlciBlbGVtZW50cyBvZiB0aGUgZ3JpZCBzdWNoIGFzIGdyaWQgY2VsbHMgYW5kIHRvb2wgcGFuZWxzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzSGVhZGVyRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgb25seSBhIHNpbmdsZSByYW5nZSBjYW4gYmUgc2VsZWN0ZWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGJlIGFibGUgdG8gc2VsZWN0IHRoZSB0ZXh0IHdpdGhpbiBjZWxscy5cbiAgICAgKlxuICAgICAqICAgICAqKk5vdGU6KiogV2hlbiB0aGlzIGlzIHNldCB0byBgdHJ1ZWAsIHRoZSBjbGlwYm9hcmQgc2VydmljZSBpcyBkaXNhYmxlZCBhbmQgb25seSBzZWxlY3RlZCB0ZXh0IGlzIGNvcGllZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgUmFuZ2UgU2VsZWN0aW9uLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgUmFuZ2UgSGFuZGxlLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJhbmdlSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSB0aGUgRmlsbCBIYW5kbGUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlRmlsbEhhbmRsZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAneCdgIHRvIGZvcmNlIHRoZSBmaWxsIGhhbmRsZSBkaXJlY3Rpb24gdG8gaG9yaXpvbnRhbCwgb3Igc2V0IHRvIGAneSdgIHRvIGZvcmNlIHRoZSBmaWxsIGhhbmRsZSBkaXJlY3Rpb24gdG8gdmVydGljYWwuXG4gICAgICogQGRlZmF1bHQgJ3h5J1xuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsSGFuZGxlRGlyZWN0aW9uOiAneCcgfCAneScgfCAneHknIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gcHJldmVudCBjZWxsIHZhbHVlcyBmcm9tIGJlaW5nIGNsZWFyZWQgd2hlbiB0aGUgUmFuZ2UgU2VsZWN0aW9uIGlzIHJlZHVjZWQgYnkgdGhlIEZpbGwgSGFuZGxlLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2xlYXJPbkZpbGxSZWR1Y3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFycmF5IGRlZmluaW5nIHRoZSBvcmRlciBpbiB3aGljaCBzb3J0aW5nIG9jY3VycyAoaWYgc29ydGluZyBpcyBlbmFibGVkKS4gVmFsdWVzIGNhbiBiZSBgJ2FzYydgLCBgJ2Rlc2MnYCBvciBgbnVsbGAuIEZvciBleGFtcGxlOiBgc29ydGluZ09yZGVyOiBbJ2FzYycsICdkZXNjJ11gLlxuICAgICAqIEBkZWZhdWx0IFtudWxsLCAnYXNjJywgJ2Rlc2MnXVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzb3J0aW5nT3JkZXI6IFNvcnREaXJlY3Rpb25bXSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzcGVjaWZ5IHRoYXQgdGhlIHNvcnQgc2hvdWxkIHRha2UgYWNjZW50ZWQgY2hhcmFjdGVycyBpbnRvIGFjY291bnQuIElmIHRoaXMgZmVhdHVyZSBpcyB0dXJuZWQgb24gdGhlIHNvcnQgd2lsbCBiZSBzbG93ZXIuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWNjZW50ZWRTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlICdubyBzb3J0JyBpY29uLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuU29ydEljb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3MgbXVsdGktc29ydCB3aGVuIHRoZSB1c2VyIHNoaWZ0LWNsaWNrcyBhIGNvbHVtbiBoZWFkZXIuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNdWx0aVNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIG11bHRpLXNvcnQgd2hlbiB0aGUgdXNlciBjbGlja3MgYSBjb2x1bW4gaGVhZGVyLCByZWdhcmRsZXNzIG9mIGtleSBwcmVzc2VzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGAnY3RybCdgIHRvIGhhdmUgbXVsdGkgc29ydGluZyB3b3JrIHVzaW5nIHRoZSBgQ3RybGAgKG9yIGBDb21tYW5kIOKMmGAgZm9yIE1hYykga2V5LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtdWx0aVNvcnRLZXk6ICdjdHJsJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBzb3J0aW5nIG9mIHVuLXNvcnRlZCBkYXRhIHRvIG1hdGNoIG9yaWdpbmFsIHJvdyBkYXRhLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWFpbnRhaW5VbnNvcnRlZE9yZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJY29ucyB0byB1c2UgaW5zaWRlIHRoZSBncmlkIGluc3RlYWQgb2YgdGhlIGdyaWQncyBkZWZhdWx0IGljb25zLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGljb25zOiB7IFtrZXk6IHN0cmluZ106ICgoLi4uYXJnczogYW55W10pID0+IGFueSkgfCBzdHJpbmcgfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGVmYXVsdCByb3cgaGVpZ2h0IGluIHBpeGVscy5cbiAgICAgKiBAZGVmYXVsdCAyNVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIHN0eWxlIHByb3BlcnRpZXMgdG8gYXBwbHkgdG8gYWxsIHJvd3MuIFNldCB0byBhbiBvYmplY3Qgb2Yga2V5IChzdHlsZSBuYW1lcykgYW5kIHZhbHVlcyAoc3R5bGUgdmFsdWVzKS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U3R5bGU6IFJvd1N0eWxlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDU1MgY2xhc3MoZXMpIGZvciBhbGwgcm93cy4gUHJvdmlkZSBlaXRoZXIgYSBzdHJpbmcgKGNsYXNzIG5hbWUpIG9yIGFycmF5IG9mIHN0cmluZ3MgKGFycmF5IG9mIGNsYXNzIG5hbWVzKS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93Q2xhc3M6IHN0cmluZyB8IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSdWxlcyB3aGljaCBjYW4gYmUgYXBwbGllZCB0byBpbmNsdWRlIGNlcnRhaW4gQ1NTIGNsYXNzZXMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0NsYXNzUnVsZXM6IFJvd0NsYXNzUnVsZXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBoaWdobGlnaHQgcm93cyBieSBhZGRpbmcgdGhlIGBhZy1yb3ctaG92ZXJgIENTUyBjbGFzcy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd0hvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBVc2VzIENTUyBgdG9wYCBpbnN0ZWFkIG9mIENTUyBgdHJhbnNmb3JtYCBmb3IgcG9zaXRpb25pbmcgcm93cy4gVXNlZnVsIGlmIHRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gaXMgY2F1c2luZyBpc3N1ZXMgc3VjaCBhcyB1c2VkIGluIHJvdyBzcGFubmluZy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93VHJhbnNmb3JtOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhpZ2hsaWdodCBjb2x1bW5zIGJ5IGFkZGluZyB0aGUgYGFnLWNvbHVtbi1ob3ZlcmAgQ1NTIGNsYXNzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkhvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGBncmlkSWRgIGZvciB0aGlzIGluc3RhbmNlIG9mIHRoZSBncmlkLiBWYWx1ZSB3aWxsIGJlIHNldCBvbiB0aGUgcm9vdCBET00gbm9kZSB1c2luZyB0aGUgYXR0cmlidXRlIGBncmlkLWlkYCBhcyB3ZWxsIGFzIGJlaW5nIGFjY2Vzc2libGUgdmlhIHRoZSBgZ3JpZEFwaS5nZXRHcmlkSWQoKWAgbWV0aG9kLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyaWRJZDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHNvcnRzIG9ubHkgdGhlIHJvd3MgYWRkZWQvdXBkYXRlZCBieSBhIHRyYW5zYWN0aW9uLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlbHRhU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiovXG4gICAgQElucHV0KCkgcHVibGljIHRyZWVEYXRhRGlzcGxheVR5cGU6IFRyZWVEYXRhRGlzcGxheVR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUdyb3VwRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSW5pdGlhbCBzdGF0ZSBmb3IgdGhlIGdyaWQuIE9ubHkgcmVhZCBvbmNlIG9uIGluaXRpYWxpemF0aW9uLiBDYW4gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGBhcGkuZ2V0U3RhdGUoKWAgdG8gc2F2ZSBhbmQgcmVzdG9yZSBncmlkIHN0YXRlLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluaXRpYWxTdGF0ZTogR3JpZFN0YXRlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3IgY3VzdG9taXNpbmcgdGhlIGNvbnRleHQgbWVudS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q29udGV4dE1lbnVJdGVtczogR2V0Q29udGV4dE1lbnVJdGVtczxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgbWFpbiAnY29sdW1uIGhlYWRlcicgbWVudS5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRNYWluTWVudUl0ZW1zOiBHZXRNYWluTWVudUl0ZW1zPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHVzZXIgdG8gcHJvY2VzcyBwb3B1cHMgYWZ0ZXIgdGhleSBhcmUgY3JlYXRlZC4gQXBwbGljYXRpb25zIGNhbiB1c2UgdGhpcyBpZiB0aGV5IHdhbnQgdG8sIGZvciBleGFtcGxlLCByZXBvc2l0aW9uIHRoZSBwb3B1cC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9zdFByb2Nlc3NQb3B1cDogKChwYXJhbXM6IFBvc3RQcm9jZXNzUG9wdXBQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHRoZSB1c2VyIHRvIHByb2Nlc3MgdGhlIGNvbHVtbnMgYmVpbmcgcmVtb3ZlZCBmcm9tIHRoZSBwaW5uZWQgc2VjdGlvbiBiZWNhdXNlIHRoZSB2aWV3cG9ydCBpcyB0b28gc21hbGwgdG8gYWNjb21tb2RhdGUgdGhlbS5cbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGNvbHVtbnMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBwaW5uZWQgYXJlYXMuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1VucGlubmVkQ29sdW1uczogKChwYXJhbXM6IFByb2Nlc3NVbnBpbm5lZENvbHVtbnNQYXJhbXM8VERhdGE+KSA9PiBDb2x1bW5bXSkgfCB1bmRlZmluZWQgPVxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBjZWxscyBmb3IgdGhlIGNsaXBib2FyZC4gSGFuZHkgaWYgZm9yIGV4YW1wbGUgeW91IGhhdmUgYERhdGVgIG9iamVjdHMgdGhhdCBuZWVkIHRvIGhhdmUgYSBwYXJ0aWN1bGFyIGZvcm1hdCBpZiBpbXBvcnRpbmcgaW50byBFeGNlbC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0NlbGxGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPVxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBoZWFkZXIgdmFsdWVzIGZvciB0aGUgY2xpcGJvYXJkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzSGVhZGVyRm9yQ2xpcGJvYXJkOiAoKHBhcmFtczogUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPVxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBncm91cCBoZWFkZXIgdmFsdWVzIGZvciB0aGUgY2xpcGJvYXJkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzR3JvdXBIZWFkZXJGb3JDbGlwYm9hcmQ6XG4gICAgICAgIHwgKChwYXJhbXM6IFByb2Nlc3NHcm91cEhlYWRlckZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSlcbiAgICAgICAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gcHJvY2VzcyBjZWxscyBmcm9tIHRoZSBjbGlwYm9hcmQuIEhhbmR5IGlmIGZvciBleGFtcGxlIHlvdSBoYXZlIG51bWJlciBmaWVsZHMsIGFuZCB3YW50IHRvIGJsb2NrIG5vbi1udW1iZXJzIGZyb20gZ2V0dGluZyBpbnRvIHRoZSBncmlkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZyb21DbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzQ2VsbEZvckV4cG9ydFBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPVxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB5b3UgdG8gZ2V0IHRoZSBkYXRhIHRoYXQgd291bGQgb3RoZXJ3aXNlIGdvIHRvIHRoZSBjbGlwYm9hcmQuIFRvIGJlIHVzZWQgd2hlbiB5b3Ugd2FudCB0byBjb250cm9sIHRoZSAnY29weSB0byBjbGlwYm9hcmQnIG9wZXJhdGlvbiB5b3Vyc2VsZi5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VuZFRvQ2xpcGJvYXJkOiAoKHBhcmFtczogU2VuZFRvQ2xpcGJvYXJkUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjb21wbGV0ZSBjb250cm9sIG9mIHRoZSBwYXN0ZSBvcGVyYXRpb24sIGluY2x1ZGluZyBjYW5jZWxsaW5nIHRoZSBvcGVyYXRpb24gKHNvIG5vdGhpbmcgaGFwcGVucykgb3IgcmVwbGFjaW5nIHRoZSBkYXRhIHdpdGggb3RoZXIgZGF0YS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc0RhdGFGcm9tQ2xpcGJvYXJkOlxuICAgICAgICB8ICgocGFyYW1zOiBQcm9jZXNzRGF0YUZyb21DbGlwYm9hcmRQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmdbXVtdIHwgbnVsbClcbiAgICAgICAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEdyaWQgY2FsbHMgdGhpcyBtZXRob2QgdG8ga25vdyBpZiBhbiBleHRlcm5hbCBmaWx0ZXIgaXMgcHJlc2VudC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNFeHRlcm5hbEZpbHRlclByZXNlbnQ6ICgocGFyYW1zOiBJc0V4dGVybmFsRmlsdGVyUHJlc2VudFBhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID1cbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIC8qKiBTaG91bGQgcmV0dXJuIGB0cnVlYCBpZiBleHRlcm5hbCBmaWx0ZXIgcGFzc2VzLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZG9lc0V4dGVybmFsRmlsdGVyUGFzczogKChub2RlOiBJUm93Tm9kZTxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHRvIGN1c3RvbWlzZSB0aGUgY2hhcnQgdG9vbGJhciBpdGVtcy5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDaGFydFRvb2xiYXJJdGVtczogR2V0Q2hhcnRUb29sYmFySXRlbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGVuYWJsZSBkaXNwbGF5aW5nIHRoZSBjaGFydCBpbiBhbiBhbHRlcm5hdGl2ZSBjaGFydCBjb250YWluZXIuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3JlYXRlQ2hhcnRDb250YWluZXI6ICgocGFyYW1zOiBDaGFydFJlZlBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZWxlbWVudCB0aGF0IHdpbGwgYmUgZm9jdXNlZCB3aGVuIHRoZSBncmlkIHJlY2VpdmVzIGZvY3VzIGZyb20gb3V0c2lkZSBlbGVtZW50cyAodGFiYmluZyBpbnRvIHRoZSBncmlkKS5cbiAgICAgKiBAcmV0dXJucyBgVHJ1ZWAgaWYgdGhpcyBmdW5jdGlvbiBzaG91bGQgb3ZlcnJpZGUgdGhlIGdyaWQncyBkZWZhdWx0IGJlaGF2aW9yLCBgRmFsc2VgIHRvIGFsbG93IHRoZSBncmlkJ3MgZGVmYXVsdCBiZWhhdmlvci5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZm9jdXNHcmlkSW5uZXJFbGVtZW50OiAoKHBhcmFtczogRm9jdXNHcmlkSW5uZXJFbGVtZW50UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPVxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgbmF2aWdhdGlvbiAoYXJyb3cpIGtleSB3aGVuIGEgaGVhZGVyIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBIZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8gb3IgYG51bGxgIHRvIHN0YXkgb24gY3VycmVudCBoZWFkZXIuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0SGVhZGVyOlxuICAgICAgICB8ICgocGFyYW1zOiBOYXZpZ2F0ZVRvTmV4dEhlYWRlclBhcmFtczxURGF0YT4pID0+IEhlYWRlclBvc2l0aW9uIHwgbnVsbClcbiAgICAgICAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgYFRhYmAga2V5IHdoZW4gYSBoZWFkZXIgaXMgZm9jdXNlZC5cbiAgICAgKiBSZXR1cm4gdGhlIG5leHQgaGVhZGVyIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvLCBgdHJ1ZWAgdG8gc3RheSBvbiB0aGUgY3VycmVudCBoZWFkZXIsXG4gICAgICogb3IgYGZhbHNlYCB0byBsZXQgdGhlIGJyb3dzZXIgaGFuZGxlIHRoZSB0YWIgYmVoYXZpb3VyLlxuICAgICAqIEFzIG9mIHYzMS4zLCByZXR1cm5pbmcgYG51bGxgIGlzIGRlcHJlY2F0ZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dEhlYWRlcjpcbiAgICAgICAgfCAoKHBhcmFtczogVGFiVG9OZXh0SGVhZGVyUGFyYW1zPFREYXRhPikgPT4gSGVhZGVyUG9zaXRpb24gfCBib29sZWFuIHwgbnVsbClcbiAgICAgICAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgbmF2aWdhdGlvbiAoYXJyb3cpIGtleSB3aGVuIGEgY2VsbCBpcyBmb2N1c2VkLiBSZXR1cm4gdGhlIG5leHQgQ2VsbCBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBgbnVsbGAgdG8gc3RheSBvbiBjdXJyZW50IGNlbGwuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG5hdmlnYXRlVG9OZXh0Q2VsbDogKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0Q2VsbFBhcmFtczxURGF0YT4pID0+IENlbGxQb3NpdGlvbiB8IG51bGwpIHwgdW5kZWZpbmVkID1cbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgZGVmYXVsdCBiZWhhdmlvdXIgZm9yIHdoZW4gdXNlciBoaXRzIGBUYWJgIGtleSB3aGVuIGEgY2VsbCBpcyBmb2N1c2VkLlxuICAgICAqIFJldHVybiB0aGUgbmV4dCBjZWxsIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvLCBgdHJ1ZWAgdG8gc3RheSBvbiB0aGUgY3VycmVudCBjZWxsLFxuICAgICAqIG9yIGBmYWxzZWAgdG8gbGV0IHRoZSBicm93c2VyIGhhbmRsZSB0aGUgdGFiIGJlaGF2aW91ci5cbiAgICAgKiBBcyBvZiB2MzEuMywgcmV0dXJuaW5nIGBudWxsYCBpcyBkZXByZWNhdGVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJUb05leHRDZWxsOiAoKHBhcmFtczogVGFiVG9OZXh0Q2VsbFBhcmFtczxURGF0YT4pID0+IENlbGxQb3NpdGlvbiB8IGJvb2xlYW4gfCBudWxsKSB8IHVuZGVmaW5lZCA9XG4gICAgICAgIHVuZGVmaW5lZDtcbiAgICAvKiogQSBjYWxsYmFjayBmb3IgbG9jYWxpc2luZyB0ZXh0IHdpdGhpbiB0aGUgZ3JpZC5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRMb2NhbGVUZXh0OiAoKHBhcmFtczogR2V0TG9jYWxlVGV4dFBhcmFtczxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHdoYXQgYGRvY3VtZW50YCBpcyB1c2VkLiBDdXJyZW50bHkgdXNlZCBieSBEcmFnIGFuZCBEcm9wIChtYXkgZXh0ZW5kIHRvIG90aGVyIHBsYWNlcyBpbiB0aGUgZnV0dXJlKS4gVXNlIHRoaXMgd2hlbiB5b3Ugd2FudCB0aGUgZ3JpZCB0byB1c2UgYSBkaWZmZXJlbnQgYGRvY3VtZW50YCB0aGFuIHRoZSBvbmUgYXZhaWxhYmxlIG9uIHRoZSBnbG9iYWwgc2NvcGUuIFRoaXMgY2FuIGhhcHBlbiBpZiBkb2NraW5nIG91dCBjb21wb25lbnRzIChzb21ldGhpbmcgd2hpY2ggRWxlY3Ryb24gc3VwcG9ydHMpXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldERvY3VtZW50OiAoKCkgPT4gRG9jdW1lbnQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBmb3JtYXQgdGhlIG51bWJlcnMgaW4gdGhlIHBhZ2luYXRpb24gcGFuZWwsIGkuZS4gJ3JvdyBjb3VudCcgYW5kICdwYWdlIG51bWJlcicgbGFiZWxzLiBUaGlzIGlzIGZvciBwYWdpbmF0aW9uIHBhbmVsIG9ubHksIHRvIGZvcm1hdCBudW1iZXJzIGluc2lkZSB0aGUgZ3JpZCdzIGNlbGxzIChpLmUuIHlvdXIgZGF0YSksIHRoZW4gdXNlIGB2YWx1ZUZvcm1hdHRlcmAgaW4gdGhlIGNvbHVtbiBkZWZpbml0aW9ucy5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyOlxuICAgICAgICB8ICgocGFyYW1zOiBQYWdpbmF0aW9uTnVtYmVyRm9ybWF0dGVyUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKVxuICAgICAgICB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gdXNlIHdoZW4geW91IG5lZWQgYWNjZXNzIHRvIG1vcmUgdGhlbiB0aGUgY3VycmVudCBjb2x1bW4gZm9yIGFnZ3JlZ2F0aW9uLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRHcm91cFJvd0FnZzogKChwYXJhbXM6IEdldEdyb3VwUm93QWdnUGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogKENsaWVudC1zaWRlIFJvdyBNb2RlbCBvbmx5KSBBbGxvd3MgZ3JvdXBzIHRvIGJlIG9wZW4gYnkgZGVmYXVsdC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNHcm91cE9wZW5CeURlZmF1bHQ6ICgocGFyYW1zOiBJc0dyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID1cbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgZGVmYXVsdCBzb3J0aW5nIG9mIGdyb3Vwcy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbEdyb3VwT3JkZXJDb21wYXJhdG9yOlxuICAgICAgICB8ICgocGFyYW1zOiBJbml0aWFsR3JvdXBPcmRlckNvbXBhcmF0b3JQYXJhbXM8VERhdGE+KSA9PiBudW1iZXIpXG4gICAgICAgIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggcGl2b3RpbmcsIHRvIGFsbG93IGNoYW5naW5nIHRoZSBzZWNvbmQgY29sdW1uIGRlZmluaXRpb24uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NQaXZvdFJlc3VsdENvbERlZjogKChjb2xEZWY6IENvbERlZjxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggcGl2b3RpbmcsIHRvIGFsbG93IGNoYW5naW5nIHRoZSBzZWNvbmQgY29sdW1uIGdyb3VwIGRlZmluaXRpb24uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NQaXZvdFJlc3VsdENvbEdyb3VwRGVmOiAoKGNvbEdyb3VwRGVmOiBDb2xHcm91cERlZjxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdoZW4gd29ya2luZyB3aXRoIFRyZWUgRGF0YSB3aGVuIGB0cmVlRGF0YSA9IHRydWVgLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXREYXRhUGF0aDogR2V0RGF0YVBhdGg8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3Mgc2V0dGluZyB0aGUgY2hpbGQgY291bnQgZm9yIGEgZ3JvdXAgcm93LlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENoaWxkQ291bnQ6ICgoZGF0YUl0ZW06IGFueSkgPT4gbnVtYmVyKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHByb3ZpZGluZyBkaWZmZXJlbnQgcGFyYW1zIGZvciBkaWZmZXJlbnQgbGV2ZWxzIG9mIGdyb3VwaW5nLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zOlxuICAgICAgICB8ICgocGFyYW1zOiBHZXRTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtc1BhcmFtcykgPT4gU2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXMpXG4gICAgICAgIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgZ3JvdXBzIHRvIGJlIG9wZW4gYnkgZGVmYXVsdC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0OlxuICAgICAgICB8ICgocGFyYW1zOiBJc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHRQYXJhbXMpID0+IGJvb2xlYW4pXG4gICAgICAgIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgY2FuY2VsbGluZyB0cmFuc2FjdGlvbnMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb246IElzQXBwbHlTZXJ2ZXJTaWRlVHJhbnNhY3Rpb24gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNTUk0gVHJlZSBEYXRhOiBBbGxvd3Mgc3BlY2lmeWluZyB3aGljaCByb3dzIGFyZSBleHBhbmRhYmxlLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cDogSXNTZXJ2ZXJTaWRlR3JvdXAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNTUk0gVHJlZSBEYXRhOiBBbGxvd3Mgc3BlY2lmeWluZyBncm91cCBrZXlzLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRTZXJ2ZXJTaWRlR3JvdXBLZXk6IEdldFNlcnZlclNpZGVHcm91cEtleSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUmV0dXJuIGEgYnVzaW5lc3Mga2V5IGZvciB0aGUgbm9kZS4gSWYgaW1wbGVtZW50ZWQsIGVhY2ggcm93IGluIHRoZSBET00gd2lsbCBoYXZlIGFuIGF0dHJpYnV0ZSBgcm93LWJ1c2luZXNzLWtleT0nYWJjJ2Agd2hlcmUgYGFiY2AgaXMgd2hhdCB5b3UgcmV0dXJuIGFzIHRoZSBidXNpbmVzcyBrZXkuXG4gICAgICogVGhpcyBpcyB1c2VmdWwgZm9yIGF1dG9tYXRlZCB0ZXN0aW5nLCBhcyBpdCBwcm92aWRlcyBhIHdheSBmb3IgeW91ciB0b29sIHRvIGlkZW50aWZ5IHJvd3MgYmFzZWQgb24gdW5pcXVlIGJ1c2luZXNzIGtleXMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldEJ1c2luZXNzS2V5Rm9yTm9kZTogKChub2RlOiBJUm93Tm9kZTxURGF0YT4pID0+IHN0cmluZykgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzZXR0aW5nIHRoZSBJRCBmb3IgYSBwYXJ0aWN1bGFyIHJvdyBub2RlIGJhc2VkIG9uIHRoZSBkYXRhLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0lkOiBHZXRSb3dJZEZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIGdldFJvd0lkKCkgY2FsbGJhY2sgaXMgaW1wbGVtZW50ZWQgYW5kIG5ldyBSb3cgRGF0YSBpcyBzZXQsIHRoZSBncmlkIHdpbGwgZGlzcmVnYXJkIGFsbCBwcmV2aW91cyByb3dzIGFuZCB0cmVhdCB0aGUgbmV3IFJvdyBEYXRhIGFzIG5ldyBkYXRhLiBBcyBhIGNvbnNlcXVlbmNlLCBhbGwgUm93IFN0YXRlIChlZyBzZWxlY3Rpb24sIHJlbmRlcmVkIHJvd3MpIHdpbGwgYmUgcmVzZXQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVzZXRSb3dEYXRhT25VcGRhdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIGZpcmVkIGFmdGVyIHRoZSByb3cgaXMgcmVuZGVyZWQgaW50byB0aGUgRE9NLiBTaG91bGQgbm90IGJlIHVzZWQgdG8gaW5pdGlhdGUgc2lkZSBlZmZlY3RzLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzUm93UG9zdENyZWF0ZTogKChwYXJhbXM6IFByb2Nlc3NSb3dQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggcm93cyBhcmUgc2VsZWN0YWJsZS4gQnkgZGVmYXVsdCByb3dzIGFyZSBzZWxlY3RhYmxlLCBzbyByZXR1cm4gYGZhbHNlYCB0byBtYWtlIGEgcm93IHVuLXNlbGVjdGFibGUuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzUm93U2VsZWN0YWJsZTogSXNSb3dTZWxlY3RhYmxlPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gYmUgdXNlZCB3aXRoIE1hc3RlciBEZXRhaWwgdG8gZGV0ZXJtaW5lIGlmIGEgcm93IHNob3VsZCBiZSBhIG1hc3RlciByb3cuIElmIGBmYWxzZWAgaXMgcmV0dXJuZWQgbm8gZGV0YWlsIHJvdyB3aWxsIGV4aXN0IGZvciB0aGlzIHJvdy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dNYXN0ZXI6IElzUm93TWFzdGVyPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gZmlsbCB2YWx1ZXMgaW5zdGVhZCBvZiBzaW1wbHkgY29weWluZyB2YWx1ZXMgb3IgaW5jcmVhc2luZyBudW1iZXIgdmFsdWVzIHVzaW5nIGxpbmVhciBwcm9ncmVzc2lvbi5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZmlsbE9wZXJhdGlvbjogKChwYXJhbXM6IEZpbGxPcGVyYXRpb25QYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBwZXJmb3JtIGFkZGl0aW9uYWwgc29ydGluZyBhZnRlciB0aGUgZ3JpZCBoYXMgc29ydGVkIHRoZSByb3dzLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0U29ydFJvd3M6ICgocGFyYW1zOiBQb3N0U29ydFJvd3NQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdmVyc2lvbiBvZiBwcm9wZXJ0eSBgcm93U3R5bGVgIHRvIHNldCBzdHlsZSBmb3IgZWFjaCByb3cgaW5kaXZpZHVhbGx5LiBGdW5jdGlvbiBzaG91bGQgcmV0dXJuIGFuIG9iamVjdCBvZiBDU1MgdmFsdWVzIG9yIHVuZGVmaW5lZCBmb3Igbm8gc3R5bGVzLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dTdHlsZTogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zPFREYXRhPikgPT4gUm93U3R5bGUgfCB1bmRlZmluZWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dDbGFzc2AgdG8gc2V0IGNsYXNzKGVzKSBmb3IgZWFjaCByb3cgaW5kaXZpZHVhbGx5LiBGdW5jdGlvbiBzaG91bGQgcmV0dXJuIGVpdGhlciBhIHN0cmluZyAoY2xhc3MgbmFtZSksIGFycmF5IG9mIHN0cmluZ3MgKGFycmF5IG9mIGNsYXNzIG5hbWVzKSBvciB1bmRlZmluZWQgZm9yIG5vIGNsYXNzLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRSb3dDbGFzczogKChwYXJhbXM6IFJvd0NsYXNzUGFyYW1zPFREYXRhPikgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQpIHwgdW5kZWZpbmVkID1cbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dIZWlnaHRgIHRvIHNldCBoZWlnaHQgZm9yIGVhY2ggcm93IGluZGl2aWR1YWxseS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiBhIHBvc2l0aXZlIG51bWJlciBvZiBwaXhlbHMsIG9yIHJldHVybiBgbnVsbGAvYHVuZGVmaW5lZGAgdG8gdXNlIHRoZSBkZWZhdWx0IHJvdyBoZWlnaHQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0hlaWdodDogKChwYXJhbXM6IFJvd0hlaWdodFBhcmFtczxURGF0YT4pID0+IG51bWJlciB8IHVuZGVmaW5lZCB8IG51bGwpIHwgdW5kZWZpbmVkID1cbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIC8qKiBUZWxscyB0aGUgZ3JpZCBpZiB0aGlzIHJvdyBzaG91bGQgYmUgcmVuZGVyZWQgYXMgZnVsbCB3aWR0aC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNGdWxsV2lkdGhSb3c6ICgocGFyYW1zOiBJc0Z1bGxXaWR0aFJvd1BhcmFtczxURGF0YT4pID0+IGJvb2xlYW4pIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG4gICAgLyoqIFRoZSB0b29sIHBhbmVsIHZpc2liaWxpdHkgaGFzIGNoYW5nZWQuIEZpcmVzIHR3aWNlIGlmIHN3aXRjaGluZyBiZXR3ZWVuIHBhbmVscyAtIG9uY2Ugd2l0aCB0aGUgb2xkIHBhbmVsIGFuZCBvbmNlIHdpdGggdGhlIG5ldyBwYW5lbC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgVG9vbFBhbmVsVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFRoZSB0b29sIHBhbmVsIHNpemUgaGFzIGJlZW4gY2hhbmdlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2xQYW5lbFNpemVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8VG9vbFBhbmVsU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgVG9vbFBhbmVsU2l6ZUNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFRoZSBjb2x1bW4gbWVudSB2aXNpYmlsaXR5IGhhcyBjaGFuZ2VkLiBGaXJlcyB0d2ljZSBpZiBzd2l0Y2hpbmcgYmV0d2VlbiB0YWJzIC0gb25jZSB3aXRoIHRoZSBvbGQgdGFiIGFuZCBvbmNlIHdpdGggdGhlIG5ldyB0YWIuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5NZW51VmlzaWJsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5NZW51VmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29sdW1uTWVudVZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBUaGUgY29udGV4dCBtZW51IHZpc2liaWxpdHkgaGFzIGNoYW5nZWQgKG9wZW5lZCBvciBjbG9zZWQpLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29udGV4dE1lbnVWaXNpYmxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbnRleHRNZW51VmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29udGV4dE1lbnVWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQ3V0IG9wZXJhdGlvbiBoYXMgc3RhcnRlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGN1dFN0YXJ0OiBFdmVudEVtaXR0ZXI8Q3V0U3RhcnRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDdXRTdGFydEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQ3V0IG9wZXJhdGlvbiBoYXMgZW5kZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjdXRFbmQ6IEV2ZW50RW1pdHRlcjxDdXRFbmRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDdXRFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFBhc3RlIG9wZXJhdGlvbiBoYXMgc3RhcnRlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlU3RhcnQ6IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFzdGVTdGFydEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUGFzdGUgb3BlcmF0aW9uIGhhcyBlbmRlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhc3RlRW5kOiBFdmVudEVtaXR0ZXI8UGFzdGVFbmRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZUVuZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjb2x1bW4sIG9yIGdyb3VwIG9mIGNvbHVtbnMsIHdhcyBoaWRkZW4gLyBzaG93bi5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZpc2libGU6IEV2ZW50RW1pdHRlcjxDb2x1bW5WaXNpYmxlRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENvbHVtblZpc2libGVFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEEgY29sdW1uLCBvciBncm91cCBvZiBjb2x1bW5zLCB3YXMgcGlubmVkIC8gdW5waW5uZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaW5uZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaW5uZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29sdW1uUGlubmVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIGNvbHVtbiB3YXMgcmVzaXplZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblJlc2l6ZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5SZXNpemVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENvbHVtblJlc2l6ZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEEgY29sdW1uIHdhcyBtb3ZlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1vdmVkOiBFdmVudEVtaXR0ZXI8Q29sdW1uTW92ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDb2x1bW5Nb3ZlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSB2YWx1ZSBjb2x1bW4gd2FzIGFkZGVkIG9yIHJlbW92ZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5WYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29sdW1uVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBUaGUgcGl2b3QgbW9kZSBmbGFnIHdhcyBjaGFuZ2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUGl2b3RNb2RlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90TW9kZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSBwaXZvdCBjb2x1bW4gd2FzIGFkZGVkLCByZW1vdmVkIG9yIG9yZGVyIGNoYW5nZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5QaXZvdENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29sdW1uUGl2b3RDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIGNvbHVtbiBncm91cCB3YXMgb3BlbmVkIC8gY2xvc2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uR3JvdXBPcGVuZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5Hcm91cE9wZW5lZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVXNlciBzZXQgbmV3IGNvbHVtbnMuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBuZXdDb2x1bW5zTG9hZGVkOiBFdmVudEVtaXR0ZXI8TmV3Q29sdW1uc0xvYWRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBOZXdDb2x1bW5zTG9hZGVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiBncmlkIGNvbHVtbnMgY2hhbmdlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGdyaWRDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBHcmlkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGRpc3BsYXllZCBjb2x1bW5zIGNoYW5nZWQuIFRoaXMgY2FuIHJlc3VsdCBmcm9tIGNvbHVtbnMgb3BlbiAvIGNsb3NlLCBjb2x1bW4gbW92ZSwgcGl2b3QsIGdyb3VwLCBldGMuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBkaXNwbGF5ZWRDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBUaGUgbGlzdCBvZiByZW5kZXJlZCBjb2x1bW5zIGNoYW5nZWQgKG9ubHkgY29sdW1ucyBpbiB0aGUgdmlzaWJsZSBzY3JvbGxlZCB2aWV3cG9ydCBhcmUgcmVuZGVyZWQgYnkgZGVmYXVsdCkuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsQ29sdW1uc0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgVmlydHVhbENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBTaG90Z3VuIC0gZ2V0cyBjYWxsZWQgd2hlbiBlaXRoZXIgYSkgbmV3IGNvbHVtbnMgYXJlIHNldCBvciBiKSBgYXBpLmFwcGx5Q29sdW1uU3RhdGUoKWAgaXMgdXNlZCwgc28gZXZlcnl0aGluZyBoYXMgY2hhbmdlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29sdW1uRXZlcnl0aGluZ0NoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEEgbW91c2UgY3Vyc29yIGlzIGluaXRpYWxseSBtb3ZlZCBvdmVyIGEgY29sdW1uIGhlYWRlci5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkhlYWRlck1vdXNlT3ZlcjogRXZlbnRFbWl0dGVyPENvbHVtbkhlYWRlck1vdXNlT3ZlckV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5IZWFkZXJNb3VzZU92ZXJFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEEgbW91c2UgY3Vyc29yIGlzIG1vdmVkIG91dCBvZiBhIGNvbHVtbiBoZWFkZXIuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5IZWFkZXJNb3VzZUxlYXZlOiBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyTW91c2VMZWF2ZUV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5IZWFkZXJNb3VzZUxlYXZlRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIGNsaWNrIGlzIHBlcmZvcm1lZCBvbiBhIGNvbHVtbiBoZWFkZXIuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5IZWFkZXJDbGlja2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5IZWFkZXJDbGlja2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIGNvbnRleHQgbWVudSBhY3Rpb24sIHN1Y2ggYXMgcmlnaHQtY2xpY2sgb3IgY29udGV4dCBtZW51IGtleSBwcmVzcywgaXMgcGVyZm9ybWVkIG9uIGEgY29sdW1uIGhlYWRlci5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkhlYWRlckNvbnRleHRNZW51OiBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyQ29udGV4dE1lbnVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29sdW1uSGVhZGVyQ29udGV4dE1lbnVFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIE9ubHkgdXNlZCBieSBBbmd1bGFyLCBSZWFjdCBhbmQgVnVlSlMgQUcgR3JpZCBjb21wb25lbnRzIChub3QgdXNlZCBpZiBkb2luZyBwbGFpbiBKYXZhU2NyaXB0KS5cbiAgICAgKiBJZiB0aGUgZ3JpZCByZWNlaXZlcyBjaGFuZ2VzIGR1ZSB0byBib3VuZCBwcm9wZXJ0aWVzLCB0aGlzIGV2ZW50IGZpcmVzIGFmdGVyIHRoZSBncmlkIGhhcyBmaW5pc2hlZCBwcm9jZXNzaW5nIHRoZSBjaGFuZ2UuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb21wb25lbnRTdGF0ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29tcG9uZW50U3RhdGVDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBWYWx1ZSBoYXMgY2hhbmdlZCBhZnRlciBlZGl0aW5nICh0aGlzIGV2ZW50IHdpbGwgbm90IGZpcmUgaWYgZWRpdGluZyB3YXMgY2FuY2VsbGVkLCBlZyBFU0Mgd2FzIHByZXNzZWQpIG9yXG4gICAgICogIGlmIGNlbGwgdmFsdWUgaGFzIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgY3V0LCBwYXN0ZSwgY2VsbCBjbGVhciAocHJlc3NpbmcgRGVsZXRlIGtleSksXG4gICAgICogZmlsbCBoYW5kbGUsIGNvcHkgcmFuZ2UgZG93biwgdW5kbyBhbmQgcmVkby5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxWYWx1ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDZWxsVmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENlbGxWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFZhbHVlIGhhcyBjaGFuZ2VkIGFmdGVyIGVkaXRpbmcuIE9ubHkgZmlyZXMgd2hlbiBgcmVhZE9ubHlFZGl0PXRydWVgLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRSZXF1ZXN0OiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRSZXF1ZXN0RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENlbGxFZGl0UmVxdWVzdEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSBjZWxsJ3MgdmFsdWUgd2l0aGluIGEgcm93IGhhcyBjaGFuZ2VkLiBUaGlzIGV2ZW50IGNvcnJlc3BvbmRzIHRvIEZ1bGwgUm93IEVkaXRpbmcgb25seS5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1ZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJvd1ZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBSb3dWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSBjZWxsIGhhcyBzdGFydGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEVkaXRpbmdTdGFydGVkOiBFdmVudEVtaXR0ZXI8Q2VsbEVkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogRWRpdGluZyBhIGNlbGwgaGFzIHN0b3BwZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ2VsbEVkaXRpbmdTdG9wcGVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdGFydGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RhcnRlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBGdWxsIFJvdyBFZGl0aW5nLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBSb3dFZGl0aW5nU3RhcnRlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogRWRpdGluZyBhIHJvdyBoYXMgc3RvcHBlZCAod2hlbiByb3cgZWRpdGluZyBpcyBlbmFibGVkKS4gV2hlbiByb3cgZWRpdGluZywgdGhpcyBldmVudCB3aWxsIGJlIGZpcmVkIG9uY2UgYW5kIGBjZWxsRWRpdGluZ1N0b3BwZWRgIHdpbGwgYmUgZmlyZWQgZm9yIGVhY2ggaW5kaXZpZHVhbCBjZWxsLiBPbmx5IGZpcmVzIHdoZW4gZG9pbmcgRnVsbCBSb3cgRWRpdGluZy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0VkaXRpbmdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8Um93RWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgUm93RWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFVuZG8gb3BlcmF0aW9uIGhhcyBzdGFydGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdW5kb1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxVbmRvU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFVuZG9TdGFydGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBVbmRvIG9wZXJhdGlvbiBoYXMgZW5kZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB1bmRvRW5kZWQ6IEV2ZW50RW1pdHRlcjxVbmRvRW5kZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxVbmRvRW5kZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJlZG8gb3BlcmF0aW9uIGhhcyBzdGFydGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmVkb1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxSZWRvU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJlZG9TdGFydGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSZWRvIG9wZXJhdGlvbiBoYXMgZW5kZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByZWRvRW5kZWQ6IEV2ZW50RW1pdHRlcjxSZWRvRW5kZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSZWRvRW5kZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJhbmdlIGRlbGV0ZSBvcGVyYXRpb24gKGNlbGwgY2xlYXIpIGhhcyBzdGFydGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VEZWxldGVTdGFydDogRXZlbnRFbWl0dGVyPFJhbmdlRGVsZXRlU3RhcnRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgUmFuZ2VEZWxldGVTdGFydEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogUmFuZ2UgZGVsZXRlIG9wZXJhdGlvbiAoY2VsbCBjbGVhcikgaGFzIGVuZGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VEZWxldGVFbmQ6IEV2ZW50RW1pdHRlcjxSYW5nZURlbGV0ZUVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBSYW5nZURlbGV0ZUVuZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogRmlsbCBvcGVyYXRpb24gaGFzIHN0YXJ0ZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaWxsU3RhcnQ6IEV2ZW50RW1pdHRlcjxGaWxsU3RhcnRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWxsU3RhcnRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpbGwgb3BlcmF0aW9uIGhhcyBlbmRlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbGxFbmQ6IEV2ZW50RW1pdHRlcjxGaWxsRW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsbEVuZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRmlsdGVyIGhhcyBiZWVuIG9wZW5lZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck9wZW5lZDogRXZlbnRFbWl0dGVyPEZpbHRlck9wZW5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBGaWx0ZXJPcGVuZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEZpbHRlciBoYXMgYmVlbiBtb2RpZmllZCBhbmQgYXBwbGllZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlckNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIEZpbHRlckNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEZpbHRlciB3YXMgbW9kaWZpZWQgYnV0IG5vdCBhcHBsaWVkLiBVc2VkIHdoZW4gZmlsdGVycyBoYXZlICdBcHBseScgYnV0dG9ucy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbHRlck1vZGlmaWVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyTW9kaWZpZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgRmlsdGVyTW9kaWZpZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEFkdmFuY2VkIEZpbHRlciBCdWlsZGVyIHZpc2liaWxpdHkgaGFzIGNoYW5nZWQgKG9wZW5lZCBvciBjbG9zZWQpLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYWR2YW5jZWRGaWx0ZXJCdWlsZGVyVmlzaWJsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQWR2YW5jZWRGaWx0ZXJCdWlsZGVyVmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+ID0gbmV3IEV2ZW50RW1pdHRlcjxBZHZhbmNlZEZpbHRlckJ1aWxkZXJWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSBjaGFydCBoYXMgYmVlbiBjcmVhdGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRDcmVhdGVkOiBFdmVudEVtaXR0ZXI8Q2hhcnRDcmVhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENoYXJ0Q3JlYXRlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVGhlIGRhdGEgcmFuZ2UgZm9yIHRoZSBjaGFydCBoYXMgYmVlbiBjaGFuZ2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPVxuICAgICAgICBuZXcgRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGb3JtYXR0aW5nIGNoYW5nZXMgaGF2ZSBiZWVuIG1hZGUgYnkgdXNlcnMgdGhyb3VnaCB0aGUgQ3VzdG9taXplIFBhbmVsLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2hhcnRPcHRpb25zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0T3B0aW9uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ2hhcnRPcHRpb25zQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSBjaGFydCBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydERlc3Ryb3llZDogRXZlbnRFbWl0dGVyPENoYXJ0RGVzdHJveWVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENoYXJ0RGVzdHJveWVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBET00gZXZlbnQgYGtleURvd25gIGhhcHBlbmVkIG9uIGEgY2VsbC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxLZXlEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PFREYXRhPj4gPVxuICAgICAgICBuZXcgRXZlbnRFbWl0dGVyPENlbGxLZXlEb3duRXZlbnQ8VERhdGE+IHwgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFRoZSBncmlkIGhhcyBpbml0aWFsaXNlZCBhbmQgaXMgcmVhZHkgZm9yIG1vc3QgYXBpIGNhbGxzLCBidXQgbWF5IG5vdCBiZSBmdWxseSByZW5kZXJlZCB5ZXQgICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFJlYWR5OiBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8R3JpZFJlYWR5RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaXJlZCB0aGUgZmlyc3QgdGltZSBkYXRhIGlzIHJlbmRlcmVkIGludG8gdGhlIGdyaWQuIFVzZSB0aGlzIGV2ZW50IGlmIHlvdSB3YW50IHRvIGF1dG8gcmVzaXplIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY29udGVudHMgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBmaXJzdERhdGFSZW5kZXJlZDogRXZlbnRFbWl0dGVyPEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIEZpcnN0RGF0YVJlbmRlcmVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBUaGUgc2l6ZSBvZiB0aGUgZ3JpZCBgZGl2YCBoYXMgY2hhbmdlZC4gSW4gb3RoZXIgd29yZHMsIHRoZSBncmlkIHdhcyByZXNpemVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZFNpemVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIEdyaWRTaXplQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogRGlzcGxheWVkIHJvd3MgaGF2ZSBjaGFuZ2VkLiBUcmlnZ2VyZWQgYWZ0ZXIgc29ydCwgZmlsdGVyIG9yIHRyZWUgZXhwYW5kIC8gY29sbGFwc2UgZXZlbnRzLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgbW9kZWxVcGRhdGVkOiBFdmVudEVtaXR0ZXI8TW9kZWxVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIE1vZGVsVXBkYXRlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSByb3cgd2FzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLCBmb3IgYW55IHJlYXNvbi4gVXNlIHRvIGNsZWFuIHVwIHJlc291cmNlcyAoaWYgYW55KSB1c2VkIGJ5IHRoZSByb3cuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aXJ0dWFsUm93UmVtb3ZlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFZpcnR1YWxSb3dSZW1vdmVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBXaGljaCByb3dzIGFyZSByZW5kZXJlZCBpbiB0aGUgRE9NIGhhcyBjaGFuZ2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdmlld3BvcnRDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Vmlld3BvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFZpZXdwb3J0Q2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVGhlIGJvZHkgd2FzIHNjcm9sbGVkIGhvcml6b250YWxseSBvciB2ZXJ0aWNhbGx5LlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYm9keVNjcm9sbDogRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNYWluIGJvZHkgb2YgdGhlIGdyaWQgaGFzIHN0b3BwZWQgc2Nyb2xsaW5nLCBlaXRoZXIgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsRW5kOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBCb2R5U2Nyb2xsRW5kRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBXaGVuIGRyYWdnaW5nIHN0YXJ0cy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdGFydGVkOiBFdmVudEVtaXR0ZXI8RHJhZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RhcnRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogV2hlbiBkcmFnZ2luZyBzdG9wcy4gVGhpcyBjb3VsZCBiZSBhbnkgYWN0aW9uIHRoYXQgdXNlcyB0aGUgZ3JpZCdzIERyYWcgYW5kIERyb3Agc2VydmljZSwgZS5nLiBDb2x1bW4gTW92aW5nLCBDb2x1bW4gUmVzaXppbmcsIFJhbmdlIFNlbGVjdGlvbiwgRmlsbCBIYW5kbGUsIGV0Yy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRyYWdTdG9wcGVkOiBFdmVudEVtaXR0ZXI8RHJhZ1N0b3BwZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogR3JpZCBzdGF0ZSBoYXMgYmVlbiB1cGRhdGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc3RhdGVVcGRhdGVkOiBFdmVudEVtaXR0ZXI8U3RhdGVVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFN0YXRlVXBkYXRlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVHJpZ2dlcmVkIGV2ZXJ5IHRpbWUgdGhlIHBhZ2luZyBzdGF0ZSBjaGFuZ2VzLiBTb21lIG9mIHRoZSBtb3N0IGNvbW1vbiBzY2VuYXJpb3MgZm9yIHRoaXMgZXZlbnQgdG8gYmUgdHJpZ2dlcmVkIGFyZTpcbiAgICAgKlxuICAgICAqICAtIFRoZSBwYWdlIHNpemUgY2hhbmdlcy5cbiAgICAgKiAgLSBUaGUgY3VycmVudCBzaG93biBwYWdlIGlzIGNoYW5nZWQuXG4gICAgICogIC0gTmV3IGRhdGEgaXMgbG9hZGVkIG9udG8gdGhlIGdyaWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFBhZ2luYXRpb25DaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIGRyYWcgaGFzIHN0YXJ0ZWQsIG9yIGRyYWdnaW5nIHdhcyBhbHJlYWR5IHN0YXJ0ZWQgYW5kIHRoZSBtb3VzZSBoYXMgcmUtZW50ZXJlZCB0aGUgZ3JpZCBoYXZpbmcgcHJldmlvdXNseSBsZWZ0IHRoZSBncmlkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0VudGVyOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0VudGVyRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFJvd0RyYWdFbnRlckV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVGhlIG1vdXNlIGhhcyBtb3ZlZCB3aGlsZSBkcmFnZ2luZy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdNb3ZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ01vdmVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dEcmFnTW92ZUV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIG1vdXNlIGhhcyBsZWZ0IHRoZSBncmlkIHdoaWxlIGRyYWdnaW5nLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ0xlYXZlOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0xlYXZlRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFJvd0RyYWdMZWF2ZUV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVGhlIGRyYWcgaGFzIGZpbmlzaGVkIG92ZXIgdGhlIGdyaWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW5kOiBFdmVudEVtaXR0ZXI8Um93RHJhZ0VuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdFbmRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgcm93IGdyb3VwIGNvbHVtbiB3YXMgYWRkZWQsIHJlbW92ZWQgb3IgcmVvcmRlcmVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUm93R3JvdXBDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSByb3cgZ3JvdXAgd2FzIG9wZW5lZCBvciBjbG9zZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dHcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPFJvd0dyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFJvd0dyb3VwT3BlbmVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBGaXJlZCB3aGVuIGNhbGxpbmcgZWl0aGVyIG9mIHRoZSBBUEkgbWV0aG9kcyBgZXhwYW5kQWxsKClgIG9yIGBjb2xsYXBzZUFsbCgpYC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGV4cGFuZE9yQ29sbGFwc2VBbGw6IEV2ZW50RW1pdHRlcjxFeHBhbmRPckNvbGxhcHNlQWxsRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIEV4cGFuZE9yQ29sbGFwc2VBbGxFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEV4Y2VlZGVkIHRoZSBgcGl2b3RNYXhHZW5lcmF0ZWRDb2x1bW5zYCBsaW1pdCB3aGVuIGdlbmVyYXRpbmcgY29sdW1ucy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBpdm90TWF4Q29sdW1uc0V4Y2VlZGVkOiBFdmVudEVtaXR0ZXI8UGl2b3RNYXhDb2x1bW5zRXhjZWVkZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgUGl2b3RNYXhDb2x1bW5zRXhjZWVkZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFRoZSBjbGllbnQgaGFzIHNldCBuZXcgcGlubmVkIHJvdyBkYXRhIGludG8gdGhlIGdyaWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBwaW5uZWRSb3dEYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFBpbm5lZFJvd0RhdGFDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBDbGllbnQtU2lkZSBSb3cgTW9kZWwgb25seS4gVGhlIGNsaWVudCBoYXMgdXBkYXRlZCBkYXRhIGZvciB0aGUgZ3JpZCBieSBlaXRoZXIgYSkgc2V0dGluZyBuZXcgUm93IERhdGEgb3IgYikgQXBwbHlpbmcgYSBSb3cgVHJhbnNhY3Rpb24uXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEYXRhVXBkYXRlZDogRXZlbnRFbWl0dGVyPFJvd0RhdGFVcGRhdGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFJvd0RhdGFVcGRhdGVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBc3luYyB0cmFuc2FjdGlvbnMgaGF2ZSBiZWVuIGFwcGxpZWQuIENvbnRhaW5zIGEgbGlzdCBvZiBhbGwgdHJhbnNhY3Rpb24gcmVzdWx0cy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDogRXZlbnRFbWl0dGVyPEFzeW5jVHJhbnNhY3Rpb25zRmx1c2hlZDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSBzZXJ2ZXIgc2lkZSBzdG9yZSBoYXMgZmluaXNoZWQgcmVmcmVzaGluZy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHN0b3JlUmVmcmVzaGVkOiBFdmVudEVtaXR0ZXI8U3RvcmVSZWZyZXNoZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgU3RvcmVSZWZyZXNoZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEhlYWRlciBpcyBmb2N1c2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgaGVhZGVyRm9jdXNlZDogRXZlbnRFbWl0dGVyPEhlYWRlckZvY3VzZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgSGVhZGVyRm9jdXNlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQ2VsbCBpcyBjbGlja2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxDbGlja2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDZWxsIGlzIGRvdWJsZSBjbGlja2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbERvdWJsZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQ2VsbCBpcyBmb2N1c2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEZvY3VzZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRm9jdXNlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBNb3VzZSBlbnRlcmVkIGNlbGwuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlT3ZlckV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDZWxsTW91c2VPdmVyRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBNb3VzZSBsZWZ0IGNlbGwuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VPdXQ6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdXRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ2VsbE1vdXNlT3V0RXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBNb3VzZSBkb3duIG9uIGNlbGwuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsTW91c2VEb3duOiBFdmVudEVtaXR0ZXI8Q2VsbE1vdXNlRG93bkV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDZWxsTW91c2VEb3duRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBSb3cgaXMgY2xpY2tlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0NsaWNrZWQ6IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93Q2xpY2tlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IGlzIGRvdWJsZSBjbGlja2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPFJvd0RvdWJsZUNsaWNrZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgUm93RG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogUm93IGlzIHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuIFRoZSBldmVudCBjb250YWlucyB0aGUgbm9kZSBpbiBxdWVzdGlvbiwgc28gY2FsbCB0aGUgbm9kZSdzIGBpc1NlbGVjdGVkKClgIG1ldGhvZCB0byBzZWUgaWYgaXQgd2FzIGp1c3Qgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd1NlbGVjdGVkOiBFdmVudEVtaXR0ZXI8Um93U2VsZWN0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUm93IHNlbGVjdGlvbiBpcyBjaGFuZ2VkLiBVc2UgdGhlIGdyaWQgQVBJIGBnZXRTZWxlY3RlZE5vZGVzKClgIG9yIGBnZXRTZWxlY3RlZFJvd3MoKWAgdG8gZ2V0IHRoZSBuZXcgbGlzdCBvZiBzZWxlY3RlZCBub2RlcyAvIHJvdyBkYXRhLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQ2VsbCBpcyByaWdodCBjbGlja2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbENvbnRleHRNZW51OiBFdmVudEVtaXR0ZXI8Q2VsbENvbnRleHRNZW51RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENlbGxDb250ZXh0TWVudUV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSBjaGFuZ2UgdG8gcmFuZ2Ugc2VsZWN0aW9uIGhhcyBvY2N1cnJlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEEgdG9vbHRpcCBoYXMgYmVlbiBkaXNwbGF5ZWQgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sdGlwU2hvdzogRXZlbnRFbWl0dGVyPFRvb2x0aXBTaG93RXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbHRpcFNob3dFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEEgdG9vbHRpcCB3YXMgaGlkZGVuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbHRpcEhpZGU6IEV2ZW50RW1pdHRlcjxUb29sdGlwSGlkZUV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFRvb2x0aXBIaWRlRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBTb3J0IGhhcyBjaGFuZ2VkLiBUaGUgZ3JpZCBhbHNvIGxpc3RlbnMgZm9yIHRoaXMgYW5kIHVwZGF0ZXMgdGhlIG1vZGVsLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc29ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxTb3J0Q2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuXG4gICAgLy8gRW5hYmxlIHR5cGUgY29lcmNpb24gZm9yIGJvb2xlYW4gSW5wdXRzIHRvIHN1cHBvcnQgdXNlIGxpa2UgJ2VuYWJsZUNoYXJ0cycgaW5zdGVhZCBvZiBmb3JjaW5nICdbZW5hYmxlQ2hhcnRzXT1cInRydWVcIidcbiAgICAvLyBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdGVtcGxhdGUtdHlwZWNoZWNrI2lucHV0LXNldHRlci1jb2VyY2lvblxuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01ha2VDb2x1bW5WaXNpYmxlQWZ0ZXJVbkdyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NlbGxGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NIZWFkZXJGb2N1czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFNlbGVjdHNDaGlsZHJlbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzU2hvd0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c1Nob3dWZXJ0aWNhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVidWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUJyb3dzZXJUb29sdGlwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbEV4cHJlc3Npb25zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEluY2x1ZGVUb3RhbEZvb3RlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0Rlc2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91blNvcnRJY29uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzTXVsdGlTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaW5nbGVDbGlja0VkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTG9hZGluZ092ZXJsYXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTm9Sb3dzT3ZlcmxheTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBdXRvU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2tpcEhlYWRlck9uQXV0b1NpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uTW92ZUFuaW1hdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb3ZhYmxlQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NGaWVsZERvdE5vdGF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlUmFuZ2VIYW5kbGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUZpbGxIYW5kbGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xlYXJPbkZpbGxSZWR1Y3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlbHRhU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NUb3VjaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBc3luY0V2ZW50czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvbnRleHRNZW51OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRHJhZ0xlYXZlSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0dyb3VwSGlkZXNDb2x1bW5zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01pZGRsZUNsaWNrU2Nyb2xsczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQcmV2ZW50RGVmYXVsdE9uTW91c2VXaGVlbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb3B5Um93c1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb3B5SGVhZGVyc1RvQ2xpcGJvYXJkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb3B5R3JvdXBIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Bpdm90TW9kZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZ2dGdW5jSW5IZWFkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29sdW1uVmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Fsd2F5c0FnZ3JlZ2F0ZUF0Um9vdExldmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZvY3VzQWZ0ZXJSZWZyZXNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9mdW5jdGlvbnNSZWFkT25seTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYW5pbWF0ZVJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU2VsZWN0c0ZpbHRlcmVkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFJlbW92ZVNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFJlbW92ZUxvd2VzdFNpbmdsZUNoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSdGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpY2tFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnRW50aXJlUm93OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dEcmFnOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vdmVXaGVuUm93RHJhZ2dpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdNdWx0aVJvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlR3JvdXBFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUGFnaW5hdGlvblBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEhpZGVPcGVuUGFyZW50czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBBbGxvd1VuYmFsYW5jZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2luYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2luYXRpb25BdXRvUGFnZVNpemU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2Nyb2xsT25OZXdEYXRhOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Njcm9sbFdoZW5Qb3B1cHNBcmVPcGVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wdXJnZUNsb3NlZFJvd05vZGVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jYWNoZVF1aWNrRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbmNsdWRlSGlkZGVuQ29sdW1uc0luUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Vuc3VyZURvbU9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV92YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhjZWxFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ3N2RXhwb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9pbmNsdWRlSGlkZGVuQ29sdW1uc0luQWR2YW5jZWRGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTXVsdGlSYW5nZVNlbGVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5QWZ0ZXJFZGl0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUHJvcGVydHlOYW1lc0NoZWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dNdWx0aVNlbGVjdFdpdGhDbGljazogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dIb3ZlckhpZ2hsaWdodDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpcGJvYXJkUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNoYXJ0czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0Jyb3dzZXJSZXNpemVPYnNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNYXhSZW5kZXJlZFJvd1Jlc3RyaWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9leGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Rvb2x0aXBNb3VzZVRyYWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90b29sdGlwSW50ZXJhY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2tlZXBEZXRhaWxSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wYWdpbmF0ZUNoaWxkUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcHJldmVudERlZmF1bHRPbkNvbnRleHRNZW51OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV91bmRvUmVkb0NlbGxFZGl0aW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbGxvd0RyYWdGcm9tQ29sdW1uc1Rvb2xQYW5lbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3RTdXBwcmVzc0F1dG9Db2x1bW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRXhwYW5kYWJsZVBpdm90R3JvdXBzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWJvdW5jZVZlcnRpY2FsU2Nyb2xsYmFyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZXRhaWxSb3dBdXRvSGVpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlU29ydEFsbExldmVsczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUVuYWJsZUNsaWVudFNpZGVTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlT25seVJlZnJlc2hGaWx0ZXJlZEdyb3VwczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZVNvcnRPblNlcnZlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2VydmVyU2lkZUZpbHRlck9uU2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0ZpbHRlcmVkT25seTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2hvd09wZW5lZEdyb3VwOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NsaXBib2FyZEFwaTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNb2RlbFVwZGF0ZUFmdGVyVXBkYXRlVHJhbnNhY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N0b3BFZGl0aW5nV2hlbkNlbGxzTG9zZUZvY3VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYWludGFpbkNvbHVtbk9yZGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cE1haW50YWluT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvbHVtbkhvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZWFkT25seUVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93VmlydHVhbGlzYXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxFZGl0aW5nT25CYWNrc3BhY2U6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jlc2V0Um93RGF0YU9uVXBkYXRlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yZW1vdmVQaXZvdEhlYWRlclJvd1doZW5TaW5nbGVWYWx1ZUNvbHVtbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb3B5U2luZ2xlQ2VsbFJhbmdlczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NHcm91cFJvd3NTdGlja3k6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ3V0VG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9yb3dHcm91cFBhbmVsU3VwcHJlc3NTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbGxvd1Nob3dDaGFuZ2VBZnRlckZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQWR2YW5jZWRGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX21hc3RlckRldGFpbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdHJlZURhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzR3JvdXBNYWludGFpblZhbHVlVHlwZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXBwbHlRdWlja0ZpbHRlckJlZm9yZVBpdm90T3JBZ2c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2VydmVyU2lkZUZ1bGxXaWR0aExvYWRpbmdSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWR2YW5jZWRGaWx0ZXJFdmFsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sb2FkaW5nOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIC8vIEBFTkRAXG59XG4iXX0=