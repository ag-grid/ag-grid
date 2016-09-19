import { Component,
    ComponentFactory,
    ViewContainerRef,
    ComponentFactoryResolver,
    ComponentRef,
    Type,
    Injectable } from '@angular/core';

import {ICellRenderer,
    ICellEditor,
    MethodNotImplementedException,
    BaseFrameworkFactory,
    IFrameworkFactory,
    IFilter,
    ICellRendererFunc,
    ColDef,
    GridOptions}   from 'ag-grid/main';

import {AgComponentFactory} from "./agComponentFactory";

@Injectable()
export class Ng2FrameworkFactory implements IFrameworkFactory {
    private _viewContainerRef:ViewContainerRef;
    private _baseFrameworkFactory:IFrameworkFactory = new BaseFrameworkFactory();    // todo - inject this

    constructor(private _agComponentFactory:AgComponentFactory) {
    }

    public colDefFloatingCellRenderer(colDef:ColDef):{new(): ICellRenderer} | ICellRendererFunc | string {
        if (colDef.floatingCellRendererFramework) {
            return this._agComponentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework.component,
                this._viewContainerRef,
                colDef.floatingCellRendererFramework.dependencies,
                colDef.floatingCellRendererFramework.moduleImports
            )
        } else {
            return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    }

    public colDefCellRenderer(colDef:ColDef):{new(): ICellRenderer} | ICellRendererFunc | string {
        if (colDef.cellRendererFramework) {
            if (colDef.cellRendererFramework.template) {
                return this._agComponentFactory.createRendererFromTemplate(colDef.cellRendererFramework.template,
                    this._viewContainerRef,
                    colDef.cellRendererFramework.moduleImports);
            } else {
                return this._agComponentFactory.createRendererFromComponent(colDef.cellRendererFramework.component,
                    this._viewContainerRef,
                    colDef.cellRendererFramework.dependencies,
                    colDef.cellRendererFramework.moduleImports
                )
            }
        } else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    }

    public colDefCellEditor(colDef:ColDef):{new(): ICellEditor} | string {
        if (colDef.cellEditorFramework) {
            return this._agComponentFactory.createEditorFromComponent(colDef.cellEditorFramework.component,
                this._viewContainerRef,
                colDef.cellEditorFramework.dependencies,
                colDef.cellEditorFramework.moduleImports)
        } else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    }

    public gridOptionsFullWidthCellRenderer(gridOptions:GridOptions):{new(): ICellRenderer} | ICellRendererFunc | string {
        if (gridOptions.fullWidthCellRendererFramework) {
            return this._agComponentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework.component,
                this._viewContainerRef,
                gridOptions.fullWidthCellRendererFramework.dependencies,
                gridOptions.fullWidthCellRendererFramework.moduleImports)
        } else {
            return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowRenderer(gridOptions:GridOptions):{new(): ICellRenderer} | ICellRendererFunc | string {
        if (gridOptions.groupRowRendererFramework) {
            return this._agComponentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework.component,
                this._viewContainerRef,
                gridOptions.groupRowRendererFramework.dependencies,
                gridOptions.groupRowRendererFramework.moduleImports)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions:GridOptions):{new(): ICellRenderer} | ICellRendererFunc | string {
        if (gridOptions.groupRowInnerRendererFramework) {
            return this._agComponentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework.component,
                this._viewContainerRef,
                gridOptions.groupRowInnerRendererFramework.dependencies,
                gridOptions.groupRowInnerRendererFramework.moduleImports)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    }

    public colDefFilter(colDef:ColDef):{new (): IFilter;} | string {
        if (colDef.filterFramework) {
            return this._agComponentFactory.createFilterFromComponent(colDef.filterFramework.component,
                this._viewContainerRef,
                colDef.filterFramework.dependencies,
                colDef.filterFramework.moduleImports)
        } else {

            return this._baseFrameworkFactory.colDefFilter(colDef);
        }
    }


    public setViewContainerRef(viewContainerRef:ViewContainerRef):void {
        this._viewContainerRef = viewContainerRef;
    }
}
