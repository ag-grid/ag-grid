import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { TextFilterModel } from './iTextFilter';

export function trimInputForFilter(value?: string | null): string | null | undefined {
    const trimmedInput = value?.trim();

    // trim the input, unless it is all whitespace (this is consistent with Excel behaviour)
    return trimmedInput === '' ? value : trimmedInput;
}

export function mapValuesFromTextFilterModel(
    filterModel: TextFilterModel | null,
    optionsFactory: OptionsFactory
): Tuple<string> {
    const { filter, filterTo, type } = filterModel || {};
    return [filter || null, filterTo || null].slice(0, getNumberOfInputs(type, optionsFactory));
}
