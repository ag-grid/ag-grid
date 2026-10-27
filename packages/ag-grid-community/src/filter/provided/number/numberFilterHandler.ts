import type { Column } from '../../../interfaces/iColumn';
import type { Comparator } from '../iScalarFilter';
import type { OptionsFactory } from '../optionsFactory';
import { ScalarFilterHandler } from '../scalarFilterHandler';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';
import { DEFAULT_NUMBER_FILTER_OPTIONS } from './numberFilterConstants';
import { NumberFilterModelFormatter } from './numberFilterModelFormatter';
import { mapValuesFromNumberFilterModel } from './numberFilterUtils';

export class NumberFilterHandler extends ScalarFilterHandler<NumberFilterModel, number, INumberFilterParams> {
    public readonly filterType = 'number' as const;
    constructor() {
        super(mapValuesFromNumberFilterModel, DEFAULT_NUMBER_FILTER_OPTIONS);
    }

    protected createModelFormatter(
        optionsFactory: OptionsFactory,
        filterParams: INumberFilterParams,
        column: Column
    ): NumberFilterModelFormatter {
        return new NumberFilterModelFormatter(optionsFactory, filterParams, column);
    }

    protected override comparator(): Comparator<number> {
        return (left: number, right: number): number => {
            if (left === right) {
                return 0;
            }

            return left < right ? 1 : -1;
        };
    }

    protected override isValid(value: number): boolean {
        return !Number.isNaN(Number(value));
    }

    protected override toOwnModelValue(value: unknown): number | null {
        if (typeof value !== 'string') {
            return typeof value === 'number' && Number.isFinite(value) ? value : null;
        }
        // BigInt and Text Filter models hold numbers as text: plain decimal only, and only when no digit is lost.
        const text = value.trim();
        const number = DECIMAL_TEXT.test(text) ? Number(text) : Number.NaN;
        if (!Number.isFinite(number)) {
            return null;
        }
        // Read back at the text's own precision; a zero has no digits, and `toPrecision` takes at most 100.
        const digits = mantissaDigits(text);
        const isExact =
            digits === '' || (digits.length <= 100 && mantissaDigits(number.toPrecision(digits.length)) === digits);
        return isExact ? number : null;
    }
}

const DECIMAL_TEXT = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

/** A decimal's mantissa digits from the first non-zero one: `'-017.50'` gives `'1750'`. */
const mantissaDigits = (decimal: string): string => decimal.replace(/e.*/i, '').replace(/\D/g, '').replace(/^0+/, '');
