import { Component, ICellRenderer, IDetailCellRendererParams } from "ag-grid-community";
export declare class DetailCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE;
    private eDetailGrid;
    private detailApi;
    private params;
    private ctrl;
    init(params: IDetailCellRendererParams): void;
    refresh(): boolean;
    destroy(): void;
    private selectAndSetTemplate;
    private setDetailGrid;
    private setRowData;
}
