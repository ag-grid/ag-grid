import {BaseFrameworkFactory} from "ag-grid/main";
import {VueComponentFactory} from "./vueComponentFactory";

export class VueFrameworkFactory {
    constructor($el, parent) {
        this._baseFrameworkFactory = new BaseFrameworkFactory();
        this._componentFactory = new VueComponentFactory($el, parent);
    }

    colDefFloatingCellRenderer(colDef) {
        if (colDef.floatingCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework)
        } else {
            return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    }

    colDefCellRenderer(colDef) {
        if (colDef.cellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.cellRendererFramework)
        } else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    }

    colDefCellEditor(colDef) {
        if (colDef.cellEditorFramework) {
            return this._componentFactory.createEditorFromComponent(colDef.cellEditorFramework)
        } else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    }

    gridOptionsFullWidthCellRenderer(gridOptions) {
        if (gridOptions.fullWidthCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework)
        } else {
            return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    }

    gridOptionsGroupRowRenderer(gridOptions) {
        if (gridOptions.groupRowRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    }

    gridOptionsGroupRowInnerRenderer(gridOptions) {
        if (gridOptions.groupRowInnerRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    }

    colDefFilter(colDef) {
        if (colDef.filterFramework) {
            return this._componentFactory.createFilterFromComponent(colDef.filterFramework)
        } else {

            return this._baseFrameworkFactory.colDefFilter(colDef);
        }
    }

    setTimeout(action, timeout) {
        this._baseFrameworkFactory.setTimeout(action, timeout);
    }
}
