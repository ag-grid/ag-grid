"use strict";
var core_1 = require("@angular/core");
var main_1 = require("ag-grid/main");
var baseComponentFactory_1 = require("./baseComponentFactory");
var Ng2FrameworkFactory = (function () {
    function Ng2FrameworkFactory(_componentFactory, _ngZone) {
        this._componentFactory = _componentFactory;
        this._ngZone = _ngZone;
        this._baseFrameworkFactory = new main_1.BaseFrameworkFactory(); // todo - inject this
    }
    Ng2FrameworkFactory.prototype.colDefFloatingCellRenderer = function (colDef) {
        if (colDef.floatingCellRendererFramework && colDef.floatingCellRendererFramework.component) {
            console.warn("colDef.floatingCellRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.floatingCellRendererFramework = colDef.floatingCellRendererFramework.component;
        }
        if (colDef.floatingCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.colDefCellRenderer = function (colDef) {
        if (colDef.cellRendererFramework && colDef.cellRendererFramework.component) {
            console.warn("colDef.cellRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.cellRendererFramework = colDef.cellRendererFramework.component;
        }
        if (colDef.cellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.cellRendererFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.colDefCellEditor = function (colDef) {
        if (colDef.cellEditorFramework && colDef.cellEditorFramework.component) {
            console.warn("colDef.cellEditorFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.cellEditorFramework = colDef.cellEditorFramework.component;
        }
        if (colDef.cellEditorFramework) {
            return this._componentFactory.createEditorFromComponent(colDef.cellEditorFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsFullWidthCellRenderer = function (gridOptions) {
        if (gridOptions.fullWidthCellRendererFramework && gridOptions.fullWidthCellRendererFramework.component) {
            console.warn("gridOptions.fullWidthCellRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            gridOptions.fullWidthCellRendererFramework = gridOptions.fullWidthCellRendererFramework.component;
        }
        if (gridOptions.fullWidthCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsGroupRowRenderer = function (gridOptions) {
        if (gridOptions.groupRowRendererFramework && gridOptions.groupRowRendererFramework.component) {
            console.warn("gridOptions.groupRowRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            gridOptions.groupRowRendererFramework = gridOptions.groupRowRendererFramework.component;
        }
        if (gridOptions.groupRowRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsGroupRowInnerRenderer = function (gridOptions) {
        if (gridOptions.groupRowInnerRendererFramework && gridOptions.groupRowInnerRendererFramework.component) {
            console.warn("gridOptions.groupRowRendererFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            gridOptions.groupRowInnerRendererFramework = gridOptions.groupRowInnerRendererFramework.component;
        }
        if (gridOptions.groupRowInnerRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework, this._viewContainerRef);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.colDefFilter = function (colDef) {
        if (colDef.filterFramework && colDef.filterFramework.component) {
            console.warn("colDef.filterFramework.component is deprecated - please refer to https://ag-grid.com/best-angular-2-data-grid/");
            colDef.filterFramework = colDef.filterFramework.component;
        }
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
    Ng2FrameworkFactory.prototype.setTimeout = function (action, timeout) {
        this._ngZone.runOutsideAngular(function () {
            setTimeout(function () {
                action();
            }, timeout);
        });
    };
    return Ng2FrameworkFactory;
}());
Ng2FrameworkFactory.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
Ng2FrameworkFactory.ctorParameters = function () { return [
    { type: baseComponentFactory_1.BaseComponentFactory, },
    { type: core_1.NgZone, },
]; };
exports.Ng2FrameworkFactory = Ng2FrameworkFactory;
//# sourceMappingURL=ng2FrameworkFactory.js.map