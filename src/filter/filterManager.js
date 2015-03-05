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

    FilterManager.prototype.isFilterPresent = function () {
        return Object.keys(this.allFilters).length > 0;
    };

    FilterManager.prototype.isFilterPresentForCol = function (key) {
        var filterWrapper = this.allFilters[key];
        if (!filterWrapper) {
            return false;
        }
        if (!filterWrapper.filter.isFilterActive) { // because users can do custom filters, give nice error message
            console.error('Filter is missing method isFilterActive');
        }
        var filterPresent = filterWrapper.filter.isFilterActive();
        return filterPresent;
    };

    FilterManager.prototype.doesFilterPass = function (item) {
        var fields = Object.keys(this.allFilters);
        for (var i = 0, l = fields.length; i < l; i++) {

            var field = fields[i];
            var filterWrapper = this.allFilters[field];

            // if no filter, always pass
            if (filterWrapper===undefined) {
                continue;
            }

            var value = item[field];
            if (!filterWrapper.filter.doesFilterPass) { // because users can do custom filters, give nice error message
                console.error('Filter is missing method doesFilterPass');
            }
            var model;
            // if model is exposed, grab it
            if (filterWrapper.filter.getModel) {
                model = filterWrapper.filter.getModel();
            }
            if (!filterWrapper.filter.doesFilterPass(value, model)) {
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

    FilterManager.prototype.showFilter = function(colDef, eventSource) {

        var filterWrapper = this.allFilters[colDef.field];
        var newChildScope;

        if (!filterWrapper) {
            filterWrapper = {};
            var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
            var filterParams = colDef.filterParams;
            if (typeof colDef.filter === 'function') {
                // if user provided a filter, just use it
                // first up, create child scope if needed
                if (this.gridOptionsWrapper.isAngularCompileFilters()) {
                    filterWrapper.scope = this.$scope.$new();
                }
                // now create filter
                filterWrapper.filter = new colDef.filter(colDef, this.rowModel, filterChangedCallback, filterParams, filterWrapper.scope);
            } else if (colDef.filter === 'text') {
                filterWrapper.filter = new StringFilter(colDef, this.rowModel, filterChangedCallback, filterParams);
            } else if (colDef.filter === 'number') {
                filterWrapper.filter = new NumberFilter(colDef, this.rowModel, filterChangedCallback, filterParams);
            } else {
                filterWrapper.filter = new SetFilter(colDef, this.rowModel, filterChangedCallback, filterParams);
            }
            this.allFilters[colDef.field] = filterWrapper;

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
