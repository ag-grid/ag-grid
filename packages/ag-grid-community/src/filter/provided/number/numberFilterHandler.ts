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
        const digits = mantissaDigits(text);
        const isExact =
            digits === '' ||
            (digits.length <= 100 && mantissaDigits(number.toPrecision(digits.length), false) === digits);
        return isExact ? number : null;
    }
}

const DECIMAL_TEXT = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

/** Reads mantissa digits, keeping toPrecision's padding when trimFractionalZeros is false. */
const mantissaDigits = (decimal: string, trimFractionalZeros = true): string => {
    const mantissa = decimal.replace(/e.*/i, '');
    let end = mantissa.length;
    if (trimFractionalZeros && mantissa.includes('.')) {
        while (mantissa[end - 1] === '0') {
            end--;
        }
    }
    return mantissa.slice(0, end).replace(/\D/g, '').replace(/^0+/, '');
};
