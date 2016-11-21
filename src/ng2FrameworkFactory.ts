import {ViewContainerRef, Injectable} from "@angular/core";
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
import {BaseComponentFactory} from "./baseComponentFactory";

@Injectable()
export class Ng2FrameworkFactory implements IFrameworkFactory {
    private _viewContainerRef: ViewContainerRef;
    private _baseFrameworkFactory: IFrameworkFactory = new BaseFrameworkFactory();    // todo - inject this

    constructor(private _componentFactory: BaseComponentFactory) {
    }

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (colDef.floatingCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (colDef.cellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.cellRendererFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    }

    public colDefCellEditor(colDef: ColDef): {new(): ICellEditor} | string {
        if (colDef.cellEditorFramework) {
            return this._componentFactory.createEditorFromComponent(colDef.cellEditorFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    }

    public gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (gridOptions.fullWidthCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (gridOptions.groupRowRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRenderer} | ICellRendererFunc | string {
        if (gridOptions.groupRowInnerRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    }

    public colDefFilter(colDef: ColDef): {new (): IFilter;} | string {
        if (colDef.filterFramework) {
            return this._componentFactory.createFilterFromComponent(colDef.filterFramework,
                this._viewContainerRef)
        } else {

            return this._baseFrameworkFactory.colDefFilter(colDef);
        }
    }


    public setViewContainerRef(viewContainerRef: ViewContainerRef): void {
        this._viewContainerRef = viewContainerRef;
    }
}
