import { BeanStub, ColumnApi, GridApi, IDetailCellRendererCtrl, IDetailCellRendererParams, IDetailCellRenderer } from "@ag-grid-community/core";
export declare class DetailCellRendererCtrl extends BeanStub implements IDetailCellRendererCtrl {
    private environment;
    private params;
    private comp;
    private loadRowDataVersion;
    private needRefresh;
    init(comp: IDetailCellRenderer, params: IDetailCellRendererParams): void;
    private setAutoHeightClasses;
    private checkForDeprecations;
    private ensureValidRefreshStrategy;
    private addThemeToDetailGrid;
    private createDetailGrid;
    registerDetailWithMaster(api: GridApi, columnApi: ColumnApi): void;
    private loadRowData;
    refresh(): boolean;
}
