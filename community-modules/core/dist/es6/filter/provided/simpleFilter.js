/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { RefSelector } from "../../widgets/componentAnnotations";
import { OptionsFactory } from "./optionsFactory";
import { ProvidedFilter } from "./providedFilter";
import { _ } from "../../utils";
export var ConditionPosition;
(function (ConditionPosition) {
    ConditionPosition[ConditionPosition["One"] = 0] = "One";
    ConditionPosition[ConditionPosition["Two"] = 1] = "Two";
})(ConditionPosition || (ConditionPosition = {}));
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
    rangeStart: 'From',
    rangeEnd: 'To',
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
        this.eType1.setValue(type);
        this.eType2.setValue(null);
        this.eJoinOperatorAnd.setValue(true);
    };
    SimpleFilter.prototype.getModelFromUi = function () {
        if (!this.isConditionUiComplete(ConditionPosition.One)) {
            return null;
        }
        if (this.isAllowTwoConditions() && this.isConditionUiComplete(ConditionPosition.Two)) {
            return {
                filterType: this.getFilterType(),
                operator: this.getJoinOperator(),
                condition1: this.createCondition(ConditionPosition.One),
                condition2: this.createCondition(ConditionPosition.Two)
            };
        }
        return this.createCondition(ConditionPosition.One);
    };
    SimpleFilter.prototype.getCondition1Type = function () {
        return this.eType1.getValue();
    };
    SimpleFilter.prototype.getCondition2Type = function () {
        return this.eType2.getValue();
    };
    SimpleFilter.prototype.getJoinOperator = function () {
        return this.eJoinOperatorOr.getValue() === true ? 'OR' : 'AND';
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
            this.eJoinOperatorAnd.setValue(!orChecked);
            this.eJoinOperatorOr.setValue(orChecked);
            this.eType1.setValue(combinedModel.condition1.type);
            this.eType2.setValue(combinedModel.condition2.type);
            this.setConditionIntoUi(combinedModel.condition1, ConditionPosition.One);
            this.setConditionIntoUi(combinedModel.condition2, ConditionPosition.Two);
        }
        else {
            var simpleModel = model;
            this.eJoinOperatorAnd.setValue(true);
            this.eJoinOperatorOr.setValue(false);
            this.eType1.setValue(simpleModel.type);
            this.eType2.setValue(this.optionsFactory.getDefaultOption());
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
            return firstResult || secondResult;
        }
        var simpleModel = model;
        var result = this.individualConditionPasses(params, simpleModel);
        return result;
    };
    SimpleFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.simpleFilterParams = params;
        this.optionsFactory = new OptionsFactory();
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
                return {
                    value: key,
                    text: localName
                };
            };
            _this.eType1.addOption(createOption());
            _this.eType2.addOption(createOption());
        });
        var readOnly = filterOptions.length <= 1;
        this.eType1.setDisabled(readOnly);
        this.eType2.setDisabled(readOnly);
    };
    SimpleFilter.prototype.isAllowTwoConditions = function () {
        return this.allowTwoConditions;
    };
    SimpleFilter.prototype.createBodyTemplate = function () {
        return "\n            <ag-select class=\"ag-filter-select\" ref=\"eOptions1\"></ag-select>\n            " + this.createValueTemplate(ConditionPosition.One) + "\n            <div class=\"ag-filter-condition\" ref=\"eJoinOperatorPanel\">\n               <ag-radio-button ref=\"eJoinOperatorAnd\" class=\"ag-filter-condition-operator ag-filter-condition-operator-and\"></ag-radio-button>\n               <ag-radio-button ref=\"eJoinOperatorOr\" class=\"ag-filter-condition-operator ag-filter-condition-operator-or\"></ag-radio-button>\n            </div>\n            <ag-select class=\"ag-filter-select\" ref=\"eOptions2\"></ag-select>\n            " + this.createValueTemplate(ConditionPosition.Two);
    };
    SimpleFilter.prototype.getCssIdentifier = function () {
        return 'simple-filter';
    };
    SimpleFilter.prototype.updateUiVisibility = function () {
        var firstConditionComplete = this.isConditionUiComplete(ConditionPosition.One);
        var showSecondFilter = this.allowTwoConditions && firstConditionComplete;
        _.setDisplayed(this.eCondition2Body, showSecondFilter);
        _.setDisplayed(this.eType2.getGui(), showSecondFilter);
        _.setDisplayed(this.eJoinOperatorPanel, showSecondFilter);
    };
    SimpleFilter.prototype.resetUiToDefaults = function (silent) {
        var uniqueGroupId = 'ag-simple-filter-and-or-' + this.getCompId();
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var defaultOption = this.optionsFactory.getDefaultOption();
        this.eType1.setValue(defaultOption, silent);
        this.eType2.setValue(defaultOption, silent);
        this.eJoinOperatorAnd
            .setValue(true, silent)
            .setName(uniqueGroupId)
            .setLabel(translate('andCondition', 'AND'));
        this.eJoinOperatorOr
            .setValue(false, silent)
            .setName(uniqueGroupId)
            .setLabel(translate('orCondition', 'OR'));
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
        this.eType1.onValueChange(listener);
        this.eType2.onValueChange(listener);
        this.eJoinOperatorOr.onValueChange(listener);
        this.eJoinOperatorAnd.onValueChange(listener);
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
        RefSelector('eOptions1')
    ], SimpleFilter.prototype, "eType1", void 0);
    __decorate([
        RefSelector('eOptions2')
    ], SimpleFilter.prototype, "eType2", void 0);
    __decorate([
        RefSelector('eJoinOperatorAnd')
    ], SimpleFilter.prototype, "eJoinOperatorAnd", void 0);
    __decorate([
        RefSelector('eJoinOperatorOr')
    ], SimpleFilter.prototype, "eJoinOperatorOr", void 0);
    __decorate([
        RefSelector('eCondition2Body')
    ], SimpleFilter.prototype, "eCondition2Body", void 0);
    __decorate([
        RefSelector('eJoinOperatorPanel')
    ], SimpleFilter.prototype, "eJoinOperatorPanel", void 0);
    return SimpleFilter;
}(ProvidedFilter));
export { SimpleFilter };
