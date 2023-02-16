/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
export class SimpleFilterModelFormatter {
    constructor(localeService, optionsFactory) {
        this.localeService = localeService;
        this.optionsFactory = optionsFactory;
    }
    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    getModelAsString(model) {
        if (!model) {
            return null;
        }
        const isCombined = model.operator != null;
        if (isCombined) {
            const combinedModel = model;
            const { condition1, condition2 } = combinedModel || {};
            const customOption1 = this.getModelAsString(condition1);
            const customOption2 = this.getModelAsString(condition2);
            return [
                customOption1,
                combinedModel.operator,
                customOption2,
            ].join(' ');
        }
        else if (model.type === SimpleFilter.BLANK || model.type === SimpleFilter.NOT_BLANK) {
            const translate = this.localeService.getLocaleTextFunc();
            return translate(model.type, model.type);
        }
        else {
            const condition = model;
            const customOption = this.optionsFactory.getCustomOption(condition.type);
            // For custom filter options we display the Name of the filter instead
            // of displaying the `from` value, as it wouldn't be relevant
            const { displayKey, displayName, numberOfInputs } = customOption || {};
            if (displayKey && displayName && numberOfInputs === 0) {
                this.localeService.getLocaleTextFunc()(displayKey, displayName);
                return displayName;
            }
            return this.conditionToString(condition, customOption);
        }
    }
}
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 * @param E type of UI element used for collecting user-input
 */
export class SimpleFilter extends ProvidedFilter {
    getNumberOfInputs(type) {
        const customOpts = this.optionsFactory.getCustomOption(type);
        if (customOpts) {
            const { numberOfInputs } = customOpts;
            return numberOfInputs != null ? numberOfInputs : 1;
        }
        const zeroInputTypes = [
            SimpleFilter.EMPTY, SimpleFilter.NOT_BLANK, SimpleFilter.BLANK,
        ];
        if (type && zeroInputTypes.indexOf(type) >= 0) {
            return 0;
        }
        else if (type === SimpleFilter.IN_RANGE) {
            return 2;
        }
        return 1;
    }
    // floating filter calls this when user applies filter from floating filter
    onFloatingFilterChanged(type, value) {
        this.setTypeFromFloatingFilter(type);
        this.setValueFromFloatingFilter(value);
        this.onUiChanged(true);
    }
    setTypeFromFloatingFilter(type) {
        this.eType1.setValue(type);
        this.eType2.setValue(this.optionsFactory.getDefaultOption());
        (this.isDefaultOperator('AND') ? this.eJoinOperatorAnd : this.eJoinOperatorOr).setValue(true);
    }
    getModelFromUi() {
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
    }
    getConditionTypes() {
        return [
            this.eType1.getValue(),
            this.eType2.getValue(),
        ];
    }
    getJoinOperator() {
        return this.eJoinOperatorOr.getValue() === true ? 'OR' : 'AND';
    }
    areModelsEqual(a, b) {
        // both are missing
        if (!a && !b) {
            return true;
        }
        // one is missing, other present
        if ((!a && b) || (a && !b)) {
            return false;
        }
        // one is combined, the other is not
        const aIsSimple = !a.operator;
        const bIsSimple = !b.operator;
        const oneSimpleOneCombined = (!aIsSimple && bIsSimple) || (aIsSimple && !bIsSimple);
        if (oneSimpleOneCombined) {
            return false;
        }
        let res;
        // otherwise both present, so compare
        if (aIsSimple) {
            const aSimple = a;
            const bSimple = b;
            res = this.areSimpleModelsEqual(aSimple, bSimple);
        }
        else {
            const aCombined = a;
            const bCombined = b;
            res = aCombined.operator === bCombined.operator
                && this.areSimpleModelsEqual(aCombined.condition1, bCombined.condition1)
                && this.areSimpleModelsEqual(aCombined.condition2, bCombined.condition2);
        }
        return res;
    }
    setModelIntoUi(model) {
        const isCombined = model.operator;
        if (isCombined) {
            const combinedModel = model;
            const orChecked = combinedModel.operator === 'OR';
            this.eJoinOperatorAnd.setValue(!orChecked);
            this.eJoinOperatorOr.setValue(orChecked);
            this.eType1.setValue(combinedModel.condition1.type);
            this.eType2.setValue(combinedModel.condition2.type);
            this.setConditionIntoUi(combinedModel.condition1, ConditionPosition.One);
            this.setConditionIntoUi(combinedModel.condition2, ConditionPosition.Two);
        }
        else {
            const simpleModel = model;
            this.eJoinOperatorAnd.setValue(this.isDefaultOperator('AND'));
            this.eJoinOperatorOr.setValue(this.isDefaultOperator('OR'));
            this.eType1.setValue(simpleModel.type);
            this.eType2.setValue(this.optionsFactory.getDefaultOption());
            this.setConditionIntoUi(simpleModel, ConditionPosition.One);
            this.setConditionIntoUi(null, ConditionPosition.Two);
        }
        return AgPromise.resolve();
    }
    doesFilterPass(params) {
        const model = this.getModel();
        if (model == null) {
            return true;
        }
        const { operator } = model;
        const models = [];
        if (operator) {
            const combinedModel = model;
            models.push(combinedModel.condition1, combinedModel.condition2);
        }
        else {
            models.push(model);
        }
        const combineFunction = operator && operator === 'OR' ? 'some' : 'every';
        return models[combineFunction](m => this.individualConditionPasses(params, m));
    }
    setParams(params) {
        super.setParams(params);
        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOptions());
        this.allowTwoConditions = !params.suppressAndOrCondition;
        this.alwaysShowBothConditions = !!params.alwaysShowBothConditions;
        this.defaultJoinOperator = this.getDefaultJoinOperator(params.defaultJoinOperator);
        this.filterPlaceholder = params.filterPlaceholder;
        this.putOptionsIntoDropdown();
        this.addChangedListeners();
    }
    getDefaultJoinOperator(defaultJoinOperator) {
        return includes(['AND', 'OR'], defaultJoinOperator) ? defaultJoinOperator : 'AND';
    }
    putOptionsIntoDropdown() {
        const filterOptions = this.optionsFactory.getFilterOptions();
        const eTypes = [this.eType1, this.eType2];
        // Add specified options to all condition drop-downs.
        filterOptions.forEach(option => {
            const listOption = typeof option === 'string' ?
                this.createBoilerplateListOption(option) :
                this.createCustomListOption(option);
            eTypes.forEach(eType => eType.addOption(listOption));
        });
        // Make drop-downs read-only if there is only one option.
        eTypes.forEach(eType => eType.setDisabled(filterOptions.length <= 1));
    }
    createBoilerplateListOption(option) {
        return { value: option, text: this.translate(option) };
    }
    createCustomListOption(option) {
        const { displayKey } = option;
        const customOption = this.optionsFactory.getCustomOption(option.displayKey);
        return {
            value: displayKey,
            text: customOption ?
                this.localeService.getLocaleTextFunc()(customOption.displayKey, customOption.displayName) :
                this.translate(displayKey),
        };
    }
    isAllowTwoConditions() {
        return this.allowTwoConditions;
    }
    createBodyTemplate() {
        return /* html */ `
            <ag-select class="ag-filter-select" ref="eOptions1"></ag-select>
            ${this.createValueTemplate(ConditionPosition.One)}
            <div class="ag-filter-condition" ref="eJoinOperatorPanel">
               <ag-radio-button ref="eJoinOperatorAnd" class="ag-filter-condition-operator ag-filter-condition-operator-and"></ag-radio-button>
               <ag-radio-button ref="eJoinOperatorOr" class="ag-filter-condition-operator ag-filter-condition-operator-or"></ag-radio-button>
            </div>
            <ag-select class="ag-filter-select" ref="eOptions2"></ag-select>
            ${this.createValueTemplate(ConditionPosition.Two)}`;
    }
    getCssIdentifier() {
        return 'simple-filter';
    }
    updateUiVisibility() {
        const elementConditionGroups = [
            [this.eType1],
            [this.eType2, this.eJoinOperatorPanel, this.eJoinOperatorAnd, this.eJoinOperatorOr],
        ];
        const elementBodies = [this.eCondition1Body, this.eCondition2Body];
        elementConditionGroups.forEach((group, position) => {
            const visible = this.isConditionVisible(position);
            const disabled = this.isConditionDisabled(position);
            group.forEach(element => {
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
        elementBodies.forEach((element, index) => {
            setDisplayed(element, this.isConditionBodyVisible(index));
        });
        this.forEachInput((element, index, position, numberOfInputs) => {
            this.setElementDisplayed(element, index < numberOfInputs);
            this.setElementDisabled(element, this.isConditionDisabled(position));
        });
        this.resetPlaceholder();
    }
    afterGuiAttached(params) {
        super.afterGuiAttached(params);
        this.resetPlaceholder();
        if (!params || (!params.suppressFocus && !this.isReadOnly())) {
            const firstInput = this.getInputs()[0][0];
            if (!firstInput) {
                return;
            }
            if (firstInput instanceof AgAbstractInputField) {
                firstInput.getInputElement().focus();
            }
        }
    }
    getPlaceholderText(defaultPlaceholder, position) {
        let placeholder = this.translate(defaultPlaceholder);
        if (isFunction(this.filterPlaceholder)) {
            const filterPlaceholderFn = this.filterPlaceholder;
            const filterOptionKey = (position === 0 ? this.eType1.getValue() : this.eType2.getValue());
            const filterOption = this.translate(filterOptionKey);
            placeholder = filterPlaceholderFn({
                filterOptionKey,
                filterOption,
                placeholder
            });
        }
        else if (typeof this.filterPlaceholder === 'string') {
            placeholder = this.filterPlaceholder;
        }
        return placeholder;
    }
    // allow sub-classes to reset HTML placeholders after UI update.
    resetPlaceholder() {
        const globalTranslate = this.localeService.getLocaleTextFunc();
        this.forEachInput((element, index, position, numberOfInputs) => {
            if (!(element instanceof AgAbstractInputField)) {
                return;
            }
            const placeholder = index === 0 && numberOfInputs > 1 ? 'inRangeStart' :
                index === 0 ? 'filterOoo' :
                    'inRangeEnd';
            const ariaLabel = index === 0 && numberOfInputs > 1 ? globalTranslate('ariaFilterFromValue', 'Filter from value') :
                index === 0 ? globalTranslate('ariaFilterValue', 'Filter Value') :
                    globalTranslate('ariaFilterToValue', 'Filter to Value');
            element.setInputPlaceholder(this.getPlaceholderText(placeholder, position));
            element.setInputAriaLabel(ariaLabel);
        });
    }
    setElementValue(element, value, silent) {
        if (element instanceof AgAbstractInputField) {
            element.setValue(value != null ? String(value) : null, silent);
        }
    }
    setElementDisplayed(element, displayed) {
        if (element instanceof Component) {
            setDisplayed(element.getGui(), displayed);
        }
    }
    setElementDisabled(element, disabled) {
        if (element instanceof Component) {
            setDisabled(element.getGui(), disabled);
        }
    }
    attachElementOnChange(element, listener) {
        if (element instanceof AgAbstractInputField) {
            element.onValueChange(listener);
        }
    }
    forEachInput(cb) {
        const inputs = this.getInputs();
        this.getConditionTypes().forEach((type, position) => {
            const numberOfInputs = this.getNumberOfInputs(type);
            for (let index = 0; index < inputs[position].length; index++) {
                const input = inputs[position][index];
                if (input != null) {
                    cb(input, index, position, numberOfInputs);
                }
            }
        });
    }
    isConditionVisible(position) {
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
    }
    isConditionDisabled(position) {
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
    }
    isConditionBodyVisible(position) {
        if (!this.isConditionVisible(position)) {
            return false;
        }
        // Check that the condition needs inputs.
        const type = this.getConditionTypes()[position];
        const numberOfInputs = this.getNumberOfInputs(type);
        return numberOfInputs > 0;
    }
    // returns true if the UI represents a working filter, eg all parts are filled out.
    // eg if text filter and textfield blank then returns false.
    isConditionUiComplete(position) {
        const type = this.getConditionTypes()[position];
        if (type === SimpleFilter.EMPTY) {
            return false;
        }
        if (this.getValues(position).some(v => v == null)) {
            return false;
        }
        return true;
    }
    resetUiToDefaults(silent) {
        const translate = this.localeService.getLocaleTextFunc();
        const filteringLabel = translate('ariaFilteringOperator', 'Filtering operator');
        const uniqueGroupId = 'ag-simple-filter-and-or-' + this.getCompId();
        const defaultOption = this.optionsFactory.getDefaultOption();
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
        this.forEachInput((element) => {
            this.setElementValue(element, null, silent);
            this.setElementDisabled(element, this.isReadOnly());
        });
        this.resetPlaceholder();
        return AgPromise.resolve();
    }
    // puts model values into the UI
    setConditionIntoUi(model, position) {
        const values = this.mapValuesFromModel(model);
        this.forEachInput((element, index, elPosition, _) => {
            if (elPosition !== position) {
                return;
            }
            this.setElementValue(element, values[index] != null ? values[index] : null);
        });
    }
    // after floating filter changes, this sets the 'value' section. this is implemented by the base class
    // (as that's where value is controlled), the 'type' part from the floating filter is dealt with in this class.
    setValueFromFloatingFilter(value) {
        this.forEachInput((element, index, position, _) => {
            this.setElementValue(element, index === 0 && position === 0 ? value : null);
        });
    }
    isDefaultOperator(operator) {
        return operator === this.defaultJoinOperator;
    }
    addChangedListeners() {
        if (this.isReadOnly()) {
            return;
        }
        const listener = () => this.onUiChanged();
        this.eType1.onValueChange(listener);
        this.eType2.onValueChange(listener);
        this.eJoinOperatorOr.onValueChange(listener);
        this.eJoinOperatorAnd.onValueChange(listener);
        this.forEachInput((element) => {
            this.attachElementOnChange(element, listener);
        });
    }
    /** returns true if the row passes the said condition */
    individualConditionPasses(params, filterModel) {
        const cellValue = this.getCellValue(params.node);
        const values = this.mapValuesFromModel(filterModel);
        const customFilterOption = this.optionsFactory.getCustomOption(filterModel.type);
        const customFilterResult = this.evaluateCustomFilter(customFilterOption, values, cellValue);
        if (customFilterResult != null) {
            return customFilterResult;
        }
        if (cellValue == null) {
            return this.evaluateNullValue(filterModel.type);
        }
        return this.evaluateNonNullValue(values, cellValue, filterModel, params);
    }
    evaluateCustomFilter(customFilterOption, values, cellValue) {
        if (customFilterOption == null) {
            return;
        }
        const { predicate } = customFilterOption;
        // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
        if (predicate != null && !values.some(v => v == null)) {
            return predicate(values, cellValue);
        }
        // No custom filter invocation, indicate that to the caller.
        return;
    }
    isBlank(cellValue) {
        return cellValue == null ||
            (typeof cellValue === 'string' && cellValue.trim().length === 0);
    }
}
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
