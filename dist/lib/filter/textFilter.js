/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var utils_1 = require('../utils');
var template = '<div>' +
    '<div>' +
    '<select class="ag-filter-select" id="filterType">' +
    '<option value="1">[CONTAINS]</option>' +
    '<option value="2">[EQUALS]</option>' +
    '<option value="3">[NOT EQUALS]</option>' +
    '<option value="4">[STARTS WITH]</option>' +
    '<option value="5">[ENDS WITH]</option>' +
    '</select>' +
    '</div>' +
    '<div>' +
    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>' +
    '</div>' +
    '<div class="ag-filter-apply-panel" id="applyPanel">' +
    '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
    '</div>' +
    '</div>';
var CONTAINS = 1;
var EQUALS = 2;
var NOT_EQUALS = 3;
var STARTS_WITH = 4;
var ENDS_WITH = 5;
var TextFilter = (function () {
    function TextFilter() {
    }
    TextFilter.prototype.init = function (params) {
        this.filterParams = params.filterParams;
        this.applyActive = this.filterParams && this.filterParams.apply === true;
        this.filterChangedCallback = params.filterChangedCallback;
        this.filterModifiedCallback = params.filterModifiedCallback;
        this.localeTextFunc = params.localeTextFunc;
        this.valueGetter = params.valueGetter;
        this.createGui();
        this.filterText = null;
        this.filterType = CONTAINS;
        this.createApi();
    };
    TextFilter.prototype.onNewRowsLoaded = function () {
        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
        if (!keepSelection) {
            this.api.setType(CONTAINS);
            this.api.setFilter(null);
        }
    };
    TextFilter.prototype.afterGuiAttached = function () {
        this.eFilterTextField.focus();
    };
    TextFilter.prototype.doesFilterPass = function (node) {
        if (!this.filterText) {
            return true;
        }
        var value = this.valueGetter(node);
        if (!value) {
            return false;
        }
        var valueLowerCase = value.toString().toLowerCase();
        switch (this.filterType) {
            case CONTAINS:
                return valueLowerCase.indexOf(this.filterText) >= 0;
            case EQUALS:
                return valueLowerCase === this.filterText;
            case NOT_EQUALS:
                return valueLowerCase != this.filterText;
            case STARTS_WITH:
                return valueLowerCase.indexOf(this.filterText) === 0;
            case ENDS_WITH:
                var index = valueLowerCase.lastIndexOf(this.filterText);
                return index >= 0 && index === (valueLowerCase.length - this.filterText.length);
            default:
                // should never happen
                console.warn('invalid filter type ' + this.filterType);
                return false;
        }
    };
    TextFilter.prototype.getGui = function () {
        return this.eGui;
    };
    TextFilter.prototype.isFilterActive = function () {
        return this.filterText !== null;
    };
    TextFilter.prototype.createTemplate = function () {
        return template
            .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
            .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
            .replace('[NOT EQUALS]', this.localeTextFunc('notEquals', 'Not equals'))
            .replace('[CONTAINS]', this.localeTextFunc('contains', 'Contains'))
            .replace('[STARTS WITH]', this.localeTextFunc('startsWith', 'Starts with'))
            .replace('[ENDS WITH]', this.localeTextFunc('endsWith', 'Ends with'))
            .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
    };
    TextFilter.prototype.createGui = function () {
        this.eGui = utils_1.Utils.loadTemplate(this.createTemplate());
        this.eFilterTextField = this.eGui.querySelector("#filterText");
        this.eTypeSelect = this.eGui.querySelector("#filterType");
        utils_1.Utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
        this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
        this.setupApply();
    };
    TextFilter.prototype.setupApply = function () {
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
    TextFilter.prototype.onTypeChanged = function () {
        this.filterType = parseInt(this.eTypeSelect.value);
        this.filterChanged();
    };
    TextFilter.prototype.onFilterChanged = function () {
        var filterText = utils_1.Utils.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        var newFilterText;
        if (filterText !== null && filterText !== undefined) {
            newFilterText = filterText.toLowerCase();
        }
        else {
            newFilterText = null;
        }
        if (this.filterText !== newFilterText) {
            this.filterText = newFilterText;
            this.filterChanged();
        }
    };
    TextFilter.prototype.filterChanged = function () {
        this.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterChangedCallback();
        }
    };
    TextFilter.prototype.createApi = function () {
        var that = this;
        this.api = {
            EQUALS: EQUALS,
            NOT_EQUALS: NOT_EQUALS,
            CONTAINS: CONTAINS,
            STARTS_WITH: STARTS_WITH,
            ENDS_WITH: ENDS_WITH,
            setType: function (type) {
                that.filterType = type;
                that.eTypeSelect.value = type;
            },
            setFilter: function (filter) {
                filter = utils_1.Utils.makeNull(filter);
                if (filter) {
                    that.filterText = filter.toLowerCase();
                    that.eFilterTextField.value = filter;
                }
                else {
                    that.filterText = null;
                    that.eFilterTextField.value = null;
                }
            },
            getType: function () {
                return that.filterType;
            },
            getFilter: function () {
                return that.filterText;
            },
            getModel: function () {
                if (that.isFilterActive()) {
                    return {
                        type: that.filterType,
                        filter: that.filterText
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
    TextFilter.prototype.getApi = function () {
        return this.api;
    };
    return TextFilter;
})();
exports.TextFilter = TextFilter;
