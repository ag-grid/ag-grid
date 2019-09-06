/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var optionsFactory_1 = require("./optionsFactory");
var providedFilter_1 = require("./providedFilter");
var utils_1 = require("../../utils");
var ConditionPosition;
(function (ConditionPosition) {
    ConditionPosition[ConditionPosition["One"] = 0] = "One";
    ConditionPosition[ConditionPosition["Two"] = 1] = "Two";
})(ConditionPosition = exports.ConditionPosition || (exports.ConditionPosition = {}));
var DEFAULT_TRANSLATIONS = {
    loadingOoo: 'Loading...',
    empty: 'Choose One',
    equals: 'Equals',
    notEqual: 'Not equal',
    lessThan: 'Less than',
    greaterThan: 'Greater than',
    inRange: 'In range',
    lessThanOrEqual: 'Less than or equals',
    greaterThanOrEqual: 'Greater than or equals',
    filterOoo: 'Filter...',
    contains: 'Contains',
    notContains: 'Not contains',
    startsWith: 'Starts with',
    endsWith: 'Ends with',
    searchOoo: 'Search...',
    selectAll: 'Select All',
    applyFilter: 'Apply Filter',
    clearFilter: 'Clear Filter',
    andCondition: 'AND',
    orCondition: 'OR'
};
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
var SimpleFilter = /** @class */ (function (_super) {
    __extends(SimpleFilter, _super);
    function SimpleFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // returns true if this type requires a 'from' field, eg any filter that requires at least one text value
    SimpleFilter.prototype.showValueFrom = function (type) {
        return !this.doesFilterHaveHiddenInput(type) && type !== SimpleFilter.EMPTY;
    };
    // returns true if this type requires a 'to' field, currently only 'range' returns true
    SimpleFilter.prototype.showValueTo = function (type) {
        return type === SimpleFilter.IN_RANGE;
    };
    // floating filter calls this when user applies filter from floating filter
    SimpleFilter.prototype.onFloatingFilterChanged = function (type, value) {
        this.setValueFromFloatingFilter(value);
        this.setTypeFromFloatingFilter(type);
        this.onUiChanged(true);
    };
    SimpleFilter.prototype.setTypeFromFloatingFilter = function (type) {
        this.eType1.value = type;
        this.eType2.value = null;
        this.eJoinOperatorAnd.checked = true;
    };
    SimpleFilter.prototype.getModelFromUi = function () {
        if (!this.isConditionUiComplete(ConditionPosition.One)) {
            return null;
        }
        if (this.isAllowTwoConditions() && this.isConditionUiComplete(ConditionPosition.Two)) {
            var res = {
                filterType: this.getFilterType(),
                operator: this.getJoinOperator(),
                condition1: this.createCondition(ConditionPosition.One),
                condition2: this.createCondition(ConditionPosition.Two)
            };
            return res;
        }
        else {
            var res = this.createCondition(ConditionPosition.One);
            return res;
        }
    };
    SimpleFilter.prototype.getCondition1Type = function () {
        return this.eType1.value;
    };
    SimpleFilter.prototype.getCondition2Type = function () {
        return this.eType2.value;
    };
    SimpleFilter.prototype.getJoinOperator = function () {
        return this.eJoinOperatorOr.checked ? 'OR' : 'AND';
    };
    SimpleFilter.prototype.areModelsEqual = function (a, b) {
        // both are missing
        if (!a && !b) {
            return true;
        }
        // one is missing, other present
        if ((!a && b) || (a && !b)) {
            return false;
        }
        // one is combined, the other is not
        var aIsSimple = !a.operator;
        var bIsSimple = !b.operator;
        var oneSimpleOneCombined = (!aIsSimple && bIsSimple) || (aIsSimple && !bIsSimple);
        if (oneSimpleOneCombined) {
            return false;
        }
        var res;
        // otherwise both present, so compare
        if (aIsSimple) {
            var aSimple = a;
            var bSimple = b;
            res = this.areSimpleModelsEqual(aSimple, bSimple);
        }
        else {
            var aCombined = a;
            var bCombined = b;
            res = aCombined.operator === bCombined.operator
                && this.areSimpleModelsEqual(aCombined.condition1, bCombined.condition1)
                && this.areSimpleModelsEqual(aCombined.condition2, bCombined.condition2);
        }
        return res;
    };
    SimpleFilter.prototype.setModelIntoUi = function (model) {
        var isCombined = model.operator;
        if (isCombined) {
            var combinedModel = model;
            var orChecked = combinedModel.operator === 'OR';
            this.eJoinOperatorAnd.checked = !orChecked;
            this.eJoinOperatorOr.checked = orChecked;
            this.eType1.value = combinedModel.condition1.type;
            this.eType2.value = combinedModel.condition2.type;
            this.setConditionIntoUi(combinedModel.condition1, ConditionPosition.One);
            this.setConditionIntoUi(combinedModel.condition2, ConditionPosition.Two);
        }
        else {
            var simpleModel = model;
            this.eJoinOperatorAnd.checked = true;
            this.eJoinOperatorOr.checked = false;
            this.eType1.value = simpleModel.type;
            this.eType2.value = this.optionsFactory.getDefaultOption();
            this.setConditionIntoUi(simpleModel, ConditionPosition.One);
            this.setConditionIntoUi(null, ConditionPosition.Two);
        }
    };
    SimpleFilter.prototype.doesFilterPass = function (params) {
        var model = this.getModel();
        var isCombined = model.operator;
        if (isCombined) {
            var combinedModel = model;
            var firstResult = this.individualConditionPasses(params, combinedModel.condition1);
            var secondResult = this.individualConditionPasses(params, combinedModel.condition2);
            if (combinedModel.operator === 'AND') {
                return firstResult && secondResult;
            }
            else {
                return firstResult || secondResult;
            }
        }
        else {
            var simpleModel = model;
            var result = this.individualConditionPasses(params, simpleModel);
            return result;
        }
    };
    SimpleFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.simpleFilterParams = params;
        this.optionsFactory = new optionsFactory_1.OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOptions());
        this.allowTwoConditions = !params.suppressAndOrCondition;
        this.putOptionsIntoDropdown();
        this.addChangedListeners();
    };
    SimpleFilter.prototype.putOptionsIntoDropdown = function () {
        var _this = this;
        var filterOptions = this.optionsFactory.getFilterOptions();
        filterOptions.forEach(function (option) {
            var createOption = function () {
                var key = (typeof option === 'string') ? option : option.displayKey;
                var localName = _this.translate(key);
                var eOption = document.createElement("option");
                eOption.text = localName;
                eOption.value = key;
                return eOption;
            };
            _this.eType1.add(createOption());
            _this.eType2.add(createOption());
        });
        var readOnly = filterOptions.length <= 1;
        this.eType1.disabled = readOnly;
        this.eType2.disabled = readOnly;
    };
    SimpleFilter.prototype.isAllowTwoConditions = function () {
        return this.allowTwoConditions;
    };
    SimpleFilter.prototype.createBodyTemplate = function () {
        var optionsTemplate1 = "<select class=\"ag-filter-select\" ref=\"eOptions1\"></select>";
        var valueTemplate1 = this.createValueTemplate(ConditionPosition.One);
        var optionsTemplate2 = "<select class=\"ag-filter-select\" ref=\"eOptions2\"></select>";
        var valueTemplate2 = this.createValueTemplate(ConditionPosition.Two);
        var uniqueGroupId = 'ag-simple-filter-and-or-' + this.getCompId();
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var andOrTemplate = "<div class=\"ag-filter-condition\" ref=\"eJoinOperatorPanel\">\n                    <label>\n                        <input ref=\"eJoinOperatorAnd\" type=\"radio\" class=\"and\" name=\"" + uniqueGroupId + "\" value=\"AND\")} checked=\"checked\" />\n                        " + translate('andCondition', 'AND') + "\n                    </label>\n                    <label>\n                        <input ref=\"eJoinOperatorOr\" type=\"radio\" class=\"or\" name=\"" + uniqueGroupId + "\" value=\"OR\" />\n                        " + translate('orCondition', 'OR') + "\n                    </label>\n                </div>";
        var template = optionsTemplate1 + "\n                " + valueTemplate1 + "\n                " + andOrTemplate + "\n                " + optionsTemplate2 + "\n                " + valueTemplate2;
        return template;
    };
    SimpleFilter.prototype.updateUiVisibility = function () {
        var firstConditionComplete = this.isConditionUiComplete(ConditionPosition.One);
        var showSecondFilter = this.allowTwoConditions && firstConditionComplete;
        utils_1._.setDisplayed(this.eCondition2Body, showSecondFilter);
        utils_1._.setDisplayed(this.eType2, showSecondFilter);
        utils_1._.setDisplayed(this.eJoinOperatorPanel, showSecondFilter);
    };
    SimpleFilter.prototype.resetUiToDefaults = function () {
        this.eJoinOperatorAnd.checked = true;
        var defaultOption = this.optionsFactory.getDefaultOption();
        this.eType1.value = defaultOption;
        this.eType2.value = defaultOption;
    };
    SimpleFilter.prototype.translate = function (toTranslate) {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var defaultTranslation = DEFAULT_TRANSLATIONS[toTranslate];
        if (!defaultTranslation && this.optionsFactory.getCustomOption(toTranslate)) {
            defaultTranslation = this.optionsFactory.getCustomOption(toTranslate).displayName;
        }
        return translate(toTranslate, defaultTranslation);
    };
    SimpleFilter.prototype.addChangedListeners = function () {
        var _this = this;
        var listener = function () { return _this.onUiChanged(); };
        this.addDestroyableEventListener(this.eType1, "change", listener);
        this.addDestroyableEventListener(this.eType2, "change", listener);
        this.addDestroyableEventListener(this.eJoinOperatorOr, "change", listener);
        this.addDestroyableEventListener(this.eJoinOperatorAnd, "change", listener);
    };
    SimpleFilter.prototype.doesFilterHaveHiddenInput = function (filterType) {
        var customFilterOption = this.optionsFactory.getCustomOption(filterType);
        return customFilterOption && customFilterOption.hideFilterInput;
    };
    SimpleFilter.EMPTY = 'empty';
    SimpleFilter.EQUALS = 'equals';
    SimpleFilter.NOT_EQUAL = 'notEqual';
    SimpleFilter.LESS_THAN = 'lessThan';
    SimpleFilter.LESS_THAN_OR_EQUAL = 'lessThanOrEqual';
    SimpleFilter.GREATER_THAN = 'greaterThan';
    SimpleFilter.GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual';
    SimpleFilter.IN_RANGE = 'inRange';
    SimpleFilter.CONTAINS = 'contains';
    SimpleFilter.NOT_CONTAINS = 'notContains';
    SimpleFilter.STARTS_WITH = 'startsWith';
    SimpleFilter.ENDS_WITH = 'endsWith';
    __decorate([
        componentAnnotations_1.RefSelector('eOptions1'),
        __metadata("design:type", HTMLSelectElement)
    ], SimpleFilter.prototype, "eType1", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eOptions2'),
        __metadata("design:type", HTMLSelectElement)
    ], SimpleFilter.prototype, "eType2", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eJoinOperatorAnd'),
        __metadata("design:type", HTMLInputElement)
    ], SimpleFilter.prototype, "eJoinOperatorAnd", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eJoinOperatorOr'),
        __metadata("design:type", HTMLInputElement)
    ], SimpleFilter.prototype, "eJoinOperatorOr", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eCondition2Body'),
        __metadata("design:type", HTMLElement)
    ], SimpleFilter.prototype, "eCondition2Body", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eJoinOperatorPanel'),
        __metadata("design:type", HTMLElement)
    ], SimpleFilter.prototype, "eJoinOperatorPanel", void 0);
    return SimpleFilter;
}(providedFilter_1.ProvidedFilter));
exports.SimpleFilter = SimpleFilter;
