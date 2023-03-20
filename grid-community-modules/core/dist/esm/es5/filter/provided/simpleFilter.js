/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { OptionsFactory } from './optionsFactory';
import { ProvidedFilter } from './providedFilter';
import { AgPromise } from '../../utils';
import { AgSelect } from '../../widgets/agSelect';
import { AgRadioButton } from '../../widgets/agRadioButton';
import { areEqual } from '../../utils/array';
import { setDisplayed, setDisabled, removeFromParent } from '../../utils/dom';
import { DEFAULT_FILTER_LOCALE_TEXT } from '../filterLocaleText';
import { Component } from '../../widgets/component';
import { AgAbstractInputField } from '../../widgets/agAbstractInputField';
import { doOnce, isFunction } from '../../utils/function';
var SimpleFilterModelFormatter = /** @class */ (function () {
    function SimpleFilterModelFormatter(localeService, optionsFactory) {
        this.localeService = localeService;
        this.optionsFactory = optionsFactory;
    }
    // used by:
    // 1) NumberFloatingFilter & TextFloatingFilter: Always, for both when editable and read only.
    // 2) DateFloatingFilter: Only when read only (as we show text rather than a date picker when read only)
    SimpleFilterModelFormatter.prototype.getModelAsString = function (model) {
        var _this = this;
        if (!model) {
            return null;
        }
        var isCombined = model.operator != null;
        var translate = this.localeService.getLocaleTextFunc();
        if (isCombined) {
            var combinedModel = model;
            var conditions = combinedModel.conditions;
            if (!conditions) {
                var condition1 = combinedModel.condition1, condition2 = combinedModel.condition2;
                conditions = [condition1, condition2];
            }
            var customOptions = conditions.map(function (condition) { return _this.getModelAsString(condition); });
            var joinOperatorTranslateKey = combinedModel.operator === 'AND' ? 'andCondition' : 'orCondition';
            return customOptions.join(" " + translate(joinOperatorTranslateKey, DEFAULT_FILTER_LOCALE_TEXT[joinOperatorTranslateKey]) + " ");
        }
        else if (model.type === SimpleFilter.BLANK || model.type === SimpleFilter.NOT_BLANK) {
            return translate(model.type, model.type);
        }
        else {
            var condition = model;
            var customOption = this.optionsFactory.getCustomOption(condition.type);
            // For custom filter options we display the Name of the filter instead
            // of displaying the `from` value, as it wouldn't be relevant
            var _a = customOption || {}, displayKey = _a.displayKey, displayName = _a.displayName, numberOfInputs = _a.numberOfInputs;
            if (displayKey && displayName && numberOfInputs === 0) {
                translate(displayKey, displayName);
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
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.eTypes = [];
        _this.eJoinOperatorPanels = [];
        _this.eJoinOperatorsAnd = [];
        _this.eJoinOperatorsOr = [];
        _this.eConditionBodies = [];
        _this.listener = function () { return _this.onUiChanged(); };
        _this.lastUiCompletePosition = null;
        _this.joinOperatorId = 0;
        return _this;
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
        var _this = this;
        this.eTypes.forEach(function (eType, position) {
            if (position === 0) {
                eType.setValue(type, true);
            }
            else {
                eType.setValue(_this.optionsFactory.getDefaultOption(), true);
            }
        });
    };
    SimpleFilter.prototype.getModelFromUi = function () {
        var conditions = this.getUiCompleteConditions();
        if (conditions.length === 0) {
            return null;
        }
        if (this.maxNumConditions > 1 && conditions.length > 1) {
            return {
                filterType: this.getFilterType(),
                operator: this.getJoinOperator(),
                condition1: conditions[0],
                condition2: conditions[1],
                conditions: conditions
            };
        }
        return conditions[0];
    };
    SimpleFilter.prototype.getConditionTypes = function () {
        return this.eTypes.map(function (eType) { return eType.getValue(); });
    };
    SimpleFilter.prototype.getConditionType = function (position) {
        return this.eTypes[position].getValue();
    };
    SimpleFilter.prototype.getJoinOperator = function () {
        if (this.eJoinOperatorsOr.length === 0) {
            return this.defaultJoinOperator;
        }
        return this.eJoinOperatorsOr[0].getValue() === true ? 'OR' : 'AND';
    };
    SimpleFilter.prototype.areModelsEqual = function (a, b) {
        var _this = this;
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
                && areEqual(aCombined.conditions, bCombined.conditions, function (aModel, bModel) { return _this.areSimpleModelsEqual(aModel, bModel); });
        }
        return res;
    };
    SimpleFilter.prototype.setModelIntoUi = function (model) {
        var _this = this;
        var isCombined = model.operator;
        if (isCombined) {
            var combinedModel = model;
            if (!combinedModel.conditions) {
                combinedModel.conditions = [
                    combinedModel.condition1,
                    combinedModel.condition2
                ];
            }
            var numConditions = this.validateAndUpdateConditions(combinedModel.conditions);
            var numPrevConditions = this.getNumConditions();
            if (numConditions < numPrevConditions) {
                this.removeConditionsAndOperators(numConditions);
            }
            else if (numConditions > numPrevConditions) {
                for (var i = numPrevConditions; i < numConditions; i++) {
                    this.createJoinOperatorPanel();
                    this.createOption();
                }
            }
            var orChecked_1 = combinedModel.operator === 'OR';
            this.eJoinOperatorsAnd.forEach(function (eJoinOperatorAnd) { return eJoinOperatorAnd.setValue(!orChecked_1, true); });
            this.eJoinOperatorsOr.forEach(function (eJoinOperatorOr) { return eJoinOperatorOr.setValue(orChecked_1, true); });
            combinedModel.conditions.forEach(function (condition, position) {
                _this.eTypes[position].setValue(condition.type, true);
                _this.setConditionIntoUi(condition, position);
            });
        }
        else {
            var simpleModel = model;
            if (this.getNumConditions() > 1) {
                this.removeConditionsAndOperators(1);
            }
            this.eTypes[0].setValue(simpleModel.type, true);
            this.setConditionIntoUi(simpleModel, 0);
        }
        this.lastUiCompletePosition = this.getNumConditions() - 1;
        this.createMissingConditionsAndOperators();
        this.onUiChanged();
        return AgPromise.resolve();
    };
    SimpleFilter.prototype.validateAndUpdateConditions = function (conditions) {
        var numConditions = conditions.length;
        if (numConditions > this.maxNumConditions) {
            conditions.splice(this.maxNumConditions);
            doOnce(function () { return console.warn('AG Grid: Filter Model contains more conditions than "filterParams.maxNumConditions". Additional conditions have been ignored.'); }, 'simpleFilterSetModelMaxNumConditions');
            numConditions = this.maxNumConditions;
        }
        return numConditions;
    };
    SimpleFilter.prototype.doesFilterPass = function (params) {
        var _this = this;
        var _a;
        var model = this.getModel();
        if (model == null) {
            return true;
        }
        var operator = model.operator;
        var models = [];
        if (operator) {
            var combinedModel = model;
            models.push.apply(models, __spread(((_a = combinedModel.conditions) !== null && _a !== void 0 ? _a : [])));
        }
        else {
            models.push(model);
        }
        var combineFunction = operator && operator === 'OR' ? 'some' : 'every';
        return models[combineFunction](function (m) { return _this.individualConditionPasses(params, m); });
    };
    SimpleFilter.prototype.setParams = function (params) {
        _super.prototype.setParams.call(this, params);
        this.setNumConditions(params);
        this.defaultJoinOperator = this.getDefaultJoinOperator(params.defaultJoinOperator);
        this.filterPlaceholder = params.filterPlaceholder;
        this.optionsFactory = new OptionsFactory();
        this.optionsFactory.init(params, this.getDefaultFilterOptions());
        this.createOption();
        this.createMissingConditionsAndOperators();
    };
    SimpleFilter.prototype.setNumConditions = function (params) {
        var _a, _b;
        if (params.suppressAndOrCondition != null) {
            doOnce(function () { return console.warn('AG Grid: Since v29.2 "filterParams.suppressAndOrCondition" is deprecated. Use "filterParams.maxNumConditions = 1" instead.'); }, 'simpleFilterSuppressAndOrCondition');
        }
        if (params.alwaysShowBothConditions != null) {
            doOnce(function () { return console.warn('AG Grid: Since v29.2 "filterParams.alwaysShowBothConditions" is deprecated. Use "filterParams.numAlwaysVisibleConditions = 2" instead.'); }, 'simpleFilterAlwaysShowBothConditions');
        }
        this.maxNumConditions = (_a = params.maxNumConditions) !== null && _a !== void 0 ? _a : (params.suppressAndOrCondition ? 1 : 2);
        if (this.maxNumConditions < 1) {
            doOnce(function () { return console.warn('AG Grid: "filterParams.maxNumConditions" must be greater than or equal to zero.'); }, 'simpleFilterMaxNumConditions');
            this.maxNumConditions = 1;
        }
        this.numAlwaysVisibleConditions = (_b = params.numAlwaysVisibleConditions) !== null && _b !== void 0 ? _b : (params.alwaysShowBothConditions ? 2 : 1);
        if (this.numAlwaysVisibleConditions < 1) {
            doOnce(function () { return console.warn('AG Grid: "filterParams.numAlwaysVisibleConditions" must be greater than or equal to zero.'); }, 'simpleFilterNumAlwaysVisibleConditions');
            this.numAlwaysVisibleConditions = 1;
        }
        if (this.numAlwaysVisibleConditions > this.maxNumConditions) {
            doOnce(function () { return console.warn('AG Grid: "filterParams.numAlwaysVisibleConditions" cannot be greater than "filterParams.maxNumConditions".'); }, 'simpleFilterNumAlwaysVisibleGreaterThanMaxNumConditions');
            this.numAlwaysVisibleConditions = this.maxNumConditions;
        }
    };
    SimpleFilter.prototype.createOption = function () {
        var _this = this;
        var eType = this.createManagedBean(new AgSelect());
        this.eTypes.push(eType);
        eType.addCssClass('ag-filter-select');
        this.eFilterBody.appendChild(eType.getGui());
        var eConditionBody = this.createValueElement();
        this.eConditionBodies.push(eConditionBody);
        this.eFilterBody.appendChild(eConditionBody);
        this.putOptionsIntoDropdown(eType);
        this.resetType(eType);
        var position = this.getNumConditions() - 1;
        this.forEachPositionInput(position, function (element) { return _this.resetInput(element); });
        this.addChangedListeners(eType, position);
    };
    SimpleFilter.prototype.createJoinOperatorPanel = function () {
        var eJoinOperatorPanel = document.createElement('div');
        this.eJoinOperatorPanels.push(eJoinOperatorPanel);
        eJoinOperatorPanel.classList.add('ag-filter-condition');
        var eJoinOperatorAnd = this.createJoinOperator(this.eJoinOperatorsAnd, eJoinOperatorPanel, 'and');
        var eJoinOperatorOr = this.createJoinOperator(this.eJoinOperatorsOr, eJoinOperatorPanel, 'or');
        this.eFilterBody.appendChild(eJoinOperatorPanel);
        var index = this.eJoinOperatorPanels.length - 1;
        var uniqueGroupId = this.joinOperatorId++;
        this.resetJoinOperatorAnd(eJoinOperatorAnd, index, uniqueGroupId);
        this.resetJoinOperatorOr(eJoinOperatorOr, index, uniqueGroupId);
        if (!this.isReadOnly()) {
            eJoinOperatorAnd.onValueChange(this.listener);
            eJoinOperatorOr.onValueChange(this.listener);
        }
    };
    SimpleFilter.prototype.createJoinOperator = function (eJoinOperators, eJoinOperatorPanel, andOr) {
        var eJoinOperator = this.createManagedBean(new AgRadioButton());
        eJoinOperators.push(eJoinOperator);
        eJoinOperator.addCssClass('ag-filter-condition-operator');
        eJoinOperator.addCssClass("ag-filter-condition-operator-" + andOr);
        eJoinOperatorPanel.appendChild(eJoinOperator.getGui());
        return eJoinOperator;
    };
    SimpleFilter.prototype.getDefaultJoinOperator = function (defaultJoinOperator) {
        return defaultJoinOperator === 'AND' || defaultJoinOperator === 'OR' ? defaultJoinOperator : 'AND';
    };
    SimpleFilter.prototype.putOptionsIntoDropdown = function (eType) {
        var _this = this;
        var filterOptions = this.optionsFactory.getFilterOptions();
        // Add specified options to all condition drop-downs.
        filterOptions.forEach(function (option) {
            var listOption = typeof option === 'string' ?
                _this.createBoilerplateListOption(option) :
                _this.createCustomListOption(option);
            eType.addOption(listOption);
        });
        // Make drop-downs read-only if there is only one option.
        eType.setDisabled(filterOptions.length <= 1);
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
    /**
     * @deprecated As of v29.2 filters can have more than two conditions. Check `colDef.filterParams.maxNumConditions` instead.
     */
    SimpleFilter.prototype.isAllowTwoConditions = function () {
        return this.maxNumConditions >= 2;
    };
    SimpleFilter.prototype.createBodyTemplate = function () {
        // created dynamically
        return '';
    };
    SimpleFilter.prototype.getCssIdentifier = function () {
        return 'simple-filter';
    };
    SimpleFilter.prototype.updateUiVisibility = function () {
        var joinOperator = this.getJoinOperator();
        this.updateNumConditions();
        // from here, the number of elements in all the collections is correct, so can just update the values/statuses
        this.updateConditionStatusesAndValues(this.lastUiCompletePosition, joinOperator);
    };
    SimpleFilter.prototype.updateNumConditions = function () {
        var _a;
        // Collection sizes are already correct if updated via API, so only need to handle UI updates here
        var lastUiCompletePosition = -1;
        var areAllConditionsUiComplete = true;
        for (var position = 0; position < this.getNumConditions(); position++) {
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
            var activePosition = (_a = this.lastUiCompletePosition) !== null && _a !== void 0 ? _a : this.getNumConditions() - 2;
            if (lastUiCompletePosition < activePosition) {
                // remove any incomplete conditions at the end, excluding the active position
                this.removeConditionsAndOperators(activePosition + 1);
                var removeStartPosition = lastUiCompletePosition + 1;
                var numConditionsToRemove = activePosition - removeStartPosition;
                if (numConditionsToRemove > 0) {
                    this.removeConditionsAndOperators(removeStartPosition, numConditionsToRemove);
                }
                this.createMissingConditionsAndOperators();
            }
        }
        this.lastUiCompletePosition = lastUiCompletePosition;
    };
    SimpleFilter.prototype.updateConditionStatusesAndValues = function (lastUiCompletePosition, joinOperator) {
        var _this = this;
        this.eTypes.forEach(function (eType, position) {
            var disabled = _this.isConditionDisabled(position, lastUiCompletePosition);
            var group = position === 1 ? [eType, _this.eJoinOperatorPanels[0], _this.eJoinOperatorsAnd[0], _this.eJoinOperatorsOr[0]] : [eType];
            group.forEach(function (element) {
                if (element instanceof AgAbstractInputField || element instanceof AgSelect) {
                    element.setDisabled(disabled);
                }
                else {
                    setDisabled(element, disabled);
                }
            });
        });
        this.eConditionBodies.forEach(function (element, index) {
            setDisplayed(element, _this.isConditionBodyVisible(index));
        });
        var orChecked = (joinOperator !== null && joinOperator !== void 0 ? joinOperator : this.getJoinOperator()) === 'OR';
        this.eJoinOperatorsAnd.forEach(function (eJoinOperatorAnd, index) {
            eJoinOperatorAnd.setValue(!orChecked, true);
        });
        this.eJoinOperatorsOr.forEach(function (eJoinOperatorOr, index) {
            eJoinOperatorOr.setValue(orChecked, true);
        });
        this.forEachInput(function (element, index, position, numberOfInputs) {
            _this.setElementDisplayed(element, index < numberOfInputs);
            _this.setElementDisabled(element, _this.isConditionDisabled(position, lastUiCompletePosition));
        });
        this.resetPlaceholder();
    };
    SimpleFilter.prototype.shouldAddNewConditionAtEnd = function (areAllConditionsUiComplete) {
        return areAllConditionsUiComplete && this.getNumConditions() < this.maxNumConditions && !this.isReadOnly();
    };
    SimpleFilter.prototype.removeConditionsAndOperators = function (startPosition, deleteCount) {
        if (startPosition >= this.getNumConditions()) {
            return;
        }
        this.removeComponents(this.eTypes, startPosition, deleteCount);
        this.removeElements(this.eConditionBodies, startPosition, deleteCount);
        this.removeValueElements(startPosition, deleteCount);
        var joinOperatorIndex = Math.max(startPosition - 1, 0);
        this.removeElements(this.eJoinOperatorPanels, joinOperatorIndex, deleteCount);
        this.removeComponents(this.eJoinOperatorsAnd, joinOperatorIndex, deleteCount);
        this.removeComponents(this.eJoinOperatorsOr, joinOperatorIndex, deleteCount);
    };
    SimpleFilter.prototype.removeElements = function (elements, startPosition, deleteCount) {
        var removedElements = this.removeItems(elements, startPosition, deleteCount);
        removedElements.forEach(function (element) { return removeFromParent(element); });
    };
    SimpleFilter.prototype.removeComponents = function (components, startPosition, deleteCount) {
        var _this = this;
        var removedComponents = this.removeItems(components, startPosition, deleteCount);
        removedComponents.forEach(function (comp) {
            removeFromParent(comp.getGui());
            _this.destroyBean(comp);
        });
    };
    SimpleFilter.prototype.removeItems = function (items, startPosition, deleteCount) {
        return deleteCount == null ? items.splice(startPosition) : items.splice(startPosition, deleteCount);
    };
    SimpleFilter.prototype.afterGuiAttached = function (params) {
        _super.prototype.afterGuiAttached.call(this, params);
        this.resetPlaceholder();
        if (!params || (!params.suppressFocus && !this.isReadOnly())) {
            var firstInput = this.getInputs(0)[0];
            if (!firstInput) {
                return;
            }
            if (firstInput instanceof AgAbstractInputField) {
                firstInput.getInputElement().focus();
            }
        }
    };
    SimpleFilter.prototype.afterGuiDetached = function () {
        _super.prototype.afterGuiDetached.call(this);
        var appliedModel = this.getModel();
        if (!this.areModelsEqual(appliedModel, this.getModelFromUi())) {
            this.resetUiToActiveModel(appliedModel);
        }
        // remove incomplete positions
        var lastUiCompletePosition = -1;
        // as we remove incomplete positions, the last UI complete position will change
        var updatedLastUiCompletePosition = -1;
        var conditionsRemoved = false;
        var joinOperator = this.getJoinOperator();
        for (var position = this.getNumConditions() - 1; position >= 0; position--) {
            if (this.isConditionUiComplete(position)) {
                if (lastUiCompletePosition === -1) {
                    lastUiCompletePosition = position;
                    updatedLastUiCompletePosition = position;
                }
            }
            else {
                var shouldRemovePositionAtEnd = position >= this.numAlwaysVisibleConditions && !this.isConditionUiComplete(position - 1);
                var positionBeforeLastUiCompletePosition = position < lastUiCompletePosition;
                if (shouldRemovePositionAtEnd || positionBeforeLastUiCompletePosition) {
                    this.removeConditionsAndOperators(position, 1);
                    conditionsRemoved = true;
                    if (positionBeforeLastUiCompletePosition) {
                        updatedLastUiCompletePosition--;
                    }
                }
            }
        }
        var shouldUpdateConditionStatusesAndValues = false;
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
    };
    SimpleFilter.prototype.getPlaceholderText = function (defaultPlaceholder, position) {
        var placeholder = this.translate(defaultPlaceholder);
        if (isFunction(this.filterPlaceholder)) {
            var filterPlaceholderFn = this.filterPlaceholder;
            var filterOptionKey = this.eTypes[position].getValue();
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
    SimpleFilter.prototype.setElementValue = function (element, value) {
        if (element instanceof AgAbstractInputField) {
            element.setValue(value != null ? String(value) : null, true);
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
        this.getConditionTypes().forEach(function (type, position) {
            _this.forEachPositionTypeInput(position, type, cb);
        });
    };
    SimpleFilter.prototype.forEachPositionInput = function (position, cb) {
        var type = this.getConditionType(position);
        this.forEachPositionTypeInput(position, type, cb);
    };
    SimpleFilter.prototype.forEachPositionTypeInput = function (position, type, cb) {
        var numberOfInputs = this.getNumberOfInputs(type);
        var inputs = this.getInputs(position);
        for (var index = 0; index < inputs.length; index++) {
            var input = inputs[index];
            if (input != null) {
                cb(input, index, position, numberOfInputs);
            }
        }
    };
    SimpleFilter.prototype.isConditionDisabled = function (position, lastUiCompletePosition) {
        if (this.isReadOnly()) {
            return true;
        } // Read-only mode trumps everything.
        if (position === 0) {
            return false;
        } // Position 0 should typically be editable.
        // Only allow editing of a 2nd or later condition if the previous condition is complete and no subsequent conditions are complete.
        return position > lastUiCompletePosition + 1;
    };
    SimpleFilter.prototype.isConditionBodyVisible = function (position) {
        // Check that the condition needs inputs.
        var type = this.getConditionType(position);
        var numberOfInputs = this.getNumberOfInputs(type);
        return numberOfInputs > 0;
    };
    // returns true if the UI represents a working filter, eg all parts are filled out.
    // eg if text filter and textfield blank then returns false.
    SimpleFilter.prototype.isConditionUiComplete = function (position) {
        if (position >= this.getNumConditions()) {
            return false;
        } // Condition doesn't exist.
        var type = this.getConditionType(position);
        if (type === SimpleFilter.EMPTY) {
            return false;
        }
        if (this.getValues(position).some(function (v) { return v == null; })) {
            return false;
        }
        return true;
    };
    SimpleFilter.prototype.getNumConditions = function () {
        return this.eTypes.length;
    };
    SimpleFilter.prototype.getUiCompleteConditions = function () {
        var conditions = [];
        for (var position = 0; position < this.getNumConditions(); position++) {
            if (this.isConditionUiComplete(position)) {
                conditions.push(this.createCondition(position));
            }
        }
        return conditions;
    };
    SimpleFilter.prototype.createMissingConditionsAndOperators = function () {
        if (this.isReadOnly()) {
            return;
        } // don't show incomplete conditions when read only
        for (var i = this.getNumConditions(); i < this.numAlwaysVisibleConditions; i++) {
            this.createJoinOperatorPanel();
            this.createOption();
        }
    };
    SimpleFilter.prototype.resetUiToDefaults = function (silent) {
        var _this = this;
        this.removeConditionsAndOperators(this.isReadOnly() ? 1 : this.numAlwaysVisibleConditions);
        this.eTypes.forEach(function (eType) { return _this.resetType(eType); });
        this.eJoinOperatorsAnd.forEach(function (eJoinOperatorAnd, index) { return _this.resetJoinOperatorAnd(eJoinOperatorAnd, index, _this.joinOperatorId + index); });
        this.eJoinOperatorsOr.forEach(function (eJoinOperatorOr, index) { return _this.resetJoinOperatorOr(eJoinOperatorOr, index, _this.joinOperatorId + index); });
        this.joinOperatorId++;
        this.forEachInput(function (element) { return _this.resetInput(element); });
        this.resetPlaceholder();
        this.createMissingConditionsAndOperators();
        this.lastUiCompletePosition = null;
        if (!silent) {
            this.onUiChanged();
        }
        return AgPromise.resolve();
    };
    SimpleFilter.prototype.resetType = function (eType) {
        var translate = this.localeService.getLocaleTextFunc();
        var filteringLabel = translate('ariaFilteringOperator', 'Filtering operator');
        eType
            .setValue(this.optionsFactory.getDefaultOption(), true)
            .setAriaLabel(filteringLabel)
            .setDisabled(this.isReadOnly());
    };
    SimpleFilter.prototype.resetJoinOperatorAnd = function (eJoinOperatorAnd, index, uniqueGroupId) {
        this.resetJoinOperator(eJoinOperatorAnd, index, this.isDefaultOperator('AND'), this.translate('andCondition'), uniqueGroupId);
    };
    SimpleFilter.prototype.resetJoinOperatorOr = function (eJoinOperatorOr, index, uniqueGroupId) {
        this.resetJoinOperator(eJoinOperatorOr, index, this.isDefaultOperator('OR'), this.translate('orCondition'), uniqueGroupId);
    };
    SimpleFilter.prototype.resetJoinOperator = function (eJoinOperator, index, value, label, uniqueGroupId) {
        this.updateJoinOperatorDisabled(eJoinOperator
            .setValue(value, true)
            .setName("ag-simple-filter-and-or-" + this.getCompId() + "-" + uniqueGroupId)
            .setLabel(label), index);
    };
    SimpleFilter.prototype.updateJoinOperatorsDisabled = function () {
        var _this = this;
        this.eJoinOperatorsAnd.forEach(function (eJoinOperator, index) { return _this.updateJoinOperatorDisabled(eJoinOperator, index); });
        this.eJoinOperatorsOr.forEach(function (eJoinOperator, index) { return _this.updateJoinOperatorDisabled(eJoinOperator, index); });
    };
    SimpleFilter.prototype.updateJoinOperatorDisabled = function (eJoinOperator, index) {
        eJoinOperator.setDisabled(this.isReadOnly() || index > 0);
    };
    SimpleFilter.prototype.resetInput = function (element) {
        this.setElementValue(element, null);
        this.setElementDisabled(element, this.isReadOnly());
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
    SimpleFilter.prototype.addChangedListeners = function (eType, position) {
        var _this = this;
        if (this.isReadOnly()) {
            return;
        }
        eType.onValueChange(this.listener);
        this.forEachPositionInput(position, function (element) {
            _this.attachElementOnChange(element, _this.listener);
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
    return SimpleFilter;
}(ProvidedFilter));
export { SimpleFilter };
