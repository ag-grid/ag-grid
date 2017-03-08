"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var main_1 = require("ag-grid/main");
var BaseComponentFactory = (function () {
    function BaseComponentFactory() {
    }
    BaseComponentFactory.prototype.createCellRendererFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createRendererFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createEditorFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createFilterFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    return BaseComponentFactory;
}());
BaseComponentFactory = __decorate([
    core_1.Injectable()
], BaseComponentFactory);
exports.BaseComponentFactory = BaseComponentFactory;
//# sourceMappingURL=baseComponentFactory.js.map