// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from './rowNode';
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnController";
import { Column } from "./column";
import { MenuItem } from "../widgets/cMenuItem";
/****************************************************************
 * Don't forget to update ComponentUtil if changing this class. *
 ****************************************************************/
export interface GridOptions {
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
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
    icons?: any;
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
    rowGroupPanelShow?: string;
    suppressContextMenu?: boolean;
    suppressMenuFilterPanel?: boolean;
    suppressMenuMainPanel?: boolean;
    suppressMenuColumnPanel?: boolean;
    rememberGroupStateWhenNewData?: boolean;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
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
    groupColumnDef?: any;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
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
    checkboxSelection?: Function;
    rowHeight?: number;
    headerCellTemplate?: string;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
    rowData?: any[];
    floatingTopRowData?: any[];
    floatingBottomRowData?: any[];
    showToolPanel?: boolean;
    columnDefs?: any[];
    datasource?: any;
    headerHeight?: number;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
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
    getContextMenuItems?: GetContextMenuItems;
    getMainMenuItems?: GetMainMenuItems;
    processRowPostCreate?(params: ProcessRowParams): void;
    processCellForClipboard?(params: ProcessCellForExportParams): any;
    /****************************************************************
     * Don't forget to update ComponentUtil if changing this class. *
     ****************************************************************/
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
    api?: GridApi;
    columnApi?: ColumnApi;
}
export interface NodeChildDetails {
    group: boolean;
    children?: any[];
    expanded?: boolean;
    field?: string;
    key?: any;
}
export interface GetContextMenuItemsParams {
    column: Column;
    node: RowNode;
    value: any;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}
export interface GetContextMenuItems {
    (params: GetContextMenuItemsParams): [string | MenuItem];
}
export interface GetMainMenuItemsParams {
    column: Column;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
    defaultItems: string[];
}
export interface GetMainMenuItems {
    (params: GetMainMenuItemsParams): [string | MenuItem];
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
export interface ProcessCellForExportParams {
    value: any;
    node: RowNode;
    column: Column;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}
