import { _parseBigIntOrNull } from 'ag-stack';

import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { ICombinedSimpleModel, ISimpleFilterModelType, Tuple } from '../iSimpleFilter';
import { RangeFilter, _getRangeValidityMessageKey } from '../rangeFilter';
import { DEFAULT_BIGINT_FILTER_OPTIONS } from './bigIntFilterConstants';
import { mapValuesFromBigIntFilterModel } from './bigIntFilterUtils';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

/** temporary type until `BigIntFilterParams` is updated as breaking change */
type BigIntFilterDisplayParams = IBigIntFilterParams &
    FilterDisplayParams<any, any, BigIntFilterModel | ICombinedSimpleModel<BigIntFilterModel>>;

export class BigIntFilter extends RangeFilter<
    BigIntFilterModel,
    string,
    bigint,
    GridInputTextField,
    BigIntFilterDisplayParams
> {
    public readonly filterType = 'bigint' as const;

    constructor() {
        super('bigintFilter', mapValuesFromBigIntFilterModel, DEFAULT_BIGINT_FILTER_OPTIONS);
    }

    protected createInputField(allowedCharPattern: string | null): GridInputTextField {
        return allowedCharPattern ? new AgInputTextField({ allowedCharPattern }) : new AgInputTextField();
    }

    protected createModel(type: ISimpleFilterModelType | null): BigIntFilterModel {
        return { filterType: this.filterType, type };
    }

    protected toModelValue(value: bigint | null): string {
        return String(value);
    }

    protected refreshInputPairValidation(from: GridInputTextField, to: GridInputTextField, isFrom = false): void {
        const { bigintParser } = this.params;
        const fromValue = this.getParsedValue(from, bigintParser);
        const toValue = this.getParsedValue(to, bigintParser);
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
            const localeKey = _getRangeValidityMessageKey(fromValue, toValue, isFrom);
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

    protected override setElementValue(
        element: GridInputTextField,
        value: bigint | null,
        fromFloatingFilter?: boolean
    ): void {
        super.setElementValue(element, value as any, fromFloatingFilter);
        if (value === null) {
            element.setCustomValidity('');
        }
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

    private getParsedValue(
        element: GridInputTextField,
        bigintParser: IBigIntFilterParams['bigintParser']
    ): bigint | null {
        const rawValue = element.getValue();
        if (rawValue == null || (typeof rawValue === 'string' && rawValue.trim() === '')) {
            return null;
        }
        return bigintParser ? bigintParser(rawValue) : _parseBigIntOrNull(rawValue);
    }

    private isInvalidValue(element: GridInputTextField, parsedValue: bigint | null): boolean {
        const rawValue = element.getValue();
        return rawValue != null && String(rawValue).trim() !== '' && parsedValue === null;
    }
}
