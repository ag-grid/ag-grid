/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v14.2.0
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
var context_1 = require("../../context/context");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var filterManager_1 = require("../../filter/filterManager");
var componentResolver_1 = require("./componentResolver");
var ComponentType;
(function (ComponentType) {
    ComponentType[ComponentType["AG_GRID"] = 0] = "AG_GRID";
    ComponentType[ComponentType["FRAMEWORK"] = 1] = "FRAMEWORK";
})(ComponentType || (ComponentType = {}));
var ComponentRecipes = (function () {
    function ComponentRecipes() {
    }
    ComponentRecipes.prototype.newDateComponent = function (params) {
        return this.componentResolver.createAgGridComponent(this.gridOptions, params, "dateComponent");
    };
    ComponentRecipes.prototype.newHeaderComponent = function (params) {
        return this.componentResolver.createAgGridComponent(params.column.getColDef(), params, "headerComponent");
    };
    ComponentRecipes.prototype.newHeaderGroupComponent = function (params) {
        return this.componentResolver.createAgGridComponent(params.columnGroup.getColGroupDef(), params, "headerGroupComponent");
    };
    ComponentRecipes.prototype.newFloatingFilterComponent = function (type, colDef, params) {
        //type if populated must be one of ['set','number','text','date']
        var floatingFilterName = type + "FloatingFilterComponent";
        return this.componentResolver.createAgGridComponent(colDef, params, "floatingFilterComponent", floatingFilterName, false);
    };
    ComponentRecipes.prototype.newFloatingFilterWrapperComponent = function (column, params) {
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
            suppressFilterButton: this.componentResolver.mergeParams(colDef, 'floatingFilterComponent', params).suppressFilterButton
        };
        if (!floatingFilter) {
            var filterComponent = this.getFilterComponentPrototype(colDef);
            if (filterComponent && !filterComponent.component.prototype.getModelAsString) {
                return this.newEmptyFloatingFilterWrapperComponent(column);
            }
            var rawModelFn_1 = params.currentParentModel;
            params.currentParentModel = function () {
                var parentPromise = _this.filterManager.getFilterComponent(column);
                return parentPromise.resolveNow(null, function (parent) { return parent.getModelAsString ? parent.getModelAsString(rawModelFn_1()) : null; });
            };
            floatingFilterWrapperComponentParams.floatingFilterComp = this.newFloatingFilterComponent('readModelAsString', colDef, params);
        }
        return this.componentResolver.createAgGridComponent(colDef, floatingFilterWrapperComponentParams, "floatingFilterWrapperComponent");
    };
    ComponentRecipes.prototype.newFullWidthGroupRowInnerCellRenderer = function (params) {
        return this.componentResolver.createAgGridComponent(this.gridOptions, params, "groupRowInnerRenderer", "groupRowInnerRenderer", false);
    };
    ComponentRecipes.prototype.newCellRenderer = function (target, params) {
        return this.componentResolver.createAgGridComponent(target, params, "cellRenderer", "cellRenderer", false);
    };
    ComponentRecipes.prototype.newInnerCellRenderer = function (target, params) {
        return this.componentResolver.createAgGridComponent(target, params, "innerRenderer");
    };
    ComponentRecipes.prototype.newFullRowGroupRenderer = function (params) {
        return this.componentResolver.createAgGridComponent(this.gridOptionsWrapper, params, "fullWidthCellRenderer");
    };
    ComponentRecipes.prototype.getFilterComponentPrototype = function (colDef) {
        return this.componentResolver.getComponentToUse(colDef, "filterComponent");
    };
    ComponentRecipes.prototype.newEmptyFloatingFilterWrapperComponent = function (column) {
        var floatingFilterWrapperComponentParams = {
            column: column,
            floatingFilterComp: null
        };
        return this.componentResolver.createAgGridComponent(column.getColDef(), floatingFilterWrapperComponentParams, "floatingFilterWrapperComponent", "emptyFloatingFilterWrapperComponent");
    };
    __decorate([
        context_1.Autowired("componentResolver"),
        __metadata("design:type", componentResolver_1.ComponentResolver)
    ], ComponentRecipes.prototype, "componentResolver", void 0);
    __decorate([
        context_1.Autowired("gridOptions"),
        __metadata("design:type", Object)
    ], ComponentRecipes.prototype, "gridOptions", void 0);
    __decorate([
        context_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ComponentRecipes.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], ComponentRecipes.prototype, "filterManager", void 0);
    ComponentRecipes = __decorate([
        context_1.Bean('componentRecipes')
    ], ComponentRecipes);
    return ComponentRecipes;
}());
exports.ComponentRecipes = ComponentRecipes;
