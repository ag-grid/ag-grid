/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
Object.defineProperty(exports, "__esModule", { value: true });
var componentAnnotations_1 = require("../../../widgets/componentAnnotations");
var simpleFilter_1 = require("../simpleFilter");
var scalarFilter_1 = require("../scalarFilter");
var generic_1 = require("../../../utils/generic");
var dom_1 = require("../../../utils/dom");
var browser_1 = require("../../../utils/browser");
var NumberFilter = /** @class */ (function (_super) {
    __extends(NumberFilter, _super);
    function NumberFilter() {
        return _super.call(this, 'numberFilter') || this;
    }
    NumberFilter.prototype.mapRangeFromModel = function (filterModel) {
        return {
            from: filterModel.filter,
            to: filterModel.filterTo
        };
    };
    NumberFilter.prototype.getDefaultDebounceMs = function () {
        return 500;
    };
    NumberFilter.prototype.resetUiToDefaults = function (silent) {
        var _this = this;
        return _super.prototype.resetUiToDefaults.call(this, silent).then(function () {
            var fields = [_this.eValueFrom1, _this.eValueFrom2, _this.eValueTo1, _this.eValueTo2];
            fields.forEach(function (field) { return field.setValue(null, silent); });
            _this.resetPlaceholder();
        });
    };
    NumberFilter.prototype.setConditionIntoUi = function (model, position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var eValueFrom = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        var eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        eValueFrom.setValue(model ? ('' + model.filter) : null);
        eValueTo.setValue(model ? ('' + model.filterTo) : null);
    };
    NumberFilter.prototype.setValueFromFloatingFilter = function (value) {
        this.eValueFrom1.setValue(value);
        this.eValueTo1.setValue(null);
        this.eValueFrom2.setValue(null);
        this.eValueTo2.setValue(null);
    };
    NumberFilter.prototype.comparator = function () {
        return function (left, right) {
            if (left === right) {
                return 0;
            }
            return left < right ? 1 : -1;
        };
    };
    NumberFilter.prototype.setParams = function (params) {
        this.numberFilterParams = params;
        var allowedCharPattern = this.getAllowedCharPattern();
        if (allowedCharPattern) {
            var config = { allowedCharPattern: allowedCharPattern };
            this.resetTemplate({
                eValueFrom1: config,
                eValueTo1: config,
                eValueFrom2: config,
                eValueTo2: config,
            });
        }
        _super.prototype.setParams.call(this, params);
        this.addValueChangedListeners();
    };
    NumberFilter.prototype.addValueChangedListeners = function () {
        var _this = this;
        var listener = function () { return _this.onUiChanged(); };
        this.eValueFrom1.onValueChange(listener);
        this.eValueTo1.onValueChange(listener);
        this.eValueFrom2.onValueChange(listener);
        this.eValueTo2.onValueChange(listener);
    };
    NumberFilter.prototype.resetPlaceholder = function () {
        var globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();
        var isRange1 = this.showValueTo(this.getCondition1Type());
        var isRange2 = this.showValueTo(this.getCondition2Type());
        this.eValueFrom1.setInputPlaceholder(this.translate(isRange1 ? 'inRangeStart' : 'filterOoo'));
        this.eValueFrom1.setInputAriaLabel(isRange1
            ? globalTranslate('ariaFilterFromValue', 'Filter from value')
            : globalTranslate('ariaFilterValue', 'Filter Value'));
        this.eValueTo1.setInputPlaceholder(this.translate('inRangeEnd'));
        this.eValueTo1.setInputAriaLabel(globalTranslate('ariaFilterToValue', 'Filter to Value'));
        this.eValueFrom2.setInputPlaceholder(this.translate(isRange2 ? 'inRangeStart' : 'filterOoo'));
        this.eValueFrom2.setInputAriaLabel(isRange2
            ? globalTranslate('ariaFilterFromValue', 'Filter from value')
            : globalTranslate('ariaFilterValue', 'Filter Value'));
        this.eValueTo2.setInputPlaceholder(this.translate('inRangeEnd'));
        this.eValueTo2.setInputAriaLabel(globalTranslate('ariaFilterToValue', 'Filter to Value'));
    };
    NumberFilter.prototype.afterGuiAttached = function (params) {
        _super.prototype.afterGuiAttached.call(this, params);
        this.resetPlaceholder();
        if (!params || !params.suppressFocus) {
            this.eValueFrom1.getInputElement().focus();
        }
    };
    NumberFilter.prototype.getDefaultFilterOptions = function () {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    };
    NumberFilter.prototype.createValueTemplate = function (position) {
        var pos = position === simpleFilter_1.ConditionPosition.One ? '1' : '2';
        var allowedCharPattern = this.getAllowedCharPattern();
        var agElementTag = allowedCharPattern ? 'ag-input-text-field' : 'ag-input-number-field';
        return /* html */ "\n            <div class=\"ag-filter-body\" ref=\"eCondition" + pos + "Body\" role=\"presentation\">\n                <" + agElementTag + " class=\"ag-filter-from ag-filter-filter\" ref=\"eValueFrom" + pos + "\"></" + agElementTag + ">\n                <" + agElementTag + " class=\"ag-filter-to ag-filter-filter\" ref=\"eValueTo" + pos + "\"></" + agElementTag + ">\n            </div>";
    };
    NumberFilter.prototype.isConditionUiComplete = function (position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var option = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        if (option === simpleFilter_1.SimpleFilter.EMPTY) {
            return false;
        }
        if (this.doesFilterHaveHiddenInput(option)) {
            return true;
        }
        var eValue = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        var eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
        var value = this.stringToFloat(eValue.getValue());
        return value != null && (!this.showValueTo(option) || this.stringToFloat(eValueTo.getValue()) != null);
    };
    NumberFilter.prototype.areSimpleModelsEqual = function (aSimple, bSimple) {
        return aSimple.filter === bSimple.filter
            && aSimple.filterTo === bSimple.filterTo
            && aSimple.type === bSimple.type;
    };
    NumberFilter.prototype.getFilterType = function () {
        return 'number';
    };
    NumberFilter.prototype.stringToFloat = function (value) {
        if (typeof value === 'number') {
            return value;
        }
        var filterText = generic_1.makeNull(value);
        if (filterText != null && filterText.trim() === '') {
            filterText = null;
        }
        if (this.numberFilterParams.numberParser) {
            return this.numberFilterParams.numberParser(filterText);
        }
        return filterText == null || filterText.trim() === '-' ? null : parseFloat(filterText);
    };
    NumberFilter.prototype.createCondition = function (position) {
        var positionOne = position === simpleFilter_1.ConditionPosition.One;
        var type = positionOne ? this.getCondition1Type() : this.getCondition2Type();
        var eValue = positionOne ? this.eValueFrom1 : this.eValueFrom2;
        var value = this.stringToFloat(eValue.getValue());
        var model = {
            filterType: this.getFilterType(),
            type: type
        };
        if (!this.doesFilterHaveHiddenInput(type)) {
            model.filter = value;
            if (this.showValueTo(type)) {
                var eValueTo = positionOne ? this.eValueTo1 : this.eValueTo2;
                var valueTo = this.stringToFloat(eValueTo.getValue());
                model.filterTo = valueTo;
            }
        }
        return model;
    };
    NumberFilter.prototype.updateUiVisibility = function () {
        _super.prototype.updateUiVisibility.call(this);
        this.resetPlaceholder();
        var condition1Type = this.getCondition1Type();
        var condition2Type = this.getCondition2Type();
        dom_1.setDisplayed(this.eValueFrom1.getGui(), this.showValueFrom(condition1Type));
        dom_1.setDisplayed(this.eValueTo1.getGui(), this.showValueTo(condition1Type));
        dom_1.setDisplayed(this.eValueFrom2.getGui(), this.showValueFrom(condition2Type));
        dom_1.setDisplayed(this.eValueTo2.getGui(), this.showValueTo(condition2Type));
    };
    NumberFilter.prototype.getAllowedCharPattern = function () {
        var allowedCharPattern = (this.numberFilterParams || {}).allowedCharPattern;
        if (allowedCharPattern) {
            return allowedCharPattern;
        }
        if (!browser_1.isBrowserChrome() && !browser_1.isBrowserEdge()) {
            // only Chrome and Edge support the HTML5 number field, so for other browsers we provide an equivalent
            // constraint instead
            return '\\d\\-\\.';
        }
        return null;
    };
    NumberFilter.DEFAULT_FILTER_OPTIONS = [
        scalarFilter_1.ScalarFilter.EQUALS,
        scalarFilter_1.ScalarFilter.NOT_EQUAL,
        scalarFilter_1.ScalarFilter.LESS_THAN,
        scalarFilter_1.ScalarFilter.LESS_THAN_OR_EQUAL,
        scalarFilter_1.ScalarFilter.GREATER_THAN,
        scalarFilter_1.ScalarFilter.GREATER_THAN_OR_EQUAL,
        scalarFilter_1.ScalarFilter.IN_RANGE
    ];
    __decorate([
        componentAnnotations_1.RefSelector('eValueFrom1')
    ], NumberFilter.prototype, "eValueFrom1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValueTo1')
    ], NumberFilter.prototype, "eValueTo1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValueFrom2')
    ], NumberFilter.prototype, "eValueFrom2", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eValueTo2')
    ], NumberFilter.prototype, "eValueTo2", void 0);
    return NumberFilter;
}(scalarFilter_1.ScalarFilter));
exports.NumberFilter = NumberFilter;

//# sourceMappingURL=numberFilter.js.map
