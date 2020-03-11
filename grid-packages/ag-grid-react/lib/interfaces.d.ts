// ag-grid-react v23.0.0
import { ICellEditor, ICellEditorParams, ICellRenderer, ICellRendererParams, IDate, IDateParams, IFilter, IFilterParams, IHeader, IHeaderGroup, IHeaderGroupParams, IHeaderParams, ILoadingCellRendererParams, ILoadingOverlayParams, INoRowsOverlayParams, IStatusPanel, IToolPanel, IToolPanelParams, IAfterGuiAttachedParams, IStatusPanelParams } from 'ag-grid-community';
export interface AgReactFrameworkComponent<T> {
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
export interface ILoadingCellRendererReactComp extends AgReactFrameworkComponent<ILoadingCellRendererParams> {
}
export interface ILoadingOverlayReactComp extends AgReactFrameworkComponent<ILoadingOverlayParams> {
}
export interface INoRowsOverlayReactComp extends AgReactFrameworkComponent<INoRowsOverlayParams> {
}
export interface IStatusPanelReactComp extends IStatusPanel, AgReactFrameworkComponent<IStatusPanelParams> {
}
export interface IToolPanelReactComp extends IToolPanel, AgReactFrameworkComponent<IToolPanelParams> {
}
