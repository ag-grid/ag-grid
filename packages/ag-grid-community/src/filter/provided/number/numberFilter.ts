import { AgInputNumberField } from '../../../agWidgets/agInputNumberField';
import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { ICombinedSimpleModel } from '../iSimpleFilter';
import { getStrictRangeValidityMessageKey } from '../simpleFilterUtils';
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

export class NumberFilter extends TextInputSimpleFilter<
    NumberFilterModel,
    number,
    GridInputTextField | GridInputNumberField,
    NumberFilterDisplayParams
> {
    /** A `numberFormatter` writes text a number input would drop, so its column gets a text one instead. */
    private usesTextInput: boolean;

    public readonly filterType = 'number' as const;

    constructor() {
        super('numberFilter', mapValuesFromNumberFilterModel, DEFAULT_NUMBER_FILTER_OPTIONS);
    }

    protected override defaultDebounceMs = 500;

    protected override commonUpdateSimpleParams(params: NumberFilterDisplayParams): void {
        super.commonUpdateSimpleParams(params);

        const previous = this.renderedWith;
        this.renderedWith = params;
        const allowedCharPattern = getAllowedCharPattern(params);
        const isTextInput = usesTextInput(params);
        // Both are read once when an input is built, and decide its element type between them.
        const rebuild = allowedCharPattern !== this.allowedCharPattern || isTextInput !== this.usesTextInput;
        this.allowedCharPattern = allowedCharPattern;
        this.usesTextInput = isTextInput;
        // What an input shows is rendered through these, so its text stops being readable when they change.
        const rerender =
            rebuild ||
            params.numberParser !== previous?.numberParser ||
            params.numberFormatter !== previous?.numberFormatter;
        if (rerender) {
            this.refreshInputElements(rebuild, previous);
        }
    }

    protected override parseText(
        text: string | null | undefined,
        params: NumberFilterDisplayParams | undefined
    ): number | null {
        return processNumberFilterValue(stringToFloat(params?.numberParser, text));
    }

    protected override getValueFormatter(): ((value: number | null) => string | null) | undefined {
        return this.params.numberFormatter;
    }

    protected override refreshPositionValidation(position: number, isFrom = false): void {
        const from = this.eValuesFrom[position];
        const to = this.eValuesTo[position];
        const fromValue = this.readValue(from, true);
        const toValue = this.readValue(to, true);
        const localeKey = this.isRangeCondition(position)
            ? getStrictRangeValidityMessageKey(fromValue, toValue, isFrom)
            : null;
        const validityMessage = localeKey ? this.translate(localeKey, [String(isFrom ? toValue : fromValue)]) : '';
        (isFrom ? from : to).setCustomValidity(validityMessage); // Set validity error state for target input
        (isFrom ? to : from).setCustomValidity(''); // Reset validity error state for other input
        if (validityMessage.length > 0) {
            this.beans.ariaAnnounce.announceValue(validityMessage, 'filterValidation');
        }
    }

    protected override createInputElement(fromTo: 'from' | 'to'): GridInputTextField | GridInputNumberField {
        const allowedCharPattern = this.allowedCharPattern;
        const eValue = this.createManagedBean<GridInputTextField | GridInputNumberField>(
            this.usesTextInput
                ? new AgInputTextField(allowedCharPattern ? { allowedCharPattern } : undefined)
                : new AgInputNumberField()
        );
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        return eValue;
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
