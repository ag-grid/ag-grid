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
        // BigInt and Text Filter models hold numbers as text: plain decimal only, integers only in the safe range.
        const text = value.trim();
        const number = DECIMAL_TEXT.test(text) ? Number(text) : Number.NaN;
        return Number.isSafeInteger(number) || (Number.isFinite(number) && !Number.isInteger(number)) ? number : null;
    }
}

const DECIMAL_TEXT = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
