import {GridOptions, Module} from "@ag-grid-community/core";
import {ChangeDetectionStrategyType} from "./changeDetectionService";

export interface SharedProps extends GridOptions {
    enableReactUi?: boolean;
}

export interface AgReactUiProps extends SharedProps {
    gridOptions?: GridOptions;
    className?: string;
    containerStyle?: any;
    modules?: Module[];
}

export interface AgGridReactProps extends SharedProps {
    gridOptions?: GridOptions;
    modules?: Module[];
    rowDataChangeDetectionStrategy?: ChangeDetectionStrategyType;
    componentWrappingElement?: string;
    disableStaticMarkup?: boolean;  // only used when legacyComponentRendering is true
    maxComponentCreationTimeMs?: number,
    legacyComponentRendering?: boolean,
    containerStyle?: any;
}

import {
    ICellEditor,
    ICellEditorParams,
    ICellRenderer,
    ICellRendererParams,
    IDate,
    IDateParams,
    IFilter,
    IFilterParams,
    IHeader,
    IHeaderGroup,
    IHeaderGroupParams,
    IHeaderParams,
    ILoadingCellRendererParams,
    ILoadingOverlayParams,
    INoRowsOverlayParams,
    IStatusPanel,
    IToolPanel,
    IToolPanelParams,
    IAfterGuiAttachedParams,
    IStatusPanelParams
} from '@ag-grid-community/core';

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
