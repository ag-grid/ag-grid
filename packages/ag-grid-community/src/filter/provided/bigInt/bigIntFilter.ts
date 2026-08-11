import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { FilterLocaleTextKey } from '../../filterLocaleText';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { TextInputSimpleFilter } from '../textInputSimpleFilter';
import { DEFAULT_BIGINT_FILTER_OPTIONS } from './bigIntFilterConstants';
import { getAllowedCharPattern, mapValuesFromBigIntFilterModel, stringToBigInt } from './bigIntFilterUtils';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

/** temporary type until `BigIntFilterParams` is updated as breaking change */
type BigIntFilterDisplayParams = IBigIntFilterParams &
    FilterDisplayParams<any, any, BigIntFilterModel | ICombinedSimpleModel<BigIntFilterModel>>;

export class BigIntFilter extends TextInputSimpleFilter<
    BigIntFilterModel,
    bigint,
    GridInputTextField,
    BigIntFilterDisplayParams
> {
    public readonly filterType = 'bigint' as const;

    constructor() {
        super('bigintFilter', mapValuesFromBigIntFilterModel, DEFAULT_BIGINT_FILTER_OPTIONS);
    }

    protected override defaultDebounceMs = 500;

    protected override refreshPositionValidation(position: number, isFrom = false): void {
        const from = this.eValuesFrom[position];
        const to = this.eValuesTo[position];
        const { bigintParser } = this.params;
        const fromValue = this.getParsedValue(from, bigintParser);
        const toValue = this.getParsedValue(to, bigintParser);
        const fromInvalid = this.isInvalidValue(from, fromValue);
        const toInvalid = this.isInvalidValue(to, toValue);

        const target = isFrom ? from : to;
        const other = isFrom ? to : from;
        const otherInvalid = isFrom ? toInvalid : fromInvalid;

        // A value the parser rejected is reported as such; only a readable pair can be reported as out of order.
        let validityMessage = '';
        if (isFrom ? fromInvalid : toInvalid) {
            validityMessage = this.getLocaleTextFunc()('invalidBigInt', 'Invalid BigInt');
        } else if (!fromInvalid && !toInvalid && this.isRangeCondition(position)) {
            const localeKey = getValidityMessageKey(fromValue, toValue, isFrom);
            validityMessage = localeKey ? this.translate(localeKey, [String(other.getValue())]) : '';
        }

        target.setCustomValidity(validityMessage);
        if (!otherInvalid) {
            other.setCustomValidity('');
        }
        if (validityMessage.length > 0) {
            this.beans.ariaAnnounce.announceValue(validityMessage, 'filterValidation');
        }
    }

    protected override setElementValue(
        element: GridInputTextField,
        value: bigint | null,
        fromFloatingFilter?: boolean
    ): void {
        // values from floating filter are directly from the input, not from the model
        const bigintFormatter = this.params.bigintFormatter;
        const valueToSet = !fromFloatingFilter && bigintFormatter ? bigintFormatter(value ?? null) : value;
        super.setElementValue(element, valueToSet as any, fromFloatingFilter);
        this.trackRenderedValue(element, value, fromFloatingFilter);
        if (valueToSet === null) {
            element.setCustomValidity('');
        }
    }

    protected override commonUpdateSimpleParams(params: BigIntFilterDisplayParams): void {
        super.commonUpdateSimpleParams(params);

        const previous = this.renderedWith;
        this.renderedWith = params;
        const allowedCharPattern = getAllowedCharPattern(params);
        const rebuild = allowedCharPattern !== this.allowedCharPattern;
        this.allowedCharPattern = allowedCharPattern;
        // What an input shows is rendered through these, so its text stops being readable when they change.
        const rerender =
            rebuild ||
            params.bigintParser !== previous?.bigintParser ||
            params.bigintFormatter !== previous?.bigintFormatter;
        if (rerender) {
            this.refreshInputElements(rebuild, previous);
        }
    }

    protected override readPreviousText(
        text: string | null | undefined,
        previous: BigIntFilterDisplayParams | undefined
    ): bigint | null {
        return stringToBigInt(previous?.bigintParser, text);
    }

    protected override createInputElement(fromTo: string): GridInputTextField {
        const allowedCharPattern = this.allowedCharPattern;
        const eValue = this.createManagedBean<GridInputTextField>(
            new AgInputTextField(allowedCharPattern ? { allowedCharPattern } : undefined)
        );
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        return eValue;
    }

    protected getValues(position: number): Tuple<bigint> {
        const { bigintParser } = this.params;
        const result: Tuple<bigint> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(this.getParsedValue(element, bigintParser));
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

    /** The value an input holds: the one it was rendered with, until the user makes the text their own. */
    private getParsedValue(
        element: GridInputTextField,
        bigintParser: IBigIntFilterParams['bigintParser']
    ): bigint | null {
        const rendered = this.getRenderedValue(element);
        if (rendered) {
            return rendered.value;
        }
        return stringToBigInt(bigintParser, element.getValue());
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
