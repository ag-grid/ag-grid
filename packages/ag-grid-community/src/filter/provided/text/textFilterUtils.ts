import type { Tuple } from '../iSimpleFilter';
import type { ResolvedSimpleFilterConfig } from '../resolvedFilterConfig';
import type { TextFilterModel } from './iTextFilter';

export function trimInputForFilter(value?: string | null): string | null | undefined {
    const trimmedInput = value?.trim();

    // trim the input, unless it is all whitespace (this is consistent with Excel behaviour)
    return trimmedInput === '' ? value : trimmedInput;
}

export function mapValuesFromTextFilterModel(
    filterModel: TextFilterModel | null,
    filterConfig: ResolvedSimpleFilterConfig
): Tuple<string> {
    const { filter, filterTo, type } = filterModel || {};
    return [filter || null, filterTo || null].slice(0, filterConfig.numberOfInputs(type));
}
