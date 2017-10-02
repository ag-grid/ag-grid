// ag-grid-aurelia v13.3.0
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
var AureliaFrameworkFactory = /** @class */ (function () {
    function AureliaFrameworkFactory(_componentFactory, _viewCompiler) {
        this._componentFactory = _componentFactory;
        this._viewCompiler = _viewCompiler;
        this._baseFrameworkFactory = new main_1.BaseFrameworkFactory(); // todo - inject this
    }
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
    AureliaFrameworkFactory = __decorate([
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.transient(),
        __metadata("design:paramtypes", [aureliaComponentFactory_1.AureliaComponentFactory, aurelia_framework_1.ViewCompiler])
    ], AureliaFrameworkFactory);
    return AureliaFrameworkFactory;
}());
exports.AureliaFrameworkFactory = AureliaFrameworkFactory;
