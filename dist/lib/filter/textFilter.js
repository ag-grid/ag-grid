/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var baseFilter_1 = require("./baseFilter");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var TextFilter = (function (_super) {
    __extends(TextFilter, _super);
    function TextFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextFilter.prototype.getDefaultType = function () {
        return baseFilter_1.BaseFilter.CONTAINS;
    };
    TextFilter.prototype.customInit = function () {
        this.comparator = this.filterParams.textCustomComparator ? this.filterParams.textCustomComparator : TextFilter.DEFAULT_COMPARATOR;
        this.formatter =
            this.filterParams.textFormatter ? this.filterParams.textFormatter :
                this.filterParams.caseSensitive == true ? TextFilter.DEFAULT_FORMATTER :
                    TextFilter.DEFAULT_LOWERCASE_FORMATTER;
        _super.prototype.customInit.call(this);
    };
    TextFilter.prototype.modelFromFloatingFilter = function (from) {
        return {
            type: this.filter,
            filter: from,
            filterType: 'text'
        };
    };
    TextFilter.prototype.getApplicableFilterTypes = function () {
        return [baseFilter_1.BaseFilter.EQUALS, baseFilter_1.BaseFilter.NOT_EQUAL, baseFilter_1.BaseFilter.STARTS_WITH, baseFilter_1.BaseFilter.ENDS_WITH,
            baseFilter_1.BaseFilter.CONTAINS, baseFilter_1.BaseFilter.NOT_CONTAINS];
    };
    TextFilter.prototype.bodyTemplate = function () {
        var translate = this.translate.bind(this);
        return "<div class=\"ag-filter-body\">\n            <input class=\"ag-filter-filter\" id=\"filterText\" type=\"text\" placeholder=\"" + translate('filterOoo', 'Filter...') + "\"/>\n        </div>";
    };
    TextFilter.prototype.initialiseFilterBodyUi = function () {
        _super.prototype.initialiseFilterBodyUi.call(this);
        var debounceMs = this.getDebounceMs(this.filterParams);
        var toDebounce = utils_1.Utils.debounce(this.onFilterTextFieldChanged.bind(this), debounceMs);
        this.addDestroyableEventListener(this.eFilterTextField, 'input', toDebounce);
    };
    TextFilter.prototype.refreshFilterBodyUi = function () { };
    TextFilter.prototype.afterGuiAttached = function () {
        this.eFilterTextField.focus();
    };
    TextFilter.prototype.filterValues = function () {
        return this.filterText;
    };
    TextFilter.prototype.doesFilterPass = function (params) {
        if (!this.filterText) {
            return true;
        }
        var value = this.filterParams.valueGetter(params.node);
        if (!value) {
            if (this.filter === baseFilter_1.BaseFilter.NOT_EQUAL || this.filter === baseFilter_1.BaseFilter.NOT_CONTAINS) {
                // if there is no value, but the filter type was 'not equals',
                // then it should pass, as a missing value is not equal whatever
                // the user is filtering on
                return true;
            }
            else {
                // otherwise it's some type of comparison, to which empty value
                // will always fail
                return false;
            }
        }
        var valueFormatted = this.formatter(value);
        return this.comparator(this.filter, valueFormatted, this.filterText);
    };
    TextFilter.prototype.onFilterTextFieldChanged = function () {
        var filterText = utils_1.Utils.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        if (this.filterText !== filterText) {
            var newLowerCase = filterText && this.filterParams.caseSensitive != true ? filterText.toLowerCase() :
                filterText;
            var previousLowerCase = this.filterText && this.filterParams.caseSensitive != true ? this.filterText.toLowerCase() :
                this.filterText;
            this.filterText = this.formatter(filterText);
            if (previousLowerCase !== newLowerCase) {
                this.onFilterChanged();
            }
        }
    };
    TextFilter.prototype.setFilter = function (filter) {
        filter = utils_1.Utils.makeNull(filter);
        if (filter) {
            this.filterText = this.formatter(filter);
            this.eFilterTextField.value = filter;
        }
        else {
            this.filterText = null;
            this.eFilterTextField.value = null;
        }
    };
    TextFilter.prototype.getFilter = function () {
        return this.filterText;
    };
    TextFilter.prototype.resetState = function () {
        this.setFilter(null);
        this.setFilterType(this.defaultFilter);
    };
    TextFilter.prototype.serialize = function () {
        return {
            type: this.filter ? this.filter : this.defaultFilter,
            filter: this.filterText,
            filterType: 'text'
        };
    };
    TextFilter.prototype.parse = function (model) {
        this.setFilterType(model.type);
        this.setFilter(model.filter);
    };
    TextFilter.prototype.setType = function (filterType) {
        this.setFilterType(filterType);
    };
    TextFilter.DEFAULT_FORMATTER = function (from) {
        return from;
    };
    TextFilter.DEFAULT_LOWERCASE_FORMATTER = function (from) {
        if (from == null)
            return null;
        return from.toString().toLowerCase();
    };
    TextFilter.DEFAULT_COMPARATOR = function (filter, value, filterText) {
        switch (filter) {
            case TextFilter.CONTAINS:
                return value.indexOf(filterText) >= 0;
            case TextFilter.NOT_CONTAINS:
                return value.indexOf(filterText) === -1;
            case TextFilter.EQUALS:
                return value === filterText;
            case TextFilter.NOT_EQUAL:
                return value != filterText;
            case TextFilter.STARTS_WITH:
                return value.indexOf(filterText) === 0;
            case TextFilter.ENDS_WITH:
                var index = value.lastIndexOf(filterText);
                return index >= 0 && index === (value.length - filterText.length);
            default:
                // should never happen
                console.warn('invalid filter type ' + filter);
                return false;
        }
    };
    __decorate([
        componentAnnotations_1.QuerySelector('#filterText'),
        __metadata("design:type", HTMLInputElement)
    ], TextFilter.prototype, "eFilterTextField", void 0);
    return TextFilter;
}(baseFilter_1.ComparableBaseFilter));
exports.TextFilter = TextFilter;
