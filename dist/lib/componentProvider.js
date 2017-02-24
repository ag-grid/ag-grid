/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v8.1.1
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
var context_1 = require("./context/context");
var headerGroupComp_1 = require("./headerRendering/headerGroup/headerGroupComp");
var headerComp_1 = require("./headerRendering/header/headerComp");
var dateFilter_1 = require("./filter/dateFilter");
var utils_1 = require("./utils");
var ComponentProvider = (function () {
    function ComponentProvider() {
    }
    ComponentProvider.prototype.postContruct = function () {
        this.allComponentConfig = {
            dateComponent: {
                mandatoryMethodList: ['getDate', 'setDate'],
                optionalMethodList: [],
                defaultComponent: dateFilter_1.DefaultDateComponent
            },
            headerComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: headerComp_1.HeaderComp
            },
            headerGroupComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: headerGroupComp_1.HeaderGroupComp
            }
        };
    };
    ComponentProvider.prototype.newAgGridComponent = function (holder, componentName) {
        var thisComponentConfig = this.allComponentConfig[componentName];
        if (!thisComponentConfig) {
            throw Error("Invalid component specified, there are no components of type : " + componentName);
        }
        var DefaultComponent = thisComponentConfig.defaultComponent;
        var CustomAgGridComponent = holder ? holder[componentName] : null;
        var FrameworkComponentRaw = holder ? holder[componentName + "Framework"] : null;
        if (CustomAgGridComponent && FrameworkComponentRaw) {
            throw Error("You are trying to register: " + componentName + " twice.");
        }
        if (FrameworkComponentRaw && !this.frameworkComponentWrapper) {
            throw Error("You are specifying a framework component but you are not using a framework version of ag-grid for : " + componentName);
        }
        if (!FrameworkComponentRaw) {
            var ComponentToUse = CustomAgGridComponent || DefaultComponent;
            if (!ComponentToUse) {
                throw Error("Unexpected error loading default component for: " + componentName + " default component not found.");
            }
            return new ComponentToUse();
        }
        //Using framework component
        return this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList);
    };
    ComponentProvider.prototype.createAgGridComponent = function (holder, componentName, agGridParams) {
        var component = this.newAgGridComponent(holder, componentName);
        var customParams = holder ? holder[componentName + "Params"] : null;
        var finalParams = {};
        utils_1._.mergeDeep(finalParams, agGridParams);
        utils_1._.mergeDeep(finalParams, customParams);
        this.context.wireBean(component);
        component.init(finalParams);
        return component;
    };
    ComponentProvider.prototype.newDateComponent = function (params) {
        return this.createAgGridComponent(this.gridOptions, "dateComponent", params);
    };
    ComponentProvider.prototype.newHeaderComponent = function (params) {
        return this.createAgGridComponent(params.column.getColDef(), "headerComponent", params);
    };
    ComponentProvider.prototype.newHeaderGroupComponent = function (params) {
        return this.createAgGridComponent(params.columnGroup.getColGroupDef(), "headerGroupComponent", params);
    };
    return ComponentProvider;
}());
__decorate([
    context_1.Autowired("gridOptions"),
    __metadata("design:type", Object)
], ComponentProvider.prototype, "gridOptions", void 0);
__decorate([
    context_1.Autowired("context"),
    __metadata("design:type", context_1.Context)
], ComponentProvider.prototype, "context", void 0);
__decorate([
    context_1.Optional("frameworkComponentWrapper"),
    __metadata("design:type", Object)
], ComponentProvider.prototype, "frameworkComponentWrapper", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComponentProvider.prototype, "postContruct", null);
ComponentProvider = __decorate([
    context_1.Bean('componentProvider')
], ComponentProvider);
exports.ComponentProvider = ComponentProvider;
