// ag-grid-enterprise v20.2.0
import { Component, GridOptions, ICellRendererParams, RowNode } from "ag-grid-community";
export declare class DetailCellRenderer extends Component {
    private static TEMPLATE;
    private eDetailGrid;
    private gridOptionsWrapper;
    private environment;
    private detailGridOptions;
    private masterGridApi;
    private rowId;
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
