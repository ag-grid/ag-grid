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
import { AgInputTextField } from '../../agWidgets/agInputTextField';
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
import { isFilterLocaleTextKey } from '../filterLocaleText';
import type {
    FilterOptionKey,
    ICombinedSimpleModel,
    IFilterOptionDef,
    ISimpleFilter,
    ISimpleFilterModel,
    ISimpleFilterParams,
    JoinOperator,
    MapValuesFromSimpleFilterModel,
    SimpleFilterParams,
    Tuple,
} from './iSimpleFilter';
import { OptionsFactory } from './optionsFactory';
import { ProvidedFilter } from './providedFilter';
import { getPlaceholderText, translateFilterOption } from './providedFilterUtils';
import {
    getDefaultJoinOperator,
    getNumberOfInputs,
    isBelowConditionFloor,
    removeItems,
    validateAndUpdateConditions,
} from './simpleFilterUtils';

/** temporary type until `SimpleFilterParams` is updated as breaking change */
export type SimpleFilterDisplayParams<M extends ISimpleFilterModel> = ISimpleFilterParams &
    FilterDisplayParams<any, any, M | ICombinedSimpleModel<M>>;

type FilterModelOrCombined<M extends ISimpleFilterModel> = M | ICombinedSimpleModel<M> | null;

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
    /** The chosen option decides which inputs the condition uses, so their messages go stale with it. */
    private readonly typeListener = () => {
        this.refreshInputValidation();
        this.onUiChanged();
    };

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
        private readonly defaultOptions: string[]
    ) {
        super(filterNameKey, 'simple-filter');
    }

    protected abstract createEValue(): HTMLElement;

    protected abstract removeEValues(startPosition: number, deleteCount?: number): void;

    /** Decides whether the model has changed, and so whether the filter has. */
    protected abstract areSimpleModelsEqual(a: ISimpleFilterModel, b: ISimpleFilterModel): boolean;

    /** Called once per condition; a lone one is the model, more are joined into a combined one. */
    protected abstract createCondition(position: number): M;

    /** The condition's inputs, held by the subclass that mounts them. */
    protected abstract getInputs(position: number): Tuple<E>;

    /** What those inputs currently hold, read through the subclass's own parsing. */
    protected abstract getValues(position: number): Tuple<V>;

    /** Re-validates every mounted condition: a message stands for the condition as it is now. */
    protected refreshInputValidation(reattached?: boolean): void {
        for (let position = 0, len = this.getNumConditions(); position < len; ++position) {
            this.refreshPositionValidation(position, false, reattached);
        }
    }

    protected refreshPositionValidation(_position: number, _isFrom?: boolean, _reattached?: boolean): void {
        // Only the filters whose inputs can reject what they hold override this; `isFrom` names the edited input.
    }

    protected conditionNumberOfInputs(position: number): number {
        return getNumberOfInputs(this.getConditionType(position), this.optionsFactory);
    }

    protected override setParams(params: P): void {
        super.setParams(params);

        const optionsFactory = new OptionsFactory();
        this.optionsFactory = optionsFactory;
        optionsFactory.init(this.beans.log, params, this.defaultOptions);

        this.commonUpdateSimpleParams(params);

        this.createOption();
        this.createMissingConditionsAndOperators();
    }

    protected override updateParams(newParams: P, oldParams: P): void {
        this.optionsFactory.refresh(this.beans.log, newParams, this.defaultOptions);

        super.updateParams(newParams, oldParams);

        this.commonUpdateSimpleParams(newParams);
        // A replacement input carries no validity, and an option keeping its key can still change arity.
        this.refreshInputValidation();
        this.updateUiVisibility(); // an invalid condition is not a complete one
    }

    protected commonUpdateSimpleParams(params: P): void {
        this.setNumConditions(params);

        this.forEachInput((element) => {
            if (element instanceof AgAbstractInputField) {
                element.setAutoComplete(params.browserAutoComplete);
            }
        });

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
        // The conditions are the floating filter's now, so a message an earlier edit left is about nothing shown.
        this.refreshInputValidation();
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
        return (this.eTypes[position]?.getValue() ?? null) as FilterOptionKey | null;
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
            const combinedModel = model as ICombinedSimpleModel<M>;

            let conditions = combinedModel.conditions;
            if (conditions == null) {
                conditions = [];
                this.beans.log.warn(77);
            }

            const numConditions = validateAndUpdateConditions<M>(this.beans.log, conditions, this.maxNumConditions);
            const numPrevConditions = this.getNumConditions();
            if (numConditions < numPrevConditions) {
                this.removeConditionsForModel(numConditions);
            } else if (numConditions > numPrevConditions) {
                this.createConditionsUpTo(numConditions);
            }

            const orChecked = combinedModel.operator === 'OR';
            this.eJoinAnds.forEach((eJoinOperatorAnd) => eJoinOperatorAnd.setValue(!orChecked, true));
            this.eJoinOrs.forEach((eJoinOperatorOr) => eJoinOperatorOr.setValue(orChecked, true));

            conditions.forEach((condition, position) => {
                this.eTypes[position].setValue(condition.type, true);
                this.setConditionIntoUi(condition, position);
            });
        } else {
            const simpleModel = model as M;

            if (this.getNumConditions() > 1) {
                this.removeConditionsForModel(1);
            }
            // A read-only filter a conditionless model emptied has no widget left to hold this one.
            this.createConditionsUpTo(1);

            this.eTypes[0].setValue(simpleModel.type, true);
            this.setConditionIntoUi(simpleModel, 0);
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
        // Whole counts, so that what the display will build matches the limit a model is held to.
        let maxNumConditions = Math.floor(params.maxNumConditions ?? 2);
        if (isBelowConditionFloor(maxNumConditions)) {
            this.beans.log.warn(79);
            maxNumConditions = 1;
        }
        this.maxNumConditions = maxNumConditions;

        let numAlwaysVisibleConditions = Math.floor(params.numAlwaysVisibleConditions ?? 1);
        if (isBelowConditionFloor(numAlwaysVisibleConditions)) {
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

    /** `translate` is overridden per filter, so a key the grid defines goes through it; any other is its own label. */
    private createBoilerplateListOption(option: string): ListOption {
        const text = isFilterLocaleTextKey(option) ? this.translate(option) : this.getLocaleTextFunc()(option, option);
        return { value: option, text };
    }

    private createCustomListOption(option: IFilterOptionDef): ListOption {
        const displayKey = option.displayKey;
        return { value: displayKey, text: translateFilterOption(this, this.optionsFactory, displayKey) };
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
            this.createConditionsUpTo(this.getNumConditions() + 1);
        } else {
            const activePosition = this.lastUiCompletePosition ?? this.getNumConditions() - 2;
            if (lastUiCompletePosition < activePosition) {
                // remove any incomplete conditions at the end, excluding the active position
                const removed = this.removeConditionsAndOperators(activePosition + 1);
                const removeStartPosition = lastUiCompletePosition + 1;
                const numConditionsToRemove = activePosition - removeStartPosition;
                if (numConditionsToRemove > 0) {
                    this.removeConditionsAndOperators(removeStartPosition, numConditionsToRemove);
                }
                this.createMissingConditionsAndOperators();
                // Still on show, so still editable: disabling it would leave no way to correct it.
                if (!removed) {
                    lastUiCompletePosition = activePosition;
                }
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

    /** A condition the user is still fixing must not vanish under them; false when it was kept for that reason. */
    protected removeConditionsAndOperators(startPosition: number, deleteCount?: number): boolean {
        if (this.hasInvalidInputs()) {
            return false;
        }
        this.removeConditionsForModel(startPosition, deleteCount);
        return true;
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

        this.onGuiAttached(params);
        this.refreshInputValidation(true);
    }

    protected onGuiAttached(_params?: IAfterGuiAttachedParams): void {
        // Overridden by a subclass whose inputs need readying before their validity is judged and reported.
    }

    /** Keeps the unfinished edit, as Chrome and Safari keep an incomplete date; Firefox clears those, so it does. */
    protected shouldKeepInvalidInputState(): boolean {
        return !_isBrowserFirefox() && this.hasInvalidInputs();
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
                    // A refused removal leaves the condition mounted, so nothing after it counts as shifted.
                    const removed = this.removeConditionsAndOperators(position, 1);
                    conditionsRemoved ||= removed;
                    if (removed && positionBeforeLastUiCompletePosition) {
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

            const filterOptionKey = eTypes[position].getValue() as FilterOptionKey;
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
    protected setElementValue(element: E, value: V | string | null, fromFloatingFilter?: boolean): void {
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
        if (element instanceof AgInputTextField) {
            element.onValueClear(() => this.onUiCleared());
        }
    }

    protected forEachInput(cb: (element: E, index: number, position: number, numberOfInputs: number) => void): void {
        for (let position = 0, len = this.getNumConditions(); position < len; ++position) {
            this.forEachPositionTypeInput(position, this.getConditionType(position), cb);
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
        return this.conditionNumberOfInputs(position) > 0;
    }

    // returns true if the UI represents a working filter, eg all parts are filled out.
    // eg if text filter and textfield blank then returns false.
    protected isConditionUiComplete(position: number): boolean {
        if (position >= this.getNumConditions()) {
            return false;
        } // Condition doesn't exist.

        const type = this.getConditionType(position);

        if (!type || type === 'empty') {
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
        this.createConditionsUpTo(this.numAlwaysVisibleConditions);
    }

    /** A join operator joins a condition to the one before it, so the first is not preceded by one. */
    private createConditionsUpTo(count: number): void {
        for (let i = this.getNumConditions(); i < count; i++) {
            if (i > 0) {
                this.createJoinOperatorPanel();
            }
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

        this.refreshInputValidation();

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

        eType.onValueChange(this.typeListener);

        this.attachInputsOnChange(position);
    }

    /** Re-attachable on its own: a replaced input carries none of the original's listeners. */
    protected attachInputsOnChange(position: number): void {
        if (this.isReadOnly()) {
            return;
        }

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

    /** Reached per keystroke through `canApply`, so it stops at the first invalid condition. */
    protected hasInvalidInputs(): boolean {
        for (let position = 0, len = this.getNumConditions(); position < len; ++position) {
            if (this.positionHasInvalidInputs(position, true)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Past `numberOfInputs` an element is mounted but not part of the condition, so its message is not either.
     * Unsettled inputs count unless `settledOnly`: whether a condition may be applied is not whether it is stable.
     */
    protected positionHasInvalidInputs(position: number, settledOnly?: boolean): boolean {
        let invalidInputs = false;
        this.forEachPositionInput(position, (element, index, _p, numberOfInputs) => {
            invalidInputs ||=
                index < numberOfInputs &&
                (!settledOnly || this.isInputValueSettled(element)) &&
                this.isInputInvalid(element);
        });
        return invalidInputs;
    }

    protected override canApply(_model: FilterModelOrCombined<M>): boolean {
        return !this.hasInvalidInputs();
    }

    private isReadOnly(): boolean {
        return !!this.params.readOnly;
    }
}
