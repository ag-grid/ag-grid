import {RowNode} from './rowNode';
import {GridApi} from "../gridApi";
import {ColumnApi} from "../columnController/columnController";

/****************************************************************
 ****************************************************************
 *                                                              *
 * Don't forget to update ComponentUtil if changing this class. *
 *                                                              *
 ****************************************************************
 ****************************************************************/
export interface GridOptions {

    // set once in init, can never change
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
    icons?: any; // should be typed
    angularCompileRows?: boolean;
    angularCompileFilters?: boolean;
    angularCompileHeaders?: boolean;
    suppressLoadingOverlay?: boolean;
    suppressNoRowsOverlay?: boolean;
    suppressAutoSize?: boolean;
    suppressMovingCss?: boolean;
    suppressMovableColumns?: boolean;
    suppressParentsInRowNodes?: boolean;

    // just set once
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
    groupColumnDef?: any; // change to typed

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

    // changeable with impact
    rowData?: any[]; // should this be immutable for ag2?
    floatingTopRowData?: any[]; // should this be immutable ag2?
    floatingBottomRowData?: any[]; // should this be immutable ag2?
    showToolPanel?: boolean;
    columnDefs?: any[]; // change to typed
    datasource?: any; // should be typed
    // in properties
    headerHeight?: number;

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

    // apis, set by the grid on init
    api?: GridApi; // change to typed
    columnApi?: ColumnApi; // change to typed
}
