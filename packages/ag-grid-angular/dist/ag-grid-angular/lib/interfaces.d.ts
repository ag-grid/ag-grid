import { ICellEditor, ICellEditorParams, ICellEditorRendererParams, ICellRenderer, ICellRendererParams, IDate, IDateParams, IFilter, IFilterParams, IFloatingFilter, IFloatingFilterParams, IHeader, IHeaderGroup, IHeaderGroupParams, IHeaderParams, ILoadingCellRendererParams, ILoadingOverlay, ILoadingOverlayParams, IMenuItem, IMenuItemParams, INoRowsOverlay, INoRowsOverlayParams, IStatusPanel, IStatusPanelParams, IToolPanel, IToolPanelParams, ITooltipParams } from 'ag-grid-community';
export interface AgFrameworkComponent<T> {
    /** Mandatory - Params for rendering this component. */
    agInit(params: T): void;
}
export interface IHeaderGroupAngularComp extends AgFrameworkComponent<IHeaderGroupParams>, IHeaderGroup {
}
export interface IHeaderAngularComp extends AgFrameworkComponent<IHeaderParams>, IHeader {
}
export interface IFloatingFilterAngularComp<P = any> extends AgFrameworkComponent<IFloatingFilterParams<P>>, IFloatingFilter {
}
export interface IDateAngularComp extends AgFrameworkComponent<IDateParams>, IDate {
}
export interface IFilterAngularComp extends AgFrameworkComponent<IFilterParams>, IFilter {
}
export interface ICellRendererAngularComp extends AgFrameworkComponent<ICellRendererParams>, ICellRenderer {
}
export interface ICellEditorRendererAngularComp extends AgFrameworkComponent<ICellEditorRendererParams> {
}
export interface ICellEditorAngularComp extends AgFrameworkComponent<ICellEditorParams>, ICellEditor {
}
export interface AgRendererComponent extends ICellRendererAngularComp {
}
export interface AgEditorComponent extends ICellEditorAngularComp {
}
export interface AgFilterComponent extends IFilterAngularComp {
}
export interface AgFloatingFilterComponent extends IFloatingFilterAngularComp {
}
export interface ILoadingCellRendererAngularComp extends AgFrameworkComponent<ILoadingCellRendererParams> {
}
export interface ILoadingOverlayAngularComp extends AgFrameworkComponent<ILoadingOverlayParams>, ILoadingOverlay {
}
export interface INoRowsOverlayAngularComp extends AgFrameworkComponent<INoRowsOverlayParams>, INoRowsOverlay {
}
export interface IStatusPanelAngularComp extends AgFrameworkComponent<IStatusPanelParams>, IStatusPanel {
}
export interface IToolPanelAngularComp extends AgFrameworkComponent<IToolPanelParams>, IToolPanel {
}
export interface ITooltipAngularComp extends AgFrameworkComponent<ITooltipParams> {
}
export interface IMenuItemAngularComp extends AgFrameworkComponent<IMenuItemParams>, IMenuItem {
}
