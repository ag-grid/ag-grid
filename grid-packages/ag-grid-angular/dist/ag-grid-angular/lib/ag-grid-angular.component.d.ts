import { AfterViewInit, ComponentFactoryResolver, ElementRef, EventEmitter, QueryList, ViewContainerRef } from "@angular/core";
import { ColDef, ColumnApi, GridApi, GridOptions, Module, ColGroupDef, ExcelStyle, IDatasource, IServerSideDatasource, IViewportDatasource, IAggFunc, CsvExportParams, ExcelExportParams, StatusPanelDef, SideBarDef, AgChartThemeOverrides, AgChartTheme, ServerSideStoreType, RowGroupingDisplayType, GetContextMenuItems, GetMainMenuItems, GetRowNodeIdFunc, GetRowIdFunc, NavigateToNextHeaderParams, HeaderPosition, TabToNextHeaderParams, NavigateToNextCellParams, CellPosition, TabToNextCellParams, PostProcessPopupParams, GetDataPath, RowNode, IsRowMaster, IsRowSelectable, PaginationNumberFormatterParams, ProcessDataFromClipboardParams, GetServerSideGroupKey, IsServerSideGroup, SuppressKeyboardEventParams, GetChartToolbarItems, FillOperationParams, IsApplyServerSideTransaction, GetServerSideStoreParamsParams, ServerSideStoreParams, IsServerSideGroupOpenByDefaultParams, IsGroupOpenByDefaultParams, ColumnEverythingChangedEvent, NewColumnsLoadedEvent, ColumnPivotModeChangedEvent, ColumnRowGroupChangedEvent, ExpandCollapseAllEvent, ColumnPivotChangedEvent, GridColumnsChangedEvent, ColumnValueChangedEvent, ColumnMovedEvent, ColumnVisibleEvent, ColumnPinnedEvent, ColumnGroupOpenedEvent, ColumnResizedEvent, DisplayedColumnsChangedEvent, VirtualColumnsChangedEvent, AsyncTransactionsFlushed, RowGroupOpenedEvent, RowDataChangedEvent, RowDataUpdatedEvent, PinnedRowDataChangedEvent, RangeSelectionChangedEvent, ChartCreated, ChartRangeSelectionChanged, ChartOptionsChanged, ChartDestroyed, ChartRefParams, ToolPanelVisibleChangedEvent, ModelUpdatedEvent, PasteStartEvent, PasteEndEvent, CellClickedEvent, CellDoubleClickedEvent, CellMouseDownEvent, CellContextMenuEvent, CellValueChangedEvent, RowValueChangedEvent, CellFocusedEvent, RowSelectedEvent, SelectionChangedEvent, CellKeyDownEvent, CellKeyPressEvent, CellMouseOverEvent, CellMouseOutEvent, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent, SortChangedEvent, VirtualRowRemovedEvent, RowClickedEvent, RowDoubleClickedEvent, GridReadyEvent, GridSizeChangedEvent, ViewportChangedEvent, FirstDataRenderedEvent, DragStartedEvent, DragStoppedEvent, RowEditingStartedEvent, RowEditingStoppedEvent, CellEditingStartedEvent, CellEditRequestEvent, CellEditingStoppedEvent, BodyScrollEvent, BodyScrollEndEvent, PaginationChangedEvent, ComponentStateChangedEvent, RowDragEvent, ColumnRowGroupChangeRequestEvent, ColumnPivotChangeRequestEvent, ColumnValueChangeRequestEvent, ColumnAggFuncChangeRequestEvent, ProcessRowParams, ProcessCellForExportParams, ProcessHeaderForExportParams, ProcessGroupHeaderForExportParams, RowStyle, RowClassRules, RowClassParams, RowHeightParams, SendToClipboardParams, TreeDataDisplayType, FullWidthCellKeyDownEvent, FullWidthCellKeyPressEvent, LoadingCellRendererSelectorFunc, IsExternalFilterPresentParams, InitialGroupOrderComparatorParams, GetGroupRowAggParams, PostSortRowsParams, IsFullWidthRowParams, GetLocaleTextParams, IsRowFilterable } from "ag-grid-community";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import { AgGridColumn } from "./ag-grid-column.component";
export declare class AgGridAngular implements AfterViewInit {
    private viewContainerRef;
    private angularFrameworkOverrides;
    private frameworkComponentWrapper;
    private componentFactoryResolver;
    private _nativeElement;
    private _initialised;
    private _destroyed;
    private gridParams;
    private _fullyReady;
    api: GridApi;
    columnApi: ColumnApi;
    columns: QueryList<AgGridColumn>;
    constructor(elementDef: ElementRef, viewContainerRef: ViewContainerRef, angularFrameworkOverrides: AngularFrameworkOverrides, frameworkComponentWrapper: AngularFrameworkComponentWrapper, componentFactoryResolver: ComponentFactoryResolver);
    ngAfterViewInit(): void;
    ngOnChanges(changes: any): void;
    ngOnDestroy(): void;
    protected isEmitterUsed(eventType: string): boolean;
    private globalEventListener;
    gridOptions: GridOptions;
    modules: Module[];
    /** Specifies the status bar components to use in the status bar.     */
    statusBar: {
        statusPanels: StatusPanelDef[];
    } | undefined;
    /** Specifies the side bar components.     */
    sideBar: SideBarDef | string | string[] | boolean | null | undefined;
    /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu. Default: `false`     */
    suppressContextMenu: boolean | undefined;
    /** When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
     * This flag is useful to prevent the browser from showing its default context menu.
     * Default: `false`     */
    preventDefaultOnContextMenu: boolean | undefined;
    /** Allows context menu to show, even when `Ctrl` key is held down. Default: `false`     */
    allowContextMenuWithControlKey: boolean | undefined;
    /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header. Default: `false`     */
    suppressMenuHide: boolean | undefined;
    /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component. Default: `false`     */
    enableBrowserTooltips: boolean | undefined;
    /** The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
     *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
     * Default: `2000`     */
    tooltipShowDelay: number | undefined;
    /** The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
     *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
     * Default: `10000`     */
    tooltipHideDelay: number | undefined;
    /** Set to `true` to have tooltips follow the cursor once they are displayed. Default: `false`     */
    tooltipMouseTrack: boolean | undefined;
    /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).     */
    popupParent: HTMLElement | undefined;
    /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
    copyHeadersToClipboard: boolean | undefined;
    /** Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
    copyGroupHeadersToClipboard: boolean | undefined;
    /** Specify the delimiter to use when copying to clipboard.
     * Default: `\t`     */
    clipboardDelimiter: string | undefined;
    /** Set to `true` to only have the range selection, and not row selection, copied to clipboard. Default: `false`     */
    suppressCopyRowsToClipboard: boolean | undefined;
    /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard. Default: `false`     */
    suppressLastEmptyLineOnPaste: boolean | undefined;
    /** Set to `true` to turn off paste operations within the grid.     */
    suppressClipboardPaste: boolean | undefined;
    /** Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround.     */
    suppressClipboardApi: boolean | undefined;
    /** Array of Column / Column Group definitions.     */
    columnDefs: (ColDef | ColGroupDef)[] | null | undefined;
    /** A default column definition. Items defined in the actual column definitions get precedence.     */
    defaultColDef: ColDef | undefined;
    /** A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence.     */
    defaultColGroupDef: Partial<ColGroupDef> | undefined;
    /** An object map of custom column types which contain groups of properties that column definitions can inherit by referencing in their `type` property.     */
    columnTypes: {
        [key: string]: ColDef;
    } | undefined;
    /** Keeps the order of Columns maintained after new Column Definitions are updated. Default: `false`     */
    maintainColumnOrder: boolean | undefined;
    /** If `true`, then dots in field names (e.g. `address.firstline`) are not treated as deep references. Allows you to use dots in your field name if you prefer. Default: `false`     */
    suppressFieldDotNotation: boolean | undefined;
    /** @deprecated     */
    deltaColumnMode: boolean | undefined;
    /** @deprecated     */
    applyColumnDefOrder: boolean | undefined;
    /** @deprecated     */
    immutableColumns: boolean | undefined;
    /** @deprecated     */
    suppressSetColumnStateEvents: boolean | undefined;
    /** @deprecated     */
    suppressColumnStateEvents: boolean | undefined;
    /** @deprecated Set via `defaultColDef.width`
     */
    colWidth: number | undefined;
    /** @deprecated Set via `defaultColDef.minWidth`
     */
    minColWidth: number | undefined;
    /** @deprecated Set via `defaultColDef.maxWidth`
     */
    maxColWidth: number | undefined;
    /** The height in pixels for the row containing the column label header. If not specified, it uses the theme value of `header-height`.     */
    headerHeight: number | undefined;
    /** The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`.     */
    groupHeaderHeight: number | undefined;
    /** The height in pixels for the row containing the floating filters. If not specified, it uses the theme value of `header-height`.     */
    floatingFiltersHeight: number | undefined;
    /** The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`.     */
    pivotHeaderHeight: number | undefined;
    /** The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`.     */
    pivotGroupHeaderHeight: number | undefined;
    /** Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid. Default: `false`     */
    allowDragFromColumnsToolPanel: boolean | undefined;
    /** Set to `true` to suppress column moving, i.e. to make the columns fixed position. Default: `false`     */
    suppressMovableColumns: boolean | undefined;
    /** If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns. Default: `false`     */
    suppressColumnMoveAnimation: boolean | undefined;
    /** If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden. Default: `false`     */
    suppressDragLeaveHidesColumns: boolean | undefined;
    /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing).     */
    colResizeDefault: string | undefined;
    /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size. Default: `false`     */
    suppressAutoSize: boolean | undefined;
    /** Number of pixels to add to a column width after the [auto-sizing](/column-sizing/#auto-size-columns) calculation.
     * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
     * Default: `4`     */
    autoSizePadding: number | undefined;
    /** Set this to `true` to skip the `headerName` when `autoSize` is called by default. Default: `false`     */
    skipHeaderOnAutoSize: boolean | undefined;
    /** A map of component names to components.     */
    components: {
        [p: string]: any;
    } | undefined;
    /** @deprecated As of v27, use `components` for framework components too.
     */
    frameworkComponents: {
        [p: string]: {
            new (): any;
        };
    } | any | undefined;
    /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.     */
    editType: string | undefined;
    /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click. Default: `false`     */
    singleClickEdit: boolean | undefined;
    /** Set to `true` so that neither single nor double click starts editing. Default: `false`     */
    suppressClickEdit: boolean | undefined;
    /** Set to `true` so stop the grid updating data after and edit. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid.     */
    readOnlyEdit: boolean | undefined;
    /** Set this to `true` to stop cell editing when grid loses focus.
     * The default is that the grid stays editing until focus goes onto another cell. For inline (non-popup) editors only.
     * Default: `false`     */
    stopEditingWhenCellsLoseFocus: boolean | undefined;
    /** Set to `true` along with `enterMovesDownAfterEdit` to have Excel-style behaviour for the `Enter` key.
     * i.e. pressing the `Enter` key will move down to the cell beneath.
     * Default: `false`     */
    enterMovesDown: boolean | undefined;
    /** Set to `true` along with `enterMovesDown` to have Excel-style behaviour for the 'Enter' key.
     * i.e. pressing the Enter key will move down to the cell beneath.
     * Default: `false`     */
    enterMovesDownAfterEdit: boolean | undefined;
    /** Set to `true` to enable Undo / Redo while editing.     */
    undoRedoCellEditing: boolean | undefined;
    /** Set the size of the undo / redo stack. Default: `10`     */
    undoRedoCellEditingLimit: number | undefined;
    /** @deprecated Use stopEditingWhenCellsLoseFocus instead
     */
    stopEditingWhenGridLosesFocus: boolean | undefined;
    /** A default configuration object used to export to CSV.     */
    defaultCsvExportParams: CsvExportParams | undefined;
    /** Prevents the user from exporting the grid to CSV. Default: `false`     */
    suppressCsvExport: boolean | undefined;
    /** A default configuration object used to export to Excel.     */
    defaultExcelExportParams: ExcelExportParams | undefined;
    /** Prevents the user from exporting the grid to Excel. Default: `false`     */
    suppressExcelExport: boolean | undefined;
    /** A list (array) of Excel styles to be used when exporting to Excel with styles.     */
    excelStyles: ExcelStyle[] | undefined;
    /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams
     */
    defaultExportParams: CsvExportParams | ExcelExportParams | undefined;
    /** Rows are filtered using this text as a quick filter.     */
    quickFilterText: string | undefined;
    /** Set to `true` to turn on the quick filter cache, used to improve performance when using the quick filter. Default: `false`     */
    cacheQuickFilter: boolean | undefined;
    /** Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results. Default: `false`     */
    excludeChildrenWhenTreeDataFiltering: boolean | undefined;
    /** Set to `true` to Enable Charts. Default: `false`     */
    enableCharts: boolean | undefined;
    /** The list of chart themes to be used.     */
    chartThemes: string[] | undefined;
    /** A map containing custom chart themes.     */
    customChartThemes: {
        [name: string]: AgChartTheme;
    } | undefined;
    /** Chart theme overrides applied to all themes.     */
    chartThemeOverrides: AgChartThemeOverrides | undefined;
    /** Provide your own loading cell renderer to use when data is loading via a DataSource.
     * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.     */
    loadingCellRenderer: any;
    /** @deprecated As of v27, use `loadingCellRenderer` for framework components too.
     */
    loadingCellRendererFramework: any;
    /** Params to be passed to the `loadingCellRenderer` component.     */
    loadingCellRendererParams: any;
    /** Callback to select which loading cell renderer to be used when data is loading via a DataSource.     */
    loadingCellRendererSelector: LoadingCellRendererSelectorFunc | undefined;
    /** A map of key->value pairs for localising text within the grid.     */
    localeText: {
        [key: string]: string;
    } | undefined;
    /** Set to `true` to enable Master Detail. Default: `false`     */
    masterDetail: boolean | undefined;
    /** Set to `true` to keep detail rows for when they are displayed again. Default: `false`     */
    keepDetailRows: boolean | undefined;
    /** Sets the number of details rows to keep. Default: `10`     */
    keepDetailRowsCount: number | undefined;
    /** Provide a custom `detailCellRenderer` to use when a master row is expanded.
     * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.     */
    detailCellRenderer: any;
    /** @deprecated As of v27, use `detailCellRenderer` for framework components too.
     */
    detailCellRendererFramework: any;
    /** Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params.     */
    detailCellRendererParams: any;
    /** Set fixed height in pixels for each detail row.     */
    detailRowHeight: number | undefined;
    /** Set to `true` to have the detail grid dynamically change it's height to fit it's rows.     */
    detailRowAutoHeight: boolean | undefined;
    /** Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks by your application.     */
    context: any;
    /** A list of grids to treat as Aligned Grids. If grids are aligned then the columns and horizontal scrolling will be kept in sync.     */
    alignedGrids: GridOptions[] | undefined;
    /** Change this value to set the tabIndex order of the Grid within your application. Default: `0`     */
    tabIndex: number | undefined;
    /** The number of rows rendered outside the viewable area the grid renders.
     * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
     * Default: `10`     */
    rowBuffer: number | undefined;
    /** Set to `true` to turn on the value cache. Default: `false`     */
    valueCache: boolean | undefined;
    /** Set to `true` to configure the value cache to not expire after data updates. Default: `false`     */
    valueCacheNeverExpires: boolean | undefined;
    /** Set to `true` to allow cell expressions. Default: `false`     */
    enableCellExpressions: boolean | undefined;
    /** If `true`, row nodes do not have their parents set.
     * The grid doesn't use the parent reference, but it is included to help the client code navigate the node tree if it wants by providing bi-direction navigation up and down the tree.
     * If this is a problem (e.g. if you need to convert the tree to JSON, which does not allow cyclic dependencies) then set this to `true`.
     * Default: `false`     */
    suppressParentsInRowNodes: boolean | undefined;
    /** Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch). Default: `false`     */
    suppressTouch: boolean | undefined;
    /** Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser. Default: `false`     */
    suppressFocusAfterRefresh: boolean | undefined;
    /** Disables the asynchronous nature of the events introduced in v10, and makes them synchronous. This property only exists for the purpose of supporting legacy code which has a dependency on synchronous events from earlier versions (v9 or earlier) of AG Grid.     **It is strongly recommended that you do not change this property unless you have legacy issues.** Default: `false`     */
    suppressAsyncEvents: boolean | undefined;
    /** The grid will check for `ResizeObserver` and use it if it exists in the browser, otherwise it will use the grid's alternative implementation. Some users reported issues with Chrome's `ResizeObserver`. Use this property to always use the grid's alternative implementation should such problems exist. Default: `false`     */
    suppressBrowserResizeObserver: boolean | undefined;
    /** Disables showing a warning message in the console if using a `gridOptions` or `colDef` property that doesn't exist. Default: `false`     */
    suppressPropertyNamesCheck: boolean | undefined;
    /** Disables change detection. Default: `false`     */
    suppressChangeDetection: boolean | undefined;
    /** Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems. Default: `false`     */
    debug: boolean | undefined;
    /** Provide a template for 'loading' overlay.     */
    overlayLoadingTemplate: string | undefined;
    /** Provide a custom loading overlay component.
     * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-loading-overlay-component) for framework specific implementation details.     */
    loadingOverlayComponent: any;
    /** @deprecated As of v27, use `loadingOverlayComponent` for framework components too.
     */
    loadingOverlayComponentFramework: any;
    /** Customise the parameters provided to the loading overlay component.     */
    loadingOverlayComponentParams: any;
    /** Disables the 'loading' overlay. Default: `false`     */
    suppressLoadingOverlay: boolean | undefined;
    /** Provide a template for 'no rows' overlay.     */
    overlayNoRowsTemplate: string | undefined;
    /** Provide a custom no rows overlay component.
     * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-no-rows-overlay-component) for framework specific implementation details.     */
    noRowsOverlayComponent: any;
    /** @deprecated As of v27, use `noRowsOverlayComponent` for framework components too.
     */
    noRowsOverlayComponentFramework: any;
    /** Customise the parameters provided to the no rows overlay component.     */
    noRowsOverlayComponentParams: any;
    /** Disables the 'no rows' overlay. Default: `false`     */
    suppressNoRowsOverlay: boolean | undefined;
    /** Set whether pagination is enabled. Default: `false`     */
    pagination: boolean | undefined;
    /** How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored. Default: `100`     */
    paginationPageSize: number | undefined;
    /** Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used. Default: `false`     */
    paginationAutoPageSize: boolean | undefined;
    /** Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail. Default: `false`     */
    paginateChildRows: boolean | undefined;
    /** If `true`, the default grid controls for navigation are hidden.
     * This is useful if `pagination=true` and you want to provide your own pagination controls.
     * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.
     * Default: `false`     */
    suppressPaginationPanel: boolean | undefined;
    /** Set to `true` to enable pivot mode. Default: `false`     */
    pivotMode: boolean | undefined;
    /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off. Default: `never`     */
    pivotPanelShow: string | undefined;
    /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified.     */
    pivotColumnGroupTotals: string | undefined;
    /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified.     */
    pivotRowTotals: string | undefined;
    /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column. Default: `false`     */
    pivotSuppressAutoColumn: boolean | undefined;
    /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups. Default: `false`     */
    suppressExpandablePivotGroups: boolean | undefined;
    /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection. Default: `false`     */
    functionsReadOnly: boolean | undefined;
    /** A map of 'function name' to 'function' for custom aggregation functions.     */
    aggFuncs: {
        [key: string]: IAggFunc;
    } | undefined;
    /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`. Default: `false`     */
    suppressAggFuncInHeader: boolean | undefined;
    /** When `true`, the aggregations won't be computed for the root node of the grid. Default: `false`     */
    suppressAggAtRootLevel: boolean | undefined;
    /** When using change detection, only the updated column will be re-aggregated. Default: `false`     */
    aggregateOnlyChangedColumns: boolean | undefined;
    /** Set to `true` so that aggregations are not impacted by filtering. Default: `false`     */
    suppressAggFilteredOnly: boolean | undefined;
    /** Set to `true` to enable Row Animation. Default: `false`     */
    animateRows: boolean | undefined;
    /** Set to `true` to have cells flash after data changes. Default: `false`     */
    enableCellChangeFlash: boolean | undefined;
    /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long a cell should remain in its "flashed" state.
     * Default: `500`     */
    cellFlashDelay: number | undefined;
    /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `cellFlashDelay` has completed.
     * Default: `1000`     */
    cellFadeDelay: number | undefined;
    /** Switch between layout options: `normal`, `autoHeight`, `print`.
     * Default: `normal`     */
    domLayout: 'normal' | 'autoHeight' | 'print' | undefined;
    /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen. Default: `false`     */
    ensureDomOrder: boolean | undefined;
    /** Set to `true` to operate the grid in RTL (Right to Left) mode. Default: `false`     */
    enableRtl: boolean | undefined;
    /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false`     */
    suppressColumnVirtualisation: boolean | undefined;
    /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
     * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen) or if your grid height is able to display more than 500 rows at once.**
     * Default: `false`     */
    suppressMaxRenderedRowRestriction: boolean | undefined;
    /** Set to `true` so that the grid doesn't virtualise the rows. For example, if you have 100 rows, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false`     */
    suppressRowVirtualisation: boolean | undefined;
    /** Set to `true` to enable Managed Row Dragging. Default: `false`     */
    rowDragManaged: boolean | undefined;
    /** Set to `true` to suppress row dragging. Default: `false`     */
    suppressRowDrag: boolean | undefined;
    /** Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up. Default: `false`     */
    suppressMoveWhenRowDragging: boolean | undefined;
    /** Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle. Default: `false`     */
    rowDragEntireRow: boolean | undefined;
    /** Set to `true` to enable dragging multiple rows at the same time. Default: `false`     */
    rowDragMultiRow: boolean | undefined;
    /** Provide your own cell renderer component to use for full width rows.
     * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.     */
    fullWidthCellRenderer: any;
    /** @deprecated As of v27, use `fullWidthCellRenderer` for framework components too.
     */
    fullWidthCellRendererFramework: any;
    /** Customise the parameters provided to the `fullWidthCellRenderer` component.     */
    fullWidthCellRendererParams: any;
    /** Set to `true` to have the detail grid embedded in the master grid's container and so link their horizontal scrolling.     */
    embedFullWidthRows: boolean | undefined;
    /** @deprecated     */
    deprecatedEmbedFullWidthRows: boolean | undefined;
    /** Specifies how the results of row grouping should be displayed.
     *
     *   The options are:
     *
     * - `'singleColumn'`: single group column automatically added by the grid.
     * - `'multipleColumns'`: a group column per row group is added automatically.
     * - `'groupRows'`: group rows are automatically added instead of group columns.
     * - `'custom'`: informs the grid that group columns will be provided.     */
    groupDisplayType: RowGroupingDisplayType | undefined;
    /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything. Default: `0`     */
    groupDefaultExpanded: number | undefined;
    /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included.     */
    autoGroupColumnDef: ColDef | undefined;
    /** When `true`, preserves the current group order when sorting on non-group columns. Default: `false`     */
    groupMaintainOrder: boolean | undefined;
    /** When `true`, if you select a group, the children of the group will also be selected. Default: `false`     */
    groupSelectsChildren: boolean | undefined;
    /** Set to determine whether filters should be applied on aggregated group values. Default: `false`     */
    groupAggFiltering: boolean | IsRowFilterable | undefined;
    /** If grouping, this controls whether to show a group footer when the group is expanded.
     * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
     * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
     * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.
     * Default: `false`     */
    groupIncludeFooter: boolean | undefined;
    /** Set to `true` to show a 'grand total' group footer across all groups. Default: `false`     */
    groupIncludeTotalFooter: boolean | undefined;
    /** If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand. Default: `false`     */
    groupSuppressBlankHeader: boolean | undefined;
    /** If using `groupSelectsChildren`, then only the children that pass the current filter will get selected. Default: `false`     */
    groupSelectsFiltered: boolean | undefined;
    /** Shows the open group in the group column for non-group rows. Default: `false`     */
    showOpenedGroup: boolean | undefined;
    /** Set to `true` to collapse groups that only have one child.     */
    groupRemoveSingleChildren: boolean | undefined;
    /** Set to `true` to collapse lowest level groups that only have one child. Default: `false`     */
    groupRemoveLowestSingleChildren: boolean | undefined;
    /** Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience. Default: `false`     */
    groupHideOpenParents: boolean | undefined;
    /** When to show the 'row group panel' (where you drag rows to group) at the top. Default: `never`     */
    rowGroupPanelShow: string | undefined;
    /** Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
     * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.     */
    groupRowRenderer: any;
    /** @deprecated As of v27, use `groupRowRenderer` for framework components too.
     */
    groupRowRendererFramework: any;
    /** Customise the parameters provided to the `groupRowRenderer` component.     */
    groupRowRendererParams: any;
    /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping. Default: `false`     */
    suppressMakeColumnVisibleAfterUnGroup: boolean | undefined;
    /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.     */
    treeData: boolean | undefined;
    /** @deprecated - this is now groupRowRendererParams.innerRenderer
     */
    groupRowInnerRenderer: any;
    /** @deprecated - this is now groupRowRendererParams.innerRenderer
     */
    groupRowInnerRendererFramework: any;
    /** @deprecated - Use groupDisplayType = 'multipleColumns' instead
     */
    groupMultiAutoColumn: boolean | undefined;
    /** @deprecated - Use groupDisplayType = 'groupRows' instead
     */
    groupUseEntireRow: boolean | undefined;
    /** @deprecated - Use groupDisplayType = 'custom' instead
     */
    groupSuppressAutoColumn: boolean | undefined;
    /** @deprecated - no longer needed, transaction updates keep group state
     */
    rememberGroupStateWhenNewData: boolean | undefined;
    /** Data to be displayed as pinned top rows in the grid.     */
    pinnedTopRowData: any[] | undefined;
    /** Data to be displayed as pinned bottom rows in the grid.     */
    pinnedBottomRowData: any[] | undefined;
    /** Sets the row model type. Default: `clientSide`     */
    rowModelType: string | undefined;
    /** Set the data to be displayed as rows in the grid.     */
    rowData: any[] | null | undefined;
    /** @deprecated Immutable Data is on by default when grid callback getRowId() is implemented
Enables Immutable Data mode, for compatibility with immutable stores. Default: `false`
     */
    immutableData: boolean | undefined;
    /** How many milliseconds to wait before executing a batch of async transactions.     */
    asyncTransactionWaitMillis: number | undefined;
    /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates. Default: `false`     */
    suppressModelUpdateAfterUpdateTransaction: boolean | undefined;
    /** @deprecated     */
    deltaRowDataMode: boolean | undefined;
    /** @deprecated use asyncTransactionWaitMillis instead
     */
    batchUpdateWaitMillis: number | undefined;
    /** Provide the datasource for infinite scrolling.     */
    datasource: IDatasource | undefined;
    /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
     * Default: `1`     */
    cacheOverflowSize: number | undefined;
    /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
     * Default: `1`     */
    infiniteInitialRowCount: number | undefined;
    /** Whether to use Full Store or Partial Store for storing rows. Default: `full`     */
    serverSideStoreType: ServerSideStoreType | undefined;
    /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
     * Default: `100`     */
    cacheBlockSize: number | undefined;
    /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.     */
    maxBlocksInCache: number | undefined;
    /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.
     * Set to `-1` for no maximum restriction on requests.
     * Default: `2`     */
    maxConcurrentDatasourceRequests: number | undefined;
    /** How many milliseconds to wait before loading a block. Useful when scrolling over many rows, spanning many Partial Store blocks, as it prevents blocks loading until scrolling has settled.     */
    blockLoadDebounceMillis: number | undefined;
    /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping. Default: `false`     */
    purgeClosedRowNodes: boolean | undefined;
    /** Provide the `serverSideDatasource` for server side row model.     */
    serverSideDatasource: IServerSideDatasource | undefined;
    /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping. Default: `false`     */
    serverSideSortingAlwaysResets: boolean | undefined;
    /** When enabled, always refreshes stores after filter has changed. Used by Full Store only, to allow Server-Side Filtering. Default: `false`     */
    serverSideFilteringAlwaysResets: boolean | undefined;
    /** @deprecated     */
    suppressEnterpriseResetOnNewColumns: boolean | undefined;
    /** To use the viewport row model you need to provide the grid with a `viewportDatasource`.     */
    viewportDatasource: IViewportDatasource | undefined;
    /** When using viewport row model, sets the page size for the viewport.     */
    viewportRowModelPageSize: number | undefined;
    /** When using viewport row model, sets the buffer size for the viewport.     */
    viewportRowModelBufferSize: number | undefined;
    /** Set to `true` to always show the horizontal scrollbar. Default: `false`     */
    alwaysShowHorizontalScroll: boolean | undefined;
    /** Set to `true` to always show the vertical scrollbar. Default: `false`     */
    alwaysShowVerticalScroll: boolean | undefined;
    /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on slow machines. Default: `false`     */
    debounceVerticalScrollbar: boolean | undefined;
    /** Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.) Default: `false`     */
    suppressHorizontalScroll: boolean | undefined;
    /** When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data. Default: `false`     */
    suppressScrollOnNewData: boolean | undefined;
    /** When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present. Default: `false`     */
    suppressScrollWhenPopupsAreOpen: boolean | undefined;
    /** When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if the grid is working fast enough that you don't need animation frames and you don't want the grid to flicker. Default: `false`     */
    suppressAnimationFrame: boolean | undefined;
    /** If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function. Default: `false`     */
    suppressMiddleClickScrolls: boolean | undefined;
    /** If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page. Default: `false`     */
    suppressPreventDefaultOnMouseWheel: boolean | undefined;
    /** Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations.     */
    scrollbarWidth: number | undefined;
    /** Type of Row Selection: `single`, `multiple`.     */
    rowSelection: string | undefined;
    /** Set to `true` to allow multiple rows to be selected using single click. Default: `false`     */
    rowMultiSelectWithClick: boolean | undefined;
    /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`. Default: `false`     */
    suppressRowDeselection: boolean | undefined;
    /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection. Default: `false`     */
    suppressRowClickSelection: boolean | undefined;
    /** @deprecated This property has been deprecated. Use `suppressCellFocus` instead.
     */
    suppressCellSelection: boolean | undefined;
    /** If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels. Default: `false`     */
    suppressCellFocus: boolean | undefined;
    /** If `true`, only a single range can be selected. Default: `false`     */
    suppressMultiRangeSelection: boolean | undefined;
    /** Set to `true` to be able to select the text within cells.
     *
     *     **Note:** When this is set to `true`, the clipboard service is disabled.
     * Default: `false`     */
    enableCellTextSelection: boolean | undefined;
    /** Set to `true` to enable Range Selection. Default: `false`     */
    enableRangeSelection: boolean | undefined;
    /** Set to `true` to enable the Range Handle. Default: `false`     */
    enableRangeHandle: boolean | undefined;
    /** Set to `true` to enable the Fill Handle. Default: `false`     */
    enableFillHandle: boolean | undefined;
    /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical. Default: `xy`     */
    fillHandleDirection: string | undefined;
    /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle. Default: `false`     */
    suppressClearOnFillReduction: boolean | undefined;
    /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`. Default: `[null, 'asc', 'desc']`     */
    sortingOrder: ('asc' | 'desc' | null)[] | undefined;
    /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower. Default: `false`     */
    accentedSort: boolean | undefined;
    /** Set to `true` to show the 'no sort' icon. Default: `false`     */
    unSortIcon: boolean | undefined;
    /** Set to `true` to suppress multi-sort when the user shift-clicks a column header. Default: `false`     */
    suppressMultiSort: boolean | undefined;
    /** Set to `true` to always multi-sort when the user clicks a column header, regardless of key presses. Default: `false`     */
    alwaysMultiSort: boolean | undefined;
    /** Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key.     */
    multiSortKey: string | undefined;
    /** Set to `true` to suppress sorting of un-sorted data to match original row data. Default: `false`     */
    suppressMaintainUnsortedOrder: boolean | undefined;
    /** Icons to use inside the grid instead of the grid's default icons.     */
    icons: {
        [key: string]: Function | string;
    } | undefined;
    /** Default row height in pixels. Default: `25`     */
    rowHeight: number | undefined;
    /** The style properties to apply to all rows. Set to an object of key (style names) and values (style values)     */
    rowStyle: RowStyle | undefined;
    /** CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names).     */
    rowClass: string | string[] | undefined;
    /** Rules which can be applied to include certain CSS classes.     */
    rowClassRules: RowClassRules | undefined;
    /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class. Default: `false`     */
    suppressRowHoverHighlight: boolean | undefined;
    /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning. Default: `false`     */
    suppressRowTransform: boolean | undefined;
    /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class. Default: `false`     */
    columnHoverHighlight: boolean | undefined;
    deltaSort: boolean | undefined;
    treeDataDisplayType: TreeDataDisplayType | undefined;
    angularCompileRows: boolean | undefined;
    angularCompileFilters: boolean | undefined;
    functionsPassive: boolean | undefined;
    enableGroupEdit: boolean | undefined;
    /** For customising the context menu.     */
    getContextMenuItems: GetContextMenuItems | undefined;
    /** For customising the main 'column header' menu.     */
    getMainMenuItems: GetMainMenuItems | undefined;
    /** Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup.     */
    postProcessPopup: ((params: PostProcessPopupParams) => void) | undefined;
    /** Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel.     */
    processCellForClipboard: ((params: ProcessCellForExportParams) => any) | undefined;
    /** Allows you to process header values for the clipboard.     */
    processHeaderForClipboard: ((params: ProcessHeaderForExportParams) => any) | undefined;
    /** Allows you to process group header values for the clipboard.     */
    processGroupHeaderForClipboard: ((params: ProcessGroupHeaderForExportParams) => any) | undefined;
    /** Allows you to process cells from the clipboard. Handy if for example you have number fields, and want to block non-numbers from getting into the grid.     */
    processCellFromClipboard: ((params: ProcessCellForExportParams) => any) | undefined;
    /** Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself.     */
    sendToClipboard: ((params: SendToClipboardParams) => void) | undefined;
    /** Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data.     */
    processDataFromClipboard: ((params: ProcessDataFromClipboardParams) => string[][] | null) | undefined;
    /** Grid calls this method to know if an external filter is present.     */
    isExternalFilterPresent: ((params: IsExternalFilterPresentParams) => boolean) | undefined;
    /** Should return `true` if external filter passes, otherwise `false`.     */
    doesExternalFilterPass: ((node: RowNode) => boolean) | undefined;
    /** Callback to be used to customise the chart toolbar items.     */
    getChartToolbarItems: GetChartToolbarItems | undefined;
    /** Callback to enable displaying the chart in an alternative chart container.     */
    createChartContainer: ((params: ChartRefParams) => void) | undefined;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.     */
    navigateToNextHeader: ((params: NavigateToNextHeaderParams) => (HeaderPosition | null)) | undefined;
    /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.     */
    tabToNextHeader: ((params: TabToNextHeaderParams) => (HeaderPosition | null)) | undefined;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.     */
    navigateToNextCell: ((params: NavigateToNextCellParams) => (CellPosition | null)) | undefined;
    /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused. Return the next Cell position to navigate to or null to stay on current cell.     */
    tabToNextCell: ((params: TabToNextCellParams) => (CellPosition | null)) | undefined;
    /** @deprecated - Set via `colDef.suppressKeyboardEvent`. If you need this to be set for every column set via the `defaultColDef.suppressKeyboardEvent` property.
     */
    suppressKeyboardEvent: ((params: SuppressKeyboardEventParams) => boolean) | undefined;
    /** @deprecated - Use `getLocaleText` instead.
     */
    localeTextFunc: ((key: string, defaultValue: string, variableValues?: string[]) => string) | undefined;
    /** A callback for localising text within the grid.     */
    getLocaleText: ((params: GetLocaleTextParams) => string) | undefined;
    /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)     */
    getDocument: (() => Document) | undefined;
    /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.     */
    paginationNumberFormatter: ((params: PaginationNumberFormatterParams) => string) | undefined;
    /** @deprecated - Use `getGroupRowAgg` instead.
     */
    groupRowAggNodes: ((nodes: RowNode[]) => any) | undefined;
    /** Callback to use when you need access to more then the current column for aggregation.     */
    getGroupRowAgg: ((params: GetGroupRowAggParams) => any) | undefined;
    /** (Client-side Row Model only) Allows groups to be open by default.     */
    isGroupOpenByDefault: ((params: IsGroupOpenByDefaultParams) => boolean) | undefined;
    /** Allows default sorting of groups.     */
    initialGroupOrderComparator: ((params: InitialGroupOrderComparatorParams) => number) | undefined;
    /** @deprecated - Use `initialGroupOrderComparator` instead
     */
    defaultGroupOrderComparator: ((nodeA: RowNode, nodeB: RowNode) => number) | undefined;
    /** Callback to be used with pivoting, to allow changing the second column definition.     */
    processSecondaryColDef: ((colDef: ColDef) => void) | undefined;
    /** Callback to be used with pivoting, to allow changing the second column group definition.     */
    processSecondaryColGroupDef: ((colGroupDef: ColGroupDef) => void) | undefined;
    /** Callback to be used when working with Tree Data when `treeData = true`.     */
    getDataPath: GetDataPath | undefined;
    /** @deprecated - Use initialGroupOrderComparator instead
     */
    defaultGroupSortComparator: ((nodeA: RowNode, nodeB: RowNode) => number) | undefined;
    /** Allows setting the child count for a group row.     */
    getChildCount: ((dataItem: any) => number) | undefined;
    /** Allows providing different params for different levels of grouping.     */
    getServerSideStoreParams: ((params: GetServerSideStoreParamsParams) => ServerSideStoreParams) | undefined;
    /** Allows groups to be open by default.     */
    isServerSideGroupOpenByDefault: ((params: IsServerSideGroupOpenByDefaultParams) => boolean) | undefined;
    /** Allows cancelling transactions.     */
    isApplyServerSideTransaction: IsApplyServerSideTransaction | undefined;
    /** SSRM Tree Data: Allows specifying which rows are expandable.     */
    isServerSideGroup: IsServerSideGroup | undefined;
    /** SSRM Tree Data: Allows specifying group keys.     */
    getServerSideGroupKey: GetServerSideGroupKey | undefined;
    /** Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-id='abc'` where `abc` is what you return as the business key.
     * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.     */
    getBusinessKeyForNode: ((node: RowNode) => string) | undefined;
    /** @deprecated Use `getRowId` instead - however be aware, `getRowId()` will also set grid option `immutableData=true`
Allows you to set the ID for a particular row node based on the data.
     */
    getRowNodeId: GetRowNodeIdFunc | undefined;
    /** Allows you to set the ID for a particular row based on the data and enables immutableData.     */
    getRowId: GetRowIdFunc | undefined;
    /** Allows you to process rows after they are created, so you can do final adding of custom attributes etc.     */
    processRowPostCreate: ((params: ProcessRowParams) => void) | undefined;
    /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable.     */
    isRowSelectable: IsRowSelectable | undefined;
    /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row.     */
    isRowMaster: IsRowMaster | undefined;
    /** Callback to fill values instead of simply copying values or increasing number values using linear progression.     */
    fillOperation: ((params: FillOperationParams) => any) | undefined;
    /** @deprecated Use `postSortRows` instead
     */
    postSort: ((nodes: RowNode[]) => void) | undefined;
    /** Callback to perform additional sorting after the grid has sorted the rows.     */
    postSortRows: ((params: PostSortRowsParams) => void) | undefined;
    /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.     */
    getRowStyle: ((params: RowClassParams) => RowStyle | undefined) | undefined;
    /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.     */
    getRowClass: ((params: RowClassParams) => string | string[] | undefined) | undefined;
    /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.     */
    getRowHeight: ((params: RowHeightParams) => number | undefined | null) | undefined;
    /** @deprecated Use `isFullWidthRow` instead.
     */
    isFullWidthCell: ((rowNode: RowNode) => boolean) | undefined;
    /** Tells the grid if this row should be rendered as full width.     */
    isFullWidthRow: ((params: IsFullWidthRowParams) => boolean) | undefined;
    /** The tool panel was hidden or shown. Use `api.isToolPanelShowing()` to get status.     */
    toolPanelVisibleChanged: EventEmitter<ToolPanelVisibleChangedEvent>;
    /** Paste operation has started.     */
    pasteStart: EventEmitter<PasteStartEvent>;
    /** Paste operation has ended.     */
    pasteEnd: EventEmitter<PasteEndEvent>;
    /** A column, or group of columns, was hidden / shown.     */
    columnVisible: EventEmitter<ColumnVisibleEvent>;
    /** A column, or group of columns, was pinned / unpinned.     */
    columnPinned: EventEmitter<ColumnPinnedEvent>;
    /** A column was resized.     */
    columnResized: EventEmitter<ColumnResizedEvent>;
    /** A column was moved. To find out when the column move is finished you can use the `dragStopped` event below.     */
    columnMoved: EventEmitter<ColumnMovedEvent>;
    /** A value column was added or removed.     */
    columnValueChanged: EventEmitter<ColumnValueChangedEvent>;
    /** The pivot mode flag was changed.     */
    columnPivotModeChanged: EventEmitter<ColumnPivotModeChangedEvent>;
    /** A pivot column was added, removed or order changed.     */
    columnPivotChanged: EventEmitter<ColumnPivotChangedEvent>;
    /** A column group was opened / closed.     */
    columnGroupOpened: EventEmitter<ColumnGroupOpenedEvent>;
    /** User set new columns.     */
    newColumnsLoaded: EventEmitter<NewColumnsLoadedEvent>;
    /** The list of grid columns changed.     */
    gridColumnsChanged: EventEmitter<GridColumnsChangedEvent>;
    /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc.     */
    displayedColumnsChanged: EventEmitter<DisplayedColumnsChangedEvent>;
    /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default).     */
    virtualColumnsChanged: EventEmitter<VirtualColumnsChangedEvent>;
    /** Shotgun - gets called when either a) new columns are set or b) `columnApi.setState()` is used, so everything has changed.     */
    columnEverythingChanged: EventEmitter<ColumnEverythingChangedEvent>;
    /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
     * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.     */
    componentStateChanged: EventEmitter<ComponentStateChangedEvent>;
    /** Value has changed after editing. This event will not fire if editing was cancelled (eg ESC was pressed).     */
    cellValueChanged: EventEmitter<CellValueChangedEvent>;
    /** Value has changed after editing. Only fires when doing Read Only Edits, ie `readOnlyEdit=true`.     */
    cellEditRequest: EventEmitter<CellEditRequestEvent>;
    /** A cell's value within a row has changed. This event corresponds to Full Row Editing only.     */
    rowValueChanged: EventEmitter<RowValueChangedEvent>;
    /** Editing a cell has started.     */
    cellEditingStarted: EventEmitter<CellEditingStartedEvent>;
    /** Editing a cell has stopped.     */
    cellEditingStopped: EventEmitter<CellEditingStoppedEvent>;
    /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing.     */
    rowEditingStarted: EventEmitter<RowEditingStartedEvent>;
    /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing.     */
    rowEditingStopped: EventEmitter<RowEditingStoppedEvent>;
    /** Filter has been opened.     */
    filterOpened: EventEmitter<FilterOpenedEvent>;
    /** Filter has been modified and applied.     */
    filterChanged: EventEmitter<FilterChangedEvent>;
    /** Filter was modified but not applied. Used when filters have 'Apply' buttons.     */
    filterModified: EventEmitter<FilterModifiedEvent>;
    /** A chart has been created.     */
    chartCreated: EventEmitter<ChartCreated>;
    /** The data range for the chart has been changed.     */
    chartRangeSelectionChanged: EventEmitter<ChartRangeSelectionChanged>;
    /** Formatting changes have been made by users through the Format Panel.     */
    chartOptionsChanged: EventEmitter<ChartOptionsChanged>;
    /** A chart has been destroyed.     */
    chartDestroyed: EventEmitter<ChartDestroyed>;
    /** DOM event `keyDown` happened on a cell.     */
    cellKeyDown: EventEmitter<CellKeyDownEvent | FullWidthCellKeyDownEvent>;
    /** DOM event `keyPress` happened on a cell.     */
    cellKeyPress: EventEmitter<CellKeyPressEvent | FullWidthCellKeyPressEvent>;
    /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet     */
    gridReady: EventEmitter<GridReadyEvent>;
    /** Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents     */
    firstDataRendered: EventEmitter<FirstDataRenderedEvent>;
    /** The size of the grid `div` has changed. In other words, the grid was resized.     */
    gridSizeChanged: EventEmitter<GridSizeChangedEvent>;
    /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events.     */
    modelUpdated: EventEmitter<ModelUpdatedEvent>;
    /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row.     */
    virtualRowRemoved: EventEmitter<VirtualRowRemovedEvent>;
    /** Which rows are rendered in the DOM has changed.     */
    viewportChanged: EventEmitter<ViewportChangedEvent>;
    /** The body was scrolled horizontally or vertically.     */
    bodyScroll: EventEmitter<BodyScrollEvent>;
    /** Main body of the grid has stopped scrolling, either horizontally or vertically.     */
    bodyScrollEnd: EventEmitter<BodyScrollEndEvent>;
    /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.     */
    dragStarted: EventEmitter<DragStartedEvent>;
    /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.     */
    dragStopped: EventEmitter<DragStoppedEvent>;
    /** Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
     *
     *   - The page size changes.
     *   - The current shown page is changed.
     *   - New data is loaded onto the grid.     */
    paginationChanged: EventEmitter<PaginationChangedEvent>;
    /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid.     */
    rowDragEnter: EventEmitter<RowDragEvent>;
    /** The mouse has moved while dragging.     */
    rowDragMove: EventEmitter<RowDragEvent>;
    /** The mouse has left the grid while dragging.     */
    rowDragLeave: EventEmitter<RowDragEvent>;
    /** The drag has finished over the grid.     */
    rowDragEnd: EventEmitter<RowDragEvent>;
    /** A row group column was added or removed.     */
    columnRowGroupChanged: EventEmitter<ColumnRowGroupChangedEvent>;
    /** A row group was opened or closed.     */
    rowGroupOpened: EventEmitter<RowGroupOpenedEvent>;
    /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`.     */
    expandOrCollapseAll: EventEmitter<ExpandCollapseAllEvent>;
    /** The client has set new pinned row data into the grid.     */
    pinnedRowDataChanged: EventEmitter<PinnedRowDataChangedEvent>;
    /** The client has set new data into the grid using `api.setRowData()` or by changing the `rowData` bound property.     */
    rowDataChanged: EventEmitter<RowDataChangedEvent>;
    /** The client has updated data for the grid using `api.applyTransaction(transaction)` or by changing the `rowData` bound property with `immutableData=true`.     */
    rowDataUpdated: EventEmitter<RowDataUpdatedEvent>;
    /** Async transactions have been applied. Contains a list of all transaction results.     */
    asyncTransactionsFlushed: EventEmitter<AsyncTransactionsFlushed>;
    /** Cell is clicked.     */
    cellClicked: EventEmitter<CellClickedEvent>;
    /** Cell is double clicked.     */
    cellDoubleClicked: EventEmitter<CellDoubleClickedEvent>;
    /** Cell is focused.     */
    cellFocused: EventEmitter<CellFocusedEvent>;
    /** Mouse entered cell.     */
    cellMouseOver: EventEmitter<CellMouseOverEvent>;
    /** Mouse left cell.     */
    cellMouseOut: EventEmitter<CellMouseOutEvent>;
    /** Mouse down on cell.     */
    cellMouseDown: EventEmitter<CellMouseDownEvent>;
    /** Row is clicked.     */
    rowClicked: EventEmitter<RowClickedEvent>;
    /** Row is double clicked.     */
    rowDoubleClicked: EventEmitter<RowDoubleClickedEvent>;
    /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected.     */
    rowSelected: EventEmitter<RowSelectedEvent>;
    /** Row selection is changed. Use the grid API `getSelectedNodes()` to get the new list of selected nodes.     */
    selectionChanged: EventEmitter<SelectionChangedEvent>;
    /** Cell is right clicked.     */
    cellContextMenu: EventEmitter<CellContextMenuEvent>;
    /** A change to range selection has occurred.     */
    rangeSelectionChanged: EventEmitter<RangeSelectionChangedEvent>;
    /** Sort has changed. The grid also listens for this and updates the model.     */
    sortChanged: EventEmitter<SortChangedEvent>;
    columnRowGroupChangeRequest: EventEmitter<ColumnRowGroupChangeRequestEvent>;
    columnPivotChangeRequest: EventEmitter<ColumnPivotChangeRequestEvent>;
    columnValueChangeRequest: EventEmitter<ColumnValueChangeRequestEvent>;
    columnAggFuncChangeRequest: EventEmitter<ColumnAggFuncChangeRequestEvent>;
    static ngAcceptInputType_suppressMakeColumnVisibleAfterUnGroup: boolean | null | '';
    static ngAcceptInputType_suppressRowClickSelection: boolean | null | '';
    static ngAcceptInputType_suppressCellSelection: boolean | null | '';
    static ngAcceptInputType_suppressCellFocus: boolean | null | '';
    static ngAcceptInputType_suppressHorizontalScroll: boolean | null | '';
    static ngAcceptInputType_alwaysShowHorizontalScroll: boolean | null | '';
    static ngAcceptInputType_alwaysShowVerticalScroll: boolean | null | '';
    static ngAcceptInputType_debug: boolean | null | '';
    static ngAcceptInputType_enableBrowserTooltips: boolean | null | '';
    static ngAcceptInputType_enableCellExpressions: boolean | null | '';
    static ngAcceptInputType_angularCompileRows: boolean | null | '';
    static ngAcceptInputType_angularCompileFilters: boolean | null | '';
    static ngAcceptInputType_groupSuppressAutoColumn: boolean | null | '';
    static ngAcceptInputType_groupSelectsChildren: boolean | null | '';
    static ngAcceptInputType_groupIncludeFooter: boolean | null | '';
    static ngAcceptInputType_groupIncludeTotalFooter: boolean | null | '';
    static ngAcceptInputType_groupUseEntireRow: boolean | null | '';
    static ngAcceptInputType_groupSuppressBlankHeader: boolean | null | '';
    static ngAcceptInputType_suppressMenuHide: boolean | null | '';
    static ngAcceptInputType_suppressRowDeselection: boolean | null | '';
    static ngAcceptInputType_unSortIcon: boolean | null | '';
    static ngAcceptInputType_suppressMultiSort: boolean | null | '';
    static ngAcceptInputType_alwaysMultiSort: boolean | null | '';
    static ngAcceptInputType_singleClickEdit: boolean | null | '';
    static ngAcceptInputType_suppressLoadingOverlay: boolean | null | '';
    static ngAcceptInputType_suppressNoRowsOverlay: boolean | null | '';
    static ngAcceptInputType_suppressAutoSize: boolean | null | '';
    static ngAcceptInputType_skipHeaderOnAutoSize: boolean | null | '';
    static ngAcceptInputType_suppressParentsInRowNodes: boolean | null | '';
    static ngAcceptInputType_suppressColumnMoveAnimation: boolean | null | '';
    static ngAcceptInputType_suppressMovableColumns: boolean | null | '';
    static ngAcceptInputType_suppressFieldDotNotation: boolean | null | '';
    static ngAcceptInputType_enableRangeSelection: boolean | null | '';
    static ngAcceptInputType_enableRangeHandle: boolean | null | '';
    static ngAcceptInputType_enableFillHandle: boolean | null | '';
    static ngAcceptInputType_suppressClearOnFillReduction: boolean | null | '';
    static ngAcceptInputType_deltaSort: boolean | null | '';
    static ngAcceptInputType_suppressTouch: boolean | null | '';
    static ngAcceptInputType_suppressAsyncEvents: boolean | null | '';
    static ngAcceptInputType_allowContextMenuWithControlKey: boolean | null | '';
    static ngAcceptInputType_suppressContextMenu: boolean | null | '';
    static ngAcceptInputType_rememberGroupStateWhenNewData: boolean | null | '';
    static ngAcceptInputType_enableCellChangeFlash: boolean | null | '';
    static ngAcceptInputType_suppressDragLeaveHidesColumns: boolean | null | '';
    static ngAcceptInputType_suppressMiddleClickScrolls: boolean | null | '';
    static ngAcceptInputType_suppressPreventDefaultOnMouseWheel: boolean | null | '';
    static ngAcceptInputType_suppressCopyRowsToClipboard: boolean | null | '';
    static ngAcceptInputType_copyHeadersToClipboard: boolean | null | '';
    static ngAcceptInputType_copyGroupHeadersToClipboard: boolean | null | '';
    static ngAcceptInputType_pivotMode: boolean | null | '';
    static ngAcceptInputType_suppressAggFuncInHeader: boolean | null | '';
    static ngAcceptInputType_suppressColumnVirtualisation: boolean | null | '';
    static ngAcceptInputType_suppressAggAtRootLevel: boolean | null | '';
    static ngAcceptInputType_suppressFocusAfterRefresh: boolean | null | '';
    static ngAcceptInputType_functionsPassive: boolean | null | '';
    static ngAcceptInputType_functionsReadOnly: boolean | null | '';
    static ngAcceptInputType_animateRows: boolean | null | '';
    static ngAcceptInputType_groupSelectsFiltered: boolean | null | '';
    static ngAcceptInputType_groupRemoveSingleChildren: boolean | null | '';
    static ngAcceptInputType_groupRemoveLowestSingleChildren: boolean | null | '';
    static ngAcceptInputType_enableRtl: boolean | null | '';
    static ngAcceptInputType_suppressClickEdit: boolean | null | '';
    static ngAcceptInputType_rowDragEntireRow: boolean | null | '';
    static ngAcceptInputType_rowDragManaged: boolean | null | '';
    static ngAcceptInputType_suppressRowDrag: boolean | null | '';
    static ngAcceptInputType_suppressMoveWhenRowDragging: boolean | null | '';
    static ngAcceptInputType_rowDragMultiRow: boolean | null | '';
    static ngAcceptInputType_enableGroupEdit: boolean | null | '';
    static ngAcceptInputType_embedFullWidthRows: boolean | null | '';
    static ngAcceptInputType_deprecatedEmbedFullWidthRows: boolean | null | '';
    static ngAcceptInputType_suppressPaginationPanel: boolean | null | '';
    static ngAcceptInputType_groupHideOpenParents: boolean | null | '';
    static ngAcceptInputType_groupMultiAutoColumn: boolean | null | '';
    static ngAcceptInputType_pagination: boolean | null | '';
    static ngAcceptInputType_stopEditingWhenGridLosesFocus: boolean | null | '';
    static ngAcceptInputType_paginationAutoPageSize: boolean | null | '';
    static ngAcceptInputType_suppressScrollOnNewData: boolean | null | '';
    static ngAcceptInputType_suppressScrollWhenPopupsAreOpen: boolean | null | '';
    static ngAcceptInputType_purgeClosedRowNodes: boolean | null | '';
    static ngAcceptInputType_cacheQuickFilter: boolean | null | '';
    static ngAcceptInputType_deltaRowDataMode: boolean | null | '';
    static ngAcceptInputType_ensureDomOrder: boolean | null | '';
    static ngAcceptInputType_accentedSort: boolean | null | '';
    static ngAcceptInputType_suppressChangeDetection: boolean | null | '';
    static ngAcceptInputType_valueCache: boolean | null | '';
    static ngAcceptInputType_valueCacheNeverExpires: boolean | null | '';
    static ngAcceptInputType_aggregateOnlyChangedColumns: boolean | null | '';
    static ngAcceptInputType_suppressAnimationFrame: boolean | null | '';
    static ngAcceptInputType_suppressExcelExport: boolean | null | '';
    static ngAcceptInputType_suppressCsvExport: boolean | null | '';
    static ngAcceptInputType_treeData: boolean | null | '';
    static ngAcceptInputType_masterDetail: boolean | null | '';
    static ngAcceptInputType_suppressMultiRangeSelection: boolean | null | '';
    static ngAcceptInputType_enterMovesDownAfterEdit: boolean | null | '';
    static ngAcceptInputType_enterMovesDown: boolean | null | '';
    static ngAcceptInputType_suppressPropertyNamesCheck: boolean | null | '';
    static ngAcceptInputType_rowMultiSelectWithClick: boolean | null | '';
    static ngAcceptInputType_suppressEnterpriseResetOnNewColumns: boolean | null | '';
    static ngAcceptInputType_suppressRowHoverHighlight: boolean | null | '';
    static ngAcceptInputType_suppressRowTransform: boolean | null | '';
    static ngAcceptInputType_suppressClipboardPaste: boolean | null | '';
    static ngAcceptInputType_suppressLastEmptyLineOnPaste: boolean | null | '';
    static ngAcceptInputType_serverSideSortingAlwaysResets: boolean | null | '';
    static ngAcceptInputType_suppressSetColumnStateEvents: boolean | null | '';
    static ngAcceptInputType_suppressColumnStateEvents: boolean | null | '';
    static ngAcceptInputType_enableCharts: boolean | null | '';
    static ngAcceptInputType_deltaColumnMode: boolean | null | '';
    static ngAcceptInputType_suppressMaintainUnsortedOrder: boolean | null | '';
    static ngAcceptInputType_enableCellTextSelection: boolean | null | '';
    static ngAcceptInputType_suppressBrowserResizeObserver: boolean | null | '';
    static ngAcceptInputType_suppressMaxRenderedRowRestriction: boolean | null | '';
    static ngAcceptInputType_excludeChildrenWhenTreeDataFiltering: boolean | null | '';
    static ngAcceptInputType_tooltipMouseTrack: boolean | null | '';
    static ngAcceptInputType_keepDetailRows: boolean | null | '';
    static ngAcceptInputType_paginateChildRows: boolean | null | '';
    static ngAcceptInputType_preventDefaultOnContextMenu: boolean | null | '';
    static ngAcceptInputType_undoRedoCellEditing: boolean | null | '';
    static ngAcceptInputType_allowDragFromColumnsToolPanel: boolean | null | '';
    static ngAcceptInputType_immutableData: boolean | null | '';
    static ngAcceptInputType_immutableColumns: boolean | null | '';
    static ngAcceptInputType_pivotSuppressAutoColumn: boolean | null | '';
    static ngAcceptInputType_suppressExpandablePivotGroups: boolean | null | '';
    static ngAcceptInputType_applyColumnDefOrder: boolean | null | '';
    static ngAcceptInputType_debounceVerticalScrollbar: boolean | null | '';
    static ngAcceptInputType_detailRowAutoHeight: boolean | null | '';
    static ngAcceptInputType_serverSideFilteringAlwaysResets: boolean | null | '';
    static ngAcceptInputType_suppressAggFilteredOnly: boolean | null | '';
    static ngAcceptInputType_showOpenedGroup: boolean | null | '';
    static ngAcceptInputType_suppressClipboardApi: boolean | null | '';
    static ngAcceptInputType_suppressModelUpdateAfterUpdateTransaction: boolean | null | '';
    static ngAcceptInputType_stopEditingWhenCellsLoseFocus: boolean | null | '';
    static ngAcceptInputType_maintainColumnOrder: boolean | null | '';
    static ngAcceptInputType_groupMaintainOrder: boolean | null | '';
    static ngAcceptInputType_columnHoverHighlight: boolean | null | '';
    static ngAcceptInputType_reactUi: boolean | null | '';
    static ngAcceptInputType_suppressReactUi: boolean | null | '';
    static ngAcceptInputType_readOnlyEdit: boolean | null | '';
    static ngAcceptInputType_suppressRowVirtualisation: boolean | null | '';
}
