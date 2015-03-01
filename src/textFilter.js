define([
    './utils',
    'text!./textFilter.html'
], function(utils, template) {

    function TextFilter(colDef, rowModel, filterChangedCallback) {
        this.filterChangedCallback = filterChangedCallback;
        this.createGui();
    }

    /* public */
    TextFilter.prototype.afterGuiAttached = function() {
        this.eFilterTextField.focus();
    };

    /* public */
    TextFilter.prototype.doesFilterPass = function (value) {
        if (!this.filterText) {
            return true;
        }
        if (!value) {
            return false;
        }
        var indexOfFilter = value.toString().toLowerCase().indexOf(this.filterText);
        return indexOfFilter >= 0;
    };

    /* public */
    TextFilter.prototype.getGui = function () {
        return this.eGui;
    };

    /* public */
    TextFilter.prototype.isFilterActive = function() {
        return this.filterText !== null;
    };

    TextFilter.prototype.createGui = function () {
        var _this = this;

        this.eGui = utils.loadTemplate(template);

        this.eFilterTextField = this.eGui.querySelector(".ag-filter-filter");

        utils.addChangeListener(this.eFilterTextField, function() {_this.onFilterChanged();} );
    };

    TextFilter.prototype.onFilterChanged = function () {
        var filterText = utils.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        if (filterText) {
            this.filterText = filterText.toLowerCase();
        } else {
            this.filterText = null;
        }
        this.filterChangedCallback();
    };

    return TextFilter;

});