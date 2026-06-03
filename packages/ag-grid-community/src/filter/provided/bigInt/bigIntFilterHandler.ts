import { _parseBigIntOrNull } from 'ag-stack';

import type { Comparator } from '../iScalarFilter';
import { ScalarFilterHandler } from '../scalarFilterHandler';
import { DEFAULT_BIGINT_FILTER_OPTIONS } from './bigIntFilterConstants';
import { BigIntFilterModelFormatter } from './bigIntFilterModelFormatter';
import { mapValuesFromBigIntFilterModel } from './bigIntFilterUtils';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

export class BigIntFilterHandler extends ScalarFilterHandler<BigIntFilterModel, bigint, IBigIntFilterParams> {
    public readonly filterType = 'bigint' as const;
    protected readonly FilterModelFormatterClass = BigIntFilterModelFormatter;

    constructor() {
        super(mapValuesFromBigIntFilterModel, DEFAULT_BIGINT_FILTER_OPTIONS);
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
