// ag-grid-aurelia v8.2.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_framework_1 = require("aurelia-framework");
var main_1 = require("ag-grid/main");
var aureliaComponentFactory_1 = require("./aureliaComponentFactory");
var AureliaFrameworkFactory = (function () {
    function AureliaFrameworkFactory(_componentFactory, _viewCompiler) {
        this._componentFactory = _componentFactory;
        this._viewCompiler = _viewCompiler;
        this._baseFrameworkFactory = new main_1.BaseFrameworkFactory(); // todo - inject this
    }
    AureliaFrameworkFactory.prototype.colDefFloatingCellRenderer = function (colDef) {
        return this._baseFrameworkFactory.colDefFloatingCellRenderer(colDef);
    };
    AureliaFrameworkFactory.prototype.colDefCellRenderer = function (colDef) {
        if (colDef.cellRendererFramework) {
            if (!colDef.cellRendererFramework.$viewFactory) {
                colDef.cellRendererFramework.$viewFactory = this._viewCompiler.compile(colDef.cellRendererFramework.template, this._viewResources);
            }
            return this._componentFactory.createRendererFromTemplate(this._container, colDef.cellRendererFramework.$viewFactory);
        }
        else {
            return this._baseFrameworkFactory.colDefCellRenderer(colDef);
        }
    };
    AureliaFrameworkFactory.prototype.colDefCellEditor = function (colDef) {
        if (colDef.cellEditorFramework) {
            //cache the columnDef viewFactory
            if (!colDef.cellEditorFramework.$viewFactory) {
                colDef.cellEditorFramework.$viewFactory = this._viewCompiler.compile(colDef.cellEditorFramework.template, this._viewResources);
            }
            return this._componentFactory.createEditorFromTemplate(this._container, colDef.cellEditorFramework.$viewFactory);
        }
        else {
            return this._baseFrameworkFactory.colDefCellEditor(colDef);
        }
    };
    AureliaFrameworkFactory.prototype.gridOptionsFullWidthCellRenderer = function (gridOptions) {
        return this._baseFrameworkFactory.gridOptionsFullWidthCellRenderer(gridOptions);
    };
    AureliaFrameworkFactory.prototype.gridOptionsGroupRowRenderer = function (gridOptions) {
        return this._baseFrameworkFactory.gridOptionsGroupRowRenderer(gridOptions);
    };
    AureliaFrameworkFactory.prototype.gridOptionsGroupRowInnerRenderer = function (gridOptions) {
        return this._baseFrameworkFactory.gridOptionsGroupRowInnerRenderer(gridOptions);
    };
    AureliaFrameworkFactory.prototype.colDefFilter = function (colDef) {
        return this._baseFrameworkFactory.colDefFilter(colDef);
    };
    AureliaFrameworkFactory.prototype.setContainer = function (container) {
        this._container = container;
    };
    AureliaFrameworkFactory.prototype.setViewResources = function (viewResources) {
        this._viewResources = viewResources;
    };
    AureliaFrameworkFactory.prototype.setTimeout = function (action, timeout) {
        this._baseFrameworkFactory.setTimeout(action, timeout);
    };
    return AureliaFrameworkFactory;
}());
AureliaFrameworkFactory = __decorate([
    aurelia_framework_1.autoinject(),
    aurelia_framework_1.transient(),
    __metadata("design:paramtypes", [aureliaComponentFactory_1.AureliaComponentFactory, aurelia_framework_1.ViewCompiler])
], AureliaFrameworkFactory);
exports.AureliaFrameworkFactory = AureliaFrameworkFactory;
