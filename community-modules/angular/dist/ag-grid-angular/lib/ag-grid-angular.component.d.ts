import { AfterViewInit, ComponentFactoryResolver, ElementRef, EventEmitter, QueryList, ViewContainerRef } from "@angular/core";
import { ColDef, ColumnApi, GridApi, GridOptions, Module, ColGroupDef, ExcelStyle, IDatasource, IServerSideDatasource, IViewportDatasource, IAggFunc, CsvExportParams, ExcelExportParams, StatusPanelDef, SideBarDef, AgChartThemeOverrides, AgChartTheme, ServerSideStoreType, RowGroupingDisplayType, ICellRendererComp, ICellRendererFunc, GetContextMenuItems, GetMainMenuItems, GetRowNodeIdFunc, NavigateToNextHeaderParams, HeaderPosition, TabToNextHeaderParams, NavigateToNextCellParams, CellPosition, TabToNextCellParams, PostProcessPopupParams, GetDataPath, ICellRenderer, ILoadingOverlayComp, INoRowsOverlayComp, RowNode, IsRowMaster, IsRowSelectable, PaginationNumberFormatterParams, ProcessDataFromClipboardParams, GetServerSideGroupKey, IsServerSideGroup, SuppressKeyboardEventParams, ChartRef, ChartOptions, GetChartToolbarItems, FillOperationParams, IsApplyServerSideTransaction, GetServerSideStoreParamsParams, ServerSideStoreParams, IsServerSideGroupOpenByDefaultParams, IsGroupOpenByDefaultParams, ColumnEverythingChangedEvent, NewColumnsLoadedEvent, ColumnPivotModeChangedEvent, ColumnRowGroupChangedEvent, ExpandCollapseAllEvent, ColumnPivotChangedEvent, GridColumnsChangedEvent, ColumnValueChangedEvent, ColumnMovedEvent, ColumnVisibleEvent, ColumnPinnedEvent, ColumnGroupOpenedEvent, ColumnResizedEvent, DisplayedColumnsChangedEvent, VirtualColumnsChangedEvent, AsyncTransactionsFlushed, RowGroupOpenedEvent, RowDataChangedEvent, RowDataUpdatedEvent, PinnedRowDataChangedEvent, RangeSelectionChangedEvent, ChartCreated, ChartRangeSelectionChanged, ChartOptionsChanged, ChartDestroyed, ToolPanelVisibleChangedEvent, ModelUpdatedEvent, PasteStartEvent, PasteEndEvent, FillStartEvent, FillEndEvent, CellClickedEvent, CellDoubleClickedEvent, CellMouseDownEvent, CellContextMenuEvent, CellValueChangedEvent, RowValueChangedEvent, CellFocusedEvent, RowSelectedEvent, SelectionChangedEvent, CellKeyDownEvent, CellKeyPressEvent, CellMouseOverEvent, CellMouseOutEvent, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent, SortChangedEvent, VirtualRowRemovedEvent, RowClickedEvent, RowDoubleClickedEvent, GridReadyEvent, GridSizeChangedEvent, ViewportChangedEvent, FirstDataRenderedEvent, DragStartedEvent, DragStoppedEvent, RowEditingStartedEvent, RowEditingStoppedEvent, CellEditingStartedEvent, CellEditingStoppedEvent, BodyScrollEvent, PaginationChangedEvent, ComponentStateChangedEvent, RowDragEvent, ColumnRowGroupChangeRequestEvent, ColumnPivotChangeRequestEvent, ColumnValueChangeRequestEvent, ColumnAggFuncChangeRequestEvent, ProcessRowParams, ProcessCellForExportParams, ProcessHeaderForExportParams, ProcessChartOptionsParams, RowClassRules, RowClassParams, RowHeightParams, SendToClipboardParams, TreeDataDisplayType, FullWidthCellKeyDownEvent, FullWidthCellKeyPressEvent } from "@ag-grid-community/core";
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
    alignedGrids: GridOptions[] | undefined;
    rowData: any[] | undefined;
    columnDefs: (ColDef | ColGroupDef)[] | undefined;
    excelStyles: ExcelStyle[] | undefined;
    pinnedTopRowData: any[] | undefined;
    pinnedBottomRowData: any[] | undefined;
    chartThemes: string[] | undefined;
    components: {
        [p: string]: any;
    } | undefined;
    frameworkComponents: {
        [p: string]: {
            new (): any;
        };
    } | any | undefined;
    rowStyle: {
        [cssProperty: string]: string;
    } | undefined;
    context: any | undefined;
    autoGroupColumnDef: ColDef | undefined;
    localeText: {
        [key: string]: string;
    } | undefined;
    icons: {
        [key: string]: Function | string;
    } | undefined;
    datasource: IDatasource | undefined;
    serverSideDatasource: IServerSideDatasource | undefined;
    viewportDatasource: IViewportDatasource | undefined;
    groupRowRendererParams: any | undefined;
    aggFuncs: {
        [key: string]: IAggFunc;
    } | undefined;
    fullWidthCellRendererParams: any | undefined;
    defaultColGroupDef: Partial<ColGroupDef> | undefined;
    defaultColDef: ColDef | undefined;
    /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams
     */
    defaultExportParams: CsvExportParams | ExcelExportParams | undefined;
    defaultCsvExportParams: CsvExportParams | undefined;
    defaultExcelExportParams: ExcelExportParams | undefined;
    columnTypes: {
        [key: string]: ColDef;
    } | undefined;
    rowClassRules: RowClassRules | undefined;
    detailCellRendererParams: any | undefined;
    loadingCellRendererParams: any | undefined;
    loadingOverlayComponentParams: any | undefined;
    noRowsOverlayComponentParams: any | undefined;
    popupParent: HTMLElement | undefined;
    colResizeDefault: string | undefined;
    statusBar: {
        statusPanels: StatusPanelDef[];
    } | undefined;
    sideBar: SideBarDef | string | boolean | null | undefined;
    chartThemeOverrides: AgChartThemeOverrides | undefined;
    customChartThemes: {
        [name: string]: AgChartTheme;
    } | undefined;
    sortingOrder: (string | null)[] | undefined;
    rowClass: string | string[] | undefined;
    rowSelection: string | undefined;
    overlayLoadingTemplate: string | undefined;
    overlayNoRowsTemplate: string | undefined;
    quickFilterText: string | undefined;
    rowModelType: string | undefined;
    editType: string | undefined;
    domLayout: string | undefined;
    clipboardDeliminator: string | undefined;
    rowGroupPanelShow: string | undefined;
    multiSortKey: string | undefined;
    pivotColumnGroupTotals: string | undefined;
    pivotRowTotals: string | undefined;
    pivotPanelShow: string | undefined;
    fillHandleDirection: string | undefined;
    serverSideStoreType: ServerSideStoreType | undefined;
    groupDisplayType: RowGroupingDisplayType | undefined;
    treeDataDisplayType: TreeDataDisplayType | undefined;
    rowHeight: number | undefined;
    detailRowHeight: number | undefined;
    rowBuffer: number | undefined;
    colWidth: number | undefined;
    headerHeight: number | undefined;
    groupHeaderHeight: number | undefined;
    floatingFiltersHeight: number | undefined;
    pivotHeaderHeight: number | undefined;
    pivotGroupHeaderHeight: number | undefined;
    groupDefaultExpanded: number | undefined;
    minColWidth: number | undefined;
    maxColWidth: number | undefined;
    viewportRowModelPageSize: number | undefined;
    viewportRowModelBufferSize: number | undefined;
    autoSizePadding: number | undefined;
    maxBlocksInCache: number | undefined;
    maxConcurrentDatasourceRequests: number | undefined;
    tooltipShowDelay: number | undefined;
    cacheOverflowSize: number | undefined;
    paginationPageSize: number | undefined;
    cacheBlockSize: number | undefined;
    infiniteInitialRowCount: number | undefined;
    scrollbarWidth: number | undefined;
    batchUpdateWaitMillis: number | undefined;
    asyncTransactionWaitMillis: number | undefined;
    blockLoadDebounceMillis: number | undefined;
    keepDetailRowsCount: number | undefined;
    undoRedoCellEditingLimit: number | undefined;
    cellFlashDelay: number | undefined;
    cellFadeDelay: number | undefined;
    tabIndex: number | undefined;
    localeTextFunc: (key: string, defaultValue: string) => string | undefined;
    /** @deprecated - this is now groupRowRendererParams.innerRenderer
     */
    groupRowInnerRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    /** @deprecated - this is now groupRowRendererParams.innerRendererFramework
     */
    groupRowInnerRendererFramework: any | undefined;
    dateComponent: any;
    dateComponentFramework: any;
    groupRowRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    groupRowRendererFramework: any | undefined;
    isExternalFilterPresent: () => boolean | undefined;
    getRowHeight: (params: RowHeightParams) => number | undefined | null | undefined;
    doesExternalFilterPass: (node: RowNode) => boolean | undefined;
    getRowClass: (params: RowClassParams) => string | string[] | undefined | undefined;
    getRowStyle: (params: RowClassParams) => {
        [cssProperty: string]: string;
    } | undefined;
    getContextMenuItems: GetContextMenuItems | undefined;
    getMainMenuItems: GetMainMenuItems | undefined;
    processRowPostCreate: (params: ProcessRowParams) => void | undefined;
    processCellForClipboard: (params: ProcessCellForExportParams) => any | undefined;
    groupRowAggNodes: (nodes: RowNode[]) => any | undefined;
    getRowNodeId: GetRowNodeIdFunc | undefined;
    isFullWidthCell: (rowNode: RowNode) => boolean | undefined;
    fullWidthCellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    fullWidthCellRendererFramework: any | undefined;
    processSecondaryColDef: (colDef: ColDef) => void | undefined;
    processSecondaryColGroupDef: (colGroupDef: ColGroupDef) => void | undefined;
    getBusinessKeyForNode: (node: RowNode) => string | undefined;
    sendToClipboard: (params: SendToClipboardParams) => void | undefined;
    navigateToNextHeader: (params: NavigateToNextHeaderParams) => HeaderPosition | undefined;
    tabToNextHeader: (params: TabToNextHeaderParams) => HeaderPosition | undefined;
    navigateToNextCell: (params: NavigateToNextCellParams) => CellPosition | undefined;
    tabToNextCell: (params: TabToNextCellParams) => CellPosition | undefined;
    processCellFromClipboard: (params: ProcessCellForExportParams) => any | undefined;
    getDocument: () => Document | undefined;
    postProcessPopup: (params: PostProcessPopupParams) => void | undefined;
    getChildCount: (dataItem: any) => number | undefined;
    getDataPath: GetDataPath | undefined;
    loadingCellRenderer: {
        new (): ICellRenderer;
    } | string | undefined;
    loadingCellRendererFramework: any | undefined;
    loadingOverlayComponent: {
        new (): ILoadingOverlayComp;
    } | string | undefined;
    loadingOverlayComponentFramework: any | undefined;
    noRowsOverlayComponent: {
        new (): INoRowsOverlayComp;
    } | string | undefined;
    noRowsOverlayComponentFramework: any | undefined;
    detailCellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string | undefined;
    detailCellRendererFramework: any | undefined;
    isRowMaster: IsRowMaster | undefined;
    isRowSelectable: IsRowSelectable | undefined;
    postSort: (nodes: RowNode[]) => void | undefined;
    processHeaderForClipboard: (params: ProcessHeaderForExportParams) => any | undefined;
    paginationNumberFormatter: (params: PaginationNumberFormatterParams) => string | undefined;
    processDataFromClipboard: (params: ProcessDataFromClipboardParams) => string[][] | null | undefined;
    getServerSideGroupKey: GetServerSideGroupKey | undefined;
    isServerSideGroup: IsServerSideGroup | undefined;
    /** Allows user to suppress certain keyboard events     */
    suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => boolean | undefined;
    createChartContainer: (params: ChartRef) => void | undefined;
    /** @deprecated
     */
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions<any> | undefined;
    getChartToolbarItems: GetChartToolbarItems | undefined;
    fillOperation: (params: FillOperationParams) => any | undefined;
    isApplyServerSideTransaction: IsApplyServerSideTransaction | undefined;
    getServerSideStoreParams: (params: GetServerSideStoreParamsParams) => ServerSideStoreParams | undefined;
    isServerSideGroupOpenByDefault: (params: IsServerSideGroupOpenByDefaultParams) => boolean | undefined;
    isGroupOpenByDefault: (params: IsGroupOpenByDefaultParams) => boolean | undefined;
    /** @deprecated - Use defaultGroupOrderComparator instead
     */
    defaultGroupSortComparator: (nodeA: RowNode, nodeB: RowNode) => number | undefined;
    defaultGroupOrderComparator: (nodeA: RowNode, nodeB: RowNode) => number | undefined;
    suppressMakeColumnVisibleAfterUnGroup: boolean | undefined;
    suppressRowClickSelection: boolean | undefined;
    suppressCellSelection: boolean | undefined;
    suppressHorizontalScroll: boolean | undefined;
    alwaysShowHorizontalScroll: boolean | undefined;
    alwaysShowVerticalScroll: boolean | undefined;
    debug: boolean | undefined;
    enableBrowserTooltips: boolean | undefined;
    enableCellExpressions: boolean | undefined;
    angularCompileRows: boolean | undefined;
    angularCompileFilters: boolean | undefined;
    /** @deprecated - Use groupDisplayType = 'custom' instead
     */
    groupSuppressAutoColumn: boolean | undefined;
    groupSelectsChildren: boolean | undefined;
    groupIncludeFooter: boolean | undefined;
    groupIncludeTotalFooter: boolean | undefined;
    /** @deprecated - Use groupDisplayType = 'groupRows' instead
     */
    groupUseEntireRow: boolean | undefined;
    groupSuppressBlankHeader: boolean | undefined;
    suppressMenuHide: boolean | undefined;
    suppressRowDeselection: boolean | undefined;
    unSortIcon: boolean | undefined;
    suppressMultiSort: boolean | undefined;
    singleClickEdit: boolean | undefined;
    suppressLoadingOverlay: boolean | undefined;
    suppressNoRowsOverlay: boolean | undefined;
    suppressAutoSize: boolean | undefined;
    skipHeaderOnAutoSize: boolean | undefined;
    suppressParentsInRowNodes: boolean | undefined;
    suppressColumnMoveAnimation: boolean | undefined;
    suppressMovableColumns: boolean | undefined;
    suppressFieldDotNotation: boolean | undefined;
    enableRangeSelection: boolean | undefined;
    enableRangeHandle: boolean | undefined;
    enableFillHandle: boolean | undefined;
    suppressClearOnFillReduction: boolean | undefined;
    deltaSort: boolean | undefined;
    suppressTouch: boolean | undefined;
    suppressAsyncEvents: boolean | undefined;
    allowContextMenuWithControlKey: boolean | undefined;
    suppressContextMenu: boolean | undefined;
    /** @deprecated - no longer needed, transaction updates keep group state
     */
    rememberGroupStateWhenNewData: boolean | undefined;
    enableCellChangeFlash: boolean | undefined;
    suppressDragLeaveHidesColumns: boolean | undefined;
    suppressMiddleClickScrolls: boolean | undefined;
    suppressPreventDefaultOnMouseWheel: boolean | undefined;
    suppressCopyRowsToClipboard: boolean | undefined;
    copyHeadersToClipboard: boolean | undefined;
    pivotMode: boolean | undefined;
    suppressAggFuncInHeader: boolean | undefined;
    suppressColumnVirtualisation: boolean | undefined;
    suppressAggAtRootLevel: boolean | undefined;
    suppressFocusAfterRefresh: boolean | undefined;
    functionsPassive: boolean | undefined;
    functionsReadOnly: boolean | undefined;
    animateRows: boolean | undefined;
    groupSelectsFiltered: boolean | undefined;
    groupRemoveSingleChildren: boolean | undefined;
    groupRemoveLowestSingleChildren: boolean | undefined;
    enableRtl: boolean | undefined;
    suppressClickEdit: boolean | undefined;
    rowDragManaged: boolean | undefined;
    suppressRowDrag: boolean | undefined;
    suppressMoveWhenRowDragging: boolean | undefined;
    enableMultiRowDragging: boolean | undefined;
    enableGroupEdit: boolean | undefined;
    embedFullWidthRows: boolean | undefined;
    /** @deprecated
     */
    deprecatedEmbedFullWidthRows: boolean | undefined;
    suppressPaginationPanel: boolean | undefined;
    /** @deprecated Use floatingFilter on the colDef instead
     */
    floatingFilter: boolean | undefined;
    groupHideOpenParents: boolean | undefined;
    /** @deprecated - Use groupDisplayType = 'multipleColumns' instead
     */
    groupMultiAutoColumn: boolean | undefined;
    pagination: boolean | undefined;
    /** @deprecated Use stopEditingWhenCellsLoseFocus instead
     */
    stopEditingWhenGridLosesFocus: boolean | undefined;
    paginationAutoPageSize: boolean | undefined;
    suppressScrollOnNewData: boolean | undefined;
    purgeClosedRowNodes: boolean | undefined;
    cacheQuickFilter: boolean | undefined;
    /** @deprecated
     */
    deltaRowDataMode: boolean | undefined;
    ensureDomOrder: boolean | undefined;
    accentedSort: boolean | undefined;
    suppressChangeDetection: boolean | undefined;
    valueCache: boolean | undefined;
    valueCacheNeverExpires: boolean | undefined;
    aggregateOnlyChangedColumns: boolean | undefined;
    suppressAnimationFrame: boolean | undefined;
    suppressExcelExport: boolean | undefined;
    suppressCsvExport: boolean | undefined;
    treeData: boolean | undefined;
    masterDetail: boolean | undefined;
    suppressMultiRangeSelection: boolean | undefined;
    enterMovesDownAfterEdit: boolean | undefined;
    enterMovesDown: boolean | undefined;
    suppressPropertyNamesCheck: boolean | undefined;
    rowMultiSelectWithClick: boolean | undefined;
    suppressEnterpriseResetOnNewColumns: boolean | undefined;
    enableOldSetFilterModel: boolean | undefined;
    suppressRowHoverHighlight: boolean | undefined;
    suppressRowTransform: boolean | undefined;
    suppressClipboardPaste: boolean | undefined;
    suppressLastEmptyLineOnPaste: boolean | undefined;
    serverSideSortingAlwaysResets: boolean | undefined;
    /** @deprecated
     */
    suppressSetColumnStateEvents: boolean | undefined;
    /** @deprecated
     */
    suppressColumnStateEvents: boolean | undefined;
    enableCharts: boolean | undefined;
    /** @deprecated
     */
    deltaColumnMode: boolean | undefined;
    suppressMaintainUnsortedOrder: boolean | undefined;
    enableCellTextSelection: boolean | undefined;
    /** Set once in init, can never change     */
    suppressBrowserResizeObserver: boolean | undefined;
    suppressMaxRenderedRowRestriction: boolean | undefined;
    excludeChildrenWhenTreeDataFiltering: boolean | undefined;
    tooltipMouseTrack: boolean | undefined;
    keepDetailRows: boolean | undefined;
    paginateChildRows: boolean | undefined;
    preventDefaultOnContextMenu: boolean | undefined;
    undoRedoCellEditing: boolean | undefined;
    allowDragFromColumnsToolPanel: boolean | undefined;
    immutableData: boolean | undefined;
    /** @deprecated
     */
    immutableColumns: boolean | undefined;
    pivotSuppressAutoColumn: boolean | undefined;
    suppressExpandablePivotGroups: boolean | undefined;
    /** @deprecated
     */
    applyColumnDefOrder: boolean | undefined;
    debounceVerticalScrollbar: boolean | undefined;
    detailRowAutoHeight: boolean | undefined;
    serverSideFilteringAlwaysResets: boolean | undefined;
    suppressAggFilteredOnly: boolean | undefined;
    showOpenedGroup: boolean | undefined;
    suppressClipboardApi: boolean | undefined;
    suppressModelUpdateAfterUpdateTransaction: boolean | undefined;
    stopEditingWhenCellsLoseFocus: boolean | undefined;
    maintainColumnOrder: boolean | undefined;
    groupMaintainOrder: boolean | undefined;
    columnHoverHighlight: boolean | undefined;
    /** @deprecated
     */
    allowProcessChartOptions: boolean | undefined;
    columnEverythingChanged: EventEmitter<ColumnEverythingChangedEvent>;
    newColumnsLoaded: EventEmitter<NewColumnsLoadedEvent>;
    columnPivotModeChanged: EventEmitter<ColumnPivotModeChangedEvent>;
    columnRowGroupChanged: EventEmitter<ColumnRowGroupChangedEvent>;
    expandOrCollapseAll: EventEmitter<ExpandCollapseAllEvent>;
    columnPivotChanged: EventEmitter<ColumnPivotChangedEvent>;
    gridColumnsChanged: EventEmitter<GridColumnsChangedEvent>;
    columnValueChanged: EventEmitter<ColumnValueChangedEvent>;
    columnMoved: EventEmitter<ColumnMovedEvent>;
    columnVisible: EventEmitter<ColumnVisibleEvent>;
    columnPinned: EventEmitter<ColumnPinnedEvent>;
    columnGroupOpened: EventEmitter<ColumnGroupOpenedEvent>;
    columnResized: EventEmitter<ColumnResizedEvent>;
    displayedColumnsChanged: EventEmitter<DisplayedColumnsChangedEvent>;
    virtualColumnsChanged: EventEmitter<VirtualColumnsChangedEvent>;
    asyncTransactionsFlushed: EventEmitter<AsyncTransactionsFlushed>;
    rowGroupOpened: EventEmitter<RowGroupOpenedEvent>;
    rowDataChanged: EventEmitter<RowDataChangedEvent>;
    rowDataUpdated: EventEmitter<RowDataUpdatedEvent>;
    pinnedRowDataChanged: EventEmitter<PinnedRowDataChangedEvent>;
    rangeSelectionChanged: EventEmitter<RangeSelectionChangedEvent>;
    chartCreated: EventEmitter<ChartCreated>;
    chartRangeSelectionChanged: EventEmitter<ChartRangeSelectionChanged>;
    chartOptionsChanged: EventEmitter<ChartOptionsChanged>;
    chartDestroyed: EventEmitter<ChartDestroyed>;
    toolPanelVisibleChanged: EventEmitter<ToolPanelVisibleChangedEvent>;
    modelUpdated: EventEmitter<ModelUpdatedEvent>;
    pasteStart: EventEmitter<PasteStartEvent>;
    pasteEnd: EventEmitter<PasteEndEvent>;
    fillStart: EventEmitter<FillStartEvent>;
    fillEnd: EventEmitter<FillEndEvent>;
    cellClicked: EventEmitter<CellClickedEvent>;
    cellDoubleClicked: EventEmitter<CellDoubleClickedEvent>;
    cellMouseDown: EventEmitter<CellMouseDownEvent>;
    cellContextMenu: EventEmitter<CellContextMenuEvent>;
    cellValueChanged: EventEmitter<CellValueChangedEvent>;
    rowValueChanged: EventEmitter<RowValueChangedEvent>;
    cellFocused: EventEmitter<CellFocusedEvent>;
    rowSelected: EventEmitter<RowSelectedEvent>;
    selectionChanged: EventEmitter<SelectionChangedEvent>;
    cellKeyDown: EventEmitter<CellKeyDownEvent | FullWidthCellKeyDownEvent>;
    cellKeyPress: EventEmitter<CellKeyPressEvent | FullWidthCellKeyPressEvent>;
    cellMouseOver: EventEmitter<CellMouseOverEvent>;
    cellMouseOut: EventEmitter<CellMouseOutEvent>;
    filterChanged: EventEmitter<FilterChangedEvent>;
    filterModified: EventEmitter<FilterModifiedEvent>;
    filterOpened: EventEmitter<FilterOpenedEvent>;
    sortChanged: EventEmitter<SortChangedEvent>;
    virtualRowRemoved: EventEmitter<VirtualRowRemovedEvent>;
    rowClicked: EventEmitter<RowClickedEvent>;
    rowDoubleClicked: EventEmitter<RowDoubleClickedEvent>;
    gridReady: EventEmitter<GridReadyEvent>;
    gridSizeChanged: EventEmitter<GridSizeChangedEvent>;
    viewportChanged: EventEmitter<ViewportChangedEvent>;
    firstDataRendered: EventEmitter<FirstDataRenderedEvent>;
    dragStarted: EventEmitter<DragStartedEvent>;
    dragStopped: EventEmitter<DragStoppedEvent>;
    rowEditingStarted: EventEmitter<RowEditingStartedEvent>;
    rowEditingStopped: EventEmitter<RowEditingStoppedEvent>;
    cellEditingStarted: EventEmitter<CellEditingStartedEvent>;
    cellEditingStopped: EventEmitter<CellEditingStoppedEvent>;
    bodyScroll: EventEmitter<BodyScrollEvent>;
    paginationChanged: EventEmitter<PaginationChangedEvent>;
    componentStateChanged: EventEmitter<ComponentStateChangedEvent>;
    rowDragEnter: EventEmitter<RowDragEvent>;
    rowDragMove: EventEmitter<RowDragEvent>;
    rowDragLeave: EventEmitter<RowDragEvent>;
    rowDragEnd: EventEmitter<RowDragEvent>;
    columnRowGroupChangeRequest: EventEmitter<ColumnRowGroupChangeRequestEvent>;
    columnPivotChangeRequest: EventEmitter<ColumnPivotChangeRequestEvent>;
    columnValueChangeRequest: EventEmitter<ColumnValueChangeRequestEvent>;
    columnAggFuncChangeRequest: EventEmitter<ColumnAggFuncChangeRequestEvent>;
}
