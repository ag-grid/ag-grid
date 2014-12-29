define([
    "./utils",
    "./filterComponent",
    "css!./filter.css"
], function(utils, filterComponentFactory) {

    function FilterManager(grid) {
        this.grid = grid;
        this.colModels = {};
    }

    FilterManager.prototype.isFilterPresent = function () {
        return Object.keys(this.colModels).length > 0;
    };

    FilterManager.prototype.isFilterPresentForCol = function (key) {
        var model =  this.colModels[key];
        var filterPresent = model!==null && model!==undefined && model.selectedValuesCount!==model.uniqueValues.length;
        return filterPresent;
    };

    FilterManager.prototype.doesFilterPass = function (item) {
        var fields = Object.keys(this.colModels);
        for (var i = 0, l = fields.length; i < l; i++) {
            var field = fields[i];
            var model = this.colModels[field];
            //if no filter, always pass
            if (model.uniqueValues.length==model.selectedValuesCount) { continue; }
            //if nothing selected in filter, always fail
            if (model.uniqueValues.length==0) { return false; }

            var value = item[field];
            if (value==="") { value = null; }
            var filterFailed = model.selectedValuesMap[value]===undefined;
            if (filterFailed) {
                return false;
            }
        }
        //all filters passed
        return true;
    };

    FilterManager.prototype.clearAllFilters = function() {
        this.colModels = {};
    };

    FilterManager.prototype.positionPopup = function(eventSource, ePopup, ePopupRoot) {
        var sourceRect = eventSource.getBoundingClientRect();
        var parentRect = ePopupRoot.getBoundingClientRect();

        var x = sourceRect.left - parentRect.left;
        var y = sourceRect.top - parentRect.top + sourceRect.height;

        ePopup.style.left = x + "px";
        ePopup.style.top = y + "px";
    };

    FilterManager.prototype.showFilter = function(colDef, eventSource) {

        var model = this.colModels[colDef.field];
        if (!model) {
            model = {};
            this.colModels[colDef.field] = model;
            var rowData = this.grid.getRowData();
            model.uniqueValues = utils.uniqueValues(rowData, colDef.field);
            //we use a map rather than an array for the selected values as the lookup
            //for a map is much faster than the lookup for an array, especially when
            //the length of the array is thousands of records long
            model.selectedValuesMap = {};
            model.uniqueValues.forEach(function(value) {
                model.selectedValuesMap[value] = null;
            });
            model.selectedValuesCount = model.uniqueValues.length;
        }

        var ePopupParent = this.grid.getPopupParent();
        var filterComponent = filterComponentFactory(model, this.grid);
        var eFilterGui = filterComponent.getGui();

        this.positionPopup(eventSource, eFilterGui, ePopupParent)

        utils.addAsModalPopup(ePopupParent, eFilterGui);

        filterComponent.guiAttached();
    };

    return function(eBody) {
        return new FilterManager(eBody);
    };

});
