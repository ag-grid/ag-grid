import {autoinject, Container, transient, ViewCompiler, ViewResources} from "aurelia-framework";
import {BaseFrameworkFactory, ColDef, ICellEditorComp, IFilterComp, IFrameworkFactory} from "ag-grid/main";
import {AureliaComponentFactory} from "./aureliaComponentFactory";

@autoinject()
@transient()
export class AureliaFrameworkFactory implements IFrameworkFactory {
    private _container: Container;
    private _viewResources: ViewResources;
    private _baseFrameworkFactory: IFrameworkFactory = new BaseFrameworkFactory();    // todo - inject this

    constructor(private _componentFactory: AureliaComponentFactory, private _viewCompiler: ViewCompiler) {
    }

    public colDefFilter(colDef: ColDef): { new (): IFilterComp; } | string {
        return this._baseFrameworkFactory.colDefFilter(colDef);
    }

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
