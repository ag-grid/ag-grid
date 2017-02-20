// ag-grid-aurelia v8.1.0
import { Container, ViewResources, ViewCompiler } from "aurelia-framework";
import { IFrameworkFactory, IFilterComp, ICellRendererFunc, ColDef, GridOptions, ICellRendererComp, ICellEditorComp } from "ag-grid/main";
import { AureliaComponentFactory } from "./aureliaComponentFactory";
export declare class AureliaFrameworkFactory implements IFrameworkFactory {
    private _componentFactory;
    private _viewCompiler;
    private _container;
    private _viewResources;
    private _baseFrameworkFactory;
    constructor(_componentFactory: AureliaComponentFactory, _viewCompiler: ViewCompiler);
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
    setContainer(container: Container): void;
    setViewResources(viewResources: ViewResources): void;
    setTimeout(action: any, timeout?: any): void;
}
