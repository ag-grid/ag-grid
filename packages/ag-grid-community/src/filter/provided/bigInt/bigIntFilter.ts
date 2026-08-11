import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { ICombinedSimpleModel } from '../iSimpleFilter';
import { getStrictRangeValidityMessageKey } from '../simpleFilterUtils';
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
        const { from, to } = this.getConditionInputs(position);
        const fromValue = this.readValue(from);
        const toValue = this.readValue(to);
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
            const localeKey = getStrictRangeValidityMessageKey(fromValue, toValue, isFrom);
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

    protected override getValueFormatter(): ((value: bigint | null) => string | null) | undefined {
        return this.params.bigintFormatter;
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

    protected override parseText(
        text: string | null | undefined,
        params: BigIntFilterDisplayParams | undefined
    ): bigint | null {
        return stringToBigInt(params?.bigintParser, text);
    }

    protected override createInputElement(fromTo: 'from' | 'to'): GridInputTextField {
        const allowedCharPattern = this.allowedCharPattern;
        const eValue = this.createManagedBean<GridInputTextField>(
            new AgInputTextField(allowedCharPattern ? { allowedCharPattern } : undefined)
        );
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        return eValue;
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

    private isInvalidValue(element: GridInputTextField, parsedValue: bigint | null): boolean {
        const rawValue = element.getValue();
        return rawValue != null && String(rawValue).trim() !== '' && parsedValue === null;
    }
}
