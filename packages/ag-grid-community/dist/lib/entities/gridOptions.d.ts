// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "./rowNode";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnApi";
import { Column } from "./column";
import { IViewportDatasource } from "../interfaces/iViewportDatasource";
import { ICellRendererComp, ICellRendererFunc, ICellRenderer } from "../rendering/cellRenderers/iCellRenderer";
import { ColDef, ColGroupDef, IAggFunc, SuppressKeyboardEventParams } from "./colDef";
import { IDatasource } from "../rowModels/iDatasource";
import { CellPosition } from "./cellPosition";
import { IDateComp } from "../rendering/dateComponent";
import { IServerSideDatasource } from "../interfaces/iServerSideDatasource";
import { CsvExportParams, ProcessCellForExportParams, ProcessHeaderForExportParams } from "../exporter/exportParams";
import { BodyScrollEvent, CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditingStartedEvent, CellEditingStoppedEvent, CellFocusedEvent, CellKeyDownEvent, CellKeyPressEvent, CellMouseDownEvent, CellMouseOutEvent, CellMouseOverEvent, CellValueChangedEvent, ColumnAggFuncChangeRequestEvent, ColumnEverythingChangedEvent, ColumnGroupOpenedEvent, ColumnMovedEvent, ColumnPinnedEvent, ColumnPivotChangedEvent, ColumnPivotChangeRequestEvent, ColumnPivotModeChangedEvent, ColumnResizedEvent, ColumnRowGroupChangedEvent, ColumnRowGroupChangeRequestEvent, ColumnValueChangedEvent, ColumnValueChangeRequestEvent, ColumnVisibleEvent, DisplayedColumnsChangedEvent, DragStartedEvent, DragStoppedEvent, ExpandCollapseAllEvent, FilterChangedEvent, FilterModifiedEvent, FirstDataRenderedEvent, GridColumnsChangedEvent, GridReadyEvent, ModelUpdatedEvent, NewColumnsLoadedEvent, PaginationChangedEvent, PasteEndEvent, PasteStartEvent, PinnedRowDataChangedEvent, RangeSelectionChangedEvent, ChartRangeSelectionChanged, RowClickedEvent, RowDataChangedEvent, RowDataUpdatedEvent, RowDoubleClickedEvent, RowDragEvent, RowEditingStartedEvent, RowEditingStoppedEvent, RowGroupOpenedEvent, RowSelectedEvent, RowValueChangedEvent, SelectionChangedEvent, SortChangedEvent, ViewportChangedEvent, VirtualColumnsChangedEvent, VirtualRowRemovedEvent, ToolPanelVisibleChangedEvent } from "../events";
import { IComponent } from "../interfaces/iComponent";
import { AgGridRegisteredComponentInput } from "../components/framework/userComponentRegistry";
import { ILoadingOverlayComp } from "../rendering/overlays/loadingOverlayComponent";
import { INoRowsOverlayComp } from "../rendering/overlays/noRowsOverlayComponent";
import { StatusPanelDef } from "../interfaces/iStatusPanel";
import { SideBarDef } from "./sideBar";
import { ChartOptions, ChartType } from "../interfaces/iChartOptions";
/****************************************************************
 * Don't forget to update ComponentUtil if changing this class. *
 ****************************************************************/
export interface GridOptions {
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. PLEASE!*
     ****************************************************************/
    suppressBrowserResizeObserver?: boolean;
    rowDragManaged?: boolean;
    suppressRowDrag?: boolean;
    ensureDomOrder?: boolean;
    deltaRowDataMode?: boolean;
    deltaColumnMode?: boolean;
    scrollbarWidth?: number;
    /** @deprecated */
    toolPanelSuppressRowGroups?: boolean;
    /** @deprecated */
    toolPanelSuppressValues?: boolean;
    /** @deprecated */
    toolPanelSuppressPivots?: boolean;
    /** @deprecated */
    toolPanelSuppressPivotMode?: boolean;
    /** @deprecated */
    toolPanelSuppressSideButtons?: boolean;
    /** @deprecated */
    toolPanelSuppressColumnFilter?: boolean;
    /** @deprecated */
    toolPanelSuppressColumnSelectAll?: boolean;
    /** @deprecated */
    toolPanelSuppressColumnExpandAll?: boolean;
    /** @deprecated */
    contractColumnSelection?: boolean;
    suppressRowClickSelection?: boolean;
    suppressRowHoverHighlight?: boolean;
    suppressCellSelection?: boolean;
    suppressMaintainUnsortedOrder?: boolean;
    sortingOrder?: string[];
    suppressMultiSort?: boolean;
    multiSortKey?: string;
    accentedSort?: boolean;
    deltaSort?: boolean;
    suppressHorizontalScroll?: boolean;
    alwaysShowVerticalScroll?: boolean;
    suppressTabbing?: boolean;
    unSortIcon?: boolean;
    rowBuffer?: number;
    enableRtl?: boolean;
    /** @deprecated in v20, use colDef.resizable instead */
    enableColResize?: boolean;
    enableBrowserTooltips?: boolean;
    colResizeDefault?: string;
    enableCellExpressions?: boolean;
    enableCellTextSelection?: boolean;
    /** @deprecated in v20, use colDef.sortable instead */
    enableSorting?: boolean;
    /** @deprecated in v20,  use colDef.sortable instead */
    enableServerSideSorting?: boolean;
    /** @deprecated in v20, use colDef.filter = true instead */
    enableFilter?: boolean;
    /** @deprecated in v20, use colDef.filter = true instead */
    enableServerSideFilter?: boolean;
    enableGroupEdit?: boolean;
    enterMovesDownAfterEdit?: boolean;
    enterMovesDown?: boolean;
    suppressMiddleClickScrolls?: boolean;
    preventDefaultOnContextMenu?: boolean;
    suppressPreventDefaultOnMouseWheel?: boolean;
    suppressScrollOnNewData?: boolean;
    suppressMenuHide?: boolean;
    singleClickEdit?: boolean;
    suppressClickEdit?: boolean;
    /** Allows user to suppress certain keyboard events */
    suppressKeyboardEvent?: (params: SuppressKeyboardEventParams) => boolean;
    stopEditingWhenGridLosesFocus?: boolean;
    debug?: boolean;
    icons?: any;
    angularCompileRows?: boolean;
    angularCompileFilters?: boolean;
    angularCompileHeaders?: boolean;
    suppressLoadingOverlay?: boolean;
    suppressNoRowsOverlay?: boolean;
    suppressAutoSize?: boolean;
    autoSizePadding?: number;
    animateRows?: boolean;
    suppressColumnMoveAnimation?: boolean;
    suppressMovableColumns?: boolean;
    suppressDragLeaveHidesColumns?: boolean;
    suppressMakeColumnVisibleAfterUnGroup?: boolean;
    suppressParentsInRowNodes?: boolean;
    suppressFieldDotNotation?: boolean;
    suppressCopyRowsToClipboard?: boolean;
    copyHeadersToClipboard?: boolean;
    clipboardDeliminator?: string;
    suppressClipboardPaste?: boolean;
    suppressAggFuncInHeader?: boolean;
    suppressAggAtRootLevel?: boolean;
    suppressFocusAfterRefresh?: boolean;
    rowModelType?: string;
    pivotMode?: boolean;
    /** @deprecated */
    pivotTotals?: boolean;
    pivotColumnGroupTotals?: string;
    pivotRowTotals?: string;
    suppressEnterpriseResetOnNewColumns?: boolean;
    enableRangeSelection?: boolean;
    enableRangeHandle?: boolean;
    enableFillHandle?: boolean;
    suppressMultiRangeSelection?: boolean;
    rowGroupPanelShow?: string;
    pivotPanelShow?: string;
    suppressContextMenu?: boolean;
    allowContextMenuWithControlKey?: boolean;
    rememberGroupStateWhenNewData?: boolean;
    viewportRowModelPageSize?: number;
    viewportRowModelBufferSize?: number;
    enableCellChangeFlash?: boolean;
    allowShowChangeAfterFilter?: boolean;
    quickFilterText?: string;
    cacheQuickFilter?: boolean;
    aggFuncs?: {
        [key: string]: IAggFunc;
    };
    suppressColumnVirtualisation?: boolean;
    functionsReadOnly?: boolean;
    functionsPassive?: boolean;
    maxConcurrentDatasourceRequests?: number;
    maxBlocksInCache?: number;
    purgeClosedRowNodes?: boolean;
    gridAutoHeight?: boolean;
    domLayout?: string;
    suppressChangeDetection?: boolean;
    aggregateOnlyChangedColumns?: boolean;
    valueCache?: boolean;
    valueCacheNeverExpires?: boolean;
    batchUpdateWaitMillis?: number;
    suppressRowTransform?: boolean;
    suppressSetColumnStateEvents?: boolean;
    suppressMaxRenderedRowRestriction?: boolean;
    excludeChildrenWhenTreeDataFiltering?: boolean;
    cacheOverflowSize?: number;
    infiniteInitialRowCount?: number;
    paginationPageSize?: number;
    cacheBlockSize?: number;
    blockLoadDebounceMillis?: number;
    paginationAutoPageSize?: boolean;
    paginationStartPage?: number;
    suppressPaginationPanel?: boolean;
    pagination?: boolean;
    paginateChildRows?: boolean;
    editType?: string;
    suppressTouch?: boolean;
    suppressAsyncEvents?: boolean;
    embedFullWidthRows?: boolean;
    /** @deprecated */
    deprecatedEmbedFullWidthRows?: boolean;
    excelStyles?: any[];
    floatingFilter?: boolean;
    suppressExcelExport?: boolean;
    suppressCsvExport?: boolean;
    colWidth?: number;
    minColWidth?: number;
    maxColWidth?: number;
    suppressPropertyNamesCheck?: boolean;
    serverSideSortingAlwaysResets?: boolean;
    reactNext?: boolean;
    statusBar?: {
        statusPanels: StatusPanelDef[];
    };
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    localeText?: any;
    localeTextFunc?: Function;
    suppressAnimationFrame?: boolean;
    defaultColGroupDef?: ColGroupDef;
    defaultColDef?: ColDef;
    defaultExportParams?: CsvExportParams;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    groupSuppressAutoColumn?: boolean;
    groupSelectsChildren?: boolean;
    groupSelectsFiltered?: boolean;
    groupIncludeFooter?: boolean;
    groupIncludeTotalFooter?: boolean;
    groupUseEntireRow?: boolean;
    groupRemoveSingleChildren?: boolean;
    groupRemoveLowestSingleChildren?: boolean;
    groupSuppressRow?: boolean;
    groupHideOpenParents?: boolean;
    groupMultiAutoColumn?: boolean;
    groupSuppressBlankHeader?: boolean;
    /** @deprecated in v11.0 substituted by autoGroupColumnDef */
    groupColumnDef?: ColDef;
    autoGroupColumnDef?: ColDef;
    forPrint?: boolean;
    enableOldSetFilterModel?: boolean;
    enableCharts?: boolean;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    context?: any;
    rowStyle?: any;
    rowClass?: string | string[];
    groupDefaultExpanded?: number;
    /** @deprecated slaveGrids, replace with alignedGrids */
    slaveGrids?: GridOptions[];
    alignedGrids?: GridOptions[];
    rowSelection?: string;
    rowDeselection?: boolean;
    rowMultiSelectWithClick?: boolean;
    isRowSelectable?: IsRowSelectable;
    overlayLoadingTemplate?: string;
    overlayNoRowsTemplate?: string;
    rowHeight?: number;
    detailRowHeight?: number;
    popupParent?: HTMLElement;
    masterDetail?: boolean;
    keepDetailRows?: boolean;
    keepDetailRowsCount?: number;
    isRowMaster?: IsRowMaster;
    detailCellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    detailCellRendererFramework?: any;
    detailCellRendererParams?: any;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    rowData?: any[];
    pinnedTopRowData?: any[];
    pinnedBottomRowData?: any[];
    /** @deprecated */
    showToolPanel?: boolean;
    sideBar?: SideBarDef | string | boolean;
    columnDefs?: (ColDef | ColGroupDef)[];
    columnTypes?: {
        [key: string]: ColDef;
    };
    datasource?: IDatasource;
    viewportDatasource?: IViewportDatasource;
    serverSideDatasource?: IServerSideDatasource;
    headerHeight?: number;
    pivotHeaderHeight?: number;
    groupHeaderHeight?: number;
    pivotGroupHeaderHeight?: number;
    floatingFiltersHeight?: number;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    paginationNumberFormatter?: (params: PaginationNumberFormatterParams) => string;
    postProcessPopup?: (params: PostProcessPopupParams) => void;
    frameworkComponents?: {
        [p: string]: {
            new (): any;
        };
    } | any;
    components?: {
        [p: string]: AgGridRegisteredComponentInput<IComponent<any>>;
    };
    dateComponent?: string | {
        new (): IDateComp;
    };
    dateComponentFramework?: any;
    groupRowRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    groupRowRendererFramework?: any;
    groupRowRendererParams?: any;
    groupRowInnerRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    groupRowInnerRendererFramework?: any;
    createChartContainer?: (params: ChartRef) => void;
    fillOperations?: {
        [key: string]: IFillOperation;
    };
    isExternalFilterPresent?(): boolean;
    doesExternalFilterPass?(node: RowNode): boolean;
    getRowStyle?: Function;
    getRowClass?: (params: any) => (string | string[]);
    rowClassRules?: {
        [cssClassName: string]: (((params: any) => boolean) | string);
    };
    getRowHeight?: Function;
    sendToClipboard?: (params: any) => void;
    processDataFromClipboard?: (params: ProcessDataFromClipboardParams) => string[][] | null;
    navigateToNextCell?: (params: NavigateToNextCellParams) => CellPosition;
    tabToNextCell?: (params: TabToNextCellParams) => CellPosition;
    getDocument?: () => Document;
    defaultGroupSortComparator?: (nodeA: RowNode, nodeB: RowNode) => number;
    loadingCellRenderer?: {
        new (): ICellRenderer;
    } | string;
    loadingCellRendererFramework?: any;
    loadingCellRendererParams?: any;
    loadingOverlayComponent?: {
        new (): ILoadingOverlayComp;
    } | string;
    loadingOverlayComponentFramework?: any;
    noRowsOverlayComponent?: {
        new (): INoRowsOverlayComp;
    } | string;
    noRowsOverlayComponentFramework?: any;
    fullWidthCellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    fullWidthCellRendererFramework?: any;
    fullWidthCellRendererParams?: any;
    isFullWidthCell?(rowNode: RowNode): boolean;
    groupRowAggNodes?(nodes: RowNode[]): any;
    getBusinessKeyForNode?(node: RowNode): string;
    /** @deprecated */
    getNodeChildDetails?: GetNodeChildDetails;
    getDataPath?: GetDataPath;
    treeData?: boolean;
    isServerSideGroup?: IsServerSideGroup;
    getServerSideGroupKey?: GetServerSideGroupKey;
    getContextMenuItems?: GetContextMenuItems;
    getMainMenuItems?: GetMainMenuItems;
    getChartToolbarItems?: GetChartToolbarItems;
    getRowNodeId?: GetRowNodeIdFunc;
    getChildCount?(dataItem: any): number;
    doesDataFlower?(dataItem: any): boolean;
    processRowPostCreate?(params: ProcessRowParams): void;
    processCellForClipboard?(params: ProcessCellForExportParams): any;
    processHeaderForClipboard?(params: ProcessHeaderForExportParams): any;
    processCellFromClipboard?(params: ProcessCellForExportParams): any;
    processSecondaryColDef?(colDef: ColDef): void;
    processSecondaryColGroupDef?(colGroupDef: ColGroupDef): void;
    postSort?(nodes: RowNode[]): void;
    processChartOptions?(params: ProcessChartOptionsParams): ChartOptions;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    onColumnEverythingChanged?(event: ColumnEverythingChangedEvent): void;
    onToolPanelVisibleChanged?(event: ToolPanelVisibleChangedEvent): void;
    onNewColumnsLoaded?(event: NewColumnsLoadedEvent): void;
    onColumnPivotModeChanged?(event: ColumnPivotModeChangedEvent): void;
    onColumnRowGroupChanged?(event: ColumnRowGroupChangedEvent): void;
    onColumnPivotChanged?(event: ColumnPivotChangedEvent): void;
    onGridColumnsChanged?(event: GridColumnsChangedEvent): void;
    onColumnValueChanged?(event: ColumnValueChangedEvent): void;
    onColumnMoved?(event: ColumnMovedEvent): void;
    onColumnVisible?(event: ColumnVisibleEvent): void;
    onColumnPinned?(event: ColumnPinnedEvent): void;
    onColumnGroupOpened?(event: ColumnGroupOpenedEvent): void;
    onColumnResized?(event: ColumnResizedEvent): void;
    onDisplayedColumnsChanged?(event: DisplayedColumnsChangedEvent): void;
    onVirtualColumnsChanged?(event: VirtualColumnsChangedEvent): void;
    onRowGroupOpened?(event: RowGroupOpenedEvent): void;
    onRowDataChanged?(event: RowDataChangedEvent): void;
    onRowDataUpdated?(event: RowDataUpdatedEvent): void;
    onPinnedRowDataChanged?(event: PinnedRowDataChangedEvent): void;
    onRangeSelectionChanged?(event: RangeSelectionChangedEvent): void;
    onChartRangeSelectionChanged?(event: ChartRangeSelectionChanged): void;
    onColumnRowGroupChangeRequest?(event: ColumnRowGroupChangeRequestEvent): void;
    onColumnPivotChangeRequest?(event: ColumnPivotChangeRequestEvent): void;
    onColumnValueChangeRequest?(event: ColumnValueChangeRequestEvent): void;
    onColumnAggFuncChangeRequest?(event: ColumnAggFuncChangeRequestEvent): void;
    onModelUpdated?(event: ModelUpdatedEvent): void;
    onCellKeyDown?(event: CellKeyDownEvent): void;
    onCellKeyPress?(event: CellKeyPressEvent): void;
    onCellClicked?(event: CellClickedEvent): void;
    onCellMouseDown?(event: CellMouseDownEvent): void;
    onCellDoubleClicked?(event: CellDoubleClickedEvent): void;
    onCellContextMenu?(event: CellContextMenuEvent): void;
    onCellValueChanged?(event: CellValueChangedEvent): void;
    onCellMouseOver?(event: CellMouseOverEvent): void;
    onCellMouseOut?(event: CellMouseOutEvent): void;
    onRowValueChanged?(event: RowValueChangedEvent): void;
    onRowEditingStarted?(event: RowEditingStartedEvent): void;
    onRowEditingStopped?(event: RowEditingStoppedEvent): void;
    onCellEditingStarted?(event: CellEditingStartedEvent): void;
    onCellEditingStopped?(event: CellEditingStoppedEvent): void;
    onCellFocused?(event: CellFocusedEvent): void;
    onRowSelected?(event: RowSelectedEvent): void;
    onSelectionChanged?(event: SelectionChangedEvent): void;
    onFilterChanged?(event: FilterChangedEvent): void;
    onFilterModified?(event: FilterModifiedEvent): void;
    onSortChanged?(event: SortChangedEvent): void;
    onVirtualRowRemoved?(event: VirtualRowRemovedEvent): void;
    onRowClicked?(event: RowClickedEvent): void;
    onRowDoubleClicked?(event: RowDoubleClickedEvent): void;
    onGridReady?(event: GridReadyEvent): void;
    onViewportChanged?(event: ViewportChangedEvent): void;
    onDragStarted?(event: DragStartedEvent): void;
    onDragStopped?(event: DragStoppedEvent): void;
    onPaginationChanged?(event: PaginationChangedEvent): void;
    onRowDragEnter?(event: RowDragEvent): void;
    onRowDragMove?(event: RowDragEvent): void;
    onRowDragLeave?(event: RowDragEvent): void;
    onRowDragEnd?(event: RowDragEvent): void;
    onPasteStart?(event: PasteStartEvent): void;
    onPasteEnd?(event: PasteEndEvent): void;
    onBodyScroll?(event: BodyScrollEvent): void;
    onFirstDataRendered?(event: FirstDataRenderedEvent): void;
    onExpandOrCollapseAll?(event: ExpandCollapseAllEvent): void;
    /** @deprecated */
    onGridSizeChanged?(event: any): void;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    api?: GridApi | null;
    columnApi?: ColumnApi | null;
}
export interface IFillOperation {
    (params: FillOperationParams): any[];
}
export interface FillOperationParams {
    values: any[];
    resultCount: number;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
    direction: string;
    column?: Column;
    rowNode?: RowNode;
}
export interface GetDataPath {
    (data: any): string[];
}
export interface IsServerSideGroup {
    (dataItem: any): boolean;
}
export interface GetServerSideGroupKey {
    (dataItem: any): string;
}
export interface GetNodeChildDetails {
    (dataItem: any): NodeChildDetails;
}
export interface IsRowMaster {
    (dataItem: any): boolean;
}
export interface IsRowSelectable {
    (node: RowNode): boolean;
}
export interface NodeChildDetails {
    group: boolean;
    children?: any[];
    expanded?: boolean;
    field?: string;
    key?: any;
}
export interface ProcessChartOptionsParams {
    type: ChartType;
    options: ChartOptions;
}
export interface GetContextMenuItemsParams {
    defaultItems: string[] | undefined;
    column: Column;
    node: RowNode;
    value: any;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
    context: any;
}
export interface GetContextMenuItems {
    (params: GetContextMenuItemsParams): (string | MenuItemDef)[];
}
export interface GetChartToolbarItemsParams {
    defaultItems: string[] | undefined;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
}
export interface GetChartToolbarItems {
    (params: GetChartToolbarItemsParams): string[];
}
export interface MenuItemDef {
    name: string;
    disabled?: boolean;
    shortcut?: string;
    action?: () => void;
    checked?: boolean;
    icon?: HTMLElement | string;
    subMenu?: (MenuItemDef | string)[];
    cssClasses?: string[];
    tooltip?: string;
}
export interface GetMainMenuItemsParams {
    column: Column;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
    context: any;
    defaultItems: string[];
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
    context: any;
}
export interface NavigateToNextCellParams {
    key: number;
    previousCellPosition: CellPosition;
    nextCellPosition: CellPosition;
    event: KeyboardEvent;
}
export interface TabToNextCellParams {
    backwards: boolean;
    editing: boolean;
    previousCellPosition: CellPosition;
    nextCellPosition: CellPosition;
}
export interface PostProcessPopupParams {
    column?: Column | null;
    rowNode?: RowNode;
    ePopup: HTMLElement;
    type: string;
    eventSource?: HTMLElement | null;
    mouseEvent?: MouseEvent | Touch | null;
}
export interface PaginationNumberFormatterParams {
    value: number;
}
export interface ProcessDataFromClipboardParams {
    data: string[][];
}
export interface ChartRef {
    chartElement: HTMLElement;
    destroyChart: () => void;
}
