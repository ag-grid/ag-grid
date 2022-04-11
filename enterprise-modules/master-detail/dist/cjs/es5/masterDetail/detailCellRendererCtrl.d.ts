import { BeanStub, ColumnApi, GridApi, IDetailCellRendererCtrl, IDetailCellRendererParams, IDetailCellRenderer } from "@ag-grid-community/core";
export declare class DetailCellRendererCtrl extends BeanStub implements IDetailCellRendererCtrl {
    private environment;
    private params;
    private comp;
    private loadRowDataVersion;
    private needRefresh;
    private refreshStrategy;
    init(comp: IDetailCellRenderer, params: IDetailCellRendererParams): void;
    private setAutoHeightClasses;
    private setupRefreshStrategy;
    private addThemeToDetailGrid;
    private createDetailGrid;
    registerDetailWithMaster(api: GridApi, columnApi: ColumnApi): void;
    private loadRowData;
    refresh(): boolean;
}
