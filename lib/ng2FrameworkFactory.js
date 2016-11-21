"use strict";
var core_1 = require("@angular/core");
var main_1 = require("ag-grid/main");
var baseComponentFactory_1 = require("./baseComponentFactory");
var Ng2FrameworkFactory = (function () {
    function Ng2FrameworkFactory(_componentFactory) {
        this._componentFactory = _componentFactory;
        this._baseFrameworkFactory = new main_1.BaseFrameworkFactory(); // todo - inject this
    }
    Ng2FrameworkFactory.prototype.colDefFloatingCellRenderer = function (colDef) {
        if (colDef.floatingCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.colDefCellRenderer = function (colDef) {
        if (colDef.cellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.cellRendererFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.colDefCellEditor = function (colDef) {
        if (colDef.cellEditorFramework) {
            return this._componentFactory.createEditorFromComponent(colDef.cellEditorFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsFullWidthCellRenderer = function (gridOptions) {
        if (gridOptions.fullWidthCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsGroupRowRenderer = function (gridOptions) {
        if (gridOptions.groupRowRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsGroupRowInnerRenderer = function (gridOptions) {
        if (gridOptions.groupRowInnerRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.colDefFilter = function (colDef) {
        if (colDef.filterFramework) {
            return this._componentFactory.createFilterFromComponent(colDef.filterFramework, this._viewContainerRef);
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
        { type: baseComponentFactory_1.BaseComponentFactory, },
    ];
    return Ng2FrameworkFactory;
}());
exports.Ng2FrameworkFactory = Ng2FrameworkFactory;
//# sourceMappingURL=ng2FrameworkFactory.js.map