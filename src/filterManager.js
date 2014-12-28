define([
    "./utils",
    "./filter",
    "css!./filter"
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
        var filterPresent = model!==null && model!==undefined && model.selectedValues.length!==model.uniqueValues.length;
        return filterPresent;
    };

    FilterManager.prototype.doesFilterPass = function (item) {
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
            model.selectedValues = model.uniqueValues.slice(0);
        }

        var ePopupParent = this.grid.getPopupParent();
        var filterComponent = filterComponentFactory(model, this.grid);
        var eFilterGui = filterComponent.getGui();

        var ePopup = eFilterGui.querySelector(".ag-advanced-filter");
        this.positionPopup(eventSource, ePopup, ePopupParent)

        utils.addModal(ePopupParent, eFilterGui);

        filterComponent.guiAttached();
    };

    return function(eBody) {
        return new FilterManager(eBody);
    };

});
