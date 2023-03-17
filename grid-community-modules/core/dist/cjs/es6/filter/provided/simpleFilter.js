/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleFilter = exports.SimpleFilterModelFormatter = void 0;
const optionsFactory_1 = require("./optionsFactory");
const providedFilter_1 = require("./providedFilter");
const utils_1 = require("../../utils");
const agSelect_1 = require("../../widgets/agSelect");
const agRadioButton_1 = require("../../widgets/agRadioButton");
const array_1 = require("../../utils/array");
const dom_1 = require("../../utils/dom");
const filterLocaleText_1 = require("../filterLocaleText");
const component_1 = require("../../widgets/component");
const agAbstractInputField_1 = require("../../widgets/agAbstractInputField");
const function_1 = require("../../utils/function");
class SimpleFilterModelFormatter {
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
        const translate = this.localeService.getLocaleTextFunc();
        if (isCombined) {
            const combinedModel = model;
            let { conditions } = combinedModel;
            if (!conditions) {
                const { condition1, condition2 } = combinedModel;
                conditions = [condition1, condition2];
            }
            const customOptions = conditions.map(condition => this.getModelAsString(condition));
            const joinOperatorTranslateKey = combinedModel.operator === 'AND' ? 'andCondition' : 'orCondition';
            return customOptions.join(` ${translate(joinOperatorTranslateKey, filterLocaleText_1.DEFAULT_FILTER_LOCALE_TEXT[joinOperatorTranslateKey])} `);
        }
        else if (model.type === SimpleFilter.BLANK || model.type === SimpleFilter.NOT_BLANK) {
            return translate(model.type, model.type);
        }
        else {
            const condition = model;
            const customOption = this.optionsFactory.getCustomOption(condition.type);
            // For custom filter options we display the Name of the filter instead
            // of displaying the `from` value, as it wouldn't be relevant
            const { displayKey, displayName, numberOfInputs } = customOption || {};
            if (displayKey && displayName && numberOfInputs === 0) {
                translate(displayKey, displayName);
                return displayName;
            }
            return this.conditionToString(condition, customOption);
        }
    }
}
exports.SimpleFilterModelFormatter = SimpleFilterModelFormatter;
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 * @param E type of UI element used for collecting user-input
 */
class SimpleFilter extends providedFilter_1.ProvidedFilter {
    constructor() {
        super(...arguments);
        this.eTypes = [];
        this.eJoinOperatorPanels = [];
        this.eJoinOperatorsAnd = [];
        this.eJoinOperatorsOr = [];
        this.eConditionBodies = [];
        this.listener = () => this.onUiChanged();
        this.lastUiCompletePosition = null;
        this.joinOperatorId = 0;
    }
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
        this.eTypes.forEach((eType, position) => {
            if (position === 0) {
                eType.setValue(type, true);
            }
            else {
                eType.setValue(this.optionsFactory.getDefaultOption(), true);
            }
        });
    }
    getModelFromUi() {
        const conditions = this.getUiCompleteConditions();
        if (conditions.length === 0) {
            return null;
        }
        if (this.maxNumConditions > 1 && conditions.length > 1) {
            return {
                filterType: this.getFilterType(),
                operator: this.getJoinOperator(),
                condition1: conditions[0],
                condition2: conditions[1],
                conditions
            };
        }
        return conditions[0];
    }
    getConditionTypes() {
        return this.eTypes.map(eType => eType.getValue());
    }
    getConditionType(position) {
        return this.eTypes[position].getValue();
    }
    getJoinOperator() {
        if (this.eJoinOperatorsOr.length === 0) {
            return this.defaultJoinOperator;
        }
        return this.eJoinOperatorsOr[0].getValue() === true ? 'OR' : 'AND';
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
                && array_1.areEqual(aCombined.conditions, bCombined.conditions, (aModel, bModel) => this.areSimpleModelsEqual(aModel, bModel));
        }
        return res;
    }
    setModelIntoUi(model) {
        const isCombined = model.operator;
        if (isCombined) {
            let combinedModel = model;
            if (!combinedModel.conditions) {
                combinedModel.conditions = [
                    combinedModel.condition1,
                    combinedModel.condition2
                ];
            }
            const numConditions = this.validateAndUpdateConditions(combinedModel.conditions);
            const numPrevConditions = this.getNumConditions();
            if (numConditions < numPrevConditions) {
                this.removeConditionsAndOperators(numConditions);
            }
            else if (numConditions > numPrevConditions) {
                for (let i = numPrevConditions; i < numConditions; i++) {
                    this.createJoinOperatorPanel();
                    this.createOption();
                }
            }
            const orChecked = combinedModel.operator === 'OR';
            this.eJoinOperatorsAnd.forEach(eJoinOperatorAnd => eJoinOperatorAnd.setValue(!orChecked, true));
            this.eJoinOperatorsOr.forEach(eJoinOperatorOr => eJoinOperatorOr.setValue(orChecked, true));
            combinedModel.conditions.forEach((condition, position) => {
                this.eTypes[position].setValue(condition.type, true);
                this.setConditionIntoUi(condition, position);
            });
        }
        else {
            const simpleModel = model;
            if (this.getNumConditions() > 1) {
                this.removeConditionsAndOperators(1);
            }
            this.eTypes[0].setValue(simpleModel.type, true);
            this.setConditionIntoUi(simpleModel, 0);
        }
        this.lastUiCompletePosition = this.getNumConditions() - 1;
        this.createMissingConditionsAndOperators();
        this.onUiChanged();
        return utils_1.AgPromise.resolve();
    }
    validateAndUpdateConditions(conditions) {
        let numConditions = conditions.length;
        if (numConditions > this.maxNumConditions) {
            conditions.splice(this.maxNumConditions);
            function_1.doOnce(() => console.warn('AG Grid: Filter Model contains more conditions than "filterParams.maxNumConditions". Additional conditions have been ignored.'), 'simpleFilterSetModelMaxNumConditions');
            numConditions = this.maxNumConditions;
        }
        return numConditions;
    }
    doesFilterPass(params) {
        var _a;
        const model = this.getModel();
        if (model == null) {
            return true;
        }
        const { operator } = model;
        const models = [];
        if (operator) {
            const combinedModel = model;
            models.push(...((_a = combinedModel.conditions) !== null && _a !== void 0 ? _a : []));
        }
        else {
            models.push(model);
        }
        const combineFunction = operator && operator === 'OR' ? 'some' : 'every';
        return models[combineFunction](m => this.individualConditionPasses(params, m));
    }
    setParams(params) {
        super.setParams(params);
        this.setNumConditions(params);
        this.defaultJoinOperator = this.getDefaultJoinOperator(params.defaultJoinOperator);
        this.filterPlaceholder = params.filterPlaceholder;
        this.optionsFactory = new optionsFactory_1.OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOptions());
        this.createOption();
        this.createMissingConditionsAndOperators();
    }
    setNumConditions(params) {
        var _a, _b;
        if (params.suppressAndOrCondition != null) {
            function_1.doOnce(() => console.warn('AG Grid: Since v29.2 "filterParams.suppressAndOrCondition" is deprecated. Use "filterParams.maxNumConditions = 1" instead.'), 'simpleFilterSuppressAndOrCondition');
        }
        if (params.alwaysShowBothConditions != null) {
            function_1.doOnce(() => console.warn('AG Grid: Since v29.2 "filterParams.alwaysShowBothConditions" is deprecated. Use "filterParams.numAlwaysVisibleConditions = 2" instead.'), 'simpleFilterAlwaysShowBothConditions');
        }
        this.maxNumConditions = (_a = params.maxNumConditions) !== null && _a !== void 0 ? _a : (params.suppressAndOrCondition ? 1 : 2);
        if (this.maxNumConditions < 1) {
            function_1.doOnce(() => console.warn('AG Grid: "filterParams.maxNumConditions" must be greater than or equal to zero.'), 'simpleFilterMaxNumConditions');
            this.maxNumConditions = 1;
        }
        this.numAlwaysVisibleConditions = (_b = params.numAlwaysVisibleConditions) !== null && _b !== void 0 ? _b : (params.alwaysShowBothConditions ? 2 : 1);
        if (this.numAlwaysVisibleConditions < 1) {
            function_1.doOnce(() => console.warn('AG Grid: "filterParams.numAlwaysVisibleConditions" must be greater than or equal to zero.'), 'simpleFilterNumAlwaysVisibleConditions');
            this.numAlwaysVisibleConditions = 1;
        }
        if (this.numAlwaysVisibleConditions > this.maxNumConditions) {
            function_1.doOnce(() => console.warn('AG Grid: "filterParams.numAlwaysVisibleConditions" cannot be greater than "filterParams.maxNumConditions".'), 'simpleFilterNumAlwaysVisibleGreaterThanMaxNumConditions');
            this.numAlwaysVisibleConditions = this.maxNumConditions;
        }
    }
    createOption() {
        const eType = this.createManagedBean(new agSelect_1.AgSelect());
        this.eTypes.push(eType);
        eType.addCssClass('ag-filter-select');
        this.eFilterBody.appendChild(eType.getGui());
        const eConditionBody = this.createValueElement();
        this.eConditionBodies.push(eConditionBody);
        this.eFilterBody.appendChild(eConditionBody);
        this.putOptionsIntoDropdown(eType);
        this.resetType(eType);
        const position = this.getNumConditions() - 1;
        this.forEachPositionInput(position, (element) => this.resetInput(element));
        this.addChangedListeners(eType, position);
    }
    createJoinOperatorPanel() {
        const eJoinOperatorPanel = document.createElement('div');
        this.eJoinOperatorPanels.push(eJoinOperatorPanel);
        eJoinOperatorPanel.classList.add('ag-filter-condition');
        const eJoinOperatorAnd = this.createJoinOperator(this.eJoinOperatorsAnd, eJoinOperatorPanel, 'and');
        const eJoinOperatorOr = this.createJoinOperator(this.eJoinOperatorsOr, eJoinOperatorPanel, 'or');
        this.eFilterBody.appendChild(eJoinOperatorPanel);
        const index = this.eJoinOperatorPanels.length - 1;
        const uniqueGroupId = this.joinOperatorId++;
        this.resetJoinOperatorAnd(eJoinOperatorAnd, index, uniqueGroupId);
        this.resetJoinOperatorOr(eJoinOperatorOr, index, uniqueGroupId);
        if (!this.isReadOnly()) {
            eJoinOperatorAnd.onValueChange(this.listener);
            eJoinOperatorOr.onValueChange(this.listener);
        }
    }
    createJoinOperator(eJoinOperators, eJoinOperatorPanel, andOr) {
        const eJoinOperator = this.createManagedBean(new agRadioButton_1.AgRadioButton());
        eJoinOperators.push(eJoinOperator);
        eJoinOperator.addCssClass('ag-filter-condition-operator');
        eJoinOperator.addCssClass(`ag-filter-condition-operator-${andOr}`);
        eJoinOperatorPanel.appendChild(eJoinOperator.getGui());
        return eJoinOperator;
    }
    getDefaultJoinOperator(defaultJoinOperator) {
        return defaultJoinOperator === 'AND' || defaultJoinOperator === 'OR' ? defaultJoinOperator : 'AND';
    }
    putOptionsIntoDropdown(eType) {
        const filterOptions = this.optionsFactory.getFilterOptions();
        // Add specified options to all condition drop-downs.
        filterOptions.forEach(option => {
            const listOption = typeof option === 'string' ?
                this.createBoilerplateListOption(option) :
                this.createCustomListOption(option);
            eType.addOption(listOption);
        });
        // Make drop-downs read-only if there is only one option.
        eType.setDisabled(filterOptions.length <= 1);
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
    /**
     * @deprecated As of v29.2 filters can have more than two conditions. Check `colDef.filterParams.maxNumConditions` instead.
     */
    isAllowTwoConditions() {
        return this.maxNumConditions >= 2;
    }
    createBodyTemplate() {
        // created dynamically
        return '';
    }
    getCssIdentifier() {
        return 'simple-filter';
    }
    updateUiVisibility() {
        const joinOperator = this.getJoinOperator();
        this.updateNumConditions();
        // from here, the number of elements in all the collections is correct, so can just update the values/statuses
        this.updateConditionStatusesAndValues(this.lastUiCompletePosition, joinOperator);
    }
    updateNumConditions() {
        var _a;
        // Collection sizes are already correct if updated via API, so only need to handle UI updates here
        let lastUiCompletePosition = -1;
        let areAllConditionsUiComplete = true;
        for (let position = 0; position < this.getNumConditions(); position++) {
            if (this.isConditionUiComplete(position)) {
                lastUiCompletePosition = position;
            }
            else {
                areAllConditionsUiComplete = false;
            }
        }
        if (this.shouldAddNewConditionAtEnd(areAllConditionsUiComplete)) {
            this.createJoinOperatorPanel();
            this.createOption();
        }
        else {
            const activePosition = (_a = this.lastUiCompletePosition) !== null && _a !== void 0 ? _a : this.getNumConditions() - 2;
            if (lastUiCompletePosition < activePosition) {
                // remove any incomplete conditions at the end, excluding the active position
                this.removeConditionsAndOperators(activePosition + 1);
                const removeStartPosition = lastUiCompletePosition + 1;
                const numConditionsToRemove = activePosition - removeStartPosition;
                if (numConditionsToRemove > 0) {
                    this.removeConditionsAndOperators(removeStartPosition, numConditionsToRemove);
                }
                this.createMissingConditionsAndOperators();
            }
        }
        this.lastUiCompletePosition = lastUiCompletePosition;
    }
    updateConditionStatusesAndValues(lastUiCompletePosition, joinOperator) {
        this.eTypes.forEach((eType, position) => {
            const disabled = this.isConditionDisabled(position, lastUiCompletePosition);
            const group = position === 1 ? [eType, this.eJoinOperatorPanels[0], this.eJoinOperatorsAnd[0], this.eJoinOperatorsOr[0]] : [eType];
            group.forEach(element => {
                if (element instanceof agAbstractInputField_1.AgAbstractInputField || element instanceof agSelect_1.AgSelect) {
                    element.setDisabled(disabled);
                }
                else {
                    dom_1.setDisabled(element, disabled);
                }
            });
        });
        this.eConditionBodies.forEach((element, index) => {
            dom_1.setDisplayed(element, this.isConditionBodyVisible(index));
        });
        const orChecked = (joinOperator !== null && joinOperator !== void 0 ? joinOperator : this.getJoinOperator()) === 'OR';
        this.eJoinOperatorsAnd.forEach((eJoinOperatorAnd, index) => {
            eJoinOperatorAnd.setValue(!orChecked, true);
        });
        this.eJoinOperatorsOr.forEach((eJoinOperatorOr, index) => {
            eJoinOperatorOr.setValue(orChecked, true);
        });
        this.forEachInput((element, index, position, numberOfInputs) => {
            this.setElementDisplayed(element, index < numberOfInputs);
            this.setElementDisabled(element, this.isConditionDisabled(position, lastUiCompletePosition));
        });
        this.resetPlaceholder();
    }
    shouldAddNewConditionAtEnd(areAllConditionsUiComplete) {
        return areAllConditionsUiComplete && this.getNumConditions() < this.maxNumConditions && !this.isReadOnly();
    }
    removeConditionsAndOperators(startPosition, deleteCount) {
        if (startPosition >= this.getNumConditions()) {
            return;
        }
        this.removeComponents(this.eTypes, startPosition, deleteCount);
        this.removeElements(this.eConditionBodies, startPosition, deleteCount);
        this.removeValueElements(startPosition, deleteCount);
        const joinOperatorIndex = Math.max(startPosition - 1, 0);
        this.removeElements(this.eJoinOperatorPanels, joinOperatorIndex, deleteCount);
        this.removeComponents(this.eJoinOperatorsAnd, joinOperatorIndex, deleteCount);
        this.removeComponents(this.eJoinOperatorsOr, joinOperatorIndex, deleteCount);
    }
    removeElements(elements, startPosition, deleteCount) {
        const removedElements = this.removeItems(elements, startPosition, deleteCount);
        removedElements.forEach(element => dom_1.removeFromParent(element));
    }
    removeComponents(components, startPosition, deleteCount) {
        const removedComponents = this.removeItems(components, startPosition, deleteCount);
        removedComponents.forEach(comp => {
            dom_1.removeFromParent(comp.getGui());
            this.destroyBean(comp);
        });
    }
    removeItems(items, startPosition, deleteCount) {
        return deleteCount == null ? items.splice(startPosition) : items.splice(startPosition, deleteCount);
    }
    afterGuiAttached(params) {
        super.afterGuiAttached(params);
        this.resetPlaceholder();
        if (!params || (!params.suppressFocus && !this.isReadOnly())) {
            const firstInput = this.getInputs(0)[0];
            if (!firstInput) {
                return;
            }
            if (firstInput instanceof agAbstractInputField_1.AgAbstractInputField) {
                firstInput.getInputElement().focus();
            }
        }
    }
    afterGuiDetached() {
        const appliedModel = this.getModel();
        if (!this.areModelsEqual(appliedModel, this.getModelFromUi())) {
            this.resetUiToActiveModel(appliedModel);
        }
        // remove incomplete positions
        let lastUiCompletePosition = -1;
        // as we remove incomplete positions, the last UI complete position will change
        let updatedLastUiCompletePosition = -1;
        let conditionsRemoved = false;
        const joinOperator = this.getJoinOperator();
        for (let position = this.getNumConditions() - 1; position >= 0; position--) {
            if (this.isConditionUiComplete(position)) {
                if (lastUiCompletePosition === -1) {
                    lastUiCompletePosition = position;
                    updatedLastUiCompletePosition = position;
                }
            }
            else {
                const shouldRemovePositionAtEnd = position >= this.numAlwaysVisibleConditions && !this.isConditionUiComplete(position - 1);
                const positionBeforeLastUiCompletePosition = position < lastUiCompletePosition;
                if (shouldRemovePositionAtEnd || positionBeforeLastUiCompletePosition) {
                    this.removeConditionsAndOperators(position, 1);
                    conditionsRemoved = true;
                    if (positionBeforeLastUiCompletePosition) {
                        updatedLastUiCompletePosition--;
                    }
                }
            }
        }
        let shouldUpdateConditionStatusesAndValues = false;
        if (this.getNumConditions() < this.numAlwaysVisibleConditions) {
            // if conditions have been removed, need to recreate new ones at the end up to the number required
            this.createMissingConditionsAndOperators();
            shouldUpdateConditionStatusesAndValues = true;
        }
        if (this.shouldAddNewConditionAtEnd(updatedLastUiCompletePosition === this.getNumConditions() - 1)) {
            this.createJoinOperatorPanel();
            this.createOption();
            shouldUpdateConditionStatusesAndValues = true;
        }
        if (shouldUpdateConditionStatusesAndValues) {
            this.updateConditionStatusesAndValues(updatedLastUiCompletePosition, joinOperator);
        }
        if (conditionsRemoved) {
            this.updateJoinOperatorsDisabled();
        }
        this.lastUiCompletePosition = updatedLastUiCompletePosition;
    }
    getPlaceholderText(defaultPlaceholder, position) {
        let placeholder = this.translate(defaultPlaceholder);
        if (function_1.isFunction(this.filterPlaceholder)) {
            const filterPlaceholderFn = this.filterPlaceholder;
            const filterOptionKey = this.eTypes[position].getValue();
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
            if (!(element instanceof agAbstractInputField_1.AgAbstractInputField)) {
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
    setElementValue(element, value) {
        if (element instanceof agAbstractInputField_1.AgAbstractInputField) {
            element.setValue(value != null ? String(value) : null, true);
        }
    }
    setElementDisplayed(element, displayed) {
        if (element instanceof component_1.Component) {
            dom_1.setDisplayed(element.getGui(), displayed);
        }
    }
    setElementDisabled(element, disabled) {
        if (element instanceof component_1.Component) {
            dom_1.setDisabled(element.getGui(), disabled);
        }
    }
    attachElementOnChange(element, listener) {
        if (element instanceof agAbstractInputField_1.AgAbstractInputField) {
            element.onValueChange(listener);
        }
    }
    forEachInput(cb) {
        this.getConditionTypes().forEach((type, position) => {
            this.forEachPositionTypeInput(position, type, cb);
        });
    }
    forEachPositionInput(position, cb) {
        const type = this.getConditionType(position);
        this.forEachPositionTypeInput(position, type, cb);
    }
    forEachPositionTypeInput(position, type, cb) {
        const numberOfInputs = this.getNumberOfInputs(type);
        const inputs = this.getInputs(position);
        for (let index = 0; index < inputs.length; index++) {
            const input = inputs[index];
            if (input != null) {
                cb(input, index, position, numberOfInputs);
            }
        }
    }
    isConditionDisabled(position, lastUiCompletePosition) {
        if (this.isReadOnly()) {
            return true;
        } // Read-only mode trumps everything.
        if (position === 0) {
            return false;
        } // Position 0 should typically be editable.
        // Only allow editing of a 2nd or later condition if the previous condition is complete and no subsequent conditions are complete.
        return position > lastUiCompletePosition + 1;
    }
    isConditionBodyVisible(position) {
        // Check that the condition needs inputs.
        const type = this.getConditionType(position);
        const numberOfInputs = this.getNumberOfInputs(type);
        return numberOfInputs > 0;
    }
    // returns true if the UI represents a working filter, eg all parts are filled out.
    // eg if text filter and textfield blank then returns false.
    isConditionUiComplete(position) {
        if (position >= this.getNumConditions()) {
            return false;
        } // Condition doesn't exist.
        const type = this.getConditionType(position);
        if (type === SimpleFilter.EMPTY) {
            return false;
        }
        if (this.getValues(position).some(v => v == null)) {
            return false;
        }
        return true;
    }
    getNumConditions() {
        return this.eTypes.length;
    }
    getUiCompleteConditions() {
        const conditions = [];
        for (let position = 0; position < this.getNumConditions(); position++) {
            if (this.isConditionUiComplete(position)) {
                conditions.push(this.createCondition(position));
            }
        }
        return conditions;
    }
    createMissingConditionsAndOperators() {
        if (this.isReadOnly()) {
            return;
        } // don't show incomplete conditions when read only
        for (let i = this.getNumConditions(); i < this.numAlwaysVisibleConditions; i++) {
            this.createJoinOperatorPanel();
            this.createOption();
        }
    }
    resetUiToDefaults(silent) {
        this.removeConditionsAndOperators(this.isReadOnly() ? 1 : this.numAlwaysVisibleConditions);
        this.eTypes.forEach(eType => this.resetType(eType));
        this.eJoinOperatorsAnd.forEach((eJoinOperatorAnd, index) => this.resetJoinOperatorAnd(eJoinOperatorAnd, index, this.joinOperatorId + index));
        this.eJoinOperatorsOr.forEach((eJoinOperatorOr, index) => this.resetJoinOperatorOr(eJoinOperatorOr, index, this.joinOperatorId + index));
        this.joinOperatorId++;
        this.forEachInput((element) => this.resetInput(element));
        this.resetPlaceholder();
        this.createMissingConditionsAndOperators();
        this.lastUiCompletePosition = null;
        if (!silent) {
            this.onUiChanged();
        }
        return utils_1.AgPromise.resolve();
    }
    resetType(eType) {
        const translate = this.localeService.getLocaleTextFunc();
        const filteringLabel = translate('ariaFilteringOperator', 'Filtering operator');
        eType
            .setValue(this.optionsFactory.getDefaultOption(), true)
            .setAriaLabel(filteringLabel)
            .setDisabled(this.isReadOnly());
    }
    resetJoinOperatorAnd(eJoinOperatorAnd, index, uniqueGroupId) {
        this.resetJoinOperator(eJoinOperatorAnd, index, this.isDefaultOperator('AND'), this.translate('andCondition'), uniqueGroupId);
    }
    resetJoinOperatorOr(eJoinOperatorOr, index, uniqueGroupId) {
        this.resetJoinOperator(eJoinOperatorOr, index, this.isDefaultOperator('OR'), this.translate('orCondition'), uniqueGroupId);
    }
    resetJoinOperator(eJoinOperator, index, value, label, uniqueGroupId) {
        this.updateJoinOperatorDisabled(eJoinOperator
            .setValue(value, true)
            .setName(`ag-simple-filter-and-or-${this.getCompId()}-${uniqueGroupId}`)
            .setLabel(label), index);
    }
    updateJoinOperatorsDisabled() {
        this.eJoinOperatorsAnd.forEach((eJoinOperator, index) => this.updateJoinOperatorDisabled(eJoinOperator, index));
        this.eJoinOperatorsOr.forEach((eJoinOperator, index) => this.updateJoinOperatorDisabled(eJoinOperator, index));
    }
    updateJoinOperatorDisabled(eJoinOperator, index) {
        eJoinOperator.setDisabled(this.isReadOnly() || index > 0);
    }
    resetInput(element) {
        this.setElementValue(element, null);
        this.setElementDisabled(element, this.isReadOnly());
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
    addChangedListeners(eType, position) {
        if (this.isReadOnly()) {
            return;
        }
        eType.onValueChange(this.listener);
        this.forEachPositionInput(position, (element) => {
            this.attachElementOnChange(element, this.listener);
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
exports.SimpleFilter = SimpleFilter;
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
