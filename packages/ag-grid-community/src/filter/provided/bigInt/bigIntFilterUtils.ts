import { _parseBigIntOrNull } from 'ag-stack';

import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

export function getAllowedCharPattern(filterParams?: IBigIntFilterParams): string | null {
    return filterParams?.allowedCharPattern ?? null;
}

export function mapValuesFromBigIntFilterModel(
    filterModel: BigIntFilterModel | null,
    optionsFactory: OptionsFactory
): Tuple<bigint> {
    const { filter, filterTo, type } = filterModel || {};
    return [_parseBigIntOrNull(filter), _parseBigIntOrNull(filterTo)].slice(0, getNumberOfInputs(type, optionsFactory));
}
