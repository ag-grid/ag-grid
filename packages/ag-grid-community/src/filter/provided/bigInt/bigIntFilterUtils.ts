import { _parseBigIntOrNull } from 'ag-stack';

import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

export function getAllowedCharPattern(filterParams?: IBigIntFilterParams): string | null {
    return filterParams?.allowedCharPattern ?? null;
}

/** The one reading of a typed value: `bigintParser` owns it wherever it is configured. */
export function stringToBigInt(
    bigintParser: IBigIntFilterParams['bigintParser'],
    value?: string | null
): bigint | null {
    if (value == null || value.trim() === '') {
        return null;
    }
    return bigintParser ? bigintParser(value) : _parseBigIntOrNull(value);
}

export function mapValuesFromBigIntFilterModel(
    filterModel: BigIntFilterModel | null,
    optionsFactory: OptionsFactory
): Tuple<bigint> {
    const { filter, filterTo, type } = filterModel || {};
    return [_parseBigIntOrNull(filter), _parseBigIntOrNull(filterTo)].slice(0, getNumberOfInputs(type, optionsFactory));
}
