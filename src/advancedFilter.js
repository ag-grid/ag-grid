define([
    "./utils",
    "text!./advancedFilter.html",
    "css!./advancedFilter"
], function(utils, template) {

    function AdvancedFilter(grid) {
        this.grid = grid;
        this.colModels = {};
    }

    AdvancedFilter.prototype.isFilterPresent = function () {
        return Object.keys(this.colModels).length > 0;
    };

    AdvancedFilter.prototype.onSelectAll = function (model, eSelectAll, checkboxes) {
        var checked = eSelectAll.checked;
        if (checked) {
            model.selectedValues = model.uniqueValues.slice(0);
        } else {
            model.selectedValues.length = 0;
        }
        checkboxes.forEach(function (eCheckbox) {
            eCheckbox.checked = checked;
        });
        this.grid.onFilterChanged();
    };

    AdvancedFilter.prototype.doesFilterPass = function (item) {
        var fields = Object.keys(this.colModels);
        for (var i = 0, l = fields.length; i < l; i++) {
            var field = fields[i];
            var value = item[field];
            var filterFailed = this.colModels[field].selectedValues.indexOf(value) < 0;
            if (filterFailed) {
                return false;
            }
        }
        //all filters passed
        return true;
    };

    AdvancedFilter.prototype.onCheckboxClicked = function(eCheckbox, eSelectAll, model, value) {
        var checked = eCheckbox.checked;
        if (checked) {
            if (model.selectedValues.indexOf(value)<0) {
                model.selectedValues.push(value);
            }
            //if box arrays are same size, then everything is checked
            if (model.selectedValues.length==model.uniqueValues.length) {
                eSelectAll.indeterminate = false;
                eSelectAll.checked = true;
            } else {
                eSelectAll.indeterminate = true;
            }
        } else {
            utils.removeFromArray(model.selectedValues, value);
            //if set is empty, nothing is selected
            if (model.selectedValues.length==0) {
                eSelectAll.indeterminate = false;
                //eSelectAll.checked = true;
                eSelectAll.checked = false;
            } else {
                eSelectAll.indeterminate = true;
            }
        }

        this.grid.onFilterChanged();
    };

    AdvancedFilter.prototype.positionPopup = function(eventSource, ePopup, ePopupRoot) {
        var sourceRect = eventSource.getBoundingClientRect();
        var parentRect = ePopupRoot.getBoundingClientRect();

        var x = sourceRect.left - parentRect.left;
        var y = sourceRect.top - parentRect.top + sourceRect.height;

        ePopup.style.left = x + "px";
        ePopup.style.top = y + "px";
    };

    AdvancedFilter.prototype.showFilter = function(colDef, eventSource) {

        var ePopupRoot = this.grid.getPopupRoot();

        var ePopupParent = document.createElement("div");
        ePopupParent.innerHTML = template;

        var ePopup = ePopupParent.querySelector(".ag-advanced-filter");
        this.positionPopup(eventSource, ePopup, ePopupRoot)

        var model = this.colModels[colDef.field];
        if (!model) {
            model = {};
            this.colModels[colDef.field] = model;
            var rowData = this.grid.getRowData();
            model.uniqueValues = utils.uniqueValues(rowData, colDef.field);
            model.selectedValues = selectedValues = model.uniqueValues.slice(0);
        }

        var eFilterValues = ePopupParent.querySelector(".ag-advanced-filter-list");
        var eFilterValueTemplate = eFilterValues.querySelector("#itemForRepeat");
        eFilterValues.removeChild(eFilterValueTemplate);

        var checkboxes = [];

        var eSelectAll = ePopupParent.querySelector("#selectAll");
        eSelectAll.onclick = function() { _this.onSelectAll(model, eSelectAll, checkboxes); };
        if (model.uniqueValues.length==model.selectedValues.length) {
            eSelectAll.indeterminate = false;
            eSelectAll.checked = true;
        } else if (model.selectedValues.length==0) {
            eSelectAll.indeterminate = false;
            eSelectAll.checked = false;
        } else {
            eSelectAll.indeterminate = true;
        }

        var _this = this;
        model.uniqueValues.forEach(function(value) {
            var eFilterValue = eFilterValueTemplate.cloneNode(true);
            eFilterValue.querySelector(".ag-advanced-filter-value").innerText = value;
            var eCheckbox = eFilterValue.querySelector("input");
            eCheckbox.checked = model.selectedValues.indexOf(value)>=0;

            eCheckbox.onclick = function() { _this.onCheckboxClicked(eCheckbox, eSelectAll, model, value); };

            eFilterValues.appendChild(eFilterValue);
            checkboxes.push(eCheckbox);
        });

        var eBackdrop = ePopupParent.querySelector(".ag-popup-backdrop");

        eBackdrop.onclick = function() {
            ePopupRoot.removeChild(ePopupParent);
        };

        ePopupRoot.appendChild(ePopupParent);
    };

    return function(eBody) {
        return new AdvancedFilter(eBody);
    };

});