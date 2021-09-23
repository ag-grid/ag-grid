/************************************************************************************************
 * If you change the GridOptions interface, you must also update PropertyKeys to be consistent. *
 ************************************************************************************************/
import { RowNode } from "./rowNode";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columns/columnApi";
import { Column } from "./column";
import { IViewportDatasource } from "../interfaces/iViewportDatasource";
import { ICellRenderer, ICellRendererComp, ICellRendererFunc } from "../rendering/cellRenderers/iCellRenderer";
import { ColDef, ColGroupDef, IAggFunc, SuppressKeyboardEventParams } from "./colDef";
import { IDatasource } from "../interfaces/iDatasource";
import { CellPosition } from "./cellPosition";
import { IServerSideDatasource } from "../interfaces/iServerSideDatasource";
import { CsvExportParams, ProcessCellForExportParams, ProcessHeaderForExportParams } from "../interfaces/exportParams";
import {
    AsyncTransactionsFlushed,
    BodyScrollEvent,
    CellClickedEvent,
    CellContextMenuEvent,
    CellDoubleClickedEvent,
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    CellFocusedEvent,
    CellKeyDownEvent,
    CellKeyPressEvent,
    CellMouseDownEvent,
    CellMouseOutEvent,
    CellMouseOverEvent,
    CellValueChangedEvent,
    ChartCreated,
    ChartDestroyed,
    ChartOptionsChanged,
    ChartRangeSelectionChanged,
    ColumnAggFuncChangeRequestEvent,
    ColumnEverythingChangedEvent,
    ColumnGroupOpenedEvent,
    ColumnMovedEvent,
    ColumnPinnedEvent,
    ColumnPivotChangedEvent,
    ColumnPivotChangeRequestEvent,
    ColumnPivotModeChangedEvent,
    ColumnResizedEvent,
    ColumnRowGroupChangedEvent,
    ColumnRowGroupChangeRequestEvent,
    ColumnValueChangedEvent,
    ColumnValueChangeRequestEvent,
    ColumnVisibleEvent,
    ComponentStateChangedEvent,
    DisplayedColumnsChangedEvent,
    DragStartedEvent,
    DragStoppedEvent,
    ExpandCollapseAllEvent,
    FillEndEvent,
    FillStartEvent,
    FilterOpenedEvent,
    FilterChangedEvent,
    FilterModifiedEvent,
    FirstDataRenderedEvent,
    GridColumnsChangedEvent,
    GridReadyEvent,
    ModelUpdatedEvent,
    NewColumnsLoadedEvent,
    PaginationChangedEvent,
    PasteEndEvent,
    PasteStartEvent,
    PinnedRowDataChangedEvent,
    RangeSelectionChangedEvent,
    RowClickedEvent,
    RowDataChangedEvent,
    RowDataUpdatedEvent,
    RowDoubleClickedEvent,
    RowDragEvent,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
    RowGroupOpenedEvent,
    RowSelectedEvent,
    RowValueChangedEvent,
    SelectionChangedEvent,
    SortChangedEvent,
    ToolPanelVisibleChangedEvent,
    ViewportChangedEvent,
    VirtualColumnsChangedEvent,
    VirtualRowRemovedEvent,
    GridSizeChangedEvent,
    FullWidthCellKeyPressEvent,
    FullWidthCellKeyDownEvent
} from "../events";
import { IComponent } from "../interfaces/iComponent";
import { ILoadingOverlayComp } from "../rendering/overlays/loadingOverlayComponent";
import { INoRowsOverlayComp } from "../rendering/overlays/noRowsOverlayComponent";
import { StatusPanelDef } from "../interfaces/iStatusPanel";
import { SideBarDef } from "./sideBar";
import { ChartMenuOptions, ChartOptions, ChartType } from "../interfaces/iChartOptions";
import { AgChartOptions, AgChartTheme, AgChartThemeOverrides } from "../interfaces/iAgChartOptions";
import { ServerSideTransaction } from "../interfaces/serverSideTransaction";
import { HeaderPosition } from "../headerRendering/common/headerPosition";
import { ExcelExportParams, ExcelStyle } from "../interfaces/iExcelCreator";
import { ILoadingCellRendererParams } from "../rendering/cellRenderers/loadingCellRenderer";

export interface GridOptions {

    // ******************************************************************************************************
    // If you change the properties on this interface, you must also update PropertyKeys to be consistent. *
    // ******************************************************************************************************

    // *** Accessories *** //
    /** Specifies the status bar components to use in the status bar. */
    statusBar?: { statusPanels: StatusPanelDef[]; };
    sideBar?: SideBarDef | string | boolean | null;
    suppressContextMenu?: boolean;
    preventDefaultOnContextMenu?: boolean;
    allowContextMenuWithControlKey?: boolean;
    suppressMenuHide?: boolean;
    enableBrowserTooltips?: boolean;
    tooltipShowDelay?: number;
    tooltipMouseTrack?: boolean;
    popupParent?: HTMLElement;

    // *** Clipboard *** //
    copyHeadersToClipboard?: boolean;
    clipboardDeliminator?: string;
    suppressCopyRowsToClipboard?: boolean;
    suppressLastEmptyLineOnPaste?: boolean;
    suppressClipboardPaste?: boolean;
    suppressClipboardApi?: boolean;

    // *** Columns *** //
    columnDefs?: (ColDef | ColGroupDef)[] | null;
    defaultColGroupDef?: Partial<ColGroupDef>;
    defaultColDef?: ColDef;
    columnTypes?: { [key: string]: ColDef; };
    maintainColumnOrder?: boolean;
    suppressFieldDotNotation?: boolean;

    /** @deprecated */
    deltaColumnMode?: boolean;
    /** @deprecated */
    applyColumnDefOrder?: boolean; // is now the default, to turn off, set maintainColumnOrder
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

    // *** Column Headers *** //
    headerHeight?: number;
    groupHeaderHeight?: number;
    floatingFiltersHeight?: number;
    pivotHeaderHeight?: number;
    pivotGroupHeaderHeight?: number;

    // *** Column Moving *** //
    allowDragFromColumnsToolPanel?: boolean;
    suppressMovableColumns?: boolean;
    suppressColumnMoveAnimation?: boolean;
    suppressDragLeaveHidesColumns?: boolean;

    // *** Column Sizing *** //
    colResizeDefault?: string;
    suppressAutoSize?: boolean;
    autoSizePadding?: number;
    skipHeaderOnAutoSize?: boolean;

    // *** Components *** //
    components?: { [p: string]: any; };
    frameworkComponents?: { [p: string]: { new(): any; }; } | any;

    // *** Editing *** //
    editType?: string;
    singleClickEdit?: boolean;
    suppressClickEdit?: boolean;
    enterMovesDownAfterEdit?: boolean;
    enterMovesDown?: boolean;
    stopEditingWhenCellsLoseFocus?: boolean;
    undoRedoCellEditing?: boolean;
    undoRedoCellEditingLimit?: number;

    /** @deprecated Use stopEditingWhenCellsLoseFocus instead */
    stopEditingWhenGridLosesFocus?: boolean;

    // *** Export *** //
    defaultCsvExportParams?: CsvExportParams;
    suppressCsvExport?: boolean;
    defaultExcelExportParams?: ExcelExportParams;
    suppressExcelExport?: boolean;
    excelStyles?: ExcelStyle[];
    /** @deprecated Use defaultCsvExportParams or defaultExcelExportParams */
    defaultExportParams?: CsvExportParams | ExcelExportParams;

    // *** Filter *** //
    quickFilterText?: string;
    cacheQuickFilter?: boolean;
    excludeChildrenWhenTreeDataFiltering?: boolean;
    /** @deprecated Use floatingFilter on the colDef instead */
    floatingFilter?: boolean;
    /** @deprecated */
    enableOldSetFilterModel?: boolean;

    // *** Integrated Charts *** //
    enableCharts?: boolean;
    chartThemes?: string[];
    customChartThemes?: { [name: string]: AgChartTheme };
    chartThemeOverrides?: AgChartThemeOverrides;

    /** @deprecated */
    processChartOptions?(params: ProcessChartOptionsParams): ChartOptions<any>;
    // Note: processChartOptions() no longer works, however this temporary option has been added as a failsafe
    /** @deprecated */
    allowProcessChartOptions?: boolean;

    // *** Loading Cell Renderers *** //
    loadingCellRenderer?: { new(): ICellRenderer; } | string;
    loadingCellRendererFramework?: any;
    loadingCellRendererParams?: any;
    loadingCellRendererSelector?: LoadingCellRendererSelectorFunc;

    // *** Localisation *** //
    // just set once
    localeText?: { [key: string]: string };

    // *** Master Detail *** //
    masterDetail?: boolean;
    detailRowHeight?: number;
    keepDetailRows?: boolean;
    keepDetailRowsCount?: number;
    detailCellRendererParams?: any;
    detailCellRenderer?: { new(): ICellRendererComp; } | ICellRendererFunc | string;
    detailCellRendererFramework?: any;
    detailRowAutoHeight?: boolean;

    // *** Miscellaneous *** //
    // changeable, but no immediate impact
    context?: any;
    alignedGrids?: GridOptions[];
    tabIndex?: number;
    rowBuffer?: number;
    valueCache?: boolean;
    valueCacheNeverExpires?: boolean;
    enableCellExpressions?: boolean;
    suppressParentsInRowNodes?: boolean;
    suppressTouch?: boolean;
    suppressFocusAfterRefresh?: boolean;
    suppressAsyncEvents?: boolean;
    /** Set once in init, can never change*/
    suppressBrowserResizeObserver?: boolean;
    suppressPropertyNamesCheck?: boolean;
    suppressChangeDetection?: boolean;
    debug?: boolean;

    // *** Overlays *** //
    overlayLoadingTemplate?: string;
    loadingOverlayComponent?: { new(): ILoadingOverlayComp; } | string;
    loadingOverlayComponentFramework?: any;
    loadingOverlayComponentParams?: any;
    suppressLoadingOverlay?: boolean;

    overlayNoRowsTemplate?: string;
    noRowsOverlayComponent?: { new(): INoRowsOverlayComp; } | string;
    noRowsOverlayComponentFramework?: any;
    noRowsOverlayComponentParams?: any;
    suppressNoRowsOverlay?: boolean;

    // *** Pagination *** //
    pagination?: boolean;
    paginationPageSize?: number;
    paginationAutoPageSize?: boolean;
    paginateChildRows?: boolean;
    suppressPaginationPanel?: boolean;

    // *** Pivot and Aggregation *** //
    pivotMode?: boolean;
    pivotPanelShow?: string;
    pivotColumnGroupTotals?: string;
    pivotRowTotals?: string;
    pivotSuppressAutoColumn?: boolean;
    suppressExpandablePivotGroups?: boolean;
    functionsReadOnly?: boolean;
    aggFuncs?: { [key: string]: IAggFunc; };
    suppressAggFuncInHeader?: boolean;
    suppressAggAtRootLevel?: boolean;
    aggregateOnlyChangedColumns?: boolean;
    suppressAggFilteredOnly?: boolean;

    // *** Rendering *** //
    animateRows?: boolean;
    enableCellChangeFlash?: boolean;
    cellFlashDelay?: number;
    cellFadeDelay?: number;
    allowShowChangeAfterFilter?: boolean;
    domLayout?: string;
    ensureDomOrder?: boolean;
    enableRtl?: boolean;
    suppressColumnVirtualisation?: boolean;
    suppressMaxRenderedRowRestriction?: boolean;

    // *** Row Drag and Drop *** //
    rowDragManaged?: boolean;
    suppressRowDrag?: boolean;
    suppressMoveWhenRowDragging?: boolean;
    rowDragEntireRow?: boolean;
    rowDragMultiRow?: boolean;

    // *** Row Full Width *** //
    fullWidthCellRenderer?: { new(): ICellRendererComp; } | ICellRendererFunc | string;
    fullWidthCellRendererFramework?: any;
    fullWidthCellRendererParams?: any;
    embedFullWidthRows?: boolean;
    /** @deprecated */
    deprecatedEmbedFullWidthRows?: boolean;

    // *** Row Grouping *** //
    groupDisplayType?: RowGroupingDisplayType;
    groupDefaultExpanded?: number;
    autoGroupColumnDef?: ColDef;
    groupMaintainOrder?: boolean;
    groupSelectsChildren?: boolean;
    groupIncludeFooter?: boolean;
    groupIncludeTotalFooter?: boolean;
    groupSuppressBlankHeader?: boolean;
    groupSelectsFiltered?: boolean;
    showOpenedGroup?: boolean;
    groupRemoveSingleChildren?: boolean;
    groupRemoveLowestSingleChildren?: boolean;
    groupHideOpenParents?: boolean;
    rowGroupPanelShow?: string;
    groupRowRenderer?: { new(): ICellRendererComp; } | ICellRendererFunc | string;
    groupRowRendererFramework?: any;
    groupRowRendererParams?: any;
    suppressMakeColumnVisibleAfterUnGroup?: boolean;

    treeData?: boolean;

    /** @deprecated - this is now groupRowRendererParams.innerRenderer */
    groupRowInnerRenderer?: { new(): ICellRendererComp; } | ICellRendererFunc | string;
    /** @deprecated - this is now groupRowRendererParams.innerRendererFramework */
    groupRowInnerRendererFramework?: any;
    /** @deprecated - Use groupDisplayType = 'multipleColumns' instead */
    groupMultiAutoColumn?: boolean;
    /** @deprecated - Use groupDisplayType = 'groupRows' instead */
    groupUseEntireRow?: boolean;
    /** @deprecated - Use groupDisplayType = 'custom' instead */
    groupSuppressAutoColumn?: boolean;
    /** @deprecated - no longer needed, transaction updates keep group state */
    rememberGroupStateWhenNewData?: boolean;

    // *** Row Pinning *** //
    pinnedTopRowData?: any[];
    pinnedBottomRowData?: any[];

    // *** Row Model *** //
    rowModelType?: string;

    // *** Row Model: Client-side *** //
    // changeable with impact
    rowData?: any[] | null;
    immutableData?: boolean;
    asyncTransactionWaitMillis?: number;
    suppressModelUpdateAfterUpdateTransaction?: boolean;
    /** @deprecated */
    deltaRowDataMode?: boolean;
    /** @deprecated use asyncTransactionWaitMillis instead */
    batchUpdateWaitMillis?: number;

    // *** Row Model: Infinite / Server-side *** //
    datasource?: IDatasource;
    cacheOverflowSize?: number;
    infiniteInitialRowCount?: number;
    serverSideStoreType?: ServerSideStoreType;
    cacheBlockSize?: number;
    maxBlocksInCache?: number;
    maxConcurrentDatasourceRequests?: number;
    blockLoadDebounceMillis?: number;
    purgeClosedRowNodes?: boolean;
    serverSideDatasource?: IServerSideDatasource;
    serverSideSortingAlwaysResets?: boolean;
    serverSideFilteringAlwaysResets?: boolean;

    /** @deprecated */
    suppressEnterpriseResetOnNewColumns?: boolean;

    // *** Row Model: Viewport *** //
    viewportDatasource?: IViewportDatasource;
    viewportRowModelPageSize?: number;
    viewportRowModelBufferSize?: number;

    // *** Scrolling *** //
    alwaysShowHorizontalScroll?: boolean;
    alwaysShowVerticalScroll?: boolean;
    debounceVerticalScrollbar?: boolean;
    suppressHorizontalScroll?: boolean;
    suppressScrollOnNewData?: boolean;
    suppressAnimationFrame?: boolean;
    suppressMiddleClickScrolls?: boolean;
    suppressPreventDefaultOnMouseWheel?: boolean;
    scrollbarWidth?: number;

    // *** Selection *** //
    rowSelection?: string;
    rowMultiSelectWithClick?: boolean;
    suppressRowDeselection?: boolean;
    suppressRowClickSelection?: boolean;
    suppressCellSelection?: boolean;
    suppressMultiRangeSelection?: boolean;
    enableCellTextSelection?: boolean;
    // enterprise only
    enableRangeSelection?: boolean;
    enableRangeHandle?: boolean;
    enableFillHandle?: boolean;
    fillHandleDirection?: string;
    suppressClearOnFillReduction?: boolean;

    /** @deprecated - rowDeselection is now true by default and should be suppressed by using suppressRowDeselection */
    rowDeselection?: boolean;

    // *** Sorting *** //
    sortingOrder?: (string | null)[];
    accentedSort?: boolean;
    unSortIcon?: boolean;
    suppressMultiSort?: boolean;
    multiSortKey?: string;
    suppressMaintainUnsortedOrder?: boolean;

    // *** Styling *** //
    icons?: { [key: string]: Function | string; };
    rowHeight?: number;
    rowStyle?: { [cssProperty: string]: string };
    rowClass?: string | string[];
    rowClassRules?: RowClassRules;
    suppressRowHoverHighlight?: boolean;
    suppressRowTransform?: boolean;
    columnHoverHighlight?: boolean;

    deltaSort?: boolean;
    treeDataDisplayType?: TreeDataDisplayType;
    angularCompileRows?: boolean;
    angularCompileFilters?: boolean;
    functionsPassive?: boolean;
    enableGroupEdit?: boolean;

    // *****************************************************************************************************
    // If you change the callbacks on this interface, you must also update PropertyKeys to be consistent. *
    // *****************************************************************************************************

    // *** Accessories *** //
    getContextMenuItems?: GetContextMenuItems;
    getMainMenuItems?: GetMainMenuItems;
    postProcessPopup?: (params: PostProcessPopupParams) => void;

    // *** Clipboard *** //
    processCellForClipboard?(params: ProcessCellForExportParams): any;
    processHeaderForClipboard?(params: ProcessHeaderForExportParams): any;
    processCellFromClipboard?(params: ProcessCellForExportParams): any;
    sendToClipboard?: (params: SendToClipboardParams) => void;
    processDataFromClipboard?: (params: ProcessDataFromClipboardParams) => string[][] | null;

    // *** Filtering *** //
    isExternalFilterPresent?(): boolean;
    doesExternalFilterPass?(node: RowNode): boolean;

    // *** Integrated Charts *** //
    getChartToolbarItems?: GetChartToolbarItems;
    createChartContainer?: (params: ChartRef) => void;

    // *** Keyboard Navigation *** //
    navigateToNextHeader?: (params: NavigateToNextHeaderParams) => HeaderPosition;
    tabToNextHeader?: (params: TabToNextHeaderParams) => HeaderPosition;
    navigateToNextCell?: (params: NavigateToNextCellParams) => CellPosition;
    tabToNextCell?: (params: TabToNextCellParams) => CellPosition;
    /** Allows user to suppress certain keyboard events */
    suppressKeyboardEvent?: (params: SuppressKeyboardEventParams) => boolean;

    // *** Localisation *** //
    localeTextFunc?: (key: string, defaultValue: string) => string;

    // *** Miscellaneous *** //
    getDocument?: () => Document;

    // *** Pagination *** //
    paginationNumberFormatter?: (params: PaginationNumberFormatterParams) => string;

    // *** Row Grouping and Pivoting *** //
    groupRowAggNodes?(nodes: RowNode[]): any;
    isGroupOpenByDefault?: (params: IsGroupOpenByDefaultParams) => boolean;
    defaultGroupOrderComparator?: (nodeA: RowNode, nodeB: RowNode) => number;
    processSecondaryColDef?(colDef: ColDef): void;
    processSecondaryColGroupDef?(colGroupDef: ColGroupDef): void;
    getDataPath?: GetDataPath;
    /** @deprecated - Use defaultGroupOrderComparator instead */
    defaultGroupSortComparator?: (nodeA: RowNode, nodeB: RowNode) => number;

    // *** Row Model: Server Side *** //
    getChildCount?(dataItem: any): number;
    getServerSideStoreParams?: (params: GetServerSideStoreParamsParams) => ServerSideStoreParams;
    isServerSideGroupOpenByDefault?: (params: IsServerSideGroupOpenByDefaultParams) => boolean;
    isApplyServerSideTransaction?: IsApplyServerSideTransaction;
    isServerSideGroup?: IsServerSideGroup;
    getServerSideGroupKey?: GetServerSideGroupKey;

    // *** Rows *** //
    getBusinessKeyForNode?(node: RowNode): string;
    getRowNodeId?: GetRowNodeIdFunc;
    processRowPostCreate?(params: ProcessRowParams): void;
    isRowSelectable?: IsRowSelectable;
    isRowMaster?: IsRowMaster;
    fillOperation?: (params: FillOperationParams) => any;

    // *** Sorting *** //
    postSort?(nodes: RowNode[]): void;

    // *** Styling *** //
    getRowStyle?: (params: RowClassParams) => { [cssProperty: string]: string };
    getRowClass?: (params: RowClassParams) => string | string[] | undefined;
    getRowHeight?: (params: RowHeightParams) => number | undefined | null;
    isFullWidthCell?(rowNode: RowNode): boolean;

    // **********************************************************************************************************
    // * If you change the events on this interface, you do *not* need to update PropertyKeys to be consistent, *
    // * as event callbacks are automatically generated.                                                        *
    // **********************************************************************************************************

    // *** Accessories *** //
    onToolPanelVisibleChanged?(event: ToolPanelVisibleChangedEvent): void;

    // *** Clipboard *** //
    onPasteStart?(event: PasteStartEvent): void;
    onPasteEnd?(event: PasteEndEvent): void;

    // *** Columns *** //
    onColumnVisible?(event: ColumnVisibleEvent): void;
    onColumnPinned?(event: ColumnPinnedEvent): void;
    onColumnResized?(event: ColumnResizedEvent): void;
    onColumnMoved?(event: ColumnMovedEvent): void;
    onColumnValueChanged?(event: ColumnValueChangedEvent): void;
    onColumnPivotModeChanged?(event: ColumnPivotModeChangedEvent): void;
    onColumnPivotChanged?(event: ColumnPivotChangedEvent): void;
    onColumnGroupOpened?(event: ColumnGroupOpenedEvent): void;
    onNewColumnsLoaded?(event: NewColumnsLoadedEvent): void;
    onGridColumnsChanged?(event: GridColumnsChangedEvent): void;
    onDisplayedColumnsChanged?(event: DisplayedColumnsChangedEvent): void;
    onVirtualColumnsChanged?(event: VirtualColumnsChangedEvent): void;
    onColumnEverythingChanged?(event: ColumnEverythingChangedEvent): void;

    // *** Components *** //
    onComponentStateChanged?(event: ComponentStateChangedEvent): void;

    // *** Editing *** //
    onCellValueChanged?(event: CellValueChangedEvent): void;
    onRowValueChanged?(event: RowValueChangedEvent): void;
    onCellEditingStarted?(event: CellEditingStartedEvent): void;
    onCellEditingStopped?(event: CellEditingStoppedEvent): void;
    onRowEditingStarted?(event: RowEditingStartedEvent): void;
    onRowEditingStopped?(event: RowEditingStoppedEvent): void;

    // *** Filtering *** //
    onFilterOpened?(event: FilterOpenedEvent): void;
    onFilterChanged?(event: FilterChangedEvent): void;
    onFilterModified?(event: FilterModifiedEvent): void;

    // *** Integrated Charts *** //
    onChartCreated?(event: ChartCreated): void;
    onChartRangeSelectionChanged?(event: ChartRangeSelectionChanged): void;
    onChartOptionsChanged?(event: ChartOptionsChanged): void;
    onChartDestroyed?(event: ChartDestroyed): void;

    // *** Keyboard Navigation *** //
    onCellKeyDown?(event: CellKeyDownEvent | FullWidthCellKeyDownEvent): void;
    onCellKeyPress?(event: CellKeyPressEvent | FullWidthCellKeyPressEvent): void;

    // *** Miscellaneous *** //
    onGridReady?(event: GridReadyEvent): void;
    onFirstDataRendered?(event: FirstDataRenderedEvent): void;
    onGridSizeChanged?(event: GridSizeChangedEvent): void;
    onModelUpdated?(event: ModelUpdatedEvent): void;
    onVirtualRowRemoved?(event: VirtualRowRemovedEvent): void;
    onViewportChanged?(event: ViewportChangedEvent): void;
    onBodyScroll?(event: BodyScrollEvent): void;
    onDragStarted?(event: DragStartedEvent): void;
    onDragStopped?(event: DragStoppedEvent): void;

    // *** Pagination *** //
    onPaginationChanged?(event: PaginationChangedEvent): void;

    // *** Row Drag and Drop *** //
    onRowDragEnter?(event: RowDragEvent): void;
    onRowDragMove?(event: RowDragEvent): void;
    onRowDragLeave?(event: RowDragEvent): void;
    onRowDragEnd?(event: RowDragEvent): void;

    // *** Row Grouping *** //
    onColumnRowGroupChanged?(event: ColumnRowGroupChangedEvent): void;
    onRowGroupOpened?(event: RowGroupOpenedEvent): void;
    onExpandOrCollapseAll?(event: ExpandCollapseAllEvent): void;

    // *** Row Pinning *** //
    onPinnedRowDataChanged?(event: PinnedRowDataChangedEvent): void;

    // *** Row Model: Client Side *** //
    onRowDataChanged?(event: RowDataChangedEvent): void;
    onRowDataUpdated?(event: RowDataUpdatedEvent): void;
    onAsyncTransactionsFlushed?(event: AsyncTransactionsFlushed): void;

    // *** Selection *** //
    onCellClicked?(event: CellClickedEvent): void;
    onCellDoubleClicked?(event: CellDoubleClickedEvent): void;
    onCellFocused?(event: CellFocusedEvent): void;
    onCellMouseOver?(event: CellMouseOverEvent): void;
    onCellMouseOut?(event: CellMouseOutEvent): void;
    onCellMouseDown?(event: CellMouseDownEvent): void;
    onRowClicked?(event: RowClickedEvent): void;
    onRowDoubleClicked?(event: RowDoubleClickedEvent): void;
    onRowSelected?(event: RowSelectedEvent): void;
    onSelectionChanged?(event: SelectionChangedEvent): void;
    onCellContextMenu?(event: CellContextMenuEvent): void;
    onRangeSelectionChanged?(event: RangeSelectionChangedEvent): void;
    onFillStart?(event: FillStartEvent): void;
    onFillEnd?(event: FillEndEvent): void;

    // *** Sorting *** //
    onSortChanged?(event: SortChangedEvent): void;

    onColumnRowGroupChangeRequest?(event: ColumnRowGroupChangeRequestEvent): void;
    onColumnPivotChangeRequest?(event: ColumnPivotChangeRequestEvent): void;
    onColumnValueChangeRequest?(event: ColumnValueChangeRequestEvent): void;
    onColumnAggFuncChangeRequest?(event: ColumnAggFuncChangeRequestEvent): void;

    // apis, set by the grid on init, set to null on destroy
    api?: GridApi | null;
    columnApi?: ColumnApi | null;
}

export enum RowGroupingDisplayType {
    SINGLE_COLUMN = 'singleColumn',
    MULTIPLE_COLUMNS = 'multipleColumns',
    GROUP_ROWS = 'groupRows',
    CUSTOM = 'custom',
}

export enum TreeDataDisplayType {
    AUTO = 'auto',
    CUSTOM = 'custom',
}

export interface FillOperationParams {
    /** The mouse event for the fill operation. */
    event: MouseEvent;
    /** The values that have been processed by the fill operation. */
    values: any[];
    /** The RowNode of the current cell being changed. */
    rowNode: RowNode;
    /** The Column of the current cell being changed. */
    column: Column;
    /** The values that were present before processing started. */
    initialValues: any[];
    /** The index of the current processed value. */
    currentIndex: number;
    /** The value of the cell being currently processed by the Fill Operation. */
    currentCellValue: any;
    /** The direction of the Fill Operation. */
    direction: 'up' | 'down' | 'left' | 'right';
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}

export interface GetDataPath {
    (data: any): string[];
}

export interface IsServerSideGroup {
    (dataItem: any): boolean;
}

export interface IsApplyServerSideTransaction {
    (params: IsApplyServerSideTransactionParams): boolean;
}

export interface IsApplyServerSideTransactionParams {
    /** The transaction getting applied. */
    transaction: ServerSideTransaction;
    /** The parent RowNode, if transaction is applied to a group. */
    parentNode: RowNode;
    //** Store info, if any, as passed via the success() callback when loading data. */
    storeInfo: any;
}

export interface GetServerSideGroupKey {
    (dataItem: any): string;
}

export interface IsRowMaster {
    (dataItem: any): boolean;
}

export interface IsRowSelectable {
    (node: RowNode): boolean;
}

export interface RowClassRules {
    [cssClassName: string]: (((params: RowClassParams) => boolean) | string);
}

export interface RowClassParams {
    /** The data associated with this row from rowData */
    data: any;
    /** The RowNode associated with this row */
    node: RowNode;
    /** The index of the row */
    rowIndex: number;
    /** If using AngularJs, is the row's child scope, otherwise null */
    $scope: any;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}

export interface RowHeightParams {
    data: any;
    node: RowNode;
    api: GridApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}

export interface SendToClipboardParams {
    data: string;
}

export interface ProcessChartOptionsParams {
    type: ChartType;
    options: ChartOptions<any>;
}

export interface ProcessChartParams {
    type: ChartType;
    options: AgChartOptions;
    chart: any;
}

export interface GetContextMenuItemsParams {
    /** Names of the items that would be provided by default. */
    defaultItems: string[] | undefined;
    /** The column, if a cell was clicked, otherwise null. */
    column: Column | null;
    /** The row node, if a cell was clicked, otherwise null. */
    node: RowNode | null;
    /** The value, if a cell was clicked, otherwise null.  */
    value: any;
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}

export interface GetContextMenuItems {
    (params: GetContextMenuItemsParams): (string | MenuItemDef)[];
}

export interface GetChartToolbarItemsParams {
    defaultItems?: ChartMenuOptions[];
    api: GridApi;
    columnApi: ColumnApi;
}

export interface GetChartToolbarItems {
    (params: GetChartToolbarItemsParams): ChartMenuOptions[];
}

export interface MenuItemDef {
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
    /** If this item is a sub menu, contains a list of menu item definitions */
    subMenu?: (MenuItemDef | string)[] | IComponent<any>;
    /** CSS classes to apply to the menu item */
    cssClasses?: string[];
    /** Tooltip for the menu item */
    tooltip?: string;
}

export interface GetMainMenuItemsParams {
    /** The column that was clicked */
    column: Column;
    /** List of the items that would be displayed by default */
    defaultItems: string[];
    api: GridApi;
    columnApi: ColumnApi;
    /** The context as provided on `gridOptions.context` */
    context: any;
}

export interface GetMainMenuItems {
    (params: GetMainMenuItemsParams): (string | MenuItemDef)[];
}

export interface GetRowNodeIdFunc {
    (data: any): string;
}

export interface ProcessRowParams {
    eRow: HTMLElement;
    ePinnedLeftRow: HTMLElement;
    ePinnedRightRow: HTMLElement;
    rowIndex: number;
    node: RowNode;
    api: GridApi;
    columnApi: ColumnApi;
    addRenderedRowListener: (eventType: string, listener: Function) => void;
    /** The context as provided on `gridOptions.context` */
    context: any;
}

export interface NavigateToNextHeaderParams {
    /** The key for the arrow key pressed,
     *  left = 'ArrowLeft', up = 'ArrowUp', right = 'ArrowRight', down = 'ArrowDown' */
    key: string;
    /** The header that currently has focus */
    previousHeaderPosition: HeaderPosition | null;
    /** The header the grid would normally pick as the next header for this navigation */
    nextHeaderPosition: HeaderPosition | null;
    /** The number of header rows present in the grid */
    headerRowCount: number;
    event: KeyboardEvent;
    api: GridApi;
    columnApi: ColumnApi;
}

export interface TabToNextHeaderParams {
    /** True if the Shift key is also down */
    backwards: boolean;
    /** The header that currently has focus */
    previousHeaderPosition: HeaderPosition | null;
    /** The header the grid would normally pick as the next header for this navigation */
    nextHeaderPosition: HeaderPosition | null;
    /** The number of header rows present in the grid */
    headerRowCount: number;
    api: GridApi;
    columnApi: ColumnApi;
}

export interface NavigateToNextCellParams {
    /** The keycode for the arrow key pressed:
     *  left = 37, up = 38, right = 39, down = 40 */
    key: number;
    /** The cell that currently has focus */
    previousCellPosition: CellPosition;
    /** The cell the grid would normally pick as the next cell for navigation */
    nextCellPosition: CellPosition | null;

    event: KeyboardEvent | null;
    api: GridApi;
    columnApi: ColumnApi;
}

export interface TabToNextCellParams {
    /** True if the Shift key is also down */
    backwards: boolean;
    /** True if the current cell is editing
     * (you may want to skip cells that are not editable, as the grid will enter the next cell in editing mode also if tabbing) */
    editing: boolean;
    /** The cell that currently has focus */
    previousCellPosition: CellPosition;
    /** The cell the grid would normally pick as the next cell for navigation.  */
    nextCellPosition: CellPosition | null;
    api: GridApi;
    columnApi: ColumnApi;
}

export interface PostProcessPopupParams {
    /** If popup is for a column, this gives the Column */
    column?: Column | null;
    /** If popup is for a row, this gives the RowNode */
    rowNode?: RowNode | null;
    /** The popup we are showing */
    ePopup: HTMLElement;
    /** The different types are:
     *  'contextMenu', 'columnMenu', 'aggFuncSelect', 'popupCellEditor' */
    type: string;
    /** If the popup is as a result of a button click (eg menu button),
     *  this is the component that the user clicked */
    eventSource?: HTMLElement | null;
    /** If the popup is as a result of a click or touch,
     *  this is the event - eg user showing context menu */
    mouseEvent?: MouseEvent | Touch | null;
}

export interface PaginationNumberFormatterParams {
    value: number;
}

export interface ProcessDataFromClipboardParams {
    /** 2D array of all cells from the clipboard */
    data: string[][];
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

export enum ServerSideStoreType {
    Full = 'full',
    Partial = 'partial'
}

export interface ServerSideStoreParams {
    /**
     * What store type to use.
     * If missing, then defaults to grid option `serverSideStoreType`.
     *  */
    storeType?: ServerSideStoreType;
    /**
     * For Partial Store only.
     * How many blocks to keep in cache.
     * If missing, defaults to grid options `maxBlocksInCache`.
     */
    maxBlocksInCache?: number;
    /**
     * For Partial Store only.
     * Cache block size.
     * If missing, defaults to grid options `cacheBlockSize`.
     */
    cacheBlockSize?: number;
}

export interface GetServerSideStoreParamsParams {
    /** The level of the store. Top level is 0. */
    level: number;
    /** The Row Node for the group that got expanded, or undefined if top level (ie no parent) */
    parentRowNode?: RowNode;
    /** Active Row Group Columns, if any. */
    rowGroupColumns: Column[];
    /** Active Pivot Columns, if any. */
    pivotColumns: Column[];
    /** true if pivot mode is active. */
    pivotMode: boolean;
}

export interface IsServerSideGroupOpenByDefaultParams {
    data: any;
    rowNode: RowNode;
}

export interface IsGroupOpenByDefaultParams {
    /** The row node being considered. */
    rowNode: RowNode;
    /** The Column for which this row is grouping. */
    rowGroupColumn: Column;
    /** Same as `rowNode.level` - what level the group is at, e.g. 0 for top level, 1 for second etc */
    level: number;
    /** Same as `rowNode.field` - the field we are grouping on, e.g. 'country' */
    field: string;
    /** Same as `rowNode.key`, the value of this group, e.g. 'Ireland' */
    key: string;
}

export interface LoadingCellRendererSelectorFunc {
    (params: ILoadingCellRendererParams): LoadingCellRendererSelectorResult | undefined;
}
export interface LoadingCellRendererSelectorResult {
    /** Equivalent of setting `loadingCellRenderer` */
    component?: { new(): ICellRenderer; } | string;
    /** Equivalent of setting `loadingCellRendererFramework` */
    frameworkComponent?: any;
    /** Equivalent of setting `loadingCellRendererParams` */
    params?: any;
}