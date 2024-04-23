import { BeanStub, ColumnApi, GridApi, IDetailCellRendererCtrl, IDetailCellRendererParams, IDetailCellRenderer } from "ag-grid-community";
export declare class DetailCellRendererCtrl extends BeanStub implements IDetailCellRendererCtrl {
    private readonly rowPositionUtils;
    private readonly focusService;
    private params;
    private comp;
    private loadRowDataVersion;
    private refreshStrategy;
    init(comp: IDetailCellRenderer, params: IDetailCellRendererParams): void;
    private onFullWidthRowFocused;
    private setAutoHeightClasses;
    private setupRefreshStrategy;
    private addThemeToDetailGrid;
    private createDetailGrid;
    registerDetailWithMaster(api: GridApi, columnApi: ColumnApi): void;
    private loadRowData;
    refresh(): boolean;
}
