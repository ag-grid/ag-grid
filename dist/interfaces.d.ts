import { IAfterGuiAttachedParams, ICellEditor, ICellEditorParams, ICellRenderer, ICellRendererParams, IDate, IDateParams, IFilter, IFilterParams, IFloatingFilter, IFloatingFilterParams, IHeader, IHeaderGroup, IHeaderGroupParams, IHeaderParams, ILoadingOverlayParams, INoRowsOverlayParams } from "ag-grid/main";
export interface AgFrameworkComponent<T> {
    agInit(params: T): void;
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;
}
export interface IHeaderGroupAngularComp extends IHeaderGroup, AgFrameworkComponent<IHeaderGroupParams> {
}
export interface IHeaderAngularComp extends IHeader, AgFrameworkComponent<IHeaderParams> {
}
export interface IFloatingFilterComp extends IFloatingFilter<any, any, any>, AgFrameworkComponent<IFloatingFilterParams<any, any>> {
}
export interface IDateAngularComp extends IDate, AgFrameworkComponent<IDateParams> {
}
export interface IFilterAngularComp extends IFilter, AgFrameworkComponent<IFilterParams> {
}
export interface ICellRendererAngularComp extends ICellRenderer, AgFrameworkComponent<ICellRendererParams> {
}
export interface ICellEditorAngularComp extends ICellEditor, AgFrameworkComponent<ICellEditorParams> {
}
export interface AgRendererComponent extends ICellRendererAngularComp {
}
export interface AgEditorComponent extends ICellEditorAngularComp {
}
export interface AgFilterComponent extends IFilterAngularComp {
}
export interface ILoadingOverlayAngularComp extends AgFrameworkComponent<ILoadingOverlayParams> {
}
export interface INoRowsOverlayAngularComp extends AgFrameworkComponent<INoRowsOverlayParams> {
}
