var utils = require('./../utils');
var SetFilter = require('./setFilter');
var NumberFilter = require('./numberFilter');
var StringFilter = require('./textFilter');

function FilterManager() {}

FilterManager.prototype.init = function(grid, gridOptionsWrapper, $compile, $scope, expressionService, columnModel) {
    this.$compile = $compile;
    this.$scope = $scope;
    this.gridOptionsWrapper = gridOptionsWrapper;
    this.grid = grid;
    this.allFilters = {};
    this.expressionService = expressionService;
    this.columnModel = columnModel;
};

FilterManager.prototype.setFilterModel = function(model) {
    var that = this;
    if (model) {
        // mark the filters as we set them, so any active filters left over we stop
        var processedFields = Object.keys(model);
        utils.iterateObject(this.allFilters, function(key, filterWrapper) {
            var field = filterWrapper.column.colDef.field;
            utils.removeFromArray(processedFields, field);
            if (field) {
                var newModel = model[field];
                that.setModelOnFilterWrapper(filterWrapper.filter, newModel);
            } else {
                console.warn('Warning ag-grid - no field found for column while doing setFilterModel');
            }
        });
        // at this point, processedFields contains data for which we don't have a filter working yet
        utils.iterateArray(processedFields, function(field) {
            var column = that.columnModel.getColumn(field);
            if (!column) {
                console.warn('Warning ag-grid - no column found for field ' + field);
                return;
            }
            var filterWrapper = that.getOrCreateFilterWrapper(column);
            that.setModelOnFilterWrapper(filterWrapper.filter, model[field]);
        });
    } else {
        utils.iterateObject(this.allFilters, function(key, filterWrapper) {
            that.setModelOnFilterWrapper(filterWrapper.filter, null);
        });
    }
};

FilterManager.prototype.setModelOnFilterWrapper = function(filter, newModel) {
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

FilterManager.prototype.getFilterModel = function() {
    var result = {};
    utils.iterateObject(this.allFilters, function(key, filterWrapper) {
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
            var field = filterWrapper.column.colDef.field;
            if (!field) {
                console.warn('Warning ag-grid - cannot get filter model when no field value present for column');
            } else {
                result[field] = model;
            }
        }
    });
    return result;
};

FilterManager.prototype.setRowModel = function(rowModel) {
    this.rowModel = rowModel;
};

// returns true if at least one filter is active
FilterManager.prototype.isFilterPresent = function() {
    var atLeastOneActive = false;
    var that = this;

    var keys = Object.keys(this.allFilters);
    keys.forEach(function(key) {
        var filterWrapper = that.allFilters[key];
        if (!filterWrapper.filter.isFilterActive) { // because users can do custom filters, give nice error message
            console.error('Filter is missing method isFilterActive');
        }
        if (filterWrapper.filter.isFilterActive()) {
            atLeastOneActive = true;
        }
    });
    return atLeastOneActive;
};

// returns true if given col has a filter active
FilterManager.prototype.isFilterPresentForCol = function(colKey) {
    var filterWrapper = this.allFilters[colKey];
    if (!filterWrapper) {
        return false;
    }
    if (!filterWrapper.filter.isFilterActive) { // because users can do custom filters, give nice error message
        console.error('Filter is missing method isFilterActive');
    }
    var filterPresent = filterWrapper.filter.isFilterActive();
    return filterPresent;
};

FilterManager.prototype.doesFilterPass = function(node) {
    var data = node.data;
    var colKeys = Object.keys(this.allFilters);
    for (var i = 0, l = colKeys.length; i < l; i++) { // critical code, don't use functional programming

        var colKey = colKeys[i];
        var filterWrapper = this.allFilters[colKey];

        // if no filter, always pass
        if (filterWrapper === undefined) {
            continue;
        }

        if (!filterWrapper.filter.doesFilterPass) { // because users can do custom filters, give nice error message
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

FilterManager.prototype.onNewRowsLoaded = function() {
    var that = this;
    Object.keys(this.allFilters).forEach(function(field) {
        var filter = that.allFilters[field].filter;
        if (filter.onNewRowsLoaded) {
            filter.onNewRowsLoaded();
        }
    });
};

FilterManager.prototype.positionPopup = function(eventSource, ePopup, ePopupRoot) {
    var sourceRect = eventSource.getBoundingClientRect();
    var parentRect = ePopupRoot.getBoundingClientRect();

    var x = sourceRect.left - parentRect.left;
    var y = sourceRect.top - parentRect.top + sourceRect.height;

    // if popup is overflowing to the right, move it left
    var widthOfPopup = 200; // this is set in the css
    var widthOfParent = parentRect.right - parentRect.left;
    var maxX = widthOfParent - widthOfPopup - 20; // 20 pixels grace
    if (x > maxX) { // move position left, back into view
        x = maxX;
    }
    if (x < 0) { // in case the popup has a negative value
        x = 0;
    }

    ePopup.style.left = x + "px";
    ePopup.style.top = y + "px";
};

FilterManager.prototype.createValueGetter = function(colDef) {
    var that = this;
    return function valueGetter(node) {
        var api = that.gridOptionsWrapper.getApi();
        var context = that.gridOptionsWrapper.getContext();
        return utils.getValue(that.expressionService, node.data, colDef, node, api, context);
    };
};

FilterManager.prototype.getFilterApi = function(column) {
    var filterWrapper = this.getOrCreateFilterWrapper(column);
    if (filterWrapper) {
        if (typeof filterWrapper.filter.getApi === 'function') {
            return filterWrapper.filter.getApi();
        }
    }
};

FilterManager.prototype.getOrCreateFilterWrapper = function(column) {
    var filterWrapper = this.allFilters[column.colKey];

    if (!filterWrapper) {
        filterWrapper = this.createFilterWrapper(column);
        this.allFilters[column.colKey] = filterWrapper;
    }

    return filterWrapper;
};

FilterManager.prototype.createFilterWrapper = function(column) {
    var colDef = column.colDef;

    var filterWrapper = {
        column: column
    };
    var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
    var filterParams = colDef.filterParams;
    var params = {
        colDef: colDef,
        rowModel: this.rowModel,
        filterChangedCallback: filterChangedCallback,
        filterParams: filterParams,
        localeTextFunc: this.gridOptionsWrapper.getLocaleTextFunc(),
        valueGetter: this.createValueGetter(colDef)
    };
    if (typeof colDef.filter === 'function') {
        // if user provided a filter, just use it
        // first up, create child scope if needed
        if (this.gridOptionsWrapper.isAngularCompileFilters()) {
            var scope = this.$scope.$new();
            filterWrapper.scope = scope;
            params.$scope = scope;
        }
        // now create filter
        filterWrapper.filter = new colDef.filter(params);
    } else if (colDef.filter === 'text') {
        filterWrapper.filter = new StringFilter(params);
    } else if (colDef.filter === 'number') {
        filterWrapper.filter = new NumberFilter(params);
    } else {
        filterWrapper.filter = new SetFilter(params);
    }

    if (!filterWrapper.filter.getGui) { // because users can do custom filters, give nice error message
        throw 'Filter is missing method getGui';
    }

    var eFilterGui = document.createElement('div');
    eFilterGui.className = 'ag-filter';
    var guiFromFilter = filterWrapper.filter.getGui();
    if (utils.isNodeOrElement(guiFromFilter)) {
        //a dom node or element was returned, so add child
        eFilterGui.appendChild(guiFromFilter);
    } else {
        //otherwise assume it was html, so just insert
        var eTextSpan = document.createElement('span');
        eTextSpan.innerHTML = guiFromFilter;
        eFilterGui.appendChild(eTextSpan);
    }

    if (filterWrapper.scope) {
        filterWrapper.gui = this.$compile(eFilterGui)(filterWrapper.scope)[0];
    } else {
        filterWrapper.gui = eFilterGui;
    }

    return filterWrapper;
};

FilterManager.prototype.showFilter = function(column, eventSource) {

    var filterWrapper = this.getOrCreateFilterWrapper(column);

    var ePopupParent = this.grid.getPopupParent();
    this.positionPopup(eventSource, filterWrapper.gui, ePopupParent);

    utils.addAsModalPopup(ePopupParent, filterWrapper.gui);

    if (filterWrapper.filter.afterGuiAttached) {
        filterWrapper.filter.afterGuiAttached();
    }
};

module.exports = FilterManager;
