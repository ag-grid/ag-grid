/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var utils_1 = require('../utils');
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var NumberFilter = (function () {
    function NumberFilter() {
    }
    NumberFilter.prototype.init = function (params) {
        this.filterParams = params;
        this.applyActive = params.apply === true;
        this.newRowsActionKeep = params.newRowsAction === 'keep';
        this.filterNumber = null;
        this.filterType = NumberFilter.EQUALS;
        this.createGui();
    };
    NumberFilter.prototype.onNewRowsLoaded = function () {
        if (!this.newRowsActionKeep) {
            this.setType(NumberFilter.EQUALS);
            this.setFilter(null);
        }
    };
    NumberFilter.prototype.afterGuiAttached = function () {
        this.eFilterTextField.focus();
    };
    NumberFilter.prototype.doesFilterPass = function (params) {
        if (this.filterNumber === null) {
            return true;
        }
        var value = this.filterParams.valueGetter(params.node);
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
            case NumberFilter.EQUALS:
                return valueAsNumber === this.filterNumber;
            case NumberFilter.LESS_THAN:
                return valueAsNumber < this.filterNumber;
            case NumberFilter.GREATER_THAN:
                return valueAsNumber > this.filterNumber;
            case NumberFilter.LESS_THAN_OR_EQUAL:
                return valueAsNumber <= this.filterNumber;
            case NumberFilter.GREATER_THAN_OR_EQUAL:
                return valueAsNumber >= this.filterNumber;
            case NumberFilter.NOT_EQUAL:
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
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return "<div>\n                    <div>\n                        <select class=\"ag-filter-select\" id=\"filterType\">\n                            <option value=\"" + NumberFilter.EQUALS + "\">" + translate('equals', 'Equals') + "</option>\n                            <option value=\"" + NumberFilter.NOT_EQUAL + "\">" + translate('notEqual', 'Not equal') + "</option>\n                            <option value=\"" + NumberFilter.LESS_THAN + "\">" + translate('lessThan', 'Less than') + "</option>\n                            <option value=\"" + NumberFilter.LESS_THAN_OR_EQUAL + "\">" + translate('lessThanOrEqual', 'Less than or equal') + "</option>\n                            <option value=\"" + NumberFilter.GREATER_THAN + "\">" + translate('greaterThan', 'Greater than') + "</option>\n                            <option value=\"" + NumberFilter.GREATER_THAN_OR_EQUAL + "\">" + translate('greaterThanOrEqual', 'Greater than or equal') + "</option>\n                        </select>\n                    </div>\n                    <div>\n                        <input class=\"ag-filter-filter\" id=\"filterText\" type=\"text\" placeholder=\"" + translate('filterOoo', 'Filter...') + "\"/>\n                    </div>\n                    <div class=\"ag-filter-apply-panel\" id=\"applyPanel\">\n                        <button type=\"button\" id=\"applyButton\">" + translate('applyFilter', 'Apply Filter') + "</button>\n                    </div>\n                </div>";
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
                _this.filterParams.filterChangedCallback();
            });
        }
        else {
            utils_1.Utils.removeElement(this.eGui, '#applyPanel');
        }
    };
    NumberFilter.prototype.onTypeChanged = function () {
        this.filterType = this.eTypeSelect.value;
        this.filterChanged();
    };
    NumberFilter.prototype.filterChanged = function () {
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
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
    NumberFilter.prototype.setType = function (type) {
        this.filterType = type;
        this.eTypeSelect.value = type;
    };
    NumberFilter.prototype.setFilter = function (filter) {
        filter = utils_1.Utils.makeNull(filter);
        if (filter !== null && !(typeof filter === 'number')) {
            filter = parseFloat(filter);
        }
        this.filterNumber = filter;
        this.eFilterTextField.value = filter;
    };
    NumberFilter.prototype.getFilter = function () {
        return this.filterNumber;
    };
    NumberFilter.prototype.getModel = function () {
        if (this.isFilterActive()) {
            return {
                type: this.filterType,
                filter: this.filterNumber
            };
        }
        else {
            return null;
        }
    };
    NumberFilter.prototype.setModel = function (model) {
        if (model) {
            this.setType(model.type);
            this.setFilter(model.filter);
        }
        else {
            this.setFilter(null);
        }
    };
    NumberFilter.EQUALS = 'equals'; // 1;
    NumberFilter.NOT_EQUAL = 'notEqual'; //2;
    NumberFilter.LESS_THAN = 'lessThan'; //3;
    NumberFilter.LESS_THAN_OR_EQUAL = 'lessThanOrEqual'; //4;
    NumberFilter.GREATER_THAN = 'greaterThan'; //5;
    NumberFilter.GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual'; //6;
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], NumberFilter.prototype, "gridOptionsWrapper", void 0);
    return NumberFilter;
})();
exports.NumberFilter = NumberFilter;
