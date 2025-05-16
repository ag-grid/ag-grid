import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';

export function getAllowedCharPattern(filterParams?: INumberFilterParams): string | null {
    const { allowedCharPattern } = filterParams ?? {};

    return allowedCharPattern ?? null;
}

export function processNumberFilterValue(value?: number | null): number | null {
    if (value == null) {
        return null;
    }
    return isNaN(value) ? null : value;
}

export function mapValuesFromNumberFilterModel(
    filterModel: NumberFilterModel | null,
    optionsFactory: OptionsFactory
): Tuple<number> {
    const { filter, filterTo, type } = filterModel || {};
    return [processNumberFilterValue(filter), processNumberFilterValue(filterTo)].slice(
        0,
        getNumberOfInputs(type, optionsFactory)
    );
}
