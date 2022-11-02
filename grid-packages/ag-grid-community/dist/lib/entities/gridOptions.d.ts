/************************************************************************************************
 * If you change the GridOptions interface, you must also update PropertyKeys to be consistent. *
 ************************************************************************************************/
import { ColumnApi } from "../columns/columnApi";
import { AsyncTransactionsFlushed, BodyScrollEndEvent, BodyScrollEvent, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditingStartedEvent, CellEditingStoppedEvent, CellEditRequestEvent, CellFocusedEvent, CellKeyDownEvent, CellKeyPressEvent, CellMouseDownEvent, CellMouseOutEvent, CellMouseOverEvent, CellValueChangedEvent, ChartCreated, ChartDestroyed, ChartOptionsChanged, ChartRangeSelectionChanged, ColumnAggFuncChangeRequestEvent, ColumnEverythingChangedEvent, ColumnGroupOpenedEvent, ColumnMovedEvent, ColumnPinnedEvent, ColumnPivotChangedEvent, ColumnPivotChangeRequestEvent, ColumnPivotModeChangedEvent, ColumnResizedEvent, ColumnRowGroupChangedEvent, ColumnRowGroupChangeRequestEvent, ColumnValueChangedEvent, ColumnValueChangeRequestEvent, ColumnVisibleEvent, ComponentStateChangedEvent, DisplayedColumnsChangedEvent, DragStartedEvent, DragStoppedEvent, ExpandCollapseAllEvent, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent, FirstDataRenderedEvent, FullWidthCellKeyDownEvent, FullWidthCellKeyPressEvent, GridColumnsChangedEvent, GridReadyEvent, GridSizeChangedEvent, ModelUpdatedEvent, NewColumnsLoadedEvent, PaginationChangedEvent, PasteEndEvent, PasteStartEvent, PinnedRowDataChangedEvent, RangeSelectionChangedEvent, RowClickedEvent, RowDataChangedEvent, RowDataUpdatedEvent, RowDoubleClickedEvent, RowDragEvent, RowEditingStartedEvent, RowEditingStoppedEvent, RowGroupOpenedEvent, RowSelectedEvent, RowValueChangedEvent, SelectionChangedEvent, SortChangedEvent, ToolPanelSizeChangedEvent, ToolPanelVisibleChangedEvent, ViewportChangedEvent, VirtualColumnsChangedEvent, VirtualRowRemovedEvent } from "../events";
import { GridApi } from "../gridApi";
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
import { CellPosition } from "./cellPosition";
import { ColDef, ColGroupDef, IAggFunc, SuppressKeyboardEventParams } from "./colDef";
import { FillOperationParams, GetChartToolbarItemsParams, GetContextMenuItemsParams, GetGroupRowAggParams, GetLocaleTextParams, GetMainMenuItemsParams, GetRowIdParams, GetServerSideGroupLevelParamsParams, InitialGroupOrderComparatorParams, IsApplyServerSideTransactionParams, IsExternalFilterPresentParams, IsFullWidthRowParams, IsGroupOpenByDefaultParams, IsServerSideGroupOpenByDefaultParams, NavigateToNextCellParams, NavigateToNextHeaderParams, PaginationNumberFormatterParams, PostProcessPopupParams, PostSortRowsParams, ProcessDataFromClipboardParams, ProcessRowParams, RowHeightParams, SendToClipboardParams, TabToNextCellParams, TabToNextHeaderParams, GetGroupAggFilteringParams } from "./iCallbackParams";
import { RowNode } from "./rowNode";
import { SideBarDef } from "./sideBar";
export interface GridOptions<TData = any> {
    /** Specifies the status bar components to use in the status bar. */
    statusBar?: {
        statusPanels: StatusPanelDef[];
    };
    /** Specifies the side bar components. */
    sideBar?: SideBarDef | string | string[] | boolean | null;
    /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu. Default: `false`  */
    suppressContextMenu?: boolean;
    /**
     * When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
     * This flag is useful to prevent the browser from showing its default context menu.
     * Default: `false`
     */
    preventDefaultOnContextMenu?: boolean;
    /** Allows context menu to show, even when `Ctrl` key is held down. Default: `false`  */
    allowContextMenuWithControlKey?: boolean;
    /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header. Default: `false` */
    suppressMenuHide?: boolean;
    /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component. Default: `false`  */
    enableBrowserTooltips?: boolean;
    /**
     * The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
     * **Note:** This property does not work if `enableBrowserTooltips` is `true`.
     * Default: `2000`
     */
    tooltipShowDelay?: number;
    /**
     * The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
     * **Note:** This property does not work if `enableBrowserTooltips` is `true`.
     * Default: `10000`
     */
    tooltipHideDelay?: number;
    /** Set to `true` to have tooltips follow the cursor once they are displayed. Default: `false`  */
    tooltipMouseTrack?: boolean;
    /** DOM element to use as the popup parent for grid popups (context menu, column menu etc). */
    popupParent?: HTMLElement | null;
    /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false` */
    copyHeadersToClipboard?: boolean;
    /** Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false` */
    copyGroupHeadersToClipboard?: boolean;
    /** @deprecated Use `clipboardDelimiter` */
    clipboardDeliminator?: string;
    /**
     * Specify the delimiter to use when copying to clipboard.
     * Default: `\t`
    */
    clipboardDelimiter?: string;
    /** Set to `true` to copy the cell range or focused cell to the clipboard and never the selected rows. Default: `false` */
    suppressCopyRowsToClipboard?: boolean;
    /** Set to `true` to copy rows instead of ranges when a range with only a single cell is selected. Default: `false` */
    suppressCopySingleCellRanges?: boolean;
    /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard. Default: `false` */
    suppressLastEmptyLineOnPaste?: boolean;
    /** Set to `true` to turn off paste operations within the grid. */
    suppressClipboardPaste?: boolean;
    /** Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround. */
    suppressClipboardApi?: boolean;
    /** Array of Column / Column Group definitions. */
    columnDefs?: (ColDef<TData> | ColGroupDef<TData>)[] | null;
    /** A default column definition. Items defined in the actual column definitions get precedence. */
    defaultColDef?: ColDef<TData>;
    /** A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence. */
    defaultColGroupDef?: Partial<ColGroupDef<TData>>;
    /** An object map of custom column types which contain groups of properties that column definitions can inherit by referencing in their `type` property. */
    columnTypes?: {
        [key: string]: ColDef<TData>;
    };
    /** Keeps the order of Columns maintained after new Column Definitions are updated. Default: `false` */
    maintainColumnOrder?: boolean;
    /** If `true`, then dots in field names (e.g. `'address.firstLine'`) are not treated as deep references. Allows you to use dots in your field name if you prefer. Default: `false` */
    suppressFieldDotNotation?: boolean;
    /** @deprecated */
    deltaColumnMode?: boolean;
    /** @deprecated */
    applyColumnDefOrder?: boolean;
    /** @deprecated */
    immutableColumns?: boolean;
    /** @deprecated */
    suppressSetColumnStateEvents?: boolean;
    /** @deprecated */
    suppressColumnStateEvents?: boolean;
    /** @deprecated Set via `defaultColDef.width` */
    colWidth?: number;
    /** @deprecated Set via `defaultColDef.minWidth` */
    minColWidth?: number;
    /** @deprecated Set via `defaultColDef.maxWidth` */
    maxColWidth?: number;
    /** The height in pixels for the row containing the column label header. If not specified, it uses the theme value of `header-height`. */
    headerHeight?: number;
    /** The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`. */
    groupHeaderHeight?: number;
    /** The height in pixels for the row containing the floating filters. If not specified, it uses the theme value of `header-height`. */
    floatingFiltersHeight?: number;
    /** The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`. */
    pivotHeaderHeight?: number;
    /** The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`. */
    pivotGroupHeaderHeight?: number;
    /** Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid. Default: `false` */
    allowDragFromColumnsToolPanel?: boolean;
    /** Set to `true` to suppress column moving, i.e. to make the columns fixed position. Default: `false` */
    suppressMovableColumns?: boolean;
    /** If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns. Default: `false` */
    suppressColumnMoveAnimation?: boolean;
    /** If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden. Default: `false` */
    suppressDragLeaveHidesColumns?: boolean;
    /** If `true`, when you drag a column into a row group panel the column is not hidden. Default: `false` */
    suppressRowGroupHidesColumns?: boolean;
    /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing). */
    colResizeDefault?: 'shift';
    /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size. Default: `false` */
    suppressAutoSize?: boolean;
    /**
     * Number of pixels to add to a column width after the [auto-sizing](/column-sizing/#auto-size-columns) calculation.
     * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
     * Default: `4`
     */
    autoSizePadding?: number;
    /** Set this to `true` to skip the `headerName` when `autoSize` is called by default. Default: `false` */
    skipHeaderOnAutoSize?: boolean;
    /** A map of component names to components. */
    components?: {
        [p: string]: any;
    };
    /** @deprecated As of v27, use `components` for framework components too. */
    frameworkComponents?: {
        [p: string]: {
            new (): any;
        };
    } | any;
    /** @deprecated React UI is enabled by default. Use suppressReactUi=true to turn it off. */
    reactUi?: boolean;
    /** @deprecated Set to true to enable the experimental React UI. Works with React framework only.
     * It is planned the next major release of the grid will drop support of the legacy React engine,
     * hence this property is deprecated as will be removed in the next major release. */
    suppressReactUi?: boolean;
    /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time. */
    editType?: 'fullRow';
    /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click. Default: `false` */
    singleClickEdit?: boolean;
    /** Set to `true` so that neither single nor double click starts editing. Default: `false` */
    suppressClickEdit?: boolean;
    /** Set to `true` so stop the grid updating data after and edit. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid. */
    readOnlyEdit?: boolean;
    /**
     * Set this to `true` to stop cell editing when grid loses focus.
     * The default is that the grid stays editing until focus goes onto another cell.
     * Default: `false`
     */
    stopEditingWhenCellsLoseFocus?: boolean;
    /**
     * Set to `true` along with `enterMovesDownAfterEdit` to have Excel-style behaviour for the `Enter` key.
     * i.e. pressing the `Enter` key will move down to the cell beneath.
     * Default: `false`
     */
    enterMovesDown?: boolean;
    /**
     * Set to `true` along with `enterMovesDown` to have Excel-style behaviour for the 'Enter' key.
     * i.e. pressing the Enter key will move down to the cell beneath.
     * Default: `false`
     */
    enterMovesDownAfterEdit?: boolean;
    /** Forces Cell Editing to start when backspace is pressed. This is only relevant for MacOS users. */
    enableCellEditingOnBackspace?: boolean;
    /** Set to `true` to enable Undo / Redo while editing. */
    undoRedoCellEditing?: boolean;
    /** Set the size of the undo / redo stack. Default: `10` */
    undoRedoCellEditingLimit?: number;
    /** @deprecated Use stopEditingWhenCellsLoseFocus instead */
    stopEditingWhenGridLosesFocus?: boolean;
    /** A default configuration object used to export to CSV. */
    defaultCsvExportParams?: CsvExportParams;
    /** Prevents the user from exporting the grid to CSV. Default: `false` */
    suppressCsvExport?: boolean;
    /** A default configuration object used to export to Excel. */
    defaultExcelExportParams?: ExcelExportParams;
    /** Prevents the user from exporting the grid to Excel. Default: `false` */
    suppressExcelExport?: boolean;
    /** A list (array) of Excel styles to be used when exporting to Excel with styles. */
    excelStyles?: ExcelStyle[];
    /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams */
    defaultExportParams?: CsvExportParams | ExcelExportParams;
    /** Rows are filtered using this text as a quick filter. */
    quickFilterText?: string;
    /** Set to `true` to turn on the quick filter cache, used to improve performance when using the quick filter. Default: `false` */
    cacheQuickFilter?: boolean;
    /** Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results. Default: `false` */
    excludeChildrenWhenTreeDataFiltering?: boolean;
    /** Set to `true` to Enable Charts. Default: `false` */
    enableCharts?: boolean;
    /** The list of chart themes to be used. */
    chartThemes?: string[];
    /** A map containing custom chart themes. */
    customChartThemes?: {
        [name: string]: AgChartTheme;
    };
    /** Chart theme overrides applied to all themes. */
    chartThemeOverrides?: AgChartThemeOverrides;
    /** Set to `true` to show the Chart Tool Panels button. Note this will also remove the 'hamburger' menu option from the Chart Toolbar and always display the remaining toolbar buttons. Default: `false` */
    enableChartToolPanelsButton?: boolean;
    /** Allows customisation of the Chart Tool Panels, such as changing the tool panels visibility and order, as well as choosing which charts should be displayed in the settings panel. */
    chartToolPanelsDef?: ChartToolPanelsDef;
    /**
    * Provide your own loading cell renderer to use when data is loading via a DataSource.
    * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.
    */
    loadingCellRenderer?: any;
    /** @deprecated As of v27, use `loadingCellRenderer` for framework components too. */
    loadingCellRendererFramework?: any;
    /** Params to be passed to the `loadingCellRenderer` component. */
    loadingCellRendererParams?: any;
    /** Callback to select which loading cell renderer to be used when data is loading via a DataSource. */
    loadingCellRendererSelector?: LoadingCellRendererSelectorFunc<TData>;
    /** A map of key->value pairs for localising text within the grid. */
    localeText?: {
        [key: string]: string;
    };
    /** Set to `true` to enable Master Detail. Default: `false` */
    masterDetail?: boolean;
    /** Set to `true` to keep detail rows for when they are displayed again. Default: `false` */
    keepDetailRows?: boolean;
    /** Sets the number of details rows to keep. Default: `10` */
    keepDetailRowsCount?: number;
    /**
    * Provide a custom `detailCellRenderer` to use when a master row is expanded.
    * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.
    */
    detailCellRenderer?: any;
    /** @deprecated As of v27, use `detailCellRenderer` for framework components too. */
    detailCellRendererFramework?: any;
    /** Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params. */
    detailCellRendererParams?: any;
    /** Set fixed height in pixels for each detail row. */
    detailRowHeight?: number;
    /** Set to `true` to have the detail grid dynamically change it's height to fit it's rows. */
    detailRowAutoHeight?: boolean;
    /** Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks by your application. */
    context?: any;
    /** A list of grids to treat as Aligned Grids. If grids are aligned then the columns and horizontal scrolling will be kept in sync. */
    alignedGrids?: {
        api?: GridApi | null;
        columnApi?: ColumnApi | null;
    }[];
    /** Change this value to set the tabIndex order of the Grid within your application. Default: `0` */
    tabIndex?: number;
    /**
     * The number of rows rendered outside the viewable area the grid renders.
     * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
     * Default: `10`
     */
    rowBuffer?: number;
    /** Set to `true` to turn on the value cache. Default: `false` */
    valueCache?: boolean;
    /** Set to `true` to configure the value cache to not expire after data updates. Default: `false` */
    valueCacheNeverExpires?: boolean;
    /** Set to `true` to allow cell expressions. Default: `false` */
    enableCellExpressions?: boolean;
    /**
     * If `true`, row nodes do not have their parents set.
     * The grid doesn't use the parent reference, but it is included to help the client code navigate the node tree if it wants by providing bi-direction navigation up and down the tree.
     * If this is a problem (e.g. if you need to convert the tree to JSON, which does not allow cyclic dependencies) then set this to `true`.
     * Default: `false`
     */
    suppressParentsInRowNodes?: boolean;
    /** Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch). Default: `false` */
    suppressTouch?: boolean;
    /** Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser. Default: `false` */
    suppressFocusAfterRefresh?: boolean;
    /** Disables the asynchronous nature of the events introduced in v10, and makes them synchronous. This property only exists for the purpose of supporting legacy code which has a dependency on synchronous events from earlier versions (v9 or earlier) of AG Grid. **It is strongly recommended that you do not change this property unless you have legacy issues.** Default: `false` */
    suppressAsyncEvents?: boolean;
    /** The grid will check for `ResizeObserver` and use it if it exists in the browser, otherwise it will use the grid's alternative implementation. Some users reported issues with Chrome's `ResizeObserver`. Use this property to always use the grid's alternative implementation should such problems exist. Default: `false` */
    suppressBrowserResizeObserver?: boolean;
    /** Disables showing a warning message in the console if using a `gridOptions` or `colDef` property that doesn't exist. Default: `false` */
    suppressPropertyNamesCheck?: boolean;
    /** Disables change detection. Default: `false` */
    suppressChangeDetection?: boolean;
    /** Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems. Default: `false` */
    debug?: boolean;
    /** Provide a template for 'loading' overlay. */
    overlayLoadingTemplate?: string;
    /**
    * Provide a custom loading overlay component.
    * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-loading-overlay-component) for framework specific implementation details.
    */
    loadingOverlayComponent?: any;
    /** @deprecated As of v27, use `loadingOverlayComponent` for framework components too. */
    loadingOverlayComponentFramework?: any;
    /** Customise the parameters provided to the loading overlay component. */
    loadingOverlayComponentParams?: any;
    /** Disables the 'loading' overlay. Default: `false` */
    suppressLoadingOverlay?: boolean;
    /** Provide a template for 'no rows' overlay. */
    overlayNoRowsTemplate?: string;
    /**
    * Provide a custom no rows overlay component.
    * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-no-rows-overlay-component) for framework specific implementation details.
    */
    noRowsOverlayComponent?: any;
    /** @deprecated As of v27, use `noRowsOverlayComponent` for framework components too. */
    noRowsOverlayComponentFramework?: any;
    /** Customise the parameters provided to the no rows overlay component. */
    noRowsOverlayComponentParams?: any;
    /** Disables the 'no rows' overlay. Default: `false` */
    suppressNoRowsOverlay?: boolean;
    /** Set whether pagination is enabled. Default: `false` */
    pagination?: boolean;
    /** How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored. Default: `100` */
    paginationPageSize?: number;
    /** Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used. Default: `false` */
    paginationAutoPageSize?: boolean;
    /** Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail. Default: `false` */
    paginateChildRows?: boolean;
    /**
     * If `true`, the default grid controls for navigation are hidden.
     * This is useful if `pagination=true` and you want to provide your own pagination controls.
     * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.
     * Default: `false`
     */
    suppressPaginationPanel?: boolean;
    /** Set to `true` to enable pivot mode. Default: `false` */
    pivotMode?: boolean;
    /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off. Default: `never` */
    pivotPanelShow?: 'always' | 'onlyWhenPivoting' | 'never';
    /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified. */
    pivotColumnGroupTotals?: 'before' | 'after';
    /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified. */
    pivotRowTotals?: 'before' | 'after';
    /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column. Default: `false` */
    pivotSuppressAutoColumn?: boolean;
    /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups. Default: `false` */
    suppressExpandablePivotGroups?: boolean;
    /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection. Default: `false` */
    functionsReadOnly?: boolean;
    /** A map of 'function name' to 'function' for custom aggregation functions. */
    aggFuncs?: {
        [key: string]: IAggFunc<TData>;
    };
    /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`. Default: `false` */
    suppressAggFuncInHeader?: boolean;
    /** When `true`, the aggregations won't be computed for the root node of the grid. Default: `false` */
    suppressAggAtRootLevel?: boolean;
    /** When using change detection, only the updated column will be re-aggregated. Default: `false` */
    aggregateOnlyChangedColumns?: boolean;
    /** Set to `true` so that aggregations are not impacted by filtering. Default: `false` */
    suppressAggFilteredOnly?: boolean;
    /** Set to `true` to omit the value Column header when there is only a single value column. Default: `false` */
    removePivotHeaderRowWhenSingleValueColumn?: boolean;
    /** Set to `true` to enable Row Animation. Default: `false` */
    animateRows?: boolean;
    /** Set to `true` to have cells flash after data changes. Default: `false` */
    enableCellChangeFlash?: boolean;
    /**
     * To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long a cell should remain in its "flashed" state.
     * Default: `500`
     */
    cellFlashDelay?: number;
    /**
     * To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `cellFlashDelay` has completed.
     * Default: `1000`
     */
    cellFadeDelay?: number;
    /** Set to `true` to have cells flash after data changes even when the change is due to filtering. Default: `false` */
    allowShowChangeAfterFilter?: boolean;
    /**
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * Default: `normal`
     */
    domLayout?: 'normal' | 'autoHeight' | 'print';
    /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen. Default: `false` */
    ensureDomOrder?: boolean;
    /** Set to `true` to operate the grid in RTL (Right to Left) mode. Default: `false` */
    enableRtl?: boolean;
    /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false` */
    suppressColumnVirtualisation?: boolean;
    /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
     * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen), or `suppressRowVirtualisation` is true, or if your grid height is able to display more than 500 rows at once.**
     * Default: `false`
     */
    suppressMaxRenderedRowRestriction?: boolean;
    /** Set to `true` so that the grid doesn't virtualise the rows. For example, if you have 100 rows, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false` */
    suppressRowVirtualisation?: boolean;
    /** Set to `true` to enable Managed Row Dragging. Default: `false` */
    rowDragManaged?: boolean;
    /** Set to `true` to suppress row dragging. Default: `false` */
    suppressRowDrag?: boolean;
    /** Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up. Default: `false` */
    suppressMoveWhenRowDragging?: boolean;
    /** Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle. Default: `false` */
    rowDragEntireRow?: boolean;
    /** Set to `true` to enable dragging multiple rows at the same time. Default: `false` */
    rowDragMultiRow?: boolean;
    /**
     * A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
     * If this callback is not set, the current cell value will be used.
     * If the `rowDragText` callback is set in the ColDef it will take precedence over this, except when
     * `rowDragEntireRow=true`.
     */
    rowDragText?: (params: IRowDragItem, dragItemCount: number) => string;
    /**
    * Provide your own cell renderer component to use for full width rows.
    * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.
    */
    fullWidthCellRenderer?: any;
    /** @deprecated As of v27, use `fullWidthCellRenderer` for framework components too. */
    fullWidthCellRendererFramework?: any;
    /** Customise the parameters provided to the `fullWidthCellRenderer` component. */
    fullWidthCellRendererParams?: any;
    /** Set to `true` to have the detail grid embedded in the master grid's container and so link their horizontal scrolling. */
    embedFullWidthRows?: boolean;
    /** @deprecated */
    deprecatedEmbedFullWidthRows?: boolean;
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
    /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything. Default: `0` */
    groupDefaultExpanded?: number;
    /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included. */
    autoGroupColumnDef?: ColDef<TData>;
    /** When `true`, preserves the current group order when sorting on non-group columns. Default: `false` */
    groupMaintainOrder?: boolean;
    /** When `true`, if you select a group, the children of the group will also be selected. Default: `false` */
    groupSelectsChildren?: boolean;
    /** Set to determine whether filters should be applied on aggregated group values. Default: `false` */
    groupAggFiltering?: boolean | IsRowFilterable<TData>;
    /**
     * If grouping, this controls whether to show a group footer when the group is expanded.
     * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
     * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
     * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.
     * Default: `false`
     */
    groupIncludeFooter?: boolean;
    /** Set to `true` to show a 'grand total' group footer across all groups. Default: `false` */
    groupIncludeTotalFooter?: boolean;
    /** If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand. Default: `false` */
    groupSuppressBlankHeader?: boolean;
    /** If using `groupSelectsChildren`, then only the children that pass the current filter will get selected. Default: `false` */
    groupSelectsFiltered?: boolean;
    /** Shows the open group in the group column for non-group rows. Default: `false` */
    showOpenedGroup?: boolean;
    /** Set to `true` to collapse groups that only have one child. */
    groupRemoveSingleChildren?: boolean;
    /** Set to `true` to collapse lowest level groups that only have one child. Default: `false` */
    groupRemoveLowestSingleChildren?: boolean;
    /** Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience. Default: `false` */
    groupHideOpenParents?: boolean;
    /** When to show the 'row group panel' (where you drag rows to group) at the top. Default: `never` */
    rowGroupPanelShow?: 'always' | 'onlyWhenGrouping' | 'never';
    /**
    * Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
    * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.
    */
    groupRowRenderer?: any;
    /** @deprecated As of v27, use `groupRowRenderer` for framework components too. */
    groupRowRendererFramework?: any;
    /** Customise the parameters provided to the `groupRowRenderer` component. */
    groupRowRendererParams?: any;
    /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping. Default: `false` */
    suppressMakeColumnVisibleAfterUnGroup?: boolean;
    /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback. */
    treeData?: boolean;
    /** Set to `true` to suppress sort indicators and actions from the row group panel. Default: `false`. */
    rowGroupPanelSuppressSort?: boolean;
    /** Set to `true` to keep open Group Rows visible at the top of the grid. Default: `false`.*/
    groupRowsSticky?: boolean;
    /** @deprecated - this is now groupRowRendererParams.innerRenderer */
    groupRowInnerRenderer?: any;
    /** @deprecated - this is now groupRowRendererParams.innerRenderer */
    groupRowInnerRendererFramework?: any;
    /** @deprecated - Use groupDisplayType = 'multipleColumns' instead */
    groupMultiAutoColumn?: boolean;
    /** @deprecated - Use groupDisplayType = 'groupRows' instead */
    groupUseEntireRow?: boolean;
    /** @deprecated - Use groupDisplayType = 'custom' instead */
    groupSuppressAutoColumn?: boolean;
    /** @deprecated - no longer needed, transaction updates keep group state */
    rememberGroupStateWhenNewData?: boolean;
    /** Data to be displayed as pinned top rows in the grid. */
    pinnedTopRowData?: any[];
    /** Data to be displayed as pinned bottom rows in the grid. */
    pinnedBottomRowData?: any[];
    /** Sets the row model type. Default: `clientSide` */
    rowModelType?: RowModelType;
    /** Set the data to be displayed as rows in the grid. */
    rowData?: TData[] | null;
    /**
     * @deprecated Immutable Data is on by default when grid callback getRowId() is implemented
     * Enables Immutable Data mode, for compatibility with immutable stores. Default: `false` */
    immutableData?: boolean;
    /** How many milliseconds to wait before executing a batch of async transactions. */
    asyncTransactionWaitMillis?: number;
    /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates. Default: `false` */
    suppressModelUpdateAfterUpdateTransaction?: boolean;
    /** @deprecated */
    deltaRowDataMode?: boolean;
    /** @deprecated use asyncTransactionWaitMillis instead */
    batchUpdateWaitMillis?: number;
    /** Provide the datasource for infinite scrolling. */
    datasource?: IDatasource;
    /**
     * How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
     * Default: `1`
     */
    cacheOverflowSize?: number;
    /**
     * How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
     * Default: `1`
     */
    infiniteInitialRowCount?: number;
    /**
     * Set how many loading rows to display to the user for the root level group.
     * Default: `1`
     */
    serverSideInitialRowCount?: number;
    /** @deprecated Whether to use Full Store or Partial Store for storing rows. Default: `full`.
     * Deprecated in favour of serverSideInfiniteScroll. When true, Partial Store is used. When false,
     * Full Store is used.
     */
    serverSideStoreType?: ServerSideStoreType;
    /** Set whether Server-side Row Model will use Infinite Scrolling
     * Default: `false`
     */
    serverSideInfiniteScroll?: boolean;
    /**
     * How many rows for each block in the store, i.e. how many rows returned from the server at a time.
     * Default: `100`
     */
    cacheBlockSize?: number;
    /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value. */
    maxBlocksInCache?: number;
    /**
     * How many requests to hit the server with concurrently. If the max is reached, requests are queued.
     * Set to `-1` for no maximum restriction on requests.
     * Default: `2`
     */
    maxConcurrentDatasourceRequests?: number;
    /** How many milliseconds to wait before loading a block. Useful when infinite scrolling and scrolling over many infinite blocks, as it prevents blocks loading until scrolling has settled. */
    blockLoadDebounceMillis?: number;
    /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping. Default: `false`  */
    purgeClosedRowNodes?: boolean;
    /** Provide the `serverSideDatasource` for server side row model. */
    serverSideDatasource?: IServerSideDatasource;
    /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server. Default: `false` */
    serverSideSortAllLevels?: boolean;
    /** When enabled, always refreshes top level groups regardless of which column was filtered. This property only applies when there is Row Grouping & filtering is handled on the server. Default: `false` */
    serverSideFilterAllLevels?: boolean;
    /**
     * When enabled, Sorting will be done on the server side. When serverSideInfiniteScroll=true, does nothing,
     * as Sorting is always server side when Infinite Scroll is active.
     * Default: `false`
     */
    serverSideSortOnServer?: boolean;
    /**
     * When enabled, Filtering will be done on the server side. When serverSideInfiniteScroll=true, does nothing,
     * as Filtering is always server side when Infinite Scroll is active.
     * Default: `false`
     */
    serverSideFilterOnServer?: boolean;
    /** @deprecated This property has been deprecated. Use `serverSideSortAllLevels` instead. */
    serverSideSortingAlwaysResets?: boolean;
    /** @deprecated This property has been deprecated. Use `serverSideFilterAllLevels` instead. */
    serverSideFilteringAlwaysResets?: boolean;
    /** @deprecated */
    suppressEnterpriseResetOnNewColumns?: boolean;
    /** To use the viewport row model you need to provide the grid with a `viewportDatasource`. */
    viewportDatasource?: IViewportDatasource;
    /** When using viewport row model, sets the page size for the viewport. */
    viewportRowModelPageSize?: number;
    /** When using viewport row model, sets the buffer size for the viewport. */
    viewportRowModelBufferSize?: number;
    /** Set to `true` to always show the horizontal scrollbar. Default: `false` */
    alwaysShowHorizontalScroll?: boolean;
    /** Set to `true` to always show the vertical scrollbar. Default: `false` */
    alwaysShowVerticalScroll?: boolean;
    /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on slow machines. Default: `false` */
    debounceVerticalScrollbar?: boolean;
    /** Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.) Default: `false` */
    suppressHorizontalScroll?: boolean;
    /** When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data. Default: `false` */
    suppressScrollOnNewData?: boolean;
    /** When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present. Default: `false` */
    suppressScrollWhenPopupsAreOpen?: boolean;
    /** When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if the grid is working fast enough that you don't need animation frames and you don't want the grid to flicker. Default: `false` */
    suppressAnimationFrame?: boolean;
    /** If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function. Default: `false` */
    suppressMiddleClickScrolls?: boolean;
    /** If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page. Default: `false` */
    suppressPreventDefaultOnMouseWheel?: boolean;
    /** Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations. */
    scrollbarWidth?: number;
    /** Type of Row Selection: `single`, `multiple`. */
    rowSelection?: 'single' | 'multiple';
    /** Set to `true` to allow multiple rows to be selected using single click. Default: `false` */
    rowMultiSelectWithClick?: boolean;
    /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`. Default: `false` */
    suppressRowDeselection?: boolean;
    /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection. Default: `false` */
    suppressRowClickSelection?: boolean;
    /**
     * @deprecated This property has been deprecated. Use `suppressCellFocus` instead.
     */
    suppressCellSelection?: boolean;
    /** If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels. Default: `false` */
    suppressCellFocus?: boolean;
    /** If `true`, only a single range can be selected. Default: `false` */
    suppressMultiRangeSelection?: boolean;
    /**
     * Set to `true` to be able to select the text within cells.
     *
     * **Note:** When this is set to `true`, the clipboard service is disabled.
     * Default: `false`
     */
    enableCellTextSelection?: boolean;
    /** Set to `true` to enable Range Selection. Default: `false` */
    enableRangeSelection?: boolean;
    /** Set to `true` to enable the Range Handle. Default: `false` */
    enableRangeHandle?: boolean;
    /** Set to `true` to enable the Fill Handle. Default: `false` */
    enableFillHandle?: boolean;
    /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical. Default: `xy` */
    fillHandleDirection?: 'x' | 'y' | 'xy';
    /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle. Default: `false`*/
    suppressClearOnFillReduction?: boolean;
    /** @deprecated - rowDeselection is now true by default and should be suppressed by using suppressRowDeselection */
    rowDeselection?: boolean;
    /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`. Default: `[null, 'asc', 'desc']`  */
    sortingOrder?: ('asc' | 'desc' | null)[];
    /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower. Default: `false` */
    accentedSort?: boolean;
    /** Set to `true` to show the 'no sort' icon. Default: `false` */
    unSortIcon?: boolean;
    /** Set to `true` to suppress multi-sort when the user shift-clicks a column header. Default: `false` */
    suppressMultiSort?: boolean;
    /** Set to `true` to always multi-sort when the user clicks a column header, regardless of key presses. Default: `false` */
    alwaysMultiSort?: boolean;
    /** Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key. */
    multiSortKey?: 'ctrl';
    /** Set to `true` to suppress sorting of un-sorted data to match original row data. Default: `false` */
    suppressMaintainUnsortedOrder?: boolean;
    /** Icons to use inside the grid instead of the grid's default icons. */
    icons?: {
        [key: string]: Function | string;
    };
    /** Default row height in pixels. Default: `25` */
    rowHeight?: number;
    /** The style properties to apply to all rows. Set to an object of key (style names) and values (style values) */
    rowStyle?: RowStyle;
    /** CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names). */
    rowClass?: string | string[];
    /** Rules which can be applied to include certain CSS classes. */
    rowClassRules?: RowClassRules<TData>;
    /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class. Default: `false` */
    suppressRowHoverHighlight?: boolean;
    /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning. Default: `false` */
    suppressRowTransform?: boolean;
    /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class. Default: `false` */
    columnHoverHighlight?: boolean;
    deltaSort?: boolean;
    treeDataDisplayType?: TreeDataDisplayType;
    /** @deprecated  */
    angularCompileRows?: boolean;
    /** @deprecated  */
    angularCompileFilters?: boolean;
    functionsPassive?: boolean;
    enableGroupEdit?: boolean;
    /** For customising the context menu. */
    getContextMenuItems?: GetContextMenuItems<TData>;
    /** For customising the main 'column header' menu. */
    getMainMenuItems?: GetMainMenuItems;
    /** Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup. */
    postProcessPopup?: (params: PostProcessPopupParams<TData>) => void;
    /** Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel. */
    processCellForClipboard?: (params: ProcessCellForExportParams<TData>) => any;
    /** Allows you to process header values for the clipboard.  */
    processHeaderForClipboard?: (params: ProcessHeaderForExportParams<TData>) => any;
    /** Allows you to process group header values for the clipboard.  */
    processGroupHeaderForClipboard?: (params: ProcessGroupHeaderForExportParams<TData>) => any;
    /** Allows you to process cells from the clipboard. Handy if for example you have number fields, and want to block non-numbers from getting into the grid. */
    processCellFromClipboard?: (params: ProcessCellForExportParams<TData>) => any;
    /** Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself. */
    sendToClipboard?: (params: SendToClipboardParams<TData>) => void;
    /** Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data. */
    processDataFromClipboard?: (params: ProcessDataFromClipboardParams<TData>) => string[][] | null;
    /** Grid calls this method to know if an external filter is present. */
    isExternalFilterPresent?: (params: IsExternalFilterPresentParams<TData>) => boolean;
    /** Should return `true` if external filter passes, otherwise `false`. */
    doesExternalFilterPass?: (node: RowNode<TData>) => boolean;
    /** Callback to be used to customise the chart toolbar items. */
    getChartToolbarItems?: GetChartToolbarItems;
    /** Callback to enable displaying the chart in an alternative chart container. */
    createChartContainer?: (params: ChartRefParams<TData>) => void;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header. */
    navigateToNextHeader?: (params: NavigateToNextHeaderParams<TData>) => (HeaderPosition | null);
    /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.  */
    tabToNextHeader?: (params: TabToNextHeaderParams<TData>) => (HeaderPosition | null);
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.  */
    navigateToNextCell?: (params: NavigateToNextCellParams<TData>) => (CellPosition | null);
    /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused. Return the next Cell position to navigate to or null to stay on current cell.  */
    tabToNextCell?: (params: TabToNextCellParams<TData>) => (CellPosition | null);
    /** @deprecated - Set via `colDef.suppressKeyboardEvent`. If you need this to be set for every column set via the `defaultColDef.suppressKeyboardEvent` property. */
    suppressKeyboardEvent?: (params: SuppressKeyboardEventParams<TData>) => boolean;
    /** @deprecated - Use `getLocaleText` instead. */
    localeTextFunc?: (key: string, defaultValue: string, variableValues?: string[]) => string;
    /** A callback for localising text within the grid. */
    getLocaleText?: (params: GetLocaleTextParams<TData>) => string;
    /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports) */
    getDocument?: () => Document;
    /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions. */
    paginationNumberFormatter?: (params: PaginationNumberFormatterParams<TData>) => string;
    /** @deprecated - Use `getGroupRowAgg` instead. */
    groupRowAggNodes?: (nodes: RowNode[]) => any;
    /** Callback to use when you need access to more then the current column for aggregation. */
    getGroupRowAgg?: (params: GetGroupRowAggParams<TData>) => any;
    /** (Client-side Row Model only) Allows groups to be open by default. */
    isGroupOpenByDefault?: (params: IsGroupOpenByDefaultParams<TData>) => boolean;
    /** Allows default sorting of groups. */
    initialGroupOrderComparator?: (params: InitialGroupOrderComparatorParams<TData>) => number;
    /** @deprecated - Use `initialGroupOrderComparator` instead */
    defaultGroupOrderComparator?: (nodeA: RowNode<TData>, nodeB: RowNode<TData>) => number;
    /** @deprecated - Use `processPivotResultColDef` instead */
    processSecondaryColDef?: (colDef: ColDef<TData>) => void;
    /** @deprecated - Use `processPivotResultColGroupDef` instead */
    processSecondaryColGroupDef?: (colGroupDef: ColGroupDef<TData>) => void;
    /** Callback to be used with pivoting, to allow changing the second column definition. */
    processPivotResultColDef?: (colDef: ColDef<TData>) => void;
    /** Callback to be used with pivoting, to allow changing the second column group definition. */
    processPivotResultColGroupDef?: (colGroupDef: ColGroupDef<TData>) => void;
    /** Callback to be used when working with Tree Data when `treeData = true`. */
    getDataPath?: GetDataPath<TData>;
    /** @deprecated - Use initialGroupOrderComparator instead */
    defaultGroupSortComparator?: (nodeA: RowNode<TData>, nodeB: RowNode<TData>) => number;
    /** Allows setting the child count for a group row. */
    getChildCount?: (dataItem: any) => number;
    /** Allows providing different params for different levels of grouping. */
    getServerSideGroupLevelParams?: (params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams;
    /** @deprecated use `getServerSideGroupLevelParams` instead. */
    getServerSideStoreParams?: (params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams;
    /** Allows groups to be open by default. */
    isServerSideGroupOpenByDefault?: (params: IsServerSideGroupOpenByDefaultParams) => boolean;
    /** Allows cancelling transactions. */
    isApplyServerSideTransaction?: IsApplyServerSideTransaction;
    /** SSRM Tree Data: Allows specifying which rows are expandable. */
    isServerSideGroup?: IsServerSideGroup;
    /** SSRM Tree Data: Allows specifying group keys. */
    getServerSideGroupKey?: GetServerSideGroupKey;
    /**
     * Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-id='abc'` where `abc` is what you return as the business key.
     * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.
     */
    getBusinessKeyForNode?: (node: RowNode<TData>) => string;
    /**
     * @deprecated Use `getRowId` instead - however be aware, `getRowId()` will also set grid option `immutableData=true`
     * Allows you to set the ID for a particular row node based on the data. */
    getRowNodeId?: GetRowNodeIdFunc<TData>;
    /** Allows setting the ID for a particular row node based on the data. */
    getRowId?: GetRowIdFunc<TData>;
    /** When enabled, getRowId() callback is implemented and new Row Data is set, the grid will disregard all previous rows and treat the new Row Data as new data. As a consequence, all Row State (eg selection, rendered rows) will be reset.  Default: `false` */
    resetRowDataOnUpdate?: boolean;
    /** Allows you to process rows after they are created, so you can do final adding of custom attributes etc. */
    processRowPostCreate?: (params: ProcessRowParams<TData>) => void;
    /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable. */
    isRowSelectable?: IsRowSelectable<TData>;
    /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row. */
    isRowMaster?: IsRowMaster<TData>;
    /** Callback to fill values instead of simply copying values or increasing number values using linear progression. */
    fillOperation?: (params: FillOperationParams<TData>) => any;
    /** @deprecated Use `postSortRows` instead */
    postSort?: (nodes: RowNode<TData>[]) => void;
    /** Callback to perform additional sorting after the grid has sorted the rows. */
    postSortRows?: (params: PostSortRowsParams<TData>) => void;
    /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles. */
    getRowStyle?: (params: RowClassParams<TData>) => RowStyle | undefined;
    /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class. */
    getRowClass?: (params: RowClassParams<TData>) => string | string[] | undefined;
    /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height. */
    getRowHeight?: (params: RowHeightParams<TData>) => number | undefined | null;
    /** @deprecated Use `isFullWidthRow` instead. */
    isFullWidthCell?: (rowNode: RowNode<TData>) => boolean;
    /** Tells the grid if this row should be rendered as full width. */
    isFullWidthRow?: (params: IsFullWidthRowParams<TData>) => boolean;
    /** The tool panel was hidden or shown. Use `api.isToolPanelShowing()` to get status. */
    onToolPanelVisibleChanged?(event: ToolPanelVisibleChangedEvent<TData>): void;
    /** The tool panel size has been changed. */
    onToolPanelSizeChanged?(event: ToolPanelSizeChangedEvent<TData>): void;
    /** Paste operation has started. */
    onPasteStart?(event: PasteStartEvent<TData>): void;
    /** Paste operation has ended. */
    onPasteEnd?(event: PasteEndEvent<TData>): void;
    /** A column, or group of columns, was hidden / shown. */
    onColumnVisible?(event: ColumnVisibleEvent<TData>): void;
    /** A column, or group of columns, was pinned / unpinned. */
    onColumnPinned?(event: ColumnPinnedEvent<TData>): void;
    /** A column was resized. */
    onColumnResized?(event: ColumnResizedEvent<TData>): void;
    /** A column was moved. To find out when the column move is finished you can use the `dragStopped` event below. */
    onColumnMoved?(event: ColumnMovedEvent<TData>): void;
    /** A value column was added or removed. */
    onColumnValueChanged?(event: ColumnValueChangedEvent<TData>): void;
    /** The pivot mode flag was changed. */
    onColumnPivotModeChanged?(event: ColumnPivotModeChangedEvent<TData>): void;
    /** A pivot column was added, removed or order changed. */
    onColumnPivotChanged?(event: ColumnPivotChangedEvent<TData>): void;
    /** A column group was opened / closed. */
    onColumnGroupOpened?(event: ColumnGroupOpenedEvent<TData>): void;
    /** User set new columns. */
    onNewColumnsLoaded?(event: NewColumnsLoadedEvent<TData>): void;
    /** The list of grid columns changed. */
    onGridColumnsChanged?(event: GridColumnsChangedEvent<TData>): void;
    /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc. */
    onDisplayedColumnsChanged?(event: DisplayedColumnsChangedEvent<TData>): void;
    /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default). */
    onVirtualColumnsChanged?(event: VirtualColumnsChangedEvent<TData>): void;
    /** Shotgun - gets called when either a) new columns are set or b) `columnApi.setState()` is used, so everything has changed. */
    onColumnEverythingChanged?(event: ColumnEverythingChangedEvent<TData>): void;
    /**
     * Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
     * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.
     */
    onComponentStateChanged?(event: ComponentStateChangedEvent<TData>): void;
    /**
     * Value has changed after editing (this event will not fire if editing was cancelled, eg ESC was pressed) or
     *  if cell value has changed as a result of paste operation.
    */
    onCellValueChanged?(event: CellValueChangedEvent<TData>): void;
    /** Value has changed after editing. Only fires when doing Read Only Edits, ie `readOnlyEdit=true`. */
    onCellEditRequest?(event: CellEditRequestEvent<TData>): void;
    /** A cell's value within a row has changed. This event corresponds to Full Row Editing only. */
    onRowValueChanged?(event: RowValueChangedEvent<TData>): void;
    /** Editing a cell has started. */
    onCellEditingStarted?(event: CellEditingStartedEvent<TData>): void;
    /** Editing a cell has stopped. */
    onCellEditingStopped?(event: CellEditingStoppedEvent<TData>): void;
    /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing. */
    onRowEditingStarted?(event: RowEditingStartedEvent<TData>): void;
    /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing. */
    onRowEditingStopped?(event: RowEditingStoppedEvent<TData>): void;
    /** Filter has been opened. */
    onFilterOpened?(event: FilterOpenedEvent<TData>): void;
    /** Filter has been modified and applied. */
    onFilterChanged?(event: FilterChangedEvent<TData>): void;
    /** Filter was modified but not applied. Used when filters have 'Apply' buttons. */
    onFilterModified?(event: FilterModifiedEvent<TData>): void;
    /** A chart has been created. */
    onChartCreated?(event: ChartCreated<TData>): void;
    /** The data range for the chart has been changed. */
    onChartRangeSelectionChanged?(event: ChartRangeSelectionChanged<TData>): void;
    /** Formatting changes have been made by users through the Format Panel. */
    onChartOptionsChanged?(event: ChartOptionsChanged<TData>): void;
    /** A chart has been destroyed. */
    onChartDestroyed?(event: ChartDestroyed<TData>): void;
    /** DOM event `keyDown` happened on a cell. */
    onCellKeyDown?(event: CellKeyDownEvent<TData> | FullWidthCellKeyDownEvent<TData>): void;
    /** DOM event `keyPress` happened on a cell. */
    onCellKeyPress?(event: CellKeyPressEvent<TData> | FullWidthCellKeyPressEvent<TData>): void;
    /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet  */
    onGridReady?(event: GridReadyEvent<TData>): void;
    /** Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents */
    onFirstDataRendered?(event: FirstDataRenderedEvent<TData>): void;
    /** The size of the grid `div` has changed. In other words, the grid was resized. */
    onGridSizeChanged?(event: GridSizeChangedEvent<TData>): void;
    /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events. */
    onModelUpdated?(event: ModelUpdatedEvent<TData>): void;
    /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row. */
    onVirtualRowRemoved?(event: VirtualRowRemovedEvent<TData>): void;
    /** Which rows are rendered in the DOM has changed. */
    onViewportChanged?(event: ViewportChangedEvent<TData>): void;
    /** The body was scrolled horizontally or vertically. */
    onBodyScroll?(event: BodyScrollEvent<TData>): void;
    /** Main body of the grid has stopped scrolling, either horizontally or vertically. */
    onBodyScrollEnd?(event: BodyScrollEndEvent<TData>): void;
    /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc. */
    onDragStarted?(event: DragStartedEvent<TData>): void;
    /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc. */
    onDragStopped?(event: DragStoppedEvent<TData>): void;
    /**
     * Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
     *
     *  - The page size changes.
     *  - The current shown page is changed.
     *  - New data is loaded onto the grid.
     */
    onPaginationChanged?(event: PaginationChangedEvent<TData>): void;
    /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid. */
    onRowDragEnter?(event: RowDragEvent<TData>): void;
    /** The mouse has moved while dragging. */
    onRowDragMove?(event: RowDragEvent<TData>): void;
    /** The mouse has left the grid while dragging. */
    onRowDragLeave?(event: RowDragEvent<TData>): void;
    /** The drag has finished over the grid. */
    onRowDragEnd?(event: RowDragEvent<TData>): void;
    /** A row group column was added or removed. */
    onColumnRowGroupChanged?(event: ColumnRowGroupChangedEvent<TData>): void;
    /** A row group was opened or closed. */
    onRowGroupOpened?(event: RowGroupOpenedEvent<TData>): void;
    /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`. */
    onExpandOrCollapseAll?(event: ExpandCollapseAllEvent<TData>): void;
    /** The client has set new pinned row data into the grid. */
    onPinnedRowDataChanged?(event: PinnedRowDataChangedEvent<TData>): void;
    /** @deprecated No longer fired, use onRowDataUpdated instead */
    onRowDataChanged?(event: RowDataChangedEvent<TData>): void;
    /** The client has updated data for the grid by either a) setting new Row Data or b) Applying a Row Transaction. */
    onRowDataUpdated?(event: RowDataUpdatedEvent<TData>): void;
    /** Async transactions have been applied. Contains a list of all transaction results. */
    onAsyncTransactionsFlushed?(event: AsyncTransactionsFlushed<TData>): void;
    /** Cell is clicked. */
    onCellClicked?(event: CellClickedEvent<TData>): void;
    /** Cell is double clicked. */
    onCellDoubleClicked?(event: CellDoubleClickedEvent<TData>): void;
    /** Cell is focused. */
    onCellFocused?(event: CellFocusedEvent<TData>): void;
    /** Mouse entered cell. */
    onCellMouseOver?(event: CellMouseOverEvent<TData>): void;
    /** Mouse left cell. */
    onCellMouseOut?(event: CellMouseOutEvent<TData>): void;
    /** Mouse down on cell. */
    onCellMouseDown?(event: CellMouseDownEvent<TData>): void;
    /** Row is clicked. */
    onRowClicked?(event: RowClickedEvent<TData>): void;
    /** Row is double clicked. */
    onRowDoubleClicked?(event: RowDoubleClickedEvent<TData>): void;
    /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected. */
    onRowSelected?(event: RowSelectedEvent<TData>): void;
    /** Row selection is changed. Use the grid API `getSelectedNodes()` or `getSelectedRows()` to get the new list of selected nodes / row data. */
    onSelectionChanged?(event: SelectionChangedEvent<TData>): void;
    /** Cell is right clicked. */
    onCellContextMenu?(event: CellContextMenuEvent<TData>): void;
    /** A change to range selection has occurred. */
    onRangeSelectionChanged?(event: RangeSelectionChangedEvent<TData>): void;
    /** Sort has changed. The grid also listens for this and updates the model. */
    onSortChanged?(event: SortChangedEvent<TData>): void;
    onColumnRowGroupChangeRequest?(event: ColumnRowGroupChangeRequestEvent<TData>): void;
    onColumnPivotChangeRequest?(event: ColumnPivotChangeRequestEvent<TData>): void;
    onColumnValueChangeRequest?(event: ColumnValueChangeRequestEvent<TData>): void;
    onColumnAggFuncChangeRequest?(event: ColumnAggFuncChangeRequestEvent<TData>): void;
    /**
     * The Grid Api for interacting with the grid.
     * Set by the grid on init, set to null on destroy.
     */
    api?: GridApi<TData> | null;
    /**
     * The Column Api for interacting with the grid columns.
     * Set by the grid on init, set to null on destroy.
     */
    columnApi?: ColumnApi | null;
}
export declare type RowGroupingDisplayType = 'singleColumn' | 'multipleColumns' | 'groupRows' | 'custom';
export declare type TreeDataDisplayType = 'auto' | 'custom';
export interface GetDataPath<TData = any> {
    (data: TData): string[];
}
export interface IsServerSideGroup {
    (dataItem: any): boolean;
}
export interface IsRowFilterable<TData = any> {
    (params: GetGroupAggFilteringParams<TData>): boolean;
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
    (node: RowNode<TData>): boolean;
}
export interface RowClassRules<TData = any> {
    [cssClassName: string]: (((params: RowClassParams<TData>) => boolean) | string);
}
export interface RowStyle {
    [cssProperty: string]: string | number;
}
export interface RowClassParams<TData = any> extends AgGridCommon<TData> {
    /** The data associated with this row from rowData. Data is `undefined` for row groups. */
    data: TData | undefined;
    /** The RowNode associated with this row */
    node: RowNode<TData>;
    /** The index of the row */
    rowIndex: number;
}
export interface GetContextMenuItems<TData = any> {
    (params: GetContextMenuItemsParams<TData>): (string | MenuItemDef)[];
}
export interface GetChartToolbarItems {
    (params: GetChartToolbarItemsParams): ChartMenuOptions[];
}
export interface MenuItemLeafDef {
    /** Name of the menu item */
    name: string;
    /** It the item should be enabled / disabled */
    disabled?: boolean;
    /** Shortcut (just display text, saying the shortcut here does nothing) */
    shortcut?: string;
    /** Function that gets executed when item is chosen */
    action?: () => void;
    /** Set to true to provide a check beside the option */
    checked?: boolean;
    /** The icon to display, either a DOM element or HTML string */
    icon?: HTMLElement | string;
    /** CSS classes to apply to the menu item */
    cssClasses?: string[];
    /** Tooltip for the menu item */
    tooltip?: string;
}
export interface MenuItemDef extends MenuItemLeafDef {
    /** If this item is a sub menu, contains a list of menu item definitions */
    subMenu?: (MenuItemDef | string)[];
}
export interface GetMainMenuItems {
    (params: GetMainMenuItemsParams): (string | MenuItemDef)[];
}
export interface GetRowNodeIdFunc<TData = any> {
    (data: TData): string;
}
export interface GetRowIdFunc<TData = any> {
    (params: GetRowIdParams<TData>): string;
}
export interface ChartRef {
    /** The id of the created chart. */
    chartId: string;
    /** The chart instance that is produced by AG Charts which can be used to interact with the chart directly. */
    chart: any;
    /** The chart DOM element, which the application is responsible for placing into the DOM. */
    chartElement: HTMLElement;
    /** The application is responsible for calling this when the chart is no longer needed. */
    destroyChart: () => void;
}
export interface ChartRefParams<TData = any> extends AgGridCommon<TData>, ChartRef {
}
export declare type ServerSideStoreType = 'full' | 'partial';
export interface ServerSideGroupLevelParams {
    /**
     * @deprecated
     * What store type to use.
     * If missing, then defaults to grid option `serverSideStoreType`.
     * Deprecated in favor of infiniteScroll.
     * If infiniteScroll==true, then Partial Store is used.
     * If infiniteScroll==false, then Full Store is used.
     *  */
    storeType?: ServerSideStoreType;
    /**
     * Whether to have infinite scroll active or not for the level.
     */
    infiniteScroll?: boolean;
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
/** @deprecated use ServerSideGroupLevelParams instead */
export interface ServerSideStoreParams extends ServerSideGroupLevelParams {
}
export interface LoadingCellRendererSelectorFunc<TData = any> {
    (params: ILoadingCellRendererParams<TData>): LoadingCellRendererSelectorResult | undefined;
}
export interface LoadingCellRendererSelectorResult {
    /** Equivalent of setting `loadingCellRenderer` */
    component?: any;
    /** @deprecated As of v27, use `component` for framework components too. */
    frameworkComponent?: any;
    /** Equivalent of setting `loadingCellRendererParams` */
    params?: any;
}
