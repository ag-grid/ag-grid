import {RowNode} from "./rowNode";
import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnController";
import {Column} from "./column";
import {IViewportDatasource} from "../interfaces/iViewportDatasource";
import {ICellRendererFunc, ICellRenderer, ICellRendererComp} from "../rendering/cellRenderers/iCellRenderer";
import {IAggFunc, ColGroupDef, ColDef} from "./colDef";
import {IDatasource} from "../rowControllers/iDatasource";
import {GridCellDef} from "./gridCell";
import {IDateComp} from "../rendering/dateComponent";

/****************************************************************
 * Don't forget to update ComponentUtil if changing this class. *
 ****************************************************************/
export interface GridOptions {

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. PLEASE!*
     ****************************************************************/

    // set once in init, can never change
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
    colWidth?: number;
    minColWidth?: number;
    maxColWidth?: number;
    suppressMenuHide?: boolean;
    singleClickEdit?: boolean;
    suppressClickEdit?: boolean;
    debug?: boolean;
    icons?: any; // should be typed
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
    // enterprise only
    rowGroupPanelShow?: string;
    pivotPanelShow?: string;
    suppressContextMenu?: boolean;
    suppressMenuFilterPanel?: boolean;
    suppressMenuMainPanel?: boolean;
    suppressMenuColumnPanel?: boolean;
    rememberGroupStateWhenNewData?: boolean;
    viewportRowModelPageSize?: number;
    viewportRowModelBufferSize?: number;
    enableCellChangeFlash?: boolean;
    quickFilterText?: string;
    aggFuncs?: {[key: string]: IAggFunc};
    suppressColumnVirtualisation?: boolean;
    layoutInterval?: number;
    functionsReadOnly?: boolean;
    functionsPassive?: boolean;
    maxConcurrentDatasourceRequests?: number;
    maxPagesInCache?: number;
    paginationOverflowSize?: number;
    paginationInitialRowCount?: number;
    paginationPageSize?: number;
    editType?: string;
    suppressTouch?: boolean;
    embedFullWidthRows?: boolean;
    //This is an array of ExcelStyle, but because that class lives on the enterprise project is referenced as any from the client project
    excelStyles?: any[];

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. GOD DAMN IT!*
     ****************************************************************/

    // just set once
    localeText?: any;
    localeTextFunc?: Function;
    suppressScrollLag?: boolean;
    /* a map of strings (cellRenderer keys) to cellRenderers (that can be ICellRenderer or ICellRendererFunc) */
    // cellRenderers?: {[key: string]: {new(): ICellRenderer} | ICellRendererFunc};
    /* a map of strings (cellEditor keys) to cellEditors */
    // cellEditors?: {[key: string]: {new(): ICellEditor}};
    defaultColGroupDef?: ColGroupDef;
    defaultColDef?: ColDef;

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
    groupSuppressBlankHeader?: boolean;
    forPrint?: boolean;
    groupColumnDef?: ColDef;

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. YOU'VE BEEN WARNED*
     ****************************************************************/

    // changeable, but no immediate impact
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

    // changeable with impact
    rowData?: any[]; // should this be immutable for ag2?
    floatingTopRowData?: any[]; // should this be immutable ag2?
    floatingBottomRowData?: any[]; // should this be immutable ag2?
    showToolPanel?: boolean;
    columnDefs?: (ColDef|ColGroupDef)[];
    datasource?: IDatasource;
    viewportDatasource?: IViewportDatasource;
    // in properties
    headerHeight?: number;

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/

    // callbacks
    dateComponent?:{new(): IDateComp};
    dateComponentFramework?: any;
    groupRowRenderer?: {new(): ICellRendererComp} | ICellRendererFunc | string;
    groupRowRendererFramework?: any;
    groupRowRendererParams?: any;
    groupRowInnerRenderer?: {new(): ICellRendererComp} | ICellRendererFunc | string;
    groupRowInnerRendererFramework?: any;
    isScrollLag?(): boolean;
    isExternalFilterPresent?(): boolean;
    doesExternalFilterPass?(node: RowNode): boolean;
    getRowStyle?: Function;
    getRowClass?: Function;
    getRowHeight?: Function;
    sendToClipboard?: (params: any)=>void;
    navigateToNextCell?: (params: NavigateToNextCellParams)=>GridCellDef;
    tabToNextCell?: (params: TabToNextCellParams)=>GridCellDef;
    getDocument?: ()=> Document;

    fullWidthCellRenderer?: {new(): ICellRendererComp} | ICellRendererFunc | string;
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

    // events
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
    onBeforeSortChanged?(event?: any): void;
    onSortChanged?(event?: any): void;
    onAfterSortChanged?(event?: any): void;
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

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/

    // apis, set by the grid on init
    api?: GridApi; // change to typed
    columnApi?: ColumnApi; // change to typed
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
    defaultItems: string[],
    column: Column,
    node: RowNode,
    value: any,
    api: GridApi,
    columnApi: ColumnApi,
    context: any
}

export interface GetContextMenuItems {
    (params: GetContextMenuItemsParams): (string|MenuItemDef)[]
}

export interface MenuItemDef {
    name: string;
    disabled?: boolean;
    shortcut?: string;
    action?: ()=>void;
    checked?: boolean;
    icon?: HTMLElement|string;
    subMenu?: (MenuItemDef|string)[];
}

export interface GetMainMenuItemsParams {
    column: Column,
    api: GridApi,
    columnApi: ColumnApi,
    context: any,
    defaultItems: string[]
}

export interface GetMainMenuItems {
    (params: GetMainMenuItemsParams): (string|MenuItemDef)[]
}

export interface GetRowNodeIdFunc {
    (data: any): string
}

export interface ProcessRowParams {
    eRow: HTMLElement;
    ePinnedLeftRow: HTMLElement;
    ePinnedRightRow: HTMLElement;
    rowIndex: number,
    node: RowNode,
    api: GridApi,
    columnApi: ColumnApi,
    addRenderedRowListener: (eventType: string, listener: Function)=>void,
    context: any
}

export interface ProcessCellForExportParams {
    value: any,
    node: RowNode,
    column: Column,
    api: GridApi,
    columnApi: ColumnApi,
    context: any
}

export interface ProcessHeaderForExportParams {
    column: Column,
    api: GridApi,
    columnApi: ColumnApi,
    context: any
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
