/************************************************************************************************
 * If you change the GridOptions interface, you must also update PropertyKeys to be consistent. *
 ************************************************************************************************/
import { AdvancedFilterBuilderVisibleChangedEvent, AsyncTransactionsFlushed, BodyScrollEndEvent, BodyScrollEvent, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditingStartedEvent, CellEditingStoppedEvent, CellEditRequestEvent, CellFocusedEvent, CellKeyDownEvent, CellMouseDownEvent, CellMouseOutEvent, CellMouseOverEvent, CellValueChangedEvent, ChartCreated, ChartDestroyed, ChartOptionsChanged, ChartRangeSelectionChanged, ColumnAggFuncChangeRequestEvent, ColumnEverythingChangedEvent, ColumnGroupOpenedEvent, ColumnMovedEvent, ColumnPinnedEvent, ColumnPivotChangedEvent, ColumnPivotChangeRequestEvent, ColumnPivotModeChangedEvent, ColumnResizedEvent, ColumnRowGroupChangedEvent, ColumnRowGroupChangeRequestEvent, ColumnValueChangedEvent, ColumnValueChangeRequestEvent, ColumnVisibleEvent, ComponentStateChangedEvent, ContextMenuVisibleChangedEvent, CutEndEvent, CutStartEvent, DisplayedColumnsChangedEvent, DragStartedEvent, DragStoppedEvent, ExpandCollapseAllEvent, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent, FirstDataRenderedEvent, FullWidthCellKeyDownEvent, GridColumnsChangedEvent, GridReadyEvent, GridPreDestroyedEvent, GridSizeChangedEvent, ModelUpdatedEvent, NewColumnsLoadedEvent, PaginationChangedEvent, PasteEndEvent, PasteStartEvent, PinnedRowDataChangedEvent, RangeDeleteEndEvent, RangeDeleteStartEvent, RangeSelectionChangedEvent, RedoEndedEvent, RedoStartedEvent, RowClickedEvent, RowDataUpdatedEvent, RowDoubleClickedEvent, RowDragEvent, RowEditingStartedEvent, RowEditingStoppedEvent, RowGroupOpenedEvent, RowSelectedEvent, RowValueChangedEvent, SelectionChangedEvent, SortChangedEvent, StoreRefreshedEvent, ToolPanelSizeChangedEvent, ToolPanelVisibleChangedEvent, TooltipHideEvent, TooltipShowEvent, UndoEndedEvent, UndoStartedEvent, ViewportChangedEvent, VirtualColumnsChangedEvent, VirtualRowRemovedEvent, StateUpdatedEvent, ColumnHeaderMouseOverEvent, ColumnHeaderMouseLeaveEvent, ColumnHeaderClickedEvent, ColumnHeaderContextMenuEvent, PivotMaxColumnsExceededEvent, ColumnMenuVisibleChangedEvent, FillStartEvent, FillEndEvent } from "../events";
import { HeaderPosition } from "../headerRendering/common/headerPosition";
import { CsvExportParams, ProcessCellForExportParams, ProcessGroupHeaderForExportParams, ProcessHeaderForExportParams } from "../interfaces/exportParams";
import { AgChartTheme, AgChartThemeOverrides } from "../interfaces/iAgChartOptions";
import { ChartMenuOptions, ChartToolPanelsDef } from "../interfaces/iChartOptions";
import { AgGridCommon } from "../interfaces/iCommon";
import { IDatasource } from "../interfaces/iDatasource";
import { ExcelExportParams, ExcelStyle } from "../interfaces/iExcelCreator";
import { RowModelType } from "../interfaces/iRowModel";
import { IServerSideDatasource } from "../interfaces/iServerSideDatasource";
import { StatusPanelDef } from "../interfaces/iStatusPanel";
import { IViewportDatasource } from "../interfaces/iViewportDatasource";
import { IRowDragItem } from "../rendering/row/rowDragComp";
import { ILoadingCellRendererParams } from "../rendering/cellRenderers/loadingCellRenderer";
import { CellPosition } from "./cellPositionUtils";
import { ColDef, ColGroupDef, ColTypeDef, IAggFunc, SortDirection } from "./colDef";
import { FillOperationParams, GetChartToolbarItemsParams, GetContextMenuItemsParams, GetGroupRowAggParams, GetLocaleTextParams, GetMainMenuItemsParams, GetRowIdParams, GetServerSideGroupLevelParamsParams, InitialGroupOrderComparatorParams, IsApplyServerSideTransactionParams, IsExternalFilterPresentParams, IsFullWidthRowParams, IsGroupOpenByDefaultParams, IsServerSideGroupOpenByDefaultParams, NavigateToNextCellParams, NavigateToNextHeaderParams, PaginationNumberFormatterParams, PostProcessPopupParams, PostSortRowsParams, ProcessDataFromClipboardParams, ProcessRowParams, RowHeightParams, SendToClipboardParams, TabToNextCellParams, TabToNextHeaderParams, GetGroupAggFilteringParams, GetGroupIncludeFooterParams, ProcessUnpinnedColumnsParams, GetChartMenuItemsParams, GetGroupIncludeTotalRowParams } from "../interfaces/iCallbackParams";
import { SideBarDef } from "../interfaces/iSideBar";
import { IRowNode } from "../interfaces/iRowNode";
import { DataTypeDefinition } from "./dataType";
import { AdvancedFilterModel } from "../interfaces/advancedFilterModel";
import { IAdvancedFilterBuilderParams } from "../interfaces/iAdvancedFilterBuilderParams";
import { AlignedGrid } from "../interfaces/iAlignedGrid";
import { GridState } from "../interfaces/gridState";
import { SizeColumnsToContentStrategy, SizeColumnsToFitProvidedWidthStrategy, SizeColumnsToFitGridStrategy } from "../interfaces/autoSizeStrategy";
import { Column } from "./column";
import { MenuItemDef } from "../interfaces/menuItem";
export interface GridOptions<TData = any> {
    /**
     * Specifies the status bar components to use in the status bar.
     */
    statusBar?: {
        statusPanels: StatusPanelDef[];
    };
    /**
     * Specifies the side bar components.
     */
    sideBar?: SideBarDef | string | string[] | boolean | null;
    /**
     * Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu.
     * @default false
     */
    suppressContextMenu?: boolean;
    /**
     * When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
     * This flag is useful to prevent the browser from showing its default context menu.
     * @default false
     */
    preventDefaultOnContextMenu?: boolean;
    /**
     * Allows context menu to show, even when `Ctrl` key is held down.
     * @default false
     */
    allowContextMenuWithControlKey?: boolean;
    /**
     * Changes the display type of the column menu.
     * `'new'` just displays the main list of menu items. `'legacy'` displays a tabbed menu.
     * @default 'legacy'
     * @initial
     */
    columnMenu?: 'legacy' | 'new';
    /**
     * Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header.
     * If `columnMenu = 'new'`, this will default to `true` instead of `false`.
     * @default false
     */
    suppressMenuHide?: boolean;
    /**
     * Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component.
     * @default false
     * @initial
     */
    enableBrowserTooltips?: boolean;
    /**
     * The trigger that will cause tooltips to show and hide.
     *  - `hover` - The tooltip will show/hide when a cell/header is hovered.
     *  - `focus` - The tooltip will show/hide when a cell/header is focused.
     * @default 'hover'
     * @initial
     */
    tooltipTrigger?: 'hover' | 'focus';
    /**
     * The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
     * **Note:** This property does not work if `enableBrowserTooltips` is `true`.
     * @default 2000
     */
    tooltipShowDelay?: number;
    /**
     * The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
     * **Note:** This property does not work if `enableBrowserTooltips` is `true` and `tooltipHideTriggers` includes `timeout`.
     * @default 10000
     */
    tooltipHideDelay?: number;
    /**
     * Set to `true` to have tooltips follow the cursor once they are displayed.
     * @default false
     * @initial
     */
    tooltipMouseTrack?: boolean;
    /**
     * This defines when tooltip will show up for Cells, Headers and SetFilter Items.
     *  - `standard` - The tooltip always shows up when the items configured with Tooltips are hovered.
     * - `whenTruncated` - The tooltip will only be displayed when the items hovered have truncated (showing ellipsis) values. This property does not work when `enableBrowserTooltips={true}`.
     * @default `standard`
     */
    tooltipShowMode?: 'standard' | 'whenTruncated';
    /**
     * Set to `true` to enable tooltip interaction. When this option is enabled, the tooltip will not hide while the
     * tooltip itself it being hovered or has focus.
     * @default false
     * @initial
     */
    tooltipInteraction?: boolean;
    /**
     * DOM element to use as the popup parent for grid popups (context menu, column menu etc).
     */
    popupParent?: HTMLElement | null;
    /**
     * Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard.
     * @default false
     */
    copyHeadersToClipboard?: boolean;
    /**
     * Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard.
     * @default false
     */
    copyGroupHeadersToClipboard?: boolean;
    /**
     * Specify the delimiter to use when copying to clipboard.
     * @default '\t'
    */
    clipboardDelimiter?: string;
    /**
     * Set to `true` to copy the cell range or focused cell to the clipboard and never the selected rows.
     * @default false
     */
    suppressCopyRowsToClipboard?: boolean;
    /**
     * Set to `true` to copy rows instead of ranges when a range with only a single cell is selected.
     * @default false
     */
    suppressCopySingleCellRanges?: boolean;
    /**
     * Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard.
     * @default false
     */
    suppressLastEmptyLineOnPaste?: boolean;
    /**
     * Set to `true` to turn off paste operations within the grid.
     * @default false
     */
    suppressClipboardPaste?: boolean;
    /**
     * Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround.
     * @default false
     */
    suppressClipboardApi?: boolean;
    /**
     * Set to `true` to block **cut** operations within the grid.
     * @default false
     */
    suppressCutToClipboard?: boolean;
    /**
     * Array of Column / Column Group definitions.
     */
    columnDefs?: (ColDef<TData> | ColGroupDef<TData>)[] | null;
    /**
     * A default column definition. Items defined in the actual column definitions get precedence.
     */
    defaultColDef?: ColDef<TData>;
    /**
     * A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence.
     * @initial
     */
    defaultColGroupDef?: Partial<ColGroupDef<TData>>;
    /**
     * An object map of custom column types which contain groups of properties that column definitions can reuse by referencing in their `type` property.
     */
    columnTypes?: {
        [key: string]: ColTypeDef<TData>;
    };
    /**
     * An object map of cell data types to their definitions.
     * Cell data types can either override/update the pre-defined data types
     * (`'text'`, `'number'`,  `'boolean'`,  `'date'`,  `'dateString'` or  `'object'`),
     * or can be custom data types.
     */
    dataTypeDefinitions?: {
        [cellDataType: string]: DataTypeDefinition<TData>;
    };
    /**
     * Keeps the order of Columns maintained after new Column Definitions are updated.
     * @default false
     */
    maintainColumnOrder?: boolean;
    /**
     * If `true`, then dots in field names (e.g. `'address.firstLine'`) are not treated as deep references. Allows you to use dots in your field name if you prefer.
     * @default false
     */
    suppressFieldDotNotation?: boolean;
    /**
     * The height in pixels for the row containing the column label header. If not specified, it uses the theme value of `header-height`.
     */
    headerHeight?: number;
    /**
     * The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`.
     */
    groupHeaderHeight?: number;
    /**
     * The height in pixels for the row containing the floating filters. If not specified, it uses the theme value of `header-height`.
     */
    floatingFiltersHeight?: number;
    /**
     * The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`.
     */
    pivotHeaderHeight?: number;
    /**
     * The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`.
     */
    pivotGroupHeaderHeight?: number;
    /**
     * Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid.
     * @default false
     */
    allowDragFromColumnsToolPanel?: boolean;
    /**
     * Set to `true` to suppress column moving, i.e. to make the columns fixed position.
     * @default false
     */
    suppressMovableColumns?: boolean;
    /**
     * If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns.
     * @default false
     */
    suppressColumnMoveAnimation?: boolean;
    /**
     * If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden.
     * @default false
     */
    suppressDragLeaveHidesColumns?: boolean;
    /**
     * If `true`, when you drag a column into a row group panel the column is not hidden.
     * @default false
     */
    suppressRowGroupHidesColumns?: boolean;
    /**
     * Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing).
     */
    colResizeDefault?: 'shift';
    /**
     * Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size.
     * @default false
     * @initial
     */
    suppressAutoSize?: boolean;
    /**
     * Number of pixels to add to a column width after the [auto-sizing](./column-sizing/#auto-size-columns-to-fit-cell-contents) calculation.
     * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
     * @default 20
     */
    autoSizePadding?: number;
    /**
     * Set this to `true` to skip the `headerName` when `autoSize` is called by default.
     * @default false
     * @initial
     */
    skipHeaderOnAutoSize?: boolean;
    /**
     * Auto-size the columns when the grid is loaded. Can size to fit the grid width, fit a provided width, or fit the cell contents.
     * @initial
     */
    autoSizeStrategy?: SizeColumnsToFitGridStrategy | SizeColumnsToFitProvidedWidthStrategy | SizeColumnsToContentStrategy;
    /**
     * A map of component names to components.
     * @initial
     */
    components?: {
        [p: string]: any;
    };
    /**
     * Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.
     */
    editType?: 'fullRow';
    /**
     * Set to `true` to enable Single Click Editing for cells, to start editing with a single click.
     * @default false
     */
    singleClickEdit?: boolean;
    /**
     * Set to `true` so that neither single nor double click starts editing.
     * @default false
     */
    suppressClickEdit?: boolean;
    /**
     * Set to `true` to stop the grid updating data after `Edit`, `Clipboard` and `Fill Handle` operations. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid. <br />**Note:** `rowNode.setDataValue()` does not update the value of the cell when this is `True`, it fires `onCellEditRequest` instead.
     * @default false
     */
    readOnlyEdit?: boolean;
    /**
     * Set this to `true` to stop cell editing when grid loses focus.
     * The default is that the grid stays editing until focus goes onto another cell.
     * @default false
     * @initial
     */
    stopEditingWhenCellsLoseFocus?: boolean;
    /**
     * @deprecated As of v30, no longer used. To navigate with the Enter key use `enterNavigatesVertically`.
     */
    enterMovesDown?: boolean;
    /**
     * @deprecated As of v30, no longer used. To navigate with the Enter key after edit use `enterNavigatesVerticallyAfterEdit`.
     */
    enterMovesDownAfterEdit?: boolean;
    /**
     * Set to `true` along with `enterNavigatesVerticallyAfterEdit` to have Excel-style behaviour for the `Enter` key.
     * i.e. pressing the `Enter` key will move down to the cell beneath and `Shift+Enter` will move up to the cell above.
     * @default false
     */
    enterNavigatesVertically?: boolean;
    /**
     * Set to `true` along with `enterNavigatesVertically` to have Excel-style behaviour for the 'Enter' key.
     * i.e. pressing the Enter key will move down to the cell beneath and Shift+Enter key will move up to the cell above.
     * @default false
     */
    enterNavigatesVerticallyAfterEdit?: boolean;
    /**
     * Forces Cell Editing to start when backspace is pressed. This is only relevant for MacOS users.
     */
    enableCellEditingOnBackspace?: boolean;
    /**
     * Set to `true` to enable Undo / Redo while editing.
     * @initial
     */
    undoRedoCellEditing?: boolean;
    /**
     * Set the size of the undo / redo stack.
     * @default 10
     * @initial
     */
    undoRedoCellEditingLimit?: number;
    /**
     * A default configuration object used to export to CSV.
     */
    defaultCsvExportParams?: CsvExportParams;
    /**
     * Prevents the user from exporting the grid to CSV.
     * @default false
     */
    suppressCsvExport?: boolean;
    /**
     * A default configuration object used to export to Excel.
     */
    defaultExcelExportParams?: ExcelExportParams;
    /**
     * Prevents the user from exporting the grid to Excel.
     * @default false
     */
    suppressExcelExport?: boolean;
    /**
     * A list (array) of Excel styles to be used when exporting to Excel with styles.
     * @initial
     */
    excelStyles?: ExcelStyle[];
    /**
     * Rows are filtered using this text as a Quick Filter.
     */
    quickFilterText?: string;
    /**
     * Set to `true` to turn on the Quick Filter cache, used to improve performance when using the Quick Filter.
     * @default false
     * @initial
     */
    cacheQuickFilter?: boolean;
    /**
     * @deprecated As of v30, hidden columns are excluded from the Quick Filter by default. This can be toggled using `includeHiddenColumnsInQuickFilter`.
     * @initial
     */
    excludeHiddenColumnsFromQuickFilter?: boolean;
    /**
     * Hidden columns are excluded from the Quick Filter by default.
     * To include hidden columns, set to `true`.
     * @default false
     */
    includeHiddenColumnsInQuickFilter?: boolean;
    /**
     * Changes how the Quick Filter splits the Quick Filter text into search terms.
     */
    quickFilterParser?: (quickFilter: string) => string[];
    /**
     * Changes the matching logic for whether a row passes the Quick Filter.
     */
    quickFilterMatcher?: (quickFilterParts: string[], rowQuickFilterAggregateText: string) => boolean;
    /**
     * When pivoting, Quick Filter is only applied on the pivoted data
     * (or aggregated data if `groupAggFiltering = true`).
     * Set to `true` to apply Quick Filter before pivoting (/aggregating) instead.
     * @default false
     */
    applyQuickFilterBeforePivotOrAgg?: boolean;
    /**
     * Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results.
     * @default false
     */
    excludeChildrenWhenTreeDataFiltering?: boolean;
    /**
     * Set to true to enable the Advanced Filter.
     * @default false
     */
    enableAdvancedFilter?: boolean;
    /**
     * @deprecated As of v31, use `initialState.filter.advancedFilterModel` instead.
     * @initial
     */
    advancedFilterModel?: AdvancedFilterModel | null;
    /**
     * Hidden columns are excluded from the Advanced Filter by default.
     * To include hidden columns, set to `true`.
     * @default false
     */
    includeHiddenColumnsInAdvancedFilter?: boolean;
    /**
     * DOM element to use as the parent for the Advanced Filter to allow it to appear outside of the grid.
     * Set to `null` or `undefined` to appear inside the grid.
     */
    advancedFilterParent?: HTMLElement | null;
    /**
     * Customise the parameters passed to the Advanced Filter Builder.
     */
    advancedFilterBuilderParams?: IAdvancedFilterBuilderParams;
    /**
     * By default, Advanced Filter sanitises user input and passes it to `new Function()` to provide the best performance.
     * Set to `true` to prevent this and use defined functions instead.
     * This will result in slower filtering, but it enables Advanced Filter to work when `unsafe-eval` is disabled.
     * @default false
     */
    suppressAdvancedFilterEval?: boolean;
    /**
     * Set to `true` to Enable Charts.
     * @default false
     */
    enableCharts?: boolean;
    /**
     * The list of chart themes that a user can choose from in the chart panel.
     * @default ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
     * @initial
     */
    chartThemes?: string[];
    /**
     * A map containing custom chart themes.
     * @initial
     */
    customChartThemes?: {
        [name: string]: AgChartTheme;
    };
    /**
     * Chart theme overrides applied to all themes.
     * @initial
     */
    chartThemeOverrides?: AgChartThemeOverrides;
    /**
     * @deprecated As of v29, no longer used.
     * @initial
     */
    enableChartToolPanelsButton?: boolean;
    /**
     * Set to `true` to show the 'hamburger' menu option from the Chart Toolbar and display the remaining toolbar buttons. Only applies when using AG Charts Community.
     * @default false
     * @initial
     */
    suppressChartToolPanelsButton?: boolean;
    /**
     * Allows customisation of the Chart Tool Panels, such as changing the tool panels visibility and order, as well as choosing which charts should be displayed in the chart panel.
     * @initial
     */
    chartToolPanelsDef?: ChartToolPanelsDef;
    /**
     * Get chart menu items. Only applies when using AG Charts Enterprise.
     */
    chartMenuItems?: (string | MenuItemDef)[] | GetChartMenuItems<TData>;
    /**
     * Provide your own loading cell renderer to use when data is loading via a DataSource.
     * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.
     */
    loadingCellRenderer?: any;
    /**
     * Params to be passed to the `loadingCellRenderer` component.
     */
    loadingCellRendererParams?: any;
    /**
     * Callback to select which loading cell renderer to be used when data is loading via a DataSource.
     * @initial
     */
    loadingCellRendererSelector?: LoadingCellRendererSelectorFunc<TData>;
    /**
     * A map of key->value pairs for localising text within the grid.
     * @initial
     */
    localeText?: {
        [key: string]: string;
    };
    /**
     * Set to `true` to enable Master Detail.
     * @default false
     */
    masterDetail?: boolean;
    /**
     * Set to `true` to keep detail rows for when they are displayed again.
     * @default false
     * @initial
     */
    keepDetailRows?: boolean;
    /**
     * Sets the number of details rows to keep.
     * @default 10
     * @initial
     */
    keepDetailRowsCount?: number;
    /**
     * Provide a custom `detailCellRenderer` to use when a master row is expanded.
     * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.
     */
    detailCellRenderer?: any;
    /**
     * Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params.
     */
    detailCellRendererParams?: any;
    /**
     * Set fixed height in pixels for each detail row.
     * @initial
     */
    detailRowHeight?: number;
    /**
     * Set to `true` to have the detail grid dynamically change it's height to fit it's rows.
     * @initial
     */
    detailRowAutoHeight?: boolean;
    /**
     * Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks by your application.
     * @initial
     */
    context?: any;
    /**
     *
     * A list of grids to treat as Aligned Grids.
     * Provide a list if the grids / apis already exist or return via a callback to allow the aligned grids to be retrieved asynchronously.
     * If grids are aligned then the columns and horizontal scrolling will be kept in sync.
     */
    alignedGrids?: AlignedGrid[] | (() => AlignedGrid[]);
    /**
     * Change this value to set the tabIndex order of the Grid within your application.
     * @default 0
     * @initial
     */
    tabIndex?: number;
    /**
     * The number of rows rendered outside the viewable area the grid renders.
     * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
     * @default 10
     */
    rowBuffer?: number;
    /**
     * Set to `true` to turn on the value cache.
     * @default false
     * @initial
     */
    valueCache?: boolean;
    /**
     * Set to `true` to configure the value cache to not expire after data updates.
     * @default false
     * @initial
     */
    valueCacheNeverExpires?: boolean;
    /**
     * Set to `true` to allow cell expressions.
     * @default false
     * @initial
     */
    enableCellExpressions?: boolean;
    /**
     * @deprecated v30.2 If `true`, row nodes do not have their parents set.
     * The grid doesn't use the parent reference, but it is included to help the client code navigate the node tree if it wants by providing bi-direction navigation up and down the tree.
     * If this is a problem (e.g. if you need to convert the tree to JSON, which does not allow cyclic dependencies) then set this to `true`.
     * @default false
     * @initial
     */
    suppressParentsInRowNodes?: boolean;
    /**
     * Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch).
     * @default false
     * @initial
     */
    suppressTouch?: boolean;
    /**
     * Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser.
     * @default false
     */
    suppressFocusAfterRefresh?: boolean;
    /**
     * Disables the asynchronous nature of the events introduced in v10, and makes them synchronous. This property only exists for the purpose of supporting legacy code which has a dependency on synchronous events from earlier versions (v9 or earlier) of AG Grid. **It is strongly recommended that you do not change this property unless you have legacy issues.**
     * @deprecated v31 Events should be handled asynchronously.
     * @default false
     * @initial
     */
    suppressAsyncEvents?: boolean;
    /**
     * The grid will check for `ResizeObserver` and use it if it exists in the browser, otherwise it will use the grid's alternative implementation. Some users reported issues with Chrome's `ResizeObserver`. Use this property to always use the grid's alternative implementation should such problems exist.
     * @default false
     * @initial
     */
    suppressBrowserResizeObserver?: boolean;
    /**
     * Disables showing a warning message in the console if using a `gridOptions` or `colDef` property that doesn't exist.
     * @default false
     * @initial
     */
    suppressPropertyNamesCheck?: boolean;
    /**
     * Disables change detection.
     * @default false
     */
    suppressChangeDetection?: boolean;
    /**
     * Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems.
     * @default false
     * @initial
     */
    debug?: boolean;
    /**
     * Provide a template for 'loading' overlay.
     */
    overlayLoadingTemplate?: string;
    /**
     * Provide a custom loading overlay component.
     * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#implementing-a-loading-overlay-component) for framework specific implementation details.
     * @initial
     */
    loadingOverlayComponent?: any;
    /**
     * Customise the parameters provided to the loading overlay component.
     */
    loadingOverlayComponentParams?: any;
    /**
     * Disables the 'loading' overlay.
     * @default false
     * @initial
     */
    suppressLoadingOverlay?: boolean;
    /**
     * Provide a template for 'no rows' overlay.
     */
    overlayNoRowsTemplate?: string;
    /**
     * Provide a custom no rows overlay component.
     * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#implementing-a-no-rows-overlay-component) for framework specific implementation details.
     * @initial
     */
    noRowsOverlayComponent?: any;
    /**
     * Customise the parameters provided to the no rows overlay component.
     */
    noRowsOverlayComponentParams?: any;
    /**
     * Disables the 'no rows' overlay.
     * @default false
     */
    suppressNoRowsOverlay?: boolean;
    /**
     * Set whether pagination is enabled.
     * @default false
     */
    pagination?: boolean;
    /**
     * How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored.
     * @default 100
     */
    paginationPageSize?: number;
    /**
     * Determines if the page size selector is shown in the pagination panel or not.
     * Set to an array of values to show the page size selector with custom list of possible page sizes.
     * Set to `true` to show the page size selector with the default page sizes `[20, 50, 100]`.
     * Set to `false` to hide the page size selector.
     * @default true
     * @initial
     */
    paginationPageSizeSelector?: number[] | boolean;
    /**
     * Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used.
     * @default false
     */
    paginationAutoPageSize?: boolean;
    /**
     * Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail.
     * @default false
     * @initial
     */
    paginateChildRows?: boolean;
    /**
     * If `true`, the default grid controls for navigation are hidden.
     * This is useful if `pagination=true` and you want to provide your own pagination controls.
     * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.
     * @default false
     */
    suppressPaginationPanel?: boolean;
    /**
     * Set to `true` to enable pivot mode.
     * @default false
     */
    pivotMode?: boolean;
    /**
     * When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off.
     * @default 'never'
     * @initial
     */
    pivotPanelShow?: 'always' | 'onlyWhenPivoting' | 'never';
    /**
     * The maximum number of generated columns before the grid halts execution. Upon reaching this number, the grid halts generation of columns
     * and triggers a `pivotMaxColumnsExceeded` event. `-1` for no limit.
     * @default -1
     */
    pivotMaxGeneratedColumns?: number;
    /**
     * If pivoting, set to the number of column group levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything.
     * @default 0
     */
    pivotDefaultExpanded?: number;
    /**
     * When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified.
     */
    pivotColumnGroupTotals?: 'before' | 'after';
    /**
     * When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified.
     */
    pivotRowTotals?: 'before' | 'after';
    /**
     * If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column.
     * @default false
     * @initial
     */
    pivotSuppressAutoColumn?: boolean;
    /**
     * When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups.
     * @default false
     * @initial
     */
    suppressExpandablePivotGroups?: boolean;
    /**
     * If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection.
     * @default false
     */
    functionsReadOnly?: boolean;
    /**
     * A map of 'function name' to 'function' for custom aggregation functions.
     * @initial
     */
    aggFuncs?: {
        [key: string]: IAggFunc<TData>;
    };
    /**
     * When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`.
     * @default false
     * @initial
     */
    suppressAggFuncInHeader?: boolean;
    /**
     * When using aggregations, the grid will always calculate the root level aggregation value.
     * @default false
     */
    alwaysAggregateAtRootLevel?: boolean;
    /**
     * @deprecated v30 - made default and toggled via alwaysAggregateAtRootLevel
     * @initial
     */
    suppressAggAtRootLevel?: boolean;
    /**
     * When using change detection, only the updated column will be re-aggregated.
     * @default false
     */
    aggregateOnlyChangedColumns?: boolean;
    /**
     * Set to `true` so that aggregations are not impacted by filtering.
     * @default false
     */
    suppressAggFilteredOnly?: boolean;
    /**
     * Set to `true` to omit the value Column header when there is only a single value column.
     * @default false
     * @initial
     */
    removePivotHeaderRowWhenSingleValueColumn?: boolean;
    /**
     * Set to `false` to disable Row Animation which is enabled by default.
     * @default true
     */
    animateRows?: boolean;
    /**
     * Set to `true` to have cells flash after data changes.
     * @default false
     * @deprecated 31.2 use `enableCellChangeFlash` in the `ColDef` or `defaultColDef` for all columns.
     */
    enableCellChangeFlash?: boolean;
    /**
     * To be used when setting `enableCellChangeFlash` on column definitions. Sets the duration in milliseconds of how long a cell should remain in its "flashed" state.
     * @default 500
     */
    cellFlashDuration?: number;
    /**
     * @deprecated v31.1 - use `cellFlashDuration` instead.
     */
    cellFlashDelay?: number;
    /**
     * To be used when setting `enableCellChangeFlash` on column definitions. Sets the duration in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by cellFlashDuration has completed.
     * @default 1000
     */
    cellFadeDuration?: number;
    /**
     * @deprecated v31.1 - use `cellFadeDuration` instead.
     */
    cellFadeDelay?: number;
    /**
     * Set to `true` to have cells flash after data changes even when the change is due to filtering.
     * @default false
     * @initial
     */
    allowShowChangeAfterFilter?: boolean;
    /**
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * @default 'normal'
     */
    domLayout?: DomLayoutType;
    /**
     * When `true`, the order of rows and columns in the DOM are consistent with what is on screen.
     * Disables row animations.
     * @default false
     * @initial
     */
    ensureDomOrder?: boolean;
    /**
     * Set to `true` to operate the grid in RTL (Right to Left) mode.
     * @default false
     * @initial
     */
    enableRtl?: boolean;
    /**
     * Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered.
     * @default false
     * @initial
     */
    suppressColumnVirtualisation?: boolean;
    /**
     * By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
     * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen), or `suppressRowVirtualisation` is true, or if your grid height is able to display more than 500 rows at once.**
     * @default false
     * @initial
     */
    suppressMaxRenderedRowRestriction?: boolean;
    /**
     * Set to `true` so that the grid doesn't virtualise the rows. For example, if you have 100 rows, but only 10 visible due to scrolling, all 100 will always be rendered.
     * @default false
     * @initial
     */
    suppressRowVirtualisation?: boolean;
    /**
     * Set to `true` to enable Managed Row Dragging.
     * @default false
     */
    rowDragManaged?: boolean;
    /**
     * Set to `true` to suppress row dragging.
     * @default false
     */
    suppressRowDrag?: boolean;
    /**
     * Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up.
     * @default false
     */
    suppressMoveWhenRowDragging?: boolean;
    /**
     * Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle.
     * @default false
     */
    rowDragEntireRow?: boolean;
    /**
     * Set to `true` to enable dragging multiple rows at the same time.
     * @default false
     */
    rowDragMultiRow?: boolean;
    /**
     * A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
     * If this callback is not set, the current cell value will be used.
     * If the `rowDragText` callback is set in the ColDef it will take precedence over this, except when
     * `rowDragEntireRow=true`.
     * @initial
     */
    rowDragText?: (params: IRowDragItem, dragItemCount: number) => string;
    /**
     * Provide your own cell renderer component to use for full width rows.
     * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.
     */
    fullWidthCellRenderer?: any;
    /**
     * Customise the parameters provided to the `fullWidthCellRenderer` component.
     */
    fullWidthCellRendererParams?: any;
    /**
     * Set to `true` to have the Full Width Rows embedded in grid's main container so they can be scrolled horizontally.
     */
    embedFullWidthRows?: boolean;
    /**
     * @deprecated v31
     * When enabled, the grid will cast group values to string type.
     * @default false
     * @initial
     */
    suppressGroupMaintainValueType?: boolean;
    /**
     * Specifies how the results of row grouping should be displayed.
     *
     *  The options are:
     *
     * - `'singleColumn'`: single group column automatically added by the grid.
     * - `'multipleColumns'`: a group column per row group is added automatically.
     * - `'groupRows'`: group rows are automatically added instead of group columns.
     * - `'custom'`: informs the grid that group columns will be provided.
     */
    groupDisplayType?: RowGroupingDisplayType;
    /**
     * If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything.
     * @default 0
     */
    groupDefaultExpanded?: number;
    /**
     * Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included.
     */
    autoGroupColumnDef?: ColDef<TData>;
    /**
     * When `true`, preserves the current group order when sorting on non-group columns.
     * @default false
     */
    groupMaintainOrder?: boolean;
    /**
     * When `true`, if you select a group, the children of the group will also be selected.
     * @default false
     */
    groupSelectsChildren?: boolean;
    /**
     * If grouping, locks the group settings of a number of columns, e.g. `0` for no group locking. `1` for first group column locked, `-1` for all group columns locked.
     * @default 0
     * @initial
     */
    groupLockGroupColumns?: number;
    /**
     * Set to determine whether filters should be applied on aggregated group values.
     * @default false
     */
    groupAggFiltering?: boolean | IsRowFilterable<TData>;
    /**
     * If grouping, this controls whether to show a group footer when the group is expanded.
     * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
     * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
     * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.
     * If a callback function is provided, it can used to select which groups will have a footer added.
     * @default false
     *
     * @deprecated v31.3 - use `groupTotalRow` instead.
     */
    groupIncludeFooter?: boolean | UseGroupFooter<TData>;
    /**
     * Set to `true` to show a 'grand total' group footer across all groups.
     * @default false
     *
     * @deprecated v31.3 - use `grandTotalRow` instead.
     */
    groupIncludeTotalFooter?: boolean;
    /**
     * When provided, an extra row group total row will be inserted into row groups at the specified position, to display
     * when the group is expanded. This row will contain the aggregate values for the group. If a callback function is
     * provided, it can be used to selectively determine which groups will have a total row added.
     */
    groupTotalRow?: 'top' | 'bottom' | UseGroupTotalRow<TData>;
    /**
     * When provided, an extra grand total row will be inserted into the grid at the specified position.
     * This row displays the aggregate totals of all rows in the grid.
     */
    grandTotalRow?: 'top' | 'bottom';
    /**
     * Suppress the sticky behaviour of the total rows, can be suppressed individually by passing `'grand'` or `'group'`.
     */
    suppressStickyTotalRow?: boolean | 'grand' | 'group';
    /**
     * If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand.
     * @default false
     */
    groupSuppressBlankHeader?: boolean;
    /**
     * If using `groupSelectsChildren`, then only the children that pass the current filter will get selected.
     * @default false
     */
    groupSelectsFiltered?: boolean;
    /**
     * Shows the open group in the group column for non-group rows.
     * @default false
     */
    showOpenedGroup?: boolean;
    /**
     * Set to `true` to collapse groups that only have one child.
     * @default false
     */
    groupRemoveSingleChildren?: boolean;
    /**
     * Set to `true` to collapse lowest level groups that only have one child.
     * @default false
     */
    groupRemoveLowestSingleChildren?: boolean;
    /**
     * Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience.
     * @default false
     */
    groupHideOpenParents?: boolean;
    /**
     * Set to `true` to prevent the grid from creating a '(Blanks)' group for nodes which do not belong to a group, and display the unbalanced nodes alongside group nodes.
     * @default false
     */
    groupAllowUnbalanced?: boolean;
    /**
     * When to show the 'row group panel' (where you drag rows to group) at the top.
     * @default 'never'
     */
    rowGroupPanelShow?: 'always' | 'onlyWhenGrouping' | 'never';
    /**
     * Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
     * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.
     */
    groupRowRenderer?: any;
    /**
     * Customise the parameters provided to the `groupRowRenderer` component.
     */
    groupRowRendererParams?: any;
    /**
     * By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping.
     * @default false
     */
    suppressMakeColumnVisibleAfterUnGroup?: boolean;
    /**
     * Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.
     * @default false
     */
    treeData?: boolean;
    /**
     * Set to `true` to suppress sort indicators and actions from the row group panel.
     * @default false
     * @initial
     */
    rowGroupPanelSuppressSort?: boolean;
    /**
     * Set to `true` prevent Group Rows from sticking to the top of the grid.
     * @default false
     * @initial
     */
    suppressGroupRowsSticky?: boolean;
    /**
     * Data to be displayed as pinned top rows in the grid.
     */
    pinnedTopRowData?: any[];
    /**
     * Data to be displayed as pinned bottom rows in the grid.
     */
    pinnedBottomRowData?: any[];
    /**
     * Sets the row model type.
     * @default 'clientSide'
     * @initial
     */
    rowModelType?: RowModelType;
    /**
     * Set the data to be displayed as rows in the grid.
     */
    rowData?: TData[] | null;
    /**
     * How many milliseconds to wait before executing a batch of async transactions.
     */
    asyncTransactionWaitMillis?: number;
    /**
     * Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates.
     * @default false
     */
    suppressModelUpdateAfterUpdateTransaction?: boolean;
    /**
     * Provide the datasource for infinite scrolling.
     */
    datasource?: IDatasource;
    /**
     * How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
     * @default 1
     * @initial
     */
    cacheOverflowSize?: number;
    /**
     * How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
     * @default 1
     * @initial
     */
    infiniteInitialRowCount?: number;
    /**
     * Set how many loading rows to display to the user for the root level group.
     * @default 1
     * @initial
     */
    serverSideInitialRowCount?: number;
    /**
     * When `true`, the Server-side Row Model will suppress Infinite Scrolling and load all the data at the current level.
     * @default false
     * @initial
     * @deprecated v31.1
     */
    suppressServerSideInfiniteScroll?: boolean;
    /**
     * When `true`, the Server-side Row Model will not use a full width loading renderer, instead using the colDef `loadingCellRenderer` if present.
     */
    suppressServerSideFullWidthLoadingRow?: boolean;
    /**
     * How many rows for each block in the store, i.e. how many rows returned from the server at a time.
     * @default 100
     */
    cacheBlockSize?: number;
    /**
     * How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.
     * @initial
     */
    maxBlocksInCache?: number;
    /**
     * How many requests to hit the server with concurrently. If the max is reached, requests are queued.
     * Set to `-1` for no maximum restriction on requests.
     * @default 2
     * @initial
     */
    maxConcurrentDatasourceRequests?: number;
    /**
     * How many milliseconds to wait before loading a block. Useful when scrolling over many blocks, as it prevents blocks loading until scrolling has settled.
     * @initial
     */
    blockLoadDebounceMillis?: number;
    /**
     * When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping.
     * @default false
     */
    purgeClosedRowNodes?: boolean;
    /**
     * Provide the `serverSideDatasource` for server side row model.
     */
    serverSideDatasource?: IServerSideDatasource;
    /**
     * When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server.
     * @default false
     */
    serverSideSortAllLevels?: boolean;
    /**
     * When enabled, sorts fully loaded groups in the browser instead of requesting from the server.
     * @default false
     */
    serverSideEnableClientSideSort?: boolean;
    /**
     * When enabled, only refresh groups directly impacted by a filter. This property only applies when there is Row Grouping & filtering is handled on the server.
     * @default false
     * @initial
     */
    serverSideOnlyRefreshFilteredGroups?: boolean;
    /**
     * @deprecated v30 This property has been deprecated. Use `serverSideOnlyRefreshFilteredGroups` instead.
     */
    serverSideFilterAllLevels?: boolean;
    /**
     * When enabled, Sorting will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
     * @default false
     * @deprecated
     */
    serverSideSortOnServer?: boolean;
    /**
     * When enabled, Filtering will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
     * @default false
     * @deprecated
     */
    serverSideFilterOnServer?: boolean;
    /**
     * Used to split pivot field strings for generating pivot result columns when `pivotResultFields` is provided as part of a `getRows` success.
     * @default '_'
     * @initial
     */
    serverSidePivotResultFieldSeparator?: string;
    /**
     * To use the viewport row model you need to provide the grid with a `viewportDatasource`.
     */
    viewportDatasource?: IViewportDatasource;
    /**
     * When using viewport row model, sets the page size for the viewport.
     * @initial
     */
    viewportRowModelPageSize?: number;
    /**
     * When using viewport row model, sets the buffer size for the viewport.
     * @initial
     */
    viewportRowModelBufferSize?: number;
    /**
     * Set to `true` to always show the horizontal scrollbar.
     * @default false
     */
    alwaysShowHorizontalScroll?: boolean;
    /**
     * Set to `true` to always show the vertical scrollbar.
     * @default false
     */
    alwaysShowVerticalScroll?: boolean;
    /**
     * Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on slow machines.
     * @default false
     * @initial
     */
    debounceVerticalScrollbar?: boolean;
    /**
     * Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.)
     * @default false
     */
    suppressHorizontalScroll?: boolean;
    /**
     * When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data.
     * @default false
     */
    suppressScrollOnNewData?: boolean;
    /**
     * When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present.
     * @default false
     */
    suppressScrollWhenPopupsAreOpen?: boolean;
    /**
     * When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if the grid is working fast enough that you don't need animation frames and you don't want the grid to flicker.
     * @default false
     * @initial
     */
    suppressAnimationFrame?: boolean;
    /**
     * If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function.
     * @default false
     */
    suppressMiddleClickScrolls?: boolean;
    /**
     * If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page.
     * @default false
     * @initial
     */
    suppressPreventDefaultOnMouseWheel?: boolean;
    /**
     * Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations.
     * @initial
     */
    scrollbarWidth?: number;
    /**
     * Type of Row Selection: `single`, `multiple`.
     */
    rowSelection?: 'single' | 'multiple';
    /**
     * Set to `true` to allow multiple rows to be selected using single click.
     * @default false
     */
    rowMultiSelectWithClick?: boolean;
    /**
     * If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`.
     * @default false
     */
    suppressRowDeselection?: boolean;
    /**
     * If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection.
     * @default false
     */
    suppressRowClickSelection?: boolean;
    /**
     * If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels.
     * @default false
     */
    suppressCellFocus?: boolean;
    /**
     * If `true`, header cells won't be focusable. This means keyboard navigation will be disabled for grid header cells, but remain enabled in other elements of the grid such as grid cells and tool panels.
     * @default false
     */
    suppressHeaderFocus?: boolean;
    /**
     * If `true`, only a single range can be selected.
     * @default false
     */
    suppressMultiRangeSelection?: boolean;
    /**
     * Set to `true` to be able to select the text within cells.
     *
     * **Note:** When this is set to `true`, the clipboard service is disabled and only selected text is copied.
     * @default false
     */
    enableCellTextSelection?: boolean;
    /**
     * Set to `true` to enable Range Selection.
     * @default false
     */
    enableRangeSelection?: boolean;
    /**
     * Set to `true` to enable the Range Handle.
     * @default false
     */
    enableRangeHandle?: boolean;
    /**
     * Set to `true` to enable the Fill Handle.
     * @default false
     */
    enableFillHandle?: boolean;
    /**
     * Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical.
     * @default 'xy'
     */
    fillHandleDirection?: 'x' | 'y' | 'xy';
    /**
     * Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle.
     * @default false
     */
    suppressClearOnFillReduction?: boolean;
    /**
     * Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`.
     * @default [null, 'asc', 'desc']
     */
    sortingOrder?: (SortDirection)[];
    /**
     * Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower.
     * @default false
     */
    accentedSort?: boolean;
    /**
     * Set to `true` to show the 'no sort' icon.
     * @default false
     */
    unSortIcon?: boolean;
    /**
     * Set to `true` to suppress multi-sort when the user shift-clicks a column header.
     * @default false
     */
    suppressMultiSort?: boolean;
    /**
     * Set to `true` to always multi-sort when the user clicks a column header, regardless of key presses.
     * @default false
     */
    alwaysMultiSort?: boolean;
    /**
     * Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key.
     */
    multiSortKey?: 'ctrl';
    /**
     * Set to `true` to suppress sorting of un-sorted data to match original row data.
     * @default false
     */
    suppressMaintainUnsortedOrder?: boolean;
    /**
     * Icons to use inside the grid instead of the grid's default icons.
     * @initial
     */
    icons?: {
        [key: string]: Function | string;
    };
    /**
     * Default row height in pixels.
     * @default 25
     */
    rowHeight?: number;
    /**
     * The style properties to apply to all rows. Set to an object of key (style names) and values (style values).
     */
    rowStyle?: RowStyle;
    /**
     * CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names).
     */
    rowClass?: string | string[];
    /**
     * Rules which can be applied to include certain CSS classes.
     */
    rowClassRules?: RowClassRules<TData>;
    /**
     * Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class.
     * @default false
     */
    suppressRowHoverHighlight?: boolean;
    /**
     * Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning.
     * @default false
     * @initial
     */
    suppressRowTransform?: boolean;
    /**
     * Set to `true` to highlight columns by adding the `ag-column-hover` CSS class.
     * @default false
     */
    columnHoverHighlight?: boolean;
    /**
     * Provide a custom `gridId` for this instance of the grid. Value will be set on the root DOM node using the attribute `grid-id` as well as being accessible via the `gridApi.getGridId()` method.
     * @initial
     */
    gridId?: string;
    /**
     * When enabled, sorts only the rows added/updated by a transaction.
     * @default false
     */
    deltaSort?: boolean;
    /**
     */
    treeDataDisplayType?: TreeDataDisplayType;
    /**
     * @deprecated v29.2
     * @initial
     */
    functionsPassive?: boolean;
    /**
     * @initial
     */
    enableGroupEdit?: boolean;
    /**
     * Initial state for the grid. Only read once on initialization. Can be used in conjunction with `api.getState()` to save and restore grid state.
     * @initial
     */
    initialState?: GridState;
    /**
     * **React only**.
     *
     * If enabled, makes it easier to set up custom components.
     * If disabled, custom components will either need to have methods declared imperatively,
     * or the component props will not update reactively. The behaviour with this disabled is deprecated,
     * and in v32 this will default to `true`.
     * @initial
     * @default false
     */
    reactiveCustomComponents?: boolean;
    /**
     * For customising the context menu.
     */
    getContextMenuItems?: GetContextMenuItems<TData>;
    /**
     * For customising the main 'column header' menu.
     * @initial
     */
    getMainMenuItems?: GetMainMenuItems<TData>;
    /**
     * Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup.
     */
    postProcessPopup?: (params: PostProcessPopupParams<TData>) => void;
    /**
     * Allows the user to process the columns being removed from the pinned section because the viewport is too small to accommodate them.
     * Returns an array of columns to be removed from the pinned areas.
     * @initial
     */
    processUnpinnedColumns?: (params: ProcessUnpinnedColumnsParams<TData>) => Column[];
    /**
     * Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel.
     */
    processCellForClipboard?: (params: ProcessCellForExportParams<TData>) => any;
    /**
     * Allows you to process header values for the clipboard.
     */
    processHeaderForClipboard?: (params: ProcessHeaderForExportParams<TData>) => any;
    /**
     * Allows you to process group header values for the clipboard.
     */
    processGroupHeaderForClipboard?: (params: ProcessGroupHeaderForExportParams<TData>) => any;
    /**
     * Allows you to process cells from the clipboard. Handy if for example you have number fields, and want to block non-numbers from getting into the grid.
     */
    processCellFromClipboard?: (params: ProcessCellForExportParams<TData>) => any;
    /**
     * Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself.
     */
    sendToClipboard?: (params: SendToClipboardParams<TData>) => void;
    /**
     * Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data.
     */
    processDataFromClipboard?: (params: ProcessDataFromClipboardParams<TData>) => string[][] | null;
    /**
     * Grid calls this method to know if an external filter is present.
     */
    isExternalFilterPresent?: (params: IsExternalFilterPresentParams<TData>) => boolean;
    /**
     * Should return `true` if external filter passes, otherwise `false`.
     */
    doesExternalFilterPass?: (node: IRowNode<TData>) => boolean;
    /**
     * Callback to be used to customise the chart toolbar items.
     * @initial
     */
    getChartToolbarItems?: GetChartToolbarItems;
    /**
     * Callback to enable displaying the chart in an alternative chart container.
     * @initial
     */
    createChartContainer?: (params: ChartRefParams<TData>) => void;
    /**
     * Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.
     */
    navigateToNextHeader?: (params: NavigateToNextHeaderParams<TData>) => (HeaderPosition | null);
    /**
     * Allows overriding the default behaviour for when user hits `Tab` key when a header is focused.
     * Return the next header position to navigate to, `true` to stay on the current header,
     * or `false` to let the browser handle the tab behaviour.
     * As of v31.3, returning `null` is deprecated.
     */
    tabToNextHeader?: (params: TabToNextHeaderParams<TData>) => (HeaderPosition | boolean | null);
    /**
     * Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.
     */
    navigateToNextCell?: (params: NavigateToNextCellParams<TData>) => (CellPosition | null);
    /**
     * Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused.
     * Return the next cell position to navigate to, `true` to stay on the current cell,
     * or `false` to let the browser handle the tab behaviour.
     * As of v31.3, returning `null` is deprecated.
     */
    tabToNextCell?: (params: TabToNextCellParams<TData>) => (CellPosition | boolean | null);
    /**
     * A callback for localising text within the grid.
     * @initial
     */
    getLocaleText?: (params: GetLocaleTextParams<TData>) => string;
    /**
     * Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)
     */
    getDocument?: () => Document;
    /**
     * Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.
     * @initial
     */
    paginationNumberFormatter?: (params: PaginationNumberFormatterParams<TData>) => string;
    /**
     * Callback to use when you need access to more then the current column for aggregation.
     */
    getGroupRowAgg?: (params: GetGroupRowAggParams<TData>) => any;
    /**
     * (Client-side Row Model only) Allows groups to be open by default.
     */
    isGroupOpenByDefault?: (params: IsGroupOpenByDefaultParams<TData>) => boolean;
    /**
     * Allows default sorting of groups.
     */
    initialGroupOrderComparator?: (params: InitialGroupOrderComparatorParams<TData>) => number;
    /**
     * Callback to be used with pivoting, to allow changing the second column definition.
     */
    processPivotResultColDef?: (colDef: ColDef<TData>) => void;
    /**
     * Callback to be used with pivoting, to allow changing the second column group definition.
     */
    processPivotResultColGroupDef?: (colGroupDef: ColGroupDef<TData>) => void;
    /**
     * Callback to be used when working with Tree Data when `treeData = true`.
     */
    getDataPath?: GetDataPath<TData>;
    /**
     * Allows setting the child count for a group row.
     * @initial
     */
    getChildCount?: (dataItem: any) => number;
    /**
     * Allows providing different params for different levels of grouping.
     * @initial
     */
    getServerSideGroupLevelParams?: (params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams;
    /**
     * Allows groups to be open by default.
     */
    isServerSideGroupOpenByDefault?: (params: IsServerSideGroupOpenByDefaultParams) => boolean;
    /**
     * Allows cancelling transactions.
     */
    isApplyServerSideTransaction?: IsApplyServerSideTransaction;
    /**
     * SSRM Tree Data: Allows specifying which rows are expandable.
     */
    isServerSideGroup?: IsServerSideGroup;
    /**
     * SSRM Tree Data: Allows specifying group keys.
     */
    getServerSideGroupKey?: GetServerSideGroupKey;
    /**
     * Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-business-key='abc'` where `abc` is what you return as the business key.
     * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.
     */
    getBusinessKeyForNode?: (node: IRowNode<TData>) => string;
    /**
     * Allows setting the ID for a particular row node based on the data.
     * @initial
     */
    getRowId?: GetRowIdFunc<TData>;
    /**
     * When enabled, getRowId() callback is implemented and new Row Data is set, the grid will disregard all previous rows and treat the new Row Data as new data. As a consequence, all Row State (eg selection, rendered rows) will be reset.
     * @default false
     */
    resetRowDataOnUpdate?: boolean;
    /**
     * Allows you to process rows after they are created, so you can do final adding of custom attributes etc.
     */
    processRowPostCreate?: (params: ProcessRowParams<TData>) => void;
    /**
     * Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable.
     */
    isRowSelectable?: IsRowSelectable<TData>;
    /**
     * Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row.
     */
    isRowMaster?: IsRowMaster<TData>;
    /**
     * Callback to fill values instead of simply copying values or increasing number values using linear progression.
     */
    fillOperation?: (params: FillOperationParams<TData>) => any;
    /**
     * Callback to perform additional sorting after the grid has sorted the rows.
     */
    postSortRows?: (params: PostSortRowsParams<TData>) => void;
    /**
     * Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.
     */
    getRowStyle?: (params: RowClassParams<TData>) => RowStyle | undefined;
    /**
     * Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.
     */
    getRowClass?: (params: RowClassParams<TData>) => string | string[] | undefined;
    /**
     * Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.
     */
    getRowHeight?: (params: RowHeightParams<TData>) => number | undefined | null;
    /**
     * Tells the grid if this row should be rendered as full width.
     */
    isFullWidthRow?: (params: IsFullWidthRowParams<TData>) => boolean;
    /**
     * The tool panel visibility has changed. Fires twice if switching between panels - once with the old panel and once with the new panel.
     */
    onToolPanelVisibleChanged?(event: ToolPanelVisibleChangedEvent<TData>): void;
    /**
     * The tool panel size has been changed.
     */
    onToolPanelSizeChanged?(event: ToolPanelSizeChangedEvent<TData>): void;
    /**
     * The column menu visibility has changed. Fires twice if switching between tabs - once with the old tab and once with the new tab.
     */
    onColumnMenuVisibleChanged?(event: ColumnMenuVisibleChangedEvent<TData>): void;
    /**
     * The context menu visibility has changed (opened or closed).
     */
    onContextMenuVisibleChanged?(event: ContextMenuVisibleChangedEvent<TData>): void;
    /**
     * Cut operation has started.
     */
    onCutStart?(event: CutStartEvent<TData>): void;
    /**
     * Cut operation has ended.
     */
    onCutEnd?(event: CutEndEvent<TData>): void;
    /**
     * Paste operation has started.
     */
    onPasteStart?(event: PasteStartEvent<TData>): void;
    /**
     * Paste operation has ended.
     */
    onPasteEnd?(event: PasteEndEvent<TData>): void;
    /**
     * A column, or group of columns, was hidden / shown.
     */
    onColumnVisible?(event: ColumnVisibleEvent<TData>): void;
    /**
     * A column, or group of columns, was pinned / unpinned.
     */
    onColumnPinned?(event: ColumnPinnedEvent<TData>): void;
    /**
     * A column was resized.
     */
    onColumnResized?(event: ColumnResizedEvent<TData>): void;
    /**
     * A column was moved.
     */
    onColumnMoved?(event: ColumnMovedEvent<TData>): void;
    /**
     * A value column was added or removed.
     */
    onColumnValueChanged?(event: ColumnValueChangedEvent<TData>): void;
    /**
     * The pivot mode flag was changed.
     */
    onColumnPivotModeChanged?(event: ColumnPivotModeChangedEvent<TData>): void;
    /**
     * A pivot column was added, removed or order changed.
     */
    onColumnPivotChanged?(event: ColumnPivotChangedEvent<TData>): void;
    /**
     * A column group was opened / closed.
     */
    onColumnGroupOpened?(event: ColumnGroupOpenedEvent<TData>): void;
    /**
     * User set new columns.
     */
    onNewColumnsLoaded?(event: NewColumnsLoadedEvent<TData>): void;
    /**
     * The list of grid columns changed.
     */
    onGridColumnsChanged?(event: GridColumnsChangedEvent<TData>): void;
    /**
     * The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc.
     */
    onDisplayedColumnsChanged?(event: DisplayedColumnsChangedEvent<TData>): void;
    /**
     * The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default).
     */
    onVirtualColumnsChanged?(event: VirtualColumnsChangedEvent<TData>): void;
    /**
     * Shotgun - gets called when either a) new columns are set or b) `api.applyColumnState()` is used, so everything has changed.
     */
    onColumnEverythingChanged?(event: ColumnEverythingChangedEvent<TData>): void;
    /**
     * A mouse cursor is initially moved over a column header.
     */
    onColumnHeaderMouseOver?(event: ColumnHeaderMouseOverEvent<TData>): void;
    /**
     * A mouse cursor is moved out of a column header.
     */
    onColumnHeaderMouseLeave?(event: ColumnHeaderMouseLeaveEvent<TData>): void;
    /**
     * A click is performed on a column header.
     */
    onColumnHeaderClicked?(event: ColumnHeaderClickedEvent<TData>): void;
    /**
     * A context menu action, such as right-click or context menu key press, is performed on a column header.
     */
    onColumnHeaderContextMenu?(event: ColumnHeaderContextMenuEvent<TData>): void;
    /**
     * Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
     * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.
     */
    onComponentStateChanged?(event: ComponentStateChangedEvent<TData>): void;
    /**
     * Value has changed after editing (this event will not fire if editing was cancelled, eg ESC was pressed) or
     *  if cell value has changed as a result of cut, paste, cell clear (pressing Delete key),
     * fill handle, copy range down, undo and redo.
    */
    onCellValueChanged?(event: CellValueChangedEvent<TData>): void;
    /**
     * Value has changed after editing. Only fires when `readOnlyEdit=true`.
     */
    onCellEditRequest?(event: CellEditRequestEvent<TData>): void;
    /**
     * A cell's value within a row has changed. This event corresponds to Full Row Editing only.
     */
    onRowValueChanged?(event: RowValueChangedEvent<TData>): void;
    /**
     * Editing a cell has started.
     */
    onCellEditingStarted?(event: CellEditingStartedEvent<TData>): void;
    /**
     * Editing a cell has stopped.
     */
    onCellEditingStopped?(event: CellEditingStoppedEvent<TData>): void;
    /**
     * Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing.
     */
    onRowEditingStarted?(event: RowEditingStartedEvent<TData>): void;
    /**
     * Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing.
     */
    onRowEditingStopped?(event: RowEditingStoppedEvent<TData>): void;
    /**
     * Undo operation has started.
     */
    onUndoStarted?(event: UndoStartedEvent<TData>): void;
    /**
     * Undo operation has ended.
     */
    onUndoEnded?(event: UndoEndedEvent<TData>): void;
    /**
     * Redo operation has started.
     */
    onRedoStarted?(event: RedoStartedEvent<TData>): void;
    /**
     * Redo operation has ended.
     */
    onRedoEnded?(event: RedoEndedEvent<TData>): void;
    /**
     * Range delete operation (cell clear) has started.
     */
    onRangeDeleteStart?(event: RangeDeleteStartEvent<TData>): void;
    /**
     * Range delete operation (cell clear) has ended.
     */
    onRangeDeleteEnd?(event: RangeDeleteEndEvent<TData>): void;
    /**
     * Fill operation has started.
     */
    onFillStart?(event: FillStartEvent<TData>): void;
    /**
     * Fill operation has ended.
     */
    onFillEnd?(event: FillEndEvent<TData>): void;
    /**
     * Filter has been opened.
     */
    onFilterOpened?(event: FilterOpenedEvent<TData>): void;
    /**
     * Filter has been modified and applied.
     */
    onFilterChanged?(event: FilterChangedEvent<TData>): void;
    /**
     * Filter was modified but not applied. Used when filters have 'Apply' buttons.
     */
    onFilterModified?(event: FilterModifiedEvent<TData>): void;
    /**
     * Advanced Filter Builder visibility has changed (opened or closed).
     */
    onAdvancedFilterBuilderVisibleChanged?(event: AdvancedFilterBuilderVisibleChangedEvent<TData>): void;
    /**
     * A chart has been created.
     */
    onChartCreated?(event: ChartCreated<TData>): void;
    /**
     * The data range for the chart has been changed.
     */
    onChartRangeSelectionChanged?(event: ChartRangeSelectionChanged<TData>): void;
    /**
     * Formatting changes have been made by users through the Format Panel.
     */
    onChartOptionsChanged?(event: ChartOptionsChanged<TData>): void;
    /**
     * A chart has been destroyed.
     */
    onChartDestroyed?(event: ChartDestroyed<TData>): void;
    /**
     * DOM event `keyDown` happened on a cell.
     */
    onCellKeyDown?(event: CellKeyDownEvent<TData> | FullWidthCellKeyDownEvent<TData>): void;
    /**
     * The grid has initialised and is ready for most api calls, but may not be fully rendered yet  */
    onGridReady?(event: GridReadyEvent<TData>): void;
    /**
     * Invoked immediately before the grid is destroyed. This is useful for cleanup logic that needs to run before the grid is torn down.
     */
    onGridPreDestroyed?(event: GridPreDestroyedEvent<TData>): void;
    /**
     * Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents */
    onFirstDataRendered?(event: FirstDataRenderedEvent<TData>): void;
    /**
     * The size of the grid `div` has changed. In other words, the grid was resized.
     */
    onGridSizeChanged?(event: GridSizeChangedEvent<TData>): void;
    /**
     * Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events.
     */
    onModelUpdated?(event: ModelUpdatedEvent<TData>): void;
    /**
     * A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row.
     */
    onVirtualRowRemoved?(event: VirtualRowRemovedEvent<TData>): void;
    /**
     * Which rows are rendered in the DOM has changed.
     */
    onViewportChanged?(event: ViewportChangedEvent<TData>): void;
    /**
     * The body was scrolled horizontally or vertically.
     */
    onBodyScroll?(event: BodyScrollEvent<TData>): void;
    /**
     * Main body of the grid has stopped scrolling, either horizontally or vertically.
     */
    onBodyScrollEnd?(event: BodyScrollEndEvent<TData>): void;
    /**
     * When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
     */
    onDragStarted?(event: DragStartedEvent<TData>): void;
    /**
     * When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
     */
    onDragStopped?(event: DragStoppedEvent<TData>): void;
    /**
     * Grid state has been updated.
     */
    onStateUpdated?(event: StateUpdatedEvent<TData>): void;
    /**
     * Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
     *
     *  - The page size changes.
     *  - The current shown page is changed.
     *  - New data is loaded onto the grid.
     */
    onPaginationChanged?(event: PaginationChangedEvent<TData>): void;
    /**
     * A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid.
     */
    onRowDragEnter?(event: RowDragEvent<TData>): void;
    /**
     * The mouse has moved while dragging.
     */
    onRowDragMove?(event: RowDragEvent<TData>): void;
    /**
     * The mouse has left the grid while dragging.
     */
    onRowDragLeave?(event: RowDragEvent<TData>): void;
    /**
     * The drag has finished over the grid.
     */
    onRowDragEnd?(event: RowDragEvent<TData>): void;
    /**
     * A row group column was added, removed or reordered.
     */
    onColumnRowGroupChanged?(event: ColumnRowGroupChangedEvent<TData>): void;
    /**
     * A row group was opened or closed.
     */
    onRowGroupOpened?(event: RowGroupOpenedEvent<TData>): void;
    /**
     * Fired when calling either of the API methods `expandAll()` or `collapseAll()`.
     */
    onExpandOrCollapseAll?(event: ExpandCollapseAllEvent<TData>): void;
    /**
     * Exceeded the `pivotMaxGeneratedColumns` limit when generating columns.
     */
    onPivotMaxColumnsExceeded?(event: PivotMaxColumnsExceededEvent<TData>): void;
    /**
     * The client has set new pinned row data into the grid.
     */
    onPinnedRowDataChanged?(event: PinnedRowDataChangedEvent<TData>): void;
    /**
     * Client-Side Row Model only. The client has updated data for the grid by either a) setting new Row Data or b) Applying a Row Transaction.
     */
    onRowDataUpdated?(event: RowDataUpdatedEvent<TData>): void;
    /**
     * Async transactions have been applied. Contains a list of all transaction results.
     */
    onAsyncTransactionsFlushed?(event: AsyncTransactionsFlushed<TData>): void;
    /**
     * A server side store has finished refreshing.
     */
    onStoreRefreshed?(event: StoreRefreshedEvent<TData>): void;
    /**
     * Cell is clicked.
     */
    onCellClicked?(event: CellClickedEvent<TData>): void;
    /**
     * Cell is double clicked.
     */
    onCellDoubleClicked?(event: CellDoubleClickedEvent<TData>): void;
    /**
     * Cell is focused.
     */
    onCellFocused?(event: CellFocusedEvent<TData>): void;
    /**
     * Mouse entered cell.
     */
    onCellMouseOver?(event: CellMouseOverEvent<TData>): void;
    /**
     * Mouse left cell.
     */
    onCellMouseOut?(event: CellMouseOutEvent<TData>): void;
    /**
     * Mouse down on cell.
     */
    onCellMouseDown?(event: CellMouseDownEvent<TData>): void;
    /**
     * Row is clicked.
     */
    onRowClicked?(event: RowClickedEvent<TData>): void;
    /**
     * Row is double clicked.
     */
    onRowDoubleClicked?(event: RowDoubleClickedEvent<TData>): void;
    /**
     * Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected.
     */
    onRowSelected?(event: RowSelectedEvent<TData>): void;
    /**
     * Row selection is changed. Use the grid API `getSelectedNodes()` or `getSelectedRows()` to get the new list of selected nodes / row data.
     */
    onSelectionChanged?(event: SelectionChangedEvent<TData>): void;
    /**
     * Cell is right clicked.
     */
    onCellContextMenu?(event: CellContextMenuEvent<TData>): void;
    /**
     * A change to range selection has occurred.
     */
    onRangeSelectionChanged?(event: RangeSelectionChangedEvent<TData>): void;
    /**
     * A tooltip has been displayed */
    onTooltipShow?(event?: TooltipShowEvent<TData>): void;
    /**
     * A tooltip was hidden */
    onTooltipHide?(event?: TooltipHideEvent<TData>): void;
    /**
     * Sort has changed. The grid also listens for this and updates the model.
     */
    onSortChanged?(event: SortChangedEvent<TData>): void;
    /**
     * @deprecated v29.2 */
    onColumnRowGroupChangeRequest?(event: ColumnRowGroupChangeRequestEvent<TData>): void;
    /**
     * @deprecated v29.2 */
    onColumnPivotChangeRequest?(event: ColumnPivotChangeRequestEvent<TData>): void;
    /**
     * @deprecated v29.2 */
    onColumnValueChangeRequest?(event: ColumnValueChangeRequestEvent<TData>): void;
    /**
     * @deprecated v29.2 */
    onColumnAggFuncChangeRequest?(event: ColumnAggFuncChangeRequestEvent<TData>): void;
    /**
     * @deprecated Since v31 api is no longer attached to GridOptions. See https://ag-grid.com/javascript-data-grid/grid-interface/#grid-api for how to access the api in your framework.
     */
    api?: never;
    /**
     * @deprecated Since v31 `columnApi` is deprecated and all methods are now on the grid `api`. See https://ag-grid.com/javascript-data-grid/grid-interface/#grid-api for how to access the api in your framework.
     */
    columnApi?: never;
}
export type RowGroupingDisplayType = 'singleColumn' | 'multipleColumns' | 'groupRows' | 'custom';
export type TreeDataDisplayType = 'auto' | 'custom';
export interface GetDataPath<TData = any> {
    (data: TData): string[];
}
export interface IsServerSideGroup {
    (dataItem: any): boolean;
}
export interface IsRowFilterable<TData = any> {
    (params: GetGroupAggFilteringParams<TData>): boolean;
}
export interface UseGroupFooter<TData = any> {
    (params: GetGroupIncludeFooterParams<TData>): boolean;
}
export interface UseGroupTotalRow<TData = any> {
    (params: GetGroupIncludeTotalRowParams<TData>): 'top' | 'bottom' | undefined;
}
export interface IsApplyServerSideTransaction {
    (params: IsApplyServerSideTransactionParams): boolean;
}
export interface GetServerSideGroupKey {
    (dataItem: any): string;
}
export interface IsRowMaster<TData = any> {
    (dataItem: TData): boolean;
}
export interface IsRowSelectable<TData = any> {
    (node: IRowNode<TData>): boolean;
}
export interface RowClassRules<TData = any> {
    [cssClassName: string]: (((params: RowClassParams<TData>) => boolean) | string);
}
export interface RowStyle {
    [cssProperty: string]: string | number;
}
export interface RowClassParams<TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /**
     * The data associated with this row from rowData. Data is `undefined` for row groups.
     */
    data: TData | undefined;
    /**
     * The RowNode associated with this row */
    node: IRowNode<TData>;
    /**
     * The index of the row */
    rowIndex: number;
}
export interface GetContextMenuItems<TData = any, TContext = any> {
    (params: GetContextMenuItemsParams<TData, TContext>): (string | MenuItemDef<TData, TContext>)[];
}
export interface GetChartToolbarItems {
    (params: GetChartToolbarItemsParams): ChartMenuOptions[];
}
export interface GetMainMenuItems<TData = any, TContext = any> {
    (params: GetMainMenuItemsParams<TData, TContext>): (string | MenuItemDef<TData, TContext>)[];
}
export interface GetChartMenuItems<TData = any, TContext = any> {
    (params: GetChartMenuItemsParams<TData, TContext>): (string | MenuItemDef<TData, TContext>)[];
}
export interface GetRowNodeIdFunc<TData = any> {
    (data: TData): string;
}
export interface GetRowIdFunc<TData = any> {
    (params: GetRowIdParams<TData>): string;
}
export interface ChartRef {
    /**
     * The id of the created chart.
     */
    chartId: string;
    /**
     * The chart instance that is produced by AG Charts which can be used to interact with the chart directly.
     */
    chart: any;
    /**
     * The chart DOM element, which the application is responsible for placing into the DOM.
     */
    chartElement: HTMLElement;
    /**
     * The application is responsible for calling this when the chart is no longer needed.
     */
    destroyChart: () => void;
}
export interface ChartRefParams<TData = any> extends AgGridCommon<TData, any>, ChartRef {
}
export interface ServerSideGroupLevelParams {
    /**
     * Whether to have infinite scroll active or not for the level.
     */
    suppressInfiniteScroll?: boolean;
    /**
     * For Infinite Scroll only.
     * How many blocks to keep in cache.
     * If missing, defaults to grid options `maxBlocksInCache`.
     */
    maxBlocksInCache?: number;
    /**
     * For Infinite Scroll only.
     * Cache block size.
     * If missing, defaults to grid options `cacheBlockSize`.
     */
    cacheBlockSize?: number;
}
/**
     * @deprecated use ServerSideGroupLevelParams instead */
export interface ServerSideStoreParams extends ServerSideGroupLevelParams {
}
export interface LoadingCellRendererSelectorFunc<TData = any> {
    (params: ILoadingCellRendererParams<TData>): LoadingCellRendererSelectorResult | undefined;
}
export interface LoadingCellRendererSelectorResult {
    /**
     * Equivalent of setting `loadingCellRenderer` */
    component?: any;
    /**
     * Equivalent of setting `loadingCellRendererParams` */
    params?: any;
}
export type DomLayoutType = 'normal' | 'autoHeight' | 'print';
