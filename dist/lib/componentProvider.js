/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.2
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
var context_1 = require("./context/context");
var headerGroupComp_1 = require("./headerRendering/headerGroup/headerGroupComp");
var headerComp_1 = require("./headerRendering/header/headerComp");
var dateFilter_1 = require("./filter/dateFilter");
var utils_1 = require("./utils");
var floatingFilter_1 = require("./filter/floatingFilter");
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var floatingFilterWrapper_1 = require("./filter/floatingFilterWrapper");
var filterManager_1 = require("./filter/filterManager");
var ComponentType;
(function (ComponentType) {
    ComponentType[ComponentType["AG_GRID"] = 0] = "AG_GRID";
    ComponentType[ComponentType["FRAMEWORK"] = 1] = "FRAMEWORK";
})(ComponentType || (ComponentType = {}));
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
            },
            setFloatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached'],
                defaultComponent: floatingFilter_1.SetFloatingFilterComp
            },
            textFloatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached'],
                defaultComponent: floatingFilter_1.TextFloatingFilterComp
            },
            numberFloatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached'],
                defaultComponent: floatingFilter_1.NumberFloatingFilterComp
            },
            dateFloatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached'],
                defaultComponent: floatingFilter_1.DateFloatingFilterComp
            },
            readModelAsStringFloatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached'],
                defaultComponent: floatingFilter_1.ReadModelAsStringFloatingFilterComp
            },
            floatingFilterWrapperComponent: {
                mandatoryMethodList: [],
                optionalMethodList: [],
                defaultComponent: floatingFilterWrapper_1.FloatingFilterWrapperComp
            },
            emptyFloatingFilterWrapperComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached'],
                defaultComponent: floatingFilterWrapper_1.EmptyFloatingFilterWrapperComp
            },
            floatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached'],
                defaultComponent: null
            },
            filterComponent: {
                mandatoryMethodList: ['isFilterActive', 'doesFilterPass', 'getModel', 'setModel'],
                optionalMethodList: ['afterGuiAttached', 'onNewRowsLoaded', 'getModelAsString', 'onFloatingFilterChanged'],
                defaultComponent: null
            }
        };
    };
    /**
     * This method returns the underlying representation of the component to be created. ie for Javascript the
     * underlying function where we should be calling new into. In case of the frameworks, the framework class
     * object that represents the component to be created.
     *
     * This method is handy if you want to check if a component has a particular method implemented withougt
     * having to create the method itself
     */
    ComponentProvider.prototype.getComponentToUse = function (holder, componentName, thisComponentConfig, mandatory) {
        if (mandatory === void 0) { mandatory = true; }
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
                if (mandatory) {
                    throw Error("Unexpected error loading default component for: " + componentName + " default component not found.");
                }
                else {
                    return null;
                }
            }
            return {
                type: ComponentType.AG_GRID,
                component: ComponentToUse
            };
        }
        return {
            type: ComponentType.FRAMEWORK,
            component: FrameworkComponentRaw
        };
    };
    ComponentProvider.prototype.newAgGridComponent = function (holder, componentName, defaultComponentName, mandatory) {
        if (mandatory === void 0) { mandatory = true; }
        var thisComponentConfig = this.allComponentConfig[defaultComponentName];
        if (!thisComponentConfig) {
            if (mandatory) {
                throw Error("Invalid component specified, there are no components of type : " + componentName + " [" + defaultComponentName + "]");
            }
            return null;
        }
        var componentToUse = this.getComponentToUse(holder, componentName, thisComponentConfig, mandatory);
        if (!componentToUse)
            return null;
        if (componentToUse.type === ComponentType.AG_GRID) {
            return new componentToUse.component();
        }
        //Using framework component
        var FrameworkComponentRaw = componentToUse.component;
        return this.frameworkComponentWrapper.wrap(FrameworkComponentRaw, thisComponentConfig.mandatoryMethodList, thisComponentConfig.optionalMethodList);
    };
    ComponentProvider.prototype.createAgGridComponent = function (holder, componentName, defaultComponentName, agGridParams, mandatory) {
        if (mandatory === void 0) { mandatory = true; }
        var component = this.newAgGridComponent(holder, componentName, defaultComponentName, mandatory);
        if (!component)
            return null;
        var finalParams = this.getParams(holder, componentName, agGridParams);
        this.context.wireBean(component);
        component.init(finalParams);
        return component;
    };
    ComponentProvider.prototype.getParams = function (holder, componentName, agGridParams) {
        var customParams = holder ? holder[componentName + "Params"] : null;
        var finalParams = {};
        utils_1._.mergeDeep(finalParams, agGridParams);
        utils_1._.mergeDeep(finalParams, customParams);
        if (!finalParams.api) {
            finalParams.api = this.gridOptions.api;
        }
        return finalParams;
    };
    ComponentProvider.prototype.newDateComponent = function (params) {
        return this.createAgGridComponent(this.gridOptions, "dateComponent", "dateComponent", params);
    };
    ComponentProvider.prototype.newHeaderComponent = function (params) {
        return this.createAgGridComponent(params.column.getColDef(), "headerComponent", "headerComponent", params);
    };
    ComponentProvider.prototype.newHeaderGroupComponent = function (params) {
        return this.createAgGridComponent(params.columnGroup.getColGroupDef(), "headerGroupComponent", "headerGroupComponent", params);
    };
    ComponentProvider.prototype.newFloatingFilterComponent = function (type, colDef, params) {
        var floatingFilterToInstantiate = type === 'custom' ? 'floatingFilterComponent' : type + "FloatingFilterComponent";
        return this.createAgGridComponent(colDef, "floatingFilterComponent", floatingFilterToInstantiate, params, false);
    };
    ComponentProvider.prototype.getFilterComponentPrototype = function (colDef) {
        return this.getComponentToUse(colDef, "filterComponent", this.allComponentConfig['filterComponent'], false);
    };
    ComponentProvider.prototype.newFloatingFilterWrapperComponent = function (column, params) {
        var _this = this;
        var colDef = column.getColDef();
        if (colDef.suppressFilter) {
            return this.newEmptyFloatingFilterWrapperComponent(column);
        }
        var floatingFilterType;
        if (typeof colDef.filter === 'string') {
            floatingFilterType = colDef.filter;
        }
        else if (!colDef.filter) {
            floatingFilterType = this.gridOptionsWrapper.isEnterprise() ? 'set' : 'text';
        }
        else {
            floatingFilterType = 'custom';
        }
        var floatingFilter = this.newFloatingFilterComponent(floatingFilterType, colDef, params);
        var floatingFilterWrapperComponentParams = {
            column: column,
            floatingFilterComp: floatingFilter,
            suppressFilterButton: this.getParams(colDef, 'floatingFilterComponent', params).suppressFilterButton
        };
        if (!floatingFilter) {
            var filterComponent = this.getFilterComponentPrototype(colDef);
            if (filterComponent && !filterComponent.component.prototype.getModelAsString) {
                return this.newEmptyFloatingFilterWrapperComponent(column);
            }
            var rawModelFn_1 = params.currentParentModel;
            params.currentParentModel = function () {
                var parent = _this.filterManager.getFilterComponent(column);
                return parent.getModelAsString(rawModelFn_1());
            };
            floatingFilterWrapperComponentParams.floatingFilterComp = this.newFloatingFilterComponent('readModelAsString', colDef, params);
        }
        return this.createAgGridComponent(colDef, "floatingFilterWrapperComponent", "floatingFilterWrapperComponent", floatingFilterWrapperComponentParams);
    };
    ComponentProvider.prototype.newEmptyFloatingFilterWrapperComponent = function (column) {
        var floatingFilterWrapperComponentParams = {
            column: column,
            floatingFilterComp: null
        };
        return this.createAgGridComponent(column.getColDef(), "floatingFilterWrapperComponent", "emptyFloatingFilterWrapperComponent", floatingFilterWrapperComponentParams);
    };
    __decorate([
        context_1.Autowired("gridOptions"),
        __metadata("design:type", Object)
    ], ComponentProvider.prototype, "gridOptions", void 0);
    __decorate([
        context_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ComponentProvider.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], ComponentProvider.prototype, "filterManager", void 0);
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
    return ComponentProvider;
}());
exports.ComponentProvider = ComponentProvider;
