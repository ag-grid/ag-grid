// ag-grid-aurelia v21.0.1
import { Container, ViewResources } from "aurelia-framework";
import { IFrameworkOverrides } from "ag-grid-community";
export declare class AureliaFrameworkFactory implements IFrameworkOverrides {
    private _container;
    private _viewResources;
    private _baseFrameworkFactory;
    setContainer(container: Container): void;
    setViewResources(viewResources: ViewResources): void;
    setTimeout(action: any, timeout?: any): void;
    addEventListenerOutsideAngular(element: HTMLElement, type: string, listener: EventListener | EventListenerObject, useCapture?: boolean): void;
}
