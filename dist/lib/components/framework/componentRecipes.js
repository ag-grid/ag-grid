/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
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
var floatingFilter_1 = require("../../filter/floatingFilter");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var floatingFilterWrapper_1 = require("../../filter/floatingFilterWrapper");
var filterManager_1 = require("../../filter/filterManager");
var componentResolver_1 = require("./componentResolver");
var utils_1 = require("../../utils");
var overlayWrapperComponent_1 = require("../../rendering/overlays/overlayWrapperComponent");
var gridApi_1 = require("../../gridApi");
var columnApi_1 = require("../../columnController/columnApi");
var ComponentType;
(function (ComponentType) {
    ComponentType[ComponentType["AG_GRID"] = 0] = "AG_GRID";
    ComponentType[ComponentType["FRAMEWORK"] = 1] = "FRAMEWORK";
})(ComponentType || (ComponentType = {}));
var ComponentRecipes = (function () {
    function ComponentRecipes() {
    }
    ComponentRecipes_1 = ComponentRecipes;
    ComponentRecipes.prototype.newDateComponent = function (params) {
        return this.componentResolver.createAgGridComponent(this.gridOptions, params, "dateComponent", {
            api: this.gridApi,
            columnApi: this.columnApi
        }, "agDateInput");
    };
    ComponentRecipes.prototype.newHeaderComponent = function (params) {
        return this.componentResolver.createAgGridComponent(params.column.getColDef(), params, "headerComponent", {
            api: this.gridApi,
            columnApi: this.columnApi,
            column: params.column,
            colDef: params.column.getColDef()
        }, "agColumnHeader");
    };
    ComponentRecipes.prototype.newHeaderGroupComponent = function (params) {
        return this.componentResolver.createAgGridComponent(params.columnGroup.getColGroupDef(), params, "headerGroupComponent", {
            api: this.gridApi,
            columnApi: this.columnApi
        }, "agColumnGroupHeader");
    };
    ComponentRecipes.prototype.newFloatingFilterWrapperComponent = function (column, params) {
        var _this = this;
        var colDef = column.getColDef();
        if (colDef.suppressFilter) {
            return this.newEmptyFloatingFilterWrapperComponent(column);
        }
        var defaultFloatingFilterType;
        if (!colDef.filter) {
            defaultFloatingFilterType = this.gridOptionsWrapper.isEnterprise() ? 'agSetColumnFloatingFilter' : 'agTextColumnFloatingFilter';
        }
        else if (typeof colDef.filter === 'string' && Object.keys(ComponentRecipes_1.filterToFloatingFilterNames).indexOf(colDef.filter) > -1) {
            defaultFloatingFilterType = ComponentRecipes_1.filterToFloatingFilterNames[colDef.filter];
        }
        var dynamicComponentParams = {
            column: column,
            colDef: colDef,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        var floatingFilter = this.componentResolver.createAgGridComponent(colDef, params, "floatingFilterComponent", dynamicComponentParams, defaultFloatingFilterType, false);
        var floatingFilterWrapperComponentParams = {
            column: column,
            floatingFilterComp: floatingFilter,
            suppressFilterButton: this.componentResolver.mergeParams(colDef, 'floatingFilterComponent', dynamicComponentParams, params).suppressFilterButton
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
            floatingFilterWrapperComponentParams.floatingFilterComp = utils_1.Promise.resolve(this.componentResolver.createInternalAgGridComponent(floatingFilter_1.ReadModelAsStringFloatingFilterComp, params));
        }
        return this.componentResolver.createInternalAgGridComponent(floatingFilterWrapper_1.FloatingFilterWrapperComp, floatingFilterWrapperComponentParams);
    };
    ComponentRecipes.prototype.newFullWidthGroupRowInnerCellRenderer = function (params) {
        return this.componentResolver.createAgGridComponent(this.gridOptions, params, "groupRowInnerRenderer", params, null, false);
    };
    ComponentRecipes.prototype.newCellRenderer = function (target, params) {
        return this.componentResolver.createAgGridComponent(target, params, "cellRenderer", params, null, false);
    };
    ComponentRecipes.prototype.newInnerCellRenderer = function (target, params) {
        return this.componentResolver.createAgGridComponent(target, params, "innerRenderer", params, null);
    };
    ComponentRecipes.prototype.newFullRowGroupRenderer = function (params) {
        return this.componentResolver.createAgGridComponent(this.gridOptionsWrapper, params, "fullWidthCellRenderer", params, null);
    };
    ComponentRecipes.prototype.newOverlayWrapperComponent = function () {
        return this.componentResolver.createInternalAgGridComponent(overlayWrapperComponent_1.OverlayWrapperComponent, null);
    };
    ComponentRecipes.prototype.newLoadingOverlayComponent = function () {
        return this.componentResolver.createAgGridComponent(this.gridOptions, null, "loadingOverlayComponent", {
            api: this.gridApi,
            columnApi: this.columnApi
        }, "agLoadingOverlay");
    };
    ComponentRecipes.prototype.newNoRowsOverlayComponent = function () {
        return this.componentResolver.createAgGridComponent(this.gridOptions, null, "noRowsOverlayComponent", {
            api: this.gridApi,
            columnApi: this.columnApi
        }, "agNoRowsOverlay");
    };
    ComponentRecipes.prototype.getFilterComponentPrototype = function (colDef) {
        return this.componentResolver.getComponentToUse(colDef, "filter", {
            api: this.gridApi,
            columnApi: this.columnApi,
            colDef: colDef
        });
    };
    ComponentRecipes.prototype.newEmptyFloatingFilterWrapperComponent = function (column) {
        var floatingFilterWrapperComponentParams = {
            column: column,
            floatingFilterComp: null
        };
        return this.componentResolver.createInternalAgGridComponent(floatingFilterWrapper_1.EmptyFloatingFilterWrapperComp, floatingFilterWrapperComponentParams);
    };
    ComponentRecipes.filterToFloatingFilterNames = {
        set: 'agSetColumnFloatingFilter',
        agSetColumnFilter: 'agSetColumnFloatingFilter',
        number: 'agNumberColumnFloatingFilter',
        agNumberColumnFilter: 'agNumberColumnFloatingFilter',
        date: 'agDateColumnFloatingFilter',
        agDateColumnFilter: 'agDateColumnFloatingFilter',
        text: 'agTextColumnFloatingFilter',
        agTextColumnFilter: 'agTextColumnFloatingFilter'
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
        context_1.Autowired("gridApi"),
        __metadata("design:type", gridApi_1.GridApi)
    ], ComponentRecipes.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired("columnApi"),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], ComponentRecipes.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired("gridOptionsWrapper"),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ComponentRecipes.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], ComponentRecipes.prototype, "filterManager", void 0);
    ComponentRecipes = ComponentRecipes_1 = __decorate([
        context_1.Bean('componentRecipes')
    ], ComponentRecipes);
    return ComponentRecipes;
    var ComponentRecipes_1;
}());
exports.ComponentRecipes = ComponentRecipes;
