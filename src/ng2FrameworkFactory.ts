import {NgZone, ViewContainerRef, Injectable} from "@angular/core";
import {
    ICellRendererComp,
    ICellEditorComp,
    BaseFrameworkFactory,
    IFrameworkFactory,
    ICellRendererFunc,
    IFilterComp,
    ColDef,
    GridOptions
} from "ag-grid/main";
import {BaseComponentFactory} from "./baseComponentFactory";

@Injectable()
export class Ng2FrameworkFactory implements IFrameworkFactory {
    private _viewContainerRef: ViewContainerRef;
    private _baseFrameworkFactory: IFrameworkFactory = new BaseFrameworkFactory();    // todo - inject this

    constructor(private _componentFactory: BaseComponentFactory, private _ngZone: NgZone) {
    }

    public colDefFloatingCellRenderer(colDef: ColDef): {new(): ICellRendererComp} | ICellRendererFunc | string {
        if(colDef.floatingCellRendererFramework && colDef.floatingCellRendererFramework.component) {
            console.warn("colDef.floatingCellRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.floatingCellRendererFramework = colDef.floatingCellRendererFramework.component;
        }

        if (colDef.floatingCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    }

    public colDefCellRenderer(colDef: ColDef): {new(): ICellRendererComp} | ICellRendererFunc | string {
        if(colDef.cellRendererFramework && colDef.cellRendererFramework.component) {
            console.warn("colDef.cellRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.cellRendererFramework = colDef.cellRendererFramework.component;
        }

        if (colDef.cellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.cellRendererFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    }

    public colDefCellEditor(colDef: ColDef): {new(): ICellEditorComp} | string {
        if(colDef.cellEditorFramework && colDef.cellEditorFramework.component) {
            console.warn("colDef.cellEditorFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.cellEditorFramework = colDef.cellEditorFramework.component;
        }

        if (colDef.cellEditorFramework) {
            return this._componentFactory.createEditorFromComponent(colDef.cellEditorFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    }

    public gridOptionsFullWidthCellRenderer(gridOptions: GridOptions): {new(): ICellRendererComp} | ICellRendererFunc | string {
        if(gridOptions.fullWidthCellRendererFramework && gridOptions.fullWidthCellRendererFramework.component) {
            console.warn("gridOptions.fullWidthCellRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            gridOptions.fullWidthCellRendererFramework = gridOptions.fullWidthCellRendererFramework.component;
        }

        if (gridOptions.fullWidthCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowRenderer(gridOptions: GridOptions): {new(): ICellRendererComp} | ICellRendererFunc | string {
        if(gridOptions.groupRowRendererFramework && gridOptions.groupRowRendererFramework.component) {
            console.warn("gridOptions.groupRowRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            gridOptions.groupRowRendererFramework = gridOptions.groupRowRendererFramework.component;
        }

        if (gridOptions.groupRowRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions: GridOptions): {new(): ICellRendererComp} | ICellRendererFunc | string {
        if(gridOptions.groupRowInnerRendererFramework && gridOptions.groupRowInnerRendererFramework.component) {
            console.warn("gridOptions.groupRowRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            gridOptions.groupRowInnerRendererFramework = gridOptions.groupRowInnerRendererFramework.component;
        }

        if (gridOptions.groupRowInnerRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework,
                this._viewContainerRef)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    }

    public colDefFilter(colDef: ColDef): {new (): IFilterComp;} | string {
        if(colDef.filterFramework && colDef.filterFramework.component) {
            console.warn("colDef.filterFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.filterFramework = colDef.filterFramework.component;
        }

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

    public setTimeout(action: any, timeout?: any): void {
        this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                action();
            }, timeout);
        });
    }
}
