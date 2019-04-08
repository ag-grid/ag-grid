import {autoinject, Container, transient, ViewResources} from "aurelia-framework";
import {VanillaFrameworkOverrides, IFrameworkOverrides} from "ag-grid-community";

@autoinject()
@transient()
export class AureliaFrameworkFactory implements IFrameworkOverrides {
    private _container: Container;
    private _viewResources: ViewResources;
    private _baseFrameworkFactory: IFrameworkOverrides = new VanillaFrameworkOverrides();    // todo - inject this

    public setContainer(container: Container): void {
        this._container = container;
    }

    public setViewResources(viewResources: ViewResources): void {
        this._viewResources = viewResources;
    }

    setTimeout(action: any, timeout?: any): void {
        this._baseFrameworkFactory.setTimeout(action, timeout);
    }

    addEventListenerOutsideAngular(element: HTMLElement, type: string, listener: EventListener | EventListenerObject, useCapture?: boolean): void {
        this._baseFrameworkFactory.addEventListenerOutsideAngular(element, type, listener, useCapture);
    }
}
