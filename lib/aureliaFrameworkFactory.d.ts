// ag-grid-aurelia v14.2.0
import { Container, ViewResources } from "aurelia-framework";
import { IFrameworkFactory } from "ag-grid/main";
export declare class AureliaFrameworkFactory implements IFrameworkFactory {
    private _container;
    private _viewResources;
    private _baseFrameworkFactory;
    setContainer(container: Container): void;
    setViewResources(viewResources: ViewResources): void;
    setTimeout(action: any, timeout?: any): void;
}
