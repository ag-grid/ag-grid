define([
    "./utils",
    "./setFilter",
    "./textFilter"
], function(utils, SetFilter, StringFilter) {

    function FilterManager(grid, rowModel) {
        this.grid = grid;
        this.rowModel = rowModel;
        this.allFilters = {};
    }

    FilterManager.prototype.isFilterPresent = function () {
        return Object.keys(this.allFilters).length > 0;
    };

    FilterManager.prototype.isFilterPresentForCol = function (key) {
        var filter = this.allFilters[key];
        if (!filter) {
            return false;
        }
        if (!filter.isFilterActive) { // because users can do custom filters, give nice error message
            console.error('Filter is missing method isFilterActive');
        }
        var filterPresent = filter.isFilterActive();
        return filterPresent;
    };

    FilterManager.prototype.doesFilterPass = function (item) {
        var fields = Object.keys(this.allFilters);
        for (var i = 0, l = fields.length; i < l; i++) {

            var field = fields[i];
            var filter = this.allFilters[field];

            // if no filter, always pass
            if (filter===undefined) {
                continue;
            }

            var value = item[field];
            if (!filter.doesFilterPass) { // because users can do custom filters, give nice error message
                console.error('Filter is missing method doesFilterPass');
            }
            if (!filter.doesFilterPass(value)) {
                return false;
            }

        }
        // all filters passed
        return true;
    };

    FilterManager.prototype.onNewRowsLoaded = function() {
        var that = this;
        Object.keys(this.allFilters).forEach(function (field) {
            var filter = that.allFilters[field];
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
        var widthOfPopup = 200; //this is set in the css
        var widthOfParent = parentRect.right - parentRect.left;
        var maxX =  widthOfParent - widthOfPopup - 20; //20 pixels grace
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

        var filter = this.allFilters[colDef.field];

        if (!filter) {
            var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
            if (colDef.filter === 'text') {
                filter = new StringFilter(colDef, this.rowModel, filterChangedCallback);
            } else {
                filter = new SetFilter(colDef, this.rowModel, filterChangedCallback);
            }
            this.allFilters[colDef.field] = filter;
        }

        var ePopupParent = this.grid.getPopupParent();
        if (!filter.getGui) { // because users can do custom filters, give nice error message
            console.error('Filter is missing method getGui');
        }
        var eFilterGui = filter.getGui();

        this.positionPopup(eventSource, eFilterGui, ePopupParent);

        utils.addAsModalPopup(ePopupParent, eFilterGui);

        if (filter.afterGuiAttached) {
            filter.afterGuiAttached();
        }
    };

    return FilterManager;

});
