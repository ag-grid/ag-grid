// ag-grid-react v19.0.0
import { ICellEditor, ICellEditorParams, ICellRenderer, ICellRendererParams, IDate, IDateParams, IFilter, IFilterParams, IHeader, IHeaderGroup, IHeaderGroupParams, IHeaderParams, ILoadingOverlayParams, INoRowsOverlayParams, IStatusPanel, IAfterGuiAttachedParams, IStatusPanelParams } from 'ag-grid-community';
export interface AgReactFrameworkComponent<T> {
    agInit(params: T): void;
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;
}
export interface IHeaderGroupReactComp extends IHeaderGroup, AgReactFrameworkComponent<IHeaderGroupParams> {
}
export interface IHeaderReactComp extends IHeader, AgReactFrameworkComponent<IHeaderParams> {
}
export interface IDateReactComp extends IDate, AgReactFrameworkComponent<IDateParams> {
}
export interface IFilterReactComp extends IFilter, AgReactFrameworkComponent<IFilterParams> {
}
export interface ICellRendererReactComp extends ICellRenderer, AgReactFrameworkComponent<ICellRendererParams> {
}
export interface ICellEditorReactComp extends ICellEditor, AgReactFrameworkComponent<ICellEditorParams> {
}
export interface ILoadingOverlayReactComp extends AgReactFrameworkComponent<ILoadingOverlayParams> {
}
export interface INoRowsOverlayReactComp extends AgReactFrameworkComponent<INoRowsOverlayParams> {
}
export interface IStatusPanelAngularComp extends IStatusPanel, AgReactFrameworkComponent<IStatusPanelParams> {
}
