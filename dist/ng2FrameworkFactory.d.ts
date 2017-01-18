import { NgZone, ViewContainerRef } from "@angular/core";
import { ICellRenderer, ICellEditor, IFrameworkFactory, IFilter, ICellRendererFunc, ColDef, GridOptions } from "ag-grid/main";
import { BaseComponentFactory } from "./baseComponentFactory";
export declare class Ng2FrameworkFactory implements IFrameworkFactory {
    private _componentFactory;
    private _ngZone;
    private _viewContainerRef;
    private _baseFrameworkFactory;
    constructor(_componentFactory: BaseComponentFactory, _ngZone: NgZone);
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
    setTimeout(action: any, timeout?: any): void;
}
