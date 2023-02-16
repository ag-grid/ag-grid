/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
import { AgSelect } from '../../widgets/agSelect';
import { includes } from '../../utils/array';
import { setDisplayed, setDisabled } from '../../utils/dom';
import { Component } from '../../widgets/component';
import { AgAbstractInputField } from '../../widgets/agAbstractInputField';
import { isFunction } from '../../utils/function';
export var ConditionPosition;
(function (ConditionPosition) {
    ConditionPosition[ConditionPosition["One"] = 0] = "One";
    ConditionPosition[ConditionPosition["Two"] = 1] = "Two";
})(ConditionPosition || (ConditionPosition = {}));
var SimpleFilterModelFormatter = /** @class */ (function () {
    function SimpleFilterModelFormatter(localeService, optionsFactory) {
        this.localeService = localeService;
        this.optionsFactory = optionsFactory;
    }
    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    SimpleFilterModelFormatter.prototype.getModelAsString = function (model) {
        if (!model) {
            return null;
        }
        var isCombined = model.operator != null;
        if (isCombined) {
            var combinedModel = model;
            var _a = combinedModel || {}, condition1 = _a.condition1, condition2 = _a.condition2;
            var customOption1 = this.getModelAsString(condition1);
            var customOption2 = this.getModelAsString(condition2);
            return [
                customOption1,
                combinedModel.operator,
                customOption2,
            ].join(' ');
        }
        else if (model.type === SimpleFilter.BLANK || model.type === SimpleFilter.NOT_BLANK) {
            var translate = this.localeService.getLocaleTextFunc();
            return translate(model.type, model.type);
        }
        else {
            var condition = model;
            var customOption = this.optionsFactory.getCustomOption(condition.type);
            // For custom filter options we display the Name of the filter instead
            // of displaying the `from` value, as it wouldn't be relevant
            var _b = customOption || {}, displayKey = _b.displayKey, displayName = _b.displayName, numberOfInputs = _b.numberOfInputs;
            if (displayKey && displayName && numberOfInputs === 0) {
                this.localeService.getLocaleTextFunc()(displayKey, displayName);
                return displayName;
            }
            return this.conditionToString(condition, customOption);
        }
    };
    return SimpleFilterModelFormatter;
}());
export { SimpleFilterModelFormatter };
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 * @param E type of UI element used for collecting user-input
 */
var SimpleFilter = /** @class */ (function (_super) {
    __extends(SimpleFilter, _super);
    function SimpleFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SimpleFilter.prototype.getNumberOfInputs = function (type) {
        var customOpts = this.optionsFactory.getCustomOption(type);
        if (customOpts) {
            var numberOfInputs = customOpts.numberOfInputs;
            return numberOfInputs != null ? numberOfInputs : 1;
        }
        var zeroInputTypes = [
            SimpleFilter.EMPTY, SimpleFilter.NOT_BLANK, SimpleFilter.BLANK,
        ];
        if (type && zeroInputTypes.indexOf(type) >= 0) {
            return 0;
        }
        else if (type === SimpleFilter.IN_RANGE) {
            return 2;
        }
        return 1;
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
    SimpleFilter.prototype.getConditionTypes = function () {
        return [
            this.eType1.getValue(),
            this.eType2.getValue(),
        ];
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
        var combineFunction = operator && operator === 'OR' ? 'some' : 'every';
        return models[combineFunction](function (m) { return _this.individualConditionPasses(params, m); });
    };
    SimpleFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOptions());
        this.allowTwoConditions = !params.suppressAndOrCondition;
        this.alwaysShowBothConditions = !!params.alwaysShowBothConditions;
        this.defaultJoinOperator = this.getDefaultJoinOperator(params.defaultJoinOperator);
        this.filterPlaceholder = params.filterPlaceholder;
        this.putOptionsIntoDropdown();
        this.addChangedListeners();
    };
    SimpleFilter.prototype.getDefaultJoinOperator = function (defaultJoinOperator) {
        return includes(['AND', 'OR'], defaultJoinOperator) ? defaultJoinOperator : 'AND';
    };
    SimpleFilter.prototype.putOptionsIntoDropdown = function () {
        var _this = this;
        var filterOptions = this.optionsFactory.getFilterOptions();
        var eTypes = [this.eType1, this.eType2];
        // Add specified options to all condition drop-downs.
        filterOptions.forEach(function (option) {
            var listOption = typeof option === 'string' ?
                _this.createBoilerplateListOption(option) :
                _this.createCustomListOption(option);
            eTypes.forEach(function (eType) { return eType.addOption(listOption); });
        });
        // Make drop-downs read-only if there is only one option.
        eTypes.forEach(function (eType) { return eType.setDisabled(filterOptions.length <= 1); });
    };
    SimpleFilter.prototype.createBoilerplateListOption = function (option) {
        return { value: option, text: this.translate(option) };
    };
    SimpleFilter.prototype.createCustomListOption = function (option) {
        var displayKey = option.displayKey;
        var customOption = this.optionsFactory.getCustomOption(option.displayKey);
        return {
            value: displayKey,
            text: customOption ?
                this.localeService.getLocaleTextFunc()(customOption.displayKey, customOption.displayName) :
                this.translate(displayKey),
        };
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
        var _this = this;
        var elementConditionGroups = [
            [this.eType1],
            [this.eType2, this.eJoinOperatorPanel, this.eJoinOperatorAnd, this.eJoinOperatorOr],
        ];
        var elementBodies = [this.eCondition1Body, this.eCondition2Body];
        elementConditionGroups.forEach(function (group, position) {
            var visible = _this.isConditionVisible(position);
            var disabled = _this.isConditionDisabled(position);
            group.forEach(function (element) {
                if (element instanceof AgAbstractInputField || element instanceof AgSelect) {
                    element.setDisabled(disabled);
                    element.setDisplayed(visible);
                }
                else {
                    setDisabled(element, disabled);
                    setDisplayed(element, visible);
                }
            });
        });
        elementBodies.forEach(function (element, index) {
            setDisplayed(element, _this.isConditionBodyVisible(index));
        });
        this.forEachInput(function (element, index, position, numberOfInputs) {
            _this.setElementDisplayed(element, index < numberOfInputs);
            _this.setElementDisabled(element, _this.isConditionDisabled(position));
        });
        this.resetPlaceholder();
    };
    SimpleFilter.prototype.afterGuiAttached = function (params) {
        _super.prototype.afterGuiAttached.call(this, params);
        this.resetPlaceholder();
        if (!params || (!params.suppressFocus && !this.isReadOnly())) {
            var firstInput = this.getInputs()[0][0];
            if (!firstInput) {
                return;
            }
            if (firstInput instanceof AgAbstractInputField) {
                firstInput.getInputElement().focus();
            }
        }
    };
    SimpleFilter.prototype.getPlaceholderText = function (defaultPlaceholder, position) {
        var placeholder = this.translate(defaultPlaceholder);
        if (isFunction(this.filterPlaceholder)) {
            var filterPlaceholderFn = this.filterPlaceholder;
            var filterOptionKey = (position === 0 ? this.eType1.getValue() : this.eType2.getValue());
            var filterOption = this.translate(filterOptionKey);
            placeholder = filterPlaceholderFn({
                filterOptionKey: filterOptionKey,
                filterOption: filterOption,
                placeholder: placeholder
            });
        }
        else if (typeof this.filterPlaceholder === 'string') {
            placeholder = this.filterPlaceholder;
        }
        return placeholder;
    };
    // allow sub-classes to reset HTML placeholders after UI update.
    SimpleFilter.prototype.resetPlaceholder = function () {
        var _this = this;
        var globalTranslate = this.localeService.getLocaleTextFunc();
        this.forEachInput(function (element, index, position, numberOfInputs) {
            if (!(element instanceof AgAbstractInputField)) {
                return;
            }
            var placeholder = index === 0 && numberOfInputs > 1 ? 'inRangeStart' :
                index === 0 ? 'filterOoo' :
                    'inRangeEnd';
            var ariaLabel = index === 0 && numberOfInputs > 1 ? globalTranslate('ariaFilterFromValue', 'Filter from value') :
                index === 0 ? globalTranslate('ariaFilterValue', 'Filter Value') :
                    globalTranslate('ariaFilterToValue', 'Filter to Value');
            element.setInputPlaceholder(_this.getPlaceholderText(placeholder, position));
            element.setInputAriaLabel(ariaLabel);
        });
    };
    SimpleFilter.prototype.setElementValue = function (element, value, silent) {
        if (element instanceof AgAbstractInputField) {
            element.setValue(value != null ? String(value) : null, silent);
        }
    };
    SimpleFilter.prototype.setElementDisplayed = function (element, displayed) {
        if (element instanceof Component) {
            setDisplayed(element.getGui(), displayed);
        }
    };
    SimpleFilter.prototype.setElementDisabled = function (element, disabled) {
        if (element instanceof Component) {
            setDisabled(element.getGui(), disabled);
        }
    };
    SimpleFilter.prototype.attachElementOnChange = function (element, listener) {
        if (element instanceof AgAbstractInputField) {
            element.onValueChange(listener);
        }
    };
    SimpleFilter.prototype.forEachInput = function (cb) {
        var _this = this;
        var inputs = this.getInputs();
        this.getConditionTypes().forEach(function (type, position) {
            var numberOfInputs = _this.getNumberOfInputs(type);
            for (var index = 0; index < inputs[position].length; index++) {
                var input = inputs[position][index];
                if (input != null) {
                    cb(input, index, position, numberOfInputs);
                }
            }
        });
    };
    SimpleFilter.prototype.isConditionVisible = function (position) {
        if (position === 0) {
            return true;
        } // Position 0 should always be visible.
        if (!this.allowTwoConditions) {
            return false;
        } // Short-circuit if no tail conditions.
        if (this.isReadOnly()) {
            // Only display a condition when read-only if the condition is complete.
            return this.isConditionUiComplete(position);
        }
        if (this.alwaysShowBothConditions) {
            return true;
        }
        // Only display a 2nd or later condition when the previous condition is complete.
        return this.isConditionUiComplete(position - 1);
    };
    SimpleFilter.prototype.isConditionDisabled = function (position) {
        if (this.isReadOnly()) {
            return true;
        } // Read-only mode trumps everything.
        if (!this.isConditionVisible(position)) {
            return true;
        } // Invisible implies disabled.
        if (position === 0) {
            return false;
        } // Position 0 should typically be editable.
        // Only allow editing of a 2nd or later condition if the previous condition is complete.
        return !this.isConditionUiComplete(position - 1);
    };
    SimpleFilter.prototype.isConditionBodyVisible = function (position) {
        if (!this.isConditionVisible(position)) {
            return false;
        }
        // Check that the condition needs inputs.
        var type = this.getConditionTypes()[position];
        var numberOfInputs = this.getNumberOfInputs(type);
        return numberOfInputs > 0;
    };
    // returns true if the UI represents a working filter, eg all parts are filled out.
    // eg if text filter and textfield blank then returns false.
    SimpleFilter.prototype.isConditionUiComplete = function (position) {
        var type = this.getConditionTypes()[position];
        if (type === SimpleFilter.EMPTY) {
            return false;
        }
        if (this.getValues(position).some(function (v) { return v == null; })) {
            return false;
        }
        return true;
    };
    SimpleFilter.prototype.resetUiToDefaults = function (silent) {
        var _this = this;
        var translate = this.localeService.getLocaleTextFunc();
        var filteringLabel = translate('ariaFilteringOperator', 'Filtering operator');
        var uniqueGroupId = 'ag-simple-filter-and-or-' + this.getCompId();
        var defaultOption = this.optionsFactory.getDefaultOption();
        this.eType1
            .setValue(defaultOption, silent)
            .setAriaLabel(filteringLabel)
            .setDisabled(this.isReadOnly());
        this.eType2
            .setValue(this.optionsFactory.getDefaultOption(), silent)
            .setAriaLabel(filteringLabel)
            .setDisabled(this.isReadOnly());
        this.eJoinOperatorAnd
            .setValue(this.isDefaultOperator('AND'), silent)
            .setName(uniqueGroupId)
            .setLabel(this.translate('andCondition'))
            .setDisabled(this.isReadOnly());
        this.eJoinOperatorOr
            .setValue(this.isDefaultOperator('OR'), silent)
            .setName(uniqueGroupId)
            .setLabel(this.translate('orCondition'))
            .setDisabled(this.isReadOnly());
        this.forEachInput(function (element) {
            _this.setElementValue(element, null, silent);
            _this.setElementDisabled(element, _this.isReadOnly());
        });
        this.resetPlaceholder();
        return AgPromise.resolve();
    };
    // puts model values into the UI
    SimpleFilter.prototype.setConditionIntoUi = function (model, position) {
        var _this = this;
        var values = this.mapValuesFromModel(model);
        this.forEachInput(function (element, index, elPosition, _) {
            if (elPosition !== position) {
                return;
            }
            _this.setElementValue(element, values[index] != null ? values[index] : null);
        });
    };
    // after floating filter changes, this sets the 'value' section. this is implemented by the base class
    // (as that's where value is controlled), the 'type' part from the floating filter is dealt with in this class.
    SimpleFilter.prototype.setValueFromFloatingFilter = function (value) {
        var _this = this;
        this.forEachInput(function (element, index, position, _) {
            _this.setElementValue(element, index === 0 && position === 0 ? value : null);
        });
    };
    SimpleFilter.prototype.isDefaultOperator = function (operator) {
        return operator === this.defaultJoinOperator;
    };
    SimpleFilter.prototype.addChangedListeners = function () {
        var _this = this;
        if (this.isReadOnly()) {
            return;
        }
        var listener = function () { return _this.onUiChanged(); };
        this.eType1.onValueChange(listener);
        this.eType2.onValueChange(listener);
        this.eJoinOperatorOr.onValueChange(listener);
        this.eJoinOperatorAnd.onValueChange(listener);
        this.forEachInput(function (element) {
            _this.attachElementOnChange(element, listener);
        });
    };
    /** returns true if the row passes the said condition */
    SimpleFilter.prototype.individualConditionPasses = function (params, filterModel) {
        var cellValue = this.getCellValue(params.node);
        var values = this.mapValuesFromModel(filterModel);
        var customFilterOption = this.optionsFactory.getCustomOption(filterModel.type);
        var customFilterResult = this.evaluateCustomFilter(customFilterOption, values, cellValue);
        if (customFilterResult != null) {
            return customFilterResult;
        }
        if (cellValue == null) {
            return this.evaluateNullValue(filterModel.type);
        }
        return this.evaluateNonNullValue(values, cellValue, filterModel, params);
    };
    SimpleFilter.prototype.evaluateCustomFilter = function (customFilterOption, values, cellValue) {
        if (customFilterOption == null) {
            return;
        }
        var predicate = customFilterOption.predicate;
        // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
        if (predicate != null && !values.some(function (v) { return v == null; })) {
            return predicate(values, cellValue);
        }
        // No custom filter invocation, indicate that to the caller.
        return;
    };
    SimpleFilter.prototype.isBlank = function (cellValue) {
        return cellValue == null ||
            (typeof cellValue === 'string' && cellValue.trim().length === 0);
    };
    SimpleFilter.EMPTY = 'empty';
    SimpleFilter.BLANK = 'blank';
    SimpleFilter.NOT_BLANK = 'notBlank';
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
