// ag-grid-ng2 v6.2.0
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var main_1 = require('ag-grid/main');
var baseComponentFactory_1 = require("./baseComponentFactory");
var Ng2FrameworkFactory = (function () {
    function Ng2FrameworkFactory(_componentFactory) {
        this._componentFactory = _componentFactory;
        this._baseFrameworkFactory = new main_1.BaseFrameworkFactory(); // todo - inject this
    }
    Ng2FrameworkFactory.prototype.colDefFloatingCellRenderer = function (colDef) {
        if (colDef.floatingCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(colDef.floatingCellRendererFramework.component, this._viewContainerRef, colDef.floatingCellRendererFramework.dependencies, colDef.floatingCellRendererFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.colDefCellRenderer = function (colDef) {
        if (colDef.cellRendererFramework) {
            if (colDef.cellRendererFramework.template) {
                return this._componentFactory.createRendererFromTemplate(colDef.cellRendererFramework.template, this._viewContainerRef, colDef.cellRendererFramework.moduleImports);
            }
            else {
                return this._componentFactory.createRendererFromComponent(colDef.cellRendererFramework.component, this._viewContainerRef, colDef.cellRendererFramework.dependencies, colDef.cellRendererFramework.moduleImports);
            }
        }
        else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.colDefCellEditor = function (colDef) {
        if (colDef.cellEditorFramework) {
            return this._componentFactory.createEditorFromComponent(colDef.cellEditorFramework.component, this._viewContainerRef, colDef.cellEditorFramework.dependencies, colDef.cellEditorFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsFullWidthCellRenderer = function (gridOptions) {
        if (gridOptions.fullWidthCellRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.fullWidthCellRendererFramework.component, this._viewContainerRef, gridOptions.fullWidthCellRendererFramework.dependencies, gridOptions.fullWidthCellRendererFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsGroupRowRenderer = function (gridOptions) {
        if (gridOptions.groupRowRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowRendererFramework.component, this._viewContainerRef, gridOptions.groupRowRendererFramework.dependencies, gridOptions.groupRowRendererFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.gridOptionsGroupRowInnerRenderer = function (gridOptions) {
        if (gridOptions.groupRowInnerRendererFramework) {
            return this._componentFactory.createRendererFromComponent(gridOptions.groupRowInnerRendererFramework.component, this._viewContainerRef, gridOptions.groupRowInnerRendererFramework.dependencies, gridOptions.groupRowInnerRendererFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
        }
    };
    Ng2FrameworkFactory.prototype.colDefFilter = function (colDef) {
        if (colDef.filterFramework) {
            return this._componentFactory.createFilterFromComponent(colDef.filterFramework.component, this._viewContainerRef, colDef.filterFramework.dependencies, colDef.filterFramework.moduleImports);
        }
        else {
            return this._baseFrameworkFactory.colDefFilter(colDef);
        }
    };
    Ng2FrameworkFactory.prototype.setViewContainerRef = function (viewContainerRef) {
        this._viewContainerRef = viewContainerRef;
    };
    Ng2FrameworkFactory = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [baseComponentFactory_1.BaseComponentFactory])
    ], Ng2FrameworkFactory);
    return Ng2FrameworkFactory;
}());
exports.Ng2FrameworkFactory = Ng2FrameworkFactory;
