// ag-grid-ng2 v6.2.0
import { ViewContainerRef } from '@angular/core';
import { ICellRenderer, ICellEditor, IFrameworkFactory, IFilter, ICellRendererFunc, ColDef, GridOptions } from 'ag-grid/main';
import { BaseComponentFactory } from "./baseComponentFactory";
export declare class Ng2FrameworkFactory implements IFrameworkFactory {
    private _componentFactory;
    private _viewContainerRef;
    private _baseFrameworkFactory;
    constructor(_componentFactory: BaseComponentFactory);
    colDefFloatingCellRenderer(colDef: ColDef): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    colDefCellRenderer(colDef: ColDef): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    colDefCellEditor(colDef: ColDef): {
        new (): ICellEditor;
    } | string;
    gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    gridOptionsGroupRowRenderer(gridOptions: GridOptions): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
    colDefFilter(colDef: ColDef): {
        new (): IFilter;
    } | string;
    setViewContainerRef(viewContainerRef: ViewContainerRef): void;
}
