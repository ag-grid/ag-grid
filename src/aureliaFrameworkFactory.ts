import {autoinject, transient, Container, ViewResources, ViewCompiler} from 'aurelia-framework';

import {
    ICellRenderer,
    ICellEditor,
    BaseFrameworkFactory,
    IFrameworkFactory,
    IFilter,
    ICellRendererFunc,
    ColDef,
    GridOptions
}   from 'ag-grid/main';

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
        // if (colDef.floatingCellRendererFramework) {
        //     return this._componentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework.component,
        //         this._container,
        //         colDef.floatingCellRendererFramework.dependencies,
        //         colDef.floatingCellRendererFramework.moduleImports
        //     )
        // } else {
        return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        // }
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
        // if (gridOptions.fullWidthCellRendererFramework) {
        //     return this._componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework.component,
        //         this._container,
        //         gridOptions.fullWidthCellRendererFramework.dependencies,
        //         gridOptions.fullWidthCellRendererFramework.moduleImports)
        // } else {
        return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        // }
    }

    public gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        // if (gridOptions.groupRowRendererFramework) {
        //     return this._componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework.component,
        //         this._container,
        //         gridOptions.groupRowRendererFramework.dependencies,
        //         gridOptions.groupRowRendererFramework.moduleImports)
        // } else {
        return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        // }
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        // if (gridOptions.groupRowInnerRendererFramework) {
        //     return this._componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework.component,
        //         this._container,
        //         gridOptions.groupRowInnerRendererFramework.dependencies,
        //         gridOptions.groupRowInnerRendererFramework.moduleImports)
        // } else {
        return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        // }
    }

    public colDefFilter(colDef: ColDef): {new (): IFilter;} | string {
        // if (colDef.filterFramework) {
        //     return this._componentFactory.createFilterFromComponent(colDef.filterFramework.component,
        //         this._container,
        //         colDef.filterFramework.dependencies,
        //         colDef.filterFramework.moduleImports)
        // } else {
        return this._baseFrameworkFactory.colDefFilter(colDef);
        // }
    }

    public setViewContainerRef(container: Container, viewResources: ViewResources): void {
        this._container = container;
        this._viewResources = viewResources;
    }
}
