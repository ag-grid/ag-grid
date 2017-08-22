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
