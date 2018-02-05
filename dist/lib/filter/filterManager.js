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
var utils_1 = require("../utils");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var popupService_1 = require("../widgets/popupService");
var valueService_1 = require("../valueService/valueService");
var columnController_1 = require("../columnController/columnController");
var columnApi_1 = require("../columnController/columnApi");
var context_1 = require("../context/context");
var eventService_1 = require("../eventService");
var events_1 = require("../events");
var gridApi_1 = require("../gridApi");
var componentResolver_1 = require("../components/framework/componentResolver");
var FilterManager = (function () {
    function FilterManager() {
        this.allFilters = {};
        this.quickFilter = null;
    }
    FilterManager_1 = FilterManager;
    FilterManager.prototype.init = function () {
        this.eventService.addEventListener(events_1.Events.EVENT_ROW_DATA_CHANGED, this.onNewRowsLoaded.bind(this));
        this.eventService.addEventListener(events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());
        // check this here, in case there is a filter from the start
        this.checkExternalFilter();
    };
    FilterManager.prototype.setFilterModel = function (model) {
        var _this = this;
        var allPromises = [];
        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            var modelKeys_1 = Object.keys(model);
            utils_1.Utils.iterateObject(this.allFilters, function (colId, filterWrapper) {
                utils_1.Utils.removeFromArray(modelKeys_1, colId);
                var newModel = model[colId];
                _this.setModelOnFilterWrapper(filterWrapper.filterPromise, newModel);
                allPromises.push(filterWrapper.filterPromise);
            });
            // at this point, processedFields contains data for which we don't have a filter working yet
            utils_1.Utils.iterateArray(modelKeys_1, function (colId) {
                var column = _this.columnController.getPrimaryColumn(colId);
                if (!column) {
                    console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
                    return;
                }
                var filterWrapper = _this.getOrCreateFilterWrapper(column);
                _this.setModelOnFilterWrapper(filterWrapper.filterPromise, model[colId]);
                allPromises.push(filterWrapper.filterPromise);
            });
        }
        else {
            utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
                _this.setModelOnFilterWrapper(filterWrapper.filterPromise, null);
                allPromises.push(filterWrapper.filterPromise);
            });
        }
        utils_1.Promise.all(allPromises).then(function (whatever) {
            _this.onFilterChanged();
        });
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
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            // because user can provide filters, we provide useful error checking and messages
            var filterPromise = filterWrapper.filterPromise;
            var filter = filterPromise.resolveNow(null, function (filter) { return filter; });
            if (filter == null)
                return null;
            if (typeof filter.getModel !== 'function') {
                console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
                return;
            }
            var model = filter.getModel();
            if (utils_1.Utils.exists(model)) {
                result[key] = model;
            }
        });
        return result;
    };
    // returns true if any advanced filter (ie not quick filter) active
    FilterManager.prototype.isAdvancedFilterPresent = function () {
        return this.advancedFilterPresent;
    };
    FilterManager.prototype.setAdvancedFilterPresent = function () {
        var atLeastOneActive = false;
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            if (filterWrapper.filterPromise.resolveNow(false, function (filter) { return filter.isFilterActive(); })) {
                atLeastOneActive = true;
            }
        });
        this.advancedFilterPresent = atLeastOneActive;
    };
    FilterManager.prototype.updateFilterFlagInColumns = function (source) {
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            var filterActive = filterWrapper.filterPromise.resolveNow(false, function (filter) { return filter.isFilterActive(); });
            filterWrapper.column.setFilterActive(filterActive, source);
        });
    };
    // returns true if quickFilter or advancedFilter
    FilterManager.prototype.isAnyFilterPresent = function () {
        return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
    };
    FilterManager.prototype.doesFilterPass = function (node, filterToSkip) {
        var data = node.data;
        var colKeys = Object.keys(this.allFilters);
        for (var i = 0, l = colKeys.length; i < l; i++) {
            var colId = colKeys[i];
            var filterWrapper = this.allFilters[colId];
            // if no filter, always pass
            if (filterWrapper === undefined) {
                continue;
            }
            var filter = filterWrapper.filterPromise.resolveNow(undefined, function (filter) { return filter; });
            // if filter not yet there, continue
            if (filter === undefined) {
                continue;
            }
            if (filter === filterToSkip) {
                continue;
            }
            // don't bother with filters that are not active
            if (!filter.isFilterActive()) {
                continue;
            }
            if (!filter.doesFilterPass) {
                console.error('Filter is missing method doesFilterPass');
            }
            var params = {
                node: node,
                data: data
            };
            if (!filter.doesFilterPass(params)) {
                return false;
            }
        }
        // all filters passed
        return true;
    };
    FilterManager.prototype.parseQuickFilter = function (newFilter) {
        if (utils_1.Utils.missing(newFilter) || newFilter === "") {
            return null;
        }
        if (this.gridOptionsWrapper.isRowModelInfinite()) {
            console.warn('ag-grid: cannot do quick filtering when doing virtual paging');
            return null;
        }
        return newFilter.toUpperCase();
    };
    // returns true if it has changed (not just same value again)
    FilterManager.prototype.setQuickFilter = function (newFilter) {
        var parsedFilter = this.parseQuickFilter(newFilter);
        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.onFilterChanged();
        }
    };
    FilterManager.prototype.checkExternalFilter = function () {
        this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
    };
    FilterManager.prototype.onFilterChanged = function () {
        this.setAdvancedFilterPresent();
        this.updateFilterFlagInColumns("filterChanged");
        this.checkExternalFilter();
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            filterWrapper.filterPromise.then(function (filter) {
                if (filter.onAnyFilterChanged) {
                    filter.onAnyFilterChanged();
                }
            });
        });
        var event = {
            type: events_1.Events.EVENT_FILTER_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    };
    FilterManager.prototype.isQuickFilterPresent = function () {
        return this.quickFilter !== null;
    };
    FilterManager.prototype.doesRowPassOtherFilters = function (filterToSkip, node) {
        return this.doesRowPassFilter(node, filterToSkip);
    };
    FilterManager.prototype.doesRowPassQuickFilterNoCache = function (node) {
        var _this = this;
        var columns = this.columnController.getAllColumnsForQuickFilter();
        var filterPasses = false;
        columns.forEach(function (column) {
            if (filterPasses) {
                return;
            }
            var part = _this.getQuickFilterTextForColumn(column, node);
            if (utils_1.Utils.exists(part)) {
                if (part.indexOf(_this.quickFilter) >= 0) {
                    filterPasses = true;
                }
            }
        });
        return filterPasses;
    };
    FilterManager.prototype.doesRowPassQuickFilterCache = function (node) {
        if (!node.quickFilterAggregateText) {
            this.aggregateRowForQuickFilter(node);
        }
        var filterPasses = node.quickFilterAggregateText.indexOf(this.quickFilter) >= 0;
        return filterPasses;
    };
    FilterManager.prototype.doesRowPassQuickFilter = function (node) {
        var filterPasses;
        if (this.gridOptionsWrapper.isCacheQuickFilter()) {
            filterPasses = this.doesRowPassQuickFilterCache(node);
        }
        else {
            filterPasses = this.doesRowPassQuickFilterNoCache(node);
        }
        return filterPasses;
    };
    FilterManager.prototype.doesRowPassFilter = function (node, filterToSkip) {
        // the row must pass ALL of the filters, so if any of them fail,
        // we return true. that means if a row passes the quick filter,
        // but fails the column filter, it fails overall
        // first up, check quick filter
        if (this.isQuickFilterPresent()) {
            if (!this.doesRowPassQuickFilter(node)) {
                return false;
            }
        }
        // secondly, give the client a chance to reject this row
        if (this.externalFilterPresent) {
            if (!this.gridOptionsWrapper.doesExternalFilterPass(node)) {
                return false;
            }
        }
        // lastly, check our internal advanced filter
        if (this.advancedFilterPresent) {
            if (!this.doesFilterPass(node, filterToSkip)) {
                return false;
            }
        }
        // got this far, all filters pass
        return true;
    };
    FilterManager.prototype.getQuickFilterTextForColumn = function (column, rowNode) {
        var value = this.valueService.getValue(column, rowNode);
        var valueAfterCallback;
        var colDef = column.getColDef();
        if (column.getColDef().getQuickFilterText) {
            var params = {
                value: value,
                node: rowNode,
                data: rowNode.data,
                column: column,
                colDef: colDef
            };
            valueAfterCallback = column.getColDef().getQuickFilterText(params);
        }
        else {
            valueAfterCallback = value;
        }
        if (valueAfterCallback && valueAfterCallback !== '') {
            return valueAfterCallback.toString().toUpperCase();
        }
        else {
            return null;
        }
    };
    FilterManager.prototype.aggregateRowForQuickFilter = function (node) {
        var _this = this;
        var stringParts = [];
        var columns = this.columnController.getAllColumnsForQuickFilter();
        columns.forEach(function (column) {
            var part = _this.getQuickFilterTextForColumn(column, node);
            if (utils_1.Utils.exists(part)) {
                stringParts.push(part);
            }
        });
        node.quickFilterAggregateText = stringParts.join(FilterManager_1.QUICK_FILTER_SEPARATOR);
    };
    FilterManager.prototype.onNewRowsLoaded = function (source) {
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
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
        var that = this;
        return function valueGetter(node) {
            return that.valueService.getValue(column, node);
        };
    };
    FilterManager.prototype.getFilterComponent = function (column) {
        var filterWrapper = this.getOrCreateFilterWrapper(column);
        return filterWrapper.filterPromise;
    };
    FilterManager.prototype.getOrCreateFilterWrapper = function (column) {
        var filterWrapper = this.cachedFilter(column);
        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column);
            this.allFilters[column.getColId()] = filterWrapper;
        }
        return filterWrapper;
    };
    FilterManager.prototype.cachedFilter = function (column) {
        return this.allFilters[column.getColId()];
    };
    FilterManager.prototype.createFilterInstance = function (column, $scope) {
        var _this = this;
        var defaultFilter = 'agTextColumnFilter';
        if (this.gridOptionsWrapper.isEnterprise()) {
            defaultFilter = 'agSetColumnFilter';
        }
        var sanitisedColDef = utils_1.Utils.cloneObject(column.getColDef());
        var event = {
            type: events_1.Events.EVENT_FILTER_MODIFIED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        var filterChangedCallback = this.onFilterChanged.bind(this);
        var filterModifiedCallback = function () { return _this.eventService.dispatchEvent(event); };
        var params = {
            column: column,
            colDef: sanitisedColDef,
            rowModel: this.rowModel,
            filterChangedCallback: filterChangedCallback,
            filterModifiedCallback: filterModifiedCallback,
            valueGetter: this.createValueGetter(column),
            context: this.gridOptionsWrapper.getContext(),
            doesRowPassOtherFilter: null,
            $scope: $scope
        };
        return this.componentResolver.createAgGridComponent(sanitisedColDef, params, 'filter', {
            api: this.gridApi,
            columnApi: this.columnApi,
            column: column,
            colDef: sanitisedColDef
        }, defaultFilter, true, function (params, filter) { return utils_1.Utils.assign(params, {
            doesRowPassOtherFilter: _this.doesRowPassOtherFilters.bind(_this, filter),
        }); });
    };
    FilterManager.prototype.createFilterWrapper = function (column) {
        var filterWrapper = {
            column: column,
            filterPromise: null,
            scope: null,
            guiPromise: utils_1.Promise.external()
        };
        filterWrapper.scope = this.gridOptionsWrapper.isAngularCompileFilters() ? this.$scope.$new() : null;
        filterWrapper.filterPromise = this.createFilterInstance(column, filterWrapper.scope);
        this.putIntoGui(filterWrapper);
        return filterWrapper;
    };
    FilterManager.prototype.putIntoGui = function (filterWrapper) {
        var _this = this;
        var eFilterGui = document.createElement('div');
        eFilterGui.className = 'ag-filter';
        filterWrapper.filterPromise.then(function (filter) {
            var guiFromFilter = filter.getGui();
            if (utils_1.Utils.missing(guiFromFilter)) {
                console.warn("getGui method from filter returned " + guiFromFilter + ", it should be a DOM element or an HTML template string.");
            }
            // for backwards compatibility with Angular 1 - we
            // used to allow providing back HTML from getGui().
            // once we move away from supporting Angular 1
            // directly, we can change this.
            if (typeof guiFromFilter === 'string') {
                guiFromFilter = utils_1.Utils.loadTemplate(guiFromFilter);
            }
            eFilterGui.appendChild(guiFromFilter);
            if (filterWrapper.scope) {
                _this.$compile(eFilterGui)(filterWrapper.scope);
                setTimeout(function () { return filterWrapper.scope.$apply(); }, 0);
            }
            filterWrapper.guiPromise.resolve(eFilterGui);
        });
    };
    FilterManager.prototype.onNewColumnsLoaded = function () {
        this.destroy();
    };
    // destroys the filter, so it not longer takes part
    FilterManager.prototype.destroyFilter = function (column, source) {
        if (source === void 0) { source = "api"; }
        var filterWrapper = this.allFilters[column.getColId()];
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
                filterWrapper.scope.$destroy();
            }
            delete _this.allFilters[filterWrapper.column.getColId()];
        });
    };
    FilterManager.prototype.destroy = function () {
        var _this = this;
        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
            _this.disposeFilterWrapper(filterWrapper, "filterDestroyed");
        });
    };
    FilterManager.QUICK_FILTER_SEPARATOR = '\n';
    __decorate([
        context_1.Autowired('$compile'),
        __metadata("design:type", Object)
    ], FilterManager.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('$scope'),
        __metadata("design:type", Object)
    ], FilterManager.prototype, "$scope", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], FilterManager.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('gridCore'),
        __metadata("design:type", Object)
    ], FilterManager.prototype, "gridCore", void 0);
    __decorate([
        context_1.Autowired('popupService'),
        __metadata("design:type", popupService_1.PopupService)
    ], FilterManager.prototype, "popupService", void 0);
    __decorate([
        context_1.Autowired('valueService'),
        __metadata("design:type", valueService_1.ValueService)
    ], FilterManager.prototype, "valueService", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], FilterManager.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], FilterManager.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], FilterManager.prototype, "eventService", void 0);
    __decorate([
        context_1.Autowired('enterprise'),
        __metadata("design:type", Boolean)
    ], FilterManager.prototype, "enterprise", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], FilterManager.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], FilterManager.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], FilterManager.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('componentResolver'),
        __metadata("design:type", componentResolver_1.ComponentResolver)
    ], FilterManager.prototype, "componentResolver", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], FilterManager.prototype, "init", null);
    __decorate([
        context_1.PreDestroy,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], FilterManager.prototype, "destroy", null);
    FilterManager = FilterManager_1 = __decorate([
        context_1.Bean('filterManager')
    ], FilterManager);
    return FilterManager;
    var FilterManager_1;
}());
exports.FilterManager = FilterManager;
