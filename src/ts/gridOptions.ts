
module awk.grid {

    export interface GridOptions {
        rowSelection?: string;
        rowDeselection?: boolean;
        context?: any;
        virtualPaging?: boolean;
        showToolPanel?: boolean;
        toolPanelSuppressPivot?: boolean;
        toolPanelSuppressValues?: boolean;
        rowsAlreadyGrouped?: boolean;
        groupSelectsChildren?: boolean;
        groupHidePivotColumns?: boolean;
        groupIncludeFooter?: boolean;
        suppressRowClickSelection?: boolean;
        suppressCellSelection?: boolean;
        suppressUnSort?: boolean;
        suppressMultiSort?: boolean;
        groupSuppressAutoColumn?: boolean;
        groupHeaders?: boolean;
        dontUseScrolls?: boolean;
        suppressDescSort?: boolean;
        unSortIcon?: boolean;
        rowStyle?: any;
        rowClass?: any;
        headerCellRenderer?: any;
        api?: any; // change to typed
        groupDefaultExpanded?: any;
        groupKeys?: string[];
        groupAggFunction?(nodes: any[]): any;
        groupAggFields?: string[];
        rowData?: any[];
        groupUseEntireRow?: boolean;
        groupColumnDef?: any; // change to typed
        angularCompileRows?: boolean;
        angularCompileFilters?: boolean;
        angularCompileHeaders?: boolean;
        columnDefs?: any[]; // change to typed
        rowHeight?: number;
        modelUpdated?(): void;
        cellClicked?(params: any): void;
        cellDoubleClicked?(params: any): void;
        cellValueChanged?(params: any): void;
        cellFocused?(params: any): void;
        rowSelected?(rowIndex: number, selected: boolean): void;
        selectionChanged?(): void;
        beforeFilterChanged?(): void;
        afterFilterChanged?(): void;
        beforeSortChanged?(): void;
        afterSortChanged?(): void;
        virtualRowRemoved?(row: any, rowIndex: number): void;
        rowClicked?(params: any): void;
        columnResized?():void;
        columnVisibilityChanged?():void;
        columnOrderChanged?():void;
        datasource?: any; // should be typed
        ready?(api: any): void; // should be typed
        rowBuffer?: number;
        enableColResize?: boolean;
        enableCellExpressions?: boolean;
        enableSorting?: boolean;
        enableServerSideSorting?: boolean;
        enableFilter?: boolean;
        enableServerSideFilter?: boolean;
        selectedRows?: any[];
        selectedNodesById?: {[email: number]: any;}; // should be typed to node
        icons?: any; // should be typed
        groupInnerRenderer?(params: any): void;
        groupRowInnerRenderer?(params: any): void;
        colWidth?: number;
        headerHeight?: number;
        pinnedColumnCount?: number;
        localeText?: any;
        isScrollLag?(): boolean;
        suppressScrollLag?(): boolean;
    }

}