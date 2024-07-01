import { _combineAttributesAndGridOptions, _processOnChange, createGrid } from 'ag-grid-community';
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
        /** Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks used by your application.
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
        /** Provide a pure function that returns a string ID to uniquely identify a given row. This enables the grid to work optimally with data changes and updates.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWctZ3JpZC1hbmd1bGFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2FnLWdyaWQtYW5ndWxhci9zcmMvbGliL2FnLWdyaWQtYW5ndWxhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBK0tBLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNuRyxPQUFPLEVBRUgsU0FBUyxFQUVULFlBQVksRUFDWixLQUFLLEVBR0wsTUFBTSxFQUVOLGlCQUFpQixHQUNwQixNQUFNLGVBQWUsQ0FBQztBQUd2QixPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RixPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQzs7OztBQVV4RSxNQUFNLE9BQU8sYUFBYTtJQW9CdEIsWUFDSSxVQUFzQixFQUNkLGdCQUFrQyxFQUNsQyx5QkFBb0QsRUFDcEQseUJBQTJEO1FBRjNELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQWtDO1FBbEIvRCxpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUNyQixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBTW5CLGdCQUFXLEdBQWtCLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDekQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztRQStHSCxVQUFVO1FBQ1Y7V0FDRztRQUNhLGNBQVMsR0FBbUQsU0FBUyxDQUFDO1FBQ3RGO1dBQ0c7UUFDYSxZQUFPLEdBQWdFLFNBQVMsQ0FBQztRQUNqRzs7V0FFRztRQUNhLHdCQUFtQixHQUF3QixTQUFTLENBQUM7UUFDckU7OztXQUdHO1FB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QUFNO2dCQUtVLG1CQUFtQjtzQkFBbkMsTUFBTTtnQkFLVSx1QkFBdUI7c0JBQXZDLE1BQU07Z0JBS1Usb0JBQW9CO3NCQUFwQyxNQUFNO2dCQUtVLGNBQWM7c0JBQTlCLE1BQU07Z0JBS1Usd0JBQXdCO3NCQUF4QyxNQUFNO2dCQUtVLGNBQWM7c0JBQTlCLE1BQU07Z0JBS1UsYUFBYTtzQkFBN0IsTUFBTTtnQkFLVSxXQUFXO3NCQUEzQixNQUFNO2dCQUdVLGlCQUFpQjtzQkFBakMsTUFBTTtnQkFLVSxXQUFXO3NCQUEzQixNQUFNO2dCQUdVLGFBQWE7c0JBQTdCLE1BQU07Z0JBS1UsWUFBWTtzQkFBNUIsTUFBTTtnQkFLVSxhQUFhO3NCQUE3QixNQUFNO2dCQUtVLFVBQVU7c0JBQTFCLE1BQU07Z0JBR1UsZ0JBQWdCO3NCQUFoQyxNQUFNO2dCQUtVLFdBQVc7c0JBQTNCLE1BQU07Z0JBR1UsZ0JBQWdCO3NCQUFoQyxNQUFNO2dCQUtVLGVBQWU7c0JBQS9CLE1BQU07Z0JBS1UscUJBQXFCO3NCQUFyQyxNQUFNO2dCQUlVLFdBQVc7c0JBQTNCLE1BQU07Z0JBRVUsV0FBVztzQkFBM0IsTUFBTTtnQkFHVSxXQUFXO3NCQUEzQixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2NvbnNpc3RlbnQtdHlwZS1pbXBvcnRzICovXG4vLyBAU1RBUlRfSU1QT1JUU0BcbmltcG9ydCB0eXBlIHtcbiAgICBBZHZhbmNlZEZpbHRlckJ1aWxkZXJWaXNpYmxlQ2hhbmdlZEV2ZW50LFxuICAgIEFkdmFuY2VkRmlsdGVyTW9kZWwsXG4gICAgQWxpZ25lZEdyaWQsXG4gICAgQXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkLFxuICAgIEJvZHlTY3JvbGxFbmRFdmVudCxcbiAgICBCb2R5U2Nyb2xsRXZlbnQsXG4gICAgQ2VsbENsaWNrZWRFdmVudCxcbiAgICBDZWxsQ29udGV4dE1lbnVFdmVudCxcbiAgICBDZWxsRG91YmxlQ2xpY2tlZEV2ZW50LFxuICAgIENlbGxFZGl0UmVxdWVzdEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50LFxuICAgIENlbGxGb2N1c2VkRXZlbnQsXG4gICAgQ2VsbEtleURvd25FdmVudCxcbiAgICBDZWxsTW91c2VEb3duRXZlbnQsXG4gICAgQ2VsbE1vdXNlT3V0RXZlbnQsXG4gICAgQ2VsbE1vdXNlT3ZlckV2ZW50LFxuICAgIENlbGxQb3NpdGlvbixcbiAgICBDZWxsVmFsdWVDaGFuZ2VkRXZlbnQsXG4gICAgQ2hhcnRDcmVhdGVkRXZlbnQsXG4gICAgQ2hhcnREZXN0cm95ZWRFdmVudCxcbiAgICBDaGFydE9wdGlvbnNDaGFuZ2VkRXZlbnQsXG4gICAgQ2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudCxcbiAgICBDaGFydFJlZlBhcmFtcyxcbiAgICBDaGFydFRvb2xQYW5lbHNEZWYsXG4gICAgQ29sRGVmLFxuICAgIENvbEdyb3VwRGVmLFxuICAgIENvbFR5cGVEZWYsXG4gICAgQ29sdW1uLFxuICAgIENvbHVtbkV2ZXJ5dGhpbmdDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uR3JvdXBPcGVuZWRFdmVudCxcbiAgICBDb2x1bW5IZWFkZXJDbGlja2VkRXZlbnQsXG4gICAgQ29sdW1uSGVhZGVyQ29udGV4dE1lbnVFdmVudCxcbiAgICBDb2x1bW5IZWFkZXJNb3VzZUxlYXZlRXZlbnQsXG4gICAgQ29sdW1uSGVhZGVyTW91c2VPdmVyRXZlbnQsXG4gICAgQ29sdW1uTWVudVZpc2libGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uTW92ZWRFdmVudCxcbiAgICBDb2x1bW5QaW5uZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdENoYW5nZWRFdmVudCxcbiAgICBDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQsXG4gICAgQ29sdW1uUmVzaXplZEV2ZW50LFxuICAgIENvbHVtblJvd0dyb3VwQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50LFxuICAgIENvbHVtblZpc2libGVFdmVudCxcbiAgICBDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudCxcbiAgICBDb250ZXh0TWVudVZpc2libGVDaGFuZ2VkRXZlbnQsXG4gICAgQ3N2RXhwb3J0UGFyYW1zLFxuICAgIEN1dEVuZEV2ZW50LFxuICAgIEN1dFN0YXJ0RXZlbnQsXG4gICAgRGF0YVR5cGVEZWZpbml0aW9uLFxuICAgIERpc3BsYXllZENvbHVtbnNDaGFuZ2VkRXZlbnQsXG4gICAgRG9tTGF5b3V0VHlwZSxcbiAgICBEcmFnU3RhcnRlZEV2ZW50LFxuICAgIERyYWdTdG9wcGVkRXZlbnQsXG4gICAgRXhjZWxFeHBvcnRQYXJhbXMsXG4gICAgRXhjZWxTdHlsZSxcbiAgICBFeHBhbmRPckNvbGxhcHNlQWxsRXZlbnQsXG4gICAgRmlsbEVuZEV2ZW50LFxuICAgIEZpbGxPcGVyYXRpb25QYXJhbXMsXG4gICAgRmlsbFN0YXJ0RXZlbnQsXG4gICAgRmlsdGVyQ2hhbmdlZEV2ZW50LFxuICAgIEZpbHRlck1vZGlmaWVkRXZlbnQsXG4gICAgRmlsdGVyT3BlbmVkRXZlbnQsXG4gICAgRmlyc3REYXRhUmVuZGVyZWRFdmVudCxcbiAgICBGb2N1c0dyaWRJbm5lckVsZW1lbnRQYXJhbXMsXG4gICAgRnVsbFdpZHRoQ2VsbEtleURvd25FdmVudCxcbiAgICBHZXRDaGFydE1lbnVJdGVtcyxcbiAgICBHZXRDaGFydFRvb2xiYXJJdGVtcyxcbiAgICBHZXRDb250ZXh0TWVudUl0ZW1zLFxuICAgIEdldERhdGFQYXRoLFxuICAgIEdldEdyb3VwUm93QWdnUGFyYW1zLFxuICAgIEdldExvY2FsZVRleHRQYXJhbXMsXG4gICAgR2V0TWFpbk1lbnVJdGVtcyxcbiAgICBHZXRSb3dJZEZ1bmMsXG4gICAgR2V0U2VydmVyU2lkZUdyb3VwS2V5LFxuICAgIEdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zUGFyYW1zLFxuICAgIEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50LFxuICAgIEdyaWRQcmVEZXN0cm95ZWRFdmVudCxcbiAgICBHcmlkUmVhZHlFdmVudCxcbiAgICBHcmlkU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBHcmlkU3RhdGUsXG4gICAgSGVhZGVyRm9jdXNlZEV2ZW50LFxuICAgIEhlYWRlclBvc2l0aW9uLFxuICAgIElBZHZhbmNlZEZpbHRlckJ1aWxkZXJQYXJhbXMsXG4gICAgSUFnZ0Z1bmMsXG4gICAgSURhdGFzb3VyY2UsXG4gICAgSVJvd0RyYWdJdGVtLFxuICAgIElSb3dOb2RlLFxuICAgIElTZXJ2ZXJTaWRlRGF0YXNvdXJjZSxcbiAgICBJVmlld3BvcnREYXRhc291cmNlLFxuICAgIEluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvclBhcmFtcyxcbiAgICBJc0FwcGx5U2VydmVyU2lkZVRyYW5zYWN0aW9uLFxuICAgIElzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50UGFyYW1zLFxuICAgIElzRnVsbFdpZHRoUm93UGFyYW1zLFxuICAgIElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIElzUm93RmlsdGVyYWJsZSxcbiAgICBJc1Jvd01hc3RlcixcbiAgICBJc1Jvd1NlbGVjdGFibGUsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXAsXG4gICAgSXNTZXJ2ZXJTaWRlR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zLFxuICAgIExvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmMsXG4gICAgTWVudUl0ZW1EZWYsXG4gICAgTW9kZWxVcGRhdGVkRXZlbnQsXG4gICAgTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zLFxuICAgIE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zLFxuICAgIE5ld0NvbHVtbnNMb2FkZWRFdmVudCxcbiAgICBQYWdpbmF0aW9uQ2hhbmdlZEV2ZW50LFxuICAgIFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXMsXG4gICAgUGFzdGVFbmRFdmVudCxcbiAgICBQYXN0ZVN0YXJ0RXZlbnQsXG4gICAgUGlubmVkUm93RGF0YUNoYW5nZWRFdmVudCxcbiAgICBQaXZvdE1heENvbHVtbnNFeGNlZWRlZEV2ZW50LFxuICAgIFBvc3RQcm9jZXNzUG9wdXBQYXJhbXMsXG4gICAgUG9zdFNvcnRSb3dzUGFyYW1zLFxuICAgIFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zLFxuICAgIFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtcyxcbiAgICBQcm9jZXNzR3JvdXBIZWFkZXJGb3JFeHBvcnRQYXJhbXMsXG4gICAgUHJvY2Vzc0hlYWRlckZvckV4cG9ydFBhcmFtcyxcbiAgICBQcm9jZXNzUm93UGFyYW1zLFxuICAgIFByb2Nlc3NVbnBpbm5lZENvbHVtbnNQYXJhbXMsXG4gICAgUmFuZ2VEZWxldGVFbmRFdmVudCxcbiAgICBSYW5nZURlbGV0ZVN0YXJ0RXZlbnQsXG4gICAgUmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgUmVkb0VuZGVkRXZlbnQsXG4gICAgUmVkb1N0YXJ0ZWRFdmVudCxcbiAgICBSb3dDbGFzc1BhcmFtcyxcbiAgICBSb3dDbGFzc1J1bGVzLFxuICAgIFJvd0NsaWNrZWRFdmVudCxcbiAgICBSb3dEYXRhVXBkYXRlZEV2ZW50LFxuICAgIFJvd0RvdWJsZUNsaWNrZWRFdmVudCxcbiAgICBSb3dEcmFnRW5kRXZlbnQsXG4gICAgUm93RHJhZ0VudGVyRXZlbnQsXG4gICAgUm93RHJhZ0xlYXZlRXZlbnQsXG4gICAgUm93RHJhZ01vdmVFdmVudCxcbiAgICBSb3dFZGl0aW5nU3RhcnRlZEV2ZW50LFxuICAgIFJvd0VkaXRpbmdTdG9wcGVkRXZlbnQsXG4gICAgUm93R3JvdXBPcGVuZWRFdmVudCxcbiAgICBSb3dHcm91cGluZ0Rpc3BsYXlUeXBlLFxuICAgIFJvd0hlaWdodFBhcmFtcyxcbiAgICBSb3dNb2RlbFR5cGUsXG4gICAgUm93U2VsZWN0ZWRFdmVudCxcbiAgICBSb3dTdHlsZSxcbiAgICBSb3dWYWx1ZUNoYW5nZWRFdmVudCxcbiAgICBTZWxlY3Rpb25DaGFuZ2VkRXZlbnQsXG4gICAgU2VuZFRvQ2xpcGJvYXJkUGFyYW1zLFxuICAgIFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zLFxuICAgIFNpZGVCYXJEZWYsXG4gICAgU2l6ZUNvbHVtbnNUb0NvbnRlbnRTdHJhdGVneSxcbiAgICBTaXplQ29sdW1uc1RvRml0R3JpZFN0cmF0ZWd5LFxuICAgIFNpemVDb2x1bW5zVG9GaXRQcm92aWRlZFdpZHRoU3RyYXRlZ3ksXG4gICAgU29ydENoYW5nZWRFdmVudCxcbiAgICBTb3J0RGlyZWN0aW9uLFxuICAgIFN0YXRlVXBkYXRlZEV2ZW50LFxuICAgIFN0YXR1c1BhbmVsRGVmLFxuICAgIFN0b3JlUmVmcmVzaGVkRXZlbnQsXG4gICAgVGFiVG9OZXh0Q2VsbFBhcmFtcyxcbiAgICBUYWJUb05leHRIZWFkZXJQYXJhbXMsXG4gICAgVG9vbFBhbmVsU2l6ZUNoYW5nZWRFdmVudCxcbiAgICBUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50LFxuICAgIFRvb2x0aXBIaWRlRXZlbnQsXG4gICAgVG9vbHRpcFNob3dFdmVudCxcbiAgICBUcmVlRGF0YURpc3BsYXlUeXBlLFxuICAgIFVuZG9FbmRlZEV2ZW50LFxuICAgIFVuZG9TdGFydGVkRXZlbnQsXG4gICAgVXNlR3JvdXBGb290ZXIsXG4gICAgVXNlR3JvdXBUb3RhbFJvdyxcbiAgICBWaWV3cG9ydENoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudCxcbiAgICBWaXJ0dWFsUm93UmVtb3ZlZEV2ZW50LFxufSBmcm9tICdhZy1ncmlkLWNvbW11bml0eSc7XG4vLyBARU5EX0lNUE9SVFNAXG5pbXBvcnQgdHlwZSB7IEdyaWRBcGksIEdyaWRPcHRpb25zLCBHcmlkUGFyYW1zLCBNb2R1bGUgfSBmcm9tICdhZy1ncmlkLWNvbW11bml0eSc7XG5pbXBvcnQgeyBfY29tYmluZUF0dHJpYnV0ZXNBbmRHcmlkT3B0aW9ucywgX3Byb2Nlc3NPbkNoYW5nZSwgY3JlYXRlR3JpZCB9IGZyb20gJ2FnLWdyaWQtY29tbXVuaXR5JztcbmltcG9ydCB7XG4gICAgQWZ0ZXJWaWV3SW5pdCxcbiAgICBDb21wb25lbnQsXG4gICAgRWxlbWVudFJlZixcbiAgICBFdmVudEVtaXR0ZXIsXG4gICAgSW5wdXQsXG4gICAgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveSxcbiAgICBPdXRwdXQsXG4gICAgVmlld0NvbnRhaW5lclJlZixcbiAgICBWaWV3RW5jYXBzdWxhdGlvbixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgdHlwZSB7IEFnQ2hhcnRUaGVtZSwgQWdDaGFydFRoZW1lT3ZlcnJpZGVzIH0gZnJvbSAnYWctY2hhcnRzLXR5cGVzJztcblxuaW1wb3J0IHsgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIgfSBmcm9tICcuL2FuZ3VsYXJGcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyJztcbmltcG9ydCB7IEFuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMgfSBmcm9tICcuL2FuZ3VsYXJGcmFtZXdvcmtPdmVycmlkZXMnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2FnLWdyaWQtYW5ndWxhcicsXG4gICAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZTogJycsXG4gICAgcHJvdmlkZXJzOiBbQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcywgQW5ndWxhckZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXJdLFxuICAgIC8vIHRlbGwgYW5ndWxhciB3ZSBkb24ndCB3YW50IHZpZXcgZW5jYXBzdWxhdGlvbiwgd2UgZG9uJ3Qgd2FudCBhIHNoYWRvdyByb290XG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0pXG5leHBvcnQgY2xhc3MgQWdHcmlkQW5ndWxhcjxURGF0YSA9IGFueSwgVENvbERlZiBleHRlbmRzIENvbERlZjxURGF0YT4gPSBDb2xEZWY8YW55Pj5cbiAgICBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95XG57XG4gICAgLy8gbm90IGludGVuZGVkIGZvciB1c2VyIHRvIGludGVyYWN0IHdpdGguIHNvIHB1dHRpbmcgXyBpbiBzbyBpZiB1c2VyIGdldHMgcmVmZXJlbmNlXG4gICAgLy8gdG8gdGhpcyBvYmplY3QsIHRoZXkga2luZCdhIGtub3cgaXQncyBub3QgcGFydCBvZiB0aGUgYWdyZWVkIGludGVyZmFjZVxuICAgIHByaXZhdGUgX25hdGl2ZUVsZW1lbnQ6IGFueTtcbiAgICBwcml2YXRlIF9pbml0aWFsaXNlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2Rlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBncmlkUGFyYW1zOiBHcmlkUGFyYW1zO1xuXG4gICAgLy8gaW4gb3JkZXIgdG8gZW5zdXJlIGZpcmluZyBvZiBncmlkUmVhZHkgaXMgZGV0ZXJtaW5pc3RpY1xuICAgIHByaXZhdGUgX3Jlc29sdmVGdWxseVJlYWR5OiAoKSA9PiB2b2lkO1xuICAgIHByaXZhdGUgX2Z1bGx5UmVhZHk6IFByb21pc2U8dm9pZD4gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICB0aGlzLl9yZXNvbHZlRnVsbHlSZWFkeSA9IHJlc29sdmU7XG4gICAgfSk7XG5cbiAgICAvKiogR3JpZCBBcGkgYXZhaWxhYmxlIGFmdGVyIG9uR3JpZFJlYWR5IGV2ZW50IGhhcyBmaXJlZC4gKi9cbiAgICBwdWJsaWMgYXBpOiBHcmlkQXBpPFREYXRhPjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBlbGVtZW50RGVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgYW5ndWxhckZyYW1ld29ya092ZXJyaWRlczogQW5ndWxhckZyYW1ld29ya092ZXJyaWRlcyxcbiAgICAgICAgcHJpdmF0ZSBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiBBbmd1bGFyRnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlclxuICAgICkge1xuICAgICAgICB0aGlzLl9uYXRpdmVFbGVtZW50ID0gZWxlbWVudERlZi5uYXRpdmVFbGVtZW50O1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAgICAgLy8gUnVuIHRoZSBzZXR1cCBvdXRzaWRlIG9mIGFuZ3VsYXIgc28gYWxsIHRoZSBldmVudCBoYW5kbGVycyB0aGF0IGFyZSBjcmVhdGVkIGRvIG5vdCB0cmlnZ2VyIGNoYW5nZSBkZXRlY3Rpb25cbiAgICAgICAgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWV3b3JrQ29tcG9uZW50V3JhcHBlci5zZXRWaWV3Q29udGFpbmVyUmVmKHRoaXMudmlld0NvbnRhaW5lclJlZiwgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzKTtcbiAgICAgICAgICAgIGNvbnN0IG1lcmdlZEdyaWRPcHMgPSBfY29tYmluZUF0dHJpYnV0ZXNBbmRHcmlkT3B0aW9ucyh0aGlzLmdyaWRPcHRpb25zLCB0aGlzKTtcblxuICAgICAgICAgICAgdGhpcy5ncmlkUGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIGdsb2JhbEV2ZW50TGlzdGVuZXI6IHRoaXMuZ2xvYmFsRXZlbnRMaXN0ZW5lci5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGZyYW1ld29ya092ZXJyaWRlczogdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLFxuICAgICAgICAgICAgICAgIHByb3ZpZGVkQmVhbkluc3RhbmNlczoge1xuICAgICAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb21wb25lbnRXcmFwcGVyOiB0aGlzLmZyYW1ld29ya0NvbXBvbmVudFdyYXBwZXIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtb2R1bGVzOiAodGhpcy5tb2R1bGVzIHx8IFtdKSBhcyBhbnksXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBhcGkgPSBjcmVhdGVHcmlkKHRoaXMuX25hdGl2ZUVsZW1lbnQsIG1lcmdlZEdyaWRPcHMsIHRoaXMuZ3JpZFBhcmFtcyk7XG4gICAgICAgICAgICBpZiAoYXBpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcGkgPSBhcGk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2luaXRpYWxpc2VkID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gc29tZXRpbWVzLCBlc3BlY2lhbGx5IGluIGxhcmdlIGNsaWVudCBhcHBzIGdyaWRSZWFkeSBjYW4gZmlyZSBiZWZvcmUgbmdBZnRlclZpZXdJbml0XG4gICAgICAgICAgICAvLyB0aGlzIHRpZXMgdGhlc2UgdG9nZXRoZXIgc28gdGhhdCBncmlkUmVhZHkgd2lsbCBhbHdheXMgZmlyZSBhZnRlciBhZ0dyaWRBbmd1bGFyJ3MgbmdBZnRlclZpZXdJbml0XG4gICAgICAgICAgICAvLyB0aGUgYWN0dWFsIGNvbnRhaW5pbmcgY29tcG9uZW50J3MgbmdBZnRlclZpZXdJbml0IHdpbGwgZmlyZSBqdXN0IGFmdGVyIGFnR3JpZEFuZ3VsYXInc1xuICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZUZ1bGx5UmVhZHkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25DaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5faW5pdGlhbGlzZWQpIHtcbiAgICAgICAgICAgIC8vIFJ1biB0aGUgY2hhbmdlcyBvdXRzaWRlIG9mIGFuZ3VsYXIgc28gYW55IGV2ZW50IGhhbmRsZXJzIHRoYXQgYXJlIGNyZWF0ZWQgZG8gbm90IHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvblxuICAgICAgICAgICAgdGhpcy5hbmd1bGFyRnJhbWV3b3JrT3ZlcnJpZGVzLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBncmlkT3B0aW9uczogR3JpZE9wdGlvbnMgPSB7fTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhjaGFuZ2VzKS5mb3JFYWNoKChba2V5LCB2YWx1ZV06IFtzdHJpbmcsIGFueV0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZ3JpZE9wdGlvbnNba2V5IGFzIGtleW9mIEdyaWRPcHRpb25zXSA9IHZhbHVlLmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBfcHJvY2Vzc09uQ2hhbmdlKGdyaWRPcHRpb25zLCB0aGlzLmFwaSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2luaXRpYWxpc2VkKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIHRoZSBkZXN0cm95LCBzbyB3ZSBrbm93IG5vdCB0byBlbWl0IGFueSBldmVudHNcbiAgICAgICAgICAgIC8vIHdoaWxlIHRlYXJpbmcgZG93biB0aGUgZ3JpZC5cbiAgICAgICAgICAgIHRoaXMuX2Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgICAgICAvLyBjb3VsZCBiZSBudWxsIGlmIGdyaWQgZmFpbGVkIHRvIGluaXRpYWxpc2VcbiAgICAgICAgICAgIHRoaXMuYXBpPy5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSdsbCBlbWl0IHRoZSBlbWl0IGlmIGEgdXNlciBpcyBsaXN0ZW5pbmcgZm9yIGEgZ2l2ZW4gZXZlbnQgZWl0aGVyIG9uIHRoZSBjb21wb25lbnQgdmlhIG5vcm1hbCBhbmd1bGFyIGJpbmRpbmdcbiAgICAvLyBvciB2aWEgZ3JpZE9wdGlvbnNcbiAgICBwcm90ZWN0ZWQgaXNFbWl0dGVyVXNlZChldmVudFR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBlbWl0dGVyID0gPEV2ZW50RW1pdHRlcjxhbnk+Pig8YW55PnRoaXMpW2V2ZW50VHlwZV07XG4gICAgICAgIC8vIEZvciBSeEpzIGNvbXBhdGliaWxpdHkgd2UgbmVlZCB0byBjaGVjayBmb3Igb2JzZXJ2ZWQgdjcrIG9yIG9ic2VydmVycyB2NlxuICAgICAgICBjb25zdCBlbWl0dGVyQW55ID0gZW1pdHRlciBhcyBhbnk7XG4gICAgICAgIGNvbnN0IGhhc0VtaXR0ZXIgPSBlbWl0dGVyQW55Py5vYnNlcnZlZCA/PyBlbWl0dGVyQW55Py5vYnNlcnZlcnM/Lmxlbmd0aCA+IDA7XG5cbiAgICAgICAgLy8gZ3JpZFJlYWR5ID0+IG9uR3JpZFJlYWR5XG4gICAgICAgIGNvbnN0IGFzRXZlbnROYW1lID0gYG9uJHtldmVudFR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCl9JHtldmVudFR5cGUuc3Vic3RyaW5nKDEpfWA7XG4gICAgICAgIGNvbnN0IGhhc0dyaWRPcHRpb25MaXN0ZW5lciA9ICEhdGhpcy5ncmlkT3B0aW9ucyAmJiAhISh0aGlzLmdyaWRPcHRpb25zIGFzIGFueSlbYXNFdmVudE5hbWVdO1xuXG4gICAgICAgIHJldHVybiBoYXNFbWl0dGVyIHx8IGhhc0dyaWRPcHRpb25MaXN0ZW5lcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gaWYgd2UgYXJlIHRlYXJpbmcgZG93biwgZG9uJ3QgZW1pdCBhbmd1bGFyIGV2ZW50cywgYXMgdGhpcyBjYXVzZXNcbiAgICAgICAgLy8gcHJvYmxlbXMgd2l0aCB0aGUgYW5ndWxhciByb3V0ZXJcbiAgICAgICAgaWYgKHRoaXMuX2Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2VuZXJpY2FsbHkgbG9vayB1cCB0aGUgZXZlbnRUeXBlXG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSA8RXZlbnRFbWl0dGVyPGFueT4+KDxhbnk+dGhpcylbZXZlbnRUeXBlXTtcbiAgICAgICAgaWYgKGVtaXR0ZXIgJiYgdGhpcy5pc0VtaXR0ZXJVc2VkKGV2ZW50VHlwZSkpIHtcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBlbWl0IHdpdGhpbiB0aGUgYW5ndWxhciB6b25lLCBzbyBjaGFuZ2UgZGV0ZWN0aW9uIHdvcmtzIHByb3Blcmx5XG4gICAgICAgICAgICBjb25zdCBmaXJlRW1pdHRlciA9ICgpID0+IHRoaXMuYW5ndWxhckZyYW1ld29ya092ZXJyaWRlcy5ydW5JbnNpZGVBbmd1bGFyKCgpID0+IGVtaXR0ZXIuZW1pdChldmVudCkpO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlID09PSAnZ3JpZFJlYWR5Jykge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSB1c2VyIGlzIGxpc3RlbmluZyBmb3IgZ3JpZFJlYWR5LCB3YWl0IGZvciBuZ0FmdGVyVmlld0luaXQgdG8gZmlyZSBmaXJzdCwgdGhlbiBlbWl0IHRoZW4gZ3JpZFJlYWR5IGV2ZW50XG4gICAgICAgICAgICAgICAgdGhpcy5fZnVsbHlSZWFkeS50aGVuKCgpID0+IGZpcmVFbWl0dGVyKCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaXJlRW1pdHRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFByb3ZpZGVkIGFuIGluaXRpYWwgZ3JpZE9wdGlvbnMgY29uZmlndXJhdGlvbiB0byB0aGUgY29tcG9uZW50LiBJZiBhIHByb3BlcnR5IGlzIHNwZWNpZmllZCBpbiBib3RoIGdyaWRPcHRpb25zIGFuZCB2aWEgY29tcG9uZW50IGJpbmRpbmcgdGhlIGNvbXBvbmVudCBiaW5kaW5nIHRha2VzIHByZWNlZGVuY2UuICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncmlkT3B0aW9uczogR3JpZE9wdGlvbnM8VERhdGE+IHwgdW5kZWZpbmVkO1xuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gcmVnaXN0ZXIgQUcgR3JpZCBNb2R1bGVzIGRpcmVjdGx5IHdpdGggdGhpcyBpbnN0YW5jZSBvZiB0aGUgZ3JpZC5cbiAgICAgKiBTZWUgW1Byb3ZpZGluZyBNb2R1bGVzIFRvIEluZGl2aWR1YWwgR3JpZHNdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2FuZ3VsYXItZGF0YS1ncmlkL21vZHVsZXMvI3Byb3ZpZGluZy1tb2R1bGVzLXRvLWluZGl2aWR1YWwtZ3JpZHMpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBtb2R1bGVzOiBNb2R1bGVbXSB8IHVuZGVmaW5lZDtcblxuICAgIC8vIEBTVEFSVEBcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBzdGF0dXMgYmFyIGNvbXBvbmVudHMgdG8gdXNlIGluIHRoZSBzdGF0dXMgYmFyLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdGF0dXNCYXI6IHsgc3RhdHVzUGFuZWxzOiBTdGF0dXNQYW5lbERlZltdIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZmllcyB0aGUgc2lkZSBiYXIgY29tcG9uZW50cy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2lkZUJhcjogU2lkZUJhckRlZiB8IHN0cmluZyB8IHN0cmluZ1tdIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IHNob3cgdGhlIGNvbnRleHQgbWVudS4gVXNlIGlmIHlvdSBkb24ndCB3YW50IHRvIHVzZSB0aGUgZGVmYXVsdCAncmlnaHQgY2xpY2snIGNvbnRleHQgbWVudS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbnRleHRNZW51OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGBzdXBwcmVzc0NvbnRleHRNZW51YCwgeW91IGNhbiB1c2UgdGhlIGBvbkNlbGxDb250ZXh0TWVudWAgZnVuY3Rpb24gdG8gcHJvdmlkZSB5b3VyIG93biBjb2RlIHRvIGhhbmRsZSBjZWxsIGBjb250ZXh0bWVudWAgZXZlbnRzLlxuICAgICAqIFRoaXMgZmxhZyBpcyB1c2VmdWwgdG8gcHJldmVudCB0aGUgYnJvd3NlciBmcm9tIHNob3dpbmcgaXRzIGRlZmF1bHQgY29udGV4dCBtZW51LlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByZXZlbnREZWZhdWx0T25Db250ZXh0TWVudTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNvbnRleHQgbWVudSB0byBzaG93LCBldmVuIHdoZW4gYEN0cmxgIGtleSBpcyBoZWxkIGRvd24uXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dDb250ZXh0TWVudVdpdGhDb250cm9sS2V5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFuZ2VzIHRoZSBkaXNwbGF5IHR5cGUgb2YgdGhlIGNvbHVtbiBtZW51LlxuICAgICAqIGAnbmV3J2AganVzdCBkaXNwbGF5cyB0aGUgbWFpbiBsaXN0IG9mIG1lbnUgaXRlbXMuIGAnbGVnYWN5J2AgZGlzcGxheXMgYSB0YWJiZWQgbWVudS5cbiAgICAgKiBAZGVmYXVsdCAnbmV3J1xuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbk1lbnU6ICdsZWdhY3knIHwgJ25ldycgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgY29sdW1uIG1lbnUgYnV0dG9uIHdpbGwgYWx3YXlzIGJlIHNob3duLlxuICAgICAqIFdoZW4gYGZhbHNlLCB0aGUgY29sdW1uIG1lbnUgYnV0dG9uIHdpbGwgb25seSBzaG93IHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGNvbHVtbiBoZWFkZXIuXG4gICAgICogSWYgYGNvbHVtbk1lbnUgPSAnbGVnYWN5J2AsIHRoaXMgd2lsbCBkZWZhdWx0IHRvIGBmYWxzZWAgaW5zdGVhZCBvZiBgdHJ1ZWAuXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01lbnVIaWRlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHVzZSB0aGUgYnJvd3NlcidzIGRlZmF1bHQgdG9vbHRpcCBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBncmlkJ3MgVG9vbHRpcCBDb21wb25lbnQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVCcm93c2VyVG9vbHRpcHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSB0cmlnZ2VyIHRoYXQgd2lsbCBjYXVzZSB0b29sdGlwcyB0byBzaG93IGFuZCBoaWRlLlxuICAgICAqICAtIGBob3ZlcmAgLSBUaGUgdG9vbHRpcCB3aWxsIHNob3cvaGlkZSB3aGVuIGEgY2VsbC9oZWFkZXIgaXMgaG92ZXJlZC5cbiAgICAgKiAgLSBgZm9jdXNgIC0gVGhlIHRvb2x0aXAgd2lsbCBzaG93L2hpZGUgd2hlbiBhIGNlbGwvaGVhZGVyIGlzIGZvY3VzZWQuXG4gICAgICogQGRlZmF1bHQgJ2hvdmVyJ1xuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBUcmlnZ2VyOiAnaG92ZXInIHwgJ2ZvY3VzJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyB0aGF0IGl0IHRha2VzIGZvciB0b29sdGlwcyB0byBzaG93IHVwIG9uY2UgYW4gZWxlbWVudCBpcyBob3ZlcmVkIG92ZXIuXG4gICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgLlxuICAgICAqIEBkZWZhdWx0IDIwMDBcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcFNob3dEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIHRoYXQgaXQgdGFrZXMgZm9yIHRvb2x0aXBzIHRvIGhpZGUgb25jZSB0aGV5IGhhdmUgYmVlbiBkaXNwbGF5ZWQuXG4gICAgICogICAgICoqTm90ZToqKiBUaGlzIHByb3BlcnR5IGRvZXMgbm90IHdvcmsgaWYgYGVuYWJsZUJyb3dzZXJUb29sdGlwc2AgaXMgYHRydWVgIGFuZCBgdG9vbHRpcEhpZGVUcmlnZ2Vyc2AgaW5jbHVkZXMgYHRpbWVvdXRgLlxuICAgICAqIEBkZWZhdWx0IDEwMDAwXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBIaWRlRGVsYXk6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIHRvb2x0aXBzIGZvbGxvdyB0aGUgY3Vyc29yIG9uY2UgdGhleSBhcmUgZGlzcGxheWVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoaXMgZGVmaW5lcyB3aGVuIHRvb2x0aXAgd2lsbCBzaG93IHVwIGZvciBDZWxscywgSGVhZGVycyBhbmQgU2V0RmlsdGVyIEl0ZW1zLlxuICAgICAqICAtIGBzdGFuZGFyZGAgLSBUaGUgdG9vbHRpcCBhbHdheXMgc2hvd3MgdXAgd2hlbiB0aGUgaXRlbXMgY29uZmlndXJlZCB3aXRoIFRvb2x0aXBzIGFyZSBob3ZlcmVkLlxuICAgICAqIC0gYHdoZW5UcnVuY2F0ZWRgIC0gVGhlIHRvb2x0aXAgd2lsbCBvbmx5IGJlIGRpc3BsYXllZCB3aGVuIHRoZSBpdGVtcyBob3ZlcmVkIGhhdmUgdHJ1bmNhdGVkIChzaG93aW5nIGVsbGlwc2lzKSB2YWx1ZXMuIFRoaXMgcHJvcGVydHkgZG9lcyBub3Qgd29yayB3aGVuIGBlbmFibGVCcm93c2VyVG9vbHRpcHM9e3RydWV9YC5cbiAgICAgKiBAZGVmYXVsdCBgc3RhbmRhcmRgXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRvb2x0aXBTaG93TW9kZTogJ3N0YW5kYXJkJyB8ICd3aGVuVHJ1bmNhdGVkJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdG9vbHRpcCBpbnRlcmFjdGlvbi4gV2hlbiB0aGlzIG9wdGlvbiBpcyBlbmFibGVkLCB0aGUgdG9vbHRpcCB3aWxsIG5vdCBoaWRlIHdoaWxlIHRoZVxuICAgICAqIHRvb2x0aXAgaXRzZWxmIGl0IGJlaW5nIGhvdmVyZWQgb3IgaGFzIGZvY3VzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdG9vbHRpcEludGVyYWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBET00gZWxlbWVudCB0byB1c2UgYXMgdGhlIHBvcHVwIHBhcmVudCBmb3IgZ3JpZCBwb3B1cHMgKGNvbnRleHQgbWVudSwgY29sdW1uIG1lbnUgZXRjKS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcG9wdXBQYXJlbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHNvIGluY2x1ZGUgaGVhZGVycyB3aGVuIGNvcHlpbmcgdG8gY2xpcGJvYXJkIHVzaW5nIGBDdHJsICsgQ2AgY2xpcGJvYXJkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxzbyBpbmNsdWRlIGdyb3VwIGhlYWRlcnMgd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZCB1c2luZyBgQ3RybCArIENgIGNsaXBib2FyZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb3B5R3JvdXBIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNwZWNpZnkgdGhlIGRlbGltaXRlciB0byB1c2Ugd2hlbiBjb3B5aW5nIHRvIGNsaXBib2FyZC5cbiAgICAgKiBAZGVmYXVsdCAnXFx0J1xuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjbGlwYm9hcmREZWxpbWl0ZXI6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb3B5IHRoZSBjZWxsIHJhbmdlIG9yIGZvY3VzZWQgY2VsbCB0byB0aGUgY2xpcGJvYXJkIGFuZCBuZXZlciB0aGUgc2VsZWN0ZWQgcm93cy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29weSByb3dzIGluc3RlYWQgb2YgcmFuZ2VzIHdoZW4gYSByYW5nZSB3aXRoIG9ubHkgYSBzaW5nbGUgY2VsbCBpcyBzZWxlY3RlZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvcHlTaW5nbGVDZWxsUmFuZ2VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHdvcmsgYXJvdW5kIGEgYnVnIHdpdGggRXhjZWwgKFdpbmRvd3MpIHRoYXQgYWRkcyBhbiBleHRyYSBlbXB0eSBsaW5lIGF0IHRoZSBlbmQgb2YgcmFuZ2VzIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTGFzdEVtcHR5TGluZU9uUGFzdGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvZmYgcGFzdGUgb3BlcmF0aW9ucyB3aXRoaW4gdGhlIGdyaWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdG9wIHRoZSBncmlkIHRyeWluZyB0byB1c2UgdGhlIENsaXBib2FyZCBBUEksIGlmIGl0IGlzIGJsb2NrZWQsIGFuZCBpbW1lZGlhdGVseSBmYWxsYmFjayB0byB0aGUgd29ya2Fyb3VuZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaXBib2FyZEFwaTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBibG9jayAgICAgKipjdXQqKiBvcGVyYXRpb25zIHdpdGhpbiB0aGUgZ3JpZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0N1dFRvQ2xpcGJvYXJkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBcnJheSBvZiBDb2x1bW4gLyBDb2x1bW4gR3JvdXAgZGVmaW5pdGlvbnMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbHVtbkRlZnM6IChUQ29sRGVmIHwgQ29sR3JvdXBEZWY8VERhdGE+KVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uLiBJdGVtcyBkZWZpbmVkIGluIHRoZSBhY3R1YWwgY29sdW1uIGRlZmluaXRpb25zIGdldCBwcmVjZWRlbmNlLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q29sRGVmOiBDb2xEZWY8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29sdW1uIGdyb3VwIGRlZmluaXRpb24uIEFsbCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbnMgd2lsbCB1c2UgdGhlc2UgcHJvcGVydGllcy4gSXRlbXMgZGVmaW5lZCBpbiB0aGUgYWN0dWFsIGNvbHVtbiBncm91cCBkZWZpbml0aW9uIGdldCBwcmVjZWRlbmNlLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlZmF1bHRDb2xHcm91cERlZjogUGFydGlhbDxDb2xHcm91cERlZjxURGF0YT4+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3QgbWFwIG9mIGN1c3RvbSBjb2x1bW4gdHlwZXMgd2hpY2ggY29udGFpbiBncm91cHMgb2YgcHJvcGVydGllcyB0aGF0IGNvbHVtbiBkZWZpbml0aW9ucyBjYW4gcmV1c2UgYnkgcmVmZXJlbmNpbmcgaW4gdGhlaXIgYHR5cGVgIHByb3BlcnR5LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb2x1bW5UeXBlczogeyBba2V5OiBzdHJpbmddOiBDb2xUeXBlRGVmPFREYXRhPiB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbiBvYmplY3QgbWFwIG9mIGNlbGwgZGF0YSB0eXBlcyB0byB0aGVpciBkZWZpbml0aW9ucy5cbiAgICAgKiBDZWxsIGRhdGEgdHlwZXMgY2FuIGVpdGhlciBvdmVycmlkZS91cGRhdGUgdGhlIHByZS1kZWZpbmVkIGRhdGEgdHlwZXNcbiAgICAgKiAoYCd0ZXh0J2AsIGAnbnVtYmVyJ2AsICBgJ2Jvb2xlYW4nYCwgIGAnZGF0ZSdgLCAgYCdkYXRlU3RyaW5nJ2Agb3IgIGAnb2JqZWN0J2ApLFxuICAgICAqIG9yIGNhbiBiZSBjdXN0b20gZGF0YSB0eXBlcy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0YVR5cGVEZWZpbml0aW9uczpcbiAgICAgICAgfCB7XG4gICAgICAgICAgICAgIFtjZWxsRGF0YVR5cGU6IHN0cmluZ106IERhdGFUeXBlRGVmaW5pdGlvbjxURGF0YT47XG4gICAgICAgICAgfVxuICAgICAgICB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogS2VlcHMgdGhlIG9yZGVyIG9mIENvbHVtbnMgbWFpbnRhaW5lZCBhZnRlciBuZXcgQ29sdW1uIERlZmluaXRpb25zIGFyZSB1cGRhdGVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlbiBkb3RzIGluIGZpZWxkIG5hbWVzIChlLmcuIGAnYWRkcmVzcy5maXJzdExpbmUnYCkgYXJlIG5vdCB0cmVhdGVkIGFzIGRlZXAgcmVmZXJlbmNlcy4gQWxsb3dzIHlvdSB0byB1c2UgZG90cyBpbiB5b3VyIGZpZWxkIG5hbWUgaWYgeW91IHByZWZlci5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0ZpZWxkRG90Tm90YXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93IGNvbnRhaW5pbmcgdGhlIGNvbHVtbiBsYWJlbCBoZWFkZXIuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgdGhlIHRoZW1lIHZhbHVlIG9mIGBoZWFkZXItaGVpZ2h0YC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaGVhZGVySGVpZ2h0OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRoZSBoZWlnaHQgaW4gcGl4ZWxzIGZvciB0aGUgcm93cyBjb250YWluaW5nIGhlYWRlciBjb2x1bW4gZ3JvdXBzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIGBoZWFkZXJIZWlnaHRgLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBmbG9hdGluZyBmaWx0ZXJzLiBJZiBub3Qgc3BlY2lmaWVkLCBpdCB1c2VzIHRoZSB0aGVtZSB2YWx1ZSBvZiBgaGVhZGVyLWhlaWdodGAuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgaGVpZ2h0IGluIHBpeGVscyBmb3IgdGhlIHJvdyBjb250YWluaW5nIHRoZSBjb2x1bW5zIHdoZW4gaW4gcGl2b3QgbW9kZS4gSWYgbm90IHNwZWNpZmllZCwgaXQgdXNlcyBgaGVhZGVySGVpZ2h0YC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RIZWFkZXJIZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGhlaWdodCBpbiBwaXhlbHMgZm9yIHRoZSByb3cgY29udGFpbmluZyBoZWFkZXIgY29sdW1uIGdyb3VwcyB3aGVuIGluIHBpdm90IG1vZGUuIElmIG5vdCBzcGVjaWZpZWQsIGl0IHVzZXMgYGdyb3VwSGVhZGVySGVpZ2h0YC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RHcm91cEhlYWRlckhlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvdyByZW9yZGVyaW5nIGFuZCBwaW5uaW5nIGNvbHVtbnMgYnkgZHJhZ2dpbmcgY29sdW1ucyBmcm9tIHRoZSBDb2x1bW5zIFRvb2wgUGFuZWwgdG8gdGhlIGdyaWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWxsb3dEcmFnRnJvbUNvbHVtbnNUb29sUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3MgY29sdW1uIG1vdmluZywgaS5lLiB0byBtYWtlIHRoZSBjb2x1bW5zIGZpeGVkIHBvc2l0aW9uLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92YWJsZUNvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlIGBhZy1jb2x1bW4tbW92aW5nYCBjbGFzcyBpcyBub3QgYWRkZWQgdG8gdGhlIGdyaWQgd2hpbGUgY29sdW1ucyBhcmUgbW92aW5nLiBJbiB0aGUgZGVmYXVsdCB0aGVtZXMsIHRoaXMgcmVzdWx0cyBpbiBubyBhbmltYXRpb24gd2hlbiBtb3ZpbmcgY29sdW1ucy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtbk1vdmVBbmltYXRpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgd2hlbiB5b3UgZHJhZyBhIGNvbHVtbiBvdXQgb2YgdGhlIGdyaWQgKGUuZy4gdG8gdGhlIGdyb3VwIHpvbmUpIHRoZSBjb2x1bW4gaXMgbm90IGhpZGRlbi5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0RyYWdMZWF2ZUhpZGVzQ29sdW1uczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB3aGVuIHlvdSBkcmFnIGEgY29sdW1uIGludG8gYSByb3cgZ3JvdXAgcGFuZWwgdGhlIGNvbHVtbiBpcyBub3QgaGlkZGVuLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93R3JvdXBIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgJ3NoaWZ0J2AgdG8gaGF2ZSBzaGlmdC1yZXNpemUgYXMgdGhlIGRlZmF1bHQgcmVzaXplIG9wZXJhdGlvbiAoc2FtZSBhcyB1c2VyIGhvbGRpbmcgZG93biBgU2hpZnRgIHdoaWxlIHJlc2l6aW5nKS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sUmVzaXplRGVmYXVsdDogJ3NoaWZ0JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3VwcHJlc3NlcyBhdXRvLXNpemluZyBjb2x1bW5zIGZvciBjb2x1bW5zLiBJbiBvdGhlciB3b3JkcywgZG91YmxlIGNsaWNraW5nIGEgY29sdW1uJ3MgaGVhZGVyJ3MgZWRnZSB3aWxsIG5vdCBhdXRvLXNpemUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBOdW1iZXIgb2YgcGl4ZWxzIHRvIGFkZCB0byBhIGNvbHVtbiB3aWR0aCBhZnRlciB0aGUgW2F1dG8tc2l6aW5nXSguL2NvbHVtbi1zaXppbmcvI2F1dG8tc2l6ZS1jb2x1bW5zLXRvLWZpdC1jZWxsLWNvbnRlbnRzKSBjYWxjdWxhdGlvbi5cbiAgICAgKiBTZXQgdGhpcyBpZiB5b3Ugd2FudCB0byBhZGQgZXh0cmEgcm9vbSB0byBhY2NvbW1vZGF0ZSAoZm9yIGV4YW1wbGUpIHNvcnQgaWNvbnMsIG9yIHNvbWUgb3RoZXIgZHluYW1pYyBuYXR1cmUgb2YgdGhlIGhlYWRlci5cbiAgICAgKiBAZGVmYXVsdCAyMFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvU2l6ZVBhZGRpbmc6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoaXMgdG8gYHRydWVgIHRvIHNraXAgdGhlIGBoZWFkZXJOYW1lYCB3aGVuIGBhdXRvU2l6ZWAgaXMgY2FsbGVkIGJ5IGRlZmF1bHQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBza2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXV0by1zaXplIHRoZSBjb2x1bW5zIHdoZW4gdGhlIGdyaWQgaXMgbG9hZGVkLiBDYW4gc2l6ZSB0byBmaXQgdGhlIGdyaWQgd2lkdGgsIGZpdCBhIHByb3ZpZGVkIHdpZHRoLCBvciBmaXQgdGhlIGNlbGwgY29udGVudHMuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXV0b1NpemVTdHJhdGVneTpcbiAgICAgICAgfCBTaXplQ29sdW1uc1RvRml0R3JpZFN0cmF0ZWd5XG4gICAgICAgIHwgU2l6ZUNvbHVtbnNUb0ZpdFByb3ZpZGVkV2lkdGhTdHJhdGVneVxuICAgICAgICB8IFNpemVDb2x1bW5zVG9Db250ZW50U3RyYXRlZ3lcbiAgICAgICAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEEgbWFwIG9mIGNvbXBvbmVudCBuYW1lcyB0byBjb21wb25lbnRzLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNvbXBvbmVudHM6IHsgW3A6IHN0cmluZ106IGFueSB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdmdWxsUm93J2AgdG8gZW5hYmxlIEZ1bGwgUm93IEVkaXRpbmcuIE90aGVyd2lzZSBsZWF2ZSBibGFuayB0byBlZGl0IG9uZSBjZWxsIGF0IGEgdGltZS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZWRpdFR5cGU6ICdmdWxsUm93JyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgU2luZ2xlIENsaWNrIEVkaXRpbmcgZm9yIGNlbGxzLCB0byBzdGFydCBlZGl0aW5nIHdpdGggYSBzaW5nbGUgY2xpY2suXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2luZ2xlQ2xpY2tFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHNvIHRoYXQgbmVpdGhlciBzaW5nbGUgbm9yIGRvdWJsZSBjbGljayBzdGFydHMgZWRpdGluZy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NsaWNrRWRpdDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdG9wIHRoZSBncmlkIHVwZGF0aW5nIGRhdGEgYWZ0ZXIgYEVkaXRgLCBgQ2xpcGJvYXJkYCBhbmQgYEZpbGwgSGFuZGxlYCBvcGVyYXRpb25zLiBXaGVuIHRoaXMgaXMgc2V0LCBpdCBpcyBpbnRlbmRlZCB0aGUgYXBwbGljYXRpb24gd2lsbCB1cGRhdGUgdGhlIGRhdGEsIGVnIGluIGFuIGV4dGVybmFsIGltbXV0YWJsZSBzdG9yZSwgYW5kIHRoZW4gcGFzcyB0aGUgbmV3IGRhdGFzZXQgdG8gdGhlIGdyaWQuIDxiciAvPioqTm90ZToqKiBgcm93Tm9kZS5zZXREYXRhVmFsdWUoKWAgZG9lcyBub3QgdXBkYXRlIHRoZSB2YWx1ZSBvZiB0aGUgY2VsbCB3aGVuIHRoaXMgaXMgYFRydWVgLCBpdCBmaXJlcyBgb25DZWxsRWRpdFJlcXVlc3RgIGluc3RlYWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVhZE9ubHlFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gc3RvcCBjZWxsIGVkaXRpbmcgd2hlbiBncmlkIGxvc2VzIGZvY3VzLlxuICAgICAqIFRoZSBkZWZhdWx0IGlzIHRoYXQgdGhlIGdyaWQgc3RheXMgZWRpdGluZyB1bnRpbCBmb2N1cyBnb2VzIG9udG8gYW5vdGhlciBjZWxsLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgYWxvbmcgd2l0aCBgZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5QWZ0ZXJFZGl0YCB0byBoYXZlIEV4Y2VsLXN0eWxlIGJlaGF2aW91ciBmb3IgdGhlIGBFbnRlcmAga2V5LlxuICAgICAqIGkuZS4gcHJlc3NpbmcgdGhlIGBFbnRlcmAga2V5IHdpbGwgbW92ZSBkb3duIHRvIHRoZSBjZWxsIGJlbmVhdGggYW5kIGBTaGlmdCtFbnRlcmAgd2lsbCBtb3ZlIHVwIHRvIHRoZSBjZWxsIGFib3ZlLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVudGVyTmF2aWdhdGVzVmVydGljYWxseTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBhbG9uZyB3aXRoIGBlbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHlgIHRvIGhhdmUgRXhjZWwtc3R5bGUgYmVoYXZpb3VyIGZvciB0aGUgJ0VudGVyJyBrZXkuXG4gICAgICogaS5lLiBwcmVzc2luZyB0aGUgRW50ZXIga2V5IHdpbGwgbW92ZSBkb3duIHRvIHRoZSBjZWxsIGJlbmVhdGggYW5kIFNoaWZ0K0VudGVyIGtleSB3aWxsIG1vdmUgdXAgdG8gdGhlIGNlbGwgYWJvdmUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW50ZXJOYXZpZ2F0ZXNWZXJ0aWNhbGx5QWZ0ZXJFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBGb3JjZXMgQ2VsbCBFZGl0aW5nIHRvIHN0YXJ0IHdoZW4gYmFja3NwYWNlIGlzIHByZXNzZWQuIFRoaXMgaXMgb25seSByZWxldmFudCBmb3IgTWFjT1MgdXNlcnMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxFZGl0aW5nT25CYWNrc3BhY2U6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIFVuZG8gLyBSZWRvIHdoaWxlIGVkaXRpbmcuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5kb1JlZG9DZWxsRWRpdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBzaXplIG9mIHRoZSB1bmRvIC8gcmVkbyBzdGFjay5cbiAgICAgKiBAZGVmYXVsdCAxMFxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHVuZG9SZWRvQ2VsbEVkaXRpbmdMaW1pdDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBleHBvcnQgdG8gQ1NWLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0Q3N2RXhwb3J0UGFyYW1zOiBDc3ZFeHBvcnRQYXJhbXMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByZXZlbnRzIHRoZSB1c2VyIGZyb20gZXhwb3J0aW5nIHRoZSBncmlkIHRvIENTVi5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NzdkV4cG9ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IHVzZWQgdG8gZXhwb3J0IHRvIEV4Y2VsLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZWZhdWx0RXhjZWxFeHBvcnRQYXJhbXM6IEV4Y2VsRXhwb3J0UGFyYW1zIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcmV2ZW50cyB0aGUgdXNlciBmcm9tIGV4cG9ydGluZyB0aGUgZ3JpZCB0byBFeGNlbC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0V4Y2VsRXhwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGxpc3QgKGFycmF5KSBvZiBFeGNlbCBzdHlsZXMgdG8gYmUgdXNlZCB3aGVuIGV4cG9ydGluZyB0byBFeGNlbCB3aXRoIHN0eWxlcy5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNlbFN0eWxlczogRXhjZWxTdHlsZVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSb3dzIGFyZSBmaWx0ZXJlZCB1c2luZyB0aGlzIHRleHQgYXMgYSBRdWljayBGaWx0ZXIuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHF1aWNrRmlsdGVyVGV4dDogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHR1cm4gb24gdGhlIFF1aWNrIEZpbHRlciBjYWNoZSwgdXNlZCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlIHdoZW4gdXNpbmcgdGhlIFF1aWNrIEZpbHRlci5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhpZGRlbiBjb2x1bW5zIGFyZSBleGNsdWRlZCBmcm9tIHRoZSBRdWljayBGaWx0ZXIgYnkgZGVmYXVsdC5cbiAgICAgKiBUbyBpbmNsdWRlIGhpZGRlbiBjb2x1bW5zLCBzZXQgdG8gYHRydWVgLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGluY2x1ZGVIaWRkZW5Db2x1bW5zSW5RdWlja0ZpbHRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2hhbmdlcyBob3cgdGhlIFF1aWNrIEZpbHRlciBzcGxpdHMgdGhlIFF1aWNrIEZpbHRlciB0ZXh0IGludG8gc2VhcmNoIHRlcm1zLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlclBhcnNlcjogKChxdWlja0ZpbHRlcjogc3RyaW5nKSA9PiBzdHJpbmdbXSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENoYW5nZXMgdGhlIG1hdGNoaW5nIGxvZ2ljIGZvciB3aGV0aGVyIGEgcm93IHBhc3NlcyB0aGUgUXVpY2sgRmlsdGVyLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBxdWlja0ZpbHRlck1hdGNoZXI6XG4gICAgICAgIHwgKChxdWlja0ZpbHRlclBhcnRzOiBzdHJpbmdbXSwgcm93UXVpY2tGaWx0ZXJBZ2dyZWdhdGVUZXh0OiBzdHJpbmcpID0+IGJvb2xlYW4pXG4gICAgICAgIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHBpdm90aW5nLCBRdWljayBGaWx0ZXIgaXMgb25seSBhcHBsaWVkIG9uIHRoZSBwaXZvdGVkIGRhdGFcbiAgICAgKiAob3IgYWdncmVnYXRlZCBkYXRhIGlmIGBncm91cEFnZ0ZpbHRlcmluZyA9IHRydWVgKS5cbiAgICAgKiBTZXQgdG8gYHRydWVgIHRvIGFwcGx5IFF1aWNrIEZpbHRlciBiZWZvcmUgcGl2b3RpbmcgKC9hZ2dyZWdhdGluZykgaW5zdGVhZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhcHBseVF1aWNrRmlsdGVyQmVmb3JlUGl2b3RPckFnZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCB0cmVlIGRhdGEgZmlsdGVyaW5nIGJlaGF2aW91ciB0byBpbnN0ZWFkIGV4Y2x1ZGUgY2hpbGQgbm9kZXMgZnJvbSBmaWx0ZXIgcmVzdWx0cy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBleGNsdWRlQ2hpbGRyZW5XaGVuVHJlZURhdGFGaWx0ZXJpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byB0cnVlIHRvIGVuYWJsZSB0aGUgQWR2YW5jZWQgRmlsdGVyLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUFkdmFuY2VkRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBAZGVwcmVjYXRlZCBBcyBvZiB2MzEsIHVzZSBgaW5pdGlhbFN0YXRlLmZpbHRlci5hZHZhbmNlZEZpbHRlck1vZGVsYCBpbnN0ZWFkLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFkdmFuY2VkRmlsdGVyTW9kZWw6IEFkdmFuY2VkRmlsdGVyTW9kZWwgfCBudWxsIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIaWRkZW4gY29sdW1ucyBhcmUgZXhjbHVkZWQgZnJvbSB0aGUgQWR2YW5jZWQgRmlsdGVyIGJ5IGRlZmF1bHQuXG4gICAgICogVG8gaW5jbHVkZSBoaWRkZW4gY29sdW1ucywgc2V0IHRvIGB0cnVlYC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbmNsdWRlSGlkZGVuQ29sdW1uc0luQWR2YW5jZWRGaWx0ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERPTSBlbGVtZW50IHRvIHVzZSBhcyB0aGUgcGFyZW50IGZvciB0aGUgQWR2YW5jZWQgRmlsdGVyIHRvIGFsbG93IGl0IHRvIGFwcGVhciBvdXRzaWRlIG9mIHRoZSBncmlkLlxuICAgICAqIFNldCB0byBgbnVsbGAgb3IgYHVuZGVmaW5lZGAgdG8gYXBwZWFyIGluc2lkZSB0aGUgZ3JpZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWR2YW5jZWRGaWx0ZXJQYXJlbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byB0aGUgQWR2YW5jZWQgRmlsdGVyIEJ1aWxkZXIuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFkdmFuY2VkRmlsdGVyQnVpbGRlclBhcmFtczogSUFkdmFuY2VkRmlsdGVyQnVpbGRlclBhcmFtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQnkgZGVmYXVsdCwgQWR2YW5jZWQgRmlsdGVyIHNhbml0aXNlcyB1c2VyIGlucHV0IGFuZCBwYXNzZXMgaXQgdG8gYG5ldyBGdW5jdGlvbigpYCB0byBwcm92aWRlIHRoZSBiZXN0IHBlcmZvcm1hbmNlLlxuICAgICAqIFNldCB0byBgdHJ1ZWAgdG8gcHJldmVudCB0aGlzIGFuZCB1c2UgZGVmaW5lZCBmdW5jdGlvbnMgaW5zdGVhZC5cbiAgICAgKiBUaGlzIHdpbGwgcmVzdWx0IGluIHNsb3dlciBmaWx0ZXJpbmcsIGJ1dCBpdCBlbmFibGVzIEFkdmFuY2VkIEZpbHRlciB0byB3b3JrIHdoZW4gYHVuc2FmZS1ldmFsYCBpcyBkaXNhYmxlZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0FkdmFuY2VkRmlsdGVyRXZhbDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBFbmFibGUgQ2hhcnRzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNoYXJ0czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGxpc3Qgb2YgY2hhcnQgdGhlbWVzIHRoYXQgYSB1c2VyIGNhbiBjaG9vc2UgZnJvbSBpbiB0aGUgY2hhcnQgcGFuZWwuXG4gICAgICogQGRlZmF1bHQgWydhZy1kZWZhdWx0JywgJ2FnLW1hdGVyaWFsJywgJ2FnLXNoZWV0cycsICdhZy1wb2x5Y2hyb21hJywgJ2FnLXZpdmlkJ107XG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUaGVtZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBjb250YWluaW5nIGN1c3RvbSBjaGFydCB0aGVtZXMuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY3VzdG9tQ2hhcnRUaGVtZXM6IHsgW25hbWU6IHN0cmluZ106IEFnQ2hhcnRUaGVtZSB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFydCB0aGVtZSBvdmVycmlkZXMgYXBwbGllZCB0byBhbGwgdGhlbWVzLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNoYXJ0VGhlbWVPdmVycmlkZXM6IEFnQ2hhcnRUaGVtZU92ZXJyaWRlcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGN1c3RvbWlzYXRpb24gb2YgdGhlIENoYXJ0IFRvb2wgUGFuZWxzLCBzdWNoIGFzIGNoYW5naW5nIHRoZSB0b29sIHBhbmVscyB2aXNpYmlsaXR5IGFuZCBvcmRlciwgYXMgd2VsbCBhcyBjaG9vc2luZyB3aGljaCBjaGFydHMgc2hvdWxkIGJlIGRpc3BsYXllZCBpbiB0aGUgY2hhcnQgcGFuZWwuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRUb29sUGFuZWxzRGVmOiBDaGFydFRvb2xQYW5lbHNEZWYgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEdldCBjaGFydCBtZW51IGl0ZW1zLiBPbmx5IGFwcGxpZXMgd2hlbiB1c2luZyBBRyBDaGFydHMgRW50ZXJwcmlzZS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2hhcnRNZW51SXRlbXM6IChzdHJpbmcgfCBNZW51SXRlbURlZilbXSB8IEdldENoYXJ0TWVudUl0ZW1zPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBsb2FkaW5nIGNlbGwgcmVuZGVyZXIgdG8gdXNlIHdoZW4gZGF0YSBpcyBsb2FkaW5nIHZpYSBhIERhdGFTb3VyY2UuXG4gICAgICogU2VlIFtMb2FkaW5nIENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2NvbXBvbmVudC1sb2FkaW5nLWNlbGwtcmVuZGVyZXIvKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvYWRpbmdDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogUGFyYW1zIHRvIGJlIHBhc3NlZCB0byB0aGUgYGxvYWRpbmdDZWxsUmVuZGVyZXJgIGNvbXBvbmVudC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ0NlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBzZWxlY3Qgd2hpY2ggbG9hZGluZyBjZWxsIHJlbmRlcmVyIHRvIGJlIHVzZWQgd2hlbiBkYXRhIGlzIGxvYWRpbmcgdmlhIGEgRGF0YVNvdXJjZS5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nQ2VsbFJlbmRlcmVyU2VsZWN0b3I6IExvYWRpbmdDZWxsUmVuZGVyZXJTZWxlY3RvckZ1bmM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiBrZXktPnZhbHVlIHBhaXJzIGZvciBsb2NhbGlzaW5nIHRleHQgd2l0aGluIHRoZSBncmlkLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGxvY2FsZVRleHQ6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIE1hc3RlciBEZXRhaWwuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGtlZXAgZGV0YWlsIHJvd3MgZm9yIHdoZW4gdGhleSBhcmUgZGlzcGxheWVkIGFnYWluLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMga2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldHMgdGhlIG51bWJlciBvZiBkZXRhaWxzIHJvd3MgdG8ga2VlcC5cbiAgICAgKiBAZGVmYXVsdCAxMFxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGtlZXBEZXRhaWxSb3dzQ291bnQ6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIGN1c3RvbSBgZGV0YWlsQ2VsbFJlbmRlcmVyYCB0byB1c2Ugd2hlbiBhIG1hc3RlciByb3cgaXMgZXhwYW5kZWQuXG4gICAgICogU2VlIFtEZXRhaWwgQ2VsbCBSZW5kZXJlcl0oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvbWFzdGVyLWRldGFpbC1jdXN0b20tZGV0YWlsLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkZXRhaWxDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIHRoZSBwYXJhbXMgdG8gYmUgdXNlZCBieSB0aGUgRGV0YWlsIENlbGwgUmVuZGVyZXIuIENhbiBhbHNvIGJlIGEgZnVuY3Rpb24gdGhhdCBwcm92aWRlcyB0aGUgcGFyYW1zIHRvIGVuYWJsZSBkeW5hbWljIGRlZmluaXRpb25zIG9mIHRoZSBwYXJhbXMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgZml4ZWQgaGVpZ2h0IGluIHBpeGVscyBmb3IgZWFjaCBkZXRhaWwgcm93LlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIGRldGFpbCBncmlkIGR5bmFtaWNhbGx5IGNoYW5nZSBpdCdzIGhlaWdodCB0byBmaXQgaXQncyByb3dzLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGVzIGEgY29udGV4dCBvYmplY3QgdGhhdCBpcyBwcm92aWRlZCB0byBkaWZmZXJlbnQgY2FsbGJhY2tzIHRoZSBncmlkIHVzZXMuIFVzZWQgZm9yIHBhc3NpbmcgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB0byB0aGUgY2FsbGJhY2tzIHVzZWQgYnkgeW91ciBhcHBsaWNhdGlvbi5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjb250ZXh0OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqXG4gICAgICogQSBsaXN0IG9mIGdyaWRzIHRvIHRyZWF0IGFzIEFsaWduZWQgR3JpZHMuXG4gICAgICogUHJvdmlkZSBhIGxpc3QgaWYgdGhlIGdyaWRzIC8gYXBpcyBhbHJlYWR5IGV4aXN0IG9yIHJldHVybiB2aWEgYSBjYWxsYmFjayB0byBhbGxvdyB0aGUgYWxpZ25lZCBncmlkcyB0byBiZSByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuXG4gICAgICogSWYgZ3JpZHMgYXJlIGFsaWduZWQgdGhlbiB0aGUgY29sdW1ucyBhbmQgaG9yaXpvbnRhbCBzY3JvbGxpbmcgd2lsbCBiZSBrZXB0IGluIHN5bmMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsaWduZWRHcmlkczogKEFsaWduZWRHcmlkW10gfCAoKCkgPT4gQWxpZ25lZEdyaWRbXSkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDaGFuZ2UgdGhpcyB2YWx1ZSB0byBzZXQgdGhlIHRhYkluZGV4IG9yZGVyIG9mIHRoZSBHcmlkIHdpdGhpbiB5b3VyIGFwcGxpY2F0aW9uLlxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB0YWJJbmRleDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgbnVtYmVyIG9mIHJvd3MgcmVuZGVyZWQgb3V0c2lkZSB0aGUgdmlld2FibGUgYXJlYSB0aGUgZ3JpZCByZW5kZXJzLlxuICAgICAqIEhhdmluZyBhIGJ1ZmZlciBtZWFucyB0aGUgZ3JpZCB3aWxsIGhhdmUgcm93cyByZWFkeSB0byBzaG93IGFzIHRoZSB1c2VyIHNsb3dseSBzY3JvbGxzIHZlcnRpY2FsbHkuXG4gICAgICogQGRlZmF1bHQgMTBcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93QnVmZmVyOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gdHVybiBvbiB0aGUgdmFsdWUgY2FjaGUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGNvbmZpZ3VyZSB0aGUgdmFsdWUgY2FjaGUgdG8gbm90IGV4cGlyZSBhZnRlciBkYXRhIHVwZGF0ZXMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyB2YWx1ZUNhY2hlTmV2ZXJFeHBpcmVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsbG93IGNlbGwgZXhwcmVzc2lvbnMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsRXhwcmVzc2lvbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHRvdWNoIHN1cHBvcnQgKGJ1dCBkb2VzIG5vdCByZW1vdmUgdGhlIGJyb3dzZXIncyBlZmZvcnRzIHRvIHNpbXVsYXRlIG1vdXNlIGV2ZW50cyBvbiB0b3VjaCkuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIG5vdCBzZXQgZm9jdXMgYmFjayBvbiB0aGUgZ3JpZCBhZnRlciBhIHJlZnJlc2guIFRoaXMgY2FuIGF2b2lkIGlzc3VlcyB3aGVyZSB5b3Ugd2FudCB0byBrZWVwIHRoZSBmb2N1cyBvbiBhbm90aGVyIHBhcnQgb2YgdGhlIGJyb3dzZXIuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NGb2N1c0FmdGVyUmVmcmVzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRGlzYWJsZXMgdGhlIGFzeW5jaHJvbm91cyBuYXR1cmUgb2YgdGhlIGV2ZW50cyBpbnRyb2R1Y2VkIGluIHYxMCwgYW5kIG1ha2VzIHRoZW0gc3luY2hyb25vdXMuIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgZm9yIHRoZSBwdXJwb3NlIG9mIHN1cHBvcnRpbmcgbGVnYWN5IGNvZGUgd2hpY2ggaGFzIGEgZGVwZW5kZW5jeSBvbiBzeW5jaHJvbm91cyBldmVudHMgZnJvbSBlYXJsaWVyIHZlcnNpb25zICh2OSBvciBlYXJsaWVyKSBvZiBBRyBHcmlkLiAgICAgKipJdCBpcyBzdHJvbmdseSByZWNvbW1lbmRlZCB0aGF0IHlvdSBkbyBub3QgY2hhbmdlIHRoaXMgcHJvcGVydHkgdW5sZXNzIHlvdSBoYXZlIGxlZ2FjeSBpc3N1ZXMuKipcbiAgICAgKiBAZGVwcmVjYXRlZCB2MzEgRXZlbnRzIHNob3VsZCBiZSBoYW5kbGVkIGFzeW5jaHJvbm91c2x5LlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBc3luY0V2ZW50czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIGdyaWQgd2lsbCBjaGVjayBmb3IgYFJlc2l6ZU9ic2VydmVyYCBhbmQgdXNlIGl0IGlmIGl0IGV4aXN0cyBpbiB0aGUgYnJvd3Nlciwgb3RoZXJ3aXNlIGl0IHdpbGwgdXNlIHRoZSBncmlkJ3MgYWx0ZXJuYXRpdmUgaW1wbGVtZW50YXRpb24uIFNvbWUgdXNlcnMgcmVwb3J0ZWQgaXNzdWVzIHdpdGggQ2hyb21lJ3MgYFJlc2l6ZU9ic2VydmVyYC4gVXNlIHRoaXMgcHJvcGVydHkgdG8gYWx3YXlzIHVzZSB0aGUgZ3JpZCdzIGFsdGVybmF0aXZlIGltcGxlbWVudGF0aW9uIHNob3VsZCBzdWNoIHByb2JsZW1zIGV4aXN0LlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NCcm93c2VyUmVzaXplT2JzZXJ2ZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIERpc2FibGVzIHNob3dpbmcgYSB3YXJuaW5nIG1lc3NhZ2UgaW4gdGhlIGNvbnNvbGUgaWYgdXNpbmcgYSBgZ3JpZE9wdGlvbnNgIG9yIGBjb2xEZWZgIHByb3BlcnR5IHRoYXQgZG9lc24ndCBleGlzdC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJvcGVydHlOYW1lc0NoZWNrOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2hhbmdlRGV0ZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdGhpcyB0byBgdHJ1ZWAgdG8gZW5hYmxlIGRlYnVnIGluZm9ybWF0aW9uIGZyb20gdGhlIGdyaWQgYW5kIHJlbGF0ZWQgY29tcG9uZW50cy4gV2lsbCByZXN1bHQgaW4gYWRkaXRpb25hbCBsb2dnaW5nIGJlaW5nIG91dHB1dCwgYnV0IHZlcnkgdXNlZnVsIHdoZW4gaW52ZXN0aWdhdGluZyBwcm9ibGVtcy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGRlYnVnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTaG93IG9yIGhpZGUgdGhlIGxvYWRpbmcgb3ZlcmxheS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIEhUTUwgc3RyaW5nIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IGxvYWRpbmcgb3ZlcmxheS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheUxvYWRpbmdUZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIGEgY3VzdG9tIGxvYWRpbmcgb3ZlcmxheSBjb21wb25lbnQuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbG9hZGluZ092ZXJsYXlDb21wb25lbnQ6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBsb2FkaW5nIG92ZXJsYXkgY29tcG9uZW50LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBsb2FkaW5nT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEaXNhYmxlcyB0aGUgJ2xvYWRpbmcnIG92ZXJsYXkuXG4gICAgICogQGRlcHJlY2F0ZWQgdjMyIC0gRGVwcmVjYXRlZC4gVXNlIGBsb2FkaW5nPWZhbHNlYCBpbnN0ZWFkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIEhUTUwgc3RyaW5nIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG5vLXJvd3Mgb3ZlcmxheS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgb3ZlcmxheU5vUm93c1RlbXBsYXRlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gbm8tcm93cyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBub1Jvd3NPdmVybGF5Q29tcG9uZW50OiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEN1c3RvbWlzZSB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCB0byB0aGUgbm8tcm93cyBvdmVybGF5IGNvbXBvbmVudC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbm9Sb3dzT3ZlcmxheUNvbXBvbmVudFBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHByZXZlbnQgdGhlIG5vLXJvd3Mgb3ZlcmxheSBiZWluZyBzaG93biB3aGVuIHRoZXJlIGlzIG5vIHJvdyBkYXRhLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NOb1Jvd3NPdmVybGF5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgd2hldGhlciBwYWdpbmF0aW9uIGlzIGVuYWJsZWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcm93cyB0byBsb2FkIHBlciBwYWdlLiBJZiBgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZWAgaXMgc3BlY2lmaWVkLCB0aGlzIHByb3BlcnR5IGlzIGlnbm9yZWQuXG4gICAgICogQGRlZmF1bHQgMTAwXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25QYWdlU2l6ZTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEZXRlcm1pbmVzIGlmIHRoZSBwYWdlIHNpemUgc2VsZWN0b3IgaXMgc2hvd24gaW4gdGhlIHBhZ2luYXRpb24gcGFuZWwgb3Igbm90LlxuICAgICAqIFNldCB0byBhbiBhcnJheSBvZiB2YWx1ZXMgdG8gc2hvdyB0aGUgcGFnZSBzaXplIHNlbGVjdG9yIHdpdGggY3VzdG9tIGxpc3Qgb2YgcG9zc2libGUgcGFnZSBzaXplcy5cbiAgICAgKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgdGhlIHBhZ2Ugc2l6ZSBzZWxlY3RvciB3aXRoIHRoZSBkZWZhdWx0IHBhZ2Ugc2l6ZXMgYFsyMCwgNTAsIDEwMF1gLlxuICAgICAqIFNldCB0byBgZmFsc2VgIHRvIGhpZGUgdGhlIHBhZ2Ugc2l6ZSBzZWxlY3Rvci5cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGFnaW5hdGlvblBhZ2VTaXplU2VsZWN0b3I6IG51bWJlcltdIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBudW1iZXIgb2Ygcm93cyB0byBsb2FkIHBlciBwYWdlIGlzIGF1dG9tYXRpY2FsbHkgYWRqdXN0ZWQgYnkgdGhlIGdyaWQgc28gZWFjaCBwYWdlIHNob3dzIGVub3VnaCByb3dzIHRvIGp1c3QgZmlsbCB0aGUgYXJlYSBkZXNpZ25hdGVkIGZvciB0aGUgZ3JpZC4gSWYgYGZhbHNlYCwgYHBhZ2luYXRpb25QYWdlU2l6ZWAgaXMgdXNlZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgcGFnZXMgc3BsaXQgY2hpbGRyZW4gb2YgZ3JvdXBzIHdoZW4gdXNpbmcgUm93IEdyb3VwaW5nIG9yIGRldGFpbCByb3dzIHdpdGggTWFzdGVyIERldGFpbC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRlQ2hpbGRSb3dzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIHRoZSBkZWZhdWx0IGdyaWQgY29udHJvbHMgZm9yIG5hdmlnYXRpb24gYXJlIGhpZGRlbi5cbiAgICAgKiBUaGlzIGlzIHVzZWZ1bCBpZiBgcGFnaW5hdGlvbj10cnVlYCBhbmQgeW91IHdhbnQgdG8gcHJvdmlkZSB5b3VyIG93biBwYWdpbmF0aW9uIGNvbnRyb2xzLlxuICAgICAqIE90aGVyd2lzZSwgd2hlbiBgcGFnaW5hdGlvbj10cnVlYCB0aGUgZ3JpZCBhdXRvbWF0aWNhbGx5IHNob3dzIHRoZSBuZWNlc3NhcnkgY29udHJvbHMgYXQgdGhlIGJvdHRvbSBzbyB0aGF0IHRoZSB1c2VyIGNhbiBuYXZpZ2F0ZSB0aHJvdWdoIHRoZSBkaWZmZXJlbnQgcGFnZXMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NQYWdpbmF0aW9uUGFuZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHBpdm90IG1vZGUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RNb2RlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHRvIHNob3cgdGhlICdwaXZvdCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gcGl2b3QpIGF0IHRoZSB0b3AuIE5vdGUgdGhhdCB0aGUgcGl2b3QgcGFuZWwgd2lsbCBuZXZlciBzaG93IGlmIGBwaXZvdE1vZGVgIGlzIG9mZi5cbiAgICAgKiBAZGVmYXVsdCAnbmV2ZXInXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RQYW5lbFNob3c6ICdhbHdheXMnIHwgJ29ubHlXaGVuUGl2b3RpbmcnIHwgJ25ldmVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVGhlIG1heGltdW0gbnVtYmVyIG9mIGdlbmVyYXRlZCBjb2x1bW5zIGJlZm9yZSB0aGUgZ3JpZCBoYWx0cyBleGVjdXRpb24uIFVwb24gcmVhY2hpbmcgdGhpcyBudW1iZXIsIHRoZSBncmlkIGhhbHRzIGdlbmVyYXRpb24gb2YgY29sdW1uc1xuICAgICAqIGFuZCB0cmlnZ2VycyBhIGBwaXZvdE1heENvbHVtbnNFeGNlZWRlZGAgZXZlbnQuIGAtMWAgZm9yIG5vIGxpbWl0LlxuICAgICAqIEBkZWZhdWx0IC0xXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90TWF4R2VuZXJhdGVkQ29sdW1uczogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBwaXZvdGluZywgc2V0IHRvIHRoZSBudW1iZXIgb2YgY29sdW1uIGdyb3VwIGxldmVscyB0byBleHBhbmQgYnkgZGVmYXVsdCwgZS5nLiBgMGAgZm9yIG5vbmUsIGAxYCBmb3IgZmlyc3QgbGV2ZWwgb25seSwgZXRjLiBTZXQgdG8gYC0xYCB0byBleHBhbmQgZXZlcnl0aGluZy5cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90RGVmYXVsdEV4cGFuZGVkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gc2V0IGFuZCB0aGUgZ3JpZCBpcyBpbiBwaXZvdCBtb2RlLCBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgdG90YWxzIHdpbGwgYXBwZWFyIHdpdGhpbiB0aGUgUGl2b3QgQ29sdW1uIEdyb3VwcywgaW4gdGhlIHBvc2l0aW9uIHNwZWNpZmllZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RDb2x1bW5Hcm91cFRvdGFsczogJ2JlZm9yZScgfCAnYWZ0ZXInIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHNldCBhbmQgdGhlIGdyaWQgaXMgaW4gcGl2b3QgbW9kZSwgYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIHRvdGFscyB3aWxsIGFwcGVhciBmb3IgZWFjaCB2YWx1ZSBjb2x1bW4gaW4gdGhlIHBvc2l0aW9uIHNwZWNpZmllZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcGl2b3RSb3dUb3RhbHM6ICdiZWZvcmUnIHwgJ2FmdGVyJyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCBzd2FwIGluIHRoZSBncm91cGluZyBjb2x1bW4gd2hlbiBwaXZvdGluZy4gVXNlZnVsIGlmIHBpdm90aW5nIHVzaW5nIFNlcnZlciBTaWRlIFJvdyBNb2RlbCBvciBWaWV3cG9ydCBSb3cgTW9kZWwgYW5kIHlvdSB3YW50IGZ1bGwgY29udHJvbCBvZiBhbGwgY29sdW1ucyBpbmNsdWRpbmcgdGhlIGdyb3VwIGNvbHVtbi5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpdm90U3VwcHJlc3NBdXRvQ29sdW1uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIHBpdm90IGNvbHVtbiBncm91cHMgd2lsbCBhcHBlYXIgJ2ZpeGVkJywgd2l0aG91dCB0aGUgYWJpbGl0eSB0byBleHBhbmQgYW5kIGNvbGxhcHNlIHRoZSBjb2x1bW4gZ3JvdXBzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NFeHBhbmRhYmxlUGl2b3RHcm91cHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgdGhlbiByb3cgZ3JvdXAsIHBpdm90IGFuZCB2YWx1ZSBhZ2dyZWdhdGlvbiB3aWxsIGJlIHJlYWQtb25seSBmcm9tIHRoZSBHVUkuIFRoZSBncmlkIHdpbGwgZGlzcGxheSB3aGF0IHZhbHVlcyBhcmUgdXNlZCBmb3IgZWFjaCwgYnV0IHdpbGwgbm90IGFsbG93IHRoZSB1c2VyIHRvIGNoYW5nZSB0aGUgc2VsZWN0aW9uLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIG1hcCBvZiAnZnVuY3Rpb24gbmFtZScgdG8gJ2Z1bmN0aW9uJyBmb3IgY3VzdG9tIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9ucy5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dGdW5jczogeyBba2V5OiBzdHJpbmddOiBJQWdnRnVuYzxURGF0YT4gfSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIGNvbHVtbiBoZWFkZXJzIHdvbid0IGluY2x1ZGUgdGhlIGBhZ2dGdW5jYCBuYW1lLCBlLmcuIGAnc3VtKEJhbmsgQmFsYW5jZSlgJyB3aWxsIGp1c3QgYmUgYCdCYW5rIEJhbGFuY2UnYC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQWdnRnVuY0luSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGFnZ3JlZ2F0aW9ucywgdGhlIGdyaWQgd2lsbCBhbHdheXMgY2FsY3VsYXRlIHRoZSByb290IGxldmVsIGFnZ3JlZ2F0aW9uIHZhbHVlLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c0FnZ3JlZ2F0ZUF0Um9vdExldmVsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIGNoYW5nZSBkZXRlY3Rpb24sIG9ubHkgdGhlIHVwZGF0ZWQgY29sdW1uIHdpbGwgYmUgcmUtYWdncmVnYXRlZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhZ2dyZWdhdGVPbmx5Q2hhbmdlZENvbHVtbnM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgc28gdGhhdCBhZ2dyZWdhdGlvbnMgYXJlIG5vdCBpbXBhY3RlZCBieSBmaWx0ZXJpbmcuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBZ2dGaWx0ZXJlZE9ubHk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gb21pdCB0aGUgdmFsdWUgQ29sdW1uIGhlYWRlciB3aGVuIHRoZXJlIGlzIG9ubHkgYSBzaW5nbGUgdmFsdWUgY29sdW1uLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcmVtb3ZlUGl2b3RIZWFkZXJSb3dXaGVuU2luZ2xlVmFsdWVDb2x1bW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgZmFsc2VgIHRvIGRpc2FibGUgUm93IEFuaW1hdGlvbiB3aGljaCBpcyBlbmFibGVkIGJ5IGRlZmF1bHQuXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhbmltYXRlUm93czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoYXZlIGNlbGxzIGZsYXNoIGFmdGVyIGRhdGEgY2hhbmdlcy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBkZXByZWNhdGVkIDMxLjIgdXNlIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgIGluIHRoZSBgQ29sRGVmYCBvciBgZGVmYXVsdENvbERlZmAgZm9yIGFsbCBjb2x1bW5zLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVDZWxsQ2hhbmdlRmxhc2g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRvIGJlIHVzZWQgd2hlbiBzZXR0aW5nIGBlbmFibGVDZWxsQ2hhbmdlRmxhc2hgIG9uIGNvbHVtbiBkZWZpbml0aW9ucy4gU2V0cyB0aGUgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIG9mIGhvdyBsb25nIGEgY2VsbCBzaG91bGQgcmVtYWluIGluIGl0cyBcImZsYXNoZWRcIiBzdGF0ZS5cbiAgICAgKiBAZGVmYXVsdCA1MDBcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2VsbEZsYXNoRHVyYXRpb246IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGRlcHJlY2F0ZWQgdjMxLjEgLSB1c2UgYGNlbGxGbGFzaER1cmF0aW9uYCBpbnN0ZWFkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmxhc2hEZWxheTogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyBiZSB1c2VkIHdoZW4gc2V0dGluZyBgZW5hYmxlQ2VsbENoYW5nZUZsYXNoYCBvbiBjb2x1bW4gZGVmaW5pdGlvbnMuIFNldHMgdGhlIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBvZiBob3cgbG9uZyB0aGUgXCJmbGFzaGVkXCIgc3RhdGUgYW5pbWF0aW9uIHRha2VzIHRvIGZhZGUgYXdheSBhZnRlciB0aGUgdGltZXIgc2V0IGJ5IGNlbGxGbGFzaER1cmF0aW9uIGhhcyBjb21wbGV0ZWQuXG4gICAgICogQGRlZmF1bHQgMTAwMFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmFkZUR1cmF0aW9uOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYzMS4xIC0gdXNlIGBjZWxsRmFkZUR1cmF0aW9uYCBpbnN0ZWFkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjZWxsRmFkZURlbGF5OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGF2ZSBjZWxscyBmbGFzaCBhZnRlciBkYXRhIGNoYW5nZXMgZXZlbiB3aGVuIHRoZSBjaGFuZ2UgaXMgZHVlIHRvIGZpbHRlcmluZy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsbG93U2hvd0NoYW5nZUFmdGVyRmlsdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTd2l0Y2ggYmV0d2VlbiBsYXlvdXQgb3B0aW9uczogYG5vcm1hbGAsIGBhdXRvSGVpZ2h0YCwgYHByaW50YC5cbiAgICAgKiBAZGVmYXVsdCAnbm9ybWFsJ1xuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb21MYXlvdXQ6IERvbUxheW91dFR5cGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgb3JkZXIgb2Ygcm93cyBhbmQgY29sdW1ucyBpbiB0aGUgRE9NIGFyZSBjb25zaXN0ZW50IHdpdGggd2hhdCBpcyBvbiBzY3JlZW4uXG4gICAgICogRGlzYWJsZXMgcm93IGFuaW1hdGlvbnMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbnN1cmVEb21PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBvcGVyYXRlIHRoZSBncmlkIGluIFJUTCAoUmlnaHQgdG8gTGVmdCkgbW9kZS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZVJ0bDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBncmlkIGRvZXNuJ3QgdmlydHVhbGlzZSB0aGUgY29sdW1ucy4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIDEwMCBjb2x1bW5zLCBidXQgb25seSAxMCB2aXNpYmxlIGR1ZSB0byBzY3JvbGxpbmcsIGFsbCAxMDAgd2lsbCBhbHdheXMgYmUgcmVuZGVyZWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc0NvbHVtblZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBCeSBkZWZhdWx0IHRoZSBncmlkIGhhcyBhIGxpbWl0IG9mIHJlbmRlcmluZyBhIG1heGltdW0gb2YgNTAwIHJvd3MgYXQgb25jZSAocmVtZW1iZXIgdGhlIGdyaWQgb25seSByZW5kZXJzIHJvd3MgeW91IGNhbiBzZWUsIHNvIHVubGVzcyB5b3VyIGRpc3BsYXkgc2hvd3MgbW9yZSB0aGFuIDUwMCByb3dzIHdpdGhvdXQgdmVydGljYWxseSBzY3JvbGxpbmcgdGhpcyB3aWxsIG5ldmVyIGJlIGFuIGlzc3VlKS5cbiAgICAgKiA8YnIgLz4qKlRoaXMgaXMgb25seSByZWxldmFudCBpZiB5b3UgYXJlIG1hbnVhbGx5IHNldHRpbmcgYHJvd0J1ZmZlcmAgdG8gYSBoaWdoIHZhbHVlIChyZW5kZXJpbmcgbW9yZSByb3dzIHRoYW4gY2FuIGJlIHNlZW4pLCBvciBgc3VwcHJlc3NSb3dWaXJ0dWFsaXNhdGlvbmAgaXMgdHJ1ZSwgb3IgaWYgeW91ciBncmlkIGhlaWdodCBpcyBhYmxlIHRvIGRpc3BsYXkgbW9yZSB0aGFuIDUwMCByb3dzIGF0IG9uY2UuKipcbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTWF4UmVuZGVyZWRSb3dSZXN0cmljdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCBzbyB0aGF0IHRoZSBncmlkIGRvZXNuJ3QgdmlydHVhbGlzZSB0aGUgcm93cy4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIDEwMCByb3dzLCBidXQgb25seSAxMCB2aXNpYmxlIGR1ZSB0byBzY3JvbGxpbmcsIGFsbCAxMDAgd2lsbCBhbHdheXMgYmUgcmVuZGVyZWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1Jvd1ZpcnR1YWxpc2F0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBNYW5hZ2VkIFJvdyBEcmFnZ2luZy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnTWFuYWdlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyByb3cgZHJhZ2dpbmcuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEcmFnOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIG1vdmluZyByb3dzIHdoaWxlIGRyYWdnaW5nIHRoZSBgcm93RHJhZ2Agd2FmZmxlLiBUaGlzIG9wdGlvbiBoaWdobGlnaHRzIHRoZSBwb3NpdGlvbiB3aGVyZSB0aGUgcm93IHdpbGwgYmUgcGxhY2VkIGFuZCBpdCB3aWxsIG9ubHkgbW92ZSB0aGUgcm93IG9uIG1vdXNlIHVwLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZzogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgY2xpY2tpbmcgYW5kIGRyYWdnaW5nIGFueXdoZXJlIG9uIHRoZSByb3cgd2l0aG91dCB0aGUgbmVlZCBmb3IgYSBkcmFnIGhhbmRsZS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEcmFnRW50aXJlUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBkcmFnZ2luZyBtdWx0aXBsZSByb3dzIGF0IHRoZSBzYW1lIHRpbWUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ011bHRpUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIHJldHVybiBhIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGByb3dEcmFnQ29tcGAgd2hpbGUgZHJhZ2dpbmcgYSByb3cuXG4gICAgICogSWYgdGhpcyBjYWxsYmFjayBpcyBub3Qgc2V0LCB0aGUgY3VycmVudCBjZWxsIHZhbHVlIHdpbGwgYmUgdXNlZC5cbiAgICAgKiBJZiB0aGUgYHJvd0RyYWdUZXh0YCBjYWxsYmFjayBpcyBzZXQgaW4gdGhlIENvbERlZiBpdCB3aWxsIHRha2UgcHJlY2VkZW5jZSBvdmVyIHRoaXMsIGV4Y2VwdCB3aGVuXG4gICAgICogYHJvd0RyYWdFbnRpcmVSb3c9dHJ1ZWAuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93RHJhZ1RleHQ6ICgocGFyYW1zOiBJUm93RHJhZ0l0ZW0sIGRyYWdJdGVtQ291bnQ6IG51bWJlcikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSB5b3VyIG93biBjZWxsIHJlbmRlcmVyIGNvbXBvbmVudCB0byB1c2UgZm9yIGZ1bGwgd2lkdGggcm93cy5cbiAgICAgKiBTZWUgW0Z1bGwgV2lkdGggUm93c10oaHR0cHM6Ly93d3cuYWctZ3JpZC5jb20vamF2YXNjcmlwdC1kYXRhLWdyaWQvZnVsbC13aWR0aC1yb3dzLykgZm9yIGZyYW1ld29yayBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmdWxsV2lkdGhDZWxsUmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBgZnVsbFdpZHRoQ2VsbFJlbmRlcmVyYCBjb21wb25lbnQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZ1bGxXaWR0aENlbGxSZW5kZXJlclBhcmFtczogYW55ID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGhhdmUgdGhlIEZ1bGwgV2lkdGggUm93cyBlbWJlZGRlZCBpbiBncmlkJ3MgbWFpbiBjb250YWluZXIgc28gdGhleSBjYW4gYmUgc2Nyb2xsZWQgaG9yaXpvbnRhbGx5LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbWJlZEZ1bGxXaWR0aFJvd3M6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEBkZXByZWNhdGVkIHYzMVxuICAgICAqIFdoZW4gZW5hYmxlZCwgdGhlIGdyaWQgd2lsbCBjYXN0IGdyb3VwIHZhbHVlcyB0byBzdHJpbmcgdHlwZS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzR3JvdXBNYWludGFpblZhbHVlVHlwZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU3BlY2lmaWVzIGhvdyB0aGUgcmVzdWx0cyBvZiByb3cgZ3JvdXBpbmcgc2hvdWxkIGJlIGRpc3BsYXllZC5cbiAgICAgKlxuICAgICAqICBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICpcbiAgICAgKiAtIGAnc2luZ2xlQ29sdW1uJ2A6IHNpbmdsZSBncm91cCBjb2x1bW4gYXV0b21hdGljYWxseSBhZGRlZCBieSB0aGUgZ3JpZC5cbiAgICAgKiAtIGAnbXVsdGlwbGVDb2x1bW5zJ2A6IGEgZ3JvdXAgY29sdW1uIHBlciByb3cgZ3JvdXAgaXMgYWRkZWQgYXV0b21hdGljYWxseS5cbiAgICAgKiAtIGAnZ3JvdXBSb3dzJ2A6IGdyb3VwIHJvd3MgYXJlIGF1dG9tYXRpY2FsbHkgYWRkZWQgaW5zdGVhZCBvZiBncm91cCBjb2x1bW5zLlxuICAgICAqIC0gYCdjdXN0b20nYDogaW5mb3JtcyB0aGUgZ3JpZCB0aGF0IGdyb3VwIGNvbHVtbnMgd2lsbCBiZSBwcm92aWRlZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBEaXNwbGF5VHlwZTogUm93R3JvdXBpbmdEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgZ3JvdXBpbmcsIHNldCB0byB0aGUgbnVtYmVyIG9mIGxldmVscyB0byBleHBhbmQgYnkgZGVmYXVsdCwgZS5nLiBgMGAgZm9yIG5vbmUsIGAxYCBmb3IgZmlyc3QgbGV2ZWwgb25seSwgZXRjLiBTZXQgdG8gYC0xYCB0byBleHBhbmQgZXZlcnl0aGluZy5cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwRGVmYXVsdEV4cGFuZGVkOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzcGVjaWZ5aW5nIHRoZSBncm91cCAnYXV0byBjb2x1bW4nIGlmIHlvdSBhcmUgbm90IGhhcHB5IHdpdGggdGhlIGRlZmF1bHQuIElmIGdyb3VwaW5nLCB0aGlzIGNvbHVtbiBkZWZpbml0aW9uIGlzIGluY2x1ZGVkIGFzIHRoZSBmaXJzdCBjb2x1bW4gaW4gdGhlIGdyaWQuIElmIG5vdCBncm91cGluZywgdGhpcyBjb2x1bW4gaXMgbm90IGluY2x1ZGVkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhdXRvR3JvdXBDb2x1bW5EZWY6IENvbERlZjxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCBwcmVzZXJ2ZXMgdGhlIGN1cnJlbnQgZ3JvdXAgb3JkZXIgd2hlbiBzb3J0aW5nIG9uIG5vbi1ncm91cCBjb2x1bW5zLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwTWFpbnRhaW5PcmRlcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBgdHJ1ZWAsIGlmIHlvdSBzZWxlY3QgYSBncm91cCwgdGhlIGNoaWxkcmVuIG9mIHRoZSBncm91cCB3aWxsIGFsc28gYmUgc2VsZWN0ZWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGdyb3VwaW5nLCBsb2NrcyB0aGUgZ3JvdXAgc2V0dGluZ3Mgb2YgYSBudW1iZXIgb2YgY29sdW1ucywgZS5nLiBgMGAgZm9yIG5vIGdyb3VwIGxvY2tpbmcuIGAxYCBmb3IgZmlyc3QgZ3JvdXAgY29sdW1uIGxvY2tlZCwgYC0xYCBmb3IgYWxsIGdyb3VwIGNvbHVtbnMgbG9ja2VkLlxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cExvY2tHcm91cENvbHVtbnM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGRldGVybWluZSB3aGV0aGVyIGZpbHRlcnMgc2hvdWxkIGJlIGFwcGxpZWQgb24gYWdncmVnYXRlZCBncm91cCB2YWx1ZXMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBBZ2dGaWx0ZXJpbmc6IGJvb2xlYW4gfCBJc1Jvd0ZpbHRlcmFibGU8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBncm91cGluZywgdGhpcyBjb250cm9scyB3aGV0aGVyIHRvIHNob3cgYSBncm91cCBmb290ZXIgd2hlbiB0aGUgZ3JvdXAgaXMgZXhwYW5kZWQuXG4gICAgICogSWYgYHRydWVgLCB0aGVuIGJ5IGRlZmF1bHQsIHRoZSBmb290ZXIgd2lsbCBjb250YWluIGFnZ3JlZ2F0ZSBkYXRhIChpZiBhbnkpIHdoZW4gc2hvd24gYW5kIHRoZSBoZWFkZXIgd2lsbCBiZSBibGFuay5cbiAgICAgKiBXaGVuIGNsb3NlZCwgdGhlIGhlYWRlciB3aWxsIGNvbnRhaW4gdGhlIGFnZ3JlZ2F0ZSBkYXRhIHJlZ2FyZGxlc3Mgb2YgdGhpcyBzZXR0aW5nIChhcyB0aGUgZm9vdGVyIGlzIGhpZGRlbiBhbnl3YXkpLlxuICAgICAqIFRoaXMgaXMgaGFuZHkgZm9yICd0b3RhbCcgcm93cywgdGhhdCBhcmUgZGlzcGxheWVkIGJlbG93IHRoZSBkYXRhIHdoZW4gdGhlIGdyb3VwIGlzIG9wZW4sIGFuZCBhbG9uZ3NpZGUgdGhlIGdyb3VwIHdoZW4gaXQgaXMgY2xvc2VkLlxuICAgICAqIElmIGEgY2FsbGJhY2sgZnVuY3Rpb24gaXMgcHJvdmlkZWQsIGl0IGNhbiB1c2VkIHRvIHNlbGVjdCB3aGljaCBncm91cHMgd2lsbCBoYXZlIGEgZm9vdGVyIGFkZGVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICpcbiAgICAgKiBAZGVwcmVjYXRlZCB2MzEuMyAtIHVzZSBgZ3JvdXBUb3RhbFJvd2AgaW5zdGVhZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBJbmNsdWRlRm9vdGVyOiBib29sZWFuIHwgVXNlR3JvdXBGb290ZXI8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNob3cgYSAnZ3JhbmQgdG90YWwnIGdyb3VwIGZvb3RlciBhY3Jvc3MgYWxsIGdyb3Vwcy5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqXG4gICAgICogQGRlcHJlY2F0ZWQgdjMxLjMgLSB1c2UgYGdyYW5kVG90YWxSb3dgIGluc3RlYWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwSW5jbHVkZVRvdGFsRm9vdGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHByb3ZpZGVkLCBhbiBleHRyYSByb3cgZ3JvdXAgdG90YWwgcm93IHdpbGwgYmUgaW5zZXJ0ZWQgaW50byByb3cgZ3JvdXBzIGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24sIHRvIGRpc3BsYXlcbiAgICAgKiB3aGVuIHRoZSBncm91cCBpcyBleHBhbmRlZC4gVGhpcyByb3cgd2lsbCBjb250YWluIHRoZSBhZ2dyZWdhdGUgdmFsdWVzIGZvciB0aGUgZ3JvdXAuIElmIGEgY2FsbGJhY2sgZnVuY3Rpb24gaXNcbiAgICAgKiBwcm92aWRlZCwgaXQgY2FuIGJlIHVzZWQgdG8gc2VsZWN0aXZlbHkgZGV0ZXJtaW5lIHdoaWNoIGdyb3VwcyB3aWxsIGhhdmUgYSB0b3RhbCByb3cgYWRkZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwVG90YWxSb3c6ICd0b3AnIHwgJ2JvdHRvbScgfCBVc2VHcm91cFRvdGFsUm93PFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBwcm92aWRlZCwgYW4gZXh0cmEgZ3JhbmQgdG90YWwgcm93IHdpbGwgYmUgaW5zZXJ0ZWQgaW50byB0aGUgZ3JpZCBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uLlxuICAgICAqIFRoaXMgcm93IGRpc3BsYXlzIHRoZSBhZ2dyZWdhdGUgdG90YWxzIG9mIGFsbCByb3dzIGluIHRoZSBncmlkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncmFuZFRvdGFsUm93OiAndG9wJyB8ICdib3R0b20nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTdXBwcmVzcyB0aGUgc3RpY2t5IGJlaGF2aW91ciBvZiB0aGUgdG90YWwgcm93cywgY2FuIGJlIHN1cHByZXNzZWQgaW5kaXZpZHVhbGx5IGJ5IHBhc3NpbmcgYCdncmFuZCdgIG9yIGAnZ3JvdXAnYC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTdGlja3lUb3RhbFJvdzogYm9vbGVhbiB8ICdncmFuZCcgfCAnZ3JvdXAnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIGFuZCBzaG93aW5nIGZvb3RlciwgYWdncmVnYXRlIGRhdGEgd2lsbCBhbHdheXMgYmUgZGlzcGxheWVkIGF0IGJvdGggdGhlIGhlYWRlciBhbmQgZm9vdGVyIGxldmVscy4gVGhpcyBzdG9wcyB0aGUgcG9zc2libHkgdW5kZXNpcmFibGUgYmVoYXZpb3VyIG9mIHRoZSBoZWFkZXIgZGV0YWlscyAnanVtcGluZycgdG8gdGhlIGZvb3RlciBvbiBleHBhbmQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTdXBwcmVzc0JsYW5rSGVhZGVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiB1c2luZyBgZ3JvdXBTZWxlY3RzQ2hpbGRyZW5gLCB0aGVuIG9ubHkgdGhlIGNoaWxkcmVuIHRoYXQgcGFzcyB0aGUgY3VycmVudCBmaWx0ZXIgd2lsbCBnZXQgc2VsZWN0ZWQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBTZWxlY3RzRmlsdGVyZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNob3dzIHRoZSBvcGVuIGdyb3VwIGluIHRoZSBncm91cCBjb2x1bW4gZm9yIG5vbi1ncm91cCByb3dzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNob3dPcGVuZWRHcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBjb2xsYXBzZSBncm91cHMgdGhhdCBvbmx5IGhhdmUgb25lIGNoaWxkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gY29sbGFwc2UgbG93ZXN0IGxldmVsIGdyb3VwcyB0aGF0IG9ubHkgaGF2ZSBvbmUgY2hpbGQuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBSZW1vdmVMb3dlc3RTaW5nbGVDaGlsZHJlbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBoaWRlIHBhcmVudHMgdGhhdCBhcmUgb3Blbi4gV2hlbiB1c2VkIHdpdGggbXVsdGlwbGUgY29sdW1ucyBmb3Igc2hvd2luZyBncm91cHMsIGl0IGNhbiBnaXZlIGEgbW9yZSBwbGVhc2luZyB1c2VyIGV4cGVyaWVuY2UuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBIaWRlT3BlblBhcmVudHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gcHJldmVudCB0aGUgZ3JpZCBmcm9tIGNyZWF0aW5nIGEgJyhCbGFua3MpJyBncm91cCBmb3Igbm9kZXMgd2hpY2ggZG8gbm90IGJlbG9uZyB0byBhIGdyb3VwLCBhbmQgZGlzcGxheSB0aGUgdW5iYWxhbmNlZCBub2RlcyBhbG9uZ3NpZGUgZ3JvdXAgbm9kZXMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JvdXBBbGxvd1VuYmFsYW5jZWQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdG8gc2hvdyB0aGUgJ3JvdyBncm91cCBwYW5lbCcgKHdoZXJlIHlvdSBkcmFnIHJvd3MgdG8gZ3JvdXApIGF0IHRoZSB0b3AuXG4gICAgICogQGRlZmF1bHQgJ25ldmVyJ1xuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dHcm91cFBhbmVsU2hvdzogJ2Fsd2F5cycgfCAnb25seVdoZW5Hcm91cGluZycgfCAnbmV2ZXInIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBDZWxsIFJlbmRlcmVyIHRvIHVzZSB3aGVuIGBncm91cERpc3BsYXlUeXBlID0gJ2dyb3VwUm93cydgLlxuICAgICAqIFNlZSBbR3JvdXAgUm93IENlbGwgUmVuZGVyZXJdKGh0dHBzOi8vd3d3LmFnLWdyaWQuY29tL2phdmFzY3JpcHQtZGF0YS1ncmlkL2dyb3VwaW5nLWdyb3VwLXJvd3MvI3Byb3ZpZGluZy1jZWxsLXJlbmRlcmVyKSBmb3IgZnJhbWV3b3JrIHNwZWNpZmljIGltcGxlbWVudGF0aW9uIGRldGFpbHMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdyb3VwUm93UmVuZGVyZXI6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ3VzdG9taXNlIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIHRvIHRoZSBgZ3JvdXBSb3dSZW5kZXJlcmAgY29tcG9uZW50LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBncm91cFJvd1JlbmRlcmVyUGFyYW1zOiBhbnkgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEJ5IGRlZmF1bHQsIHdoZW4gYSBjb2x1bW4gaXMgdW4tZ3JvdXBlZCwgaS5lLiB1c2luZyB0aGUgUm93IEdyb3VwIFBhbmVsLCBpdCBpcyBtYWRlIHZpc2libGUgaW4gdGhlIGdyaWQuIFRoaXMgcHJvcGVydHkgc3RvcHMgdGhlIGNvbHVtbiBiZWNvbWluZyB2aXNpYmxlIGFnYWluIHdoZW4gdW4tZ3JvdXBpbmcuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWtlQ29sdW1uVmlzaWJsZUFmdGVyVW5Hcm91cDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBlbmFibGUgdGhlIEdyaWQgdG8gd29yayB3aXRoIFRyZWUgRGF0YS4gWW91IG11c3QgYWxzbyBpbXBsZW1lbnQgdGhlIGBnZXREYXRhUGF0aChkYXRhKWAgY2FsbGJhY2suXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGE6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc3VwcHJlc3Mgc29ydCBpbmRpY2F0b3JzIGFuZCBhY3Rpb25zIGZyb20gdGhlIHJvdyBncm91cCBwYW5lbC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0dyb3VwUGFuZWxTdXBwcmVzc1NvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgcHJldmVudCBHcm91cCBSb3dzIGZyb20gc3RpY2tpbmcgdG8gdGhlIHRvcCBvZiB0aGUgZ3JpZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzR3JvdXBSb3dzU3RpY2t5OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEYXRhIHRvIGJlIGRpc3BsYXllZCBhcyBwaW5uZWQgdG9wIHJvd3MgaW4gdGhlIGdyaWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZFRvcFJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEYXRhIHRvIGJlIGRpc3BsYXllZCBhcyBwaW5uZWQgYm90dG9tIHJvd3MgaW4gdGhlIGdyaWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBpbm5lZEJvdHRvbVJvd0RhdGE6IGFueVtdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXRzIHRoZSByb3cgbW9kZWwgdHlwZS5cbiAgICAgKiBAZGVmYXVsdCAnY2xpZW50U2lkZSdcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dNb2RlbFR5cGU6IFJvd01vZGVsVHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRoZSBkYXRhIHRvIGJlIGRpc3BsYXllZCBhcyByb3dzIGluIHRoZSBncmlkLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dEYXRhOiBURGF0YVtdIHwgbnVsbCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYmVmb3JlIGV4ZWN1dGluZyBhIGJhdGNoIG9mIGFzeW5jIHRyYW5zYWN0aW9ucy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbldhaXRNaWxsaXM6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJldmVudHMgVHJhbnNhY3Rpb25zIGNoYW5naW5nIHNvcnQsIGZpbHRlciwgZ3JvdXAgb3IgcGl2b3Qgc3RhdGUgd2hlbiB0cmFuc2FjdGlvbiBvbmx5IGNvbnRhaW5zIHVwZGF0ZXMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNb2RlbFVwZGF0ZUFmdGVyVXBkYXRlVHJhbnNhY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgdGhlIGRhdGFzb3VyY2UgZm9yIGluZmluaXRlIHNjcm9sbGluZy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGF0YXNvdXJjZTogSURhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGV4dHJhIGJsYW5rIHJvd3MgdG8gZGlzcGxheSB0byB0aGUgdXNlciBhdCB0aGUgZW5kIG9mIHRoZSBkYXRhc2V0LCB3aGljaCBzZXRzIHRoZSB2ZXJ0aWNhbCBzY3JvbGwgYW5kIHRoZW4gYWxsb3dzIHRoZSBncmlkIHRvIHJlcXVlc3Qgdmlld2luZyBtb3JlIHJvd3Mgb2YgZGF0YS5cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY2FjaGVPdmVyZmxvd1NpemU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgZXh0cmEgYmxhbmsgcm93cyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyIGF0IHRoZSBlbmQgb2YgdGhlIGRhdGFzZXQsIHdoaWNoIHNldHMgdGhlIHZlcnRpY2FsIHNjcm9sbCBhbmQgdGhlbiBhbGxvd3MgdGhlIGdyaWQgdG8gcmVxdWVzdCB2aWV3aW5nIG1vcmUgcm93cyBvZiBkYXRhLlxuICAgICAqIEBkZWZhdWx0IDFcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbmZpbml0ZUluaXRpYWxSb3dDb3VudDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgaG93IG1hbnkgbG9hZGluZyByb3dzIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXIgZm9yIHRoZSByb290IGxldmVsIGdyb3VwLlxuICAgICAqIEBkZWZhdWx0IDFcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlSW5pdGlhbFJvd0NvdW50OiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgU2VydmVyLXNpZGUgUm93IE1vZGVsIHdpbGwgc3VwcHJlc3MgSW5maW5pdGUgU2Nyb2xsaW5nIGFuZCBsb2FkIGFsbCB0aGUgZGF0YSBhdCB0aGUgY3VycmVudCBsZXZlbC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICogQGRlcHJlY2F0ZWQgdjMxLjFcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgU2VydmVyLXNpZGUgUm93IE1vZGVsIHdpbGwgbm90IHVzZSBhIGZ1bGwgd2lkdGggbG9hZGluZyByZW5kZXJlciwgaW5zdGVhZCB1c2luZyB0aGUgY29sRGVmIGBsb2FkaW5nQ2VsbFJlbmRlcmVyYCBpZiBwcmVzZW50LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc1NlcnZlclNpZGVGdWxsV2lkdGhMb2FkaW5nUm93OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSByb3dzIGZvciBlYWNoIGJsb2NrIGluIHRoZSBzdG9yZSwgaS5lLiBob3cgbWFueSByb3dzIHJldHVybmVkIGZyb20gdGhlIHNlcnZlciBhdCBhIHRpbWUuXG4gICAgICogQGRlZmF1bHQgMTAwXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGNhY2hlQmxvY2tTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEhvdyBtYW55IGJsb2NrcyB0byBrZWVwIGluIHRoZSBzdG9yZS4gRGVmYXVsdCBpcyBubyBsaW1pdCwgc28gZXZlcnkgcmVxdWVzdGVkIGJsb2NrIGlzIGtlcHQuIFVzZSB0aGlzIGlmIHlvdSBoYXZlIG1lbW9yeSBjb25jZXJucywgYW5kIGJsb2NrcyB0aGF0IHdlcmUgbGVhc3QgcmVjZW50bHkgdmlld2VkIHdpbGwgYmUgcHVyZ2VkIHdoZW4gdGhlIGxpbWl0IGlzIGhpdC4gVGhlIGdyaWQgd2lsbCBhZGRpdGlvbmFsbHkgbWFrZSBzdXJlIGl0IGhhcyBhbGwgdGhlIGJsb2NrcyBuZWVkZWQgdG8gZGlzcGxheSB3aGF0IGlzIGN1cnJlbnRseSB2aXNpYmxlLCBpbiBjYXNlIHRoaXMgcHJvcGVydHkgaXMgc2V0IHRvIGEgbG93IHZhbHVlLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG1heEJsb2Nrc0luQ2FjaGU6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSG93IG1hbnkgcmVxdWVzdHMgdG8gaGl0IHRoZSBzZXJ2ZXIgd2l0aCBjb25jdXJyZW50bHkuIElmIHRoZSBtYXggaXMgcmVhY2hlZCwgcmVxdWVzdHMgYXJlIHF1ZXVlZC5cbiAgICAgKiBTZXQgdG8gYC0xYCBmb3Igbm8gbWF4aW11bSByZXN0cmljdGlvbiBvbiByZXF1ZXN0cy5cbiAgICAgKiBAZGVmYXVsdCAyXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbWF4Q29uY3VycmVudERhdGFzb3VyY2VSZXF1ZXN0czogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBIb3cgbWFueSBtaWxsaXNlY29uZHMgdG8gd2FpdCBiZWZvcmUgbG9hZGluZyBhIGJsb2NrLiBVc2VmdWwgd2hlbiBzY3JvbGxpbmcgb3ZlciBtYW55IGJsb2NrcywgYXMgaXQgcHJldmVudHMgYmxvY2tzIGxvYWRpbmcgdW50aWwgc2Nyb2xsaW5nIGhhcyBzZXR0bGVkLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGJsb2NrTG9hZERlYm91bmNlTWlsbGlzOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgY2xvc2luZyBncm91cCByb3dzIHdpbGwgcmVtb3ZlIGNoaWxkcmVuIG9mIHRoYXQgcm93LiBOZXh0IHRpbWUgdGhlIHJvdyBpcyBvcGVuZWQsIGNoaWxkIHJvd3Mgd2lsbCBiZSByZWFkIGZyb20gdGhlIGRhdGFzb3VyY2UgYWdhaW4uIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nIG9yIFRyZWUgRGF0YS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwdXJnZUNsb3NlZFJvd05vZGVzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBQcm92aWRlIHRoZSBgc2VydmVyU2lkZURhdGFzb3VyY2VgIGZvciBzZXJ2ZXIgc2lkZSByb3cgbW9kZWwuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVEYXRhc291cmNlOiBJU2VydmVyU2lkZURhdGFzb3VyY2UgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgYWx3YXlzIHJlZnJlc2hlcyB0b3AgbGV2ZWwgZ3JvdXBzIHJlZ2FyZGxlc3Mgb2Ygd2hpY2ggY29sdW1uIHdhcyBzb3J0ZWQuIFRoaXMgcHJvcGVydHkgb25seSBhcHBsaWVzIHdoZW4gdGhlcmUgaXMgUm93IEdyb3VwaW5nICYgc29ydGluZyBpcyBoYW5kbGVkIG9uIHRoZSBzZXJ2ZXIuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZVNvcnRBbGxMZXZlbHM6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgc29ydHMgZnVsbHkgbG9hZGVkIGdyb3VwcyBpbiB0aGUgYnJvd3NlciBpbnN0ZWFkIG9mIHJlcXVlc3RpbmcgZnJvbSB0aGUgc2VydmVyLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNlcnZlclNpZGVFbmFibGVDbGllbnRTaWRlU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBvbmx5IHJlZnJlc2ggZ3JvdXBzIGRpcmVjdGx5IGltcGFjdGVkIGJ5IGEgZmlsdGVyLiBUaGlzIHByb3BlcnR5IG9ubHkgYXBwbGllcyB3aGVuIHRoZXJlIGlzIFJvdyBHcm91cGluZyAmIGZpbHRlcmluZyBpcyBoYW5kbGVkIG9uIHRoZSBzZXJ2ZXIuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlT25seVJlZnJlc2hGaWx0ZXJlZEdyb3VwczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogV2hlbiBlbmFibGVkLCBTb3J0aW5nIHdpbGwgYmUgZG9uZSBvbiB0aGUgc2VydmVyLiBPbmx5IGFwcGxpY2FibGUgd2hlbiBgc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw9dHJ1ZWAuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAZGVwcmVjYXRlZCB2MzEuMVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlU29ydE9uU2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGVuYWJsZWQsIEZpbHRlcmluZyB3aWxsIGJlIGRvbmUgb24gdGhlIHNlcnZlci4gT25seSBhcHBsaWNhYmxlIHdoZW4gYHN1cHByZXNzU2VydmVyU2lkZUluZmluaXRlU2Nyb2xsPXRydWVgLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGRlcHJlY2F0ZWQgdjMxLjFcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2VydmVyU2lkZUZpbHRlck9uU2VydmVyOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBVc2VkIHRvIHNwbGl0IHBpdm90IGZpZWxkIHN0cmluZ3MgZm9yIGdlbmVyYXRpbmcgcGl2b3QgcmVzdWx0IGNvbHVtbnMgd2hlbiBgcGl2b3RSZXN1bHRGaWVsZHNgIGlzIHByb3ZpZGVkIGFzIHBhcnQgb2YgYSBgZ2V0Um93c2Agc3VjY2Vzcy5cbiAgICAgKiBAZGVmYXVsdCAnXydcbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZXJ2ZXJTaWRlUGl2b3RSZXN1bHRGaWVsZFNlcGFyYXRvcjogc3RyaW5nIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUbyB1c2UgdGhlIHZpZXdwb3J0IHJvdyBtb2RlbCB5b3UgbmVlZCB0byBwcm92aWRlIHRoZSBncmlkIHdpdGggYSBgdmlld3BvcnREYXRhc291cmNlYC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnREYXRhc291cmNlOiBJVmlld3BvcnREYXRhc291cmNlIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIHVzaW5nIHZpZXdwb3J0IHJvdyBtb2RlbCwgc2V0cyB0aGUgcGFnZSBzaXplIGZvciB0aGUgdmlld3BvcnQuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdmlld3BvcnRSb3dNb2RlbFBhZ2VTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gdXNpbmcgdmlld3BvcnQgcm93IG1vZGVsLCBzZXRzIHRoZSBidWZmZXIgc2l6ZSBmb3IgdGhlIHZpZXdwb3J0LlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHZpZXdwb3J0Um93TW9kZWxCdWZmZXJTaXplOiBudW1iZXIgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWx3YXlzIHNob3cgdGhlIGhvcml6b250YWwgc2Nyb2xsYmFyLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGFsd2F5cyBzaG93IHRoZSB2ZXJ0aWNhbCBzY3JvbGxiYXIuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGRlYm91bmNlIHRoZSB2ZXJ0aWNhbCBzY3JvbGxiYXIuIENhbiBwcm92aWRlIHNtb290aGVyIHNjcm9sbGluZyBvbiBzbG93IG1hY2hpbmVzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVib3VuY2VWZXJ0aWNhbFNjcm9sbGJhcjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBuZXZlciBzaG93IHRoZSBob3Jpem9udGFsIHNjcm9sbC4gVGhpcyBpcyB1c2VmdWwgaWYgdGhlIGdyaWQgaXMgYWxpZ25lZCB3aXRoIGFub3RoZXIgZ3JpZCBhbmQgd2lsbCBzY3JvbGwgd2hlbiB0aGUgb3RoZXIgZ3JpZCBzY3JvbGxzLiAoU2hvdWxkIG5vdCBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGggYGFsd2F5c1Nob3dIb3Jpem9udGFsU2Nyb2xsYC4pXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIb3Jpem9udGFsU2Nyb2xsOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3Qgc2Nyb2xsIHRvIHRoZSB0b3Agd2hlbiBuZXcgcm93IGRhdGEgaXMgcHJvdmlkZWQuIFVzZSB0aGlzIGlmIHlvdSBkb24ndCB3YW50IHRoZSBkZWZhdWx0IGJlaGF2aW91ciBvZiBzY3JvbGxpbmcgdG8gdGhlIHRvcCBldmVyeSB0aW1lIHlvdSBsb2FkIG5ldyBkYXRhLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsT25OZXdEYXRhOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBXaGVuIGB0cnVlYCwgdGhlIGdyaWQgd2lsbCBub3QgYWxsb3cgbW91c2V3aGVlbCAvIHRvdWNocGFkIHNjcm9sbCB3aGVuIHBvcHVwIGVsZW1lbnRzIGFyZSBwcmVzZW50LlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gYHRydWVgLCB0aGUgZ3JpZCB3aWxsIG5vdCB1c2UgYW5pbWF0aW9uIGZyYW1lcyB3aGVuIGRyYXdpbmcgcm93cyB3aGlsZSBzY3JvbGxpbmcuIFVzZSB0aGlzIGlmIHRoZSBncmlkIGlzIHdvcmtpbmcgZmFzdCBlbm91Z2ggdGhhdCB5b3UgZG9uJ3QgbmVlZCBhbmltYXRpb24gZnJhbWVzIGFuZCB5b3UgZG9uJ3Qgd2FudCB0aGUgZ3JpZCB0byBmbGlja2VyLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBtaWRkbGUgY2xpY2tzIHdpbGwgcmVzdWx0IGluIGBjbGlja2AgZXZlbnRzIGZvciBjZWxscyBhbmQgcm93cy4gT3RoZXJ3aXNlIHRoZSBicm93c2VyIHdpbGwgdXNlIG1pZGRsZSBjbGljayB0byBzY3JvbGwgdGhlIGdyaWQuPGJyIC8+KipOb3RlOioqIE5vdCBhbGwgYnJvd3NlcnMgZmlyZSBgY2xpY2tgIGV2ZW50cyB3aXRoIHRoZSBtaWRkbGUgYnV0dG9uLiBNb3N0IHdpbGwgZmlyZSBvbmx5IGBtb3VzZWRvd25gIGFuZCBgbW91c2V1cGAgZXZlbnRzLCB3aGljaCBjYW4gYmUgdXNlZCB0byBmb2N1cyBhIGNlbGwsIGJ1dCB3aWxsIG5vdCB3b3JrIHRvIGNhbGwgdGhlIGBvbkNlbGxDbGlja2VkYCBmdW5jdGlvbi5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc01pZGRsZUNsaWNrU2Nyb2xsczogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBtb3VzZSB3aGVlbCBldmVudHMgd2lsbCBiZSBwYXNzZWQgdG8gdGhlIGJyb3dzZXIuIFVzZWZ1bCBpZiB5b3VyIGdyaWQgaGFzIG5vIHZlcnRpY2FsIHNjcm9sbHMgYW5kIHlvdSB3YW50IHRoZSBtb3VzZSB0byBzY3JvbGwgdGhlIGJyb3dzZXIgcGFnZS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUHJldmVudERlZmF1bHRPbk1vdXNlV2hlZWw6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFRlbGwgdGhlIGdyaWQgaG93IHdpZGUgaW4gcGl4ZWxzIHRoZSBzY3JvbGxiYXIgaXMsIHdoaWNoIGlzIHVzZWQgaW4gZ3JpZCB3aWR0aCBjYWxjdWxhdGlvbnMuIFNldCBvbmx5IGlmIHVzaW5nIG5vbi1zdGFuZGFyZCBicm93c2VyLXByb3ZpZGVkIHNjcm9sbGJhcnMsIHNvIHRoZSBncmlkIGNhbiB1c2UgdGhlIG5vbi1zdGFuZGFyZCBzaXplIGluIGl0cyBjYWxjdWxhdGlvbnMuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc2Nyb2xsYmFyV2lkdGg6IG51bWJlciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogVHlwZSBvZiBSb3cgU2VsZWN0aW9uOiBgc2luZ2xlYCwgYG11bHRpcGxlYC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93U2VsZWN0aW9uOiAnc2luZ2xlJyB8ICdtdWx0aXBsZScgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYWxsb3cgbXVsdGlwbGUgcm93cyB0byBiZSBzZWxlY3RlZCB1c2luZyBzaW5nbGUgY2xpY2suXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93TXVsdGlTZWxlY3RXaXRoQ2xpY2s6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgcm93cyB3aWxsIG5vdCBiZSBkZXNlbGVjdGVkIGlmIHlvdSBob2xkIGRvd24gYEN0cmxgIGFuZCBjbGljayB0aGUgcm93IG9yIHByZXNzIGBTcGFjZWAuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dEZXNlbGVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCByb3cgc2VsZWN0aW9uIHdvbid0IGhhcHBlbiB3aGVuIHJvd3MgYXJlIGNsaWNrZWQuIFVzZSB3aGVuIHlvdSBvbmx5IHdhbnQgY2hlY2tib3ggc2VsZWN0aW9uLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIElmIGB0cnVlYCwgY2VsbHMgd29uJ3QgYmUgZm9jdXNhYmxlLiBUaGlzIG1lYW5zIGtleWJvYXJkIG5hdmlnYXRpb24gd2lsbCBiZSBkaXNhYmxlZCBmb3IgZ3JpZCBjZWxscywgYnV0IHJlbWFpbiBlbmFibGVkIGluIG90aGVyIGVsZW1lbnRzIG9mIHRoZSBncmlkIHN1Y2ggYXMgY29sdW1uIGhlYWRlcnMsIGZsb2F0aW5nIGZpbHRlcnMsIHRvb2wgcGFuZWxzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzQ2VsbEZvY3VzOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJZiBgdHJ1ZWAsIGhlYWRlciBjZWxscyB3b24ndCBiZSBmb2N1c2FibGUuIFRoaXMgbWVhbnMga2V5Ym9hcmQgbmF2aWdhdGlvbiB3aWxsIGJlIGRpc2FibGVkIGZvciBncmlkIGhlYWRlciBjZWxscywgYnV0IHJlbWFpbiBlbmFibGVkIGluIG90aGVyIGVsZW1lbnRzIG9mIHRoZSBncmlkIHN1Y2ggYXMgZ3JpZCBjZWxscyBhbmQgdG9vbCBwYW5lbHMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NIZWFkZXJGb2N1czogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogSWYgYHRydWVgLCBvbmx5IGEgc2luZ2xlIHJhbmdlIGNhbiBiZSBzZWxlY3RlZC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gYmUgYWJsZSB0byBzZWxlY3QgdGhlIHRleHQgd2l0aGluIGNlbGxzLlxuICAgICAqXG4gICAgICogICAgICoqTm90ZToqKiBXaGVuIHRoaXMgaXMgc2V0IHRvIGB0cnVlYCwgdGhlIGNsaXBib2FyZCBzZXJ2aWNlIGlzIGRpc2FibGVkIGFuZCBvbmx5IHNlbGVjdGVkIHRleHQgaXMgY29waWVkLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIGVuYWJsZSBSYW5nZSBTZWxlY3Rpb24uXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VTZWxlY3Rpb246IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBSYW5nZSBIYW5kbGUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlUmFuZ2VIYW5kbGU6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gZW5hYmxlIHRoZSBGaWxsIEhhbmRsZS5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBlbmFibGVGaWxsSGFuZGxlOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCd4J2AgdG8gZm9yY2UgdGhlIGZpbGwgaGFuZGxlIGRpcmVjdGlvbiB0byBob3Jpem9udGFsLCBvciBzZXQgdG8gYCd5J2AgdG8gZm9yY2UgdGhlIGZpbGwgaGFuZGxlIGRpcmVjdGlvbiB0byB2ZXJ0aWNhbC5cbiAgICAgKiBAZGVmYXVsdCAneHknXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGZpbGxIYW5kbGVEaXJlY3Rpb246ICd4JyB8ICd5JyB8ICd4eScgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0aGlzIHRvIGB0cnVlYCB0byBwcmV2ZW50IGNlbGwgdmFsdWVzIGZyb20gYmVpbmcgY2xlYXJlZCB3aGVuIHRoZSBSYW5nZSBTZWxlY3Rpb24gaXMgcmVkdWNlZCBieSB0aGUgRmlsbCBIYW5kbGUuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQXJyYXkgZGVmaW5pbmcgdGhlIG9yZGVyIGluIHdoaWNoIHNvcnRpbmcgb2NjdXJzIChpZiBzb3J0aW5nIGlzIGVuYWJsZWQpLiBWYWx1ZXMgY2FuIGJlIGAnYXNjJ2AsIGAnZGVzYydgIG9yIGBudWxsYC4gRm9yIGV4YW1wbGU6IGBzb3J0aW5nT3JkZXI6IFsnYXNjJywgJ2Rlc2MnXWAuXG4gICAgICogQGRlZmF1bHQgW251bGwsICdhc2MnLCAnZGVzYyddXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHNvcnRpbmdPcmRlcjogU29ydERpcmVjdGlvbltdIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHNwZWNpZnkgdGhhdCB0aGUgc29ydCBzaG91bGQgdGFrZSBhY2NlbnRlZCBjaGFyYWN0ZXJzIGludG8gYWNjb3VudC4gSWYgdGhpcyBmZWF0dXJlIGlzIHR1cm5lZCBvbiB0aGUgc29ydCB3aWxsIGJlIHNsb3dlci5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBhY2NlbnRlZFNvcnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gc2hvdyB0aGUgJ25vIHNvcnQnIGljb24uXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdW5Tb3J0SWNvbjogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBzdXBwcmVzcyBtdWx0aS1zb3J0IHdoZW4gdGhlIHVzZXIgc2hpZnQtY2xpY2tzIGEgY29sdW1uIGhlYWRlci5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzdXBwcmVzc011bHRpU29ydDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU2V0IHRvIGB0cnVlYCB0byBhbHdheXMgbXVsdGktc29ydCB3aGVuIHRoZSB1c2VyIGNsaWNrcyBhIGNvbHVtbiBoZWFkZXIsIHJlZ2FyZGxlc3Mgb2Yga2V5IHByZXNzZXMuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgYWx3YXlzTXVsdGlTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYCdjdHJsJ2AgdG8gaGF2ZSBtdWx0aSBzb3J0aW5nIHdvcmsgdXNpbmcgdGhlIGBDdHJsYCAob3IgYENvbW1hbmQg4oyYYCBmb3IgTWFjKSBrZXkuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIG11bHRpU29ydEtleTogJ2N0cmwnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBTZXQgdG8gYHRydWVgIHRvIHN1cHByZXNzIHNvcnRpbmcgb2YgdW4tc29ydGVkIGRhdGEgdG8gbWF0Y2ggb3JpZ2luYWwgcm93IGRhdGEuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NNYWludGFpblVuc29ydGVkT3JkZXI6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEljb25zIHRvIHVzZSBpbnNpZGUgdGhlIGdyaWQgaW5zdGVhZCBvZiB0aGUgZ3JpZCdzIGRlZmF1bHQgaWNvbnMuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaWNvbnM6IHsgW2tleTogc3RyaW5nXTogKCguLi5hcmdzOiBhbnlbXSkgPT4gYW55KSB8IHN0cmluZyB9IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBEZWZhdWx0IHJvdyBoZWlnaHQgaW4gcGl4ZWxzLlxuICAgICAqIEBkZWZhdWx0IDI1XG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHJvd0hlaWdodDogbnVtYmVyIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBUaGUgc3R5bGUgcHJvcGVydGllcyB0byBhcHBseSB0byBhbGwgcm93cy4gU2V0IHRvIGFuIG9iamVjdCBvZiBrZXkgKHN0eWxlIG5hbWVzKSBhbmQgdmFsdWVzIChzdHlsZSB2YWx1ZXMpLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dTdHlsZTogUm93U3R5bGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENTUyBjbGFzcyhlcykgZm9yIGFsbCByb3dzLiBQcm92aWRlIGVpdGhlciBhIHN0cmluZyAoY2xhc3MgbmFtZSkgb3IgYXJyYXkgb2Ygc3RyaW5ncyAoYXJyYXkgb2YgY2xhc3MgbmFtZXMpLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByb3dDbGFzczogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFJ1bGVzIHdoaWNoIGNhbiBiZSBhcHBsaWVkIHRvIGluY2x1ZGUgY2VydGFpbiBDU1MgY2xhc3Nlcy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcm93Q2xhc3NSdWxlczogUm93Q2xhc3NSdWxlczxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gbm90IGhpZ2hsaWdodCByb3dzIGJ5IGFkZGluZyB0aGUgYGFnLXJvdy1ob3ZlcmAgQ1NTIGNsYXNzLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHN1cHByZXNzUm93SG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFVzZXMgQ1NTIGB0b3BgIGluc3RlYWQgb2YgQ1NTIGB0cmFuc2Zvcm1gIGZvciBwb3NpdGlvbmluZyByb3dzLiBVc2VmdWwgaWYgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiBpcyBjYXVzaW5nIGlzc3VlcyBzdWNoIGFzIHVzZWQgaW4gcm93IHNwYW5uaW5nLlxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgc3VwcHJlc3NSb3dUcmFuc2Zvcm06IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFNldCB0byBgdHJ1ZWAgdG8gaGlnaGxpZ2h0IGNvbHVtbnMgYnkgYWRkaW5nIHRoZSBgYWctY29sdW1uLWhvdmVyYCBDU1MgY2xhc3MuXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgY29sdW1uSG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFByb3ZpZGUgYSBjdXN0b20gYGdyaWRJZGAgZm9yIHRoaXMgaW5zdGFuY2Ugb2YgdGhlIGdyaWQuIFZhbHVlIHdpbGwgYmUgc2V0IG9uIHRoZSByb290IERPTSBub2RlIHVzaW5nIHRoZSBhdHRyaWJ1dGUgYGdyaWQtaWRgIGFzIHdlbGwgYXMgYmVpbmcgYWNjZXNzaWJsZSB2aWEgdGhlIGBncmlkQXBpLmdldEdyaWRJZCgpYCBtZXRob2QuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ3JpZElkOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgc29ydHMgb25seSB0aGUgcm93cyBhZGRlZC91cGRhdGVkIGJ5IGEgdHJhbnNhY3Rpb24uXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZGVsdGFTb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdHJlZURhdGFEaXNwbGF5VHlwZTogVHJlZURhdGFEaXNwbGF5VHlwZSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZW5hYmxlR3JvdXBFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBJbml0aWFsIHN0YXRlIGZvciB0aGUgZ3JpZC4gT25seSByZWFkIG9uY2Ugb24gaW5pdGlhbGl6YXRpb24uIENhbiBiZSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggYGFwaS5nZXRTdGF0ZSgpYCB0byBzYXZlIGFuZCByZXN0b3JlIGdyaWQgc3RhdGUuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaW5pdGlhbFN0YXRlOiBHcmlkU3RhdGUgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEZvciBjdXN0b21pc2luZyB0aGUgY29udGV4dCBtZW51LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBnZXRDb250ZXh0TWVudUl0ZW1zOiBHZXRDb250ZXh0TWVudUl0ZW1zPFREYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogRm9yIGN1c3RvbWlzaW5nIHRoZSBtYWluICdjb2x1bW4gaGVhZGVyJyBtZW51LlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldE1haW5NZW51SXRlbXM6IEdldE1haW5NZW51SXRlbXM8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdXNlciB0byBwcm9jZXNzIHBvcHVwcyBhZnRlciB0aGV5IGFyZSBjcmVhdGVkLiBBcHBsaWNhdGlvbnMgY2FuIHVzZSB0aGlzIGlmIHRoZXkgd2FudCB0bywgZm9yIGV4YW1wbGUsIHJlcG9zaXRpb24gdGhlIHBvcHVwLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwb3N0UHJvY2Vzc1BvcHVwOiAoKHBhcmFtczogUG9zdFByb2Nlc3NQb3B1cFBhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgdGhlIHVzZXIgdG8gcHJvY2VzcyB0aGUgY29sdW1ucyBiZWluZyByZW1vdmVkIGZyb20gdGhlIHBpbm5lZCBzZWN0aW9uIGJlY2F1c2UgdGhlIHZpZXdwb3J0IGlzIHRvbyBzbWFsbCB0byBhY2NvbW1vZGF0ZSB0aGVtLlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgb2YgY29sdW1ucyB0byBiZSByZW1vdmVkIGZyb20gdGhlIHBpbm5lZCBhcmVhcy5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzVW5waW5uZWRDb2x1bW5zOiAoKHBhcmFtczogUHJvY2Vzc1VucGlubmVkQ29sdW1uc1BhcmFtczxURGF0YT4pID0+IENvbHVtbltdKSB8IHVuZGVmaW5lZCA9XG4gICAgICAgIHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGNlbGxzIGZvciB0aGUgY2xpcGJvYXJkLiBIYW5keSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBgRGF0ZWAgb2JqZWN0cyB0aGF0IG5lZWQgdG8gaGF2ZSBhIHBhcnRpY3VsYXIgZm9ybWF0IGlmIGltcG9ydGluZyBpbnRvIEV4Y2VsLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzQ2VsbEZvckNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9XG4gICAgICAgIHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBjbGlwYm9hcmQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NIZWFkZXJGb3JDbGlwYm9hcmQ6ICgocGFyYW1zOiBQcm9jZXNzSGVhZGVyRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9XG4gICAgICAgIHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGdyb3VwIGhlYWRlciB2YWx1ZXMgZm9yIHRoZSBjbGlwYm9hcmQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NHcm91cEhlYWRlckZvckNsaXBib2FyZDpcbiAgICAgICAgfCAoKHBhcmFtczogUHJvY2Vzc0dyb3VwSGVhZGVyRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KVxuICAgICAgICB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBwcm9jZXNzIGNlbGxzIGZyb20gdGhlIGNsaXBib2FyZC4gSGFuZHkgaWYgZm9yIGV4YW1wbGUgeW91IGhhdmUgbnVtYmVyIGZpZWxkcywgYW5kIHdhbnQgdG8gYmxvY2sgbm9uLW51bWJlcnMgZnJvbSBnZXR0aW5nIGludG8gdGhlIGdyaWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NDZWxsRnJvbUNsaXBib2FyZDogKChwYXJhbXM6IFByb2Nlc3NDZWxsRm9yRXhwb3J0UGFyYW1zPFREYXRhPikgPT4gYW55KSB8IHVuZGVmaW5lZCA9XG4gICAgICAgIHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIHlvdSB0byBnZXQgdGhlIGRhdGEgdGhhdCB3b3VsZCBvdGhlcndpc2UgZ28gdG8gdGhlIGNsaXBib2FyZC4gVG8gYmUgdXNlZCB3aGVuIHlvdSB3YW50IHRvIGNvbnRyb2wgdGhlICdjb3B5IHRvIGNsaXBib2FyZCcgb3BlcmF0aW9uIHlvdXJzZWxmLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBzZW5kVG9DbGlwYm9hcmQ6ICgocGFyYW1zOiBTZW5kVG9DbGlwYm9hcmRQYXJhbXM8VERhdGE+KSA9PiB2b2lkKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIGNvbXBsZXRlIGNvbnRyb2wgb2YgdGhlIHBhc3RlIG9wZXJhdGlvbiwgaW5jbHVkaW5nIGNhbmNlbGxpbmcgdGhlIG9wZXJhdGlvbiAoc28gbm90aGluZyBoYXBwZW5zKSBvciByZXBsYWNpbmcgdGhlIGRhdGEgd2l0aCBvdGhlciBkYXRhLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBwcm9jZXNzRGF0YUZyb21DbGlwYm9hcmQ6XG4gICAgICAgIHwgKChwYXJhbXM6IFByb2Nlc3NEYXRhRnJvbUNsaXBib2FyZFBhcmFtczxURGF0YT4pID0+IHN0cmluZ1tdW10gfCBudWxsKVxuICAgICAgICB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogR3JpZCBjYWxscyB0aGlzIG1ldGhvZCB0byBrbm93IGlmIGFuIGV4dGVybmFsIGZpbHRlciBpcyBwcmVzZW50LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0V4dGVybmFsRmlsdGVyUHJlc2VudDogKChwYXJhbXM6IElzRXh0ZXJuYWxGaWx0ZXJQcmVzZW50UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPVxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLyoqIFNob3VsZCByZXR1cm4gYHRydWVgIGlmIGV4dGVybmFsIGZpbHRlciBwYXNzZXMsIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBkb2VzRXh0ZXJuYWxGaWx0ZXJQYXNzOiAoKG5vZGU6IElSb3dOb2RlPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgdG8gY3VzdG9taXNlIHRoZSBjaGFydCB0b29sYmFyIGl0ZW1zLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldENoYXJ0VG9vbGJhckl0ZW1zOiBHZXRDaGFydFRvb2xiYXJJdGVtcyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgdG8gZW5hYmxlIGRpc3BsYXlpbmcgdGhlIGNoYXJ0IGluIGFuIGFsdGVybmF0aXZlIGNoYXJ0IGNvbnRhaW5lci5cbiAgICAgKiBAaW5pdGlhbFxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBjcmVhdGVDaGFydENvbnRhaW5lcjogKChwYXJhbXM6IENoYXJ0UmVmUGFyYW1zPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBlbGVtZW50IHRoYXQgd2lsbCBiZSBmb2N1c2VkIHdoZW4gdGhlIGdyaWQgcmVjZWl2ZXMgZm9jdXMgZnJvbSBvdXRzaWRlIGVsZW1lbnRzICh0YWJiaW5nIGludG8gdGhlIGdyaWQpLlxuICAgICAqIEByZXR1cm5zIGBUcnVlYCBpZiB0aGlzIGZ1bmN0aW9uIHNob3VsZCBvdmVycmlkZSB0aGUgZ3JpZCdzIGRlZmF1bHQgYmVoYXZpb3IsIGBGYWxzZWAgdG8gYWxsb3cgdGhlIGdyaWQncyBkZWZhdWx0IGJlaGF2aW9yLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmb2N1c0dyaWRJbm5lckVsZW1lbnQ6ICgocGFyYW1zOiBGb2N1c0dyaWRJbm5lckVsZW1lbnRQYXJhbXM8VERhdGE+KSA9PiBib29sZWFuKSB8IHVuZGVmaW5lZCA9XG4gICAgICAgIHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBuYXZpZ2F0aW9uIChhcnJvdykga2V5IHdoZW4gYSBoZWFkZXIgaXMgZm9jdXNlZC4gUmV0dXJuIHRoZSBuZXh0IEhlYWRlciBwb3NpdGlvbiB0byBuYXZpZ2F0ZSB0byBvciBgbnVsbGAgdG8gc3RheSBvbiBjdXJyZW50IGhlYWRlci5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRIZWFkZXI6XG4gICAgICAgIHwgKChwYXJhbXM6IE5hdmlnYXRlVG9OZXh0SGVhZGVyUGFyYW1zPFREYXRhPikgPT4gSGVhZGVyUG9zaXRpb24gfCBudWxsKVxuICAgICAgICB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBgVGFiYCBrZXkgd2hlbiBhIGhlYWRlciBpcyBmb2N1c2VkLlxuICAgICAqIFJldHVybiB0aGUgbmV4dCBoZWFkZXIgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8sIGB0cnVlYCB0byBzdGF5IG9uIHRoZSBjdXJyZW50IGhlYWRlcixcbiAgICAgKiBvciBgZmFsc2VgIHRvIGxldCB0aGUgYnJvd3NlciBoYW5kbGUgdGhlIHRhYiBiZWhhdmlvdXIuXG4gICAgICogQXMgb2YgdjMxLjMsIHJldHVybmluZyBgbnVsbGAgaXMgZGVwcmVjYXRlZC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgdGFiVG9OZXh0SGVhZGVyOlxuICAgICAgICB8ICgocGFyYW1zOiBUYWJUb05leHRIZWFkZXJQYXJhbXM8VERhdGE+KSA9PiBIZWFkZXJQb3NpdGlvbiB8IGJvb2xlYW4gfCBudWxsKVxuICAgICAgICB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgdGhlIGRlZmF1bHQgYmVoYXZpb3VyIGZvciB3aGVuIHVzZXIgaGl0cyBuYXZpZ2F0aW9uIChhcnJvdykga2V5IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuIFJldHVybiB0aGUgbmV4dCBDZWxsIHBvc2l0aW9uIHRvIG5hdmlnYXRlIHRvIG9yIGBudWxsYCB0byBzdGF5IG9uIGN1cnJlbnQgY2VsbC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgbmF2aWdhdGVUb05leHRDZWxsOiAoKHBhcmFtczogTmF2aWdhdGVUb05leHRDZWxsUGFyYW1zPFREYXRhPikgPT4gQ2VsbFBvc2l0aW9uIHwgbnVsbCkgfCB1bmRlZmluZWQgPVxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IGJlaGF2aW91ciBmb3Igd2hlbiB1c2VyIGhpdHMgYFRhYmAga2V5IHdoZW4gYSBjZWxsIGlzIGZvY3VzZWQuXG4gICAgICogUmV0dXJuIHRoZSBuZXh0IGNlbGwgcG9zaXRpb24gdG8gbmF2aWdhdGUgdG8sIGB0cnVlYCB0byBzdGF5IG9uIHRoZSBjdXJyZW50IGNlbGwsXG4gICAgICogb3IgYGZhbHNlYCB0byBsZXQgdGhlIGJyb3dzZXIgaGFuZGxlIHRoZSB0YWIgYmVoYXZpb3VyLlxuICAgICAqIEFzIG9mIHYzMS4zLCByZXR1cm5pbmcgYG51bGxgIGlzIGRlcHJlY2F0ZWQuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHRhYlRvTmV4dENlbGw6ICgocGFyYW1zOiBUYWJUb05leHRDZWxsUGFyYW1zPFREYXRhPikgPT4gQ2VsbFBvc2l0aW9uIHwgYm9vbGVhbiB8IG51bGwpIHwgdW5kZWZpbmVkID1cbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIC8qKiBBIGNhbGxiYWNrIGZvciBsb2NhbGlzaW5nIHRleHQgd2l0aGluIHRoZSBncmlkLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldExvY2FsZVRleHQ6ICgocGFyYW1zOiBHZXRMb2NhbGVUZXh0UGFyYW1zPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQWxsb3dzIG92ZXJyaWRpbmcgd2hhdCBgZG9jdW1lbnRgIGlzIHVzZWQuIEN1cnJlbnRseSB1c2VkIGJ5IERyYWcgYW5kIERyb3AgKG1heSBleHRlbmQgdG8gb3RoZXIgcGxhY2VzIGluIHRoZSBmdXR1cmUpLiBVc2UgdGhpcyB3aGVuIHlvdSB3YW50IHRoZSBncmlkIHRvIHVzZSBhIGRpZmZlcmVudCBgZG9jdW1lbnRgIHRoYW4gdGhlIG9uZSBhdmFpbGFibGUgb24gdGhlIGdsb2JhbCBzY29wZS4gVGhpcyBjYW4gaGFwcGVuIGlmIGRvY2tpbmcgb3V0IGNvbXBvbmVudHMgKHNvbWV0aGluZyB3aGljaCBFbGVjdHJvbiBzdXBwb3J0cylcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0RG9jdW1lbnQ6ICgoKSA9PiBEb2N1bWVudCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyB1c2VyIHRvIGZvcm1hdCB0aGUgbnVtYmVycyBpbiB0aGUgcGFnaW5hdGlvbiBwYW5lbCwgaS5lLiAncm93IGNvdW50JyBhbmQgJ3BhZ2UgbnVtYmVyJyBsYWJlbHMuIFRoaXMgaXMgZm9yIHBhZ2luYXRpb24gcGFuZWwgb25seSwgdG8gZm9ybWF0IG51bWJlcnMgaW5zaWRlIHRoZSBncmlkJ3MgY2VsbHMgKGkuZS4geW91ciBkYXRhKSwgdGhlbiB1c2UgYHZhbHVlRm9ybWF0dGVyYCBpbiB0aGUgY29sdW1uIGRlZmluaXRpb25zLlxuICAgICAqIEBpbml0aWFsXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXI6XG4gICAgICAgIHwgKChwYXJhbXM6IFBhZ2luYXRpb25OdW1iZXJGb3JtYXR0ZXJQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmcpXG4gICAgICAgIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byB1c2Ugd2hlbiB5b3UgbmVlZCBhY2Nlc3MgdG8gbW9yZSB0aGVuIHRoZSBjdXJyZW50IGNvbHVtbiBmb3IgYWdncmVnYXRpb24uXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldEdyb3VwUm93QWdnOiAoKHBhcmFtczogR2V0R3JvdXBSb3dBZ2dQYXJhbXM8VERhdGE+KSA9PiBhbnkpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiAoQ2xpZW50LXNpZGUgUm93IE1vZGVsIG9ubHkpIEFsbG93cyBncm91cHMgdG8gYmUgb3BlbiBieSBkZWZhdWx0LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0dyb3VwT3BlbkJ5RGVmYXVsdDogKChwYXJhbXM6IElzR3JvdXBPcGVuQnlEZWZhdWx0UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPVxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBkZWZhdWx0IHNvcnRpbmcgb2YgZ3JvdXBzLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpbml0aWFsR3JvdXBPcmRlckNvbXBhcmF0b3I6XG4gICAgICAgIHwgKChwYXJhbXM6IEluaXRpYWxHcm91cE9yZGVyQ29tcGFyYXRvclBhcmFtczxURGF0YT4pID0+IG51bWJlcilcbiAgICAgICAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBwaXZvdGluZywgdG8gYWxsb3cgY2hhbmdpbmcgdGhlIHNlY29uZCBjb2x1bW4gZGVmaW5pdGlvbi5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sRGVmOiAoKGNvbERlZjogQ29sRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2l0aCBwaXZvdGluZywgdG8gYWxsb3cgY2hhbmdpbmcgdGhlIHNlY29uZCBjb2x1bW4gZ3JvdXAgZGVmaW5pdGlvbi5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgcHJvY2Vzc1Bpdm90UmVzdWx0Q29sR3JvdXBEZWY6ICgoY29sR3JvdXBEZWY6IENvbEdyb3VwRGVmPFREYXRhPikgPT4gdm9pZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIGJlIHVzZWQgd2hlbiB3b3JraW5nIHdpdGggVHJlZSBEYXRhIHdoZW4gYHRyZWVEYXRhID0gdHJ1ZWAuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldERhdGFQYXRoOiBHZXREYXRhUGF0aDxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBzZXR0aW5nIHRoZSBjaGlsZCBjb3VudCBmb3IgYSBncm91cCByb3cuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Q2hpbGRDb3VudDogKChkYXRhSXRlbTogYW55KSA9PiBudW1iZXIpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBBbGxvd3MgcHJvdmlkaW5nIGRpZmZlcmVudCBwYXJhbXMgZm9yIGRpZmZlcmVudCBsZXZlbHMgb2YgZ3JvdXBpbmcuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0U2VydmVyU2lkZUdyb3VwTGV2ZWxQYXJhbXM6XG4gICAgICAgIHwgKChwYXJhbXM6IEdldFNlcnZlclNpZGVHcm91cExldmVsUGFyYW1zUGFyYW1zKSA9PiBTZXJ2ZXJTaWRlR3JvdXBMZXZlbFBhcmFtcylcbiAgICAgICAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBncm91cHMgdG8gYmUgb3BlbiBieSBkZWZhdWx0LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1NlcnZlclNpZGVHcm91cE9wZW5CeURlZmF1bHQ6XG4gICAgICAgIHwgKChwYXJhbXM6IElzU2VydmVyU2lkZUdyb3VwT3BlbkJ5RGVmYXVsdFBhcmFtcykgPT4gYm9vbGVhbilcbiAgICAgICAgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEFsbG93cyBjYW5jZWxsaW5nIHRyYW5zYWN0aW9ucy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbjogSXNBcHBseVNlcnZlclNpZGVUcmFuc2FjdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU1NSTSBUcmVlIERhdGE6IEFsbG93cyBzcGVjaWZ5aW5nIHdoaWNoIHJvd3MgYXJlIGV4cGFuZGFibGUuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGlzU2VydmVyU2lkZUdyb3VwOiBJc1NlcnZlclNpZGVHcm91cCB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogU1NSTSBUcmVlIERhdGE6IEFsbG93cyBzcGVjaWZ5aW5nIGdyb3VwIGtleXMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFNlcnZlclNpZGVHcm91cEtleTogR2V0U2VydmVyU2lkZUdyb3VwS2V5IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBSZXR1cm4gYSBidXNpbmVzcyBrZXkgZm9yIHRoZSBub2RlLiBJZiBpbXBsZW1lbnRlZCwgZWFjaCByb3cgaW4gdGhlIERPTSB3aWxsIGhhdmUgYW4gYXR0cmlidXRlIGByb3ctYnVzaW5lc3Mta2V5PSdhYmMnYCB3aGVyZSBgYWJjYCBpcyB3aGF0IHlvdSByZXR1cm4gYXMgdGhlIGJ1c2luZXNzIGtleS5cbiAgICAgKiBUaGlzIGlzIHVzZWZ1bCBmb3IgYXV0b21hdGVkIHRlc3RpbmcsIGFzIGl0IHByb3ZpZGVzIGEgd2F5IGZvciB5b3VyIHRvb2wgdG8gaWRlbnRpZnkgcm93cyBiYXNlZCBvbiB1bmlxdWUgYnVzaW5lc3Mga2V5cy5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0QnVzaW5lc3NLZXlGb3JOb2RlOiAoKG5vZGU6IElSb3dOb2RlPFREYXRhPikgPT4gc3RyaW5nKSB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogUHJvdmlkZSBhIHB1cmUgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3RyaW5nIElEIHRvIHVuaXF1ZWx5IGlkZW50aWZ5IGEgZ2l2ZW4gcm93LiBUaGlzIGVuYWJsZXMgdGhlIGdyaWQgdG8gd29yayBvcHRpbWFsbHkgd2l0aCBkYXRhIGNoYW5nZXMgYW5kIHVwZGF0ZXMuXG4gICAgICogQGluaXRpYWxcbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SWQ6IEdldFJvd0lkRnVuYzxURGF0YT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIFdoZW4gZW5hYmxlZCwgZ2V0Um93SWQoKSBjYWxsYmFjayBpcyBpbXBsZW1lbnRlZCBhbmQgbmV3IFJvdyBEYXRhIGlzIHNldCwgdGhlIGdyaWQgd2lsbCBkaXNyZWdhcmQgYWxsIHByZXZpb3VzIHJvd3MgYW5kIHRyZWF0IHRoZSBuZXcgUm93IERhdGEgYXMgbmV3IGRhdGEuIEFzIGEgY29uc2VxdWVuY2UsIGFsbCBSb3cgU3RhdGUgKGVnIHNlbGVjdGlvbiwgcmVuZGVyZWQgcm93cykgd2lsbCBiZSByZXNldC5cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyByZXNldFJvd0RhdGFPblVwZGF0ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAvKiogQ2FsbGJhY2sgZmlyZWQgYWZ0ZXIgdGhlIHJvdyBpcyByZW5kZXJlZCBpbnRvIHRoZSBET00uIFNob3VsZCBub3QgYmUgdXNlZCB0byBpbml0aWF0ZSBzaWRlIGVmZmVjdHMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHByb2Nlc3NSb3dQb3N0Q3JlYXRlOiAoKHBhcmFtczogUHJvY2Vzc1Jvd1BhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHRvIGRldGVybWluZSB3aGljaCByb3dzIGFyZSBzZWxlY3RhYmxlLiBCeSBkZWZhdWx0IHJvd3MgYXJlIHNlbGVjdGFibGUsIHNvIHJldHVybiBgZmFsc2VgIHRvIG1ha2UgYSByb3cgdW4tc2VsZWN0YWJsZS5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgaXNSb3dTZWxlY3RhYmxlOiBJc1Jvd1NlbGVjdGFibGU8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBiZSB1c2VkIHdpdGggTWFzdGVyIERldGFpbCB0byBkZXRlcm1pbmUgaWYgYSByb3cgc2hvdWxkIGJlIGEgbWFzdGVyIHJvdy4gSWYgYGZhbHNlYCBpcyByZXR1cm5lZCBubyBkZXRhaWwgcm93IHdpbGwgZXhpc3QgZm9yIHRoaXMgcm93LlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc1Jvd01hc3RlcjogSXNSb3dNYXN0ZXI8VERhdGE+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB0byBmaWxsIHZhbHVlcyBpbnN0ZWFkIG9mIHNpbXBseSBjb3B5aW5nIHZhbHVlcyBvciBpbmNyZWFzaW5nIG51bWJlciB2YWx1ZXMgdXNpbmcgbGluZWFyIHByb2dyZXNzaW9uLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBmaWxsT3BlcmF0aW9uOiAoKHBhcmFtczogRmlsbE9wZXJhdGlvblBhcmFtczxURGF0YT4pID0+IGFueSkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHRvIHBlcmZvcm0gYWRkaXRpb25hbCBzb3J0aW5nIGFmdGVyIHRoZSBncmlkIGhhcyBzb3J0ZWQgdGhlIHJvd3MuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIHBvc3RTb3J0Um93czogKChwYXJhbXM6IFBvc3RTb3J0Um93c1BhcmFtczxURGF0YT4pID0+IHZvaWQpIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIC8qKiBDYWxsYmFjayB2ZXJzaW9uIG9mIHByb3BlcnR5IGByb3dTdHlsZWAgdG8gc2V0IHN0eWxlIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYW4gb2JqZWN0IG9mIENTUyB2YWx1ZXMgb3IgdW5kZWZpbmVkIGZvciBubyBzdHlsZXMuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd1N0eWxlOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXM8VERhdGE+KSA9PiBSb3dTdHlsZSB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd0NsYXNzYCB0byBzZXQgY2xhc3MoZXMpIGZvciBlYWNoIHJvdyBpbmRpdmlkdWFsbHkuIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gZWl0aGVyIGEgc3RyaW5nIChjbGFzcyBuYW1lKSwgYXJyYXkgb2Ygc3RyaW5ncyAoYXJyYXkgb2YgY2xhc3MgbmFtZXMpIG9yIHVuZGVmaW5lZCBmb3Igbm8gY2xhc3MuXG4gICAgICovXG4gICAgQElucHV0KCkgcHVibGljIGdldFJvd0NsYXNzOiAoKHBhcmFtczogUm93Q2xhc3NQYXJhbXM8VERhdGE+KSA9PiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQgPVxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLyoqIENhbGxiYWNrIHZlcnNpb24gb2YgcHJvcGVydHkgYHJvd0hlaWdodGAgdG8gc2V0IGhlaWdodCBmb3IgZWFjaCByb3cgaW5kaXZpZHVhbGx5LiBGdW5jdGlvbiBzaG91bGQgcmV0dXJuIGEgcG9zaXRpdmUgbnVtYmVyIG9mIHBpeGVscywgb3IgcmV0dXJuIGBudWxsYC9gdW5kZWZpbmVkYCB0byB1c2UgdGhlIGRlZmF1bHQgcm93IGhlaWdodC5cbiAgICAgKi9cbiAgICBASW5wdXQoKSBwdWJsaWMgZ2V0Um93SGVpZ2h0OiAoKHBhcmFtczogUm93SGVpZ2h0UGFyYW1zPFREYXRhPikgPT4gbnVtYmVyIHwgdW5kZWZpbmVkIHwgbnVsbCkgfCB1bmRlZmluZWQgPVxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgLyoqIFRlbGxzIHRoZSBncmlkIGlmIHRoaXMgcm93IHNob3VsZCBiZSByZW5kZXJlZCBhcyBmdWxsIHdpZHRoLlxuICAgICAqL1xuICAgIEBJbnB1dCgpIHB1YmxpYyBpc0Z1bGxXaWR0aFJvdzogKChwYXJhbXM6IElzRnVsbFdpZHRoUm93UGFyYW1zPFREYXRhPikgPT4gYm9vbGVhbikgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvKiogVGhlIHRvb2wgcGFuZWwgdmlzaWJpbGl0eSBoYXMgY2hhbmdlZC4gRmlyZXMgdHdpY2UgaWYgc3dpdGNoaW5nIGJldHdlZW4gcGFuZWxzIC0gb25jZSB3aXRoIHRoZSBvbGQgcGFuZWwgYW5kIG9uY2Ugd2l0aCB0aGUgbmV3IHBhbmVsLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbFBhbmVsVmlzaWJsZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBUb29sUGFuZWxWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVGhlIHRvb2wgcGFuZWwgc2l6ZSBoYXMgYmVlbiBjaGFuZ2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgdG9vbFBhbmVsU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxUb29sUGFuZWxTaXplQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBUb29sUGFuZWxTaXplQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVGhlIGNvbHVtbiBtZW51IHZpc2liaWxpdHkgaGFzIGNoYW5nZWQuIEZpcmVzIHR3aWNlIGlmIHN3aXRjaGluZyBiZXR3ZWVuIHRhYnMgLSBvbmNlIHdpdGggdGhlIG9sZCB0YWIgYW5kIG9uY2Ugd2l0aCB0aGUgbmV3IHRhYi5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbk1lbnVWaXNpYmxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtbk1lbnVWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5NZW51VmlzaWJsZUNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFRoZSBjb250ZXh0IG1lbnUgdmlzaWJpbGl0eSBoYXMgY2hhbmdlZCAob3BlbmVkIG9yIGNsb3NlZCkuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb250ZXh0TWVudVZpc2libGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29udGV4dE1lbnVWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb250ZXh0TWVudVZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBDdXQgb3BlcmF0aW9uIGhhcyBzdGFydGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY3V0U3RhcnQ6IEV2ZW50RW1pdHRlcjxDdXRTdGFydEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEN1dFN0YXJ0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBDdXQgb3BlcmF0aW9uIGhhcyBlbmRlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGN1dEVuZDogRXZlbnRFbWl0dGVyPEN1dEVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEN1dEVuZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUGFzdGUgb3BlcmF0aW9uIGhhcyBzdGFydGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVTdGFydDogRXZlbnRFbWl0dGVyPFBhc3RlU3RhcnRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxQYXN0ZVN0YXJ0RXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBQYXN0ZSBvcGVyYXRpb24gaGFzIGVuZGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGFzdGVFbmQ6IEV2ZW50RW1pdHRlcjxQYXN0ZUVuZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFBhc3RlRW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNvbHVtbiwgb3IgZ3JvdXAgb2YgY29sdW1ucywgd2FzIGhpZGRlbiAvIHNob3duLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uVmlzaWJsZTogRXZlbnRFbWl0dGVyPENvbHVtblZpc2libGVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29sdW1uVmlzaWJsZUV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSBjb2x1bW4sIG9yIGdyb3VwIG9mIGNvbHVtbnMsIHdhcyBwaW5uZWQgLyB1bnBpbm5lZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpbm5lZDogRXZlbnRFbWl0dGVyPENvbHVtblBpbm5lZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5QaW5uZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEEgY29sdW1uIHdhcyByZXNpemVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uUmVzaXplZDogRXZlbnRFbWl0dGVyPENvbHVtblJlc2l6ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29sdW1uUmVzaXplZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSBjb2x1bW4gd2FzIG1vdmVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uTW92ZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Nb3ZlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENvbHVtbk1vdmVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIHZhbHVlIGNvbHVtbiB3YXMgYWRkZWQgb3IgcmVtb3ZlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5WYWx1ZUNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFRoZSBwaXZvdCBtb2RlIGZsYWcgd2FzIGNoYW5nZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5QaXZvdE1vZGVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q29sdW1uUGl2b3RNb2RlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5QaXZvdE1vZGVDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIHBpdm90IGNvbHVtbiB3YXMgYWRkZWQsIHJlbW92ZWQgb3Igb3JkZXIgY2hhbmdlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtblBpdm90Q2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbHVtblBpdm90Q2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5QaXZvdENoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEEgY29sdW1uIGdyb3VwIHdhcyBvcGVuZWQgLyBjbG9zZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Hcm91cE9wZW5lZDogRXZlbnRFbWl0dGVyPENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENvbHVtbkdyb3VwT3BlbmVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBVc2VyIHNldCBuZXcgY29sdW1ucy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIG5ld0NvbHVtbnNMb2FkZWQ6IEV2ZW50RW1pdHRlcjxOZXdDb2x1bW5zTG9hZGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIE5ld0NvbHVtbnNMb2FkZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIGdyaWQgY29sdW1ucyBjaGFuZ2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZ3JpZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8R3JpZENvbHVtbnNDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIEdyaWRDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVGhlIGxpc3Qgb2YgZGlzcGxheWVkIGNvbHVtbnMgY2hhbmdlZC4gVGhpcyBjYW4gcmVzdWx0IGZyb20gY29sdW1ucyBvcGVuIC8gY2xvc2UsIGNvbHVtbiBtb3ZlLCBwaXZvdCwgZ3JvdXAsIGV0Yy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGRpc3BsYXllZENvbHVtbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8RGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgRGlzcGxheWVkQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFRoZSBsaXN0IG9mIHJlbmRlcmVkIGNvbHVtbnMgY2hhbmdlZCAob25seSBjb2x1bW5zIGluIHRoZSB2aXNpYmxlIHNjcm9sbGVkIHZpZXdwb3J0IGFyZSByZW5kZXJlZCBieSBkZWZhdWx0KS5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxDb2x1bW5zQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFZpcnR1YWxDb2x1bW5zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBWaXJ0dWFsQ29sdW1uc0NoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFNob3RndW4gLSBnZXRzIGNhbGxlZCB3aGVuIGVpdGhlciBhKSBuZXcgY29sdW1ucyBhcmUgc2V0IG9yIGIpIGBhcGkuYXBwbHlDb2x1bW5TdGF0ZSgpYCBpcyB1c2VkLCBzbyBldmVyeXRoaW5nIGhhcyBjaGFuZ2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uRXZlcnl0aGluZ0NoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5FdmVyeXRoaW5nQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSBtb3VzZSBjdXJzb3IgaXMgaW5pdGlhbGx5IG1vdmVkIG92ZXIgYSBjb2x1bW4gaGVhZGVyLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uSGVhZGVyTW91c2VPdmVyOiBFdmVudEVtaXR0ZXI8Q29sdW1uSGVhZGVyTW91c2VPdmVyRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENvbHVtbkhlYWRlck1vdXNlT3ZlckV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSBtb3VzZSBjdXJzb3IgaXMgbW92ZWQgb3V0IG9mIGEgY29sdW1uIGhlYWRlci5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkhlYWRlck1vdXNlTGVhdmU6IEV2ZW50RW1pdHRlcjxDb2x1bW5IZWFkZXJNb3VzZUxlYXZlRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENvbHVtbkhlYWRlck1vdXNlTGVhdmVFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEEgY2xpY2sgaXMgcGVyZm9ybWVkIG9uIGEgY29sdW1uIGhlYWRlci5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbHVtbkhlYWRlckNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5IZWFkZXJDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENvbHVtbkhlYWRlckNsaWNrZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEEgY29udGV4dCBtZW51IGFjdGlvbiwgc3VjaCBhcyByaWdodC1jbGljayBvciBjb250ZXh0IG1lbnUga2V5IHByZXNzLCBpcyBwZXJmb3JtZWQgb24gYSBjb2x1bW4gaGVhZGVyLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY29sdW1uSGVhZGVyQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxDb2x1bW5IZWFkZXJDb250ZXh0TWVudUV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb2x1bW5IZWFkZXJDb250ZXh0TWVudUV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogT25seSB1c2VkIGJ5IEFuZ3VsYXIsIFJlYWN0IGFuZCBWdWVKUyBBRyBHcmlkIGNvbXBvbmVudHMgKG5vdCB1c2VkIGlmIGRvaW5nIHBsYWluIEphdmFTY3JpcHQpLlxuICAgICAqIElmIHRoZSBncmlkIHJlY2VpdmVzIGNoYW5nZXMgZHVlIHRvIGJvdW5kIHByb3BlcnRpZXMsIHRoaXMgZXZlbnQgZmlyZXMgYWZ0ZXIgdGhlIGdyaWQgaGFzIGZpbmlzaGVkIHByb2Nlc3NpbmcgdGhlIGNoYW5nZS5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNvbXBvbmVudFN0YXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENvbXBvbmVudFN0YXRlQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDb21wb25lbnRTdGF0ZUNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFZhbHVlIGhhcyBjaGFuZ2VkIGFmdGVyIGVkaXRpbmcgKHRoaXMgZXZlbnQgd2lsbCBub3QgZmlyZSBpZiBlZGl0aW5nIHdhcyBjYW5jZWxsZWQsIGVnIEVTQyB3YXMgcHJlc3NlZCkgb3JcbiAgICAgKiAgaWYgY2VsbCB2YWx1ZSBoYXMgY2hhbmdlZCBhcyBhIHJlc3VsdCBvZiBjdXQsIHBhc3RlLCBjZWxsIGNsZWFyIChwcmVzc2luZyBEZWxldGUga2V5KSxcbiAgICAgKiBmaWxsIGhhbmRsZSwgY29weSByYW5nZSBkb3duLCB1bmRvIGFuZCByZWRvLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbFZhbHVlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENlbGxWYWx1ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ2VsbFZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVmFsdWUgaGFzIGNoYW5nZWQgYWZ0ZXIgZWRpdGluZy4gT25seSBmaXJlcyB3aGVuIGByZWFkT25seUVkaXQ9dHJ1ZWAuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdFJlcXVlc3Q6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdFJlcXVlc3RFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ2VsbEVkaXRSZXF1ZXN0RXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIGNlbGwncyB2YWx1ZSB3aXRoaW4gYSByb3cgaGFzIGNoYW5nZWQuIFRoaXMgZXZlbnQgY29ycmVzcG9uZHMgdG8gRnVsbCBSb3cgRWRpdGluZyBvbmx5LlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93VmFsdWVDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Um93VmFsdWVDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFJvd1ZhbHVlQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogRWRpdGluZyBhIGNlbGwgaGFzIHN0YXJ0ZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRWRpdGluZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxDZWxsRWRpdGluZ1N0YXJ0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ2VsbEVkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBFZGl0aW5nIGEgY2VsbCBoYXMgc3RvcHBlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxFZGl0aW5nU3RvcHBlZDogRXZlbnRFbWl0dGVyPENlbGxFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDZWxsRWRpdGluZ1N0b3BwZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEVkaXRpbmcgYSByb3cgaGFzIHN0YXJ0ZWQgKHdoZW4gcm93IGVkaXRpbmcgaXMgZW5hYmxlZCkuIFdoZW4gcm93IGVkaXRpbmcsIHRoaXMgZXZlbnQgd2lsbCBiZSBmaXJlZCBvbmNlIGFuZCBgY2VsbEVkaXRpbmdTdGFydGVkYCB3aWxsIGJlIGZpcmVkIGZvciBlYWNoIGluZGl2aWR1YWwgY2VsbC4gT25seSBmaXJlcyB3aGVuIGRvaW5nIEZ1bGwgUm93IEVkaXRpbmcuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dFZGl0aW5nU3RhcnRlZDogRXZlbnRFbWl0dGVyPFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFJvd0VkaXRpbmdTdGFydGVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBFZGl0aW5nIGEgcm93IGhhcyBzdG9wcGVkICh3aGVuIHJvdyBlZGl0aW5nIGlzIGVuYWJsZWQpLiBXaGVuIHJvdyBlZGl0aW5nLCB0aGlzIGV2ZW50IHdpbGwgYmUgZmlyZWQgb25jZSBhbmQgYGNlbGxFZGl0aW5nU3RvcHBlZGAgd2lsbCBiZSBmaXJlZCBmb3IgZWFjaCBpbmRpdmlkdWFsIGNlbGwuIE9ubHkgZmlyZXMgd2hlbiBkb2luZyBGdWxsIFJvdyBFZGl0aW5nLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RWRpdGluZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxSb3dFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBSb3dFZGl0aW5nU3RvcHBlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVW5kbyBvcGVyYXRpb24gaGFzIHN0YXJ0ZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB1bmRvU3RhcnRlZDogRXZlbnRFbWl0dGVyPFVuZG9TdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VW5kb1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFVuZG8gb3BlcmF0aW9uIGhhcyBlbmRlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHVuZG9FbmRlZDogRXZlbnRFbWl0dGVyPFVuZG9FbmRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFVuZG9FbmRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUmVkbyBvcGVyYXRpb24gaGFzIHN0YXJ0ZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByZWRvU3RhcnRlZDogRXZlbnRFbWl0dGVyPFJlZG9TdGFydGVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8UmVkb1N0YXJ0ZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFJlZG8gb3BlcmF0aW9uIGhhcyBlbmRlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJlZG9FbmRlZDogRXZlbnRFbWl0dGVyPFJlZG9FbmRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJlZG9FbmRlZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogUmFuZ2UgZGVsZXRlIG9wZXJhdGlvbiAoY2VsbCBjbGVhcikgaGFzIHN0YXJ0ZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByYW5nZURlbGV0ZVN0YXJ0OiBFdmVudEVtaXR0ZXI8UmFuZ2VEZWxldGVTdGFydEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBSYW5nZURlbGV0ZVN0YXJ0RXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBSYW5nZSBkZWxldGUgb3BlcmF0aW9uIChjZWxsIGNsZWFyKSBoYXMgZW5kZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByYW5nZURlbGV0ZUVuZDogRXZlbnRFbWl0dGVyPFJhbmdlRGVsZXRlRW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFJhbmdlRGVsZXRlRW5kRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBGaWxsIG9wZXJhdGlvbiBoYXMgc3RhcnRlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpbGxTdGFydDogRXZlbnRFbWl0dGVyPEZpbGxTdGFydEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEZpbGxTdGFydEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogRmlsbCBvcGVyYXRpb24gaGFzIGVuZGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsbEVuZDogRXZlbnRFbWl0dGVyPEZpbGxFbmRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxGaWxsRW5kRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBGaWx0ZXIgaGFzIGJlZW4gb3BlbmVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyT3BlbmVkOiBFdmVudEVtaXR0ZXI8RmlsdGVyT3BlbmVkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIEZpbHRlck9wZW5lZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogRmlsdGVyIGhhcyBiZWVuIG1vZGlmaWVkIGFuZCBhcHBsaWVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEZpbHRlckNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgRmlsdGVyQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogRmlsdGVyIHdhcyBtb2RpZmllZCBidXQgbm90IGFwcGxpZWQuIFVzZWQgd2hlbiBmaWx0ZXJzIGhhdmUgJ0FwcGx5JyBidXR0b25zLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZmlsdGVyTW9kaWZpZWQ6IEV2ZW50RW1pdHRlcjxGaWx0ZXJNb2RpZmllZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBGaWx0ZXJNb2RpZmllZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQWR2YW5jZWQgRmlsdGVyIEJ1aWxkZXIgdmlzaWJpbGl0eSBoYXMgY2hhbmdlZCAob3BlbmVkIG9yIGNsb3NlZCkuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBhZHZhbmNlZEZpbHRlckJ1aWxkZXJWaXNpYmxlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFxuICAgICAgICBBZHZhbmNlZEZpbHRlckJ1aWxkZXJWaXNpYmxlQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4gPSBuZXcgRXZlbnRFbWl0dGVyPEFkdmFuY2VkRmlsdGVyQnVpbGRlclZpc2libGVDaGFuZ2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGNyZWF0ZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydENyZWF0ZWQ6IEV2ZW50RW1pdHRlcjxDaGFydENyZWF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ2hhcnRDcmVhdGVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBUaGUgZGF0YSByYW5nZSBmb3IgdGhlIGNoYXJ0IGhhcyBiZWVuIGNoYW5nZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydFJhbmdlU2VsZWN0aW9uQ2hhbmdlZDogRXZlbnRFbWl0dGVyPENoYXJ0UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9XG4gICAgICAgIG5ldyBFdmVudEVtaXR0ZXI8Q2hhcnRSYW5nZVNlbGVjdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZvcm1hdHRpbmcgY2hhbmdlcyBoYXZlIGJlZW4gbWFkZSBieSB1c2VycyB0aHJvdWdoIHRoZSBDdXN0b21pemUgUGFuZWwuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjaGFydE9wdGlvbnNDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8Q2hhcnRPcHRpb25zQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDaGFydE9wdGlvbnNDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIGNoYXJ0IGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNoYXJ0RGVzdHJveWVkOiBFdmVudEVtaXR0ZXI8Q2hhcnREZXN0cm95ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ2hhcnREZXN0cm95ZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIERPTSBldmVudCBga2V5RG93bmAgaGFwcGVuZWQgb24gYSBjZWxsLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgY2VsbEtleURvd246IEV2ZW50RW1pdHRlcjxDZWxsS2V5RG93bkV2ZW50PFREYXRhPiB8IEZ1bGxXaWR0aENlbGxLZXlEb3duRXZlbnQ8VERhdGE+PiA9XG4gICAgICAgIG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEtleURvd25FdmVudDxURGF0YT4gfCBGdWxsV2lkdGhDZWxsS2V5RG93bkV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogVGhlIGdyaWQgaGFzIGluaXRpYWxpc2VkIGFuZCBpcyByZWFkeSBmb3IgbW9zdCBhcGkgY2FsbHMsIGJ1dCBtYXkgbm90IGJlIGZ1bGx5IHJlbmRlcmVkIHlldCAgICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkUmVhZHk6IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxHcmlkUmVhZHlFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIEZpcmVkIHRoZSBmaXJzdCB0aW1lIGRhdGEgaXMgcmVuZGVyZWQgaW50byB0aGUgZ3JpZC4gVXNlIHRoaXMgZXZlbnQgaWYgeW91IHdhbnQgdG8gYXV0byByZXNpemUgY29sdW1ucyBiYXNlZCBvbiB0aGVpciBjb250ZW50cyAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGZpcnN0RGF0YVJlbmRlcmVkOiBFdmVudEVtaXR0ZXI8Rmlyc3REYXRhUmVuZGVyZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgRmlyc3REYXRhUmVuZGVyZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFRoZSBzaXplIG9mIHRoZSBncmlkIGBkaXZgIGhhcyBjaGFuZ2VkLiBJbiBvdGhlciB3b3JkcywgdGhlIGdyaWQgd2FzIHJlc2l6ZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBncmlkU2l6ZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxHcmlkU2l6ZUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgR3JpZFNpemVDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBEaXNwbGF5ZWQgcm93cyBoYXZlIGNoYW5nZWQuIFRyaWdnZXJlZCBhZnRlciBzb3J0LCBmaWx0ZXIgb3IgdHJlZSBleHBhbmQgLyBjb2xsYXBzZSBldmVudHMuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBtb2RlbFVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxNb2RlbFVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgTW9kZWxVcGRhdGVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIHJvdyB3YXMgcmVtb3ZlZCBmcm9tIHRoZSBET00sIGZvciBhbnkgcmVhc29uLiBVc2UgdG8gY2xlYW4gdXAgcmVzb3VyY2VzIChpZiBhbnkpIHVzZWQgYnkgdGhlIHJvdy5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHZpcnR1YWxSb3dSZW1vdmVkOiBFdmVudEVtaXR0ZXI8VmlydHVhbFJvd1JlbW92ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgVmlydHVhbFJvd1JlbW92ZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFdoaWNoIHJvd3MgYXJlIHJlbmRlcmVkIGluIHRoZSBET00gaGFzIGNoYW5nZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB2aWV3cG9ydENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxWaWV3cG9ydENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgVmlld3BvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBUaGUgYm9keSB3YXMgc2Nyb2xsZWQgaG9yaXpvbnRhbGx5IG9yIHZlcnRpY2FsbHkuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBib2R5U2Nyb2xsOiBFdmVudEVtaXR0ZXI8Qm9keVNjcm9sbEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPEJvZHlTY3JvbGxFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1haW4gYm9keSBvZiB0aGUgZ3JpZCBoYXMgc3RvcHBlZCBzY3JvbGxpbmcsIGVpdGhlciBob3Jpem9udGFsbHkgb3IgdmVydGljYWxseS5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGJvZHlTY3JvbGxFbmQ6IEV2ZW50RW1pdHRlcjxCb2R5U2Nyb2xsRW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIEJvZHlTY3JvbGxFbmRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFdoZW4gZHJhZ2dpbmcgc3RhcnRzLiBUaGlzIGNvdWxkIGJlIGFueSBhY3Rpb24gdGhhdCB1c2VzIHRoZSBncmlkJ3MgRHJhZyBhbmQgRHJvcCBzZXJ2aWNlLCBlLmcuIENvbHVtbiBNb3ZpbmcsIENvbHVtbiBSZXNpemluZywgUmFuZ2UgU2VsZWN0aW9uLCBGaWxsIEhhbmRsZSwgZXRjLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0YXJ0ZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RhcnRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPERyYWdTdGFydGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBXaGVuIGRyYWdnaW5nIHN0b3BzLiBUaGlzIGNvdWxkIGJlIGFueSBhY3Rpb24gdGhhdCB1c2VzIHRoZSBncmlkJ3MgRHJhZyBhbmQgRHJvcCBzZXJ2aWNlLCBlLmcuIENvbHVtbiBNb3ZpbmcsIENvbHVtbiBSZXNpemluZywgUmFuZ2UgU2VsZWN0aW9uLCBGaWxsIEhhbmRsZSwgZXRjLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZHJhZ1N0b3BwZWQ6IEV2ZW50RW1pdHRlcjxEcmFnU3RvcHBlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPERyYWdTdG9wcGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBHcmlkIHN0YXRlIGhhcyBiZWVuIHVwZGF0ZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzdGF0ZVVwZGF0ZWQ6IEV2ZW50RW1pdHRlcjxTdGF0ZVVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgU3RhdGVVcGRhdGVkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBUcmlnZ2VyZWQgZXZlcnkgdGltZSB0aGUgcGFnaW5nIHN0YXRlIGNoYW5nZXMuIFNvbWUgb2YgdGhlIG1vc3QgY29tbW9uIHNjZW5hcmlvcyBmb3IgdGhpcyBldmVudCB0byBiZSB0cmlnZ2VyZWQgYXJlOlxuICAgICAqXG4gICAgICogIC0gVGhlIHBhZ2Ugc2l6ZSBjaGFuZ2VzLlxuICAgICAqICAtIFRoZSBjdXJyZW50IHNob3duIHBhZ2UgaXMgY2hhbmdlZC5cbiAgICAgKiAgLSBOZXcgZGF0YSBpcyBsb2FkZWQgb250byB0aGUgZ3JpZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBhZ2luYXRpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UGFnaW5hdGlvbkNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgUGFnaW5hdGlvbkNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEEgZHJhZyBoYXMgc3RhcnRlZCwgb3IgZHJhZ2dpbmcgd2FzIGFscmVhZHkgc3RhcnRlZCBhbmQgdGhlIG1vdXNlIGhhcyByZS1lbnRlcmVkIHRoZSBncmlkIGhhdmluZyBwcmV2aW91c2x5IGxlZnQgdGhlIGdyaWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnRW50ZXI6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRW50ZXJFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgUm93RHJhZ0VudGVyRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBUaGUgbW91c2UgaGFzIG1vdmVkIHdoaWxlIGRyYWdnaW5nLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93RHJhZ01vdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnTW92ZUV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd0RyYWdNb3ZlRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBUaGUgbW91c2UgaGFzIGxlZnQgdGhlIGdyaWQgd2hpbGUgZHJhZ2dpbmcuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEcmFnTGVhdmU6IEV2ZW50RW1pdHRlcjxSb3dEcmFnTGVhdmVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgUm93RHJhZ0xlYXZlRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBUaGUgZHJhZyBoYXMgZmluaXNoZWQgb3ZlciB0aGUgZ3JpZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RyYWdFbmQ6IEV2ZW50RW1pdHRlcjxSb3dEcmFnRW5kRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Um93RHJhZ0VuZEV2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSByb3cgZ3JvdXAgY29sdW1uIHdhcyBhZGRlZCwgcmVtb3ZlZCBvciByZW9yZGVyZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjb2x1bW5Sb3dHcm91cENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxDb2x1bW5Sb3dHcm91cENoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ29sdW1uUm93R3JvdXBDaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIHJvdyBncm91cCB3YXMgb3BlbmVkIG9yIGNsb3NlZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0dyb3VwT3BlbmVkOiBFdmVudEVtaXR0ZXI8Um93R3JvdXBPcGVuZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgUm93R3JvdXBPcGVuZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEZpcmVkIHdoZW4gY2FsbGluZyBlaXRoZXIgb2YgdGhlIEFQSSBtZXRob2RzIGBleHBhbmRBbGwoKWAgb3IgYGNvbGxhcHNlQWxsKClgLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgZXhwYW5kT3JDb2xsYXBzZUFsbDogRXZlbnRFbWl0dGVyPEV4cGFuZE9yQ29sbGFwc2VBbGxFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgRXhwYW5kT3JDb2xsYXBzZUFsbEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogRXhjZWVkZWQgdGhlIGBwaXZvdE1heEdlbmVyYXRlZENvbHVtbnNgIGxpbWl0IHdoZW4gZ2VuZXJhdGluZyBjb2x1bW5zLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcGl2b3RNYXhDb2x1bW5zRXhjZWVkZWQ6IEV2ZW50RW1pdHRlcjxQaXZvdE1heENvbHVtbnNFeGNlZWRlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBQaXZvdE1heENvbHVtbnNFeGNlZWRlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogVGhlIGNsaWVudCBoYXMgc2V0IG5ldyBwaW5uZWQgcm93IGRhdGEgaW50byB0aGUgZ3JpZC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHBpbm5lZFJvd0RhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UGlubmVkUm93RGF0YUNoYW5nZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgUGlubmVkUm93RGF0YUNoYW5nZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIENsaWVudC1TaWRlIFJvdyBNb2RlbCBvbmx5LiBUaGUgY2xpZW50IGhhcyB1cGRhdGVkIGRhdGEgZm9yIHRoZSBncmlkIGJ5IGVpdGhlciBhKSBzZXR0aW5nIG5ldyBSb3cgRGF0YSBvciBiKSBBcHBseWluZyBhIFJvdyBUcmFuc2FjdGlvbi5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHJvd0RhdGFVcGRhdGVkOiBFdmVudEVtaXR0ZXI8Um93RGF0YVVwZGF0ZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgUm93RGF0YVVwZGF0ZWRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIEFzeW5jIHRyYW5zYWN0aW9ucyBoYXZlIGJlZW4gYXBwbGllZC4gQ29udGFpbnMgYSBsaXN0IG9mIGFsbCB0cmFuc2FjdGlvbiByZXN1bHRzLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgYXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkOiBFdmVudEVtaXR0ZXI8QXN5bmNUcmFuc2FjdGlvbnNGbHVzaGVkPFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBBc3luY1RyYW5zYWN0aW9uc0ZsdXNoZWQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIHNlcnZlciBzaWRlIHN0b3JlIGhhcyBmaW5pc2hlZCByZWZyZXNoaW5nLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgc3RvcmVSZWZyZXNoZWQ6IEV2ZW50RW1pdHRlcjxTdG9yZVJlZnJlc2hlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBTdG9yZVJlZnJlc2hlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogSGVhZGVyIGlzIGZvY3VzZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBoZWFkZXJGb2N1c2VkOiBFdmVudEVtaXR0ZXI8SGVhZGVyRm9jdXNlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBIZWFkZXJGb2N1c2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBDZWxsIGlzIGNsaWNrZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbENsaWNrZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIENlbGwgaXMgZG91YmxlIGNsaWNrZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRG91YmxlQ2xpY2tlZDogRXZlbnRFbWl0dGVyPENlbGxEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENlbGxEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBDZWxsIGlzIGZvY3VzZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsRm9jdXNlZDogRXZlbnRFbWl0dGVyPENlbGxGb2N1c2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2VsbEZvY3VzZWRFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIE1vdXNlIGVudGVyZWQgY2VsbC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU92ZXI6IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VPdmVyRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENlbGxNb3VzZU92ZXJFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIE1vdXNlIGxlZnQgY2VsbC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZU91dDogRXZlbnRFbWl0dGVyPENlbGxNb3VzZU91dEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBDZWxsTW91c2VPdXRFdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIE1vdXNlIGRvd24gb24gY2VsbC5cbiAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIGNlbGxNb3VzZURvd246IEV2ZW50RW1pdHRlcjxDZWxsTW91c2VEb3duRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIENlbGxNb3VzZURvd25FdmVudDxURGF0YT5cbiAgICA+KCk7XG4gICAgLyoqIFJvdyBpcyBjbGlja2VkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93Q2xpY2tlZDogRXZlbnRFbWl0dGVyPFJvd0NsaWNrZWRFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxSb3dDbGlja2VkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSb3cgaXMgZG91YmxlIGNsaWNrZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyByb3dEb3VibGVDbGlja2VkOiBFdmVudEVtaXR0ZXI8Um93RG91YmxlQ2xpY2tlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBSb3dEb3VibGVDbGlja2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBSb3cgaXMgc2VsZWN0ZWQgb3IgZGVzZWxlY3RlZC4gVGhlIGV2ZW50IGNvbnRhaW5zIHRoZSBub2RlIGluIHF1ZXN0aW9uLCBzbyBjYWxsIHRoZSBub2RlJ3MgYGlzU2VsZWN0ZWQoKWAgbWV0aG9kIHRvIHNlZSBpZiBpdCB3YXMganVzdCBzZWxlY3RlZCBvciBkZXNlbGVjdGVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcm93U2VsZWN0ZWQ6IEV2ZW50RW1pdHRlcjxSb3dTZWxlY3RlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFJvd1NlbGVjdGVkRXZlbnQ8VERhdGE+PigpO1xuICAgIC8qKiBSb3cgc2VsZWN0aW9uIGlzIGNoYW5nZWQuIFVzZSB0aGUgZ3JpZCBBUEkgYGdldFNlbGVjdGVkTm9kZXMoKWAgb3IgYGdldFNlbGVjdGVkUm93cygpYCB0byBnZXQgdGhlIG5ldyBsaXN0IG9mIHNlbGVjdGVkIG5vZGVzIC8gcm93IGRhdGEuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8U2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPj4gPSBuZXcgRXZlbnRFbWl0dGVyPFxuICAgICAgICBTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBDZWxsIGlzIHJpZ2h0IGNsaWNrZWQuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBjZWxsQ29udGV4dE1lbnU6IEV2ZW50RW1pdHRlcjxDZWxsQ29udGV4dE1lbnVFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxcbiAgICAgICAgQ2VsbENvbnRleHRNZW51RXZlbnQ8VERhdGE+XG4gICAgPigpO1xuICAgIC8qKiBBIGNoYW5nZSB0byByYW5nZSBzZWxlY3Rpb24gaGFzIG9jY3VycmVkLlxuICAgICAqL1xuICAgIEBPdXRwdXQoKSBwdWJsaWMgcmFuZ2VTZWxlY3Rpb25DaGFuZ2VkOiBFdmVudEVtaXR0ZXI8UmFuZ2VTZWxlY3Rpb25DaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8XG4gICAgICAgIFJhbmdlU2VsZWN0aW9uQ2hhbmdlZEV2ZW50PFREYXRhPlxuICAgID4oKTtcbiAgICAvKiogQSB0b29sdGlwIGhhcyBiZWVuIGRpc3BsYXllZCAgICAgKi9cbiAgICBAT3V0cHV0KCkgcHVibGljIHRvb2x0aXBTaG93OiBFdmVudEVtaXR0ZXI8VG9vbHRpcFNob3dFdmVudDxURGF0YT4+ID0gbmV3IEV2ZW50RW1pdHRlcjxUb29sdGlwU2hvd0V2ZW50PFREYXRhPj4oKTtcbiAgICAvKiogQSB0b29sdGlwIHdhcyBoaWRkZW4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyB0b29sdGlwSGlkZTogRXZlbnRFbWl0dGVyPFRvb2x0aXBIaWRlRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8VG9vbHRpcEhpZGVFdmVudDxURGF0YT4+KCk7XG4gICAgLyoqIFNvcnQgaGFzIGNoYW5nZWQuIFRoZSBncmlkIGFsc28gbGlzdGVucyBmb3IgdGhpcyBhbmQgdXBkYXRlcyB0aGUgbW9kZWwuXG4gICAgICovXG4gICAgQE91dHB1dCgpIHB1YmxpYyBzb3J0Q2hhbmdlZDogRXZlbnRFbWl0dGVyPFNvcnRDaGFuZ2VkRXZlbnQ8VERhdGE+PiA9IG5ldyBFdmVudEVtaXR0ZXI8U29ydENoYW5nZWRFdmVudDxURGF0YT4+KCk7XG5cbiAgICAvLyBFbmFibGUgdHlwZSBjb2VyY2lvbiBmb3IgYm9vbGVhbiBJbnB1dHMgdG8gc3VwcG9ydCB1c2UgbGlrZSAnZW5hYmxlQ2hhcnRzJyBpbnN0ZWFkIG9mIGZvcmNpbmcgJ1tlbmFibGVDaGFydHNdPVwidHJ1ZVwiJ1xuICAgIC8vIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS90ZW1wbGF0ZS10eXBlY2hlY2sjaW5wdXQtc2V0dGVyLWNvZXJjaW9uXG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWFrZUNvbHVtblZpc2libGVBZnRlclVuR3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2VsbEZvY3VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0hlYWRlckZvY3VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0hvcml6b250YWxTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwU2VsZWN0c0NoaWxkcmVuOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNTaG93SG9yaXpvbnRhbFNjcm9sbDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzU2hvd1ZlcnRpY2FsU2Nyb2xsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWJ1ZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQnJvd3NlclRvb2x0aXBzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVDZWxsRXhwcmVzc2lvbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwSW5jbHVkZVRvdGFsRm9vdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cFN1cHByZXNzQmxhbmtIZWFkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWVudUhpZGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93RGVzZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3VuU29ydEljb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTXVsdGlTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbHdheXNNdWx0aVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NpbmdsZUNsaWNrRWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NMb2FkaW5nT3ZlcmxheTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NOb1Jvd3NPdmVybGF5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0F1dG9TaXplOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9za2lwSGVhZGVyT25BdXRvU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5Nb3ZlQW5pbWF0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vdmFibGVDb2x1bW5zOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0ZpZWxkRG90Tm90YXRpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVSYW5nZUhhbmRsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlRmlsbEhhbmRsZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGVhck9uRmlsbFJlZHVjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGVsdGFTb3J0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1RvdWNoOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FzeW5jRXZlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbGxvd0NvbnRleHRNZW51V2l0aENvbnRyb2xLZXk6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ29udGV4dE1lbnU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZUNlbGxDaGFuZ2VGbGFzaDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NEcmFnTGVhdmVIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzUm93R3JvdXBIaWRlc0NvbHVtbnM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTWlkZGxlQ2xpY2tTY3JvbGxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1ByZXZlbnREZWZhdWx0T25Nb3VzZVdoZWVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvcHlSb3dzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlIZWFkZXJzVG9DbGlwYm9hcmQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NvcHlHcm91cEhlYWRlcnNUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGl2b3RNb2RlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0FnZ0Z1bmNJbkhlYWRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDb2x1bW5WaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYWx3YXlzQWdncmVnYXRlQXRSb290TGV2ZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzRm9jdXNBZnRlclJlZnJlc2g6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Z1bmN0aW9uc1JlYWRPbmx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hbmltYXRlUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3JvdXBTZWxlY3RzRmlsdGVyZWQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwUmVtb3ZlU2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwUmVtb3ZlTG93ZXN0U2luZ2xlQ2hpbGRyZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZVJ0bDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlja0VkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdFbnRpcmVSb3c6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0RyYWdNYW5hZ2VkOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0RyYWc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzTW92ZVdoZW5Sb3dEcmFnZ2luZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcm93RHJhZ011bHRpUm93OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVHcm91cEVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VtYmVkRnVsbFdpZHRoUm93czogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQYWdpbmF0aW9uUGFuZWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwSGlkZU9wZW5QYXJlbnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9ncm91cEFsbG93VW5iYWxhbmNlZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTY3JvbGxPbk5ld0RhdGE6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzU2Nyb2xsV2hlblBvcHVwc0FyZU9wZW46IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3B1cmdlQ2xvc2VkUm93Tm9kZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2NhY2hlUXVpY2tGaWx0ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luY2x1ZGVIaWRkZW5Db2x1bW5zSW5RdWlja0ZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5zdXJlRG9tT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FjY2VudGVkU29ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDaGFuZ2VEZXRlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlQ2FjaGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3ZhbHVlQ2FjaGVOZXZlckV4cGlyZXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FnZ3JlZ2F0ZU9ubHlDaGFuZ2VkQ29sdW1uczogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBbmltYXRpb25GcmFtZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NFeGNlbEV4cG9ydDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDc3ZFeHBvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2luY2x1ZGVIaWRkZW5Db2x1bW5zSW5BZHZhbmNlZEZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NNdWx0aVJhbmdlU2VsZWN0aW9uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbnRlck5hdmlnYXRlc1ZlcnRpY2FsbHlBZnRlckVkaXQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VudGVyTmF2aWdhdGVzVmVydGljYWxseTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NQcm9wZXJ0eU5hbWVzQ2hlY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd011bHRpU2VsZWN0V2l0aENsaWNrOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd0hvdmVySGlnaGxpZ2h0OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc1Jvd1RyYW5zZm9ybTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDbGlwYm9hcmRQYXN0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NMYXN0RW1wdHlMaW5lT25QYXN0ZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2hhcnRzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01haW50YWluVW5zb3J0ZWRPcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQnJvd3NlclJlc2l6ZU9ic2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01heFJlbmRlcmVkUm93UmVzdHJpY3Rpb246IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2V4Y2x1ZGVDaGlsZHJlbldoZW5UcmVlRGF0YUZpbHRlcmluZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfdG9vbHRpcE1vdXNlVHJhY2s6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Rvb2x0aXBJbnRlcmFjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfa2VlcERldGFpbFJvd3M6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2luYXRlQ2hpbGRSb3dzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wcmV2ZW50RGVmYXVsdE9uQ29udGV4dE1lbnU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3VuZG9SZWRvQ2VsbEVkaXRpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93RHJhZ0Zyb21Db2x1bW5zVG9vbFBhbmVsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9waXZvdFN1cHByZXNzQXV0b0NvbHVtbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NFeHBhbmRhYmxlUGl2b3RHcm91cHM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RlYm91bmNlVmVydGljYWxTY3JvbGxiYXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2RldGFpbFJvd0F1dG9IZWlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVTb3J0QWxsTGV2ZWxzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlRW5hYmxlQ2xpZW50U2lkZVNvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlcnZlclNpZGVPbmx5UmVmcmVzaEZpbHRlcmVkR3JvdXBzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlU29ydE9uU2VydmVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zZXJ2ZXJTaWRlRmlsdGVyT25TZXJ2ZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQWdnRmlsdGVyZWRPbmx5OiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaG93T3BlbmVkR3JvdXA6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N1cHByZXNzQ2xpcGJvYXJkQXBpOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc01vZGVsVXBkYXRlQWZ0ZXJVcGRhdGVUcmFuc2FjdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3RvcEVkaXRpbmdXaGVuQ2VsbHNMb3NlRm9jdXM6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX21haW50YWluQ29sdW1uT3JkZXI6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2dyb3VwTWFpbnRhaW5PcmRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29sdW1uSG92ZXJIaWdobGlnaHQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3JlYWRPbmx5RWRpdDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NSb3dWaXJ0dWFsaXNhdGlvbjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZW5hYmxlQ2VsbEVkaXRpbmdPbkJhY2tzcGFjZTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVzZXRSb3dEYXRhT25VcGRhdGU6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3JlbW92ZVBpdm90SGVhZGVyUm93V2hlblNpbmdsZVZhbHVlQ29sdW1uOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0NvcHlTaW5nbGVDZWxsUmFuZ2VzOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdXBwcmVzc0dyb3VwUm93c1N0aWNreTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NDdXRUb0NsaXBib2FyZDogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTZXJ2ZXJTaWRlSW5maW5pdGVTY3JvbGw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3Jvd0dyb3VwUGFuZWxTdXBwcmVzc1NvcnQ6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2FsbG93U2hvd0NoYW5nZUFmdGVyRmlsdGVyOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lbmFibGVBZHZhbmNlZEZpbHRlcjogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWFzdGVyRGV0YWlsOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90cmVlRGF0YTogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NHcm91cE1haW50YWluVmFsdWVUeXBlOiBib29sZWFuIHwgbnVsbCB8ICcnO1xuICAgIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9hcHBseVF1aWNrRmlsdGVyQmVmb3JlUGl2b3RPckFnZzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NTZXJ2ZXJTaWRlRnVsbFdpZHRoTG9hZGluZ1JvdzogYm9vbGVhbiB8IG51bGwgfCAnJztcbiAgICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc3VwcHJlc3NBZHZhbmNlZEZpbHRlckV2YWw6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvYWRpbmc6IGJvb2xlYW4gfCBudWxsIHwgJyc7XG4gICAgLy8gQEVOREBcbn1cbiJdfQ==