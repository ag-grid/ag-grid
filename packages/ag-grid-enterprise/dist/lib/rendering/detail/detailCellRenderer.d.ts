// ag-grid-enterprise v21.2.2
import { Component, GridOptions, ICellRendererParams, ICellRenderer, RowNode } from "ag-grid-community";
export declare class DetailCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE;
    private eDetailGrid;
    private gridOptionsWrapper;
    private environment;
    private detailGridOptions;
    private masterGridApi;
    private rowId;
    private needRefresh;
    private suppressRefresh;
    refresh(): boolean;
    init(params: IDetailCellRendererParams): void;
    private addThemeToDetailGrid;
    private registerDetailWithMaster;
    private selectAndSetTemplate;
    private createDetailsGrid;
    private loadRowData;
    private setRowData;
}
export interface IDetailCellRendererParams extends ICellRendererParams {
    detailGridOptions: GridOptions;
    getDetailRowData: GetDetailRowData;
    suppressRefresh: boolean;
    agGridReact: any;
    frameworkComponentWrapper: any;
    $compile: any;
}
export interface GetDetailRowData {
    (params: GetDetailRowDataParams): void;
}
export interface GetDetailRowDataParams {
    node: RowNode;
    data: any;
    successCallback(rowData: any[]): void;
}
