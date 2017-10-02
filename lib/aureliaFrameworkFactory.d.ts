// ag-grid-aurelia v13.3.0
import { Container, ViewCompiler, ViewResources } from "aurelia-framework";
import { ColDef, IFilterComp, IFrameworkFactory } from "ag-grid/main";
import { AureliaComponentFactory } from "./aureliaComponentFactory";
export declare class AureliaFrameworkFactory implements IFrameworkFactory {
    private _componentFactory;
    private _viewCompiler;
    private _container;
    private _viewResources;
    private _baseFrameworkFactory;
    constructor(_componentFactory: AureliaComponentFactory, _viewCompiler: ViewCompiler);
    colDefFilter(colDef: ColDef): {
        new (): IFilterComp;
    } | string;
    setContainer(container: Container): void;
    setViewResources(viewResources: ViewResources): void;
    setTimeout(action: any, timeout?: any): void;
}
