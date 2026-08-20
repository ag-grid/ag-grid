import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { ICombinedSimpleModel } from '../iSimpleFilter';
import { getValidityMessageKey } from '../simpleFilterUtils';
import type { RenderChange } from '../textInputSimpleFilter';
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

    protected override getRenderChange(
        params: BigIntFilterDisplayParams,
        previous: BigIntFilterDisplayParams | undefined
    ): RenderChange | undefined {
        // Read once when an input is built, so only replacing the element can change it.
        if (getAllowedCharPattern(params) !== getAllowedCharPattern(previous)) {
            return 'rebuild';
        }
        // What an input shows is rendered through these, so its text stops being readable when they change.
        if (params.bigintParser !== previous?.bigintParser || params.bigintFormatter !== previous?.bigintFormatter) {
            return 'rerender';
        }
        return undefined;
    }

    protected override parseText(
        text: string | null | undefined,
        params: BigIntFilterDisplayParams | undefined
    ): bigint | null {
        return stringToBigInt(params?.bigintParser, text);
    }

    protected override getValueFormatter(): ((value: bigint | null) => string | null) | undefined {
        return this.params.bigintFormatter;
    }

    protected override createInputWidget(): GridInputTextField {
        return this.createTextInput(getAllowedCharPattern(this.params));
    }

    protected override refreshInputPairValidation(
        from: GridInputTextField,
        to: GridInputTextField,
        isFrom = false
    ): void {
        const fromValue = this.readValue(from, true);
        const toValue = this.readValue(to, true);
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
