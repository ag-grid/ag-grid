import { _makeNull } from '../../../agStack/utils/generic';
import { AgInputNumberField } from '../../../agStack/widgets/agInputNumberField';
import { AgInputTextField } from '../../../agStack/widgets/agInputTextField';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import { _createElement } from '../../../utils/element';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { FilterLocaleTextKey } from '../../filterLocaleText';
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

    protected override setElementValue(
        element: GridInputTextField | GridInputNumberField,
        value: number | null,
        fromFloatingFilter?: boolean
    ): void {
        // values from floating filter are directly from the input, not from the model
        const { numberFormatter } = this.params;
        const valueToSet = !fromFloatingFilter && numberFormatter ? numberFormatter(value ?? null) : value;
        super.setElementValue(element, valueToSet as any);
    }

    protected createEValue(): HTMLElement {
        const allowedCharPattern = getAllowedCharPattern(this.params);
        const parser = this.params.numberParser;

        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        const from = this.createFromToElement(eCondition, this.eValuesFrom, 'from', allowedCharPattern);
        const to = this.createFromToElement(eCondition, this.eValuesTo, 'to', allowedCharPattern);

        const getFieldChangedListener =
            (
                from: GridInputTextField | GridInputNumberField,
                to: GridInputTextField | GridInputNumberField,
                isFrom: boolean
            ) =>
            () => {
                const fromValue = getNormalisedValue(parser, from);
                const toValue = getNormalisedValue(parser, to);
                const localeKey = getValidityMessageKey(fromValue, toValue, isFrom);
                const validityMessage = localeKey
                    ? this.translate(localeKey, [String(isFrom ? toValue : fromValue)])
                    : '';
                (isFrom ? from : to).setCustomValidity(validityMessage);
            };

        from.addManagedListeners(from, {
            fieldValueChanged: getFieldChangedListener(from, to, true),
        });
        to.addManagedListeners(to, {
            fieldValueChanged: getFieldChangedListener(from, to, false),
        });

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
    return processNumberFilterValue(stringToFloat(numberParser, input.getValue()));
}

function getValidityMessageKey(
    fromValue: number | null,
    toValue: number | null,
    isFrom: boolean
): FilterLocaleTextKey | null {
    const isInvalid = fromValue != null && toValue != null && fromValue > toValue;
    if (!isInvalid) {
        return null;
    }
    return isFrom ? 'tooBig' : 'tooSmall';
}
