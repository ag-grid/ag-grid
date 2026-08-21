import { _parseBigIntOrNull } from 'ag-stack';

import type { Column } from '../../../interfaces/iColumn';
import type { Comparator } from '../iScalarFilter';
import type { OptionsFactory } from '../optionsFactory';
import { ScalarFilterHandler } from '../scalarFilterHandler';
import { DEFAULT_BIGINT_FILTER_OPTIONS } from './bigIntFilterConstants';
import { BigIntFilterModelFormatter } from './bigIntFilterModelFormatter';
import { mapValuesFromBigIntFilterModel } from './bigIntFilterUtils';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

export class BigIntFilterHandler extends ScalarFilterHandler<BigIntFilterModel, bigint, IBigIntFilterParams> {
    public readonly filterType = 'bigint' as const;
    constructor() {
        super(mapValuesFromBigIntFilterModel, DEFAULT_BIGINT_FILTER_OPTIONS);
    }

    protected createModelFormatter(
        optionsFactory: OptionsFactory,
        filterParams: IBigIntFilterParams,
        column: Column
    ): BigIntFilterModelFormatter {
        return new BigIntFilterModelFormatter(optionsFactory, filterParams, column);
    }

    protected override comparator(): Comparator<bigint> {
        return (left: bigint, right: bigint): number => {
            if (left === right) {
                return 0;
            }

            return left < right ? 1 : -1;
        };
    }

    protected override isValid(value: bigint): boolean {
        return _parseBigIntOrNull(value) !== null;
    }
}
