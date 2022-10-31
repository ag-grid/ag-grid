// ag-grid-react v28.2.1
import { ColumnApi, GridApi, GridOptions, ICellEditor, ICellRenderer, IDate, IFilter, IFloatingFilter, IHeader, IHeaderGroup, IStatusPanel, IToolPanel, Module } from 'ag-grid-community';
import { ChangeDetectionStrategyType } from './changeDetectionService';
export interface SharedProps<TData = any> extends GridOptions<TData> {
    gridOptions?: GridOptions<TData>;
    modules?: Module[];
    containerStyle?: any;
    className?: string;
    setGridApi?: (gridApi: GridApi<TData>, columnApi: ColumnApi) => void;
    componentWrappingElement?: string;
    maxComponentCreationTimeMs?: number;
}
export interface AgReactUiProps<TData = any> extends SharedProps<TData> {
}
export interface AgGridReactProps<TData = any> extends SharedProps<TData> {
    children?: any;
    rowDataChangeDetectionStrategy?: ChangeDetectionStrategyType;
    disableStaticMarkup?: boolean;
    legacyComponentRendering?: boolean;
}
export interface AgReactComponent {
    getReactContainerStyle?: () => {};
    getReactContainerClasses?: () => string[];
}
export interface IHeaderGroupReactComp extends IHeaderGroup, AgReactComponent {
}
export interface IHeaderReactComp extends IHeader, AgReactComponent {
}
export interface IDateReactComp extends IDate, AgReactComponent {
}
export interface IFilterReactComp extends IFilter, AgReactComponent {
}
export interface IFloatingFilterReactComp extends IFloatingFilter, AgReactComponent {
}
export interface ICellRendererReactComp extends ICellRenderer, AgReactComponent {
}
export interface ICellEditorReactComp extends ICellEditor, AgReactComponent {
}
export interface ILoadingCellRendererReactComp extends AgReactComponent {
}
export interface ILoadingOverlayReactComp extends AgReactComponent {
}
export interface INoRowsOverlayReactComp extends AgReactComponent {
}
export interface IStatusPanelReactComp extends IStatusPanel, AgReactComponent {
}
export interface IToolPanelReactComp extends IToolPanel, AgReactComponent {
}
export interface ITooltipReactComp extends AgReactComponent {
}
