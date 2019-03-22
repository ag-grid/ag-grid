/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v20.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var context_1 = require("../context/context");
var column_1 = require("../entities/column");
var setLeftFeature_1 = require("../rendering/features/setLeftFeature");
var floatingFilter_1 = require("./floatingFilter");
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var beans_1 = require("../rendering/beans");
var hoverFeature_1 = require("../headerRendering/hoverFeature");
var events_1 = require("../events");
var eventService_1 = require("../eventService");
var columnHoverService_1 = require("../rendering/columnHoverService");
var utils_1 = require("../utils");
var userComponentFactory_1 = require("../components/framework/userComponentFactory");
var gridApi_1 = require("../gridApi");
var columnApi_1 = require("../columnController/columnApi");
var filterManager_1 = require("./filterManager");
var FloatingFilterWrapper = /** @class */ (function (_super) {
    __extends(FloatingFilterWrapper, _super);
    function FloatingFilterWrapper(column) {
        var _this = _super.call(this, FloatingFilterWrapper.TEMPLATE) || this;
        _this.column = column;
        return _this;
    }
    FloatingFilterWrapper.prototype.postConstruct = function () {
        this.setupFloatingFilter();
        this.setupWidth();
        this.setupLeftPositioning();
        this.setupColumnHover();
        this.addFeature(this.getContext(), new hoverFeature_1.HoverFeature([this.column], this.getGui()));
        this.addDestroyableEventListener(this.eButtonShowMainFilter, 'click', this.showParentFilter.bind(this));
    };
    FloatingFilterWrapper.prototype.setupFloatingFilter = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        if (colDef.filter) {
            this.floatingFilterCompPromise = this.getFloatingFilterInstance();
            if (this.floatingFilterCompPromise) {
                this.floatingFilterCompPromise.then(function (compInstance) {
                    if (compInstance) {
                        _this.setupWithFloatingFilter(compInstance);
                    }
                    else {
                        _this.setupEmpty();
                    }
                });
            }
            else {
                this.setupEmpty();
            }
            this.setupSyncWithFilter();
        }
        else {
            this.setupEmpty();
        }
    };
    FloatingFilterWrapper.prototype.setupLeftPositioning = function () {
        var setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.column, this.getGui(), this.beans);
        setLeftFeature.init();
        this.addDestroyFunc(setLeftFeature.destroy.bind(setLeftFeature));
    };
    FloatingFilterWrapper.prototype.setupSyncWithFilter = function () {
        var _this = this;
        var syncWithFilter = function () {
            var filterComponentPromise = _this.filterManager.getFilterComponent(_this.column, 'NO_UI');
            _this.onParentModelChanged(filterComponentPromise.resolveNow(null, function (filter) { return filter.getModel(); }));
        };
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_FILTER_CHANGED, syncWithFilter);
        var cachedFilter = this.filterManager.cachedFilter(this.column);
        if (cachedFilter) {
            syncWithFilter();
        }
    };
    // linked to event listener in template
    FloatingFilterWrapper.prototype.showParentFilter = function () {
        this.menuFactory.showMenuAfterButtonClick(this.column, this.eButtonShowMainFilter, 'filterMenuTab', ['filterMenuTab']);
    };
    FloatingFilterWrapper.prototype.setupColumnHover = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    };
    FloatingFilterWrapper.prototype.onColumnHover = function () {
        var isHovered = this.columnHoverService.isHovered(this.column);
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    };
    FloatingFilterWrapper.prototype.setupWidth = function () {
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    };
    FloatingFilterWrapper.prototype.onColumnWidthChanged = function () {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    };
    FloatingFilterWrapper.prototype.setupWithFloatingFilter = function (floatingFilterComp) {
        var disposeFunc = function () {
            if (floatingFilterComp.destroy) {
                floatingFilterComp.destroy();
            }
        };
        if (!this.isAlive()) {
            disposeFunc();
            return;
        }
        this.addDestroyFunc(disposeFunc);
        var floatingFilterCompUi = floatingFilterComp.getGui();
        utils_1._.addOrRemoveCssClass(this.eFloatingFilterBody, 'ag-floating-filter-body', !this.suppressFilterButton);
        utils_1._.addOrRemoveCssClass(this.eFloatingFilterBody, 'ag-floating-filter-full-body', this.suppressFilterButton);
        utils_1._.setVisible(this.eButtonWrapper, !this.suppressFilterButton);
        var eIcon = utils_1._.createIconNoSpan('filter', this.gridOptionsWrapper, this.column);
        this.eButtonShowMainFilter.appendChild(eIcon);
        this.eFloatingFilterBody.appendChild(floatingFilterCompUi);
        if (floatingFilterComp.afterGuiAttached) {
            floatingFilterComp.afterGuiAttached();
        }
        this.wireQuerySelectors();
    };
    FloatingFilterWrapper.prototype.getFloatingFilterInstance = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        var defaultFloatingFilterType;
        if (typeof colDef.filter === 'string') {
            // will be undefined if not in the map
            defaultFloatingFilterType = FloatingFilterWrapper.filterToFloatingFilterNames[colDef.filter];
        }
        else if (colDef.filter === true) {
            defaultFloatingFilterType = this.gridOptionsWrapper.isEnterprise() ? 'agSetColumnFloatingFilter' : 'agTextColumnFloatingFilter';
        }
        var params = {
            api: this.gridApi,
            column: this.column,
            currentParentModel: this.currentParentModel.bind(this),
            onFloatingFilterChanged: this.onFloatingFilterChanged.bind(this),
            suppressFilterButton: false // This one might be overridden from the colDef
        };
        // this is unusual - we need a params value OUTSIDE the component the params are for.
        // the params are for the floating filter component, but this property is actually for the wrapper.
        this.suppressFilterButton = colDef.floatingFilterComponentParams ? !!colDef.floatingFilterComponentParams.suppressFilterButton : false;
        var promise = this.userComponentFactory.newFloatingFilterComponent(colDef, params, defaultFloatingFilterType);
        if (!promise) {
            var filterComponent = this.getFilterComponentPrototype(colDef);
            var getModelAsStringExists = filterComponent && filterComponent.prototype && filterComponent.prototype.getModelAsString;
            if (getModelAsStringExists) {
                var rawModelFn_1 = params.currentParentModel;
                params.currentParentModel = function () {
                    var parentPromise = _this.filterManager.getFilterComponent(_this.column, 'NO_UI');
                    return parentPromise.resolveNow(null, function (parent) { return parent.getModelAsString ? parent.getModelAsString(rawModelFn_1()) : null; });
                };
                var compInstance = this.userComponentFactory.createUserComponentFromConcreteClass(floatingFilter_1.ReadModelAsStringFloatingFilterComp, params);
                promise = utils_1.Promise.resolve(compInstance);
            }
        }
        return promise;
    };
    FloatingFilterWrapper.prototype.createDynamicParams = function () {
        return {
            column: this.column,
            colDef: this.column.getColDef(),
            api: this.gridApi,
            columnApi: this.columnApi
        };
    };
    FloatingFilterWrapper.prototype.getFilterComponentPrototype = function (colDef) {
        var resolvedComponent = this.userComponentFactory.lookupComponentClassDef(colDef, "filter", this.createDynamicParams());
        return resolvedComponent ? resolvedComponent.component : null;
    };
    FloatingFilterWrapper.prototype.setupEmpty = function () {
        utils_1._.setVisible(this.eButtonWrapper, false);
    };
    FloatingFilterWrapper.prototype.currentParentModel = function () {
        var filterComponentPromise = this.filterManager.getFilterComponent(this.column, 'NO_UI');
        var wholeParentFilter = filterComponentPromise.resolveNow(null, function (filter) {
            return (filter.getNullableModel) ?
                filter.getNullableModel() :
                filter.getModel();
        });
        return (wholeParentFilter && wholeParentFilter.operator != null) ?
            wholeParentFilter.condition1
            : wholeParentFilter;
    };
    FloatingFilterWrapper.prototype.onFloatingFilterChanged = function (change) {
        var _this = this;
        var captureModelChangedResolveFunc;
        var modelChanged = new utils_1.Promise(function (resolve) {
            captureModelChangedResolveFunc = resolve;
        });
        var filterComponentPromise = this.filterManager.getFilterComponent(this.column, 'NO_UI');
        filterComponentPromise.then(function (filterComponent) {
            if (filterComponent.onFloatingFilterChanged) {
                //If going through this branch of code the user MUST
                //be passing an object of type change that contains
                //a model property inside and some other stuff
                var result = filterComponent.onFloatingFilterChanged(change);
                captureModelChangedResolveFunc(result);
            }
            else {
                //If going through this branch of code the user MUST
                //be passing the plain model and delegating to ag-Grid
                //the responsibility to set the parent model and refresh
                //the filters
                filterComponent.setModel(change);
                _this.filterManager.onFilterChanged();
                captureModelChangedResolveFunc(true);
            }
        });
        return modelChanged.resolveNow(true, function (changed) { return changed; });
    };
    FloatingFilterWrapper.prototype.onParentModelChanged = function (parentModel) {
        if (!this.floatingFilterCompPromise) {
            return;
        }
        var combinedFilter;
        var mainModel = null;
        if (parentModel && parentModel.operator) {
            combinedFilter = parentModel;
            mainModel = combinedFilter.condition1;
        }
        else {
            mainModel = parentModel;
        }
        this.floatingFilterCompPromise.then(function (floatingFilterComp) {
            floatingFilterComp.onParentModelChanged(mainModel, combinedFilter);
        });
    };
    FloatingFilterWrapper.filterToFloatingFilterNames = {
        set: 'agSetColumnFloatingFilter',
        agSetColumnFilter: 'agSetColumnFloatingFilter',
        number: 'agNumberColumnFloatingFilter',
        agNumberColumnFilter: 'agNumberColumnFloatingFilter',
        date: 'agDateColumnFloatingFilter',
        agDateColumnFilter: 'agDateColumnFloatingFilter',
        text: 'agTextColumnFloatingFilter',
        agTextColumnFilter: 'agTextColumnFloatingFilter'
    };
    FloatingFilterWrapper.TEMPLATE = "<div class=\"ag-header-cell\" aria-hidden=\"true\">\n            <div ref=\"eFloatingFilterBody\" aria-hidden=\"true\"></div>\n            <div class=\"ag-floating-filter-button\" ref=\"eButtonWrapper\" aria-hidden=\"true\">\n                    <button type=\"button\" ref=\"eButtonShowMainFilter\"></button>\n            </div>\n        </div>";
    __decorate([
        context_1.Autowired('columnHoverService'),
        __metadata("design:type", columnHoverService_1.ColumnHoverService)
    ], FloatingFilterWrapper.prototype, "columnHoverService", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], FloatingFilterWrapper.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('beans'),
        __metadata("design:type", beans_1.Beans)
    ], FloatingFilterWrapper.prototype, "beans", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], FloatingFilterWrapper.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired("userComponentFactory"),
        __metadata("design:type", userComponentFactory_1.UserComponentFactory)
    ], FloatingFilterWrapper.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.Autowired("gridApi"),
        __metadata("design:type", gridApi_1.GridApi)
    ], FloatingFilterWrapper.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired("columnApi"),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], FloatingFilterWrapper.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired("filterManager"),
        __metadata("design:type", filterManager_1.FilterManager)
    ], FloatingFilterWrapper.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('menuFactory'),
        __metadata("design:type", Object)
    ], FloatingFilterWrapper.prototype, "menuFactory", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eFloatingFilterBody'),
        __metadata("design:type", HTMLElement)
    ], FloatingFilterWrapper.prototype, "eFloatingFilterBody", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eButtonWrapper'),
        __metadata("design:type", HTMLElement)
    ], FloatingFilterWrapper.prototype, "eButtonWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eButtonShowMainFilter'),
        __metadata("design:type", HTMLElement)
    ], FloatingFilterWrapper.prototype, "eButtonShowMainFilter", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], FloatingFilterWrapper.prototype, "postConstruct", null);
    return FloatingFilterWrapper;
}(component_1.Component));
exports.FloatingFilterWrapper = FloatingFilterWrapper;
