import {
    IAfterGuiAttachedParams,
    ICellEditor,
    ICellEditorParams,
    ICellRenderer,
    ICellRendererParams,
    IDate,
    IDateParams,
    IFilter,
    IFilterParams,
    IFloatingFilter,
    IFloatingFilterParams,
    IHeader,
    IHeaderGroup,
    IHeaderGroupParams,
    IHeaderParams,
    ILoadingCellRendererParams,
    ILoadingOverlayParams,
    INoRowsOverlayParams,
    IStatusPanelParams,
    IToolPanelParams,
    ITooltipParams
} from "@ag-grid-community/core";

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

export interface ILoadingOverlayAngularComp extends AgFrameworkComponent<ILoadingOverlayParams> {
}

export interface INoRowsOverlayAngularComp extends AgFrameworkComponent<INoRowsOverlayParams> {
}

export interface IStatusPanelAngularComp extends AgFrameworkComponent<IStatusPanelParams> {
}

export interface IToolPanelAngularComp extends AgFrameworkComponent<IToolPanelParams> {
}

export interface ITooltipAngularComp extends AgFrameworkComponent<ITooltipParams> {

}
