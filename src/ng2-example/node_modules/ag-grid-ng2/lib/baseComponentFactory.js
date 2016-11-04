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
var BaseComponentFactory = (function () {
    function BaseComponentFactory() {
    }
    BaseComponentFactory.prototype.createCellRendererFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createCellRendererFromTemplate = function (template, viewContainerRef) {
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createRendererFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createRendererFromTemplate = function (template, viewContainerRef, moduleImports) {
        if (moduleImports === void 0) { moduleImports = []; }
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createEditorFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createFilterFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], BaseComponentFactory);
    return BaseComponentFactory;
}());
exports.BaseComponentFactory = BaseComponentFactory;
