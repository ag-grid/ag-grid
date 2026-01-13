import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

export function getAllowedCharPattern(filterParams?: IBigIntFilterParams): string | null {
    return filterParams?.allowedCharPattern ?? null;
}

export function processBigIntFilterValue(value?: bigint | null): bigint | null {
    return value == null ? null : value;
}

export function mapValuesFromBigIntFilterModel(
    filterModel: BigIntFilterModel | null,
    optionsFactory: OptionsFactory
): Tuple<bigint> {
    const { filter, filterTo, type } = filterModel || {};
    return [processBigIntFilterValue(filter), processBigIntFilterValue(filterTo)].slice(
        0,
        getNumberOfInputs(type, optionsFactory)
    );
}
