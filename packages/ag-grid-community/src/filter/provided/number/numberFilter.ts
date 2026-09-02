import { AgInputNumberField } from '../../../agWidgets/agInputNumberField';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { ICombinedSimpleModel } from '../iSimpleFilter';
import { _bindFilterCallback, getValidityMessageKey } from '../simpleFilterUtils';
import type { RenderChange } from '../textInputSimpleFilter';
import { TextInputSimpleFilter } from '../textInputSimpleFilter';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';
import { DEFAULT_NUMBER_FILTER_OPTIONS } from './numberFilterConstants';
import {
    getAllowedCharPattern,
    mapValuesFromNumberFilterModel,
    processNumberFilterValue,
    stringToFloat,
    usesTextInput,
} from './numberFilterUtils';

/** temporary type until `NumberFilterParams` is updated as breaking change */
type NumberFilterDisplayParams = INumberFilterParams &
    FilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>>;

type NumberInput = GridInputTextField | GridInputNumberField;

export class NumberFilter extends TextInputSimpleFilter<
    NumberFilterModel,
    number,
    NumberInput,
    NumberFilterDisplayParams
> {
    public readonly filterType = 'number' as const;

    constructor() {
        super('numberFilter', mapValuesFromNumberFilterModel, DEFAULT_NUMBER_FILTER_OPTIONS);
    }

    protected override getRenderChange(
        params: NumberFilterDisplayParams,
        previous: NumberFilterDisplayParams | undefined
    ): RenderChange | undefined {
        // The element type and its pattern are fixed at build time, so only a replacement can change them.
        if (
            usesTextInput(params) !== usesTextInput(previous) ||
            getAllowedCharPattern(params) !== getAllowedCharPattern(previous)
        ) {
            return 'rebuild';
        }
        // What an input shows is rendered through these, so its text stops being readable when they change.
        if (params.numberParser !== previous?.numberParser || params.numberFormatter !== previous?.numberFormatter) {
            return 'rerender';
        }
        return undefined;
    }

    protected override parseText(
        text: string | null | undefined,
        params: NumberFilterDisplayParams | undefined
    ): number | null {
        return processNumberFilterValue(stringToFloat(params?.numberParser, text, this.gos, this.params.column));
    }

    protected override getValueFormatter(): ((value: number | null) => string | null) | undefined {
        return _bindFilterCallback(this.params.numberFormatter, this.gos, this.params.column);
    }

    protected override createInputWidget(): NumberInput {
        const params = this.params;
        if (usesTextInput(params)) {
            return this.createTextInput();
        }
        return this.createBean(
            new AgInputNumberField({
                clearButton: true,
                searchIcon: true,
                autoComplete: params.browserAutoComplete,
            })
        );
    }

    protected override refreshInputPairValidation(
        from: NumberInput,
        to: NumberInput,
        isFrom: boolean,
        numberOfInputs: number
    ): void {
        // Only a two-value option has an order to be out of, and reading a value runs the column's own parser.
        let validityMessage = '';
        if (numberOfInputs >= 2) {
            const fromValue = this.readValue(from, true);
            const toValue = this.readValue(to, true);
            const localeKey = getValidityMessageKey(fromValue, toValue, isFrom, this.params.inRangeInclusive);
            validityMessage = localeKey ? this.translate(localeKey, [String(isFrom ? toValue : fromValue)]) : '';
        }
        (isFrom ? from : to).setCustomValidity(validityMessage); // Set validity error state for target input
        (isFrom ? to : from).setCustomValidity(''); // Reset validity error state for other input
        if (validityMessage.length > 0) {
            this.beans.ariaAnnounce.announceValue(validityMessage, 'filterValidation');
        }
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
}
