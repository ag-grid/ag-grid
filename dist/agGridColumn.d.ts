import { QueryList } from "@angular/core";
import { ColDef, TextAndNumberFilterParameters, ICellEditor, ICellRendererFunc, ICellRenderer, IFilter, RowNode, IsColumnFunc, IAggFunc, ColGroupDef, GetQuickFilterTextParams, ISetFilterParams } from "ag-grid/main";
export declare class AgGridColumn {
    childColumns: QueryList<AgGridColumn>;
    hasChildColumns(): boolean;
    toColDef(): ColDef;
    private getChildColDefs(childColumns);
    private createColDefFromGridColumn(from);
    headerName: string;
    columnGroupShow: string;
    headerClass: string | string[] | ((params: any) => string | string[]);
    toolPanelClass: string | string[] | ((params: any) => string | string[]);
    headerValueGetter: string | Function;
    pivotKeys: string[];
    suppressToolPanel: boolean;
    children: (ColDef | ColGroupDef)[];
    groupId: string;
    openByDefault: boolean;
    marryChildren: boolean;
    colId: string;
    sort: string;
    sortedAt: number;
    sortingOrder: string[];
    field: string;
    hide: boolean;
    pinned: boolean | string;
    tooltipField: string;
    headerTooltip: string;
    valueGetter: string | Function;
    keyCreator: Function;
    headerCellRenderer: Function | Object;
    headerCellTemplate: ((params: any) => string | HTMLElement) | string | HTMLElement;
    width: number;
    minWidth: number;
    maxWidth: number;
    cellClass: string | string[] | ((cellClassParams: any) => string | string[]);
    cellStyle: {} | ((params: any) => {});
    cellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    cellRendererFramework: any;
    cellRendererParams: {};
    cellEditor: {
        new (): ICellEditor;
    } | string;
    cellEditorFramework: any;
    cellEditorParams: {};
    floatingCellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    floatingCellRendererFramework: any;
    floatingCellRendererParams: {};
    cellFormatter: (params: any) => string;
    floatingCellFormatter: (params: any) => string;
    aggFunc: string | IAggFunc;
    rowGroupIndex: number;
    pivotIndex: number;
    comparator: (valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number;
    checkboxSelection: boolean | (Function);
    suppressMenu: boolean;
    suppressSorting: boolean;
    suppressMovable: boolean;
    suppressFilter: boolean;
    unSortIcon: boolean;
    suppressSizeToFit: boolean;
    suppressResize: boolean;
    suppressAutoSize: boolean;
    enableRowGroup: boolean;
    enablePivot: boolean;
    enableValue: boolean;
    editable: boolean | IsColumnFunc;
    getQuickFilterText: (params: GetQuickFilterTextParams) => string;
    suppressNavigable: boolean | IsColumnFunc;
    newValueHandler: Function;
    volatile: boolean;
    filter: string | {
        new (): IFilter;
    };
    filterFramework: any;
    filterParams: ISetFilterParams | TextAndNumberFilterParameters;
    cellClassRules: {
        [cssClassName: string]: (Function | string);
    };
    onCellValueChanged: Function;
    onCellClicked: Function;
    onCellDoubleClicked: Function;
    onCellContextMenu: Function;
    icons: {
        [key: string]: string;
    };
    enableCellChangeFlash: boolean;
    headerGroupComponentFramework: {
        new (): any;
    };
    headerGroupComponentParams: any;
    headerComponentFramework: {
        new (): any;
    };
    headerComponentParams: any;
}
