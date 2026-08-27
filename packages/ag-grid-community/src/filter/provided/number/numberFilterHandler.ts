import type { Comparator } from '../iScalarFilter';
import type { ResolvedSimpleFilterConfig } from '../resolvedFilterConfig';
import { ScalarFilterHandler } from '../scalarFilterHandler';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';
import { NumberFilterModelFormatter } from './numberFilterModelFormatter';
import { mapValuesFromNumberFilterModel } from './numberFilterUtils';

export class NumberFilterHandler extends ScalarFilterHandler<NumberFilterModel, number, INumberFilterParams> {
    public readonly filterType = 'number' as const;
    constructor() {
        super(mapValuesFromNumberFilterModel);
    }

    protected createModelFormatter(
        filterConfig: ResolvedSimpleFilterConfig,
        filterParams: INumberFilterParams
    ): NumberFilterModelFormatter {
        return new NumberFilterModelFormatter(filterConfig, filterParams);
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
