import { AgInputNumberField } from '../../../agWidgets/agInputNumberField';
import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { FilterLocaleTextKey } from '../../filterLocaleText';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
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

    protected override readPreviousText(
        text: string | null | undefined,
        previous: NumberFilterDisplayParams | undefined
    ): number | null {
        return processNumberFilterValue(stringToFloat(previous?.numberParser, text));
    }

    protected override refreshPositionValidation(position: number, isFrom = false): void {
        const from = this.eValuesFrom[position];
        const to = this.eValuesTo[position];
        const fromValue = this.readValue(from, true);
        const toValue = this.readValue(to, true);
        const localeKey = this.isRangeCondition(position) ? getValidityMessageKey(fromValue, toValue, isFrom) : null;
        const validityMessage = localeKey ? this.translate(localeKey, [String(isFrom ? toValue : fromValue)]) : '';
        (isFrom ? from : to).setCustomValidity(validityMessage); // Set validity error state for target input
        (isFrom ? to : from).setCustomValidity(''); // Reset validity error state for other input
        if (validityMessage.length > 0) {
            this.beans.ariaAnnounce.announceValue(validityMessage, 'filterValidation');
        }
    }

    protected override setElementValue(
        element: GridInputTextField | GridInputNumberField,
        value: number | null,
        fromFloatingFilter?: boolean
    ): void {
        // values from floating filter are directly from the input, not from the model
        const numberFormatter = this.params.numberFormatter;
        const valueToSet = !fromFloatingFilter && numberFormatter ? numberFormatter(value ?? null) : value;
        super.setElementValue(element, valueToSet as any);
        this.trackRenderedValue(element, value, fromFloatingFilter);
        if (valueToSet === null) {
            element.setCustomValidity('');
        }
    }

    /** The value an input holds: the one it was rendered with, until the user makes the text their own. */
    private readValue(element: GridInputTextField | GridInputNumberField, ignoreValidity?: boolean): number | null {
        const rendered = this.getRenderedValue(element);
        if (rendered) {
            return rendered.value;
        }
        return processNumberFilterValue(stringToFloat(this.params.numberParser, element.getValue(ignoreValidity)));
    }

    protected override createInputElement(fromTo: string): GridInputTextField | GridInputNumberField {
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

    protected getValues(position: number): Tuple<number> {
        const result: Tuple<number> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(this.readValue(element));
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
