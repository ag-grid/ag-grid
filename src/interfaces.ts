import {
    IHeaderGroup,
    IHeaderGroupParams,
    IHeader,
    IHeaderParams,
    IFilterParams,
    IDate,
    IDateParams,
    ICellRenderer,
    ICellRendererParams,
    ICellEditor,
    ICellEditorParams,
    IFilter,
    ILoadingOverlayRenderer,
    ILoadingOverlayRendererParams,
    INoRowsOverlayRenderer,
    INoRowsOverlayRendererParams
} from 'ag-grid';

export interface AgReactFrameworkComponent<T> {

}


export interface IHeaderGroupReactComp extends IHeaderGroup, AgReactFrameworkComponent<IHeaderGroupParams> {}
export interface IHeaderReactComp extends IHeader, AgReactFrameworkComponent<IHeaderParams> {}
export interface IDateReactComp extends IDate, AgReactFrameworkComponent<IDateParams> {}
export interface IFilterReactComp extends IFilter, AgReactFrameworkComponent<IFilterParams> {}
export interface ICellRendererReactComp extends ICellRenderer, AgReactFrameworkComponent<ICellRendererParams> {}
export interface ICellEditorReactComp extends ICellEditor, AgReactFrameworkComponent<ICellEditorParams> {}

export interface ILoadingOverlayRendererAngularComp extends ILoadingOverlayRenderer, AgReactFrameworkComponent<ILoadingOverlayRendererParams> {}
export interface INoRowsOverlayRendererAngularComp extends INoRowsOverlayRenderer, AgReactFrameworkComponent<INoRowsOverlayRendererParams>{}