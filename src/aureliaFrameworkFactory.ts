import {autoinject, transient, Container, ViewResources, ViewCompiler} from "aurelia-framework";

import {
    ICellRenderer,
    ICellEditor,
    BaseFrameworkFactory,
    IFrameworkFactory,
    IFilter,
    ICellRendererFunc,
    ColDef,
    GridOptions
} from "ag-grid/main";

import {AureliaComponentFactory} from "./aureliaComponentFactory";

@autoinject()
@transient()
export class AureliaFrameworkFactory implements IFrameworkFactory {
    private _container: Container;
    private _viewResources: ViewResources;
    private _baseFrameworkFactory: IFrameworkFactory = new BaseFrameworkFactory();    // todo - inject this

    constructor(private _componentFactory: AureliaComponentFactory, private _viewCompiler: ViewCompiler) {
    }

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (colDef.cellRendererFramework) {
            if (!colDef.cellRendererFramework.$viewFactory) {
                colDef.cellRendererFramework.$viewFactory = this._viewCompiler.compile(colDef.cellRendererFramework.template, this._viewResources);
            }

            return this._componentFactory.createRendererFromTemplate(this._container, colDef.cellRendererFramework.$viewFactory);
        } else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    }

    public colDefCellEditor(colDef: ColDef): {new(): ICellEditor} | string {
        if (colDef.cellEditorFramework) {
            //cache the columnDef viewFactory
            if (!colDef.cellEditorFramework.$viewFactory) {
                colDef.cellEditorFramework.$viewFactory = this._viewCompiler.compile(colDef.cellEditorFramework.template, this._viewResources);
            }
            return this._componentFactory.createEditorFromTemplate(this._container, colDef.cellEditorFramework.$viewFactory);

        } else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    }

    public gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
    }

    public gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
    }

    public colDefFilter(colDef: ColDef): {new (): IFilter;} | string {
        return this._baseFrameworkFactory.colDefFilter(colDef);
    }

    public setContainer(container: Container): void {
        this._container = container;
    }

    public setViewResources(viewResources: ViewResources): void {
        this._viewResources = viewResources;
    }
}
