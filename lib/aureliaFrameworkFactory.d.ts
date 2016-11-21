// ag-grid-aurelia v7.0.0
import { Container, ViewResources, ViewCompiler } from "aurelia-framework";
import { ICellRenderer, ICellEditor, IFrameworkFactory, IFilter, ICellRendererFunc, ColDef, GridOptions } from "ag-grid/main";
import { AureliaComponentFactory } from "./aureliaComponentFactory";
export declare class AureliaFrameworkFactory implements IFrameworkFactory {
    private _componentFactory;
    private _viewCompiler;
    private _container;
    private _viewResources;
    private _baseFrameworkFactory;
    constructor(_componentFactory: AureliaComponentFactory, _viewCompiler: ViewCompiler);
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
    setViewContainerRef(container: Container, viewResources: ViewResources): void;
}
