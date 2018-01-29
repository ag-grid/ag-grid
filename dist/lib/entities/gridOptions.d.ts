// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "./rowNode";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnApi";
import { Column } from "./column";
import { IViewportDatasource } from "../interfaces/iViewportDatasource";
import { ICellRendererComp, ICellRendererFunc } from "../rendering/cellRenderers/iCellRenderer";
import { ColDef, ColGroupDef, IAggFunc } from "./colDef";
import { IDatasource } from "../rowModels/iDatasource";
import { GridCellDef } from "./gridCell";
import { IDateComp } from "../rendering/dateComponent";
import { IEnterpriseDatasource } from "../interfaces/iEnterpriseDatasource";
import { CsvExportParams, ProcessCellForExportParams } from "../exportParams";
import { CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent, CellEditingStartedEvent, CellEditingStoppedEvent, CellFocusedEvent, CellMouseOutEvent, CellMouseOverEvent, CellValueChangedEvent, ColumnAggFuncChangeRequestEvent, ColumnEverythingChangedEvent, ColumnGroupOpenedEvent, ColumnMovedEvent, ColumnPinnedEvent, ColumnPivotChangedEvent, ColumnPivotChangeRequestEvent, ColumnPivotModeChangedEvent, ColumnResizedEvent, ColumnRowGroupChangedEvent, ColumnRowGroupChangeRequestEvent, ColumnValueChangedEvent, ColumnValueChangeRequestEvent, ColumnVisibleEvent, DisplayedColumnsChangedEvent, DragStartedEvent, DragStoppedEvent, FilterChangedEvent, FilterModifiedEvent, GridColumnsChangedEvent, GridReadyEvent, GridSizeChangedEvent, ModelUpdatedEvent, NewColumnsLoadedEvent, PaginationChangedEvent, PinnedRowDataChangedEvent, RangeSelectionChangedEvent, RowClickedEvent, RowDataChangedEvent, RowDoubleClickedEvent, RowEditingStartedEvent, RowEditingStoppedEvent, RowGroupOpenedEvent, RowSelectedEvent, RowValueChangedEvent, SelectionChangedEvent, SortChangedEvent, ViewportChangedEvent, VirtualColumnsChangedEvent, VirtualRowRemovedEvent } from "../events";
import { IComponent } from "../interfaces/iComponent";
import { AgGridRegisteredComponentInput } from "../components/framework/componentProvider";
import { ILoadingOverlayComp } from "../rendering/overlays/loadingOverlayComponent";
import { INoRowsOverlayComp } from "../rendering/overlays/noRowsOverlayComponent";
/****************************************************************
 * Don't forget to update ComponentUtil if changing this class. *
 ****************************************************************/
export interface GridOptions {
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. PLEASE!*
     ****************************************************************/
    rowDragManaged?: boolean;
    suppressRowDrag?: boolean;
    ensureDomOrder?: boolean;
    deltaRowDataMode?: boolean;
    scrollbarWidth?: number;
    toolPanelSuppressRowGroups?: boolean;
    toolPanelSuppressValues?: boolean;
    toolPanelSuppressPivots?: boolean;
    toolPanelSuppressPivotMode?: boolean;
    suppressRowClickSelection?: boolean;
    suppressCellSelection?: boolean;
    sortingOrder?: string[];
    suppressMultiSort?: boolean;
    accentedSort?: boolean;
    suppressHorizontalScroll?: boolean;
    suppressTabbing?: boolean;
    unSortIcon?: boolean;
    rowBuffer?: number;
    enableRtl?: boolean;
    enableColResize?: boolean;
    enableCellExpressions?: boolean;
    enableSorting?: boolean;
    enableServerSideSorting?: boolean;
    enableFilter?: boolean;
    enableServerSideFilter?: boolean;
    enableStatusBar?: boolean;
    alwaysShowStatusBar?: boolean;
    enableGroupEdit?: boolean;
    enterMovesDownAfterEdit?: boolean;
    suppressMiddleClickScrolls?: boolean;
    suppressPreventDefaultOnMouseWheel?: boolean;
    suppressScrollOnNewData?: boolean;
    suppressMenuHide?: boolean;
    singleClickEdit?: boolean;
    suppressClickEdit?: boolean;
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
    suppressParentsInRowNodes?: boolean;
    suppressFieldDotNotation?: boolean;
    suppressCopyRowsToClipboard?: boolean;
    clipboardDeliminator?: string;
    suppressAggFuncInHeader?: boolean;
    suppressAggAtRootLevel?: boolean;
    suppressFocusAfterRefresh?: boolean;
    rowModelType?: string;
    pivotMode?: boolean;
    pivotTotals?: boolean;
    enableRangeSelection?: boolean;
    suppressMultiRangeSelection?: boolean;
    rowGroupPanelShow?: string;
    pivotPanelShow?: string;
    suppressContextMenu?: boolean;
    allowContextMenuWithControlKey?: boolean;
    rememberGroupStateWhenNewData?: boolean;
    viewportRowModelPageSize?: number;
    viewportRowModelBufferSize?: number;
    enableCellChangeFlash?: boolean;
    quickFilterText?: string;
    cacheQuickFilter?: boolean;
    aggFuncs?: {
        [key: string]: IAggFunc;
    };
    suppressColumnVirtualisation?: boolean;
    layoutInterval?: number;
    functionsReadOnly?: boolean;
    functionsPassive?: boolean;
    maxConcurrentDatasourceRequests?: number;
    maxBlocksInCache?: number;
    purgeClosedRowNodes?: boolean;
    domLayout?: string;
    suppressChangeDetection?: boolean;
    aggregateOnlyChangedColumns?: boolean;
    valueCache?: boolean;
    valueCacheNeverExpires?: boolean;
    cacheOverflowSize?: number;
    infiniteInitialRowCount?: number;
    paginationPageSize?: number;
    cacheBlockSize?: number;
    paginationAutoPageSize?: boolean;
    paginationStartPage?: number;
    suppressPaginationPanel?: boolean;
    pagination?: boolean;
    editType?: string;
    suppressTouch?: boolean;
    suppressAsyncEvents?: boolean;
    embedFullWidthRows?: boolean;
    excelStyles?: any[];
    floatingFilter?: boolean;
    suppressExcelExport?: boolean;
    suppressCsvExport?: boolean;
    colWidth?: number;
    minColWidth?: number;
    maxColWidth?: number;
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
    groupUseEntireRow?: boolean;
    groupRemoveSingleChildren?: boolean;
    groupRemoveLowestSingleChildren?: boolean;
    groupSuppressRow?: boolean;
    groupHideOpenParents?: boolean;
    groupMultiAutoColumn?: boolean;
    groupSuppressBlankHeader?: boolean;
    groupColumnDef?: ColDef;
    autoGroupColumnDef?: ColDef;
    forPrint?: boolean;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    context?: any;
    rowStyle?: any;
    rowClass?: string | string[];
    groupDefaultExpanded?: number;
    slaveGrids?: GridOptions[];
    alignedGrids?: GridOptions[];
    rowSelection?: string;
    rowDeselection?: boolean;
    overlayLoadingTemplate?: string;
    overlayNoRowsTemplate?: string;
    rowHeight?: number;
    detailRowHeight?: number;
    popupParent?: HTMLElement;
    masterDetail?: boolean;
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
    showToolPanel?: boolean;
    columnDefs?: (ColDef | ColGroupDef)[];
    columnTypes?: {
        [key: string]: ColDef;
    };
    datasource?: IDatasource;
    viewportDatasource?: IViewportDatasource;
    enterpriseDatasource?: IEnterpriseDatasource;
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
    };
    components?: {
        [p: string]: AgGridRegisteredComponentInput<IComponent<any>>;
    };
    dateComponent?: {
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
    isExternalFilterPresent?(): boolean;
    doesExternalFilterPass?(node: RowNode): boolean;
    getRowStyle?: Function;
    getRowClass?: (params: any) => (string | string[]);
    rowClassRules?: {
        [cssClassName: string]: (Function | string);
    };
    getRowHeight?: Function;
    sendToClipboard?: (params: any) => void;
    navigateToNextCell?: (params: NavigateToNextCellParams) => GridCellDef;
    tabToNextCell?: (params: TabToNextCellParams) => GridCellDef;
    getDocument?: () => Document;
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
    getNodeChildDetails?: GetNodeChildDetails;
    getDataPath?: GetDataPath;
    treeData?: boolean;
    getContextMenuItems?: GetContextMenuItems;
    getMainMenuItems?: GetMainMenuItems;
    getRowNodeId?: GetRowNodeIdFunc;
    getChildCount?(dataItem: any): number;
    doesDataFlower?(dataItem: any): boolean;
    processRowPostCreate?(params: ProcessRowParams): void;
    processCellForClipboard?(params: ProcessCellForExportParams): any;
    processCellFromClipboard?(params: ProcessCellForExportParams): any;
    processSecondaryColDef?(colDef: ColDef): void;
    processSecondaryColGroupDef?(colGroupDef: ColGroupDef): void;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    onColumnEverythingChanged?(event?: ColumnEverythingChangedEvent): void;
    onNewColumnsLoaded?(event?: NewColumnsLoadedEvent): void;
    onColumnPivotModeChanged?(event?: ColumnPivotModeChangedEvent): void;
    onColumnRowGroupChanged?(event?: ColumnRowGroupChangedEvent): void;
    onColumnPivotChanged?(event?: ColumnPivotChangedEvent): void;
    onGridColumnsChanged?(event?: GridColumnsChangedEvent): void;
    onColumnValueChanged?(event?: ColumnValueChangedEvent): void;
    onColumnMoved?(event?: ColumnMovedEvent): void;
    onColumnVisible?(event?: ColumnVisibleEvent): void;
    onColumnPinned?(event?: ColumnPinnedEvent): void;
    onColumnGroupOpened?(event?: ColumnGroupOpenedEvent): void;
    onColumnResized?(event?: ColumnResizedEvent): void;
    onDisplayedColumnsChanged?(event?: DisplayedColumnsChangedEvent): void;
    onVirtualColumnsChanged?(event?: VirtualColumnsChangedEvent): void;
    onRowGroupOpened?(event?: RowGroupOpenedEvent): void;
    onRowDataChanged?(event?: RowDataChangedEvent): void;
    onPinnedRowDataChanged?(event?: PinnedRowDataChangedEvent): void;
    onRangeSelectionChanged?(event?: RangeSelectionChangedEvent): void;
    onColumnRowGroupChangeRequest?(event?: ColumnRowGroupChangeRequestEvent): void;
    onColumnPivotChangeRequest?(event?: ColumnPivotChangeRequestEvent): void;
    onColumnValueChangeRequest?(event?: ColumnValueChangeRequestEvent): void;
    onColumnAggFuncChangeRequest?(event?: ColumnAggFuncChangeRequestEvent): void;
    onModelUpdated?(event?: ModelUpdatedEvent): void;
    onCellClicked?(event?: CellClickedEvent): void;
    onCellDoubleClicked?(event?: CellDoubleClickedEvent): void;
    onCellContextMenu?(event?: CellContextMenuEvent): void;
    onCellValueChanged?(event?: CellValueChangedEvent): void;
    onCellMouseOver?(event?: CellMouseOverEvent): void;
    onCellMouseOut?(event?: CellMouseOutEvent): void;
    onRowValueChanged?(event?: RowValueChangedEvent): void;
    onRowEditingStarted?(event?: RowEditingStartedEvent): void;
    onRowEditingStopped?(event?: RowEditingStoppedEvent): void;
    onCellEditingStarted?(event?: CellEditingStartedEvent): void;
    onCellEditingStopped?(event?: CellEditingStoppedEvent): void;
    onCellFocused?(event?: CellFocusedEvent): void;
    onRowSelected?(event?: RowSelectedEvent): void;
    onSelectionChanged?(event?: SelectionChangedEvent): void;
    onFilterChanged?(event?: FilterChangedEvent): void;
    onFilterModified?(event?: FilterModifiedEvent): void;
    onSortChanged?(event?: SortChangedEvent): void;
    onVirtualRowRemoved?(event?: VirtualRowRemovedEvent): void;
    onRowClicked?(event?: RowClickedEvent): void;
    onRowDoubleClicked?(event?: RowDoubleClickedEvent): void;
    onGridReady?(event?: GridReadyEvent): void;
    onGridSizeChanged?(event?: GridSizeChangedEvent): void;
    onViewportChanged?(event?: ViewportChangedEvent): void;
    onDragStarted?(event?: DragStartedEvent): void;
    onDragStopped?(event?: DragStoppedEvent): void;
    onPaginationChanged?(event?: PaginationChangedEvent): void;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    api?: GridApi;
    columnApi?: ColumnApi;
}
export interface GetDataPath {
    (data: any): string[];
}
export interface GetNodeChildDetails {
    (dataItem: any): NodeChildDetails;
}
export interface IsRowMaster {
    (dataItem: any): boolean;
}
export interface NodeChildDetails {
    group: boolean;
    children?: any[];
    expanded?: boolean;
    field?: string;
    key?: any;
}
export interface GetContextMenuItemsParams {
    defaultItems: string[];
    column: Column;
    node: RowNode;
    value: any;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}
export interface GetContextMenuItems {
    (params: GetContextMenuItemsParams): (string | MenuItemDef)[];
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
    api: GridApi;
    columnApi: ColumnApi;
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
    previousCellDef: GridCellDef;
    nextCellDef: GridCellDef;
    event: KeyboardEvent;
}
export interface TabToNextCellParams {
    backwards: boolean;
    editing: boolean;
    previousCellDef: GridCellDef;
    nextCellDef: GridCellDef;
}
export interface PostProcessPopupParams {
    column?: Column;
    rowNode?: RowNode;
    ePopup: HTMLElement;
    type: string;
    eventSource?: HTMLElement;
    mouseEvent?: MouseEvent | Touch;
}
export interface PaginationNumberFormatterParams {
    value: number;
}
