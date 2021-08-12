import { GridOptions } from "../entities/gridOptions";
import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { RowNode } from "../entities/rowNode";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columns/columnApi";
export interface IDetailCellRenderer {
    addOrRemoveCssClass(cssClassName: string, on: boolean): void;
    addOrRemoveDetailGridCssClass(cssClassName: string, on: boolean): void;
    setDetailGrid(gridOptions: GridOptions): void;
    setRowData(rowData: any[]): void;
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
    /** @deprecated */
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
export interface IDetailCellRendererCtrl {
    init(comp: IDetailCellRenderer, params: IDetailCellRendererParams): void;
    registerDetailWithMaster(api: GridApi, columnApi: ColumnApi): void;
    refresh(): boolean;
}
export {};
