"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
exports.FilterManager = void 0;
var utils_1 = require("../utils");
var column_1 = require("../entities/column");
var context_1 = require("../context/context");
var events_1 = require("../events");
var moduleNames_1 = require("../modules/moduleNames");
var moduleRegistry_1 = require("../modules/moduleRegistry");
var beanStub_1 = require("../context/beanStub");
var set_1 = require("../utils/set");
var generic_1 = require("../utils/generic");
var object_1 = require("../utils/object");
var dom_1 = require("../utils/dom");
var componentTypes_1 = require("../components/framework/componentTypes");
var gridApi_1 = require("../gridApi");
var function_1 = require("../utils/function");
var quickFilterService_1 = require("./quickFilterService");
var FilterManager = /** @class */ (function (_super) {
    __extends(FilterManager, _super);
    function FilterManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.allColumnFilters = new Map();
        _this.allColumnListeners = new Map();
        _this.activeAggregateFilters = [];
        _this.activeColumnFilters = [];
        // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
        // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
        // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
        // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
        // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
        _this.processingFilterChange = false;
        // when we're waiting for cell data types to be inferred, we need to defer filter model updates
        _this.filterModelUpdateQueue = [];
        _this.advancedFilterModelUpdateQueue = [];
        return _this;
    }
    FilterManager.prototype.init = function () {
        var _this = this;
        this.addManagedListener(this.eventService, events_1.Events.EVENT_GRID_COLUMNS_CHANGED, function () { return _this.onColumnsChanged(); });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_VALUE_CHANGED, function () { return _this.refreshFiltersForAggregations(); });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_PIVOT_CHANGED, function () { return _this.refreshFiltersForAggregations(); });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, function () { return _this.refreshFiltersForAggregations(); });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_NEW_COLUMNS_LOADED, function () { return _this.updateAdvancedFilterColumns(); });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_VISIBLE, function () { return _this.updateAdvancedFilterColumns(); });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_ROW_DATA_UPDATED, function () { return _this.onNewRowsLoaded('rowDataUpdated'); });
        this.externalFilterPresent = this.isExternalFilterPresentCallback();
        this.addManagedPropertyListeners(['isExternalFilterPresent', 'doesExternalFilterPass'], function () {
            _this.onFilterChanged({ source: 'api' });
        });
        this.updateAggFiltering();
        this.addManagedPropertyListener('groupAggFiltering', function () {
            _this.updateAggFiltering();
            _this.onFilterChanged();
        });
        this.addManagedPropertyListener('advancedFilterModel', function (event) { return _this.setAdvancedFilterModel(event.currentValue); });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED, function (_a) {
            var enabled = _a.enabled;
            return _this.onAdvancedFilterEnabledChanged(enabled);
        });
        this.addManagedListener(this.eventService, events_1.Events.EVENT_DATA_TYPES_INFERRED, function () { return _this.processFilterModelUpdateQueue(); });
        this.addManagedListener(this.quickFilterService, quickFilterService_1.QuickFilterService.EVENT_QUICK_FILTER_CHANGED, function () { return _this.onFilterChanged({ source: 'quickFilter' }); });
    };
    FilterManager.prototype.isExternalFilterPresentCallback = function () {
        var isFilterPresent = this.gridOptionsService.getCallback('isExternalFilterPresent');
        if (typeof isFilterPresent === 'function') {
            return isFilterPresent({});
        }
        return false;
    };
    FilterManager.prototype.doesExternalFilterPass = function (node) {
        var doesFilterPass = this.gridOptionsService.get('doesExternalFilterPass');
        if (typeof doesFilterPass === 'function') {
            return doesFilterPass(node);
        }
        return false;
    };
    FilterManager.prototype.setFilterModel = function (model, source) {
        var _this = this;
        if (source === void 0) { source = 'api'; }
        if (this.isAdvancedFilterEnabled()) {
            this.warnAdvancedFilters();
            return;
        }
        if (this.dataTypeService.isPendingInference()) {
            this.filterModelUpdateQueue.push({ model: model, source: source });
            return;
        }
        var allPromises = [];
        var previousModel = this.getFilterModel();
        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            var modelKeys_1 = (0, set_1.convertToSet)(Object.keys(model));
            this.allColumnFilters.forEach(function (filterWrapper, colId) {
                var newModel = model[colId];
                allPromises.push(_this.setModelOnFilterWrapper(filterWrapper.filterPromise, newModel));
                modelKeys_1.delete(colId);
            });
            // at this point, processedFields contains data for which we don't have a filter working yet
            modelKeys_1.forEach(function (colId) {
                var column = _this.columnModel.getPrimaryColumn(colId) || _this.columnModel.getGridColumn(colId);
                if (!column) {
                    console.warn('AG Grid: setFilterModel() - no column found for colId: ' + colId);
                    return;
                }
                if (!column.isFilterAllowed()) {
                    console.warn('AG Grid: setFilterModel() - unable to fully apply model, filtering disabled for colId: ' + colId);
                    return;
                }
                var filterWrapper = _this.getOrCreateFilterWrapper(column, 'NO_UI');
                if (!filterWrapper) {
                    console.warn('AG-Grid: setFilterModel() - unable to fully apply model, unable to create filter for colId: ' + colId);
                    return;
                }
                allPromises.push(_this.setModelOnFilterWrapper(filterWrapper.filterPromise, model[colId]));
            });
        }
        else {
            this.allColumnFilters.forEach(function (filterWrapper) {
                allPromises.push(_this.setModelOnFilterWrapper(filterWrapper.filterPromise, null));
            });
        }
        utils_1.AgPromise.all(allPromises).then(function () {
            var currentModel = _this.getFilterModel();
            var columns = [];
            _this.allColumnFilters.forEach(function (filterWrapper, colId) {
                var before = previousModel ? previousModel[colId] : null;
                var after = currentModel ? currentModel[colId] : null;
                if (!utils_1._.jsonEquals(before, after)) {
                    columns.push(filterWrapper.column);
                }
            });
            if (columns.length > 0) {
                _this.onFilterChanged({ columns: columns, source: source });
            }
        });
    };
    FilterManager.prototype.setModelOnFilterWrapper = function (filterPromise, newModel) {
        return new utils_1.AgPromise(function (resolve) {
            filterPromise.then(function (filter) {
                if (typeof filter.setModel !== 'function') {
                    console.warn('AG Grid: filter missing setModel method, which is needed for setFilterModel');
                    resolve();
                }
                (filter.setModel(newModel) || utils_1.AgPromise.resolve()).then(function () { return resolve(); });
            });
        });
    };
    FilterManager.prototype.getFilterModel = function () {
        var result = {};
        this.allColumnFilters.forEach(function (filterWrapper, key) {
            // because user can provide filters, we provide useful error checking and messages
            var filterPromise = filterWrapper.filterPromise;
            var filter = filterPromise.resolveNow(null, function (promiseFilter) { return promiseFilter; });
            if (filter == null) {
                return null;
            }
            if (typeof filter.getModel !== 'function') {
                console.warn('AG Grid: filter API missing getModel method, which is needed for getFilterModel');
                return;
            }
            var model = filter.getModel();
            if ((0, generic_1.exists)(model)) {
                result[key] = model;
            }
        });
        return result;
    };
    FilterManager.prototype.isColumnFilterPresent = function () {
        return this.activeColumnFilters.length > 0;
    };
    FilterManager.prototype.isAggregateFilterPresent = function () {
        return !!this.activeAggregateFilters.length;
    };
    FilterManager.prototype.isExternalFilterPresent = function () {
        return this.externalFilterPresent;
    };
    FilterManager.prototype.isChildFilterPresent = function () {
        return this.isColumnFilterPresent()
            || this.isQuickFilterPresent()
            || this.isExternalFilterPresent()
            || this.isAdvancedFilterPresent();
    };
    FilterManager.prototype.isAdvancedFilterPresent = function () {
        return this.isAdvancedFilterEnabled() && this.advancedFilterService.isFilterPresent();
    };
    FilterManager.prototype.onAdvancedFilterEnabledChanged = function (enabled) {
        var _this = this;
        var _a;
        if (enabled) {
            if (this.allColumnFilters.size) {
                this.allColumnFilters.forEach(function (filterWrapper) { return _this.disposeFilterWrapper(filterWrapper, 'advancedFilterEnabled'); });
                this.onFilterChanged({ source: 'advancedFilter' });
            }
        }
        else {
            if ((_a = this.advancedFilterService) === null || _a === void 0 ? void 0 : _a.isFilterPresent()) {
                this.advancedFilterService.setModel(null);
                this.onFilterChanged({ source: 'advancedFilter' });
            }
        }
    };
    FilterManager.prototype.isAdvancedFilterEnabled = function () {
        var _a;
        return (_a = this.advancedFilterService) === null || _a === void 0 ? void 0 : _a.isEnabled();
    };
    FilterManager.prototype.isAdvancedFilterHeaderActive = function () {
        return this.isAdvancedFilterEnabled() && this.advancedFilterService.isHeaderActive();
    };
    FilterManager.prototype.doAggregateFiltersPass = function (node, filterToSkip) {
        return this.doColumnFiltersPass(node, filterToSkip, true);
    };
    // called by:
    // 1) onFilterChanged()
    // 2) onNewRowsLoaded()
    FilterManager.prototype.updateActiveFilters = function () {
        var _this = this;
        this.activeColumnFilters.length = 0;
        this.activeAggregateFilters.length = 0;
        var isFilterActive = function (filter) {
            if (!filter) {
                return false;
            } // this never happens, including to avoid compile error
            if (!filter.isFilterActive) {
                console.warn('AG Grid: Filter is missing isFilterActive() method');
                return false;
            }
            return filter.isFilterActive();
        };
        var groupFilterEnabled = !!this.gridOptionsService.getGroupAggFiltering();
        var isAggFilter = function (column) {
            var isSecondary = !column.isPrimary();
            // the only filters that can appear on secondary columns are groupAgg filters
            if (isSecondary) {
                return true;
            }
            var isShowingPrimaryColumns = !_this.columnModel.isPivotActive();
            var isValueActive = column.isValueActive();
            // primary columns are only ever groupAgg filters if a) value is active and b) showing primary columns
            if (!isValueActive || !isShowingPrimaryColumns) {
                return false;
            }
            // from here on we know: isPrimary=true, isValueActive=true, isShowingPrimaryColumns=true
            if (_this.columnModel.isPivotMode()) {
                // primary column is pretending to be a pivot column, ie pivotMode=true, but we are
                // still showing primary columns
                return true;
            }
            // we are not pivoting, so we groupFilter when it's an agg column
            return groupFilterEnabled;
        };
        this.allColumnFilters.forEach(function (filterWrapper) {
            if (filterWrapper.filterPromise.resolveNow(false, isFilterActive)) {
                var filterComp = filterWrapper.filterPromise.resolveNow(null, function (filter) { return filter; });
                if (isAggFilter(filterWrapper.column)) {
                    _this.activeAggregateFilters.push(filterComp);
                }
                else {
                    _this.activeColumnFilters.push(filterComp);
                }
            }
        });
    };
    FilterManager.prototype.updateFilterFlagInColumns = function (source, additionalEventAttributes) {
        this.allColumnFilters.forEach(function (filterWrapper) {
            var isFilterActive = filterWrapper.filterPromise.resolveNow(false, function (filter) { return filter.isFilterActive(); });
            filterWrapper.column.setFilterActive(isFilterActive, source, additionalEventAttributes);
        });
    };
    FilterManager.prototype.isAnyFilterPresent = function () {
        return this.isQuickFilterPresent() || this.isColumnFilterPresent() || this.isAggregateFilterPresent() || this.isExternalFilterPresent();
    };
    FilterManager.prototype.doColumnFiltersPass = function (node, filterToSkip, targetAggregates) {
        var data = node.data, aggData = node.aggData;
        var targetedFilters = targetAggregates ? this.activeAggregateFilters : this.activeColumnFilters;
        var targetedData = targetAggregates ? aggData : data;
        for (var i = 0; i < targetedFilters.length; i++) {
            var filter = targetedFilters[i];
            if (filter == null || filter === filterToSkip) {
                continue;
            }
            if (typeof filter.doesFilterPass !== 'function') {
                // because users can do custom filters, give nice error message
                throw new Error('Filter is missing method doesFilterPass');
            }
            if (!filter.doesFilterPass({ node: node, data: targetedData })) {
                return false;
            }
        }
        return true;
    };
    FilterManager.prototype.resetQuickFilterCache = function () {
        this.quickFilterService.resetQuickFilterCache();
    };
    FilterManager.prototype.refreshFiltersForAggregations = function () {
        var isAggFiltering = this.gridOptionsService.getGroupAggFiltering();
        if (isAggFiltering) {
            this.onFilterChanged();
        }
    };
    // sometimes (especially in React) the filter can call onFilterChanged when we are in the middle
    // of a render cycle. this would be bad, so we wait for render cycle to complete when this happens.
    // this happens in react when we change React State in the grid (eg setting RowCtrl's in RowContainer)
    // which results in React State getting applied in the main application, triggering a useEffect() to
    // be kicked off adn then the application calling the grid's API. in AG-6554, the custom filter was
    // getting it's useEffect() triggered in this way.
    FilterManager.prototype.callOnFilterChangedOutsideRenderCycle = function (params) {
        var _this = this;
        var action = function () { return _this.onFilterChanged(params); };
        if (this.rowRenderer.isRefreshInProgress()) {
            setTimeout(action, 0);
        }
        else {
            action();
        }
    };
    FilterManager.prototype.onFilterChanged = function (params) {
        if (params === void 0) { params = {}; }
        var source = params.source, filterInstance = params.filterInstance, additionalEventAttributes = params.additionalEventAttributes, columns = params.columns;
        this.updateDependantFilters();
        this.updateActiveFilters();
        this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes);
        this.externalFilterPresent = this.isExternalFilterPresentCallback();
        this.allColumnFilters.forEach(function (filterWrapper) {
            if (!filterWrapper.filterPromise) {
                return;
            }
            filterWrapper.filterPromise.then(function (filter) {
                if (filter && filter !== filterInstance && filter.onAnyFilterChanged) {
                    filter.onAnyFilterChanged();
                }
            });
        });
        var filterChangedEvent = {
            source: source,
            type: events_1.Events.EVENT_FILTER_CHANGED,
            columns: columns || [],
        };
        if (additionalEventAttributes) {
            (0, object_1.mergeDeep)(filterChangedEvent, additionalEventAttributes);
        }
        // because internal events are not async in ag-grid, when the dispatchEvent
        // method comes back, we know all listeners have finished executing.
        this.processingFilterChange = true;
        this.eventService.dispatchEvent(filterChangedEvent);
        this.processingFilterChange = false;
    };
    FilterManager.prototype.isSuppressFlashingCellsBecauseFiltering = function () {
        var _a;
        // if user has elected to always flash cell changes, then always return false, otherwise we suppress flashing
        // changes when filtering
        var allowShowChangeAfterFilter = (_a = this.gridOptionsService.get('allowShowChangeAfterFilter')) !== null && _a !== void 0 ? _a : false;
        return !allowShowChangeAfterFilter && this.processingFilterChange;
    };
    FilterManager.prototype.isQuickFilterPresent = function () {
        return this.quickFilterService.isQuickFilterPresent();
    };
    FilterManager.prototype.updateAggFiltering = function () {
        this.aggFiltering = !!this.gridOptionsService.getGroupAggFiltering();
    };
    FilterManager.prototype.isAggregateQuickFilterPresent = function () {
        return this.isQuickFilterPresent() && (this.aggFiltering || this.columnModel.isPivotMode());
    };
    FilterManager.prototype.isNonAggregateQuickFilterPresent = function () {
        return this.isQuickFilterPresent() && !(this.aggFiltering || this.columnModel.isPivotMode());
    };
    FilterManager.prototype.doesRowPassOtherFilters = function (filterToSkip, node) {
        return this.doesRowPassFilter({ rowNode: node, filterInstanceToSkip: filterToSkip });
    };
    FilterManager.prototype.doesRowPassAggregateFilters = function (params) {
        // check quick filter
        if (this.isAggregateQuickFilterPresent() && !this.quickFilterService.doesRowPassQuickFilter(params.rowNode)) {
            return false;
        }
        if (this.isAggregateFilterPresent() && !this.doAggregateFiltersPass(params.rowNode, params.filterInstanceToSkip)) {
            return false;
        }
        // got this far, all filters pass
        return true;
    };
    FilterManager.prototype.doesRowPassFilter = function (params) {
        // the row must pass ALL of the filters, so if any of them fail,
        // we return true. that means if a row passes the quick filter,
        // but fails the column filter, it fails overall
        // first up, check quick filter
        if (this.isNonAggregateQuickFilterPresent() && !this.quickFilterService.doesRowPassQuickFilter(params.rowNode)) {
            return false;
        }
        // secondly, give the client a chance to reject this row
        if (this.isExternalFilterPresent() && !this.doesExternalFilterPass(params.rowNode)) {
            return false;
        }
        // lastly, check column filter
        if (this.isColumnFilterPresent() && !this.doColumnFiltersPass(params.rowNode, params.filterInstanceToSkip)) {
            return false;
        }
        if (this.isAdvancedFilterPresent() && !this.advancedFilterService.doesFilterPass(params.rowNode)) {
            return false;
        }
        // got this far, all filters pass
        return true;
    };
    FilterManager.prototype.onNewRowsLoaded = function (source) {
        this.allColumnFilters.forEach(function (filterWrapper) {
            filterWrapper.filterPromise.then(function (filter) {
                if (filter.onNewRowsLoaded) {
                    filter.onNewRowsLoaded();
                }
            });
        });
        this.updateFilterFlagInColumns(source, { afterDataChange: true });
        this.updateActiveFilters();
    };
    FilterManager.prototype.createValueGetter = function (column) {
        var _this = this;
        return function (_a) {
            var node = _a.node;
            return _this.valueService.getValue(column, node, true);
        };
    };
    FilterManager.prototype.createGetValue = function (filterColumn) {
        var _this = this;
        return function (rowNode, column) {
            var columnToUse = column ? _this.columnModel.getGridColumn(column) : filterColumn;
            return columnToUse ? _this.valueService.getValue(columnToUse, rowNode, true) : undefined;
        };
    };
    FilterManager.prototype.getFilterComponent = function (column, source, createIfDoesNotExist) {
        var _a;
        if (createIfDoesNotExist === void 0) { createIfDoesNotExist = true; }
        if (createIfDoesNotExist) {
            return ((_a = this.getOrCreateFilterWrapper(column, source)) === null || _a === void 0 ? void 0 : _a.filterPromise) || null;
        }
        var filterWrapper = this.cachedFilter(column);
        return filterWrapper ? filterWrapper.filterPromise : null;
    };
    FilterManager.prototype.isFilterActive = function (column) {
        var filterWrapper = this.cachedFilter(column);
        return !!filterWrapper && filterWrapper.filterPromise.resolveNow(false, function (filter) { return filter.isFilterActive(); });
    };
    FilterManager.prototype.getOrCreateFilterWrapper = function (column, source) {
        if (!column.isFilterAllowed()) {
            return null;
        }
        var filterWrapper = this.cachedFilter(column);
        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column, source);
            this.setColumnFilterWrapper(column, filterWrapper);
        }
        else if (source !== 'NO_UI') {
            this.putIntoGui(filterWrapper, source);
        }
        return filterWrapper;
    };
    FilterManager.prototype.cachedFilter = function (column) {
        return this.allColumnFilters.get(column.getColId());
    };
    FilterManager.prototype.getDefaultFilter = function (column) {
        var defaultFilter;
        if (moduleRegistry_1.ModuleRegistry.__isRegistered(moduleNames_1.ModuleNames.SetFilterModule, this.context.getGridId())) {
            defaultFilter = 'agSetColumnFilter';
        }
        else {
            var cellDataType = column.getColDef().cellDataType;
            if (cellDataType === 'number') {
                defaultFilter = 'agNumberColumnFilter';
            }
            else if (cellDataType === 'date' || cellDataType === 'dateString') {
                defaultFilter = 'agDateColumnFilter';
            }
            else {
                defaultFilter = 'agTextColumnFilter';
            }
        }
        return defaultFilter;
    };
    FilterManager.prototype.getDefaultFloatingFilter = function (column) {
        var defaultFloatingFilterType;
        if (moduleRegistry_1.ModuleRegistry.__isRegistered(moduleNames_1.ModuleNames.SetFilterModule, this.context.getGridId())) {
            defaultFloatingFilterType = 'agSetColumnFloatingFilter';
        }
        else {
            var cellDataType = column.getColDef().cellDataType;
            if (cellDataType === 'number') {
                defaultFloatingFilterType = 'agNumberColumnFloatingFilter';
            }
            else if (cellDataType === 'date' || cellDataType === 'dateString') {
                defaultFloatingFilterType = 'agDateColumnFloatingFilter';
            }
            else {
                defaultFloatingFilterType = 'agTextColumnFloatingFilter';
            }
        }
        return defaultFloatingFilterType;
    };
    FilterManager.prototype.createFilterInstance = function (column) {
        var _this = this;
        var defaultFilter = this.getDefaultFilter(column);
        var colDef = column.getColDef();
        var filterInstance;
        var params = __assign(__assign({}, this.createFilterParams(column, colDef)), { filterModifiedCallback: function () { return _this.filterModifiedCallbackFactory(filterInstance, column)(); }, filterChangedCallback: function (additionalEventAttributes) { return _this.filterChangedCallbackFactory(filterInstance, column)(additionalEventAttributes); }, doesRowPassOtherFilter: function (node) { return _this.doesRowPassOtherFilters(filterInstance, node); } });
        var compDetails = this.userComponentFactory.getFilterDetails(colDef, params, defaultFilter);
        if (!compDetails) {
            return { filterPromise: null, compDetails: null };
        }
        return {
            filterPromise: function () {
                var filterPromise = compDetails.newAgStackInstance();
                if (filterPromise) {
                    filterPromise.then(function (r) { return filterInstance = r; });
                }
                return filterPromise;
            },
            compDetails: compDetails
        };
    };
    FilterManager.prototype.createFilterParams = function (column, colDef) {
        var params = {
            column: column,
            colDef: (0, object_1.cloneObject)(colDef),
            rowModel: this.rowModel,
            filterChangedCallback: function () { },
            filterModifiedCallback: function () { },
            valueGetter: this.createValueGetter(column),
            getValue: this.createGetValue(column),
            doesRowPassOtherFilter: function () { return true; },
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context,
        };
        return params;
    };
    FilterManager.prototype.createFilterWrapper = function (column, source) {
        var _a;
        var filterWrapper = {
            column: column,
            filterPromise: null,
            compiledElement: null,
            guiPromise: utils_1.AgPromise.resolve(null),
            compDetails: null
        };
        var _b = this.createFilterInstance(column), filterPromise = _b.filterPromise, compDetails = _b.compDetails;
        filterWrapper.filterPromise = (_a = filterPromise === null || filterPromise === void 0 ? void 0 : filterPromise()) !== null && _a !== void 0 ? _a : null;
        filterWrapper.compDetails = compDetails;
        if (filterPromise) {
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
                if (!(0, generic_1.exists)(guiFromFilter)) {
                    console.warn("AG Grid: getGui method from filter returned ".concat(guiFromFilter, ", it should be a DOM element or an HTML template string."));
                }
                // for backwards compatibility with Angular 1 - we
                // used to allow providing back HTML from getGui().
                // once we move away from supporting Angular 1
                // directly, we can change this.
                if (typeof guiFromFilter === 'string') {
                    guiFromFilter = (0, dom_1.loadTemplate)(guiFromFilter);
                }
                eFilterGui.appendChild(guiFromFilter);
                resolve(eFilterGui);
                var event = {
                    type: events_1.Events.EVENT_FILTER_OPENED,
                    column: filterWrapper.column,
                    source: source,
                    eGui: eFilterGui
                };
                _this.eventService.dispatchEvent(event);
            });
        });
    };
    FilterManager.prototype.onColumnsChanged = function () {
        var _this = this;
        var columns = [];
        this.allColumnFilters.forEach(function (wrapper, colId) {
            var currentColumn;
            if (wrapper.column.isPrimary()) {
                currentColumn = _this.columnModel.getPrimaryColumn(colId);
            }
            else {
                currentColumn = _this.columnModel.getGridColumn(colId);
            }
            if (currentColumn) {
                return;
            }
            columns.push(wrapper.column);
            _this.disposeFilterWrapper(wrapper, 'columnChanged');
            _this.disposeColumnListener(colId);
        });
        if (columns.length > 0) {
            // When a filter changes as a side effect of a column changes,
            // we report 'api' as the source, so that the client can distinguish
            this.onFilterChanged({ columns: columns, source: 'api' });
        }
        else {
            // onFilterChanged does this already
            this.updateDependantFilters();
        }
    };
    FilterManager.prototype.updateDependantFilters = function () {
        var _this = this;
        // Group column filters can be dependant on underlying column filters, but don't normally get created until they're used for the first time.
        // Instead, create them by default when any filter changes.
        var groupColumns = this.columnModel.getGroupAutoColumns();
        groupColumns === null || groupColumns === void 0 ? void 0 : groupColumns.forEach(function (groupColumn) {
            if (groupColumn.getColDef().filter === 'agGroupColumnFilter') {
                _this.getOrCreateFilterWrapper(groupColumn, 'NO_UI');
            }
        });
    };
    // for group filters, can change dynamically whether they are allowed or not
    FilterManager.prototype.isFilterAllowed = function (column) {
        var _a, _b;
        if (this.isAdvancedFilterEnabled()) {
            return false;
        }
        var isFilterAllowed = column.isFilterAllowed();
        if (!isFilterAllowed) {
            return false;
        }
        var filterWrapper = this.allColumnFilters.get(column.getColId());
        return (_b = (_a = filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise) === null || _a === void 0 ? void 0 : _a.resolveNow(true, 
        // defer to filter component isFilterAllowed if it exists
        function (filter) { return (typeof (filter === null || filter === void 0 ? void 0 : filter.isFilterAllowed) === 'function')
            ? filter === null || filter === void 0 ? void 0 : filter.isFilterAllowed()
            : true; })) !== null && _b !== void 0 ? _b : true;
    };
    FilterManager.prototype.getFloatingFilterCompDetails = function (column, showParentFilter) {
        var _this = this;
        var colDef = column.getColDef();
        var filterParams = this.createFilterParams(column, colDef);
        var finalFilterParams = this.userComponentFactory.mergeParamsWithApplicationProvidedParams(colDef, componentTypes_1.FilterComponent, filterParams);
        var defaultFloatingFilterType = this.userComponentFactory.getDefaultFloatingFilterType(colDef, function () { return _this.getDefaultFloatingFilter(column); });
        if (defaultFloatingFilterType == null) {
            defaultFloatingFilterType = 'agReadOnlyFloatingFilter';
        }
        var parentFilterInstance = function (callback) {
            var filterComponent = _this.getFilterComponent(column, 'NO_UI');
            if (filterComponent == null) {
                return;
            }
            filterComponent.then(function (instance) {
                callback((0, gridApi_1.unwrapUserComp)(instance));
            });
        };
        var params = {
            column: column,
            filterParams: finalFilterParams,
            currentParentModel: function () { return _this.getCurrentFloatingFilterParentModel(column); },
            parentFilterInstance: parentFilterInstance,
            showParentFilter: showParentFilter,
            suppressFilterButton: false // This one might be overridden from the colDef
        };
        return this.userComponentFactory.getFloatingFilterCompDetails(colDef, params, defaultFloatingFilterType);
    };
    FilterManager.prototype.getCurrentFloatingFilterParentModel = function (column) {
        var filterComponent = this.getFilterComponent(column, 'NO_UI', false);
        return filterComponent ? filterComponent.resolveNow(null, function (filter) { return filter && filter.getModel(); }) : null;
    };
    // destroys the filter, so it no longer takes part
    FilterManager.prototype.destroyFilter = function (column, source) {
        if (source === void 0) { source = 'api'; }
        var colId = column.getColId();
        var filterWrapper = this.allColumnFilters.get(colId);
        this.disposeColumnListener(colId);
        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.onFilterChanged({
                columns: [column],
                source: 'api',
            });
        }
    };
    FilterManager.prototype.disposeColumnListener = function (colId) {
        var columnListener = this.allColumnListeners.get(colId);
        if (columnListener) {
            this.allColumnListeners.delete(colId);
            columnListener();
        }
    };
    FilterManager.prototype.disposeFilterWrapper = function (filterWrapper, source) {
        var _this = this;
        filterWrapper.filterPromise.then(function (filter) {
            _this.getContext().destroyBean(filter);
            filterWrapper.column.setFilterActive(false, 'filterDestroyed');
            _this.allColumnFilters.delete(filterWrapper.column.getColId());
            var event = {
                type: events_1.Events.EVENT_FILTER_DESTROYED,
                source: source,
                column: filterWrapper.column,
            };
            _this.eventService.dispatchEvent(event);
        });
    };
    FilterManager.prototype.filterModifiedCallbackFactory = function (filter, column) {
        var _this = this;
        return function () {
            var event = {
                type: events_1.Events.EVENT_FILTER_MODIFIED,
                column: column,
                filterInstance: filter,
            };
            _this.eventService.dispatchEvent(event);
        };
    };
    FilterManager.prototype.filterChangedCallbackFactory = function (filter, column) {
        var _this = this;
        return function (additionalEventAttributes) {
            var _a;
            var source = (_a = additionalEventAttributes === null || additionalEventAttributes === void 0 ? void 0 : additionalEventAttributes.source) !== null && _a !== void 0 ? _a : 'api';
            var params = {
                filter: filter,
                additionalEventAttributes: additionalEventAttributes,
                columns: [column],
                source: source,
            };
            _this.callOnFilterChangedOutsideRenderCycle(params);
        };
    };
    FilterManager.prototype.checkDestroyFilter = function (colId) {
        var _this = this;
        var filterWrapper = this.allColumnFilters.get(colId);
        if (!filterWrapper) {
            return;
        }
        var column = filterWrapper.column;
        var compDetails = (column.isFilterAllowed()
            ? this.createFilterInstance(column)
            : { compDetails: null }).compDetails;
        // Case when filter component changes
        if (this.areFilterCompsDifferent(filterWrapper.compDetails, compDetails)) {
            this.destroyFilter(column, 'columnChanged');
            return;
        }
        // Case when filter params changes
        var newFilterParams = column.getColDef().filterParams;
        // When filter wrapper does not have promise to retrieve FilterComp, destroy
        if (!filterWrapper.filterPromise) {
            this.destroyFilter(column, 'columnChanged');
            return;
        }
        // Otherwise - Check for refresh method before destruction
        // If refresh() method is implemented - call it and destroy filter if it returns false
        // Otherwise - do nothing ( filter will not be destroyed - we assume new params are compatible with old ones )
        filterWrapper.filterPromise.then(function (filter) {
            var shouldRefreshFilter = (filter === null || filter === void 0 ? void 0 : filter.refresh) ? filter.refresh(__assign(__assign(__assign({}, _this.createFilterParams(column, column.getColDef())), { filterModifiedCallback: _this.filterModifiedCallbackFactory(filter, column), filterChangedCallback: _this.filterChangedCallbackFactory(filter, column), doesRowPassOtherFilter: function (node) { return _this.doesRowPassOtherFilters(filter, node); } }), newFilterParams)) : true;
            if (!shouldRefreshFilter) {
                _this.destroyFilter(column, 'columnChanged');
            }
        });
    };
    FilterManager.prototype.setColumnFilterWrapper = function (column, filterWrapper) {
        var _this = this;
        var colId = column.getColId();
        this.allColumnFilters.set(colId, filterWrapper);
        this.allColumnListeners.set(colId, this.addManagedListener(column, column_1.Column.EVENT_COL_DEF_CHANGED, function () { return _this.checkDestroyFilter(colId); }));
    };
    FilterManager.prototype.areFilterCompsDifferent = function (oldCompDetails, newCompDetails) {
        if (!newCompDetails || !oldCompDetails) {
            return true;
        }
        var oldComponentClass = oldCompDetails.componentClass;
        var newComponentClass = newCompDetails.componentClass;
        var isSameComponentClass = oldComponentClass === newComponentClass ||
            // react hooks returns new wrappers, so check nested render method
            ((oldComponentClass === null || oldComponentClass === void 0 ? void 0 : oldComponentClass.render) && (newComponentClass === null || newComponentClass === void 0 ? void 0 : newComponentClass.render) &&
                oldComponentClass.render === newComponentClass.render);
        return !isSameComponentClass;
    };
    FilterManager.prototype.getAdvancedFilterModel = function () {
        return this.isAdvancedFilterEnabled() ? this.advancedFilterService.getModel() : null;
    };
    FilterManager.prototype.setAdvancedFilterModel = function (expression) {
        if (!this.isAdvancedFilterEnabled()) {
            return;
        }
        if (this.dataTypeService.isPendingInference()) {
            this.advancedFilterModelUpdateQueue.push(expression);
            return;
        }
        this.advancedFilterService.setModel(expression !== null && expression !== void 0 ? expression : null);
        this.onFilterChanged({ source: 'advancedFilter' });
    };
    FilterManager.prototype.showAdvancedFilterBuilder = function (source) {
        if (!this.isAdvancedFilterEnabled()) {
            return;
        }
        this.advancedFilterService.getCtrl().toggleFilterBuilder(source, true);
    };
    FilterManager.prototype.updateAdvancedFilterColumns = function () {
        if (!this.isAdvancedFilterEnabled()) {
            return;
        }
        if (this.advancedFilterService.updateValidity()) {
            this.onFilterChanged({ source: 'advancedFilter' });
        }
    };
    FilterManager.prototype.hasFloatingFilters = function () {
        if (this.isAdvancedFilterEnabled()) {
            return false;
        }
        var gridColumns = this.columnModel.getAllGridColumns();
        return gridColumns.some(function (col) { return col.getColDef().floatingFilter; });
    };
    FilterManager.prototype.getFilterInstance = function (key, callback) {
        if (this.isAdvancedFilterEnabled()) {
            this.warnAdvancedFilters();
            return undefined;
        }
        var res = this.getFilterInstanceImpl(key, function (instance) {
            if (!callback) {
                return;
            }
            var unwrapped = (0, gridApi_1.unwrapUserComp)(instance);
            callback(unwrapped);
        });
        var unwrapped = (0, gridApi_1.unwrapUserComp)(res);
        return unwrapped;
    };
    FilterManager.prototype.getFilterInstanceImpl = function (key, callback) {
        var column = this.columnModel.getPrimaryColumn(key);
        if (!column) {
            return undefined;
        }
        var filterPromise = this.getFilterComponent(column, 'NO_UI');
        var currentValue = filterPromise && filterPromise.resolveNow(null, function (filterComp) { return filterComp; });
        if (currentValue) {
            setTimeout(callback, 0, currentValue);
        }
        else if (filterPromise) {
            filterPromise.then(function (comp) {
                callback(comp);
            });
        }
        return currentValue;
    };
    FilterManager.prototype.warnAdvancedFilters = function () {
        (0, function_1.warnOnce)('Column Filter API methods have been disabled as Advanced Filters are enabled.');
    };
    FilterManager.prototype.setupAdvancedFilterHeaderComp = function (eCompToInsertBefore) {
        var _a;
        (_a = this.advancedFilterService) === null || _a === void 0 ? void 0 : _a.getCtrl().setupHeaderComp(eCompToInsertBefore);
    };
    FilterManager.prototype.getHeaderRowCount = function () {
        return this.isAdvancedFilterHeaderActive() ? 1 : 0;
    };
    FilterManager.prototype.getHeaderHeight = function () {
        return this.isAdvancedFilterHeaderActive() ? this.advancedFilterService.getCtrl().getHeaderHeight() : 0;
    };
    FilterManager.prototype.processFilterModelUpdateQueue = function () {
        var _this = this;
        this.filterModelUpdateQueue.forEach(function (_a) {
            var model = _a.model, source = _a.source;
            return _this.setFilterModel(model, source);
        });
        this.filterModelUpdateQueue = [];
        this.advancedFilterModelUpdateQueue.forEach(function (model) { return _this.setAdvancedFilterModel(model); });
        this.advancedFilterModelUpdateQueue = [];
    };
    FilterManager.prototype.destroy = function () {
        var _this = this;
        _super.prototype.destroy.call(this);
        this.allColumnFilters.forEach(function (filterWrapper) { return _this.disposeFilterWrapper(filterWrapper, 'gridDestroyed'); });
        // don't need to destroy the listeners as they are managed listeners
        this.allColumnListeners.clear();
    };
    __decorate([
        (0, context_1.Autowired)('valueService')
    ], FilterManager.prototype, "valueService", void 0);
    __decorate([
        (0, context_1.Autowired)('columnModel')
    ], FilterManager.prototype, "columnModel", void 0);
    __decorate([
        (0, context_1.Autowired)('rowModel')
    ], FilterManager.prototype, "rowModel", void 0);
    __decorate([
        (0, context_1.Autowired)('userComponentFactory')
    ], FilterManager.prototype, "userComponentFactory", void 0);
    __decorate([
        (0, context_1.Autowired)('rowRenderer')
    ], FilterManager.prototype, "rowRenderer", void 0);
    __decorate([
        (0, context_1.Autowired)('dataTypeService')
    ], FilterManager.prototype, "dataTypeService", void 0);
    __decorate([
        (0, context_1.Autowired)('quickFilterService')
    ], FilterManager.prototype, "quickFilterService", void 0);
    __decorate([
        (0, context_1.Optional)('advancedFilterService')
    ], FilterManager.prototype, "advancedFilterService", void 0);
    __decorate([
        context_1.PostConstruct
    ], FilterManager.prototype, "init", null);
    FilterManager = __decorate([
        (0, context_1.Bean)('filterManager')
    ], FilterManager);
    return FilterManager;
}(beanStub_1.BeanStub));
exports.FilterManager = FilterManager;
