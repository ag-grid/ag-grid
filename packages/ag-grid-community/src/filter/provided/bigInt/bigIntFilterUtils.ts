import { _parseBigIntOrNull } from 'ag-stack';

import type { GridOptionsService } from '../../../gridOptionsService';
import type { Column } from '../../../interfaces/iColumn';
import type { Tuple } from '../iSimpleFilter';
import type { ResolvedSimpleFilterConfig } from '../resolvedFilterConfig';
import { filterCallbackParams } from '../simpleFilterUtils';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

export function getAllowedCharPattern(filterParams?: IBigIntFilterParams): string | null {
    return filterParams?.allowedCharPattern ?? null;
}

/** The one reading of a typed value: `bigintParser` owns it wherever it is configured. */
export function stringToBigInt(
    bigintParser: IBigIntFilterParams['bigintParser'],
    value: string | null | undefined,
    gos: GridOptionsService,
    column: Column
): bigint | null {
    if (value == null || value.trim() === '') {
        return null;
    }
    // Built here, not by the caller: the default configuration has no parser to hand them to.
    return bigintParser ? bigintParser(value, filterCallbackParams(gos, column)) : _parseBigIntOrNull(value);
}

export function mapValuesFromBigIntFilterModel(
    filterModel: BigIntFilterModel | null,
    filterConfig: ResolvedSimpleFilterConfig
): Tuple<bigint> {
    const { filter, filterTo, type } = filterModel || {};
    return [_parseBigIntOrNull(filter), _parseBigIntOrNull(filterTo)].slice(0, filterConfig.numberOfInputs(type));
}
