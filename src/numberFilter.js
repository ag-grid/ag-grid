define([
    './utils',
    'text!./numberFilter.html'
], function(utils, template) {

    var EQUALS = 1;
    var LESS_THAN = 2;
    var GREATER_THAN = 3;

    function NumberFilter(colDef, rowModel, filterChangedCallback) {
        this.filterChangedCallback = filterChangedCallback;
        this.createGui();
        this.filterNumber = null;
        this.filterType = EQUALS;
    }

    /* public */
    NumberFilter.prototype.afterGuiAttached = function() {
        this.eFilterTextField.focus();
    };

    /* public */
    NumberFilter.prototype.doesFilterPass = function (value) {
        if (this.filterNumber === null) {
            return true;
        }
        if (!value) {
            return false;
        }

        var valueAsNumber;
        if (typeof value === 'number') {
            valueAsNumber = value;
        } else {
            valueAsNumber = parseInt(value);
        }

        switch (this.filterType) {
            case EQUALS :
                return valueAsNumber === this.filterNumber;
            case LESS_THAN :
                return valueAsNumber <= this.filterNumber;
            case GREATER_THAN :
                return valueAsNumber >= this.filterNumber;
            default :
                // should never happen
                console.log('invalid filter type ' + this.filterType);
                return false;
        }
    };

    /* public */
    NumberFilter.prototype.getGui = function () {
        return this.eGui;
    };

    /* public */
    NumberFilter.prototype.isFilterActive = function() {
        return this.filterNumber !== null;
    };

    NumberFilter.prototype.createGui = function () {
        this.eGui = utils.loadTemplate(template);
        this.eFilterTextField = this.eGui.querySelector("#filterText");
        this.eTypeSelect = this.eGui.querySelector("#filterType");

        utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
        this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
    };

    NumberFilter.prototype.onTypeChanged = function () {
        this.filterType = parseInt(this.eTypeSelect.value);
        this.filterChangedCallback();
    };

    NumberFilter.prototype.onFilterChanged = function () {
        var filterText = utils.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        if (filterText) {
            this.filterNumber = parseInt(filterText);
        } else {
            this.filterNumber = null;
        }
        this.filterChangedCallback();
    };

    return NumberFilter;

});