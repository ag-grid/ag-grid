define([
    "./../utils",
    "./filterComponent",
    "./filterModel"
], function(utils, filterComponentFactory, filterModelFactory) {

    function FilterManager(grid, rowModel) {
        this.grid = grid;
        this.rowModel = rowModel;
        this.colModels = {};
    }

    FilterManager.prototype.isFilterPresent = function () {
        return Object.keys(this.colModels).length > 0;
    };

    FilterManager.prototype.isFilterPresentForCol = function (key) {
        var model =  this.colModels[key];
        var filterPresent = model!==undefined && model.isFilterActive();
        return filterPresent;
    };

    FilterManager.prototype.doesFilterPass = function (item) {
        var fields = Object.keys(this.colModels);
        for (var i = 0, l = fields.length; i < l; i++) {

            var field = fields[i];
            var model = this.colModels[field];

            // if no filter, always pass
            if (model===undefined) {
                continue;
            }

            var value = item[field];
            if (!model.doesFilterPass(value)) {
                return false;
            }

        }
        // all filters passed
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

        // if popup is overflowing to the right, move it left
        var widthOfPopup = 200; //this is set in the css
        var widthOfParent = parentRect.right - parentRect.left;
        var maxX =  widthOfParent - widthOfPopup - 20; //20 pixels grace
        if (x > maxX) { //move position left, back into view
            x = maxX;
        }
        if (x < 0) { // in case the popup has a negative value
            x = 0;
        }

        ePopup.style.left = x + "px";
        ePopup.style.top = y + "px";
    };

    FilterManager.prototype.showFilter = function(colDef, eventSource) {

        var model = this.colModels[colDef.field];
        if (!model) {
            var rowData = this.rowModel.getAllRows();
            var uniqueValues = utils.uniqueValues(rowData, colDef.field);
            if (colDef.comparator) {
                uniqueValues.sort(colDef.comparator);
            } else {
                uniqueValues.sort(utils.defaultComparator);
            }
            model = filterModelFactory(uniqueValues);
            this.colModels[colDef.field] = model;
        }

        var ePopupParent = this.grid.getPopupParent();
        var filterComponent = filterComponentFactory(model, this.grid, colDef);
        var eFilterGui = filterComponent.getGui();

        this.positionPopup(eventSource, eFilterGui, ePopupParent);

        utils.addAsModalPopup(ePopupParent, eFilterGui);

        filterComponent.guiAttached();
    };

    return FilterManager;

});
