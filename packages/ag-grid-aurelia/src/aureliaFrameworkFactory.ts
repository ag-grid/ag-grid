import {autoinject, Container, transient, ViewResources} from "aurelia-framework";
import {BaseFrameworkFactory, IFrameworkFactory} from "ag-grid-community";

@autoinject()
@transient()
export class AureliaFrameworkFactory implements IFrameworkFactory {
    private _container: Container;
    private _viewResources: ViewResources;
    private _baseFrameworkFactory: IFrameworkFactory = new BaseFrameworkFactory();    // todo - inject this

    public setContainer(container: Container): void {
        this._container = container;
    }

    public setViewResources(viewResources: ViewResources): void {
        this._viewResources = viewResources;
    }

    setTimeout(action: any, timeout?: any): void {
        this._baseFrameworkFactory.setTimeout(action, timeout);
    }
}
