import {RowNode} from './rowNode';
import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnController";
import {Column} from "./column";
import {MenuItem} from "../widgets/cMenuItem";

/****************************************************************
 * Don't forget to update ComponentUtil if changing this class. *
 ****************************************************************/
export interface GridOptions {

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/

    // set once in init, can never change
    toolPanelSuppressGroups?: boolean;
    toolPanelSuppressValues?: boolean;
    suppressRowClickSelection?: boolean;
    suppressCellSelection?: boolean;
    sortingOrder?: string[];
    suppressMultiSort?: boolean;
    suppressHorizontalScroll?: boolean;
    unSortIcon?: boolean;
    rowBuffer?: number;
    enableColResize?: boolean;
    enableCellExpressions?: boolean;
    enableSorting?: boolean;
    enableServerSideSorting?: boolean;
    enableFilter?: boolean;
    enableServerSideFilter?: boolean;
    enableStatusBar?: boolean;
    colWidth?: number;
    minColWidth?: number;
    maxColWidth?: number;
    suppressMenuHide?: boolean;
    singleClickEdit?: boolean;
    debug?: boolean;
    icons?: any; // should be typed
    angularCompileRows?: boolean;
    angularCompileFilters?: boolean;
    angularCompileHeaders?: boolean;
    suppressLoadingOverlay?: boolean;
    suppressNoRowsOverlay?: boolean;
    suppressAutoSize?: boolean;
    suppressColumnMoveAnimation?: boolean;
    suppressMovableColumns?: boolean;
    suppressParentsInRowNodes?: boolean;
    suppressFieldDotNotation?: boolean;
    rowModelType?: string;
    enableRangeSelection?: boolean;
    suppressEnterprise?: boolean;
    // enterprise only
    rowGroupPanelShow?: string;
    suppressContextMenu?: boolean;
    suppressMenuFilterPanel?: boolean;
    suppressMenuMainPanel?: boolean;
    suppressMenuColumnPanel?: boolean;
    rememberGroupStateWhenNewData?: boolean;

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/

    // just set once
    localeText?: any;
    localeTextFunc?: Function;
    suppressScrollLag?: boolean;

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/

    groupSuppressAutoColumn?: boolean;
    groupSelectsChildren?: boolean;
    groupHideGroupColumns?: boolean;
    groupIncludeFooter?: boolean;
    groupUseEntireRow?: boolean;
    groupSuppressRow?: boolean;
    groupSuppressBlankHeader?: boolean;
    forPrint?: boolean;
    groupColumnDef?: any; // change to typed

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
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
    checkboxSelection?: Function;
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
    columnDefs?: any[]; // change to typed
    datasource?: any; // should be typed
    // in properties
    headerHeight?: number;

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/

    // callbacks
    groupRowInnerRenderer?(params: any): void;
    groupRowRenderer?: Function | Object;
    isScrollLag?(): boolean;
    isExternalFilterPresent?(): boolean;
    doesExternalFilterPass?(node: RowNode): boolean;
    getRowStyle?: Function;
    getRowClass?: Function;
    getRowHeight?: Function;
    headerCellRenderer?: any;
    groupAggFunction?(nodes: any[]): any;
    getBusinessKeyForNode?(node: RowNode): string;
    getHeaderCellTemplate?: (params: any) => string | HTMLElement;
    getNodeChildDetails?(dataItem: any): NodeChildDetails;
    getContextMenuItems?: GetContextMenuItems,
    getMainMenuItems?: GetMainMenuItems,
    processRowPostCreate?(params: ProcessRowParams): void;
    processCellForClipboard?(params: ProcessCellForExportParams): any;

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/

    // events
    onGridReady?(params: any): void;
    onModelUpdated?(): void;
    onCellClicked?(params: any): void;
    onCellDoubleClicked?(params: any): void;
    onCellContextMenu?(params: any): void;
    onCellValueChanged?(params: any): void;
    onCellFocused?(params: any): void;
    onRowSelected?(params: any): void;
    onRowDeselected?(params: any): void;
    onSelectionChanged?(): void;
    onBeforeFilterChanged?(): void;
    onAfterFilterChanged?(): void;
    onFilterModified?(): void;
    onBeforeSortChanged?(): void;
    onAfterSortChanged?(): void;
    onVirtualRowRemoved?(params: any): void;
    onRowClicked?(params: any): void;
    onRowDoubleClicked?(params: any): void;
    onGridSizeChanged?(params: any): void;

    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/

    // apis, set by the grid on init
    api?: GridApi; // change to typed
    columnApi?: ColumnApi; // change to typed
}

export interface NodeChildDetails {
    group: boolean;
    children?: any[];
    expanded?: boolean;
    field?: string;
    key?: any;
}

export interface GetContextMenuItemsParams {
    column: Column,
    node: RowNode,
    value: any,
    api: GridApi,
    columnApi: ColumnApi,
    context: any
}

export interface GetContextMenuItems {
    (params: GetContextMenuItemsParams): [string|MenuItem]
}

export interface GetMainMenuItemsParams {
    column: Column,
    api: GridApi,
    columnApi: ColumnApi,
    context: any,
    defaultItems: string[]
}

export interface GetMainMenuItems {
    (params: GetMainMenuItemsParams): [string|MenuItem]
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
