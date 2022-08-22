import { GridOptions } from "../entities/gridOptions";
import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { RowNode } from "../entities/rowNode";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columns/columnApi";
export interface IDetailCellRenderer<TData = any> {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    addOrRemoveDetailGridCssClass(cssClassName: string, on: boolean): void;
    setDetailGrid(gridOptions: GridOptions<TData>): void;
    setRowData(rowData: TData[]): void;
    getGui(): HTMLElement;
}
export interface IDetailCellRendererParams<TData = any, TDetail = any> extends ICellRendererParams<TData> {
    /**
     * Provide Grid Options to use for the Detail Grid.
     */
    detailGridOptions: GridOptions<TDetail>;
    /** A function that provides what rows to display in the Detail Grid. */
    getDetailRowData: GetDetailRowData<TData, TDetail>;
    /** Defines how to refresh the Detail Grids as data is changing in the Master Grid. */
    refreshStrategy: 'rows' | 'everything' | 'nothing';
    /** Allows changing the template used around the Detail Grid. */
    template: string | TemplateFunc<TData>;
    agGridReact: any;
    frameworkComponentWrapper: any;
    pinned: "left" | "right" | null | undefined;
    /** @deprecated */
    autoHeight: boolean;
    /** @deprecated */
    suppressRefresh: boolean;
}
export interface GetDetailRowData<TData = any, TDetail = any> {
    (params: GetDetailRowDataParams<TData, TDetail>): void;
}
export interface GetDetailRowDataParams<TData = any, TDetail = any> {
    /** Row node for the details request. */
    node: RowNode<TData>;
    /** Data for the current row. */
    data: TData;
    /** Success callback: pass the rows back for the grid request.  */
    successCallback(rowData: TDetail[]): void;
}
interface TemplateFunc<TData = any> {
    (params: ICellRendererParams<TData>): string;
}
export interface IDetailCellRendererCtrl {
    init(comp: IDetailCellRenderer, params: IDetailCellRendererParams): void;
    registerDetailWithMaster(api: GridApi, columnApi: ColumnApi): void;
    refresh(): boolean;
}
export {};
