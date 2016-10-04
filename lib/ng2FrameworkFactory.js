"use strict";
var core_1 = require('@angular/core');
var main_1 = require('ag-grid/main');
var agComponentFactory_1 = require("./agComponentFactory");
var Ng2FrameworkFactory = (function () {
    function Ng2FrameworkFactory(_agComponentFactory) {
        this._agComponentFactory = _agComponentFactory;
        this._baseFrameworkFactory = new main_1.BaseFrameworkFactory(); // todo - inject this
    }
    Ng2FrameworkFactory.prototype.colDefFloatingCellRenderer = function (colDef) {
        if (colDef.floatingCellRendererFramework) {
            return this._agComponentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework.component, this._viewContainerRef, colDef.floatingCellRendererFramework.dependencies, colDef.floatingCellRendererFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.colDefCellRenderer = function (colDef) {
        if (colDef.cellRendererFramework) {
            if (colDef.cellRendererFramework.template) {
                return this._agComponentFactory.createRendererFromTemplate(colDef.cellRendererFramework.template, this._viewContainerRef, colDef.cellRendererFramework.moduleImports);
            }
            else {
                return this._agComponentFactory.createRendererFromComponent(colDef.cellRendererFramework.component, this._viewContainerRef, colDef.cellRendererFramework.dependencies, colDef.cellRendererFramework.moduleImports);
            }
        }
        else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.colDefCellEditor = function (colDef) {
        if (colDef.cellEditorFramework) {
            return this._agComponentFactory.createEditorFromComponent(colDef.cellEditorFramework.component, this._viewContainerRef, colDef.cellEditorFramework.dependencies, colDef.cellEditorFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsFullWidthCellRenderer = function (gridOptions) {
        if (gridOptions.fullWidthCellRendererFramework) {
            return this._agComponentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework.component, this._viewContainerRef, gridOptions.fullWidthCellRendererFramework.dependencies, gridOptions.fullWidthCellRendererFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsGroupRowRenderer = function (gridOptions) {
        if (gridOptions.groupRowRendererFramework) {
            return this._agComponentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework.component, this._viewContainerRef, gridOptions.groupRowRendererFramework.dependencies, gridOptions.groupRowRendererFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsGroupRowInnerRenderer = function (gridOptions) {
        if (gridOptions.groupRowInnerRendererFramework) {
            return this._agComponentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework.component, this._viewContainerRef, gridOptions.groupRowInnerRendererFramework.dependencies, gridOptions.groupRowInnerRendererFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.colDefFilter = function (colDef) {
        if (colDef.filterFramework) {
            return this._agComponentFactory.createFilterFromComponent(colDef.filterFramework.component, this._viewContainerRef, colDef.filterFramework.dependencies, colDef.filterFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.colDefFilter(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.setViewContainerRef = function (viewContainerRef) {
        this._viewContainerRef = viewContainerRef;
    };
    Ng2FrameworkFactory.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    Ng2FrameworkFactory.ctorParameters = [
        { type: agComponentFactory_1.AgComponentFactory, },
    ];
    return Ng2FrameworkFactory;
}());
exports.Ng2FrameworkFactory = Ng2FrameworkFactory;
