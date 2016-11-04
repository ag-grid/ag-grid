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
var utils_1 = require("../utils");
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var TextFilter = (function () {
    function TextFilter() {
    }
    TextFilter.prototype.init = function (params) {
        this.filterParams = params;
        this.applyActive = params.apply === true;
        this.newRowsActionKeep = params.newRowsAction === 'keep';
        this.filterText = null;
        this.filterType = TextFilter.CONTAINS;
        this.createGui();
    };
    TextFilter.prototype.onNewRowsLoaded = function () {
        if (!this.newRowsActionKeep) {
            this.setType(TextFilter.CONTAINS);
            this.setFilter(null);
        }
    };
    TextFilter.prototype.afterGuiAttached = function () {
        this.eFilterTextField.focus();
    };
    TextFilter.prototype.doesFilterPass = function (params) {
        if (!this.filterText) {
            return true;
        }
        var value = this.filterParams.valueGetter(params.node);
        if (!value) {
            return false;
        }
        var valueLowerCase = value.toString().toLowerCase();
        switch (this.filterType) {
            case TextFilter.CONTAINS:
                return valueLowerCase.indexOf(this.filterText) >= 0;
            case TextFilter.EQUALS:
                return valueLowerCase === this.filterText;
            case TextFilter.NOT_EQUALS:
                return valueLowerCase != this.filterText;
            case TextFilter.STARTS_WITH:
                return valueLowerCase.indexOf(this.filterText) === 0;
            case TextFilter.ENDS_WITH:
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
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        return "<div>\n                    <div>\n                        <select class=\"ag-filter-select\" id=\"filterType\">\n                        <option value=\"" + TextFilter.CONTAINS + "\">" + translate('contains', 'Contains') + "</option>\n                        <option value=\"" + TextFilter.EQUALS + "\">" + translate('equals', 'Equals') + "</option>\n                        <option value=\"" + TextFilter.NOT_EQUALS + "\">" + translate('notEquals', 'Not equals') + "</option>\n                        <option value=\"" + TextFilter.STARTS_WITH + "\">" + translate('startsWith', 'Starts with') + "</option>\n                        <option value=\"" + TextFilter.ENDS_WITH + "\">" + translate('endsWith', 'Ends with') + "</option>\n                        </select>\n                    </div>\n                    <div>\n                        <input class=\"ag-filter-filter\" id=\"filterText\" type=\"text\" placeholder=\"" + translate('filterOoo', 'Filter...') + "\"/>\n                    </div>\n                    <div class=\"ag-filter-apply-panel\" id=\"applyPanel\">\n                        <button type=\"button\" id=\"applyButton\">" + translate('applyFilter', 'Apply Filter') + "</button>\n                    </div>\n                </div>";
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
                _this.filterParams.filterChangedCallback();
            });
        }
        else {
            utils_1.Utils.removeElement(this.eGui, '#applyPanel');
        }
    };
    TextFilter.prototype.onTypeChanged = function () {
        this.filterType = this.eTypeSelect.value;
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
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    };
    TextFilter.prototype.setType = function (type) {
        this.filterType = type;
        this.eTypeSelect.value = type;
    };
    TextFilter.prototype.setFilter = function (filter) {
        filter = utils_1.Utils.makeNull(filter);
        if (filter) {
            this.filterText = filter.toLowerCase();
            this.eFilterTextField.value = filter;
        }
        else {
            this.filterText = null;
            this.eFilterTextField.value = null;
        }
    };
    TextFilter.prototype.getType = function () {
        return this.filterType;
    };
    TextFilter.prototype.getFilter = function () {
        return this.filterText;
    };
    TextFilter.prototype.getModel = function () {
        if (this.isFilterActive()) {
            return {
                type: this.filterType,
                filter: this.filterText
            };
        }
        else {
            return null;
        }
    };
    TextFilter.prototype.setModel = function (model) {
        if (model) {
            this.setType(model.type);
            this.setFilter(model.filter);
        }
        else {
            this.setFilter(null);
        }
    };
    TextFilter.CONTAINS = 'contains'; //1;
    TextFilter.EQUALS = 'equals'; //2;
    TextFilter.NOT_EQUALS = 'notEquals'; //3;
    TextFilter.STARTS_WITH = 'startsWith'; //4;
    TextFilter.ENDS_WITH = 'endsWith'; //5;
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], TextFilter.prototype, "gridOptionsWrapper", void 0);
    return TextFilter;
})();
exports.TextFilter = TextFilter;
