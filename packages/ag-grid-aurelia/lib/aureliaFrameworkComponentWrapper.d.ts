// ag-grid-aurelia v20.2.0
import { Container, TaskQueue, ViewCompiler, ViewResources } from "aurelia-framework";
import { BaseComponentWrapper, FrameworkComponentWrapper, WrapableInterface } from 'ag-grid-community';
export declare class AureliaFrameworkComponentWrapper extends BaseComponentWrapper<WrapableInterface> implements FrameworkComponentWrapper {
    private taskQueue;
    private _viewCompiler;
    private _container;
    private _viewResources;
    constructor(taskQueue: TaskQueue, _viewCompiler: ViewCompiler);
    createWrapper(template: any): WrapableInterface;
    setContainer(container: Container): void;
    setViewResources(viewResources: ViewResources): void;
}
