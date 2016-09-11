/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.4.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var template = '<div>' +
    '<div>' +
    '<select class="ag-filter-select" id="filterType">' +
    '<option value="1">[EQUALS]</option>' +
    '<option value="2">[NOT EQUAL]</option>' +
    '<option value="3">[LESS THAN]</option>' +
    '<option value="4">[LESS THAN OR EQUAL]</option>' +
    '<option value="5">[GREATER THAN]</option>' +
    '<option value="6">[GREATER THAN OR EQUAL]</option>' +
    '</select>' +
    '</div>' +
    '<div>' +
    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>' +
    '</div>' +
    '<div class="ag-filter-apply-panel" id="applyPanel">' +
    '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
    '</div>' +
    '</div>';
var EQUALS = 1;
var NOT_EQUAL = 2;
var LESS_THAN = 3;
var LESS_THAN_OR_EQUAL = 4;
var GREATER_THAN = 5;
var GREATER_THAN_OR_EQUAL = 6;
var NumberFilter = (function () {
    function NumberFilter() {
    }
    NumberFilter.prototype.init = function (params) {
        this.filterParams = params.filterParams;
        this.applyActive = this.filterParams && this.filterParams.apply === true;
        this.filterChangedCallback = params.filterChangedCallback;
        this.filterModifiedCallback = params.filterModifiedCallback;
        this.localeTextFunc = params.localeTextFunc;
        this.valueGetter = params.valueGetter;
        this.createGui();
        this.filterNumber = null;
        this.filterType = EQUALS;
        this.createApi();
    };
    NumberFilter.prototype.onNewRowsLoaded = function () {
        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        if (!keepSelection) {
            this.api.setType(EQUALS);
            this.api.setFilter(null);
        }
    };
    NumberFilter.prototype.afterGuiAttached = function () {
        this.eFilterTextField.focus();
    };
    NumberFilter.prototype.doesFilterPass = function (node) {
        if (this.filterNumber === null) {
            return true;
        }
        var value = this.valueGetter(node);
        if (!value && value !== 0) {
            return false;
        }
        var valueAsNumber;
        if (typeof value === 'number') {
            valueAsNumber = value;
        }
        else {
            valueAsNumber = parseFloat(value);
        }
        switch (this.filterType) {
            case EQUALS:
                return valueAsNumber === this.filterNumber;
            case LESS_THAN:
                return valueAsNumber < this.filterNumber;
            case GREATER_THAN:
                return valueAsNumber > this.filterNumber;
            case LESS_THAN_OR_EQUAL:
                return valueAsNumber <= this.filterNumber;
            case GREATER_THAN_OR_EQUAL:
                return valueAsNumber >= this.filterNumber;
            case NOT_EQUAL:
                return valueAsNumber != this.filterNumber;
            default:
                // should never happen
                console.warn('invalid filter type ' + this.filterType);
                return false;
        }
    };
    NumberFilter.prototype.getGui = function () {
        return this.eGui;
    };
    NumberFilter.prototype.isFilterActive = function () {
        return this.filterNumber !== null;
    };
    NumberFilter.prototype.createTemplate = function () {
        return template
            .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
            .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
            .replace('[LESS THAN]', this.localeTextFunc('lessThan', 'Less than'))
            .replace('[GREATER THAN]', this.localeTextFunc('greaterThan', 'Greater than'))
            .replace('[LESS THAN OR EQUAL]', this.localeTextFunc('lessThanOrEqual', 'Less than or equal'))
            .replace('[GREATER THAN OR EQUAL]', this.localeTextFunc('greaterThanOrEqual', 'Greater than or equal'))
            .replace('[NOT EQUAL]', this.localeTextFunc('notEqual', 'Not equal'))
            .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
    };
    NumberFilter.prototype.createGui = function () {
        this.eGui = utils_1.Utils.loadTemplate(this.createTemplate());
        this.eFilterTextField = this.eGui.querySelector("#filterText");
        this.eTypeSelect = this.eGui.querySelector("#filterType");
        utils_1.Utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
        this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
        this.setupApply();
    };
    NumberFilter.prototype.setupApply = function () {
        var _this = this;
        if (this.applyActive) {
            this.eApplyButton = this.eGui.querySelector('#applyButton');
            this.eApplyButton.addEventListener('click', function () {
                _this.filterChangedCallback();
            });
        }
        else {
            utils_1.Utils.removeElement(this.eGui, '#applyPanel');
        }
    };
    NumberFilter.prototype.onTypeChanged = function () {
        this.filterType = parseInt(this.eTypeSelect.value);
        this.filterChanged();
    };
    NumberFilter.prototype.filterChanged = function () {
        this.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterChangedCallback();
        }
    };
    NumberFilter.prototype.onFilterChanged = function () {
        var filterText = utils_1.Utils.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        var newFilter;
        if (filterText !== null && filterText !== undefined) {
            newFilter = parseFloat(filterText);
        }
        else {
            newFilter = null;
        }
        if (this.filterNumber !== newFilter) {
            this.filterNumber = newFilter;
            this.filterChanged();
        }
    };
    NumberFilter.prototype.createApi = function () {
        var that = this;
        this.api = {
            EQUALS: EQUALS,
            NOT_EQUAL: NOT_EQUAL,
            LESS_THAN: LESS_THAN,
            GREATER_THAN: GREATER_THAN,
            LESS_THAN_OR_EQUAL: LESS_THAN_OR_EQUAL,
            GREATER_THAN_OR_EQUAL: GREATER_THAN_OR_EQUAL,
            setType: function (type) {
                that.filterType = type;
                that.eTypeSelect.value = type;
            },
            setFilter: function (filter) {
                filter = utils_1.Utils.makeNull(filter);
                if (filter !== null && !(typeof filter === 'number')) {
                    filter = parseFloat(filter);
                }
                that.filterNumber = filter;
                that.eFilterTextField.value = filter;
            },
            getType: function () {
                return that.filterType;
            },
            getFilter: function () {
                return that.filterNumber;
            },
            getModel: function () {
                if (that.isFilterActive()) {
                    return {
                        type: that.filterType,
                        filter: that.filterNumber
                    };
                }
                else {
                    return null;
                }
            },
            setModel: function (dataModel) {
                if (dataModel) {
                    this.setType(dataModel.type);
                    this.setFilter(dataModel.filter);
                }
                else {
                    this.setFilter(null);
                }
            }
        };
    };
    NumberFilter.prototype.getApi = function () {
        return this.api;
    };
    return NumberFilter;
})();
exports.NumberFilter = NumberFilter;
