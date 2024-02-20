import { AfterViewInit, ElementRef, EventEmitter, OnChanges, OnDestroy, ViewContainerRef } from "@angular/core";
import { GridApi, ColumnApi, GridOptions, Module } from "ag-grid-community";
import { AdvancedFilterBuilderVisibleChangedEvent, AdvancedFilterModel, AgChartTheme, AgChartThemeOverrides, AlignedGrid, AsyncTransactionsFlushed, BodyScrollEndEvent, BodyScrollEvent, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditRequestEvent, CellEditingStartedEvent, CellEditingStoppedEvent, CellFocusedEvent, CellKeyDownEvent, CellMouseDownEvent, CellMouseOutEvent, CellMouseOverEvent, CellPosition, CellValueChangedEvent, ChartCreated, ChartDestroyed, ChartOptionsChanged, ChartRangeSelectionChanged, ChartRefParams, ChartToolPanelsDef, ColDef, ColGroupDef, ColTypeDef, Column, ColumnAggFuncChangeRequestEvent, ColumnEverythingChangedEvent, ColumnGroupOpenedEvent, ColumnHeaderClickedEvent, ColumnHeaderContextMenuEvent, ColumnHeaderMouseLeaveEvent, ColumnHeaderMouseOverEvent, ColumnMenuVisibleChangedEvent, ColumnMovedEvent, ColumnPinnedEvent, ColumnPivotChangeRequestEvent, ColumnPivotChangedEvent, ColumnPivotModeChangedEvent, ColumnResizedEvent, ColumnRowGroupChangeRequestEvent, ColumnRowGroupChangedEvent, ColumnValueChangeRequestEvent, ColumnValueChangedEvent, ColumnVisibleEvent, ComponentStateChangedEvent, CsvExportParams, CutEndEvent, CutStartEvent, DataTypeDefinition, DisplayedColumnsChangedEvent, DomLayoutType, DragStartedEvent, DragStoppedEvent, ExcelExportParams, ExcelStyle, ExpandCollapseAllEvent, FillOperationParams, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent, FirstDataRenderedEvent, FullWidthCellKeyDownEvent, GetChartToolbarItems, GetContextMenuItems, GetDataPath, GetGroupRowAggParams, GetLocaleTextParams, GetMainMenuItems, GetRowIdFunc, GetServerSideGroupKey, GetServerSideGroupLevelParamsParams, GridColumnsChangedEvent, GridPreDestroyedEvent, GridReadyEvent, GridSizeChangedEvent, GridState, HeaderPosition, IAdvancedFilterBuilderParams, IAggFunc, IDatasource, IRowDragItem, IRowNode, IServerSideDatasource, IViewportDatasource, InitialGroupOrderComparatorParams, IsApplyServerSideTransaction, IsExternalFilterPresentParams, IsFullWidthRowParams, IsGroupOpenByDefaultParams, IsRowFilterable, IsRowMaster, IsRowSelectable, IsServerSideGroup, IsServerSideGroupOpenByDefaultParams, LoadingCellRendererSelectorFunc, ModelUpdatedEvent, NavigateToNextCellParams, NavigateToNextHeaderParams, NewColumnsLoadedEvent, PaginationChangedEvent, PaginationNumberFormatterParams, PasteEndEvent, PasteStartEvent, PinnedRowDataChangedEvent, PostProcessPopupParams, PostSortRowsParams, ProcessCellForExportParams, ProcessDataFromClipboardParams, ProcessGroupHeaderForExportParams, ProcessHeaderForExportParams, ProcessRowParams, ProcessUnpinnedColumnsParams, RangeDeleteEndEvent, RangeDeleteStartEvent, RangeSelectionChangedEvent, RedoEndedEvent, RedoStartedEvent, RowClassParams, RowClassRules, RowClickedEvent, RowDataUpdatedEvent, RowDoubleClickedEvent, RowDragEvent, RowEditingStartedEvent, RowEditingStoppedEvent, RowGroupOpenedEvent, RowGroupingDisplayType, RowHeightParams, RowModelType, RowSelectedEvent, RowStyle, RowValueChangedEvent, SelectionChangedEvent, SendToClipboardParams, ServerSideGroupLevelParams, SideBarDef, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy, SortChangedEvent, SortDirection, StateUpdatedEvent, StatusPanelDef, StoreRefreshedEvent, TabToNextCellParams, TabToNextHeaderParams, ToolPanelSizeChangedEvent, ToolPanelVisibleChangedEvent, TooltipHideEvent, TooltipShowEvent, TreeDataDisplayType, UndoEndedEvent, UndoStartedEvent, UseGroupFooter, ViewportChangedEvent, VirtualColumnsChangedEvent, VirtualRowRemovedEvent } from "ag-grid-community";
import { AngularFrameworkOverrides } from "./angularFrameworkOverrides";
import { AngularFrameworkComponentWrapper } from "./angularFrameworkComponentWrapper";
import * as i0 from "@angular/core";
export declare class AgGridAngular<TData = any, TColDef extends ColDef<TData> = ColDef<any>> implements AfterViewInit, OnChanges, OnDestroy {
    private viewContainerRef;
    private angularFrameworkOverrides;
    private frameworkComponentWrapper;
    private _nativeElement;
    private _initialised;
    private _destroyed;
    private gridParams;
    private _fullyReady;
    /** Grid Api available after onGridReady event has fired. */
    api: GridApi<TData>;
    /**
     * @deprecated v31 - The `columnApi` has been deprecated and all the methods are now present of the `api`.
     * Please use the `api` instead.
     */
    columnApi: ColumnApi;
    constructor(elementDef: ElementRef, viewContainerRef: ViewContainerRef, angularFrameworkOverrides: AngularFrameworkOverrides, frameworkComponentWrapper: AngularFrameworkComponentWrapper);
    ngAfterViewInit(): void;
    ngOnChanges(changes: any): void;
    ngOnDestroy(): void;
    protected isEmitterUsed(eventType: string): boolean;
    private globalEventListener;
    /** Provided an initial gridOptions configuration to the component. If a property is specified in both gridOptions and via component binding the component binding takes precedence.  */
    gridOptions: GridOptions<TData> | undefined;
    /**
    * Used to register AG Grid Modules directly with this instance of the grid.
    * See [Providing Modules To Individual Grids](https://www.ag-grid.com/angular-data-grid/modules/#providing-modules-to-individual-grids) for more information.
    */
    modules: Module[] | undefined;
    /** Specifies the status bar components to use in the status bar.
         */
    statusBar: {
        statusPanels: StatusPanelDef[];
    } | undefined;
    /** Specifies the side bar components.
         */
    sideBar: SideBarDef | string | string[] | boolean | null | undefined;
    /** Set to `true` to not show the context menu. Use if you don't want to use the default 'right click' context menu.
         * @default false
         */
    suppressContextMenu: boolean | undefined;
    /** When using `suppressContextMenu`, you can use the `onCellContextMenu` function to provide your own code to handle cell `contextmenu` events.
         * This flag is useful to prevent the browser from showing its default context menu.
         * @default false
         */
    preventDefaultOnContextMenu: boolean | undefined;
    /** Allows context menu to show, even when `Ctrl` key is held down.
         * @default false
         */
    allowContextMenuWithControlKey: boolean | undefined;
    /** Changes the display type of the column menu.
         * `'new'` just displays the main list of menu items. `'legacy'` displays a tabbed menu.
         * @default 'legacy'
         * @initial
         */
    columnMenu: 'legacy' | 'new' | undefined;
    /** Set to `true` to always show the column menu button, rather than only showing when the mouse is over the column header.
         * If `columnMenu = 'new'`, this will default to `true` instead of `false`.
         * @default false
         */
    suppressMenuHide: boolean | undefined;
    /** Set to `true` to use the browser's default tooltip instead of using the grid's Tooltip Component.
         * @default false
         * @initial
         */
    enableBrowserTooltips: boolean | undefined;
    /** The trigger that will cause tooltips to show and hide.
         *  - `hover` - The tooltip will show/hide when a cell/header is hovered.
         *  - `focus` - The tooltip will show/hide when a cell/header is focused.
         * @default 'hover'
         * @initial
         */
    tooltipTrigger: 'hover' | 'focus' | undefined;
    /** The delay in milliseconds that it takes for tooltips to show up once an element is hovered over.
         *     **Note:** This property does not work if `enableBrowserTooltips` is `true`.
         * @default 2000
         */
    tooltipShowDelay: number | undefined;
    /** The delay in milliseconds that it takes for tooltips to hide once they have been displayed.
         *     **Note:** This property does not work if `enableBrowserTooltips` is `true` and `tooltipHideTriggers` includes `timeout`.
         * @default 10000
         */
    tooltipHideDelay: number | undefined;
    /** Set to `true` to have tooltips follow the cursor once they are displayed.
         * @default false
         * @initial
         */
    tooltipMouseTrack: boolean | undefined;
    /** Set to `true` to enable tooltip interaction. When this option is enabled, the tooltip will not hide while the
         * tooltip itself it being hovered or has focus.
         * @default false
         * @initial
         */
    tooltipInteraction: boolean | undefined;
    /** DOM element to use as the popup parent for grid popups (context menu, column menu etc).
         */
    popupParent: HTMLElement | null | undefined;
    /** Set to `true` to also include headers when copying to clipboard using `Ctrl + C` clipboard.
         * @default false
         */
    copyHeadersToClipboard: boolean | undefined;
    /** Set to `true` to also include group headers when copying to clipboard using `Ctrl + C` clipboard.
         * @default false
         */
    copyGroupHeadersToClipboard: boolean | undefined;
    /** Specify the delimiter to use when copying to clipboard.
         * @default '\t'
        */
    clipboardDelimiter: string | undefined;
    /** Set to `true` to copy the cell range or focused cell to the clipboard and never the selected rows.
         * @default false
         */
    suppressCopyRowsToClipboard: boolean | undefined;
    /** Set to `true` to copy rows instead of ranges when a range with only a single cell is selected.
         * @default false
         */
    suppressCopySingleCellRanges: boolean | undefined;
    /** Set to `true` to work around a bug with Excel (Windows) that adds an extra empty line at the end of ranges copied to the clipboard.
         * @default false
         */
    suppressLastEmptyLineOnPaste: boolean | undefined;
    /** Set to `true` to turn off paste operations within the grid.
         * @default false
         */
    suppressClipboardPaste: boolean | undefined;
    /** Set to `true` to stop the grid trying to use the Clipboard API, if it is blocked, and immediately fallback to the workaround.
         * @default false
         */
    suppressClipboardApi: boolean | undefined;
    /** Set to `true` to block     **cut** operations within the grid.
         * @default false
         */
    suppressCutToClipboard: boolean | undefined;
    /** Array of Column / Column Group definitions.
         */
    columnDefs: (TColDef | ColGroupDef<TData>)[] | null | undefined;
    /** A default column definition. Items defined in the actual column definitions get precedence.
         */
    defaultColDef: ColDef<TData> | undefined;
    /** A default column group definition. All column group definitions will use these properties. Items defined in the actual column group definition get precedence.
         * @initial
         */
    defaultColGroupDef: Partial<ColGroupDef<TData>> | undefined;
    /** An object map of custom column types which contain groups of properties that column definitions can reuse by referencing in their `type` property.
         */
    columnTypes: {
        [key: string]: ColTypeDef<TData>;
    } | undefined;
    /** An object map of cell data types to their definitions.
         * Cell data types can either override/update the pre-defined data types
         * (`'text'`, `'number'`,  `'boolean'`,  `'date'`,  `'dateString'` or  `'object'`),
         * or can be custom data types.
         */
    dataTypeDefinitions: {
        [cellDataType: string]: DataTypeDefinition<TData>;
    } | undefined;
    /** Keeps the order of Columns maintained after new Column Definitions are updated.
         * @default false
         */
    maintainColumnOrder: boolean | undefined;
    /** If `true`, then dots in field names (e.g. `'address.firstLine'`) are not treated as deep references. Allows you to use dots in your field name if you prefer.
         * @default false
         */
    suppressFieldDotNotation: boolean | undefined;
    /** The height in pixels for the row containing the column label header. If not specified, it uses the theme value of `header-height`.
         */
    headerHeight: number | undefined;
    /** The height in pixels for the rows containing header column groups. If not specified, it uses `headerHeight`.
         */
    groupHeaderHeight: number | undefined;
    /** The height in pixels for the row containing the floating filters. If not specified, it uses the theme value of `header-height`.
         */
    floatingFiltersHeight: number | undefined;
    /** The height in pixels for the row containing the columns when in pivot mode. If not specified, it uses `headerHeight`.
         */
    pivotHeaderHeight: number | undefined;
    /** The height in pixels for the row containing header column groups when in pivot mode. If not specified, it uses `groupHeaderHeight`.
         */
    pivotGroupHeaderHeight: number | undefined;
    /** Allow reordering and pinning columns by dragging columns from the Columns Tool Panel to the grid.
         * @default false
         */
    allowDragFromColumnsToolPanel: boolean | undefined;
    /** Set to `true` to suppress column moving, i.e. to make the columns fixed position.
         * @default false
         */
    suppressMovableColumns: boolean | undefined;
    /** If `true`, the `ag-column-moving` class is not added to the grid while columns are moving. In the default themes, this results in no animation when moving columns.
         * @default false
         */
    suppressColumnMoveAnimation: boolean | undefined;
    /** If `true`, when you drag a column out of the grid (e.g. to the group zone) the column is not hidden.
         * @default false
         */
    suppressDragLeaveHidesColumns: boolean | undefined;
    /** If `true`, when you drag a column into a row group panel the column is not hidden.
         * @default false
         */
    suppressRowGroupHidesColumns: boolean | undefined;
    /** Set to `'shift'` to have shift-resize as the default resize operation (same as user holding down `Shift` while resizing).
         */
    colResizeDefault: 'shift' | undefined;
    /** Suppresses auto-sizing columns for columns. In other words, double clicking a column's header's edge will not auto-size.
         * @default false
         * @initial
         */
    suppressAutoSize: boolean | undefined;
    /** Number of pixels to add to a column width after the [auto-sizing](/column-sizing/#auto-size-columns-to-fit-cell-contents) calculation.
         * Set this if you want to add extra room to accommodate (for example) sort icons, or some other dynamic nature of the header.
         * @default 20
         */
    autoSizePadding: number | undefined;
    /** Set this to `true` to skip the `headerName` when `autoSize` is called by default.
         * @default false
         * @initial
         */
    skipHeaderOnAutoSize: boolean | undefined;
    /** Auto-size the columns when the grid is loaded. Can size to fit the grid width, fit a provided width, or fit the cell contents.
         * @initial
         */
    autoSizeStrategy: SizeColumnsToFitGridStrategy | SizeColumnsToFitProvidedWidthStrategy | SizeColumnsToContentStrategy | undefined;
    /** A map of component names to components.
         * @initial
         */
    components: {
        [p: string]: any;
    } | undefined;
    /** Set to `'fullRow'` to enable Full Row Editing. Otherwise leave blank to edit one cell at a time.
         */
    editType: 'fullRow' | undefined;
    /** Set to `true` to enable Single Click Editing for cells, to start editing with a single click.
         * @default false
         */
    singleClickEdit: boolean | undefined;
    /** Set to `true` so that neither single nor double click starts editing.
         * @default false
         */
    suppressClickEdit: boolean | undefined;
    /** Set to `true` to stop the grid updating data after `Edit`, `Clipboard` and `Fill Handle` operations. When this is set, it is intended the application will update the data, eg in an external immutable store, and then pass the new dataset to the grid. <br />**Note:** `rowNode.setDataValue()` does not update the value of the cell when this is `True`, it fires `onCellEditRequest` instead.
         * @default false
         */
    readOnlyEdit: boolean | undefined;
    /** Set this to `true` to stop cell editing when grid loses focus.
         * The default is that the grid stays editing until focus goes onto another cell.
         * @default false
         * @initial
         */
    stopEditingWhenCellsLoseFocus: boolean | undefined;
    /** @deprecated As of v30, no longer used. To navigate with the Enter key use `enterNavigatesVertically`.
         */
    enterMovesDown: boolean | undefined;
    /** @deprecated As of v30, no longer used. To navigate with the Enter key after edit use `enterNavigatesVerticallyAfterEdit`.
         */
    enterMovesDownAfterEdit: boolean | undefined;
    /** Set to `true` along with `enterNavigatesVerticallyAfterEdit` to have Excel-style behaviour for the `Enter` key.
         * i.e. pressing the `Enter` key will move down to the cell beneath and `Shift+Enter` will move up to the cell above.
         * @default false
         */
    enterNavigatesVertically: boolean | undefined;
    /** Set to `true` along with `enterNavigatesVertically` to have Excel-style behaviour for the 'Enter' key.
         * i.e. pressing the Enter key will move down to the cell beneath and Shift+Enter key will move up to the cell above.
         * @default false
         */
    enterNavigatesVerticallyAfterEdit: boolean | undefined;
    /** Forces Cell Editing to start when backspace is pressed. This is only relevant for MacOS users.
         */
    enableCellEditingOnBackspace: boolean | undefined;
    /** Set to `true` to enable Undo / Redo while editing.
         * @initial
         */
    undoRedoCellEditing: boolean | undefined;
    /** Set the size of the undo / redo stack.
         * @default 10
         * @initial
         */
    undoRedoCellEditingLimit: number | undefined;
    /** A default configuration object used to export to CSV.
         */
    defaultCsvExportParams: CsvExportParams | undefined;
    /** Prevents the user from exporting the grid to CSV.
         * @default false
         */
    suppressCsvExport: boolean | undefined;
    /** A default configuration object used to export to Excel.
         */
    defaultExcelExportParams: ExcelExportParams | undefined;
    /** Prevents the user from exporting the grid to Excel.
         * @default false
         */
    suppressExcelExport: boolean | undefined;
    /** A list (array) of Excel styles to be used when exporting to Excel with styles.
         * @initial
         */
    excelStyles: ExcelStyle[] | undefined;
    /** Rows are filtered using this text as a Quick Filter.
         */
    quickFilterText: string | undefined;
    /** Set to `true` to turn on the Quick Filter cache, used to improve performance when using the Quick Filter.
         * @default false
         * @initial
         */
    cacheQuickFilter: boolean | undefined;
    /** @deprecated As of v30, hidden columns are excluded from the Quick Filter by default. This can be toggled using `includeHiddenColumnsInQuickFilter`.
         * @initial
         */
    excludeHiddenColumnsFromQuickFilter: boolean | undefined;
    /** Hidden columns are excluded from the Quick Filter by default.
         * To include hidden columns, set to `true`.
         * @default false
         */
    includeHiddenColumnsInQuickFilter: boolean | undefined;
    /** Changes how the Quick Filter splits the Quick Filter text into search terms.
         */
    quickFilterParser: ((quickFilter: string) => string[]) | undefined;
    /** Changes the matching logic for whether a row passes the Quick Filter.
         */
    quickFilterMatcher: ((quickFilterParts: string[], rowQuickFilterAggregateText: string) => boolean) | undefined;
    /** Set to `true` to override the default tree data filtering behaviour to instead exclude child nodes from filter results.
         * @default false
         */
    excludeChildrenWhenTreeDataFiltering: boolean | undefined;
    /** Set to true to enable the Advanced Filter.
         * @default false
         */
    enableAdvancedFilter: boolean | undefined;
    /** @deprecated As of v31, use `initialState.filter.advancedFilterModel` instead.
         * @initial
         */
    advancedFilterModel: AdvancedFilterModel | null | undefined;
    /** Hidden columns are excluded from the Advanced Filter by default.
         * To include hidden columns, set to `true`.
         * @default false
         */
    includeHiddenColumnsInAdvancedFilter: boolean | undefined;
    /** DOM element to use as the parent for the Advanced Filter to allow it to appear outside of the grid.
         * Set to `null` or `undefined` to appear inside the grid.
         */
    advancedFilterParent: HTMLElement | null | undefined;
    /** Customise the parameters passed to the Advanced Filter Builder.
         */
    advancedFilterBuilderParams: IAdvancedFilterBuilderParams | undefined;
    /** Set to `true` to Enable Charts.
         * @default false
         */
    enableCharts: boolean | undefined;
    /** The list of chart themes that a user can choose from in the chart settings panel.
         * @default ['ag-default', 'ag-material', 'ag-sheets', 'ag-polychroma', 'ag-vivid'];
         * @initial
         */
    chartThemes: string[] | undefined;
    /** A map containing custom chart themes.
         * @initial
         */
    customChartThemes: {
        [name: string]: AgChartTheme;
    } | undefined;
    /** Chart theme overrides applied to all themes.
         * @initial
         */
    chartThemeOverrides: AgChartThemeOverrides | undefined;
    /** @deprecated As of v29, no longer used. To suppress use `suppressChartToolPanelsButton`.
         * @initial
         */
    enableChartToolPanelsButton: boolean | undefined;
    /** Set to `true` to show the 'hamburger' menu option from the Chart Toolbar and display the remaining toolbar buttons.
         * @default false
         * @initial
         */
    suppressChartToolPanelsButton: boolean | undefined;
    /** Allows customisation of the Chart Tool Panels, such as changing the tool panels visibility and order, as well as choosing which charts should be displayed in the settings panel.
         * @initial
         */
    chartToolPanelsDef: ChartToolPanelsDef | undefined;
    /** Provide your own loading cell renderer to use when data is loading via a DataSource.
         * See [Loading Cell Renderer](https://www.ag-grid.com/javascript-data-grid/component-loading-cell-renderer/) for framework specific implementation details.
         */
    loadingCellRenderer: any;
    /** Params to be passed to the `loadingCellRenderer` component.
         */
    loadingCellRendererParams: any;
    /** Callback to select which loading cell renderer to be used when data is loading via a DataSource.
         * @initial
         */
    loadingCellRendererSelector: LoadingCellRendererSelectorFunc<TData> | undefined;
    /** A map of key->value pairs for localising text within the grid.
         * @initial
         */
    localeText: {
        [key: string]: string;
    } | undefined;
    /** Set to `true` to enable Master Detail.
         * @default false
         */
    masterDetail: boolean | undefined;
    /** Set to `true` to keep detail rows for when they are displayed again.
         * @default false
         * @initial
         */
    keepDetailRows: boolean | undefined;
    /** Sets the number of details rows to keep.
         * @default 10
         * @initial
         */
    keepDetailRowsCount: number | undefined;
    /** Provide a custom `detailCellRenderer` to use when a master row is expanded.
         * See [Detail Cell Renderer](https://www.ag-grid.com/javascript-data-grid/master-detail-custom-detail/) for framework specific implementation details.
         */
    detailCellRenderer: any;
    /** Specifies the params to be used by the Detail Cell Renderer. Can also be a function that provides the params to enable dynamic definitions of the params.
         */
    detailCellRendererParams: any;
    /** Set fixed height in pixels for each detail row.
         * @initial
         */
    detailRowHeight: number | undefined;
    /** Set to `true` to have the detail grid dynamically change it's height to fit it's rows.
         * @initial
         */
    detailRowAutoHeight: boolean | undefined;
    /** Provides a context object that is provided to different callbacks the grid uses. Used for passing additional information to the callbacks by your application.
         * @initial
         */
    context: any;
    /**
         * A list of grids to treat as Aligned Grids.
         * Provide a list if the grids / apis already exist or return via a callback to allow the aligned grids to be retrieved asynchronously.
         * If grids are aligned then the columns and horizontal scrolling will be kept in sync.
         */
    alignedGrids: (AlignedGrid[] | (() => AlignedGrid[])) | undefined;
    /** Change this value to set the tabIndex order of the Grid within your application.
         * @default 0
         * @initial
         */
    tabIndex: number | undefined;
    /** The number of rows rendered outside the viewable area the grid renders.
         * Having a buffer means the grid will have rows ready to show as the user slowly scrolls vertically.
         * @default 10
         */
    rowBuffer: number | undefined;
    /** Set to `true` to turn on the value cache.
         * @default false
         * @initial
         */
    valueCache: boolean | undefined;
    /** Set to `true` to configure the value cache to not expire after data updates.
         * @default false
         * @initial
         */
    valueCacheNeverExpires: boolean | undefined;
    /** Set to `true` to allow cell expressions.
         * @default false
         * @initial
         */
    enableCellExpressions: boolean | undefined;
    /** @deprecated v30.2 If `true`, row nodes do not have their parents set.
         * The grid doesn't use the parent reference, but it is included to help the client code navigate the node tree if it wants by providing bi-direction navigation up and down the tree.
         * If this is a problem (e.g. if you need to convert the tree to JSON, which does not allow cyclic dependencies) then set this to `true`.
         * @default false
         * @initial
         */
    suppressParentsInRowNodes: boolean | undefined;
    /** Disables touch support (but does not remove the browser's efforts to simulate mouse events on touch).
         * @default false
         * @initial
         */
    suppressTouch: boolean | undefined;
    /** Set to `true` to not set focus back on the grid after a refresh. This can avoid issues where you want to keep the focus on another part of the browser.
         * @default false
         */
    suppressFocusAfterRefresh: boolean | undefined;
    /** Disables the asynchronous nature of the events introduced in v10, and makes them synchronous. This property only exists for the purpose of supporting legacy code which has a dependency on synchronous events from earlier versions (v9 or earlier) of AG Grid.     **It is strongly recommended that you do not change this property unless you have legacy issues.**
         * @deprecated v31 Events should be handled asynchronously.
         * @default false
         * @initial
         */
    suppressAsyncEvents: boolean | undefined;
    /** The grid will check for `ResizeObserver` and use it if it exists in the browser, otherwise it will use the grid's alternative implementation. Some users reported issues with Chrome's `ResizeObserver`. Use this property to always use the grid's alternative implementation should such problems exist.
         * @default false
         * @initial
         */
    suppressBrowserResizeObserver: boolean | undefined;
    /** Disables showing a warning message in the console if using a `gridOptions` or `colDef` property that doesn't exist.
         * @default false
         * @initial
         */
    suppressPropertyNamesCheck: boolean | undefined;
    /** Disables change detection.
         * @default false
         */
    suppressChangeDetection: boolean | undefined;
    /** Set this to `true` to enable debug information from the grid and related components. Will result in additional logging being output, but very useful when investigating problems.
         * @default false
         * @initial
         */
    debug: boolean | undefined;
    /** Provide a template for 'loading' overlay.
         */
    overlayLoadingTemplate: string | undefined;
    /** Provide a custom loading overlay component.
         * See [Loading Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#implementing-a-loading-overlay-component) for framework specific implementation details.
         * @initial
         */
    loadingOverlayComponent: any;
    /** Customise the parameters provided to the loading overlay component.
         */
    loadingOverlayComponentParams: any;
    /** Disables the 'loading' overlay.
         * @default false
         * @initial
         */
    suppressLoadingOverlay: boolean | undefined;
    /** Provide a template for 'no rows' overlay.
         */
    overlayNoRowsTemplate: string | undefined;
    /** Provide a custom no rows overlay component.
         * See [No Rows Overlay Component](https://www.ag-grid.com/javascript-data-grid/component-overlay/#implementing-a-no-rows-overlay-component) for framework specific implementation details.
         * @initial
         */
    noRowsOverlayComponent: any;
    /** Customise the parameters provided to the no rows overlay component.
         */
    noRowsOverlayComponentParams: any;
    /** Disables the 'no rows' overlay.
         * @default false
         */
    suppressNoRowsOverlay: boolean | undefined;
    /** Set whether pagination is enabled.
         * @default false
         */
    pagination: boolean | undefined;
    /** How many rows to load per page. If `paginationAutoPageSize` is specified, this property is ignored.
         * @default 100
         */
    paginationPageSize: number | undefined;
    /** Determines if the page size selector is shown in the pagination panel or not.
         * Set to an array of values to show the page size selector with custom list of possible page sizes.
         * Set to `true` to show the page size selector with the default page sizes `[20, 50, 100]`.
         * Set to `false` to hide the page size selector.
         * @default true
         * @initial
         */
    paginationPageSizeSelector: number[] | boolean | undefined;
    /** Set to `true` so that the number of rows to load per page is automatically adjusted by the grid so each page shows enough rows to just fill the area designated for the grid. If `false`, `paginationPageSize` is used.
         * @default false
         */
    paginationAutoPageSize: boolean | undefined;
    /** Set to `true` to have pages split children of groups when using Row Grouping or detail rows with Master Detail.
         * @default false
         * @initial
         */
    paginateChildRows: boolean | undefined;
    /** If `true`, the default grid controls for navigation are hidden.
         * This is useful if `pagination=true` and you want to provide your own pagination controls.
         * Otherwise, when `pagination=true` the grid automatically shows the necessary controls at the bottom so that the user can navigate through the different pages.
         * @default false
         */
    suppressPaginationPanel: boolean | undefined;
    /** Set to `true` to enable pivot mode.
         * @default false
         */
    pivotMode: boolean | undefined;
    /** When to show the 'pivot panel' (where you drag rows to pivot) at the top. Note that the pivot panel will never show if `pivotMode` is off.
         * @default 'never'
         * @initial
         */
    pivotPanelShow: 'always' | 'onlyWhenPivoting' | 'never' | undefined;
    /** If pivoting, set to the number of column group levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything.
         * @default 0
         */
    pivotDefaultExpanded: number | undefined;
    /** When set and the grid is in pivot mode, automatically calculated totals will appear within the Pivot Column Groups, in the position specified.
         */
    pivotColumnGroupTotals: 'before' | 'after' | undefined;
    /** When set and the grid is in pivot mode, automatically calculated totals will appear for each value column in the position specified.
         */
    pivotRowTotals: 'before' | 'after' | undefined;
    /** If `true`, the grid will not swap in the grouping column when pivoting. Useful if pivoting using Server Side Row Model or Viewport Row Model and you want full control of all columns including the group column.
         * @default false
         * @initial
         */
    pivotSuppressAutoColumn: boolean | undefined;
    /** When enabled, pivot column groups will appear 'fixed', without the ability to expand and collapse the column groups.
         * @default false
         * @initial
         */
    suppressExpandablePivotGroups: boolean | undefined;
    /** If `true`, then row group, pivot and value aggregation will be read-only from the GUI. The grid will display what values are used for each, but will not allow the user to change the selection.
         * @default false
         */
    functionsReadOnly: boolean | undefined;
    /** A map of 'function name' to 'function' for custom aggregation functions.
         * @initial
         */
    aggFuncs: {
        [key: string]: IAggFunc<TData>;
    } | undefined;
    /** When `true`, column headers won't include the `aggFunc` name, e.g. `'sum(Bank Balance)`' will just be `'Bank Balance'`.
         * @default false
         * @initial
         */
    suppressAggFuncInHeader: boolean | undefined;
    /** When using aggregations, the grid will always calculate the root level aggregation value.
         * @default false
         */
    alwaysAggregateAtRootLevel: boolean | undefined;
    /** @deprecated v30 - made default and toggled via alwaysAggregateAtRootLevel
         * @initial
         */
    suppressAggAtRootLevel: boolean | undefined;
    /** When using change detection, only the updated column will be re-aggregated.
         * @default false
         */
    aggregateOnlyChangedColumns: boolean | undefined;
    /** Set to `true` so that aggregations are not impacted by filtering.
         * @default false
         */
    suppressAggFilteredOnly: boolean | undefined;
    /** Set to `true` to omit the value Column header when there is only a single value column.
         * @default false
         * @initial
         */
    removePivotHeaderRowWhenSingleValueColumn: boolean | undefined;
    /** Set to `false` to disable Row Animation which is enabled by default.
         * @default true
         */
    animateRows: boolean | undefined;
    /** Set to `true` to have cells flash after data changes.
         * @default false
         */
    enableCellChangeFlash: boolean | undefined;
    /** To be used in combination with `enableCellChangeFlash`, the duration in milliseconds of how long a cell should remain in its "flashed" state.
         * @default 500
         */
    cellFlashDuration: number | undefined;
    /** @deprecated v31.1 - use `cellFlashDuration` instead.
         */
    cellFlashDelay: number | undefined;
    /** To be used in combination with `enableCellChangeFlash`, the duration in milliseconds of how long the "flashed" state animation takes to fade away after the timer set by `cellFlashDuration` has completed.
         * @default 1000
         */
    cellFadeDuration: number | undefined;
    /** @deprecated v31.1 - use `cellFadeDuration` instead.
         */
    cellFadeDelay: number | undefined;
    /** Set to `true` to have cells flash after data changes even when the change is due to filtering.
         * @default false
         * @initial
         */
    allowShowChangeAfterFilter: boolean | undefined;
    /** Switch between layout options: `normal`, `autoHeight`, `print`.
         * @default 'normal'
         */
    domLayout: DomLayoutType | undefined;
    /** When `true`, the order of rows and columns in the DOM are consistent with what is on screen.
         * Disables row animations.
         * @default false
         * @initial
         */
    ensureDomOrder: boolean | undefined;
    /** Set to `true` to operate the grid in RTL (Right to Left) mode.
         * @default false
         * @initial
         */
    enableRtl: boolean | undefined;
    /** Set to `true` so that the grid doesn't virtualise the columns. For example, if you have 100 columns, but only 10 visible due to scrolling, all 100 will always be rendered.
         * @default false
         * @initial
         */
    suppressColumnVirtualisation: boolean | undefined;
    /** By default the grid has a limit of rendering a maximum of 500 rows at once (remember the grid only renders rows you can see, so unless your display shows more than 500 rows without vertically scrolling this will never be an issue).
         * <br />**This is only relevant if you are manually setting `rowBuffer` to a high value (rendering more rows than can be seen), or `suppressRowVirtualisation` is true, or if your grid height is able to display more than 500 rows at once.**
         * @default false
         * @initial
         */
    suppressMaxRenderedRowRestriction: boolean | undefined;
    /** Set to `true` so that the grid doesn't virtualise the rows. For example, if you have 100 rows, but only 10 visible due to scrolling, all 100 will always be rendered.
         * @default false
         * @initial
         */
    suppressRowVirtualisation: boolean | undefined;
    /** Set to `true` to enable Managed Row Dragging.
         * @default false
         */
    rowDragManaged: boolean | undefined;
    /** Set to `true` to suppress row dragging.
         * @default false
         */
    suppressRowDrag: boolean | undefined;
    /** Set to `true` to suppress moving rows while dragging the `rowDrag` waffle. This option highlights the position where the row will be placed and it will only move the row on mouse up.
         * @default false
         */
    suppressMoveWhenRowDragging: boolean | undefined;
    /** Set to `true` to enable clicking and dragging anywhere on the row without the need for a drag handle.
         * @default false
         */
    rowDragEntireRow: boolean | undefined;
    /** Set to `true` to enable dragging multiple rows at the same time.
         * @default false
         */
    rowDragMultiRow: boolean | undefined;
    /** A callback that should return a string to be displayed by the `rowDragComp` while dragging a row.
         * If this callback is not set, the current cell value will be used.
         * If the `rowDragText` callback is set in the ColDef it will take precedence over this, except when
         * `rowDragEntireRow=true`.
         * @initial
         */
    rowDragText: ((params: IRowDragItem, dragItemCount: number) => string) | undefined;
    /** Provide your own cell renderer component to use for full width rows.
         * See [Full Width Rows](https://www.ag-grid.com/javascript-data-grid/full-width-rows/) for framework specific implementation details.
         */
    fullWidthCellRenderer: any;
    /** Customise the parameters provided to the `fullWidthCellRenderer` component.
         */
    fullWidthCellRendererParams: any;
    /** Set to `true` to have the Full Width Rows embedded in grid's main container so they can be scrolled horizontally.
         */
    embedFullWidthRows: boolean | undefined;
    /** @deprecated v31
         * When enabled, the grid will cast group values to string type.
         * @default false
         * @initial
         */
    suppressGroupMaintainValueType: boolean | undefined;
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
    /** If grouping, set to the number of levels to expand by default, e.g. `0` for none, `1` for first level only, etc. Set to `-1` to expand everything.
         * @default 0
         */
    groupDefaultExpanded: number | undefined;
    /** Allows specifying the group 'auto column' if you are not happy with the default. If grouping, this column definition is included as the first column in the grid. If not grouping, this column is not included.
         */
    autoGroupColumnDef: ColDef<TData> | undefined;
    /** When `true`, preserves the current group order when sorting on non-group columns.
         * @default false
         */
    groupMaintainOrder: boolean | undefined;
    /** When `true`, if you select a group, the children of the group will also be selected.
         * @default false
         */
    groupSelectsChildren: boolean | undefined;
    /** If grouping, locks the group settings of a number of columns, e.g. `0` for no group locking. `1` for first group column locked, `-1` for all group columns locked.
         * @default 0
         * @initial
         */
    groupLockGroupColumns: number | undefined;
    /** Set to determine whether filters should be applied on aggregated group values.
         * @default false
         */
    groupAggFiltering: boolean | IsRowFilterable<TData> | undefined;
    /** If grouping, this controls whether to show a group footer when the group is expanded.
         * If `true`, then by default, the footer will contain aggregate data (if any) when shown and the header will be blank.
         * When closed, the header will contain the aggregate data regardless of this setting (as the footer is hidden anyway).
         * This is handy for 'total' rows, that are displayed below the data when the group is open, and alongside the group when it is closed.
         * If a callback function is provided, it can used to select which groups will have a footer added.
         * @default false
         */
    groupIncludeFooter: boolean | UseGroupFooter<TData> | undefined;
    /** Set to `true` to show a 'grand total' group footer across all groups.
         * @default false
         */
    groupIncludeTotalFooter: boolean | undefined;
    /** If `true`, and showing footer, aggregate data will always be displayed at both the header and footer levels. This stops the possibly undesirable behaviour of the header details 'jumping' to the footer on expand.
         * @default false
         */
    groupSuppressBlankHeader: boolean | undefined;
    /** If using `groupSelectsChildren`, then only the children that pass the current filter will get selected.
         * @default false
         */
    groupSelectsFiltered: boolean | undefined;
    /** Shows the open group in the group column for non-group rows.
         * @default false
         */
    showOpenedGroup: boolean | undefined;
    /** Set to `true` to collapse groups that only have one child.
         * @default false
         */
    groupRemoveSingleChildren: boolean | undefined;
    /** Set to `true` to collapse lowest level groups that only have one child.
         * @default false
         */
    groupRemoveLowestSingleChildren: boolean | undefined;
    /** Set to `true` to hide parents that are open. When used with multiple columns for showing groups, it can give a more pleasing user experience.
         * @default false
         */
    groupHideOpenParents: boolean | undefined;
    /** Set to `true` to prevent the grid from creating a '(Blanks)' group for nodes which do not belong to a group, and display the unbalanced nodes alongside group nodes.
         * @default false
         */
    groupAllowUnbalanced: boolean | undefined;
    /** When to show the 'row group panel' (where you drag rows to group) at the top.
         * @default 'never'
         */
    rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never' | undefined;
    /** Provide the Cell Renderer to use when `groupDisplayType = 'groupRows'`.
         * See [Group Row Cell Renderer](https://www.ag-grid.com/javascript-data-grid/grouping-group-rows/#providing-cell-renderer) for framework specific implementation details.
         */
    groupRowRenderer: any;
    /** Customise the parameters provided to the `groupRowRenderer` component.
         */
    groupRowRendererParams: any;
    /** By default, when a column is un-grouped, i.e. using the Row Group Panel, it is made visible in the grid. This property stops the column becoming visible again when un-grouping.
         * @default false
         */
    suppressMakeColumnVisibleAfterUnGroup: boolean | undefined;
    /** Set to `true` to enable the Grid to work with Tree Data. You must also implement the `getDataPath(data)` callback.
         * @default false
         */
    treeData: boolean | undefined;
    /** Set to `true` to suppress sort indicators and actions from the row group panel.
         * @default false
         * @initial
         */
    rowGroupPanelSuppressSort: boolean | undefined;
    /** Set to `true` prevent Group Rows from sticking to the top of the grid.
         * @default false
         * @initial
         */
    suppressGroupRowsSticky: boolean | undefined;
    /** Data to be displayed as pinned top rows in the grid.
         */
    pinnedTopRowData: any[] | undefined;
    /** Data to be displayed as pinned bottom rows in the grid.
         */
    pinnedBottomRowData: any[] | undefined;
    /** Sets the row model type.
         * @default 'clientSide'
         * @initial
         */
    rowModelType: RowModelType | undefined;
    /** Set the data to be displayed as rows in the grid.
         */
    rowData: TData[] | null | undefined;
    /** How many milliseconds to wait before executing a batch of async transactions.
         */
    asyncTransactionWaitMillis: number | undefined;
    /** Prevents Transactions changing sort, filter, group or pivot state when transaction only contains updates.
         * @default false
         */
    suppressModelUpdateAfterUpdateTransaction: boolean | undefined;
    /** Provide the datasource for infinite scrolling.
         */
    datasource: IDatasource | undefined;
    /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
         * @default 1
         * @initial
         */
    cacheOverflowSize: number | undefined;
    /** How many extra blank rows to display to the user at the end of the dataset, which sets the vertical scroll and then allows the grid to request viewing more rows of data.
         * @default 1
         * @initial
         */
    infiniteInitialRowCount: number | undefined;
    /** Set how many loading rows to display to the user for the root level group.
         * @default 1
         * @initial
         */
    serverSideInitialRowCount: number | undefined;
    /** When `true`, the Server-side Row Model will suppress Infinite Scrolling and load all the data at the current level.
         * @default false
         * @initial
         * @deprecated v31.1
         */
    suppressServerSideInfiniteScroll: boolean | undefined;
    /** How many rows for each block in the store, i.e. how many rows returned from the server at a time.
         * @default 100
         */
    cacheBlockSize: number | undefined;
    /** How many blocks to keep in the store. Default is no limit, so every requested block is kept. Use this if you have memory concerns, and blocks that were least recently viewed will be purged when the limit is hit. The grid will additionally make sure it has all the blocks needed to display what is currently visible, in case this property is set to a low value.
         * @initial
         */
    maxBlocksInCache: number | undefined;
    /** How many requests to hit the server with concurrently. If the max is reached, requests are queued.
         * Set to `-1` for no maximum restriction on requests.
         * @default 2
         * @initial
         */
    maxConcurrentDatasourceRequests: number | undefined;
    /** How many milliseconds to wait before loading a block. Useful when scrolling over many blocks, as it prevents blocks loading until scrolling has settled.
         * @initial
         */
    blockLoadDebounceMillis: number | undefined;
    /** When enabled, closing group rows will remove children of that row. Next time the row is opened, child rows will be read from the datasource again. This property only applies when there is Row Grouping.
         * @default false
         */
    purgeClosedRowNodes: boolean | undefined;
    /** Provide the `serverSideDatasource` for server side row model.
         */
    serverSideDatasource: IServerSideDatasource | undefined;
    /** When enabled, always refreshes top level groups regardless of which column was sorted. This property only applies when there is Row Grouping & sorting is handled on the server.
         * @default false
         */
    serverSideSortAllLevels: boolean | undefined;
    /** When enabled, sorts fully loaded groups in the browser instead of requesting from the server.
         * @default false
         */
    serverSideEnableClientSideSort: boolean | undefined;
    /** When enabled, only refresh groups directly impacted by a filter. This property only applies when there is Row Grouping & filtering is handled on the server.
         * @default false
         * @initial
         */
    serverSideOnlyRefreshFilteredGroups: boolean | undefined;
    /** @deprecated v30 This property has been deprecated. Use `serverSideOnlyRefreshFilteredGroups` instead.
         */
    serverSideFilterAllLevels: boolean | undefined;
    /** When enabled, Sorting will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
         * @default false
         * @deprecated
         */
    serverSideSortOnServer: boolean | undefined;
    /** When enabled, Filtering will be done on the server. Only applicable when `suppressServerSideInfiniteScroll=true`.
         * @default false
         * @deprecated
         */
    serverSideFilterOnServer: boolean | undefined;
    /** Used to split pivot field strings for generating pivot result columns when `pivotResultFields` is provided as part of a `getRows` success.
         * @default '_'
         * @initial
         */
    serverSidePivotResultFieldSeparator: string | undefined;
    /** To use the viewport row model you need to provide the grid with a `viewportDatasource`.
         */
    viewportDatasource: IViewportDatasource | undefined;
    /** When using viewport row model, sets the page size for the viewport.
         * @initial
         */
    viewportRowModelPageSize: number | undefined;
    /** When using viewport row model, sets the buffer size for the viewport.
         * @initial
         */
    viewportRowModelBufferSize: number | undefined;
    /** Set to `true` to always show the horizontal scrollbar.
         * @default false
         */
    alwaysShowHorizontalScroll: boolean | undefined;
    /** Set to `true` to always show the vertical scrollbar.
         * @default false
         */
    alwaysShowVerticalScroll: boolean | undefined;
    /** Set to `true` to debounce the vertical scrollbar. Can provide smoother scrolling on slow machines.
         * @default false
         * @initial
         */
    debounceVerticalScrollbar: boolean | undefined;
    /** Set to `true` to never show the horizontal scroll. This is useful if the grid is aligned with another grid and will scroll when the other grid scrolls. (Should not be used in combination with `alwaysShowHorizontalScroll`.)
         * @default false
         */
    suppressHorizontalScroll: boolean | undefined;
    /** When `true`, the grid will not scroll to the top when new row data is provided. Use this if you don't want the default behaviour of scrolling to the top every time you load new data.
         * @default false
         */
    suppressScrollOnNewData: boolean | undefined;
    /** When `true`, the grid will not allow mousewheel / touchpad scroll when popup elements are present.
         * @default false
         */
    suppressScrollWhenPopupsAreOpen: boolean | undefined;
    /** When `true`, the grid will not use animation frames when drawing rows while scrolling. Use this if the grid is working fast enough that you don't need animation frames and you don't want the grid to flicker.
         * @default false
         * @initial
         */
    suppressAnimationFrame: boolean | undefined;
    /** If `true`, middle clicks will result in `click` events for cells and rows. Otherwise the browser will use middle click to scroll the grid.<br />**Note:** Not all browsers fire `click` events with the middle button. Most will fire only `mousedown` and `mouseup` events, which can be used to focus a cell, but will not work to call the `onCellClicked` function.
         * @default false
         */
    suppressMiddleClickScrolls: boolean | undefined;
    /** If `true`, mouse wheel events will be passed to the browser. Useful if your grid has no vertical scrolls and you want the mouse to scroll the browser page.
         * @default false
         * @initial
         */
    suppressPreventDefaultOnMouseWheel: boolean | undefined;
    /** Tell the grid how wide in pixels the scrollbar is, which is used in grid width calculations. Set only if using non-standard browser-provided scrollbars, so the grid can use the non-standard size in its calculations.
         * @initial
         */
    scrollbarWidth: number | undefined;
    /** Type of Row Selection: `single`, `multiple`.
         */
    rowSelection: 'single' | 'multiple' | undefined;
    /** Set to `true` to allow multiple rows to be selected using single click.
         * @default false
         */
    rowMultiSelectWithClick: boolean | undefined;
    /** If `true`, rows will not be deselected if you hold down `Ctrl` and click the row or press `Space`.
         * @default false
         */
    suppressRowDeselection: boolean | undefined;
    /** If `true`, row selection won't happen when rows are clicked. Use when you only want checkbox selection.
         * @default false
         */
    suppressRowClickSelection: boolean | undefined;
    /** If `true`, cells won't be focusable. This means keyboard navigation will be disabled for grid cells, but remain enabled in other elements of the grid such as column headers, floating filters, tool panels.
         * @default false
         */
    suppressCellFocus: boolean | undefined;
    /** If `true`, header cells won't be focusable. This means keyboard navigation will be disabled for grid header cells, but remain enabled in other elements of the grid such as grid cells and tool panels.
         * @default false
         */
    suppressHeaderFocus: boolean | undefined;
    /** If `true`, only a single range can be selected.
         * @default false
         */
    suppressMultiRangeSelection: boolean | undefined;
    /** Set to `true` to be able to select the text within cells.
         *
         *     **Note:** When this is set to `true`, the clipboard service is disabled and only selected text is copied.
         * @default false
         */
    enableCellTextSelection: boolean | undefined;
    /** Set to `true` to enable Range Selection.
         * @default false
         */
    enableRangeSelection: boolean | undefined;
    /** Set to `true` to enable the Range Handle.
         * @default false
         */
    enableRangeHandle: boolean | undefined;
    /** Set to `true` to enable the Fill Handle.
         * @default false
         */
    enableFillHandle: boolean | undefined;
    /** Set to `'x'` to force the fill handle direction to horizontal, or set to `'y'` to force the fill handle direction to vertical.
         * @default 'xy'
         */
    fillHandleDirection: 'x' | 'y' | 'xy' | undefined;
    /** Set this to `true` to prevent cell values from being cleared when the Range Selection is reduced by the Fill Handle.
         * @default false
         */
    suppressClearOnFillReduction: boolean | undefined;
    /** Array defining the order in which sorting occurs (if sorting is enabled). Values can be `'asc'`, `'desc'` or `null`. For example: `sortingOrder: ['asc', 'desc']`.
         * @default [null, 'asc', 'desc']
         */
    sortingOrder: (SortDirection)[] | undefined;
    /** Set to `true` to specify that the sort should take accented characters into account. If this feature is turned on the sort will be slower.
         * @default false
         */
    accentedSort: boolean | undefined;
    /** Set to `true` to show the 'no sort' icon.
         * @default false
         */
    unSortIcon: boolean | undefined;
    /** Set to `true` to suppress multi-sort when the user shift-clicks a column header.
         * @default false
         */
    suppressMultiSort: boolean | undefined;
    /** Set to `true` to always multi-sort when the user clicks a column header, regardless of key presses.
         * @default false
         */
    alwaysMultiSort: boolean | undefined;
    /** Set to `'ctrl'` to have multi sorting work using the `Ctrl` (or `Command ⌘` for Mac) key.
         */
    multiSortKey: 'ctrl' | undefined;
    /** Set to `true` to suppress sorting of un-sorted data to match original row data.
         * @default false
         */
    suppressMaintainUnsortedOrder: boolean | undefined;
    /** Icons to use inside the grid instead of the grid's default icons.
         * @initial
         */
    icons: {
        [key: string]: Function | string;
    } | undefined;
    /** Default row height in pixels.
         * @default 25
         */
    rowHeight: number | undefined;
    /** The style properties to apply to all rows. Set to an object of key (style names) and values (style values).
         */
    rowStyle: RowStyle | undefined;
    /** CSS class(es) for all rows. Provide either a string (class name) or array of strings (array of class names).
         */
    rowClass: string | string[] | undefined;
    /** Rules which can be applied to include certain CSS classes.
         */
    rowClassRules: RowClassRules<TData> | undefined;
    /** Set to `true` to not highlight rows by adding the `ag-row-hover` CSS class.
         * @default false
         */
    suppressRowHoverHighlight: boolean | undefined;
    /** Uses CSS `top` instead of CSS `transform` for positioning rows. Useful if the transform function is causing issues such as used in row spanning.
         * @default false
         * @initial
         */
    suppressRowTransform: boolean | undefined;
    /** Set to `true` to highlight columns by adding the `ag-column-hover` CSS class.
         * @default false
         */
    columnHoverHighlight: boolean | undefined;
    /** Provide a custom `gridId` for this instance of the grid. Value will be set on the root DOM node using the attribute `grid-id` as well as being accessible via the `gridApi.getGridId()` method.
         * @initial
         */
    gridId: string | undefined;
    /** When enabled, sorts only the rows added/updated by a transaction.
         * @default false
         */
    deltaSort: boolean | undefined;
    treeDataDisplayType: TreeDataDisplayType | undefined;
    /** @deprecated v29.2
         * @initial
         */
    functionsPassive: boolean | undefined;
    /** @initial
         */
    enableGroupEdit: boolean | undefined;
    /** Initial state for the grid. Only read once on initialization. Can be used in conjunction with `api.getState()` to save and restore grid state.
         * @initial
         */
    initialState: GridState | undefined;
    /** For customising the context menu.
         */
    getContextMenuItems: GetContextMenuItems<TData> | undefined;
    /** For customising the main 'column header' menu.
         * @initial
         */
    getMainMenuItems: GetMainMenuItems<TData> | undefined;
    /** Allows user to process popups after they are created. Applications can use this if they want to, for example, reposition the popup.
         */
    postProcessPopup: ((params: PostProcessPopupParams<TData>) => void) | undefined;
    /** Allows the user to process the columns being removed from the pinned section because the viewport is too small to accommodate them.
         * Returns an array of columns to be removed from the pinned areas.
         * @initial
         */
    processUnpinnedColumns: ((params: ProcessUnpinnedColumnsParams<TData>) => Column[]) | undefined;
    /** Allows you to process cells for the clipboard. Handy if for example you have `Date` objects that need to have a particular format if importing into Excel.
         */
    processCellForClipboard: ((params: ProcessCellForExportParams<TData>) => any) | undefined;
    /** Allows you to process header values for the clipboard.
         */
    processHeaderForClipboard: ((params: ProcessHeaderForExportParams<TData>) => any) | undefined;
    /** Allows you to process group header values for the clipboard.
         */
    processGroupHeaderForClipboard: ((params: ProcessGroupHeaderForExportParams<TData>) => any) | undefined;
    /** Allows you to process cells from the clipboard. Handy if for example you have number fields, and want to block non-numbers from getting into the grid.
         */
    processCellFromClipboard: ((params: ProcessCellForExportParams<TData>) => any) | undefined;
    /** Allows you to get the data that would otherwise go to the clipboard. To be used when you want to control the 'copy to clipboard' operation yourself.
         */
    sendToClipboard: ((params: SendToClipboardParams<TData>) => void) | undefined;
    /** Allows complete control of the paste operation, including cancelling the operation (so nothing happens) or replacing the data with other data.
         */
    processDataFromClipboard: ((params: ProcessDataFromClipboardParams<TData>) => string[][] | null) | undefined;
    /** Grid calls this method to know if an external filter is present.
         */
    isExternalFilterPresent: ((params: IsExternalFilterPresentParams<TData>) => boolean) | undefined;
    /** Should return `true` if external filter passes, otherwise `false`.
         */
    doesExternalFilterPass: ((node: IRowNode<TData>) => boolean) | undefined;
    /** Callback to be used to customise the chart toolbar items.
         * @initial
         */
    getChartToolbarItems: GetChartToolbarItems | undefined;
    /** Callback to enable displaying the chart in an alternative chart container.
         * @initial
         */
    createChartContainer: ((params: ChartRefParams<TData>) => void) | undefined;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.
         */
    navigateToNextHeader: ((params: NavigateToNextHeaderParams<TData>) => (HeaderPosition | null)) | undefined;
    /** Allows overriding the default behaviour for when user hits `Tab` key when a header is focused. Return the next Header position to navigate to or `null` to stay on current header.
         */
    tabToNextHeader: ((params: TabToNextHeaderParams<TData>) => (HeaderPosition | null)) | undefined;
    /** Allows overriding the default behaviour for when user hits navigation (arrow) key when a cell is focused. Return the next Cell position to navigate to or `null` to stay on current cell.
         */
    navigateToNextCell: ((params: NavigateToNextCellParams<TData>) => (CellPosition | null)) | undefined;
    /** Allows overriding the default behaviour for when user hits `Tab` key when a cell is focused. Return the next Cell position to navigate to or null to stay on current cell.
         */
    tabToNextCell: ((params: TabToNextCellParams<TData>) => (CellPosition | null)) | undefined;
    /** A callback for localising text within the grid.
         * @initial
         */
    getLocaleText: ((params: GetLocaleTextParams<TData>) => string) | undefined;
    /** Allows overriding what `document` is used. Currently used by Drag and Drop (may extend to other places in the future). Use this when you want the grid to use a different `document` than the one available on the global scope. This can happen if docking out components (something which Electron supports)
         */
    getDocument: (() => Document) | undefined;
    /** Allows user to format the numbers in the pagination panel, i.e. 'row count' and 'page number' labels. This is for pagination panel only, to format numbers inside the grid's cells (i.e. your data), then use `valueFormatter` in the column definitions.
         * @initial
         */
    paginationNumberFormatter: ((params: PaginationNumberFormatterParams<TData>) => string) | undefined;
    /** Callback to use when you need access to more then the current column for aggregation.
         */
    getGroupRowAgg: ((params: GetGroupRowAggParams<TData>) => any) | undefined;
    /** (Client-side Row Model only) Allows groups to be open by default.
         */
    isGroupOpenByDefault: ((params: IsGroupOpenByDefaultParams<TData>) => boolean) | undefined;
    /** Allows default sorting of groups.
         */
    initialGroupOrderComparator: ((params: InitialGroupOrderComparatorParams<TData>) => number) | undefined;
    /** Callback to be used with pivoting, to allow changing the second column definition.
         */
    processPivotResultColDef: ((colDef: ColDef<TData>) => void) | undefined;
    /** Callback to be used with pivoting, to allow changing the second column group definition.
         */
    processPivotResultColGroupDef: ((colGroupDef: ColGroupDef<TData>) => void) | undefined;
    /** Callback to be used when working with Tree Data when `treeData = true`.
         */
    getDataPath: GetDataPath<TData> | undefined;
    /** Allows setting the child count for a group row.
         * @initial
         */
    getChildCount: ((dataItem: any) => number) | undefined;
    /** Allows providing different params for different levels of grouping.
         * @initial
         */
    getServerSideGroupLevelParams: ((params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams) | undefined;
    /** Allows groups to be open by default.
         */
    isServerSideGroupOpenByDefault: ((params: IsServerSideGroupOpenByDefaultParams) => boolean) | undefined;
    /** Allows cancelling transactions.
         */
    isApplyServerSideTransaction: IsApplyServerSideTransaction | undefined;
    /** SSRM Tree Data: Allows specifying which rows are expandable.
         */
    isServerSideGroup: IsServerSideGroup | undefined;
    /** SSRM Tree Data: Allows specifying group keys.
         */
    getServerSideGroupKey: GetServerSideGroupKey | undefined;
    /** Return a business key for the node. If implemented, each row in the DOM will have an attribute `row-business-key='abc'` where `abc` is what you return as the business key.
         * This is useful for automated testing, as it provides a way for your tool to identify rows based on unique business keys.
         */
    getBusinessKeyForNode: ((node: IRowNode<TData>) => string) | undefined;
    /** Allows setting the ID for a particular row node based on the data.
         * @initial
         */
    getRowId: GetRowIdFunc<TData> | undefined;
    /** When enabled, getRowId() callback is implemented and new Row Data is set, the grid will disregard all previous rows and treat the new Row Data as new data. As a consequence, all Row State (eg selection, rendered rows) will be reset.
         * @default false
         */
    resetRowDataOnUpdate: boolean | undefined;
    /** Allows you to process rows after they are created, so you can do final adding of custom attributes etc.
         */
    processRowPostCreate: ((params: ProcessRowParams<TData>) => void) | undefined;
    /** Callback to be used to determine which rows are selectable. By default rows are selectable, so return `false` to make a row un-selectable.
         */
    isRowSelectable: IsRowSelectable<TData> | undefined;
    /** Callback to be used with Master Detail to determine if a row should be a master row. If `false` is returned no detail row will exist for this row.
         */
    isRowMaster: IsRowMaster<TData> | undefined;
    /** Callback to fill values instead of simply copying values or increasing number values using linear progression.
         */
    fillOperation: ((params: FillOperationParams<TData>) => any) | undefined;
    /** Callback to perform additional sorting after the grid has sorted the rows.
         */
    postSortRows: ((params: PostSortRowsParams<TData>) => void) | undefined;
    /** Callback version of property `rowStyle` to set style for each row individually. Function should return an object of CSS values or undefined for no styles.
         */
    getRowStyle: ((params: RowClassParams<TData>) => RowStyle | undefined) | undefined;
    /** Callback version of property `rowClass` to set class(es) for each row individually. Function should return either a string (class name), array of strings (array of class names) or undefined for no class.
         */
    getRowClass: ((params: RowClassParams<TData>) => string | string[] | undefined) | undefined;
    /** Callback version of property `rowHeight` to set height for each row individually. Function should return a positive number of pixels, or return `null`/`undefined` to use the default row height.
         */
    getRowHeight: ((params: RowHeightParams<TData>) => number | undefined | null) | undefined;
    /** Tells the grid if this row should be rendered as full width.
         */
    isFullWidthRow: ((params: IsFullWidthRowParams<TData>) => boolean) | undefined;
    /** The tool panel visibility has changed. Fires twice if switching between panels - once with the old panel and once with the new panel.
         */
    toolPanelVisibleChanged: EventEmitter<ToolPanelVisibleChangedEvent<TData>>;
    /** The tool panel size has been changed.
         */
    toolPanelSizeChanged: EventEmitter<ToolPanelSizeChangedEvent<TData>>;
    /** The column menu visibility has changed. Fires twice if switching between tabs - once with the old tab and once with the new tab.
         */
    columnMenuVisibleChanged: EventEmitter<ColumnMenuVisibleChangedEvent<TData>>;
    /** Cut operation has started.
         */
    cutStart: EventEmitter<CutStartEvent<TData>>;
    /** Cut operation has ended.
         */
    cutEnd: EventEmitter<CutEndEvent<TData>>;
    /** Paste operation has started.
         */
    pasteStart: EventEmitter<PasteStartEvent<TData>>;
    /** Paste operation has ended.
         */
    pasteEnd: EventEmitter<PasteEndEvent<TData>>;
    /** A column, or group of columns, was hidden / shown.
         */
    columnVisible: EventEmitter<ColumnVisibleEvent<TData>>;
    /** A column, or group of columns, was pinned / unpinned.
         */
    columnPinned: EventEmitter<ColumnPinnedEvent<TData>>;
    /** A column was resized.
         */
    columnResized: EventEmitter<ColumnResizedEvent<TData>>;
    /** A column was moved.
         */
    columnMoved: EventEmitter<ColumnMovedEvent<TData>>;
    /** A value column was added or removed.
         */
    columnValueChanged: EventEmitter<ColumnValueChangedEvent<TData>>;
    /** The pivot mode flag was changed.
         */
    columnPivotModeChanged: EventEmitter<ColumnPivotModeChangedEvent<TData>>;
    /** A pivot column was added, removed or order changed.
         */
    columnPivotChanged: EventEmitter<ColumnPivotChangedEvent<TData>>;
    /** A column group was opened / closed.
         */
    columnGroupOpened: EventEmitter<ColumnGroupOpenedEvent<TData>>;
    /** User set new columns.
         */
    newColumnsLoaded: EventEmitter<NewColumnsLoadedEvent<TData>>;
    /** The list of grid columns changed.
         */
    gridColumnsChanged: EventEmitter<GridColumnsChangedEvent<TData>>;
    /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc.
         */
    displayedColumnsChanged: EventEmitter<DisplayedColumnsChangedEvent<TData>>;
    /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default).
         */
    virtualColumnsChanged: EventEmitter<VirtualColumnsChangedEvent<TData>>;
    /** Shotgun - gets called when either a) new columns are set or b) `api.applyColumnState()` is used, so everything has changed.
         */
    columnEverythingChanged: EventEmitter<ColumnEverythingChangedEvent<TData>>;
    /** A mouse cursor is initially moved over a column header.
         */
    columnHeaderMouseOver: EventEmitter<ColumnHeaderMouseOverEvent<TData>>;
    /** A mouse cursor is moved out of a column header.
         */
    columnHeaderMouseLeave: EventEmitter<ColumnHeaderMouseLeaveEvent<TData>>;
    /** A click is performed on a column header.
         */
    columnHeaderClicked: EventEmitter<ColumnHeaderClickedEvent<TData>>;
    /** A context menu action, such as right-click or context menu key press, is performed on a column header.
         */
    columnHeaderContextMenu: EventEmitter<ColumnHeaderContextMenuEvent<TData>>;
    /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
         * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.
         */
    componentStateChanged: EventEmitter<ComponentStateChangedEvent<TData>>;
    /** Value has changed after editing (this event will not fire if editing was cancelled, eg ESC was pressed) or
         *  if cell value has changed as a result of cut, paste, cell clear (pressing Delete key),
         * fill handle, copy range down, undo and redo.
        */
    cellValueChanged: EventEmitter<CellValueChangedEvent<TData>>;
    /** Value has changed after editing. Only fires when `readOnlyEdit=true`.
         */
    cellEditRequest: EventEmitter<CellEditRequestEvent<TData>>;
    /** A cell's value within a row has changed. This event corresponds to Full Row Editing only.
         */
    rowValueChanged: EventEmitter<RowValueChangedEvent<TData>>;
    /** Editing a cell has started.
         */
    cellEditingStarted: EventEmitter<CellEditingStartedEvent<TData>>;
    /** Editing a cell has stopped.
         */
    cellEditingStopped: EventEmitter<CellEditingStoppedEvent<TData>>;
    /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing.
         */
    rowEditingStarted: EventEmitter<RowEditingStartedEvent<TData>>;
    /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing.
         */
    rowEditingStopped: EventEmitter<RowEditingStoppedEvent<TData>>;
    /** Undo operation has started.
         */
    undoStarted: EventEmitter<UndoStartedEvent<TData>>;
    /** Undo operation has ended.
         */
    undoEnded: EventEmitter<UndoEndedEvent<TData>>;
    /** Redo operation has started.
         */
    redoStarted: EventEmitter<RedoStartedEvent<TData>>;
    /** Redo operation has ended.
         */
    redoEnded: EventEmitter<RedoEndedEvent<TData>>;
    /** Range delete operation (cell clear) has started.
         */
    rangeDeleteStart: EventEmitter<RangeDeleteStartEvent<TData>>;
    /** Range delete operation (cell clear) has ended.
         */
    rangeDeleteEnd: EventEmitter<RangeDeleteEndEvent<TData>>;
    /** Filter has been opened.
         */
    filterOpened: EventEmitter<FilterOpenedEvent<TData>>;
    /** Filter has been modified and applied.
         */
    filterChanged: EventEmitter<FilterChangedEvent<TData>>;
    /** Filter was modified but not applied. Used when filters have 'Apply' buttons.
         */
    filterModified: EventEmitter<FilterModifiedEvent<TData>>;
    /** Advanced Filter Builder visibility has changed (opened or closed).
         */
    advancedFilterBuilderVisibleChanged: EventEmitter<AdvancedFilterBuilderVisibleChangedEvent<TData>>;
    /** A chart has been created.
         */
    chartCreated: EventEmitter<ChartCreated<TData>>;
    /** The data range for the chart has been changed.
         */
    chartRangeSelectionChanged: EventEmitter<ChartRangeSelectionChanged<TData>>;
    /** Formatting changes have been made by users through the Format Panel.
         */
    chartOptionsChanged: EventEmitter<ChartOptionsChanged<TData>>;
    /** A chart has been destroyed.
         */
    chartDestroyed: EventEmitter<ChartDestroyed<TData>>;
    /** DOM event `keyDown` happened on a cell.
         */
    cellKeyDown: EventEmitter<CellKeyDownEvent<TData> | FullWidthCellKeyDownEvent<TData>>;
    /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet      */
    gridReady: EventEmitter<GridReadyEvent<TData>>;
    /** Invoked immediately before the grid is destroyed. This is useful for cleanup logic that needs to run before the grid is torn down.
         */
    gridPreDestroyed: EventEmitter<GridPreDestroyedEvent<TData>>;
    /** Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents     */
    firstDataRendered: EventEmitter<FirstDataRenderedEvent<TData>>;
    /** The size of the grid `div` has changed. In other words, the grid was resized.
         */
    gridSizeChanged: EventEmitter<GridSizeChangedEvent<TData>>;
    /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events.
         */
    modelUpdated: EventEmitter<ModelUpdatedEvent<TData>>;
    /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row.
         */
    virtualRowRemoved: EventEmitter<VirtualRowRemovedEvent<TData>>;
    /** Which rows are rendered in the DOM has changed.
         */
    viewportChanged: EventEmitter<ViewportChangedEvent<TData>>;
    /** The body was scrolled horizontally or vertically.
         */
    bodyScroll: EventEmitter<BodyScrollEvent<TData>>;
    /** Main body of the grid has stopped scrolling, either horizontally or vertically.
         */
    bodyScrollEnd: EventEmitter<BodyScrollEndEvent<TData>>;
    /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
         */
    dragStarted: EventEmitter<DragStartedEvent<TData>>;
    /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
         */
    dragStopped: EventEmitter<DragStoppedEvent<TData>>;
    /** Grid state has been updated.
         */
    stateUpdated: EventEmitter<StateUpdatedEvent<TData>>;
    /** Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
         *
         *  - The page size changes.
         *  - The current shown page is changed.
         *  - New data is loaded onto the grid.
         */
    paginationChanged: EventEmitter<PaginationChangedEvent<TData>>;
    /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid.
         */
    rowDragEnter: EventEmitter<RowDragEvent<TData>>;
    /** The mouse has moved while dragging.
         */
    rowDragMove: EventEmitter<RowDragEvent<TData>>;
    /** The mouse has left the grid while dragging.
         */
    rowDragLeave: EventEmitter<RowDragEvent<TData>>;
    /** The drag has finished over the grid.
         */
    rowDragEnd: EventEmitter<RowDragEvent<TData>>;
    /** A row group column was added, removed or reordered.
         */
    columnRowGroupChanged: EventEmitter<ColumnRowGroupChangedEvent<TData>>;
    /** A row group was opened or closed.
         */
    rowGroupOpened: EventEmitter<RowGroupOpenedEvent<TData>>;
    /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`.
         */
    expandOrCollapseAll: EventEmitter<ExpandCollapseAllEvent<TData>>;
    /** The client has set new pinned row data into the grid.
         */
    pinnedRowDataChanged: EventEmitter<PinnedRowDataChangedEvent<TData>>;
    /** Client-Side Row Model only. The client has updated data for the grid by either a) setting new Row Data or b) Applying a Row Transaction.
         */
    rowDataUpdated: EventEmitter<RowDataUpdatedEvent<TData>>;
    /** Async transactions have been applied. Contains a list of all transaction results.
         */
    asyncTransactionsFlushed: EventEmitter<AsyncTransactionsFlushed<TData>>;
    /** A server side store has finished refreshing.
         */
    storeRefreshed: EventEmitter<StoreRefreshedEvent<TData>>;
    /** Cell is clicked.
         */
    cellClicked: EventEmitter<CellClickedEvent<TData>>;
    /** Cell is double clicked.
         */
    cellDoubleClicked: EventEmitter<CellDoubleClickedEvent<TData>>;
    /** Cell is focused.
         */
    cellFocused: EventEmitter<CellFocusedEvent<TData>>;
    /** Mouse entered cell.
         */
    cellMouseOver: EventEmitter<CellMouseOverEvent<TData>>;
    /** Mouse left cell.
         */
    cellMouseOut: EventEmitter<CellMouseOutEvent<TData>>;
    /** Mouse down on cell.
         */
    cellMouseDown: EventEmitter<CellMouseDownEvent<TData>>;
    /** Row is clicked.
         */
    rowClicked: EventEmitter<RowClickedEvent<TData>>;
    /** Row is double clicked.
         */
    rowDoubleClicked: EventEmitter<RowDoubleClickedEvent<TData>>;
    /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected.
         */
    rowSelected: EventEmitter<RowSelectedEvent<TData>>;
    /** Row selection is changed. Use the grid API `getSelectedNodes()` or `getSelectedRows()` to get the new list of selected nodes / row data.
         */
    selectionChanged: EventEmitter<SelectionChangedEvent<TData>>;
    /** Cell is right clicked.
         */
    cellContextMenu: EventEmitter<CellContextMenuEvent<TData>>;
    /** A change to range selection has occurred.
         */
    rangeSelectionChanged: EventEmitter<RangeSelectionChangedEvent<TData>>;
    /** A tooltip has been displayed     */
    tooltipShow: EventEmitter<TooltipShowEvent<TData>>;
    /** A tooltip was hidden     */
    tooltipHide: EventEmitter<TooltipHideEvent<TData>>;
    /** Sort has changed. The grid also listens for this and updates the model.
         */
    sortChanged: EventEmitter<SortChangedEvent<TData>>;
    /** @deprecated v29.2     */
    columnRowGroupChangeRequest: EventEmitter<ColumnRowGroupChangeRequestEvent<TData>>;
    /** @deprecated v29.2     */
    columnPivotChangeRequest: EventEmitter<ColumnPivotChangeRequestEvent<TData>>;
    /** @deprecated v29.2     */
    columnValueChangeRequest: EventEmitter<ColumnValueChangeRequestEvent<TData>>;
    /** @deprecated v29.2     */
    columnAggFuncChangeRequest: EventEmitter<ColumnAggFuncChangeRequestEvent<TData>>;
    static ngAcceptInputType_suppressMakeColumnVisibleAfterUnGroup: boolean | null | '';
    static ngAcceptInputType_suppressRowClickSelection: boolean | null | '';
    static ngAcceptInputType_suppressCellFocus: boolean | null | '';
    static ngAcceptInputType_suppressHeaderFocus: boolean | null | '';
    static ngAcceptInputType_suppressHorizontalScroll: boolean | null | '';
    static ngAcceptInputType_groupSelectsChildren: boolean | null | '';
    static ngAcceptInputType_alwaysShowHorizontalScroll: boolean | null | '';
    static ngAcceptInputType_alwaysShowVerticalScroll: boolean | null | '';
    static ngAcceptInputType_debug: boolean | null | '';
    static ngAcceptInputType_enableBrowserTooltips: boolean | null | '';
    static ngAcceptInputType_enableCellExpressions: boolean | null | '';
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
    static ngAcceptInputType_alwaysAggregateAtRootLevel: boolean | null | '';
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
    static ngAcceptInputType_includeHiddenColumnsInQuickFilter: boolean | null | '';
    static ngAcceptInputType_excludeHiddenColumnsFromQuickFilter: boolean | null | '';
    static ngAcceptInputType_ensureDomOrder: boolean | null | '';
    static ngAcceptInputType_accentedSort: boolean | null | '';
    static ngAcceptInputType_suppressChangeDetection: boolean | null | '';
    static ngAcceptInputType_valueCache: boolean | null | '';
    static ngAcceptInputType_valueCacheNeverExpires: boolean | null | '';
    static ngAcceptInputType_aggregateOnlyChangedColumns: boolean | null | '';
    static ngAcceptInputType_suppressAnimationFrame: boolean | null | '';
    static ngAcceptInputType_suppressExcelExport: boolean | null | '';
    static ngAcceptInputType_suppressCsvExport: boolean | null | '';
    static ngAcceptInputType_includeHiddenColumnsInAdvancedFilter: boolean | null | '';
    static ngAcceptInputType_suppressMultiRangeSelection: boolean | null | '';
    static ngAcceptInputType_enterMovesDown: boolean | null | '';
    static ngAcceptInputType_enterMovesDownAfterEdit: boolean | null | '';
    static ngAcceptInputType_enterNavigatesVerticallyAfterEdit: boolean | null | '';
    static ngAcceptInputType_enterNavigatesVertically: boolean | null | '';
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
    static ngAcceptInputType_tooltipInteraction: boolean | null | '';
    static ngAcceptInputType_keepDetailRows: boolean | null | '';
    static ngAcceptInputType_paginateChildRows: boolean | null | '';
    static ngAcceptInputType_preventDefaultOnContextMenu: boolean | null | '';
    static ngAcceptInputType_undoRedoCellEditing: boolean | null | '';
    static ngAcceptInputType_allowDragFromColumnsToolPanel: boolean | null | '';
    static ngAcceptInputType_pivotSuppressAutoColumn: boolean | null | '';
    static ngAcceptInputType_suppressExpandablePivotGroups: boolean | null | '';
    static ngAcceptInputType_debounceVerticalScrollbar: boolean | null | '';
    static ngAcceptInputType_detailRowAutoHeight: boolean | null | '';
    static ngAcceptInputType_serverSideFilterAllLevels: boolean | null | '';
    static ngAcceptInputType_serverSideSortAllLevels: boolean | null | '';
    static ngAcceptInputType_serverSideEnableClientSideSort: boolean | null | '';
    static ngAcceptInputType_serverSideOnlyRefreshFilteredGroups: boolean | null | '';
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
    static ngAcceptInputType_readOnlyEdit: boolean | null | '';
    static ngAcceptInputType_suppressRowVirtualisation: boolean | null | '';
    static ngAcceptInputType_enableCellEditingOnBackspace: boolean | null | '';
    static ngAcceptInputType_resetRowDataOnUpdate: boolean | null | '';
    static ngAcceptInputType_removePivotHeaderRowWhenSingleValueColumn: boolean | null | '';
    static ngAcceptInputType_suppressCopySingleCellRanges: boolean | null | '';
    static ngAcceptInputType_suppressGroupRowsSticky: boolean | null | '';
    static ngAcceptInputType_suppressCutToClipboard: boolean | null | '';
    static ngAcceptInputType_suppressServerSideInfiniteScroll: boolean | null | '';
    static ngAcceptInputType_rowGroupPanelSuppressSort: boolean | null | '';
    static ngAcceptInputType_allowShowChangeAfterFilter: boolean | null | '';
    static ngAcceptInputType_enableAdvancedFilter: boolean | null | '';
    static ngAcceptInputType_masterDetail: boolean | null | '';
    static ngAcceptInputType_treeData: boolean | null | '';
    static ngAcceptInputType_suppressGroupMaintainValueType: boolean | null | '';
    static ɵfac: i0.ɵɵFactoryDeclaration<AgGridAngular<any, any>, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AgGridAngular<any, any>, "ag-grid-angular", never, { "gridOptions": "gridOptions"; "modules": "modules"; "statusBar": "statusBar"; "sideBar": "sideBar"; "suppressContextMenu": "suppressContextMenu"; "preventDefaultOnContextMenu": "preventDefaultOnContextMenu"; "allowContextMenuWithControlKey": "allowContextMenuWithControlKey"; "columnMenu": "columnMenu"; "suppressMenuHide": "suppressMenuHide"; "enableBrowserTooltips": "enableBrowserTooltips"; "tooltipTrigger": "tooltipTrigger"; "tooltipShowDelay": "tooltipShowDelay"; "tooltipHideDelay": "tooltipHideDelay"; "tooltipMouseTrack": "tooltipMouseTrack"; "tooltipInteraction": "tooltipInteraction"; "popupParent": "popupParent"; "copyHeadersToClipboard": "copyHeadersToClipboard"; "copyGroupHeadersToClipboard": "copyGroupHeadersToClipboard"; "clipboardDelimiter": "clipboardDelimiter"; "suppressCopyRowsToClipboard": "suppressCopyRowsToClipboard"; "suppressCopySingleCellRanges": "suppressCopySingleCellRanges"; "suppressLastEmptyLineOnPaste": "suppressLastEmptyLineOnPaste"; "suppressClipboardPaste": "suppressClipboardPaste"; "suppressClipboardApi": "suppressClipboardApi"; "suppressCutToClipboard": "suppressCutToClipboard"; "columnDefs": "columnDefs"; "defaultColDef": "defaultColDef"; "defaultColGroupDef": "defaultColGroupDef"; "columnTypes": "columnTypes"; "dataTypeDefinitions": "dataTypeDefinitions"; "maintainColumnOrder": "maintainColumnOrder"; "suppressFieldDotNotation": "suppressFieldDotNotation"; "headerHeight": "headerHeight"; "groupHeaderHeight": "groupHeaderHeight"; "floatingFiltersHeight": "floatingFiltersHeight"; "pivotHeaderHeight": "pivotHeaderHeight"; "pivotGroupHeaderHeight": "pivotGroupHeaderHeight"; "allowDragFromColumnsToolPanel": "allowDragFromColumnsToolPanel"; "suppressMovableColumns": "suppressMovableColumns"; "suppressColumnMoveAnimation": "suppressColumnMoveAnimation"; "suppressDragLeaveHidesColumns": "suppressDragLeaveHidesColumns"; "suppressRowGroupHidesColumns": "suppressRowGroupHidesColumns"; "colResizeDefault": "colResizeDefault"; "suppressAutoSize": "suppressAutoSize"; "autoSizePadding": "autoSizePadding"; "skipHeaderOnAutoSize": "skipHeaderOnAutoSize"; "autoSizeStrategy": "autoSizeStrategy"; "components": "components"; "editType": "editType"; "singleClickEdit": "singleClickEdit"; "suppressClickEdit": "suppressClickEdit"; "readOnlyEdit": "readOnlyEdit"; "stopEditingWhenCellsLoseFocus": "stopEditingWhenCellsLoseFocus"; "enterMovesDown": "enterMovesDown"; "enterMovesDownAfterEdit": "enterMovesDownAfterEdit"; "enterNavigatesVertically": "enterNavigatesVertically"; "enterNavigatesVerticallyAfterEdit": "enterNavigatesVerticallyAfterEdit"; "enableCellEditingOnBackspace": "enableCellEditingOnBackspace"; "undoRedoCellEditing": "undoRedoCellEditing"; "undoRedoCellEditingLimit": "undoRedoCellEditingLimit"; "defaultCsvExportParams": "defaultCsvExportParams"; "suppressCsvExport": "suppressCsvExport"; "defaultExcelExportParams": "defaultExcelExportParams"; "suppressExcelExport": "suppressExcelExport"; "excelStyles": "excelStyles"; "quickFilterText": "quickFilterText"; "cacheQuickFilter": "cacheQuickFilter"; "excludeHiddenColumnsFromQuickFilter": "excludeHiddenColumnsFromQuickFilter"; "includeHiddenColumnsInQuickFilter": "includeHiddenColumnsInQuickFilter"; "quickFilterParser": "quickFilterParser"; "quickFilterMatcher": "quickFilterMatcher"; "excludeChildrenWhenTreeDataFiltering": "excludeChildrenWhenTreeDataFiltering"; "enableAdvancedFilter": "enableAdvancedFilter"; "advancedFilterModel": "advancedFilterModel"; "includeHiddenColumnsInAdvancedFilter": "includeHiddenColumnsInAdvancedFilter"; "advancedFilterParent": "advancedFilterParent"; "advancedFilterBuilderParams": "advancedFilterBuilderParams"; "enableCharts": "enableCharts"; "chartThemes": "chartThemes"; "customChartThemes": "customChartThemes"; "chartThemeOverrides": "chartThemeOverrides"; "enableChartToolPanelsButton": "enableChartToolPanelsButton"; "suppressChartToolPanelsButton": "suppressChartToolPanelsButton"; "chartToolPanelsDef": "chartToolPanelsDef"; "loadingCellRenderer": "loadingCellRenderer"; "loadingCellRendererParams": "loadingCellRendererParams"; "loadingCellRendererSelector": "loadingCellRendererSelector"; "localeText": "localeText"; "masterDetail": "masterDetail"; "keepDetailRows": "keepDetailRows"; "keepDetailRowsCount": "keepDetailRowsCount"; "detailCellRenderer": "detailCellRenderer"; "detailCellRendererParams": "detailCellRendererParams"; "detailRowHeight": "detailRowHeight"; "detailRowAutoHeight": "detailRowAutoHeight"; "context": "context"; "alignedGrids": "alignedGrids"; "tabIndex": "tabIndex"; "rowBuffer": "rowBuffer"; "valueCache": "valueCache"; "valueCacheNeverExpires": "valueCacheNeverExpires"; "enableCellExpressions": "enableCellExpressions"; "suppressParentsInRowNodes": "suppressParentsInRowNodes"; "suppressTouch": "suppressTouch"; "suppressFocusAfterRefresh": "suppressFocusAfterRefresh"; "suppressAsyncEvents": "suppressAsyncEvents"; "suppressBrowserResizeObserver": "suppressBrowserResizeObserver"; "suppressPropertyNamesCheck": "suppressPropertyNamesCheck"; "suppressChangeDetection": "suppressChangeDetection"; "debug": "debug"; "overlayLoadingTemplate": "overlayLoadingTemplate"; "loadingOverlayComponent": "loadingOverlayComponent"; "loadingOverlayComponentParams": "loadingOverlayComponentParams"; "suppressLoadingOverlay": "suppressLoadingOverlay"; "overlayNoRowsTemplate": "overlayNoRowsTemplate"; "noRowsOverlayComponent": "noRowsOverlayComponent"; "noRowsOverlayComponentParams": "noRowsOverlayComponentParams"; "suppressNoRowsOverlay": "suppressNoRowsOverlay"; "pagination": "pagination"; "paginationPageSize": "paginationPageSize"; "paginationPageSizeSelector": "paginationPageSizeSelector"; "paginationAutoPageSize": "paginationAutoPageSize"; "paginateChildRows": "paginateChildRows"; "suppressPaginationPanel": "suppressPaginationPanel"; "pivotMode": "pivotMode"; "pivotPanelShow": "pivotPanelShow"; "pivotDefaultExpanded": "pivotDefaultExpanded"; "pivotColumnGroupTotals": "pivotColumnGroupTotals"; "pivotRowTotals": "pivotRowTotals"; "pivotSuppressAutoColumn": "pivotSuppressAutoColumn"; "suppressExpandablePivotGroups": "suppressExpandablePivotGroups"; "functionsReadOnly": "functionsReadOnly"; "aggFuncs": "aggFuncs"; "suppressAggFuncInHeader": "suppressAggFuncInHeader"; "alwaysAggregateAtRootLevel": "alwaysAggregateAtRootLevel"; "suppressAggAtRootLevel": "suppressAggAtRootLevel"; "aggregateOnlyChangedColumns": "aggregateOnlyChangedColumns"; "suppressAggFilteredOnly": "suppressAggFilteredOnly"; "removePivotHeaderRowWhenSingleValueColumn": "removePivotHeaderRowWhenSingleValueColumn"; "animateRows": "animateRows"; "enableCellChangeFlash": "enableCellChangeFlash"; "cellFlashDuration": "cellFlashDuration"; "cellFlashDelay": "cellFlashDelay"; "cellFadeDuration": "cellFadeDuration"; "cellFadeDelay": "cellFadeDelay"; "allowShowChangeAfterFilter": "allowShowChangeAfterFilter"; "domLayout": "domLayout"; "ensureDomOrder": "ensureDomOrder"; "enableRtl": "enableRtl"; "suppressColumnVirtualisation": "suppressColumnVirtualisation"; "suppressMaxRenderedRowRestriction": "suppressMaxRenderedRowRestriction"; "suppressRowVirtualisation": "suppressRowVirtualisation"; "rowDragManaged": "rowDragManaged"; "suppressRowDrag": "suppressRowDrag"; "suppressMoveWhenRowDragging": "suppressMoveWhenRowDragging"; "rowDragEntireRow": "rowDragEntireRow"; "rowDragMultiRow": "rowDragMultiRow"; "rowDragText": "rowDragText"; "fullWidthCellRenderer": "fullWidthCellRenderer"; "fullWidthCellRendererParams": "fullWidthCellRendererParams"; "embedFullWidthRows": "embedFullWidthRows"; "suppressGroupMaintainValueType": "suppressGroupMaintainValueType"; "groupDisplayType": "groupDisplayType"; "groupDefaultExpanded": "groupDefaultExpanded"; "autoGroupColumnDef": "autoGroupColumnDef"; "groupMaintainOrder": "groupMaintainOrder"; "groupSelectsChildren": "groupSelectsChildren"; "groupLockGroupColumns": "groupLockGroupColumns"; "groupAggFiltering": "groupAggFiltering"; "groupIncludeFooter": "groupIncludeFooter"; "groupIncludeTotalFooter": "groupIncludeTotalFooter"; "groupSuppressBlankHeader": "groupSuppressBlankHeader"; "groupSelectsFiltered": "groupSelectsFiltered"; "showOpenedGroup": "showOpenedGroup"; "groupRemoveSingleChildren": "groupRemoveSingleChildren"; "groupRemoveLowestSingleChildren": "groupRemoveLowestSingleChildren"; "groupHideOpenParents": "groupHideOpenParents"; "groupAllowUnbalanced": "groupAllowUnbalanced"; "rowGroupPanelShow": "rowGroupPanelShow"; "groupRowRenderer": "groupRowRenderer"; "groupRowRendererParams": "groupRowRendererParams"; "suppressMakeColumnVisibleAfterUnGroup": "suppressMakeColumnVisibleAfterUnGroup"; "treeData": "treeData"; "rowGroupPanelSuppressSort": "rowGroupPanelSuppressSort"; "suppressGroupRowsSticky": "suppressGroupRowsSticky"; "pinnedTopRowData": "pinnedTopRowData"; "pinnedBottomRowData": "pinnedBottomRowData"; "rowModelType": "rowModelType"; "rowData": "rowData"; "asyncTransactionWaitMillis": "asyncTransactionWaitMillis"; "suppressModelUpdateAfterUpdateTransaction": "suppressModelUpdateAfterUpdateTransaction"; "datasource": "datasource"; "cacheOverflowSize": "cacheOverflowSize"; "infiniteInitialRowCount": "infiniteInitialRowCount"; "serverSideInitialRowCount": "serverSideInitialRowCount"; "suppressServerSideInfiniteScroll": "suppressServerSideInfiniteScroll"; "cacheBlockSize": "cacheBlockSize"; "maxBlocksInCache": "maxBlocksInCache"; "maxConcurrentDatasourceRequests": "maxConcurrentDatasourceRequests"; "blockLoadDebounceMillis": "blockLoadDebounceMillis"; "purgeClosedRowNodes": "purgeClosedRowNodes"; "serverSideDatasource": "serverSideDatasource"; "serverSideSortAllLevels": "serverSideSortAllLevels"; "serverSideEnableClientSideSort": "serverSideEnableClientSideSort"; "serverSideOnlyRefreshFilteredGroups": "serverSideOnlyRefreshFilteredGroups"; "serverSideFilterAllLevels": "serverSideFilterAllLevels"; "serverSideSortOnServer": "serverSideSortOnServer"; "serverSideFilterOnServer": "serverSideFilterOnServer"; "serverSidePivotResultFieldSeparator": "serverSidePivotResultFieldSeparator"; "viewportDatasource": "viewportDatasource"; "viewportRowModelPageSize": "viewportRowModelPageSize"; "viewportRowModelBufferSize": "viewportRowModelBufferSize"; "alwaysShowHorizontalScroll": "alwaysShowHorizontalScroll"; "alwaysShowVerticalScroll": "alwaysShowVerticalScroll"; "debounceVerticalScrollbar": "debounceVerticalScrollbar"; "suppressHorizontalScroll": "suppressHorizontalScroll"; "suppressScrollOnNewData": "suppressScrollOnNewData"; "suppressScrollWhenPopupsAreOpen": "suppressScrollWhenPopupsAreOpen"; "suppressAnimationFrame": "suppressAnimationFrame"; "suppressMiddleClickScrolls": "suppressMiddleClickScrolls"; "suppressPreventDefaultOnMouseWheel": "suppressPreventDefaultOnMouseWheel"; "scrollbarWidth": "scrollbarWidth"; "rowSelection": "rowSelection"; "rowMultiSelectWithClick": "rowMultiSelectWithClick"; "suppressRowDeselection": "suppressRowDeselection"; "suppressRowClickSelection": "suppressRowClickSelection"; "suppressCellFocus": "suppressCellFocus"; "suppressHeaderFocus": "suppressHeaderFocus"; "suppressMultiRangeSelection": "suppressMultiRangeSelection"; "enableCellTextSelection": "enableCellTextSelection"; "enableRangeSelection": "enableRangeSelection"; "enableRangeHandle": "enableRangeHandle"; "enableFillHandle": "enableFillHandle"; "fillHandleDirection": "fillHandleDirection"; "suppressClearOnFillReduction": "suppressClearOnFillReduction"; "sortingOrder": "sortingOrder"; "accentedSort": "accentedSort"; "unSortIcon": "unSortIcon"; "suppressMultiSort": "suppressMultiSort"; "alwaysMultiSort": "alwaysMultiSort"; "multiSortKey": "multiSortKey"; "suppressMaintainUnsortedOrder": "suppressMaintainUnsortedOrder"; "icons": "icons"; "rowHeight": "rowHeight"; "rowStyle": "rowStyle"; "rowClass": "rowClass"; "rowClassRules": "rowClassRules"; "suppressRowHoverHighlight": "suppressRowHoverHighlight"; "suppressRowTransform": "suppressRowTransform"; "columnHoverHighlight": "columnHoverHighlight"; "gridId": "gridId"; "deltaSort": "deltaSort"; "treeDataDisplayType": "treeDataDisplayType"; "functionsPassive": "functionsPassive"; "enableGroupEdit": "enableGroupEdit"; "initialState": "initialState"; "getContextMenuItems": "getContextMenuItems"; "getMainMenuItems": "getMainMenuItems"; "postProcessPopup": "postProcessPopup"; "processUnpinnedColumns": "processUnpinnedColumns"; "processCellForClipboard": "processCellForClipboard"; "processHeaderForClipboard": "processHeaderForClipboard"; "processGroupHeaderForClipboard": "processGroupHeaderForClipboard"; "processCellFromClipboard": "processCellFromClipboard"; "sendToClipboard": "sendToClipboard"; "processDataFromClipboard": "processDataFromClipboard"; "isExternalFilterPresent": "isExternalFilterPresent"; "doesExternalFilterPass": "doesExternalFilterPass"; "getChartToolbarItems": "getChartToolbarItems"; "createChartContainer": "createChartContainer"; "navigateToNextHeader": "navigateToNextHeader"; "tabToNextHeader": "tabToNextHeader"; "navigateToNextCell": "navigateToNextCell"; "tabToNextCell": "tabToNextCell"; "getLocaleText": "getLocaleText"; "getDocument": "getDocument"; "paginationNumberFormatter": "paginationNumberFormatter"; "getGroupRowAgg": "getGroupRowAgg"; "isGroupOpenByDefault": "isGroupOpenByDefault"; "initialGroupOrderComparator": "initialGroupOrderComparator"; "processPivotResultColDef": "processPivotResultColDef"; "processPivotResultColGroupDef": "processPivotResultColGroupDef"; "getDataPath": "getDataPath"; "getChildCount": "getChildCount"; "getServerSideGroupLevelParams": "getServerSideGroupLevelParams"; "isServerSideGroupOpenByDefault": "isServerSideGroupOpenByDefault"; "isApplyServerSideTransaction": "isApplyServerSideTransaction"; "isServerSideGroup": "isServerSideGroup"; "getServerSideGroupKey": "getServerSideGroupKey"; "getBusinessKeyForNode": "getBusinessKeyForNode"; "getRowId": "getRowId"; "resetRowDataOnUpdate": "resetRowDataOnUpdate"; "processRowPostCreate": "processRowPostCreate"; "isRowSelectable": "isRowSelectable"; "isRowMaster": "isRowMaster"; "fillOperation": "fillOperation"; "postSortRows": "postSortRows"; "getRowStyle": "getRowStyle"; "getRowClass": "getRowClass"; "getRowHeight": "getRowHeight"; "isFullWidthRow": "isFullWidthRow"; }, { "toolPanelVisibleChanged": "toolPanelVisibleChanged"; "toolPanelSizeChanged": "toolPanelSizeChanged"; "columnMenuVisibleChanged": "columnMenuVisibleChanged"; "cutStart": "cutStart"; "cutEnd": "cutEnd"; "pasteStart": "pasteStart"; "pasteEnd": "pasteEnd"; "columnVisible": "columnVisible"; "columnPinned": "columnPinned"; "columnResized": "columnResized"; "columnMoved": "columnMoved"; "columnValueChanged": "columnValueChanged"; "columnPivotModeChanged": "columnPivotModeChanged"; "columnPivotChanged": "columnPivotChanged"; "columnGroupOpened": "columnGroupOpened"; "newColumnsLoaded": "newColumnsLoaded"; "gridColumnsChanged": "gridColumnsChanged"; "displayedColumnsChanged": "displayedColumnsChanged"; "virtualColumnsChanged": "virtualColumnsChanged"; "columnEverythingChanged": "columnEverythingChanged"; "columnHeaderMouseOver": "columnHeaderMouseOver"; "columnHeaderMouseLeave": "columnHeaderMouseLeave"; "columnHeaderClicked": "columnHeaderClicked"; "columnHeaderContextMenu": "columnHeaderContextMenu"; "componentStateChanged": "componentStateChanged"; "cellValueChanged": "cellValueChanged"; "cellEditRequest": "cellEditRequest"; "rowValueChanged": "rowValueChanged"; "cellEditingStarted": "cellEditingStarted"; "cellEditingStopped": "cellEditingStopped"; "rowEditingStarted": "rowEditingStarted"; "rowEditingStopped": "rowEditingStopped"; "undoStarted": "undoStarted"; "undoEnded": "undoEnded"; "redoStarted": "redoStarted"; "redoEnded": "redoEnded"; "rangeDeleteStart": "rangeDeleteStart"; "rangeDeleteEnd": "rangeDeleteEnd"; "filterOpened": "filterOpened"; "filterChanged": "filterChanged"; "filterModified": "filterModified"; "advancedFilterBuilderVisibleChanged": "advancedFilterBuilderVisibleChanged"; "chartCreated": "chartCreated"; "chartRangeSelectionChanged": "chartRangeSelectionChanged"; "chartOptionsChanged": "chartOptionsChanged"; "chartDestroyed": "chartDestroyed"; "cellKeyDown": "cellKeyDown"; "gridReady": "gridReady"; "gridPreDestroyed": "gridPreDestroyed"; "firstDataRendered": "firstDataRendered"; "gridSizeChanged": "gridSizeChanged"; "modelUpdated": "modelUpdated"; "virtualRowRemoved": "virtualRowRemoved"; "viewportChanged": "viewportChanged"; "bodyScroll": "bodyScroll"; "bodyScrollEnd": "bodyScrollEnd"; "dragStarted": "dragStarted"; "dragStopped": "dragStopped"; "stateUpdated": "stateUpdated"; "paginationChanged": "paginationChanged"; "rowDragEnter": "rowDragEnter"; "rowDragMove": "rowDragMove"; "rowDragLeave": "rowDragLeave"; "rowDragEnd": "rowDragEnd"; "columnRowGroupChanged": "columnRowGroupChanged"; "rowGroupOpened": "rowGroupOpened"; "expandOrCollapseAll": "expandOrCollapseAll"; "pinnedRowDataChanged": "pinnedRowDataChanged"; "rowDataUpdated": "rowDataUpdated"; "asyncTransactionsFlushed": "asyncTransactionsFlushed"; "storeRefreshed": "storeRefreshed"; "cellClicked": "cellClicked"; "cellDoubleClicked": "cellDoubleClicked"; "cellFocused": "cellFocused"; "cellMouseOver": "cellMouseOver"; "cellMouseOut": "cellMouseOut"; "cellMouseDown": "cellMouseDown"; "rowClicked": "rowClicked"; "rowDoubleClicked": "rowDoubleClicked"; "rowSelected": "rowSelected"; "selectionChanged": "selectionChanged"; "cellContextMenu": "cellContextMenu"; "rangeSelectionChanged": "rangeSelectionChanged"; "tooltipShow": "tooltipShow"; "tooltipHide": "tooltipHide"; "sortChanged": "sortChanged"; "columnRowGroupChangeRequest": "columnRowGroupChangeRequest"; "columnPivotChangeRequest": "columnPivotChangeRequest"; "columnValueChangeRequest": "columnValueChangeRequest"; "columnAggFuncChangeRequest": "columnAggFuncChangeRequest"; }, never, never, true>;
}
