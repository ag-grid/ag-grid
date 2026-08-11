import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { TextFilterModel } from './iTextFilter';

/**
 * What each built-in text option means, given the formatted cell value and the formatted filter text. One
 * definition, evaluated by the column filter's matcher and the Advanced Filter's operators alike, so an
 * option cannot mean two things. Reached by static property, never by key: this runs per row.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _TEXT_FILTER_PREDICATES = {
    contains: (value: string, filterText: string): boolean => value.includes(filterText),
    notContains: (value: string, filterText: string): boolean => !value.includes(filterText),
    equals: (value: string, filterText: string): boolean => value === filterText,
    // Loose, as it has always been: a `textFormatter` can leave a non-string on either side.
    notEqual: (value: string, filterText: string): boolean => value != filterText,
    startsWith: (value: string, filterText: string): boolean => value.startsWith(filterText),
    endsWith: (value: string, filterText: string): boolean => value.endsWith(filterText),
} as const;

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
