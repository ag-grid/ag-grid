define([
    "./../utils",
    "./setFilter",
    "./numberFilter",
    "./textFilter"
], function(utils, SetFilter, NumberFilter, StringFilter) {

    function FilterManager(grid, rowModel, gridOptionsWrapper, $compile, $scope) {
        this.$compile = $compile;
        this.$scope = $scope;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.grid = grid;
        this.rowModel = rowModel;
        this.allFilters = {};
    }

    // returns true if at least one filter is active
    FilterManager.prototype.isFilterPresent = function () {
        var atLeastOneActive = false;
        var that = this;

        var keys = Object.keys(this.allFilters);
        keys.forEach( function (key) {
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
    FilterManager.prototype.isFilterPresentForCol = function (colKey) {
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

    FilterManager.prototype.doesFilterPass = function (node) {
        var data = node.data;
        var colKeys = Object.keys(this.allFilters);
        for (var i = 0, l = colKeys.length; i < l; i++) { // critical code, don't use functional programming

            var colKey = colKeys[i];
            var filterWrapper = this.allFilters[colKey];

            // if no filter, always pass
            if (filterWrapper === undefined) {
                continue;
            }

            var value = data[filterWrapper.field];
            if (!filterWrapper.filter.doesFilterPass) { // because users can do custom filters, give nice error message
                console.error('Filter is missing method doesFilterPass');
            }
            var model;
            // if model is exposed, grab it
            if (filterWrapper.filter.getModel) {
                model = filterWrapper.filter.getModel();
            }
            var params = {
                value: value,
                model: model,
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
        Object.keys(this.allFilters).forEach(function (field) {
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
        var maxX =  widthOfParent - widthOfPopup - 20; // 20 pixels grace
        if (x > maxX) { // move position left, back into view
            x = maxX;
        }
        if (x < 0) { // in case the popup has a negative value
            x = 0;
        }

        ePopup.style.left = x + "px";
        ePopup.style.top = y + "px";
    };

    FilterManager.prototype.showFilter = function(colDefWrapper, eventSource) {

        var filterWrapper = this.allFilters[colDefWrapper.colKey];
        var colDef = colDefWrapper.colDef;

        if (!filterWrapper) {
            filterWrapper = {
                colKey: colDefWrapper.colKey,
                field: colDef.field
            };
            var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
            var filterParams = colDef.filterParams;
            var params = {
                colDef: colDef,
                rowModel: this.rowModel,
                filterChangedCallback: filterChangedCallback,
                filterParams: filterParams,
                scope: filterWrapper.scope
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
            this.allFilters[colDefWrapper.colKey] = filterWrapper;

            if (!filterWrapper.filter.getGui) { // because users can do custom filters, give nice error message
                console.error('Filter is missing method getGui');
            }

            var eFilterGui = document.createElement('div');
            eFilterGui.className = 'ag-filter';
            var guiFromFilter = filterWrapper.filter.getGui();
            if (utils.isNode(guiFromFilter) || utils.isElement(guiFromFilter)) {
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

        }

        var ePopupParent = this.grid.getPopupParent();
        this.positionPopup(eventSource, filterWrapper.gui, ePopupParent);

        utils.addAsModalPopup(ePopupParent, filterWrapper.gui);

        if (filterWrapper.filter.afterGuiAttached) {
            filterWrapper.filter.afterGuiAttached();
        }
    };

    return FilterManager;

});
