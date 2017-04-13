// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "./rowNode";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnController";
import { Column } from "./column";
import { IViewportDatasource } from "../interfaces/iViewportDatasource";
import { ICellRendererFunc, ICellRendererComp } from "../rendering/cellRenderers/iCellRenderer";
import { IAggFunc, ColGroupDef, ColDef } from "./colDef";
import { IDatasource } from "../rowModels/iDatasource";
import { GridCellDef } from "./gridCell";
import { IDateComp } from "../rendering/dateComponent";
import { IEnterpriseDatasource } from "../interfaces/iEnterpriseDatasource";
import { CsvExportParams, ProcessCellForExportParams } from "../exportParams";
/****************************************************************
 * Don't forget to update ComponentUtil if changing this class. *
 ****************************************************************/
export interface GridOptions {
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. PLEASE!*
     ****************************************************************/
    scrollbarWidth?: number;
    toolPanelSuppressRowGroups?: boolean;
    toolPanelSuppressValues?: boolean;
    toolPanelSuppressPivots?: boolean;
    toolPanelSuppressPivotMode?: boolean;
    suppressRowClickSelection?: boolean;
    suppressCellSelection?: boolean;
    suppressRowHoverClass?: boolean;
    sortingOrder?: string[];
    suppressMultiSort?: boolean;
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
    enableGroupEdit?: boolean;
    suppressMiddleClickScrolls?: boolean;
    suppressPreventDefaultOnMouseWheel?: boolean;
    suppressScrollOnNewData?: boolean;
    colWidth?: number;
    minColWidth?: number;
    maxColWidth?: number;
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
    suppressUseColIdForGroups?: boolean;
    suppressCopyRowsToClipboard?: boolean;
    suppressAggFuncInHeader?: boolean;
    suppressFocusAfterRefresh?: boolean;
    rowModelType?: string;
    pivotMode?: boolean;
    enableRangeSelection?: boolean;
    suppressEnterprise?: boolean;
    rowGroupPanelShow?: string;
    pivotPanelShow?: string;
    suppressContextMenu?: boolean;
    allowContextMenuWithControlKey?: boolean;
    suppressMenuFilterPanel?: boolean;
    suppressMenuMainPanel?: boolean;
    suppressMenuColumnPanel?: boolean;
    rememberGroupStateWhenNewData?: boolean;
    viewportRowModelPageSize?: number;
    viewportRowModelBufferSize?: number;
    enableCellChangeFlash?: boolean;
    quickFilterText?: string;
    aggFuncs?: {
        [key: string]: IAggFunc;
    };
    suppressColumnVirtualisation?: boolean;
    layoutInterval?: number;
    functionsReadOnly?: boolean;
    functionsPassive?: boolean;
    maxConcurrentDatasourceRequests?: number;
    maxPagesInCache?: number;
    paginationOverflowSize?: number;
    infiniteInitialRowCount?: number;
    paginationPageSize?: number;
    infiniteBlockSize?: number;
    paginationAutoPageSize?: boolean;
    paginationStartPage?: number;
    suppressPaginationPanel?: boolean;
    pagination?: boolean;
    editType?: string;
    suppressTouch?: boolean;
    embedFullWidthRows?: boolean;
    excelStyles?: any[];
    floatingFilter?: boolean;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. GOD DAMN IT!*
     ****************************************************************/
    localeText?: any;
    localeTextFunc?: Function;
    suppressScrollLag?: boolean;
    defaultColGroupDef?: ColGroupDef;
    defaultColDef?: ColDef;
    defaultExportParams?: CsvExportParams;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. FOR FUCKS SAKE! *
     ****************************************************************/
    groupSuppressAutoColumn?: boolean;
    groupSelectsChildren?: boolean;
    groupSelectsFiltered?: boolean;
    groupIncludeFooter?: boolean;
    groupUseEntireRow?: boolean;
    groupRemoveSingleChildren?: boolean;
    groupSuppressRow?: boolean;
    groupHideOpenParents?: boolean;
    groupMultiAutoColumn?: boolean;
    groupSuppressBlankHeader?: boolean;
    forPrint?: boolean;
    groupColumnDef?: ColDef;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. YOU'VE BEEN WARNED*
     ****************************************************************/
    context?: any;
    rowStyle?: any;
    rowClass?: any;
    groupDefaultExpanded?: number;
    slaveGrids?: GridOptions[];
    rowSelection?: string;
    rowDeselection?: boolean;
    overlayLoadingTemplate?: string;
    overlayNoRowsTemplate?: string;
    rowHeight?: number;
    headerCellTemplate?: string;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    rowData?: any[];
    floatingTopRowData?: any[];
    floatingBottomRowData?: any[];
    showToolPanel?: boolean;
    columnDefs?: (ColDef | ColGroupDef)[];
    datasource?: IDatasource;
    viewportDatasource?: IViewportDatasource;
    enterpriseDatasource?: IEnterpriseDatasource;
    headerHeight?: number;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
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
    isScrollLag?(): boolean;
    isExternalFilterPresent?(): boolean;
    doesExternalFilterPass?(node: RowNode): boolean;
    getRowStyle?: Function;
    getRowClass?: Function;
    getRowHeight?: Function;
    sendToClipboard?: (params: any) => void;
    navigateToNextCell?: (params: NavigateToNextCellParams) => GridCellDef;
    tabToNextCell?: (params: TabToNextCellParams) => GridCellDef;
    getDocument?: () => Document;
    fullWidthCellRenderer?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    fullWidthCellRendererFramework?: any;
    fullWidthCellRendererParams?: any;
    isFullWidthCell?(rowNode: RowNode): boolean;
    headerCellRenderer?: any;
    groupRowAggNodes?(nodes: RowNode[]): any;
    getBusinessKeyForNode?(node: RowNode): string;
    getHeaderCellTemplate?: (params: any) => string | HTMLElement;
    getNodeChildDetails?: GetNodeChildDetails;
    getContextMenuItems?: GetContextMenuItems;
    getMainMenuItems?: GetMainMenuItems;
    getRowNodeId?: GetRowNodeIdFunc;
    doesDataFlower?(dataItem: any): boolean;
    processRowPostCreate?(params: ProcessRowParams): void;
    processCellForClipboard?(params: ProcessCellForExportParams): any;
    processCellFromClipboard?(params: ProcessCellForExportParams): any;
    processSecondaryColDef?(colDef: ColDef): void;
    processSecondaryColGroupDef?(colGroupDef: ColGroupDef): void;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    onColumnEverythingChanged?(event?: any): void;
    onNewColumnsLoaded?(event?: any): void;
    onColumnPivotModeChanged?(event?: any): void;
    onColumnRowGroupChanged?(event?: any): void;
    onColumnPivotChanged?(event?: any): void;
    onGridColumnsChanged?(event?: any): void;
    onColumnValueChanged?(event?: any): void;
    onColumnMoved?(event?: any): void;
    onColumnVisible?(event?: any): void;
    onColumnPinned?(event?: any): void;
    onColumnGroupOpened?(event?: any): void;
    onColumnResized?(event?: any): void;
    onDisplayedColumnsChanged?(event?: any): void;
    onVirtualColumnsChanged?(event?: any): void;
    onRowGroupOpened?(event?: any): void;
    onRowDataChanged?(event?: any): void;
    onFloatingRowDataChanged?(event?: any): void;
    onRangeSelectionChanged?(event?: any): void;
    onColumnRowGroupAddRequest?(event?: any): void;
    onColumnRowGroupRemoveRequest?(event?: any): void;
    onColumnPivotAddRequest?(event?: any): void;
    onColumnPivotRemoveRequest?(event?: any): void;
    onColumnValueAddRequest?(event?: any): void;
    onColumnValueRemoveRequest?(event?: any): void;
    onColumnAggFuncChangeRequest?(event?: any): void;
    onClipboardPaste?(event?: any): void;
    onHeaderHeightChanged?(event?: any): void;
    onModelUpdated?(event?: any): void;
    onCellClicked?(event?: any): void;
    onCellDoubleClicked?(event?: any): void;
    onCellContextMenu?(event?: any): void;
    onCellValueChanged?(event?: any): void;
    onRowValueChanged?(event?: any): void;
    onRowEditingStarted?(event?: any): void;
    onRowEditingStopped?(event?: any): void;
    onCellEditingStarted?(event?: any): void;
    onCellEditingStopped?(event?: any): void;
    onCellFocused?(event?: any): void;
    onRowSelected?(event?: any): void;
    onSelectionChanged?(event?: any): void;
    onBeforeFilterChanged?(event?: any): void;
    onFilterChanged?(event?: any): void;
    onAfterFilterChanged?(event?: any): void;
    onFilterModified?(event?: any): void;
    onBeforeSortChanged?(): void;
    onSortChanged?(): void;
    onAfterSortChanged?(): void;
    onVirtualRowRemoved?(event?: any): void;
    onRowClicked?(event?: any): void;
    onRowDoubleClicked?(event?: any): void;
    onGridReady?(event?: any): void;
    onGridSizeChanged?(event?: any): void;
    onViewportChanged?(event?: any): void;
    onDragStarted?(event?: any): void;
    onDragStopped?(event?: any): void;
    onItemsAdded?(event?: any): void;
    onItemsRemoved?(event?: any): void;
    onPaginationReset?(event?: any): void;
    onPaginationPageLoaded?(event?: any): void;
    onPaginationPageRequested?(event?: any): void;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    api?: GridApi;
    columnApi?: ColumnApi;
}
export interface GetNodeChildDetails {
    (dataItem: any): NodeChildDetails;
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
