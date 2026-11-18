import type {
    FilterDisplay,
    FilterDisplayParams,
    FloatingFilterDisplay,
    FloatingFilterDisplayParams,
    ICellEditor,
    ICellEditorParams,
    ICellEditorRendererParams,
    ICellRenderer,
    ICellRendererParams,
    IColumnSelectionLabelRenderer,
    IColumnSelectionLabelRendererParams,
    IDate,
    IDateParams,
    IDragAndDropImage,
    IDragAndDropImageParams,
    IExportingOverlay,
    IExportingOverlayParams,
    IFilter,
    IFilterParams,
    IFloatingFilter,
    IFloatingFilterParams,
    IHeader,
    IHeaderGroup,
    IHeaderGroupParams,
    IHeaderParams,
    ILoadingCellRendererParams,
    ILoadingOverlay,
    ILoadingOverlayParams,
    IMenuItem,
    IMenuItemParams,
    INoMatchingRowsOverlay,
    INoMatchingRowsOverlayParams,
    INoRowsOverlay,
    INoRowsOverlayParams,
    IOverlay,
    IOverlayParams,
    IStatusPanel,
    IStatusPanelParams,
    IToolPanel,
    IToolPanelParams,
    IToolbarItem,
    IToolbarItemParams,
    ITooltipParams,
} from 'ag-grid-community';

export interface AgFrameworkComponent<T> {
    /** Mandatory - Params for rendering this component. */
    agInit(params: T): void;
}

export interface IHeaderGroupAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<IHeaderGroupParams<TData, TContext>>, IHeaderGroup<TData, TContext> {}

export interface IInnerHeaderGroupAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<IHeaderGroupParams<TData, TContext>>, IHeaderGroup<TData, TContext> {}

export interface IHeaderAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<IHeaderParams<TData, TContext>>, IHeader<TData, TContext> {}

export interface IInnerHeaderAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<IHeaderParams<TData, TContext>>, IHeader<TData, TContext> {}

export interface IFloatingFilterAngularComp<P = any, TData = any, TContext = any>
    extends AgFrameworkComponent<IFloatingFilterParams<P, TData, TContext>>, IFloatingFilter<P> {}

export interface IFloatingFilterDisplayAngularComp<TData = any, TContext = any, TModel = any, TCustomParams = object>
    extends
        AgFrameworkComponent<FloatingFilterDisplayParams<TData, TContext, TModel, TCustomParams>>,
        FloatingFilterDisplay<TData, TContext, TModel, TCustomParams> {}

export interface IDateAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<IDateParams<TData, TContext>>, IDate<TData, TContext> {}

export interface IDragAndDropImageAngularComponent<TData = any, TContext = any>
    extends AgFrameworkComponent<IDragAndDropImageParams<TData, TContext>>, IDragAndDropImage {}

export interface IFilterAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<IFilterParams<TData, TContext>>, IFilter {}

export interface IFilterDisplayAngularComp<TData = any, TContext = any, TModel = any, TState = any>
    extends
        AgFrameworkComponent<FilterDisplayParams<TData, TContext, TModel, TState>>,
        FilterDisplay<TData, TContext, TModel, TState> {}

export interface ICellRendererAngularComp<TData = any, TValue = any, TContext = any>
    extends
        AgFrameworkComponent<ICellRendererParams<TData, TValue, TContext>>,
        ICellRenderer<TData, TValue, TContext> {}

export interface IColumnSelectionLabelRendererAngularComp<TData = any, TContext = any>
    extends
        AgFrameworkComponent<IColumnSelectionLabelRendererParams<TData, TContext>>,
        IColumnSelectionLabelRenderer<TData, TContext> {}

export interface ICellEditorRendererAngularComp<TValue = any, TData = any, TContext = any> extends AgFrameworkComponent<
    ICellEditorRendererParams<TValue, TData, TContext>
> {}

export interface ICellEditorAngularComp<TData = any, TValue = any, TContext = any>
    extends AgFrameworkComponent<ICellEditorParams<TData, TValue, TContext>>, ICellEditor<TValue, TData, TContext> {}

export interface AgRendererComponent<TData = any, TValue = any, TContext = any> extends ICellRendererAngularComp<
    TData,
    TValue,
    TContext
> {}

export interface AgEditorComponent<TData = any, TValue = any, TContext = any> extends ICellEditorAngularComp<
    TData,
    TValue,
    TContext
> {}

export interface AgFilterComponent<TData = any, TContext = any> extends IFilterAngularComp<TData, TContext> {}

export interface AgFloatingFilterComponent<P = any, TData = any, TContext = any> extends IFloatingFilterAngularComp<
    P,
    TData,
    TContext
> {}

export interface ILoadingCellRendererAngularComp<
    TData = any,
    TValue = any,
    TContext = any,
> extends AgFrameworkComponent<ILoadingCellRendererParams<TData, TValue, TContext>> {}

export interface IOverlayAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<IOverlayParams<TData, TContext>>, IOverlay<TData, TContext> {}

export interface ILoadingOverlayAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<ILoadingOverlayParams<TData, TContext>>, ILoadingOverlay<TData, TContext> {}
export interface IExportingOverlayAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<IExportingOverlayParams<TData, TContext>>, IExportingOverlay<TData, TContext> {}

export interface INoRowsOverlayAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<INoRowsOverlayParams<TData, TContext>>, INoRowsOverlay<TData, TContext> {}
export interface INoMatchingRowsOverlayAngularComp<TData = any, TContext = any>
    extends
        AgFrameworkComponent<INoMatchingRowsOverlayParams<TData, TContext>>,
        INoMatchingRowsOverlay<TData, TContext> {}

export interface IStatusPanelAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<IStatusPanelParams<TData, TContext>>, IStatusPanel<TData, TContext> {}

export interface IToolPanelAngularComp<TData = any, TContext = any, TState = any>
    extends AgFrameworkComponent<IToolPanelParams<TData, TContext, TState>>, IToolPanel<TData, TContext, TState> {}

export interface IToolbarItemAngularComp<TData = any, TContext = any, TParams = any>
    extends
        AgFrameworkComponent<IToolbarItemParams<TData, TContext, TParams>>,
        IToolbarItem<TData, TContext, TParams> {}

export interface ITooltipAngularComp<TData = any, TValue = any, TContext = any> extends AgFrameworkComponent<
    ITooltipParams<TData, TValue, TContext>
> {}

export interface IMenuItemAngularComp<TData = any, TContext = any>
    extends AgFrameworkComponent<IMenuItemParams<TData, TContext>>, IMenuItem {}
