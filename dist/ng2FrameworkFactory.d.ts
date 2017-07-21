import { NgZone, ViewContainerRef } from "@angular/core";
import { ICellRendererComp, ICellEditorComp, IFrameworkFactory, ICellRendererFunc, IFilterComp, ColDef, GridOptions } from "ag-grid/main";
import { BaseComponentFactory } from "./baseComponentFactory";
export declare class Ng2FrameworkFactory implements IFrameworkFactory {
    private _componentFactory;
    private _ngZone;
    private _viewContainerRef;
    private _baseFrameworkFactory;
    constructor(_componentFactory: BaseComponentFactory, _ngZone: NgZone);
    colDefFloatingCellRenderer(colDef: ColDef): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    colDefCellRenderer(colDef: ColDef): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    colDefCellEditor(colDef: ColDef): {
        new (): ICellEditorComp;
    } | string;
    gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    gridOptionsGroupRowRenderer(gridOptions: GridOptions): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    colDefFilter(colDef: ColDef): {
        new (): IFilterComp;
    } | string;
    setViewContainerRef(viewContainerRef: ViewContainerRef): void;
    setTimeout(action: any, timeout?: any): void;
}
