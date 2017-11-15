// ag-grid-enterprise v14.2.0
import { RowNode, Component, GridOptions, ICellRendererParams } from "ag-grid/main";
export declare class DetailCellRenderer extends Component {
    private static TEMPLATE;
    private eDetailGrid;
    private gridOptionsWrapper;
    private detailGridOptions;
    private masterGridApi;
    private rowId;
    init(params: IDetailCellRendererParams): void;
    private setupGrabMouseWheelEvent();
    private registerDetailWithMaster(rowNode);
    selectAndSetTemplate(params: ICellRendererParams): void;
    private createDetailsGrid(params);
    private loadRowData(params);
    setRowData(rowData: any[]): void;
}
export interface IDetailCellRendererParams extends ICellRendererParams {
    detailGridOptions: GridOptions;
    getDetailRowData: GetDetailRowData;
}
export interface GetDetailRowData {
    (params: GetDetailRowDataParams): void;
}
export interface GetDetailRowDataParams {
    node: RowNode;
    data: any;
    successCallback(rowData: any[]): void;
}
