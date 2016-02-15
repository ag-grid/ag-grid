// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from './rowNode';
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columnController/columnController";
/****************************************************************
 ****************************************************************
 *                                                              *
 * Don't forget to update ComponentUtil if changing this class. *
 *                                                              *
 ****************************************************************
 ****************************************************************/
export interface GridOptions {
    virtualPaging?: boolean;
    toolPanelSuppressGroups?: boolean;
    toolPanelSuppressValues?: boolean;
    rowsAlreadyGrouped?: boolean;
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
    suppressMovingCss?: boolean;
    suppressMovableColumns?: boolean;
    suppressParentsInRowNodes?: boolean;
    localeText?: any;
    localeTextFunc?: Function;
    suppressScrollLag?: boolean;
    groupSuppressAutoColumn?: boolean;
    groupSelectsChildren?: boolean;
    groupHideGroupColumns?: boolean;
    groupIncludeFooter?: boolean;
    groupUseEntireRow?: boolean;
    groupSuppressRow?: boolean;
    groupSuppressBlankHeader?: boolean;
    forPrint?: boolean;
    groupColumnDef?: any;
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
    rowData?: any[];
    floatingTopRowData?: any[];
    floatingBottomRowData?: any[];
    showToolPanel?: boolean;
    columnDefs?: any[];
    datasource?: any;
    headerHeight?: number;
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
    api?: GridApi;
    columnApi?: ColumnApi;
}
