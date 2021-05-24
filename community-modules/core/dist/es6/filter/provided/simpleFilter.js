/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
import { RefSelector } from '../../widgets/componentAnnotations';
import { OptionsFactory } from './optionsFactory';
import { ProvidedFilter } from './providedFilter';
import { AgPromise } from '../../utils';
import { forEach, every, some, includes } from '../../utils/array';
import { setDisplayed, setDisabled } from '../../utils/dom';
export var ConditionPosition;
(function (ConditionPosition) {
    ConditionPosition[ConditionPosition["One"] = 0] = "One";
    ConditionPosition[ConditionPosition["Two"] = 1] = "Two";
})(ConditionPosition || (ConditionPosition = {}));
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
        this.setTypeFromFloatingFilter(type);
        this.setValueFromFloatingFilter(value);
        this.onUiChanged(true);
    };
    SimpleFilter.prototype.setTypeFromFloatingFilter = function (type) {
        this.eType1.setValue(type);
        this.eType2.setValue(this.optionsFactory.getDefaultOption());
        (this.isDefaultOperator('AND') ? this.eJoinOperatorAnd : this.eJoinOperatorOr).setValue(true);
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
            this.eJoinOperatorAnd.setValue(this.isDefaultOperator('AND'));
            this.eJoinOperatorOr.setValue(this.isDefaultOperator('OR'));
            this.eType1.setValue(simpleModel.type);
            this.eType2.setValue(this.optionsFactory.getDefaultOption());
            this.setConditionIntoUi(simpleModel, ConditionPosition.One);
            this.setConditionIntoUi(null, ConditionPosition.Two);
        }
        return AgPromise.resolve();
    };
    SimpleFilter.prototype.doesFilterPass = function (params) {
        var _this = this;
        var model = this.getModel();
        if (model == null) {
            return true;
        }
        var operator = model.operator;
        var models = [];
        if (operator) {
            var combinedModel = model;
            models.push(combinedModel.condition1, combinedModel.condition2);
        }
        else {
            models.push(model);
        }
        var combineFunction = operator && operator === 'OR' ? some : every;
        return combineFunction(models, function (m) { return _this.individualConditionPasses(params, m); });
    };
    SimpleFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOptions());
        this.allowTwoConditions = !params.suppressAndOrCondition;
        this.alwaysShowBothConditions = !!params.alwaysShowBothConditions;
        this.defaultJoinOperator = this.getDefaultJoinOperator(params.defaultJoinOperator);
        this.putOptionsIntoDropdown();
        this.addChangedListeners();
    };
    SimpleFilter.prototype.getDefaultJoinOperator = function (defaultJoinOperator) {
        return includes(['AND', 'OR'], defaultJoinOperator) ? defaultJoinOperator : 'AND';
    };
    SimpleFilter.prototype.putOptionsIntoDropdown = function () {
        var _this = this;
        var filterOptions = this.optionsFactory.getFilterOptions();
        forEach(filterOptions, function (option) {
            var value;
            var text;
            if (typeof option === 'string') {
                value = option;
                text = _this.translate(value);
            }
            else {
                value = option.displayKey;
                var customOption = _this.optionsFactory.getCustomOption(value);
                text = customOption ?
                    _this.gridOptionsWrapper.getLocaleTextFunc()(customOption.displayKey, customOption.displayName) :
                    _this.translate(value);
            }
            var createOption = function () { return ({ value: value, text: text }); };
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
        return /* html */ "\n            <ag-select class=\"ag-filter-select\" ref=\"eOptions1\"></ag-select>\n            " + this.createValueTemplate(ConditionPosition.One) + "\n            <div class=\"ag-filter-condition\" ref=\"eJoinOperatorPanel\">\n               <ag-radio-button ref=\"eJoinOperatorAnd\" class=\"ag-filter-condition-operator ag-filter-condition-operator-and\"></ag-radio-button>\n               <ag-radio-button ref=\"eJoinOperatorOr\" class=\"ag-filter-condition-operator ag-filter-condition-operator-or\"></ag-radio-button>\n            </div>\n            <ag-select class=\"ag-filter-select\" ref=\"eOptions2\"></ag-select>\n            " + this.createValueTemplate(ConditionPosition.Two);
    };
    SimpleFilter.prototype.getCssIdentifier = function () {
        return 'simple-filter';
    };
    SimpleFilter.prototype.updateUiVisibility = function () {
        var isCondition2Enabled = this.isCondition2Enabled();
        if (this.alwaysShowBothConditions) {
            this.eJoinOperatorAnd.setDisabled(!isCondition2Enabled);
            this.eJoinOperatorOr.setDisabled(!isCondition2Enabled);
            this.eType2.setDisabled(!isCondition2Enabled);
            setDisabled(this.eCondition2Body, !isCondition2Enabled);
        }
        else {
            setDisplayed(this.eJoinOperatorPanel, isCondition2Enabled);
            setDisplayed(this.eType2.getGui(), isCondition2Enabled);
            setDisplayed(this.eCondition2Body, isCondition2Enabled);
        }
    };
    SimpleFilter.prototype.isCondition2Enabled = function () {
        return this.allowTwoConditions && this.isConditionUiComplete(ConditionPosition.One);
    };
    SimpleFilter.prototype.resetUiToDefaults = function (silent) {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var filteringLabel = translate('ariaFilteringOperator', 'Filtering operator');
        var uniqueGroupId = 'ag-simple-filter-and-or-' + this.getCompId();
        var defaultOption = this.optionsFactory.getDefaultOption();
        this.eType1.setValue(defaultOption, silent).setAriaLabel(filteringLabel);
        this.eType2.setValue(defaultOption, silent).setAriaLabel(filteringLabel);
        this.eJoinOperatorAnd
            .setValue(this.isDefaultOperator('AND'), silent)
            .setName(uniqueGroupId)
            .setLabel(this.translate('andCondition'));
        this.eJoinOperatorOr
            .setValue(this.isDefaultOperator('OR'), silent)
            .setName(uniqueGroupId)
            .setLabel(this.translate('orCondition'));
        return AgPromise.resolve();
    };
    SimpleFilter.prototype.isDefaultOperator = function (operator) {
        return operator === this.defaultJoinOperator;
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
        RefSelector('eJoinOperatorPanel')
    ], SimpleFilter.prototype, "eJoinOperatorPanel", void 0);
    __decorate([
        RefSelector('eJoinOperatorAnd')
    ], SimpleFilter.prototype, "eJoinOperatorAnd", void 0);
    __decorate([
        RefSelector('eJoinOperatorOr')
    ], SimpleFilter.prototype, "eJoinOperatorOr", void 0);
    __decorate([
        RefSelector('eCondition1Body')
    ], SimpleFilter.prototype, "eCondition1Body", void 0);
    __decorate([
        RefSelector('eCondition2Body')
    ], SimpleFilter.prototype, "eCondition2Body", void 0);
    return SimpleFilter;
}(ProvidedFilter));
export { SimpleFilter };
