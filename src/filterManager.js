define([
    "./utils",
    "./filter",
    "css!./filter"
], function(utils, advancedFilterFactory) {

    function AdvancedFilterManager(grid) {
        this.grid = grid;
        this.colModels = {};
    }

    AdvancedFilterManager.prototype.isFilterPresent = function () {
        return Object.keys(this.colModels).length > 0;
    };

    AdvancedFilterManager.prototype.isFilterPresentForCol = function (key) {
        var model =  this.colModels[key];
        var filterPresent = model!==null && model!==undefined && model.selectedValues.length!==model.uniqueValues.length;
        return filterPresent;
    };

    AdvancedFilterManager.prototype.doesFilterPass = function (item) {
        var fields = Object.keys(this.colModels);
        for (var i = 0, l = fields.length; i < l; i++) {
            var field = fields[i];
            var value = item[field];
            if (value==="") { value = null; }
            var filterFailed = this.colModels[field].selectedValues.indexOf(value) < 0;
            if (filterFailed) {
                return false;
            }
        }
        //all filters passed
        return true;
    };

    AdvancedFilterManager.prototype.clearAllFilters = function() {
        this.colModels = {};
    };

    AdvancedFilterManager.prototype.positionPopup = function(eventSource, ePopup, ePopupRoot) {
        var sourceRect = eventSource.getBoundingClientRect();
        var parentRect = ePopupRoot.getBoundingClientRect();

        var x = sourceRect.left - parentRect.left;
        var y = sourceRect.top - parentRect.top + sourceRect.height;

        ePopup.style.left = x + "px";
        ePopup.style.top = y + "px";
    };

    AdvancedFilterManager.prototype.showFilter = function(colDef, eventSource) {

        var model = this.colModels[colDef.field];
        if (!model) {
            model = {};
            this.colModels[colDef.field] = model;
            var rowData = this.grid.getRowData();
            model.uniqueValues = utils.uniqueValues(rowData, colDef.field);
            model.selectedValues = model.uniqueValues.slice(0);
        }

        var ePopupRoot = this.grid.getPopupRoot();
        var advancedFilter = advancedFilterFactory(model, this.grid);
        var eAdvancedFilterGui = advancedFilter.getGui();

        var ePopup = eAdvancedFilterGui.querySelector(".ag-advanced-filter");
        this.positionPopup(eventSource, ePopup, ePopupRoot)

        var eBackdrop = eAdvancedFilterGui.querySelector(".ag-popup-backdrop");

        eBackdrop.onclick = function() {
            ePopupRoot.removeChild(eAdvancedFilterGui);
        };

        ePopupRoot.appendChild(eAdvancedFilterGui);
        advancedFilter.guiAttached();
    };

    return function(eBody) {
        return new AdvancedFilterManager(eBody);
    };

});