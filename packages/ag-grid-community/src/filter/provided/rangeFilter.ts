import { _isBrowserFirefox } from 'ag-stack';

import type { IAfterGuiAttachedParams } from '../../interfaces/iAfterGuiAttachedParams';
import { _createElement } from '../../utils/element';
import type { GridInputNumberField, GridInputTextField } from '../../widgets/gridWidgetTypes';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import type { ProvidedFilterParams } from './iProvidedFilter';
import type { ISimpleFilterModel, ISimpleFilterModelType, Tuple } from './iSimpleFilter';
import type { SimpleFilterDisplayParams } from './simpleFilter';
import { SimpleFilter } from './simpleFilter';

interface IRangeFilterModel<TValue> extends ISimpleFilterModel {
    filter?: TValue | null;
    filterTo?: TValue | null;
}

type RangeFilterState = { isInvalid: boolean };

type RangeFilterField = GridInputTextField | GridInputNumberField;

/**
 * A simple filter over an ordered value type, presented as a from/to pair of inputs whose combined
 * validity drives the UI state.
 *
 * @param M type of filter-model managed by the concrete sub-class
 * @param F type of the from/to values as they are stored in the model
 * @param V type of value managed by the concrete sub-class
 * @param E type of UI element used for collecting user-input
 */
export abstract class RangeFilter<
    M extends IRangeFilterModel<F>,
    F,
    V extends bigint | number,
    E extends RangeFilterField,
    P extends SimpleFilterDisplayParams<M> & { allowedCharPattern?: string | null },
> extends SimpleFilter<M, V, E, P> {
    protected readonly eValuesFrom: E[] = [];
    protected readonly eValuesTo: E[] = [];

    protected override defaultDebounceMs = 500;

    protected abstract createInputField(allowedCharPattern: string | null): E;

    protected abstract refreshInputPairValidation(from: E, to: E, isFrom?: boolean): void;

    protected abstract createModel(type: ISimpleFilterModelType | null): M;

    protected abstract toModelValue(value: V | null): F | null;

    public override afterGuiAttached(params?: IAfterGuiAttachedParams | undefined): void {
        super.afterGuiAttached(params);

        this.refreshInputValidation();
    }

    protected override shouldKeepInvalidInputState(): boolean {
        // We deliberately keep invalid input state for inRange filters when not in Firefox
        // to mimic the behaviour for incomplete date and datetime inputs (which are cleared
        // in Firefox but not in Chrome/Safari)
        return !_isBrowserFirefox() && this.hasInvalidInputs() && this.getConditionTypes().includes('inRange');
    }

    protected refreshInputValidation(): void {
        const { eValuesFrom, eValuesTo } = this;
        for (let i = 0, len = eValuesFrom.length; i < len; ++i) {
            this.refreshInputPairValidation(eValuesFrom[i], eValuesTo[i]);
        }
    }

    protected override getState(): RangeFilterState {
        // State represents non-model related UI state, so we make this equivalent to the validity state of the inputs
        // so that changes in validity state cause updates to the UI (see `ProvidedFilter.refresh`).
        return { isInvalid: this.hasInvalidInputs() };
    }

    protected override areStatesEqual(stateA?: RangeFilterState, stateB?: RangeFilterState): boolean {
        // The state is just a boolean of whether or not any inputs are invalid, so `undefined` is identical to `false`
        return (stateA?.isInvalid ?? false) === (stateB?.isInvalid ?? false);
    }

    public override refresh(legacyNewParams: ProvidedFilterParams): boolean {
        const result = super.refresh(legacyNewParams);

        const { state: newState, additionalEventAttributes } = legacyNewParams as unknown as P;
        const oldState = this.state;

        const fromAction = additionalEventAttributes?.fromAction;
        const forceRefreshValidation = fromAction && fromAction != 'apply';

        if (
            forceRefreshValidation ||
            newState.model !== oldState.model ||
            !this.areStatesEqual(newState.state, oldState.state)
        ) {
            this.refreshInputValidation();
        }

        return result;
    }

    protected createEValue(): HTMLElement {
        const { eValuesFrom, eValuesTo } = this;
        const allowedCharPattern = this.params.allowedCharPattern ?? null;

        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        const from = this.createFromToElement(eCondition, eValuesFrom, 'from', allowedCharPattern);
        const to = this.createFromToElement(eCondition, eValuesTo, 'to', allowedCharPattern);

        const getFieldChangedListener = (isFrom: boolean) => () => this.refreshInputPairValidation(from, to, isFrom);

        const fromListener = getFieldChangedListener(true);
        from.onValueChange(fromListener);
        from.addGuiEventListener('focusin', fromListener);

        const toListener = getFieldChangedListener(false);
        to.onValueChange(toListener);
        to.addGuiEventListener('focusin', toListener);

        return eCondition;
    }

    private createFromToElement(
        eCondition: HTMLElement,
        eValues: E[],
        fromTo: string,
        allowedCharPattern: string | null
    ): E {
        const eValue = this.createManagedBean<E>(this.createInputField(allowedCharPattern));
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
        return eValue;
    }

    protected removeEValues(startPosition: number, deleteCount?: number): void {
        const removeComps = (eGui: E[]) => this.removeComponents(eGui, startPosition, deleteCount);

        removeComps(this.eValuesFrom);
        removeComps(this.eValuesTo);
    }

    protected areSimpleModelsEqual(aSimple: M, bSimple: M): boolean {
        return (
            aSimple.filter === bSimple.filter && aSimple.filterTo === bSimple.filterTo && aSimple.type === bSimple.type
        );
    }

    protected createCondition(position: number): M {
        const model = this.createModel(this.getConditionType(position));

        const values = this.getValues(position);
        if (values.length > 0) {
            model.filter = this.toModelValue(values[0]);
        }
        if (values.length > 1) {
            model.filterTo = this.toModelValue(values[1]);
        }

        return model;
    }

    protected override removeConditionsAndOperators(startPosition: number, deleteCount?: number | undefined): void {
        if (this.hasInvalidInputs()) {
            // When there are invalid inputs (which currently can only be when there is an invalid range in the last condition)
            // we don't want to remove those conditions, to prevent the condition from disappearing just as the user finishes
            // editing it.
            return;
        }

        return super.removeConditionsAndOperators(startPosition, deleteCount);
    }

    protected override getInputs(position: number): Tuple<E> {
        const { eValuesFrom, eValuesTo } = this;
        if (position >= eValuesFrom.length) {
            return [null, null];
        }
        return [eValuesFrom[position], eValuesTo[position]];
    }

    protected override hasInvalidInputs(): boolean {
        let invalidInputs = false;
        this.forEachInput((element) => (invalidInputs ||= !element.getInputElement().validity.valid));
        return invalidInputs;
    }

    protected override positionHasInvalidInputs(position: number): boolean {
        let invalidInputs = false;
        this.forEachPositionInput(position, (element) => (invalidInputs ||= !element.getInputElement().validity.valid));
        return invalidInputs;
    }

    protected override canApply(): boolean {
        return !this.hasInvalidInputs();
    }
}

export function _getRangeValidityMessageKey(
    fromValue: bigint | number | null,
    toValue: bigint | number | null,
    isFrom: boolean
): FilterLocaleTextKey | null {
    const isInvalid = fromValue != null && toValue != null && fromValue >= toValue;
    if (!isInvalid) {
        return null;
    }
    return `strict${isFrom ? 'Max' : 'Min'}ValueValidation`;
}
