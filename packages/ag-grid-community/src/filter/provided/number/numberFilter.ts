import { _makeNull } from '../../../agStack/utils/generic';
import { AgInputNumberField } from '../../../agStack/widgets/agInputNumberField';
import { AgInputTextField } from '../../../agStack/widgets/agInputTextField';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import { _createElement } from '../../../utils/element';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { FilterLocaleTextKey } from '../../filterLocaleText';
import type { ProvidedFilterParams } from '../iProvidedFilter';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { SimpleFilter } from '../simpleFilter';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';
import { DEFAULT_NUMBER_FILTER_OPTIONS } from './numberFilterConstants';
import { getAllowedCharPattern, mapValuesFromNumberFilterModel, processNumberFilterValue } from './numberFilterUtils';

/** temporary type until `NumberFilterParams` is updated as breaking change */
type NumberFilterDisplayParams = INumberFilterParams &
    FilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>>;

export class NumberFilter extends SimpleFilter<
    NumberFilterModel,
    number,
    GridInputTextField | GridInputNumberField,
    NumberFilterDisplayParams
> {
    private readonly eValuesFrom: (GridInputTextField | GridInputNumberField)[] = [];
    private readonly eValuesTo: (GridInputTextField | GridInputNumberField)[] = [];

    public readonly filterType = 'number' as const;

    constructor() {
        super('numberFilter', mapValuesFromNumberFilterModel, DEFAULT_NUMBER_FILTER_OPTIONS);
    }

    protected override defaultDebounceMs = 500;

    public override afterGuiAttached(params?: IAfterGuiAttachedParams | undefined): void {
        super.afterGuiAttached(params);

        // Refresh validation
        this.refreshInputValidation();
    }

    private refreshInputValidation(): void {
        for (let i = 0; i < this.eValuesFrom.length; i++) {
            const from = this.eValuesFrom[i];
            const to = this.eValuesTo[i];
            this.refreshInputPairValidation(from, to);
        }
    }

    protected override areStatesEqual(stateA: any, stateB: any): boolean {
        return (stateA ?? false) === (stateB ?? false);
    }

    private refreshInputPairValidation(
        from: GridInputNumberField | GridInputTextField,
        to: GridInputNumberField | GridInputTextField,
        isFrom = false
    ): void {
        const parser = this.params.numberParser;
        const fromValue = getNormalisedValue(parser, from);
        const toValue = getNormalisedValue(parser, to);
        const localeKey = getValidityMessageKey(fromValue, toValue, isFrom);
        const validityMessage = localeKey ? this.translate(localeKey, [String(isFrom ? toValue : fromValue)]) : '';
        (isFrom ? from : to).setCustomValidity(validityMessage); // Set validity error state for target input
        (isFrom ? to : from).setCustomValidity(''); // Reset validity error state for other input
        if (validityMessage.length > 0) {
            this.beans.ariaAnnounce.announceValue(validityMessage, 'dateFilter');
        }
    }

    protected override getState() {
        return this.hasInvalidInputs();
    }

    public override refresh(legacyNewParams: ProvidedFilterParams): boolean {
        const result = super.refresh(legacyNewParams);

        const newState = (legacyNewParams as unknown as NumberFilterDisplayParams).state;
        const oldState = this.state;

        if (newState.model !== oldState.model || !this.areStatesEqual(newState.state, oldState.state)) {
            this.refreshInputValidation();
        }

        return result;
    }

    protected override setElementValue(
        element: GridInputTextField | GridInputNumberField,
        value: number | null,
        fromFloatingFilter?: boolean
    ): void {
        // values from floating filter are directly from the input, not from the model
        const { numberFormatter } = this.params;
        const valueToSet = !fromFloatingFilter && numberFormatter ? numberFormatter(value ?? null) : value;
        super.setElementValue(element, valueToSet as any);
        if (valueToSet === null) {
            element.setCustomValidity('');
        }
    }

    protected createEValue(): HTMLElement {
        const { params, eValuesFrom, eValuesTo } = this;
        const allowedCharPattern = getAllowedCharPattern(params);

        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        const from = this.createFromToElement(eCondition, eValuesFrom, 'from', allowedCharPattern);
        const to = this.createFromToElement(eCondition, eValuesTo, 'to', allowedCharPattern);

        const getFieldChangedListener =
            (
                from: GridInputTextField | GridInputNumberField,
                to: GridInputTextField | GridInputNumberField,
                isFrom: boolean
            ) =>
            () =>
                this.refreshInputPairValidation(from, to, isFrom);

        from.onValueChange(getFieldChangedListener(from, to, true));
        to.onValueChange(getFieldChangedListener(from, to, false));

        return eCondition;
    }

    private createFromToElement(
        eCondition: HTMLElement,
        eValues: (GridInputTextField | GridInputNumberField)[],
        fromTo: string,
        allowedCharPattern: string | null
    ): GridInputTextField | GridInputNumberField {
        const eValue = this.createManagedBean<GridInputTextField | GridInputNumberField>(
            allowedCharPattern ? new AgInputTextField({ allowedCharPattern }) : new AgInputNumberField()
        );
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
        return eValue;
    }

    protected removeEValues(startPosition: number, deleteCount?: number): void {
        const removeComps = (eGui: (GridInputTextField | GridInputNumberField)[]) =>
            this.removeComponents(eGui, startPosition, deleteCount);

        removeComps(this.eValuesFrom);
        removeComps(this.eValuesTo);
    }

    protected getValues(position: number): Tuple<number> {
        const result: Tuple<number> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(processNumberFilterValue(stringToFloat(this.params.numberParser, element.getValue())));
            }
        });

        return result;
    }

    protected areSimpleModelsEqual(aSimple: NumberFilterModel, bSimple: NumberFilterModel): boolean {
        return (
            aSimple.filter === bSimple.filter && aSimple.filterTo === bSimple.filterTo && aSimple.type === bSimple.type
        );
    }

    protected createCondition(position: number): NumberFilterModel {
        const type = this.getConditionType(position);
        const model: NumberFilterModel = {
            filterType: this.filterType,
            type,
        };

        const values = this.getValues(position);
        if (values.length > 0) {
            model.filter = values[0];
        }
        if (values.length > 1) {
            model.filterTo = values[1];
        }

        return model;
    }

    protected getInputs(position: number): Tuple<GridInputTextField | GridInputNumberField> {
        const { eValuesFrom, eValuesTo } = this;
        if (position >= eValuesFrom.length) {
            return [null, null];
        }
        return [eValuesFrom[position], eValuesTo[position]];
    }

    protected override hasInvalidInputs(): boolean {
        let invalidInputs = false;
        this.forEachInput((element) => {
            invalidInputs ||= !element.getInputElement().validity.valid;
        });
        return invalidInputs;
    }

    protected override canApply(_model: NumberFilterModel | ICombinedSimpleModel<NumberFilterModel> | null): boolean {
        return !this.hasInvalidInputs();
    }
}

function stringToFloat(
    numberParser: INumberFilterParams['numberParser'],
    value?: string | number | null
): number | null {
    if (typeof value === 'number') {
        return value;
    }

    let filterText = _makeNull(value);

    if (filterText != null && filterText.trim() === '') {
        filterText = null;
    }

    if (numberParser) {
        return numberParser(filterText);
    }

    return filterText == null || filterText.trim() === '-' ? null : Number.parseFloat(filterText);
}

function getNormalisedValue(
    numberParser: INumberFilterParams['numberParser'],
    input: GridInputTextField | GridInputNumberField
): number | null {
    return processNumberFilterValue(stringToFloat(numberParser, input.getValue(true)));
}

function getValidityMessageKey(
    fromValue: number | null,
    toValue: number | null,
    isFrom: boolean
): FilterLocaleTextKey | null {
    const isInvalid = fromValue != null && toValue != null && fromValue >= toValue;
    if (!isInvalid) {
        return null;
    }
    return `strict${isFrom ? 'Max' : 'Min'}ValueValidation`;
}
