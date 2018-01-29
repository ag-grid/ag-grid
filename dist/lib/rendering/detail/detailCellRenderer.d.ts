// ag-grid-enterprise v16.0.1
import { RowNode, Component, GridOptions, ICellRendererParams } from "ag-grid/main";
export declare class DetailCellRenderer extends Component {
    private static TEMPLATE;
    private eDetailGrid;
    private gridOptionsWrapper;
    private environment;
    private detailGridOptions;
    private masterGridApi;
    private rowId;
    init(params: IDetailCellRendererParams): void;
    private addThemeToDetailGrid();
    private setupGrabMouseWheelEvent();
    private registerDetailWithMaster(rowNode);
    private selectAndSetTemplate(params);
    private createDetailsGrid(params);
    private loadRowData(params);
    private setRowData(rowData);
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
