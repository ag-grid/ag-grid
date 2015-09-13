/// <reference path="colDef.ts" />

module awk.grid {

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
        icons?: any; // should be typed
        colWidth?: number;
        localeText?: any;
        suppressMenuHide?: boolean;
        debug?: boolean;

        angularCompileRows?: boolean;
        angularCompileFilters?: boolean;
        angularCompileHeaders?: boolean;

        groupSuppressAutoColumn?: boolean;
        groupSelectsChildren?: boolean;
        groupHidePivotColumns?: boolean;
        groupIncludeFooter?: boolean;
        groupUseEntireRow?: boolean;
        groupColumnDef?: any; // change to typed
        groupSuppressRow?: boolean;
        groupSuppressBlankHeader?: boolean;
        dontUseScrolls?: boolean;

        // changeable with impact
        rowData?: any[]; // should this be immutable for ag2?
        floatingTopRowData?: any[]; // should this be immutable ag2?
        floatingBottomRowData?: any[]; // should this be immutable ag2?
        rowSelection?: string;
        rowDeselection?: boolean;
        showToolPanel?: boolean;
        groupKeys?: string[];
        groupAggFunction?(nodes: any[]): any;
        groupAggFields?: string[];
        columnDefs?: any[]; // change to typed
        datasource?: any; // should be typed
        pinnedColumnCount?: number;
        // in properties
        groupHeaders?: boolean;
        headerHeight?: number;

        // changeable, but no immediate impact
        context?: any;
        rowStyle?: any;
        rowClass?: any;
        headerCellRenderer?: any;
        groupDefaultExpanded?: any;
        slaveGrids?: GridOptions[];

        // callbacks
        ready?(api: any): void;
        groupInnerRenderer?(params: any): void;
        groupRowInnerRenderer?(params: any): void;
        groupRowRenderer?: Function | Object;
        isScrollLag?(): boolean;
        suppressScrollLag?(): boolean;
        isExternalFilterPresent?(): boolean;
        doesExternalFilterPass?(node: RowNode): boolean;

        // events
        modelUpdated?(): void;
        cellClicked?(params: any): void;
        cellDoubleClicked?(params: any): void;
        cellValueChanged?(params: any): void;
        cellFocused?(params: any): void;
        rowSelected?(params: any): void;
        selectionChanged?(): void;
        beforeFilterChanged?(): void;
        afterFilterChanged?(): void;
        filterModified?(): void;
        beforeSortChanged?(): void;
        afterSortChanged?(): void;
        virtualRowRemoved?(params: any): void;
        rowClicked?(params: any): void;

        // deprecated
        columnResized?(column: Column):void;
        columnVisibilityChanged?(columns: Column[]):void;
        columnOrderChanged?(columns: Column[]):void;

        // unknown
        selectedRows?: any[];
        selectedNodesById?: {[email: number]: any;}; // should be typed to node

        // apis, set by the grid on init
        api?: GridApi; // change to typed
        columnApi?: ColumnApi; // change to typed
    }

}