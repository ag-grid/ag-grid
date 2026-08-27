import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { ICombinedSimpleModel } from '../iSimpleFilter';
import { _bindFilterCallback, getValidityMessageKey } from '../simpleFilterUtils';
import type { RenderChange } from '../textInputSimpleFilter';
import { TextInputSimpleFilter } from '../textInputSimpleFilter';
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
        super('bigintFilter', mapValuesFromBigIntFilterModel);
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
        return stringToBigInt(params?.bigintParser, text, this.gos, this.params.column);
    }

    protected override getValueFormatter(): ((value: bigint | null) => string | null) | undefined {
        return _bindFilterCallback(this.params.bigintFormatter, this.gos, this.params.column);
    }

    protected override createInputWidget(): GridInputTextField {
        return this.createTextInput();
    }

    protected override refreshInputPairValidation(
        from: GridInputTextField,
        to: GridInputTextField,
        isFrom: boolean,
        numberOfInputs: number
    ): void {
        // Past the condition's arity an input is mounted but unused, so reading it parses what nothing uses.
        const isRange = numberOfInputs >= 2;
        const fromValue = numberOfInputs > 0 ? this.readValue(from, true) : null;
        const toValue = isRange ? this.readValue(to, true) : null;
        const fromInvalid = numberOfInputs > 0 && this.isInvalidValue(from, fromValue);
        const toInvalid = isRange && this.isInvalidValue(to, toValue);

        // Ordered by the edited input, except that a one-value option filters on `from` alone.
        const targetIsFrom = isFrom || !isRange;
        const target = targetIsFrom ? from : to;
        const other = targetIsFrom ? to : from;
        const targetInvalid = targetIsFrom ? fromInvalid : toInvalid;
        const otherInvalid = targetIsFrom ? toInvalid : fromInvalid;

        let validityMessage = '';
        if (targetInvalid) {
            validityMessage = this.getLocaleTextFunc()('invalidBigInt', 'Invalid BigInt');
        } else if (isRange && !otherInvalid) {
            const localeKey = getValidityMessageKey(fromValue, toValue, isFrom, this.params.inRangeInclusive);
            if (localeKey) {
                validityMessage = this.translate(localeKey, [String(other.getValue())]);
            }
        }

        target.setCustomValidity(validityMessage);
        if (!otherInvalid) {
            other.setCustomValidity('');
        }
        if (validityMessage.length > 0) {
            this.beans.ariaAnnounce.announceValue(validityMessage, 'filterValidation');
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
