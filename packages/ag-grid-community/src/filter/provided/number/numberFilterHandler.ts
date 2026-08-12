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
        filterParams: INumberFilterParams
    ): NumberFilterModelFormatter {
        return new NumberFilterModelFormatter(optionsFactory, filterParams);
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
        return !isNaN(value);
    }
}
