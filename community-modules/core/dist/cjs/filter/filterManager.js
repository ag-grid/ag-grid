/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.1.1
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
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var context_1 = require("../context/context");
var events_1 = require("../events");
var moduleNames_1 = require("../modules/moduleNames");
var moduleRegistry_1 = require("../modules/moduleRegistry");
var array_1 = require("../utils/array");
var FilterManager = /** @class */ (function () {
    function FilterManager() {
        this.allFilters = new Map();
        this.quickFilter = null;
        this.quickFilterParts = null;
        // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
        // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
        // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
        // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
        // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
        this.processingFilterChange = false;
        this.eventListenerDestroyers = [];
    }
    FilterManager_1 = FilterManager;
    FilterManager.prototype.init = function () {
        this.eventListenerDestroyers = [
            this.eventService.addEventListener(events_1.Events.EVENT_ROW_DATA_CHANGED, this.onNewRowsLoaded.bind(this)),
            this.eventService.addEventListener(events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this))
        ];
        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());
        this.setQuickFilterParts();
        this.allowShowChangeAfterFilter = this.gridOptionsWrapper.isAllowShowChangeAfterFilter();
        // check this here, in case there is a filter from the start
        this.checkExternalFilter();
    };
    FilterManager.prototype.setQuickFilterParts = function () {
        this.quickFilterParts = this.quickFilter ? this.quickFilter.split(' ') : null;
    };
    FilterManager.prototype.setFilterModel = function (model) {
        var _this = this;
        var allPromises = [];
        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            var modelKeys_1 = utils_1._.convertToSet(Object.keys(model));
            this.allFilters.forEach(function (filterWrapper, colId) {
                var newModel = model[colId];
                _this.setModelOnFilterWrapper(filterWrapper.filterPromise, newModel);
                allPromises.push(filterWrapper.filterPromise);
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
                _this.setModelOnFilterWrapper(filterWrapper.filterPromise, model[colId]);
                allPromises.push(filterWrapper.filterPromise);
            });
        }
        else {
            this.allFilters.forEach(function (filterWrapper) {
                _this.setModelOnFilterWrapper(filterWrapper.filterPromise, null);
                allPromises.push(filterWrapper.filterPromise);
            });
        }
        utils_1.Promise.all(allPromises).then(function (_) { return _this.onFilterChanged(); });
    };
    FilterManager.prototype.setModelOnFilterWrapper = function (filterPromise, newModel) {
        filterPromise.then(function (filter) {
            if (typeof filter.setModel !== 'function') {
                console.warn('Warning ag-grid - filter missing setModel method, which is needed for setFilterModel');
                return;
            }
            filter.setModel(newModel);
        });
    };
    FilterManager.prototype.getFilterModel = function () {
        var result = {};
        this.allFilters.forEach(function (filterWrapper, key) {
            // because user can provide filters, we provide useful error checking and messages
            var filterPromise = filterWrapper.filterPromise;
            var filter = filterPromise.resolveNow(null, function (filter) { return filter; });
            if (filter == null) {
                return null;
            }
            if (typeof filter.getModel !== 'function') {
                console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
                return;
            }
            var model = filter.getModel();
            if (utils_1._.exists(model)) {
                result[key] = model;
            }
        });
        return result;
    };
    // returns true if any advanced filter (ie not quick filter) active
    FilterManager.prototype.isAdvancedFilterPresent = function () {
        return this.advancedFilterPresent;
    };
    // called by:
    // 1) onFilterChanged()
    // 2) onNewRowsLoaded()
    FilterManager.prototype.setAdvancedFilterPresent = function () {
        var atLeastOneActive = false;
        this.allFilters.forEach(function (filterWrapper) {
            if (atLeastOneActive) {
                return;
            } // no need to check any more
            if (filterWrapper.filterPromise.resolveNow(false, function (filter) { return filter.isFilterActive(); })) {
                atLeastOneActive = true;
            }
        });
        this.advancedFilterPresent = atLeastOneActive;
    };
    FilterManager.prototype.updateFilterFlagInColumns = function (source, additionalEventAttributes) {
        this.allFilters.forEach(function (filterWrapper) {
            var isFilterActive = filterWrapper.filterPromise.resolveNow(false, function (filter) { return filter.isFilterActive(); });
            filterWrapper.column.setFilterActive(isFilterActive, source, additionalEventAttributes);
        });
    };
    // returns true if quickFilter or advancedFilter
    FilterManager.prototype.isAnyFilterPresent = function () {
        return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
    };
    FilterManager.prototype.doesFilterPass = function (node, filterToSkip) {
        var data = node.data;
        var filterPasses = true;
        this.allFilters.forEach(function (filterWrapper) {
            // if a filter has already failed, no need to run any more
            if (!filterPasses) {
                return;
            }
            // if no filter, always pass
            if (filterWrapper == null) {
                return;
            }
            var filter = filterWrapper.filterPromise.resolveNow(undefined, function (filter) { return filter; });
            if (filter == null || filter === filterToSkip || !filter.isFilterActive()) {
                return;
            }
            if (!filter.doesFilterPass) { // because users can do custom filters, give nice error message
                throw new Error('Filter is missing method doesFilterPass');
            }
            filterPasses = filter.doesFilterPass({ node: node, data: data });
        });
        return filterPasses;
    };
    FilterManager.prototype.parseQuickFilter = function (newFilter) {
        if (!utils_1._.exists(newFilter)) {
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
    FilterManager.prototype.checkExternalFilter = function () {
        this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
    };
    FilterManager.prototype.onFilterChanged = function (additionalEventAttributes) {
        this.setAdvancedFilterPresent();
        this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes);
        this.checkExternalFilter();
        this.allFilters.forEach(function (filterWrapper) {
            filterWrapper.filterPromise.then(function (filter) {
                if (filter.onAnyFilterChanged) {
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
            utils_1._.mergeDeep(filterChangedEvent, additionalEventAttributes);
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
        return this.doesRowPassFilter(node, filterToSkip);
    };
    FilterManager.prototype.doesRowPassQuickFilterNoCache = function (node, filterPart) {
        var _this = this;
        var columns = this.columnController.getAllColumnsForQuickFilter();
        return utils_1._.some(columns, function (column) {
            var part = _this.getQuickFilterTextForColumn(column, node);
            return utils_1._.exists(part) && part.indexOf(filterPart) >= 0;
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
        return utils_1._.every(this.quickFilterParts, function (part) {
            return usingCache ? _this.doesRowPassQuickFilterCache(node, part) : _this.doesRowPassQuickFilterNoCache(node, part);
        });
    };
    FilterManager.prototype.doesRowPassFilter = function (node, filterToSkip) {
        // the row must pass ALL of the filters, so if any of them fail,
        // we return true. that means if a row passes the quick filter,
        // but fails the column filter, it fails overall
        // first up, check quick filter
        if (this.isQuickFilterPresent() && !this.doesRowPassQuickFilter(node)) {
            return false;
        }
        // secondly, give the client a chance to reject this row
        if (this.externalFilterPresent && !this.gridOptionsWrapper.doesExternalFilterPass(node)) {
            return false;
        }
        // lastly, check our internal advanced filter
        if (this.advancedFilterPresent && !this.doesFilterPass(node, filterToSkip)) {
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
        return utils_1._.exists(value) ? value.toString().toUpperCase() : null;
    };
    FilterManager.prototype.aggregateRowForQuickFilter = function (node) {
        var _this = this;
        var stringParts = [];
        var columns = this.columnController.getAllColumnsForQuickFilter();
        array_1.forEach(columns, function (column) {
            var part = _this.getQuickFilterTextForColumn(column, node);
            if (utils_1._.exists(part)) {
                stringParts.push(part);
            }
        });
        node.quickFilterAggregateText = stringParts.join(FilterManager_1.QUICK_FILTER_SEPARATOR);
    };
    FilterManager.prototype.onNewRowsLoaded = function (source) {
        this.allFilters.forEach(function (filterWrapper) {
            filterWrapper.filterPromise.then(function (filter) {
                if (filter.onNewRowsLoaded) {
                    filter.onNewRowsLoaded();
                }
            });
        });
        this.updateFilterFlagInColumns(source);
        this.setAdvancedFilterPresent();
    };
    FilterManager.prototype.createValueGetter = function (column) {
        var _this = this;
        return function (node) { return _this.valueService.getValue(column, node, true); };
    };
    FilterManager.prototype.getFilterComponent = function (column, source) {
        return this.getOrCreateFilterWrapper(column, source).filterPromise;
    };
    FilterManager.prototype.isFilterActive = function (column) {
        var filterWrapper = this.cachedFilter(column);
        return filterWrapper && filterWrapper.filterPromise.resolveNow(false, function (filter) { return filter.isFilterActive(); });
    };
    FilterManager.prototype.getOrCreateFilterWrapper = function (column, source) {
        var filterWrapper = this.cachedFilter(column);
        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column, source);
            this.allFilters.set(column.getColId(), filterWrapper);
        }
        else if (source !== 'NO_UI') {
            this.putIntoGui(filterWrapper, source);
        }
        return filterWrapper;
    };
    FilterManager.prototype.cachedFilter = function (column) {
        return this.allFilters.get(column.getColId());
    };
    FilterManager.prototype.createFilterInstance = function (column, $scope) {
        var _this = this;
        var defaultFilter = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.SetFilterModule) ? 'agSetColumnFilter' : 'agTextColumnFilter';
        var sanitisedColDef = utils_1._.cloneObject(column.getColDef());
        var filterInstance;
        var params = this.createFilterParams(column, sanitisedColDef, $scope);
        params.filterChangedCallback = this.onFilterChanged.bind(this);
        params.filterModifiedCallback = function () {
            var event = {
                type: events_1.Events.EVENT_FILTER_MODIFIED,
                api: _this.gridApi,
                columnApi: _this.columnApi,
                column: column,
                filterInstance: filterInstance
            };
            _this.eventService.dispatchEvent(event);
        };
        // we modify params in a callback as we need the filter instance, and this isn't available
        // when creating the params above
        var modifyParamsCallback = function (params, filterInstance) { return utils_1._.assign(params, {
            doesRowPassOtherFilter: _this.doesRowPassOtherFilters.bind(_this, filterInstance),
        }); };
        var res = this.userComponentFactory.newFilterComponent(sanitisedColDef, params, defaultFilter, modifyParamsCallback);
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
            colDef: colDef,
            rowModel: this.rowModel,
            filterChangedCallback: null,
            filterModifiedCallback: null,
            valueGetter: this.createValueGetter(column),
            context: this.gridOptionsWrapper.getContext(),
            doesRowPassOtherFilter: null
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
            guiPromise: utils_1.Promise.resolve(null)
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
        filterWrapper.guiPromise = new utils_1.Promise(function (resolve) {
            filterWrapper.filterPromise.then(function (filter) {
                var guiFromFilter = filter.getGui();
                if (utils_1._.missing(guiFromFilter)) {
                    console.warn("getGui method from filter returned " + guiFromFilter + ", it should be a DOM element or an HTML template string.");
                }
                // for backwards compatibility with Angular 1 - we
                // used to allow providing back HTML from getGui().
                // once we move away from supporting Angular 1
                // directly, we can change this.
                if (typeof guiFromFilter === 'string') {
                    guiFromFilter = utils_1._.loadTemplate(guiFromFilter);
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
        this.allFilters.forEach(function (filterWrapper) {
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
        var filterWrapper = this.allFilters.get(column.getColId());
        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.onFilterChanged();
        }
    };
    FilterManager.prototype.disposeFilterWrapper = function (filterWrapper, source) {
        var _this = this;
        filterWrapper.filterPromise.then(function (filter) {
            filter.setModel(null);
            if (filter.destroy) {
                filter.destroy();
            }
            filterWrapper.column.setFilterActive(false, source);
            if (filterWrapper.scope) {
                if (filterWrapper.compiledElement) {
                    filterWrapper.compiledElement.remove();
                }
                filterWrapper.scope.$destroy();
            }
            _this.allFilters.delete(filterWrapper.column.getColId());
        });
    };
    FilterManager.prototype.destroy = function () {
        var _this = this;
        this.allFilters.forEach(function (filterWrapper) { return _this.disposeFilterWrapper(filterWrapper, 'filterDestroyed'); });
        if (this.eventListenerDestroyers.length) {
            this.eventListenerDestroyers.forEach(function (func) { return func(); });
            this.eventListenerDestroyers.length = 0;
        }
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
        context_1.Autowired('gridOptionsWrapper')
    ], FilterManager.prototype, "gridOptionsWrapper", void 0);
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
        context_1.Autowired('eventService')
    ], FilterManager.prototype, "eventService", void 0);
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
}());
exports.FilterManager = FilterManager;

//# sourceMappingURL=filterManager.js.map
