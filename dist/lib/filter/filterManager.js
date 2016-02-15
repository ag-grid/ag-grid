/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var textFilter_1 = require("./textFilter");
var numberFilter_1 = require("./numberFilter");
var setFilter_1 = require("./setFilter");
var FilterManager = (function () {
    function FilterManager() {
    }
    FilterManager.prototype.init = function (grid, gridOptionsWrapper, $compile, $scope, columnController, popupService, valueService) {
        this.$compile = $compile;
        this.$scope = $scope;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.grid = grid;
        this.allFilters = {};
        this.columnController = columnController;
        this.popupService = popupService;
        this.valueService = valueService;
        this.columnController = columnController;
        this.quickFilter = null;
    };
    FilterManager.prototype.setFilterModel = function (model) {
        var _this = this;
        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            var modelKeys = Object.keys(model);
            utils_1.default.iterateObject(this.allFilters, function (colId, filterWrapper) {
                utils_1.default.removeFromArray(modelKeys, colId);
                var newModel = model[colId];
                _this.setModelOnFilterWrapper(filterWrapper.filter, newModel);
            });
            // at this point, processedFields contains data for which we don't have a filter working yet
            utils_1.default.iterateArray(modelKeys, function (colId) {
                var column = _this.columnController.getColumn(colId);
                if (!column) {
                    console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
                    return;
                }
                var filterWrapper = _this.getOrCreateFilterWrapper(column);
                _this.setModelOnFilterWrapper(filterWrapper.filter, model[colId]);
            });
        }
        else {
            utils_1.default.iterateObject(this.allFilters, function (key, filterWrapper) {
                _this.setModelOnFilterWrapper(filterWrapper.filter, null);
            });
        }
        this.grid.onFilterChanged();
    };
    FilterManager.prototype.setModelOnFilterWrapper = function (filter, newModel) {
        // because user can provide filters, we provide useful error checking and messages
        if (typeof filter.getApi !== 'function') {
            console.warn('Warning ag-grid - filter missing getApi method, which is needed for getFilterModel');
            return;
        }
        var filterApi = filter.getApi();
        if (typeof filterApi.setModel !== 'function') {
            console.warn('Warning ag-grid - filter API missing setModel method, which is needed for setFilterModel');
            return;
        }
        filterApi.setModel(newModel);
    };
    FilterManager.prototype.getFilterModel = function () {
        var result = {};
        utils_1.default.iterateObject(this.allFilters, function (key, filterWrapper) {
            // because user can provide filters, we provide useful error checking and messages
            if (typeof filterWrapper.filter.getApi !== 'function') {
                console.warn('Warning ag-grid - filter missing getApi method, which is needed for getFilterModel');
                return;
            }
            var filterApi = filterWrapper.filter.getApi();
            if (typeof filterApi.getModel !== 'function') {
                console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
                return;
            }
            var model = filterApi.getModel();
            if (model) {
                result[key] = model;
            }
        });
        return result;
    };
    FilterManager.prototype.setRowModel = function (rowModel) {
        this.rowModel = rowModel;
    };
    // returns true if any advanced filter (ie not quick filter) active
    FilterManager.prototype.isAdvancedFilterPresent = function () {
        var atLeastOneActive = false;
        utils_1.default.iterateObject(this.allFilters, function (key, filterWrapper) {
            if (!filterWrapper.filter.isFilterActive) {
                console.error('Filter is missing method isFilterActive');
            }
            if (filterWrapper.filter.isFilterActive()) {
                atLeastOneActive = true;
            }
        });
        return atLeastOneActive;
    };
    // returns true if quickFilter or advancedFilter
    FilterManager.prototype.isAnyFilterPresent = function () {
        return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
    };
    // returns true if given col has a filter active
    FilterManager.prototype.isFilterPresentForCol = function (colId) {
        var filterWrapper = this.allFilters[colId];
        if (!filterWrapper) {
            return false;
        }
        if (!filterWrapper.filter.isFilterActive) {
            console.error('Filter is missing method isFilterActive');
        }
        var filterPresent = filterWrapper.filter.isFilterActive();
        return filterPresent;
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
            if (filterWrapper.filter === filterToSkip) {
                continue;
            }
            // don't bother with filters that are not active
            if (!filterWrapper.filter.isFilterActive()) {
                continue;
            }
            if (!filterWrapper.filter.doesFilterPass) {
                console.error('Filter is missing method doesFilterPass');
            }
            var params = {
                node: node,
                data: data
            };
            if (!filterWrapper.filter.doesFilterPass(params)) {
                return false;
            }
        }
        // all filters passed
        return true;
    };
    // returns true if it has changed (not just same value again)
    FilterManager.prototype.setQuickFilter = function (newFilter) {
        if (newFilter === undefined || newFilter === "") {
            newFilter = null;
        }
        if (this.quickFilter !== newFilter) {
            if (this.gridOptionsWrapper.isVirtualPaging()) {
                console.warn('ag-grid: cannot do quick filtering when doing virtual paging');
                return;
            }
            //want 'null' to mean to filter, so remove undefined and empty string
            if (newFilter === undefined || newFilter === "") {
                newFilter = null;
            }
            if (newFilter !== null) {
                newFilter = newFilter.toUpperCase();
            }
            this.quickFilter = newFilter;
            return true;
        }
        else {
            return false;
        }
    };
    FilterManager.prototype.onFilterChanged = function () {
        this.advancedFilterPresent = this.isAdvancedFilterPresent();
        this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
        utils_1.default.iterateObject(this.allFilters, function (key, filterWrapper) {
            if (filterWrapper.filter.onAnyFilterChanged) {
                filterWrapper.filter.onAnyFilterChanged();
            }
        });
    };
    FilterManager.prototype.isQuickFilterPresent = function () {
        return this.quickFilter !== null;
    };
    FilterManager.prototype.doesRowPassOtherFilters = function (filterToSkip, node) {
        return this.doesRowPassFilter(node, filterToSkip);
    };
    FilterManager.prototype.doesRowPassFilter = function (node, filterToSkip) {
        //first up, check quick filter
        if (this.isQuickFilterPresent()) {
            if (!node.quickFilterAggregateText) {
                this.aggregateRowForQuickFilter(node);
            }
            if (node.quickFilterAggregateText.indexOf(this.quickFilter) < 0) {
                //quick filter fails, so skip item
                return false;
            }
        }
        //secondly, give the client a chance to reject this row
        if (this.externalFilterPresent) {
            if (!this.gridOptionsWrapper.doesExternalFilterPass(node)) {
                return false;
            }
        }
        //lastly, check our internal advanced filter
        if (this.advancedFilterPresent) {
            if (!this.doesFilterPass(node, filterToSkip)) {
                return false;
            }
        }
        //got this far, all filters pass
        return true;
    };
    FilterManager.prototype.aggregateRowForQuickFilter = function (node) {
        var aggregatedText = '';
        var that = this;
        this.columnController.getAllColumns().forEach(function (column) {
            var data = node.data;
            var value = that.valueService.getValue(column.getColDef(), data, node);
            if (value && value !== '') {
                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
            }
        });
        node.quickFilterAggregateText = aggregatedText;
    };
    FilterManager.prototype.onNewRowsLoaded = function () {
        var that = this;
        Object.keys(this.allFilters).forEach(function (field) {
            var filter = that.allFilters[field].filter;
            if (filter.onNewRowsLoaded) {
                filter.onNewRowsLoaded();
            }
        });
    };
    FilterManager.prototype.createValueGetter = function (column) {
        var that = this;
        return function valueGetter(node) {
            return that.valueService.getValue(column.getColDef(), node.data, node);
        };
    };
    FilterManager.prototype.getFilterApi = function (column) {
        var filterWrapper = this.getOrCreateFilterWrapper(column);
        if (filterWrapper) {
            if (typeof filterWrapper.filter.getApi === 'function') {
                return filterWrapper.filter.getApi();
            }
        }
    };
    FilterManager.prototype.getOrCreateFilterWrapper = function (column) {
        var filterWrapper = this.allFilters[column.getColId()];
        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column);
            this.allFilters[column.getColId()] = filterWrapper;
        }
        return filterWrapper;
    };
    FilterManager.prototype.createFilterWrapper = function (column) {
        var colDef = column.getColDef();
        var filterWrapper = {
            column: column,
            filter: null,
            scope: null,
            gui: null
        };
        if (typeof colDef.filter === 'function') {
            // if user provided a filter, just use it
            // first up, create child scope if needed
            if (this.gridOptionsWrapper.isAngularCompileFilters()) {
                filterWrapper.scope = this.$scope.$new();
            }
            // now create filter (had to cast to any to get 'new' working)
            this.assertMethodHasNoParameters(colDef.filter);
            filterWrapper.filter = new colDef.filter();
        }
        else if (colDef.filter === 'text') {
            filterWrapper.filter = new textFilter_1.default();
        }
        else if (colDef.filter === 'number') {
            filterWrapper.filter = new numberFilter_1.default();
        }
        else {
            filterWrapper.filter = new setFilter_1.default();
        }
        var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
        var filterModifiedCallback = this.grid.onFilterModified.bind(this.grid);
        var doesRowPassOtherFilters = this.doesRowPassOtherFilters.bind(this, filterWrapper.filter);
        var filterParams = colDef.filterParams;
        var params = {
            colDef: colDef,
            rowModel: this.rowModel,
            filterChangedCallback: filterChangedCallback,
            filterModifiedCallback: filterModifiedCallback,
            filterParams: filterParams,
            localeTextFunc: this.gridOptionsWrapper.getLocaleTextFunc(),
            valueGetter: this.createValueGetter(column),
            doesRowPassOtherFilter: doesRowPassOtherFilters,
            context: this.gridOptionsWrapper.getContext,
            $scope: filterWrapper.scope
        };
        if (!filterWrapper.filter.init) {
            throw 'Filter is missing method init';
        }
        filterWrapper.filter.init(params);
        if (!filterWrapper.filter.getGui) {
            throw 'Filter is missing method getGui';
        }
        var eFilterGui = document.createElement('div');
        eFilterGui.className = 'ag-filter';
        var guiFromFilter = filterWrapper.filter.getGui();
        if (utils_1.default.isNodeOrElement(guiFromFilter)) {
            //a dom node or element was returned, so add child
            eFilterGui.appendChild(guiFromFilter);
        }
        else {
            //otherwise assume it was html, so just insert
            var eTextSpan = document.createElement('span');
            eTextSpan.innerHTML = guiFromFilter;
            eFilterGui.appendChild(eTextSpan);
        }
        if (filterWrapper.scope) {
            filterWrapper.gui = this.$compile(eFilterGui)(filterWrapper.scope)[0];
        }
        else {
            filterWrapper.gui = eFilterGui;
        }
        return filterWrapper;
    };
    FilterManager.prototype.destroy = function () {
        utils_1.default.iterateObject(this.allFilters, function (key, filterWrapper) {
            if (filterWrapper.filter.destroy) {
                filterWrapper.filter.destroy();
            }
        });
    };
    FilterManager.prototype.assertMethodHasNoParameters = function (theMethod) {
        var getRowsParams = utils_1.default.getFunctionParameters(theMethod);
        if (getRowsParams.length > 0) {
            console.warn('ag-grid: It looks like your filter is of the old type and expecting parameters in the constructor.');
            console.warn('ag-grid: From ag-grid 1.14, the constructor should take no parameters and init() used instead.');
        }
    };
    FilterManager.prototype.showFilter = function (column, eventSource) {
        var filterWrapper = this.getOrCreateFilterWrapper(column);
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(filterWrapper.gui, true);
        this.popupService.positionPopup(eventSource, filterWrapper.gui, true);
        if (filterWrapper.filter.afterGuiAttached) {
            var params = {
                hidePopup: hidePopup,
                eventSource: eventSource
            };
            filterWrapper.filter.afterGuiAttached(params);
        }
    };
    return FilterManager;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FilterManager;
