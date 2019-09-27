/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var context_1 = require("../../context/context");
var column_1 = require("../../entities/column");
var setLeftFeature_1 = require("../../rendering/features/setLeftFeature");
var component_1 = require("../../widgets/component");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var beans_1 = require("../../rendering/beans");
var hoverFeature_1 = require("../../headerRendering/hoverFeature");
var events_1 = require("../../events");
var eventService_1 = require("../../eventService");
var columnHoverService_1 = require("../../rendering/columnHoverService");
var utils_1 = require("../../utils");
var userComponentFactory_1 = require("../../components/framework/userComponentFactory");
var gridApi_1 = require("../../gridApi");
var columnApi_1 = require("../../columnController/columnApi");
var filterManager_1 = require("./../filterManager");
var readOnlyFloatingFilter_1 = require("./provided/readOnlyFloatingFilter");
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
                        _this.setupSyncWithFilter();
                    }
                    else {
                        _this.setupEmpty();
                    }
                });
            }
            else {
                this.setupEmpty();
            }
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
        var syncWithFilter = function (filterChangedEvent) {
            var filterComponentPromise = _this.filterManager.getFilterComponent(_this.column, 'NO_UI');
            var parentModel = filterComponentPromise.resolveNow(null, function (filter) { return filter.getModel(); });
            _this.onParentModelChanged(parentModel, filterChangedEvent);
        };
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_FILTER_CHANGED, syncWithFilter);
        if (this.filterManager.isFilterActive(this.column)) {
            syncWithFilter(null);
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
        utils_1._.setDisplayed(this.eButtonWrapper, !this.suppressFilterButton);
        var eIcon = utils_1._.createIconNoSpan('filter', this.gridOptionsWrapper, this.column);
        this.eButtonShowMainFilter.appendChild(eIcon);
        this.eFloatingFilterBody.appendChild(floatingFilterCompUi);
        if (floatingFilterComp.afterGuiAttached) {
            floatingFilterComp.afterGuiAttached();
        }
    };
    FloatingFilterWrapper.prototype.parentFilterInstance = function (callback) {
        var promise = this.filterManager.getFilterComponent(this.column, 'NO_UI');
        promise.then(callback);
    };
    FloatingFilterWrapper.prototype.getFloatingFilterInstance = function () {
        var colDef = this.column.getColDef();
        var defaultFloatingFilterType;
        if (typeof colDef.filter === 'string') {
            // will be undefined if not in the map
            defaultFloatingFilterType = FloatingFilterWrapper.filterToFloatingFilterNames[colDef.filter];
        }
        else if (colDef.filter === true) {
            defaultFloatingFilterType = this.gridOptionsWrapper.isEnterprise() ? 'agSetColumnFloatingFilter' : 'agTextColumnFloatingFilter';
        }
        var filterParams = this.filterManager.createFilterParams(this.column, this.column.getColDef());
        var finalFilterParams = this.userComponentFactory.createFinalParams(colDef, 'filter', filterParams);
        var params = {
            api: this.gridApi,
            column: this.column,
            filterParams: finalFilterParams,
            currentParentModel: this.currentParentModel.bind(this),
            parentFilterInstance: this.parentFilterInstance.bind(this),
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
                var compInstance = this.userComponentFactory.createUserComponentFromConcreteClass(readOnlyFloatingFilter_1.ReadOnlyFloatingFilter, params);
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
        utils_1._.setDisplayed(this.eButtonWrapper, false);
    };
    FloatingFilterWrapper.prototype.currentParentModel = function () {
        var filterPromise = this.filterManager.getFilterComponent(this.column, 'NO_UI');
        return filterPromise.resolveNow(null, function (filter) { return filter.getModel(); });
    };
    FloatingFilterWrapper.prototype.onParentModelChanged = function (model, filterChangedEvent) {
        if (!this.floatingFilterCompPromise) {
            return;
        }
        this.floatingFilterCompPromise.then(function (floatingFilterComp) {
            floatingFilterComp.onParentModelChanged(model, filterChangedEvent);
        });
    };
    FloatingFilterWrapper.prototype.onFloatingFilterChanged = function () {
        console.warn('ag-Grid: since version 21.x, how floating filters are implemented has changed. ' +
            'Instead of calling params.onFloatingFilterChanged(), get a reference to the main filter via ' +
            'params.parentFilterInstance() and then set a value on the parent filter directly.');
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
    FloatingFilterWrapper.TEMPLATE = "<div class=\"ag-header-cell\" role=\"presentation\">\n            <div ref=\"eFloatingFilterBody\" role=\"columnheader\"></div>\n            <div class=\"ag-floating-filter-button\" ref=\"eButtonWrapper\" role=\"presentation\">\n                <button type=\"button\" ref=\"eButtonShowMainFilter\"></button>\n            </div>\n        </div>";
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
