import {BaseFrameworkFactory} from "ag-grid/main";
import VueComponentFactory from "./vueComponentFactory";

export default (function () {
    function VueFrameworkFactory($el, parent) {
        this._baseFrameworkFactory = new BaseFrameworkFactory();
        this._componentFactory = new VueComponentFactory($el, parent);
    }

    VueFrameworkFactory.prototype.colDefFloatingCellRenderer = function (colDef) {
        if (colDef.floatingCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework)
        } else {
            return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    };

    VueFrameworkFactory.prototype.colDefCellRenderer = function (colDef) {
        if (colDef.cellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.cellRendererFramework)
        } else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    };

    VueFrameworkFactory.prototype.colDefCellEditor = function (colDef) {
        if (colDef.cellEditorFramework) {
            return this._componentFactory.createEditorFromComponent(colDef.cellEditorFramework)
        } else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    };

    VueFrameworkFactory.prototype.gridOptionsFullWidthCellRenderer = function (gridOptions) {
        if (gridOptions.fullWidthCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework)
        } else {
            return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    };

    VueFrameworkFactory.prototype.gridOptionsGroupRowRenderer = function (gridOptions) {
        if (gridOptions.groupRowRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    };

    VueFrameworkFactory.prototype.gridOptionsGroupRowInnerRenderer = function (gridOptions) {
        if (gridOptions.groupRowInnerRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework)
        } else {
            return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    };

    VueFrameworkFactory.prototype.colDefFilter = function (colDef) {
        if (colDef.filterFramework) {
            return this._componentFactory.createFilterFromComponent(colDef.filterFramework)
        } else {

            return this._baseFrameworkFactory.colDefFilter(colDef);
        }
    };

    VueFrameworkFactory.prototype.setTimeout = function (action, timeout) {
        this._baseFrameworkFactory.setTimeout(action, timeout);
    };
    return VueFrameworkFactory;
}());
