import { _makeNull } from 'ag-stack';

import { AgInputNumberField } from '../../../agWidgets/agInputNumberField';
import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { ICombinedSimpleModel, ISimpleFilterModelType, Tuple } from '../iSimpleFilter';
import { RangeFilter, _getRangeValidityMessageKey } from '../rangeFilter';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';
import { DEFAULT_NUMBER_FILTER_OPTIONS } from './numberFilterConstants';
import { mapValuesFromNumberFilterModel, processNumberFilterValue } from './numberFilterUtils';

/** temporary type until `NumberFilterParams` is updated as breaking change */
type NumberFilterDisplayParams = INumberFilterParams &
    FilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>>;

type NumberFilterField = GridInputTextField | GridInputNumberField;

export class NumberFilter extends RangeFilter<
    NumberFilterModel,
    number,
    number,
    NumberFilterField,
    NumberFilterDisplayParams
> {
    public readonly filterType = 'number' as const;

    constructor() {
        super('numberFilter', mapValuesFromNumberFilterModel, DEFAULT_NUMBER_FILTER_OPTIONS);
    }

    protected createInputField(allowedCharPattern: string | null): NumberFilterField {
        return allowedCharPattern ? new AgInputTextField({ allowedCharPattern }) : new AgInputNumberField();
    }

    protected createModel(type: ISimpleFilterModelType | null): NumberFilterModel {
        return { filterType: this.filterType, type };
    }

    protected toModelValue(value: number | null): number | null {
        return value;
    }

    protected refreshInputPairValidation(from: NumberFilterField, to: NumberFilterField, isFrom = false): void {
        const parser = this.params.numberParser;
        const fromValue = getNormalisedValue(parser, from);
        const toValue = getNormalisedValue(parser, to);
        const localeKey = _getRangeValidityMessageKey(fromValue, toValue, isFrom);
        const validityMessage = localeKey ? this.translate(localeKey, [String(isFrom ? toValue : fromValue)]) : '';
        (isFrom ? from : to).setCustomValidity(validityMessage); // Set validity error state for target input
        (isFrom ? to : from).setCustomValidity(''); // Reset validity error state for other input
        if (validityMessage.length > 0) {
            this.beans.ariaAnnounce.announceValue(validityMessage, 'dateFilter');
        }
    }

    protected override setElementValue(
        element: NumberFilterField,
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

    protected getValues(position: number): Tuple<number> {
        const result: Tuple<number> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(processNumberFilterValue(stringToFloat(this.params.numberParser, element.getValue())));
            }
        });

        return result;
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

    if (filterText?.trim() === '') {
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
