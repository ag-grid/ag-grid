/// <reference path="colDef.ts" />

module ag.grid {

    export interface GridOptions {

        // set once in init, can never change
        virtualPaging?: boolean;
        toolPanelSuppressPivot?: boolean;
        toolPanelSuppressValues?: boolean;
        rowsAlreadyGrouped?: boolean;
        suppressRowClickSelection?: boolean;
        suppressCellSelection?: boolean;
        sortingOrder?: string[];
        suppressMultiSort?: boolean;
        suppressHorizontalScroll?: boolean;
        unSortIcon?: boolean;
        rowHeight?: number;
        rowBuffer?: number;
        enableColResize?: boolean;
        enableCellExpressions?: boolean;
        enableSorting?: boolean;
        enableServerSideSorting?: boolean;
        enableFilter?: boolean;
        enableServerSideFilter?: boolean;
        colWidth?: number;
        suppressMenuHide?: boolean;
        singleClickEdit?: boolean;
        debug?: boolean;
        icons?: any; // should be typed
        angularCompileRows?: boolean;
        angularCompileFilters?: boolean;
        angularCompileHeaders?: boolean;
        suppressLoadingOverlay?: boolean;
        suppressNoRowsOverlay?: boolean;

        // just set once
        localeText?: any;
        localeTextFunc?: Function;
        suppressScrollLag?: boolean;

        groupSuppressAutoColumn?: boolean;
        groupSelectsChildren?: boolean;
        groupHidePivotColumns?: boolean;
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
        groupDefaultExpanded?: any;
        slaveGrids?: GridOptions[];
        rowSelection?: string;
        rowDeselection?: boolean;
        overlayLoadingTemplate?: string;
        overlayNoRowsTemplate?: string;

        // changeable with impact
        rowData?: any[]; // should this be immutable for ag2?
        floatingTopRowData?: any[]; // should this be immutable ag2?
        floatingBottomRowData?: any[]; // should this be immutable ag2?
        showToolPanel?: boolean;
        groupKeys?: string[];
        groupAggFields?: string[];
        columnDefs?: any[]; // change to typed
        datasource?: any; // should be typed
        pinnedColumnCount?: number;
        // in properties
        groupHeaders?: boolean;
        headerHeight?: number;

        // callbacks
        groupRowInnerRenderer?(params: any): void;
        groupRowRenderer?: Function | Object;
        isScrollLag?(): boolean;
        isExternalFilterPresent?(): boolean;
        doesExternalFilterPass?(node: RowNode): boolean;
        getRowStyle?: any;
        getRowClass?: any;
        headerCellRenderer?: any;
        groupAggFunction?(nodes: any[]): any;
        getBusinessKeyForNode?(node: RowNode): string;

        // events
        onReady?(api: any): void;
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

        // apis, set by the grid on init
        api?: GridApi; // change to typed
        columnApi?: ColumnApi; // change to typed
    }

}
