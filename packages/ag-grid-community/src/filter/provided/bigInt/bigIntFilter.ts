import { _isBrowserFirefox, _parseBigIntOrNull } from 'ag-stack';

import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import { _createElement } from '../../../utils/element';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { FilterLocaleTextKey } from '../../filterLocaleText';
import type { ProvidedFilterParams } from '../iProvidedFilter';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { SimpleFilter } from '../simpleFilter';
import { DEFAULT_BIGINT_FILTER_OPTIONS } from './bigIntFilterConstants';
import { getAllowedCharPattern, mapValuesFromBigIntFilterModel } from './bigIntFilterUtils';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

/** temporary type until `BigIntFilterParams` is updated as breaking change */
type BigIntFilterDisplayParams = IBigIntFilterParams &
    FilterDisplayParams<any, any, BigIntFilterModel | ICombinedSimpleModel<BigIntFilterModel>>;

export class BigIntFilter extends SimpleFilter<
    BigIntFilterModel,
    bigint,
    GridInputTextField,
    BigIntFilterDisplayParams
> {
    private readonly eValuesFrom: GridInputTextField[] = [];
    private readonly eValuesTo: GridInputTextField[] = [];

    public readonly filterType = 'bigint' as const;

    constructor() {
        super('bigintFilter', mapValuesFromBigIntFilterModel, DEFAULT_BIGINT_FILTER_OPTIONS);
    }

    protected override defaultDebounceMs = 500;

    public override afterGuiAttached(params?: IAfterGuiAttachedParams | undefined): void {
        super.afterGuiAttached(params);

        this.refreshInputValidation();
    }

    protected override shouldKeepInvalidInputState(): boolean {
        return !_isBrowserFirefox() && this.hasInvalidInputs() && this.getConditionTypes().includes('inRange');
    }

    private refreshInputValidation(): void {
        for (let i = 0; i < this.eValuesFrom.length; i++) {
            const from = this.eValuesFrom[i];
            const to = this.eValuesTo[i];
            this.refreshInputPairValidation(from, to);
        }
    }

    private refreshInputPairValidation(from: GridInputTextField, to: GridInputTextField, isFrom = false): void {
        const { bigintParser } = this.params;
        const fromValue = this.getParsedValue(from, bigintParser);
        const toValue = this.getParsedValue(to, bigintParser);
        const fromInvalid = this.isInvalidValue(from, fromValue);
        const toInvalid = this.isInvalidValue(to, toValue);

        const target = isFrom ? from : to;
        const other = isFrom ? to : from;
        const targetInvalid = isFrom ? fromInvalid : toInvalid;
        const otherInvalid = isFrom ? toInvalid : fromInvalid;

        let validityMessage = '';
        if (targetInvalid) {
            const translate = this.getLocaleTextFunc();
            validityMessage = translate('invalidBigInt', 'Invalid BigInt');
        } else if (!fromInvalid && !toInvalid) {
            const localeKey = getValidityMessageKey(fromValue, toValue, isFrom);
            if (localeKey) {
                validityMessage = this.translate(localeKey, [String(isFrom ? to.getValue() : from.getValue())]);
            }
        }

        target.setCustomValidity(validityMessage);
        if (!otherInvalid) {
            other.setCustomValidity('');
        }
        if (validityMessage.length > 0) {
            this.beans.ariaAnnounce.announceValue(validityMessage, 'dateFilter');
        }
    }

    protected override getState(): { isInvalid: boolean } {
        return { isInvalid: this.hasInvalidInputs() };
    }

    protected override areStatesEqual(stateA?: { isInvalid: boolean }, stateB?: { isInvalid: boolean }): boolean {
        return (stateA?.isInvalid ?? false) === (stateB?.isInvalid ?? false);
    }

    public override refresh(legacyNewParams: ProvidedFilterParams): boolean {
        const result = super.refresh(legacyNewParams);

        const { state: newState, additionalEventAttributes } = legacyNewParams as unknown as BigIntFilterDisplayParams;
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

    protected override setElementValue(
        element: GridInputTextField,
        value: bigint | null,
        fromFloatingFilter?: boolean
    ): void {
        super.setElementValue(element, value as any, fromFloatingFilter);
        if (value === null) {
            element.setCustomValidity('');
        }
    }

    protected createEValue(): HTMLElement {
        const { params, eValuesFrom, eValuesTo } = this;
        const allowedCharPattern = getAllowedCharPattern(params);

        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        const from = this.createFromToElement(eCondition, eValuesFrom, 'from', allowedCharPattern);
        const to = this.createFromToElement(eCondition, eValuesTo, 'to', allowedCharPattern);

        const getFieldChangedListener = (fromEl: GridInputTextField, toEl: GridInputTextField, isFrom: boolean) => () =>
            this.refreshInputPairValidation(fromEl, toEl, isFrom);

        const fromListener = getFieldChangedListener(from, to, true);
        from.onValueChange(fromListener);
        from.addGuiEventListener('focusin', fromListener);

        const toListener = getFieldChangedListener(from, to, false);
        to.onValueChange(toListener);
        to.addGuiEventListener('focusin', toListener);

        return eCondition;
    }

    private createFromToElement(
        eCondition: HTMLElement,
        eValues: GridInputTextField[],
        fromTo: string,
        allowedCharPattern: string | null
    ): GridInputTextField {
        const eValue = this.createManagedBean<GridInputTextField>(
            allowedCharPattern ? new AgInputTextField({ allowedCharPattern }) : new AgInputTextField()
        );
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
        return eValue;
    }

    protected removeEValues(startPosition: number, deleteCount?: number): void {
        const removeComps = (eGui: GridInputTextField[]) => this.removeComponents(eGui, startPosition, deleteCount);

        removeComps(this.eValuesFrom);
        removeComps(this.eValuesTo);
    }

    protected getValues(position: number): Tuple<bigint> {
        const result: Tuple<bigint> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(_parseBigIntOrNull(element.getValue() ?? null));
            }
        });

        return result;
    }

    protected areSimpleModelsEqual(aSimple: BigIntFilterModel, bSimple: BigIntFilterModel): boolean {
        return (
            aSimple.filter === bSimple.filter && aSimple.filterTo === bSimple.filterTo && aSimple.type === bSimple.type
        );
    }

    protected createCondition(position: number): BigIntFilterModel {
        const type = this.getConditionType(position);
        const model: BigIntFilterModel = {
            filterType: this.filterType,
            type,
        };

        const values = this.getValues(position);
        if (values.length > 0) {
            model.filter = String(values[0]);
        }
        if (values.length > 1) {
            model.filterTo = String(values[1]);
        }

        return model;
    }

    protected override removeConditionsAndOperators(startPosition: number, deleteCount?: number | undefined): void {
        if (this.hasInvalidInputs()) {
            return;
        }

        return super.removeConditionsAndOperators(startPosition, deleteCount);
    }

    protected override getInputs(position: number): Tuple<GridInputTextField> {
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

    protected override canApply(_model: BigIntFilterModel | ICombinedSimpleModel<BigIntFilterModel> | null): boolean {
        return !this.hasInvalidInputs();
    }

    private getParsedValue(
        element: GridInputTextField,
        bigintParser: IBigIntFilterParams['bigintParser']
    ): bigint | null {
        const rawValue = element.getValue();
        if (rawValue == null || (typeof rawValue === 'string' && rawValue.trim() === '')) {
            return null;
        }
        return bigintParser ? bigintParser(rawValue) : _parseBigIntOrNull(rawValue);
    }

    private isInvalidValue(element: GridInputTextField, parsedValue: bigint | null): boolean {
        const rawValue = element.getValue();
        return rawValue != null && String(rawValue).trim() !== '' && parsedValue === null;
    }
}

function getValidityMessageKey(
    fromValue: bigint | null,
    toValue: bigint | null,
    isFrom: boolean
): FilterLocaleTextKey | null {
    const isInvalid = fromValue != null && toValue != null && fromValue >= toValue;
    if (!isInvalid) {
        return null;
    }
    return `strict${isFrom ? 'Max' : 'Min'}ValueValidation`;
}
