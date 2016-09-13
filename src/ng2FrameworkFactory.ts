import { Component,
    ComponentFactory,
    ViewContainerRef,
    ComponentFactoryResolver,
    ComponentRef,
    Type,
    Injectable } from '@angular/core';

import { ICellRenderer, ICellEditor, MethodNotImplementedException, BaseFrameworkFactory }   from 'ag-grid/main';
import {ICellRendererFunc, ColDef, GridOptions} from 'ag-grid/main';

import {AgComponentFactory} from "./agComponentFactory";

@Injectable()
export class Ng2FrameworkFactory extends BaseFrameworkFactory {
    private viewContainerRef:ViewContainerRef;

    constructor(private _agComponentFactory:AgComponentFactory) {
        super();
    }

    public setViewContainerRef(viewContainerRef:ViewContainerRef):void {
        this.viewContainerRef = viewContainerRef;
    }


    public colDefFloatingCellRenderer(colDef:ColDef):{new(): ICellRenderer} | ICellRendererFunc | string {
        if (colDef.floatingCellRendererFramework) {
            return this._agComponentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework.component,
                this.viewContainerRef,
                colDef.floatingCellRendererFramework.dependencies,
                colDef.floatingCellRendererFramework.moduleImports
            )
        } else {
            return super.colDefFloatingCellRenderer(colDef);
        }
    }

    public colDefCellRenderer(colDef:ColDef):{new(): ICellRenderer} | ICellRendererFunc | string {
        if (colDef.cellRendererFramework) {
            if (colDef.cellRendererFramework.template) {
                return this._agComponentFactory.createRendererFromTemplate(colDef.cellRendererFramework.template,
                    this.viewContainerRef);
            } else {
                return this._agComponentFactory.createRendererFromComponent(colDef.cellRendererFramework.component,
                    this.viewContainerRef,
                    colDef.cellRendererFramework.dependencies,
                    colDef.cellRendererFramework.moduleImports
                )
            }
        } else {
            return super.colDefCellRenderer(colDef);
        }
    }

    public colDefCellEditor(colDef:ColDef):{new(): ICellEditor} | string {
        if (colDef.cellEditorFramework) {
            return this._agComponentFactory.createEditor(colDef.cellEditorFramework.component,
                this.viewContainerRef,
                colDef.cellEditorFramework.dependencies,
                colDef.cellEditorFramework.moduleImports)
        } else {
            return super.colDefCellEditor(colDef);
        }
    }

    public gridOptionsFullWidthCellRenderer(gridOptions:GridOptions):{new(): ICellRenderer} | ICellRendererFunc | string {
        if (gridOptions.fullWidthCellRendererFramework) {
        } else {
            return super.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowRenderer(gridOptions:GridOptions):{new(): ICellRenderer} | ICellRendererFunc | string {
        if (gridOptions.groupRowRendererFramework) {
        } else {
            return super.gridOptionsGroupRowRenderer(gridOptions);
        }
    }

    public gridOptionsGroupRowInnerRenderer(gridOptions:GridOptions):{new(): ICellRenderer} | ICellRendererFunc | string {
        if (gridOptions.groupRowInnerRendererFramework) {
        } else {
            return super.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    }

}
