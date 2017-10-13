/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v13.3.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var componentResolver_1 = require("./componentResolver");
var context_1 = require("../../context/context");
var componentProvider_1 = require("./componentProvider");
var agComponentUtils_1 = require("./agComponentUtils");
var NamedComponentResolver = (function () {
    function NamedComponentResolver() {
    }
    NamedComponentResolver.prototype.resolve = function (propertyName, componentNameOpt) {
        var componentName = componentNameOpt != null ? componentNameOpt : propertyName;
        var registeredComponent = this.componentProvider.retrieve(componentName);
        if (registeredComponent == null)
            return null;
        //If it is a FW it has to be registered as a component
        if (registeredComponent.type == componentResolver_1.ComponentType.FRAMEWORK) {
            return {
                component: registeredComponent.component,
                type: componentResolver_1.ComponentType.FRAMEWORK,
                source: componentResolver_1.ComponentSource.REGISTERED_BY_NAME
            };
        }
        //If it is JS it may be a function or a component
        if (this.agComponentUtils.doesImplementIComponent(registeredComponent.component)) {
            return {
                component: registeredComponent.component,
                type: componentResolver_1.ComponentType.AG_GRID,
                source: (registeredComponent.source == componentProvider_1.RegisteredComponentSource.REGISTERED) ? componentResolver_1.ComponentSource.REGISTERED_BY_NAME : componentResolver_1.ComponentSource.DEFAULT
            };
        }
        // This is a function
        return this.agComponentUtils.adaptFunction(propertyName, registeredComponent.component, registeredComponent.type, (registeredComponent.source == componentProvider_1.RegisteredComponentSource.REGISTERED) ? componentResolver_1.ComponentSource.REGISTERED_BY_NAME : componentResolver_1.ComponentSource.DEFAULT);
    };
    __decorate([
        context_1.Autowired("componentProvider"),
        __metadata("design:type", componentProvider_1.ComponentProvider)
    ], NamedComponentResolver.prototype, "componentProvider", void 0);
    __decorate([
        context_1.Autowired("agComponentUtils"),
        __metadata("design:type", agComponentUtils_1.AgComponentUtils)
    ], NamedComponentResolver.prototype, "agComponentUtils", void 0);
    NamedComponentResolver = __decorate([
        context_1.Bean("namedComponentResolver")
    ], NamedComponentResolver);
    return NamedComponentResolver;
}());
exports.NamedComponentResolver = NamedComponentResolver;
