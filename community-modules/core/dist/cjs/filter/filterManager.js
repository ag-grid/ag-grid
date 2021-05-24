/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var context_1 = require("../context/context");
var events_1 = require("../events");
var moduleNames_1 = require("../modules/moduleNames");
var moduleRegistry_1 = require("../modules/moduleRegistry");
var array_1 = require("../utils/array");
var beanStub_1 = require("../context/beanStub");
var set_1 = require("../utils/set");
var generic_1 = require("../utils/generic");
var object_1 = require("../utils/object");
var dom_1 = require("../utils/dom");
var FilterManager = /** @class */ (function (_super) {
    __extends(FilterManager, _super);
    function FilterManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allAdvancedFilters = new Map();
        _this.activeAdvancedFilters = [];
        _this.quickFilter = null;
        _this.quickFilterParts = null;
        // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
        // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
        // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
        // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
        // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
        _this.processingFilterChange = false;
        return _this;
    }
    FilterManager_1 = FilterManager;
    FilterManager.prototype.init = function () {
        this.addManagedListener(this.eventService, events_1.Events.EVENT_ROW_DATA_CHANGED, this.onNewRowsLoaded.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());
        this.setQuickFilterParts();
        this.allowShowChangeAfterFilter = this.gridOptionsWrapper.isAllowShowChangeAfterFilter();
    };
    FilterManager.prototype.setQuickFilterParts = function () {
        this.quickFilterParts = this.quickFilter ? this.quickFilter.split(' ') : null;
    };
    FilterManager.prototype.setFilterModel = function (model) {
        var _this = this;
        var allPromises = [];
        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            var modelKeys_1 = set_1.convertToSet(Object.keys(model));
            this.allAdvancedFilters.forEach(function (filterWrapper, colId) {
                var newModel = model[colId];
                allPromises.push(_this.setModelOnFilterWrapper(filterWrapper.filterPromise, newModel));
                modelKeys_1.delete(colId);
            });
            // at this point, processedFields contains data for which we don't have a filter working yet
            modelKeys_1.forEach(function (colId) {
                var column = _this.columnController.getPrimaryColumn(colId);
                if (!column) {
                    console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
                    return;
                }
                var filterWrapper = _this.getOrCreateFilterWrapper(column, 'NO_UI');
                allPromises.push(_this.setModelOnFilterWrapper(filterWrapper.filterPromise, model[colId]));
            });
        }
        else {
            this.allAdvancedFilters.forEach(function (filterWrapper) {
                allPromises.push(_this.setModelOnFilterWrapper(filterWrapper.filterPromise, null));
            });
        }
        utils_1.AgPromise.all(allPromises).then(function () { return _this.onFilterChanged(); });
    };
    FilterManager.prototype.setModelOnFilterWrapper = function (filterPromise, newModel) {
        return new utils_1.AgPromise(function (resolve) {
            filterPromise.then(function (filter) {
                if (typeof filter.setModel !== 'function') {
                    console.warn('Warning ag-grid - filter missing setModel method, which is needed for setFilterModel');
                    resolve();
                }
                (filter.setModel(newModel) || utils_1.AgPromise.resolve()).then(function () { return resolve(); });
            });
        });
    };
    FilterManager.prototype.getFilterModel = function () {
        var result = {};
        this.allAdvancedFilters.forEach(function (filterWrapper, key) {
            // because user can provide filters, we provide useful error checking and messages
            var filterPromise = filterWrapper.filterPromise;
            var filter = filterPromise.resolveNow(null, function (promiseFilter) { return promiseFilter; });
            if (filter == null) {
                return null;
            }
            if (typeof filter.getModel !== 'function') {
                console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
                return;
            }
            var model = filter.getModel();
            if (generic_1.exists(model)) {
                result[key] = model;
            }
        });
        return result;
    };
    // returns true if any advanced filter (ie not quick filter) active
    FilterManager.prototype.isAdvancedFilterPresent = function () {
        return this.activeAdvancedFilters.length > 0;
    };
    // called by:
    // 1) onFilterChanged()
    // 2) onNewRowsLoaded()
    FilterManager.prototype.updateActiveFilters = function () {
        var _this = this;
        this.activeAdvancedFilters.length = 0;
        this.allAdvancedFilters.forEach(function (filterWrapper) {
            if (filterWrapper.filterPromise.resolveNow(false, function (filter) { return filter.isFilterActive(); })) {
                var resolvedPromise = filterWrapper.filterPromise.resolveNow(null, function (filter) { return filter; });
                _this.activeAdvancedFilters.push(resolvedPromise);
            }
        });
    };
    FilterManager.prototype.updateFilterFlagInColumns = function (source, additionalEventAttributes) {
        this.allAdvancedFilters.forEach(function (filterWrapper) {
            var isFilterActive = filterWrapper.filterPromise.resolveNow(false, function (filter) { return filter.isFilterActive(); });
            filterWrapper.column.setFilterActive(isFilterActive, source, additionalEventAttributes);
        });
    };
    FilterManager.prototype.isAnyFilterPresent = function () {
        return this.isQuickFilterPresent() || this.isAdvancedFilterPresent() || this.gridOptionsWrapper.isExternalFilterPresent();
    };
    FilterManager.prototype.doAdvancedFiltersPass = function (node, filterToSkip) {
        var data = node.data;
        for (var i = 0; i < this.activeAdvancedFilters.length; i++) {
            var filter = this.activeAdvancedFilters[i];
            if (filter == null || filter === filterToSkip) {
                continue;
            }
            if (typeof filter.doesFilterPass !== 'function') {
                // because users can do custom filters, give nice error message
                throw new Error('Filter is missing method doesFilterPass');
            }
            if (!filter.doesFilterPass({ node: node, data: data })) {
                return false;
            }
        }
        return true;
    };
    FilterManager.prototype.parseQuickFilter = function (newFilter) {
        if (!generic_1.exists(newFilter)) {
            return null;
        }
        if (!this.gridOptionsWrapper.isRowModelDefault()) {
            console.warn('ag-grid: quick filtering only works with the Client-Side Row Model');
            return null;
        }
        return newFilter.toUpperCase();
    };
    FilterManager.prototype.setQuickFilter = function (newFilter) {
        var parsedFilter = this.parseQuickFilter(newFilter);
        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.setQuickFilterParts();
            this.onFilterChanged();
        }
    };
    FilterManager.prototype.onFilterChanged = function (filterInstance, additionalEventAttributes) {
        this.updateActiveFilters();
        this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes);
        this.allAdvancedFilters.forEach(function (filterWrapper) {
            filterWrapper.filterPromise.then(function (filter) {
                if (filter !== filterInstance && filter.onAnyFilterChanged) {
                    filter.onAnyFilterChanged();
                }
            });
        });
        var filterChangedEvent = {
            type: events_1.Events.EVENT_FILTER_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        if (additionalEventAttributes) {
            object_1.mergeDeep(filterChangedEvent, additionalEventAttributes);
        }
        // because internal events are not async in ag-grid, when the dispatchEvent
        // method comes back, we know all listeners have finished executing.
        this.processingFilterChange = true;
        this.eventService.dispatchEvent(filterChangedEvent);
        this.processingFilterChange = false;
    };
    FilterManager.prototype.isSuppressFlashingCellsBecauseFiltering = function () {
        // if user has elected to always flash cell changes, then always return false, otherwise we suppress flashing
        // changes when filtering
        return !this.allowShowChangeAfterFilter && this.processingFilterChange;
    };
    FilterManager.prototype.isQuickFilterPresent = function () {
        return this.quickFilter !== null;
    };
    FilterManager.prototype.doesRowPassOtherFilters = function (filterToSkip, node) {
        return this.doesRowPassFilter({ rowNode: node, filterInstanceToSkip: filterToSkip });
    };
    FilterManager.prototype.doesRowPassQuickFilterNoCache = function (node, filterPart) {
        var _this = this;
        var columns = this.columnController.getAllColumnsForQuickFilter();
        return array_1.some(columns, function (column) {
            var part = _this.getQuickFilterTextForColumn(column, node);
            return generic_1.exists(part) && part.indexOf(filterPart) >= 0;
        });
    };
    FilterManager.prototype.doesRowPassQuickFilterCache = function (node, filterPart) {
        if (!node.quickFilterAggregateText) {
            this.aggregateRowForQuickFilter(node);
        }
        return node.quickFilterAggregateText.indexOf(filterPart) >= 0;
    };
    FilterManager.prototype.doesRowPassQuickFilter = function (node) {
        var _this = this;
        var usingCache = this.gridOptionsWrapper.isCacheQuickFilter();
        // each part must pass, if any fails, then the whole filter fails
        return array_1.every(this.quickFilterParts, function (part) {
            return usingCache ? _this.doesRowPassQuickFilterCache(node, part) : _this.doesRowPassQuickFilterNoCache(node, part);
        });
    };
    FilterManager.prototype.doesRowPassFilter = function (params) {
        // the row must pass ALL of the filters, so if any of them fail,
        // we return true. that means if a row passes the quick filter,
        // but fails the column filter, it fails overall
        // first up, check quick filter
        if (this.isQuickFilterPresent() && !this.doesRowPassQuickFilter(params.rowNode)) {
            return false;
        }
        // secondly, give the client a chance to reject this row
        if (this.gridOptionsWrapper.isExternalFilterPresent() && !this.gridOptionsWrapper.doesExternalFilterPass(params.rowNode)) {
            return false;
        }
        // lastly, check our internal advanced filter
        if (this.isAdvancedFilterPresent() && !this.doAdvancedFiltersPass(params.rowNode, params.filterInstanceToSkip)) {
            return false;
        }
        // got this far, all filters pass
        return true;
    };
    FilterManager.prototype.getQuickFilterTextForColumn = function (column, node) {
        var value = this.valueService.getValue(column, node, true);
        var colDef = column.getColDef();
        if (colDef.getQuickFilterText) {
            var params = {
                value: value,
                node: node,
                data: node.data,
                column: column,
                colDef: colDef,
                context: this.gridOptionsWrapper.getContext()
            };
            value = colDef.getQuickFilterText(params);
        }
        return generic_1.exists(value) ? value.toString().toUpperCase() : null;
    };
    FilterManager.prototype.aggregateRowForQuickFilter = function (node) {
        var _this = this;
        var stringParts = [];
        var columns = this.columnController.getAllColumnsForQuickFilter();
        array_1.forEach(columns, function (column) {
            var part = _this.getQuickFilterTextForColumn(column, node);
            if (generic_1.exists(part)) {
                stringParts.push(part);
            }
        });
        node.quickFilterAggregateText = stringParts.join(FilterManager_1.QUICK_FILTER_SEPARATOR);
    };
    FilterManager.prototype.onNewRowsLoaded = function (source) {
        this.allAdvancedFilters.forEach(function (filterWrapper) {
            filterWrapper.filterPromise.then(function (filter) {
                if (filter.onNewRowsLoaded) {
                    filter.onNewRowsLoaded();
                }
            });
        });
        this.updateFilterFlagInColumns(source);
        this.updateActiveFilters();
    };
    FilterManager.prototype.createValueGetter = function (column) {
        var _this = this;
        return function (node) { return _this.valueService.getValue(column, node, true); };
    };
    FilterManager.prototype.getFilterComponent = function (column, source, createIfDoesNotExist) {
        if (createIfDoesNotExist === void 0) { createIfDoesNotExist = true; }
        if (createIfDoesNotExist) {
            return this.getOrCreateFilterWrapper(column, source).filterPromise;
        }
        var filterWrapper = this.cachedFilter(column);
        return filterWrapper ? filterWrapper.filterPromise : null;
    };
    FilterManager.prototype.isFilterActive = function (column) {
        var filterWrapper = this.cachedFilter(column);
        return !!filterWrapper && filterWrapper.filterPromise.resolveNow(false, function (filter) { return filter.isFilterActive(); });
    };
    FilterManager.prototype.getOrCreateFilterWrapper = function (column, source) {
        var filterWrapper = this.cachedFilter(column);
        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column, source);
            this.allAdvancedFilters.set(column.getColId(), filterWrapper);
        }
        else if (source !== 'NO_UI') {
            this.putIntoGui(filterWrapper, source);
        }
        return filterWrapper;
    };
    FilterManager.prototype.cachedFilter = function (column) {
        return this.allAdvancedFilters.get(column.getColId());
    };
    FilterManager.prototype.createFilterInstance = function (column, $scope) {
        var _this = this;
        var defaultFilter = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.SetFilterModule) ? 'agSetColumnFilter' : 'agTextColumnFilter';
        var colDef = column.getColDef();
        var filterInstance;
        var params = __assign(__assign({}, this.createFilterParams(column, colDef, $scope)), { filterModifiedCallback: function () {
                var event = {
                    type: events_1.Events.EVENT_FILTER_MODIFIED,
                    api: _this.gridApi,
                    columnApi: _this.columnApi,
                    column: column,
                    filterInstance: filterInstance
                };
                _this.eventService.dispatchEvent(event);
            }, filterChangedCallback: function (additionalEventAttributes) {
                return _this.onFilterChanged(filterInstance, additionalEventAttributes);
            }, doesRowPassOtherFilter: function (node) { return _this.doesRowPassOtherFilters(filterInstance, node); } });
        var res = this.userComponentFactory.newFilterComponent(colDef, params, defaultFilter);
        if (res) {
            res.then(function (r) { return filterInstance = r; });
        }
        return res;
    };
    FilterManager.prototype.createFilterParams = function (column, colDef, $scope) {
        if ($scope === void 0) { $scope = null; }
        var params = {
            api: this.gridOptionsWrapper.getApi(),
            column: column,
            colDef: object_1.cloneObject(colDef),
            rowModel: this.rowModel,
            filterChangedCallback: function () { },
            filterModifiedCallback: function () { },
            valueGetter: this.createValueGetter(column),
            context: this.gridOptionsWrapper.getContext(),
            doesRowPassOtherFilter: function () { return true; },
        };
        // hack in scope if using AngularJS
        if ($scope) {
            params.$scope = $scope;
        }
        return params;
    };
    FilterManager.prototype.createFilterWrapper = function (column, source) {
        var filterWrapper = {
            column: column,
            filterPromise: null,
            scope: null,
            compiledElement: null,
            guiPromise: utils_1.AgPromise.resolve(null)
        };
        filterWrapper.scope = this.gridOptionsWrapper.isAngularCompileFilters() ? this.$scope.$new() : null;
        filterWrapper.filterPromise = this.createFilterInstance(column, filterWrapper.scope);
        if (filterWrapper.filterPromise) {
            this.putIntoGui(filterWrapper, source);
        }
        return filterWrapper;
    };
    FilterManager.prototype.putIntoGui = function (filterWrapper, source) {
        var _this = this;
        var eFilterGui = document.createElement('div');
        eFilterGui.className = 'ag-filter';
        filterWrapper.guiPromise = new utils_1.AgPromise(function (resolve) {
            filterWrapper.filterPromise.then(function (filter) {
                var guiFromFilter = filter.getGui();
                if (!generic_1.exists(guiFromFilter)) {
                    console.warn("getGui method from filter returned " + guiFromFilter + ", it should be a DOM element or an HTML template string.");
                }
                // for backwards compatibility with Angular 1 - we
                // used to allow providing back HTML from getGui().
                // once we move away from supporting Angular 1
                // directly, we can change this.
                if (typeof guiFromFilter === 'string') {
                    guiFromFilter = dom_1.loadTemplate(guiFromFilter);
                }
                eFilterGui.appendChild(guiFromFilter);
                if (filterWrapper.scope) {
                    var compiledElement = _this.$compile(eFilterGui)(filterWrapper.scope);
                    filterWrapper.compiledElement = compiledElement;
                    window.setTimeout(function () { return filterWrapper.scope.$apply(); }, 0);
                }
                resolve(eFilterGui);
                _this.eventService.dispatchEvent({
                    type: events_1.Events.EVENT_FILTER_OPENED,
                    column: filterWrapper.column,
                    source: source,
                    eGui: eFilterGui,
                    api: _this.gridApi,
                    columnApi: _this.columnApi
                });
            });
        });
    };
    FilterManager.prototype.onNewColumnsLoaded = function () {
        var _this = this;
        var atLeastOneFilterGone = false;
        this.allAdvancedFilters.forEach(function (filterWrapper) {
            var oldColumn = !_this.columnController.getPrimaryColumn(filterWrapper.column);
            if (oldColumn) {
                atLeastOneFilterGone = true;
                _this.disposeFilterWrapper(filterWrapper, 'filterDestroyed');
            }
        });
        if (atLeastOneFilterGone) {
            this.onFilterChanged();
        }
    };
    // destroys the filter, so it not longer takes part
    FilterManager.prototype.destroyFilter = function (column, source) {
        if (source === void 0) { source = 'api'; }
        var filterWrapper = this.allAdvancedFilters.get(column.getColId());
        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.onFilterChanged();
        }
    };
    FilterManager.prototype.disposeFilterWrapper = function (filterWrapper, source) {
        var _this = this;
        filterWrapper.filterPromise.then(function (filter) {
            (filter.setModel(null) || utils_1.AgPromise.resolve()).then(function () {
                _this.getContext().destroyBean(filter);
                filterWrapper.column.setFilterActive(false, source);
                if (filterWrapper.scope) {
                    if (filterWrapper.compiledElement) {
                        filterWrapper.compiledElement.remove();
                    }
                    filterWrapper.scope.$destroy();
                }
                _this.allAdvancedFilters.delete(filterWrapper.column.getColId());
            });
        });
    };
    FilterManager.prototype.destroy = function () {
        var _this = this;
        _super.prototype.destroy.call(this);
        this.allAdvancedFilters.forEach(function (filterWrapper) { return _this.disposeFilterWrapper(filterWrapper, 'filterDestroyed'); });
    };
    var FilterManager_1;
    FilterManager.QUICK_FILTER_SEPARATOR = '\n';
    __decorate([
        context_1.Autowired('$compile')
    ], FilterManager.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('$scope')
    ], FilterManager.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('valueService')
    ], FilterManager.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], FilterManager.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('rowModel')
    ], FilterManager.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], FilterManager.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], FilterManager.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], FilterManager.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.PostConstruct
    ], FilterManager.prototype, "init", null);
    __decorate([
        context_1.PreDestroy
    ], FilterManager.prototype, "destroy", null);
    FilterManager = FilterManager_1 = __decorate([
        context_1.Bean('filterManager')
    ], FilterManager);
    return FilterManager;
}(beanStub_1.BeanStub));
exports.FilterManager = FilterManager;

//# sourceMappingURL=filterManager.js.map
