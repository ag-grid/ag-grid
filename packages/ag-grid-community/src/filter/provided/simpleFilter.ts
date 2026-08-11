import {
    AgPromise,
    _addOrRemoveAttribute,
    _areEqual,
    _isBrowserFirefox,
    _isComponent,
    _removeFromParent,
    _setDisabled,
    _setDisplayed,
} from 'ag-stack';

import { AgAbstractInputField } from '../../agWidgets/agAbstractInputField';
import type { ListOption } from '../../agWidgets/agList';
import { AgRadioButton } from '../../agWidgets/agRadioButton';
import { AgSelect } from '../../agWidgets/agSelect';
import type { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import type { FilterDisplayParams } from '../../interfaces/iFilter';
import type { ElementParams } from '../../utils/element';
import { _createElement } from '../../utils/element';
import type { Component, ComponentSelector } from '../../widgets/component';
import type { GridInputTextField, GridRadioButton, GridSelect } from '../../widgets/gridWidgetTypes';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import type {
    FilterOptionKey,
    ICombinedSimpleModel,
    IFilterOptionDef,
    ISimpleFilter,
    ISimpleFilterModel,
    ISimpleFilterModelType,
    ISimpleFilterParams,
    JoinOperator,
    MapValuesFromSimpleFilterModel,
    SimpleFilterParams,
    Tuple,
} from './iSimpleFilter';
import { OptionsFactory } from './optionsFactory';
import { ProvidedFilter } from './providedFilter';
import { getPlaceholderText } from './providedFilterUtils';
import {
    getDefaultJoinOperator,
    getNumberOfInputs,
    removeItems,
    validateAndUpdateConditions,
} from './simpleFilterUtils';

/** temporary type until `SimpleFilterParams` is updated as breaking change */
type SimpleFilterDisplayParams<M extends ISimpleFilterModel> = ISimpleFilterParams &
    FilterDisplayParams<any, any, M | ICombinedSimpleModel<M>>;

type FilterModelOrCombined<M extends ISimpleFilterModel> = M | ICombinedSimpleModel<M> | null;

/** What a range-validated input has to offer, so a number and a text field are both one. */
type RangeInput = Pick<GridInputTextField, 'onValueChange' | 'addGuiEventListener'>;

/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values.
 *
 * @param M type of filter-model managed by the concrete sub-class that extends this type
 * @param V type of value managed by the concrete sub-class that extends this type
 * @param E type of UI element used for collecting user-input
 */
export abstract class SimpleFilter<
    M extends ISimpleFilterModel,
    V,
    E = GridInputTextField,
    P extends SimpleFilterDisplayParams<M> = SimpleFilterDisplayParams<M>,
>
    extends ProvidedFilter<M | ICombinedSimpleModel<M>, V, P>
    implements ISimpleFilter
{
    public abstract override readonly filterType: 'number' | 'bigint' | 'text' | 'date';

    protected readonly eTypes: GridSelect[] = [];
    protected readonly eJoinPanels: HTMLElement[] = [];
    protected readonly eJoinAnds: GridRadioButton[] = [];
    protected readonly eJoinOrs: GridRadioButton[] = [];
    protected readonly eConditionBodies: HTMLElement[] = [];
    private readonly listener = () => this.onUiChanged();

    private maxNumConditions: number;
    private numAlwaysVisibleConditions: number;
    private defaultJoinOperator: JoinOperator;
    private filterPlaceholder: SimpleFilterParams['filterPlaceholder'];
    private lastUiCompletePosition: number | null = null;
    private joinOperatorId = 0;
    private filterListOptions: ListOption[];

    protected optionsFactory: OptionsFactory;

    constructor(
        filterNameKey: FilterLocaleTextKey,
        private readonly mapValuesFromModel: MapValuesFromSimpleFilterModel<M, V>,
        private readonly options: ISimpleFilterModelType[]
    ) {
        super(filterNameKey, 'simple-filter');
    }

    protected abstract createEValue(): HTMLElement;

    protected abstract removeEValues(startPosition: number, deleteCount?: number): void;

    // filter uses this to know if new model is different from previous model, ie if filter has changed
    protected abstract areSimpleModelsEqual(a: ISimpleFilterModel, b: ISimpleFilterModel): boolean;

    // getModel() calls this to create the two conditions. if only one condition,
    // the result is returned by getModel(), otherwise is called twice and both results
    // returned in a CombinedFilter object.
    protected abstract createCondition(position: number): M;

    // allow iteration of all condition inputs managed by sub-classes.
    protected abstract getInputs(position: number): Tuple<E>;

    // allow retrieval of all condition input values.
    protected abstract getValues(position: number): Tuple<V>;

    protected refreshInputValidation(): void {
        const eTypes = this.eTypes;
        for (let position = 0, len = eTypes.length; position < len; ++position) {
            this.refreshPositionValidation(position);
        }
    }

    protected refreshPositionValidation(_position: number, _isFrom?: boolean): void {
        // Overridden by the filters whose inputs can reject what they hold; `isFrom` names the edited input.
    }

    /** Resolved per event, never captured: a condition removed from the middle shifts every one after it. */
    protected getInputPosition(element: E): number {
        const eTypes = this.eTypes;
        for (let position = 0, len = eTypes.length; position < len; ++position) {
            const inputs = this.getInputs(position);
            if (inputs[0] === element || inputs[1] === element) {
                return position;
            }
        }
        return -1;
    }

    /** A replacement element carries none of the original's listeners, so a rebuild re-attaches them all. */
    protected attachRebuiltInputListeners(from: E & RangeInput, to: E & RangeInput): void {
        this.attachElementOnChange(from, this.listener);
        this.attachElementOnChange(to, this.listener);
        this.attachRangeValidationListeners(from, to);
    }

    /** Either input changing re-validates the pair: the message is about their order, not one value. */
    protected attachRangeValidationListeners(from: E & RangeInput, to: E & RangeInput): void {
        const fromListener = () => this.refreshInputValidationAt(from, true);
        from.onValueChange(fromListener);
        from.addGuiEventListener('focusin', fromListener);

        const toListener = () => this.refreshInputValidationAt(to, false);
        to.onValueChange(toListener);
        to.addGuiEventListener('focusin', toListener);
    }

    private refreshInputValidationAt(element: E, isFrom: boolean): void {
        const position = this.getInputPosition(element);
        if (position < 0) {
            return;
        }
        this.refreshPositionValidation(position, isFrom);
    }

    /** An option taking one value has no range, so the second input is not part of what it filters on. */
    protected isRangeCondition(position: number): boolean {
        return getNumberOfInputs(this.getConditionType(position), this.optionsFactory) === 2;
    }

    protected override setParams(params: P): void {
        super.setParams(params);

        const optionsFactory = new OptionsFactory();
        this.optionsFactory = optionsFactory;
        optionsFactory.init(this.beans.log, params, this.options);

        this.commonUpdateSimpleParams(params);

        this.createOption();
        this.createMissingConditionsAndOperators();
    }

    protected override updateParams(newParams: P, oldParams: P): void {
        const optionsChanged = this.optionsFactory.refresh(this.beans.log, newParams, this.options);

        super.updateParams(newParams, oldParams);

        this.commonUpdateSimpleParams(newParams);
        if (optionsChanged) {
            this.refreshConditionsForOptions();
        } else {
            this.resetPlaceholder();
        }
    }

    /** The dropdowns hold the options as they were, so one added or withdrawn has to reach every condition. */
    private refreshConditionsForOptions(): void {
        const { eTypes, optionsFactory } = this;
        for (let position = 0, numConditions = eTypes.length; position < numConditions; ++position) {
            const eType = eTypes[position];
            const selectedType = eType.getValue();
            eType.clearOptions();
            this.putOptionsIntoDropdown(eType);
            const isStillOffered = optionsFactory.hasOption(selectedType);
            eType.setValue(isStillOffered ? selectedType : optionsFactory.defaultOption, true);
            if (!isStillOffered) {
                // Values the withdrawn option collected mean nothing to the one replacing it.
                this.forEachPositionInput(position, (element) => this.resetInput(element));
            }
        }
        // An option that kept its key can still have changed arity, leaving a message on a lone input.
        this.refreshInputValidation();
        this.updateUiVisibility();
    }

    protected commonUpdateSimpleParams(params: P): void {
        this.setNumConditions(params);

        this.defaultJoinOperator = getDefaultJoinOperator(params.defaultJoinOperator);
        this.filterPlaceholder = params.filterPlaceholder;

        this.createFilterListOptions();

        // only set tabindex when read only (so no other focusable elements), otherwise the tab order breaks
        // as the tabbed layout managed focus feature will focus the body when it shouldn't
        _addOrRemoveAttribute(this.getGui(), 'tabindex', this.isReadOnly() ? '-1' : null);
    }

    // floating filter calls this when user applies filter from floating filter
    public onFloatingFilterChanged(type: string | null | undefined, value: V | null): void {
        this.setTypeFromFloatingFilter(type);
        this.setValueFromFloatingFilter(value);
        this.onUiChanged('immediately', true);
    }

    private setTypeFromFloatingFilter(type?: string | null): void {
        this.eTypes.forEach((eType, position) => {
            const value = position === 0 ? type : this.optionsFactory.defaultOption;
            eType.setValue(value, true);
        });
    }

    public getModelFromUi(): FilterModelOrCombined<M> {
        const conditions = this.getUiCompleteConditions();
        if (conditions.length === 0) {
            return null;
        }

        if (this.maxNumConditions > 1 && conditions.length > 1) {
            return {
                filterType: this.filterType,
                operator: this.getJoinOperator(),
                conditions,
            };
        }

        return conditions[0];
    }

    protected getConditionType(position: number): FilterOptionKey | null {
        return this.eTypes[position].getValue() ?? null;
    }

    protected getJoinOperator(): JoinOperator {
        const { eJoinOrs: eJoinOperatorsOr, defaultJoinOperator } = this;

        return eJoinOperatorsOr.length === 0
            ? defaultJoinOperator
            : eJoinOperatorsOr[0].getValue() === true
              ? 'OR'
              : 'AND';
    }

    protected areNonNullModelsEqual(
        a: M | ICombinedSimpleModel<M> | null,
        b: M | ICombinedSimpleModel<M> | null
    ): boolean {
        // one is combined, the other is not
        const aIsSimple = !(a as any).operator;
        const bIsSimple = !(b as any).operator;
        const oneSimpleOneCombined = (!aIsSimple && bIsSimple) || (aIsSimple && !bIsSimple);
        if (oneSimpleOneCombined) {
            return false;
        }

        let res: boolean;

        // otherwise both present, so compare
        if (aIsSimple) {
            const aSimple = a as M;
            const bSimple = b as M;

            res = this.areSimpleModelsEqual(aSimple, bSimple);
        } else {
            const aCombined = a as ICombinedSimpleModel<M>;
            const bCombined = b as ICombinedSimpleModel<M>;

            res =
                aCombined.operator === bCombined.operator &&
                _areEqual(aCombined.conditions, bCombined.conditions, (aModel, bModel) =>
                    this.areSimpleModelsEqual(aModel, bModel)
                );
        }

        return res;
    }

    protected setModelIntoUi(
        model: ISimpleFilterModel | ICombinedSimpleModel<M> | null,
        isInitialLoad?: boolean
    ): AgPromise<void> {
        if (model == null) {
            this.resetUiToDefaults(isInitialLoad);
            return AgPromise.resolve();
        }
        const isCombined = (model as any).operator;

        if (isCombined) {
            this.setCombinedModelIntoUi(model as ICombinedSimpleModel<M>);
        } else {
            if (this.getNumConditions() > 1) {
                this.removeConditionsForModel(1);
            }
            this.setConditionAndTypeIntoUi(model as M, 0);
        }

        this.lastUiCompletePosition = this.getNumConditions() - 1;

        this.createMissingConditionsAndOperators();

        // Every input holds the new model, so a message the old one left is about nothing shown.
        this.refreshInputValidation();

        this.updateUiVisibility();
        if (!isInitialLoad) {
            this.params.onUiChange(this.getUiChangeEventParams());
        }

        return AgPromise.resolve();
    }

    private setNumConditions(params: P): void {
        let maxNumConditions = params.maxNumConditions ?? 2;
        if (maxNumConditions < 1) {
            this.beans.log.warn(79);
            maxNumConditions = 1;
        }
        this.maxNumConditions = maxNumConditions;

        let numAlwaysVisibleConditions = params.numAlwaysVisibleConditions ?? 1;
        if (numAlwaysVisibleConditions < 1) {
            this.beans.log.warn(80);
            numAlwaysVisibleConditions = 1;
        }
        if (numAlwaysVisibleConditions > maxNumConditions) {
            this.beans.log.warn(81);
            numAlwaysVisibleConditions = maxNumConditions;
        }
        this.numAlwaysVisibleConditions = numAlwaysVisibleConditions;
    }

    private createOption(): void {
        const eGui = this.getGui();
        const eType = this.createManagedBean<GridSelect>(new AgSelect());
        this.eTypes.push(eType);
        eType.addCss('ag-filter-select');
        eGui.appendChild(eType.getGui());

        const eConditionBody = this.createEValue();
        this.eConditionBodies.push(eConditionBody);
        eGui.appendChild(eConditionBody);

        this.putOptionsIntoDropdown(eType);
        this.resetType(eType);
        const position = this.getNumConditions() - 1;
        this.forEachPositionInput(position, (element) => this.resetInput(element));
        this.addChangedListeners(eType, position);
    }

    private createJoinOperatorPanel(): void {
        const eJoinOperatorPanel = _createElement({ tag: 'div', cls: 'ag-filter-condition' });
        this.eJoinPanels.push(eJoinOperatorPanel);

        const eJoinOperatorAnd = this.createJoinOperator(this.eJoinAnds, eJoinOperatorPanel, 'and');
        const eJoinOperatorOr = this.createJoinOperator(this.eJoinOrs, eJoinOperatorPanel, 'or');

        this.getGui().appendChild(eJoinOperatorPanel);

        const index = this.eJoinPanels.length - 1;
        const uniqueGroupId = this.joinOperatorId++;
        this.resetJoinOperatorAnd(eJoinOperatorAnd, index, uniqueGroupId);
        this.resetJoinOperatorOr(eJoinOperatorOr, index, uniqueGroupId);

        if (!this.isReadOnly()) {
            eJoinOperatorAnd.onValueChange(this.listener);
            eJoinOperatorOr.onValueChange(this.listener);
        }
    }

    private createJoinOperator(
        eJoinOperators: GridRadioButton[],
        eJoinOperatorPanel: HTMLElement,
        andOr: string
    ): GridRadioButton {
        const eJoinOperator = this.createManagedBean<GridRadioButton>(new AgRadioButton());
        eJoinOperators.push(eJoinOperator);
        const baseClass = 'ag-filter-condition-operator';
        eJoinOperator.addCss(baseClass);
        eJoinOperator.addCss(`${baseClass}-${andOr}`);
        eJoinOperatorPanel.appendChild(eJoinOperator.getGui());
        return eJoinOperator;
    }

    private createFilterListOptions(): void {
        this.filterListOptions = this.optionsFactory.filterOptions.map((option) =>
            typeof option === 'string' ? this.createBoilerplateListOption(option) : this.createCustomListOption(option)
        );
    }

    private putOptionsIntoDropdown(eType: GridSelect): void {
        const { filterListOptions } = this;
        // Add specified options to condition drop-down.
        for (const listOption of filterListOptions) {
            eType.addOption(listOption);
        }

        // Make drop-downs read-only if there is only one option.
        eType.setDisabled(filterListOptions.length <= 1);
    }

    private createBoilerplateListOption(option: string): ListOption {
        return { value: option, text: this.translate(option as FilterLocaleTextKey) };
    }

    private createCustomListOption(option: IFilterOptionDef): ListOption {
        const { displayKey } = option;
        const customOption = this.optionsFactory.getCustomOption(option.displayKey);
        return {
            value: displayKey,
            text: customOption
                ? this.getLocaleTextFunc()(customOption.displayKey, customOption.displayName)
                : this.translate(displayKey as FilterLocaleTextKey),
        };
    }

    protected createBodyTemplate(): ElementParams | null {
        // created dynamically
        return null;
    }
    protected getAgComponents(): ComponentSelector[] {
        // created dynamically
        return [];
    }

    protected updateUiVisibility(): void {
        const joinOperator = this.getJoinOperator();
        this.updateNumConditions();

        // from here, the number of elements in all the collections is correct, so can just update the values/statuses
        this.updateConditionStatusesAndValues(this.lastUiCompletePosition!, joinOperator);
    }

    private updateNumConditions(): void {
        // Collection sizes are already correct if updated via API, so only need to handle UI updates here
        let lastUiCompletePosition = -1;
        let areAllConditionsUiComplete = true;
        for (let position = 0; position < this.getNumConditions(); position++) {
            if (this.isConditionUiComplete(position)) {
                lastUiCompletePosition = position;
            } else {
                areAllConditionsUiComplete = false;
            }
        }
        if (this.shouldAddNewConditionAtEnd(areAllConditionsUiComplete)) {
            this.createJoinOperatorPanel();
            this.createOption();
        } else {
            const activePosition = this.lastUiCompletePosition ?? this.getNumConditions() - 2;
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

    private updateConditionStatusesAndValues(lastUiCompletePosition: number, joinOperator?: JoinOperator): void {
        this.eTypes.forEach((eType, position) => {
            const disabled = this.isConditionDisabled(position, lastUiCompletePosition);

            eType.setDisabled(disabled || this.filterListOptions.length <= 1);
            if (position === 1) {
                _setDisabled(this.eJoinPanels[0], disabled);
                this.eJoinAnds[0].setDisabled(disabled);
                this.eJoinOrs[0].setDisabled(disabled);
            }
        });

        this.eConditionBodies.forEach((element, index) => {
            _setDisplayed(element, this.isConditionBodyVisible(index));
        });

        const orChecked = (joinOperator ?? this.getJoinOperator()) === 'OR';
        for (const eJoinOperatorAnd of this.eJoinAnds) {
            eJoinOperatorAnd.setValue(!orChecked, true);
        }
        for (const eJoinOperatorOr of this.eJoinOrs) {
            eJoinOperatorOr.setValue(orChecked, true);
        }

        this.forEachInput((element, index, position, numberOfInputs) => {
            this.setElementDisplayed(element, index < numberOfInputs);
            this.setElementDisabled(element, this.isConditionDisabled(position, lastUiCompletePosition));
        });

        this.resetPlaceholder();
    }

    private shouldAddNewConditionAtEnd(areAllConditionsUiComplete: boolean): boolean {
        return areAllConditionsUiComplete && this.getNumConditions() < this.maxNumConditions && !this.isReadOnly();
    }

    /** A condition the user is still fixing must not vanish under them. */
    protected removeConditionsAndOperators(startPosition: number, deleteCount?: number): void {
        if (this.hasInvalidInputs()) {
            return;
        }
        this.removeConditionsForModel(startPosition, deleteCount);
    }

    /** A model overrules an input the user is mid-way through, since the conditions are no longer theirs. */
    private removeConditionsForModel(startPosition: number, deleteCount?: number): void {
        if (startPosition >= this.getNumConditions()) {
            return;
        }
        const {
            eTypes,
            eConditionBodies,
            eJoinPanels: eJoinOperatorPanels,
            eJoinAnds: eJoinOperatorsAnd,
            eJoinOrs: eJoinOperatorsOr,
        } = this;

        this.removeComponents(eTypes, startPosition, deleteCount);
        this.removeElements(eConditionBodies, startPosition, deleteCount);
        this.removeEValues(startPosition, deleteCount);
        const joinOperatorIndex = Math.max(startPosition - 1, 0);
        this.removeElements(eJoinOperatorPanels, joinOperatorIndex, deleteCount);
        this.removeComponents(eJoinOperatorsAnd, joinOperatorIndex, deleteCount);
        this.removeComponents(eJoinOperatorsOr, joinOperatorIndex, deleteCount);
    }

    private removeElements(elements: HTMLElement[], startPosition: number, deleteCount?: number): void {
        const removedElements = removeItems(elements, startPosition, deleteCount);
        for (const element of removedElements) {
            _removeFromParent(element);
        }
    }

    protected removeComponents<TEventType extends string>(
        components: Component<TEventType>[],
        startPosition: number,
        deleteCount?: number
    ): void {
        const removedComponents = removeItems(components, startPosition, deleteCount);
        for (const comp of removedComponents) {
            _removeFromParent(comp.getGui());
            this.destroyBean(comp);
        }
    }

    public override afterGuiAttached(params?: IAfterGuiAttachedParams) {
        super.afterGuiAttached(params);

        this.resetPlaceholder();

        if (!params?.suppressFocus) {
            let elementToFocus: HTMLElement | undefined;
            if (!this.isReadOnly()) {
                const firstInput = this.getInputs(0)[0];
                if (firstInput instanceof AgAbstractInputField && this.isConditionBodyVisible(0)) {
                    elementToFocus = firstInput.getInputElement();
                } else {
                    // focus the dropdown instead
                    elementToFocus = this.eTypes[0]?.getFocusableElement();
                }
            }
            // something needs focus otherwise keyboard navigation breaks, so focus the filter body if missing
            (elementToFocus ?? this.getGui()).focus({ preventScroll: true });
        }
    }

    protected shouldKeepInvalidInputState(): boolean {
        // A range the user is still fixing is kept, as Chrome and Safari keep an incomplete date. Firefox
        // clears those, so it clears this too.
        if (_isBrowserFirefox() || !this.hasInvalidInputs()) {
            return false;
        }
        // Only a two-value condition has an order an input can be reported as out of.
        for (let position = 0, len = this.eTypes.length; position < len; ++position) {
            if (this.isRangeCondition(position)) {
                return true;
            }
        }
        return false;
    }

    public override afterGuiDetached(): void {
        super.afterGuiDetached();

        const params = this.params;

        if (this.beans.colFilter?.shouldKeepStateOnDetach(params.column) || this.shouldKeepInvalidInputState()) {
            return;
        }

        // Reset temporary UI state that was applied to the DOM but not committed to the model
        params.onStateChange({
            model: params.model,
        });

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
            } else {
                const shouldRemovePositionAtEnd =
                    position >= this.numAlwaysVisibleConditions && !this.isConditionUiComplete(position - 1);
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

    public getModelAsString(model: M): string {
        return this.params.getHandler()?.getModelAsString?.(model) ?? '';
    }

    // allow sub-classes to reset HTML placeholders after UI update.
    protected resetPlaceholder(): void {
        const globalTranslate = this.getLocaleTextFunc();
        const { filterPlaceholder, eTypes } = this;

        this.forEachInput((element, index, position, numberOfInputs) => {
            if (!(element instanceof AgAbstractInputField)) {
                return;
            }

            const placeholderKey =
                index === 0 && numberOfInputs > 1 ? 'inRangeStart' : index === 0 ? 'filterOoo' : 'inRangeEnd';
            const ariaLabel =
                index === 0 && numberOfInputs > 1
                    ? globalTranslate('ariaFilterFromValue', 'Filter from value')
                    : index === 0
                      ? globalTranslate('ariaFilterValue', 'Filter Value')
                      : globalTranslate('ariaFilterToValue', 'Filter to Value');

            const filterOptionKey = eTypes[position].getValue()!;
            const placeholderText = getPlaceholderText(
                this,
                filterPlaceholder,
                placeholderKey,
                filterOptionKey,
                this.optionsFactory
            );

            element.setInputPlaceholder(placeholderText);
            element.setInputAriaLabel(ariaLabel);
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected setElementValue(element: E, value: V | null, fromFloatingFilter?: boolean): void {
        if (element instanceof AgAbstractInputField) {
            element.setValue(value != null ? String(value) : null, true);
        }
    }

    protected setElementDisplayed(element: E, displayed: boolean): void {
        if (_isComponent(element)) {
            _setDisplayed(element.getGui(), displayed);
        }
    }

    protected setElementDisabled(element: E, disabled: boolean): void {
        if (_isComponent(element)) {
            _setDisabled(element.getGui(), disabled);
        }
    }

    protected attachElementOnChange(element: E, listener: () => void): void {
        if (element instanceof AgAbstractInputField) {
            element.onValueChange(listener);
        }
    }

    protected forEachInput(cb: (element: E, index: number, position: number, numberOfInputs: number) => void): void {
        const eTypes = this.eTypes;
        for (let position = 0, len = eTypes.length; position < len; ++position) {
            this.forEachPositionTypeInput(position, eTypes[position].getValue() ?? null, cb);
        }
    }

    protected forEachPositionInput(
        position: number,
        cb: (element: E, index: number, position: number, numberOfInputs: number) => void
    ): void {
        const type = this.getConditionType(position);
        this.forEachPositionTypeInput(position, type, cb);
    }

    private forEachPositionTypeInput(
        position: number,
        type: FilterOptionKey | null,
        cb: (element: E, index: number, position: number, numberOfInputs: number) => void
    ): void {
        const numberOfInputs = getNumberOfInputs(type, this.optionsFactory);
        const inputs = this.getInputs(position);
        for (let index = 0; index < inputs.length; index++) {
            const input = inputs[index];
            if (input != null) {
                cb(input, index, position, numberOfInputs);
            }
        }
    }

    private isConditionDisabled(position: number, lastUiCompletePosition: number): boolean {
        if (this.isReadOnly()) {
            return true;
        } // Read-only mode trumps everything.
        if (position === 0) {
            return false;
        } // Position 0 should typically be editable.

        // Only allow editing of a 2nd or later condition if the previous condition is complete and no subsequent conditions are complete.
        return position > lastUiCompletePosition + 1;
    }

    private isConditionBodyVisible(position: number): boolean {
        // Check that the condition needs inputs.
        const type = this.getConditionType(position);
        const numberOfInputs = getNumberOfInputs(type, this.optionsFactory);
        return numberOfInputs > 0;
    }

    // returns true if the UI represents a working filter, eg all parts are filled out.
    // eg if text filter and textfield blank then returns false.
    protected isConditionUiComplete(position: number): boolean {
        if (position >= this.getNumConditions()) {
            return false;
        } // Condition doesn't exist.

        const type = this.getConditionType(position);

        if (type === 'empty') {
            return false;
        }

        if (this.getValues(position).some((v) => v == null)) {
            return false;
        }

        if (this.positionHasInvalidInputs(position)) {
            return false;
        }

        return true;
    }

    private getNumConditions(): number {
        return this.eTypes.length;
    }

    private getUiCompleteConditions(): M[] {
        const conditions: M[] = [];
        for (let position = 0; position < this.getNumConditions(); position++) {
            if (this.isConditionUiComplete(position)) {
                conditions.push(this.createCondition(position));
            }
        }
        return conditions;
    }

    private createMissingConditionsAndOperators(): void {
        if (this.isReadOnly()) {
            return;
        } // don't show incomplete conditions when read only
        for (let i = this.getNumConditions(); i < this.numAlwaysVisibleConditions; i++) {
            this.createJoinOperatorPanel();
            this.createOption();
        }
    }

    private resetUiToDefaults(silent?: boolean): void {
        this.removeConditionsForModel(this.isReadOnly() ? 1 : this.numAlwaysVisibleConditions);

        this.eTypes.forEach((eType) => this.resetType(eType));

        this.eJoinAnds.forEach((eJoinOperatorAnd, index) =>
            this.resetJoinOperatorAnd(eJoinOperatorAnd, index, this.joinOperatorId + index)
        );
        this.eJoinOrs.forEach((eJoinOperatorOr, index) =>
            this.resetJoinOperatorOr(eJoinOperatorOr, index, this.joinOperatorId + index)
        );
        this.joinOperatorId++;

        this.forEachInput((element) => this.resetInput(element));

        this.resetPlaceholder();

        this.createMissingConditionsAndOperators();

        this.lastUiCompletePosition = null;

        this.updateUiVisibility();
        if (!silent) {
            this.params.onUiChange(this.getUiChangeEventParams());
        }
    }

    private resetType(eType: GridSelect): void {
        const translate = this.getLocaleTextFunc();
        const filteringLabel = translate('ariaFilteringOperator', 'Filtering operator');
        eType
            .setValue(this.optionsFactory.defaultOption, true)
            .setAriaLabel(filteringLabel)
            .setDisabled(this.isReadOnly() || this.filterListOptions.length <= 1);
    }

    private resetJoinOperatorAnd(eJoinOperatorAnd: GridRadioButton, index: number, uniqueGroupId: number): void {
        this.resetJoinOperator(
            eJoinOperatorAnd,
            index,
            this.defaultJoinOperator === 'AND',
            this.translate('andCondition'),
            uniqueGroupId
        );
    }

    private resetJoinOperatorOr(eJoinOperatorOr: GridRadioButton, index: number, uniqueGroupId: number): void {
        this.resetJoinOperator(
            eJoinOperatorOr,
            index,
            this.defaultJoinOperator === 'OR',
            this.translate('orCondition'),
            uniqueGroupId
        );
    }

    private resetJoinOperator(
        eJoinOperator: GridRadioButton,
        index: number,
        value: boolean,
        label: string,
        uniqueGroupId: number
    ): void {
        this.updateJoinOperatorDisabled(
            eJoinOperator
                .setValue(value, true)
                .setName(`ag-simple-filter-and-or-${this.getCompId()}-${uniqueGroupId}`)
                .setLabel(label),
            index
        );
    }

    private updateJoinOperatorsDisabled(): void {
        const updater = (eJoinOperator: GridRadioButton, index: number) =>
            this.updateJoinOperatorDisabled(eJoinOperator, index);
        this.eJoinAnds.forEach(updater);
        this.eJoinOrs.forEach(updater);
    }

    private updateJoinOperatorDisabled(eJoinOperator: GridRadioButton, index: number): void {
        eJoinOperator.setDisabled(this.isReadOnly() || index > 0);
    }

    private resetInput(element: E): void {
        this.setElementValue(element, null);
        this.setElementDisabled(element, this.isReadOnly());
    }

    /** A condition naming an option the dropdown does not offer cannot be shown, so the default is. */
    private setCombinedModelIntoUi(combinedModel: ICombinedSimpleModel<M>): void {
        let conditions = combinedModel.conditions;
        if (conditions == null) {
            conditions = [];
            this.beans.log.warn(77);
        }

        const numConditions = validateAndUpdateConditions<M>(this.beans.log, conditions, this.maxNumConditions);
        this.matchNumConditions(numConditions);

        const orChecked = combinedModel.operator === 'OR';
        const { eJoinAnds, eJoinOrs } = this;
        for (let i = 0, len = eJoinAnds.length; i < len; ++i) {
            eJoinAnds[i].setValue(!orChecked, true);
        }
        for (let i = 0, len = eJoinOrs.length; i < len; ++i) {
            eJoinOrs[i].setValue(orChecked, true);
        }

        for (let position = 0, len = conditions.length; position < len; ++position) {
            this.setConditionAndTypeIntoUi(conditions[position], position);
        }
    }

    private matchNumConditions(numConditions: number): void {
        const numPrevConditions = this.getNumConditions();
        if (numConditions < numPrevConditions) {
            this.removeConditionsForModel(numConditions);
            return;
        }
        for (let i = numPrevConditions; i < numConditions; i++) {
            this.createJoinOperatorPanel();
            this.createOption();
        }
    }

    private setConditionAndTypeIntoUi(condition: M, position: number): void {
        const optionsFactory = this.optionsFactory;
        const isOffered = optionsFactory.hasOption(condition.type);
        this.eTypes[position].setValue(isOffered ? condition.type : optionsFactory.defaultOption, true);
        this.setConditionIntoUi(isOffered ? condition : null, position);
    }

    // puts model values into the UI
    private setConditionIntoUi(model: M | null, position: number): void {
        const values = this.mapValuesFromModel(model, this.optionsFactory);
        this.forEachInput((element, index, elPosition) => {
            if (elPosition !== position) {
                return;
            }

            this.setElementValue(element, values[index] != null ? values[index] : null);
        });
    }

    // after floating filter changes, this sets the 'value' section. this is implemented by the base class
    // (as that's where value is controlled), the 'type' part from the floating filter is dealt with in this class.
    private setValueFromFloatingFilter(value: V | null): void {
        this.forEachInput((element, index, position) => {
            this.setElementValue(element, index === 0 && position === 0 ? value : null, true);
        });
    }

    private addChangedListeners(eType: GridSelect, position: number) {
        if (this.isReadOnly()) {
            return;
        }

        // The chosen option decides which inputs the condition uses, so their messages go stale with it.
        eType.onValueChange(() => {
            this.refreshInputValidation();
            this.onUiChanged();
        });

        this.forEachPositionInput(position, (element) => {
            this.attachElementOnChange(element, this.listener);
        });
    }

    protected isInputInvalid(_element: E): boolean {
        return false;
    }

    /** Whether the element holds a whole value, i.e. one its filter has had the chance to reject. */
    protected isInputValueSettled(_element: E): boolean {
        return true;
    }

    protected hasInvalidInputs(): boolean {
        let invalidInputs = false;
        // Past `numberOfInputs` an element is mounted but not part of the condition, so its message is not either.
        this.forEachInput((element, index, _position, numberOfInputs) => {
            invalidInputs ||=
                index < numberOfInputs && this.isInputValueSettled(element) && this.isInputInvalid(element);
        });
        return invalidInputs;
    }

    /** Unsettled inputs count here: this decides whether one condition may be applied, not whether it is stable. */
    protected positionHasInvalidInputs(position: number): boolean {
        let invalidInputs = false;
        this.forEachPositionInput(position, (element, index, _p, numberOfInputs) => {
            invalidInputs ||= index < numberOfInputs && this.isInputInvalid(element);
        });
        return invalidInputs;
    }

    private isReadOnly(): boolean {
        return !!this.params.readOnly;
    }
}
