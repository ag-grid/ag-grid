import { Component, GridOptions, ICellRenderer, ICellRendererParams, RowNode } from "@ag-grid-community/core";
export declare class DetailCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE;
    private environment;
    private eDetailGrid;
    private resizeObserverService;
    private detailGridOptions;
    private needRefresh;
    private params;
    private loadRowDataVersion;
    init(params: IDetailCellRendererParams): void;
    refresh(): boolean;
    destroy(): void;
    private checkForDeprecations;
    private ensureValidRefreshStrategy;
    private setupAutoGridHeight;
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
    refreshStrategy: 'rows' | 'everything' | 'nothing';
    agGridReact: any;
    frameworkComponentWrapper: any;
    $compile: any;
    pinned: string;
    template: string | TemplateFunc;
    autoHeight: boolean;
    /** @deprecated */
    suppressRefresh: boolean;
}
export interface GetDetailRowData {
    (params: GetDetailRowDataParams): void;
}
export interface GetDetailRowDataParams {
    node: RowNode;
    data: any;
    successCallback(rowData: any[]): void;
}
interface TemplateFunc {
    (params: ICellRendererParams): string;
}
export {};
