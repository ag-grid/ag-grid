import { AfterViewInit, ComponentFactoryResolver, ElementRef, EventEmitter, OnChanges, OnDestroy, ViewContainerRef } from "@angular/core";
import { GridOptions, Module } from "ag-grid-community";
import { AgChartTheme, AgChartThemeOverrides, AsyncTransactionsFlushed, BodyScrollEndEvent, BodyScrollEvent, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditRequestEvent, CellEditingStartedEvent, CellEditingStoppedEvent, CellFocusedEvent, CellKeyDownEvent, CellKeyPressEvent, CellMouseDownEvent, CellMouseOutEvent, CellMouseOverEvent, CellPosition, CellValueChangedEvent, ChartCreated, ChartDestroyed, ChartOptionsChanged, ChartRangeSelectionChanged, ChartRefParams, ChartToolPanelsDef, ColDef, ColGroupDef, ColumnAggFuncChangeRequestEvent, ColumnApi, ColumnEverythingChangedEvent, ColumnGroupOpenedEvent, ColumnMovedEvent, ColumnPinnedEvent, ColumnPivotChangeRequestEvent, ColumnPivotChangedEvent, ColumnPivotModeChangedEvent, ColumnResizedEvent, ColumnRowGroupChangeRequestEvent, ColumnRowGroupChangedEvent, ColumnValueChangeRequestEvent, ColumnValueChangedEvent, ColumnVisibleEvent, ComponentStateChangedEvent, CsvExportParams, DisplayedColumnsChangedEvent, DomLayoutType, DragStartedEvent, DragStoppedEvent, ExcelExportParams, ExcelStyle, ExpandCollapseAllEvent, FillOperationParams, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent, FirstDataRenderedEvent, FullWidthCellKeyDownEvent, FullWidthCellKeyPressEvent, GetChartToolbarItems, GetContextMenuItems, GetDataPath, GetGroupRowAggParams, GetLocaleTextParams, GetMainMenuItems, GetRowIdFunc, GetRowNodeIdFunc, GetServerSideGroupKey, GetServerSideGroupLevelParamsParams, GridApi, GridColumnsChangedEvent, GridReadyEvent, GridSizeChangedEvent, HeaderPosition, IAggFunc, IDatasource, IRowDragItem, IRowNode, IServerSideDatasource, IViewportDatasource, InitialGroupOrderComparatorParams, IsApplyServerSideTransaction, IsExternalFilterPresentParams, IsFullWidthRowParams, IsGroupOpenByDefaultParams, IsRowFilterable, IsRowMaster, IsRowSelectable, IsServerSideGroup, IsServerSideGroupOpenByDefaultParams, LoadingCellRendererSelectorFunc, ModelUpdatedEvent, NavigateToNextCellParams, NavigateToNextHeaderParams, NewColumnsLoadedEvent, PaginationChangedEvent, PaginationNumberFormatterParams, PasteEndEvent, PasteStartEvent, PinnedRowDataChangedEvent, PostProcessPopupParams, PostSortRowsParams, ProcessCellForExportParams, ProcessDataFromClipboardParams, ProcessGroupHeaderForExportParams, ProcessHeaderForExportParams, ProcessRowParams, RangeSelectionChangedEvent, RowClassParams, RowClassRules, RowClickedEvent, RowDataChangedEvent, RowDataUpdatedEvent, RowDoubleClickedEvent, RowDragEvent, RowEditingStartedEvent, RowEditingStoppedEvent, RowGroupOpenedEvent, RowGroupingDisplayType, RowHeightParams, RowModelType, RowSelectedEvent, RowStyle, RowValueChangedEvent, SelectionChangedEvent, SendToClipboardParams, ServerSideGroupLevelParams, ServerSideStoreType, SideBarDef, SortChangedEvent, SortDirection, StatusPanelDef, TabToNextCellParams, TabToNextHeaderParams, ToolPanelSizeChangedEvent, ToolPanelVisibleChangedEvent, TreeDataDisplayType, ViewportChangedEvent, VirtualColumnsChangedEvent, VirtualRowRemovedEvent } from "ag-grid-community";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import * as i0 from "@angular/core";
export declare class AgGridAngular<TData = any, TColDef extends ColDef<TData> = ColDef<any>> implements AfterViewInit, OnChanges, OnDestroy {
    private viewContainerRef;
    private angularFrameworkOverrides;
    private frameworkComponentWrapper;
    private componentFactoryResolver;
    private _nativeElement;
    private _initialised;
    private _destroyed;
    private gridParams;
    private _fullyReady;
    api: GridApi<TData>;
    columnApi: ColumnApi;
    constructor(elementDef: ElementRef, viewContainerRef: ViewContainerRef, angularFrameworkOverrides: AngularFrameworkOverrides, frameworkComponentWrapper: AngularFrameworkComponentWrapper, componentFactoryResolver: ComponentFactoryResolver);
    ngAfterViewInit(): void;
    ngOnChanges(changes: any): void;
    ngOnDestroy(): void;
    protected isEmitterUsed(eventType: string): boolean;
    private globalEventListener;
    gridOptions: GridOptions<TData> | undefined;
    modules: Module[] | undefined;
    /** Specifies the status bar components to use in the status bar.     */
    statusBar: {
        statusPanels: StatusPanelDef[];
    } | undefined;
    /** Specifies the side bar components.     */
    sideBar: SideBarDef | string | string[] | boolean | null | undefined;
    /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu. Default: `false`      */
    suppressContextMenu: boolean | undefined;
    /** When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
         * This flag is useful to prevent the browser from showing its default context menu.
         * Default: `false`
         */
    preventDefaultOnContextMenu: boolean | undefined;
    /** Allows context menu to show, even when `Ctrl` key is held down. Default: `false`      */
    allowContextMenuWithControlKey: boolean | undefined;
    /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header. Default: `false`     */
    suppressMenuHide: boolean | undefined;
    /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component. Default: `false`      */
    enableBrowserTooltips: boolean | undefined;
    /** The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
         *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
         * Default: `2000`
         */
    tooltipShowDelay: number | undefined;
    /** The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
         *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
         * Default: `10000`
         */
    tooltipHideDelay: number | undefined;
    /** Set to `true` to have tooltips follow the cursor once they are displayed. Default: `false`      */
    tooltipMouseTrack: boolean | undefined;
    /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).     */
    popupParent: HTMLElement | null | undefined;
    /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
    copyHeadersToClipboard: boolean | undefined;
    /** Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard. Default: `false`     */
    copyGroupHeadersToClipboard: boolean | undefined;
    /** Specify the delimiter to use when copying to clipboard.
         * Default: `\t`
        */
    clipboardDelimiter: string | undefined;
    /** Set to `true` to copy the cell range or focused cell to the clipboard and never the selected rows. Default: `false`     */
    suppressCopyRowsToClipboard: boolean | undefined;
    /** Set to `true` to copy rows instead of ranges when a range with only a single cell is selected. Default: `false`     */
    suppressCopySingleCellRanges: boolean | undefined;
    /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard. Default: `false`     */
    suppressLastEmptyLineOnPaste: boolean | undefined;
    /** Set to `true` to turn off paste operations within the grid.     */
    suppressClipboardPaste: boolean | undefined;
    /** Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround.     */
    suppressClipboardApi: boolean | undefined;
    /** Array of Column / Column Group definitions.     */
    columnDefs: (TColDef | ColGroupDef<TData>)[] | null | undefined;
    /** A default column definition. Items defined in the actual column definitions get precedence.     */
    defaultColDef: ColDef<TData> | undefined;
    /** A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence.     */
    defaultColGroupDef: Partial<ColGroupDef<TData>> | undefined;
    /** An object map of custom column types which contain groups of properties that column definitions can inherit by referencing in their `type` property.     */
    columnTypes: {
        [key: string]: ColDef<TData>;
    } | undefined;
    /** Keeps the order of Columns maintained after new Column Definitions are updated. Default: `false`     */
    maintainColumnOrder: boolean | undefined;
    /** If `true`, then dots in field names (e.g. `'address.firstLine'`) are not treated as deep references. Allows you to use dots in your field name if you prefer. Default: `false`     */
    suppressFieldDotNotation: boolean | undefined;
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
    /** If `true`, when you drag a column into a row group panel the column is not hidden. Default: `false`     */
    suppressRowGroupHidesColumns: boolean | undefined;
    /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing).     */
    colResizeDefault: 'shift' | undefined;
    /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size. Default: `false`     */
    suppressAutoSize: boolean | undefined;
    /** Number of pixels to add to a column width after the [auto-sizing](/column-sizing/#auto-size-columns) calculation.
         * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
         * Default: `4`
         */
    autoSizePadding: number | undefined;
    /** Set this to `true` to skip the `headerName` when `autoSize` is called by default. Default: `false`     */
    skipHeaderOnAutoSize: boolean | undefined;
    /** A map of component names to components.     */
    components: {
        [p: string]: any;
    } | undefined;
    /** @deprecated As of v27, use `components` for framework components too.     */
    frameworkComponents: {
        [p: string]: {
            new (): any;
        };
    } | any | undefined;
    /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.     */
    editType: 'fullRow' | undefined;
    /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click. Default: `false`     */
    singleClickEdit: boolean | undefined;
    /** Set to `true` so that neither single nor double click starts editing. Default: `false`     */
    suppressClickEdit: boolean | undefined;
    /** Set to `true` so stop the grid updating data after and edit. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid.     */
    readOnlyEdit: boolean | undefined;
    /** Set this to `true` to stop cell editing when grid loses focus.
         * The default is that the grid stays editing until focus goes onto another cell.
         * Default: `false`
         */
    stopEditingWhenCellsLoseFocus: boolean | undefined;
    /** Set to `true` along with `enterMovesDownAfterEdit` to have Excel-style behaviour for the `Enter` key.
         * i.e. pressing the `Enter` key will move down to the cell beneath.
         * Default: `false`
         */
    enterMovesDown: boolean | undefined;
    /** Set to `true` along with `enterMovesDown` to have Excel-style behaviour for the 'Enter' key.
         * i.e. pressing the Enter key will move down to the cell beneath.
         * Default: `false`
         */
    enterMovesDownAfterEdit: boolean | undefined;
    /** Forces Cell Editing to start when backspace is pressed. This is only relevant for MacOS users.     */
    enableCellEditingOnBackspace: boolean | undefined;
    /** Set to `true` to enable Undo / Redo while editing.     */
    undoRedoCellEditing: boolean | undefined;
    /** Set the size of the undo / redo stack. Default: `10`     */
    undoRedoCellEditingLimit: number | undefined;
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
    /** @deprecated As of v29, no longer used. To suppress use `suppressChartToolPanelsButton`.     */
    enableChartToolPanelsButton: boolean | undefined;
    /** Set to `true` to show the 'hamburger' menu option from the Chart Toolbar and display the remaining toolbar buttons. Default: `false`     */
    suppressChartToolPanelsButton: boolean | undefined;
    /** Allows customisation of the Chart Tool Panels, such as changing the tool panels visibility and order, as well as choosing which charts should be displayed in the settings panel.     */
    chartToolPanelsDef: ChartToolPanelsDef | undefined;
    /** Provide your own loading cell renderer to use when data is loading via a DataSource.
        * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.
        */
    loadingCellRenderer: any;
    /** @deprecated As of v27, use `loadingCellRenderer` for framework components too.     */
    loadingCellRendererFramework: any;
    /** Params to be passed to the `loadingCellRenderer` component.     */
    loadingCellRendererParams: any;
    /** Callback to select which loading cell renderer to be used when data is loading via a DataSource.     */
    loadingCellRendererSelector: LoadingCellRendererSelectorFunc<TData> | undefined;
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
        * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.
        */
    detailCellRenderer: any;
    /** @deprecated As of v27, use `detailCellRenderer` for framework components too.     */
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
    alignedGrids: {
        api?: GridApi | null;
        columnApi?: ColumnApi | null;
    }[] | undefined;
    /** Change this value to set the tabIndex order of the Grid within your application. Default: `0`     */
    tabIndex: number | undefined;
    /** The number of rows rendered outside the viewable area the grid renders.
         * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
         * Default: `10`
         */
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
         * Default: `false`
         */
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
        * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-loading-overlay-component) for framework specific implementation details.
        */
    loadingOverlayComponent: any;
    /** @deprecated As of v27, use `loadingOverlayComponent` for framework components too.     */
    loadingOverlayComponentFramework: any;
    /** Customise the parameters provided to the loading overlay component.     */
    loadingOverlayComponentParams: any;
    /** Disables the 'loading' overlay. Default: `false`     */
    suppressLoadingOverlay: boolean | undefined;
    /** Provide a template for 'no rows' overlay.     */
    overlayNoRowsTemplate: string | undefined;
    /** Provide a custom no rows overlay component.
        * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#simple-no-rows-overlay-component) for framework specific implementation details.
        */
    noRowsOverlayComponent: any;
    /** @deprecated As of v27, use `noRowsOverlayComponent` for framework components too.     */
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
         * Default: `false`
         */
    suppressPaginationPanel: boolean | undefined;
    /** Set to `true` to enable pivot mode. Default: `false`     */
    pivotMode: boolean | undefined;
    /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off. Default: `never`     */
    pivotPanelShow: 'always' | 'onlyWhenPivoting' | 'never' | undefined;
    /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified.     */
    pivotColumnGroupTotals: 'before' | 'after' | undefined;
    /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified.     */
    pivotRowTotals: 'before' | 'after' | undefined;
    /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column. Default: `false`     */
    pivotSuppressAutoColumn: boolean | undefined;
    /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups. Default: `false`     */
    suppressExpandablePivotGroups: boolean | undefined;
    /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection. Default: `false`     */
    functionsReadOnly: boolean | undefined;
    /** A map of 'function name' to 'function' for custom aggregation functions.     */
    aggFuncs: {
        [key: string]: IAggFunc<TData>;
    } | undefined;
    /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`. Default: `false`     */
    suppressAggFuncInHeader: boolean | undefined;
    /** When `true`, the aggregations won't be computed for the root node of the grid. Default: `false`     */
    suppressAggAtRootLevel: boolean | undefined;
    /** When using change detection, only the updated column will be re-aggregated. Default: `false`     */
    aggregateOnlyChangedColumns: boolean | undefined;
    /** Set to `true` so that aggregations are not impacted by filtering. Default: `false`     */
    suppressAggFilteredOnly: boolean | undefined;
    /** Set to `true` to omit the value Column header when there is only a single value column. Default: `false`     */
    removePivotHeaderRowWhenSingleValueColumn: boolean | undefined;
    /** Set to `true` to enable Row Animation. Default: `false`     */
    animateRows: boolean | undefined;
    /** Set to `true` to have cells flash after data changes. Default: `false`     */
    enableCellChangeFlash: boolean | undefined;
    /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long a cell should remain in its "flashed" state.
         * Default: `500`
         */
    cellFlashDelay: number | undefined;
    /** To be used in combination with `enableCellChangeFlash`, this configuration will set the delay in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `cellFlashDelay` has completed.
         * Default: `1000`
         */
    cellFadeDelay: number | undefined;
    /** Set to `true` to have cells flash after data changes even when the change is due to filtering. Default: `false`     */
    allowShowChangeAfterFilter: boolean | undefined;
    /** Switch between layout options: `normal`, `autoHeight`, `print`.
         * Default: `normal`
         */
    domLayout: DomLayoutType | undefined;
    /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen. Default: `false`     */
    ensureDomOrder: boolean | undefined;
    /** Set to `true` to operate the grid in RTL (Right to Left) mode. Default: `false`     */
    enableRtl: boolean | undefined;
    /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered. Default: `false`     */
    suppressColumnVirtualisation: boolean | undefined;
    /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
         * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen), or `suppressRowVirtualisation` is true, or if your grid height is able to display more than 500 rows at once.**
         * Default: `false`
         */
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
    /** A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
         * If this callback is not set, the current cell value will be used.
         * If the `rowDragText` callback is set in the ColDef it will take precedence over this, except when
         * `rowDragEntireRow=true`.
         */
    rowDragText: ((params: IRowDragItem, dragItemCount: number) => string) | undefined;
    /** Provide your own cell renderer component to use for full width rows.
        * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.
        */
    fullWidthCellRenderer: any;
    /** @deprecated As of v27, use `fullWidthCellRenderer` for framework components too.     */
    fullWidthCellRendererFramework: any;
    /** Customise the parameters provided to the `fullWidthCellRenderer` component.     */
    fullWidthCellRendererParams: any;
    /** Set to `true` to have the detail grid embedded in the master grid's container and so link their horizontal scrolling.     */
    embedFullWidthRows: boolean | undefined;
    /** Specifies how the results of row grouping should be displayed.
         *
         *  The options are:
         *
         * - `'singleColumn'`: single group column automatically added by the grid.
         * - `'multipleColumns'`: a group column per row group is added automatically.
         * - `'groupRows'`: group rows are automatically added instead of group columns.
         * - `'custom'`: informs the grid that group columns will be provided.
         */
    groupDisplayType: RowGroupingDisplayType | undefined;
    /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything. Default: `0`     */
    groupDefaultExpanded: number | undefined;
    /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included.     */
    autoGroupColumnDef: ColDef<TData> | undefined;
    /** When `true`, preserves the current group order when sorting on non-group columns. Default: `false`     */
    groupMaintainOrder: boolean | undefined;
    /** When `true`, if you select a group, the children of the group will also be selected. Default: `false`     */
    groupSelectsChildren: boolean | undefined;
    /** Set to determine whether filters should be applied on aggregated group values. Default: `false`     */
    groupAggFiltering: boolean | IsRowFilterable<TData> | undefined;
    /** If grouping, this controls whether to show a group footer when the group is expanded.
         * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
         * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
         * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.
         * Default: `false`
         */
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
    /** Set to `true` to prevent the grid from creating a '(Blanks)' group for nodes which do not belong to a group, and display the unbalanced nodes alongside group nodes. Default: `false`     */
    groupAllowUnbalanced: boolean | undefined;
    /** When to show the 'row group panel' (where you drag rows to group) at the top. Default: `never`     */
    rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never' | undefined;
    /** Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
        * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.
        */
    groupRowRenderer: any;
    /** @deprecated As of v27, use `groupRowRenderer` for framework components too.     */
    groupRowRendererFramework: any;
    /** Customise the parameters provided to the `groupRowRenderer` component.     */
    groupRowRendererParams: any;
    /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping. Default: `false`     */
    suppressMakeColumnVisibleAfterUnGroup: boolean | undefined;
    /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.     */
    treeData: boolean | undefined;
    /** Set to `true` to suppress sort indicators and actions from the row group panel. Default: `false`.     */
    rowGroupPanelSuppressSort: boolean | undefined;
    /** Set to `true` to keep open Group Rows visible at the top of the grid. Default: `false`.*/
    groupRowsSticky: boolean | undefined;
    /** @deprecated v24 - no longer needed, transaction updates keep group state     */
    rememberGroupStateWhenNewData: boolean | undefined;
    /** Data to be displayed as pinned top rows in the grid.     */
    pinnedTopRowData: any[] | undefined;
    /** Data to be displayed as pinned bottom rows in the grid.     */
    pinnedBottomRowData: any[] | undefined;
    /** Sets the row model type. Default: `clientSide`     */
    rowModelType: RowModelType | undefined;
    /** Set the data to be displayed as rows in the grid.     */
    rowData: TData[] | null | undefined;
    /** @deprecated 27.1 Immutable Data is on by default when grid callback getRowId() is implemented
         * Enables Immutable Data mode, for compatibility with immutable stores. Default: `false`     */
    immutableData: boolean | undefined;
    /** How many milliseconds to wait before executing a batch of async transactions.     */
    asyncTransactionWaitMillis: number | undefined;
    /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates. Default: `false`     */
    suppressModelUpdateAfterUpdateTransaction: boolean | undefined;
    /** Provide the datasource for infinite scrolling.     */
    datasource: IDatasource | undefined;
    /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
         * Default: `1`
         */
    cacheOverflowSize: number | undefined;
    /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
         * Default: `1`
         */
    infiniteInitialRowCount: number | undefined;
    /** Set how many loading rows to display to the user for the root level group.
         * Default: `1`
         */
    serverSideInitialRowCount: number | undefined;
    /** @deprecated v28 Whether to use Full Store or Partial Store for storing rows. Default: `partial`.
         * Deprecated in favour of suppressServerSideInfiniteScroll. When false, Partial Store is used. When true,
         * Full Store is used.
         */
    serverSideStoreType: ServerSideStoreType | undefined;
    /** When `true`, the Server-side Row Model will suppress Infinite Scrolling and load all the data at the current level.
         * Default: `false`
         */
    suppressServerSideInfiniteScroll: boolean | undefined;
    /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
         * Default: `100`
         */
    cacheBlockSize: number | undefined;
    /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.     */
    maxBlocksInCache: number | undefined;
    /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.
         * Set to `-1` for no maximum restriction on requests.
         * Default: `2`
         */
    maxConcurrentDatasourceRequests: number | undefined;
    /** How many milliseconds to wait before loading a block. Useful when scrolling over many blocks, as it prevents blocks loading until scrolling has settled.     */
    blockLoadDebounceMillis: number | undefined;
    /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping. Default: `false`      */
    purgeClosedRowNodes: boolean | undefined;
    /** Provide the `serverSideDatasource` for server side row model.     */
    serverSideDatasource: IServerSideDatasource | undefined;
    /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server. Default: `false`     */
    serverSideSortAllLevels: boolean | undefined;
    /** When enabled, always refreshes top level groups regardless of which column was filtered. This property only applies when there is Row Grouping & filtering is handled on the server. Default: `false`     */
    serverSideFilterAllLevels: boolean | undefined;
    /**
         * When enabled, Sorting will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
         * Default: `false`
         */
    serverSideSortOnServer: boolean | undefined;
    /** When enabled, Filtering will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
          * Default: `false`
          */
    serverSideFilterOnServer: boolean | undefined;
    /** @deprecated v28 This property has been deprecated. Use `serverSideSortAllLevels` instead.     */
    serverSideSortingAlwaysResets: boolean | undefined;
    /** @deprecated v28 This property has been deprecated. Use `serverSideFilterAllLevels` instead.     */
    serverSideFilteringAlwaysResets: boolean | undefined;
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
    rowSelection: 'single' | 'multiple' | undefined;
    /** Set to `true` to allow multiple rows to be selected using single click. Default: `false`     */
    rowMultiSelectWithClick: boolean | undefined;
    /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`. Default: `false`     */
    suppressRowDeselection: boolean | undefined;
    /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection. Default: `false`     */
    suppressRowClickSelection: boolean | undefined;
    /** @deprecated v27 This property has been deprecated. Use `suppressCellFocus` instead.
         */
    suppressCellSelection: boolean | undefined;
    /** If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels. Default: `false`     */
    suppressCellFocus: boolean | undefined;
    /** If `true`, only a single range can be selected. Default: `false`     */
    suppressMultiRangeSelection: boolean | undefined;
    /** Set to `true` to be able to select the text within cells.
         *
         *     **Note:** When this is set to `true`, the clipboard service is disabled.
         * Default: `false`
         */
    enableCellTextSelection: boolean | undefined;
    /** Set to `true` to enable Range Selection. Default: `false`     */
    enableRangeSelection: boolean | undefined;
    /** Set to `true` to enable the Range Handle. Default: `false`     */
    enableRangeHandle: boolean | undefined;
    /** Set to `true` to enable the Fill Handle. Default: `false`     */
    enableFillHandle: boolean | undefined;
    /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical. Default: `xy`     */
    fillHandleDirection: 'x' | 'y' | 'xy' | undefined;
    /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle. Default: `false`*/
    suppressClearOnFillReduction: boolean | undefined;
    /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`. Default: `[null, 'asc', 'desc']`      */
    sortingOrder: (SortDirection)[] | undefined;
    /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower. Default: `false`     */
    accentedSort: boolean | undefined;
    /** Set to `true` to show the 'no sort' icon. Default: `false`     */
    unSortIcon: boolean | undefined;
    /** Set to `true` to suppress multi-sort when the user shift-clicks a column header. Default: `false`     */
    suppressMultiSort: boolean | undefined;
    /** Set to `true` to always multi-sort when the user clicks a column header, regardless of key presses. Default: `false`     */
    alwaysMultiSort: boolean | undefined;
    /** Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key.     */
    multiSortKey: 'ctrl' | undefined;
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
    rowClassRules: RowClassRules<TData> | undefined;
    /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class. Default: `false`     */
    suppressRowHoverHighlight: boolean | undefined;
    /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning. Default: `false`     */
    suppressRowTransform: boolean | undefined;
    /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class. Default: `false`     */
    columnHoverHighlight: boolean | undefined;
    deltaSort: boolean | undefined;
    treeDataDisplayType: TreeDataDisplayType | undefined;
    functionsPassive: boolean | undefined;
    enableGroupEdit: boolean | undefined;
    /** For customising the context menu.     */
    getContextMenuItems: GetContextMenuItems<TData> | undefined;
    /** For customising the main 'column header' menu.     */
    getMainMenuItems: GetMainMenuItems | undefined;
    /** Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup.     */
    postProcessPopup: ((params: PostProcessPopupParams<TData>) => void) | undefined;
    /** Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel.     */
    processCellForClipboard: ((params: ProcessCellForExportParams<TData>) => any) | undefined;
    /** Allows you to process header values for the clipboard.      */
    processHeaderForClipboard: ((params: ProcessHeaderForExportParams<TData>) => any) | undefined;
    /** Allows you to process group header values for the clipboard.      */
    processGroupHeaderForClipboard: ((params: ProcessGroupHeaderForExportParams<TData>) => any) | undefined;
    /** Allows you to process cells from the clipboard. Handy if for example you have number fields, and want to block non-numbers from getting into the grid.     */
    processCellFromClipboard: ((params: ProcessCellForExportParams<TData>) => any) | undefined;
    /** Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself.     */
    sendToClipboard: ((params: SendToClipboardParams<TData>) => void) | undefined;
    /** Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data.     */
    processDataFromClipboard: ((params: ProcessDataFromClipboardParams<TData>) => string[][] | null) | undefined;
    /** Grid calls this method to know if an external filter is present.     */
    isExternalFilterPresent: ((params: IsExternalFilterPresentParams<TData>) => boolean) | undefined;
    /** Should return `true` if external filter passes, otherwise `false`.     */
    doesExternalFilterPass: ((node: IRowNode<TData>) => boolean) | undefined;
    /** Callback to be used to customise the chart toolbar items.     */
    getChartToolbarItems: GetChartToolbarItems | undefined;
    /** Callback to enable displaying the chart in an alternative chart container.     */
    createChartContainer: ((params: ChartRefParams<TData>) => void) | undefined;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.     */
    navigateToNextHeader: ((params: NavigateToNextHeaderParams<TData>) => (HeaderPosition | null)) | undefined;
    /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.      */
    tabToNextHeader: ((params: TabToNextHeaderParams<TData>) => (HeaderPosition | null)) | undefined;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.      */
    navigateToNextCell: ((params: NavigateToNextCellParams<TData>) => (CellPosition | null)) | undefined;
    /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused. Return the next Cell position to navigate to or null to stay on current cell.      */
    tabToNextCell: ((params: TabToNextCellParams<TData>) => (CellPosition | null)) | undefined;
    /** @deprecated v27.2 - Use `getLocaleText` instead.     */
    localeTextFunc: ((key: string, defaultValue: string, variableValues?: string[]) => string) | undefined;
    /** A callback for localising text within the grid.     */
    getLocaleText: ((params: GetLocaleTextParams<TData>) => string) | undefined;
    /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)     */
    getDocument: (() => Document) | undefined;
    /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.     */
    paginationNumberFormatter: ((params: PaginationNumberFormatterParams<TData>) => string) | undefined;
    /** @deprecated v27.2 - Use `getGroupRowAgg` instead.     */
    groupRowAggNodes: ((nodes: IRowNode[]) => any) | undefined;
    /** Callback to use when you need access to more then the current column for aggregation.     */
    getGroupRowAgg: ((params: GetGroupRowAggParams<TData>) => any) | undefined;
    /** (Client-side Row Model only) Allows groups to be open by default.     */
    isGroupOpenByDefault: ((params: IsGroupOpenByDefaultParams<TData>) => boolean) | undefined;
    /** Allows default sorting of groups.     */
    initialGroupOrderComparator: ((params: InitialGroupOrderComparatorParams<TData>) => number) | undefined;
    /** @deprecated v27.2 - Use `initialGroupOrderComparator` instead     */
    defaultGroupOrderComparator: ((nodeA: IRowNode<TData>, nodeB: IRowNode<TData>) => number) | undefined;
    /** @deprecated v28 - Use `processPivotResultColDef` instead     */
    processSecondaryColDef: ((colDef: ColDef<TData>) => void) | undefined;
    /** @deprecated v28 - Use `processPivotResultColGroupDef` instead     */
    processSecondaryColGroupDef: ((colGroupDef: ColGroupDef<TData>) => void) | undefined;
    /** Callback to be used with pivoting, to allow changing the second column definition.     */
    processPivotResultColDef: ((colDef: ColDef<TData>) => void) | undefined;
    /** Callback to be used with pivoting, to allow changing the second column group definition.     */
    processPivotResultColGroupDef: ((colGroupDef: ColGroupDef<TData>) => void) | undefined;
    /** Callback to be used when working with Tree Data when `treeData = true`.     */
    getDataPath: GetDataPath<TData> | undefined;
    /** Allows setting the child count for a group row.     */
    getChildCount: ((dataItem: any) => number) | undefined;
    /** Allows providing different params for different levels of grouping.     */
    getServerSideGroupLevelParams: ((params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams) | undefined;
    /** @deprecated v28 Use `getServerSideGroupLevelParams` instead.     */
    getServerSideStoreParams: ((params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams) | undefined;
    /** Allows groups to be open by default.     */
    isServerSideGroupOpenByDefault: ((params: IsServerSideGroupOpenByDefaultParams) => boolean) | undefined;
    /** Allows cancelling transactions.     */
    isApplyServerSideTransaction: IsApplyServerSideTransaction | undefined;
    /** SSRM Tree Data: Allows specifying which rows are expandable.     */
    isServerSideGroup: IsServerSideGroup | undefined;
    /** SSRM Tree Data: Allows specifying group keys.     */
    getServerSideGroupKey: GetServerSideGroupKey | undefined;
    /** Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-id='abc'` where `abc` is what you return as the business key.
         * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.
         */
    getBusinessKeyForNode: ((node: IRowNode<TData>) => string) | undefined;
    /** @deprecated v27.1 Use `getRowId` instead - however be aware, `getRowId()` will also set grid option `immutableData=true`
         * Allows you to set the ID for a particular row node based on the data.     */
    getRowNodeId: GetRowNodeIdFunc<TData> | undefined;
    /** Allows setting the ID for a particular row node based on the data.     */
    getRowId: GetRowIdFunc<TData> | undefined;
    /** When enabled, getRowId() callback is implemented and new Row Data is set, the grid will disregard all previous rows and treat the new Row Data as new data. As a consequence, all Row State (eg selection, rendered rows) will be reset.  Default: `false`     */
    resetRowDataOnUpdate: boolean | undefined;
    /** Allows you to process rows after they are created, so you can do final adding of custom attributes etc.     */
    processRowPostCreate: ((params: ProcessRowParams<TData>) => void) | undefined;
    /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable.     */
    isRowSelectable: IsRowSelectable<TData> | undefined;
    /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row.     */
    isRowMaster: IsRowMaster<TData> | undefined;
    /** Callback to fill values instead of simply copying values or increasing number values using linear progression.     */
    fillOperation: ((params: FillOperationParams<TData>) => any) | undefined;
    /** @deprecated v27.2 Use `postSortRows` instead     */
    postSort: ((nodes: IRowNode<TData>[]) => void) | undefined;
    /** Callback to perform additional sorting after the grid has sorted the rows.     */
    postSortRows: ((params: PostSortRowsParams<TData>) => void) | undefined;
    /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.     */
    getRowStyle: ((params: RowClassParams<TData>) => RowStyle | undefined) | undefined;
    /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.     */
    getRowClass: ((params: RowClassParams<TData>) => string | string[] | undefined) | undefined;
    /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.     */
    getRowHeight: ((params: RowHeightParams<TData>) => number | undefined | null) | undefined;
    /** @deprecated v27.2 Use `isFullWidthRow` instead.     */
    isFullWidthCell: ((rowNode: IRowNode<TData>) => boolean) | undefined;
    /** Tells the grid if this row should be rendered as full width.     */
    isFullWidthRow: ((params: IsFullWidthRowParams<TData>) => boolean) | undefined;
    /** The tool panel was hidden or shown. Use `api.isToolPanelShowing()` to get status.     */
    toolPanelVisibleChanged: EventEmitter<ToolPanelVisibleChangedEvent<TData>>;
    /** The tool panel size has been changed.     */
    toolPanelSizeChanged: EventEmitter<ToolPanelSizeChangedEvent<TData>>;
    /** Paste operation has started.     */
    pasteStart: EventEmitter<PasteStartEvent<TData>>;
    /** Paste operation has ended.     */
    pasteEnd: EventEmitter<PasteEndEvent<TData>>;
    /** A column, or group of columns, was hidden / shown.     */
    columnVisible: EventEmitter<ColumnVisibleEvent<TData>>;
    /** A column, or group of columns, was pinned / unpinned.     */
    columnPinned: EventEmitter<ColumnPinnedEvent<TData>>;
    /** A column was resized.     */
    columnResized: EventEmitter<ColumnResizedEvent<TData>>;
    /** A column was moved.     */
    columnMoved: EventEmitter<ColumnMovedEvent<TData>>;
    /** A value column was added or removed.     */
    columnValueChanged: EventEmitter<ColumnValueChangedEvent<TData>>;
    /** The pivot mode flag was changed.     */
    columnPivotModeChanged: EventEmitter<ColumnPivotModeChangedEvent<TData>>;
    /** A pivot column was added, removed or order changed.     */
    columnPivotChanged: EventEmitter<ColumnPivotChangedEvent<TData>>;
    /** A column group was opened / closed.     */
    columnGroupOpened: EventEmitter<ColumnGroupOpenedEvent<TData>>;
    /** User set new columns.     */
    newColumnsLoaded: EventEmitter<NewColumnsLoadedEvent<TData>>;
    /** The list of grid columns changed.     */
    gridColumnsChanged: EventEmitter<GridColumnsChangedEvent<TData>>;
    /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc.     */
    displayedColumnsChanged: EventEmitter<DisplayedColumnsChangedEvent<TData>>;
    /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default).     */
    virtualColumnsChanged: EventEmitter<VirtualColumnsChangedEvent<TData>>;
    /** Shotgun - gets called when either a) new columns are set or b) `columnApi.applyColumnState()` is used, so everything has changed.     */
    columnEverythingChanged: EventEmitter<ColumnEverythingChangedEvent<TData>>;
    /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
         * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.
         */
    componentStateChanged: EventEmitter<ComponentStateChangedEvent<TData>>;
    /** Value has changed after editing (this event will not fire if editing was cancelled, eg ESC was pressed) or
         *  if cell value has changed as a result of paste operation.
        */
    cellValueChanged: EventEmitter<CellValueChangedEvent<TData>>;
    /** Value has changed after editing. Only fires when doing Read Only Edits, ie `readOnlyEdit=true`.     */
    cellEditRequest: EventEmitter<CellEditRequestEvent<TData>>;
    /** A cell's value within a row has changed. This event corresponds to Full Row Editing only.     */
    rowValueChanged: EventEmitter<RowValueChangedEvent<TData>>;
    /** Editing a cell has started.     */
    cellEditingStarted: EventEmitter<CellEditingStartedEvent<TData>>;
    /** Editing a cell has stopped.     */
    cellEditingStopped: EventEmitter<CellEditingStoppedEvent<TData>>;
    /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing.     */
    rowEditingStarted: EventEmitter<RowEditingStartedEvent<TData>>;
    /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing.     */
    rowEditingStopped: EventEmitter<RowEditingStoppedEvent<TData>>;
    /** Filter has been opened.     */
    filterOpened: EventEmitter<FilterOpenedEvent<TData>>;
    /** Filter has been modified and applied.     */
    filterChanged: EventEmitter<FilterChangedEvent<TData>>;
    /** Filter was modified but not applied. Used when filters have 'Apply' buttons.     */
    filterModified: EventEmitter<FilterModifiedEvent<TData>>;
    /** A chart has been created.     */
    chartCreated: EventEmitter<ChartCreated<TData>>;
    /** The data range for the chart has been changed.     */
    chartRangeSelectionChanged: EventEmitter<ChartRangeSelectionChanged<TData>>;
    /** Formatting changes have been made by users through the Format Panel.     */
    chartOptionsChanged: EventEmitter<ChartOptionsChanged<TData>>;
    /** A chart has been destroyed.     */
    chartDestroyed: EventEmitter<ChartDestroyed<TData>>;
    /** DOM event `keyDown` happened on a cell.     */
    cellKeyDown: EventEmitter<CellKeyDownEvent<TData> | FullWidthCellKeyDownEvent<TData>>;
    /** DOM event `keyPress` happened on a cell.     */
    cellKeyPress: EventEmitter<CellKeyPressEvent<TData> | FullWidthCellKeyPressEvent<TData>>;
    /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet      */
    gridReady: EventEmitter<GridReadyEvent<TData>>;
    /** Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents     */
    firstDataRendered: EventEmitter<FirstDataRenderedEvent<TData>>;
    /** The size of the grid `div` has changed. In other words, the grid was resized.     */
    gridSizeChanged: EventEmitter<GridSizeChangedEvent<TData>>;
    /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events.     */
    modelUpdated: EventEmitter<ModelUpdatedEvent<TData>>;
    /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row.     */
    virtualRowRemoved: EventEmitter<VirtualRowRemovedEvent<TData>>;
    /** Which rows are rendered in the DOM has changed.     */
    viewportChanged: EventEmitter<ViewportChangedEvent<TData>>;
    /** The body was scrolled horizontally or vertically.     */
    bodyScroll: EventEmitter<BodyScrollEvent<TData>>;
    /** Main body of the grid has stopped scrolling, either horizontally or vertically.     */
    bodyScrollEnd: EventEmitter<BodyScrollEndEvent<TData>>;
    /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.     */
    dragStarted: EventEmitter<DragStartedEvent<TData>>;
    /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.     */
    dragStopped: EventEmitter<DragStoppedEvent<TData>>;
    /** Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
         *
         *  - The page size changes.
         *  - The current shown page is changed.
         *  - New data is loaded onto the grid.
         */
    paginationChanged: EventEmitter<PaginationChangedEvent<TData>>;
    /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid.     */
    rowDragEnter: EventEmitter<RowDragEvent<TData>>;
    /** The mouse has moved while dragging.     */
    rowDragMove: EventEmitter<RowDragEvent<TData>>;
    /** The mouse has left the grid while dragging.     */
    rowDragLeave: EventEmitter<RowDragEvent<TData>>;
    /** The drag has finished over the grid.     */
    rowDragEnd: EventEmitter<RowDragEvent<TData>>;
    /** A row group column was added or removed.     */
    columnRowGroupChanged: EventEmitter<ColumnRowGroupChangedEvent<TData>>;
    /** A row group was opened or closed.     */
    rowGroupOpened: EventEmitter<RowGroupOpenedEvent<TData>>;
    /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`.     */
    expandOrCollapseAll: EventEmitter<ExpandCollapseAllEvent<TData>>;
    /** The client has set new pinned row data into the grid.     */
    pinnedRowDataChanged: EventEmitter<PinnedRowDataChangedEvent<TData>>;
    /** @deprecated v28 No longer fired, use onRowDataUpdated instead     */
    rowDataChanged: EventEmitter<RowDataChangedEvent<TData>>;
    /** The client has updated data for the grid by either a) setting new Row Data or b) Applying a Row Transaction.     */
    rowDataUpdated: EventEmitter<RowDataUpdatedEvent<TData>>;
    /** Async transactions have been applied. Contains a list of all transaction results.     */
    asyncTransactionsFlushed: EventEmitter<AsyncTransactionsFlushed<TData>>;
    /** Cell is clicked.     */
    cellClicked: EventEmitter<CellClickedEvent<TData>>;
    /** Cell is double clicked.     */
    cellDoubleClicked: EventEmitter<CellDoubleClickedEvent<TData>>;
    /** Cell is focused.     */
    cellFocused: EventEmitter<CellFocusedEvent<TData>>;
    /** Mouse entered cell.     */
    cellMouseOver: EventEmitter<CellMouseOverEvent<TData>>;
    /** Mouse left cell.     */
    cellMouseOut: EventEmitter<CellMouseOutEvent<TData>>;
    /** Mouse down on cell.     */
    cellMouseDown: EventEmitter<CellMouseDownEvent<TData>>;
    /** Row is clicked.     */
    rowClicked: EventEmitter<RowClickedEvent<TData>>;
    /** Row is double clicked.     */
    rowDoubleClicked: EventEmitter<RowDoubleClickedEvent<TData>>;
    /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected.     */
    rowSelected: EventEmitter<RowSelectedEvent<TData>>;
    /** Row selection is changed. Use the grid API `getSelectedNodes()` or `getSelectedRows()` to get the new list of selected nodes / row data.     */
    selectionChanged: EventEmitter<SelectionChangedEvent<TData>>;
    /** Cell is right clicked.     */
    cellContextMenu: EventEmitter<CellContextMenuEvent<TData>>;
    /** A change to range selection has occurred.     */
    rangeSelectionChanged: EventEmitter<RangeSelectionChangedEvent<TData>>;
    /** Sort has changed. The grid also listens for this and updates the model.     */
    sortChanged: EventEmitter<SortChangedEvent<TData>>;
    columnRowGroupChangeRequest: EventEmitter<ColumnRowGroupChangeRequestEvent<TData>>;
    columnPivotChangeRequest: EventEmitter<ColumnPivotChangeRequestEvent<TData>>;
    columnValueChangeRequest: EventEmitter<ColumnValueChangeRequestEvent<TData>>;
    columnAggFuncChangeRequest: EventEmitter<ColumnAggFuncChangeRequestEvent<TData>>;
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
    static ngAcceptInputType_groupSelectsChildren: boolean | null | '';
    static ngAcceptInputType_groupIncludeFooter: boolean | null | '';
    static ngAcceptInputType_groupIncludeTotalFooter: boolean | null | '';
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
    static ngAcceptInputType_suppressRowGroupHidesColumns: boolean | null | '';
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
    static ngAcceptInputType_suppressPaginationPanel: boolean | null | '';
    static ngAcceptInputType_groupHideOpenParents: boolean | null | '';
    static ngAcceptInputType_groupAllowUnbalanced: boolean | null | '';
    static ngAcceptInputType_pagination: boolean | null | '';
    static ngAcceptInputType_paginationAutoPageSize: boolean | null | '';
    static ngAcceptInputType_suppressScrollOnNewData: boolean | null | '';
    static ngAcceptInputType_suppressScrollWhenPopupsAreOpen: boolean | null | '';
    static ngAcceptInputType_purgeClosedRowNodes: boolean | null | '';
    static ngAcceptInputType_cacheQuickFilter: boolean | null | '';
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
    static ngAcceptInputType_suppressRowHoverHighlight: boolean | null | '';
    static ngAcceptInputType_suppressRowTransform: boolean | null | '';
    static ngAcceptInputType_suppressClipboardPaste: boolean | null | '';
    static ngAcceptInputType_suppressLastEmptyLineOnPaste: boolean | null | '';
    static ngAcceptInputType_enableCharts: boolean | null | '';
    static ngAcceptInputType_enableChartToolPanelsButton: boolean | null | '';
    static ngAcceptInputType_suppressChartToolPanelsButton: boolean | null | '';
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
    static ngAcceptInputType_pivotSuppressAutoColumn: boolean | null | '';
    static ngAcceptInputType_suppressExpandablePivotGroups: boolean | null | '';
    static ngAcceptInputType_debounceVerticalScrollbar: boolean | null | '';
    static ngAcceptInputType_detailRowAutoHeight: boolean | null | '';
    static ngAcceptInputType_serverSideFilteringAlwaysResets: boolean | null | '';
    static ngAcceptInputType_serverSideSortingAlwaysResets: boolean | null | '';
    static ngAcceptInputType_serverSideSortAllLevels: boolean | null | '';
    static ngAcceptInputType_serverSideFilterAllLevels: boolean | null | '';
    static ngAcceptInputType_serverSideSortOnServer: boolean | null | '';
    static ngAcceptInputType_serverSideFilterOnServer: boolean | null | '';
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
    static ngAcceptInputType_enableCellEditingOnBackspace: boolean | null | '';
    static ngAcceptInputType_resetRowDataOnUpdate: boolean | null | '';
    static ngAcceptInputType_removePivotHeaderRowWhenSingleValueColumn: boolean | null | '';
    static ngAcceptInputType_suppressCopySingleCellRanges: boolean | null | '';
    static ngAcceptInputType_groupRowsSticky: boolean | null | '';
    static ngAcceptInputType_suppressServerSideInfiniteScroll: boolean | null | '';
    static ngAcceptInputType_rowGroupPanelSuppressSort: boolean | null | '';
    static ngAcceptInputType_allowShowChangeAfterFilter: boolean | null | '';
    static ɵfac: i0.ɵɵFactoryDeclaration<AgGridAngular<any, any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AgGridAngular<any, any>, "ag-grid-angular", never, { "gridOptions": "gridOptions"; "modules": "modules"; "statusBar": "statusBar"; "sideBar": "sideBar"; "suppressContextMenu": "suppressContextMenu"; "preventDefaultOnContextMenu": "preventDefaultOnContextMenu"; "allowContextMenuWithControlKey": "allowContextMenuWithControlKey"; "suppressMenuHide": "suppressMenuHide"; "enableBrowserTooltips": "enableBrowserTooltips"; "tooltipShowDelay": "tooltipShowDelay"; "tooltipHideDelay": "tooltipHideDelay"; "tooltipMouseTrack": "tooltipMouseTrack"; "popupParent": "popupParent"; "copyHeadersToClipboard": "copyHeadersToClipboard"; "copyGroupHeadersToClipboard": "copyGroupHeadersToClipboard"; "clipboardDelimiter": "clipboardDelimiter"; "suppressCopyRowsToClipboard": "suppressCopyRowsToClipboard"; "suppressCopySingleCellRanges": "suppressCopySingleCellRanges"; "suppressLastEmptyLineOnPaste": "suppressLastEmptyLineOnPaste"; "suppressClipboardPaste": "suppressClipboardPaste"; "suppressClipboardApi": "suppressClipboardApi"; "columnDefs": "columnDefs"; "defaultColDef": "defaultColDef"; "defaultColGroupDef": "defaultColGroupDef"; "columnTypes": "columnTypes"; "maintainColumnOrder": "maintainColumnOrder"; "suppressFieldDotNotation": "suppressFieldDotNotation"; "headerHeight": "headerHeight"; "groupHeaderHeight": "groupHeaderHeight"; "floatingFiltersHeight": "floatingFiltersHeight"; "pivotHeaderHeight": "pivotHeaderHeight"; "pivotGroupHeaderHeight": "pivotGroupHeaderHeight"; "allowDragFromColumnsToolPanel": "allowDragFromColumnsToolPanel"; "suppressMovableColumns": "suppressMovableColumns"; "suppressColumnMoveAnimation": "suppressColumnMoveAnimation"; "suppressDragLeaveHidesColumns": "suppressDragLeaveHidesColumns"; "suppressRowGroupHidesColumns": "suppressRowGroupHidesColumns"; "colResizeDefault": "colResizeDefault"; "suppressAutoSize": "suppressAutoSize"; "autoSizePadding": "autoSizePadding"; "skipHeaderOnAutoSize": "skipHeaderOnAutoSize"; "components": "components"; "frameworkComponents": "frameworkComponents"; "editType": "editType"; "singleClickEdit": "singleClickEdit"; "suppressClickEdit": "suppressClickEdit"; "readOnlyEdit": "readOnlyEdit"; "stopEditingWhenCellsLoseFocus": "stopEditingWhenCellsLoseFocus"; "enterMovesDown": "enterMovesDown"; "enterMovesDownAfterEdit": "enterMovesDownAfterEdit"; "enableCellEditingOnBackspace": "enableCellEditingOnBackspace"; "undoRedoCellEditing": "undoRedoCellEditing"; "undoRedoCellEditingLimit": "undoRedoCellEditingLimit"; "defaultCsvExportParams": "defaultCsvExportParams"; "suppressCsvExport": "suppressCsvExport"; "defaultExcelExportParams": "defaultExcelExportParams"; "suppressExcelExport": "suppressExcelExport"; "excelStyles": "excelStyles"; "quickFilterText": "quickFilterText"; "cacheQuickFilter": "cacheQuickFilter"; "excludeChildrenWhenTreeDataFiltering": "excludeChildrenWhenTreeDataFiltering"; "enableCharts": "enableCharts"; "chartThemes": "chartThemes"; "customChartThemes": "customChartThemes"; "chartThemeOverrides": "chartThemeOverrides"; "enableChartToolPanelsButton": "enableChartToolPanelsButton"; "suppressChartToolPanelsButton": "suppressChartToolPanelsButton"; "chartToolPanelsDef": "chartToolPanelsDef"; "loadingCellRenderer": "loadingCellRenderer"; "loadingCellRendererFramework": "loadingCellRendererFramework"; "loadingCellRendererParams": "loadingCellRendererParams"; "loadingCellRendererSelector": "loadingCellRendererSelector"; "localeText": "localeText"; "masterDetail": "masterDetail"; "keepDetailRows": "keepDetailRows"; "keepDetailRowsCount": "keepDetailRowsCount"; "detailCellRenderer": "detailCellRenderer"; "detailCellRendererFramework": "detailCellRendererFramework"; "detailCellRendererParams": "detailCellRendererParams"; "detailRowHeight": "detailRowHeight"; "detailRowAutoHeight": "detailRowAutoHeight"; "context": "context"; "alignedGrids": "alignedGrids"; "tabIndex": "tabIndex"; "rowBuffer": "rowBuffer"; "valueCache": "valueCache"; "valueCacheNeverExpires": "valueCacheNeverExpires"; "enableCellExpressions": "enableCellExpressions"; "suppressParentsInRowNodes": "suppressParentsInRowNodes"; "suppressTouch": "suppressTouch"; "suppressFocusAfterRefresh": "suppressFocusAfterRefresh"; "suppressAsyncEvents": "suppressAsyncEvents"; "suppressBrowserResizeObserver": "suppressBrowserResizeObserver"; "suppressPropertyNamesCheck": "suppressPropertyNamesCheck"; "suppressChangeDetection": "suppressChangeDetection"; "debug": "debug"; "overlayLoadingTemplate": "overlayLoadingTemplate"; "loadingOverlayComponent": "loadingOverlayComponent"; "loadingOverlayComponentFramework": "loadingOverlayComponentFramework"; "loadingOverlayComponentParams": "loadingOverlayComponentParams"; "suppressLoadingOverlay": "suppressLoadingOverlay"; "overlayNoRowsTemplate": "overlayNoRowsTemplate"; "noRowsOverlayComponent": "noRowsOverlayComponent"; "noRowsOverlayComponentFramework": "noRowsOverlayComponentFramework"; "noRowsOverlayComponentParams": "noRowsOverlayComponentParams"; "suppressNoRowsOverlay": "suppressNoRowsOverlay"; "pagination": "pagination"; "paginationPageSize": "paginationPageSize"; "paginationAutoPageSize": "paginationAutoPageSize"; "paginateChildRows": "paginateChildRows"; "suppressPaginationPanel": "suppressPaginationPanel"; "pivotMode": "pivotMode"; "pivotPanelShow": "pivotPanelShow"; "pivotColumnGroupTotals": "pivotColumnGroupTotals"; "pivotRowTotals": "pivotRowTotals"; "pivotSuppressAutoColumn": "pivotSuppressAutoColumn"; "suppressExpandablePivotGroups": "suppressExpandablePivotGroups"; "functionsReadOnly": "functionsReadOnly"; "aggFuncs": "aggFuncs"; "suppressAggFuncInHeader": "suppressAggFuncInHeader"; "suppressAggAtRootLevel": "suppressAggAtRootLevel"; "aggregateOnlyChangedColumns": "aggregateOnlyChangedColumns"; "suppressAggFilteredOnly": "suppressAggFilteredOnly"; "removePivotHeaderRowWhenSingleValueColumn": "removePivotHeaderRowWhenSingleValueColumn"; "animateRows": "animateRows"; "enableCellChangeFlash": "enableCellChangeFlash"; "cellFlashDelay": "cellFlashDelay"; "cellFadeDelay": "cellFadeDelay"; "allowShowChangeAfterFilter": "allowShowChangeAfterFilter"; "domLayout": "domLayout"; "ensureDomOrder": "ensureDomOrder"; "enableRtl": "enableRtl"; "suppressColumnVirtualisation": "suppressColumnVirtualisation"; "suppressMaxRenderedRowRestriction": "suppressMaxRenderedRowRestriction"; "suppressRowVirtualisation": "suppressRowVirtualisation"; "rowDragManaged": "rowDragManaged"; "suppressRowDrag": "suppressRowDrag"; "suppressMoveWhenRowDragging": "suppressMoveWhenRowDragging"; "rowDragEntireRow": "rowDragEntireRow"; "rowDragMultiRow": "rowDragMultiRow"; "rowDragText": "rowDragText"; "fullWidthCellRenderer": "fullWidthCellRenderer"; "fullWidthCellRendererFramework": "fullWidthCellRendererFramework"; "fullWidthCellRendererParams": "fullWidthCellRendererParams"; "embedFullWidthRows": "embedFullWidthRows"; "groupDisplayType": "groupDisplayType"; "groupDefaultExpanded": "groupDefaultExpanded"; "autoGroupColumnDef": "autoGroupColumnDef"; "groupMaintainOrder": "groupMaintainOrder"; "groupSelectsChildren": "groupSelectsChildren"; "groupAggFiltering": "groupAggFiltering"; "groupIncludeFooter": "groupIncludeFooter"; "groupIncludeTotalFooter": "groupIncludeTotalFooter"; "groupSuppressBlankHeader": "groupSuppressBlankHeader"; "groupSelectsFiltered": "groupSelectsFiltered"; "showOpenedGroup": "showOpenedGroup"; "groupRemoveSingleChildren": "groupRemoveSingleChildren"; "groupRemoveLowestSingleChildren": "groupRemoveLowestSingleChildren"; "groupHideOpenParents": "groupHideOpenParents"; "groupAllowUnbalanced": "groupAllowUnbalanced"; "rowGroupPanelShow": "rowGroupPanelShow"; "groupRowRenderer": "groupRowRenderer"; "groupRowRendererFramework": "groupRowRendererFramework"; "groupRowRendererParams": "groupRowRendererParams"; "suppressMakeColumnVisibleAfterUnGroup": "suppressMakeColumnVisibleAfterUnGroup"; "treeData": "treeData"; "rowGroupPanelSuppressSort": "rowGroupPanelSuppressSort"; "groupRowsSticky": "groupRowsSticky"; "rememberGroupStateWhenNewData": "rememberGroupStateWhenNewData"; "pinnedTopRowData": "pinnedTopRowData"; "pinnedBottomRowData": "pinnedBottomRowData"; "rowModelType": "rowModelType"; "rowData": "rowData"; "immutableData": "immutableData"; "asyncTransactionWaitMillis": "asyncTransactionWaitMillis"; "suppressModelUpdateAfterUpdateTransaction": "suppressModelUpdateAfterUpdateTransaction"; "datasource": "datasource"; "cacheOverflowSize": "cacheOverflowSize"; "infiniteInitialRowCount": "infiniteInitialRowCount"; "serverSideInitialRowCount": "serverSideInitialRowCount"; "serverSideStoreType": "serverSideStoreType"; "suppressServerSideInfiniteScroll": "suppressServerSideInfiniteScroll"; "cacheBlockSize": "cacheBlockSize"; "maxBlocksInCache": "maxBlocksInCache"; "maxConcurrentDatasourceRequests": "maxConcurrentDatasourceRequests"; "blockLoadDebounceMillis": "blockLoadDebounceMillis"; "purgeClosedRowNodes": "purgeClosedRowNodes"; "serverSideDatasource": "serverSideDatasource"; "serverSideSortAllLevels": "serverSideSortAllLevels"; "serverSideFilterAllLevels": "serverSideFilterAllLevels"; "serverSideSortOnServer": "serverSideSortOnServer"; "serverSideFilterOnServer": "serverSideFilterOnServer"; "serverSideSortingAlwaysResets": "serverSideSortingAlwaysResets"; "serverSideFilteringAlwaysResets": "serverSideFilteringAlwaysResets"; "viewportDatasource": "viewportDatasource"; "viewportRowModelPageSize": "viewportRowModelPageSize"; "viewportRowModelBufferSize": "viewportRowModelBufferSize"; "alwaysShowHorizontalScroll": "alwaysShowHorizontalScroll"; "alwaysShowVerticalScroll": "alwaysShowVerticalScroll"; "debounceVerticalScrollbar": "debounceVerticalScrollbar"; "suppressHorizontalScroll": "suppressHorizontalScroll"; "suppressScrollOnNewData": "suppressScrollOnNewData"; "suppressScrollWhenPopupsAreOpen": "suppressScrollWhenPopupsAreOpen"; "suppressAnimationFrame": "suppressAnimationFrame"; "suppressMiddleClickScrolls": "suppressMiddleClickScrolls"; "suppressPreventDefaultOnMouseWheel": "suppressPreventDefaultOnMouseWheel"; "scrollbarWidth": "scrollbarWidth"; "rowSelection": "rowSelection"; "rowMultiSelectWithClick": "rowMultiSelectWithClick"; "suppressRowDeselection": "suppressRowDeselection"; "suppressRowClickSelection": "suppressRowClickSelection"; "suppressCellSelection": "suppressCellSelection"; "suppressCellFocus": "suppressCellFocus"; "suppressMultiRangeSelection": "suppressMultiRangeSelection"; "enableCellTextSelection": "enableCellTextSelection"; "enableRangeSelection": "enableRangeSelection"; "enableRangeHandle": "enableRangeHandle"; "enableFillHandle": "enableFillHandle"; "fillHandleDirection": "fillHandleDirection"; "suppressClearOnFillReduction": "suppressClearOnFillReduction"; "sortingOrder": "sortingOrder"; "accentedSort": "accentedSort"; "unSortIcon": "unSortIcon"; "suppressMultiSort": "suppressMultiSort"; "alwaysMultiSort": "alwaysMultiSort"; "multiSortKey": "multiSortKey"; "suppressMaintainUnsortedOrder": "suppressMaintainUnsortedOrder"; "icons": "icons"; "rowHeight": "rowHeight"; "rowStyle": "rowStyle"; "rowClass": "rowClass"; "rowClassRules": "rowClassRules"; "suppressRowHoverHighlight": "suppressRowHoverHighlight"; "suppressRowTransform": "suppressRowTransform"; "columnHoverHighlight": "columnHoverHighlight"; "deltaSort": "deltaSort"; "treeDataDisplayType": "treeDataDisplayType"; "functionsPassive": "functionsPassive"; "enableGroupEdit": "enableGroupEdit"; "getContextMenuItems": "getContextMenuItems"; "getMainMenuItems": "getMainMenuItems"; "postProcessPopup": "postProcessPopup"; "processCellForClipboard": "processCellForClipboard"; "processHeaderForClipboard": "processHeaderForClipboard"; "processGroupHeaderForClipboard": "processGroupHeaderForClipboard"; "processCellFromClipboard": "processCellFromClipboard"; "sendToClipboard": "sendToClipboard"; "processDataFromClipboard": "processDataFromClipboard"; "isExternalFilterPresent": "isExternalFilterPresent"; "doesExternalFilterPass": "doesExternalFilterPass"; "getChartToolbarItems": "getChartToolbarItems"; "createChartContainer": "createChartContainer"; "navigateToNextHeader": "navigateToNextHeader"; "tabToNextHeader": "tabToNextHeader"; "navigateToNextCell": "navigateToNextCell"; "tabToNextCell": "tabToNextCell"; "localeTextFunc": "localeTextFunc"; "getLocaleText": "getLocaleText"; "getDocument": "getDocument"; "paginationNumberFormatter": "paginationNumberFormatter"; "groupRowAggNodes": "groupRowAggNodes"; "getGroupRowAgg": "getGroupRowAgg"; "isGroupOpenByDefault": "isGroupOpenByDefault"; "initialGroupOrderComparator": "initialGroupOrderComparator"; "defaultGroupOrderComparator": "defaultGroupOrderComparator"; "processSecondaryColDef": "processSecondaryColDef"; "processSecondaryColGroupDef": "processSecondaryColGroupDef"; "processPivotResultColDef": "processPivotResultColDef"; "processPivotResultColGroupDef": "processPivotResultColGroupDef"; "getDataPath": "getDataPath"; "getChildCount": "getChildCount"; "getServerSideGroupLevelParams": "getServerSideGroupLevelParams"; "getServerSideStoreParams": "getServerSideStoreParams"; "isServerSideGroupOpenByDefault": "isServerSideGroupOpenByDefault"; "isApplyServerSideTransaction": "isApplyServerSideTransaction"; "isServerSideGroup": "isServerSideGroup"; "getServerSideGroupKey": "getServerSideGroupKey"; "getBusinessKeyForNode": "getBusinessKeyForNode"; "getRowNodeId": "getRowNodeId"; "getRowId": "getRowId"; "resetRowDataOnUpdate": "resetRowDataOnUpdate"; "processRowPostCreate": "processRowPostCreate"; "isRowSelectable": "isRowSelectable"; "isRowMaster": "isRowMaster"; "fillOperation": "fillOperation"; "postSort": "postSort"; "postSortRows": "postSortRows"; "getRowStyle": "getRowStyle"; "getRowClass": "getRowClass"; "getRowHeight": "getRowHeight"; "isFullWidthCell": "isFullWidthCell"; "isFullWidthRow": "isFullWidthRow"; }, { "toolPanelVisibleChanged": "toolPanelVisibleChanged"; "toolPanelSizeChanged": "toolPanelSizeChanged"; "pasteStart": "pasteStart"; "pasteEnd": "pasteEnd"; "columnVisible": "columnVisible"; "columnPinned": "columnPinned"; "columnResized": "columnResized"; "columnMoved": "columnMoved"; "columnValueChanged": "columnValueChanged"; "columnPivotModeChanged": "columnPivotModeChanged"; "columnPivotChanged": "columnPivotChanged"; "columnGroupOpened": "columnGroupOpened"; "newColumnsLoaded": "newColumnsLoaded"; "gridColumnsChanged": "gridColumnsChanged"; "displayedColumnsChanged": "displayedColumnsChanged"; "virtualColumnsChanged": "virtualColumnsChanged"; "columnEverythingChanged": "columnEverythingChanged"; "componentStateChanged": "componentStateChanged"; "cellValueChanged": "cellValueChanged"; "cellEditRequest": "cellEditRequest"; "rowValueChanged": "rowValueChanged"; "cellEditingStarted": "cellEditingStarted"; "cellEditingStopped": "cellEditingStopped"; "rowEditingStarted": "rowEditingStarted"; "rowEditingStopped": "rowEditingStopped"; "filterOpened": "filterOpened"; "filterChanged": "filterChanged"; "filterModified": "filterModified"; "chartCreated": "chartCreated"; "chartRangeSelectionChanged": "chartRangeSelectionChanged"; "chartOptionsChanged": "chartOptionsChanged"; "chartDestroyed": "chartDestroyed"; "cellKeyDown": "cellKeyDown"; "cellKeyPress": "cellKeyPress"; "gridReady": "gridReady"; "firstDataRendered": "firstDataRendered"; "gridSizeChanged": "gridSizeChanged"; "modelUpdated": "modelUpdated"; "virtualRowRemoved": "virtualRowRemoved"; "viewportChanged": "viewportChanged"; "bodyScroll": "bodyScroll"; "bodyScrollEnd": "bodyScrollEnd"; "dragStarted": "dragStarted"; "dragStopped": "dragStopped"; "paginationChanged": "paginationChanged"; "rowDragEnter": "rowDragEnter"; "rowDragMove": "rowDragMove"; "rowDragLeave": "rowDragLeave"; "rowDragEnd": "rowDragEnd"; "columnRowGroupChanged": "columnRowGroupChanged"; "rowGroupOpened": "rowGroupOpened"; "expandOrCollapseAll": "expandOrCollapseAll"; "pinnedRowDataChanged": "pinnedRowDataChanged"; "rowDataChanged": "rowDataChanged"; "rowDataUpdated": "rowDataUpdated"; "asyncTransactionsFlushed": "asyncTransactionsFlushed"; "cellClicked": "cellClicked"; "cellDoubleClicked": "cellDoubleClicked"; "cellFocused": "cellFocused"; "cellMouseOver": "cellMouseOver"; "cellMouseOut": "cellMouseOut"; "cellMouseDown": "cellMouseDown"; "rowClicked": "rowClicked"; "rowDoubleClicked": "rowDoubleClicked"; "rowSelected": "rowSelected"; "selectionChanged": "selectionChanged"; "cellContextMenu": "cellContextMenu"; "rangeSelectionChanged": "rangeSelectionChanged"; "sortChanged": "sortChanged"; "columnRowGroupChangeRequest": "columnRowGroupChangeRequest"; "columnPivotChangeRequest": "columnPivotChangeRequest"; "columnValueChangeRequest": "columnValueChangeRequest"; "columnAggFuncChangeRequest": "columnAggFuncChangeRequest"; }, never, never>;
}
